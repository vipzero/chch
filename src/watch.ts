import { getThread, Post } from "./dump"
import _ from "lodash"
import chalk from "chalk"
import publicIp from "public-ip"

import OpenJTalk from "openjtalk"
import { promisify } from "util"
const mei = new OpenJTalk()
const talk = promisify(mei.talk).bind(mei)

async function watch(threadURL: string, say?: boolean) {
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
    if (!say) {
      return
    }
    await talk(post.message)
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
