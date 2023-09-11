import { createUnplugin } from 'unplugin'

export default createUnplugin((options) => {
  
  return {
    name: 'unplugin-plugin-pages',
    enforce: 'pre',
    transformInclude(id) {
      // return ctx.filter(id)
    },
    async transform(code, id) {
      // return ctx.transform(code, id)
    },
    async buildStart() {
      // await ctx.scanDirs()
    },
    async buildEnd() {
      // await ctx.writeConfigFiles()
    },
    vite: {
      async handleHotUpdate({ file }) {
        // if (ctx.dirs?.some(glob => minimatch(slash(file), slash(glob))))
        //   await ctx.scanDirs()
      },
      async configResolved(config) {
        // if (ctx.root !== config.root) {
        //   ctx = createContext(options, config.root)
        //   await ctx.scanDirs()
        // }
      },
    },
  }
})