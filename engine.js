const Engine = function(frameRate, update, render) {

    this.totalTime = 0;
    this.afr = undefined;
    this.currentTime = undefined;
    this.frameRate = frameRate;
    this.updated = false;
    this.update = update;
    this.render = render;
  
    this.run = function(frameRate) {
  
      this.totalTime += frameRate - this.currentTime;
      this.time = frameRate;
  
      if (this.totalTime >= this.frameRate * 3) {
        this.totalTime = this.frameRate;
      }
  
      while(this.totalTime >= this.frameRate) {
        this.totalTime -= this.frameRate;
        this.update(frameRate);
        this.updated = true;
      }
  
      if (this.updated) {
        this.updated = false;
        this.render(frameRate);
      }
      this.afr = window.requestAnimationFrame(this.handleRun);
    };
    this.handleRun = (frameRate) => { this.run(frameRate); };
  };
  
  Engine.prototype = {
    constructor:Engine,
  
    start:function() {
  
      this.totalTime = this.frameRate;
      this.currentTime = window.performance.now();
      this.afr = window.requestAnimationFrame(this.handleRun);
  
    },
    stop:function() { window.cancelAnimationFrame(this.afr); }
  };