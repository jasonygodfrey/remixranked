"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [server, setServer] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setLoading(false);
  };

  const fetchCharacterData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, realm: server }),
      });
      const data = await response.json();
      setLeaderboard(data.leaderboard || []); // Ensure it's an array
    } catch (error) {
      console.error('Error fetching character data:', error);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-kungfu">
      <div className="flex flex-col items-center mb-8 bg-white bg-opacity-75 p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">RemixRanked</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your WoW character name"
          className="border p-2 mb-4 text-black"
        />
        <input
          type="text"
          value={server}
          onChange={(e) => setServer(e.target.value)}
          placeholder="Enter your WoW server (realm)"
          className="border p-2 mb-4 text-black"
        />
        <button
          onClick={fetchCharacterData}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </div>
      <div className="w-full max-w-3xl bg-white bg-opacity-75 p-8 rounded-lg">
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
