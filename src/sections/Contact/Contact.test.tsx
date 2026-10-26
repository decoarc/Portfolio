import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { siteEn } from '../../content/en/site.ts'
import { Contact } from './Contact.tsx'

function renderContact() {
  return render(
    <Contact
      index={5}
      copy={siteEn.contact}
      externalHint={siteEn.links.externalHint}
    />,
  )
}

describe('Contact', () => {
  it('é a seção #contact, nomeada pelo h2 do rótulo', () => {
    renderContact()
    const section = screen.getByRole('region', { name: siteEn.contact.label })
    expect(section).toHaveAttribute('id', 'contact')
    expect(
      screen.getByRole('heading', { level: 2, name: siteEn.contact.label }),
    ).toBeVisible()
    expect(screen.getByText('05')).toBeInTheDocument()
    expect(screen.getByText(siteEn.contact.lead)).toBeVisible()
  })

  it.each([
    ['GitHub', 'https://github.com/decoarc'],
    ['LinkedIn', 'https://linkedin.com/in/andrearcodaci'],
  ])('canal %s abre %s em nova aba', (label, href) => {
    renderContact()
    const link = screen.getByRole('link', {
      name: `${label} ${siteEn.links.externalHint}`,
    })
    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('mostra exatamente os dois canais', () => {
    renderContact()
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })
})
