/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'

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
