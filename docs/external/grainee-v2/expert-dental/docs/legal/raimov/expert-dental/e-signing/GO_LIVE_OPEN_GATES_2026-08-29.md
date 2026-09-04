---
owner: Expert Dental / RAIMOV
status: BLOCKED_FOR_REAL_PATIENT_USE
created: 2026-08-29
last_updated: 2026-09-04
---

# Expert E-sign — открытые gates перед реальными пациентами

Инфраструктура и пилотный runtime не означают разрешение использовать проекты форм с реальными пациентами.

## P0 обязательные действия

- [x] Owner-confirmed approval местного юриста КР для точного 27-document baseline; первичный counsel artifact всё ещё `PENDING_ARCHIVE_ATTACHMENT`.
- [x] Юридическое утверждение точных baseline hashes; любое изменение wording требует нового review/version.
- [ ] Медицинское утверждение профильным врачом каждого ИДС/плана/памятки.
- [ ] Полный лицензионный evidence pack №4879 и clearance пилотного направления.
- [ ] Полный credential clearance пилотных врачей.
- [ ] Privacy/data assessment по Цифровому кодексу КР, включая WhatsApp/WAHA и размещение данных.
- [ ] Утвержденная retention schedule и номенклатура дел.
- [ ] Приказ о назначении администраторов-операторов подписных сессий.
- [ ] Персональные staff accounts; MFA для привилегированных ролей.
- [ ] Управляемые iPad через MDM/kiosk; запрет личных устройств.
- [ ] Controlled WAHA QR pairing выделенного клинического аккаунта.
- [ ] Pin WAHA image/version после vendor validation; запрет плавающего `latest` перед production acceptance.
- [ ] Отдельные scoped MinIO credentials и KMS/secret policy вместо root credentials для production.
- [ ] Настроенный off-host encrypted backup и успешный restore drill.
- [ ] Выбранный TSA/provider, CA chain и воспроизводимая RFC3161 verification; либо formal decision оставить timestamp optional.
- [ ] Procedure-specific CRM matrix: процедура → лицензия → врач → обязательные документы → freshness → hard stop.
- [ ] Named-doctor approval rule и step-up approval confirmation перед real-use acceptance.
- [ ] Device registration/enforcement и representative CRUD/authority workflow перед minors rollout.
- [ ] Privacy decision по хранению signature vector dynamics; до решения не использовать их как биометрию и минимизировать данные.
- [ ] 50 synthetic sessions + 20–30 limited pilot sessions с 100% audit.
- [ ] Incident, wrong-recipient, legal-hold and paper-fallback drills.
- [ ] Подписанный go-live акт с runtime SHA, registry version, разрешёнными формами, врачами, администраторами и направлением.

## Түндүк/ОЭП

Остается отдельным следующим этапом `DEFERRED_INTEGRATION_GATE`. P0 не зависит от Түндүк и не заявляет государственную/квалифицированную подпись пациента.
