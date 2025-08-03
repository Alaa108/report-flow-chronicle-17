import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ExternalLink, Edit, BarChart3, Plus, Calendar, CheckCircle, Clock, Globe, Filter, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAchievements, type Achievement } from '@/hooks/useAchievements';
import { Project } from '@/hooks/useProjects';
import AchievementCard from '@/components/AchievementCard';
import AchievementForm from '@/components/AchievementForm';
import ProjectForm from '@/components/ProjectForm';
import MonthlySummaryForm from '@/components/MonthlySummaryForm';
import { useAuth } from '@/contexts/AuthContext';

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  
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

  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      const achievementDate = new Date(achievement.date);
      const achievementYear = achievementDate.getFullYear().toString();
      const achievementMonth = (achievementDate.getMonth() + 1).toString();

      if (selectedYear !== 'all' && achievementYear !== selectedYear) {
        return false;
      }

      if (selectedMonth !== 'all' && achievementMonth !== selectedMonth) {
        return false;
      }

      return true;
    });
  }, [achievements, selectedMonth, selectedYear]);

  const addNewAchievement = (achievement: Omit<Achievement, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) return;
    
    if (editingAchievement) {
      updateAchievement(editingAchievement.id, achievement);
      setEditingAchievement(null);
    } else {
      addAchievement({ ...achievement, project_id: projectId });
    }
    setShowAchievementForm(false);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setShowAchievementForm(true);
  };

  const handleCancelForm = () => {
    setShowAchievementForm(false);
    setEditingAchievement(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleViewReport = () => {
    navigate(`/client-report/${projectId}`);
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

  const completedAchievements = filteredAchievements.filter(a => a.isCompleted).length;
  const totalAchievements = filteredAchievements.length;
  const appliedAchievements = filteredAchievements.filter(a => a.isAppliedToWebsite).length;

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project?.name || 'Project'}</h1>
                <p className="mt-2 text-gray-600">Track and manage SEO achievements for this project</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleViewReport}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Report
              </Button>
              <MonthlySummaryForm projectId={projectId!} projectName={project?.name || 'Project'} />
              <Button 
                onClick={() => setShowAchievementForm(true)} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Achievement
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Project Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  {project.client_name && (
                    <span className="text-muted-foreground">Client: {project.client_name}</span>
                  )}
                  {project.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit Site
                      </a>
                    </Button>
                  )}
                </div>
                {project.description && (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
              </div>
              <div className="flex gap-2">
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
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAchievements}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedAchievements}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applied to Site</p>
                  <p className="text-2xl font-bold text-gray-900">{appliedAchievements}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalAchievements > 0 ? Math.round((completedAchievements / totalAchievements) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="mr-2 h-5 w-5" />
              Filter Achievements
            </CardTitle>
            <CardDescription>Filter achievements by month and year to generate specific reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2030">2030</SelectItem>
                    <SelectItem value="2029">2029</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements List */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Achievements Report</CardTitle>
            <CardDescription>
              {selectedMonth !== 'all' || selectedYear !== 'all' 
                ? `Showing achievements for ${selectedMonth !== 'all' ? months.find(m => m.value === selectedMonth)?.label : 'all months'} ${selectedYear !== 'all' ? selectedYear : ''}`
                : 'Showing all achievements'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>

            {achievementsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
                <p className="text-gray-600 mb-6">
                  {selectedMonth !== 'all' || selectedYear !== 'all' 
                    ? 'No achievements match your current filter criteria.'
                    : 'Get started by adding your first SEO achievement.'
                  }
                </p>
                <Button onClick={() => setShowAchievementForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Achievement
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAchievements.map(achievement => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    onUpdate={updateAchievement}
                    onDelete={deleteAchievement}
                    onEdit={handleEditAchievement}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievement Form Modal */}
      {showAchievementForm && (
        <AchievementForm 
          onSubmit={addNewAchievement}
          onCancel={handleCancelForm}
          initialData={editingAchievement || undefined}
          isEdit={!!editingAchievement}
        />
      )}
    </div>
  );
};

export default ProjectDetails;