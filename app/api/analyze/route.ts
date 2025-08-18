// app/api/analyze/route.ts
import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File | null
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // เตรียม FormData ใหม่เพื่อส่งต่อไปยัง Flask
    const flaskForm = new FormData()
    // เปลี่ยนชื่อฟิลด์เป็น 'file' ให้ตรงกับ Flask (/predict)
    flaskForm.append("file", image, image.name || "upload.jpg")

    // อ่าน base URL จาก ENV (ฝั่งเซิร์ฟเวอร์อ่านได้ ไม่ต้องใช้ NEXT_PUBLIC)
    const base =
      process.env.FLASK_API_BASE ||
      process.env.NEXT_PUBLIC_API_BASE || // เผื่อคุณเคยตั้งไว้
      "http://127.0.0.1:8000"

    // ยิงไปยัง Flask
    const res = await fetch(`${base}/predict`, {
      method: "POST",
      body: flaskForm, // ปล่อยให้ fetch ใส่ boundary เอง
      // อย่าใส่ headers Content-Type เอง
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Flask error: ${text}` }, { status: res.status })
    }

    // รูปแบบตอบกลับจาก Flask:
    // { predictions: [{label, prob}, ...], meta: {...} }
    const data = await res.json()

    const top = Array.isArray(data?.predictions) ? data.predictions[0] : null
    const disease = top?.label ?? "Unknown"
    const confidence = typeof top?.prob === "number" ? top.prob : 0

    // map ความมั่นใจกับ severity ให้เข้ารูปแบบ UI ของคุณ
    const severity =
      disease === "Normal"
        ? ("low" as const)
        : confidence >= 0.8
        ? ("high" as const)
        : confidence >= 0.5
        ? ("medium" as const)
        : ("low" as const)

    const analysisResult = {
      disease,
      confidence,
      severity,
      description:
        disease === "Normal"
          ? "No significant abnormalities detected by the model."
          : "This is the model's top predicted class.",
      recommendations:
        disease === "Normal"
          ? ["Maintain regular eye check-ups."]
          : ["Consult an ophthalmologist for further evaluation."],
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
