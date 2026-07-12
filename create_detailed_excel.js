const ExcelJS = require('exceljs');

async function createAdvancedExcel() {
  const workbook = new ExcelJS.Workbook();

  // --- FEUILLE 1: BASE ENGRAIS ---
  const sheetEngrais = workbook.addWorksheet('1. Base Engrais');
  sheetEngrais.columns = [
    { header: 'Engrais', key: 'nom', width: 30 },
    { header: 'Formule', key: 'formule', width: 20 },
    { header: 'N-NO3 (mmol/kg)', key: 'no3', width: 15 },
    { header: 'N-NH4 (mmol/kg)', key: 'nh4', width: 15 },
    { header: 'P (mmol/kg)', key: 'p', width: 15 },
    { header: 'K (mmol/kg)', key: 'k', width: 15 },
    { header: 'Ca (mmol/kg)', key: 'ca', width: 15 },
    { header: 'Mg (mmol/kg)', key: 'mg', width: 15 },
    { header: 'S (mmol/kg)', key: 's', width: 15 }
  ];

  const engraisData = [
    { nom: 'Nitrate de Calcium', formule: 'Ca(NO3)2', no3: 11.9, nh4: 0.1, p: 0, k: 0, ca: 8.0, mg: 0, s: 0 },
    { nom: 'Nitrate de Potassium', formule: 'KNO3', no3: 13.0, nh4: 0, p: 0, k: 38.0, ca: 0, mg: 0, s: 0 },
    { nom: 'Phosphate Monopotassique (MKP)', formule: 'KH2PO4', no3: 0, nh4: 0, p: 22.7, k: 28.2, ca: 0, mg: 0, s: 0 },
    { nom: 'Sulfate de Magnésium', formule: 'MgSO4', no3: 0, nh4: 0, p: 0, k: 0, ca: 0, mg: 4.1, s: 5.4 },
    { nom: 'Sulfate de Potassium', formule: 'K2SO4', no3: 0, nh4: 0, p: 0, k: 41.5, ca: 0, mg: 0, s: 18.0 }
  ];
  sheetEngrais.addRows(engraisData);
  sheetEngrais.getRow(1).font = { bold: true };

  // --- FEUILLE 2: ANALYSES EAU & MIX ---
  const sheetEau = workbook.addWorksheet('2. Analyses Eau & Mix');
  
  // En-têtes pour les analyses
  const params = ['Paramètre', 'EC (mS/cm)', 'pH', 'NO3-', 'NH4+', 'P', 'K+', 'Ca2+', 'Mg2+', 'SO4 2-', 'Cl-', 'Na+', 'HCO3-'];
  sheetEau.addRow(['TYPE D\'EAU', ...params.slice(1)]);
  
  const sources = ['Eau de Forage', 'Eau de Pluie', 'Eau de Drainage'];
  sources.forEach(s => {
    sheetEau.addRow([s, 0, 7.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  sheetEau.addRow([]);
  sheetEau.addRow(['COMPOSITION DU MIX D\'IRRIGATION']);
  sheetEau.addRow(['Source', 'Pourcentage (%)']);
  sheetEau.addRow(['Eau de Forage', 60]);
  sheetEau.addRow(['Eau de Pluie', 30]);
  sheetEau.addRow(['Eau de Drainage', 10]);
  sheetEau.addRow(['TOTAL', { formula: 'SUM(B10:B12)' }]);

  // Style
  sheetEau.getRow(1).font = { bold: true };
  sheetEau.getRow(8).font = { bold: true };
  sheetEau.getRow(9).font = { bold: true };

  // --- FEUILLE 3: RECETTE WAGENINGEN ---
  const sheetRecette = workbook.addWorksheet('3. Recette & Correction');
  
  sheetRecette.addRow(['CULTURE : TOMATE HORS-SOL (Stade Pleine Production)']);
  sheetRecette.addRow([]);
  sheetRecette.addRow(['Ion', 'Cible Wageningen (mmol/L)', 'Apport Mix Eau (mmol/L)', 'Besoin à ajouter (mmol/L)', 'Correction Drainage']);
  
  const targetWUR = [
    { ion: 'NO3-', val: 12.0 },
    { ion: 'NH4+', val: 1.2 },
    { ion: 'P', val: 1.5 },
    { ion: 'K+', val: 9.5 },
    { ion: 'Ca2+', val: 4.5 },
    { ion: 'Mg2+', val: 2.0 },
    { ion: 'SO4 2-', val: 2.5 }
  ];

  targetWUR.forEach(t => {
    sheetRecette.addRow([t.ion, t.val, 0, t.val, 0]);
  });

  sheetRecette.addRow([]);
  sheetRecette.addRow(['NOTE : Les calculs de correction doivent être ajustés en fonction des analyses réelles saisies en page 2.']);

  sheetRecette.getRow(1).font = { bold: true, size: 14 };
  sheetRecette.getRow(3).font = { bold: true };

  // SAUVEGARDE
  await workbook.xlsx.writeFile('C:\\Users\\yvesa\\Desktop\\Recette_Tomate_WUR.xlsx');
  console.log('Fichier détaillé créé : Recette_Tomate_WUR.xlsx');
}

createAdvancedExcel().catch(err => console.error(err));
