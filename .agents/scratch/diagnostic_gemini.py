import google.generativeai as genai
import os

# Ta clé API
api_key = "AIzaSyBzgJ94U5Aiz9av70p6UFzzyDOVvbIJSiA"
genai.configure(api_key=api_key)

print("--- DIAGNOSTIC GEMINI ---")

try:
    print("\n1. Listing des modèles disponibles pour cette clé...")
    models = genai.list_models()
    count = 0
    for m in models:
        print(f"   [OK] {m.name}")
        count += 1
    
    if count == 0:
        print("   [!] Aucun modèle trouvé. La clé est peut-être restreinte ou l'API n'est pas activée.")
    else:
        print(f"\n2. Test de génération simple avec gemini-1.5-flash...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Dis moi OK en un seul mot.")
        print(f"   [RETOUR IA] : {response.text}")

except Exception as e:
    print(f"\n[ERREUR FATALE] : {str(e)}")

print("\n-------------------------")
