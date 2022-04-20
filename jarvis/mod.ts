/// <reference path="../global.d.ts"/>
import {error, ok} from '@/util.ts'
import {Weather, Food} from './action.ts'

import type {Action} from './action.ts'
import type {Context, Bot} from 'grammy'

const TOKEN = Deno.env.get('WIT')!
const states = new Map<number, Action>()
const polls = new Map<string, Context['message']>()

export async function reply(this: Bot, ctx: Context) {
  const {message, pollAnswer} = ctx

  if (pollAnswer) {
    const id = pollAnswer.user.id
    const action = states.get(id)
    const poll = polls.get(pollAnswer.poll_id)
    if (!action || !poll) return
    const {slot} = action
    if (slot) slot.v = poll.poll!.options[pollAnswer.option_ids[0]].text
    this.api.sendMessage(poll.chat.id, await action.do() as string)
  } else if (message) {
    const id = message.from!.id
    const bot = ctx.me.username

    let msg = message.text!

    // 过滤群里的 @文本
    if ((await ctx.getChat()).type === 'group') {
      if (!msg.includes(bot)) return
      msg = msg.replaceAll(`@${bot}`, '')
    }

    const action = states.get(id)

    if (action && !action.done) {
      const {slot} = action
      if (slot) slot.v = msg
      return _reply(ctx, await action.do())
    }

    const [data, err] = await get(msg)
    if (err) return _reply(ctx, err.message)
    _reply(ctx, await handle(id, data))
  }
}

function _reply(ctx: Context, result: Awaited<ReturnType<typeof handle>>) {
  result ??= '无可奉告🙊'
  if (typeof result === 'string') return ctx.reply(result)
  else if (result.options) {
    ctx.replyWithPoll(result.q, result.options, {is_anonymous: false, allows_multiple_answers: false})
      .then(message => polls.set(message.poll.id, message))
  } else return ctx.reply(result.q)
}

async function get(msg: string) {
  const url = new URL('https://api.wit.ai/message')
  url.searchParams.set('v', '20220420')
  url.searchParams.set('q', msg)

  return fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    },
    signal: AbortSignal.timeout(5e3)
  })
    .then<WitData>(res => res.json())
    .then(ok)
    .catch(err => {
      if (err instanceof Deno.errors.TimedOut) return error(new Error('请求超时'))
      return error(err)
    })
}

/** for action tpl */
function handle(id: number, data: WitData) {
  let intent = data.intents[0]

  console.log(data)

  if (!intent) {
    for (const k in data.entities) {
      if (k === 'food:food' || k === 'cuisine:cuisine') {
        intent = {name: 'food', id: '', confidence: 1}
        break
      }
    }
  }

  switch (intent.name) {
    case 'weather': {
      let location = ''
      for (const k in data.entities) {
        if (k === 'wit$location:location') location = data.entities[k][0].body
      }
      const action = new Weather({location})
      states.set(id, action)
      return action.do()
    }

    case 'food': {
      let location = ''
      let cuisine = ''
      for (const k in data.entities) {
        if (k === 'wit$location:location') location = data.entities[k][0].body
        if (k === 'cuisine:cuisine') cuisine = data.entities[k][0].body
      }
      const action = new Food({location, cuisine})
      states.set(id, action)
      return action.do()
    }

    case 'greeting': {
      const sentences = ['哥只是个传说', '聊五毛吗', '对，就🦐🚗🥚']
      return sentences[sentences.length * Math.random() | 0]
    }

    default: {
      for (const k in data.entities) {
        const sentences =  ['好菜啊', '我休息一会，给你追上我的机会', '菜要承认，挨打站稳']
        if (k === 'taunt:taunt') return sentences[sentences.length * Math.random() | 0]
      }

      return '无可奉告🙊'
    }
  }
}
