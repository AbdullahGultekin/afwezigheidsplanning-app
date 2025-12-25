// Type definitions for the application

export interface Werknemer {
  id: string;
  naam: string;
  email?: string;
  nummerplaat?: string;
  actief?: boolean;
}

export interface Uren {
  id: string;
  werknemerId: string;
  datum: string; // ISO date string
  uren: number;
  opmerking?: string;
  afwezigheid?: 'V' | 'A' | 'S'; // V=Vakantie, A=Aangepast, S=School
}

export interface Kilometer {
  id: string;
  werknemerId: string;
  datum: string; // ISO date string
  kilometers: number;
  vanAdres?: string;
  naarAdres?: string;
  doel?: string;
}

export interface Afwezigheid {
  id: string;
  werknemerId: string;
  datum: string; // ISO date string
  type: 'V' | 'A' | 'S';
  opmerking?: string;
}

export interface BulkData {
  [werknemerId: string]: {
    [day: number]: {
      uren?: number | string;
      afwezigheid?: string;
    };
  };
}

export interface ElectronAPI {
  db: {
    get: (table: string) => Promise<any[]>;
    set: (table: string, data: any) => Promise<any>;
    add: (table: string, item: any) => Promise<any>;
    update: (table: string, id: string, updates: any) => Promise<any>;
    delete: (table: string, id: string) => Promise<any>;
  };
  importExcel: (base64: string, fileName: string, importType: string) => Promise<any>;
}

declare global {
  interface Window {
    db: ElectronAPI['db'];
    electronAPI?: ElectronAPI;
  }
}

