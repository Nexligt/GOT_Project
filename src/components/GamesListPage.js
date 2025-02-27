// Importation des dépendances nécessaires
import React from 'react';                          // Import de React
import { useNavigate } from 'react-router-dom';     // useNavigate pour la navigation
import { GameOfThrones } from '../Game';            // Importation du composant GameOfThrones (jeu)
import { GameOfThronesBoard } from '../Board';      // Importation du composant GameOfThronesBoard (plateau de jeu)
import { GameOfThronesLobby } from '../Lobby';      // Importation du composant GameOfThronesLobby (lobby du jeu)
import Navbar from '../controls/NavBar';            // Importation de la barre de navigation personnalisée

// Déclaration de l'URL de base pour le serveur
const serveur = 'http://localhost:8000'; 

// Composant GamesListPage
const GamesListPage = () => {

    // Utilisation du hook useNavigate pour gérer la navigation entre les pages
    const navigate = useNavigate();

    return (
        <div>
            {/* Affichage de la barre de navigation */}
            <Navbar />

            {/* Intégration du lobby du jeu Game of Thrones */}
            <GameOfThronesLobby
                gameServer={serveur}    // Passe l'URL du serveur du jeu en ligne
                lobbyServer={serveur}   // Passe l'URL du serveur du lobby
                navigate={navigate}     // Passe la fonction de navigation pour permettre de changer de page dans le lobby
                gameComponents={[       // Liste des composants de jeu associés (jeu et plateau de jeu)
                    { game: GameOfThrones, board: GameOfThronesBoard }, // Le jeu et son plateau sont passés dans un tableau d'objets
                ]}
            />
        </div>
    );
};

// Exportation du composant GamesListPage pour l'utiliser dans d'autres parties de l'application
export default GamesListPage;
