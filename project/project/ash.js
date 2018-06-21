var fs = require("fs");
var c  = console;
var file = process.argv[2]; // 抓取輸入指令時的第三個指令

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

var symTable = {
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

var symTop = 16;

function addSymbol(symbol) {  // 增加變數或標記
  symTable[symbol] = symTop;
  symTop ++;
}

assemble(file+'.asm', file+'.hack');

function assemble(asmFile, objFile) {    // assemble(輸入, 輸出)
  var asmText = fs.readFileSync(asmFile, "utf8"); // 讀取檔案到 text 字串中    // 第一步驟：讀取文字導
                          
  var lines   = asmText.split(/\r?\n/);  // 將組合語言分割成一行一行            // 第二步驟：拆行變陣列
                        // \r carrige return(回車鍵Enter)  回到開頭
                        // \n 換行
                        //  ? 比對前一個字元，0次或1次
                      // windos 換行為 \r\n 
                      // linux  換行為   \n
                      // split("t")   111t222t333t
                      // -> {111, 222, 333} 以 t 分割 
  c.log(JSON.stringify(lines, null, 2)); // c.log = console.log
     // JSON.stringify(str, null, 2) 使用兩個空格縮排
  pass1(lines);
  pass2(lines, objFile);
} 

function parse(line, i) {
  line.match(/^([^\/]*)(\/.*)?/); // 在正規表達式裡搜索並匹配
        //    ^ 開頭          $ 結尾
        // 比對 ([^\/]*)(\/.*) 0次或1次
        //    比對不要 / 0次或更多次
        //             (\/.*)  
        //               /後面的東西 0次或更多次
        // 刪除註解
  line = RegExp.$1.trim();
  if (line.length===0)
    return null;
  if (line.startsWith("@")) {    // 檢查是否以 @ 為開始
    return { type:"A", arg:line.substring(1).trim() } // ture
                            //  substring(start,stop) :用於提取字符串中介於兩個指定下標之間的字符
                            //               trim() 刪除空格
                            //因為第一個符號是0，是@
  } else if (line.match(/^\(([^\)]+)\)$/)) {   // ex:(LOOP)
                   //      (         )
                   //      比對 不要) 0次或1次以上
                   // ^ 開頭 、  ^   不要
    return { type:"S", symbol:RegExp.$1 } // symbol:符號
                  //       RegExp 為正規表達式的比對結果  $1 的第一區
  } else if (line.match(/^((([AMD]*)=)?([AMD01\+\-\&\|\!]*))(;(\w*))?$/)) {
                      //   [AMD]* AMD 0次或更多                        
                 //  (([AMD]*)=)? AMD = 0次或一次
                 //                    ([AMD01\+\-\&\|\!]*) 
                 //                  A、M、D、0、1、+、-、&、|、!
                 //                                (\w*) 比對數字、字母、底線
                 // A = M
                 // D;JGT
                 // JGT
    return { type:"C", c:RegExp.$4, d:RegExp.$3, j:RegExp.$6 } // compute
                                  // 3 = 等號前面
                // 4 = ([AMD01\+\-\&\|\!]*)
                                                // 6 = (\w*)
  } else {
    throw "Error: line "+(i+1);
  }
}

function pass1(lines) {
  c.log("============== pass1 ================");
  var address = 0;
  for (var i=0; i<lines.length; i++) {
  //      var lines   = asmText.split(/\r?\n/);  一行一行的內容
    var p = parse(lines[i], i);
    if (p===null) continue;
    if (p.type === "S") {
      c.log(" symbol: %s %s", p.symbol, intToStr(address, 4, 10));
 //  console.log
      symTable[p.symbol] = address;
 // 如果是符號，就加進符號表，記住他的位子
      continue;
    } else {
      c.log(" p: %j", p);
    }
    c.log("%s:%s %s", intToStr(i+1, 3, 10), intToStr(address, 4, 10),  lines[i]);
    //                     7+1 ,  008,十進位             0000              @2
    //                     8+1 ,  009,十進位             0001             D=A
    address++;
    console.log("\n");
  }
}

function pass2(lines, objFile) {
  c.log("============== pass2 ================");
  var ws = fs.createWriteStream(objFile);
  ws.once('open', function(fd) {
    var address = 0;
    for (var i=0; i<lines.length; i++) {
      var p = parse(lines[i], i);
      if (p===null || p.type === "S") continue;
      var code = toCode(p);
      c.log("%s:%s %s", intToStr(i+1, 3, 10), intToStr(code, 16, 2),  lines[i]);
      ws.write(intToStr(code, 16, 2)+"\n");
      address++;
    }
    ws.end();
  });
}

function intToStr(num, size, radix) {
//  c.log(" num=" num +1);
  var s = num.toString(radix)+"";
  //        toString(想轉成幾進位)
  while (s.length < size) s = "0" + s;
  return s;
}

function toCode(p) {                          // 最後一步驟：轉成機器碼
  // var p = parse(lines[i], i);
  var address; 
  if (p.type === "A") {
    if (p.arg.match(/^\d+$/)) {
      //        \d+ 比對數字
      address = parseInt(p.arg);
      //  parseInt()可解析一個字符串，並返回一個整数。
    } else {
      address = symTable[p.arg];
      if (typeof address === 'undefined') {
        address = symTop;
        addSymbol(p.arg, address);
        // throw new Error(p.arg + '===undefined')
      }
    }
    return address; 
  } else { // if (p.type === "C")
    var d = dtable[p.d];
    var cx = ctable[p.c];
    var j = jtable[p.j];
    return 0b111<<13|cx<<6|d<<3|j;   // 位移指令
    // 先放入 111 並往左移 13 位，再放入Cx(共7位)往左移6位...以此類推
    // _____________111
    // 111_____________
    // 111___________cx
    // 111cx___________
  }
}
