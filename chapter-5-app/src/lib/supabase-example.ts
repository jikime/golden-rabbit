import { supabase } from './supabase-client';

/**
 * Example function to fetch data from a Supabase table
 * @param tableName The name of the table to fetch data from
 * @param limit Maximum number of rows to fetch
 * @returns The fetched data or an error
 */
export async function fetchDataFromTable(tableName: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return { data: null, error };
  }
}

/**
 * Example function to insert data into a Supabase table
 * @param tableName The name of the table to insert data into
 * @param data The data to insert
 * @returns The inserted data or an error
 */
export async function insertDataIntoTable(tableName: string, data: unknown) {
  try {
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    
    if (error) {
      throw error;
    }
    
    return { data: insertedData, error: null };
  } catch (error) {
    console.error('Error inserting data into Supabase:', error);
    return { data: null, error };
  }
}

/**
 * Example function to update data in a Supabase table
 * @param tableName The name of the table to update data in
 * @param id The ID of the row to update
 * @param data The data to update
 * @returns The updated data or an error
 */
export async function updateDataInTable(tableName: string, id: number, data: unknown) {
  try {
    const { data: updatedData, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) {
      throw error;
    }
    
    return { data: updatedData, error: null };
  } catch (error) {
    console.error('Error updating data in Supabase:', error);
    return { data: null, error };
  }
}

/**
 * Example function to delete data from a Supabase table
 * @param tableName The name of the table to delete data from
 * @param id The ID of the row to delete
 * @returns Success status or an error
 */
export async function deleteDataFromTable(tableName: string, id: number) {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting data from Supabase:', error);
    return { success: false, error };
  }
}

/**
 * Example usage:
 * 
 * // Fetch users from a 'users' table
 * const { data: users, error } = await fetchDataFromTable('users', 5);
 * 
 * // Insert a new user
 * const newUser = { name: 'John Doe', email: 'john@example.com' };
 * const { data: insertedUser } = await insertDataIntoTable('users', newUser);
 * 
 * // Update a user
 * const updatedData = { name: 'Jane Doe' };
 * const { data: updatedUser } = await updateDataInTable('users', 1, updatedData);
 * 
 * // Delete a user
 * const { success } = await deleteDataFromTable('users', 1);
 */ 