import express from 'express'
import { Server } from 'http'

let expressInstance = express()
let server: Server | undefined

export function listenCode(port: number, callback: (code: string | undefined) => Promise<void> | void) {
    server?.close()

    expressInstance.get('/', (req, res) => {
        res.send('Welcome')
    })

    expressInstance.get('/twitch', (req, res) => {
        callback(req.query.code?.toString())
        res.send('OK')
        server?.close()
    })

    server = expressInstance.listen(port)
}
