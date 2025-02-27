// src/controls/Navbar.js

// Importation des dépendances nécessaires
import React from 'react';                      // Importation de React
import { useNavigate } from 'react-router-dom'; // Importation de useNavigate pour la navigation entre les pages


// Définition du composant Navbar
const Navbar = () => {

    // Utilisation du hook useNavigate pour accéder à la fonction de navigation
    const navigate = useNavigate();

    // Fonction pour gérer la déconnexion
    const logout = () => {
        
        // Suppression du token d'authentification dans le localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');

        // Redirection vers la page de connexion après la déconnexion
        navigate('/login');
    };

    return (
        // Barre de navigation avec des styles appliqués
        <nav style={styles.nav}>
            {/* Bouton de déconnexion, déclenche la fonction logout lors du clic */}
            <button onClick={logout} style={styles.logoutButton}>
                Déconnexion
            </button>
        </nav>
    );
};


// Styles pour la barre de navigation et le bouton
const styles = {

    // Style pour la barre de navigation
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#6a1b9a',
        color: 'white',
        zIndex: 1000,
        position: 'relative',
    },

    // Style pour le bouton de déconnexion
    logoutButton: {
        marginLeft: 'auto',
        backgroundColor: '#c9302c',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

// Exportation du composant Navbar pour qu'il puisse être utilisé ailleurs dans l'application
export default Navbar;
