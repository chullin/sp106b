var U = require('./util')
var next = U.print

// === BNF Grammar =====
// Assign = id '=' Exp
// Exp = T ([+-] T)?     // 問號表示可以出現，或可以不出現(正規表達式) '*' 0次以上或無限 '+' 1次以上一定要出現
                         // Exp T ;或是 Exp T +/- T
// T = F ([*/] F)?       // F 乘除
// F = [0-9] | (Exp)

var idList = ['x', 'y', 'z', 'a', 'b', 'c']

function Assign () {
  id()
  next('=')
  Exp()
  next('\n')
}

function id () {
  next(U.randSelect(idList))
}

function Exp () {
  T()                                
  if (U.randInt(1, 10) <= 5) {       //  T + or - T
    next(U.randChar('+-'))
    T()
  }
}

function T () {
  F()                                // T = F
  if (U.randInt(1, 10) <= 5) {       // F * or /  F
    next(U.randChar('*/'))
    F()
  }
}

function F () {
  if (U.randInt(1, 10) < 7) {
    next(U.randChar('0123456789'))
  } else {
    next('(')
    Exp()
    next(')')
  }
}

for (var i = 0; i < 10; i++) {
  Assign()
}
