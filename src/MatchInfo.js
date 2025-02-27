import React, { useState } from 'react';

//Méthode utilisé dans lobby.js pour avoir toute les infos des match afin de debug

function MatchInfo() {
  const [matchID, setMatchID] = useState('');
  const [matchInfo, setMatchInfo] = useState(null);
  const [error, setError] = useState(null);

  const fetchMatchInfo = async () => {
    try {
      setError(null); // Reset errors
      const response = await fetch(`http://localhost:8000/games/gameofthrones/${matchID}`);
      
      if (!response.ok) {
        throw new Error(`Match ${matchID} introuvable.`);
      }

      const data = await response.json();
      setMatchInfo(data);
    } catch (err) {
      setMatchInfo(null);
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Obtenir des informations sur un match</h2>
      <input
        type="text"
        value={matchID}
        onChange={(e) => setMatchID(e.target.value)}
        placeholder="Entrer le MatchID"
      />
      <button onClick={fetchMatchInfo}>Obtenir les informations</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {matchInfo && (
        <div>
          <h3>Informations du Match</h3>
          <p><strong>MatchID :</strong> {matchInfo.matchID}</p>
          <p><strong>Joueurs :</strong></p>
          <ul>
            {matchInfo.players.map((player, index) => (
              <li key={index}>
                Joueur {index} : {player.name || 'En attente'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MatchInfo;
