const test = require('node:test');
const assert = require('node:assert');
const { buildRepliesMap } = require('./utils.js');

test('buildRepliesMap handles empty snapshot', () => {
    const repliesSnapshot = {
        forEach: (callback) => {}
    };

    const result = buildRepliesMap(repliesSnapshot);
    assert.strictEqual(result.size, 0);
});

test('buildRepliesMap handles single reply', () => {
    const repliesSnapshot = {
        forEach: (callback) => {
            callback({
                data: () => ({ text: 'Reply 1' }),
                ref: {
                    parent: {
                        parent: {
                            id: 'comment_1'
                        }
                    }
                }
            });
        }
    };

    const result = buildRepliesMap(repliesSnapshot);
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get('comment_1').length, 1);
    assert.strictEqual(result.get('comment_1')[0].text, 'Reply 1');
});

test('buildRepliesMap handles multiple replies for the same parent', () => {
    const repliesSnapshot = {
        forEach: (callback) => {
            callback({
                data: () => ({ text: 'Reply 1' }),
                ref: {
                    parent: {
                        parent: {
                            id: 'comment_1'
                        }
                    }
                }
            });
            callback({
                data: () => ({ text: 'Reply 2' }),
                ref: {
                    parent: {
                        parent: {
                            id: 'comment_1'
                        }
                    }
                }
            });
        }
    };

    const result = buildRepliesMap(repliesSnapshot);
    assert.strictEqual(result.size, 1);
    assert.strictEqual(result.get('comment_1').length, 2);
    assert.strictEqual(result.get('comment_1')[0].text, 'Reply 1');
    assert.strictEqual(result.get('comment_1')[1].text, 'Reply 2');
});

test('buildRepliesMap handles multiple replies for different parents', () => {
    const repliesSnapshot = {
        forEach: (callback) => {
            callback({
                data: () => ({ text: 'Reply 1' }),
                ref: {
                    parent: {
                        parent: {
                            id: 'comment_1'
                        }
                    }
                }
            });
            callback({
                data: () => ({ text: 'Reply 2' }),
                ref: {
                    parent: {
                        parent: {
                            id: 'comment_2'
                        }
                    }
                }
            });
            callback({
                data: () => ({ text: 'Reply 3' }),
                ref: {
                    parent: {
                        parent: {
                            id: 'comment_1'
                        }
                    }
                }
            });
        }
    };

    const result = buildRepliesMap(repliesSnapshot);
    assert.strictEqual(result.size, 2);
    assert.strictEqual(result.get('comment_1').length, 2);
    assert.strictEqual(result.get('comment_1')[0].text, 'Reply 1');
    assert.strictEqual(result.get('comment_1')[1].text, 'Reply 3');
    assert.strictEqual(result.get('comment_2').length, 1);
    assert.strictEqual(result.get('comment_2')[0].text, 'Reply 2');
});
