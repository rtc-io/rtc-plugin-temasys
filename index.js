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
  ### init(opts, callback)

  The `init` function is reponsible for ensuring that the current HTML
  document is prepared correctly.

**/
var init = exports.init = function(opts, callback) {
  // find the temasys plugin
  var plugin = document.querySelector('object[type="' + PLUGIN_MIMETYPE + '"]');
  var pluginId = '__temasys_plugin_' + genId();
  var params = [
    { name: 'onload', value: '__load' + pluginId },
    { name: 'pluginId', value: pluginId }
  ];

  function getUserMedia(constraints, successCb, failureCb) {
    plugin.getUserMedia.call(
      plugin,
      constraints,
      function(stream) {
        console.log('captured stream: ', stream);
        if (typeof successCb == 'function') {
          successCb(stream);
        }
      },
      function(err) {
        console.log('failed capturing stream: ', err);
        if (typeof failureCb == 'function') {
          failureCb(err);
        }
      }
    );
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
  var createRenderSurfaces = bindings.map(function(binding) {
    return typeof binding.el == 'function' && binding.el;
  }).filter(Boolean);

  stream.enableSoundTracks(true);

  // set the stream id for each of the matching elements
  createRenderSurfaces.forEach(function(fn) {
    fn(stream);
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
  var rendererId = genId();
  var params = [
    { name: 'pluginId', value: rendererId },
    { name: 'pageId', value: pageId }
  ];

  function createRenderSurface(stream) {
    var renderParams = params.concat([{ name: 'streamId', value: stream.id }]);
    var renderer = crel('object', {
      id: rendererId,
      type: PLUGIN_MIMETYPE
    });

    // initialise the params we will inject into the renderer
    renderParams.forEach(function(data) {
      renderer.appendChild(crel('param', data));
    });

    // TODO: make these sensible
    renderer.width = 640;
    renderer.height = 320;

    // inject the renderer into the dom
    if (shouldReplace) {
      container.insertBefore(renderer);
      container.removeChild(element);
    }
    else {
      container.appendChild(renderer);
    }
  }

  return createRenderSurface;
};
