import type { Project } from '../../types.ts'

/** Estudo conceitual inventado para exercitar o layout. Bloqueia `pnpm build`. */
export const tokenKiller: Project = {
  slug: 'token-killer',
  title: 'Token Killer',
  type: 'concept',
  status: 'published',
  mock: true,
  summary:
    'Um proxy de linha de comando que comprime a saída das ferramentas antes de ela chegar ao modelo.',
  role: 'Autor',
  year: '2026',
  stack: ['Rust', 'Tokio'],
  sections: [
    {
      heading: 'A pergunta',
      paragraphs: [
        'Agentes de código leem a saída crua de builds, testes e controle de versão. Quase tudo é ruído que o modelo atravessa antes de chegar à linha que importa.',
        'O estudo pergunta se um proxy fino, entre o agente e o shell, consegue manter o sinal e descartar o resto sem esconder nada de que o agente precise.',
      ],
    },
    {
      heading: 'Forma do desenho',
      items: [
        'Um filtro por ferramenta, escolhido pelo nome do comando, com passagem direta para o que for desconhecido.',
        'Os filtros agrupam linhas repetidas e mantêm os erros literais, para que nada que explique uma falha seja reescrito.',
        'A saída original fica a uma flag de distância, para quando um resumo filtrado parecer errado.',
      ],
    },
    {
      heading: 'Riscos que vale nomear',
      items: [
        'Um filtro que lê só a saída padrão pode relatar sucesso enquanto a ferramenta falhou no erro padrão.',
        'Os códigos de saída precisam passar intactos; uma linha de resumo nunca é a fonte da verdade.',
      ],
    },
  ],
  links: [],
}
