class CancelToken{}
function throwStuff(e) {
  throw e;
}

export const cache = new WeakMap();
// v8 likes predictible objects
export class Item {
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
