class CancelToken{}
function throwStuff(e) {
  throw e;
}
// v8 likes predictible objects
export class Item {
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
