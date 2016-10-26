function GameModel(n, m, maxSteps) {
  this.turn = 1
  this.rows = n
  this.cols = m
  this.field = []
  this.colors = ['green', 'red']
  this.initPos = []
  this.flag = 0;
  this.maxSteps = maxSteps;
  this.twoArmies =[[],[]]
  this.subscribers = {
    generic:[],
    finishTurn: [],
    startTurn: [],
    finishGame: [],
    heneralActivated: [],
    errors: [],
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

//666
GameModel.prototype.getPlayerIndex = function() {
  return this.turn - 1
}

GameModel.prototype.beginNewTurn = function() {
  //1. new General in town for current player
  this.createNewHeneral()
  this.twoArmies[this.getPlayerIndex()].forEach( (i) => i.resetMoves() )
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
      // if( this.field[i][j].isNoones()
      //     && this.field[i][j].getHeneral() !== undefined
      //     && this.field[i][j].getHeneral().player === color ){
      //   r++;
      // }
    }
  }

  r += this.getArmy(color).filter( (x) => { return x.getCell().isNoones(); } ).length;
 return r;
}

GameModel.prototype.getArmy = function(player) {
  // if (player < 1 || player > 2 ) throw new Error('Impossible')
  return this.twoArmies[player - 1];
}

//changed logic for get
GameModel.prototype.getWinner = function(){
  var c1 = this.countOfCells(1);
  var c2 = this.countOfCells(2);
  return {
    c1: c1,
    c2: c2,
    winner: ( c1 === c2 ?0: (c1>c2?1:2) )
  }
}


GameModel.prototype.isGameOver = function(){
  console.log(this.maxSteps);
  if (this.flag >= this.maxSteps * 2) {return true}
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

//666
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

GameModel.prototype.makeTurn = function(r, c) {
  if (this.isTurnValid(this.getTurn(), r, c)) {
    this.takeCell(this.getTurn(), r, c)
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
//666
GameModel.prototype.doCommand = function(event) {
  if (event.code === 1) {
    this.flipTurn();
  } else {
    if(this.isTurnComplited()){
      return undefined;
    }
    if (event.code === 0) {
      this.cellActionRouter(event.params);
    }
    if (event.code === 2) {
      this.buildCastle();
    }
    this.checkAndNotifyTurnCompleted();
    this.notify('generic');
  }
}
//666
GameModel.prototype.cellActionRouter = function(cellCoords) {
  var cell = this.getCell(cellCoords)
  var heneral = this.cellGeneral(cell)
  if (heneral !== undefined && heneral.getPlayer() === this.getTurn()) {
      this.selectHeneral(heneral);
  }  else if (this.activeHeneral !== undefined) {
    this.moveHeneralToCell(cell, this.activeHeneral)
  }
}

GameModel.prototype.selectHeneral = function(heneral) {
    this.setActiveHeneral(heneral);
    heneral.setActive(true);
    heneral.getCell().notify();
}

GameModel.prototype.moveHeneralToCell = function(toCell, heneral) {
  if (this.activeHeneral.moves > 0) {
    if(this.canHeneralMoveHere(toCell, heneral)){
        var oldCell = this.activeHeneral.getCell()
        this.activeHeneral.makeMove(toCell)
        oldCell.notify()
        toCell.notify()
        if (this.activeHeneral.moves === 0) {
          this.activeHeneral = undefined
        }
    }
  }
}


GameModel.prototype.canHeneralMoveHere = function(cell, heneral) {
  if(cell.getHeneral() !== undefined) return false;
  if(cell.isRocks()) return false;
  if(cell.isTown() && heneral.moves !== 2) return false;
  if(this.isCellNextToCell(cell, heneral.getCell())) return true;
}

GameModel.prototype.isCellNextToCell = function(cell1, cell2){
  var result = false;
  for (var i = 0; i < 6; i++) {
    var k = this.getNeighbor(cell1.row, cell1.col, i)
    if (k === undefined) continue;
    if (k === cell2) {
      result = true
      break
    }
  }
  return result
}

//666
GameModel.prototype.removeHeneral = function(heneral) {
  var army = this.twoArmies[this.getPlayerIndex()]
  army.splice(army.indexOf(heneral), 1)
}

//666
GameModel.prototype.checkAndNotifyTurnCompleted = function () {
  if (this.isTurnComplited()) {
    this.notify('finishTurn')
    this.flag++;
  }
}

GameModel.prototype.isTurnComplited = function() {
  return this.twoArmies[this.getPlayerIndex()].every((x) => x.isFinished());
}

GameModel.prototype.buildCastle = function() {
  if (this.activeHeneral !== undefined) {
    var cell = this.activeHeneral.getCell()
    if(cell.canCastleBuild()){
      this.takeCell(this.getTurn(), cell.row, cell.col)
      this.activeHeneral.moves = 0
      this.removeHeneral(this.activeHeneral)
      this.activeHeneral = undefined
      cell.notify()
      console.log("Super castel build")
   } else {
     this.notify('errors', "Can not build Castle here ")
   }
  }
}

//666
GameModel.prototype.subscribe = function (eventType, subscriber) {
  var subs = this.subscribers[eventType]
  if (subs !== undefined) {
    subs.push(subscriber)
  }
}

//666
GameModel.prototype.notify = function(eventType, payload) {
  if (payload === undefined) payload = this
  var subs = this.subscribers[eventType]
  if (subs !== undefined) {
    subs.forEach(function(entry) {
       entry(payload)
    })
  }
}
