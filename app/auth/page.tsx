'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/contexts'
import { ThemeToggle } from '@/components/theme-toggle'

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

const registerSchema = z.object({
  name: z.string().min(5, 'Введите ФИО полностью').refine(
    (val) => val.trim().split(/\s+/).filter(Boolean).length >= 3,
    { message: 'Укажите фамилию, имя и отчество' }
  ),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  confirmPassword: z.string().min(6, 'Минимум 6 символов'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login, register: registerUser, isAuthenticated, user } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const mode = searchParams.get('tab')
    if (mode === 'register') setTab('register')
    if (mode === 'login') setTab('login')
  }, [searchParams])

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, user, router])

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  })

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Добро пожаловать!')
    } catch {
      toast.error('Неверный email или пароль')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password })
      toast.success('Регистрация успешна!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка регистрации'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Animated gradient orbs */}
      <div className="absolute -left-48 bottom-0 w-[700px] h-[700px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-0 -top-64 w-[600px] h-[600px] bg-primary/15 dark:bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Floating shapes */}
      <div className="absolute top-32 right-32 w-24 h-24 border-2 border-primary/20 rounded-full hidden lg:block" />
      <div className="absolute bottom-32 left-32 w-16 h-16 bg-primary/10 rounded-2xl rotate-12 hidden lg:block" />
      <div className="absolute top-1/2 left-20 w-8 h-8 bg-purple-500/15 rounded-full hidden lg:block" />

      {/* Theme toggle and back button */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground hover:bg-card/50" 
          asChild
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Link>
        </Button>
      </div>
      
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/80 dark:bg-card/90 backdrop-blur-2xl rounded-[2.5rem] border border-border p-8 shadow-2xl shadow-primary/10 dark:shadow-primary/5">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <Image 
                src="/logo.png" 
                alt="PsyTest Logo" 
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-primary">Psy</span>
              <span className="text-foreground">Test</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Платформа для профориентологов</p>
          </div>

          {/* Tabs */}
          <div className="bg-muted rounded-2xl p-1.5 mb-8">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  tab === 'login'
                    ? 'bg-card text-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  tab === 'register'
                    ? 'bg-card text-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Регистрация
              </button>
            </div>
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input
                    type="email"
                    placeholder="example@mail.com"
                    className="h-12 rounded-xl bg-muted border-border focus:border-primary focus:ring-primary/20 pl-12 text-foreground placeholder:text-muted-foreground"
                    {...loginForm.register('email')}
                    disabled={isLoading}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    className="h-12 rounded-xl bg-muted border-border focus:border-primary focus:ring-primary/20 pl-12 pr-12 text-foreground placeholder:text-muted-foreground"
                    {...loginForm.register('password')}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                disabled={isLoading}
              >
                {isLoading ? <Spinner className="h-5 w-5" /> : 'Войти'}
              </Button>

              <p className="text-center text-sm">
                <span className="text-muted-foreground">Нет аккаунта? </span>
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => setTab('register')}
                >
                  Зарегистрироваться
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  ФИО
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input
                    type="text"
                    placeholder="Иванов Иван Иванович"
                    className="h-12 rounded-xl bg-muted border-border focus:border-primary focus:ring-primary/20 pl-12 text-foreground placeholder:text-muted-foreground"
                    {...registerForm.register('name')}
                    disabled={isLoading}
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input
                    type="email"
                    placeholder="example@mail.com"
                    className="h-12 rounded-xl bg-muted border-border focus:border-primary focus:ring-primary/20 pl-12 text-foreground placeholder:text-muted-foreground"
                    {...registerForm.register('email')}
                    disabled={isLoading}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    className="h-12 rounded-xl bg-muted border-border focus:border-primary focus:ring-primary/20 pl-12 pr-12 text-foreground placeholder:text-muted-foreground"
                    {...registerForm.register('password')}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Повторите пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input
                    type="password"
                    placeholder="********"
                    className="h-12 rounded-xl bg-muted border-border focus:border-primary focus:ring-primary/20 pl-12 text-foreground placeholder:text-muted-foreground"
                    {...registerForm.register('confirmPassword')}
                    disabled={isLoading}
                  />
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                disabled={isLoading}
              >
                {isLoading ? <Spinner className="h-5 w-5" /> : 'Зарегистрироваться'}
              </Button>

              <p className="text-center text-sm">
                <span className="text-muted-foreground">Уже есть аккаунт? </span>
                <button
                  type="button"
                  className="text-primary font-medium hover:underline"
                  onClick={() => setTab('login')}
                >
                  Войти
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  )
}
