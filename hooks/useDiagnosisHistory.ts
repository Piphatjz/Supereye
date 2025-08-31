'use client'
import { useEffect, useState } from 'react'
import { getHistory, clearHistory, type DiagnosisRecord } from '@/lib/diagnosisHistory'

/**
 * Custom hook สำหรับจัดการประวัติการวินิจฉัย
 * - อ่าน history จาก localStorage
 * - อัปเดตอัตโนมัติถ้ามีการเปลี่ยนค่า (เช่น clear, add)
 * - ใช้ร่วมกับหน้า History และปุ่ม Clear ได้ทันที
 */
export function useDiagnosisHistory() {
  const [history, setHistory] = useState<DiagnosisRecord[]>([])

  useEffect(() => {
    setHistory(getHistory())

    // sync ข้ามแท็บ browser
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'diagnosisHistory') {
        setHistory(getHistory())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const refresh = () => setHistory(getHistory())

  const clear = () => {
    clearHistory()
    setHistory([])
  }

  return { history, refresh, clear }
}
