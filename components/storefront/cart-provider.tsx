"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

export type CartMode = "retail" | "perKg" | "wholesale"

export type CartLine = {
  key: string
  productId: number
  name: string
  image: string | null
  mode: CartMode
  unit: string
  unitPrice: number
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  count: number
  total: number
  open: boolean
  setOpen: (v: boolean) => void
  addLine: (line: Omit<CartLine, "key">) => void
  updateQuantity: (key: string, quantity: number) => void
  removeLine: (key: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [open, setOpen] = useState(false)

  const addLine = useCallback((line: Omit<CartLine, "key">) => {
    const key = `${line.productId}-${line.mode}`
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key)
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, quantity: Math.round((l.quantity + line.quantity) * 100) / 100 } : l,
        )
      }
      return [...prev, { ...line, key }]
    })
    setOpen(true)
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0),
    )
  }, [])

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((s, l) => s + 1, 0)
    const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
    return { lines, count, total, open, setOpen, addLine, updateQuantity, removeLine, clear }
  }, [lines, open, addLine, updateQuantity, removeLine, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
