---
slug: clematis-money-tracker-ui-storage
title: Money Tracker UI with Storage API
authors: [anton]
tags: [angular, typescript, money-tracker]
---
Added a significantly renovated design plus integration with Clematis Storage API gives
a persistent storage for commodities, organizations and accounts main images.

<img src={require('@site/static/img/thumbnails.png').default} width="530px"></img>

<!-- truncate -->

The images themselves can be simply pasted from the clipboard in a new image uploader component,
this makes the authoring of entity front image easier:

1. Paste the image from the clipboard, scale and move it to the desired position. The uploader will
   crop the visible area of the image.
<img src={require('@site/static/img/image_uploader_editor.png').default} width="300px"></img>

2. Clicking the "Save" button will upload the image to the Clematis Storage API and will display the resulting
image in the read-only uploader. In this example the image has been scaled down before upload if 
compared with the first screenshot.
<img src={require('@site/static/img/image_uploader.png').default} width="300px"></img>

The component sources can be found [here](https://github.com/grauds/money.tracker.ui/tree/dc6da430a67758327a4afa9c20e88cf3622e1108/libs/shared-components/src/lib/components/photo-uploader).

