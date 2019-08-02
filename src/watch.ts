import { getThread } from "./dump"
import _ from "lodash"

async function watch(threadURL: string) {
  const readed: Record<number, boolean> = {}
  const thread = await getThread(threadURL)
  thread.posts.forEach(v => {
    readed[v.number] = true
  })
  const post = _.last(thread.posts)
  if (post) {
    console.log(post.message)
  }
  async function task() {
    const thread = await getThread(threadURL)
    thread.posts
      .filter(v => !readed[v.number])
      .forEach(v => {
        readed[v.number] = true
        console.log(v.message)
      })
  }
  setInterval(task, 1000 * 60)
}

export default watch
