var crel = require('crel');
var config = require('./config');
var EventEmitter = require('events').EventEmitter;
var loader = module.exports = new EventEmitter();

// initialise the loader plugin id
var pluginId = loader.pluginId = '__temasys_plugin_' + config.genId();

// initialise the loader pageid
var pageId = loader.pageId = config.genId();

// patch in the onload handler into the window object
window['__load' + pluginId] = function() {
  // deference the window handler
  window['__load' + pluginId] = undefined;

  // if the plugin instance hasn't been bound the abort
  if (! loader.plugin) {
    return;
  }

  // set the plugin page id
  loader.plugin.setPluginId(pageId, pluginId);
  loader.plugin.setLogFunction(console);

  // patch navigator getUserMedia function to the plugin
  navigator.getUserMedia = getUserMedia;
  loader.emit('init');
};

function createPlugin() {
  var plugin = crel('object', {
    width: 0,
    height: 0,
    type: config.mimetype,
    id: pluginId
  });

  var params = [
    { name: 'onload', value: '__load' + pluginId },
    { name: 'pluginId', value: pluginId }
  ];

  // create the plugin parameters
  params.forEach(function(data) {
    plugin.appendChild(crel('param', data));
  });

  // add the plugin to the document body
  document.body.appendChild(plugin);
  return plugin;
}

function getUserMedia(constraints, successCb, failureCb) {
  if (! loader.plugin) {
    return failureCb && failureCb(new Error('plugin not loaded'));
  }

  loader.plugin.getUserMedia.call(
    loader.plugin,
    constraints,
    function(stream) {
      console.log('captured stream: ', stream);
      if (typeof successCb == 'function') {
        successCb(stream);
      }
    },
    function(err) {
      console.log('failed capturing stream: ', err);
      if (typeof failureCb == 'function') {
        failureCb(err);
      }
    }
  );
}

window.addEventListener('load', function() {
  loader.plugin = createPlugin(); // document.querySelector('object[type="' + config.mimetype + '"]');
});
