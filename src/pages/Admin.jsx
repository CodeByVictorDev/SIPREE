// Admin.jsx — Redirige al Dashboard. El panel de admin ahora usa Dashboard.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
export default function Admin() { return <Navigate to="/admin" replace />; }
