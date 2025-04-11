import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Users, MessageSquare, Activity } from 'lucide-react';

interface ChatStats {
  total_messages: number;
  total_users: number;
  messages_today: number;
  active_users_today: number;
}

interface UserMessage {
  id: string;
  email: string;
  message: string;
  ai_response: string;
  created_at: string;
}

interface DailyStats {
  date: string;
  messages: number;
  users: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<ChatStats>({
    total_messages: 0,
    total_users: 0,
    messages_today: 0,
    active_users_today: 0,
  });
  const [recentMessages, setRecentMessages] = useState<UserMessage[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      // Fetch messages with user details using the correct relationship
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          id,
          message,
          ai_response,
          created_at,
          user_id,
          user_profiles (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Calculate stats
      const totalMessages = messages?.length || 0;
      const messagesToday = messages?.filter(msg => 
        new Date(msg.created_at) >= today
      ).length || 0;

      // Get unique users
      const uniqueUsers = new Set(messages?.map(msg => msg.user_profiles?.email));
      const activeUsersToday = new Set(
        messages
          ?.filter(msg => new Date(msg.created_at) >= today)
          .map(msg => msg.user_profiles?.email)
      );

      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Calculate daily stats for the chart
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      }).reverse();

      const dailyStatsData = last7Days.map(date => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayMessages = messages?.filter(msg => 
          new Date(msg.created_at) >= date && new Date(msg.created_at) < nextDay
        );

        const uniqueDayUsers = new Set(dayMessages?.map(msg => msg.user_profiles?.email));

        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          messages: dayMessages?.length || 0,
          users: uniqueDayUsers.size
        };
      });

      setStats({
        total_messages: totalMessages,
        total_users: totalUsers || 0,
        messages_today: messagesToday,
        active_users_today: activeUsersToday.size
      });

      setDailyStats(dailyStatsData);

      // Transform messages for display
      const transformedMessages = messages?.map(msg => ({
        id: msg.id,
        email: msg.user_profiles?.email || 'Unknown',
        message: msg.message,
        ai_response: msg.ai_response,
        created_at: new Date(msg.created_at).toLocaleString()
      })) || [];

      setRecentMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => fetchDashboardData()}
          className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium mt-4">Total Messages</h3>
          <p className="text-2xl font-bold mt-1">{stats.total_messages}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium mt-4">Total Users</h3>
          <p className="text-2xl font-bold mt-1">{stats.total_users}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium mt-4">Messages Today</h3>
          <p className="text-2xl font-bold mt-1">{stats.messages_today}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium mt-4">Active Users Today</h3>
          <p className="text-2xl font-bold mt-1">{stats.active_users_today}</p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" fill="#3B82F6" name="Messages" />
              <Bar dataKey="users" fill="#8B5CF6" name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Recent Messages</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentMessages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {msg.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">{msg.message}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">{msg.ai_response}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {msg.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}