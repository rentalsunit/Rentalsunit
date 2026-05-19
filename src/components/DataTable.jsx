import React from 'react';
import { MoreVertical, Filter, Download } from 'lucide-react';

const DataTable = ({ title, columns, data, onAdd }) => {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ backgroundColor: 'var(--glass)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <Filter size={16} /> Filter
          </button>
          <button style={{ backgroundColor: 'var(--glass)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <Download size={16} /> Export
          </button>
          <button 
            onClick={onAdd}
            style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '8px 16px', fontSize: '14px', fontWeight: '600' }}
          >
            + Add New
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map((col, idx) => (
                <th key={idx} style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {col.header}
                </th>
              ))}
              <th style={{ padding: '16px 24px' }}></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx} style={{ padding: '16px 24px', fontSize: '14px' }}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button style={{ background: 'none', color: 'var(--text-muted)' }}><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
