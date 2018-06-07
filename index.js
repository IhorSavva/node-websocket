const Koa = require('koa')
const App = new Koa()
const server = require('http').createServer(App.callback())
const WebSocket = require('ws')
const ws = new WebSocket.Server({ server })
const kline = require('./data')

ws.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {

    const data = JSON.parse(message)

    if (data.type === 'kline') {
      if (data.resolution === '1D') {
        ws.send(JSON.stringify({ kline: kline, symbol: data.symbol, resolution: data.resolution, type: data.type }))
      } else {
        createRandomData(ws, data)
      }
    }

    if (data.type === 'updata') {
      if (data.resolution === '1D') {
        // 一天以及一天以上暂时不做处理
        ws.send(JSON.stringify({ ping: Date.now() }))
      } else {
        // 这里返回最新数据
        const num = setRandomValue(2, 2)
        ws.send(JSON.stringify({
          kline: [
            {
              time: (parseInt(Date.now() / 10000) + (data.resolution * 6)) * 10000,
              open: num - setRandomValue(1),
              close: num - setRandomValue(1),
              low: num - setRandomValue(1),
              high: num,
              volume: 2554477 - setRandomValue(6)
            }
          ],
          symbol: data.symbol,
          resolution: data.resolution,
          type: data.type
        }))
      }
    }
  })

})

const setRandomValue = (integerNum, decimalNum) => {

  let randomNum = Math.random() * Math.pow(10, integerNum) + Math.pow(10, integerNum)
  // 整数部分
  let integerPart = 0
  if (integerNum) {
    integerPart = Math.floor(randomNum)
  }
  //  小数部分
  let decimalPart = 0.00
  if (decimalNum) {
    decimalPart = randomNum.toString().split(".")[1].substring(0, decimalNum)
    decimalPart = '0.' + decimalPart
    decimalPart = parseFloat(decimalPart)
  }
  return integerPart + decimalPart
}

const createRandomData = (ws, data) => {
  const { symbol, resolution, from, to, type } = data
  const list = []
  for (let i = 0; i < 1000; i++) {
    const num = setRandomValue(2, 2)
    const item = {
      time: (parseInt(Date.now() / 10000) - (i * resolution * 6)) * 10000,
      open: num - setRandomValue(1),
      close: num - setRandomValue(1),
      low: num - setRandomValue(1),
      high: num,
      volume: 2554477 - setRandomValue(6)
    }
    list.push(item)
  }

  ws.send(JSON.stringify({ kline: list, symbol: data.symbol, resolution: data.resolution, type: data.type }))
}

server.listen(3010, () => {
  console.log(`Server listening at port 3010...`)
})