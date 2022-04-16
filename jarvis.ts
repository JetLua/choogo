const TOKEN = Deno.env.get('WIT')!

interface Result {
  text: string
  intents: Array<{
    id: string
    name: string
    confidence: number
  }>
  entities: Record<string, Array<{
    id: string
    name: string
    role: string
    start: number
    end: number
    body: string
    value: string
    type: string
  }>>
}

export async function ask(msg: string) {
  const url = new URL('https://api.wit.ai/message')
  url.searchParams.set('v', '20220416')
  url.searchParams.set('q', msg)
  return fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  }).then<Result>(res => res.json()).then<string>(data => {
    let subject: string | undefined
    let adjective: string | undefined
    for (const k in data.entities) {
      switch (k) {
        case 'food:food': {
          subject = data.entities[k].map(item => item.body).join(',')
          break
        }

        case 'adjective:adjective': {
          adjective = data.entities[k].at(0)?.value
          let list: Array<string> = []

          if (adjective === '不好') {
            list = [
              '确实一般般吧', '我也不喜欢', '差了点意思',
              '我觉得还行吧', '不敢苟同'
            ]
          } else {
            list = [
              '确实挺不错', '我不是很喜欢', '有点好吃😋',
              '我觉得还行吧', '你喜欢你的我喜欢我的'
            ]
          }
          adjective = list[Math.random() * list.length | 0]
          break
        }
      }
    }
    return `${subject}${adjective}`
  })
}
