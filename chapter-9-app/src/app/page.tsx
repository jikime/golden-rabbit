"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  QrCode,
  Download,
  Copy,
  History,
  Settings,
  Palette,
  DownloadCloud,
  Trash,
  Camera,
  ScanLine,
  BarChart3,
  Eye,
  Save,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import QRCode from "qrcode"
import JsBarcode from "jsbarcode"
import { Scanner } from "@yudiel/react-qr-scanner"

interface CodeHistory {
  id: string
  text: string
  dataUrl: string
  createdAt: Date
  codeType: "qr" | "barcode" // New field to distinguish between QR and barcode
  type:
    | "url"
    | "text"
    | "email"
    | "phone"
    | "wifi"
    | "CODE128"
    | "EAN13"
    | "UPC"
    | "CODE39"
    | "ITF14"
    | "MSI"
    | "pharmacode"
    | "codabar"
  size?: number
  margin?: number
  errorCorrectionLevel?: string
  foregroundColor?: string
  backgroundColor?: string
  // Barcode specific properties
  width?: number
  height?: number
  fontSize?: number
  textPosition?: string
  textAlign?: string
  lineColor?: string
}

export default function QRCodeGenerator() {
  const [inputText, setInputText] = useState("")
  const [qrType, setQrType] = useState("text")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [history, setHistory] = useState<CodeHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [historyFilter, setHistoryFilter] = useState("all")

  const [qrSize, setQrSize] = useState([256])
  const [qrMargin, setQrMargin] = useState([2])
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("M")
  const [fileFormat, setFileFormat] = useState("PNG")
  const [foregroundColor, setForegroundColor] = useState("#059669")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")

  const [scanResult, setScanResult] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState("")

  const [barcodeText, setBarcodeText] = useState("")
  const [barcodeFormat, setBarcodeFormat] = useState("CODE128")
  const [barcodeWidth, setBarcodeWidth] = useState([2])
  const [barcodeHeight, setBarcodeHeight] = useState([100])
  const [barcodeMargin, setBarcodeMargin] = useState([10])
  const [barcodeFontSize, setBarcodeFontSize] = useState([14])
  const [barcodeTextPosition, setBarcodeTextPosition] = useState("bottom")
  const [barcodeTextAlign, setBarcodeTextAlign] = useState("center")
  const [barcodeColor, setBarcodeColor] = useState("#000000")
  const [barcodeBackground, setBarcodeBackground] = useState("#FFFFFF")
  const [barcodeDataUrl, setBarcodeDataUrl] = useState("")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null)

  const saveHistoryToStorage = (newHistory: CodeHistory[]) => {
    try {
      localStorage.setItem("code-history", JSON.stringify(newHistory))
    } catch (error) {
      console.error("Failed to save history to localStorage:", error)
      toast("저장 오류", {
        description: "히스토리 저장 중 오류가 발생했습니다.",
      })
    }
  }

  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem("code-history") || localStorage.getItem("qr-code-history")
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            codeType: item.codeType || "qr",
          }))
          setHistory(parsedHistory)

          if (localStorage.getItem("qr-code-history") && !localStorage.getItem("code-history")) {
            localStorage.setItem("code-history", JSON.stringify(parsedHistory))
            localStorage.removeItem("qr-code-history")
          }
        }
      } catch (error) {
        console.error("Failed to load history from localStorage:", error)
      }
    }
    loadHistory()
  }, [])

  useEffect(() => {
    const generatePreview = async () => {
      if (!inputText.trim()) {
        setQrCodeDataUrl("")
        return
      }

      try {
        const dataUrl = await QRCode.toDataURL(inputText, {
          width: qrSize[0],
          margin: qrMargin[0],
          errorCorrectionLevel: errorCorrectionLevel as any,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
        })
        setQrCodeDataUrl(dataUrl)
      } catch (error) {
        console.error("Preview generation error:", error)
      }
    }

    const debounceTimer = setTimeout(generatePreview, 300)
    return () => clearTimeout(debounceTimer)
  }, [inputText, qrSize, qrMargin, errorCorrectionLevel, foregroundColor, backgroundColor])

  const generateQRCode = async () => {
    if (!inputText.trim()) {
      toast("입력 오류", {
        description: "QR 코드로 변환할 텍스트나 URL을 입력해주세요.",
      })
      return
    }

    setIsGenerating(true)
    try {
      const dataUrl = await QRCode.toDataURL(inputText, {
        width: qrSize[0],
        margin: qrMargin[0],
        errorCorrectionLevel: errorCorrectionLevel as any,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
      })

      const newHistoryItem: CodeHistory = {
        id: Date.now().toString(),
        text: inputText,
        dataUrl,
        createdAt: new Date(),
        codeType: "qr",
        type: qrType as any,
        size: qrSize[0],
        margin: qrMargin[0],
        errorCorrectionLevel,
        foregroundColor,
        backgroundColor,
      }

      const newHistory = [newHistoryItem, ...history]
      setHistory(newHistory)
      saveHistoryToStorage(newHistory)

      toast("QR 코드 저장 완료", {
        description: "QR 코드가 히스토리에 저장되었습니다.",
      })
    } catch (error) {
      console.error("QR Code generation error:", error)
      toast("생성 오류", {
        description: "QR 코드 생성 중 오류가 발생했습니다.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const generateBarcodePreview = () => {
      if (!barcodeText.trim() || !barcodeCanvasRef.current) {
        setBarcodeDataUrl("")
        return
      }

      try {
        JsBarcode(barcodeCanvasRef.current, barcodeText, {
          format: barcodeFormat,
          width: barcodeWidth[0],
          height: barcodeHeight[0],
          margin: barcodeMargin[0],
          fontSize: barcodeFontSize[0],
          textPosition: barcodeTextPosition,
          textAlign: barcodeTextAlign,
          displayValue: true,
          background: barcodeBackground,
          lineColor: barcodeColor,
        })
        setBarcodeDataUrl(barcodeCanvasRef.current.toDataURL())
      } catch (error) {
        console.error("Barcode generation error:", error)
        setBarcodeDataUrl("")
      }
    }

    const debounceTimer = setTimeout(generateBarcodePreview, 300)
    return () => clearTimeout(debounceTimer)
  }, [
    barcodeText,
    barcodeFormat,
    barcodeWidth,
    barcodeHeight,
    barcodeMargin,
    barcodeFontSize,
    barcodeTextPosition,
    barcodeTextAlign,
    barcodeColor,
    barcodeBackground,
  ])

  const generateBarcode = () => {
    if (!barcodeText.trim()) {
      toast("입력 오류", {
        description: "바코드로 변환할 텍스트를 입력해주세요.",
      })
      return
    }

    if (!barcodeCanvasRef.current || !barcodeDataUrl) {
      toast("생성 오류", {
        description: "바코드 생성 중 오류가 발생했습니다.",
      })
      return
    }

    try {
      const newHistoryItem: CodeHistory = {
        id: Date.now().toString(),
        text: barcodeText,
        dataUrl: barcodeDataUrl,
        createdAt: new Date(),
        codeType: "barcode",
        type: barcodeFormat as any,
        width: barcodeWidth[0],
        height: barcodeHeight[0],
        margin: barcodeMargin[0],
        fontSize: barcodeFontSize[0],
        textPosition: barcodeTextPosition,
        textAlign: barcodeTextAlign,
        lineColor: barcodeColor,
        backgroundColor: barcodeBackground,
      }

      const newHistory = [newHistoryItem, ...history]
      setHistory(newHistory)
      saveHistoryToStorage(newHistory)

      toast("바코드 저장 완료", {
        description: "바코드가 히스토리에 저장되었습니다.",
      })
    } catch (error) {
      console.error("Barcode save error:", error)
      toast("저장 오류", {
        description: "바코드 저장 중 오류가 발생했습니다.",
      })
    }
  }

  const colorPresets = [
    { name: "에메랄드", fg: "#059669", bg: "#FFFFFF" },
    { name: "블루", fg: "#2563EB", bg: "#FFFFFF" },
    { name: "레드", fg: "#DC2626", bg: "#FFFFFF" },
    { name: "퍼플", fg: "#7C3AED", bg: "#FFFFFF" },
    { name: "다크", fg: "#000000", bg: "#FFFFFF" },
    { name: "화이트", fg: "#FFFFFF", bg: "#000000" },
  ]

  const downloadQRCode = (dataUrl: string, filename?: string) => {
    const link = document.createElement("a")
    link.download = filename || `qrcode-${Date.now()}.${fileFormat.toLowerCase()}`
    link.href = dataUrl
    link.click()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast("복사 완료", {
        description: "텍스트가 클립보드에 복사되었습니다.",
      })
    } catch (error) {
      toast("복사 실패", {
        description: "클립보드 복사 중 오류가 발생했습니다.",
      })
    }
  }

  const deleteFromHistory = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id)
    setHistory(newHistory)
    saveHistoryToStorage(newHistory)
    toast("삭제 완료", {
      description: "히스토리에서 삭제되었습니다.",
    })
  }

  const downloadAllCodes = () => {
    const filteredHistory = getFilteredHistory()
    if (filteredHistory.length === 0) {
      toast("다운로드 실패", {
        description: "다운로드할 항목이 없습니다.",
      })
      return
    }

    filteredHistory.forEach((item, index) => {
      setTimeout(() => {
        const filename = item.codeType === "qr" ? `qrcode-${item.id}.png` : `barcode-${item.id}.png`
        downloadQRCode(item.dataUrl, filename)
      }, index * 100)
    })

    toast("다운로드 시작", {
      description: `${filteredHistory.length}개의 항목 다운로드를 시작합니다.`,
    })
  }

  const downloadAllQRCodes = () => {
    if (history.length === 0) {
      toast("다운로드 실패", {
        description: "다운로드할 QR 코드가 없습니다.",
      })
      return
    }

    history.forEach((item, index) => {
      setTimeout(() => {
        downloadQRCode(item.dataUrl, `qrcode-${item.id}.png`)
      }, index * 100)
    })

    toast("다운로드 시작", {
      description: `${history.length}개의 QR 코드 다운로드를 시작합니다.`,
    })
  }

  const deleteAllHistory = () => {
    if (history.length === 0) {
      toast("삭제 실패", {
        description: "삭제할 히스토리가 없습니다.",
      })
      return
    }

    setHistory([])
    saveHistoryToStorage([])
    toast("전체 삭제 완료", {
      description: "모든 히스토리가 삭제되었습니다.",
    })
  }

  const getFilteredHistory = () => {
    let filtered = history

    if (historyFilter !== "all") {
      filtered = filtered.filter((item) => item.codeType === historyFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  const handleScanResult = (result: any) => {
    if (result && result.length > 0) {
      const scannedText = result[0].rawValue
      setScanResult(scannedText)
      setIsScanning(false)
      toast("스캔 완료", {
        description: "QR 코드가 성공적으로 스캔되었습니다.",
      })
    }
  }

  const handleScanError = (error: any) => {
    console.error("QR Scanner Error:", error)
    setScanError("카메라 접근 또는 스캔 중 오류가 발생했습니다.")
  }

  const startScanning = () => {
    setIsScanning(true)
    setScanResult("")
    setScanError("")
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  const copyScannedText = () => {
    if (scanResult) {
      copyToClipboard(scanResult)
    }
  }

  const [activeTab, setActiveTab] = useState("generate")
  const [qrText, setQrText] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-800 mb-2 font-sans">QR & 바코드 생성기</h1>
          <p className="text-emerald-600 font-serif">QR 코드와 바코드를 쉽게 생성하고 관리하세요</p>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR 코드 생성
            </TabsTrigger>
            <TabsTrigger value="barcode" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              바코드 생성
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              QR 스캔
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              생성 히스토리 ({history.length})
            </TabsTrigger>
          </TabsList>

          {/* Existing TabsContent for generate */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-sans">
                    <QrCode className="w-5 h-5 text-primary" />
                    데이터 입력
                  </CardTitle>
                  <CardDescription className="font-serif">QR 코드로 변환할 데이터를 입력하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-type" className="font-serif">
                      QR 코드 유형
                    </Label>
                    <Select value={qrType} onValueChange={setQrType}>
                      <SelectTrigger>
                        <SelectValue placeholder="유형을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">텍스트</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="email">이메일</SelectItem>
                        <SelectItem value="phone">전화번호</SelectItem>
                        <SelectItem value="wifi">Wi-Fi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qr-input" className="font-serif">
                      텍스트 내용
                    </Label>
                    <Textarea
                      id="qr-input"
                      placeholder={
                        qrType === "url"
                          ? "https://example.com"
                          : qrType === "email"
                            ? "example@email.com"
                            : qrType === "phone"
                              ? "+82-10-1234-5678"
                              : qrType === "wifi"
                                ? "WIFI:T:WPA;S:네트워크명;P:비밀번호;;"
                                : "원하는 텍스트를 입력하세요"
                      }
                      value={inputText || qrText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[120px] font-serif"
                    />
                  </div>

                  <Button
                    onClick={generateQRCode}
                    disabled={isGenerating || !inputText.trim()}
                    className="w-full font-sans"
                  >
                    {isGenerating ? "저장 중..." : "히스토리에 저장"}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-sans">
                      <Settings className="w-5 h-5 text-primary" />
                      커스터마이징 옵션
                    </CardTitle>
                    <CardDescription className="font-serif">QR 코드의 크기와 설정을 조정하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="font-serif">크기: {qrSize[0]}px</Label>
                      <Slider
                        value={qrSize}
                        onValueChange={setQrSize}
                        max={512}
                        min={128}
                        step={32}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="font-serif">여백: {qrMargin[0]}</Label>
                      <Slider
                        value={qrMargin}
                        onValueChange={setQrMargin}
                        max={8}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-serif">오류 정정 레벨</Label>
                      <Select value={errorCorrectionLevel} onValueChange={setErrorCorrectionLevel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">낮음 (L) - 7%</SelectItem>
                          <SelectItem value="M">중간 (M) - 15%</SelectItem>
                          <SelectItem value="Q">높음 (Q) - 25%</SelectItem>
                          <SelectItem value="H">최고 (H) - 30%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-serif">파일 형식</Label>
                      <Select value={fileFormat} onValueChange={setFileFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PNG">PNG</SelectItem>
                          <SelectItem value="JPG">JPG</SelectItem>
                          <SelectItem value="SVG">SVG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-sans">
                      <Palette className="w-5 h-5 text-primary" />
                      색상 설정
                    </CardTitle>
                    <CardDescription className="font-serif">QR 코드의 색상을 설정하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-serif">전경색 (QR 코드)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-serif">배경색</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder="#FFFFFF"
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-serif">색상 팔레트</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {colorPresets.map((preset) => (
                          <Button
                            key={preset.name}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setForegroundColor(preset.fg)
                              setBackgroundColor(preset.bg)
                            }}
                            className="h-8 text-xs font-serif"
                          >
                            <div className="w-3 h-3 rounded-full mr-1 border" style={{ backgroundColor: preset.fg }} />
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">미리보기</CardTitle>
                  <CardDescription className="font-serif">실시간으로 생성되는 QR 코드를 확인하세요</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex justify-center items-center min-h-[256px] bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl || "/placeholder.svg"}
                        alt="QR Code Preview"
                        className="border border-border rounded-lg"
                        style={{ width: qrSize[0], height: qrSize[0] }}
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <QrCode className="w-16 h-16 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground font-serif">
                          텍스트를 입력하면 QR 코드가 여기에 표시됩니다
                        </p>
                      </div>
                    )}
                  </div>

                  {qrCodeDataUrl && (
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => downloadQRCode(qrCodeDataUrl)}
                        className="flex items-center gap-2 font-sans"
                      >
                        <Download className="w-4 h-4" />
                        다운로드
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(inputText)}
                        className="flex items-center gap-2 font-sans"
                      >
                        <Copy className="w-4 h-4" />
                        텍스트 복사
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Existing TabsContent for barcode */}
          <TabsContent value="barcode" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-sans">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    바코드 데이터 입력
                  </CardTitle>
                  <CardDescription className="font-serif">바코드로 변환할 데이터를 입력하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode-format" className="font-serif">
                      바코드 형식
                    </Label>
                    <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="형식을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CODE128">CODE128</SelectItem>
                        <SelectItem value="CODE39">CODE39</SelectItem>
                        <SelectItem value="EAN13">EAN13</SelectItem>
                        <SelectItem value="EAN8">EAN8</SelectItem>
                        <SelectItem value="UPC">UPC</SelectItem>
                        <SelectItem value="ITF14">ITF14</SelectItem>
                        <SelectItem value="MSI">MSI</SelectItem>
                        <SelectItem value="pharmacode">Pharmacode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcode-input" className="font-serif">
                      바코드 내용
                    </Label>
                    <Input
                      id="barcode-input"
                      placeholder={
                        barcodeFormat === "EAN13"
                          ? "1234567890123 (13자리)"
                          : barcodeFormat === "EAN8"
                            ? "12345678 (8자리)"
                            : barcodeFormat === "UPC"
                              ? "123456789012 (12자리)"
                              : "바코드 내용을 입력하세요"
                      }
                      value={barcodeText}
                      onChange={(e) => setBarcodeText(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-sans">
                    <Settings className="w-5 h-5 text-primary" />
                    바코드 설정
                  </CardTitle>
                  <CardDescription className="font-serif">바코드의 크기와 모양을 세부적으로 조정하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Size Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground font-sans">크기 설정</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-serif text-xs">폭: {barcodeWidth[0]}px</Label>
                        <Slider
                          value={barcodeWidth}
                          onValueChange={setBarcodeWidth}
                          max={5}
                          min={1}
                          step={0.5}
                          className="w-full"
                        />
                        <Input
                          type="number"
                          value={barcodeWidth[0]}
                          onChange={(e) => setBarcodeWidth([Number.parseFloat(e.target.value) || 1])}
                          min={1}
                          max={5}
                          step={0.5}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-serif text-xs">높이: {barcodeHeight[0]}px</Label>
                        <Slider
                          value={barcodeHeight}
                          onValueChange={setBarcodeHeight}
                          max={200}
                          min={50}
                          step={10}
                          className="w-full"
                        />
                        <Input
                          type="number"
                          value={barcodeHeight[0]}
                          onChange={(e) => setBarcodeHeight([Number.parseInt(e.target.value) || 50])}
                          min={50}
                          max={200}
                          step={10}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-serif text-xs">여백: {barcodeMargin[0]}px</Label>
                        <Slider
                          value={barcodeMargin}
                          onValueChange={setBarcodeMargin}
                          max={50}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                        <Input
                          type="number"
                          value={barcodeMargin[0]}
                          onChange={(e) => setBarcodeMargin([Number.parseInt(e.target.value) || 0])}
                          min={0}
                          max={50}
                          step={5}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-serif text-xs">폰트 크기: {barcodeFontSize[0]}px</Label>
                        <Slider
                          value={barcodeFontSize}
                          onValueChange={setBarcodeFontSize}
                          max={24}
                          min={8}
                          step={2}
                          className="w-full"
                        />
                        <Input
                          type="number"
                          value={barcodeFontSize[0]}
                          onChange={(e) => setBarcodeFontSize([Number.parseInt(e.target.value) || 8])}
                          min={8}
                          max={24}
                          step={2}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground font-sans">텍스트 설정</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-serif text-xs">텍스트 위치</Label>
                        <Select value={barcodeTextPosition} onValueChange={setBarcodeTextPosition}>
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">상단</SelectItem>
                            <SelectItem value="bottom">하단</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-serif text-xs">정렬</Label>
                        <Select value={barcodeTextAlign} onValueChange={setBarcodeTextAlign}>
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">왼쪽</SelectItem>
                            <SelectItem value="center">가운데</SelectItem>
                            <SelectItem value="right">오른쪽</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Color Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground font-sans">색상 설정</h4>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="font-serif text-xs">바코드 색상</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={barcodeColor}
                            onChange={(e) => setBarcodeColor(e.target.value)}
                            className="w-12 h-8 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={barcodeColor}
                            onChange={(e) => setBarcodeColor(e.target.value)}
                            placeholder="#000000"
                            className="flex-1 font-mono text-xs"
                          />
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {["#000000", "#333333", "#666666", "#0066CC", "#CC0000"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setBarcodeColor(color)}
                              className="w-6 h-6 rounded border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-serif text-xs">배경색</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={barcodeBackground}
                            onChange={(e) => setBarcodeBackground(e.target.value)}
                            className="w-12 h-8 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={barcodeBackground}
                            onChange={(e) => setBarcodeBackground(e.target.value)}
                            placeholder="#FFFFFF"
                            className="flex-1 font-mono text-xs"
                          />
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {["#FFFFFF", "#F5F5F5", "#E5E5E5", "#FFE5E5", "#E5F5FF"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setBarcodeBackground(color)}
                              className="w-6 h-6 rounded border-2 border-gray-300 shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-sans">
                    <Eye className="w-5 h-5 text-primary" />
                    미리보기
                  </CardTitle>
                  <CardDescription className="font-serif">생성된 바코드를 확인하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center p-4 bg-white border-2 border-dashed border-gray-200 rounded-lg min-h-[200px] items-center">
                    {barcodeDataUrl ? (
                      <img
                        src={barcodeDataUrl || "/placeholder.svg"}
                        alt="Generated Barcode"
                        className="max-w-full h-auto"
                      />
                    ) : (
                      <div className="text-center text-gray-400 font-serif">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>텍스트를 입력하면 바코드가 표시됩니다</p>
                      </div>
                    )}
                  </div>
                  <canvas ref={barcodeCanvasRef} style={{ display: "none" }} />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => barcodeDataUrl && downloadQRCode(barcodeDataUrl, `barcode-${Date.now()}.png`)}
                      disabled={!barcodeDataUrl}
                      className="flex-1 font-sans"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      다운로드
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(barcodeText)}
                      disabled={!barcodeText}
                      className="flex-1 font-sans bg-transparent"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      텍스트 복사
                    </Button>
                    <Button
                      variant="outline"
                      onClick={generateBarcode}
                      disabled={!barcodeDataUrl}
                      className="flex-1 font-sans bg-transparent"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      히스토리 저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Existing TabsContent for scanner */}
          <TabsContent value="scan" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-sans">
                    <ScanLine className="w-5 h-5 text-primary" />
                    카메라 스캔
                  </CardTitle>
                  <CardDescription className="font-serif">카메라를 사용하여 QR 코드를 스캔하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    {!isScanning ? (
                      <Button onClick={startScanning} className="flex items-center gap-2 font-sans" size="lg">
                        <Camera className="w-5 h-5" />
                        스캔 시작
                      </Button>
                    ) : (
                      <Button
                        onClick={stopScanning}
                        variant="outline"
                        className="flex items-center gap-2 font-sans bg-transparent"
                        size="lg"
                      >
                        스캔 중지
                      </Button>
                    )}
                  </div>

                  {isScanning && (
                    <div className="relative w-full max-w-md mx-auto">
                      <div className="aspect-square bg-black rounded-lg overflow-hidden">
                        <Scanner
                          onScan={handleScanResult}
                          onError={handleScanError}
                          constraints={{
                          }}
                          formats={["qr_code", "code_128", "code_39", "ean_13", "ean_8"]}
                          components={{
                            finder: true,
                          }}
                          styles={{
                            container: { width: "100%", height: "100%" },
                            video: { width: "100%", height: "100%", objectFit: "cover" },
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-4 border-2 border-primary rounded-lg">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {scanError && (
                    <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-destructive font-serif text-sm">{scanError}</p>
                      <p className="text-muted-foreground font-serif text-xs mt-2">
                        카메라 권한을 허용하고 HTTPS 환경에서 사용해주세요.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-sans">
                    <QrCode className="w-5 h-5 text-primary" />
                    스캔 결과
                  </CardTitle>
                  <CardDescription className="font-serif">스캔된 QR 코드의 내용이 여기에 표시됩니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scanResult ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="font-mono text-sm break-all">{scanResult}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => navigator.clipboard.writeText(scanResult)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 font-sans"
                        >
                          <Copy className="w-4 h-4" />
                          복사
                        </Button>
                        {scanResult.startsWith("http") && (
                          <Button
                            onClick={() => window.open(scanResult, "_blank")}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 font-sans"
                          >
                            <ExternalLink className="w-4 h-4" />
                            링크 열기
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setActiveTab("generate")
                            setQrText(scanResult)
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 font-sans"
                        >
                          <QrCode className="w-4 h-4" />
                          QR 생성
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ScanLine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground font-serif">
                        {isScanning ? "QR 코드를 카메라에 비춰주세요..." : "스캔 버튼을 눌러 시작하세요"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="font-sans">생성 히스토리</CardTitle>
                    <CardDescription className="font-serif">
                      이전에 생성한 QR 코드와 바코드들을 확인하고 관리하세요
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={downloadAllCodes}
                      disabled={getFilteredHistory().length === 0}
                      className="flex items-center gap-2 font-sans bg-transparent"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      전체 다운로드
                    </Button>
                    <Button
                      variant="outline"
                      onClick={deleteAllHistory}
                      disabled={history.length === 0}
                      className="flex items-center gap-2 text-destructive hover:text-destructive font-sans bg-transparent"
                    >
                      <Trash className="w-4 h-4" />
                      전체 삭제
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      placeholder="히스토리 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="font-serif flex-1"
                    />
                    <Select value={historyFilter} onValueChange={setHistoryFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] font-serif">
                        <SelectValue placeholder="필터 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="qr">QR 코드</SelectItem>
                        <SelectItem value="barcode">바코드</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {getFilteredHistory().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground font-serif">
                      {historyFilter === "all"
                        ? "아직 생성된 코드가 없습니다."
                        : historyFilter === "qr"
                          ? "생성된 QR 코드가 없습니다."
                          : "생성된 바코드가 없습니다."}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {getFilteredHistory().map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="flex-shrink-0">
                              <img
                                src={item.dataUrl || "/placeholder.svg"}
                                alt={item.codeType === "qr" ? "QR Code" : "Barcode"}
                                className="w-16 h-16 border border-border rounded"
                              />
                              <p className="text-xs text-muted-foreground text-center mt-1 font-mono">
                                {item.codeType === "qr" ? `${item.size}px` : `${item.width}x${item.height}`}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant={item.codeType === "qr" ? "default" : "secondary"}>
                                  {item.codeType === "qr" ? "QR 코드" : "바코드"}
                                </Badge>
                                <Badge variant="outline">
                                  {item.codeType === "qr"
                                    ? item.type === "url"
                                      ? "URL"
                                      : item.type === "email"
                                        ? "이메일"
                                        : item.type === "phone"
                                          ? "전화번호"
                                          : item.type === "wifi"
                                            ? "Wi-Fi"
                                            : "텍스트"
                                    : item.type}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{
                                      backgroundColor: item.codeType === "qr" ? item.foregroundColor : item.lineColor,
                                    }}
                                    title={item.codeType === "qr" ? "전경색" : "바코드 색상"}
                                  />
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.backgroundColor }}
                                    title="배경색"
                                  />
                                </div>
                              </div>
                              <p className="text-sm font-medium mb-1 font-sans truncate">{item.text}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {item.createdAt.toLocaleString("ko-KR")}
                              </p>
                              <div className="text-xs text-muted-foreground mt-2 font-mono">
                                {item.codeType === "qr" ? (
                                  <>
                                    크기: {item.size}px | 여백: {item.margin} | 오류정정: {item.errorCorrectionLevel}
                                  </>
                                ) : (
                                  <>
                                    폭: {item.width} | 높이: {item.height} | 여백: {item.margin} | 폰트: {item.fontSize}
                                    px
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadQRCode(item.dataUrl, `${item.codeType}-${item.id}.png`)}
                                className="font-sans bg-transparent"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(item.text)}
                                className="font-sans bg-transparent"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteFromHistory(item.id)}
                                className="text-destructive hover:text-destructive font-sans bg-transparent"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
