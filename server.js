const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000, ROOT=path.join(__dirname,'public');
const DATA=process.env.DATA_DIR||path.join(__dirname,'data');fs.mkdirSync(DATA,{recursive:true});const DB=path.join(DATA,'scores.json');
let scores=[];try{scores=JSON.parse(fs.readFileSync(DB,'utf8'));if(!Array.isArray(scores))scores=[];}catch{}
const sessions=new Map();const rate=new Map();
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
function save(){const tmp=DB+'.tmp';fs.writeFileSync(tmp,JSON.stringify(scores));fs.renameSync(tmp,DB);}
function board(mode){return scores.filter(x=>x.mode===mode).sort((a,b)=>b.score-a.score||a.date.localeCompare(b.date)).slice(0,50);}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&u.pathname==='/api/leaderboard'){const mode=u.searchParams.get('mode')==='campaign'?'campaign':'infinite';return send(res,200,{mode,entries:board(mode)});}
 if(req.method==='POST'&&u.pathname==='/api/session'){const id=crypto.randomUUID();sessions.set(id,{start:Date.now(),used:false});return send(res,200,{session:id});}
 if(req.method==='POST'&&u.pathname==='/api/score'){
 let raw='';req.on('data',c=>{raw+=c;if(raw.length>2000)req.destroy();});req.on('end',()=>{try{
 const x=JSON.parse(raw),name=String(x.name||'').trim().slice(0,18),mode=x.mode,score=x.score,level=x.level,session=sessions.get(x.session);
 const ip=req.socket.remoteAddress||'unknown',now=Date.now();if(now-(rate.get(ip)||0)<2500)return send(res,429,{error:'Aguarde antes de enviar outra pontuação.'});
 if(!/^[\p{L}\p{N} _.-]{2,18}$/u.test(name)||!['campaign','infinite'].includes(mode)||!Number.isSafeInteger(score)||score<0||score>100000000||!Number.isInteger(level)||level<1||level>999||!session||session.used||now-session.start<10000||now-session.start>14400000)return send(res,400,{error:'Pontuação ou sessão inválida.'});
 session.used=true;sessions.delete(x.session);rate.set(ip,now);scores.push({name,mode,score,level,date:new Date().toISOString()});scores=scores.sort((a,b)=>b.score-a.score).slice(0,3000);save();return send(res,200,{ok:true,rank:board(mode).findIndex(v=>v.name===name&&v.score===score)+1});
 }catch{return send(res,400,{error:'Dados inválidos.'});}});return;
 }
 if(req.method!=='GET')return send(res,405,{error:'Método não permitido'});
 let pathname;try{pathname=decodeURIComponent(u.pathname);}catch{return send(res,400,{error:'Caminho inválido'});}if(pathname==='/')pathname='/index.html';
 const file=path.resolve(ROOT,'.'+pathname);if(!file.startsWith(ROOT+path.sep))return send(res,403,{error:'Acesso negado'});
 fs.stat(file,(err,st)=>{if(err||!st.isFile())return send(res,404,{error:'Não encontrado'});res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);});
}).listen(PORT,()=>console.log('Nebula Strike em http://localhost:'+PORT));
