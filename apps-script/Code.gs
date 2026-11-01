// Recebe os leads do chat de síndicos e grava no Google Sheets.
// O mesmo WhatsApp gera uma única linha: a etapa "cadastro" cria, a "qualificado" completa.

const ABA = 'Leads';
const COLS = ['Data', 'Etapa', 'Nome', 'WhatsApp', 'Condomínio', 'Perfil', 'Unidades', 'Portaria', 'Postos',
  'Escala', 'Dores', 'Região', 'Prazo', 'Produtos recomendados', 'Origem', 'UTM'];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
    if (sh.getLastRow() === 0) {
      sh.appendRow(COLS);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, COLS.length).setFontWeight('bold');
      sh.getRange('D:D').setNumberFormat('@'); // WhatsApp como texto
    }
    const row = [
      new Date(), d.etapa || '', d.nome || '', d.tel || '', d.condo || '', d.perfil || '', d.unidTxt || '',
      d.modelo || '', d.postos || '', d.escala || '', (d.dores || []).join(', '), d.regiao || '',
      d.prazoTxt || '', (d.rec || []).join(', '), d.origem || '', d.utm || '',
    ];
    let alvo = 0;
    if (d.tel && sh.getLastRow() > 1) {
      const tels = sh.getRange(2, 4, sh.getLastRow() - 1, 1).getValues().flat().map(String);
      const i = tels.lastIndexOf(String(d.tel));
      if (i >= 0) alvo = i + 2;
    }
    if (alvo) sh.getRange(alvo, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
