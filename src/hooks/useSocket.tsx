import { FC, createContext, useContext, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

interface SocketContextI {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  setSocket: React.Dispatch<
    React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap> | null>
  >;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  joinedRoom: number | undefined;
  setJoinedRoom: React.Dispatch<React.SetStateAction<number | undefined>>;
}

interface PropsI {
  children: JSX.Element;
}

const SocketContext = createContext<SocketContextI | undefined>(undefined);

export const SocketProvider: FC<PropsI> = ({ children }) => {
  const [username, setUsername] = useState('');
  const [joinedRoom, setJoinedRoom] = useState<number | undefined>(undefined);
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);

  return (
    <SocketContext.Provider
      value={{
        socket,
        setSocket,
        username,
        setUsername,
        joinedRoom,
        setJoinedRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
