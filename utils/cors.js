import cors from 'cors'
export function corsWhitelist() {
    // const whitelist = ["http://127.0.0.1:5500"]
    // const corsOptions = {
    //     origin: whitelist
    // }
    return cors()
    // return cors(corsOptions)
}