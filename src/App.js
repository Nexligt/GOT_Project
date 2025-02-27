// src/App.js

import React from 'react';                                          // Import de React
import { BrowserRouter, Routes, Route } from 'react-router-dom';    // Import des composants pour la gestion des routes
import ProtectedRoute from './controls/ProtectedRoute';             // Import du composant de route protégée

// Import des pages de l'application
import HomePage from './components/HomePage';               // Page d'accueil
import LoginPage from './components/LoginPage';             // Page de connexion
import SignupPage from './components/SignupPage';           // Page d'inscription
import GamesListPage from './components/GamesListPage';     // Page de liste des jeux
import GamePage from './components/GamePage';               // Page spécifique pour un jeu


// Définition du composant principal de l'application
const App = () => {
    return (
        // Utilisation du BrowserRouter pour gérer les routes côté client
        <BrowserRouter>
            {/* Définition des routes de l'application */}
            <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<HomePage />} />           {/* Route vers la page d'accueil */}
                <Route path="/login" element={<LoginPage />} />     {/* Route vers la page de connexion */}
                <Route path="/signup" element={<SignupPage />} />   {/* Route vers la page d'inscription */}

                {/* Routes protégées */}
                {/* Route vers la liste des jeux, uniquement accessible si l'utilisateur est authentifié */}
                <Route 
                    path="/games" 
                    element={
                        <ProtectedRoute>            {/* Composant de route protégée qui vérifie l'authentification */}
                            <GamesListPage />       {/* Composant affichant la liste des jeux */}
                        </ProtectedRoute>
                    } 
                />

                {/* Route vers une page de jeu spécifique, uniquement accessible si l'utilisateur est authentifié */}
                <Route 
                    path="/game/:gameId" 
                    element={
                        <ProtectedRoute>        {/* Composant de route protégée qui vérifie l'authentification */}
                            <GamePage />        {/* Composant affichant les détails d'un jeu spécifique */}
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App; // Export du composant App pour l'utiliser ailleurs dans l'application


