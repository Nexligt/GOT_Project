const { Pool } = require('pg'); // Importation du module pg pour la gestion de PostgreSQL

// Configuration pour se connecter à la base de données par défaut
const initialPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'password',
    port: 5432
});

const NEW_DB_NAME = 'got_game';

// Fonction de délai pour attendre avant de se reconnecter
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour créer la base de données
async function createDatabase() {
    try {
        const client = await initialPool.connect();

        // Vérifie si la base de données existe
        const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
        const checkResult = await client.query(checkDbQuery, [NEW_DB_NAME]);

        // Création de la base de données si elle n'existe pas encore
        if (checkResult.rows.length === 0) {
            await client.query(`CREATE DATABASE ${NEW_DB_NAME}`);
            console.log(`Base de données "${NEW_DB_NAME}" créée avec succès !`);
        } else {
            console.log(`La base de données "${NEW_DB_NAME}" existe déjà.`);
        }

        client.release(); // Libérer le client après utilisation
    } catch (err) {
        console.error("Erreur lors de la création de la base de données :", err);
        throw err;
    } finally {
        await initialPool.end(); // Fermer la connexion initiale
    }
}

// Déclaration du pool global pour la base de données GOT_GAME
let pool;

// Fonction pour initialiser les schémas et tables
async function initializeDatabase() {
    // Nouvelle configuration pour se connecter à la nouvelle base de données
    pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: NEW_DB_NAME,
        password: 'password.',
        port: 5432
    });

    let client;
    try {
        // Attendre 3 secondes pour que la base soit bien reconnue par PostgreSQL
        await delay(3000);

        client = await pool.connect(); // Connexion à la base de données
        await client.query('BEGIN'); // Démarrer une transaction

        // Création de la table "users" si elle n'existe pas encore
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.users (
                id SERIAL PRIMARY KEY, -- Identifiant unique auto-incrémenté
                user_name VARCHAR(100) UNIQUE NOT NULL, -- Nom d'utilisateur unique
                user_email VARCHAR(100) UNIQUE NOT NULL, -- Email unique
                user_password VARCHAR(100) NOT NULL, -- Mot de passe
                id_game VARCHAR(100) -- Identifiant du jeu associé à l'utilisateur
            )
        `);

        await client.query('COMMIT'); // Valider la transaction
        console.log("Schémas et tables initialisés avec succès !");
    } catch (err) {
        console.error("Erreur lors de l'initialisation des schémas et tables :", err);
        if (client) await client.query('ROLLBACK');  // Annuler les changements en cas d'erreur
        throw err;
    } finally {
        if (client) client.release(); // Libérer le client après utilisation
    }
}


// Fonction pour initialiser la base de données et le pool
async function initializeApp() {
    try {
        // Créer la base de données si elle n'existe pas
        await createDatabase();
        
        // Initialiser la base de données avec les schémas et les tables
        await initializeDatabase();

        console.log('Base de données et pool prêts.');
    } catch (err) {
        console.error('Erreur dans l\'initialisation de la base de données :', err);
        throw err; // Arrête l'application si quelque chose échoue
    }
}

// Récupérer le pool de connexions après initialisation
async function getPool() {
    // Attendre que l'initialisation soit terminée avant de retourner le pool
    await initializeApp();
    return pool;
}

// Exportation de la fonction pour récupérer le pool
module.exports = {getPool};


