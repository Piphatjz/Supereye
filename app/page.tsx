
'use client'
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Heart, Home, User, CreditCard, History, Eye, Zap, Users, TrendingUp } from "lucide-react";

// Mock data for demonstration
const mockHistory = [
  
];

const mockCredits = 5;

export default function EyeDiseaseAnalyzer() {
  const [activeTab, setActiveTab] = useState("home");
  const [analysisHistory, setAnalysisHistory] = useState(mockHistory);
  const [credits, setCredits] = useState(mockCredits);

  const getSeverityColor = (severity) => {
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

  const getSeverityText = (severity) => {
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

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Fix hydration error by ensuring consistent date formatting
  const formatConsistentDate = (date) => {
    // Ensure the same format is used on server and client
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
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Supereye</span>
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
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === "home"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>หน้าหลัก</span>
            </button>
            
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <History className="w-4 h-4" />
              <span>ประวัติการวิเคราะห์</span>
            </button>
            
            <button
              onClick={() => setActiveTab("credits")}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === "credits"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>เครดิต</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Home Tab */}
        {activeTab === "home" && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Supereye AI
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                เสริมพลังให้แพทย์ด้วยการตรวจคัดกรองโรคตาเบื้องต้นด้วย AI ตรวจพบโรคสำคัญได้เร็ว ลดภาระงาน และปกป้องการมองเห็นของผู้ป่วยในวงกว้าง
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
                  onClick={() => window.location.href = '/Batch'}
                >
                  เริ่มการวิเคราะห์แบบกลุ่ม
                </Button>
                
              </div>
            </div>

            {/* Problem Statement */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-500" />
                  The Challange
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">วิกฤติสุขภาพตาทั่วโลก</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>มีผู้คนกว่า 1,000 ล้านคนทั่วโลกที่มีปัญหาการมองเห็น</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>เบาหวานขึ้นตาส่งผลต่อ 1 ใน 3 ของผู้ป่วยเบาหวาน (เกือบ 150 ล้านคน)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>การเข้าถึงจักษุแพทย์มีข้อจำกัด โดยเฉพาะในพื้นที่ชนบท</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>ต้นทุนการตรวจคัดกรองแบบดั้งเดิมมีราคาสูง</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">โซลูชันของเรา</h3>
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
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Early Detection</h3>
                  <p className="text-gray-600 dark:text-gray-400">มีการวินิจฉัยเบื้องต้นที่รวดเร็ว เพื่อการรักษาที่มีประสิทธิภาพสูงสุด</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ลดภาระจักษุแพทย์</h3>
                  <p className="text-gray-600 dark:text-gray-400">ทำหน้าที่เป็นผู้ช่วยจักษุแพทย์ เพื่อความรวดเร็ว ลดภาระงานและจัดลำดับความสำคัญของผู้ป่วย ทำให้การรักษาผู้ป่วยมีจำนวนมากยิ่งขึ้น</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">...</h3>
                  <p className="text-gray-600 dark:text-gray-400">...</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Analysis Preview */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">การวิเคราะห์ล่าสุด</CardTitle>
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
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.result.disease}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.result.description}</p>
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
              <CardTitle className="text-2xl text-gray-900 dark:text-white">ประวัติการวิเคราะห์</CardTitle>
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
                    <div
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <img
                          src={item.image}
                          alt="ภาพที่วิเคราะห์"
                          className="w-32 h-32 rounded-lg object-cover"
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Credits Tab */}
        {activeTab === "credits" && (
          <div className="space-y-6">

            
            
          </div>
        )}
      </main>
    </div>
  );
}