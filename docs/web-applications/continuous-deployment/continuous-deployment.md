---
sidebar_position: 17
tags:
  - express
  - openresty
  - nginx
  - jenkins
  - cobertura
  - jacoco
  - coverage-plugin
  - docker
  - docker-compose
  - proxmox
---

# Continuous Deployment

The web projects described above, their client and server parts, are
built and packed into [Docker](https://www.docker.com/) images. Each project has a Docker file 
in the root of the project; however, not all the Docker build files
have a build stage, some of them just copy the built artifact. 

:::tip
It is preferable to have a Docker build stage for every project. It allows
 avoiding fragile builds and dependencies on build environments.
:::

## Docker Images

Docker images for java applications use `openjdk:17-jdk-slim` and 
web applications usually go with `node:16`, `node:18`,
`nginx:1.xx-alpine` or `openresty/openresty:alpine-fat`, 
since they need either [Express](https://expressjs.com/),
[OpenResty](https://openresty.org/en/)
or [Nginx](https://nginx.org/en/) 
to serve the static minified code files. 

## GitHub Actions

If either PR is merged to the GitHub repository's master or main branch
or code directly pushed to it, an automatic rebuild to renew the project
status badge will be triggered. The latter, of course, should not happen if
the number of developers in the project is greater than one.

Actions use Docker build files provided in the root of each project plus
a build procedure if the Docker file doesn't have a build stage.

## Jenkins Pipeline

At the same time, [Jenkins](https://www.jenkins.io) is building projects
on the premises, using configured triggers or schedule. 

<img src={require('@site/static/img/jenkins.png').default} style={{width: '500px'}} alt={''}/>

Each project has a `Jenkinsfile` at the root folder, the template is like below:

````jenkins title='Jenkinsfile'
pipeline {
    agent any
    stages {
        stage("Verify tooling") {  
            steps {
                sh '''
                  docker version
                  docker info
                  docker compose version
                  curl --version
                  jq --version
                  docker compose ps
                '''
            }
        }

        stage('Build docker image') {
            environment {
                ENV_VARIABLE = credentials('ENV_VARIABLE')
            }
            steps {
                // actual build step
            }
        }

        stage('Publish tests') {
            steps {
                recordCoverage(tools: [[parser: 'JACOCO']],
                        id: 'jacoco', name: 'JaCoCo Coverage',
                        sourceCodeRetention: 'EVERY_BUILD',
                        qualityGates: [
                                [threshold: 60.0, metric: 'LINE', baseline: 'PROJECT', unstable: true],
                                [threshold: 60.0, metric: 'BRANCH', baseline: 'PROJECT', unstable: true]])
            }
        }

        stage ('Dependency-Check') {
            steps {
                dependencyCheck additionalArguments: '''
                    -o "./"
                    -s "./"
                    -f "ALL"
                    --prettyPrint''', nvdCredentialsId: 'NVD_API_Key', odcInstallation: 'Dependency Checker'

                dependencyCheckPublisher pattern: 'dependency-check-report.xml'
            }
        }

        stage("Build and start docker compose service") {
            environment {
                ENV_VARIABLE = credentials('ENV_VARIABLE')
            }
            steps {
                sh '''
                docker compose stop
                docker stop [container] || true && docker rm [container] || true
                docker compose build --build-arg ENV_VARIABLE='$ENV_VARIABLE'
                docker compose up -d 
                '''
            }
        }
    }

    post {
        always {
            junit skipPublishingChecks: true, testResults: '**/surefire/*.xml'
        }
    }
}

````

1. **Verify tooling**: a special preparation task to verify the server build environment has everything installed
2. **Build docker image**: a command to build the artifact locally. It usually contains an `environment` block to inject
build variables declared in Jenkins, like secrets, passwords, etc. 

### Coverage Report

3. **Publish tests**: stage publishes the coverage of unit tests done during the previous stage to 
Jenkins [Coverage plugin](https://plugins.jenkins.io/coverage/). All Java projects use [JaCoCo](https://www.eclemma.org/jacoco/)
[Gradle plugin](https://docs.gradle.org/current/userguide/jacoco_plugin.html), all React or Angular projects 
use [Cobertura](https://cobertura.github.io/cobertura/) output, see the example below:
````jenkins
stage('Publish tests') {
  agent any
  steps {
    sh '''
       export DOCKER_BUILDKIT=1
       docker build --output "type=local,dest=${WORKSPACE}/coverage" --target test-out .
       ls -l ./coverage
    '''
    recordCoverage(
      tools: [[parser: 'COBERTURA', pattern: 'coverage/**/cobertura-coverage.xml']],
      id: 'cobertura',
      name: 'Cobertura Coverage',
      sourceCodeRetention: 'EVERY_BUILD',
      ignoreParsingErrors: true,
      qualityGates: [
        [threshold: 60.0, metric: 'LINE', baseline: 'PROJECT', unstable: true],
        [threshold: 60.0, metric: 'BRANCH', baseline: 'PROJECT', unstable: true]
      ]
    )
  }
}
````

### Vulnerabilities Report

4. **Dependency check**: stage requires [Jenkins Dependency check](https://plugins.jenkins.io/dependency-check-jenkins-plugin/)
plugin. This is an initiative led by [OWASP](https://owasp.org/#) organization, and the plugin helps
to detect vulnerable libraries which need to be updated, both for Java and JavaScript projects. It is
advisable to get a [National Vulnerability Database (NVD)](https://nvd.nist.gov/)
key from U.S. [National Institute Of Standards and Technology](https://www.nist.gov/) for the plugin,
as it downloads the updates for the database much faster with [the key](https://nvd.nist.gov/developers/request-an-api-key).
The key should be stored as a secret in Jenkins and applied as in example above: `nvdCredentialsId: 'NVD_API_Key'`. 

### Docker Compose Deployment

5. **Build and start docker compose service**: the last stage is used to redeploy the application on the
same instance of Docker this Jenkins instance is running on. This environment is called **staging**
for all the projects.

:::warning[Can be done better]
There is nothing deployed to any cloud infrastructure at the moment, the migration will happen
as soon as time permits, since the **staging** environment is used for quality assurance testing
and user acceptance testing at the same time.
:::

## Proxmox Hosted VMs

The on-premise environment is a standalone [Proxmox](https://www.proxmox.com/en/) data center server installed
on the physical server with the following hardware:

1. 12 x Intel(R) Xeon(R) E-2336 CPU @ 2.90GHz (1 Socket)
2. RAM: 64Gb DDR4 3200MHz Samsung ECC Reg OEM
3. 1Tb of M.2 SSD storage
4. 7Tb of HDD storage for data, cache and interim backups

Backups of virtual machine are also scheduled to another backup server with Proxmox Backup capabilities.