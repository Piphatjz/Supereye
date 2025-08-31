// lib/diagnosisHistory.ts
export type DiagnosisRecord = {
  id: string;
  filename: string;
  diagnosis: string;
  confidence?: number; // เก็บเป็น 0..1 (ถ้า API ส่ง % ต้องหาร 100 ก่อน)
  imageUrl?: string;
  dateISO: string;     // ISO string
  displayTime: string; // local string
  meta?: {
    description?: string;
    severity?: 'low' | 'moderate' | 'high';
    recommendations?: string[];
    [k: string]: any;
  };
};

const KEY = 'diagnosisHistory';

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getHistory(): DiagnosisRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DiagnosisRecord[];
  } catch (err) {
    console.error("Failed to parse history:", err);
    return [];
  }
}

function setHistory(arr: DiagnosisRecord[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch (err) {
    console.error("Failed to save history:", err);
  }
}

export function addRecord(data: Omit<DiagnosisRecord, 'id' | 'dateISO' | 'displayTime'>) {
  const now = new Date();
  const record: DiagnosisRecord = {
    ...data,
    id: crypto.randomUUID(),
    dateISO: now.toISOString(),
    displayTime: now.toLocaleString('th-TH'),
  };
  const old = getHistory();
  setHistory([...old, record]);
  return record;
}

export function clearHistory() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    console.error("Failed to clear history:", err);
  }
}
