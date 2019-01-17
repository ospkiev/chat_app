const cors = require('cors');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server, {
    path: '/chat/',
    origins: "*:*"
});
const PORT = process.env.PORT || 3003;

const mongoose = require('mongoose');

const Message = require('./Schema');

mongoose.Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://admin:19851985Pol@ds157064.mlab.com:57064/sandbox_db');

app.use(cors());
app.options('*', cors());


app.get('/', (req, res) => {
    Message.find({}, (err, message) => {
        if (err) throw err;
        res.json(message);
    })
})

let online = 0;
io.on('connection', (client) => {
    console.log("User connected");
    console.log(++online);
    client.broadcast.emit("change-online", online);
    client.on("disconnect", () => {
        console.log(--online);
        client.broadcast.emit("change-online", online);

    });

    client.on("message", (message) => {
        console.log(message);
        client.broadcast.emit("new-message", message);
        const newMessage = Message(message)
        console.log(newMessage)
        newMessage.save();
        let M = Message.find();
        // console.log(M);
    });

    client.on("typing", (is) => {
        client.broadcast.emit("somebody-typing", is);
    })
});


app.use(express.static('../build'));
server.listen(PORT, () => (console.log(`server is running on ${PORT}`)));