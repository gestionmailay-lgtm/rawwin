import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2]?.trim();
  });
} catch (e) {
  console.log("No se pudo cargar .env.local de forma manual.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchTestData() {
  console.log(`🌐 Buscando la línea de la tabla 'test'...`);
  
  // Realiza el query a tu tabla "test"
  const { data, error } = await supabase.from('test').select('*');

  if (error) {
    console.error("❌ Error al consultar la base de datos:", error.message);
  } else {
    if (data && data.length > 0) {
      console.log(`✅ ¡Se encontraron ${data.length} líneas en la tabla 'test'!`);
      console.log(data);
    } else {
      console.log("⚠️ La consulta funcionó, pero devolvió 0 líneas.");
      console.log("👉 Esto suele suceder cuando has activado el 'Row Level Security' (RLS) en la tabla pero aún no tienes Políticas que permitan la lectura pública.");
    }
  }
}

fetchTestData();
