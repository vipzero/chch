import axios from "axios"
import cheerio from "cheerio"
import encoding from "encoding-japanese"
import _ from "lodash"
import { Post, PostName, Thread, ThreadMin } from "./types"
import { dateParse, getImgUrls, normalizeUrl, parseWacchoi } from "./util"

const host = "http://mi.5ch.net"
const makeThreadUrl = (id) => `${host}/test/read.cgi/news4vip/${id}`
const listPageUrl = `${host}/news4vip/subback.html`

axios.defaults.responseType = "arraybuffer"
axios.defaults.transformResponse = (data) =>
  encoding.convert(data, { to: "UNICODE", from: "SJIS", type: "string" })

export const client = axios.create({ withCredentials: true })
const sizeRegex = /\d+KB/
const part4VipRegex = /vip2ch\.com/
const resHeaderMatchRegex = /^\d+: ([\s\S]*?) \((\d+)\)$/

function titleParse(text: string): { title: string; count: number } | null {
  const m = resHeaderMatchRegex.exec(text)

  if (!m || !m[1]) {
    return null
  }

  return { title: m[1], count: Number(m[2]) }
}

const toName = (raw: string): PostName => {
  const [wacchoi, base] = parseWacchoi(raw)

  return {
    raw,
    base,
    wacchoi,
    isDefault: base === "以下、5ちゃんねるからVIPがお送りします",
  }
}

export async function getThreads(url) {
  const res = await client.get(url || listPageUrl)
  const $ = cheerio.load(res.data)
  const threads: ThreadMin[] = []

  $("#trad > a").each((i, elA) => {
    const a = $(elA)
    const res = titleParse(a.text())

    if (!res || !res.title) {
      return
    }
    const { title, count } = res
    const href = a.attr("href")

    if (!href) throw new Error("parse html error")
    const id = href.split("/")[0]
    const url = makeThreadUrl(id)

    threads.push({ id, title, url, count })
  })
  return { threads }
}

export async function getThreadPart4Vip(
  url: string,
  from = 1
): Promise<Thread> {
  const $ = cheerio.load((await client.get(`${url}${from}-`)).data)

  const title = $("h1").text().trim()
  const size = $("font > b").text()

  const posts: Post[] = []

  // console.log(_.zip($("dl > dt"), $("dl > dd")))
  _.zip($("dl > dt"), $("dl > dd")).forEach(([dt, dd], i) => {
    if (!dd || !dt) {
      return
    }
    // console.log(dd)
    const $dt = $(dt)
    const $dd = $(dd)
    const number = i + 1
    const name = toName($dt.find(".name").text())
    const infoText = $dt.find(".info").text()
    const m = /：(.*) ID:(.*)/.exec(infoText) || []
    const dateStr = m[1]
    const userId = m[2]
    const timestamp = dateParse(dateStr)
    const comma = Number(dateStr.split(".")[1])
    const message = $dd.text().trim()

    posts.push({ number, name, userId, timestamp, comma, message, images: [] })
  })
  const postCount = posts.length
  // NOTE: パー速は finish 未対応
  const finish = false

  return { title, url, postCount, size, posts, finish }
}

export async function getThreadVip(url: string, from = 1): Promise<Thread> {
  const $ = cheerio.load((await client.get(`${url}${from}-`)).data)
  const title = $(".title").text().trim()
  const m = sizeRegex.exec($(".metastats.meta.centered").text())
  const size = m ? m[0] : ""
  const posts: Post[] = []

  $(".post").each((i, elA) => {
    const div = $(elA)
    const number = Number(div.find(".number").text())
    const name = toName(div.find(".name").text())
    const userId = div.find(".uid").text().split(":")[1]
    const dateStr = div.find(".date").text()
    const timestamp = dateParse(dateStr)
    const comma = Number(dateStr.split(".")[1])
    const message = div.find(".message").text().trim()
    const img = div.find(".message img").eq(0)
    const images = getImgUrls(message)

    if (img.length > 0) {
      const imgurl = img.attr("src")

      if (imgurl) {
        images.push(imgurl)
      }
    }

    posts.push({
      number,
      name,
      userId,
      timestamp,
      comma,
      message,
      images,
    })
  })
  const postCount = posts.length
  const finish = $(".stopdone").length > 0

  return { title, url, postCount, size, posts, finish }
}

export function getThread(_url: string, from = 1) {
  const url = normalizeUrl(_url)

  if (part4VipRegex.exec(url)) {
    return getThreadPart4Vip(url, from)
  } else {
    return getThreadVip(url, from)
  }
}

function generateForm(data: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams()

  _.each(data, (value, key) => {
    params.append(key, value)
  })
  return params
}

const headersText = `
accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
accept-encoding: gzip, deflate, br
accept-language: ja,en-US;q=0.9,en;q=0.8
cache-control: max-age=0
content-type: application/x-www-form-urlencoded
sec-fetch-mode: navigate
sec-fetch-site: cross-site
sec-fetch-dest: document
sec-fetch-user: ?1
upgrade-insecure-requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 OPR/73.0.3856.284
`.trim()
const baseHeader = headersText
  .split("\n")
  .map((line) => line.split(": "))
  .reduce((p, [k, v]) => ({ ...p, [k]: v }), {})

export async function postMessage(url, message) {
  const { origin, pathname } = new URL(url)
  const paths = _.compact(pathname.split("/"))
  const [thread, bbs] = _.reverse(paths)
  const bbsUrl = `${origin}/test/bbs.cgi`
  const cookies = ["yuki=akari"]
  const headers = {
    ...baseHeader,
    origin,
    referer: url,
    cookie: cookies.join("; "),
  }

  const time = `${Math.floor(Date.now() / 1000) - 10}`
  const makeForm = {
    FROM: "",
    mail: "",
    MESSAGE: message,
    bbs,
    key: thread,
    time,
    submit: "書き込む",
    // eslint-disable-next-line
    oekaki_thread1: "",
  }
  const form = generateForm(makeForm)
  const post = (headers) => client.post<string>(bbsUrl, form, { headers })
  const res = await post(headers)

  console.log(res.data)

  if (res.data && res.data.includes("書き込み確認")) {
    await post(headers)
  }
}
