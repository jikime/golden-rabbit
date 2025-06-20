import { supabase } from '@/lib/supabase-client'

// 범용 데이터 타입 정의
export type TableRow = Record<string, unknown>

// 데이터베이스에서 데이터 조회 예제
export async function fetchData<T = TableRow>(tableName: string) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
  
  if (error) {
    console.error('데이터 조회 중 오류 발생:', error)
    throw error
  }
  
  return data as T[]
}

// 데이터베이스에 데이터 추가 예제
export async function insertData<T = TableRow, U = TableRow>(
  tableName: string, 
  newData: U
) {
  const { data, error } = await supabase
    .from(tableName)
    .insert(newData)
    .select()
  
  if (error) {
    console.error('데이터 추가 중 오류 발생:', error)
    throw error
  }
  
  return data as T[]
}

// 데이터베이스 데이터 업데이트 예제
export async function updateData<T = TableRow, U = TableRow>(
  tableName: string, 
  id: string, 
  updateData: U
) {
  const { data, error } = await supabase
    .from(tableName)
    .update(updateData)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('데이터 업데이트 중 오류 발생:', error)
    throw error
  }
  
  return data as T[]
}

// 데이터베이스 데이터 삭제 예제
export async function deleteData(tableName: string, id: string) {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('데이터 삭제 중 오류 발생:', error)
    throw error
  }
  
  return true
} 