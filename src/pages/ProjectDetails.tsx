import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ExternalLink, Edit, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAchievements } from '@/hooks/useAchievements';
import { Project } from '@/hooks/useProjects';
import AchievementCard from '@/components/AchievementCard';
import AchievementForm from '@/components/AchievementForm';
import ProjectForm from '@/components/ProjectForm';

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { achievements, loading: achievementsLoading, addAchievement, updateAchievement, deleteAchievement } = useAchievements(projectId);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        setProject(data as Project);
      } catch (error) {
        console.error('Error fetching project:', error);
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!project) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id);

      if (error) throw error;
      setProject({ ...project, ...updates });
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleAddAchievement = (achievement: any) => {
    if (!projectId) return;
    addAchievement({ ...achievement, project_id: projectId });
  };

  const handleViewReport = () => {
    navigate(`/project/${projectId}/report`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Project not found</p>
      </div>
    );
  }

  const completedAchievements = achievements.filter(a => a.isCompleted).length;
  const totalAchievements = achievements.length;
  const appliedAchievements = achievements.filter(a => a.isAppliedToWebsite).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
              {project.client_name && (
                <p className="text-muted-foreground mb-2">Client: {project.client_name}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                {project.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit Site
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleViewReport}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Report
              </Button>
              <ProjectForm
                project={project}
                onSubmit={handleUpdateProject}
                trigger={
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>
        {project.description && (
          <CardContent>
            <p className="text-muted-foreground">{project.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Dashboard Statistics */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAchievements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedAchievements}</div>
            <p className="text-xs text-muted-foreground">
              {totalAchievements > 0 ? Math.round((completedAchievements / totalAchievements) * 100) : 0}% completion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applied to Website</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{appliedAchievements}</div>
            <p className="text-xs text-muted-foreground">
              {totalAchievements > 0 ? Math.round((appliedAchievements / totalAchievements) * 100) : 0}% applied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <AchievementForm onSubmit={handleAddAchievement} />
      </div>

      {achievementsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">
              No achievements found for this project. Add your first achievement to get started.
            </p>
            <AchievementForm onSubmit={handleAddAchievement} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onUpdate={updateAchievement}
              onDelete={deleteAchievement}
              onEdit={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;