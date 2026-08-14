"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { ProductCard } from "./product-card"
import type { Category, Product } from "@/lib/queries"

export function Catalog({
  categories,
  products,
}: {
  categories: Category[]
  products: Product[]
}) {
  const [active, setActive] = useState<number | "all">("all")

  const filtered = useMemo(() => {
    const list = active === "all" ? products : products.filter((p) => p.categoryId === active)
    // available first
    return [...list].sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))
  }, [active, products])

  const tabs: { id: number | "all"; name: string }[] = [
    { id: "all", name: "All" },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ]

  return (
    <section id="shop" className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Our Counter
        </p>
        <h2 className="text-balance font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
          Fresh Today
        </h2>
        <p className="mx-auto max-w-xl text-pretty text-muted-foreground">
          Browse what&apos;s on the block. Prices are per kilo unless marked otherwise. Add to your
          basket and book a pickup or order for instant payment.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {tabs.map((t) => (
          <button
            key={String(t.id)}
            type="button"
            onClick={() => setActive(t.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/40",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No items in this category right now. Check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
