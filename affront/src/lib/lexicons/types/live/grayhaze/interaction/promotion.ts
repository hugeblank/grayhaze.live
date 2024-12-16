/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '$lib/lexicons/util'
import { lexicons } from '$lib/lexicons/lexicons'
import { CID } from 'multiformats/cid'

export interface Record {
  target: string
  /** vip - purely aesthetic, intended to put a badge next to name | moderator - grants the ability to give timeouts/bans | kitten - undefined effect */
  level: 'moderator' | 'vip' | 'kitten'
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'live.grayhaze.interaction.promotion#main' ||
      v.$type === 'live.grayhaze.interaction.promotion')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.interaction.promotion#main', v)
}