import { getThread } from "./dump"

import { Post } from "./types"

async function watch(
  threadURL: string,
  gotPostCallback: (post: Post[], nthCall: number) => void = () => {},
  crawledCallback: (newPostCount: number) => void = () => {}
) {
  const readed: Record<number, boolean> = {}
  const thread = await getThread(threadURL)
  thread.posts.forEach(v => {
    readed[v.number] = true
  })
  const memo = { nthCall: 0 }
  gotPostCallback(thread.posts, memo.nthCall)
  memo.nthCall++
  let taskId: null | NodeJS.Timeout = null
  async function task() {
    const thread = await getThread(threadURL)
    crawledCallback(thread.postCount)
    const newPosts = thread.posts.filter(v => !readed[v.number])
    memo.nthCall++
    gotPostCallback(newPosts, memo.nthCall)
    newPosts.forEach(post => {
      readed[post.number] = true
    })
  }
  taskId = setInterval(task, 1000 * 60)
  return taskId
}

export default watch
