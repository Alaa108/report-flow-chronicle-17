import { useState } from "react";
import { useAchievements, Achievement } from "@/hooks/useAchievements";
import { useProjects, Project } from "@/hooks/useProjects";
import AchievementCard from "@/components/AchievementCard";
import AchievementForm from "@/components/AchievementForm";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { achievements, loading, addAchievement, updateAchievement, deleteAchievement, fetchAchievements } = useAchievements();
  const { projects, loading: projectsLoading, createProject } = useProjects();
  const { signOut } = useAuth();

  const handleSubmit = async (achievement: Omit<Achievement, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingAchievement) {
      await updateAchievement(editingAchievement.id, achievement);
      setEditingAchievement(null);
    } else {
      await addAchievement(achievement);
    }
    setShowForm(false);
    if (selectedProject) {
      fetchAchievements(selectedProject.id);
    }
  };

  const handleCreateProject = async (project: { name: string; description?: string }) => {
    await createProject(project);
    setShowProjectForm(false);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    fetchAchievements(project.id);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setShowForm(false);
    setEditingAchievement(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAchievement(null);
  };

  const handleCancelProject = () => {
    setShowProjectForm(false);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setShowForm(true);
  };

  const handleDelete = async (achievementId: string) => {
    await deleteAchievement(achievementId);
    if (selectedProject) {
      fetchAchievements(selectedProject.id);
    }
  };

  if (projectsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {selectedProject && (
              <Button variant="ghost" onClick={handleBackToProjects}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            )}
            <h1 className="text-3xl font-bold">
              {selectedProject ? selectedProject.name : 'SEO Projects'}
            </h1>
          </div>
          <div className="flex gap-2">
            {selectedProject ? (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Achievement
              </Button>
            ) : (
              <Button onClick={() => setShowProjectForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {showProjectForm && !selectedProject && (
          <div className="mb-8">
            <ProjectForm 
              onSubmit={handleCreateProject} 
              onCancel={handleCancelProject}
            />
          </div>
        )}

        {showForm && selectedProject && (
          <div className="mb-8">
            <AchievementForm 
              onSubmit={handleSubmit} 
              onCancel={handleCancel}
              initialData={editingAchievement || undefined}
              projectId={selectedProject.id}
            />
          </div>
        )}

        {!selectedProject ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={handleSelectProject}
                achievementCount={achievements.filter(a => a.project_id === project.id).length}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdate={updateAchievement}
            />
            ))}
          </div>
        )}

        {!selectedProject && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects yet. Create your first one!</p>
          </div>
        )}

        {selectedProject && achievements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No achievements yet. Add your first achievement!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;