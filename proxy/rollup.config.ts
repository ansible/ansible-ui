import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'main.ts',
  output: {
    file: '../build/proxy.mjs',
    format: 'es',
  },
  plugins: [
    commonjs(),
    nodeResolve({
      preferBuiltins: true,
    }),
    typescript(),
    replace({
      preventAssignment: true,
      values: { 'process.env.NODE_ENV': JSON.stringify('production') },
    }),
    strip({
      include: ['**/*.(ts|js)'],
      functions: ['console.*', 'assert.*', 'logger.trace', 'logger.debug'],
    }),
  ],
};
