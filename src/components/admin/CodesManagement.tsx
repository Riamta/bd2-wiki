"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Calendar, Gift, Code, Loader2, RefreshCw } from 'lucide-react';
import { CodeData, CodeFormData } from '@/types/auth';
import { toast } from 'sonner';

export default function CodesManagement() {
  const [codes, setCodes] = useState<CodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CodeData | null>(null);
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<CodeFormData>({
    code: '',
    reward: '',
    add_date: getTodayDate(),
    end_date: getTodayDate(),
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch codes
  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/codes');
      const data = await response.json();

      if (data.success) {
        setCodes(data.codes);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch codes');
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  // Handle form submission for adding new code
  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setCodes(prev => [...prev, data.code]);
        setFormData({ code: '', reward: '', add_date: getTodayDate(), end_date: getTodayDate() });
        setIsAddDialogOpen(false);
        toast.success('Code added successfully');
      } else {
        toast.error(data.error || 'Failed to add code');
      }
    } catch (error) {
      console.error('Error adding code:', error);
      toast.error('Network error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle form submission for editing code
  const handleEditCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;

    setFormLoading(true);

    try {
      const response = await fetch('/api/admin/codes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalCode: editingCode.code,
          code: formData.code,
          reward: formData.reward,
          add_date: formData.add_date,
          end_date: formData.end_date,
          status: editingCode.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCodes(prev => prev.map(c =>
          c.code === editingCode.code ? data.code : c
        ));
        setFormData({ code: '', reward: '', add_date: getTodayDate(), end_date: getTodayDate() });
        setEditingCode(null);
        setIsEditDialogOpen(false);
        toast.success('Code updated successfully');
      } else {
        toast.error(data.error || 'Failed to update code');
      }
    } catch (error) {
      console.error('Error updating code:', error);
      toast.error('Network error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete code
  const handleDeleteCode = async (codeToDelete: string) => {
    if (!confirm('Are you sure you want to delete this code?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/codes?code=${encodeURIComponent(codeToDelete)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setCodes(prev => prev.filter(c => c.code !== codeToDelete));
        toast.success('Code deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete code');
      }
    } catch (error) {
      console.error('Error deleting code:', error);
      toast.error('Network error occurred');
    }
  };

  // Handle edit button click
  const handleEditClick = (code: CodeData) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      reward: code.reward,
      add_date: code.add_date,
      end_date: code.end_date,
    });
    setIsEditDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if code is expired
  const isExpired = (endDate: string) => {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return new Date() > end;
  };

  // Get status badge
  const getStatusBadge = (code: CodeData) => {
    const expired = isExpired(code.end_date);
    const status = expired ? 'expired' : code.status;
    
    return (
      <Badge 
        variant={status === 'active' ? 'default' : 'secondary'}
        className={status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
      >
        {status === 'active' ? 'Active' : 'Expired'}
      </Badge>
    );
  };

  // Stats
  const activeCount = codes.filter(c => !isExpired(c.end_date) && c.status === 'active').length;
  const expiredCount = codes.filter(c => isExpired(c.end_date) || c.status === 'expired').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Codes Management</h2>
          <p className="text-gray-400">Manage promotional codes</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={fetchCodes}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Code
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Code</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new promotional code
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCode} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Code</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Enter code (e.g., BD2SUMMER2024)"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Reward</label>
                  <Input
                    value={formData.reward}
                    onChange={(e) => setFormData(prev => ({ ...prev, reward: e.target.value }))}
                    placeholder="Enter reward (e.g., Dia x600)"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Start Date</label>
                  <Input
                    type="date"
                    value={formData.add_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, add_date: e.target.value }))}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Default: Today's date</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Default: Today's date</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Code'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Codes</p>
                <p className="text-2xl font-bold text-white">{codes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Active Codes</p>
                <p className="text-2xl font-bold text-green-400">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Expired Codes</p>
                <p className="text-2xl font-bold text-red-400">{expiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Codes Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Codes</CardTitle>
          <CardDescription className="text-gray-400">
            Manage all promotional codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Code</TableHead>
                  <TableHead className="text-gray-300">Reward</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Start Date</TableHead>
                  <TableHead className="text-gray-300">End Date</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.code} className="border-gray-700">
                    <TableCell className="font-mono text-white">{code.code}</TableCell>
                    <TableCell className="text-yellow-400">{code.reward}</TableCell>
                    <TableCell>{getStatusBadge(code)}</TableCell>
                    <TableCell className="text-gray-300">{formatDate(code.add_date)}</TableCell>
                    <TableCell className="text-gray-300">{formatDate(code.end_date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(code)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCode(code.code)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Code</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the promotional code details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCode} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Code</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter code"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Reward</label>
              <Input
                value={formData.reward}
                onChange={(e) => setFormData(prev => ({ ...prev, reward: e.target.value }))}
                placeholder="Enter reward"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Start Date</label>
              <Input
                type="date"
                value={formData.add_date}
                onChange={(e) => setFormData(prev => ({ ...prev, add_date: e.target.value }))}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">End Date</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Code'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
