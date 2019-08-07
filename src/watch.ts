import { getThread, Post } from "./dump"
import _ from "lodash"
import chalk from "chalk"
import publicIp from "public-ip"

import OpenJTalk from "openjtalk"
import { promisify } from "util"
import { execSync } from "child_process"

const mei = new OpenJTalk()
const talk = promisify(mei.talk).bind(mei)

const sayTextBatch = (text: string): string =>
  text
    .replace(/[wWｗＷ]{2}/g, "わらわら")
    .replace(/[wWｗｗ]([^a-zA-Z])/g, "わら$1")
    .replace(/っ{2}/g, "っ")
    .replace(/ッ{2}/g, "ッ")
    .substr(0, 100)

async function watch(threadURL: string, say: boolean, command?: string) {
  const readed: Record<number, boolean> = {}
  const thread = await getThread(threadURL)
  thread.posts.forEach(v => {
    readed[v.number] = true
  })
  const startIp = await publicIp.v4()
  console.log(chalk.gray("startIp: " + startIp))
  const post = _.last(thread.posts)
  const log = async (post: Post) => {
    console.log(`${post.userId.substr(0, 3)} ${post.message}`)
    if (say) {
      await talk(sayTextBatch(post.message))
    }
    if (command) {
      execSync(command)
    }
  }
  if (post) {
    log(post)
  }
  let taskId: null | NodeJS.Timeout = null
  async function task() {
    const ip = await publicIp.v4()
    if (startIp !== ip) {
      console.log(chalk.gray("stop: ip changed"))
      if (taskId) {
        clearInterval(taskId)
        return
      }
    }
    const thread = await getThread(threadURL)
    console.log(chalk.gray("$ get thread"))
    for (const post of thread.posts.filter(v => !readed[v.number])) {
      readed[post.number] = true
      await log(post)
    }
  }
  taskId = setInterval(task, 1000 * 60)
}

export default watch
