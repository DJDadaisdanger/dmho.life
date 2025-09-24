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
background(0);
for(var i = 0;i < points.length;i++){
  var v = vehicles[i];
  v.behaviors();
  v.update();
  v.show();
}
}