import { getRequestContext } from '@cloudflare/next-on-pages'
import { redirect, notFound } from 'next/navigation'
import { ILink } from '../types/ILink'

export const runtime = 'edge'

export default async function redirectRoute({
  params: { slug },
}: {
  params: { slug: string }
}) {
  const DB = getRequestContext().env.DB
  const query = `SELECT redirectTo FROM Links WHERE slug='${slug}'`
  const prepare = DB.prepare(query)
  const now = Date.now()
  let redirectPath: () => string | never = notFound
  try {
    const { results }: D1Result<ILink> = await prepare.all()

    if (results.length > 0) {
      await DB.prepare(
        `INSERT INTO Clicks (slug, date) VALUES ('${slug}', '${now}')`
      ).all()

      redirectPath = () => results[0].redirectTo
    }
  } catch (erro) {
    notFound()
  }
  redirect(redirectPath())
}
