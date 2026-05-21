const fs = require('fs');

function test() {
    console.log("This will work. Then in the loop we can do:");
    // var language = getLanguageCode(platformID, languageID, ltag);
    // if (languageID >= 0x8000 && format === 1) {
    //     language = langTags[languageID - 0x8000];
    // }
    console.log("Is languageID offset from 0x8000 exactly matching index?");
    // Yes: "Each language-tag record corresponds to a language ID one greater than that for the previous language-tag record. Thus, language IDs associated with language-tag records must be within the range 0x8000 to 0x8000 + langTagCount - 1."
}
test();
