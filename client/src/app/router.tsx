/**
 * Application router
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ConnectPage } from '@/pages/ConnectPage';
import { ChatPage } from '@/pages/ChatPage';
import { ROUTES } from '@/shared/config/constants';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.CONNECT} replace />,
  },
  {
    path: ROUTES.CONNECT,
    element: <ConnectPage />,
  },
  {
    path: ROUTES.CHAT,
    element: <ChatPage />,
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.CONNECT} replace />,
  },
]);
