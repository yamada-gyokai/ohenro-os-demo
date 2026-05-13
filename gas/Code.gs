// ── doPost: ログ受信 ─────────────────────────────────────
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
  const data  = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(Object.keys(data));
  }
  sheet.appendRow(Object.values(data));

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── doGet: ログ一覧取得 ──────────────────────────────────
function doGet(e) {
  const sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
  const values = sheet.getDataRange().getValues();

  const headers = values[0];
  const rows    = values.slice(1);

  const data = rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
