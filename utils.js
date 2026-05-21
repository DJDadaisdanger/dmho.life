function buildRepliesMap(repliesSnapshot) {
    const repliesMap = new Map();
    repliesSnapshot.forEach((replyDoc) => {
        const reply = replyDoc.data();
        const parentId = replyDoc.ref.parent.parent.id;
        if (!repliesMap.has(parentId)) {
            repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId).push(reply);
    });
    return repliesMap;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildRepliesMap };
} else {
    window.buildRepliesMap = buildRepliesMap;
}
