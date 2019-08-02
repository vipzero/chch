#!/usr/bin/env node

import meow from "meow"
import hosyu from "./hosyu"
import { getThread } from "./dump"
import tripDig from "./trip-dig"
import watch from "./watch"

const cli = meow(
  `
	Usage
	  $ chch hosyu [thread URL]
	  $ chch dump [thread URL]
	  $ chch watch [thread URL]
	  $ chch trip-dig [prefix] [regex] [start] [interval]

	Options
	  --text, -t message text default "ほ"

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

    $ chch trip-dig p____ "^vip" aaaaaaa
    > #p____aaabvsZ
    > ◆vipGBMso1mJ.
    > #p____aaabyzP
    > ◆vipV0VjY.j7I
`,
  {
    flags: {
      text: {
        type: "string",
        alias: "t",
      },
    },
  }
)

switch (cli.input[0]) {
  case "hosyu":
    hosyu(cli.input[1], cli.flags.text || "ほ")
  case "dump":
    getThread(cli.input[1]).then(ress => {
      console.log(JSON.stringify(ress, null, "\t"))
    })
  case "trip-dig":
    tripDig(cli.input[1], cli.input[2], cli.input[3], cli.input[4])
  case "watch":
    watch(cli.input[1])
}
