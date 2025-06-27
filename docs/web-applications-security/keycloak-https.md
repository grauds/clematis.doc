---
sidebar_position: 2
tags:
  - mkcert
  - keycloak
  - nginx
---

# Switch to HTTPS 

It is better to have Keycloak HTTPS installed even in the internal network for various reasons, 
mostly for better understanding production challenges in the open environments. Also, even for PoC,
it would mean it is ready to be deployed in the cloud.

Keycloak has secure mode built-in, so it is possible to switch to it; or it is possible to 
install a proxy and let Keycloak know it is behind a proxy. The latter is more flexible in 
maintenance.

## Install Nginx In The Keycloak LXC

Given Keycloak LXC is running in the Proxmox environment, it is easy to install nginx from 
Debian repositories:

````bash
sudo apt install nginx
````
Nginx will be working with certificates, and here we also have a choice: either a 
self-signed certificate generated with OpenSSL or a certificate with 
locally trusted certificate authorities. For the latter, which is preferred,
[mkcert](https://github.com/FiloSottile/mkcert) tool is used.

## Generate Certificates 

Install ```mkcert``` tool via Debian package manager on the same VM with Proxmox and Nginx:

````bash
sudo apt install mkcert
````

Run the following commands to install a local certificate authority and to generate 
the certificate for Nginx (note, it is required to provide IP-address of the server):
````bash
mkcert -install
mkcert 192.168.1.157 keycloak.clematis
````

It will create two files with default names in the current directory, which should be copied 
to standard directories after that:

````bash
sudo cp 192.168.1.157+1.pem /etc/ssl/certs/
sudo cp 192.168.1.157+1-key.pem /etc/ssl/private/
````

## Configuring Nginx

Now it is time for Nginx configuration:

````bash
sudo nano /etc/nginx/sites-available/default
````

The valid and complete configuration is below:

````nginx configuration
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    return 301 https://$host$request_uri;
}

server {
    #
    # SSL configuration
    #
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;

    ssl_certificate /etc/ssl/certs/192.168.1.157+1.pem;
    ssl_certificate_key /etc/ssl/private/192.168.1.157+1-key.pem;

    location / {
            proxy_pass http://192.168.1.157:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarder-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            add_header Access-Control-Allow-Origin *;
    }

}
````
Nginx is using HTTP headers to communicate with Keycloak, and the next step is to 
tune Keycloak up to understand these headers.

## Configuring Keycloak

There is a good piece of [documentation on Keycloak configuration](https://www.keycloak.org/server/configuration),
I was following it to make this step.

:::info
Keycloak loads the configuration from four sources, which are listed here in order of application.
1. Command-line parameters
2. Environment variables
3. Options defined in the conf/keycloak.conf file or in a user-created configuration file.
4. Sensitive options defined in a user-created Java KeyStore file.
:::

For the LXC container it is easier to find the ```conf/keycloak.conf``` file:

````bash
sudo nano /opt/keycloak/conf/keycloak.conf
````

Add the following line to it:
````
proxy-headers=xforwarded
````

Restart Keycloak service:
````bash
sudo service keycloak restart
````

Keycloak re-compiles some parts of itself during startup, however unusual it may seem, so after
it is restarted, there will be a set of proxy-related lines in the configuration:

````bash
cd /opt/keycloak/bin
./kc.sh show-config

Current Mode: development
Current Configuration:
 # some lines are omitted for brevity
        kc.proxy-forwarded-host =  xforwarded (keycloak.conf)
        kc.proxy-allow-forwarded-header =  xforwarded (keycloak.conf)
        kc.proxy-trusted-header-enabled =  xforwarded (keycloak.conf)
        kc.proxy-headers =  xforwarded (keycloak.conf)
        kc.proxy-allow-x-forwarded-header =  xforwarded (keycloak.conf)
````

## How To Trust A Certificate

The goal is to have the Keycloak console loaded with a valid certificate:

 <img src={require('@site/static/img/valid_keycloak_certificate.png').default} width="730px"></img>

The procedure is different for various operating systems, for macOS it is as follows:

1. Safari uses the Keychain Access utility built into macOS to manage digital certificates. It may
not work as expected, there are several issues with adding certificates to the list of trusted ones.
2. It is better to use Chrome to open the certificate and export it from the browser, saving it
to the local drive. [More info](https://www.google.com/search?q=use+Chrome+to+open+the+certificate+and+export+it+from+the+browser%2C+saving+it+to+the+local+drive.&oq=use+Chrome+to+open+the+certificate+and+export+it+from+the+browser%2C+saving+it+to+the+local+drive.&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg70gEHNTY2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8).
3. The certificate file then can be opened with the Keychain Access utility and selecting 'Always Trust' option.

<img src={require('@site/static/img/trusting_certificate.png').default} width="630px"></img>

The good thing about locally trusted certificate authorities is that the browsers and 
other client components which are keen on security procedures make no difference between
certificates issued locally and production certificates from the official authorities. That
is why self-signed certificates are less convenient.