import * as api from './api.ts'

enum ActionType {
  Food,
  Trip,
  Live,
  Clothing,
}

interface Step {
  q: string
  v: string
  options?: Array<string>
}

export abstract class Action {
  static Type = ActionType
  abstract done: boolean
  abstract slots: {[key: string]: Step}
  abstract do(): Promise<Step | undefined | string>

  get slot() {
    const {slots} = this
    for (const k in slots) {
      const _k = k as keyof typeof this.slots
      if (!slots[_k].v) return slots[_k]
    }
  }
}

export class Weather extends Action {
  done = false
  slots = {location: {q: '想查询哪个城市的天气呢', v: ''}}

  constructor(opts?: Record<'location', string>) {
    super()

    if (opts) for (const k in opts) {
      const _k = k as unknown as keyof typeof opts
      this.slots[_k].v = opts[_k]
    }
  }

  async do() {
    const slot = this.slot
    if (!slot) return api.getWeather(this.slots.location.v).finally(() => this.done = true)
    if (!slot.v) return slot
  }
}

export class Food extends Action {
  done = false
  slots = {
    location: {q: '想去哪里吃东西呢', v: ''},
    cuisine: {q: '想吃什么菜系呢', v: '', options: ['徽菜', '湘菜', '粤菜', '火锅', '杭帮菜', '快餐']}
  }

  constructor(opts?: Record<'location' | 'cuisine', string>) {
    super()

    if (opts) for (const k in opts) {
      const _k = k as unknown as keyof typeof opts
      this.slots[_k].v = opts[_k]
    }

    console.log(opts)
  }

  async do() {
    let slot = this.slot
    if (!slot) return api.getRestaurant(this.slots.location.v, this.slots.cuisine.v).finally(() => this.done = true)
    if (!slot.v) return slot
  }
}
