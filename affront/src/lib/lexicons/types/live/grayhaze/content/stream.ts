/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { hasProp, isObj } from '$lib/lexicons/util'
import { lexicons } from '$lib/lexicons/lexicons'
import * as LiveGrayhazeFormatHls from '$lib/lexicons/types/live/grayhaze/format/hls'

export interface Record {
  content: LiveGrayhazeFormatHls.Record | { $type: string; [k: string]: unknown }
  title: string
  thumbnail?: Thumbnail
  tags?: string[]
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'live.grayhaze.content.stream#main' ||
      v.$type === 'live.grayhaze.content.stream')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.content.stream#main', v)
}

export interface Thumbnail {
  image: BlobRef
  /** Alt text description of the image, for accessibility. */
  alt?: string
  [k: string]: unknown
}

export function isThumbnail(v: unknown): v is Thumbnail {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'live.grayhaze.content.stream#thumbnail'
  )
}

export function validateThumbnail(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.content.stream#thumbnail', v)
}
