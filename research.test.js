const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { JSDOM } = require('jsdom');

test('editComment edge case: prompt returns null', async (t) => {
    const html = fs.readFileSync('research.html', 'utf8');
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const window = dom.window;

    let updateCalled = false;
    window.commentsCollection = {
        doc: () => ({
            update: () => {
                updateCalled = true;
                return Promise.resolve();
            }
        })
    };

    // Simulate prompt returning null
    window.prompt = () => null;

    window.editComment('test_id', 'old text');

    assert.strictEqual(updateCalled, false, 'update should not be called when prompt returns null');
});

test('editComment edge case: prompt returns empty string', async (t) => {
    const html = fs.readFileSync('research.html', 'utf8');
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const window = dom.window;

    let updateCalled = false;
    window.commentsCollection = {
        doc: () => ({
            update: () => {
                updateCalled = true;
                return Promise.resolve();
            }
        })
    };

    // Simulate prompt returning empty string
    window.prompt = () => "";

    window.editComment('test_id', 'old text');

    assert.strictEqual(updateCalled, false, 'update should not be called when prompt returns empty string');
});

test('editComment edge case: prompt returns whitespace only', async (t) => {
    const html = fs.readFileSync('research.html', 'utf8');
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const window = dom.window;

    let updateCalled = false;
    window.commentsCollection = {
        doc: () => ({
            update: () => {
                updateCalled = true;
                return Promise.resolve();
            }
        })
    };

    // Simulate prompt returning whitespace only
    window.prompt = () => "   ";

    window.editComment('test_id', 'old text');

    assert.strictEqual(updateCalled, false, 'update should not be called when prompt returns whitespace only');
});
