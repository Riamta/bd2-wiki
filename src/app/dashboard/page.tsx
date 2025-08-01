"use client"

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Database, Activity, Calendar, Mail, Code, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  lastLogin: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    lastLogin: null,
  });

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For demo purposes, we'll use mock data
    setStats({
      totalUsers: 4,
      adminUsers: 2,
      regularUsers: 2,
      lastLogin: user?.lastLogin || null,
    });
  }, [user]);

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400">Welcome back, {user.username}!</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Your Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Username:</span>
                  <span className="text-white font-medium">{user.username}</span>
                  <Badge variant="secondary" className="bg-yellow-600 text-yellow-100">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{user.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Last Login:</span>
                    <span className="text-white">
                      {new Date(user.lastLogin).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                <Database className="h-3 w-3" />
                <span>Registered accounts</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.adminUsers}</div>
              <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                <Shield className="h-3 w-3" />
                <span>Admin privileges</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Regular Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.regularUsers}</div>
              <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                <Users className="h-3 w-3" />
                <span>Standard access</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">Online</div>
              <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                <Activity className="h-3 w-3" />
                <span>All systems operational</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tools */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Admin Tools</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Administrative functions and management tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/dashboard/codes">
                <Card className="bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Code className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Manage Codes</h3>
                        <p className="text-gray-400 text-sm">Add, edit, and delete promotional codes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Placeholder for future admin tools */}
              <Card className="bg-gray-700 border-gray-600 opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-600 rounded-lg">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-gray-400 font-medium">User Management</h3>
                      <p className="text-gray-500 text-sm">Coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-700 border-gray-600 opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-600 rounded-lg">
                      <Database className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-gray-400 font-medium">Data Management</h3>
                      <p className="text-gray-500 text-sm">Coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
