import React from 'react'
import ReactDOM from 'react-dom/client'
import { FormBuilder } from './editor/FormBuilder'
import './styles/index.css'

function StudioApp() {
  return <FormBuilder />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StudioApp />
  </React.StrictMode>
)
