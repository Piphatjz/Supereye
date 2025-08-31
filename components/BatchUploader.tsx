'use client';

import React, { useMemo, useRef, useState } from 'react';
import { addHistoryItem } from '@/lib/history';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { addRecord } from '@/lib/diagnosisHistory';
import Image from 'next/image';
import ClinicianRoleCard from '@/components/ClinicianRoleCard';

type ApiTop1 = { label: string; index: number; prob: number };
type ApiPrediction = { label: string; prob: number };
type ApiResponse = {
  predictions: ApiPrediction[];
  top1: ApiTop1;
  probs: number[];
  labels_current: string[];
};

type Job = {
  id: string;
  file: File;
  name: string;
  status: 'queued' | 'running' | 'done' | 'error' | 'canceled';
  startedAt?: number;
  finishedAt?: number;
  ms?: number;
  result?: ApiResponse;
  error?: string;
  preview?: string; // data URL preview (ภาพทั่วไปเท่านั้น)
};

// ---------- Helper: ตรวจว่าเป็นไฟล์ DICOM ไหม ----------
function isDicomFile(file: File) {
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  return name.endsWith('.dcm') || name.endsWith('.dicom') || type.includes('dicom');
}

function fmtMs(ms?: number) {
  if (ms === undefined) return '-';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function toCSV(rows: Array<Record<string, any>>) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.map(esc).join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
}

// ---------- Endpoint 2 ตัว (รูปทั่วไป / DICOM) ----------
const IMG_API = process.env.NEXT_PUBLIC_API_URL || 'https://788a3a173083.ngrok-free.app/predict';
const DCM_API = process.env.NEXT_PUBLIC_API_URL_DICOM || 'https://788a3a173083.ngrok-free.app/predict-dicom';

// ---------- ยิง API โดยเลือก URL ตามชนิดไฟล์ ----------
async function predictOne(file: File, signal?: AbortSignal): Promise<ApiResponse> {
  const endpoint = isDicomFile(file) ? DCM_API : IMG_API;
  const fd = new FormData();
  fd.append('file', file, file.name);

  const headers = { 'ngrok-skip-browser-warning': 'true' };

  const res = await fetch(endpoint, { method: 'POST', body: fd, signal, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }
  return res.json();
}

// แปลงความมั่นใจให้เป็น 0..1 (เผื่อกรณีอื่นในระบบ)
function toProb01(x?: number) {
  if (x == null) return undefined;
  return x > 1 ? Math.max(0, Math.min(1, x / 100)) : x;
}

export default function BatchUploader() {
  const [concurrency, setConcurrency] = useState<number>(3);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'queued' | 'running' | 'done' | 'error'>('all');
  const abortRef = useRef<AbortController | null>(null);

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;

    const list: Job[] = Array.from(files).map((f, i) => ({
      id: `${Date.now()}_${i}_${f.name}`,
      file: f,
      name: f.name,
      status: 'queued',
    }));

    // ภาพทั่วไป -> ทำ preview; DICOM -> ไม่ทำ preview
    list.forEach(j => {
      if (isDicomFile(j.file)) {
        setJobs(prev => prev.map(p => (p.id === j.id ? { ...p, preview: undefined } : p)));
      } else {
        const reader = new FileReader();
        reader.onload = () =>
          setJobs(prev => prev.map(p => (p.id === j.id ? { ...p, preview: String(reader.result) } : p)));
        reader.readAsDataURL(j.file);
      }
    });

    setJobs(prev => [...prev, ...list]);
  };

  const clearAll = () => {
    if (!isRunning) setJobs([]);
  };

  const cancelAll = () => {
    abortRef.current?.abort();
    setIsRunning(false);
    setJobs(prev =>
      prev.map(j => (j.status === 'running' || j.status === 'queued' ? { ...j, status: 'canceled' } : j)),
    );
  };

  const visibleJobs = useMemo(() => {
    if (filter === 'all') return jobs;
    return jobs.filter(j => j.status === filter);
  }, [jobs, filter]);

  const start = async () => {
    if (!jobs.length) return;
    setIsRunning(true);
    const ac = new AbortController();
    abortRef.current = ac;

    let queue = jobs.map(j => (j.status === 'done' ? j : { ...j, status: 'queued' }));
    setJobs(queue);

    let inFlight = 0;
    let cursor = 0;

    const update = (id: string, patch: Partial<Job>) =>
      setJobs(prev => prev.map(j => (j.id === id ? { ...j, ...patch } : j)));

    const runOne = async (job: Job) => {
      inFlight++;
      const startedAt = performance.now();
      update(job.id, { status: 'running', startedAt });

      try {
        const result = await predictOne(job.file, ac.signal);
        const finishedAt = performance.now();

        // อัปเดตสถานะงาน
        update(job.id, {
          status: 'done',
          finishedAt,
          ms: Math.round(finishedAt - startedAt),
          result,
        });

        // บันทึกประวัติ
        try {
          const confidencePct = Math.round((result?.top1?.prob ?? 0) * 100);

          addHistoryItem({
            id: job.id,
            image: job.preview || '',
            result: {
              disease: result?.top1?.label ?? 'Unknown',
              confidence: confidencePct,
              description: `Top-1: ${result?.top1?.label ?? '-'}`,
            },
            timestamp: new Date().toISOString(),
            ms: Math.round(finishedAt - startedAt),
          });

          addRecord({
            filename: job.name,
            diagnosis: result?.top1?.label ?? 'Unknown',
            confidence: toProb01(result?.top1?.prob),
            imageUrl: job.preview,
            meta: {
              description: `Top-1: ${result?.top1?.label ?? '-'}`,
              labels: result?.labels_current,
              probs: result?.probs,
              durationMs: Math.round(finishedAt - startedAt),
              isDicom: isDicomFile(job.file),
            },
          });
        } catch (e) {
          console.error('Failed to persist history:', e);
        }
      } catch (e: any) {
        const finishedAt = performance.now();
        update(job.id, {
          status: ac.signal.aborted ? 'canceled' : 'error',
          finishedAt,
          ms: Math.round(finishedAt - startedAt),
          error: String(e?.message || e),
        });
      } finally {
        inFlight--;
        pump();
      }
    };

    const pump = () => {
      if (ac.signal.aborted) return;
      while (inFlight < concurrency && cursor < queue.length) {
        const job = queue[cursor++];
        if (!job || job.status !== 'queued') continue;
        void runOne(job);
      }
      if (cursor >= queue.length && inFlight === 0) {
        setIsRunning(false);
        abortRef.current = null;
      }
    };

    pump();
  };

  const downloadCSV = () => {
    const rows = jobs
      .filter(j => j.status === 'done' && j.result)
      .map(j => ({
        file: j.name,
        top1_label: j.result!.top1.label,
        top1_prob: j.result!.top1.prob,
        all_labels: j.result!.labels_current.join('|'),
        all_probs: j.result!.probs.map(p => p.toFixed(6)).join('|'),
        time_ms: j.ms ?? '',
      }));
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const runningCount = jobs.filter(j => j.status === 'running').length;
  const doneCount = jobs.filter(j => j.status === 'done').length;
  const errorCount = jobs.filter(j => j.status === 'error').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <Button
              onClick={() => (window.location.href = '/')}
              className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-medium shadow-sm rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span>กลับสู่หน้าหลัก</span>
            </Button>
          </div>

          <div className="flex justify-center">
            <Image src="/logo.png" width={320} height={320} alt="Supereye AI Logo" className="max-w-full h-auto" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Panel */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">อัปโหลดภาพ</h2>
              <p className="text-gray-600">เลือกภาพหลายภาพเพื่อวิเคราะห์แบบกลุ่ม</p>
            </div>

            {/* File Upload */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">เลือกภาพ</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.dcm,.dicom"
                  multiple
                  onChange={e => onPickFiles(e.target.files)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 transition-colors file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              className="mb-8 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
              onDrop={e => {
                e.preventDefault();
                onPickFiles(e.dataTransfer?.files ?? null);
              }}
              onDragOver={e => {
                e.preventDefault();
              }}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div>
                  <p className="text-lg font-medium text-gray-700">ลากและวางภาพที่นี่</p>
                  <p className="text-gray-500">หรือคลิกเพื่อเลือกไฟล์</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {!isRunning ? (
                <button
                  onClick={start}
                  disabled={!jobs.some(j => ['queued', 'error', 'canceled'].includes(j.status))}
                  className="flex-1 min-w-[140px] px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  เริ่มการวิเคราะห์
                </button>
              ) : (
                <button
                  onClick={cancelAll}
                  className="flex-1 min-w-[140px] px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  ยกเลิกทั้งหมด
                </button>
              )}
              <button
                onClick={clearAll}
                disabled={isRunning || jobs.length === 0}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                ล้างรายการ
              </button>
              <button
                onClick={downloadCSV}
                disabled={doneCount === 0}
                className="px-6 py-3 bg-green-100 text-green-700 font-semibold rounded-xl hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                ส่งออก CSV
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
                <div className="text-xs text-blue-700 font-medium">ทั้งหมด</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{runningCount}</div>
                <div className="text-xs text-yellow-700 font-medium">กำลังทำงาน</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{doneCount}</div>
                <div className="text-xs text-green-700 font-medium">เสร็จสิ้น</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-xs text-red-700 font-medium">ข้อผิดพลาด</div>
              </div>
            </div>

            {/* Preview Thumbnails */}
            {jobs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  ตัวอย่าง ({Math.min(jobs.length, 6)} จาก {jobs.length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {jobs.slice(0, 6).map(j => (
                    <div key={j.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                      {j.preview ? (
                        <img src={j.preview} alt={j.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ผลการวิเคราะห์</h2>
                <p className="text-gray-600">ผลการวิเคราะห์จะแสดงที่นี่</p>
              </div>
              <div className="flex gap-2">
                {(['all', 'queued', 'running', 'done', 'error'] as const).map(k => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      filter === k ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {k === 'all' && 'ทั้งหมด'}
                    {k === 'queued' && 'รอคิว'}
                    {k === 'running' && 'กำลังทำงาน'}
                    {k === 'done' && 'เสร็จสิ้น'}
                    {k === 'error' && 'ข้อผิดพลาด'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
              {visibleJobs.map(j => (
                <div key={j.id} className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {j.preview ? (
                        <img src={j.preview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{j.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fmtMs(j.ms)}
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        j.status === 'done'
                          ? 'bg-green-100 text-green-800'
                          : j.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : j.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : j.status === 'canceled'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {j.status === 'done' && 'เสร็จสิ้น'}
                      {j.status === 'running' && 'กำลังทำงาน'}
                      {j.status === 'queued' && 'รอคิว'}
                      {j.status === 'error' && 'ข้อผิดพลาด'}
                      {j.status === 'canceled' && 'ยกเลิก'}
                    </div>
                  </div>

                  {j.result && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-gray-700">ผลการวิเคราะห์:</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold">
                          {j.result.top1.label}
                        </span>
                        <span className="text-sm font-mono text-gray-600">({(j.result.top1.prob * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {j.result.predictions.slice(0, 4).map((p, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                            <span className="text-sm text-gray-700 truncate">{p.label}</span>
                            <span className="text-sm font-mono text-gray-600 ml-2">{(p.prob * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {j.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm text-red-800 font-medium mb-1">ข้อผิดพลาด:</div>
                      <div className="text-xs text-red-600 break-all">{j.error}</div>
                    </div>
                  )}
                </div>
              ))}

              {visibleJobs.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีผลการวิเคราะห์</h3>
                  <p className="text-gray-500">อัปโหลดภาพและเริ่มการวิเคราะห์เพื่อดูผลลัพธ์ที่นี่</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
