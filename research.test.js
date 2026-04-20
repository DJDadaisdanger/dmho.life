const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { JSDOM } = require('jsdom');

test('submitComment handles error path', async () => {
    const html = fs.readFileSync('./research.html', 'utf8');

    // Create a virtual console to catch errors
    const virtualConsole = new (require('jsdom').VirtualConsole)();
    const errorLogs = [];
    virtualConsole.on("error", (msg) => {
        if (msg !== 'Error adding document: ') {
            errorLogs.push(msg);
        }
    });

    const mockFirebase = {
        auth: () => ({
            signInAnonymously: () => Promise.resolve(),
            onAuthStateChanged: (cb) => { },
            currentUser: { uid: 'test-user-id' }
        }),
        firestore: {
            FieldValue: {
                serverTimestamp: () => 'mock-timestamp'
            }
        }
    };

    const mockDb = {
        collectionGroup: () => ({
            orderBy: () => ({
                get: () => Promise.resolve([])
            })
        })
    };

    const mockCommentsCollection = {
        add: () => Promise.reject(new Error("Simulated Firebase error")),
        orderBy: () => ({
            get: () => Promise.resolve([])
        })
    };

    const dom = new JSDOM(html, {
        runScripts: 'outside-only',
        virtualConsole
    });

    const window = dom.window;

    // Inject mocks directly into window BEFORE running scripts
    window.firebase = mockFirebase;
    window.db = mockDb;
    window.commentsCollection = mockCommentsCollection;

    // Override fetch to mock fetching research.md
    window.fetch = () => Promise.resolve({
        text: () => Promise.resolve('# Mock Research')
    });

    // Mock marked and DOMPurify
    window.marked = { parse: text => text };
    window.DOMPurify = { sanitize: html => html };

    // Now get the inline script content
    const scripts = dom.window.document.querySelectorAll('script');
    const inlineScript = Array.from(scripts).find(s => !s.src);

    if (inlineScript) {
        dom.window.eval(inlineScript.textContent);
    }

    // Now trigger the comment submission
    const commentInput = window.document.getElementById('comment-input');
    commentInput.value = 'Test error comment';

    // Keep track of console.error output from the script
    const loggedErrors = [];
    window.console.error = (...args) => {
        loggedErrors.push(args);
    };

    // Call submitComment directly
    window.submitComment();

    // Wait for the promise rejection
    await new Promise(resolve => setTimeout(resolve, 50));

    // Assert that console.error was called with the expected message
    assert.strictEqual(loggedErrors.length, 1);
    assert.strictEqual(loggedErrors[0][0], "Error adding document: ");
    assert.strictEqual(loggedErrors[0][1].message, "Simulated Firebase error");
});