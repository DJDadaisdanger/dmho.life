const fs = require('fs');

async function checkOpentype() {
  // Let's look at how the latest opentype.js solves it.
  const nameMjs = fs.readFileSync('/tmp/opentype.js/src/tables/name.mjs', 'utf8');
  console.log(nameMjs.includes("Also handle Microsoft's 'name' table 1."));
}

checkOpentype();
