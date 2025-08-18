"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "th" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  th: {
    // Navbar
    "nav.analyzeImage": "วิเคราะห์ภาพ",
    "nav.analysisHistory": "ประวัติการวิเคราะห์",
    "nav.diseaseInfo": "ข้อมูลโรค",
    "nav.credits": "เครดิต",
    "nav.profile": "โปรไฟล์",
    "nav.settings": "ตั้งค่า",
    "nav.signOut": "ออกจากระบบ",
    "nav.doctor": "แพทย์หญิง สมใจ ใจดี",
    "nav.email": "somjai@hospital.com",

    // Theme
    "theme.light": "โหมดสว่าง",
    "theme.dark": "โหมดมืด",
    "theme.system": "ตามระบบ",

    // Main Page
    "upload.title": "อัปโหลดภาพจอประสาทตา",
    "upload.description": "เลือกภาพถ่ายจอประสาทตาที่ต้องการวิเคราะห์ (รองรับไฟล์ JPG, PNG)",
    "upload.clickToSelect": "คลิกเพื่อเลือกภาพ หรือลากไฟล์มาวาง",
    "upload.clickToChange": "คลิกเพื่อเปลี่ยนภาพ",
    "upload.startAnalysis": "เริ่มวิเคราะห์",
    "upload.analyzing": "กำลังวิเคราะห์...",
    "upload.uploadToStart": "อัปโหลดภาพเพื่อเริ่มการวิเคราะห์",

    // Analysis Results
    "results.title": "ผลการวิเคราะห์",
    "results.description": "ผลลัพธ์จากการวิเคราะห์ภาพจอประสาทตาด้วย AI",
    "results.processing": "กำลังประมวลผลภาพ...",
    "results.pleaseWait": "โปรดรอสักครู่ ระบบกำลังวิเคราะห์ภาพของคุณ",
    "results.confidence": "ความมั่นใจ",
    "results.recommendations": "คำแนะนำ:",
    "results.lowLevel": "ระดับต่ำ",
    "results.mediumLevel": "ระดับปานกลาง",
    "results.highLevel": "ระดับสูง",

    // Mock Analysis Result
    "analysis.diabeticRetinopathy": "โรคจอประสาทตาจากเบาหวาน",
    "analysis.description": "พบสัญญาณของโรคจอประสาทตาจากเบาหวาน ระยะปานกลาง มีการรั่วซึมของเลือดและการบวมของจอประสาทตา",
    "analysis.rec1": "ควรพบแพทย์จักษุแพทย์โดยเร็ว",
    "analysis.rec2": "ควบคุมระดับน้ำตาลในเลือดให้อยู่ในเกณฑ์ปกติ",
    "analysis.rec3": "ตรวจตาอย่างสม่ำเสมอทุก 3-6 เดือน",
    "analysis.rec4": "หลีกเลี่ยงการออกแรงหนักและการยกของหนัก",
    "analysis.error": "เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง",

    // History
    "history.title": "ประวัติการวิเคราะห์",
    "history.description": "รายการภาพที่เคยวิเคราะห์ทั้งหมด",
    "history.noHistory": "ยังไม่มีประวัติการวิเคราะห์",
    "history.confidence": "ความมั่นใจ",

    // Disease Info
    "disease.diabeticRetinopathy": "โรคจอประสาทตาจากเบาหวาน",
    "disease.diabeticDesc": "เป็นภาวะแทรกซ้อนของโรคเบาหวานที่ส่งผลต่อจอประสาทตา เกิดจากระดับน้ำตาลในเลือดสูงเป็นเวลานาน",
    "disease.glaucoma": "โรคต้อหิน",
    "disease.glaucomaDesc": "โรคที่เกิดจากความดันในลูกตาสูง ทำให้เส้นประสาทตาเสียหาย อาจนำไปสู่การตาบอดได้",
    "disease.macularDegeneration": "โรคจุดเหลืองเสื่อม",
    "disease.macularDesc": "การเสื่อมของจุดเหลืองในจอประสาทตา ส่งผลต่อการมองเห็นตรงกลาง มักพบในผู้สูงอายุ",
    "disease.normal": "จอประสาทตาปกติ",
    "disease.normalDesc": "จอประสาทตาที่มีสภาพปกติ ไม่พบความผิดปกติหรือสัญญาณของโรค",
    "disease.symptoms": "อาการ:",
    "disease.care": "การดูแล:",

    // Credits
    "credits.title": "ผู้พัฒนาระบบ",
    "credits.description": "ทีมงานที่อยู่เบื้องหลังการพัฒนาระบบวิเคราะห์โรคทางตา",
    "credits.aiTeam": "ทีมพัฒนา AI Model",
    "credits.aiDesc": "การพัฒนาโมเดล Deep Learning สำหรับการวิเคราะห์โรคทางตา",
    "credits.frontendTeam": "ทีมพัฒนา Frontend",
    "credits.frontendDesc": "การออกแบบและพัฒนาส่วนติดต่อผู้ใช้ที่ใช้งานง่าย",
    "credits.techUsed": "เทคโนโลยีที่ใช้:",
    "credits.thanks": "ขอบคุณ",
    "credits.researchData": "ข้อมูลการวิจัย",
    "credits.researchDesc": "ขอบคุณนักวิจัยและแพทย์ที่ให้ข้อมูลทางการแพทย์",
    "credits.dataset": "ชุดข้อมูล",
    "credits.datasetDesc": "ขอบคุณสำหรับชุดข้อมูลภาพจอประสาทตาที่ใช้ในการฝึกโมเดล",
    "credits.openSource": "Open Source",
    "credits.openSourceDesc": "ขอบคุณชุมชน Open Source ที่ให้เครื่องมือและไลบรารี",
    "credits.developedWith": "พัฒนาด้วย ❤️ เพื่อการดูแลสุขภาพตาที่ดีกว่า",
  },
  en: {
    // Navbar
    "nav.analyzeImage": "Analyze Image",
    "nav.analysisHistory": "Analysis History",
    "nav.diseaseInfo": "Disease Info",
    "nav.credits": "Credits",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.signOut": "Sign Out",
    "nav.doctor": "Dr. Sarah Johnson",
    "nav.email": "sarah.johnson@hospital.com",

    // Theme
    "theme.light": "Light Mode",
    "theme.dark": "Dark Mode",
    "theme.system": "System",

    // Main Page
    "upload.title": "Upload Retinal Image",
    "upload.description": "Select a retinal image for analysis (Supports JPG, PNG files)",
    "upload.clickToSelect": "Click to select image or drag and drop file",
    "upload.clickToChange": "Click to change image",
    "upload.startAnalysis": "Start Analysis",
    "upload.analyzing": "Analyzing...",
    "upload.uploadToStart": "Upload an image to start analysis",

    // Analysis Results
    "results.title": "Analysis Results",
    "results.description": "AI-powered retinal image analysis results",
    "results.processing": "Processing image...",
    "results.pleaseWait": "Please wait, the system is analyzing your image",
    "results.confidence": "Confidence",
    "results.recommendations": "Recommendations:",
    "results.lowLevel": "Low Level",
    "results.mediumLevel": "Medium Level",
    "results.highLevel": "High Level",

    // Mock Analysis Result
    "analysis.diabeticRetinopathy": "Diabetic Retinopathy",
    "analysis.description":
      "Signs of diabetic retinopathy at moderate stage with blood leakage and retinal swelling detected",
    "analysis.rec1": "Should consult an ophthalmologist immediately",
    "analysis.rec2": "Control blood sugar levels within normal range",
    "analysis.rec3": "Regular eye examinations every 3-6 months",
    "analysis.rec4": "Avoid heavy lifting and strenuous activities",
    "analysis.error": "Analysis failed. Please try again.",

    // History
    "history.title": "Analysis History",
    "history.description": "List of all previously analyzed images",
    "history.noHistory": "No analysis history yet",
    "history.confidence": "Confidence",

    // Disease Info
    "disease.diabeticRetinopathy": "Diabetic Retinopathy",
    "disease.diabeticDesc":
      "A complication of diabetes that affects the retina, caused by prolonged high blood sugar levels",
    "disease.glaucoma": "Glaucoma",
    "disease.glaucomaDesc":
      "A disease caused by high intraocular pressure that damages the optic nerve and can lead to blindness",
    "disease.macularDegeneration": "Macular Degeneration",
    "disease.macularDesc":
      "Deterioration of the macula in the retina, affecting central vision, commonly found in elderly people",
    "disease.normal": "Normal Retina",
    "disease.normalDesc": "A retina in normal condition with no abnormalities or signs of disease",
    "disease.symptoms": "Symptoms:",
    "disease.care": "Care:",

    // Credits
    "credits.title": "System Developers",
    "credits.description": "The team behind the eye disease analysis system development",
    "credits.aiTeam": "AI Model Development Team",
    "credits.aiDesc": "Deep Learning model development for eye disease analysis",
    "credits.frontendTeam": "Frontend Development Team",
    "credits.frontendDesc": "User interface design and development for easy usage",
    "credits.techUsed": "Technologies Used:",
    "credits.thanks": "Acknowledgments",
    "credits.researchData": "Research Data",
    "credits.researchDesc": "Thanks to researchers and doctors who provided medical information",
    "credits.dataset": "Dataset",
    "credits.datasetDesc": "Thanks for the retinal image dataset used for model training",
    "credits.openSource": "Open Source",
    "credits.openSourceDesc": "Thanks to the Open Source community for tools and libraries",
    "credits.developedWith": "Developed with ❤️ for better eye health care",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("th")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "th" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
