export type * from './fetch-client'

export type ClientCredentials = {
    access_token: string,
    expires_in: number, // seconds
    expered_at_ms: number, 
    token_type: string,
}

export type TwitchResponse<T> = {
    data: T,
    pagination: {
        cursor: string
    }
}

export type TwitchStreamData = {
    id: string,
    user_id: string,
    user_login: string,
    user_name: string
    game_id: string,
    game_name: string,
    type: string
    title: string,
    tags: string[]
    viewer_count: number
    started_at: string,
    language: string,
    thumbnail_url: string
    tag_ids: string[]
    is_mature: boolean
}