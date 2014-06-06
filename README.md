# rtc-plugin-temasys

This is an experimental plugin for bridging the functionality provided by
the [Temasys IE plugin](http://bit.ly/1lnlEIK) into the rtc.io module
suite.


[![NPM](https://nodei.co/npm/rtc-plugin-temasys.png)](https://nodei.co/npm/rtc-plugin-temasys/)

[![experimental](https://img.shields.io/badge/stability-experimental-red.svg)](https://github.com/badges/stability-badges) [![Dependency Status](https://david-dm.org/rtc-io/rtc-plugin-temasys.svg)](https://david-dm.org/rtc-io/rtc-plugin-temasys) 

## Example Usage (Capture)

A simple capture example is shown below:

```js
// require the media capture helper from rtc.io
var media = require('rtc-media');

require('cog/logger').enable('*');

// capture the local media, letting rtc-media know it can use
// the temasys plugin
var localMedia = media({
  plugins: [
    require('rtc-plugin-temasys')
  ]
});

// render the media to the document body
localMedia.render(document.body);

```

## Example Usage (Conferencing)

A slightly more complicated example demonstrating conferencing between
machines is displayed below.

```js
var quickconnect = require('rtc-quickconnect');
var media = require('rtc-media');
var qsa = require('fdom/qsa');
var opts = {
  room: 'temasys-conftest',
  plugins: [
    require('rtc-plugin-temasys')
  ]
};

function handleStreamCap(stream) {
  quickconnect('http://rtc.io/switchboard/', opts)
    // broadcast our captured media to other participants in the room
    .addStream(stream)
    // when a peer is connected (and active) pass it to us for use
    .on('call:started', function(id, pc, data) {
      // render the remote streams
      pc.getRemoteStreams().forEach(function(stream) {
        var el = media(stream).render(document.body);

        // set the data-peer attribute of the element
        el.dataset.peer = id;
      });
    })
    // when a peer leaves, remove the media
    .on('call:ended', function(id) {
      // remove video elements associated with the remote peer
      qsa('video[data-peer="' + id + '"]').forEach(function(el) {
        el.parentNode.removeChild(el);
      });
    });
}

media({ plugins: [ require('rtc-plugin-temasys') ]})
  .once('capture', handleStreamCap)
  .render(document.body);

```

## Reference

Documented below is an number of plugin functions that are used to
both determine plugin suitability for a browser / platform and also
ensure that the plugin is correctly loaded into the HTML document.

### supported(platform) => Boolean

The supported function returns true if the platform (as detected using
`rtc-core/detect`) is compatible with the plugin. By doing this prelimenary
detection you can specify a number of plugins to be loaded but only
the first the is supported on the current platform will be used.

### init(opts, callback)

The `init` function is reponsible for ensuring that the current HTML
document is prepared correctly.

### attachStream(stream, bindings)

### prepareElement(opts, element) => HTMLElement

The `prepareElement` function is used to prepare the video container
for receiving a video stream.  If the plugin is able to work with
standard `<video>` and `<audio>` elements then a plugin should simply
not implement this function.

## License(s)

### Apache 2.0

Copyright 2014 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
