import { countTestsByOwner, findUserById, seedIfEmpty, updateUser } from '@/lib/server/db'
import { jsonError, jsonOk, parseJson, requireAdmin } from '@/lib/server/http'
import { toPsychologistRow } from '@/lib/server/mappers'

type Params = { params: Promise<{ id: string }> }

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
    const body = await parseJson<{ accessDays?: number | null }>(request)
    
    let accessExpiresAt: string | null = null
    
    if (body.accessDays === null || body.accessDays === 0) {
      // Unlimited access
      accessExpiresAt = null
    } else if (body.accessDays !== undefined && body.accessDays > 0) {
      // Calculate new expiration from current date
      const expiresDate = new Date()
      expiresDate.setDate(expiresDate.getDate() + body.accessDays)
      accessExpiresAt = expiresDate.toISOString()
    }
    
    updateUser(id, { accessExpiresAt })
    const updated = findUserById(id)!
    return jsonOk(toPsychologistRow(updated, countTestsByOwner(id)))
  } catch {
    return jsonError('Некорректный запрос', 400)
  }
}
