
import React from 'react';
import { Badge } from './ui/badge';
import { Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type PropertyStatus = 'for-sale' | 'for-rent' | 'sold' | 'rented';

interface PropertyStatusBadgeProps {
  status: PropertyStatus;
  soldDate?: Date;
  className?: string;
}

/**
 * PropertyStatusBadge Component
 * Displays a badge indicating property status (for sale, for rent, sold, rented)
 * For sold/rented properties, shows the time since the property status changed
 */
const PropertyStatusBadge: React.FC<PropertyStatusBadgeProps> = ({
  status,
  soldDate,
  className
}) => {
  // Determine badge styling based on status
  const getBadgeStyle = () => {
    switch (status) {
      case 'for-sale':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'for-rent':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sold':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rented':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format text to display
  const getStatusText = () => {
    switch (status) {
      case 'for-sale':
        return 'For Sale';
      case 'for-rent':
        return 'For Rent';
      case 'sold':
        return soldDate 
          ? `Sold ${formatDistanceToNow(soldDate, { addSuffix: true })}`
          : 'Sold';
      case 'rented':
        return soldDate 
          ? `Rented ${formatDistanceToNow(soldDate, { addSuffix: true })}`
          : 'Rented';
      default:
        return 'Unknown Status';
    }
  };

  // Get icon based on status
  const getStatusIcon = () => {
    if (status === 'sold' || status === 'rented') {
      return <Check className="w-3.5 h-3.5 mr-1" />;
    } else if (status === 'for-sale' || status === 'for-rent') {
      return <Clock className="w-3.5 h-3.5 mr-1" />;
    }
    return null;
  };

  return (
    <Badge
      className={`${getBadgeStyle()} flex items-center px-2 py-1 font-medium text-xs rounded-md ${className}`}
    >
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  );
};

export default PropertyStatusBadge;
