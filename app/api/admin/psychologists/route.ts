import { randomUUID } from 'crypto'
import {
  countTestsByOwner,
  findUserByEmail,
  findUserById,
  getDb,
  hashPassword,
  insertUser,
  seedIfEmpty,
} from '@/lib/server/db'
import { jsonError, jsonOk, parseJson, requireAdmin } from '@/lib/server/http'
import { toPsychologistRow } from '@/lib/server/mappers'

export async function GET(request: Request) {
  seedIfEmpty()
  const r = await requireAdmin(request)
  if (!r.ok) return r.response
  const db = getDb()
  const psychs = db.users.filter((u) => u.role === 'psychologist')
  const data = psychs.map((u) => toPsychologistRow(u, countTestsByOwner(u.id)))
  return jsonOk({
    data,
    total: data.length,
    page: 1,
    pageSize: Math.max(1, data.length),
  })
}

export async function POST(request: Request) {
  seedIfEmpty()
  const r = await requireAdmin(request)
  if (!r.ok) return r.response
  try {
    const body = await parseJson<{ 
      email?: string
      name?: string
      password?: string
      accessDays?: number | null
    }>(request)
    if (!body.email || !body.name || !body.password) {
      return jsonError('Заполните все поля', 400)
    }
    if (findUserByEmail(body.email)) {
      return jsonError('Пользователь с таким email уже есть', 409)
    }
    const now = new Date().toISOString()
    const id = randomUUID()
    
    // Calculate access expiration date
    let accessExpiresAt: string | null = null
    if (body.accessDays && body.accessDays > 0) {
      const expiresDate = new Date()
      expiresDate.setDate(expiresDate.getDate() + body.accessDays)
      accessExpiresAt = expiresDate.toISOString()
    }
    
    insertUser({
      id,
      email: body.email.trim(),
      name: body.name.trim(),
      passwordHash: hashPassword(body.password),
      role: 'psychologist',
      blocked: false,
      accessExpiresAt,
      createdAt: now,
    })
    const created = findUserById(id)!
    return jsonOk(toPsychologistRow(created, 0))
  } catch {
    return jsonError('Некорректный запрос', 400)
  }
}
