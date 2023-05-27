import { FC, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { useSocket } from '../../hooks/useSocket';
import { Chat } from '../Chat';
import { useModal } from '../../hooks/useModal';
import { useGameData } from '../../hooks/useGameData';
import type { GameStateI, UserRoomI } from '../../interfaces';

interface LinesI {
  tool: string;
  points: any[];
}

const MAX_POINTS_IN_SINGLE_ARRAY = 2500;

export const Board: FC = () => {
  const [tool, setTool] = useState('pen');
  const [lines, setLines] = useState<LinesI[]>([]);
  const [possibleCategories, setPossibleCategories] = useState<string[]>([]);
  const [possibleTurnDuration, setPosibleTurnDuration] = useState<
    Record<string, number>
  >({});
  const isDrawing = useRef(false);
  const { socket, joinedRoom } = useSocket();
  const {
    RenderModal: ModalOwnerCategories,
    closeModal: closeModalOwner,
    openModal: openModalOwner,
  } = useModal();
  const {
    RenderModal: SelectWordsModal,
    closeModal: closeWordsModal,
    openModal: openWordsModal,
    setContent: setWordsContent,
  } = useModal();
  const {
    gameState,
    userList,
    categorySelected,
    turnDuration,
    setUserList,
    setCategorySelected,
    setGameState,
    setTurnDuration,
  } = useGameData();

  console.log('gameState', gameState);
  console.log('userList', userList);

  useEffect(() => {
    if (!socket) return;

    socket.on('new segment', (lineNumber: number, lineSegment: LinesI) => {
      setLines((lines) => {
        const updatedLines = [...lines];
        if (updatedLines[lineNumber]) {
          updatedLines[lineNumber].points = lineSegment.points;
        } else {
          updatedLines.push({
            tool: lineSegment.tool,
            points: lineSegment.points,
          });
        }
        return updatedLines;
      });
    });

    socket.on('clear board', () => {
      setLines([]);
    });

    socket.on(
      'pre game owner',
      ({
        categories,
        possibleTurnDurations,
      }: {
        categories: string[];
        possibleTurnDurations: Record<string, number>;
        userList: UserRoomI[];
      }) => {
        setPossibleCategories(categories);
        setPosibleTurnDuration(possibleTurnDurations);
        openModalOwner();
      }
    );

    socket.on('update user list', ({ newUsers }: { newUsers: UserRoomI[] }) => {
      setUserList(newUsers);
    });

    socket.on(
      'game initialized',
      ({ gameState }: { gameState: GameStateI }) => {
        setGameState(gameState);
      }
    );

    socket.on(
      'pre turn drawer',
      ({ possibleWords }: { possibleWords: string[] }) => {
        console.log('possibleWords', possibleWords);
        const wordsContent = (
          <div>
            Selecciona una palabra:{' '}
            <div className='flex gap-2'>
              {possibleWords.map((word) => (
                <p
                  key={word}
                  className={`border-teal-600 border-2 cursor-pointer px-2 py-1 hover:bg-teal-200`}
                  // TODO: send the selected word and pass to all users
                  // al drawer enviarsela sin encriptar, al resto encriptada
                  // use the closeWordModal
                  onClick={() => console.log('selected word', word)}
                >
                  {word}
                </p>
              ))}
            </div>
          </div>
        );
        setWordsContent(wordsContent);
        openWordsModal();
      }
    );

    socket.on('pre turn no drawer', ({ message }: { message: string }) => {
      // TODO: Print the message somewhere in the UI for the no drawers
      console.log('message no drawer', message);
    });

    // TODO: when turn finish, clean
    return () => {
      socket.off('new segment');
      socket.off('clear board');
      socket.off('pre game owner');
      socket.off('update user list');
      socket.off('game initialized');
      socket.off('pre turn drawer');
      socket.off('pre turn no drawer');
    };
  }, []);

  const handleTurnDuration = (turnDuration: number) => {
    setTurnDuration(turnDuration / 1000); // parsing it to seconds
    socket?.emit('set turn duration', { turnDuration, roomNumber: joinedRoom });
  };

  const handleCategoryChoice = (category: string) => {
    setCategorySelected(category);
    socket?.emit('set room category', { category, roomNumber: joinedRoom });
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!e.target) {
      return;
    }

    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // no drawing - skipping
    if (!e.target || !isDrawing.current) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    const newLines = [...lines];
    const lastLine = newLines[newLines.length - 1];

    // If lastLine has reached the limit, start a new line
    if (lastLine.points.length >= MAX_POINTS_IN_SINGLE_ARRAY) {
      const newLine = {
        ...lastLine,
        // Add the last point of the old line as the first point of the new line to avoid a gap
        points: [...lastLine.points.slice(-2), point.x, point.y],
      };
      newLines.push(newLine);
      socket?.emit('new segment', {
        lineLength: newLines.length - 1,
        lineSegment: newLine,
        roomNumber: joinedRoom,
      });
    } else {
      // add point to the existing line
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      // replace the last line in newLines with the updated lastLine
      newLines[newLines.length - 1] = lastLine;
      socket?.emit('new segment', {
        lineLength: newLines.length - 1,
        lineSegment: lastLine,
        roomNumber: joinedRoom,
      });
    }

    setLines(newLines);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearBoard = () => {
    setLines([]);
    socket?.emit('clear board', { roomNumber: joinedRoom });
  };

  const handleStartGame = () => {
    console.log('categorySelected', categorySelected);
    if (!categorySelected || userList.length < 3) return; // TODO: Use a toast to provide feedback

    socket?.emit('init game', { roomNumber: joinedRoom });
    closeModalOwner();
  };

  const handleAwaitMorePlayers = () => {
    socket?.emit('await more players', { roomNumber: joinedRoom });
    closeModalOwner();
  };

  return (
    <>
      <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value='pen'>Pen</option>
        <option value='eraser'>Eraser</option>
      </select>
      <button type='button' onClick={clearBoard}>
        Clear board
      </button>
      <div className='py-5 bg-gray-300'>
        <div className='mx-auto flex gap-5 w-[1100px] h-[600px]'>
          <Stage
            width={770}
            height={600}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            className='bg-white rounded-lg shadow-md'
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke='#df4b26'
                  strokeWidth={5}
                  tension={0.5}
                  lineCap='round'
                  lineJoin='round'
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
            </Layer>
          </Stage>
          <div className='w-[278px] h-full bg-white rounded-lg shadow-md'>
            <Chat joinedRoom={joinedRoom} />
          </div>
        </div>
      </div>
      {!gameState.started && (
        <ModalOwnerCategories forbidClose>
          <>
            <h1 className='text-xl font-bold text-center text-teal-800'>
              Wanna start the game?
            </h1>
            <div className='my-4'>
              <h3 className='text-lg'>Selecciona una categoría!</h3>
              <div className='flex gap-2'>
                {possibleCategories.map((cat) => (
                  <p
                    key={cat}
                    className={`border-teal-600 border-2 cursor-pointer px-2 py-1 ${
                      categorySelected === cat && 'bg-teal-200'
                    }`}
                    onClick={() => handleCategoryChoice(cat)}
                  >
                    {cat}
                  </p>
                ))}
              </div>
            </div>
            <div className='my-4'>
              <h3 className='text-lg'>
                Elige cuantos segundos tendreis por turno! (120s por defecto)
              </h3>
              <div className='flex gap-2'>
                {Object.entries(possibleTurnDuration).map(([key, value]) => (
                  <p
                    key={key}
                    className={`border-teal-600 border-2 cursor-pointer px-2 py-1 ${
                      turnDuration === value / 1000 && 'bg-teal-200'
                    }`}
                    onClick={() => handleTurnDuration(value)}
                  >
                    {value / 1000}s
                  </p>
                ))}
              </div>
            </div>
            <div className='my-4'>
              <h3 className='text-lg'>Connected users:</h3>
              <ul>
                {userList.map((user) => (
                  <li key={user.id}>{user.name}</li>
                ))}
              </ul>
            </div>
            <div className='flex items-center justify-between'>
              <button onClick={handleAwaitMorePlayers}>
                Wait for more players
              </button>
              <button onClick={handleStartGame}>Start the game</button>
            </div>
          </>
        </ModalOwnerCategories>
      )}
      {gameState.started && gameState.preTurn && (
        <SelectWordsModal forbidClose />
      )}
    </>
  );
};
