// src/Game.js

import { INVALID_MOVE, Stage } from 'boardgame.io/core';

// Importer les données
import initialState from './res/donnees/initialState.json';
import adjacentBorders from './res/donnees/border.json';
import houseCards_Stark from './res/donnees/housecards_stark.json';
import houseCards_Lannister from './res/donnees/housecards_lannister.json';


//#region INITIALISATION DU JEU
// ==================== INITIALISATION DU JEU ====================

// Fonction de setup initial du jeu
export const setupGame = ({ G,ctx}) => {

    const players = {};
    const messages = {};

    // Initialisation des joueurs
    for (let i = 0; i < ctx.numPlayers; i++) {
		
        players[i] = {
            name: 'Player ' + i,
            ready: false,
            house: null,

            power: 5,
            castle: 0,
            stronghold: 0,

            selectOrder: null
        };
        console.log(players[i].name)

        // Initialisation des messages par joueur
        messages[i] = {
            message: "Début du Jeu",
            backgroundColor: "blue",
            actions: []
        };

    }

    // Initialisation des maisons avec leurs cartes
    const initializedHouses = fillHouseCards(initialState.houses);

    return {

        houses: initializedHouses,

        orders: {
            availableOrders: Object.fromEntries(
                Object.keys(players).map((playerId) => [
                    playerId,
                    { ...initialState.orders },
                ])
            ),
            placedOrders: {}
        },
		  

        map: initialState.territory,

        players: players,

        highlightTerritory: [],

        msg: messages,
		
        currentTurn: 1,
        maxTurns: 15,
        endPhase: false,
    };
};


// Fonction pour remplir les cartes de maison avec les bons JSON
function fillHouseCards(houses) {
    const houseCardMap = {
        Stark: houseCards_Stark,
        Lannister: houseCards_Lannister,
        // Ajoutez d'autres maisons ici avec leurs JSON de cartes correspondants
    };

    return houses.map(house => {
        if (houseCardMap[house.name]) {
            return { ...house, cards: houseCardMap[house.name] };
        }
        return house;
    });
}

//#endregion

//#region MOUVEMENTS ET ORDRES
// ==================== MOUVEMENTS ET ORDRES ====================

// Fonction pour sélectionner un ordre pour un joueur
export const selectOrder = ({ G, playerID }, orderType) => {
    const currentPlayer = G.players[playerID];

    if (G.orders.availableOrders[playerID][orderType] <= 0) return "No orders of this type available.";
    currentPlayer.selectOrder = currentPlayer.selectOrder === orderType ? null : orderType;
};

// Fonction pour gérer les ordres (placer ou retirer) sur un territoire
export const actionOrders = ({ G, ctx, playerID }, territoryID) => {
    const currentPlayer = G.players[playerID];

    // Si un ordre est déjà placé sur le territoire, il est retiré
    if (G.orders.placedOrders[territoryID])
        removeOrder({ G, ctx, playerID }, territoryID);

    // Si un ordre est sélectionné, il est placé sur le territoire
    if (currentPlayer.selectOrder)
        placeOrder({ G, ctx, playerID }, territoryID);
};

// Fonction pour placer un ordre sur un territoire
const placeOrder = ({ G, ctx, playerID }, territoryID) => {
    const currentPlayer = G.players[playerID];
    const orderType = currentPlayer.selectOrder;
    const territory = G.map.find(t => t.id === territoryID);

    if (currentPlayer.ready) {
        return setPlayerMessage({ G, playerID }, "Impossible de placer un ordre après avoir signalé être prêt", "#c9302c");
    }

    // Validation des règles avant de placer l'ordre
    if (!territory) return setPlayerMessage({ G, playerID }, "Territoire introuvable", "#c9302c");
    if (territory.fields.owner_family !== currentPlayer.house.id) {return setPlayerMessage({ G, playerID }, "Vous ne contrôlez pas ce territoire", "#c9302c");}
    if (!orderType) return setPlayerMessage({ G, playerID }, "Aucun ordre sélectionné", "#c9302c");
    // if (territory.fields.units.length === 0) return setPlayerMessage({ G, playerID}, "Aucune unité sur ce territoire", "#c9302c");

    // Placer l'ordre sur le territoire
    G.orders.placedOrders[territoryID] = { player: playerID, type: orderType };
    G.orders.availableOrders[playerID][orderType]--; // Réduit le nombre d'ordres disponibles	
    currentPlayer.selectOrder = null; // Réinitialiser la sélection de l'ordre

    setPlayerMessage({ G, playerID }, "Ordre placé", "green");

    //Vérifier si tous les territoires du joueur ont un ordre placé
    const allTerritoriesOwned = Object.values(G.map).filter(t => t.fields.owner_family === currentPlayer.house.id);
    const allOrdersPlaced = allTerritoriesOwned.every(t => G.orders.placedOrders[t.id]);

    if (allOrdersPlaced) {
        const button = [{ label: "Ready", actionKey: 'onToggleReady', color: "btnColor" }];
        setPlayerMessage({ G, playerID }, "Vous avez placé des ordres sur tous vos territoires ! Êtes-vous prêt ? ", "orange", button );
    }
};


// Fonction pour retirer un ordre sur un territoire
																	   
const removeOrder = ({ G, ctx, playerID }, territoryID) => {
    const currentPlayer = G.players[playerID];
    const territory = G.map.find(t => t.id === territoryID);

    if (currentPlayer.ready) {
        return setPlayerMessage({ G, playerID }, "Impossible de retirer un ordre après avoir signalé être prêt", "#c9302c");
    }

							 
    if (!territory) return setPlayerMessage({ G, playerID }, "Territoire introuvable", "#c9302c");
    if (territory.fields.owner_family !== currentPlayer.house.id) {return setPlayerMessage({ G, playerID }, "Vous ne contrôlez pas ce territoire", "#c9302c");}
    if (!G.orders.placedOrders[territoryID]) return setPlayerMessage({ G, playerID }, "Aucun ordre trouvé sur ce territoire à retirer", "#c9302c");
	//if (territory.fields.units.length === 0) return setPlayerMessage({ G, playerID}, "Aucune unité sur ce territoire.", "#c9302c"); //vérification à AJOUTER quand les units seront implémenté																																														

    // Retirer l'ordre
    const orderType = G.orders.placedOrders[territoryID].type;
    delete G.orders.placedOrders[territoryID];
										   
    G.orders.availableOrders[playerID][orderType]++;// Réapprovisionner l'ordre disponible

    setPlayerMessage({ G, playerID }, "Ordre retiré", "green");
};

// Fonction pour réinitialiser les ordres de tous les joueurs
export const resetPlayerOrders = ({ G }) => {
    G.orders.availableOrders = Object.fromEntries(
        Object.keys(G.players).map((playerId) => [
            playerId,
            { ...initialState.orders },
        ])
    );
    G.orders.placedOrders = {};
    console.log("Ordres réinitialisés pour tous les joueurs.");
	
	///TODO Ajouter les ordres spéciaux en fonction des placements sur le plateau d'influence
};
//#endregion

//#region RÉSOLUTION DES ORDRES
// ==================== RÉSOLUTION DES ORDRES ====================

// Fonction pour résoudre les ordres
export const resolveOrders = ({ G, ctx }, territoryID) => {
    const orderType = G.orders.placedOrders[territoryID].type;

    switch (orderType) {
        case "raid" || "raid_spe":
            G.highlightTerritory = resolvedRaid(orderType, territoryID);
            break;
         case "marche_m1" || "marche_p0" || "marche_spe" :
            //resolvedMarche(orderType, territoryID);
            break;
        
        case "defense" || "defense_spe" :
            //resolvedDefense(orderType, territoryID);
            break;
        
        case "soutien" || "soutien_spe" :
            //resolvedSoutien(orderType, territoryID);
            break;
        
        case "consolidation" || "consolidation_spe":
            //resolvedConsolidation(orderType, territoryID);
            break;

        default :									  
            break;	 
    }
};

// Fonction pour résoudre un raid
const resolvedRaid = ({ G, ctx }, orderType, territoryID) => {
    const territory = G.map.find(t => t.id === territoryID);
    if (!territory) return "error : territory not found";

    // Identifier les types d'ordres valides
    const validOrderTypes = orderType === "raid" ? ["soutien", "raid", "consolidation"] : ["soutien", "raid", "consolidation", "defense"];

	// Filtrer les paires adjacentes								
    const adjacentIDs = adjacentBorders
        .filter(border => border.territoryA === territoryID)
        .map(border => border.territoryB);

	// Appliquer la logique selon la condition terrestre/maritime															 
    const validTerritories = adjacentIDs.filter(id => {
        const adjacentTerritory = G.map.find(t => t.id === id);
        if (!adjacentTerritory) return false;

        const hasValidOrder = validOrderTypes.some(orderType =>
            G.orders.placedOrders[id] && G.orders.placedOrders[id].type === orderType
        );

        if (!hasValidOrder) return false;

        if (isMaritime(territoryID)) {
            return true; // Si le territoire est maritime, on prend tous les adjacents avec l'ordre valide
        } else {
			// Sinon, seuls les adjacents terrestres seront pris en compte														  
            return !isMaritime(adjacentTerritory);
        }
    });

    return validTerritories;
};
//#endregion

//#region LOGIQUE DE COMBAT
// ==================== LOGIQUE DE COMBAT ====================

// Fonction pour résoudre une attaque // C'est une première version, donc probablement à changer
export const resolveAttack = ({ G, ctx }, territoryID, attackingPlayer) => {
    const territory = G.map.find(t => t.id === territoryID);

    if (!territory) { console.error(`Territory with ID ${territoryID} not found.`); }

    const defender = G.players[Number(territory.owner_family)];
    const attacker = G.players[attackingPlayer];
    const attackerStrength = attacker.power;
    const defenderStrength = defender !== null ? defender.power * territory.units.length() : 0;

    console.log("attacker : " + attacker + " strength : " + attackerStrength);
    console.log("defender : " + defender + " strength : " + defenderStrength);

    if (attackerStrength > defenderStrength) {
        console.log(`${G.houses[attacker.house].name} won the attack against ${defender.house} and captured ${territory}!`);
        territory.fields.owner_family = attacker.house;
        if (territory.fields.stronghold) { attacker.stronghold++; defender.stronghold--; }
        if (territory.fields.castle) { attacker.castle++; defender.castle--; }
    }
};
//#endregion

//#region FIN DE PARTIE ET GESTION DES TOURS
// ==================== FIN DE PARTIE ET GESTION DES TOURS ====================

// Fonction pour déterminer la fin du jeu , s'effectue à chaque action en plus du endIf d'une phase
export const endIfGlobal = ({ G, ctx }) => {
	//const winner = Object.values(G.players).find(player => player.stronghold + player.castle === 7).name || null;
    const winner = null;
					   
    if (winner !== null) {
        return { winner };
    }

    if (ctx.turn >= G.maxTurns) {
        const playerName = Object.values(G.players).reduce((maxPlayer, player) => {
            return (player.strongholds + player.castles) > (maxPlayer.strongholds + maxPlayer.castles) ? player : maxPlayer;
        }).name;
        return { playerName };
    }
};

// Fonction pour gérer la fin de chaque tour
export const onEndTurnGlobal = ({ G, ctx }) => {
    // TODO: Implémentez la gestion de la fin de chaque tour si nécessaire
};
//#endregion

//#region FONCTIONS UTILES
// ==================== FONCTIONS UTILES ====================

// Fonction pour vérifier si un territoire est maritime
export const isMaritime = ({ G }, territoryID) => {
    const territory = G.map.find(t => t.id === territoryID);
    return territory.fields.type === 2;
};

// Fonction pour changer l'état "ready" d'un joueur
export const toggleReady = ({ G, ctx, playerID }) => {
    const currentPlayer = G.players[playerID];
    currentPlayer.ready = !currentPlayer.ready;
    console.log("Switch Ready into : " + currentPlayer.ready)
};

// Fonction pour choisir une maison
export const HouseSelection = ({ G, ctx, playerID }, house) => {
    const currentPlayer = G.players[playerID];
    currentPlayer.house = house;
    console.log("Player : " + currentPlayer.name + " - House : " + house.name);
};

// Fonction pour afficher des messages à un joueur
export const setPlayerMessage = ({ G, playerID }, txt, couleur, actions=[]) => {
    G.msg[playerID] = { message: txt, backgroundColor: couleur, actions: actions};
};

//Fonction pour changer de name lors de la partie
export const changeName = ({ G, playerID },nom) => {
    const currentPlayer = G.players[playerID];
    currentPlayer.name = nom;
};
//#endregion

//#region DÉFINITION DU JEU
// ==================== DÉFINITION DU JEU ====================

export const GameOfThrones = {
    name: "game-of-thrones", //Nom du jeu
    setup: setupGame, // Méthode de setup (définit en haut du code)
  
    minPlayers: 1,  // Définissez le minimum
    maxPlayers: 6,  // et le maximum de joueurs
											
    phases: {
        // Phase d'attente pour les joueurs
        waitingForPlayers: {
            //Parametre pour indiquer que l'on commence par cette phase
            start: true,

            //Parametre pour rendre tout les joueur en activePlayer, activePlayer = le joueur peut faire une action
            turn: { activePlayers: { all: Stage.NULL } },

            //Actions autorisées lors de cette phase (les plus souvents des fonctions)
            moves: { toggleReady, changeName},

            //Méthode qui se réalise au lancement de la phase
            onBegin: ({ G, ctx }) => { console.log("En attente de joueurs...");},

            //Méthode pour passer à la phase suivante quand égale à true
            endIf: ({ G, ctx }) => {
                // Vérifie si tous les joueurs sont prêts
                return Object.values(G.players).every(player => player.ready);
            },

            //Méthode qui se réalise à la fin d'une phase (ici remise à false du paramètre "ready" de chaque joueur)
            onEnd: ({ G, ctx }) => { Object.keys(G.players).forEach(playerID => {toggleReady({ G, playerID })}); },

            //Indique la phase suivante quand le endIf égale true
            next: 'HouseSelection',
        },

        // Phase de choix de maison 
        HouseSelection: {	   
            turn: { minMoves: 1, maxMoves: 1 },
            moves: { HouseSelection },

            onBegin: ({ G, ctx }) => { console.log("///// Start Choosing House /////"); },
								
																 
            endIf: ({ G, ctx }) => Object.values(G.players).every(player => player.house !== null),// Vérifie si tous les joueurs ont choisi une maison
            onEnd: ({ G, ctx }) => { console.log("\n//// End Choosing House ////\n"); },
            next: 'planning',
        },											  

        // Phase de planification
        planning: {
            turn: { activePlayers: { all: Stage.NULL } },
            moves: { selectOrder, actionOrders, toggleReady },
            onBegin: ({ G, ctx }) => {
                console.log("\n//// Start Planning ////\n");
                Object.keys(G.players).forEach(playerID => setPlayerMessage({ G, playerID }, "Vous pouvez placer vos ordres sur vos territoires", "orange"));
            },
													   
            endIf: ({ G, ctx }) => Object.values(G.players).every(player => player.ready), // Vérifie si tous les joueurs sont prêts
		  
            onEnd: ({ G, ctx }) => {
                Object.keys(G.players).forEach(playerID => { toggleReady({ G, playerID })});
                console.log("\n//// End Planning ////\n");
            },

            next: 'resolvingOrders',				
        },

        // Phase de résolution des ordres
        resolvingOrders: {
            turn: { activePlayers: { all: Stage.NULL } },
            moves: { toggleReady, resolveOrders, /*cancelAction*/ },

            onBegin: ({ G, ctx }) => { console.log("\n//// Start Resolving Orders ////\n");
                const button = [{ label: "Passer", actionKey: 'onToggleReady', color: "#c9302c" }]; //Temporaire le temps d'avoir une vrai phase fonctionnelle 
                Object.keys(G.players).forEach(playerID => setPlayerMessage({ G, playerID }, "Résolvez les Ordres", "orange", button));
            },
            endIf: ({ G, ctx }) => G.orders.placedOrders.length === 0 || Object.values(G.players).some(player => player.ready),
            onEnd: ({ G, ctx }) => { 
                Object.keys(G.players).forEach(playerID => {toggleReady({ G, playerID })});
                resetPlayerOrders({G});
                console.log("\n//// End Resolving Orders ////\n");
            },

            next: 'westeros',
        },
  
        // Phase Westeros (un événement aléatoire est tiré)
        westeros: {
            turn: { activePlayers: { all: Stage.NULL } },
            moves: { toggleReady},

            onBegin: ({ G, ctx }) => {
                console.log("\n//// Start Westeros ////\n");
                const button = [{ label: "Passer", actionKey: 'onToggleReady', color: "#c9302c" }]; //Temporaire le temps d'avoir une vrai phase fonctionnelle 
                Object.keys(G.players).forEach(playerID => setPlayerMessage({ G, playerID }, "Une carte westeros est tiré", "orange", button));
            },
            endIf: ({ G, ctx }) => Object.values(G.players).some(player => player.ready),
            onEnd: ({ G, ctx }) => {
                Object.keys(G.players).forEach(playerId => { G.players[playerId].ready = false;});
                console.log("\n//// End Westeros ////");
            },

            next: 'planning',
        },
    },
  
    endIf: endIfGlobal,
    onEndTurn: onEndTurnGlobal,
};
//#endregion