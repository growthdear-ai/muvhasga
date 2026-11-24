'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDealRoom } from '@/hooks/useDealRoom';
import { Deal, Call, Stakeholder, Objection, CompetitorMention, PricingDiscussion, Briefing } from '@/types';
import { formatDate, formatDateTime, formatCurrency, getStageColor, getSentimentColor } from '@/lib/utils';

export default function DealDetailPage({ params }: { params: any }) {
  const {
    deals,
    selectedDeal,
    briefing,
    generateBriefingForDeal,
    addCall,
    updateDeal,
    updateStakeholder,
    addStakeholder,
  } = useDealRoom();

  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'stakeholders' | 'objections' | 'competitors' | 'pricing' | 'briefing'>('overview');
  const [showCallModal, setShowCallModal] = useState(false);
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [dealId, setDealId] = useState<string>('');
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      if (resolvedParams?.id) {
        setDealId(resolvedParams.id);
        const foundDeal = deals.find((d) => d.id === resolvedParams.id) || selectedDeal;
        setDeal(foundDeal || null);
      }
    });
  }, [params, deals, selectedDeal]);

  if (!deal) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
          <span className="text-4xl mb-3 block">🔍</span>
          <h2 className="text-2xl font-bold text-white mb-2">Deal not found</h2>
          <p className="text-slate-400 text-sm mb-6">
            The deal you are looking for does not exist or has been removed.
          </p>
          <Link href="/deals" className="btn-primary">
            Back to Deals Pipeline
          </Link>
        </div>
      </div>
    );
  }

  const handleAddCall = (callData: Partial<Call> & { transcript?: string }) => {
    addCall(deal.id, callData);
    setShowCallModal(false);
  };

  const handleUpdateStakeholder = (stakeholder: Stakeholder) => {
    updateStakeholder(deal.id, stakeholder);
    setShowStakeholderModal(false);
    setEditingStakeholder(null);
  };

  const handleAddStakeholder = (stakeholder: Omit<Stakeholder, 'id'>) => {
    addStakeholder(deal.id, stakeholder);
    setShowStakeholderModal(false);
  };

  const confidenceScore = deal.insights?.confidenceScore ?? 50;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="px-8 py-4">
          {/* Breadcrumbs & Back */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/deals" className="hover:text-blue-400 transition-colors">
              ← Deals Pipeline
            </Link>
            <span>/</span>
            <span className="text-slate-200">{deal.company}</span>
            <span>/</span>
            <span className="text-white font-medium">{deal.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">{deal.name}</h1>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                  {deal.stage.replace('-', ' ')}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {confidenceScore}% AI Confidence
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {deal.company} · Owned by <span className="text-slate-300 font-medium">{deal.owner}</span>
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(deal.value)}</p>
                <p className="text-xs text-slate-400">{deal.probability}% win probability</p>
              </div>
              <div className="text-right pl-4 border-l border-slate-800">
                <p className="text-lg font-bold text-blue-400">
                  {formatCurrency((deal.value * deal.probability) / 100)}
                </p>
                <p className="text-xs text-slate-400">Weighted Pipeline</p>
              </div>
              <div className="text-right pl-4 border-l border-slate-800">
                <p className="text-sm font-semibold text-slate-200">
                  {formatDate(deal.expectedCloseDate)}
                </p>
                <p className="text-xs text-slate-400">Expected Close</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto border-t border-slate-800/80 pt-3">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'calls', label: `Calls (${deal.calls?.length || 0})`, icon: '📞' },
              { id: 'stakeholders', label: `Stakeholders (${deal.stakeholders?.length || 0})`, icon: '👥' },
              { id: 'objections', label: `Objections (${deal.objections?.length || 0})`, icon: '📋' },
              { id: 'competitors', label: `Competitors (${deal.competitorMentions?.length || 0})`, icon: '⚔️' },
              { id: 'pricing', label: `Pricing (${deal.pricingDiscussions?.length || 0})`, icon: '💰' },
              { id: 'briefing', label: 'Pre-Call Briefing', icon: '⚡' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  if (tab.id === 'briefing' && !briefing) {
                    generateBriefingForDeal(deal.id, (deal.calls?.length || 0) + 1);
                  }
                }}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="p-8 flex-1 max-w-7xl w-full">
        {activeTab === 'overview' && <OverviewTab deal={deal} />}
        {activeTab === 'calls' && (
          <CallsTab
            deal={deal}
            onAddCall={handleAddCall}
            showModal={showCallModal}
            setShowModal={setShowCallModal}
          />
        )}
        {activeTab === 'stakeholders' && (
          <StakeholdersTab
            deal={deal}
            onUpdate={handleUpdateStakeholder}
            onAdd={handleAddStakeholder}
            showModal={showStakeholderModal}
            setShowModal={setShowStakeholderModal}
            editingStakeholder={editingStakeholder}
            setEditingStakeholder={setEditingStakeholder}
          />
        )}
        {activeTab === 'objections' && <ObjectionsTab deal={deal} />}
        {activeTab === 'competitors' && <CompetitorsTab deal={deal} />}
        {activeTab === 'pricing' && <PricingTab deal={deal} />}
        {activeTab === 'briefing' && <BriefingTab deal={deal} briefing={briefing} />}
      </main>
    </div>
  );
}

// ----------------------------------------------------
// Overview Tab
// ----------------------------------------------------
function OverviewTab({ deal }: { deal: Deal }) {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Total Value</p>
          <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(deal.value)}</p>
          <p className="text-xs text-slate-400 mt-1">Contract face value</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Weighted Pipeline</p>
          <p className="text-2xl font-bold text-blue-400 tracking-tight">
            {formatCurrency((deal.value * deal.probability) / 100)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{deal.probability}% win chance</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase text-slate-400 font-semibold mb-1">AI Deal Health</p>
          <p className="text-2xl font-bold text-purple-400 tracking-tight">
            {deal.insights?.confidenceScore ?? 50}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Multi-factor intelligence</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Calls Logged</p>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">
            {deal.calls?.length || 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Interaction history</p>
        </div>
      </div>

      {/* AI Next Steps & Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/40 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span>⚡</span> AI Next Best Action
          </h3>
          <p className="text-blue-100 text-sm leading-relaxed">
            {deal.insights?.nextBestAction || 'Schedule follow-up call with key decision makers.'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span>🎯</span> Recommended Strategy
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {deal.insights?.recommendedApproach || 'Engage champion to resolve internal blockers and present customized ROI.'}
          </p>
        </div>

        {/* Risk Factors */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-rose-400">⚠️</span> Active Risk Factors ({deal.insights?.riskFactors?.length || 0})
          </h3>
          <div className="space-y-2">
            {deal.insights?.riskFactors && deal.insights.riskFactors.length > 0 ? (
              deal.insights.riskFactors.map((risk, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-200 text-xs">
                  <span className="mt-0.5">⚠</span>
                  <span>{risk}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No critical risk flags detected</p>
            )}
          </div>
        </div>

        {/* Buying Signals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-emerald-400">✅</span> Detected Buying Signals ({deal.insights?.buyingSignals?.length || 0})
          </h3>
          <div className="space-y-2">
            {deal.insights?.buyingSignals && deal.insights.buyingSignals.length > 0 ? (
              deal.insights.buyingSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-200 text-xs">
                  <span className="mt-0.5">✓</span>
                  <span>{signal}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No explicit buying signals recorded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Stakeholders Overview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span>👥</span> Stakeholder Map ({deal.stakeholders?.length || 0})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Influence</th>
                <th className="py-2.5 px-4">Sentiment</th>
                <th className="py-2.5 px-4">Last Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deal.stakeholders && deal.stakeholders.length > 0 ? (
                deal.stakeholders.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{s.role}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                        {s.influence}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${getSentimentColor(s.sentiment)} capitalize`}>
                        {s.sentiment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {formatDate(s.lastInteraction)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                    No stakeholders mapped yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Calls Tab
// ----------------------------------------------------
function CallsTab({
  deal,
  onAddCall,
  showModal,
  setShowModal,
}: {
  deal: Deal;
  onAddCall: (callData: Partial<Call> & { transcript?: string }) => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}) {
  const [callForm, setCallForm] = useState({
    date: new Date().toISOString().slice(0, 16),
    duration: 30,
    participants: [] as string[],
    summary: '',
    transcript: '',
    nextSteps: '',
    sentiment: 'neutral' as Call['sentiment'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCall({
      ...callForm,
      date: new Date(callForm.date),
      participants: callForm.participants,
      summary: callForm.summary || 'Follow-up discussion regarding scope and deployment requirements.',
      transcript: callForm.transcript,
      nextSteps: callForm.nextSteps || 'Send proposal and schedule review meeting.',
      sentiment: callForm.sentiment,
    });
    setCallForm({
      date: new Date().toISOString().slice(0, 16),
      duration: 30,
      participants: [],
      summary: '',
      transcript: '',
      nextSteps: '',
      sentiment: 'neutral',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Call Logs & Transcripts</h2>
          <p className="text-xs text-slate-400">Review meeting records and AI extracted insights</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Log Call
        </button>
      </div>

      {deal.calls && deal.calls.length > 0 ? (
        <div className="space-y-4">
          {deal.calls.slice().reverse().map((call, idx) => (
            <div key={call.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg">
                    📞
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Call #{deal.calls.length - idx} — {formatDate(call.date)}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Duration: {call.duration} mins · {call.participants?.length || 0} participant(s)
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getSentimentColor(call.sentiment)}`}>
                  {call.sentiment} sentiment
                </span>
              </div>

              <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800/80 mb-3 text-sm text-slate-300">
                <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1">Executive Summary</p>
                <p>{call.summary}</p>
              </div>

              {call.nextSteps && (
                <div className="text-xs text-slate-300 bg-blue-950/20 border border-blue-900/30 rounded-lg p-3">
                  <span className="font-semibold text-blue-400">Next Action:</span> {call.nextSteps}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-3xl mb-2 block">📞</span>
          <p className="text-slate-400 text-sm">No calls recorded for this deal yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            + Log your first call
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Log Call & Trigger AI Extraction</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={callForm.date}
                    onChange={(e) => setCallForm({ ...callForm, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Duration (min)</label>
                  <input
                    type="number"
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: parseInt(e.target.value) || 30 })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Sentiment</label>
                <select
                  value={callForm.sentiment}
                  onChange={(e) => setCallForm({ ...callForm, sentiment: e.target.value as Call['sentiment'] })}
                  className="input"
                >
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <div>
                <label className="label">Meeting Summary</label>
                <textarea
                  rows={3}
                  value={callForm.summary}
                  onChange={(e) => setCallForm({ ...callForm, summary: e.target.value })}
                  placeholder="Key topics discussed, client reactions, blockers..."
                  className="input"
                />
              </div>

              <div>
                <label className="label">Next Steps / Action Items</label>
                <input
                  type="text"
                  value={callForm.nextSteps}
                  onChange={(e) => setCallForm({ ...callForm, nextSteps: e.target.value })}
                  placeholder="e.g. Provide revised pricing, set technical demo"
                  className="input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Call Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Stakeholders Tab
// ----------------------------------------------------
function StakeholdersTab({
  deal,
  onUpdate,
  onAdd,
  showModal,
  setShowModal,
  editingStakeholder,
  setEditingStakeholder,
}: {
  deal: Deal;
  onUpdate: (s: Stakeholder) => void;
  onAdd: (s: Omit<Stakeholder, 'id'>) => void;
  showModal: boolean;
  setShowModal: (s: boolean) => void;
  editingStakeholder: Stakeholder | null;
  setEditingStakeholder: (s: Stakeholder | null) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    influence: 'medium' as Stakeholder['influence'],
    sentiment: 'neutral' as Stakeholder['sentiment'],
    concerns: '',
  });

  const handleOpenAdd = () => {
    setEditingStakeholder(null);
    setFormData({ name: '', role: '', email: '', influence: 'medium', sentiment: 'neutral', concerns: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (s: Stakeholder) => {
    setEditingStakeholder(s);
    setFormData({
      name: s.name,
      role: s.role,
      email: s.email || '',
      influence: s.influence,
      sentiment: s.sentiment,
      concerns: s.concerns ? s.concerns.join(', ') : '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const concernsArray = formData.concerns
      ? formData.concerns.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    if (editingStakeholder) {
      onUpdate({
        ...editingStakeholder,
        name: formData.name,
        role: formData.role,
        email: formData.email,
        influence: formData.influence,
        sentiment: formData.sentiment,
        concerns: concernsArray,
      });
    } else {
      onAdd({
        name: formData.name,
        role: formData.role,
        email: formData.email,
        influence: formData.influence,
        sentiment: formData.sentiment,
        concerns: concernsArray,
        lastInteraction: new Date(),
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Stakeholder Matrix</h2>
          <p className="text-xs text-slate-400">Map internal champions, buyers, and detractors</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Stakeholder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deal.stakeholders && deal.stakeholders.length > 0 ? (
          deal.stakeholders.map((s) => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative group hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{s.name}</h4>
                  <p className="text-xs text-slate-400">{s.role}</p>
                </div>
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded"
                >
                  Edit
                </button>
              </div>

              {s.email && <p className="text-xs text-slate-400 mb-3">{s.email}</p>}

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 capitalize">
                  {s.influence} influence
                </span>
                <span className={`text-xs px-2 py-0.5 rounded capitalize ${getSentimentColor(s.sentiment)}`}>
                  {s.sentiment}
                </span>
              </div>

              {s.concerns && s.concerns.length > 0 && (
                <div className="pt-3 border-t border-slate-800 text-xs">
                  <p className="text-slate-400 font-medium mb-1">Key Concerns:</p>
                  <ul className="space-y-1">
                    {s.concerns.map((c, i) => (
                      <li key={i} className="text-slate-300 flex items-center gap-1.5">
                        <span className="text-rose-400">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-slate-400 text-sm">No stakeholders mapped yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingStakeholder ? 'Edit Stakeholder' : 'Add New Stakeholder'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Role / Title</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Influence</label>
                  <select
                    value={formData.influence}
                    onChange={(e) => setFormData({ ...formData, influence: e.target.value as any })}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="decision-maker">Decision Maker</option>
                  </select>
                </div>
                <div>
                  <label className="label">Sentiment</label>
                  <select
                    value={formData.sentiment}
                    onChange={(e) => setFormData({ ...formData, sentiment: e.target.value as any })}
                    className="input"
                  >
                    <option value="positive">Positive (Champion)</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative (Detractor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Concerns (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Budget, Implementation duration, API security"
                  value={formData.concerns}
                  onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Stakeholder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Objections Tab
// ----------------------------------------------------
function ObjectionsTab({ deal }: { deal: Deal }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Tracked Objections & Resolution Status</h2>
      {deal.objections && deal.objections.length > 0 ? (
        <div className="space-y-4">
          {deal.objections.map((obj) => (
            <div key={obj.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider">
                    {obj.category}
                  </span>
                  <h4 className="font-bold text-white text-sm mt-2">{obj.description}</h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold capitalize ${
                  obj.outcome === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                  obj.outcome === 'partially-resolved' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {obj.outcome.replace('-', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{obj.context}</p>
              {obj.responseGiven && (
                <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300">Response Used:</span>{' '}
                  <span className="text-slate-400">{obj.responseGiven}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">No objections logged for this deal.</p>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Competitors Tab
// ----------------------------------------------------
function CompetitorsTab({ deal }: { deal: Deal }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Competitor Intelligence</h2>
      {deal.competitorMentions && deal.competitorMentions.length > 0 ? (
        <div className="space-y-4">
          {deal.competitorMentions.map((comp) => (
            <div key={comp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span>⚔️</span> {comp.competitorName}
                </h4>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                  {comp.prospectSentiment} sentiment
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{comp.context}</p>
              {comp.ourDifferentiation && (
                <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-3 text-xs text-blue-200">
                  <span className="font-semibold text-blue-300">Our Winning Angle:</span> {comp.ourDifferentiation}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">No competitor mentions detected in calls.</p>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Pricing Tab
// ----------------------------------------------------
function PricingTab({ deal }: { deal: Deal }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Pricing & Packaging Discussions</h2>
      {deal.pricingDiscussions && deal.pricingDiscussions.length > 0 ? (
        <div className="space-y-4">
          {deal.pricingDiscussions.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white capitalize text-sm">{p.topic.replace('-', ' ')}</span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {p.amountDiscussed ? formatCurrency(p.amountDiscussed) : 'Terms discussion'}
                </span>
              </div>
              <p className="text-xs text-slate-300">{p.notes}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">No pricing negotiations logged yet.</p>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Briefing Tab
// ----------------------------------------------------
function BriefingTab({ deal, briefing }: { deal: Deal; briefing: Briefing | null }) {
  const [copied, setCopied] = useState(false);

  if (!briefing) {
    return (
      <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <span className="text-3xl mb-2 block">📋</span>
        <p className="text-slate-400 text-sm">No briefing generated yet.</p>
      </div>
    );
  }

  const handleCopy = () => {
    const text = `PRE-CALL BRIEFING: ${deal.name}\nCall #${briefing.callNumber}\nConfidence: ${briefing.confidenceLevel}\n\nSUMMARY:\n${briefing.executiveSummary}\n\nTALK TRACKS:\n${briefing.recommendedTalkTrack.map(t => `- ${t.topic}: ${t.keyPoints.join('; ')}`).join('\n')}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">AI Pre-Call Briefing</h2>
            <p className="text-xs text-slate-400">
              Generated for Call #{briefing.callNumber} · {formatDateTime(briefing.generatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              briefing.confidenceLevel === 'high' ? 'bg-emerald-500/20 text-emerald-300' :
              briefing.confidenceLevel === 'medium' ? 'bg-amber-500/20 text-amber-300' :
              'bg-rose-500/20 text-rose-300'
            }`}>
              {briefing.confidenceLevel} confidence
            </span>
            <button onClick={handleCopy} className="btn-secondary text-xs">
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
            <button onClick={() => window.print()} className="btn-primary text-xs">
              📄 Print / PDF
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-900/40 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-blue-200 text-sm mb-2 flex items-center gap-2">
            <span>📋</span> Executive Summary
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed">{briefing.executiveSummary}</p>
        </div>

        {/* Talk Tracks */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <span>🎯</span> Recommended Talk Tracks
          </h3>
          {briefing.recommendedTalkTrack.map((track, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-blue-400 text-sm">{track.topic}</h4>
              <div className="space-y-1.5">
                {track.keyPoints.map((pt, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-blue-500 mt-0.5">▸</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
              {track.objectionHandlers && track.objectionHandlers.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  {track.objectionHandlers.map((h, k) => (
                    <div key={k} className="p-2.5 rounded bg-rose-950/20 border border-rose-900/30 text-rose-200 text-xs">
                      <span className="font-semibold text-rose-300">Defense Angle:</span> {h}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
