import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  description?: string;
  project_code: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: { name: string; description?: string }) => {
    if (!user) return;

    try {
      // Generate unique project code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_project_code');

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: project.name,
          description: project.description,
          project_code: codeData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProjects(prev => [data, ...prev]);
        toast({
          title: "Project created",
          description: "Your project has been successfully created.",
        });
        return data;
      }
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getProjectByCode = async (projectCode: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_code', projectCode)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching project by code:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    getProjectByCode,
    refetch: fetchProjects
  };
};