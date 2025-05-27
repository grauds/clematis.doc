---
slug: gradle-update-post
title: Gradle and Palantir Docker Plugin 
authors: [anton]
tags: [maintenance]
---
The [Palantir Docker Plugin](https://github.com/palantir/gradle-docker) is now EOL, which probably is the old news,
however, the worse part is that it is waiting to be updated for Gradle 8.12 and up: 
https://github.com/palantir/gradle-docker/issues/801. 

Some Clematis APIs are dependent on the plugin, so looking for workarounds or removal.