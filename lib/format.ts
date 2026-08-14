export function formatKES(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number.parseFloat(value) : value ?? 0
  if (!Number.isFinite(n as number)) return "KSh 0"
  return `KSh ${Math.round(n as number).toLocaleString("en-KE")}`
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready for pickup",
    completed: "Completed",
    cancelled: "Cancelled",
  }
  return map[status] ?? status
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—"
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function generateOrderCode() {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = (now.getMonth() + 1).toString().padStart(2, "0")
  const d = now.getDate().toString().padStart(2, "0")
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `EB-${y}${m}${d}-${rand}`
}
