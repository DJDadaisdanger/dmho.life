import asyncio
from playwright.async_api import async_playwright
import os
import time

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        file_path = f"file://{os.path.abspath('aboutme.html')}"
        await page.goto(file_path)

        # Benchmark script evaluated in browser
        result = await page.evaluate("""
            () => {
                const cardContainer = document.querySelector('.card-container');
                const card = document.querySelector('.card');

                // Warmup
                for (let i = 0; i < 1000; i++) {
                    cardContainer.getBoundingClientRect();
                }

                const start = performance.now();
                for (let i = 0; i < 100000; i++) {
                    const rect = cardContainer.getBoundingClientRect();
                    const x = 100 - rect.left;
                    const y = 100 - rect.top;
                    const rotateX = (y / rect.height - 0.5) * -25;
                    const rotateY = (x / rect.width - 0.5) * 25;
                    // card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
                }
                const end = performance.now();

                // Benchmark cached
                let cachedRect = cardContainer.getBoundingClientRect();
                const startCached = performance.now();
                for (let i = 0; i < 100000; i++) {
                    const rect = cachedRect;
                    const x = 100 - rect.left;
                    const y = 100 - rect.top;
                    const rotateX = (y / rect.height - 0.5) * -25;
                    const rotateY = (x / rect.width - 0.5) * 25;
                }
                const endCached = performance.now();

                return {
                    uncached: end - start,
                    cached: endCached - startCached
                };
            }
        """)

        print(f"Uncached Time (100k iterations): {result['uncached']:.2f} ms")
        print(f"Cached Time (100k iterations): {result['cached']:.2f} ms")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
