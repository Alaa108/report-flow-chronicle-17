import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink, FolderOpen, FileText, Copy, CheckCircle2 } from 'lucide-react';
import { Project } from '@/hooks/useProjects';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ProjectForm from './ProjectForm';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ProjectCardProps {
  project: Project;
  onUpdate: (projectId: string, updates: Partial<Project>) => void;
  onDelete: (projectId: string) => void;
  achievementCount?: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate, onDelete, achievementCount = 0 }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />;
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-blue-600" />;
      case 'paused': return <div className="h-2 w-2 bg-yellow-500 rounded-full" />;
      default: return <div className="h-2 w-2 bg-gray-500 rounded-full" />;
    }
  };

  const handleUpdate = (updatedProject: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    onUpdate(project.id, updatedProject);
  };

  const handleViewProject = () => {
    navigate(`/project/${project.id}`);
  };

  const handleCopyClientReportUrl = () => {
    const clientReportUrl = `${window.location.origin}/client-report/${project.id}`;
    navigator.clipboard.writeText(clientReportUrl);
    toast({
      title: "Client Report URL Copied",
      description: "The client report URL has been copied to your clipboard.",
    });
  };

  const handleOpenClientReport = () => {
    const clientReportUrl = `/client-report/${project.id}`;
    window.open(clientReportUrl, '_blank');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/95 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              {getStatusIcon(project.status)}
            </div>
            
            {project.client_name && (
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
                <p className="text-sm text-muted-foreground font-medium">
                  Client: {project.client_name}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className={`${getStatusColor(project.status)} text-xs font-medium`}>
                {project.status}
              </Badge>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md">
                <FolderOpen className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  {achievementCount} achievement{achievementCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {project.description && (
        <CardContent className="pt-0 pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </CardContent>
      )}
      
      {/* Action Buttons */}
      <CardContent className="pt-0 pb-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewProject}
            className="w-full bg-primary/5 hover:bg-primary/10 border-primary/20"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            View Project
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenClientReport}
            className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
          >
            <FileText className="h-4 w-4 mr-2" />
            Client Report
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          {project.url && (
            <Button variant="ghost" size="sm" asChild className="flex-1">
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Site
              </a>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopyClientReportUrl}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Report URL
          </Button>
          
          <div className="flex items-center gap-1">
            <ProjectForm
              project={project}
              onSubmit={handleUpdate}
              trigger={
                <Button variant="ghost" size="sm" className="px-2">
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{project.name}"? This will also delete all associated achievements. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(project.id)} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;