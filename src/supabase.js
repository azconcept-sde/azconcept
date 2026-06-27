import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL  || "https://fwynwohdkwpnqxflwqcj.supabase.co";
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3eW53b2hka3dwbnF4Zmx3cWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDEwMTcsImV4cCI6MjA5ODA3NzAxN30.BwgpwPewKQPl4yJ77q1qjYTf5OXgWBX0XRUzyN4yhb4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
