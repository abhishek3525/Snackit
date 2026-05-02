import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './context/AppContext.tsx'
import 'leaflet/dist/leaflet.css';
import { SocketProvider } from './context/SocketContext.tsx'

export const authService='https://snackit-auth.onrender.com';
export const restaurantService='https://restaurant-service-fng3.onrender.com';
export const utilsService='https://snackit-utils.onrender.com';
export const realtimeService='https://realtime-service-qpkd.onrender.com';
export const riderService='https://rider-service-6wb8.onrender.com';
export const adminService='https://snackit-admin.onrender.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="228180822197-fl1r4lbguub7g3l3fsfdjp07tk7niho5.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
