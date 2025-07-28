import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, Globe, Filter, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
  created_at: string;
}

const ClientReport = () => {
  const [achievements, setAchievements] = useState<PublicAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth() + 1 + '');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const achievementsPerPage = 10;

  useEffect(() => {
    const fetchPublicAchievements = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('achievements_public')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAchievements(data || []);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicAchievements();
  }, []);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredAchievements.length / achievementsPerPage);
  const startIndex = (currentPage - 1) * achievementsPerPage;
  const endIndex = startIndex + achievementsPerPage;
  const currentAchievements = filteredAchievements.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear]);

  const completedAchievements = filteredAchievements.filter(achievement => achievement.is_completed).length;
  const appliedAchievements = filteredAchievements.filter(achievement => achievement.is_applied_to_website).length;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO Progress Report</h1>
              <p className="mt-2 text-gray-600">Review completed SEO achievements and their impact on your website</p>
            </div>
            <div className="flex items-center gap-6">
              {/* Filter Controls */}
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <div className="flex gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.value === 'all' ? 'All' : month.label.slice(0, 3)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
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
              {/* Client Badge */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>Client Report View</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <p className="text-2xl font-bold text-gray-900">{filteredAchievements.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Live on Site</p>
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
                    {filteredAchievements.length > 0 ? Math.round((completedAchievements / filteredAchievements.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Achievements Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SEO Achievements Completed</CardTitle>
                <CardDescription>
                  {selectedMonth !== 'all' || selectedYear !== 'all' 
                    ? `Report for ${selectedMonth !== 'all' ? months.find(m => m.value === selectedMonth)?.label : 'all months'} ${selectedYear !== 'all' ? selectedYear : ''}`
                    : 'Complete overview of all SEO achievements'
                  }
                </CardDescription>
              </div>
              {filteredAchievements.length > 0 && (
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredAchievements.length)} of {filteredAchievements.length} achievements
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredAchievements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
                <p className="text-gray-600">
                  No SEO achievements match your current filter criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentAchievements.map(achievement => (
                    <ClientAchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientReport;
