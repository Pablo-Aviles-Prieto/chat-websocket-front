import { FC } from 'react';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { useSocket } from '../hooks/useSocket';
import { Socket, io } from 'socket.io-client';

interface PropsI {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setIsRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  setSocket: React.Dispatch<
    React.SetStateAction<Socket<DefaultEventsMap, DefaultEventsMap> | null>
  >;
}

export const RegisterForm: FC<PropsI> = ({
  username,
  setUsername,
  setIsRegistered,
  setSocket,
}) => {
  const { socket } = useSocket();

  const registerUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) {
      const newSocket = io('http://localhost:4000');
      newSocket.emit('register', username);
      setSocket(newSocket);
    }

    if (socket && !socket?.connected) {
      socket.connect();
    }

    socket?.emit('register', username);
    setIsRegistered(true);
  };

  return (
    <form className='w-full max-w-sm' onSubmit={registerUser}>
      <div className='flex items-center py-2 border-b border-teal-500'>
        <input
          className='w-full px-2 py-1 mr-3 leading-tight text-gray-700 bg-transparent border-none appearance-none focus:outline-none'
          type='text'
          id='username'
          name='username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Enter a user name'
          aria-label='User name'
        />
        <button
          className='flex-shrink-0 px-2 py-1 text-sm text-white bg-teal-500 border-4 border-teal-500 rounded hover:bg-teal-700 hover:border-teal-700'
          type='submit'
        >
          Join
        </button>
      </div>
    </form>
  );
};