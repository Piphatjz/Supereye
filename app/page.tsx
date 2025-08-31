'use client'
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Home, User, CreditCard, History, Eye, Zap, Users, TrendingUp } from "lucide-react";
import Image from "next/image";

import { useDiagnosisHistory } from '@/hooks/useDiagnosisHistory';

// ตัวช่วยแปลง confidence → severity
function fallbackSeverityFromConfidence(conf?: number): "low" | "medium" | "high" {
  const p = (conf ?? 0);
  const pct = p <= 1 ? p * 100 : p;
  if (pct >= 85) return "high";
  if (pct >= 60) return "medium";
  return "low";
}

// Team member data with 4 people
const teamMembers = [
  {
    id: 1,
    name: "นาย พิพัฒน์ นามแสง",
    role: "ชั้นมัธยมศึกษาปีที่ 6",
    image: "/J.png"
  },
  {
    id: 2,
    name: "นาย ผดุงศักดิ์ คำบาง",
    role: "ชั้นมัธยมศึกษาปีที่ 6",
    image: "/N.jpg"
  },
  {
    id: 3,
    name: "นางสาว ทิพย์อนันต์ โพธะกัน",
    role: "ครูที่ปรึกษา",
    image: "/T.png"
  },
  {
    id: 4,
    name: "นาย ธีรวุฒิ",
    role: "ครูที่ปรึกษา",
    image: "/A.png"
  }
];

export default function EyeDiseaseAnalyzer() {
  const [activeTab, setActiveTab] = useState("home");
  const [credits] = useState(5);

  // โหลดประวัติจาก localStorage
  const { history, clear } = useDiagnosisHistory();

  // แปลงโครงสร้าง history → ให้ตรงกับ UI เดิม
  const analysisHistory = useMemo(() => {
    return history.map((h, idx) => {
      const confidencePct = Math.round(((h.confidence ?? 0) <= 1 ? (h.confidence ?? 0) * 100 : (h.confidence ?? 0)));
      const rawSeverity = (h.meta?.severity as string | undefined) ?? undefined;
      const severity: "low" | "medium" | "high" =
        rawSeverity === "moderate"
          ? "medium"
          : (["low", "medium", "high"].includes(rawSeverity ?? "") 
              ? (rawSeverity as any) 
              : fallbackSeverityFromConfidence(h.confidence));

      return {
        id: h.id ?? `${idx}`,
        image: h.imageUrl || "/placeholder-retina.jpg",
        timestamp: h.dateISO ?? new Date().toISOString(),
        result: {
          disease: h.diagnosis ?? "Unknown",
          confidence: confidencePct,
          severity,
          description: (h.meta?.description as string | undefined) ?? `Top-1: ${h.diagnosis ?? "-"}`,
          recommendations: Array.isArray(h.meta?.recommendations) ? h.meta!.recommendations as string[] : [],
        }
      };
    });
  }, [history]);

  const getSeverityColor = (severity: "low" | "medium" | "high" | string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getSeverityText = (severity: "low" | "medium" | "high" | string) => {
    switch (severity) {
      case "low":
        return "ความเสี่ยงต่ำ";
      case "medium":
        return "ความเสี่ยงปานกลาง";
      case "high":
        return "ความเสี่ยงสูง";
      default:
        return severity;
    }
  };

  const formatConsistentDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                width={120}
                height={120}
                alt="Supereyeai logo"
                className="h-10 w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">Dr. Piphat</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-3">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
                activeTab === "home"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="whitespace-nowrap">หน้าหลัก</span>
            </button>
            
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
                activeTab === "history"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <History className="w-4 h-4" />
              <span className="whitespace-nowrap">ประวัติการวิเคราะห์</span>
            </button>
            
            <button
              onClick={() => setActiveTab("team")}
              className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
                activeTab === "team"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="whitespace-nowrap">ทีมงาน</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Home Tab */}
        {activeTab === "home" && (
          <div className="space-y-8">
            <div className="text-center py-8 md:py-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Supereye AI
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6 md:mb-8">
                เสริมพลังให้แพทย์ด้วยการตรวจคัดกรองโรคตาเบื้องต้นด้วย AI ตรวจพบโรคสำคัญได้เร็ว ลดภาระงาน และปกป้องการมองเห็นของผู้ป่วยในวงกว้าง
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 md:px-8 md:py-4 text-base md:text-lg"
                  onClick={() => window.location.href = '/Batch'}
                >
                  เริ่มการวิเคราะห์
                </Button>
              </div>
            </div>

            {/* Problem Statement */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  ความท้าทาย
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3">วิกฤติสุขภาพตาในประเทศไทย</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>โรคต้อหินและเบาหวานขึ้นตาเป็นสาเหตุหลักของการตาบอดถาวรในไทย</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>ประเทศไทยมีจักษุแพทย์เพียงประมาณ 1,500 คน แต่มีประชากรกว่า 70 ล้านคน → ผู้ป่วยต่างจังหวัดเข้าถึงการตรวจได้ยาก</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>ผู้ป่วยเบาหวานจำนวนมาก ไม่ได้ตรวจตาเป็นประจำปี → เสี่ยงตรวจพบ diabetic retinopathy ช้าเกินไป</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3">โซลูชันของเรา</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>การตรวจคัดกรองเรตินาด้วย AI โดยใช้ Convolutional Neural Networks</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>ตรวจจับโรคตา 4 ชนิดหลัก: ตาปกติ ต้อกระจก เบาหวานขึ้นตา ต้อหิน</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>เข้าถึงได้ผ่านเว็บแอปพลิเคชันและ API</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">การตรวจจับแต่เนื่องจากต้น</h3>
                  <p className="text-gray-600 dark:text-gray-400">ตรวจพบความผิดปกติเร็วขึ้น → รักษาได้ทันท่วงที ลดโอกาสสูญเสียการมองเห็นถาวร</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ลดภาระจักษุแพทย์</h3>
                  <p className="text-gray-600 dark:text-gray-400">ทำหน้าที่เป็นผู้ช่วยจักษุแพทย์ เพื่อความรวดเร็ว ลดภาระงานและจัดลำดับความสำคัญของผู้ป่วย</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ปรับขนาดได้ & ประหยัด</h3>
                  <p className="text-gray-600 dark:text-gray-400">สามารถนำไปใช้ในพื้นที่ที่มีทรัพยากรจำกัดด้วยอุปกรณ์ขั้นต่ำ</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Analysis Preview */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-gray-900 dark:text-white">การวิเคราะห์ล่าสุด</CardTitle>
                <CardDescription>ผลการวินิจฉัยล่าสุดจากผู้ป่วยของคุณ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">ยังไม่มีประวัติการวิเคราะห์</p>
                    </div>
                  ) : (
                    analysisHistory.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <img
                          src={item.image}
                          alt="ภาพเรตินา"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.result.disease}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.result.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatConsistentDate(new Date(item.timestamp))}</p>
                        </div>
                        <Badge className={getSeverityColor(item.result.severity)}>
                          {getSeverityText(item.result.severity)}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-gray-900 dark:text-white">ประวัติการวิเคราะห์</CardTitle>
              <CardDescription>ดูผลการวินิจฉัยทั้งหมดในอดีต</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">ไม่มีประวัติการวิเคราะห์</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">เริ่มต้นโดยการอัปโหลดภาพเรตินาเพื่อการวิเคราะห์</p>
                  <Button onClick={() => window.location.href = '/Batch'}>
                    อัปโหลดภาพ
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysisHistory.map((item) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <img 
                          src={item.image} 
                          alt="ภาพที่วิเคราะห์" 
                          className="w-full md:w-32 h-48 md:h-32 rounded-lg object-cover"
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{item.result.disease}</h4>
                            <Badge className={`px-3 py-1 text-sm ${getSeverityColor(item.result.severity)}`}>
                              {getSeverityText(item.result.severity)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{item.result.description}</p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{formatConsistentDate(new Date(item.timestamp))}</span>
                            <span className="mx-2">•</span>
                            <span>ความมั่นใจ: {item.result.confidence}%</span>
                          </div>
                          {item.result.recommendations.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2">คำแนะนำ:</h5>
                              <ul className="space-y-1">
                                {item.result.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    <span className="text-gray-600 dark:text-gray-400">{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {analysisHistory.length > 0 && (
                    <Button 
                      variant="destructive"
                      onClick={clear}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      ล้างประวัติ
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-center text-xl md:text-2xl text-gray-900 dark:text-white">ทีมงานของเรา</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {teamMembers.map((member) => (
                    <Card key={member.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          <Image 
                            src={member.image} 
                            alt={member.name} 
                            width={96} 
                            height={96}
                            className="object-cover"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">{member.role}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-gray-900 dark:text-white">เพิ่มเติม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400">
                    เรากำลังมองหาแพทย์ผู้เชี่ยวชาญ เพื่อช่วยขยายความสามารถของโครงงานโดยการทดลองใช้งานจริง สนใจติดต่อเราได้ที่ Email:Piphat.aj@gmail.com,Line ID:piphataj123
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}