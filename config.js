exports.mimetype = 'application/x-temwebrtcplugin';

exports.genId = function() {
  return Math.random().toString(36).slice(2);
};
