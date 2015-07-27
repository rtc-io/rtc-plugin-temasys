/* jshint node: true */
'use strict';

var crel = require('crel');
var config = require('./config');
var loader = require('./loader');

/**
  # rtc-plugin-temasys

  This is an experimental plugin for bridging the functionality provided by
  the [Temasys IE plugin](http://bit.ly/1lnlEIK) into the rtc.io module
  suite.

  ## Example Usage (Capture)

  A simple capture example is shown below:

  <<< examples/capture.js

  For a more detailed example (which includes video conferencing, please have
  a look at our [helloworld demo](https://github.com/rtc-io/demo-helloworld) which
  can be easily modified to use our Temasys plugin layer.

  ## Reference

  Documented below is an number of plugin functions that are used to
  both determine plugin suitability for a browser / platform and also
  ensure that the plugin is correctly loaded into the HTML document.

**/

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
var init = exports.init = loader.init;

exports.attach = function(stream, opts) {
  var element = (opts || {}).el;

  // determine whether we are dealing with a target we need to replace
  // or a container
  var shouldReplace = (element instanceof HTMLVideoElement) ||
      (element instanceof HTMLAudioElement);

  // if we should replace the element, then find the parent
  var container = shouldReplace ? element.parentNode : element;
  var rendererId = config.genId();
  var params = [
    { name: 'pluginId', value: rendererId },
    { name: 'pageId', value: loader.pageId },
    { name: 'windowless', value: true }
  ];

  function createRenderSurface(stream) {
    var renderParams = params.concat([{ name: 'streamId', value: stream.id }]);
    var renderer = crel('object', {
      id: rendererId,
      type: config.mimetype
    });

    var el = crel('div', renderer);

    stream.enableSoundTracks(true);

    // initialise the params we will inject into the renderer
    renderParams.forEach(function(data) {
      renderer.appendChild(crel('param', data));
    });

    // TODO: make these sensible
    renderer.width = 640;
    renderer.height = 320;

    // inject the renderer into the dom
    if (shouldReplace) {
      container.insertBefore(el);
      container.removeChild(element);
    }

    return el;
  }

  return createRenderSurface(stream);
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

};

/* peer connection plugin interfaces */

exports.createIceCandidate = function(opts) {
  return loader.plugin && loader.plugin.ConstructIceCandidate(
    (opts || {}).sdpMid || '',
    (opts || {}).sdpMLineIndex,
    (opts || {}).candidate
  );
};

exports.createConnection = function(config, constraints) {
  var iceServers = ((config || {}).iceServers || []).map(function(iceServer) {
    // The Temasys plugin creates a null `hasCredentials` property if it is not explicitly
    // set, which then throws an exception as it cannot cast it's value. So set the value
    // manually
    iceServer.hasCredentials = !!iceServer.credential;
    return iceServer;
  });
  
  return loader.plugin && loader.plugin.PeerConnection(
    loader.pageId,
    iceServers,
    (constraints || {}).mandatory || null,
    (constraints || {}).optional || null
  );
};

exports.createSessionDescription = function(opts) {
  return loader.plugin && loader.plugin.ConstructSessionDescription(opts.type, opts.sdp);
};
