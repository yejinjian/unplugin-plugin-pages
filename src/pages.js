import glob from "fast-glob";
import Path from "path";
import {createFilter} from "@rollup/pluginutils";
import parseSFC from "./parse";
import {clash} from './utils';

export default class pageManager {
    constructor(opts) {
        let {
            entryDir,
            extensions,
            subPackages,
            ...others
        } = opts;
        this.extensionsReg = extensions ? (extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0]) : '';

        entryDir = (entryDir instanceof Array) ? entryDir : [entryDir];
        entryDir = entryDir.map((dir) => dir && typeof dir === 'string' ? {dir, name: 'default'} : dir);

        this.pages = {}; //后端路由
        this.routes = {}; //前端路由
        this.options = {entryDir, extensions, ...others};
        this.pkgCache = {};
        this._parsePages();
    }

    /**
     * 解析文件目录
     * @private
     */
    _parsePages() {
        const {entryDir, exclude, include} = this.options
        return entryDir.map((entryDir) => {
            return glob.sync(`**/*.${this.extensionsReg}`, {
                cwd: Path.resolve(entryDir.dir),
            }).filter(createFilter(include, exclude)).map((entry) => {
                this.add(entry, entryDir);
            })
        });
    }

    /**
     * 获取文件的路径
     * @param path
     * @returns {null|any}
     */
    getEntryDir(path) {
        const {entryDir, exclude, include} = this.options;
        const isPage = this.isPage(path);
        if (!isPage) return null;
        for (let entry of entryDir) {
            const dirPath = Path.resolve(entry.dir)
            if (path.startsWith(dirPath)) return entry
        }
        return null;
    }

    isPage(path) {
        const {exclude, include, extensions} = this.options;
        const exten = extensions ? (extensions.length > 1 ? `[${extensions.join('|')}]` : extensions[0]) : '*';
        const isPageReg = new RegExp(`.${exten}$`);
        return isPageReg.test(path) && createFilter(include, exclude)(path);
    }

    /**
     * 解析分包
     * @param entry
     * @param url
     * @returns {null}
     * @private
     */
    _parseSubPackage(entry, url){
        const {subPackages, name } = entry;
        if (!subPackages) return
        const pkgMap = this._getPkg(subPackages, name);
        let packageRoots = Object.keys(pkgMap);
        const packageRootsTester = new RegExp(`^(${packageRoots.join('|')})\/`); //子包roots

        const match = url.match(packageRootsTester);
        if(match && match[1]){
            const key = match[1];
            return {
                name: pkgMap[key], //模块别名
                key, //模块
            };
        }
    }

    _getPkg(subPackages, name){
        if(this.pkgCache[name]) return this.pkgCache[name];
        return this.pkgCache[name] = Object.entries(subPackages).reduce((pkg, [key,value])=>{
            value.forEach((i) => {
                if (pkg[i]) {
                    console.warn(`模块[${i}]已经再其它分包[${pkgMap[i]}]中`)
                    return;
                }
                pkg[i] = key;
            });
            return pkg
        },{});
    }

    _parsePath(filePath, entryDir) {
        if (!entryDir) entryDir = this.getEntryDir(filePath)
        if (!entryDir || !entryDir.dir) return {}
        const {dir} = entryDir
        filePath = clash(filePath); //window下转换
        filePath = filePath.split(`${dir}/`).pop();
        const extname = Path.extname(filePath)
        const extension = extname.slice(1)
        return {
            entry: entryDir,
            path: `./${dir}/${filePath}`,
            extname,
            url: filePath.replace(extname, ''),
            extension,
            isHtml: 'html' === extension,
            isVue: 'vue' === extension,
        }
    }

    /**
     * 添加页面
     * @param filePath
     * @param entryDir
     * @returns {{dir}|*|boolean}
     */
    add(filePath, entryDir) {
        const {entry, url, isVue, isHtml, path: pagePath, extension, extname} = this._parsePath(filePath, entryDir);
        if(!entry || !entry.dir) return;
        if (isHtml) {
            this.pages[url] = pagePath;
        } else {
            const {name} = entry;
            if (!this.routes[name]) this.routes[name] = [];
            const opts = isVue ? parseSFC(pagePath, this.options) : {}
            const pkg = this._parseSubPackage(entry, url);
            this.routes[name].push({
                opts,
                entry: url,
                pkg,
                path: clash(pagePath),
                extension
            });
        }
        return entry;
    }

    del(filePath, entryDir) {
        const {entry, url, isHtml, path: pagePath} = this._parsePath(filePath, entryDir);
        if(!entry || !entry.dir) return;
        if (isHtml) {
            delete this.pages[url]
        } else {
            const {name} = entry;
            const index = this.routes[name].findIndex((el) => {
                return el && el.path === pagePath;
            })
            if (index > -1) this.routes[name].splice(index, 1);
        }
        return entry;
    }

    update(filePath, entryDir) {
        const {entry, url, isVue, isHtml, path: pagePath} = this._parsePath(filePath, entryDir);
        if(!entry || !entry.dir) return;
        if (!isHtml) {
            const { name } = entry;
            let index = this.routes[name].findIndex((el) => {
                return el && el.path === pagePath;
            });
            //不是当前路由页面 则不更新
            if (index < 0) return false;
            if (isVue) {
                // vue当<route>更新则触发更新。
                const opts = parseSFC(pagePath, this.options);
                const page = this.routes[name][index];

                if (!opts || (JSON.stringify(opts) === JSON.stringify(page.opts))) {
                    return false;
                }
                this.routes[name][index] = {
                    ...page,
                    opts
                }
            }
        }
        return entry;
    }
}
