// src/Board.js
import React from 'react';

export function GameOfThronesBoard({ ctx, G, moves }) {
    const onPlaceOrder = (territory, orderType) => {
        if (ctx.phase === 'planning') {
            moves.placeOrders(territory, orderType);
        }
    };

    const cellStyle = {
        border: '1px solid #555',
        width: '150px',
        height: '150px',
        textAlign: 'center',
        cursor: 'pointer',
        margin: '10px',
    };

    const territories = Object.keys(G.map);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {territories.map((territory, index) => (
                    <div key={index} style={cellStyle}>
                        <div>
                            <strong>{territory}</strong>
                        </div>
                        <div>Owner: {G.map[territory].owner !== null ? `Player ${G.map[territory].owner}` : 'None'}</div>
                        <div>Units: {G.map[territory].units}</div>
                        <button onClick={() => onPlaceOrder(territory, 'attack')}>
                            Attack
                        </button>
                    </div>
                ))}
            </div>
            {ctx.gameover && (
                <div id="winner">
                    {ctx.gameover.winner !== undefined ? `Winner: Player ${ctx.gameover.winner}` : 'Draw!'}
                </div>
            )}
        </div>
    );
}
