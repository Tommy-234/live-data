import WebSocket from 'ws';
import { toNumber } from 'lodash';
import { StreamPayload, GenericStream } from '../../types';

export class BinanceStream extends GenericStream {

  reset( streams: string ) {
    const ws = new WebSocket(
      `${this.endpoint}?streams=${streams}`
    );
    ws.on('open', () => {
      console.log('connected to Binance data stream - ' + streams);
      if (this.socket) {
        this.socket.close();
      }
      this.socket = ws;
    });
    
    ws.on('message', (payload: string) => 
      this.callback(this.mapStreamData(JSON.parse(payload) as BinanceStreamPayload))
    );
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
