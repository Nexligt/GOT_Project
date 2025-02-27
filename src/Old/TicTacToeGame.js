import { INVALID_MOVE } from 'boardgame.io/core';

// Fonction externe pour gérer le clic sur une cellule
export const clickCell = ({ G, playerID, ctx }, id) => {
    if (G.cells[id] !== null) {
        return INVALID_MOVE;  // Si la cellule est déjà occupée, retourne INVALID_MOVE
    }
    G.cells[id] = playerID;  // Sinon, affecte le joueur à la cellule
};

// Fonction pour vérifier si le joueur a gagné
function IsVictory(cells) {
    const positions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];

    const isRowComplete = row => {
        const symbols = row.map(i => cells[i]);
        return symbols.every(i => i !== null && i === symbols[0]);
    };

    return positions.map(isRowComplete).some(i => i === true);
}

// Fonction pour vérifier si la partie est un match nul
function IsDraw(cells) {
    return cells.filter(c => c === null).length === 0;
}

// Setup initial de TicTacToe
export const TicTacToe = {
    setup: () => ({ cells: Array(9).fill(null) }),

    turn: {
        minMoves: 1,
        maxMoves: 1,
    },

    // Référence à la fonction clickCell externe
    moves: {
        clickCell,  // Remplace la logique ici par une référence à la fonction externe
    },

    endIf: ({ G, ctx }) => {
        if (IsVictory(G.cells)) {
            return { winner: ctx.currentPlayer };
        }
        if (IsDraw(G.cells)) {
            return { draw: true };
        }
    },
};
