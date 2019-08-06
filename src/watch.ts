import { getThread, Post } from "./dump"
import _ from "lodash"
import chalk from "chalk"
import publicIp from "public-ip"

import OpenJTalk from "openjtalk"
const mei = new OpenJTalk()

async function watch(threadURL: string, say?: boolean) {
  const readed: Record<number, boolean> = {}
  const thread = await getThread(threadURL)
  thread.posts.forEach(v => {
    readed[v.number] = true
  })
  const startIp = await publicIp.v4()
  console.log(chalk.gray("startIp: " + startIp))
  const post = _.last(thread.posts)
  const log = (post: Post) => {
    console.log(post.message)
    if (!say) {
      return
    }
    mei.talk(post.message)
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
    thread.posts
      .filter(v => !readed[v.number])
      .forEach(post => {
        readed[post.number] = true
        log(post)
      })
  }
  taskId = setInterval(task, 1000 * 60)
}

export default watch
