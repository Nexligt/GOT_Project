// src/App.js
import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { GameOfThrones } from './Game';
import { GameOfThronesBoard } from './Board';
import { GameOfThronesLobby } from './Lobby';

const serveur = 'http://localhost:8000';

// const GameOfThronesClient = Client({
//     game: GameOfThrones,
//     board: GameOfThronesBoard,
//     multiplayer: SocketIO({ server: 'http://localhost:8000' }),
// });

// ONLINE:
const App = () => (
    <div>
        <GameOfThronesLobby
            gameServer={serveur}
            lobbyServer={serveur}
            gameComponents={[{ game: GameOfThrones, board: GameOfThronesBoard }]}
        />
    </div>
)

// LOCAL:
//const App = () => (
//  <div>
//        <GameOfThronesClient />
//  </div>
//)

export default App;
