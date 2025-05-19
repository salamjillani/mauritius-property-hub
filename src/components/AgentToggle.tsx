import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AgentToggleProps {
  onClick: () => void;
  isActive: boolean;
  className?: string;
}

// This component is now completely hidden - returning null to remove it from the UI
const AgentToggle: React.FC<AgentToggleProps> = () => {
  return null;
};

export default AgentToggle;