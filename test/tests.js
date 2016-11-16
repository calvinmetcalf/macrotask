var test = require('tape');
var macrotask = require("../dist/macrotask.cjs.js");

test("Handlers do execute", function (t) {
    macrotask.run(function () {
        t.ok(true, 'handler executed');
        t.end();
    });
});

test("Handlers do not execute in the same event loop turn as the call to `setImmediate`", function (t) {
    var handlerCalled = false;
    function handler() {
        handlerCalled = true;
        t.ok(true, 'handler called');
        t.end();
    }

    macrotask.run(handler);
    t.notOk(handlerCalled);
});

test("passes through an argument to the handler", function (t) {
    var expectedArg = { expected: true };

    function handler(actualArg) {
        t.equal(actualArg, expectedArg);
        t.end();
    }

    macrotask.run(handler, expectedArg);
});

test("passes through two arguments to the handler", function (t) {
    var expectedArg1 = { arg1: true };
    var expectedArg2 = { arg2: true };

    function handler(actualArg1, actualArg2) {
        t.equal(actualArg1, expectedArg1);
        t.equal(actualArg2, expectedArg2);
        t.end();
    }

    macrotask.run(handler, expectedArg1, expectedArg2);
});

test("witin the same event loop turn prevents the handler from executing", function (t) {
    var handlerCalled = false;
    function handler() {
        handlerCalled = true;
    }

    var handle = macrotask.run(handler);
    macrotask.clear(handle);

    setTimeout(function () {
        t.notOk(handlerCalled);
        t.end();
    }, 100);
});

test("does not interfere with handlers other than the one with ID passed to it", function (t) {
    var expectedArgs = ["A", "D"];
    var recordedArgs = [];
    function handler(arg) {
        recordedArgs.push(arg);
    }

    macrotask.run(handler, "A");
    macrotask.clear(macrotask.run(handler, "B"));
    var handle = macrotask.run(handler, "C");
    macrotask.run(handler, "D");
    macrotask.clear(handle);

    setTimeout(function () {
        t.deepEqual(recordedArgs, expectedArgs);
        t.end();
    }, 100);
});

test("big test", function (t) {
    //mainly for optimizition testing
    var i = 1000;
    function doStuff() {
        i--;
        if(!i) {
            t.ok(true, 'big one works');
            t.end();
        } else {
            macrotask.run(doStuff);
        }
    }
    macrotask.run(doStuff);
});
test('test errors', function (t) {
  t.plan(7);
  var order = 0;
  process.once('uncaughtException', function(err) {
      t.ok(true, err.message);
      t.equals(2, order++, 'error is third');
      macrotask.run(function () {
        t.equals(5, order++, 'schedualed in error is last');
      });
  });
  macrotask.run(function (num1, num2) {
    t.equals(num1, order++, 'first one works');
    macrotask.run(function (num) {
      t.equals(num, order++, 'recursive one is 4th');
    }, num2);
  }, 0, 4);
  macrotask.run(function () {
    t.equals(1, order++, 'second one starts');
    var err = new Error('an error is thrown');

    err.code ='EPIPE';
    err.errno = 'EPIPE';
    err.syscall = 'write';
    throw err;
  });
  macrotask.run(function () {
    t.equals(3, order++, '3rd schedualed happens after the error');
  });
});
if (process.browser && typeof Worker !== 'undefined') {
  test("worker", function (t) {
    var worker = new Worker('./test/worker.js');
    worker.onmessage = function (e) {
      t.equal(e.data, 'pong');
      t.end();
    };
    worker.postMessage('ping');
  });
}
