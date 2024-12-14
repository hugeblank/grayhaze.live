/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util.js'
import { lexicons } from '../../../../lexicons.js'
import * as LiveGrayhazeInteractionDefs from './defs.js'

/** Represents an update of repository state. Note that empty commits are allowed, which include no repo data changes, but an update to rev and signature. */
export interface Commit {
  message: LiveGrayhazeInteractionDefs.ChatView
  [k: string]: unknown
}

export function isCommit(v: unknown): v is Commit {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'live.grayhaze.interaction.subscribeChat#commit'
  )
}

export function validateCommit(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.interaction.subscribeChat#commit', v)
}
