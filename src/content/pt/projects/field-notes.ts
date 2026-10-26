import type { Project } from '../../types.ts'

/** Estudo conceitual inventado para exercitar o layout. Bloqueia `pnpm build`. */
export const fieldNotes: Project = {
  slug: 'field-notes',
  title: 'Field Notes',
  type: 'concept',
  status: 'published',
  mock: true,
  summary:
    'Captura offline-first que reconcilia edições conflitantes sem ida e volta ao servidor.',
  role: 'Autor',
  year: '2024',
  stack: ['TypeScript', 'CRDT'],
  sections: [
    {
      heading: 'A pergunta',
      paragraphs: [
        'Anotações de campo costumam ser escritas onde a conexão cai. Se duas pessoas editam a mesma nota offline, o trabalho de alguém em geral é sobrescrito na sincronização.',
        'O estudo investiga se um tipo de dado livre de conflito consegue mesclar essas edições em cada aparelho, para que sincronizar vire uma troca de mudanças e não uma disputa.',
      ],
    },
    {
      heading: 'Abordagem',
      items: [
        'Cada nota é um CRDT de texto guardado localmente; as edições são registradas como operações, não como cópias inteiras.',
        'Os aparelhos trocam as operações que faltam quando encontram rede, em qualquer ordem.',
        'A interface nunca espera um servidor para mostrar um estado salvo.',
      ],
    },
    {
      heading: 'Trade-offs',
      items: [
        'Uma mescla sempre válida nem sempre é o que a pessoa quis dizer; alguns conflitos ainda pedem um aviso visível para quem lê.',
        'O histórico de operações cresce com o tempo, então precisa de uma estratégia de compactação antes de ser prático.',
      ],
    },
  ],
  links: [],
}
