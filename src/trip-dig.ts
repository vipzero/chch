import genTrip from "2ch-trip"
import _ from "lodash"
import { increment } from "./util"

const sleep = (msec: number) =>
  new Promise(resolve => setTimeout(resolve, msec))

// ◆のマッチに適用する
function regexPatch(str: string): string {
  if (!str.startsWith("^")) {
    return str
  }
  return "◆" + _.tail(str).join("")
}

async function tripDig(
  prefix: string,
  search: string,
  _start: string | undefined,
  _interval: string | undefined
) {
  const start = _start || "a"
  const startTime = +Date.now()
  const i = increment(start)
  const r = new RegExp(regexPatch(search))
  const interval = _interval ? Number(_interval) : 100
  let n = 0

  while (true) {
    n++
    const str = `#${prefix}${i.next().value}`
    const trip = genTrip(str)

    if (r.exec(trip)) {
      console.log(str)
      console.log(trip)
    }
    if (n % interval === 0) {
      await sleep(1)
    }
    if (n % 10000000 === 0) {
      console.log(`--- ${n} ${str} ${Date.now() - startTime}ms`)
    }
  }
}

export default tripDig
