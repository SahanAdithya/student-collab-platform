import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "@asgardeo/auth-react"
import App from './App.tsx'
import './index.css'

const config = {
    signInRedirectURL: import.meta.env.VITE_ASGARDEO_SIGN_IN_REDIRECT_URL || "http://localhost:5174",
    signOutRedirectURL: import.meta.env.VITE_ASGARDEO_SIGN_OUT_REDIRECT_URL || "http://localhost:5174",
    clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID || "replace_me",
    baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL || "https://api.asgardeo.io/t/your_org",
    scope: [ "openid", "profile" ]
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider config={ config }>
      <App />
    </AuthProvider>
  </StrictMode>,
)
