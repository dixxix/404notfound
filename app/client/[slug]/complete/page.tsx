'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Home, RotateCcw } from 'lucide-react'
import { useParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

export default function ClientCompletePage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              <Image
                src="/logo.png"
                alt="PsyTest Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-lg font-semibold">
              <span className="text-primary">Psy</span>
              <span className="text-foreground">Test</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-12 w-12 text-emerald-500" />
        </div>

        <h1 className="mb-4 text-center text-3xl font-bold text-foreground">
          Спасибо за прохождение!
        </h1>

        <p className="mb-8 max-w-md text-center text-muted-foreground">
          Ваши ответы успешно сохранены. Результаты будут обработаны специалистом 
          и отправлены вам в ближайшее время.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/client/${slug}`}>
              <RotateCcw className="h-4 w-4" />
              Пройти снова
            </Link>
          </Button>
          <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/">
              <Home className="h-4 w-4" />
              На главную
            </Link>
          </Button>
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card/50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Что дальше?</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              Психолог проанализирует ваши ответы
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              Результаты будут отправлены на указанный email
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              При необходимости вы получите рекомендации
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
