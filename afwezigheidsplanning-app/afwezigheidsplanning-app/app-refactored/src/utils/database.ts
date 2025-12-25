// Database utility functions
import type { Werknemer, Uren, Kilometer, Afwezigheid } from '../types';

export const db = {
  async get<T>(table: string): Promise<T[]> {
    return window.db.get(table);
  },

  async add<T>(table: string, item: Omit<T, 'id'>): Promise<T> {
    return window.db.add(table, item);
  },

  async update<T>(table: string, id: string, updates: Partial<T>): Promise<T> {
    return window.db.update(table, id, updates);
  },

  async delete(table: string, id: string): Promise<void> {
    return window.db.delete(table, id);
  },

  // Type-safe helpers
  async getWerknemers(): Promise<Werknemer[]> {
    return this.get<Werknemer>('werknemers');
  },

  async getUren(): Promise<Uren[]> {
    return this.get<Uren>('uren');
  },

  async getKilometers(): Promise<Kilometer[]> {
    return this.get<Kilometer>('kilometers');
  },

  async getAfwezigheden(): Promise<Afwezigheid[]> {
    return this.get<Afwezigheid>('afwezigheden');
  },
};

