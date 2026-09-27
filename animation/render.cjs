const {app,BrowserWindow}=require('electron');
const fs=require('fs'); const path=require('path');
const out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});
app.commandLine.appendSwitch('force-device-scale-factor','1');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.whenReady().then(async()=>{
 const win=new BrowserWindow({width:1920,height:1080,useContentSize:true,show:false,webPreferences:{backgroundThrottling:false,offscreen:true,contextIsolation:false,preload:path.join(__dirname,'preload.cjs')}});
 win.setContentSize(1920,1080);
 win.webContents.on('console-message',(_e,_l,m)=>{if(/Error/.test(m))console.log(m)});
 await win.loadURL('http://localhost:5188/animation/index.html');
 await win.webContents.executeJavaScript('document.fonts.ready.then(()=>true)');
 await new Promise(r=>setTimeout(r,1500));
 // Freeze ambient RAF effects; frame time remains entirely controlled by renderFrame.
 await win.webContents.executeJavaScript('window.requestAnimationFrame=()=>0;true');
 const snap=async(t,file)=>{
  await win.webContents.executeJavaScript(`window.renderFrame(${t});window.renderFrame(${t});`);
  win.webContents.invalidate();
  await new Promise(r=>setTimeout(r,180));
  const im=await win.webContents.capturePage();fs.writeFileSync(file,im.toPNG());
 };
 for(const [t,n] of [[0,'opening'],[1.5,'first'],[4.15,'close-up'],[13.5,'final']]) await snap(t,path.join(out,`${n}.png`));
 console.log(await win.webContents.executeJavaScript('JSON.stringify({nodes:composition.nodes.length,edges:composition.edges})'));
 fs.writeFileSync(path.join(out,'layout-audit.json'),await win.webContents.executeJavaScript('JSON.stringify(audit(),null,2)'));
 if(process.argv.includes('--checks')){app.quit();return;}
 const frames=path.join(out,'frames');fs.mkdirSync(frames,{recursive:true});
 const range=process.argv.find(a=>a.startsWith('--range='));
 const [start,stop]=range?range.slice(8).split(':').map(Number):[0,450];
 for(let f=start;f<stop;f++){await snap(f/30,path.join(frames,`${String(f).padStart(4,'0')}.png`));if(f%30===0)console.log(`Rendered ${f}/450`);}
 app.quit();
}).catch(e=>{console.error(e);app.exit(1)});
