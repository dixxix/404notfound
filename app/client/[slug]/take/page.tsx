'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import type { PublicTest } from '@/lib/types'

export default function ClientTakePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [test, setTest] = useState<PublicTest | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [idx, setIdx] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const id = sessionStorage.getItem(`client-attempt-${slug}`)
    if (!id) {
      router.replace(`/client/${slug}`)
      return
    }
    setAttemptId(id)
    api.getPublicTestBySlug(slug).then(setTest).catch(() => toast.error('Тест не найден'))
  }, [slug, router])

  const q = test?.questions[idx]
  const progress = useMemo(() => {
    if (!test || test.questions.length === 0) return 0
    return ((idx + 1) / test.questions.length) * 100
  }, [idx, test])

  const saveCurrent = async () => {
    if (!attemptId || !q) return
    const v = answers[q.id]
    await api.submitAnswersBySlug(slug, attemptId, [{ questionId: q.id, value: v as never }])
  }

  const next = async () => {
    try {
      await saveCurrent()
      if (!test) return
      if (idx < test.questions.length - 1) {
        setIdx((x) => x + 1)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось сохранить ответ')
    }
  }

  const finish = async () => {
    if (!attemptId) return
    setIsSubmitting(true)
    try {
      await saveCurrent()
      await api.completeTestBySlug(slug, attemptId)
      router.replace(`/client/${slug}/complete`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось завершить тест')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!test || !q) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -left-32 top-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-0 bottom-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="PsyTest Logo" 
                width={36} 
                height={36}
                className="w-9 h-9 object-contain"
              />
              <span className="text-lg font-bold">
                <span className="text-primary">Psy</span>
                <span className="text-foreground">Test</span>
              </span>
            </Link>
            <span className="text-sm text-muted-foreground">
              Вопрос {idx + 1} из {test.questions.length}
            </span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 px-4 py-2 bg-card/50 border-b border-border">
        <div className="container mx-auto">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card/80 backdrop-blur-xl rounded-[2rem] border border-border p-6 sm:p-8 shadow-xl shadow-primary/5">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">{q.text}</h2>

            {q.type === 'single' && (
              <RadioGroup
                value={(answers[q.id] as string) ?? ''}
                onValueChange={(value) => setAnswers((a) => ({ ...a, [q.id]: value }))}
                className="space-y-3"
              >
                {q.options.map((opt) => (
                  <div 
                    key={opt.id} 
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      answers[q.id] === opt.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-muted/50 border-border hover:bg-muted'
                    }`}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                  >
                    <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} />
                    <Label htmlFor={`${q.id}-${opt.id}`} className="flex-1 cursor-pointer text-foreground">
                      {opt.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {q.type === 'open' && (
              <Textarea
                value={(answers[q.id] as string) ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="min-h-32 rounded-xl bg-muted border-border focus:border-primary"
                placeholder="Введите ваш ответ..."
              />
            )}

            {q.type === 'number' && (
              <Input
                type="number"
                value={typeof answers[q.id] === 'number' ? (answers[q.id] as number) : ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: Number(e.target.value) }))}
                className="h-12 rounded-xl bg-muted border-border focus:border-primary"
                placeholder="Введите число..."
              />
            )}

            {q.type === 'scale' && (
              <div className="py-4">
                <Slider
                  min={q.scaleMin ?? 1}
                  max={q.scaleMax ?? 10}
                  step={1}
                  value={[Number(answers[q.id] ?? q.scaleMin ?? 1)]}
                  onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v[0] }))}
                  className="my-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{q.scaleMin ?? 1}</span>
                  <span className="font-semibold text-primary text-lg">
                    {answers[q.id] ?? q.scaleMin ?? 1}
                  </span>
                  <span>{q.scaleMax ?? 10}</span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setIdx((x) => Math.max(0, x - 1))} 
                disabled={idx === 0}
                className="rounded-xl h-11 px-5"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
              {idx < test.questions.length - 1 ? (
                <Button 
                  onClick={next}
                  className="rounded-xl h-11 px-5 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Далее
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={finish} 
                  disabled={isSubmitting}
                  className="rounded-xl h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {isSubmitting ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Завершить
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
