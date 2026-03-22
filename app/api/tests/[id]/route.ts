import { deleteTest, findTest, seedIfEmpty, updateTest } from '@/lib/server/db'
import { jsonError, jsonOk, parseJson, requireUser } from '@/lib/server/http'
import { toApiTest } from '@/lib/server/mappers'
import type { Test } from '@/lib/types'

function allow(ownerId: string, userId: string, role: string) {
  return role === 'admin' || ownerId === userId
}

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, ctx: Params) {
  seedIfEmpty()
  const r = await requireUser(request)
  if (!r.ok) return r.response
  const { id } = await ctx.params
  const t = findTest(id)
  if (!t || !allow(t.ownerId, r.user.id, r.user.role)) {
    return jsonError('Не найдено', 404)
  }
  return jsonOk(toApiTest(t))
}

export async function PUT(request: Request, ctx: Params) {
  seedIfEmpty()
  const r = await requireUser(request)
  if (!r.ok) return r.response
  const { id } = await ctx.params
  const t = findTest(id)
  if (!t || !allow(t.ownerId, r.user.id, r.user.role)) {
    return jsonError('Не найдено', 404)
  }
  try {
    const body = await parseJson<Partial<Test>>(request)
    const now = new Date().toISOString()
    // Только поля из JSON — иначе при сохранении затирались данные, не попавшие в ответ GET (formulas, html-шаблоны и т.д.).
    updateTest(id, {
      title: 'title' in body ? (body.title ?? t.title) : t.title,
      description: 'description' in body ? (body.description ?? t.description) : t.description,
      instruction: 'instruction' in body ? (body.instruction ?? t.instruction) : t.instruction,
      questions: 'questions' in body ? (body.questions ?? t.questions) : t.questions,
      formulas: 'formulas' in body ? body.formulas ?? t.formulas : t.formulas,
      metrics: 'metrics' in body ? body.metrics ?? t.metrics : t.metrics,
      clientReportTemplate:
        'clientReportTemplate' in body ? body.clientReportTemplate ?? t.clientReportTemplate : t.clientReportTemplate,
      professionalReportTemplate:
        'professionalReportTemplate' in body
          ? body.professionalReportTemplate ?? t.professionalReportTemplate
          : t.professionalReportTemplate,
      clientReportHtmlTemplate:
        'clientReportHtmlTemplate' in body
          ? body.clientReportHtmlTemplate ?? t.clientReportHtmlTemplate
          : t.clientReportHtmlTemplate,
      professionalReportHtmlTemplate:
        'professionalReportHtmlTemplate' in body
          ? body.professionalReportHtmlTemplate ?? t.professionalReportHtmlTemplate
          : t.professionalReportHtmlTemplate,
      scaleInterpretations:
        'scaleInterpretations' in body ? body.scaleInterpretations ?? t.scaleInterpretations : t.scaleInterpretations,
      requiresPersonalData:
        'requiresPersonalData' in body ? body.requiresPersonalData ?? t.requiresPersonalData : t.requiresPersonalData,
      showClientReport: 'showClientReport' in body ? body.showClientReport ?? t.showClientReport : t.showClientReport,
      showResultsImmediately:
        'showResultsImmediately' in body ? body.showResultsImmediately ?? t.showResultsImmediately : t.showResultsImmediately,
      publicSlug: 'publicSlug' in body ? body.publicSlug ?? t.publicSlug : t.publicSlug,
      updatedAt: now,
    })
    return jsonOk(toApiTest(findTest(id)!))
  } catch {
    return jsonError('Некорректный запрос', 400)
  }
}

export async function DELETE(request: Request, ctx: Params) {
  seedIfEmpty()
  const r = await requireUser(request)
  if (!r.ok) return r.response
  const { id } = await ctx.params
  const t = findTest(id)
  if (!t || !allow(t.ownerId, r.user.id, r.user.role)) {
    return jsonError('Не найдено', 404)
  }
  deleteTest(id)
  return new Response(null, { status: 204 })
}
