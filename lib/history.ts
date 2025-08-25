export type HistoryItem = {
  id: string
  image: string // data URL
  result: { disease: string; confidence: number; severity?: string; description?: string; recommendations?: string[] }
  timestamp: string // ISO
  ms?: number
}

const KEY = "eye_history"

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistory(list: HistoryItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(list.slice(-100))) // keep last 100
}

export function addHistoryItem(item: HistoryItem) {
  if (typeof window === "undefined") return
  const list = getHistory()
  list.push(item)
  saveHistory(list)
}

export function clearHistory() {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEY)
}
