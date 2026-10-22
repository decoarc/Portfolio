import { AppShell } from '@/components/AppShell'
import { getSiteContent } from '@/content'
import { Providers } from './providers'
import { HomeRoute } from './routes'

export default function App() {
  const site = getSiteContent('en')

  return (
    <Providers>
      <AppShell content={site}>
        <HomeRoute />
      </AppShell>
    </Providers>
  )
}
