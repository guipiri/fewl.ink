import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

interface DTOLink {
  slug: string
  redirectTo: string
  userId: string
}

export async function POST(req: NextRequest) {
  const { slug, redirectTo, userId }: DTOLink = await req.json()

  const createdAt = Date.now()

  const DB = getRequestContext().env.DB
  const query = `INSERT INTO Links (slug, redirectTo, userId, createdAt) VALUES ('${slug}','${redirectTo}', '${userId}', '${createdAt}' )`
  const prepare = DB.prepare(query)

  try {
    const { success }: D1Result = await prepare.all()
    return NextResponse.json({ success, message: 'Link criado com sucesso!' })
  } catch (error: any) {
    if (error.message == 'D1_ERROR: UNIQUE constraint failed: Links.slug') {
      return NextResponse.json({
        success: false,
        message: 'Este apelido já existe!',
      })
    }
    return NextResponse.json({ success: false, message: error.message })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  const DB = getRequestContext().env.DB
  const query = `SELECT * FROM Links WHERE slug='${slug}'`
  const prepare = DB.prepare(query)

  try {
    const {
      success,
      results: [data],
    }: D1Result = await prepare.all()

    if (!data) {
      throw new Error('Este apelido não existe!')
    }

    return NextResponse.json({
      success,
      data,
    })
  } catch (error: any) {
    if (error.message == 'D1_ERROR: UNIQUE constraint failed: Links.slug') {
      return NextResponse.json({
        success: false,
        message: 'Este apelido já existe!',
      })
    }
    return NextResponse.json({ success: false, message: error.message })
  }
}
