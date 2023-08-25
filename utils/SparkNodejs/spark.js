import { hmac, utf8, base64 } from './tool.js';
import { SparkChat } from './chat.js';
import { Socket } from './node-socket.js';
export class Spark {
    constructor({ secret, key, appid, uid, temperature, maxTokens, topK, chatId, useHistory, }) {
        if (!key || !secret)
            throw new Error('Invalid Key Or Secret');
        this.secret = secret;
        this.key = key;
        // @ts-ignore
        SparkChat.Socket = Socket;
        if (appid) {
            this.socket = new SparkChat({
                appid,
                uid,
                temperature,
                maxTokens,
                topK,
                chatId,
                useHistory,
                urlGetter: () => Promise.resolve(this.generateUrl())
            });
        }
    }
    generateUrl() {
        const data = this._generateAuth();
        const arr = [];
        for (const k in data) {
            arr.push(`${k}=${data[k]}`);
        }
        return `wss://spark-api.xf-yun.com/v1.1/chat?${arr.join('&')}`;
    }
    chat(data) {
        return this.socket.chat(data);
    }
    _generateAuth() {
        const host = 'spark-api.xf-yun.com';
        const date = new Date().toUTCString(); // 'Sun, 11 Jun 2023 01:31:08 GMT'; //
        return {
            host,
            date,
            authorization: this._authorize(host, date),
        };
    }
    _authorize(host, date) {
        const APISecret = this.secret;
        const APIKey = this.key;
        const tmp = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
        const sign = hmac(utf8(APISecret), utf8(tmp));
        // console.log(sign);
        const authorizationOrigin = `api_key="${APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${sign}"`;
        // console.log(authorizationOrigin);
        return base64(utf8(authorizationOrigin));
    }
}

export default Spark;