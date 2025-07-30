import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ExternalLink, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ClientAchievementCard from '@/components/ClientAchievementCard';

interface PublicAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  is_completed: boolean;
  is_applied_to_website: boolean;
  category: string;
  link?: string;
  created_at: string;
}

interface PublicProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  client_name?: string;
  url?: string;
  created_at: string;
}

const ClientReport = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<PublicProject | null>(null);
  const [achievements, setAchievements] = useState<PublicAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectAndAchievements = async () => {
      if (!projectId) return;

      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, name, description, status, client_name, url, created_at')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;

        // Fetch achievements for this project
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, title, description, date, is_completed, is_applied_to_website, category, link, created_at')
          .eq('project_id', projectId)
          .order('date', { ascending: false });

        if (achievementsError) throw achievementsError;

        setProject(projectData);
        setAchievements(achievementsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndAchievements();
  }, [projectId]);

  const stats = useMemo(() => {
    const total = achievements.length;
    const completed = achievements.filter(a => a.is_completed).length;
    const applied = achievements.filter(a => a.is_applied_to_website).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, applied, completionRate };
  }, [achievements]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'paused': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-80 mb-4" />
            <Skeleton className="h-6 w-48 mb-8" />
            
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-8 w-12" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-semibold text-slate-800 mb-4">Project Not Found</h1>
            <p className="text-slate-600">The requested project report could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              {project.name} - SEO Report
            </h1>
            {project.client_name && (
              <p className="text-xl text-slate-600 mb-4">
                <Building2 className="inline h-5 w-5 mr-2" />
                Client: {project.client_name}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
              <Badge variant="outline" className={getStatusColor(project.status)}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Generated on {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Project Description */}
          {project.description && (
            <Card className="border-0 shadow-sm mb-8">
              <CardContent className="p-6">
                <p className="text-slate-700 leading-relaxed">{project.description}</p>
                {project.url && (
                  <div className="mt-4">
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-slate-800 mb-1">{stats.total}</div>
                <p className="text-sm font-medium text-slate-600">Total Tasks</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-emerald-600 mb-1">{stats.completed}</div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-xs text-slate-500 mt-1">{stats.completionRate}% completion</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.applied}</div>
                <p className="text-sm font-medium text-slate-600">Live on Site</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.applied / stats.total) * 100) : 0}% applied
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-amber-600 mb-1">{stats.total - stats.completed}</div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.total > 0 ? Math.round(((stats.total - stats.completed) / stats.total) * 100) : 0}% remaining
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-800">SEO Tasks & Achievements</CardTitle>
              <p className="text-sm text-slate-600">
                Detailed breakdown of all SEO improvements and implementations
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {achievements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-2">No achievements recorded yet</p>
                  <p className="text-sm text-slate-400">Check back later for updates on your SEO progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <ClientAchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              This report was generated automatically and reflects the current status of your SEO project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientReport;
