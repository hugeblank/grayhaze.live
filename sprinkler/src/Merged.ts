// import { ComAtprotoRepoCreateRecord, ComAtprotoRepoDeleteRecord, ComAtprotoRepoGetRecord, ComAtprotoRepoListRecords } from '@atproto/api'

import { Agent } from "@atproto/api"
import { SessionManager } from "@atproto/api/dist/session-manager.js"
import { LiveNS } from "./lexicons/index.js"
import { XrpcClient } from "@atproto/xrpc"

export type GrayhazeAgent = Agent & Merged

export class Merged {
    _client: XrpcClient
    live: LiveNS
  
    private constructor(client: XrpcClient) {
      this._client = client
      this.live = new LiveNS(client)
    }
  
    static agent(options: string | URL | SessionManager): GrayhazeAgent {
      const agent = new Agent(options)
      const base = new Merged(agent)
      return {...agent, ...base} as GrayhazeAgent
    }
  }