'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Activity,
  Ban,
  UserCheck,
  Calendar
} from 'lucide-react'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { Psychologist } from '@/lib/types'

interface SystemStats {
  totalPsychologists: number
  activePsychologists: number
  blockedPsychologists: number
  expiringAccess: number
  totalTests: number
  totalAttempts: number
  completedAttempts: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [dashStats, psychData] = await Promise.all([
          api.getDashboardStats(),
          api.getPsychologists()
        ])
        
        if (cancelled) return
        
        const psychs = psychData.data
        const now = new Date()
        const weekFromNow = addDays(now, 7)
        
        // Calculate system stats
        const activePsychologists = psychs.filter(p => !p.isBlocked).length
        const blockedPsychologists = psychs.filter(p => p.isBlocked).length
        const expiringAccess = psychs.filter(p => {
          if (!p.accessExpiresAt) return false
          const expiresDate = new Date(p.accessExpiresAt)
          return isAfter(expiresDate, now) && isBefore(expiresDate, weekFromNow)
        }).length
        
        setStats({
          totalPsychologists: dashStats.totalPsychologists ?? psychs.length,
          activePsychologists,
          blockedPsychologists,
          expiringAccess,
          totalTests: dashStats.totalTests,
          totalAttempts: dashStats.totalAttempts,
          completedAttempts: dashStats.completedAttempts,
        })
        setPsychologists(psychs)
      } catch {
        if (!cancelled) {
          toast.error('Не удалось загрузить статистику')
          setStats({
            totalPsychologists: 0,
            activePsychologists: 0,
            blockedPsychologists: 0,
            expiringAccess: 0,
            totalTests: 0,
            totalAttempts: 0,
            completedAttempts: 0,
          })
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Get psychologists with expiring access
  const expiringPsychologists = psychologists.filter(p => {
    if (!p.accessExpiresAt || p.isBlocked) return false
    const now = new Date()
    const weekFromNow = addDays(now, 7)
    const expiresDate = new Date(p.accessExpiresAt)
    return isAfter(expiresDate, now) && isBefore(expiresDate, weekFromNow)
  })

  // Get recently blocked psychologists
  const blockedPsychologists = psychologists.filter(p => p.isBlocked).slice(0, 5)

  // Get psychologists with expired access (not blocked but access expired)
  const expiredAccessPsychologists = psychologists.filter(p => {
    if (!p.accessExpiresAt || p.isBlocked) return false
    return isBefore(new Date(p.accessExpiresAt), new Date())
  })

  const statCards = [
    {
      title: 'Всего психологов',
      value: stats?.totalPsychologists ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/admin/psychologists',
    },
    {
      title: 'Активных',
      value: stats?.activePsychologists ?? 0,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Заблокировано',
      value: stats?.blockedPsychologists ?? 0,
      icon: Ban,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      title: 'Истекает доступ',
      value: stats?.expiringAccess ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      alert: (stats?.expiringAccess ?? 0) > 0,
    },
  ]

  const platformStats = [
    {
      title: 'Тестов создано',
      value: stats?.totalTests ?? 0,
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
    },
    {
      title: 'Всего прохождений',
      value: stats?.totalAttempts ?? 0,
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Завершено',
      value: stats?.completedAttempts ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
  ]

  const completionRate = stats && stats.totalAttempts > 0 
    ? Math.round((stats.completedAttempts / stats.totalAttempts) * 100) 
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Панель администратора</h1>
        <p className="text-muted-foreground">Управление платформой и мониторинг системы</p>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Управление пользователями
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className={stat.alert ? 'border-amber-500' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.alert && stat.value > 0 && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Статистика платформы
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platformStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Completion Rate */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Процент завершения тестов</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <div className="space-y-2">
                <Progress value={completionRate} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {completionRate}% тестов завершено ({stats?.completedAttempts} из {stats?.totalAttempts})
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {!isLoading && (expiringPsychologists.length > 0 || expiredAccessPsychologists.length > 0) && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Требуется внимание
            </CardTitle>
            <CardDescription>Психологи с истекающим или истекшим доступом</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiredAccessPsychologists.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                    Доступ истёк ({expiredAccessPsychologists.length})
                  </h4>
                  <div className="space-y-2">
                    {expiredAccessPsychologists.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-muted-foreground">{p.email}</p>
                        </div>
                        <Badge variant="destructive">
                          Истёк {format(new Date(p.accessExpiresAt!), 'dd.MM.yyyy', { locale: ru })}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {expiringPsychologists.length > 0 && (
                <div>
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                    Истекает в течение 7 дней ({expiringPsychologists.length})
                  </h4>
                  <div className="space-y-2">
                    {expiringPsychologists.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-muted-foreground">{p.email}</p>
                        </div>
                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(p.accessExpiresAt!), 'dd.MM.yyyy', { locale: ru })}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/psychologists">
                  Управление доступом
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blocked Users */}
      {!isLoading && blockedPsychologists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Заблокированные пользователи
            </CardTitle>
            <CardDescription>
              {blockedPsychologists.length} психолог(ов) заблокировано
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Причина</TableHead>
                  <TableHead className="hidden md:table-cell">Дата блокировки</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedPsychologists.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {p.email}
                    </TableCell>
                    <TableCell>
                      {p.blockedReason || <span className="text-muted-foreground">Не указана</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {p.blockedAt 
                        ? format(new Date(p.blockedAt), 'dd.MM.yyyy HH:mm', { locale: ru })
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>Управление пользователями платформы</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start h-auto py-4">
              <Link href="/admin/psychologists">
                <Users className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Управление психологами</p>
                  <p className="text-sm text-muted-foreground">
                    Добавить, заблокировать или удалить
                  </p>
                </div>
                <ArrowRight className="ml-auto h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start h-auto py-4">
              <Link href="/admin/system">
                <Activity className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Мониторинг системы</p>
                  <p className="text-sm text-muted-foreground">
                    Логи и состояние платформы
                  </p>
                </div>
                <ArrowRight className="ml-auto h-5 w-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
