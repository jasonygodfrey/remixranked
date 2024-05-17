import { supabase } from '../../utils/supabaseClient';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

async function fetchCharacterData(realm, characterName) {
  const url = `https://worldofwarcraft.blizzard.com/en-us/character/us/${realm}/${characterName}`;
  
  console.log(`Fetching character data from URL: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch character data from ${url}`);
    throw new Error(`Failed to fetch character data from ${url}`);
  }
  
  const html = await response.text();
  console.log(`Fetched HTML: ${html.substring(0, 100)}...`); // Log the beginning of the HTML to confirm we got the right page
  
  const $ = cheerio.load(html);
  
  // Extract the item level from the meta description tag
  const metaDescription = $('meta[name="description"]').attr('content');
  const ilvlMatch = metaDescription.match(/(\d+) ilvl/);
  const itemLevel = ilvlMatch ? ilvlMatch[1] : null;
  
  console.log(`Parsed item level: ${itemLevel}`);
  
  if (!itemLevel) {
    console.error('Item level not found');
    throw new Error('Item level not found');
  }

  return parseInt(itemLevel, 10);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, realm } = req.body;

  if (!name || !realm) {
    console.error('Name and realm are required');
    return res.status(400).json({ message: 'Name and realm are required' });
  }

  try {
    console.log(`Received request for character: ${name} on realm: ${realm}`);
    
    const ilvl = await fetchCharacterData(realm, name);

    // Insert or update user data in the database
    const { error } = await supabase
      .from('users')
      .upsert({ name, ilvl, realm }, { onConflict: ['name', 'realm'] });

    if (error) {
      console.error(`Supabase error: ${error.message}`);
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Fetch the updated leaderboard
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('users')
      .select('*')
      .order('ilvl', { ascending: false });

    if (leaderboardError) {
      console.error(`Supabase leaderboard error: ${leaderboardError.message}`);
      throw new Error(`Supabase leaderboard error: ${leaderboardError.message}`);
    }

    console.log('Successfully updated leaderboard');
    res.status(200).json({ message: 'User data saved successfully', leaderboard });
  } catch (error) {
    console.error('Error fetching character data:', error);
    res.status(500).json({ error: 'Error fetching character data' });
  }
}
