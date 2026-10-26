import type { Project } from '../../types.ts'

/** Estudo conceitual inventado para exercitar o layout. Bloqueia `pnpm build`. */
export const atlasLedger: Project = {
  slug: 'atlas-ledger',
  title: 'Atlas Ledger',
  type: 'concept',
  status: 'published',
  mock: true,
  summary:
    'Primitivas de partidas dobradas sobre um log de eventos append-only que dá para auditar na mão.',
  role: 'Autor',
  year: '2025',
  stack: ['Go', 'PostgreSQL'],
  sections: [
    {
      heading: 'A pergunta',
      paragraphs: [
        'Times pequenos costumam guardar dinheiro numa única coluna de saldo, atualizada no lugar. Quando um valor parece errado, não há rastro que explique como ele chegou ali.',
        'O estudo explora quão pouca maquinaria é preciso para guardar cada movimento como um lançamento que pode ser reproduzido e conferido por uma pessoa com uma planilha.',
      ],
    },
    {
      heading: 'Primitivas',
      items: [
        'Contas, lançamentos e transações; uma transação só é aceita quando débitos e créditos fecham.',
        'Lançamentos nunca são editados nem apagados. Uma correção é uma nova transação que estorna a antiga.',
        'Os saldos são derivados reproduzindo o log, e ficam em cache só como uma projeção que pode ser reconstruída.',
      ],
    },
    {
      heading: 'Armazenamento',
      paragraphs: [
        'O log fica numa única tabela PostgreSQL, com permissão só de inserção para o papel da aplicação. Restrições no banco, e não só no serviço, rejeitam uma transação que não fecha.',
      ],
    },
    {
      heading: 'Perguntas em aberto',
      items: [
        'Como lidar com moedas sem esconder a conversão dentro de um lançamento.',
        'Onde traçar a linha entre o livro-razão e as regras de negócio que criam transações.',
      ],
    },
  ],
  links: [],
}
