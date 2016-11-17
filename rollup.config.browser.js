import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import globals from 'rollup-plugin-node-globals';
let pkg = require('./package.json');
export default {
  entry: 'lib/index.js',
  plugins: [
    globals(),
    babel(babelrc())
  ],
  targets: [{
    dest: pkg['browser'],
    format: 'cjs',
    sourceMap: true
  },
  {
    moduleName: 'macrotask',
    dest: 'macrotask.js',
    format: 'umd'
  }
  ]
};
