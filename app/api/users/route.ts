import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { ILink } from '@/app/types/ILink'
import { IUser } from '@/app/types/IUser'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { email, password }: IUser = await req.json()

  const createdAt = Date.now()
  const hash = bcryptjs.hashSync(password)

  const DB = getRequestContext().env.DB

  let id = uuidv4()
  while (true) {
    const { results }: D1Result<ILink> = await DB.prepare(
      `SELECT id FROM Users WHERE id = '${id}'`
    ).all()
    if (results.length == 0) break
    id = uuidv4()
  }

  const query = `INSERT INTO Users (id, email, password, createdAt) VALUES ('${id}','${email}', '${hash}', '${createdAt}')`
  const prepare = DB.prepare(query)

  try {
    const { success }: D1Result = await prepare.all()
    return NextResponse.json({
      success,
      message: 'Usuário criado com sucesso!',
    })
  } catch (error: any) {
    if (error.message == 'D1_ERROR: UNIQUE constraint failed: Users.email') {
      return NextResponse.json({
        success: false,
        message: 'Este e-mail já existe!',
      })
    }

    return NextResponse.json({ success: false, message: error.message })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const email = searchParams.get('email')

  let query: string = ''
  if (userId) {
    query = `SELECT * FROM Users WHERE id='${userId}'`
  } else if (email) {
    query = `SELECT * FROM Users WHERE email='${email}'`
  } else {
    query = 'SELECT * FROM Users'
  }

  const DB = getRequestContext().env.DB
  const prepare = DB.prepare(query)

  try {
    const { success, results }: D1Result<IUser> = await prepare.all()

    if (results.length == 0) {
      throw new Error('Este usuário não existe!')
    }

    return NextResponse.json({
      success,
      data: results,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
