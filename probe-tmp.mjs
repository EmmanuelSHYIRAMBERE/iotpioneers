import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 300)); }); p.on("pageerror", (e) => errs.push("PAGEERROR " + e.message.slice(0, 300)));
await p.goto("http://localhost:3100/#iotdatahub");
await p.waitForTimeout(8000);
console.log(JSON.stringify(await p.evaluate(() => ({
  solIds: document.querySelectorAll("[data-solution-id]").length,
  solCards: document.querySelectorAll("#solutions ol > li").length,
  groups: [...document.querySelectorAll('[role="group"]')].map((g) => g.getAttribute("aria-label")),
  demo: document.getElementById("iotdatahub-demo")?.innerHTML.slice(0, 200),
  lg: matchMedia("(min-width: 1024px)").matches,
}))), errs);
await b.close();
