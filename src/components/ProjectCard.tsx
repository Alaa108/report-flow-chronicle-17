import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/hooks/useProjects';
import { ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  achievementCount?: number;
}

export const ProjectCard = ({ project, onSelect, achievementCount = 0 }: ProjectCardProps) => {
  const { toast } = useToast();

  const copyReportLink = () => {
    const reportUrl = `${window.location.origin}/report/${project.project_code}`;
    navigator.clipboard.writeText(reportUrl);
    toast({
      title: "Link copied",
      description: "Report link has been copied to clipboard.",
    });
  };

  const openReport = () => {
    const reportUrl = `/report/${project.project_code}`;
    window.open(reportUrl, '_blank');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {project.project_code}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyReportLink}
              title="Copy report link"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openReport}
              title="Open report"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-muted-foreground text-sm mb-3">
            {project.description}
          </p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {achievementCount} achievement{achievementCount !== 1 ? 's' : ''}
          </span>
          <Button onClick={() => onSelect(project)}>
            Manage Achievements
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};