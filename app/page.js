"use client";

import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: username }),
    });
    const data = await res.json();
    if (data.message) {
      // Assuming the API returns the updated leaderboard
      setLeaderboard(data.leaderboard);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold mb-4">RemixRanked</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your WoW character name"
          className="border p-2 mb-4"
        />
        <button
          onClick={fetchLeaderboard}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </div>
      <div className="w-full max-w-3xl">
        <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
        <ul className="border p-4">
          {leaderboard.length === 0 ? (
            <p>No data available</p>
          ) : (
            leaderboard.map((entry, index) => (
              <li key={index} className="border-b py-2">
                {index + 1}. {entry.name} - ilvl: {entry.ilvl}
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}
