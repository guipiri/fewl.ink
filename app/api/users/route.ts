import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'edge'

interface DTOUser {
  email: string
  password: string
}

export async function POST(req: NextRequest) {
  const { email, password }: DTOUser = await req.json()

  const createdAt = Date.now()
  const id = uuidv4()
  const hash = bcryptjs.hashSync(password)

  const DB = getRequestContext().env.DB
  const query = `INSERT INTO Users (id, email, password, createdAt) VALUES ('${id}','${email}', '${hash}', '${createdAt}')`
  const prepare = DB.prepare(query)

  try {
    const { success }: D1Result = await prepare.all()
    return NextResponse.json({
      success,
      message: 'Usuário criado com sucesso!',
    })
  } catch (error: any) {
    if (error.message == 'D1_ERROR: UNIQUE constraint failed: Users.id') {
      return NextResponse.json({
        success: false,
        message: 'Este id já existe!',
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
