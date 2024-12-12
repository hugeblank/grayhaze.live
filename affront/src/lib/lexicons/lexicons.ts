/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type LexiconDoc, Lexicons } from '@atproto/lexicon'

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
              type: 'union',
              description:
                'An open union of formats, allowing us to support more than hls in the future.',
              refs: ['lex:live.grayhaze.format.hls'],
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
          required: ['version', 'mediaSequence', 'sequence'],
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
            },
            end: {
              type: 'boolean',
              default: false,
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
          required: ['subject', 'createdAt'],
          properties: {
            subject: {
              type: 'string',
              format: 'did',
              description: 'DID of the account to be blocked.',
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
          required: ['text'],
          properties: {
            stream_uri: {
              type: 'string',
              format: 'at-uri',
            },
            text: {
              type: 'string',
              maxLength: 1500,
              maxGraphemes: 150,
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
} as const satisfies Record<string, LexiconDoc>

export const schemas = Object.values(schemaDict)
export const lexicons: Lexicons = new Lexicons(schemas)
export const ids = {
  LiveGrayhazeActorChannel: 'live.grayhaze.actor.channel',
  LiveGrayhazeContentEmote: 'live.grayhaze.content.emote',
  LiveGrayhazeContentStream: 'live.grayhaze.content.stream',
  LiveGrayhazeFormatDefs: 'live.grayhaze.format.defs',
  LiveGrayhazeFormatHls: 'live.grayhaze.format.hls',
  LiveGrayhazeInteractionBan: 'live.grayhaze.interaction.ban',
  LiveGrayhazeInteractionChat: 'live.grayhaze.interaction.chat',
  LiveGrayhazeInteractionFollow: 'live.grayhaze.interaction.follow',
}
