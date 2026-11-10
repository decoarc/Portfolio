import type { Project } from '../../types.ts'

/** This portfolio — from the code in this repository. */
export const portfolio: Project = {
  slug: 'portfolio',
  title: 'Portfolio',
  type: 'verified',
  status: 'published',
  summary:
    'This site. It works as my résumé, with background, tools and projects, but it is also a place to explore interface ideas that would not fit in any other project.',
  role: 'Design and development',
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
    src: '/images/projects/portfolio-en.webp',
    alt: 'Portfolio opening — the name André Arcodaci in large type on the left and, on the right, a rotating cube made of dots',
    width: 1200,
    height: 750,
    thumbSrc: '/images/projects/portfolio-en-800.webp',
  },
  sections: [
    {
      heading: 'Résumé and lab',
      paragraphs: [
        'The first job of the site is to be a résumé: say who I am, where I have been, which tools I work with, and show projects with details that can be checked.',
        'The second is to be a space for trying out ideas. The effects sit around the content, never in its way: everything stays readable without animation, by keyboard and with a screen reader.',
      ],
    },
    {
      heading: 'Highlight: the dot cube',
      paragraphs: [
        'Next to the name, a cube made of thousands of dots turns slowly. The cursor pushes and drags the dots, which settle back; scrolling down breaks the cube into loose dots, and scrolling back rebuilds it.',
        'A click changes the shape: the dots fly from the cube into a 3D model (Sora, a quill and inkwell, a book, a plane) and, after the last one, back into the cube. On phones, where the cube is only a backdrop, the shape changes on its own.',
        'Each model was picked to stand for one of my personal interests: Sora, the protagonist of my favorite game franchise, stands for games; the quill and inkwell, for drawing; the book (or the attempt at one, which came out a bit abstract), for reading; and the plane, for travel.',
      ],
      items: [
        'Drawn on Canvas 2D with no 3D library: projection, perspective and the fading of the back dots are done by hand.',
        'The .glb models never ship. A script turns each one into a point cloud of a few KB, downloaded only when the cursor or focus reaches the cube.',
        'The break-up follows the scroll position, so it is reversible by construction. With reduced motion it is a still frame and the shape change is instant.',
      ],
      figures: [
        {
          src: '/images/projects/portfolio-cube.webp',
          alt: 'Four frames of the same dot field: the cube, Sora, a quill with an inkwell and a plane',
          caption: 'The cube and three of the shapes the same dots take.',
          width: 773,
          height: 773,
        },
      ],
    },
    {
      heading: 'Highlight: the typewriter',
      paragraphs: [
        'With a mouse and keyboard, the whole page becomes a sheet of paper: each key stamps its letter at the mouse pointer, with the type and the sound of a typewriter. The letters stay for a few seconds and fade away.',
      ],
      items: [
        'Each strike lands slightly crooked and with a different ink load, like metal type hitting a worn ribbon.',
        'The sound is not a file: the clack is synthesized in Web Audio on every key, with small variations in pitch and volume.',
        'The typewriter stays out of the way: it ignores text fields, shortcuts and navigation keys, does not appear on touch screens and caps how many letters stay on screen.',
      ],
      figures: [
        {
          src: '/images/projects/portfolio-typewriter-en.webp',
          alt: 'The About section of the portfolio with the phrase “hello, world” and a few loose letters stamped in typewriter type across the page',
          caption: '“hello, world”, typed over the About section.',
          width: 1200,
          height: 750,
        },
      ],
    },
    {
      heading: 'Other ideas along the way',
      items: [
        'The initials “AA” in particles in Contact, which shy away from the cursor.',
        'The project title that flies from the list to the case study page, with the View Transitions API.',
        'A custom scrollbar: a rail with the numbered sections.',
        'A site in English and Portuguese, prerendered to static HTML and published on GitHub Pages, with end-to-end, accessibility and visual regression tests in Playwright.',
      ],
    },
  ],
  links: [{ kind: 'repo', href: 'https://github.com/decoarc/Portfolio' }],
}
