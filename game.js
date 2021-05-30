const Game = function() {
  this.world = new Game.World();
  this.update = function() {
    this.world.update();
  };
};

Game.prototype = { constructor : Game };
Game.World = function(friction = 0.9, gravity = 3) {

  this.collider = new Game.World.Collider();

  this.friction = friction;
  this.gravity = gravity;

  this.player = new Game.World.Player();

  this.columns = 12;
  this.rows = 9;
  this.tileSize = 16;

  this.map = [48,17,17,17,49,48,18,19,16,17,35,36,
              10,39,39,39,16,18,39,31,31,31,39,07,
              10,31,39,31,31,31,39,12,05,05,28,01,
              35,06,39,39,31,39,39,19,39,39,08,09,
              02,31,31,47,39,47,39,31,31,04,36,25,
              10,39,39,31,39,39,39,31,31,31,39,37,
              10,39,31,04,14,06,39,39,03,39,00,42,
              49,02,31,31,11,39,39,31,11,00,42,09,
              08,40,27,13,37,27,13,03,22,34,09,24];

  /*
  0000 = 0  tile 0:    0    tile 1:   1     tile 2:    0    tile 3:     1
  0001 = 1           0   0          0   0            0   1            0   1
  0010 = 2             0              0                0                0
  0011 = 3         no walls          top             right          right/top


  0100 = 4  tile 4:    0    tile 5:   1     tile 6:    0     tile 7:    1
  0101 = 5           0   0          0   0            0   1            0   1
  0110 = 6             1              1                1                1
  0111 = 7           bottom       top/bottom       right/bottom   top/right/bottom


  1000 = 8  tile 8:    0    tile 9:   1     tile 10    0    tile 11:    1
  1001 = 9           1   0          1   0            1   1            1   1
  1010 = 10            0              0                0                0
  1011 = 11          left          top/left      left and right   left/top/right


  1100 = 12  tile 12:   0    tile 13:  1     tile 14:   0    tile 15:    1
  1101 = 13           1   0          1   0            1   1            1   1
  1110 = 14             1              1                1                1
  1111 = 15        left/bottom  left/bottom/top left/bottom/right    four walls
  */

  this.collisionMap = [00,04,04,04,00,00,04,04,04,04,04,00,
                        02,00,00,00,12,06,00,00,00,00,00,08,
                        02,00,00,00,00,00,00,09,05,05,01,00,
                        00,07,00,00,00,00,00,14,00,00,08,00,
                        02,00,00,01,00,01,00,00,00,13,04,00,
                        02,00,00,00,00,00,00,00,00,00,00,08,
                        02,00,00,13,01,07,00,00,11,00,09,00,
                        00,03,00,00,10,00,00,00,08,01,00,00,
                        00,00,01,01,00,01,01,01,00,00,00,00];

  this.height = this.tileSize * this.rows;
  this.width = this.tileSize * this.columns;
};

Game.World.prototype = {

  constructor: Game.World,

  collideObject:function(object) {

    if(object.getLeft() < 0) { 
      object.setLeft(0);
      object.xVelocity = 0; 
    } else if(object.getRight() > this.width ) { 
      object.setRight(this.width);   
      object.xVelocity = 0; 
    }

    if(object.getTop() < 0 ) { 
      object.setTop(0);              
      object.yVelocity = 0; 
    } else if(object.getBottom() > this.height) { 
      object.setBottom(this.height); 
      object.yVelocity = 0; 
      object.jumping = false; 
    }

    var bottom, left, right, top, value;

    top = Math.floor(object.getTop()/this.tileSize);
    left = Math.floor(object.getLeft()/this.tileSize);
    value = this.collisionMap[top * this.columns + left];
    this.collider.collide(value, object, left * this.tileSize, top * this.tileSize, this.tileSize);

    top = Math.floor(object.getTop()/this.tileSize);
    right = Math.floor(object.getRight()/this.tileSize);
    value = this.collisionMap[top * this.columns + right];
    this.collider.collide(value, object, right * this.tileSize, top * this.tileSize, this.tileSize);

    bottom = Math.floor(object.getBottom()/this.tileSize);
    left = Math.floor(object.getLeft()/this.tileSize);
    value = this.collisionMap[bottom * this.columns + left];
    this.collider.collide(value, object, left * this.tileSize, bottom * this.tileSize, this.tileSize);

    bottom = Math.floor(object.getBottom()/this.tileSize);
    right = Math.floor(object.getRight()/this.tileSize);
    value = this.collisionMap[bottom * this.columns + right];
    this.collider.collide(value, object, right * this.tileSize, bottom * this.tileSize, this.tileSize);

  },

  update:function() {
    this.player.yVelocity += this.gravity;
    this.player.update();

    this.player.xVelocity *= this.friction;
    this.player.yVelocity *= this.friction;

    this.collideObject(this.player);
  }
};

Game.World.Collider = function() {
  this.collide = function(value, object, tileX, tileY, tileSize) {
    switch(value) {
      case  1: this.collidePlatformTop(object, tileY); break;

      case  2: this.collidePlatformRight(object, tileX + tileSize); break;

      case  3: if (this.collidePlatformTop(object, tileY)) return; 
               this.collidePlatformRight(object, tileX + tileSize); break;

      case  4: this.collidePlatformBottom(object, tileY + tileSize); break;

      case  5: if (this.collidePlatformTop(object, tileY)) return;
               this.collidePlatformBottom(object, tileY + tileSize); break;

      case  6: if (this.collidePlatformRight(object, tileX + tileSize)) return;
               this.collidePlatformBottom(object, tileY + tileSize); break;

      case  7: if (this.collidePlatformTop(object, tileY)) return;
               if (this.collidePlatformRight(object, tileX + tileSize)) return;
               this.collidePlatformBottom(object, tileY + tileSize); break;

      case  8: this.collidePlatformLeft(object, tileX); break;

      case  9: if (this.collidePlatformTop(object, tileY)) return;
               this.collidePlatformLeft(object, tileX); break;

      case 10: if (this.collidePlatformLeft(object, tileX)) return;
               this.collidePlatformRight(object, tileX + tileSize); break;

      case 11: if (this.collidePlatformTop(object, tileY)) return;
               if (this.collidePlatformLeft(object, tileX)) return;
               this.collidePlatformRight(object, tileX + tileSize); break;

      case 12: if (this.collidePlatformLeft(object, tileX            )) return;
               this.collidePlatformBottom(object, tileY + tileSize); break;

      case 13: if (this.collidePlatformTop(object, tileY            )) return;
               if (this.collidePlatformLeft(object, tileX            )) return;
               this.collidePlatformBottom(object, tileY + tileSize); break;

      case 14: if (this.collidePlatformLeft(object, tileX            )) return;
               if (this.collidePlatformRight(object, tileX            )) return;
               this.collidePlatformBottom(object, tileY + tileSize); break;

      case 15: if (this.collidePlatformTop(object, tileY            )) return;
               if (this.collidePlatformLeft(object, tileX            )) return;
               if (this.collidePlatformRight(object, tileX + tileSize)) return;
               this.collidePlatformBottom(object, tileY + tileSize); break;
    }
  }
};

Game.World.Collider.prototype = {
  constructor: Game.World.Collider,

  collidePlatformBottom:function(object, tileBottom) {
    if (object.getTop() < tileBottom && object.getOldTop() >= tileBottom) {
      object.setTop(tileBottom);
      object.yVelocity = 0;     
      return true;        
    } 
    return false;        
  },

  collidePlatformLeft:function(object, tileLeft) {
    if (object.getRight() > tileLeft && object.getOldRight() <= tileLeft) {
      object.setRight(tileLeft);
      object.xVelocity = 0;
      return true;
    } 
    return false;
  },

  collidePlatformRight:function(object, tileRight) {
    if (object.getLeft() < tileRight && object.getOldLeft() >= tileRight) {
      object.setLeft(tileRight);
      object.xVelocity = 0;
      return true;
    } 
    return false;
  },

  collidePlatformTop:function(object, tileTop) {
    if (object.getBottom() > tileTop && object.getOldBottom() <= tileTop) {
      object.setBottom(tileTop);
      object.yVelocity = 0;
      object.jumping = false;
      return true;
    } 
    return false;
  }
};

Game.World.Object = function(x, y, width, height) {
 this.height = height;
 this.width = width;
 this.x = x;
 this.oldX = x;
 this.y = y;
 this.oldY = y;
};

Game.World.Object.prototype = {
  constructor:Game.World.Object,

  getBottom:   function()  { return this.y     + this.height; },
  getLeft:     function()  { return this.x;                   },
  getRight:    function()  { return this.x     + this.width;  },
  getTop:      function()  { return this.y;                   },
  getOldBottom:function()  { return this.oldY + this.height; },
  getOldLeft:  function()  { return this.oldX;               },
  getOldRight: function()  { return this.oldX + this.width;  },
  getOldTop:   function()  { return this.oldY                },
  setBottom:   function(y) { this.y     = y    - this.height; },
  setLeft:     function(x) { this.x     = x;                  },
  setRight:    function(x) { this.x     = x    - this.width;  },
  setTop:      function(y) { this.y     = y;                  },
  setOldBottom:function(y) { this.oldY = y    - this.height; },
  setOldLeft:  function(x) { this.oldX = x;                  },
  setOldRight: function(x) { this.oldX = x    - this.width;  },
  setOldTop:   function(y) { this.oldY = y;                  }
};

Game.World.Player = function(x, y) {
  Game.World.Object.call(this, 100, 100, 12, 12);
  this.color1     = "#404040";
  this.color2     = "#f0f0f0";
  this.jumping    = true;
  this.xVelocity = 0;
  this.yVelocity = 0;
};

Game.World.Player.prototype = {
  jump:function() {
    if (!this.jumping) {
      this.jumping     = true;
      this.yVelocity -= 20;
    }
  },

  moveLeft:function() { 
    this.xVelocity -= 0.5; 
  },

  moveRight:function() { 
    this.xVelocity += 0.5; 
  },

  update:function() {
    this.oldX = this.x;
    this.oldY = this.y;
    this.x += this.xVelocity;
    this.y += this.yVelocity;
  }
};

Object.assign(Game.World.Player.prototype, Game.World.Object.prototype);
Game.World.Player.prototype.constructor = Game.World.Player;