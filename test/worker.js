importScripts('../macrotask.js');
self.onmessage = function (e) {
  if (e.data === 'ping') {
    macrotask.run(function () {
      self.postMessage('pong');
    });
  } else if (e.data === 'errorTest') {
    runErr();
  }
};
function runErr() {
  var out = [];

  self.onerror = function () {
    out.push(order++);
    self.onerror = null;
    macrotask.run(function () {
      out.push(order++);
      self.postMessage(out);
    });
  }
  var order = 0;
  macrotask.run(function (num1, num2) {
    out.push(num1);
    order++;
    macrotask.run(function (num) {
      out.push(num);
      order++;
    }, num2);
  }, 0, 4);
  macrotask.run(function () {
    out.push(order++);
    var err = new Error('an error is thrown');

    err.code ='EPIPE';
    err.errno = 'EPIPE';
    err.syscall = 'write';
    throw err;
  });
  macrotask.run(function () {
    out.push(order++);
  });
}
