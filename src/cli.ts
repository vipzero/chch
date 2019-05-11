#!/usr/bin/env node

import meow from "meow"
import hosyu from "./hosyu"

const cli = meow(
  `
	Usage
	  $ chch hosyu [thread URL]

	Options
	  --text, -t message text default "ほ"

	Examples
	  $ chch hosyu http://hebi.5ch.net/test/read.cgi/news4vip/1556625403 --text "保守"
	  > posted
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
}
