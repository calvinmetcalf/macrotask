import {Deadline} from './deadline';
export function test() {
  if (global.setImmediate) {
    // we can only get here in IE10
    // which doesn't handel postMessage well
    return false;
  }
  return typeof global.MessageChannel !== 'undefined';
};

export function install(func) {
  var channel = new global.MessageChannel();
  channel.port1.onmessage = ()=>func(new Deadline());
  return function () {
    channel.port2.postMessage(0);
  };
};
