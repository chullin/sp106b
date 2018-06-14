var fs = require("fs");
var file = process.argv[2];

symTable =[]

var symtop = 0;

function addsymbolTable(symbol) {
    symTable[symbol] = symtop;
    symtop ++;
}

input(file+'.asm', file+'.txt');
function input(infile, outfile) {
    var text = fs.readFileSync(infile,'utf-8');
    var lines = text.split(/\n/);
    console.log(JSON.stringify(lines, null, 2));
    fs.writeFileSync(file,text);
}
