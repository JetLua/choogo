import {Bot, InlineKeyboard} from 'grammy'
import * as jarvis from './jarvis/mod.ts'

const TOKEN = Deno.env.get('TG_BOT')!
const bot = new Bot(TOKEN)
const queue = new Map<number, Array<number>>()

let jobs: Array<any>
let races: Array<any>

const ids = {
  job: '',
  race: ''
}

bot.on(['message:text', 'poll_answer'], jarvis.reply.bind(bot))

bot.command('game', async ctx => {
  await ctx.reply('🤔', {
    reply_markup: new InlineKeyboard()
      .text('职业', 'job').text('特质', 'race').row()
      .text('海克斯', 'hex').text('装备', 'equip')
  }).catch(console.error)
})

bot.on('callback_query:data', async ctx => {
  const {data: qs, message} = ctx.callbackQuery
  const cid = message!.chat.id
  const mid = message!.message_id

  if (qs === 'job') {
    jobs ??= await get('job')

    if (!jobs) return ctx.answerCallbackQuery({text: '获取资料失败😭'}).catch(console.error)

    ctx.answerCallbackQuery({text: '😊'}).catch(console.error)

    const keyboard = new InlineKeyboard()
    const _jobs = [...jobs, {name: '🔙', jobId: 'back'}]

    _jobs.forEach((item: any, i: number) => {
      keyboard.text(item.name, `jobs:${item.jobId}`)
      !((i + 1) % 2) && keyboard.row()
    })

    allow(cid, mid) && bot.api.editMessageReplyMarkup(cid, mid, {
      reply_markup: keyboard
    }).then(() => revoke(cid, mid)).catch(console.error)
  } else if (qs === 'race') {
    races ??= await get('race')

    if (!races) return ctx.answerCallbackQuery({
      text: '获取资料失败😭'
    }).catch(console.error)

    ctx.answerCallbackQuery({text: '😊'}).catch(console.error)

    const keyboard = new InlineKeyboard()
    const _races = [...races, {name: '🔙', raceId: 'back'}]

    _races.forEach((item: any, i: number) => {
      keyboard.text(item.name, `races:${item.raceId}`)
      !((i + 1) % 2) && keyboard.row()
    })

    allow(cid, mid) && bot.api.editMessageReplyMarkup(cid, mid, {
      reply_markup: keyboard
    }).then(() => revoke(cid, mid)).catch(console.error)
  } else if (qs.startsWith('jobs')) {
    if (qs.endsWith('back')) return back(cid, mid)
    jobs ??= await get('job')
    if (!jobs) return ctx.answerCallbackQuery({text: '获取资料失败😭'}).catch(console.error)

    const jobId = qs.replace('jobs:', '')
    if (jobId === ids.job) return ctx.answerCallbackQuery({text: '🤔'}).catch(console.error)
    ids.job = jobId

    const data = jobs.find(item => item.jobId === jobId)
    const msg = [
      `${data.name}`,
      `${data.introduce}`,
      Object.entries(data.level).map(item => {
        return `${item[0]}: ${item[1]}`
      }).join('\n')
    ].join('\n')
    ctx.answerCallbackQuery({text: '😊'}).catch(console.error)
    allow(cid, mid) && bot.api.editMessageText(cid, mid, msg, {
      reply_markup: message!.reply_markup
    }).then(() => revoke(cid, mid)).catch(console.error)
  } else if (qs.startsWith('races')) {
    if (qs.endsWith('back')) return back(cid, mid)
    races ??= await get('race')
    if (!races) return ctx.answerCallbackQuery({text: '获取资料失败😭'}).catch(console.error)
    const raceId = qs.replace('races:', '')

    if (raceId === ids.race) return ctx.answerCallbackQuery({text: '🤔'}).catch(console.error)
    ids.race = raceId

    const data = races.find(item => item.raceId === raceId)
    const msg = [
      `${data.name}`,
      `${data.introduce}`,
      Object.entries(data.level).map(item => {
        return `${item[0]}: ${item[1]}`
      }).join('\n')
    ].join('\n')
    ctx.answerCallbackQuery({text: '😊'}).catch(console.error)
    allow(cid, mid) && bot.api.editMessageText(cid, mid, msg, {
      reply_markup: message!.reply_markup
    }).then(() => revoke(cid, mid)).catch(console.error)
  } else {
    ctx.answerCallbackQuery({text: '😭'}).catch(console.error)
  }
})

bot.catch(console.error)

bot.api.setMyCommands([
  {command: 'game', description: '霓虹之夜'}
])

function get(type: 'job' | 'race' | 'hex' | 'equip') {
  return fetch(`https://game.gtimg.cn/images/lol/act/img/tft/js/${type}.js`, {
    signal: AbortSignal.timeout(3e3)
  })
    .then(res => res.json())
    .then(({data}) => data)
    .catch(console.error)
}

function allow(cid: number, mid: number) {
  const arr = queue.get(cid)
  if (!arr) return queue.set(cid, [mid])
  if (arr.includes(mid)) return false
  arr.push(mid)
  return true
}

function revoke(cid: number, mid: number) {
  const arr = queue.get(cid)
  if (!arr) return
  const index = arr.indexOf(mid)
  if (index === -1) return
  arr.splice(index, 1)
  if (!arr.length) queue.delete(cid)
}

function back(cid: number, mid: number) {
  return bot.api.editMessageText(cid, mid, '🤔', {
    reply_markup: new InlineKeyboard()
      .text('职业', 'job').text('特质', 'race').row()
      .text('海克斯', 'hex').text('装备', 'equip')
  }).catch(console.error)
}

if (import.meta.main) bot.start()

export default bot
