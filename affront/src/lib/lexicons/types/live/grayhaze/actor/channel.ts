/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '$lib/lexicons/util'
import { lexicons } from '$lib/lexicons/lexicons'
import { CID } from 'multiformats/cid'
import { ComAtprotoLabelDefs } from '@atproto/api'

export interface Record {
  displayName?: string
  /** Free-form channel description text. */
  description?: string
  /** Small image to be displayed in user card and on channel page. AKA, 'profile picture' */
  avatar?: BlobRef
  /** Larger landscape image to be used behind profile card, and in place of the channel player when offline. */
  banner?: BlobRef
  labels?:
    | ComAtprotoLabelDefs.SelfLabels
    | { $type: string; [k: string]: unknown }
  createdAt?: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'live.grayhaze.actor.channel#main' ||
      v.$type === 'live.grayhaze.actor.channel')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.actor.channel#main', v)
}
