(() => {
'use strict';
const $=selector=>document.querySelector(selector);
const catalog=window.SHOP_CATALOG || {items:[],sections:[]};
const items=catalog.items;
const state={selected:null,username:'',controller:null};
const dialog=$('#item-dialog');
function sizeDialogViewport(){dialog.style.setProperty('--dialog-viewport-height',`${window.visualViewport?.height||window.innerHeight}px`);}
sizeDialogViewport();window.visualViewport?.addEventListener('resize',sizeDialogViewport);window.addEventListener('resize',sizeDialogViewport);
function element(tag,className,content){const el=document.createElement(tag);if(className)el.className=className;if(content!==undefined)el.textContent=content;return el;}
function safeUrl(value){if(typeof value!=='string'||!/^https?:\/\//i.test(value))return null;try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
const best=(catalog.bestSellerIds||[]).map(id=>items.find(item=>item.id===id)).filter(Boolean);
const order=['pirate-shop','obsession','hazbin-hotel','locker-of-horrors','the-purge','yeat','99-nights-in-the-forest','five-nights-at-freddy-s','hollow-knight','live-action-street-fighter','community-picks','black-clover','a-nightmare-on-elm-street','halloween-horror-nights','max-vibes','scream','marvel','showcase','esdeekid','no-sweat'];
const sorted=[...catalog.sections].sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):99)-(order.includes(b.id)?order.indexOf(b.id):99));
const collectionSections=sorted.map(s=>({...s,items:items.filter(i=>i.section===s.id).sort((a,b)=>Number(b.type==='Bundle')-Number(a.type==='Bundle'))}));
const firstSections=['pirate-shop','obsession','hazbin-hotel','locker-of-horrors','the-purge'];
const sections=[...collectionSections.filter(s=>firstSections.includes(s.id)),{id:'best-sellers',name:"Today's Best Sellers",items:best,carousel:true},...collectionSections.filter(s=>!firstSections.includes(s.id))];
function card(item,wide=false){
 const button=element('button','item-card'+(wide?' wide':''));button.type='button';button.dataset.itemId=item.id;button.setAttribute('aria-label',`Select ${item.name}`);
 const colors=item.backgroundColors||{};
 button.style.setProperty('--card-top',colors.color1||item.color||'#4276b9');
 button.style.setProperty('--card-bottom',colors.color3||colors.color2||item.color||'#193976');
 button.style.setProperty('--card-text-background',colors.textBackgroundColor||'#050514');
 button.dataset.backgroundMaterial=item.backgroundMaterial||'';
 if(item.backgroundImage)button.style.setProperty('--card-background-image',`url("${new URL(item.backgroundImage,document.baseURI).href}")`);
 const img=element('img');img.src=item.image;img.alt=item.name;img.loading='lazy';img.decoding='async';button.append(img);
 if(item.rarity)button.append(element('span','card-label',item.rarity.toUpperCase()));
 else if(item.id==='custom-nurse-lenore')button.append(element('span','card-label','OUTFIT'));
 else if(item.section==='community-picks')button.append(element('span','card-label','COMMUNITY PICK'));
 else if(item.regularPrice>item.price)button.append(element('span','card-label',`${(item.regularPrice-item.price).toLocaleString()} V-BUCKS OFF`));
 const detail=element('div','card-details');detail.append(element('span','card-name',item.name));const price=element('span','card-price');
 price.append(element('span','vcoin','V'),document.createTextNode('0'));
 const referencePrice=Number.isFinite(item.regularPrice)&&item.regularPrice>0?item.regularPrice:item.price;
 if(Number.isFinite(referencePrice)&&referencePrice>0)price.append(element('del','',referencePrice.toLocaleString()));
 price.title='Free item selection; crossed-out amount is the catalog reference price.';
 detail.append(price,element('span','card-plus','+'));button.append(detail);button.addEventListener('click',()=>openItem(item));return button;
}
function render(query=''){
 const root=$('#shop-sections');root.replaceChildren();$('#section-nav').replaceChildren();let matches=0;
 for(const section of sections){
  const list=section.items.filter(i=>`${i.name} ${i.type} ${i.sectionName}`.toLowerCase().includes(query));if(!list.length)continue;matches+=list.length;
  const nav=element('a','',section.name);nav.href='#'+section.id;$('#section-nav').append(nav);
  const wrap=element('section','shop-section');wrap.id=section.id;const heading=element('div','section-heading');heading.append(element('h2','',section.name));
  const grid=element('div',section.carousel?'carousel':'section-grid');
  list.forEach((item,index)=>grid.append(card(item,!section.carousel&&((index===0&&item.type==='Bundle'&&list.length>3)||item.id==='custom-pirate-shop-token'))));
  if(section.carousel){const controls=element('div','section-controls');for(const [label,dir] of [['Previous items',-1],['Next items',1]]){const b=element('button','',dir===1?'›':'‹');b.setAttribute('aria-label',label);b.addEventListener('click',()=>grid.scrollBy({left:dir*grid.clientWidth,behavior:'smooth'}));controls.append(b);}heading.append(controls);}
  wrap.append(heading,grid);
  root.append(wrap);
 }
 $('#empty-state').hidden=matches>0;$('#search-status').textContent=query?`Results for “${query}”`:'';
 observer?.disconnect();document.querySelectorAll('.shop-section').forEach(s=>observer.observe(s));
}
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('#section-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}}},{rootMargin:'-15% 0px -65% 0px'});
$('#search').addEventListener('input',e=>render(e.target.value.trim().toLowerCase()));
$('#clear-search').addEventListener('click',()=>{$('#search').value='';render();});
$('#open-search').addEventListener('click',()=>{$('#shop').scrollIntoView();$('#search').focus({preventScroll:true});});
$('#toggle-collections').addEventListener('click',()=>{const nav=$('#section-nav');const hidden=nav.hidden=!nav.hidden;$('#toggle-collections').setAttribute('aria-expanded',String(!hidden));});
  function showUsername() {
    state.controller?.abort();$('#username-step').hidden=false;$('#offers-step').hidden=true;$('#step-one').classList.add('current');$('#step-two').classList.remove('current');dialog.setAttribute('aria-labelledby','modal-title');
    $('#username-input').value=state.username;$('#username-error').textContent='';$('#username-input').removeAttribute('aria-invalid');
  }
  function openItem(item) {
    state.selected=item;$('#modal-image').src=item.usernameImage||item.image;$('#modal-image').alt=item.name;$('#modal-item-name').textContent=item.name;$('#modal-type').textContent=[item.rarity,item.type].filter(Boolean).join(' ').toUpperCase();showUsername();dialog.showModal();
    requestAnimationFrame(()=>{if(!window.matchMedia('(max-width:600px)').matches)$('#username-input').focus({preventScroll:true});else $('#modal-title').focus({preventScroll:true});});
  }
  dialog.addEventListener('close',()=>state.controller?.abort());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  $('#username-form').addEventListener('submit',event=>{
    event.preventDefault();const username=$('#username-input').value.trim();
    if(username.length<3 || username.length>32 || /[<>\x00-\x1f]/.test(username)) {$('#username-error').textContent='Enter a display name with 3–32 characters.';$('#username-input').setAttribute('aria-invalid','true');$('#username-input').focus();return;}
    state.username=username;$('#username-step').hidden=true;$('#offers-step').hidden=false;$('#step-one').classList.remove('current');$('#step-two').classList.add('current');$('#offers-greeting').textContent=`YOUR SELECTION, ${username.toUpperCase()}`;$('#offers-item').textContent=state.selected.name;$('#offers-username').textContent=username;dialog.setAttribute('aria-labelledby','offers-title');loadOffers();
  });
  $('#back-to-username').addEventListener('click',()=>{showUsername();$('#username-input').focus();});
  function offerMessage(message,retry=false) {const box=element('div','offer-message',message);if(retry){const button=element('button','secondary','Try again ↻');button.addEventListener('click',loadOffers);box.append(button);}$('#offers-list').replaceChildren(box);}
  let offerPool=[],offerOffset=0;
  $('#change-offers').addEventListener('click',()=>{offerOffset=(offerOffset+2)%offerPool.length;renderOffers();});
  async function loadOffers() {
    $('#change-offers').hidden=true;$('#change-offers-status').hidden=true;offerPool=[];offerOffset=0;
    state.controller?.abort();const controller=new AbortController();state.controller=controller;
    const loading=element('div','offer-message');loading.append(element('span','loading-dot'),document.createTextNode('Finding available partner offers…'));$('#offers-list').replaceChildren(loading);
    const api=window.FORTNITE_CONFIG?.apiConfig;
    if(!api?.enabled || !safeUrl(api.offersApiUrl)) {offerMessage('Partner offers are currently unavailable. Please check back later.',true);return;}
    const timer=setTimeout(()=>controller.abort('timeout'),12000);
    try {
      const response=await fetch(api.offersApiUrl,{signal:controller.signal,credentials:'omit'});if(!response.ok)throw new Error('Feed unavailable');
      const data=await response.json();const list=Array.isArray(data)?data:(data.value||data.offers||[]);if(!Array.isArray(list))throw new Error('Invalid response');
      const seen=new Set();offerPool=list.filter(offer=>{const url=safeUrl(offer.url||offer.link||'');if(!url||seen.has(url))return false;seen.add(url);return true;});
      const available=offerPool;
      if(!available.length){offerMessage('No partner offers are available for your location right now. Please try again later.',true);return;}
      renderOffers();
    }catch(error){if(controller.signal.aborted && controller.signal.reason!=='timeout')return;offerMessage('We couldn’t load partner offers. Check your connection and try again.',true);}finally{clearTimeout(timer);}
  }
  function renderOffers(){
    const available=offerPool.slice(offerOffset,offerOffset+2);
    if(available.length<2&&offerPool.length>1)available.push(offerPool[0]);
      $('#offers-list').replaceChildren();
      for(const offer of available){const link=element('a','offer');link.href=safeUrl(offer.url||offer.link);link.target='_blank';link.rel='noopener noreferrer sponsored';const imageUrl=safeUrl(offer.network_icon||'');if(imageUrl){const img=element('img');img.src=imageUrl;img.alt='';img.addEventListener('error',()=>img.remove(),{once:true});link.append(img);}const content=element('div');content.append(element('h3','',offer.name||offer.title||offer.anchor||'Partner offer'),element('p','',offer.conversion||offer.description||'Read this provider’s requirements and reward.'));link.append(content,element('span','','↗'));$('#offers-list').append(link);}
    $('#change-offers').hidden=false;$('#change-offers').disabled=offerPool.length<=2;
    const status=$('#change-offers-status');status.hidden=offerPool.length>2;
    status.textContent='These are all the offers currently available.';
  }
  const browserDialog=$('#browser-dialog');
  browserDialog.addEventListener('cancel',event=>event.preventDefault());
  function browserIntent(){if(!/^https?:$/.test(location.protocol))return null;const destination=new URL(location.href);destination.searchParams.delete('showPopup');destination.hash='';return `intent://${destination.href.replace(/^https?:\/\//,'')}#Intent;scheme=${destination.protocol.slice(0,-1)};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(destination.href)};end`;}
  const ua=navigator.userAgent||'';const android=/Android/i.test(ua);
  $('#copy-link').addEventListener('click',async()=>{try{const shareUrl=new URL(location.href);shareUrl.searchParams.delete('showPopup');await navigator.clipboard.writeText(shareUrl.href);$('#copy-status').textContent='Link copied. Paste it into Safari or Chrome.';}catch{$('#copy-status').textContent='Copy the address from the browser’s address bar.';}});
  const inApp=/FBAN|FBAV|Instagram|Line\/|Twitter|Snapchat|TikTok|TTWebView|musical_ly|Bytedance|ByteDance|aweme|Pinterest|Telegram|WhatsApp|Messenger|LinkedIn/i.test(ua);
  const forcePopup=new URLSearchParams(location.search).get('showPopup')==='1';
  if(inApp||forcePopup){browserDialog.showModal();if(android&&inApp&&!forcePopup){const intent=browserIntent();if(intent)location.href=intent;}}
render();
})();
