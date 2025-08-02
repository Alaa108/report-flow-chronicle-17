import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, ExternalLink, Building2, Filter, Globe, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ClientAchievementCard from '@/components/ClientAchievementCard';
import MonthlySummaryModal from '@/components/MonthlySummaryModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

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
  
  // Filter states
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [completedFilter, setCompletedFilter] = useState<string>('all');
  const [liveFilter, setLiveFilter] = useState<string>('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Get available years from achievements
  const availableYears = useMemo(() => {
    const years = [...new Set(achievements.map(a => new Date(a.date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [achievements]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      // Year filter
      if (yearFilter !== 'all') {
        const achievementYear = new Date(achievement.date).getFullYear();
        const filterYear = parseInt(yearFilter);
        if (achievementYear !== filterYear) return false;
      }
      
      // Month filter
      if (monthFilter !== 'all') {
        const achievementMonth = new Date(achievement.date).getMonth();
        const filterMonth = parseInt(monthFilter);
        if (achievementMonth !== filterMonth) return false;
      }
      
      // Name filter
      if (nameFilter && !achievement.title.toLowerCase().includes(nameFilter.toLowerCase())) {
        return false;
      }
      
      // Completed filter
      if (completedFilter === 'completed' && !achievement.is_completed) return false;
      if (completedFilter === 'pending' && achievement.is_completed) return false;
      
      // Live filter
      if (liveFilter === 'live' && !achievement.is_applied_to_website) return false;
      if (liveFilter === 'not-live' && achievement.is_applied_to_website) return false;
      
      return true;
    });
  }, [achievements, yearFilter, monthFilter, nameFilter, completedFilter, liveFilter]);

  // Paginated achievements
  const paginatedAchievements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAchievements.slice(startIndex, endIndex);
  }, [filteredAchievements, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAchievements.length / itemsPerPage);

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
          <div className="max-w-7xl mx-auto text-center">
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-12 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
                  <p className="text-xl opacity-90">SEO Progress Report</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2">
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                  <div className="text-sm opacity-75">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
              
              {project.client_name && (
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5" />
                  <span className="text-lg">{project.client_name}</span>
                </div>
              )}
              
              {project.description && (
                <p className="text-white/90 leading-relaxed mb-4">{project.description}</p>
              )}
              
              {project.url && (
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              )}
            </div>
          </div>


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
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-800">SEO Tasks & Achievements</CardTitle>
                  <p className="text-sm text-slate-600">
                    Detailed breakdown of all SEO improvements and implementations
                  </p>
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Filters:</span>
                  </div>
                  
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      <SelectItem value="0">January</SelectItem>
                      <SelectItem value="1">February</SelectItem>
                      <SelectItem value="2">March</SelectItem>
                      <SelectItem value="3">April</SelectItem>
                      <SelectItem value="4">May</SelectItem>
                      <SelectItem value="5">June</SelectItem>
                      <SelectItem value="6">July</SelectItem>
                      <SelectItem value="7">August</SelectItem>
                      <SelectItem value="8">September</SelectItem>
                      <SelectItem value="9">October</SelectItem>
                      <SelectItem value="10">November</SelectItem>
                      <SelectItem value="11">December</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Search tasks..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="w-40"
                  />
                  
                  <Select value={completedFilter} onValueChange={setCompletedFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          Pending
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={liveFilter} onValueChange={setLiveFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Live" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="live">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          Live
                        </div>
                      </SelectItem>
                      <SelectItem value="not-live">Not Live</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Monthly Summary Button */}
                  {yearFilter !== 'all' && monthFilter !== 'all' && project && (
                    <MonthlySummaryModal
                      projectId={project.id}
                      year={parseInt(yearFilter)}
                      month={parseInt(monthFilter)}
                      projectName={project.name}
                      achievements={achievements}
                    />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {filteredAchievements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-2">
                    {achievements.length === 0 ? "No achievements recorded yet" : "No achievements match your filters"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {achievements.length === 0 ? "Check back later for updates on your SEO progress" : "Try adjusting your filter criteria"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {paginatedAchievements.map((achievement) => (
                      <ClientAchievementCard 
                        key={achievement.id} 
                        achievement={achievement} 
                      />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                              }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={page === currentPage}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                              }}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
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
