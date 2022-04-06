import {Application, Router} from 'oak'
import {Bot} from 'grammy'

const app = new Application()
const router = new Router()
const TG_BOT = Deno.env.get('TG_BOT')!

const bot = new Bot(TG_BOT)

bot.on('message', ctx => {
  ctx.reply('Copy')
})

bot.start()

router.get('/webhook', async ctx => {
  // const result = ctx.request.body({type: 'json'})
  // ctx.response.body = await result.value
  // return ctx.
  ctx.response.body = TG_BOT
})

router.get('/', async ctx => {
  ctx.response.body = 'Hi, I\'m JetLu.'
})

app.use(router.allowedMethods())
app.use(router.routes())
app.listen({port: 8080})
