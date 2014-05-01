[![testling status](https://ci.testling.com/calvinmetcalf/macrotask.png)](https://ci.testling.com/calvinmetcalf/macrotask)

**macrotask** is a macrotask library based on [immediate][], and is almost identical except that immediate is a microtask, the difference as [stated by Dominic here][ref]

> The `setImmediate` API, as specified, gives you access to the environment's [task queue][], sometimes known as its "macrotask" queue. This is crucially different from the [microtask queue][] used by web features such as `MutationObserver`, language features such as promises and `Object.observe`, and Node.js features such as `process.nextTick`. Each go-around of the macrotask queue yields back to the event loop once all queued tasks have been processed, even if the macrotask itself queued more macrotasks. Whereas, the microtask queue will continue executing any queued microtasks until it is exhausted.

> In practice, what this means is that if you call `setImmediate` inside of another task queued with `setImmediate`, you will yield back to the event loop and any I/O or rendering tasks that need to take place between those calls, instead of executing the queued task as soon as possible.

[immediate]: https://github.com/calvinmetcalf/immediate
[ref]: https://github.com/YuzuJS/setImmediate#macrotasks-and-microtasks
[task queue]: http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#task-queue
[microtask queue]: http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#perform-a-microtask-checkpoint