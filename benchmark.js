let getCalls = 0;
let snapshotCalls = 0;

const mockFirestore = {
    collection: (name) => ({
        orderBy: (field, direction) => ({
            onSnapshot: (callback) => {
                snapshotCalls++;
                if (name === 'comments') {
                    const docs = [1, 2, 3, 4, 5].map(id => ({
                        id: `comment_${id}`,
                        data: () => ({ text: `Comment ${id}` })
                    }));
                    callback({ forEach: (cb) => docs.forEach(cb) });
                } else {
                    callback({ forEach: () => {} });
                }
                return () => {};
            }
        }),
        doc: (id) => ({
            collection: (subName) => ({
                orderBy: (field, direction) => ({
                    onSnapshot: (callback) => {
                        snapshotCalls++;
                        callback({ forEach: () => {} });
                        return () => {};
                    }
                })
            })
        })
    }),
    collectionGroup: (name) => ({
        orderBy: (field, direction) => ({
            onSnapshot: (callback) => {
                snapshotCalls++;
                if (name === 'replies') {
                    const docs = [];
                    [1, 2, 3, 4, 5].forEach(commentId => {
                        [1, 2].forEach(replyId => {
                            docs.push({
                                id: `reply_${commentId}_${replyId}`,
                                ref: { parent: { parent: { id: `comment_${commentId}` } } },
                                data: () => ({ text: `Reply ${replyId} to comment_${commentId}` })
                            });
                        });
                    });
                    callback({ forEach: (cb) => docs.forEach(cb) });
                } else {
                    callback({ forEach: () => {} });
                }
                return () => {};
            }
        })
    })
};

const db = mockFirestore;
const commentsCollection = db.collection('comments');
const { buildRepliesMap } = require('./utils.js');

async function loadCommentsOptimized() {
    getCalls = 0;
    snapshotCalls = 0;

    let cachedComments = [];
    let cachedReplies = [];

    const commentsPromise = new Promise((resolve) => {
        commentsCollection.orderBy("timestamp", "desc").onSnapshot((snapshot) => {
            cachedComments = [];
            snapshot.forEach((doc) => {
                cachedComments.push({ id: doc.id, data: doc.data() });
            });
            resolve();
        });
    });

    const repliesPromise = new Promise((resolve) => {
        db.collectionGroup("replies").orderBy("timestamp", "asc").onSnapshot((snapshot) => {
            cachedReplies = [];
            snapshot.forEach((replyDoc) => {
                cachedReplies.push({
                    id: replyDoc.id,
                    data: replyDoc.data(),
                    parentId: replyDoc.ref.parent.parent.id
                });
            });
            resolve();
        });
    });

    await Promise.all([commentsPromise, repliesPromise]);

    const repliesMap = new Map();
    cachedReplies.forEach((reply) => {
        if (!repliesMap.has(reply.parentId)) {
            repliesMap.set(reply.parentId, []);
        }
        repliesMap.get(reply.parentId).push(reply.data);
    });

    const results = [];
    cachedComments.forEach((commentObj) => {
        const commentId = commentObj.id;
        const comment = commentObj.data;
        const replies = repliesMap.get(commentId) || [];
        results.push({ commentId, text: comment.text, replies });
    });

    return { results, getCalls, snapshotCalls };
}

if (require.main === module) {
    loadCommentsOptimized().then(({ results, getCalls, snapshotCalls }) => {
        console.log(`Total Firestore onSnapshot() registrations: ${snapshotCalls}`);
        console.log(`Total comments loaded: ${results.length}`);
        console.log(`Example comment_1 replies count: ${results.find(r => r.commentId === 'comment_1').replies.length}`);
    });
}

module.exports = { loadCommentsOptimized, db };
