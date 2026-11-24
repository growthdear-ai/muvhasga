'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Deal, Call, Stakeholder, Objection, CompetitorMention, PricingDiscussion, Briefing, ObjectionPlaybook } from '@/types';
import {
  getDeals, saveDeal, deleteDeal, getDeal,
  getPlaybook, updatePlaybookResponse,
  generateBriefing, processCall,
  getDealStats, generateDealInsights
} from '@/lib/dealStore';

interface DealRoomContextType {
  deals: Deal[];
  selectedDeal: Deal | null;
  briefing: Briefing | null;
  playbook: ObjectionPlaybook[];
  loading: boolean;
  refreshDeals: () => void;
  selectDeal: (deal: Deal | null) => void;
  createDeal: (deal: Partial<Deal>) => Deal;
  updateDeal: (deal: Deal) => void;
  removeDeal: (id: string) => void;
  addCall: (dealId: string, callData: Partial<Call> & { transcript?: string }) => Call;
  generateBriefingForDeal: (dealId: string, callNumber: number) => Briefing;
  addObjection: (dealId: string, objection: Omit<Objection, 'id' | 'createdAt'>) => void;
  addCompetitorMention: (dealId: string, mention: Omit<CompetitorMention, 'id' | 'createdAt'>) => void;
  addPricingDiscussion: (dealId: string, discussion: Omit<PricingDiscussion, 'id' | 'createdAt'>) => void;
  updateStakeholder: (dealId: string, stakeholder: Stakeholder) => void;
  addStakeholder: (dealId: string, stakeholder: Omit<Stakeholder, 'id'>) => void;
  recordPlaybookOutcome: (category: Objection['category'], objectionId: string, response: string, context: string, effectiveness: number, dealOutcome: 'won' | 'lost' | 'in-progress', isSuccess: boolean) => void;
  stats: ReturnType<typeof getDealStats>;
}

const DealRoomContext = createContext<DealRoomContextType | undefined>(undefined);

export const DealRoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [playbook, setPlaybook] = useState<ObjectionPlaybook[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshDeals = () => {
    const freshDeals = getDeals();
    setDeals(freshDeals);
    setPlaybook(getPlaybook());
    if (selectedDeal) {
      const updated = freshDeals.find(d => d.id === selectedDeal.id);
      if (updated) setSelectedDeal(updated);
    }
  };

  useEffect(() => {
    refreshDeals();
    setLoading(false);
  }, []);

  const selectDeal = (deal: Deal | null) => {
    setSelectedDeal(deal);
    setBriefing(null);
  };

  const createDeal = (dealData: Partial<Deal>): Deal => {
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      name: dealData.name || 'New Deal',
      company: dealData.company || '',
      stage: dealData.stage || 'discovery',
      value: dealData.value || 0,
      currency: dealData.currency || 'USD',
      probability: dealData.probability || 10,
      expectedCloseDate: dealData.expectedCloseDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      owner: dealData.owner || 'Current User',
      stakeholders: dealData.stakeholders || [],
      calls: [],
      objections: [],
      competitorMentions: [],
      pricingDiscussions: [],
      tags: dealData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      insights: {
        topObjections: [],
        competitorThreats: [],
        stakeholderMap: [],
        pricingSensitivity: 'low',
        recommendedApproach: 'Begin discovery to understand pain points and stakeholders',
        riskFactors: ['Early stage - limited information'],
        buyingSignals: [],
        nextBestAction: 'Schedule discovery call',
        confidenceScore: 10,
        generatedAt: new Date(),
      },
      ...dealData,
    } as Deal;

    const allDeals = getDeals();
    allDeals.push(newDeal);
    // saveDeals is called inside saveDeal but we need to save the array
    // For now, let's use localStorage directly
    if (typeof window !== 'undefined') {
      localStorage.setItem('dealroom_deals', JSON.stringify(allDeals));
    }
    refreshDeals();
    return newDeal;
  };

  const updateDeal = (deal: Deal) => {
    saveDeal(deal);
    refreshDeals();
  };

  const removeDeal = (id: string) => {
    deleteDeal(id);
    if (selectedDeal?.id === id) setSelectedDeal(null);
    refreshDeals();
  };

  const addCall = (dealId: string, callData: Partial<Call> & { transcript?: string }) => {
    const deal = getDeal(dealId);
    if (!deal) throw new Error('Deal not found');
    const newCall = processCall(dealId, callData);
    refreshDeals();
    return newCall;
  };

  const generateBriefingForDeal = (dealId: string, callNumber: number) => {
    const deal = getDeal(dealId);
    if (!deal) throw new Error('Deal not found');
    const newBriefing = generateBriefing(deal, callNumber);
    setBriefing(newBriefing);
    return newBriefing;
  };

  const addObjection = (dealId: string, objectionData: Omit<Objection, 'id' | 'createdAt'>) => {
    const deal = getDeal(dealId);
    if (!deal) return;
    const newObjection: Objection = {
      ...objectionData,
      id: `obj-${Date.now()}`,
      createdAt: new Date(),
    };
    deal.objections.push(newObjection);
    deal.insights = generateDealInsights(deal);
    updateDeal(deal);
  };

  const addCompetitorMention = (dealId: string, mentionData: Omit<CompetitorMention, 'id' | 'createdAt'>) => {
    const deal = getDeal(dealId);
    if (!deal) return;
    const newMention: CompetitorMention = {
      ...mentionData,
      id: `comp-${Date.now()}`,
      createdAt: new Date(),
    };
    deal.competitorMentions.push(newMention);
    deal.insights = generateDealInsights(deal);
    updateDeal(deal);
  };

  const addPricingDiscussion = (dealId: string, discussionData: Omit<PricingDiscussion, 'id' | 'createdAt'>) => {
    const deal = getDeal(dealId);
    if (!deal) return;
    const newDiscussion: PricingDiscussion = {
      ...discussionData,
      id: `price-${Date.now()}`,
      createdAt: new Date(),
    };
    deal.pricingDiscussions.push(newDiscussion);
    deal.insights = generateDealInsights(deal);
    updateDeal(deal);
  };

  const updateStakeholder = (dealId: string, stakeholder: Stakeholder) => {
    const deal = getDeal(dealId);
    if (!deal) return;
    const idx = deal.stakeholders.findIndex(s => s.id === stakeholder.id);
    if (idx >= 0) {
      deal.stakeholders[idx] = stakeholder;
      deal.insights = generateDealInsights(deal);
      updateDeal(deal);
    }
  };

  const addStakeholder = (dealId: string, stakeholderData: Omit<Stakeholder, 'id'>) => {
    const deal = getDeal(dealId);
    if (!deal) return;
    const newStakeholder: Stakeholder = {
      ...stakeholderData,
      id: `stake-${Date.now()}`,
    };
    deal.stakeholders.push(newStakeholder);
    deal.insights = generateDealInsights(deal);
    updateDeal(deal);
  };

  const recordPlaybookOutcome = (
    category: Objection['category'],
    objectionId: string,
    response: string,
    context: string,
    effectiveness: number,
    dealOutcome: 'won' | 'lost' | 'in-progress',
    isSuccess: boolean
  ) => {
    updatePlaybookResponse(category, objectionId, response, context, effectiveness, dealOutcome, isSuccess);
    setPlaybook(getPlaybook());
  };

  const stats = getDealStats();

  return (
    <DealRoomContext.Provider value={{
      deals,
      selectedDeal,
      briefing,
      playbook,
      loading,
      refreshDeals,
      selectDeal,
      createDeal,
      updateDeal,
      removeDeal,
      addCall,
      generateBriefingForDeal,
      addObjection,
      addCompetitorMention,
      addPricingDiscussion,
      updateStakeholder,
      addStakeholder,
      recordPlaybookOutcome,
      stats,
    }}>
      {children}
    </DealRoomContext.Provider>
  );
};

export const useDealRoom = () => {
  const context = useContext(DealRoomContext);
  if (!context) {
    throw new Error('useDealRoom must be used within a DealRoomProvider');
  }
  return context;
};