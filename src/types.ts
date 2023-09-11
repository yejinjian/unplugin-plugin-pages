export interface RouteContext {
  root: string,
  scanDirs(): void,
  filter(): boolean  
}


export type OriginTransformer = 'vue'|'react'|'uni'

export interface Transformer  {
  routes: Record<string, any>
  readonly extensions: string[]
  generatePackages: (ctx: RouteContext) => PromiseLike<VueRoute[] | ReactRoute[]>
  generateRoutes: (ctx: RouteContext) => PromiseLike<VueRoute[] | ReactRoute[]>
  
  // stringify: {
  //   dynamicImport?: (importPath: string) => string
  //   component?: (importName: string) => string
  //   final?: (code: string) => string
  // }
}

export interface ExtendOptions {
  routeStyle?: 'next' | 'nuxt' | 'remix'
  exclude?: (string | RegExp)[]
  include?: (string | RegExp)[]
  extensions?: string[]
  layouts?: Record<string, string>
  transform?: Transformer | OriginTransformer
  importMode?: 'async'| 'sync'
  routeBlockLang?: 'json'|'yaml'
  extendRoute?: (route: any, parent: any | undefined) => any | void
  moduleId?: string
  subPackages?: Record<string, string[]>
}


export interface Entry extends ExtendOptions {
  dirs: string | string[],
  name: string,
}

export interface Options extends ExtendOptions {
  entry: string | (Entry|string)[]
  dts?: string | boolean
  
}


