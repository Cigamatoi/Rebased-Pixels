import { useEffect, useState } from 'react'

import useSocket from './useSocket'

export interface EpochInfo {
  epochNumber: number
  epochEnd: Date
}

/**
 * Hook to get and track epoch information
 */
export default function useEpoch() {
  const { socket, isConnected } = useSocket()
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentEpoch, setCurrentEpoch] = useState<EpochInfo | null>(null)
  const [epochEndTime, setEpochEndTime] = useState<Date | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  useEffect(() => {
    if (!socket || !isConnected) return

    // Handler for receiving epoch info
    const handleEpochInfo = (data: any) => {
      console.log('Received epoch info:', data)
      setCurrentEpoch({
        epochNumber: data.epochNumber,
        epochEnd: new Date(data.epochEnd),
      })
      setLoading(false)
    }

    // Handler for new epoch events
    const handleNewEpoch = (data: any) => {
      console.log('New epoch started:', data)
      setCurrentEpoch({
        epochNumber: data.epochNumber,
        epochEnd: new Date(data.epochEnd),
      })

      // Here you could show a notification or trigger other actions
      // when a new epoch starts
    }

    // Register event handlers
    socket.on('epoch-info', handleEpochInfo)
    socket.on('new-epoch', handleNewEpoch)

    // Request current epoch info
    socket.emit('check-epoch')

    // Cleanup
    return () => {
      socket.off('epoch-info', handleEpochInfo)
      socket.off('new-epoch', handleNewEpoch)
    }
  }, [socket, isConnected])

  useEffect(() => {
    if (!currentEpoch) return;

    // Bestimmen, wann die aktuelle Epoche endet
    const end = calculateEndTime(currentEpoch);
    setEpochEndTime(end);

    // Timer zum Aktualisieren der verbleibenden Zeit
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= end) {
        // Die Epoche ist abgelaufen, lade neue Daten
        refreshEpoch();
        clearInterval(timer);
        return;
      }

      const remaining = getRemainingTime(end);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentEpoch]);

  // Function to manually request epoch info update
  const refreshEpochInfo = () => {
    if (socket && isConnected) {
      socket.emit('check-epoch')
    }
  }

  const refreshEpoch = () => {
    // Implementation of refreshEpoch function
  }

  const calculateEndTime = (epoch: EpochInfo): Date => {
    // Implementation of calculateEndTime function
    return new Date();
  }

  const getRemainingTime = (end: Date): number => {
    // Implementation of getRemainingTime function
    return 0;
  }

  return {
    epochInfo,
    loading,
    refreshEpochInfo,
    currentEpoch,
    epochEndTime,
    remainingTime,
  }
}
