import cheerio from "cheerio"
import { Iconv } from "iconv"
import axios from "axios"
import dayjs from "dayjs"
import _ from "lodash"

const host = "http://hebi.5ch.net"
const makeThreadUrl = id => `${host}/test/read.cgi/news4vip/${id}`
const listPageUrl = `${host}/news4vip/subback.html`

const sjis2utf8 = new Iconv("SHIFT_JIS", "UTF-8//TRANSLIT//IGNORE")

axios.defaults.responseType = "arraybuffer"
axios.defaults.transformResponse = [data => sjis2utf8.convert(data).toString()]

function titleParse(text: string): { title: string; count: number } | null {
  const m = text.match(/^\d+: ([\s\S]*?) \((\d+)\)$/)
  if (!m || !m[1]) {
    return null
  }

  return { title: m[1], count: Number(m[2]) }
}
type ThreadMin = { id: string; title: string; url: string; count: number }

export async function getThreads() {
  const res = await axios.get(listPageUrl)
  const $ = cheerio.load(res.data)
  const threads: ThreadMin[] = []
  $("#trad > a").map((i, elA) => {
    const a = $(elA)
    const res = titleParse(a.text())
    if (!res || !res.title) {
      return
    }
    const { title, count } = res
    const href = a.attr("href")
    const id = href.split("/")[0]
    const url = makeThreadUrl(id)
    threads.push({ id, title, url, count })
  })
  return { threads }
}

export type Post = {
  number: number
  name: string
  userId: string
  timestamp: number
  comma: number
  message: string
}

export type Thread = {
  title: string
  url: string
  postCount: number
  size: string
  posts: Post[]
}

const elem = (item: any): item is HTMLElement => !!item.innerText

export async function getThreadPart4Vip(url: string): Promise<Thread> {
  const $ = cheerio.load((await axios.get(url)).data)

  const title = $("h1")
    .text()
    .trim()
  const size = $("font > b").text()

  const posts: Post[] = []
  // console.log(_.zip($("dl > dt"), $("dl > dd")))
  _.zip($("dl > dt"), $("dl > dd")).map(([dt, dd], i) => {
    if (!dd || !dt) {
      return
    }
    // console.log(dd)
    const $dt = $(dt)
    const $dd = $(dd)
    const number = i + 1
    const name = $dt.find(".name").text()
    const infoText = $dt.find(".info").text()
    const m = infoText.match(/：(.*) ID:(.*)/)
    const [_m = "", dateStr = "", userId = ""] = m || []
    const timestamp = +dayjs(dateStr)
    const comma = Number(dateStr.split(".")[1])
    const message = $dd.text().trim()
    posts.push({ number, name, userId, timestamp, comma, message })
  })
  const postCount = posts.length
  return { title, url, postCount, size, posts }
}

export async function getThreadVip(url: string): Promise<Thread> {
  const $ = cheerio.load((await axios.get(url)).data)

  const title = $(".title")
    .text()
    .trim()
  const m = $(".metastats.meta.centered")
    .text()
    .match(/\d+KB/)
  const size = m ? m[0] : ""

  const posts: Post[] = []
  $(".post").map((i, elA) => {
    const div = $(elA)
    const number = Number(div.find(".number").text())
    const name = div.find(".name").text()
    const userId = div
      .find(".uid")
      .text()
      .split(":")[1]
    const dateStr = div.find(".date").text()
    const timestamp = +dayjs(dateStr)
    const comma = Number(dateStr.split(".")[1])
    const message = div
      .find(".message")
      .text()
      .trim()
    posts.push({ number, name, userId, timestamp, comma, message })
  })
  const postCount = posts.length
  return { title, url, postCount, size, posts }
}

export function getThread(url: string) {
  if (url.match(/vip2ch\.com/)) {
    return getThreadPart4Vip(url)
  } else {
    return getThreadVip(url)
  }
}
