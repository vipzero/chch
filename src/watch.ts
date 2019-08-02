import { getThread } from "./dump"
import _ from "lodash"
import chalk from "chalk"
import { spawnSync } from "child_process"

async function watch(threadURL: string, pipe?: string) {
  const readed: Record<number, boolean> = {}
  const thread = await getThread(threadURL)
  thread.posts.forEach(v => {
    readed[v.number] = true
  })
  const post = _.last(thread.posts)
  if (post) {
    console.log(post.message)
    if (pipe) {
      const [command, ...cargs] = pipe.split(" ")
      spawnSync(command, [...cargs, post.message])
    }
  }
  async function task() {
    const thread = await getThread(threadURL)
    console.log(chalk.gray("$ get thread"))
    thread.posts
      .filter(v => !readed[v.number])
      .forEach(post => {
        readed[post.number] = true
        console.log(post.message)
        if (pipe) {
          const [command, ...cargs] = pipe.split(" ")
          spawnSync(command, [...cargs, post.message])
        }
      })
  }
  setInterval(task, 1000 * 60)
}

export default watch
