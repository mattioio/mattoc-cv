import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function Footer() {
  const siteSettings = await getPayload({ config: configPromise })
    .then((p) => p.findGlobal({ slug: 'site-settings' }))
    .catch(() => null)

  const contactEmail = siteSettings?.contactEmail || ''
  const cvUrl = siteSettings?.cvDownloadUrl || ''
  const portfolioUrl = siteSettings?.portfolioDownloadUrl || ''
  const social = siteSettings?.socialLinks
  const socialLinks = [
    social?.linkedin && { label: 'LinkedIn', url: social.linkedin },
    social?.twitter && { label: 'Twitter', url: social.twitter },
    social?.instagram && { label: 'Instagram', url: social.instagram },
    social?.dribbble && { label: 'Dribbble', url: social.dribbble },
    social?.github && { label: 'GitHub', url: social.github },
  ].filter(Boolean) as { label: string; url: string }[]

  const resourceLinks = [
    portfolioUrl && { label: 'Portfolio', url: portfolioUrl },
    cvUrl && { label: 'C.V.', url: cvUrl },
  ].filter(Boolean) as { label: string; url: string }[]

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Left — name + email */}
          <div>
            <p
              className="text-sm font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Matthew O&rsquo;Connor
            </p>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="mt-1 block text-sm text-background/50 transition-colors hover:text-background"
              >
                {contactEmail}
              </a>
            )}
          </div>

          {/* Right — link columns */}
          <div className="flex gap-16">
            {socialLinks.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-background/30">
                  Social
                </p>
                <nav className="flex flex-col gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-background/50 transition-colors hover:text-background"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {resourceLinks.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-background/30">
                  Downloads
                </p>
                <nav className="flex flex-col gap-2">
                  {resourceLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-background/50 transition-colors hover:text-background"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-background/10 pt-6">
          <p className="text-xs text-background/30">
            &copy; {new Date().getFullYear()} Matthew O&rsquo;Connor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
