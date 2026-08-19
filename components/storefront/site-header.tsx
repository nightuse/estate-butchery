"use client"

import { ShoppingBasket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ShopSettings } from "@/lib/queries"
import { useCart } from "./cart-provider"

export function SiteHeader({ settings }: { settings: ShopSettings }) {
  const { count, setOpen } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
            EB
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold uppercase tracking-wide">
              {settings.shopName}
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">Nairobi</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#shop" className="transition-colors hover:text-primary">
            Shop
          </a>
          <a href="/partners" className="transition-colors hover:text-primary">
            Partners
          </a>
          <a href="#pay" className="transition-colors hover:text-primary">
            Pay
          </a>
          <a href="#contact" className="transition-colors hover:text-primary">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold sm:flex",
              settings.isOpen
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                settings.isOpen ? "bg-primary" : "bg-muted-foreground",
              )}
            />
            {settings.isOpen ? "Open now" : "Closed"}
          </span>
          <Button onClick={() => setOpen(true)} className="relative gap-2">
            <ShoppingBasket className="h-4 w-4" />
            <span className="hidden sm:inline">Basket</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
