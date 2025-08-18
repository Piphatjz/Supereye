"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Eye, Activity, Clock, CheckCircle, AlertTriangle, Info, Heart } from "lucide-react"
import Navbar from "@/components/navbar"
import { useLanguage } from "@/contexts/language-context"

interface AnalysisResult {
  disease: string
  confidence: number
  severity: "low" | "medium" | "high"
  description: string
  recommendations: string[]
}

export default function EyeDiseaseAnalyzer() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<
    Array<{
      id: string
      image: string
      result: AnalysisResult
      timestamp: Date
    }>
  >([])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setAnalysisResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)

    try {
      // Create FormData to send image to API
      const formData = new FormData()

      // Convert data URL to File object
      const response = await fetch(selectedImage)
      const blob = await response.blob()
      const file = new File([blob], "retinal-image.jpg", { type: "image/jpeg" })
      formData.append("image", file)

      // Call your API
      const apiResponse = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!apiResponse.ok) {
        throw new Error("Analysis failed")
      }

      const result: AnalysisResult = await apiResponse.json()

      setAnalysisResult(result)
      setAnalysisHistory((prev) => [
        {
          id: Date.now().toString(),
          image: selectedImage,
          result: result,
          timestamp: new Date(),
        },
        ...prev,
      ])
      setIsAnalyzing(false)
    } catch (error) {
      console.error("Analysis error:", error)
      setIsAnalyzing(false)
      // You might want to show an error message to the user
      alert(t("analysis.error") || "Analysis failed. Please try again.")
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <CheckCircle className="w-4 h-4" />
      case "medium":
        return <AlertTriangle className="w-4 h-4" />
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "low":
        return t("results.lowLevel")
      case "medium":
        return t("results.mediumLevel")
      case "high":
        return t("results.highLevel")
      default:
        return severity
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analyze" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800">
            <TabsTrigger
              value="analyze"
              className="flex items-center gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900"
            >
              <Activity className="w-4 h-4" />
              {t("nav.analyzeImage")}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900"
            >
              <Clock className="w-4 h-4" />
              {t("nav.analysisHistory")}
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="flex items-center gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900"
            >
              <Info className="w-4 h-4" />
              {t("nav.diseaseInfo")}
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="flex items-center gap-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900"
            >
              <Heart className="w-4 h-4" />
              {t("nav.credits")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image Upload Section */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">{t("upload.title")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {t("upload.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {selectedImage ? (
                          <div className="space-y-2">
                            <img
                              src={selectedImage || "/placeholder.svg"}
                              alt="Selected retinal image"
                              className="max-w-full h-48 object-contain mx-auto rounded-lg"
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t("upload.clickToChange")}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
                            <p className="text-gray-600 dark:text-gray-400">{t("upload.clickToSelect")}</p>
                          </div>
                        )}
                      </label>
                    </div>

                    <Button
                      onClick={analyzeImage}
                      disabled={!selectedImage || isAnalyzing}
                      className="w-full"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Activity className="w-4 h-4 mr-2 animate-spin" />
                          {t("upload.analyzing")}
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          {t("upload.startAnalysis")}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results Section */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">{t("results.title")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {t("results.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2 animate-spin" />
                        <p className="text-gray-600 dark:text-gray-400">{t("results.processing")}</p>
                      </div>
                      <Progress value={33} className="w-full" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t("results.pleaseWait")}</p>
                    </div>
                  )}

                  {analysisResult && !isAnalyzing && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {analysisResult.disease}
                        </h3>
                        <Badge className={getSeverityColor(analysisResult.severity)}>
                          {getSeverityIcon(analysisResult.severity)}
                          <span className="ml-1">{getSeverityText(analysisResult.severity)}</span>
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t("results.confidence")}</p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={
                              analysisResult.confidence > 1
                                ? analysisResult.confidence
                                : analysisResult.confidence * 100
                            }
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {analysisResult.confidence > 1
                              ? analysisResult.confidence
                              : Math.round(analysisResult.confidence * 100)}
                            %
                          </span>
                        </div>
                      </div>

                      <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                          {analysisResult.description}
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{t("results.recommendations")}</h4>
                        <ul className="space-y-1">
                          {analysisResult.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {!selectedImage && !isAnalyzing && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t("upload.uploadToStart")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">{t("history.title")}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {t("history.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisHistory.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t("history.noHistory")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysisHistory.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt="Analyzed image"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 dark:text-white">{item.result.disease}</h4>
                              <Badge className={getSeverityColor(item.result.severity)}>
                                {getSeverityText(item.result.severity)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t("history.confidence")}:{" "}
                              {item.result.confidence > 1
                                ? item.result.confidence
                                : Math.round(item.result.confidence * 100)}
                              %
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {item.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">{t("disease.diabeticRetinopathy")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Diabetic Retinopathy</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t("disease.diabeticDesc")}</p>
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{t("disease.symptoms")}</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t("disease.symptoms") === "Symptoms:" ? "Blurred vision" : "มองเห็นภาพเบลอ"}</li>
                      <li>• {t("disease.symptoms") === "Symptoms:" ? "Dark spots or floaters" : "เห็นจุดดำลอยตา"}</li>
                      <li>• {t("disease.symptoms") === "Symptoms:" ? "Reduced night vision" : "การมองเห็นในที่มืดลดลง"}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">{t("disease.glaucoma")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Glaucoma</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t("disease.glaucomaDesc")}</p>
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{t("disease.symptoms")}</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t("disease.symptoms") === "Symptoms:" ? "Reduced peripheral vision" : "สายตาข้างลดลง"}</li>
                      <li>• {t("disease.symptoms") === "Symptoms:" ? "Eye pain, headaches" : "ปวดตา ปวดหัว"}</li>
                      <li>
                        • {t("disease.symptoms") === "Symptoms:" ? "Seeing halos around lights" : "เห็นรัศมีรอบแสงไฟ"}
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">{t("disease.macularDegeneration")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Macular Degeneration</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t("disease.macularDesc")}</p>
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{t("disease.symptoms")}</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>
                        • {t("disease.symptoms") === "Symptoms:" ? "Blurred central vision" : "มองเห็นภาพเบลอตรงกลาง"}
                      </li>
                      <li>
                        • {t("disease.symptoms") === "Symptoms:" ? "Straight lines appear curved" : "เส้นตรงดูคดโค้ง"}
                      </li>
                      <li>• {t("disease.symptoms") === "Symptoms:" ? "Colors appear faded" : "สีดูจางลง"}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">{t("disease.normal")}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Normal</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t("disease.normalDesc")}</p>
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{t("disease.care")}</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t("disease.care") === "Care:" ? "Annual eye examination" : "ตรวจตาประจำปี"}</li>
                      <li>• {t("disease.care") === "Care:" ? "Protect from bright sunlight" : "ป้องกันแสงแดดจัด"}</li>
                      <li>
                        • {t("disease.care") === "Care:" ? "Eat foods rich in Vitamin A" : "รับประทานอาหารที่มีวิตามิน A"}
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          
        </Tabs>
      </div>
    </div>
  )
}
