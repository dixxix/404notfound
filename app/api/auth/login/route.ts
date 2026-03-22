import { NextResponse } from 'next/server'

import {
  findUserByEmail,
  seedIfEmpty,
  verifyPassword,
  updateUser,
} from '@/lib/server/db'
import { jsonError, parseJson } from '@/lib/server/http'
import {
  attachRefreshCookieToResponse,
  signAccessToken,
  signRefreshToken,
} from '@/lib/server/auth'

export async function POST(request: Request) {
  seedIfEmpty()
  try {
    const body = await parseJson<{ email?: string; password?: string }>(request)
    const email = (body.email || '').trim().toLowerCase()
    if (!email || !body.password) {
      return jsonError('Email и пароль обязательны', 400)
    }
    const user = findUserByEmail(email)
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return jsonError('Неверный email или пароль', 401)
    }
if (user.blocked) {
      return jsonError('Аккаунт заблокирован', 403)
    }
    
    // Check access expiration for psychologists
    if (user.role === 'psychologist' && user.accessExpiresAt) {
      const expiresDate = new Date(user.accessExpiresAt)
      if (expiresDate < new Date()) {
        return jsonError('Срок доступа истёк. Обратитесь к администратору.', 403)
      }
    }
    
    // Update last login time
    updateUser(user.id, { lastLoginAt: new Date().toISOString() })
    
    const token = await signAccessToken(user)
    const refresh = await signRefreshToken(user.id)
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar ?? null,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    })
    attachRefreshCookieToResponse(res, refresh)
    return res
  } catch {
    return jsonError('Некорректный запрос', 400)
  }
}
