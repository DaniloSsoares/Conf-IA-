import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = 'https://rismzbwyptquzmvzagnk.supabase.co';
const supabaseKey = "sb_publishable_LoJKg7209PXxttjeyD0uag_0NY-gMSJ";

export const supabaseConfig = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
