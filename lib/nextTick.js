import * as setImmediate from './setImmediate';
import * as mutation from './mutation';
import * as postMessage from './postMessage';
import * as messageChannel from './messageChannel';
import * as stateChange from './stateChange';
import * as timeout from './timeout';

var types = [
  setImmediate,
  mutation,
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
