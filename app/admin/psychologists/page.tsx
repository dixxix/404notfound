'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreHorizontal,
  Ban,
  Unlock,
  Trash2,
  Loader2,
  Pencil,
  Clock,
  CalendarPlus,
  AlertTriangle,
  Filter,
  UserCheck,
  UserX,
} from 'lucide-react'
import { format, isBefore, isAfter, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Empty } from '@/components/ui/empty'
import { Textarea } from '@/components/ui/textarea'
import { useAdmin } from '@/lib/contexts'
import type { Psychologist } from '@/lib/types'
import { fioFieldsSchema, formatFullName, parseFullName } from '@/lib/fio'

const createSchema = fioFieldsSchema.extend({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  accessDays: z.coerce.number().int().min(0).optional(),
})

type CreateForm = z.infer<typeof createSchema>

const editSchema = fioFieldsSchema.extend({
  email: z.string().email('Введите корректный email'),
  accessDays: z.coerce.number().int().min(0).optional(),
})

type EditForm = z.infer<typeof editSchema>

type FilterType = 'all' | 'active' | 'blocked' | 'expiring' | 'expired'

export default function PsychologistsPage() {
  const {
    psychologists,
    isLoading,
    fetchPsychologists,
    createPsychologist,
    updatePsychologist,
    blockPsychologist,
    deletePsychologist,
  } = useAdmin()

  const [displayPsychologists, setDisplayPsychologists] = useState<Psychologist[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Psychologist | null>(null)
  const [extendTarget, setExtendTarget] = useState<Psychologist | null>(null)
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; id: string | null; name: string }>({
    open: false,
    id: null,
    name: '',
  })
  const [blockReason, setBlockReason] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [extendDays, setExtendDays] = useState('30')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  })

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  })

  useEffect(() => {
    fetchPsychologists().catch(() => {
      toast.error('Не удалось загрузить список психологов')
      setDisplayPsychologists([])
    })
  }, [fetchPsychologists])

  useEffect(() => {
    setDisplayPsychologists(psychologists)
  }, [psychologists])

  // Apply filters
  const now = new Date()
  const weekFromNow = addDays(now, 7)

  const getFilteredPsychologists = () => {
    let filtered = displayPsychologists

    // Apply status filter
    switch (filter) {
      case 'active':
        filtered = filtered.filter(p => !p.isBlocked)
        break
      case 'blocked':
        filtered = filtered.filter(p => p.isBlocked)
        break
      case 'expiring':
        filtered = filtered.filter(p => {
          if (!p.accessExpiresAt || p.isBlocked) return false
          const expiresDate = new Date(p.accessExpiresAt)
          return isAfter(expiresDate, now) && isBefore(expiresDate, weekFromNow)
        })
        break
      case 'expired':
        filtered = filtered.filter(p => {
          if (!p.accessExpiresAt || p.isBlocked) return false
          return isBefore(new Date(p.accessExpiresAt), now)
        })
        break
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }

  const filteredPsychologists = getFilteredPsychologists()

  // Stats for tabs
  const stats = {
    all: displayPsychologists.length,
    active: displayPsychologists.filter(p => !p.isBlocked).length,
    blocked: displayPsychologists.filter(p => p.isBlocked).length,
    expiring: displayPsychologists.filter(p => {
      if (!p.accessExpiresAt || p.isBlocked) return false
      const expiresDate = new Date(p.accessExpiresAt)
      return isAfter(expiresDate, now) && isBefore(expiresDate, weekFromNow)
    }).length,
    expired: displayPsychologists.filter(p => {
      if (!p.accessExpiresAt || p.isBlocked) return false
      return isBefore(new Date(p.accessExpiresAt), now)
    }).length,
  }

  const handleCreate = async (data: CreateForm) => {
    setIsCreating(true)
    try {
      await createPsychologist({
        name: formatFullName(data),
        email: data.email,
        password: data.password,
        accessDays: data.accessDays ?? null,
      })
      toast.success('Психолог добавлен')
      setCreateOpen(false)
      reset()
    } catch {
      toast.error('Не удалось создать аккаунт')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditOpen = (p: Psychologist) => {
    setEditTarget(p)
    editForm.reset({ ...parseFullName(p.name), email: p.email, accessDays: undefined })
  }

  const handleEditSubmit = async (data: EditForm) => {
    if (!editTarget) return
    setIsEditing(true)
    try {
      await updatePsychologist(editTarget.id, {
        name: formatFullName(data),
        email: data.email,
        accessDays: data.accessDays ?? null,
      })
      toast.success('Данные обновлены')
      setEditTarget(null)
    } catch {
      toast.error('Не удалось сохранить изменения')
    } finally {
      setIsEditing(false)
    }
  }

  const handleExtendAccess = async () => {
    if (!extendTarget) return
    const days = parseInt(extendDays, 10)
    if (isNaN(days) || days < 0) {
      toast.error('Введите корректное количество дней')
      return
    }
    try {
      await updatePsychologist(extendTarget.id, { accessDays: days })
      toast.success(days === 0 ? 'Доступ сделан бессрочным' : `Доступ продлён на ${days} дней`)
      setExtendTarget(null)
      setExtendDays('30')
      // Refresh the list
      await fetchPsychologists()
    } catch {
      toast.error('Не удалось продлить доступ')
    }
  }

  const handleBlock = async (id: string, blocked: boolean) => {
    try {
      await blockPsychologist(id, blocked, blocked ? blockReason : undefined)
      setDisplayPsychologists((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isBlocked: blocked } : p))
      )
      toast.success(blocked ? 'Психолог заблокирован' : 'Психолог разблокирован')
      setBlockDialog({ open: false, id: null, name: '' })
      setBlockReason('')
    } catch {
      toast.error('Не удалось изменить статус')
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    try {
      await deletePsychologist(deleteDialog.id)
      setDisplayPsychologists((prev) => prev.filter((p) => p.id !== deleteDialog.id))
      toast.success('Психолог удалён')
    } catch {
      toast.error('Не удалось удалить')
    }
    setDeleteDialog({ open: false, id: null })
  }

  const getAccessStatus = (p: Psychologist) => {
    if (p.isBlocked) {
      return { status: 'blocked', label: 'Заблокирован', variant: 'destructive' as const }
    }
    if (!p.accessExpiresAt) {
      return { status: 'unlimited', label: 'Бессрочно', variant: 'default' as const }
    }
    const expiresDate = new Date(p.accessExpiresAt)
    if (isBefore(expiresDate, now)) {
      return { status: 'expired', label: 'Истёк', variant: 'destructive' as const }
    }
    if (isBefore(expiresDate, weekFromNow)) {
      return { status: 'expiring', label: 'Истекает', variant: 'outline' as const }
    }
    return { status: 'active', label: 'Активен', variant: 'default' as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Психологи</h1>
          <p className="text-muted-foreground">Управление аккаунтами и доступом</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить психолога
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый психолог</DialogTitle>
              <DialogDescription>
                Создайте аккаунт для нового психолога
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="lastName">Фамилия</FieldLabel>
                  <Input
                    id="lastName"
                    placeholder="Иванов"
                    {...register('lastName')}
                    disabled={isCreating}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="firstName">Имя</FieldLabel>
                  <Input
                    id="firstName"
                    placeholder="Иван"
                    {...register('firstName')}
                    disabled={isCreating}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="middleName">Отчество</FieldLabel>
                  <Input
                    id="middleName"
                    placeholder="Иванович"
                    {...register('middleName')}
                    disabled={isCreating}
                  />
                  {errors.middleName && (
                    <p className="text-sm text-destructive">{errors.middleName.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    {...register('email')}
                    disabled={isCreating}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="accessDays">Срок доступа (дней, 0 = бессрочно)</FieldLabel>
                  <Input
                    id="accessDays"
                    type="number"
                    placeholder="30"
                    {...register('accessDays')}
                    disabled={isCreating}
                  />
                  {errors.accessDays && (
                    <p className="text-sm text-destructive">{errors.accessDays.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Пароль</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    {...register('password')}
                    disabled={isCreating}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Создать
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список психологов</CardTitle>
          <CardDescription>
            {filteredPsychologists.length} из {displayPsychologists.length} записей
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  Все ({stats.all})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs sm:text-sm">
                  <UserCheck className="mr-1 h-3 w-3 hidden sm:inline" />
                  Активные ({stats.active})
                </TabsTrigger>
                <TabsTrigger value="blocked" className="text-xs sm:text-sm">
                  <UserX className="mr-1 h-3 w-3 hidden sm:inline" />
                  Заблокированные ({stats.blocked})
                </TabsTrigger>
                <TabsTrigger value="expiring" className="text-xs sm:text-sm">
                  <Clock className="mr-1 h-3 w-3 hidden sm:inline" />
                  Истекает ({stats.expiring})
                </TabsTrigger>
                <TabsTrigger value="expired" className="text-xs sm:text-sm">
                  <AlertTriangle className="mr-1 h-3 w-3 hidden sm:inline" />
                  Истёк ({stats.expired})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading && displayPsychologists.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredPsychologists.length === 0 ? (
            <Empty
              title="Нет психологов"
              description={filter !== 'all' ? 'Нет психологов с выбранным статусом' : 'Добавьте первого психолога'}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Тестов</TableHead>
                    <TableHead>Доступ</TableHead>
                    <TableHead className="hidden lg:table-cell">Дата регистрации</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPsychologists.map((psychologist) => {
                    const accessInfo = getAccessStatus(psychologist)
                    return (
                      <TableRow key={psychologist.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{psychologist.name}</p>
                            <p className="text-sm text-muted-foreground md:hidden">
                              {psychologist.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {psychologist.email}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {psychologist.testsCount}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={accessInfo.variant}>
                              {accessInfo.label}
                            </Badge>
                            {psychologist.accessExpiresAt && !psychologist.isBlocked && (
                              <p className="text-xs text-muted-foreground">
                                до {format(new Date(psychologist.accessExpiresAt), 'dd.MM.yyyy', { locale: ru })}
                              </p>
                            )}
                            {psychologist.blockedReason && (
                              <p className="text-xs text-destructive">
                                {psychologist.blockedReason}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {format(new Date(psychologist.createdAt), 'dd.MM.yyyy', { locale: ru })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditOpen(psychologist)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setExtendTarget(psychologist)}>
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                Продлить доступ
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {psychologist.isBlocked ? (
                                <DropdownMenuItem
                                  onClick={() => handleBlock(psychologist.id, false)}
                                >
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Разблокировать
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => setBlockDialog({ 
                                    open: true, 
                                    id: psychologist.id,
                                    name: psychologist.name
                                  })}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Заблокировать
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  setDeleteDialog({ open: true, id: psychologist.id })
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать психолога</DialogTitle>
            <DialogDescription>Изменение данных аккаунта</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(handleEditSubmit)}
            className="space-y-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-lastName">Фамилия</FieldLabel>
                <Input
                  id="edit-lastName"
                  {...editForm.register('lastName')}
                  disabled={isEditing}
                />
                {editForm.formState.errors.lastName && (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.lastName.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-firstName">Имя</FieldLabel>
                <Input
                  id="edit-firstName"
                  {...editForm.register('firstName')}
                  disabled={isEditing}
                />
                {editForm.formState.errors.firstName && (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.firstName.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-middleName">Отчество</FieldLabel>
                <Input
                  id="edit-middleName"
                  {...editForm.register('middleName')}
                  disabled={isEditing}
                />
                {editForm.formState.errors.middleName && (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.middleName.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                <Input
                  id="edit-email"
                  type="email"
                  {...editForm.register('email')}
                  disabled={isEditing}
                />
                {editForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.email.message}
                  </p>
                )}
              </Field>
            </FieldGroup>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isEditing}>
                {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Extend Access Dialog */}
      <Dialog open={!!extendTarget} onOpenChange={(o) => !o && setExtendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Продлить доступ</DialogTitle>
            <DialogDescription>
              Установите срок доступа для {extendTarget?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {extendTarget?.accessExpiresAt && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Текущий срок доступа:</p>
                <p className="font-medium">
                  до {format(new Date(extendTarget.accessExpiresAt), 'dd MMMM yyyy', { locale: ru })}
                </p>
              </div>
            )}
            <Field>
              <FieldLabel>Продлить на (дней)</FieldLabel>
              <Select value={extendDays} onValueChange={setExtendDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 дней</SelectItem>
                  <SelectItem value="14">14 дней</SelectItem>
                  <SelectItem value="30">30 дней</SelectItem>
                  <SelectItem value="60">60 дней</SelectItem>
                  <SelectItem value="90">90 дней</SelectItem>
                  <SelectItem value="180">180 дней</SelectItem>
                  <SelectItem value="365">1 год</SelectItem>
                  <SelectItem value="0">Бессрочно</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setExtendTarget(null)}>
                Отмена
              </Button>
              <Button onClick={handleExtendAccess}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Применить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={blockDialog.open} onOpenChange={(o) => !o && setBlockDialog({ open: false, id: null, name: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заблокировать психолога</DialogTitle>
            <DialogDescription>
              Вы собираетесь заблокировать {blockDialog.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <FieldLabel>Причина блокировки (необязательно)</FieldLabel>
              <Textarea
                placeholder="Укажите причину блокировки..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </Field>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setBlockDialog({ open: false, id: null, name: '' })
                  setBlockReason('')
                }}
              >
                Отмена
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => blockDialog.id && handleBlock(blockDialog.id, true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Заблокировать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить психолога?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все данные психолога, включая тесты и
              результаты, будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
