
import React, { useState, useMemo } from 'react';
import { Plus, Calendar, CheckCircle, Clock, Globe, Filter, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievements, type Achievement } from '@/hooks/useAchievements';
import AchievementForm from '@/components/AchievementForm';
import AchievementCard from '@/components/AchievementCard';

const Index = () => {
  const { user, signOut } = useAuth();
  const { achievements, loading, addAchievement, updateAchievement, deleteAchievement } = useAchievements();
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2024');

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

  const addNewAchievement = (achievement: Omit<Achievement, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingAchievement) {
      updateAchievement(editingAchievement.id, achievement);
      setEditingAchievement(null);
    } else {
      addAchievement(achievement);
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

  const updateExistingAchievement = (achievementId: string, updates: Partial<Achievement>) => {
    updateAchievement(achievementId, updates);
  };

  const deleteExistingAchievement = (achievementId: string) => {
    deleteAchievement(achievementId);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const completedAchievements = filteredAchievements.filter(achievement => achievement.isCompleted).length;
  const appliedAchievements = filteredAchievements.filter(achievement => achievement.isAppliedToWebsite).length;

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO Achievement Platform</h1>
              <p className="mt-2 text-gray-600">Track and manage your SEO achievements and their impact</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Welcome, {user?.email}</span>
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
                    {filteredAchievements.length > 0 ? Math.round((completedAchievements / filteredAchievements.length) * 100) : 0}%
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
            {filteredAchievements.length === 0 ? (
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
                    onUpdate={updateExistingAchievement}
                    onDelete={deleteExistingAchievement}
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

export default Index;
