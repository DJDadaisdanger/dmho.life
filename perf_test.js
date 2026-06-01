const fs = require('fs');

const html = fs.readFileSync('gui.html', 'utf8');

const match = html.match(/function Vector\([\s\S]*?(?=<\/script>)/);
if (!match) {
    console.error("Could not find script");
    process.exit(1);
}
let script = match[0];

// we need to mock canvas ctx, width, height, mouseX, mouseY
const preamble = `
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
`;

script = script.replace(/window\.requestAnimFrame =[\s\S]*?\)\(\);/, '');
script = script.replace(/draw\(\);/, '');
script = script.replace(/var rawPoints = \[([\s\S]*?)\];/, 'var rawPoints = [{x: 10, y: 10}, {x: 20, y: 20}, {x: 30, y: 30}];');

const testCode = preamble + script + `
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
`;

fs.writeFileSync('test_run.js', testCode);
