import { countTestsByOwner, findUserById, seedIfEmpty, deleteUser, updateUser } from '@/lib/server/db'
import { jsonError, jsonOk, parseJson, requireAdmin } from '@/lib/server/http'
import { toPsychologistRow } from '@/lib/server/mappers'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(request: Request, ctx: Params) {
  seedIfEmpty()
  const r = await requireAdmin(request)
  if (!r.ok) return r.response
  const { id } = await ctx.params
  if (id === r.user.id) {
    return jsonError('Нельзя удалить самого себя', 400)
  }
  const u = findUserById(id)
  if (!u || u.role !== 'psychologist') {
    return jsonError('Не найдено', 404)
  }
  deleteUser(id)
  return new Response(null, { status: 204 })
}

export async function PATCH(request: Request, ctx: Params) {
  seedIfEmpty()
  const r = await requireAdmin(request)
  if (!r.ok) return r.response
  const { id } = await ctx.params
  
  const u = findUserById(id)
  if (!u || u.role !== 'psychologist') {
    return jsonError('Не найдено', 404)
  }
  
  try {
    const body = await parseJson<{ 
      name?: string
      email?: string
      accessDays?: number | null
    }>(request)
    
    const updates: Partial<typeof u> = {}
    
    if (body.name) {
      updates.name = body.name.trim()
    }
    
    if (body.email) {
      updates.email = body.email.trim()
    }
    
    // Handle access expiration
    if (body.accessDays !== undefined) {
      if (body.accessDays === null || body.accessDays === 0) {
        updates.accessExpiresAt = null
      } else if (body.accessDays > 0) {
        const expiresDate = new Date()
        expiresDate.setDate(expiresDate.getDate() + body.accessDays)
        updates.accessExpiresAt = expiresDate.toISOString()
      }
    }
    
    updateUser(id, updates)
    const updated = findUserById(id)!
    return jsonOk(toPsychologistRow(updated, countTestsByOwner(id)))
  } catch {
    return jsonError('Некорректный запрос', 400)
  }
}
