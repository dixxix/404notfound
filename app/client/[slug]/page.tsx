'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, Mail, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import type { PublicTest } from '@/lib/types'

const schema = z.object({
  name: z.string().min(3, 'Введите имя'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
})

type Values = z.infer<typeof schema>

export default function ClientIntroPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [test, setTest] = useState<PublicTest | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  })

  useEffect(() => {
    api.getPublicTestBySlug(slug)
      .then(setTest)
      .catch(() => toast.error('Ссылка недействительна'))
  }, [slug])

  const onSubmit = async (values: Values) => {
    setIsLoading(true)
    try {
      const { attemptId } = await api.startTestBySlug(slug, {
        name: values.name,
        email: values.email || undefined,
      })
      sessionStorage.setItem(`client-attempt-${slug}`, attemptId)
      router.push(`/client/${slug}/take`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось начать прохождение')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Decorative elements */}
      <div className="absolute -left-48 bottom-0 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-0 -top-48 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-2xl rounded-[2.5rem] border border-border p-8 shadow-2xl shadow-primary/10">
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
            <h1 className="text-2xl font-bold text-foreground">
              {test?.title ?? 'Загрузка...'}
            </h1>
            {test?.description && (
              <p className="text-muted-foreground mt-2 text-sm">{test.description}</p>
            )}
          </div>

          {test?.instruction && (
            <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
              <p className="text-sm text-foreground/80">{test.instruction}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Ваше имя
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                <Input 
                  placeholder="Введите имя"
                  className="h-12 rounded-xl bg-muted border-border focus:border-primary pl-12 text-foreground"
                  {...register('name')} 
                />
              </div>
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email (опционально)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                <Input 
                  type="email" 
                  placeholder="example@mail.com"
                  className="h-12 rounded-xl bg-muted border-border focus:border-primary pl-12 text-foreground"
                  {...register('email')} 
                />
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            
            <Button 
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25" 
              type="submit" 
              disabled={isLoading || !test}
            >
              {isLoading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <>
                  Начать тест
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <Button 
            variant="ghost" 
            className="w-full mt-4 text-muted-foreground hover:text-foreground" 
            asChild
          >
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
