import genTrip from "2ch-trip"
import _ from "lodash"
import { increment } from "./util"

const sleep = (msec: number) =>
  new Promise(resolve => setTimeout(resolve, msec))

// ◆のマッチに適用する
function regexPatch(str: string): string {
  if (str[0] !== "^") {
    return str
  }
  return "◆" + _.tail(str).join("")
}

async function tripDig(prefix: string, search: string) {
  const i = increment()
  const r = new RegExp(regexPatch(search))
  let n = 0
  while (true) {
    n++
    const str = `#${prefix}${i.next().value}`
    const trip = genTrip(str)
    if (trip.match(r)) {
      console.log(str)
      console.log(trip)
    }
    if (n % 100 === 0) {
      await sleep(0.1)
    }
    if (n % 10000000 === 0) {
      console.log(n)
      console.log(str)
      console.log()
    }
  }
}

export default tripDig
