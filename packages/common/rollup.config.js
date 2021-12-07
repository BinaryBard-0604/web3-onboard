import svelte from 'rollup-plugin-svelte'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import json from '@rollup/plugin-json'
import sveltePreprocess from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript'

const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/index.ts',
  output: {
    format: 'esm',
    dir: 'dist/'
  },
  plugins: [
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(production),
      preventAssignment: true
    }),
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        dev: !production
      },
      emitCss: false
    }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production
    })
  ],
  external: [
    'ethers',
    'bowser',
    'joi',
    'rxjs',
    'svelte-i18n',
    'lodash.merge',
    'lodash.partition'
  ]
}
