/* Burnout Insight. Source-of-truth data and pure scoring functions.
   CBI source: NFA https://nfa.dk/media/a4wheblj/cbi-scales.pdf
   Required attribution: Borritz M et al. (2006), Scand J Public Health 34:49-58.
*/
(function (root, factory) {
  const obj = factory();
  if (typeof module === 'object' && module.exports) module.exports = obj;
  if (root) root.BurnoutCore = obj;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null), function () {
 'use strict';
 const freq = ['Always','Often','Sometimes','Seldom','Never/almost never'];
 const degree = ['To a very high degree','To a high degree','Somewhat','To a low degree','To a very low degree'];
 const agreement = ['Strongly disagree','Disagree','Neither agree nor disagree','Agree','Strongly agree'];
 const cbiItems = [
  {id:'P01',section:'personal',text:'How often do you feel tired?',scale:'freq'},
  {id:'P02',section:'personal',text:'How often are you physically exhausted?',scale:'freq'},
  {id:'P03',section:'personal',text:'How often are you emotionally exhausted?',scale:'freq'},
  {id:'P04',section:'personal',text:'How often do you think: “I can’t take it anymore”?',scale:'freq'},
  {id:'P05',section:'personal',text:'How often do you feel worn out?',scale:'freq'},
  {id:'P06',section:'personal',text:'How often do you feel weak and susceptible to illness?',scale:'freq'},
  {id:'W01',section:'work',text:'Is your work emotionally exhausting?',scale:'degree'},
  {id:'W02',section:'work',text:'Do you feel burnt out because of your work?',scale:'degree'},
  {id:'W03',section:'work',text:'Does your work frustrate you?',scale:'degree'},
  {id:'W04',section:'work',text:'Do you feel worn out at the end of the working day?',scale:'freq'},
  {id:'W05',section:'work',text:'Are you exhausted in the morning at the thought of another day at work?',scale:'freq'},
  {id:'W06',section:'work',text:'Do you feel that every working hour is tiring for you?',scale:'freq'},
  {id:'W07',section:'work',text:'Do you have enough energy for family and friends during leisure time?',scale:'freq',reverse:true}
 ];
 const areaMeta = [
  {id:'workload',name:'Workload',short:'Demands & time pressure',type:'demand',description:'The amount, pace and expectations of work.',employee:'Discuss competing deadlines and agree on realistic priorities with your supervisor.',organization:'Review task allocation, staffing and scheduling; avoid routinely unrealistic deadlines.'},
  {id:'control',name:'Control',short:'Autonomy & influence',type:'resource',description:'Freedom and influence over work-related decisions.',employee:'Ask which decisions you can make independently and where more flexibility is possible.',organization:'Provide appropriate decision-making autonomy and include employees in changes affecting their work.'},
  {id:'reward',name:'Reward',short:'Recognition & fairness of return',type:'resource',description:'Whether effort receives appropriate recognition.',employee:'Request timely, specific feedback and discuss how contributions are recognized.',organization:'Make recognition and reward criteria transparent and provide meaningful feedback.'},
  {id:'community',name:'Community',short:'Relationships & support',type:'mixed',description:'Support, trust and conflict in working relationships.',employee:'Seek constructive support and raise recurring collaboration barriers early.',organization:'Address conflicts consistently and create opportunities for reliable team support.'},
  {id:'fairness',name:'Fairness',short:'Consistent & transparent decisions',type:'mixed',description:'Perceived fairness and transparency at work.',employee:'Document specific concerns and ask for clarification of decisions and criteria.',organization:'Review the consistency, transparency and appeal routes of organizational decisions.'},
  {id:'values',name:'Values',short:'Alignment & professional integrity',type:'mixed',description:'Alignment between professional values and organizational practices.',employee:'Identify specific value conflicts and discuss reasonable alternatives where safe.',organization:'Make it safe to raise ethical concerns and align everyday practice with stated values.'}
 ];
 const workplaceItems = [
  {id:'WL01',area:'workload',text:'My workload is manageable within my regular working hours.',polarity:'positive'},
  {id:'WL02',area:'workload',text:'I frequently face deadlines that are unrealistic.',polarity:'negative'},
  {id:'CO01',area:'control',text:'I can decide how to approach my assigned tasks.',polarity:'positive'},
  {id:'CO02',area:'control',text:'I have a voice in decisions affecting my daily work.',polarity:'positive'},
  {id:'RE01',area:'reward',text:'My contributions are recognized by people at work.',polarity:'positive'},
  {id:'RE02',area:'reward',text:'The rewards I receive feel fair relative to my effort.',polarity:'positive'},
  {id:'CM01',area:'community',text:'I can rely on colleagues for help when needed.',polarity:'positive'},
  {id:'CM02',area:'community',text:'Workplace conflicts make collaboration difficult.',polarity:'negative'},
  {id:'FA01',area:'fairness',text:'People in my workplace are treated fairly.',polarity:'positive'},
  {id:'FA02',area:'fairness',text:'Work-related decisions follow consistent and transparent standards.',polarity:'positive'},
  {id:'VA01',area:'values',text:'My work aligns with my professional values.',polarity:'positive'},
  {id:'VA02',area:'values',text:'I am expected to act against my professional values.',polarity:'negative'}
 ];
 const items = [...cbiItems,...workplaceItems];
 const sources = [
  {label:'World Health Organization — occupational burnout (ICD-11)',url:'https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases'},
  {label:'NFA — official CBI and permission to reuse',url:'https://nfa.dk/vaerktoejer/spoergeskemaer/spoergeskema-til-maaling-af-udbraendthed-cbi/copenhagen-burnout-inventory-cbi'},
  {label:'NFA — original English CBI items and scoring (PDF)',url:'https://nfa.dk/media/a4wheblj/cbi-scales.pdf'},
  {label:'Borritz et al. (2006) — PUMA study, required CBI attribution',url:'https://journals.sagepub.com/doi/10.1080/14034940510032275'},
  {label:'Leiter & Maslach (1999) — Six Areas of Worklife',url:'https://pubmed.ncbi.nlm.nih.gov/10621016/'},
  {label:'Bakker & Demerouti (2017) — JD-R Theory',url:'https://pubmed.ncbi.nlm.nih.gov/27732008/'}
 ];
 function validatedAnswer(answers,id) {
   const a=answers[id];
   return Number.isInteger(a) && a>=0 && a<=4 ? a : null;
 }
 function cbiItemScore(item,choiceIndex) {
   if (!item || !['personal','work'].includes(item.section) || !Number.isInteger(choiceIndex) || choiceIndex<0 || choiceIndex>4) throw new Error('Invalid CBI answer');
   const score=100 - choiceIndex*25;
   return item.reverse?100-score:score;
 }
 function cbiSectionScore(answers,section) {
   if (!['personal','work'].includes(section)) throw new Error('Invalid CBI section');
   const group=cbiItems.filter(i=>i.section===section);
   if (group.some(i=>validatedAnswer(answers,i.id)===null)) return null;
   return group.reduce((n,i)=>n+cbiItemScore(i,answers[i.id]),0)/group.length;
 }
 function workplaceItemConcern(item,choiceIndex) {
   if (!item || !['positive','negative'].includes(item.polarity) || !Number.isInteger(choiceIndex) || choiceIndex<0 || choiceIndex>4) throw new Error('Invalid workplace answer');
   const agreementValue=choiceIndex*25;
   return item.polarity==='positive'?100-agreementValue:agreementValue;
 }
 function workplaceScores(answers) {
   return areaMeta.map(area=>{
     const group=workplaceItems.filter(q=>q.area===area.id);
     const complete=group.every(q=>validatedAnswer(answers,q.id)!==null);
     return {...area,score:complete?group.reduce((sum,q)=>sum+workplaceItemConcern(q,answers[q.id]),0)/group.length:null};
   });
 }
 function scoreAssessment(answers) {
   const valid=items.every(q=>validatedAnswer(answers,q.id)!==null);
   return {complete:valid,personal:cbiSectionScore(answers,'personal'),work:cbiSectionScore(answers,'work'),areas:workplaceScores(answers)};
 }
 function prioritizedAreas(areas) {
   if (!Array.isArray(areas) || areas.some(x=>x.score===null)) return [];
   // Descriptive prioritization threshold only, not a validated clinical cutoff.
   return [...areas].filter(a=>a.score>=50).sort((a,b)=>b.score-a.score).slice(0,3);
 }
 function optionsFor(item) {return item.section==='personal'||item.section==='work'?(item.scale==='degree'?degree:freq):agreement;}
 return {freq,degree,agreement,cbiItems,workplaceItems,areaMeta,items,sources,validatedAnswer,cbiItemScore,cbiSectionScore,workplaceItemConcern,workplaceScores,scoreAssessment,prioritizedAreas,optionsFor};
});
