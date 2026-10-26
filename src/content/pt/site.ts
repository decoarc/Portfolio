import type { SiteContent } from '../types.ts'

/**
 * Copy do site em português. Copy real é tradução fiel de `en/site.ts`, sem
 * afirmação nova; hero e `work` vêm da Fase 0.
 */
export const sitePt: SiteContent = {
  meta: {
    homeTitle: 'André Arcodaci — Desenvolvedor Full Stack',
    titleSuffix: ' — André Arcodaci',
  },
  shell: {
    skipToContent: 'Pular para o conteúdo',
    homeMark: 'André Arcodaci',
    localeSwitch: 'English',
    footerNote: 'André Arcodaci — Desenvolvedor Full Stack',
  },
  person: {
    name: 'André Arcodaci',
    role: 'Desenvolvedor Full Stack',
    location: 'No Brasil',
  },
  hero: {
    statement:
      'Construo interfaces, APIs e automação — sistemas que você consegue rodar, ler e entender.',
    ctaPrimary: 'Trabalhos selecionados',
    ctaSecondary: 'Entrar em contato',
    metaLeft: 'BR · Remoto',
    metaRight: 'Portfólio 2026',
  },
  release: {
    label: 'Sumário',
    entries: {
      work: 'Trabalhos selecionados',
      approach: 'Abordagem',
      about: 'Sobre',
      interests: 'Interesses',
      contact: 'Contato',
    },
  },
  projectType: {
    verified: 'Verificado',
    concept: 'Estudo conceitual',
  },
  links: {
    labels: { live: 'Demo ao vivo', repo: 'Repositório' },
    externalHint: 'abre em nova aba',
  },
  work: {
    label: 'Trabalhos selecionados',
    intro:
      'Cada entrada é honesta sobre o que é: trabalho verificado ou estudo conceitual.',
    previewNote: 'Estudo de caso em breve',
  },
  approach: {
    label: 'Abordagem',
    intro: 'Como costumo trabalhar, seja qual for a stack.',
    // Sem copy real de abordagem ainda: os três itens são mock.
    items: [
      {
        title: 'Ler o sistema primeiro',
        body: 'Antes de mudar qualquer coisa, sigo por onde os dados entram, onde ficam guardados e quem depende deles. A maioria das surpresas mora nas junções.',
        mock: true,
      },
      {
        title: 'Passos pequenos e verificáveis',
        body: 'Prefiro mudanças que dá para revisar de uma vez e confirmar com um teste ou um comando a reescritas grandes, difíceis de acompanhar.',
        mock: true,
      },
      {
        title: 'Registrar a decisão',
        body: 'Os trade-offs vão para uma nota curta ao lado do código, para que a próxima pessoa saiba por que está assim e o que justificaria mudar.',
        mock: true,
      },
    ],
  },
  about: {
    label: 'Sobre',
    lead: 'Sou desenvolvedor full stack no Brasil e construo software onde interfaces encontram dados e automação.',
    body: 'Me importo com sistemas claros: APIs em que dá para confiar, interfaces que continuam compreensíveis e ferramentas que ajudam desenvolvedores a avançar com segurança. Meus interesses passam por stacks web, arquitetura, aplicativos desktop, programação gráfica e ferramentas de desenvolvimento assistidas por IA local — sempre com os pés em entregas reais, não em currículo de fachada.',
    stackLabel: 'Trabalho com',
    stack: [
      'PHP',
      'JavaScript',
      'TypeScript',
      'React',
      'APIs REST',
      'MySQL',
      'Git',
      'Docker',
    ],
  },
  interests: {
    label: 'Interesses',
    items: ['Games', 'Desenho', 'Leitura', 'Viagens'],
  },
  contact: {
    label: 'Contato',
    lead: 'Aberto a vagas, colaborações e conversas técnicas de qualidade.',
    channels: [
      { id: 'github', label: 'GitHub', href: 'https://github.com/decoarc' },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/andrearcodaci',
      },
    ],
  },
  caseStudy: {
    backToWork: 'Voltar aos trabalhos selecionados',
    roleLabel: 'Papel',
    yearLabel: 'Período',
    stackLabel: 'Stack',
    linksLabel: 'Links',
    previewNotice:
      'Uma visão técnica baseada em detalhes de implementação verificados. Estudo de caso completo em andamento.',
    conceptNotice:
      'Estudo conceitual — uma exploração de como eu abordaria o problema. Não é trabalho entregue: sem usuários, sem resultados em produção.',
  },
  notFound: {
    title: 'Página não encontrada',
    body: 'Esta rota não está disponível. O projeto pode não estar publicado, estar incompleto, ou o endereço pode ter sido digitado errado.',
    homeLabel: 'Voltar ao início',
  },
}
