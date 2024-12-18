/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'
import { CID } from 'multiformats/cid'
import * as LiveGrayhazeFormatDefs from './defs.js'

export interface Record {
  version?: number
  mediaSequence?: number
  sequence: LiveGrayhazeFormatDefs.HlsSegment[]
  end: boolean
  next?: string
  prev?: string
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
