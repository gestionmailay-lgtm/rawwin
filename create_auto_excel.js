const ExcelJS = require('exceljs');

async function createAutomatedExcel() {
  const workbook = new ExcelJS.Workbook();

  // --- 1. BASE ENGRAIS ---
  const sheetEngrais = workbook.addWorksheet('1. Base Engrais');
  sheetEngrais.columns = [
    { header: 'Engrais', key: 'nom', width: 30 },
    { header: 'N-NO3 (mmol/kg)', key: 'no3', width: 15 },
    { header: 'N-NH4 (mmol/kg)', key: 'nh4', width: 15 },
    { header: 'P (mmol/kg)', key: 'p', width: 15 },
    { header: 'K (mmol/kg)', key: 'k', width: 15 },
    { header: 'Ca (mmol/kg)', key: 'ca', width: 15 },
    { header: 'Mg (mmol/kg)', key: 'mg', width: 15 },
    { header: 'S (mmol/kg)', key: 's', width: 15 }
  ];
  const engraisData = [
    ['Nitrate de Calcium', 11.9, 0.1, 0, 0, 8.0, 0, 0],
    ['Nitrate de Potassium', 13.0, 0, 0, 38.0, 0, 0, 0],
    ['MKP (Phosphate Monopot.)', 0, 0, 22.7, 28.2, 0, 0, 0],
    ['Sulfate de Magnésium', 0, 0, 0, 0, 0, 4.1, 5.4],
    ['Sulfate de Potassium', 0, 0, 0, 41.5, 0, 0, 18.0]
  ];
  sheetEngrais.addRows(engraisData);
  sheetEngrais.getRow(1).font = { bold: true };

  // --- 2. ANALYSES EAU & MIX ---
  const sheetEau = workbook.addWorksheet('2. Analyses Eau & Mix');
  sheetEau.getCell('A1').value = 'PARAMETRES ANALYSE (mmol/L)';
  sheetEau.getRow(2).values = ['Source', 'NO3', 'NH4', 'P', 'K', 'Ca', 'Mg', 'SO4'];
  sheetEau.getRow(3).values = ['Eau Forage', 0.5, 0, 0.1, 0.2, 2.5, 0.8, 1.2];
  sheetEau.getRow(4).values = ['Eau Pluie', 0.1, 0, 0, 0.1, 0.2, 0.1, 0.1];
  sheetEau.getRow(5).values = ['Eau Drainage', 14.0, 0.5, 2.0, 10.0, 6.0, 3.0, 4.0];

  sheetEau.getCell('A7').value = 'MIX IRRIGATION (%)';
  sheetEau.getRow(8).values = ['% Forage', '% Pluie', '% Drainage'];
  sheetEau.getRow(9).values = [60, 30, 10];

  sheetEau.getCell('A11').value = 'COMPOSITION MIX CALCULÉE (mmol/L)';
  sheetEau.getRow(12).values = ['Ion', 'Valeur Mix'];
  const ions = ['NO3', 'NH4', 'P', 'K', 'Ca', 'Mg', 'SO4'];
  ions.forEach((ion, i) => {
    const col = String.fromCharCode(66 + i); // B, C, D...
    sheetEau.getCell(`A${13 + i}`).value = ion;
    // Formule: (Forage * %F + Pluie * %P + Drainage * %D) / 100
    sheetEau.getCell(`B${13 + i}`).value = {
      formula: `(B3 * A9 + B4 * B9 + B5 * C9) / 100`
    };
  });

  // --- 3. RECETTE & CORRECTION ---
  const sheetRecette = workbook.addWorksheet('3. Recette & Correction');
  sheetRecette.getRow(1).values = ['Ion', 'Cible WUR', 'Mix Eau', 'Ecart Drainage', 'Besoin Net'];
  
  const targets = [12.0, 1.2, 1.5, 9.5, 4.5, 2.0, 2.5];
  ions.forEach((ion, i) => {
    const row = 2 + i;
    sheetRecette.getCell(`A${row}`).value = ion;
    sheetRecette.getCell(`B${row}`).value = targets[i];
    sheetRecette.getCell(`C${row}`).value = { formula: `'2. Analyses Eau & Mix'!B${13 + i}` };
    // Ecart Drainage = Target - Drainage Analysis
    sheetRecette.getCell(`D${row}`).value = { formula: `B${row} - '2. Analyses Eau & Mix'!${String.fromCharCode(66 + i)}5` };
    // Besoin Net = Target - Mix - (0.5 * Ecart) -> Formule simplifiée de correction
    sheetRecette.getCell(`E${row}`).value = { formula: `MAX(0, B${row} - C${row} - (D${row} * 0.2))` };
  });

  // --- 4. BACS ENGRAIS (A & B) ---
  const sheetBacs = workbook.addWorksheet('4. Composition Bacs');
  sheetBacs.getRow(1).values = ['PARAMETRES BACS', 'Volume (L)', 'Facteur Conc.'];
  sheetBacs.getRow(2).values = ['Valeurs', 1000, 100];

  sheetBacs.getRow(4).values = ['BAC A (PHOSPHORE / SULPHATE)', 'Quantité (kg)'];
  sheetBacs.getRow(5).values = ['MKP', { formula: `('3. Recette & Correction'!E4 / '1. Base Engrais'!D4) * B2 * (B1 / 1000)` }];
  sheetBacs.getRow(6).values = ['Sulfate de Magnésium', { formula: `('3. Recette & Correction'!E7 / '1. Base Engrais'!G5) * B2 * (B1 / 1000)` }];

  sheetBacs.getRow(8).values = ['BAC B (CALCIUM / NITRATE)', 'Quantité (kg)'];
  sheetBacs.getRow(9).values = ['Nitrate de Calcium', { formula: `('3. Recette & Correction'!E5 / '1. Base Engrais'!F2) * B2 * (B1 / 1000)` }];
  sheetBacs.getRow(10).values = ['Nitrate de Potassium', { formula: `(('3. Recette & Correction'!E1 - (B9 * '1. Base Engrais'!B2 / (B2 * B1/1000))) / '1. Base Engrais'!B3) * B2 * (B1 / 1000)` }];

  // Stylisation
  [sheetEau, sheetRecette, sheetBacs].forEach(s => {
    s.getRow(1).font = { bold: true };
    s.getColumn(1).width = 25;
  });

  await workbook.xlsx.writeFile('C:\\Users\\yvesa\\Desktop\\Gestion_Nutriments_Auto.xlsx');
  console.log('Fichier automatisé créé !');
}

createAutomatedExcel().catch(err => console.error(err));
