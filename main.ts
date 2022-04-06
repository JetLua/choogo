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

function sendMessage(raw: string, to: string | number = 969013906) {
  raw = raw
    .replaceAll('_', '\\_')
    .replaceAll('(', '\\(')
    .replaceAll('.', '\\.')
    .replaceAll(')', '\\)')
    .replaceAll('*', '\\*')
    .replaceAll('~', '\\~')
    .replaceAll('#', '\\#')
    .replaceAll('+', '\\+')
    .replaceAll('-', '\\-')
    .replaceAll('=', '\\=')
    .replaceAll('{', '\\{')
    .replaceAll('}', '\\}')
  bot.api.sendMessage(to, raw, {parse_mode: 'MarkdownV2'})
}

router.post('/webhook', async ctx => {
  interface Data {
    line_items?: Array<{
      title: string
      quantity: number
      price: string
      price_set: {
        shop_money: {
          currency_code: string
        }
      }
    }>
    email?: string
    currency?: string
    name?: string
    cancel_reason?: string
    total_price?: string
  }
  const data: Data = await ctx.request.body({type: 'json'}).value.catch(() => null)
  if (!data) return ctx.response.body = 'Whoops!'

  const topic = ctx.request.headers.get('X-Shopify-Topic')
  const domain = ctx.request.headers.get('X-Shopify-Shop-Domain')

  switch (topic) {
    case 'carts/update': {
      sendMessage(data.line_items!.map(item => {
        return `[${item.title}](https://${domain}/products/${item.title}) ${item.quantity} ${item.price}${item.price_set.shop_money.currency_code}`
      }).join('\n'))
      break
    }

    case 'order/paid': {
      sendMessage([
        `email: ${data.email}`,
        `price: ${data.total_price}${data.currency}`,
        `cancel_reason: ${data.cancel_reason}`
      ].join('\n'))
      break
    }
  }

  ctx.response.body = 'ok'
})

router.get('/', async ctx => {
  ctx.response.body = 'Hi, I\'m JetLu.'
})

app.use(router.allowedMethods())
app.use(router.routes())
app.listen({port: 8080})
