const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const connection = require('./connection');
const app = express();
const port = 3001;

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server and bind it to the HTTP server
const ws = new WebSocket.Server({ server });
var clients = [];
ws.on('connection', function (socket, req) {
    console.log('New client connected');

    socket.on('message', function (message) {
        console.log('received: %s', message);

        // Broadcast message to all clients
        ws.clients.forEach(function each(client) {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
                console.log(`Broadcast to client: ${message}`);
            }
        });
    });

    socket.on('close', function () {
        console.log('Client disconnected');
    });
});


ws.on('message', function (message) {
    console.log('received: %s', message);
    let data = JSON.parse(message);

    if (data.temperature && data.humidity) {
        let query = 'INSERT INTO sensor_data (temperature, humidity) VALUES (?, ?)';
        connection.query(query, [data.temperature, data.humidity], (err, result) => {
            if (err) {
                console.error('Error inserting data into MySQL:', err);
            } else {
                console.log('Data inserted into MySQL:', result.insertId);
            }
        });
    }

    broadcast(socket, message);
});


function broadcast(socket, data) {
    console.log(clients.length);
    for (var i = 0; i < clients.length; i++) {
        if (clients[i] != socket) {
            clients[i].send(data);
            console.log(`client ${i} send ${data}`);
        }
    }
}
app.get('/data', (req, res) => {
    const query = 'SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 10'; // Modify the table name if needed
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching data:', error);
            res.status(500).send('Error fetching data');
        } else {
            res.json(results);
        }
    });
});
// Khởi động server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
