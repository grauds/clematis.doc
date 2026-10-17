---
sidebar_position: 6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Releases

A list of latest releaseas and packages for Clematis projects:

| Module Name | Version | Release | Package Links |
| :--- | :--- | :--- | :--- |
| **Java Workspace** | `2.0.2` | [v2.0.2](https://github.com/grauds/clematis.desktop/releases/tag/v2.0.2) | [Core Jar](https://github.com/grauds/clematis.desktop/packages/3033179) \| [Core API Jar](https://github.com/grauds/clematis.desktop/packages/3033845) \| [UI API](https://github.com/grauds/clematis.desktop/packages/3033137) \| [Widgets](https://github.com/grauds/clematis.desktop/packages/3033099) |
| **Kiwi Library** | `2.5.0-SNAPSHOT` | *N/A* | [Package](https://github.com/grauds/clematis.desktop/packages/3033095) |
| **Math Parser** | `1.0.0` | [v1_0_0](https://github.com/grauds/clematis.math.parser/releases/tag/v1_0_0) | [Package](https://github.com/grauds/clematis.math.parser/packages/3319378?version=1.0.0) |
| **Commons Spring Library** | `1.0.0-SNAPSHOT` | *N/A* | [Package](https://github.com/grauds/clematis.commons.spring/packages/3319380) |
| **Storage API Client** | `1.0.3.1` | [v_1_0_3_0](https://github.com/grauds/clematis.storage.api.client/releases/tag/v_1_0_3_0) | [Core Jar](https://github.com/grauds/clematis.storage.api.client/packages/2734782) \| [Spring Boot 2 Jar](https://github.com/grauds/clematis.storage.api.client/packages/3066820) |

---

## Dependency Configurations

To use any of the dependencies in a Gradle project, add the following to your `build.gradle` file:
```groovy
def githubEnv = layout.projectDirectory.file('config/build/github.env')
if (githubEnv.asFile.exists()) {
    def props = providers.fileContents(githubEnv).asText.map { text ->
        def p = new Properties()
        p.load(new StringReader(text))
        return p
    }.get()
    ext.username = props.getProperty('USERNAME')
    ext.token = props.getProperty('TOKEN')
} else {
    ext.username = providers.environmentVariable("USERNAME").getOrNull()
    ext.token = providers.environmentVariable("TOKEN").getOrNull()
}

repositories {
    mavenCentral()
    maven {
        name = "GitHubPackages"
        url = URI.create(REPO_URL)
        credentials {
            username = project.ext.username
            password = project.ext.token
        }
    }
}
```
Where `USERNAME` and `TOKEN` are the GitHub username and personal access token, respectively, taken 
from the file `config/build/github.env` containing something like:

```env title='config/build/github.en'
USERNAME=user
TOKEN=token
```

The variable REPO_URL is defined as:

```groovy
def REPO_URL = ...
```
And the value can be taken from the list below.

### With Artifactory

Also, the same configuration can be used with `settings.gradle` file:

```groovy

def githubEnv = rootDir.toPath().resolve('config/build/github.env').toFile()
def envProps = new Properties()
if (githubEnv.exists()) {
    githubEnv.withInputStream { envProps.load(it) }
}

def gprUser = providers.environmentVariable("USERNAME").orNull
        ?: providers.gradleProperty("gpr.user").orNull
        ?: envProps.getProperty("USERNAME")

def gprToken = providers.environmentVariable("TOKEN").orNull
        ?: providers.gradleProperty("gpr.key").orNull
        ?: envProps.getProperty("TOKEN")


dependencyResolutionManagement {
    repositories {
        // Check if the pipeline explicitly requested Artifactory
        def useArtifactory = System.getenv("USE_ARTIFACTORY") == "true"
        if (useArtifactory) {
            maven {
                url "http://192.168.1.174:8082/artifactory/maven-central-proxy"
                allowInsecureProtocol = true
                credentials {
                    username = providers.gradleProperty("artifactory_user").orNull ?: System.getenv("ARTIFACTORY_USER")
                    password = providers.gradleProperty("artifactory_password").orNull ?: System.getenv("ARTIFACTORY_PASSWORD")
                }
            }
        } else {
            // Fallback for GitHub Actions
            mavenCentral() 
        }

        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/grauds/clematis.commons.spring")
            credentials {
                username = gprUser
                password = gprToken
            }
        }
    }
}
```

:::note
Please note the difference in the local file loading. Also, do not put the file to SCM.
:::

## The Latest Versions

### Java Workspace

Repo: https://github.com/grauds/clematis.desktop


<Tabs>
  <TabItem value="maven" label="Maven" default>

  ```xml
  <dependency>
      <groupId>org.clematis</groupId>
      <artifactId>core</artifactId>
      <version>2.0.0</version>
  </dependency>
  ```

  </TabItem>
  <TabItem value="gradle" label="Gradle (Groovy)">

  ```groovy
  implementation 'org.clematis:core:2.0.0'
  ```

  </TabItem>
</Tabs>

### Java Workspace API

Repo: https://github.com/grauds/clematis.desktop

<Tabs>
  <TabItem value="maven" label="Maven" default>

  ```xml
  <dependency>
      <groupId>org.clematis</groupId>
      <artifactId>core-api</artifactId>
      <version>2.0.0</version>
  </dependency>
  ```

  </TabItem>
  <TabItem value="gradle" label="Gradle (Groovy)">

  ```groovy
  implementation 'org.clematis:core-api:2.0.0'
  ```

  </TabItem>
</Tabs>

### Java Workspace UI API

Repo: https://github.com/grauds/clematis.desktop

<Tabs>
  <TabItem value="maven" label="Maven" default>

  ```xml
  <dependency>
      <groupId>org.clematis</groupId>
      <artifactId>ui-api</artifactId>
      <version>2.0.0-SNAPSHOT</version>
  </dependency>
  ```

  </TabItem>
  <TabItem value="gradle" label="Gradle (Groovy)">

  ```groovy
  implementation 'org.clematis:ui-api:2.0.0-SNAPSHOT'
  ```

  </TabItem>
</Tabs>

### Java Workspace Widgets

Repo: https://github.com/grauds/clematis.desktop

<Tabs>
  <TabItem value="maven" label="Maven" default>

  ```xml
  <dependency>
    <groupId>org.clematis</groupId>
    <artifactId>widgets</artifactId>
    <version>2.0.0-SNAPSHOT</version>
  </dependency>
  ```

  </TabItem>
  <TabItem value="gradle" label="Gradle (Groovy)">

  ```groovy
  implementation 'org.clematis:widgets:2.0.0-SNAPSHOT'
  ```

  </TabItem>
</Tabs>

### Kiwi Library

Repo: https://github.com/grauds/clematis.desktop

<Tabs>
  <TabItem value="maven" label="Maven" default>

  ```xml
  <dependency>
    <groupId>org.clematis</groupId>
    <artifactId>kiwi</artifactId>
    <version>2.5.0-SNAPSHOT</version>
  </dependency>
  ```

  </TabItem>
  <TabItem value="gradle" label="Gradle (Groovy)">

  ```groovy
  implementation 'org.clematis:kiwi:2.5.0-SNAPSHOT'
  ```

  </TabItem>
</Tabs>

### Math Parser

Repo: https://github.com/grauds/clematis.math.parser

<Tabs>
  <TabItem value="maven" label="Maven" default>

  ```xml
  <dependency>
    <groupId>org.clematis</groupId>
    <artifactId>math-parser</artifactId>
    <version>1.0.0</version>
  </dependency>
  ```

  </TabItem>
  <TabItem value="gradle" label="Gradle (Groovy)">

  ```groovy
  implementation 'org.clematis:math-parser:1.0.0'
  ```

  </TabItem>
</Tabs>

### Commons Spring Library

Repo: https://github.com/grauds/clematis.commons.spring

<Tabs>
  <TabItem value="maven" label="Maven" default>

  ```xml
  <dependency>
    <groupId>org.clematis</groupId>
    <artifactId>clematis-commons-spring</artifactId>
    <version>1.0.0-SNAPSHOT</version>
  </dependency>
  ```

  </TabItem>
  <TabItem value="gradle" label="Gradle (Groovy)">

  ```groovy
  implementation 'org.clematis:clematis-commons-spring:1.0.0-SNAPSHOT'
  ```

  </TabItem>
</Tabs>

### Storage API Client

Repo: https://github.com

#### Core Client
<Tabs>
  <TabItem value="maven" label="Maven" default>

  ```xml
  <dependency>
    <groupId>org.clematis.storage</groupId>
    <artifactId>storage-api-client</artifactId>
    <version>1.0.3.1</version>
  </dependency>
  ```

  </TabItem>
  <TabItem value="gradle" label="Gradle (Groovy)">

  ```groovy
  implementation 'org.clematis.storage:storage-api-client:1.0.3.1'
  ```

  </TabItem>
</Tabs>

#### Spring Boot 2 Variant
<Tabs>
  <TabItem value="maven" label="Maven" default>

  ```xml
  <dependency>
    <groupId>org.clematis.storage</groupId>
    <artifactId>storage-api-client-spring2</artifactId>
    <version>1.0.3.1</version>
  </dependency>
  ```

  </TabItem>
  <TabItem value="gradle" label="Gradle (Groovy)">

  ```groovy
  implementation 'org.clematis.storage:storage-api-client-spring2:1.0.3.1'
  ```

  </TabItem>
</Tabs>
