'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner"

// Define code data interface
interface CodeData {
  code: string;
  reward: string;
  add_date: string;
  end_date: string;
  status: 'active' | 'expired';
}

// Define result interface for API response
interface ClaimResult {
  code: string;
  status: 'success' | 'error';
  message: string;
  errorCode?: string;
}

export default function CodesPage() {
  const [codes, setCodes] = useState<CodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [username, setUsername] = useState<string>('');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimResults, setClaimResults] = useState<ClaimResult[]>([]);
  const [, setLastUpdated] = useState<string | null>(null);
  const router = useRouter();

  // Function to update expired codes on the server
  const updateExpiredCodesOnServer = async (updatedCodes: CodeData[]) => {
    try {
      const response = await fetch('/api/update-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updatedCodes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update codes on server');
      }

      return true;
    } catch (err) {
      console.error('Error updating codes on server:', err);
      return false;
    }
  };

  // Function to fetch and update codes data
  const fetchCodes = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Try to get data from localStorage if not forcing refresh
      const cachedData = localStorage.getItem('bd2_codes_data');
      const lastUpdatedTime = localStorage.getItem('bd2_codes_last_updated');

      // Check if we have cached data and it's less than 5 minutes old
      if (!forceRefresh && cachedData && lastUpdatedTime) {
        const lastUpdate = new Date(lastUpdatedTime);
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - lastUpdate.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        // If data is less than 1 minute old, use cached data
        if (minutesDiff < 1) {
          const parsedData = JSON.parse(cachedData);

          // Still update status based on current date
          const currentDate = new Date();
          const updatedCodes = parsedData.map((code: CodeData) => {
            const endDate = new Date(code.end_date);
            // Set to end of day for accurate comparison
            endDate.setHours(23, 59, 59, 999);

            // If end date has passed, mark as expired
            if (currentDate > endDate && code.status === 'active') {
              return { ...code, status: 'expired' as const };
            }
            return code;
          });

          // Check if any codes were updated to expired
          const hasExpiredUpdates = updatedCodes.some((code: CodeData, index: number) =>
            code.status === 'expired' && parsedData[index].status === 'active'
          );

          // If any codes were newly marked as expired, update the server
          if (hasExpiredUpdates) {
            updateExpiredCodesOnServer(updatedCodes);
          }

          setCodes(updatedCodes);
          setLastUpdated(lastUpdate.toLocaleString());
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data if no cache or cache is old
      const response = await fetch('/api/codes');
      if (!response.ok) {
        throw new Error('Failed to fetch codes');
      }
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch codes');
      }

      const codes = data.codes;

      // Update status based on current date
      const currentDate = new Date();
      const updatedCodes = codes.map((code: CodeData) => {
        const endDate = new Date(code.end_date);
        // Set to end of day for accurate comparison
        endDate.setHours(23, 59, 59, 999);

        // If end date has passed, mark as expired
        if (currentDate > endDate && code.status === 'active') {
          return { ...code, status: 'expired' as const };
        }
        return code;
      });

      // Check if any codes were updated to expired
      const hasExpiredUpdates = updatedCodes.some((code: CodeData, index: number) =>
        code.status === 'expired' && codes[index].status === 'active'
      );

      // If any codes were newly marked as expired, update the server
      if (hasExpiredUpdates) {
        updateExpiredCodesOnServer(updatedCodes);
      }

      setCodes(updatedCodes);
      const now = new Date();
      setLastUpdated(now.toLocaleString());

      // Save to localStorage
      localStorage.setItem('bd2_codes_data', JSON.stringify(updatedCodes));
      localStorage.setItem('bd2_codes_last_updated', now.toString());

      // Show success toast on manual refresh
      if (forceRefresh) {
        toast.success("Dữ liệu đã được cập nhật");
      }
    } catch {
      setError('Failed to load code data');
      if (forceRefresh) {
        toast.error("Không thể cập nhật dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
  void fetchCodes(true);
};
  // Load code data on component mount
  useEffect(() => {
    // Load saved username if available
    const savedUsername = localStorage.getItem('bd2_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    fetchCodes();

    // Set up interval to check for expired codes every 5 minutes
    const intervalId = setInterval(() => {
      // Update status based on current date without full refresh
      const currentDate = new Date();
      setCodes(prevCodes => {
        let hasChanges = false;
        let expiredCodesCount = 0;

        const updatedCodes = prevCodes.map(code => {
          const endDate = new Date(code.end_date);
          endDate.setHours(23, 59, 59, 999);

          if (currentDate > endDate && code.status === 'active') {
            hasChanges = true;
            expiredCodesCount++;
            return { ...code, status: 'expired' as const };
          }
          return code;
        });

        // Update last updated time if there were changes
        if (hasChanges) {
          const now = new Date();
          setLastUpdated(now.toLocaleString());

          // Update localStorage with the new data
          localStorage.setItem('bd2_codes_data', JSON.stringify(updatedCodes));
          localStorage.setItem('bd2_codes_last_updated', now.toString());

          // Update the server with the new expired codes
          updateExpiredCodesOnServer(updatedCodes);

          // Show notification about expired codes
          if (expiredCodesCount > 0) {
            toast.info(
              `${expiredCodesCount} mã đã hết hạn vừa được cập nhật`,
              { description: 'Trạng thái đã được tự động cập nhật thành Expired' }
            );
          }
        }

        return updatedCodes;
      });
    }, 300000); // Check every 5 minutes

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchCodes]);

  // Calculate days until end date for each code
  const getCurrentDaysUntilEnd = (endDateString: string) => {
    const endDate = new Date(endDateString);
    endDate.setHours(23, 59, 59, 999);
    const currentDate = new Date();
    const timeDiff = endDate.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  // Filter and sort codes list
  const filteredCodes = (filter === 'all'
    ? [...codes]
    : codes.filter(code => code.status === filter))
    // Custom sort: expired codes at bottom, long-lasting codes (>1000 days) just before expired codes
    .sort((a, b) => {
      // First priority: expired codes always at bottom
      if (a.status === 'expired' && b.status !== 'expired') return 1;
      if (a.status !== 'expired' && b.status === 'expired') return -1;

      // Second priority: long-lasting codes (>1000 days) just before expired codes
      const daysA = a.status === 'active' ? getCurrentDaysUntilEnd(a.end_date) : -1;
      const daysB = b.status === 'active' ? getCurrentDaysUntilEnd(b.end_date) : -1;

      const isLongLastingA = daysA > 1000;
      const isLongLastingB = daysB > 1000;

      if (isLongLastingA && !isLongLastingB) return 1;
      if (!isLongLastingA && isLongLastingB) return -1;

      // Third priority: keep original order in data for normal codes
      return 0;
    });

  // Count codes by status
  const activeCodes = codes.filter(code => code.status === 'active').length;
  const expiredCodes = codes.filter(code => code.status === 'expired').length;

  // Handle checkbox selection
  const handleCheckboxChange = (code: string) => {
    setSelectedCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedCodes.length === filteredCodes.filter(code => code.status === 'active').length) {
      // If all codes are selected, deselect all
      setSelectedCodes([]);
    } else {
      // Otherwise, select all filtered codes
      setSelectedCodes(
        filteredCodes
          .filter(code => code.status === 'active')
          .map(code => code.code)
      );
    }
  };

  // Handle code click to copy
  const handleCodeClick = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.success("Mã đã được sao chép!", {
          description: code,
        });
      })
      .catch(() => {
        toast.error("Không thể sao chép mã.");
      });
  };

  // Handle claim button click
  const handleClaim = async () => {
    if (!username.trim()) {
      toast.warning("Vui lòng nhập tên người dùng");
      return;
    }

    if (selectedCodes.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một mã");
      return;
    }

    // Save username to localStorage
    localStorage.setItem('bd2_username', username.trim());

    setClaimLoading(true);
    setClaimResults([]);

    const results: ClaimResult[] = [];

    try {
      // Process each code one by one
      for (const code of selectedCodes) {
        // 使用本地代理API而不是直接访问外部API
        const url = '/api/claim-code';
        const headers = {
          'content-type': 'application/json'
        };

        const payload = {
          'userId': username,
          'code': code
        };

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
          });

          const responseData = await response.json();

          if (responseData.errorCode) {
            let message = 'Unknown error';

            if (responseData.errorCode === 'InvalidCode') {
              message = 'Mã coupon không hợp lệ';
            } else if (responseData.errorCode === 'InvalidUser' || responseData.message.includes('Failed to verify')) {
              message = 'ID người chơi không hợp lệ';
            } else if (responseData.errorCode === 'ExpiredCode' || responseData.message === '이미 사용한 쿠폰입니다. (키워드)') {
              message = 'Mã coupon đã được sử dụng';
            } else if (responseData.message) {
              message = responseData.message;
            }

            results.push({
              code,
              status: 'error',
              message,
              errorCode: responseData.errorCode
            });
          } else {
            results.push({
              code,
              status: 'success',
              message: 'Claim thành công'
            });
          }
        } catch {
          console.error('Error claiming code:', code);
          results.push({
            code,
            status: 'error',
            message: 'Lỗi kết nối'
          });
        }
      }
    } finally {
      setClaimResults(results);
      setClaimLoading(false);

      // Clear selected codes that were successfully claimed
      const successfulCodes = results
        .filter(result => result.status === 'success')
        .map(result => result.code);

      if (successfulCodes.length > 0) {
        setSelectedCodes(prev => prev.filter(code => !successfulCodes.includes(code)));
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate and format remaining time
  const getRemainingTime = (endDateString: string) => {
    const endDate = new Date(endDateString);
    // Set to end of day
    endDate.setHours(23, 59, 59, 999);

    const currentDate = new Date();
    const timeDiff = endDate.getTime() - currentDate.getTime();

    // If already expired
    if (timeDiff <= 0) {
      return null;
    }

    // Calculate days, hours
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Only show days left if less than 10 days remaining
    if (days > 0) {
      if (days < 10) {
        return `${days} day${days > 1 ? 's' : ''} left`;
      } else {
        return null; // Don't show days left if more than 10 days
      }
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} left`;
    }
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-3 text-sm">{error}</p>
          <button
            onClick={handleBackNavigation}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-bold text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm shadow-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackNavigation}
                className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-700/80 border border-gray-600/50 hover:border-green-400/50 transition-all duration-200"
              >
                <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors text-base">←</span>
                <span className="text-slate-300 group-hover:text-white font-medium text-sm">Back to Home</span>
              </button>

              <h1 className="text-xl font-bold text-white ml-3">Promotion Codes</h1>

              <button
                onClick={refreshData}
                className="ml-auto px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
              >
                Refresh
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-700/30 p-1.5 rounded-xl">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'all'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
              >
                All <span className="ml-1.5 px-1.5 py-0.5 bg-slate-700/50 rounded-md text-xs">{codes.length}</span>
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'active'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
              >
                Active <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-600/30 rounded-md text-xs">{activeCodes}</span>
              </button>
              <button
                onClick={() => setFilter('expired')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'expired'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
              >
                Expired <span className="ml-1.5 px-1.5 py-0.5 bg-slate-600/30 rounded-md text-xs">{expiredCodes}</span>
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex md:hidden flex-col gap-4">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBackNavigation}
                className="group flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 hover:border-emerald-400/30 transition-all duration-300"
              >
                <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors text-sm">←</span>
                <span className="text-slate-300 group-hover:text-white font-medium text-xs">Back</span>
              </button>
              <div className="text-center">
                <h1 className="text-base font-bold text-white">Codes</h1>
                <p className="text-slate-400 text-xs">Promotional codes</p>
              </div>
              <button
                onClick={refreshData}
                className="px-2 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
              >
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-700/30 p-1.5 rounded-lg">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${filter === 'all'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
              >
                All
                <span className="block mt-0.5 text-[10px] opacity-80">{codes.length}</span>
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${filter === 'active'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
              >
                Active
                <span className="block mt-0.5 text-[10px] opacity-80">{activeCodes}</span>
              </button>
              <button
                onClick={() => setFilter('expired')}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${filter === 'expired'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
              >
                Expired
                <span className="block mt-0.5 text-[10px] opacity-80">{expiredCodes}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Username Input and Claim Button */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your BD2 user ID"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5"
              disabled={claimLoading}
            >
              <span>{selectedCodes.length === filteredCodes.length && filteredCodes.length > 0 ? 'Deselect All' : 'Select All'}</span>
            </button>
            <button
              onClick={handleClaim}
              disabled={claimLoading}
              className={`px-4 py-2 ${claimLoading ? 'bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-500'} text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-emerald-900/20`}
            >
              {claimLoading ? (
                <>
                  <span className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent mr-1.5"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Claim Selected</span>
                  {selectedCodes.length > 0 && (
                    <span className="bg-emerald-700/50 px-1.5 py-0.5 rounded text-xs">
                      {selectedCodes.length}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Claim Results */}
        {claimResults.length > 0 && (
          <div className="mb-6 space-y-3">
            <h3 className="text-base font-semibold text-white">Claim Results:</h3>
            <div className="space-y-2">
              {claimResults.map((result) => (
                <Alert key={result.code} className={`border ${result.status === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'} py-2 px-3`}>
                  <div className="flex items-start">
                    <div className={`mr-1.5 mt-0.5 rounded-full p-0.5 text-xs ${result.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {result.status === 'success' ? '✓' : '✗'}
                    </div>
                    <div>
                      <AlertTitle className={`font-mono text-sm ${result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.code}
                      </AlertTitle>
                      <AlertDescription className="text-slate-300 text-xs">
                        {result.message}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}
        {/* Codes Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-700/50">
                <TableRow>
                  <TableHead className="text-white text-xs uppercase tracking-wider text-center w-24">Select</TableHead>
                  <TableHead className="text-white text-xs uppercase tracking-wider text-center w-24">Code</TableHead>
                  <TableHead className="text-white text-xs uppercase tracking-wider text-center">Reward</TableHead>
                  <TableHead className="text-white text-xs uppercase tracking-wider hidden md:table-cell text-center">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-700/30">
                {filteredCodes.length > 0 ? (
                  filteredCodes.map((codeItem) => (
                    <TableRow key={codeItem.code} className="hover:bg-slate-700/30 transition-all duration-200 group">
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 mx-auto w-fit">
                          <span className={`w-2 h-2 ${codeItem.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'} rounded-full`}></span>
                          <label className="relative flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCodes.includes(codeItem.code)}
                              onChange={() => handleCheckboxChange(codeItem.code)}
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 bg-slate-700 border-2 border-slate-600 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all duration-200 flex items-center justify-center">
                              {selectedCodes.includes(codeItem.code) && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </label>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleCodeClick(codeItem.code)}
                            className="font-mono font-semibold text-white text-sm hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1.5 cursor-pointer"
                            title="Click to copy"
                          >
                            <span>{codeItem.code}</span>
                          </button>
                          {codeItem.status === 'active' && getRemainingTime(codeItem.end_date) && getCurrentDaysUntilEnd(codeItem.end_date) <= 1000 && (
                            <span className="text-amber-400 text-xs font-medium">
                              {getRemainingTime(codeItem.end_date)}
                            </span>
                          )}
                          {codeItem.status === 'active' && getCurrentDaysUntilEnd(codeItem.end_date) > 1000 && (
                            <span className="text-emerald-400 text-xs font-medium">
                              Dài hạn
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-center">
                        <span className="text-amber-400 font-semibold text-sm inline-block">{codeItem.reward}</span>
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-slate-300 text-sm hidden md:table-cell text-center">
                        {getCurrentDaysUntilEnd(codeItem.end_date) > 1000
                          ? <span className="text-emerald-400">Dài hạn</span>
                          : formatDate(codeItem.end_date)
                        }
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-10 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center">
                          <span className="text-slate-400 text-xl">📭</span>
                        </div>
                        <div>
                          <p className="text-slate-400 text-base font-medium">Không tìm thấy mã nào</p>
                          <p className="text-slate-500 text-xs mt-1">Không có mã nào phù hợp với bộ lọc hiện tại</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}