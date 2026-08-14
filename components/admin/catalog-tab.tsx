"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatKES } from "@/lib/format"
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  setProductAvailability,
  updateProduct,
} from "@/app/actions/admin"
import type { Category, Product } from "@/lib/types"

export function CatalogTab({
  categories,
  products,
}: {
  categories: Category[]
  products: Product[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <CategoriesSection categories={categories} />
      <ProductsSection categories={categories} products={products} />
    </div>
  )
}

/* ---------------- Categories ---------------- */
function CategoriesSection({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!name.trim()) return
    setBusy(true)
    const res = await createCategory({ name: name.trim(), sortOrder: categories.length + 1 })
    setBusy(false)
    if (res.ok) {
      toast.success("Category added")
      setName("")
    }
  }

  async function remove(id: number) {
    const res = await deleteCategory(id)
    if (res.ok) toast.success("Category removed")
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        <h2 className="font-display text-sm font-bold uppercase tracking-wide">Categories</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span
            key={c.id}
            className="flex items-center gap-1.5 rounded-full border bg-card py-1 pl-3 pr-1.5 text-sm"
          >
            {c.name}
            <button
              onClick={() => remove(c.id)}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete ${c.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category (e.g. Pork)"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) add()
          }}
          className="max-w-xs"
        />
        <Button onClick={add} disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>
    </Card>
  )
}

/* ---------------- Products ---------------- */
function ProductsSection({
  categories,
  products,
}: {
  categories: Category[]
  products: Product[]
}) {
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide">
          Products ({products.length})
        </h2>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add product
              </Button>
            }
          />
          <ProductDialog
            categories={categories}
            onDone={() => setCreating(false)}
            key={creating ? "new" : "closed"}
          />
        </Dialog>
      </div>

      <div className="divide-y">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {p.image ? (
                <Image src={p.image || "/placeholder.svg"} alt={p.name} fill className="object-cover" sizes="56px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{p.name}</span>
                {!p.isAvailable && <Badge variant="outline">Out of stock</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                {categories.find((c) => c.id === p.categoryId)?.name ?? "Uncategorized"} ·{" "}
                {p.pricePerKg ? `${formatKES(Number(p.pricePerKg))}/kg` : formatKES(Number(p.retailPrice))}
              </p>
            </div>
            <Switch
              checked={p.isAvailable}
              onCheckedChange={async (v) => {
                const res = await setProductAvailability(p.id, v)
                if (res.ok) toast.success(v ? "Marked available" : "Marked out of stock")
              }}
              aria-label="Toggle availability"
            />
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={async () => {
                const res = await deleteProduct(p.id)
                if (res.ok) toast.success("Product deleted")
              }}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        {editing && (
          <ProductDialog
            categories={categories}
            product={editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>
    </Card>
  )
}

function ProductDialog({
  categories,
  product,
  onDone,
}: {
  categories: Category[]
  product?: Product
  onDone: () => void
}) {
  const [name, setName] = useState(product?.name ?? "")
  const [categoryId, setCategoryId] = useState<string>(
    product?.categoryId ? String(product.categoryId) : categories[0] ? String(categories[0].id) : "",
  )
  const [description, setDescription] = useState(product?.description ?? "")
  const [image, setImage] = useState(product?.image ?? "")
  const [pricePerKg, setPricePerKg] = useState(product?.pricePerKg ?? "")
  const [wholesale, setWholesale] = useState(product?.wholesalePricePerKg ?? "")
  const [retailUnit, setRetailUnit] = useState(product?.retailUnit ?? "per kg")
  const [retailPrice, setRetailPrice] = useState(product?.retailPrice ?? "")
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true)
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!name.trim()) {
      toast.error("Product needs a name")
      return
    }
    setBusy(true)
    const payload = {
      categoryId: categoryId ? Number(categoryId) : null,
      name: name.trim(),
      description,
      image,
      pricePerKg: pricePerKg || null,
      wholesalePricePerKg: wholesale || null,
      retailPrice: retailPrice || pricePerKg || null,
      retailUnit: retailUnit || "per kg",
      isAvailable,
    }
    const res = product
      ? await updateProduct(product.id, payload)
      : await createProduct(payload)
    setBusy(false)
    if (res.ok) {
      toast.success(product ? "Product updated" : "Product added")
      onDone()
    }
  }

  return (
    <DialogContent className="max-h-[90svh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
        <DialogDescription>
          Set the name, category, prices and availability shown to customers.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="grid gap-2">
          <Label htmlFor="p-name">Name</Label>
          <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Beef with bone" />
        </div>

        <div className="grid gap-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="p-desc">Description</Label>
          <Textarea
            id="p-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Fresh, great for stew"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="p-image">Image URL</Label>
          <Input
            id="p-image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/images/beef-bone.png or https://..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="p-price">Retail price / kg (KSh)</Label>
            <Input
              id="p-price"
              inputMode="decimal"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              placeholder="640"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-whole">Wholesale / kg (KSh)</Label>
            <Input
              id="p-whole"
              inputMode="decimal"
              value={wholesale}
              onChange={(e) => setWholesale(e.target.value)}
              placeholder="590"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="p-unit">Retail unit label</Label>
            <Input
              id="p-unit"
              value={retailUnit}
              onChange={(e) => setRetailUnit(e.target.value)}
              placeholder="per kg / each"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-retail">Retail price (KSh)</Label>
            <Input
              id="p-retail"
              inputMode="decimal"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              placeholder="Same as per kg if blank"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Available now</p>
            <p className="text-xs text-muted-foreground">Turn off when out of stock</p>
          </div>
          <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {product ? "Save changes" : "Add product"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
