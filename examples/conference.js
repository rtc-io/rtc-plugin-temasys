var quickconnect = require('rtc-quickconnect');
var media = require('rtc-media');
var qsa = require('fdom/qsa');
var opts = {
  room: 'temasys-conftest',
  plugins: [
    require('../')
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

media({ plugins: [ require('../') ]})
  .once('capture', handleStreamCap)
  .render(document.body);
