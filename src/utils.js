import path from 'path';
export const clash = (str)=>{
   return str.split(path.sep).join(path.posix.sep)
}

export function trick (path){
   return path.replace(/(\s|-|_|\.|\/)+/ig, '');
}