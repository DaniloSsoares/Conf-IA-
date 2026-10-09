import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

//const supabaseUrl = 'https://rismzbwyptquzmvzagnk.supabase.co';
//const supabaseKey = "sb_publishable_LoJKg7209PXxttjeyD0uag_0NY-gMSJ";
const supabaseUrl= process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseKey= process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabaseConfig = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
