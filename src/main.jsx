// Archivo principal (punto de entrada de React)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// Aquí importamos el CSS global que ya tenías
import '../Style.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
