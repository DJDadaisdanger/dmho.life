// So actually we need to:
// 1) read langTagCount
// 2) loop langTagCount times, reading:
//    - length (ushort)
//    - langTagOffset (ushort)
// 3) Then use `decode.UTF16(data, stringOffset + langTagOffset, length)` to get the BCP-47 tag string.
// 4) Add that string to `ltag` array? Wait, `ltag` is an argument passed into `parseNameTable(data, start, ltag)` which corresponds to the `ltag` table.
// Wait, the format 1 table has its own langTags, separate from the 'ltag' table?
// The 'ltag' table (TrueType/OpenType 'ltag' - language tag table) is a distinct table.
// Format 1 of the 'name' table introduces *its own* `langTagRecords` array directly in the `name` table.
// In the 'name' table format 1, if languageID >= 0x8000, the language tag string is `langTagRecord[languageID - 0x8000]`.
// So we just need to parse them and map them. BUT as we noticed, the `nameRecords` are parsed first!
// Let's parse the entire `parseNameTable` function and see how we can refactor it slightly to read langTagRecords if format === 1 before mapping names, or map them retrospectively.
