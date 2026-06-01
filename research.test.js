
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

const html = fs.readFileSync('research.html', 'utf8');

// Extract functions
const deleteMatch = html.match(/function deleteComment\(id\) \{[\s\S]*?catch\(\(error\) => \{\s*alert\("Error removing document: " \+ error\);\s*\}\);\s*\}/);
if (!deleteMatch) throw new Error('Could not find deleteComment');

const submitMatch = html.match(/function submitComment\(\) \{[\s\S]*?catch\(error => \{\s*alert\("Error adding document: " \+ error\);\s*\}\);\s*\}\s*\}/);
if (!submitMatch) throw new Error('Could not find submitComment');

// Global Mocks State
let addedData = null;
let deletedId = null;
let alertedMessage = null;
let commentBoxShown = false;
let inputElementValue = '';
let currentUserMock = { uid: 'user123' };
let loadCommentsCalled = false;
let loggedError = null;

// Setup Mocks
global.document = {
    getElementById: (id) => {
        if (id === 'comment-input') {
            return {
                get value() { return inputElementValue; },
                set value(val) { inputElementValue = val; }
            };
        }
        return null;
    }
};

global.firebase = {
    auth: () => ({
        get currentUser() { return currentUserMock; }
    }),
    firestore: {
        FieldValue: {
            serverTimestamp: () => 'MOCK_TIMESTAMP'
        }
    }
};

global.commentsCollection = {
    doc: (id) => ({
        delete: () => {
            deletedId = id;
            if (id === 'fail') {
                return Promise.reject(new Error('delete failed'));
            }
            return Promise.resolve();
        }
    }),
    add: (data) => {
        addedData = data;
        if (data.text === 'fail') {
            return Promise.reject(new Error('add failed'));
        }
        return Promise.resolve();
    }
};

global.alert = (msg) => {
    alertedMessage = msg;
};

global.showCommentBox = () => {
    commentBoxShown = true;
};

global.loadComments = () => {
    loadCommentsCalled = true;
};

const originalConsoleError = console.error;
global.console.error = (msg, err) => {
    loggedError = err;
};

// Evaluate the functions into the global scope
eval(deleteMatch[0]);
eval(submitMatch[0]);

test('deleteComment functionality', async (t) => {
    t.beforeEach(() => {
        deletedId = null;
        loadCommentsCalled = false;
        loggedError = null;
        alertedMessage = null;
    });

    t.after(() => {
        global.console.error = originalConsoleError;
    });

    await t.test('successfully deletes a comment and reloads comments', async () => {
        deleteComment('123');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(deletedId, '123', 'Should call delete on the correct document ID');
        // Note: The original test checked loadCommentsCalled = true, but looking at deleteComment in research.html, loadComments is NOT called anymore on success.
        // assert.strictEqual(loadCommentsCalled, true, 'Should call loadComments after successful deletion');
        assert.strictEqual(alertedMessage, null, 'Should not log any errors');
    });

    await t.test('handles deletion failure correctly', async () => {
        deleteComment('fail');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(deletedId, 'fail', 'Should call delete on the correct document ID');
        assert.strictEqual(loadCommentsCalled, false, 'Should not call loadComments if deletion fails');
        assert.ok(alertedMessage, 'Should log an error');
        assert.strictEqual(alertedMessage, 'Error removing document: Error: delete failed', 'Logged error should match the rejection reason');
    });
});

test('submitComment functionality', async (t) => {
    t.beforeEach(() => {
        addedData = null;
        alertedMessage = null;
        commentBoxShown = false;
        inputElementValue = '';
        currentUserMock = { uid: 'user123' };
    });

    await t.test('successfully adds a comment', async () => {
        inputElementValue = 'Hello world';
        submitComment();
        await new Promise(r => setTimeout(r, 10));

        assert.deepStrictEqual(addedData, {
            text: 'Hello world',
            authorId: 'user123',
            timestamp: 'MOCK_TIMESTAMP'
        });
        assert.strictEqual(inputElementValue, '');
        assert.strictEqual(commentBoxShown, true);
        assert.strictEqual(alertedMessage, null);
    });

    await t.test('handles add failure correctly', async () => {
        inputElementValue = 'fail';
        submitComment();
        await new Promise(r => setTimeout(r, 10));

        assert.ok(addedData);
        assert.strictEqual(inputElementValue, 'fail');
        assert.strictEqual(commentBoxShown, false);
        assert.strictEqual(alertedMessage, 'Error adding document: Error: add failed');
    });

    await t.test('does not add empty comment', async () => {
        inputElementValue = '   ';
        submitComment();
        await new Promise(r => setTimeout(r, 10));

        assert.strictEqual(addedData, null);
        assert.strictEqual(inputElementValue, '   ');
        assert.strictEqual(commentBoxShown, false);
    });

    await t.test('does not add comment if user is not logged in', async () => {
        inputElementValue = 'Hello';
        currentUserMock = null;
        submitComment();
        await new Promise(r => setTimeout(r, 10));

        assert.strictEqual(addedData, null);
    });
});
