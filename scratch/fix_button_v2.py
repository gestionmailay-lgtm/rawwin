import os

file_path = r"c:\Users\yvesa\Desktop\Projet PRO\rawwin\app\dashboard\serres\parametrage\page.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if "Nouvel Import" in line and "</Button>" in line:
        # Check if Sparkles is already there
        if "Sparkles" not in "".join(lines[lines.index(line):lines.index(line)+30]):
            new_lines.append('                      <Button \n')
            new_lines.append('                        variant="ghost" \n')
            new_lines.append('                        onClick={runGeminiAnalysis} \n')
            new_lines.append('                        disabled={analyzing}\n')
            new_lines.append('                        className="rounded-[2rem] h-16 px-8 gap-3 text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/5 transition-all outline-none"\n')
            new_lines.append('                      >\n')
            new_lines.append('                         <Sparkles className={`h-5 w-5 ${analyzing ? "animate-spin" : ""}`} /> \n')
            new_lines.append('                         {analyzing ? "Mise à jour IA..." : "Relancer Analyse IA"}\n')
            new_lines.append('                      </Button>\n')

with open(file_path, 'w', encoding='utf-8', newline='') as f:
    f.writelines(new_lines)

print("Insertion completed.")
