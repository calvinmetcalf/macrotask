var test = require('prova');
var macrotask = require("..");

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
test("test arguments", function (t) {
    t.test('one', function (t) {
      t.plan(1);
      macrotask.run(function (num) {
        t.equals(num, 7, 'correct number 1');
      }, 7);
    });
    t.test('two', function (t) {
      t.plan(2);
      macrotask.run(function (a, b) {
        t.equals(a, 7, 'correct number 1');
        t.equals(b, 12, 'correct number 2');
      }, 7, 12);
    });
    t.test('three', function (t) {
      t.plan(3);
      macrotask.run(function (a, b, c) {
        t.equals(a, 7, 'correct number 1');
        t.equals(b, 12, 'correct number 2');
        t.equals(c, 24, 'correct number 3');
      }, 7, 12, 24);
    });
    t.test('four', function (t) {
      t.plan(4);
      macrotask.run(function (a, b, c, d) {
        t.equals(a, 7, 'correct number 1');
        t.equals(b, 12, 'correct number 2');
        t.equals(c, 24, 'correct number 3');
        t.equals(d, 57, 'correct number 4');
      }, 7, 12, 24, 57);
    });
    t.test('five', function (t) {
      t.plan(5);
      macrotask.run(function (a, b, c, d, e) {
        t.equals(a, 7, 'correct number 1');
        t.equals(b, 12, 'correct number 2');
        t.equals(c, 24, 'correct number 3');
        t.equals(d, 57, 'correct number 4');
        t.equals(e, 74, 'correct number 5');
      }, 7, 12, 24, 57, 74);
    });
});
test('more cancelations', function (t) {
  t.test('cancel first one', function (t) {
    t.plan(3);
    var toCancel = macrotask.run(function () {
      t.ok(false, 'should not run');
    });
    macrotask.run(function () {
     t.ok(true, 'first should run');
   });
   macrotask.run(function () {
    t.ok(true, 'seccond should run');
  });
  macrotask.run(function () {
   t.ok(true, 'third should run');
 });
 macrotask.clear(toCancel);
  })
  t.test('cancel seccond one', function (t) {
    t.plan(3);

    macrotask.run(function () {
     t.ok(true, 'first should run');
   });
   var toCancel = macrotask.run(function () {
     t.ok(false, 'should not run');
   });
   macrotask.run(function () {
    t.ok(true, 'seccond should run');
  });
  macrotask.run(function () {
   t.ok(true, 'third should run');
 });
 macrotask.clear(toCancel);
  });
  t.test('cancel third one', function (t) {
    t.plan(3);

    macrotask.run(function () {
     t.ok(true, 'first should run');
   });

   macrotask.run(function () {
    t.ok(true, 'seccond should run');
  });
  var toCancel = macrotask.run(function () {
    t.ok(false, 'should not run');
  });
  macrotask.run(function () {
   t.ok(true, 'third should run');
 });
 macrotask.clear(toCancel);
  });
  t.test('cancel last one', function (t) {
    t.plan(3);

    macrotask.run(function () {
     t.ok(true, 'first should run');
   });

   macrotask.run(function () {
    t.ok(true, 'seccond should run');
  });

  macrotask.run(function () {
   t.ok(true, 'third should run');
 });
 var toCancel = macrotask.run(function () {
   t.ok(false, 'should not run');
 });
 macrotask.clear(toCancel);
  });
  t.test('cancel inside', function (t) {
    t.plan(3);

    macrotask.run(function () {
     t.ok(true, 'first should run');
      macrotask.clear(toCancel);
   });
   var toCancel = macrotask.run(function () {
     t.ok(false, 'should not run');
   });
   macrotask.run(function () {
    t.ok(true, 'seccond should run');
  });

  macrotask.run(function () {
   t.ok(true, 'third should run');
 });


  });
})
if (!process.browser) {
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
}
if (process.browser && typeof Worker !== 'undefined') {
  test("worker", function (t) {
    var worker = new Worker('./assets/in/test/worker.js');
    worker.onmessage = function (e) {
      t.equal(e.data, 'pong');
      worker.terminate();
      t.end();
    };
    worker.postMessage('ping');
  });
  test("worker errors", function (t) {
    var worker = new Worker('./assets/in/test/worker.js');
    worker.onmessage = function (e) {
      t.deepEqual(e.data, [0,1,2,3,4,5]);
      worker.terminate();
      t.end();
    };
    worker.postMessage('errorTest');
  });
}
