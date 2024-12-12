/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { hasProp, isObj } from '$lib/lexicons/util'
import { lexicons } from '$lib/lexicons/lexicons'

export interface Record {
  /** The emote name, to be wrapped in colons (:name:) */
  name: string
  icon: BlobRef
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'live.grayhaze.content.emote#main' ||
      v.$type === 'live.grayhaze.content.emote')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.content.emote#main', v)
}
