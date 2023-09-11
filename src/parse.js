import {parseComponent} from 'vue-template-compiler';
import JSON5 from 'json5';
import fs from 'fs';

function parseCustomBlock(block, filePath,opts) {
    try {
        return JSON5.parse(block.content.trim())
    } catch (err) {
        throw new Error(`Invalid JSON format of <${block.type}> content in ${filePath}\n${err.message}`)
    }
}

export default (file, opts)=> {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const parsed = parseComponent(content, {
            pad: 'space',
        })
        const block = parsed.customBlocks.find(b=> b.type === 'route');
        if(!block) return;
        return parseCustomBlock(block,file,opts);
    } catch(e) {
        throw e
    }
}


