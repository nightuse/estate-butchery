import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { AdminAuthForm } from "@/components/admin/admin-auth-form"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/admin")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary font-display text-xl font-bold text-primary-foreground">
          EB
        </span>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Estate Butchery
        </h1>
        <p className="text-sm text-muted-foreground">Admin & staff portal</p>
      </div>

      <Card className="w-full max-w-sm p-6">
        <AdminAuthForm />
      </Card>

      <Link
        href="/"
        className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to the shop
      </Link>
    </main>
  )
}
