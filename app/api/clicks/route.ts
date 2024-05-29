import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const initialDate = searchParams.get('initialDate')
  const finalDate = searchParams.get('finalDate')

  const DB = getRequestContext().env.DB

  try {
    if (!slug) throw new Error('Parâmetro [slug] faltando na URL!')

    const query =
      'SELECT count(slug) ' +
      'FROM Clicks ' +
      `WHERE (slug='${slug}' AND date >= ${new Date(
        initialDate ? initialDate : 0
      ).getTime()} AND date <= ${
        finalDate ? new Date(finalDate).getTime() : Date.now()
      });`

    const prepare = DB.prepare(query)
    const {
      success,
      results: [data],
    }: D1Result<{ 'count(slug)': number }> = await prepare.all()

    return NextResponse.json({
      success,
      data: data['count(slug)'],
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
