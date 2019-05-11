import puppeteer, { Page } from "puppeteer"
import holiday from "holiday-jp"
import { hosyuIntervalTimeMinute } from "./util"

const startText = `
保守スタート
新・保守時間目安表 (休日用)
00:00-02:00 10分以内
02:00-04:00 20分以内
04:00-09:00 40分以内
09:00-16:00 15分以内
16:00-19:00 10分以内
19:00-00:00 5分以内

新・保守時間の目安 (平日用)
00:00-02:00 15分以内
02:00-04:00 25分以内
04:00-09:00 45分以内
09:00-16:00 25分以内
16:00-19:00 15分以内
19:00-00:00 5分以内
`
function isHoliday(date: Date) {
  const day = date.getDay()
  return day === 0 || day === 6 || holiday.isHoliday(date)
}

function nextIntervalMinute(date: Date): number {
  return hosyuIntervalTimeMinute(date.getHours(), isHoliday(date))
}

let page: Page | undefined = undefined

async function main(threadURL: string, text: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  if (!page) {
    page = await browser.newPage()
  }
  await page.goto(threadURL)
  await page.type("form textarea", text)
  await page.click("form [type=submit]")
  page
    .waitForSelector("input[value=上記全てを承諾して書き込む]", {
      timeout: 10000,
    })
    .then(() => {
      if (page) {
        page.click("input[type=submit]")
      }
    })
    .catch(() => {})

  const now = new Date()
  const next = nextIntervalMinute(now)
  console.log(`posted: ${now} next: ${next}min`)
  setTimeout(main, next * 60 * 1000)
}

function hosyu(threadURL: string, text: string, intervalMs: number) {
  console.log(startText)
  main(threadURL, text)
}

export default hosyu
