const test = require('node:test');
const assert = require('node:assert');
const { loadCommentsOptimized, db } = require('./benchmark.js');

test('loadCommentsOptimized returns correct results and call count', async (t) => {
    const { results, getCalls } = await loadCommentsOptimized();

    // Verify number of Firestore get() calls
    assert.strictEqual(getCalls, 2, 'Should make exactly 2 Firestore get() calls');

    // Verify number of comments loaded
    assert.strictEqual(results.length, 5, 'Should load 5 comments');

    // Verify the structure of the first comment and its replies
    const firstComment = results.find(r => r.commentId === 'comment_1');
    assert.ok(firstComment, 'Comment 1 should exist');
    assert.strictEqual(firstComment.text, 'Comment 1');
    assert.strictEqual(firstComment.replies.length, 2, 'Comment 1 should have 2 replies');

    assert.strictEqual(firstComment.replies[0].text, 'Reply 1 to comment_1');
    assert.strictEqual(firstComment.replies[1].text, 'Reply 2 to comment_1');
});

test('each comment has the correct number of replies', async (t) => {
    const { results } = await loadCommentsOptimized();

    results.forEach(comment => {
        assert.strictEqual(comment.replies.length, 2, `Comment ${comment.commentId} should have 2 replies`);
    });
});


test('loadCommentsOptimized handles empty comments response', async (t) => {
    const originalCollection = db.collection;
    const originalCollectionGroup = db.collectionGroup;

    db.collection = (name) => ({
        orderBy: () => ({
            get: async () => {
                if (name === 'comments') {
                    return { forEach: () => {} }; // Empty comments
                }
                return { forEach: () => {} };
            }
        })
    });

    db.collectionGroup = (name) => ({
        orderBy: () => ({
            get: async () => {
                if (name === 'replies') {
                    return { forEach: () => {} }; // Empty replies
                }
                return { forEach: () => {} };
            }
        })
    });

    try {
        const { results } = await loadCommentsOptimized();
        assert.strictEqual(results.length, 0, 'Should return empty results when no comments exist');
    } finally {
        db.collection = originalCollection;
        db.collectionGroup = originalCollectionGroup;
    }
});

test('loadCommentsOptimized handles empty replies response', async (t) => {
    const originalCollectionGroup = db.collectionGroup;

    db.collectionGroup = (name) => ({
        orderBy: () => ({
            get: async () => {
                if (name === 'replies') {
                    return { forEach: () => {} }; // Empty replies
                }
                return { forEach: () => {} };
            }
        })
    });

    try {
        const { results } = await loadCommentsOptimized();
        assert.strictEqual(results.length, 5, 'Should load 5 comments even if there are no replies');

        results.forEach(comment => {
            assert.strictEqual(comment.replies.length, 0, 'Replies array should be empty');
        });
    } finally {
        db.collectionGroup = originalCollectionGroup;
    }
});
