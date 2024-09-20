import type { Credentials, FetchClientResponse } from "./types"

export function appendExperedAt(response: FetchClientResponse<Credentials>): FetchClientResponse<Credentials> {
    response.body.expered_at_ms = Date.now() + (response.body.expires_in * 1000)
    return response
}

export function serialize(obj: object) {
    let str = []
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + obj[p])
      }
    }
    return str.join('&')
  }