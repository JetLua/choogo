import {Application, Router} from 'oak'
import {Bot} from 'grammy'

const app = new Application()
const router = new Router()
const TG_BOT = Deno.env.get('TG_BOT')!

const bot = new Bot(TG_BOT)

bot.on('message', ctx => {
  ctx.reply(`Copy: ${ctx.message}`)
})

bot.start()

router.post('/webhook', async ctx => {
  const result = ctx.request.body({type: 'json'})
  // ctx.response.body = await result.value
  bot.api.sendMessage(1335910130, await result.value.catch(() => 'Whoops!'))
  ctx.response.body = 'ok'
})

router.get('/', async ctx => {
  ctx.response.body = 'Hi, I\'m JetLu.'
})

app.use(router.allowedMethods())
app.use(router.routes())
app.listen({port: 8080})
