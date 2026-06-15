(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const _e={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://lpzotcznihwyyudxycmd.supabase.co",supabaseKey:"sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07"},ge=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),he="quest-hq-local-session",fa="quest-hq-local-profile",ba="quest-hq-job-cache-v2",ga="quest-hq-task-cache-v1",va="quest-hq-file-cache-v1",ya="quest-hq-drive-folder-cache-v1",_a="quest-hq-team-cache-v1",ha="quest-hq-company-membership-cache-v1",Pe="quest-hq-company-form-cache-v1",jt="quest-hq-company-form-response-cache-v1",$a="quest-hq-finance-invoice-cache-v1",wa="quest-hq-finance-payment-cache-v1",Sa="quest-hq-finance-expense-cache-v1",ka="quest-hq-finance-vendor-cache-v1",Dt="quest-hq-time-entry-cache-v1",Ct="quest-hq-active-timer-v1",Se="quest-hq-active-company",ja="quest-hq-task-view",Da="quest-hq-drive-view",Xt={developer:["*"],admin:["*"],owner:["*"],manager:["jobs.view","jobs.manage","tasks.view","tasks.manage","files.view","files.manage","forms.view","forms.manage","finance.view","team.view","clock.manage","approvals.manage","approvals.view","users.view","settings.view","billing.view","roles.view"],member:["jobs.view","tasks.view","tasks.manage","files.view","forms.view","time.track","approvals.view","users.view"]},bi=[["jobs.view","View jobs"],["jobs.manage","Create/edit jobs"],["tasks.view","View tasks"],["tasks.manage","Create/edit tasks"],["files.view","View files"],["files.manage","Upload/delete files"],["forms.view","View forms"],["forms.manage","Create/edit forms"],["crm.view","View CRM"],["finance.view","View finance"],["finance.manage","Create/edit finance"],["users.view","View users"],["users.manage","Invite/manage users"],["roles.view","View roles"],["roles.manage","Create/edit roles"],["billing.view","View billing"],["billing.manage","Manage subscription"],["settings.view","View settings"],["settings.manage","Manage settings"],["time.track","Track own time"],["clock.manage","Manage clock dashboard"],["approvals.view","View approvals"],["approvals.manage","Manage approvals"]],Xe=[{id:"jobs",group:"Workspace",label:"Jobs",icon:"ti-briefcase",symbol:"q-symbol-jobs",status:"live",permission:"jobs.view"},{id:"tasks",group:"Workspace",label:"Tasks",icon:"ti-list-check",symbol:"q-symbol-tasks",status:"live",permission:"tasks.view"},{id:"files",group:"Workspace",label:"Files",icon:"ti-folder",symbol:"q-symbol-files",status:"live",permission:"files.view"},{id:"forms",group:"Workspace",label:"Forms",icon:"ti-clipboard-list",symbol:"q-symbol-forms",status:"live",permission:"forms.view"},{id:"analytics",group:"Workspace",label:"Analytics",icon:"ti-chart-bar",symbol:"q-symbol-analytics",status:"live",permission:"jobs.view"},{id:"crm",group:"Workspace",label:"CRM",icon:"ti-users-group",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"tickets",group:"Workspace",label:"Tickets",icon:"ti-ticket",symbol:"q-symbol-tickets",status:"planned"},{id:"finance",group:"Workspace",label:"Finance",icon:"ti-receipt-dollar",symbol:"q-symbol-finance",status:"live",permission:"finance.view"},{id:"knowledge",group:"Workspace",label:"Knowledge Base",icon:"ti-books",symbol:"q-symbol-knowledge",status:"planned"},{id:"automations",group:"Workspace",label:"Automations",icon:"ti-automation",symbol:"q-symbol-automations",status:"planned"},{id:"templates",group:"Workspace",label:"Templates",icon:"ti-template",symbol:"q-symbol-templates",status:"planned"},{id:"users",group:"Company",label:"Users",icon:"ti-users",symbol:"q-symbol-users",status:"live",permission:"users.view"},{id:"settings",group:"Company",label:"Settings",icon:"ti-settings",symbol:"q-symbol-settings",status:"live",permission:"settings.view"},{id:"team-chart",group:"Company",label:"Team chart",icon:"ti-hierarchy-3",symbol:"q-symbol-team-chart",status:"live",permission:"team.view"},{id:"time",group:"Operations",label:"My time",icon:"ti-clock",symbol:"q-symbol-time",status:"live",permission:"time.track"},{id:"approvals",group:"Operations",label:"Approvals",icon:"ti-user-check",symbol:"q-symbol-approvals",status:"live",permission:"approvals.view"},{id:"team-workload",group:"Operations",label:"Team workload",icon:"ti-users",symbol:"q-symbol-team-workload",status:"planned"},{id:"clock",group:"Operations",label:"Clock dashboard",icon:"ti-clock-hour-4",symbol:"q-symbol-clock",status:"live",permission:"clock.manage"}],gi={"/admin.html":"settings","/automations.html":"automations","/crm.html":"crm","/dashboards.html":"analytics","/files.html":"files","/finance.html":"finance","/forms.html":"forms","/jobs.html":"jobs","/knowledge.html":"knowledge","/templates.html":"templates","/tickets.html":"tickets"},Re=["Lead","Site Review","Estimate","Approved","Active","Closed"],Ca=["pipeline","list","profile"],Ne=["todo","pending","hold","review","done"],Ye=["critical","urgent","high","medium","low"],qa=["lead","bid","admin","invoicing","ar","meeting","web_dev"],vi=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],qt=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],Le=["Inspection","Client approval","Intake","Survey","Safety","Internal"],Ft=["Draft","Published","Archived"],Fa=["Draft","Sent","Partially paid","Paid","Overdue","Void"],Ia=["Pending","Approved","Paid","Rejected"],xa=["Active","On hold","Inactive"],Aa=["ACH","Check","Card","Cash","Wire","Other"],et=["Materials","Labor","Subcontractor","Permit","Equipment","Marketing","Software","Travel","Other"],Ue=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],$e=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],yi=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],_i=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"],supervisor_id:""},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"],supervisor_id:"abraham"},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"],supervisor_id:"maya"},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"],supervisor_id:"abraham"},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"],supervisor_id:""}],hi=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],$i=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:h(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:h(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:h(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:h(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:h(5),priority:"medium",urgency:"medium",status:"todo"}],wi=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],Si=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",creator_id:"abraham",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",creator_id:"maya",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",creator_id:"noah",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",creator_id:"lumen-ops",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],ki=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],ji=[{id:"vendor-roofing-materials",company_id:"roofing",name:"Valley Roofing Supply",contact_name:"Elena Ortiz",email:"orders@valleyroofingsupply.local",phone:"(480) 555-0190",category:"Materials",status:"Active",notes:"Primary tile, flashing, and underlayment vendor.",created_at:new Date(Date.now()-12096e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"vendor-roofing-dryin",company_id:"roofing",name:"Monsoon Dry-In Crew",contact_name:"R. Alvarez",email:"dispatch@monsoondryin.local",phone:"(602) 555-0144",category:"Subcontractor",status:"Active",notes:"Emergency dry-in support during storm calls.",created_at:new Date(Date.now()-10368e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"vendor-drafting-permits",company_id:"drafting",name:"Permit Runner AZ",contact_name:"Sofia Chen",email:"permits@runneraz.local",phone:"(602) 555-0171",category:"Permit",status:"Active",notes:"Permit filing support for drafting packets.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString()},{id:"vendor-lumen-software",company_id:"lumen",name:"Lumen SaaS Stack",contact_name:"Ops Billing",email:"billing@lumenstack.local",phone:"",category:"Software",status:"Active",notes:"Internal software subscriptions for client onboarding.",created_at:new Date(Date.now()-7776e5).toISOString(),updated_at:new Date(Date.now()-3456e5).toISOString()}],Di=[{id:"invoice-roofing-queen-creek",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",client_name:"Rosales Residence",invoice_number:"QR-1007",status:"Partially paid",issue_date:h(-10),due_date:h(5),subtotal:6800,tax:0,total:6800,notes:"Emergency leak repair billing with deposit received.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"invoice-roofing-mesa-storage",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",client_name:"Mesa Storage Partners",invoice_number:"QR-1008",status:"Sent",issue_date:h(-18),due_date:h(-2),subtotal:18400,tax:0,total:18400,notes:"Estimate packet sent to board for approval.",created_at:new Date(Date.now()-15552e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-drafting-horizon",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",client_name:"Horizon HVAC",invoice_number:"QD-2031",status:"Sent",issue_date:h(-7),due_date:h(14),subtotal:4200,tax:0,total:4200,notes:"Drafting permit package milestone invoice.",created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-lumen-onboarding",company_id:"lumen",job_id:"",client_name:"Lumen Internal Launch",invoice_number:"LM-3004",status:"Draft",issue_date:h(-3),due_date:h(27),subtotal:3200,tax:0,total:3200,notes:"Demo onboarding package used for finance workspace.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()}],Ci=[{id:"payment-roofing-queen-creek-deposit",company_id:"roofing",invoice_id:"invoice-roofing-queen-creek",amount:2500,method:"ACH",received_at:h(-4),reference:"ACH-4421",notes:"Deposit received after dry-in visit.",created_at:new Date(Date.now()-3456e5).toISOString()},{id:"payment-drafting-horizon-retainer",company_id:"drafting",invoice_id:"invoice-drafting-horizon",amount:1e3,method:"Check",received_at:h(-1),reference:"CHK-117",notes:"Retainer collected before permit packet completion.",created_at:new Date(Date.now()-864e5).toISOString()}],qi=[{id:"expense-roofing-queen-creek-materials",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",vendor_id:"vendor-roofing-materials",category:"Materials",amount:1850,status:"Approved",spent_at:h(-6),notes:"Underlayment, flashing, and tile replacement materials.",created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-roofing-mesa-permit",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",vendor_id:"vendor-roofing-materials",category:"Permit",amount:620,status:"Pending",spent_at:h(-2),notes:"Permit and document prep allowance.",created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString()},{id:"expense-drafting-horizon-runner",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",vendor_id:"vendor-drafting-permits",category:"Permit",amount:480,status:"Approved",spent_at:h(-3),notes:"Permit runner package review.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-lumen-software-stack",company_id:"lumen",job_id:"",vendor_id:"vendor-lumen-software",category:"Software",amount:540,status:"Paid",spent_at:h(-5),notes:"Client onboarding software stack.",created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()}],n={route:null,session:Ce(he,null),profileDraft:Ce(fa,null),authReady:!1,authMode:"signin",jobs:V(ba,yi).map(Ae),tasks:V(ga,$i).map(Te),files:V(va,wi).map(Ge),driveFolders:V(ya,[]).map(Ga),forms:V(Pe,Si).map(ct),formResponses:V(jt,ki).map(Za),financeInvoices:V($a,Di).map(Vt),financePayments:V(wa,Ci).map(Jt),financeExpenses:V(Sa,qi).map(Bt),financeVendors:V(ka,ji).map(Ht),timeEntries:Ce(Dt,[]),activeTimer:Ce(Ct,null),teamMembers:V(_a,_i).map(Xa),memberships:V(ha,hi),profiles:[],subscriptions:[],roles:[],rolePermissions:[],roleAssignments:[],resourceAcl:[],fieldPermissions:[],companyInvites:[],joinRequests:[],auditEvents:[],companies:wt($e.map(xe)),activeCompanyId:localStorage.getItem(Se)||"",selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",selectedFinanceInvoiceId:"",selectedFinanceExpenseId:"",selectedFinanceVendorId:"",expandedFormIds:new Set,formStartTemplateId:"",formStartTab:"blank",query:"",fileQuery:"",formQuery:"",crmQuery:"",stageFilter:"all",crmStageFilter:"all",crmOwnerFilter:"all",taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(ja)||"table",driveFolder:"home",driveView:localStorage.getItem(Da)||"list",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",authMessage:"",modal:""},tt=document.getElementById("app");let bt=null;Fi();function Fi(){Os(),window.addEventListener("popstate",u),document.addEventListener("click",ls),document.addEventListener("submit",ps),document.addEventListener("input",_s),document.addEventListener("change",hs),Ii(),u()}async function Ii(){const e=N();if(!e?.auth){n.authReady=!0,n.loginError="Supabase auth is unavailable in this browser session.";return}try{const{data:t}=await e.auth.getSession();await Fe(t?.session||null),e.auth.onAuthStateChange((a,i)=>{Fe(i||null).finally(()=>{n.dataLoaded=!1,u()})})}catch(t){n.loginError=t.message||"Unable to initialize Supabase auth."}finally{n.authReady=!0,u()}}async function Fe(e){if(!e?.user){n.session=null,localStorage.removeItem(he);return}const t=await xi(e.user);n.session=br(e,t),I(he,n.session)}async function xi(e){const t={id:e.id,email:e.email||"",full_name:e.user_metadata?.full_name||e.email||"Quest user",role:"member",role_label:"Member",member_id:"",company_ids:[],avatar_url:"",approved:!1},a=N();if(!a)return t;const i=await a.from("profiles").select("*").eq("id",e.id).maybeSingle();return i.error||!i.data?t:zt(i.data,t)}function u(){if(n.route=at(),!n.authReady){Mi();return}if(Ti(n.route)){S("/login?return_url="+encodeURIComponent(Rs()),{replace:!0});return}if(n.route.name==="login"){Kn();return}if(Ei(),n.session?.auth==="supabase"&&n.dataLoaded&&!ke().length){Ai();return}const e=Ps(n.route);if(e){S(e,{replace:!0});return}Vs(n.route),Pa(n.route),n.route.params.get("account")==="profile"&&(n.modal="profile"),document.title=`${Ns(n.route)} | ${k(p())} | Quest HQ`,tt.innerHTML=Ri(n.route,Ea(n.route))}function Ai(){document.title="Company access pending | Quest HQ",tt.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Access pending</small></span>
        </div>
        <div>
          <div class="eyebrow">Tenant security</div>
          <h1>No active company access</h1>
          <p>Your account exists, but you are not an active member of a company workspace yet. Create your own workspace or request access from an existing company.</p>
        </div>
        <form data-company-create-form>
          <label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>
          <button class="btn btn-primary full" type="submit">Create company workspace</button>
          <div class="form-message">You will become the Owner for this workspace.</div>
        </form>
        <button class="btn full" type="button" data-action="sign-out">Sign out</button>
      </section>
    </main>
  `}function Ti(e){return e.name==="login"?!1:!n.session}function Mi(){document.title="Loading | Quest HQ",tt.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${g("Checking secure session...")}
      </section>
    </main>
  `}function Ei(){n.dataLoaded||n.dataLoading||(n.dataLoading=!0,Oi().catch(()=>{n.sync={label:"Local fallback",mode:"local"}}).finally(()=>{n.dataLoaded=!0,n.dataLoading=!1,B(),u()}))}async function Oi(){const e=N();if(!e){n.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,i,s,o,c,l,m,y,f,j,L,C,H,je,le]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*"),e.from("profiles").select("*"),e.from("company_subscriptions").select("*"),e.from("roles").select("*").order("priority",{ascending:!1}),e.from("role_permissions").select("*"),e.from("user_role_assignments").select("*"),e.from("resource_acl").select("*"),e.from("field_permissions").select("*"),e.from("company_invites").select("*").order("created_at",{ascending:!1}),e.from("company_join_requests").select("*").order("created_at",{ascending:!1}),e.from("audit_events").select("*").order("created_at",{ascending:!1}).limit(100)]);let W=0;t.error||(n.companies=t.data?.length?wt($e.concat(t.data).map(xe)):wt($e.map(xe)),W+=1),a.error||(a.data?.length&&(n.jobs=a.data.map(Ae)),W+=1),i.error||(i.data?.length&&(n.tasks=i.data.map(Te)),W+=1),s.error||(s.data?.length&&(n.files=s.data.map(Ge)),W+=1),o.error||(o.data?.length&&(n.teamMembers=o.data.map(Xa)),W+=1),c.error||(c.data?.length&&(n.memberships=c.data.map(er)),W+=1),l.error||(n.profiles=(l.data||[]).map(fi=>zt(fi)),W+=1),m.error||(n.subscriptions=(m.data||[]).map(tr),W+=1),y.error||(n.roles=(y.data||[]).map(ve),W+=1),f.error||(n.rolePermissions=(f.data||[]).map(St)),j.error||(n.roleAssignments=(j.data||[]).map(ar)),L.error||(n.resourceAcl=(L.data||[]).map(ir)),C.error||(n.fieldPermissions=(C.data||[]).map(nr)),H.error||(n.companyInvites=(H.data||[]).map(sr)),je.error||(n.joinRequests=(je.data||[]).map(rr)),le.error||(n.auditEvents=le.data||[]),n.sync=W?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function N(){return!window.supabase||typeof window.supabase.createClient!="function"?null:(bt||(bt=window.supabase.createClient(_e.supabaseUrl,_e.supabaseKey)),bt)}function Pi(){return`
    <svg class="svg-sprite" aria-hidden="true" focusable="false">
      <symbol id="q-logo" viewBox="0 0 32 32">
        <path d="M4 25V12.8L16 5l12 7.8V25h-6.2v-9.2H10.2V25H4Z" />
        <path d="M10.2 15.8 16 11.9l5.8 3.9" />
        <path d="M12 21h8" />
      </symbol>
      <symbol id="q-company" viewBox="0 0 24 24">
        <path d="M4 20V8l8-4 8 4v12" />
        <path d="M8 20v-7h8v7" />
        <path d="M9 9h.1M12 8h.1M15 9h.1" />
      </symbol>
      <symbol id="q-search" viewBox="0 0 24 24">
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m16 16 4.3 4.3" />
      </symbol>
      <symbol id="q-empty" viewBox="0 0 24 24">
        <path d="M5 18.5V7.7L12 4l7 3.7v10.8" />
        <path d="M8 12h8M9.5 15h5" />
      </symbol>
      <symbol id="q-symbol-jobs" viewBox="0 0 24 24">
        <path d="M5 20V8h14v12H5Z" />
        <path d="M9 8V5h6v3M8 12h8M8 16h5" />
      </symbol>
      <symbol id="q-symbol-tasks" viewBox="0 0 24 24">
        <path d="M6 7h12M6 12h12M6 17h12" />
        <path d="m4 7 .9.9L6.4 6.4M4 12l.9.9 1.5-1.5M4 17l.9.9 1.5-1.5" />
      </symbol>
      <symbol id="q-symbol-files" viewBox="0 0 24 24">
        <path d="M4 19.5V6h6l2 2h8v11.5H4Z" />
        <path d="M4 10h16" />
      </symbol>
      <symbol id="q-symbol-forms" viewBox="0 0 24 24">
        <path d="M7 4h10v16H7V4Z" />
        <path d="M9.5 8h5M9.5 12h5M9.5 16h3" />
      </symbol>
      <symbol id="q-symbol-analytics" viewBox="0 0 24 24">
        <path d="M5 19V5" />
        <path d="M5 19h14" />
        <path d="M8 16v-4M12 16V8M16 16v-6" />
      </symbol>
      <symbol id="q-symbol-crm" viewBox="0 0 24 24">
        <circle cx="9" cy="9" r="3" />
        <path d="M3.8 19c.8-3 2.5-4.5 5.2-4.5s4.4 1.5 5.2 4.5" />
        <path d="M15.5 8.2a2.7 2.7 0 1 1 0 5.4M16.8 15.2c1.8.6 3 1.9 3.6 3.8" />
      </symbol>
      <symbol id="q-symbol-tickets" viewBox="0 0 24 24">
        <path d="M4 8.5h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4v-3Z" />
        <path d="M9 9v10" />
      </symbol>
      <symbol id="q-symbol-finance" viewBox="0 0 24 24">
        <path d="M6 4h12v16H6V4Z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
        <path d="M15.5 14.5c0 1.4-1 2.5-3.2 2.5" />
      </symbol>
      <symbol id="q-symbol-knowledge" viewBox="0 0 24 24">
        <path d="M5 5.5c2.8-.8 5-.4 7 1.2 2-1.6 4.2-2 7-1.2V19c-2.8-.8-5-.4-7 1.2-2-1.6-4.2-2-7-1.2V5.5Z" />
        <path d="M12 6.7v13.5" />
      </symbol>
      <symbol id="q-symbol-automations" viewBox="0 0 24 24">
        <path d="M7 8a4 4 0 0 1 8 0c0 3-4 3.5-4 7" />
        <path d="M9 20h4M10 17h2M16.5 13.5l3 3M20 13l-3.5 3.5" />
      </symbol>
      <symbol id="q-symbol-templates" viewBox="0 0 24 24">
        <path d="M5 5h14v14H5V5Z" />
        <path d="M5 10h14M10 10v9" />
      </symbol>
      <symbol id="q-symbol-users" viewBox="0 0 24 24">
        <circle cx="8.5" cy="9" r="3" />
        <circle cx="16" cy="10" r="2.5" />
        <path d="M3.8 19c.8-3 2.3-4.5 4.7-4.5s3.9 1.5 4.7 4.5M13.4 15.3c2.6 0 4.2 1.2 4.8 3.7" />
      </symbol>
      <symbol id="q-symbol-settings" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.8v2.4M12 17.8v2.4M4.9 6l1.7 1.7M17.4 16.3l1.7 1.7M3.8 12h2.4M17.8 12h2.4M4.9 18l1.7-1.7M17.4 7.7 19.1 6" />
      </symbol>
      <symbol id="q-symbol-team-chart" viewBox="0 0 24 24">
        <path d="M12 5v5M7 15v4M17 15v4M7 15h10M12 10h-5v5M12 10h5v5" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="7" cy="20" r="2" />
        <circle cx="17" cy="20" r="2" />
      </symbol>
      <symbol id="q-symbol-time" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5V12l3 2" />
      </symbol>
      <symbol id="q-symbol-approvals" viewBox="0 0 24 24">
        <path d="M5 12.5 9.2 17 19 7" />
        <path d="M5 5h14v14H5V5Z" />
      </symbol>
      <symbol id="q-symbol-team-workload" viewBox="0 0 24 24">
        <path d="M4 18c.7-2.7 2.1-4 4.2-4s3.5 1.3 4.2 4M12.5 18c.7-2.7 2.1-4 4.2-4s3.5 1.3 4.2 4" />
        <circle cx="8.2" cy="9" r="3" />
        <circle cx="16.7" cy="9" r="3" />
      </symbol>
      <symbol id="q-symbol-clock" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 6.8v5.4l3.7 2.1" />
        <path d="M5 4.8 3.5 6.3M19 4.8l1.5 1.5" />
      </symbol>
    </svg>
  `}function G(e,t="symbol-icon"){return`<svg class="${r(t)}" aria-hidden="true" focusable="false"><use href="#${r(e)}"></use></svg>`}function Ta(e=n.route?.section||"jobs"){return Xe.find(t=>t.id===e)?.symbol||"q-empty"}function Ma(e){const t=String(e||"").toLowerCase();return t.includes("job")||t.includes("pipeline")?"q-symbol-jobs":t.includes("task")||t.includes("review")?"q-symbol-tasks":t.includes("file")?"q-symbol-files":t.includes("form")?"q-symbol-forms":t.includes("account")||t.includes("customer")||t.includes("member")||t.includes("user")||t.includes("lead")?"q-symbol-crm":t.includes("invoice")||t.includes("collected")||t.includes("expense")||t.includes("net")||t.includes("outstanding")?"q-symbol-finance":t.includes("time")||t.includes("today")||t.includes("days")||t.includes("timer")||t.includes("entries")?"q-symbol-clock":t.includes("approval")||t.includes("access")?"q-symbol-approvals":Ta()}function Ri(e,t){const a=E(),i=p();return`
    <div class="quest-app" data-route="${r(e.name)}">
      ${Pi()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${b(d("jobs",{},i))}" data-router aria-label="Quest HQ workspace">
            ${G("q-logo","brand-symbol")}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${r(_e.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${G("q-company")}
            <select data-company-switch aria-label="Active company">
              ${Wa().map(s=>`<option value="${r(s.id)}" ${s.id===i?"selected":""}>${r(rt(s))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            ${G("q-search")}
            <input data-global-search value="${r(n.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${r(n.sync.mode)}" data-sync-state>${r(n.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          <div class="account-menu">
            <button class="avatar-button" type="button" data-action="open-profile" aria-label="Open Quest profile">
              ${ut(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${r(a.profile.full_name)}</strong>
              <span>${r(a.profile.role_label)} - ${r(k(i))}</span>
              <button type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
              <button type="button" data-action="sign-out"><i class="ti ti-logout"></i>Sign out</button>
            </div>
          </div>
        </div>
      </header>
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${Ni(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
    </div>
    ${Xn(e,a)}
  `}function Ni(e){const t=p();return`
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${r(se(t))}">${G("q-company")}</span>
      <div>
        <strong>${r(k(t))}</strong>
        <small>${r(ot(t))} workspace</small>
      </div>
    </div>
    ${["Workspace","Company","Operations"].map(a=>Li(a,Xe.filter(i=>i.group===a&&Vi(i,t)).map(i=>i.status==="planned"?Qi(i.symbol,i.label):Ui(e,d(i.id,{},t),i.symbol,i.label,Ji(i.id,t))))).join("")}
  `}function Li(e,t){return`
    <section class="side-group">
      <div class="side-label">${r(e)}</div>
      <div class="side-items">${t.join("")}</div>
    </section>
  `}function Ui(e,t,a,i,s=""){return`
    <a class="side-item ${Ls(e,t)?"active":""}" href="${b(t)}" data-router>
      ${G(a)}
      <span>${r(i)}</span>
      ${s!==""?`<b>${r(String(s))}</b>`:""}
    </a>
  `}function Qi(e,t){return`
    <button class="side-item planned" type="button" disabled aria-disabled="true">
      ${G(e)}
      <span>${r(t)}</span>
      <b>Planned</b>
    </button>
  `}function Vi(e,t=p()){return e.status==="planned"?!0:!Qt(t)&&!["settings","users"].includes(e.id)?!1:Ya(e.permission||`${e.id}.view`,t)}function Ji(e,t=p()){return e==="jobs"?A(t).length:e==="tasks"?z(t).length:e==="files"?pe(t).length:e==="forms"?re(t).length:e==="crm"?it(t).length:e==="finance"?ue(t).length:e==="users"?ne(t).length:e==="time"?Na(t).focus.length:e==="approvals"?La(t).length:e==="clock"&&nt(t)?"On":""}function It(e,t){return`
    <nav class="tabbar compact-tabbar" aria-label="${r(e)}">
      ${t.map(([a,i,s])=>`<a class="${s?"active":""}" href="${b(a)}" data-router>${r(i)}</a>`).join("")}
    </nav>
  `}function Ea(e){if(e.name==="command")return zi(p());if(e.name!=="company")return sa(e.name);const t=e.companyId,a=Xe.find(i=>i.id===e.section);if(a?.status!=="planned"){if(!Qt(t)&&!["settings","users"].includes(e.section))return Bi(t);if(a?.permission&&!Ya(a.permission,t))return Hi(t,a.permission)}return e.section==="jobs"?Yi(e,t):e.section==="tasks"?en(e,t):e.section==="files"?rn(e,t):e.section==="users"?_n(e,t):e.section==="settings"?$n(e,t):e.section==="forms"?jn(t):e.section==="analytics"?Wi(e,t):e.section==="crm"?Pn(e,t):e.section==="finance"?Nn(e,t):e.section==="team-chart"?hn(t):e.section==="time"||e.section==="approvals"||e.section==="clock"?Hn(e,t):sa(e.section)}function Bi(e){return`
    ${U("Subscription required","This company workspace needs an active or trialing subscription before paid modules can open.",`
      <a class="btn btn-primary" href="${b(d("settings",{tab:"billing"},e))}" data-router><i class="ti ti-credit-card"></i>Billing</a>
    `)}
    <section class="panel">
      ${P([["Company",k(e)],["Subscription",Ka(e)],["Allowed area","Billing and settings remain available to owners/admins"]])}
    </section>
  `}function Hi(e,t){return`
    ${U("Access denied","Your role does not include the permission required for this module.",`
      <a class="btn" href="${b(d("settings",{tab:"roles"},e))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${P([["Company",k(e)],["Required permission",t],["Your role",ot(e)]])}
    </section>
  `}function zi(e){const t=A(e),a=z(e),i=a.filter(o=>["critical","urgent"].includes(o.priority)),s=pe(e);return`
    ${U("Company dashboard","Live context for this company workspace.",`
      <a class="btn" href="${b(d("files",{},e))}" data-router><i class="ti ti-folder"></i>Open drive</a>
      <a class="btn btn-primary" href="${b(d("jobs",{},e))}" data-router><i class="ti ti-briefcase"></i>Open jobs</a>
    `)}
    ${gr([["Jobs",t.length],["Open tasks",a.filter(o=>o.status!=="done").length],["Urgent tasks",i.length],["Drive files",s.length]])}
    <section class="dashboard-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Priority work</h2><p>Tasks and jobs filtered by the active company.</p></div>
          <a class="btn" href="${b(d("tasks",{},e))}" data-router>Open tasks</a>
        </div>
        <div class="queue-list">
          ${a.slice(0,6).map(o=>pt(o)).join("")||g("No tasks in this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Company scope</h2><p>Client-side filtering while auth is disabled.</p></div></div>
        ${P([["Company",k(e)],["Visible users",ne(e).length],["Auth mode","Supabase auth"],["RLS status","Ready for enforcement"]])}
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Job queue</h2><p>Workspace records without leaving the Quest shell.</p></div></div>
        <div class="queue-list">
          ${t.slice(0,8).map(o=>vr(o)).join("")||g("No jobs in this company yet.")}
        </div>
      </article>
    </section>
  `}function Wi(e,t){const a=e.jobId?D(e.jobId):null,i=a?[a]:A(t),s=z(t).filter(f=>!a||f.project_id===a.id),o=pe(t).filter(f=>!a||f.job_id===a.id),c=re(t).filter(f=>!a||f.linked_job_id===a.id),l=s.filter(f=>f.status!=="done"),m=s.filter(f=>f.status!=="done"&&f.due&&new Date(f.due)<ft()),y=K(i,"estimate_total");return`
    <section class="analytics-workspace">
      <section class="analytics-toolbar panel">
        <div>
          <strong>Analytics</strong>
          <span>${r(a?a.name:k(t))}</span>
        </div>
        <label>
          <span>Job</span>
          <select data-analytics-job-filter>
            <option value="">All jobs</option>
            ${A(t).map(f=>`<option value="${r(f.id)}" ${a?.id===f.id?"selected":""}>${r(f.name)}</option>`).join("")}
          </select>
        </label>
        <a class="btn" href="${b(d("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      </section>
      <section class="analytics-grid">
        <article class="panel analytics-score">
          <span>Open work</span>
          <strong>${r(l.length)}</strong>
          <small>${r(m.length)} overdue / ${r(s.filter(f=>f.priority==="urgent"||f.priority==="critical").length)} urgent</small>
        </article>
        <article class="panel analytics-score">
          <span>Pipeline value</span>
          <strong>${r(v(y))}</strong>
          <small>${r(i.length)} visible job${i.length===1?"":"s"}</small>
        </article>
        <article class="panel analytics-score">
          <span>Drive and forms</span>
          <strong>${r(o.length+c.length)}</strong>
          <small>${r(o.length)} files / ${r(c.length)} forms</small>
        </article>
        <article class="panel analytics-score">
          <span>Completion</span>
          <strong>${r(zr(s.filter(f=>f.status==="done").length,s.length))}</strong>
          <small>${r(s.filter(f=>f.status==="done").length)} done of ${r(s.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${i.map(f=>`
              <a class="analytics-row" href="${b(d("analytics",{job_id:f.id},t))}" data-router>
                <span><strong>${r(f.name)}</strong><small>${r(f.client_name||k(t))}</small></span>
                <span>${r(f.stage)}</span>
                <span>${r(lt(f.id))}</span>
                <span>${r(Ke(f.id))}</span>
                <span>${r(v(f.estimate_total))}</span>
              </a>
            `).join("")||g("No jobs to analyze yet.")}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${Ne.map(f=>{const j=s.filter(L=>L.status===f).length;return`<div><span>${r(oe(f))}</span><b><i style="width:${r(mi(j,s.length))}%"></i></b><strong>${r(j)}</strong></div>`}).join("")}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${s.filter(f=>f.status!=="done").sort((f,j)=>we(j.priority)-we(f.priority)).slice(0,8).map(f=>pt(f)).join("")||g("No open tasks in this scope.")}
          </div>
        </article>
      </section>
    </section>
  `}function Yi(e,t){const a=Us(e.params.get("tab")),i=de();return`
    ${U("Jobs","Company job records, clients, scope, and linked work.",`
      <a class="btn" href="${b(d("files",i?{job_id:i.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <section class="job-toolbar">
      <label>
        <span>Stage</span>
        <select data-stage-filter>
          ${["all"].concat(Re).map(s=>`<option value="${r(s)}" ${n.stageFilter===s?"selected":""}>${r(s==="all"?"All stages":s)}</option>`).join("")}
        </select>
      </label>
      <div class="selected-job-chip">
        <span>Selected job</span>
        <strong>${i?r(i.name):"No job selected"}</strong>
      </div>
    </section>
    <nav class="tabbar" aria-label="Job sections">
      ${Ca.map(s=>`<a class="${s===a?"active":""}" href="${b(d("jobs",{tab:s,...i?{job_id:i.id}:{}},t))}" data-router>${r(Qs(s))}</a>`).join("")}
    </nav>
    ${Ki(a,t,i)}
  `}function Ki(e,t,a){return e==="pipeline"?ea(t):e==="list"?Gi(t):e==="profile"?Zi(t,a):ea(t)}function ea(e){const t=Ra(e);return`
    <section class="job-board">
      ${Re.map(a=>{const i=t.filter(s=>s.stage===a);return`
          <article class="job-lane">
            <h2><span>${r(a)}</span><b>${i.length}</b></h2>
            ${i.map(s=>yr(s)).join("")||'<div class="lane-empty">No jobs</div>'}
          </article>
        `}).join("")}
    </section>
  `}function Gi(e){const t=Ra(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Job list</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Tasks</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===n.selectedJobId?"active":""}" type="button" data-select-job="${r(a.id)}">
            <span><strong>${r(a.name)}</strong><small>${r(a.client_name||"No client")} - ${r(a.site_address||"No address")}</small></span>
            <span>${r(a.stage)}</span>
            <span>${Wt(a.priority)}</span>
            <span>${r(a.owner_name||"Unassigned")}</span>
            <span>${r(lt(a.id))}</span>
            <span>${v(a.estimate_total)}</span>
          </button>
        `).join("")||g("No jobs match this view.")}
      </div>
    </section>
  `}function Zi(e,t){return t?`
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${r(k(e))} - ${r(t.job_type)}</span>
          <h2>${r(t.name)}</h2>
          <p>${r(t.scope||"No scope written yet.")}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${P([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",v(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${b(d("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(t.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${Je(d("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${lt(t.id)} linked tasks`)}
          ${Je(d("files",{job_id:t.id},e),"ti-folder","Files",`${Ke(t.id)} files`)}
          ${Je(d("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${Je(d("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:g("Create a job to see the profile workspace.")}function Xi(e,t){const a=t||or(e);return`
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${$("Workspace name","name",a.name,!0)}
      ${M("Company","company_id",e,Wa().map(i=>[i.id,rt(i)]))}
      ${$("Client","client_name",a.client_name)}
      ${$("Contact","contact_name",a.contact_name)}
      ${$("Account owner","owner_name",a.owner_name)}
      ${$("Job type","job_type",a.job_type||"Roofing")}
      ${M("Business status","stage",a.stage||"Lead",Re.map(i=>[i,i]))}
      ${M("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(i=>[i,i]))}
      ${$("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${$("Invoice total","invoice_total",a.invoice_total||0,!1,"number")}
      ${$("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${ie("Scope","scope",a.scope,"span-2")}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function en(e,t){const a=e.jobId?D(e.jobId):null,i=Xs(t,a?.id);return`
    ${U(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${b(d("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${b(d("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${tn(t,a)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${n.taskView==="board"?nn(t,i):an(t,i)}
      </article>
    </section>
  `}function tn(e,t){return`
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${A(e).map(i=>`<option value="${r(i.id)}" ${t?.id===i.id?"selected":""}>${r(i.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${["all"].concat(Ne).map(i=>`<option value="${r(i)}" ${n.taskStatusFilter===i?"selected":""}>${r(i==="all"?"All statuses":oe(i))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(Ye).map(i=>`<option value="${r(i)}" ${n.taskPriorityFilter===i?"selected":""}>${r(i==="all"?"All priorities":O(i))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${n.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${n.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function an(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===n.selectedTaskId?"active":""}" type="button" data-select-task="${r(a.id)}">
          <span><strong>${r(a.title)}</strong><small>${r(a.description||Qe(a.type))}</small></span>
          <span>${r(D(a.project_id)?.name||"Company task")}</span>
          <span>${r(J(a.assignee_id))}</span>
          <span>${ei(a.priority)}</span>
          <span>${ti(a.status)}</span>
          <span>${T(a.due)}</span>
        </button>
      `).join("")||g("No tasks match this workspace view.")}
    </div>
  `}function nn(e,t){return`
    <div class="task-board">
      ${Ne.map(a=>{const i=t.filter(s=>s.status===a);return`
          <section class="task-column">
            <h2><span>${r(oe(a))}</span><b>${i.length}</b></h2>
            ${i.map(s=>`
              <button class="task-card priority-${r(s.priority)}" type="button" data-select-task="${r(s.id)}">
                <strong>${r(s.title)}</strong>
                <span>${r(D(s.project_id)?.name||k(e))}</span>
                <small>${r(J(s.assignee_id))} - ${T(s.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function sn(e,t){return t?`
    <div class="section-head">
      <div><h2>${r(t.title)}</h2><p>${r(D(t.project_id)?.name||k(e))}</p></div>
      <a class="btn" href="${b(d("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${P([["Status",oe(t.status)],["Priority",O(t.priority)],["Type",Qe(t.type)],["Assignee",J(t.assignee_id)],["Due",T(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${r(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${g("No task selected.")}
    `}function ta(e,t,a){const i=a||lr(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${r(a?i.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${$("Task title","title",i.title,!0)}
      ${M("Job","project_id",i.project_id||"",[["","Company-level task"]].concat(A(e).map(s=>[s.id,s.name])))}
      ${M("Status","status",i.status,Ne.map(s=>[s,oe(s)]))}
      ${M("Priority","priority",i.priority,Ye.map(s=>[s,O(s)]))}
      ${M("Type","type",i.type,qa.map(s=>[s,Qe(s)]))}
      ${M("Assignee","assignee_id",i.assignee_id,ne(e).map(s=>[s.id,J(s.id)]))}
      ${$("Due date","due",i.due||h(1),!0,"date")}
      ${ie("Description","description",i.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${r(a.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function rn(e,t){const a=e.params.get("folder")||n.driveFolder||"home";n.driveFolder=a;const i=e.jobId?D(e.jobId):null,s=Sr(t,a,i?.id||"");return`
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${r(i?i.name:"Company Drive")}</strong>
              <small>${r(i?`${i.client_name||k(t)} file workspace`:`${k(t)} file manager`)}</small>
            </div>
          </div>
          <label class="drive-search">
            <i class="ti ti-search"></i>
            <input data-file-search value="${r(n.fileQuery)}" placeholder="Search drive" />
          </label>
          <div class="drive-actions">
            <button class="btn" type="button" data-action="open-folder-form"><i class="ti ti-folder-plus"></i>New folder</button>
            <button class="btn" type="button" data-action="open-file-upload"><i class="ti ti-upload"></i>Upload</button>
            <button class="btn icon-only" type="button" data-action="refresh-data" title="Refresh" aria-label="Refresh"><i class="ti ti-refresh"></i></button>
          </div>
        </header>
        <div class="drive-shell drive-shell-compact">
          <div class="drive-main">
            <section class="drive-crumb-row">
              <nav class="breadcrumbs" aria-label="Drive location">
                <a href="${b(d("files",{},t))}" data-router>${r(k(t))}</a>
                ${a!=="home"?wr(t,a,i):""}
                ${i?`<span>/</span><strong>${r(i.name)}</strong>`:""}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${n.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${n.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${on(t,a,i,s)}
          </div>
        </div>
      </section>
    </section>
  `}function on(e,t,a,i){const s=hr(e,t,a),o=s.map(l=>({kind:"folder",...l})).concat(i.map(l=>({kind:"file",file:l}))),c=a?a.name:t==="home"?"This folder":ee(t);return`
    <section class="drive-section-title">
      <div><h3>${r(c)}</h3><span>${s.length} folder${s.length===1?"":"s"} / ${i.length} file${i.length===1?"":"s"}</span></div>
    </section>
    ${n.driveView==="list"?ln(o):cn(o)}
  `}function ln(e){return`
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${e.map(t=>t.kind==="folder"?pn(t):un(t.file)).join("")||g("This folder is empty.")}
    </div>
  `}function cn(e){return`
    <section class="drive-folder-grid explorer-grid">
      ${e.map(t=>t.kind==="folder"?dn(t):fn(t.file)).join("")||g("This folder is empty.")}
    </section>
  `}function dn(e){return`
    <a class="drive-folder-card explorer-folder" href="${r(e.href)}" data-router>
      <span class="drive-folder-icon"><i class="ti ${r(e.icon||"ti-folder")}"></i></span>
      <strong>${r(e.name)}</strong>
      <em>${r(e.countLabel||"0 items")}</em>
    </a>
  `}function pn(e){return`
    <a class="explorer-row folder-row-live" href="${r(e.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder"><i class="ti ${r(e.icon||"ti-folder")}"></i></span><strong>${r(e.name)}</strong></span>
      <span>${r(e.updatedLabel||"")}</span>
      <span>Folder</span>
      <span>${r(e.countLabel||"")}</span>
    </a>
  `}function un(e){return`
    <button type="button" class="explorer-row ${e.id===n.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}" role="row">
      <span class="explorer-name">${mn(e)}<strong>${r(e.file_name)}</strong></span>
      <span>${T(e.updated_at||e.created_at)}</span>
      <span>${r(fe(e))}</span>
      <span>${Gt(e.size_bytes)}</span>
    </button>
  `}function mn(e){return`
    <span class="file-type ${r(Yt(e))}">
      <i class="ti ${r(pi(e))}"></i>
      <small>${r(kr(e))}</small>
    </span>
  `}function fn(e){return`
    <button type="button" class="file-card-live ${e.id===n.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}">
      <span class="file-thumb">${Kt(e)}</span>
      <strong>${r(e.file_name)}</strong>
      <span>${r(fe(e))} / ${Gt(e.size_bytes)}</span>
    </button>
  `}function bn(e,t){return`
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${gn(e)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${Kt(e)}
          <div>
            <strong>${r(e.file_name)}</strong>
            <span>${r(fe(e))} / ${Gt(e.size_bytes)}</span>
          </div>
        </div>
        <div class="file-detail-list">
          ${ce("Location",ee(e.folder))}
          ${ce("Job",D(e.job_id)?.name||"Company shared")}
          ${ce("Uploaded by",e.uploaded_by_label||"Quest HQ")}
          ${ce("Modified",T(e.updated_at||e.created_at))}
          ${ce("Storage",e.object_path||"Metadata only")}
        </div>
        <div class="file-detail-actions">
          <button class="btn" type="button" data-action="download-file" data-file-id="${r(e.id)}"><i class="ti ti-download"></i>Download</button>
          <button class="btn danger" type="button" data-action="delete-file" data-file-id="${r(e.id)}"><i class="ti ti-trash"></i>Delete</button>
        </div>
      </aside>
    </section>
  `}function gn(e){const t=Yt(e);return e.signed_url&&t==="image"?`<img class="file-preview-media" src="${r(e.signed_url)}" alt="" />`:e.signed_url&&t==="pdf"?`<iframe class="file-preview-frame" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:e.signed_url&&t==="text"?`<iframe class="file-preview-frame text" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:["doc","sheet"].includes(t)&&e.signed_url?`<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:`
    <div class="file-preview-empty">
      ${Kt(e,!0)}
      <strong>${r(fe(e))} preview</strong>
      <p>${r(e.object_path?"Preview will load when a signed file URL is available.":"This is a metadata-only file record. Upload the actual file object to preview it here.")}</p>
      ${e.notes?`<pre>${r(e.notes)}</pre>`:""}
    </div>
  `}function vn(){const e=p(),t=n.route||at(),a=t.params.get("folder")||n.driveFolder||"home",i=t.jobId?D(t.jobId):null;return q("Drive","New folder",`
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${r(e)}" />
      <input type="hidden" name="parent_key" value="${r(ii(a,i))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${r(a==="home"?k(e):i?.name||ee(a))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"task-modal")}function yn(){const e=p(),t=n.route?.params?.get("folder")||(n.driveFolder==="home"?"shared":n.driveFolder),a=n.route?.jobId||"";return`
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">${r(k(e))} Drive</div><h2 id="upload-title">Upload files</h2></div>
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
          ${$("Metadata-only file name","file_name","")}
          ${M("Folder","folder",t,Jr(e))}
          ${M("Job","job_id",a,[["","Company shared file"]].concat(A(e).map(i=>[i.id,i.name])))}
          ${M("Category","category",ee(t),vi.filter(i=>i!=="All categories").map(i=>[i,i]))}
          ${$("Uploaded by","uploaded_by_label",E().profile.full_name||"Quest HQ")}
          ${ie("Notes","notes","","span-2")}
          <div class="form-actions span-2">
            <button class="btn btn-primary" type="submit">Upload to drive</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
            <button class="btn" type="reset">Clear</button>
          </div>
          <div class="file-upload-log span-2">
            <strong>Upload target</strong>
            <span>${r(e)}/${r(a?`jobs/${a}`:t)}</span>
          </div>
        </form>
      </div>
    </div>
  `}function _n(e,t){const a=ne(t),i=["members","access"].includes(e.params.get("tab"))?e.params.get("tab"):"members",s=n.joinRequests.filter(o=>o.company_id===t&&o.status==="pending");return`
    ${U("Users","Company members, roles, workers, and access context.",`
      <a class="btn btn-primary" href="${b(d("settings",{},t))}" data-router><i class="ti ti-settings"></i>Settings</a>
    `)}
    ${It("Users sections",[[d("users",{tab:"members"},t),"Members",i==="members"],[d("users",{tab:"access"},t),"Access model",i==="access"]])}
    ${i==="members"?`
      <section class="users-grid">
        ${a.map(o=>`
          <article class="user-card">
            ${ut({full_name:o.full_name,avatar_url:o.avatar_url},"avatar")}
            <div>
              <strong>${r(o.full_name)}</strong>
              <span>${r(o.email)}</span>
              <small>${r(Lt(t,o.id))}</small>
            </div>
          </article>
        `).join("")||g("No users assigned to this company yet.")}
      </section>
    `:`
    <section class="panel">
      <div class="section-head"><div><h2>Membership model</h2><p>company_memberships is the canonical table; legacy company_ids remain as backfill fields.</p></div></div>
      ${P([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Supabase Auth + RLS"],["Active role",ot(t)],["Pending requests",String(s.length)]])}
    </section>
    `}
  `}function hn(e){const t=ne(e),a=t.filter(i=>!i.supervisor_id||!t.some(s=>s.id===i.supervisor_id));return`
    <section class="tool-page team-chart-page">
      ${U("Team chart","Reporting lines, roles, and company coverage for this workspace.",`
        <a class="btn" href="${b(d("users",{},e))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${b(d("settings",{tab:"team"},e))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${w("Members",t.length)}
        ${w("Leads",a.length)}
        ${w("Open tasks",z(e).filter(Et).length)}
        ${w("Active timer",nt(e)?"Yes":"No")}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${a.map(i=>Oa(e,i,t)).join("")||g("No workers assigned.")}
        </div>
      </section>
    </section>
  `}function Oa(e,t,a,i=0){const s=a.filter(o=>o.supervisor_id===t.id);return`
    <article class="team-node" style="--depth:${i}">
      <div class="team-node-card">
        ${ut({full_name:t.full_name,avatar_url:t.avatar_url},"avatar")}
        <span><strong>${r(t.full_name)}</strong><small>${r(Lt(e,t.id))}</small></span>
        <b>${z(e).filter(o=>o.assignee_id===t.id&&Et(o)).length} open</b>
      </div>
      ${s.length?`<div class="team-node-children">${s.map(o=>Oa(e,o,a,i+1)).join("")}</div>`:""}
    </article>
  `}function $n(e,t){const a=st(t),i=["company","billing","roles","access","team"].includes(e.params.get("tab"))?e.params.get("tab"):"company";return`
    ${U("Settings","Company settings, roles, approvals, and admin controls.","")}
    ${It("Settings sections",[[d("settings",{tab:"company"},t),"Company",i==="company"],[d("settings",{tab:"billing"},t),"Billing",i==="billing"],[d("settings",{tab:"roles"},t),"Roles",i==="roles"],[d("settings",{tab:"access"},t),"Access",i==="access"],[d("settings",{tab:"team"},t),"Workers",i==="team"]])}
    <section class="dashboard-grid compact-settings-grid">
      ${i==="company"?`
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${P([["Name",k(t)],["Company ID",t],["Color",a?.color||se(t)],["Visible jobs",A(t).length]])}
      </article>
      `:""}
      ${i==="billing"?wn(t):""}
      ${i==="roles"?Sn(t):""}
      ${i==="access"?`
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${P([["Auth switch","Enabled"],["Local login","Disabled"],["Isolation","Server-enforced when migration is applied"],["Memberships",String(n.memberships.filter(s=>s.company_id===t).length)],["Invites",String(n.companyInvites.filter(s=>s.company_id===t&&s.status==="pending").length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${n.joinRequests.filter(s=>s.company_id===t).map(s=>ye(s.requested_email||s.profile_id,s.message||"Access request",O(s.status),s.created_at)).join("")||g("No pending company approvals.")}
        </div>
      </article>
      `:""}
      ${i==="team"?`
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${ne(t).map(s=>`<div><strong>${r(s.full_name)}</strong><span>${r(Lt(t,s.id))}</span></div>`).join("")||g("No workers assigned.")}
        </div>
      </article>
      `:""}
    </section>
  `}function wn(e){const t=Ut(e);return`
    <article class="panel">
      <div class="section-head">
        <div><h2>Subscription</h2><p>$300/month company workspace billing gate.</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout"><i class="ti ti-credit-card"></i>Start subscription</button>
      </div>
      ${P([["Plan","$300/month company workspace"],["Status",Ka(e)],["Stripe customer",t?.stripe_customer_id||"Not connected"],["Renewal / trial",t?.current_period_end||t?.trial_ends_at?T(t.current_period_end||t.trial_ends_at):"Pending"]])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules remain available only for trialing, active, past_due, or grace status.</p></div></div>
      ${P([["Workspace access",Qt(e)?"Allowed":"Suspended"],["Finance/files privacy","Requires Auth + RLS"],["Seat billing","Tracked later; not charged in v1"]])}
    </article>
  `}function Sn(e){return`
    <article class="panel span-2">
      <div class="section-head">
        <div><h2>Custom roles</h2><p>Discord-style roles for module, action, record, and field permissions.</p></div>
        <button class="btn btn-primary" type="button" data-action="open-role-form"><i class="ti ti-plus"></i>New role</button>
      </div>
      <div class="roles-list">
        ${Ws(e).map(a=>{const i=n.rolePermissions.filter(o=>o.role_id===a.id&&o.effect==="allow").length,s=n.roleAssignments.filter(o=>o.company_id===e&&o.role_id===a.id).length;return`
            <article class="role-row" style="--role-color:${r(a.color)}">
              <span></span>
              <div><strong>${r(a.name)}</strong><small>${i||"All"} permissions / ${s} users / priority ${a.priority}</small></div>
              <b>${a.is_system?"System":"Custom"}</b>
            </article>
          `}).join("")||g("No custom roles yet.")}
      </div>
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${n.fieldPermissions.filter(a=>a.company_id===e).map(a=>ye(a.field_key,a.resource_type,a.visibility,"")).join("")||g("No field permission overrides yet.")}
      </div>
    </article>
  `}function kn(e){return q("Settings","New role",`
    <form class="role-form" data-role-form>
      ${$("Role name","name","")}
      ${$("Color","color","#f0b23b",!1,"color")}
      ${$("Priority","priority","100",!1,"number")}
      <div class="permission-grid span-2">
        ${bi.map(([t,a])=>`
          <label><input type="checkbox" name="permissions" value="${r(t)}" /> <span>${r(a)}</span></label>
        `).join("")}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function jn(e){const t=jr(e),a=Me(e),i=n.formsTab==="builder"&&a?"builder":n.formsTab==="responses"?"responses":"library";return`
    <section class="tool-page forms-center">
      <div class="forms-command panel">
        <span class="sync-pill live"><i class="ti ti-device-floppy"></i>Local autosafe</span>
        <label>
          <span>Search</span>
          <input data-form-search value="${r(n.formQuery)}" placeholder="Find form, audience, or job" />
        </label>
        <button class="btn" type="button" data-action="open-forms-tools"><i class="ti ti-adjustments"></i>Tools</button>
        <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
      </div>
      ${i==="builder"?"":`
        <nav class="tabbar forms-tabs" aria-label="Forms workspace">
          ${["library","responses"].map(s=>`
            <button class="${i===s?"active":""}" type="button" data-action="set-forms-tab" data-tab="${r(s)}">${r(O(s))}</button>
          `).join("")}
        </nav>
      `}
      ${i==="library"?Dn(e,t,a):""}
      ${i==="builder"?Cn(e,a):""}
      ${i==="responses"?On(e,a):""}
    </section>
  `}function Dn(e,t,a){return`
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${t.length} visible form${t.length===1?"":"s"} in ${r(k(e))}</span>
          </div>
        </div>
        <div class="forms-list forms-list-cards">
          ${t.map(i=>`
            <article class="form-card ${n.expandedFormIds.has(i.id)?"expanded":""} ${a?.id===i.id?"active":""}">
              <span class="form-card-top">
                <i class="ti ti-clipboard-list"></i>
              </span>
              <span class="form-card-main">
                <strong>${r(i.title)}</strong>
                <span>Created by ${r(Dr(i))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${r(i.id)}" aria-expanded="${n.expandedFormIds.has(i.id)?"true":"false"}">
                <i class="ti ${n.expandedFormIds.has(i.id)?"ti-chevron-up":"ti-chevron-down"}"></i>
                ${n.expandedFormIds.has(i.id)?"Less":"Details"}
              </button>
              <span class="form-card-meta">
                <small>${r(i.type)} / ${r(i.audience||"Internal")}</small>
                <small>${ri(i)} questions</small>
                <em>${mt(i.id).length} responses</em>
                <em>Updated ${T(i.updated_at)}</em>
                <em>${r(i.status)}</em>
              </span>
              ${n.expandedFormIds.has(i.id)?`
                <div class="form-card-detail">
                  <p>${r(i.description||"No description yet.")}</p>
                  <div class="form-actions">
                    <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${r(i.id)}"><i class="ti ti-pencil"></i>Open builder</button>
                    <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(i.id)}"><i class="ti ti-eye"></i>Preview</button>
                  </div>
                </div>
              `:""}
            </article>
          `).join("")||g("No forms match this company view.")}
        </div>
      </article>
    </section>
  `}function Cn(e,t){if(!t)return`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${g("Create a form or choose a template to open the builder.")}
      </section>
    `;const a=["questions","responses","settings"].includes(n.formEditorTab)?n.formEditorTab:"questions";return`
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${r(a)}">
      ${qn(t,a)}
      ${a==="questions"?`
        ${Fn(e,t)}
        ${In(t)}
      `:""}
      ${a==="settings"?`
        <article class="panel form-settings-panel forms-settings-wide">
          ${xn(e,t)}
        </article>
      `:""}
      ${a==="responses"?An(e,t):""}
    </section>
  `}function qn(e,t){const a=mt(e.id);return`
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${r(e.title)}</strong>
        <span>${r(e.status)} / ${ri(e)} questions / ${a.length} responses</span>
      </div>
      ${["questions","responses","settings"].map(i=>`
        <button class="${t===i?"active":""}" type="button" data-action="set-form-editor-tab" data-tab="${r(i)}">
          ${i==="questions"?'<i class="ti ti-list-details"></i>':i==="responses"?'<i class="ti ti-inbox"></i>':'<i class="ti ti-settings"></i>'}
          ${r(O(i))}
        </button>
      `).join("")}
      <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(e.id)}"><i class="ti ti-eye"></i>Preview</button>
      <button class="btn" type="button" data-action="open-form-actions" data-form-id="${r(e.id)}"><i class="ti ti-share"></i>Share</button>
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(e.id)}">Save</button>
    </div>
  `}function Fn(e,t){return`
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${r(t.theme_color||se(e))}"></div>
      ${De("Form title","title",t.title,!0)}
      ${oi("Form description","description",t.description)}
      <div class="forms-simple-meta">
        <span>${r(t.status)}</span>
        <span>${r(t.type)}</span>
        <span>${r(t.audience||"Internal")}</span>
        <span>${r(D(t.linked_job_id)?.name||"Company level")}</span>
        <span>${r(k(e))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(t.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      </div>
    </article>
  `}function In(e){return`
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${Ue.map(([t,a])=>`<button type="button" data-action="add-question" data-question-type="${r(t)}" title="${r(a)}" aria-label="Add ${r(a)} question"><i class="ti ${r(Cr(t))}"></i></button>`).join("")}
        </div>
        <div class="question-list">
          ${e.questions.map((t,a)=>Tn(t,a)).join("")||g("Add the first question.")}
        </div>
      </div>
    </article>
  `}function xn(e,t){return`
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${De("Title","title",t.title,!0)}
      ${Be("Status","status",t.status,Ft.map(a=>[a,a]))}
      ${oi("Description","description",t.description)}
      ${Be("Type","type",t.type,Le.map(a=>[a,a]))}
      ${De("Audience","audience",t.audience)}
      ${Be("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(A(e).map(a=>[a.id,a.name])))}
      ${De("Theme color","theme_color",t.theme_color||se(e),!1,"color")}
      ${Be("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
      ${De("Submit button","submit_label",t.submit_label||"Submit")}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(t.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${r(t.id)}">Delete</button>
    </div>
  `}function An(e,t){const a=mt(t.id),i=a[0]||null;return`
    <article class="panel response-list-panel forms-response-editor">
      <div class="section-head">
        <div><h2>Response inbox</h2><p>${a.length} captured response${a.length===1?"":"s"} for this form.</p></div>
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="questions"><i class="ti ti-list-details"></i>Questions</button>
      </div>
      <div class="response-list">
        ${a.map(s=>`
          <button type="button" class="response-card">
            <strong>${r(s.submitted_by||s.submitter_email||"Anonymous")}</strong>
            <span>${r(t.title)}</span>
            <small>${T(s.created_at)}</small>
          </button>
        `).join("")||g("No responses yet. Submit a preview response from the builder.")}
      </div>
    </article>
    <aside class="panel response-detail">
      ${i?li(i):g("No response selected.")}
    </aside>
  `}function Tn(e,t){const a=Ue.map(([i,s])=>`<option value="${r(i)}" ${e.type===i?"selected":""}>${r(s)}</option>`).join("");return`
    <article class="question-card ${n.selectedQuestionId===e.id?"active":""}" data-question-id="${r(e.id)}">
      <div class="question-card-head">
        <span>${t+1}</span>
        <select data-question-field="type">${a}</select>
        <div class="question-actions">
          <button type="button" data-action="move-question" data-direction="-1" data-question-id="${r(e.id)}"><i class="ti ti-arrow-up"></i></button>
          <button type="button" data-action="move-question" data-direction="1" data-question-id="${r(e.id)}"><i class="ti ti-arrow-down"></i></button>
          <button type="button" data-action="duplicate-question" data-question-id="${r(e.id)}"><i class="ti ti-copy"></i></button>
          <button type="button" data-action="delete-question" data-question-id="${r(e.id)}"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <label><span>Question</span><input data-question-field="label" value="${r(e.label)}" /></label>
      <label><span>Help text</span><input data-question-field="help" value="${r(e.help||"")}" /></label>
      <label class="check-row"><input type="checkbox" data-question-field="required" ${e.required?"checked":""} /> Required</label>
      ${Ee(e)?`
        <div class="question-options">
          ${(e.options||[]).map((i,s)=>`
            <label>
              <span>Option ${s+1}</span>
              <input data-question-option="${s}" value="${r(i)}" />
              <button type="button" data-action="remove-question-option" data-question-id="${r(e.id)}" data-option-index="${s}"><i class="ti ti-x"></i></button>
            </label>
          `).join("")}
          <button class="btn" type="button" data-action="add-question-option" data-question-id="${r(e.id)}"><i class="ti ti-plus"></i>Add option</button>
        </div>
      `:""}
    </article>
  `}function Mn(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${r(t.id)}" style="--form-accent:${r(t.theme_color||se(e))}">
      <div class="designed-form-header">
        <span>${r(k(e))}</span>
        <h2>${r(t.title)}</h2>
        <p>${r(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>En(a)).join("")||g("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${r(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function En(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?X(e,`<textarea name="${r(t)}" rows="3" ${a}></textarea>`):e.type==="date"?X(e,`<input name="${r(t)}" type="date" ${a} />`):e.type==="file"?X(e,`<input name="${r(t)}" type="file" ${a} />`):e.type==="yesno"?X(e,`<select name="${r(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?X(e,`<input name="${r(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?X(e,`<select name="${r(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(i=>`<option>${r(i)}</option>`).join("")}</select>`):e.type==="checkbox"?X(e,`<div class="choice-stack">${(e.options||[]).map(i=>`<label><input name="${r(t)}" type="checkbox" value="${r(i)}" /> ${r(i)}</label>`).join("")}</div>`):e.type==="multiple"?X(e,`<div class="choice-stack">${(e.options||[]).map(i=>`<label><input name="${r(t)}" type="radio" value="${r(i)}" ${a} /> ${r(i)}</label>`).join("")}</div>`):X(e,`<input name="${r(t)}" ${a} />`)}function On(e,t){const a=t?mt(t.id):si(e),i=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(s=>`
            <button type="button" class="response-card">
              <strong>${r(be(s.form_id)?.title||"Unknown form")}</strong>
              <span>${r(s.submitted_by||s.submitter_email||"Anonymous")}</span>
              <small>${T(s.created_at)}</small>
            </button>
          `).join("")||g("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${i?li(i):g("No response selected.")}
      </aside>
    </section>
  `}function Pn(e,t){const a=Ys(t),i=it(t),s=z(t).filter(l=>l.status!=="done").length,o=K(A(t),"estimate_total"),c=Gs(t);return`
    <section class="tool-page crm-page">
      ${U("CRM","Customers, contacts, and follow-ups built from company jobs.",`
        <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add customer job</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${w("Accounts",i.length)}
        ${w("Open jobs",A(t).filter(l=>l.stage!=="Closed").length)}
        ${w("Open tasks",s)}
        ${w("Pipeline value",v(o))}
      </section>
      <section class="crm-toolbar panel">
        <label>
          <span>Search</span>
          <input data-crm-search value="${r(n.crmQuery)}" placeholder="Find customer, contact, job, or address" />
        </label>
        <label>
          <span>Stage</span>
          <select data-crm-stage-filter>
            ${["all"].concat(Re).map(l=>`<option value="${r(l)}" ${n.crmStageFilter===l?"selected":""}>${r(l==="all"?"All stages":l)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Owner</span>
          <select data-crm-owner-filter>
            <option value="all" ${n.crmOwnerFilter==="all"?"selected":""}>All owners</option>
            ${c.map(l=>`<option value="${r(l)}" ${n.crmOwnerFilter===l?"selected":""}>${r(l)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="panel crm-list-panel">
        <div class="section-head">
          <div><h2>Customers</h2><p>${a.length} visible account${a.length===1?"":"s"} in ${r(k(t))}</p></div>
        </div>
        <div class="data-table crm-table">
          <div class="table-head"><span>Account</span><span>Contact</span><span>Stage</span><span>Owner</span><span>Jobs</span><span>Value</span><span>Updated</span></div>
          ${a.map(l=>`
            <a class="table-row crm-account-row" href="${b(d("crm",{account:l.key},t))}" data-router>
              <span><strong>${r(l.name)}</strong><small>${r(l.subtitle)}</small></span>
              <span>${r(l.primaryContact)}</span>
              <span>${r(l.stage)}</span>
              <span>${r(l.owner)}</span>
              <span>${r(l.jobs.length)}</span>
              <span>${v(l.estimateTotal)}</span>
              <span>${T(l.updatedAt)}</span>
            </a>
          `).join("")||g("No CRM accounts match this view. Add a customer job to start the list.")}
        </div>
      </section>
    </section>
  `}function Rn(e,t){const a=Ks(e,t);if(!a)return q("CRM","Customer account",g("This customer is not visible in the current company view."));const i=a.latestJob,s=a.tasks.filter(o=>o.status!=="done");return q("CRM",a.name,`
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${r(a.name)}</h2>
            <p>${r(a.subtitle)}</p>
          </div>
          ${Wt(a.priority)}
        </div>
        ${P([["Primary contact",a.primaryContact],["Owner",a.owner],["Current stage",a.stage],["Pipeline value",v(a.estimateTotal)],["Open tasks",String(s.length)],["Last updated",T(a.updatedAt)]])}
      </section>
      <section class="crm-rollup-grid">
        ${w("Jobs",a.jobs.length)}
        ${w("Files",a.fileCount)}
        ${w("Forms",a.formCount)}
        ${w("Tasks",a.tasks.length)}
      </section>
      <section class="crm-modal-actions">
        ${i?`<a class="btn btn-primary" href="${b(d("jobs",{tab:"profile",job_id:i.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
        ${i?`<a class="btn" href="${b(d("tasks",{job_id:i.id},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>`:""}
        ${i?`<a class="btn" href="${b(d("files",{job_id:i.id},e))}" data-router><i class="ti ti-folder"></i>Files</a>`:""}
        ${i?`<button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(i.id)}"><i class="ti ti-pencil"></i>Edit latest job</button>`:""}
        <button class="btn" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Linked jobs</h2><p>Customer workspaces connected to this account.</p></div></div>
        <div class="data-table crm-linked-jobs">
          <div class="table-head"><span>Job</span><span>Stage</span><span>Owner</span><span>Value</span></div>
          ${a.jobs.map(o=>`
            <a class="table-row" href="${b(d("jobs",{tab:"profile",job_id:o.id},e))}" data-router>
              <span><strong>${r(o.name)}</strong><small>${r(o.site_address||"No address")}</small></span>
              <span>${r(o.stage)}</span>
              <span>${r(o.owner_name||"Unassigned")}</span>
              <span>${v(o.estimate_total)}</span>
            </a>
          `).join("")||g("No linked jobs yet.")}
        </div>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Follow-ups</h2><p>Open tasks across linked jobs.</p></div></div>
        <div class="queue-list">
          ${s.slice(0,6).map(o=>pt(o)).join("")||g("No open follow-ups for this customer.")}
        </div>
      </section>
    </div>
  `,"crm-modal")}function Nn(e,t){const a=za(t),i=ue(t),s=Va(t).slice().sort(Oe("received_at")).slice(0,5),o=Ot(t).slice().sort(Oe("spent_at")).slice(0,5),c=Pt(t).slice().sort((l,m)=>l.name.localeCompare(m.name)).slice(0,5);return`
    <section class="tool-page finance-page">
      ${U("Finance","Invoices, payments, expenses, vendors, and job-linked money in one company view.",`
        <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
        <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
        <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        <a class="btn" href="${b(d("finance",{report:"summary"},t))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
      `)}
      <section class="metric-grid finance-metrics">
        ${w("Estimated pipeline",v(a.pipeline))}
        ${w("Invoiced",v(a.invoiced))}
        ${w("Collected",v(a.collected))}
        ${w("Outstanding",v(a.outstanding))}
        ${w("Expenses",v(a.expenses))}
        ${w("Net position",v(a.net))}
      </section>
      <section class="panel finance-aging">
        <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
        <div class="finance-aging-grid">
          ${[["Current",a.aging.current],["1-30",a.aging.thirty],["31-60",a.aging.sixty],["61+",a.aging.overSixty]].map(([l,m])=>`<div><span>${r(l)}</span><strong>${v(m)}</strong></div>`).join("")}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${i.length} billing record${i.length===1?"":"s"} for ${r(k(t))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${i.map(l=>`
            <a class="table-row" href="${b(d("finance",{invoice:l.id},t))}" data-router>
              <span><strong>${r(l.invoice_number)}</strong><small>${r(l.client_name||D(l.job_id)?.client_name||"No client")}</small></span>
              <span>${_r(Ha(l))}</span>
              <span>${r(D(l.job_id)?.name||"Company level")}</span>
              <span>${T(l.due_date)}</span>
              <span>${v(l.total)}</span>
              <span>${v(Nt(l.id))}</span>
              <span>${v(ae(l.id))}</span>
            </a>
          `).join("")||g("No invoices yet. Create one from a job or customer record.")}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${s.map(l=>ye(me(l.invoice_id)?.invoice_number||"Payment",l.method,v(l.amount),l.received_at)).join("")||g("No payments recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${o.map(l=>ye(ht(l.vendor_id),l.category,v(l.amount),l.spent_at,d("finance",{expense:l.id},t))).join("")||g("No expenses recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${c.map(l=>ye(l.name,l.category,l.status,l.updated_at,d("finance",{vendor:l.id},t))).join("")||g("No vendors recorded.")}
          </div>
        </article>
      </section>
    </section>
  `}function Ln(e,t){return e.params.get("invoice")?Un(t,e.params.get("invoice")):e.params.get("expense")?Qn(t,e.params.get("expense")):e.params.get("vendor")?Vn(t,e.params.get("vendor")):e.params.get("report")==="summary"?Jn(t):""}function Un(e,t){const a=me(t);if(!a||a.company_id!==e)return q("Finance","Invoice",g("Invoice not found."));const i=Ba(a.id),s=D(a.job_id);return q("Finance",a.invoice_number,`
    <div class="finance-detail-modal">
      ${P([["Client",a.client_name||s?.client_name||"No client"],["Status",Ha(a)],["Job",s?.name||"Company level"],["Issued",T(a.issue_date)],["Due",T(a.due_date)],["Total",v(a.total)],["Collected",v(Nt(a.id))],["Balance",v(ae(a.id))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${r(a.id)}"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        ${s?`<a class="btn" href="${b(d("jobs",{tab:"profile",job_id:s.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${i.length} payment${i.length===1?"":"s"} applied.</p></div></div>
        <div class="finance-compact-list">
          ${i.map(o=>ye(o.reference||o.method,o.method,v(o.amount),o.received_at)).join("")||g("No payments yet.")}
        </div>
      </section>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Qn(e,t){const a=Ja(t);if(!a||a.company_id!==e)return q("Finance","Expense",g("Expense not found."));const i=D(a.job_id);return q("Finance",`${ht(a.vendor_id)} expense`,`
    <div class="finance-detail-modal">
      ${P([["Vendor",ht(a.vendor_id)],["Category",a.category],["Status",a.status],["Job",i?.name||"Company level"],["Spent",T(a.spent_at)],["Amount",v(a.amount)]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit expense</button>
        ${i?`<a class="btn" href="${b(d("files",{job_id:i.id},e))}" data-router><i class="ti ti-folder"></i>Job files</a>`:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Vn(e,t){const a=Rt(t);if(!a||a.company_id!==e)return q("Finance","Vendor",g("Vendor not found."));const i=Ot(e).filter(s=>s.vendor_id===a.id);return q("Finance",a.name,`
    <div class="finance-detail-modal">
      ${P([["Contact",a.contact_name||"No contact"],["Email",a.email||"No email"],["Phone",a.phone||"No phone"],["Category",a.category],["Status",a.status],["Spend",v(K(i,"amount"))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
        <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${r(a.id)}"><i class="ti ti-receipt"></i>Add expense</button>
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Jn(e){const t=za(e);return q("Finance","Summary report",`
    <div class="finance-report-modal">
      ${P([["Company",k(e)],["Estimated pipeline",v(t.pipeline)],["Invoiced",v(t.invoiced)],["Collected",v(t.collected)],["Outstanding",v(t.outstanding)],["Expenses",v(t.expenses)],["Net position",v(t.net)]])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${v(t.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${v(t.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${v(t.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${v(t.aging.overSixty)}</strong></div>
      </div>
    </div>
  `,"finance-modal")}function aa(e,t=null){const a=t||cr(e);return q("Finance",t?"Edit invoice":"New invoice",`
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${$("Invoice number","invoice_number",a.invoice_number,!0)}
      ${M("Linked job","job_id",a.job_id||"",[["","Company level"]].concat(A(e).map(i=>[i.id,i.name])))}
      ${$("Client","client_name",a.client_name,!0)}
      ${M("Status","status",a.status,Fa.map(i=>[i,i]))}
      ${$("Issue date","issue_date",a.issue_date,!1,"date")}
      ${$("Due date","due_date",a.due_date,!1,"date")}
      ${$("Subtotal","subtotal",a.subtotal,!1,"number")}
      ${$("Tax","tax",a.tax,!1,"number")}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Bn(e,t=""){const a=dr(e,t),i=ue(e).map(s=>[s.id,`${s.invoice_number} - ${s.client_name||D(s.job_id)?.client_name||"No client"}`]);return q("Finance","Record payment",`
    <form class="finance-form" data-finance-payment-form>
      ${M("Invoice","invoice_id",a.invoice_id,i.length?i:[["","Create an invoice first"]])}
      ${$("Amount","amount",a.amount,!0,"number")}
      ${M("Method","method",a.method,Aa.map(s=>[s,s]))}
      ${$("Received","received_at",a.received_at,!1,"date")}
      ${$("Reference","reference",a.reference)}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function ia(e,t=null,a=""){const i=t||pr(e,a),s=Pt(e).map(o=>[o.id,o.name]);return q("Finance",t?"Edit expense":"Add expense",`
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${r(i.id)}" />
      ${M("Vendor","vendor_id",i.vendor_id,s.length?s:[["","No vendor yet"]])}
      ${M("Linked job","job_id",i.job_id||"",[["","Company level"]].concat(A(e).map(o=>[o.id,o.name])))}
      ${M("Category","category",i.category,et.map(o=>[o,o]))}
      ${M("Status","status",i.status,Ia.map(o=>[o,o]))}
      ${$("Amount","amount",i.amount,!0,"number")}
      ${$("Spent date","spent_at",i.spent_at,!1,"date")}
      ${ie("Notes","notes",i.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function na(e,t=null){const a=t||ur(e);return q("Finance",t?"Edit vendor":"Add vendor",`
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${$("Vendor name","name",a.name,!0)}
      ${$("Contact","contact_name",a.contact_name)}
      ${$("Email","email",a.email,!1,"email")}
      ${$("Phone","phone",a.phone)}
      ${M("Category","category",a.category,et.map(i=>[i,i]))}
      ${M("Status","status",a.status,xa.map(i=>[i,i]))}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Hn(e,t){return e.section==="clock"?Wn(t):e.section==="approvals"?Yn(t):zn(t)}function xt(e,t){return`
    ${It("Operations sections",[[d("time",{},e),"My time",t==="time"],[d("approvals",{},e),"Approvals",t==="approvals"],[d("clock",{},e),"Clock dashboard",t==="clock"]])}
  `}function zn(e){const t=Na(e),a=nt(e);return`
    <section class="tool-page operations-page">
      ${U("My time","A compact personal work queue built from this company's tasks.",`
        <a class="btn" href="${b(d("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${xt(e,"time")}
      <section class="metric-grid operations-metrics">
        ${w("Due today",t.dueToday.length)}
        ${w("Overdue",t.overdue.length)}
        ${w("Open work",t.open.length)}
        ${w("In review",t.review.length)}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel span-2">
          <div class="section-head"><div><h2>Today</h2><p>Due now, overdue, and highest priority work.</p></div></div>
          <div class="queue-list">
            ${t.focus.slice(0,8).map(i=>pt(i)).join("")||g("No time-sensitive tasks for this company.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
          ${P([["Company",k(e)],["Assigned to you",String(t.assignedToMe.length)],["Due this week",String(t.thisWeek.length)],["Completed",String(t.done.length)]])}
        </article>
      <article class="panel span-2">
          <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
          <div class="data-table operations-table">
            <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
            ${t.thisWeek.slice(0,8).map(i=>`
              <a class="table-row" href="${b(d("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},e))}" data-router>
                <span><strong>${r(i.title)}</strong><small>${r(i.description||Qe(i.type))}</small></span>
                <span>${r(D(i.project_id)?.name||"Company task")}</span>
                <span>${r(J(i.assignee_id))}</span>
                <span>${T(i.due)}</span>
                <span>${ti(i.status)}</span>
              </a>
            `).join("")||g("No upcoming tasks this week.")}
          </div>
        </article>
      </section>
    </section>
  `}function Wn(e){const t=Ua(e),a=nt(e),i=ft().getTime(),s=i-6*864e5,o=la(e,i)+(a?Date.now()-Date.parse(a.started_at):0),c=la(e,s)+(a?Date.now()-Date.parse(a.started_at):0);return`
    <section class="tool-page operations-page clock-page">
      ${U("Clock dashboard","Local basic-mode clock tracking for the active company.",`
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${xt(e,"clock")}
      <section class="metric-grid operations-metrics">
        ${w("Today",ze(o))}
        ${w("Last 7 days",ze(c))}
        ${w("Entries",t.length)}
        ${w("Status",a?"Clocked in":"Off clock")}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${a?P([["User",J(a.user_id)],["Started",ua(a.started_at)],["Task",a.task_title||"General shift"],["Elapsed",ze(Date.now()-Date.parse(a.started_at))]]):g("Nobody is clocked in on this device.")}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${t.slice(0,10).map(l=>`
              <div class="table-row">
                <span><strong>${r(l.task_title||"General shift")}</strong><small>${r(l.notes||"Clock entry")}</small></span>
                <span>${r(J(l.user_id))}</span>
                <span>${ua(l.started_at)}</span>
                <span>${ze(l.duration_ms)}</span>
              </div>
            `).join("")||g("No clock entries yet.")}
          </div>
        </article>
      </section>
    </section>
  `}function Yn(e){const t=La(e),a=t.filter(o=>o.type==="Form approval"),i=t.filter(o=>o.type==="Task review"),s=t.filter(o=>o.type==="Access request");return`
    <section class="tool-page operations-page">
      ${U("Approvals","Company review queue for forms, task handoffs, and access requests.",`
        <a class="btn" href="${b(d("forms",{},e))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${b(d("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${xt(e,"approvals")}
      <section class="metric-grid operations-metrics">
        ${w("Open approvals",t.length)}
        ${w("Forms",a.length)}
        ${w("Task reviews",i.length)}
        ${w("Access",s.length)}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Approval queue</h2><p>One calm list instead of a heavy dashboard.</p></div></div>
        <div class="data-table approval-table">
          <div class="table-head"><span>Item</span><span>Type</span><span>Owner</span><span>Status</span><span>Updated</span></div>
          ${t.map(o=>`
            <a class="table-row" href="${b(o.href)}" data-router>
              <span><strong>${r(o.title)}</strong><small>${r(o.meta)}</small></span>
              <span>${r(o.type)}</span>
              <span>${r(o.owner)}</span>
              <span>${r(o.status)}</span>
              <span>${T(o.updatedAt)}</span>
            </a>
          `).join("")||g("No approvals need attention right now.")}
        </div>
      </section>
    </section>
  `}function sa(e){return`
    ${U(O(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${g("Module data model pending.")}
    </section>
  `}function Kn(){document.title="Sign in | Quest HQ";const e=Tt(n.route.params.get("return_url")||b(d("jobs",{},F())));tt.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure company workspace</small></span>
        </div>
        <div>
          <div class="eyebrow">Tenant access</div>
          <h1>Sign in to Quest HQ</h1>
          <p>Each company workspace is isolated by Supabase Auth, memberships, subscription state, and role permissions.</p>
        </div>
        ${`
          <div class="auth-mode-tabs">
            <button class="${n.authMode==="signin"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="signin">Sign in</button>
            <button class="${n.authMode==="register"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="register">Create workspace</button>
            <button class="${n.authMode==="request"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="request">Request access</button>
          </div>
          ${Gn(e)}
        `}
        
      </section>
    </main>
  `}function Gn(e){return n.authMode==="register"?`
      <form data-auth-register-form>
        <label>Full name<input name="full_name" autocomplete="name" required /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required /></label>
        <label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Create secure workspace</button>
        ${gt("Owner role, trial subscription, and workspace isolation are created automatically.")}
      </form>
    `:n.authMode==="request"?`
      <form data-auth-request-form>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" required /></label>
        <label>Company ID<input name="company_id" placeholder="company-workspace-id" required /></label>
        <label>Message<input name="message" placeholder="Tell the admin why you need access" /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Request company access</button>
        ${gt("Requests stay pending until a company Owner/Admin approves them.")}
      </form>
    `:`
    <form data-auth-sign-in-form>
      <label>Email<input name="email" type="email" autocomplete="email" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <input type="hidden" name="return_url" value="${r(e)}" />
      <button class="btn btn-primary full" type="submit">Sign in</button>
      ${gt("Use the company workspace account your Owner/Admin invited.")}
    </form>
  `}function gt(e){return n.loginError?`<div class="form-message error">${r(n.loginError)}</div>`:`<div class="form-message">${r(n.authMessage||e)}</div>`}function Zn(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${ut(e,"avatar large")}
            <div><strong>${r(e.full_name)}</strong><span>${r(e.email)}</span></div>
          </div>
          <label>Display name<input name="full_name" value="${r(e.full_name)}" /></label>
          <label>Avatar URL<input name="avatar_url" value="${r(e.avatar_url||"")}" placeholder="https://..." /></label>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Save profile</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `}function Xn(e,t){if(n.modal==="profile")return Zn(t.profile);if(n.modal==="file-upload")return yn();if(n.modal==="folder-new")return vn();if(n.modal==="file-detail")return as(p());if(n.modal==="forms-tools")return is(p());if(n.modal==="form-actions")return os(p(),Me(p()));if(n.modal==="form-new")return ns(p());if(n.modal==="form-preview")return rs(p(),Me(p()));if(n.modal==="job-new")return vt(p(),null);if(n.modal==="job-edit")return vt(p(),de());if(n.modal==="finance-invoice-new")return aa(p(),null);if(n.modal==="finance-invoice-edit")return aa(p(),me(n.selectedFinanceInvoiceId));if(n.modal==="finance-payment-new")return Bn(p(),n.selectedFinanceInvoiceId);if(n.modal==="finance-expense-new")return ia(p(),null,n.selectedFinanceVendorId);if(n.modal==="finance-expense-edit")return ia(p(),Ja(n.selectedFinanceExpenseId));if(n.modal==="finance-vendor-new")return na(p(),null);if(n.modal==="finance-vendor-edit")return na(p(),Rt(n.selectedFinanceVendorId));if(n.modal==="role-new")return kn(p());if(e.name==="company"&&e.section==="crm"&&e.params.get("account"))return Rn(e.companyId,e.params.get("account"));if(e.name==="company"&&e.section==="finance"){const a=Ln(e,e.companyId);if(a)return a}return e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"?vt(e.companyId,e.jobId?D(e.jobId):de()):e.name==="company"&&e.section==="tasks"?ts(e,e.companyId):""}function q(e,t,a,i=""){return`
    <div class="modal-overlay">
      <div class="modal-panel ${r(i)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </div>
    </div>
  `}function es(e,t,a){return`
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </aside>
    </div>
  `}function vt(e,t){return q("Jobs",t?"Edit job":"Create job",Xi(e,t),"wide-modal")}function ts(e,t){const a=e.jobId?D(e.jobId):null,i=e.params.get("task_id")||"",s=i?Mt(i):null;return e.params.get("new")==="1"?q("Tasks","New task",ta(t,a,null),"task-modal"):e.params.get("edit")==="1"&&s?q("Tasks","Edit task",ta(t,a,s),"task-modal"):s?es("Task detail",s.title,sn(t,s)):""}function as(e){const t=n.selectedFileId?n.files.find(a=>a.id===n.selectedFileId):null;return t?q("Open file",t.file_name,bn(t),"file-viewer-modal"):""}function is(e){return q("Forms","Tools",`
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${n.formTypeFilter==="all"?"selected":""}>All types</option>
          ${Le.map(t=>`<option value="${r(t)}" ${n.formTypeFilter===t?"selected":""}>${r(t)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `)}function ns(e){const t=n.formStartTab==="templates"?"templates":"blank",a=qe(),i=t==="templates"&&(a.find(m=>m.id===n.formStartTemplateId)||a[0])||null,s=i?.title||"",o=i?.description||"",c=i?.type||"Internal",l=i?.questions||[{type:"short",label:"First question",required:!1,options:[]}];return q("Forms","New form builder",`
    <form class="new-form-modal builder-create-modal" data-new-form-form>
      <input type="hidden" name="template_id" value="${r(i?.id||"")}" />
      <div class="form-start-tabs" role="tablist" aria-label="New form start type">
        <button class="${t==="blank"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="blank"><i class="ti ti-clipboard-plus"></i>Blank</button>
        <button class="${t==="templates"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="templates"><i class="ti ti-template"></i>Templates</button>
      </div>
      ${t==="templates"?`
        <div class="new-form-template-grid">
          ${a.map(m=>`
            <button class="${i?.id===m.id?"active":""}" type="button" data-action="select-form-start-template" data-template-id="${r(m.id)}">
              <span><i class="ti ti-template"></i></span>
              <strong>${r(m.title)}</strong>
              <small>${r(m.type)} / ${m.questions.length} questions</small>
            </button>
          `).join("")}
        </div>
      `:`
        <div class="new-form-start">
          <span><i class="ti ti-clipboard-plus"></i></span>
          <div>
            <strong>Blank form</strong>
            <small>Start with a title card and one short-answer question.</small>
          </div>
        </div>
      `}
      <div class="new-form-builder-grid">
        <section class="new-form-builder-main">
          <article class="panel gform-title-card new-form-title-card">
            <div class="gform-accent-strip" style="--form-accent:${r(se(e))}"></div>
            <label><span>Form title</span><input name="title" value="${r(s)}" placeholder="Untitled form" required /></label>
            <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${r(o)}</textarea></label>
          </article>
          <div class="new-form-question-list">
            ${l.map((m,y)=>ss(m,y)).join("")}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${i?r(i.title):"Blank starter"}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${Le.map(m=>`<option value="${r(m)}" ${m===c?"selected":""}>${r(m)}</option>`).join("")}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${A(e).map(m=>`<option value="${r(m.id)}" ${n.route?.jobId===m.id?"selected":""}>${r(m.name)}</option>`).join("")}</select></label>
            <label><span>Submit button</span><input name="submit_label" value="Submit" /></label>
          </div>
          <div class="new-form-checks">
            <label class="check-row"><input type="checkbox" name="collect_email" checked /> Collect email</label>
            <label class="check-row"><input type="checkbox" name="require_approval" /> Require approval</label>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Create form</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
          </div>
        </aside>
      </div>
    </form>
  `,"form-create-modal builder-modal")}function ss(e,t){const a=Ee(e)?`
    <div class="starter-options">
      ${(e.options||["Option 1","Option 2"]).map(i=>`<span>${r(i)}</span>`).join("")}
    </div>
  `:"";return`
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${t+1}</span>
        <strong>${r(qr(e.type))}</strong>
      </div>
      <label><span>Question</span><input value="${r(e.label||"Untitled question")}" readonly /></label>
      ${e.help?`<small>${r(e.help)}</small>`:""}
      ${a}
      <label class="check-row"><input type="checkbox" ${e.required?"checked":""} disabled /> Required</label>
    </article>
  `}function rs(e,t){return t?q("Forms","Preview form",`
    <div class="form-preview-modal-body">
      ${Mn(e,t)}
    </div>
  `,"form-preview-modal"):q("Forms","Preview form",g("Choose a form first."))}function os(e,t){return t?q("Forms","Manage form",`
    <div class="forms-summary-share compact">
      <strong>Shareable preview URL</strong>
      <input readonly value="${r(`${window.location.origin}${b(d("forms",{form_id:t.id},e))}`)}" />
      <button class="btn" type="button" data-action="copy-form-link" data-form-id="${r(t.id)}">Copy link</button>
    </div>
    <div class="modal-action-grid">
      <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${r(t.id)}"><i class="ti ti-edit"></i>Edit builder</button>
      <button class="btn" type="button" data-action="duplicate-form" data-form-id="${r(t.id)}"><i class="ti ti-copy"></i>Duplicate</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}"><i class="ti ti-world-upload"></i>Publish</button>
      <button class="btn" type="button" data-action="archive-form" data-form-id="${r(t.id)}"><i class="ti ti-archive"></i>Archive</button>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export library</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${r(t.id)}"><i class="ti ti-trash"></i>Delete</button>
    </div>
  `):q("Forms","Manage form",g("Choose a form first."))}function ls(e){const t=e.target.closest("[data-action]");if(t){cs(e,t);return}const a=e.target.closest("[data-select-job]");if(a){e.preventDefault(),Hs(a.dataset.selectJob);return}const i=e.target.closest("[data-select-task]");if(i){e.preventDefault(),zs(i.dataset.selectTask);return}const s=e.target.closest("a[href][data-router]");s&&(s.target||s.hasAttribute("download")||(e.preventDefault(),S(s.getAttribute("href"))))}function cs(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),n.dataLoaded=!1,n.sync={label:"Refreshing...",mode:"loading"},u();return}if(a==="sign-out"){e.preventDefault(),us();return}if(a==="set-auth-mode"){e.preventDefault(),n.authMode=["signin","register","request"].includes(t.dataset.authMode)?t.dataset.authMode:"signin",n.loginError="",n.authMessage="",u();return}if(a==="open-profile"){e.preventDefault(),n.modal="profile",u();return}if(a==="open-role-form"){e.preventDefault(),n.modal="role-new",u();return}if(a==="start-checkout"){e.preventDefault(),vs();return}if(a==="open-file-upload"){e.preventDefault(),n.modal="file-upload",u();return}if(a==="open-folder-form"){e.preventDefault(),n.modal="folder-new",u();return}if(a==="open-job-form"){e.preventDefault();const i=t.dataset.jobId||"";i&&(n.selectedJobId=i),n.modal=t.dataset.mode==="edit"?"job-edit":"job-new",u();return}if(a==="open-forms-tools"){e.preventDefault(),n.modal="forms-tools",u();return}if(a==="open-form-actions"){e.preventDefault(),He(t.dataset.formId,!1),n.modal="form-actions",u();return}if(a==="open-form-preview"){e.preventDefault(),He(t.dataset.formId,!1),n.modal="form-preview",u();return}if(a==="set-form-start-tab"){e.preventDefault(),n.formStartTab=t.dataset.tab==="templates"?"templates":"blank",n.formStartTab==="blank"&&(n.formStartTemplateId=""),n.formStartTab==="templates"&&!n.formStartTemplateId&&(n.formStartTemplateId=qe()[0]?.id||""),u();return}if(a==="select-form-start-template"){e.preventDefault(),n.formStartTab="templates",n.formStartTemplateId=t.dataset.templateId||qe()[0]?.id||"",u();return}if(a==="close-modal"){e.preventDefault(),ds();return}if(a==="set-task-view"){e.preventDefault(),n.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(ja,n.taskView),u();return}if(a==="set-drive-view"){e.preventDefault(),n.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem(Da,n.driveView),u();return}if(a==="clock-in"){e.preventDefault(),Zs(p(),t.dataset.taskId||n.route?.params?.get("task_id")||"");return}if(a==="clock-out"){e.preventDefault(),Qa();return}if(a==="select-file"){e.preventDefault(),n.selectedFileId=t.dataset.fileId||"",n.modal="file-detail",u();return}if(a==="download-file"){e.preventDefault(),xs(t.dataset.fileId);return}if(a==="delete-file"){e.preventDefault(),As(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),n.formsTab=t.dataset.tab==="responses"?"responses":"library",u();return}if(a==="set-form-editor-tab"){e.preventDefault(),n.formEditorTab=t.dataset.tab||"questions",u();return}if(a==="new-form"){e.preventDefault(),n.formStartTemplateId=t.dataset.templateId||"",n.formStartTab=t.dataset.startTab==="templates"||n.formStartTemplateId?"templates":"blank",n.formStartTab==="templates"&&!n.formStartTemplateId&&(n.formStartTemplateId=qe()[0]?.id||""),n.modal="form-new",u();return}if(a==="select-form"){e.preventDefault(),He(t.dataset.formId);return}if(a==="toggle-form-card"){e.preventDefault();const i=t.dataset.formId||"";n.expandedFormIds.has(i)?n.expandedFormIds.delete(i):n.expandedFormIds.add(i),u();return}if(a==="edit-form"){e.preventDefault(),He(t.dataset.formId,!1),n.formsTab="builder",n.formEditorTab="questions",n.modal="",u();return}if(a==="save-form"){e.preventDefault(),Q("Form saved locally"),u();return}if(a==="publish-form"){e.preventDefault(),pa(t.dataset.formId,"Published");return}if(a==="archive-form"){e.preventDefault(),pa(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){e.preventDefault(),Ar(t.dataset.formId);return}if(a==="delete-form"){e.preventDefault(),Tr(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),Mr(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),Er(p());return}if(a==="new-finance-invoice"){e.preventDefault(),n.selectedFinanceInvoiceId="",n.modal="finance-invoice-new",u();return}if(a==="edit-finance-invoice"){e.preventDefault(),n.selectedFinanceInvoiceId=t.dataset.invoiceId||"",n.modal="finance-invoice-edit",u();return}if(a==="new-finance-payment"){e.preventDefault(),n.selectedFinanceInvoiceId=t.dataset.invoiceId||n.route?.params?.get("invoice")||"",n.modal="finance-payment-new",u();return}if(a==="new-finance-expense"){e.preventDefault(),n.selectedFinanceExpenseId="",n.selectedFinanceVendorId=t.dataset.vendorId||"",n.modal="finance-expense-new",u();return}if(a==="edit-finance-expense"){e.preventDefault(),n.selectedFinanceExpenseId=t.dataset.expenseId||"",n.modal="finance-expense-edit",u();return}if(a==="new-finance-vendor"){e.preventDefault(),n.selectedFinanceVendorId="",n.modal="finance-vendor-new",u();return}if(a==="edit-finance-vendor"){e.preventDefault(),n.selectedFinanceVendorId=t.dataset.vendorId||"",n.modal="finance-vendor-edit",u();return}if(a==="add-question"){e.preventDefault(),Or(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){e.preventDefault(),Pr(t.dataset.questionId);return}if(a==="delete-question"){e.preventDefault(),Rr(t.dataset.questionId);return}if(a==="move-question"){e.preventDefault(),Nr(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){e.preventDefault(),Lr(t.dataset.questionId);return}if(a==="remove-question-option"){e.preventDefault(),Ur(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){e.preventDefault(),ws(t.dataset.jobId);return}a==="delete-task"&&(e.preventDefault(),ks(t.dataset.taskId))}function ds(){const e=n.route||at();if(n.modal="",n.formStartTemplateId="",n.formStartTab="blank",n.selectedFinanceInvoiceId="",n.selectedFinanceExpenseId="",n.selectedFinanceVendorId="",e.name==="company"&&e.section==="tasks"&&(e.params.get("new")||e.params.get("edit")||e.params.get("task_id"))){S(d("tasks",e.jobId?{job_id:e.jobId}:{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"){const t=e.jobId?D(e.jobId):de();S(d("jobs",{tab:t?"profile":"pipeline",...t?{job_id:t.id}:{}},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="crm"&&e.params.get("account")){S(d("crm",{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="finance"&&(e.params.get("invoice")||e.params.get("expense")||e.params.get("vendor")||e.params.get("report"))){S(d("finance",{},e.companyId),{replace:!0});return}u()}function ps(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===_e.localUsername&&String(t.password||"")===_e.localPassword)){n.loginError="Invalid temporary credentials.",u();return}n.loginError="",n.session=kt(),I(he,n.session),S(Tt(t.return_url||b(d("jobs",{},F()))),{replace:!0});return}if(e.target.matches("[data-auth-sign-in-form]")){e.preventDefault(),ms(e.target);return}if(e.target.matches("[data-auth-register-form]")){e.preventDefault(),fs(e.target);return}if(e.target.matches("[data-auth-request-form]")){e.preventDefault(),gs(e.target);return}if(e.target.matches("[data-company-create-form]")){e.preventDefault(),bs(e.target);return}if(e.target.matches("[data-profile-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries()),a={...E().profile,full_name:String(t.full_name||"").trim()||"Quest Basic Mode",avatar_url:String(t.avatar_url||"").trim()};I(fa,a),n.profileDraft=a,n.session={...E(),profile:a},I(he,n.session),n.modal="",u();return}if(e.target.matches("[data-job-form]")){e.preventDefault(),$s(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),Ss(e.target);return}if(e.target.matches("[data-new-form-form]")){e.preventDefault(),xr(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),js(e.target);return}if(e.target.matches("[data-folder-form]")){e.preventDefault(),Ds(e.target);return}if(e.target.matches("[data-finance-invoice-form]")){e.preventDefault(),Cs(e.target);return}if(e.target.matches("[data-finance-payment-form]")){e.preventDefault(),qs(e.target);return}if(e.target.matches("[data-finance-expense-form]")){e.preventDefault(),Fs(e.target);return}if(e.target.matches("[data-finance-vendor-form]")){e.preventDefault(),Is(e.target);return}if(e.target.matches("[data-role-form]")){e.preventDefault(),ys(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),Qr(e.target))}async function us(){const e=N();e?.auth&&await e.auth.signOut(),localStorage.removeItem(he),n.session=null,n.dataLoaded=!1,S("/login",{replace:!0})}async function ms(e){const t=Object.fromEntries(new FormData(e).entries()),a=N();if(!a?.auth){n.loginError="Supabase auth is unavailable.",u();return}n.loginError="",n.authMessage="Signing in...",u();const i=await a.auth.signInWithPassword({email:String(t.email||"").trim(),password:String(t.password||"")});if(i.error){n.loginError=i.error.message||"Unable to sign in.",n.authMessage="",u();return}await Fe(i.data.session),n.authMessage="",n.dataLoaded=!1,S(Tt(t.return_url||b(d("jobs",{},F()))),{replace:!0})}async function fs(e){const t=Object.fromEntries(new FormData(e).entries()),a=N();if(!a?.auth){n.loginError="Supabase auth is unavailable.",u();return}const i=String(t.email||"").trim(),s=String(t.password||""),o=String(t.full_name||"").trim(),c=String(t.company_name||"").trim();if(!i||!s||!o||!c){n.loginError="Name, email, password, and company workspace are required.",u();return}n.loginError="",n.authMessage="Creating secure workspace...",u();const l=await a.auth.signUp({email:i,password:s,options:{data:{full_name:o}}});if(l.error){n.loginError=l.error.message||"Unable to create account.",n.authMessage="",u();return}let m=l.data.session;if(!m){const f=await a.auth.signInWithPassword({email:i,password:s});if(f.error){n.loginError="Account created. Please sign in to finish workspace setup.",n.authMode="signin",n.authMessage="",u();return}m=f.data.session}await Fe(m);const y=await a.rpc("create_company_workspace",{company_name:c});if(y.error){n.loginError=y.error.message||"Account created, but workspace setup failed.",n.authMessage="",u();return}n.activeCompanyId=_(y.data||F()),localStorage.setItem(Se,n.activeCompanyId),n.dataLoaded=!1,n.authMessage="",S(d("settings",{tab:"billing"},n.activeCompanyId),{replace:!0})}async function bs(e){const t=Object.fromEntries(new FormData(e).entries()),a=N(),i=String(t.company_name||"").trim();if(!a||!i){n.loginError="Company workspace name is required.",u();return}const s=await a.rpc("create_company_workspace",{company_name:i});if(s.error){n.loginError=s.error.message||"Workspace setup failed.",u();return}n.activeCompanyId=_(s.data||F()),localStorage.setItem(Se,n.activeCompanyId),n.dataLoaded=!1,S(d("settings",{tab:"billing"},n.activeCompanyId),{replace:!0})}async function gs(e){const t=Object.fromEntries(new FormData(e).entries()),a=N();if(!a?.auth){n.loginError="Supabase auth is unavailable.",u();return}const i=String(t.email||"").trim(),s=String(t.password||""),o=_(t.company_id||"");n.loginError="",n.authMessage="Submitting access request...",u();const c=await a.auth.signInWithPassword({email:i,password:s});if(c.error){n.loginError=c.error.message||"Sign in first to request access.",n.authMessage="",u();return}await Fe(c.data.session);const l=await a.rpc("request_company_access",{target_company_id:o,request_message:String(t.message||"").trim()||null});if(l.error){n.loginError=l.error.message||"Unable to request access.",n.authMessage="",u();return}n.authMessage="Access request sent. An Owner/Admin must approve it.",n.loginError="",n.authMode="signin",u()}async function vs(){const e=p();n.sync={label:"Opening billing...",mode:"loading"},u();try{const t=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json",...E().access_token?{Authorization:`Bearer ${E().access_token}`}:{}},body:JSON.stringify({company_id:e,return_url:`${window.location.origin}${b(d("settings",{tab:"billing"},e))}`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.url)throw new Error(a.error||"Billing is not configured yet.");window.location.href=a.url}catch(t){n.sync={label:t.message||"Billing unavailable",mode:"local"},u()}}async function ys(e){const t=p(),a=new FormData(e),i=ve({id:crypto.randomUUID(),company_id:t,name:a.get("name"),color:a.get("color")||"#f0b23b",priority:a.get("priority")||100,is_system:!1,created_by:E().profile.id}),s=a.getAll("permissions").map(c=>String(c||"")).filter(Boolean),o=N();if(n.session?.auth==="supabase"&&o){const c=await o.from("roles").insert(i).select().single();if(c.error){n.sync={label:c.error.message||"Role save failed",mode:"local"},u();return}const l=ve(c.data),m=s.map(y=>({role_id:l.id,permission_key:y,effect:"allow"}));m.length&&await o.from("role_permissions").insert(m),n.roles.unshift(l),n.rolePermissions=m.concat(n.rolePermissions).map(St),n.sync={label:"Role saved",mode:"live"}}else n.roles.unshift(i),n.rolePermissions=s.map(c=>St({role_id:i.id,permission_key:c,effect:"allow"})).concat(n.rolePermissions),n.sync={label:"Role saved locally",mode:"local"};n.modal="",u()}function _s(e){if(e.target.matches("[data-global-search]")){n.query=e.target.value,Ve();return}if(e.target.matches("[data-file-search]")){n.fileQuery=e.target.value,Ve();return}if(e.target.matches("[data-form-search]")){n.formQuery=e.target.value,Ve();return}if(e.target.matches("[data-crm-search]")){n.crmQuery=e.target.value,Ve();return}if(e.target.matches("[data-form-field]")){ci(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&di(e.target)}function hs(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||F();Js(t);return}if(e.target.matches("[data-stage-filter]")){n.stageFilter=e.target.value||"all",u();return}if(e.target.matches("[data-crm-stage-filter]")){n.crmStageFilter=e.target.value||"all",u();return}if(e.target.matches("[data-crm-owner-filter]")){n.crmOwnerFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-status-filter]")){n.taskStatusFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-priority-filter]")){n.taskPriorityFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;S(d("tasks",t?{job_id:t}:{},p()));return}if(e.target.matches("[data-analytics-job-filter]")){const t=e.target.value;S(d("analytics",t?{job_id:t}:{},p()));return}if(e.target.matches("[data-file-category-filter]")){n.fileCategoryFilter=e.target.value||"All categories",u();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=n.route?.jobId||"";S(d("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},p()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;S(d("files",{...t?{folder:"jobs",job_id:t}:{}},p()));return}if(e.target.matches("[data-form-type-filter]")){n.formTypeFilter=e.target.value||"all",u();return}if(e.target.matches("[data-form-field]")){ci(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&di(e.target)}async function $s(e){const t=Ae(Object.fromEntries(new FormData(e).entries()));t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||p(),t.estimate_total=Number(t.estimate_total||0),t.invoice_total=Number(t.invoice_total||0),t.updated_at=new Date().toISOString();const a=n.jobs.some(s=>s.id===t.id),i=N();if(i){const s=a?await i.from("jobs").update(t).eq("id",t.id).select().single():await i.from("jobs").insert(t).select().single();if(!s.error&&s.data){yt(Ae(s.data)),n.sync={label:"Quest Supabase live",mode:"live"},n.modal="",S(d("jobs",{tab:"profile",job_id:s.data.id},t.company_id),{replace:!0});return}n.sync={label:"Saved locally",mode:"local"}}yt(t),n.modal="",S(d("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function ws(e){if(!e)return;const t=p(),a=N();a&&await a.from("jobs").delete().eq("id",e),n.jobs=n.jobs.filter(i=>i.id!==e),n.selectedJobId=A(t)[0]?.id||"",n.modal="",B(),S(d("jobs",{tab:"list"},t),{replace:!0})}async function Ss(e){const t=p(),a=Object.fromEntries(new FormData(e).entries()),i=Te({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:E().profile.member_id||ne(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),s=n.tasks.some(c=>c.id===i.id),o=N();if(o){const c=mr(i),l=s?await o.from("tasks").update(c).eq("id",i.id).select().single():await o.from("tasks").insert(c).select().single();if(!l.error&&l.data){ra(Te(l.data)),n.sync={label:"Quest Supabase live",mode:"live"},n.modal="",S(d("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},t),{replace:!0});return}n.sync={label:"Task saved locally",mode:"local"}}ra(i),n.modal="",S(d("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},t),{replace:!0})}async function ks(e){if(!e)return;const t=p(),a=N();a&&await a.from("tasks").delete().eq("id",e),n.tasks=n.tasks.filter(i=>i.id!==e),n.selectedTaskId="",n.modal="",B(),S(d("tasks",{},t),{replace:!0})}async function js(e){const t=p(),a=new FormData(e),i=Object.fromEntries(a.entries()),s=Array.from(e.elements.files?.files||[]),o=String(i.file_name||"").trim(),c=s.length?s:o?[null]:[];if(!c.length){n.sync={label:"Choose a file or enter a file name",mode:"local"},u();return}const l=N();let m=0;for(const y of c){const f=crypto.randomUUID(),j=y?.name||o,L=String(i.folder||"shared"),C=`${t}/${i.job_id?`jobs/${i.job_id}`:L}/${f}-${Zt(j)}`;let H=!1;l&&y&&(H=!(await l.storage.from("quest-job-files").upload(C,y,{cacheControl:"3600",upsert:!1,contentType:y.type||"application/octet-stream"})).error);const je=Ge({id:f,company_id:t,job_id:i.job_id||"",folder:L,file_name:j,mime_type:y?.type||"application/octet-stream",size_bytes:y?.size||Number(i.size_bytes||0),category:i.category||ee(L),notes:i.notes||"",uploaded_by_label:i.uploaded_by_label||E().profile.full_name,bucket_id:"quest-job-files",object_path:H||!y?C:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(l){const le=await l.from("job_files").insert(fr(je)).select().single();if(!le.error&&le.data){oa(Ge(le.data)),m+=1;continue}H&&await l.storage.from("quest-job-files").remove([C])}oa(je)}n.sync=m===c.length?{label:"Quest Supabase live",mode:"live"}:{label:m?"Some files saved locally":"File record saved locally",mode:m?"loading":"local"},n.modal="",S(d("files",{folder:i.folder||"shared",...i.job_id?{job_id:i.job_id}:{}},t),{replace:!0})}function Ds(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.name||"").trim();if(!a){n.sync={label:"Folder name is required",mode:"local"},u();return}const i=Ga({id:`folder-${crypto.randomUUID()}`,company_id:p(),name:a,parent_key:t.parent_key||"home",created_by_label:E().profile.full_name||"Quest HQ",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});n.driveFolders.unshift(i),n.modal="",n.sync={label:"Folder created locally",mode:"local"},B(),u()}function Cs(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),i=D(t.job_id),s=String(t.id||"").trim()?me(String(t.id).trim()):null,o=Vt({...t,id:String(t.id||"").trim()||`invoice-${crypto.randomUUID()}`,company_id:a,client_name:String(t.client_name||i?.client_name||"").trim(),total:x(t.subtotal)+x(t.tax),updated_at:new Date().toISOString()});Ts(o),s?.job_id&&s.job_id!==o.job_id&&_t(s.job_id),_t(o.job_id),n.modal="",n.sync={label:"Finance saved locally",mode:"local"},S(d("finance",{invoice:o.id},a),{replace:!0})}function qs(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),i=me(t.invoice_id);if(!i||i.company_id!==a){n.sync={label:"Create an invoice before recording a payment",mode:"local"},u();return}const s=Jt({...t,id:`payment-${crypto.randomUUID()}`,company_id:a,created_at:new Date().toISOString()});n.financePayments.unshift(s),i.status=ae(i.id)<=0?"Paid":"Partially paid",i.updated_at=new Date().toISOString(),_t(i.job_id),B(),n.modal="",n.sync={label:"Payment recorded locally",mode:"local"},S(d("finance",s.invoice_id?{invoice:s.invoice_id}:{},a),{replace:!0})}function Fs(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),i=Bt({...t,id:String(t.id||"").trim()||`expense-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});Ms(i),n.modal="",n.sync={label:"Expense saved locally",mode:"local"},S(d("finance",{expense:i.id},a),{replace:!0})}function Is(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),i=Ht({...t,id:String(t.id||"").trim()||`vendor-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});Es(i),n.modal="",n.sync={label:"Vendor saved locally",mode:"local"},S(d("finance",{vendor:i.id},a),{replace:!0})}async function xs(e){const t=n.files.find(s=>s.id===e);if(!t?.object_path){n.sync={label:"No stored object for this file",mode:"local"},u();return}const a=N();if(!a)return;const i=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(i.error||!i.data?.signedUrl){n.sync={label:"Download failed",mode:"local"},u();return}window.open(i.data.signedUrl,"_blank","noopener,noreferrer")}async function As(e){const t=n.files.find(i=>i.id===e);if(!t)return;const a=N();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),n.files=n.files.filter(i=>i.id!==e),n.selectedFileId="",n.modal="",B(),u()}function yt(e){const t=n.jobs.findIndex(a=>a.id===e.id);t>=0?n.jobs[t]=e:n.jobs.unshift(e),n.selectedJobId=e.id,B()}function ra(e){const t=n.tasks.findIndex(a=>a.id===e.id);t>=0?n.tasks[t]=e:n.tasks.unshift(e),n.selectedTaskId=e.id,B()}function oa(e){const t=n.files.findIndex(a=>a.id===e.id);t>=0?n.files[t]=e:n.files.unshift(e),B()}function Ts(e){const t=n.financeInvoices.findIndex(a=>a.id===e.id);t>=0?n.financeInvoices[t]=e:n.financeInvoices.unshift(e),B()}function Ms(e){const t=n.financeExpenses.findIndex(a=>a.id===e.id);t>=0?n.financeExpenses[t]=e:n.financeExpenses.unshift(e),B()}function Es(e){const t=n.financeVendors.findIndex(a=>a.id===e.id);t>=0?n.financeVendors[t]=e:n.financeVendors.unshift(e),B()}function _t(e){if(!e)return;const t=D(e);t&&(t.invoice_total=K(ue(t.company_id).filter(a=>a.job_id===e),"total"),t.updated_at=new Date().toISOString(),yt(t))}function Ve(){const e=document.getElementById("workspace");e&&(Pa(n.route),e.innerHTML=Ea(n.route))}function at(){const e=At(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/"||e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:p(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const i=a[2]||"jobs";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:i,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:p(),jobId:t.get("job_id")||""}}function Os(){const e=At(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||We(t.get("job_id")||t.get("project_id"))||localStorage.getItem(Se)||F(),i=Object.fromEntries(Object.entries(gi).map(([c,l])=>[c,d(l,{},a)]));Object.assign(i,{"/index.html":d("jobs",{},a),"/command.html":d("jobs",{},a),"/login.html":"/login"});let s=i[e];if(e==="/jobs"){const c=t.get("tab");c==="tasks"?s=d("tasks",Y(t,["job_id","task_id","new","edit"]),a):c==="files"?s=d("files",Y(t,["job_id","folder"]),a):c==="forms"?s=d("forms",Y(t,["job_id"]),a):c==="analytics"?s=d("analytics",Y(t,["job_id"]),a):s=d("jobs",Y(t,["job_id","tab"]),a)}if(e==="/files"&&(s=d("files",Y(t,["job_id","folder"]),a)),e==="/forms"&&(s=d("forms",Y(t,["job_id"]),a)),e==="/analytics"&&(s=d("analytics",Y(t,["job_id"]),a)),e==="/crm"&&(s=d("crm",Y(t,["account"]),a)),e==="/finance"&&(s=d("finance",Y(t,["invoice","expense","vendor","report"]),a)),e==="/admin"&&(s=d("settings",{},a)),e==="/time"&&(s=d("time",{},a)),e==="/team"&&(s=d("team-chart",{},a)),e==="/team-chart"&&(s=d("team-chart",{},a)),e==="/approvals"&&(s=d("approvals",{},a)),e==="/clock"&&(s=d("clock",{},a)),e==="/task-management.html"){const c=t.get("project_id")||t.get("job_id")||"";s=d("tasks",c?{job_id:c}:{},We(c)||a)}const o=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(o){const c=decodeURIComponent(o[1]);s=d("tasks",{job_id:c},We(c)||a)}s&&window.history.replaceState({},"",b(s))}function Ps(e){if(e.name!=="company")return"";const t=ke();if(n.session?.auth==="supabase"&&!t.length)return null;if(!t.includes(e.companyId))return d(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||F());if(!Xe.map(s=>s.id).includes(e.section))return d("jobs",{},e.companyId);const i=e.jobId?We(e.jobId):"";return i&&i!==e.companyId&&t.includes(i)?d(e.section,Object.fromEntries(e.params.entries()),i):""}function At(){let e=window.location.pathname||"/";return ge&&e.startsWith(ge)&&(e=e.slice(ge.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function b(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),i=t.startsWith("/")?t:"/"+t;return`${ge}${i}${a?`?${a}`:""}`||"/"}function S(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(ge+"/")||ge===""&&e.startsWith("/")?e:b(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),u()}function Rs(){return`${At()}${window.location.search}`}function Tt(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?b(d("jobs",{},F())):`${t.pathname}${t.search}`}catch{return b(d("jobs",{},F()))}}function d(e="jobs",t={},a=p()){const i=new URLSearchParams(t);for(const[s,o]of[...i.entries()])(o==null||o==="")&&i.delete(s);return`/company/${encodeURIComponent(_(a||F()))}/${e}${i.toString()?`?${i.toString()}`:""}`}function Ns(e){return e.name==="company"?O(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":O(e.name||"Workspace")}function Ls(e,t){const[a]=t.split("?"),i=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!i||e.name!=="company"?!1:e.companyId===decodeURIComponent(i[1])&&e.section===i[2]}function Us(e){return Ca.includes(e)?e:"pipeline"}function Qs(e){return{pipeline:"Pipeline",list:"List",profile:"Profile"}[e]||e}function Vs(e){const t=e.companyId||n.activeCompanyId||F(),a=ke();n.activeCompanyId=a.includes(t)?t:a[0]||F(),localStorage.setItem(Se,n.activeCompanyId)}function Pa(e){const t=p();e.jobId&&A(t).some(i=>i.id===e.jobId)&&(n.selectedJobId=e.jobId),(!n.selectedJobId||!A(t).some(i=>i.id===n.selectedJobId))&&(n.selectedJobId=A(t)[0]?.id||"");const a=e.params.get("task_id");a&&z(t).some(i=>i.id===a)&&(n.selectedTaskId=a),e.section!=="tasks"&&(n.selectedTaskId=""),n.driveFolder=e.params.get("folder")||"home"}function Js(e){const t=ke(),a=_(e),i=t.includes(a)?a:t[0]||F();n.activeCompanyId=i,localStorage.setItem(Se,i),Bs();const s=n.route||at(),o=s.name==="company"?s.section:"jobs";S(d(o,{},i))}function Bs(){n.modal="",n.selectedJobId="",n.selectedTaskId="",n.selectedFileId="",n.selectedFormId="",n.selectedQuestionId="",n.selectedFinanceInvoiceId="",n.selectedFinanceExpenseId="",n.selectedFinanceVendorId="",n.query="",n.fileQuery="",n.formQuery="",n.crmQuery="",n.stageFilter="all",n.crmStageFilter="all",n.crmOwnerFilter="all",n.taskStatusFilter="all",n.taskPriorityFilter="all",n.fileCategoryFilter="All categories",n.formTypeFilter="all",n.formsTab="library",n.driveFolder="home"}function Hs(e){const t=D(e);t&&(n.selectedJobId=e,S(d("jobs",{tab:"profile",job_id:e},t.company_id)))}function zs(e){const t=Mt(e);t&&(n.selectedTaskId=e,S(d("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function de(){return D(n.selectedJobId)||A(p())[0]||null}function D(e){return n.jobs.find(t=>t.id===e)||null}function Mt(e){return n.tasks.find(t=>t.id===e)||null}function A(e=p()){return n.jobs.filter(t=>t.company_id===e)}function z(e=p()){return n.tasks.filter(t=>t.company_id===e)}function pe(e=p()){return n.files.filter(t=>t.company_id===e)}function Ie(e=p()){return n.driveFolders.filter(t=>t.company_id===e)}function ne(e=p()){return n.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function Ws(e=p()){const t=n.roles.filter(a=>a.company_id===e);return t.length?t.sort((a,i)=>i.priority-a.priority||a.name.localeCompare(i.name)):[ve({id:`owner-${e}`,company_id:e,name:"Owner",color:"#f0b23b",priority:1e3,is_system:!0}),ve({id:`admin-${e}`,company_id:e,name:"Admin",color:"#60a5fa",priority:800,is_system:!0}),ve({id:`staff-${e}`,company_id:e,name:"Staff",color:"#15803d",priority:100,is_system:!0})]}function Ra(e=p()){const t=n.query.trim().toLowerCase();return A(e).filter(a=>n.stageFilter!=="all"&&a.stage!==n.stageFilter?!1:t?[a.name,a.client_name,a.contact_name,a.owner_name,a.site_address,a.job_type,k(a.company_id)].some(i=>String(i||"").toLowerCase().includes(t)):!0)}function it(e=p()){const t=new Map;return A(e).forEach(a=>{const i=String(a.client_name||"").trim()||"Unassigned customer",s=`account-${Zt(i.toLowerCase())}`;t.has(s)||t.set(s,{key:s,name:i,jobs:[]}),t.get(s).jobs.push(a)}),Array.from(t.values()).map(a=>{const i=a.jobs.slice().sort((C,H)=>Date.parse(H.updated_at||H.created_at||0)-Date.parse(C.updated_at||C.created_at||0)),s=i[0]||null,o=i.map(C=>C.id),c=z(e).filter(C=>o.includes(C.project_id)),l=re(e).filter(C=>o.includes(C.linked_job_id)),m=pe(e).filter(C=>o.includes(C.job_id)),y=Z(i.map(C=>C.contact_name)),f=Z(i.map(C=>C.owner_name)),j=Z(i.map(C=>C.site_address)),L=i.map(C=>C.priority||"Medium").sort((C,H)=>we(H)-we(C))[0]||"Medium";return{...a,jobs:i,tasks:c,latestJob:s,contacts:y,owners:f,addresses:j,forms:l,files:m,primaryContact:y[0]||"No contact",owner:f[0]||"Unassigned",stage:s?.stage||"Lead",priority:L,estimateTotal:K(i,"estimate_total"),fileCount:m.length,formCount:l.length,updatedAt:s?.updated_at||s?.created_at||new Date().toISOString(),subtitle:j[0]||`${i.length} linked job${i.length===1?"":"s"}`}}).sort((a,i)=>Date.parse(i.updatedAt||0)-Date.parse(a.updatedAt||0))}function Ys(e=p()){const t=n.crmQuery.trim().toLowerCase();return it(e).filter(a=>n.crmStageFilter!=="all"&&!a.jobs.some(i=>i.stage===n.crmStageFilter)||n.crmOwnerFilter!=="all"&&!a.owners.includes(n.crmOwnerFilter)?!1:t?[a.name,a.primaryContact,a.owner,a.stage,...a.addresses,...a.contacts,...a.jobs.map(i=>i.name)].some(i=>String(i||"").toLowerCase().includes(t)):!0)}function Ks(e,t){return it(e).find(a=>a.key===t)||null}function Gs(e=p()){return Z(A(e).map(t=>t.owner_name)).sort((t,a)=>t.localeCompare(a))}function Na(e=p()){const t=E().profile.member_id||"",a=z(e).slice().sort(ca),i=a.filter(Et),s=i.filter(j=>j.due===h(0)),o=i.filter(j=>ma(j.due)<0),c=i.filter(j=>{const L=ma(j.due);return L>=0&&L<=7}),l=i.filter(j=>j.assignee_id===t),m=i.filter(j=>["review","pending"].includes(j.status)),y=a.filter(j=>j.status==="done"),f=Z(o.concat(s,l,m,c).map(j=>j.id)).map(j=>a.find(L=>L.id===j)).filter(Boolean).sort(ca);return{tasks:a,open:i,dueToday:s,overdue:o,thisWeek:c,assignedToMe:l,review:m,done:y,focus:f}}function La(e=p()){const t=re(e).filter(s=>(s.require_approval||s.type==="Client approval")&&!["Archived","Closed","Approved"].includes(s.status)).map(s=>({id:`form:${s.id}`,title:s.title,meta:D(s.linked_job_id)?.name||s.description||"Company form",type:"Form approval",owner:J(s.creator_id),status:s.status,updatedAt:s.updated_at||s.created_at,href:d("forms",{form_id:s.id},e)})),a=z(e).filter(s=>["review","pending"].includes(s.status)).map(s=>({id:`task:${s.id}`,title:s.title,meta:D(s.project_id)?.name||s.description||"Company task",type:"Task review",owner:J(s.assignee_id),status:oe(s.status),updatedAt:s.updated_at||s.due,href:d("tasks",{...s.project_id?{job_id:s.project_id}:{},task_id:s.id},e)})),i=n.memberships.filter(s=>s.company_id===e&&s.status!=="active").map(s=>({id:`access:${s.profile_id||s.member_id}`,title:J(s.member_id||s.profile_id),meta:`${O(s.role)} access request`,type:"Access request",owner:"Quest admin",status:O(s.status),updatedAt:new Date().toISOString(),href:d("settings",{tab:"access"},e)}));return t.concat(a,i).sort((s,o)=>Date.parse(o.updatedAt||0)-Date.parse(s.updatedAt||0))}function nt(e=p()){const t=n.activeTimer;return!t||t.company_id!==e?null:t}function Ua(e=p()){return n.timeEntries.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.started_at||0)-Date.parse(t.started_at||0))}function la(e=p(),t=0){return Ua(e).filter(a=>Date.parse(a.started_at||0)>=t).reduce((a,i)=>a+x(i.duration_ms),0)}function Zs(e=p(),t=""){n.activeTimer&&Qa(!1);const a=t?Mt(t):null;n.activeTimer={id:`timer-${crypto.randomUUID()}`,company_id:e,user_id:E().profile.member_id||E().profile.id,task_id:a?.company_id===e?a.id:"",task_title:a?.company_id===e?a.title:"",started_at:new Date().toISOString()},ai(),n.sync={label:"Clock started locally",mode:"local"},u()}function Qa(e=!0){const t=n.activeTimer;if(!t)return;const a=new Date().toISOString(),i=Math.max(0,Date.parse(a)-Date.parse(t.started_at||a));n.timeEntries.unshift({id:`time-${crypto.randomUUID()}`,company_id:t.company_id,user_id:t.user_id,task_id:t.task_id||"",task_title:t.task_title||"",started_at:t.started_at,ended_at:a,duration_ms:i,notes:t.task_title?"Task timer":"General shift"}),n.activeTimer=null,ai(),n.sync={label:"Clock stopped locally",mode:"local"},e&&u()}function Et(e){return e.status!=="done"}function ca(e,t){const a=Date.parse(e.due||0)-Date.parse(t.due||0);return a||we(t.priority)-we(e.priority)}function ue(e=p()){return n.financeInvoices.filter(t=>t.company_id===e).sort(Oe("updated_at"))}function Va(e=p()){return n.financePayments.filter(t=>t.company_id===e)}function Ot(e=p()){return n.financeExpenses.filter(t=>t.company_id===e).sort(Oe("updated_at"))}function Pt(e=p()){return n.financeVendors.filter(t=>t.company_id===e)}function me(e){return n.financeInvoices.find(t=>t.id===e)||null}function Ja(e){return n.financeExpenses.find(t=>t.id===e)||null}function Rt(e){return n.financeVendors.find(t=>t.id===e)||null}function ht(e){return Rt(e)?.name||"No vendor"}function Ba(e){return n.financePayments.filter(t=>t.invoice_id===e).sort(Oe("received_at"))}function Nt(e){return K(Ba(e),"amount")}function ae(e){const t=me(e);return Math.max(0,x(t?.total)-Nt(e))}function Ha(e){const t=ae(e.id);return t<=0&&x(e.total)>0?"Paid":t<x(e.total)?"Partially paid":e.status==="Sent"&&ui(e.due_date)>0?"Overdue":e.status}function za(e=p()){const t=ue(e),a=Va(e),i=Ot(e).filter(l=>["Approved","Paid"].includes(l.status)),s={current:0,thirty:0,sixty:0,overSixty:0};t.forEach(l=>{const m=ae(l.id);if(!m)return;const y=ui(l.due_date);y<=0?s.current+=m:y<=30?s.thirty+=m:y<=60?s.sixty+=m:s.overSixty+=m});const o=K(a,"amount"),c=K(i,"amount");return{pipeline:K(A(e),"estimate_total"),invoiced:K(t,"total"),collected:o,outstanding:t.reduce((l,m)=>l+ae(m.id),0),expenses:c,net:o-c,aging:s}}function Xs(e=p(),t=""){const a=n.query.trim().toLowerCase();return z(e).filter(i=>t&&i.project_id!==t||n.taskStatusFilter!=="all"&&i.status!==n.taskStatusFilter||n.taskPriorityFilter!=="all"&&i.priority!==n.taskPriorityFilter?!1:a?[i.title,i.description,Qe(i.type),J(i.assignee_id),D(i.project_id)?.name].some(s=>String(s||"").toLowerCase().includes(a)):!0)}function Wa(){const e=ke();return n.companies.filter(t=>e.includes(t.id))}function Ya(e,t=p()){if(!e)return!0;const a=E().profile;if(n.session?.auth==="supabase"){const o=$t(t,a.id);if(!o||o.status!=="active")return!1;if(["owner","developer"].includes(String(o.role).toLowerCase()))return!0;const c=n.roleAssignments.filter(m=>m.company_id===t&&m.profile_id===a.id).map(m=>m.role_id),l=n.rolePermissions.filter(m=>c.includes(m.role_id));if(l.some(m=>(m.permission_key===e||m.permission_key==="*")&&m.effect==="deny"))return!1;if(l.some(m=>(m.permission_key===e||m.permission_key==="*")&&m.effect==="allow"))return!0}const i=String($t(t,a.id)?.role||a.role||"member").toLowerCase(),s=Xt[i]||Xt.member;return s.includes("*")||s.includes(e)}function ke(){const e=E().profile,t=n.companies.map(s=>s.id);if(n.session?.auth==="supabase"){const s=n.memberships.filter(o=>o.profile_id===e.id&&o.status==="active").map(o=>_(o.company_id));return Z(s).filter(o=>t.includes(o))}if(["developer","admin"].includes(e.role))return Z(t.length?t:$e.map(s=>_(s.id)));const a=n.memberships.filter(s=>s.profile_id===e.id&&s.status!=="disabled").map(s=>_(s.company_id)),i=a.length?a:e.company_ids||[];return Z(i.map(_)).filter(s=>t.includes(s))}function p(){const e=ke();return e.includes(n.activeCompanyId)?n.activeCompanyId:e[0]||n.activeCompanyId||F()}function F(){return _($e[0].id)}function st(e){const t=_(e);return n.companies.find(a=>a.id===t)||$e.map(xe).find(a=>a.id===t)||null}function k(e){const t=st(e);return t?rt(t):e||"Company"}function rt(e){return e.short_name||e.label||e.name||e.id}function se(e){return st(e)?.color||"#f0b23b"}function We(e){return _(n.jobs.find(t=>t.id===e)?.company_id||"")}function ot(e){const t=E().profile;return n.session?.auth!=="supabase"&&["developer","admin"].includes(t.role)?O(t.role):O($t(e,t.id)?.role||t.role||"member")}function Lt(e,t){const a=n.memberships.find(i=>i.company_id===e&&(i.member_id===t||i.profile_id===t));return O(a?.role||"member")}function $t(e,t){return n.memberships.find(a=>a.company_id===e&&a.profile_id===t)||null}function Ut(e=p()){return n.subscriptions.find(t=>t.company_id===e)||null}function Qt(e=p()){if(n.session?.auth!=="supabase")return!0;const t=Ut(e);return!!(!t||["trialing","active","past_due","grace"].includes(t.status)||t.grace_ends_at&&Date.parse(t.grace_ends_at)>Date.now())}function Ka(e=p()){const t=Ut(e);return t?t.status==="trialing"?`Trial - ${T(t.trial_ends_at)}`:t.status==="active"?"Active subscription":t.status==="past_due"?"Past due grace":t.status==="grace"?`Grace - ${T(t.grace_ends_at)}`:O(t.status):n.session?.auth==="supabase"?"Trial pending":"Demo mode"}function J(e){const t=n.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function lt(e){return n.tasks.filter(t=>t.project_id===e).length}function Ke(e){return n.files.filter(t=>t.job_id===e).length}function _(e){return{"quest-roofing":"roofing","quest-drafting":"drafting"}[String(e||"").trim()]||String(e||"").trim()}function wt(e){const t=new Map;return e.map(xe).forEach(a=>{!a.id||t.has(a.id)||t.set(a.id,a)}),Array.from(t.values())}function xe(e){return{id:_(e.id||""),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function Ae(e){return{id:String(e.id||""),company_id:_(e.company_id||F()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:Re.includes(e.stage)?e.stage:"Lead",priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:x(e.estimate_total),invoice_total:x(e.invoice_total),task_count:x(e.task_count),file_count:x(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function Te(e){const t=Ye.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=Ne.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:qa.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:_(e.company_id||F()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||h(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:Ye.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function Ge(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:_(e.company_id||F()),job_id:String(e.job_id||""),folder:String(e.folder||Br(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:x(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ga(e){return{id:String(e.id||`folder-${crypto.randomUUID()}`),company_id:_(e.company_id||F()),name:String(e.name||"New folder").trim()||"New folder",parent_key:String(e.parent_key||"home"),created_by_label:String(e.created_by_label||"Quest HQ"),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ct(e){const t=Array.isArray(e.questions)?e.questions.map(dt):[],a=Le.includes(e.type)?e.type:"Internal",i=Ft.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:_(e.company_id||F()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:i,audience:String(e.audience||"Internal").trim(),creator_id:String(e.creator_id||e.created_by||e.created_by_id||""),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function dt(e){const t=Ue.some(([i])=>i===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(i=>String(i||"").trim()).filter(Boolean):[]};return Ee(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function Za(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:_(e.company_id||F()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function Vt(e){const t=x(e.subtotal),a=x(e.tax),i=x(e.total)||t+a;return{id:String(e.id||`invoice-${crypto.randomUUID()}`),company_id:_(e.company_id||F()),job_id:String(e.job_id||""),client_name:String(e.client_name||"").trim(),invoice_number:String(e.invoice_number||`INV-${Date.now()}`).trim(),status:Fa.includes(e.status)?e.status:"Draft",issue_date:String(e.issue_date||h(0)).slice(0,10),due_date:String(e.due_date||h(30)).slice(0,10),subtotal:t,tax:a,total:i,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Jt(e){return{id:String(e.id||`payment-${crypto.randomUUID()}`),company_id:_(e.company_id||F()),invoice_id:String(e.invoice_id||""),amount:x(e.amount),method:Aa.includes(e.method)?e.method:"ACH",received_at:String(e.received_at||h(0)).slice(0,10),reference:String(e.reference||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString()}}function Bt(e){return{id:String(e.id||`expense-${crypto.randomUUID()}`),company_id:_(e.company_id||F()),job_id:String(e.job_id||""),vendor_id:String(e.vendor_id||""),category:et.includes(e.category)?e.category:"Other",amount:x(e.amount),status:Ia.includes(e.status)?e.status:"Pending",spent_at:String(e.spent_at||h(0)).slice(0,10),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ht(e){return{id:String(e.id||`vendor-${crypto.randomUUID()}`),company_id:_(e.company_id||F()),name:String(e.name||"New vendor").trim()||"New vendor",contact_name:String(e.contact_name||"").trim(),email:String(e.email||"").trim(),phone:String(e.phone||"").trim(),category:et.includes(e.category)?e.category:"Other",status:xa.includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Xa(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,supervisor_id:String(e.supervisor_id||e.manager_id||""),company_ids:Array.isArray(e.company_ids)?Z(e.company_ids.map(_)):[]}}function er(e){return{company_id:_(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:String(e.status||"active")}}function tr(e){return{company_id:_(e.company_id||""),status:String(e.status||"trialing"),plan_code:String(e.plan_code||"quest_company_300"),amount_cents:x(e.amount_cents||3e4),currency:String(e.currency||"usd"),stripe_customer_id:String(e.stripe_customer_id||""),stripe_subscription_id:String(e.stripe_subscription_id||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||""}}function ve(e){return{id:String(e.id||""),company_id:_(e.company_id||""),name:String(e.name||"Role").trim()||"Role",color:String(e.color||"#f0b23b"),priority:x(e.priority),is_system:e.is_system===!0,created_by:String(e.created_by||"")}}function St(e){return{role_id:String(e.role_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function ar(e){return{company_id:_(e.company_id||""),profile_id:String(e.profile_id||""),role_id:String(e.role_id||""),assigned_by:String(e.assigned_by||"")}}function ir(e){return{id:String(e.id||""),company_id:_(e.company_id||""),resource_type:String(e.resource_type||""),resource_id:String(e.resource_id||""),principal_type:String(e.principal_type||""),principal_id:String(e.principal_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function nr(e){return{id:String(e.id||""),company_id:_(e.company_id||""),resource_type:String(e.resource_type||""),field_key:String(e.field_key||""),role_id:String(e.role_id||""),visibility:["visible","masked","hidden"].includes(e.visibility)?e.visibility:"visible",editable:e.editable!==!1}}function sr(e){return{id:String(e.id||""),company_id:_(e.company_id||""),email:String(e.email||""),role_id:String(e.role_id||""),status:String(e.status||"pending"),expires_at:e.expires_at||"",invited_by:String(e.invited_by||"")}}function rr(e){return{id:String(e.id||""),company_id:_(e.company_id||""),profile_id:String(e.profile_id||""),requested_email:String(e.requested_email||""),status:String(e.status||"pending"),message:String(e.message||""),reviewed_by:String(e.reviewed_by||""),created_at:e.created_at||""}}function or(e=p()){return Ae({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function lr(e=p(),t=""){return Te({id:"",title:"",company_id:e,project_id:t,assignee_id:ne(e)[0]?.id||"abraham",creator_id:E().profile.member_id||"abraham",due:h(1),priority:"medium",status:"todo",type:"admin"})}function cr(e=p()){const t=de();return Vt({id:"",company_id:e,job_id:t?.company_id===e?t.id:"",client_name:t?.company_id===e?t.client_name:"",invoice_number:Hr(e),status:"Draft",issue_date:h(0),due_date:h(30),subtotal:t?.company_id===e?t.estimate_total:0,tax:0,notes:""})}function dr(e=p(),t=""){const a=t?me(t):ue(e).find(s=>ae(s.id)>0),i=a?.company_id===e?a:null;return Jt({id:"",company_id:e,invoice_id:i?.id||"",amount:i?ae(i.id):0,method:"ACH",received_at:h(0),reference:"",notes:""})}function pr(e=p(),t=""){return Bt({id:"",company_id:e,job_id:de()?.company_id===e?de().id:"",vendor_id:t||Pt(e)[0]?.id||"",category:"Materials",status:"Pending",amount:0,spent_at:h(0),notes:""})}function ur(e=p()){return Ht({id:"",company_id:e,name:"",category:"Materials",status:"Active"})}function mr(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function fr(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function E(){return n.session?n.session.auth==="supabase"?n.session:{...n.session,profile:{...kt().profile,...n.session.profile||{},...n.profileDraft||{}}}:kt()}function br(e,t){return{auth:"supabase",access_token:e.access_token,refresh_token:e.refresh_token,user:{id:e.user.id,email:e.user.email||""},profile:zt(t||{},{id:e.user.id,email:e.user.email||"",full_name:e.user.user_metadata?.full_name||e.user.email||"Quest user",role:"member",member_id:"",company_ids:[],avatar_url:""})}}function kt(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",...n.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:_e.localUsername,email:e.email},profile:e}}function zt(e,t={}){const a=String(e.role||t.role||"member").toLowerCase();return{id:String(e.id||t.id||""),email:String(e.email||t.email||""),full_name:String(e.full_name||t.full_name||e.email||t.email||"Quest user"),role:a,role_label:O(a),member_id:String(e.member_id||t.member_id||""),company_ids:Array.isArray(e.company_ids)?Z(e.company_ids.map(_)):t.company_ids||[],avatar_url:String(e.avatar_url||t.avatar_url||""),approved:e.approved!==!1,supervisor_id:String(e.supervisor_id||t.supervisor_id||"")}}function U(e,t,a=""){const i=Ta();return`
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${G(i)}</span>
        <div>
          <div class="context-line"><span>${r(k(p()))}</span><b>${r(ot(p()))}</b></div>
          <h1>${r(e)}</h1>
          <p>${r(t)}</p>
        </div>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function gr(e){return`<section class="metric-grid">${e.map(([t,a])=>`<article class="metric">${G(Ma(t),"metric-symbol")}<span>${r(t)}</span><strong>${r(a)}</strong></article>`).join("")}</section>`}function vr(e){return`
    <button class="queue-row" type="button" data-select-job="${r(e.id)}">
      <span><strong>${r(e.name)}</strong><small>${r(e.client_name||k(e.company_id))}</small></span>
      ${Wt(e.priority)}
      <b>${r(e.stage)}</b>
    </button>
  `}function pt(e){return`
    <button class="queue-row" type="button" data-select-task="${r(e.id)}">
      <span><strong>${r(e.title)}</strong><small>${r(D(e.project_id)?.name||k(e.company_id))}</small></span>
      ${ei(e.priority)}
      <b>${r(oe(e.status))}</b>
    </button>
  `}function yr(e){return`
    <button class="job-card priority-${r(e.priority.toLowerCase())} ${e.id===n.selectedJobId?"active":""}" type="button" data-select-job="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.client_name||"No client")}</span>
      <small>${r(k(e.company_id))} - ${r(e.owner_name||"Unassigned")}</small>
      <em>${r(lt(e.id))} tasks</em>
    </button>
  `}function Je(e,t,a,i){return`
    <a class="mini-link" href="${b(e)}" data-router>
      <i class="ti ${r(t)}"></i>
      <span><strong>${r(a)}</strong><small>${r(i)}</small></span>
    </a>
  `}function P(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${r(t)}</span><strong>${r(a)}</strong></div>`).join("")}</div>`}function $(e,t,a="",i=!1,s="text",o=""){return`<label class="${r(o)}"><span>${r(e)}</span><input name="${r(t)}" type="${r(s)}" value="${r(a)}" ${i?"required":""} /></label>`}function ie(e,t,a="",i=""){return`<label class="${r(i)}"><span>${r(e)}</span><textarea name="${r(t)}" rows="4">${r(a)}</textarea></label>`}function M(e,t,a,i){return`
    <label><span>${r(e)}</span><select name="${r(t)}">
      ${i.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function Wt(e){return`<span class="priority ${r(String(e).toLowerCase())}">${r(e)}</span>`}function ei(e){return`<span class="priority ${r(e)}">${r(O(e))}</span>`}function ti(e){return`<span class="status-pill ${r(e)}">${r(oe(e))}</span>`}function _r(e){return`<span class="finance-status ${r(Zt(e))}">${r(e)}</span>`}function ut(e,t){if(e.avatar_url)return`<span class="${r(t)}"><img src="${r(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(i=>i[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${r(t)}">${r(a)}</span>`}function g(e){return`<div class="empty-state">${G("q-empty","empty-symbol")}<span>${r(e)}</span></div>`}function Y(e,t){const a={};return t.forEach(i=>{const s=e.get(i);s&&(a[i]=s)}),a}function B(){I(ba,n.jobs),I(ga,n.tasks),I(va,n.files),I(ya,n.driveFolders),I(Pe,n.forms),I(jt,n.formResponses),I($a,n.financeInvoices),I(wa,n.financePayments),I(Sa,n.financeExpenses),I(ka,n.financeVendors),I(Dt,n.timeEntries),I(Ct,n.activeTimer),I(_a,n.teamMembers),I(ha,n.memberships)}function ai(){I(Dt,n.timeEntries),I(Ct,n.activeTimer)}function w(e,t,a=""){return`<article class="metric">${G(Ma(e),"metric-symbol")}<span>${r(e)}</span><strong>${r(t)}</strong>${a?`<small>${r(a)}</small>`:""}</article>`}function ce(e,t){return`<div><strong>${r(e)}</strong><span>${r(t)}</span></div>`}function ye(e,t,a,i,s=""){const o=`
    <span><strong>${r(e)}</strong><small>${r(t||"Finance record")}</small></span>
    <b>${r(a)}</b>
    <em>${T(i)}</em>
  `;return s?`<a class="finance-compact-row" href="${b(s)}" data-router>${o}</a>`:`<div class="finance-compact-row">${o}</div>`}function da(e,t){const a=pe(e);return t==="jobs"?a.filter(i=>i.job_id).length:a.filter(i=>i.folder===t).length}function ii(e="home",t=null){return t?.id?`job:${t.id}`:e||"home"}function hr(e,t="home",a=null){const i=ii(t,a),s=Ie(e).filter(o=>o.parent_key===i).map(o=>$r(e,o));return a?s:t==="home"?qt.map(([c,l,m,y])=>({id:c,name:l,caption:m,icon:y,href:b(d("files",{folder:c},e)),countLabel:`${da(e,c)} file${da(e,c)===1?"":"s"}`,updatedLabel:""})).concat(s):t==="jobs"?A(e).map(c=>({id:`job:${c.id}`,name:c.name,caption:c.client_name||k(e),icon:"ti-folder",href:b(d("files",{folder:"jobs",job_id:c.id},e)),countLabel:`${Ke(c.id)} file${Ke(c.id)===1?"":"s"}`,updatedLabel:T(c.updated_at)})).concat(s):s}function $r(e,t){const a=Ie(e).filter(o=>o.parent_key===t.id).length,i=pe(e).filter(o=>o.folder===t.id).length,s=a+i;return{id:t.id,name:t.name,caption:"Custom folder",icon:"ti-folder",href:b(d("files",{folder:t.id},e)),countLabel:`${s} item${s===1?"":"s"}`,updatedLabel:T(t.updated_at)}}function wr(e,t,a=null){if(a)return`<span>/</span><a href="${b(d("files",{folder:"jobs"},e))}" data-router>Jobs</a>`;const i=Ie(e).find(m=>m.id===t);if(!i)return`<span>/</span><strong>${r(ee(t))}</strong>`;const s=[];let o=i;const c=new Set;for(;o&&!c.has(o.id);)c.add(o.id),s.unshift(o),o=Ie(e).find(m=>m.id===o.parent_key);return`${i.parent_key&&!i.parent_key.startsWith("folder-")&&i.parent_key!=="home"?`<span>/</span><a href="${b(d("files",{folder:i.parent_key},e))}" data-router>${r(ee(i.parent_key))}</a>`:""}${s.map((m,y)=>`<span>/</span>${y===s.length-1?`<strong>${r(m.name)}</strong>`:`<a href="${b(d("files",{folder:m.id},e))}" data-router>${r(m.name)}</a>`}`).join("")}`}function Sr(e=p(),t="home",a=""){const i=(n.fileQuery||n.query||"").trim().toLowerCase(),s=n.fileCategoryFilter;let o=pe(e);return a?o=o.filter(c=>c.job_id===a):t&&t!=="home"&&(t==="jobs"?o=o.filter(c=>c.job_id):o=o.filter(c=>c.folder===t)),s&&s!=="All categories"&&(o=o.filter(c=>String(c.category||ee(c.folder)).toLowerCase()===s.toLowerCase())),i&&(o=o.filter(c=>[c.file_name,c.category,c.uploaded_by_label,c.notes,c.object_path,D(c.job_id)?.name].some(l=>String(l||"").toLowerCase().includes(i)))),o.sort((c,l)=>new Date(l.created_at||0)-new Date(c.created_at||0))}function fe(e){const t=String(e.mime_type||"").toLowerCase(),a=ni(e);return t.includes("pdf")||a==="pdf"?"PDF":t.includes("image")||["png","jpg","jpeg","gif","webp","svg"].includes(a)?"Image":t.includes("zip")||["zip","rar","7z"].includes(a)?"Archive":t.includes("spreadsheet")||t.includes("excel")||["xls","xlsx","csv"].includes(a)?"Excel":t.includes("word")||["doc","docx"].includes(a)?"Word":t.includes("text")||["txt","md","json","csv","log"].includes(a)?"Text":t.includes("presentation")||["ppt","pptx"].includes(a)?"PowerPoint":a?a.toUpperCase():ee(e.folder)}function Yt(e){const t=fe(e).toLowerCase();return t==="pdf"?"pdf":t==="image"?"image":t==="excel"?"sheet":t==="text"?"text":["word","powerpoint"].includes(t)?"doc":t==="archive"?"zip":"doc"}function ni(e){return String(e.file_name||"").split(".").pop()?.toLowerCase()||""}function Kt(e,t=!1){const a=pi(e);return e.signed_url?`<img src="${r(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${r(Yt(e))} ${t?"large":""}"><i class="ti ${r(a)}"></i></span>`}function kr(e){const t=fe(e),a=ni(e);return t==="Image"?a&&a.length<=4?a.toUpperCase():"IMG":t==="Archive"?a&&a.length<=3?a.toUpperCase():"ZIP":t==="Excel"?a==="csv"?"CSV":"XLS":t==="Word"?"DOC":t==="PowerPoint"?"PPT":t==="Text"?a&&a.length<=4?a.toUpperCase():"TXT":t.length<=4?t.toUpperCase():(a||"FILE").slice(0,4).toUpperCase()}function re(e=p()){return n.forms.filter(t=>t.company_id===e)}function jr(e=p()){const t=n.formQuery.trim().toLowerCase(),a=n.route?.jobId||"";return re(e).filter(i=>a&&i.linked_job_id!==a||n.formTypeFilter!=="all"&&i.type!==n.formTypeFilter?!1:t?[i.title,i.description,i.type,i.status,i.audience,D(i.linked_job_id)?.name].some(s=>String(s||"").toLowerCase().includes(t)):!0)}function Me(e=p()){const t=n.route?.jobId||"",a=re(e).filter(o=>!t||o.linked_job_id===t),i=n.route?.params?.get("form_id")||"";if(i&&a.some(o=>o.id===i)&&(n.selectedFormId=i),!a.length)return n.selectedFormId="",n.selectedQuestionId="",null;let s=a.find(o=>o.id===n.selectedFormId)||a[0];return n.selectedFormId=s.id,(!n.selectedQuestionId||!s.questions.some(o=>o.id===n.selectedQuestionId))&&(n.selectedQuestionId=s.questions[0]?.id||""),s}function be(e){return n.forms.find(t=>t.id===e)||null}function te(){return be(n.selectedFormId)||Me(p())}function si(e=p()){return n.formResponses.filter(t=>t.company_id===e)}function mt(e){return n.formResponses.filter(t=>t.form_id===e)}function ri(e){return Array.isArray(e?.questions)?e.questions.length:0}function Dr(e){const t=String(e?.creator_id||""),a=E().profile;return t?t&&(t===a.member_id||t===a.id)?a.full_name||"Quest Basic Mode":J(t):e?.created_by_label||a.full_name||"Quest HQ"}function De(e,t,a="",i=!1,s="text"){return`<label><span>${r(e)}</span><input data-form-field="${r(t)}" type="${r(s)}" value="${r(a)}" ${i?"required":""} /></label>`}function oi(e,t,a=""){return`<label><span>${r(e)}</span><textarea data-form-field="${r(t)}" rows="3">${r(a)}</textarea></label>`}function Be(e,t,a,i){return`
    <label><span>${r(e)}</span><select data-form-field="${r(t)}">
      ${i.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function Ee(e){return["multiple","checkbox","dropdown"].includes(e.type)}function Cr(e){return{short:"ti-letter-t",paragraph:"ti-align-left",multiple:"ti-circle-dot",checkbox:"ti-checkbox",dropdown:"ti-select",date:"ti-calendar",rating:"ti-star",yesno:"ti-circle-check",file:"ti-paperclip"}[e]||"ti-plus"}function qr(e){return Ue.find(([t])=>t===e)?.[1]||O(e||"Question")}function X(e,t){return`
    <div class="response-question">
      <label>
        <span>${r(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${r(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function li(e){const t=be(e.form_id),a=Object.entries(e.answers||{}).map(([i,s])=>{const o=t?.questions.find(l=>l.id===i),c=Array.isArray(s)?s.join(", "):s;return ce(o?.label||i,c||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${r(t?.title||"Response")}</h2><p>${r(e.submitted_by||e.submitter_email||"Anonymous")} / ${T(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||ce("Response","No answers captured.")}</div>
  `}function qe(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[R("short","Inspection address"),R("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),R("paragraph","Recommended scope"),R("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[R("short","Client name"),R("yesno","Approved to proceed?"),R("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[R("short","Request title"),R("dropdown","Priority",["Low","Medium","High","Urgent"]),R("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[R("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),R("yesno","Weather safe?"),R("paragraph","Safety notes")]}]}function Fr(e=p()){return ct({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:n.route?.jobId||"",theme_color:se(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[R("short","First question")]})}function R(e="short",t="Untitled question",a=[]){return dt({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function Ir(e,t={}){const a=Fr(e),i=ct({...a,...t,id:t.id||`form-${crypto.randomUUID()}`,company_id:e,questions:(t.questions||a.questions).map(s=>dt(s)),created_at:t.created_at||new Date().toISOString(),updated_at:new Date().toISOString()});return n.forms.unshift(i),n.selectedFormId=i.id,n.selectedQuestionId=i.questions[0]?.id||"",n.formsTab="builder",n.formEditorTab="questions",n.modal="",n.formStartTemplateId="",n.formStartTab="blank",Q("New form created"),u(),i}function xr(e){const t=Object.fromEntries(new FormData(e).entries()),a=t.template_id?qe().find(c=>c.id===t.template_id):null,i=String(t.title||a?.title||"Untitled form").trim()||"Untitled form",s=String(t.description||a?.description||"").trim(),o=a?a.questions.map(c=>({...Ze(c),id:`q-${crypto.randomUUID()}`})):[R("short","First question")];Ir(p(),{title:i,description:s,type:Le.includes(t.type)?t.type:a?.type||"Internal",audience:String(t.audience||"Internal").trim()||"Internal",creator_id:E().profile.member_id||E().profile.id||"basic-quest-user",linked_job_id:String(t.linked_job_id||""),theme_color:se(p()),background:"clean",submit_label:String(t.submit_label||"Submit").trim()||"Submit",collect_email:t.collect_email==="on",require_approval:t.require_approval==="on",questions:o})}function He(e,t=!0){const a=be(e);a&&(n.selectedFormId=a.id,n.selectedQuestionId=a.questions[0]?.id||"",t&&u())}function Q(e="Forms saved locally"){const t=te();t&&(t.updated_at=new Date().toISOString()),I(Pe,n.forms),I(jt,n.formResponses),n.sync={label:e,mode:"live"}}function pa(e,t){const a=be(e||n.selectedFormId);a&&(a.status=Ft.includes(t)?t:"Draft",n.selectedFormId=a.id,Q(`${a.status} locally`),u())}function Ar(e){const t=be(e||n.selectedFormId);if(!t)return;const a=ct({...Ze(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(i=>({...Ze(i),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});n.forms.unshift(a),n.selectedFormId=a.id,n.selectedQuestionId=a.questions[0]?.id||"",Q("Form duplicated"),u()}function Tr(e){const t=e||n.selectedFormId;t&&(n.forms=n.forms.filter(a=>a.id!==t),n.formResponses=n.formResponses.filter(a=>a.form_id!==t),n.selectedFormId=re(p())[0]?.id||"",n.selectedQuestionId=Me(p())?.questions[0]?.id||"",n.modal="",Q("Form deleted locally"),u())}async function Mr(e){const t=e||n.selectedFormId,a=`${window.location.origin}${b(d("forms",{form_id:t},p()))}`;try{await navigator.clipboard.writeText(a),n.sync={label:"Form link copied",mode:"live"}}catch{n.sync={label:"Copy failed",mode:"local"}}u()}function Er(e){const t=JSON.stringify({company_id:e,forms:re(e),responses:si(e)},null,2);Vr(`${e}-forms-export.json`,t,"application/json")}function ci(e){const t=te();if(!t)return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),I(Pe,n.forms))}function di(e){const t=te(),a=e.closest("[data-question-id]"),i=t?.questions.find(s=>s.id===a?.dataset.questionId);if(!(!t||!i)){if(n.selectedQuestionId=i.id,e.matches("[data-question-option]")){const s=Number(e.dataset.questionOption);i.options[s]=e.value}else{const s=e.dataset.questionField;if(s==="required")i.required=e.checked;else if(s==="type"){i.type=e.value,Ee(i)&&!i.options.length&&(i.options=["Option 1","Option 2"]),Ee(i)||(i.options=[]),Q("Question updated"),u();return}else s&&(i[s]=e.value)}t.updated_at=new Date().toISOString(),I(Pe,n.forms)}}function Or(e="multiple"){const t=te();if(!t)return;const a=R(e,Ue.find(([i])=>i===e)?.[1]||"New question");t.questions.push(a),n.selectedQuestionId=a.id,Q("Question added"),u()}function Pr(e){const t=te(),a=t?.questions.find(o=>o.id===e);if(!t||!a)return;const i=t.questions.findIndex(o=>o.id===e),s=dt({...Ze(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(i+1,0,s),n.selectedQuestionId=s.id,Q("Question duplicated"),u()}function Rr(e){const t=te();t&&(t.questions=t.questions.filter(a=>a.id!==e),n.selectedQuestionId=t.questions[0]?.id||"",Q("Question deleted"),u())}function Nr(e,t){const a=te();if(!a||!t)return;const i=a.questions.findIndex(c=>c.id===e),s=i+t;if(i<0||s<0||s>=a.questions.length)return;const[o]=a.questions.splice(i,1);a.questions.splice(s,0,o),n.selectedQuestionId=e,Q("Question moved"),u()}function Lr(e){const a=te()?.questions.find(i=>i.id===e);a&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),Q("Option added"),u())}function Ur(e,t){const i=te()?.questions.find(s=>s.id===e);!i||t<0||(i.options.splice(t,1),i.options.length||i.options.push("Option 1"),Q("Option removed"),u())}function Qr(e){const t=be(e.dataset.formId);if(!t)return;const a=new FormData(e),i={};t.questions.forEach(s=>{const o=`answer:${s.id}`,c=a.getAll(o).filter(l=>l instanceof File?l.name:String(l||"").trim());i[s.id]=c.length>1?c.map(l=>l instanceof File?l.name:l):c[0]instanceof File?c[0].name:c[0]||""}),n.formResponses.unshift(Za({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||E().profile.full_name||"Preview submitter"),answers:i,created_at:new Date().toISOString()})),n.formsTab="responses",n.modal="",Q("Preview response saved"),u()}function Vr(e,t,a="text/plain"){const i=new Blob([t],{type:a}),s=URL.createObjectURL(i),o=document.createElement("a");o.href=s,o.download=e,o.click(),URL.revokeObjectURL(s)}function Ze(e){return JSON.parse(JSON.stringify(e))}function Z(e){return Array.from(new Set(e.map(t=>String(t||"").trim()).filter(Boolean)))}function oe(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||O(e)}function Qe(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||O(e)}function ee(e){return qt.find(([t])=>t===e)?.[1]||n.driveFolders.find(t=>t.id===e)?.name||O(e||"Shared")}function Jr(e=p()){return qt.map(([t,a])=>[t,a]).concat(Ie(e).map(t=>[t.id,t.name]))}function Br(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function pi(e){const t=fe(e);return t==="Image"?"ti-photo":t==="PDF"?"ti-file-type-pdf":t==="Archive"?"ti-file-zip":t==="Excel"?"ti-file-spreadsheet":t==="Word"?"ti-file-type-doc":t==="PowerPoint"?"ti-file-type-ppt":t==="Text"?"ti-file-text":"ti-file-description"}function O(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function h(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function T(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function ua(e){if(!e)return"No time";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(t)}function ze(e){const t=Math.max(0,Math.floor(x(e)/1e3)),a=Math.floor(t/3600),i=Math.floor(t%3600/60);return a?`${a}h ${String(i).padStart(2,"0")}m`:`${i}m`}function Gt(e){const t=x(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],i=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**i).toFixed(i?1:0)} ${a[i]}`}function Oe(e){return(t,a)=>Date.parse(a[e]||a.updated_at||a.created_at||0)-Date.parse(t[e]||t.updated_at||t.created_at||0)}function ui(e){if(!e)return 0;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?0:Math.floor((ft().getTime()-t.getTime())/864e5)}function ma(e){if(!e)return 999;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?999:Math.floor((t.getTime()-ft().getTime())/864e5)}function Hr(e=p()){const t=(rt(st(e)||{short_name:e})||e||"QH").replace(/[^a-z]/gi,"").slice(0,2).toUpperCase()||"QH",a=ue(e).length+1;return`${t}-${String(1e3+a)}`}function ft(){const e=new Date;return e.setHours(0,0,0,0),e}function zr(e,t){return`${mi(e,t)}%`}function mi(e,t){const a=x(t);return a?Math.max(0,Math.min(100,Math.round(x(e)/a*100))):0}function we(e){return{critical:5,urgent:4,high:3,medium:2,low:1}[String(e||"").toLowerCase()]||0}function Zt(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function K(e,t){return e.reduce((a,i)=>a+x(i[t]),0)}function x(e){const t=Number(e);return Number.isFinite(t)?t:0}function v(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(x(e))}function Ce(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function V(e,t){const a=Ce(e,t);return Array.isArray(a)&&a.length?a:t}function I(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
