import { defineConfig } from 'rollup'
import ts from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import globals from 'rollup-plugin-node-globals'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import { importExportPlugin } from 'rollup-plugin-import-export'

const config = defineConfig([
  {
    input: ['src/index.ts'],
    output: [
      {
        dir: 'dist/es',
        format: 'es',
        preserveModules: true, // 开启这个选项会将每个模块单独打包，有利于摇树优化
      },
      {
        dir: 'dist/cjs',
        format: 'cjs',
        preserveModules: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      importExportPlugin(),
      ts(),
      getBabelOutputPlugin({
        presets: ['@babel/preset-env'],
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              absoluteRuntime: false,
              // polyfill使用的corejs版本
              // 需要注意这里是@babel/runtime-corejs3 和 preset-env 中是不同的 npm 包
              corejs: 3,
              // 切换对于 @babel/runtime 造成重复的 _extend() 之类的工具函数提取
              // 默认为true 表示将这些工具函数抽离成为工具包引入而不必在每个模块中单独定义
              helpers: true,
              // 切换生成器函数是否污染全局
              // 为true时打包体积会稍微有些大 但生成器函数并不会污染全局作用域
              regenerator: true,
            },
          ],
        ],
      }),
    ],
  },
  // 打包为UMD
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/umd/index.js',
        format: 'umd',
        name: 'dlAnalyicsBrowser',
      },
    ],
    plugins: [
      importExportPlugin(),
      ts(),
      commonjs(),
      resolve({ preferBuiltins: true, mainFields: ['browser'] }),
      globals(),
      terser(),
    ],
  },
  // 打包类型声明
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/types',
      format: 'esm',
      preserveModules: true,
    },
    plugins: [importExportPlugin(), dts()],
  },
])

export default config
