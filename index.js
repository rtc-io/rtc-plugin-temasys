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
var pageId = genId();

function genId() {
  return Math.random().toString(36).slice(2);
}

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
  var pluginId = '__temasys_plugin_' + genId();
  var params = [
    { name: 'onload', value: '__load' + pluginId },
    { name: 'pluginId', value: pluginId }
  ];

  function getUserMedia() {
    plugin.getUserMedia.apply(plugin, arguments);
  }

  // patch in the onload handler into the window object
  window['__load' + pluginId] = function() {
    // deference the window handler
    window['__load' + pluginId] = undefined;
    console.log('plugin loaded');

    // set the plugin page id
    plugin.setPluginId(pageId, pluginId);
    plugin.setLogFunction(console);

    // patch navigator getUserMedia function to the plugin
    navigator.getUserMedia = getUserMedia;

    // trigger the callback
    if (typeof callback == 'function') {
      callback(null, plugin);
    }
  };

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

  return plugin;
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
  // ensure we have a callback function
  callback = callback || function() {};

  init(function(err) {
    if (err) {
      return callback(err);
    }

    // TODO: patch the media object

    callback();
  })
};

/**
  ### attachStream(stream, bindings)

**/
exports.attachStream = function(stream, bindings) {
  // get the elements
  var elements = bindings.map(function(binding) {
    // only return the element if it is an object element
    if (binding.el instanceof HTMLObjectElement) {
      return binding.el;
    }
  }).filter(Boolean);

  stream.enableSoundTracks(true);

  // set the stream id for each of the matching elements
  console.log('attaching stream to bindings: ', stream);
  elements.forEach(function(el) {
    el.appendChild(crel('param', {
      name: 'streamId',
      value: stream.id
    }));

    el.attach();
    el.width = '518px';
    el.height = '259px';
  });
};

/**
  ### prepareElement(opts, element) => HTMLElement

  The `prepareElement` function is used to prepare the video container
  for receiving a video stream.  If the plugin is able to work with
  standard `<video>` and `<audio>` elements then a plugin should simply
  not implement this function.

**/
exports.prepareElement = function(opts, element) {
  // determine whether we are dealing with a target we need to replace
  // or a container
  var shouldReplace = (element instanceof HTMLVideoElement) ||
      (element instanceof HTMLAudioElement);

  // if we should replace the element, then find the parent
  var container = shouldReplace ? element.parentNode : element;

  // create our plugin render object
  var renderer = crel('object', {
    id: genId(),
    type: PLUGIN_MIMETYPE
  });

  // initialise the params we will inject into the renderer
  var params = [
    { name: 'pluginId', value: renderer.id },
    { name: 'pageId', value: pageId }
  ];

  params.forEach(function(data) {
    renderer.appendChild(crel('param', data));
  });

  // add an attach method for the renderer
  renderer.attach = function() {
    // inject the renderer into the dom
    container.appendChild(renderer);
  };

  return renderer;
};
