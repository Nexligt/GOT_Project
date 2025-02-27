import React, { useState, useEffect} from 'react';

export function GameOfThronesBoard({ ctx, G, moves, playerID }) {
    //#region Déclaration
    const playerMessage = G.msg[playerID];
    const houses = G.houses;

    //#endregion

    //#region Méthodes des actions possibles (Moves)

    // Fonction pour basculer l'état "Ready"
    const onToggleReady = () => {
        moves.toggleReady(); // Appelle la fonction toggleReady dans le jeu
    };

    const onChangeName = (nom) => {
        if (ctx.phase === 'waitingForPlayers') {
            moves.changeName(nom);  // Appelle la fonction HouseSelection dans le jeu
        }
    }

    // Fonction pour choisir une maison
    const onChooseHouse = (houseID) => {
        if (ctx.phase === 'HouseSelection') {
            moves.HouseSelection(houseID);  // Appelle la fonction HouseSelection dans le jeu
        }
    };

    // Fonction pour placer et enlever un ordre
    const onActionOrders = (territory) => {
        if (ctx.phase === 'planning') {
            moves.actionOrders(territory);
        }
    };

    // Fonction pour sélectionner un ordre
    const onSelectOrder = (orderType) => {
        if (ctx.phase === 'planning') {
            moves.selectOrder(orderType);
        }
    };
    

    //#endregion

    //#region Composants phase "Waiting for Player"

    //Zone de changement de Name
    const PlayerNameInput = ({ G, playerID, onChangeName }) => {
        const [name, setName] = useState('');
        const [error, setError] = useState('');
    
        const handleChange = (event) => {
            const input = event.target.value;
            // Expression régulière pour autoriser lettres (y compris accentuées) et chiffres
            if (/^[a-zA-Z0-9àáâäãåèéêëìíîïòóôöõøùúûüýÿÀÁÂÄÃÅÈÉÊËÌÍÎÏÒÓÔÖÕØÙÚÛÜÝŸ]*$/.test(input)) {
                setName(input);
                setError('');
            } else {
                setError('Le nom ne peut contenir que des lettres, des chiffres et des accents.');
            }
        };
        
    
        const handleSubmit = () => {
            if (name) {
                onChangeName(name);
            } else {
                setError('Le nom ne peut pas être vide.');
            }
        };
    
        return (
            <div style={{ marginBottom: '20px' }}>
                <h3>Choisissez votre nom</h3>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center', // Centre les éléments horizontalement
                    alignItems: 'center', // Centre les éléments verticalement
                    gap: '10px',
                    margin: '0 auto' // Centrer la div dans le conteneur parent
                }}>
                    <input
                        type="text"
                        value={name}
                        onChange={handleChange}
                        placeholder={G.players[playerID].name}
                        style={{
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            width: '200px'
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        Valider
                    </button>
                </div>
                {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
            </div>
        );
    };
    

    //Affichage de l'état ready des joueurs
    const PlayerStatus = ({ players, playerID }) => (
        <div style={{ marginTop: '20px' }}>
            <h3>Player Status</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {Object.entries(players).map(([id, playerData]) => (
                    <li
                        key={id}
                        style={{
                            margin: '10px 0',
                            color: 'white',
                            backgroundColor: playerData.ready ? '#006400' : '#8B0000',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            textAlign: 'center',
                            width: '200px',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                    >
                        {id === playerID ? '(You)' : playerData.name || 'Player : ' + id}
                    </li>
                ))}
            </ul>
        </div>
    );

    //Boutton mettre ready les joueurs avant de lancer le jeu
    const ReadyButton = ({ isReady, onToggleReady }) => (
        <div>
            <button
                onClick={onToggleReady}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: isReady ? '#006400' : '#8B0000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                {isReady ? 'Cancel Ready' : 'Ready'}
            </button>
        </div>
    );

    //Phase "Waiting for Players" où on attends que les joueurs soient tous ready
    const WaitingForPlayers = ({ ctx, G, playerID, onToggleReady, onChangeName }) => {
        if (ctx.phase !== 'waitingForPlayers') return null;

        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <h2>En attente que les joueurs soient prêts</h2>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'top', maxWidth: '50%', margin: '3% auto' }}>
                    <div style={{ flex: 1, textAlign: 'center'}}>
                        <PlayerNameInput G={G} playerID={playerID} onChangeName={onChangeName} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'center'}}>
                        <ReadyButton isReady={G.players[playerID].ready} onToggleReady={onToggleReady} />
                        <PlayerStatus players={G.players} playerID={playerID} />
                    </div>
                </div>
            </div>
        );
        
        
        
    };

    //#endregion

    //#region Composants phase House selection

    //Rectangle rouge pour indiquer à quel joueur c'est le tour
    const PlayerTurnIndicator = ({ currentPlayerName }) => (
        <div style={{
            backgroundColor: '#bb0b0b',
            color: 'white',
            borderRadius: '12px',
            padding: '10px 20px',
            marginBottom: '20px',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'inline-block',
        }}>
            C'est à {currentPlayerName} de choisir une maison
        </div>
    );

    const HouseCard = ({ house, index, isCurrentPlayerHouse, isClickable, onChooseHouse }) => (
        <div
            key={index}
            onClick={() => isClickable && onChooseHouse(house)}// Empêche de choisir la maison si elle est déjà sélectionnée
            style={{
                width: '150px',
                height: '200px',
                margin: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isClickable ? 'pointer' : 'not-allowed',// Désactive le clic si la maison est déjà choisie
                backgroundColor: isCurrentPlayerHouse || isClickable ? house.color || '#f4f4f4' : '#ddd',// Garde la couleur de la maison choisie
                border: '2px solid #333',
                borderRadius: '8px',
                color: isCurrentPlayerHouse || isClickable ? house.colorComp || '#ffffff' : '#000000',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s',
                transform: isCurrentPlayerHouse ? 'scale(1.1)' : 'scale(1)',
                filter: isCurrentPlayerHouse || isClickable ? 'none' : 'grayscale(100%) brightness(0.8)',// Grise les autres maisons
            }}
            onMouseEnter={(e) => ctx.currentPlayer === playerID && isClickable && (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => ctx.currentPlayer === playerID && isClickable && (e.currentTarget.style.transform = 'scale(1)')}
        >
            <img
                src={house.logo}
                alt={`${house.name} Logo`}
                style={{
                    width: '100px',
                    height: '100px',
                    marginBottom: '10px',
                    filter: isCurrentPlayerHouse || isClickable ? 'none' : 'grayscale(100%)', // Filtre pour le logo de la maison
                }}
            />
            <span>{house.name}</span>
        </div>
    );

    const HouseSelection = ({ ctx, G, playerID, houses, onChooseHouse }) => {
        if (ctx.phase !== 'HouseSelection') return null;
        
        const numberOfPlayers = Object.keys(G.players).length;// Nombre de joueurs
        const availableHouses = Object.values(houses).slice(0, numberOfPlayers);// Limiter les maisons disponibles en fonction du nombre de joueurs
        const currentPlayerName = ctx.currentPlayer !== playerID ? G.players[ctx.currentPlayer]?.name || (`Player : ${ctx.currentPlayer}`) : 'vous'; // Récupérer le nom du joueur en cours
        
        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <h2>Choixpeau Time</h2>
                <PlayerTurnIndicator currentPlayerName={currentPlayerName} />
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {availableHouses.map((house, index) => {
                        const isHouseSelected = Object.values(G.players).some(player => player.house && player.house.id === index);
                        const playerHaveHouse = G.players[playerID].house !== null;
                        const isCurrentPlayerHouse = playerHaveHouse ? G.players[playerID].house.id === index : false;
                        const isClickable = !isHouseSelected && !playerHaveHouse;
                        return (
                            <React.Fragment key={index}>
                                <HouseCard
                                    house={house}
                                    index={index}
                                    isHouseSelected={isHouseSelected}
                                    isCurrentPlayerHouse={isCurrentPlayerHouse}
                                    isClickable={isClickable}
                                    onChooseHouse={onChooseHouse}
                                />
                                
                                {isHouseSelected && (
                                    <div style={{ marginTop: '10px', fontSize: '15px', fontStyle: 'italic', color: isCurrentPlayerHouse || isClickable ? house.colorComp || '#ffffff' : '#000000' }}>
                                        {Object.entries(G.players).map(([id, playerData]) => {
                                            // Vérifie si la maison du joueur correspond à celle en cours
                                            if (playerData.house === index) {
                                                // Affiche le nom ou l'ID du joueur
                                                return (
                                                    <div key={id}>
                                                        {playerData.name || `Player: ${id}`}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                )}
                            </React.Fragment>
                        );                    
                    })}
                </div>
            </div>
        );
    };

    //#endregion

    //#region Composants MainGameBoard

    //Affichage du message superposé en haut de l'écran
    const MessageOverlay = ({ message, backgroundColor, actions = [] }) => {
        if (!message) return null;

        //Permet l'utilisation des fonctions à partir d'un string
        const fonctions = {
            onToggleReady: () => onToggleReady(), // Associe le nom à la vraie fonction
            btnColor: () => {return G.players[playerID].ready ? 'green' : '#c9302c'}
        };

        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: backgroundColor,
                    color: '#000',
                    padding: '0.5% 2%',
                    marginTop: '0.5%',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}
            >
                <span>{message}</span>
    
                {/* Boutons interactifs */}
                {actions.map((action, index) => {
                    const color = fonctions[action.color] ? fonctions[action.color]() : action.color;

                    return (
                    <button
                        key={index}
                        onClick={() => {
                        if (fonctions[action.actionKey]) {
                            fonctions[action.actionKey](); // Exécute la bonne fonction
                        }
                        }}
                        style={{
                        backgroundColor: color,
                        color: '#fff',
                        border: `2px solid ${color}`,
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: '0.2s',
                        }}
                    >
                        {action.label}
                    </button>
                    );
                })}
            </div>
        );
    };
    

    //Affichage de l'image du plateau de jeu
    const BoardMap = () => (
        <div
            style={{
                flex: 2,
                margin: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '80%',
                height: 'auto',
            }}
        >
            <img
                src="/res/images/boards/map.svg"
                alt="Game Map"
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    border: '3px solid #333',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            />
        </div>
    );

    //Affichage de l'information sur le gagnant ou la fin du jeu
    const GameOverInfo = ({ gameover }) => {
        if (!gameover) return null;
    
        return (
            <div
                id="winner"
                style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                }}
            >
                {gameover.winner !== undefined ? `Winner: Player ${gameover.winner}` : 'Draw!'}
            </div>
        );
    };

    //Affichage des cartes des joueurs
    const BoardsGame = () => (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {/* boards cards Westeros et Wildlings */}
            <img
                src="/res/images/boards/cards.svg"
                alt="Cards"
                style={{
                    maxWidth: '92%',
                    maxHeight: '92%',
                    border: '3px solid #333',
                    borderRadius: '15px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            />
            {/* boards WVR */}
            <img
                src="/res/images/boards/wvr.svg"
                alt="wvr board"
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    marginTop: '5px',
                }}
            />
            {/* boards Influence */}
            <img
                src="/res/images/boards/influence.svg"
                alt="Influence"
                style={{
                    maxWidth: '92%',
                    maxHeight: '92%',
                    border: '3px solid #333',
                    borderRadius: '15px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginTop: '5px',
                }}
            />
            {/* boards Supply */}
            <img
                src="/res/images/boards/supply.svg"
                alt="Supply"
                style={{
                    maxWidth: '92%',
                    maxHeight: '92%',
                    border: '3px solid #333',
                    borderRadius: '15px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginTop: '5px',
                }}
            />
        </div>
    );

    const PlayerInfo = ({ player, playerId, houses }) => {
        const houseInfo = houses.find((house) => house.id === player.house.id)
        const controlledTerritories = Object.keys(G.map).filter( (territory) => G.map[territory].fields.owner_family === Number(playerId) );
        const [isExpanded, setIsExpanded] = useState(false); // état pour gérer l'affichage des infos

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '25vh',
                    height: 'auto',
                    margin: '2px',
                    marginTop: '5px',
                    padding: '10px',
                    backgroundColor: houseInfo.color || '#f4f4f4',
                    border: '2px solid #333',
                    borderRadius: '8px',
                    color: houseInfo.colorComp || '#fff',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    cursor: 'pointer',
                }}
                onClick={() => setIsExpanded(!isExpanded)} // Toggle visibility
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <strong style={{ marginRight: '10px' }}>{player.name}</strong>
                    {houseInfo && (
                        <img
                        src={houseInfo.logo}
                        alt={`${player.house.name} Logo`}
                        style={{ width: '50px', height: '50px' }}
                        />
                    )}
                </div>


                {/* Affichage des informations supplémentaires */}
                {isExpanded && (
                    <div style={{ marginTop: '10px' }}>
                        <div>{player.house.name || 'No House'}</div>
                        <div>Territories: {controlledTerritories.length}</div>
                        <div>Special Orders: {player.nbOrdersMax}</div>
                        <div>Units: {player.units}</div>
                    </div>
                )}
            </div>
        );
    };

    const PlayerCards = ({ currentPlayer }) => {
        const [hoveredCard, setHoveredCard] = useState(null);

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-evenly', // Répartition équitable
                gap: '8px',
                width: '100%',
                marginBottom: '10px',
                position: 'relative', // Permet d'afficher la description au-dessus des cartes
            }}>
                {currentPlayer.house.cards.map((card, index) => (
                    <div
                        key={index}
                        onMouseEnter={() => setHoveredCard(card)}
                        onMouseLeave={() => setHoveredCard(null)}
                        style={{
                            padding: '8px',
                            backgroundColor: '#555',
                            color: '#fff',
                            borderRadius: '8px',
                            fontSize: '14px',
                            width: '100px',
                            height: '40px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                        }}
                    >
                        {/* Titre de la carte */}
                        <span style={{
                            fontWeight: 'bold',
                            textAlign: 'center',
                        }}>
                            {card.name}
                        </span>
                    </div>
                ))}
                {/* Zone de description affichée */}
                {hoveredCard && (
                    <div style={{
                        position: 'absolute',
                        top: '-350%', // Place la description au-dessus des cartes
                        left: '50%', // Centré par rapport à la largeur totale
                        transform: 'translateX(-50%)',
                        backgroundColor: '#222',
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '0.5em',
                        width: '30em',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                        textAlign: 'center',
                        zIndex: 10,
                    }}>
                        <p style={{ fontSize: '14px', margin: 0 }}>Description :<br/></p>
                        <p style={{ fontSize: '12px', margin: 0 }}>{hoveredCard.description}</p>
                    </div>
                )}
            </div>
        );
    };


    const PlayerBoard = ({ G, playerId, onSelectOrder }) => {
        const currentPlayer = G.players[playerId];
        const availableOrders = G.orders.availableOrders[playerId];
        const playerPower = currentPlayer.power;
        const selectOrder = currentPlayer.selectOrder;
    
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                margin: '5vh',
                background: currentPlayer.house.color,
                border: '2px solid #333',
                borderRadius: '30px',
                color: currentPlayer.house.colorComp || '#fff',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                padding: '20px',
                width: '100%',
            }}>
    
                {/* En-tête : Nom, Logo et Puissance */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: '5px',
                }}>
                    {/* Logo + Nom de la Maison */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <img
                            src={currentPlayer.house.logo}
                            alt={`${currentPlayer.house.name} logo`}
                            style={{
                                width: '15vh',
                                height: '15vh',
                                marginRight: '10px',
                            }}
                        />
                        <span style={{
                            fontSize: '8vh',
                            fontWeight: 'bold',
                        }}>
                            {currentPlayer.house.name}
                        </span>
                    </div>
    
                    {/* Puissance du joueur */}
                    <div style={{
                        textAlign: 'center',
                        fontSize: '4vh',
                        fontWeight: 'bold',
                        marginRight: '30px',
                    }}>
                        Puissance : {playerPower}
                    </div>
                </div>
    
                {/* Ordres disponibles - distribution équitable */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-evenly', // Répartit les enfants de manière équitable
                    gap: '10px',
                    marginBottom: '20px',
                    width: '100%',
                }}>
                    {Object.entries(availableOrders).map(([orderType, count]) => (
                        <div key={orderType} style={{
                            position: 'relative',
                            cursor: count > 0 ? 'pointer' : 'not-allowed',
                            transition: 'border 0.2s ease',
                        }}
                            onClick={() => count > 0 && onSelectOrder(orderType)}
                        >
                            <img
                                src={`/res/images/orders/${orderType}.svg`}
                                alt={`${orderType} order`}
                                style={{
                                    width: '10vh',
                                    height: 'auto',
                                    opacity: count > 0 ? 1 : 0.5,
                                    filter: orderType === selectOrder ? 'sepia(100%) invert(100%)' : 'none',
                                }}
                            />
                            {count > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    bottom: '0px',
                                    right: '-5px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '12px',
                                }}>
                                    {count}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
    
                <PlayerCards currentPlayer={currentPlayer} />
            </div>
        );
    };

    // Composant pour chaque territoire
    const TerritoryCell = ({ territoryData, placedOrder, ownerColor, onActionOrders, myTerritory }) => {
        return (
            <div
                style={{
                    width: '150px',
                    height: '100px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    backgroundColor: ownerColor,
                    color: '#000',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s ease',
                    position: 'relative', // Ajouté pour éviter que l'image disparaisse
                }}
                onClick={() => onActionOrders(territoryData.id)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                {territoryData.fields.name}
    
                {/* Affichage de l'ordre placé */}
                {placedOrder && placedOrder.type && (myTerritory || ctx.phase !== 'planning') && (
                    <img
                        src={`/res/images/orders/${placedOrder.type}.svg`}
                        alt={`${placedOrder.type} order`}
                        style={{
                            width: '30px',
                            height: '30px',
                            position: 'absolute',
                            bottom: '5px',
                            right: '5px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            opacity: 1, // Toujours visible
                            transition: 'opacity 0.3s ease-in-out',
                        }}
                    />
                )}
            </div>
        );
    };
    
    // Composant pour afficher la liste des territoires
    const TerritoryList = ({ territories, G, onActionOrders }) => {
        const [, setRefresh] = useState(false);
    
        // Force un refresh quand les ordres changent
        useEffect(() => {
            setRefresh(prev => !prev);
        }, [G.orders.placedOrders]);
    
        return (
            <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3>Territoires disponibles</h3>
                    <h5>Zone Temporaire tant que la map n'est pas fonctionnelle</h5>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                        justifyContent: 'center',
                        padding: '20px',
                    }}
                >
                    {Object.entries(territories).map(([index, territoryData]) => {
                        const ownerID = territoryData.fields.owner_family;
                        const owner = Object.values(G.players).find(
                            (player) => player.house && player.house.id === ownerID
                        );
                        const ownerColor = ownerID !== -1 && owner?.house ? owner.house.color : '#ddd';
                        const placedOrder = G.orders.placedOrders[territoryData.id];
                        const myTerritory = ownerID === G.players[playerID].house.id;
    
                        return (
                            <TerritoryCell
                                key={territoryData.id}
                                territoryData={territoryData}
                                placedOrder={placedOrder}
                                ownerColor={ownerColor}
                                onActionOrders={onActionOrders}
                                myTerritory={myTerritory}
                            />
                        );
                    })}
                </div>
            </>
        );
    };
    

    const MainGameBoard = ({ ctx, G, playerID, houses, playerMessage, onActionOrders, onSelectOrder }) => {
        if (ctx.phase === 'waitingForPlayers') return null;
        if (ctx.phase === 'HouseSelection') return null;
        return(
            <div style={{ backgroundColor: '#e2e1e1', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <MessageOverlay message={playerMessage.message} backgroundColor={playerMessage.backgroundColor} actions={playerMessage.actions} />
                    <div style={{ display: 'flex', flexDirection: 'row', width: '60%' }}>
                        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                            <BoardMap />
                            <GameOverInfo gameover={ctx.gameover} />
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: '40px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                            {Object.entries(G.players).map(([id, playerData]) => (
                                <PlayerInfo key={id} player={playerData} playerId={id} houses={houses} />
                            ))}
                        </div>
                        <BoardsGame />
                    </div>
                </div>
                <TerritoryList territories={G.map} G={G} onActionOrders={onActionOrders} />
                <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PlayerBoard G={G} playerId={playerID} onSelectOrder={onSelectOrder} />
                </div>
            </div>
        )
    };

    //#endregion

    //#region Affichage
    return(
        <>
            <WaitingForPlayers ctx={ctx} G={G} playerID={playerID} onToggleReady={onToggleReady} onChangeName={onChangeName}/>
            <HouseSelection ctx={ctx}  G={G} playerID={playerID} houses={houses} onChooseHouse={onChooseHouse} />
            <MainGameBoard
                ctx={ctx}
                G={G}
                playerID={playerID}
                houses={houses}
                playerMessage={playerMessage}
                onActionOrders={onActionOrders}
                onSelectOrder={onSelectOrder}
            />
        </>
    )
    //#endregion
}
