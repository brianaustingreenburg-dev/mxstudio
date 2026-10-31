import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':360,'height':216},device_scale_factor=600/96)
        await pg.goto('file:///home/claude/card/order.html'); await pg.wait_for_timeout(800)
        await pg.pdf(path='Restaurant-Order-Card-Sample.pdf',width='3.75in',height='2.25in',print_background=True)
        for i,n in enumerate(['front','back']):
            await pg.locator('.side').nth(i).screenshot(path=f'Restaurant-Order-Card-{n}.png')
        await b.close()
asyncio.run(main())
