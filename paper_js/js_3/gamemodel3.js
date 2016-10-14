
function GameModel(n, m, maxSteps) {
  this.turn = 1
  this.rows = n
  this.cols = m
  this.field = []
  this.colors = ['green', 'red']
  this.initPos = []
  this.flag = 0;
  this.twoArmies =[[],[]]
  this.subscribers = {
    generic:[],
    finishTurn: [],
    startTurn: [],
    finishGame: [],
    heneralActivated: []
  }
  this.ngetfuncs = [
    function(i, j) {
      return {
        "i": i - 1,
        "j": j
      }
    },
    function(i, j) {
      return {
        "i": j%2 + i - 1,
        "j": j +  1
      }
    },
    function(i, j) {
      return {
        "i": j%2 + i,
        "j": j + 1
      }
    },
    function(i, j) {
      return {
        "i": i + 1,
        "j": j
      }
    },
    function(i, j) {
      return {
        "i": j%2 + i,
        "j": j - 1
      }
    },
    function(i, j) {
      return {
        "i": j%2 + i - 1,
        "j": j - 1
      }
    }
  ]

}

GameModel.prototype.cellGeneral = function(cell) {
  for(var henerals of this.twoArmies) {
    for (var heneral of henerals) {
      if ( Object.is(cell, heneral.getCell()) ) return heneral
    }
  }
}

GameModel.prototype.setActiveHeneral = function(heneral) {
  this.activeHeneral = heneral
  this.moves = heneral.moves
  this.notify('generalSet')
}

GameModel.prototype.flipTurn = function() {
  this.turn = this.turn === 1 ? 2:1
  this.beginNewTurn()
  this.notify('startTurn')
  return this.turn
}

GameModel.prototype.getTurn = function() {
  return this.turn
}

GameModel.prototype.getPlIx = function() {
  return this.turn - 1
}

GameModel.prototype.beginNewTurn = function() {
  //1. new General in town for current player
  this.createNewHeneral()
  this.twoArmies[this.getPlIx()].forEach( (i) => i.resetMoves() )
}

GameModel.prototype.createNewHeneral = function() {
  var playerIndex = this.getTurn() - 1;
  var hNum = this.twoArmies[ playerIndex ].length  + 1
  var heneral = new Heneral(this.getCell(this.initPos[playerIndex]), hNum, this.getTurn() )
  this.twoArmies[playerIndex].push(heneral)
  heneral.getCell().notify()
}

GameModel.prototype.makearr = function() {
  var arr = []
  for (var i = 0; i < this.rows; i++) {
    for (var j = 0; j < this.cols; j++) {
      if (!arr[i]) { arr[i] = [];}
      arr[i][j] = new Cell(i, j, this);
      var prob = Math.random()*10;
      if ( prob < 3 ) {
        if (prob > 1) {
          arr[i][j].setRiver();
        } else {
          arr[i][j].setRocks();
        }
      }

    }
  }
  this.field = arr
  this.field.forEach(function(entry) {
     entry.forEach(function(entry) {
        entry.notify()
     })
  })
}

GameModel.prototype.cellSubscribe = function(subscriber, r, c) {
  this.field[r][c].subscribe(subscriber)
}

GameModel.prototype.isInRange = function(i, j) {
  return i >= 0 && i < this.rows && j >= 0 && j < this.cols
}

GameModel.prototype.isCellGray = function(i,j){
  return this.field[i][j].getPlayer() === 0;
}

GameModel.prototype.getNeighbor = function(i, j, n) {
  if (n < 0 || n > 5) return undefined
  if (!this.isInRange(i, j)) return undefined
  var nc = this.ngetfuncs[n](i, j)
  if (this.isInRange(nc.i, nc.j)) return this.field[nc.i][nc.j]
  return undefined
}

GameModel.prototype.isTurnValid = function(player, r, c) {
  if (!this.isInRange(r, c)) return false;
  if (! this.field[r][c].isEmpty()) return false;
  var f = false;
  if(this.field[r][c].getPlayer() === player) return true;
  for (var i = 0; i < 6; i++) {
    var k = this.getNeighbor(r, c, i)
    if (k === undefined) continue;
    if (k.getPlayer() === player) {
      f = true
      break
    }
  }
  return f
}

GameModel.prototype.isTurnExpanding = function(player, r, c){
  if (!this.isInRange(r, c)) return false;
  if (!this.field[r][c].isEmpty()) return false;
  if (this.field[r][c].getPlayer() === player) {
      for(var i = 0; i<6; i++){
        var k = this.getNeighbor(r, c, i);
        if (k === undefined) continue;
        if (k.getPlayer() !== player) return true;
      }
  } else return this.isTurnValid(player, r, c);
}

GameModel.prototype.countOfCells = function(color){
  var r=0;
  for(i=0; i<this.rows; i++){
    for(j=0; j<this.cols; j++){
      if(this.field[i][j].getPlayer() === color){
        r++;
      }
    }
  }
 return r;
}

GameModel.prototype.getWinner = function(){
  var r=0;
  for(i=0; i<this.rows; i++){
    for(j=0; j<this.cols; j++){
       r+=[0,1,-1][this.field[i][j].getPlayer()];
      }
    }
    if(r>0) return 1; else if(r<0) return 2; else return "draw";

}


GameModel.prototype.isGameOver = function(){
  if (this.flag >= step.value * 2) {return true}
  var r=0;
  for(i=0; i<this.rows; i++){
    for(j=0; j<this.cols; j++){
      if(this.isTurnExpanding(this.turn,i,j)){
        return false;
      }
    }
  }


 return true;
}

GameModel.prototype.takeCell = function(player, r, c) {
  this.field[r][c].setPlayer( player )
  this.field[r][c].setCastle()
  for (var i = 0; i < 6; i++) {
    var k = this.getNeighbor(r, c, i)
    if ( k !== undefined && !k.isTown() ) {
      this.field[k.row][k.col].setPlayer(player)
    }
  }
}

GameModel.prototype.setTown = function(player,r,c) {
  this.field[r][c].setPlayer( player )
  this.field[r][c].setTown()
}

GameModel.prototype.setInitPos = function(initPos) {
  this.initPos = initPos;
  this.setTown(2, this.initPos[1].r, this.initPos[1].c)
  this.setTown(1, this.initPos[0].r, this.initPos[0].c)
  this.takeCell(1, this.initPos[0].r, this.initPos[0].c)
  this.takeCell(2, this.initPos[1].r, this.initPos[1].c)
}

GameModel.prototype.getCell = function(cs) {
  return this.field[cs.r][cs.c]
}

GameModel.prototype.makeTurn = function( r, c) {
  if (this.isTurnValid(this.getTurn(), r, c)) {
    this.takeCell(this.getTurn(), r, c)
    this.flag++;
    return true
  }
  return false
}

// receive command Object
//  code
// - 0 to select or move heneral
// - 1 to FlipTurn
// - 2 to build Castle
// -
// params: any params required (optional)
GameModel.prototype.doCommand = function(event) {
  if (event.code === 0) {
    this.selectHeneral(event.params)
  }

  if (event.code === 1) {
    this.flipTurn()
  }

  if (event.code === 2) {
    this.buildCastle()
  }
  this.checkAndNotifyTurnCompleted();
  this.notify('generic')
}

GameModel.prototype.selectHeneral = function(cellCoords) {
  var cell = this.getCell(cellCoords)
  var heneral = this.cellGeneral(cell)
  if (heneral !== undefined && heneral.getPlayer() === this.getTurn()) {
    this.setActiveHeneral( heneral )
    heneral.setActive(true)
    heneral.getCell().notify()
  } else if (this.activeHeneral !== undefined) {
    this.moveHeneralToCell(cell)
  }
}

GameModel.prototype.moveHeneralToCell = function( toCell) {
  if (this.activeHeneral.moves > 0) {
    var oldCell = this.activeHeneral.getCell()
    this.activeHeneral.makeMove(toCell)
    oldCell.notify()
    toCell.notify()
    if (this.activeHeneral.moves === 0) {
      this.activeHeneral = undefined
    }
  }
}

GameModel.prototype.checkAndNotifyTurnCompleted = function () {
  if (this.twoArmies[this.getPlIx()].every((x) => x.isFinished())) {
    this.notify('finishTurn')
  }
}

GameModel.prototype.buildCastle = function() {
  if (this.activeHeneral !== undefined) {
    this.activeHeneral.moves = 0
    var cell = this.activeHeneral.getCell()
    this.removeHeneral(this.activeHeneral)
    this.activeHeneral = undefined
    this.takeCell(this.getTurn(), cell.row, cell.col)
    cell.notify()
    console.log("Super castel build")
  }
}

GameModel.prototype.removeHeneral = function(heneral) {
  var army = this.twoArmies[this.getPlIx()]
  army.splice(army.indexOf(heneral), 1)
}

GameModel.prototype.subscribe = function (event, subscriber) {
  var subs = this.subscribers[event]
  if (subs !== undefined) {
    subs.push(subscriber)
  }
}

GameModel.prototype.notify = function(event) {
    cl = this
    var subs = this.subscribers[event]
    if (subs !== undefined) {
      subs.forEach(function(entry) {
         entry(cl)
      })
    }
  }
