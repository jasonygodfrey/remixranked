import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('users')
      .select('*')
      .order('ilvl', { ascending: false });

    if (leaderboardError) {
      console.error(`Supabase leaderboard error: ${leaderboardError.message}`);
      throw new Error(`Supabase leaderboard error: ${leaderboardError.message}`);
    }

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    res.status(500).json({ error: 'Error fetching leaderboard data' });
  }
}
