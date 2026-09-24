import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setupGlobalAlerts } from './utils/toast'

// Initialize creative SweetAlert2 toasts for all global alert notifications
setupGlobalAlerts()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
