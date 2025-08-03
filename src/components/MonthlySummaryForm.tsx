import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Save, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface MonthlySummaryFormProps {
  projectId: string;
  projectName: string;
}

const MonthlySummaryForm = ({ projectId, projectName }: MonthlySummaryFormProps) => {
  const [summary, setSummary] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  const years = [
    { value: '2030', label: '2030' },
    { value: '2029', label: '2029' },
    { value: '2028', label: '2028' },
    { value: '2027', label: '2027' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' }
  ];

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchSummary();
    }
  }, [selectedMonth, selectedYear]);

  const fetchSummary = async () => {
    if (!selectedMonth || !selectedYear) return;
    
    try {
      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('summary')
        .eq('project_id', projectId)
        .eq('year', parseInt(selectedYear))
        .eq('month', parseInt(selectedMonth))
        .maybeSingle();

      if (error) throw error;
      
      setSummary(data?.summary || '');
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const saveSummary = async () => {
    if (!summary.trim() || !selectedMonth || !selectedYear) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('monthly_summaries')
        .upsert({
          project_id: projectId,
          year: parseInt(selectedYear),
          month: parseInt(selectedMonth),
          summary: summary.trim()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Monthly summary saved successfully.",
      });
      setOpen(false);
      setSummary('');
      setSelectedMonth('');
    } catch (error) {
      console.error('Error saving summary:', error);
      toast({
        title: "Error",
        description: "Failed to save monthly summary.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSummary('');
      setSelectedMonth('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
        >
          <FileText className="h-4 w-4 mr-2" />
          Add Monthly Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add Monthly Summary - {projectName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Month & Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
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
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedMonth && selectedYear && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="border rounded-md">
                      <ReactQuill
                        value={summary}
                        onChange={(value) => setSummary(value)}
                        placeholder={`Write a summary of what was accomplished in ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}...`}
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
                        style={{ minHeight: '180px' }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      <p><strong>Formatting tips:</strong> Use the toolbar above to format your text with headings, bold, italic, and lists.</p>
                    </div>
                  </div>
                  <Button onClick={saveSummary} disabled={loading || !summary.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonthlySummaryForm;