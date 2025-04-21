/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = "performance-reports";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "info",
    output: "html",
    onlyCategories: ["performance"],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse("http://localhost:3000", options);

    const reportHtml = runnerResult.report;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(
      __dirname,
      "..",
      OUTPUT_DIR,
      `report-${timestamp}.html`
    );

    fs.writeFileSync(reportPath, reportHtml);
    console.log(`Performance report saved to: ${reportPath}`);

    const score = runnerResult.lhr.categories.performance.score * 100;
    const metrics = runnerResult.lhr.audits.metrics.details.items[0];

    console.log("\n--- Performance Summary ---");
    console.log(`Performance Score: ${score}`);
    console.log(`First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
    console.log(
      `Largest Contentful Paint: ${metrics.largestContentfulPaint}ms`
    );
    console.log(`Time to Interactive: ${metrics.interactive}ms`);
    console.log(`Total Blocking Time: ${metrics.totalBlockingTime}ms`);
    console.log(`Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}`);
  } catch (error) {
    console.error("Error running Lighthouse:", error);
  } finally {
    await chrome.kill();
  }
}

// Iniciar el servidor Next.js en modo desarrollo
const server = exec("npm run dev");

// Esperar a que el servidor esté listo
setTimeout(async () => {
  await runLighthouse();
  server.kill();
  process.exit(0);
}, 10000);
