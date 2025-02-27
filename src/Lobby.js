// Importation de React et des composants nécessaires de boardgame.io
import React from 'react';
import { Lobby } from 'boardgame.io/react'; // Importation du composant Lobby de Boardgame.io
import "./CSS/Lobby.css";                   // Importation de la feuille de style pour le lobby


export class GameOfThronesLobby extends Lobby {
    constructor(props) {
        super(props);
        this.state = {
            matchNumPlayers: 1,     // Nombre de joueurs à choisir pour un match (mis à défaut à 1)
            playerName: '',         // Nom du joueur
            joinMatches: [],        // Liste des matchs que le joueur a rejoints
            runningMatch: null,     // Match en cours, null tant qu'aucun match n'est lancé
            playerID: null,         // ID du joueur dans un match, défini après avoir rejoint un match
            isLoading: false,       // Indicateur de chargement pour afficher une animation de chargement
        };
    }

    //#region Gestion des événements et des requêtes
    
    // Fonction pour créer un nouveau match avec un nombre de joueurs donné
    handleNewMatch(event, numPlayers) {
        console.log("Nouveau match avec " + parseInt(numPlayers) + " joueurs.");
        this._createMatch('game-of-thrones', numPlayers);   // Appel de la méthode pour créer un match
    }

    // Fonction pour rafraîchir la liste des matchs disponibles
    handleRefreshMatches(event) {
        this._updateConnection();
    }
        
    // Fonction pour rejoindre un match en utilisant son ID et l'ID du joueur
    handleJoinMatch(event, matchID, playerID = null) {
        // Recherche du match par son ID dans la liste des matchs disponibles
        const match = this.connection.matches.find(m => m.matchID === matchID);

        // Vérifie si le joueur est déjà dans ce match
        if (match && match.players.some(player => player.name === this.state.playerName)) {
            alert("Vous faites déjà parti de ce match.");
            return;
        }

        // Vérifie si le joueur est déjà inscrit dans un autre match
        if (this.state.joinMatches.length > 0) {
            alert("Vous faites déjà parti d'un autre match. Vous ne pouvez rejoindre qu'un match à la fois.");
            return;
        }

        // Envoie une requête au serveur pour mettre à jour l'ID game du joueur pour ce match
        try {
            const message = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerName: this.state.playerName, 
                    matchID, 
                }),
            };


            fetch('http://localhost:8000/join-match', message)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                } else {
                    console.error(data.error);
                }
            })
            .catch(error => {
                console.error('Erreur pour rejoindre le match :', error);
            });

        }catch (error) {
            console.error('Erreur de connexion au serveur :', error);
            alert('Une erreur est survenue. Veuillez réessayer plus tard.');
        }

        // Détermine l'ID du joueur en fonction du nombre de joueurs dans le match
        const nbPlayerInMatch = match.players.filter(p => p.name).length.toString()

        // Joins le match en appelant la méthode interne de Boardgame.io
        this._joinMatch('game-of-thrones', matchID, nbPlayerInMatch);
        
        console.log(`Match rejoins : ${matchID}, joueur: ${this.state.playerName}, id : ${nbPlayerInMatch}`);

        // Met à jour la liste des matchs rejoints
        this.setState(prevState => ({
            joinMatches: [...prevState.joinMatches, { matchID }]
        }), () => {
            // Fonction de rappel exécutée après la mise à jour de l'état
        });
        
    }
    
    // Fonction pour quitter un match
    handleLeaveMatch(event, matchID) {
        console.log(`Match quitté : ${matchID}`);

        // Envoi d'une requête au serveur pour quitter le match
        const message = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: this.state.playerName, // Nom du joueur
                matchID: matchID,                // ID du match
            }),
        };

        fetch('http://localhost:8000/leave-match', message)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(data.message);
            } else {
                console.error(data.error);
            }
        })
        .catch(error => {
            console.error('Error leaving match:', error);
        });

        // Quitte le match en appelant la méthode de Boardgame.io
        this._leaveMatch('game-of-thrones', matchID);

        // Met à jour la liste des matchs rejoints en supprimant celui quitté
        this.setState(prevState => ({
            joinMatches: prevState.joinMatches.filter(match => match.matchID !== matchID)
        }), () => {
        });
    }

    // Fonction pour démarrer un match
    async handleStartMatch(event, matchID) {
        console.log(`Match lancé : ${matchID}`);

        const playerName = localStorage.getItem('userName');

        try {
            const response = await fetch(`http://localhost:8000/get-player-id?playerName=${encodeURIComponent(playerName)}&matchID=${encodeURIComponent(matchID)}`);
            if (response.ok) {
                const data = await response.json();
                const playerIDString = String(data.playerID);

                if (data.playerID != null) {
                    this._startMatch('game-of-thrones', {numPlayers: 2, matchID: matchID, playerID : playerIDString});
                } else {
                    console.error("Aucun joueur trouvé avec ce nom.");
                }
            } else {
                console.error("Erreur lors de la récupération du playerID.");
            }
        } catch (error) {
            console.error("Erreur lors de la requête : ", error);
        }
    }

    // Fonction pour entrer dans le lobby
    handleEnterLobby(event) {
        this._enterLobby(localStorage.getItem('userName')); // Récupère le nom du joueur depuis le localStorage
        this.getJoinedGames();                              // Récupère les matchs auxquels le joueur a rejoint
    }

    // Fonction pour quitter le lobby
    handleExitLobby(event) {
        this._exitLobby();
    }

    // Fonction pour quitter un match
    handleExitMatch(event) {
        this._exitMatch();
    }


    // Fonction pour récupérer les matchs auxquels le joueur a rejoint
    async getJoinedGames() {
        this.setState({ isLoading: true });

        const playerName = localStorage.getItem('userName');

        try {

            // Requête pour récupérer les jeux auxquels le joueur a participé
            const response = await fetch(`http://localhost:8000/get-games?playerName=${encodeURIComponent(playerName)}`);

            if (response.ok) {
                const data = await response.json();
                console.log("ID game du joueur : " + data.id_game);

                // Met à jour les matchs rejoints du joueur
                if (data.id_game) {
                    this.setState({ joinMatches: [{ matchID: data.id_game }] });
                }
            } else {
                console.error("Erreur lors de la récupération des jeux.");
            }
        } catch (error) {
            console.error("Erreur de connexion au serveur :", error);
        } finally {
            this.setState({ isLoading: false }); // Fin du chargement
        }
    }


    //#region Affichage du lobby et de la liste des matchs

    render() {

        // En-tête du tableau des matchs
        const matches_thead = (
            <tr>
                <th>Match ID</th>
                <th>Joueurs</th>
                <th>
                    <div className="button-group">
                        <button className="btn new-match-btn" onClick={() => this.handleNewMatch(null, this.state.matchNumPlayers)}>
                            Nouveau Match
                        </button>
                        <button className="btn refresh-btn" onClick={(event) => this.handleRefreshMatches(event)}>
                            Rafraîchir
                        </button>
                    </div>
                </th>
            </tr>
        );

        // Corps du tableau des matchs
        const matches_tbody = this.connection.matches.map((match) => {
            const isPlayerInRunningMatch = this.state.joinMatches.some(j => j.matchID === match.matchID);
            return (
                <tr key={match.matchID}>
                    <td>{match.matchID}</td>
                    <td>{match.players.filter(p => p.name).length} / {match.players.length}</td>
                    <td>
                        {isPlayerInRunningMatch ? (
                            <button className="btn leave-btn" onClick={(event) => this.handleLeaveMatch(event, match.matchID)}>
                                Quitter
                            </button>
                        ) : (
                            match.players.filter(p => p.name).length < match.players.length && (
                                <button className="btn join-btn" onClick={(event) => this.handleJoinMatch(event, match.matchID, null)}>
                                    Rejoindre
                                </button>
                            )
                        )}
                    </td>
                </tr>
            );
        });


        // Vérifie si le nom du joueur actuel est différent de celui enregistré dans le localStorage
        // Si les noms ne correspondent pas, on appelle la fonction pour faire quitter le lobby au joueur.
        if (this.state.playerName !== localStorage.getItem('userName')){
            this.handleExitLobby();
        }
        
        // Affiche la phase d'entrée dans le lobby
        if (this.state.phase === 'enter'){
            document.body.style.overflow = 'hidden';  // Désactive le défilement
            return (
                <div className="full-page-button" onClick={(event) => this.handleEnterLobby(event)}>
                    <h1 className="welcome-title">Bienvenue sur le jeu Game of Thrones !</h1>
                    <p className="welcome-text">Cliquez pour entrer</p>
                </div>
            );
        }
        
        // Affichage la liste des matchs (là où on peut créer, rejoindre et quitter les matchs)
        else if (this.state.phase === 'list') {
            document.body.style.overflow = 'auto';  // Active le défilement
            if (this.state.isLoading) {
                return <div className="loading">Chargement des matchs en cours...</div>;
            }
        
            return (
                <div className="lobby-container">
                    {/* Affichage du nom du joueur */}
                    {this.state.playerName && (
                        <div className="player-name">
                            Joueur : {this.state.playerName}
                        </div>
                    )}
        
                    {/* Choix du nombre de joueurs */}
                    <div className="num-players-selection">
                        <h3>Nombre de Joueurs :</h3>
                        <select
                            value={this.state.matchNumPlayers}
                            onChange={(event) => this.setState({ matchNumPlayers: parseInt(event.target.value) })}
                        >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
        
                    {/* Tableau de tous les matchs créés */}
                    <div className="matches-container">
                        <h3>Matchs Disponibles</h3>
                        <table className="matches-table">
                            <thead>{matches_thead}</thead>
                            <tbody>{matches_tbody}</tbody>
                        </table>
                    </div>
        
                    {/* Liste des matchs que le joueur a rejoints */}
                    <div className="joined-matches">
                        <h3>Mes Matchs en Cours</h3>
                        <ul>
                            {this.state.joinMatches.map((match, index) => {
                                const matchDetails = this.connection.matches.find(m => m.matchID === match.matchID) || { players: [] };
                                const playersInMatch = matchDetails.players.filter(player => player.name) || [];
                                const missingPlayers = matchDetails.players.length - playersInMatch.length;

                                return (
                                    <li key={index} className="match-item">
                                        <div className="match-header">
                                            <span className="match-id">Match ID : {match.matchID}</span>
                                            {missingPlayers > 0 ? (
                                                <span className="waiting-players">En attente de {missingPlayers} joueurs...</span>
                                            ) : (
                                                <button className="btn play-btn" onClick={(event) => this.handleStartMatch(event, match.matchID,  matchDetails.players.length)}>
                                                    Jouer
                                                </button>
                                            )}
                                            <button className="btn leave-btn" onClick={(event) => this.handleLeaveMatch(event, match.matchID)}>
                                                Quitter
                                            </button>
                                        </div>
                                        
                                        {/* Liste des joueurs dans le match */}
                                        <div className="players-list">
                                            {playersInMatch.length > 0 ? (
                                                <ul>
                                                    {playersInMatch.map((player, playerIndex) => (
                                                        <li key={playerIndex}>{player.name}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span>Aucun joueur n'a encore rejoint.</span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            );
        }

                
        // Gestion de la phase "play", redirection vers la page du jeu
        else if (this.state.phase === 'play') {
            const navigate = this.props.navigate;
            document.body.style.overflow = 'auto';  // Active le défilement

            // Redirige le joueur vers l'interface du jeu avec les informations de connexion
            navigate(`/game/${this.state.runningMatch.matchID}`, {
                state: {
                    playerID: this.state.runningMatch.playerID,
                    credentials: this.state.runningMatch.credentials
                }
            });
        }
    }
}
