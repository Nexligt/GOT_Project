// Importation des dépendances nécessaires
import React, { useState, useEffect } from 'react';     // Importation de React, useState et useEffect pour gérer l'état et les effets de bord
import { useNavigate } from 'react-router-dom';         // useNavigate pour la navigation programmée vers d'autres pages
import '../CSS/SignupPage.css';                         // Importation du fichier CSS pour le style de la page d'inscription
import { Link } from 'react-router-dom';                // Importation de Link pour permettre la navigation vers la page de connexion

// Définition du composant SignupPage
const SignupPage = () => {

	const navigate = useNavigate();
	
    // Déclaration des états pour le nom d'utilisateur, l'email et le mot de passe
    const [username, setUsername] = useState(''); 
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');

    // Déclaration des états pour gérer les erreurs de validation des champs
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Effet pour vérifier si un token d'authentification existe et rediriger si nécessaire
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            navigate('/games'); // Si un token est trouvé, redirige vers la page des jeux
        }
    }, [navigate]); // Exécuté uniquement lors du montage du composant (lorsque le composant est ajouté au DOM)


    // Fonction qui gère l'inscription de l'utilisateur
    const handleSignup = async () => {

        // Vérification si les champs sont remplis ou non
        const isUsernameEmpty = !username;
        const isEmailEmpty = !email;
        const isPasswordEmpty = !password;

        // Mise à jour des messages d'erreur si les champs sont vides
        setUsernameError(isUsernameEmpty ? 'Le nom d\'utilisateur est requis' : '');
        setEmailError(isEmailEmpty ? 'L\'email est requis' : '');
        setPasswordError(isPasswordEmpty ? 'Le mot de passe est requis' : '');

        // Si tous les champs sont remplis, procéder à l'inscription
        if (!isUsernameEmpty && !isEmailEmpty && !isPasswordEmpty) {
            // Réinitialiser les erreurs avant de commencer le processus d'inscription
            setEmailError('');

            // Essayer d'envoyer la requête d'inscription au serveur
            try {
                // Création du message pour la requête d'inscription (méthode POST)
                const message = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_name: username,        // Nom d'utilisateur
                        user_email: email,          // Email de l'utilisateur
                        user_password: password,    // Mot de passe de l'utilisateur
                    }),
                };

                // Envoi de la requête au serveur pour l'inscription
                const response = await fetch('http://localhost:8000/signup', message);

                // Si la réponse du serveur est correcte
                if (response.ok) {
                    const data = await response.json();     // Récupération du corps de la réponse en JSON
                    const token = data.token;               // Récupération du token d'authentification renvoyé par le serveur

                    if (token) {
                        // Si le token est valide, le stocker dans localStorage
                        localStorage.setItem('authToken', token);
                        localStorage.setItem('userName', username); // Stocker également le nom d'utilisateur

                        // Rediriger l'utilisateur vers la page des jeux
                        navigate('/games');
                    } else {
                        alert('Token non fourni par le serveur.'); // Si le token n'est pas renvoyé, afficher un message d'erreur
                    }
                } else if (response.status === 409) {
                    // Si le serveur renvoie une erreur de type conflit (par exemple, email ou nom d'utilisateur déjà pris)
                    const errorData = await response.json();

                    // Gérer l'affichage des erreurs spécifiques
                    if (errorData.error.includes('Email')) {
                        setEmailError('Mail déjà utilisé'); // Si l'email est déjà utilisé
                    } else if (errorData.error.includes('Nom d\'utilisateur')) {
                        setUsernameError('Nom d\'utilisateur déjà utilisé'); // Si le nom d'utilisateur est déjà pris
                    }
                } else {
                    // Si une autre erreur est survenue
                    alert('Erreur lors de l\'inscription. Veuillez réessayer.');
                }
            } catch (error) {
                // Si une erreur réseau ou autre est survenue lors de la requête
                console.error('Erreur de connexion au serveur :', error);
                alert('Une erreur est survenue. Veuillez réessayer plus tard.');
            }
        }
    };

    // Rendu du composant SignupPage
    return (
        <div className="signup-container">
            <h2 className="title">Inscription</h2>

            <div className="input-container">
                {/* Champ de texte pour le nom d'utilisateur */}
                <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);    // Mettre à jour l'état du nom d'utilisateur
                        setUsernameError('');           // Réinitialiser l'erreur du nom d'utilisateur
                    }}
                    className={`input-field ${usernameError ? 'input-error' : ''}`} // Ajouter la classe d'erreur si nécessaire
                />
                {usernameError && <p className="error-text">{usernameError}</p>} {/* Afficher l'erreur si présente */}

                {/* Champ de texte pour l'email */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);   // Mettre à jour l'état de l'email
                        setEmailError('');          // Réinitialiser l'erreur de l'email
                    }}
                    className={`input-field ${emailError ? 'input-error' : ''}`} // Ajouter la classe d'erreur si nécessaire
                />
                {emailError && <p className="error-text">{emailError}</p>} {/* Afficher l'erreur si présente */}

                {/* Champ de texte pour le mot de passe */}
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);    // Mettre à jour l'état du mot de passe
                        setPasswordError('');           // Réinitialiser l'erreur du mot de passe
                    }}
                    className={`input-field ${passwordError ? 'input-error' : ''}`} // Ajouter la classe d'erreur si nécessaire
                />
                {passwordError && <p className="error-text">{passwordError}</p>} {/* Afficher l'erreur si présente */}
            </div>

            <br />

            {/* Bouton d'inscription */}
            <button className="signup-button" onClick={handleSignup}>
                S'inscrire
            </button>

            {/* Lien vers la page de connexion si l'utilisateur a déjà un compte */}
            <p className="login-link">
                Déjà un compte ? <Link to="/login">Connectez-vous ici</Link>
            </p>
        </div>
    );
};

// Exportation du composant SignupPage pour qu'il puisse être utilisé dans d'autres parties de l'application
export default SignupPage;
