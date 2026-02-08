const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Permette comunicazioni da domini esterni (Aruba)

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permette al tuo sito Aruba di connettersi
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e7 // 10MB per le immagini
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('send-msg', (data) => {
        const msgId = 'msg-' + Math.random().toString(36).substr(2, 9);
        // Distribuisce il messaggio a tutti nella stanza
        io.to(data.roomId).emit('receive-msg', { ...data, id: msgId });
    });

    socket.on('msg-read-confirm', ({ roomId, msgId }) => {
        io.to(roomId).emit('destroy-msg', msgId);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server pronto sulla porta ${PORT}`));
