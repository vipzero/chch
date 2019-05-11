export function hosyuIntervalTimeMinute(
  hour: number,
  holiday: boolean = false
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
