import { ComAtprotoRepoCreateRecord, ComAtprotoRepoDeleteRecord, ComAtprotoRepoGetRecord, ComAtprotoRepoListRecords } from '@atproto/api'
/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { XrpcClient, type FetchHandler, type FetchHandlerOptions } from '@atproto/xrpc'
import { schemas } from '$lib/lexicons/lexicons'
import { CID } from 'multiformats/cid'
import * as LiveGrayhazeActorChannel from '$lib/lexicons/types/live/grayhaze/actor/channel'
import * as LiveGrayhazeActorDefs from '$lib/lexicons/types/live/grayhaze/actor/defs'
import * as LiveGrayhazeContentEmote from '$lib/lexicons/types/live/grayhaze/content/emote'
import * as LiveGrayhazeContentStream from '$lib/lexicons/types/live/grayhaze/content/stream'
import * as LiveGrayhazeFormatDefs from '$lib/lexicons/types/live/grayhaze/format/defs'
import * as LiveGrayhazeFormatHls from '$lib/lexicons/types/live/grayhaze/format/hls'
import * as LiveGrayhazeInteractionBan from '$lib/lexicons/types/live/grayhaze/interaction/ban'
import * as LiveGrayhazeInteractionChat from '$lib/lexicons/types/live/grayhaze/interaction/chat'
import * as LiveGrayhazeInteractionDefs from '$lib/lexicons/types/live/grayhaze/interaction/defs'
import * as LiveGrayhazeInteractionFollow from '$lib/lexicons/types/live/grayhaze/interaction/follow'
import * as LiveGrayhazeInteractionPromotion from '$lib/lexicons/types/live/grayhaze/interaction/promotion'
import * as LiveGrayhazeInteractionSubscribeChat from '$lib/lexicons/types/live/grayhaze/interaction/subscribeChat'














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

  async put(
    params: Omit<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: LiveGrayhazeActorChannel.Record,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    record.$type = 'live.grayhaze.actor.channel'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
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
