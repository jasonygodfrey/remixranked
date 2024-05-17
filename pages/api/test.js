import { supabase } from '../../utils/supabaseClient';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

async function fetchCharacterData(realm, characterName) {
  const url = `https://worldofwarcraft.blizzard.com/en-us/character/us/${realm}/${characterName}`;
  
  const response = await fetch(url);
  const html = await response.text();
  
  const $ = cheerio.load(html);
  
  // Assuming the cloak item level is inside a div with class "CharacterProfile-itemLevel"
  const itemLevelElement = $(".CharacterProfile-itemLevel").first();
  const itemLevel = itemLevelElement.text().trim();
  
  if (!itemLevel) {
    throw new Error('Item level not found');
  }

  return parseInt(itemLevel, 10);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, realm } = req.body;

    try {
      const ilvl = await fetchCharacterData(realm, name);

      // Insert or update user data in the database
      const { error } = await supabase
        .from('users')
        .upsert({ name: name, ilvl: ilvl, realm: realm }, { onConflict: ['name', 'realm'] });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Fetch the updated leaderboard
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from('users')
        .select('*')
        .order('ilvl', { ascending: false });

      if (leaderboardError) {
        return res.status(500).json({ error: leaderboardError.message });
      }

      res.status(200).json({ message: 'User data saved successfully', leaderboard });
    } catch (error) {
      console.error('Error fetching character data:', error);
      res.status(500).json({ error: 'Error fetching character data' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
