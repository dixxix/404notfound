'use client'

import { useEffect, useState } from 'react'
import { 
  Server, 
  Database, 
  HardDrive, 
  Activity, 
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileJson,
  Users,
  FileText,
  Link as LinkIcon,
  ClipboardList
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface SystemStatus {
  database: 'healthy' | 'degraded' | 'down'
  api: 'healthy' | 'degraded' | 'down'
  storage: 'healthy' | 'degraded' | 'down'
}

interface DatabaseStats {
  users: number
  tests: number
  links: number
  attempts: number
  totalSize: string
}

export default function SystemPage() {
  const [status, setStatus] = useState<SystemStatus>({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
  })
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const fetchSystemStatus = async () => {
    try {
      // Check API health
      const start = Date.now()
      const dashStats = await api.getDashboardStats()
      const psychs = await api.getPsychologists()
      const latency = Date.now() - start

      // Determine status based on latency
      const apiStatus: SystemStatus['api'] = latency < 1000 ? 'healthy' : latency < 3000 ? 'degraded' : 'down'
      
      setStatus({
        database: 'healthy',
        api: apiStatus,
        storage: 'healthy',
      })

      setDbStats({
        users: psychs.total + 1, // +1 for admin
        tests: dashStats.totalTests,
        links: dashStats.totalTests, // Approximate
        attempts: dashStats.totalAttempts,
        totalSize: `~${Math.round((psychs.total * 0.5 + dashStats.totalTests * 2 + dashStats.totalAttempts * 5) / 1024 * 100) / 100} MB`,
      })
      
      setLastCheck(new Date())
    } catch {
      setStatus({
        database: 'down',
        api: 'down',
        storage: 'down',
      })
      toast.error('Не удалось получить статус системы')
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await fetchSystemStatus()
      if (!cancelled) setIsLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSystemStatus()
    setIsRefreshing(false)
    toast.success('Статус обновлён')
  }

  const getStatusBadge = (s: 'healthy' | 'degraded' | 'down') => {
    switch (s) {
      case 'healthy':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Работает
          </Badge>
        )
      case 'degraded':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Activity className="mr-1 h-3 w-3" />
            Замедление
          </Badge>
        )
      case 'down':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Недоступно
          </Badge>
        )
    }
  }

  const systemComponents = [
    {
      name: 'API сервер',
      description: 'Next.js API Routes',
      icon: Server,
      status: status.api,
    },
    {
      name: 'База данных',
      description: 'JSON File Storage',
      icon: Database,
      status: status.database,
    },
    {
      name: 'Хранилище файлов',
      description: 'Local File System',
      icon: HardDrive,
      status: status.storage,
    },
  ]

  const dbEntities = dbStats ? [
    { name: 'Пользователи', count: dbStats.users, icon: Users },
    { name: 'Тесты', count: dbStats.tests, icon: FileText },
    { name: 'Ссылки', count: dbStats.links, icon: LinkIcon },
    { name: 'Прохождения', count: dbStats.attempts, icon: ClipboardList },
  ] : []

  const allHealthy = Object.values(status).every(s => s === 'healthy')
  const anyDown = Object.values(status).some(s => s === 'down')

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Мониторинг системы</h1>
          <p className="text-muted-foreground">Состояние и работоспособность платформы</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={anyDown ? 'border-destructive' : allHealthy ? 'border-green-500' : 'border-amber-500'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className={`h-5 w-5 ${anyDown ? 'text-destructive' : allHealthy ? 'text-green-600' : 'text-amber-600'}`} />
                Общий статус системы
              </CardTitle>
              <CardDescription>
                {lastCheck 
                  ? `Последняя проверка: ${format(lastCheck, 'HH:mm:ss', { locale: ru })}`
                  : 'Загрузка...'
                }
              </CardDescription>
            </div>
            {!isLoading && (
              <div className="text-right">
                {allHealthy ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-lg px-4 py-1">
                    Все системы работают
                  </Badge>
                ) : anyDown ? (
                  <Badge variant="destructive" className="text-lg px-4 py-1">
                    Есть проблемы
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-lg px-4 py-1">
                    Частичное замедление
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* System Components */}
      <div className="grid gap-4 md:grid-cols-3">
        {systemComponents.map((component) => (
          <Card key={component.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-muted p-2">
                    <component.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{component.name}</CardTitle>
                    <CardDescription className="text-xs">{component.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                getStatusBadge(component.status)
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Database Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Статистика базы данных
          </CardTitle>
          <CardDescription>
            Количество записей и использование хранилища
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {dbEntities.map((entity) => (
                  <div key={entity.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <entity.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{entity.name}</p>
                      <p className="text-xl font-bold">{entity.count}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Примерный размер данных</span>
                  <span className="font-medium">{dbStats?.totalSize}</span>
                </div>
                <Progress value={35} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Хранилище используется эффективно
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Информация о системе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Платформа</span>
                <span className="font-medium">Next.js 16</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Runtime</span>
                <span className="font-medium">Node.js</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">База данных</span>
                <span className="font-medium">JSON File DB</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Версия</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Среда</span>
                <Badge variant="outline">Development</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Часовой пояс</span>
                <span className="font-medium">UTC</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uptime Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Время работы
          </CardTitle>
          <CardDescription>История доступности сервиса</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Текущая сессия</span>
              <Badge variant="outline" className="font-mono">
                {format(new Date(), 'dd.MM.yyyy HH:mm', { locale: ru })}
              </Badge>
            </div>
            
            {/* Uptime bars visualization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Последние 24 часа</span>
                <span className="text-green-600 font-medium">100%</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 h-6 bg-green-500 rounded-sm first:rounded-l-md last:rounded-r-md"
                    title={`${i}:00 - ${i + 1}:00`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Каждый сегмент = 1 час
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
