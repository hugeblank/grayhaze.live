import { Agent } from "@atproto/api"
import { LiveNS } from "./lexicons/index.js"
import { SessionManager } from "@atproto/api/dist/session-manager.js"

export type GrayhazeAgent = Agent & Merged

export interface Merged {
    live: LiveNS
}

export function grayhazeAgent(options: string | URL | SessionManager): GrayhazeAgent {
    const agent = new Agent(options) as GrayhazeAgent
    agent.live = new LiveNS(agent)
    return agent
}