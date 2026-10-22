/**
 * WISE エントリーフォーム受付（Google Apps Script ウェブアプリ）
 *
 * entry.html から送信された回答を
 *   1. スプレッドシート「管理表」タブに1行追記（A〜J列のみ。K列以降は数式・選考管理用なので触らない）
 *   2. 1次・2次面談用の「面談シート」（Googleドキュメント）を自動生成し、リンクを同じ行に記録
 *   3. 応募者に「一次面談のご案内」メールを送る（wiseintern.recruit@gmail.com の gas-mail スクリプト経由）
 *
 * MAIL_SECRET と MAIL_ENDPOINT は secret.gs に置く（公開リポジトリには上げない）
 */

const SPREADSHEET_ID = '1b5VqS9XDjFlYes0QMA5Cpy8CLSiq8lGUu4GTdt0ODDY';
const SHEET_NAME = '管理表';
const SHEET_GID = 1308531241; // URL の #gid= の値。タブ名を変えてもこちらで特定できる
const DOC_FOLDER_ID = '1kjXxgq4dDoMYrx04ndcG-ha0BajMby_c'; // 面談シートの保存先（マイドライブ「【面接・評価フォーム】」）
const TIMEZONE = 'Asia/Tokyo';

// 管理表に書き込む列（1行目の見出し名で位置を探す）。希望出勤曜日・出社条件は面談シートにだけ載せる
const COLUMNS = [
  '応募日', '部門', '応募者', '大学', '卒業年度', 'メールアドレス', '電話番号', '応募媒体', '応募媒体（詳細）', '履歴書'
];

// 管理表の表記（英語名・括弧なし）。集計データ・月別がこの文字列で集計しているので、変えるときはシート側もそろえる
const MEDIA_LABEL = {
  '公式HP': '公式HP',
  'Infra': 'Infra',
  'Renew': 'Renew',
  'Kokoshiro': 'Kokoshiro',
  'Wantedly': 'Wantedly',
  'LinkedIn': 'LinkedIn',
  'その他': 'その他'
};
const OTHER_LABEL = { '紹介': '紹介', 'イベント': '社内イベント' };
const DEPT_LABEL = { MD: 'マーケティング', SD: 'セールス', iTS: 'iTS' };
const toGradLabel_ = grad => `${String(grad).replace(/\D/g, '')}卒`; // 2028年 → 2028卒
// 「明治」→「明治大学」。大学院・短大・高専・専門学校などはそのまま
const toSchoolName_ = school => {
  const s = String(school).trim();
  return /(大学|大学院|大学校|短大|高専|学校|University|College)$/i.test(s) ? s : `${s}大学`;
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.website) return json_({ ok: true }); // honeypot: bot は成功扱いで破棄

    const errors = validate_(data);
    if (errors.length) return json_({ ok: false, errors });

    const record = toRecord_(data);

    // 面談シートを先に作り、リンクごと1回で書き込む（後から行番号で書くと、その間の並べ替えで別の人の行に入るため）
    // 生成に失敗しても、回答そのものは保存する
    try {
      record['履歴書'] = createInterviewSheet_(record, data);
    } catch (err) {
      console.error('面談シート生成エラー', err);
      record['履歴書'] = '生成エラー';
      lastWarning_ = `doc: ${err}`;
    }
    appendRow_(record);

    // メールが送れなくても、エントリー自体は受け付け済みにする
    try {
      sendGuideMail_(data);
    } catch (err) {
      console.error('案内メール送信エラー', err);
      lastWarning_ = `mail: ${err}`;
    }
    return json_(lastWarning_ ? { ok: true, warning: lastWarning_ } : { ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  }
}

function validate_(d) {
  const errors = [];
  ['lastName', 'firstName', 'school', 'grad', 'email', 'tel', 'media', 'role'].forEach(k => {
    if (!String(d[k] || '').trim()) errors.push(`${k} is required`);
  });
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.push('email is invalid');
  if (d.tel && !/^0\d{9,10}$/.test(d.tel)) errors.push('tel is invalid');
  if (!Array.isArray(d.days) || d.days.length < 2) errors.push('days must be 2 or more');
  if (!d.workAck) errors.push('workAck is required');
  if (d.media && !MEDIA_LABEL[d.media]) errors.push('media is invalid');
  if (d.role && !DEPT_LABEL[d.role]) errors.push('role is invalid');
  if (d.media === 'その他' && (!d.otherType || !String(d.otherDetail || '').trim())) errors.push('other detail is required');
  if (d.media === 'LinkedIn' && !String(d.referrer || '').trim()) errors.push('referrer is required');
  return errors;
}

function mediaDetail_(d) {
  if (d.media === 'その他') return `${d.otherType === '紹介' ? '紹介者' : 'イベント'}：${d.otherDetail}`;
  if (d.media === 'LinkedIn') return `紹介者：${d.referrer}`;
  return '-';
}

// 応募日は時刻なしの日付（既存の行と同じ yyyy/mm/dd 表示）
function today_() {
  return new Date(`${Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd')}T00:00:00+09:00`);
}

function toRecord_(d) {
  return {
    '応募日': today_(),
    '部門': DEPT_LABEL[d.role],
    '応募者': `${d.lastName}${d.firstName}`.trim(),
    '大学': toSchoolName_(d.school),
    '卒業年度': toGradLabel_(d.grad),
    'メールアドレス': d.email,
    '電話番号': `'${d.tel}`, // 先頭の0が消えないよう文字列として保存
    '応募媒体': d.media === 'その他' ? OTHER_LABEL[d.otherType] || 'その他' : MEDIA_LABEL[d.media],
    '応募媒体（詳細）': mediaDetail_(d),
    '履歴書': '',
    '希望出勤曜日': d.days.join('・'),
    '出社条件': '確認済み'
  };
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheets().find(s => s.getSheetId() === SHEET_GID) || ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`シート「${SHEET_NAME}」が見つかりません`);
  return sheet;
}

function getHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  return lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : [];
}

function appendRow_(record) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_();
    const headers = getHeaders_(sheet);
    const missing = COLUMNS.filter(c => !headers.includes(c));
    if (missing.length) throw new Error(`管理表に見出しがありません：${missing.join('、')}`);

    // K列以降の ARRAYFORMULA が下の行まで値を出すので、getLastRow ではなく応募者（C列）で最終行を探す
    const nameCol = headers.indexOf('応募者') + 1;
    const names = sheet.getRange(2, nameCol, sheet.getMaxRows() - 1, 1).getValues();
    let last = names.length;
    while (last > 0 && String(names[last - 1][0]).trim() === '') last--;
    const row = last + 2;
    if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 1);

    // 罫線・プルダウン・チェックボックス・表示形式を2行目（見本の行）からコピー
    // 1つ上の行だと、手入力や旧n8nで書式のない行が入っていたときに罫線が消えるため
    const width = sheet.getMaxColumns();
    const template = sheet.getRange(2, 1, 1, width);
    template.copyTo(sheet.getRange(row, 1, 1, width), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    template.copyTo(sheet.getRange(row, 1, 1, width), SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);

    // 自分の列だけ1セルずつ書く（間にある数式の列を空文字で上書きしないため）
    COLUMNS.forEach(h => sheet.getRange(row, headers.indexOf(h) + 1).setValue(record[h]));
    sheet.getRange(row, headers.indexOf('応募日') + 1).setNumberFormat('yyyy/mm/dd');
  } finally {
    lock.releaseLock();
  }
}

/* ---------- 面談シート（Googleドキュメント） ---------- */

const NAVY = '#0F172A';
const LABEL_BG = '#F1F5F9';
const GRAY = '#64748B';
const MEMO_HINTS = ['長所', '短所', '将来軸', 'その他'];

function createInterviewSheet_(r, d) {
  const detail = r['応募媒体（詳細）'];
  const media = detail !== '-' ? `${r['応募媒体']}（${detail}）` : r['応募媒体'];
  const name = `${d.lastName} ${d.firstName}`;
  const doc = DocumentApp.create(`${name}（${r['大学']}）`);
  const body = doc.getBody();
  body.setMarginTop(40).setMarginBottom(40).setMarginLeft(44).setMarginRight(44);

  const title = body.getParagraphs()[0];
  title.setText('面談シート');
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`エントリー日時：${Utilities.formatDate(r['応募日'], TIMEZONE, 'yyyy/MM/dd HH:mm')}`)
    .editAsText().setFontSize(9).setForegroundColor(GRAY);

  // 基本情報（名前・大学・年度・媒体・希望職種・勤務日）
  const info = body.appendTable([
    ['名前', name, '大学', r['大学']],
    ['年度', r['卒業年度'], '媒体', media],
    ['希望職種', r['部門'], '勤務日', r['希望出勤曜日']]
  ]);
  info.setBorderColor('#CBD5E1');
  [0, 2].forEach(c => info.setColumnWidth(c, 70));
  for (let i = 0; i < info.getNumRows(); i++) {
    [0, 2].forEach(c => {
      const cell = info.getCell(i, c);
      cell.setBackgroundColor(LABEL_BG);
      cell.editAsText().setBold(true).setFontSize(10);
    });
    [1, 3].forEach(c => info.getCell(i, c).editAsText().setFontSize(10));
  }

  body.appendParagraph('');

  // 1次面談 ｜ 2次面談
  const both = s => [s, s];
  const interview = body.appendTable([
    ['1次面談', '2次面談'],
    both('面談日：'),
    both('面談官：'),
    both('メモ：')
  ]);
  interview.setBorderColor('#CBD5E1');
  const head = interview.getRow(0);
  for (let c = 0; c < 2; c++) {
    head.getCell(c).setBackgroundColor(NAVY).editAsText().setBold(true).setForegroundColor('#FFFFFF');
  }
  for (let i = 1; i < interview.getNumRows(); i++) {
    for (let c = 0; c < 2; c++) interview.getCell(i, c).editAsText().setFontSize(10);
  }
  // メモ欄：聞き取りのヒント（長所・短所・将来軸）と記入スペース
  for (let c = 0; c < 2; c++) {
    const cell = interview.getCell(3, c);
    MEMO_HINTS.forEach(hint => {
      cell.appendParagraph('');
      cell.appendParagraph(`▸ ${hint}：`).editAsText().setFontSize(10).setForegroundColor(GRAY);
      cell.appendParagraph('\n\n').editAsText().setFontSize(10).setForegroundColor(NAVY);
    });
  }
  interview.getRow(3).setMinimumHeight(360); // メモ欄を広く

  doc.saveAndClose();
  // フォルダ移動に失敗しても、作成済みの面談シートのリンクは返す
  if (DOC_FOLDER_ID) {
    try {
      DriveApp.getFileById(doc.getId()).moveTo(DriveApp.getFolderById(DOC_FOLDER_ID));
    } catch (err) {
      console.error('フォルダ移動エラー', err);
      lastWarning_ = `move: ${err}`;
    }
  }
  // リンクを知っている全員が編集できる状態にする
  try {
    DriveApp.getFileById(doc.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
  } catch (err) {
    console.error('共有設定エラー', err);
    lastWarning_ = `share: ${err}`;
  }
  return `https://docs.google.com/document/d/${doc.getId()}/edit`; // 管理表の既存リンクと同じ形式
}

/* ---------- 一次面談のご案内メール ---------- */

function sendGuideMail_(d) {
  const res = UrlFetchApp.fetch(MAIL_ENDPOINT, {
    method: 'post',
    contentType: 'text/plain',
    payload: JSON.stringify({ secret: MAIL_SECRET, to: d.email, name: `${d.lastName} ${d.firstName}` }),
    muteHttpExceptions: true
  });
  const result = JSON.parse(res.getContentText());
  if (!result.ok) throw new Error(result.error);
}

let lastWarning_ = '';

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- 初回だけエディタで実行：外部への接続（メール送信スクリプトの呼び出し）を許可する ---------- */
function authorizeMail() {
  console.log(UrlFetchApp.fetch(MAIL_ENDPOINT, { method: 'post', payload: '{}', muteHttpExceptions: true }).getContentText());
}

/* ---------- 動作確認用：エディタで実行するとテスト行と面談シートが1件作られる ---------- */
function testPost() {
  const res = doPost({ postData: { contents: JSON.stringify({
    lastName: 'テスト', firstName: '太郎', school: 'テスト大学', grad: '2028年',
    email: 'test@example.com', tel: '09012345678', days: ['月', '水', '金'], workAck: '確認済み',
    media: '公式HP', role: 'MD'
  }) } });
  console.log(res.getContent());
}
