const express = require('express');
const app = express();

let servers = [
    "localhost:3001",
    "localhost:3002"
];
let current = 0;

app.get('/getServer', (req, res) => {
    const server = servers[current % servers.length];
    current++;
    res.json({ code: 200, server: server });
});

app.listen(8000, () => {
    console.log("DNS Registry running on http://localhost:8000");
});
