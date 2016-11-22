// The test against `importScripts` prevents this implementation from being installed inside a web worker,
// where `global.postMessage` means something completely different and can't be used for this purpose.
import {Deadline} from './deadline';

export function test() {
  if (!global.postMessage || global.importScripts) {
    return false;
  }
  if (global.setImmediate) {
    // we can only get here in IE10
    // which doesn't handel postMessage well
    return false;
  }
  var postMessageIsAsynchronous = true;
  var oldOnMessage = global.onmessage;
  global.onmessage = function () {
    postMessageIsAsynchronous = false;
  };
  global.postMessage('', '*');
  global.onmessage = oldOnMessage;

  return postMessageIsAsynchronous;
};

export function install (func) {
  var codeWord = 'macrotask' + Math.random();
  function globalMessage(event) {
    if (event.source === global && event.data === codeWord) {
      func(new Deadline());
    }
  }
  if (global.addEventListener) {
    global.addEventListener('message', globalMessage, false);
  } else {
    global.attachEvent('onmessage', globalMessage);
  }
  return function () {
    global.postMessage(codeWord, '*');
  };
};
