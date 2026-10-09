(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const projects = [
    {id:'courtyard',name:'The Courtyard House',category:'Residential',image:'courtyard-1672.webp',thumb:'courtyard-640.webp',alt:'A lime-plaster and terracotta house around a tree-filled courtyard and reflecting pool',intro:'A home that turns inward, and opens up.',description:'This residential study arranges everyday life around a planted courtyard. Deep openings soften the boundary between inside and out, while a low roof, shaded terrace and narrow pool give the house a quiet centre of gravity.',materials:[['Lime plaster','#ded6bd'],['Terracotta','#a35e40'],['Oak','#b3986b']],type:'A new home'},
    {id:'interior',name:'Quiet Form',category:'Interiors',image:'interior-1086.webp',thumb:'interior-480.webp',alt:'Soft sunlight in a limewash living room with walnut joinery and an olive chair',intro:'Fewer things. More room to feel at home.',description:'A study in the gentle rhythm of daily life. Curved thresholds, low joinery and a restrained material palette leave space for light to move across the room. Familiar textures bring warmth without adding visual noise.',materials:[['Limewash','#ded8c8'],['Walnut','#69503a'],['Travertine','#c8bba2']],type:'An interior refresh'},
    {id:'pavilion',name:'Canopy Pavilion',category:'Public spaces',image:'pavilion-1448.webp',thumb:'pavilion-640.webp',alt:'An open timber reading pavilion with a gently curved roof among mature trees',intro:'A small invitation to stay a little longer.',description:'An open pavilion imagines a shared place to read, rest and meet. A gently folded timber roof creates shade; slender columns keep the landscape in view. Long benches make room for both company and solitude.',materials:[['Timber','#b69667'],['Pale stone','#c5c2aa'],['Planting','#68735b']],type:'A community space'},
    {id:'brick',name:'Brick & Light',category:'Workspaces',image:'brick-1448.webp',thumb:'brick-640.webp',alt:'A creative workspace inside a brick warehouse with oak desks and arched openings',intro:'Old character. New ways of working.',description:'An adaptive-reuse study that keeps the building’s memory visible. Existing brick arches frame new communal tables, while a slim steel mezzanine introduces another layer. The idea is to add what is needed and let the original shell do the talking.',materials:[['Clay brick','#9e5e44'],['Blackened steel','#424339'],['Oak','#b6976f']],type:'A workplace'}
  ];
  const byId = new Map(projects.map(p => [p.id,p]));
  const icon = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const textNode = (tag, text, className) => {const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;};
  let storageWorks = true;
  function read(key) {try {return JSON.parse(localStorage.getItem(key));} catch {return null;}}
  function write(key, value) {
    try {localStorage.setItem(key,JSON.stringify(value));storageWorks=true;}
    catch {storageWorks=false;}
    updateStorageNote();
  }
  function updateStorageNote() {
    $('#shortlist-storage').textContent=storageWorks?'Saved in this browser. Nothing is sent.':'Available during this visit. Your browser is blocking local saving.';
    $('#brief-privacy').textContent=storageWorks?'Your draft stays in this browser. Nothing is submitted or sent.':'Your browser is blocking local saving. Download your brief to keep it. Nothing is sent.';
  }
  try {localStorage.getItem('g3-brief-v1');} catch {storageWorks=false;}
  const rawSaved=read('g3-saved-v1');
  let saved = new Set(Array.isArray(rawSaved) ? rawSaved.filter(id=>byId.has(id)) : []);
  let currentProject=projects[0].id;
  let toastTimer;
  function toast(message) {
    clearTimeout(toastTimer);
    const box=$('#toast');($('dialog[open]')||document.body).append(box);box.textContent=message;box.classList.add('is-visible');
    toastTimer=setTimeout(()=>box.classList.remove('is-visible'),3000);
  }
  const returnFocus=new WeakMap();
  function openDialog(dialog, trigger=document.activeElement) {
    const active=$('dialog[open]');
    const previous=active?returnFocus.get(active):trigger;
    if(active && active!==dialog) active.close();
    returnFocus.set(dialog,previous && !previous.closest('dialog')?previous:$('.header-brief'));
    if(!dialog.open) dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.scrollTop=0;
    const first=$('[data-close]',dialog);if(first)first.focus({preventScroll:true});
  }
  function closeDialog(dialog) {if(dialog.open)dialog.close();}
  $$('dialog').forEach(dialog=>{
    $('[data-close]',dialog).addEventListener('click',()=>closeDialog(dialog));
    dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
    dialog.addEventListener('close',()=>{
      if(!$('dialog[open]')) {
        document.body.classList.remove('dialog-open');
        const target=returnFocus.get(dialog);
        if(target?.isConnected && target.getClientRects().length) target.focus({preventScroll:true});
      }
    });
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog)return;
      const r=dialog.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);
    });
    dialog.addEventListener('keydown',event=>{
      if(event.key!=='Tab')return;
      const elements=$$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]',dialog).filter(el=>el.getClientRects().length && !el.closest('[hidden]'));
      if(!elements.length)return;
      const first=elements[0], last=elements[elements.length-1];
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
  });
  $('#menu-trigger').addEventListener('click',event=>openDialog($('#menu-dialog'),event.currentTarget));
  $$('#menu-dialog nav a').forEach(link=>link.addEventListener('click',()=>closeDialog($('#menu-dialog'))));

  function syncSaved() {
    $$('.saved-count').forEach(el=>el.textContent=saved.size);
    $$('.shortlist-trigger').forEach(el=>el.setAttribute('aria-label',`Open saved projects, ${saved.size} saved`));
    $$('[data-save]').forEach(button=>{
      const selected=saved.has(button.dataset.save);
      button.setAttribute('aria-pressed',selected);
      button.setAttribute('aria-label',`${selected?'Remove':'Save'} ${byId.get(button.dataset.save).name}${selected?' from saved projects':''}`);
    });
    const isSaved=saved.has(currentProject);
    $('#project-save span').textContent=isSaved?'Saved to inspiration':'Save concept';
    $('#project-save').setAttribute('aria-pressed',isSaved);
    renderShortlist();renderInspiration();
  }
  function toggleSaved(id,notify=true) {
    if(!byId.has(id))return;
    const wasSaved=saved.has(id);
    if(wasSaved)saved.delete(id);else saved.add(id);
    write('g3-saved-v1',[...saved]);syncSaved();
    if(notify)toast(wasSaved?'Removed from your inspiration.':'Added to your inspiration.');
  }
  function openProject(id,trigger) {
    const p=byId.get(id);if(!p)return;
    currentProject=id;
    const number=String(projects.indexOf(p)+1).padStart(2,'0');
    $('#project-dialog-label').textContent=`G3 Architects / Concept ${number}`;
    $('#project-dialog-category').textContent=`${p.category} / A design exploration`;
    $('#project-dialog-title').textContent=p.name;
    $('#project-dialog-intro').textContent=p.intro;
    $('#project-dialog-description').textContent=p.description;
    $('#project-dialog-image').src=`assets/images/${p.image}`;
    $('#project-dialog-image').alt=p.alt;
    $('#project-position').textContent=`${number} / 04`;
    const materials=$('#project-materials');materials.replaceChildren();
    p.materials.forEach(([name,color])=>{
      const item=document.createElement('div');item.className='material';
      const swatch=document.createElement('span');swatch.className='material-swatch';swatch.style.background=color;swatch.setAttribute('aria-hidden','true');
      item.append(swatch,textNode('span',name));materials.append(item);
    });
    syncSaved();openDialog($('#project-dialog'),trigger);
  }
  document.addEventListener('click',event=>{
    const projectButton=event.target.closest('[data-project]');
    if(projectButton)openProject(projectButton.dataset.project,projectButton);
    const saveButton=event.target.closest('[data-save]');
    if(saveButton)toggleSaved(saveButton.dataset.save);
  });
  $('#project-save').addEventListener('click',()=>toggleSaved(currentProject));
  $('#next-project').addEventListener('click',()=>{
    const next=(projects.findIndex(p=>p.id===currentProject)+1)%projects.length;
    openProject(projects[next].id);
    $('#project-dialog-title').focus({preventScroll:true});
  });
  function renderShortlist() {
    const list=$('#shortlist-items');list.replaceChildren();
    if(!saved.size){
      const empty=document.createElement('div');empty.className='shortlist-empty';empty.innerHTML=icon('bookmark');
      empty.append(textNode('h3','A blank page, for now.'),textNode('p','Tap the bookmark on a project to keep the spaces that inspire you.'));
      const browse=textNode('button','Explore the collection','underlined-link');browse.type='button';
      browse.addEventListener('click',()=>{closeDialog($('#shortlist-dialog'));$('#work').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
      empty.append(browse);list.append(empty);return;
    }
    for(const id of saved){
      const p=byId.get(id),item=document.createElement('div');item.className='shortlist-item';
      const img=document.createElement('img');img.src=`assets/images/${p.thumb}`;img.alt=p.alt;img.width=91;img.height=85;
      const details=document.createElement('button');details.dataset.project=id;details.append(textNode('span',p.name,'shortlist-title'),textNode('span',p.category,'eyebrow'));
      const remove=document.createElement('button');remove.type='button';remove.className='icon-button';remove.setAttribute('aria-label',`Remove ${p.name}`);remove.innerHTML=icon('close');
      remove.addEventListener('click',()=>{toggleSaved(id,false);const next=$('#shortlist-items .icon-button')||$('#shortlist-items button');next?.focus();});
      item.append(img,details,remove);list.append(item);
    }
  }
  $$('[data-open-shortlist]').forEach(button=>button.addEventListener('click',()=>{renderShortlist();openDialog($('#shortlist-dialog'),button);}));
  $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    $$('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',active);});
    const cards=$$('.project-card');cards.forEach(card=>card.hidden=filter!=='all'&&card.dataset.category!==filter);
    $('#project-grid').classList.toggle('is-filtered',filter!=='all');
    const count=cards.filter(card=>!card.hidden).length;
    $('#filter-status').textContent=`${count} ${count===1?'project':'projects'} shown${filter==='all'?'':` in ${filter}`}`;
  }));
  $$('[data-view]').forEach(button=>button.addEventListener('click',()=>{
    $('#project-grid').classList.toggle('is-index',button.dataset.view==='index');
    $$('[data-view]').forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',active);});
  }));
  const principleVisuals={light:['courtyard-640.webp','Sunlight and shade in the Courtyard House','Light as a building material.'],material:['interior-480.webp','Walnut, limewash and travertine in the Quiet Form interior','Nothing to hide. Everything to feel.'],nature:['pavilion-640.webp','A timber pavilion open to the surrounding park','A conversation with the landscape.']};
  $$('.principle').forEach(item=>item.addEventListener('toggle',()=>{
    if(!item.open)return;
    $$('.principle').forEach(other=>{if(other!==item)other.open=false;});
    const [file,alt,caption]=principleVisuals[item.dataset.principle];
    $('#principle-image').src=`assets/images/${file}`;$('#principle-image').alt=alt;$('#principle-caption').textContent=caption;
  }));

  const form=$('#brief-form');
  const field=name=>form.elements.namedItem(name);
  const priorityOptions=$$('input[name="priority"]',form).map(input=>input.value);
  const projectTypes=[...field('type').options].map(o=>o.value).filter(Boolean);
  const timelines=[...field('timeline').options].map(o=>o.value);
  const clean=(value,max)=>typeof value==='string'?value.slice(0,max):'';
  const blank=()=>({type:'',location:'',area:'',timeline:'Just exploring',priorities:[],notes:'',step:0});
  let step=0, draft=blank();
  const stored=read('g3-brief-v1');
  if(stored&&typeof stored==='object'&&!Array.isArray(stored)){
    draft={type:projectTypes.includes(stored.type)?stored.type:'',location:clean(stored.location,100),area:/^[1-9]\d{0,6}$/.test(stored.area)&&Number(stored.area)<=1000000?String(stored.area):'',timeline:timelines.includes(stored.timeline)?stored.timeline:'Just exploring',priorities:Array.isArray(stored.priorities)?[...new Set(stored.priorities.filter(p=>priorityOptions.includes(p)))].slice(0,3):[],notes:clean(stored.notes,500),step:[0,1,2].includes(stored.step)?stored.step:0};
    if(!draft.type||!draft.location.trim())draft.step=0;
    else if(draft.step===2&&!draft.priorities.length)draft.step=1;
  }
  function fillForm(){
    for(const name of ['type','location','area','timeline','notes'])field(name).value=draft[name];
    $$('input[name="priority"]',form).forEach(input=>input.checked=draft.priorities.includes(input.value));
    $('#notes-count').textContent=`${draft.notes.length} / 500`;
  }
  function capture(){
    draft={type:field('type').value,location:field('location').value.slice(0,100),area:field('area').value,timeline:field('timeline').value,priorities:$$('input[name="priority"]:checked',form).map(input=>input.value),notes:field('notes').value.slice(0,500),step};
    write('g3-brief-v1',draft);
  }
  function renderInspiration(){
    const box=$('#brief-inspiration');box.replaceChildren();
    if(saved.size){box.append(textNode('strong','From your saved inspiration: '),document.createTextNode([...saved].map(id=>byId.get(id).name).join(' · ')));}
    else box.append(document.createTextNode('Tip: bookmark a project from the collection to include it as inspiration.'));
  }
  function renderReview(){
    const box=$('#brief-review');box.replaceChildren();
    const rows=[['The space',draft.type],['The place',draft.location.trim()],['Approximate area',draft.area?`${Number(draft.area).toLocaleString()} m²`:'To be explored'],['The timeframe',draft.timeline],['What matters most',draft.priorities.join(' · '),true],['Concept inspiration',saved.size?[...saved].map(id=>byId.get(id).name).join(' · '):'An open starting point',true]];
    if(draft.notes.trim())rows.push(['A few more thoughts',draft.notes.trim(),true]);
    rows.forEach(([label,value,wide])=>{const row=document.createElement('dl');row.className=`review-item${wide?' wide':''}`;row.append(textNode('dt',label),textNode('dd',value));box.append(row);});
  }
  function showStep(next,focus=false){
    step=next;draft.step=step;
    $$('.brief-step').forEach(section=>section.hidden=Number(section.dataset.step)!==step);
    $$('.brief-progress li').forEach((li,index)=>{li.classList.toggle('is-current',index===step);li.classList.toggle('is-done',index<step);if(index===step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
    $('#brief-back').hidden=step===0;$('#brief-reset').hidden=step===2;
    $('#brief-next').hidden=step===2;$('#brief-download').hidden=step!==2;
    $('#brief-next').innerHTML=`${step===0?'The feeling':'Review your brief'} ${icon('right')}`;
    $('#brief-error').textContent='';
    if(step===2)renderReview();
    renderInspiration();
    if(focus){
      const dialog=$('#brief-dialog');dialog.scrollTop=0;
      const section=$(`.brief-step[data-step="${step}"]`);
      const target=step===0?field('type'):step===1?$('input[name="priority"]',form):$('#step-three-title');
      if(step===2)target.setAttribute('tabindex','-1');
      target.focus({preventScroll:true});
    }
  }
  function openBrief(trigger,project){
    if(project){
      saved.add(project.id);write('g3-saved-v1',[...saved]);syncSaved();
      if(!draft.type){draft.type=project.type;field('type').value=project.type;}
    }
    showStep(draft.step);capture();openDialog($('#brief-dialog'),trigger);
  }
  $$('[data-open-brief]').forEach(button=>button.addEventListener('click',()=>openBrief(button)));
  $('#shortlist-brief').addEventListener('click',event=>openBrief(event.currentTarget));
  $('#project-use').addEventListener('click',event=>openBrief(event.currentTarget,byId.get(currentProject)));
  form.addEventListener('input',event=>{
    if(event.target.name==='priority'){
      const selected=$$('input[name="priority"]:checked',form);
      if(selected.length>3){event.target.checked=false;$('#brief-error').textContent='Choose up to three priorities. Deselect one to try another.';return;}
    }
    if(event.target.name==='location')event.target.setCustomValidity('');
    event.target.removeAttribute('aria-invalid');
    $('#brief-error').textContent='';
    $('#notes-count').textContent=`${field('notes').value.length} / 500`;capture();
  });
  function validateSpace(){
    field('location').setCustomValidity(field('location').value.trim()?'':'Please enter a city or region.');
    for(const name of ['type','location','area']){
      const input=field(name);
      if(!input.checkValidity()){
        $('#brief-error').textContent=name==='type'?'Choose a project type to begin.':name==='location'?'Enter a city or region for your idea.':'Use a whole number between 1 and 1,000,000 m², or leave the area blank.';
        input.setAttribute('aria-invalid','true');input.focus();return false;
      }
    }
    return true;
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();capture();
    if(step===0&&!validateSpace())return;
    if(step===1&&!draft.priorities.length){$('#brief-error').textContent='Choose at least one priority for your space.';$('input[name="priority"]',form).focus();return;}
    if(step<2){showStep(step+1,true);capture();}
  });
  $('#brief-back').addEventListener('click',()=>{capture();showStep(Math.max(0,step-1),true);capture();});
  $('#brief-reset').addEventListener('click',()=>{
    draft=blank();form.reset();fillForm();
    $$('[aria-invalid]',form).forEach(input=>input.removeAttribute('aria-invalid'));field('location').setCustomValidity('');
    showStep(0,true);capture();toast('Draft cleared. Your saved inspiration is still here.');
  });
  $('#brief-download').addEventListener('click',()=>{
    capture();
    if(!draft.type||!draft.location.trim()||!draft.priorities.length){showStep(0,true);return;}
    const output=[
      'G3 ARCHITECTS | YOUR PROJECT BRIEF','==================================','',
      `Created: ${new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}`,'',
      `THE SPACE\n${draft.type}`,`THE PLACE\n${draft.location.trim()}`,`APPROXIMATE AREA\n${draft.area?`${draft.area} m²`:'To be explored'}`,`TIMEFRAME\n${draft.timeline}`,`WHAT MATTERS MOST\n${draft.priorities.map(item=>'- '+item).join('\n')}`,`CONCEPT INSPIRATION\n${saved.size?[...saved].map(id=>'- '+byId.get(id).name).join('\n'):'An open starting point'}`,
      draft.notes.trim()?`A FEW MORE THOUGHTS\n${draft.notes.trim()}`:'',
      'NEXT CONVERSATION\nUse this brief to discuss your needs with a designer. Explore the site, context, requirements and feasibility together.',
      'ABOUT THIS BRIEF\nCreated locally with the G3 Architects concept portfolio. Nothing was submitted or sent. The portfolio projects are fictional design studies with AI-generated imagery. This brief is not a quotation or architectural plan.'
    ].filter(Boolean).join('\r\n\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+output],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='G3-Project-Brief.txt';document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your project brief is ready to keep.');
  });
  fillForm();showStep(draft.step);syncSaved();updateStorageNote();
})();
