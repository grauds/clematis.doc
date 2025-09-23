---
slug: clematis-desktop-ui-update
title: Clematis Desktop Java 21 & Refactoring
date: 2025-09-23
authors: [anton]
tags: [desktop]
---
[Clematis Desktop](https://github.com/grauds/clematis.desktop) 
is updated to work with Java version 21. There were a few steps were made:
* Gradle is updated to 9.1.0
* Changes in build files syntax to support Gradle 9.1.0

<img src={require('@site/static/img/desktop.png').default} width="530px"></img>

The project gradually accepts new language features as much of the old code is being 
refactored, for example, to remove the lengthy Desktop class and break down 
its functionality into smaller classes, organized in a more Java Swing way. More details are 
available in the [README](https://github.com/grauds/clematis.desktop/tree/master/modules/ui).