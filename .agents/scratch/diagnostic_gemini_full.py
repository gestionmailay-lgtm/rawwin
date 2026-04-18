import google.generativeai as genai

# Ta clé API
api_key = "AIzaSyBzgJ94U5Aiz9av70p6UFzzyDOVvbIJSiA"
genai.configure(api_key=api_key)

print("--- DIAGNOSTIC COMPLET ---")

try:
    print("\n1. Listing exhaustif des modèles...")
    models = genai.list_models()
    final_list = []
    for m in models:
        final_list.append(m.name)
        # On vérifie les méthodes supportées
        print(f"   - {m.name} (Methods: {m.supported_generation_methods})")
    
    print(f"\n2. Test de génération sur le modèle 3.1 détecté...")
    if "models/gemini-3.1-flash-live-preview" in final_list:
        model = genai.GenerativeModel('gemini-3.1-flash-live-preview')
        try:
            response = model.generate_content("Dis moi OK.")
            print(f"   [SUCCESS 3.1] : {response.text}")
        except Exception as e31:
            print(f"   [FAILED 3.1] : {str(e31)}")
    else:
        print("   [!] Le modèle 3.1 n'est plus dans la liste.")

except Exception as e:
    print(f"\n[ERREUR] : {str(e)}")

print("\n--- FIN DIAGNOSTIC ---")
