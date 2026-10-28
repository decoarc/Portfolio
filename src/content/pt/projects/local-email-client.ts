import type { Project } from '../../types.ts'

/** LEC — tradução fiel de `en/projects/local-email-client.ts`, sem afirmação nova. */
export const localEmailClient: Project = {
  slug: 'local-email-client',
  title: 'Local Email Client',
  type: 'verified',
  status: 'published',
  summary:
    'LEC, um aplicativo Windows que abre perfis do Outlook Express direto do disco, lê os arquivos de e-mail .dbx e os reorganiza, sem conta e sem servidor.',
  role: 'Desenvolvedor solo',
  year: '2026',
  stack: ['C#', '.NET 9', 'WPF', 'WebView2', 'MimeKit'],
  cover: {
    src: '/images/projects/local-email-client.webp',
    alt: 'Janela do Local Email Client — a árvore de pastas de um perfil de exemplo ao lado da lista de mensagens, com uma mensagem aberta no painel de leitura',
    width: 1024,
    height: 609,
    thumbSrc: '/images/projects/local-email-client-800.webp',
  },
  sections: [
    {
      heading: 'Problema e motivação',
      paragraphs: [
        'O Outlook Express guardava cada pasta de e-mail em um arquivo .dbx próprio, um formato binário sem documentação, e arquivos antigos continuam no disco assim muito depois de o programa ter sido descontinuado.',
        'O LEC abre esses perfis diretamente (a pasta que contém o Folders.dbx e um .dbx por pasta) para que as mensagens possam ser lidas, buscadas e reorganizadas. Ele trabalha só com arquivos que já estão no disco: sem contas, sem envio, sem sincronização.',
      ],
    },
    {
      heading: 'Papel e contribuições',
      items: [
        'Escrevi o leitor e o gravador de .dbx como uma biblioteca independente (LEC.DbxFormat): cabeçalho, árvore de índice, blocos de mensagem e registros de pasta.',
        'Construí a camada de armazenamento (LEC.MailStore) para perfis, pastas, mensagens, detecção de duplicadas, caches e backups.',
        'Construí a janela em WPF sobre uma estrutura MVVM: árvore de pastas, lista de mensagens ordenável, painel de leitura em HTML no WebView2 e anexos que podem ser salvos um a um.',
        'Adicionei a ferramenta LEC.Cli: dump lista as pastas ou mensagens de um único .dbx, extract grava cada mensagem como um arquivo .eml.',
      ],
    },
    {
      heading: 'Decisões de engenharia',
      items: [
        'Manter o formato, o armazenamento e a janela em projetos separados, para que o código de .dbx rode pela linha de comando sem abrir o aplicativo.',
        'Fazer backup antes de cada regravação: o primeiro estado fica como file.original e nunca é substituído, e a cópia de logo antes da regravação é o file.bak.',
        'Tirar da lista na hora a mensagem apagada ou movida, mas deixar os bytes dela no .dbx até a pasta ser compactada, registrados enquanto isso em um cache local.',
        'Manter no lugar as pastas especiais do Outlook Express (Caixa de entrada, Itens enviados, Rascunhos e as demais) ao criar, mover ou apagar pastas.',
        'Definir limites defensivos contra arquivos corrompidos (profundidade da árvore de índice, fragmentos e tamanho de mensagem), folgados o bastante para caixas grandes, de décadas atrás.',
      ],
    },
    {
      heading: 'Desafios técnicos',
      items: [
        'Trabalhar sobre um formato binário obtido por engenharia reversa, em que um offset errado corrompe uma caixa de e-mail sem gerar nenhum erro.',
        'Recuperar mensagens que uma pasta danificada não indexa mais: um varredor procura no arquivo cabeçalhos de bloco que apontam para o próprio offset e trazem o marcador fixo de capacidade, um padrão conferido em 1.639 cabeçalhos reais.',
        'Mover mensagens entre dois perfis abertos, cada um com seus arquivos, caches e compactação pendente.',
        'Avisar antes de fechar um perfil ou o programa quando ainda há pastas para compactar, para que mensagens removidas não fiquem no arquivo sem ninguém perceber.',
      ],
    },
    {
      heading: 'Resultados e status atual',
      items: [
        'Abre vários perfis lado a lado, lê mensagens em HTML com os anexos, busca por remetente, assunto ou corpo, marca duplicadas e compacta pastas.',
        'Roda no Windows 10 e 11 de 64 bits. Ainda não há versão empacotada: ele é compilado a partir do código com o SDK do .NET 9 e usa o WebView2 Runtime no painel de leitura.',
        'Imagens remotas dentro de mensagens HTML são carregadas, um trade-off conhecido do painel de leitura.',
      ],
    },
  ],
  links: [
    { kind: 'repo', href: 'https://github.com/decoarc/Local_Email_Client-LEC' },
  ],
}
