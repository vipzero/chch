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

  const memo = { nthCall: 0, next: 1 + thread.posts.length }

  gotPostCallback(thread.posts, memo.nthCall)
  memo.nthCall++
  let taskId: null | NodeJS.Timeout = null

  async function task() {
    const thread = await getThread(threadURL, memo.next)

    thread.posts.shift()
    const newPosts = thread.posts

    memo.nthCall++
    memo.next += newPosts.length
    crawledCallback(newPosts.length)
    gotPostCallback(newPosts, memo.nthCall)
    newPosts.forEach(post => {
      readed[post.number] = true
    })
  }
  taskId = setInterval(task, 1000 * 60)
  return taskId
}

export default watch
