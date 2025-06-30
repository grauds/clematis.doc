---
sidebar_position: 4
tags:
  - angular
  - nginx
---

# Frontend Switch to HTTPS

Keycloak checks storage access during authentication to know if it is able to work with the local storage of the client's
browser. If the connection is not secured, development console will show a message ```Access to storage is not allowed from this context```.
There is also a definitive bias towards excluding non-secure connections from support in Keycloak, for example in the
following thread:
[enforce security on Keycloak users](https://github.com/keycloak/keycloak/discussions/32087).
Having said that, it is a good practice to enable HTTPS for the applications which use Keycloak even
if the server and the applications are on the local network.

### Generating A Certificate

To create a self-signed certificate for our local network using [OpenSSL](https://www.openssl.org)
and a private key in the ```nginx/ssl``` directory:

````bash
mkdir -p nginx/ssl
openssl req -x509 -newkey rsa:2048 \
    -keyout nginx/ssl/private.key \
    -out nginx/ssl/certificate.crt
````

:::info
* X.509 is a standard format for public key certificates. Each X.509 certificate includes a public key,
  identifying information, and a digital signature.
* -newkey rsa:2048: Generates a new private key using the RSA algorithm with a 2048-bit length
  :::

### Jenkins Configuration

Since the builds and deploys are handled by Jenkins, the ultimate destination for these files is the
internal [Jenkins storage for secret files](https://www.jenkins.io/doc/book/using/using-credentials/).
For example, the names can be: ```nginx-ssl-cert``` and ```nginx-ssl-key```.

### Adding SSL To Nginx in Openresty

Money Tracker Web Application is using [Openresty](https://openresty.org/en/) image for deployment;
this affects the paths needed to install certificates and configuration file.

The configuration file:

```nginx configuration title="/etc/nginx/conf.d/default.conf"
server {
    # Redirect HTTP to HTTPS
    listen 80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl default_server;
    server_name _;
    root /var/www/money-tracker-ui;

    # SSL configuration for OpenResty
    ssl_certificate /usr/local/openresty/nginx/ssl/certificate.crt;
    ssl_certificate_key /usr/local/openresty/nginx/ssl/private.key;

    # Recommended SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # SSL session settings
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;

    # Disabled caching so the browser won't cache the site.
    expires           0;
    add_header        Cache-Control private;

    location ~* ^/auth/(.*) {
        proxy_http_version 1.1;
        proxy_pass https://192.168.1.157:443/$1; # connection to Proxmox Keycloak to fix later
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }

    # API is still HTTP 
    location ~* ^/api/ {
        proxy_http_version 1.1;
        proxy_pass http://192.168.1.118:18085;
    }
   
    # ... 
 
    location / {
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```
As a result, Nginx expects to find a certificate in its local container path:

```
/usr/local/openresty/nginx/ssl
```

### Docker Compose Modification

The next step is to make sure the Docker container will get the files in the directory it expects.
One of the best approaches is to create a Docker volume and to copy the files from Jenkins
credentials storage there; then it should be mounted to the application container,
for example:

```
volumes:
    - ssl_certs:/usr/local/openresty/nginx/ssl:ro
```
The full example:

``` title="apps/money-tracker-ui/jenkins/docker-compose.yml"
services:
  money-tracker-ui:
    container_name: clematis-money-tracker-ui
    image: money.tracker.ui.uat:latest
    ports:
      - '18081:80'
      - '18443:443'
    volumes:
      - "/home/jenkins/workspace/Money Tracker UI Deployment/apps/money-tracker-ui/jenkins/nginx-default.conf:/etc/nginx/conf.d/default.conf"
      - ssl_certs:/usr/local/openresty/nginx/ssl:ro
    networks:
      - clematis
    restart: unless-stopped
    
```
:::info
Since Jenkins is running in a Docker container, the path for ```nginx-default.conf``` has to be given
relative to the host machine file system. The shortcut is to hardcode it, since it is immutable if
the name of the job is not changed.
:::


### Storing The Certificate In A Docker Volume

Now the Jenkins pipeline can be used to re/create the volume and to copy the certificate files to it:

``` title="Jenkinsfile"
pipeline {
    agent any
    environment {
      CERT_DIR = "${WORKSPACE}/docker/nginx/ssl"
    }
   
    stages {
    
        # The rest of the pipeline
    
        stage('Prepare Directories') {
            steps {
                sh '''
                   # Create directory structure with proper permissions
                    mkdir -p "${CERT_DIR}"
                    chmod 700 "${CERT_DIR}"
                    ls -al "${CERT_DIR}"
                '''
            }
        }
    
        stage('Deploy Certificates') {
        
            steps {
                script {
                     // Using secret files
                      withCredentials([
                         file(credentialsId: 'nginx-ssl-cert', variable: 'SSL_CERT'),
                         file(credentialsId: 'nginx-ssl-key', variable: 'SSL_KEY')
                      ]) {
                          sh """
                              # Copy certificates
                              cp "$SSL_CERT" "${CERT_DIR}/certificate.crt"
                              cp "$SSL_KEY" "${CERT_DIR}/private.key"
                    
                              # Set proper permissions
                              chmod 644 "${CERT_DIR}/certificate.crt"
                              chmod 600 "${CERT_DIR}/private.key"
                    
                          """
                     }
                }
            }
        }
        
        stage('Prepare SSL Volume') {
            steps {
                script {
                    sh '''
                        # First create or clear the volume
                        docker run --rm -v jenkins_ssl_certs:/ssl alpine sh -c "rm -rf /ssl/* && mkdir -p /ssl"
    
                        # Then copy the certificates from the workspace
                        docker cp "${CERT_DIR}/." $(docker create --rm -v jenkins_ssl_certs:/ssl alpine sh):/ssl/
    
                        # Finally set the permissions
                        docker run --rm -v jenkins_ssl_certs:/ssl alpine sh -c "
                            chmod 644 /ssl/certificate.crt && \
                            chmod 600 /ssl/private.key
                        "
    
                    '''
                }
            }
        }

        stage("Build and start docker compose services") {
          steps {
            sh '''
               cd ./apps/money-tracker-ui/jenkins
               docker compose stop
               docker stop clematis-money-tracker-ui || true && docker rm clematis-money-tracker-ui || true
               docker stop clematis-money-tracker-ui-demo || true && docker rm clematis-money-tracker-ui-demo || true
               docker compose build
               docker compose up -d
            '''
          }
        }

    }
    
    post {
        always {
           // Clean up sensitive files after use
          sh '''
              if [ -d "${CERT_DIR}" ]; then rm -rf "${CERT_DIR}"; fi
           '''
        }
    }
}
```
To recap:

* Create the directory to store certificate in the workspace
* Copy the certificate to the directory created above
* Prepare an SSL volume and copy the certificate to it.
* Deploy the applications to the Docker containers
* Remove the directory with certificates from the workspace
