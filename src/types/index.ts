export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email?: string;
  influence: 'low' | 'medium' | 'high' | 'decision-maker';
  sentiment: 'positive' | 'neutral' | 'negative';
  concerns: string[];
  lastInteraction: Date;
}

export interface Objection {
  id: string;
  dealId: string;
  callId: string;
  raisedBy: string; // stakeholder id
  category: 'price' | 'competitor' | 'timeline' | 'features' | 'trust' | 'implementation' | 'contract-terms' | 'other';
  description: string;
  context: string; // what was being discussed when raised
  responseGiven: string;
  outcome: 'unresolved' | 'partially-resolved' | 'resolved' | 'escalated';
  effectiveness: number; // 0-100, how well the response worked
  createdAt: Date;
  resolvedAt?: Date;
}

export interface CompetitorMention {
  id: string;
  dealId: string;
  callId: string;
  competitorName: string;
  context: string;
  prospectSentiment: 'positive' | 'neutral' | 'negative' | 'comparing';
  ourDifferentiation?: string;
  createdAt: Date;
}

export interface PricingDiscussion {
  id: string;
  dealId: string;
  callId: string;
  topic: 'budget' | 'discount' | 'packaging' | 'roi' | 'contract-terms' | 'payment-terms';
  amountDiscussed?: number;
  currency?: string;
  prospectReaction: 'positive' | 'neutral' | 'negative' | 'pushed-back';
  notes: string;
  createdAt: Date;
}

export interface Call {
  id: string;
  dealId: string;
  date: Date;
  duration: number; // minutes
  participants: string[]; // stakeholder ids
  transcript?: string;
  summary: string;
  keyMoments: KeyMoment[];
  actionItems: ActionItem[];
  sentiment: 'positive' | 'neutral' | 'negative';
  nextSteps: string;
}

export interface KeyMoment {
  id: string;
  timestamp: number; // seconds into call
  type: 'objection' | 'competitor' | 'pricing' | 'buying-signal' | 'decision-maker' | 'champion' | 'risk';
  description: string;
  stakeholderId?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  owner: string; // stakeholder id or 'us'
  dueDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Deal {
  id: string;
  name: string;
  company: string;
  stage: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  currency: string;
  probability: number; // 0-100
  expectedCloseDate: Date;
  owner: string; // sales rep
  stakeholders: Stakeholder[];
  calls: Call[];
  objections: Objection[];
  competitorMentions: CompetitorMention[];
  pricingDiscussions: PricingDiscussion[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  // AI-generated insights
  insights: DealInsights;
}

export interface DealInsights {
  topObjections: { category: string; count: number; resolutionRate: number }[];
  competitorThreats: { name: string; mentions: number; sentiment: string }[];
  stakeholderMap: { stakeholderId: string; influence: string; sentiment: string; riskLevel: 'low' | 'medium' | 'high' }[];
  pricingSensitivity: 'low' | 'medium' | 'high';
  recommendedApproach: string;
  riskFactors: string[];
  buyingSignals: string[];
  nextBestAction: string;
  confidenceScore: number; // 0-100
  generatedAt: Date;
}

export interface ObjectionPlaybook {
  id: string;
  category: Objection['category'];
  triggerPatterns: string[];
  successfulResponses: SuccessfulResponse[];
  failedResponses: FailedResponse[];
  bestPractice: string;
  usageCount: number;
  lastUpdated: Date;
}

export interface SuccessfulResponse {
  id: string;
  objectionId: string;
  response: string;
  context: string;
  effectiveness: number;
  dealOutcome: 'won' | 'lost' | 'in-progress';
  usedAt: Date;
}

export interface FailedResponse {
  id: string;
  objectionId: string;
  response: string;
  context: string;
  reason: string;
  usedAt: Date;
}

export interface Briefing {
  id: string;
  dealId: string;
  callNumber: number;
  generatedAt: Date;
  executiveSummary: string;
  stakeholderUpdates: StakeholderUpdate[];
  objectionStatus: ObjectionStatus[];
  competitorIntel: CompetitorIntel[];
  pricingPosition: PricingPosition;
  recommendedTalkTrack: TalkTrack[];
  riskAssessment: RiskAssessment;
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface StakeholderUpdate {
  stakeholderId: string;
  name: string;
  role: string;
  sentimentChange: 'improved' | 'stable' | 'declined';
  newConcerns: string[];
  engagementLevel: 'low' | 'medium' | 'high';
  lastInteraction: Date;
}

export interface ObjectionStatus {
  objectionId: string;
  category: string;
  description: string;
  status: 'active' | 'resolved' | 'escalated';
  recommendedResponse: string;
  previousResponses: { response: string; effectiveness: number; date: Date }[];
}

export interface CompetitorIntel {
  competitorName: string;
  mentions: number;
  lastMentioned: Date;
  prospectSentiment: string;
  ourWinThemes: string[];
  theirWeaknesses: string[];
}

export interface PricingPosition {
  lastDiscussed: Date;
  budgetRange?: string;
  discountRequested?: number;
  packagingDiscussed: string[];
  recommendedStrategy: string;
}

export interface TalkTrack {
  topic: string;
  keyPoints: string[];
  objectionHandlers: string[];
  stakeholderSpecific?: { stakeholderId: string; tailoredPoints: string[] }[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  factors: { factor: string; severity: 'low' | 'medium' | 'high'; mitigation: string }[];
  dealHealthScore: number; // 0-100
}