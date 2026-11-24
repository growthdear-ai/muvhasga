'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDealRoom } from '@/hooks/useDealRoom';
import { Deal } from '@/types';
import { formatDate, formatCurrency, getStageColor } from '@/lib/utils';
import { DealsDashboard } from '@/components/DealsDashboard';

export default function DealsListPage() {
  const { deals, createDeal, removeDeal, stats } = useDealRoom();
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'value' | 'confidence' | 'date' | 'name'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);

  const [dealForm, setDealForm] = useState({
    name: '',
    company: '',
    value: 75000,
    stage: 'discovery' as Deal['stage'],
    probability: 25,
    owner: 'Alex Morgan',
  });

  const filteredDeals = useMemo(() => {
    return deals
      .filter((deal) => {
        const matchesQuery =
          deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.owner.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
        return matchesQuery && matchesStage;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'value') comp = a.value - b.value;
        else if (sortBy === 'confidence') comp = a.insights.confidenceScore - b.insights.confidenceScore;
        else if (sortBy === 'name') comp = a.name.localeCompare(b.name);
        else if (sortBy === 'date') comp = new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime();
        return sortOrder === 'desc' ? -comp : comp;
      });
  }, [deals, searchQuery, stageFilter, sortBy, sortOrder]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.name || !dealForm.company) return;

    createDeal({
      name: dealForm.name,
      company: dealForm.company,
      value: Number(dealForm.value),
      stage: dealForm.stage,
      probability: Number(dealForm.probability),
      owner: dealForm.owner,
      expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      currency: 'USD',
    });

    setShowModal(false);
  };

  if (viewMode === 'board') {
    return (
      <div>
        <div className="px-8 pt-4 pb-0 flex items-center justify-between bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Pipeline Board</h2>
            <button
              onClick={() => setViewMode('table')}
              className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              Switch to Table View
            </button>
          </div>
        </div>
        <DealsDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">All Deals</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {filteredDeals.length} deals
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage your opportunities, inspect stakeholder maps, and trigger AI pre-call briefings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('board')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          >
            <span>📋</span> Kanban Board
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>+</span> Add Opportunity
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Total Pipeline</p>
          <p className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(deals.reduce((sum, d) => sum + d.value, 0))}
          </p>
          <p className="text-xs text-slate-400 mt-1">{deals.length} active opportunities</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Weighted Pipeline</p>
          <p className="text-2xl font-bold text-blue-400 tracking-tight">
            {formatCurrency(stats.weightedPipeline)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Factored by stage probability</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Avg Confidence Score</p>
          <p className="text-2xl font-bold text-purple-400 tracking-tight">
            {stats.avgConfidence.toFixed(0)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Calculated by AI Agent</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">
            {stats.winRate.toFixed(0)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Closed won vs total concluded</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by deal, account name, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            <option value="discovery">Discovery</option>
            <option value="qualification">Qualification</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed-won">Closed Won</option>
            <option value="closed-lost">Closed Lost</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="value">Deal Value</option>
            <option value="confidence">AI Confidence</option>
            <option value="date">Expected Close</option>
            <option value="name">Deal Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
            title="Toggle sort direction"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Opportunity</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Value</th>
                <th className="py-3.5 px-4">Weighted</th>
                <th className="py-3.5 px-4">AI Score</th>
                <th className="py-3.5 px-4">Stakeholders</th>
                <th className="py-3.5 px-4">Expected Close</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No deals match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => {
                  const conf = deal.insights.confidenceScore;
                  const confBadge =
                    conf >= 70
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : conf >= 45
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

                  return (
                    <tr
                      key={deal.id}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <Link href={`/deals/${deal.id}`} className="block">
                          <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {deal.name}
                          </span>
                          <span className="block text-xs text-slate-400">{deal.company} · {deal.owner}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStageColor(deal.stage)}`}>
                          {deal.stage.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {formatCurrency(deal.value)}
                      </td>
                      <td className="py-4 px-4 text-blue-400 font-medium">
                        {formatCurrency((deal.value * deal.probability) / 100)}
                        <span className="text-xs text-slate-400 ml-1">({deal.probability}%)</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${confBadge}`}>
                          {conf}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {deal.stakeholders.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-200"
                              title={`${s.name} (${s.role})`}
                            >
                              {s.name[0]}
                            </span>
                          ))}
                          {deal.stakeholders.length > 3 && (
                            <span className="text-xs text-slate-400 font-medium">
                              +{deal.stakeholders.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-300">
                        {formatDate(deal.expectedCloseDate)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="px-3 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-xs font-medium transition-colors"
                          >
                            Open Desk
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete ${deal.name}?`)) {
                                removeDeal(deal.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Deal"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💼</span> Create New Deal
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Deal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp Enterprise Platform"
                  value={dealForm.name}
                  onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Company / Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={dealForm.company}
                  onChange={(e) => setDealForm({ ...dealForm, company: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Value ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={dealForm.value}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, value: parseFloat(e.target.value) || 0 })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.probability}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, probability: parseInt(e.target.value) || 0 })
                    }
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, stage: e.target.value as Deal['stage'] })
                    }
                    className="input"
                  >
                    <option value="discovery">Discovery</option>
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed-won">Closed Won</option>
                    <option value="closed-lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="label">Owner</label>
                  <input
                    type="text"
                    value={dealForm.owner}
                    onChange={(e) => setDealForm({ ...dealForm, owner: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

