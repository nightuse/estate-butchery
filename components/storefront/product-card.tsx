"use client"

import Image from "next/image"
import { useState } from "react"
import { Minus, Plus, ShoppingBasket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatKES } from "@/lib/format"
import { useCart, type CartMode } from "./cart-provider"
import type { Product } from "@/lib/queries"

export function ProductCard({ product }: { product: Product }) {
  const { addLine } = useCart()
  const hasKg = !!product.pricePerKg
  const hasWholesale = !!product.wholesalePricePerKg
  const hasRetail = !!product.retailPrice && !hasKg
  const isPerKg = hasKg

  const [mode, setMode] = useState<CartMode>(hasKg ? "perKg" : "retail")
  const step = isPerKg ? 0.5 : 1
  const [qty, setQty] = useState(isPerKg ? 1 : 1)

  const unitPrice =
    mode === "wholesale" && product.wholesalePricePerKg
      ? Number(product.wholesalePricePerKg)
      : mode === "retail" && product.retailPrice
        ? Number(product.retailPrice)
        : Number(product.pricePerKg ?? product.retailPrice ?? 0)

  const unitLabel =
    mode === "wholesale" ? "kg (wholesale)" : isPerKg ? "kg" : product.retailUnit ?? "each"

  function changeQty(delta: number) {
    setQty((q) => {
      const next = Math.round((q + delta) * 100) / 100
      return next < step ? step : next
    })
  }

  function handleAdd() {
    addLine({
      productId: product.id,
      name: product.name,
      image: product.image,
      mode,
      unit: unitLabel,
      unitPrice,
      quantity: qty,
    })
  }

  return (
    <Card
      className={cn(
        "group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md",
        !product.isAvailable && "opacity-70",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ShoppingBasket className="h-10 w-10" />
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Badge variant="secondary" className="text-sm">
              Out of stock
            </Badge>
          </div>
        )}
        {hasWholesale && product.isAvailable && (
          <Badge className="absolute left-2 top-2 bg-accent text-accent-foreground">
            Wholesale available
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-wide">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold text-primary">
              {formatKES(unitPrice)}
            </span>
            <span className="text-sm text-muted-foreground">/ {unitLabel}</span>
          </div>
          {hasWholesale && mode !== "wholesale" && (
            <p className="text-xs text-muted-foreground">
              Wholesale: {formatKES(product.wholesalePricePerKg)} / kg
            </p>
          )}
        </div>

        {product.isAvailable && (
          <>
            {hasWholesale && (
              <div className="flex gap-1 rounded-md bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setMode(isPerKg ? "perKg" : "retail")}
                  className={cn(
                    "flex-1 rounded px-2 py-1 text-xs font-medium transition-colors",
                    mode !== "wholesale" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  Retail
                </button>
                <button
                  type="button"
                  onClick={() => setMode("wholesale")}
                  className={cn(
                    "flex-1 rounded px-2 py-1 text-xs font-medium transition-colors",
                    mode === "wholesale" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  Wholesale
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  onClick={() => changeQty(-step)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-14 text-center text-sm font-medium tabular-nums">
                  {qty} {isPerKg || mode === "wholesale" ? "kg" : ""}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  onClick={() => changeQty(step)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button type="button" className="flex-1" onClick={handleAdd}>
                Add
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
