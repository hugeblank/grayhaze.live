/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { XrpcClient, FetchHandler, FetchHandlerOptions } from '@atproto/xrpc'
import { schemas } from './lexicons.js'
import * as LiveGrayhazeActorChannel from './types/live/grayhaze/actor/channel.js'
import * as LiveGrayhazeActorDefs from './types/live/grayhaze/actor/defs.js'
import * as LiveGrayhazeContentEmote from './types/live/grayhaze/content/emote.js'
import * as LiveGrayhazeContentStream from './types/live/grayhaze/content/stream.js'
import * as LiveGrayhazeFormatDefs from './types/live/grayhaze/format/defs.js'
import * as LiveGrayhazeFormatHls from './types/live/grayhaze/format/hls.js'
import * as LiveGrayhazeInteractionBan from './types/live/grayhaze/interaction/ban.js'
import * as LiveGrayhazeInteractionChat from './types/live/grayhaze/interaction/chat.js'
import * as LiveGrayhazeInteractionDefs from './types/live/grayhaze/interaction/defs.js'
import * as LiveGrayhazeInteractionFollow from './types/live/grayhaze/interaction/follow.js'
import * as LiveGrayhazeInteractionPromotion from './types/live/grayhaze/interaction/promotion.js'
import * as LiveGrayhazeInteractionSubscribeChat from './types/live/grayhaze/interaction/subscribeChat.js'
import { ComAtprotoRepoCreateRecord, ComAtprotoRepoDeleteRecord, ComAtprotoRepoGetRecord, ComAtprotoRepoListRecords } from '@atproto/api'

export * as LiveGrayhazeActorChannel from './types/live/grayhaze/actor/channel.js'
export * as LiveGrayhazeActorDefs from './types/live/grayhaze/actor/defs.js'
export * as LiveGrayhazeContentEmote from './types/live/grayhaze/content/emote.js'
export * as LiveGrayhazeContentStream from './types/live/grayhaze/content/stream.js'
export * as LiveGrayhazeFormatDefs from './types/live/grayhaze/format/defs.js'
export * as LiveGrayhazeFormatHls from './types/live/grayhaze/format/hls.js'
export * as LiveGrayhazeInteractionBan from './types/live/grayhaze/interaction/ban.js'
export * as LiveGrayhazeInteractionChat from './types/live/grayhaze/interaction/chat.js'
export * as LiveGrayhazeInteractionDefs from './types/live/grayhaze/interaction/defs.js'
export * as LiveGrayhazeInteractionFollow from './types/live/grayhaze/interaction/follow.js'
export * as LiveGrayhazeInteractionPromotion from './types/live/grayhaze/interaction/promotion.js'
export * as LiveGrayhazeInteractionSubscribeChat from './types/live/grayhaze/interaction/subscribeChat.js'

export class AtpBaseClient extends XrpcClient {
  live: LiveNS

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas)
    this.live = new LiveNS(this)
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this
  }
}

export class LiveNS {
  _client: XrpcClient
  grayhaze: LiveGrayhazeNS

  constructor(client: XrpcClient) {
    this._client = client
    this.grayhaze = new LiveGrayhazeNS(client)
  }
}

export class LiveGrayhazeNS {
  _client: XrpcClient
  actor: LiveGrayhazeActorNS
  content: LiveGrayhazeContentNS
  format: LiveGrayhazeFormatNS
  interaction: LiveGrayhazeInteractionNS

  constructor(client: XrpcClient) {
    this._client = client
    this.actor = new LiveGrayhazeActorNS(client)
    this.content = new LiveGrayhazeContentNS(client)
    this.format = new LiveGrayhazeFormatNS(client)
    this.interaction = new LiveGrayhazeInteractionNS(client)
  }
}

export class LiveGrayhazeActorNS {
  _client: XrpcClient
  channel: ChannelRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.channel = new ChannelRecord(client)
  }
}

export class ChannelRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: LiveGrayhazeActorChannel.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'live.grayhaze.actor.channel',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: LiveGrayhazeActorChannel.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'live.grayhaze.actor.channel',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: LiveGrayhazeActorChannel.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'live.grayhaze.actor.channel'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      {
        collection: 'live.grayhaze.actor.channel',
        rkey: 'self',
        ...params,
        record,
      },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'live.grayhaze.actor.channel', ...params },
      { headers },
    )
  }
}

export class LiveGrayhazeContentNS {
  _client: XrpcClient
  emote: EmoteRecord
  stream: StreamRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.emote = new EmoteRecord(client)
    this.stream = new StreamRecord(client)
  }
}

export class EmoteRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: LiveGrayhazeContentEmote.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'live.grayhaze.content.emote',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: LiveGrayhazeContentEmote.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'live.grayhaze.content.emote',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: LiveGrayhazeContentEmote.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'live.grayhaze.content.emote'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'live.grayhaze.content.emote', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'live.grayhaze.content.emote', ...params },
      { headers },
    )
  }
}

export class StreamRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: LiveGrayhazeContentStream.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'live.grayhaze.content.stream',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: LiveGrayhazeContentStream.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'live.grayhaze.content.stream',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: LiveGrayhazeContentStream.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'live.grayhaze.content.stream'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'live.grayhaze.content.stream', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'live.grayhaze.content.stream', ...params },
      { headers },
    )
  }
}

export class LiveGrayhazeFormatNS {
  _client: XrpcClient
  hls: HlsRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.hls = new HlsRecord(client)
  }
}

export class HlsRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: LiveGrayhazeFormatHls.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'live.grayhaze.format.hls',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: LiveGrayhazeFormatHls.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'live.grayhaze.format.hls',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: LiveGrayhazeFormatHls.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'live.grayhaze.format.hls'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'live.grayhaze.format.hls', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'live.grayhaze.format.hls', ...params },
      { headers },
    )
  }
}

export class LiveGrayhazeInteractionNS {
  _client: XrpcClient
  ban: BanRecord
  chat: ChatRecord
  follow: FollowRecord
  promotion: PromotionRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.ban = new BanRecord(client)
    this.chat = new ChatRecord(client)
    this.follow = new FollowRecord(client)
    this.promotion = new PromotionRecord(client)
  }
}

export class BanRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: LiveGrayhazeInteractionBan.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'live.grayhaze.interaction.ban',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: LiveGrayhazeInteractionBan.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'live.grayhaze.interaction.ban',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: LiveGrayhazeInteractionBan.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'live.grayhaze.interaction.ban'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'live.grayhaze.interaction.ban', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'live.grayhaze.interaction.ban', ...params },
      { headers },
    )
  }
}

export class ChatRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: LiveGrayhazeInteractionChat.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'live.grayhaze.interaction.chat',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: LiveGrayhazeInteractionChat.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'live.grayhaze.interaction.chat',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: LiveGrayhazeInteractionChat.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'live.grayhaze.interaction.chat'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'live.grayhaze.interaction.chat', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'live.grayhaze.interaction.chat', ...params },
      { headers },
    )
  }
}

export class FollowRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: LiveGrayhazeInteractionFollow.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'live.grayhaze.interaction.follow',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: LiveGrayhazeInteractionFollow.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'live.grayhaze.interaction.follow',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: LiveGrayhazeInteractionFollow.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'live.grayhaze.interaction.follow'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'live.grayhaze.interaction.follow', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'live.grayhaze.interaction.follow', ...params },
      { headers },
    )
  }
}

export class PromotionRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: LiveGrayhazeInteractionPromotion.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'live.grayhaze.interaction.promotion',
      ...params,
    })
    return res.data
  }

  async get(
    params: Omit<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: LiveGrayhazeInteractionPromotion.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'live.grayhaze.interaction.promotion',
      ...params,
    })
    return res.data
  }

  async create(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: LiveGrayhazeInteractionPromotion.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'live.grayhaze.interaction.promotion'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection: 'live.grayhaze.interaction.promotion', ...params, record },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: Omit<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'live.grayhaze.interaction.promotion', ...params },
      { headers },
    )
  }
}
