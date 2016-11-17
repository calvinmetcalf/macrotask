import * as setImmediate from './async/setImmediate';
import * as postMessage from './async/postMessage';
import * as messageChannel from './async/messageChannel';
import * as stateChange from './async/stateChange';
import * as timeout from './async/timeout';

var types = [
  setImmediate,
  postMessage,
  messageChannel,
  stateChange,
  timeout
];
export default function (drainQueue) {
  for (let type of types) {
    if (type.test()) {
      return type.install(drainQueue);
    }
  }
}
