# Macrotask [![Build Status](https://travis-ci.org/calvinmetcalf/macrotask.svg)](https://travis-ci.org/calvinmetcalf/macrotask)

`npm install macrotask`

**macrotask** is a macrotask library based on [immediate][], and is almost identical except that immediate is a microtask, the difference as [stated by Dominic here][ref]

> The `setImmediate` API, as specified, gives you access to the environment's [task queue][], sometimes known as its "macrotask" queue. This is crucially different from the [microtask queue][] used by web features such as `MutationObserver`, language features such as promises and `Object.observe`, and Node.js features such as `process.nextTick`. Each go-around of the macrotask queue yields back to the event loop once all queued tasks have been processed, even if the macrotask itself queued more macrotasks. Whereas, the microtask queue will continue executing any queued microtasks until it is exhausted.

> In practice, what this means is that if you call `setImmediate` inside of another task queued with `setImmediate`, you will yield back to the event loop and any I/O or rendering tasks that need to take place between those calls, instead of executing the queued task as soon as possible.

The standard as it eventually got codified was that macrotasks were supposed to only get a single task from the queue per cycle instead of emptying the queue and cycling event loop before calling any recursive tasks.

This library ends up splitting the difference by tacking advantage of [requestIdleCallback](idle) when available to run one or more tasks from the queue depending on how long they take, for environments that don't have requestIdleCallback we give ourselves a time limit of 10ms after which we will cycle the event loop before executing more tasks. At least one task will always be executed per loop.

```bash
npm install --save macrotask
```

provides 2 methods, `run` and `clear`, they work just like setImmediate does where run enqueues a task

```js
const task = macrotask.run(function (a, b) {
  console.log(a, b);
}, 'hello', 'there');
// prints hello there
```

and clear cancels it


```js
const task = macrotask.run(function (a, b) {
  console.log(a, b);
}, 'hello', 'there');
macrotask.clear(task);
// does not print anything
```

you can use it via a number of different methods:

```js
// commonjs style in node or browserify
const macrotask = require('macrotask');

// es6 style with rollup or babel
import macrotask from 'macrotask';
// or
import {run, clear} from 'macrotask';
```

or you can just drop the `macrotask.js` or `macrotask.min.js` scripts from the root directory of the repo.

[immediate]: https://github.com/calvinmetcalf/immediate
[ref]: https://github.com/YuzuJS/setImmediate#macrotasks-and-microtasks
[task queue]: http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#task-queue
[microtask queue]: http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#perform-a-microtask-checkpoint
[idle]: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
