/* Burnout Insight, plain service-oriented user interface (v6).
   Existing scientific data and scoring are in core.js and intentionally unchanged.
   No network requests or server-side data collection. */
(function () {
  'use strict';
  const C = window.BurnoutCore;
  if (!C) throw new Error('The assessment data could not be loaded.');
  const root = document.getElementById('app');
  const state = { screen: 'home', index: 0, answers: {}, consent: false, from: 'home', error: '', quickIssue: '', resultStyle: 'summary', mode: 'assessment', selectedRecords: [], recordView: null, showRecycle: false, progressDate: today() };
  const targetedPrompts = {
    coworkers:['I feel tense before interacting with a coworker.','A coworker’s communication makes it harder for me to work calmly.','I avoid raising concerns because I expect the conversation to go badly.','Workplace conflict stays on my mind after the interaction ends.','I feel that a coworker does not respect my boundaries.','I am unclear about who owns tasks when working with this coworker.','Small misunderstandings with this coworker grow into larger problems.','I do not feel safe asking this coworker for clarification.','I receive feedback from this coworker in a way that feels discouraging.','This coworker interrupts my ability to focus.','I worry that speaking up will damage the working relationship.','The conflict affects my confidence at work.','I have not had a calm opportunity to discuss the issue.','Our expectations about communication are different.','I feel responsible for managing the other person’s reactions.','The situation makes me withdraw from the team.','I replay difficult conversations after work.','The problem has continued without a clear agreement.','I lack support when collaboration breaks down.','I am unsure who can help resolve the issue fairly.','I find it difficult to separate the person from the work problem.','The conflict affects the quality of my work.','I feel pressure to accept behaviour that is not workable.','I need a clearer boundary or working agreement.','I would benefit from a supported conversation about this situation.'],
    workload:['My workload is too large for the time available.','I regularly face more deadlines than I can realistically meet.','New tasks arrive before earlier tasks are finished.','I work through breaks to keep up.','I find it difficult to decide what should come first.','My workload changes without enough planning time.','I often take work home or continue thinking about it after hours.','I feel pressure to say yes to every new request.','Tasks are distributed in a way that feels unbalanced.','I do not have enough staffing or resources for the work expected.','I worry that quality will suffer because there is too much to do.','Meetings leave too little time for focused work.','I am expected to be available across too many channels.','Urgent requests regularly interrupt important work.','I lack a realistic stopping point at the end of the day.','I have had little chance to recover between demanding tasks.','My priorities are unclear when work conflicts.','I feel behind even when I work hard.','Deadlines are set without enough information about the task.','I am judged on output without the necessary support.','The pace of work is difficult to sustain.','I postpone rest because the workload feels endless.','I need help deciding which work can wait.','I would benefit from a clearer priority agreement.','The current workload is affecting my energy outside work.'],
    control:['I have little influence over how I complete my work.','My priorities change without enough explanation.','I am interrupted so often that I lose control of my day.','I cannot decide when to focus on complex tasks.','I lack a clear way to raise concerns about work decisions.','Changes affecting my work happen without my input.','I am unclear about which decisions I can make independently.','I have to follow processes that do not fit the real situation.','I feel unable to adjust my workload when circumstances change.','My schedule leaves little room for recovery or planning.','I am not given enough information to make good decisions.','My work is closely monitored in a way that increases tension.','I have limited flexibility in how I organize tasks.','Requests from different people conflict with each other.','I do not feel heard when I explain a work barrier.','I need permission for small decisions that affect my progress.','I am unsure how to negotiate realistic expectations.','The lack of autonomy makes work feel more exhausting.','I cannot protect uninterrupted focus time.','I have little opportunity to suggest better ways of working.','I feel stuck when a process is not working.','I find it hard to recover after an unexpected change.','My role and responsibilities are not clear enough.','I would benefit from agreed decision boundaries.','More control over my work would improve my ability to cope.'],
    exhaustion:['I feel tired before my workday has properly started.','I feel physically drained by ordinary tasks.','I feel emotionally exhausted by daily demands.','I find it difficult to recover after work.','I feel worn out even after resting.','I have less energy for family, friends, or personal activities.','I struggle to concentrate when I am tired.','I feel irritable because my energy is low.','I postpone basic self-care when I am exhausted.','I feel that small tasks require too much effort.','I wake up already thinking about how tired I feel.','I need longer breaks than usual to continue working.','I feel detached from activities I normally care about.','I have difficulty switching off work thoughts.','My sleep or rest does not feel refreshing.','I feel less patient in conversations.','I have less motivation to begin important tasks.','I make more mistakes when my energy is low.','I feel pressure to keep going despite exhaustion.','I find it hard to notice what I need until I am overwhelmed.','My exhaustion affects my confidence.','I avoid social contact because I do not have enough energy.','I am concerned that this level of exhaustion will continue.','I need a more sustainable recovery routine.','I would benefit from additional support for my energy and wellbeing.']
  };
  const targetedGroups = Object.fromEntries(Object.keys(targetedPrompts).map(key => [key, targetedPrompts[key].map((text,index) => ({id:`T_${key}_${index+1}`, section:'targeted', scale:'agreement', polarity:'negative', text}))]));
  const mixedAssessmentItems = (() => {
    const items = [...C.cbiItems, ...C.workplaceItems];
    for (let index = items.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [items[index], items[swap]] = [items[swap], items[index]];
    }
    return items;
  })();
  function activeItems() {
    if (state.mode !== 'targeted' || !targetedGroups[state.quickIssue]) return mixedAssessmentItems;
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
    records.unshift({...record,createdAt:record.createdAt||new Date().toISOString(),id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`});
    writeStored(recordsKey, records.slice(0, 12));
  }
  function assessmentResponses(items) {
    return items.map(item => {
      const answer=C.validatedAnswer(state.answers,item.id);
      return {question:item.text, answer:answer===null ? '' : C.optionsFor(item)[answer]};
    });
  }
  function recordCurrentAssessment() {
    const result=C.scoreAssessment(state.answers);
    const prioritized=C.prioritizedAreas(result.areas);
    saveRecord({
      date:today(),
      mode:'Full assessment',
      personal:result.personal,
      work:result.work,
      areas:result.areas.map(area=>({name:area.name,score:area.score,short:area.short})),
      responses:assessmentResponses(mixedAssessmentItems),
      report:{
        type:'full',
        summary:scoreMeaning(result.personal,result.work),
        prioritized:prioritized.map(area=>({
          name:area.name,
          description:area.description,
          employee:area.employee,
          organization:area.organization
        })),
        bestStartingPoint:prioritized[0] ? {
          name:prioritized[0].name,
          employee:prioritized[0].employee
        } : null,
        workplaceNote:'These workplace scores are educational indicators created for this project, not results from the official Areas of Worklife Survey.',
        nextStepsNote:'These suggestions are based on the workplace issues you reported, not on a medical diagnosis.'
      }
    });
  }
  function recordFocusedAssessment() {
    const guide=reliefGuides[state.quickIssue], questions=activeItems(), score=targetedScore(questions);
    saveRecord({
      date:today(),
      mode:`Focused: ${state.quickIssue}`,
      personal:null,
      work:null,
      areas:[{name:state.quickIssue,score}],
      responses:assessmentResponses(questions),
      report:{
        type:'focused',
        issue:state.quickIssue,
        title:guide ? guide.title : state.quickIssue,
        intro:guide ? guide.intro : 'Choose one small action that supports your energy or working conditions.',
        steps:guide ? guide.steps : [],
        answered:questions.filter(item=>C.validatedAnswer(state.answers,item.id)!==null).length,
        total:questions.length
      }
    });
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
  function reportDateTime(record) {
    const value=record.createdAt||record.date;
    const date=new Date(value);
    return Number.isNaN(date.getTime()) ? String(value||'') : date.toLocaleString([], {dateStyle:'long', timeStyle:'short'});
  }
  function downloadRecords(records) {
    const body=records.map((record,index)=>{
      const report=record.report||{}, personal=Number(record.personal), work=Number(record.work);
      const areas=(record.areas||[]).map(area=>`<li><strong>${escapeHtml(area.name)}</strong>: ${Number(area.score||0).toFixed(1)} / 100 — ${escapeHtml(area.short||'')}</li>`).join('');
      const responses=(record.responses||[]).map((response,i)=>`<li><strong>${i+1}. ${escapeHtml(response.question)}</strong><br><span>${escapeHtml(response.answer||'No answer')}</span></li>`).join('');
      const graph=(label,value,kind)=>`<div class="graph-row"><span>${label}</span><div class="track"><i class="${kind}" style="width:${Number.isFinite(value)?value:0}%"></i></div><b>${Number.isFinite(value)?value.toFixed(1):'—'}</b></div>`;
      const advice=report.type==='focused'
        ? `<h3>${escapeHtml(report.title||record.mode)}</h3><p>${escapeHtml(report.intro||'')}</p><ol>${(report.steps||[]).map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol>`
        : `<h3>What this pattern means</h3><p>${report.summary||'No summary was saved for this record.'}</p><h3>Prioritized workplace areas</h3><ul>${(report.prioritized||[]).map(area=>`<li><strong>${escapeHtml(area.name)}</strong><p>${escapeHtml(area.description||'')} <b>Personal step:</b> ${escapeHtml(area.employee||'')} <b>Employer step:</b> ${escapeHtml(area.organization||'')}</p></li>`).join('')||'<li>No prioritized areas were saved.</li>'}</ul><h3>Possible next steps</h3><p>${escapeHtml(report.nextStepsNote||'')}</p>`;
      return `<article><div class="report-kicker">Burnout Insight · Educational report ${String(index+1).padStart(2,'0')}</div><h2>${escapeHtml(record.mode||'Assessment report')}</h2><p class="meta"><strong>Completed:</strong> ${escapeHtml(reportDateTime(record))}</p><section class="summary-card"><h3>Score overview</h3>${graph('Personal burnout',personal,'personal')}${graph('Work-related burnout',work,'work')}</section><h3>Workplace areas</h3><ul>${areas||'<li>No workplace area scores were saved.</li>'}</ul><section class="analysis">${advice}</section><h3>All responses</h3><ol>${responses||'<li>No response details were saved for this older record.</li>'}</ol></article>`;
    }).join('');
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>Burnout Insight reports</title><style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font:11pt Arial,sans-serif;max-width:920px;margin:0 auto;color:#203746;line-height:1.5}header{border-bottom:4px solid #287da8;padding:0 0 18px;margin-bottom:28px}h1{font-size:28pt;color:#155a7a;margin:0 0 5px}h2{font-size:19pt;color:#155a7a;margin:8px 0}h3{font-size:13pt;color:#155a7a;margin:20px 0 8px}.subtitle,.meta{color:#607887}.report-kicker{text-transform:uppercase;letter-spacing:.13em;color:#287da8;font-size:8pt;font-weight:700}.summary-card{background:#f2f8fb;border:1px solid #c9e0eb;border-radius:10px;padding:15px;margin:18px 0}.graph-row{display:grid;grid-template-columns:160px 1fr 45px;gap:10px;align-items:center;margin:11px 0;font-weight:700}.track{height:14px;background:#e4edf1;border-radius:20px;overflow:hidden}.track i{display:block;height:100%;border-radius:20px}.track .personal{background:#cf5b55}.track .work{background:#d89d35}.graph-row b{text-align:right;color:#155a7a}.analysis{border-left:4px solid #75b3c5;background:#f7fbfc;padding:4px 16px;margin:18px 0}article{break-before:page}article:first-of-type{break-before:auto}li{margin:6px 0}section{break-inside:avoid}.footer{border-top:1px solid #c9d8df;margin-top:30px;padding-top:10px;color:#607887;font-size:9pt}</style></head><body><header><h1>Burnout Insight</h1><p class="subtitle">Professional educational assessment report</p><p class="meta">Generated ${escapeHtml(new Date().toLocaleString([], {dateStyle:'long', timeStyle:'short'}))} · ${records.length} report${records.length===1?'':'s'}</p></header>${body}<div class="footer">This report is educational and is not a medical diagnosis. Keep it private and discuss persistent or severe concerns with a qualified professional.</div></body></html>`;
    const blob = new Blob([html], {type:'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `burnout-insight-report-${today()}-${Date.now()}.html`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function recordDetail(record) {
    if (!record) return '';
    const personal=Number(record.personal||0), work=Number(record.work||0);
    const report=record.report||{};
    const focused=report.type==='focused' || report.focused;
    const prioritized=Array.isArray(report.prioritized) ? report.prioritized.map(area=>typeof area==='string'?{name:area}:area) : [];
    const responses=(record.responses||[]).length ? `<section class="result-section"><h2>Responses captured</h2><div class="saved-answer-list">${record.responses.map((response,index)=>`<article><strong>${index+1}. ${escapeHtml(response.question)}</strong><span>${escapeHtml(response.answer||'No answer')}</span></article>`).join('')}</div></section>` : '';
    const fullReport=focused
      ? `<section class="result-section"><h2>What you can try now</h2><div class="advice-item"><h3>${escapeHtml(report.title||record.mode)}</h3><p>${escapeHtml(report.intro||'Choose one small action that supports your energy or working conditions.')}</p><ol>${(report.steps||[]).map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol></div><p class="small-text">Completed ${Number(report.answered||0)} of ${Number(report.total||0)} focused questions. This category score is an educational indicator, not a diagnosis.</p></section>`
      : `<section class="result-section"><h2>What this pattern means</h2><p>${report.summary||scoreMeaning(personal,work)}</p></section><section class="result-section"><h2>What your answers might mean</h2><p>The areas you reported the most concern about include <strong>${prioritized.map(area=>escapeHtml(area.name)).join(', ')||'no particular workplace area'}</strong>.</p>${prioritized.map(area=>`<article class="advice-item"><h3>${escapeHtml(area.name)}</h3><p>${escapeHtml(area.description||'')}</p><p><strong>What you can do:</strong> ${escapeHtml(area.employee||'')}</p><p><strong>What an employer can do:</strong> ${escapeHtml(area.organization||'')}</p></article>`).join('')}</section><section class="result-section"><h2>Possible next steps</h2><p>${escapeHtml(report.nextStepsNote||'These suggestions are based on the workplace issues you reported, not on a medical diagnosis.')}</p>${report.bestStartingPoint?`<div class="solution-card"><span class="solution-icon">→</span><div><strong>Your best starting point: ${escapeHtml(report.bestStartingPoint.name)}</strong><p>${escapeHtml(report.bestStartingPoint.employee)}</p></div></div>`:'<p>Choose one small recovery action today, then speak with someone you trust if the concern continues.</p>'}</section>`;
    return `<section class="record-detail"><div class="section-kicker">${tx('Saved report')}</div><h2>${escapeHtml(record.mode)}</h2><p class="small-text">${escapeHtml(reportDateTime(record))} · ${tx('Your presented report is saved here for later review.')}</p>${personal||work?`<div class="meter-grid">${exhaustionMeter(tx('Personal exhaustion'),personal,tx('How exhausted you felt overall.'))}${exhaustionMeter(tx('Work-related exhaustion'),work,tx('How exhausted you felt in relation to your job.'))}</div>${impactGraph(personal,work)}`:`<section class="focused-score-card"><div><span class="focused-score-label">${tx('Reported concern level')}</span><strong>${Number(record.areas?.[0]?.score||0).toFixed(0)}<small>/100</small></strong></div><div class="meter focused-meter"><span class="meter-fill ${meterBand(Number(record.areas?.[0]?.score||0)).className}" style="width:${Number(record.areas?.[0]?.score||0)}%"></span><i class="meter-marker" style="left:${Number(record.areas?.[0]?.score||0)}%"></i></div></section>`}${fullReport}<h3>${tx('Workplace areas')}</h3><div class="area-card-grid">${(record.areas||[]).map(area=>`<article class="area-card"><div class="area-card-head"><h3>${escapeHtml(area.name)}</h3><strong>${Number(area.score||0).toFixed(0)}<small>/100</small></strong></div><div class="area-bar"><i style="width:${Number(area.score||0)}%"></i></div>${area.short?`<p>${escapeHtml(area.short)}</p>`:''}</article>`).join('')}</div>${responses}<button class="button secondary no-print" type="button" data-action="close-record">${tx('Back to records')}</button></section>`;
  }
  function recordsPage() {
    const records=state.showRecycle?readRecycle():readRecords(), allSelected=state.selectedRecords.length===0;
    if (state.recordView) {
      return `<main id="main" class="container content records-content" tabindex="-1" dir="${dir()}"><button class="button secondary no-print" type="button" data-action="close-record">← ${tx('Back to records')}</button>${recordDetail(recordForId(state.recordView))}</main>`;
    }
    const activeCount=readRecords().length, recycleCount=readRecycle().length;
    return `<main id="main" class="container content records-content" tabindex="-1"><div class="section-kicker">Private history</div><h1>Your records</h1><p class="intro-text">Completed assessments keep the full report, workplace areas, and every response so you can review a specific day later.</p><div class="records-tabs no-print"><button class="button ${state.showRecycle?'secondary':'primary'}" data-action="active-records">Active records (${activeCount})</button><button class="button ${state.showRecycle?'primary':'secondary'}" data-action="recycle-records">Recycle bin (${recycleCount})</button></div>${state.showRecycle?'<p class="small-text">Deleted records stay here until you permanently remove or restore them.</p>':''}${records.length?`<div class="records-toolbar no-print"><span>Select reports to download the complete formatted report</span>${!state.showRecycle?'<button class="button secondary" type="button" data-action="download-records">Download full report</button>':''}${state.showRecycle?'<button class="button danger" type="button" data-action="empty-recycle">Empty recycle bin</button>':''}</div>${records.map((record,index)=>{const id=record.id||`${record.date}-${index}`,selected=allSelected||state.selectedRecords.includes(id);return `<article class="record-card ${selected?'record-selected':'record-unselected'}"><label class="record-select no-print"><input type="checkbox" data-record-id="${escapeHtml(id)}" ${selected?'checked':''}><span></span></label><button class="record-open" type="button" data-action="view-record" data-record="${escapeHtml(id)}"><strong>${escapeHtml(record.mode)}</strong><small>${escapeHtml(reportDateTime(record))} · ${(record.responses||record.answers||[]).length} responses saved</small><span class="record-values"><span>Personal <b>${record.personal?.toFixed?.(0) ?? '—'}</b></span><span>Work <b>${record.work?.toFixed?.(0) ?? '—'}</b></span></button><div class="record-actions no-print">${state.showRecycle?`<button class="button secondary" data-action="restore-record" data-record="${escapeHtml(id)}">Restore</button>`:`<button class="button danger" data-action="delete-record" data-record="${escapeHtml(id)}">Delete</button>`}</div></article>`;}).join('')}`:'<div class="notice"><strong>No records here</strong><p>Complete an assessment and your result will appear here.</p></div>'}${link('home','← Return home','back-link')}</main>`;
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
  const tx = text => text;
  const dir = () => 'ltr';
  const displayQuestion = item => item.text;
  const displayOption = option => option;
  const displayArea = area => area.name;
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
  const focusedTips = {
    coworkers:'Focus on the specific behaviour, its effect on your work, and one boundary or agreement that could make the next interaction clearer.',
    workload:'Separate urgent work from work that can wait, then ask for a clear trade-off instead of silently absorbing another task.',
    control:'Identify one decision, interruption, or unclear expectation that is draining your control and choose one practical change to request.',
    exhaustion:'Treat the signal as information: pause, reduce the next task, and consider support if this level of exhaustion keeps returning.'
  };
  function partialMeter() {
    if (state.mode === 'targeted') {
      const items=activeItems();
      const answered=items.filter(item=>C.validatedAnswer(state.answers,item.id)!==null);
      return [{label:reliefGuides[state.quickIssue]?.title || 'Focused concern', score:targetedScore(items), count:answered.length}];
    }
    const groups = [
      {id:'personal', label:'Personal burnout', items:C.cbiItems},
      {id:'work', label:'Work-related burnout', items:C.workplaceItems}
    ];
    return groups.map(group => {
      const answered=group.items.filter(item=>C.validatedAnswer(state.answers,item.id)!==null);
      if (!answered.length) return {...group, score:0, count:0};
      const score=answered.reduce((sum,item)=>sum+(C.cbiItems.includes(item)?C.cbiItemScore(item,state.answers[item.id]):C.workplaceItemConcern(item,state.answers[item.id])),0)/answered.length;
      return {...group,score,count:answered.length};
    });
  }
  function liveMeterCard(group) {
    const band=meterBand(group.score);
    return `<div class="live-meter"><div class="live-meter-head"><span>${escapeHtml(group.label)}</span><strong>${group.count?group.score.toFixed(1):'—'}<small>/100</small></strong></div><div class="meter compact-meter"><span class="meter-fill ${band.className}" style="width:${group.score}%"></span><i class="meter-marker" style="left:${group.score}%"></i></div><small>${group.count?`${group.count} answered · ${band.label}`:'Answer questions to build this meter'}</small>${group.count?`<em class="meter-guidance ${band.className}"><strong>What this range suggests:</strong> ${band.guidance}</em>`:''}</div>`;
  }
  function questionAdvice(item) {
    const selected=C.validatedAnswer(state.answers,item.id);
    const tip=questionTips[item.id] || focusedTips[state.quickIssue] || 'Notice what this question brings to mind, then choose one small action that supports your energy or working conditions.';
    return `<aside class="question-help"><div class="help-badge">Practical support</div><h2>${selected===null?'What this area may suggest':'What you can try next'}</h2><p>${tip}</p><div class="help-divider"></div><small>This suggestion is for reflection and practical support. It does not interpret one answer as a diagnosis.</small></aside>`;
  }

  function header() {
    const surveyHeader=state.screen==='question' ? `<div class="header-progress"><span>Question ${state.index+1} of ${activeItems().length}</span><div><i style="width:${Math.round((state.index+1)/activeItems().length*100)}%"></i></div></div>` : '';
    return `<header class="site-header no-print" dir="ltr"><div class="container header-inner"><button type="button" class="brand brand-button" data-action="home" aria-label="Go to Burnout Insight home"><span class="brand-mark">✦</span><span>Burnout Insight<small>Work wellbeing tool</small></span></button>${surveyHeader}<nav aria-label="Main navigation">${link('records','Records','nav-progress')}${readProgress()?link('progress', 'My progress', 'nav-progress'):''}${link('howto', 'How it works')}</nav></div></header>`;
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
      <div class="relief-options">${Object.entries(reliefGuides).map(([id,item]) => `<button type="button" class="relief-option ${state.quickIssue===id?'selected':''}" data-action="relief" data-issue="${id}"><span class="relief-icon">${id==='coworkers'?'↔':id==='workload'?'▤':id==='control'?'◌':'♡'}</span><span>${item.title}</span></button>`).join('')}</div>
      ${guide ? `<div class="relief-result"><h3>${guide.title}</h3><p>${guide.intro}</p><ol>${guide.steps.map(step=>`<li>${step}</li>`).join('')}</ol><button type="button" class="button secondary" data-action="targeted-start">Answer focused questions</button><button type="button" class="text-link" data-action="start">Take the full assessment</button></div>` : ''}
    </section>`;
  }
  function otherCheckIns(exclude='') {
    const labels={coworkers:'Coworker tension',workload:'Workload and deadlines',control:'Control and interruptions',exhaustion:'Current exhaustion'};
    return `<section class="result-section check-in-section"><h2>Explore another possible cause</h2><p>If this result does not explain what you are looking for, use a short focused check-in for another work-life area.</p><div class="relief-options">${Object.entries(labels).filter(([id])=>id!==exclude).map(([id,label])=>`<button type="button" class="relief-option" data-action="explore-relief" data-issue="${id}"><span class="relief-icon">${id==='coworkers'?'↔':id==='workload'?'▤':id==='control'?'◌':'♡'}</span><span>${label}</span></button>`).join('')}</div></section>`;
  }
  function home() {
    const savedRecords=readRecords();
    const combinedScore = (key, currentScore, currentCount, totalQuestions) => {
      const saved=savedRecords.map(record => Number(record[key])).filter(Number.isFinite);
      const weighted=saved.reduce((sum,value)=>sum+value*totalQuestions,0);
      const count=saved.length*totalQuestions;
      if (Number.isFinite(currentScore) && currentCount) return (weighted+currentScore*currentCount)/(count+currentCount);
      return count ? weighted/count : 0;
    };
    const averageAreas = savedRecords.flatMap(record => record.areas || []);
    const currentAreaScores = C.areaMeta.map(area => {
      const items=C.workplaceItems.filter(item=>item.area===area.id);
      const answered=items.filter(item=>C.validatedAnswer(state.answers,item.id)!==null);
      return answered.length ? {
        score:answered.reduce((sum,item)=>sum+C.workplaceItemConcern(item,state.answers[item.id]),0)/answered.length,
        count:answered.length
      } : null;
    });
    const personalAnswered=C.cbiItems.filter(item=>item.section==='personal'&&C.validatedAnswer(state.answers,item.id)!==null);
    const workAnswered=C.cbiItems.filter(item=>item.section==='work'&&C.validatedAnswer(state.answers,item.id)!==null);
    const livePersonal=personalAnswered.length?personalAnswered.reduce((sum,item)=>sum+C.cbiItemScore(item,state.answers[item.id]),0)/personalAnswered.length:null;
    const liveWork=workAnswered.length?workAnswered.reduce((sum,item)=>sum+C.cbiItemScore(item,state.answers[item.id]),0)/workAnswered.length:null;
    const dashboardValues=(savedRecords.length || personalAnswered.length || workAnswered.length) ? [
      ['Personal exhaustion',combinedScore('personal',livePersonal,personalAnswered.length,6)],
      ['Work exhaustion',combinedScore('work',liveWork,workAnswered.length,7)],
      ['Workplace concern',(() => {
        const savedTotal=averageAreas.reduce((sum,area)=>sum+Number(area.score||0),0);
        const savedCount=averageAreas.filter(area=>Number.isFinite(Number(area.score))).length;
        const current=currentAreaScores.filter(Boolean);
        const currentTotal=current.reduce((sum,area)=>sum+area.score,0);
        const currentCount=current.length;
        return savedCount+currentCount ? Math.round((savedTotal+currentTotal)/(savedCount+currentCount)) : 0;
      })()]
    ] : [['Personal exhaustion',Math.round(livePersonal||0)],['Work exhaustion',Math.round(liveWork||0)],['Workplace concern',0]];
    const dashboardTag=savedRecords.length ? tx('Overall from')+' '+savedRecords.length+' '+tx('records')+(personalAnswered.length||workAnswered.length?' + current answers':'') : tx('Interactive view');
    const dashboardHtml=dashboardValues.map(([label,value])=>`<div class="live-dial-item">${dial(tx(label),value,'')}</div>`).join('');
    const overallScore=dashboardValues.reduce((sum,[,value])=>sum+Number(value||0),0)/dashboardValues.length;
    const overallBand=meterBand(overallScore);
    return `<main id="main" class="container content" tabindex="-1" dir="${dir()}">
      <section class="home-hero-layout">
      <section class="hero-panel">
        <div class="hero-copy"><div class="section-kicker"><span class="mini-icon">•</span>${tx('Private self-check · 6–8 minutes')}</div><h1>Understand your work stress. Find your next step.</h1><p class="intro-text">Burnout Insight helps you reflect on exhaustion, workplace pressure, and the conditions that may be making work harder.</p><div class="hero-actions"><button class="button primary" type="button" data-action="start">${tx('Start assessment')}</button><span class="hero-note">No account. No data collection.</span></div></div>
        ${state.quickIssue ? '<div class="help-mode-banner"><strong>Focused support mode</strong><span>Choose a category below for practical guidance.</span></div>' : `<div class="hero-visual-card"><div class="visual-label">${tx('YOUR WORK WELLBEING')}</div><div class="hero-orbit"><div class="orbit-center">${tx('Work')}<br><strong>${tx('wellbeing')}</strong></div><span class="orbit-pill pill-one">${tx('Energy')}</span><span class="orbit-pill pill-two">${tx('Focus')}</span><span class="orbit-pill pill-three">${tx('Support')}</span></div><div class="visual-caption">${tx('A clearer picture starts with one honest answer.')}</div></div>`}
      </section>
      <aside class="choice-rail"><div class="section-kicker">${tx('What do you need today?')}</div><h2>Choose your starting point</h2><div class="choice-grid"><button class="choice-card" data-action="start"><strong>◈</strong><span>${tx('Find my pattern')}</span><small>Answer the questions and understand your exhaustion pattern.</small></button><button class="choice-card" data-action="relief" data-issue="exhaustion"><strong>✦</strong><span>${tx('Get immediate help')}</span><small>Start with a short practical step for today.</small></button><button class="choice-card" data-action="howto"><strong>ⓘ</strong><span>${tx('How it works')}</span><small>Learn about the steps, results, and privacy.</small></button></div></aside>
      </section>
      <section class="live-dashboard home-dashboard-top"><div class="dashboard-heading"><div><div class="section-kicker">${tx('Your wellbeing dashboard')}</div><h2>${tx('Overall work wellbeing summary')}</h2></div><span class="dashboard-tag">${dashboardTag}</span></div><div class="live-dial-grid">${dashboardHtml}</div><p class="dashboard-summary"><strong>${overallBand.label}.</strong> ${overallBand.guidance}</p><p class="dashboard-note">${savedRecords.length?tx('This dashboard combines saved reports and current answers.'):tx('Each meter updates as answers become available.')}</p></section>
      ${quickRelief()}
      <p class="help-note">Educational tool only: it cannot diagnose burnout, depression, or another health condition.</p>
    </main>`;
  }
  function intro() {
    return `<main id="main" class="container content" tabindex="-1" dir="${dir()}">
      ${link('home', `← ${tx('Back')}`, 'back-link')}
      <h1>${tx('Before you start')}</h1>
      <p>The 25 questions are mixed into a random order: 13 personal and work-exhaustion questions, plus 12 workplace questions.</p>
      <p>There are no right or wrong answers. Choose the answer that best describes your experience.</p>
      <div class="notice" role="note"><strong>Important</strong><p>The results are for information only. A score is not a diagnosis or a percentage chance of having burnout. If your symptoms are severe or ongoing, speak to a qualified healthcare professional.</p></div>
      <p>We do not ask for your name. Answers are processed only in this browser and are cleared when you close or refresh the page.</p>
      <label class="consent-row"><input type="checkbox" id="consent" ${state.consent?'checked':''}><span>I understand that this is not a medical assessment.</span></label>
      <fieldset class="result-preference"><legend>${tx('How do you want your results?')}</legend><label><input type="radio" name="result-style" value="summary" ${state.resultStyle==='summary'?'checked':''}> ${tx('Normal summary')}</label><label><input type="radio" name="result-style" value="detailed" ${state.resultStyle==='detailed'?'checked':''}> ${tx('Detailed analysis')}</label></fieldset>
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
      <div class="survey-overview"><div><p class="step">${tx('Question')} ${state.index+1} of ${questions.length}</p><div class="progress" aria-label="Assessment progress"><span style="width:${pct}%"></span></div></div></div>
      <div class="question-layout question-enter"><form id="question-form" novalidate><p class="section-label">${escapeHtml(groupName(item))}</p><fieldset class="question-field" id="question-field" tabindex="-1" aria-describedby="answer-error">
        <legend><span class="question-eyebrow">A moment to check in</span><h1 id="question-title">${escapeHtml(displayQuestion(item))}</h1></legend>
        <p class="hint">${tx('Select one answer.')}</p>
        <p class="error" role="alert" id="answer-error" ${state.error?'':'hidden'}>${state.error?escapeHtml(state.error):''}</p>
        <div class="radio-options">${C.optionsFor(item).map((answer, i) => `<label class="radio-option"><input type="radio" name="answer" value="${i}" ${selected===i?'checked':''}><span>${escapeHtml(displayOption(answer))}</span></label>`).join('')}</div>
      </fieldset><button class="button primary" type="submit">${state.index===questions.length-1?'See my results':'Continue'}</button></form><div class="question-side"><div class="live-meters">${meters.map(liveMeterCard).join('')}</div>${questionAdvice(item)}</div></div>
    </main>`;
  }
  function meterBand(score) {
    if (score < 34) return {label:'Lower reported exhaustion', className:'low', text:'Your answers suggest fewer reported exhaustion symptoms on this educational scale.', guidance:'Keep the conditions that support your energy and check in again if work changes.'};
    if (score < 67) return {label:'Elevated reported exhaustion', className:'elevated', text:'Your answers suggest some reported exhaustion that may be worth monitoring and discussing.', guidance:'Choose one pressure point to adjust, protect a recovery break, and monitor the pattern.'};
    return {label:'Higher reported exhaustion', className:'high', text:'Your answers suggest more frequent or intense reported exhaustion. Consider support and practical changes.', guidance:'Pause where possible, reduce the next demand, and seek trusted or professional support if this persists.'};
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
      <p class="meter-guidance ${band.className}"><strong>Suggested next step:</strong> ${band.guidance}</p>
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
      return `<main id="main" class="container content results-content" tabindex="-1" dir="${dir()}"><div class="section-kicker">Focused support</div><h1>Your next step for ${escapeHtml(guide ? guide.title : 'this concern')}</h1><p class="intro-text">You completed ${answered} of ${questions.length} focused questions. This category score is an educational indicator, not a diagnosis.</p><section class="focused-score-card"><div><span class="focused-score-label">Reported concern level</span><strong>${score.toFixed(1)}<small>/100</small></strong></div><div class="meter focused-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score.toFixed(1)}"><span class="meter-fill ${band.className}" style="width:${score}%"></span><i class="meter-marker" style="left:${score}%"></i></div><p class="meter-status ${band.className}"><strong>${band.label}.</strong> ${band.text}</p><p class="meter-guidance ${band.className}"><strong>What this range suggests:</strong> ${band.guidance}</p></section><section class="result-section"><h2>What you can try now</h2><div class="advice-item"><h3>${escapeHtml(guide ? guide.title : 'Your selected concern')}</h3><p>${escapeHtml(guide ? guide.intro : 'Choose one small action that supports your energy or working conditions.')}</p><ol>${(guide ? guide.steps : []).map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol></div></section>${score<34?otherCheckIns(state.quickIssue):''}<div class="result-controls"><button type="button" class="button primary" data-action="start">Take the full assessment</button>${link('home','Return home')}</div></main>`;
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
      <p><strong>Thirteen questions</strong> come from the published English Copenhagen Burnout Inventory. They measure personal exhaustion and work-related exhaustion.</p>
      <p><strong>Twelve workplace questions</strong> are original questions created for this project using the Six Areas of Worklife framework. They have not been clinically or psychometrically validated.</p>
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
      <div class="section-kicker">${tx('How it works')}</div><h1>How to use Burnout Insight</h1>
      <p class="intro-text">Start with what you need today, answer honestly, then use the results to choose one small action you can try.</p>
      <div class="howto-steps"><article><b>01</b><h2>Choose</h2><p>Choose Find my pattern, Get immediate help, or learn how the tool works.</p></article><article><b>02</b><h2>Answer</h2><p>Questions appear one at a time in simple cards. You can go back and change answers.</p></article><article><b>03</b><h2>Understand</h2><p>See educational indicators for personal exhaustion, work exhaustion, and workplace areas.</p></article><article><b>04</b><h2>Take action</h2><p>Choose one practical suggestion and track your energy with the seven-day plan.</p></article></div>
      <div class="notice"><strong>Important</strong><p>This is an educational tool, not a medical diagnosis. No score proves that you do or do not have burnout.</p></div>
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
  function resetAssessment(mode='assessment', issue='') {
    state.answers={};
    state.consent=false;
    state.index=0;
    state.error='';
    state.mode=mode;
    state.quickIssue=issue;
  }
  function action(name, value, source) {
    const recordId=value || source?.getAttribute('data-record') || '';
    switch(name) {
      case 'start': resetAssessment(); go('intro'); break;
      case 'targeted-start': resetAssessment('targeted', state.quickIssue); go('question'); break;
      case 'howto': state.from=state.screen; go('howto'); break;
      case 'relief':
        state.quickIssue=value||''; state.mode='targeted'; render({focusHeading:false});
        requestAnimationFrame(() => root.querySelector('.relief-panel')?.scrollIntoView({behavior:'smooth',block:'start'}));
        break;
      case 'explore-relief':
        state.quickIssue=value||'';
        state.mode='assessment';
        go('home');
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
        resetAssessment(); state.consent=true; go('question');break;
      case 'back': state.index>0?state.index--:state.screen='intro';go(state.screen);break;
      case 'resume': state.index=Math.max(0,mixedAssessmentItems.findIndex(q=>C.validatedAnswer(state.answers,q.id)===null));go('question');break;
      case 'about': state.from=state.screen;go('about');break;
      case 'return': go(state.from==='about'?'home':state.from);break;
      case 'restart':
        if(Object.keys(state.answers).length && !window.confirm('Start again? Your current answers will be cleared.'))return;
        resetAssessment(); state.from='home';go('home');break;
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
      render({focusHeading:false});
      requestAnimationFrame(() => root.querySelector('input[name="answer"]:checked')?.focus());
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
  document.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' || ev.target.name !== 'answer' || state.screen !== 'question') return;
    ev.preventDefault();
    document.getElementById('question-form')?.requestSubmit();
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
