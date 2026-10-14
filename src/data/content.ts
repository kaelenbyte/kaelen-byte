export type Article = {
  slug: string
  title: string
  category: string
  date: string
  readingTime: string
  excerpt: string
  status: string
  body: string[]
}

export const articles: Article[] = [
  {
    slug: 'brand-direction-notes',
    title: 'Brand direction notes',
    category: 'Brand',
    date: '2026-10-14',
    readingTime: '3 min read',
    status: 'Placeholder draft',
    excerpt:
      'A draft content example that helps define the tone, direction, and goals behind the Kaelen Byte identity.',
    body: [
      'This sample entry is intentionally placeholder content. It highlights how future articles can be structured without implying a completed published story or real achievement.',
      'The purpose of this section is to keep the content layout ready for real updates while clearly distinguishing draft material from confirmed published work.',
      'When the owner adds final copy, replace this draft with real article text and update the metadata to match the final publication details.',
    ],
  },
  {
    slug: 'creative-systems',
    title: 'Creative systems and workflows',
    category: 'Process',
    date: '2026-10-14',
    readingTime: '4 min read',
    status: 'Placeholder draft',
    excerpt:
      'An example outline for how new ideas, visual experiments, and technological concepts can be organized into a repeatable process.',
    body: [
      'Kaelen Byte can showcase ideas as part of a broader creative practice, with articles highlighting experiments, frameworks, and reflection rather than polished claims of completed work.',
      'A clear editorial system makes it easier to publish new updates consistently while preserving flexibility for personal projects and evolving interests.',
      'This placeholder text should be replaced as actual content becomes available, with accurate dates and real findings clearly attributed.',
    ],
  },
  {
    slug: 'future-builds',
    title: 'Future builds and ideas',
    category: 'Ideas',
    date: '2026-10-14',
    readingTime: '2 min read',
    status: 'Placeholder draft',
    excerpt:
      'A planning note that documents upcoming directions, experiments, and creative opportunities without overstating current delivery.',
    body: [
      'The site is designed to support future content without making promises about what is already published or complete.',
      'This placeholder entry keeps the page ready for genuine projects, updates, and stories that can be published when the owner is ready to share them.',
      'Future additions should be concise, accurate, and easy for readers to understand without confusion about which items are draft or published material.',
    ],
  },
]
