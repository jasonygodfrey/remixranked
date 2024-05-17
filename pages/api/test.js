import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
}
