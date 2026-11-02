/* Burnout Insight, plain service-oriented user interface (v6).
   Existing scientific data and scoring are in core.js and intentionally unchanged.
   No network requests, data collection, or persistent storage. */
(function () {
  'use strict';
  const C = window.BurnoutCore;
  if (!C) throw new Error('The assessment data could not be loaded.');
  const root = document.getElementById('app');
  const state = { screen: 'home', index: 0, answers: {}, consent: false, from: 'home', error: '', quickIssue: '', language: 'en', resultStyle: 'both', mode: 'assessment', selectedRecords: [], recordView: null, showRecycle: false, progressDate: today() };
  const targetedPrompts = {
    coworkers:['I feel tense before interacting with a coworker.','A coworker’s communication makes it harder for me to work calmly.','I avoid raising concerns because I expect the conversation to go badly.','Workplace conflict stays on my mind after the interaction ends.','I feel that a coworker does not respect my boundaries.','I am unclear about who owns tasks when working with this coworker.','Small misunderstandings with this coworker grow into larger problems.','I do not feel safe asking this coworker for clarification.','I receive feedback from this coworker in a way that feels discouraging.','This coworker interrupts my ability to focus.','I worry that speaking up will damage the working relationship.','The conflict affects my confidence at work.','I have not had a calm opportunity to discuss the issue.','Our expectations about communication are different.','I feel responsible for managing the other person’s reactions.','The situation makes me withdraw from the team.','I replay difficult conversations after work.','The problem has continued without a clear agreement.','I lack support when collaboration breaks down.','I am unsure who can help resolve the issue fairly.','I find it difficult to separate the person from the work problem.','The conflict affects the quality of my work.','I feel pressure to accept behaviour that is not workable.','I need a clearer boundary or working agreement.','I would benefit from a supported conversation about this situation.'],
    workload:['My workload is too large for the time available.','I regularly face more deadlines than I can realistically meet.','New tasks arrive before earlier tasks are finished.','I work through breaks to keep up.','I find it difficult to decide what should come first.','My workload changes without enough planning time.','I often take work home or continue thinking about it after hours.','I feel pressure to say yes to every new request.','Tasks are distributed in a way that feels unbalanced.','I do not have enough staffing or resources for the work expected.','I worry that quality will suffer because there is too much to do.','Meetings leave too little time for focused work.','I am expected to be available across too many channels.','Urgent requests regularly interrupt important work.','I lack a realistic stopping point at the end of the day.','I have had little chance to recover between demanding tasks.','My priorities are unclear when work conflicts.','I feel behind even when I work hard.','Deadlines are set without enough information about the task.','I am judged on output without the necessary support.','The pace of work is difficult to sustain.','I postpone rest because the workload feels endless.','I need help deciding which work can wait.','I would benefit from a clearer priority agreement.','The current workload is affecting my energy outside work.'],
    control:['I have little influence over how I complete my work.','My priorities change without enough explanation.','I am interrupted so often that I lose control of my day.','I cannot decide when to focus on complex tasks.','I lack a clear way to raise concerns about work decisions.','Changes affecting my work happen without my input.','I am unclear about which decisions I can make independently.','I have to follow processes that do not fit the real situation.','I feel unable to adjust my workload when circumstances change.','My schedule leaves little room for recovery or planning.','I am not given enough information to make good decisions.','My work is closely monitored in a way that increases tension.','I have limited flexibility in how I organize tasks.','Requests from different people conflict with each other.','I do not feel heard when I explain a work barrier.','I need permission for small decisions that affect my progress.','I am unsure how to negotiate realistic expectations.','The lack of autonomy makes work feel more exhausting.','I cannot protect uninterrupted focus time.','I have little opportunity to suggest better ways of working.','I feel stuck when a process is not working.','I find it hard to recover after an unexpected change.','My role and responsibilities are not clear enough.','I would benefit from agreed decision boundaries.','More control over my work would improve my ability to cope.'],
    exhaustion:['I feel tired before my workday has properly started.','I feel physically drained by ordinary tasks.','I feel emotionally exhausted by daily demands.','I find it difficult to recover after work.','I feel worn out even after resting.','I have less energy for family, friends, or personal activities.','I struggle to concentrate when I am tired.','I feel irritable because my energy is low.','I postpone basic self-care when I am exhausted.','I feel that small tasks require too much effort.','I wake up already thinking about how tired I feel.','I need longer breaks than usual to continue working.','I feel detached from activities I normally care about.','I have difficulty switching off work thoughts.','My sleep or rest does not feel refreshing.','I feel less patient in conversations.','I have less motivation to begin important tasks.','I make more mistakes when my energy is low.','I feel pressure to keep going despite exhaustion.','I find it hard to notice what I need until I am overwhelmed.','My exhaustion affects my confidence.','I avoid social contact because I do not have enough energy.','I am concerned that this level of exhaustion will continue.','I need a more sustainable recovery routine.','I would benefit from additional support for my energy and wellbeing.']
  };
  const targetedGroups = Object.fromEntries(Object.keys(targetedPrompts).map(key => [key, targetedPrompts[key].map((text,index) => ({id:`T_${key}_${index+1}`, section:'targeted', scale:'agreement', polarity:'negative', text}))]));
  function activeItems() {
    if (state.mode !== 'targeted' || !targetedGroups[state.quickIssue]) return C.items;
    return targetedGroups[state.quickIssue].slice(0, 15);
  }
  function targetedScore(items) {
    const answered=items.filter(item=>C.validatedAnswer(state.answers,item.id)!==null);
    return answered.length ? answered.reduce((sum,item)=>sum+state.answers[item.id]*25,0)/answered.length : 0;
  }
  const progressKey = 'burnout-insight-progress-v1';
  const recordsKey = 'burnout-insight-records-v1';
  const recycleKey = 'burnout-insight-recycle-v1';
  let progressMemory = null;
  function readProgress() {
    try { return JSON.parse(localStorage.getItem(progressKey) || 'null') || progressMemory; }
    catch (error) { return progressMemory; }
  }
  function saveProgress(progress) {
    progressMemory = progress;
    try { localStorage.setItem(progressKey, JSON.stringify(progress)); }
    catch (error) { /* Keep the plan in memory when browser storage is unavailable. */ }
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function readRecords() {
    try { return JSON.parse(localStorage.getItem(recordsKey) || '[]'); }
    catch (error) { return []; }
  }
  function readRecycle() {
    try { return JSON.parse(localStorage.getItem(recycleKey) || '[]'); }
    catch (error) { return []; }
  }
  function writeStored(key, records) {
    try { localStorage.setItem(key, JSON.stringify(records)); } catch (error) {}
  }
  function saveRecord(record) {
    const records=readRecords();
    records.unshift({...record,id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`});
    writeStored(recordsKey, records.slice(0, 12));
  }
  function recordCurrentAssessment() {
    const result=C.scoreAssessment(state.answers);
    saveRecord({date:today(),mode:'Full assessment',personal:result.personal,work:result.work,areas:result.areas.map(area=>({name:area.name,score:area.score,short:area.short})),report:{prioritized:C.prioritizedAreas(result.areas).map(area=>area.name)}});
  }
  function recordFocusedAssessment() {
    saveRecord({date:today(),mode:`Focused: ${state.quickIssue}`,personal:null,work:null,areas:[{name:state.quickIssue,score:targetedScore(activeItems())}],report:{focused:true,issue:state.quickIssue}});
  }
  function recordForId(id) {
    return [...readRecords(), ...readRecycle()].find(record => record.id === id);
  }
  function moveToRecycle(id) {
    const records=readRecords(), removed=records.find(record => record.id===id);
    if (!removed) return;
    writeStored(recordsKey, records.filter(record => record.id!==id));
    writeStored(recycleKey, [{...removed, deletedAt:today()}, ...readRecycle()].slice(0, 30));
    state.selectedRecords=state.selectedRecords.filter(selected => selected!==id);
  }
  function restoreRecord(id) {
    const recycle=readRecycle(), restored=recycle.find(record => record.id===id);
    if (!restored) return;
    writeStored(recycleKey, recycle.filter(record => record.id!==id));
    writeStored(recordsKey, [{...restored, deletedAt:undefined}, ...readRecords()].slice(0, 12));
  }
  function downloadRecords(records) {
    const body=records.map((record,index)=>`<article><h2>${index+1}. ${escapeHtml(record.mode)}</h2><p><strong>Date:</strong> ${escapeHtml(record.date)}</p><div class="bar"><label>Personal exhaustion</label><i style="width:${record.personal||0}%;background:#df807d"></i><b>${record.personal?.toFixed?.(0) ?? '—'}</b></div><div class="bar"><label>Work exhaustion</label><i style="width:${record.work||0}%;background:#2678b8"></i><b>${record.work?.toFixed?.(0) ?? '—'}</b></div><h3>Workplace areas</h3><ul>${(record.areas||[]).map(area=>`<li>${escapeHtml(area.name)}: ${Number(area.score||0).toFixed(0)} / 100</li>`).join('')}</ul></article>`).join('');
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>Burnout Insight records</title><style>body{font:16px Georgia,serif;max-width:850px;margin:40px auto;color:#182a36}article{border-top:2px solid #3c93bd;padding:20px 0}.bar{display:grid;grid-template-columns:180px 1fr 45px;gap:10px;align-items:center;margin:10px 0}.bar i{display:block;height:13px;border-radius:20px}.bar b{text-align:right}h1{color:#176080}</style></head><body><h1>Burnout Insight — Combined reports</h1><p>Educational reports exported from this browser on ${today()}.</p>${body}</body></html>`;
    const url=URL.createObjectURL(new Blob([html],{type:'text/html'})), a=document.createElement('a');
    a.href=url; a.download=`burnout-insight-records-${today()}.html`; a.click(); URL.revokeObjectURL(url);
  }
  function recordDetail(record) {
    if (!record) return '';
    const personal=Number(record.personal||0), work=Number(record.work||0);
    return `<section class="record-detail"><div class="section-kicker">${tx('Saved report')}</div><h2>${escapeHtml(record.mode)}</h2><p class="small-text">${escapeHtml(record.date)} · ${tx('Your presented report is saved here for later review.')}</p>${personal||work?`<div class="meter-grid">${exhaustionMeter(tx('Personal exhaustion'),personal,tx('How exhausted you felt overall.'))}${exhaustionMeter(tx('Work-related exhaustion'),work,tx('How exhausted you felt in relation to your job.'))}</div>${impactGraph(personal,work)}`:`<section class="focused-score-card"><div><span class="focused-score-label">${tx('Reported concern level')}</span><strong>${Number(record.areas?.[0]?.score||0).toFixed(0)}<small>/100</small></strong></div><div class="meter focused-meter"><span class="meter-fill ${meterBand(Number(record.areas?.[0]?.score||0)).className}" style="width:${Number(record.areas?.[0]?.score||0)}%"></span><i class="meter-marker" style="left:${Number(record.areas?.[0]?.score||0)}%"></i></div></section>`}<h3>${tx('Workplace areas')}</h3><div class="area-card-grid">${(record.areas||[]).map(area=>`<article class="area-card"><div class="area-card-head"><h3>${escapeHtml(area.name)}</h3><strong>${Number(area.score||0).toFixed(0)}<small>/100</small></strong></div><div class="area-bar"><i style="width:${Number(area.score||0)}%"></i></div>${area.short?`<p>${escapeHtml(area.short)}</p>`:''}</article>`).join('')}</div><button class="button secondary no-print" type="button" data-action="close-record">${tx('Back to records')}</button></section>`;
  }
  function recordsPage() {
    const records=state.showRecycle?readRecycle():readRecords(), allSelected=state.selectedRecords.length===0;
    if (state.recordView) {
      return `<main id="main" class="container content records-content" tabindex="-1" dir="${dir()}"><button class="button secondary no-print" type="button" data-action="close-record">← ${tx('Back to records')}</button>${recordDetail(recordForId(state.recordView))}</main>`;
    }
    const activeCount=readRecords().length, recycleCount=readRecycle().length;
    return `<main id="main" class="container content records-content" tabindex="-1"><div class="section-kicker">Private history</div><h1>Your records</h1><p class="intro-text">Completed assessments keep the result, workplace areas, and every answer so you can review a specific day later.</p><div class="records-tabs no-print"><button class="button ${state.showRecycle?'secondary':'primary'}" data-action="active-records">Active records (${activeCount})</button><button class="button ${state.showRecycle?'primary':'secondary'}" data-action="recycle-records">Recycle bin (${recycleCount})</button></div>${state.showRecycle?'<p class="small-text">Deleted records stay here until you permanently remove or restore them.</p>':''}${records.length?`<div class="records-toolbar no-print"><span>Select records for one combined download</span>${!state.showRecycle?'<button class="button secondary" type="button" data-action="download-records">Download selected</button>':''}${state.showRecycle?'<button class="button danger" type="button" data-action="empty-recycle">Empty recycle bin</button>':''}</div>${records.map((record,index)=>{const id=record.id||`${record.date}-${index}`,selected=allSelected||state.selectedRecords.includes(id);return `<article class="record-card ${selected?'record-selected':'record-unselected'}"><label class="record-select no-print"><input type="checkbox" data-record-id="${escapeHtml(id)}" ${selected?'checked':''}><span></span></label><button class="record-open" type="button" data-action="view-record" data-record="${escapeHtml(id)}"><strong>${escapeHtml(record.mode)}</strong><small>${escapeHtml(record.date)} · ${Object.keys(record.answers||{}).length} answers saved</small><span class="record-values"><span>Personal <b>${record.personal?.toFixed?.(0) ?? '—'}</b></span><span>Work <b>${record.work?.toFixed?.(0) ?? '—'}</b></span></button><div class="record-actions no-print">${state.showRecycle?`<button class="button secondary" data-action="restore-record" data-record="${escapeHtml(id)}">Restore</button>`:`<button class="button danger" data-action="delete-record" data-record="${escapeHtml(id)}">Delete</button>`}</div></article>`;}).join('')}`:'<div class="notice"><strong>No records here</strong><p>Complete an assessment and your result will appear here.</p></div>'}${link('home','← Return home','back-link')}</main>`;
  }
  function makePlan(result) {
    const areas = C.prioritizedAreas(result.areas);
    const items = [];
    if (result.personal >= 34 || result.work >= 34) items.push({id:'reset', title:'Take a five-minute recovery pause', detail:'Step away, breathe slowly, drink water, and return to one small next action.'});
    if (result.work >= 34) items.push({id:'boundary', title:'Protect one realistic stopping point', detail:'Choose a time to stop work or hand off unfinished tasks where possible.'});
    areas.slice(0, 2).forEach(area => items.push({id:area.id, title:`One step for ${area.name}`, detail:area.employee}));
    if (!items.length) items.push({id:'check-in', title:'Notice one thing that supports your energy', detail:'Record a helpful boundary, conversation, break, or working condition.'});
    return {created:today(), sourcePersonal:result.personal, sourceWork:result.work, items, checks:{}, checkins:{}};
  }
  function ensurePlan(result) {
    const existing = readProgress();
    if (existing && existing.items && existing.sourcePersonal === result.personal && existing.sourceWork === result.work) return existing;
    const plan = makePlan(result); saveProgress(plan); return plan;
  }
  function progressDays(plan) {
    const start = new Date(`${plan.created}T00:00:00`);
    return Array.from({length:7},(_,i) => {
      const date = new Date(start); date.setDate(start.getDate()+i);
      return date.toISOString().slice(0,10);
    });
  }
  function progressPage() {
    const plan = readProgress();
    if (!plan) return `<main id="main" class="container content" tabindex="-1"><h1>Your progress plan</h1><p>Complete the assessment first and we will create a private seven-day plan based on your results.</p><button class="button primary" data-action="start" type="button">Start assessment</button></main>`;
    const days = progressDays(plan), current=state.progressDate || today(), completed = plan.items.filter(item => plan.checks[current] && plan.checks[current][item.id]).length;
    const selectedDayIndex=days.indexOf(current), previousDay=days[Math.max(0,selectedDayIndex-1)]||days[0], nextDay=days[Math.min(days.length-1,selectedDayIndex+1)]||days[days.length-1];
    const checked = id => plan.checks[current] && plan.checks[current][id] ? 'checked' : '';
    return `<main id="main" class="container content progress-content" tabindex="-1">
      <div class="section-kicker">Private on this device</div><h1>Your seven-day progress plan</h1>
      <p class="intro-text">Small, repeatable actions can help you notice what improves your energy and working conditions. This plan is not a treatment or a guarantee of change.</p>
      <section class="progress-summary"><div class="progress-summary-copy"><strong>${completed} of ${plan.items.length}</strong><span>actions completed for this day</span></div><div class="progress-track"><i style="width:${Math.round(completed/plan.items.length*100)}%"></i></div></section>
      <section class="day-picker"><button type="button" class="day-nav" data-progress-date="${previousDay}" ${selectedDayIndex<=0?'disabled':''}>←</button><label><span>Choose a day</span><input type="date" data-progress-date-input value="${current}"></label><button type="button" class="day-nav" data-progress-date="${nextDay}" ${selectedDayIndex>=days.length-1?'disabled':''}>→</button><small>Plan day ${Math.max(1,selectedDayIndex+1)} of ${days.length}</small></section>
      <section class="plan-card"><div class="plan-card-heading"><h2>Actions for ${current}</h2><span class="completion-pill">${Math.round(completed/plan.items.length*100)}% complete</span></div>${plan.items.map(item => `<label class="plan-item"><input type="checkbox" data-plan-item="${item.id}" ${checked(item.id)}><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span></label>`).join('')}</section>
      <section class="plan-card"><h2>Daily check-in</h2><p>How is your energy on this day?</p><div class="checkin-options">${[1,2,3,4,5].map(value=>`<button type="button" class="checkin ${plan.checkins[current]===value?'selected':''}" data-checkin="${value}">${value}<small>${value===1?'Very low':value===3?'Okay':value===5?'Strong':''}</small></button>`).join('')}</div><p class="small-text">This is a personal reflection, not a clinical measurement.</p></section>
      <section class="plan-card week-card"><div class="plan-card-heading"><h2>Your week</h2><span class="small-text">Select a day above to edit it</span></div><div class="week-grid">${days.map((day,i)=>`<button type="button" class="day-cell ${day===current?'today':''}" data-progress-date="${day}"><strong>Day ${i+1}</strong><span>${day.slice(5)}</span><em>${plan.checkins[day] ? `Energy ${plan.checkins[day]}/5` : 'Not checked in'}</em></button>`).join('')}</div></section>
      <button class="button secondary" type="button" data-action="clear-progress">Clear progress plan</button>
      <div class="notice"><strong>Need more support?</strong><p>If exhaustion is persistent, severe, or makes daily activities difficult, speak with a qualified healthcare professional or trusted support person.</p></div>
    </main>`;
  }
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  const link = (action, text, className = '') => `<button type="button" class="text-link ${className}" data-action="${action}">${text}</button>`;
  const ar = {
    'Burnout Insight':'بصيرة الإرهاق', 'About this assessment':'حول هذا التقييم', 'My progress':'تقدمي',
    'Find my pattern':'اكتشف نمطي', 'Get immediate help':'احصل على مساعدة فورية', 'How it works':'كيف يعمل؟',
    'What do you need today?':'ما الذي تحتاجه اليوم؟', 'Start assessment':'ابدأ التقييم',
    'How do you want your results?':'كيف تريد عرض نتائجك؟', 'Quick summary':'ملخص سريع',
    'Detailed explanations':'شرح تفصيلي', 'Continue':'متابعة', 'Before you start':'قبل أن تبدأ',
    'Select one answer.':'اختر إجابة واحدة.', 'Back':'رجوع', 'Question':'السؤال',
    'Your results':'نتائجك', 'Possible day-to-day impact':'التأثير المحتمل خلال اليوم',
    'Lower':'منخفض', 'Elevated':'متوسط', 'Higher':'مرتفع', 'Save or print results':'حفظ أو طباعة النتائج',
    'Personal exhaustion':'الإرهاق الشخصي', 'Work-related exhaustion':'الإرهاق المرتبط بالعمل',
    'Private self-check · 6–8 minutes':'فحص ذاتي خاص · ٦–٨ دقائق',
    'Your wellbeing dashboard':'لوحة رفاهيتك', 'Notice the signals before they become overwhelming.':'لاحظ الإشارات قبل أن تصبح مرهقة.',
    'Overall from':'الإجمالي من', 'records':'سجلات', 'Interactive view':'عرض تفاعلي',
    'Answer questions to build this dial':'أجب عن الأسئلة لبناء هذا المؤشر', 'This dashboard combines your saved assessments.':'تجمع هذه اللوحة تقييماتك المحفوظة.',
    'Each dial updates as answers become available.':'يتحدث كل مؤشر مع توفر الإجابات.',
    'YOUR WORK WELLBEING':'رفاهيتك في العمل', 'Work':'العمل', 'wellbeing':'الرفاهية', 'Energy':'الطاقة', 'Focus':'التركيز', 'Support':'الدعم',
    'A clearer picture starts with one honest answer.':'تبدأ الصورة الأوضح بإجابة صادقة واحدة.',
    'Saved record':'سجل محفوظ', 'Answers and result summary saved in this browser.':'الإجابات وملخص النتيجة محفوظان في هذا المتصفح.',
    'Workplace areas':'مجالات بيئة العمل', 'Answers':'الإجابات', 'Back to records':'العودة إلى السجلات',
    'Private history':'السجل الخاص', 'Your records':'سجلاتك', 'Active records':'السجلات النشطة', 'Recycle bin':'سلة المحذوفات',
    'Download selected':'تنزيل المحدد', 'Restore':'استعادة', 'Delete':'حذف', 'No records here':'لا توجد سجلات هنا',
    'Return home':'العودة إلى الرئيسية', 'answers saved':'إجابات محفوظة'
  };
  const tx = text => state.language === 'ar' && ar[text] ? ar[text] : text;
  const dir = () => state.language === 'ar' ? 'rtl' : 'ltr';
  const questionArabic = {
    P01:'كم مرة تشعر بالتعب؟',P02:'كم مرة تشعر بالإرهاق الجسدي؟',P03:'كم مرة تشعر بالإرهاق العاطفي؟',P04:'كم مرة تفكر: «لم أعد أستطيع التحمل»؟',P05:'كم مرة تشعر بأنك مستنزف؟',P06:'كم مرة تشعر بالضعف وقابلية الإصابة بالمرض؟',
    W01:'هل عملك مرهق عاطفياً؟',W02:'هل تشعر بالإرهاق بسبب عملك؟',W03:'هل يسبب لك عملك الإحباط؟',W04:'هل تشعر بالإرهاق في نهاية يوم العمل؟',W05:'هل تشعر بالإرهاق صباحاً عند التفكير في يوم عمل آخر؟',W06:'هل تشعر بأن كل ساعة عمل متعبة بالنسبة لك؟',W07:'هل لديك طاقة كافية للعائلة والأصدقاء خلال وقت الفراغ؟'
  };
  const optionArabic = {'Always':'دائماً','Often':'غالباً','Sometimes':'أحياناً','Seldom':'نادراً','Never/almost never':'أبداً / تقريباً أبداً','To a very high degree':'بدرجة عالية جداً','To a high degree':'بدرجة عالية','Somewhat':'إلى حد ما','To a low degree':'بدرجة منخفضة','To a very low degree':'بدرجة منخفضة جداً','Strongly disagree':'لا أوافق بشدة','Disagree':'لا أوافق','Neither agree nor disagree':'محايد','Agree':'أوافق','Strongly agree':'أوافق بشدة'};
  const displayQuestion = item => state.language === 'ar' && questionArabic[item.id] ? questionArabic[item.id] : item.text;
  const displayOption = option => state.language === 'ar' && optionArabic[option] ? optionArabic[option] : option;
  const areaArabic = {workload:'عبء العمل',control:'التحكم والاستقلالية',reward:'التقدير والمكافأة',community:'العلاقات والدعم',fairness:'العدالة والشفافية',values:'القيم والنزاهة المهنية'};
  const displayArea = area => state.language === 'ar' ? (areaArabic[area.id] || area.name) : area.name;
  const questionTips = {
    P01:'Try a 60-second reset: relax your shoulders, breathe slowly, and choose one small next action.',
    P02:'If possible, stand up, drink water, and take a short movement break before continuing.',
    P03:'Name the feeling privately and pause before responding to a difficult message or conversation.',
    P04:'Reduce the next task to one step and contact someone you trust if the feeling is intense.',
    P05:'Choose one task to finish, then protect a short recovery break instead of pushing through everything.',
    P06:'Take persistent physical symptoms seriously and consider speaking with a qualified healthcare professional.',
    W01:'Identify the specific work situation that drains you and discuss one practical change with your manager.',
    W02:'Ask which priority can move when new work arrives; sustainable workload needs clear trade-offs.',
    W03:'Write down what feels blocked or unfair, then raise one concrete example rather than the whole problem.',
    W04:'Create a short end-of-day shutdown routine so unfinished work has a clear place for tomorrow.',
    W05:'Prepare the first small task the night before and avoid making major work decisions while depleted.',
    W06:'Try one protected focus block with notifications muted, where your role and workplace allow it.',
    W07:'Protect one small piece of non-work time today and notice whether it changes your recovery.'
  };
  function partialMeter() {
    if (state.mode === 'targeted') {
      const items=activeItems();
      const answered=items.filter(item=>C.validatedAnswer(state.answers,item.id)!==null);
      return [{label:reliefGuides[state.quickIssue]?.title || 'Focused concern', score:targetedScore(items), count:answered.length}];
    }
    const groups = [
      {id:'personal', label:'Personal exhaustion', items:C.cbiItems.filter(item=>item.section==='personal')},
      {id:'work', label:'Work-related exhaustion', items:C.cbiItems.filter(item=>item.section==='work')}
    ];
    return groups.map(group => {
      const answered=group.items.filter(item=>C.validatedAnswer(state.answers,item.id)!==null);
      if (!answered.length) return {...group, score:0, count:0};
      const score=answered.reduce((sum,item)=>sum+C.cbiItemScore(item,state.answers[item.id]),0)/answered.length;
      return {...group,score,count:answered.length};
    });
  }
  function liveMeterCard(group) {
    const band=meterBand(group.score);
    return `<div class="live-meter"><div class="live-meter-head"><span>${escapeHtml(group.label)}</span><strong>${group.count?group.score.toFixed(0):'—'}<small>/100</small></strong></div><div class="meter compact-meter"><span class="meter-fill ${band.className}" style="width:${group.score}%"></span><i class="meter-marker" style="left:${group.score}%"></i></div><small>${group.count?`${group.count} answered · ${band.label}`:'Answer questions to build this meter'}</small></div>`;
  }
  function questionAdvice(item) {
    const selected=C.validatedAnswer(state.answers,item.id);
    const tip=questionTips[item.id] || 'Notice what this question brings to mind, then choose one small action that supports your energy or working conditions.';
    return `<aside class="question-help"><div class="help-badge">Helpful next step</div><h2>${selected===null?'A small idea for this area':'Based on your answer, try this next'}</h2><p>${tip}</p><div class="help-divider"></div><small>This suggestion is for reflection and practical support. It does not interpret one answer as a diagnosis.</small></aside>`;
  }

  function header() {
    const surveyHeader=state.screen==='question' ? `<div class="header-progress"><span>Question ${state.index+1} of ${activeItems().length}</span><div><i style="width:${Math.round((state.index+1)/activeItems().length*100)}%"></i></div></div>` : '';
    return `<header class="site-header no-print" dir="${dir()}"><div class="container header-inner"><button type="button" class="brand brand-button" data-action="home" aria-label="Go to Burnout Insight home"><span class="brand-mark">✦</span><span>${tx('Burnout Insight')}<small>Work wellbeing tool</small></span></button>${surveyHeader}<nav aria-label="Main navigation">${readRecords().length?link('records','Records','nav-progress'):''}${readProgress()?link('progress', tx('My progress'), 'nav-progress'):''}${link('howto', tx('How it works'))}<button type="button" class="language-switch" data-action="language">${state.language==='en'?'العربية':'English'}</button></nav></div></header>`;
  }
  function footer() {
    return `<footer class="site-footer no-print"><div class="container"><p>Burnout Insight is a student educational project, not a diagnostic service.</p></div></footer>`;
  }
  function sourceLinks() {
    return `<ul class="source-list">${C.sources.map(s => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a></li>`).join('')}</ul>`;
  }
  const reliefGuides = {
    coworkers: {title:'Tension with a coworker', intro:'Use a calm, specific approach before the situation grows.', steps:['Take a two-minute pause before replying to messages or having the conversation.','Write down one observable behaviour and its effect, without labels or blame.','Ask for a short private conversation and use: "When ___ happens, it affects ___. Can we agree to ___?"','If the issue continues, record dates and examples and speak with your supervisor or HR through the appropriate process.']},
    workload: {title:'Too much work or too many deadlines', intro:'Create a visible priority list and ask for trade-offs instead of trying to absorb everything.', steps:['List everything due this week and mark what is urgent, important, or can wait.','Choose the top one to three priorities for today.','Tell your manager what will move if a new task is added: "Which priority should change?"','Protect one short break and a realistic stopping time; sustained overload is a work-design issue, not a personal failure.']},
    control: {title:'Low control or constant interruptions', intro:'Recover a small amount of control over how you work.', steps:['Choose one 25-minute block with notifications muted where possible.','Write the next physical action for your most important task.','Ask which decisions you can make independently and which expectations are fixed.','Suggest one practical change, such as a clearer handoff, meeting-free block, or agreed response window.']},
    exhaustion: {title:'You feel exhausted right now', intro:'Start with a short reset; do not make major decisions while depleted.', steps:['Stop for 60 seconds and take five slow breaths, with a longer exhale than inhale.','Drink water and step away from the screen or workspace for five minutes if it is safe to do so.','Reduce the next task to one small action and postpone non-urgent decisions.','If exhaustion is persistent, severe, or affecting daily life, contact a qualified healthcare professional or a trusted support person.']}
  };
  function quickRelief() {
    const guide = reliefGuides[state.quickIssue];
    return `<section class="relief-panel" aria-live="polite">
      <div class="section-kicker">Immediate support</div>
      <h2>What is making work difficult today?</h2>
      <p class="relief-intro">Choose the closest situation for a short, practical next-step guide. You can still complete the full assessment afterward.</p>
      <div class="relief-options">${Object.entries(reliefGuides).map(([id,item]) => `<button type="button" class="relief-option ${state.quickIssue===id?'selected':''}" data-action="relief" data-issue="${id}"><span class="relief-icon">${id==='coworkers'?'↔':id==='workload'?'▤':id==='control'?'â—Œ':'♡'}</span><span>${item.title}</span></button>`).join('')}</div>
      ${guide ? `<div class="relief-result"><h3>${guide.title}</h3><p>${guide.intro}</p><ol>${guide.steps.map(step=>`<li>${step}</li>`).join('')}</ol><button type="button" class="button secondary" data-action="targeted-start">Answer focused questions</button><button type="button" class="text-link" data-action="start">Take the full assessment</button></div>` : ''}
    </section>`;
  }
  function home() {
    const savedRecords=readRecords();
    const latest=savedRecords[0];
    const averageSaved = key => {
      const values=savedRecords.map(record => Number(record[key])).filter(Number.isFinite);
      return values.length ? Math.round(values.reduce((sum,value)=>sum+value,0)/values.length) : 0;
    };
    const averageAreas = savedRecords.flatMap(record => record.areas || []);
    const personalAnswered=C.cbiItems.filter(item=>item.section==='personal'&&C.validatedAnswer(state.answers,item.id)!==null);
    const workAnswered=C.cbiItems.filter(item=>item.section==='work'&&C.validatedAnswer(state.answers,item.id)!==null);
    const livePersonal=personalAnswered.length?personalAnswered.reduce((sum,item)=>sum+C.cbiItemScore(item,state.answers[item.id]),0)/personalAnswered.length:null;
    const liveWork=workAnswered.length?workAnswered.reduce((sum,item)=>sum+C.cbiItemScore(item,state.answers[item.id]),0)/workAnswered.length:null;
    const dashboardValues=savedRecords.length && !personalAnswered.length ? [
      ['Personal exhaustion',averageSaved('personal')],
      ['Work exhaustion',averageSaved('work')],
      ['Workplace concern',averageAreas.length ? Math.round(averageAreas.reduce((sum,area)=>sum+Number(area.score||0),0)/averageAreas.length) : 0]
    ] : [['Personal exhaustion',Math.round(livePersonal||0)],['Work exhaustion',Math.round(liveWork||0)],['Workplace concern',0]];
    const dashboardTag=savedRecords.length ? tx('Overall from')+' '+savedRecords.length+' '+tx('records') : tx('Interactive view');
    const dashboardHtml=dashboardValues.map(([label,value])=>`<div class="live-dial-item">${dial(tx(label),value,'')}</div>`).join('');
    return `<main id="main" class="container content" tabindex="-1" dir="${dir()}">
      <section class="home-hero-layout">
      <section class="hero-panel">
        <div class="hero-copy"><div class="section-kicker"><span class="mini-icon">â—'</span>${tx('Private self-check · 6–8 minutes')}</div><h1>${state.language==='ar'?'افهم ضغط العمل وابحث عن خطوتك التالية':'Understand your work stress. Find your next step.'}</h1><p class="intro-text">${state.language==='ar'?'أداة بسيطة تساعدك على فهم الإرهاق وضغوط العمل والعوامل التي قد تجعل يومك أصعب.':'Burnout Insight helps you reflect on exhaustion, workplace pressure, and the conditions that may be making work harder.'}</p><div class="hero-actions"><button class="button primary" type="button" data-action="start">${tx('Start assessment')}</button><span class="hero-note">${state.language==='ar'?'لا يوجد حساب ولا جمع للبيانات':'No account. No data collection.'}</span></div></div>
        ${state.quickIssue ? '<div class="help-mode-banner"><strong>Focused support mode</strong><span>Choose a category below for practical guidance.</span></div>' : `<div class="hero-visual-card"><div class="visual-label">${tx('YOUR WORK WELLBEING')}</div><div class="hero-orbit"><div class="orbit-center">${tx('Work')}<br><strong>${tx('wellbeing')}</strong></div><span class="orbit-pill pill-one">${tx('Energy')}</span><span class="orbit-pill pill-two">${tx('Focus')}</span><span class="orbit-pill pill-three">${tx('Support')}</span></div><div class="visual-caption">${tx('A clearer picture starts with one honest answer.')}</div></div>`}
      </section>
      <aside class="choice-rail"><div class="section-kicker">${tx('What do you need today?')}</div><h2>${state.language==='ar'?'اختر الطريقة التي تناسبك':'Choose your starting point'}</h2><div class="choice-grid"><button class="choice-card" data-action="start"><strong>â—Ž</strong><span>${tx('Find my pattern')}</span><small>${state.language==='ar'?'أجب عن الأسئلة وشاهد نمط الإرهاق لديك':'Answer the questions and understand your exhaustion pattern.'}</small></button><button class="choice-card" data-action="relief" data-issue="exhaustion"><strong>✦</strong><span>${tx('Get immediate help')}</span><small>${state.language==='ar'?'ابدأ بخطوة قصيرة تساعدك الآن':'Start with a short practical step for today.'}</small></button><button class="choice-card" data-action="howto"><strong>ⓘ</strong><span>${tx('How it works')}</span><small>${state.language==='ar'?'تعرف على المراحل والنتائج والخصوصية':'Learn about the steps, results, and privacy.'}</small></button></div></aside>
      </section>
      <section class="live-dashboard home-dashboard-top"><div class="dashboard-heading"><div><div class="section-kicker">${tx('Your wellbeing dashboard')}</div><h2>${tx('Notice the signals before they become overwhelming.')}</h2></div><span class="dashboard-tag">${dashboardTag}</span></div><div class="live-dial-grid">${dashboardHtml}</div><p class="dashboard-note">${savedRecords.length?tx('This dashboard combines your saved assessments.'):tx('Each dial updates as answers become available.')}</p></section>
      ${quickRelief()}
      <p class="help-note">Educational tool only: it cannot diagnose burnout, depression, or another health condition.</p>
    </main>`;
  }
  function intro() {
    return `<main id="main" class="container content" tabindex="-1" dir="${dir()}">
      ${link('home', `← ${tx('Back')}`, 'back-link')}
      <h1>${tx('Before you start')}</h1>
      <p>The first 13 questions ask about exhaustion. The next 12 ask about your workplace.</p>
      <p>There are no right or wrong answers. Choose the answer that best describes your experience.</p>
      <div class="notice" role="note"><strong>Important</strong><p>The results are for information only. A score is not a diagnosis or a percentage chance of having burnout. If your symptoms are severe or ongoing, speak to a qualified healthcare professional.</p></div>
      <p>We do not ask for your name. Answers are processed only in this browser and are cleared when you close or refresh the page.</p>
      <label class="consent-row"><input type="checkbox" id="consent" ${state.consent?'checked':''}><span>I understand that this is not a medical assessment.</span></label>
      <fieldset class="result-preference"><legend>${tx('How do you want your results?')}</legend><label><input type="radio" name="result-style" value="both" ${state.resultStyle==='both'?'checked':''}> ${tx('Quick summary')}</label><label><input type="radio" name="result-style" value="detailed" ${state.resultStyle==='detailed'?'checked':''}> ${tx('Detailed explanations')}</label></fieldset>
      <p class="error" id="consent-error" role="alert" ${state.error?'':'hidden'}>${state.error?escapeHtml(state.error):''}</p>
      <button class="button primary" type="button" data-action="begin">${tx('Continue')}</button>
    </main>`;
  }
  function groupName(item) {
    return item.section === 'personal' ? 'About your general exhaustion' : item.section === 'work' ? 'About exhaustion related to work' : 'About your workplace';
  }
  function question() {
    const questions = activeItems();
    const item = questions[state.index];
    const selected = C.validatedAnswer(state.answers, item.id);
    const pct = Math.round(state.index / questions.length * 100);
    const meters=partialMeter();
    return `<main id="main" class="container content question-content" tabindex="-1" dir="${dir()}">
      ${link('back', `← ${tx('Back')}`, 'back-link')}
      <div class="survey-overview"><div>      <p class="step">${tx('Question')} ${state.index+1} ${state.language==='ar'?'من':'of'} ${questions.length}</p><div class="progress" aria-label="Assessment progress"><span style="width:${pct}%"></span></div></div><div class="live-meters">${meters.map(liveMeterCard).join('')}</div></div>
      <div class="question-layout question-enter"><form id="question-form" novalidate><p class="section-label">${escapeHtml(groupName(item))}</p><fieldset class="question-field" id="question-field" tabindex="-1" aria-describedby="answer-error">
        <legend><span class="question-eyebrow">A moment to check in</span><h1 id="question-title">${escapeHtml(displayQuestion(item))}</h1></legend>
        <p class="hint">${tx('Select one answer.')}</p>
        <p class="error" role="alert" id="answer-error" ${state.error?'':'hidden'}>${state.error?escapeHtml(state.error):''}</p>
        <div class="radio-options">${C.optionsFor(item).map((answer, i) => `<label class="radio-option"><input type="radio" name="answer" value="${i}" ${selected===i?'checked':''}><span>${escapeHtml(displayOption(answer))}</span></label>`).join('')}</div>
      </fieldset><button class="button primary" type="submit">${state.index===questions.length-1?'See my results':'Continue'}</button></form>${questionAdvice(item)}</div>
    </main>`;
  }
  function meterBand(score) {
    if (score < 34) return {label:'Lower reported exhaustion', className:'low', text:'Your answers suggest fewer reported exhaustion symptoms on this educational scale.'};
    if (score < 67) return {label:'Elevated reported exhaustion', className:'elevated', text:'Your answers suggest some reported exhaustion that may be worth monitoring and discussing.'};
    return {label:'Higher reported exhaustion', className:'high', text:'Your answers suggest more frequent or intense reported exhaustion. Consider support and practical changes.'};
  }
  function exhaustionMeter(label, score, explanation) {
    const band = meterBand(score);
    return `<article class="meter-card">
      <div class="meter-card-head"><div><h3>${label}</h3><p>${explanation}</p></div><strong>${score.toFixed(1)}<span>/100</span></strong></div>
      <div class="meter" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score.toFixed(1)}">
        <span class="meter-fill ${band.className}" style="width:${score}%"></span><i class="meter-marker" style="left:${score}%"></i>
      </div>
      <div class="meter-scale"><span>Lower</span><span>Elevated</span><span>Higher</span></div>
      <p class="meter-status ${band.className}"><strong>${band.label}.</strong> ${band.text}</p>
    </article>`;
  }
  function impactGraph(personal, work) {
    const average = (personal + work) / 2;
    const focus = Math.round(Math.min(100, average * .9));
    const energy = Math.round(Math.min(100, average * 1.05));
    const workFunction = Math.round(Math.min(100, average * .8));
    return `<div class="impact-card">
      <div class="impact-heading"><div><h3>Possible day-to-day impact</h3><p>Higher reported exhaustion may be associated with less energy, focus and work functioning. This is an educational illustration, not a prediction of your performance.</p></div><span class="impact-key">Illustrative only</span></div>
      <div class="impact-chart" role="img" aria-label="Illustrative relationship between reported exhaustion and possible effects on focus, energy, and work functioning">
        <div class="chart-axis"><span>Higher possible impact</span><span>Lower possible impact</span></div>
        <div class="chart-bars">
          <div class="chart-row"><span>Focus</span><div class="chart-track"><i style="width:${focus}%"></i></div><strong>${focus}%</strong></div>
          <div class="chart-row"><span>Energy</span><div class="chart-track"><i style="width:${energy}%"></i></div><strong>${energy}%</strong></div>
          <div class="chart-row"><span>Work functioning</span><div class="chart-track"><i style="width:${workFunction}%"></i></div><strong>${workFunction}%</strong></div>
        </div>
      </div>
      <p class="small-text">The bars are not clinical measurements and do not establish that exhaustion caused any change in focus, professionalism or work performance.</p>
    </div>`;
  }
  function dial(label, score, detail) {
    const band=meterBand(score);
    return `<article class="dial-card"><div class="dial" style="--dial-value:${score*3.6}deg"><div class="dial-inner"><strong>${score.toFixed(0)}</strong><small>/100</small></div></div><h3>${label}</h3><span class="dial-band ${band.className}">${band.label}</span><p>${detail}</p></article>`;
  }
  function scoreMeaning(personal, work) {
    const p=meterBand(personal), w=meterBand(work);
    return `Your personal exhaustion is in the <strong>${p.label.toLowerCase()}</strong> range and your work-related exhaustion is in the <strong>${w.label.toLowerCase()}</strong> range. This usually means your answers described ${personal >= 67 || work >= 67 ? 'frequent or intense exhaustion that may be affecting recovery, focus, or available energy' : personal >= 34 || work >= 34 ? 'some exhaustion that may be worth monitoring and discussing' : 'fewer exhaustion symptoms on this educational scale'}. It does not confirm a diagnosis or identify one certain cause.`;
  }
  function results() {
    if (state.mode === 'targeted') {
      const guide = reliefGuides[state.quickIssue];
      const questions = activeItems();
      const answered = questions.filter(item => C.validatedAnswer(state.answers, item.id) !== null).length;
      const score=targetedScore(questions), band=meterBand(score);
      return `<main id="main" class="container content results-content" tabindex="-1" dir="${dir()}"><div class="section-kicker">Focused support</div><h1>Your next step for ${escapeHtml(guide ? guide.title : 'this concern')}</h1><p class="intro-text">You completed ${answered} of ${questions.length} focused questions. This category score is an educational indicator, not a diagnosis.</p><section class="focused-score-card"><div><span class="focused-score-label">Reported concern level</span><strong>${score.toFixed(0)}<small>/100</small></strong></div><div class="meter focused-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score.toFixed(0)}"><span class="meter-fill ${band.className}" style="width:${score}%"></span><i class="meter-marker" style="left:${score}%"></i></div><p class="meter-status ${band.className}"><strong>${band.label}.</strong> ${band.text}</p></section><section class="result-section"><h2>What you can try now</h2><div class="advice-item"><h3>${escapeHtml(guide ? guide.title : 'Your selected concern')}</h3><p>${escapeHtml(guide ? guide.intro : 'Choose one small action that supports your energy or working conditions.')}</p><ol>${(guide ? guide.steps : []).map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol></div></section><div class="result-controls"><button type="button" class="button primary" data-action="start">Take the full assessment</button>${link('home','Return home')}</div></main>`;
    }
    const r = C.scoreAssessment(state.answers);
    if (!r.complete) return `<main id="main" class="container content"><h1>Some questions are missing</h1><p>Complete the remaining questions to see your results.</p><button type="button" class="button primary" data-action="resume">Return to assessment</button></main>`;
    const prioritized = C.prioritizedAreas(r.areas);
    let explanation;
    if (prioritized.length) {
      explanation = `The areas you reported the most concern about include <strong>${prioritized.map(x => escapeHtml(x.name)).join(', ')}</strong>. The Job Demands–Resources model suggests that demanding work and limited support or autonomy can make it harder to manage stress. Your answers do not prove what caused your exhaustion.`;
    } else {
      explanation = 'Your answers did not identify a particular workplace area using this project’s simple review rule. If you are feeling exhausted, it may still be useful to review your workload, support and wellbeing.';
    }
    const actions = prioritized.length ? prioritized.map(area => `<section class="advice-item"><h3>${escapeHtml(area.name)}</h3><p>${escapeHtml(area.description)}</p><p><strong>What you can do:</strong> ${escapeHtml(area.employee)}</p><p><strong>What an employer can do:</strong> ${escapeHtml(area.organization)}</p></section>`).join('') : `<p>Consider speaking with someone you trust at work about any concerns that continue.</p>`;
    const bestArea = prioritized[0];
    const bestSolution = bestArea ? `<div class="solution-card"><span class="solution-icon">→</span><div><strong>Your best starting point: ${escapeHtml(bestArea.name)}</strong><p>${escapeHtml(bestArea.employee)}</p></div></div>` : `<div class="solution-card"><span class="solution-icon">✓</span><div><strong>Your best starting point</strong><p>Choose one small recovery action today, then speak with someone you trust if the concern continues.</p></div></div>`;
    return `<main id="main" class="container content results-content ${state.resultStyle==='summary'?'summary-mode':''}" tabindex="-1" dir="${dir()}">
      <div class="print-title">Burnout Insight — Educational results</div>
      <h1>Your results</h1>
      <p class="intro-text">This is a summary of your answers. It is not a medical diagnosis.</p>
      <div class="print-actions no-print"><button class="button primary" data-action="print" type="button">Save or print results</button></div>
      <section class="result-section"><h2>1. Your exhaustion scores</h2>
        <p>These scores come from the Copenhagen Burnout Inventory (CBI). A higher number means you reported more exhaustion. A score is <strong>not</strong> a percentage chance of having burnout.</p>
        <div class="meter-grid">${exhaustionMeter('Personal exhaustion',r.personal,'How exhausted you feel overall.')}${exhaustionMeter('Work-related exhaustion',r.work,'How exhausted you feel in relation to your job.')}</div>
        <div class="summary-meaning"><h3>What this pattern means</h3><p>${scoreMeaning(r.personal,r.work)}</p></div>
        ${impactGraph(r.personal, r.work)}
      </section>
      <section class="result-section optional-detail"><h2>2. Your workplace answers</h2>
        <p>These scores summarize the 12 workplace questions written for this project. A higher number means you reported more concerns in that area.</p>
        <div class="area-card-grid">${r.areas.map(area=>`<article class="area-card"><div class="area-card-head"><h3>${escapeHtml(displayArea(area))}</h3><strong>${area.score.toFixed(0)}<small>/100</small></strong></div><div class="area-bar"><i style="width:${area.score}%"></i></div><p>${escapeHtml(area.short)}</p></article>`).join('')}</div>
        <p class="small-text">These workplace scores are educational indicators created for this project, not results from the official Areas of Worklife Survey.</p>
      </section>
      <section class="result-section optional-detail"><h2>3. What your answers might mean</h2><p>${explanation}</p></section>
      <section class="result-section"><h2>4. Possible next steps</h2><p>These suggestions are based on the workplace issues you reported, not on a medical diagnosis.</p>${bestSolution}${actions}
        <div class="notice"><strong>When to seek help</strong><p>Exhaustion can overlap with depression or other health concerns. If symptoms are persistent, severe, or make daily activities difficult, consider talking to a qualified healthcare professional.</p></div>
      </section>
      <section class="result-section"><h2>5. Build a small improvement routine</h2><p>Use your results to create a private seven-day plan. Tick off actions and record your energy each day so you can notice patterns over time.</p><button class="button primary" type="button" data-action="create-progress">Create my seven-day plan</button></section>
      <section class="result-section optional-detail"><h2>How this assessment works</h2>
        <p>CBI scores use the average of the relevant questions on a 0–100 scale. The last work-related question is scored in the opposite direction. Workplace scores use two original questions per area. The areas suggested for review use a project-defined rule, not a clinical threshold.</p>
        <p>The three research approaches used are the Copenhagen Burnout Inventory, Six Areas of Worklife, and the Job Demands–Resources model.</p>
        <p class="small-text">Required attribution: Borritz M et al. (2006), <em>Burnout among employees in human service work: design and baseline findings of the PUMA study</em>, Scandinavian Journal of Public Health, 34, 49–58.</p>
      </section>
      <div class="result-controls no-print"><button type="button" class="button primary" data-action="print">Save or print results</button>${link('restart', 'Start again')}</div>
      <p class="small-text">You can read the original scientific sources on the ${link('about', 'About this assessment')} page.</p>
    </main>`;
  }
  function about() {
    return `<main id="main" class="container content" tabindex="-1">
      ${link('return', '← Back', 'back-link')}
      <h1>About this assessment</h1>
      <h2>What is Burnout Insight?</h2>
      <p>Burnout Insight is a student educational project. It helps people reflect on exhaustion and their workplace experience. It is not affiliated with any of the organizations listed below.</p>
      <h2>Where do the questions come from?</h2>
      <p><strong>The first 13 questions</strong> come from the published English Copenhagen Burnout Inventory. They measure personal exhaustion and work-related exhaustion.</p>
      <p><strong>The next 12 questions</strong> are original questions created for this project using the Six Areas of Worklife framework. They have not been clinically or psychometrically validated.</p>
      <p>The Job Demands–Resources model is used only to explain possible relationships and suggest next steps.</p>
      <h2>How is your information handled?</h2>
      <p>Your answers stay in the browser while this page is open. We do not ask for your name or send responses to a server. The optional progress plan is stored only on this device when browser storage is available.</p>
      <h2>Scientific references</h2>${sourceLinks()}
      <p class="small-text">CBI attribution required by the NFA: Borritz M et al. (2006), Scandinavian Journal of Public Health, 34, 49–58.</p>
    </main>`;
  }
  function howto() {
    return `<main id="main" class="container content howto-content" tabindex="-1" dir="${dir()}">
      ${link('home', `← ${tx('Back')}`, 'back-link')}
      <div class="section-kicker">${tx('How it works')}</div><h1>${state.language==='ar'?'كيف تستخدم Burnout Insight':'How to use Burnout Insight'}</h1>
      <p class="intro-text">${state.language==='ar'?'ابدأ من احتياجك الحالي، أجب عن الأسئلة بصدق، ثم استخدم النتائج لاختيار خطوة صغيرة قابلة للتنفيذ.':'Start with what you need today, answer honestly, then use the results to choose one small action you can try.'}</p>
      <div class="howto-steps"><article><b>01</b><h2>${state.language==='ar'?'اختر':'Choose'}</h2><p>${state.language==='ar'?'يمكنك اكتشاف نمطك، أو الحصول على خطوة فورية، أو قراءة طريقة عمل الأداة.':'Choose Find my pattern, Get immediate help, or learn how the tool works.'}</p></article><article><b>02</b><h2>${state.language==='ar'?'أجب':'Answer'}</h2><p>${state.language==='ar'?'ستظهر الأسئلة في بطاقات بسيطة. يمكنك الرجوع وتغيير إجاباتك.':'Questions appear one at a time in simple cards. You can go back and change answers.'}</p></article><article><b>03</b><h2>${state.language==='ar'?'افهم':'Understand'}</h2><p>${state.language==='ar'?'سترى مؤشرات تعليمية للإرهاق الشخصي والمرتبط بالعمل ومجالات بيئة العمل.':'See educational indicators for personal exhaustion, work exhaustion, and workplace areas.'}</p></article><article><b>04</b><h2>${state.language==='ar'?'تحرك':'Take action'}</h2><p>${state.language==='ar'?'اختر اقتراحاً صغيراً وراقب طاقتك عبر خطة السبعة أيام.':'Choose one practical suggestion and track your energy with the seven-day plan.'}</p></article></div>
      <div class="notice"><strong>${state.language==='ar'?'مهم':'Important'}</strong><p>${state.language==='ar'?'هذه الأداة تعليمية وليست تشخيصاً طبياً. لا توجد حدود تثبت أنك مصاب أو غير مصاب بالإرهاق.':'This is an educational tool, not a medical diagnosis. No score proves that you do or do not have burnout.'}</p></div>
      <button class="button primary" type="button" data-action="start">${tx('Start assessment')}</button>
    </main>`;
  }
  function render({focusHeading=false}={}) {
    const pages = {home, intro, question, results, about, howto, progress:progressPage, records:recordsPage};
    root.innerHTML = `${header()}${(pages[state.screen] || home)()}${footer()}`;
    document.title = state.screen==='results'?'Your results — Burnout Insight':'Burnout Insight — Worklife assessment';
    if (focusHeading) {
      const heading = root.querySelector('main h1');
      if (heading) {heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true});}
    }
  }
  function route() {return state.screen==='question'?`question-${state.index+1}`:state.screen;}
  function go(next, options={}) {
    if(next) state.screen=next;
    state.error='';
    window.history.pushState({screen:state.screen,index:state.index,from:state.from},'',`#${route()}`);
    window.scrollTo(0,0);
    render({focusHeading:true});
  }
  function action(name, value, source) {
    const recordId=value || source?.getAttribute('data-record') || '';
    switch(name) {
      case 'start': go('intro'); break;
      case 'targeted-start': state.mode='targeted'; state.index=0; go('question'); break;
      case 'howto': state.from=state.screen; go('howto'); break;
      case 'language': state.language=state.language==='en'?'ar':'en'; render({focusHeading:false}); break;
      case 'relief':
        state.quickIssue=value||''; state.mode='targeted'; render({focusHeading:false});
        requestAnimationFrame(() => root.querySelector('.relief-panel')?.scrollIntoView({behavior:'smooth',block:'start'}));
        break;
      case 'progress': state.from=state.screen; go('progress'); break;
      case 'records': state.from=state.screen; state.recordView=null; go('records'); break;
      case 'active-records': state.showRecycle=false; state.selectedRecords=[]; render({focusHeading:false}); break;
      case 'recycle-records': state.showRecycle=true; state.selectedRecords=[]; render({focusHeading:false}); break;
      case 'view-record': state.recordView=recordId; render({focusHeading:true}); break;
      case 'close-record': state.recordView=null; render({focusHeading:true}); break;
      case 'delete-record': moveToRecycle(recordId); render({focusHeading:false}); break;
      case 'restore-record': restoreRecord(recordId); render({focusHeading:false}); break;
      case 'empty-recycle':
        if(window.confirm('Permanently delete all records in the recycle bin?')) { writeStored(recycleKey, []); state.selectedRecords=[]; render({focusHeading:false}); }
        break;
      case 'download-records': {
        const records=readRecords(), selected=state.selectedRecords.length?records.filter(record=>state.selectedRecords.includes(record.id)):records;
        downloadRecords(selected);
        break;
      }
      case 'print-records': window.print(); break;
      case 'create-progress': ensurePlan(C.scoreAssessment(state.answers)); go('progress'); break;
      case 'clear-progress':
        if(window.confirm('Clear your private progress plan from this browser?')) { progressMemory=null; try { localStorage.removeItem(progressKey); } catch (error) {} go('home'); }
        break;
      case 'home': state.quickIssue=''; state.mode='assessment'; go('home'); break;
      case 'begin':
        if(!state.consent) {state.error='Please confirm that you understand the information above.';render();document.getElementById('consent')?.focus();return;}
        state.mode='assessment'; state.index=0;go('question');break;
      case 'back': state.index>0?state.index--:state.screen='intro';go(state.screen);break;
      case 'resume': state.index=Math.max(0,C.items.findIndex(q=>C.validatedAnswer(state.answers,q.id)===null));go('question');break;
      case 'about': state.from=state.screen;go('about');break;
      case 'return': go(state.from==='about'?'home':state.from);break;
      case 'restart':
        if(Object.keys(state.answers).length && !window.confirm('Start again? Your current answers will be cleared.'))return;
        state.answers={}; state.consent=false; state.index=0; state.mode='assessment'; state.quickIssue=''; state.from='home';go('home');break;
      case 'print':window.print();break;
    }
  }
  document.addEventListener('click',ev => {
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    ev.preventDefault();action(el.getAttribute('data-action'),el.getAttribute('data-issue'),el);
  });
  document.addEventListener('change', ev => {
    if (ev.target.id==='consent') {state.consent=ev.target.checked;state.error='';document.getElementById('consent-error')?.setAttribute('hidden','');}
    if (ev.target.name==='result-style') state.resultStyle=ev.target.value;
    if (ev.target.name==='answer' && state.screen==='question') {
      const item=activeItems()[state.index];state.answers[item.id]=Number(ev.target.value);
      const err=document.getElementById('answer-error');if(err)err.hidden=true;
    }
    if (ev.target.matches('[data-plan-item]')) {
      const plan=readProgress(); if (!plan) return;
      const date=state.progressDate||today(); plan.checks[date]=plan.checks[date]||{}; plan.checks[date][ev.target.getAttribute('data-plan-item')]=ev.target.checked; saveProgress(plan); render();
    }
    if (ev.target.matches('[data-progress-date-input]')) {
      state.progressDate=ev.target.value||today(); render({focusHeading:false});
    }
    if (ev.target.matches('[data-record-id]')) {
      const ids=[...document.querySelectorAll('[data-record-id]:checked')].map(input=>input.getAttribute('data-record-id'));
      state.selectedRecords=ids; render({focusHeading:false});
    }
  });
  document.addEventListener('click', ev => {
    const progressDate=ev.target.closest('[data-progress-date]');
    if (progressDate) {
      state.progressDate=progressDate.getAttribute('data-progress-date')||today();
      render({focusHeading:false});
      return;
    }
    const checkin=ev.target.closest('[data-checkin]');
    if (!checkin) return;
    const plan=readProgress(); if (!plan) return;
    plan.checkins[state.progressDate||today()]=Number(checkin.getAttribute('data-checkin')); saveProgress(plan); render();
  });
  document.addEventListener('submit',ev => {
    if(ev.target.id!=='question-form')return;
    ev.preventDefault();
    const item=activeItems()[state.index];
    const answer=C.validatedAnswer(state.answers,item.id);
    if(answer===null){state.error='Select an answer to continue.';render();document.getElementById('question-field')?.focus();return;}
    if(state.index<activeItems().length-1){state.index++;go('question');return;}
    if(state.mode==='targeted') {
      recordFocusedAssessment();
      go('results');
    } else if(C.scoreAssessment(state.answers).complete) {
      recordCurrentAssessment(); go('results');
    }
  });
  window.addEventListener('popstate',ev => {
    const s=ev.state;
    if(!s)return;
    state.screen=s.screen;state.index=Number.isInteger(s.index)?s.index:0;state.from=s.from||'home';state.error='';
    window.scrollTo(0,0);render({focusHeading:true});
  });
  history.replaceState({screen:'home',index:0,from:'home'},'','#home');
  render();
})();
