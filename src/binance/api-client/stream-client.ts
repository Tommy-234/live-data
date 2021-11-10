import WS from 'ws';
import { toNumber, isEmpty } from 'lodash';
import { StreamPayload, GenericStream } from '../../types';

const isServer = (): boolean => {
  return ! (typeof window != 'undefined' && window.document);
}

export class BinanceStream extends GenericStream {
  
  reset( streams: string ) {
    if (this.socket) {
      this.socket.close();
    }
    if (!isEmpty(streams)) {
      if (isServer()) {
        const ws = new WS(
          `${this.endpoint}?streams=${streams}`
        );
        ws.on( 'open', () => this.socket = ws );
        ws.on('message', (payload: string) => 
          this.callback(this.mapStreamData(JSON.parse(payload) as BinanceStreamPayload))
        );
      } else {
        const ws = new WebSocket(
          `${this.endpoint}?streams=${streams}`
        );
        ws.onopen = () => this.socket = ws
        ws.onmessage = (event) => 
          this.callback(this.mapStreamData(JSON.parse(event.data) as BinanceStreamPayload))
      }
    }
  }

  private mapStreamData(payload: BinanceStreamPayload): StreamPayload {
    return {
      stream: payload.stream,
      candle: {
        openTime: payload.data.k.t,
        open: toNumber(payload.data.k.o),
        high: toNumber(payload.data.k.h),
        low: toNumber(payload.data.k.l),
        close: toNumber(payload.data.k.c),
        volume: toNumber(payload.data.k.v),
        closeTime: payload.data.k.T,
        quoteAssetVolume: toNumber(payload.data.k.q),
        numberTrades: payload.data.k.n,
        baseAssetBuyVolume: toNumber(payload.data.k.V),
        quoteAssetBuyVolume: toNumber(payload.data.k.Q),
        isClosed: payload.data.k.x
      }
    }
  }
}

type BinanceStreamPayload = {
  stream: string
  data: {
    e: string,
    E: number,
    s: string,
    k: {
      t: number,
      T: number,
      s: string,
      i: string,
      f: number,
      L: number,
      o: string,
      c: string,
      h: string,
      l: string,
      v: string,
      n: number,
      x: Boolean,
      q: string,
      V: string,
      Q: string,
      B: string
    }
  }
}
