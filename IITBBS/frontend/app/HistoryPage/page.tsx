'use client'

import React, { useEffect, useState } from 'react'
import TimestampCard from './TimestampCard';
import Navbar from '../Homepage/navbar';
import { nasaApi, type GroupedHistoryDay } from '@/lib/nasa-api';

const HistoryPage = () => {
  const [historyDays, setHistoryDays] = useState<GroupedHistoryDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        const data = await nasaApi.getHistory();
        if (active) {
          setHistoryDays(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className='relative min-h-screen bg-[#02020a] overflow-hidden text-amber-50'>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-[#02020a] rounded-xl shadow-md p-6 mt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold border-b-2 border-blue-400 pb-1">
            Observation & Analysis History
          </h1>
          <span className="text-xs px-3 py-1 bg-blue-950 border border-blue-800 text-blue-300 rounded-full font-mono">
            {historyDays.length} Logged Session{historyDays.length === 1 ? '' : 's'}
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          Real-time record of inspected near-Earth asteroids, habitability predictions, and hazard evaluations recorded by the backend.
        </p>

        {loading ? (
          <div className="text-center py-16 text-cyan-400 animate-pulse">
            Loading trajectory and evaluation records...
          </div>
        ) : historyDays.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
            No inspection history recorded yet. Explore asteroids on the dashboard to build your observation log.
          </div>
        ) : (
          <div className="space-y-4">
            {historyDays.map((day, idx) => (
              <TimestampCard
                key={idx}
                date={day.date}
                status={day.status}
                tasks={day.tasks}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage;
