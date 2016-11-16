export const test = () => !process.browser && global && typeof global.setImmediate === 'function';

export const install = func => () => global.setImmediate(func);
