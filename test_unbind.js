const fs = require('fs');
const content = fs.readFileSync('p5.js', 'utf8');
const bindMatch = content.match(/_main\.default\.Shader\.prototype\.bindTextures = function\(\) \{([\s\S]*?)\};\n/);
if (bindMatch) {
  console.log("bindTextures function body:\n", bindMatch[1]);
}
