redglass.js
===========

A jQuery plugin for monitoring browser events. RedGlass allows you to view an automated test from the browser's perspective.  Redglass.js was created for use in the broader [RedGlass](http://redglass.io/) project, but it can certainly be used as a standalone browser event monitor.

## Usage

```javascript

$(document).redGlass({ testID: '1', port: '4567', useServerLog: true, useMemoryLog: true });

// Events will now be posted to http://localhost:4567
// and are also accessible in the browser via RedGlass.log

```
