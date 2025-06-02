"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <Toaster position="top-center" />
      {children}
    </SessionProvider>
  )
} 