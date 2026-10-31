import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':504,'height':696},device_scale_factor=300/96)
        await pg.goto('file:///home/claude/card/card.html'); await pg.wait_for_timeout(800)
        await pg.pdf(path='MX-Studio-Card-5x7.pdf',width='5.25in',height='7.25in',print_background=True)
        for i,n in enumerate(['front','back']):
            await pg.locator('.side').nth(i).screenshot(path=f'MX-Studio-Card-{n}.png')
        await b.close()
asyncio.run(main())
