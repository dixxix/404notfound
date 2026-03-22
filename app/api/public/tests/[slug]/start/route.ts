import { findTestBySlug, createAttempt, seedIfEmpty } from '@/lib/server/db'
import { jsonError, jsonOk } from '@/lib/server/http'

type Params = { params: Promise<{ slug: string }> }

export async function POST(request: Request, ctx: Params) {
  seedIfEmpty()
  const { slug } = await ctx.params
  const test = findTestBySlug(slug)
  if (!test) return jsonError('Тест не найден', 404)

  const body = await request.json().catch(() => ({})) as { name?: string; email?: string; age?: number }
  const name = body.name || 'Аноним'
  const email = body.email
  const age = body.age

  const attempt = createAttempt({
    testId: test.id,
    respondentName: name,
    respondentEmail: email,
    respondentAge: age,
  })

  return jsonOk({ attemptId: attempt.id })
}
