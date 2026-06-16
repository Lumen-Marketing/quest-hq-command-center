(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=a(r);fetch(r.href,o)}})();const we={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://lpzotcznihwyyudxycmd.supabase.co",supabaseKey:"sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07"},_e=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),Se="quest-hq-local-session",Pa="quest-hq-local-profile",Lt="quest-hq-job-cache-v2",Nt="quest-hq-task-cache-v1",Ut="quest-hq-file-cache-v1",Qt="quest-hq-drive-folder-cache-v1",Vt="quest-hq-team-cache-v1",Jt="quest-hq-company-membership-cache-v1",Ce="quest-hq-company-form-cache-v1",lt="quest-hq-company-form-response-cache-v1",Bt="quest-hq-finance-invoice-cache-v1",Ht="quest-hq-finance-payment-cache-v1",zt="quest-hq-finance-expense-cache-v1",Wt="quest-hq-finance-vendor-cache-v1",ct="quest-hq-time-entry-cache-v1",dt="quest-hq-active-timer-v1",ne="quest-hq-active-company",La="quest-hq-task-view",Na="quest-hq-drive-view",$a={developer:["*"],admin:["*"],owner:["*"],manager:["jobs.view","jobs.manage","tasks.view","tasks.manage","files.view","files.manage","forms.view","forms.manage","finance.view","team.view","clock.manage","approvals.manage","approvals.view","users.view","settings.view","billing.view","roles.view"],member:["jobs.view","tasks.view","tasks.manage","files.view","forms.view","time.track","approvals.view","users.view"]},Bi=[["jobs.view","View jobs"],["jobs.manage","Create/edit jobs"],["tasks.view","View tasks"],["tasks.manage","Create/edit tasks"],["files.view","View files"],["files.manage","Upload/delete files"],["forms.view","View forms"],["forms.manage","Create/edit forms"],["crm.view","View CRM"],["finance.view","View finance"],["finance.manage","Create/edit finance"],["users.view","View users"],["users.manage","Invite/manage users"],["roles.view","View roles"],["roles.manage","Create/edit roles"],["billing.view","View billing"],["billing.manage","Manage subscription"],["settings.view","View settings"],["settings.manage","Manage settings"],["time.track","Track own time"],["clock.manage","Manage clock dashboard"],["approvals.view","View approvals"],["approvals.manage","Manage approvals"]],ut=[{id:"jobs",group:"Workspace",label:"Jobs",icon:"ti-briefcase",symbol:"q-symbol-jobs",status:"live",permission:"jobs.view"},{id:"tasks",group:"Workspace",label:"Tasks",icon:"ti-list-check",symbol:"q-symbol-tasks",status:"live",permission:"tasks.view"},{id:"files",group:"Workspace",label:"Files",icon:"ti-folder",symbol:"q-symbol-files",status:"live",permission:"files.view"},{id:"forms",group:"Workspace",label:"Forms",icon:"ti-clipboard-list",symbol:"q-symbol-forms",status:"live",permission:"forms.view"},{id:"analytics",group:"Workspace",label:"Analytics",icon:"ti-chart-bar",symbol:"q-symbol-analytics",status:"live",permission:"jobs.view"},{id:"crm",group:"Workspace",label:"CRM",icon:"ti-users-group",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"tickets",group:"Workspace",label:"Tickets",icon:"ti-ticket",symbol:"q-symbol-tickets",status:"planned"},{id:"finance",group:"Workspace",label:"Finance",icon:"ti-receipt-dollar",symbol:"q-symbol-finance",status:"live",permission:"finance.view"},{id:"knowledge",group:"Workspace",label:"Knowledge Base",icon:"ti-books",symbol:"q-symbol-knowledge",status:"planned"},{id:"automations",group:"Workspace",label:"Automations",icon:"ti-automation",symbol:"q-symbol-automations",status:"planned"},{id:"templates",group:"Workspace",label:"Templates",icon:"ti-template",symbol:"q-symbol-templates",status:"planned"},{id:"users",group:"Company",label:"Users",icon:"ti-users",symbol:"q-symbol-users",status:"live",permission:"users.view"},{id:"settings",group:"Company",label:"Settings",icon:"ti-settings",symbol:"q-symbol-settings",status:"live",permission:"settings.view"},{id:"team-chart",group:"Company",label:"Team chart",icon:"ti-hierarchy-3",symbol:"q-symbol-team-chart",status:"live",permission:"team.view"},{id:"time",group:"Operations",label:"My time",icon:"ti-clock",symbol:"q-symbol-time",status:"live",permission:"time.track"},{id:"approvals",group:"Operations",label:"Approvals",icon:"ti-user-check",symbol:"q-symbol-approvals",status:"live",permission:"approvals.view"},{id:"team-workload",group:"Operations",label:"Team workload",icon:"ti-users",symbol:"q-symbol-team-workload",status:"planned"},{id:"clock",group:"Operations",label:"Clock dashboard",icon:"ti-clock-hour-4",symbol:"q-symbol-clock",status:"live",permission:"clock.manage"}],Hi={"/admin.html":"settings","/automations.html":"automations","/crm.html":"crm","/dashboards.html":"analytics","/files.html":"files","/finance.html":"finance","/forms.html":"forms","/jobs.html":"jobs","/knowledge.html":"knowledge","/templates.html":"templates","/tickets.html":"tickets"},Pe=["Lead","Site Review","Estimate","Approved","Active","Closed"],Ua=["pipeline","list","profile"],Le=["todo","pending","hold","review","done"],Xe=["critical","urgent","high","medium","low"],Qa=["lead","bid","admin","invoicing","ar","meeting","web_dev"],zi=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],Yt=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],Ne=["Inspection","Client approval","Intake","Survey","Safety","Internal"],Kt=["Draft","Published","Archived"],Va=["Draft","Sent","Partially paid","Paid","Overdue","Void"],Ja=["Pending","Approved","Paid","Rejected"],Ba=["Active","On hold","Inactive"],Ha=["ACH","Check","Card","Cash","Wire","Other"],pt=["Materials","Labor","Subcontractor","Permit","Equipment","Marketing","Software","Travel","Other"],Ue=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],Qe=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],za=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],Wa=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"],supervisor_id:""},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"],supervisor_id:"abraham"},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"],supervisor_id:"maya"},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"],supervisor_id:"abraham"},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"],supervisor_id:""}],Ya=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],Ka=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:S(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:S(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:S(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:S(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:S(5),priority:"medium",urgency:"medium",status:"todo"}],Ga=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],Za=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",creator_id:"abraham",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",creator_id:"maya",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",creator_id:"noah",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",creator_id:"lumen-ops",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],Xa=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],ei=[{id:"vendor-roofing-materials",company_id:"roofing",name:"Valley Roofing Supply",contact_name:"Elena Ortiz",email:"orders@valleyroofingsupply.local",phone:"(480) 555-0190",category:"Materials",status:"Active",notes:"Primary tile, flashing, and underlayment vendor.",created_at:new Date(Date.now()-12096e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"vendor-roofing-dryin",company_id:"roofing",name:"Monsoon Dry-In Crew",contact_name:"R. Alvarez",email:"dispatch@monsoondryin.local",phone:"(602) 555-0144",category:"Subcontractor",status:"Active",notes:"Emergency dry-in support during storm calls.",created_at:new Date(Date.now()-10368e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"vendor-drafting-permits",company_id:"drafting",name:"Permit Runner AZ",contact_name:"Sofia Chen",email:"permits@runneraz.local",phone:"(602) 555-0171",category:"Permit",status:"Active",notes:"Permit filing support for drafting packets.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString()},{id:"vendor-lumen-software",company_id:"lumen",name:"Lumen SaaS Stack",contact_name:"Ops Billing",email:"billing@lumenstack.local",phone:"",category:"Software",status:"Active",notes:"Internal software subscriptions for client onboarding.",created_at:new Date(Date.now()-7776e5).toISOString(),updated_at:new Date(Date.now()-3456e5).toISOString()}],ti=[{id:"invoice-roofing-queen-creek",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",client_name:"Rosales Residence",invoice_number:"QR-1007",status:"Partially paid",issue_date:S(-10),due_date:S(5),subtotal:6800,tax:0,total:6800,notes:"Emergency leak repair billing with deposit received.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"invoice-roofing-mesa-storage",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",client_name:"Mesa Storage Partners",invoice_number:"QR-1008",status:"Sent",issue_date:S(-18),due_date:S(-2),subtotal:18400,tax:0,total:18400,notes:"Estimate packet sent to board for approval.",created_at:new Date(Date.now()-15552e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-drafting-horizon",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",client_name:"Horizon HVAC",invoice_number:"QD-2031",status:"Sent",issue_date:S(-7),due_date:S(14),subtotal:4200,tax:0,total:4200,notes:"Drafting permit package milestone invoice.",created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-lumen-onboarding",company_id:"lumen",job_id:"",client_name:"Lumen Internal Launch",invoice_number:"LM-3004",status:"Draft",issue_date:S(-3),due_date:S(27),subtotal:3200,tax:0,total:3200,notes:"Demo onboarding package used for finance workspace.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()}],ai=[{id:"payment-roofing-queen-creek-deposit",company_id:"roofing",invoice_id:"invoice-roofing-queen-creek",amount:2500,method:"ACH",received_at:S(-4),reference:"ACH-4421",notes:"Deposit received after dry-in visit.",created_at:new Date(Date.now()-3456e5).toISOString()},{id:"payment-drafting-horizon-retainer",company_id:"drafting",invoice_id:"invoice-drafting-horizon",amount:1e3,method:"Check",received_at:S(-1),reference:"CHK-117",notes:"Retainer collected before permit packet completion.",created_at:new Date(Date.now()-864e5).toISOString()}],ii=[{id:"expense-roofing-queen-creek-materials",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",vendor_id:"vendor-roofing-materials",category:"Materials",amount:1850,status:"Approved",spent_at:S(-6),notes:"Underlayment, flashing, and tile replacement materials.",created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-roofing-mesa-permit",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",vendor_id:"vendor-roofing-materials",category:"Permit",amount:620,status:"Pending",spent_at:S(-2),notes:"Permit and document prep allowance.",created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString()},{id:"expense-drafting-horizon-runner",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",vendor_id:"vendor-drafting-permits",category:"Permit",amount:480,status:"Approved",spent_at:S(-3),notes:"Permit runner package review.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-lumen-software-stack",company_id:"lumen",job_id:"",vendor_id:"vendor-lumen-software",category:"Software",amount:540,status:"Paid",spent_at:S(-5),notes:"Client onboarding software stack.",created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()}],i={route:null,session:ue(Se,null),profileDraft:ue(Pa,null),authReady:!1,authMode:"signin",jobs:T(Lt,za).map(ke),tasks:T(Nt,Ka).map(je),files:T(Ut,Ga).map(Te),driveFolders:T(Qt,[]).map(ua),forms:T(Ce,Za).map(Je),formResponses:T(lt,Xa).map(pa),financeInvoices:T(Bt,ti).map(wt),financePayments:T(Ht,ai).map(St),financeExpenses:T(zt,ii).map(kt),financeVendors:T(Wt,ei).map(jt),timeEntries:ue(ct,[]),activeTimer:ue(dt,null),teamMembers:T(Vt,Wa).map(ma),memberships:T(Jt,Ya),profiles:[],subscriptions:[],roles:[],rolePermissions:[],roleAssignments:[],resourceAcl:[],fieldPermissions:[],companyInvites:[],joinRequests:[],auditEvents:[],companies:Ci(Qe.map(Ve)),activeCompanyId:localStorage.getItem(ne)||"",selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",selectedFinanceInvoiceId:"",selectedFinanceExpenseId:"",selectedFinanceVendorId:"",expandedFormIds:new Set,formStartTemplateId:"",formStartTab:"blank",query:"",fileQuery:"",formQuery:"",crmQuery:"",stageFilter:"all",crmStageFilter:"all",crmOwnerFilter:"all",taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(La)||"table",driveFolder:"home",driveView:localStorage.getItem(Na)||"list",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",authMessage:"",toast:null,toastTimer:null,modal:"",accountMenuOpen:!1},mt=document.getElementById("app");let It=null;Wi();function Wi(){mr(),window.addEventListener("popstate",u),document.addEventListener("click",Es),document.addEventListener("submit",Ps),document.addEventListener("input",Ks),document.addEventListener("change",Gs),Yi(),u()}async function Yi(){if(i.session?.auth==="local-basic"){ni(),i.authReady=!0;return}const e=P();if(!e?.auth){i.authReady=!0,i.loginError="Supabase auth is unavailable in this browser session.";return}try{const{data:t}=await e.auth.getSession();await Me(t?.session||null),e.auth.onAuthStateChange((a,n)=>{Me(n||null).finally(()=>{i.dataLoaded=!1,u()})})}catch(t){i.loginError=t.message||"Unable to initialize Supabase auth."}finally{i.authReady=!0,u()}}async function Me(e){if(!e?.user){i.session=null,localStorage.removeItem(Se);return}const t=await Ki(e.user);i.session=Hr(e,t),an(),x(Se,i.session)}async function Ki(e){const t={id:e.id,email:e.email||"",full_name:e.user_metadata?.full_name||e.email||"Quest user",role:"member",role_label:"Member",member_id:"",company_ids:[],avatar_url:"",approved:!1,email_verified:!!e.email_confirmed_at},a=P();if(!a)return t;const n=await a.from("profiles").select("*").eq("id",e.id).maybeSingle();return n.error||!n.data?t:fa(n.data,t)}function u(){if(i.route=ft(),!i.authReady){Xi();return}if(Zi(i.route)){k("/login?return_url="+encodeURIComponent(br()),{replace:!0});return}if(i.route.name==="login"){hs();return}if(en(),i.session?.auth==="supabase"&&i.dataLoaded&&!qe().length){Gi();return}const e=fr(i.route);if(e){k(e,{replace:!0});return}hr(i.route),mi(i.route),i.route.params.get("account")==="profile"&&(i.modal="profile"),document.title=`${gr(i.route)} | ${j(p())} | Quest HQ`,mt.innerHTML=sn(i.route,oi(i.route))}function Gi(){document.title="Company access pending | Quest HQ",mt.innerHTML=`
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
  `}function Zi(e){return e.name==="login"?!1:!i.session}function Xi(){document.title="Loading | Quest HQ",mt.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${g("Checking secure session...")}
      </section>
    </main>
  `}function en(){i.dataLoaded||i.dataLoading||(i.dataLoading=!0,tn().catch(()=>{i.sync={label:"Local fallback",mode:"local"}}).finally(()=>{i.dataLoaded=!0,i.dataLoading=!1,Q(),u()}))}async function tn(){if(i.session?.auth==="local-basic"){i.sync={label:"Demo mode",mode:"local"};return}const e=P();if(!e){i.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,n,r,o,l,c,m,v,f,y,L,q,H,Ie,ce]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*"),e.from("profiles").select("*"),e.from("company_subscriptions").select("*"),e.from("roles").select("*").order("priority",{ascending:!1}),e.from("role_permissions").select("*"),e.from("user_role_assignments").select("*"),e.from("resource_acl").select("*"),e.from("field_permissions").select("*"),e.from("company_invites").select("*").order("created_at",{ascending:!1}),e.from("company_join_requests").select("*").order("created_at",{ascending:!1}),e.from("audit_events").select("*").order("created_at",{ascending:!1}).limit(100)]);let W=0;t.error||(i.companies=(t.data||[]).map(Ve),W+=1),a.error||(i.jobs=(a.data||[]).map(ke),W+=1),n.error||(i.tasks=(n.data||[]).map(je),W+=1),r.error||(i.files=(r.data||[]).map(Te),W+=1),o.error||(i.teamMembers=(o.data||[]).map(ma),W+=1),l.error||(i.memberships=(l.data||[]).map(st),W+=1),c.error||(i.profiles=(c.data||[]).map(Ji=>fa(Ji)),W+=1),m.error||(i.subscriptions=(m.data||[]).map(Er),W+=1),v.error||(i.roles=(v.data||[]).map(he),W+=1),f.error||(i.rolePermissions=(f.data||[]).map(Ot)),y.error||(i.roleAssignments=(y.data||[]).map(qi)),L.error||(i.resourceAcl=(L.data||[]).map(Or)),q.error||(i.fieldPermissions=(q.data||[]).map(Rr)),H.error||(i.companyInvites=(H.data||[]).map(rt)),Ie.error||(i.joinRequests=(Ie.data||[]).map(Ii)),ce.error||(i.auditEvents=ce.data||[]),i.sync=W?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function P(){return!window.supabase||typeof window.supabase.createClient!="function"?null:(It||(It=window.supabase.createClient(we.supabaseUrl,we.supabaseKey)),It)}function an(){i.jobs=[],i.tasks=[],i.files=[],i.driveFolders=[],i.forms=[],i.formResponses=[],i.financeInvoices=[],i.financePayments=[],i.financeExpenses=[],i.financeVendors=[],i.timeEntries=[],i.activeTimer=null,i.teamMembers=[],i.memberships=[],i.profiles=[],i.subscriptions=[],i.roles=[],i.rolePermissions=[],i.roleAssignments=[],i.resourceAcl=[],i.fieldPermissions=[],i.companyInvites=[],i.joinRequests=[],i.auditEvents=[],i.companies=[],i.sync={label:"Loading secure workspace...",mode:"loading"}}function ni(){i.jobs=T(Lt,za).map(ke),i.tasks=T(Nt,Ka).map(je),i.files=T(Ut,Ga).map(Te),i.driveFolders=T(Qt,[]).map(ua),i.forms=T(Ce,Za).map(Je),i.formResponses=T(lt,Xa).map(pa),i.financeInvoices=T(Bt,ti).map(wt),i.financePayments=T(Ht,ai).map(St),i.financeExpenses=T(zt,ii).map(kt),i.financeVendors=T(Wt,ei).map(jt),i.timeEntries=ue(ct,[]),i.activeTimer=ue(dt,null),i.teamMembers=T(Vt,Wa).map(ma),i.memberships=T(Jt,Ya),i.profiles=[],i.subscriptions=[],i.roles=[],i.rolePermissions=[],i.roleAssignments=[],i.resourceAcl=[],i.fieldPermissions=[],i.companyInvites=[],i.joinRequests=[],i.auditEvents=[],i.companies=Ci(Qe.map(Ve)),i.sync={label:"Demo mode",mode:"local"}}function nn(){return`
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
  `}function G(e,t="symbol-icon"){return`<svg class="${s(t)}" aria-hidden="true" focusable="false"><use href="#${s(e)}"></use></svg>`}function si(e=i.route?.section||"jobs"){return ut.find(t=>t.id===e)?.symbol||"q-empty"}function ri(e){const t=String(e||"").toLowerCase();return t.includes("job")||t.includes("pipeline")?"q-symbol-jobs":t.includes("task")||t.includes("review")?"q-symbol-tasks":t.includes("file")?"q-symbol-files":t.includes("form")?"q-symbol-forms":t.includes("account")||t.includes("customer")||t.includes("member")||t.includes("user")||t.includes("lead")?"q-symbol-crm":t.includes("invoice")||t.includes("collected")||t.includes("expense")||t.includes("net")||t.includes("outstanding")?"q-symbol-finance":t.includes("time")||t.includes("today")||t.includes("days")||t.includes("timer")||t.includes("entries")?"q-symbol-clock":t.includes("approval")||t.includes("access")?"q-symbol-approvals":si()}function sn(e,t){const a=D(),n=p(),r=zr(a);return`
    <div class="quest-app" data-route="${s(e.name)}">
      ${nn()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${b(d("jobs",{},n))}" data-router aria-label="Quest HQ workspace">
            ${G("q-logo","brand-symbol")}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${s(we.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${G("q-company")}
            <select data-company-switch aria-label="Active company">
              ${ji().map(o=>`<option value="${s(o.id)}" ${o.id===n?"selected":""}>${s(yt(o))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            ${G("q-search")}
            <input data-global-search value="${s(i.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${s(i.sync.mode)}" data-sync-state>${s(i.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          <div class="account-menu ${i.accountMenuOpen?"open":""}">
            <button class="avatar-button" type="button" data-action="toggle-account-menu" aria-label="Open account menu" aria-expanded="${i.accountMenuOpen?"true":"false"}">
              ${Be(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${s(a.profile.full_name)}</strong>
              <span>${s(a.profile.role_label)} - ${s(j(n))}</span>
              ${r?"":`
                <div class="account-status warning">
                  <b>Email unverified</b>
                  <button type="button" data-action="verify-email">Click here to verify</button>
                </div>
              `}
              <button type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
              <button type="button" data-action="sign-out"><i class="ti ti-logout"></i>Sign out</button>
            </div>
          </div>
        </div>
      </header>
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${rn(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
    </div>
    ${ks(e,a)}
    ${js()}
  `}function rn(e){const t=p();return`
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${s(re(t))}">${G("q-company")}</span>
      <div>
        <strong>${s(j(t))}</strong>
        <small>${s(_t(t))} workspace</small>
      </div>
    </div>
    ${["Workspace","Company","Operations"].map(a=>on(a,ut.filter(n=>n.group===a&&dn(n,t)).map(n=>n.status==="planned"?cn(n.symbol,n.label):ln(e,d(n.id,{},t),n.symbol,n.label,un(n.id,t))))).join("")}
  `}function on(e,t){return`
    <section class="side-group">
      <div class="side-label">${s(e)}</div>
      <div class="side-items">${t.join("")}</div>
    </section>
  `}function ln(e,t,a,n,r=""){return`
    <a class="side-item ${vr(e,t)?"active":""}" href="${b(t)}" data-router>
      ${G(a)}
      <span>${s(n)}</span>
      ${r!==""?`<b>${s(String(r))}</b>`:""}
    </a>
  `}function cn(e,t){return`
    <button class="side-item planned" type="button" disabled aria-disabled="true">
      ${G(e)}
      <span>${s(t)}</span>
      <b>Planned</b>
    </button>
  `}function dn(e,t=p()){return e.status==="planned"?!0:!da(t)&&!["settings","users"].includes(e.id)?!1:la(e.permission||`${e.id}.view`,t)}function un(e,t=p()){return e==="jobs"?O(t).length:e==="tasks"?z(t).length:e==="files"?me(t).length:e==="forms"?oe(t).length:e==="crm"?bt(t).length:e==="finance"?be(t).length:e==="users"?se(t).length:e==="time"?gi(t).focus.length:e==="approvals"?vi(t).length:e==="clock"&&gt(t)?"On":""}function Gt(e,t){return`
    <nav class="tabbar compact-tabbar" aria-label="${s(e)}">
      ${t.map(([a,n,r])=>`<a class="${r?"active":""}" href="${b(a)}" data-router>${s(n)}</a>`).join("")}
    </nav>
  `}function oi(e){if(e.name==="command")return fn(p());if(e.name!=="company")return Ca(e.name);const t=e.companyId,a=ut.find(n=>n.id===e.section);if(a?.status!=="planned"){if(!da(t)&&!["settings","users"].includes(e.section))return pn(t);if(a?.permission&&!la(a.permission,t))return mn(t,a.permission)}return e.section==="jobs"?gn(e,t):e.section==="tasks"?$n(e,t):e.section==="files"?Dn(e,t):e.section==="users"?Ln(e,t):e.section==="settings"?Jn(e,t):e.section==="forms"?Yn(t):e.section==="analytics"?bn(e,t):e.section==="crm"?os(e,t):e.section==="finance"?cs(e,t):e.section==="team-chart"?Vn(t):e.section==="time"||e.section==="approvals"||e.section==="clock"?gs(e,t):Ca(e.section)}function pn(e){return`
    ${V("Subscription required","This company workspace needs an active or trialing subscription before paid modules can open.",`
      <a class="btn btn-primary" href="${b(d("settings",{tab:"billing"},e))}" data-router><i class="ti ti-credit-card"></i>Billing</a>
    `)}
    <section class="panel">
      ${N([["Company",j(e)],["Subscription",Di(e)],["Allowed area","Billing and settings remain available to owners/admins"]])}
    </section>
  `}function mn(e,t){return`
    ${V("Access denied","Your role does not include the permission required for this module.",`
      <a class="btn" href="${b(d("settings",{tab:"roles"},e))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${N([["Company",j(e)],["Required permission",t],["Your role",_t(e)]])}
    </section>
  `}function fn(e){const t=O(e),a=z(e),n=a.filter(o=>["critical","urgent"].includes(o.priority)),r=me(e);return`
    ${V("Company dashboard","Live context for this company workspace.",`
      <a class="btn" href="${b(d("files",{},e))}" data-router><i class="ti ti-folder"></i>Open drive</a>
      <a class="btn btn-primary" href="${b(d("jobs",{},e))}" data-router><i class="ti ti-briefcase"></i>Open jobs</a>
    `)}
    ${Wr([["Jobs",t.length],["Open tasks",a.filter(o=>o.status!=="done").length],["Urgent tasks",n.length],["Drive files",r.length]])}
    <section class="dashboard-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Priority work</h2><p>Tasks and jobs filtered by the active company.</p></div>
          <a class="btn" href="${b(d("tasks",{},e))}" data-router>Open tasks</a>
        </div>
        <div class="queue-list">
          ${a.slice(0,6).map(o=>Dt(o)).join("")||g("No tasks in this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Company scope</h2><p>Client-side filtering while auth is disabled.</p></div></div>
        ${N([["Company",j(e)],["Visible users",se(e).length],["Auth mode","Supabase auth"],["RLS status","Ready for enforcement"]])}
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Job queue</h2><p>Workspace records without leaving the Quest shell.</p></div></div>
        <div class="queue-list">
          ${t.slice(0,8).map(o=>Yr(o)).join("")||g("No jobs in this company yet.")}
        </div>
      </article>
    </section>
  `}function bn(e,t){const a=e.jobId?C(e.jobId):null,n=a?[a]:O(t),r=z(t).filter(f=>!a||f.project_id===a.id),o=me(t).filter(f=>!a||f.job_id===a.id),l=oe(t).filter(f=>!a||f.linked_job_id===a.id),c=r.filter(f=>f.status!=="done"),m=r.filter(f=>f.status!=="done"&&f.due&&new Date(f.due)<qt()),v=K(n,"estimate_total");return`
    <section class="analytics-workspace">
      <section class="analytics-toolbar panel">
        <div>
          <strong>Analytics</strong>
          <span>${s(a?a.name:j(t))}</span>
        </div>
        <label>
          <span>Job</span>
          <select data-analytics-job-filter>
            <option value="">All jobs</option>
            ${O(t).map(f=>`<option value="${s(f.id)}" ${a?.id===f.id?"selected":""}>${s(f.name)}</option>`).join("")}
          </select>
        </label>
        <a class="btn" href="${b(d("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      </section>
      <section class="analytics-grid">
        <article class="panel analytics-score">
          <span>Open work</span>
          <strong>${s(c.length)}</strong>
          <small>${s(m.length)} overdue / ${s(r.filter(f=>f.priority==="urgent"||f.priority==="critical").length)} urgent</small>
        </article>
        <article class="panel analytics-score">
          <span>Pipeline value</span>
          <strong>${s(_(v))}</strong>
          <small>${s(n.length)} visible job${n.length===1?"":"s"}</small>
        </article>
        <article class="panel analytics-score">
          <span>Drive and forms</span>
          <strong>${s(o.length+l.length)}</strong>
          <small>${s(o.length)} files / ${s(l.length)} forms</small>
        </article>
        <article class="panel analytics-score">
          <span>Completion</span>
          <strong>${s(Do(r.filter(f=>f.status==="done").length,r.length))}</strong>
          <small>${s(r.filter(f=>f.status==="done").length)} done of ${s(r.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${n.map(f=>`
              <a class="analytics-row" href="${b(d("analytics",{job_id:f.id},t))}" data-router>
                <span><strong>${s(f.name)}</strong><small>${s(f.client_name||j(t))}</small></span>
                <span>${s(f.stage)}</span>
                <span>${s(ht(f.id))}</span>
                <span>${s(nt(f.id))}</span>
                <span>${s(_(f.estimate_total))}</span>
              </a>
            `).join("")||g("No jobs to analyze yet.")}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${Le.map(f=>{const y=r.filter(L=>L.status===f).length;return`<div><span>${s(le(f))}</span><b><i style="width:${s(Vi(y,r.length))}%"></i></b><strong>${s(y)}</strong></div>`}).join("")}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${r.filter(f=>f.status!=="done").sort((f,y)=>De(y.priority)-De(f.priority)).slice(0,8).map(f=>Dt(f)).join("")||g("No open tasks in this scope.")}
          </div>
        </article>
      </section>
    </section>
  `}function gn(e,t){const a=yr(e.params.get("tab")),n=pe();return`
    ${V("Jobs","Company job records, clients, scope, and linked work.",`
      <a class="btn" href="${b(d("files",n?{job_id:n.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <section class="job-toolbar">
      <label>
        <span>Stage</span>
        <select data-stage-filter>
          ${["all"].concat(Pe).map(r=>`<option value="${s(r)}" ${i.stageFilter===r?"selected":""}>${s(r==="all"?"All stages":r)}</option>`).join("")}
        </select>
      </label>
      <div class="selected-job-chip">
        <span>Selected job</span>
        <strong>${n?s(n.name):"No job selected"}</strong>
      </div>
    </section>
    <nav class="tabbar" aria-label="Job sections">
      ${Ua.map(r=>`<a class="${r===a?"active":""}" href="${b(d("jobs",{tab:r,...n?{job_id:n.id}:{}},t))}" data-router>${s(_r(r))}</a>`).join("")}
    </nav>
    ${vn(a,t,n)}
  `}function vn(e,t,a){return e==="pipeline"?wa(t):e==="list"?yn(t):e==="profile"?_n(t,a):wa(t)}function wa(e){const t=bi(e);return`
    <section class="job-board">
      ${Pe.map(a=>{const n=t.filter(r=>r.stage===a);return`
          <article class="job-lane">
            <h2><span>${s(a)}</span><b>${n.length}</b></h2>
            ${n.map(r=>Kr(r)).join("")||'<div class="lane-empty">No jobs</div>'}
          </article>
        `}).join("")}
    </section>
  `}function yn(e){const t=bi(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Job list</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Tasks</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===i.selectedJobId?"active":""}" type="button" data-select-job="${s(a.id)}">
            <span><strong>${s(a.name)}</strong><small>${s(a.client_name||"No client")} - ${s(a.site_address||"No address")}</small></span>
            <span>${s(a.stage)}</span>
            <span>${ba(a.priority)}</span>
            <span>${s(a.owner_name||"Unassigned")}</span>
            <span>${s(ht(a.id))}</span>
            <span>${_(a.estimate_total)}</span>
          </button>
        `).join("")||g("No jobs match this view.")}
      </div>
    </section>
  `}function _n(e,t){return t?`
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${s(j(e))} - ${s(t.job_type)}</span>
          <h2>${s(t.name)}</h2>
          <p>${s(t.scope||"No scope written yet.")}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${N([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",_(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${b(d("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${s(t.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${We(d("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${ht(t.id)} linked tasks`)}
          ${We(d("files",{job_id:t.id},e),"ti-folder","Files",`${nt(t.id)} files`)}
          ${We(d("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${We(d("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:g("Create a job to see the profile workspace.")}function hn(e,t){const a=t||Pr(e);return`
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${s(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${w("Workspace name","name",a.name,!0)}
      ${R("Company","company_id",e,ji().map(n=>[n.id,yt(n)]))}
      ${w("Client","client_name",a.client_name)}
      ${w("Contact","contact_name",a.contact_name)}
      ${w("Account owner","owner_name",a.owner_name)}
      ${w("Job type","job_type",a.job_type||"Roofing")}
      ${R("Business status","stage",a.stage||"Lead",Pe.map(n=>[n,n]))}
      ${R("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(n=>[n,n]))}
      ${w("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${w("Invoice total","invoice_total",a.invoice_total||0,!1,"number")}
      ${w("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${ie("Scope","scope",a.scope,"span-2")}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${s(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function $n(e,t){const a=e.jobId?C(e.jobId):null,n=Tr(t,a?.id);return`
    ${V(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${b(d("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${b(d("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${wn(t,a)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${i.taskView==="board"?kn(t,n):Sn(t,n)}
      </article>
    </section>
  `}function wn(e,t){return`
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${O(e).map(n=>`<option value="${s(n.id)}" ${t?.id===n.id?"selected":""}>${s(n.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${["all"].concat(Le).map(n=>`<option value="${s(n)}" ${i.taskStatusFilter===n?"selected":""}>${s(n==="all"?"All statuses":le(n))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(Xe).map(n=>`<option value="${s(n)}" ${i.taskPriorityFilter===n?"selected":""}>${s(n==="all"?"All priorities":A(n))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${i.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${i.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function Sn(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===i.selectedTaskId?"active":""}" type="button" data-select-task="${s(a.id)}">
          <span><strong>${s(a.title)}</strong><small>${s(a.description||He(a.type))}</small></span>
          <span>${s(C(a.project_id)?.name||"Company task")}</span>
          <span>${s(B(a.assignee_id))}</span>
          <span>${Fi(a.priority)}</span>
          <span>${Ai(a.status)}</span>
          <span>${M(a.due)}</span>
        </button>
      `).join("")||g("No tasks match this workspace view.")}
    </div>
  `}function kn(e,t){return`
    <div class="task-board">
      ${Le.map(a=>{const n=t.filter(r=>r.status===a);return`
          <section class="task-column">
            <h2><span>${s(le(a))}</span><b>${n.length}</b></h2>
            ${n.map(r=>`
              <button class="task-card priority-${s(r.priority)}" type="button" data-select-task="${s(r.id)}">
                <strong>${s(r.title)}</strong>
                <span>${s(C(r.project_id)?.name||j(e))}</span>
                <small>${s(B(r.assignee_id))} - ${M(r.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function jn(e,t){return t?`
    <div class="section-head">
      <div><h2>${s(t.title)}</h2><p>${s(C(t.project_id)?.name||j(e))}</p></div>
      <a class="btn" href="${b(d("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${N([["Status",le(t.status)],["Priority",A(t.priority)],["Type",He(t.type)],["Assignee",B(t.assignee_id)],["Due",M(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${s(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${g("No task selected.")}
    `}function Sa(e,t,a){const n=a||Lr(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${s(a?n.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${w("Task title","title",n.title,!0)}
      ${R("Job","project_id",n.project_id||"",[["","Company-level task"]].concat(O(e).map(r=>[r.id,r.name])))}
      ${R("Status","status",n.status,Le.map(r=>[r,le(r)]))}
      ${R("Priority","priority",n.priority,Xe.map(r=>[r,A(r)]))}
      ${R("Type","type",n.type,Qa.map(r=>[r,He(r)]))}
      ${R("Assignee","assignee_id",n.assignee_id,se(e).map(r=>[r.id,B(r.id)]))}
      ${w("Due date","due",n.due||S(1),!0,"date")}
      ${ie("Description","description",n.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${s(a.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function Dn(e,t){const a=e.params.get("folder")||i.driveFolder||"home";i.driveFolder=a;const n=e.jobId?C(e.jobId):null,r=to(t,a,n?.id||"");return`
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${s(n?n.name:"Company Drive")}</strong>
              <small>${s(n?`${n.client_name||j(t)} file workspace`:`${j(t)} file manager`)}</small>
            </div>
          </div>
          <label class="drive-search">
            <i class="ti ti-search"></i>
            <input data-file-search value="${s(i.fileQuery)}" placeholder="Search drive" />
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
                <a href="${b(d("files",{},t))}" data-router>${s(j(t))}</a>
                ${a!=="home"?eo(t,a,n):""}
                ${n?`<span>/</span><strong>${s(n.name)}</strong>`:""}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${i.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${i.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${Cn(t,a,n,r)}
          </div>
        </div>
      </section>
    </section>
  `}function Cn(e,t,a,n){const r=Zr(e,t,a),o=r.map(c=>({kind:"folder",...c})).concat(n.map(c=>({kind:"file",file:c}))),l=a?a.name:t==="home"?"This folder":ee(t);return`
    <section class="drive-section-title">
      <div><h3>${s(l)}</h3><span>${r.length} folder${r.length===1?"":"s"} / ${n.length} file${n.length===1?"":"s"}</span></div>
    </section>
    ${i.driveView==="list"?qn(o):In(o)}
  `}function qn(e){return`
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${e.map(t=>t.kind==="folder"?An(t):Mn(t.file)).join("")||g("This folder is empty.")}
    </div>
  `}function In(e){return`
    <section class="drive-folder-grid explorer-grid">
      ${e.map(t=>t.kind==="folder"?Fn(t):Tn(t.file)).join("")||g("This folder is empty.")}
    </section>
  `}function Fn(e){return`
    <a class="drive-folder-card explorer-folder" href="${s(e.href)}" data-router>
      <span class="drive-folder-icon"><i class="ti ${s(e.icon||"ti-folder")}"></i></span>
      <strong>${s(e.name)}</strong>
      <em>${s(e.countLabel||"0 items")}</em>
    </a>
  `}function An(e){return`
    <a class="explorer-row folder-row-live" href="${s(e.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder"><i class="ti ${s(e.icon||"ti-folder")}"></i></span><strong>${s(e.name)}</strong></span>
      <span>${s(e.updatedLabel||"")}</span>
      <span>Folder</span>
      <span>${s(e.countLabel||"")}</span>
    </a>
  `}function Mn(e){return`
    <button type="button" class="explorer-row ${e.id===i.selectedFileId?"active":""}" data-action="select-file" data-file-id="${s(e.id)}" role="row">
      <span class="explorer-name">${xn(e)}<strong>${s(e.file_name)}</strong></span>
      <span>${M(e.updated_at||e.created_at)}</span>
      <span>${s(ve(e))}</span>
      <span>${ya(e.size_bytes)}</span>
    </button>
  `}function xn(e){return`
    <span class="file-type ${s(ga(e))}">
      <i class="ti ${s(Ui(e))}"></i>
      <small>${s(ao(e))}</small>
    </span>
  `}function Tn(e){return`
    <button type="button" class="file-card-live ${e.id===i.selectedFileId?"active":""}" data-action="select-file" data-file-id="${s(e.id)}">
      <span class="file-thumb">${va(e)}</span>
      <strong>${s(e.file_name)}</strong>
      <span>${s(ve(e))} / ${ya(e.size_bytes)}</span>
    </button>
  `}function En(e,t){return`
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${On(e)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${va(e)}
          <div>
            <strong>${s(e.file_name)}</strong>
            <span>${s(ve(e))} / ${ya(e.size_bytes)}</span>
          </div>
        </div>
        <div class="file-detail-list">
          ${de("Location",ee(e.folder))}
          ${de("Job",C(e.job_id)?.name||"Company shared")}
          ${de("Uploaded by",e.uploaded_by_label||"Quest HQ")}
          ${de("Modified",M(e.updated_at||e.created_at))}
          ${de("Storage",e.object_path||"Metadata only")}
        </div>
        <div class="file-detail-actions">
          <button class="btn" type="button" data-action="download-file" data-file-id="${s(e.id)}"><i class="ti ti-download"></i>Download</button>
          <button class="btn danger" type="button" data-action="delete-file" data-file-id="${s(e.id)}"><i class="ti ti-trash"></i>Delete</button>
        </div>
      </aside>
    </section>
  `}function On(e){const t=ga(e);return e.signed_url&&t==="image"?`<img class="file-preview-media" src="${s(e.signed_url)}" alt="" />`:e.signed_url&&t==="pdf"?`<iframe class="file-preview-frame" src="${s(e.signed_url)}" title="${s(e.file_name)}"></iframe>`:e.signed_url&&t==="text"?`<iframe class="file-preview-frame text" src="${s(e.signed_url)}" title="${s(e.file_name)}"></iframe>`:["doc","sheet"].includes(t)&&e.signed_url?`<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(e.signed_url)}" title="${s(e.file_name)}"></iframe>`:`
    <div class="file-preview-empty">
      ${va(e,!0)}
      <strong>${s(ve(e))} preview</strong>
      <p>${s(e.object_path?"Preview will load when a signed file URL is available.":"This is a metadata-only file record. Upload the actual file object to preview it here.")}</p>
      ${e.notes?`<pre>${s(e.notes)}</pre>`:""}
    </div>
  `}function Rn(){const e=p(),t=i.route||ft(),a=t.params.get("folder")||i.driveFolder||"home",n=t.jobId?C(t.jobId):null;return I("Drive","New folder",`
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${s(e)}" />
      <input type="hidden" name="parent_key" value="${s(xi(a,n))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${s(a==="home"?j(e):n?.name||ee(a))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"task-modal")}function Pn(){const e=p(),t=i.route?.params?.get("folder")||(i.driveFolder==="home"?"shared":i.driveFolder),a=i.route?.jobId||"";return`
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">${s(j(e))} Drive</div><h2 id="upload-title">Upload files</h2></div>
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
          ${w("Metadata-only file name","file_name","")}
          ${R("Folder","folder",t,So(e))}
          ${R("Job","job_id",a,[["","Company shared file"]].concat(O(e).map(n=>[n.id,n.name])))}
          ${R("Category","category",ee(t),zi.filter(n=>n!=="All categories").map(n=>[n,n]))}
          ${w("Uploaded by","uploaded_by_label",D().profile.full_name||"Quest HQ")}
          ${ie("Notes","notes","","span-2")}
          <div class="form-actions span-2">
            <button class="btn btn-primary" type="submit">Upload to drive</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
            <button class="btn" type="reset">Clear</button>
          </div>
          <div class="file-upload-log span-2">
            <strong>Upload target</strong>
            <span>${s(e)}/${s(a?`jobs/${a}`:t)}</span>
          </div>
        </form>
      </div>
    </div>
  `}function Ln(e,t){const a=jr(t),n=["members","access"].includes(e.params.get("tab"))?e.params.get("tab"):"members",r=i.joinRequests.filter(l=>l.company_id===t&&l.status==="pending"),o=la("users.manage",t);return`
    ${V("Users","Company members, roles, workers, and access context.",`
      <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite user</button>
      <a class="btn" href="${b(d("settings",{tab:"roles"},t))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      <a class="btn" href="${b(d("settings",{tab:"access"},t))}" data-router><i class="ti ti-settings"></i>Access settings</a>
    `)}
    ${Gt("Users sections",[[d("users",{tab:"members"},t),"Members",n==="members"],[d("users",{tab:"access"},t),"Access",n==="access"]])}
    ${n==="members"?`
      <section class="metric-grid operations-metrics">
        ${$("Active users",a.filter(l=>l.status==="active").length)}
        ${$("Pending",a.filter(l=>l.status!=="active").length+r.length)}
        ${$("Roles",fe(t).length)}
      </section>
      <section class="users-grid">
        ${a.map(l=>`
          <article class="user-card ${l.status!=="active"?"muted":""}">
            ${Be({full_name:et(l),email:l.email,avatar_url:l.avatar_url},"avatar")}
            <div>
              <strong>${s(et(l))}</strong>
              <span>${s(li(l))}</span>
              <small>${s(l.role_label)} / ${s(A(l.status))}</small>
            </div>
          </article>
        `).join("")||g("No users assigned to this company yet.")}
      </section>
    `:`
    <section class="dashboard-grid compact-settings-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Member access</h2><p>Assign roles and confirm each user's company status.</p></div>
        </div>
        <div class="access-user-list">
          ${a.map(l=>Nn(t,l,o)).join("")||g("No users assigned to this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head">
          <div><h2>Invites</h2><p>Copy a secure invite link for a specific email address.</p></div>
          <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite</button>
        </div>
        <div class="access-invite-list">
          ${Dr(t).map(l=>Qn(l,o)).join("")||g("No pending invites.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
        <div class="access-request-list">
          ${r.map(l=>Un(l,o)).join("")||g("No pending join requests.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
        ${N([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Supabase Auth + RLS"],["Your role",_t(t)],["Can manage users",o?"Yes":"No"]])}
      </article>
    </section>
    `}
  `}function Nn(e,t,a){const n=fe(e),r=t.role_id||Tt(e,t.role)||n[0]?.id||"";return`
    <article class="access-user-row">
      ${Be({full_name:et(t),email:t.email,avatar_url:t.avatar_url},"avatar")}
      <div class="access-user-main">
        <strong>${s(et(t))}</strong>
        <span>${s(li(t))} / ${s(A(t.status))}</span>
      </div>
      <form class="access-role-form" data-user-role-form>
        <input type="hidden" name="company_id" value="${s(e)}" />
        <input type="hidden" name="profile_id" value="${s(t.profile_id)}" />
        <select name="role_id" ${a&&t.profile_id?"":"disabled"}>
          ${n.map(o=>`<option value="${s(o.id)}" ${o.id===r?"selected":""}>${s(o.name)}</option>`).join("")}
        </select>
        <select name="membership_status" ${a&&t.profile_id?"":"disabled"}>
          ${["active","pending","disabled"].map(o=>`<option value="${s(o)}" ${o===t.status?"selected":""}>${s(A(o))}</option>`).join("")}
        </select>
        <button class="btn" type="submit" ${a&&t.profile_id?"":"disabled"}>Save</button>
      </form>
    </article>
  `}function Un(e,t){const a=e.requested_email||fi(e.profile_id)?.email||e.profile_id||"Requester";return`
    <article class="access-request-row">
      <div>
        <strong>${s(a)}</strong>
        <span>${s(e.message||"Access request")} / ${M(e.created_at)}</span>
      </div>
      <div>
        <button class="btn btn-primary" type="button" data-action="approve-join-request" data-request-id="${s(e.id)}" ${t?"":"disabled"}>Approve</button>
        <button class="btn danger" type="button" data-action="reject-join-request" data-request-id="${s(e.id)}" ${t?"":"disabled"}>Reject</button>
      </div>
    </article>
  `}function Qn(e,t){const a=aa(e.company_id,e.role_id),n=e.expires_at&&Date.parse(e.expires_at)<Date.now();return`
    <article class="access-invite-row ${n?"muted":""}">
      <div>
        <strong>${s(e.email)}</strong>
        <span>${s(a?.name||"Member")} / ${n?"Expired":`Expires ${M(e.expires_at)}`}</span>
      </div>
      <div>
        <button class="btn" type="button" data-action="copy-invite-link" data-invite-id="${s(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-link"></i>Copy link</button>
        <button class="btn danger" type="button" data-action="revoke-invite" data-invite-id="${s(e.id)}" ${t?"":"disabled"}>Revoke</button>
      </div>
    </article>
  `}function et(e){const t=String(e.name||"").trim(),a=String(e.email||"").trim();if(t&&!Pt(t))return t;if(a&&!Pt(a))return a.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,r=>r.toUpperCase());const n=String(e.role||"").toLowerCase();return n==="owner"?"Workspace owner":n==="admin"?"Workspace admin":n==="developer"?"Developer":`${e.role_label||"Workspace"} user`}function li(e){const t=String(e.email||"").trim();if(t&&!Pt(t))return t;const a=String(e.profile_id||e.member_id||"").trim();return a?`ID ${Co(a)}`:"No email on profile"}function Vn(e){const t=se(e),a=t.filter(n=>!n.supervisor_id||!t.some(r=>r.id===n.supervisor_id));return`
    <section class="tool-page team-chart-page">
      ${V("Team chart","Reporting lines, roles, and company coverage for this workspace.",`
        <a class="btn" href="${b(d("users",{},e))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${b(d("settings",{tab:"team"},e))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${$("Members",t.length)}
        ${$("Leads",a.length)}
        ${$("Open tasks",z(e).filter(ia).length)}
        ${$("Active timer",gt(e)?"Yes":"No")}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${a.map(n=>ci(e,n,t)).join("")||g("No workers assigned.")}
        </div>
      </section>
    </section>
  `}function ci(e,t,a,n=0){const r=a.filter(o=>o.supervisor_id===t.id);return`
    <article class="team-node" style="--depth:${n}">
      <div class="team-node-card">
        ${Be({full_name:t.full_name,avatar_url:t.avatar_url},"avatar")}
        <span><strong>${s(t.full_name)}</strong><small>${s(at(e,t.id))}</small></span>
        <b>${z(e).filter(o=>o.assignee_id===t.id&&ia(o)).length} open</b>
      </div>
      ${r.length?`<div class="team-node-children">${r.map(o=>ci(e,o,a,n+1)).join("")}</div>`:""}
    </article>
  `}function Jn(e,t){const a=vt(t),n=["company","billing","roles","access","team"].includes(e.params.get("tab"))?e.params.get("tab"):"company";return`
    ${V("Settings","Company settings, roles, approvals, and admin controls.","")}
    ${Gt("Settings sections",[[d("settings",{tab:"company"},t),"Company",n==="company"],[d("settings",{tab:"billing"},t),"Billing",n==="billing"],[d("settings",{tab:"roles"},t),"Roles",n==="roles"],[d("settings",{tab:"access"},t),"Access",n==="access"],[d("settings",{tab:"team"},t),"Workers",n==="team"]])}
    <section class="dashboard-grid compact-settings-grid">
      ${n==="company"?`
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${N([["Name",j(t)],["Company ID",t],["Color",a?.color||re(t)],["Visible jobs",O(t).length]])}
      </article>
      `:""}
      ${n==="billing"?Bn(t):""}
      ${n==="roles"?Hn(t):""}
      ${n==="access"?`
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${N([["Auth switch","Enabled"],["Local login","Disabled"],["Isolation","Server-enforced when migration is applied"],["Memberships",String(i.memberships.filter(r=>r.company_id===t).length)],["Invites",String(i.companyInvites.filter(r=>r.company_id===t&&r.status==="pending").length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${i.joinRequests.filter(r=>r.company_id===t).map(r=>$e(r.requested_email||r.profile_id,r.message||"Access request",A(r.status),r.created_at)).join("")||g("No pending company approvals.")}
        </div>
      </article>
      `:""}
      ${n==="team"?`
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${se(t).map(r=>`<div><strong>${s(r.full_name)}</strong><span>${s(at(t,r.id))}</span></div>`).join("")||g("No workers assigned.")}
        </div>
      </article>
      `:""}
    </section>
  `}function Bn(e){const t=ca(e);return`
    <article class="panel">
      <div class="section-head">
        <div><h2>Subscription</h2><p>$300/month company workspace billing gate.</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout"><i class="ti ti-credit-card"></i>Start subscription</button>
      </div>
      ${N([["Plan","$300/month company workspace"],["Status",Di(e)],["Stripe customer",t?.stripe_customer_id||"Not connected"],["Renewal / trial",t?.current_period_end||t?.trial_ends_at?M(t.current_period_end||t.trial_ends_at):"Pending"]])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules remain available only for trialing, active, past_due, or grace status.</p></div></div>
      ${N([["Workspace access",da(e)?"Allowed":"Suspended"],["Finance/files privacy","Requires Auth + RLS"],["Seat billing","Tracked later; not charged in v1"]])}
    </article>
  `}function Hn(e){return`
    <article class="panel span-2">
      <div class="section-head">
        <div><h2>Custom roles</h2><p>Discord-style roles for module, action, record, and field permissions.</p></div>
        <button class="btn btn-primary" type="button" data-action="open-role-form"><i class="ti ti-plus"></i>New role</button>
      </div>
      <div class="roles-list">
        ${fe(e).map(a=>{const n=i.rolePermissions.filter(o=>o.role_id===a.id&&o.effect==="allow").length,r=i.roleAssignments.filter(o=>o.company_id===e&&o.role_id===a.id).length;return`
            <article class="role-row" style="--role-color:${s(a.color)}">
              <span></span>
              <div><strong>${s(a.name)}</strong><small>${n||"All"} permissions / ${r} users / priority ${a.priority}</small></div>
              <b>${a.is_system?"System":"Custom"}</b>
            </article>
          `}).join("")||g("No custom roles yet.")}
      </div>
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${i.fieldPermissions.filter(a=>a.company_id===e).map(a=>$e(a.field_key,a.resource_type,a.visibility,"")).join("")||g("No field permission overrides yet.")}
      </div>
    </article>
  `}function zn(e){return I("Settings","New role",`
    <form class="role-form" data-role-form>
      ${w("Role name","name","")}
      ${w("Color","color","#f0b23b",!1,"color")}
      ${w("Priority","priority","100",!1,"number")}
      <div class="permission-grid span-2">
        ${Bi.map(([t,a])=>`
          <label><input type="checkbox" name="permissions" value="${s(t)}" /> <span>${s(a)}</span></label>
        `).join("")}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Wn(e){const t=fe(e).filter(n=>n.name.toLowerCase()!=="owner"),a=[["","Member"]].concat(t.map(n=>[n.id,n.name]));return I("Users","Invite user",`
    <form class="role-form" data-invite-form>
      <input type="hidden" name="company_id" value="${s(e)}" />
      ${w("Email","email","",!0,"email")}
      ${R("Role","role_id",Cr(e),a)}
      <div class="form-message span-2">Quest creates a link you can copy. Email delivery comes after the Resend/SMTP setup.</div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create invite</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Yn(e){const t=io(e),a=Ee(e),n=i.formsTab==="builder"&&a?"builder":i.formsTab==="responses"?"responses":"library";return`
    <section class="tool-page forms-center">
      <div class="forms-command panel">
        <span class="sync-pill live"><i class="ti ti-device-floppy"></i>Local autosafe</span>
        <label>
          <span>Search</span>
          <input data-form-search value="${s(i.formQuery)}" placeholder="Find form, audience, or job" />
        </label>
        <button class="btn" type="button" data-action="open-forms-tools"><i class="ti ti-adjustments"></i>Tools</button>
        <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
      </div>
      ${n==="builder"?"":`
        <nav class="tabbar forms-tabs" aria-label="Forms workspace">
          ${["library","responses"].map(r=>`
            <button class="${n===r?"active":""}" type="button" data-action="set-forms-tab" data-tab="${s(r)}">${s(A(r))}</button>
          `).join("")}
        </nav>
      `}
      ${n==="library"?Kn(e,t,a):""}
      ${n==="builder"?Gn(e,a):""}
      ${n==="responses"?rs(e,a):""}
    </section>
  `}function Kn(e,t,a){return`
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${t.length} visible form${t.length===1?"":"s"} in ${s(j(e))}</span>
          </div>
        </div>
        <div class="forms-list forms-list-cards">
          ${t.map(n=>`
            <article class="form-card ${i.expandedFormIds.has(n.id)?"expanded":""} ${a?.id===n.id?"active":""}">
              <span class="form-card-top">
                <i class="ti ti-clipboard-list"></i>
              </span>
              <span class="form-card-main">
                <strong>${s(n.title)}</strong>
                <span>Created by ${s(no(n))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${s(n.id)}" aria-expanded="${i.expandedFormIds.has(n.id)?"true":"false"}">
                <i class="ti ${i.expandedFormIds.has(n.id)?"ti-chevron-up":"ti-chevron-down"}"></i>
                ${i.expandedFormIds.has(n.id)?"Less":"Details"}
              </button>
              <span class="form-card-meta">
                <small>${s(n.type)} / ${s(n.audience||"Internal")}</small>
                <small>${Oi(n)} questions</small>
                <em>${Ct(n.id).length} responses</em>
                <em>Updated ${M(n.updated_at)}</em>
                <em>${s(n.status)}</em>
              </span>
              ${i.expandedFormIds.has(n.id)?`
                <div class="form-card-detail">
                  <p>${s(n.description||"No description yet.")}</p>
                  <div class="form-actions">
                    <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${s(n.id)}"><i class="ti ti-pencil"></i>Open builder</button>
                    <button class="btn" type="button" data-action="open-form-preview" data-form-id="${s(n.id)}"><i class="ti ti-eye"></i>Preview</button>
                  </div>
                </div>
              `:""}
            </article>
          `).join("")||g("No forms match this company view.")}
        </div>
      </article>
    </section>
  `}function Gn(e,t){if(!t)return`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${g("Create a form or choose a template to open the builder.")}
      </section>
    `;const a=["questions","responses","settings"].includes(i.formEditorTab)?i.formEditorTab:"questions";return`
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${s(a)}">
      ${Zn(t,a)}
      ${a==="questions"?`
        ${Xn(e,t)}
        ${es(t)}
      `:""}
      ${a==="settings"?`
        <article class="panel form-settings-panel forms-settings-wide">
          ${ts(e,t)}
        </article>
      `:""}
      ${a==="responses"?as(e,t):""}
    </section>
  `}function Zn(e,t){const a=Ct(e.id);return`
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${s(e.title)}</strong>
        <span>${s(e.status)} / ${Oi(e)} questions / ${a.length} responses</span>
      </div>
      ${["questions","responses","settings"].map(n=>`
        <button class="${t===n?"active":""}" type="button" data-action="set-form-editor-tab" data-tab="${s(n)}">
          ${n==="questions"?'<i class="ti ti-list-details"></i>':n==="responses"?'<i class="ti ti-inbox"></i>':'<i class="ti ti-settings"></i>'}
          ${s(A(n))}
        </button>
      `).join("")}
      <button class="btn" type="button" data-action="open-form-preview" data-form-id="${s(e.id)}"><i class="ti ti-eye"></i>Preview</button>
      <button class="btn" type="button" data-action="open-form-actions" data-form-id="${s(e.id)}"><i class="ti ti-share"></i>Share</button>
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${s(e.id)}">Save</button>
    </div>
  `}function Xn(e,t){return`
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${s(t.theme_color||re(e))}"></div>
      ${Fe("Form title","title",t.title,!0)}
      ${Ri("Form description","description",t.description)}
      <div class="forms-simple-meta">
        <span>${s(t.status)}</span>
        <span>${s(t.type)}</span>
        <span>${s(t.audience||"Internal")}</span>
        <span>${s(C(t.linked_job_id)?.name||"Company level")}</span>
        <span>${s(j(e))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${s(t.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${s(t.id)}">Publish</button>
      </div>
    </article>
  `}function es(e){return`
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${Ue.map(([t,a])=>`<button type="button" data-action="add-question" data-question-type="${s(t)}" title="${s(a)}" aria-label="Add ${s(a)} question"><i class="ti ${s(so(t))}"></i></button>`).join("")}
        </div>
        <div class="question-list">
          ${e.questions.map((t,a)=>is(t,a)).join("")||g("Add the first question.")}
        </div>
      </div>
    </article>
  `}function ts(e,t){return`
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${Fe("Title","title",t.title,!0)}
      ${Ye("Status","status",t.status,Kt.map(a=>[a,a]))}
      ${Ri("Description","description",t.description)}
      ${Ye("Type","type",t.type,Ne.map(a=>[a,a]))}
      ${Fe("Audience","audience",t.audience)}
      ${Ye("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(O(e).map(a=>[a.id,a.name])))}
      ${Fe("Theme color","theme_color",t.theme_color||re(e),!1,"color")}
      ${Ye("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
      ${Fe("Submit button","submit_label",t.submit_label||"Submit")}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${s(t.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${s(t.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${s(t.id)}">Delete</button>
    </div>
  `}function as(e,t){const a=Ct(t.id),n=a[0]||null;return`
    <article class="panel response-list-panel forms-response-editor">
      <div class="section-head">
        <div><h2>Response inbox</h2><p>${a.length} captured response${a.length===1?"":"s"} for this form.</p></div>
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="questions"><i class="ti ti-list-details"></i>Questions</button>
      </div>
      <div class="response-list">
        ${a.map(r=>`
          <button type="button" class="response-card">
            <strong>${s(r.submitted_by||r.submitter_email||"Anonymous")}</strong>
            <span>${s(t.title)}</span>
            <small>${M(r.created_at)}</small>
          </button>
        `).join("")||g("No responses yet. Submit a preview response from the builder.")}
      </div>
    </article>
    <aside class="panel response-detail">
      ${n?Pi(n):g("No response selected.")}
    </aside>
  `}function is(e,t){const a=Ue.map(([n,r])=>`<option value="${s(n)}" ${e.type===n?"selected":""}>${s(r)}</option>`).join("");return`
    <article class="question-card ${i.selectedQuestionId===e.id?"active":""}" data-question-id="${s(e.id)}">
      <div class="question-card-head">
        <span>${t+1}</span>
        <select data-question-field="type">${a}</select>
        <div class="question-actions">
          <button type="button" data-action="move-question" data-direction="-1" data-question-id="${s(e.id)}"><i class="ti ti-arrow-up"></i></button>
          <button type="button" data-action="move-question" data-direction="1" data-question-id="${s(e.id)}"><i class="ti ti-arrow-down"></i></button>
          <button type="button" data-action="duplicate-question" data-question-id="${s(e.id)}"><i class="ti ti-copy"></i></button>
          <button type="button" data-action="delete-question" data-question-id="${s(e.id)}"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <label><span>Question</span><input data-question-field="label" value="${s(e.label)}" /></label>
      <label><span>Help text</span><input data-question-field="help" value="${s(e.help||"")}" /></label>
      <label class="check-row"><input type="checkbox" data-question-field="required" ${e.required?"checked":""} /> Required</label>
      ${Oe(e)?`
        <div class="question-options">
          ${(e.options||[]).map((n,r)=>`
            <label>
              <span>Option ${r+1}</span>
              <input data-question-option="${r}" value="${s(n)}" />
              <button type="button" data-action="remove-question-option" data-question-id="${s(e.id)}" data-option-index="${r}"><i class="ti ti-x"></i></button>
            </label>
          `).join("")}
          <button class="btn" type="button" data-action="add-question-option" data-question-id="${s(e.id)}"><i class="ti ti-plus"></i>Add option</button>
        </div>
      `:""}
    </article>
  `}function ns(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${s(t.id)}" style="--form-accent:${s(t.theme_color||re(e))}">
      <div class="designed-form-header">
        <span>${s(j(e))}</span>
        <h2>${s(t.title)}</h2>
        <p>${s(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>ss(a)).join("")||g("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${s(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function ss(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?X(e,`<textarea name="${s(t)}" rows="3" ${a}></textarea>`):e.type==="date"?X(e,`<input name="${s(t)}" type="date" ${a} />`):e.type==="file"?X(e,`<input name="${s(t)}" type="file" ${a} />`):e.type==="yesno"?X(e,`<select name="${s(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?X(e,`<input name="${s(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?X(e,`<select name="${s(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(n=>`<option>${s(n)}</option>`).join("")}</select>`):e.type==="checkbox"?X(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${s(t)}" type="checkbox" value="${s(n)}" /> ${s(n)}</label>`).join("")}</div>`):e.type==="multiple"?X(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${s(t)}" type="radio" value="${s(n)}" ${a} /> ${s(n)}</label>`).join("")}</div>`):X(e,`<input name="${s(t)}" ${a} />`)}function rs(e,t){const a=t?Ct(t.id):Ei(e),n=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(r=>`
            <button type="button" class="response-card">
              <strong>${s(ye(r.form_id)?.title||"Unknown form")}</strong>
              <span>${s(r.submitted_by||r.submitter_email||"Anonymous")}</span>
              <small>${M(r.created_at)}</small>
            </button>
          `).join("")||g("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${n?Pi(n):g("No response selected.")}
      </aside>
    </section>
  `}function os(e,t){const a=Fr(t),n=bt(t),r=z(t).filter(c=>c.status!=="done").length,o=K(O(t),"estimate_total"),l=Mr(t);return`
    <section class="tool-page crm-page">
      ${V("CRM","Customers, contacts, and follow-ups built from company jobs.",`
        <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add customer job</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${$("Accounts",n.length)}
        ${$("Open jobs",O(t).filter(c=>c.stage!=="Closed").length)}
        ${$("Open tasks",r)}
        ${$("Pipeline value",_(o))}
      </section>
      <section class="crm-toolbar panel">
        <label>
          <span>Search</span>
          <input data-crm-search value="${s(i.crmQuery)}" placeholder="Find customer, contact, job, or address" />
        </label>
        <label>
          <span>Stage</span>
          <select data-crm-stage-filter>
            ${["all"].concat(Pe).map(c=>`<option value="${s(c)}" ${i.crmStageFilter===c?"selected":""}>${s(c==="all"?"All stages":c)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Owner</span>
          <select data-crm-owner-filter>
            <option value="all" ${i.crmOwnerFilter==="all"?"selected":""}>All owners</option>
            ${l.map(c=>`<option value="${s(c)}" ${i.crmOwnerFilter===c?"selected":""}>${s(c)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="panel crm-list-panel">
        <div class="section-head">
          <div><h2>Customers</h2><p>${a.length} visible account${a.length===1?"":"s"} in ${s(j(t))}</p></div>
        </div>
        <div class="data-table crm-table">
          <div class="table-head"><span>Account</span><span>Contact</span><span>Stage</span><span>Owner</span><span>Jobs</span><span>Value</span><span>Updated</span></div>
          ${a.map(c=>`
            <a class="table-row crm-account-row" href="${b(d("crm",{account:c.key},t))}" data-router>
              <span><strong>${s(c.name)}</strong><small>${s(c.subtitle)}</small></span>
              <span>${s(c.primaryContact)}</span>
              <span>${s(c.stage)}</span>
              <span>${s(c.owner)}</span>
              <span>${s(c.jobs.length)}</span>
              <span>${_(c.estimateTotal)}</span>
              <span>${M(c.updatedAt)}</span>
            </a>
          `).join("")||g("No CRM accounts match this view. Add a customer job to start the list.")}
        </div>
      </section>
    </section>
  `}function ls(e,t){const a=Ar(e,t);if(!a)return I("CRM","Customer account",g("This customer is not visible in the current company view."));const n=a.latestJob,r=a.tasks.filter(o=>o.status!=="done");return I("CRM",a.name,`
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${s(a.name)}</h2>
            <p>${s(a.subtitle)}</p>
          </div>
          ${ba(a.priority)}
        </div>
        ${N([["Primary contact",a.primaryContact],["Owner",a.owner],["Current stage",a.stage],["Pipeline value",_(a.estimateTotal)],["Open tasks",String(r.length)],["Last updated",M(a.updatedAt)]])}
      </section>
      <section class="crm-rollup-grid">
        ${$("Jobs",a.jobs.length)}
        ${$("Files",a.fileCount)}
        ${$("Forms",a.formCount)}
        ${$("Tasks",a.tasks.length)}
      </section>
      <section class="crm-modal-actions">
        ${n?`<a class="btn btn-primary" href="${b(d("jobs",{tab:"profile",job_id:n.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
        ${n?`<a class="btn" href="${b(d("tasks",{job_id:n.id},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>`:""}
        ${n?`<a class="btn" href="${b(d("files",{job_id:n.id},e))}" data-router><i class="ti ti-folder"></i>Files</a>`:""}
        ${n?`<button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${s(n.id)}"><i class="ti ti-pencil"></i>Edit latest job</button>`:""}
        <button class="btn" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Linked jobs</h2><p>Customer workspaces connected to this account.</p></div></div>
        <div class="data-table crm-linked-jobs">
          <div class="table-head"><span>Job</span><span>Stage</span><span>Owner</span><span>Value</span></div>
          ${a.jobs.map(o=>`
            <a class="table-row" href="${b(d("jobs",{tab:"profile",job_id:o.id},e))}" data-router>
              <span><strong>${s(o.name)}</strong><small>${s(o.site_address||"No address")}</small></span>
              <span>${s(o.stage)}</span>
              <span>${s(o.owner_name||"Unassigned")}</span>
              <span>${_(o.estimate_total)}</span>
            </a>
          `).join("")||g("No linked jobs yet.")}
        </div>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Follow-ups</h2><p>Open tasks across linked jobs.</p></div></div>
        <div class="queue-list">
          ${r.slice(0,6).map(o=>Dt(o)).join("")||g("No open follow-ups for this customer.")}
        </div>
      </section>
    </div>
  `,"crm-modal")}function cs(e,t){const a=ki(t),n=be(t),r=hi(t).slice().sort(Re("received_at")).slice(0,5),o=na(t).slice().sort(Re("spent_at")).slice(0,5),l=sa(t).slice().sort((c,m)=>c.name.localeCompare(m.name)).slice(0,5);return`
    <section class="tool-page finance-page">
      ${V("Finance","Invoices, payments, expenses, vendors, and job-linked money in one company view.",`
        <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
        <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
        <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        <a class="btn" href="${b(d("finance",{report:"summary"},t))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
      `)}
      <section class="metric-grid finance-metrics">
        ${$("Estimated pipeline",_(a.pipeline))}
        ${$("Invoiced",_(a.invoiced))}
        ${$("Collected",_(a.collected))}
        ${$("Outstanding",_(a.outstanding))}
        ${$("Expenses",_(a.expenses))}
        ${$("Net position",_(a.net))}
      </section>
      <section class="panel finance-aging">
        <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
        <div class="finance-aging-grid">
          ${[["Current",a.aging.current],["1-30",a.aging.thirty],["31-60",a.aging.sixty],["61+",a.aging.overSixty]].map(([c,m])=>`<div><span>${s(c)}</span><strong>${_(m)}</strong></div>`).join("")}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${n.length} billing record${n.length===1?"":"s"} for ${s(j(t))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${n.map(c=>`
            <a class="table-row" href="${b(d("finance",{invoice:c.id},t))}" data-router>
              <span><strong>${s(c.invoice_number)}</strong><small>${s(c.client_name||C(c.job_id)?.client_name||"No client")}</small></span>
              <span>${Gr(Si(c))}</span>
              <span>${s(C(c.job_id)?.name||"Company level")}</span>
              <span>${M(c.due_date)}</span>
              <span>${_(c.total)}</span>
              <span>${_(oa(c.id))}</span>
              <span>${_(ae(c.id))}</span>
            </a>
          `).join("")||g("No invoices yet. Create one from a job or customer record.")}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${r.map(c=>$e(ge(c.invoice_id)?.invoice_number||"Payment",c.method,_(c.amount),c.received_at)).join("")||g("No payments recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${o.map(c=>$e(Et(c.vendor_id),c.category,_(c.amount),c.spent_at,d("finance",{expense:c.id},t))).join("")||g("No expenses recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${l.map(c=>$e(c.name,c.category,c.status,c.updated_at,d("finance",{vendor:c.id},t))).join("")||g("No vendors recorded.")}
          </div>
        </article>
      </section>
    </section>
  `}function ds(e,t){return e.params.get("invoice")?us(t,e.params.get("invoice")):e.params.get("expense")?ps(t,e.params.get("expense")):e.params.get("vendor")?ms(t,e.params.get("vendor")):e.params.get("report")==="summary"?fs(t):""}function us(e,t){const a=ge(t);if(!a||a.company_id!==e)return I("Finance","Invoice",g("Invoice not found."));const n=wi(a.id),r=C(a.job_id);return I("Finance",a.invoice_number,`
    <div class="finance-detail-modal">
      ${N([["Client",a.client_name||r?.client_name||"No client"],["Status",Si(a)],["Job",r?.name||"Company level"],["Issued",M(a.issue_date)],["Due",M(a.due_date)],["Total",_(a.total)],["Collected",_(oa(a.id))],["Balance",_(ae(a.id))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${s(a.id)}"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${s(a.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        ${r?`<a class="btn" href="${b(d("jobs",{tab:"profile",job_id:r.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${n.length} payment${n.length===1?"":"s"} applied.</p></div></div>
        <div class="finance-compact-list">
          ${n.map(o=>$e(o.reference||o.method,o.method,_(o.amount),o.received_at)).join("")||g("No payments yet.")}
        </div>
      </section>
      ${a.notes?`<p class="finance-note">${s(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function ps(e,t){const a=$i(t);if(!a||a.company_id!==e)return I("Finance","Expense",g("Expense not found."));const n=C(a.job_id);return I("Finance",`${Et(a.vendor_id)} expense`,`
    <div class="finance-detail-modal">
      ${N([["Vendor",Et(a.vendor_id)],["Category",a.category],["Status",a.status],["Job",n?.name||"Company level"],["Spent",M(a.spent_at)],["Amount",_(a.amount)]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${s(a.id)}"><i class="ti ti-pencil"></i>Edit expense</button>
        ${n?`<a class="btn" href="${b(d("files",{job_id:n.id},e))}" data-router><i class="ti ti-folder"></i>Job files</a>`:""}
      </div>
      ${a.notes?`<p class="finance-note">${s(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function ms(e,t){const a=ra(t);if(!a||a.company_id!==e)return I("Finance","Vendor",g("Vendor not found."));const n=na(e).filter(r=>r.vendor_id===a.id);return I("Finance",a.name,`
    <div class="finance-detail-modal">
      ${N([["Contact",a.contact_name||"No contact"],["Email",a.email||"No email"],["Phone",a.phone||"No phone"],["Category",a.category],["Status",a.status],["Spend",_(K(n,"amount"))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${s(a.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
        <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${s(a.id)}"><i class="ti ti-receipt"></i>Add expense</button>
      </div>
      ${a.notes?`<p class="finance-note">${s(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function fs(e){const t=ki(e);return I("Finance","Summary report",`
    <div class="finance-report-modal">
      ${N([["Company",j(e)],["Estimated pipeline",_(t.pipeline)],["Invoiced",_(t.invoiced)],["Collected",_(t.collected)],["Outstanding",_(t.outstanding)],["Expenses",_(t.expenses)],["Net position",_(t.net)]])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${_(t.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${_(t.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${_(t.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${_(t.aging.overSixty)}</strong></div>
      </div>
    </div>
  `,"finance-modal")}function ka(e,t=null){const a=t||Nr(e);return I("Finance",t?"Edit invoice":"New invoice",`
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${s(a.id)}" />
      ${w("Invoice number","invoice_number",a.invoice_number,!0)}
      ${R("Linked job","job_id",a.job_id||"",[["","Company level"]].concat(O(e).map(n=>[n.id,n.name])))}
      ${w("Client","client_name",a.client_name,!0)}
      ${R("Status","status",a.status,Va.map(n=>[n,n]))}
      ${w("Issue date","issue_date",a.issue_date,!1,"date")}
      ${w("Due date","due_date",a.due_date,!1,"date")}
      ${w("Subtotal","subtotal",a.subtotal,!1,"number")}
      ${w("Tax","tax",a.tax,!1,"number")}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function bs(e,t=""){const a=Ur(e,t),n=be(e).map(r=>[r.id,`${r.invoice_number} - ${r.client_name||C(r.job_id)?.client_name||"No client"}`]);return I("Finance","Record payment",`
    <form class="finance-form" data-finance-payment-form>
      ${R("Invoice","invoice_id",a.invoice_id,n.length?n:[["","Create an invoice first"]])}
      ${w("Amount","amount",a.amount,!0,"number")}
      ${R("Method","method",a.method,Ha.map(r=>[r,r]))}
      ${w("Received","received_at",a.received_at,!1,"date")}
      ${w("Reference","reference",a.reference)}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function ja(e,t=null,a=""){const n=t||Qr(e,a),r=sa(e).map(o=>[o.id,o.name]);return I("Finance",t?"Edit expense":"Add expense",`
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${s(n.id)}" />
      ${R("Vendor","vendor_id",n.vendor_id,r.length?r:[["","No vendor yet"]])}
      ${R("Linked job","job_id",n.job_id||"",[["","Company level"]].concat(O(e).map(o=>[o.id,o.name])))}
      ${R("Category","category",n.category,pt.map(o=>[o,o]))}
      ${R("Status","status",n.status,Ja.map(o=>[o,o]))}
      ${w("Amount","amount",n.amount,!0,"number")}
      ${w("Spent date","spent_at",n.spent_at,!1,"date")}
      ${ie("Notes","notes",n.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Da(e,t=null){const a=t||Vr(e);return I("Finance",t?"Edit vendor":"Add vendor",`
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${s(a.id)}" />
      ${w("Vendor name","name",a.name,!0)}
      ${w("Contact","contact_name",a.contact_name)}
      ${w("Email","email",a.email,!1,"email")}
      ${w("Phone","phone",a.phone)}
      ${R("Category","category",a.category,pt.map(n=>[n,n]))}
      ${R("Status","status",a.status,Ba.map(n=>[n,n]))}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function gs(e,t){return e.section==="clock"?ys(t):e.section==="approvals"?_s(t):vs(t)}function Zt(e,t){return`
    ${Gt("Operations sections",[[d("time",{},e),"My time",t==="time"],[d("approvals",{},e),"Approvals",t==="approvals"],[d("clock",{},e),"Clock dashboard",t==="clock"]])}
  `}function vs(e){const t=gi(e),a=gt(e);return`
    <section class="tool-page operations-page">
      ${V("My time","A compact personal work queue built from this company's tasks.",`
        <a class="btn" href="${b(d("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Zt(e,"time")}
      <section class="metric-grid operations-metrics">
        ${$("Due today",t.dueToday.length)}
        ${$("Overdue",t.overdue.length)}
        ${$("Open work",t.open.length)}
        ${$("In review",t.review.length)}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel span-2">
          <div class="section-head"><div><h2>Today</h2><p>Due now, overdue, and highest priority work.</p></div></div>
          <div class="queue-list">
            ${t.focus.slice(0,8).map(n=>Dt(n)).join("")||g("No time-sensitive tasks for this company.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
          ${N([["Company",j(e)],["Assigned to you",String(t.assignedToMe.length)],["Due this week",String(t.thisWeek.length)],["Completed",String(t.done.length)]])}
        </article>
      <article class="panel span-2">
          <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
          <div class="data-table operations-table">
            <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
            ${t.thisWeek.slice(0,8).map(n=>`
              <a class="table-row" href="${b(d("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},e))}" data-router>
                <span><strong>${s(n.title)}</strong><small>${s(n.description||He(n.type))}</small></span>
                <span>${s(C(n.project_id)?.name||"Company task")}</span>
                <span>${s(B(n.assignee_id))}</span>
                <span>${M(n.due)}</span>
                <span>${Ai(n.status)}</span>
              </a>
            `).join("")||g("No upcoming tasks this week.")}
          </div>
        </article>
      </section>
    </section>
  `}function ys(e){const t=yi(e),a=gt(e),n=qt().getTime(),r=n-6*864e5,o=Ma(e,n)+(a?Date.now()-Date.parse(a.started_at):0),l=Ma(e,r)+(a?Date.now()-Date.parse(a.started_at):0);return`
    <section class="tool-page operations-page clock-page">
      ${V("Clock dashboard","Local basic-mode clock tracking for the active company.",`
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Zt(e,"clock")}
      <section class="metric-grid operations-metrics">
        ${$("Today",Ge(o))}
        ${$("Last 7 days",Ge(l))}
        ${$("Entries",t.length)}
        ${$("Status",a?"Clocked in":"Off clock")}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${a?N([["User",B(a.user_id)],["Started",Oa(a.started_at)],["Task",a.task_title||"General shift"],["Elapsed",Ge(Date.now()-Date.parse(a.started_at))]]):g("Nobody is clocked in on this device.")}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${t.slice(0,10).map(c=>`
              <div class="table-row">
                <span><strong>${s(c.task_title||"General shift")}</strong><small>${s(c.notes||"Clock entry")}</small></span>
                <span>${s(B(c.user_id))}</span>
                <span>${Oa(c.started_at)}</span>
                <span>${Ge(c.duration_ms)}</span>
              </div>
            `).join("")||g("No clock entries yet.")}
          </div>
        </article>
      </section>
    </section>
  `}function _s(e){const t=vi(e),a=t.filter(o=>o.type==="Form approval"),n=t.filter(o=>o.type==="Task review"),r=t.filter(o=>o.type==="Access request");return`
    <section class="tool-page operations-page">
      ${V("Approvals","Company review queue for forms, task handoffs, and access requests.",`
        <a class="btn" href="${b(d("forms",{},e))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${b(d("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${Zt(e,"approvals")}
      <section class="metric-grid operations-metrics">
        ${$("Open approvals",t.length)}
        ${$("Forms",a.length)}
        ${$("Task reviews",n.length)}
        ${$("Access",r.length)}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Approval queue</h2><p>One calm list instead of a heavy dashboard.</p></div></div>
        <div class="data-table approval-table">
          <div class="table-head"><span>Item</span><span>Type</span><span>Owner</span><span>Status</span><span>Updated</span></div>
          ${t.map(o=>`
            <a class="table-row" href="${b(o.href)}" data-router>
              <span><strong>${s(o.title)}</strong><small>${s(o.meta)}</small></span>
              <span>${s(o.type)}</span>
              <span>${s(o.owner)}</span>
              <span>${s(o.status)}</span>
              <span>${M(o.updatedAt)}</span>
            </a>
          `).join("")||g("No approvals need attention right now.")}
        </div>
      </section>
    </section>
  `}function Ca(e){return`
    ${V(A(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${g("Module data model pending.")}
    </section>
  `}function hs(){document.title="Sign in | Quest HQ";const e=ea(i.route.params.get("return_url")||b(d("jobs",{},F()))),t=String(i.route.params.get("invite")||"").trim();mt.innerHTML=`
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
        ${t?'<div class="invite-banner"><strong>Workspace invite</strong><span>Sign in or create an account with the invited email to join the company.</span></div>':""}
        ${`
          <div class="auth-mode-tabs">
            <button class="${i.authMode==="signin"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="signin">Sign in</button>
            <button class="${i.authMode==="register"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="register">${t?"Create account":"Create workspace"}</button>
            <button class="${i.authMode==="request"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="request">Request access</button>
          </div>
          ${ws(e)}
        `}
        ${$s(e)}
        
      </section>
    </main>
  `}function $s(e){return`
    <section class="demo-mode-box">
      <div>
        <strong>Demo mode</strong>
        <span>Local-only sample workspace. No Supabase database reads or writes.</span>
      </div>
      <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${s(e)}">Open demo mode</button>
    </section>
  `}function ws(e){const t=String(i.route?.params?.get("invite")||"").trim();return i.authMode==="register"?`
      <form data-auth-register-form>
        <label>Full name<input name="full_name" autocomplete="name" required /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required /></label>
        ${t?"":'<label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>'}
        <input type="hidden" name="invite_token" value="${s(t)}" />
        <input type="hidden" name="return_url" value="${s(e)}" />
        <button class="btn btn-primary full" type="submit">${t?"Create account and join":"Create secure workspace"}</button>
        ${Ft(t?"The invite email must match this account email.":"Owner role, trial subscription, and workspace isolation are created automatically.")}
      </form>
    `:i.authMode==="request"?`
      <form data-auth-request-form>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" required /></label>
        <label>Company ID<input name="company_id" placeholder="company-workspace-id" required /></label>
        <label>Message<input name="message" placeholder="Tell the admin why you need access" /></label>
        <input type="hidden" name="return_url" value="${s(e)}" />
        <button class="btn btn-primary full" type="submit">Request company access</button>
        ${Ft("Requests stay pending until a company Owner/Admin approves them.")}
      </form>
    `:`
    <form data-auth-sign-in-form>
      <label>Email<input name="email" type="email" autocomplete="email" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <input type="hidden" name="invite_token" value="${s(t)}" />
      <input type="hidden" name="return_url" value="${s(e)}" />
      <button class="btn btn-primary full" type="submit">Sign in</button>
      ${Ft("Use the company workspace account your Owner/Admin invited.")}
    </form>
  `}function Ft(e){return i.loginError?`<div class="form-message error">${s(i.loginError)}</div>`:`<div class="form-message">${s(i.authMessage||e)}</div>`}function Ss(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${Be(e,"avatar large")}
            <div><strong>${s(e.full_name)}</strong><span>${s(e.email)}</span></div>
          </div>
          <label>Display name<input name="full_name" value="${s(e.full_name)}" /></label>
          <label>Avatar URL<input name="avatar_url" value="${s(e.avatar_url||"")}" placeholder="https://..." /></label>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Save profile</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `}function ks(e,t){if(i.modal==="profile")return Ss(t.profile);if(i.modal==="file-upload")return Pn();if(i.modal==="folder-new")return Rn();if(i.modal==="file-detail")return Is(p());if(i.modal==="forms-tools")return Fs(p());if(i.modal==="form-actions")return Ts(p(),Ee(p()));if(i.modal==="form-new")return As(p());if(i.modal==="form-preview")return xs(p(),Ee(p()));if(i.modal==="job-new")return At(p(),null);if(i.modal==="job-edit")return At(p(),pe());if(i.modal==="finance-invoice-new")return ka(p(),null);if(i.modal==="finance-invoice-edit")return ka(p(),ge(i.selectedFinanceInvoiceId));if(i.modal==="finance-payment-new")return bs(p(),i.selectedFinanceInvoiceId);if(i.modal==="finance-expense-new")return ja(p(),null,i.selectedFinanceVendorId);if(i.modal==="finance-expense-edit")return ja(p(),$i(i.selectedFinanceExpenseId));if(i.modal==="finance-vendor-new")return Da(p(),null);if(i.modal==="finance-vendor-edit")return Da(p(),ra(i.selectedFinanceVendorId));if(i.modal==="role-new")return zn(p());if(i.modal==="invite-new")return Wn(p());if(e.name==="company"&&e.section==="crm"&&e.params.get("account"))return ls(e.companyId,e.params.get("account"));if(e.name==="company"&&e.section==="finance"){const a=ds(e,e.companyId);if(a)return a}return e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"?At(e.companyId,e.jobId?C(e.jobId):pe()):e.name==="company"&&e.section==="tasks"?qs(e,e.companyId):""}function js(){return i.toast?`
    <div class="app-toast ${s(i.toast.mode||"local")}" role="status" aria-live="polite">
      <strong>${s(i.toast.title||"Quest HQ")}</strong>
      <span>${s(i.toast.message||"")}</span>
    </div>
  `:""}function Ds(e,t="local",a="Not available yet"){i.toastTimer&&clearTimeout(i.toastTimer),i.toast={title:a,message:e,mode:t},u(),i.toastTimer=setTimeout(()=>{i.toast=null,i.toastTimer=null,u()},4200)}function I(e,t,a,n=""){return`
    <div class="modal-overlay">
      <div class="modal-panel ${s(n)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${s(e)}</div><h2>${s(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </div>
    </div>
  `}function Cs(e,t,a){return`
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${s(e)}</div><h2>${s(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </aside>
    </div>
  `}function At(e,t){return I("Jobs",t?"Edit job":"Create job",hn(e,t),"wide-modal")}function qs(e,t){const a=e.jobId?C(e.jobId):null,n=e.params.get("task_id")||"",r=n?ta(n):null;return e.params.get("new")==="1"?I("Tasks","New task",Sa(t,a,null),"task-modal"):e.params.get("edit")==="1"&&r?I("Tasks","Edit task",Sa(t,a,r),"task-modal"):r?Cs("Task detail",r.title,jn(t,r)):""}function Is(e){const t=i.selectedFileId?i.files.find(a=>a.id===i.selectedFileId):null;return t?I("Open file",t.file_name,En(t),"file-viewer-modal"):""}function Fs(e){return I("Forms","Tools",`
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${i.formTypeFilter==="all"?"selected":""}>All types</option>
          ${Ne.map(t=>`<option value="${s(t)}" ${i.formTypeFilter===t?"selected":""}>${s(t)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `)}function As(e){const t=i.formStartTab==="templates"?"templates":"blank",a=Ae(),n=t==="templates"&&(a.find(m=>m.id===i.formStartTemplateId)||a[0])||null,r=n?.title||"",o=n?.description||"",l=n?.type||"Internal",c=n?.questions||[{type:"short",label:"First question",required:!1,options:[]}];return I("Forms","New form builder",`
    <form class="new-form-modal builder-create-modal" data-new-form-form>
      <input type="hidden" name="template_id" value="${s(n?.id||"")}" />
      <div class="form-start-tabs" role="tablist" aria-label="New form start type">
        <button class="${t==="blank"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="blank"><i class="ti ti-clipboard-plus"></i>Blank</button>
        <button class="${t==="templates"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="templates"><i class="ti ti-template"></i>Templates</button>
      </div>
      ${t==="templates"?`
        <div class="new-form-template-grid">
          ${a.map(m=>`
            <button class="${n?.id===m.id?"active":""}" type="button" data-action="select-form-start-template" data-template-id="${s(m.id)}">
              <span><i class="ti ti-template"></i></span>
              <strong>${s(m.title)}</strong>
              <small>${s(m.type)} / ${m.questions.length} questions</small>
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
            <div class="gform-accent-strip" style="--form-accent:${s(re(e))}"></div>
            <label><span>Form title</span><input name="title" value="${s(r)}" placeholder="Untitled form" required /></label>
            <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${s(o)}</textarea></label>
          </article>
          <div class="new-form-question-list">
            ${c.map((m,v)=>Ms(m,v)).join("")}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${n?s(n.title):"Blank starter"}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${Ne.map(m=>`<option value="${s(m)}" ${m===l?"selected":""}>${s(m)}</option>`).join("")}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${O(e).map(m=>`<option value="${s(m.id)}" ${i.route?.jobId===m.id?"selected":""}>${s(m.name)}</option>`).join("")}</select></label>
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
  `,"form-create-modal builder-modal")}function Ms(e,t){const a=Oe(e)?`
    <div class="starter-options">
      ${(e.options||["Option 1","Option 2"]).map(n=>`<span>${s(n)}</span>`).join("")}
    </div>
  `:"";return`
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${t+1}</span>
        <strong>${s(ro(e.type))}</strong>
      </div>
      <label><span>Question</span><input value="${s(e.label||"Untitled question")}" readonly /></label>
      ${e.help?`<small>${s(e.help)}</small>`:""}
      ${a}
      <label class="check-row"><input type="checkbox" ${e.required?"checked":""} disabled /> Required</label>
    </article>
  `}function xs(e,t){return t?I("Forms","Preview form",`
    <div class="form-preview-modal-body">
      ${ns(e,t)}
    </div>
  `,"form-preview-modal"):I("Forms","Preview form",g("Choose a form first."))}function Ts(e,t){return t?I("Forms","Manage form",`
    <div class="forms-summary-share compact">
      <strong>Shareable preview URL</strong>
      <input readonly value="${s(`${window.location.origin}${b(d("forms",{form_id:t.id},e))}`)}" />
      <button class="btn" type="button" data-action="copy-form-link" data-form-id="${s(t.id)}">Copy link</button>
    </div>
    <div class="modal-action-grid">
      <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${s(t.id)}"><i class="ti ti-edit"></i>Edit builder</button>
      <button class="btn" type="button" data-action="duplicate-form" data-form-id="${s(t.id)}"><i class="ti ti-copy"></i>Duplicate</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${s(t.id)}"><i class="ti ti-world-upload"></i>Publish</button>
      <button class="btn" type="button" data-action="archive-form" data-form-id="${s(t.id)}"><i class="ti ti-archive"></i>Archive</button>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export library</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${s(t.id)}"><i class="ti ti-trash"></i>Delete</button>
    </div>
  `):I("Forms","Manage form",g("Choose a form first."))}function Es(e){const t=i.accountMenuOpen&&!e.target.closest(".account-menu");t&&(i.accountMenuOpen=!1);const a=e.target.closest("[data-action]");if(a){Os(e,a);return}const n=e.target.closest("[data-select-job]");if(n){e.preventDefault(),Sr(n.dataset.selectJob);return}const r=e.target.closest("[data-select-task]");if(r){e.preventDefault(),kr(r.dataset.selectTask);return}const o=e.target.closest("a[href][data-router]");if(!o){t&&u();return}o.target||o.hasAttribute("download")||(e.preventDefault(),k(o.getAttribute("href")))}function Os(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),i.dataLoaded=!1,i.sync={label:"Refreshing...",mode:"loading"},u();return}if(a==="sign-out"){e.preventDefault(),i.accountMenuOpen=!1,Ls();return}if(a==="toggle-account-menu"){e.preventDefault(),i.accountMenuOpen=!i.accountMenuOpen,u();return}if(a==="verify-email"){e.preventDefault(),i.accountMenuOpen=!1,Ds("Email verification is not implemented yet. Account access is not blocked right now.","local");return}if(a==="start-demo-mode"){e.preventDefault(),di(t.dataset.returnUrl||"");return}if(a==="set-auth-mode"){e.preventDefault(),i.authMode=["signin","register","request"].includes(t.dataset.authMode)?t.dataset.authMode:"signin",i.loginError="",i.authMessage="",u();return}if(a==="open-profile"){e.preventDefault(),i.accountMenuOpen=!1,i.modal="profile",u();return}if(a==="open-role-form"){e.preventDefault(),i.modal="role-new",u();return}if(a==="open-invite-form"){e.preventDefault(),i.modal="invite-new",u();return}if(a==="copy-invite-link"){e.preventDefault(),zs(t.dataset.inviteId);return}if(a==="revoke-invite"){e.preventDefault(),Ws(t.dataset.inviteId);return}if(a==="approve-join-request"){e.preventDefault(),qa(t.dataset.requestId,"approved");return}if(a==="reject-join-request"){e.preventDefault(),qa(t.dataset.requestId,"rejected");return}if(a==="start-checkout"){e.preventDefault(),Js();return}if(a==="open-file-upload"){e.preventDefault(),i.modal="file-upload",u();return}if(a==="open-folder-form"){e.preventDefault(),i.modal="folder-new",u();return}if(a==="open-job-form"){e.preventDefault();const n=t.dataset.jobId||"";n&&(i.selectedJobId=n),i.modal=t.dataset.mode==="edit"?"job-edit":"job-new",u();return}if(a==="open-forms-tools"){e.preventDefault(),i.modal="forms-tools",u();return}if(a==="open-form-actions"){e.preventDefault(),Ke(t.dataset.formId,!1),i.modal="form-actions",u();return}if(a==="open-form-preview"){e.preventDefault(),Ke(t.dataset.formId,!1),i.modal="form-preview",u();return}if(a==="set-form-start-tab"){e.preventDefault(),i.formStartTab=t.dataset.tab==="templates"?"templates":"blank",i.formStartTab==="blank"&&(i.formStartTemplateId=""),i.formStartTab==="templates"&&!i.formStartTemplateId&&(i.formStartTemplateId=Ae()[0]?.id||""),u();return}if(a==="select-form-start-template"){e.preventDefault(),i.formStartTab="templates",i.formStartTemplateId=t.dataset.templateId||Ae()[0]?.id||"",u();return}if(a==="close-modal"){e.preventDefault(),Rs();return}if(a==="set-task-view"){e.preventDefault(),i.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(La,i.taskView),u();return}if(a==="set-drive-view"){e.preventDefault(),i.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem(Na,i.driveView),u();return}if(a==="clock-in"){e.preventDefault(),xr(p(),t.dataset.taskId||i.route?.params?.get("task_id")||"");return}if(a==="clock-out"){e.preventDefault(),_i();return}if(a==="select-file"){e.preventDefault(),i.selectedFileId=t.dataset.fileId||"",i.modal="file-detail",u();return}if(a==="download-file"){e.preventDefault(),lr(t.dataset.fileId);return}if(a==="delete-file"){e.preventDefault(),cr(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),i.formsTab=t.dataset.tab==="responses"?"responses":"library",u();return}if(a==="set-form-editor-tab"){e.preventDefault(),i.formEditorTab=t.dataset.tab||"questions",u();return}if(a==="new-form"){e.preventDefault(),i.formStartTemplateId=t.dataset.templateId||"",i.formStartTab=t.dataset.startTab==="templates"||i.formStartTemplateId?"templates":"blank",i.formStartTab==="templates"&&!i.formStartTemplateId&&(i.formStartTemplateId=Ae()[0]?.id||""),i.modal="form-new",u();return}if(a==="select-form"){e.preventDefault(),Ke(t.dataset.formId);return}if(a==="toggle-form-card"){e.preventDefault();const n=t.dataset.formId||"";i.expandedFormIds.has(n)?i.expandedFormIds.delete(n):i.expandedFormIds.add(n),u();return}if(a==="edit-form"){e.preventDefault(),Ke(t.dataset.formId,!1),i.formsTab="builder",i.formEditorTab="questions",i.modal="",u();return}if(a==="save-form"){e.preventDefault(),J("Form saved locally"),u();return}if(a==="publish-form"){e.preventDefault(),Ea(t.dataset.formId,"Published");return}if(a==="archive-form"){e.preventDefault(),Ea(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){e.preventDefault(),uo(t.dataset.formId);return}if(a==="delete-form"){e.preventDefault(),po(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),mo(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),fo(p());return}if(a==="new-finance-invoice"){e.preventDefault(),i.selectedFinanceInvoiceId="",i.modal="finance-invoice-new",u();return}if(a==="edit-finance-invoice"){e.preventDefault(),i.selectedFinanceInvoiceId=t.dataset.invoiceId||"",i.modal="finance-invoice-edit",u();return}if(a==="new-finance-payment"){e.preventDefault(),i.selectedFinanceInvoiceId=t.dataset.invoiceId||i.route?.params?.get("invoice")||"",i.modal="finance-payment-new",u();return}if(a==="new-finance-expense"){e.preventDefault(),i.selectedFinanceExpenseId="",i.selectedFinanceVendorId=t.dataset.vendorId||"",i.modal="finance-expense-new",u();return}if(a==="edit-finance-expense"){e.preventDefault(),i.selectedFinanceExpenseId=t.dataset.expenseId||"",i.modal="finance-expense-edit",u();return}if(a==="new-finance-vendor"){e.preventDefault(),i.selectedFinanceVendorId="",i.modal="finance-vendor-new",u();return}if(a==="edit-finance-vendor"){e.preventDefault(),i.selectedFinanceVendorId=t.dataset.vendorId||"",i.modal="finance-vendor-edit",u();return}if(a==="add-question"){e.preventDefault(),bo(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){e.preventDefault(),go(t.dataset.questionId);return}if(a==="delete-question"){e.preventDefault(),vo(t.dataset.questionId);return}if(a==="move-question"){e.preventDefault(),yo(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){e.preventDefault(),_o(t.dataset.questionId);return}if(a==="remove-question-option"){e.preventDefault(),ho(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){e.preventDefault(),Xs(t.dataset.jobId);return}a==="delete-task"&&(e.preventDefault(),tr(t.dataset.taskId))}function Rs(){const e=i.route||ft();if(i.modal="",i.formStartTemplateId="",i.formStartTab="blank",i.selectedFinanceInvoiceId="",i.selectedFinanceExpenseId="",i.selectedFinanceVendorId="",e.name==="company"&&e.section==="tasks"&&(e.params.get("new")||e.params.get("edit")||e.params.get("task_id"))){k(d("tasks",e.jobId?{job_id:e.jobId}:{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"){const t=e.jobId?C(e.jobId):pe();k(d("jobs",{tab:t?"profile":"pipeline",...t?{job_id:t.id}:{}},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="crm"&&e.params.get("account")){k(d("crm",{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="finance"&&(e.params.get("invoice")||e.params.get("expense")||e.params.get("vendor")||e.params.get("report"))){k(d("finance",{},e.companyId),{replace:!0});return}u()}function Ps(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===we.localUsername&&String(t.password||"")===we.localPassword)){i.loginError="Invalid temporary credentials.",u();return}i.loginError="",di(t.return_url||b(d("jobs",{},F())));return}if(e.target.matches("[data-auth-sign-in-form]")){e.preventDefault(),Ns(e.target);return}if(e.target.matches("[data-auth-register-form]")){e.preventDefault(),Us(e.target);return}if(e.target.matches("[data-auth-request-form]")){e.preventDefault(),Vs(e.target);return}if(e.target.matches("[data-company-create-form]")){e.preventDefault(),Qs(e.target);return}if(e.target.matches("[data-profile-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries()),a={...D().profile,full_name:String(t.full_name||"").trim()||"Quest Basic Mode",avatar_url:String(t.avatar_url||"").trim()};x(Pa,a),i.profileDraft=a,i.session={...D(),profile:a},x(Se,i.session),i.modal="",u();return}if(e.target.matches("[data-job-form]")){e.preventDefault(),Zs(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),er(e.target);return}if(e.target.matches("[data-new-form-form]")){e.preventDefault(),co(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),ar(e.target);return}if(e.target.matches("[data-folder-form]")){e.preventDefault(),ir(e.target);return}if(e.target.matches("[data-finance-invoice-form]")){e.preventDefault(),nr(e.target);return}if(e.target.matches("[data-finance-payment-form]")){e.preventDefault(),sr(e.target);return}if(e.target.matches("[data-finance-expense-form]")){e.preventDefault(),rr(e.target);return}if(e.target.matches("[data-finance-vendor-form]")){e.preventDefault(),or(e.target);return}if(e.target.matches("[data-role-form]")){e.preventDefault(),Bs(e.target);return}if(e.target.matches("[data-invite-form]")){e.preventDefault(),Hs(e.target);return}if(e.target.matches("[data-user-role-form]")){e.preventDefault(),Ys(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),$o(e.target))}async function Ls(){if(i.session?.auth==="supabase"){const e=P();e?.auth&&await e.auth.signOut()}localStorage.removeItem(Se),i.session=null,i.dataLoaded=!1,k("/login",{replace:!0})}function di(e=""){i.loginError="",i.authMessage="",i.session=Rt(),ni(),i.activeCompanyId=p(),localStorage.setItem(ne,i.activeCompanyId),x(Se,i.session),i.dataLoaded=!1,i.dataLoading=!1,k(ea(e||b(d("jobs",{},p()))),{replace:!0})}async function Ns(e){const t=Object.fromEntries(new FormData(e).entries()),a=P();if(!a?.auth){i.loginError="Supabase auth is unavailable.",u();return}i.loginError="",i.authMessage="Signing in...",u();const n=await a.auth.signInWithPassword({email:String(t.email||"").trim(),password:String(t.password||"")});if(n.error){i.loginError=n.error.message||"Unable to sign in.",i.authMessage="",u();return}if(await Me(n.data.session),t.invite_token){await ui(t.invite_token,t.return_url);return}i.authMessage="",i.dataLoaded=!1,k(ea(t.return_url||b(d("jobs",{},F()))),{replace:!0})}async function Us(e){const t=Object.fromEntries(new FormData(e).entries()),a=P();if(!a?.auth){i.loginError="Supabase auth is unavailable.",u();return}const n=String(t.email||"").trim(),r=String(t.password||""),o=String(t.full_name||"").trim(),l=String(t.invite_token||"").trim(),c=String(t.company_name||"").trim();if(!n||!r||!o||!l&&!c){i.loginError=l?"Name, email, and password are required.":"Name, email, password, and company workspace are required.",u();return}i.loginError="",i.authMessage=l?"Creating account and accepting invite...":"Creating secure workspace...",u();const m=await a.auth.signUp({email:n,password:r,options:{data:{full_name:o}}});if(m.error){i.loginError=m.error.message||"Unable to create account.",i.authMessage="",u();return}let v=m.data.session;if(!v){const y=await a.auth.signInWithPassword({email:n,password:r});if(y.error){i.loginError="Account created. Please sign in to finish workspace setup.",i.authMode="signin",i.authMessage="",u();return}v=y.data.session}if(await Me(v),l){await ui(l,t.return_url);return}const f=await a.rpc("create_company_workspace",{company_name:c});if(f.error){i.loginError=f.error.message||"Account created, but workspace setup failed.",i.authMessage="",u();return}i.activeCompanyId=h(f.data||F()),localStorage.setItem(ne,i.activeCompanyId),i.dataLoaded=!1,i.authMessage="",k(d("settings",{tab:"billing"},i.activeCompanyId),{replace:!0})}async function Qs(e){const t=Object.fromEntries(new FormData(e).entries()),a=P(),n=String(t.company_name||"").trim();if(!a||!n){i.loginError="Company workspace name is required.",u();return}const r=await a.rpc("create_company_workspace",{company_name:n});if(r.error){i.loginError=r.error.message||"Workspace setup failed.",u();return}i.activeCompanyId=h(r.data||F()),localStorage.setItem(ne,i.activeCompanyId),i.dataLoaded=!1,k(d("settings",{tab:"billing"},i.activeCompanyId),{replace:!0})}async function Vs(e){const t=Object.fromEntries(new FormData(e).entries()),a=P();if(!a?.auth){i.loginError="Supabase auth is unavailable.",u();return}const n=String(t.email||"").trim(),r=String(t.password||""),o=h(t.company_id||"");i.loginError="",i.authMessage="Submitting access request...",u();const l=await a.auth.signInWithPassword({email:n,password:r});if(l.error){i.loginError=l.error.message||"Sign in first to request access.",i.authMessage="",u();return}await Me(l.data.session);const c=await a.rpc("request_company_access",{target_company_id:o,request_message:String(t.message||"").trim()||null});if(c.error){i.loginError=c.error.message||"Unable to request access.",i.authMessage="",u();return}i.authMessage="Access request sent. An Owner/Admin must approve it.",i.loginError="",i.authMode="signin",u()}async function Js(){const e=p();i.sync={label:"Opening billing...",mode:"loading"},u();try{const t=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json",...D().access_token?{Authorization:`Bearer ${D().access_token}`}:{}},body:JSON.stringify({company_id:e,return_url:`${window.location.origin}${b(d("settings",{tab:"billing"},e))}`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.url)throw new Error(a.error||"Billing is not configured yet.");window.location.href=a.url}catch(t){i.sync={label:t.message||"Billing unavailable",mode:"local"},u()}}async function Bs(e){const t=p(),a=new FormData(e),n=he({id:crypto.randomUUID(),company_id:t,name:a.get("name"),color:a.get("color")||"#f0b23b",priority:a.get("priority")||100,is_system:!1,created_by:D().profile.id}),r=a.getAll("permissions").map(l=>String(l||"")).filter(Boolean),o=P();if(i.session?.auth==="supabase"&&o){const l=await o.from("roles").insert(n).select().single();if(l.error){i.sync={label:l.error.message||"Role save failed",mode:"local"},u();return}const c=he(l.data),m=r.map(v=>({role_id:c.id,permission_key:v,effect:"allow"}));m.length&&await o.from("role_permissions").insert(m),i.roles.unshift(c),i.rolePermissions=m.concat(i.rolePermissions).map(Ot),i.sync={label:"Role saved",mode:"live"}}else i.roles.unshift(n),i.rolePermissions=r.map(l=>Ot({role_id:n.id,permission_key:l,effect:"allow"})).concat(i.rolePermissions),i.sync={label:"Role saved locally",mode:"local"};i.modal="",u()}async function Hs(e){const t=new FormData(e),a=h(t.get("company_id")||p()),n=String(t.get("email")||"").trim().toLowerCase(),r=String(t.get("role_id")||"").trim();if(!n){i.sync={label:"Invite email is required",mode:"local"},u();return}const o=rt({id:crypto.randomUUID(),company_id:a,email:n,role_id:ha(r)?r:"",token:crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","").slice(0,16),status:"pending",invited_by:D().profile.id,expires_at:new Date(Date.now()+336*60*60*1e3).toISOString(),created_at:new Date().toISOString()}),l=P();if(i.session?.auth==="supabase"&&l){const c={company_id:o.company_id,email:o.email,role_id:o.role_id||null,status:"pending",invited_by:D().profile.id},m=await l.from("company_invites").insert(c).select().single();if(m.error){i.sync={label:m.error.message||"Invite save failed",mode:"local"},u();return}i.companyInvites.unshift(rt(m.data)),i.sync={label:"Invite created. Copy the link to send it.",mode:"live"}}else i.companyInvites.unshift(o),i.sync={label:"Invite created locally",mode:"local"};i.modal="",u()}async function ui(e,t=""){const a=P();if(!a){i.loginError="Supabase auth is unavailable.",i.authMessage="",u();return}i.authMessage="Accepting workspace invite...",u();const n=await a.rpc("accept_company_invite",{invite_token:String(e||"").trim()});if(n.error){i.loginError=n.error.message||"Unable to accept invite.",i.authMessage="",u();return}const r=h(n.data||F());i.activeCompanyId=r,localStorage.setItem(ne,r),i.authMessage="",i.loginError="",i.dataLoaded=!1,k(d("jobs",{},r),{replace:!0})}async function zs(e){const t=i.companyInvites.find(a=>a.id===e);if(!t?.token){i.sync={label:"Invite link is unavailable",mode:"local"},u();return}try{await navigator.clipboard.writeText(qr(t)),i.sync={label:"Invite link copied",mode:"live"}}catch{i.sync={label:"Copy failed",mode:"local"}}u()}async function Ws(e){const t=i.companyInvites.find(n=>n.id===e);if(!t)return;const a=P();if(i.session?.auth==="supabase"&&a){const n=await a.from("company_invites").update({status:"revoked",updated_at:new Date().toISOString()}).eq("id",t.id);if(n.error){i.sync={label:n.error.message||"Invite revoke failed",mode:"local"},u();return}i.sync={label:"Invite revoked",mode:"live"}}else i.sync={label:"Invite revoked locally",mode:"local"};i.companyInvites=i.companyInvites.map(n=>n.id===t.id?rt({...n,status:"revoked"}):n),Q(),u()}async function Ys(e){const t=new FormData(e),a=h(t.get("company_id")||p()),n=String(t.get("profile_id")||"").trim(),r=String(t.get("role_id")||"").trim(),o=["active","pending","disabled"].includes(String(t.get("membership_status")))?String(t.get("membership_status")):"active",l=aa(a,r);if(!n||!l){i.sync={label:"Select a user and role",mode:"local"},u();return}const c=st({company_id:a,profile_id:n,role:Ir(l),status:o}),m=qi({company_id:a,profile_id:n,role_id:l.id,assigned_by:D().profile.id}),v=P();if(i.session?.auth==="supabase"&&v){const f=ha(l.id),y=await v.from("company_memberships").upsert(pi(c),{onConflict:"company_id,profile_id"}).select().single();if(y.error){i.sync={label:y.error.message||"Access update failed",mode:"local"},u();return}if(f){await v.from("user_role_assignments").delete().eq("company_id",a).eq("profile_id",n);const L=await v.from("user_role_assignments").insert(m);if(L.error){i.sync={label:L.error.message||"Role assignment failed",mode:"local"},u();return}}tt(st(y.data||c)),f&&Aa(m),i.sync={label:f?"User access saved":"Membership saved; create a role to assign permissions",mode:"live"}}else tt(c),Aa(m),i.sync={label:"User access saved locally",mode:"local"};u()}async function qa(e,t){const a=i.joinRequests.find(l=>l.id===e);if(!a||!["approved","rejected"].includes(t))return;const n=P(),r=Ii({...a,status:t}),o=st({company_id:a.company_id,profile_id:a.profile_id,role:"member",status:t==="approved"?"active":"disabled"});if(i.session?.auth==="supabase"&&n){if(t==="approved"){const c=await n.from("company_memberships").upsert(pi(o),{onConflict:"company_id,profile_id"});if(c.error){i.sync={label:c.error.message||"Approval failed",mode:"local"},u();return}}const l=await n.from("company_join_requests").update({status:t,reviewed_by:D().profile.id,updated_at:new Date().toISOString()}).eq("id",a.id);if(l.error){i.sync={label:l.error.message||"Request update failed",mode:"local"},u();return}t==="approved"&&tt(o),i.sync={label:t==="approved"?"Access approved":"Request rejected",mode:"live"}}else t==="approved"&&tt(o),i.sync={label:t==="approved"?"Access approved locally":"Request rejected locally",mode:"local"};i.joinRequests=i.joinRequests.map(l=>l.id===a.id?r:l),Q(),u()}function Ks(e){if(e.target.matches("[data-global-search]")){i.query=e.target.value,ze();return}if(e.target.matches("[data-file-search]")){i.fileQuery=e.target.value,ze();return}if(e.target.matches("[data-form-search]")){i.formQuery=e.target.value,ze();return}if(e.target.matches("[data-crm-search]")){i.crmQuery=e.target.value,ze();return}if(e.target.matches("[data-form-field]")){Li(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Ni(e.target)}function Gs(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||F();$r(t);return}if(e.target.matches("[data-stage-filter]")){i.stageFilter=e.target.value||"all",u();return}if(e.target.matches("[data-crm-stage-filter]")){i.crmStageFilter=e.target.value||"all",u();return}if(e.target.matches("[data-crm-owner-filter]")){i.crmOwnerFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-status-filter]")){i.taskStatusFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-priority-filter]")){i.taskPriorityFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;k(d("tasks",t?{job_id:t}:{},p()));return}if(e.target.matches("[data-analytics-job-filter]")){const t=e.target.value;k(d("analytics",t?{job_id:t}:{},p()));return}if(e.target.matches("[data-file-category-filter]")){i.fileCategoryFilter=e.target.value||"All categories",u();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=i.route?.jobId||"";k(d("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},p()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;k(d("files",{...t?{folder:"jobs",job_id:t}:{}},p()));return}if(e.target.matches("[data-form-type-filter]")){i.formTypeFilter=e.target.value||"all",u();return}if(e.target.matches("[data-form-field]")){Li(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Ni(e.target)}async function Zs(e){const t=ke(Object.fromEntries(new FormData(e).entries()));t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||p(),t.estimate_total=Number(t.estimate_total||0),t.invoice_total=Number(t.invoice_total||0),t.updated_at=new Date().toISOString();const a=i.jobs.some(r=>r.id===t.id),n=P();if(n){const r=a?await n.from("jobs").update(t).eq("id",t.id).select().single():await n.from("jobs").insert(t).select().single();if(!r.error&&r.data){Mt(ke(r.data)),i.sync={label:"Quest Supabase live",mode:"live"},i.modal="",k(d("jobs",{tab:"profile",job_id:r.data.id},t.company_id),{replace:!0});return}i.sync={label:"Saved locally",mode:"local"}}Mt(t),i.modal="",k(d("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function Xs(e){if(!e)return;const t=p(),a=P();a&&await a.from("jobs").delete().eq("id",e),i.jobs=i.jobs.filter(n=>n.id!==e),i.selectedJobId=O(t)[0]?.id||"",i.modal="",Q(),k(d("jobs",{tab:"list"},t),{replace:!0})}async function er(e){const t=p(),a=Object.fromEntries(new FormData(e).entries()),n=je({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:D().profile.member_id||se(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),r=i.tasks.some(l=>l.id===n.id),o=P();if(o){const l=Jr(n),c=r?await o.from("tasks").update(l).eq("id",n.id).select().single():await o.from("tasks").insert(l).select().single();if(!c.error&&c.data){Ia(je(c.data)),i.sync={label:"Quest Supabase live",mode:"live"},i.modal="",k(d("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0});return}i.sync={label:"Task saved locally",mode:"local"}}Ia(n),i.modal="",k(d("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0})}async function tr(e){if(!e)return;const t=p(),a=P();a&&await a.from("tasks").delete().eq("id",e),i.tasks=i.tasks.filter(n=>n.id!==e),i.selectedTaskId="",i.modal="",Q(),k(d("tasks",{},t),{replace:!0})}async function ar(e){const t=p(),a=new FormData(e),n=Object.fromEntries(a.entries()),r=Array.from(e.elements.files?.files||[]),o=String(n.file_name||"").trim(),l=r.length?r:o?[null]:[];if(!l.length){i.sync={label:"Choose a file or enter a file name",mode:"local"},u();return}const c=P();let m=0;for(const v of l){const f=crypto.randomUUID(),y=v?.name||o,L=String(n.folder||"shared"),q=`${t}/${n.job_id?`jobs/${n.job_id}`:L}/${f}-${_a(y)}`;let H=!1;c&&v&&(H=!(await c.storage.from("quest-job-files").upload(q,v,{cacheControl:"3600",upsert:!1,contentType:v.type||"application/octet-stream"})).error);const Ie=Te({id:f,company_id:t,job_id:n.job_id||"",folder:L,file_name:y,mime_type:v?.type||"application/octet-stream",size_bytes:v?.size||Number(n.size_bytes||0),category:n.category||ee(L),notes:n.notes||"",uploaded_by_label:n.uploaded_by_label||D().profile.full_name,bucket_id:"quest-job-files",object_path:H||!v?q:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(c){const ce=await c.from("job_files").insert(Br(Ie)).select().single();if(!ce.error&&ce.data){Fa(Te(ce.data)),m+=1;continue}H&&await c.storage.from("quest-job-files").remove([q])}Fa(Ie)}i.sync=m===l.length?{label:"Quest Supabase live",mode:"live"}:{label:m?"Some files saved locally":"File record saved locally",mode:m?"loading":"local"},i.modal="",k(d("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),{replace:!0})}function ir(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.name||"").trim();if(!a){i.sync={label:"Folder name is required",mode:"local"},u();return}const n=ua({id:`folder-${crypto.randomUUID()}`,company_id:p(),name:a,parent_key:t.parent_key||"home",created_by_label:D().profile.full_name||"Quest HQ",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});i.driveFolders.unshift(n),i.modal="",i.sync={label:"Folder created locally",mode:"local"},Q(),u()}function nr(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),n=C(t.job_id),r=String(t.id||"").trim()?ge(String(t.id).trim()):null,o=wt({...t,id:String(t.id||"").trim()||`invoice-${crypto.randomUUID()}`,company_id:a,client_name:String(t.client_name||n?.client_name||"").trim(),total:E(t.subtotal)+E(t.tax),updated_at:new Date().toISOString()});dr(o),r?.job_id&&r.job_id!==o.job_id&&xt(r.job_id),xt(o.job_id),i.modal="",i.sync={label:"Finance saved locally",mode:"local"},k(d("finance",{invoice:o.id},a),{replace:!0})}function sr(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),n=ge(t.invoice_id);if(!n||n.company_id!==a){i.sync={label:"Create an invoice before recording a payment",mode:"local"},u();return}const r=St({...t,id:`payment-${crypto.randomUUID()}`,company_id:a,created_at:new Date().toISOString()});i.financePayments.unshift(r),n.status=ae(n.id)<=0?"Paid":"Partially paid",n.updated_at=new Date().toISOString(),xt(n.job_id),Q(),i.modal="",i.sync={label:"Payment recorded locally",mode:"local"},k(d("finance",r.invoice_id?{invoice:r.invoice_id}:{},a),{replace:!0})}function rr(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),n=kt({...t,id:String(t.id||"").trim()||`expense-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});ur(n),i.modal="",i.sync={label:"Expense saved locally",mode:"local"},k(d("finance",{expense:n.id},a),{replace:!0})}function or(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),n=jt({...t,id:String(t.id||"").trim()||`vendor-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});pr(n),i.modal="",i.sync={label:"Vendor saved locally",mode:"local"},k(d("finance",{vendor:n.id},a),{replace:!0})}async function lr(e){const t=i.files.find(r=>r.id===e);if(!t?.object_path){i.sync={label:"No stored object for this file",mode:"local"},u();return}const a=P();if(!a)return;const n=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(n.error||!n.data?.signedUrl){i.sync={label:"Download failed",mode:"local"},u();return}window.open(n.data.signedUrl,"_blank","noopener,noreferrer")}async function cr(e){const t=i.files.find(n=>n.id===e);if(!t)return;const a=P();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),i.files=i.files.filter(n=>n.id!==e),i.selectedFileId="",i.modal="",Q(),u()}function Mt(e){const t=i.jobs.findIndex(a=>a.id===e.id);t>=0?i.jobs[t]=e:i.jobs.unshift(e),i.selectedJobId=e.id,Q()}function Ia(e){const t=i.tasks.findIndex(a=>a.id===e.id);t>=0?i.tasks[t]=e:i.tasks.unshift(e),i.selectedTaskId=e.id,Q()}function Fa(e){const t=i.files.findIndex(a=>a.id===e.id);t>=0?i.files[t]=e:i.files.unshift(e),Q()}function dr(e){const t=i.financeInvoices.findIndex(a=>a.id===e.id);t>=0?i.financeInvoices[t]=e:i.financeInvoices.unshift(e),Q()}function ur(e){const t=i.financeExpenses.findIndex(a=>a.id===e.id);t>=0?i.financeExpenses[t]=e:i.financeExpenses.unshift(e),Q()}function pr(e){const t=i.financeVendors.findIndex(a=>a.id===e.id);t>=0?i.financeVendors[t]=e:i.financeVendors.unshift(e),Q()}function tt(e){const t=i.memberships.findIndex(a=>a.company_id===e.company_id&&a.profile_id===e.profile_id);t>=0?i.memberships[t]=e:i.memberships.unshift(e),Q()}function Aa(e){i.roleAssignments=i.roleAssignments.filter(t=>t.company_id!==e.company_id||t.profile_id!==e.profile_id),e.role_id&&i.roleAssignments.unshift(e)}function pi(e){return{company_id:e.company_id,profile_id:e.profile_id,role:e.role,status:e.status}}function xt(e){if(!e)return;const t=C(e);t&&(t.invoice_total=K(be(t.company_id).filter(a=>a.job_id===e),"total"),t.updated_at=new Date().toISOString(),Mt(t))}function ze(){const e=document.getElementById("workspace");e&&(mi(i.route),e.innerHTML=oi(i.route))}function ft(){const e=Xt(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/"||e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:p(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const n=a[2]||"jobs";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:n,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:p(),jobId:t.get("job_id")||""}}function mr(){const e=Xt(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||Ze(t.get("job_id")||t.get("project_id"))||localStorage.getItem(ne)||F(),n=Object.fromEntries(Object.entries(Hi).map(([l,c])=>[l,d(c,{},a)]));Object.assign(n,{"/index.html":d("jobs",{},a),"/command.html":d("jobs",{},a),"/login.html":"/login"});let r=n[e];if(e==="/jobs"){const l=t.get("tab");l==="tasks"?r=d("tasks",Y(t,["job_id","task_id","new","edit"]),a):l==="files"?r=d("files",Y(t,["job_id","folder"]),a):l==="forms"?r=d("forms",Y(t,["job_id"]),a):l==="analytics"?r=d("analytics",Y(t,["job_id"]),a):r=d("jobs",Y(t,["job_id","tab"]),a)}if(e==="/files"&&(r=d("files",Y(t,["job_id","folder"]),a)),e==="/forms"&&(r=d("forms",Y(t,["job_id"]),a)),e==="/analytics"&&(r=d("analytics",Y(t,["job_id"]),a)),e==="/crm"&&(r=d("crm",Y(t,["account"]),a)),e==="/finance"&&(r=d("finance",Y(t,["invoice","expense","vendor","report"]),a)),e==="/admin"&&(r=d("settings",{},a)),e==="/time"&&(r=d("time",{},a)),e==="/team"&&(r=d("team-chart",{},a)),e==="/team-chart"&&(r=d("team-chart",{},a)),e==="/approvals"&&(r=d("approvals",{},a)),e==="/clock"&&(r=d("clock",{},a)),e==="/task-management.html"){const l=t.get("project_id")||t.get("job_id")||"";r=d("tasks",l?{job_id:l}:{},Ze(l)||a)}const o=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(o){const l=decodeURIComponent(o[1]);r=d("tasks",{job_id:l},Ze(l)||a)}r&&window.history.replaceState({},"",b(r))}function fr(e){if(e.name!=="company")return"";const t=qe();if(i.session?.auth==="supabase"&&!t.length)return null;if(!t.includes(e.companyId))return d(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||F());if(!ut.map(r=>r.id).includes(e.section))return d("jobs",{},e.companyId);const n=e.jobId?Ze(e.jobId):"";return n&&n!==e.companyId&&t.includes(n)?d(e.section,Object.fromEntries(e.params.entries()),n):""}function Xt(){let e=window.location.pathname||"/";return _e&&e.startsWith(_e)&&(e=e.slice(_e.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function b(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),n=t.startsWith("/")?t:"/"+t;return`${_e}${n}${a?`?${a}`:""}`||"/"}function k(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(_e+"/")||_e===""&&e.startsWith("/")?e:b(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),u()}function br(){return`${Xt()}${window.location.search}`}function ea(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?b(d("jobs",{},F())):`${t.pathname}${t.search}`}catch{return b(d("jobs",{},F()))}}function d(e="jobs",t={},a=p()){const n=new URLSearchParams(t);for(const[r,o]of[...n.entries()])(o==null||o==="")&&n.delete(r);return`/company/${encodeURIComponent(h(a||F()))}/${e}${n.toString()?`?${n.toString()}`:""}`}function gr(e){return e.name==="company"?A(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":A(e.name||"Workspace")}function vr(e,t){const[a]=t.split("?"),n=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!n||e.name!=="company"?!1:e.companyId===decodeURIComponent(n[1])&&e.section===n[2]}function yr(e){return Ua.includes(e)?e:"pipeline"}function _r(e){return{pipeline:"Pipeline",list:"List",profile:"Profile"}[e]||e}function hr(e){const t=e.companyId||i.activeCompanyId||F(),a=qe();i.activeCompanyId=a.includes(t)?t:a[0]||F(),localStorage.setItem(ne,i.activeCompanyId)}function mi(e){const t=p();e.jobId&&O(t).some(n=>n.id===e.jobId)&&(i.selectedJobId=e.jobId),(!i.selectedJobId||!O(t).some(n=>n.id===i.selectedJobId))&&(i.selectedJobId=O(t)[0]?.id||"");const a=e.params.get("task_id");a&&z(t).some(n=>n.id===a)&&(i.selectedTaskId=a),e.section!=="tasks"&&(i.selectedTaskId=""),i.driveFolder=e.params.get("folder")||"home"}function $r(e){const t=qe(),a=h(e),n=t.includes(a)?a:t[0]||F();i.activeCompanyId=n,localStorage.setItem(ne,n),wr();const r=i.route||ft(),o=r.name==="company"?r.section:"jobs";k(d(o,{},n))}function wr(){i.modal="",i.selectedJobId="",i.selectedTaskId="",i.selectedFileId="",i.selectedFormId="",i.selectedQuestionId="",i.selectedFinanceInvoiceId="",i.selectedFinanceExpenseId="",i.selectedFinanceVendorId="",i.query="",i.fileQuery="",i.formQuery="",i.crmQuery="",i.stageFilter="all",i.crmStageFilter="all",i.crmOwnerFilter="all",i.taskStatusFilter="all",i.taskPriorityFilter="all",i.fileCategoryFilter="All categories",i.formTypeFilter="all",i.formsTab="library",i.driveFolder="home"}function Sr(e){const t=C(e);t&&(i.selectedJobId=e,k(d("jobs",{tab:"profile",job_id:e},t.company_id)))}function kr(e){const t=ta(e);t&&(i.selectedTaskId=e,k(d("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function pe(){return C(i.selectedJobId)||O(p())[0]||null}function C(e){return i.jobs.find(t=>t.id===e)||null}function ta(e){return i.tasks.find(t=>t.id===e)||null}function O(e=p()){return i.jobs.filter(t=>t.company_id===e)}function z(e=p()){return i.tasks.filter(t=>t.company_id===e)}function me(e=p()){return i.files.filter(t=>t.company_id===e)}function xe(e=p()){return i.driveFolders.filter(t=>t.company_id===e)}function se(e=p()){return i.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function jr(e=p()){const t=new Map;se(e).forEach(n=>{t.set(n.id,{profile_id:"",member_id:n.id,name:n.full_name||n.name,email:n.email,avatar_url:n.avatar_url,role:at(e,n.id).toLowerCase(),role_label:at(e,n.id),role_id:"",status:n.active?"active":"disabled"})}),i.memberships.filter(n=>n.company_id===e).forEach(n=>{const r=fi(n.profile_id),o=n.member_id?i.teamMembers.find(v=>v.id===n.member_id):null,l=i.roleAssignments.find(v=>v.company_id===e&&v.profile_id===n.profile_id),c=l?aa(e,l.role_id):null,m=n.profile_id||n.member_id;t.set(m,{profile_id:n.profile_id,member_id:n.member_id,name:r?.full_name||o?.full_name||r?.email||o?.name||m||"User",email:r?.email||o?.email||"",avatar_url:r?.avatar_url||o?.avatar_url||"",role:n.role,role_label:c?.name||A(n.role),role_id:l?.role_id||Tt(e,n.role),status:n.status||"active"})});const a=D().profile;if(i.session?.auth==="supabase"&&a?.id&&!t.has(a.id)){const n=it(e,a.id);n&&t.set(a.id,{profile_id:a.id,member_id:a.member_id||"",name:a.full_name||a.email,email:a.email,avatar_url:a.avatar_url,role:n.role,role_label:A(n.role),role_id:Tt(e,n.role),status:n.status||"active"})}return[...t.values()].sort((n,r)=>(n.status==="active"?0:1)-(r.status==="active"?0:1)||n.name.localeCompare(r.name))}function Dr(e=p()){return i.companyInvites.filter(t=>t.company_id===e&&t.status==="pending").sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function fe(e=p()){const t=i.roles.filter(a=>a.company_id===e);return t.length?t.sort((a,n)=>n.priority-a.priority||a.name.localeCompare(n.name)):[he({id:`owner-${e}`,company_id:e,name:"Owner",color:"#f0b23b",priority:1e3,is_system:!0}),he({id:`admin-${e}`,company_id:e,name:"Admin",color:"#60a5fa",priority:800,is_system:!0}),he({id:`staff-${e}`,company_id:e,name:"Staff",color:"#15803d",priority:100,is_system:!0})]}function aa(e,t){return fe(e).find(a=>a.id===t)||null}function Tt(e,t){const a=String(t||"").toLowerCase();return fe(e).find(n=>n.name.toLowerCase()===a||n.id.toLowerCase()===a)?.id||""}function Cr(e=p()){const t=fe(e).filter(a=>a.name.toLowerCase()!=="owner");return t.find(a=>a.name.toLowerCase()==="staff")?.id||t.find(a=>a.name.toLowerCase()==="member")?.id||t[0]?.id||""}function qr(e){const t=new URL(b("/login"),window.location.origin);return t.searchParams.set("invite",e.token),t.toString()}function Ir(e){const t=String(e?.name||"").toLowerCase().replace(/\s+/g,"_");return["owner","member","worker","sales","supervisor","admin","developer","construction_supervisor"].includes(t)?t:"member"}function fi(e){return i.profiles.find(t=>t.id===e)||(D().profile.id===e?D().profile:null)}function bi(e=p()){const t=i.query.trim().toLowerCase();return O(e).filter(a=>i.stageFilter!=="all"&&a.stage!==i.stageFilter?!1:t?[a.name,a.client_name,a.contact_name,a.owner_name,a.site_address,a.job_type,j(a.company_id)].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function bt(e=p()){const t=new Map;return O(e).forEach(a=>{const n=String(a.client_name||"").trim()||"Unassigned customer",r=`account-${_a(n.toLowerCase())}`;t.has(r)||t.set(r,{key:r,name:n,jobs:[]}),t.get(r).jobs.push(a)}),Array.from(t.values()).map(a=>{const n=a.jobs.slice().sort((q,H)=>Date.parse(H.updated_at||H.created_at||0)-Date.parse(q.updated_at||q.created_at||0)),r=n[0]||null,o=n.map(q=>q.id),l=z(e).filter(q=>o.includes(q.project_id)),c=oe(e).filter(q=>o.includes(q.linked_job_id)),m=me(e).filter(q=>o.includes(q.job_id)),v=Z(n.map(q=>q.contact_name)),f=Z(n.map(q=>q.owner_name)),y=Z(n.map(q=>q.site_address)),L=n.map(q=>q.priority||"Medium").sort((q,H)=>De(H)-De(q))[0]||"Medium";return{...a,jobs:n,tasks:l,latestJob:r,contacts:v,owners:f,addresses:y,forms:c,files:m,primaryContact:v[0]||"No contact",owner:f[0]||"Unassigned",stage:r?.stage||"Lead",priority:L,estimateTotal:K(n,"estimate_total"),fileCount:m.length,formCount:c.length,updatedAt:r?.updated_at||r?.created_at||new Date().toISOString(),subtitle:y[0]||`${n.length} linked job${n.length===1?"":"s"}`}}).sort((a,n)=>Date.parse(n.updatedAt||0)-Date.parse(a.updatedAt||0))}function Fr(e=p()){const t=i.crmQuery.trim().toLowerCase();return bt(e).filter(a=>i.crmStageFilter!=="all"&&!a.jobs.some(n=>n.stage===i.crmStageFilter)||i.crmOwnerFilter!=="all"&&!a.owners.includes(i.crmOwnerFilter)?!1:t?[a.name,a.primaryContact,a.owner,a.stage,...a.addresses,...a.contacts,...a.jobs.map(n=>n.name)].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function Ar(e,t){return bt(e).find(a=>a.key===t)||null}function Mr(e=p()){return Z(O(e).map(t=>t.owner_name)).sort((t,a)=>t.localeCompare(a))}function gi(e=p()){const t=D().profile.member_id||"",a=z(e).slice().sort(xa),n=a.filter(ia),r=n.filter(y=>y.due===S(0)),o=n.filter(y=>Ra(y.due)<0),l=n.filter(y=>{const L=Ra(y.due);return L>=0&&L<=7}),c=n.filter(y=>y.assignee_id===t),m=n.filter(y=>["review","pending"].includes(y.status)),v=a.filter(y=>y.status==="done"),f=Z(o.concat(r,c,m,l).map(y=>y.id)).map(y=>a.find(L=>L.id===y)).filter(Boolean).sort(xa);return{tasks:a,open:n,dueToday:r,overdue:o,thisWeek:l,assignedToMe:c,review:m,done:v,focus:f}}function vi(e=p()){const t=oe(e).filter(r=>(r.require_approval||r.type==="Client approval")&&!["Archived","Closed","Approved"].includes(r.status)).map(r=>({id:`form:${r.id}`,title:r.title,meta:C(r.linked_job_id)?.name||r.description||"Company form",type:"Form approval",owner:B(r.creator_id),status:r.status,updatedAt:r.updated_at||r.created_at,href:d("forms",{form_id:r.id},e)})),a=z(e).filter(r=>["review","pending"].includes(r.status)).map(r=>({id:`task:${r.id}`,title:r.title,meta:C(r.project_id)?.name||r.description||"Company task",type:"Task review",owner:B(r.assignee_id),status:le(r.status),updatedAt:r.updated_at||r.due,href:d("tasks",{...r.project_id?{job_id:r.project_id}:{},task_id:r.id},e)})),n=i.memberships.filter(r=>r.company_id===e&&r.status!=="active").map(r=>({id:`access:${r.profile_id||r.member_id}`,title:B(r.member_id||r.profile_id),meta:`${A(r.role)} access request`,type:"Access request",owner:"Quest admin",status:A(r.status),updatedAt:new Date().toISOString(),href:d("settings",{tab:"access"},e)}));return t.concat(a,n).sort((r,o)=>Date.parse(o.updatedAt||0)-Date.parse(r.updatedAt||0))}function gt(e=p()){const t=i.activeTimer;return!t||t.company_id!==e?null:t}function yi(e=p()){return i.timeEntries.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.started_at||0)-Date.parse(t.started_at||0))}function Ma(e=p(),t=0){return yi(e).filter(a=>Date.parse(a.started_at||0)>=t).reduce((a,n)=>a+E(n.duration_ms),0)}function xr(e=p(),t=""){i.activeTimer&&_i(!1);const a=t?ta(t):null;i.activeTimer={id:`timer-${crypto.randomUUID()}`,company_id:e,user_id:D().profile.member_id||D().profile.id,task_id:a?.company_id===e?a.id:"",task_title:a?.company_id===e?a.title:"",started_at:new Date().toISOString()},Mi(),i.sync={label:"Clock started locally",mode:"local"},u()}function _i(e=!0){const t=i.activeTimer;if(!t)return;const a=new Date().toISOString(),n=Math.max(0,Date.parse(a)-Date.parse(t.started_at||a));i.timeEntries.unshift({id:`time-${crypto.randomUUID()}`,company_id:t.company_id,user_id:t.user_id,task_id:t.task_id||"",task_title:t.task_title||"",started_at:t.started_at,ended_at:a,duration_ms:n,notes:t.task_title?"Task timer":"General shift"}),i.activeTimer=null,Mi(),i.sync={label:"Clock stopped locally",mode:"local"},e&&u()}function ia(e){return e.status!=="done"}function xa(e,t){const a=Date.parse(e.due||0)-Date.parse(t.due||0);return a||De(t.priority)-De(e.priority)}function be(e=p()){return i.financeInvoices.filter(t=>t.company_id===e).sort(Re("updated_at"))}function hi(e=p()){return i.financePayments.filter(t=>t.company_id===e)}function na(e=p()){return i.financeExpenses.filter(t=>t.company_id===e).sort(Re("updated_at"))}function sa(e=p()){return i.financeVendors.filter(t=>t.company_id===e)}function ge(e){return i.financeInvoices.find(t=>t.id===e)||null}function $i(e){return i.financeExpenses.find(t=>t.id===e)||null}function ra(e){return i.financeVendors.find(t=>t.id===e)||null}function Et(e){return ra(e)?.name||"No vendor"}function wi(e){return i.financePayments.filter(t=>t.invoice_id===e).sort(Re("received_at"))}function oa(e){return K(wi(e),"amount")}function ae(e){const t=ge(e);return Math.max(0,E(t?.total)-oa(e))}function Si(e){const t=ae(e.id);return t<=0&&E(e.total)>0?"Paid":t<E(e.total)?"Partially paid":e.status==="Sent"&&Qi(e.due_date)>0?"Overdue":e.status}function ki(e=p()){const t=be(e),a=hi(e),n=na(e).filter(c=>["Approved","Paid"].includes(c.status)),r={current:0,thirty:0,sixty:0,overSixty:0};t.forEach(c=>{const m=ae(c.id);if(!m)return;const v=Qi(c.due_date);v<=0?r.current+=m:v<=30?r.thirty+=m:v<=60?r.sixty+=m:r.overSixty+=m});const o=K(a,"amount"),l=K(n,"amount");return{pipeline:K(O(e),"estimate_total"),invoiced:K(t,"total"),collected:o,outstanding:t.reduce((c,m)=>c+ae(m.id),0),expenses:l,net:o-l,aging:r}}function Tr(e=p(),t=""){const a=i.query.trim().toLowerCase();return z(e).filter(n=>t&&n.project_id!==t||i.taskStatusFilter!=="all"&&n.status!==i.taskStatusFilter||i.taskPriorityFilter!=="all"&&n.priority!==i.taskPriorityFilter?!1:a?[n.title,n.description,He(n.type),B(n.assignee_id),C(n.project_id)?.name].some(r=>String(r||"").toLowerCase().includes(a)):!0)}function ji(){const e=qe();return i.companies.filter(t=>e.includes(t.id))}function la(e,t=p()){if(!e)return!0;const a=D().profile;if(i.session?.auth==="supabase"){const o=it(t,a.id);if(!o||o.status!=="active")return!1;if(["owner","developer"].includes(String(o.role).toLowerCase()))return!0;const l=i.roleAssignments.filter(m=>m.company_id===t&&m.profile_id===a.id).map(m=>m.role_id),c=i.rolePermissions.filter(m=>l.includes(m.role_id));if(c.some(m=>(m.permission_key===e||m.permission_key==="*")&&m.effect==="deny"))return!1;if(c.some(m=>(m.permission_key===e||m.permission_key==="*")&&m.effect==="allow"))return!0}const n=String(it(t,a.id)?.role||a.role||"member").toLowerCase(),r=$a[n]||$a.member;return r.includes("*")||r.includes(e)}function qe(){const e=D().profile,t=i.companies.map(r=>r.id);if(i.session?.auth==="supabase"){const r=i.memberships.filter(o=>o.profile_id===e.id&&o.status==="active").map(o=>h(o.company_id));return Z(r).filter(o=>t.includes(o))}if(["developer","admin"].includes(e.role))return Z(t.length?t:Qe.map(r=>h(r.id)));const a=i.memberships.filter(r=>r.profile_id===e.id&&r.status!=="disabled").map(r=>h(r.company_id)),n=a.length?a:e.company_ids||[];return Z(n.map(h)).filter(r=>t.includes(r))}function p(){const e=qe();return e.includes(i.activeCompanyId)?i.activeCompanyId:e[0]||i.activeCompanyId||F()}function F(){return h(Qe[0].id)}function vt(e){const t=h(e);return i.companies.find(a=>a.id===t)||Qe.map(Ve).find(a=>a.id===t)||null}function j(e){const t=vt(e);return t?yt(t):e||"Company"}function yt(e){return e.short_name||e.label||e.name||e.id}function re(e){return vt(e)?.color||"#f0b23b"}function Ze(e){return h(i.jobs.find(t=>t.id===e)?.company_id||"")}function _t(e){const t=D().profile;return i.session?.auth!=="supabase"&&["developer","admin"].includes(t.role)?A(t.role):A(it(e,t.id)?.role||t.role||"member")}function at(e,t){const a=i.memberships.find(n=>n.company_id===e&&(n.member_id===t||n.profile_id===t));return A(a?.role||"member")}function it(e,t){return i.memberships.find(a=>a.company_id===e&&a.profile_id===t)||null}function ca(e=p()){return i.subscriptions.find(t=>t.company_id===e)||null}function da(e=p()){if(i.session?.auth!=="supabase")return!0;const t=ca(e);return!!(!t||["trialing","active","past_due","grace"].includes(t.status)||t.grace_ends_at&&Date.parse(t.grace_ends_at)>Date.now())}function Di(e=p()){const t=ca(e);return t?t.status==="trialing"?`Trial - ${M(t.trial_ends_at)}`:t.status==="active"?"Active subscription":t.status==="past_due"?"Past due grace":t.status==="grace"?`Grace - ${M(t.grace_ends_at)}`:A(t.status):i.session?.auth==="supabase"?"Trial pending":"Demo mode"}function B(e){const t=i.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function ht(e){return i.tasks.filter(t=>t.project_id===e).length}function nt(e){return i.files.filter(t=>t.job_id===e).length}function h(e){return{"quest-roofing":"roofing","quest-drafting":"drafting"}[String(e||"").trim()]||String(e||"").trim()}function Ci(e){const t=new Map;return e.map(Ve).forEach(a=>{!a.id||t.has(a.id)||t.set(a.id,a)}),Array.from(t.values())}function Ve(e){return{id:h(e.id||""),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function ke(e){return{id:String(e.id||""),company_id:h(e.company_id||F()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:Pe.includes(e.stage)?e.stage:"Lead",priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:E(e.estimate_total),invoice_total:E(e.invoice_total),task_count:E(e.task_count),file_count:E(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function je(e){const t=Xe.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=Le.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:Qa.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:h(e.company_id||F()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||S(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:Xe.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function Te(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:h(e.company_id||F()),job_id:String(e.job_id||""),folder:String(e.folder||ko(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:E(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ua(e){return{id:String(e.id||`folder-${crypto.randomUUID()}`),company_id:h(e.company_id||F()),name:String(e.name||"New folder").trim()||"New folder",parent_key:String(e.parent_key||"home"),created_by_label:String(e.created_by_label||"Quest HQ"),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Je(e){const t=Array.isArray(e.questions)?e.questions.map($t):[],a=Ne.includes(e.type)?e.type:"Internal",n=Kt.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:h(e.company_id||F()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:n,audience:String(e.audience||"Internal").trim(),creator_id:String(e.creator_id||e.created_by||e.created_by_id||""),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function $t(e){const t=Ue.some(([n])=>n===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(n=>String(n||"").trim()).filter(Boolean):[]};return Oe(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function pa(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:h(e.company_id||F()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function wt(e){const t=E(e.subtotal),a=E(e.tax),n=E(e.total)||t+a;return{id:String(e.id||`invoice-${crypto.randomUUID()}`),company_id:h(e.company_id||F()),job_id:String(e.job_id||""),client_name:String(e.client_name||"").trim(),invoice_number:String(e.invoice_number||`INV-${Date.now()}`).trim(),status:Va.includes(e.status)?e.status:"Draft",issue_date:String(e.issue_date||S(0)).slice(0,10),due_date:String(e.due_date||S(30)).slice(0,10),subtotal:t,tax:a,total:n,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function St(e){return{id:String(e.id||`payment-${crypto.randomUUID()}`),company_id:h(e.company_id||F()),invoice_id:String(e.invoice_id||""),amount:E(e.amount),method:Ha.includes(e.method)?e.method:"ACH",received_at:String(e.received_at||S(0)).slice(0,10),reference:String(e.reference||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString()}}function kt(e){return{id:String(e.id||`expense-${crypto.randomUUID()}`),company_id:h(e.company_id||F()),job_id:String(e.job_id||""),vendor_id:String(e.vendor_id||""),category:pt.includes(e.category)?e.category:"Other",amount:E(e.amount),status:Ja.includes(e.status)?e.status:"Pending",spent_at:String(e.spent_at||S(0)).slice(0,10),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function jt(e){return{id:String(e.id||`vendor-${crypto.randomUUID()}`),company_id:h(e.company_id||F()),name:String(e.name||"New vendor").trim()||"New vendor",contact_name:String(e.contact_name||"").trim(),email:String(e.email||"").trim(),phone:String(e.phone||"").trim(),category:pt.includes(e.category)?e.category:"Other",status:Ba.includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ma(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,supervisor_id:String(e.supervisor_id||e.manager_id||""),company_ids:Array.isArray(e.company_ids)?Z(e.company_ids.map(h)):[]}}function st(e){return{company_id:h(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:String(e.status||"active")}}function Er(e){return{company_id:h(e.company_id||""),status:String(e.status||"trialing"),plan_code:String(e.plan_code||"quest_company_300"),amount_cents:E(e.amount_cents||3e4),currency:String(e.currency||"usd"),stripe_customer_id:String(e.stripe_customer_id||""),stripe_subscription_id:String(e.stripe_subscription_id||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||""}}function he(e){return{id:String(e.id||""),company_id:h(e.company_id||""),name:String(e.name||"Role").trim()||"Role",color:String(e.color||"#f0b23b"),priority:E(e.priority),is_system:e.is_system===!0,created_by:String(e.created_by||"")}}function Ot(e){return{role_id:String(e.role_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function qi(e){return{company_id:h(e.company_id||""),profile_id:String(e.profile_id||""),role_id:String(e.role_id||""),assigned_by:String(e.assigned_by||"")}}function Or(e){return{id:String(e.id||""),company_id:h(e.company_id||""),resource_type:String(e.resource_type||""),resource_id:String(e.resource_id||""),principal_type:String(e.principal_type||""),principal_id:String(e.principal_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function Rr(e){return{id:String(e.id||""),company_id:h(e.company_id||""),resource_type:String(e.resource_type||""),field_key:String(e.field_key||""),role_id:String(e.role_id||""),visibility:["visible","masked","hidden"].includes(e.visibility)?e.visibility:"visible",editable:e.editable!==!1}}function rt(e){return{id:String(e.id||""),company_id:h(e.company_id||""),email:String(e.email||""),role_id:String(e.role_id||""),token:String(e.token||""),status:String(e.status||"pending"),expires_at:e.expires_at||"",invited_by:String(e.invited_by||""),accepted_by:String(e.accepted_by||""),created_at:e.created_at||""}}function Ii(e){return{id:String(e.id||""),company_id:h(e.company_id||""),profile_id:String(e.profile_id||""),requested_email:String(e.requested_email||""),status:String(e.status||"pending"),message:String(e.message||""),reviewed_by:String(e.reviewed_by||""),created_at:e.created_at||""}}function Pr(e=p()){return ke({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function Lr(e=p(),t=""){return je({id:"",title:"",company_id:e,project_id:t,assignee_id:se(e)[0]?.id||"abraham",creator_id:D().profile.member_id||"abraham",due:S(1),priority:"medium",status:"todo",type:"admin"})}function Nr(e=p()){const t=pe();return wt({id:"",company_id:e,job_id:t?.company_id===e?t.id:"",client_name:t?.company_id===e?t.client_name:"",invoice_number:jo(e),status:"Draft",issue_date:S(0),due_date:S(30),subtotal:t?.company_id===e?t.estimate_total:0,tax:0,notes:""})}function Ur(e=p(),t=""){const a=t?ge(t):be(e).find(r=>ae(r.id)>0),n=a?.company_id===e?a:null;return St({id:"",company_id:e,invoice_id:n?.id||"",amount:n?ae(n.id):0,method:"ACH",received_at:S(0),reference:"",notes:""})}function Qr(e=p(),t=""){return kt({id:"",company_id:e,job_id:pe()?.company_id===e?pe().id:"",vendor_id:t||sa(e)[0]?.id||"",category:"Materials",status:"Pending",amount:0,spent_at:S(0),notes:""})}function Vr(e=p()){return jt({id:"",company_id:e,name:"",category:"Materials",status:"Active"})}function Jr(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function Br(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function D(){return i.session?i.session.auth==="supabase"?i.session:{...i.session,profile:{...Rt().profile,...i.session.profile||{},...i.profileDraft||{}}}:Rt()}function Hr(e,t){const a=!!(e.user.email_confirmed_at||e.user.confirmed_at);return{auth:"supabase",access_token:e.access_token,refresh_token:e.refresh_token,user:{id:e.user.id,email:e.user.email||"",email_confirmed_at:e.user.email_confirmed_at||e.user.confirmed_at||"",email_verified:a},profile:fa(t||{},{id:e.user.id,email:e.user.email||"",full_name:e.user.user_metadata?.full_name||e.user.email||"Quest user",role:"member",member_id:"",company_ids:[],avatar_url:"",email_verified:a})}}function Rt(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",email_verified:!0,...i.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:we.localUsername,email:e.email},profile:e}}function fa(e,t={}){const a=String(e.role||t.role||"member").toLowerCase(),n=typeof e.email_verified=="boolean"?e.email_verified:t.email_verified===!0;return{id:String(e.id||t.id||""),email:String(e.email||t.email||""),full_name:String(e.full_name||t.full_name||e.email||t.email||"Quest user"),role:a,role_label:A(a),member_id:String(e.member_id||t.member_id||""),company_ids:Array.isArray(e.company_ids)?Z(e.company_ids.map(h)):t.company_ids||[],avatar_url:String(e.avatar_url||t.avatar_url||""),approved:e.approved!==!1,email_verified:n,supervisor_id:String(e.supervisor_id||t.supervisor_id||"")}}function zr(e=D()){return e.auth!=="supabase"?!0:e.user?.email_verified===!0||!!e.user?.email_confirmed_at||e.profile?.email_verified===!0}function V(e,t,a=""){const n=si();return`
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${G(n)}</span>
        <div>
          <div class="context-line"><span>${s(j(p()))}</span><b>${s(_t(p()))}</b></div>
          <h1>${s(e)}</h1>
          <p>${s(t)}</p>
        </div>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function Wr(e){return`<section class="metric-grid">${e.map(([t,a])=>`<article class="metric">${G(ri(t),"metric-symbol")}<span>${s(t)}</span><strong>${s(a)}</strong></article>`).join("")}</section>`}function Yr(e){return`
    <button class="queue-row" type="button" data-select-job="${s(e.id)}">
      <span><strong>${s(e.name)}</strong><small>${s(e.client_name||j(e.company_id))}</small></span>
      ${ba(e.priority)}
      <b>${s(e.stage)}</b>
    </button>
  `}function Dt(e){return`
    <button class="queue-row" type="button" data-select-task="${s(e.id)}">
      <span><strong>${s(e.title)}</strong><small>${s(C(e.project_id)?.name||j(e.company_id))}</small></span>
      ${Fi(e.priority)}
      <b>${s(le(e.status))}</b>
    </button>
  `}function Kr(e){return`
    <button class="job-card priority-${s(e.priority.toLowerCase())} ${e.id===i.selectedJobId?"active":""}" type="button" data-select-job="${s(e.id)}">
      <strong>${s(e.name)}</strong>
      <span>${s(e.client_name||"No client")}</span>
      <small>${s(j(e.company_id))} - ${s(e.owner_name||"Unassigned")}</small>
      <em>${s(ht(e.id))} tasks</em>
    </button>
  `}function We(e,t,a,n){return`
    <a class="mini-link" href="${b(e)}" data-router>
      <i class="ti ${s(t)}"></i>
      <span><strong>${s(a)}</strong><small>${s(n)}</small></span>
    </a>
  `}function N(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${s(t)}</span><strong>${s(a)}</strong></div>`).join("")}</div>`}function w(e,t,a="",n=!1,r="text",o=""){return`<label class="${s(o)}"><span>${s(e)}</span><input name="${s(t)}" type="${s(r)}" value="${s(a)}" ${n?"required":""} /></label>`}function ie(e,t,a="",n=""){return`<label class="${s(n)}"><span>${s(e)}</span><textarea name="${s(t)}" rows="4">${s(a)}</textarea></label>`}function R(e,t,a,n){return`
    <label><span>${s(e)}</span><select name="${s(t)}">
      ${n.map(([r,o])=>`<option value="${s(r)}" ${String(r)===String(a)?"selected":""}>${s(o)}</option>`).join("")}
    </select></label>
  `}function ba(e){return`<span class="priority ${s(String(e).toLowerCase())}">${s(e)}</span>`}function Fi(e){return`<span class="priority ${s(e)}">${s(A(e))}</span>`}function Ai(e){return`<span class="status-pill ${s(e)}">${s(le(e))}</span>`}function Gr(e){return`<span class="finance-status ${s(_a(e))}">${s(e)}</span>`}function Be(e,t){if(e.avatar_url)return`<span class="${s(t)}"><img src="${s(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(n=>n[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${s(t)}">${s(a)}</span>`}function g(e){return`<div class="empty-state">${G("q-empty","empty-symbol")}<span>${s(e)}</span></div>`}function Y(e,t){const a={};return t.forEach(n=>{const r=e.get(n);r&&(a[n]=r)}),a}function Q(){i.session?.auth!=="supabase"&&(x(Lt,i.jobs),x(Nt,i.tasks),x(Ut,i.files),x(Qt,i.driveFolders),x(Ce,i.forms),x(lt,i.formResponses),x(Bt,i.financeInvoices),x(Ht,i.financePayments),x(zt,i.financeExpenses),x(Wt,i.financeVendors),x(ct,i.timeEntries),x(dt,i.activeTimer),x(Vt,i.teamMembers),x(Jt,i.memberships))}function Mi(){i.session?.auth!=="supabase"&&(x(ct,i.timeEntries),x(dt,i.activeTimer))}function $(e,t,a=""){return`<article class="metric">${G(ri(e),"metric-symbol")}<span>${s(e)}</span><strong>${s(t)}</strong>${a?`<small>${s(a)}</small>`:""}</article>`}function de(e,t){return`<div><strong>${s(e)}</strong><span>${s(t)}</span></div>`}function $e(e,t,a,n,r=""){const o=`
    <span><strong>${s(e)}</strong><small>${s(t||"Finance record")}</small></span>
    <b>${s(a)}</b>
    <em>${M(n)}</em>
  `;return r?`<a class="finance-compact-row" href="${b(r)}" data-router>${o}</a>`:`<div class="finance-compact-row">${o}</div>`}function Ta(e,t){const a=me(e);return t==="jobs"?a.filter(n=>n.job_id).length:a.filter(n=>n.folder===t).length}function xi(e="home",t=null){return t?.id?`job:${t.id}`:e||"home"}function Zr(e,t="home",a=null){const n=xi(t,a),r=xe(e).filter(o=>o.parent_key===n).map(o=>Xr(e,o));return a?r:t==="home"?Yt.map(([l,c,m,v])=>({id:l,name:c,caption:m,icon:v,href:b(d("files",{folder:l},e)),countLabel:`${Ta(e,l)} file${Ta(e,l)===1?"":"s"}`,updatedLabel:""})).concat(r):t==="jobs"?O(e).map(l=>({id:`job:${l.id}`,name:l.name,caption:l.client_name||j(e),icon:"ti-folder",href:b(d("files",{folder:"jobs",job_id:l.id},e)),countLabel:`${nt(l.id)} file${nt(l.id)===1?"":"s"}`,updatedLabel:M(l.updated_at)})).concat(r):r}function Xr(e,t){const a=xe(e).filter(o=>o.parent_key===t.id).length,n=me(e).filter(o=>o.folder===t.id).length,r=a+n;return{id:t.id,name:t.name,caption:"Custom folder",icon:"ti-folder",href:b(d("files",{folder:t.id},e)),countLabel:`${r} item${r===1?"":"s"}`,updatedLabel:M(t.updated_at)}}function eo(e,t,a=null){if(a)return`<span>/</span><a href="${b(d("files",{folder:"jobs"},e))}" data-router>Jobs</a>`;const n=xe(e).find(m=>m.id===t);if(!n)return`<span>/</span><strong>${s(ee(t))}</strong>`;const r=[];let o=n;const l=new Set;for(;o&&!l.has(o.id);)l.add(o.id),r.unshift(o),o=xe(e).find(m=>m.id===o.parent_key);return`${n.parent_key&&!n.parent_key.startsWith("folder-")&&n.parent_key!=="home"?`<span>/</span><a href="${b(d("files",{folder:n.parent_key},e))}" data-router>${s(ee(n.parent_key))}</a>`:""}${r.map((m,v)=>`<span>/</span>${v===r.length-1?`<strong>${s(m.name)}</strong>`:`<a href="${b(d("files",{folder:m.id},e))}" data-router>${s(m.name)}</a>`}`).join("")}`}function to(e=p(),t="home",a=""){const n=(i.fileQuery||i.query||"").trim().toLowerCase(),r=i.fileCategoryFilter;let o=me(e);return a?o=o.filter(l=>l.job_id===a):t&&t!=="home"&&(t==="jobs"?o=o.filter(l=>l.job_id):o=o.filter(l=>l.folder===t)),r&&r!=="All categories"&&(o=o.filter(l=>String(l.category||ee(l.folder)).toLowerCase()===r.toLowerCase())),n&&(o=o.filter(l=>[l.file_name,l.category,l.uploaded_by_label,l.notes,l.object_path,C(l.job_id)?.name].some(c=>String(c||"").toLowerCase().includes(n)))),o.sort((l,c)=>new Date(c.created_at||0)-new Date(l.created_at||0))}function ve(e){const t=String(e.mime_type||"").toLowerCase(),a=Ti(e);return t.includes("pdf")||a==="pdf"?"PDF":t.includes("image")||["png","jpg","jpeg","gif","webp","svg"].includes(a)?"Image":t.includes("zip")||["zip","rar","7z"].includes(a)?"Archive":t.includes("spreadsheet")||t.includes("excel")||["xls","xlsx","csv"].includes(a)?"Excel":t.includes("word")||["doc","docx"].includes(a)?"Word":t.includes("text")||["txt","md","json","csv","log"].includes(a)?"Text":t.includes("presentation")||["ppt","pptx"].includes(a)?"PowerPoint":a?a.toUpperCase():ee(e.folder)}function ga(e){const t=ve(e).toLowerCase();return t==="pdf"?"pdf":t==="image"?"image":t==="excel"?"sheet":t==="text"?"text":["word","powerpoint"].includes(t)?"doc":t==="archive"?"zip":"doc"}function Ti(e){return String(e.file_name||"").split(".").pop()?.toLowerCase()||""}function va(e,t=!1){const a=Ui(e);return e.signed_url?`<img src="${s(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${s(ga(e))} ${t?"large":""}"><i class="ti ${s(a)}"></i></span>`}function ao(e){const t=ve(e),a=Ti(e);return t==="Image"?a&&a.length<=4?a.toUpperCase():"IMG":t==="Archive"?a&&a.length<=3?a.toUpperCase():"ZIP":t==="Excel"?a==="csv"?"CSV":"XLS":t==="Word"?"DOC":t==="PowerPoint"?"PPT":t==="Text"?a&&a.length<=4?a.toUpperCase():"TXT":t.length<=4?t.toUpperCase():(a||"FILE").slice(0,4).toUpperCase()}function oe(e=p()){return i.forms.filter(t=>t.company_id===e)}function io(e=p()){const t=i.formQuery.trim().toLowerCase(),a=i.route?.jobId||"";return oe(e).filter(n=>a&&n.linked_job_id!==a||i.formTypeFilter!=="all"&&n.type!==i.formTypeFilter?!1:t?[n.title,n.description,n.type,n.status,n.audience,C(n.linked_job_id)?.name].some(r=>String(r||"").toLowerCase().includes(t)):!0)}function Ee(e=p()){const t=i.route?.jobId||"",a=oe(e).filter(o=>!t||o.linked_job_id===t),n=i.route?.params?.get("form_id")||"";if(n&&a.some(o=>o.id===n)&&(i.selectedFormId=n),!a.length)return i.selectedFormId="",i.selectedQuestionId="",null;let r=a.find(o=>o.id===i.selectedFormId)||a[0];return i.selectedFormId=r.id,(!i.selectedQuestionId||!r.questions.some(o=>o.id===i.selectedQuestionId))&&(i.selectedQuestionId=r.questions[0]?.id||""),r}function ye(e){return i.forms.find(t=>t.id===e)||null}function te(){return ye(i.selectedFormId)||Ee(p())}function Ei(e=p()){return i.formResponses.filter(t=>t.company_id===e)}function Ct(e){return i.formResponses.filter(t=>t.form_id===e)}function Oi(e){return Array.isArray(e?.questions)?e.questions.length:0}function no(e){const t=String(e?.creator_id||""),a=D().profile;return t?t&&(t===a.member_id||t===a.id)?a.full_name||"Quest Basic Mode":B(t):e?.created_by_label||a.full_name||"Quest HQ"}function Fe(e,t,a="",n=!1,r="text"){return`<label><span>${s(e)}</span><input data-form-field="${s(t)}" type="${s(r)}" value="${s(a)}" ${n?"required":""} /></label>`}function Ri(e,t,a=""){return`<label><span>${s(e)}</span><textarea data-form-field="${s(t)}" rows="3">${s(a)}</textarea></label>`}function Ye(e,t,a,n){return`
    <label><span>${s(e)}</span><select data-form-field="${s(t)}">
      ${n.map(([r,o])=>`<option value="${s(r)}" ${String(r)===String(a)?"selected":""}>${s(o)}</option>`).join("")}
    </select></label>
  `}function Oe(e){return["multiple","checkbox","dropdown"].includes(e.type)}function so(e){return{short:"ti-letter-t",paragraph:"ti-align-left",multiple:"ti-circle-dot",checkbox:"ti-checkbox",dropdown:"ti-select",date:"ti-calendar",rating:"ti-star",yesno:"ti-circle-check",file:"ti-paperclip"}[e]||"ti-plus"}function ro(e){return Ue.find(([t])=>t===e)?.[1]||A(e||"Question")}function X(e,t){return`
    <div class="response-question">
      <label>
        <span>${s(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${s(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function Pi(e){const t=ye(e.form_id),a=Object.entries(e.answers||{}).map(([n,r])=>{const o=t?.questions.find(c=>c.id===n),l=Array.isArray(r)?r.join(", "):r;return de(o?.label||n,l||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${s(t?.title||"Response")}</h2><p>${s(e.submitted_by||e.submitter_email||"Anonymous")} / ${M(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||de("Response","No answers captured.")}</div>
  `}function Ae(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[U("short","Inspection address"),U("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),U("paragraph","Recommended scope"),U("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[U("short","Client name"),U("yesno","Approved to proceed?"),U("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[U("short","Request title"),U("dropdown","Priority",["Low","Medium","High","Urgent"]),U("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[U("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),U("yesno","Weather safe?"),U("paragraph","Safety notes")]}]}function oo(e=p()){return Je({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:i.route?.jobId||"",theme_color:re(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[U("short","First question")]})}function U(e="short",t="Untitled question",a=[]){return $t({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function lo(e,t={}){const a=oo(e),n=Je({...a,...t,id:t.id||`form-${crypto.randomUUID()}`,company_id:e,questions:(t.questions||a.questions).map(r=>$t(r)),created_at:t.created_at||new Date().toISOString(),updated_at:new Date().toISOString()});return i.forms.unshift(n),i.selectedFormId=n.id,i.selectedQuestionId=n.questions[0]?.id||"",i.formsTab="builder",i.formEditorTab="questions",i.modal="",i.formStartTemplateId="",i.formStartTab="blank",J("New form created"),u(),n}function co(e){const t=Object.fromEntries(new FormData(e).entries()),a=t.template_id?Ae().find(l=>l.id===t.template_id):null,n=String(t.title||a?.title||"Untitled form").trim()||"Untitled form",r=String(t.description||a?.description||"").trim(),o=a?a.questions.map(l=>({...ot(l),id:`q-${crypto.randomUUID()}`})):[U("short","First question")];lo(p(),{title:n,description:r,type:Ne.includes(t.type)?t.type:a?.type||"Internal",audience:String(t.audience||"Internal").trim()||"Internal",creator_id:D().profile.member_id||D().profile.id||"basic-quest-user",linked_job_id:String(t.linked_job_id||""),theme_color:re(p()),background:"clean",submit_label:String(t.submit_label||"Submit").trim()||"Submit",collect_email:t.collect_email==="on",require_approval:t.require_approval==="on",questions:o})}function Ke(e,t=!0){const a=ye(e);a&&(i.selectedFormId=a.id,i.selectedQuestionId=a.questions[0]?.id||"",t&&u())}function J(e="Forms saved locally"){const t=te();t&&(t.updated_at=new Date().toISOString()),x(Ce,i.forms),x(lt,i.formResponses),i.sync={label:e,mode:"live"}}function Ea(e,t){const a=ye(e||i.selectedFormId);a&&(a.status=Kt.includes(t)?t:"Draft",i.selectedFormId=a.id,J(`${a.status} locally`),u())}function uo(e){const t=ye(e||i.selectedFormId);if(!t)return;const a=Je({...ot(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(n=>({...ot(n),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});i.forms.unshift(a),i.selectedFormId=a.id,i.selectedQuestionId=a.questions[0]?.id||"",J("Form duplicated"),u()}function po(e){const t=e||i.selectedFormId;t&&(i.forms=i.forms.filter(a=>a.id!==t),i.formResponses=i.formResponses.filter(a=>a.form_id!==t),i.selectedFormId=oe(p())[0]?.id||"",i.selectedQuestionId=Ee(p())?.questions[0]?.id||"",i.modal="",J("Form deleted locally"),u())}async function mo(e){const t=e||i.selectedFormId,a=`${window.location.origin}${b(d("forms",{form_id:t},p()))}`;try{await navigator.clipboard.writeText(a),i.sync={label:"Form link copied",mode:"live"}}catch{i.sync={label:"Copy failed",mode:"local"}}u()}function fo(e){const t=JSON.stringify({company_id:e,forms:oe(e),responses:Ei(e)},null,2);wo(`${e}-forms-export.json`,t,"application/json")}function Li(e){const t=te();if(!t)return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),x(Ce,i.forms))}function Ni(e){const t=te(),a=e.closest("[data-question-id]"),n=t?.questions.find(r=>r.id===a?.dataset.questionId);if(!(!t||!n)){if(i.selectedQuestionId=n.id,e.matches("[data-question-option]")){const r=Number(e.dataset.questionOption);n.options[r]=e.value}else{const r=e.dataset.questionField;if(r==="required")n.required=e.checked;else if(r==="type"){n.type=e.value,Oe(n)&&!n.options.length&&(n.options=["Option 1","Option 2"]),Oe(n)||(n.options=[]),J("Question updated"),u();return}else r&&(n[r]=e.value)}t.updated_at=new Date().toISOString(),x(Ce,i.forms)}}function bo(e="multiple"){const t=te();if(!t)return;const a=U(e,Ue.find(([n])=>n===e)?.[1]||"New question");t.questions.push(a),i.selectedQuestionId=a.id,J("Question added"),u()}function go(e){const t=te(),a=t?.questions.find(o=>o.id===e);if(!t||!a)return;const n=t.questions.findIndex(o=>o.id===e),r=$t({...ot(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(n+1,0,r),i.selectedQuestionId=r.id,J("Question duplicated"),u()}function vo(e){const t=te();t&&(t.questions=t.questions.filter(a=>a.id!==e),i.selectedQuestionId=t.questions[0]?.id||"",J("Question deleted"),u())}function yo(e,t){const a=te();if(!a||!t)return;const n=a.questions.findIndex(l=>l.id===e),r=n+t;if(n<0||r<0||r>=a.questions.length)return;const[o]=a.questions.splice(n,1);a.questions.splice(r,0,o),i.selectedQuestionId=e,J("Question moved"),u()}function _o(e){const a=te()?.questions.find(n=>n.id===e);a&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),J("Option added"),u())}function ho(e,t){const n=te()?.questions.find(r=>r.id===e);!n||t<0||(n.options.splice(t,1),n.options.length||n.options.push("Option 1"),J("Option removed"),u())}function $o(e){const t=ye(e.dataset.formId);if(!t)return;const a=new FormData(e),n={};t.questions.forEach(r=>{const o=`answer:${r.id}`,l=a.getAll(o).filter(c=>c instanceof File?c.name:String(c||"").trim());n[r.id]=l.length>1?l.map(c=>c instanceof File?c.name:c):l[0]instanceof File?l[0].name:l[0]||""}),i.formResponses.unshift(pa({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||D().profile.full_name||"Preview submitter"),answers:n,created_at:new Date().toISOString()})),i.formsTab="responses",i.modal="",J("Preview response saved"),u()}function wo(e,t,a="text/plain"){const n=new Blob([t],{type:a}),r=URL.createObjectURL(n),o=document.createElement("a");o.href=r,o.download=e,o.click(),URL.revokeObjectURL(r)}function ot(e){return JSON.parse(JSON.stringify(e))}function Z(e){return Array.from(new Set(e.map(t=>String(t||"").trim()).filter(Boolean)))}function le(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||A(e)}function He(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||A(e)}function ee(e){return Yt.find(([t])=>t===e)?.[1]||i.driveFolders.find(t=>t.id===e)?.name||A(e||"Shared")}function So(e=p()){return Yt.map(([t,a])=>[t,a]).concat(xe(e).map(t=>[t.id,t.name]))}function ko(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function Ui(e){const t=ve(e);return t==="Image"?"ti-photo":t==="PDF"?"ti-file-type-pdf":t==="Archive"?"ti-file-zip":t==="Excel"?"ti-file-spreadsheet":t==="Word"?"ti-file-type-doc":t==="PowerPoint"?"ti-file-type-ppt":t==="Text"?"ti-file-text":"ti-file-description"}function A(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function S(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function M(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function Oa(e){if(!e)return"No time";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(t)}function Ge(e){const t=Math.max(0,Math.floor(E(e)/1e3)),a=Math.floor(t/3600),n=Math.floor(t%3600/60);return a?`${a}h ${String(n).padStart(2,"0")}m`:`${n}m`}function ya(e){const t=E(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],n=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**n).toFixed(n?1:0)} ${a[n]}`}function Re(e){return(t,a)=>Date.parse(a[e]||a.updated_at||a.created_at||0)-Date.parse(t[e]||t.updated_at||t.created_at||0)}function Qi(e){if(!e)return 0;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?0:Math.floor((qt().getTime()-t.getTime())/864e5)}function Ra(e){if(!e)return 999;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?999:Math.floor((t.getTime()-qt().getTime())/864e5)}function jo(e=p()){const t=(yt(vt(e)||{short_name:e})||e||"QH").replace(/[^a-z]/gi,"").slice(0,2).toUpperCase()||"QH",a=be(e).length+1;return`${t}-${String(1e3+a)}`}function qt(){const e=new Date;return e.setHours(0,0,0,0),e}function Do(e,t){return`${Vi(e,t)}%`}function Vi(e,t){const a=E(t);return a?Math.max(0,Math.min(100,Math.round(E(e)/a*100))):0}function De(e){return{critical:5,urgent:4,high:3,medium:2,low:1}[String(e||"").toLowerCase()]||0}function _a(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function K(e,t){return e.reduce((a,n)=>a+E(n[t]),0)}function E(e){const t=Number(e);return Number.isFinite(t)?t:0}function ha(e){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(e||""))}function Pt(e){const t=String(e||"").trim();return ha(t)||/^[0-9a-f]{8,}$/i.test(t)||/^user[_-]?[0-9a-f-]{8,}$/i.test(t)}function Co(e){const t=String(e||"").trim();return t?t.slice(0,8):""}function _(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(E(e))}function ue(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function T(e,t){const a=ue(e,t);return Array.isArray(a)&&a.length?a:t}function x(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function s(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
