---
tags:
  - proxmox
  - jenkins
---

# Migration to Proxmox LXC

The former Docker-based installation of Jenkins was convenient in terms of dockerized 
builds and deployment since it was colocated with the applications in the same Docker 
process. However, this approach lacks flexibility when it comes to deploying to different
virtual machines and to the cloud, since the former Jenkins pipeline was 
only capable of working with local Docker via Linux command line.
Also, heavy builds often take up valuable 
application resources. So, to be more professional and flexible, 
a dedicated server is needed for Jenkins. 

Proxmox Linux Containers combine proper isolation with a dynamic resources allocation without
a restart, which is perfect for the above goals.

## Install From a LXC Template

I use [Turnkey Jenkins](https://www.turnkeylinux.org/jenkins) to install a preconfigured Debian with Jenkins.

## Install Docker 

The best option for Debian is to use the short command from Docker.com:
```bash title="On Proxmox LXC"
curl -fsSL https://get.docker.com | sh
docker version
apt update
DOCKER_COMPOSE_VERSION=2.24.0
curl -SL https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64     -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose version
usermod -aG docker jenkins
```

## Generate SSH Key Pair for Yoda

New Jenkins will use ssh-agent to do the deployments, so it will need an SSH Key Pair for 
Yoda. I've made a shortcut and use my own account to do the deployments for Yoda, in general
it is advised to use a dedicated account.

```bash title="On Proxmox LXC"
ssh-keygen -t ed25519 -C "jenkins@yoda-deploy" -f ~/.ssh/yoda_jenkins_key
ssh-copy-id -i ~/.ssh/yoda_jenkins_key.pub anton@[Yoda_IP]
```

Verify it is installed well (should connect without a password):
```bash title="On Proxmox LXC"
ssh -i ~/.ssh/yoda_jenkins_key anton@[Yoda_IP]
```

## Migrate Data

The data migration may be done the easy way if followed the recipe below. The former Jenkins
installation is a Docker container on Yoda. 

1. Backup Jenkins Data from Docker

```bash title="On Yoda"
docker stop <jenkins_container_name>
docker cp <jenkins_container_name>:/var/jenkins_home /tmp/jenkins_backup
# OR if using a mounted volume:
cp -r /path/to/jenkins_home /tmp/jenkins_backup
tar czvf jenkins_backup.tar.gz -C /tmp jenkins_backup
```
The output is the archive `jenkins_backup.tar.gz`.

2. Copy Backup to LXC

```bash title="On Yoda"
scp jenkins_backup.tar.gz root@[LXC_IP]:/root
```

Please check that LXC is not running at this stage. The working directory of the clean 
installation has to be moved aside.
```bash title="On Proxmox LXC"
systemctl stop jenkins
cd /var/
mv lib/jenkins/ lib/_jenkins
tar xzvf /root/jenkins_backup.tar.gz -C .
chown -R jenkins:jenkins /var/jenkins_backup/
mv jenkins_backup/ /var/lib/jenkins
systemctl start jenkins
systemctl status jenkins
```
At this point the new installation of Jenkins should be up and running, with all the jobs,
credentials and history preserved. However, it won't be deploying to Yoda without changes
in the pipelines of each project.

## Install SSH Private Key in Jenkins

In Jenkins:

1. Go to Manage Jenkins → Credentials.
2. Choose your scope (e.g., global, or folder-specific).
3. Add a new SSH Username with private key credential:
* ID: yoda-anton-key (this must match the pipeline)
* Username: anton
* Private Key: Enter directly or paste from ~/.ssh/yoda_jenkins_key
* Description: “Yoda SSH Key for Jenkins”

## Update Pipelines

Jenkins will build locally, as before, but now the images have to be copied to Yoda and
deployed to Docker Compose remotely. Here are the required changes, for example, in a Money Tracker UI project:

````jenkins title='Jenkinsfile'
pipeline {

  agent any
  tools { nodejs "Node18" }
  environment {
    CERT_DIR = "${WORKSPACE}/docker/nginx/ssl"
    REMOTE_HOST = [Yoda_IP]
    REMOTE_USER = "anton"
    SSH_DEST = "${REMOTE_USER}@${REMOTE_HOST}"
    REMOTE_APP_DIR = "/home/anton/deploy/mt"
  }
  
  //....
  
  // export images to archives
  stage('Export Docker Images') {
      steps {
        sh '''
          mkdir -p docker_export
          docker save money.tracker.ui.uat > docker_export/uat.tar
          docker save money.tracker.ui.demo > docker_export/demo.tar
        '''
      }
    }

    // copy images to the deployment server
    stage('Transfer Files to Yoda') {
      steps {
        sshagent (credentials: ['yoda-anton-key']) {
          sh '''
            [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
            scp -o StrictHostKeyChecking=no -r "${CERT_DIR}" "${SSH_DEST}:${REMOTE_APP_DIR}/certs"
            scp -o StrictHostKeyChecking=no docker_export/*.tar "${SSH_DEST}:${REMOTE_APP_DIR}/"
            scp -o StrictHostKeyChecking=no "apps/money-tracker-ui/jenkins/docker-compose.yml" "${SSH_DEST}:${REMOTE_APP_DIR}/"
           '''
        }
      }
    }

    // load to Docker remotely
    stage('Deploy on Yoda') {
      steps {
        sshagent (credentials: ['yoda-anton-key']) {
          sh '''
            ssh ${SSH_DEST} "
              docker rm -f clematis-money-tracker-ui clematis-money-tracker-ui-demo 2>/dev/null || true && \
              docker load < ${REMOTE_APP_DIR}/uat.tar && \
              docker load < ${REMOTE_APP_DIR}/demo.tar && \
              docker compose -f ${REMOTE_APP_DIR}/docker-compose.yml up -d
            "
          '''
        }
      }
    }
  }
}
````
These stages can be easily adapted to other projects as well.

### Pipeline With Variables

In some cases Jenkins variables should be merged to the commandline executed on another server. This
can be done a bit trickily with export of the variables to environment variables:

````jenkins title='Jenkinsfile'
stage('Deploy on Yoda') {
  environment {
    KEYCLOAK_SECRET = credentials('MT_API_KEYCLOAK_SECRET')
    SPRING_DATASOURCE_PASSWORD = credentials('MT_FIREBIRD_PASSWORD')
  }
  steps {
    sshagent (credentials: ['yoda-anton-key']) {
        sh """
          ssh ${SSH_DEST} '
            cd ${REMOTE_APP_DIR} && \
            docker rm -f rm -f clematis-money-tracker-db clematis-money-tracker-db-demo clematis-money-tracker-api clematis-money-tracker-api-demo 2>/dev/null || true && \
            export KEYCLOAK_SECRET="${KEYCLOAK_SECRET}" && \
            export SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD}" && \
            docker load < clematis.mt.api.tar && \
            docker compose -f docker-compose.yml build --build-arg KEYCLOAK_SECRET="${KEYCLOAK_SECRET}" --build-arg SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD}" && \
            docker compose -f docker-compose.yml up -d money-tracker-db money-tracker-db-demo && \
            docker compose -f docker-compose.yml up -d --no-deps --build money-tracker-api money-tracker-api-demo
          '
        """
    }
  }
}
````

