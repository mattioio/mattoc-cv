import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Header } from './Header'

export async function HeaderWrapper() {
  const payload = await getPayload({ config: configPromise })

  const [siteSettings, navigation] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.findGlobal({ slug: 'navigation' }).catch(() => null),
  ])

  const siteName = siteSettings?.siteName || 'Matthew O\'Connor'
  const links = (navigation?.links || []) as { label: string; url: string }[]

  return <Header siteName={siteName} links={links} />
}
