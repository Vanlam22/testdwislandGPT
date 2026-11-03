import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, CircleHelp, Compass, ExternalLink, Flag, Heart, Home, Mail, Map, Maximize, Minus, Plus, RotateCcw, ShieldCheck, Sparkles, Trophy, UserRound, Users, Volume2, VolumeX, Wrench, X, Clock3, Files, Gift } from 'lucide-react';
import World from './World';
import { defaultProfile, hairColors, islands, outfitColors, readSaved, skinColors } from './data';

const icons = {work:BookOpen,safety:ShieldCheck,benefits:Gift,attendance:Clock3,repair:Wrench,hr:Users,forms:Files,email:Mail};
function Avatar({profile,large=false}) {
  return <svg className={'avatar-art '+(large?'large':'')} viewBox="0 0 120 130" role="img" aria-label={profile.name+'的角色'}>
    <ellipse cx="60" cy="120" rx="25" ry="5" fill="#64504b" opacity=".12"/>
    {profile.hairstyle==='long'&&<path d="M34 45Q30 15 60 15Q91 15 87 48L89 78H32Z" fill={profile.hair}/>}
    <path d="M45 88v26h12V89m7 0v25h12V88" stroke="#5e5b65" strokeWidth="10" strokeLinejoin="round"/>
    <path d="M41 115h17v7H39q-3-5 2-7m22 0h17q5 3 2 7H63" fill="#fff7e8"/>
    <path d="M43 65q17-8 34 0l6 28H37Z" fill={profile.outfit}/>
    <path d="m42 68-9 21m45-21 9 21" stroke={profile.outfit} strokeWidth="11" strokeLinecap="round"/>
    <circle cx="32" cy="93" r="6" fill={profile.skin}/><circle cx="88" cy="93" r="6" fill={profile.skin}/>
    <rect x="53" y="53" width="14" height="15" rx="6" fill={profile.skin}/>
    <ellipse cx="60" cy="40" rx="23" ry="25" fill={profile.skin}/>
    <path d="M36 40q-8-30 24-30q31 0 25 32l-6-15q-16 8-32 0l-8 15Z" fill={profile.hair}/>
    {profile.hairstyle==='bun'&&<circle cx="62" cy="12" r="11" fill={profile.hair}/>}
    <circle cx="51" cy="43" r="2" fill="#46362e"/><circle cx="69" cy="43" r="2" fill="#46362e"/>
    <path d="M55 52q5 4 10 0" fill="none" stroke="#a36c5b" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="44" cy="49" r="3.5" fill="#d89686" opacity=".4"/><circle cx="76" cy="49" r="3.5" fill="#d89686" opacity=".4"/>
    <path d="M53 67l7 8 7-8" fill="#f6e8d2"/><circle cx="69" cy="79" r="2" fill="#e8c77d"/>
  </svg>;
}
function Modal({children,onClose,label,className=''}) {
  const ref=useRef(null);
  useEffect(()=>{
    const previous=document.activeElement;
    const dialog=ref.current;
    const focusable=()=>[...dialog.querySelectorAll('button,a[href],input,select,[tabindex="0"]')].filter(e=>!e.disabled&&e.offsetParent!==null);
    focusable()[0]?.focus();
    const key=e=>{
      if(e.key==='Escape'){e.preventDefault();onClose();}
      if(e.key==='Tab'){
        const els=focusable(),first=els[0],last=els.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('keydown',key);previous?.focus();};
  },[onClose]);
  return <div className={'modal-backdrop '+className} onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section ref={ref} className="modal" role="dialog" aria-modal="true" aria-label={label}>
      <button className="icon-button close-button" onClick={onClose} aria-label="關閉"><X size={20}/></button>
      {children}
    </section>
  </div>;
}
function ProfileEditor({profile,onSave,onClose}) {
  const [draft,setDraft]=useState({...profile}),[error,setError]=useState('');
  const colors=(title,key,values)=><fieldset className="color-field"><legend>{title}</legend><div className="swatches">{values.map((c,n)=><button type="button" key={c} className={'swatch '+(draft[key]===c?'selected':'')} style={{background:c}} aria-label={title+' '+(n+1)} aria-pressed={draft[key]===c} onClick={()=>setDraft({...draft,[key]:c})}>{draft[key]===c&&<Check size={17}/>}</button>)}</div></fieldset>;
  return <Modal onClose={onClose} label="建立我的角色" className="profile-backdrop">
    <div className="modal-eyebrow"><Sparkles size={15}/> MAKE IT YOURS</div>
    <h2>每一位夥伴，都獨一無二。</h2><p className="modal-subtitle">用喜歡的模樣，開啟你的典華旅程。</p>
    <form onSubmit={e=>{e.preventDefault();if(!draft.name.trim()){setError('請為你的角色取一個名字');return;}onSave({...draft,name:draft.name.trim()});}}>
      <div className="profile-editor">
        <div className="avatar-preview"><span className="preview-sparkle">✧</span><Avatar profile={draft} large/><div className="preview-plinth"/><span className="preview-name">{draft.name||'你的名字'}</span><span className="preview-caption">準備好，一起出發</span></div>
        <div className="profile-options">
          <label className="name-label" htmlFor="explorer-name">怎麼稱呼你？<span>最多 16 個字</span></label>
          <input id="explorer-name" maxLength={16} value={draft.name} onChange={e=>{setDraft({...draft,name:e.target.value});setError('');}} placeholder="輸入你的名字" autoComplete="nickname" aria-invalid={!!error} aria-describedby={error?'name-error':undefined}/>
          {error&&<p id="name-error" className="field-error">{error}</p>}
          {colors('膚色','skin',skinColors)}
          <fieldset><legend>髮型</legend><div className="segmented">{[['short','俐落短髮'],['long','柔順長髮'],['bun','可愛丸子']].map(([id,label])=><button type="button" key={id} className={draft.hairstyle===id?'selected':''} aria-pressed={draft.hairstyle===id} onClick={()=>setDraft({...draft,hairstyle:id})}>{label}</button>)}</div></fieldset>
          {colors('髮色','hair',hairColors)}{colors('穿搭顏色','outfit',outfitColors)}
        </div>
      </div>
      <div className="modal-footer"><span><Heart size={14}/> 幸福，從做自己開始。</span><button className="primary-button" type="submit">儲存角色，出發 <ArrowRight size={17}/></button></div>
    </form>
  </Modal>;
}
function TopicPanel({island,completed,onComplete,onClose,onNext}) {
  const [read,setRead]=useState(false);
  const Icon=icons[island.id];
  return <Modal onClose={onClose} label={island.name+'：'+island.topic} className="topic-backdrop">
    <div className="topic-art" style={{'--topic-color':island.color}}>
      <span className="topic-art-ring"/><Icon size={68} strokeWidth={1.15}/><span className="topic-art-star">✧</span>
      <span className="topic-tag">ISLAND {island.number} / 08</span>
    </div>
    <div className="topic-content">
      <div className="modal-eyebrow">{island.tag}{completed&&<span className="complete-tag"><Check size={12}/> 已探索</span>}</div>
      <h2>{island.name}<span>{island.topic}</span></h2>
      <p className="topic-subtitle">{island.subtitle}</p><p className="topic-description">{island.description}</p>
      <div className="discovery-heading"><Compass size={16}/><h3>這一站，探索什麼？</h3></div>
      <ol className="explore-prompts">{island.prompts.map((p,n)=><li key={p}><span>0{n+1}</span>{p}</li>)}</ol>
      <a className="source-link" href={island.sourceUrl} target="_blank" rel="noopener noreferrer"><span><BookOpen size={19}/><span>前往同仁網站閱讀<small>進入「{island.topic}」主題查看正式內容</small></span></span><ExternalLink size={17}/></a>
      <p className="source-note">此處為探索導引；實際規範以同仁網站最新公告為準。部分內容可能需要登入典華帳號。</p>
      {!completed?<><label className="read-confirmation"><input type="checkbox" checked={read} onChange={e=>setRead(e.target.checked)}/><span>我已前往閱讀，並了解這個主題</span></label><button disabled={!read} className="primary-button full-width" onClick={()=>onComplete(island.id)}><Flag size={17}/> 完成這一站的探索 <Check size={17}/></button></>:
      <div className="completed-actions"><span><Check size={16}/> 這份幸福，已經收藏</span><button className="primary-button full-width" onClick={onNext}>前往下一座島嶼 <ArrowRight size={17}/></button></div>}
    </div>
  </Modal>;
}
function Journey({completed,onSelect,onClose,profile}) {
  return <Modal label="我的探索旅程" onClose={onClose} className="journey-backdrop">
    <div className="modal-eyebrow"><Compass size={15}/> YOUR JOURNEY</div><h2>每一小步，都是新的認識。</h2>
    <p className="modal-subtitle">{profile.name}，你已探索 {completed.length} 座島嶼。{completed.length===8?'恭喜完成這趟典華旅程！':'下一份幸福，等你發現。'}</p>
    <div className="journey-summary"><div className="journey-circle" style={{'--progress':completed.length*45+'deg'}}><span>{completed.length}<small> / 8</small></span></div><div><strong>{completed.length===8?'典華幸福探索家':'幸福旅程進行中'}</strong><p>{completed.length===8?'八份認識，讓我們更靠近彼此。':'不必趕路，用自己的步調探索。'}</p></div><Trophy size={36} strokeWidth={1.2}/></div>
    <div className="journey-list">{islands.map(i=>{const Icon=icons[i.id];return <button key={i.id} onClick={()=>onSelect(i.id)}><span className="journey-icon" style={{color:i.color,background:i.color+'15'}}><Icon size={21}/></span><span><strong>{i.name}</strong><small>{i.topic}</small></span><span className={'journey-status '+(completed.includes(i.id)?'done':'')}>{completed.includes(i.id)?<><Check size={13}/> 已探索</>:'待探索'}</span><ChevronRight size={16}/></button>;})}</div>
    <p className="local-note">角色與進度儲存在這個瀏覽器，不會送出個人資料或同步至其他裝置。</p>
  </Modal>;
}
function Help({onClose}) {
  return <Modal label="探索小指南" onClose={onClose} className="help-backdrop">
    <div className="modal-eyebrow"><Compass size={15}/> A LITTLE GUIDE</div><h2>讓好奇心，帶你出發。</h2><p className="modal-subtitle">這裡沒有固定路線，每一座島都有新的發現。</p>
    <div className="help-steps">
      <div><span>01</span><div><h3>以你的模樣登島</h3><p>點選「我的角色」，選擇名字、髮型與穿搭。</p></div><UserRound size={26}/></div>
      <div><span>02</span><div><h3>點選島嶼，輕鬆啟程</h3><p>點擊建築或島名，就能前往該島並閱讀導引。也可使用「島嶼目錄」選擇目的地。</p></div><Map size={26}/></div>
      <div><span>03</span><div><h3>讓角色動起來</h3><p>關閉面板後，用 WASD 或方向鍵在島上散步。按 E 再次開啟目前島嶼的內容。</p></div><Compass size={26}/></div>
      <div><span>04</span><div><h3>閱讀、認識、收藏幸福</h3><p>前往同仁網站閱讀正式內容，返回勾選閱讀確認，完成探索並記錄進度。</p></div><Flag size={26}/></div>
    </div><button className="primary-button full-width" onClick={onClose}>準備好了，開始探索 <ArrowRight size={17}/></button>
  </Modal>;
}
export default function App(){
  const [initial]=useState(readSaved);
  const [profile,setProfile]=useState(initial.profile),[completed,setCompleted]=useState(initial.completed);
  const [modal,setModal]=useState(null),[destination,setDestination]=useState('home'),[travelKey,setTravelKey]=useState(0);
  const [zoom,setZoom]=useState(1),[ready,setReady]=useState(false),[toast,setToast]=useState(''),[sound,setSound]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const timer=useRef(null),toastTimer=useRef(null),audio=useRef(null),storageWarned=useRef(false);
  const notify=useCallback(text=>{setToast(text);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),3800);},[]);
  const close=useCallback(()=>setModal(null),[]);
  useEffect(()=>{
    try{localStorage.setItem('denwell-island-v1',JSON.stringify({profile,completed}));}
    catch{if(!storageWarned.current){notify('瀏覽器無法保存資料，本次探索仍可繼續。');storageWarned.current=true;}}
  },[profile,completed,notify]);
  useEffect(()=>()=>{clearTimeout(timer.current);clearTimeout(toastTimer.current);audio.current?.close();},[]);
  const select=useCallback(id=>{
    clearTimeout(timer.current);setMenuOpen(false);setModal(null);setDestination(id);setTravelKey(k=>k+1);
    if(id==='home'){notify('歡迎回到典華幸福廣場');return;}
    const i=islands.find(i=>i.id===id);if(!i)return;
    notify('正在前往'+i.name+'…');
    timer.current=setTimeout(()=>{setModal({type:'topic',id});setToast('');},window.matchMedia('(prefers-reduced-motion: reduce)').matches?20:1150);
  },[notify]);
  const open=type=>{clearTimeout(timer.current);setMenuOpen(false);setModal({type});};
  const complete=id=>{
    const updated=[...new Set([...completed,id])];setCompleted(updated);setModal(null);
    if(updated.length===8){notify('恭喜！你已完成八座島嶼的幸福旅程 ✨');setModal({type:'journey'});}
    else notify(islands.find(i=>i.id===id).name+'探索完成！幸福足跡 +1');
  };
  const next=islands.find(i=>!completed.includes(i.id))||islands[0];
  async function toggleSound(){
    if(sound){await audio.current?.suspend();setSound(false);return;}
    try{
      if(!audio.current){
        const context=new (window.AudioContext||window.webkitAudioContext)();audio.current=context;
        const master=context.createGain();master.gain.value=.035;master.connect(context.destination);
        [174.61,220,261.63,349.23].forEach((frequency,n)=>{
          const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.value=.15;
          const lfo=context.createOscillator(),lfoGain=context.createGain();lfo.frequency.value=.08+n*.018;lfoGain.gain.value=.08;lfo.connect(lfoGain);lfoGain.connect(gain.gain);lfo.start();
          oscillator.connect(gain);gain.connect(master);oscillator.start();
        });
      }
      await audio.current.resume();setSound(true);
    }catch{notify('此瀏覽器暫時無法播放環境音');}
  }
  return <div className="app">
    <div className="sky-grain"/><div className="sky-glow"/>
    <header className="site-header">
      <button className="brand" onClick={()=>select('home')} aria-label="典華幸福島首頁"><span className="brand-emblem">D<span>✧</span></span><span className="brand-wordmark">典華<small>DENWELL</small></span><span className="brand-divider"/><span className="brand-descriptor">幸福，從這裡開始</span></button>
      <nav className="desktop-nav" aria-label="主要導覽"><button className={!modal||modal.type==='topic'?'active':''} onClick={()=>{close();setMenuOpen(!menuOpen);}}><Map size={16}/> 探索島嶼</button><button className={modal?.type==='journey'?'active':''} onClick={()=>open('journey')}><Compass size={16}/> 我的旅程 <span className="nav-count">{completed.length}/8</span></button></nav>
      <div className="header-actions"><button className="icon-button sound-button" onClick={toggleSound} aria-label={sound?'關閉環境音':'開啟環境音'} aria-pressed={sound}>{sound?<Volume2 size={18}/>:<VolumeX size={18}/>}</button><button className="icon-button" onClick={()=>open('help')} aria-label="探索小指南"><CircleHelp size={19}/></button><span className="header-separator"/><button className="profile-button" aria-label="我的角色" onClick={()=>open('profile')}><span className="avatar-small"><Avatar profile={profile}/></span><span>我的角色</span><ChevronRight size={14}/></button></div>
    </header>
    <main>
      <section className="hero">
        <div className="eyebrow"><span/> WELCOME TO DENWELL</div>
        <h1>典華<span>幸福島<span className="title-star">✧</span></span></h1>
        <p className="hero-subtitle">一起探索，讓幸福發生。</p>
        <p className="hero-description">每一座島，都是認識典華的新起點。<br/>帶著好奇心出發，<br className="desktop-break"/>找到屬於你的幸福日常。</p>
        <button className="text-button" onClick={()=>open('profile')}><span className="tiny-avatar"><UserRound size={15}/></span> 建立我的專屬角色 <ArrowUpRight size={16}/></button>
        <div className="hero-divider"/><p className="island-count"><span>08</span> 座島嶼 <i/> 一段屬於你的旅程</p>
      </section>
      <World profile={profile} destination={destination} travelKey={travelKey} onSelect={select} completed={completed} zoom={zoom} paused={!!modal||menuOpen} onReady={()=>setReady(true)} onMoving={()=>{}}/>
      {!ready&&<div className="world-loading"><span className="loading-island">✧</span><p>正在為你準備一座幸福島…</p></div>}
      <div className="compass-decoration" aria-hidden="true"><span>N</span><div>✧</div><small>跟著好奇心走</small></div>
      <aside className="journey-card" aria-label="探索進度">
        <div className="journey-card-heading"><span className="journey-card-icon"><Flag size={17}/></span><h2>我的幸福足跡</h2><span><strong>{completed.length.toString().padStart(2,'0')}</strong> / 08</span></div>
        <div className="progress-track" role="progressbar" aria-label="已探索島嶼" aria-valuenow={completed.length} aria-valuemin={0} aria-valuemax={8}><span style={{width:completed.length*12.5+'%'}}/></div>
        <p>{completed.length===8?'所有島嶼已探索，幸福旅程才正要開始。':'不急，慢慢探索，每一步都有新發現。'}</p>
        <button className="journey-start" onClick={()=>completed.length===8?open('journey'):select(next.id)}><span>{completed.length===0?'開始第一站的探索':completed.length===8?'查看我的旅程':'繼續我的探索'}</span><span className="round-arrow"><ArrowRight size={15}/></span></button>
      </aside>
      <div className="map-tools"><button className="map-directory" onClick={()=>{setMenuOpen(!menuOpen);setModal(null);}} aria-expanded={menuOpen}><Map size={17}/><span>島嶼目錄</span></button><div className="zoom-tools"><button onClick={()=>setZoom(z=>Math.min(1.45,+(z+.15).toFixed(2)))} disabled={zoom>=1.45} aria-label="放大地圖"><Plus size={18}/></button><button onClick={()=>setZoom(z=>Math.max(.7,+(z-.15).toFixed(2)))} disabled={zoom<=.7} aria-label="縮小地圖"><Minus size={18}/></button><span/><button onClick={()=>setZoom(1)} aria-label="重設地圖縮放"><Maximize size={16}/></button></div></div>
      {menuOpen&&<aside className="island-directory" aria-label="島嶼目錄"><div><h2>下一站，想去哪裡？</h2><button className="icon-button" onClick={()=>setMenuOpen(false)} aria-label="關閉島嶼目錄"><X size={18}/></button></div>{islands.map(i=><button className="directory-item" key={i.id} onClick={()=>select(i.id)}><span style={{color:i.color}}>{i.number}</span><strong>{i.name}</strong><small>{i.topic}</small>{completed.includes(i.id)?<Check size={14}/>:<ArrowUpRight size={14}/>}</button>)}</aside>}
      <div className="map-instructions"><span className="mouse-icon"/><span>點擊島嶼，自由探索</span><i/><span className="keyboard-keys"><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></span><span>或方向鍵移動角色</span></div>
    </main>
    <footer className="site-footer"><span>DENWELL HAPPINESS ISLAND</span><span>用心款待彼此，讓幸福成為日常。<Heart size={11}/></span><button onClick={()=>open('help')}>探索小指南 <ArrowUpRight size={12}/></button></footer>
    {toast&&<div className="toast" role="status"><Sparkles size={16}/>{toast}</div>}
    {modal?.type==='profile'&&<ProfileEditor profile={profile} onClose={close} onSave={p=>{setProfile(p);setModal(null);notify('準備好了，'+p.name+'！一起探索幸福吧。');}}/>}
    {modal?.type==='topic'&&<TopicPanel key={modal.id} island={islands.find(i=>i.id===modal.id)} completed={completed.includes(modal.id)} onClose={close} onComplete={complete} onNext={()=>select(next.id)}/>}
    {modal?.type==='journey'&&<Journey profile={profile} completed={completed} onSelect={select} onClose={close}/>}
    {modal?.type==='help'&&<Help onClose={close}/>}
  </div>;
}
