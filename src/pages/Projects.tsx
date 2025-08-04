import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectForm from '@/components/ProjectForm';
import ProjectCard from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { FolderOpen } from 'lucide-react';

const Projects = () => {
  const { projects, loading, addProject, updateProject, deleteProject } = useProjects();
  const [achievementCounts, setAchievementCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchAchievementCounts = async () => {
      if (projects.length === 0) return;

      const projectIds = projects.map(p => p.id);
      const { data } = await supabase
        .from('achievements')
        .select('project_id')
        .in('project_id', projectIds);

      const counts: Record<string, number> = {};
      data?.forEach(achievement => {
        counts[achievement.project_id] = (counts[achievement.project_id] || 0) + 1;
      });

      setAchievementCounts(counts);
    };

    fetchAchievementCounts();
  }, [projects]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                SEO Projects
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your SEO projects and track their progress
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </div>
              <ProjectForm onSubmit={addProject} />
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Active Projects</p>
                    <p className="text-2xl font-bold text-green-800">
                      {projects.filter(p => p.status === 'active').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-green-100 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Completed</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {projects.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-blue-100 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Total Achievements</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {Object.values(achievementCounts).reduce((sum, count) => sum + count, 0)}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-purple-100 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="bg-gradient-to-br from-muted/20 to-muted/40 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <FolderOpen className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first SEO project to start tracking achievements and generating client reports.
              </p>
              <ProjectForm onSubmit={addProject} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={updateProject}
                onDelete={deleteProject}
                achievementCount={achievementCounts[project.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;