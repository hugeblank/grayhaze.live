/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'
import { CID } from 'multiformats/cid'

export interface ProfileViewBasic {
  did: string
  handle: string
  displayName?: string
  avatar?: string
  [k: string]: unknown
}

export function isProfileViewBasic(v: unknown): v is ProfileViewBasic {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'live.grayhaze.actor.defs#profileViewBasic'
  )
}

export function validateProfileViewBasic(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.actor.defs#profileViewBasic', v)
}
