const ExcelJS = require('exceljs');

async function createProExcel() {
  const workbook = new ExcelJS.Workbook();

  // --- 1. DICTIONNAIRE ENGRAIS (DONNÉES TECHNIQUES) ---
  const sheetDB = workbook.addWorksheet('📚 Dictionnaire Engrais');
  sheetDB.columns = [
    { header: 'Engrais', key: 'nom', width: 30 },
    { header: 'Élément Clé', key: 'element', width: 15 },
    { header: 'Pureté (%)', key: 'purity', width: 12 },
    { header: 'N-NO3 (%)', key: 'n_no3', width: 10 },
    { header: 'N-NH4 (%)', key: 'n_nh4', width: 10 },
    { header: 'P (%)', key: 'p', width: 10 },
    { header: 'K (%)', key: 'k', width: 10 },
    { header: 'Ca (%)', key: 'ca', width: 10 },
    { header: 'Mg (%)', key: 'mg', width: 10 },
    { header: 'S (%)', key: 's', width: 10 },
    { header: 'Cl (%)', key: 'cl', width: 10 },
    { header: 'Oligos (g/kg)', key: 'oligo', width: 15 }
  ];

  const db = [
    ['Nitrate de Calcium (Calcinit)', 'Ca', 100, 14.4, 1.1, 0, 0, 19.0, 0, 0, 0, 0],
    ['Nitrate de Potassium', 'K', 100, 13.0, 0, 0, 38.2, 0, 0, 0, 0, 0],
    ['Phosphate Monopotassique (MKP)', 'P', 100, 0, 0, 22.7, 28.6, 0, 0, 0, 0, 0],
    ['Sulfate de Magnésium (Epsom)', 'Mg', 100, 0, 0, 0, 0, 0, 9.8, 13.0, 0, 0],
    ['Nitrate de Magnésium', 'Mg', 100, 10.8, 0, 0, 0, 0, 9.5, 0, 0, 0],
    ['Sulfate de Potassium', 'K', 100, 0, 0, 0, 41.5, 0, 0, 18.4, 0, 0],
    ['Chlorure de Potassium (KCl)', 'Cl', 100, 0, 0, 0, 52.4, 0, 0, 0, 47.6, 0],
    ['Sulfate de Fer (Fe-DTPA 7%)', 'Fe', 100, 0, 0, 0, 0, 0, 0, 0, 0, 70],
    ['Sulfate de Manganese', 'Mn', 100, 0, 0, 0, 0, 0, 0, 19.0, 0, 310],
    ['Sulfate de Zinc', 'Zn', 100, 0, 0, 0, 0, 0, 0, 11.0, 0, 220],
    ['Bore (Acide Borique)', 'B', 100, 0, 0, 0, 0, 0, 0, 0, 0, 175],
    ['Sulfate de Cuivre', 'Cu', 100, 0, 0, 0, 0, 0, 0, 12.0, 0, 250],
    ['Molybdate de Sodium', 'Mo', 100, 0, 0, 0, 0, 0, 0, 0, 0, 390],
    ['Acide Nitrique (65%)', 'N', 65, 15.5, 0, 0, 0, 0, 0, 0, 0, 0],
    ['Acide Phosphorique (75%)', 'P', 75, 0, 0, 23.7, 0, 0, 0, 0, 0, 0]
  ];
  sheetDB.addRows(db);
  styleHeader(sheetDB);

  // --- 2. ANALYSES EAU PRO ---
  const sheetEau = workbook.addWorksheet('💧 Analyses Eau Pro');
  sheetEau.columns = [{ width: 25 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }];
  sheetEau.addRow(['VALEURS ANALYSE EAU (mmol/L)']);
  sheetEau.addRow(['Source', 'EC', 'pH', 'NO3', 'P', 'K', 'Ca', 'Mg', 'SO4', 'Na', 'Cl', 'HCO3']);
  sheetEau.addRow(['Eau de Forage', 0.8, 7.5, 0.2, 0.05, 0.1, 3.0, 1.2, 1.5, 1.5, 2.0, 4.0]);
  sheetEau.addRow(['Eau de Pluie', 0.1, 6.5, 0.05, 0, 0.05, 0.1, 0.05, 0.1, 0.1, 0.1, 0.2]);
  sheetEau.addRow(['Eau de Drainage', 2.8, 6.2, 14.0, 2.5, 12.0, 8.0, 4.0, 5.0, 5.0, 6.0, 1.0]);
  
  sheetEau.addRow([]);
  sheetEau.addRow(['MIX IRRIGATION (%)']);
  sheetEau.addRow(['Forage', 'Pluie', 'Drainage', 'TOTAL']);
  sheetEau.addRow([60, 30, 10, { formula: 'SUM(A9:C9)' }]);

  sheetEau.addRow([]);
  sheetEau.addRow(['COMPOSITION DU MIX EAU CALCULÉ (mmol/L)']);
  const ions = ['EC', 'pH', 'NO3', 'P', 'K', 'Ca', 'Mg', 'SO4', 'Na', 'Cl', 'HCO3'];
  ions.forEach((ion, i) => {
    sheetEau.getCell(`A${13 + i}`).value = ion;
    const colChar = String.fromCharCode(66 + i);
    sheetEau.getCell(`B${13 + i}`).value = { formula: `(${colChar}3 * A9 + ${colChar}4 * B9 + ${colChar}5 * C9) / 100` };
  });
  styleHeader(sheetEau);

  // --- 3. CIBLES WAGENINGEN ---
  const sheetCibles = workbook.addWorksheet('🎯 Cibles Wageningen');
  sheetCibles.addRow(['CIBLES NUTRITIONNELLES TOMATE (mmol/L)']);
  sheetCibles.addRow(['Growth Stage', 'NO3', 'P', 'K', 'Ca', 'Mg', 'SO4', 'Fe (µmol)', 'Mn (µmol)', 'B (µmol)', 'Zn (µmol)', 'Cu (µmol)']);
  sheetCibles.addRow(['Start/Planting', 10.0, 1.2, 5.5, 5.5, 2.0, 2.0, 15, 10, 20, 5, 0.75]);
  sheetCibles.addRow(['Vegetative', 14.0, 1.5, 7.5, 5.0, 2.0, 2.5, 25, 10, 30, 5, 0.75]);
  sheetCibles.addRow(['Generative/Fruiting', 12.4, 1.5, 9.5, 4.5, 2.0, 2.5, 25, 10, 30, 7, 0.75]);
  styleHeader(sheetCibles);

  // --- 4. CALCULATEUR A & B ---
  const sheetBacs = workbook.addWorksheet('🧪 Calculateur Bacs A & B');
  sheetBacs.addRow(['PARAMÈTRES SYSTÈME']);
  sheetBacs.addRow(['Volume Bacs (L)', 1000, 'Facteur Conc.', 100]);
  sheetBacs.addRow(['Neutralisation HCO3 (%)', 80]); // On neutralise 80% des bicarbonates

  sheetBacs.addRow([]);
  sheetBacs.addRow(['CALCUL DES QUANTITÉS POUR 1000L CONCENTRÉS (kg)']);
  
  // Section BAC B (Calcium / Nitrate) - Traditionnellement Bac B = Calcium
  sheetBacs.addRow(['🚀 BAC B (Calcium & Nitrate)']);
  sheetBacs.addRow(['Engrais', 'Poids (kg)', 'Note']);
  sheetBacs.addRow(['Nitrate de Calcium', 95, 'Source principale Ca']);
  sheetBacs.addRow(['Nitrate de Potassium', 25, 'Complément Azote/Potasse']);
  sheetBacs.addRow(['Fe-DTPA 7%', 0.35, 'Chelate de Fer']);

  // Section BAC A (Phosphore / Sulphate) - Traditionnellement Bac A = P/S
  sheetBacs.addRow(['🚀 BAC A (Phosphore & Magnésium)']);
  sheetBacs.addRow(['Engrais', 'Poids (kg)', 'Note']);
  sheetBacs.addRow(['MKP', 15, 'Source Phosphore']);
  sheetBacs.addRow(['Sulfate de Magnésium', 45, 'Source Magnésium/Soufre']);
  sheetBacs.addRow(['Sulfate de Potassium', 12, 'Apport K sans NO3']);
  sheetBacs.addRow(['Micro-éléments (Mix Oligos)', 0.15, 'Mn, Zn, B, Cu, Mo']);

  sheetBacs.addRow([]);
  sheetBacs.addRow(['⚠️ PRÉCAUTION : Toujours verser l\'acide APRES avoir mis l\'eau, et ne JAMAIS mélanger les engrais du bac A et B sous forme concentrée.']);

  styleHeader(sheetBacs);

  // --- SAUVEGARDE ---
  await workbook.xlsx.writeFile('C:\\Users\\yvesa\\Desktop\\Outil_Nutrition_Tomate_PRO.xlsx');
  console.log('Outil professionnel généré avec succès.');
}

function styleHeader(sheet) {
  sheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  sheet.getRow(2).font = { bold: true };
  sheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  sheet.eachRow((row) => {
    row.alignment = { vertical: 'middle', horizontal: 'left' };
    row.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
}

createProExcel().catch(err => console.error(err));
