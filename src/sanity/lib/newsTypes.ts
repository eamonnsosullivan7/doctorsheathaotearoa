/** News item types: the label shown on the item and the wording of its link. */
export const newsTypes = {
  newsletter: {label: 'Newsletter', linkText: 'Read the newsletter'},
  article: {label: 'Article', linkText: 'Read the article'},
  report: {label: 'Report', linkText: 'Read the report'},
  announcement: {label: 'Announcement', linkText: 'Read more'},
} as const

export type NewsType = keyof typeof newsTypes

export function newsLinkText(type: NewsType | undefined): string {
  return type ? newsTypes[type].linkText : 'Read more'
}
