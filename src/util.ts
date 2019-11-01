import _ from "lodash"
import { Wacchoi } from "./types"

export function hosyuIntervalTimeMinute(hour: number, holiday = false): number {
  if (holiday) {
    if (hour <= 2) {
      return 10
    }
    if (hour <= 4) {
      return 20
    }
    if (hour <= 9) {
      return 40
    }
    if (hour <= 16) {
      return 15
    }
    if (hour <= 19) {
      return 10
    }
    return 6
  }
  if (hour <= 2) {
    return 15
  }
  if (hour <= 4) {
    return 25
  }
  if (hour <= 9) {
    return 45
  }
  if (hour <= 16) {
    return 25
  }
  if (hour <= 19) {
    return 15
  }
  return 6
}

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export function* increment(start = "a") {
  const nexts = start.split("").map(v => chars.indexOf(v))

  while (true) {
    const r = _.reverse(nexts.map(i => chars[i])).join("")
    const noUp = nexts.find((v, i) => {
      const nv = v + 1

      if (nv >= chars.length) {
        nexts[i] = 0
        return false
      }
      nexts[i] = nv
      return true
    })

    if (noUp === undefined) {
      nexts.push(0)
    }
    yield r
  }
}
export const normalizeUrl = (url: string) =>
  url + (url.endsWith("/") ? "" : "/")

export const easyRegex = (pattern: string): string =>
  pattern.replace(/%d/g, "(\\d+)").replace(/%s/g, "(.+)")

// 2019/10/26(土) 00:00:07.589
export const dateParse = (str: string): number => {
  const er = easyRegex("%d/%d/%d\\(.+\\) %d:%d:%d\\.%d")
  const m = new RegExp(er).exec(str)

  if (!m) {
    return 0
  }
  m.shift()
  const [y, mon, d, h, min, s, ms] = m
  const date = Date.UTC(
    Number(y),
    Number(mon) - 1,
    Number(d),
    Number(h),
    Number(min),
    Number(s),
    Number(ms)
  )

  return date - 9 * 60 * 60 * 1000
}

// 以下、5ちゃんねるからVIPがお送りします (ﾜｯﾁｮｲWW 8f70-cmdO)
export const parseWacchoi = (name: string): [Wacchoi | false, string] => {
  const m = /(.*) (\((.*) ((..)(..)-(....))\))/.exec(name)

  if (!m) {
    return [false, name]
  }
  const [_, raw, base, nickname, main, aa, bb, cccc] = m

  return [{ raw, nickname, aa, bb, cccc, main }, base]
}

export function getImgUrls(text: string): string[] {
  const rex = /(https?:\/\/.*?\.(?:png|jpg|gif))/g
  const imgs: string[] = []

  let m: null | RegExpExecArray = null

  while ((m = rex.exec(text))) {
    imgs.push(m[1])
  }
  return imgs
}
