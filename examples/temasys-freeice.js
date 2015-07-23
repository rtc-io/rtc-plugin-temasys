var RTC = require('rtc');
var crel = require('crel');
var freeice = require('freeice');
var temasys = require('..');

document.body.appendChild(crel('div', crel('div', { id: 'l-video' }), crel('div', { id: 'r-video'})));

var call = RTC({
  constraints: {
    audio: true,
    video: true
  },
  ice: freeice(),
  plugins: [
    temasys
  ],
  options: {}
});