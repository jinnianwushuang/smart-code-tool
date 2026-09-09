export const smartParse = (val) => {
  if (!val || !val.trim()) return []
  try {
    const res = JSON.parse(val)
    return Array.isArray(res) ? res : [res]
  } catch (e) {
    try {
      const res = new Function(`return ${val}`)()
      return Array.isArray(res) ? res : [res]
    } catch (err) {
      return []
    }
  }
}

export const repairType = (val) => {
  if (typeof val !== 'string') return val
  const s = val.trim()
  if (s !== '' && !isNaN(Number(s))) return Number(s)
  if (s.toLowerCase() === 'true') return true
  if (s.toLowerCase() === 'false') return false
  if (s.toLowerCase() === 'null') return null
  if (s.toLowerCase() === 'undefined') return undefined
  return val
}
