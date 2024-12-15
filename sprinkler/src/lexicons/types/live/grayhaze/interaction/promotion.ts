/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'

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