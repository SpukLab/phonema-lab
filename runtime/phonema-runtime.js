(()=>{
  const VERSION='RH01';
  const state={mode:localStorage.getItem('phonema-mode')||'FULL',fps:60,frameMs:16.7,drawCalls:0,frame:0,label:'',commit:'',errors:[],slowFrames:0,last:performance.now(),samples:[]};
  let hud,btn,ctx,canvas;
  function ensureUI(){
    if(hud)return;
    hud=document.createElement('div');
    hud.id='phonema-runtime-hud';
    hud.style.cssText='position:fixed;z-index:99999;left:8px;bottom:8px;max-width:82vw;padding:7px 9px;border:1px solid #ffffff18;border-radius:8px;background:#000c;color:#8a8f99;font:8px ui-monospace,monospace;letter-spacing:.06em;white-space:pre-wrap;pointer-events:none;opacity:.42';
    btn=document.createElement('button');
    btn.id='phonema-runtime-mode';
    btn.style.cssText='position:fixed;z-index:100000;right:8px;bottom:8px;border:1px solid #ffffff22;border-radius:99px;background:#000d;color:#8a8f99;padding:7px 9px;font:8px ui-monospace,monospace;letter-spacing:.08em';
    btn.onclick=()=>{state.mode=state.mode==='FULL'?'SAFE':'FULL';localStorage.setItem('phonema-mode',state.mode);btn.textContent=state.mode;updateHUD(true)};
    document.body.append(hud,btn);btn.textContent=state.mode;
  }
  function updateHUD(force=false){
    if(!hud)return;
    const err=state.errors.at(-1);
    hud.style.opacity=err?'1':force?'.75':'.42';
    hud.style.color=err?'#ff5b8a':'#8a8f99';
    hud.textContent=`PHONEMA ${VERSION} · ${state.mode}\n${state.label}${state.commit?' · '+state.commit:''}\n${Math.round(state.fps)} fps · ${state.frameMs.toFixed(1)} ms · ${state.drawCalls} draws\n${canvas?canvas.width+'×'+canvas.height:''}${err?'\nERROR · '+err:''}`;
  }
  function recordError(e){
    const msg=(e&&e.message)||String(e||'unknown error');
    state.errors.push(msg);if(state.errors.length>5)state.errors.shift();
    ensureUI();updateHUD(true);
  }
  window.addEventListener('error',e=>recordError(e.error||e.message));
  window.addEventListener('unhandledrejection',e=>recordError(e.reason));
  function patchDrawCalls(context){
    ['fillRect','strokeRect','fillText','strokeText','drawImage','fill','stroke'].forEach(name=>{
      const orig=context[name];if(typeof orig!=='function'||orig.__phonemaPatched)return;
      const wrapped=function(...args){state.drawCalls++;return orig.apply(this,args)};wrapped.__phonemaPatched=true;context[name]=wrapped;
    });
  }
  function init(context,can,opt={}){
    ctx=context;canvas=can;state.label=opt.label||'';state.commit=opt.commit||'';ensureUI();patchDrawCalls(context);updateHUD(true);return api;
  }
  function beginFrame(now){state.drawCalls=0;state.frame++;state._start=now||performance.now()}
  function endFrame(now){
    const n=now||performance.now(),ms=Math.max(.1,n-state._start);state.frameMs=state.frameMs*.9+ms*.1;state.samples.push(ms);if(state.samples.length>30)state.samples.shift();
    const avg=state.samples.reduce((a,b)=>a+b,0)/state.samples.length;state.fps=1000/Math.max(1,avg);
    if(avg>28)state.slowFrames++;else state.slowFrames=Math.max(0,state.slowFrames-2);
    if(state.mode==='FULL'&&state.slowFrames>120){state.mode='SAFE';localStorage.setItem('phonema-mode','SAFE');if(btn)btn.textContent='SAFE'}
    if(state.frame%20===0||state.errors.length)updateHUD();
  }
  function guard(fn){return function(...args){try{return fn(...args)}catch(e){recordError(e);return undefined}}}
  function raf(fn){const wrapped=(now)=>{beginFrame(now);try{fn(now)}catch(e){recordError(e);return}finally{endFrame(performance.now())}requestAnimationFrame(wrapped)};requestAnimationFrame(wrapped);return wrapped}
  function dpr(fullCap=2,safeCap=1.25){return Math.min(devicePixelRatio||1,state.mode==='SAFE'?safeCap:fullCap)}
  function factor(){return state.mode==='SAFE'?.62:1}
  function count(full,safe){return state.mode==='SAFE'?(safe??Math.ceil(full*.6)):full}
  function blur(v){return Math.min(v,state.mode==='SAFE'?14:34)}
  function maxFont(v){const m=Math.max(innerWidth,innerHeight)*(state.mode==='SAFE'?1.45:2.2);return Math.min(v,m)}
  const api={VERSION,state,init,beginFrame,endFrame,guard,raf,dpr,factor,count,blur,maxFont,recordError,updateHUD};
  window.PhonemaRuntime=api;
})();