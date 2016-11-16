import creatNextTick from './nextTick';
import {Item, cache} from './item';
import {List} from './list';
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
  if (!list.length) {
    inProgress = false;
  } else {
     nextTick();
  }
  task.run();
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
export function run (task, ...args) {
  const item = new Item(task, args);
  cache.set(item.token, item);
  enqueue(item);
  return item.token;
};
export function clear (token) {
  if (cache.has(token)) {
    const item = cache.get(token);
    item.cancel();
    return true;
  }
  return false;
};
