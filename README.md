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
var attach = require('rtc-attach');
var opts = {
  plugins: [ require('rtc-plugin-temasys') ]
};

capture({ video: true, audio: true }, opts, function(err, stream) {
  if (err) {
    return console.error('could not capture stream: ', err);
  }

  attach(stream, opts, function(err, el) {
    if (err) {
      return console.error('could not attach stream: ', err);
    }

    document.body.appendChild(el);
  });
});

```

For a more detailed example (which includes video conferencing, please have
a look at our [helloworld demo](https://github.com/rtc-io/demo-helloworld) which
can be easily modified to use our Temasys plugin layer.

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
