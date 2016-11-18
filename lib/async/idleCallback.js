export const test = () => typeof global.requestIdleCallback === 'function';
export const install = func => () => global.requestIdleCallback(func);
