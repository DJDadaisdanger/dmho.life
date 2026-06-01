// Okay, so stringOffset is relative to `p.offset`?
// Actually in parseNameTable:
// var stringOffset = p.offset + p.parseUShort();
// But wait! `p.offset` is the `start` passed to the Parser. `stringOffset` should be the start of the 'name' table plus the storageOffset.
// `start` is the start of the 'name' table in the font data.
// Wait, `p.offset` is `start`. So `stringOffset` correctly gets the absolute offset in `data`.

// How to read langTagRecords?
// If `format === 1`, we can grab the current `relativeOffset`.
// The name records take `count * 12` bytes.
// So we could do:
/*
var langTags = [];
if (format === 1) {
    var langTagCountOffset = p.relativeOffset + count * 12;
    var langTagCount = p.parseUShort(data, p.offset + langTagCountOffset); // wait Parser doesn't have offset arguments usually. We can just use dataView!
    // Or save p.relativeOffset, change it, parse, then change it back.
    var savedOffset = p.relativeOffset;
    p.relativeOffset = langTagCountOffset;
    var langTagCount = p.parseUShort();
    for (var i = 0; i < langTagCount; i++) {
        var length = p.parseUShort();
        var offset = p.parseUShort();
        var tag = decode.UTF16(data, stringOffset + offset, length);
        langTags.push(tag);
    }
    p.relativeOffset = savedOffset;
}
*/
