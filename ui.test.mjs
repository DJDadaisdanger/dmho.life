import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

test('showCommentBox toggles the display style of comment-box-container', (t) => {
    // Read the HTML file
    const html = fs.readFileSync('./research.html', 'utf-8');

    // Extract the showCommentBox function as a string
    const functionRegex = /function showCommentBox\(\) \{[\s\S]*?\n\s*\}/;
    const match = html.match(functionRegex);
    assert.ok(match, 'showCommentBox function should exist in the HTML');
    const showCommentBoxStr = match[0];

    // Remove all script tags from HTML to prevent external dependencies and errors from running
    const cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Set up JSDOM
    const dom = new JSDOM(cleanHtml, { runScripts: "dangerously" });
    const window = dom.window;
    const document = window.document;

    // Evaluate the showCommentBox function inside the JSDOM context
    window.eval(showCommentBoxStr);

    const commentBox = document.getElementById('comment-box-container');

    // Initial state: it's defined as inline style="display: none; margin-top: 20px;" in research.html
    assert.strictEqual(commentBox.style.display, 'none', 'Initial display should be none');

    // Call the function
    window.showCommentBox();

    // State after first call
    assert.strictEqual(commentBox.style.display, 'block', 'Display should be block after first toggle');

    // Call the function again
    window.showCommentBox();

    // State after second call
    assert.strictEqual(commentBox.style.display, 'none', 'Display should be none after second toggle');
});
