const test = () => !process.browser && global && typeof global.setImmediate === 'function';

const install = func => () => global.setImmediate(func);


var setImmediate = Object.freeze({
	test: test,
	install: install
});

// The test against `importScripts` prevents this implementation from being installed inside a web worker,
// where `global.postMessage` means something completely different and can't be used for this purpose.

function test$1() {
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
}

function install$1 (func) {
  var codeWord = 'macrotask' + Math.random();
  function globalMessage(event) {
    if (event.source === global && event.data === codeWord) {
      func();
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
}


var postMessage = Object.freeze({
	test: test$1,
	install: install$1
});

function test$2() {
  if (global.setImmediate) {
    // we can only get here in IE10
    // which doesn't handel postMessage well
    return false;
  }
  return typeof global.MessageChannel !== 'undefined';
}

function install$2(func) {
  var channel = new global.MessageChannel();
  channel.port1.onmessage = ()=>func();
  return function () {
    channel.port2.postMessage(0);
  };
}


var messageChannel = Object.freeze({
	test: test$2,
	install: install$2
});

const test$3 = () =>
  'document' in global && 'onreadystatechange' in global.document.createElement('script');

const install$3 = handle => function () {

    // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
    // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
    var scriptEl = global.document.createElement('script');
    scriptEl.onreadystatechange = function () {
      handle();

      scriptEl.onreadystatechange = null;
      scriptEl.parentNode.removeChild(scriptEl);
      scriptEl = null;
    };
    global.document.documentElement.appendChild(scriptEl);

    return handle;
  };


var stateChange = Object.freeze({
	test: test$3,
	install: install$3
});

const test$4 =  () => true;

function install$4(t) {
  return function () {
    setTimeout(t, 0);
  };
}


var timeout = Object.freeze({
	test: test$4,
	install: install$4
});

const test$5 = () => typeof global.requestIdleCallback === 'function';
const install$5 = func => () => global.requestIdleCallback(func);


var idleCallback = Object.freeze({
	test: test$5,
	install: install$5
});

const types = [
  setImmediate,
  idleCallback,
  postMessage,
  messageChannel,
  stateChange,
  timeout
];
var creatNextTick = function (drainQueue) {
  for (let type of types) {
    if (type.test()) {
      return type.install(drainQueue);
    }
  }
};

class CancelToken{}
// v8 likes predictible objects
class Item {
  constructor(fun, array, list) {
    this.fun = fun;
    this.array = array;
    this.token = new CancelToken();
    this.prev = null;
    this.next = null;
    this.list = list;
  }
  run() {
    const fun = this.fun;
    const array = this.array;
    switch (array.length) {
      case 0:
        fun();
        break;
      case 1:
        fun(array[0]);
        break;
      case 2:
        fun(array[0], array[1]);
        break;
      case 3:
        fun(array[0], array[1], array[2]);
        break;
      default:
        fun(...array);
        break;
    }
  }
  cancel() {
    const next = this.next;
    const prev = this.prev;
    if (next === null) {
      if (prev === null) {
        // only thing on list
        if (this.list.head === this && this.list.length === 1) {
          // sanity check
          this.list.head = this.list.tail = null;
        } else {
          return;
        }
      } else {
        prev.next = null;
        this.list.tail = prev;
        // tail of list
      }
    } else {
      if (prev === null) {
        // head of list
        next.prev = null;
        this.list.head = next;
      } else {
        // middle of list
        prev.next = next;
        next.prev = prev;
      }
    }
    this.list.length--;
  }
}

class List {
  constructor() {
    this.length = 0;
    this.head = null;
    this.tail = null;
    this.cache = new WeakMap();
  }
  push(func, args) {
    const item = new Item(func, args, this);
    if (this.length > 0) {
      const currentTail = this.tail;
      currentTail.next = item;
      item.prev = currentTail;
      this.tail = item;
    } else {
      this.head = this.tail = item;
    }
    this.length++;
    this.cache.set(item.token, item);
    return item.token;
  }
  shift() {
    if (this.length < 1) {
      return;
    }
    const item = this.head;
    if (this.length === 1) {
        this.head = this.tail = null;
    } else {
      const newHead = item.next;
      newHead.prev = null;
      this.head = newHead;
    }
    this.length--;
    this.cache.delete(item.token);
    return item;
  }
  cancel(token) {
    const item = this.cache.get(token);
    if (item) {
      this.cache.delete(token);
    } else {
      return false;
    }
    item.cancel();
    return true;
  }
}

const list = new List();
let inProgress = false;
let nextTick;
function drainQueue(idleDeadline) {
  if (!list.length) {
    inProgress = false;
    return;
  }
  let task = list.shift();
  if (!list.length) {
    inProgress = false;
  } else {
    nextTick();
  }
  task.run();
  if (!idleDeadline) {
    return;
  }
  while (idleDeadline.timeRemaining() > 0 && list.length) {
    let task = list.shift();
    task.run();
  }
}

function run (task, ...args) {
  const token = list.push(task, args);
  if (inProgress) {
    return token;
  }
  if (!nextTick) {
    nextTick = creatNextTick(drainQueue);
  }
  inProgress = true;
  nextTick();
  return token;
}
function clear (token) {
  return list.cancel(token);
}

export { run, clear };
//# sourceMappingURL=macrotask.js.map
