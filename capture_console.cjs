/**
 * Script para capturar logs del navegador usando Puppeteer
 * Esto nos permite ver exactamente qué errores hay en la consola
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🔍 Launching browser to capture console logs...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const logs = [];

  // Capture console logs
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const logEntry = `[${type.toUpperCase()}] ${text}`;
    console.log(logEntry);
    logs.push(logEntry);
  });

  // Capture page errors
  page.on('pageerror', error => {
    const logEntry = `[PAGE ERROR] ${error.message}\n${error.stack}`;
    console.error(logEntry);
    logs.push(logEntry);
  });

  // Capture failed requests
  page.on('requestfailed', request => {
    const logEntry = `[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`;
    console.error(logEntry);
    logs.push(logEntry);
  });

  try {
    console.log('📡 Navigating to http://localhost:5173...\n');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for React to render
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'dashboard_screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved to dashboard_screenshot.png');

    // Get page content
    const content = await page.content();
    fs.writeFileSync('dashboard_page.html', content);
    console.log('💾 Page HTML saved to dashboard_page.html');

    // Check if root element has content
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        exists: !!root,
        hasChildren: root?.children.length || 0,
        innerHTML: root?.innerHTML.substring(0, 500) || ''
      };
    });

    console.log('\n🔍 Root element analysis:');
    console.log('  - Exists:', rootContent.exists);
    console.log('  - Has children:', rootContent.hasChildren);
    console.log('  - Content preview:', rootContent.innerHTML.substring(0, 200));

  } catch (error) {
    console.error('\n❌ Error during navigation:', error.message);
    logs.push(`[NAVIGATION ERROR] ${error.message}`);
  }

  // Save all logs to file
  fs.writeFileSync('console_logs.txt', logs.join('\n'));
  console.log('\n💾 All logs saved to console_logs.txt');

  await browser.close();
  console.log('\n✅ Done!');
})();
