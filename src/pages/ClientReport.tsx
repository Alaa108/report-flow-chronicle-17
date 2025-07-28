import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAchievements } from "@/hooks/useAchievements";
import { useProjects } from "@/hooks/useProjects";
import ClientAchievementCard from "@/components/ClientAchievementCard";

const ClientReport = () => {
  const { projectCode } = useParams();
  const { achievements, loading, fetchAchievements } = useAchievements();
  const { getProjectByCode } = useProjects();
  const [project, setProject] = useState<any>(null);
  const [projectLoading, setProjectLoading] = useState(!!projectCode);

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectCode) {
        setProjectLoading(true);
        const projectData = await getProjectByCode(projectCode);
        setProject(projectData);
        if (projectData) {
          await fetchAchievements(projectData.id);
        }
        setProjectLoading(false);
      } else {
        // No projectCode, just load without filtering by project
        setProjectLoading(false);
      }
    };

    loadProjectData();
  }, [projectCode, getProjectByCode, fetchAchievements]);

  if (loading || projectLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (projectCode && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground">The project code "{projectCode}" could not be found.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {project ? `${project.name} - SEO Report` : 'SEO Achievement Report'}
          </h1>
          <p className="text-muted-foreground">
            {project ? project.description || 'Track our progress and completed SEO improvements' : 'Track our progress and completed SEO improvements'}
          </p>
          {project && (
            <div className="mt-2">
              <span className="text-sm bg-secondary px-2 py-1 rounded">
                Project Code: {project.project_code}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <ClientAchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No achievements found for this project.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientReport;
