import { getThread } from "./dump"
import _ from "lodash"

import { Post } from "./types"

async function watch(
  threadURL: string,
  gotPostCallback: (post: Post[]) => void = () => {},
  crawledCallback: (newPostCount: number) => void = () => {}
) {
  const readed: Record<number, boolean> = {}
  const thread = await getThread(threadURL)
  thread.posts.forEach(v => {
    readed[v.number] = true
  })
  gotPostCallback(thread.posts)
  let taskId: null | NodeJS.Timeout = null
  async function task() {
    const thread = await getThread(threadURL)
    crawledCallback(thread.postCount)
    const newPosts = thread.posts.filter(v => !readed[v.number])
    gotPostCallback(newPosts)
    newPosts.forEach(post => {
      readed[post.number] = true
    })
  }
  taskId = setInterval(task, 1000 * 60)
  return taskId
}

export default watch
