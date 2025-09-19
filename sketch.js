<<<<<<< HEAD
var vehicles = [];
var font; 
var points;
function preload(){
  font = loadFont('font.TTF')  
}
function setup() {
createCanvas(1290, 300);
background(0);
textFont(font);


points = font.textToPoints('DJDada',100,232,192);
for(var i = 0;i < points.length;i++){
  var pt = points[i];
  var vehicle = new Vehicle(pt.x,pt.y);
  vehicles.push(vehicle);
}
}

function draw() {
background(00);
for(var i = 0;i < points.length;i++){
  var v = vehicles[i];
  v.behaviors();
  v.update();
  v.show();
}
=======
  var vehicles = [];
  var font; 
  var points;
function preload(){
    font = loadFont('font.TTF')  
}
function setup() {
  createCanvas(1290, 300);
  background(0);
  textFont(font);

  
  points = font.textToPoints('hello world!!',100,232,192);
  for(var i = 0;i < points.length;i++){
    var pt = points[i];
    var vehicle = new Vehicle(pt.x,pt.y);
    vehicles.push(vehicle);
  }
}

function draw() {
  background(00);
  for(var i = 0;i < points.length;i++){
    var v = vehicles[i];
    v.behaviors();
    v.update();
    v.show();
  }
>>>>>>> 7bc02b3fafb2f08a66d1fd4a8a68b69dc61ff9c7
}