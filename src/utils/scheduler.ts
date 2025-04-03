import { EPOCH_DURATION_MS } from './epochUtils';

class Scheduler {
  private static instance: Scheduler;
  private resetInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): Scheduler {
    if (!Scheduler.instance) {
      Scheduler.instance = new Scheduler();
    }
    return Scheduler.instance;
  }

  public start() {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }

    // Prüfe alle 5 Minuten, ob ein Reset fällig ist
    this.resetInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/reset-time');
        const { timeRemainingMs } = await response.json();
        
        // Wenn weniger als 5 Minuten übrig sind, führe Reset durch
        if (timeRemainingMs <= 5 * 60 * 1000) {
          await this.performReset();
        }
      } catch (error) {
        console.error('Fehler beim Prüfen des Reset-Zeitpunkts:', error);
      }
    }, 5 * 60 * 1000); // Alle 5 Minuten prüfen
  }

  private async performReset() {
    try {
      const response = await fetch('/api/reset-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Reset fehlgeschlagen');
      }
      
      console.log('Automatischer Reset durchgeführt');
    } catch (error) {
      console.error('Fehler beim automatischen Reset:', error);
    }
  }

  public stop() {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
      this.resetInterval = null;
    }
  }
}

export const scheduler = Scheduler.getInstance(); 