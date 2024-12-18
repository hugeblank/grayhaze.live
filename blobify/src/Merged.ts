import { Agent } from "@atproto/api"
import type { SessionManager } from "@atproto/api/dist/session-manager"
import { LiveNS } from "./lexicons/index.js"

export type GrayhazeAgent = Agent & Merged

export interface Merged {
    live: LiveNS
}

export function grayhazeAgent(options: string | URL | SessionManager): GrayhazeAgent {
    const agent = new Agent(options) as GrayhazeAgent
    agent.live = new LiveNS(agent)
    return agent
}