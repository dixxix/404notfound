'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, Sparkles, Gift, Users, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts'
import { Spinner } from '@/components/ui/spinner'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute -left-32 top-20 w-[600px] h-[600px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute right-0 -top-32 w-[500px] h-[500px] bg-primary/15 dark:bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-[400px] h-[400px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Floating shapes */}
      <div className="absolute top-40 right-20 w-20 h-20 border-2 border-primary/30 rounded-full hidden lg:block animate-bounce" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-40 left-32 w-12 h-12 bg-primary/20 rounded-xl rotate-45 hidden lg:block" />
      <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-primary/15 rounded-full hidden lg:block" />

      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 bg-card/70 backdrop-blur-xl rounded-[2rem] mt-6 px-6 border border-border shadow-lg shadow-primary/5">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="PsyTest Logo" 
                width={48} 
                height={48}
                className="w-12 h-12 object-contain"
              />
              <span className="text-2xl font-bold tracking-tight hidden sm:block">
                <span className="text-primary">Psy</span>
                <span className="text-foreground">Test</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                asChild 
                variant="ghost"
                className="text-foreground hover:bg-accent rounded-xl px-4 h-10 font-medium hidden sm:flex"
              >
                <Link href="/auth?tab=login">Войти</Link>
              </Button>
              <Button 
                asChild 
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-11 font-medium shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Link href="/auth?tab=register" className="flex items-center gap-2">
                  Начать бесплатно
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-border shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Бесплатная платформа для профориентологов</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground mb-8">
            Создавайте тесты.
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Анализируйте результаты.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Профессиональная платформа для создания психологических тестов, проведения тестирования клиентов и получения детальных отчётов
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 h-14 text-lg font-semibold shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1"
            >
              <Link href="/auth">
                Начать работу
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline"
              size="lg"
              className="border-2 border-primary/30 text-foreground hover:bg-accent rounded-2xl px-8 h-14 text-lg font-medium"
            >
              <Link href="/client/demo">Попробовать демо</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Main CTA Card */}
            <div className="lg:col-span-2 bg-primary rounded-[2rem] p-8 relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-primary-foreground">100+</p>
                    <p className="text-primary-foreground/80">активных пользователей</p>
                  </div>
                </div>
                <p className="text-primary-foreground/90 text-lg mb-6 max-w-md">
                  Присоединяйтесь к сообществу профориентологов, которые уже используют нашу платформу
                </p>
                <Button 
                  asChild 
                  className="bg-white dark:bg-white text-primary hover:bg-white/90 dark:hover:bg-white/90 rounded-xl h-12 px-6 font-semibold group-hover:shadow-lg transition-all"
                >
                  <Link href="/auth">
                    Присоединиться
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Fast Card */}
            <div className="bg-card/70 backdrop-blur-xl rounded-[2rem] p-6 border border-border shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Быстро</h3>
              <p className="text-muted-foreground">Создайте профессиональный тест всего за пару минут</p>
            </div>

            {/* Simple Card */}
            <div className="bg-card/70 backdrop-blur-xl rounded-[2rem] p-6 border border-border shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Просто</h3>
              <p className="text-muted-foreground">Интуитивно понятный интерфейс без сложных настроек</p>
            </div>

            {/* Free Card */}
            <div className="bg-card/70 backdrop-blur-xl rounded-[2rem] p-6 border border-border shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gift className="h-7 w-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Бесплатно</h3>
              <p className="text-muted-foreground">Создавайте неограниченное количество тестов бесплатно</p>
            </div>

            {/* Demo Tests Card */}
            <div className="bg-secondary rounded-[2rem] p-6 relative overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-4 right-4 text-8xl font-bold text-foreground/5">?</div>
              <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">Демо тесты</h3>
              <p className="text-muted-foreground mb-6 relative z-10">Попробуйте примеры тестов без регистрации</p>
              <div className="flex flex-col gap-2 relative z-10">
                <Button 
                  asChild 
                  variant="secondary"
                  className="bg-background/50 hover:bg-background/70 text-foreground border-0 rounded-xl h-10 font-medium backdrop-blur"
                >
                  <Link href="/client/demo">Профориентация</Link>
                </Button>
                <Button 
                  asChild 
                  variant="secondary"
                  className="bg-background/50 hover:bg-background/70 text-foreground border-0 rounded-xl h-10 font-medium backdrop-blur"
                >
                  <Link href="/client/demo-team">Стиль работы</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="PsyTest Logo" 
              width={32} 
              height={32}
              className="w-8 h-8 object-contain opacity-60"
            />
            <p className="text-muted-foreground text-sm">
              PsyTest - Платформа для профориентологов
            </p>
          </div>
          <p className="text-muted-foreground/60 text-sm">
            © 2026 PsyTest. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  )
}
