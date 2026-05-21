const fs = require('fs');

let diff = `
<<<<<<< SEARCH
              function parseNameTable(data, start, ltag) {
                var name = {};
                var p = new parse.Parser(data, start);
                var format = p.parseUShort();
                var count = p.parseUShort();
                var stringOffset = p.offset + p.parseUShort();
                for (var i = 0; i < count; i++) {
=======
              function parseNameTable(data, start, ltag) {
                var name = {};
                var p = new parse.Parser(data, start);
                var format = p.parseUShort();
                var count = p.parseUShort();
                var stringOffset = p.offset + p.parseUShort();
                var langTags = [];
                if (format === 1) {
                  var savedOffset = p.relativeOffset;
                  p.relativeOffset += count * 12; // skip name records
                  var langTagCount = p.parseUShort();
                  for (var i = 0; i < langTagCount; i++) {
                    var length = p.parseUShort();
                    var offset = p.parseUShort();
                    langTags.push(decode.UTF16(data, stringOffset + offset, length));
                  }
                  p.relativeOffset = savedOffset;
                }

                for (var i = 0; i < count; i++) {
>>>>>>> REPLACE
`;

let diff2 = `
<<<<<<< SEARCH
                  var language = getLanguageCode(platformID, languageID, ltag);
                  var encoding = getEncoding(platformID, encodingID, languageID);
                  if (encoding !== undefined && language !== undefined) {
=======
                  var language = getLanguageCode(platformID, languageID, ltag);
                  if (format === 1 && languageID >= 0x8000 && languageID - 0x8000 < langTags.length) {
                    language = langTags[languageID - 0x8000];
                  }
                  var encoding = getEncoding(platformID, encodingID, languageID);
                  if (encoding !== undefined && language !== undefined) {
>>>>>>> REPLACE
`;

let diff3 = `
<<<<<<< SEARCH
                var langTagCount = 0;
                if (format === 1) {
                  // FIXME: Also handle Microsoft's 'name' table 1.
                  langTagCount = p.parseUShort();
                }

                return name;
=======
                return name;
>>>>>>> REPLACE
`;
