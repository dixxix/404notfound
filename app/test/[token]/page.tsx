'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Home,
  RotateCcw,
  FileDown,
  ExternalLink,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { fioFieldsSchema, formatFullName } from '@/lib/fio'
import { visibleQuestionsInOrder } from '@/lib/question-visibility'
import type { PublicTest, Question, Answer, TestResult } from '@/lib/types'

function isAnswerFilled(q: Question, v: unknown): boolean {
  if (!q.required) return true
  if (v === undefined || v === null) return false
  if (typeof v === 'string' && !v.trim()) return false
  if (Array.isArray(v) && v.length === 0) return false
  if (q.type === 'number' && typeof v === 'number' && Number.isNaN(v)) return false
  return true
}

const personalDataSchema = fioFieldsSchema.extend({
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  age: z.coerce.number().min(10).max(100).optional(),
})

type PersonalData = z.infer<typeof personalDataSchema>

type TestState = 'loading' | 'intro' | 'personal' | 'questions' | 'completed' | 'result' | 'error'

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [state, setState] = useState<TestState>('loading')
  const [test, setTest] = useState<PublicTest | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [result, setResult] = useState<TestResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalData>({
    resolver: zodResolver(personalDataSchema),
  })

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await api.getPublicTest(token)
        setTest(data)
        setState('intro')
      } catch {
        toast.error('Ссылка недействительна или тест удалён')
        setTest(null)
        setState('error')
      }
    }
    fetchTest()
  }, [token])

  const answersRef = useRef(answers)
  answersRef.current = answers

  const saveAnswers = useCallback(async () => {
    const current = answersRef.current
    if (!attemptId || Object.keys(current).length === 0) return

    const formattedAnswers: Answer[] = Object.entries(current).map(([questionId, value]) => ({
      questionId,
      value: value as Answer['value'],
    }))

    try {
      await api.submitAnswers(attemptId, formattedAnswers)
    } catch {
      localStorage.setItem(`test-${token}-answers`, JSON.stringify(current))
    }
  }, [attemptId, token])

  useEffect(() => {
    if (state !== 'questions' || !attemptId) return
    const t = setTimeout(() => {
      void saveAnswers()
    }, 2000)
    return () => clearTimeout(t)
  }, [answers, state, attemptId, saveAnswers])

  useEffect(() => {
    if (state !== 'questions' || !attemptId) return
    const load = async () => {
      try {
        const { answers: saved } = await api.getProgress(attemptId)
        const fromServer: Record<string, unknown> = {}
        for (const a of saved) {
          fromServer[a.questionId] = a.value
        }
        const raw = localStorage.getItem(`test-${token}-answers`)
        const fromLs = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
        setAnswers((prev) => ({ ...fromLs, ...fromServer, ...prev }))
      } catch {
        /* offline / demo */
      }
    }
    void load()
  }, [state, attemptId, token])

  const handleStart = async () => {
    if (!test) return
    if (test.requiresPersonalData) {
      setState('personal')
      return
    }
    setIsStarting(true)
    try {
      const { attemptId: newAttemptId } = await api.startTest(token, { name: 'Гость' })
      setAttemptId(newAttemptId)
      setState('questions')
    } catch {
      toast.error('Не удалось начать тест. Проверьте подключение к серверу.')
    } finally {
      setIsStarting(false)
    }
  }

  const handleBackToIntro = () => {
    setState('intro')
    setCurrentIndex(0)
    setAnswers({})
    setAttemptId(null)
    setResult(null)
  }

  const handlePersonalData = async (data: PersonalData) => {
    setIsSubmitting(true)
    try {
      const { attemptId: newAttemptId } = await api.startTest(token, {
        name: formatFullName(data),
        email: data.email || undefined,
        age: data.age,
      })
      setAttemptId(newAttemptId)
      setState('questions')
    } catch {
      toast.error('Не удалось начать тест')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswer = (questionId: string, value: unknown) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const visibleQuestions = useMemo(
    () => (test ? visibleQuestionsInOrder(test.questions, answers) : []),
    [test, answers]
  )

  useEffect(() => {
    if (visibleQuestions.length === 0) return
    if (currentIndex >= visibleQuestions.length) {
      setCurrentIndex(visibleQuestions.length - 1)
    }
  }, [visibleQuestions.length, currentIndex])

  const handleNext = () => {
    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      await saveAnswers()
      if (!attemptId) {
        toast.error('Нет активного прохождения')
        return
      }
      await api.completeTest(attemptId)
      setResult(null)
      setState('completed')
      localStorage.removeItem(`test-${token}-answers`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Не удалось завершить тест'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canComplete = () => {
    if (!test) return false
    return visibleQuestions.every((q) => isAnswerFilled(q, answers[q.id]))
  }

  const progress =
    test && visibleQuestions.length > 0
      ? ((currentIndex + 1) / visibleQuestions.length) * 100
      : 0
  const currentQuestion = visibleQuestions[currentIndex]

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f7ff] via-[#f3f2fd] to-[#eef0ff]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (state === 'error' || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f7ff] via-[#f3f2fd] to-[#eef0ff] p-4 relative overflow-hidden">
        <div className="absolute -left-64 top-32 w-[500px] h-[500px] bg-gradient-to-br from-[#54a9fa]/20 to-[#7c3aed]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#54a9fa]/15 to-transparent rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 p-8 max-w-md w-full text-center shadow-xl shadow-[#54a9fa]/10">
          <h2 className="text-2xl font-bold text-[#0b3059] mb-4">Тест не найден</h2>
          <p className="text-[#0b3059]/60 mb-6">
            Ссылка недействительна или срок её действия истёк
          </p>
          <Button 
            asChild
            className="bg-gradient-to-r from-[#54a9fa] to-[#4299e1] hover:from-[#4299e1] hover:to-[#3182ce] text-white rounded-xl h-12 px-6 font-semibold shadow-lg shadow-[#54a9fa]/25"
          >
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (state === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f7ff] via-[#f3f2fd] to-[#eef0ff] p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -left-64 top-32 w-[500px] h-[500px] bg-gradient-to-br from-[#54a9fa]/25 to-[#7c3aed]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute right-0 -top-32 w-[600px] h-[600px] bg-gradient-to-bl from-[#54a9fa]/20 to-[#06b6d4]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-[300px] h-[300px] bg-gradient-to-t from-[#54a9fa]/15 to-transparent rounded-full blur-[80px] pointer-events-none" />
        
        {/* Floating shapes */}
        <div className="absolute top-24 left-24 w-32 h-32 border-2 border-[#54a9fa]/20 rounded-full hidden lg:block" />
        <div className="absolute bottom-24 right-24 w-20 h-20 bg-[#54a9fa]/10 rounded-2xl rotate-12 hidden lg:block" />

        <div className="relative z-10 bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 p-8 max-w-lg w-full shadow-xl shadow-[#54a9fa]/10">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <Image 
                src="/logo.png" 
                alt="PsyTest Logo" 
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#0b3059] text-center mb-4">
            {test.title}
          </h1>
          
          {test.description && (
            <p className="text-[#0b3059]/60 text-center mb-6">{test.description}</p>
          )}

          {test.instruction && (
            <div className="bg-[#54a9fa]/10 rounded-xl p-4 mb-6 border border-[#54a9fa]/20">
              <p className="text-sm text-[#0b3059]/80">{test.instruction}</p>
            </div>
          )}

          <div className="text-center text-sm text-[#0b3059]/50 mb-6">
            <p className="font-medium">
              {(() => {
                const minV = visibleQuestionsInOrder(test.questions, {}).length
                const maxV = test.questions.length
                return minV < maxV
                  ? `От ${minV} до ${maxV} вопросов`
                  : `${maxV} вопросов`
              })()}
            </p>
          </div>

          <Button 
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#54a9fa] to-[#4299e1] hover:from-[#4299e1] hover:to-[#3182ce] text-white font-semibold shadow-lg shadow-[#54a9fa]/25 transition-all hover:shadow-xl" 
            onClick={handleStart} 
            disabled={isStarting}
          >
            {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Начать тест
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full mt-3 text-[#0b3059]/50 hover:text-[#0b3059] hover:bg-[#54a9fa]/10" 
            asChild
          >
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (state === 'personal') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f7ff] via-[#f3f2fd] to-[#eef0ff] p-4 relative overflow-hidden">
        <div className="absolute -left-64 top-32 w-[500px] h-[500px] bg-gradient-to-br from-[#54a9fa]/20 to-[#7c3aed]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#54a9fa]/15 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 p-8 max-w-md w-full shadow-xl shadow-[#54a9fa]/10">
          <Button
            type="button"
            variant="ghost"
            className="mb-4 -ml-2 text-[#0b3059]/60 hover:text-[#0b3059]"
            onClick={() => setState('intro')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            К описанию
          </Button>

          <h2 className="text-xl font-bold text-[#0b3059] mb-2">Ваши данные</h2>
          <p className="text-[#0b3059]/50 text-sm mb-6">
            Заполните информацию о себе перед началом теста
          </p>

          <form onSubmit={handleSubmit(handlePersonalData)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#0b3059] mb-2 block">Фамилия *</label>
              <Input
                placeholder="Иванов"
                autoComplete="family-name"
                {...register('lastName')}
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-[#f8f7ff] border-[#54a9fa]/20 focus:border-[#54a9fa]"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0b3059] mb-2 block">Имя *</label>
              <Input
                placeholder="Иван"
                autoComplete="given-name"
                {...register('firstName')}
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-[#f8f7ff] border-[#54a9fa]/20 focus:border-[#54a9fa]"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0b3059] mb-2 block">Отчество *</label>
              <Input
                placeholder="Иванович"
                autoComplete="additional-name"
                {...register('middleName')}
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-[#f8f7ff] border-[#54a9fa]/20 focus:border-[#54a9fa]"
              />
              {errors.middleName && (
                <p className="text-sm text-red-500 mt-1">{errors.middleName.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0b3059] mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="example@mail.com"
                {...register('email')}
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-[#f8f7ff] border-[#54a9fa]/20 focus:border-[#54a9fa]"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0b3059] mb-2 block">Возраст</label>
              <Input
                type="number"
                placeholder="25"
                {...register('age')}
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-[#f8f7ff] border-[#54a9fa]/20 focus:border-[#54a9fa]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#54a9fa] to-[#4299e1] hover:from-[#4299e1] hover:to-[#3182ce] text-white font-semibold shadow-lg shadow-[#54a9fa]/25" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Продолжить
            </Button>
          </form>
        </div>
      </div>
    )
  }

  if (state === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f7ff] via-[#f3f2fd] to-[#eef0ff] p-4 relative overflow-hidden">
        <div className="absolute -left-64 top-32 w-[500px] h-[500px] bg-gradient-to-br from-[#54a9fa]/20 to-[#7c3aed]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#54a9fa]/15 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 p-8 max-w-lg w-full text-center shadow-xl shadow-[#54a9fa]/10">
          <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0b3059] mb-4">Спасибо за прохождение!</h2>
          <p className="text-[#0b3059]/60 mb-8">
            Результаты будут отправлены вам после обработки психологом.
          </p>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl border-[#54a9fa]/30 text-[#0b3059] hover:bg-[#54a9fa]/10" 
              onClick={handleBackToIntro}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Вернуться к описанию
            </Button>
            <Button 
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#54a9fa] to-[#4299e1] text-white font-semibold shadow-lg shadow-[#54a9fa]/25" 
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                На главную
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'result') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f7ff] via-[#f3f2fd] to-[#eef0ff] p-4 relative overflow-hidden">
        <div className="absolute -left-64 top-32 w-[500px] h-[500px] bg-gradient-to-br from-[#54a9fa]/20 to-[#7c3aed]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#54a9fa]/15 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 p-8 max-w-lg w-full shadow-xl shadow-[#54a9fa]/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0b3059]">Тест завершён!</h2>
            <p className="text-[#0b3059]/50 text-sm">Спасибо за прохождение теста</p>
          </div>

          {result?.metrics && result.metrics.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-[#0b3059]">Ваши результаты:</h3>
              {result.metrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0b3059]">{metric.name}</span>
                    <span className="font-medium text-[#54a9fa]">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-2 rounded-full bg-[#54a9fa]/20" />
                  {metric.description && (
                    <p className="text-xs text-[#0b3059]/50">{metric.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {result?.interpretation && (
            <div className="bg-[#54a9fa]/10 rounded-xl p-4 mb-6 border border-[#54a9fa]/20">
              <p className="text-sm text-[#0b3059]/80">{result.interpretation}</p>
            </div>
          )}

          {result?.canDownloadReport && attemptId && (
            <div className="space-y-2 rounded-xl border border-[#54a9fa]/20 bg-[#f8f7ff] p-4 mb-6">
              <p className="text-sm font-medium text-[#0b3059] text-center">Скачать отчёт для клиента</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#54a9fa] to-[#4299e1] text-white"
                  onClick={async () => {
                    try {
                      await api.downloadPublicClientReport(attemptId, 'docx')
                      toast.success('Отчёт сохранён')
                    } catch {
                      toast.error('Не удалось скачать DOCX')
                    }
                  }}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  DOCX
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-10 rounded-xl border-[#54a9fa]/30"
                  onClick={async () => {
                    try {
                      await api.downloadPublicClientReport(attemptId, 'html')
                    } catch {
                      toast.error('Не удалось открыть HTML-отчёт')
                    }
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  HTML
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-xl border-[#54a9fa]/30 text-[#0b3059] hover:bg-[#54a9fa]/10"
              onClick={() => router.back()}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Вернуться назад
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 rounded-xl border-[#54a9fa]/30 text-[#0b3059] hover:bg-[#54a9fa]/10" 
              onClick={handleBackToIntro}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              К описанию теста
            </Button>
            <Button 
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#54a9fa] to-[#4299e1] text-white font-semibold shadow-lg shadow-[#54a9fa]/25" 
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                На главную
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Questions state
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7ff] via-[#f3f2fd] to-[#eef0ff] py-8 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -left-64 top-32 w-[500px] h-[500px] bg-gradient-to-br from-[#54a9fa]/20 to-[#7c3aed]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-0 -top-32 w-[600px] h-[600px] bg-gradient-to-bl from-[#54a9fa]/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
      
      {/* Floating shapes */}
      <div className="absolute top-40 left-24 w-32 h-32 border-2 border-[#54a9fa]/15 rounded-full hidden lg:block pointer-events-none" />
      <div className="absolute bottom-24 right-24 w-20 h-20 bg-[#54a9fa]/10 rounded-2xl rotate-12 hidden lg:block pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header with logo and title */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 px-6 py-4 mb-6 shadow-lg shadow-[#54a9fa]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/logo.png" 
                alt="PsyTest Logo" 
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-lg font-bold text-[#0b3059]">{test.title}</h1>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 p-8 mb-6 shadow-xl shadow-[#54a9fa]/10">
          {/* Progress inside card */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-[#0b3059]/60 mb-2">
              <span className="font-medium">
                Вопрос {currentIndex + 1} из {visibleQuestions.length}
              </span>
              <span className="font-semibold text-[#54a9fa]">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-[#54a9fa]/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#54a9fa] to-[#4299e1] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {currentQuestion && (
            <>
              {currentQuestion.sectionTitle && (
                <p className="text-sm font-semibold text-[#54a9fa] mb-4 border-b border-[#54a9fa]/20 pb-2">
                  {currentQuestion.sectionTitle}
                </p>
              )}
              <QuestionComponent
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
              />
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="h-12 rounded-xl px-6 border-[#54a9fa]/30 text-[#0b3059] hover:bg-[#54a9fa]/10 bg-white/80 backdrop-blur"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>

          {currentIndex === visibleQuestions.length - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={!canComplete() || isSubmitting}
              className="h-12 rounded-xl px-6 bg-gradient-to-r from-[#54a9fa] to-[#4299e1] hover:from-[#4299e1] hover:to-[#3182ce] text-white font-semibold shadow-lg shadow-[#54a9fa]/25"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Завершить тест
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="h-12 rounded-xl px-6 bg-gradient-to-r from-[#54a9fa] to-[#4299e1] hover:from-[#4299e1] hover:to-[#3182ce] text-white font-semibold shadow-lg shadow-[#54a9fa]/25"
            >
              Далее
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Required questions indicator */}
        {!canComplete() && currentIndex === visibleQuestions.length - 1 && (
          <p className="text-center text-sm text-red-500 mt-4">
            Ответьте на все обязательные вопросы для завершения теста
          </p>
        )}
      </div>
    </div>
  )
}

function QuestionComponent({
  question,
  answer,
  onAnswer,
}: {
  question: Question
  answer: unknown
  onAnswer: (value: unknown) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xl font-semibold text-[#0b3059]">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </p>
      </div>

      {question.type === 'single' && (
        <RadioGroup
          value={answer as string}
          onValueChange={onAnswer}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                answer === option.id 
                  ? 'border-[#54a9fa] bg-[#54a9fa]/10 shadow-md shadow-[#54a9fa]/10' 
                  : 'border-[#0b3059]/20 hover:border-[#54a9fa]/50 hover:bg-[#54a9fa]/5'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                answer === option.id ? 'border-[#54a9fa] bg-[#54a9fa]' : 'border-[#0b3059]/30'
              }`}>
                {answer === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer text-[#0b3059]">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === 'multiple' && (
        <div className="space-y-3">
          {question.options.map((option) => {
            const selected = (answer as string[] | undefined)?.includes(option.id) || false
            return (
              <div
                key={option.id}
                className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selected 
                    ? 'border-[#54a9fa] bg-[#54a9fa]/10 shadow-md shadow-[#54a9fa]/10' 
                    : 'border-[#0b3059]/20 hover:border-[#54a9fa]/50 hover:bg-[#54a9fa]/5'
                }`}
                onClick={() => {
                  const current = (answer as string[]) || []
                  if (selected) {
                    onAnswer(current.filter((id) => id !== option.id))
                  } else {
                    onAnswer([...current, option.id])
                  }
                }}
              >
                <Checkbox id={option.id} checked={selected} className="w-5 h-5 rounded border-2 border-[#0b3059]/30 data-[state=checked]:bg-[#54a9fa] data-[state=checked]:border-[#54a9fa]" />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer text-[#0b3059]">
                  {option.text}
                </Label>
              </div>
            )
          })}
        </div>
      )}

      {question.type === 'scale' && (
        <div className="space-y-6 py-4">
          <Slider
            value={[answer as number || question.scaleMin || 1]}
            onValueChange={([value]) => onAnswer(value)}
            min={question.scaleMin || 1}
            max={question.scaleMax || 5}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-[#0b3059]/60">
            <span>{question.scaleMinLabel || question.scaleMin}</span>
            <span className="text-3xl font-bold text-[#54a9fa]">
              {answer as number || question.scaleMin || 1}
            </span>
            <span>{question.scaleMaxLabel || question.scaleMax}</span>
          </div>
        </div>
      )}

      {question.type === 'open' && (
        <Textarea
          value={answer as string || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Введите ваш ответ..."
          rows={5}
          className="resize-none rounded-xl bg-[#f8f7ff] border-[#54a9fa]/20 focus:border-[#54a9fa] text-[#0b3059]"
        />
      )}

      {question.type === 'number' && (
        <Input
          type="number"
          min={question.numberMin ?? undefined}
          max={question.numberMax ?? undefined}
          value={answer === undefined || answer === '' ? '' : String(answer)}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') {
              onAnswer(undefined)
              return
            }
            const n = Number(raw)
            onAnswer(Number.isNaN(n) ? undefined : n)
          }}
          className="max-w-xs h-11 rounded-xl bg-[#f8f7ff] border-[#54a9fa]/20 focus:border-[#54a9fa] text-[#0b3059]"
        />
      )}
    </div>
  )
}
