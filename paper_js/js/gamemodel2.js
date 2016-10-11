function Cell(row, col) {
  this.row = row
  this.col = col
  this.player = 0
  this.type = 0
  this.subscribers = []
}
Cell.prototype.setPlayer = function (player) {
    this.player = player
    this.notify(this)
}

Cell.prototype.getPlayer = function () {return this.player;}

Cell.prototype.setCastle = function () {
  if ( this.isEmpty() ) {
    this.type = 2;
    this.notify(this);
  }
}

Cell.prototype.setTown = function () {
  //if ( this.isEmpty() ) {
    this.type = 1;
    this.notify(this);
  //}
}

Cell.prototype.setRiver = function () {
  if ( this.isEmpty() ) {
    this.type = 3;
    this.notify(this);
  }
}

Cell.prototype.setRocks = function () {
  if ( this.isEmpty() ) {
    this.type = 4;
    this.notify(this);
  }
}



Cell.prototype.isEmpty = function ()  {return this.type === 0;}
Cell.prototype.isTown = function  ()  {return this.type === 1;}
Cell.prototype.isCastle = function()  {return this.type === 2;}
Cell.prototype.isRiver = function ()  {return this.type === 3;}
Cell.prototype.isRocks = function ()  {return this.type === 4;}

Cell.prototype.subscribe = function (subscriber) {
    this.subscribers.push(subscriber)
}

Cell.prototype.notify = function(cell) {
    this.subscribers.forEach(function(entry) {
       entry(cell)
    })
  }

Cell.prototype.toString = function() {
  return "[" + this.row + "][" + this.col + "]:" + this.color
}



function GameModel(n, m, initPos) {
  this.turn = 1
  this.rows = n
  this.cols = m
  this.field = []
  this.colors = ['green', 'red']
  this.initPos = initPos

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

GameModel.prototype.flipTurn = function() {
  this.turn = this.turn === 1 ? 2:1
  return this.turn
}

GameModel.prototype.getTurn = function() {
  return this.turn
}



GameModel.prototype.makearr = function() {
  var arr = []
  for (var i = 0; i < this.rows; i++) {
    for (var j = 0; j < this.cols; j++) {
      if (!arr[i]) { arr[i] = [];}
      arr[i][j] = new Cell(i, j);
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
  this.setTown(2, this.initPos[1][0], this.initPos[1][1])
  this.setTown(1, this.initPos[0][0], this.initPos[0][1])
  this.takeCell(1, this.initPos[0][0], this.initPos[0][1])
  this.takeCell(2, this.initPos[1][0], this.initPos[1][1])
}

GameModel.prototype.makeTurn = function(player, r, c) {
  if (this.isTurnValid(player, r, c)) {
    this.takeCell(player, r, c)
    return true
  }
  return false
}
