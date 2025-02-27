// src/App.js
import React from 'react';
import { Client } from 'boardgame.io/react';
import { GameOfThrones } from './Game';
import { GameOfThronesBoard } from './Board';
import { SocketIO } from 'boardgame.io/multiplayer';

const GameOfThronesClient = Client({
    game: GameOfThrones,
    board: GameOfThronesBoard,
    multiplayer: SocketIO({ server: 'localhost:8000' }),
});

class App extends React.Component {
    state = { playerID: null };

    render() {
        if (this.state.playerID === null) {
            return (
                <div>
                    <p>Select your House</p>
                    <button onClick={() => this.setState({ playerID: '0' })}>
                        Player 0 - House Stark
                    </button>
                    <button onClick={() => this.setState({ playerID: '1' })}>
                        Player 1 - House Lannister
                    </button>
                </div>
            );
        }
        return (
            <div>
                <GameOfThronesClient playerID={this.state.playerID} />
            </div>
        );
    }
}

export default App;
