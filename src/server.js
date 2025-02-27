const { Server, Origins } = require('boardgame.io/server'); // Import du serveur Boardgame.io
const { GameOfThrones } = require('./Game'); // Import du jeu Game of Thrones
const { PostgresStore } = require('bgio-postgres'); // Import du module PostgreSQL
const { getPool } = require('./BDD');
const jwt = require('jsonwebtoken');  // Import de la bibliothèque jsonwebtoken pour la gestion des tokens JWT
const bcrypt = require('bcrypt'); // Import de bcrypt pour le hashage des mots de passe

let pool; // Variable pour stocker l'instance du pool

// Clé secrète pour signer les tokens JWT
const JWT_SECRET = 'maclé';  

// Configuration de la base de données PostgreSQL via un objet
const db = new PostgresStore({
    database: "got_game",  // Nom de la base de données PostgreSQL
    username: "postgres",  // Nom d'utilisateur PostgreSQL
    password: "password",      // Mot de passe PostgreSQL (à sécuriser)
    host: "localhost",     // Hôte du serveur PostgreSQL
    port: 5432,            // Port PostgreSQL (par défaut 5432)
    logging: console.log,  // Affichage des logs SQL (désactiver avec `false` si nécessaire)
    timezone: '+00:00',    // Définition du fuseau horaire (UTC)
});


// Configuration du serveur Boardgame.io
const server = Server({
    games: [GameOfThrones],         // Liste des jeux gérés par le serveur
    db,                             // Base de données PostgreSQL pour stocker les parties
    origins: [Origins.LOCALHOST],   // Autorisation des connexions depuis localhost
    debug: false,
});

// Fonction pour initialiser le serveur
async function initializeServer() {
    try {
        // Initialiser le pool une seule fois au démarrage du serveur
        pool = await getPool();

        // Démarrage du serveur sur le port 8000
        server.run(8000, async () => {
            console.log('Serveur lancé sur http://localhost:8000');

            // Ajout de la clé étrangère si la table "Games" existe
            await addForeignKeyIfGameExists(pool)
        });
    } catch (err) {
        console.error('Erreur lors de l\'initialisation du serveur :', err);
    }
}

// Lancer l'initialisation du serveur
initializeServer();

// Route GET pour récupérer l'ID du joueur en fonction du playerName
server.router.get('/get-player-id', async (ctx) => {
    try {
        const { playerName, matchID } = ctx.query; // Récupérer playerName et matchID depuis les paramètres de requête

        console.log(`matchID: ${matchID}, playerName: ${playerName}`);

        // Vérifier si playerName et matchID sont fournis
        if (!playerName || !matchID) {
            ctx.status = 400;
            ctx.body = { error: 'playerName et matchID sont requis' };
            return;
        }

        // Requête SQL pour récupérer l'ID du joueur à partir du matchID et playerName
        const query = `
            SELECT id, players
            FROM "Games"
            WHERE id = $1 
            AND EXISTS (
                SELECT 1 FROM jsonb_each(players::jsonb) AS p
                WHERE p.value->>'name' = $2
            )
        `;

        const result = await pool.query(query, [matchID, playerName]);

        const playerFilter = JSON.stringify({"0": {"name": playerName}});

        // Si aucun jeu n'est trouvé avec ce joueur et matchID
        if (result.rowCount === 0) {
            ctx.status = 404;
            ctx.body = { error: 'Joueur non trouvé dans ce match' };
            return;
        }

        // Récupérer l'ID du joueur dans le JSON des joueurs
        const gameData = result.rows[0];
        const players = gameData.players;

        // Chercher le joueur correspondant dans l'objet JSON
        let playerID = null;

        // Itérer sur les clés des joueurs dans le JSON
        for (const key in players) {
            if (players[key].name === playerName) {
                playerID = players[key].id;
                break;
            }
        }

        // Si le joueur est trouvé, retourner son ID
        if (playerID !== null) {
            ctx.status = 200;
            ctx.body = { playerID: playerID };
        } else {
            ctx.status = 404;
            ctx.body = { error: 'Joueur non trouvé dans les joueurs de ce match' };
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du playerID:', err);
        ctx.status = 500;
        ctx.body = { error: 'Erreur interne du serveur' };
    }
});

// Route GET pour récupérer l'ID du jeu d'un utilisateur
server.router.get('/get-games', async (ctx) => {
    try {
        const { playerName } = ctx.query; // Récupérer le nom du joueur depuis les paramètres de requête

        // Renvoyer une erreur si le playerName n'a pas été transmis
        if (!playerName) {
            ctx.status = 400;
            ctx.body = { error: 'playerName est requis' };
            return;
        }

        // Requête pour récupérer l'ID du jeu associé à l'utilisateur
        const query = 'SELECT id_game FROM public.users WHERE user_name = $1';
        const result = await pool.query(query, [playerName]);

        // Si l'utilisateur n'est pas trouvé
        if (result.rowCount === 0) {
            ctx.status = 404; 
            ctx.body = { error: 'Utilisateur non trouvé' };
            return;
        }

        // Récupérer l'ID du jeu
        const idGame = result.rows[0].id_game;

        // Envoi de l'ID du jeu
        ctx.status = 200;
        ctx.body = { id_game: idGame };
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'id_game:', err);
        ctx.status = 500;
        ctx.body = { error: 'Erreur interne du serveur' };
    }
});


// Route POST pour enregistrer l'id_game d'un utilisateur qui a rejoint un match
server.router.post('/join-match', async (ctx) => {
    try {
        // Extraction des données de la requête
        const data = await new Promise((resolve, reject) => {
            let body = '';
            ctx.req.on('data', chunk => body += chunk);
            ctx.req.on('end', () => resolve(JSON.parse(body)));
            ctx.req.on('error', reject);
        });

        // Déstructuration des valeurs reçues
        const { playerName, matchID } = data;

        // Vérifier si les champs requis sont présents
        if (!playerName || !matchID) {
            ctx.status = 400; // Mauvaise requête
            ctx.body = { error: 'playerName et matchID sont requis' };
            return;
        }

        // Mise à jour de l'id_game de l'utilisateur
        const query = 'UPDATE public.users SET id_game = $1 WHERE user_name = $2';
        const result = await pool.query(query, [matchID, playerName]);

        // Vérifier si l'utilisateur existe en base de données
        if (result.rowCount === 0) {
            ctx.status = 404; // Code 404 : Ressource non trouvée (Not Found)
            ctx.body = { error: 'Utilisateur non trouvé' };
            return;
        }

        // Répondre avec un succès si la mise à jour a été effectuée
        ctx.status = 200; // Succès
        ctx.body = { success: true, message: 'id_game mis à jour avec succès' };
    } catch (err) {
        // Gestion des erreurs serveur
        console.error('Erreur lors de la mise à jour de id_game:', err);
        ctx.status = 500; // Erreur interne du serveur
        ctx.body = { error: 'Erreur interne du serveur' };
    }
});


// Route pour supprimer l'id_game d'un utilisateur (lorsqu'il quitte un match)
server.router.post('/leave-match', async (ctx) => {
    try {
        // Extraction des données de la requête
        const data = await new Promise((resolve, reject) => {
            let body = '';
            ctx.req.on('data', chunk => body += chunk);
            ctx.req.on('end', () => resolve(JSON.parse(body)));
            ctx.req.on('error', reject);
        });

        // Déstructuration des valeurs reçues (extraction du nom d'utilisateur et du matchID)
        const { userName, matchID } = data;

        // Vérifier si les champs requis sont présents
        if (!userName || !matchID) {
            ctx.status = 400; // Mauvaise requête
            ctx.body = { error: 'userName et matchID sont requis' };
            return;
        }

        // Réinitialisation de id_game à NULL pour le joueur
        const query = 'UPDATE public.users SET id_game = NULL WHERE user_name = $1 AND id_game = $2';
        const result = await pool.query(query, [userName, matchID]);

        // Vérifier si l'utilisateur a été trouvé et si son id_game a bien été mis à jour
        if (result.rowCount === 0) {
            ctx.status = 404; // Aucun utilisateur trouvé ou ID de jeu ne correspond pas
            ctx.body = { error: 'Utilisateur ou match non trouvé' };
            return;
        }

        // Répondre avec un succès si la mise à jour de id_game a réussi
        ctx.status = 200;
        ctx.body = { success: true, message: 'Vous avez quitté le match avec succès' };
    } catch (err) {
        // Gestion des erreurs serveur
        console.error('Erreur lors de la suppression de id_game:', err);
        ctx.status = 500; // Erreur interne du serveur
        ctx.body = { error: 'Erreur interne du serveur' };
    }
});


// Fonction pour ajouter la clé étrangère dans la table "users" si la table "Games" existe
async function addForeignKeyIfGameExists(pool) {
    try {
        // Vérification de l'existence de la table "Games" dans le schéma public
        const checkTableQuery = `
            SELECT 1
            FROM information_schema.tables
            WHERE table_name = 'Games' AND table_schema = 'public';
        `;
        const tableResult = await pool.query(checkTableQuery);

        // Vérifier si la table "Games" n'existe pas
        if (tableResult.rowCount === 0) {
            console.log('La table "Games" n\'existe pas encore. Attente ou création nécessaire.');
            return false;
        }

        console.log('La table "Games" existe. Vérification de la clé étrangère.');

        // Vérification de l'existence de la clé étrangère "fk_id_game" dans la table "users"
        const checkForeignKeyQuery = `
            SELECT 1
            FROM information_schema.table_constraints
            WHERE table_name = 'users'
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name = 'fk_id_game';
        `;
        const foreignKeyResult = await pool.query(checkForeignKeyQuery);

        // Vérfier si la clé étrangère existe déjà
        if (foreignKeyResult.rowCount > 0) {
            console.log('La clé étrangère "fk_id_game" existe déjà. Aucune modification nécessaire.');
            return false; 
        }

        console.log('Ajout de la clé étrangère "fk_id_game".');

        // Ajouter la contrainte de clé étrangère
        const addForeignKeyQuery = `
            ALTER TABLE public.users
            ADD CONSTRAINT fk_id_game
            FOREIGN KEY (id_game)
            REFERENCES "Games"(id) ON DELETE SET NULL;
        `;
        
        // Exécution de la requête pour ajouter la clé étrangère
        await pool.query(addForeignKeyQuery);

        console.log('Clé étrangère ajoutée avec succès.');
        return true;
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la clé étrangère :', err);
        throw err;
    }
}


// Route d'inscription
server.router.post('/signup', async (ctx) => {
    try {
        // Récupérer les données de la requête
        const data = await new Promise((resolve, reject) => {
            let body = '';
            ctx.req.on('data', chunk => body += chunk);
            ctx.req.on('end', () => resolve(JSON.parse(body)));
            ctx.req.on('error', reject);
        });

        console.log('Données reçues:', data);

        // Déstructuration des valeurs reçues
        const { user_name, user_email, user_password } = data;

        // Vérifier si tous les champs sont présents
        if (!user_name || !user_email || !user_password) {
            ctx.status = 400;
            ctx.body = { error: 'Tous les champs doivent être remplis' };
            return;
        }

        // Vérifier si l'email est déjà utilisé
        const emailQuery = 'SELECT COUNT(*) FROM public.users WHERE user_email = $1';
        const emailExists = await pool.query(emailQuery, [user_email]);

        if (emailExists.rows[0].count > 0) {
            ctx.status = 409;  // Statut 409 pour conflit
            ctx.body = { error: 'Email déjà utilisé' };
            return;
        }

        // Vérifier si le pseudo est déjà utilisé
        const usernameQuery = 'SELECT COUNT(*) FROM public.users WHERE user_name = $1';
        const usernameExists = await pool.query(usernameQuery, [user_name]);

        if (usernameExists.rows[0].count > 0) {
            ctx.status = 409;  // Statut 409 pour conflit
            ctx.body = { error: 'Nom d\'utilisateur déjà utilisé' };
            return;
        }

        // Hashage du mot de passe avant stockage
        const saltRounds = 10; // Nombre de tours pour le sel
        const hashedPassword = await bcrypt.hash(user_password, saltRounds);

        // Ajouter le joueur avec le mot de passe haché
        const addPlayerQuery = `
            INSERT INTO public.users (user_name, user_email, user_password)
            VALUES ($1, $2, $3)
        `;
        await pool.query(addPlayerQuery, [user_name, user_email, hashedPassword]);

        // Génération d'un token JWT
        const token = jwt.sign(
            { user_email, user_name },     // Payload du token
            JWT_SECRET,                    // Clé secrète pour signer le token
            { expiresIn: '2h' }            // Expiration du token
        );

        // Retourner le token dans la réponse
        ctx.status = 200;
        ctx.body = {
            message: 'Joueur ajouté avec succès',
            token: token 
        };
    } catch (err) {
        console.error('Erreur lors de l\'ajout du joueur:', err);
        ctx.status = 500;
        ctx.body = { error: 'Erreur lors de l\'inscription du joueur' };
    }
});


// Route de connexion
server.router.post('/login', async (ctx) => {
    try {
        // Récupération des données envoyées dans le corps de la requête
        const data = await new Promise((resolve, reject) => {
            let body = '';
            ctx.req.on('data', chunk => body += chunk);
            ctx.req.on('end', () => resolve(JSON.parse(body)));
            ctx.req.on('error', reject);
        });

        // Extraction des informations utilisateur (email et mot de passe)
        const { user_email, user_password } = data;

        // Vérification si l'email et le mot de passe sont fournis
        if (!user_email || !user_password) {
            ctx.status = 400;
            ctx.body = { error: 'Email et mot de passe sont requis' };
            return;
        }

        // Recherche de l'utilisateur dans la base de données par email
        const userQuery = `
            SELECT user_name, user_password
            FROM public.users
            WHERE user_email = $1
        `;
        const result = await pool.query(userQuery, [user_email]);

        // Si aucun utilisateur n'est trouvé, retour d'une erreur 401
        if (result.rowCount === 0) {
            ctx.status = 401; // Non autorisé
            ctx.body = { error: 'Email ou mot de passe incorrect' };
            return;
        }

        // Récupération de l'utilisateur trouvé dans la base de données
        const user = result.rows[0];

        // Vérification du mot de passe de l'utilisateur avec bcrypt
        const isPasswordValid = await bcrypt.compare(user_password, user.user_password);
        if (!isPasswordValid) {
            // Si le mot de passe est incorrect, retour d'une erreur 401
            ctx.status = 401;
            ctx.body = { error: 'Email ou mot de passe incorrect' };
            return;
        }

        // Si l'authentification réussit, génération d'un JWT
        const token = jwt.sign(
            { user_email, user_name: user.user_name },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Réponse avec le statut 200 et le token JWT généré
        ctx.status = 200;
        ctx.body = { message: 'Connexion réussie', token: token, userName: user.user_name };
    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        ctx.status = 500;
        ctx.body = { error: 'Erreur interne du serveur' };
    }
});

