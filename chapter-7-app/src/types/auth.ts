import { User } from "next-auth"
import { JWT } from "next-auth/jwt"

export type ExtendedUser = User & {
  id: string
  name: string
  email: string
  provider: string
}

export type ExtendedJWT = JWT & {
  id: string
  provider: string
} 