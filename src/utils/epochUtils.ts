/**
 * Utility functions for epoch management
 */

/**
 * Default epoch duration in milliseconds (3 days)
 */
export const DEFAULT_EPOCH_DURATION = 3 * 24 * 60 * 60 * 1000 // 3 days

/**
 * For testing purposes - shorter epoch duration (1 minute)
 */
export const TEST_EPOCH_DURATION = 1 * 60 * 1000 // 1 minute

// Fester Startzeitpunkt für die erste Epoche (2. April 2024, 00:01:00 UTC)
export const EPOCH_START = new Date('2024-04-02T00:01:00Z').getTime()

/**
 * Berechnet die nächste Epochen-Endzeit basierend auf dem festen Startzeitpunkt
 * @param epochDuration - Dauer einer Epoche in Millisekunden
 * @param epochStartTime - Startzeitpunkt der ersten Epoche
 * @returns Date-Objekt, das die nächste Epochen-Endzeit repräsentiert
 */
export const calculateNextEpochEndTime = (
  epochDuration: number = DEFAULT_EPOCH_DURATION,
  epochStartTime: number = EPOCH_START
): Date => {
  const now = Date.now()
  const elapsed = now - epochStartTime
  const completedEpochs = Math.floor(elapsed / epochDuration)
  const nextEpochEnd = epochStartTime + (completedEpochs + 1) * epochDuration
  return new Date(nextEpochEnd)
}

/**
 * Calculate time remaining until the next epoch ends
 * @param epochEndTime - The time when the current epoch ends
 * @returns Object with days, hours, minutes, seconds remaining
 */
export const calculateTimeRemaining = (
  epochEndTime: Date
): {
  days: number
  hours: number
  minutes: number
  seconds: number
} => {
  const now = new Date()
  const timeRemaining = Math.max(0, epochEndTime.getTime() - now.getTime())

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

/**
 * Format epoch end time to human readable format
 * @param epochEndTime - The time when the current epoch ends
 * @returns Formatted string (e.g. "May 5, 2023 at 14:30 UTC")
 */
export const formatEpochEndTime = (epochEndTime: Date): string => {
  return epochEndTime.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}
