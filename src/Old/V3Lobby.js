import React from 'react';
import { Lobby } from 'boardgame.io/react';

export class GameOfThronesLobby extends Lobby {
    constructor(props) {
        super(props);
        this.state = {
            matchNumPlayers: 1,
            playerName: '',
            matches: [],
            joinMatches: [],
            runningMatch: null,
            playerID: null,
            
            //Pour le debug
            selectedMatchID: '', // Pour stocker le Match ID saisi
            playersInMatch: [] // Pour stocker les joueurs d'un match spécifique
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

    handleJoinMatch(event, matchID, playerID = null) {
        const match = this.connection.matches.find(m => m.matchID === matchID);
        this.state.playerID = match.players.filter(p => p.name).length.toString();
        
    
        // Vérifie si le joueur fait déjà partie du match
        if (match && match.players.some(player => player.name === this.state.playerName)) {
            alert("You are already part of this match.");
            return;
        }

        // Vérifie si le joueur est déjà inscrit à un autre match
        if (this.state.joinMatches.length > 0) {
            alert("You are already part of another match. You can only join one match at a time.");
            return;
        }
        

        this._joinMatch('game-of-thrones', matchID, this.state.playerID);

        console.log(`Joining match: ${matchID}, player: ${this.state.playerName}, id : ${this.state.playerID}`);
    
        this.setState(prevState => ({
            joinMatches: [...prevState.joinMatches, { matchID }]
        }));
    }
    

    handleLeaveMatch(event, matchID) {
        console.log(`Leaving match: ${matchID}`);
        this._leaveMatch('game-of-thrones', matchID);

        this.setState(prevState => ({
            joinMatches: prevState.joinMatches.filter(match => match.matchID !== matchID)
        }));
    }

    handleStartMatch(event, matchID) {
        // Si le match n'est pas encore démarré, on appelle _startMatch pour démarrer le match
        console.log(`Starting match: ${matchID}`);
        this._startMatch('game-of-thrones', {numPlayers: 2, matchID: matchID, playerID: this.state.playerID});
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

    handleSelectedMatchIDChange(event) {
        this.setState({
            selectedMatchID: event.target.value
        });
    }

    handleViewPlayers(event) {
        const match = this.connection.matches.find(m => m.matchID === this.state.selectedMatchID);

        if (match) {
            const players = match.players.map((player, index) => ({
                id: index,
                name: player.name || 'Empty'
            }));

            this.setState({
                playersInMatch: players
            });
        } else {
            this.setState({
                playersInMatch: []
            });
        }
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
        const playerNameStyle = {
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333'
        };

        const matches_thead = (
            <tr>
                <th style={match_id_col_style}>Match ID</th>
                <th style={player_col_style}>Players</th>
                <th style={button_col_style}><input type="button" value="New Match" onClick={() => this.handleNewMatch(null, this.state.matchNumPlayers)} /></th>
                <th style={button_col_style}><input type="button" value="Refresh" onClick={(event) => this.handleRefreshMatches(event)} /></th>
            </tr>
        );

        const matches_tbody = this.connection.matches.map((match) => {
                const isPlayerInAMatch = this.state.joinMatches.length;
                const isPlayerInAnotherMatch = this.state.joinMatches.some(runningMatch => runningMatch.matchID !== match.matchID);
        
            return (
                <tr key={match.matchID}>
                    <td style={match_id_col_style}>{match.matchID}</td>
                    <td style={player_col_style}>{match.players.filter(p => p.name).length} / {match.players.length}</td>
                    <td key={`${match.matchID}-Join`} style={player_col_style}>
                        {"" ||
                            (!isPlayerInAnotherMatch && isPlayerInAMatch && (
                            <button onClick={(event) => this.handleLeaveMatch(event, match.matchID)}>
                                Leave
                            </button>
                            )) ||
                            (!isPlayerInAMatch && (match.players.filter(p => p.name).length < match.players.length) && (
                            <>
                                <input
                                type="button"
                                value="Join"
                                onClick={(event) => this.handleJoinMatch(event, match.matchID, null)}
                                />
                            </>
                            ))}
                        </td>

                </tr>
            );
        });
        
            if (this.state.phase === 'enter') {
                return (
                    <div>
                        {/* Affichage du nom du joueur */}
                        {this.state.playerName && (
                            <div style={playerNameStyle}>
                                Player: {this.state.playerName}
                            </div>
                        )}
                        <div>
                            {'Enter name: '}
                            <input 
                                type="text" 
                                value={this.state.playerName} 
                                onChange={(event) => this.handleChangeName(event)} 
                            />
                            <input 
                                type="button" 
                                value="Enter Lobby" 
                                onClick={(event) => this.handleEnterLobby(event)} 
                            />
                        </div>
                    </div>
                )
            }
            
            else if (this.state.phase === 'list'){
                return(
                    <div>
                        {/* Affichage du nom du joueur */}
                        {this.state.playerName && (
                            <div style={playerNameStyle}>
                                Player: {this.state.playerName}
                            </div>
                        )}
                        <input 
                            type="button" 
                            value="Exit Lobby" 
                            onClick={(event) => this.handleExitLobby(event)} 
                        />
                        <br /><br />
                            <h3>
                                Number of Players: &nbsp;&nbsp;&nbsp;
                                <select
                                    value={this.state.matchNumPlayers}
                                    onChange={(event) => this.setState({ matchNumPlayers: parseInt(event.target.value) })}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </h3>
                            <table id="matches">
                                <thead>{matches_thead}</thead>
                                <tbody>{matches_tbody}</tbody>
                            </table>

                            <h3>Running Matches</h3>{/*CHANGER QUAND J'AURAIS ACCES AU TABLEAU CONTENANT LES MATCHS REJOINT PAR UN CLIENT SUR LA BDD*/}
                            <ul>
                                {this.state.joinMatches.map((match, index) => {
                                    const matchDetails = this.connection.matches.find(m => m.matchID === match.matchID);
                                    const playersInMatch = matchDetails ? matchDetails.players.filter(player => player.name) : [];
                                    const missingPlayers = matchDetails.players.length - playersInMatch.length;

                                    return (
                                        <li key={index}>
                                            Match ID : {match.matchID}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            {missingPlayers > 0 ? ("") : (<button onClick={(event) => this.handleStartMatch(event, match.matchID)}>Play</button>)}
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            <button onClick={(event) => this.handleLeaveMatch(event, match.matchID)}>Leave</button>
                                            
                                            <div>
                                                {playersInMatch.length > 0 ? (
                                                    <ul style={{ paddingLeft: '20px' }}>  {/* Ajout de la tabulation */}
                                                        {playersInMatch.map((player, playerIndex) => (
                                                            <li key={playerIndex} style={{ listStyleType: 'disc' }}> {/* Puces devant les noms */}
                                                                {player.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span>No players have joined yet.</span>
                                                )}
                                            </div>

                                            {missingPlayers > 0 ? (<span>Waiting for {missingPlayers} players...</span>) : ("")}
                                        </li>
                                    );
                                })}
                            </ul>



                            <h3>View Players in a Match</h3>
                            <label>
                                Match ID :&nbsp;
                                <input
                                    type="text"
                                    value={this.state.selectedMatchID}
                                    onChange={(event) => this.handleSelectedMatchIDChange(event)}
                                />
                            </label>
                            <button onClick={(event) => this.handleViewPlayers(event)}>View Players</button>

                            {this.state.playersInMatch.length > 0 && (
                                <ul>
                                    {this.state.playersInMatch.map(player => (
                                        <li key={player.id}>
                                            Player {player.id}: {player.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                    </div>
                )
            }
                

            else if (this.state.phase === 'play') {
                const board_element = React.createElement(this.state.runningMatch.app, {
                    matchID: this.state.runningMatch.matchID,
                    playerID: this.state.runningMatch.playerID,
                    credentials: this.state.runningMatch.credentials
                });
            
                return (
                    <div>
                        {board_element}
                    </div>
                );
            }
    }
}
