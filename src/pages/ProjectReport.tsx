import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAchievements } from '@/hooks/useAchievements';
import { Project } from '@/hooks/useProjects';
import ClientAchievementCard from '@/components/ClientAchievementCard';

const ProjectReport = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { achievements, loading: achievementsLoading } = useAchievements(projectId);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || achievementsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
          </Card>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <p>Project not found</p>
        </div>
      </div>
    );
  }

  const completedAchievements = achievements.filter(a => a.isCompleted);
  const appliedAchievements = achievements.filter(a => a.isAppliedToWebsite);
  const totalAchievements = achievements.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate(`/project/${projectId}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>

        {/* Project Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{project.name} - SEO Report</CardTitle>
                {project.client_name && (
                  <p className="text-muted-foreground mb-2">Client: {project.client_name}</p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Generated on {new Date().toLocaleDateString()}
                  </span>
                </div>
                {project.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          {project.description && (
            <CardContent>
              <p className="text-muted-foreground">{project.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
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
              <div className="text-2xl font-bold text-green-600">{completedAchievements.length}</div>
              <p className="text-xs text-muted-foreground">
                {totalAchievements > 0 ? Math.round((completedAchievements.length / totalAchievements) * 100) : 0}% completion
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{appliedAchievements.length}</div>
              <p className="text-xs text-muted-foreground">
                {totalAchievements > 0 ? Math.round((appliedAchievements.length / totalAchievements) * 100) : 0}% applied
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totalAchievements - completedAchievements.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalAchievements > 0 ? Math.round(((totalAchievements - completedAchievements.length) / totalAchievements) * 100) : 0}% pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">SEO Tasks & Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No achievements found for this project.
              </p>
            ) : (
              <div className="space-y-4">
                {achievements
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((achievement) => (
                    <ClientAchievementCard key={achievement.id} achievement={{
                      id: achievement.id,
                      title: achievement.title,
                      description: achievement.description,
                      date: achievement.date.toISOString().split('T')[0],
                      is_completed: achievement.isCompleted,
                      is_applied_to_website: achievement.isAppliedToWebsite,
                      category: achievement.category,
                      link: achievement.link,
                      created_at: achievement.created_at
                    }} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectReport;