import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ftgvvykcrswuivxulrad.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Z3Z2eWtjcnN3dWl2eHVscmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTIzMTQsImV4cCI6MjA5MTY4ODMxNH0.chKBvxkpoAob7au8Dkzzi8OZOdc5fbOO3FF45nn0N7Q";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const DONORBOX_URL = "https://donorbox.org/launch-fund-for-a-little-help";
const FORMSPREE_URL = "https://formspree.io/f/mwvaqlvk";
const ADMIN_EMAIL = "megan@alittlehelpapp.org";

const B = {
  blue: "#2B8FD4", blueDark: "#1A6FAD", blueLight: "#E8F4FD", blueMid: "#5AAEE0",
  offWhite: "#F8F7F4", warmGray: "#EAE8E3", green: "#2E8B5C", greenLight: "#E8F7F0",
  text: "#1C2B3A", textMuted: "#6B7F8E", red: "#DC2626", redLight: "#FEE2E2",
};

const ZIP_COORDS = {
  "76001":[32.6540,-97.1000],"76002":[32.6459,-97.0831],"76006":[32.7357,-97.0722],
  "76010":[32.7357,-97.0979],"76011":[32.7485,-97.0668],"76012":[32.7571,-97.1224],
  "76013":[32.7274,-97.1310],"76014":[32.7012,-97.0831],"76015":[32.6891,-97.1224],
  "76016":[32.7012,-97.1560],"76017":[32.6668,-97.1310],"76018":[32.6459,-97.0668],
  "76019":[32.7714,-97.0668],"76063":[32.5693,-97.1421],"76084":[32.5360,-97.1560],
  "75050":[32.7457,-97.0097],"75051":[32.7274,-97.0097],"75052":[32.6891,-97.0222],
  "76021":[32.8449,-97.1421],"76022":[32.8357,-97.1560],"76034":[32.8882,-97.1421],
  "76039":[32.8357,-97.0831],"76040":[32.8449,-97.0668],"76053":[32.8357,-97.1224],
  "76248":[32.9338,-97.2283],"76051":[32.9338,-97.0831],"75019":[32.9561,-97.0097],
  "76028":[32.5360,-97.3199],
};

const ZIP_TO_CITY = {
  "76001":"Arlington, TX","76002":"Arlington, TX","76006":"Arlington, TX",
  "76010":"Arlington, TX","76011":"Arlington, TX","76012":"Arlington, TX",
  "76013":"Arlington, TX","76014":"Arlington, TX","76015":"Arlington, TX",
  "76016":"Arlington, TX","76017":"Arlington, TX","76018":"Arlington, TX",
  "76019":"Arlington, TX","76063":"Mansfield, TX","76084":"Mansfield, TX",
  "75050":"Grand Prairie, TX","75051":"Grand Prairie, TX","75052":"Grand Prairie, TX",
  "76021":"Bedford, TX","76022":"Bedford, TX","76034":"Colleyville, TX",
  "76039":"Euless, TX","76040":"Euless, TX","76053":"Hurst, TX",
  "76248":"Keller, TX","76051":"Grapevine, TX","75019":"Coppell, TX","76028":"Burleson, TX",
};

// CHANGE 1: Accept ALL zip codes - unknown zips just show "ZIP XXXXX"
const getCityFromZip=(zip)=>ZIP_TO_CITY[zip]||(zip.length===5?`ZIP ${zip}`:"");
const getCoordsFromZip=(zip)=>ZIP_COORDS[zip]||null;

function getDistanceMiles(lat1,lon1,lat2,lon2){const R=3958.8,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180,a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}

// CHANGE 2: timeAgo function for friendly timestamps
const timeAgo=(dateStr)=>{
  if(!dateStr)return"";
  const now=new Date();
  const then=new Date(dateStr);
  const diffMs=now-then;
  const diffMins=Math.floor(diffMs/60000);
  const diffHours=Math.floor(diffMins/60);
  const diffDays=Math.floor(diffHours/24);
  if(diffMins<1)return"just now";
  if(diffMins<60)return`${diffMins}m ago`;
  if(diffHours<24)return`${diffHours}h ago`;
  if(diffDays===1)return"yesterday";
  if(diffDays<7)return`${diffDays}d ago`;
  return then.toLocaleDateString([],{month:"short",day:"numeric"});
};

const uploadAvatar=async(file,userId)=>{
  const ext=file.name.split(".").pop();
  const path=`${userId}/avatar.${ext}`;
  const{error}=await supabase.storage.from("avatars").upload(path,file,{upsert:true});
  if(error)return null;
  const{data}=supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};

const LOGO_SRC = "/logo192.png";

const Logo=({size=120})=><img src={LOGO_SRC} alt="A Little Help?!" width={size} height={size} style={{objectFit:"contain"}}/>;
const LogoSmall=({size=36})=><img src={LOGO_SRC} alt="A Little Help?!" width={size} height={size} style={{objectFit:"contain"}}/>;

const Avatar=({src,initials,size=40,color=B.blue})=>(
  <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,overflow:"hidden",background:src?"transparent":`linear-gradient(135deg, ${color}, ${B.blueMid})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
    {src?<img src={src} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:"white",fontWeight:800,fontSize:size*0.33,fontFamily:"'Nunito', sans-serif"}}>{initials}</span>}
  </div>
);

const Btn=({children,onClick,disabled,variant="primary",style:s={}})=>{
  const base={width:"100%",padding:"15px",borderRadius:16,fontSize:16,fontWeight:800,fontFamily:"'Nunito', sans-serif",cursor:disabled?"not-allowed":"pointer",border:"none",transition:"all 0.2s",...s};
  const styles={
    primary:{background:disabled?B.warmGray:`linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,color:disabled?B.textMuted:"white",boxShadow:disabled?"none":`0 6px 20px ${B.blue}40`},
    ghost:{background:"transparent",color:B.textMuted,border:`2px solid ${B.warmGray}`},
    danger:{background:B.red,color:"white",boxShadow:`0 4px 12px ${B.red}40`},
    green:{background:`linear-gradient(135deg, ${B.green}, #1F6B42)`,color:"white",boxShadow:`0 4px 12px ${B.green}40`},
  };
  return <button onClick={disabled?undefined:onClick} style={{...base,...styles[variant]}}>{children}</button>;
};

const Check=({checked,onToggle,label,sublabel})=>(
  <div onClick={onToggle} style={{display:"flex",gap:14,alignItems:"flex-start",cursor:"pointer",padding:"4px 0"}}>
    <div style={{width:24,height:24,borderRadius:6,flexShrink:0,marginTop:1,border:`2.5px solid ${checked?B.blue:B.warmGray}`,background:checked?B.blue:"white",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
      {checked&&<span style={{color:"white",fontSize:14,fontWeight:900}}>✓</span>}
    </div>
    <div>
      <div style={{fontSize:14,fontWeight:700,color:B.text,fontFamily:"'Nunito', sans-serif",lineHeight:1.4}}>{label}</div>
      {sublabel&&<div style={{fontSize:12,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginTop:2,lineHeight:1.4}}>{sublabel}</div>}
    </div>
  </div>
);

const SupportForm=({onBack})=>{
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[message,setMessage]=useState("");
  const[submitted,setSubmitted]=useState(false);
  const[loading,setLoading]=useState(false);
  const handleSubmit=async()=>{
    setLoading(true);
    try{await fetch(FORMSPREE_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,message})});setSubmitted(true);}catch(e){}
    setLoading(false);
  };
  if(submitted)return(
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:48,marginBottom:16}}>💙</div>
      <h3 style={{fontSize:20,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>Message sent!</h3>
      <p style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.7,marginBottom:24}}>We typically respond within 48 hours. Thank you for helping us improve! 🌱</p>
      <Btn onClick={onBack} variant="ghost">← Back</Btn>
    </div>
  );
  return(
    <div>
      <button onClick={onBack} style={{background:"none",border:"none",color:B.blue,fontWeight:800,fontSize:14,fontFamily:"'Nunito', sans-serif",cursor:"pointer",marginBottom:16,padding:0}}>← Back</button>
      <h3 style={{fontSize:20,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>Tech Support 🐛</h3>
      <p style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.7,marginBottom:20}}>Having trouble? Tell us what happened and we'll get back to you!</p>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {[{label:"Your name",value:name,onChange:e=>setName(e.target.value),placeholder:"First name"},{label:"Your email",value:email,onChange:e=>setEmail(e.target.value),placeholder:"you@email.com",type:"email"}].map(field=>(
          <div key={field.label}>
            <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:6}}>{field.label}</label>
            <input {...field} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",background:"white",boxSizing:"border-box",color:B.text}}/>
          </div>
        ))}
        <div>
          <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:6}}>What happened?</label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe the issue..." rows={4} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",boxSizing:"border-box",color:B.text,resize:"none"}}/>
        </div>
        <Btn onClick={handleSubmit} disabled={!name||!email||!message||loading}>{loading?"Sending...":"Send message 💙"}</Btn>
      </div>
    </div>
  );
};

const HamburgerMenu=({onClose,onSignOut})=>{
  const[page,setPage]=useState(null);
  const items=[
    {emoji:"💙",label:"About A Little Help?!",content:"about"},
    {emoji:"❓",label:"How It Works",content:"how"},
    {emoji:"🛡️",label:"Safety Tips",content:"safety"},
    {emoji:"🐛",label:"Tech Support / Report a Bug",content:"support"},
    {emoji:"📋",label:"Legal Notices",content:"legal"},
    {emoji:"💰",label:"Support Us — Keep the App Free",content:"donate"},
  ];
  const pages={
    about:(
      <div>
        <button onClick={()=>setPage(null)} style={{background:"none",border:"none",color:B.blue,fontWeight:800,fontSize:14,fontFamily:"'Nunito', sans-serif",cursor:"pointer",marginBottom:16,padding:0}}>← Back</button>
        <h3 style={{fontSize:20,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:16}}>About A Little Help?! 🌱</h3>
        <p style={{fontSize:15,color:B.text,fontFamily:"'Nunito', sans-serif",lineHeight:1.8,marginBottom:14,fontStyle:"italic"}}>"We believe that giving and receiving are both sacred — and that there is enough for everyone.</p>
        <p style={{fontSize:15,color:B.text,fontFamily:"'Nunito', sans-serif",lineHeight:1.8,marginBottom:14,fontStyle:"italic"}}>A Little Help?! exists because we know the world gets better when vulnerability meets compassion, when we show up for each other. Not governments. Not corporations. People.</p>
        <p style={{fontSize:15,color:B.text,fontFamily:"'Nunito', sans-serif",lineHeight:1.8,marginBottom:20,fontStyle:"italic"}}>Sometimes all it takes to heal is a little help." 🌱</p>
        <div style={{background:B.blueLight,borderRadius:14,padding:"12px 16px"}}>
          <p style={{fontSize:13,color:B.blue,fontFamily:"'Nunito', sans-serif",fontWeight:700,margin:0,lineHeight:1.6}}>501(c)(3) Nonprofit · EIN: 35-2983400<br/>Arlington, TX · <a href="https://alittlehelpapp.org" target="_blank" rel="noreferrer" style={{color:B.blue}}>alittlehelpapp.org</a></p>
        </div>
      </div>
    ),
    how:(
      <div>
        <button onClick={()=>setPage(null)} style={{background:"none",border:"none",color:B.blue,fontWeight:800,fontSize:14,fontFamily:"'Nunito', sans-serif",cursor:"pointer",marginBottom:16,padding:0}}>← Back</button>
        <h3 style={{fontSize:20,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:16}}>How It Works ❓</h3>
        {[
          {emoji:"1️⃣",title:"Create an account",body:"Sign up with your email. We never sell your data or share your info."},
          {emoji:"2️⃣",title:"Set your location",body:"Tell us your zip code so we can show you posts from neighbors nearby."},
          {emoji:"3️⃣",title:"Post or browse",body:"Post a request for help, or browse offers from neighbors willing to lend a hand."},
          {emoji:"4️⃣",title:"Connect privately",body:"Message neighbors directly. Your contact info is never shared automatically."},
          {emoji:"5️⃣",title:"Mark it complete",body:"When help is received, mark your post fulfilled — and add to our kindness counter! 🌱"},
        ].map(s=>(
          <div key={s.emoji} style={{display:"flex",gap:12,marginBottom:16,alignItems:"flex-start"}}>
            <div style={{fontSize:24,flexShrink:0}}>{s.emoji}</div>
            <div>
              <div style={{fontWeight:800,fontSize:14,color:B.text,fontFamily:"'Nunito', sans-serif"}}>{s.title}</div>
              <div style={{fontSize:13,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginTop:2,lineHeight:1.5}}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>
    ),
    safety:(
      <div>
        <button onClick={()=>setPage(null)} style={{background:"none",border:"none",color:B.blue,fontWeight:800,fontSize:14,fontFamily:"'Nunito', sans-serif",cursor:"pointer",marginBottom:16,padding:0}}>← Back</button>
        <h3 style={{fontSize:20,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:16}}>Safety Tips 🛡️</h3>
        {["Always meet in public places — coffee shops, libraries, parking lots.","Tell a friend or family member when and where you're meeting someone.","Trust your gut. If something feels off, it probably is.","Never share your home address until you're truly comfortable.","You know your community best — use your instincts.","This app is not an emergency service. If you are in danger, call 911.","Report any suspicious behavior using the Report button on any post."].map((tip,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:14,alignItems:"flex-start"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:B.blue,flexShrink:0,marginTop:6}}/>
            <div style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.6}}>{tip}</div>
          </div>
        ))}
      </div>
    ),
    support:<SupportForm onBack={()=>setPage(null)}/>,
    legal:(
      <div>
        <button onClick={()=>setPage(null)} style={{background:"none",border:"none",color:B.blue,fontWeight:800,fontSize:14,fontFamily:"'Nunito', sans-serif",cursor:"pointer",marginBottom:16,padding:0}}>← Back</button>
        <h3 style={{fontSize:20,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:16}}>Legal Notices 📋</h3>
        <div style={{marginBottom:20}}>
          <div style={{fontWeight:800,fontSize:15,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>Terms of Service</div>
          <p style={{fontSize:13,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.7}}>By using A Little Help?!, you agree to use the platform responsibly and in good faith. You must be 18 or older. You may not use the app for commercial purposes, spam, or any illegal activity. A Little Help?! reserves the right to remove any content or user that violates these terms.</p>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontWeight:800,fontSize:15,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>Privacy Policy</div>
          <p style={{fontSize:13,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.7}}>We collect only the information needed to run the app (email, name, zip code). We never sell your data. We never share your contact info without your consent. All data is stored securely. In cases where a user has been reported for violating our community guidelines, A Little Help?! staff may review relevant messages as part of a safety investigation. This is done solely to protect our community.</p>
        </div>
        <div>
          <div style={{fontWeight:800,fontSize:15,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>Disclaimer</div>
          <p style={{fontSize:13,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.7}}>A Little Help?! is not responsible for interactions between users. Nothing on this platform constitutes professional, medical, or legal advice. Governed by the laws of the State of Texas. A Little Help?! reserves the right to remove any user or content that violates our community guidelines.</p>
        </div>
      </div>
    ),
    donate:(
      <div style={{textAlign:"center"}}>
        <button onClick={()=>setPage(null)} style={{background:"none",border:"none",color:B.blue,fontWeight:800,fontSize:14,fontFamily:"'Nunito', sans-serif",cursor:"pointer",marginBottom:16,padding:0,display:"block"}}>← Back</button>
        <div style={{fontSize:56,marginBottom:16}}>💙</div>
        <h3 style={{fontSize:22,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:12}}>Keep A Little Help?! free</h3>
        <p style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.7,marginBottom:24}}>Like Wikipedia, we rely on the generosity of people who believe in our mission to keep the lights on. Every contribution helps us stay free for everyone.</p>
        <a href={DONORBOX_URL} target="_blank" rel="noreferrer" style={{display:"block",padding:"16px",borderRadius:16,background:`linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,color:"white",fontWeight:900,fontSize:16,fontFamily:"'Nunito', sans-serif",textDecoration:"none",boxShadow:`0 6px 20px ${B.blue}40`,marginBottom:16}}>💙 Donate to A Little Help?!</a>
        <p style={{fontSize:12,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.5}}>A Little Help?! is a registered 501(c)(3) nonprofit.<br/>Donations may be tax deductible. EIN: 35-2983400</p>
      </div>
    ),
  };
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex"}}>
      <div style={{flex:1,background:"rgba(0,0,0,0.5)"}} onClick={onClose}/>
      <div style={{width:"85%",maxWidth:340,background:"white",height:"100%",overflowY:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"52px 20px 16px",borderBottom:`1px solid ${B.warmGray}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <LogoSmall size={40}/>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:B.textMuted}}>✕</button>
        </div>
        <div style={{flex:1,padding:page?"24px 20px":"16px 0",overflowY:"auto"}}>
          {page?pages[page]:(
            <>
              {items.map(item=>(
                <button key={item.content} onClick={()=>setPage(item.content)} style={{width:"100%",padding:"16px 20px",background:"none",border:"none",borderBottom:`1px solid ${B.warmGray}`,display:"flex",alignItems:"center",gap:14,cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:22,flexShrink:0}}>{item.emoji}</span>
                  <span style={{fontSize:15,fontWeight:700,color:B.text,fontFamily:"'Nunito', sans-serif"}}>{item.label}</span>
                  <span style={{marginLeft:"auto",color:B.textMuted,fontSize:18}}>›</span>
                </button>
              ))}
              <button onClick={onSignOut} style={{width:"100%",padding:"16px 20px",background:"none",border:"none",borderBottom:`1px solid ${B.warmGray}`,display:"flex",alignItems:"center",gap:14,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22,flexShrink:0}}>🚪</span>
                <span style={{fontSize:15,fontWeight:700,color:B.red,fontFamily:"'Nunito', sans-serif"}}>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AuthScreen=({onAuth})=>{
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[success,setSuccess]=useState("");
  const handleAuth=async()=>{
    setError("");setSuccess("");setLoading(true);
    try{
      if(mode==="signup"){const{error}=await supabase.auth.signUp({email,password});if(error)throw error;setSuccess("Check your email to confirm your account, then log in!");}
      else{const{error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;onAuth();}
    }catch(err){setError(err.message);}
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg, ${B.blueLight} 0%, white 55%, ${B.offWhite} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px"}}>
      <Logo size={120}/><div style={{height:24}}/>
      <div style={{width:"100%",maxWidth:360}}>
        <h2 style={{fontSize:24,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",textAlign:"center",marginBottom:8}}>{mode==="login"?"Welcome back 💙":"Join your community 🌱"}</h2>
        <p style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:600,textAlign:"center",marginBottom:28}}>{mode==="login"?"Sign in to A Little Help?!":"Create your free account"}</p>
        {error&&<div style={{background:B.redLight,border:"1px solid #FCA5A5",borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:13,color:B.red,fontFamily:"'Nunito', sans-serif",fontWeight:600}}>{error}</div>}
        {success&&<div style={{background:B.greenLight,border:`1px solid ${B.green}40`,borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:13,color:B.green,fontFamily:"'Nunito', sans-serif",fontWeight:600}}>{success}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
          {[{label:"Email",value:email,onChange:e=>setEmail(e.target.value),type:"email",placeholder:"you@email.com"},{label:"Password",value:password,onChange:e=>setPassword(e.target.value),type:"password",placeholder:"••••••••"}].map(field=>(
            <div key={field.label}>
              <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:6}}>{field.label}</label>
              <input {...field} style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:16,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",background:"white",boxSizing:"border-box",color:B.text}}/>
            </div>
          ))}
        </div>
        <Btn onClick={handleAuth} disabled={loading||!email||!password}>{loading?"Please wait...":mode==="login"?"Sign In":"Create Account"}</Btn>
        <div style={{height:14}}/>
        <Btn onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");setSuccess("");}} variant="ghost">{mode==="login"?"New here? Create an account":"Already have an account? Sign in"}</Btn>
        <p style={{marginTop:20,fontSize:11,color:B.textMuted,fontFamily:"'Nunito', sans-serif",textAlign:"center",lineHeight:1.6}}>A Little Help?! is a 501(c)(3) nonprofit<br/>Free forever · No ads · No data selling</p>
      </div>
    </div>
  );
};

const LocationPromptScreen=({userProfile,onConfirm})=>{
  const[zip,setZip]=useState(userProfile?.zip||"");
  const city=getCityFromZip(zip);
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg, ${B.blueLight} 0%, white 55%, ${B.offWhite} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",textAlign:"center"}}>
      <LogoSmall size={70}/><div style={{height:24}}/>
      <h2 style={{fontSize:24,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>Where are you right now? 📍</h2>
      <p style={{fontSize:15,color:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:600,lineHeight:1.65,maxWidth:300,marginBottom:28}}>We'll show you posts near your current location.</p>
      <div style={{width:"100%",maxWidth:340}}>
        <input value={zip} onChange={e=>setZip(e.target.value.replace(/\D/g,""))} placeholder="Enter your zip code" maxLength={5} style={{width:"100%",padding:"16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:18,fontFamily:"'Nunito', sans-serif",fontWeight:700,outline:"none",background:"white",boxSizing:"border-box",color:B.text,textAlign:"center",marginBottom:8}}/>
        {city&&<p style={{fontSize:14,color:B.blue,fontFamily:"'Nunito', sans-serif",fontWeight:700,marginBottom:20}}>📍 {city}</p>}
        <div style={{height:city?0:20}}/>
        <Btn onClick={()=>onConfirm({zip,city,coords:getCoordsFromZip(zip)})} disabled={zip.length!==5}>Show me posts near me 🌱</Btn>
      </div>
    </div>
  );
};

const SplashScreen=({onNext})=>{
  const[v,setV]=useState(false);
  useEffect(()=>{setTimeout(()=>setV(true),100);},[]);
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg, ${B.blueLight} 0%, white 55%, ${B.offWhite} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",textAlign:"center",opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",transition:"all 0.6s ease"}}>
      <Logo size={180}/><div style={{height:8}}/>
      <p style={{fontSize:17,color:B.textMuted,lineHeight:1.65,maxWidth:300,marginBottom:40,fontFamily:"'Nunito', sans-serif",fontWeight:600}}>Real neighbors. Real help.<br/>No strings attached.</p>
      <Btn onClick={onNext}>Get Started 🌱</Btn>
      <p style={{marginTop:16,fontSize:12,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.6}}>A Little Help?! is a 501(c)(3) nonprofit<br/>Free forever · No ads · No data selling</p>
    </div>
  );
};

const AgeGateScreen=({onConfirm,onDecline})=>{
  const[v,setV]=useState(false);
  useEffect(()=>{setTimeout(()=>setV(true),100);},[]);
  return(
    <div style={{minHeight:"100vh",background:B.offWhite,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",textAlign:"center",opacity:v?1:0,transform:v?"translateY(0)":"translateY(16px)",transition:"all 0.5s ease"}}>
      <LogoSmall size={56}/><div style={{height:28}}/>
      <div style={{fontSize:52,marginBottom:16}}>🔞</div>
      <h2 style={{fontSize:24,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:12}}>You must be 18 or older</h2>
      <p style={{fontSize:15,color:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:600,lineHeight:1.65,maxWidth:300,marginBottom:36}}>A Little Help?! is designed for adults only.</p>
      <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:12}}>
        <Btn onClick={onConfirm}>✓ I am 18 or older</Btn>
        <Btn onClick={onDecline} variant="ghost">I am under 18</Btn>
      </div>
    </div>
  );
};

const Under18Screen=()=>(
  <div style={{minHeight:"100vh",background:B.offWhite,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px",textAlign:"center"}}>
    <div style={{fontSize:56,marginBottom:20}}>💙</div>
    <h2 style={{fontSize:22,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:12}}>Thanks for your honesty</h2>
    <p style={{fontSize:15,color:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:600,lineHeight:1.65,maxWidth:300}}>A Little Help?! is only available to adults 18 and older. 🌱</p>
  </div>
);

const slides=[
  {emoji:"🏘️",title:"Your neighborhood,\nyour community",body:"A Little Help?! is hyper-local. Everything stays within your area — your neighbors, your block, your people.",cta:"That sounds great →"},
  {emoji:"🔒",title:"Privacy first,\nalways",body:"Your contact info is never shared until YOU choose to connect with someone.",cta:"Good to know →"},
  {emoji:"💙",title:"No ratings.\nNo transactions.\nNo ads.",body:"This is a 501(c)(3) nonprofit. No reviews, no payments, no pressure — just genuine people doing kind things.",cta:"I love this →"},
];

const OnboardingScreen=({step,onNext,onBack})=>{
  const s=slides[step];
  return(
    <div style={{minHeight:"100vh",background:B.offWhite,display:"flex",flexDirection:"column",padding:"60px 28px 40px"}}>
      <div style={{display:"flex",gap:6,marginBottom:48}}>{slides.map((_,i)=><div key={i} style={{height:5,flex:1,borderRadius:99,background:i<=step?B.blue:B.warmGray,transition:"background 0.3s"}}/>)}</div>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontSize:72,marginBottom:24,textAlign:"center"}}>{s.emoji}</div>
        <h2 style={{fontSize:26,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",whiteSpace:"pre-line",lineHeight:1.25,marginBottom:18,textAlign:"center"}}>{s.title}</h2>
        <p style={{fontSize:15,color:B.textMuted,lineHeight:1.65,fontFamily:"'Nunito', sans-serif",fontWeight:600,textAlign:"center",maxWidth:300,margin:"0 auto 40px"}}>{s.body}</p>
      </div>
      <Btn onClick={onNext}>{s.cta}</Btn>
      <div style={{height:12}}/>
      {step>0&&<Btn onClick={onBack} variant="ghost">← Back</Btn>}
    </div>
  );
};

const DisclaimerScreen=({onNext})=>{
  const[checks,setChecks]=useState({c1:false,c2:false,c3:false,c4:false});
  const allChecked=Object.values(checks).every(Boolean);
  const toggle=(k)=>setChecks(prev=>({...prev,[k]:!prev[k]}));
  return(
    <div style={{minHeight:"100vh",background:B.offWhite,display:"flex",flexDirection:"column",padding:"52px 24px 40px"}}>
      <div style={{marginBottom:28}}>
        <div style={{fontSize:13,fontWeight:800,color:B.blue,fontFamily:"'Nunito', sans-serif",marginBottom:6}}>BEFORE YOU JOIN</div>
        <h2 style={{fontSize:22,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>A few important things 🛡️</h2>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:18}}>
        <div style={{background:"white",borderRadius:18,padding:20,border:`1px solid ${B.warmGray}`,display:"flex",flexDirection:"column",gap:16}}>
          <Check checked={checks.c1} onToggle={()=>toggle("c1")} label="I will meet helpers in public places" sublabel="All in-person meetings should happen in visible, public locations."/>
          <div style={{height:1,background:B.warmGray}}/>
          <Check checked={checks.c2} onToggle={()=>toggle("c2")} label="I will use good judgment when meeting neighbors" sublabel="You know your community best — trust your instincts."/>
          <div style={{height:1,background:B.warmGray}}/>
          <Check checked={checks.c3} onToggle={()=>toggle("c3")} label="This is not an emergency service" sublabel="If you are in danger, call 911."/>
          <div style={{height:1,background:B.warmGray}}/>
          <Check checked={checks.c4} onToggle={()=>toggle("c4")} label="Users are not licensed professionals" sublabel="Nothing here constitutes medical, legal, or professional advice."/>
        </div>
        <div style={{background:B.blueLight,borderRadius:14,padding:"14px 16px"}}>
          <p style={{fontSize:13,color:B.blue,fontFamily:"'Nunito', sans-serif",fontWeight:700,margin:0}}>By joining you agree to our Terms of Service and Privacy Policy — governed by Texas law.</p>
        </div>
      </div>
      <div style={{height:20}}/>
      <Btn onClick={onNext} disabled={!allChecked}>{allChecked?"I understand, let's go! 🌱":`Confirm all ${Object.values(checks).filter(Boolean).length}/4 to continue`}</Btn>
    </div>
  );
};

const ProfileScreen=({onNext,session,setUserProfile})=>{
  const[role,setRole]=useState(null);
  const[name,setName]=useState("");
  const[zip,setZip]=useState("");
  const[photoFile,setPhotoFile]=useState(null);
  const[photoPreview,setPhotoPreview]=useState(null);
  const[loading,setLoading]=useState(false);
  const fileRef=useRef(null);
  const city=getCityFromZip(zip);
  const ready=name.trim()&&zip.length===5&&role;
  const handlePhoto=(e)=>{const file=e.target.files[0];if(file){setPhotoFile(file);const reader=new FileReader();reader.onload=(ev)=>setPhotoPreview(ev.target.result);reader.readAsDataURL(file);}};
  const handleJoin=async()=>{
    setLoading(true);
    const coords=getCoordsFromZip(zip);
    let avatarUrl=null;
    if(photoFile)avatarUrl=await uploadAvatar(photoFile,session.user.id);
    await supabase.from("profiles").upsert({id:session.user.id,name,zip,city,role,avatar_url:avatarUrl,latitude:coords?coords[0]:null,longitude:coords?coords[1]:null});
    setUserProfile({name,zip,city,role,photoPreview:avatarUrl||photoPreview,coords});
    setLoading(false);onNext();
  };
  return(
    <div style={{minHeight:"100vh",background:B.offWhite,padding:"52px 24px 40px",display:"flex",flexDirection:"column"}}>
      <div style={{marginBottom:28}}>
        <div style={{fontSize:13,fontWeight:800,color:B.blue,fontFamily:"'Nunito', sans-serif",marginBottom:6}}>ALMOST THERE</div>
        <h2 style={{fontSize:22,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:6}}>Set up your profile</h2>
        <p style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:600}}>Only your first name and city are ever shown publicly.</p>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:20}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <div onClick={()=>fileRef.current.click()} style={{width:90,height:90,borderRadius:"50%",background:photoPreview?"transparent":B.blueLight,border:`2px dashed ${B.blue}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden"}}>
            {photoPreview?<img src={photoPreview} alt="profile" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:32}}>📷</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
          <p style={{fontSize:13,color:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:600}}>{photoPreview?"Tap to change":"Add a profile photo (optional)"}</p>
        </div>
        {[{label:"First name only",value:name,onChange:e=>setName(e.target.value),placeholder:"e.g. Maria",maxLength:30},{label:"Home zip code",value:zip,onChange:e=>setZip(e.target.value.replace(/\D/g,"")),placeholder:"e.g. 76010",maxLength:5}].map(field=>(
          <div key={field.label}>
            <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:8}}>{field.label}</label>
            <input {...field} style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:16,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",background:"white",boxSizing:"border-box",color:B.text}}/>
            {field.label==="Home zip code"&&city&&<p style={{fontSize:12,color:B.blue,fontFamily:"'Nunito', sans-serif",fontWeight:700,marginTop:6}}>📍 {city}</p>}
          </div>
        ))}
        <div>
          <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:10}}>I'm here to…</label>
          <div style={{display:"flex",gap:10}}>
            {[{id:"both",label:"Both! 🤝",desc:"Help & receive"},{id:"help",label:"Give help 💙",desc:"Offer my time"},{id:"receive",label:"Get help 🙏",desc:"Ask for support"}].map(r=>(
              <button key={r.id} onClick={()=>setRole(r.id)} style={{flex:1,padding:"12px 6px",borderRadius:14,border:`2px solid ${role===r.id?B.blue:B.warmGray}`,background:role===r.id?B.blueLight:"white",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:800,color:role===r.id?B.blue:B.text,fontFamily:"'Nunito', sans-serif"}}>{r.label}</div>
                <div style={{fontSize:11,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginTop:2}}>{r.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{height:24}}/>
      <Btn onClick={handleJoin} disabled={!ready||loading}>{loading?"Saving...":"Join my community 🌱"}</Btn>
    </div>
  );
};

const CATEGORIES=[
  {id:"errands",emoji:"🛒",label:"Errands"},{id:"petcare",emoji:"🐾",label:"Pet Care"},
  {id:"household",emoji:"🔧",label:"Household"},{id:"transport",emoji:"🚗",label:"Transport"},
  {id:"meals",emoji:"🍲",label:"Meals"},{id:"tutoring",emoji:"📚",label:"Tutoring"},
  {id:"emotional",emoji:"💬",label:"Listening Ear"},{id:"tech",emoji:"💻",label:"Tech Help"},
  {id:"yard",emoji:"🌱",label:"Yard & Garden"},{id:"senior",emoji:"👴",label:"Senior Support"},
  {id:"other",emoji:"✨",label:"Other"},
];

const CreatePostModal=({onClose,onPost,userProfile,session,currentLocation})=>{
  const[type,setType]=useState("request");
  const[category,setCategory]=useState(null);
  const[title,setTitle]=useState("");
  const[description,setDescription]=useState("");
  const[customCategory,setCustomCategory]=useState("");
  const[loading,setLoading]=useState(false);
  const ready=type&&category&&title.trim()&&description.trim()&&(category!=="other"||customCategory.trim());
  const handlePost=async()=>{
    setLoading(true);
    const cat=CATEGORIES.find(c=>c.id===category);
    const coords=currentLocation?.coords;
    await supabase.from("posts").insert({user_id:session?.user?.id,type,category,emoji:cat?.emoji||"✨",title:category==="other"?customCategory:title,description,city:currentLocation?.city||userProfile?.city||"Arlington, TX",user_name:userProfile?.name||"Neighbor",user_initials:(userProfile?.name||"N").charAt(0).toUpperCase(),latitude:coords?coords[0]:null,longitude:coords?coords[1]:null,fulfilled:false});
    onPost();setLoading(false);onClose();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:"24px 24px 0 0",padding:"28px 24px 48px",width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
        <h3 style={{fontFamily:"'Nunito', sans-serif",fontWeight:900,fontSize:20,color:B.text,marginBottom:20}}>Create a post</h3>
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          {[{id:"request",emoji:"🙏",label:"I need help"},{id:"offer",emoji:"💙",label:"I can help"}].map(t=>(
            <button key={t.id} onClick={()=>setType(t.id)} style={{flex:1,padding:"14px 8px",borderRadius:16,border:`2px solid ${type===t.id?B.blue:B.warmGray}`,background:type===t.id?B.blueLight:"white",cursor:"pointer"}}>
              <div style={{fontSize:24,marginBottom:4}}>{t.emoji}</div>
              <div style={{fontFamily:"'Nunito', sans-serif",fontWeight:800,fontSize:14,color:type===t.id?B.blue:B.text}}>{t.label}</div>
            </button>
          ))}
        </div>
        <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:8}}>Category</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>setCategory(c.id)} style={{padding:"6px 12px",borderRadius:99,border:`2px solid ${category===c.id?B.blue:B.warmGray}`,background:category===c.id?B.blueLight:"white",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Nunito', sans-serif",color:category===c.id?B.blue:B.textMuted}}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        {category==="other"&&<div style={{marginBottom:16}}><label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:8}}>What kind of help?</label><input value={customCategory} onChange={e=>setCustomCategory(e.target.value)} placeholder="e.g. Moving help..." style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",boxSizing:"border-box",color:B.text}}/></div>}
        <div style={{marginBottom:16}}><label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:8}}>Title</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Brief title..." style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",boxSizing:"border-box",color:B.text}}/></div>
        <div style={{marginBottom:24}}><label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:8}}>Details</label><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Tell neighbors a little more..." rows={3} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",boxSizing:"border-box",color:B.text,resize:"none"}}/></div>
        <Btn onClick={handlePost} disabled={!ready||loading}>{loading?"Posting...":"Post to my community 🌱"}</Btn>
      </div>
    </div>
  );
};

const MessageThreadScreen=({thread,onBack,session})=>{
  const[messages,setMessages]=useState([]);
  const[newMsg,setNewMsg]=useState("");
  const[loading,setLoading]=useState(true);
  const bottomRef=useRef(null);
  const loadMessages=async()=>{
    const{data}=await supabase.from("messages").select("*").or(`and(sender_id.eq.${thread.my_id},recipient_id.eq.${thread.recipient_id}),and(sender_id.eq.${thread.recipient_id},recipient_id.eq.${thread.my_id})`).order("created_at",{ascending:true});
    if(data)setMessages(data);
    setLoading(false);
    await supabase.from("messages").update({read:true}).eq("recipient_id",thread.my_id).eq("sender_id",thread.recipient_id).eq("read",false);
  };
  useEffect(()=>{
    loadMessages();
    const sub=supabase.channel("msg-thread-v3").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},()=>loadMessages()).subscribe();
    return()=>sub.unsubscribe();
  },[]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const send=async()=>{
    if(!newMsg.trim())return;
    await supabase.from("messages").insert({sender_id:thread.my_id,recipient_id:thread.recipient_id,post_id:thread.post_id||null,content:newMsg,read:false});
    setNewMsg("");
  };
  return(
    <div style={{minHeight:"100vh",background:B.offWhite,display:"flex",flexDirection:"column"}}>
      <div style={{background:"white",padding:"52px 20px 14px",borderBottom:`1px solid ${B.warmGray}`,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:B.blue,padding:0}}>←</button>
        <Avatar initials={thread.initials} size={38}/>
        <div>
          <div style={{fontWeight:800,fontSize:15,color:B.text,fontFamily:"'Nunito', sans-serif"}}>{thread.name}</div>
          <div style={{fontSize:11,color:B.green,fontFamily:"'Nunito', sans-serif",fontWeight:700}}>● Active</div>
        </div>
      </div>
      <div style={{flex:1,padding:"20px 16px",display:"flex",flexDirection:"column",gap:12,paddingBottom:100,overflowY:"auto"}}>
        {loading?<div style={{textAlign:"center",color:B.textMuted,fontFamily:"'Nunito', sans-serif",padding:"20px 0"}}>Loading... 🌱</div>:
        messages.length===0?<div style={{textAlign:"center",color:B.textMuted,fontFamily:"'Nunito', sans-serif",padding:"40px 0"}}>Start the conversation! 💙</div>:
        messages.map(msg=>{
          const isMe=msg.sender_id===thread.my_id;
          return(
            <div key={msg.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"75%",background:isMe?B.blue:"white",color:isMe?"white":B.text,borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
                <div style={{fontSize:14,fontFamily:"'Nunito', sans-serif",fontWeight:600,lineHeight:1.5}}>{msg.content}</div>
                <div style={{fontSize:10,opacity:0.6,marginTop:4,fontFamily:"'Nunito', sans-serif"}}>{new Date(msg.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:`1px solid ${B.warmGray}`,padding:"12px 16px 32px",display:"flex",gap:10,alignItems:"center"}}>
        <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Send a message..." style={{flex:1,padding:"12px 16px",borderRadius:24,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",color:B.text}}/>
        <button onClick={send} style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,border:"none",color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
      </div>
    </div>
  );
};

const MessagesScreen=({session,onOpenThread,notifications=[],onOpenNotifications})=>{
  const[threads,setThreads]=useState([]);
  const[loading,setLoading]=useState(true);
  const deleteThread=async(e,recipientId)=>{
    e.stopPropagation();
    await supabase.from("messages").delete().eq("sender_id",session.user.id).eq("recipient_id",recipientId);
    await supabase.from("messages").delete().eq("sender_id",recipientId).eq("recipient_id",session.user.id);
    loadThreads();
  };

  const loadThreads=async()=>{
    if(!session?.user?.id)return;
    const{data}=await supabase.from("messages").select("*").or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`).order("created_at",{ascending:false});
    if(data){
      const seen=new Set();const grouped=[];
      data.forEach(msg=>{
        const otherId=msg.sender_id===session.user.id?msg.recipient_id:msg.sender_id;
        if(!seen.has(otherId)){seen.add(otherId);grouped.push({id:otherId,my_id:session.user.id,recipient_id:otherId,name:"Neighbor",initials:"N",lastMessage:msg.content,time:new Date(msg.created_at).toLocaleDateString(),unread:!msg.read&&msg.recipient_id===session.user.id,post_id:msg.post_id});}
      });
      setThreads(grouped);
    }
    setLoading(false);
  };
  useEffect(()=>{
    loadThreads();
    const sub=supabase.channel("msg-list-v4").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},()=>loadThreads()).subscribe();
    return()=>sub.unsubscribe();
  },[session]);
  return(
    <div style={{minHeight:"100vh",background:B.offWhite,paddingBottom:100}}>
      <div style={{background:"white",padding:"52px 20px 16px",borderBottom:`1px solid ${B.warmGray}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2 style={{fontSize:22,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",margin:0}}>Messages 💬</h2>
        <button onClick={onOpenNotifications} style={{background:"none",border:"none",cursor:"pointer",position:"relative",padding:4}}>
          <span style={{fontSize:24}}>🔔</span>
          {notifications.filter(n=>!n.read).length>0&&<div style={{position:"absolute",top:0,right:0,width:16,height:16,borderRadius:"50%",background:"#e91e8c",color:"white",fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito', sans-serif"}}>{notifications.filter(n=>!n.read).length}</div>}
        </button>
      </div>
      <div style={{padding:"16px"}}>
        {loading?<div style={{textAlign:"center",padding:"40px 0",color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>Loading... 🌱</div>:
        threads.length===0?(
          <div style={{textAlign:"center",padding:"60px 20px",color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>
            <div style={{fontSize:48,marginBottom:16}}>💬</div>
            <div style={{fontWeight:700,fontSize:16}}>No messages yet</div>
            <div style={{fontSize:14,marginTop:8}}>When you connect with a neighbor, your conversation will appear here.</div>
          </div>
        ):threads.map(thread=>(
          <div key={thread.id} style={{background:"white",borderRadius:16,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
            <div onClick={()=>onOpenThread(thread)} style={{display:"flex",alignItems:"center",gap:12,flex:1,cursor:"pointer",minWidth:0}}>
              <Avatar initials={thread.initials} size={46}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={{fontWeight:800,fontSize:15,color:B.text,fontFamily:"'Nunito', sans-serif"}}>{thread.name}</div>
                  <div style={{fontSize:11,color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>{thread.time}</div>
                </div>
                <div style={{fontSize:13,color:thread.unread?B.text:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:thread.unread?700:600,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{thread.lastMessage}</div>
              </div>
              {thread.unread&&<div style={{width:10,height:10,borderRadius:"50%",background:B.blue,flexShrink:0}}/>}
            </div>
            <button onClick={(e)=>deleteThread(e,thread.recipient_id)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",color:B.textMuted,fontSize:18,flexShrink:0}}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileTab=({userProfile,setUserProfile,session,onChangeLocation})=>{
  const[editing,setEditing]=useState(false);
  const[name,setName]=useState(userProfile?.name||"");
  const[zip,setZip]=useState(userProfile?.zip||"");
  const[role,setRole]=useState(userProfile?.role||"both");
  const[photoPreview,setPhotoPreview]=useState(userProfile?.photoPreview||null);
  const[photoFile,setPhotoFile]=useState(null);
  const[loading,setLoading]=useState(false);
  const fileRef=useRef(null);
  const city=getCityFromZip(zip);
  const handlePhoto=(e)=>{const file=e.target.files[0];if(file){setPhotoFile(file);const reader=new FileReader();reader.onload=(ev)=>setPhotoPreview(ev.target.result);reader.readAsDataURL(file);}};
  const saveProfile=async()=>{
    setLoading(true);
    const coords=getCoordsFromZip(zip);
    let avatarUrl=userProfile?.photoPreview;
    if(photoFile)avatarUrl=await uploadAvatar(photoFile,session.user.id);
    await supabase.from("profiles").upsert({id:session.user.id,name,zip,city,role,avatar_url:avatarUrl,latitude:coords?coords[0]:null,longitude:coords?coords[1]:null});
    setUserProfile({...userProfile,name,zip,city,role,photoPreview:avatarUrl,coords});
    setEditing(false);setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:B.offWhite,paddingBottom:100}}>
      <div style={{background:"white",padding:"52px 20px 16px",borderBottom:`1px solid ${B.warmGray}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2 style={{fontSize:22,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",margin:0}}>Profile 👤</h2>
        <button onClick={()=>setEditing(!editing)} style={{background:"none",border:`2px solid ${B.blue}`,borderRadius:20,padding:"6px 16px",color:B.blue,fontWeight:800,fontSize:13,fontFamily:"'Nunito', sans-serif",cursor:"pointer"}}>{editing?"Cancel":"Edit"}</button>
      </div>
      <div style={{padding:24,display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div onClick={()=>editing&&fileRef.current.click()} style={{cursor:editing?"pointer":"default",position:"relative"}}>
          <Avatar src={photoPreview} initials={(userProfile?.name||"Y").charAt(0)} size={90}/>
          {editing&&<div style={{position:"absolute",bottom:0,right:0,background:B.blue,borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📷</div>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
        {editing?(
          <div style={{width:"100%",display:"flex",flexDirection:"column",gap:16}}>
            {[{label:"First name",value:name,onChange:e=>setName(e.target.value),placeholder:"Your first name"},{label:"Home zip code",value:zip,onChange:e=>setZip(e.target.value.replace(/\D/g,"")),placeholder:"e.g. 76010",maxLength:5}].map(field=>(
              <div key={field.label}>
                <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:6}}>{field.label}</label>
                <input {...field} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",background:"white",boxSizing:"border-box",color:B.text}}/>
                {field.label==="Home zip code"&&city&&<p style={{fontSize:12,color:B.blue,fontFamily:"'Nunito', sans-serif",fontWeight:700,marginTop:4}}>📍 {city}</p>}
              </div>
            ))}
            <div>
              <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:8}}>I'm here to…</label>
              <div style={{display:"flex",gap:8}}>
                {[{id:"both",label:"Both 🤝"},{id:"help",label:"Give 💙"},{id:"receive",label:"Receive 🙏"}].map(r=>(
                  <button key={r.id} onClick={()=>setRole(r.id)} style={{flex:1,padding:"10px 4px",borderRadius:12,border:`2px solid ${role===r.id?B.blue:B.warmGray}`,background:role===r.id?B.blueLight:"white",cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"'Nunito', sans-serif",color:role===r.id?B.blue:B.text}}>{r.label}</button>
                ))}
              </div>
            </div>
            <Btn onClick={saveProfile} disabled={loading}>{loading?"Saving...":"Save changes ✅"}</Btn>
          </div>
        ):(
          <>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif"}}>{userProfile?.name}</div>
              <div style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:600,marginTop:4}}>📍 {userProfile?.city}</div>
            </div>
            <div style={{background:B.blueLight,borderRadius:14,padding:"12px 20px",width:"100%",textAlign:"center"}}>
              <div style={{fontSize:13,color:B.blue,fontFamily:"'Nunito', sans-serif",fontWeight:700}}>
                {userProfile?.role==="help"?"💙 Here to give help":userProfile?.role==="receive"?"🙏 Here to receive help":"🤝 Here to give & receive help"}
              </div>
            </div>
            <div style={{width:"100%",marginTop:8}}>
              <Btn onClick={onChangeLocation} variant="ghost">📍 Change current location</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ReportModal=({post,onClose,onReport,onBlock})=>{
  const[step,setStep]=useState("menu");
  const[reason,setReason]=useState("");
  const[details,setDetails]=useState("");
  const[done,setDone]=useState(false);
  const reasons=["Spam or fake post","Harassment or threatening behavior","Inappropriate content","Scam or fraudulent activity","Other"];
  if(done)return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div style={{background:"white",borderRadius:20,padding:28,width:"100%",maxWidth:340,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>✅</div>
        <h3 style={{fontSize:18,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>Report submitted</h3>
        <p style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginBottom:20}}>Thank you for helping keep A Little Help?! safe. We'll review this report promptly.</p>
        <Btn onClick={onClose}>Done</Btn>
      </div>
    </div>
  );
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:"24px 24px 0 0",padding:"28px 24px 48px",width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
        {step==="menu"&&(
          <>
            <h3 style={{fontSize:18,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:6}}>What would you like to do?</h3>
            <p style={{fontSize:13,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginBottom:20}}>re: post by {post.user_name}</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>setStep("report")} style={{padding:"14px 16px",borderRadius:14,border:`2px solid ${B.warmGray}`,background:"white",textAlign:"left",cursor:"pointer",fontFamily:"'Nunito', sans-serif",fontWeight:700,fontSize:15,color:B.text}}>🚩 Report this user</button>
              <button onClick={()=>onBlock(post.user_id)} style={{padding:"14px 16px",borderRadius:14,border:`2px solid ${B.redLight}`,background:B.redLight,textAlign:"left",cursor:"pointer",fontFamily:"'Nunito', sans-serif",fontWeight:700,fontSize:15,color:B.red}}>🚫 Block this user</button>
              <p style={{fontSize:12,color:B.textMuted,fontFamily:"'Nunito', sans-serif",textAlign:"center",marginTop:4}}>Blocking hides their posts from your feed. Reporting alerts our team.</p>
            </div>
          </>
        )}
        {step==="report"&&(
          <>
            <h3 style={{fontSize:18,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:16}}>Why are you reporting this?</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {reasons.map(r=>(
                <button key={r} onClick={()=>setReason(r)} style={{padding:"12px 16px",borderRadius:12,border:`2px solid ${reason===r?B.blue:B.warmGray}`,background:reason===r?B.blueLight:"white",textAlign:"left",cursor:"pointer",fontFamily:"'Nunito', sans-serif",fontWeight:700,fontSize:14,color:reason===r?B.blue:B.text}}>{r}</button>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:6}}>Additional details (optional)</label>
              <textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Tell us more..." rows={3} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:14,fontFamily:"'Nunito', sans-serif",outline:"none",boxSizing:"border-box",color:B.text,resize:"none"}}/>
            </div>
            <Btn onClick={async()=>{await onReport(post,reason,details);setDone(true);}} disabled={!reason}>Submit report</Btn>
          </>
        )}
      </div>
    </div>
  );
};

const NotificationsScreen=({notifications,onClose,onRepost,onMarkRead,onDeleteNotification,onMarkComplete,session})=>{
  const unread=notifications.filter(n=>!n.read).length;
  const markAllRead=async()=>{
    await supabase.from("notifications").update({read:true}).eq("user_id",session.user.id).eq("read",false);
    onMarkRead();
  };
  const deleteAll=async()=>{
    await supabase.from("notifications").delete().eq("user_id",session.user.id);
    onMarkRead();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:150,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:"24px 24px 0 0",padding:"28px 24px 48px",width:"100%",maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{fontSize:20,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",margin:0}}>Notifications 🔔</h3>
          <div style={{display:"flex",gap:12}}>
            {unread>0&&<button onClick={markAllRead} style={{background:"none",border:"none",color:B.blue,fontWeight:700,fontSize:13,fontFamily:"'Nunito', sans-serif",cursor:"pointer"}}>Mark all read</button>}
            {notifications.length>0&&<button onClick={deleteAll} style={{background:"none",border:"none",color:B.red,fontWeight:700,fontSize:13,fontFamily:"'Nunito', sans-serif",cursor:"pointer"}}>Delete all</button>}
          </div>
        </div>
        {notifications.length===0?(
          <div style={{textAlign:"center",padding:"40px 0",color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔔</div>
            <div style={{fontWeight:700}}>No notifications yet</div>
          </div>
        ):notifications.map(n=>(
          <div key={n.id} style={{background:n.read?"white":B.blueLight,borderRadius:16,padding:"14px 16px",marginBottom:10,border:`1px solid ${n.read?B.warmGray:B.blue}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:16}}>{n.type==="expired"?"🌱":"⏰"}</span>
              </div>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:B.text,fontFamily:"'Nunito', sans-serif"}}>A Little Help?! Team</div>
                <div style={{fontSize:11,color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>{timeAgo(n.created_at)}</div>
              </div>
              {!n.read&&<div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:B.blue,flexShrink:0}}/>}
            </div>
            <div style={{fontWeight:700,fontSize:14,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:4}}>{n.title}</div>
            <div style={{fontSize:13,color:B.textMuted,fontFamily:"'Nunito', sans-serif",lineHeight:1.5,marginBottom:n.type==="expired"?12:0}}>{n.message}</div>
            {n.type==="expiring"&&(
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={()=>onMarkComplete(n)} style={{flex:1,padding:"8px",borderRadius:10,background:B.greenLight,border:`2px solid ${B.green}`,color:B.green,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>✅ Mark complete</button>
                <button onClick={()=>onDeleteNotification(n.id)} style={{flex:1,padding:"8px",borderRadius:10,background:"none",border:`1px solid ${B.warmGray}`,color:B.textMuted,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>🗑️ Delete</button>
              </div>
            )}
            {n.type==="expired"&&(
              <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
                <button onClick={()=>onRepost(n)} style={{width:"100%",padding:"8px",borderRadius:10,background:B.blue,border:"none",color:"white",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>Post again 🌱</button>
                <button onClick={()=>onDeleteNotification(n.id)} style={{width:"100%",padding:"6px",borderRadius:10,background:"none",border:`1px solid ${B.warmGray}`,color:B.textMuted,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>🗑️ Delete</button>
              </div>
            )}
            {n.type==="broadcast"&&(
              <button onClick={()=>onDeleteNotification(n.id)} style={{width:"100%",padding:"6px",borderRadius:10,background:"none",border:`1px solid ${B.warmGray}`,color:B.textMuted,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Nunito', sans-serif",marginTop:8}}>🗑️ Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminScreen=({session})=>{
  const[activeAdmin,setActiveAdmin]=useState("reports");
  const[reports,setReports]=useState([]);
  const[users,setUsers]=useState([]);
  const[allPosts,setAllPosts]=useState([]);
  const[broadcastTitle,setBroadcastTitle]=useState("");
  const[broadcastMsg,setBroadcastMsg]=useState("");
  const[sending,setSending]=useState(false);
  const[sent,setSent]=useState(false);

  const loadReports=async()=>{
    const{data}=await supabase.from("reports").select("*").order("created_at",{ascending:false});
    if(data)setReports(data);
  };

  const loadAllPosts=async()=>{
    const{data}=await supabase.from("posts").select("*").eq("fulfilled",false).order("created_at",{ascending:false});
    if(data)setAllPosts(data);
  };

  const deleteAnyPost=async(postId)=>{
    await supabase.from("posts").delete().eq("id",postId);
    loadAllPosts();
  };

  const banUser=async(userId)=>{
    await supabase.from("profiles").delete().eq("id",userId);
    await supabase.auth.admin.deleteUser(userId);
    loadReports();
  };

  const sendBroadcast=async()=>{
    if(!broadcastTitle||!broadcastMsg)return;
    setSending(true);
    // Get all user ids
    const{data:profiles}=await supabase.from("profiles").select("id");
    if(profiles){
      for(const profile of profiles){
        await supabase.from("notifications").insert({
          user_id:profile.id,
          title:broadcastTitle,
          message:broadcastMsg,
          type:"broadcast",
          read:false
        });
      }
    }
    await supabase.from("broadcasts").insert({title:broadcastTitle,message:broadcastMsg,sent_by:session.user.id});
    setBroadcastTitle("");setBroadcastMsg("");setSending(false);setSent(true);
    setTimeout(()=>setSent(false),3000);
  };

  useEffect(()=>{
    if(activeAdmin==="reports")loadReports();
    if(activeAdmin==="posts")loadAllPosts();
  },[activeAdmin]);

  const tabs=[{id:"reports",emoji:"🚩",label:"Reports"},{id:"posts",emoji:"🗑️",label:"Posts"},{id:"broadcast",emoji:"📢",label:"Broadcast"}];

  return(
    <div style={{minHeight:"100vh",background:B.offWhite,paddingBottom:100}}>
      <div style={{background:`linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,padding:"52px 20px 16px"}}>
        <h2 style={{fontSize:22,fontWeight:900,color:"white",fontFamily:"'Nunito', sans-serif",margin:"0 0 16px"}}>Admin Panel 👑</h2>
        <div style={{display:"flex",gap:8}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActiveAdmin(t.id)} style={{padding:"6px 14px",borderRadius:99,border:"none",background:activeAdmin===t.id?"white":"rgba(255,255,255,0.2)",color:activeAdmin===t.id?B.blue:"white",fontWeight:800,fontSize:12,fontFamily:"'Nunito', sans-serif",cursor:"pointer"}}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"20px"}}>
        {activeAdmin==="reports"&&(
          <div>
            {reports.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>
                <div style={{fontSize:40,marginBottom:12}}>🚩</div>
                <div style={{fontWeight:700}}>No reports yet</div>
              </div>
            ):reports.map(r=>(
              <div key={r.id} style={{background:"white",borderRadius:16,padding:16,marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <div style={{fontWeight:800,fontSize:14,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:4}}>🚩 {r.reason}</div>
                <div style={{fontSize:13,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>{r.details}</div>
                <div style={{fontSize:11,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginBottom:12}}>Reported user ID: {r.reported_user_id}<br/>Reporter: {r.reporter_id}<br/>{timeAgo(r.created_at)}</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>banUser(r.reported_user_id)} style={{flex:1,padding:"8px",borderRadius:10,background:B.red,border:"none",color:"white",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>🚫 Ban User</button>
                  <button onClick={()=>supabase.from("reports").delete().eq("id",r.id).then(loadReports)} style={{flex:1,padding:"8px",borderRadius:10,background:B.warmGray,border:"none",color:B.textMuted,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>✓ Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeAdmin==="posts"&&(
          <div>
            {allPosts.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>
                <div style={{fontSize:40,marginBottom:12}}>🌱</div>
                <div style={{fontWeight:700}}>No active posts</div>
              </div>
            ):allPosts.map(post=>(
              <div key={post.id} style={{background:"white",borderRadius:16,padding:16,marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <div style={{fontWeight:800,fontSize:14,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:4}}>{post.emoji} {post.title}</div>
                <div style={{fontSize:13,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginBottom:4}}>{post.description}</div>
                <div style={{fontSize:11,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginBottom:12}}>By: {post.user_name} · {post.city} · {timeAgo(post.created_at)}</div>
                <button onClick={()=>deleteAnyPost(post.id)} style={{width:"100%",padding:"8px",borderRadius:10,background:B.redLight,border:`1px solid ${B.red}`,color:B.red,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>🗑️ Delete Post</button>
              </div>
            ))}
          </div>
        )}

        {activeAdmin==="broadcast"&&(
          <div>
            <p style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginBottom:20,lineHeight:1.6}}>Send a message to ALL users. It will appear in their notification bell as a message from A Little Help?! Team.</p>
            {sent&&<div style={{background:B.greenLight,border:`1px solid ${B.green}`,borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:13,color:B.green,fontFamily:"'Nunito', sans-serif",fontWeight:700}}>✅ Broadcast sent to all users!</div>}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:6}}>Title</label>
                <input value={broadcastTitle} onChange={e=>setBroadcastTitle(e.target.value)} placeholder="e.g. Welcome to the beta! 🌱" style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",boxSizing:"border-box",color:B.text}}/>
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:800,color:B.text,fontFamily:"'Nunito', sans-serif",display:"block",marginBottom:6}}>Message</label>
                <textarea value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} placeholder="Your message to the community..." rows={4} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",boxSizing:"border-box",color:B.text,resize:"none"}}/>
              </div>
              <Btn onClick={sendBroadcast} disabled={!broadcastTitle||!broadcastMsg||sending}>{sending?"Sending...":"📢 Send to all users"}</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FeedScreen=({userProfile,setUserProfile,activeTab,setActiveTab,onSignOut,session,currentLocation,onChangeLocation})=>{
  const[posts,setPosts]=useState([]);
  const[loading,setLoading]=useState(true);
  const[activeCategory,setActiveCategory]=useState(null);
  const[radiusMiles,setRadiusMiles]=useState(1);
  const[showPost,setShowPost]=useState(false);
  const[showMessageComposer,setShowMessageComposer]=useState(null);
  const[newMsg,setNewMsg]=useState("");
  const[activeThread,setActiveThread]=useState(null);
  const[unreadCount,setUnreadCount]=useState(0);
  const[confirmDelete,setConfirmDelete]=useState(null);
  const[showReport,setShowReport]=useState(null);
  const[blockedUsers,setBlockedUsers]=useState([]);
  const[kindnessCount,setKindnessCount]=useState(0);
  const[showMenu,setShowMenu]=useState(false);
  const[sortNewest,setSortNewest]=useState(false);
  const[notifications,setNotifications]=useState([]);
  const[showNotifications,setShowNotifications]=useState(false);

  const loadPosts=async()=>{
    setLoading(true);
    const{data,error}=await supabase.from("posts").select("*").eq("fulfilled",false).order("created_at",{ascending:true});
    if(!error&&data){
      const userCoords=currentLocation?.coords;
      const filtered=data.filter(post=>{
        if(!userCoords||!post.latitude||!post.longitude)return true;
        return getDistanceMiles(userCoords[0],userCoords[1],post.latitude,post.longitude)<=radiusMiles;
      });
      setPosts(filtered);
    }
    setLoading(false);
  };

  const loadKindnessCount=async()=>{
    const{data}=await supabase.from("kindness_count").select("count").eq("id",1).single();
    if(data)setKindnessCount(data.count);
  };

  const markCompleteFromNotification=async(n)=>{
    if(n.post_id){
      await supabase.from("posts").update({fulfilled:true}).eq("id",n.post_id);
      await supabase.from("kindness_count").update({count:kindnessCount+1}).eq("id",1);
      setKindnessCount(k=>k+1);
    }
    await supabase.from("notifications").delete().eq("id",n.id);
    loadNotifications();
    loadPosts();
    setShowNotifications(false);
  };

  const deleteNotification=async(notifId)=>{
    await supabase.from("notifications").delete().eq("id",notifId);
    loadNotifications();
  };

  const loadNotifications=async()=>{
    if(!session?.user?.id)return;
    const{data}=await supabase.from("notifications").select("*").eq("user_id",session.user.id).order("created_at",{ascending:false});
    if(data)setNotifications(data);
  };

  const checkPostExpiry=async()=>{
    if(!session?.user?.id)return;
    const now=new Date();
    const day5Warning=new Date(now.getTime()-(5*24*60*60*1000));
    const day7Delete=new Date(now.getTime()-(7*24*60*60*1000));
    // Get user's unfulfilled posts
    const{data:userPosts}=await supabase.from("posts").select("*").eq("user_id",session.user.id).eq("fulfilled",false);
    if(!userPosts)return;
    for(const post of userPosts){
      const createdAt=new Date(post.created_at);
      // Auto-delete posts older than 7 days
      if(createdAt<=day7Delete){
        await supabase.from("posts").delete().eq("id",post.id);
        await supabase.from("notifications").insert({
          user_id:session.user.id,
          title:"Your post has expired 🌱",
          message:`Your post "${post.title}" has been removed after 7 days. If you still need help, tap below to post again!`,
          type:"expired",
          post_id:post.id,
          read:false
        });
      }
      // Warn at 5 days - check if we already sent this warning
      else if(createdAt<=day5Warning){
        const{data:existing}=await supabase.from("notifications").select("id").eq("user_id",session.user.id).eq("post_id",post.id).eq("type","expiring");
        if(!existing||existing.length===0){
          await supabase.from("notifications").insert({
            user_id:session.user.id,
            title:"Your post is expiring soon ⏰",
            message:`Your post "${post.title}" expires in 2 days. Did you get help? Mark it complete or it will be removed.`,
            type:"expiring",
            post_id:post.id,
            read:false
          });
        }
      }
    }
    loadNotifications();
    loadPosts();
  };

  const loadUnreadCount=async()=>{
    if(!session?.user?.id)return;
    const{count}=await supabase.from("messages").select("*",{count:"exact",head:true}).eq("recipient_id",session.user.id).eq("read",false);
    setUnreadCount(count||0);
  };

  const deletePost=async(postId)=>{
    await supabase.from("posts").delete().eq("id",postId);
    setConfirmDelete(null);loadPosts();
  };

  const submitReport=async(post,reason,details)=>{
    await supabase.from("reports").insert({reporter_id:session.user.id,reported_user_id:post.user_id,post_id:post.id,reason,details});
    await fetch(FORMSPREE_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject:"New user report",reporter:session.user.email,reported_user_id:post.user_id,post_title:post.title,reason,details})});
    setShowReport(null);
  };

  const blockUser=async(userId)=>{
    const newBlocked=[...blockedUsers,userId];
    await supabase.from("profiles").update({blocked_users:newBlocked}).eq("id",session.user.id);
    setBlockedUsers(newBlocked);
    setShowReport(null);
  };

  const markFulfilled=async(postId)=>{
    await supabase.from("posts").update({fulfilled:true}).eq("id",postId);
    await supabase.from("kindness_count").update({count:kindnessCount+1}).eq("id",1);
    setKindnessCount(k=>k+1);
    loadPosts();
  };

  useEffect(()=>{loadPosts();},[radiusMiles,currentLocation]);
  useEffect(()=>{loadKindnessCount();},[]);
  useEffect(()=>{loadNotifications();checkPostExpiry();},[session]);
  useEffect(()=>{
    loadUnreadCount();
    const sub=supabase.channel("unread-v4").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},()=>loadUnreadCount()).subscribe();
    return()=>sub.unsubscribe();
  },[session]);

  const sendFirstMessage=async()=>{
    if(!newMsg.trim()||!showMessageComposer)return;
    await supabase.from("messages").insert({sender_id:session.user.id,recipient_id:showMessageComposer.user_id,post_id:showMessageComposer.id,content:newMsg,read:false});
    setShowMessageComposer(null);setNewMsg("");setActiveTab("messages");
  };

  // Sort posts — default oldest first, toggle to newest
  const basePosts=(activeCategory?posts.filter(p=>p.category===activeCategory):posts).filter(p=>!blockedUsers.includes(p.user_id));
  const displayPosts=sortNewest?[...basePosts].reverse():basePosts;

  if(activeThread)return<MessageThreadScreen thread={activeThread} onBack={()=>{setActiveThread(null);loadUnreadCount();}} session={session}/>;

  return(
    <div style={{minHeight:"100vh",background:B.offWhite,paddingBottom:100}}>
      {showMenu&&<HamburgerMenu onClose={()=>setShowMenu(false)} onSignOut={()=>{setShowMenu(false);onSignOut();}}/> }
      {showNotifications&&<NotificationsScreen notifications={notifications} onClose={()=>setShowNotifications(false)} onMarkRead={()=>{loadNotifications();}} onRepost={(n)=>{setShowNotifications(false);setShowPost(true);}} onDeleteNotification={deleteNotification} onMarkComplete={markCompleteFromNotification} session={session}/>}

      {activeTab==="messages"?(
        <MessagesScreen session={session} onOpenThread={(t)=>setActiveThread({...t,my_id:session.user.id})} notifications={notifications} onOpenNotifications={()=>setShowNotifications(true)}/>
      ):activeTab==="admin"?(
        <AdminScreen session={session}/>
      ):activeTab==="profile"?(
        <ProfileTab userProfile={userProfile} setUserProfile={setUserProfile} session={session} onChangeLocation={onChangeLocation}/>
      ):(
        <>
          <div style={{background:"white",padding:"52px 20px 14px",borderBottom:`1px solid ${B.warmGray}`,position:"sticky",top:0,zIndex:10}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:8}}>
              <div style={{flex:1,display:"flex",alignItems:"center"}}>
                <button onClick={()=>setShowMenu(true)} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",flexDirection:"column",gap:5}}>
                  <div style={{width:22,height:2.5,background:B.text,borderRadius:2}}/>
                  <div style={{width:22,height:2.5,background:B.text,borderRadius:2}}/>
                  <div style={{width:22,height:2.5,background:B.text,borderRadius:2}}/>
                </button>
              </div>
              <Logo size={120}/>
              <div style={{flex:1,display:"flex",justifyContent:"flex-end"}}>
                <Avatar src={userProfile?.photoPreview} initials={(userProfile?.name||"Y").charAt(0)} size={56}/>
              </div>
            </div>

            {/* Kindness counter */}
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
              <div style={{border:`2px solid #e91e8c`,borderRadius:12,padding:"5px 12px",background:"white",display:"inline-flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:13}}>🩷</span>
                <span style={{fontSize:12,fontWeight:800,color:"#e91e8c",fontFamily:"'Nunito', sans-serif"}}>{kindnessCount.toLocaleString()}</span>
                <span style={{fontSize:12,fontWeight:700,color:B.blue,fontFamily:"'Nunito', sans-serif"}}>acts of kindness & counting</span>
              </div>
            </div>

            {/* Sort toggle */}
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
              <button onClick={()=>setSortNewest(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:700,padding:"2px 0"}}>
                {sortNewest?"Newest first ↓":"Oldest first ↑"} · tap to change
              </button>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {[1,5,10,25].map(r=>(
                <button key={r} onClick={()=>setRadiusMiles(r)} style={{padding:"4px 12px",borderRadius:99,border:`2px solid ${radiusMiles===r?B.blue:B.warmGray}`,background:radiusMiles===r?B.blueLight:"white",color:radiusMiles===r?B.blue:B.textMuted,fontWeight:700,fontSize:12,fontFamily:"'Nunito', sans-serif",cursor:"pointer"}}>
                  {r} mi
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
              {[{id:null,emoji:"✨",label:"All"},...CATEGORIES].map(c=>(
                <button key={c.id} onClick={()=>setActiveCategory(c.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:99,border:`2px solid ${activeCategory===c.id?B.blue:B.warmGray}`,background:activeCategory===c.id?B.blueLight:"white",color:activeCategory===c.id?B.blue:B.textMuted,fontWeight:700,fontSize:13,fontFamily:"'Nunito', sans-serif",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                  <span>{c.emoji}</span><span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{padding:"20px 20px 0"}}>
            <div style={{background:`linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,borderRadius:18,padding:"14px 20px",display:"flex",alignItems:"center",gap:16,color:"white",boxShadow:`0 4px 20px ${B.blue}40`,marginBottom:20}}>
              <div style={{fontSize:26}}>📍</div>
              <div>
                <div style={{fontSize:24,fontWeight:900,letterSpacing:"-1px",fontFamily:"'Nunito', sans-serif"}}>{posts.length}</div>
                <div style={{fontSize:12,opacity:0.9,fontWeight:600,fontFamily:"'Nunito', sans-serif"}}>active posts near you</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:11,opacity:0.75,textAlign:"right",fontFamily:"'Nunito', sans-serif"}}>within {radiusMiles} mile{radiusMiles>1?"s":""} ✨</div>
            </div>

            {loading?<div style={{textAlign:"center",padding:"40px 0",color:B.textMuted,fontFamily:"'Nunito', sans-serif",fontWeight:600}}>Loading posts... 🌱</div>:
            displayPosts.length===0?(
              <div style={{textAlign:"center",padding:"40px 20px",color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>
                <div style={{fontSize:48,marginBottom:16}}>🌱</div>
                <div style={{fontWeight:700,fontSize:16}}>No posts yet in your area</div>
                <div style={{fontSize:14,marginTop:8}}>Be the first! Tap + to post a request or offer.</div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {displayPosts.map(post=>(
                  <div key={post.id} style={{background:"white",borderRadius:20,padding:20,boxShadow:"0 2px 16px rgba(0,0,0,0.07)",border:`1px solid ${B.warmGray}`,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,width:4,height:"100%",background:post.type==="request"?B.blue:B.green,borderRadius:"4px 0 0 4px"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <Avatar initials={post.user_initials||"N"} size={36}/>
                        <div>
                          <div style={{fontWeight:700,fontSize:14,color:B.text,fontFamily:"'Nunito', sans-serif"}}>{post.user_name||"Neighbor"}</div>
                          {/* CHANGE 2: Use timeAgo for friendly timestamps */}
                          <div style={{fontSize:11,color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>📍 {post.city} · {timeAgo(post.created_at)}</div>
                        </div>
                      </div>
                      <span style={{background:post.type==="request"?B.blueLight:B.greenLight,color:post.type==="request"?B.blue:B.green,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:800,fontFamily:"'Nunito', sans-serif"}}>
                        {post.type==="request"?"NEEDS HELP":"OFFERING"}
                      </span>
                    </div>
                    <div style={{fontSize:15,fontWeight:800,color:B.text,marginBottom:6,fontFamily:"'Nunito', sans-serif"}}>{post.emoji} {post.title}</div>
                    <div style={{fontSize:13,color:B.textMuted,lineHeight:1.5,marginBottom:14,fontFamily:"'Nunito', sans-serif"}}>{post.description}</div>
                    {post.user_id!==session?.user?.id?(
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <button onClick={()=>setShowMessageComposer(post)} style={{width:"100%",padding:"10px",borderRadius:12,border:`2px solid ${B.blue}`,background:B.blue,color:"white",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>
                          {post.type==="request"?"💙 I can help!":"🙌 I'd love that!"}
                        </button>
                        <button onClick={()=>setShowReport(post)} style={{width:"100%",padding:"7px",borderRadius:12,border:"none",background:"transparent",color:B.textMuted,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>🚩 Report or block this user</button>
                      </div>
                    ):(
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>markFulfilled(post.id)} style={{flex:2,padding:"8px 12px",borderRadius:12,background:B.greenLight,border:`2px solid ${B.green}`,color:B.green,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>✅ Help received!</button>
                        <button onClick={()=>setConfirmDelete(post.id)} style={{flex:1,padding:"8px 12px",borderRadius:12,background:B.redLight,border:"none",color:B.red,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito', sans-serif"}}>🗑️ Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showReport&&<ReportModal post={showReport} onClose={()=>setShowReport(null)} onReport={submitReport} onBlock={blockUser}/>}

      {confirmDelete&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}} onClick={()=>setConfirmDelete(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:20,padding:24,width:"100%",maxWidth:340}}>
            <h3 style={{fontSize:18,fontWeight:900,color:B.text,fontFamily:"'Nunito', sans-serif",marginBottom:8}}>Delete this post?</h3>
            <p style={{fontSize:14,color:B.textMuted,fontFamily:"'Nunito', sans-serif",marginBottom:20}}>This will permanently remove your post from the feed.</p>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>setConfirmDelete(null)} variant="ghost" style={{flex:1}}>Cancel</Btn>
              <Btn onClick={()=>deletePost(confirmDelete)} variant="danger" style={{flex:1}}>Delete</Btn>
            </div>
          </div>
        </div>
      )}

      {showMessageComposer&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowMessageComposer(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:"24px 24px 0 0",padding:"28px 24px 48px",width:"100%"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <Avatar initials={showMessageComposer.user_initials||"N"} size={44}/>
              <div>
                <div style={{fontWeight:900,fontSize:16,color:B.text,fontFamily:"'Nunito', sans-serif"}}>Message {showMessageComposer.user_name}</div>
                <div style={{fontSize:12,color:B.textMuted,fontFamily:"'Nunito', sans-serif"}}>re: {showMessageComposer.title}</div>
              </div>
            </div>
            <textarea value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder={`Say hi to ${showMessageComposer.user_name}...`} rows={3} style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`2px solid ${B.warmGray}`,fontSize:15,fontFamily:"'Nunito', sans-serif",fontWeight:600,outline:"none",boxSizing:"border-box",color:B.text,resize:"none",marginBottom:16}}/>
            <Btn onClick={sendFirstMessage} disabled={!newMsg.trim()}>Send message 💙</Btn>
          </div>
        </div>
      )}

      {showPost&&<CreatePostModal onClose={()=>setShowPost(false)} onPost={loadPosts} userProfile={userProfile} session={session} currentLocation={currentLocation}/>}

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:`1px solid ${B.warmGray}`,padding:"10px 0 24px",display:"flex",justifyContent:"space-around",zIndex:20}}>
        {[{id:"feed",emoji:"🏠",label:"Feed"},{id:"messages",emoji:"💬",label:"Messages",badge:unreadCount+notifications.filter(n=>!n.read).length},{id:"profile",emoji:"👤",label:"Profile"},...(session?.user?.email===ADMIN_EMAIL?[{id:"admin",emoji:"👑",label:"Admin"}]:[])].map(item=>(
          <div key={item.id} onClick={()=>setActiveTab(item.id)} style={{textAlign:"center",cursor:"pointer",position:"relative"}}>
            <div style={{fontSize:22}}>{item.emoji}</div>
            {item.badge>0&&<div style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:B.blue,color:"white",fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito', sans-serif"}}>{item.badge}</div>}
            <div style={{fontSize:11,fontWeight:800,fontFamily:"'Nunito', sans-serif",color:activeTab===item.id?B.blue:B.textMuted,marginTop:2}}>{item.label}</div>
          </div>
        ))}
      </div>
      {activeTab==="feed"&&<button onClick={()=>setShowPost(true)} style={{position:"fixed",bottom:86,right:20,width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg, ${B.blue}, ${B.blueDark})`,border:"none",color:"white",fontSize:28,cursor:"pointer",boxShadow:`0 6px 20px ${B.blue}60`,display:"flex",alignItems:"center",justifyContent:"center",zIndex:30}}>+</button>}
    </div>
  );
};

export default function App(){
  const[screen,setScreen]=useState("splash");
  const[onboardStep,setOnboardStep]=useState(0);
  const[userProfile,setUserProfile]=useState(null);
  const[currentLocation,setCurrentLocation]=useState(null);
  const[activeTab,setActiveTab]=useState("feed");
  const[session,setSession]=useState(null);
  const[checkingAuth,setCheckingAuth]=useState(true);

  const loadProfile=async(sess)=>{
    if(!sess)return false;
    const{data}=await supabase.from("profiles").select("*").eq("id",sess.user.id).single();
    if(data){setUserProfile({name:data.name,zip:data.zip,city:data.city,role:data.role,photoPreview:data.avatar_url||null,coords:data.latitude?[data.latitude,data.longitude]:null});return true;}
    return false;
  };

  useEffect(()=>{
    supabase.auth.getSession().then(async({data:{session}})=>{
      setSession(session);
      if(session){const hasProfile=await loadProfile(session);setScreen(hasProfile?"location":"profile");}
      setCheckingAuth(false);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setSession(session);});
    return()=>subscription.unsubscribe();
  },[]);

  const handleSignOut=async()=>{await supabase.auth.signOut();setSession(null);setUserProfile(null);setCurrentLocation(null);setScreen("splash");};

  const handleAuth=async()=>{
    const{data:{session}}=await supabase.auth.getSession();
    setSession(session);
    if(session){const hasProfile=await loadProfile(session);setScreen(hasProfile?"location":"profile");}
  };

  if(checkingAuth)return<div style={{minHeight:"100vh",background:B.offWhite,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:48}}>🌱</div></div>;

  if(!session&&screen!=="splash"&&screen!=="agegate"&&screen!=="under18"&&screen!=="onboard"&&screen!=="disclaimers"){
    return<AuthScreen onAuth={handleAuth}/>;
  }

  if(screen==="splash")return<SplashScreen onNext={()=>setScreen("agegate")}/>;
  if(screen==="agegate")return<AgeGateScreen onConfirm={()=>setScreen("onboard")} onDecline={()=>setScreen("under18")}/>;
  if(screen==="under18")return<Under18Screen/>;
  if(screen==="onboard")return<OnboardingScreen step={onboardStep} onNext={()=>{if(onboardStep===2)setScreen("disclaimers");else setOnboardStep(s=>s+1);}} onBack={()=>onboardStep===0?setScreen("agegate"):setOnboardStep(s=>s-1)}/>;
  if(screen==="disclaimers")return<DisclaimerScreen onNext={()=>session?setScreen("location"):setScreen("auth")}/>;
  if(screen==="auth")return<AuthScreen onAuth={handleAuth}/>;
  if(screen==="profile")return<ProfileScreen onNext={()=>setScreen("location")} session={session} setUserProfile={setUserProfile}/>;
  if(screen==="location")return<LocationPromptScreen userProfile={userProfile} onConfirm={(loc)=>{setCurrentLocation(loc);setScreen("feed");}}/>;
  if(screen==="feed")return<FeedScreen userProfile={userProfile} setUserProfile={setUserProfile} activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} session={session} currentLocation={currentLocation} onChangeLocation={()=>setScreen("location")}/>;
  return null;
}
