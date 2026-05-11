const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

test('submitComment functionality', async (t) => {
    const html = fs.readFileSync(path.join(__dirname, 'research.html'), 'utf-8');
    const dom = new JSDOM(html, { runScripts: "outside-only" });
    const window = dom.window;
    const document = window.document;

    // Extract the inline script containing the functions
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    const scriptContent = scriptMatch[1];

    // Mock dependencies
    let addedDocument = null;
    let loadCommentsCalled = false;
    let addPromiseResolve;

    window.firebase = {
        auth: () => ({
            signInAnonymously: () => Promise.resolve(),
            currentUser: { uid: 'mock-user-uid' },
            onAuthStateChanged: () => {}
        }),
        firestore: {
            FieldValue: {
                serverTimestamp: () => 'mock-server-timestamp'
            }
        }
    };

    window.commentsCollection = {
        add: (doc) => {
            addedDocument = doc;
            return new Promise((resolve) => {
                addPromiseResolve = resolve;
            });
        }
    };

    window.db = {
        collectionGroup: () => ({
            orderBy: () => ({
                get: () => Promise.resolve([])
            })
        })
    };

    window.fetch = () => Promise.resolve({ text: () => Promise.resolve('') });
    window.marked = { parse: (text) => text };
    window.DOMPurify = { sanitize: (text) => text };

    // Execute the script in the context of the window
    window.eval(scriptContent);

    // Override loadComments since it has other dependencies we don't want to mock for this test
    window.loadComments = () => {
        loadCommentsCalled = true;
    };

    // Test: User is logged in, comment is valid
    const commentInput = document.getElementById('comment-input');
    commentInput.value = 'This is a test comment';

    // Call function - we need to wait for the promise to resolve internally
    window.submitComment();

    // Wait a tick for the add promise to be returned inside submitComment
    await new Promise(resolve => setImmediate(resolve));

    // Now resolve the promise returned by add
    addPromiseResolve();

    // Wait a tick for the .then block inside submitComment to execute
    await new Promise(resolve => setImmediate(resolve));

    // Verify side effects
    assert.ok(addedDocument, 'Document should have been added');
    assert.strictEqual(addedDocument.text, 'This is a test comment');
    assert.strictEqual(addedDocument.authorId, 'mock-user-uid');
    assert.strictEqual(addedDocument.timestamp, 'mock-server-timestamp');

    // Check if UI updated
    assert.strictEqual(commentInput.value, '', 'Input should be cleared');
    assert.strictEqual(document.getElementById('comment-box-container').style.display, 'block', 'Comment box display should toggle');
    assert.ok(loadCommentsCalled, 'loadComments should have been called');

    // Reset mocks for next test
    addedDocument = null;
    loadCommentsCalled = false;

    // Test: User is logged in, but comment is empty/whitespace
    commentInput.value = '   ';
    window.submitComment();
    await new Promise(resolve => setImmediate(resolve));

    assert.strictEqual(addedDocument, null, 'Document should not be added if comment is empty');
    assert.strictEqual(loadCommentsCalled, false, 'loadComments should not be called');

    // Test: User is not logged in
    window.firebase.auth = () => ({
        signInAnonymously: () => Promise.resolve(),
        currentUser: null,
        onAuthStateChanged: () => {}
    });
    commentInput.value = 'Valid comment but no user';
    window.submitComment();
    await new Promise(resolve => setImmediate(resolve));

    assert.strictEqual(addedDocument, null, 'Document should not be added if user is null');
});
