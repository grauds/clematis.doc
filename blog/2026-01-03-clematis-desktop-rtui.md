---
slug: clematis-desktop-rtui
title: Clematis Desktop Plugins Installer
date: 2026-01-03
authors: [anton]
tags: [desktop]
---
The next update for Clematis Desktop includes a new version of Runtime Manager UI plugin enriched
with plugins downloader and installer, plus some more JVM monitors with GC marks. 

<img src={require('@site/static/img/desktop_plugins_ui.png').default} width="530px"></img>

There are many ideas yet to be implemented, the current list of changes is as follows:
1. Removed Kiwi Plugin 'expected' type.
2. Kiwi Plugin type control: ANY type can be loaded as SYSTEM or USER types of plugins, otherwise the types have to match
3. Replaced plugin list with plugin table in Runtime Manager UI
4. Fixed Kiwi Plugin classloader resource bundle issue
5. Improved layout of the monitors' section
6. Improved layout of the tabbed pane
7. New type of UI extension shells which is loaded as USER plugins but common for all users. 
Their lifecycle is slightly different from the one of SYSTEM plugins, since these shells are 
being destroyed at the end of each user session.
8. Plugin download from a URL and automatic installation afterward
9. Plugins uninstallation buttons
10. New log panel component