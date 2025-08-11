---
tags:
  - proxmox
  - zabbix
  - truenas
---

# Monitoring TrueNAS Scale

The template is available [here](https://github.com/tr1plus/zabbix_truenas_SCALE_snmp), there
is no template for TrueNAS Scale in the 
[community templates](https://github.com/zabbix/community-templates/tree/main/Storage_Devices/FreeNAS).

The TrueNAS Scale SNMP service should be enabled:
<img src={require('@site/static/img/truenas_snmp.png').default} style={{width: '1200px'}} alt={''}/>

Create a new host in Zabbix with SNMP interface and destination port 161:
<img src={require('@site/static/img/truenas_zabbix_setup.png').default} style={{width: '1200px'}} alt={''}/>

That's it!

<img src={require('@site/static/img/truenas_zabbix.png').default} style={{width: '1200px'}} alt={''}/>
