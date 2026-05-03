import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const STATUS = {
  COMPLETE:     { cls: 'text-green-400 bg-green-500/10 border-green-500/20', icon: CheckCircle },
  SL_PLACED:    { cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: CheckCircle },
  TP_PLACED:    { cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: CheckCircle },
  PENDING:      { cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  PARTIAL_FILL: { cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: AlertCircle },
  FAILED:       { cls: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
};

export default function TradesTable({ trades }) {
  if (!trades?.length) return (
    <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
      <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
      <p className="text-slate-400">No trades yet.</p>
      <p className="text-slate-500 text-sm mt-1">Place a BUY order in Dhan to see it here.</p>
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="font-semibold">Recent Trades</h2>
        <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">{trades.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50">
            <tr>
              {['Symbol', 'Segment', 'Entry', 'Qty', 'SL', 'TP', 'Status', 'Time'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {trades.map(t => {
              const s = STATUS[t.status] || STATUS.PENDING;
              const Icon = s.icon;
              return (
                <tr key={t.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{t.symbol}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{t.exchangeSegment}</td>
                  <td className="px-4 py-3 tabular-nums">₹{parseFloat(t.entryPrice).toFixed(2)}</td>
                  <td className="px-4 py-3 tabular-nums">{t.quantity}</td>
                  <td className="px-4 py-3 tabular-nums text-red-400">
                    {t.slPrice ? `₹${parseFloat(t.slPrice).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-green-400">
                    {t.tpPrice ? `₹${parseFloat(t.tpPrice).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${s.cls}`}>
                      <Icon className="w-3 h-3" />{t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
