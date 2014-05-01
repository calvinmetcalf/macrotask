exports.install = function (func) {
  if (typeof global.setImmediate === 'function') {
    return function () {
      global.setImmediate(func);
    };
  } else {
    return function () {
      process.nextTick(func);
    };
  }
};