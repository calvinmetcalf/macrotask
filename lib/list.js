
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
export class List {
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
