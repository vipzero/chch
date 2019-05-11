import puppeteer from "puppeteer"

async function main(threadURL: string, text: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  const page = await browser.newPage()
  await page.goto(threadURL)
  await page.type("form textarea", text)
  await page.click("form [type=submit]")
  await page.waitForSelector("input[value=上記全てを承諾して書き込む]")

  await page.click("input[type=submit]")

  page.close()
  console.log("posted" + new Date())
}

function hosyu(threadURL: string, text: string, intervalMs: number) {
  console.log("hosyu start")
  setInterval(() => main(threadURL, text), intervalMs)
}

export default hosyu
