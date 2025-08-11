---
tags:
  - proxmox
  - zabbix
  - jmxmp
---

# Monitoring with JMXMP

All Clematis API are [configured to use JMXMP without SSL and authentication](../../../docs/web-applications/logging/logging.md#runtime-diagnostic-with-jmx), since it is still the
internal network with Zabbix. For production, we would've used JMXMP with SSL and authentication, of course, 
so if production happens with any of the home projects. This also would mean that we need to use Cloud hosting,
not the home network.

## Setting Up Zabbix Java Gateway and Pollers

For Zabbix to be able to work with JMXMP, the Java Gateway component needs to be set up:

````bash title="On Zabbix server"
sudo apt install zabbix-java-gateway
````

The required configuration is done in the Zabbix configuration file:
```bash title="On Zabbix server"
sudo nano /etc/zabbix/zabbix_server.conf 
`````

Uncomment the following lines:
```` title="/etc/zabbix/zabbix_server.conf"
### Option: JavaGateway
#       IP address (or hostname) of Zabbix Java gateway.
#       Only required if Java pollers are started.
#
# Mandatory: no
# Default:
JavaGateway=127.0.0.1

### Option: JavaGatewayPort
#       Port that Zabbix Java gateway listens on.
#
# Mandatory: no
# Range: 1024-32767
# Default:
JavaGatewayPort=10052

### Option: StartJavaPollers
#       Number of pre-forked instances of Java pollers.
#
# Mandatory: no
# Range: 0-1000
# Default:
StartJavaPollers=10
````
Add `jmxremote_optional-repackaged-5.0.jar` library to Java Gateway classpath:
````bash title="On Zabbix server"
sudo mv jmxremote_optional-repackaged-5.0.jar /usr/share/zabbix/java-gateway/lib/
````

Restart the Zabbix Java Gateway:
````bash title="On Zabbix server"
sudo systemctl restart zabbix-java-gateway
````

## Create JMXMP Template

Zabbix has a template for JMX called `Generic Java JMX`, but it is configured to work with RMI protocol,
the connection URL template is `service:jmx:rmi:///jndi/rmi://{HOST.CONN}:{HOST.PORT}/jmxrmi`.

The easiest way to change the protocol is to create a new template, and change the connection URL 
to `service:jmx:jmxmp://{HOST.CONN}:{HOST.PORT}`.

1. Clone the `Generic Java JMX` template in Zabbix UI, I called the clone `Generic Java JMXMP`:
   <img src={require('@site/static/img/cloning_template.png').default} style={{width: '1200px'}} alt={''}/>
2. Now go to the `Items` section of the clone, select 'Mass Update' and change URL of all the items to 
`service:jmx:jmxmp://{HOST.CONN}:{HOST.PORT}`:
   <img src={require('@site/static/img/changing_template_items.png').default} style={{width: '1200px'}} alt={''}/>
3. There will be 8 more places not editable via mass update, so you need to change them manually. Export
the template, change all the URLs, and import it back.

[Download Generic Java JMXMP template](./generic_jmxmp.json)

## Use JMXMP Template

Create a new Java application host in Zabbix, and use the `Generic Java JMXMP` template:
   <img src={require('@site/static/img/adding_jmxmp_template.png').default} style={{width: '1200px'}} alt={''}/>

The host will be able to connect to the JMXMP:
<img src={require('@site/static/img/jmxmp_monitoring.png').default} style={{width: '1200px'}} alt={''}/>