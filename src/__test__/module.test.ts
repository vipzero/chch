import fs from "fs"
import MockAdapter from "axios-mock-adapter"
import encoding from "encoding-japanese"
import m from "../"
import { client } from "../dump"
import { dateParse, parseWacchoi } from "../util"
import { nextTime } from "../watch"

const url = "https://hebi.5ch.net/test/read.cgi/news4vip/1570005180"

const html = fs.readFileSync(__dirname + "/mock/thread.html")
const mock = new MockAdapter(client)

client.defaults.transformResponse = [
  () => encoding.convert(html, { to: "UNICODE", from: "SJIS", type: "string" }),
]

mock.onGet().reply(() => [200])

test("get thread", async () => {
  const thread = await m.getThread(url)

  expect(thread.title).toMatchInlineSnapshot(`"テストスレッド"`)

  expect(thread.postCount).toMatchInlineSnapshot(`8`)
  expect(thread.size).toMatchInlineSnapshot(`"1KB"`)
  expect(thread.url).toMatchInlineSnapshot(
    `"https://hebi.5ch.net/test/read.cgi/news4vip/1570005180/"`
  )
  expect(thread.posts[0]).toMatchInlineSnapshot(`
    Object {
      "comma": 691,
      "images": Array [],
      "message": "テストスレです… VIPQ2_EXTDAT: checked:vvvvv:1000:512:: EXT was configured",
      "name": Object {
        "base": "(ﾜｯﾁｮｲWW 8f70-cmdO)",
        "isDefault": false,
        "raw": "以下、5ちゃんねるからVIPがお送りします (３級) (ﾜｯﾁｮｲWW 8f70-cmdO)",
        "wacchoi": Object {
          "aa": "8f",
          "bb": "70",
          "cccc": "cmdO",
          "main": "8f70-cmdO",
          "nickname": "ﾜｯﾁｮｲWW",
          "raw": "以下、5ちゃんねるからVIPがお送りします (３級)",
        },
      },
      "number": 1,
      "timestamp": 1572163600691,
      "userId": "EZLQKi1b0",
    }
  `)
  expect(thread.posts[1]).toMatchInlineSnapshot(`
    Object {
      "comma": 618,
      "images": Array [],
      "message": "偽名前",
      "name": Object {
        "base": "(ﾜｯﾁｮｲWW 8f70-cmdO)",
        "isDefault": false,
        "raw": "以下、5ちゃんねるからVIPがお送りします (ﾜｯﾁｮｲWW 8f70-cmdO)",
        "wacchoi": Object {
          "aa": "8f",
          "bb": "70",
          "cccc": "cmdO",
          "main": "8f70-cmdO",
          "nickname": "ﾜｯﾁｮｲWW",
          "raw": "以下、5ちゃんねるからVIPがお送りします",
        },
      },
      "number": 2,
      "timestamp": 1572163639618,
      "userId": "EZLQKi1b0",
    }
  `)

  expect(thread.posts[2]).toMatchInlineSnapshot(`
    Object {
      "comma": 704,
      "images": Array [],
      "message": "空名前",
      "name": Object {
        "base": "(ﾜｯﾁｮｲWW 8f70-cmdO)",
        "isDefault": false,
        "raw": "以下、5ちゃんねるからVIPがお送りします (ﾜｯﾁｮｲWW 8f70-cmdO)",
        "wacchoi": Object {
          "aa": "8f",
          "bb": "70",
          "cccc": "cmdO",
          "main": "8f70-cmdO",
          "nickname": "ﾜｯﾁｮｲWW",
          "raw": "以下、5ちゃんねるからVIPがお送りします",
        },
      },
      "number": 3,
      "timestamp": 1572163653704,
      "userId": "EZLQKi1b0",
    }
  `)

  expect(thread.posts[3]).toMatchInlineSnapshot(`
    Object {
      "comma": 287,
      "images": Array [],
      "message": "カスタム名前",
      "name": Object {
        "base": "(ﾜｯﾁｮｲWW 8f70-cmdO)",
        "isDefault": false,
        "raw": "カスタム (ﾜｯﾁｮｲWW 8f70-cmdO)",
        "wacchoi": Object {
          "aa": "8f",
          "bb": "70",
          "cccc": "cmdO",
          "main": "8f70-cmdO",
          "nickname": "ﾜｯﾁｮｲWW",
          "raw": "カスタム",
        },
      },
      "number": 4,
      "timestamp": 1572163673287,
      "userId": "EZLQKi1b0",
    }
  `)

  expect(thread.posts[4]).toMatchInlineSnapshot(`
    Object {
      "comma": 977,
      "images": Array [],
      "message": "さげ",
      "name": Object {
        "base": "(ﾜｯﾁｮｲWW 8f70-cmdO)",
        "isDefault": false,
        "raw": "以下、5ちゃんねるからVIPがお送りします (ﾜｯﾁｮｲWW 8f70-cmdO)",
        "wacchoi": Object {
          "aa": "8f",
          "bb": "70",
          "cccc": "cmdO",
          "main": "8f70-cmdO",
          "nickname": "ﾜｯﾁｮｲWW",
          "raw": "以下、5ちゃんねるからVIPがお送りします",
        },
      },
      "number": 5,
      "timestamp": 1572163939977,
      "userId": "EZLQKi1b0",
    }
  `)

  expect(thread.posts[5]).toMatchInlineSnapshot(`
    Object {
      "comma": 380,
      "images": Array [],
      "message": "#トリップ",
      "name": Object {
        "base": "(ﾜｯﾁｮｲWW 8f70-cmdO)",
        "isDefault": false,
        "raw": "トリップ ◆XSSH/ryx32  (ﾜｯﾁｮｲWW 8f70-cmdO)",
        "wacchoi": Object {
          "aa": "8f",
          "bb": "70",
          "cccc": "cmdO",
          "main": "8f70-cmdO",
          "nickname": "ﾜｯﾁｮｲWW",
          "raw": "トリップ ◆XSSH/ryx32 ",
        },
      },
      "number": 6,
      "timestamp": 1572163962380,
      "userId": "EZLQKi1b0",
    }
  `)

  expect(thread.posts[6]).toMatchInlineSnapshot(`
    Object {
      "comma": 237,
      "images": Array [],
      "message": "別ワッチョイ",
      "name": Object {
        "base": "(ﾜｯﾁｮｲ 8f70-vDaD)",
        "isDefault": false,
        "raw": "以下、5ちゃんねるからVIPがお送りします (ﾜｯﾁｮｲ 8f70-vDaD)",
        "wacchoi": Object {
          "aa": "8f",
          "bb": "70",
          "cccc": "vDaD",
          "main": "8f70-vDaD",
          "nickname": "ﾜｯﾁｮｲ",
          "raw": "以下、5ちゃんねるからVIPがお送りします",
        },
      },
      "number": 7,
      "timestamp": 1572164017237,
      "userId": "EZLQKi1b0",
    }
  `)
})

test("date parse", () => {
  const res = dateParse("2019/10/26(土) 00:00:07.589")

  expect(res).toMatchInlineSnapshot(`1572015607589`)
  expect(new Date(res)).toMatchInlineSnapshot(`2019-10-25T15:00:07.589Z`)
})

test("parseWacchoi", () => {
  const res = parseWacchoi(
    "以下、5ちゃんねるからVIPがお送りします (ﾜｯﾁｮｲWW 8f70-cmdO)"
  )

  expect(res).toMatchInlineSnapshot(`
    Array [
      Object {
        "aa": "8f",
        "bb": "70",
        "cccc": "cmdO",
        "main": "8f70-cmdO",
        "nickname": "ﾜｯﾁｮｲWW",
        "raw": "以下、5ちゃんねるからVIPがお送りします",
      },
      "(ﾜｯﾁｮｲWW 8f70-cmdO)",
    ]
  `)

  const resNone = parseWacchoi("以下、5ちゃんねるからVIPがお送りします")

  expect(resNone).toMatchInlineSnapshot(`
    Array [
      false,
      "以下、5ちゃんねるからVIPがお送りします",
    ]
  `)
})

test("nextTime", () => {
  expect(nextTime(0)).toMatchInlineSnapshot(`60000`)
  expect(nextTime(5)).toMatchInlineSnapshot(`60000`)
  expect(nextTime(10)).toMatchInlineSnapshot(`54545.454545454544`)
  expect(nextTime(20)).toMatchInlineSnapshot(`28571.428571428572`)
})
