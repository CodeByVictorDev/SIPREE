import React from 'react';

/**
 * StatCard — Tarjeta KPI para el dashboard.
 * Muestra un número principal, título, subtítulo e ícono.
 */
export default function StatCard({ title, value, subtitle, icon: Icon, color = '#3b82f6', trend }) {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className="stat-card-info">
                    <span className="stat-card-title">{title}</span>
                    <span className="stat-card-value" style={{ color }}>{value}</span>
                    {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
                </div>
                <div className="stat-card-icon" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    {Icon && <Icon size={24} color={color} />}
                </div>
            </div>
            {trend !== undefined && (
                <div className="stat-card-trend" style={{ color: trend >= 0 ? '#10b981' : '#ef4444' }}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs semana anterior
                </div>
            )}
        </div>
    );
}
