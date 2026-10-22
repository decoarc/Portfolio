import type { SiteContent } from '../types'

/**
 * Verified English site shell copy.
 * Sources: design brief + legacy prototype (name, role, social URLs, POV).
 * Do not invent employers, metrics, or awards here.
 */
export const siteEn: SiteContent = {
  person: {
    name: 'André Arcodaci',
    role: 'Full Stack Developer',
    locationLabel: 'Based in Brazil',
    shortBio:
      'Building intuitive digital experiences through software, automation, and smart solutions.',
  },
  social: [
    {
      id: 'github',
      label: 'GitHub',
      href: 'https://github.com/decoarc',
      professionalDefault: true,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/andrearcodaci',
      professionalDefault: true,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://instagram.com/arcowill',
      professionalDefault: false,
    },
  ],
  nav: [
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  shell: {
    skipToContent: 'Skip to content',
    homeLandmark: 'Home',
    footerNote: 'Portfolio foundations — content expands as projects are published.',
  },
}
