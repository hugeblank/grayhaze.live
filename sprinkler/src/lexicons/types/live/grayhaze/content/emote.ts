/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'

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
