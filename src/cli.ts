#!/usr/bin/env node

import { execSync } from "child_process"
import meow from "meow"
import chalk from "chalk"
import hosyu from "./hosyu"
import { getThread, getThreads, postMessage } from "./dump"
import tripDig from "./trip-dig"
import watch, { watchSmart } from "./watch"
import { Post } from "./types"

const cli = meow(
  `
  Usage
    $ chch hosyu [thread URL]
    $ chch dump [thread URL]
    $ chch watch [thread URL] [command]
    $ chch trip-dig [prefix] [regex] [start] [interval]
    $ chch post [thread URL] [message]

  Options
    --text, -t message text default "ほ" in hosyu
    --smart, -s voice speak in watch

  Examples
    $ chch hosyu http://hebi.5ch.net/test/read.cgi/news4vip/1556625403 --text "保守"
    > posted

    $ chch dump https://hebi.5ch.net/test/read.cgi/news4vip/1562153470/
    > {
    >   "title": "プログラム「a=a+b」←こいつｗｗｗｗｗｗ",
    >   "url": "https://hebi.5ch.net/test/read.cgi/news4vip/1562479977/",
    >   "postCount": null,
    >   "posts": [
    >     {
    >       "number": "1",
    >       "name": "以下、5ちゃんねるからVIPがお送りします",
    >       "userId": "",
    >       "timestamp": 1562479977678,
    >       "comma": 678,
    >       "message": "算数もできないのかよ……"
    >     },
    >     {
    >       "number": "2",
    > ...

    $ chch dump-threads
    > {
    >   "threads": [
    >     {
    >       "id": "1565280882",
    >       "title": "初めておっぱい触った年齢いくつ？",
    >       "url": "http://hebi.5ch.net/test/read.cgi/news4vip/1565280882",
    >       "count": 13
    >     },
    >     {
    >       "id": "1565280463",
    >       "title": "小説家になろうに投稿してるがノーリアクションでつらい",
    >       "url": "http://hebi.5ch.net/test/read.cgi/news4vip/1565280463",
    >       "count": 11
    > ...

    $ chch trip-dig p____ "^vip" aaaaaaa
    > #p____aaabvsZ
    > ◆vipGBMso1mJ.
    > #p____aaabyzP
    > ◆vipV0VjY.j7I

    $ chch watch https://hebi.5ch.net/test/read.cgi/news4vip/1562153470/ --command "say got"
    $ chch watch https://hebi.5ch.net/test/read.cgi/news4vip/1562153470/ -s
    
`,
  {
    flags: {
      text: {
        type: "string",
        alias: "t",
      },
      command: {
        type: "string",
        alias: "c",
      },
      smart: {
        type: "boolean",
        alias: "s",
      },
    },
  }
)

const gotPostsCallback = (posts: Post[]) => {
  posts.forEach(post => {
    if (cli.flags.command) {
      execSync(cli.flags.command)
    }
    console.log(`${post.number}:${post.userId.substr(0, 3)}: ${post.message}`)
  })
}
const crawledCallback = (newPostCount: number) => {
  console.log(chalk.gray(`crawl thread: got ${newPostCount}`))
}

switch (cli.input[0]) {
  case "hosyu":
    hosyu(cli.input[1], cli.flags.text || "ほ")
    break
  case "dump":
    getThread(cli.input[1]).then(ress => {
      console.log(JSON.stringify(ress, null, "\t"))
    })
    break
  case "dump-threads":
    getThreads().then(res => {
      console.log(JSON.stringify(res, null, "\t"))
    })
    break
  case "trip-dig":
    tripDig(cli.input[1], cli.input[2], cli.input[3], cli.input[4])
    break
  case "watch":
    if (cli.flags.smart) {
      watchSmart(cli.input[1], gotPostsCallback, crawledCallback)
    } else {
      watch(cli.input[1], gotPostsCallback, crawledCallback)
    }
    break
  case "post":
    postMessage(cli.input[1], cli.input[2])
    break
  default:
    console.log(`${cli.input[1]} command not found. chch --help`)
    break
}
