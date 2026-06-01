const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

// Read research.html
const html = fs.readFileSync('research.html', 'utf8');
// Extract the deleteComment function
const match = html.match(/function deleteComment\(id\) \{[\s\S]*?console\.error\("Error removing document: ", error\);\s*\}\);\s*\}/);

if (!match) {
    throw new Error('Could not find deleteComment function in research.html');
}

// Variables to track state
let deletedId = null;
let loadCommentsCalled = false;
let loggedError = null;

// Mock the environment
global.commentsCollection = {
    doc: (id) => ({
        delete: () => {
            deletedId = id;
            if (id === 'fail') {
                return Promise.reject(new Error('delete failed'));
            }
            return Promise.resolve();
        }
    })
};

global.loadComments = () => {
    loadCommentsCalled = true;
};

const originalConsoleError = console.error;
global.console.error = (msg, err) => {
    loggedError = err;
};

// Evaluate the function into the global scope
eval(match[0]);

test('deleteComment functionality', async (t) => {
    // Reset state before each test
    t.beforeEach(() => {
        deletedId = null;
        loadCommentsCalled = false;
        loggedError = null;
    });

    // Restore console.error after all tests
    t.after(() => {
        global.console.error = originalConsoleError;
    });

    await t.test('successfully deletes a comment and reloads comments', async () => {
        deleteComment('123');

        // Wait for promise resolution
        await new Promise(r => setTimeout(r, 10));

        assert.strictEqual(deletedId, '123', 'Should call delete on the correct document ID');
        assert.strictEqual(loadCommentsCalled, true, 'Should call loadComments after successful deletion');
        assert.strictEqual(loggedError, null, 'Should not log any errors');
    });

    await t.test('handles deletion failure correctly', async () => {
        deleteComment('fail');

        // Wait for promise resolution
        await new Promise(r => setTimeout(r, 10));

        assert.strictEqual(deletedId, 'fail', 'Should call delete on the correct document ID');
        assert.strictEqual(loadCommentsCalled, false, 'Should not call loadComments if deletion fails');
        assert.ok(loggedError, 'Should log an error');
        assert.strictEqual(loggedError.message, 'delete failed', 'Logged error should match the rejection reason');
    });
});
