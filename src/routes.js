import {trick} from './utils';
/**
 * route生成
 * @param pages
 * @param opts
 * @returns {*}
 */
export default (pages, opts) => {
    const {layout = {}, meta:optMeta} = opts;
    const layoutPath = Object.keys(layout).sort((a, b) => a.length < b.length ? 1 : -1);
    const findLayout = (path) => layoutPath.find((_layout) => {
        return path.indexOf(_layout) === 0
    });

    const routes = pages.map((page) => {
        const {entry, path, opts, pkg} = page;
        const {title, meta ={}, name} = opts ||{};
        let urlPath = entry.split('/').map((node) => {
            return node.replace(/^\[([\s\S]*)\]$/i, ':$1').replace(/^_([\s\S]*)$/i, ':$1').toLowerCase();
        }).join('/');

        let rPath = '/' + urlPath;
        //index匹配
        //变量路由
        if (!urlPath.includes('/') && /^:[\s\S]*$/i.test(urlPath)) {
            rPath = '*';
        }
        //index匹配
        if (urlPath === 'index') {  rPath = ''; }
        // todo 目前末尾index 替换。
        if(/\/index$/i.test(rPath)){
            rPath = rPath.replace(/\/index$/i,'');
        }
        return {
            ...opts,
            meta: {
                ...meta,
                title: title || name
            },
            pkg,
            path: rPath,
            name: urlPath.replace(/\//ig, '-'),
            component: path,
        }
    }).sort((a) => {
        // 因为"*"命中最大，所以要排在最后面
        return a.path === '*' ? 1 : -1
    });

    let layoutObj = {};

    return routes.map((route) => {
        if (optMeta) {Object.assign(route.meta, optMeta)}
        const lPath = findLayout(route.path)||'/';
        if(!layoutObj[lPath]){
            return layoutObj[lPath] = {
                path: lPath,
                children: [route],
                layout: layout[lPath],
                name: layout[lPath],
            }
        }
        layoutObj[lPath].children.push(route);
        return false;
    }).filter(Boolean).sort((a, b) => {
        return a.path < b.path ? 1 : -1;
    })
}

/**
 * 根式化route
 * @param routes
 * @returns {string}
 */
export function formatRoutes (routes){
    const routeCode = routes.map((e)=>{
        const {pkg,...others} = e;
        const codes = Object.entries(others).map(([key,value])=>{
            if(key === 'component'){
                if(pkg){
                    return `"component":()=> import(${JSON.stringify(pkg.name)}).then(e=>e.${trick(value)})`
                }
                return `"component":()=> import(${JSON.stringify(value)})`
            }
            if(key === 'children'){
                return `"${key}":${formatRoutes(value)}`;
            }
            return `"${key}":${JSON.stringify(value)}`;
        }).join(',');
        return `{${codes}}`;
    }).join(',\n');
    return `[${routeCode}]`
}