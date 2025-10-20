import { z } from "zod"

/**
 * 로그인 폼 유효성 검사 스키마
 */
export const loginSchema = z.object({
  email: z
    .email({ message: "유효한 이메일 주소를 입력해주세요." })
    .min(1, { message: "이메일을 입력해주세요." }),
  password: z
    .string()
    .min(1, { message: "비밀번호를 입력해주세요." }),
})

/**
 * 회원가입 폼 유효성 검사 스키마
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "이름은 최소 2자 이상이어야 합니다." })
      .max(50, { message: "이름은 최대 50자까지 가능합니다." }),
    email: z
      .string()
      .min(1, { message: "이메일을 입력해주세요." })
      .email({ message: "유효한 이메일 주소를 입력해주세요." }),
    password: z
      .string()
      .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." })
      .max(100, { message: "비밀번호는 최대 100자까지 가능합니다." }),
    confirmPassword: z
      .string()
      .min(1, { message: "비밀번호 확인을 입력해주세요." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

/**
 * 회원가입 폼 유효성 검사 스키마 (별도 요청)
 */
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "이름을 입력해주세요." })
      .max(50, { message: "이름은 최대 50자까지 가능합니다." }),
    email: z
      .email({ message: "올바른 이메일 형식이 아닙니다." })
      .min(1, { message: "이메일은 필수 입력 항목입니다." }),
    password: z
      .string()
      .min(6, { message: "비밀번호는 최소 6글자 이상이어야 합니다." }),
    confirmPassword: z
      .string()
      .min(1, { message: "비밀번호 확인을 입력해주세요." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

/**
 * 프로필 업데이트 폼 유효성 검사 스키마
 */
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "이름은 최소 2자 이상이어야 합니다." })
    .max(50, { message: "이름은 최대 50자까지 가능합니다." }),
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요." })
    .email({ message: "유효한 이메일 주소를 입력해주세요." }),
})

/**
 * 비밀번호 변경 폼 유효성 검사 스키마
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "현재 비밀번호를 입력해주세요." }),
    newPassword: z
      .string()
      .min(6, { message: "새 비밀번호는 최소 6자 이상이어야 합니다." })
      .max(100, { message: "새 비밀번호는 최대 100자까지 가능합니다." }),
    confirmNewPassword: z
      .string()
      .min(1, { message: "새 비밀번호 확인을 입력해주세요." }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "새 비밀번호가 일치하지 않습니다.",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
    path: ["newPassword"],
  })

// 타입 추출
export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema> 