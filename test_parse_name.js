// Let's implement the logic for `langTagRecord` and format 1 name tables.
// In format 1, after the name records we have `langTagCount`.
// Then `langTagCount` elements of `LangTagRecord`:
// length (uint16), langTagOffset (Offset16).
// This requires `language-tag string` encoded in UTF-16BE.
// But as we noticed, name records are parsed *before* the langTagRecords, so when we encounter languageID >= 0x8000, we don't have the lang tags yet.
// Wait! `langTagOffset` is an offset from `stringOffset` (start of string storage).
// Let's re-read the spec.
// "langTagOffset: Language-tag string offset from start of storage area (in bytes)."
// This means the strings are in the same storage area.
