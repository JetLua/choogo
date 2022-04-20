interface WitData {
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
