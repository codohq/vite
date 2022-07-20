import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/main'],
  externals: ['picocolors'],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true
  }
})
