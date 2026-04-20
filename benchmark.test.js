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

test('handles comments with no replies', async (t) => {
    const originalCollectionGroup = db.collectionGroup;

    // Override collectionGroup to return no replies
    db.collectionGroup = (name) => ({
        orderBy: (field, direction) => ({
            get: async () => {
                return { forEach: () => {} }; // Empty snapshot
            }
        })
    });

    try {
        const { results } = await loadCommentsOptimized();

        assert.strictEqual(results.length, 5, 'Should still load all 5 comments');
        results.forEach(comment => {
            assert.deepStrictEqual(comment.replies, [], `Comment ${comment.commentId} should have an empty replies array`);
        });
    } finally {
        // Restore original mock
        db.collectionGroup = originalCollectionGroup;
    }
});

test('handles mixed replies correctly', async (t) => {
    const originalCollectionGroup = db.collectionGroup;

    // Override collectionGroup to return replies only for comment_2 and comment_4
    db.collectionGroup = (name) => ({
        orderBy: (field, direction) => ({
            get: async () => {
                if (name === 'replies') {
                    return {
                        forEach: (callback) => {
                            [2, 4].forEach(commentId => {
                                callback({
                                    id: `reply_${commentId}_1`,
                                    ref: { parent: { parent: { id: `comment_${commentId}` } } },
                                    data: () => ({ text: `Only reply to comment_${commentId}` })
                                });
                            });
                        }
                    };
                }
                return { forEach: () => {} };
            }
        })
    });

    try {
        const { results } = await loadCommentsOptimized();

        assert.strictEqual(results.length, 5, 'Should load all 5 comments');

        const comment1 = results.find(r => r.commentId === 'comment_1');
        assert.deepStrictEqual(comment1.replies, [], 'Comment 1 should have no replies');

        const comment2 = results.find(r => r.commentId === 'comment_2');
        assert.strictEqual(comment2.replies.length, 1, 'Comment 2 should have 1 reply');
        assert.strictEqual(comment2.replies[0].text, 'Only reply to comment_2');

        const comment3 = results.find(r => r.commentId === 'comment_3');
        assert.deepStrictEqual(comment3.replies, [], 'Comment 3 should have no replies');

        const comment4 = results.find(r => r.commentId === 'comment_4');
        assert.strictEqual(comment4.replies.length, 1, 'Comment 4 should have 1 reply');
        assert.strictEqual(comment4.replies[0].text, 'Only reply to comment_4');

        const comment5 = results.find(r => r.commentId === 'comment_5');
        assert.deepStrictEqual(comment5.replies, [], 'Comment 5 should have no replies');

    } finally {
        // Restore original mock
        db.collectionGroup = originalCollectionGroup;
    }
});
