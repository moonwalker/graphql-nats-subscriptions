import rimraf from 'rimraf'
import typescript from 'typescript'
import rollupts from 'rollup-plugin-typescript'

rimraf.sync('dist')

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  external: ['graphql-subscriptions', 'iterall', 'nats'],
  plugins: [
    rollupts({
      typescript
    })
  ]
}
