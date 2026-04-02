import React from 'react'
import ReactDOM from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import App from './App.jsx'

// Expose createClient so App.jsx lazy getter works without a static import
window.__supabaseCreateClient = createClient

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
