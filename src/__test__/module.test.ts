import fs from "fs"
import axios from "axios"
import MockAdapter from "axios-mock-adapter"

import m from "../"

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios)

mock.onAny().reply(200, () => {
  const html = fs.readFileSync("./mock/thread.html")
  return html
})

const url = "https://hebi.5ch.net/test/read.cgi/news4vip/1562153470/"

test("get thread", async () => {
  const thread = await m.getThread(url)
  expect(thread.title).toMatchInlineSnapshot(`">>5してから寝る"`)
  expect(thread.postCount).toMatchInlineSnapshot(`1002`)
  expect(thread.size).toMatchInlineSnapshot(`"142KB"`)
  expect(thread.url).toMatchInlineSnapshot(
    `"https://hebi.5ch.net/test/read.cgi/news4vip/1562153470/"`
  )
  expect(thread.posts[0]).toMatchInlineSnapshot(`
    Object {
      "comma": 403,
      "message": "やる",
      "name": "以下、5ちゃんねるからVIPがお送りします",
      "number": 1,
      "timestamp": 1562153470403,
      "userId": "z9nhF5kH0",
    }
  `)
  expect(thread.posts[1]).toMatchInlineSnapshot(`
    Object {
      "comma": 554,
      "message": "闇堕ち",
      "name": "以下、5ちゃんねるからVIPがお送りします",
      "number": 2,
      "timestamp": 1562153492554,
      "userId": "0iuT8jV7p",
    }
  `)
})
