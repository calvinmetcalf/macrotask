export const test =  () => true;

export function install(t) {
  return function () {
    setTimeout(t, 0);
  };
};
