const ExcelJS = require('exceljs');

async function createExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Suivi Irrigation');

  // Définition des colonnes
  sheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Parcelle / Serre', key: 'parcelle', width: 20 },
    { header: 'Culture', key: 'culture', width: 20 },
    { header: 'Volume d\'eau (L ou m³)', key: 'volume', width: 25 },
    { header: 'Durée (min)', key: 'duree', width: 15 },
    { header: 'Fertirrigation (Oui/Non)', key: 'fertirrigation', width: 25 },
    { header: 'Observations', key: 'observations', width: 40 }
  ];

  // Ajout d'une ligne d'exemple
  const today = new Date();
  sheet.addRow({
    date: today.toLocaleDateString('fr-FR'),
    parcelle: 'Serre A',
    culture: 'Tomates',
    volume: '500 L',
    duree: 45,
    fertirrigation: 'Oui',
    observations: 'Irrigation standard du matin'
  });

  // Mise en forme de la ligne d'en-tête (Gras + centré)
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' } // Bleu
  };
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Sauvegarde du fichier
  await workbook.xlsx.writeFile('C:\\Users\\yvesa\\Desktop\\irrigation.xlsx');
  console.log('Fichier Excel créé avec succès !');
}

createExcel().catch(err => console.error(err));
