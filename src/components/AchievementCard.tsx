
import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, Globe, Trash2, Tag, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Achievement } from '@/hooks/useAchievements';

interface AchievementCardProps {
  achievement: Achievement;
  onUpdate: (achievementId: string, updates: Partial<Achievement>) => void;
  onDelete: (achievementId: string) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onUpdate, onDelete }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
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

  const toggleCompleted = () => {
    onUpdate(achievement.id, { isCompleted: !achievement.isCompleted });
  };

  const toggleApplied = () => {
    onUpdate(achievement.id, { isAppliedToWebsite: !achievement.isAppliedToWebsite });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      onDelete(achievement.id);
    }
  };

  const truncatedDescription = achievement.description.length > 150 
    ? achievement.description.slice(0, 150) + '...'
    : achievement.description;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Achievement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <div 
            className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: showFullDescription ? achievement.description : truncatedDescription
            }}
          />
          {achievement.description.length > 150 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-600 hover:text-blue-700 text-sm mt-1 font-medium"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {achievement.isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-orange-600" />
                )}
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <Switch
                checked={achievement.isCompleted}
                onCheckedChange={toggleCompleted}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Globe className={`h-4 w-4 ${achievement.isAppliedToWebsite ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-600">Applied to Site</span>
              </div>
              <Switch
                checked={achievement.isAppliedToWebsite}
                onCheckedChange={toggleApplied}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {achievement.isCompleted && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            )}
            {achievement.isAppliedToWebsite && (
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

export default AchievementCard;
