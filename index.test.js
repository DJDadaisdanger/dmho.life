const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read index.html
const html = fs.readFileSync('index.html', 'utf8');

// Extract the showToast function
const match = html.match(/function showToast\(message, duration = 5000\) \{[\s\S]*?\}(?=\s*if\s*\(\/Mobi\|Android\/i\.test)/);

if (!match) {
    throw new Error('Could not find showToast function in index.html');
}

test('showToast functionality', async (t) => {
    let window, document;

    t.beforeEach(() => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        window = dom.window;
        document = window.document;
        global.document = document;
        global.window = window;
        global.navigator = { userAgent: 'node' };
    });

    t.afterEach(() => {
        delete global.document;
        delete global.window;
        delete global.navigator;
    });

    await t.test('creates toast container if it does not exist', () => {
        // Evaluate the function into the current scope
        const showToast = new Function('message', 'duration', match[0] + '\nreturn showToast(message, duration);');

        showToast('Test Message', 1000);

        const container = document.getElementById('toast-container');
        assert.ok(container, 'Container should be created');
        assert.strictEqual(container.style.position, 'fixed', 'Container should have fixed position');
        assert.strictEqual(container.style.bottom, '20px', 'Container should be positioned at bottom');
    });

    await t.test('creates toast message and appends it to container', () => {
        const showToast = new Function('message', 'duration', match[0] + '\nreturn showToast(message, duration);');

        showToast('Test Message', 1000);

        const container = document.getElementById('toast-container');
        assert.strictEqual(container.childNodes.length, 1, 'Container should have one child');

        const toast = container.firstChild;
        assert.strictEqual(toast.textContent, 'Test Message', 'Toast should have correct message');
        assert.strictEqual(toast.style.backgroundColor, 'rgb(0, 0, 18)', 'Toast should have dark blue background (#000012 converted to rgb)');
    });

    await t.test('reuses existing container', () => {
        const showToast = new Function('message', 'duration', match[0] + '\nreturn showToast(message, duration);');

        // Call twice
        showToast('First', 1000);
        showToast('Second', 1000);

        const containers = document.querySelectorAll('#toast-container');
        assert.strictEqual(containers.length, 1, 'Should only create one container');

        const container = containers[0];
        assert.strictEqual(container.childNodes.length, 2, 'Container should have two toasts');
    });

    await t.test('removes toast and container after duration', async () => {
        // Mock setTimeout
        const originalSetTimeout = global.setTimeout;
        let timeoutCallbacks = [];
        global.setTimeout = (cb, delay) => {
            timeoutCallbacks.push({ cb, delay });
            return 1;
        };

        try {
            const showToast = new Function('message', 'duration', match[0] + '\nreturn showToast(message, duration);');

            showToast('Test', 1000);

            const container = document.getElementById('toast-container');
            assert.ok(container, 'Container exists initially');
            assert.strictEqual(container.childNodes.length, 1, 'Toast exists initially');

            // Trigger first timeout (duration)
            assert.strictEqual(timeoutCallbacks.length, 1, 'Duration timeout scheduled');
            timeoutCallbacks[0].cb();

            // Trigger second timeout (fade out 500ms)
            assert.strictEqual(timeoutCallbacks.length, 2, 'Fade out timeout scheduled');
            timeoutCallbacks[1].cb();

            assert.strictEqual(container.childNodes.length, 0, 'Toast removed');
            assert.strictEqual(document.getElementById('toast-container'), null, 'Container removed when empty');
        } finally {
            global.setTimeout = originalSetTimeout;
        }
    });
});
