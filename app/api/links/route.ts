import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { ILink } from '@/app/types/ILink'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { slug, redirectTo, userId }: ILink = await req.json()

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
  const userId = searchParams.get('userId')

  let query: string = ''
  if (slug) {
    query = `SELECT * FROM Links WHERE slug='${slug}'`
  } else if (userId) {
    query = `SELECT * FROM Links WHERE userId='${userId}'`
  } else {
    query = 'SELECT * FROM Links'
  }

  const DB = getRequestContext().env.DB
  const prepare = DB.prepare(query)

  try {
    const { success, results }: D1Result<ILink> = await prepare.all()

    if (results.length == 0) {
      throw new Error('Este apelido não existe!')
    }

    return NextResponse.json({
      success,
      data: results,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
