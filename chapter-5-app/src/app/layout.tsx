import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { StagewiseToolbar } from "@stagewise/toolbar-next"
import { ReactPlugin } from "@stagewise-plugins/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI 채팅 앱",
  description: "Next.js와 shadcn/ui로 만든 AI 채팅 애플리케이션",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <StagewiseToolbar 
            config={{
              plugins: [ReactPlugin]
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
