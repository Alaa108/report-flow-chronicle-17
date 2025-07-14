
import React, { useState } from 'react';
import { Calendar, CheckCircle, Globe, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface PublicAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  is_completed: boolean;
  is_applied_to_website: boolean;
  category: string;
  created_at: string;
}

interface ClientAchievementCardProps {
  achievement: PublicAchievement;
}

const ClientAchievementCard: React.FC<ClientAchievementCardProps> = ({ achievement }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'On-Page SEO': 'bg-blue-100 text-blue-800',
      'Technical SEO': 'bg-green-100 text-green-800',
      'Content SEO': 'bg-purple-100 text-purple-800',
      'Link Building': 'bg-orange-100 text-orange-800',
      'Local SEO': 'bg-pink-100 text-pink-800',
      'Analytics & Reporting': 'bg-indigo-100 text-indigo-800',
      'Keyword Research': 'bg-yellow-100 text-yellow-800',
      'Competitor Analysis': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const truncatedDescription = achievement.description && achievement.description.length > 200 
    ? achievement.description.slice(0, 200) + '...'
    : achievement.description;

  return (
    <Card className="hover:shadow-sm transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{achievement.title}</h3>
              <Badge className={getCategoryColor(achievement.category)}>
                <Tag className="mr-1 h-3 w-3" />
                {achievement.category}
              </Badge>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Calendar className="mr-1 h-4 w-4" />
              {formatDate(achievement.date)}
            </div>
          </div>
        </div>

        {achievement.description && (
          <div className="mb-4">
            <div 
              className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: showFullDescription || !achievement.description || achievement.description.length <= 200 
                  ? achievement.description 
                  : truncatedDescription
              }}
            />
            {achievement.description && achievement.description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-blue-600 hover:text-blue-700 text-sm mt-1 font-medium"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>

            {achievement.is_applied_to_website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Applied to Website</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="mr-1 h-3 w-3" />
              Completed
            </Badge>
            {achievement.is_applied_to_website && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Globe className="mr-1 h-3 w-3" />
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientAchievementCard;
