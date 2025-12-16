const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = process.argv[2] || 'http://localhost/admin.html';
  const out = process.argv[3] || 'admin-dark-screenshot.png';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // Set dark theme before navigation by setting localStorage on a blank page
    await page.goto('about:blank');
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));

    // Navigate to admin page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait a moment for UI to apply theme and any JS to run
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({ path: out, fullPage: true });
    console.log('Saved screenshot to', out);
  } catch (err) {
    console.error('Error taking screenshot:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();