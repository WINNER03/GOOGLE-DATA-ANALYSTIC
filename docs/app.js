
"use strict";

// FlightScope: zero-dependency, client-side flight analytics.
// Data columns: [month,day,origin,dest,carrier,dep_delay,arr_delay,hour,distance].
(() => {
  const raw = window.FLIGHT_DATA;
  const $ = (id) => document.getElementById(id);
  const numberFmt = new Intl.NumberFormat("en-US");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const get = (r) => ({
    month:r[0],day:r[1],origin:r[2],dest:r[3],carrier:r[4],
    dep:r[5],arr:r[6],hour:r[7],distance:r[8]
  });
  const state = {airport:"ALL",month:"ALL",carrier:"ALL",route:""};
  const pct = (v) => v == null ? "—" : v.toFixed(1)+"%";
  const mins = (v) => v == null ? "—" : v.toFixed(1)+" min";
  const safe = (s) => String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const isNumeric = (v) => typeof v === "number" && Number.isFinite(v);
  let filtered = [];

  if (!Array.isArray(raw) || raw.length === 0) {
    $("data-status").textContent = "Dataset unavailable. Verify docs/data/flights.js exists and reload the page.";
    $("data-status").style.color = "#ff827e";
    $("download").disabled = true;
    return;
  }

  function makeOptions(id, values, format = (x)=>x) {
    const el=$(id);
    for (const value of values) {
      const opt=document.createElement("option");
      opt.value=String(value);
      opt.textContent=format(value);
      el.appendChild(opt);
    }
  }
  makeOptions("airport", [...new Set(raw.map((r)=>r[2]))].sort());
  makeOptions("carrier", [...new Set(raw.map((r)=>r[4]))].sort());
  makeOptions("month", MONTHS.map((_,i)=>i+1), (m)=>MONTHS[m-1]);

  function stats(rows) {
    let valid=0, late=0, delaySum=0;
    const delayValues=[];
    for(const row of rows) {
      const arr=row[6];
      if(isNumeric(arr)) {
        valid++;delaySum+=arr;delayValues.push(arr);
        if(arr>15)late++;
      }
    }
    delayValues.sort((a,b)=>a-b);
    const n=delayValues.length;
    const median=n ? (delayValues[Math.floor((n-1)/2)]+delayValues[Math.floor(n/2)])/2 : null;
    return {total:rows.length,valid,late,rate:valid?late*100/valid:null,mean:valid?delaySum/valid:null,median};
  }

  // One scan, separate maps by grouping key.
  function groups(rows, field) {
    const grouped=new Map();
    for(const r of rows) {
      let key;
      if(field==="month") key=r[0];
      if(field==="origin") key=r[2];
      if(field==="carrier") key=r[4];
      if(field==="hour") key=r[7];
      if(field==="route") key=r[2]+"-"+r[3];
      if(key==null) continue;
      if(!grouped.has(key)) grouped.set(key,{key,total:0,valid:0,late:0,sum:0});
      const g=grouped.get(key);
      g.total++;
      if(isNumeric(r[6])) {
        g.valid++;g.sum+=r[6];
        if(r[6]>15)g.late++;
      }
    }
    return [...grouped.values()].map((g)=>({
      ...g, rate:g.valid?100*g.late/g.valid:null,
      mean:g.valid?g.sum/g.valid:null
    }));
  }

  function setEmpty(id, message="No matching records to display.") {
    $(id).innerHTML='<div class="empty">'+safe(message)+'</div>';
  }

  function lineChart(id, groupsData, keys, labelFor) {
    const byKey=new Map(groupsData.map((g)=>[g.key,g]));
    const points=keys.map((key)=>({key,value:byKey.get(key)?.rate??null}));
    const valid=points.filter((p)=>p.value!=null);
    if(!valid.length) return setEmpty(id);
    const W=800,H=265,L=50,T=24,R=24,B=43;
    const plotW=W-L-R,plotH=H-T-B;
    const max=Math.max(...valid.map((p)=>p.value),5);
    const yMax=Math.min(100,Math.max(10,Math.ceil(max/10)*10));
    const xFor=(i)=>L+(keys.length===1?0.5:i/(keys.length-1))*plotW;
    const yFor=(v)=>T+(1-v/yMax)*plotH;
    let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Late arrival percentage plotted by '+safe(id==="chart-months"?"month":"departure hour")+'">';
    for(let i=0;i<=4;i++) {
      const v=yMax*i/4,y=yFor(v);
      svg+='<line class="gridline" x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'"/>';
      svg+='<text class="axis-text" x="'+(L-10)+'" y="'+(y+4)+'" text-anchor="end">'+v.toFixed(0)+'%</text>';
    }
    // Do not imply missing groups have a zero rate, or join across missing keys.
    let segment=[];
    const segments=[];
    for (let i=0;i<points.length;i++) {
      const p=points[i];
      if(p.value===null) {
        if(segment.length)segments.push(segment);
        segment=[];
      } else segment.push([xFor(i),yFor(p.value)]);
    }
    if(segment.length)segments.push(segment);
    for(const s of segments) if(s.length>1)
      svg+='<path class="trace" d="'+s.map((xy,i)=>(i?"L":"M")+xy[0].toFixed(2)+" "+xy[1].toFixed(2)).join(" ")+'"/>';
    for(let i=0;i<points.length;i++){
      const p=points[i];if(p.value==null)continue;
      svg+='<circle class="point" cx="'+xFor(i)+'" cy="'+yFor(p.value)+'" r="5"><title>'+safe(labelFor(p.key))+': '+p.value.toFixed(1)+'% late</title></circle>';
    }
    for(let i=0;i<keys.length;i++) {
      if(keys.length>15 && i%3!==0 && i!==keys.length-1)continue;
      const x=xFor(i);
      svg+='<text class="axis-text" x="'+x+'" y="'+(H-15)+'" text-anchor="middle">'+safe(labelFor(keys[i]))+'</text>';
    }
    svg+='</svg>';
    $(id).innerHTML=svg;
  }

  function bars(id, values, opts={}) {
    if(!values.length) return setEmpty(id,opts.empty||"Not enough records to compare these groups.");
    const max=Math.max(1,...values.map((v)=>opts.count?v.total:(v.rate??0)));
    const formatter=(v)=>opts.count?numberFmt.format(v.total):pct(v.rate);
    $(id).innerHTML='<div class="bar-list">'+values.map((v)=>{
      const n=opts.count?v.total:v.rate??0;
      const width=n===0?0:Math.max(1,n/max*100);
      return '<div class="bar-row" title="'+safe(String(v.key))+': '+safe(formatter(v))+'">'+
        '<span class="name">'+safe(v.key)+'</span>'+
        '<div class="bar-track"><div class="bar-fill" style="width:'+width.toFixed(2)+'%"></div></div>'+
        '<span class="bar-value">'+formatter(v)+'</span></div>';
    }).join("")+'</div>'+
    (opts.note?'<div class="panel-footer">'+safe(opts.note)+'</div>':"");
  }

  function updateInsights(summary, monthly, airports) {
    const panel=$("insights");
    if(!summary.total || !summary.valid) {
      panel.innerHTML='<p style="color:#9cb1c6">No arrivals with recorded delay match your filters.</p>';
      return;
    }
    const insight=(title,detail)=>'<div class="insight"><strong>'+safe(title)+'</strong><span>'+safe(detail)+'</span></div>';
    const byMonth=monthly.filter((g)=>g.rate!=null).sort((a,b)=>a.rate-b.rate);
    const byOrigin=airports.filter((g)=>g.rate!=null).sort((a,b)=>a.rate-b.rate);
    let content=insight("Late-arrival definition",
      numberFmt.format(summary.late)+" of "+numberFmt.format(summary.valid)+" flights with observed arrival delays were more than 15 minutes late.");
    if(byMonth.length>1){
      content+=insight("Lowest late-rate month",MONTHS[byMonth[0].key-1]+" — "+pct(byMonth[0].rate)+" across "+numberFmt.format(byMonth[0].valid)+" observed arrivals.");
      content+=insight("Highest late-rate month",MONTHS[byMonth.at(-1).key-1]+" — "+pct(byMonth.at(-1).rate)+" across "+numberFmt.format(byMonth.at(-1).valid)+" observed arrivals.");
    }
    if(byOrigin.length>1){
      content+=insight("Airport comparison",
        byOrigin[0].key+" had the lowest unadjusted late-arrival rate among selected flights: "+pct(byOrigin[0].rate)+".");
    }
    if(content.indexOf("Airport comparison")<0 && byMonth.length<=1)
      content+=insight("Historical sample","Results describe a 2013 sample, not current airport or airline performance.");
    panel.innerHTML=content;
  }

  function updateTable(rows) {
    const tbody=$("flight-rows");
    if(!rows.length){tbody.innerHTML='<tr><td colspan="5">No matching flights.</td></tr>';return;}
    tbody.innerHTML=rows.slice(0,10).map((r)=>{
      const a=get(r);
      const arriving=isNumeric(a.arr)?a.arr:null;
      const departed=isNumeric(a.dep)?a.dep:null;
      function cellDelay(delay){
        if(delay==null)return '<span class="tag neutral">N/A</span>';
        const cls=delay>15?"late":delay<0?"early":"neutral";
        const name=delay>0?"+"+delay:delay;
        return '<span class="tag '+cls+'">'+name+' min</span>';
      }
      return '<tr><td>'+MONTHS[a.month-1]+' '+a.day+'</td><td>'+safe(a.origin)+' → '+safe(a.dest)+'</td><td>'+safe(a.carrier)+'</td><td>'+cellDelay(departed)+'</td><td>'+cellDelay(arriving)+'</td></tr>';
    }).join("");
  }

  function update() {
    filtered=raw.filter((r)=>{
      if(state.airport!=="ALL" && r[2]!==state.airport) return false;
      if(state.month!=="ALL" && String(r[0])!==state.month) return false;
      if(state.carrier!=="ALL" && r[4]!==state.carrier) return false;
      if(state.route){
        const route=(r[2]+"-"+r[3]).toUpperCase();
        if(!route.includes(state.route)) return false;
      }
      return true;
    });

    const s=stats(filtered);
    $("metric-total").textContent=numberFmt.format(s.total);
    $("metric-late").textContent=pct(s.rate);
    $("metric-mean").textContent=mins(s.mean);
    $("metric-median").textContent=mins(s.median);
    $("showing").textContent=numberFmt.format(s.total)+" of "+numberFmt.format(raw.length)+" flight records · "+numberFmt.format(s.valid)+" with known arrival delay";
    $("download").disabled=!filtered.length;

    const monthly=groups(filtered,"month"),airports=groups(filtered,"origin"),
      carriers=groups(filtered,"carrier"),hours=groups(filtered,"hour"),
      routes=groups(filtered,"route");

    lineChart("chart-months",monthly,Array.from({length:12},(_,i)=>i+1),(key)=>MONTHS[key-1]);
    lineChart("chart-hours",hours,Array.from({length:25},(_,i)=>i),(key)=>String(key));
    bars("chart-airports",airports.sort((a,b)=>a.key.localeCompare(b.key)));
    bars("chart-carriers",carriers.filter((g)=>g.valid>=100).sort((a,b)=>b.valid-a.valid).slice(0,8),{
      note:"Minimum: 100 flights with recorded arrival delays per carrier. Unadjusted rates."
    });
    bars("chart-routes",routes.sort((a,b)=>b.total-a.total).slice(0,8),{count:true,note:"Counts are from this historical sample only."});
    updateInsights(s,monthly,airports);
    updateTable(filtered);
  }

  function downloadCsv() {
    if(!filtered.length)return;
    const lines=["year,month,day,origin,dest,carrier,departure_delay_min,arrival_delay_min,departure_hour,distance_miles"];
    for(const r of filtered) lines.push(["2013",...r].map((v)=>v==null?"":String(v)).join(","));
    const blob=new Blob([lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="flightscope_filtered_2013.csv";document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  for(const id of ["airport","month","carrier"]) {
    $(id).addEventListener("change",(event)=>{state[id]=event.target.value;update();});
  }
  $("route").addEventListener("input",(event)=>{
    state.route=event.target.value.toUpperCase().trim().replace(/\s+/g,"").replace(/→/g,"-");
    update();
  });
  $("reset").addEventListener("click",()=>{
    for(const id of ["airport","month","carrier"]){$(id).value="ALL";state[id]="ALL";}
    $("route").value="";state.route="";update();
  });
  $("download").addEventListener("click",downloadCsv);

  $("data-status").textContent=numberFmt.format(raw.length)+" flight records ready · locally hosted data · no API required";
  update();
})();
