import { getThread } from "./dump"
import _ from "lodash"
import chalk from "chalk"
import { spawnSync } from "child_process"
import publicIp from "public-ip"

async function watch(threadURL: string, pipe?: string) {
  const readed: Record<number, boolean> = {}
  const thread = await getThread(threadURL)
  thread.posts.forEach(v => {
    readed[v.number] = true
  })
  const startIp = await publicIp.v4()
  console.log(chalk.gray("startIp: " + startIp))
  const post = _.last(thread.posts)
  const log = (text: string) => {
    console.log(text)
    if (!pipe) {
      return
    }
    const [command, ...cargs] = pipe.split(" ")
    spawnSync(command, [...cargs, text])
  }
  if (post) {
    log(post.message)
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
        log(post.message)
      })
  }
  taskId = setInterval(task, 1000 * 60)
}

export default watch
