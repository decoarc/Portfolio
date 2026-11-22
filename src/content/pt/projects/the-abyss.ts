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
        'The Abyss é um observatório de vida artificial: um mundo só, o mesmo para todos que abrem a página, onde organismos autônomos vivem, competem e às vezes se extinguem. O visitante observa em vez de comandar; a única intervenção permitida é introduzir uma espécie.',
        'É um projeto pessoal exploratório. A demanda não foi validada, e ele não pretende ser um simulador biologicamente preciso.',
      ],
    },
    {
      heading: 'Papel e contribuições',
      items: [
        'Escrevi a especificação, com um portão de qualidade visual antes de qualquer trabalho de simulação: a direção de arte veio primeiro.',
        'Construí a cena 3D em React Three Fiber: fundo do mar, flora, partículas em várias profundidades, organismos e pós-processamento.',
        'Construí o servidor da simulação em Elixir e Phoenix: o mundo roda no servidor e chega ao navegador por canais WebSocket.',
        'Construí a criação de espécies: uma planta com atributos, estratégia de alimentação e traços, publicada uma vez por endereço de e-mail depois de um link de verificação.',
        'Montei a produção numa VPS com Docker Compose, Caddy e uma Cloudflare Tunnel, com deploy automático da branch main e backups agendados do banco.',
      ],
    },
    {
      heading: 'Decisões de engenharia',
      items: [
        'Mundo com autoridade no servidor: o navegador só desenha o que o servidor envia, então todo visitante vê o mesmo ecossistema.',
        'Um núcleo de simulação puro e determinístico (sem processos, sem aleatoriedade global), com grades espaciais para as buscas por vizinhança.',
        'Uma fotografia do mundo a cada minuto e no desligamento; ao reiniciar, o mundo volta da fotografia e se reconcilia com o banco.',
        'Só e-mail, sem senha nem conta: um link de curta duração verifica o endereço, com limite de envios.',
      ],
    },
    {
      heading: 'Desafios técnicos',
      items: [
        'Deixar espécies novas surgirem: grupos de organismos cujas mutações herdadas se afastam o bastante da planta de origem viram subespécies.',
        'Guardar a história: mortes e extinções ficam no banco com a causa, inclusive o predador, e cada espécie tem uma árvore de ramos e extinções.',
        'Manter um mundo público, sempre ligado, dentro do orçamento de uma única VPS, com testes de ponta a ponta para reinício, queda e paradas longas.',
      ],
    },
    {
      heading: 'Resultados e status atual',
      items: [
        'No ar em theabyss.andrearcodaci.com: organismos que dá para buscar, com a câmera levando até eles, e criação de espécies com e-mails de verificação de verdade.',
        'A interface está em português, e a página ainda mostra o rótulo “demonstração visual” enquanto o ecossistema é ajustado.',
      ],
    },
  ],
  links: [
    { kind: 'live', href: 'https://theabyss.andrearcodaci.com/' },
    { kind: 'repo', href: 'https://github.com/decoarc/THE-ABYSS' },
  ],
}
