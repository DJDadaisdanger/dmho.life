// Wait, what does the prompt say?
//   // FIXME: Also handle Microsoft's 'name' table 1.
//   if (format === 0 && platformID === 3 && encodingID === 1 && languageID === 0x409) {
// Oh, the prompt context IS completely different from what is at p5.js:32759!
// In `p5.js:32759`, the code is:
//                 if (format === 1) {
//                   // FIXME: Also handle Microsoft's 'name' table 1.
//                   langTagCount = p.parseUShort();
//                 }
// The user provided the WRONG context. But the line number 32759 perfectly matches `p5.js`!
