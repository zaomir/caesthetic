import PDFDocument from 'pdfkit';
import fs from 'node:fs';

const FONT_REGULAR = process.env.PDF_FONT_REGULAR || '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
const FONT_BOLD = process.env.PDF_FONT_BOLD || '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

function pickFont(path, fallback) {
  return fs.existsSync(path) ? path : fallback;
}

const regular = pickFont(FONT_REGULAR, 'Helvetica');
const bold = pickFont(FONT_BOLD, 'Helvetica-Bold');

function safeText(value) {
  if (value === null || value === undefined || value === '') return 'Не указано';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function addFooter(doc, documentNumber) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    const bottom = doc.page.height - 35;
    doc.font(regular).fontSize(7).fillColor('#555555');
    doc.text(
      `${documentNumber} · страница ${i + 1} из ${range.count}`,
      50,
      bottom,
      { width: doc.page.width - 100, align: 'center', lineBreak: false },
    );
  }
}

function addMetaRow(doc, label, value) {
  const y = doc.y;
  doc.font(bold).fontSize(8.5).fillColor('#222222').text(label, 50, y, { width: 150, continued: true });
  doc.font(regular).fontSize(8.5).fillColor('#222222').text(safeText(value), { width: 390 });
  doc.moveDown(0.2);
}

function ensureRoom(doc, height = 90) {
  if (doc.y + height > doc.page.height - 70) doc.addPage();
}

function signatureBuffer(dataUrl) {
  if (!dataUrl) return null;
  const match = String(dataUrl).match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return Buffer.from(match[1], 'base64');
}

export async function renderSignedPdf({ document, snapshot, signature, signingSession, auditHead, finalHashPlaceholder }) {
  const chunks = [];
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 48, bottom: 55, left: 50, right: 50 },
    bufferPages: true,
    info: {
      Title: snapshot.template.title,
      Author: 'ИП Раимова Камилла Саидовна / Expert Dental',
      Subject: `Электронный документ ${document.document_number}`,
      Keywords: `Expert Dental, ${snapshot.template.code}, ${snapshot.template.version}`,
      CreationDate: new Date(),
      ModDate: new Date(),
    },
  });
  doc.on('data', (chunk) => chunks.push(chunk));

  if ((process.env.EXPERT_ESIGN_MODE || 'test') === 'test') {
    doc.font(bold).fontSize(12).fillColor('#8a1f11').text('ТЕСТОВЫЙ ДОКУМЕНТ — НЕ ДЛЯ ЛЕЧЕНИЯ', { align: 'center' });
    doc.font(regular).fontSize(8).text('Только синтетические данные: ТЕСТ / ДЕМО / TEST / DEMO', { align: 'center' });
    doc.moveDown(0.8);
  }
  doc.font(bold).fontSize(15).fillColor('#111111').text(snapshot.template.title, { align: 'center' });
  doc.moveDown(0.5);
  doc.font(regular).fontSize(8).fillColor('#555555').text(
    `DOC-ID: ${document.document_number} · шаблон ${snapshot.template.code} v${snapshot.template.version}`,
    { align: 'center' },
  );
  doc.moveDown(1);

  addMetaRow(doc, 'Исполнитель:', snapshot.clinic.legalName);
  addMetaRow(doc, 'Лицензия:', snapshot.clinic.license);
  addMetaRow(doc, 'Адрес:', snapshot.clinic.address);
  addMetaRow(doc, 'Пациент:', snapshot.patient.fullName);
  addMetaRow(doc, 'Дата рождения:', snapshot.patient.birthDate);
  if (snapshot.representative) addMetaRow(doc, 'Законный представитель:', snapshot.representative.fullName);
  if (snapshot.doctor) addMetaRow(doc, 'Врач:', snapshot.doctor.displayName);
  if (snapshot.episode) addMetaRow(doc, 'Медицинский эпизод:', `${snapshot.episode.direction} · ${snapshot.episode.id}`);
  addMetaRow(doc, 'Сформирован:', snapshot.generatedAt);
  doc.moveDown(0.6);

  for (const section of snapshot.sections) {
    ensureRoom(doc, 80);
    doc.font(bold).fontSize(11).fillColor('#111111').text(section.heading);
    doc.moveDown(0.3);
    for (const paragraph of section.paragraphs) {
      doc.font(regular).fontSize(9.2).fillColor('#222222').text(safeText(paragraph), {
        align: 'justify',
        lineGap: 2,
      });
      doc.moveDown(0.45);
    }
    doc.moveDown(0.35);
  }

  if (snapshot.fields?.length) {
    ensureRoom(doc, 100);
    doc.font(bold).fontSize(11).fillColor('#111111').text('Зафиксированные данные');
    doc.moveDown(0.4);
    for (const field of snapshot.fields) {
      ensureRoom(doc, 35);
      doc.font(bold).fontSize(8.5).text(`${field.label}:`, { continued: true });
      doc.font(regular).fontSize(8.5).text(` ${safeText(field.displayValue)}`);
      doc.moveDown(0.25);
    }
  }

  if (snapshot.acknowledgements?.length) {
    ensureRoom(doc, 100);
    doc.moveDown(0.6);
    doc.font(bold).fontSize(11).text('Подтверждения подписанта');
    doc.moveDown(0.35);
    for (const item of snapshot.acknowledgements) {
      doc.font(regular).fontSize(9).text(`✓ ${item}`, { indent: 8, lineGap: 1 });
      doc.moveDown(0.2);
    }
  }

  ensureRoom(doc, 190);
  doc.moveDown(0.8);
  doc.font(bold).fontSize(11).text('Подписи и подтверждение');
  doc.moveDown(0.5);
  doc.font(regular).fontSize(8.5);
  doc.text(`Подписант: ${signature.signerName}`);
  doc.text(`Статус: ${signature.signerType === 'legal_representative' ? 'законный представитель' : 'пациент'}`);
  doc.text(`Дата и точное время: ${signature.signedAt}`);
  doc.text(`Способ идентификации: ${signingSession.identityMethod}`);
  doc.text(`Сессию провёл администратор: ${signingSession.adminName}`);
  doc.text(`Устройство: ${signingSession.deviceCode ?? 'планшет без зарегистрированного кода'}`);
  doc.text(`Врачебное утверждение: ${document.approved_at ?? 'не требуется для этого типа документа'}`);
  doc.moveDown(0.4);
  const image = signatureBuffer(signature.pngDataUrl);
  if (image) {
    doc.rect(50, doc.y, 240, 90).strokeColor('#999999').stroke();
    doc.image(image, 58, doc.y + 7, { fit: [224, 76], align: 'center', valign: 'center' });
    doc.y += 98;
  } else {
    doc.rect(50, doc.y, 240, 70).strokeColor('#999999').stroke();
    doc.text('Графический след подписи отсутствует', 58, doc.y + 20);
    doc.y += 78;
  }

  ensureRoom(doc, 155);
  doc.addPage();
  doc.font(bold).fontSize(12).text('Технический паспорт электронного документа');
  doc.moveDown(0.7);
  addMetaRow(doc, 'DOC-ID:', document.document_number);
  addMetaRow(doc, 'Document UUID:', document.id);
  addMetaRow(doc, 'Template:', `${snapshot.template.code} v${snapshot.template.version}`);
  addMetaRow(doc, 'Snapshot SHA-256:', document.snapshot_hash);
  addMetaRow(doc, 'Doctor approval SHA-256:', document.approval_hash ?? 'не применимо');
  addMetaRow(doc, 'Signature vector SHA-256:', signature.vectorHash);
  addMetaRow(doc, 'Signature PNG SHA-256:', signature.pngHash);
  addMetaRow(doc, 'Audit chain head:', auditHead ?? 'будет зафиксирован после запечатывания');
  addMetaRow(doc, 'Final PDF SHA-256:', finalHashPlaceholder ?? 'рассчитывается после генерации файла');
  doc.moveDown(0.8);
  doc.font(regular).fontSize(8).fillColor('#444444').text(
    'Подпись пациента представляет собой графический след, полученный на планшете в идентифицированной сессии. '
    + 'Доказательственный пакет включает неизменяемый PDF, снимок версии шаблона, журнал действий, контрольные суммы, '
    + 'квитанцию доставки и, если доступна, внешнюю отметку времени RFC 3161. Техническая отметка времени и печать системы '
    + 'не выдаются за квалифицированную цифровую подпись пациента.',
    { align: 'justify', lineGap: 2 },
  );

  addFooter(doc, document.document_number);
  doc.end();
  await new Promise((resolve, reject) => {
    doc.on('end', resolve);
    doc.on('error', reject);
  });
  return Buffer.concat(chunks);
}
