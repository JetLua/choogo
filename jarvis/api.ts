const TOKEN = Deno.env.get('AMAP')!
const BASE_URL = 'https://restapi.amap.com/v3'

export async function getWeather(city: string) {
  interface Data {
    lives: Array<{
      city: string
      weather: string
      province: string
      humidity: string
      temperature: string
      winddirection: string
      windpower: string
    }>
  }
  const code = await getCode(city)
  if (!code) return `无法查询${city}的天气`
  const url = new URL(`${BASE_URL}/weather/weatherInfo`)
  url.searchParams.set('key', TOKEN)
  url.searchParams.set('city', code)
  url.searchParams.set('extensions', 'base')
  return fetch(url.toString())
    .then<Data>(res => res.json())
    .then(data => {
      const live = data.lives[0]
      return `${live.province}${live.city} ${live.weather} 气温: ${live.temperature}°C 湿度: ${live.humidity} ${live.winddirection}风(${live.windpower}级)`
    })
    .catch(() => undefined)
}

export async function getRestaurant(city: string, keywords: string) {
  interface Data {
    pois: Array<{
      name: string
      address: string
      pname: string
      cityname: string
      business_area: string
    }>
  }
  const code = await getCode(city)
  if (!code) return `无法查询${city}的餐厅`
  const url = new URL(`${BASE_URL}/place/text`)
  url.searchParams.set('key', TOKEN)
  url.searchParams.set('keywords', keywords)
  url.searchParams.set('city', code)
  url.searchParams.set('extensions', 'all')
  return fetch(url.toString())
    .then<Data>(res => res.json())
    .then(data => {
      return data.pois.map(item => {
        return `${item.name}: ${item.pname}${item.cityname}${item.business_area}`
      }).join('\n\n')
    })
    .catch(() => undefined)
}

export function getCode(address: string) {
  interface Data {
    geocodes: Array<{
      adcode: string
    }>
  }
  const url = new URL(`${BASE_URL}/geocode/geo`)
  url.searchParams.set('key', TOKEN)
  url.searchParams.set('address', address)
  return fetch(url.toString())
    .then<Data>(res => res.json())
    .then(data => data.geocodes[0].adcode)
    .catch(() => undefined)
}
