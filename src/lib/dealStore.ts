import {
  Deal,
  Call,
  Stakeholder,
  Objection,
  CompetitorMention,
  PricingDiscussion,
  ObjectionPlaybook,
  Briefing,
  DealInsights,
  KeyMoment,
  ActionItem,
  SuccessfulResponse,
  FailedResponse
} from '@/types';

const STORAGE_KEY = 'dealroom_deals';
const PLAYBOOK_KEY = 'dealroom_playbook';
const CALLS_KEY = 'dealroom_calls';

// Initialize with sample data for demo
const initializeSampleData = (): Deal[] => {
  const sampleDeals: Deal[] = [
    {
      id: 'deal-001',
      name: 'Acme Corp - Enterprise Platform',
      company: 'Acme Corporation',
      stage: 'negotiation',
      value: 250000,
      currency: 'USD',
      probability: 70,
      expectedCloseDate: new Date('2025-02-15'),
      owner: 'Sarah Chen',
      stakeholders: [
        {
          id: 'stake-001',
          name: 'Marcus Johnson',
          role: 'VP Engineering',
          email: 'marcus.j@acme.com',
          influence: 'decision-maker',
          sentiment: 'positive',
          concerns: ['Implementation timeline', 'Team bandwidth'],
          lastInteraction: new Date('2025-01-15'),
        },
        {
          id: 'stake-002',
          name: 'Lisa Chen',
          role: 'CTO',
          email: 'lisa.c@acme.com',
          influence: 'high',
          sentiment: 'neutral',
          concerns: ['Vendor lock-in', 'Security compliance'],
          lastInteraction: new Date('2025-01-10'),
        },
        {
          id: 'stake-003',
          name: 'David Park',
          role: 'Procurement Lead',
          email: 'david.p@acme.com',
          influence: 'medium',
          sentiment: 'negative',
          concerns: ['Pricing', 'Contract terms'],
          lastInteraction: new Date('2025-01-12'),
        },
      ],
      calls: [
        {
          id: 'call-001',
          dealId: 'deal-001',
          date: new Date('2025-01-05'),
          duration: 45,
          participants: ['stake-001', 'stake-002'],
          summary: 'Discovery call - discussed current pain points with legacy system, scaling challenges, and evaluation criteria.',
          keyMoments: [
            { id: 'km-001', timestamp: 1200, type: 'buying-signal', description: 'Mentioned urgent need to replace legacy by Q2', stakeholderId: 'stake-001' },
            { id: 'km-002', timestamp: 1800, type: 'risk', description: 'Concerned about migration complexity', stakeholderId: 'stake-002' },
          ],
          actionItems: [
            { id: 'ai-001', description: 'Send technical architecture doc', owner: 'us', dueDate: new Date('2025-01-08'), status: 'completed', priority: 'high' },
            { id: 'ai-002', description: 'Schedule security review', owner: 'stake-002', dueDate: new Date('2025-01-15'), status: 'pending', priority: 'high' },
          ],
          sentiment: 'positive',
          nextSteps: 'Technical deep-dive with engineering team next week',
        },
        {
          id: 'call-002',
          dealId: 'deal-001',
          date: new Date('2025-01-10'),
          duration: 60,
          participants: ['stake-001', 'stake-002', 'stake-003'],
          summary: 'Technical deep-dive - walked through architecture, security model, and migration approach. Procurement raised pricing concerns.',
          keyMoments: [
            { id: 'km-003', timestamp: 900, type: 'competitor', description: 'Mentioned evaluating Databricks as alternative', stakeholderId: 'stake-001' },
            { id: 'km-004', timestamp: 2100, type: 'objection', description: 'Price is 40% above budget', stakeholderId: 'stake-003' },
            { id: 'km-005', timestamp: 2700, type: 'buying-signal', description: 'CTO asked about implementation timeline', stakeholderId: 'stake-002' },
          ],
          actionItems: [
            { id: 'ai-003', description: 'Prepare ROI calculator', owner: 'us', dueDate: new Date('2025-01-12'), status: 'completed', priority: 'critical' },
            { id: 'ai-004', description: 'Send competitive comparison vs Databricks', owner: 'us', dueDate: new Date('2025-01-13'), status: 'in-progress', priority: 'high' },
            { id: 'ai-005', description: 'Review contract redlines', owner: 'stake-003', dueDate: new Date('2025-01-17'), status: 'pending', priority: 'high' },
          ],
          sentiment: 'neutral',
          nextSteps: 'Pricing discussion with procurement, send competitive comparison',
        },
        {
          id: 'call-003',
          dealId: 'deal-001',
          date: new Date('2025-01-15'),
          duration: 50,
          participants: ['stake-001', 'stake-003'],
          summary: 'Pricing negotiation - discussed discount options, multi-year terms, and implementation package. VP Engineering championed our solution.',
          keyMoments: [
            { id: 'km-006', timestamp: 600, type: 'pricing', description: 'Requested 20% discount for 3-year commitment', stakeholderId: 'stake-003' },
            { id: 'km-007', timestamp: 1500, type: 'champion', description: 'VP Eng advocated for our platform internally', stakeholderId: 'stake-001' },
            { id: 'km-008', timestamp: 2400, type: 'objection', description: 'Concerned about auto-renewal clauses', stakeholderId: 'stake-003' },
          ],
          actionItems: [
            { id: 'ai-006', description: 'Send revised proposal with 15% discount, 3-year term', owner: 'us', dueDate: new Date('2025-01-17'), status: 'pending', priority: 'critical' },
            { id: 'ai-007', description: 'Legal to review auto-renewal language', owner: 'us', dueDate: new Date('2025-01-18'), status: 'pending', priority: 'high' },
          ],
          sentiment: 'positive',
          nextSteps: 'Final proposal review with CTO, legal review of terms',
        },
      ],
      objections: [
        {
          id: 'obj-001',
          dealId: 'deal-001',
          callId: 'call-002',
          raisedBy: 'stake-003',
          category: 'price',
          description: 'Price is 40% above budget - need significant discount to proceed',
          context: 'During technical deep-dive, after seeing full platform capabilities',
          responseGiven: 'Presented ROI calculator showing 3.2x return in 18 months; offered 15% discount for 3-year commitment',
          outcome: 'partially-resolved',
          effectiveness: 75,
          createdAt: new Date('2025-01-10'),
          resolvedAt: new Date('2025-01-15'),
        },
        {
          id: 'obj-002',
          dealId: 'deal-001',
          callId: 'call-003',
          raisedBy: 'stake-003',
          category: 'contract-terms',
          description: 'Concerned about auto-renewal clauses and exit terms',
          context: 'Pricing negotiation, reviewing contract details',
          responseGiven: 'Agreed to remove auto-renewal, offer 90-day opt-out notice',
          outcome: 'resolved',
          effectiveness: 90,
          createdAt: new Date('2025-01-15'),
          resolvedAt: new Date('2025-01-15'),
        },
      ],
      competitorMentions: [
        {
          id: 'comp-001',
          dealId: 'deal-001',
          callId: 'call-002',
          competitorName: 'Databricks',
          context: 'Evaluating as alternative for unified analytics platform',
          prospectSentiment: 'comparing',
          ourDifferentiation: 'Superior real-time processing, lower TCO, better integration with existing stack',
          createdAt: new Date('2025-01-10'),
        },
      ],
      pricingDiscussions: [
        {
          id: 'price-001',
          dealId: 'deal-001',
          callId: 'call-002',
          topic: 'budget',
          amountDiscussed: 180000,
          currency: 'USD',
          prospectReaction: 'negative',
          notes: 'Stated budget is $180k, our quote was $250k',
          createdAt: new Date('2025-01-10'),
        },
        {
          id: 'price-002',
          dealId: 'deal-001',
          callId: 'call-003',
          topic: 'discount',
          amountDiscussed: 212500,
          currency: 'USD',
          prospectReaction: 'neutral',
          notes: 'Proposed 15% discount for 3-year term ($212.5k), asked for 20%',
          createdAt: new Date('2025-01-15'),
        },
      ],
      tags: ['enterprise', 'platform', 'migration', 'competitive'],
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-15'),
      lastActivityAt: new Date('2025-01-15'),
      insights: {
        topObjections: [
          { category: 'price', count: 1, resolutionRate: 75 },
          { category: 'contract-terms', count: 1, resolutionRate: 90 },
        ],
        competitorThreats: [
          { name: 'Databricks', mentions: 1, sentiment: 'comparing' },
        ],
        stakeholderMap: [
          { stakeholderId: 'stake-001', influence: 'decision-maker', sentiment: 'positive', riskLevel: 'low' },
          { stakeholderId: 'stake-002', influence: 'high', sentiment: 'neutral', riskLevel: 'medium' },
          { stakeholderId: 'stake-003', influence: 'medium', sentiment: 'negative', riskLevel: 'high' },
        ],
        pricingSensitivity: 'high',
        recommendedApproach: 'Leverage VP Engineering champion to influence CTO; address procurement with ROI-focused framing and flexible contract terms',
        riskFactors: ['High pricing sensitivity from procurement', 'CTO security concerns not fully addressed', 'Databricks evaluation in progress'],
        buyingSignals: ['Urgent Q2 replacement timeline', 'VP Engineering internal advocacy', 'CTO asking implementation details', 'Multi-year discussion initiated'],
        nextBestAction: 'Send final proposal with 15% discount, 3-year term, no auto-renewal; schedule CTO security review',
        confidenceScore: 72,
        generatedAt: new Date('2025-01-15'),
      },
    },
    {
      id: 'deal-002',
      name: 'TechStart Inc - Growth Plan',
      company: 'TechStart Inc',
      stage: 'proposal',
      value: 75000,
      currency: 'USD',
      probability: 55,
      expectedCloseDate: new Date('2025-01-30'),
      owner: 'Mike Rodriguez',
      stakeholders: [
        {
          id: 'stake-004',
          name: 'Alex Kumar',
          role: 'Founder/CEO',
          email: 'alex@techstart.io',
          influence: 'decision-maker',
          sentiment: 'positive',
          concerns: ['Time to value', 'Team adoption'],
          lastInteraction: new Date('2025-01-12'),
        },
        {
          id: 'stake-005',
          name: 'Rachel Kim',
          role: 'Head of Data',
          email: 'rachel@techstart.io',
          influence: 'high',
          sentiment: 'positive',
          concerns: ['Learning curve', 'Integration with existing tools'],
          lastInteraction: new Date('2025-01-12'),
        },
      ],
      calls: [
        {
          id: 'call-004',
          dealId: 'deal-002',
          date: new Date('2025-01-08'),
          duration: 35,
          participants: ['stake-004', 'stake-005'],
          summary: 'Initial discovery - fast-growing startup needing better analytics infrastructure. Evaluating build vs buy.',
          keyMoments: [
            { id: 'km-009', timestamp: 600, type: 'buying-signal', description: 'Team spending 20hrs/week on manual reporting', stakeholderId: 'stake-005' },
            { id: 'km-010', timestamp: 1500, type: 'risk', description: 'Considering building in-house to save costs', stakeholderId: 'stake-004' },
          ],
          actionItems: [
            { id: 'ai-008', description: 'Send build vs buy analysis', owner: 'us', dueDate: new Date('2025-01-10'), status: 'completed', priority: 'high' },
            { id: 'ai-009', description: 'Demo tailored to their use cases', owner: 'us', dueDate: new Date('2025-01-15'), status: 'pending', priority: 'high' },
          ],
          sentiment: 'positive',
          nextSteps: 'Custom demo next week, send build vs buy analysis',
        },
      ],
      objections: [
        {
          id: 'obj-003',
          dealId: 'deal-002',
          callId: 'call-004',
          raisedBy: 'stake-004',
          category: 'features',
          description: 'Considering building in-house vs buying - concerned about long-term flexibility',
          context: 'Discovery call, discussing build vs buy tradeoffs',
          responseGiven: 'Presented build vs buy analysis showing 18-month break-even; offered pilot program',
          outcome: 'unresolved',
          effectiveness: 60,
          createdAt: new Date('2025-01-08'),
        },
      ],
      competitorMentions: [
        {
          id: 'comp-002',
          dealId: 'deal-002',
          callId: 'call-004',
          competitorName: 'Build in-house',
          context: 'Team has strong engineering capacity, evaluating internal build',
          prospectSentiment: 'positive',
          ourDifferentiation: 'Faster time-to-value, ongoing maintenance burden, opportunity cost of engineering time',
          createdAt: new Date('2025-01-08'),
        },
      ],
      pricingDiscussions: [
        {
          id: 'price-003',
          dealId: 'deal-002',
          callId: 'call-004',
          topic: 'budget',
          amountDiscussed: 50000,
          currency: 'USD',
          prospectReaction: 'neutral',
          notes: 'Indicated $50-80k budget range for analytics tooling',
          createdAt: new Date('2025-01-08'),
        },
      ],
      tags: ['startup', 'growth', 'build-vs-buy', 'analytics'],
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-12'),
      lastActivityAt: new Date('2025-01-12'),
      insights: {
        topObjections: [
          { category: 'features', count: 1, resolutionRate: 60 },
        ],
        competitorThreats: [
          { name: 'Build in-house', mentions: 1, sentiment: 'positive' },
        ],
        stakeholderMap: [
          { stakeholderId: 'stake-004', influence: 'decision-maker', sentiment: 'positive', riskLevel: 'medium' },
          { stakeholderId: 'stake-005', influence: 'high', sentiment: 'positive', riskLevel: 'low' },
        ],
        pricingSensitivity: 'medium',
        recommendedApproach: 'Emphasize speed to value and opportunity cost; pilot program reduces risk; quantify engineering hours saved',
        riskFactors: ['Strong internal engineering team favors build', 'Early stage - limited budget certainty', 'No formal procurement process'],
        buyingSignals: ['20hrs/week manual reporting pain', 'Head of Data engaged and positive', 'Budget range aligns with our pricing'],
        nextBestAction: 'Deliver custom demo showing their exact use cases; follow up with pilot proposal',
        confidenceScore: 58,
        generatedAt: new Date('2025-01-12'),
      },
    },
    {
      id: 'deal-003',
      name: 'GlobalRetail - Analytics Modernization',
      company: 'GlobalRetail Holdings',
      stage: 'qualification',
      value: 500000,
      currency: 'USD',
      probability: 35,
      expectedCloseDate: new Date('2025-03-31'),
      owner: 'Sarah Chen',
      stakeholders: [
        {
          id: 'stake-006',
          name: 'Jennifer Walsh',
          role: 'VP Data & Analytics',
          email: 'j.walsh@globalretail.com',
          influence: 'decision-maker',
          sentiment: 'neutral',
          concerns: ['Scale requirements', 'Multi-region compliance'],
          lastInteraction: new Date('2025-01-09'),
        },
        {
          id: 'stake-007',
          name: 'Robert Kim',
          role: 'Enterprise Architect',
          email: 'r.kim@globalretail.com',
          influence: 'high',
          sentiment: 'negative',
          concerns: ['Vendor consolidation mandate', 'Existing Snowflake investment'],
          lastInteraction: new Date('2025-01-09'),
        },
      ],
      calls: [
        {
          id: 'call-005',
          dealId: 'deal-003',
          date: new Date('2025-01-09'),
          duration: 40,
          participants: ['stake-006', 'stake-007'],
          summary: 'Qualification call - large retailer modernizing analytics stack. Strong Snowflake incumbent, vendor consolidation pressure.',
          keyMoments: [
            { id: 'km-011', timestamp: 300, type: 'competitor', description: 'Heavy Snowflake investment, 3-year contract', stakeholderId: 'stake-007' },
            { id: 'km-012', timestamp: 1800, type: 'risk', description: 'Corporate mandate to reduce vendor count', stakeholderId: 'stake-007' },
            { id: 'km-013', timestamp: 2100, type: 'buying-signal', description: 'VP Data frustrated with Snowflake costs and rigidity', stakeholderId: 'stake-006' },
          ],
          actionItems: [
            { id: 'ai-010', description: 'Map integration points with Snowflake', owner: 'us', dueDate: new Date('2025-01-14'), status: 'in-progress', priority: 'high' },
            { id: 'ai-011', description: 'Prepare cost comparison vs Snowflake', owner: 'us', dueDate: new Date('2025-01-16'), status: 'pending', priority: 'high' },
          ],
          sentiment: 'neutral',
          nextSteps: 'Technical workshop with architecture team, cost analysis',
        },
      ],
      objections: [
        {
          id: 'obj-004',
          dealId: 'deal-003',
          callId: 'call-005',
          raisedBy: 'stake-007',
          category: 'competitor',
          description: 'Existing 3-year Snowflake contract, vendor consolidation mandate',
          context: 'Qualification call, discussing current stack and constraints',
          responseGiven: 'Positioned as complementary layer, not replacement; highlighted cost savings on specific workloads',
          outcome: 'unresolved',
          effectiveness: 40,
          createdAt: new Date('2025-01-09'),
        },
      ],
      competitorMentions: [
        {
          id: 'comp-003',
          dealId: 'deal-003',
          callId: 'call-005',
          competitorName: 'Snowflake',
          context: 'Primary data warehouse, 3-year contract signed 6 months ago',
          prospectSentiment: 'negative',
          ourDifferentiation: 'Complementary for real-time/streaming workloads; 40% cost reduction on ELT; zero-copy integration',
          createdAt: new Date('2025-01-09'),
        },
      ],
      pricingDiscussions: [],
      tags: ['enterprise', 'retail', 'snowflake', 'vendor-consolidation', 'modernization'],
      createdAt: new Date('2025-01-07'),
      updatedAt: new Date('2025-01-09'),
      lastActivityAt: new Date('2025-01-09'),
      insights: {
        topObjections: [
          { category: 'competitor', count: 1, resolutionRate: 40 },
        ],
        competitorThreats: [
          { name: 'Snowflake', mentions: 1, sentiment: 'negative' },
        ],
        stakeholderMap: [
          { stakeholderId: 'stake-006', influence: 'decision-maker', sentiment: 'neutral', riskLevel: 'medium' },
          { stakeholderId: 'stake-007', influence: 'high', sentiment: 'negative', riskLevel: 'high' },
        ],
        pricingSensitivity: 'medium',
        recommendedApproach: 'Focus on VP Data pain points (cost, rigidity); position as complement not replacement; engage Enterprise Architect with technical integration story',
        riskFactors: ['Vendor consolidation mandate', 'Recent Snowflake contract', 'Enterprise Architect opposition', 'Long sales cycle expected'],
        buyingSignals: ['VP Data frustrated with current costs', 'Specific workload pain points identified', 'Large deal size indicates strategic priority'],
        nextBestAction: 'Technical workshop showing Snowflake integration; ROI model for specific workloads',
        confidenceScore: 38,
        generatedAt: new Date('2025-01-09'),
      },
    },
  ];
  return sampleDeals;
};

// Storage functions
export const getDeals = (): Deal[] => {
  if (typeof window === 'undefined') return initializeSampleData();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const sample = initializeSampleData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    return sample;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initializeSampleData();
  }
};

export const saveDeals = (deals: Deal[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
};

export const getDeal = (id: string): Deal | undefined => {
  const deals = getDeals();
  return deals.find(d => d.id === id);
};

export const saveDeal = (deal: Deal): void => {
  const deals = getDeals();
  const index = deals.findIndex(d => d.id === deal.id);
  if (index >= 0) {
    deals[index] = { ...deal, updatedAt: new Date(), lastActivityAt: new Date() };
  } else {
    deals.push({ ...deal, createdAt: new Date(), updatedAt: new Date(), lastActivityAt: new Date() });
  }
  saveDeals(deals);
};

export const deleteDeal = (id: string): void => {
  const deals = getDeals().filter(d => d.id !== id);
  saveDeals(deals);
};

// Playbook functions
export const getPlaybook = (): ObjectionPlaybook[] => {
  if (typeof window === 'undefined') return getDefaultPlaybook();
  const stored = localStorage.getItem(PLAYBOOK_KEY);
  if (!stored) {
    const defaultPb = getDefaultPlaybook();
    localStorage.setItem(PLAYBOOK_KEY, JSON.stringify(defaultPb));
    return defaultPb;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultPlaybook();
  }
};

export const savePlaybook = (playbook: ObjectionPlaybook[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAYBOOK_KEY, JSON.stringify(playbook));
};

const getDefaultPlaybook = (): ObjectionPlaybook[] => [
  {
    id: 'pb-001',
    category: 'price',
    triggerPatterns: ['too expensive', 'over budget', 'can\'t afford', 'price is high', 'discount', 'cheaper alternative'],
    successfulResponses: [
      {
        id: 'sr-001',
        objectionId: 'obj-001',
        response: 'Presented ROI calculator showing 3.2x return in 18 months; offered 15% discount for 3-year commitment',
        context: 'Enterprise deal, procurement-led objection',
        effectiveness: 75,
        dealOutcome: 'in-progress',
        usedAt: new Date('2025-01-10'),
      },
      {
        id: 'sr-002',
        objectionId: 'obj-005',
        response: 'Reframed as cost per seat per day ($2.50); showed cost of inaction ($50k/month in lost productivity)',
        context: 'Mid-market deal, budget-conscious buyer',
        effectiveness: 85,
        dealOutcome: 'won',
        usedAt: new Date('2024-11-15'),
      },
    ],
    failedResponses: [
      {
        id: 'fr-001',
        objectionId: 'obj-003',
        response: 'Immediately offered 20% discount without understanding budget constraints',
        context: 'Early stage deal, weakened position',
        reason: 'Anchored low, lost leverage, procurement pushed for more',
        usedAt: new Date('2024-10-20'),
      },
    ],
    bestPractice: 'Lead with value/ROI before discounting. Anchor to business outcomes. Use multi-year terms to protect unit economics. Offer creative packaging (pilot, phased rollout) before pure price cuts.',
    usageCount: 47,
    lastUpdated: new Date('2025-01-15'),
  },
  {
    id: 'pb-002',
    category: 'competitor',
    triggerPatterns: ['evaluating [competitor]', 'already using [competitor]', '[competitor] is cheaper', '[competitor] has feature', 'happy with [competitor]'],
    successfulResponses: [
      {
        id: 'sr-003',
        objectionId: 'obj-004',
        response: 'Positioned as complementary layer for streaming/real-time; showed 40% cost reduction on ELT workloads; zero-copy Snowflake integration',
        context: 'Enterprise with existing Snowflake contract',
        effectiveness: 65,
        dealOutcome: 'in-progress',
        usedAt: new Date('2025-01-09'),
      },
      {
        id: 'sr-004',
        objectionId: 'obj-006',
        response: 'Acknowledged competitor strength; mapped 3 specific gaps to prospect\'s stated priorities; offered baked-in migration path',
        context: 'Competitive displacement, mid-market',
        effectiveness: 90,
        dealOutcome: 'won',
        usedAt: new Date('2024-12-05'),
      },
    ],
    failedResponses: [
      {
        id: 'fr-002',
        objectionId: 'obj-007',
        response: 'Bashed competitor aggressively; made prospect defensive',
        context: 'Champion was former competitor customer',
        reason: 'Attacked prospect\'s past decision; lost trust',
        usedAt: new Date('2024-09-10'),
      },
    ],
    bestPractice: 'Never bash competitors. Acknowledge their strengths. Map your differentiation to THEIR stated priorities (not your feature list). Offer risk-free evaluation (pilot, POC, side-by-side). Leverage champion to influence internally.',
    usageCount: 32,
    lastUpdated: new Date('2025-01-09'),
  },
  {
    id: 'pb-003',
    category: 'timeline',
    triggerPatterns: ['not ready', 'next quarter', 'too busy', 'implementation takes too long', 'no bandwidth', 'timeline'],
    successfulResponses: [
      {
        id: 'sr-005',
        objectionId: 'obj-008',
        response: 'Offered 2-week pilot with pre-built templates; showed 80% value in first 30 days; phased rollout plan',
        context: 'Resource-constrained team, urgent need',
        effectiveness: 80,
        dealOutcome: 'won',
        usedAt: new Date('2024-11-28'),
      },
    ],
    failedResponses: [
      {
        id: 'fr-003',
        objectionId: 'obj-009',
        response: 'Pushed for immediate signature; ignored their capacity constraints',
        context: 'End of quarter pressure',
        reason: 'Damaged relationship; deal slipped to next year',
        usedAt: new Date('2024-09-30'),
      },
    ],
    bestPractice: 'Respect their timeline. Offer low-lift entry points (pilot, POC, sandbox). Show quick wins. Build phased roadmap aligned to their capacity. Use urgency from THEIR pain, not your quota.',
    usageCount: 18,
    lastUpdated: new Date('2024-11-28'),
  },
  {
    id: 'pb-004',
    category: 'features',
    triggerPatterns: ['missing feature', 'doesn\'t do X', 'need Y capability', 'build in-house', 'custom requirement'],
    successfulResponses: [
      {
        id: 'sr-006',
        objectionId: 'obj-003',
        response: 'Build vs buy analysis: 18-month break-even, 3 FTEs ongoing maintenance; offered pilot to prove value first',
        context: 'Technical founder considering internal build',
        effectiveness: 60,
        dealOutcome: 'in-progress',
        usedAt: new Date('2025-01-08'),
      },
      {
        id: 'sr-007',
        objectionId: 'obj-010',
        response: 'Mapped request to roadmap (Q2 delivery); offered interim workaround; committed to co-design session',
        context: 'Enterprise feature gap, strategic deal',
        effectiveness: 88,
        dealOutcome: 'won',
        usedAt: new Date('2024-10-15'),
      },
    ],
    failedResponses: [
      {
        id: 'fr-004',
        objectionId: 'obj-011',
        response: 'Promised custom feature delivery in 60 days without engineering validation',
        context: 'Desperate to close',
        reason: 'Engineering couldn\'t deliver; lost credibility; deal lost',
        usedAt: new Date('2024-08-20'),
      },
    ],
    bestPractice: 'Be honest about gaps. Quantify build vs buy (time, cost, opportunity cost). Offer workarounds. Involve product/engineering for custom asks - never overpromise. Pilot programs de-risk for both sides.',
    usageCount: 24,
    lastUpdated: new Date('2025-01-08'),
  },
  {
    id: 'pb-005',
    category: 'trust',
    triggerPatterns: ['how do I know', 'references', 'proof', 'risk', 'guarantee', 'startup risk', 'vendor stability'],
    successfulResponses: [
      {
        id: 'sr-008',
        objectionId: 'obj-012',
        response: 'Provided 3 relevant reference calls; shared SOC2 report; offered contract SLA with penalties; pilot with success criteria',
        context: 'Risk-averse enterprise buyer',
        effectiveness: 92,
        dealOutcome: 'won',
        usedAt: new Date('2024-12-10'),
      },
    ],
    failedResponses: [
      {
        id: 'fr-005',
        objectionId: 'obj-013',
        response: 'Dismissed concerns as "standard startup risk"; sent generic case studies',
        context: 'Fortune 500 procurement',
        reason: 'Didn\'t address specific fears; felt dismissive',
        usedAt: new Date('2024-07-15'),
      },
    ],
    bestPractice: 'Take concerns seriously. Provide specific, relevant proof (references, certifications, SLAs). Offer risk-reversal mechanisms (pilot, opt-out, success criteria). Transparency builds trust more than perfection.',
    usageCount: 15,
    lastUpdated: new Date('2024-12-10'),
  },
  {
    id: 'pb-006',
    category: 'implementation',
    triggerPatterns: ['migration', 'integration', 'setup time', 'technical complexity', 'resources', 'change management'],
    successfulResponses: [
      {
        id: 'sr-009',
        objectionId: 'obj-014',
        response: 'Presented 30-60-90 day implementation plan; dedicated CSM; pre-built connectors; migration tooling; change management kit',
        context: 'Complex enterprise migration',
        effectiveness: 85,
        dealOutcome: 'won',
        usedAt: new Date('2024-11-20'),
      },
    ],
    failedResponses: [
      {
        id: 'fr-006',
        objectionId: 'obj-015',
        response: 'Said "it\'s easy, just connect API" without understanding their stack',
        context: 'Technical buyer with legacy systems',
        reason: 'Oversimplified; lost technical credibility',
        usedAt: new Date('2024-06-10'),
      },
    ],
    bestPractice: 'Show detailed implementation plan with milestones. Acknowledge complexity. Provide dedicated resources (CSM, solutions engineer). Share customer migration stories. Offer tooling/accelerators. Change management is often harder than tech.',
    usageCount: 21,
    lastUpdated: new Date('2024-11-20'),
  },
];

// AI Insight Generation
export const generateDealInsights = (deal: Deal): DealInsights => {
  const objectionsByCategory = deal.objections.reduce((acc, obj) => {
    if (!acc[obj.category]) acc[obj.category] = { total: 0, resolved: 0 };
    acc[obj.category].total++;
    if (obj.outcome === 'resolved' || obj.outcome === 'partially-resolved') acc[obj.category].resolved++;
    return acc;
  }, {} as Record<string, { total: number; resolved: number }>);

  const topObjections = Object.entries(objectionsByCategory)
    .map(([category, data]) => ({
      category,
      count: data.total,
      resolutionRate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const competitorThreats = deal.competitorMentions.reduce((acc, cm) => {
    if (!acc[cm.competitorName]) acc[cm.competitorName] = { mentions: 0, sentiments: [] };
    acc[cm.competitorName].mentions++;
    acc[cm.competitorName].sentiments.push(cm.prospectSentiment);
    return acc;
  }, {} as Record<string, { mentions: number; sentiments: string[] }>);

  const competitorThreatsList = Object.entries(competitorThreats).map(([name, data]) => ({
    name,
    mentions: data.mentions,
    sentiment: data.sentiments.length > 0 ? data.sentiments[data.sentiments.length - 1] : 'neutral',
  }));

  const stakeholderMap = deal.stakeholders.map(s => ({
    stakeholderId: s.id,
    influence: s.influence,
    sentiment: s.sentiment,
    riskLevel: ((s.influence === 'decision-maker' || s.influence === 'high') && s.sentiment === 'negative' ? 'high' :
               (s.influence === 'medium' && s.sentiment === 'negative') ? 'medium' : 'low') as 'low' | 'medium' | 'high',
  }));

  const pricingDiscussions = deal.pricingDiscussions;
  const pushedBackCount = pricingDiscussions.filter(p => p.prospectReaction === 'pushed-back' || p.prospectReaction === 'negative').length;
  const pricingSensitivity = pushedBackCount > 1 ? 'high' : pushedBackCount > 0 ? 'medium' : 'low';

  const buyingSignals: string[] = [];
  deal.calls.forEach(call => {
    call.keyMoments.filter(km => km.type === 'buying-signal' || km.type === 'champion').forEach(km => {
      buyingSignals.push(km.description);
    });
  });

  const riskFactors: string[] = [];
  if (pricingSensitivity === 'high') riskFactors.push('High pricing sensitivity');
  deal.stakeholders.filter(s => s.sentiment === 'negative' && (s.influence === 'high' || s.influence === 'decision-maker')).forEach(s => {
    riskFactors.push(`${s.role} (${s.name}) has negative sentiment`);
  });
  if (competitorThreatsList.length > 0) riskFactors.push(`Active competitor evaluation: ${competitorThreatsList.map(c => c.name).join(', ')}`);
  const unresolvedObjections = deal.objections.filter(o => o.outcome === 'unresolved').length;
  if (unresolvedObjections > 0) riskFactors.push(`${unresolvedObjections} unresolved objection(s)`);

  const stageWeights = { discovery: 10, qualification: 25, proposal: 45, negotiation: 70, 'closed-won': 100, 'closed-lost': 0 };
  const baseScore = stageWeights[deal.stage];
  const sentimentBonus = deal.stakeholders.filter(s => s.sentiment === 'positive').length * 5;
  const objectionPenalty = deal.objections.filter(o => o.outcome === 'unresolved').length * 10;
  const competitorPenalty = competitorThreatsList.filter(c => c.sentiment === 'positive' || c.sentiment === 'comparing').length * 15;
  const confidenceScore = Math.max(0, Math.min(100, baseScore + sentimentBonus - objectionPenalty - competitorPenalty));

  let recommendedApproach = '';
  if (deal.stage === 'discovery' || deal.stage === 'qualification') {
    recommendedApproach = 'Deepen discovery on pain points and impact; identify all stakeholders; quantify cost of inaction';
  } else if (deal.stage === 'proposal') {
    recommendedApproach = 'Address open objections with playbook responses; differentiate vs competitors; build champion engagement';
  } else if (deal.stage === 'negotiation') {
    recommendedApproach = 'Finalize pricing with creative packaging; resolve contract terms; leverage champions for internal selling';
  }

  const nextBestAction = buyingSignals.length > 0
    ? `Capitalize on: ${buyingSignals[0]}`
    : riskFactors.length > 0
    ? `Mitigate: ${riskFactors[0]}`
    : 'Continue discovery and stakeholder mapping';

  return {
    topObjections,
    competitorThreats: competitorThreatsList,
    stakeholderMap,
    pricingSensitivity,
    recommendedApproach,
    riskFactors,
    buyingSignals,
    nextBestAction,
    confidenceScore,
    generatedAt: new Date(),
  };
};

// Briefing Generation
export const generateBriefing = (deal: Deal, callNumber: number): Briefing => {
  const insights = deal.insights || generateDealInsights(deal);

  const stakeholderUpdates: Briefing['stakeholderUpdates'] = deal.stakeholders.map(s => {
    const lastCall = deal.calls
      .filter(c => c.participants.includes(s.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return {
      stakeholderId: s.id,
      name: s.name,
      role: s.role,
      sentimentChange: lastCall ? (lastCall.sentiment === 'positive' ? 'improved' : lastCall.sentiment === 'negative' ? 'declined' : 'stable') : 'stable',
      newConcerns: s.concerns,
      engagementLevel: deal.calls.filter(c => c.participants.includes(s.id)).length > 2 ? 'high' : deal.calls.filter(c => c.participants.includes(s.id)).length > 0 ? 'medium' : 'low',
      lastInteraction: s.lastInteraction,
    };
  });

  const objectionStatus: Briefing['objectionStatus'] = deal.objections.map(obj => {
    const playbook = getPlaybook().find(p => p.category === obj.category);
    const previousResponses = playbook?.successfulResponses
      .filter(sr => sr.objectionId === obj.id)
      .map(sr => ({ response: sr.response, effectiveness: sr.effectiveness, date: sr.usedAt })) || [];

    return {
      objectionId: obj.id,
      category: obj.category,
      description: obj.description,
      status: obj.outcome === 'resolved' ? 'resolved' : obj.outcome === 'escalated' ? 'escalated' : 'active',
      recommendedResponse: playbook?.bestPractice || 'Review playbook for this objection category',
      previousResponses,
    };
  });

  const competitorIntel = deal.competitorMentions.reduce((acc, cm) => {
    if (!acc[cm.competitorName]) {
      acc[cm.competitorName] = {
        competitorName: cm.competitorName,
        mentions: 0,
        lastMentioned: cm.createdAt,
        prospectSentiment: cm.prospectSentiment,
        ourWinThemes: cm.ourDifferentiation ? [cm.ourDifferentiation] : [],
        theirWeaknesses: [],
      };
    }
    acc[cm.competitorName].mentions++;
    if (new Date(cm.createdAt).getTime() > new Date(acc[cm.competitorName].lastMentioned).getTime()) {
      acc[cm.competitorName].lastMentioned = cm.createdAt;
      acc[cm.competitorName].prospectSentiment = cm.prospectSentiment;
    }
    if (cm.ourDifferentiation && !acc[cm.competitorName].ourWinThemes.includes(cm.ourDifferentiation)) {
      acc[cm.competitorName].ourWinThemes.push(cm.ourDifferentiation);
    }
    return acc;
  }, {} as Record<string, Briefing['competitorIntel'][0]>);

  const competitorIntelArray = Object.values(competitorIntel);

  const pricingPosition: Briefing['pricingPosition'] = {
    lastDiscussed: deal.pricingDiscussions.length > 0
      ? deal.pricingDiscussions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : new Date(0),
    budgetRange: deal.pricingDiscussions.find(p => p.topic === 'budget')?.amountDiscussed
      ? `$${(deal.pricingDiscussions.find(p => p.topic === 'budget')!.amountDiscussed! / 1000).toFixed(0)}k`
      : undefined,
    discountRequested: deal.pricingDiscussions.find(p => p.topic === 'discount')?.amountDiscussed
      ? Math.round((1 - deal.pricingDiscussions.find(p => p.topic === 'discount')!.amountDiscussed! / deal.value) * 100)
      : undefined,
    packagingDiscussed: Array.from(new Set(deal.pricingDiscussions.map(p => p.topic))),
    recommendedStrategy: insights.pricingSensitivity === 'high'
      ? 'Lead with ROI/cost of inaction; offer multi-year for discount; creative packaging over pure price cuts'
      : insights.pricingSensitivity === 'medium'
      ? 'Anchor to value; limited discount for commitment; emphasize TCO'
      : 'Hold price; focus on value expansion; upsell premium features',
  };

  const recommendedTalkTrack: Briefing['recommendedTalkTrack'] = [
    {
      topic: 'Opening - Recap & Alignment',
      keyPoints: [
        `Last call: ${deal.calls[deal.calls.length - 1]?.summary || 'First call'}`,
        `Key stakeholders: ${deal.stakeholders.filter(s => s.influence === 'decision-maker' || s.influence === 'high').map(s => s.name).join(', ')}`,
        `Deal stage: ${deal.stage}, Probability: ${deal.probability}%`,
      ],
      objectionHandlers: [],
    },
    {
      topic: 'Objection Handling',
      keyPoints: deal.objections.filter(o => o.outcome !== 'resolved').map(o => `${o.category}: ${o.description}`),
      objectionHandlers: deal.objections.filter(o => o.outcome !== 'resolved').map(o => {
        const pb = getPlaybook().find(p => p.category === o.category);
        return pb?.bestPractice || 'Address directly with value/ROI framing';
      }),
    },
    {
      topic: 'Competitive Positioning',
      keyPoints: deal.competitorMentions.map(cm => `${cm.competitorName}: ${cm.context}`),
      objectionHandlers: deal.competitorMentions.map(cm => cm.ourDifferentiation || 'Differentiate on value, not features'),
    },
    {
      topic: 'Pricing & Value',
      keyPoints: [
        `Current value: $${(deal.value / 1000).toFixed(0)}k`,
        `Budget discussed: ${pricingPosition.budgetRange || 'Not disclosed'}`,
        `Discount requested: ${pricingPosition.discountRequested ? `${pricingPosition.discountRequested}%` : 'None'}`,
      ],
      objectionHandlers: [pricingPosition.recommendedStrategy],
    },
    {
      topic: 'Stakeholder-Specific',
      keyPoints: [],
      objectionHandlers: [],
      stakeholderSpecific: deal.stakeholders
        .filter(s => s.influence === 'decision-maker' || s.influence === 'high')
        .map(s => ({
          stakeholderId: s.id,
          tailoredPoints: [
            `Sentiment: ${s.sentiment}`,
            `Concerns: ${s.concerns.join(', ') || 'None stated'}`,
            s.sentiment === 'negative' ? 'PRIORITY: Address concerns directly' : 'Reinforce value, ask for advocacy',
          ],
        })),
    },
    {
      topic: 'Closing / Next Steps',
      keyPoints: [
        insights.nextBestAction,
        `Risk factors: ${insights.riskFactors.slice(0, 2).join('; ')}`,
        `Buying signals: ${insights.buyingSignals.slice(0, 2).join('; ')}`,
      ],
      objectionHandlers: [],
    },
  ];

  const riskAssessment: Briefing['riskAssessment'] = {
    overallRisk: insights.confidenceScore > 70 ? 'low' : insights.confidenceScore > 40 ? 'medium' : 'high',
    factors: insights.riskFactors.map(f => ({
      factor: f,
      severity: f.includes('High pricing') || f.includes('negative sentiment') ? 'high' : 'medium',
      mitigation: f.includes('pricing') ? 'ROI framing, multi-year terms' :
                  f.includes('sentiment') ? 'Direct 1:1 engagement, executive alignment' :
                  f.includes('competitor') ? 'Differentiation workshop, pilot' :
                  f.includes('objection') ? 'Playbook response, escalate if needed' : 'Monitor',
    })),
    dealHealthScore: insights.confidenceScore,
  };

  return {
    id: `briefing-${deal.id}-${callNumber}`,
    dealId: deal.id,
    callNumber,
    generatedAt: new Date(),
    executiveSummary: `${deal.name} (${deal.stage}, ${deal.probability}%): ${insights.confidenceScore}% confidence. ${insights.riskFactors.length} risk factors, ${insights.buyingSignals.length} buying signals. Next: ${insights.nextBestAction}`,
    stakeholderUpdates,
    objectionStatus,
    competitorIntel: Object.values(competitorIntel),
    pricingPosition,
    recommendedTalkTrack,
    riskAssessment,
    confidenceLevel: insights.confidenceScore > 70 ? 'high' : insights.confidenceScore > 40 ? 'medium' : 'low',
  };
};

// Call processing - extracts insights from transcript/notes
export const processCall = (dealId: string, callData: Partial<Call> & { transcript?: string }): Call => {
  const deal = getDeal(dealId)!;
  const callNumber = deal.calls.length + 1;

  // In a real implementation, this would use NLP/LLM to extract:
  // - Objections
  // - Competitor mentions
  // - Pricing discussions
  // - Key moments
  // - Action items
  // - Sentiment

  // For demo, we'll simulate extraction based on keywords
  const transcript = callData.transcript || '';
  const keyMoments: KeyMoment[] = [];
  const objections: Objection[] = [];
  const competitorMentions: CompetitorMention[] = [];
  const pricingDiscussions: PricingDiscussion[] = [];

  // Simple keyword-based extraction (placeholder for LLM)
  const lowerTranscript = transcript.toLowerCase();

  // Objection detection
  if (lowerTranscript.includes('price') || lowerTranscript.includes('budget') || lowerTranscript.includes('expensive') || lowerTranscript.includes('discount')) {
    keyMoments.push({
      id: `km-${Date.now()}-1`,
      timestamp: 0,
      type: 'objection',
      description: 'Pricing concern raised',
    });
    objections.push({
      id: `obj-${Date.now()}`,
      dealId,
      callId: `call-${Date.now()}`,
      raisedBy: callData.participants?.[0] || 'unknown',
      category: 'price',
      description: 'Pricing concern mentioned in call',
      context: transcript.substring(0, 200),
      responseGiven: 'To be addressed',
      outcome: 'unresolved',
      effectiveness: 0,
      createdAt: new Date(),
    });
  }

  // Competitor detection
  const competitors = ['snowflake', 'databricks', 'redshift', 'bigquery', 'synapse', 'build in-house', 'internal'];
  competitors.forEach(comp => {
    if (lowerTranscript.includes(comp)) {
      keyMoments.push({
        id: `km-${Date.now()}-comp-${comp}`,
        timestamp: 0,
        type: 'competitor',
        description: `Mentioned ${comp}`,
      });
      competitorMentions.push({
        id: `comp-${Date.now()}-${comp}`,
        dealId,
        callId: `call-${Date.now()}`,
        competitorName: comp,
        context: transcript.substring(0, 200),
        prospectSentiment: 'comparing',
        createdAt: new Date(),
      });
    }
  });

  // Buying signals
  if (lowerTranscript.includes('timeline') || lowerTranscript.includes('urgent') || lowerTranscript.includes('need') || lowerTranscript.includes('implementation')) {
    keyMoments.push({
      id: `km-${Date.now()}-buying`,
      timestamp: 0,
      type: 'buying-signal',
      description: 'Buying intent signaled',
    });
  }

  const newCall: Call = {
    id: `call-${Date.now()}`,
    dealId,
    date: callData.date || new Date(),
    duration: callData.duration || 0,
    participants: callData.participants || [],
    transcript: callData.transcript,
    summary: callData.summary || `Call ${callNumber} - ${new Date().toLocaleDateString()}`,
    keyMoments,
    actionItems: callData.actionItems || [],
    sentiment: callData.sentiment || 'neutral',
    nextSteps: callData.nextSteps || '',
  };

  // Update deal with new call and extracted insights
  const updatedDeal = { ...deal };
  updatedDeal.calls.push(newCall);
  updatedDeal.objections.push(...objections);
  updatedDeal.competitorMentions.push(...competitorMentions);
  updatedDeal.pricingDiscussions.push(...pricingDiscussions);
  updatedDeal.insights = generateDealInsights(updatedDeal);
  updatedDeal.lastActivityAt = new Date();
  updatedDeal.updatedAt = new Date();

  saveDeal(updatedDeal);

  return newCall;
};

// Update playbook with new successful/failed response
export const updatePlaybookResponse = (
  category: Objection['category'],
  objectionId: string,
  response: string,
  context: string,
  effectiveness: number,
  dealOutcome: 'won' | 'lost' | 'in-progress',
  isSuccess: boolean
): void => {
  const playbook = getPlaybook();
  const pbIndex = playbook.findIndex(p => p.category === category);
  if (pbIndex === -1) return;

  const entry = {
    id: `${isSuccess ? 'sr' : 'fr'}-${Date.now()}`,
    objectionId,
    response,
    context,
    effectiveness,
    dealOutcome,
    usedAt: new Date(),
  } as (SuccessfulResponse | FailedResponse);

  if (isSuccess) {
    (entry as SuccessfulResponse).dealOutcome = dealOutcome;
    playbook[pbIndex].successfulResponses.push(entry as SuccessfulResponse);
  } else {
    (entry as FailedResponse).reason = context; // context serves as reason for failure
    playbook[pbIndex].failedResponses.push(entry as FailedResponse);
  }

  playbook[pbIndex].usageCount++;
  playbook[pbIndex].lastUpdated = new Date();

  savePlaybook(playbook);
};

// Get deal statistics for dashboard
export const getDealStats = () => {
  const deals = getDeals();
  return {
    totalDeals: deals.length,
    totalValue: deals.reduce((sum, d) => sum + d.value, 0),
    weightedPipeline: deals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0),
    byStage: deals.reduce((acc, d) => {
      acc[d.stage] = (acc[d.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    avgDealSize: deals.length > 0 ? deals.reduce((sum, d) => sum + d.value, 0) / deals.length : 0,
    winRate: deals.filter(d => d.stage === 'closed-won').length / Math.max(1, deals.filter(d => d.stage === 'closed-won' || d.stage === 'closed-lost').length) * 100,
    avgConfidence: deals.length > 0 ? deals.reduce((sum, d) => sum + (d.insights?.confidenceScore || 0), 0) / deals.length : 0,
  };
};