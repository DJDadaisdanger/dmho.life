const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('firebase-init.js initializes Firebase with correct config and creates db/collection', () => {
    // Read the script safely
    const scriptPath = path.join(__dirname, 'firebase-init.js');
    const script = fs.readFileSync(scriptPath, 'utf8');

    // Create a mock for firebase
    let initializedConfig = null;
    let firestoreCalled = false;
    let collectionName = null;

    const mockDb = {
        collection: (name) => {
            collectionName = name;
            return 'mockCollection';
        }
    };

    global.firebase = {
        initializeApp: (config) => {
            initializedConfig = config;
        },
        firestore: () => {
            firestoreCalled = true;
            return mockDb;
        }
    };

    try {
        // Execute the script
        eval(script);

        // Assert initializeApp was called with config containing expected keys
        assert.ok(initializedConfig, 'firebase.initializeApp should have been called');
        assert.strictEqual(initializedConfig.projectId, 'dmho-life', 'Should initialize with correct projectId');
        assert.strictEqual(initializedConfig.apiKey, 'AIzaSyA9BBRXlH0aWNa0CakMFtqnnrutQnAdHbk', 'Should initialize with correct apiKey');

        assert.ok(firestoreCalled, 'firebase.firestore() should have been called');
        assert.strictEqual(collectionName, 'comments', 'db.collection should have been called with "comments"');
    } finally {
        // Clean up
        delete global.firebase;
    }
});
