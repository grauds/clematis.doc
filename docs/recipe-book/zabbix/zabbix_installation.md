---
tags:
  - proxmox
  - zabbix
---

# Zabbix PVE Installation

The best way to install Zabbix on Proxmox is to use the community script:

```bash title="On Proxmox"
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/zabbix.sh)"
```

It will install Zabbix on Proxmox and configure database and web interface.