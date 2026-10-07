import { RouterProvider } from 'react-router-dom';
import { DialogProvider, UserProvider } from '@/providers';
import { router } from './router';

export function App() {
  return (
    <UserProvider>
      <DialogProvider>
        <RouterProvider router={router} />
      </DialogProvider>
    </UserProvider>
  );
}
