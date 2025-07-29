import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectForm from '@/components/ProjectForm';
import ProjectCard from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SEO Projects</h1>
        <ProjectForm onSubmit={addProject} />
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">
              No projects found. Create your first SEO project to get started.
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
  );
};

export default Projects;