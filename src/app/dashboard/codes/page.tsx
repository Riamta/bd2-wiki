"use client"

import { useAuth } from '@/contexts/AuthContext';
import CodesManagement from '@/components/admin/CodesManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function DashboardCodesPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
              <p className="text-gray-400">You need admin privileges to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CodesManagement />
      </div>
    </div>
  );
}
