import _ from "lodash"

export function hosyuIntervalTimeMinute(
  hour: number,
  holiday = false
): number {
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
