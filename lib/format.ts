export function formatKES(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number.parseFloat(value) : value ?? 0
  if (!Number.isFinite(n as number)) return "KSh 0"
  return `KSh ${Math.round(n as number).toLocaleString("en-KE")}`
}

export function generateOrderCode() {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = (now.getMonth() + 1).toString().padStart(2, "0")
  const d = now.getDate().toString().padStart(2, "0")
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `EB-${y}${m}${d}-${rand}`
}
