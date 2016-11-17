import creatNextTick from './nextTick';
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
  if (!list.length) {
    inProgress = false;
  } else {
     nextTick();
  }
  task.run();
}

export function run (task, ...args) {
  const token = list.push(task, args);
  if (inProgress) {
    return token;
  }
  if (!nextTick) {
    nextTick = creatNextTick(drainQueue);
  }
  inProgress = true;
  nextTick();
  return token;
};
export function clear (token) {
  return list.cancel(token);
};
