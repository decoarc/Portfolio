import type { SiteContent } from '../types.ts'

/**
 * Copy do site em português. Copy real é tradução fiel de `en/site.ts`, sem
 * afirmação nova; hero e `work` vêm da Fase 0.
 */
export const sitePt: SiteContent = {
  meta: {
    homeTitle: 'André Arcodaci — Desenvolvedor Full Stack',
    titleSuffix: ' — André Arcodaci',
    // Revisar na Fase 5 com o conteúdo real
    description:
      'Portfólio de André Arcodaci, desenvolvedor full stack no Brasil: interfaces, APIs e automação, com case studies de trabalhos verificados.',
    ogImageAlt: 'André Arcodaci — Desenvolvedor Full Stack, portfólio',
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
    ctaPrimary: 'Projetos pessoais',
    ctaSecondary: 'Entrar em contato',
    metaLeft: 'BR · Remoto',
    metaRight: 'Portfólio 2026',
  },
  release: {
    label: 'Sumário',
    entries: {
      trajectory: 'Trajetória',
      tools: 'Ferramentas',
      work: 'Projetos pessoais',
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
  // Dados do LinkedIn e da lista de ferramentas do dono (2026-10-28).
  trajectory: {
    label: 'Trajetória',
    intro: 'Da engenharia mecânica ao desenvolvimento de software.',
    experienceLabel: 'Experiência',
    educationLabel: 'Formação',
    experience: [
      {
        period: 'Out 2025 — hoje',
        start: '2025-10',
        current: true,
        mode: 'Remoto',
        role: 'Software Developer',
        company: 'Witek',
        contract: 'Tempo integral',
        summary:
          'Desenvolvimento full stack para o setor imobiliário e registral, em escala nacional: novas features, melhorias, correções e otimização de serviços críticos usados por cartórios.',
        tech: ['PHP', 'JavaScript', 'MySQL', 'Git', 'Docker', 'Scrum', 'Azure'],
      },
    ],
    education: [
      {
        period: '2023 — 2024',
        course:
          'Pós-graduação, Engenharia de Confiabilidade e Gestão de Ativos',
        institution: 'PUC Minas',
      },
      {
        period: '2015 — 2022',
        course: 'Bacharelado em Engenharia Mecânica',
        institution: 'Universidade Salvador',
      },
    ],
  },
  tools: {
    label: 'Ferramentas',
    groups: [
      {
        name: 'Frontend',
        items: [
          'JavaScript',
          'TypeScript',
          'React',
          'Next.js',
          'Tailwind CSS',
          'Material UI',
          'Vite',
        ],
      },
      {
        name: 'Backend',
        items: ['Node.js', 'Express', 'Python', 'PHP', 'REST APIs'],
      },
      {
        name: 'Bancos de dados',
        items: ['MySQL', 'PostgreSQL', 'SQLite', 'MongoDB'],
      },
      {
        name: 'Cloud, DevOps e entrega',
        items: ['GCP', 'Azure', 'Docker', 'Git'],
      },
      { name: 'Desktop e sistemas', items: ['Rust', 'Tauri', 'C++', 'C#'] },
    ],
  },
  work: {
    label: 'Projetos pessoais',
    intro:
      'Cada entrada é honesta sobre o que é: trabalho verificado ou estudo conceitual.',
    previewNote: 'Estudo de caso em breve',
    noCapture: 'sem captura',
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
  },
  interests: {
    label: 'Interesses',
    items: ['Games', 'Desenho', 'Leitura', 'Viagens'],
  },
  contact: {
    label: 'Contato',
    lead: 'Aberto a vagas, colaborações e conversas técnicas de qualidade.',
    channels: [
      {
        id: 'github',
        label: 'GitHub',
        href: 'https://github.com/decoarc',
        peek: { mark: 'GH', note: 'Perfil e repositórios · abre em nova aba' },
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/andrearcodaci',
        peek: { mark: 'in', note: 'Perfil profissional · abre em nova aba' },
      },
    ],
  },
  caseStudy: {
    backToWork: 'Voltar aos projetos pessoais',
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
