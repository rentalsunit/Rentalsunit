import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: trend === 'up' ? 'var(--success)' : 'var(--danger)' }}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trendValue}%
          </div>
        )}
      </div>
      
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>{title}</p>
        <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '4px' }}>{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
