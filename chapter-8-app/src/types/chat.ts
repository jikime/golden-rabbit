// 메시지 타입 정의 (UI 표시용)
export type UIMessage = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  isError?: boolean;
}; 