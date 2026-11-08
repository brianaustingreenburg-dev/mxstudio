/* MX Studio ✝ — guest gift coupons + waiter credit. No server: the code itself carries
   who served, the day it was issued and a check tied to the restaurant, so the owner's
   panel can verify it offline. Gift is for everyone (not tied to a review) — Google-safe. */
(function(){
 const A="23456789ABCDEFGHJKLMNPQRSTUVWXYZ",EP=Date.UTC(2026,0,1),DAY=864e5;
 const h10=(s)=>{let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)>>>0}return x&1023};
 const enc=(n,len)=>{let o="";for(let i=0;i<len;i++){o=A[n&31]+o;n=Math.floor(n/32)}return o};
 const dec=(s)=>{let n=0;for(const c of s){const v=A.indexOf(c);if(v<0)return -1;n=n*32+v}return n};
 const today=()=>Math.floor((Date.now()-EP)/DAY);
 window.MXL={
  today,
  dayToDate:(d)=>new Date(EP+d*DAY),
  /* staff: index in the owner's list (0–14), or 15 = not chosen; stars: private 1–5 rating (0 = none) */
  make(slug,staff,stars){const s=(staff>=0&&staff<15)?staff:15,d=today()&4095,k=(stars>=1&&stars<=5)?stars:0,r=k*64+Math.floor(Math.random()*64);
   const p=s*2097152+d*512+r;const c=h10(slug+":"+p);const code=enc(p,5)+enc(c,2);return code.slice(0,3)+"-"+code.slice(3)},
  read(slug,code){const k=String(code||"").toUpperCase().replace(/[^A-Z0-9]/g,"").replace(/O/g,"0").replace(/I/g,"1");
   if(k.length!==7)return null;const p=dec(k.slice(0,5)),c=dec(k.slice(5));if(p<0||c<0||h10(slug+":"+p)!==c)return null;
   const s=Math.floor(p/2097152),d=Math.floor(p/512)%4096,t=today();let day=t-((t-d)&4095);
   const q=Math.floor((p%512)/64);return {staff:s===15?-1:s,day,stars:q>=1&&q<=5?q:0,code:k.slice(0,3)+"-"+k.slice(3)}}
 };
})();
