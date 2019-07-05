import cheerio from "cheerio"
import { Iconv } from "iconv"
import axios from "axios"
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
type Thread = { id: string; title: string; url: string; count: number }

export async function getThreads() {
  const res = await axios.get(listPageUrl)
  const $ = cheerio.load(res.data)
  const threads: Thread[] = []
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
  return threads
}

type Res = {
  text: string
  time: number
  comma: number
}
const url = "https://hebi.5ch.net/test/read.cgi/news4vip/1562153470/"
async function getThread(url: string) {
  const $ = cheerio.load((await axios.get(url)).data)
  const ress: Res[] = []
  $(".post").map((i, elA) => {
    const div = $(elA)
    const dateStr = div.find(".date").text()
    const comma = Number(dateStr.split(".")[1])
    ress.push({
      text: "todo",
      time: 0,
      comma,
    })
  })
  return ress
}

getThread(url).then(ress => {
  console.log(ress.map(res => res.comma).join("\n"))
})
