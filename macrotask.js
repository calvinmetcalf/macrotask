(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.macrotask = global.macrotask || {})));
}(this, (function (exports) { 'use strict';

var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};

var browser = true;

var test = function test() {
  return !browser && global$1 && typeof global$1.setImmediate === 'function';
};

var install = function install(func) {
  return function () {
    return global$1.setImmediate(func);
  };
};

var setImmediate = Object.freeze({
	test: test,
	install: install
});

// The test against `importScripts` prevents this implementation from being installed inside a web worker,
// where `global.postMessage` means something completely different and can't be used for this purpose.

function test$1() {
  if (!global$1.postMessage || global$1.importScripts) {
    return false;
  }
  if (global$1.setImmediate) {
    // we can only get here in IE10
    // which doesn't handel postMessage well
    return false;
  }
  var postMessageIsAsynchronous = true;
  var oldOnMessage = global$1.onmessage;
  global$1.onmessage = function () {
    postMessageIsAsynchronous = false;
  };
  global$1.postMessage('', '*');
  global$1.onmessage = oldOnMessage;

  return postMessageIsAsynchronous;
}

function install$1(func) {
  var codeWord = 'macrotask' + Math.random();
  function globalMessage(event) {
    if (event.source === global$1 && event.data === codeWord) {
      func();
    }
  }
  if (global$1.addEventListener) {
    global$1.addEventListener('message', globalMessage, false);
  } else {
    global$1.attachEvent('onmessage', globalMessage);
  }
  return function () {
    global$1.postMessage(codeWord, '*');
  };
}

var postMessage = Object.freeze({
	test: test$1,
	install: install$1
});

function test$2() {
  if (global$1.setImmediate) {
    // we can only get here in IE10
    // which doesn't handel postMessage well
    return false;
  }
  return typeof global$1.MessageChannel !== 'undefined';
}

function install$2(func) {
  var channel = new global$1.MessageChannel();
  channel.port1.onmessage = function () {
    return func();
  };
  return function () {
    channel.port2.postMessage(0);
  };
}

var messageChannel = Object.freeze({
	test: test$2,
	install: install$2
});

var test$3 = function test$3() {
  return 'document' in global$1 && 'onreadystatechange' in global$1.document.createElement('script');
};

var install$3 = function install$3(handle) {
  return function () {

    // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
    // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
    var scriptEl = global$1.document.createElement('script');
    scriptEl.onreadystatechange = function () {
      handle();

      scriptEl.onreadystatechange = null;
      scriptEl.parentNode.removeChild(scriptEl);
      scriptEl = null;
    };
    global$1.document.documentElement.appendChild(scriptEl);

    return handle;
  };
};

var stateChange = Object.freeze({
	test: test$3,
	install: install$3
});

var test$4 = function test$4() {
  return true;
};

function install$4(t) {
  return function () {
    setTimeout(t, 0);
  };
}

var timeout = Object.freeze({
	test: test$4,
	install: install$4
});

var test$5 = function test$5() {
  return typeof global$1.requestIdleCallback === 'function';
};
var install$5 = function install$5(func) {
  return function () {
    return global$1.requestIdleCallback(func);
  };
};

var idleCallback = Object.freeze({
	test: test$5,
	install: install$5
});

var types = [setImmediate, idleCallback, postMessage, messageChannel, stateChange, timeout];
var creatNextTick = function (drainQueue) {
  for (var _iterator = types, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var type = _ref;

    if (type.test()) {
      return type.install(drainQueue);
    }
  }
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var CancelToken = function CancelToken() {
  classCallCheck(this, CancelToken);
};

// v8 likes predictible objects
var Item = function () {
  function Item(fun, array, list) {
    classCallCheck(this, Item);

    this.fun = fun;
    this.array = array;
    this.token = new CancelToken();
    this.prev = null;
    this.next = null;
    this.list = list;
  }

  Item.prototype.run = function run() {
    var fun = this.fun;
    var array = this.array;
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
        fun.apply(undefined, array);
        break;
    }
  };

  Item.prototype.cancel = function cancel() {
    var next = this.next;
    var prev = this.prev;
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
  };

  return Item;
}();

var List = function () {
  function List() {
    classCallCheck(this, List);

    this.length = 0;
    this.head = null;
    this.tail = null;
    this.cache = new WeakMap();
  }

  List.prototype.push = function push(func, args) {
    var item = new Item(func, args, this);
    if (this.length > 0) {
      var currentTail = this.tail;
      currentTail.next = item;
      item.prev = currentTail;
      this.tail = item;
    } else {
      this.head = this.tail = item;
    }
    this.length++;
    this.cache.set(item.token, item);
    return item.token;
  };

  List.prototype.shift = function shift() {
    if (this.length < 1) {
      return;
    }
    var item = this.head;
    if (this.length === 1) {
      this.head = this.tail = null;
    } else {
      var newHead = item.next;
      newHead.prev = null;
      this.head = newHead;
    }
    this.length--;
    this.cache.delete(item.token);
    return item;
  };

  List.prototype.cancel = function cancel(token) {
    var item = this.cache.get(token);
    if (item) {
      this.cache.delete(token);
    } else {
      return false;
    }
    item.cancel();
    return true;
  };

  return List;
}();

var list = new List();
var inProgress = false;
var nextTick = void 0;
function drainQueue(idleDeadline) {
  if (!list.length) {
    inProgress = false;
    return;
  }
  var task = list.shift();
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
    var _task = list.shift();
    _task.run();
  }
}

function run$1(task) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var token = list.push(task, args);
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
function clear(token) {
  return list.cancel(token);
}

exports.run = run$1;
exports.clear = clear;

Object.defineProperty(exports, '__esModule', { value: true });

})));
