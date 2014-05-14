/* jshint node: true */
'use strict';

var crel = require('crel');

/**
  # rtc-plugin-temasys

  This is an experimental plugin for bridging the functionality provided by
  the [Temasys IE plugin](http://bit.ly/1lnlEIK) into the rtc.io module
  suite.

  ## Example Usage

  A simple capture example is shown below:

  <<< examples/capture.js

  ## Reference

  Documented below is an number of plugin functions that are used to
  both determine plugin suitability for a browser / platform and also
  ensure that the plugin is correctly loaded into the HTML document.

**/

var PLUGIN_MIMETYPE = 'application/x-temwebrtcplugin';
var counter = 0;

/**
  ### supported(platform) => Boolean

  The supported function returns true if the platform (as detected using
  `rtc-core/detect`) is compatible with the plugin. By doing this prelimenary
  detection you can specify a number of plugins to be loaded but only
  the first the is supported on the current platform will be used.

**/
exports.supported = function(platform) {
  return ['ie', 'safari'].indexOf(platform.browser.toLowerCase()) >= 0;
};

/**
  ### init(callback)

  The `init` function is reponsible for ensuring that the current HTML
  document is prepared correctly.

**/
var init = exports.init = function(callback) {
  // find the temasys plugin
  var plugin = document.querySelector('object[type="' + PLUGIN_MIMETYPE + '"]');
  var pluginId = '__temasys_plugin' + (counter++);
  var params = [
    { name: 'onload', value: '__load' + pluginId },
    { name: 'pluginId', value: pluginId }
  ];

  // patch in the onload handler into the window object
  window['__load' + pluginId] = function() {
    console.log('plugin loaded');
  };

  console.log('initializing plugin: ' + pluginId);

  // if the plugin is not found, then add it to the document
  if (! plugin) {
    plugin = crel('object', {
      width: 0,
      height: 0,
      type: PLUGIN_MIMETYPE,
      id: pluginId
    });

    // create the plugin parameters
    params.forEach(function(data) {
      plugin.appendChild(crel('param', data));
    });

    // add the plugin to the document body
    document.body.appendChild(plugin);
  }
};

/**
  ### initMedia(media, callback)

  The `initMedia` function is to perform two functions:

  1. To ensure that the HTML document has been prepared correctly for
     the plugin.  If not, the `init` function will be called.

  2. To apply any plugin specific logic into the rtc.io media capture
     interface.

**/
exports.initMedia = function(media, callback) {
  init(function(err) {
    if (err) {
      return callback(err);
    }
  })
};
