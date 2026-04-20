const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

function extractLoadCommentsFunction(html) {
    const startStr = 'function loadComments() {';
    const startIndex = html.indexOf(startStr);
    if (startIndex === -1) throw new Error('Could not find function loadComments()');

    // Simple bracket matching parser to find the end of the function
    let openBrackets = 0;
    let i = startIndex + startStr.length - 1; // Start at the '{'

    while (i < html.length) {
        if (html[i] === '{') openBrackets++;
        else if (html[i] === '}') openBrackets--;

        if (openBrackets === 0) {
            return html.slice(startIndex, i + 1);
        }
        i++;
    }

    throw new Error('Could not find the end of function loadComments()');
}

test('loadComments integration test', async (t) => {
    const html = fs.readFileSync('research.html', 'utf8');
    const functionCode = extractLoadCommentsFunction(html);

    class MockElement {
        constructor(tagName) {
            this.tagName = tagName;
            this.innerHTML = '';
            this.textContent = '';
            this.children = [];
            this.classList = {
                classes: new Set(),
                add: (cls) => this.classList.classes.add(cls)
            };
            this.style = {};
            this.onclick = null;
        }

        appendChild(child) {
            this.children.push(child);
        }
    }

    const mockDocument = {
        elements: {},
        getElementById: function(id) {
            if (!this.elements[id]) {
                this.elements[id] = new MockElement('div');
                this.elements[id].id = id;
            }
            return this.elements[id];
        },
        createElement: function(tagName) {
            return new MockElement(tagName);
        }
    };

    const mockFirebase = {
        auth: () => ({
            currentUser: { uid: 'user1' }
        })
    };

    const mockComments = [
        { id: 'c1', data: () => ({ text: 'First comment', authorId: 'user1' }) },
        { id: 'c2', data: () => ({ text: 'Second comment', authorId: 'user2' }) }
    ];

    const mockReplies = [
        {
            data: () => ({ text: 'Reply to first', authorId: 'user2' }),
            ref: { parent: { parent: { id: 'c1' } } }
        }
    ];

    let commentsQueryCalled = false;
    const mockCommentsCollection = {
        orderBy: (field, direction) => {
            assert.strictEqual(field, 'timestamp');
            assert.strictEqual(direction, 'desc');
            return {
                get: async () => {
                    commentsQueryCalled = true;
                    return mockComments;
                }
            };
        }
    };

    let repliesQueryCalled = false;
    const mockDb = {
        collectionGroup: (collectionId) => {
            assert.strictEqual(collectionId, 'replies');
            return {
                orderBy: (field, direction) => {
                    assert.strictEqual(field, 'timestamp');
                    assert.strictEqual(direction, 'asc');
                    return {
                        get: async () => {
                            repliesQueryCalled = true;
                            return mockReplies;
                        }
                    };
                }
            };
        }
    };

    const context = {
        document: mockDocument,
        console: console,
        commentsCollection: mockCommentsCollection,
        db: mockDb,
        firebase: mockFirebase,
        replyToComment: () => {},
        editComment: () => {},
        deleteComment: () => {}
    };

    vm.createContext(context);
    vm.runInContext(functionCode, context);

    await context.loadComments();

    assert.strictEqual(commentsQueryCalled, true, 'Comments query should be called');
    assert.strictEqual(repliesQueryCalled, true, 'Replies query should be called');

    const commentsList = mockDocument.getElementById('comments-list');

    assert.strictEqual(commentsList.children.length, 2, 'Should render 2 comments');

    const firstCommentEl = commentsList.children[0];
    assert.strictEqual(firstCommentEl.children[0].textContent, 'First comment');

    const actions1 = firstCommentEl.children[1];
    assert.strictEqual(actions1.children.length, 3, 'Should have 3 action buttons for own comment');
    assert.strictEqual(actions1.children[0].textContent, 'Reply');
    assert.strictEqual(actions1.children[1].textContent, 'Edit');
    assert.strictEqual(actions1.children[2].textContent, 'Delete');

    const repliesList = firstCommentEl.children[2];
    assert.strictEqual(repliesList.children.length, 1, 'Should render 1 reply');
    assert.strictEqual(repliesList.children[0].textContent, 'Reply to first');

    const secondCommentEl = commentsList.children[1];
    assert.strictEqual(secondCommentEl.children[0].textContent, 'Second comment');

    const actions2 = secondCommentEl.children[1];
    assert.strictEqual(actions2.children.length, 1, 'Should have 1 action button for others comment');
    assert.strictEqual(actions2.children[0].textContent, 'Reply');
});

test('loadComments handles missing currentUser (unauthenticated)', async (t) => {
    const html = fs.readFileSync('research.html', 'utf8');
    const functionCode = extractLoadCommentsFunction(html);

    class MockElement {
        constructor(tagName) {
            this.tagName = tagName;
            this.innerHTML = '';
            this.textContent = '';
            this.children = [];
            this.classList = {
                classes: new Set(),
                add: (cls) => this.classList.classes.add(cls)
            };
            this.style = {};
            this.onclick = null;
        }

        appendChild(child) {
            this.children.push(child);
        }
    }

    const mockDocument = {
        elements: {},
        getElementById: function(id) {
            if (!this.elements[id]) {
                this.elements[id] = new MockElement('div');
                this.elements[id].id = id;
            }
            return this.elements[id];
        },
        createElement: function(tagName) {
            return new MockElement(tagName);
        }
    };

    const mockFirebase = {
        auth: () => ({
            currentUser: null
        })
    };

    const mockComments = [
        { id: 'c1', data: () => ({ text: 'First comment', authorId: 'user1' }) }
    ];

    const mockCommentsCollection = {
        orderBy: () => ({ get: async () => mockComments })
    };

    const mockDb = {
        collectionGroup: () => ({
            orderBy: () => ({ get: async () => [] })
        })
    };

    const context = {
        document: mockDocument,
        console: console,
        commentsCollection: mockCommentsCollection,
        db: mockDb,
        firebase: mockFirebase
    };

    vm.createContext(context);
    vm.runInContext(functionCode, context);

    await context.loadComments();

    const commentsList = mockDocument.getElementById('comments-list');

    const firstCommentEl = commentsList.children[0];
    const actions = firstCommentEl.children[1];
    assert.strictEqual(actions.children.length, 1, 'Should only have Reply button when unauthenticated');
    assert.strictEqual(actions.children[0].textContent, 'Reply');
});

test('loadComments handles errors correctly', async (t) => {
    const html = fs.readFileSync('research.html', 'utf8');
    const functionCode = extractLoadCommentsFunction(html);

    const mockCommentsCollection = {
        orderBy: () => ({ get: async () => { throw new Error('Firestore Error'); } })
    };

    const mockDb = {
        collectionGroup: () => ({
            orderBy: () => ({ get: async () => [] })
        })
    };

    let errorLogged = false;
    const context = {
        console: {
            error: (msg, err) => {
                if (msg.includes('Error loading comments') && err.message === 'Firestore Error') {
                    errorLogged = true;
                }
            }
        },
        commentsCollection: mockCommentsCollection,
        db: mockDb,
    };

    vm.createContext(context);
    vm.runInContext(functionCode, context);

    await context.loadComments();
    assert.strictEqual(errorLogged, true, 'Error should be caught and logged');
});
