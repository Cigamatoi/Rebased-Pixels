import axios from 'axios';

/**
 * Service für die Verwaltung von Teilnehmerdaten
 */

export interface ExportedFileInfo {
  path: string;
  filename: string;
  exportedAt: string;
  epochNumber: number | null;
}

export interface ContributorsData {
  epochNumber: number | null;
  epochStartTime: string;
  epochEndTime: string;
  contributors: string[];
  metadata?: Record<string, any>;
}

export class ContributorsService {
  /**
   * Holt die Liste aller exportierten Teilnehmerdateien
   */
  async getExportedFiles(): Promise<ExportedFileInfo[]> {
    try {
      const response = await fetch('/api/exports');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.exports;
    } catch (error) {
      console.error('Fehler beim Laden der Exportdateien:', error);
      return [];
    }
  }

  /**
   * Lädt eine bestimmte Teilnehmerdatei
   * @param path Pfad zur Datei
   */
  async loadContributors(path: string): Promise<ContributorsData> {
    try {
      const response = await fetch(`/api/exports/${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Laden der Teilnehmerdaten:', error);
      throw error;
    }
  }

  /**
   * Simuliert Daten für die Entwicklung
   */
  async getMockData(): Promise<ContributorsData> {
    const now = new Date();
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - 3);
    
    return {
      epochNumber: 1,
      epochStartTime: startTime.toISOString(),
      epochEndTime: now.toISOString(),
      contributors: [
        '0x0123456789abcdef0123456789abcdef01234567',
        '0x9876543210abcdef9876543210abcdef98765432',
        '0xabcdef0123456789abcdef0123456789abcdef01',
        '0xfedcba9876543210fedcba9876543210fedcba98',
        '0x123456789abcdef0123456789abcdef0123456789'
      ]
    };
  }
} 