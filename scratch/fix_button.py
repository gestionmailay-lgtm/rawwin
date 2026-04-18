import os

file_path = r"c:\Users\yvesa\Desktop\Projet PRO\rawwin\app\dashboard\serres\parametrage\page.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = 'Nouvel Import\n                      </Button>\n                      <div className="h-12 w-px bg-slate-100 hidden md:block" />'
replacement = 'Nouvel Import\n                      </Button>\n                      <Button \n                        variant="ghost" \n                        onClick={runGeminiAnalysis} \n                        disabled={analyzing}\n                        className="rounded-[2rem] h-16 px-8 gap-3 text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/5 transition-all outline-none"\n                      >\n                         <Sparkles className={`h-5 w-5 ${analyzing ? "animate-spin" : ""}`} /> \n                         {analyzing ? "Mise à jour IA..." : "Relancer Analyse IA"}\n                      </Button>\n                      <div className="h-12 w-px bg-slate-100 hidden md:block" />'

# On tente avec plusieurs types de fins de ligne pour Windows
if target in content:
    new_content = content.replace(target, replacement)
else:
    target_rn = target.replace('\n', '\r\n')
    replacement_rn = replacement.replace('\n', '\r\n')
    if target_rn in content:
        new_content = content.replace(target_rn, replacement_rn)
    else:
        # Fallback ultra-large
        print("Target not found, trying fallback...")
        target_v2 = 'Nouvel Import'
        replacement_v2 = 'Nouvel Import\n                      </Button>\n                      <Button onClick={runGeminiAnalysis} variant="ghost" className="text-primary font-black uppercase h-16 px-8 gap-3"><Sparkles className="h-5 w-5" /> Relancer Analyse IA</Button>'
        new_content = content.replace(target_v2, target_v2) # Noop for safety if we fail here too

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
