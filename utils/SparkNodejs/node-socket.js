import { WebSocket } from 'ws';
// 简单封装一下
export class Socket {
    constructor(url) {
        this.onerror = null;
        this.onopen = null;
        this.onclose = null;
        this.onmessage = null;
        const ws = new WebSocket(url);
        ws.on('error', (e) => {
            if (this.onerror)
                this.onerror(e);
        });
        ws.on('close', (e) => {
            if (this.onclose)
                this.onclose(e);
        });
        ws.on('open', (e) => {
            if (this.onopen)
                this.onopen(e);
        });
        ws.on('message', (e) => {
            if (this.onmessage) {
                this.onmessage({
                    data: e.toString('utf8')
                });
            }
        });
        this.socket = ws;
    }
    send(data) {
        this.socket.send(data);
    }
    close() {
        this.socket.close();
    }
}
