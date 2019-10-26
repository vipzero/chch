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

const min10 = 10 * 60

export const recentPostCount = (posts: Post[]) => {
  console.log(+Date.now() - min10)
  console.log(posts.map(post => post.timestamp))
  const l = posts.filter(post => post.timestamp >= +Date.now() / 1000 - min10)
    .length

  console.log(l)
  return l
}

export const nextTime = (num: number) => {
  return Math.min((min10 * 1000) / (num + 1), 60000)
}

export async function watchSmart(
  threadURL: string,
  gotPostCallback: (post: Post[], nthCall: number) => void = () => {},
  crawledCallback: (newPostCount: number) => void = () => {},
  setTimeoutIdCallback: (timeout: NodeJS.Timeout) => void = () => {}
) {
  const readed: Record<number, Post> = {}
  const thread = await getThread(threadURL)

  thread.posts.forEach(v => {
    readed[v.number] = v
  })

  const memo = {
    nthCall: 0,
    next: 1 + thread.posts.length,
  }

  gotPostCallback(thread.posts, memo.nthCall)
  memo.nthCall++

  async function task() {
    const thread = await getThread(threadURL, memo.next)

    thread.posts.shift()
    const newPosts = thread.posts

    memo.nthCall++
    memo.next += newPosts.length
    crawledCallback(newPosts.length)
    gotPostCallback(newPosts, memo.nthCall)
    newPosts.forEach(post => {
      readed[post.number] = post
    })
    const nt = nextTime(recentPostCount(Object.values(readed)))

    console.log(`next: ${nt} ms ago`)
    setTimeoutIdCallback(setTimeout(task, nt))
  }
  const nt = nextTime(recentPostCount(Object.values(readed)))

  console.log(`next: ${nt} ms ago`)
  setTimeoutIdCallback(setTimeout(task, nt))
}

export default watch
