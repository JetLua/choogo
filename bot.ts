import {Bot, InlineKeyboard} from 'grammy'

const TOKEN = Deno.env.get('TG_BOT')!
const bot = new Bot(TOKEN)
const queue = new Map<number, Array<number>>()

let jobs: Array<any>

bot.command('game', async ctx => {
  await ctx.reply('👌', {
    reply_markup: new InlineKeyboard()
      .text('职业', 'job').text('特质', 'race').row()
      .text('海克斯', 'hex').text('装备', 'equip')
  })
})

bot.on('callback_query:data', async ctx => {
  const {data: qs, message} = ctx.callbackQuery
  const cid = message!.chat.id
  const mid = message!.message_id

  if (qs === 'job') {
    jobs ??= await get('job')

    if (!jobs) return ctx.answerCallbackQuery({
      text: '获取资料失败😭'
    })

    ctx.answerCallbackQuery({text: '😊'})

    const keyboard = new InlineKeyboard()

    jobs.forEach((item: any, i: number) => {
      keyboard.text(item.name, `jobs:${item.jobId}`)
      !((i + 1) % 2) && keyboard.row()
    })

    allow(cid, mid) && bot.api.editMessageReplyMarkup(cid, mid, {
      reply_markup: keyboard
    }).then(() => revoke(cid, mid))
  } else if (jobs && qs.startsWith('jobs')) {
    const jobId = qs.replace('jobs:', '')
    const data = jobs.find(item => item.jobId === jobId)
    const msg = [
      `${data.name}`,
      `${data.introduce}`,
      Object.entries(data.level).map(item => {
        return `${item[0]}: ${item[1]}`
      }).join('\n')
    ].join('\n')
    ctx.answerCallbackQuery({text: '😊'})
    allow(cid, mid) && bot.api.editMessageText(cid, mid, msg, {
      reply_markup: message!.reply_markup
    }).then(() => revoke(cid, mid))
  } else {
    ctx.answerCallbackQuery({text: '😭'})
  }
})

bot.api.setMyCommands([
  {command: 'game', description: '霓虹之夜'}
])

bot.start()

function get(type: 'job' | 'race' | 'hex' | 'equip') {
  return fetch(`https://game.gtimg.cn/images/lol/act/img/tft/js/${type}.js`)
    .then(res => res.json()).catch(() => null)
}

function allow(cid: number, mid: number) {
  if (!queue.has(cid)) {
    queue.set(cid, [mid])
    return true
  } else if (queue.get(cid)!.includes(mid)) return false
  queue.get(cid)!.push(mid)
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

export default bot
