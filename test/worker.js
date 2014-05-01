importScripts('../dist/macrotask.js');
self.onmessage = function (e) {
  if (e.data === 'ping') {
    macrotask(function () {
      self.postMessage('pong');
    });
  }
};