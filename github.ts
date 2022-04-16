const headers = new Headers()

headers.set('content-type', 'application/json')
headers.set('Authorization', 'Bearer QMITROFA6RTDXVVLG7HUGP7ATMTI4DZL')

const client = Deno.createHttpClient({
  proxy: {url: 'http://127.0.0.1:1080'}
})

fetch(`https://api.wit.ai/message?v=20220415&q=好饿`, {
  client,
  headers,
  method: 'GET'
}).then(res => res.json()).then(console.log).catch(console.error)
