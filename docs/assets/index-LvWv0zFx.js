(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function a(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=a(n);fetch(n.href,r)}})();const N={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://lpzotcznihwyyudxycmd.supabase.co",supabaseKey:"sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07"},V=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),ce="quest-hq-local-session",st="quest-hq-local-profile",ot="quest-hq-job-cache-v2",nt="quest-hq-task-cache-v1",rt="quest-hq-file-cache-v1",lt="quest-hq-team-cache-v1",dt="quest-hq-company-membership-cache-v1",te="quest-hq-company-form-cache-v1",Te="quest-hq-company-form-response-cache-v1",ye="quest-hq-active-company",ct="quest-hq-task-view",pt="quest-hq-drive-view",ut="quest-hq-drive-filter",he=["Lead","Site Review","Estimate","Approved","Active","Closed"],mt=["pipeline","list","profile","editor"],ve=["todo","pending","hold","review","done"],pe=["critical","urgent","high","medium","low"],ft=["lead","bid","admin","invoicing","ar","meeting","web_dev"],bt=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],gt=[["my-drive","My Drive","ti-folder"],["recent","Recent","ti-clock"],["images","Images","ti-photo"],["documents","Documents","ti-file-description"]],_e=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],Pe=["Inspection","Client approval","Intake","Survey","Safety","Internal"],Oe=["Draft","Published","Archived"],$e=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],ae=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],Nt=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],Mt=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"]},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"]},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"]},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"]},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"]}],Jt=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],xt=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:R(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:R(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:R(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:R(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:R(5),priority:"medium",urgency:"medium",status:"todo"}],zt=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],Ht=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],Bt=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],s={route:null,session:Le(ce,null),profileDraft:Le(st,null),jobs:Q(ot,Nt).map(Z),tasks:Q(nt,xt).map(X),files:Q(rt,zt).map(ue),forms:Q(te,Ht).map(Se),formResponses:Q(Te,Bt).map(It),teamMembers:Q(lt,Mt).map(Dt),memberships:Q(dt,Jt),companies:ae,activeCompanyId:localStorage.getItem(ye)||"",selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",query:"",fileQuery:"",formQuery:"",stageFilter:"all",taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(ct)||"table",driveFolder:"home",driveView:localStorage.getItem(pt)||"grid",driveFilter:localStorage.getItem(ut)||"my-drive",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",modal:""},yt=document.getElementById("app");Wt();function Wt(){Ma(),window.addEventListener("popstate",u),document.addEventListener("click",Ca),document.addEventListener("submit",Aa),document.addEventListener("input",La),document.addEventListener("change",Ta),u()}function u(){if(s.route=vt(),Vt(s.route)){g("/login?return_url="+encodeURIComponent(xa()),{replace:!0});return}if(s.route.name==="login"){Ia();return}Kt();const e=Ja(s.route);if(e){g(e,{replace:!0});return}Va(s.route),$t(s.route),s.route.params.get("account")==="profile"&&(s.modal="profile"),document.title=`${za(s.route)} | ${f(p())} | Quest HQ`,yt.innerHTML=Gt(s.route,ht(s.route))}function Vt(e){return e.name==="login"?!1:!s.session}function Kt(){s.dataLoaded||s.dataLoading||(s.dataLoading=!0,Yt().catch(()=>{s.sync={label:"Local fallback",mode:"local"}}).finally(()=>{s.dataLoaded=!0,s.dataLoading=!1,H(),u()}))}async function Yt(){const e=E();if(!e){s.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,i,n,r,d]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*")]);let c=0;t.error||(s.companies=t.data?.length?t.data.map(Xa):ae,c+=1),a.error||(a.data?.length&&(s.jobs=a.data.map(Z)),c+=1),i.error||(i.data?.length&&(s.tasks=i.data.map(X)),c+=1),n.error||(n.data?.length&&(s.files=n.data.map(ue)),c+=1),r.error||(r.data?.length&&(s.teamMembers=r.data.map(Dt)),c+=1),d.error||(d.data?.length&&(s.memberships=d.data.map(ei)),c+=1),s.sync=c?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function E(){return!window.supabase||typeof window.supabase.createClient!="function"?null:window.supabase.createClient(N.supabaseUrl,N.supabaseKey)}function Gt(e,t){const a=D(),i=p();return`
    <div class="quest-app" data-route="${o(e.name)}">
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${m(l("jobs",{},i))}" data-router aria-label="Quest HQ workspace">
            <i class="ti ti-bolt"></i>
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${o(N.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            <i class="ti ti-building"></i>
            <select data-company-switch aria-label="Active company">
              ${kt().map(n=>`<option value="${o(n.id)}" ${n.id===i?"selected":""}>${o(Ee(n))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            <i class="ti ti-search" aria-hidden="true"></i>
            <input data-global-search value="${o(s.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${o(s.sync.mode)}" data-sync-state>${o(s.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          <a class="btn btn-primary" href="${m(l("tasks",{new:"1"},i))}" data-router><i class="ti ti-plus"></i>New task</a>
          <div class="account-menu">
            <button class="avatar-button" type="button" data-action="open-profile" aria-label="Open Quest profile">
              ${Je(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${o(a.profile.full_name)}</strong>
              <span>${o(a.profile.role_label)} - ${o(f(i))}</span>
              <button type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
              <button type="button" data-action="sign-out"><i class="ti ti-logout"></i>Sign out</button>
            </div>
          </div>
        </div>
      </header>
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${Zt(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
    </div>
    ${s.modal==="profile"?Da(a.profile):""}
    ${s.modal==="file-upload"?fa():""}
  `}function Zt(e){const t=p(),a=y(t),i=K(t),n=we(t),r=J(t),d=x(t);return`
    <div class="company-card">
      <span style="background:${o(Y(t))}"></span>
      <strong>${o(f(t))}</strong>
      <small>${o(Qe(t))} workspace</small>
    </div>
    ${De("Workspace",[F(e,l("jobs",{},t),"ti-briefcase","Jobs",a.length),F(e,l("tasks",{},t),"ti-list-check","Tasks",i.length),F(e,l("files",{},t),"ti-folder","Files",n.length),F(e,l("forms",{},t),"ti-clipboard-list","Forms",r.length),F(e,l("analytics",{},t),"ti-chart-bar","Dashboard")])}
    ${De("Company",[F(e,l("users",{},t),"ti-users","Users",d.length),F(e,l("settings",{},t),"ti-settings","Settings")])}
    ${De("Operations",[F(e,l("time",{},t),"ti-clock","My time","3.3h"),F(e,l("approvals",{},t),"ti-user-check","Approvals",0)])}
  `}function De(e,t){return`
    <section class="side-group">
      <div class="side-label">${o(e)}</div>
      <div class="side-items">${t.join("")}</div>
    </section>
  `}function F(e,t,a,i,n=""){return`
    <a class="side-item ${Ha(e,t)?"active":""}" href="${m(t)}" data-router>
      <i class="ti ${o(a)}"></i>
      <span>${o(i)}</span>
      ${n!==""?`<b>${o(String(n))}</b>`:""}
    </a>
  `}function ht(e){if(e.name==="command")return Ke(p());if(e.name!=="company")return Ge(e.name);const t=e.companyId;return e.section==="jobs"?Xt(e,t):e.section==="tasks"?sa(e,t):e.section==="files"?ca(e,t):e.section==="users"?ba(t):e.section==="settings"?ga(t):e.section==="forms"?ya(t):e.section==="analytics"?Ke(t):e.section==="time"||e.section==="approvals"?qa(e.section,t):Ge(e.section)}function Ke(e){const t=y(e),a=K(e),i=a.filter(r=>["critical","urgent"].includes(r.priority)),n=we(e);return`
    ${z("Company dashboard","Live context for this company workspace.",`
      <a class="btn" href="${m(l("files",{},e))}" data-router><i class="ti ti-folder"></i>Open drive</a>
      <a class="btn btn-primary" href="${m(l("tasks",{new:"1"},e))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${oi([["Jobs",t.length],["Open tasks",a.filter(r=>r.status!=="done").length],["Urgent tasks",i.length],["Drive files",n.length]])}
    <section class="dashboard-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Priority work</h2><p>Tasks and jobs filtered by the active company.</p></div>
          <a class="btn" href="${m(l("tasks",{},e))}" data-router>Open tasks</a>
        </div>
        <div class="queue-list">
          ${a.slice(0,6).map(r=>Ct(r)).join("")||b("No tasks in this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Company scope</h2><p>Client-side filtering while auth is disabled.</p></div></div>
        ${M([["Company",f(e)],["Visible users",x(e).length],["Auth mode","Local basic gate"],["RLS status","Prepared, not enforced"]])}
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Job queue</h2><p>Workspace records without leaving the Quest shell.</p></div></div>
        <div class="queue-list">
          ${t.slice(0,8).map(r=>ni(r)).join("")||b("No jobs in this company yet.")}
        </div>
      </article>
    </section>
  `}function Xt(e,t){const a=Ba(e.params.get("tab")),i=Za();return`
    ${z("Jobs","Company job records, clients, scope, and linked work.",`
      <a class="btn" href="${m(l("files",i?{job_id:i.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <a class="btn btn-primary" href="${m(l("jobs",{tab:"editor",...i?{job_id:i.id}:{}},t))}" data-router><i class="ti ti-plus"></i>Add job</a>
    `)}
    <section class="job-toolbar">
      <label>
        <span>Stage</span>
        <select data-stage-filter>
          ${["all"].concat(he).map(n=>`<option value="${o(n)}" ${s.stageFilter===n?"selected":""}>${o(n==="all"?"All stages":n)}</option>`).join("")}
        </select>
      </label>
      <div class="selected-job-chip">
        <span>Selected job</span>
        <strong>${i?o(i.name):"No job selected"}</strong>
      </div>
    </section>
    <nav class="tabbar" aria-label="Job sections">
      ${mt.map(n=>`<a class="${n===a?"active":""}" href="${m(l("jobs",{tab:n,...i?{job_id:i.id}:{}},t))}" data-router>${o(Wa(n))}</a>`).join("")}
    </nav>
    ${ea(a,t,i)}
  `}function ea(e,t,a){return e==="pipeline"?Ye(t):e==="list"?ta(t):e==="profile"?aa(t,a):e==="editor"?ia(t,a):Ye(t)}function Ye(e){const t=St(e);return`
    <section class="job-board">
      ${he.map(a=>{const i=t.filter(n=>n.stage===a);return`
          <article class="job-lane">
            <h2><span>${o(a)}</span><b>${i.length}</b></h2>
            ${i.map(n=>ri(n)).join("")||'<div class="lane-empty">No jobs</div>'}
          </article>
        `}).join("")}
    </section>
  `}function ta(e){const t=St(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Job list</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Tasks</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===s.selectedJobId?"active":""}" type="button" data-select-job="${o(a.id)}">
            <span><strong>${o(a.name)}</strong><small>${o(a.client_name||"No client")} - ${o(a.site_address||"No address")}</small></span>
            <span>${o(a.stage)}</span>
            <span>${Ft(a.priority)}</span>
            <span>${o(a.owner_name||"Unassigned")}</span>
            <span>${o(Ne(a.id))}</span>
            <span>${Qt(a.estimate_total)}</span>
          </button>
        `).join("")||b("No jobs match this view.")}
      </div>
    </section>
  `}function aa(e,t){return t?`
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${o(f(e))} - ${o(t.job_type)}</span>
          <h2>${o(t.name)}</h2>
          <p>${o(t.scope||"No scope written yet.")}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${M([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",Qt(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${m(l("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <a class="btn" href="${m(l("jobs",{tab:"editor",job_id:t.id},e))}" data-router>Edit job</a>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${ne(l("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${Ne(t.id)} linked tasks`)}
          ${ne(l("files",{job_id:t.id},e),"ti-folder","Files",`${qt(t.id)} files`)}
          ${ne(l("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${ne(l("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:b("Create a job to see the profile workspace.")}function ia(e,t){const a=t||ti(e);return`
    <form class="panel job-editor" data-job-form>
      <input type="hidden" name="id" value="${o(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${k("Workspace name","name",a.name,!0)}
      ${j("Company","company_id",e,kt().map(i=>[i.id,Ee(i)]))}
      ${k("Client","client_name",a.client_name)}
      ${k("Contact","contact_name",a.contact_name)}
      ${k("Account owner","owner_name",a.owner_name)}
      ${k("Job type","job_type",a.job_type||"Roofing")}
      ${j("Business status","stage",a.stage||"Lead",he.map(i=>[i,i]))}
      ${j("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(i=>[i,i]))}
      ${k("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${k("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${me("Scope","scope",a.scope,"span-2")}
      ${me("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${o(t.id)}">Delete</button>`:""}
      </div>
    </form>
  `}function sa(e,t){const a=e.jobId?v(e.jobId):null,i=e.params.get("task_id")||s.selectedTaskId,n=i?wt(i):tt(t,a?.id)[0]||null,r=e.params.get("new")==="1"||e.params.get("edit")==="1",d=tt(t,a?.id);return`
    ${z(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${m(l("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${m(l("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${oa(t,a)}
    <section class="task-layout ${r?"editing":""}">
      <article class="panel task-main">
        ${s.taskView==="board"?ra(t,d):na(t,d)}
      </article>
      <aside class="panel detail-panel">
        ${r?da(t,a,e.params.get("edit")==="1"?n:null):la(t,n)}
      </aside>
    </section>
  `}function oa(e,t){return`
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${y(e).map(i=>`<option value="${o(i.id)}" ${t?.id===i.id?"selected":""}>${o(i.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${["all"].concat(ve).map(i=>`<option value="${o(i)}" ${s.taskStatusFilter===i?"selected":""}>${o(i==="all"?"All statuses":G(i))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(pe).map(i=>`<option value="${o(i)}" ${s.taskPriorityFilter===i?"selected":""}>${o(i==="all"?"All priorities":w(i))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${s.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${s.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function na(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===s.selectedTaskId?"active":""}" type="button" data-select-task="${o(a.id)}">
          <span><strong>${o(a.title)}</strong><small>${o(a.description||ke(a.type))}</small></span>
          <span>${o(v(a.project_id)?.name||"Company task")}</span>
          <span>${o(se(a.assignee_id))}</span>
          <span>${At(a.priority)}</span>
          <span>${li(a.status)}</span>
          <span>${W(a.due)}</span>
        </button>
      `).join("")||b("No tasks match this workspace view.")}
    </div>
  `}function ra(e,t){return`
    <div class="task-board">
      ${ve.map(a=>{const i=t.filter(n=>n.status===a);return`
          <section class="task-column">
            <h2><span>${o(G(a))}</span><b>${i.length}</b></h2>
            ${i.map(n=>`
              <button class="task-card priority-${o(n.priority)}" type="button" data-select-task="${o(n.id)}">
                <strong>${o(n.title)}</strong>
                <span>${o(v(n.project_id)?.name||f(e))}</span>
                <small>${o(se(n.assignee_id))} - ${W(n.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function la(e,t){return t?`
    <div class="section-head">
      <div><h2>${o(t.title)}</h2><p>${o(v(t.project_id)?.name||f(e))}</p></div>
      <a class="btn" href="${m(l("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${M([["Status",G(t.status)],["Priority",w(t.priority)],["Type",ke(t.type)],["Assignee",se(t.assignee_id)],["Due",W(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${o(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${b("No task selected.")}
    `}function da(e,t,a){const i=a||ai(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${o(a?i.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${k("Task title","title",i.title,!0)}
      ${j("Job","project_id",i.project_id||"",[["","Company-level task"]].concat(y(e).map(n=>[n.id,n.name])))}
      ${j("Status","status",i.status,ve.map(n=>[n,G(n)]))}
      ${j("Priority","priority",i.priority,pe.map(n=>[n,w(n)]))}
      ${j("Type","type",i.type,ft.map(n=>[n,ke(n)]))}
      ${j("Assignee","assignee_id",i.assignee_id,x(e).map(n=>[n.id,se(n.id)]))}
      ${k("Due date","due",i.due||R(1),!0,"date")}
      ${me("Description","description",i.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${o(a.id)}">Delete</button>`:""}
        <a class="btn" href="${m(l("tasks",{...i.project_id?{job_id:i.project_id}:{}},e))}" data-router>Cancel</a>
      </div>
    </form>
  `}function ca(e,t){const a=e.params.get("folder")||s.driveFolder||"home",i=e.jobId?v(e.jobId):null,n=Lt(t,a,i?.id||""),r=pi(n),d=ci(t);return`
    <section class="tool-page drive-page">
      <div class="tool-strip">
        <div>
          <div class="context-line"><span>${o(f(t))}</span><b>${o(i?i.name:Ae())}</b></div>
          <h1>Company Drive</h1>
        </div>
        <div class="head-actions">
          <button class="btn" type="button" data-action="open-file-upload"><i class="ti ti-upload"></i>Upload</button>
          <a class="btn btn-primary" href="${m(l("jobs",{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
        </div>
      </div>
      <section class="file-metrics">
        ${q("Files",d.count,"Company records")}
        ${q("Used",ee(d.bytes),"Tracked storage")}
        ${q("Job folders",y(t).length,"Workspace folders")}
        ${q("Visible",n.length,i?"Job scoped":Ae())}
      </section>
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div>
            <h2>${o(i?i.name:"Drive browser")}</h2>
            <p>${o(i?`${i.client_name||f(t)} file workspace`:"Company folders, shared files, job packets, photos, and forms.")}</p>
          </div>
          <label class="drive-search">
            <i class="ti ti-search"></i>
            <input data-file-search value="${o(s.fileQuery)}" placeholder="Search drive" />
          </label>
          <button class="btn" type="button" data-action="refresh-data"><i class="ti ti-refresh"></i>Refresh</button>
        </header>
        <div class="drive-shell">
          <aside class="drive-rail">
            ${gt.map(([c,T,C])=>di(c,T,C)).join("")}
            <div class="drive-rail-block">
              <span>Job folder</span>
              <select data-file-job-filter>
                <option value="">All jobs</option>
                ${y(t).map(c=>`<option value="${o(c.id)}" ${i?.id===c.id?"selected":""}>${o(c.name)}</option>`).join("")}
              </select>
            </div>
            <div class="drive-capacity">
              <span>${ee(d.bytes)} of 1 GB</span>
              <b><i style="width:${o(String(Math.min(100,Math.round(d.bytes/1073741824*100))))}%"></i></b>
            </div>
          </aside>
          <div class="drive-main">
            <section class="file-toolbar">
              <label>
                <span>Folder</span>
                <select data-file-folder-filter>
                  <option value="home" ${a==="home"?"selected":""}>Home</option>
                  ${_e.map(([c,T])=>`<option value="${o(c)}" ${a===c?"selected":""}>${o(T)}</option>`).join("")}
                </select>
              </label>
              <label>
                <span>Category</span>
                <select data-file-category-filter>
                  ${bt.map(c=>`<option value="${o(c)}" ${s.fileCategoryFilter===c?"selected":""}>${o(c)}</option>`).join("")}
                </select>
              </label>
              <nav class="breadcrumbs" aria-label="Drive location">
                <a href="${m(l("files",{},t))}" data-router>${o(f(t))}</a>
                ${a!=="home"?`<span>/</span><a href="${m(l("files",{folder:a},t))}" data-router>${o(I(a))}</a>`:""}
                ${i?`<span>/</span><strong>${o(i.name)}</strong>`:""}
              </nav>
              <div class="segmented" role="group" aria-label="Drive view">
                <button class="${s.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Grid</button>
                <button class="${s.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list"></i>List</button>
              </div>
            </section>
            ${a==="home"&&s.driveFilter==="my-drive"&&!i?pa(t):""}
            ${ua(t,n)}
          </div>
          <aside class="drive-details">
            ${ma(r,t)}
          </aside>
        </div>
      </section>
    </section>
  `}function pa(e){const t=y(e);return`
    <section class="drive-section-title">
      <div><h3>Company folders</h3><span>Folders are scoped to ${o(f(e))}</span></div>
    </section>
    <section class="drive-folder-grid">
      ${_e.map(([a,i,n,r])=>`
        <a class="drive-folder-card" href="${m(l("files",{folder:a},e))}" data-router>
          <span class="drive-folder-icon"><i class="ti ${o(r)}"></i></span>
          <strong>${o(i)}</strong>
          <small>${o(n)}</small>
          <em>${o(Lt(e,a).length)} files</em>
        </a>
      `).join("")}
    </section>
    <section class="drive-section-title recent-title">
      <div><h3>Job folders</h3><span>Each job has a linked drive folder.</span></div>
    </section>
    <section class="drive-folder-grid">
      ${t.map(a=>`
        <a class="drive-folder-card" href="${m(l("files",{folder:"jobs",job_id:a.id},e))}" data-router>
          <span class="drive-folder-icon"><i class="ti ti-folder"></i></span>
          <strong>${o(a.name)}</strong>
          <small>${o(a.client_name||f(e))}</small>
          <em>${qt(a.id)} files</em>
        </a>
      `).join("")||b("Create a job workspace to get its file folder.")}
    </section>
  `}function ua(e,t){const a=s.driveFilter==="my-drive"?"Files":Ae();return`
    <section class="drive-section-title recent-title">
      <div><h3>${o(a)}</h3><span>${t.length} visible file${t.length===1?"":"s"}</span></div>
    </section>
    ${s.driveView==="list"?`
      <div class="file-table-live">
        ${t.map(i=>`
          <button type="button" class="file-row-live ${i.id===s.selectedFileId?"active":""}" data-action="select-file" data-file-id="${o(i.id)}">
            <span class="file-type ${o(Pt(i))}">${o(Tt(i).slice(0,3).toUpperCase())}</span>
            <strong>${o(i.file_name)}<span>${o(i.notes||i.object_path||I(i.folder))}</span></strong>
            <span>${o(i.category||I(i.folder))}</span>
            <span>${o(v(i.job_id)?.name||"Company shared")}</span>
            <span>${ee(i.size_bytes)}</span>
          </button>
        `).join("")||b("No files match this Drive view.")}
      </div>
    `:`
      <div class="file-grid-live">
        ${t.map(i=>`
          <button type="button" class="file-card-live ${i.id===s.selectedFileId?"active":""}" data-action="select-file" data-file-id="${o(i.id)}">
            <span class="file-thumb">${Ot(i)}</span>
            <strong>${o(i.file_name)}</strong>
            <span>${o(i.category||I(i.folder))} / ${ee(i.size_bytes)}</span>
          </button>
        `).join("")||b("No files match this Drive view.")}
      </div>
    `}
  `}function ma(e,t){return e?`
    <div class="file-detail-preview">${Ot(e,!0)}</div>
    <h3>${o(e.file_name)}</h3>
    <p>${o(e.notes||v(e.job_id)?.name||I(e.folder))}</p>
    <div class="file-detail-list">
      ${O("Category",e.category||I(e.folder))}
      ${O("Job",v(e.job_id)?.name||"Company shared")}
      ${O("Uploaded by",e.uploaded_by_label||"Quest HQ")}
      ${O("Uploaded",W(e.created_at))}
      ${O("Size",ee(e.size_bytes))}
      ${O("Storage path",e.object_path||"Metadata only")}
    </div>
    <div class="file-detail-actions">
      <button class="btn" type="button" data-action="download-file" data-file-id="${o(e.id)}"><i class="ti ti-download"></i>Download</button>
      <button class="btn danger" type="button" data-action="delete-file" data-file-id="${o(e.id)}"><i class="ti ti-trash"></i>Delete</button>
    </div>
  `:`
      <div class="file-detail-preview"><span class="file-doc-icon"><i class="ti ti-folder-open"></i></span></div>
      <h3>${o(f(t))} Drive</h3>
      <p>Pick a file to see metadata, job context, storage path, and actions.</p>
    `}function fa(){const e=p(),t=s.driveFolder==="home"?"shared":s.driveFolder;return`
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">Company Drive</div><h2 id="upload-title">Upload files</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="file-upload-panel" data-file-form>
          <div class="file-policy-note span-2">
            <strong>Company-scoped storage</strong>
            <span>Files are written under the active company. If Supabase Storage is blocked by policy, Quest keeps the file record locally instead of losing the entry.</span>
          </div>
          <label class="span-2">
            <span>Files</span>
            <input name="files" type="file" multiple />
          </label>
          ${k("Metadata-only file name","file_name","")}
          ${j("Folder","folder",t,_e.map(([a,i])=>[a,i]))}
          ${j("Job","job_id",s.route?.jobId||"",[["","Company shared file"]].concat(y(e).map(a=>[a.id,a.name])))}
          ${j("Category","category",I(t),bt.filter(a=>a!=="All categories").map(a=>[a,a]))}
          ${k("Uploaded by","uploaded_by_label",D().profile.full_name||"Quest HQ")}
          ${me("Notes","notes","","span-2")}
          <div class="form-actions span-2">
            <button class="btn btn-primary" type="submit">Upload to drive</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `}function ba(e){const t=x(e);return`
    ${z("Users","Company members, roles, workers, and access context.",`
      <a class="btn btn-primary" href="${m(l("settings",{},e))}" data-router><i class="ti ti-settings"></i>Settings</a>
    `)}
    <section class="users-grid">
      ${t.map(a=>`
        <article class="user-card">
          ${Je({full_name:a.full_name,avatar_url:a.avatar_url},"avatar")}
          <div>
            <strong>${o(a.full_name)}</strong>
            <span>${o(a.email)}</span>
            <small>${o(jt(e,a.id))}</small>
          </div>
        </article>
      `).join("")||b("No users assigned to this company yet.")}
    </section>
    <section class="panel top-gap">
      <div class="section-head"><div><h2>Membership model</h2><p>company_memberships is the canonical table; legacy company_ids remain as backfill fields.</p></div></div>
      ${M([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Client-filtered only while auth is disabled"],["Active role",Qe(e)]])}
    </section>
  `}function ga(e){const t=Ue(e);return`
    ${z("Settings","Company settings, roles, approvals, and admin controls.","")}
    <section class="dashboard-grid">
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${M([["Name",f(e)],["Company ID",e],["Color",t?.color||Y(e)],["Visible jobs",y(e).length]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Prepared for Supabase Auth and RLS.</p></div></div>
        ${M([["Auth switch","Disabled"],["Local login","Enabled"],["Isolation","Client-filtered only"],["Memberships",String(s.memberships.filter(a=>a.company_id===e).length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Approvals</h2><p>Quest-owned access approval queue.</p></div></div>
        ${b("No pending company approvals.")}
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${x(e).map(a=>`<div><strong>${o(a.full_name)}</strong><span>${o(jt(e,a.id))}</span></div>`).join("")||b("No workers assigned.")}
        </div>
      </article>
    </section>
  `}function ya(e){const t=ui(e),a=xe(e),i=ze(e),n=s.route?.jobId?v(s.route.jobId):null;return`
    <section class="tool-page forms-center">
      <div class="forms-command panel">
        <span class="sync-pill live"><i class="ti ti-device-floppy"></i>Local autosafe</span>
        <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
        <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
      </div>
      <div class="tool-strip">
        <div>
          <div class="context-line"><span>${o(f(e))}</span><b>${o(n?n.name:`${t.length} visible forms`)}</b></div>
          <h1>Forms</h1>
        </div>
        <div class="forms-mini-search">
          <label>
            <span>Search</span>
            <input data-form-search value="${o(s.formQuery)}" placeholder="Find form, audience, or job" />
          </label>
          <label>
            <span>Type</span>
            <select data-form-type-filter>
              <option value="all" ${s.formTypeFilter==="all"?"selected":""}>All types</option>
              ${Pe.map(r=>`<option value="${o(r)}" ${s.formTypeFilter===r?"selected":""}>${o(r)}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>
      <section class="forms-dashboard">
        ${q("Forms",J(e).length,"Company library")}
        ${q("Published",J(e).filter(r=>r.status==="Published").length,"Live forms")}
        ${q("Responses",i.length,"Local response queue")}
        ${q("Templates",He().length,"Reusable starts")}
      </section>
      <nav class="tabbar forms-tabs" aria-label="Forms workspace">
        ${["library","builder","responses","templates"].map(r=>`
          <button class="${s.formsTab===r?"active":""}" type="button" data-action="set-forms-tab" data-tab="${o(r)}">${o(w(r))}</button>
        `).join("")}
      </nav>
      ${s.formsTab==="library"?ha(e,t,a):""}
      ${s.formsTab==="builder"?_a(e,a):""}
      ${s.formsTab==="responses"?ka(e,a):""}
      ${s.formsTab==="templates"?ja():""}
    </section>
  `}function ha(e,t,a){return`
    <section class="forms-library-grid">
      <article class="forms-library-panel panel">
        <div class="forms-list">
          ${t.map(i=>`
            <button class="form-card ${a?.id===i.id?"active":""}" type="button" data-action="select-form" data-form-id="${o(i.id)}">
              <strong>${o(i.title)}</strong>
              <span>${o(i.description||"No description yet.")}</span>
              <small>${o(i.type)} / ${o(i.status)} / ${fe(i)} questions</small>
            </button>
          `).join("")||b("No forms match this company view.")}
        </div>
      </article>
      <aside class="forms-summary panel">
        ${a?va(e,a):b("Create a form or choose a template.")}
      </aside>
    </section>
  `}function va(e,t){const a=Rt(t.id),i=v(t.linked_job_id);return`
    <div class="forms-summary-head">
      <div>
        <h2>${o(t.title)}</h2>
        <p>${o(t.description||"No description yet.")}</p>
      </div>
      <span>${o(t.status)}</span>
    </div>
    <div class="forms-simple-meta">
      <span>${o(t.type)}</span>
      <span>${o(t.audience||"Internal")}</span>
      <span>${o(i?.name||"Company level")}</span>
      <span>${fe(t)} questions</span>
      <span>${a.length} responses</span>
    </div>
    <div class="summary-pill-grid">
      ${q("Updated",W(t.updated_at),"Last edit")}
      ${q("Approval",t.require_approval?"Required":"Not required","Review flow")}
      ${q("Email",t.collect_email?"Collected":"Optional","Submitter identity")}
    </div>
    <div class="forms-summary-share">
      <strong>Shareable preview URL</strong>
      <input readonly value="${o(`${window.location.origin}${m(l("forms",{form_id:t.id},e))}`)}" />
      <div class="form-actions">
        <button class="btn" type="button" data-action="copy-form-link" data-form-id="${o(t.id)}">Copy</button>
        <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${o(t.id)}">Edit</button>
      </div>
    </div>
    <div class="forms-summary-actions">
      <button class="btn" type="button" data-action="duplicate-form" data-form-id="${o(t.id)}"><i class="ti ti-copy"></i>Duplicate</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${o(t.id)}"><i class="ti ti-world-upload"></i>Publish</button>
      <button class="btn" type="button" data-action="archive-form" data-form-id="${o(t.id)}"><i class="ti ti-archive"></i>Archive</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${o(t.id)}"><i class="ti ti-trash"></i>Delete</button>
    </div>
  `}function _a(e,t){return t?`
    <section class="forms-builder-grid">
      <aside class="panel form-settings-panel">
        <div class="section-head"><div><h2>Settings</h2><p>${o(t.status)} / ${o(t.type)}</p></div></div>
        ${re("Title","title",t.title,!0)}
        ${mi("Description","description",t.description)}
        ${le("Type","type",t.type,Pe.map(a=>[a,a]))}
        ${le("Status","status",t.status,Oe.map(a=>[a,a]))}
        ${re("Audience","audience",t.audience)}
        ${le("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(y(e).map(a=>[a.id,a.name])))}
        ${re("Theme color","theme_color",t.theme_color||Y(e),!1,"color")}
        ${le("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
        ${re("Submit button","submit_label",t.submit_label||"Submit")}
        <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
        <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
        <div class="form-actions">
          <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${o(t.id)}">Save</button>
          <button class="btn" type="button" data-action="publish-form" data-form-id="${o(t.id)}">Publish</button>
        </div>
      </aside>
      <article class="panel question-workbench">
        <div class="section-head">
          <div><h2>Questions</h2><p>${fe(t)} question${fe(t)===1?"":"s"}</p></div>
          <div class="question-add-menu">
            ${$e.slice(0,5).map(([a,i])=>`<button class="btn" type="button" data-action="add-question" data-question-type="${o(a)}">${o(i)}</button>`).join("")}
          </div>
        </div>
        <div class="question-list">
          ${t.questions.map((a,i)=>$a(a,i)).join("")||b("Add the first question.")}
        </div>
      </article>
      <aside class="panel forms-preview-panel">
        <div class="section-head"><div><h2>Preview</h2><p>Submits into the local company response queue.</p></div></div>
        ${wa(e,t)}
      </aside>
    </section>
  `:`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${b("Create a form or choose a template to open the builder.")}
      </section>
    `}function $a(e,t){const a=$e.map(([i,n])=>`<option value="${o(i)}" ${e.type===i?"selected":""}>${o(n)}</option>`).join("");return`
    <article class="question-card ${s.selectedQuestionId===e.id?"active":""}" data-question-id="${o(e.id)}">
      <div class="question-card-head">
        <span>${t+1}</span>
        <select data-question-field="type">${a}</select>
        <div class="question-actions">
          <button type="button" data-action="move-question" data-direction="-1" data-question-id="${o(e.id)}"><i class="ti ti-arrow-up"></i></button>
          <button type="button" data-action="move-question" data-direction="1" data-question-id="${o(e.id)}"><i class="ti ti-arrow-down"></i></button>
          <button type="button" data-action="duplicate-question" data-question-id="${o(e.id)}"><i class="ti ti-copy"></i></button>
          <button type="button" data-action="delete-question" data-question-id="${o(e.id)}"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <label><span>Question</span><input data-question-field="label" value="${o(e.label)}" /></label>
      <label><span>Help text</span><input data-question-field="help" value="${o(e.help||"")}" /></label>
      <label class="check-row"><input type="checkbox" data-question-field="required" ${e.required?"checked":""} /> Required</label>
      ${be(e)?`
        <div class="question-options">
          ${(e.options||[]).map((i,n)=>`
            <label>
              <span>Option ${n+1}</span>
              <input data-question-option="${n}" value="${o(i)}" />
              <button type="button" data-action="remove-question-option" data-question-id="${o(e.id)}" data-option-index="${n}"><i class="ti ti-x"></i></button>
            </label>
          `).join("")}
          <button class="btn" type="button" data-action="add-question-option" data-question-id="${o(e.id)}"><i class="ti ti-plus"></i>Add option</button>
        </div>
      `:""}
    </article>
  `}function wa(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${o(t.id)}" style="--form-accent:${o(t.theme_color||Y(e))}">
      <div class="designed-form-header">
        <span>${o(f(e))}</span>
        <h2>${o(t.title)}</h2>
        <p>${o(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>Sa(a)).join("")||b("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${o(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function Sa(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?A(e,`<textarea name="${o(t)}" rows="3" ${a}></textarea>`):e.type==="date"?A(e,`<input name="${o(t)}" type="date" ${a} />`):e.type==="file"?A(e,`<input name="${o(t)}" type="file" ${a} />`):e.type==="yesno"?A(e,`<select name="${o(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?A(e,`<input name="${o(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?A(e,`<select name="${o(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(i=>`<option>${o(i)}</option>`).join("")}</select>`):e.type==="checkbox"?A(e,`<div class="choice-stack">${(e.options||[]).map(i=>`<label><input name="${o(t)}" type="checkbox" value="${o(i)}" /> ${o(i)}</label>`).join("")}</div>`):e.type==="multiple"?A(e,`<div class="choice-stack">${(e.options||[]).map(i=>`<label><input name="${o(t)}" type="radio" value="${o(i)}" ${a} /> ${o(i)}</label>`).join("")}</div>`):A(e,`<input name="${o(t)}" ${a} />`)}function ka(e,t){const a=t?Rt(t.id):ze(e),i=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(n=>`
            <button type="button" class="response-card">
              <strong>${o(B(n.form_id)?.title||"Unknown form")}</strong>
              <span>${o(n.submitted_by||n.submitter_email||"Anonymous")}</span>
              <small>${W(n.created_at)}</small>
            </button>
          `).join("")||b("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${i?fi(i):b("No response selected.")}
      </aside>
    </section>
  `}function ja(e){return`
    <section class="forms-template-grid">
      ${He().map(t=>`
        <article class="template-card panel">
          <strong>${o(t.title)}</strong>
          <p>${o(t.description)}</p>
          <div class="forms-simple-meta">
            <span>${o(t.type)}</span>
            <span>${t.questions.length} questions</span>
          </div>
          <button class="btn btn-primary" type="button" data-action="use-form-template" data-template-id="${o(t.id)}">Use template</button>
        </article>
      `).join("")}
    </section>
  `}function qa(e,t){const a={time:["My time","Personal time and shift context inside the company workspace."],approvals:["Approvals","Company access approvals and role requests."]},[i,n]=a[e]||a.time;return`
    ${z(i,n,"")}
    <section class="dashboard-grid">
      <article class="panel">
        <div class="section-head"><div><h2>Summary</h2><p>Quest-owned operational surface.</p></div></div>
        ${M([["Company",f(t)],["Visible jobs",y(t).length],["Open tasks",K(t).filter(r=>r.status!=="done").length],["Mode","Local basic mode"]])}
      </article>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Workload queue</h2><p>Sorted by active company and urgency.</p></div></div>
        <div class="queue-list">${K(t).slice(0,8).map(r=>Ct(r)).join("")||b("No tasks found.")}</div>
      </article>
    </section>
  `}function Ge(e){return`
    ${z(w(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${b("Module data model pending.")}
    </section>
  `}function Ia(){document.title="Sign in | Quest HQ";const e=_t(s.route.params.get("return_url")||m(l("jobs",{},h())));yt.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Company Workspace</small></span>
        </div>
        <div>
          <div class="eyebrow">Local access</div>
          <h1>Sign in to Quest HQ</h1>
          <p>Supabase auth is switched off while the company workspace foundation is stabilized.</p>
        </div>
        <form data-login-form>
          <label>Username<input name="username" value="${o(N.localUsername)}" autocomplete="username" /></label>
          <label>Password<input name="password" type="password" autocomplete="current-password" /></label>
          <input type="hidden" name="return_url" value="${o(e)}" />
          <button class="btn btn-primary full" type="submit">Sign in</button>
          ${s.loginError?`<div class="form-message error">${o(s.loginError)}</div>`:'<div class="form-message">Temporary credentials: lumen123 / lumen123</div>'}
        </form>
      </section>
    </main>
  `}function Da(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${Je(e,"avatar large")}
            <div><strong>${o(e.full_name)}</strong><span>${o(e.email)}</span></div>
          </div>
          <label>Display name<input name="full_name" value="${o(e.full_name)}" /></label>
          <label>Avatar URL<input name="avatar_url" value="${o(e.avatar_url||"")}" placeholder="https://..." /></label>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Save profile</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `}function Ca(e){const t=e.target.closest("[data-action]");if(t){Fa(e,t);return}const a=e.target.closest("[data-select-job]");if(a){e.preventDefault(),Ya(a.dataset.selectJob);return}const i=e.target.closest("[data-select-task]");if(i){e.preventDefault(),Ga(i.dataset.selectTask);return}const n=e.target.closest("a[href][data-router]");n&&(n.target||n.hasAttribute("download")||(e.preventDefault(),g(n.getAttribute("href"))))}function Fa(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),s.dataLoaded=!1,s.sync={label:"Refreshing...",mode:"loading"},u();return}if(a==="sign-out"){e.preventDefault(),localStorage.removeItem(ce),s.session=null,g("/login",{replace:!0});return}if(a==="open-profile"){e.preventDefault(),s.modal="profile",u();return}if(a==="open-file-upload"){e.preventDefault(),s.modal="file-upload",u();return}if(a==="close-modal"){e.preventDefault(),s.modal="",u();return}if(a==="set-task-view"){e.preventDefault(),s.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(ct,s.taskView),u();return}if(a==="set-drive-view"){e.preventDefault(),s.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem(pt,s.driveView),u();return}if(a==="set-drive-filter"){e.preventDefault(),s.driveFilter=t.dataset.filter||"my-drive",localStorage.setItem(ut,s.driveFilter),s.selectedFileId="",u();return}if(a==="select-file"){e.preventDefault(),s.selectedFileId=t.dataset.fileId||"",u();return}if(a==="download-file"){e.preventDefault(),Qa(t.dataset.fileId);return}if(a==="delete-file"){e.preventDefault(),Na(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),s.formsTab=t.dataset.tab||"library",u();return}if(a==="new-form"){e.preventDefault(),gi(p());return}if(a==="select-form"){e.preventDefault(),at(t.dataset.formId);return}if(a==="edit-form"){e.preventDefault(),at(t.dataset.formId),s.formsTab="builder",u();return}if(a==="save-form"){e.preventDefault(),S("Form saved locally"),u();return}if(a==="publish-form"){e.preventDefault(),it(t.dataset.formId,"Published");return}if(a==="archive-form"){e.preventDefault(),it(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){e.preventDefault(),yi(t.dataset.formId);return}if(a==="delete-form"){e.preventDefault(),hi(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),vi(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),_i(p());return}if(a==="use-form-template"){e.preventDefault(),$i(p(),t.dataset.templateId);return}if(a==="add-question"){e.preventDefault(),wi(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){e.preventDefault(),Si(t.dataset.questionId);return}if(a==="delete-question"){e.preventDefault(),ki(t.dataset.questionId);return}if(a==="move-question"){e.preventDefault(),ji(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){e.preventDefault(),qi(t.dataset.questionId);return}if(a==="remove-question-option"){e.preventDefault(),Ii(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){e.preventDefault(),Oa(t.dataset.jobId);return}a==="delete-task"&&(e.preventDefault(),Ua(t.dataset.taskId))}function Aa(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===N.localUsername&&String(t.password||"")===N.localPassword)){s.loginError="Invalid temporary credentials.",u();return}s.loginError="",s.session=Fe(),$(ce,s.session),g(_t(t.return_url||m(l("jobs",{},h()))),{replace:!0});return}if(e.target.matches("[data-profile-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries()),a={...D().profile,full_name:String(t.full_name||"").trim()||"Quest Basic Mode",avatar_url:String(t.avatar_url||"").trim()};$(st,a),s.profileDraft=a,s.session={...D(),profile:a},$(ce,s.session),s.modal="",u();return}if(e.target.matches("[data-job-form]")){e.preventDefault(),Pa(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),Ra(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),Ea(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),Di(e.target))}function La(e){if(e.target.matches("[data-global-search]")){s.query=e.target.value,Ce();return}if(e.target.matches("[data-file-search]")){s.fileQuery=e.target.value,Ce();return}if(e.target.matches("[data-form-search]")){s.formQuery=e.target.value,Ce();return}if(e.target.matches("[data-form-field]")){Ut(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Et(e.target)}function Ta(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||h();Ka(t);return}if(e.target.matches("[data-stage-filter]")){s.stageFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-status-filter]")){s.taskStatusFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-priority-filter]")){s.taskPriorityFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;g(l("tasks",t?{job_id:t}:{},p()));return}if(e.target.matches("[data-file-category-filter]")){s.fileCategoryFilter=e.target.value||"All categories",u();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=s.route?.jobId||"";g(l("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},p()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;g(l("files",{...t?{folder:"jobs",job_id:t}:{}},p()));return}if(e.target.matches("[data-form-type-filter]")){s.formTypeFilter=e.target.value||"all",u();return}if(e.target.matches("[data-form-field]")){Ut(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Et(e.target)}async function Pa(e){const t=Z(Object.fromEntries(new FormData(e).entries()));t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||p(),t.estimate_total=Number(t.estimate_total||0),t.updated_at=new Date().toISOString();const a=s.jobs.some(n=>n.id===t.id),i=E();if(i){const n=a?await i.from("jobs").update(t).eq("id",t.id).select().single():await i.from("jobs").insert(t).select().single();if(!n.error&&n.data){Ze(Z(n.data)),s.sync={label:"Quest Supabase live",mode:"live"},g(l("jobs",{tab:"profile",job_id:n.data.id},t.company_id),{replace:!0});return}s.sync={label:"Saved locally",mode:"local"}}Ze(t),g(l("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function Oa(e){if(!e)return;const t=p(),a=E();a&&await a.from("jobs").delete().eq("id",e),s.jobs=s.jobs.filter(i=>i.id!==e),s.selectedJobId=y(t)[0]?.id||"",H(),g(l("jobs",{tab:"list"},t),{replace:!0})}async function Ra(e){const t=p(),a=Object.fromEntries(new FormData(e).entries()),i=X({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:D().profile.member_id||x(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),n=s.tasks.some(d=>d.id===i.id),r=E();if(r){const d=ii(i),c=n?await r.from("tasks").update(d).eq("id",i.id).select().single():await r.from("tasks").insert(d).select().single();if(!c.error&&c.data){Xe(X(c.data)),s.sync={label:"Quest Supabase live",mode:"live"},g(l("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},t),{replace:!0});return}s.sync={label:"Task saved locally",mode:"local"}}Xe(i),g(l("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},t),{replace:!0})}async function Ua(e){if(!e)return;const t=p(),a=E();a&&await a.from("tasks").delete().eq("id",e),s.tasks=s.tasks.filter(i=>i.id!==e),s.selectedTaskId="",H(),g(l("tasks",{},t),{replace:!0})}async function Ea(e){const t=p(),a=new FormData(e),i=Object.fromEntries(a.entries()),n=Array.from(e.elements.files?.files||[]),r=String(i.file_name||"").trim(),d=n.length?n:r?[null]:[];if(!d.length){s.sync={label:"Choose a file or enter a file name",mode:"local"},u();return}const c=E();let T=0;for(const C of d){const Be=crypto.randomUUID(),We=C?.name||r,je=String(i.folder||"shared"),qe=`${t}/${i.job_id?`jobs/${i.job_id}`:je}/${Be}-${Li(We)}`;let Ie=!1;c&&C&&(Ie=!(await c.storage.from("quest-job-files").upload(qe,C,{cacheControl:"3600",upsert:!1,contentType:C.type||"application/octet-stream"})).error);const Ve=ue({id:Be,company_id:t,job_id:i.job_id||"",folder:je,file_name:We,mime_type:C?.type||"application/octet-stream",size_bytes:C?.size||Number(i.size_bytes||0),category:i.category||I(je),notes:i.notes||"",uploaded_by_label:i.uploaded_by_label||D().profile.full_name,bucket_id:"quest-job-files",object_path:Ie||!C?qe:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(c){const oe=await c.from("job_files").insert(si(Ve)).select().single();if(!oe.error&&oe.data){et(ue(oe.data)),T+=1;continue}Ie&&await c.storage.from("quest-job-files").remove([qe])}et(Ve)}s.sync=T===d.length?{label:"Quest Supabase live",mode:"live"}:{label:T?"Some files saved locally":"File record saved locally",mode:T?"loading":"local"},s.modal="",g(l("files",{folder:i.folder||"shared",...i.job_id?{job_id:i.job_id}:{}},t),{replace:!0})}async function Qa(e){const t=s.files.find(n=>n.id===e);if(!t?.object_path){s.sync={label:"No stored object for this file",mode:"local"},u();return}const a=E();if(!a)return;const i=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(i.error||!i.data?.signedUrl){s.sync={label:"Download failed",mode:"local"},u();return}window.open(i.data.signedUrl,"_blank","noopener,noreferrer")}async function Na(e){const t=s.files.find(i=>i.id===e);if(!t)return;const a=E();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),s.files=s.files.filter(i=>i.id!==e),s.selectedFileId="",H(),u()}function Ze(e){const t=s.jobs.findIndex(a=>a.id===e.id);t>=0?s.jobs[t]=e:s.jobs.unshift(e),s.selectedJobId=e.id,H()}function Xe(e){const t=s.tasks.findIndex(a=>a.id===e.id);t>=0?s.tasks[t]=e:s.tasks.unshift(e),s.selectedTaskId=e.id,H()}function et(e){const t=s.files.findIndex(a=>a.id===e.id);t>=0?s.files[t]=e:s.files.unshift(e),H()}function Ce(){const e=document.getElementById("workspace");e&&($t(s.route),e.innerHTML=ht(s.route))}function vt(){const e=Re(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/"||e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:p(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const i=a[2]||"jobs";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:i,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:p(),jobId:t.get("job_id")||""}}function Ma(){const e=Re(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||de(t.get("job_id")||t.get("project_id"))||localStorage.getItem(ye)||h();let n={"/index.html":l("jobs",{},a),"/command.html":l("jobs",{},a),"/admin.html":l("settings",{},a),"/automations.html":l("settings",{},a),"/crm.html":l("users",{},a),"/dashboards.html":l("analytics",{},a),"/files.html":l("files",{},a),"/finance.html":l("analytics",{},a),"/forms.html":l("forms",{},a),"/jobs.html":l("jobs",{},a),"/knowledge.html":l("files",{folder:"shared"},a),"/login.html":"/login","/templates.html":l("forms",{},a),"/tickets.html":l("tasks",{},a)}[e];if(e==="/jobs"){const d=t.get("tab");d==="tasks"?n=l("tasks",P(t,["job_id","task_id","new","edit"]),a):d==="files"?n=l("files",P(t,["job_id","folder"]),a):d==="forms"?n=l("forms",P(t,["job_id"]),a):d==="analytics"?n=l("analytics",P(t,["job_id"]),a):n=l("jobs",P(t,["job_id","tab"]),a)}if(e==="/files"&&(n=l("files",P(t,["job_id","folder"]),a)),e==="/forms"&&(n=l("forms",P(t,["job_id"]),a)),e==="/analytics"&&(n=l("analytics",P(t,["job_id"]),a)),e==="/admin"&&(n=l("settings",{},a)),e==="/time"&&(n=l("time",{},a)),e==="/team"&&(n=l("users",{},a)),e==="/approvals"&&(n=l("approvals",{},a)),e==="/clock"&&(n=l("settings",{},a)),e==="/task-management.html"){const d=t.get("project_id")||t.get("job_id")||"";n=l("tasks",d?{job_id:d}:{},de(d)||a)}const r=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(r){const d=decodeURIComponent(r[1]);n=l("tasks",{job_id:d},de(d)||a)}n&&window.history.replaceState({},"",m(n))}function Ja(e){if(e.name!=="company")return"";const t=ie();if(!t.includes(e.companyId))return l(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||h());if(!["jobs","tasks","files","forms","analytics","users","settings","time","approvals"].includes(e.section))return l("jobs",{},e.companyId);const i=e.jobId?de(e.jobId):"";return i&&i!==e.companyId&&t.includes(i)?l(e.section,Object.fromEntries(e.params.entries()),i):""}function Re(){let e=window.location.pathname||"/";return V&&e.startsWith(V)&&(e=e.slice(V.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function m(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),i=t.startsWith("/")?t:"/"+t;return`${V}${i}${a?`?${a}`:""}`||"/"}function g(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(V+"/")||V===""&&e.startsWith("/")?e:m(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),u()}function xa(){return`${Re()}${window.location.search}`}function _t(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?m(l("jobs",{},h())):`${t.pathname}${t.search}`}catch{return m(l("jobs",{},h()))}}function l(e="jobs",t={},a=p()){const i=new URLSearchParams(t);for(const[n,r]of[...i.entries()])(r==null||r==="")&&i.delete(n);return`/company/${encodeURIComponent(a||h())}/${e}${i.toString()?`?${i.toString()}`:""}`}function za(e){return e.name==="company"?w(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":w(e.name||"Workspace")}function Ha(e,t){const[a]=t.split("?"),i=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!i||e.name!=="company"?!1:e.companyId===decodeURIComponent(i[1])&&e.section===i[2]}function Ba(e){return mt.includes(e)?e:"pipeline"}function Wa(e){return{pipeline:"Pipeline",list:"List",profile:"Profile",editor:"Editor"}[e]||e}function Va(e){const t=e.companyId||s.activeCompanyId||h(),a=ie();s.activeCompanyId=a.includes(t)?t:a[0]||h(),localStorage.setItem(ye,s.activeCompanyId)}function $t(e){const t=p();e.jobId&&y(t).some(i=>i.id===e.jobId)&&(s.selectedJobId=e.jobId),(!s.selectedJobId||!y(t).some(i=>i.id===s.selectedJobId))&&(s.selectedJobId=y(t)[0]?.id||"");const a=e.params.get("task_id");a&&K(t).some(i=>i.id===a)&&(s.selectedTaskId=a),e.section!=="tasks"&&(s.selectedTaskId=""),s.driveFolder=e.params.get("folder")||"home"}function Ka(e){const t=ie(),a=t.includes(e)?e:t[0]||h();s.activeCompanyId=a,localStorage.setItem(ye,a);const i=s.route||vt(),n=i.name==="company"?i.section:"jobs";g(l(n,{},a))}function Ya(e){const t=v(e);t&&(s.selectedJobId=e,g(l("jobs",{tab:"profile",job_id:e},t.company_id)))}function Ga(e){const t=wt(e);t&&(s.selectedTaskId=e,g(l("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function Za(){return v(s.selectedJobId)||y(p())[0]||null}function v(e){return s.jobs.find(t=>t.id===e)||null}function wt(e){return s.tasks.find(t=>t.id===e)||null}function y(e=p()){return s.jobs.filter(t=>t.company_id===e)}function K(e=p()){return s.tasks.filter(t=>t.company_id===e)}function we(e=p()){return s.files.filter(t=>t.company_id===e)}function x(e=p()){return s.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function St(e=p()){const t=s.query.trim().toLowerCase();return y(e).filter(a=>s.stageFilter!=="all"&&a.stage!==s.stageFilter?!1:t?[a.name,a.client_name,a.contact_name,a.owner_name,a.site_address,a.job_type,f(a.company_id)].some(i=>String(i||"").toLowerCase().includes(t)):!0)}function tt(e=p(),t=""){const a=s.query.trim().toLowerCase();return K(e).filter(i=>t&&i.project_id!==t||s.taskStatusFilter!=="all"&&i.status!==s.taskStatusFilter||s.taskPriorityFilter!=="all"&&i.priority!==s.taskPriorityFilter?!1:a?[i.title,i.description,ke(i.type),se(i.assignee_id),v(i.project_id)?.name].some(n=>String(n||"").toLowerCase().includes(a)):!0)}function kt(){const e=ie();return s.companies.filter(t=>e.includes(t.id))}function ie(){const e=D().profile,t=s.companies.map(n=>n.id);if(["developer","admin"].includes(e.role))return t.length?t:ae.map(n=>n.id);const a=s.memberships.filter(n=>n.profile_id===e.id&&n.status!=="disabled").map(n=>n.company_id);return(a.length?a:e.company_ids||[]).filter(n=>t.includes(n))}function p(){const e=ie();return e.includes(s.activeCompanyId)?s.activeCompanyId:e[0]||h()}function h(){return ae[0].id}function Ue(e){return s.companies.find(t=>t.id===e)||ae.find(t=>t.id===e)||null}function f(e){const t=Ue(e);return t?Ee(t):e||"Company"}function Ee(e){return e.short_name||e.label||e.name||e.id}function Y(e){return Ue(e)?.color||"#f0b23b"}function de(e){return s.jobs.find(t=>t.id===e)?.company_id||""}function Qe(e){const t=D().profile;return["developer","admin"].includes(t.role)?w(t.role):w(s.memberships.find(a=>a.company_id===e&&a.profile_id===t.id)?.role||t.role||"member")}function jt(e,t){const a=s.memberships.find(i=>i.company_id===e&&(i.member_id===t||i.profile_id===t));return w(a?.role||"member")}function se(e){const t=s.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function Ne(e){return s.tasks.filter(t=>t.project_id===e).length}function qt(e){return s.files.filter(t=>t.job_id===e).length}function Xa(e){return{id:String(e.id||"").trim(),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function Z(e){return{id:String(e.id||""),company_id:String(e.company_id||h()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:he.includes(e.stage)?e.stage:"Lead",priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:U(e.estimate_total),invoice_total:U(e.invoice_total),task_count:U(e.task_count),file_count:U(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function X(e){const t=pe.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=ve.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:ft.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:String(e.company_id||h()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||R(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:pe.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function ue(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:String(e.company_id||h()),job_id:String(e.job_id||""),folder:String(e.folder||Fi(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:U(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Se(e){const t=Array.isArray(e.questions)?e.questions.map(Me):[],a=Pe.includes(e.type)?e.type:"Internal",i=Oe.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:String(e.company_id||h()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:i,audience:String(e.audience||"Internal").trim(),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Me(e){const t=$e.some(([i])=>i===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(i=>String(i||"").trim()).filter(Boolean):[]};return be(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function It(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:String(e.company_id||h()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function Dt(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,company_ids:Array.isArray(e.company_ids)?e.company_ids:[]}}function ei(e){return{company_id:String(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:String(e.status||"active")}}function ti(e=p()){return Z({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function ai(e=p(),t=""){return X({id:"",title:"",company_id:e,project_id:t,assignee_id:x(e)[0]?.id||"abraham",creator_id:D().profile.member_id||"abraham",due:R(1),priority:"medium",status:"todo",type:"admin"})}function ii(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function si(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function D(){return s.session?{...s.session,profile:{...Fe().profile,...s.session.profile||{},...s.profileDraft||{}}}:Fe()}function Fe(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",...s.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:N.localUsername,email:e.email},profile:e}}function z(e,t,a=""){return`
    <section class="workspace-head">
      <div>
        <div class="context-line"><span>${o(f(p()))}</span><b>${o(Qe(p()))}</b></div>
        <h1>${o(e)}</h1>
        <p>${o(t)}</p>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function oi(e){return`<section class="metric-grid">${e.map(([t,a])=>`<article class="metric"><span>${o(t)}</span><strong>${o(a)}</strong></article>`).join("")}</section>`}function ni(e){return`
    <button class="queue-row" type="button" data-select-job="${o(e.id)}">
      <span><strong>${o(e.name)}</strong><small>${o(e.client_name||f(e.company_id))}</small></span>
      ${Ft(e.priority)}
      <b>${o(e.stage)}</b>
    </button>
  `}function Ct(e){return`
    <button class="queue-row" type="button" data-select-task="${o(e.id)}">
      <span><strong>${o(e.title)}</strong><small>${o(v(e.project_id)?.name||f(e.company_id))}</small></span>
      ${At(e.priority)}
      <b>${o(G(e.status))}</b>
    </button>
  `}function ri(e){return`
    <button class="job-card priority-${o(e.priority.toLowerCase())} ${e.id===s.selectedJobId?"active":""}" type="button" data-select-job="${o(e.id)}">
      <strong>${o(e.name)}</strong>
      <span>${o(e.client_name||"No client")}</span>
      <small>${o(f(e.company_id))} - ${o(e.owner_name||"Unassigned")}</small>
      <em>${o(Ne(e.id))} tasks</em>
    </button>
  `}function ne(e,t,a,i){return`
    <a class="mini-link" href="${m(e)}" data-router>
      <i class="ti ${o(t)}"></i>
      <span><strong>${o(a)}</strong><small>${o(i)}</small></span>
    </a>
  `}function M(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${o(t)}</span><strong>${o(a)}</strong></div>`).join("")}</div>`}function k(e,t,a="",i=!1,n="text",r=""){return`<label class="${o(r)}"><span>${o(e)}</span><input name="${o(t)}" type="${o(n)}" value="${o(a)}" ${i?"required":""} /></label>`}function me(e,t,a="",i=""){return`<label class="${o(i)}"><span>${o(e)}</span><textarea name="${o(t)}" rows="4">${o(a)}</textarea></label>`}function j(e,t,a,i){return`
    <label><span>${o(e)}</span><select name="${o(t)}">
      ${i.map(([n,r])=>`<option value="${o(n)}" ${String(n)===String(a)?"selected":""}>${o(r)}</option>`).join("")}
    </select></label>
  `}function Ft(e){return`<span class="priority ${o(String(e).toLowerCase())}">${o(e)}</span>`}function At(e){return`<span class="priority ${o(e)}">${o(w(e))}</span>`}function li(e){return`<span class="status-pill ${o(e)}">${o(G(e))}</span>`}function Je(e,t){if(e.avatar_url)return`<span class="${o(t)}"><img src="${o(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(i=>i[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${o(t)}">${o(a)}</span>`}function b(e){return`<div class="empty-state">${o(e)}</div>`}function P(e,t){const a={};return t.forEach(i=>{const n=e.get(i);n&&(a[i]=n)}),a}function H(){$(ot,s.jobs),$(nt,s.tasks),$(rt,s.files),$(te,s.forms),$(Te,s.formResponses),$(lt,s.teamMembers),$(dt,s.memberships)}function q(e,t,a=""){return`<article class="metric"><span>${o(e)}</span><strong>${o(t)}</strong>${a?`<small>${o(a)}</small>`:""}</article>`}function O(e,t){return`<div><strong>${o(e)}</strong><span>${o(t)}</span></div>`}function di(e,t,a){return`
    <button class="${s.driveFilter===e?"active":""}" type="button" data-action="set-drive-filter" data-filter="${o(e)}">
      <i class="ti ${o(a)}"></i>
      <span>${o(t)}</span>
    </button>
  `}function Ae(){return gt.find(([e])=>e===s.driveFilter)?.[1]||"My Drive"}function ci(e=p()){const t=we(e);return{count:t.length,bytes:Ti(t,"size_bytes")}}function pi(e){const t=e||[],a=t.find(i=>i.id===s.selectedFileId)||t[0]||null;return s.selectedFileId=a?.id||"",a}function Lt(e=p(),t="home",a=""){const i=(s.fileQuery||s.query||"").trim().toLowerCase(),n=s.fileCategoryFilter;let r=we(e);return a?r=r.filter(d=>d.job_id===a):s.driveFilter==="images"?r=r.filter(d=>d.mime_type.includes("image")||d.folder==="photos"):s.driveFilter==="documents"?r=r.filter(d=>!d.mime_type.includes("image")&&d.folder!=="photos"):t&&t!=="home"&&(t==="jobs"?r=r.filter(d=>d.job_id):r=r.filter(d=>d.folder===t)),n&&n!=="All categories"&&(r=r.filter(d=>String(d.category||I(d.folder)).toLowerCase()===n.toLowerCase())),i&&(r=r.filter(d=>[d.file_name,d.category,d.uploaded_by_label,d.notes,d.object_path,v(d.job_id)?.name].some(c=>String(c||"").toLowerCase().includes(i)))),r.sort((d,c)=>new Date(c.created_at||0)-new Date(d.created_at||0))}function Tt(e){const t=String(e.mime_type||"").toLowerCase();return t.includes("pdf")?"PDF":t.includes("image")?"Image":t.includes("zip")?"Zip":t.includes("spreadsheet")||t.includes("excel")?"Sheet":t.includes("word")||t.includes("document")?"Doc":I(e.folder)}function Pt(e){const t=Tt(e).toLowerCase();return t==="pdf"?"pdf":t==="image"?"image":t==="sheet"?"sheet":"doc"}function Ot(e,t=!1){const a=Ai(e);return e.signed_url?`<img src="${o(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${o(Pt(e))} ${t?"large":""}"><i class="ti ${o(a)}"></i></span>`}function J(e=p()){return s.forms.filter(t=>t.company_id===e)}function ui(e=p()){const t=s.formQuery.trim().toLowerCase(),a=s.route?.jobId||"";return J(e).filter(i=>a&&i.linked_job_id!==a||s.formTypeFilter!=="all"&&i.type!==s.formTypeFilter?!1:t?[i.title,i.description,i.type,i.status,i.audience,v(i.linked_job_id)?.name].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function xe(e=p()){const t=s.route?.jobId||"",a=J(e).filter(r=>!t||r.linked_job_id===t),i=s.route?.params?.get("form_id")||"";if(i&&a.some(r=>r.id===i)&&(s.selectedFormId=i),!a.length)return s.selectedFormId="",s.selectedQuestionId="",null;let n=a.find(r=>r.id===s.selectedFormId)||a[0];return s.selectedFormId=n.id,(!s.selectedQuestionId||!n.questions.some(r=>r.id===s.selectedQuestionId))&&(s.selectedQuestionId=n.questions[0]?.id||""),n}function B(e){return s.forms.find(t=>t.id===e)||null}function L(){return B(s.selectedFormId)||xe(p())}function ze(e=p()){return s.formResponses.filter(t=>t.company_id===e)}function Rt(e){return s.formResponses.filter(t=>t.form_id===e)}function fe(e){return Array.isArray(e?.questions)?e.questions.length:0}function re(e,t,a="",i=!1,n="text"){return`<label><span>${o(e)}</span><input data-form-field="${o(t)}" type="${o(n)}" value="${o(a)}" ${i?"required":""} /></label>`}function mi(e,t,a=""){return`<label><span>${o(e)}</span><textarea data-form-field="${o(t)}" rows="3">${o(a)}</textarea></label>`}function le(e,t,a,i){return`
    <label><span>${o(e)}</span><select data-form-field="${o(t)}">
      ${i.map(([n,r])=>`<option value="${o(n)}" ${String(n)===String(a)?"selected":""}>${o(r)}</option>`).join("")}
    </select></label>
  `}function be(e){return["multiple","checkbox","dropdown"].includes(e.type)}function A(e,t){return`
    <div class="response-question">
      <label>
        <span>${o(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${o(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function fi(e){const t=B(e.form_id),a=Object.entries(e.answers||{}).map(([i,n])=>{const r=t?.questions.find(c=>c.id===i),d=Array.isArray(n)?n.join(", "):n;return O(r?.label||i,d||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${o(t?.title||"Response")}</h2><p>${o(e.submitted_by||e.submitter_email||"Anonymous")} / ${W(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||O("Response","No answers captured.")}</div>
  `}function He(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[_("short","Inspection address"),_("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),_("paragraph","Recommended scope"),_("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[_("short","Client name"),_("yesno","Approved to proceed?"),_("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[_("short","Request title"),_("dropdown","Priority",["Low","Medium","High","Urgent"]),_("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[_("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),_("yesno","Weather safe?"),_("paragraph","Safety notes")]}]}function bi(e=p()){return Se({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:s.route?.jobId||"",theme_color:Y(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[_("short","First question")]})}function _(e="short",t="Untitled question",a=[]){return Me({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function gi(e){const t=bi(e);s.forms.unshift(t),s.selectedFormId=t.id,s.selectedQuestionId=t.questions[0]?.id||"",s.formsTab="builder",S("New form created"),u()}function at(e){const t=B(e);t&&(s.selectedFormId=t.id,s.selectedQuestionId=t.questions[0]?.id||"",u())}function S(e="Forms saved locally"){const t=L();t&&(t.updated_at=new Date().toISOString()),$(te,s.forms),$(Te,s.formResponses),s.sync={label:e,mode:"live"}}function it(e,t){const a=B(e||s.selectedFormId);a&&(a.status=Oe.includes(t)?t:"Draft",s.selectedFormId=a.id,S(`${a.status} locally`),u())}function yi(e){const t=B(e||s.selectedFormId);if(!t)return;const a=Se({...ge(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(i=>({...ge(i),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});s.forms.unshift(a),s.selectedFormId=a.id,s.selectedQuestionId=a.questions[0]?.id||"",S("Form duplicated"),u()}function hi(e){const t=e||s.selectedFormId;t&&(s.forms=s.forms.filter(a=>a.id!==t),s.formResponses=s.formResponses.filter(a=>a.form_id!==t),s.selectedFormId=J(p())[0]?.id||"",s.selectedQuestionId=xe(p())?.questions[0]?.id||"",S("Form deleted locally"),u())}async function vi(e){const t=e||s.selectedFormId,a=`${window.location.origin}${m(l("forms",{form_id:t},p()))}`;try{await navigator.clipboard.writeText(a),s.sync={label:"Form link copied",mode:"live"}}catch{s.sync={label:"Copy failed",mode:"local"}}u()}function _i(e){const t=JSON.stringify({company_id:e,forms:J(e),responses:ze(e)},null,2);Ci(`${e}-forms-export.json`,t,"application/json")}function $i(e,t){const a=He().find(n=>n.id===t);if(!a)return;const i=Se({...a,id:`form-${crypto.randomUUID()}`,company_id:e,status:"Draft",audience:"Internal",linked_job_id:s.route?.jobId||"",theme_color:Y(e),background:"clean",submit_label:"Submit",questions:a.questions.map(n=>({...ge(n),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});s.forms.unshift(i),s.selectedFormId=i.id,s.selectedQuestionId=i.questions[0]?.id||"",s.formsTab="builder",S("Template added"),u()}function Ut(e){const t=L();if(!t)return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),$(te,s.forms))}function Et(e){const t=L(),a=e.closest("[data-question-id]"),i=t?.questions.find(n=>n.id===a?.dataset.questionId);if(!(!t||!i)){if(s.selectedQuestionId=i.id,e.matches("[data-question-option]")){const n=Number(e.dataset.questionOption);i.options[n]=e.value}else{const n=e.dataset.questionField;if(n==="required")i.required=e.checked;else if(n==="type"){i.type=e.value,be(i)&&!i.options.length&&(i.options=["Option 1","Option 2"]),be(i)||(i.options=[]),S("Question updated"),u();return}else n&&(i[n]=e.value)}t.updated_at=new Date().toISOString(),$(te,s.forms)}}function wi(e="multiple"){const t=L();if(!t)return;const a=_(e,$e.find(([i])=>i===e)?.[1]||"New question");t.questions.push(a),s.selectedQuestionId=a.id,S("Question added"),u()}function Si(e){const t=L(),a=t?.questions.find(r=>r.id===e);if(!t||!a)return;const i=t.questions.findIndex(r=>r.id===e),n=Me({...ge(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(i+1,0,n),s.selectedQuestionId=n.id,S("Question duplicated"),u()}function ki(e){const t=L();t&&(t.questions=t.questions.filter(a=>a.id!==e),s.selectedQuestionId=t.questions[0]?.id||"",S("Question deleted"),u())}function ji(e,t){const a=L();if(!a||!t)return;const i=a.questions.findIndex(d=>d.id===e),n=i+t;if(i<0||n<0||n>=a.questions.length)return;const[r]=a.questions.splice(i,1);a.questions.splice(n,0,r),s.selectedQuestionId=e,S("Question moved"),u()}function qi(e){const a=L()?.questions.find(i=>i.id===e);a&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),S("Option added"),u())}function Ii(e,t){const i=L()?.questions.find(n=>n.id===e);!i||t<0||(i.options.splice(t,1),i.options.length||i.options.push("Option 1"),S("Option removed"),u())}function Di(e){const t=B(e.dataset.formId);if(!t)return;const a=new FormData(e),i={};t.questions.forEach(n=>{const r=`answer:${n.id}`,d=a.getAll(r).filter(c=>c instanceof File?c.name:String(c||"").trim());i[n.id]=d.length>1?d.map(c=>c instanceof File?c.name:c):d[0]instanceof File?d[0].name:d[0]||""}),s.formResponses.unshift(It({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||D().profile.full_name||"Preview submitter"),answers:i,created_at:new Date().toISOString()})),s.formsTab="responses",S("Preview response saved"),u()}function Ci(e,t,a="text/plain"){const i=new Blob([t],{type:a}),n=URL.createObjectURL(i),r=document.createElement("a");r.href=n,r.download=e,r.click(),URL.revokeObjectURL(n)}function ge(e){return JSON.parse(JSON.stringify(e))}function G(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||w(e)}function ke(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||w(e)}function I(e){return _e.find(([t])=>t===e)?.[1]||w(e||"Shared")}function Fi(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function Ai(e){return e.mime_type.includes("image")?"ti-photo":e.mime_type.includes("pdf")?"ti-file-type-pdf":e.mime_type.includes("zip")?"ti-file-zip":"ti-file-description"}function w(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function R(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function W(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function ee(e){const t=U(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],i=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**i).toFixed(i?1:0)} ${a[i]}`}function Li(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function Ti(e,t){return e.reduce((a,i)=>a+U(i[t]),0)}function U(e){const t=Number(e);return Number.isFinite(t)?t:0}function Qt(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(U(e))}function Le(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function Q(e,t){const a=Le(e,t);return Array.isArray(a)&&a.length?a:t}function $(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function o(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
