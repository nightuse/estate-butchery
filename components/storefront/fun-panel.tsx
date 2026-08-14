"use client"

import { useEffect, useState } from "react"
import { Quote } from "lucide-react"

const LINES = [
  "Motivation: A good day starts with a full sufuria. Cook something great today.",
  "Joke: Why did the butcher win an award? Because he was a cut above the rest!",
  "Motivation: Slow and steady still gets the nyama on the grill. Keep going.",
  "Joke: What do you call a happy cow's best cut? A moo-velous steak.",
  "Motivation: Fresh choices make fresh days. Treat yourself well.",
  "Joke: I told my friend I only buy the best beef. He said I have prime priorities.",
  "Motivation: Good food shared is good times doubled. Invite someone over.",
  "Joke: Why did the sausage go to school? To get a little more meat-ucation.",
  "Motivation: Hard work deserves a good meal. You have earned it.",
  "Joke: The grill said to the steak, 'You are on fire today!'",
  "Motivation: Every great meal begins with one good decision. Make it now.",
  "Joke: Our mince is so fresh, it still remembers the farm.",
]

export function FunPanel() {
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    const pick = () => setIndex(new Date().getHours() % LINES.length)
    pick()
    const id = setInterval(pick, 60 * 1000)
    return () => clearInterval(id)
  }, [])

  if (index === null) return null

  return (
    <div className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2.5">
        <Quote className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
        <p className="text-xs text-muted-foreground/80">{LINES[index]}</p>
        <span className="ml-auto hidden text-[10px] uppercase tracking-widest text-muted-foreground/50 sm:block">
          Hourly pick
        </span>
      </div>
    </div>
  )
}
