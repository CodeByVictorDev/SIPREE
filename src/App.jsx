import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuPrincipal from './pages/MenuPrincipal';
import Login from './pages/Login';
import Inventario from './pages/Inventario';
import Prestamos from './pages/Prestamos';
import Admin from './pages/Admin';
import Usuario from './pages/Usuario';
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MenuPrincipal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/prestamos" element={<Prestamos />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/usuario" element={<Usuario />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;
