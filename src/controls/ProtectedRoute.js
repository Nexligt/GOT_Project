// Importation des dépendances nécessaires
import React from 'react';                      // Importation de React pour utiliser JSX et créer des composants
import { Navigate } from 'react-router-dom';    // Importation de Navigate de react-router-dom pour la redirection

// Définition du composant ProtectedRoute
const ProtectedRoute = ({ children }) => {
    
    // Vérification si l'utilisateur est authentifié en vérifiant la présence du token d'authentification dans le localStorage
    const isAuthenticated = localStorage.getItem('authToken') !== null;

    // Si l'utilisateur est authentifié, on rend les enfants du composant (la page demandée).
    // Si l'utilisateur n'est pas authentifié, on le redirige vers la page de connexion
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Exportation du composant ProtectedRoute
export default ProtectedRoute;
