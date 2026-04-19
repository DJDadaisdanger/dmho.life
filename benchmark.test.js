const test = require('node:test');
const assert = require('node:assert');
const { loadCommentsOptimized } = require('./benchmark.js');

test('loadCommentsOptimized returns correct results and call count', async (t) => {
    const { results, getCalls } = await loadCommentsOptimized();

    // Verify number of Firestore get() calls
    assert.strictEqual(getCalls, 2, 'Should make exactly 2 Firestore get() calls');

    // Verify number of comments loaded
    assert.strictEqual(results.size, 5, 'Should load 5 comments');

    // Verify the structure of the first comment and its replies
    const firstComment = results.get('comment_1');
    assert.ok(firstComment, 'Comment 1 should exist');
    assert.strictEqual(firstComment.text, 'Comment 1');
    assert.strictEqual(firstComment.replies.length, 2, 'Comment 1 should have 2 replies');

    assert.strictEqual(firstComment.replies[0].text, 'Reply 1 to comment_1');
    assert.strictEqual(firstComment.replies[1].text, 'Reply 2 to comment_1');
});

test('each comment has the correct number of replies', async (t) => {
    const { results } = await loadCommentsOptimized();

    results.forEach((comment) => {
        assert.strictEqual(comment.replies.length, 2, `Comment ${comment.commentId} should have 2 replies`);
    });
});
