---
sidebar_position: 1
tags:
  - proxmox
  - keycloak
---

# Motivation to Upgrade

Security in the [Money Tracker](https://github.com/grauds/money.tracker.ui) application was implemented using
an embedded Keycloak server instance and adapters for Spring Boot 2 and for several major versions of Angular.
This architecture has been working for over three years.
I was about to put it to documentation when new versions came out for both Keycloak and Angular,
which brought up significant changes and made the story more complex.

## Cost of Maintenance

The embedded instance of Keycloak (Clematis Auth API) is actually a Gradle-based interpretation
of [Thomas Darimont's project](https://github.com/thomasdarimont/embedded-spring-boot-keycloak-server), which is
stopped at Keycloak version 18.x and probably won't be maintained any longer; Clematis Auth API supports Keycloak version 20.
The project required development efforts every time a Keycloak version is updated.
It would require even more effort to
[update the application to Spring Boot 3](https://github.com/thomasdarimont/embedded-spring-boot-keycloak-server/issues/87).

## Decommissioning Embedded Keycloak Server

It was decided to discontinue the maintenance of Clematis Auth API beyond May 30, 2025, and to delete the project.

## Migration to Keycloak Proxmox CT VM

Since Clematis applications have been living in Proxmox box for one year already, there is a good chance to
give Proxmox an opportunity to bridge the gap and to host Keycloak as a virtual machine instance. There is no
official template, but the Proxmox community
has it: [Keycloak Template](https://community-scripts.github.io/ProxmoxVE/scripts?id=keycloak).

The first step is to open Proxmox VE Shell and use the following to build a CT template:

````bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/keycloak.sh)"
````
The next step is to open Proxmox Web Admin UI to [create a new LXC Container](https://pve.proxmox.com/wiki/Linux_Container).
The new Keycloak template was created in the previous step, and it is just required to specify the hardware resources
depending on the particular server configuration.

After the container is started, the new instance of Keycloak is available at container IP address and port 8080. But
before the login page can be used, it is necessary to configure temporary admin access to the server using the
steps [on this page](https://github.com/community-scripts/ProxmoxVE/discussions/193):

````bash title="SSH login to the container IP address"
systemctl stop keycloak.service
cd /opt/keycloak/bin
./kc.sh bootstrap-admin user
systemctl start keycloak.service
````
Follow the onscreen instructions to create a new admin user when running ```./kc.sh bootstrap-admin user```.

:::tip
It is a wise move to migrate the configuration from the existing installation of Keycloak. However, be prepared
in this case to regenerate all the clients' passwords and secrets.
:::
