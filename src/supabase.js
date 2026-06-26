// src/supabase.js
// ⚠️  REEMPLAZÁ estos valores con los de TU proyecto Supabase
// Los encontrás en: supabase.com → Tu proyecto → Settings → API

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
