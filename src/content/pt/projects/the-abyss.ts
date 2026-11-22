import type { Project } from '../../types.ts'

/**
 * The Abyss — tradução fiel de `en/projects/the-abyss.ts`, sem afirmação
 * nova. Mesmo status (`published`) e mesmos links.
 */
export const theAbyss: Project = {
  slug: 'the-abyss',
  title: 'The Abyss',
  type: 'verified',
  status: 'published',
  summary:
    'Um ecossistema de mar profundo, compartilhado e persistente, no navegador: organismos luminosos se movem, se alimentam, se reproduzem e sofrem mutações num mundo simulado no servidor, e cada visitante pode introduzir uma espécie sua.',
  role: 'Design e desenvolvimento',
  year: '2026',
  stack: [
    'Elixir',
    'Phoenix',
    'PostgreSQL',
    'Three.js',
    'React Three Fiber',
    'Docker',
  ],
  cover: {
    src: '/images/projects/the-abyss.webp',
    alt: 'The Abyss — organismos translúcidos e luminosos flutuando sobre um fundo do mar escuro, azul-esverdeado, com a busca de espécies e o botão “Criar espécie”',
    width: 1200,
    height: 750,
    thumbSrc: '/images/projects/the-abyss-800.webp',
  },
  sections: [
    {
      heading: 'Problema e motivação',
      paragraphs: [
        'The Abyss nasceu do estágio celular de Spore: a liberdade de montar uma criatura juntando partes e ver como cada escolha pesa na sobrevivência. Aqui a perspectiva muda: em vez de controlar um organismo, o visitante é criador e observador.',
        'É um mundo só, o mesmo para todos que abrem a página. Uma espécie introduzida por alguém compete com as de outras pessoas, origina novas linhagens ou desaparece. O objetivo foi unir criação procedural, vida artificial e uma experiência visual contemplativa a uma arquitetura capaz de manter esse mundo rodando sem parar.',
      ],
    },
    {
      heading: 'Papel e contribuições',
      items: [
        'Construí o editor de espécies: 10 tipos de componentes (alimentação, movimento, sentidos, comportamento e defesa), montados com um orçamento de 24 pontos, e uma prévia 3D procedural da criatura antes de publicar.',
        'Construí o servidor da simulação em Elixir, Phoenix e OTP: um processo central mantém e atualiza o mundo, e as mudanças chegam aos visitantes em tempo real por Phoenix Channels e WebSockets.',
        'Construí a cena 3D em React, Three.js e React Three Fiber: o ambiente, a animação dos organismos, a iluminação e a bioluminescência.',
        'Modelei a persistência em PostgreSQL com Ecto: criadores, espécies, configurações genéticas, ramificações evolutivas, eventos e extinções.',
        'Montei a produção numa VPS com Docker Compose, Caddy e Cloudflare Tunnel, com deploy a partir da branch principal, verificação de saúde e backups agendados.',
      ],
      figures: [
        {
          src: '/images/projects/the-abyss-editor.webp',
          alt: 'Editor de espécies do The Abyss: à esquerda, cores e padrão, o que a criatura faz e o orçamento de 20 de 24 pontos; à direita, a prévia 3D de uma criatura com mandíbula, flagelo, dois ocelos, placa e cílios',
          caption:
            'O editor de espécies: as peças mudam o que a criatura faz, dentro de um orçamento de 24 pontos.',
          width: 1200,
          height: 800,
        },
      ],
    },
    {
      heading: 'Decisões de engenharia',
      items: [
        'Mundo com autoridade no servidor: a lógica ecológica roda lá e o navegador só apresenta o que recebe, então todo visitante vê o mesmo ecossistema.',
        'Núcleo de simulação determinístico, com passo de tempo fixo, para reproduzir comportamentos a partir de condições iniciais controladas; grades espaciais aceleram as buscas por vizinhança na alimentação e na predação.',
        'Escolhas com custo: cada componente muda o comportamento da espécie, e o orçamento de 24 pontos força trocas entre velocidade, percepção, defesa e consumo de energia.',
        'Snapshots periódicos do mundo, versionados, com checksum SHA-256 e guardados no PostgreSQL, em vez de gravar cada movimento; ao reiniciar, o servidor volta da última versão válida e a reconcilia com os registros.',
        'Uma espécie publicada por e-mail verificado, garantida por uma restrição no próprio banco. Depois da verificação, três organismos fundadores entram no mundo e o criador não controla mais nada.',
      ],
    },
    {
      heading: 'Desafios técnicos',
      items: [
        'Deixar linhagens novas surgirem: descendentes herdam componentes adicionados, removidos ou trocados e, quando essas diferenças se mantêm e cumprem certos critérios, a população vira um ramo novo, com identidade própria na árvore genealógica.',
        'Guardar a história: causas de extinção, predadores envolvidos e mortes por período alimentam a busca de espécies e a árvore de linhagens, vivas e extintas.',
        'Equilibrar a complexidade da simulação com os recursos de uma única VPS, mantendo o mundo consistente entre visitantes sem pesar na renderização.',
        'Testes de carga com 250 organismos e 50 observadores simultâneos, além de reinício, recuperação de snapshots, continuidade das linhagens e integridade dos dados.',
      ],
    },
    {
      heading: 'Resultados e status atual',
      items: [
        'No ar em theabyss.andrearcodaci.com: um observatório de vida artificial que reúne frontend, backend, modelagem de dados, tempo real e infraestrutura numa experiência só.',
        'Segue em evolução, sobretudo no equilíbrio ecológico e nos comportamentos. Não busca precisão biológica, e sim ver como regras simples produzem interações e histórias inesperadas.',
        'A interface está em português, e a página ainda mostra o rótulo “demonstração visual” enquanto o ecossistema é ajustado.',
      ],
    },
  ],
  links: [
    { kind: 'live', href: 'https://theabyss.andrearcodaci.com/' },
    { kind: 'repo', href: 'https://github.com/decoarc/THE-ABYSS' },
  ],
}
