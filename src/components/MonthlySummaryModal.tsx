import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, Edit2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MonthlySummaryModalProps {
  projectId: string;
  year: number;
  month: number;
  projectName: string;
  achievements: any[];
}

const MonthlySummaryModal = ({ 
  projectId, 
  year, 
  month, 
  projectName,
  achievements 
}: MonthlySummaryModalProps) => {
  const [summary, setSummary] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[month];

  useEffect(() => {
    if (open) {
      fetchSummary();
    }
  }, [open, projectId, year, month]);

  const fetchSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('summary')
        .eq('project_id', projectId)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      if (error) throw error;
      
      setSummary(data?.summary || '');
      setIsEditing(!data?.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast({
        title: "Error",
        description: "Failed to load monthly summary.",
        variant: "destructive",
      });
    }
  };

  const saveSummary = async () => {
    if (!summary.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('monthly_summaries')
        .upsert({
          project_id: projectId,
          year,
          month,
          summary: summary.trim()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Monthly summary saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving summary:', error);
      toast({
        title: "Error",
        description: "Failed to save monthly summary.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const monthlyAchievements = achievements.filter(achievement => {
    const achievementDate = new Date(achievement.date);
    return achievementDate.getFullYear() === year && achievementDate.getMonth() === month;
  });

  const completedCount = monthlyAchievements.filter(a => a.is_completed).length;
  const appliedCount = monthlyAchievements.filter(a => a.is_applied_to_website).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {monthName} {year} Summary - {projectName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Monthly Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-slate-800">{monthlyAchievements.length}</div>
                <p className="text-sm text-slate-600">Total Tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
                <p className="text-sm text-slate-600">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{appliedCount}</div>
                <p className="text-sm text-slate-600">Applied to Site</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Summary</CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder={`Write a summary of what was accomplished in ${monthName} ${year}...`}
                    className="min-h-32"
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveSummary} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Summary
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        fetchSummary();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  {summary ? (
                    <p className="whitespace-pre-wrap">{summary}</p>
                  ) : (
                    <p className="text-slate-500 italic">No summary available for this month.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks for {monthName} {year}</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyAchievements.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No tasks recorded for this month.</p>
              ) : (
                <div className="space-y-3">
                  {monthlyAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{achievement.title}</h4>
                        <p className="text-sm text-slate-600 truncate">{achievement.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                        {achievement.is_completed && (
                          <Badge variant="default" className="bg-emerald-100 text-emerald-700 text-xs">
                            Completed
                          </Badge>
                        )}
                        {achievement.is_applied_to_website && (
                          <Badge variant="default" className="bg-blue-100 text-blue-700 text-xs">
                            Live
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonthlySummaryModal;