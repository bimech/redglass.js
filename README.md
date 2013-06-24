redglass.js
===========

A jQuery plugin for monitoring browser events. RedGlass allows you to view an automated test from the browser's perspective.  Redglass.js was created for use in the broader [RedGlass](http://redglass.io/) project, but it can certainly be used as a standalone browser event monitor.

## Usage

```javascript

// The first parameter is an arbitrary test id.
// The second parameter is the port (on localhost) where the observed events should be posted.

$(document).redGlass('1', '4567');

```
