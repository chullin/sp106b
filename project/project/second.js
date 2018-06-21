var fs = require("fs");
var c  = console;
var file = process.argv[2];

assemble(file+'.asm', file+'.hack');
function assemble(asmFile, objFile) {
var asmText = fs.readFileSync(asmFile, "utf8");
var lines   = asmText.split(/\r?\n/);
    for (var i=0; i<lines.length; i++) {
        parse(lines[i],i);
    }
}

function parse(line, i) {
    console.log(line.match(/^([^\/]*)/)); // 直接讀取非註解的東西
    line = RegExp.$1.trim();
    if (line.length===0)
      return null;
    if (line.startsWith("@")) {    // 檢查是否以 @ 為開始
      return { type:"A", arg:line.substring(1).trim() } 
    } else if (line.match(/^\(([^\)]+)\)$/)) { 
      return { type:"S", symbol:RegExp.$1 }
    } else if (line.match(/^((([AMD]*)=)?([AMD01\+\-\&\|\!]*))(;(\w*))?$/)) {
      return { type:"C", c:RegExp.$4, d:RegExp.$3, j:RegExp.$6 }
    } else {
      throw "Error: line "+(i+1);
    }
  }
