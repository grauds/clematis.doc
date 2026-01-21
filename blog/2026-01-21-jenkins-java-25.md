---
slug: jenkins-java-25
title: Jenkins Migration to Java 25 LTS
authors: [anton]
tags: [maintenance]
---
My Turnkey Jenkins LXC stopped updates via apt a month ago, so I had to update the key:
```bash
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2026.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
```
And to update the repository:
```bash
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list
```
Also, Jenkins needs Java 21 or higher. Installing it via deb package (Zulu):
```bash
sudo dpkg -i zulu25.32.17-ca-jdk25.0.2-linux_amd64.deb
```
In case any dependencies are missing, install them:
```bash
sudo apt --fix-broken install -y
```
Finally, fix the jenkins service path:
```bash
nano /lib/systemd/system/jenkins.service
```
Change 
```bash
ExecStart=/usr/bin/java -jar /usr/share/jenkins/jenkins.war`
```
to 
```bash
ExecStart=/usr/bin/java -jar /usr/share/java/jenkins.war
```
Reload systemd:
```bash
sudo systemctl daemon-reload
```



