import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

interface DTOLink {
  slug: string
  redirectTo: string
}

export async function POST(req: NextRequest) {
  const { slug, redirectTo }: DTOLink = await req.json()

  const createdAt = Date.now()

  const DB = getRequestContext().env.DB
  const query = `INSERT INTO Links (slug, redirectTo, createdAt) VALUES ('${slug}','${redirectTo}','${createdAt}' )`
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
