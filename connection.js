const mysql = require('mysql');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'esp_data'
};

let connection;

function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to the database:', err);
            setTimeout(handleDisconnect, 2000); // Thử lại kết nối sau 2 giây
        } else {
            console.log('Connected to the MySQL database.');
        }
    });

    connection.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection lost. Reconnecting...');
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = connection;
