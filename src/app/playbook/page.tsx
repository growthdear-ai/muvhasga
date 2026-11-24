'use client';

import React, { useState } from 'react';
import { useDealRoom } from '@/hooks/useDealRoom';
import { ObjectionPlaybook, SuccessfulResponse, FailedResponse } from '@/types';
import { formatDate } from '@/lib/utils';

const categoryIcons: Record<string, string> = {
  price: '💰',
  competitor: '⚔️',
  timeline: '⏰',
  features: '🔧',
  trust: '🤝',
  implementation: '🚀',
  other: '📋',
};

export default function PlaybookPage() {
  const { playbook, recordPlaybookOutcome } = useDealRoom();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('price');
  const [showAddResponse, setShowAddResponse] = useState<{ category: string; isSuccess: boolean } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const [responseForm, setResponseForm] = useState({
    objectionId: '',
    response: '',
    context: '',
    effectiveness: 75,
    dealOutcome: 'in-progress' as 'won' | 'lost' | 'in-progress',
  });

  const handleAddResponse = (category: string, isSuccess: boolean) => {
    setShowAddResponse({ category, isSuccess });
    setResponseForm({ objectionId: '', response: '', context: '', effectiveness: 75, dealOutcome: 'in-progress' });
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (showAddResponse) {
      recordPlaybookOutcome(
        showAddResponse.category as any,
        responseForm.objectionId || `manual-${Date.now()}`,
        responseForm.response,
        responseForm.context,
        responseForm.effectiveness,
        responseForm.dealOutcome,
        showAddResponse.isSuccess
      );
      setShowAddResponse(null);
    }
  };

  const filteredPlaybook = playbook.filter((pb) => {
    return (
      pb.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pb.bestPractice.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pb.triggerPatterns.some((tp) => tp.toLowerCase().includes(searchFilter.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Objection Playbook</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Collective Wisdom
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Empower your team with real-world rebuttals, battle-tested counter-arguments, and proven closing patterns.
          </p>
        </div>

        <div className="w-72">
          <input
            type="text"
            placeholder="Search triggers, categories..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Playbook List */}
      <div className="space-y-4">
        {filteredPlaybook.map((pb) => (
          <PlaybookCategoryCard
            key={pb.id}
            playbook={pb}
            isExpanded={expandedCategory === pb.category}
            onToggle={() =>
              setExpandedCategory(expandedCategory === pb.category ? null : pb.category)
            }
            onAddResponse={handleAddResponse}
          />
        ))}

        {filteredPlaybook.length === 0 && (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm">No playbook entries match your filter.</p>
          </div>
        )}
      </div>

      {/* Add Response Modal */}
      {showAddResponse && (
        <ResponseModal
          category={showAddResponse.category}
          isSuccess={showAddResponse.isSuccess}
          formData={responseForm}
          onChange={setResponseForm}
          onSubmit={handleSubmitResponse}
          onClose={() => setShowAddResponse(null)}
        />
      )}
    </div>
  );
}

function PlaybookCategoryCard({
  playbook,
  isExpanded,
  onToggle,
  onAddResponse,
}: {
  playbook: ObjectionPlaybook;
  isExpanded: boolean;
  onToggle: () => void;
  onAddResponse: (category: string, isSuccess: boolean) => void;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700/60">
            {categoryIcons[playbook.category] || '📋'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white capitalize">{playbook.category}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {playbook.successfulResponses.length} winning tracks · {playbook.failedResponses.length} pitfalls · Applied {playbook.usageCount} times
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddResponse(playbook.category, true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 rounded-lg hover:bg-emerald-900/60 transition-colors"
          >
            + Success
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddResponse(playbook.category, false);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg hover:bg-rose-900/60 transition-colors"
          >
            + Failure
          </button>
          <span
            className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-800 animate-fade-in divide-y divide-slate-800/80">
          {/* Best Practice Callout */}
          <div className="p-6 bg-blue-950/20">
            <h4 className="font-bold text-blue-300 text-sm mb-2 flex items-center gap-2">
              <span>💡</span> Recommended Standard Response
            </h4>
            <p className="text-slate-200 text-sm leading-relaxed">{playbook.bestPractice}</p>
            <p className="text-[11px] text-blue-400 mt-2 font-medium">
              Last validated: {formatDate(playbook.lastUpdated)}
            </p>
          </div>

          {/* Trigger Words */}
          <div className="p-6">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">
              Detection Triggers / Customer Phrases
            </h4>
            <div className="flex flex-wrap gap-2">
              {playbook.triggerPatterns.map((pattern, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs bg-slate-800/80 text-slate-300 border border-slate-700/80 rounded-full"
                >
                  "{pattern}"
                </span>
              ))}
            </div>
          </div>

          {/* Successful Responses */}
          <div className="p-6">
            <h4 className="font-bold text-emerald-400 text-sm mb-4 flex items-center gap-2">
              <span>✅</span> Verified Successful Responses ({playbook.successfulResponses.length})
            </h4>
            {playbook.successfulResponses.length > 0 ? (
              <div className="space-y-3">
                {playbook.successfulResponses.map((res) => (
                  <ResponseCard key={res.id} response={res} type="success" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No successful responses logged yet.</p>
            )}
          </div>

          {/* Failed Responses */}
          <div className="p-6 bg-rose-950/10">
            <h4 className="font-bold text-rose-400 text-sm mb-4 flex items-center gap-2">
              <span>❌</span> What Not To Say / What Failed ({playbook.failedResponses.length})
            </h4>
            {playbook.failedResponses.length > 0 ? (
              <div className="space-y-3">
                {playbook.failedResponses.map((res) => (
                  <ResponseCard key={res.id} response={res} type="failure" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No failed responses recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResponseCard({
  response,
  type,
}: {
  response: SuccessfulResponse | FailedResponse;
  type: 'success' | 'failure';
}) {
  const isSuccess = type === 'success';
  const r = response as any;

  return (
    <div
      className={`rounded-xl p-4 border ${
        isSuccess
          ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-100'
          : 'bg-rose-950/20 border-rose-900/40 text-rose-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <p className="text-sm font-medium text-white">{r.response}</p>
        <span className="text-[11px] text-slate-400 whitespace-nowrap">
          {formatDate(r.usedAt)}
        </span>
      </div>

      <div className="text-xs text-slate-300">
        <span className="text-slate-400 font-semibold">Context:</span> {r.context}
      </div>

      {isSuccess && (
        <div className="mt-2.5 pt-2 border-t border-emerald-900/40 flex items-center justify-between text-xs">
          <span className="text-emerald-400 font-bold">{r.effectiveness}% effectiveness rating</span>
          <span className="text-slate-300 capitalize">Outcome: {r.dealOutcome}</span>
        </div>
      )}

      {!isSuccess && r.reason && (
        <div className="mt-2.5 pt-2 border-t border-rose-900/40 text-xs text-rose-300">
          <span className="font-semibold text-rose-400">Why it backfired:</span> {r.reason}
        </div>
      )}
    </div>
  );
}

function ResponseModal({
  category,
  isSuccess,
  formData,
  onChange,
  onSubmit,
  onClose,
}: {
  category: string;
  isSuccess: boolean;
  formData: any;
  onChange: (d: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>{isSuccess ? '✅' : '❌'}</span> Record {isSuccess ? 'Winning' : 'Failed'} Response —{' '}
            <span className="capitalize">{category}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">What was said / done?</label>
            <textarea
              required
              rows={3}
              value={formData.response}
              onChange={(e) => onChange({ ...formData, response: e.target.value })}
              placeholder="Detail the rebuttal, pricing maneuver, or customer response..."
              className="input"
            />
          </div>

          <div>
            <label className="label">Prospect Context / Scenario</label>
            <input
              type="text"
              required
              value={formData.context}
              onChange={(e) => onChange({ ...formData, context: e.target.value })}
              placeholder="e.g. Procurement negotiation, CTO evaluation"
              className="input"
            />
          </div>

          {isSuccess ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Effectiveness ({formData.effectiveness}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.effectiveness}
                  onChange={(e) => onChange({ ...formData, effectiveness: parseInt(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>
              <div>
                <label className="label">Deal Outcome</label>
                <select
                  value={formData.dealOutcome}
                  onChange={(e) => onChange({ ...formData, dealOutcome: e.target.value })}
                  className="input"
                >
                  <option value="in-progress">In Progress</option>
                  <option value="won">Closed Won</option>
                  <option value="lost">Closed Lost</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="label">Why did it fail?</label>
              <input
                type="text"
                placeholder="e.g. Prospect felt defensive, contradicted their security requirements"
                value={formData.context}
                onChange={(e) => onChange({ ...formData, context: e.target.value })}
                className="input"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className={isSuccess ? 'btn-primary' : 'btn-danger'}>
              Save to Playbook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
