const fs = require('fs');

async function test() {
  const url = "https://learn.microsoft.com/en-us/typography/opentype/spec/name";
  const res = await fetch(url);
  const text = await res.text();
  console.log("format:", text.indexOf("Format"));
}

test();
