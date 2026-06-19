import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'

axios.defaults.baseURL = 'https://smart-attendance-api-0via.onrender.com'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
