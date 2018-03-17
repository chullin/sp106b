var U = require('./util')
var next = U.print      // next 等於 Print 印出
var p = U.probability

// === BNF Grammar =====
// StmtList = Stmt+
// Stmt = While | Assign
// While = while Exp { StmtList }
// Assign = id '=' Exp
// Exp = T ([+-] T)?
// T = F ([*/] F)?
// F = [0-9a-cx-z] | (Exp)

var level = 0

function indent() {                // 所排
  next(''.padStart(level * 2))     // 印出空白
}

function StmtList () {
  do {
    Stmt()
  } while (p(0.5))    // 0.5 的機率產生
}

function Stmt () {
  if (p(0.5)) {
    While()
  } else {
    indent(); Assign()
  }
}

function While () {
  indent(); next('while ('); Exp(); next(') {\n')   // indent 縮排
  level ++; StmtList(); level --                    // level 層次
  indent(); next('}\n')
}

function Assign () {
  id(); next('='); Exp(); next('\n')
}

var idList = ['x', 'y', 'z', 'a', 'b', 'c']

function id () {
  next(U.randSelect(idList))
}

function Exp () {
  T()
  if (p(0.5)) {
    next(U.randChar('+-'))
    T()
  }
}

function T () {
  F()
  if (p(0.5)) {
    next(U.randChar('*/'))
    F()
  }
}

function F () {
  if (p(0.7)) {
    next(U.randChar('0123456789abcxyz'))
  } else {
    next('('); Exp(); next(')')
  }
}

StmtList()
