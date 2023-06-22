import { FC, useEffect, useState } from 'react';
import { ConnectionManager } from '../ConnectionManager';
import { Board } from './Board';
import { useSocket } from '../../hooks/useSocket';
import { useGameData } from '../../hooks/useGameData';

export const BodyContainer: FC = () => {
  const [awaitPlayersMsg, setAwaitPlayersMsg] = useState<string | undefined>(
    undefined
  );
  const { socket, joinedRoom } = useSocket();
  const { userList, gameState } = useGameData();

  useEffect(() => {
    if (!socket) return;

    socket.on(
      'await more players response',
      ({ message }: { message: string }) => {
        setAwaitPlayersMsg(message);
      }
    );

    return () => {
      socket.off('await more players response');
    };
  }, []);

  return (
    <>
      {/* TODO: Separate into a userList component! */}
      <p>Habitación: {joinedRoom}</p>
      <div className='mt-4'>
        Jugadores:
        <ul>
          {gameState.started && gameState.drawer && gameState.totalScores
            ? Object.entries(gameState.totalScores)
                .sort(([, a], [, b]) => b.value - a.value)
                .map(([key, val]) => {
                  return (
                    <li key={key}>
                      {val.name} - Ronda:{val.value} / Total:
                      {!gameState.turnScores
                        ? 0
                        : gameState.turnScores[key]?.value ?? 0}
                    </li>
                  );
                })
            : userList.map((user) => <li key={user.id}>{user.name}</li>)}
        </ul>
      </div>
      {awaitPlayersMsg && !gameState.started && (
        <div className='my-4 text-xl font-bold'>{awaitPlayersMsg}</div>
      )}
      <ConnectionManager />
      <Board />
    </>
  );
};
