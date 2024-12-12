/**
 * GENERATED CODE - DO NOT MODIFY
 */
/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult } from '@atproto/lexicon'
import { AppBskyRichtextFacet, ComAtprotoRepoStrongRef } from '@atproto/api'
import * as LiveGrayhazeContentEmote from '$lib/lexicons/types/live/grayhaze/content/emote'
import { lexicons } from '$lib/lexicons/lexicons'
import { hasProp, isObj } from '$lib/lexicons/util'



export interface Record {
  stream_uri?: string
  /** The primary post content. May be an empty string, if there are embeds. */
  text: string
  /** Annotations of text (mentions, URLs, hashtags, etc) */
  facets?: (
    | AppBskyRichtextFacet.Main
    | LiveGrayhazeContentEmote.Record
    | { $type: string; [k: string]: unknown }
  )[]
  reply?: ReplyRef
  /** Indicates human language of post primary text content. */
  langs?: string[]
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'live.grayhaze.interaction.chat#main' ||
      v.$type === 'live.grayhaze.interaction.chat')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.interaction.chat#main', v)
}

export interface ReplyRef {
  root: ComAtprotoRepoStrongRef.Main
  parent: ComAtprotoRepoStrongRef.Main
  [k: string]: unknown
}

export function isReplyRef(v: unknown): v is ReplyRef {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'live.grayhaze.interaction.chat#replyRef'
  )
}

export function validateReplyRef(v: unknown): ValidationResult {
  return lexicons.validate('live.grayhaze.interaction.chat#replyRef', v)
}
