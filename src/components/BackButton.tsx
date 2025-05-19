
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * BackButton Component
 * Provides consistent navigation back to previous pages
 * Can be configured to go to a specific route or use browser history
 */
const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label = 'Back', 
  className = '',
  onClick
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center text-muted-foreground hover:text-foreground text-[10px] py-1 h-7 ${className}`}
      onClick={handleBack}
    >
      <ChevronLeft className="h-2.5 w-2.5 mr-0.5 sm:inline-block" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">Back</span>
    </Button>
  );
};

export default BackButton;
