import {Item} from './item';

export class List {
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
