/**
 * GENERATED CODE - DO NOT MODIFY
 */
/**
 * GENERATED CODE - DO NOT MODIFY
 */
import type { ValidationResult } from '@atproto/lexicon'
import { hasProp, isObj } from '$lib/lexicons/util'
import { lexicons } from '$lib/lexicons/lexicons'

export interface Record {
  subject: string
  createdAt: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'live.grayhaze.interaction.follow#main' ||
      v.$type === 'live.grayhaze.interaction.follow')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.interaction.follow#main', v)
}
