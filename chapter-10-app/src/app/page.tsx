"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, ChevronUp, RotateCcw, Volume2, Copy, X, Search, Check, Mic } from "lucide-react"
import { useState } from "react"

const languages = [
  "언어 감지",
  "그리스어",
  "네덜란드어",
  "노르웨이어(보크몰)",
  "덴마크어",
  "독일어",
  "라트비아어",
  "러시아어",
  "루마니아어",
  "리투아니아어",
  "베트남어",
  "불가리아어",
  "스웨덴어",
  "스페인어",
  "슬로바키아어",
  "슬로베니아어",
  "아랍어",
  "에스토니아어",
  "영어",
  "우크라이나어",
  "이탈리아어",
  "인도네시아어",
  "일본어",
  "중국어",
  "체코어",
  "터키어",
  "포르투갈어",
  "폴란드어",
  "프랑스어",
  "핀란드어",
  "한국어",
  "헝가리어",
  "히브리어",
]

export default function TranslationPage() {
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false)
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false)
  const [sourceLanguage, setSourceLanguage] = useState("영어 (감지됨)")
  const [targetLanguage, setTargetLanguage] = useState("한국어")
  const [searchTerm, setSearchTerm] = useState("")
  const [sourceVoicePlaying, setSourceVoicePlaying] = useState(false)
  const [targetVoicePlaying, setTargetVoicePlaying] = useState(false)
  const [micRecording, setMicRecording] = useState(false)
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [alternativeTranslations, setAlternativeTranslations] = useState([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [selectedWord, setSelectedWord] = useState("")
  const [selectedWordIndex, setSelectedWordIndex] = useState(-1)
  const [wordAlternatives, setWordAlternatives] = useState([])
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const filteredLanguages = languages.filter((lang) => lang.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleLanguageSwap = () => {
    const tempSource = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(tempSource)
  }

  const handleSourceVoiceClick = () => {
    if (!inputText.trim()) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    setSourceVoicePlaying(true)

    const utterance = new SpeechSynthesisUtterance(inputText)

    // Set language based on source language
    utterance.lang =
      sourceLanguage === "영어 (감지됨)" || sourceLanguage === "영어"
        ? "en-US"
        : sourceLanguage === "한국어"
          ? "ko-KR"
          : sourceLanguage === "일본어"
            ? "ja-JP"
            : sourceLanguage === "중국어"
              ? "zh-CN"
              : sourceLanguage === "스페인어"
                ? "es-ES"
                : sourceLanguage === "프랑스어"
                  ? "fr-FR"
                  : sourceLanguage === "독일어"
                    ? "de-DE"
                    : sourceLanguage === "이탈리아어"
                      ? "it-IT"
                      : sourceLanguage === "러시아어"
                        ? "ru-RU"
                        : "en-US" // default to English

    utterance.onend = () => {
      setSourceVoicePlaying(false)
    }

    utterance.onerror = () => {
      setSourceVoicePlaying(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const handleTargetVoiceClick = () => {
    if (!translatedText.trim()) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    setTargetVoicePlaying(true)

    const utterance = new SpeechSynthesisUtterance(translatedText)

    // Set language based on target language
    utterance.lang =
      targetLanguage === "한국어"
        ? "ko-KR"
        : targetLanguage === "영어"
          ? "en-US"
          : targetLanguage === "일본어"
            ? "ja-JP"
            : targetLanguage === "중국어"
              ? "zh-CN"
              : targetLanguage === "스페인어"
                ? "es-ES"
                : targetLanguage === "프랑스어"
                  ? "fr-FR"
                  : targetLanguage === "독일어"
                    ? "de-DE"
                    : targetLanguage === "이탈리아어"
                      ? "it-IT"
                      : targetLanguage === "러시아어"
                        ? "ru-RU"
                        : "ko-KR" // default to Korean

    utterance.onend = () => {
      setTargetVoicePlaying(false)
    }

    utterance.onerror = () => {
      setTargetVoicePlaying(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("음성 인식이 지원되지 않는 브라우저입니다.")
      return
    }

    if (isListening) {
      // Stop listening
      if (recognition) {
        recognition.stop()
      }
      return
    }

    // Start listening
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const newRecognition = new SpeechRecognition()

    newRecognition.continuous = true
    newRecognition.interimResults = true
    newRecognition.lang =
      sourceLanguage === "영어 (감지됨)"
        ? "en-US"
        : sourceLanguage === "한국어"
          ? "ko-KR"
          : sourceLanguage === "일본어"
            ? "ja-JP"
            : sourceLanguage === "중국어"
              ? "zh-CN"
              : sourceLanguage === "스페인어"
                ? "es-ES"
                : sourceLanguage === "프랑스어"
                  ? "fr-FR"
                  : sourceLanguage === "독일어"
                    ? "de-DE"
                    : sourceLanguage === "이탈리아어"
                      ? "it-IT"
                      : sourceLanguage === "러시아어"
                        ? "ru-RU"
                        : "en-US" // default to English

    newRecognition.onstart = () => {
      console.log("[v0] Speech recognition started")
      setIsListening(true)
      setMicRecording(true)
    }

    newRecognition.onresult = (event) => {
      console.log("[v0] Speech recognition result received")
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Update input text with final results, append interim results
      if (finalTranscript) {
        setInputText((prev) => prev + finalTranscript)
      }

      // Show interim results in real-time (optional visual feedback)
      if (interimTranscript && !finalTranscript) {
        // You could show interim results in a different way if needed
        console.log("[v0] Interim transcript:", interimTranscript)
      }
    }

    newRecognition.onerror = (event) => {
      console.error("[v0] Speech recognition error:", event.error)
      setIsListening(false)
      setMicRecording(false)

      if (event.error === "not-allowed") {
        alert("마이크 사용 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.")
      } else if (event.error === "no-speech") {
        alert("음성이 감지되지 않았습니다. 다시 시도해주세요.")
      } else {
        alert("음성 인식 중 오류가 발생했습니다: " + event.error)
      }
    }

    newRecognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      setIsListening(false)
      setMicRecording(false)
    }

    setRecognition(newRecognition)
    newRecognition.start()
  }

  const handleClearInput = () => {
    setInputText("")
    setTranslatedText("")
    setAlternativeTranslations([])
    setSelectedWord("")
    setSelectedWordIndex(-1)
    setWordAlternatives([])
    setIsCopied(false) // Reset copy feedback
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    setTranslatedText("진행 중...")
    setAlternativeTranslations([])
    setSelectedWord("")
    setSelectedWordIndex(-1)
    setWordAlternatives([])
    setPopoverOpen(false)
    setIsCopied(false) // Reset copy feedback

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          sourceLang: sourceLanguage.replace(" (감지됨)", ""),
          targetLang: targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("번역 요청 실패")
      }

      const data = await response.json()
      setTranslatedText(data.mainTranslation)
      setAlternativeTranslations(data.alternatives || [])
    } catch (error) {
      console.error("Translation error:", error)
      setTranslatedText("번역 중 오류가 발생했습니다.")
      setAlternativeTranslations([])
    } finally {
      setIsTranslating(false)
    }
  }

  const handleWordClick = async (word: string, index: number) => {
    if (!translatedText || word.length < 2) return

    setSelectedWord(word)
    setSelectedWordIndex(index)
    setPopoverOpen(true)
    setIsLoadingAlternatives(true)
    setWordAlternatives([])

    try {
      const response = await fetch("/api/alternatives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sentence: translatedText,
          word: word,
          targetLang: targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("대안 단어 요청 실패")
      }

      const data = await response.json()
      setWordAlternatives(data.alternatives || [])
    } catch (error) {
      console.error("Alternatives error:", error)
      setWordAlternatives([])
    } finally {
      setIsLoadingAlternatives(false)
    }
  }

  const handleWordReplace = (newWord: string) => {
    const words = translatedText.split(/(\s+|[.,!?;:])/g)
    words[selectedWordIndex] = newWord
    setTranslatedText(words.join(""))
    setPopoverOpen(false)
    setSelectedWord("")
    setSelectedWordIndex(-1)
  }

  const handleAlternativeSelect = (alternative: string) => {
    setTranslatedText(alternative)
  }

  const renderClickableText = (text: string) => {
    if (!text) return null

    const words = text.split(/(\s+|[.,!?;:])/g)
    return words.map((word, index) => {
      const isWord = /^[가-힣a-zA-Z]+$/.test(word)
      if (!isWord) {
        return <span key={index}>{word}</span>
      }

      return (
        <Popover key={index} open={popoverOpen && selectedWordIndex === index} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <span
              className={`cursor-pointer hover:bg-blue-100 px-1 py-0.5 rounded transition-colors ${
                selectedWordIndex === index ? "bg-blue-200" : ""
              }`}
              onClick={() => handleWordClick(word, index)}
            >
              {word}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">대안</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setPopoverOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {isLoadingAlternatives ? (
                <div className="px-4 py-3 text-sm text-gray-500">로딩 중...</div>
              ) : wordAlternatives.length > 0 ? (
                wordAlternatives.map((alternative, altIndex) => (
                  <button
                    key={altIndex}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                    onClick={() => handleWordReplace(alternative)}
                  >
                    {alternative} ...
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">대안을 찾을 수 없습니다</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )
    })
  }

  const LanguageDropdown = ({
    isOpen,
    onToggle,
    selectedLanguage,
    onSelect,
    title,
  }: {
    isOpen: boolean
    onToggle: () => void
    selectedLanguage: string
    onSelect: (lang: string) => void
    title: string
  }) => (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <span>{selectedLanguage}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[600px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">번역</span>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <span>{title}</span>
              <ChevronUp className="w-4 h-4" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="언어 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Language Grid */}
          <div className="p-4 max-h-80 overflow-y-auto">
            <div className="grid grid-cols-3 gap-1">
              {filteredLanguages.map((language, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(language === "언어 감지" ? "영어 (감지됨)" : language)
                    onToggle()
                    setSearchTerm("")
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 rounded"
                >
                  {(language === "언어 감지" && selectedLanguage === "영어 (감지됨)") ||
                  language === selectedLanguage ? (
                    <Check className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span
                    className={
                      (language === "언어 감지" && selectedLanguage === "영어 (감지됨)") ||
                      language === selectedLanguage
                        ? "text-blue-600"
                        : "text-gray-700"
                    }
                  >
                    {language}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const handleCopyTranslation = async () => {
    if (!translatedText.trim()) return

    try {
      await navigator.clipboard.writeText(translatedText)
      setIsCopied(true)

      // Reset after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Copy failed:", error)
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea")
        textArea.value = translatedText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)

        setIsCopied(true)
        setTimeout(() => {
          setIsCopied(false)
        }, 2000)
      } catch (fallbackError) {
        alert("복사에 실패했습니다. 브라우저가 지원하지 않는 기능입니다.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="flex items-center justify-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-6">
          <LanguageDropdown
            isOpen={sourceDropdownOpen}
            onToggle={() => setSourceDropdownOpen(!sourceDropdownOpen)}
            selectedLanguage={sourceLanguage}
            onSelect={setSourceLanguage}
            title="출발 언어 선택"
          />

          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full" onClick={handleLanguageSwap}>
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </Button>

          <LanguageDropdown
            isOpen={targetDropdownOpen}
            onToggle={() => setTargetDropdownOpen(!targetDropdownOpen)}
            selectedLanguage={targetLanguage}
            onSelect={setTargetLanguage}
            title="도착 언어 선택"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        .voice-active {
          animation: wave 1.5s ease-in-out infinite;
        }
        
        .voice-waves::before,
        .voice-waves::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid #3b82f6;
          border-radius: 50%;
          opacity: 0;
        }
        
        .voice-waves::before {
          width: 40px;
          height: 40px;
          animation: wave-ring 1.5s ease-out infinite;
        }
        
        .voice-waves::after {
          width: 60px;
          height: 60px;
          animation: wave-ring 1.5s ease-out infinite 0.3s;
        }
        
        .mic-waves::before,
        .mic-waves::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid #ef4444;
          border-radius: 50%;
          opacity: 0;
        }
        
        .mic-waves::before {
          width: 40px;
          height: 40px;
          animation: wave-ring 1.5s ease-out infinite;
        }
        
        .mic-waves::after {
          width: 60px;
          height: 60px;
          animation: wave-ring 1.5s ease-out infinite 0.3s;
        }
        
        @keyframes wave-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
      `}</style>

      <div
        className="flex h-[calc(100vh-73px)]"
        onClick={() => {
          setSourceDropdownOpen(false)
          setTargetDropdownOpen(false)
        }}
      >
        {/* Left Panel - Source Text */}
        <div className="flex-1 border-r border-gray-200">
          <div className="p-6 h-full flex flex-col">
            <div className="flex-1">
              <div className="relative h-full">
                {inputText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 p-1 h-6 w-6 z-10 hover:bg-gray-100"
                    onClick={handleClearInput}
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </Button>
                )}
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="번역할 내용을 입력하세요"
                  className="w-full h-full resize-none border-none outline-none text-lg text-gray-800 leading-relaxed pr-10 pt-2 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                size="sm"
                className={`relative p-2 transition-colors duration-200 ${sourceVoicePlaying ? "voice-waves" : ""}`}
                onClick={handleSourceVoiceClick}
              >
                <Volume2
                  className={`w-5 h-5 transition-colors duration-200 ${
                    sourceVoicePlaying ? "text-blue-600 voice-active" : "text-gray-600 hover:text-blue-600"
                  }`}
                />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative p-2 transition-colors duration-200 ${micRecording ? "mic-waves" : ""}`}
                  onClick={handleMicClick}
                >
                  <Mic
                    className={`w-5 h-5 transition-colors duration-200 ${
                      micRecording ? "text-red-600 voice-active" : "text-gray-600 hover:text-red-600"
                    }`}
                  />
                </Button>

                <Button
                  onClick={handleTranslate}
                  disabled={!inputText.trim() || isTranslating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isTranslating ? "진행 중..." : "번역하기"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Translation */}
        <div className="flex-1">
          <div className="p-6 h-full flex flex-col">
            {/* Main Translation Result - 30% height */}
            <div className="h-[30%] mb-4">
              <div className="w-full h-full bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-sm text-gray-500 mb-2">메인 번역 결과</div>
                <div className="h-full flex items-start">
                  <div className="text-lg text-gray-800 leading-relaxed">
                    {translatedText
                      ? renderClickableText(translatedText)
                      : inputText
                        ? "번역하기 버튼을 눌러주세요"
                        : "번역 결과가 여기에 표시됩니다"}
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative List - 70% height */}
            <div className="h-[70%] flex-1">
              <div className="w-full h-full bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-sm text-gray-500 mb-3">대안:</div>
                <div className="h-full overflow-y-auto">
                  {alternativeTranslations.length > 0 ? (
                    <div className="space-y-1">
                      {alternativeTranslations.map((alt, index) => (
                        <button
                          key={index}
                          onClick={() => handleAlternativeSelect(alt)}
                          className="w-full p-3 text-left bg-white rounded border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors duration-150 cursor-pointer group"
                        >
                          <p className="text-base text-gray-800 group-hover:text-gray-900">{alt}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">대안 번역이 여기에 표시됩니다</div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                size="sm"
                className={`relative p-2 transition-colors duration-200 ${targetVoicePlaying ? "voice-waves" : ""}`}
                onClick={handleTargetVoiceClick}
              >
                <Volume2
                  className={`w-5 h-5 transition-colors duration-200 ${
                    targetVoicePlaying ? "text-blue-600 voice-active" : "text-gray-600 hover:text-blue-600"
                  }`}
                />
              </Button>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={handleCopyTranslation}
                    disabled={!translatedText.trim()}
                  >
                    {isCopied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                    )}
                  </Button>

                  {/* Tooltip */}
                  {isCopied && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                      번역 복사됨
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
