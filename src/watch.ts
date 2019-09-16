import { getThread } from "./dump"
import _ from "lodash"
import publicIp from "public-ip"

import OpenJTalk from "openjtalk"
import { promisify } from "util"
import axios from "axios"
import fs from "fs"
import { Post } from "./types"

const mei = new OpenJTalk()
const talk = promisify(mei.talk).bind(mei)

const downloadImage = (url, imgPath) =>
  axios({
    url,
    responseType: "stream",
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(imgPath))
          .on("finish", () => resolve())
          .on("error", e => reject(e))
      })
  )

const sayTextBatch = (text: string): string =>
  text
    .replace(/[wWｗＷ]{2}/g, "わらわら")
    .replace(/[wWｗｗ]([^a-zA-Z])/g, "わら$1")
    .replace(/っ{2}/g, "っ")
    .replace(/ッ{2}/g, "ッ")
    .replace(/`/g, "")
    .substr(0, 40)

async function watch(
  threadURL: string,
  say: boolean,
  gotPostCallback: (post: Post) => void = () => {},
  crawledCallback: (newPostCount: number) => void = () => {}
) {
  const readed: Record<number, boolean> = {}
  const thread = await getThread(threadURL)
  thread.posts.forEach(v => {
    readed[v.number] = true
  })
  const startIp = await publicIp.v4()
  const post = _.last(thread.posts)
  const log = async (post: Post) => {
    gotPostCallback(post)
    const rex = /(https?:\/\/.*?\.(?:png|jpg|gif))/g
    let m: RegExpExecArray | null = null
    while ((m = rex.exec(post.message))) {
      const paths = m[1].split("/")
      downloadImage(m[1], paths[paths.length - 1])
    }
    if (say) {
      await talk(sayTextBatch(post.message))
    }
  }
  if (post) {
    log(post)
  }
  let taskId: null | NodeJS.Timeout = null
  async function task() {
    const ip = await publicIp.v4()
    if (startIp !== ip) {
      if (taskId !== null) {
        clearInterval(taskId)
      }
      throw new Error("global ip changed")
    }
    const thread = await getThread(threadURL)
    crawledCallback(thread.postCount)
    for (const post of thread.posts.filter(v => !readed[v.number])) {
      readed[post.number] = true
      await log(post)
    }
  }
  taskId = setInterval(task, 1000 * 60)
  return taskId
}

export default watch
