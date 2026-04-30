import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = "/Users/xiaotan/Documents/Codex/2026.4 web design/coding pages";
const outDir = path.join(root, "medlink-portal-ppt-assets");
const baseUrl = "http://localhost:3001";
const chromeForTesting =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setLocaleAndRole(context, role, language = "zh-CN") {
  await context.addInitScript(
    ({ nextRole, nextLanguage }) => {
      window.localStorage.setItem("medlink_role", nextRole);
      window.localStorage.setItem("medlink-language", nextLanguage);
    },
    { nextRole: role, nextLanguage: language }
  );
}

async function safeClick(locator, timeout = 3000) {
  try {
    await locator.click({ timeout });
    return true;
  } catch {
    return false;
  }
}

async function capturePatient(page) {
  await page.goto(`${baseUrl}/journey`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await wait(1200);

  await safeClick(page.getByRole("button", { name: /陈芳女士|Ms\. Chen|Fang Chen/i }).first());
  await safeClick(page.getByRole("button", { name: /下一步|Next|다음/ }).last());
  await wait(800);

  await safeClick(page.getByRole("button", { name: /准备我的病历|Prepare My Records|내 기록 준비하기/ }).first());
  await wait(2800);
  await safeClick(page.getByRole("button", { name: /下一步|Next|다음/ }).last());
  await wait(800);

  await safeClick(page.getByRole("button", { name: /普通感冒|Common cold|감기/ }).first());
  await wait(500);
  await safeClick(page.getByRole("button", { name: /下一步|Next|다음/ }).last());
  await wait(800);

  await safeClick(page.getByRole("button", { name: /帮我看看该去哪|Help me decide|어디로 가야/ }).first());
  try {
    await page.getByText(/推荐依据|Why this recommendation|추천 근거/).waitFor({ timeout: 9000 });
  } catch {
    await wait(5200);
  }
  await page.screenshot({ path: path.join(outDir, "patient-journey.png"), fullPage: false });
}

async function captureSimplePage(page, urlPath, outName) {
  await page.goto(`${baseUrl}${urlPath}`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await wait(1600);
  await page.screenshot({ path: path.join(outDir, outName), fullPage: false });
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromeForTesting });
  const viewport = { width: 1440, height: 900 };

  const patientContext = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await setLocaleAndRole(patientContext, "patient", "zh-CN");
  const patientPage = await patientContext.newPage();
  await capturePatient(patientPage);
  await patientContext.close();

  const partnerContext = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await setLocaleAndRole(partnerContext, "business", "zh-CN");
  const partnerPage = await partnerContext.newPage();
  await captureSimplePage(partnerPage, "/partners", "partner-portal.png");
  await partnerContext.close();

  const developerContext = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await setLocaleAndRole(developerContext, "professional", "zh-CN");
  const developerPage = await developerContext.newPage();
  await captureSimplePage(developerPage, "/medichain", "developer-portal.png");
  await developerContext.close();

  await browser.close();
  console.log(JSON.stringify({
    patient: path.join(outDir, "patient-journey.png"),
    partner: path.join(outDir, "partner-portal.png"),
    developer: path.join(outDir, "developer-portal.png")
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
