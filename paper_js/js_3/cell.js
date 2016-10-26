function Cell(row, col, field) {
  this.row = row
  this.col = col
  this.player = this.getNoones()
  this.type = 0
  this.subscribers = []
  this.field = field
}

Cell.prototype.setHeneral = function(){
}
///changed
Cell.prototype.getNoones = function() {
  return 0;
}
//changed
Cell.prototype.isNoones = function() {
  return this.player === this.getNoones()
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

//666 (метод подписчика ) добавляют в массив
Cell.prototype.subscribe = function (subscriber) {
    this.subscribers.push(subscriber)
}
//666
Cell.prototype.notify = function() {
    cl = this
    this.subscribers.forEach(function(entry) {
       entry(cl)
    })
  }
//666
Cell.prototype.toString = function() {
  return "[" + this.row + "][" + this.col + "]:" + this.color
}
//666
Cell.prototype.getHeneral = function() {
  return this.field.cellGeneral(this)
}

Cell.prototype.canCastleBuild = function() {
  return this.isEmpty();
}
