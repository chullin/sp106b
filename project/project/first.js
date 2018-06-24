var fs = require("fs");
var file = process.argv[2];

symTable =[]

var symtop = 0;

function symbolTable(symbol) {
    symTable[symbol] = symtop;
    symtop ++;
}

input(file+'.asm', file+'.txt');
function input(infile, outfile) {
    var text = fs.readFileSync(infile,'utf-8');
    var lines = text.split(/\r?\n/);
    console.log(JSON.stringify(lines, null, 2));
    fs.writeFileSync(file,text.txt);
    step_one(lines);
}

function step_one(lines) {
    for (var i=0; i<lines.length; i++) {
        console.log("%s: %s", intTostring(i+1, 4, 10), lines[i]);
    }
} 

function intTostring(num, size, radix) {
  var x = num.toString(radix)+ " "
  while (x.length < size) x = "0"+ x;
  return x;
}