let getCalls = 0;

const mockFirestore = {
    collection: (name) => ({
        orderBy: (field, direction) => ({
            get: async () => {
                getCalls++;
                if (name === 'comments') {
                    return {
                        forEach: (callback) => {
                            [1, 2, 3, 4, 5].forEach(id => {
                                callback({
                                    id: `comment_${id}`,
                                    data: () => ({ text: `Comment ${id}` })
                                });
                            });
                        }
                    };
                }
                return { forEach: () => {} };
            }
        }),
        doc: (id) => ({
            collection: (subName) => ({
                orderBy: (field, direction) => ({
                    get: async () => {
                        getCalls++;
                        return { forEach: () => {} };
                    }
                })
            })
        })
    }),
    collectionGroup: (name) => ({
        orderBy: (field, direction) => ({
            get: async () => {
                getCalls++;
                if (name === 'replies') {
                    return {
                        forEach: (callback) => {
                            [1, 2, 3, 4, 5].forEach(commentId => {
                                [1, 2].forEach(replyId => {
                                    callback({
                                        id: `reply_${commentId}_${replyId}`,
                                        ref: { parent: { parent: { id: `comment_${commentId}` } } },
                                        data: () => ({ text: `Reply ${replyId} to comment_${commentId}` })
                                    });
                                });
                            });
                        }
                    };
                }
                return { forEach: () => {} };
            }
        })
    })
};

const db = mockFirestore;
const commentsCollection = db.collection('comments');

async function loadCommentsOptimized() {
    getCalls = 0;
    const commentsQuery = commentsCollection.orderBy("timestamp", "desc").get();
    const repliesQuery = db.collectionGroup("replies").orderBy("timestamp", "asc").get();

    const [commentsSnapshot, repliesSnapshot] = await Promise.all([commentsQuery, repliesQuery]);

    const repliesMap = new Map();
    repliesSnapshot.forEach((replyDoc) => {
        const reply = replyDoc.data();
        const parentId = replyDoc.ref.parent.parent.id;
        let replies = repliesMap.get(parentId);
        if (!replies) {
            replies = [];
            repliesMap.set(parentId, replies);
        }
        replies.push(reply);
    });

    const results = [];
    commentsSnapshot.forEach((doc) => {
        const comment = doc.data();
        const commentId = doc.id;
        const replies = repliesMap.get(commentId) || [];
        results.push({ commentId, text: comment.text, replies });
    });

    return { results, getCalls };
}

if (require.main === module) {
    loadCommentsOptimized().then(({ results, getCalls }) => {
        console.log(`Total Firestore get() calls: ${getCalls}`);
        console.log(`Total comments loaded: ${results.length}`);
        console.log(`Example comment_1 replies count: ${results.find(r => r.commentId === 'comment_1').replies.length}`);
    });
}

module.exports = { loadCommentsOptimized, db };
