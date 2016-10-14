function Heneral(cell, number, player){
  this.number = number
  this.player = player
  this.cell = cell
  this.moves = 2
  this.active = false
}
Heneral.prototype.setCell = function(cell){
  this.cell = cell
  this.cell.notify()
}

Heneral.prototype.getCell = function(){
  return this.cell
}

Heneral.prototype.getPlayer = function(){
  return this.player
}

Heneral.prototype.setActive = function(flag){
  this.active = flag
  this.cell.notify()
}

Heneral.prototype.getActive = function(){
  return this.active
}

Heneral.prototype.isFinished = function(){
  return this.moves === 0;
}

Heneral.prototype.resetMoves = function() {
  this.moves = 2
  this.setActive(false)
  this.cell.notify()
}

Heneral.prototype.makeMove = function(cell) {
  if (this.moves > 0) {
    this.moves--
    this.setCell(cell)
  }
}
