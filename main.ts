import {Application, Router} from 'oak'
import {Bot} from 'grammy'

const app = new Application()
const router = new Router()
const TG_BOT = Deno.env.get('TG_BOT')!

const bot = new Bot(TG_BOT)

bot.on('message', ctx => {
  ctx.reply(`Copy: ${ctx.message.text}`)
})

bot.start()

router.post('/webhook', async ctx => {
  const result = await ctx.request.body({type: 'json'}).value.catch(() => null)
  // ctx.response.body = await result.value
  if (!result) return ctx.response.body = 'Whoops!'

  bot.api.sendMessage(1335910130, 'Got It!')
  ctx.response.body = 'ok'
})

router.get('/', async ctx => {
  ctx.response.body = 'Hi, I\'m JetLu.'
})

app.use(router.allowedMethods())
app.use(router.routes())
app.listen({port: 8080})
