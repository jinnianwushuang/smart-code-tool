import Dexie from 'dexie'

const db = new Dexie('AntdvCalendarDB')
db.version(1).stores({ notes: 'date' })

/** 加载全部备注 */
export const loadAllNotes = async () => {
  return db.notes.toArray()
}

/** 获取指定日期的备注 */
export const getNote = async (dateStr) => {
  return db.notes.get(dateStr)
}

/** 保存或更新备注 */
export const putNote = async (dateStr, content) => {
  return db.notes.put({ date: dateStr, content })
}

/** 删除指定日期的备注 */
export const deleteNote = async (dateStr) => {
  return db.notes.delete(dateStr)
}

/** 批量删除备注 */
export const deleteNotes = async (dateStrs) => {
  for (const d of dateStrs) await db.notes.delete(d)
}

/** 清空全部备注 */
export const clearAllNotes = async () => {
  return db.notes.clear()
}

/** 批量导入备注 */
export const bulkPutNotes = async (data) => {
  return db.notes.bulkPut(data)
}
