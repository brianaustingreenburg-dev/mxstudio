import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':408,'height':600},device_scale_factor=300/96)
        for name,pdf in [('tables','La-Bahia-Table-Cards-Mesas-1-10.pdf'),('rooms','Hotel-Caleta-Room-Cards.pdf')]:
            await pg.goto(f'file:///home/claude/card/{name}.html'); await pg.wait_for_timeout(800)
            await pg.pdf(path=pdf,width='4.25in',height='6.25in',print_background=True)
            c=await pg.locator('.c').count()
            for i in range(c):
                await pg.locator('.c').nth(i).screenshot(path=f'/tmp/claude-0/{name}-{i}.png')
        await b.close()
asyncio.run(main())
