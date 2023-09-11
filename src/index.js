import Page from './pages';
import generateRoutes, {formatRoutes} from './routes';
import {trick} from './utils';

export const ROUTE_REG = new RegExp("^routes::(.+)$", 'i');
const routeCache = new Map();
const packageCache = {};
const packagePrefix= "pkg::";
const defaultOpts = {
    exclude: [/node_modules/i, /(component|module|style)s?\//i, /.git/],
    entryDir: ['./pages'],
    extensions: ['vue'],
    layout: { '/': 'default' },
    meta: {}
}

/**
 *
 * @param opts
 * @returns {{code: string, map: null}|string|*|{transformIndexHtml(*, *), transform(*, *): Promise<undefined|{code: string, map: null}>, load(*): Promise<any|string|undefined>, configureServer(*): void, name: string, resolveId(*, *, *): (*|null), enforce: string, configResolved(*=): void}|null}
 */
export default (opts) => {
    opts = Object.assign({}, defaultOpts, opts);
    let pageManager = null;
    let server;

    return {
        name: 'vite:pages',
        enforce: 'pre',
        configResolved(resolvedConfig = {}) {
            if (!opts.root) opts.root = resolvedConfig.root;
            pageManager = new Page(opts);
            const {pages} = pageManager;
            //后端路由添加
            if (Object.keys(pages).length > 0) {
                let {input} = resolvedConfig.build.rollupOptions;
                resolvedConfig.build.rollupOptions.input = {...input, ...pages};
            }
        },
        configureServer(_server) {
            const {ws, watcher, moduleGraph} = _server
            server = _server;

            function reLoadModule(name) {
                const moduleName = `routes::${name}`;
                const module = moduleGraph.getModuleById(moduleName);
                if (module) {
                    moduleGraph.invalidateModule(module)
                    ws.send({type: 'full-reload'})
                    return true;
                }
                return false;
            }

            watcher.on('add', async (file) => {
                const entry = pageManager.add(file);
                if (entry && entry.name) {
                    routeCache.delete(entry.name);
                    reLoadModule(entry.name);
                }
            })
            watcher.on('unlink', (file) => {
                const entry = pageManager.del(file);
                if (entry && entry.name) {
                    routeCache.delete(entry.name);
                    reLoadModule(entry.name);
                }
            })
            watcher.on('change', async (file) => {
                const entry = pageManager.update(file);
                if (entry && entry.name) {
                    routeCache.delete(entry.name);
                    reLoadModule(entry.name);
                }
            })
        },
        resolveId(id) {
            if (ROUTE_REG.test(id) || packageCache[id]) {
                return id;
            }
            return null;
        },
        async load(id) {
            if (ROUTE_REG.test(id)) {
                const key = id.replace(ROUTE_REG, '$1');
                let route = routeCache.get(key);
                if (route) return route;
                const {routes} = pageManager;
                const curRoute = routes[key];
                route = generateRoutes(curRoute, opts);

                curRoute.map((e)=>{
                    const {pkg, path} = e
                    if(pkg){
                        const {key, name} = pkg;
                        if(!packageCache[name]) packageCache[name] = [];
                        packageCache[name].push({
                            key,
                            component: path,
                        })
                    }
                })
                const routeCode = `export default ${formatRoutes(route)};`
                routeCache.set(key, routeCode);
                return routeCode;
            }

            if(packageCache[id]){
                const pkg = packageCache[id];
                return pkg.map(({key,component})=>{
                    return `export { default as ${trick(component)} } from '${component}';`
                }).join('\n');
            }
        },
        async transform(code, id) {
            if (!/vue&type=route/.test(id)) return;
            return {
                code: 'export default {};',
                map: null,
            }
        }
    }

}
