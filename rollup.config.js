import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

let pkg = require('./package.json');
export default {
  entry: 'lib/index.js',

  targets: [
        {
        dest: pkg['main'],
        format: 'cjs',
        sourceMap: true
      },
      {
        dest: pkg['jsnext:main'],
        format: 'es',
        sourceMap: true
    }
  ]
};
