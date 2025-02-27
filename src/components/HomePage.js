// Importation des dépendances nécessaires
import React, { useState } from 'react';            // Import de React et useState pour gérer l'état
import { useNavigate } from 'react-router-dom';     // Import de useNavigate pour gérer la navigation entre les pages
import '../CSS/HomePage.css';                       // Import du fichier CSS pour le style de la page d'accueil

// Définition du composant HomePage
const HomePage = () => {
    // Déclaration de l'état local pour suivre si l'utilisateur est en train de naviguer
    const [isNavigating, setIsNavigating] = useState(false);

    // Utilisation de useNavigate pour permettre la navigation programmatique vers d'autres pages
    const navigate = useNavigate();

    // Fonction pour gérer la navigation lorsqu'un utilisateur clique sur un bouton
    const handleNavigation = (path) => {
        setIsNavigating(true); // Met à jour l'état pour activer l'animation de navigation
        
        // Utilisation de setTimeout pour retarder la navigation afin d'attendre la fin de l'animation
        setTimeout(() => {
            navigate(path); // Effectue la navigation après un délai de 500ms
        }, 500); // 500ms est le délai d'attente avant de rediriger l'utilisateur
    };

    // Rendu du composant HomePage
    return (
        <div className={`home-container ${isNavigating ? 'navigating' : ''}`}>
            {/* Titre de la page d'accueil */}
            <h2 className="title">Bienvenue dans l'application</h2>
            
            {/* Conteneur pour les boutons de navigation */}
            <div className="button-container">
                {/* Bouton de connexion */}
                <button
                    className="home-button"
                    onClick={() => handleNavigation('/login')} // Appel de handleNavigation pour rediriger vers /login
                >
                    Connexion
                </button>
                
                {/* Bouton d'inscription */}
                <button
                    className="home-button"
                    onClick={() => handleNavigation('/signup')} // Appel de handleNavigation pour rediriger vers /signup
                >
                    Inscription
                </button>
            </div>
        </div>
    );
};

// Exportation du composant HomePage pour pouvoir l'utiliser dans d'autres fichiers
export default HomePage;
