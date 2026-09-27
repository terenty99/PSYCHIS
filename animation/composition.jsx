import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {SpawnedNode} from '../src/components/nodes/SpawnedNode';
import {WebsiteNode} from '../src/components/nodes/WebsiteNode';
import {ContradictionNode} from '../src/components/nodes/ContradictionNode';
import {MusicNode} from '../src/components/nodes/MusicNode';
import {VideoNode} from '../src/components/nodes/VideoNode';
import {ConvexHull} from '../src/components/ui/ConvexHull';
import {PsychisLogo} from '../src/components/ui/PsychisLogo';
import {DynamicAtmosphericBackground} from '../src/components/ui/DynamicAtmosphericBackground';
import {nodes,groups} from './catalog';
import '../src/styles/globals.css';
import 'katex/dist/katex.min.css';
import './style.css';
const S=.20,components={spawned:SpawnedNode,website:WebsiteNode,contradiction:ContradictionNode,music:MusicNode,video:VideoNode};
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const dims={};
nodes.slice(3).sort((a,b)=>Math.hypot(a.x-960,a.y-425)-Math.hypot(b.x-960,b.y-425)).forEach((n,i)=>n.birth=4.3+5.45*Math.pow((i+1)/(nodes.length-3),.66));
nodes.slice(0,3).forEach((n,i)=>n.birth=[.45,2.1,3.5][i]);
const links=[];
nodes.forEach((n,i)=>{if(!i)return;const prior=nodes.filter(p=>p.birth<n.birth).sort((a,b)=>{const score=p=>Math.hypot(p.x-n.x,p.y-n.y)+(p.group===n.group?0:180);return score(a)-score(b)});links.push({a:i<3?nodes[i-1]:prior[0],b:n});});
const clusters=groups.map(([title,color],i)=>({id:`topic-${i}`,title,color,nodeIds:nodes.filter(n=>n.group===i).map(n=>n.id),isCollapsed:false}));
const root=createRoot(document.getElementById('root'));
function worldNode(n){const d=dims[n.id]||{width:360,height:250};return {...n,position:{x:n.x/S-d.width/2,y:n.y/S-d.height/2},width:d.width,height:d.height};}
function Frame({t}){
  const q=ease((t-4.3)/6.5),zoom=1.35*Math.exp(Math.log(S/1.35)*q),cy=465+75*q,tx=960-960/S*zoom,ty=540-cy/S*zoom;
  const alpha=1-ease((t-14.3)/.65),world=nodes.map(worldNode);
  return <><DynamicAtmosphericBackground pan={{x:0,y:0}} zoom={1.05} dimensions={{width:1920,height:1080}}/><div style={{opacity:alpha}}>
    <div id="world" style={{position:'absolute',width:10000,height:6000,transformOrigin:'0 0',transform:`translate(${tx}px,${ty}px) scale(${zoom})`}}>
      {clusters.map(c=>{const members=nodes.filter(n=>c.nodeIds.includes(n.id)),birth=Math.max(4.8,Math.min(...members.map(n=>n.birth))+.4),visible=world.filter(n=>c.nodeIds.includes(n.id)&&t>n.birth);if(visible.length<2)return null;return <div key={c.id} className="cluster-layer" style={{opacity:ease((t-birth)/.6)}}><ConvexHull clusters={[c]} nodes={visible} measuredDims={dims}/></div>;})}
      <svg style={{position:'absolute',width:10000,height:6000,overflow:'visible',zIndex:12}}>{links.map(({a,b},i)=>{const p=ease((t-b.birth+.25)/.45);if(!p)return null;const ad=dims[a.id]||{width:330,height:200},bd=dims[b.id]||{width:330,height:200},dx=b.x-a.x,dy=b.y-a.y,h=Math.abs(dx)>Math.abs(dy),x1=a.x/S+(h?Math.sign(dx)*ad.width/2:0),y1=a.y/S+(h?0:Math.sign(dy)*ad.height/2),x2=b.x/S-(h?Math.sign(dx)*bd.width/2:0),y2=b.y/S-(h?0:Math.sign(dy)*bd.height/2),d=h?`M${x1},${y1} C${(x1+x2)/2},${y1} ${(x1+x2)/2},${y2} ${x2},${y2}`:`M${x1},${y1} C${x1},${(y1+y2)/2} ${x2},${(y1+y2)/2} ${x2},${y2}`;return <g key={i}><path d={d} fill="none" stroke="#7A7570" strokeWidth="2.5" pathLength="1" strokeDasharray={`${p} 1`} opacity={.78}/>{i<2&&p>.98&&<text x={(x1+x2)/2+12} y={(y1+y2)/2-9} fontSize="10" fontFamily="JetBrains Mono" fill="#6B655A">{i?'models':'source'}</text>}</g>;})}</svg>
      {world.map((n,i)=>{const a=ease((t-n.birth)/(i===2?.8:.28)),C=components[n.type];return <div key={n.id} className="node-wrap" style={{position:'absolute',zIndex:16,opacity:a,visibility:a?'visible':'hidden',left:n.position.x,top:n.position.y,transform:`translateY(${(1-a)*8}px) scale(${.97+.03*a})`,transformOrigin:'center'}}><C node={{...n,position:{x:0,y:0}}} isSelected={i===0&&t<1.5}/></div>;})}
    </div>
    <div id="brand" style={{position:'absolute',top:946,width:1920,display:'flex',justifyContent:'center',opacity:ease((t-11.5)/.9),transform:`translateY(${8*(1-ease((t-11.5)/.9))}px)`}}><PsychisLogo size={60} showText/></div>
    {t>.12&&t<4.3&&<svg width="26" height="34" style={{position:'absolute',...cursor(t),opacity:ease((t-.12)/.2)*(1-ease((t-3.9)/.3))}} viewBox="0 0 28 36"><path d="M3 2V27L10 21L16 34L21 31L15 19L26 18Z" fill="#4A4540" stroke="#fff" strokeWidth="2"/></svg>}
  </div></>;
}
function cursor(t){const k=[[.12,1200,640],[.45,974,270],[1.8,1150,535],[2.15,1490,688],[2.8,1340,705],[3.5,490,686],[4.3,580,730]];let a=k[0],b=k.at(-1);for(let i=1;i<k.length;i++)if(t<=k[i][0]){a=k[i-1];b=k[i];break}const q=ease((t-a[0])/(b[0]-a[0]));return{left:a[1]+(b[1]-a[1])*q,top:a[2]+(b[2]-a[2])*q};}
function animateDiagrams(t){
  document.querySelectorAll('article svg').forEach(svg=>{if(svg.querySelector('animate,animateTransform')){svg.pauseAnimations();svg.setCurrentTime(t);}});
  const p=document.querySelector('#node-pendulum svg[viewBox="0 0 200 120"]');
  if(p){const a=.47*Math.cos(t*2.1),x=100+80*Math.sin(a),y=10+80*Math.cos(a),ls=p.querySelectorAll('line'),cs=p.querySelectorAll('circle');ls[1].setAttribute('x2',x);ls[1].setAttribute('y2',y);cs[1].setAttribute('cx',x);cs[1].setAttribute('cy',y);ls[2].setAttribute('x1',x);ls[2].setAttribute('x2',x);ls[2].setAttribute('y1',y);ls[2].setAttribute('y2',y+25);p.querySelector('text').setAttribute('x',x+8);p.querySelector('text').setAttribute('y',y+20);}
  const f=document.querySelector('#node-fourier svg[viewBox="0 0 200 70"]');if(f){f.querySelector('line').setAttribute('x2','128');f.querySelector('path').setAttribute('d','M100,35 L128,35');f.querySelector('line').setAttribute('transform',`rotate(${-t*80} 100 35)`);f.querySelector('path').setAttribute('transform',`rotate(${-t*80} 100 35)`);}
}
window.renderFrame=t=>{flushSync(()=>root.render(<Frame t={t}/>));document.querySelectorAll('article[data-node-id]').forEach(el=>dims[el.dataset.nodeId]={width:el.offsetWidth,height:el.offsetHeight});const host=document.querySelector('#node-source > div:first-child > span > span');if(host)host.textContent='openstax.org';const title=document.querySelector('#node-intro h3');if(title)title.style.clipPath=`inset(0 ${100*(1-ease((t-.5)/.35))}% 0 0)`;animateDiagrams(Math.min(t,13));return{visible:nodes.filter(n=>n.birth<=t).length};};
window.composition={nodes,edges:links.length,clusters:clusters.length,duration:15,fps:30};
window.audit=()=>{const boxes=nodes.map(n=>({...n,w:(dims[n.id]?.width||0)*S,h:(dims[n.id]?.height||0)*S}));return{count:boxes.length,duplicateTitles:boxes.filter((n,i)=>boxes.findIndex(m=>m.data.title===n.data.title)!==i).map(n=>n.id),overlaps:boxes.flatMap((a,i)=>boxes.slice(i+1).filter(b=>Math.abs(a.x-b.x)<(a.w+b.w)/2+8&&Math.abs(a.y-b.y)<(a.h+b.h)/2+8).map(b=>[a.id,b.id])),boxes:boxes.map(({id,x,y,w,h})=>({id,x,y,w,h}))};};
window.renderFrame(13);window.renderFrame(13);
let timer;window.pause=()=>clearInterval(timer);window.play=()=>{window.pause();let start=performance.now();timer=setInterval(()=>window.renderFrame(((performance.now()-start)/1000)%15),1000/30);};if(new URLSearchParams(location.search).has('play'))window.play();
