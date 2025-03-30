/**
 * Configuration for relationship types and their recommended interaction frequencies
 */

export interface RelationshipType {
  id: string;
  label: string;
  description: string;
  recommendedInteractionDays: number;
}

// List of relationship types with recommended interaction frequencies
export const relationshipTypes: RelationshipType[] = [
  {
    id: 'close_family',
    label: 'Close Family',
    description: 'Immediate family members like parents, siblings, spouse, children',
    recommendedInteractionDays: 3
  },
  {
    id: 'extended_family',
    label: 'Extended Family',
    description: 'Cousins, aunts, uncles, etc.',
    recommendedInteractionDays: 14
  },
  {
    id: 'close_friends',
    label: 'Close Friends',
    description: 'Your inner circle of friends',
    recommendedInteractionDays: 7
  },
  {
    id: 'friends',
    label: 'Friends',
    description: 'Regular friends',
    recommendedInteractionDays: 21
  },
  {
    id: 'colleagues',
    label: 'Work Colleagues',
    description: 'People you work with regularly',
    recommendedInteractionDays: 7
  },
  {
    id: 'acquaintances',
    label: 'Acquaintances',
    description: 'People you know but aren\'t close with',
    recommendedInteractionDays: 60
  },
  {
    id: 'professional',
    label: 'Professional Network',
    description: 'Business contacts, mentors, industry connections',
    recommendedInteractionDays: 30
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Set your own custom frequency',
    recommendedInteractionDays: 0 // Custom value set by user
  }
];

// Interaction action terms
export const interactionVerbs = {
  past: [
    'Caught up with',
    'Connected with',
    'Chatted with',
    'Reached out to',
    'Checked in with',
    'Talked to',
    'Met up with',
    'Had a conversation with'
  ],
  future: [
    'Catch up with',
    'Connect with',
    'Check in with',
    'Reach out to',
    'Touch base with',
    'Reconnect with',
    'Call',
    'Message'
  ]
};

/**
 * Get a random interaction verb
 */
export const getRandomInteractionVerb = (tense: 'past' | 'future'): string => {
  const verbs = interactionVerbs[tense];
  const randomIndex = Math.floor(Math.random() * verbs.length);
  return verbs[randomIndex];
}; 