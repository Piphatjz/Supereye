'use client';
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/** ====== ชนิดข้อมูลที่รับเข้ามา ======
 * เอามาจากผล API ของคุณ (ApiResponse) + meta เสริม (เช่น ms, heatmapUrl)
 */
export type ClinicianRoleInput = {
  imageUrl?: string;                  // ภาพต้นฉบับ (ถ้ามี)
  heatmapUrl?: string;                // ถ้ามี heatmap ให้โชว์ซ้อนเพื่อช่วยสังเกต
  top1: { label: string; prob: number }; // ความน่าจะเป็น 0..1
  labels: string[];                   // labels_current
  probs: number[];                    // probs 0..1 ตามลำดับเดียวกับ labels
  ms?: number;                        // เวลา inference ms (optional)
};

type Severity = 'low' | 'moderate' | 'high';

function pct(x: number | undefined) {
  const v = Math.max(0, Math.min(1, x ?? 0));
  return Math.round(v * 100);
}

function severityFromProb(p: number): Severity {
  if (p >= 0.85) return 'high';
  if (p >= 0.60) return 'moderate';
  return 'low';
}

function severityColor(s: Severity) {
  switch (s) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
}

/** margin = ระยะห่าง top1 - top2 (ยิ่งน้อยยิ่งไม่มั่นใจ) */
function margin(probs: number[]) {
  const sorted = [...probs].sort((a,b)=>b-a);
  return (sorted[0] ?? 0) - (sorted[1] ?? 0);
}

/** กติกา “คำแนะนำถัดไป” ต่อโรคยอดฮิต (แก้/เพิ่มได้) */
function nextStepsByDisease(label: string, sev: Severity): string[] {
  const L = label.toLowerCase();
  if (L.includes('glaucoma')) {
    if (sev === 'high') return ['ส่งต่อจักษุแพทย์เพื่อตรวจลานสายตา/ขั้วประสาทตา ภายใน 1–3 เดือน'];
    if (sev === 'moderate') return ['ติดตามกับจักษุแพทย์ภายใน 3–6 เดือน'];
    return ['ติดตามอาการเป็นระยะ และตรวจซ้ำเมื่อมีข้อบ่งชี้'];
  }
  if (L.includes('diabetic') || L.includes('dr')) {
    if (sev === 'high') return ['ส่งต่อจักษุแพทย์ และควบคุมน้ำตาลอย่างใกล้ชิด'];
    if (sev === 'moderate') return ['นัดตรวจจอประสาทตาใน 3 เดือน'];
    return ['แนะนำตรวจจอประสาทตาปีละครั้ง'];
  }
  if (L.includes('cataract')) {
    if (sev === 'high') return ['พิจารณาส่งต่อประเมินผ่าตัดต้อกระจก'];
    if (sev === 'moderate') return ['ติดตามอาการ/วัดผลกระทบต่อการมองเห็น'];
    return ['ให้คำแนะนำเรื่องแสงสว่างและติดตามเป็นระยะ'];
  }
  // Normal หรืออื่น ๆ
  return ['หากอาการไม่ดีขึ้น/เกิดใหม่ ให้พิจารณาตรวจซ้ำ'];
}

/** เหตุผล/บริบทที่อ่านง่าย */
function buildRationales(input: ClinicianRoleInput, sev: Severity) {
  const reasons: string[] = [];
  const p1 = input.top1.prob;
  const idx2 = bestSecondIndex(input.labels, input.probs, input.top1.label);
  const p2 = idx2 >= 0 ? input.probs[idx2] : 0;
  const mg = p1 - p2;

  reasons.push(`ค่าความมั่นใจของโมเดลอยู่ที่ ${pct(p1)}%`);

  if (mg < 0.10) {
    reasons.push(`ผลใกล้เคียงกับทางเลือกอันดับถัดไป (${input.labels[idx2]} ${pct(p2)}%) → พิจารณาปัจจัยร่วม/ตรวจยืนยัน`);
  } else {
    reasons.push(`ผลห่างจากทางเลือกถัดไปพอสมควร (margin ${(mg*100).toFixed(1)}%)`);
  }

  if (sev !== 'low') {
    reasons.push(`จัดอยู่ในระดับความเร่งด่วน: ${sev === 'high' ? 'สูง' : 'ปานกลาง'}`);
  } else {
    reasons.push('ระดับความเร่งด่วนต่ำ สามารถติดตามตามอาการได้');
  }

  return reasons;
}

function bestSecondIndex(labels: string[], probs: number[], top1Label: string) {
  let bestIdx = -1, bestProb = -1;
  labels.forEach((lb, i) => {
    if (lb === top1Label) return;
    if (probs[i] > bestProb) { bestProb = probs[i]; bestIdx = i; }
  });
  return bestIdx;
}

/** คำเตือนมาตรฐานอ่านง่าย */
function defaultCaveats(input: ClinicianRoleInput) {
  const caveats = [
    'ภาพที่เบลอ/ย้อนแสงอาจทำให้ความมั่นใจลดลง',
    'ผลโมเดลเป็นตัวช่วยคัดกรองเบื้องต้น—การวินิจฉัยยืนยันควรทำโดยจักษุแพทย์',
  ];
  if (typeof input.ms === 'number') {
    caveats.push(`เวลาในการวิเคราะห์ ~${input.ms} ms`);
  }
  return caveats;
}

export default function ClinicianRoleCard({ imageUrl, heatmapUrl, top1, labels, probs, ms }: ClinicianRoleInput) {
  const sev = severityFromProb(top1.prob);
  const steps = nextStepsByDisease(top1.label, sev);
  const rationales = buildRationales({ imageUrl, heatmapUrl, top1, labels, probs, ms }, sev);
  const caveats = defaultCaveats({ imageUrl, heatmapUrl, top1, labels, probs, ms });

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-gray-900 dark:text-white">
            สรุปสำหรับแพทย์
          </CardTitle>
          <Badge className={`px-3 py-1 ${severityColor(sev)}`}>
            {sev === 'high' ? 'ความเร่งด่วนสูง'
             : sev === 'moderate' ? 'ความเร่งด่วนปานกลาง'
             : 'ความเร่งด่วนต่ำ'}
          </Badge>
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          ผลที่เป็นไปได้มากที่สุด: <b>{top1.label}</b> ({pct(top1.prob)}%)
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ภาพช่วยสังเกต */}
        {(imageUrl || heatmapUrl) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {imageUrl && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">ภาพต้นฉบับ</div>
                <img src={imageUrl} alt="retina" className="w-full rounded-lg border" />
              </div>
            )}
            {heatmapUrl && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">บริเวณที่โมเดลให้ความสำคัญ</div>
                <img src={heatmapUrl} alt="heatmap" className="w-full rounded-lg border" />
              </div>
            )}
          </div>
        )}

        {/* เหตุผลสั้น ๆ ที่อ่านง่าย */}
        <section>
          <div className="font-semibold mb-2 text-gray-900 dark:text-white">เหตุผลสรุป</div>
          <ul className="space-y-1 text-gray-700 dark:text-gray-300">
            {rationales.map((r, i) => (
              <li key={i} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ทางเลือกที่เป็นไปได้ถัดไป (ช่วยอ่านความไม่แน่ใจ) */}
        <section>
          <div className="font-semibold mb-2 text-gray-900 dark:text-white">ทางเลือกใกล้เคียง</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {labels.slice(0, 4).map((lb, i) => (
              <div key={lb} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{lb}</span>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{pct(probs[i])}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* คำแนะนำถัดไป */}
        <section>
          <div className="font-semibold mb-2 text-gray-900 dark:text-white">คำแนะนำถัดไป</div>
          <ul className="space-y-1 text-gray-700 dark:text-gray-300">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ข้อควรระวัง/ข้อจำกัด */}
        <section>
          <div className="font-semibold mb-2 text-gray-900 dark:text-white">ข้อควรระวัง</div>
          <ul className="space-y-1 text-gray-700 dark:text-gray-300">
            {caveats.map((c, i) => (
              <li key={i} className="flex items-start">
                <span className="text-gray-500 mr-2">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ปุ่มการกระทำ (ปรับเองได้) */}
        <div className="flex gap-2">
          <Button onClick={() => window.open('/history', '_self')}>ดูประวัติ</Button>
          <Button variant="secondary" onClick={() => window.print()}>พิมพ์สรุป</Button>
        </div>
      </CardContent>
    </Card>
  );
}
