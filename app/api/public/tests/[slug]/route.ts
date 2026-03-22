import { findTestBySlug, seedIfEmpty } from '@/lib/server/db'
import { jsonError, jsonOk } from '@/lib/server/http'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, ctx: Params) {
  seedIfEmpty()
  const { slug } = await ctx.params
  const test = findTestBySlug(slug)
  if (!test) return jsonError('Тест не найден', 404)
  return jsonOk({
    id: test.id,
    title: test.title,
    description: test.description,
    instruction: test.instruction,
    questions: test.questions,
    requiresPersonalData: test.requiresPersonalData,
  })
}
