## Target
  I wanna make my web framework unify with mini-program, so I rewrite my auto file base routes, it finally use like nuxt or next

## Features

- [ ] file based routes
- [ ] support web framework such as vue,react,
- [ ] support uni-app framework
- [ ] support vite, webpack, rollup, esbuild, vue/cli powered by unplugin
- [ ] typescript support
- [ ] hot reload support in development
- [ ] support multiple modules routers
- [ ] support sub-packages virtual group
- [ ] support unplugin-auto-import

## How to use
### install

```bash
  yarn add --dev unplugin-tw-pages 
```
<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import UnpluginGlob from 'unplugin-glob/vite'

export default defineConfig({
  plugins: [UnpluginGlob()],
})
```
<br></details>


### Configuration

```
  import PagesPlugin from 'unplugin-tw-pages'
  
  PagesPlugin({
    
  })

```

### uni-app use case

### use with autoImport

### 

## Inspire
- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages/tree/main)
- [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import/tree/main)