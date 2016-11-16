const test = () => !process.browser && global && typeof global.setImmediate === 'function';

const install = func => () => global.setImmediate(func);


var setImmediate = Object.freeze({
	test: test,
	install: install
});

//based off rsvp https://github.com/tildeio/rsvp.js
//license https://github.com/tildeio/rsvp.js/blob/master/LICENSE
//https://github.com/tildeio/rsvp.js/blob/master/lib/rsvp/asap.js

var Mutation = global.MutationObserver || global.WebKitMutationObserver;

const test$1 = () => Mutation && !(global.navigator && global.navigator.standalone) && !global.cordova;

function install$1(handle) {
  var called = 0;
  var observer = new Mutation(handle);
  var element = global.document.createTextNode('');
  observer.observe(element, {
    characterData: true
  });
  return function () {
    element.data = (called = ++called % 2);
  };
}


var mutation = Object.freeze({
	test: test$1,
	install: install$1
});

// The test against `importScripts` prevents this implementation from being installed inside a web worker,
// where `global.postMessage` means something completely different and can't be used for this purpose.

function test$2() {
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

function install$2 (func) {
  var codeWord = 'com.calvinmetcalf.setImmediate' + Math.random();
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
	test: test$2,
	install: install$2
});

function test$3() {
  if (global.setImmediate) {
    // we can only get here in IE10
    // which doesn't handel postMessage well
    return false;
  }
  return typeof global.MessageChannel !== 'undefined';
}

function install$3(func) {
  var channel = new global.MessageChannel();
  channel.port1.onmessage = func;
  return function () {
    channel.port2.postMessage(0);
  };
}


var messageChannel = Object.freeze({
	test: test$3,
	install: install$3
});

const test$4 = () =>
  'document' in global && 'onreadystatechange' in global.document.createElement('script');

const install$4 = handle => function () {

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
	test: test$4,
	install: install$4
});

const test$5 =  () => true;

function install$5(t) {
  return function () {
    setTimeout(t, 0);
  };
}


var timeout = Object.freeze({
	test: test$5,
	install: install$5
});

var types = [
  setImmediate,
  mutation,
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
const cache = new WeakMap();
// v8 likes predictible objects
class Item {
  constructor(fun, array) {
    this.fun = fun;
    this.array = array;
    this.canceled = false;
    this.token = new CancelToken();
  }
  run() {
    if (this.canceled) {
      return false;
    }
    const fun = this.fun;
    const array = this.array;
    let out = false;
    try {
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
          fun.apply(null, array);
          break;
      }
    } catch(e) {
      out = e;
    } finally {
      cache.delete(this.token);
    }
    return out;
  }
  cancel() {
    this.canceled = true;
    cache.delete(this.token);
  }
}

class ListItem {
  constructor(value) {
    this.prev = null;
    this.next = null;
    this.value = value;
  }
}
class IterItem {
  construtor(value, done) {
    this.value = value;
    this.done = !!done;
  }
}
class ListIterator {
  construtor(current) {
    this.current = current;
  }
  next() {
    if (this.current) {
      const current = this.current;
      this.current = this.current.next;
      return IterItem(current.value);
    }
    return IterItem(undefined, true);
  }
}
class List {
  constructor() {
    this.length = 0;
    this.head = null;
    this.tail = null;
  }
  push(value) {
    const item = new ListItem(value);
    if (this.length > 0) {
      const currentTail = this.tail;
      currentTail.next = item;
      item.prev = currentTail;
      this.tail = item;
    } else {
      this.head = this.tail = item;
    }
    this.length++;
    return this.length;
  }
  pop() {
    if (this.length < 1) {
      return;
    }

    const item = this.tail;
    if (this.length === 1) {
        this.head = this.tail = null;
    } else {
      const newTail = item.prev;
      newTail.next = null;
      this.tail = newTail;
    }
    this.length--;
    return item.value;
  }
  unshift(value) {
    const item = new ListItem(value);
    if (this.length > 0) {
      const currentHead = this.head;
      currentHead.prev = item;
      item.next = currentHead;
      this.head = item;
    } else {
      this.head = this.tail = item;
    }
    this.length++;
    return this.length;
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
    return item.value;
  }
  [Symbol.iterator]() {
    return new ListIterator(this.head);
  }
}

const list = new List();
let inProgress = false;
let nextTick;
function drainQueue() {
  if (!list.length) {
    inProgress = false;
    return;
  }
  let task = list.shift();
  while(task.canceled) {
    if (!list.length) {
      inProgress = false;
      return;
    }
    task = list.shift();
  }
  let error = task.run();
  if (!list.length) {
    inProgress = false;
  } else {
     nextTick();
  }
  if (error) {
    throw error;
  }
}
function enqueue(item) {
  list.push(item);
  if (inProgress) {
    return;
  }
  if (!nextTick) {
    nextTick = creatNextTick(drainQueue);
  }
  inProgress = true;
  nextTick();
}
function run (task, ...args) {
  const item = new Item(task, args);
  cache.set(item.token, item);
  enqueue(item);
  return item.token;
}
function clear (token) {
  if (cache.has(token)) {
    const item = cache.get(token);
    item.cancel();
    return true;
  }
  return false;
}

export { run, clear };
//# sourceMappingURL=macrotask.js.map
