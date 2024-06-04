import { Session, getServerSession } from 'next-auth'
import LinkShortnerForms from './components/LinkShortnerForms'

export default async function Home() {
  const session = await getServerSession()
  console.log(session?.user)

  return (
    <div>
      <LinkShortnerForms />
    </div>
  )
}
