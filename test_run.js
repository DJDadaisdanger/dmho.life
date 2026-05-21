
let width = 800;
let height = 600;
let mouseX = 400;
let mouseY = 300;
let ctx = {
    fillStyle: '',
    fillRect: function() {},
    beginPath: function() {},
    arc: function() {},
    fill: function() {}
};
function Vector(x, y) {
          this.x = x || 0;
          this.y = y || 0;
      }
      Vector.prototype.add = function(v) {
          this.x += v.x;
          this.y += v.y;
          return this;
      };
      Vector.prototype.sub = function(v) {
          this.x -= v.x;
          this.y -= v.y;
          return this;
      };
      Vector.prototype.mult = function(n) {
          this.x *= n;
          this.y *= n;
          return this;
      };
      Vector.prototype.magSq = function() {
          return this.x * this.x + this.y * this.y;
      };
      Vector.prototype.mag = function() {
          return Math.sqrt(this.magSq());
      };
      Vector.prototype.setMag = function(n) {
          var m = this.mag();
          if (m !== 0) {
              this.mult(n / m);
          }
          return this;
      };
      Vector.prototype.limit = function(max) {
          if (this.magSq() > max * max) {
              this.setMag(max);
          }
          return this;
      };
      Vector.sub = function(v1, v2) {
          return new Vector(v1.x - v2.x, v1.y - v2.y);
      };
      Vector.random2D = function() {
          var angle = Math.random() * Math.PI * 2;
          return new Vector(Math.cos(angle), Math.sin(angle));
      };

      function Vehicle(x, y) {
          this.pos = new Vector(Math.random() * width, Math.random() * height);
          this.target = new Vector(x, y);
          this.vel = Vector.random2D();
          this.acc = new Vector();
          this.r = 8;
          this.maxspeed = 10;
          this.maxforce = 1;
      }

      Vehicle.prototype.behaviors = function(mouse) {
          var arrive = this.arrive(this.target);
          var flee = this.flee(mouse);
          arrive.mult(1);
          flee.mult(5);
          this.applyForce(flee);
          this.applyForce(arrive);
      };

      Vehicle.prototype.applyForce = function(f) {
          this.acc.add(f);
      };

      Vehicle.prototype.update = function() {
          this.pos.add(this.vel);
          this.vel.add(this.acc);
          this.acc.mult(0);
      };

      Vehicle.prototype.show = function() {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(this.pos.x, this.pos.y, 4, 0, Math.PI * 2);
          ctx.fill();
      };

      Vehicle.prototype.arrive = function(target) {
          var desired = Vector.sub(target, this.pos);
          var d = desired.mag();
          var speed = this.maxspeed;
          if (d < 100) {
              speed = (d / 100) * this.maxspeed;
          }
          desired.setMag(speed);
          var steer = Vector.sub(desired, this.vel);
          steer.limit(this.maxforce);
          return steer;
      };

      Vehicle.prototype.flee = function(target) {
          var desired = Vector.sub(target, this.pos);
          var d = desired.mag();
          if (d < 50) {
              desired.setMag(this.maxspeed);
              desired.mult(-1);
              var steer = Vector.sub(desired, this.vel);
              steer.limit(this.maxforce);
              return steer;
          } else {
              return new Vector(0, 0);
          }
      };

      var rawPoints = [{x: 10, y: 10}, {x: 20, y: 20}, {x: 30, y: 30}];
      var vehicles = [];
      for (var i = 0; i < rawPoints.length; i++) {
          vehicles.push(new Vehicle(rawPoints[i].x, rawPoints[i].y));
      }



      function draw() {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, width, height);

          var mouse = new Vector(mouseX, mouseY);
          for (var i = 0; i < vehicles.length; i++) {
              var v = vehicles[i];
              v.behaviors(mouse);
              v.update();
              v.show();
          }

          window.requestAnimFrame(draw);
      }



// Benchmark
const start = performance.now();
let mouseVector = new Vector(mouseX, mouseY);
for (let iter = 0; iter < 100000; iter++) {
    for (let i = 0; i < vehicles.length; i++) {
        let v = vehicles[i];
        v.behaviors(mouseVector);
        v.update();
    }
}
const end = performance.now();
console.log("Time:", end - start);
