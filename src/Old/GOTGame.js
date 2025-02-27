// src/Game.js
import { INVALID_MOVE } from 'boardgame.io/core';

// Setup initial
export const setupGame = (ctx) => ({
    map: {
        "Winterfell": { owner: 0, units: 1, castle: true },
        "King's Landing": { owner: 1, units: 1, castle: true },
        "The Eyrie": { owner: null, units: 0, castle: true },
    },
    players: {
        0: { house: 'Stark', power: 5, orders: [] },
        1: { house: 'Lannister', power: 6, orders: [] },
    },
    maxTurns: 5,
    num: 0,
    endPhase: false,
});

// Fonction pour placer les ordres (pendant la phase de planification)
export const placeOrders = ({ G, ctx }, territory, orderType) => {
    const currentPlayer = ctx.currentPlayer;
    if (G.map[territory].owner !== Number(currentPlayer) || G.map[territory].owner === null) {
        G.players[currentPlayer].orders.push({ territory, order: orderType });
        console.log("Player : " + currentPlayer.house + " - order : " + orderType + " - territory : " + territory);
        G.num += 1;
    } else {
        return INVALID_MOVE;
    }
};

// Fonction pour résoudre les ordres (pendant la phase d'action)
export const resolveOrders = ({ G, ctx }) => {
    for (let playerID in G.players) {
        G.players[playerID].orders.forEach(order => {
            if (order.order === 'attack') {
                resolveAttack({ G, ctx }, order.territory, playerID);
            }
        });
    }
    // Efface les ordres après la résolution
    for (let playerID in G.players) {
        G.players[playerID].orders = [];
    }

    G.endPhase = true;
};

// Fonction pour résoudre une attaque
export const resolveAttack = ({ G, ctx }, territory, attackingPlayer) => {
    const defender = G.map[territory].owner;
    const attackerStrength = G.players[attackingPlayer].power;
    const defenderStrength = defender !== null ? G.players[defender].power * G.map[territory].units : 0;

    if (attackerStrength > defenderStrength) {
        G.map[territory].owner = Number(attackingPlayer);
    }
};

// Fonction pour vérifier la victoire
export const checkVictory = ({ G, ctx }) => {
    const castlesControlled = { 0: 0, 1: 0 };

    for (const territory in G.map) {
        const owner = G.map[territory].owner;
        if (G.map[territory].castle && owner !== null) {
            castlesControlled[owner]++;
        }
    }

    if (castlesControlled[0] === 3) return 0;
    if (castlesControlled[1] === 3) return 1;
    return null;
};

// Fonction pour déterminer la fin du jeu, s'effectue à chaque action en plus du endIf d'une phase
export const endIfGlobal = ({ G, ctx }) => {
    const winner = checkVictory({ G, ctx });
    if (winner !== null) {
        return { winner };
    }
    if (ctx.turn >= G.maxTurns) {
        return { draw: true };
    }
};

// Fonction pour gérer la fin de chaque tour, s'effectue à chaque fin de tour en plus du onEndTurn d'une phase
export const onEndTurnGlobal = ({ G, ctx }) => {
    //TODO
};

// Définition du jeu avec les phases
export const GameOfThrones = {
    setup: setupGame,

    phases: {
        // Phase de planification (les joueurs placent leurs ordres)
        planning: {
            start: true, // La phase de planification est celle de départ
            onBegin: ({ G, ctx }) => {
                console.log("\n//// Start Planning ////\n");
            },
            moves: { placeOrders },
            endIf: ({ G, ctx }) => {
                return G.num > 0;
            },
            onEnd: ({ G, ctx }) => {
                console.log("\n//// End Planning ////\n");
                G.num = 0;
                G.endPhase = false;
            },
            next: 'action',
        },
        // Phase d'action (les ordres sont résolus)
        action: {
            onBegin: ({ G, ctx }) => {
                console.log("\n//// Start Action ////\n");
                resolveOrders({ G, ctx });
            },
            endIf: ({ G, ctx }) => G.endPhase,
            onEnd: ({ G, ctx }) => {
                console.log("\n//// End Action ////\n");
                G.endPhase = false;
            },
            next: 'westeros',
        },
        // Phase Westeros (un événement aléatoire est tiré)
        westeros: {
            onBegin: ({ G, ctx }) => {
                console.log("\n//// Start Westeros ////\n");
                G.endPhase = true
            },
            endIf: ({ G, ctx }) => G.endPhase, // Retourne à la phase de planification
            onEnd: ({ G, ctx }) => {
                console.log("\n//// End Westeros ////");
                G.endPhase = false
            },
            next: 'planning',
        },
    },

    endIf: endIfGlobal,
    onEndTurn: onEndTurnGlobal,
};