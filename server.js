const fs = require('fs');
const https = require('https');
const socketIo = require('socket.io');
const path = require('path'); 

// SSL/TLS-Zertifikate laden
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/llunix-web.westeurope.cloudapp.azure.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/llunix-web.westeurope.cloudapp.azure.com/fullchain.pem')
};

// HTTPS-Server auf Port 443 erstellen
const server = https.createServer(options, (req, res) => {
    // Bestimme den Pfad zur angeforderten Datei
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    // Bestimme den Content-Type basierend auf der Dateiendung
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        case '.woff':
        case '.woff2':
            contentType = 'font/woff';
            break;
        // Füge weitere MIME-Typen hinzu, falls erforderlich
    }

    // Lese die Datei und sende sie als Antwort
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Datei nicht gefunden
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Not Found</h1>');
            } else {
                // Serverfehler
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            // Datei gefunden, sende sie
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

const io = socketIo(server);

// Verbindung zu socket.io handhaben
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log('Message: ' + msg);
        io.emit('chat message', msg); // Nachricht an alle Clients senden
    });
});

// Server auf Port 443 starten
server.listen(443, () => {
    console.log('Server running on port 443');
});

