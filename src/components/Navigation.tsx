'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDealRoom } from '@/hooks/useDealRoom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊', description: 'Pipeline Overview' },
  { name: 'Deals', href: '/deals', icon: '💼', description: 'All Deals & Kanban' },
  { name: 'Briefings', href: '/briefings', icon: '📋', description: 'Pre-Call Intelligence' },
  { name: 'Playbook', href: '/playbook', icon: '📚', description: 'Objection Framework' },
  { name: 'Insights', href: '/insights', icon: '🧠', description: 'Analytics & Patterns' },
];

export function Navigation() {
  const pathname = usePathname();
  const { stats } = useDealRoom();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-lg">🤝</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-tight">DealRoom</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI Desk
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Autonomous Sales Agent</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          {navigation.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-900/20'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-base transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  <div>
                    <div className="leading-tight">{item.name}</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-300 font-normal">
                      {item.description}
                    </div>
                  </div>
                </div>
                {item.name === 'Deals' && stats.totalDeals > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                  }`}>
                    {stats.totalDeals}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Panel */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
          Pipeline Health
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-800">
            <p className="text-lg font-bold text-white tracking-tight">
              ${(stats.weightedPipeline / 1000).toFixed(0)}k
            </p>
            <p className="text-[11px] text-slate-400 truncate">Weighted Pipeln</p>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-800">
            <p className="text-lg font-bold text-emerald-400 tracking-tight">
              {stats.winRate.toFixed(0)}%
            </p>
            <p className="text-[11px] text-slate-400">Win Rate</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs px-1 text-slate-400">
          <span>Avg Deal: <span className="text-slate-300 font-medium">${(stats.avgDealSize / 1000).toFixed(0)}k</span></span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400">AI Active</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
