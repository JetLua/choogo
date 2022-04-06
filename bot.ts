import {Bot, InlineKeyboard, Context} from 'grammy'

const TOKEN = Deno.env.get('TG_BOT')!

const bot = new Bot(TOKEN)

type Message = Awaited<ReturnType<Context['reply']>>

let jobs: Array<any>

const messages = {
  intro: null as unknown as Message,
  keyboard: null as unknown as Message
}

bot.command('game', async ctx => {
  messages.keyboard = await ctx.reply('👌', {
    reply_markup: new InlineKeyboard()
      .text('职业', 'job').text('特质', 'race').row()
      .text('海克斯', 'hex').text('装备', 'equip')
  })
})

bot.on('callback_query:data', async ctx => {
  const qs = ctx.callbackQuery.data
  if (qs === 'job') {
    const data = await get('job')

    if (!data) return ctx.answerCallbackQuery({
      text: '获取资料失败😭'
    })

    ctx.answerCallbackQuery({text: '😊'})

    const list = jobs = data.data
    const keyboard = new InlineKeyboard()

    list.forEach((item: any, i: number) => {
      keyboard.text(item.name, `jobs:${item.jobId}`)
      !((i + 1) % 2) && keyboard.row()
    })

    bot.api.editMessageReplyMarkup(messages.keyboard.chat.id, messages.keyboard.message_id, {
      reply_markup: keyboard
    })
  } else if (qs.startsWith('jobs')) {
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
    if (messages.intro) return bot.api.editMessageText(messages.intro.chat.id, messages.intro.message_id, msg)
    messages.intro = await ctx.reply(msg)
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

export default bot
