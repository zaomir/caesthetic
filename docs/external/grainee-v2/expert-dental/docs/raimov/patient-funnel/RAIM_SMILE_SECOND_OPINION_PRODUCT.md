---
title: RAIM SMILE Second Opinion — operating product
status: OWNER_APPROVED_STRATEGY / CLINIC_MEDICAL_LEGAL_GATED
version: 1.0
created: 2026-08-29
owner: Expert Dental medical lead + RAIM SMILE acquisition
decision: docs/founder-notes/DEC-858_raim-smile-permanent-brand-protocol.md
links_to:
  - docs/ssot/RAIM_SMILE_MARKETING_SEGMENT_STRATEGY.md
  - docs/raimov/patient-funnel/RAIM_SMILE_LEAD_ROUTING_CRM_CONTRACT.md
  - docs/raimov/operations/expert-dental/RAIM_SMILE_TREATMENT_COORDINATOR_STANDARD.md
---

# RAIM SMILE Second Opinion

## 1. Product contract

**RAIM SMILE Second Opinion** — первый wedge-product для взрослого пациента, у которого уже есть диагноз, снимки, предложение или план лечения и которому нужно независимо понять логику, альтернативы, ограничения и следующий диагностический шаг.

Это не бесплатная продажа лечения, не заочная гарантия, не emergency service и не обещание личного разбора Атабеком.

| Parameter | Canon |
|---|---|
| Priority | first RAIM SMILE wedge-product |
| Medical operator in Bishkek | Expert Dental Studio |
| Strategic price corridor | `8 000–10 000 KGS` — owner approved |
| Treatment credit | `100%` credit — owner-approved strategy |
| Public price / payment rule | `GATED`: clinic confirms exact price, tax/fiscal handling, eligibility, expiry and refunds |
| Delivery mode | in-person; remote preliminary review only after medical/legal/privacy gate |
| Atabek participation | not promised; named only when actually assigned and documented |
| CTA | «Пришлите ваш план лечения на второе мнение» — approved strategy, public activation gated |

`100% credit` означает зачёт фактически оплаченной стоимости Second Opinion в последующее лечение у medical operator по заранее опубликованным clinic-confirmed условиям. Это не скидка, cashback, гарантия принятия плана или давление начать лечение. До подтверждения срока, перечня подходящих планов, возврата и бухгалтерского правила публично обещать зачёт нельзя.

## 2. Patient fit

Подходит взрослому пациенту, если:

- уже предложено сложное, дорогостоящее или междисциплинарное лечение;
- два врача дали разные планы;
- пациент хочет понять последовательность, необратимые этапы и альтернативы;
- требуется проверить, каких данных не хватает до решения;
- пациент из Казахстана хочет начать с document review до решения о поездке.

Не подходит как:

- экстренная помощь при боли, отёке, кровотечении, травме или ухудшении состояния;
- окончательная диагностика только по переписке;
- замена очного осмотра, когда он клинически необходим;
- спор/экспертиза для суда, страховой или жалобы без отдельного договора;
- способ получить рецепт, гарантию результата или «самый дешёвый план».

При тревожных симптомах координатор прекращает коммерческий сценарий и направляет пациента в местную неотложную/экстренную стоматологическую помощь; клиническую срочность определяет уполномоченный медработник, не координатор.

## 3. Required inputs

### 3.1. Minimum before booking

- имя, возраст `18+`, страна/город и безопасный контакт;
- основной вопрос пациента своими словами;
- существующий письменный план/смета или заключение, если есть;
- дата последнего очного осмотра;
- перечень имеющихся исследований и даты их выполнения;
- согласие на обработку медицинских данных и, для Казахстана, отдельное основание для трансграничной передачи после legal approval.

### 3.2. Clinical packet where available

- панорамный снимок, КЛКТ, ТРГ или иные исследования в исходном качестве;
- интраоральные/лицевые фотографии по инструкции клиники;
- сканы/модели и выписки;
- список лекарств, аллергий и значимых состояний;
- предыдущие планы и вопросы к ним.

Новая КЛКТ **не является автоматическим требованием**. Необходимость, зона, давность и допустимое качество исследования определяются врачом с учётом лучевой безопасности. Недостаточный пакет приводит к статусу `MORE_DATA_REQUIRED` или `IN_PERSON_REQUIRED`, а не к догадке.

### 3.3. Data boundary

Маркетинговая форма/CRM хранит только contact, consent reference, source, product, status, owner и next action. Снимки, диагнозы, медицинские фото, анамнез и клинический текст загружаются только в approved medical channel Expert Dental. WhatsApp не объявляется медицинским архивом. Ссылки на медицинские файлы не копируются в marketing CRM, если это не разрешено clinic privacy policy.

## 4. Exact patient journey

| Step | Owner | Action | Exit evidence |
|---|---|---|---|
| 1. CTA | acquisition | пациент выбирает «Пришлите ваш план лечения на второе мнение» | source + consent start |
| 2. Non-clinical intake | administrator/coordinator | фиксирует контакт, город, вопрос, наличие плана и preferred language/channel; не интерпретирует симптомы | one lead card, `product=second_opinion` |
| 3. Safety screen | authorised clinic role | отделяет emergency/red-flag случаи от планового review | `ROUTED_URGENT_LOCAL` или продолжение |
| 4. Secure medical upload | patient + clinic | пациент загружает clinical packet в approved medical channel | medical record reference; no files in marketing CRM |
| 5. Completeness review | authorised clinician | определяет `READY`, `MORE_DATA_REQUIRED` или `IN_PERSON_REQUIRED` | dated completeness decision |
| 6. Price and booking | coordinator | сообщает только clinic-confirmed цену/credit rule, получает оплату и предлагает слот | receipt/reference + booked slot |
| 7. Clinical review | assigned dentist/team | изучает материалы; фиксирует ограничения и вопросы | review note in medical system |
| 8. Consultation | assigned clinician | обсуждает расхождения, варианты, риски, неизвестные и следующий шаг | consultation completed |
| 9. Deliverables | clinician + coordinator | врач утверждает clinical summary; координатор проверяет доставку и объясняет организационный next step | signed/versioned deliverables sent |
| 10. Decision path | patient | `PROCEED`, `MORE_DATA_REQUIRED`, `IN_PERSON_REQUIRED`, `CONTINUE_WITH_CURRENT_DOCTOR`, `REDIRECTED`, `NO_ACTION` | status + next action, no pressure |
| 11. Follow-up | coordinator | один согласованный follow-up; дополнительные контакты только по consent/next action | outcome or opt-out |
| 12. Credit | finance/admin | применяет 100% credit только по clinic-confirmed rule | auditable ledger reference |

`REDIRECTED` и `CONTINUE_WITH_CURRENT_DOCTOR` — нормальные клинические исходы и не ухудшают оценку врача или координатора.

## 5. Deliverables

### 5.1. Clinician-approved Second Opinion Summary

Версионируемый PDF или запись в patient portal:

1. вопрос пациента и scope review;
2. список просмотренных материалов с датами;
3. ограничения review и недостающие данные;
4. точки согласия/расхождения с исходным планом без дискредитации другого врача;
5. возможные варианты и существенные trade-offs;
6. красные флаги/необратимые шаги, которые должен объяснить врач;
7. рекомендуемый следующий диагностический шаг;
8. какие специалисты должны участвовать;
9. provisional sequence только если врач считает её допустимой;
10. имя, роль, дата и подпись утверждающего клинициста.

Документ не называется окончательным treatment plan, если очный осмотр/дополнительные данные ещё нужны. Бюджет указывается только из clinic-confirmed расчёта и с понятными допущениями.

### 5.2. Family Decision Brief

Одностраничный artifact для второго ЛПР/семьи:

- цель решения простым языком;
- варианты и почему они отличаются;
- этапы, предполагаемый календарь и число поездок, если подтверждены;
- подтверждённый бюджет/диапазон и что в него не входит;
- обратимые и необратимые шаги;
- три вопроса, которые семье стоит обсудить;
- следующий шаг и срок действия расчёта, если применимо.

По умолчанию artifact получает пациент. Клиника отправляет его родственнику только по явному согласию пациента и на указанный им контакт. Минимизировать медицинские детали; не включать снимки и чувствительные диагнозы без отдельной необходимости/согласия. Family Brief помогает обсуждению, но не заменяет informed consent пациента.

## 6. SLA

### 6.1. Target contract

После назначения реальных owners/capacity:

- machine acknowledgement — immediately;
- human response — `≤5 min` в covered hours, escalation ceiling `30 min`;
- completeness decision — до конца `1 business day` после получения packet;
- консультация — предложить слот в пределах `3 business days` после статуса `READY` и оплаты;
- clinician-approved Summary + Family Brief — в пределах `2 business days` после консультации;
- согласованный follow-up — в пределах `2 business days` после доставки.

Это target, не публичное обещание. SLA становится `ACTIVE` только после clinic confirmation расписания, primary owner, backup, праздников, часов покрытия и теста на непациентских данных.

### 6.2. Missed SLA

Coordinator сообщает честный новый срок и эскалирует владельцу очереди. Нельзя заменять просрочку неподтверждённым медицинским ответом или обещанием участия Атабека.

## 7. Remote Kazakhstan path

```text
KZ patient
→ non-clinical intake + explicit consent
→ secure cross-border medical upload (only after legal/privacy gate)
→ completeness review by Expert Dental
→ remote clinician consultation
→ preliminary Summary + Family Brief
→ continue locally / collect more data / plan Bishkek in-person visit
```

Обязательные границы:

- до counsel approval remote KZ path остаётся `DESIGNED_NOT_ACTIVE`;
- дистанционный review не объявляется окончательной диагностикой или лечением в Казахстане;
- врач явно указывает, что нельзя установить без очного осмотра;
- местные снимки принимаются только после проверки качества/давности; повторное облучение не запрашивается автоматически;
- нет обещания партнёрской клиники в Алматы, пока конкретный лицензированный оператор не проверен и не заключён договор;
- поездка в Бишкек предлагается только если клинически/операционно обоснована, с честным числом визитов и без medical-tourism claim;
- платёж, возврат, валютный курс, трансграничные данные, применимое право и medical advertising проходят отдельный legal/finance review;
- emergency и ухудшение состояния всегда маршрутизируются к местной помощи.

## 8. Activation gates

Status может перейти в `ACTIVE` только когда подтверждены:

1. медицинский owner, состав review и шаблон заключения;
2. точная цена в коридоре либо отдельное owner reapproval вне коридора;
3. условия `100% credit`, срок, исключения, refund/fiscal rule;
4. duration, slots, primary/backup owners и SLA;
5. secure medical upload, consent, access, retention/deletion и incident path;
6. KG wording/medical advertising review;
7. отдельный KZ cross-border/legal review до remote activation;
8. CRM test card + medical record link boundary без PHI leakage;
9. QA case проходит весь journey, deliverables и credit ledger;
10. public CTA/phone/form smoke после release decision.

## 9. Metrics without coercion

- packet completeness and time to completeness decision;
- booked/showed consultation;
- deliverable SLA;
- patient-reported clarity;
- `MORE_DATA_REQUIRED`, `IN_PERSON_REQUIRED`, `REDIRECTED` rates;
- Second Opinion → treatment start как наблюдаемая cohort metric, не quota врача/координатора;
- credit issued/applied/refunded;
- complaints, privacy incidents and clinical corrections;
- contribution only after direct costs and clinic-approved accounting.

Conversion не используется для давления на clinical recommendation.
