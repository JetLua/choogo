import {Application, Router} from 'oak'

const app = new Application()
const router = new Router()

router.get('/webbook', async ctx => {
  const result = ctx.request.body({type: 'json'})
  ctx.response.body = await result.value
})

app.use(router.allowedMethods())
app.use(router.routes())
app.listen({port: 8080})
