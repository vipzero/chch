import { getThread } from "./dump"
import { Post, CrawledCallback } from "./types"

const min10 = 10 * 60 * 1000

const recentPostCount = (posts: Post[]) =>
  posts.filter(post => post.timestamp >= +Date.now() - min10).length

function watcher(
  threadURL: string,
  crawledCallback: CrawledCallback = () => {},
  crawTimeFunc: (recentCount: number) => number
) {
  const readed: Record<number, Post> = {}
  const memo = { nthCall: 0, next: 1, timeout: <NodeJS.Timeout | null>null }

  function stop() {
    if (!memo.timeout) {
      return
    }
    clearTimeout(memo.timeout)
    memo.timeout = null
  }
  async function run() {
    stop()
    const thread = await getThread(threadURL, memo.next)

    if (memo.next !== 1) {
      thread.posts.shift()
    }
    const newPosts = thread.posts

    newPosts.forEach(post => {
      readed[post.number] = post
    })
    const recentCount10Min = recentPostCount(Object.values(readed))
    const nextCallMs = crawTimeFunc(recentCount10Min)
    const timeout = setTimeout(run, nextCallMs)

    crawledCallback({
      nthCall: memo.nthCall,
      newPosts,
      recentCount10Min,
      nextCallMs,
      timeout,
    })
    memo.nthCall++
    memo.timeout = timeout
    memo.next = Object.keys(readed).length + 1
  }
  return {
    start: run,
    restart: run,
    stop,
  }
}

const nextTime = (num: number) => Math.min((min10 * 1000) / (num + 1), 60000)

export const watchSmart = (
  threadURL: string,
  crawledCallback: CrawledCallback = () => {}
) => watcher(threadURL, crawledCallback, nextTime)

export const watch = (
  threadURL: string,
  crawledCallback: CrawledCallback = () => {},
  intervalMs: number = 1 * 60 * 1000
) => watcher(threadURL, crawledCallback, () => intervalMs)
