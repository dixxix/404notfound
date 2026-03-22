import { findAttempt, updateAttemptAnswers, seedIfEmpty } from '@/lib/server/db'
import { jsonError, jsonOk } from '@/lib/server/http'
import type { Answer } from '@/lib/types'

export async function POST(request: Request) {
  seedIfEmpty()
  const body = await request.json().catch(() => ({})) as { attemptId?: string; answers?: Answer[] }
  
  if (!body.attemptId) return jsonError('attemptId обязателен', 400)
  if (!Array.isArray(body.answers)) return jsonError('answers обязателен', 400)

  const attempt = findAttempt(body.attemptId)
  if (!attempt) return jsonError('Прохождение не найдено', 404)
  if (attempt.status === 'completed') return jsonError('Тест уже завершён', 400)

  updateAttemptAnswers(body.attemptId, body.answers)
  return jsonOk({ ok: true })
}
