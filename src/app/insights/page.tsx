'use client';

import React from 'react';
import { useDealRoom } from '@/hooks/useDealRoom';
import { formatCurrency } from '@/lib/utils';

export default function InsightsPage() {
  const { deals, stats } = useDealRoom();

  const allObjections = deals.flatMap((d) => d.objections || []);
  const allCompetitors = deals.flatMap((d) => d.competitorMentions || []);

  // Objection analysis
  const objectionByCategory = allObjections.reduce((acc, obj) => {
    if (!acc[obj.category]) acc[obj.category] = { total: 0, resolved: 0, totalEffectiveness: 0 };
    acc[obj.category].total++;
    if (obj.outcome === 'resolved' || obj.outcome === 'partially-resolved') acc[obj.category].resolved++;
    acc[obj.category].totalEffectiveness += obj.effectiveness || 50;
    return acc;
  }, {} as Record<string, { total: number; resolved: number; totalEffectiveness: number }>);

  const objectionStats = Object.entries(objectionByCategory)
    .map(([category, data]) => ({
      category,
      count: data.total,
      resolutionRate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0,
      avgEffectiveness: data.total > 0 ? Math.round(data.totalEffectiveness / data.total) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Competitor analysis
  const competitorStats = allCompetitors.reduce((acc, cm) => {
    if (!acc[cm.competitorName]) acc[cm.competitorName] = { mentions: 0, sentiments: [] as string[], deals: new Set<string>() };
    acc[cm.competitorName].mentions++;
    acc[cm.competitorName].sentiments.push(cm.prospectSentiment);
    acc[cm.competitorName].deals.add(cm.dealId);
    return acc;
  }, {} as Record<string, { mentions: number; sentiments: string[]; deals: Set<string> }>);

  const competitorList = Object.entries(competitorStats)
    .map(([name, data]) => {
      const pos = data.sentiments.filter((s) => s === 'positive').length;
      const neg = data.sentiments.filter((s) => s === 'negative').length;
      const len = data.sentiments.length || 1;
      return {
        name,
        mentions: data.mentions,
        deals: data.deals.size,
        positiveSentiment: Math.round((pos / len) * 100),
        negativeSentiment: Math.round((neg / len) * 100),
      };
    })
    .sort((a, b) => b.mentions - a.mentions);

  // Stage distribution
  const stageDistribution = deals.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const wonDeals = deals.filter((d) => d.stage === 'closed-won');
  const lostDeals = deals.filter((d) => d.stage === 'closed-lost');

  // Rep leaderboard
  const repPerformance = deals.reduce((acc, d) => {
    if (!acc[d.owner]) acc[d.owner] = { deals: 0, value: 0, won: 0, confidence: 0 };
    acc[d.owner].deals++;
    acc[d.owner].value += (d.value * d.probability) / 100;
    if (d.stage === 'closed-won') acc[d.owner].won++;
    acc[d.owner].confidence += d.insights?.confidenceScore || 50;
    return acc;
  }, {} as Record<string, { deals: number; value: number; won: number; confidence: number }>);

  const repLeaderboard = Object.entries(repPerformance)
    .map(([name, data]) => ({
      name,
      deals: data.deals,
      pipeline: data.value,
      winRate: data.deals > 0 ? Math.round((data.won / data.deals) * 100) : 0,
      avgConfidence: data.deals > 0 ? Math.round(data.confidence / data.deals) : 0,
    }))
    .sort((a, b) => b.pipeline - a.pipeline);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">Deal Intelligence & Analytics</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Pipeline Insights
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Real-time pattern discovery across closed wins, losses, recurring objections, and rep velocity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPICard
          label="Total Weighted Pipeline"
          value={formatCurrency(stats.weightedPipeline)}
          icon="📈"
          color="blue"
          subtitle={`${stats.totalDeals} active opportunities`}
        />
        <KPICard
          label="Avg Deal Size"
          value={formatCurrency(stats.avgDealSize)}
          icon="💰"
          color="green"
          subtitle={`Win rate: ${stats.winRate.toFixed(0)}%`}
        />
        <KPICard
          label="Avg AI Confidence"
          value={`${stats.avgConfidence.toFixed(0)}%`}
          icon="🧠"
          color="purple"
          subtitle="Portfolio health score"
        />
        <KPICard
          label="Won Opportunities"
          value={wonDeals.length.toString()}
          icon="🏆"
          color="green"
          subtitle={`${formatCurrency(wonDeals.reduce((sum, d) => sum + d.value, 0))} closed`}
        />
        <KPICard
          label="Lost Opportunities"
          value={lostDeals.length.toString()}
          icon="📉"
          color="red"
          subtitle="Post-mortem candidates"
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Objection Resolution Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-white mb-1">Objection Resolution Rates</h3>
          <p className="text-xs text-slate-400 mb-6">Top friction points and team resolution effectiveness</p>
          {objectionStats.length > 0 ? (
            <div className="space-y-4">
              {objectionStats.map((stat) => (
                <div key={stat.category} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white capitalize text-sm">{stat.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {stat.count} occurrence(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${stat.resolutionRate}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-300">{stat.resolutionRate}% resolved</span>
                    <span className="font-bold text-emerald-400">{stat.avgEffectiveness}% effective</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs">No objection data recorded yet.</p>
          )}
        </div>

        {/* Competitor Pressure */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-white mb-1">Competitor Head-to-Head</h3>
          <p className="text-xs text-slate-400 mb-6">Frequency and prospect sentiment when competing</p>
          {competitorList.length > 0 ? (
            <div className="space-y-4">
              {competitorList.map((comp) => (
                <div key={comp.name} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span>⚔️</span> {comp.name}
                    </span>
                    <span className="text-xs text-slate-400">{comp.mentions} mentions across {comp.deals} deals</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${comp.positiveSentiment}%` }} />
                      <div className="bg-rose-500 h-full" style={{ width: `${comp.negativeSentiment}%` }} />
                    </div>
                    <span className="text-emerald-400 font-semibold">{comp.positiveSentiment}% +</span>
                    <span className="text-rose-400 font-semibold">{comp.negativeSentiment}% -</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs">No competitor data detected yet.</p>
          )}
        </div>
      </div>

      {/* Stage Breakdown & Rep Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Funnel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-white mb-1">Funnel Distribution</h3>
          <p className="text-xs text-slate-400 mb-6">Volume of opportunities by sales phase</p>
          <div className="space-y-3">
            {['discovery', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'].map((stage) => {
              const count = stageDistribution[stage] || 0;
              const pct = stats.totalDeals > 0 ? Math.round((count / stats.totalDeals) * 100) : 0;
              return (
                <div key={stage} className="flex items-center gap-4 text-xs">
                  <span className="w-28 font-medium text-slate-300 capitalize">{stage.replace('-', ' ')}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-12 text-right font-bold text-white">{count}</span>
                  <span className="w-10 text-right text-slate-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rep Leaderboard */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-white mb-1">Rep Performance Leaderboard</h3>
          <p className="text-xs text-slate-400 mb-6">Weighted pipeline and closing velocity by rep</p>
          <div className="space-y-3">
            {repLeaderboard.map((rep, idx) => (
              <div key={rep.name} className="flex items-center justify-between p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-white text-sm">{rep.name}</p>
                    <p className="text-xs text-slate-400">{rep.deals} deals · {rep.winRate}% win rate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-sm">{formatCurrency(rep.pipeline)}</p>
                  <p className="text-xs text-purple-400 font-medium">{rep.avgConfidence}% avg confidence</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  icon,
  subtitle,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  subtitle: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight mb-1">{value}</p>
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}
