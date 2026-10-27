import type { Project } from '../../types.ts'

/**
 * Map Areas — tradução fiel de `en/projects/map-areas.ts`, sem afirmação nova.
 * Mesmo status (`preview`) e mesma ausência de link de repositório.
 */
export const mapAreas: Project = {
  slug: 'map-areas',
  title: 'Map Areas',
  type: 'verified',
  status: 'preview',
  summary:
    'Desenhe e gerencie áreas poligonais em um mapa interativo. Salve áreas, limpe o mapa e adicione polígonos por coordenadas em Lat/Lng, UTM ou GMS.',
  role: 'Desenvolvedor solo',
  year: '2025–2026',
  stack: ['PHP', 'PostgreSQL/PostGIS', 'Leaflet', 'proj4'],
  cover: {
    src: '/images/projects/map-areas.webp',
    alt: 'Interface do Map Areas — controles na barra lateral ao lado de um mapa Leaflet de São Paulo',
    width: 1200,
    height: 900,
    thumbSrc: '/images/projects/map-areas-800.webp',
  },
  sections: [
    {
      heading: 'Problema e motivação',
      paragraphs: [
        'Map Areas é um projeto pessoal que construí para aprender e aplicar conceitos básicos de GIS — capturar polígonos em um mapa, persisti-los em um banco de dados espacial, medir área e perímetro e converter coordenadas entre Lat/Lng, UTM e GMS — sem depender de um pacote GIS desktop completo.',
      ],
    },
    {
      heading: 'Papel e contribuições',
      items: [
        'Projetei e construí o frontend do mapa (Leaflet + Leaflet.Draw) para desenhar, listar e inspecionar áreas poligonais.',
        'Implementei os endpoints do backend em PHP e o schema PostgreSQL/PostGIS para persistência dos polígonos, área e perímetro.',
        'Adicionei conversão Lat/Lng ↔ UTM ↔ GMS no servidor, com suporte a UTM do hemisfério sul (proj4php).',
        'Empacotei o PostGIS local com Docker e um caminho de PHP em contêiner para a demo pública.',
      ],
    },
    {
      heading: 'Decisões de engenharia',
      items: [
        'Guardar os polígonos como GEOMETRY(Polygon, 4326) com índice GIST; converter os anéis do cliente para WKT para o ST_GeomFromText.',
        'Medir área e perímetro com as funções de geography do PostGIS, para que os resultados saiam em km² e km.',
        'Limitar o Leaflet.Draw a polígonos; usar tiles do OpenStreetMap como mapa base.',
        'Fazer as transformações de projeção no servidor com proj4php, tanto para a conversão exibida quanto para criar polígonos colando coordenadas.',
      ],
    },
    {
      heading: 'Desafios técnicos',
      items: [
        'Obter área e perímetro confiáveis a partir dos desenhos, medindo sobre geography e não em graus planos.',
        'Suportar UTM e GMS corretamente no sul do Brasil, incluindo definições de UTM que levam o hemisfério em conta.',
        'Manter uma arquitetura de API PHP enxuta com o mapa no cliente, mesmo adicionando recursos espaciais e de CRS de verdade.',
        'Hospedar uma demo pública com cold starts do plano gratuito e sem autenticação nos endpoints de escrita — aceitável para uma demo de aprendizado, não como endurecimento para produção.',
      ],
    },
    {
      heading: 'Resultados e status atual',
      items: [
        'Resultado principal: aprendizado prático e aplicação dos fundamentos de GIS (armazenamento espacial, edição em mapa e sistemas de coordenadas).',
        'Demo ao vivo disponível publicamente para o fluxo desenhar → salvar → inspecionar (cold starts possíveis na hospedagem gratuita).',
        'A interface do produto está hoje em português; suporte bilíngue PT/EN é uma melhoria planejada no repositório original da aplicação (não implementada neste portfólio).',
      ],
    },
  ],
  links: [{ kind: 'live', href: 'https://geo-areas-php.onrender.com/' }],
}
