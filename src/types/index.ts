export type Wacchoi = {
  raw: string
  nickname: string
  main: string
  aa: string
  bb: string
  cccc: string
}

export type PostName = {
  raw: string
  base: string
  wacchoi: false | Wacchoi
  isDefault: boolean
}

export type Post = {
  number: number
  name: PostName
  userId: string
  timestamp: number
  comma: number
  message: string
  images: string[]
}

export type Thread = {
  title: string
  url: string
  postCount: number
  size: string
  posts: Post[]
}

export type ThreadMin = {
  id: string
  title: string
  url: string
  count: number
}

export type CrawledCallback = (res: {
  nthCall: number
  newPosts: Post[]
  recentCount10Min: number
  nextCallMs: number
  timeout: NodeJS.Timeout
}) => void
