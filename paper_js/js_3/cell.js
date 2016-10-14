

function Cell(row, col, field) {
  this.row = row
  this.col = col
  this.player = 0
  this.type = 0
  this.subscribers = []
  this.field = field
}
Cell.prototype.setHeneral = function(){
}
Cell.prototype.setPlayer = function (player) {
    this.player = player
    this.notify()
}

Cell.prototype.getPlayer = function () {return this.player;}

Cell.prototype.setCastle = function () {
  if ( this.isEmpty() ) {
    this.type = 2;
    this.notify();
  }
}

Cell.prototype.setTown = function () {
  //if ( this.isEmpty() ) {
    this.type = 1;
    this.notify();
  //}
}

Cell.prototype.setRiver = function () {
  if ( this.isEmpty() ) {
    this.type = 3;
    this.notify();
  }
}

Cell.prototype.setRocks = function () {
  if ( this.isEmpty() ) {
    this.type = 4;
    this.notify();
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

Cell.prototype.notify = function() {
    cl = this
    this.subscribers.forEach(function(entry) {
       entry(cl)
    })
  }

Cell.prototype.toString = function() {
  return "[" + this.row + "][" + this.col + "]:" + this.color
}

Cell.prototype.getHeneral = function() {
  return this.field.cellGeneral(this)
}
