// src/server.js
const { Server, Origins } = require('boardgame.io/server');
const { GameOfThrones } = require('./Game');

const server = Server({
    games: [GameOfThrones],
    origins: [Origins.LOCALHOST],
});

server.run(8000)
