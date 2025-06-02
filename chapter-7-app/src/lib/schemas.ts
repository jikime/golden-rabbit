import { z } from "zod";

/**
 * 회원가입 폼 검증 스키마
 * - 이메일: 유효한 이메일 형식, 필수 입력
 * - 비밀번호: 최소 6자 이상, 필수 입력
 * - 비밀번호 확인: 비밀번호와 일치해야 함
 */
export const signupSchema = z
  .object({
    name: z.string().min(1, "이름을 입력해주세요"),
    email: z.string().email("유효한 이메일 주소를 입력해주세요").min(1, "이메일을 입력해주세요"),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호를 다시 입력해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

/**
 * 로그인 폼 검증 스키마
 * - 이메일: 유효한 이메일 형식, 필수 입력
 * - 비밀번호: 필수 입력
 */
export const loginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요").min(1, "이메일을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

// 회원가입 폼 타입 정의
export type SignupFormValues = z.infer<typeof signupSchema>;

// 로그인 폼 타입 정의
export type LoginFormValues = z.infer<typeof loginSchema>; 