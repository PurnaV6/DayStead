import 'react-native-url-polyfill/auto';
import {createClient,processLock} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
// Publishable key only. Ownership is enforced by PostgreSQL row-level policies.
export const supabase=createClient('https://jlhhzmngotahugxjrdnk.supabase.co',"sb_publishable_lX0id77uDJuX3DqjeI2jmA_oyvFV1mE",{auth:{storage:AsyncStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false,lock:processLock}});
AppState.addEventListener('change',state=>{if(state==='active')supabase.auth.startAutoRefresh();else supabase.auth.stopAutoRefresh()});
