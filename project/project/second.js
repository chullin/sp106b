var fs = require("fs");
var file = process.argv[2];


var dtable = {
  ""   :'000',  // b = binary
  "M"  :'001',
  "D"  :'010',
  "MD" :'011',
  "A"  :'100',
  "AM" :'101',
  "AD" :'110',
  "AMD":'111'
}

var jtable = {
  ""   :'000',
  "JGT":'001',
  "JEQ":'010',
  "JGE":'011',
  "JLT":'100',
  "JNE":'101',
  "JLE":'110',
  "JMP":'111'
}

var ctable = {
  "0"   :'0101010',
  "1"   :'0111111',
  "-1"  :'0111010',
  "D"   :'0001100',
  "A"   :'0110000', 
  "M"   :'1110000',
  "!D"  :'0001101',
  "!A"  :'0110001', 
  "!M"  :'1110001',
  "-D"  :'0001111',
  "-A"  :'0110011',
  "-M"  :'1110011',
  "D+1" :'0011111',
  "A+1" :'0110111',
  "M+1" :'1110111',
  "D-1" :'0001110',
  "A-1" :'0110010',
  "M-1" :'1110010',
  "D+A" :'0000010',
  "D+M" :'1000010',
  "D-A" :'0010011',
  "D-M" :'1010011',
  "A-D" :'0000111',
  "M-D" :'1000111',
  "D&A" :'0000000',
  "D&M" :'1000000',
  "D|A" :'0010101',
  "D|M" :'1010101'
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

var symtop = 16;

function addsymbol(symbol) {
    symbolTable[symbol] = symtop;
    symtop ++;
    //console.log('======================'+symTable[symbol]);
}

     assemble(file+'.asm', file+'.hack');
function assemble(asmFile, objFile) {

  var asmtext = fs.readFileSync(asmFile, "utf8");
  var lines   = asmtext.split(/\r?\n/);
  console.log(JSON.stringify(lines, null, 2));
      fs.writeFileSync(file,asmtext.txt);
      step_one(lines);
      step_two(lines);
      step_three(lines,objFile);
      console.log('\n');
      console.log(symbolTable);  // 檢查用
}

function step_one(lines) {
  for (var i=0; i<lines.length; i++) {
      console.log("%s: %s", inTostring(i+1, 4, 10), lines[i]);
  }
} 


function inTostring(num, size, radix) {
  var convert = num.toString(radix)+"";
  while (convert.length < size) 
    convert = '0' + convert;
  return convert;
}

function parse(line) {
    line.match(/^([^\/]*)/); // 直接讀取非註解的東西
    line = RegExp.$1.trim();
    if (line.length===0)
      return null;
    if (line.startsWith("@")) {    // 檢查是否以 @ 為開始
      line.substring(1).trim();
      return { type:"A", value:line.substring(1).trim() } // line.substring(1).trim() 出來的是字串
    }
    else if (line.match(/\(([^\)]+)\)/)) { 
      return { type:"S", symbol:RegExp.$1 }
    }   
    else if (line.match(/((([AMD]*)=)?([AMD01\+\-\&\|\!]*))(;([A-Z]*))?/)) {
      return { type:"C", comp:RegExp.$4, dest:RegExp.$3, jump:RegExp.$6 }
    }
    else {
      console.log("Error");
    }
  }

function step_two(lines) {
  console.log('-----------------step two------------------');
  var address = 0;
  for (var i=0; i<lines.length; i++) {
    var p = parse(lines[i],i);

    if (p === null) continue;  // 跳過空白行不顯示
    console.log("%s %s ", inTostring(i+1, 3, 10), lines[i]);
    if (p.type === "S"){
      console.log("it's symbol{ type:%s, symbol:%s, address:%s}", p.type, p.symbol, inTostring(address, 4, 10));
      //symbolTable[p.symbol] = address; // 符號放入符號表，為什麼是印address不是接續16
      addsymbol(p.symbol);
    }
    else { // C指令
      console.log("line[%s] : %j", i, p);
    }
    console.log("\n");
    address++;
  }
}

function step_three(lines, objFile) {
  console.log('-----------------step three------------------');
  var ws = fs.createWriteStream(objFile);
  ws.once('open', function(fd) {
    for(var i=0; i<lines.length; i++){
      var p = parse(lines[i],i);
      if (p===null || p.type === "S") continue;
      var code = toCode(p);
      console.log("%s:%s %s", inTostring(i+1, 3, 10), inTostring(code, 16, 2), lines[i]);
      ws.write(inTostring(code, 16, 2)+"\n");
    }
    ws.end();
  });
}

function toCode(p) {
  var digit;
  if(p.type === "A"){
    if(p.value.match(/^\d+/)){ //?
      digit = parseInt(p.value);
    }
    else {
      digit = symbolTable[p.value];
      if(typeof digit === 'undefined'){
        digit = symtop;
        //console.log('digit=',digit);
        //console.log('p.value=',p.value);
        addsymbol(p.value);           //  addsymbol(p.value, digit);  
      }
    }
  return digit;
  }
  else {
    var dcode = dtable[p.dest];
    var ccode = ctable[p.comp];
    var jcode = jtable[p.jump];
    //console.log('dtable[p.dest]='+dtable[p.dest]);
    //console.log('d-------------------------------'+dtable[p.dest]);
    //console.log('c-------------------------------'+ctable[p.comp]);
    //console.log('j-------------------------------'+jtable[p.jump]);
    return 0b111<<13|ccode<<6|dcode<<3|jcode;
    // return '111'+ccode+dcode+jcode;
  }
}