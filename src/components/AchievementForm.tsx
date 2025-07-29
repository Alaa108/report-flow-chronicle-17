
import React, { useState } from 'react';
import { X, Calendar, FileText, Tag, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { Achievement } from '@/hooks/useAchievements';

interface AchievementFormProps {
  onSubmit: (achievement: Omit<Achievement, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
  initialData?: Achievement;
  isEdit?: boolean;
}

const AchievementForm: React.FC<AchievementFormProps> = ({ onSubmit, onCancel = () => {}, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? initialData.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isCompleted: initialData?.isCompleted || false,
    isAppliedToWebsite: initialData?.isAppliedToWebsite || false,
    category: initialData?.category || 'On-Page SEO',
    link: initialData?.link || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    onSubmit({
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date),
      isCompleted: formData.isCompleted,
      isAppliedToWebsite: formData.isAppliedToWebsite,
      category: formData.category,
      link: formData.link,
      project_id: initialData?.project_id || ''
    });
  };

  const categories = [
    'On-Page SEO',
    'Technical SEO',
    'Content SEO',
    'Link Building',
    'Local SEO',
    'Analytics & Reporting',
    'Keyword Research',
    'Competitor Analysis'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {isEdit ? 'Edit SEO Achievement' : 'Add New SEO Achievement'}
              </CardTitle>
              <CardDescription>{isEdit ? 'Update your SEO achievement details' : 'Create a new achievement to track your SEO activities and progress'}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Achievement Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Optimize meta descriptions for product pages"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <div className="space-y-2">
                <div className="border rounded-md">
                  <ReactQuill
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Describe what was accomplished, tools used, and expected impact..."
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header', 'bold', 'italic', 'underline',
                      'list', 'bullet'
                    ]}
                    style={{ minHeight: '120px' }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p><strong>Formatting tips:</strong> Use the toolbar above to format your text with headings, bold, italic, and lists.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link" className="flex items-center">
                <Link className="mr-1 h-4 w-4" />
                Related Link/File (Optional)
              </Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com/file.pdf or Drive link"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center">
                  <Tag className="mr-1 h-4 w-4" />
                  Category
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="completed" className="text-sm font-medium">Achievement Completed</Label>
                  <p className="text-sm text-gray-600">Mark if this achievement has been finished</p>
                </div>
                <Switch
                  id="completed"
                  checked={formData.isCompleted}
                  onCheckedChange={(checked) => setFormData({ ...formData, isCompleted: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="applied" className="text-sm font-medium">Applied to Website</Label>
                  <p className="text-sm text-gray-600">Mark if changes have been implemented on the live site</p>
                </div>
                <Switch
                  id="applied"
                  checked={formData.isAppliedToWebsite}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAppliedToWebsite: checked })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isEdit ? 'Update Achievement' : 'Add Achievement'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementForm;
