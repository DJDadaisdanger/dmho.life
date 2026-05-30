const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read index.html
const html = fs.readFileSync('index.html', 'utf8');

test('showToast functionality', async (t) => {
    let dom;
    let window;
    let document;

    t.beforeEach(() => {
        // Setup JSDOM with the actual HTML content
        dom = new JSDOM(html, { runScripts: 'dangerously' });
        window = dom.window;
        document = window.document;
    });

    t.afterEach(() => {
        if (window) {
            window.close();
        }
    });

    await t.test('creates toast container and toast element', () => {
        window.showToast('Test message 1');

        const container = document.getElementById('toast-container');
        assert.ok(container, 'Toast container should be created');
        assert.strictEqual(container.style.position, 'fixed', 'Container should have fixed position');

        const toasts = container.childNodes;
        assert.strictEqual(toasts.length, 1, 'One toast should be added');
        assert.strictEqual(toasts[0].textContent, 'Test message 1', 'Toast should have correct message');
        assert.strictEqual(toasts[0].style.opacity, '1', 'Toast opacity should be set to 1 after reflow');
    });

    await t.test('appends to existing container for multiple toasts', () => {
        window.showToast('Test message 1');
        window.showToast('Test message 2');

        const container = document.getElementById('toast-container');
        assert.ok(container, 'Toast container should be present');

        // Ensure only 1 container was created
        const containers = document.querySelectorAll('#toast-container');
        assert.strictEqual(containers.length, 1, 'Only one container should be created');

        const toasts = container.childNodes;
        assert.strictEqual(toasts.length, 2, 'Two toasts should be added to the container');
        assert.strictEqual(toasts[0].textContent, 'Test message 1', 'First toast should have correct message');
        assert.strictEqual(toasts[1].textContent, 'Test message 2', 'Second toast should have correct message');
    });

    await t.test('removes toast and container after duration', async () => {
        return new Promise((resolve) => {
            window.showToast('Test message timeout', 10); // Short duration for testing

            let container = document.getElementById('toast-container');
            assert.ok(container, 'Toast container should be created initially');
            assert.strictEqual(container.childNodes.length, 1, 'Toast should be inside container');

            // Wait for duration + timeout delay (500ms for fade out in the actual code)
            setTimeout(() => {
                container = document.getElementById('toast-container');
                assert.strictEqual(container, null, 'Container should be removed when empty');
                resolve();
            }, 10 + 500 + 50); // duration + fadeOut timeout + buffer
        });
    });
});
