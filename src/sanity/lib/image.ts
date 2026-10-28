import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'
import {sanityClient} from 'sanity:client'

const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}

/** A srcset for responsive <img> tags, cropping to the given aspect ratio when provided. */
export function srcSet(source: SanityImageSource, widths: number[], aspectRatio?: number): string {
  return widths
    .map((width) => {
      let image = urlFor(source).width(width)
      if (aspectRatio) image = image.height(Math.round(width / aspectRatio)).fit('crop')
      return `${image.url()} ${width}w`
    })
    .join(', ')
}
