# rtc-plugin-temasys

This is an experimental plugin for bridging the functionality provided by
the [Temasys IE plugin](http://bit.ly/1lnlEIK) into the rtc.io module
suite.


[![NPM](https://nodei.co/npm/rtc-plugin-temasys.png)](https://nodei.co/npm/rtc-plugin-temasys/)

[![experimental](https://img.shields.io/badge/stability-experimental-red.svg)](https://github.com/dominictarr/stability#experimental) [![Dependency Status](https://david-dm.org/rtc-io/rtc-plugin-temasys.svg)](https://david-dm.org/rtc-io/rtc-plugin-temasys) 

## Example Usage (Capture)

A simple capture example is shown below:

```js
var capture = require('rtc-capture');
var opts = {
  plugins: [ require('rtc-plugin-temasys') ]
};

capture({ video: true, audio: true }, opts, function(err, stream) {
  if (err) {
    return console.error('could not capture stream: ', err);
  }

  console.log('captured stream: ', stream);
  console.log('video tracks: ' + stream.getVideoTracks().length);
  console.log('audio tracks: ' + stream.getAudioTracks().length);
});

```

## Example Usage (Conferencing)

A slightly more complicated example demonstrating conferencing between
machines is displayed below.

```js
var quickconnect = require('rtc-quickconnect');
var media = require('rtc-media');
var qsa = require('fdom/qsa');

var plugins = [
  require('rtc-plugin-temasys')
];

var opts = {
  room: 'temasys-conftest',
  plugins: plugins
};

function handleStreamCap(stream) {
  quickconnect('http://rtc.io/switchboard/', opts)
    // broadcast our captured media to other participants in the room
    .addStream(stream)
    // when a peer is connected (and active) pass it to us for use
    .on('call:started', function(id, pc, data) {
      console.log('call started: ', pc);

      // render the remote streams
      pc.getRemoteStreams().forEach(function(stream) {
        var el = media({ stream: stream, plugins: plugins }).render(document.body);

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

require('cog/logger').enable('*');

media({ plugins: plugins })
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
