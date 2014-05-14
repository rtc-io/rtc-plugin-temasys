// require the media capture helper from rtc.io
var media = require('rtc-media');

// capture the local media, letting rtc-media know it can use
// the temasys plugin
var localMedia = media({
  plugins: [
    require('../')
  ]
});

// render the media to the document body
localMedia.render(document.body);
