/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '$lib/lexicons/util'
import { lexicons } from '$lib/lexicons/lexicons'
import { CID } from 'multiformats/cid'
import * as LiveGrayhazeFormatDefs from '$lib/lexicons/types/live/grayhaze/format/defs'

export interface Record {
  version: number
  mediaSequence: number
  sequence: LiveGrayhazeFormatDefs.HlsSegment[]
  end: boolean
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'live.grayhaze.format.hls#main' ||
      v.$type === 'live.grayhaze.format.hls')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.format.hls#main', v)
}
