/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { LexiconDoc, Lexicons } from '@atproto/lexicon'

export const schemaDict = {
  LiveGrayhazeActorChannel: {
    lexicon: 1,
    id: 'live.grayhaze.actor.channel',
    defs: {
      main: {
        type: 'record',
        description: 'A declaration of a Grayhaze channel.',
        key: 'literal:self',
        record: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
              minLength: 3,
              maxLength: 640,
              minGraphemes: 1,
              maxGraphemes: 64,
            },
            description: {
              type: 'string',
              description: 'Free-form channel description text.',
              maxGraphemes: 2048,
              maxLength: 16384,
            },
            avatar: {
              type: 'blob',
              description:
                "Small image to be displayed in user card and on channel page. AKA, 'profile picture'",
              accept: ['image/png', 'image/jpeg'],
              maxSize: 1000000,
            },
            banner: {
              type: 'blob',
              description:
                'Larger landscape image to be used behind profile card, and in place of the channel player when offline.',
              accept: ['image/png', 'image/jpeg'],
              maxSize: 1000000,
            },
            labels: {
              type: 'union',
              description:
                'Self-label values, specific to the Bluesky application, on the overall account.',
              refs: ['lex:com.atproto.label.defs#selfLabels'],
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
          },
        },
      },
    },
  },
  LiveGrayhazeActorDefs: {
    lexicon: 1,
    id: 'live.grayhaze.actor.defs',
    defs: {
      profileViewBasic: {
        type: 'object',
        required: ['did'],
        properties: {
          did: {
            type: 'string',
            format: 'did',
          },
          handle: {
            type: 'string',
            format: 'handle',
          },
          displayName: {
            type: 'string',
            maxGraphemes: 64,
            maxLength: 640,
          },
          avatar: {
            type: 'string',
            format: 'uri',
          },
        },
      },
    },
  },
  LiveGrayhazeContentEmote: {
    lexicon: 1,
    id: 'live.grayhaze.content.emote',
    defs: {
      main: {
        type: 'record',
        description: 'Record containing a user made emote.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['name', 'icon'],
          properties: {
            name: {
              type: 'string',
              maxLength: 320,
              maxGraphemes: 32,
              description: 'The emote name, to be wrapped in colons (:name:)',
            },
            icon: {
              type: 'blob',
              accept: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            },
          },
        },
      },
    },
  },
  LiveGrayhazeContentStream: {
    lexicon: 1,
    id: 'live.grayhaze.content.stream',
    defs: {
      main: {
        type: 'record',
        description: 'A declaration of a livestream.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['content', 'title'],
          properties: {
            content: {
              type: 'ref',
              description: 'A ref to a format',
              ref: 'lex:com.atproto.repo.strongRef',
            },
            title: {
              type: 'string',
              maxLength: 1000,
              maxGraphemes: 100,
            },
            thumbnail: {
              type: 'ref',
              ref: 'lex:live.grayhaze.content.stream#thumbnail',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 640,
                maxGraphemes: 64,
              },
            },
          },
        },
      },
      thumbnail: {
        type: 'object',
        required: ['image'],
        properties: {
          image: {
            type: 'blob',
            accept: ['image/*'],
            maxSize: 1000000,
          },
          alt: {
            type: 'string',
            description:
              'Alt text description of the image, for accessibility.',
          },
        },
      },
    },
  },
  LiveGrayhazeFormatDefs: {
    lexicon: 1,
    id: 'live.grayhaze.format.defs',
    defs: {
      hlsSegment: {
        type: 'object',
        description: 'A single hls segment with a duration and source blob',
        required: ['src', 'duration'],
        properties: {
          src: {
            type: 'blob',
            accept: ['video/MP2T', 'video/iso.segment'],
          },
          duration: {
            type: 'integer',
            description:
              'Floating point duration in seconds multiplied by 1000000 then floored',
          },
        },
      },
    },
  },
  LiveGrayhazeFormatHls: {
    lexicon: 1,
    id: 'live.grayhaze.format.hls',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        description: 'An HLS playlist',
        record: {
          type: 'object',
          required: ['sequence'],
          properties: {
            version: {
              type: 'integer',
            },
            mediaSequence: {
              type: 'integer',
            },
            sequence: {
              type: 'array',
              items: {
                type: 'ref',
                ref: 'lex:live.grayhaze.format.defs#hlsSegment',
              },
              maxLength: 512,
            },
            end: {
              type: 'boolean',
              default: false,
            },
            next: {
              type: 'string',
              format: 'tid',
            },
            prev: {
              type: 'string',
              format: 'tid',
            },
          },
        },
      },
    },
  },
  LiveGrayhazeInteractionBan: {
    lexicon: 1,
    id: 'live.grayhaze.interaction.ban',
    defs: {
      main: {
        type: 'record',
        description:
          "Record declaring a 'ban' relationship against another account.",
        key: 'tid',
        record: {
          type: 'object',
          required: ['subject'],
          properties: {
            subject: {
              type: 'string',
              format: 'did',
              description: 'DID of the account to be blocked.',
            },
            target: {
              type: 'string',
              format: 'did',
              description:
                'DID of the channel owner for which this ban should apply to. Channel moderators must provide this property.',
            },
          },
        },
      },
    },
  },
  LiveGrayhazeInteractionChat: {
    lexicon: 1,
    id: 'live.grayhaze.interaction.chat',
    defs: {
      main: {
        type: 'record',
        description: 'A grayhaze chat message',
        key: 'tid',
        record: {
          type: 'object',
          required: ['text', 'stream'],
          properties: {
            stream: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
            },
            text: {
              type: 'string',
              maxLength: 3000,
              maxGraphemes: 300,
              description:
                'The primary post content. May be an empty string, if there are embeds.',
            },
            facets: {
              type: 'array',
              description:
                'Annotations of text (mentions, URLs, hashtags, etc)',
              items: {
                type: 'union',
                refs: [
                  'lex:app.bsky.richtext.facet',
                  'lex:live.grayhaze.content.emote',
                ],
              },
            },
            reply: {
              type: 'ref',
              ref: 'lex:live.grayhaze.interaction.chat#replyRef',
            },
            langs: {
              type: 'array',
              description:
                'Indicates human language of post primary text content.',
              maxLength: 3,
              items: {
                type: 'string',
                format: 'language',
              },
            },
          },
        },
      },
      replyRef: {
        type: 'object',
        required: ['root', 'parent'],
        properties: {
          root: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
          parent: {
            type: 'ref',
            ref: 'lex:com.atproto.repo.strongRef',
          },
        },
      },
    },
  },
  LiveGrayhazeInteractionDefs: {
    lexicon: 1,
    id: 'live.grayhaze.interaction.defs',
    defs: {
      chatView: {
        type: 'object',
        required: ['src_uri', 'src', 'author'],
        properties: {
          src_uri: {
            type: 'string',
            format: 'at-uri',
          },
          src: {
            type: 'ref',
            ref: 'lex:live.grayhaze.interaction.chat',
          },
          author: {
            type: 'ref',
            ref: 'lex:live.grayhaze.actor.defs#profileViewBasic',
          },
        },
      },
      banView: {
        type: 'object',
        required: ['src_uri', 'src', 'author'],
        properties: {
          src_uri: {
            type: 'string',
            format: 'at-uri',
          },
          src: {
            type: 'ref',
            ref: 'lex:live.grayhaze.interaction.ban',
          },
          author: {
            type: 'ref',
            ref: 'lex:live.grayhaze.actor.defs#profileViewBasic',
          },
        },
      },
    },
  },
  LiveGrayhazeInteractionFollow: {
    lexicon: 1,
    id: 'live.grayhaze.interaction.follow',
    defs: {
      main: {
        type: 'record',
        description:
          "Record declaring a social 'follow' relationship of another account. Duplicate follows will be ignored by the AppView.",
        key: 'tid',
        record: {
          type: 'object',
          required: ['subject', 'createdAt'],
          properties: {
            subject: {
              type: 'string',
              format: 'did',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
          },
        },
      },
    },
  },
  LiveGrayhazeInteractionPromotion: {
    lexicon: 1,
    id: 'live.grayhaze.interaction.promotion',
    defs: {
      main: {
        type: 'record',
        description:
          'A promotion of a user beyond the default chatter. May grant exclusive permissions like chat moderation.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['target', 'level'],
          properties: {
            target: {
              type: 'string',
              format: 'did',
              maxLength: 300,
            },
            level: {
              type: 'string',
              description:
                'vip - purely aesthetic, intended to put a badge next to name | moderator - grants the ability to give timeouts/bans | kitten - undefined effect',
              enum: ['moderator', 'vip', 'wage_slave', 'kitten'],
            },
          },
        },
      },
    },
  },
  LiveGrayhazeInteractionSubscribeChat: {
    lexicon: 1,
    id: 'live.grayhaze.interaction.subscribeChat',
    defs: {
      main: {
        type: 'subscription',
        description: 'Subscribe to the chat for a specific stream that is live',
        parameters: {
          type: 'params',
          required: ['stream'],
          properties: {
            stream: {
              type: 'string',
              format: 'tid',
            },
            did: {
              type: 'string',
              format: 'did',
            },
          },
        },
        message: {
          schema: {
            type: 'union',
            refs: ['lex:live.grayhaze.interaction.subscribeChat#message'],
          },
        },
        errors: [
          {
            name: 'StreamEnded',
            description:
              'The stream for which the subscription was attempted has ended. Use live.grayhaze.interaction.listChat for VODs.',
          },
          {
            name: 'ConsumerTooSlow',
            description:
              'If the consumer of the stream can not keep up with events, and a backlog gets too large, the server will drop the connection.',
          },
        ],
      },
      message: {
        type: 'object',
        description:
          'Represents an event occuring related to the stream chat, like a message, or a ban',
        required: ['message'],
        properties: {
          message: {
            type: 'ref',
            ref: 'lex:live.grayhaze.interaction.defs#chatView',
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>

export const schemas = Object.values(schemaDict)
export const lexicons: Lexicons = new Lexicons(schemas)
export const ids = {
  LiveGrayhazeActorChannel: 'live.grayhaze.actor.channel',
  LiveGrayhazeActorDefs: 'live.grayhaze.actor.defs',
  LiveGrayhazeContentEmote: 'live.grayhaze.content.emote',
  LiveGrayhazeContentStream: 'live.grayhaze.content.stream',
  LiveGrayhazeFormatDefs: 'live.grayhaze.format.defs',
  LiveGrayhazeFormatHls: 'live.grayhaze.format.hls',
  LiveGrayhazeInteractionBan: 'live.grayhaze.interaction.ban',
  LiveGrayhazeInteractionChat: 'live.grayhaze.interaction.chat',
  LiveGrayhazeInteractionDefs: 'live.grayhaze.interaction.defs',
  LiveGrayhazeInteractionFollow: 'live.grayhaze.interaction.follow',
  LiveGrayhazeInteractionPromotion: 'live.grayhaze.interaction.promotion',
  LiveGrayhazeInteractionSubscribeChat:
    'live.grayhaze.interaction.subscribeChat',
}
