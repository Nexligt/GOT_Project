import React from 'react';
import { Lobby } from 'boardgame.io/react';

export class GameOfThronesLobby extends Lobby {
    constructor(props) {
        super(props);
        this.state = {
            matchNumPlayers: 3, // Initialisation à 3
            playerName: '',
            matches: [],
            runningMatches: [] // Tableau pour stocker plusieurs matchs
        };
    }

    handleChangeName(event) {
        this.setState({
            playerName: event.target.value,
        });
    }

    handleNewMatch(event, numPlayers) {
        console.log("New match with " + parseInt(numPlayers) + " Players");
        this._createMatch('game-of-thrones', numPlayers);
    }

    handleRefreshMatches(event) {
        this._updateConnection();
    }

    handleJoinMatch(event, matchID, playerID) {
        console.log(`Joining match: ${matchID}, player: ${playerID}`);
        this._joinMatch('game-of-thrones', matchID, playerID);

        // Ajouter le match à la liste des matchs en cours
        this.setState(prevState => ({
            runningMatches: [...prevState.runningMatches, { matchID, playerID }]
        }));
    }

    handleLeaveMatch(event, matchID) {
        console.log(`Leaving match: ${matchID}`);
        this._leaveMatch('game-of-thrones', matchID);

        // Supprimer le match de la liste des matchs en cours
        this.setState(prevState => ({
            runningMatches: prevState.runningMatches.filter(match => match.matchID !== matchID)
        }));
    }

    handleStartMatch(event, matchID) {
        console.log(`Starting match: ${matchID}`);
        // Lancer la partie
        this._startMatch('game-of-thrones', matchID);
    }

    handleEnterLobby(event) {
        this._enterLobby(this.state.playerName);
    }

    handleExitLobby(event) {
        this._exitLobby();
    }

    handleExitMatch(event) {
        this._exitMatch();
    }

    render() {
        const match_id_col_style = {
            width: "150px",
            textAlign: 'center',
            padding: '3px'
        };
        const player_col_style = {
            width: "100px",
            textAlign: 'center',
            padding: '3px'
        };
        const button_col_style = {
            width: "100px",
            textAlign: 'center',
            padding: '3px'
        };

        // Header de la table
        const matches_thead = (
            <tr>
                <th style={match_id_col_style}>Match ID</th>
                <th style={player_col_style}>Players</th>
                <th style={button_col_style}><input type="button" value="New Match" onClick={() => this.handleNewMatch(null, this.state.matchNumPlayers)} /></th>
                <th style={button_col_style}><input type="button" value="Refresh" onClick={(event) => this.handleRefreshMatches(event)} /></th>
            </tr>
        );

        // Body de la table (Liste des parties)
        const matches_tbody = this.connection.matches.map((match) => {
            const playerCells = match.players.map((player, index) => (
                <td key={`${match.matchID}-${index}`} style={player_col_style}>
                    {player.name || <input type="button" value="Join" onClick={(event) => this.handleJoinMatch(event, match.matchID, index.toString())} />}
                </td>
            ));

            return (
                <tr key={match.matchID}>
                    <td style={match_id_col_style}>{match.matchID}</td>
                    <td style={player_col_style}>{match.players.filter(p => p.name).length} / {match.players.length}</td>
                    {playerCells}
                </tr>
            );
        });

        // Affichage de l'interface utilisateur
        if (this.state.phase === 'enter') {
            return (
                <div>
                    {'Enter name: '}
                    <input type="text" value={this.state.playerName} onChange={(event) => this.handleChangeName(event)} />
                    <input type="button" value="Enter Lobby" onClick={(event) => this.handleEnterLobby(event)} />
                </div>
            );
        } else if (this.state.phase === 'list') {
            return (
                <div>
                    <input type="button" value="Exit Lobby" onClick={(event) => this.handleExitLobby(event)} />
                    <br /><br />
                    <label>
                        Number of Players:
                        <select
                            value={this.state.matchNumPlayers}
                            onChange={(event) => this.setState({ matchNumPlayers: parseInt(event.target.value) })}
                        >
                            {[3, 4, 5, 6].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </label>
                    <table id="matches">
                        <thead>{matches_thead}</thead>
                        <tbody>{matches_tbody}</tbody>
                    </table>

                    {/* Affichage des matchs en cours */}
                    <h3>Running Matches</h3>
                    <ul>
                        {this.state.runningMatches.map((match, index) => (
                            <li key={index}>
                                Match ID: {match.matchID} - Player ID: {match.playerID}
                                {/* Vérification du nombre de joueurs avant d'afficher le bouton Play */}
                                {this.connection.matches.find(m => m.matchID === match.matchID).players.filter(p => p.name).length === this.state.matchNumPlayers ? (
                                    <button onClick={(event) => this.handleStartMatch(event, match.matchID)}>Play</button>
                                ) : (
                                    <span>  Waiting for players...  </span>
                                )}
                                <button onClick={(event) => this.handleLeaveMatch(event, match.matchID)}>Leave</button>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        } else if (this.state.phase === 'play') {
            const boardElement = React.createElement(this.state.runningMatch.app, {
                matchID: this.state.runningMatch.matchID,
                playerID: this.state.runningMatch.playerID,
                credentials: this.state.runningMatch.credentials
            });
            return (
                <div>
                    {boardElement}
                </div>
            );
        }
    }
}
