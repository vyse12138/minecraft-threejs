const { Server } = require('socket.io')
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001']
  }
})

io.on('connection', socket => {
  console.log('a user connected')

  socket.on('chat', message => {
    console.log('message: ' + message)
    io.emit('chat', message)
  })
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})
