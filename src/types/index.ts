export type Post = {
  number: number
  name: string
  userId: string
  timestamp: number
  comma: number
  message: string
}

export type Thread = {
  title: string
  url: string
  postCount: number
  size: string
  posts: Post[]
}

export type CrawledCallback = (res: {
  nthCall: number
  newPosts: Post[]
  recentCount10Min: number
  nextCallMs: number
  timeout: NodeJS.Timeout
}) => void
