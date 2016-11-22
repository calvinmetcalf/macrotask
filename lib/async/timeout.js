import {Deadline} from './deadline';

export const test =  () => true;

export function install(t) {
  return function () {
    setTimeout(()=>{
      t(new Deadline())
    }, 0);
  };
};
