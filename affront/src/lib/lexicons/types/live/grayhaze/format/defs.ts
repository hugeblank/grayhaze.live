/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '$lib/lexicons/util'
import { lexicons } from '$lib/lexicons/lexicons'
import { CID } from 'multiformats/cid'

/** A single hls segment with a duration and source blob */
export interface HlsSegment {
  src: BlobRef
  /** Floating point duration in seconds multiplied by 1000000 then floored */
  duration: number
  [k: string]: unknown
}

export function isHlsSegment(v: unknown): v is HlsSegment {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'live.grayhaze.format.defs#hlsSegment'
  )
}

export function validateHlsSegment(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.format.defs#hlsSegment', v)
}
