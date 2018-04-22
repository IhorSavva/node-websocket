/**
 * webSocket
 */
const Koa = require('koa')
const app = new Koa().callback()
const Server = require('http').createServer(app)
const Socket = require('socket.io')(Server)
const { limit, marks } = require('./mock')
const Axios = require('axios')

// 定时请求
const timeingRequest = (ws) => {
  requestKline(ws, {
    'symbol': 'AAPL',
    'resolution': 'D',
    'to': parseInt(Date.now() / 1000),
    'from': parseInt(Date.now() / 1000) - 31104060
  })
  let nextTime = setInterval(function () {
    requestKline(ws)
  }, 30000)
}

// 请求k线数据
const requestKline = async (ws, params) => {
  let data = null
  if (params) {
    data = params
  } else {
    data = {
      'symbol': 'AAPL',
      'resolution': 'D',
      'to': parseInt(Date.now() / 1000),
      'from': parseInt(Date.now() / 1000) - 864000
    }
  }
  console.log(` >> ${new Date().toLocaleString()} request kline: ${JSON.stringify(data)}`)
  const response = await Axios.get('https://demo_feed.tradingview.com/history', { params: data })
  const res = response.data
  console.log(` >> ${new Date().toLocaleString()} request kline result: ${res.s}`)
  if (res.s === 'ok') {
    let kLine = []
    res.t.forEach((v, i) => {
      kLine.push({
        'time': v,
        'close': res.c[i],
        'open': res.o[i],
        'high': res.h[i],
        'low': res.l[i],
        'volume': res.v[i]
      })
    })
    ws.emit('kline', kLine)
  }
  if (res.s === 'no_data') {
    console.log(` >> No Data ${parseInt(Date.now() / 1000) - res.nextTime}s return result`)
  }
}

Socket.on('connection', ws => {
  console.log(` >> ${new Date().toLocaleString()} connection ${ws.request.headers.origin} success`)
  ws.on('kline', params => {
    timeingRequest(ws)
  })
  ws.on('limit', params => {
    ws.emit('limit', limit)
  })
  ws.on('marks', params => {
    ws.emit('marks', marks)
  })
})

Server.listen(3010, () => {
  console.log(` >> ${new Date().toLocaleString()} Server run 3010`)
})