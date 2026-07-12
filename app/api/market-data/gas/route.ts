import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
            .from('global_market_data')
            .select('data')
            .eq('id', 'gas_peg')
            .single();
        
        if (error || !data) {
            // Renvoie des données vides par défaut si rien n'a encore été synchronisé
            return NextResponse.json({ 
                prices: {}, 
                alerts: [], 
                last_update: "Aucune synchro" 
            });
        }
        
        return NextResponse.json(data.data);
    } catch (error: any) {
        console.error("Erreur lecture marché Supabase:", error);
        return NextResponse.json({ error: "Erreur lecture marché", details: error.message }, { status: 500 });
    }
}
