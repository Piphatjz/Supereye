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

    
    const flaskForm = new FormData()
    
    flaskForm.append("file", image, image.name || "upload.jpg")

    
    const base =
      process.env.FLASK_API_BASE ||
      process.env.NEXT_PUBLIC_API_BASE || 
      "NEXT_PUBLIC_API_URL=https://............/predict"

    // ยิงไปยัง Flask
    const res = await fetch(`${base}/predict`, {
      method: "POST",
      body: flaskForm, 
      
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Flask error: ${text}` }, { status: res.status })
    }

    
    // { predictions: [{label, prob}, ...], meta: {...} }
    const data = await res.json()

    const top = Array.isArray(data?.predictions) ? data.predictions[0] : null
    const disease = top?.label ?? "Unknown"
    const confidence = typeof top?.prob === "number" ? top.prob : 0

    
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
