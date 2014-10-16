var quickconnect = require('rtc-quickconnect');
var capture = require('rtc-capture');
var attach = require('rtc-attach');
var qsa = require('fdom/qsa');

var plugins = [
  require('../')
];

var opts = {
  room: 'temasys-conftest',
  plugins: plugins
};

function handleStreamCap(stream) {
  quickconnect('https://switchboard.rtc.io/', opts)
    // broadcast our captured media to other participants in the room
    .addStream(stream)
    // when a peer is connected (and active) pass it to us for use
    .on('call:started', function(id, pc, data) {
      console.log('call started: ', pc);

      // render the remote streams
      pc.getRemoteStreams().forEach(function(stream) {
        attach(stream, opts, function(err, el) {
          if (err) {
            return console.error('could not attach stream: ', err);
          }

          el.dataset.peer = id;
          document.body.appendChild(el);
        });
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

capture({ video: true, audio: true }, opts, function(err, stream) {
  if (err) {
    return console.error('Could not capture stream: ', err);
  }

  handleStreamCap(stream);
});
