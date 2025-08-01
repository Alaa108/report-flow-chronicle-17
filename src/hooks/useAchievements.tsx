
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  isCompleted: boolean;
  isAppliedToWebsite: boolean;
  category: string;
  link?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export const useAchievements = (projectId?: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAchievements = async () => {
    try {
      let query = supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedAchievements = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        date: new Date(item.date),
        isCompleted: item.is_completed,
        isAppliedToWebsite: item.is_applied_to_website,
        category: item.category,
        link: item.link || '',
        project_id: item.project_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setAchievements(formattedAchievements);
    } catch (error: any) {
      toast({
        title: "Error fetching achievements",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAchievement = async (achievement: Omit<Achievement, 'id' | 'created_at' | 'updated_at'>) => {

    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert([{
          title: achievement.title,
          description: achievement.description,
          date: achievement.date.toISOString().split('T')[0],
          is_completed: achievement.isCompleted,
          is_applied_to_website: achievement.isAppliedToWebsite,
          category: achievement.category,
          link: achievement.link,
          project_id: achievement.project_id
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newAchievement: Achievement = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          date: new Date(data.date),
          isCompleted: data.is_completed,
          isAppliedToWebsite: data.is_applied_to_website,
          category: data.category,
          link: data.link || '',
          project_id: data.project_id,
          created_at: data.created_at,
          updated_at: data.updated_at
        };

        setAchievements(prev => [newAchievement, ...prev]);
        
        toast({
          title: "Achievement added",
          description: "Your achievement has been successfully added.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error adding achievement",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAchievement = async (achievementId: string, updates: Partial<Achievement>) => {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0];
      if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
      if (updates.isAppliedToWebsite !== undefined) updateData.is_applied_to_website = updates.isAppliedToWebsite;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.link !== undefined) updateData.link = updates.link;

      const { error } = await supabase
        .from('achievements')
        .update(updateData)
        .eq('id', achievementId);

      if (error) throw error;

      setAchievements(prev => 
        prev.map(achievement => 
          achievement.id === achievementId 
            ? { ...achievement, ...updates }
            : achievement
        )
      );

      toast({
        title: "Achievement updated",
        description: "Your achievement has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating achievement",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAchievement = async (achievementId: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', achievementId);

      if (error) throw error;

      setAchievements(prev => prev.filter(achievement => achievement.id !== achievementId));

      toast({
        title: "Achievement deleted",
        description: "Your achievement has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting achievement",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [projectId]);

  return {
    achievements,
    loading,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    refetch: fetchAchievements
  };
};
