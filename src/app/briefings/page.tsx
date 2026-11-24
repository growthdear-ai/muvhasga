'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDealRoom } from '@/hooks/useDealRoom';
import { Deal, Briefing } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';

export default function BriefingsPage() {
  const { deals, generateBriefingForDeal } = useDealRoom();
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [callNumber, setCallNumber] = useState(1);
  const [copied, setCopied] = useState(false);

  const dealsWithCalls = deals.filter((d) => d.calls && d.calls.length > 0);
  const selectableDeals = dealsWithCalls.length > 0 ? dealsWithCalls : deals;

  const handleGenerate = () => {
    if (selectedDealId) {
      const deal = deals.find((d) => d.id === selectedDealId);
      if (deal) {
        const newBriefing = generateBriefingForDeal(deal.id, callNumber);
        setBriefing(newBriefing);
      }
    }
  };

  const handleCopy = () => {
    if (!briefing) return;
    const deal = deals.find((d) => d.id === briefing.dealId);
    const text = `PRE-CALL BRIEFING: ${deal?.name || 'Deal'}\nCall #${briefing.callNumber}\nConfidence: ${briefing.confidenceLevel}\n\nEXECUTIVE SUMMARY:\n${briefing.executiveSummary}\n\nTALK TRACKS:\n${briefing.recommendedTalkTrack.map(t => `- ${t.topic}: ${t.keyPoints.join('; ')}`).join('\n')}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">Pre-Call Briefings</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Autonomous Prep
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Synthesize historical meeting minutes, stakeholder concerns, competitor positioning, and objections before jumping on calls.
        </p>
      </div>

      {/* Deal Selector Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
          Generate Briefing Dossier
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label">Select Opportunity</label>
            <select
              value={selectedDealId}
              onChange={(e) => {
                setSelectedDealId(e.target.value);
                const deal = deals.find((d) => d.id === e.target.value);
                if (deal) setCallNumber((deal.calls?.length || 0) + 1);
              }}
              className="input"
            >
              <option value="">Choose a deal...</option>
              {selectableDeals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.name} ({deal.company}) — {deal.calls?.length || 0} calls
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Upcoming Call #</label>
            <input
              type="number"
              min="1"
              value={callNumber}
              onChange={(e) => setCallNumber(parseInt(e.target.value) || 1)}
              className="input"
            />
          </div>

          <div>
            <button
              onClick={handleGenerate}
              disabled={!selectedDealId}
              className="w-full btn-primary disabled:opacity-40"
            >
              ⚡ Generate AI Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Briefing Output */}
      {briefing ? (
        <BriefingViewer
          briefing={briefing}
          deals={deals}
          onCopy={handleCopy}
          copied={copied}
        />
      ) : (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-slate-300 font-semibold text-base">Select an opportunity above</p>
          <p className="text-xs text-slate-500 mt-1">
            DealRoom will analyze all stakeholders, unresolved objections, and win themes.
          </p>
        </div>
      )}
    </div>
  );
}

function BriefingViewer({
  briefing,
  deals,
  onCopy,
  copied,
}: {
  briefing: Briefing;
  deals: Deal[];
  onCopy: () => void;
  copied: boolean;
}) {
  const deal = deals.find((d) => d.id === briefing.dealId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Dossier */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">{deal?.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                briefing.confidenceLevel === 'high' ? 'bg-emerald-500/20 text-emerald-300' :
                briefing.confidenceLevel === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                'bg-rose-500/20 text-rose-300'
              }`}>
                {briefing.confidenceLevel} confidence
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {deal?.company} · Target Call #{briefing.callNumber} · Generated {formatDateTime(briefing.generatedAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onCopy} className="btn-secondary text-xs">
              {copied ? '✓ Copied' : '📋 Copy Dossier'}
            </button>
            <button onClick={() => window.print()} className="btn-primary text-xs">
              📄 Export PDF
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-900/40 rounded-xl p-5">
          <h3 className="font-bold text-blue-200 text-sm mb-2 flex items-center gap-2">
            <span>📋</span> Executive Summary
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed">{briefing.executiveSummary}</p>
        </div>
      </div>

      {/* Recommended Talk Tracks */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🎯</span> Recommended Talk Tracks
        </h3>
        {briefing.recommendedTalkTrack.map((track, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-blue-400 text-sm">{track.topic}</h4>
            <div className="space-y-2">
              {track.keyPoints.map((pt, j) => (
                <div key={j} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="text-blue-500 mt-0.5">▸</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
            {track.objectionHandlers && track.objectionHandlers.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                {track.objectionHandlers.map((h, k) => (
                  <div key={k} className="p-2.5 rounded bg-rose-950/20 border border-rose-900/30 text-rose-200 text-xs">
                    <span className="font-semibold text-rose-300">Counter Objection:</span> {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stakeholder Updates */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span>👥</span> Stakeholder Dynamics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {briefing.stakeholderUpdates.map((su) => (
            <div key={su.stakeholderId} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-white text-sm">{su.name}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  su.sentimentChange === 'improved' ? 'bg-emerald-500/20 text-emerald-300' :
                  su.sentimentChange === 'declined' ? 'bg-rose-500/20 text-rose-300' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {su.sentimentChange}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{su.role}</p>
              {su.newConcerns && su.newConcerns.length > 0 && (
                <div className="text-[11px] text-slate-300">
                  <span className="text-slate-400 font-medium">Concerns:</span> {su.newConcerns.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Competitor & Pricing Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Intel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>⚔️</span> Competitor Intel
          </h3>
          {briefing.competitorIntel && briefing.competitorIntel.length > 0 ? (
            briefing.competitorIntel.map((ci) => (
              <div key={ci.competitorName} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{ci.competitorName}</h4>
                  <span className="text-xs text-slate-400">
                    Last mentioned: {ci.lastMentioned ? formatDate(ci.lastMentioned) : 'Recently'}
                  </span>
                </div>
                {ci.ourWinThemes.map((theme, idx) => (
                  <p key={idx} className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span> {theme}
                  </p>
                ))}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No competitors flagged for this prospect.</p>
          )}
        </div>

        {/* Pricing Position */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>💰</span> Pricing Position
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex justify-between text-xs">
              <span className="text-slate-400">Budget Range:</span>
              <span className="font-semibold text-white">{briefing.pricingPosition.budgetRange || 'Under evaluation'}</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex justify-between text-xs">
              <span className="text-slate-400">Discount Requested:</span>
              <span className="font-semibold text-amber-400">
                {briefing.pricingPosition.discountRequested ? `${briefing.pricingPosition.discountRequested}%` : 'None requested'}
              </span>
            </div>
            <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg text-xs text-blue-200">
              <p className="font-semibold text-blue-300 mb-1">Recommended Pricing Strategy:</p>
              <p>{briefing.pricingPosition.recommendedStrategy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
