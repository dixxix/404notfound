import { findAttempt, completeAttempt, seedIfEmpty } from '@/lib/server/db'
import { jsonError, jsonOk } from '@/lib/server/http'

export async function POST(request: Request) {
  seedIfEmpty()
  const body = await request.json().catch(() => ({})) as { attemptId?: string }
  
  if (!body.attemptId) return jsonError('attemptId обязателен', 400)

  const attempt = findAttempt(body.attemptId)
  if (!attempt) return jsonError('Прохождение не найдено', 404)
  if (attempt.status === 'completed') return jsonError('Тест уже завершён', 400)

  completeAttempt(body.attemptId)
  return jsonOk({ message: 'Тест успешно завершён' })
}
