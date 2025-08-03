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
          {/* Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {summary ? (
                  <div className="whitespace-pre-wrap text-base leading-relaxed">{summary}</div>
                ) : (
                  <p className="text-slate-500 italic text-center py-8">No summary available for this month.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonthlySummaryModal;