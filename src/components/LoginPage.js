// Importation des dépendances nécessaires
import React, { useState, useEffect } from 'react';     // Importation de React, useState et useEffect pour gérer l'état et les effets de bord
import { useNavigate } from 'react-router-dom';         // useNavigate pour la navigation programmée vers d'autres pages
import '../CSS/LoginPage.css';                          // Importation du fichier CSS pour le style de la page de connexion
import { Link } from 'react-router-dom';                // Importation de Link pour permettre la navigation vers la page d'inscription

// Définition du composant LoginPage
const LoginPage = () => {
    const navigate = useNavigate(); // Hook pour la navigation vers une autre page

    const [email, setEmail] = useState('');         // Déclare un état pour l'email
    const [password, setPassword] = useState('');   // Déclare un état pour le mot de passe

    const [emailError, setEmailError] = useState('');       // Déclare un état pour l'erreur d'email
    const [passwordError, setPasswordError] = useState(''); // Déclare un état pour l'erreur de mot de passe

    // Redirection si un token est déjà présent dans le localStorage (utilisateur déjà connecté)
    useEffect(() => {
        const token = localStorage.getItem('authToken'); // Vérification de la présence d'un token d'authentification

        if (token) {
            navigate('/games'); // Si un token est trouvé, rediriger l'utilisateur vers la page des jeux
        }
    }, [navigate]); // Le useEffect est exécuté lors du montage du composant


    // Fonction qui gère la connexion de l'utilisateur
    const handleLogin = async () => {

        // Vérification si les champs email et mot de passe sont remplis
        const isEmailEmpty = !email;
        const isPasswordEmpty = !password;

        // Mise à jour des messages d'erreur en fonction de la validité des champs
        setEmailError(isEmailEmpty ? 'L\'email est requis' : '');
        setPasswordError(isPasswordEmpty ? 'Le mot de passe est requis' : '');

        // Si les champs ne sont pas vides, procéder à la requête de connexion
        if (!isEmailEmpty && !isPasswordEmpty) {
            try {
                // Création du message à envoyer dans la requête POST pour la connexion
                const message = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Indiquer que le contenu est au format JSON
                    },
                    body: JSON.stringify({
                        user_email: email,          // Email de l'utilisateur
                        user_password: password,    // Mot de passe de l'utilisateur
                    }),
                };

                // Envoi de la requête de connexion au serveur
                const response = await fetch('http://localhost:8000/login', message);

                // Si la réponse du serveur est correcte (status 200-299)
                if (response.ok) {
                    const data = await response.json(); // Récupération du corps de la réponse en JSON

                    // Stocker le token et le nom d'utilisateur dans le localStorage
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userName', data.userName);

                    // Rediriger l'utilisateur vers la page des jeux après connexion réussie
                    navigate('/games');
                } else if (response.status === 401) {                   // Si l'authentification échoue (status 401)
                    setEmailError('Email ou mot de passe incorrect');   // Afficher un message d'erreur générique
                } else {
                    alert('Erreur lors de la connexion. Veuillez réessayer.'); // Afficher une alerte en cas d'erreur générique
                }
            } catch (error) {
                // Si une erreur de connexion au serveur se produit
                console.error('Erreur de connexion au serveur :', error);
                alert('Une erreur est survenue. Veuillez réessayer plus tard.');
            }
        }
    };

    return (
        <div className="login-container">
            <h2 className="title">Connexion</h2> {/* Titre de la page */}

            <div className="input-container">
                {/* Champ de texte pour l'email */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email} // L'état de l'email est lié à la valeur de ce champ
                    onChange={(e) => {
                        setEmail(e.target.value);   // Mise à jour de l'état de l'email lorsque l'utilisateur tape
                        setEmailError('');          // Réinitialiser l'erreur d'email à chaque modification
                    }}
                    className={`input-field ${emailError ? 'input-error' : ''}`} // Si une erreur existe, ajouter la classe d'erreur
                />
                
                {/* Affichage de l'erreur d'email si elle existe */}
                {emailError && <p className="error-text">{emailError}</p>}

                {/* Champ de texte pour le mot de passe */}
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password} // L'état du mot de passe est lié à la valeur de ce champ
                    onChange={(e) => {
                        setPassword(e.target.value);    // Mise à jour de l'état du mot de passe lorsque l'utilisateur tape
                        setPasswordError('');           // Réinitialiser l'erreur de mot de passe à chaque modification
                    }}
                    className={`input-field ${passwordError ? 'input-error' : ''}`} // Si une erreur existe, ajouter la classe d'erreur
                />

                {/* Affichage de l'erreur de mot de passe si elle existe */}
                {passwordError && <p className="error-text">{passwordError}</p>}
            </div>

            <br />

            {/* Bouton de connexion */}
            <button className="login-button" onClick={handleLogin}>
                Se connecter
            </button>

            {/* Lien vers la page d'inscription pour les utilisateurs sans compte */}
            <p className="signup-link">
                Pas de compte ? <Link to="/signup">Inscrivez-vous ici</Link>
            </p>
        </div>
    );
};

// Exportation du composant LoginPage pour qu'il puisse être utilisé dans d'autres parties de l'application
export default LoginPage;
