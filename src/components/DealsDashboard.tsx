'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDealRoom } from '@/hooks/useDealRoom';
import { Deal } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

const stageColors: Record<Deal['stage'], { badge: string; border: string; bg: string }> = {
  discovery: {
    badge: 'bg-slate-700/60 text-slate-300 border-slate-600',
    border: 'border-slate-800',
    bg: 'bg-slate-900/60',
  },
  qualification: {
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    border: 'border-blue-900/30',
    bg: 'bg-slate-900/60',
  },
  proposal: {
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    border: 'border-indigo-900/30',
    bg: 'bg-slate-900/60',
  },
  negotiation: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    border: 'border-amber-900/30',
    bg: 'bg-slate-900/60',
  },
  'closed-won': {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-900/30',
    bg: 'bg-slate-900/60',
  },
  'closed-lost': {
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    border: 'border-rose-900/30',
    bg: 'bg-slate-900/60',
  },
};

const stageOrder: Deal['stage'][] = [
  'discovery',
  'qualification',
  'proposal',
  'negotiation',
  'closed-won',
  'closed-lost',
];

export function DealsDashboard() {
  const { deals, createDeal, updateDeal, stats } = useDealRoom();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [targetStage, setTargetStage] = useState<Deal['stage']>('discovery');

  // New deal form state
  const [dealForm, setDealForm] = useState({
    name: '',
    company: '',
    value: 50000,
    stage: 'discovery' as Deal['stage'],
    probability: 20,
    owner: 'Alex Morgan',
  });

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [deals, searchQuery, stageFilter]);

  const handleOpenCreateModal = (stage: Deal['stage'] = 'discovery') => {
    setTargetStage(stage);
    const defaultProb =
      stage === 'discovery' ? 20 :
      stage === 'qualification' ? 40 :
      stage === 'proposal' ? 60 :
      stage === 'negotiation' ? 80 :
      stage === 'closed-won' ? 100 : 0;
    setDealForm({
      name: '',
      company: '',
      value: 65000,
      stage,
      probability: defaultProb,
      owner: 'Alex Morgan',
    });
    setShowModal(true);
  };

  const handleCreateDealSubmit = (e: React.FormEvent) => {
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

  const handleQuickAdvance = (deal: Deal, newStage: Deal['stage'], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const probabilityMap: Record<Deal['stage'], number> = {
      discovery: 20,
      qualification: 40,
      proposal: 60,
      negotiation: 80,
      'closed-won': 100,
      'closed-lost': 0,
    };
    updateDeal({
      ...deal,
      stage: newStage,
      probability: probabilityMap[newStage] ?? deal.probability,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">Deal Pipeline</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Live Board
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous Deal Desk monitoring {deals.length} active opportunities · Total value{' '}
              <span className="text-white font-medium">
                {formatCurrency(deals.reduce((acc, d) => acc + d.value, 0))}
              </span>{' '}
              · Weighted{' '}
              <span className="text-blue-400 font-semibold">
                ${(stats.weightedPipeline / 1000).toFixed(1)}k
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals, company..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Stage filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              {stageOrder.map((s) => (
                <option key={s} value={s}>
                  {s.replace('-', ' ')}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleOpenCreateModal('discovery')}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span className="text-sm leading-none">+</span>
              <span>New Deal</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="px-8 py-2.5 bg-slate-900/40 border-t border-slate-800/60 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Total Pipeline:</span>{' '}
            <span className="font-semibold text-white">
              {formatCurrency(deals.reduce((sum, d) => sum + d.value, 0))}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Weighted:</span>{' '}
            <span className="font-semibold text-blue-400">
              {formatCurrency(stats.weightedPipeline)}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Active Deals:</span>{' '}
            <span className="font-semibold text-white">{stats.totalDeals}</span>
          </div>
          <div>
            <span className="text-slate-400">Win Rate:</span>{' '}
            <span className="font-semibold text-emerald-400">{stats.winRate.toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-slate-400">Avg Confidence:</span>{' '}
            <span className="font-semibold text-purple-400">{stats.avgConfidence.toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-slate-400">Avg Deal Size:</span>{' '}
            <span className="font-semibold text-white">{formatCurrency(stats.avgDealSize)}</span>
          </div>
        </div>
      </header>

      {/* Pipeline Kanban Board */}
      <div className="p-8 flex-1 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-[1200px]">
          {stageOrder.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage);
            const stageTotalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            const stageWeightedValue = stageDeals.reduce(
              (sum, d) => sum + (d.value * d.probability) / 100,
              0
            );
            const colors = stageColors[stage];

            return (
              <div
                key={stage}
                className="bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-col min-h-[640px] shadow-sm backdrop-blur-sm"
              >
                {/* Stage Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-100 capitalize">
                        {stage.replace('-', ' ')}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${colors.badge}`}
                      >
                        {stageDeals.length}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {formatCurrency(stageTotalValue)}{' '}
                      <span className="text-slate-400">
                        ({(stageWeightedValue / 1000).toFixed(0)}k wtd)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenCreateModal(stage)}
                    title={`Add deal to ${stage}`}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-semibold"
                  >
                    +
                  </button>
                </div>

                {/* Deal Cards Container */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                  {stageDeals.length === 0 ? (
                    <div className="h-44 border-2 border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-center p-4">
                      <span className="text-2xl mb-1 opacity-40">📭</span>
                      <p className="text-xs text-slate-400">No deals in this stage</p>
                      <button
                        onClick={() => handleOpenCreateModal(stage)}
                        className="mt-2 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        + Create one
                      </button>
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onQuickAdvance={handleQuickAdvance}
                      />
                    ))
                  )}
                </div>

                {/* Column Footer */}
                <div className="p-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenCreateModal(stage)}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-dashed border-slate-800"
                  >
                    <span>+</span> Add Deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>💼</span> Create New Deal
                </h3>
                <p className="text-xs text-slate-400">
                  Add an opportunity to your AI Deal Desk
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit} className="p-6 space-y-4">
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
                  <label className="label">Initial Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, stage: e.target.value as Deal['stage'] })
                    }
                    className="input"
                  >
                    {stageOrder.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Deal Owner</label>
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

function DealCard({
  deal,
  onQuickAdvance,
}: {
  deal: Deal;
  onQuickAdvance: (deal: Deal, stage: Deal['stage'], e: React.MouseEvent) => void;
}) {
  const topConcern = deal.stakeholders.find(
    (s) => s.sentiment === 'negative' && (s.influence === 'high' || s.influence === 'decision-maker')
  );
  const hasCompetitor = deal.competitorMentions && deal.competitorMentions.length > 0;
  const unresolvedObjections = deal.objections
    ? deal.objections.filter((o) => o.outcome === 'unresolved').length
    : 0;

  const confidenceScore = deal.insights?.confidenceScore ?? 50;
  const confidenceColor =
    confidenceScore >= 70
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : confidenceScore >= 45
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

  const nextStageIndex = stageOrder.indexOf(deal.stage) + 1;
  const canAdvance = nextStageIndex < stageOrder.length - 1; // don't auto-advance directly to lost

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="group block p-3.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 hover:border-blue-500/60 shadow-sm transition-all duration-150 hover:-translate-y-0.5"
    >
      {/* Title & Alerts */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {deal.name}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-1">{deal.company}</p>
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-1 shrink-0">
          {hasCompetitor && (
            <span
              className="text-xs p-0.5 rounded bg-amber-500/20 text-amber-300"
              title="Competitor threat mentioned"
            >
              ⚔️
            </span>
          )}
          {topConcern && (
            <span
              className="text-xs p-0.5 rounded bg-rose-500/20 text-rose-300"
              title="High-risk stakeholder"
            >
              ⚠️
            </span>
          )}
          {unresolvedObjections > 0 && (
            <span
              className="text-xs p-0.5 rounded bg-purple-500/20 text-purple-300"
              title={`${unresolvedObjections} unresolved objections`}
            >
              📋
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center justify-between text-xs mb-2.5">
        <div>
          <span className="text-base font-bold text-white tracking-tight">
            {formatCurrency(deal.value)}
          </span>
          <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
            ({deal.probability}%)
          </span>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${confidenceColor}`}>
          {confidenceScore}% AI score
        </span>
      </div>

      {/* Stakeholders Avatars */}
      {deal.stakeholders && deal.stakeholders.length > 0 && (
        <div className="flex items-center gap-1 mb-2.5 flex-wrap">
          {deal.stakeholders.slice(0, 3).map((s) => {
            const sentimentBg =
              s.sentiment === 'positive'
                ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
                : s.sentiment === 'negative'
                ? 'bg-rose-900/60 text-rose-300 border-rose-700/50'
                : 'bg-slate-700 text-slate-300 border-slate-600';
            return (
              <span
                key={s.id}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sentimentBg}`}
                title={`${s.name} (${s.role}) - ${s.influence} influence`}
              >
                {s.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            );
          })}
          {deal.stakeholders.length > 3 && (
            <span className="text-[10px] text-slate-400 px-1 font-medium">
              +{deal.stakeholders.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Dates and Next Steps */}
      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Close: {formatDate(deal.expectedCloseDate)}</span>
        {deal.calls && deal.calls.length > 0 ? (
          <span className="text-blue-400 font-medium">
            📞 {deal.calls.length} call{deal.calls.length > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-slate-400">0 calls</span>
        )}
      </div>

      {/* Quick Advance Button on hover */}
      {canAdvance && (
        <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Owner: {deal.owner}</span>
          <button
            onClick={(e) => onQuickAdvance(deal, stageOrder[nextStageIndex], e)}
            className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded transition-colors"
          >
            Advance to {stageOrder[nextStageIndex].replace('-', ' ')} →
          </button>
        </div>
      )}
    </Link>
  );
}
