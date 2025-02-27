// Importation des dépendances nécessaires
import React from 'react';                                  // Import de React
import { useLocation, useParams } from 'react-router-dom';  // useLocation pour récupérer les informations sur l'URL actuelle, useParams pour récupérer les paramètres d'URL
import { Client } from 'boardgame.io/react';                // Client est utilisé pour gérer la partie du jeu
import { SocketIO } from 'boardgame.io/multiplayer';        // SocketIO permet de gérer la communication en temps réel pour les jeux multijoueurs
import { GameOfThrones } from '../Game';                    // Importation du jeu GameOfThrones
import { GameOfThronesBoard } from '../Board';              // Importation du plateau de jeu GameOfThrones
import Navbar from '../controls/NavBar';            // Importation de la barre de navigation personnalisée


// URL du serveur utilisé pour la gestion des jeux en ligne
const serveur = 'http://localhost:8000';


// Composant GamePage : Représente la page d'une partie spécifique
const GamePage = () => {

    // Récupération du gameId depuis les paramètres de l'URL
    const { gameId } = useParams(); 

    // Récupération des informations de la location actuelle (détails de l'URL et état passé via navigation)
    const location = useLocation();
    
    // Récupération des informations du joueur à partir de l'état passé (playerID et credentials)
    const { playerID, credentials } = location.state || {}; // Si l'état n'existe pas, la valeur par défaut est un objet vide

    // Création du client de jeu avec boardgame.io
    const GameOfThronesClient = Client({
        game: GameOfThrones,        // Le jeu à utiliser
        board: GameOfThronesBoard,  // Le plateau de jeu à afficher
        multiplayer: SocketIO({ server: serveur }), // SocketIO permet la communication en temps réel avec le serveur
        debug: false,//désactive le panneau de controle de debug
    });

    // Retour du JSX
    return (
        <div style={{ backgroundColor: '#e2e1e1', minHeight: '100vh' }}>
            <Navbar />
            {/* Affichage du titre de la page avec le gameId de la partie en cours */}
            <h2
                style={{
                position: "absolute",
                top: "0px",
                left: "10px",
                color: "white",       // Texte en blanc
                fontSize: "1.1rem",     // Taille du texte réduite
                fontWeight: "bold",
                zIndex: 1000
            }}
            >
                Partie en cours : {gameId}
            </h2>
            
            {/* Rendu du client de jeu avec les propriétés nécessaires : matchID, playerID et credentials */}
            <GameOfThronesClient
                matchID={gameId}            // ID unique de la partie
                playerID={playerID}         // ID du joueur pour identifier l'utilisateur
                credentials={credentials}   // Informations d'identification pour le joueur
            />
        </div>
    );
};

// Exportation du composant GamePage pour l'utiliser dans d'autres parties de l'application
export default GamePage;
