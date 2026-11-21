import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Clock, Flame, Hammer, Home, Pause, Play, RotateCcw, Egg, CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/platform/i18n';
import { createLevel, type Direction, type State } from './model';
import type { Controls } from './engine';
export function Game(){
 const {t,slug}=useI18n();const host=useRef<HTMLDivElement>(null);const controls=useRef<Controls>({direction:null,action:null,paused:false});
 const [state,setState]=useState<State>(createLevel);const [version,setVersion]=useState(0);const [paused,setPaused]=useState(false);const [ready,setReady]=useState(false);const [error,setError]=useState(false);const [help,setHelp]=useState(false);
 useEffect(()=>{let disposed=false;let destroy:(()=>void)|undefined;setReady(false);setError(false);setState(createLevel());controls.current={direction:null,action:null,paused:false};setPaused(false);
  import('./engine').then(({mountGame})=>{if(disposed||!host.current)return;destroy=mountGame(host.current,controls.current,s=>{if(!disposed){setState(s);setReady(true);}});}).catch(()=>{if(!disposed)setError(true);});
  return()=>{disposed=true;destroy?.();};
 },[version]);
 useEffect(()=>{
  const keys:Record<string,Direction>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  const down=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement && e.target.closest('button,a,input'))return;const d=keys[e.key];if(d){e.preventDefault();controls.current.direction=d;}if(e.key==='z'||e.key===' '){e.preventDefault();if(!e.repeat)controls.current.action='fire';}if(e.key==='x'&&!e.repeat)controls.current.action='strike';};
  const up=(e:KeyboardEvent)=>{if(keys[e.key]===controls.current.direction)controls.current.direction=null;};
  const blur=()=>{controls.current.direction=null;controls.current.paused=true;setPaused(true);};
  const visibility=()=>{if(document.hidden)blur();};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 const pause=()=>{controls.current.paused=!paused;setPaused(!paused);};
 const action=(kind:'fire'|'strike')=>{controls.current.action=kind;};
 const direction=(d:Direction,Icon:typeof ArrowUp)=><Button variant="secondary" className={`tc-direction tc-${d}`} aria-label={t(`tc.${d}`)} title={t(`tc.${d}`)} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls.current.direction=d;}} onPointerUp={()=>{controls.current.direction=null;}} onPointerCancel={()=>{controls.current.direction=null;}} key={d}><Icon /></Button>;
 const overlay=state.status!=='playing'||paused;
 return <div className="tc-scope tc-game min-h-screen">
  <header className="tc-header"><Button asChild variant="ghost" size="icon"><Link to="/$lang/tabernicle-cubicle" params={{lang:slug}} aria-label={t('tc.back')}><ArrowLeft/></Link></Button><h1>Tabernicle Cubicle</h1><Button variant="ghost" size="icon" aria-label={t('tc.help')} title={t('tc.help')} onClick={()=>{setHelp(!help);controls.current.paused=!help;setPaused(!help);}}><CircleHelp/></Button></header>
  <main className="tc-main">
   <div className="tc-level-row"><div><span>{t('tc.prototype')}</span><h2>{t('tc.level')}</h2></div><div className="tc-counter"><Egg size={20}/><span>{2-state.eggs.length}/2</span></div></div>
   <div className="tc-stage"><div ref={host} className="tc-canvas" role="img" aria-label={`${t('tc.level')} · ${t('tc.eggs')}: ${2-state.eggs.length}/2`} data-status={state.status} data-bridges={state.bridges}/>
   {!ready&&!error&&<div className="tc-overlay">{t('tc.loading')}</div>}
   {error&&<div className="tc-overlay"><p>{t('tc.error')}</p><Button onClick={()=>setVersion(v=>v+1)}>{t('tc.restart')}</Button></div>}
   {overlay&&ready&&<div className="tc-overlay"><h2>{t(state.status==='won'?'tc.won':state.status==='lost'?'tc.lost':'tc.paused')}</h2>{help&&<p>{t('tc.rules')}</p>}<Button className="tc-action" onClick={()=>{if(state.status==='playing'){setHelp(false);pause();}else setVersion(v=>v+1);}}>{state.status==='playing'?<Play/>:<RotateCcw/>}{t(state.status==='playing'?'tc.resume':'tc.again')}</Button></div>}
   </div>
   <div className="tc-controls"><div className="tc-dpad">{direction('up',ArrowUp)}{direction('left',ArrowLeft)}{direction('down',ArrowDown)}{direction('right',ArrowRight)}</div><div className="tc-actions"><Button className="tc-fire" disabled={overlay||!ready} onClick={()=>action('fire')} aria-label={t('tc.fire')} title={t('tc.fire')}><Flame/><span>{t('tc.fire')}</span></Button><Button className="tc-club" disabled={overlay||!ready} onClick={()=>action('strike')} aria-label={t('tc.strike')} title={t('tc.strike')}><Hammer/><span>{t('tc.strike')}</span></Button></div></div>
  </main>
  <nav className="tc-bottom"><Button asChild variant="ghost" size="icon"><Link to="/$lang" params={{lang:slug}} aria-label={t('tc.back')} title={t('tc.back')}><Home/></Link></Button><span className="tc-time"><Clock size={16}/>{Math.floor(state.elapsed/60).toString().padStart(2,'0')}:{Math.floor(state.elapsed%60).toString().padStart(2,'0')}</span><Button variant="ghost" size="icon" onClick={pause} disabled={!ready||state.status!=='playing'} aria-label={t(paused?'tc.resume':'tc.pause')} title={t(paused?'tc.resume':'tc.pause')}>{paused?<Play/>:<Pause/>}</Button><Button variant="ghost" size="icon" onClick={()=>setVersion(v=>v+1)} aria-label={t('tc.restart')} title={t('tc.restart')}><RotateCcw/></Button></nav>
 </div>;
}
