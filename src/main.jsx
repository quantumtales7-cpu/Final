import React,{useEffect,useMemo,useRef,useState}from"react";
import{createRoot}from"react-dom/client";
import{Bot,Copy,Menu,Plus,Send,Square,Trash2}from"lucide-react";
import"./styles.css";

function App(){
 const[models,setModels]=useState([]),[model,setModel]=useState(""),[messages,setMessages]=useState([]),[input,setInput]=useState(""),[loading,setLoading]=useState(false),[search,setSearch]=useState(""),[sidebar,setSidebar]=useState(true),[error,setError]=useState("");
 const abortRef=useRef(null);
 useEffect(()=>{fetch("/api/models").then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Could not load models");return d}).then(d=>{const a=d.data||[];setModels(a);setModel(a.find(m=>m.id.includes(":free"))?.id||a[0]?.id||"")}).catch(e=>setError(e.message))},[]);
 const filtered=useMemo(()=>{let q=search.toLowerCase();return models.filter(m=>(m.name+" "+m.id).toLowerCase().includes(q)).slice(0,150)},[models,search]);
 function clear(){abortRef.current?.abort();setMessages([]);setInput("");setLoading(false)}
 async function send(){
  if(!input.trim()||loading||!model)return;
  const next=[...messages,{role:"user",content:input.trim()}];setMessages([...next,{role:"assistant",content:""}]);setInput("");setLoading(true);setError("");
  const c=new AbortController();abortRef.current=c;
  try{
   const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model,messages:next}),signal:c.signal});
   if(!r.ok)throw Error(await r.text()||"Request failed");
   const reader=r.body.getReader(),dec=new TextDecoder();let buf="";
   while(true){const{x,done}=await reader.read().then(({value,done})=>({x:value,done}));if(done)break;buf+=dec.decode(x,{stream:true});const lines=buf.split("\n");buf=lines.pop()||"";
    for(const line of lines){if(!line.startsWith("data:"))continue;const raw=line.slice(5).trim();if(!raw||raw==="[DONE]")continue;try{const j=JSON.parse(raw);if(j.error)throw Error(j.error.message||"Provider error");const d=j.choices?.[0]?.delta?.content||"";if(d)setMessages(p=>{let a=[...p];a[a.length-1]={role:"assistant",content:a[a.length-1].content+d};return a})}catch(e){if(e.message!=="Unexpected end of JSON input")throw e}}
   }
  }catch(e){if(e.name!=="AbortError")setMessages(p=>{let a=[...p];a[a.length-1]={role:"assistant",content:"⚠️ "+(e.message||"Request failed")};return a})}finally{setLoading(false);abortRef.current=null}
 }
 return <div className="app">
 {sidebar&&<aside className="side"><button className="new" onClick={clear}><Plus/> New chat</button><div className="label">MODEL LIBRARY · {models.length}</div><input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search models..."/><div className="list">{filtered.map(m=><button key={m.id} onClick={()=>setModel(m.id)} className={"model "+(model===m.id?"sel":"")}><span>{m.name||m.id}</span><small>{m.id}</small></button>)}</div></aside>}
 <section className="main"><header><button className="icon" onClick={()=>setSidebar(!sidebar)}><Menu/></button><b className="brand"><Bot/> Universal AI</b><select value={model} onChange={e=>setModel(e.target.value)}>{models.length?filtered.map(m=><option key={m.id} value={m.id}>{m.name||m.id}</option>):<option>Loading models...</option>}</select><button className="icon" onClick={clear}><Trash2/></button></header>
 {error&&<div className="error">{error}</div>}
 <div className="messages">{!messages.length?<div className="welcome"><div className="logo"><Bot/></div><h1>Ask anything.</h1><p>Real-time AI chat with OpenRouter models.</p></div>:<div className="wrap">{messages.map((m,i)=><div className={"row "+m.role} key={i}><div className="bubble">{m.content||"Thinking…"}{m.role==="assistant"&&m.content&&<button className="copy" onClick={()=>navigator.clipboard?.writeText(m.content)}><Copy/> Copy</button>}</div></div>)}</div>}</div>
 <div className="composerArea"><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Message the selected model..." rows="1"/>{loading?<button className="send" onClick={()=>{abortRef.current?.abort();setLoading(false)}}><Square/></button>:<button className="send" disabled={!input.trim()||!model} onClick={send}><Send/></button>}</div><div className="hint">Enter to send · Shift+Enter for new line</div></div>
 </section></div>
}
createRoot(document.getElementById("root")).render(<App/>);