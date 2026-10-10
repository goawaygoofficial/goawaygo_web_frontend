import { RouterProvider } from 'react-router-dom';
import { DialogProvider, UserProvider } from '@/providers';
import { router } from './router';
import { SessionGate } from './SessionGate';

export function App() {
  return (
    <UserProvider>
      <DialogProvider>
        <SessionGate>
          <RouterProvider router={router} />
        </SessionGate>
      </DialogProvider>
    </UserProvider>
  );
}
