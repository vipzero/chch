import genTrip from "2ch-trip"
import { increment } from "./util"

function tripDig(prefix: string, search: string) {
  const i = increment()
  const r = new RegExp(search)
  while (true) {
    const str = `${prefix}${i.next()}`
    const trip = genTrip(str)
    if (trip.match(r)) {
      console.log(str)
    }
    console.log(trip)
  }
}

export default tripDig
