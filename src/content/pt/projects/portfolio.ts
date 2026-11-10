import type { Project } from '../../types.ts'

/** O próprio portfólio — tradução fiel de `en/projects/portfolio.ts`. */
export const portfolio: Project = {
  slug: 'portfolio',
  title: 'Portfólio',
  type: 'verified',
  status: 'published',
  summary:
    'Este site. Ele serve de currículo, com trajetória, ferramentas e projetos, mas também é um lugar para explorar ideias de interface que não caberiam em outro projeto.',
  role: 'Design e desenvolvimento',
  year: '2026',
  stack: [
    'React',
    'TypeScript',
    'Vite',
    'Canvas 2D',
    'Web Audio',
    'Playwright',
  ],
  cover: {
    src: '/images/projects/portfolio-pt.webp',
    alt: 'Abertura do portfólio — o nome André Arcodaci em letras grandes à esquerda e, à direita, um cubo feito de pontos girando',
    width: 1200,
    height: 750,
    thumbSrc: '/images/projects/portfolio-pt-800.webp',
  },
  sections: [
    {
      heading: 'Currículo e laboratório',
      paragraphs: [
        'A primeira função do site é a de currículo: dizer quem eu sou, por onde passei, com quais ferramentas trabalho e mostrar projetos com detalhes que dá para conferir.',
        'A segunda é ser um espaço para testar ideias. Os efeitos ficam em volta do conteúdo, nunca no caminho dele: tudo continua legível sem animação, pelo teclado e com leitor de tela.',
      ],
    },
    {
      heading: 'Destaque: o cubo de pontos',
      paragraphs: [
        'Ao lado do nome, um cubo feito de milhares de pontos gira devagar. O cursor empurra e arrasta os pontos, que voltam ao lugar; rolando a página, o cubo se desfaz em pontos soltos, e se refaz ao voltar.',
        'Um clique troca a forma: os pontos voam do cubo para um modelo 3D (Sora, uma pena com tinteiro, um livro, um avião) e, depois do último, voltam ao cubo. No celular, onde o cubo é só fundo, a forma troca sozinha.',
        'Cada modelo foi escolhido para representar um dos meus interesses pessoais: Sora, protagonista da minha franquia de jogos favorita, representa os games; a pena com tinteiro, o desenho; o livro (ou a tentativa de um, que ficou meio abstrato), a leitura; e o avião, as viagens.',
      ],
      items: [
        'Desenhado em Canvas 2D, sem biblioteca de 3D: a projeção, a perspectiva e o apagar dos pontos de trás são feitos à mão.',
        'Os modelos .glb não vão para o site. Um script transforma cada um numa nuvem de pontos de poucos KB, baixada só quando o cursor ou o foco chega ao cubo.',
        'O desfazer segue a posição do scroll, então é reversível por construção. Com reduced motion, fica um quadro parado e a troca é instantânea.',
      ],
      figures: [
        {
          src: '/images/projects/portfolio-cube.webp',
          alt: 'Quatro quadros do mesmo campo de pontos: o cubo, a Sora, uma pena com tinteiro e um avião',
          caption: 'O cubo e três das formas que os mesmos pontos assumem.',
          width: 773,
          height: 773,
        },
      ],
    },
    {
      heading: 'Destaque: a máquina de escrever',
      paragraphs: [
        'Com mouse e teclado, a página inteira vira uma folha: cada tecla carimba a letra na ponta do mouse, com o tipo e o som de uma máquina de escrever. As letras ficam alguns segundos e somem num fade.',
      ],
      items: [
        'Cada batida sai um pouco torta e com uma carga de tinta diferente, como tipo de metal batendo numa fita gasta.',
        'O som não é um arquivo: o clack é sintetizado no Web Audio a cada tecla, com pequenas variações de tom e volume.',
        'A máquina fica fora do caminho: ignora campos de texto, atalhos e teclas de navegação, não aparece em telas de toque e limita quantas letras ficam na tela.',
      ],
      figures: [
        {
          src: '/images/projects/portfolio-typewriter-pt.webp',
          alt: 'A seção Sobre do portfólio com a frase “oi, mundo” e algumas letras soltas carimbadas em tipo de máquina de escrever sobre a página',
          caption: '“oi, mundo”, digitado sobre a seção Sobre.',
          width: 1200,
          height: 750,
        },
      ],
    },
    {
      heading: 'Outras ideias pelo caminho',
      items: [
        'As iniciais “AA” em partículas no Contato, que fogem do cursor.',
        'O título do projeto que voa da lista até a página do case study, com a View Transitions API.',
        'Uma barra de rolagem própria: um trilho com as seções numeradas.',
        'Site em português e inglês, pré-renderizado em HTML estático e publicado no GitHub Pages, com testes de ponta a ponta, de acessibilidade e de regressão visual no Playwright.',
      ],
    },
  ],
  links: [{ kind: 'repo', href: 'https://github.com/decoarc/Portfolio' }],
}
