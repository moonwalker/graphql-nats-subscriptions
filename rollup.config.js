import rimraf from 'rimraf'
import typescript from 'rollup-plugin-typescript2'

rimraf.sync('lib')

export default {
  input: 'src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'cjs'
  },
  external: ['graphql-subscriptions', 'iterall', 'nats'],
  plugins: [
    typescript()
  ]
}
