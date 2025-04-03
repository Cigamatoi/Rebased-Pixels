export const formatTimeLeft = (msLeft: number): string => {
  const totalSeconds = Math.floor(msLeft / 1000)

  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  const format = (v: number) => (v < 10 ? `0${v}` : `${v}`)

  return `${format(days)}d ${format(hours)}h ${format(minutes)}m ${format(seconds)}s`
} 