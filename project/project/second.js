var fs = require("fs");
var file = process.argv[2];


var dtable = {
  ""   :0b000,  // b = binary
  "M"  :0b001,
  "D"  :0b010,
  "MD" :0b011,
  "A"  :0b100,
  "AM" :0b101,
  "AD" :0b110,
  "AMD":0b111
}

var jtable = {
  ""   :0b000,
  "JGT":0b001,
  "JEQ":0b010,
  "JGE":0b011,
  "JLT":0b100,
  "JNE":0b101,
  "JLE":0b110,
  "JMP":0b111
}

var ctable = {
  "0"   :0b0101010,
  "1"   :0b0111111,
  "-1"  :0b0111010,
  "D"   :0b0001100,
  "A"   :0b0110000, 
  "M"   :0b1110000,
  "!D"  :0b0001101,
  "!A"  :0b0110001, 
  "!M"  :0b1110001,
  "-D"  :0b0001111,
  "-A"  :0b0110011,
  "-M"  :0b1110011,
  "D+1" :0b0011111,
  "A+1" :0b0110111,
  "M+1" :0b1110111,
  "D-1" :0b0001110,
  "A-1" :0b0110010,
  "M-1" :0b1110010,
  "D+A" :0b0000010,
  "D+M" :0b1000010,
  "D-A" :0b0010011,
  "D-M" :0b1010011,
  "A-D" :0b0000111,
  "M-D" :0b1000111,
  "D&A" :0b0000000,
  "D&M" :0b1000000,
  "D|A" :0b0010101,
  "D|M" :0b1010101
}

var symbolTable = {
  "R0"  :0,
  "R1"  :1,
  "R2"  :2,
  "R3"  :3,
  "R4"  :4,
  "R5"  :5,
  "R6"  :6,
  "R7"  :7,
  "R8"  :8,
  "R9"  :9,
  "R10" :10,
  "R11" :11,
  "R12" :12,
  "R13" :13,
  "R14" :14,
  "R15" :15,
  "SP"  :0,
  "LCL" :1,
  "ARG" :2,
  "THIS":3, 
  "THAT":4,
  "KBD" :24576,
  "SCREEN":16384
};


symTable =[]

var symtop = 0;

function symbolTable(symbol) {
    symTable[symbol] = symtop;
    symtop ++;
}

     assemble(file+'.asm', file+'.hack');
function assemble(asmFile, objFile) {
  var asmtext = fs.readFileSync(asmFile, "utf8");
  var lines   = asmtext.split(/\r?\n/);
  console.log(JSON.stringify(lines, null, 2));
      fs.writeFileSync(file,text);
      step_one(lines);
      step_two(lines);
}

function step_one(lines) {
  for (var i=0; i<lines.length; i++) {
      console.log("%s: %s", intTostring(i+1, 4, 10), lines[i]);
  }
} 

function parse(line, i) {
    line.match(/^([^\/]*)/); // 直接讀取非註解的東西
    line = RegExp.$1.trim();
    if (line.length===0)
      return null;
    if (line.startsWith("@")) {    // 檢查是否以 @ 為開始
      console.log(line.substring(1).trim());
      return { type:"A", value:line.substring(1).trim() } 
    }
    else if (line.match(/\(([^\)]+)\)/)) { 
      return { type:"S", symbol:RegExp.$1 }
    }   
    else if (line.match(/(([AMD]=)?([AMD01\+\-\&\|]*))(;([A-Z]*))?/)) {
      return { type:"C", comp:RegExp.$4, dest:RegExp.$3, jump:RegExp.$6 }
    }
    else {
      console.log("Error");
    }
  }

function step_two(lines) {
  console.log('---------------------------------');
  var address = 0;
  for (var i=0; i<lines.length; i++) {
    var p = parse(lines[i],i);
    if(p === "S"){
      console.log("it's symbol: %s %s %s", p.type, p.symbol, inTostring(address, 4, 10));
      symbolTable
    }
  }
}

function inTostring(num, size, radix) {
  var convert = num.toString(radiz)+"";
  while (convert.length < size) 
    convert = '0' + convert;
  return convert;
}