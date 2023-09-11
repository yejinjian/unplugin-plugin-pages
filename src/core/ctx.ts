import type {RouteContext} from '../types'

export function createContext(): RouteContext{
  const caches = new Map()
  const pages = new Set()
  const routes = new Set()
  const subPackages = {}
  const dirs = []
  let root:string = ''
  
  function scanDirs (){
    
  }
  
  function filter (){
    return false;
  }
  
  function generate(){
    
  }
  
  return {
    root,
    scanDirs,
    filter,
    generate
  }
}