var capture = require('rtc-capture');
var attach = require('rtc-attach');
var opts = {
  plugins: [ require('../') ]
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
