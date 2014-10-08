var capture = require('rtc-capture');
var opts = {
  plugins: [ require('../') ]
};

capture({ video: true, audio: true }, opts, function(err, stream) {
  if (err) {
    return console.error('could not capture stream: ', err);
  }

  console.log('captured stream: ', stream);
  console.log('video tracks: ' + stream.getVideoTracks().length);
  console.log('audio tracks: ' + stream.getAudioTracks().length);
});
