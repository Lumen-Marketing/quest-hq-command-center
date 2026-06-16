(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const $e={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://lpzotcznihwyyudxycmd.supabase.co",supabaseKey:"sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07"},ye=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),we="quest-hq-local-session",Oa="quest-hq-local-profile",Rt="quest-hq-job-cache-v2",Lt="quest-hq-task-cache-v1",Nt="quest-hq-file-cache-v1",Ut="quest-hq-drive-folder-cache-v1",Qt="quest-hq-team-cache-v1",Vt="quest-hq-company-membership-cache-v1",De="quest-hq-company-form-cache-v1",ot="quest-hq-company-form-response-cache-v1",Jt="quest-hq-finance-invoice-cache-v1",Bt="quest-hq-finance-payment-cache-v1",Ht="quest-hq-finance-expense-cache-v1",zt="quest-hq-finance-vendor-cache-v1",lt="quest-hq-time-entry-cache-v1",ct="quest-hq-active-timer-v1",pe="quest-hq-active-company",Ta="quest-hq-task-view",Pa="quest-hq-drive-view",ya={developer:["*"],admin:["*"],owner:["*"],manager:["jobs.view","jobs.manage","tasks.view","tasks.manage","files.view","files.manage","forms.view","forms.manage","finance.view","team.view","clock.manage","approvals.manage","approvals.view","users.view","settings.view","billing.view","roles.view"],member:["jobs.view","tasks.view","tasks.manage","files.view","forms.view","time.track","approvals.view","users.view"]},Vi=[["jobs.view","View jobs"],["jobs.manage","Create/edit jobs"],["tasks.view","View tasks"],["tasks.manage","Create/edit tasks"],["files.view","View files"],["files.manage","Upload/delete files"],["forms.view","View forms"],["forms.manage","Create/edit forms"],["crm.view","View CRM"],["finance.view","View finance"],["finance.manage","Create/edit finance"],["users.view","View users"],["users.manage","Invite/manage users"],["roles.view","View roles"],["roles.manage","Create/edit roles"],["billing.view","View billing"],["billing.manage","Manage subscription"],["settings.view","View settings"],["settings.manage","Manage settings"],["time.track","Track own time"],["clock.manage","Manage clock dashboard"],["approvals.view","View approvals"],["approvals.manage","Manage approvals"]],dt=[{id:"jobs",group:"Workspace",label:"Jobs",icon:"ti-briefcase",symbol:"q-symbol-jobs",status:"live",permission:"jobs.view"},{id:"tasks",group:"Workspace",label:"Tasks",icon:"ti-list-check",symbol:"q-symbol-tasks",status:"live",permission:"tasks.view"},{id:"files",group:"Workspace",label:"Files",icon:"ti-folder",symbol:"q-symbol-files",status:"live",permission:"files.view"},{id:"forms",group:"Workspace",label:"Forms",icon:"ti-clipboard-list",symbol:"q-symbol-forms",status:"live",permission:"forms.view"},{id:"analytics",group:"Workspace",label:"Analytics",icon:"ti-chart-bar",symbol:"q-symbol-analytics",status:"live",permission:"jobs.view"},{id:"crm",group:"Workspace",label:"CRM",icon:"ti-users-group",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"tickets",group:"Workspace",label:"Tickets",icon:"ti-ticket",symbol:"q-symbol-tickets",status:"planned"},{id:"finance",group:"Workspace",label:"Finance",icon:"ti-receipt-dollar",symbol:"q-symbol-finance",status:"live",permission:"finance.view"},{id:"knowledge",group:"Workspace",label:"Knowledge Base",icon:"ti-books",symbol:"q-symbol-knowledge",status:"planned"},{id:"automations",group:"Workspace",label:"Automations",icon:"ti-automation",symbol:"q-symbol-automations",status:"planned"},{id:"templates",group:"Workspace",label:"Templates",icon:"ti-template",symbol:"q-symbol-templates",status:"planned"},{id:"users",group:"Company",label:"Users",icon:"ti-users",symbol:"q-symbol-users",status:"live",permission:"users.view"},{id:"settings",group:"Company",label:"Settings",icon:"ti-settings",symbol:"q-symbol-settings",status:"live",permission:"settings.view"},{id:"team-chart",group:"Company",label:"Team chart",icon:"ti-hierarchy-3",symbol:"q-symbol-team-chart",status:"live",permission:"team.view"},{id:"time",group:"Operations",label:"My time",icon:"ti-clock",symbol:"q-symbol-time",status:"live",permission:"time.track"},{id:"approvals",group:"Operations",label:"Approvals",icon:"ti-user-check",symbol:"q-symbol-approvals",status:"live",permission:"approvals.view"},{id:"team-workload",group:"Operations",label:"Team workload",icon:"ti-users",symbol:"q-symbol-team-workload",status:"planned"},{id:"clock",group:"Operations",label:"Clock dashboard",icon:"ti-clock-hour-4",symbol:"q-symbol-clock",status:"live",permission:"clock.manage"}],Ji={"/admin.html":"settings","/automations.html":"automations","/crm.html":"crm","/dashboards.html":"analytics","/files.html":"files","/finance.html":"finance","/forms.html":"forms","/jobs.html":"jobs","/knowledge.html":"knowledge","/templates.html":"templates","/tickets.html":"tickets"},Pe=["Lead","Site Review","Estimate","Approved","Active","Closed"],Ra=["pipeline","list","profile"],Re=["todo","pending","hold","review","done"],Xe=["critical","urgent","high","medium","low"],La=["lead","bid","admin","invoicing","ar","meeting","web_dev"],Bi=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],Wt=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],Le=["Inspection","Client approval","Intake","Survey","Safety","Internal"],Yt=["Draft","Published","Archived"],Na=["Draft","Sent","Partially paid","Paid","Overdue","Void"],Ua=["Pending","Approved","Paid","Rejected"],Qa=["Active","On hold","Inactive"],Va=["ACH","Check","Card","Cash","Wire","Other"],ut=["Materials","Labor","Subcontractor","Permit","Equipment","Marketing","Software","Travel","Other"],Ne=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],Ue=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],Ja=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],Ba=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"],supervisor_id:""},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"],supervisor_id:"abraham"},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"],supervisor_id:"maya"},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"],supervisor_id:"abraham"},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"],supervisor_id:""}],Ha=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],za=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:w(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:w(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:w(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:w(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:w(5),priority:"medium",urgency:"medium",status:"todo"}],Wa=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],Ya=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",creator_id:"abraham",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",creator_id:"maya",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",creator_id:"noah",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",creator_id:"lumen-ops",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],Ka=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],Ga=[{id:"vendor-roofing-materials",company_id:"roofing",name:"Valley Roofing Supply",contact_name:"Elena Ortiz",email:"orders@valleyroofingsupply.local",phone:"(480) 555-0190",category:"Materials",status:"Active",notes:"Primary tile, flashing, and underlayment vendor.",created_at:new Date(Date.now()-12096e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"vendor-roofing-dryin",company_id:"roofing",name:"Monsoon Dry-In Crew",contact_name:"R. Alvarez",email:"dispatch@monsoondryin.local",phone:"(602) 555-0144",category:"Subcontractor",status:"Active",notes:"Emergency dry-in support during storm calls.",created_at:new Date(Date.now()-10368e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"vendor-drafting-permits",company_id:"drafting",name:"Permit Runner AZ",contact_name:"Sofia Chen",email:"permits@runneraz.local",phone:"(602) 555-0171",category:"Permit",status:"Active",notes:"Permit filing support for drafting packets.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString()},{id:"vendor-lumen-software",company_id:"lumen",name:"Lumen SaaS Stack",contact_name:"Ops Billing",email:"billing@lumenstack.local",phone:"",category:"Software",status:"Active",notes:"Internal software subscriptions for client onboarding.",created_at:new Date(Date.now()-7776e5).toISOString(),updated_at:new Date(Date.now()-3456e5).toISOString()}],Za=[{id:"invoice-roofing-queen-creek",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",client_name:"Rosales Residence",invoice_number:"QR-1007",status:"Partially paid",issue_date:w(-10),due_date:w(5),subtotal:6800,tax:0,total:6800,notes:"Emergency leak repair billing with deposit received.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"invoice-roofing-mesa-storage",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",client_name:"Mesa Storage Partners",invoice_number:"QR-1008",status:"Sent",issue_date:w(-18),due_date:w(-2),subtotal:18400,tax:0,total:18400,notes:"Estimate packet sent to board for approval.",created_at:new Date(Date.now()-15552e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-drafting-horizon",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",client_name:"Horizon HVAC",invoice_number:"QD-2031",status:"Sent",issue_date:w(-7),due_date:w(14),subtotal:4200,tax:0,total:4200,notes:"Drafting permit package milestone invoice.",created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-lumen-onboarding",company_id:"lumen",job_id:"",client_name:"Lumen Internal Launch",invoice_number:"LM-3004",status:"Draft",issue_date:w(-3),due_date:w(27),subtotal:3200,tax:0,total:3200,notes:"Demo onboarding package used for finance workspace.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()}],Xa=[{id:"payment-roofing-queen-creek-deposit",company_id:"roofing",invoice_id:"invoice-roofing-queen-creek",amount:2500,method:"ACH",received_at:w(-4),reference:"ACH-4421",notes:"Deposit received after dry-in visit.",created_at:new Date(Date.now()-3456e5).toISOString()},{id:"payment-drafting-horizon-retainer",company_id:"drafting",invoice_id:"invoice-drafting-horizon",amount:1e3,method:"Check",received_at:w(-1),reference:"CHK-117",notes:"Retainer collected before permit packet completion.",created_at:new Date(Date.now()-864e5).toISOString()}],ei=[{id:"expense-roofing-queen-creek-materials",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",vendor_id:"vendor-roofing-materials",category:"Materials",amount:1850,status:"Approved",spent_at:w(-6),notes:"Underlayment, flashing, and tile replacement materials.",created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-roofing-mesa-permit",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",vendor_id:"vendor-roofing-materials",category:"Permit",amount:620,status:"Pending",spent_at:w(-2),notes:"Permit and document prep allowance.",created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString()},{id:"expense-drafting-horizon-runner",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",vendor_id:"vendor-drafting-permits",category:"Permit",amount:480,status:"Approved",spent_at:w(-3),notes:"Permit runner package review.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-lumen-software-stack",company_id:"lumen",job_id:"",vendor_id:"vendor-lumen-software",category:"Software",amount:540,status:"Paid",spent_at:w(-5),notes:"Client onboarding software stack.",created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()}],i={route:null,session:de(we,null),profileDraft:de(Oa,null),authReady:!1,authMode:"signin",jobs:x(Rt,Ja).map(Se),tasks:x(Lt,za).map(ke),files:x(Nt,Wa).map(xe),driveFolders:x(Ut,[]).map(ca),forms:x(De,Ya).map(Je),formResponses:x(ot,Ka).map(da),financeInvoices:x(Jt,Za).map($t),financePayments:x(Bt,Xa).map(wt),financeExpenses:x(Ht,ei).map(St),financeVendors:x(zt,Ga).map(kt),timeEntries:de(lt,[]),activeTimer:de(ct,null),teamMembers:x(Qt,Ba).map(ua),memberships:x(Vt,Ha),profiles:[],subscriptions:[],roles:[],rolePermissions:[],roleAssignments:[],resourceAcl:[],fieldPermissions:[],companyInvites:[],joinRequests:[],auditEvents:[],companies:ki(Ue.map(Ve)),activeCompanyId:localStorage.getItem(pe)||"",selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",selectedFinanceInvoiceId:"",selectedFinanceExpenseId:"",selectedFinanceVendorId:"",expandedFormIds:new Set,formStartTemplateId:"",formStartTab:"blank",query:"",fileQuery:"",formQuery:"",crmQuery:"",stageFilter:"all",crmStageFilter:"all",crmOwnerFilter:"all",taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(Ta)||"table",driveFolder:"home",driveView:localStorage.getItem(Pa)||"list",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",authMessage:"",modal:"",accountMenuOpen:!1},pt=document.getElementById("app");let Ct=null;Hi();function Hi(){nr(),window.addEventListener("popstate",p),document.addEventListener("click",Fs),document.addEventListener("submit",Ms),document.addEventListener("input",Us),document.addEventListener("change",Qs),zi(),p()}async function zi(){if(i.session?.auth==="local-basic"){ti(),i.authReady=!0;return}const e=L();if(!e?.auth){i.authReady=!0,i.loginError="Supabase auth is unavailable in this browser session.";return}try{const{data:t}=await e.auth.getSession();await Ae(t?.session||null),e.auth.onAuthStateChange((a,n)=>{Ae(n||null).finally(()=>{i.dataLoaded=!1,p()})})}catch(t){i.loginError=t.message||"Unable to initialize Supabase auth."}finally{i.authReady=!0,p()}}async function Ae(e){if(!e?.user){i.session=null,localStorage.removeItem(we);return}const t=await Wi(e.user);i.session=Or(e,t),en(),M(we,i.session)}async function Wi(e){const t={id:e.id,email:e.email||"",full_name:e.user_metadata?.full_name||e.email||"Quest user",role:"member",role_label:"Member",member_id:"",company_ids:[],avatar_url:"",approved:!1},a=L();if(!a)return t;const n=await a.from("profiles").select("*").eq("id",e.id).maybeSingle();return n.error||!n.data?t:pa(n.data,t)}function p(){if(i.route=mt(),!i.authReady){Gi();return}if(Ki(i.route)){k("/login?return_url="+encodeURIComponent(rr()),{replace:!0});return}if(i.route.name==="login"){gs();return}if(Zi(),i.session?.auth==="supabase"&&i.dataLoaded&&!qe().length){Yi();return}const e=sr(i.route);if(e){k(e,{replace:!0});return}ur(i.route),ci(i.route),i.route.params.get("account")==="profile"&&(i.modal="profile"),document.title=`${or(i.route)} | ${j(u())} | Quest HQ`,pt.innerHTML=an(i.route,ni(i.route))}function Yi(){document.title="Company access pending | Quest HQ",pt.innerHTML=`
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
  `}function Ki(e){return e.name==="login"?!1:!i.session}function Gi(){document.title="Loading | Quest HQ",pt.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${g("Checking secure session...")}
      </section>
    </main>
  `}function Zi(){i.dataLoaded||i.dataLoading||(i.dataLoading=!0,Xi().catch(()=>{i.sync={label:"Local fallback",mode:"local"}}).finally(()=>{i.dataLoaded=!0,i.dataLoading=!1,V(),p()}))}async function Xi(){if(i.session?.auth==="local-basic"){i.sync={label:"Demo mode",mode:"local"};return}const e=L();if(!e){i.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,n,s,o,l,c,m,v,f,h,R,q,H,Ce,le]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*"),e.from("profiles").select("*"),e.from("company_subscriptions").select("*"),e.from("roles").select("*").order("priority",{ascending:!1}),e.from("role_permissions").select("*"),e.from("user_role_assignments").select("*"),e.from("resource_acl").select("*"),e.from("field_permissions").select("*"),e.from("company_invites").select("*").order("created_at",{ascending:!1}),e.from("company_join_requests").select("*").order("created_at",{ascending:!1}),e.from("audit_events").select("*").order("created_at",{ascending:!1}).limit(100)]);let W=0;t.error||(i.companies=(t.data||[]).map(Ve),W+=1),a.error||(i.jobs=(a.data||[]).map(Se),W+=1),n.error||(i.tasks=(n.data||[]).map(ke),W+=1),s.error||(i.files=(s.data||[]).map(xe),W+=1),o.error||(i.teamMembers=(o.data||[]).map(ua),W+=1),l.error||(i.memberships=(l.data||[]).map(st),W+=1),c.error||(i.profiles=(c.data||[]).map(Qi=>pa(Qi)),W+=1),m.error||(i.subscriptions=(m.data||[]).map(Sr),W+=1),v.error||(i.roles=(v.data||[]).map(_e),W+=1),f.error||(i.rolePermissions=(f.data||[]).map(Ot)),h.error||(i.roleAssignments=(h.data||[]).map(ji)),R.error||(i.resourceAcl=(R.data||[]).map(kr)),q.error||(i.fieldPermissions=(q.data||[]).map(jr)),H.error||(i.companyInvites=(H.data||[]).map(Dr)),Ce.error||(i.joinRequests=(Ce.data||[]).map(Di)),le.error||(i.auditEvents=le.data||[]),i.sync=W?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function L(){return!window.supabase||typeof window.supabase.createClient!="function"?null:(Ct||(Ct=window.supabase.createClient($e.supabaseUrl,$e.supabaseKey)),Ct)}function en(){i.jobs=[],i.tasks=[],i.files=[],i.driveFolders=[],i.forms=[],i.formResponses=[],i.financeInvoices=[],i.financePayments=[],i.financeExpenses=[],i.financeVendors=[],i.timeEntries=[],i.activeTimer=null,i.teamMembers=[],i.memberships=[],i.profiles=[],i.subscriptions=[],i.roles=[],i.rolePermissions=[],i.roleAssignments=[],i.resourceAcl=[],i.fieldPermissions=[],i.companyInvites=[],i.joinRequests=[],i.auditEvents=[],i.companies=[],i.sync={label:"Loading secure workspace...",mode:"loading"}}function ti(){i.jobs=x(Rt,Ja).map(Se),i.tasks=x(Lt,za).map(ke),i.files=x(Nt,Wa).map(xe),i.driveFolders=x(Ut,[]).map(ca),i.forms=x(De,Ya).map(Je),i.formResponses=x(ot,Ka).map(da),i.financeInvoices=x(Jt,Za).map($t),i.financePayments=x(Bt,Xa).map(wt),i.financeExpenses=x(Ht,ei).map(St),i.financeVendors=x(zt,Ga).map(kt),i.timeEntries=de(lt,[]),i.activeTimer=de(ct,null),i.teamMembers=x(Qt,Ba).map(ua),i.memberships=x(Vt,Ha),i.profiles=[],i.subscriptions=[],i.roles=[],i.rolePermissions=[],i.roleAssignments=[],i.resourceAcl=[],i.fieldPermissions=[],i.companyInvites=[],i.joinRequests=[],i.auditEvents=[],i.companies=ki(Ue.map(Ve)),i.sync={label:"Demo mode",mode:"local"}}function tn(){return`
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
  `}function G(e,t="symbol-icon"){return`<svg class="${r(t)}" aria-hidden="true" focusable="false"><use href="#${r(e)}"></use></svg>`}function ai(e=i.route?.section||"jobs"){return dt.find(t=>t.id===e)?.symbol||"q-empty"}function ii(e){const t=String(e||"").toLowerCase();return t.includes("job")||t.includes("pipeline")?"q-symbol-jobs":t.includes("task")||t.includes("review")?"q-symbol-tasks":t.includes("file")?"q-symbol-files":t.includes("form")?"q-symbol-forms":t.includes("account")||t.includes("customer")||t.includes("member")||t.includes("user")||t.includes("lead")?"q-symbol-crm":t.includes("invoice")||t.includes("collected")||t.includes("expense")||t.includes("net")||t.includes("outstanding")?"q-symbol-finance":t.includes("time")||t.includes("today")||t.includes("days")||t.includes("timer")||t.includes("entries")?"q-symbol-clock":t.includes("approval")||t.includes("access")?"q-symbol-approvals":ai()}function an(e,t){const a=C(),n=u();return`
    <div class="quest-app" data-route="${r(e.name)}">
      ${tn()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${b(d("jobs",{},n))}" data-router aria-label="Quest HQ workspace">
            ${G("q-logo","brand-symbol")}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${r($e.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${G("q-company")}
            <select data-company-switch aria-label="Active company">
              ${wi().map(s=>`<option value="${r(s.id)}" ${s.id===n?"selected":""}>${r(vt(s))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            ${G("q-search")}
            <input data-global-search value="${r(i.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${r(i.sync.mode)}" data-sync-state>${r(i.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          <div class="account-menu ${i.accountMenuOpen?"open":""}">
            <button class="avatar-button" type="button" data-action="toggle-account-menu" aria-label="Open account menu" aria-expanded="${i.accountMenuOpen?"true":"false"}">
              ${Be(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${r(a.profile.full_name)}</strong>
              <span>${r(a.profile.role_label)} - ${r(j(n))}</span>
              <button type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
              <button type="button" data-action="sign-out"><i class="ti ti-logout"></i>Sign out</button>
            </div>
          </div>
        </div>
      </header>
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${nn(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
    </div>
    ${hs(e,a)}
  `}function nn(e){const t=u();return`
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${r(se(t))}">${G("q-company")}</span>
      <div>
        <strong>${r(j(t))}</strong>
        <small>${r(yt(t))} workspace</small>
      </div>
    </div>
    ${["Workspace","Company","Operations"].map(a=>sn(a,dt.filter(n=>n.group===a&&ln(n,t)).map(n=>n.status==="planned"?on(n.symbol,n.label):rn(e,d(n.id,{},t),n.symbol,n.label,cn(n.id,t))))).join("")}
  `}function sn(e,t){return`
    <section class="side-group">
      <div class="side-label">${r(e)}</div>
      <div class="side-items">${t.join("")}</div>
    </section>
  `}function rn(e,t,a,n,s=""){return`
    <a class="side-item ${lr(e,t)?"active":""}" href="${b(t)}" data-router>
      ${G(a)}
      <span>${r(n)}</span>
      ${s!==""?`<b>${r(String(s))}</b>`:""}
    </a>
  `}function on(e,t){return`
    <button class="side-item planned" type="button" disabled aria-disabled="true">
      ${G(e)}
      <span>${r(t)}</span>
      <b>Planned</b>
    </button>
  `}function ln(e,t=u()){return e.status==="planned"?!0:!la(t)&&!["settings","users"].includes(e.id)?!1:ra(e.permission||`${e.id}.view`,t)}function cn(e,t=u()){return e==="jobs"?O(t).length:e==="tasks"?z(t).length:e==="files"?me(t).length:e==="forms"?re(t).length:e==="crm"?ft(t).length:e==="finance"?fe(t).length:e==="users"?ne(t).length:e==="time"?mi(t).focus.length:e==="approvals"?fi(t).length:e==="clock"&&bt(t)?"On":""}function Kt(e,t){return`
    <nav class="tabbar compact-tabbar" aria-label="${r(e)}">
      ${t.map(([a,n,s])=>`<a class="${s?"active":""}" href="${b(a)}" data-router>${r(n)}</a>`).join("")}
    </nav>
  `}function ni(e){if(e.name==="command")return pn(u());if(e.name!=="company")return ka(e.name);const t=e.companyId,a=dt.find(n=>n.id===e.section);if(a?.status!=="planned"){if(!la(t)&&!["settings","users"].includes(e.section))return dn(t);if(a?.permission&&!ra(a.permission,t))return un(t,a.permission)}return e.section==="jobs"?fn(e,t):e.section==="tasks"?_n(e,t):e.section==="files"?kn(e,t):e.section==="users"?Pn(e,t):e.section==="settings"?Un(e,t):e.section==="forms"?Bn(t):e.section==="analytics"?mn(e,t):e.section==="crm"?is(e,t):e.section==="finance"?ss(e,t):e.section==="team-chart"?Nn(t):e.section==="time"||e.section==="approvals"||e.section==="clock"?ps(e,t):ka(e.section)}function dn(e){return`
    ${Q("Subscription required","This company workspace needs an active or trialing subscription before paid modules can open.",`
      <a class="btn btn-primary" href="${b(d("settings",{tab:"billing"},e))}" data-router><i class="ti ti-credit-card"></i>Billing</a>
    `)}
    <section class="panel">
      ${N([["Company",j(e)],["Subscription",Si(e)],["Allowed area","Billing and settings remain available to owners/admins"]])}
    </section>
  `}function un(e,t){return`
    ${Q("Access denied","Your role does not include the permission required for this module.",`
      <a class="btn" href="${b(d("settings",{tab:"roles"},e))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${N([["Company",j(e)],["Required permission",t],["Your role",yt(e)]])}
    </section>
  `}function pn(e){const t=O(e),a=z(e),n=a.filter(o=>["critical","urgent"].includes(o.priority)),s=me(e);return`
    ${Q("Company dashboard","Live context for this company workspace.",`
      <a class="btn" href="${b(d("files",{},e))}" data-router><i class="ti ti-folder"></i>Open drive</a>
      <a class="btn btn-primary" href="${b(d("jobs",{},e))}" data-router><i class="ti ti-briefcase"></i>Open jobs</a>
    `)}
    ${Tr([["Jobs",t.length],["Open tasks",a.filter(o=>o.status!=="done").length],["Urgent tasks",n.length],["Drive files",s.length]])}
    <section class="dashboard-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Priority work</h2><p>Tasks and jobs filtered by the active company.</p></div>
          <a class="btn" href="${b(d("tasks",{},e))}" data-router>Open tasks</a>
        </div>
        <div class="queue-list">
          ${a.slice(0,6).map(o=>jt(o)).join("")||g("No tasks in this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Company scope</h2><p>Client-side filtering while auth is disabled.</p></div></div>
        ${N([["Company",j(e)],["Visible users",ne(e).length],["Auth mode","Supabase auth"],["RLS status","Ready for enforcement"]])}
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Job queue</h2><p>Workspace records without leaving the Quest shell.</p></div></div>
        <div class="queue-list">
          ${t.slice(0,8).map(o=>Pr(o)).join("")||g("No jobs in this company yet.")}
        </div>
      </article>
    </section>
  `}function mn(e,t){const a=e.jobId?D(e.jobId):null,n=a?[a]:O(t),s=z(t).filter(f=>!a||f.project_id===a.id),o=me(t).filter(f=>!a||f.job_id===a.id),l=re(t).filter(f=>!a||f.linked_job_id===a.id),c=s.filter(f=>f.status!=="done"),m=s.filter(f=>f.status!=="done"&&f.due&&new Date(f.due)<qt()),v=K(n,"estimate_total");return`
    <section class="analytics-workspace">
      <section class="analytics-toolbar panel">
        <div>
          <strong>Analytics</strong>
          <span>${r(a?a.name:j(t))}</span>
        </div>
        <label>
          <span>Job</span>
          <select data-analytics-job-filter>
            <option value="">All jobs</option>
            ${O(t).map(f=>`<option value="${r(f.id)}" ${a?.id===f.id?"selected":""}>${r(f.name)}</option>`).join("")}
          </select>
        </label>
        <a class="btn" href="${b(d("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      </section>
      <section class="analytics-grid">
        <article class="panel analytics-score">
          <span>Open work</span>
          <strong>${r(c.length)}</strong>
          <small>${r(m.length)} overdue / ${r(s.filter(f=>f.priority==="urgent"||f.priority==="critical").length)} urgent</small>
        </article>
        <article class="panel analytics-score">
          <span>Pipeline value</span>
          <strong>${r(y(v))}</strong>
          <small>${r(n.length)} visible job${n.length===1?"":"s"}</small>
        </article>
        <article class="panel analytics-score">
          <span>Drive and forms</span>
          <strong>${r(o.length+l.length)}</strong>
          <small>${r(o.length)} files / ${r(l.length)} forms</small>
        </article>
        <article class="panel analytics-score">
          <span>Completion</span>
          <strong>${r(fo(s.filter(f=>f.status==="done").length,s.length))}</strong>
          <small>${r(s.filter(f=>f.status==="done").length)} done of ${r(s.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${n.map(f=>`
              <a class="analytics-row" href="${b(d("analytics",{job_id:f.id},t))}" data-router>
                <span><strong>${r(f.name)}</strong><small>${r(f.client_name||j(t))}</small></span>
                <span>${r(f.stage)}</span>
                <span>${r(_t(f.id))}</span>
                <span>${r(nt(f.id))}</span>
                <span>${r(y(f.estimate_total))}</span>
              </a>
            `).join("")||g("No jobs to analyze yet.")}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${Re.map(f=>{const h=s.filter(R=>R.status===f).length;return`<div><span>${r(oe(f))}</span><b><i style="width:${r(Ni(h,s.length))}%"></i></b><strong>${r(h)}</strong></div>`}).join("")}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${s.filter(f=>f.status!=="done").sort((f,h)=>je(h.priority)-je(f.priority)).slice(0,8).map(f=>jt(f)).join("")||g("No open tasks in this scope.")}
          </div>
        </article>
      </section>
    </section>
  `}function fn(e,t){const a=cr(e.params.get("tab")),n=ue();return`
    ${Q("Jobs","Company job records, clients, scope, and linked work.",`
      <a class="btn" href="${b(d("files",n?{job_id:n.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <section class="job-toolbar">
      <label>
        <span>Stage</span>
        <select data-stage-filter>
          ${["all"].concat(Pe).map(s=>`<option value="${r(s)}" ${i.stageFilter===s?"selected":""}>${r(s==="all"?"All stages":s)}</option>`).join("")}
        </select>
      </label>
      <div class="selected-job-chip">
        <span>Selected job</span>
        <strong>${n?r(n.name):"No job selected"}</strong>
      </div>
    </section>
    <nav class="tabbar" aria-label="Job sections">
      ${Ra.map(s=>`<a class="${s===a?"active":""}" href="${b(d("jobs",{tab:s,...n?{job_id:n.id}:{}},t))}" data-router>${r(dr(s))}</a>`).join("")}
    </nav>
    ${bn(a,t,n)}
  `}function bn(e,t,a){return e==="pipeline"?_a(t):e==="list"?gn(t):e==="profile"?vn(t,a):_a(t)}function _a(e){const t=pi(e);return`
    <section class="job-board">
      ${Pe.map(a=>{const n=t.filter(s=>s.stage===a);return`
          <article class="job-lane">
            <h2><span>${r(a)}</span><b>${n.length}</b></h2>
            ${n.map(s=>Rr(s)).join("")||'<div class="lane-empty">No jobs</div>'}
          </article>
        `}).join("")}
    </section>
  `}function gn(e){const t=pi(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Job list</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Tasks</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===i.selectedJobId?"active":""}" type="button" data-select-job="${r(a.id)}">
            <span><strong>${r(a.name)}</strong><small>${r(a.client_name||"No client")} - ${r(a.site_address||"No address")}</small></span>
            <span>${r(a.stage)}</span>
            <span>${ma(a.priority)}</span>
            <span>${r(a.owner_name||"Unassigned")}</span>
            <span>${r(_t(a.id))}</span>
            <span>${y(a.estimate_total)}</span>
          </button>
        `).join("")||g("No jobs match this view.")}
      </div>
    </section>
  `}function vn(e,t){return t?`
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${r(j(e))} - ${r(t.job_type)}</span>
          <h2>${r(t.name)}</h2>
          <p>${r(t.scope||"No scope written yet.")}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${N([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",y(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${b(d("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(t.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${We(d("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${_t(t.id)} linked tasks`)}
          ${We(d("files",{job_id:t.id},e),"ti-folder","Files",`${nt(t.id)} files`)}
          ${We(d("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${We(d("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:g("Create a job to see the profile workspace.")}function yn(e,t){const a=t||qr(e);return`
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${S("Workspace name","name",a.name,!0)}
      ${P("Company","company_id",e,wi().map(n=>[n.id,vt(n)]))}
      ${S("Client","client_name",a.client_name)}
      ${S("Contact","contact_name",a.contact_name)}
      ${S("Account owner","owner_name",a.owner_name)}
      ${S("Job type","job_type",a.job_type||"Roofing")}
      ${P("Business status","stage",a.stage||"Lead",Pe.map(n=>[n,n]))}
      ${P("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(n=>[n,n]))}
      ${S("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${S("Invoice total","invoice_total",a.invoice_total||0,!1,"number")}
      ${S("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${ie("Scope","scope",a.scope,"span-2")}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function _n(e,t){const a=e.jobId?D(e.jobId):null,n=wr(t,a?.id);return`
    ${Q(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${b(d("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${b(d("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${hn(t,a)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${i.taskView==="board"?wn(t,n):$n(t,n)}
      </article>
    </section>
  `}function hn(e,t){return`
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${O(e).map(n=>`<option value="${r(n.id)}" ${t?.id===n.id?"selected":""}>${r(n.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${["all"].concat(Re).map(n=>`<option value="${r(n)}" ${i.taskStatusFilter===n?"selected":""}>${r(n==="all"?"All statuses":oe(n))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(Xe).map(n=>`<option value="${r(n)}" ${i.taskPriorityFilter===n?"selected":""}>${r(n==="all"?"All priorities":F(n))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${i.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${i.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function $n(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===i.selectedTaskId?"active":""}" type="button" data-select-task="${r(a.id)}">
          <span><strong>${r(a.title)}</strong><small>${r(a.description||He(a.type))}</small></span>
          <span>${r(D(a.project_id)?.name||"Company task")}</span>
          <span>${r(B(a.assignee_id))}</span>
          <span>${qi(a.priority)}</span>
          <span>${Ci(a.status)}</span>
          <span>${T(a.due)}</span>
        </button>
      `).join("")||g("No tasks match this workspace view.")}
    </div>
  `}function wn(e,t){return`
    <div class="task-board">
      ${Re.map(a=>{const n=t.filter(s=>s.status===a);return`
          <section class="task-column">
            <h2><span>${r(oe(a))}</span><b>${n.length}</b></h2>
            ${n.map(s=>`
              <button class="task-card priority-${r(s.priority)}" type="button" data-select-task="${r(s.id)}">
                <strong>${r(s.title)}</strong>
                <span>${r(D(s.project_id)?.name||j(e))}</span>
                <small>${r(B(s.assignee_id))} - ${T(s.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function Sn(e,t){return t?`
    <div class="section-head">
      <div><h2>${r(t.title)}</h2><p>${r(D(t.project_id)?.name||j(e))}</p></div>
      <a class="btn" href="${b(d("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${N([["Status",oe(t.status)],["Priority",F(t.priority)],["Type",He(t.type)],["Assignee",B(t.assignee_id)],["Due",T(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${r(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${g("No task selected.")}
    `}function ha(e,t,a){const n=a||Cr(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${r(a?n.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${S("Task title","title",n.title,!0)}
      ${P("Job","project_id",n.project_id||"",[["","Company-level task"]].concat(O(e).map(s=>[s.id,s.name])))}
      ${P("Status","status",n.status,Re.map(s=>[s,oe(s)]))}
      ${P("Priority","priority",n.priority,Xe.map(s=>[s,F(s)]))}
      ${P("Type","type",n.type,La.map(s=>[s,He(s)]))}
      ${P("Assignee","assignee_id",n.assignee_id,ne(e).map(s=>[s.id,B(s.id)]))}
      ${S("Due date","due",n.due||w(1),!0,"date")}
      ${ie("Description","description",n.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${r(a.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function kn(e,t){const a=e.params.get("folder")||i.driveFolder||"home";i.driveFolder=a;const n=e.jobId?D(e.jobId):null,s=Vr(t,a,n?.id||"");return`
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${r(n?n.name:"Company Drive")}</strong>
              <small>${r(n?`${n.client_name||j(t)} file workspace`:`${j(t)} file manager`)}</small>
            </div>
          </div>
          <label class="drive-search">
            <i class="ti ti-search"></i>
            <input data-file-search value="${r(i.fileQuery)}" placeholder="Search drive" />
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
                <a href="${b(d("files",{},t))}" data-router>${r(j(t))}</a>
                ${a!=="home"?Qr(t,a,n):""}
                ${n?`<span>/</span><strong>${r(n.name)}</strong>`:""}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${i.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${i.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${jn(t,a,n,s)}
          </div>
        </div>
      </section>
    </section>
  `}function jn(e,t,a,n){const s=Nr(e,t,a),o=s.map(c=>({kind:"folder",...c})).concat(n.map(c=>({kind:"file",file:c}))),l=a?a.name:t==="home"?"This folder":ee(t);return`
    <section class="drive-section-title">
      <div><h3>${r(l)}</h3><span>${s.length} folder${s.length===1?"":"s"} / ${n.length} file${n.length===1?"":"s"}</span></div>
    </section>
    ${i.driveView==="list"?Dn(o):qn(o)}
  `}function Dn(e){return`
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${e.map(t=>t.kind==="folder"?Fn(t):In(t.file)).join("")||g("This folder is empty.")}
    </div>
  `}function qn(e){return`
    <section class="drive-folder-grid explorer-grid">
      ${e.map(t=>t.kind==="folder"?Cn(t):Mn(t.file)).join("")||g("This folder is empty.")}
    </section>
  `}function Cn(e){return`
    <a class="drive-folder-card explorer-folder" href="${r(e.href)}" data-router>
      <span class="drive-folder-icon"><i class="ti ${r(e.icon||"ti-folder")}"></i></span>
      <strong>${r(e.name)}</strong>
      <em>${r(e.countLabel||"0 items")}</em>
    </a>
  `}function Fn(e){return`
    <a class="explorer-row folder-row-live" href="${r(e.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder"><i class="ti ${r(e.icon||"ti-folder")}"></i></span><strong>${r(e.name)}</strong></span>
      <span>${r(e.updatedLabel||"")}</span>
      <span>Folder</span>
      <span>${r(e.countLabel||"")}</span>
    </a>
  `}function In(e){return`
    <button type="button" class="explorer-row ${e.id===i.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}" role="row">
      <span class="explorer-name">${An(e)}<strong>${r(e.file_name)}</strong></span>
      <span>${T(e.updated_at||e.created_at)}</span>
      <span>${r(ge(e))}</span>
      <span>${ga(e.size_bytes)}</span>
    </button>
  `}function An(e){return`
    <span class="file-type ${r(fa(e))}">
      <i class="ti ${r(Ri(e))}"></i>
      <small>${r(Jr(e))}</small>
    </span>
  `}function Mn(e){return`
    <button type="button" class="file-card-live ${e.id===i.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}">
      <span class="file-thumb">${ba(e)}</span>
      <strong>${r(e.file_name)}</strong>
      <span>${r(ge(e))} / ${ga(e.size_bytes)}</span>
    </button>
  `}function xn(e,t){return`
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${En(e)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${ba(e)}
          <div>
            <strong>${r(e.file_name)}</strong>
            <span>${r(ge(e))} / ${ga(e.size_bytes)}</span>
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
  `}function En(e){const t=fa(e);return e.signed_url&&t==="image"?`<img class="file-preview-media" src="${r(e.signed_url)}" alt="" />`:e.signed_url&&t==="pdf"?`<iframe class="file-preview-frame" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:e.signed_url&&t==="text"?`<iframe class="file-preview-frame text" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:["doc","sheet"].includes(t)&&e.signed_url?`<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:`
    <div class="file-preview-empty">
      ${ba(e,!0)}
      <strong>${r(ge(e))} preview</strong>
      <p>${r(e.object_path?"Preview will load when a signed file URL is available.":"This is a metadata-only file record. Upload the actual file object to preview it here.")}</p>
      ${e.notes?`<pre>${r(e.notes)}</pre>`:""}
    </div>
  `}function On(){const e=u(),t=i.route||mt(),a=t.params.get("folder")||i.driveFolder||"home",n=t.jobId?D(t.jobId):null;return I("Drive","New folder",`
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${r(e)}" />
      <input type="hidden" name="parent_key" value="${r(Ii(a,n))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${r(a==="home"?j(e):n?.name||ee(a))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"task-modal")}function Tn(){const e=u(),t=i.route?.params?.get("folder")||(i.driveFolder==="home"?"shared":i.driveFolder),a=i.route?.jobId||"";return`
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">${r(j(e))} Drive</div><h2 id="upload-title">Upload files</h2></div>
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
          ${S("Metadata-only file name","file_name","")}
          ${P("Folder","folder",t,uo(e))}
          ${P("Job","job_id",a,[["","Company shared file"]].concat(O(e).map(n=>[n.id,n.name])))}
          ${P("Category","category",ee(t),Bi.filter(n=>n!=="All categories").map(n=>[n,n]))}
          ${S("Uploaded by","uploaded_by_label",C().profile.full_name||"Quest HQ")}
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
  `}function Pn(e,t){const a=gr(t),n=["members","access"].includes(e.params.get("tab"))?e.params.get("tab"):"members",s=i.joinRequests.filter(l=>l.company_id===t&&l.status==="pending"),o=ra("users.manage",t);return`
    ${Q("Users","Company members, roles, workers, and access context.",`
      <a class="btn" href="${b(d("settings",{tab:"roles"},t))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      <a class="btn btn-primary" href="${b(d("settings",{tab:"access"},t))}" data-router><i class="ti ti-settings"></i>Access settings</a>
    `)}
    ${Kt("Users sections",[[d("users",{tab:"members"},t),"Members",n==="members"],[d("users",{tab:"access"},t),"Access",n==="access"]])}
    ${n==="members"?`
      <section class="metric-grid operations-metrics">
        ${$("Active users",a.filter(l=>l.status==="active").length)}
        ${$("Pending",a.filter(l=>l.status!=="active").length+s.length)}
        ${$("Roles",Qe(t).length)}
      </section>
      <section class="users-grid">
        ${a.map(l=>`
          <article class="user-card ${l.status!=="active"?"muted":""}">
            ${Be({full_name:et(l),email:l.email,avatar_url:l.avatar_url},"avatar")}
            <div>
              <strong>${r(et(l))}</strong>
              <span>${r(si(l))}</span>
              <small>${r(l.role_label)} / ${r(F(l.status))}</small>
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
          ${a.map(l=>Rn(t,l,o)).join("")||g("No users assigned to this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
        <div class="access-request-list">
          ${s.map(l=>Ln(l,o)).join("")||g("No pending join requests.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
        ${N([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Supabase Auth + RLS"],["Your role",yt(t)],["Can manage users",o?"Yes":"No"]])}
      </article>
    </section>
    `}
  `}function Rn(e,t,a){const n=Qe(e),s=t.role_id||xt(e,t.role)||n[0]?.id||"";return`
    <article class="access-user-row">
      ${Be({full_name:et(t),email:t.email,avatar_url:t.avatar_url},"avatar")}
      <div class="access-user-main">
        <strong>${r(et(t))}</strong>
        <span>${r(si(t))} / ${r(F(t.status))}</span>
      </div>
      <form class="access-role-form" data-user-role-form>
        <input type="hidden" name="company_id" value="${r(e)}" />
        <input type="hidden" name="profile_id" value="${r(t.profile_id)}" />
        <select name="role_id" ${a&&t.profile_id?"":"disabled"}>
          ${n.map(o=>`<option value="${r(o.id)}" ${o.id===s?"selected":""}>${r(o.name)}</option>`).join("")}
        </select>
        <select name="membership_status" ${a&&t.profile_id?"":"disabled"}>
          ${["active","pending","disabled"].map(o=>`<option value="${r(o)}" ${o===t.status?"selected":""}>${r(F(o))}</option>`).join("")}
        </select>
        <button class="btn" type="submit" ${a&&t.profile_id?"":"disabled"}>Save</button>
      </form>
    </article>
  `}function Ln(e,t){const a=e.requested_email||ui(e.profile_id)?.email||e.profile_id||"Requester";return`
    <article class="access-request-row">
      <div>
        <strong>${r(a)}</strong>
        <span>${r(e.message||"Access request")} / ${T(e.created_at)}</span>
      </div>
      <div>
        <button class="btn btn-primary" type="button" data-action="approve-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Approve</button>
        <button class="btn danger" type="button" data-action="reject-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Reject</button>
      </div>
    </article>
  `}function et(e){const t=String(e.name||"").trim(),a=String(e.email||"").trim();if(t&&!Pt(t))return t;if(a&&!Pt(a))return a.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,s=>s.toUpperCase());const n=String(e.role||"").toLowerCase();return n==="owner"?"Workspace owner":n==="admin"?"Workspace admin":n==="developer"?"Developer":`${e.role_label||"Workspace"} user`}function si(e){const t=String(e.email||"").trim();if(t&&!Pt(t))return t;const a=String(e.profile_id||e.member_id||"").trim();return a?`ID ${bo(a)}`:"No email on profile"}function Nn(e){const t=ne(e),a=t.filter(n=>!n.supervisor_id||!t.some(s=>s.id===n.supervisor_id));return`
    <section class="tool-page team-chart-page">
      ${Q("Team chart","Reporting lines, roles, and company coverage for this workspace.",`
        <a class="btn" href="${b(d("users",{},e))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${b(d("settings",{tab:"team"},e))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${$("Members",t.length)}
        ${$("Leads",a.length)}
        ${$("Open tasks",z(e).filter(ta).length)}
        ${$("Active timer",bt(e)?"Yes":"No")}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${a.map(n=>ri(e,n,t)).join("")||g("No workers assigned.")}
        </div>
      </section>
    </section>
  `}function ri(e,t,a,n=0){const s=a.filter(o=>o.supervisor_id===t.id);return`
    <article class="team-node" style="--depth:${n}">
      <div class="team-node-card">
        ${Be({full_name:t.full_name,avatar_url:t.avatar_url},"avatar")}
        <span><strong>${r(t.full_name)}</strong><small>${r(at(e,t.id))}</small></span>
        <b>${z(e).filter(o=>o.assignee_id===t.id&&ta(o)).length} open</b>
      </div>
      ${s.length?`<div class="team-node-children">${s.map(o=>ri(e,o,a,n+1)).join("")}</div>`:""}
    </article>
  `}function Un(e,t){const a=gt(t),n=["company","billing","roles","access","team"].includes(e.params.get("tab"))?e.params.get("tab"):"company";return`
    ${Q("Settings","Company settings, roles, approvals, and admin controls.","")}
    ${Kt("Settings sections",[[d("settings",{tab:"company"},t),"Company",n==="company"],[d("settings",{tab:"billing"},t),"Billing",n==="billing"],[d("settings",{tab:"roles"},t),"Roles",n==="roles"],[d("settings",{tab:"access"},t),"Access",n==="access"],[d("settings",{tab:"team"},t),"Workers",n==="team"]])}
    <section class="dashboard-grid compact-settings-grid">
      ${n==="company"?`
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${N([["Name",j(t)],["Company ID",t],["Color",a?.color||se(t)],["Visible jobs",O(t).length]])}
      </article>
      `:""}
      ${n==="billing"?Qn(t):""}
      ${n==="roles"?Vn(t):""}
      ${n==="access"?`
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${N([["Auth switch","Enabled"],["Local login","Disabled"],["Isolation","Server-enforced when migration is applied"],["Memberships",String(i.memberships.filter(s=>s.company_id===t).length)],["Invites",String(i.companyInvites.filter(s=>s.company_id===t&&s.status==="pending").length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${i.joinRequests.filter(s=>s.company_id===t).map(s=>he(s.requested_email||s.profile_id,s.message||"Access request",F(s.status),s.created_at)).join("")||g("No pending company approvals.")}
        </div>
      </article>
      `:""}
      ${n==="team"?`
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${ne(t).map(s=>`<div><strong>${r(s.full_name)}</strong><span>${r(at(t,s.id))}</span></div>`).join("")||g("No workers assigned.")}
        </div>
      </article>
      `:""}
    </section>
  `}function Qn(e){const t=oa(e);return`
    <article class="panel">
      <div class="section-head">
        <div><h2>Subscription</h2><p>$300/month company workspace billing gate.</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout"><i class="ti ti-credit-card"></i>Start subscription</button>
      </div>
      ${N([["Plan","$300/month company workspace"],["Status",Si(e)],["Stripe customer",t?.stripe_customer_id||"Not connected"],["Renewal / trial",t?.current_period_end||t?.trial_ends_at?T(t.current_period_end||t.trial_ends_at):"Pending"]])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules remain available only for trialing, active, past_due, or grace status.</p></div></div>
      ${N([["Workspace access",la(e)?"Allowed":"Suspended"],["Finance/files privacy","Requires Auth + RLS"],["Seat billing","Tracked later; not charged in v1"]])}
    </article>
  `}function Vn(e){return`
    <article class="panel span-2">
      <div class="section-head">
        <div><h2>Custom roles</h2><p>Discord-style roles for module, action, record, and field permissions.</p></div>
        <button class="btn btn-primary" type="button" data-action="open-role-form"><i class="ti ti-plus"></i>New role</button>
      </div>
      <div class="roles-list">
        ${Qe(e).map(a=>{const n=i.rolePermissions.filter(o=>o.role_id===a.id&&o.effect==="allow").length,s=i.roleAssignments.filter(o=>o.company_id===e&&o.role_id===a.id).length;return`
            <article class="role-row" style="--role-color:${r(a.color)}">
              <span></span>
              <div><strong>${r(a.name)}</strong><small>${n||"All"} permissions / ${s} users / priority ${a.priority}</small></div>
              <b>${a.is_system?"System":"Custom"}</b>
            </article>
          `}).join("")||g("No custom roles yet.")}
      </div>
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${i.fieldPermissions.filter(a=>a.company_id===e).map(a=>he(a.field_key,a.resource_type,a.visibility,"")).join("")||g("No field permission overrides yet.")}
      </div>
    </article>
  `}function Jn(e){return I("Settings","New role",`
    <form class="role-form" data-role-form>
      ${S("Role name","name","")}
      ${S("Color","color","#f0b23b",!1,"color")}
      ${S("Priority","priority","100",!1,"number")}
      <div class="permission-grid span-2">
        ${Vi.map(([t,a])=>`
          <label><input type="checkbox" name="permissions" value="${r(t)}" /> <span>${r(a)}</span></label>
        `).join("")}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Bn(e){const t=Br(e),a=Ee(e),n=i.formsTab==="builder"&&a?"builder":i.formsTab==="responses"?"responses":"library";return`
    <section class="tool-page forms-center">
      <div class="forms-command panel">
        <span class="sync-pill live"><i class="ti ti-device-floppy"></i>Local autosafe</span>
        <label>
          <span>Search</span>
          <input data-form-search value="${r(i.formQuery)}" placeholder="Find form, audience, or job" />
        </label>
        <button class="btn" type="button" data-action="open-forms-tools"><i class="ti ti-adjustments"></i>Tools</button>
        <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
      </div>
      ${n==="builder"?"":`
        <nav class="tabbar forms-tabs" aria-label="Forms workspace">
          ${["library","responses"].map(s=>`
            <button class="${n===s?"active":""}" type="button" data-action="set-forms-tab" data-tab="${r(s)}">${r(F(s))}</button>
          `).join("")}
        </nav>
      `}
      ${n==="library"?Hn(e,t,a):""}
      ${n==="builder"?zn(e,a):""}
      ${n==="responses"?as(e,a):""}
    </section>
  `}function Hn(e,t,a){return`
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${t.length} visible form${t.length===1?"":"s"} in ${r(j(e))}</span>
          </div>
        </div>
        <div class="forms-list forms-list-cards">
          ${t.map(n=>`
            <article class="form-card ${i.expandedFormIds.has(n.id)?"expanded":""} ${a?.id===n.id?"active":""}">
              <span class="form-card-top">
                <i class="ti ti-clipboard-list"></i>
              </span>
              <span class="form-card-main">
                <strong>${r(n.title)}</strong>
                <span>Created by ${r(Hr(n))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${r(n.id)}" aria-expanded="${i.expandedFormIds.has(n.id)?"true":"false"}">
                <i class="ti ${i.expandedFormIds.has(n.id)?"ti-chevron-up":"ti-chevron-down"}"></i>
                ${i.expandedFormIds.has(n.id)?"Less":"Details"}
              </button>
              <span class="form-card-meta">
                <small>${r(n.type)} / ${r(n.audience||"Internal")}</small>
                <small>${xi(n)} questions</small>
                <em>${Dt(n.id).length} responses</em>
                <em>Updated ${T(n.updated_at)}</em>
                <em>${r(n.status)}</em>
              </span>
              ${i.expandedFormIds.has(n.id)?`
                <div class="form-card-detail">
                  <p>${r(n.description||"No description yet.")}</p>
                  <div class="form-actions">
                    <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${r(n.id)}"><i class="ti ti-pencil"></i>Open builder</button>
                    <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(n.id)}"><i class="ti ti-eye"></i>Preview</button>
                  </div>
                </div>
              `:""}
            </article>
          `).join("")||g("No forms match this company view.")}
        </div>
      </article>
    </section>
  `}function zn(e,t){if(!t)return`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${g("Create a form or choose a template to open the builder.")}
      </section>
    `;const a=["questions","responses","settings"].includes(i.formEditorTab)?i.formEditorTab:"questions";return`
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${r(a)}">
      ${Wn(t,a)}
      ${a==="questions"?`
        ${Yn(e,t)}
        ${Kn(t)}
      `:""}
      ${a==="settings"?`
        <article class="panel form-settings-panel forms-settings-wide">
          ${Gn(e,t)}
        </article>
      `:""}
      ${a==="responses"?Zn(e,t):""}
    </section>
  `}function Wn(e,t){const a=Dt(e.id);return`
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${r(e.title)}</strong>
        <span>${r(e.status)} / ${xi(e)} questions / ${a.length} responses</span>
      </div>
      ${["questions","responses","settings"].map(n=>`
        <button class="${t===n?"active":""}" type="button" data-action="set-form-editor-tab" data-tab="${r(n)}">
          ${n==="questions"?'<i class="ti ti-list-details"></i>':n==="responses"?'<i class="ti ti-inbox"></i>':'<i class="ti ti-settings"></i>'}
          ${r(F(n))}
        </button>
      `).join("")}
      <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(e.id)}"><i class="ti ti-eye"></i>Preview</button>
      <button class="btn" type="button" data-action="open-form-actions" data-form-id="${r(e.id)}"><i class="ti ti-share"></i>Share</button>
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(e.id)}">Save</button>
    </div>
  `}function Yn(e,t){return`
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${r(t.theme_color||se(e))}"></div>
      ${Fe("Form title","title",t.title,!0)}
      ${Ei("Form description","description",t.description)}
      <div class="forms-simple-meta">
        <span>${r(t.status)}</span>
        <span>${r(t.type)}</span>
        <span>${r(t.audience||"Internal")}</span>
        <span>${r(D(t.linked_job_id)?.name||"Company level")}</span>
        <span>${r(j(e))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(t.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      </div>
    </article>
  `}function Kn(e){return`
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${Ne.map(([t,a])=>`<button type="button" data-action="add-question" data-question-type="${r(t)}" title="${r(a)}" aria-label="Add ${r(a)} question"><i class="ti ${r(zr(t))}"></i></button>`).join("")}
        </div>
        <div class="question-list">
          ${e.questions.map((t,a)=>Xn(t,a)).join("")||g("Add the first question.")}
        </div>
      </div>
    </article>
  `}function Gn(e,t){return`
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${Fe("Title","title",t.title,!0)}
      ${Ye("Status","status",t.status,Yt.map(a=>[a,a]))}
      ${Ei("Description","description",t.description)}
      ${Ye("Type","type",t.type,Le.map(a=>[a,a]))}
      ${Fe("Audience","audience",t.audience)}
      ${Ye("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(O(e).map(a=>[a.id,a.name])))}
      ${Fe("Theme color","theme_color",t.theme_color||se(e),!1,"color")}
      ${Ye("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
      ${Fe("Submit button","submit_label",t.submit_label||"Submit")}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(t.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${r(t.id)}">Delete</button>
    </div>
  `}function Zn(e,t){const a=Dt(t.id),n=a[0]||null;return`
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
      ${n?Oi(n):g("No response selected.")}
    </aside>
  `}function Xn(e,t){const a=Ne.map(([n,s])=>`<option value="${r(n)}" ${e.type===n?"selected":""}>${r(s)}</option>`).join("");return`
    <article class="question-card ${i.selectedQuestionId===e.id?"active":""}" data-question-id="${r(e.id)}">
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
      ${Oe(e)?`
        <div class="question-options">
          ${(e.options||[]).map((n,s)=>`
            <label>
              <span>Option ${s+1}</span>
              <input data-question-option="${s}" value="${r(n)}" />
              <button type="button" data-action="remove-question-option" data-question-id="${r(e.id)}" data-option-index="${s}"><i class="ti ti-x"></i></button>
            </label>
          `).join("")}
          <button class="btn" type="button" data-action="add-question-option" data-question-id="${r(e.id)}"><i class="ti ti-plus"></i>Add option</button>
        </div>
      `:""}
    </article>
  `}function es(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${r(t.id)}" style="--form-accent:${r(t.theme_color||se(e))}">
      <div class="designed-form-header">
        <span>${r(j(e))}</span>
        <h2>${r(t.title)}</h2>
        <p>${r(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>ts(a)).join("")||g("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${r(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function ts(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?X(e,`<textarea name="${r(t)}" rows="3" ${a}></textarea>`):e.type==="date"?X(e,`<input name="${r(t)}" type="date" ${a} />`):e.type==="file"?X(e,`<input name="${r(t)}" type="file" ${a} />`):e.type==="yesno"?X(e,`<select name="${r(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?X(e,`<input name="${r(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?X(e,`<select name="${r(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(n=>`<option>${r(n)}</option>`).join("")}</select>`):e.type==="checkbox"?X(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="checkbox" value="${r(n)}" /> ${r(n)}</label>`).join("")}</div>`):e.type==="multiple"?X(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="radio" value="${r(n)}" ${a} /> ${r(n)}</label>`).join("")}</div>`):X(e,`<input name="${r(t)}" ${a} />`)}function as(e,t){const a=t?Dt(t.id):Mi(e),n=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(s=>`
            <button type="button" class="response-card">
              <strong>${r(ve(s.form_id)?.title||"Unknown form")}</strong>
              <span>${r(s.submitted_by||s.submitter_email||"Anonymous")}</span>
              <small>${T(s.created_at)}</small>
            </button>
          `).join("")||g("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${n?Oi(n):g("No response selected.")}
      </aside>
    </section>
  `}function is(e,t){const a=yr(t),n=ft(t),s=z(t).filter(c=>c.status!=="done").length,o=K(O(t),"estimate_total"),l=hr(t);return`
    <section class="tool-page crm-page">
      ${Q("CRM","Customers, contacts, and follow-ups built from company jobs.",`
        <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add customer job</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${$("Accounts",n.length)}
        ${$("Open jobs",O(t).filter(c=>c.stage!=="Closed").length)}
        ${$("Open tasks",s)}
        ${$("Pipeline value",y(o))}
      </section>
      <section class="crm-toolbar panel">
        <label>
          <span>Search</span>
          <input data-crm-search value="${r(i.crmQuery)}" placeholder="Find customer, contact, job, or address" />
        </label>
        <label>
          <span>Stage</span>
          <select data-crm-stage-filter>
            ${["all"].concat(Pe).map(c=>`<option value="${r(c)}" ${i.crmStageFilter===c?"selected":""}>${r(c==="all"?"All stages":c)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Owner</span>
          <select data-crm-owner-filter>
            <option value="all" ${i.crmOwnerFilter==="all"?"selected":""}>All owners</option>
            ${l.map(c=>`<option value="${r(c)}" ${i.crmOwnerFilter===c?"selected":""}>${r(c)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="panel crm-list-panel">
        <div class="section-head">
          <div><h2>Customers</h2><p>${a.length} visible account${a.length===1?"":"s"} in ${r(j(t))}</p></div>
        </div>
        <div class="data-table crm-table">
          <div class="table-head"><span>Account</span><span>Contact</span><span>Stage</span><span>Owner</span><span>Jobs</span><span>Value</span><span>Updated</span></div>
          ${a.map(c=>`
            <a class="table-row crm-account-row" href="${b(d("crm",{account:c.key},t))}" data-router>
              <span><strong>${r(c.name)}</strong><small>${r(c.subtitle)}</small></span>
              <span>${r(c.primaryContact)}</span>
              <span>${r(c.stage)}</span>
              <span>${r(c.owner)}</span>
              <span>${r(c.jobs.length)}</span>
              <span>${y(c.estimateTotal)}</span>
              <span>${T(c.updatedAt)}</span>
            </a>
          `).join("")||g("No CRM accounts match this view. Add a customer job to start the list.")}
        </div>
      </section>
    </section>
  `}function ns(e,t){const a=_r(e,t);if(!a)return I("CRM","Customer account",g("This customer is not visible in the current company view."));const n=a.latestJob,s=a.tasks.filter(o=>o.status!=="done");return I("CRM",a.name,`
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${r(a.name)}</h2>
            <p>${r(a.subtitle)}</p>
          </div>
          ${ma(a.priority)}
        </div>
        ${N([["Primary contact",a.primaryContact],["Owner",a.owner],["Current stage",a.stage],["Pipeline value",y(a.estimateTotal)],["Open tasks",String(s.length)],["Last updated",T(a.updatedAt)]])}
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
        ${n?`<button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(n.id)}"><i class="ti ti-pencil"></i>Edit latest job</button>`:""}
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
              <span>${y(o.estimate_total)}</span>
            </a>
          `).join("")||g("No linked jobs yet.")}
        </div>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Follow-ups</h2><p>Open tasks across linked jobs.</p></div></div>
        <div class="queue-list">
          ${s.slice(0,6).map(o=>jt(o)).join("")||g("No open follow-ups for this customer.")}
        </div>
      </section>
    </div>
  `,"crm-modal")}function ss(e,t){const a=$i(t),n=fe(t),s=vi(t).slice().sort(Te("received_at")).slice(0,5),o=aa(t).slice().sort(Te("spent_at")).slice(0,5),l=ia(t).slice().sort((c,m)=>c.name.localeCompare(m.name)).slice(0,5);return`
    <section class="tool-page finance-page">
      ${Q("Finance","Invoices, payments, expenses, vendors, and job-linked money in one company view.",`
        <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
        <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
        <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        <a class="btn" href="${b(d("finance",{report:"summary"},t))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
      `)}
      <section class="metric-grid finance-metrics">
        ${$("Estimated pipeline",y(a.pipeline))}
        ${$("Invoiced",y(a.invoiced))}
        ${$("Collected",y(a.collected))}
        ${$("Outstanding",y(a.outstanding))}
        ${$("Expenses",y(a.expenses))}
        ${$("Net position",y(a.net))}
      </section>
      <section class="panel finance-aging">
        <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
        <div class="finance-aging-grid">
          ${[["Current",a.aging.current],["1-30",a.aging.thirty],["31-60",a.aging.sixty],["61+",a.aging.overSixty]].map(([c,m])=>`<div><span>${r(c)}</span><strong>${y(m)}</strong></div>`).join("")}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${n.length} billing record${n.length===1?"":"s"} for ${r(j(t))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${n.map(c=>`
            <a class="table-row" href="${b(d("finance",{invoice:c.id},t))}" data-router>
              <span><strong>${r(c.invoice_number)}</strong><small>${r(c.client_name||D(c.job_id)?.client_name||"No client")}</small></span>
              <span>${Lr(hi(c))}</span>
              <span>${r(D(c.job_id)?.name||"Company level")}</span>
              <span>${T(c.due_date)}</span>
              <span>${y(c.total)}</span>
              <span>${y(sa(c.id))}</span>
              <span>${y(ae(c.id))}</span>
            </a>
          `).join("")||g("No invoices yet. Create one from a job or customer record.")}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${s.map(c=>he(be(c.invoice_id)?.invoice_number||"Payment",c.method,y(c.amount),c.received_at)).join("")||g("No payments recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${o.map(c=>he(Et(c.vendor_id),c.category,y(c.amount),c.spent_at,d("finance",{expense:c.id},t))).join("")||g("No expenses recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${l.map(c=>he(c.name,c.category,c.status,c.updated_at,d("finance",{vendor:c.id},t))).join("")||g("No vendors recorded.")}
          </div>
        </article>
      </section>
    </section>
  `}function rs(e,t){return e.params.get("invoice")?os(t,e.params.get("invoice")):e.params.get("expense")?ls(t,e.params.get("expense")):e.params.get("vendor")?cs(t,e.params.get("vendor")):e.params.get("report")==="summary"?ds(t):""}function os(e,t){const a=be(t);if(!a||a.company_id!==e)return I("Finance","Invoice",g("Invoice not found."));const n=_i(a.id),s=D(a.job_id);return I("Finance",a.invoice_number,`
    <div class="finance-detail-modal">
      ${N([["Client",a.client_name||s?.client_name||"No client"],["Status",hi(a)],["Job",s?.name||"Company level"],["Issued",T(a.issue_date)],["Due",T(a.due_date)],["Total",y(a.total)],["Collected",y(sa(a.id))],["Balance",y(ae(a.id))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${r(a.id)}"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        ${s?`<a class="btn" href="${b(d("jobs",{tab:"profile",job_id:s.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${n.length} payment${n.length===1?"":"s"} applied.</p></div></div>
        <div class="finance-compact-list">
          ${n.map(o=>he(o.reference||o.method,o.method,y(o.amount),o.received_at)).join("")||g("No payments yet.")}
        </div>
      </section>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function ls(e,t){const a=yi(t);if(!a||a.company_id!==e)return I("Finance","Expense",g("Expense not found."));const n=D(a.job_id);return I("Finance",`${Et(a.vendor_id)} expense`,`
    <div class="finance-detail-modal">
      ${N([["Vendor",Et(a.vendor_id)],["Category",a.category],["Status",a.status],["Job",n?.name||"Company level"],["Spent",T(a.spent_at)],["Amount",y(a.amount)]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit expense</button>
        ${n?`<a class="btn" href="${b(d("files",{job_id:n.id},e))}" data-router><i class="ti ti-folder"></i>Job files</a>`:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function cs(e,t){const a=na(t);if(!a||a.company_id!==e)return I("Finance","Vendor",g("Vendor not found."));const n=aa(e).filter(s=>s.vendor_id===a.id);return I("Finance",a.name,`
    <div class="finance-detail-modal">
      ${N([["Contact",a.contact_name||"No contact"],["Email",a.email||"No email"],["Phone",a.phone||"No phone"],["Category",a.category],["Status",a.status],["Spend",y(K(n,"amount"))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
        <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${r(a.id)}"><i class="ti ti-receipt"></i>Add expense</button>
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function ds(e){const t=$i(e);return I("Finance","Summary report",`
    <div class="finance-report-modal">
      ${N([["Company",j(e)],["Estimated pipeline",y(t.pipeline)],["Invoiced",y(t.invoiced)],["Collected",y(t.collected)],["Outstanding",y(t.outstanding)],["Expenses",y(t.expenses)],["Net position",y(t.net)]])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${y(t.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${y(t.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${y(t.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${y(t.aging.overSixty)}</strong></div>
      </div>
    </div>
  `,"finance-modal")}function $a(e,t=null){const a=t||Fr(e);return I("Finance",t?"Edit invoice":"New invoice",`
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${S("Invoice number","invoice_number",a.invoice_number,!0)}
      ${P("Linked job","job_id",a.job_id||"",[["","Company level"]].concat(O(e).map(n=>[n.id,n.name])))}
      ${S("Client","client_name",a.client_name,!0)}
      ${P("Status","status",a.status,Na.map(n=>[n,n]))}
      ${S("Issue date","issue_date",a.issue_date,!1,"date")}
      ${S("Due date","due_date",a.due_date,!1,"date")}
      ${S("Subtotal","subtotal",a.subtotal,!1,"number")}
      ${S("Tax","tax",a.tax,!1,"number")}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function us(e,t=""){const a=Ir(e,t),n=fe(e).map(s=>[s.id,`${s.invoice_number} - ${s.client_name||D(s.job_id)?.client_name||"No client"}`]);return I("Finance","Record payment",`
    <form class="finance-form" data-finance-payment-form>
      ${P("Invoice","invoice_id",a.invoice_id,n.length?n:[["","Create an invoice first"]])}
      ${S("Amount","amount",a.amount,!0,"number")}
      ${P("Method","method",a.method,Va.map(s=>[s,s]))}
      ${S("Received","received_at",a.received_at,!1,"date")}
      ${S("Reference","reference",a.reference)}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function wa(e,t=null,a=""){const n=t||Ar(e,a),s=ia(e).map(o=>[o.id,o.name]);return I("Finance",t?"Edit expense":"Add expense",`
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${r(n.id)}" />
      ${P("Vendor","vendor_id",n.vendor_id,s.length?s:[["","No vendor yet"]])}
      ${P("Linked job","job_id",n.job_id||"",[["","Company level"]].concat(O(e).map(o=>[o.id,o.name])))}
      ${P("Category","category",n.category,ut.map(o=>[o,o]))}
      ${P("Status","status",n.status,Ua.map(o=>[o,o]))}
      ${S("Amount","amount",n.amount,!0,"number")}
      ${S("Spent date","spent_at",n.spent_at,!1,"date")}
      ${ie("Notes","notes",n.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Sa(e,t=null){const a=t||Mr(e);return I("Finance",t?"Edit vendor":"Add vendor",`
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${S("Vendor name","name",a.name,!0)}
      ${S("Contact","contact_name",a.contact_name)}
      ${S("Email","email",a.email,!1,"email")}
      ${S("Phone","phone",a.phone)}
      ${P("Category","category",a.category,ut.map(n=>[n,n]))}
      ${P("Status","status",a.status,Qa.map(n=>[n,n]))}
      ${ie("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function ps(e,t){return e.section==="clock"?fs(t):e.section==="approvals"?bs(t):ms(t)}function Gt(e,t){return`
    ${Kt("Operations sections",[[d("time",{},e),"My time",t==="time"],[d("approvals",{},e),"Approvals",t==="approvals"],[d("clock",{},e),"Clock dashboard",t==="clock"]])}
  `}function ms(e){const t=mi(e),a=bt(e);return`
    <section class="tool-page operations-page">
      ${Q("My time","A compact personal work queue built from this company's tasks.",`
        <a class="btn" href="${b(d("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Gt(e,"time")}
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
            ${t.focus.slice(0,8).map(n=>jt(n)).join("")||g("No time-sensitive tasks for this company.")}
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
                <span><strong>${r(n.title)}</strong><small>${r(n.description||He(n.type))}</small></span>
                <span>${r(D(n.project_id)?.name||"Company task")}</span>
                <span>${r(B(n.assignee_id))}</span>
                <span>${T(n.due)}</span>
                <span>${Ci(n.status)}</span>
              </a>
            `).join("")||g("No upcoming tasks this week.")}
          </div>
        </article>
      </section>
    </section>
  `}function fs(e){const t=bi(e),a=bt(e),n=qt().getTime(),s=n-6*864e5,o=Fa(e,n)+(a?Date.now()-Date.parse(a.started_at):0),l=Fa(e,s)+(a?Date.now()-Date.parse(a.started_at):0);return`
    <section class="tool-page operations-page clock-page">
      ${Q("Clock dashboard","Local basic-mode clock tracking for the active company.",`
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Gt(e,"clock")}
      <section class="metric-grid operations-metrics">
        ${$("Today",Ge(o))}
        ${$("Last 7 days",Ge(l))}
        ${$("Entries",t.length)}
        ${$("Status",a?"Clocked in":"Off clock")}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${a?N([["User",B(a.user_id)],["Started",xa(a.started_at)],["Task",a.task_title||"General shift"],["Elapsed",Ge(Date.now()-Date.parse(a.started_at))]]):g("Nobody is clocked in on this device.")}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${t.slice(0,10).map(c=>`
              <div class="table-row">
                <span><strong>${r(c.task_title||"General shift")}</strong><small>${r(c.notes||"Clock entry")}</small></span>
                <span>${r(B(c.user_id))}</span>
                <span>${xa(c.started_at)}</span>
                <span>${Ge(c.duration_ms)}</span>
              </div>
            `).join("")||g("No clock entries yet.")}
          </div>
        </article>
      </section>
    </section>
  `}function bs(e){const t=fi(e),a=t.filter(o=>o.type==="Form approval"),n=t.filter(o=>o.type==="Task review"),s=t.filter(o=>o.type==="Access request");return`
    <section class="tool-page operations-page">
      ${Q("Approvals","Company review queue for forms, task handoffs, and access requests.",`
        <a class="btn" href="${b(d("forms",{},e))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${b(d("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${Gt(e,"approvals")}
      <section class="metric-grid operations-metrics">
        ${$("Open approvals",t.length)}
        ${$("Forms",a.length)}
        ${$("Task reviews",n.length)}
        ${$("Access",s.length)}
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
  `}function ka(e){return`
    ${Q(F(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${g("Module data model pending.")}
    </section>
  `}function gs(){document.title="Sign in | Quest HQ";const e=Xt(i.route.params.get("return_url")||b(d("jobs",{},A())));pt.innerHTML=`
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
            <button class="${i.authMode==="signin"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="signin">Sign in</button>
            <button class="${i.authMode==="register"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="register">Create workspace</button>
            <button class="${i.authMode==="request"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="request">Request access</button>
          </div>
          ${ys(e)}
        `}
        ${vs(e)}
        
      </section>
    </main>
  `}function vs(e){return`
    <section class="demo-mode-box">
      <div>
        <strong>Demo mode</strong>
        <span>Local-only sample workspace. No Supabase database reads or writes.</span>
      </div>
      <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${r(e)}">Open demo mode</button>
    </section>
  `}function ys(e){return i.authMode==="register"?`
      <form data-auth-register-form>
        <label>Full name<input name="full_name" autocomplete="name" required /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required /></label>
        <label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Create secure workspace</button>
        ${Ft("Owner role, trial subscription, and workspace isolation are created automatically.")}
      </form>
    `:i.authMode==="request"?`
      <form data-auth-request-form>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" required /></label>
        <label>Company ID<input name="company_id" placeholder="company-workspace-id" required /></label>
        <label>Message<input name="message" placeholder="Tell the admin why you need access" /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Request company access</button>
        ${Ft("Requests stay pending until a company Owner/Admin approves them.")}
      </form>
    `:`
    <form data-auth-sign-in-form>
      <label>Email<input name="email" type="email" autocomplete="email" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <input type="hidden" name="return_url" value="${r(e)}" />
      <button class="btn btn-primary full" type="submit">Sign in</button>
      ${Ft("Use the company workspace account your Owner/Admin invited.")}
    </form>
  `}function Ft(e){return i.loginError?`<div class="form-message error">${r(i.loginError)}</div>`:`<div class="form-message">${r(i.authMessage||e)}</div>`}function _s(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${Be(e,"avatar large")}
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
  `}function hs(e,t){if(i.modal==="profile")return _s(t.profile);if(i.modal==="file-upload")return Tn();if(i.modal==="folder-new")return On();if(i.modal==="file-detail")return Ss(u());if(i.modal==="forms-tools")return ks(u());if(i.modal==="form-actions")return Cs(u(),Ee(u()));if(i.modal==="form-new")return js(u());if(i.modal==="form-preview")return qs(u(),Ee(u()));if(i.modal==="job-new")return It(u(),null);if(i.modal==="job-edit")return It(u(),ue());if(i.modal==="finance-invoice-new")return $a(u(),null);if(i.modal==="finance-invoice-edit")return $a(u(),be(i.selectedFinanceInvoiceId));if(i.modal==="finance-payment-new")return us(u(),i.selectedFinanceInvoiceId);if(i.modal==="finance-expense-new")return wa(u(),null,i.selectedFinanceVendorId);if(i.modal==="finance-expense-edit")return wa(u(),yi(i.selectedFinanceExpenseId));if(i.modal==="finance-vendor-new")return Sa(u(),null);if(i.modal==="finance-vendor-edit")return Sa(u(),na(i.selectedFinanceVendorId));if(i.modal==="role-new")return Jn(u());if(e.name==="company"&&e.section==="crm"&&e.params.get("account"))return ns(e.companyId,e.params.get("account"));if(e.name==="company"&&e.section==="finance"){const a=rs(e,e.companyId);if(a)return a}return e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"?It(e.companyId,e.jobId?D(e.jobId):ue()):e.name==="company"&&e.section==="tasks"?ws(e,e.companyId):""}function I(e,t,a,n=""){return`
    <div class="modal-overlay">
      <div class="modal-panel ${r(n)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </div>
    </div>
  `}function $s(e,t,a){return`
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </aside>
    </div>
  `}function It(e,t){return I("Jobs",t?"Edit job":"Create job",yn(e,t),"wide-modal")}function ws(e,t){const a=e.jobId?D(e.jobId):null,n=e.params.get("task_id")||"",s=n?ea(n):null;return e.params.get("new")==="1"?I("Tasks","New task",ha(t,a,null),"task-modal"):e.params.get("edit")==="1"&&s?I("Tasks","Edit task",ha(t,a,s),"task-modal"):s?$s("Task detail",s.title,Sn(t,s)):""}function Ss(e){const t=i.selectedFileId?i.files.find(a=>a.id===i.selectedFileId):null;return t?I("Open file",t.file_name,xn(t),"file-viewer-modal"):""}function ks(e){return I("Forms","Tools",`
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${i.formTypeFilter==="all"?"selected":""}>All types</option>
          ${Le.map(t=>`<option value="${r(t)}" ${i.formTypeFilter===t?"selected":""}>${r(t)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `)}function js(e){const t=i.formStartTab==="templates"?"templates":"blank",a=Ie(),n=t==="templates"&&(a.find(m=>m.id===i.formStartTemplateId)||a[0])||null,s=n?.title||"",o=n?.description||"",l=n?.type||"Internal",c=n?.questions||[{type:"short",label:"First question",required:!1,options:[]}];return I("Forms","New form builder",`
    <form class="new-form-modal builder-create-modal" data-new-form-form>
      <input type="hidden" name="template_id" value="${r(n?.id||"")}" />
      <div class="form-start-tabs" role="tablist" aria-label="New form start type">
        <button class="${t==="blank"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="blank"><i class="ti ti-clipboard-plus"></i>Blank</button>
        <button class="${t==="templates"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="templates"><i class="ti ti-template"></i>Templates</button>
      </div>
      ${t==="templates"?`
        <div class="new-form-template-grid">
          ${a.map(m=>`
            <button class="${n?.id===m.id?"active":""}" type="button" data-action="select-form-start-template" data-template-id="${r(m.id)}">
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
            ${c.map((m,v)=>Ds(m,v)).join("")}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${n?r(n.title):"Blank starter"}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${Le.map(m=>`<option value="${r(m)}" ${m===l?"selected":""}>${r(m)}</option>`).join("")}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${O(e).map(m=>`<option value="${r(m.id)}" ${i.route?.jobId===m.id?"selected":""}>${r(m.name)}</option>`).join("")}</select></label>
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
  `,"form-create-modal builder-modal")}function Ds(e,t){const a=Oe(e)?`
    <div class="starter-options">
      ${(e.options||["Option 1","Option 2"]).map(n=>`<span>${r(n)}</span>`).join("")}
    </div>
  `:"";return`
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${t+1}</span>
        <strong>${r(Wr(e.type))}</strong>
      </div>
      <label><span>Question</span><input value="${r(e.label||"Untitled question")}" readonly /></label>
      ${e.help?`<small>${r(e.help)}</small>`:""}
      ${a}
      <label class="check-row"><input type="checkbox" ${e.required?"checked":""} disabled /> Required</label>
    </article>
  `}function qs(e,t){return t?I("Forms","Preview form",`
    <div class="form-preview-modal-body">
      ${es(e,t)}
    </div>
  `,"form-preview-modal"):I("Forms","Preview form",g("Choose a form first."))}function Cs(e,t){return t?I("Forms","Manage form",`
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
  `):I("Forms","Manage form",g("Choose a form first."))}function Fs(e){const t=i.accountMenuOpen&&!e.target.closest(".account-menu");t&&(i.accountMenuOpen=!1);const a=e.target.closest("[data-action]");if(a){Is(e,a);return}const n=e.target.closest("[data-select-job]");if(n){e.preventDefault(),fr(n.dataset.selectJob);return}const s=e.target.closest("[data-select-task]");if(s){e.preventDefault(),br(s.dataset.selectTask);return}const o=e.target.closest("a[href][data-router]");if(!o){t&&p();return}o.target||o.hasAttribute("download")||(e.preventDefault(),k(o.getAttribute("href")))}function Is(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),i.dataLoaded=!1,i.sync={label:"Refreshing...",mode:"loading"},p();return}if(a==="sign-out"){e.preventDefault(),i.accountMenuOpen=!1,xs();return}if(a==="toggle-account-menu"){e.preventDefault(),i.accountMenuOpen=!i.accountMenuOpen,p();return}if(a==="start-demo-mode"){e.preventDefault(),oi(t.dataset.returnUrl||"");return}if(a==="set-auth-mode"){e.preventDefault(),i.authMode=["signin","register","request"].includes(t.dataset.authMode)?t.dataset.authMode:"signin",i.loginError="",i.authMessage="",p();return}if(a==="open-profile"){e.preventDefault(),i.accountMenuOpen=!1,i.modal="profile",p();return}if(a==="open-role-form"){e.preventDefault(),i.modal="role-new",p();return}if(a==="approve-join-request"){e.preventDefault(),ja(t.dataset.requestId,"approved");return}if(a==="reject-join-request"){e.preventDefault(),ja(t.dataset.requestId,"rejected");return}if(a==="start-checkout"){e.preventDefault(),Rs();return}if(a==="open-file-upload"){e.preventDefault(),i.modal="file-upload",p();return}if(a==="open-folder-form"){e.preventDefault(),i.modal="folder-new",p();return}if(a==="open-job-form"){e.preventDefault();const n=t.dataset.jobId||"";n&&(i.selectedJobId=n),i.modal=t.dataset.mode==="edit"?"job-edit":"job-new",p();return}if(a==="open-forms-tools"){e.preventDefault(),i.modal="forms-tools",p();return}if(a==="open-form-actions"){e.preventDefault(),Ke(t.dataset.formId,!1),i.modal="form-actions",p();return}if(a==="open-form-preview"){e.preventDefault(),Ke(t.dataset.formId,!1),i.modal="form-preview",p();return}if(a==="set-form-start-tab"){e.preventDefault(),i.formStartTab=t.dataset.tab==="templates"?"templates":"blank",i.formStartTab==="blank"&&(i.formStartTemplateId=""),i.formStartTab==="templates"&&!i.formStartTemplateId&&(i.formStartTemplateId=Ie()[0]?.id||""),p();return}if(a==="select-form-start-template"){e.preventDefault(),i.formStartTab="templates",i.formStartTemplateId=t.dataset.templateId||Ie()[0]?.id||"",p();return}if(a==="close-modal"){e.preventDefault(),As();return}if(a==="set-task-view"){e.preventDefault(),i.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(Ta,i.taskView),p();return}if(a==="set-drive-view"){e.preventDefault(),i.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem(Pa,i.driveView),p();return}if(a==="clock-in"){e.preventDefault(),$r(u(),t.dataset.taskId||i.route?.params?.get("task_id")||"");return}if(a==="clock-out"){e.preventDefault(),gi();return}if(a==="select-file"){e.preventDefault(),i.selectedFileId=t.dataset.fileId||"",i.modal="file-detail",p();return}if(a==="download-file"){e.preventDefault(),Xs(t.dataset.fileId);return}if(a==="delete-file"){e.preventDefault(),er(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),i.formsTab=t.dataset.tab==="responses"?"responses":"library",p();return}if(a==="set-form-editor-tab"){e.preventDefault(),i.formEditorTab=t.dataset.tab||"questions",p();return}if(a==="new-form"){e.preventDefault(),i.formStartTemplateId=t.dataset.templateId||"",i.formStartTab=t.dataset.startTab==="templates"||i.formStartTemplateId?"templates":"blank",i.formStartTab==="templates"&&!i.formStartTemplateId&&(i.formStartTemplateId=Ie()[0]?.id||""),i.modal="form-new",p();return}if(a==="select-form"){e.preventDefault(),Ke(t.dataset.formId);return}if(a==="toggle-form-card"){e.preventDefault();const n=t.dataset.formId||"";i.expandedFormIds.has(n)?i.expandedFormIds.delete(n):i.expandedFormIds.add(n),p();return}if(a==="edit-form"){e.preventDefault(),Ke(t.dataset.formId,!1),i.formsTab="builder",i.formEditorTab="questions",i.modal="",p();return}if(a==="save-form"){e.preventDefault(),J("Form saved locally"),p();return}if(a==="publish-form"){e.preventDefault(),Ma(t.dataset.formId,"Published");return}if(a==="archive-form"){e.preventDefault(),Ma(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){e.preventDefault(),Zr(t.dataset.formId);return}if(a==="delete-form"){e.preventDefault(),Xr(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),eo(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),to(u());return}if(a==="new-finance-invoice"){e.preventDefault(),i.selectedFinanceInvoiceId="",i.modal="finance-invoice-new",p();return}if(a==="edit-finance-invoice"){e.preventDefault(),i.selectedFinanceInvoiceId=t.dataset.invoiceId||"",i.modal="finance-invoice-edit",p();return}if(a==="new-finance-payment"){e.preventDefault(),i.selectedFinanceInvoiceId=t.dataset.invoiceId||i.route?.params?.get("invoice")||"",i.modal="finance-payment-new",p();return}if(a==="new-finance-expense"){e.preventDefault(),i.selectedFinanceExpenseId="",i.selectedFinanceVendorId=t.dataset.vendorId||"",i.modal="finance-expense-new",p();return}if(a==="edit-finance-expense"){e.preventDefault(),i.selectedFinanceExpenseId=t.dataset.expenseId||"",i.modal="finance-expense-edit",p();return}if(a==="new-finance-vendor"){e.preventDefault(),i.selectedFinanceVendorId="",i.modal="finance-vendor-new",p();return}if(a==="edit-finance-vendor"){e.preventDefault(),i.selectedFinanceVendorId=t.dataset.vendorId||"",i.modal="finance-vendor-edit",p();return}if(a==="add-question"){e.preventDefault(),ao(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){e.preventDefault(),io(t.dataset.questionId);return}if(a==="delete-question"){e.preventDefault(),no(t.dataset.questionId);return}if(a==="move-question"){e.preventDefault(),so(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){e.preventDefault(),ro(t.dataset.questionId);return}if(a==="remove-question-option"){e.preventDefault(),oo(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){e.preventDefault(),Js(t.dataset.jobId);return}a==="delete-task"&&(e.preventDefault(),Hs(t.dataset.taskId))}function As(){const e=i.route||mt();if(i.modal="",i.formStartTemplateId="",i.formStartTab="blank",i.selectedFinanceInvoiceId="",i.selectedFinanceExpenseId="",i.selectedFinanceVendorId="",e.name==="company"&&e.section==="tasks"&&(e.params.get("new")||e.params.get("edit")||e.params.get("task_id"))){k(d("tasks",e.jobId?{job_id:e.jobId}:{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"){const t=e.jobId?D(e.jobId):ue();k(d("jobs",{tab:t?"profile":"pipeline",...t?{job_id:t.id}:{}},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="crm"&&e.params.get("account")){k(d("crm",{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="finance"&&(e.params.get("invoice")||e.params.get("expense")||e.params.get("vendor")||e.params.get("report"))){k(d("finance",{},e.companyId),{replace:!0});return}p()}function Ms(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===$e.localUsername&&String(t.password||"")===$e.localPassword)){i.loginError="Invalid temporary credentials.",p();return}i.loginError="",oi(t.return_url||b(d("jobs",{},A())));return}if(e.target.matches("[data-auth-sign-in-form]")){e.preventDefault(),Es(e.target);return}if(e.target.matches("[data-auth-register-form]")){e.preventDefault(),Os(e.target);return}if(e.target.matches("[data-auth-request-form]")){e.preventDefault(),Ps(e.target);return}if(e.target.matches("[data-company-create-form]")){e.preventDefault(),Ts(e.target);return}if(e.target.matches("[data-profile-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries()),a={...C().profile,full_name:String(t.full_name||"").trim()||"Quest Basic Mode",avatar_url:String(t.avatar_url||"").trim()};M(Oa,a),i.profileDraft=a,i.session={...C(),profile:a},M(we,i.session),i.modal="",p();return}if(e.target.matches("[data-job-form]")){e.preventDefault(),Vs(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),Bs(e.target);return}if(e.target.matches("[data-new-form-form]")){e.preventDefault(),Gr(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),zs(e.target);return}if(e.target.matches("[data-folder-form]")){e.preventDefault(),Ws(e.target);return}if(e.target.matches("[data-finance-invoice-form]")){e.preventDefault(),Ys(e.target);return}if(e.target.matches("[data-finance-payment-form]")){e.preventDefault(),Ks(e.target);return}if(e.target.matches("[data-finance-expense-form]")){e.preventDefault(),Gs(e.target);return}if(e.target.matches("[data-finance-vendor-form]")){e.preventDefault(),Zs(e.target);return}if(e.target.matches("[data-role-form]")){e.preventDefault(),Ls(e.target);return}if(e.target.matches("[data-user-role-form]")){e.preventDefault(),Ns(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),lo(e.target))}async function xs(){if(i.session?.auth==="supabase"){const e=L();e?.auth&&await e.auth.signOut()}localStorage.removeItem(we),i.session=null,i.dataLoaded=!1,k("/login",{replace:!0})}function oi(e=""){i.loginError="",i.authMessage="",i.session=Tt(),ti(),i.activeCompanyId=u(),localStorage.setItem(pe,i.activeCompanyId),M(we,i.session),i.dataLoaded=!1,i.dataLoading=!1,k(Xt(e||b(d("jobs",{},u()))),{replace:!0})}async function Es(e){const t=Object.fromEntries(new FormData(e).entries()),a=L();if(!a?.auth){i.loginError="Supabase auth is unavailable.",p();return}i.loginError="",i.authMessage="Signing in...",p();const n=await a.auth.signInWithPassword({email:String(t.email||"").trim(),password:String(t.password||"")});if(n.error){i.loginError=n.error.message||"Unable to sign in.",i.authMessage="",p();return}await Ae(n.data.session),i.authMessage="",i.dataLoaded=!1,k(Xt(t.return_url||b(d("jobs",{},A()))),{replace:!0})}async function Os(e){const t=Object.fromEntries(new FormData(e).entries()),a=L();if(!a?.auth){i.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),s=String(t.password||""),o=String(t.full_name||"").trim(),l=String(t.company_name||"").trim();if(!n||!s||!o||!l){i.loginError="Name, email, password, and company workspace are required.",p();return}i.loginError="",i.authMessage="Creating secure workspace...",p();const c=await a.auth.signUp({email:n,password:s,options:{data:{full_name:o}}});if(c.error){i.loginError=c.error.message||"Unable to create account.",i.authMessage="",p();return}let m=c.data.session;if(!m){const f=await a.auth.signInWithPassword({email:n,password:s});if(f.error){i.loginError="Account created. Please sign in to finish workspace setup.",i.authMode="signin",i.authMessage="",p();return}m=f.data.session}await Ae(m);const v=await a.rpc("create_company_workspace",{company_name:l});if(v.error){i.loginError=v.error.message||"Account created, but workspace setup failed.",i.authMessage="",p();return}i.activeCompanyId=_(v.data||A()),localStorage.setItem(pe,i.activeCompanyId),i.dataLoaded=!1,i.authMessage="",k(d("settings",{tab:"billing"},i.activeCompanyId),{replace:!0})}async function Ts(e){const t=Object.fromEntries(new FormData(e).entries()),a=L(),n=String(t.company_name||"").trim();if(!a||!n){i.loginError="Company workspace name is required.",p();return}const s=await a.rpc("create_company_workspace",{company_name:n});if(s.error){i.loginError=s.error.message||"Workspace setup failed.",p();return}i.activeCompanyId=_(s.data||A()),localStorage.setItem(pe,i.activeCompanyId),i.dataLoaded=!1,k(d("settings",{tab:"billing"},i.activeCompanyId),{replace:!0})}async function Ps(e){const t=Object.fromEntries(new FormData(e).entries()),a=L();if(!a?.auth){i.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),s=String(t.password||""),o=_(t.company_id||"");i.loginError="",i.authMessage="Submitting access request...",p();const l=await a.auth.signInWithPassword({email:n,password:s});if(l.error){i.loginError=l.error.message||"Sign in first to request access.",i.authMessage="",p();return}await Ae(l.data.session);const c=await a.rpc("request_company_access",{target_company_id:o,request_message:String(t.message||"").trim()||null});if(c.error){i.loginError=c.error.message||"Unable to request access.",i.authMessage="",p();return}i.authMessage="Access request sent. An Owner/Admin must approve it.",i.loginError="",i.authMode="signin",p()}async function Rs(){const e=u();i.sync={label:"Opening billing...",mode:"loading"},p();try{const t=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json",...C().access_token?{Authorization:`Bearer ${C().access_token}`}:{}},body:JSON.stringify({company_id:e,return_url:`${window.location.origin}${b(d("settings",{tab:"billing"},e))}`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.url)throw new Error(a.error||"Billing is not configured yet.");window.location.href=a.url}catch(t){i.sync={label:t.message||"Billing unavailable",mode:"local"},p()}}async function Ls(e){const t=u(),a=new FormData(e),n=_e({id:crypto.randomUUID(),company_id:t,name:a.get("name"),color:a.get("color")||"#f0b23b",priority:a.get("priority")||100,is_system:!1,created_by:C().profile.id}),s=a.getAll("permissions").map(l=>String(l||"")).filter(Boolean),o=L();if(i.session?.auth==="supabase"&&o){const l=await o.from("roles").insert(n).select().single();if(l.error){i.sync={label:l.error.message||"Role save failed",mode:"local"},p();return}const c=_e(l.data),m=s.map(v=>({role_id:c.id,permission_key:v,effect:"allow"}));m.length&&await o.from("role_permissions").insert(m),i.roles.unshift(c),i.rolePermissions=m.concat(i.rolePermissions).map(Ot),i.sync={label:"Role saved",mode:"live"}}else i.roles.unshift(n),i.rolePermissions=s.map(l=>Ot({role_id:n.id,permission_key:l,effect:"allow"})).concat(i.rolePermissions),i.sync={label:"Role saved locally",mode:"local"};i.modal="",p()}async function Ns(e){const t=new FormData(e),a=_(t.get("company_id")||u()),n=String(t.get("profile_id")||"").trim(),s=String(t.get("role_id")||"").trim(),o=["active","pending","disabled"].includes(String(t.get("membership_status")))?String(t.get("membership_status")):"active",l=di(a,s);if(!n||!l){i.sync={label:"Select a user and role",mode:"local"},p();return}const c=st({company_id:a,profile_id:n,role:vr(l),status:o}),m=ji({company_id:a,profile_id:n,role_id:l.id,assigned_by:C().profile.id}),v=L();if(i.session?.auth==="supabase"&&v){const f=Ui(l.id),h=await v.from("company_memberships").upsert(li(c),{onConflict:"company_id,profile_id"}).select().single();if(h.error){i.sync={label:h.error.message||"Access update failed",mode:"local"},p();return}if(f){await v.from("user_role_assignments").delete().eq("company_id",a).eq("profile_id",n);const R=await v.from("user_role_assignments").insert(m);if(R.error){i.sync={label:R.error.message||"Role assignment failed",mode:"local"},p();return}}tt(st(h.data||c)),f&&Ca(m),i.sync={label:f?"User access saved":"Membership saved; create a role to assign permissions",mode:"live"}}else tt(c),Ca(m),i.sync={label:"User access saved locally",mode:"local"};p()}async function ja(e,t){const a=i.joinRequests.find(l=>l.id===e);if(!a||!["approved","rejected"].includes(t))return;const n=L(),s=Di({...a,status:t}),o=st({company_id:a.company_id,profile_id:a.profile_id,role:"member",status:t==="approved"?"active":"disabled"});if(i.session?.auth==="supabase"&&n){if(t==="approved"){const c=await n.from("company_memberships").upsert(li(o),{onConflict:"company_id,profile_id"});if(c.error){i.sync={label:c.error.message||"Approval failed",mode:"local"},p();return}}const l=await n.from("company_join_requests").update({status:t,reviewed_by:C().profile.id,updated_at:new Date().toISOString()}).eq("id",a.id);if(l.error){i.sync={label:l.error.message||"Request update failed",mode:"local"},p();return}t==="approved"&&tt(o),i.sync={label:t==="approved"?"Access approved":"Request rejected",mode:"live"}}else t==="approved"&&tt(o),i.sync={label:t==="approved"?"Access approved locally":"Request rejected locally",mode:"local"};i.joinRequests=i.joinRequests.map(l=>l.id===a.id?s:l),V(),p()}function Us(e){if(e.target.matches("[data-global-search]")){i.query=e.target.value,ze();return}if(e.target.matches("[data-file-search]")){i.fileQuery=e.target.value,ze();return}if(e.target.matches("[data-form-search]")){i.formQuery=e.target.value,ze();return}if(e.target.matches("[data-crm-search]")){i.crmQuery=e.target.value,ze();return}if(e.target.matches("[data-form-field]")){Ti(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Pi(e.target)}function Qs(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||A();pr(t);return}if(e.target.matches("[data-stage-filter]")){i.stageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-stage-filter]")){i.crmStageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-owner-filter]")){i.crmOwnerFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-status-filter]")){i.taskStatusFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-priority-filter]")){i.taskPriorityFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;k(d("tasks",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-analytics-job-filter]")){const t=e.target.value;k(d("analytics",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-file-category-filter]")){i.fileCategoryFilter=e.target.value||"All categories",p();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=i.route?.jobId||"";k(d("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},u()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;k(d("files",{...t?{folder:"jobs",job_id:t}:{}},u()));return}if(e.target.matches("[data-form-type-filter]")){i.formTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-form-field]")){Ti(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Pi(e.target)}async function Vs(e){const t=Se(Object.fromEntries(new FormData(e).entries()));t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||u(),t.estimate_total=Number(t.estimate_total||0),t.invoice_total=Number(t.invoice_total||0),t.updated_at=new Date().toISOString();const a=i.jobs.some(s=>s.id===t.id),n=L();if(n){const s=a?await n.from("jobs").update(t).eq("id",t.id).select().single():await n.from("jobs").insert(t).select().single();if(!s.error&&s.data){At(Se(s.data)),i.sync={label:"Quest Supabase live",mode:"live"},i.modal="",k(d("jobs",{tab:"profile",job_id:s.data.id},t.company_id),{replace:!0});return}i.sync={label:"Saved locally",mode:"local"}}At(t),i.modal="",k(d("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function Js(e){if(!e)return;const t=u(),a=L();a&&await a.from("jobs").delete().eq("id",e),i.jobs=i.jobs.filter(n=>n.id!==e),i.selectedJobId=O(t)[0]?.id||"",i.modal="",V(),k(d("jobs",{tab:"list"},t),{replace:!0})}async function Bs(e){const t=u(),a=Object.fromEntries(new FormData(e).entries()),n=ke({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:C().profile.member_id||ne(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),s=i.tasks.some(l=>l.id===n.id),o=L();if(o){const l=xr(n),c=s?await o.from("tasks").update(l).eq("id",n.id).select().single():await o.from("tasks").insert(l).select().single();if(!c.error&&c.data){Da(ke(c.data)),i.sync={label:"Quest Supabase live",mode:"live"},i.modal="",k(d("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0});return}i.sync={label:"Task saved locally",mode:"local"}}Da(n),i.modal="",k(d("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0})}async function Hs(e){if(!e)return;const t=u(),a=L();a&&await a.from("tasks").delete().eq("id",e),i.tasks=i.tasks.filter(n=>n.id!==e),i.selectedTaskId="",i.modal="",V(),k(d("tasks",{},t),{replace:!0})}async function zs(e){const t=u(),a=new FormData(e),n=Object.fromEntries(a.entries()),s=Array.from(e.elements.files?.files||[]),o=String(n.file_name||"").trim(),l=s.length?s:o?[null]:[];if(!l.length){i.sync={label:"Choose a file or enter a file name",mode:"local"},p();return}const c=L();let m=0;for(const v of l){const f=crypto.randomUUID(),h=v?.name||o,R=String(n.folder||"shared"),q=`${t}/${n.job_id?`jobs/${n.job_id}`:R}/${f}-${va(h)}`;let H=!1;c&&v&&(H=!(await c.storage.from("quest-job-files").upload(q,v,{cacheControl:"3600",upsert:!1,contentType:v.type||"application/octet-stream"})).error);const Ce=xe({id:f,company_id:t,job_id:n.job_id||"",folder:R,file_name:h,mime_type:v?.type||"application/octet-stream",size_bytes:v?.size||Number(n.size_bytes||0),category:n.category||ee(R),notes:n.notes||"",uploaded_by_label:n.uploaded_by_label||C().profile.full_name,bucket_id:"quest-job-files",object_path:H||!v?q:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(c){const le=await c.from("job_files").insert(Er(Ce)).select().single();if(!le.error&&le.data){qa(xe(le.data)),m+=1;continue}H&&await c.storage.from("quest-job-files").remove([q])}qa(Ce)}i.sync=m===l.length?{label:"Quest Supabase live",mode:"live"}:{label:m?"Some files saved locally":"File record saved locally",mode:m?"loading":"local"},i.modal="",k(d("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),{replace:!0})}function Ws(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.name||"").trim();if(!a){i.sync={label:"Folder name is required",mode:"local"},p();return}const n=ca({id:`folder-${crypto.randomUUID()}`,company_id:u(),name:a,parent_key:t.parent_key||"home",created_by_label:C().profile.full_name||"Quest HQ",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});i.driveFolders.unshift(n),i.modal="",i.sync={label:"Folder created locally",mode:"local"},V(),p()}function Ys(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=D(t.job_id),s=String(t.id||"").trim()?be(String(t.id).trim()):null,o=$t({...t,id:String(t.id||"").trim()||`invoice-${crypto.randomUUID()}`,company_id:a,client_name:String(t.client_name||n?.client_name||"").trim(),total:E(t.subtotal)+E(t.tax),updated_at:new Date().toISOString()});tr(o),s?.job_id&&s.job_id!==o.job_id&&Mt(s.job_id),Mt(o.job_id),i.modal="",i.sync={label:"Finance saved locally",mode:"local"},k(d("finance",{invoice:o.id},a),{replace:!0})}function Ks(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=be(t.invoice_id);if(!n||n.company_id!==a){i.sync={label:"Create an invoice before recording a payment",mode:"local"},p();return}const s=wt({...t,id:`payment-${crypto.randomUUID()}`,company_id:a,created_at:new Date().toISOString()});i.financePayments.unshift(s),n.status=ae(n.id)<=0?"Paid":"Partially paid",n.updated_at=new Date().toISOString(),Mt(n.job_id),V(),i.modal="",i.sync={label:"Payment recorded locally",mode:"local"},k(d("finance",s.invoice_id?{invoice:s.invoice_id}:{},a),{replace:!0})}function Gs(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=St({...t,id:String(t.id||"").trim()||`expense-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});ar(n),i.modal="",i.sync={label:"Expense saved locally",mode:"local"},k(d("finance",{expense:n.id},a),{replace:!0})}function Zs(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=kt({...t,id:String(t.id||"").trim()||`vendor-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});ir(n),i.modal="",i.sync={label:"Vendor saved locally",mode:"local"},k(d("finance",{vendor:n.id},a),{replace:!0})}async function Xs(e){const t=i.files.find(s=>s.id===e);if(!t?.object_path){i.sync={label:"No stored object for this file",mode:"local"},p();return}const a=L();if(!a)return;const n=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(n.error||!n.data?.signedUrl){i.sync={label:"Download failed",mode:"local"},p();return}window.open(n.data.signedUrl,"_blank","noopener,noreferrer")}async function er(e){const t=i.files.find(n=>n.id===e);if(!t)return;const a=L();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),i.files=i.files.filter(n=>n.id!==e),i.selectedFileId="",i.modal="",V(),p()}function At(e){const t=i.jobs.findIndex(a=>a.id===e.id);t>=0?i.jobs[t]=e:i.jobs.unshift(e),i.selectedJobId=e.id,V()}function Da(e){const t=i.tasks.findIndex(a=>a.id===e.id);t>=0?i.tasks[t]=e:i.tasks.unshift(e),i.selectedTaskId=e.id,V()}function qa(e){const t=i.files.findIndex(a=>a.id===e.id);t>=0?i.files[t]=e:i.files.unshift(e),V()}function tr(e){const t=i.financeInvoices.findIndex(a=>a.id===e.id);t>=0?i.financeInvoices[t]=e:i.financeInvoices.unshift(e),V()}function ar(e){const t=i.financeExpenses.findIndex(a=>a.id===e.id);t>=0?i.financeExpenses[t]=e:i.financeExpenses.unshift(e),V()}function ir(e){const t=i.financeVendors.findIndex(a=>a.id===e.id);t>=0?i.financeVendors[t]=e:i.financeVendors.unshift(e),V()}function tt(e){const t=i.memberships.findIndex(a=>a.company_id===e.company_id&&a.profile_id===e.profile_id);t>=0?i.memberships[t]=e:i.memberships.unshift(e),V()}function Ca(e){i.roleAssignments=i.roleAssignments.filter(t=>t.company_id!==e.company_id||t.profile_id!==e.profile_id),e.role_id&&i.roleAssignments.unshift(e)}function li(e){return{company_id:e.company_id,profile_id:e.profile_id,role:e.role,status:e.status}}function Mt(e){if(!e)return;const t=D(e);t&&(t.invoice_total=K(fe(t.company_id).filter(a=>a.job_id===e),"total"),t.updated_at=new Date().toISOString(),At(t))}function ze(){const e=document.getElementById("workspace");e&&(ci(i.route),e.innerHTML=ni(i.route))}function mt(){const e=Zt(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/"||e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:u(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const n=a[2]||"jobs";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:n,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:u(),jobId:t.get("job_id")||""}}function nr(){const e=Zt(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||Ze(t.get("job_id")||t.get("project_id"))||localStorage.getItem(pe)||A(),n=Object.fromEntries(Object.entries(Ji).map(([l,c])=>[l,d(c,{},a)]));Object.assign(n,{"/index.html":d("jobs",{},a),"/command.html":d("jobs",{},a),"/login.html":"/login"});let s=n[e];if(e==="/jobs"){const l=t.get("tab");l==="tasks"?s=d("tasks",Y(t,["job_id","task_id","new","edit"]),a):l==="files"?s=d("files",Y(t,["job_id","folder"]),a):l==="forms"?s=d("forms",Y(t,["job_id"]),a):l==="analytics"?s=d("analytics",Y(t,["job_id"]),a):s=d("jobs",Y(t,["job_id","tab"]),a)}if(e==="/files"&&(s=d("files",Y(t,["job_id","folder"]),a)),e==="/forms"&&(s=d("forms",Y(t,["job_id"]),a)),e==="/analytics"&&(s=d("analytics",Y(t,["job_id"]),a)),e==="/crm"&&(s=d("crm",Y(t,["account"]),a)),e==="/finance"&&(s=d("finance",Y(t,["invoice","expense","vendor","report"]),a)),e==="/admin"&&(s=d("settings",{},a)),e==="/time"&&(s=d("time",{},a)),e==="/team"&&(s=d("team-chart",{},a)),e==="/team-chart"&&(s=d("team-chart",{},a)),e==="/approvals"&&(s=d("approvals",{},a)),e==="/clock"&&(s=d("clock",{},a)),e==="/task-management.html"){const l=t.get("project_id")||t.get("job_id")||"";s=d("tasks",l?{job_id:l}:{},Ze(l)||a)}const o=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(o){const l=decodeURIComponent(o[1]);s=d("tasks",{job_id:l},Ze(l)||a)}s&&window.history.replaceState({},"",b(s))}function sr(e){if(e.name!=="company")return"";const t=qe();if(i.session?.auth==="supabase"&&!t.length)return null;if(!t.includes(e.companyId))return d(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||A());if(!dt.map(s=>s.id).includes(e.section))return d("jobs",{},e.companyId);const n=e.jobId?Ze(e.jobId):"";return n&&n!==e.companyId&&t.includes(n)?d(e.section,Object.fromEntries(e.params.entries()),n):""}function Zt(){let e=window.location.pathname||"/";return ye&&e.startsWith(ye)&&(e=e.slice(ye.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function b(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),n=t.startsWith("/")?t:"/"+t;return`${ye}${n}${a?`?${a}`:""}`||"/"}function k(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(ye+"/")||ye===""&&e.startsWith("/")?e:b(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),p()}function rr(){return`${Zt()}${window.location.search}`}function Xt(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?b(d("jobs",{},A())):`${t.pathname}${t.search}`}catch{return b(d("jobs",{},A()))}}function d(e="jobs",t={},a=u()){const n=new URLSearchParams(t);for(const[s,o]of[...n.entries()])(o==null||o==="")&&n.delete(s);return`/company/${encodeURIComponent(_(a||A()))}/${e}${n.toString()?`?${n.toString()}`:""}`}function or(e){return e.name==="company"?F(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":F(e.name||"Workspace")}function lr(e,t){const[a]=t.split("?"),n=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!n||e.name!=="company"?!1:e.companyId===decodeURIComponent(n[1])&&e.section===n[2]}function cr(e){return Ra.includes(e)?e:"pipeline"}function dr(e){return{pipeline:"Pipeline",list:"List",profile:"Profile"}[e]||e}function ur(e){const t=e.companyId||i.activeCompanyId||A(),a=qe();i.activeCompanyId=a.includes(t)?t:a[0]||A(),localStorage.setItem(pe,i.activeCompanyId)}function ci(e){const t=u();e.jobId&&O(t).some(n=>n.id===e.jobId)&&(i.selectedJobId=e.jobId),(!i.selectedJobId||!O(t).some(n=>n.id===i.selectedJobId))&&(i.selectedJobId=O(t)[0]?.id||"");const a=e.params.get("task_id");a&&z(t).some(n=>n.id===a)&&(i.selectedTaskId=a),e.section!=="tasks"&&(i.selectedTaskId=""),i.driveFolder=e.params.get("folder")||"home"}function pr(e){const t=qe(),a=_(e),n=t.includes(a)?a:t[0]||A();i.activeCompanyId=n,localStorage.setItem(pe,n),mr();const s=i.route||mt(),o=s.name==="company"?s.section:"jobs";k(d(o,{},n))}function mr(){i.modal="",i.selectedJobId="",i.selectedTaskId="",i.selectedFileId="",i.selectedFormId="",i.selectedQuestionId="",i.selectedFinanceInvoiceId="",i.selectedFinanceExpenseId="",i.selectedFinanceVendorId="",i.query="",i.fileQuery="",i.formQuery="",i.crmQuery="",i.stageFilter="all",i.crmStageFilter="all",i.crmOwnerFilter="all",i.taskStatusFilter="all",i.taskPriorityFilter="all",i.fileCategoryFilter="All categories",i.formTypeFilter="all",i.formsTab="library",i.driveFolder="home"}function fr(e){const t=D(e);t&&(i.selectedJobId=e,k(d("jobs",{tab:"profile",job_id:e},t.company_id)))}function br(e){const t=ea(e);t&&(i.selectedTaskId=e,k(d("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function ue(){return D(i.selectedJobId)||O(u())[0]||null}function D(e){return i.jobs.find(t=>t.id===e)||null}function ea(e){return i.tasks.find(t=>t.id===e)||null}function O(e=u()){return i.jobs.filter(t=>t.company_id===e)}function z(e=u()){return i.tasks.filter(t=>t.company_id===e)}function me(e=u()){return i.files.filter(t=>t.company_id===e)}function Me(e=u()){return i.driveFolders.filter(t=>t.company_id===e)}function ne(e=u()){return i.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function gr(e=u()){const t=new Map;ne(e).forEach(n=>{t.set(n.id,{profile_id:"",member_id:n.id,name:n.full_name||n.name,email:n.email,avatar_url:n.avatar_url,role:at(e,n.id).toLowerCase(),role_label:at(e,n.id),role_id:"",status:n.active?"active":"disabled"})}),i.memberships.filter(n=>n.company_id===e).forEach(n=>{const s=ui(n.profile_id),o=n.member_id?i.teamMembers.find(v=>v.id===n.member_id):null,l=i.roleAssignments.find(v=>v.company_id===e&&v.profile_id===n.profile_id),c=l?di(e,l.role_id):null,m=n.profile_id||n.member_id;t.set(m,{profile_id:n.profile_id,member_id:n.member_id,name:s?.full_name||o?.full_name||s?.email||o?.name||m||"User",email:s?.email||o?.email||"",avatar_url:s?.avatar_url||o?.avatar_url||"",role:n.role,role_label:c?.name||F(n.role),role_id:l?.role_id||xt(e,n.role),status:n.status||"active"})});const a=C().profile;if(i.session?.auth==="supabase"&&a?.id&&!t.has(a.id)){const n=it(e,a.id);n&&t.set(a.id,{profile_id:a.id,member_id:a.member_id||"",name:a.full_name||a.email,email:a.email,avatar_url:a.avatar_url,role:n.role,role_label:F(n.role),role_id:xt(e,n.role),status:n.status||"active"})}return[...t.values()].sort((n,s)=>(n.status==="active"?0:1)-(s.status==="active"?0:1)||n.name.localeCompare(s.name))}function Qe(e=u()){const t=i.roles.filter(a=>a.company_id===e);return t.length?t.sort((a,n)=>n.priority-a.priority||a.name.localeCompare(n.name)):[_e({id:`owner-${e}`,company_id:e,name:"Owner",color:"#f0b23b",priority:1e3,is_system:!0}),_e({id:`admin-${e}`,company_id:e,name:"Admin",color:"#60a5fa",priority:800,is_system:!0}),_e({id:`staff-${e}`,company_id:e,name:"Staff",color:"#15803d",priority:100,is_system:!0})]}function di(e,t){return Qe(e).find(a=>a.id===t)||null}function xt(e,t){const a=String(t||"").toLowerCase();return Qe(e).find(n=>n.name.toLowerCase()===a||n.id.toLowerCase()===a)?.id||""}function vr(e){const t=String(e?.name||"").toLowerCase().replace(/\s+/g,"_");return["owner","member","worker","sales","supervisor","admin","developer","construction_supervisor"].includes(t)?t:"member"}function ui(e){return i.profiles.find(t=>t.id===e)||(C().profile.id===e?C().profile:null)}function pi(e=u()){const t=i.query.trim().toLowerCase();return O(e).filter(a=>i.stageFilter!=="all"&&a.stage!==i.stageFilter?!1:t?[a.name,a.client_name,a.contact_name,a.owner_name,a.site_address,a.job_type,j(a.company_id)].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function ft(e=u()){const t=new Map;return O(e).forEach(a=>{const n=String(a.client_name||"").trim()||"Unassigned customer",s=`account-${va(n.toLowerCase())}`;t.has(s)||t.set(s,{key:s,name:n,jobs:[]}),t.get(s).jobs.push(a)}),Array.from(t.values()).map(a=>{const n=a.jobs.slice().sort((q,H)=>Date.parse(H.updated_at||H.created_at||0)-Date.parse(q.updated_at||q.created_at||0)),s=n[0]||null,o=n.map(q=>q.id),l=z(e).filter(q=>o.includes(q.project_id)),c=re(e).filter(q=>o.includes(q.linked_job_id)),m=me(e).filter(q=>o.includes(q.job_id)),v=Z(n.map(q=>q.contact_name)),f=Z(n.map(q=>q.owner_name)),h=Z(n.map(q=>q.site_address)),R=n.map(q=>q.priority||"Medium").sort((q,H)=>je(H)-je(q))[0]||"Medium";return{...a,jobs:n,tasks:l,latestJob:s,contacts:v,owners:f,addresses:h,forms:c,files:m,primaryContact:v[0]||"No contact",owner:f[0]||"Unassigned",stage:s?.stage||"Lead",priority:R,estimateTotal:K(n,"estimate_total"),fileCount:m.length,formCount:c.length,updatedAt:s?.updated_at||s?.created_at||new Date().toISOString(),subtitle:h[0]||`${n.length} linked job${n.length===1?"":"s"}`}}).sort((a,n)=>Date.parse(n.updatedAt||0)-Date.parse(a.updatedAt||0))}function yr(e=u()){const t=i.crmQuery.trim().toLowerCase();return ft(e).filter(a=>i.crmStageFilter!=="all"&&!a.jobs.some(n=>n.stage===i.crmStageFilter)||i.crmOwnerFilter!=="all"&&!a.owners.includes(i.crmOwnerFilter)?!1:t?[a.name,a.primaryContact,a.owner,a.stage,...a.addresses,...a.contacts,...a.jobs.map(n=>n.name)].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function _r(e,t){return ft(e).find(a=>a.key===t)||null}function hr(e=u()){return Z(O(e).map(t=>t.owner_name)).sort((t,a)=>t.localeCompare(a))}function mi(e=u()){const t=C().profile.member_id||"",a=z(e).slice().sort(Ia),n=a.filter(ta),s=n.filter(h=>h.due===w(0)),o=n.filter(h=>Ea(h.due)<0),l=n.filter(h=>{const R=Ea(h.due);return R>=0&&R<=7}),c=n.filter(h=>h.assignee_id===t),m=n.filter(h=>["review","pending"].includes(h.status)),v=a.filter(h=>h.status==="done"),f=Z(o.concat(s,c,m,l).map(h=>h.id)).map(h=>a.find(R=>R.id===h)).filter(Boolean).sort(Ia);return{tasks:a,open:n,dueToday:s,overdue:o,thisWeek:l,assignedToMe:c,review:m,done:v,focus:f}}function fi(e=u()){const t=re(e).filter(s=>(s.require_approval||s.type==="Client approval")&&!["Archived","Closed","Approved"].includes(s.status)).map(s=>({id:`form:${s.id}`,title:s.title,meta:D(s.linked_job_id)?.name||s.description||"Company form",type:"Form approval",owner:B(s.creator_id),status:s.status,updatedAt:s.updated_at||s.created_at,href:d("forms",{form_id:s.id},e)})),a=z(e).filter(s=>["review","pending"].includes(s.status)).map(s=>({id:`task:${s.id}`,title:s.title,meta:D(s.project_id)?.name||s.description||"Company task",type:"Task review",owner:B(s.assignee_id),status:oe(s.status),updatedAt:s.updated_at||s.due,href:d("tasks",{...s.project_id?{job_id:s.project_id}:{},task_id:s.id},e)})),n=i.memberships.filter(s=>s.company_id===e&&s.status!=="active").map(s=>({id:`access:${s.profile_id||s.member_id}`,title:B(s.member_id||s.profile_id),meta:`${F(s.role)} access request`,type:"Access request",owner:"Quest admin",status:F(s.status),updatedAt:new Date().toISOString(),href:d("settings",{tab:"access"},e)}));return t.concat(a,n).sort((s,o)=>Date.parse(o.updatedAt||0)-Date.parse(s.updatedAt||0))}function bt(e=u()){const t=i.activeTimer;return!t||t.company_id!==e?null:t}function bi(e=u()){return i.timeEntries.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.started_at||0)-Date.parse(t.started_at||0))}function Fa(e=u(),t=0){return bi(e).filter(a=>Date.parse(a.started_at||0)>=t).reduce((a,n)=>a+E(n.duration_ms),0)}function $r(e=u(),t=""){i.activeTimer&&gi(!1);const a=t?ea(t):null;i.activeTimer={id:`timer-${crypto.randomUUID()}`,company_id:e,user_id:C().profile.member_id||C().profile.id,task_id:a?.company_id===e?a.id:"",task_title:a?.company_id===e?a.title:"",started_at:new Date().toISOString()},Fi(),i.sync={label:"Clock started locally",mode:"local"},p()}function gi(e=!0){const t=i.activeTimer;if(!t)return;const a=new Date().toISOString(),n=Math.max(0,Date.parse(a)-Date.parse(t.started_at||a));i.timeEntries.unshift({id:`time-${crypto.randomUUID()}`,company_id:t.company_id,user_id:t.user_id,task_id:t.task_id||"",task_title:t.task_title||"",started_at:t.started_at,ended_at:a,duration_ms:n,notes:t.task_title?"Task timer":"General shift"}),i.activeTimer=null,Fi(),i.sync={label:"Clock stopped locally",mode:"local"},e&&p()}function ta(e){return e.status!=="done"}function Ia(e,t){const a=Date.parse(e.due||0)-Date.parse(t.due||0);return a||je(t.priority)-je(e.priority)}function fe(e=u()){return i.financeInvoices.filter(t=>t.company_id===e).sort(Te("updated_at"))}function vi(e=u()){return i.financePayments.filter(t=>t.company_id===e)}function aa(e=u()){return i.financeExpenses.filter(t=>t.company_id===e).sort(Te("updated_at"))}function ia(e=u()){return i.financeVendors.filter(t=>t.company_id===e)}function be(e){return i.financeInvoices.find(t=>t.id===e)||null}function yi(e){return i.financeExpenses.find(t=>t.id===e)||null}function na(e){return i.financeVendors.find(t=>t.id===e)||null}function Et(e){return na(e)?.name||"No vendor"}function _i(e){return i.financePayments.filter(t=>t.invoice_id===e).sort(Te("received_at"))}function sa(e){return K(_i(e),"amount")}function ae(e){const t=be(e);return Math.max(0,E(t?.total)-sa(e))}function hi(e){const t=ae(e.id);return t<=0&&E(e.total)>0?"Paid":t<E(e.total)?"Partially paid":e.status==="Sent"&&Li(e.due_date)>0?"Overdue":e.status}function $i(e=u()){const t=fe(e),a=vi(e),n=aa(e).filter(c=>["Approved","Paid"].includes(c.status)),s={current:0,thirty:0,sixty:0,overSixty:0};t.forEach(c=>{const m=ae(c.id);if(!m)return;const v=Li(c.due_date);v<=0?s.current+=m:v<=30?s.thirty+=m:v<=60?s.sixty+=m:s.overSixty+=m});const o=K(a,"amount"),l=K(n,"amount");return{pipeline:K(O(e),"estimate_total"),invoiced:K(t,"total"),collected:o,outstanding:t.reduce((c,m)=>c+ae(m.id),0),expenses:l,net:o-l,aging:s}}function wr(e=u(),t=""){const a=i.query.trim().toLowerCase();return z(e).filter(n=>t&&n.project_id!==t||i.taskStatusFilter!=="all"&&n.status!==i.taskStatusFilter||i.taskPriorityFilter!=="all"&&n.priority!==i.taskPriorityFilter?!1:a?[n.title,n.description,He(n.type),B(n.assignee_id),D(n.project_id)?.name].some(s=>String(s||"").toLowerCase().includes(a)):!0)}function wi(){const e=qe();return i.companies.filter(t=>e.includes(t.id))}function ra(e,t=u()){if(!e)return!0;const a=C().profile;if(i.session?.auth==="supabase"){const o=it(t,a.id);if(!o||o.status!=="active")return!1;if(["owner","developer"].includes(String(o.role).toLowerCase()))return!0;const l=i.roleAssignments.filter(m=>m.company_id===t&&m.profile_id===a.id).map(m=>m.role_id),c=i.rolePermissions.filter(m=>l.includes(m.role_id));if(c.some(m=>(m.permission_key===e||m.permission_key==="*")&&m.effect==="deny"))return!1;if(c.some(m=>(m.permission_key===e||m.permission_key==="*")&&m.effect==="allow"))return!0}const n=String(it(t,a.id)?.role||a.role||"member").toLowerCase(),s=ya[n]||ya.member;return s.includes("*")||s.includes(e)}function qe(){const e=C().profile,t=i.companies.map(s=>s.id);if(i.session?.auth==="supabase"){const s=i.memberships.filter(o=>o.profile_id===e.id&&o.status==="active").map(o=>_(o.company_id));return Z(s).filter(o=>t.includes(o))}if(["developer","admin"].includes(e.role))return Z(t.length?t:Ue.map(s=>_(s.id)));const a=i.memberships.filter(s=>s.profile_id===e.id&&s.status!=="disabled").map(s=>_(s.company_id)),n=a.length?a:e.company_ids||[];return Z(n.map(_)).filter(s=>t.includes(s))}function u(){const e=qe();return e.includes(i.activeCompanyId)?i.activeCompanyId:e[0]||i.activeCompanyId||A()}function A(){return _(Ue[0].id)}function gt(e){const t=_(e);return i.companies.find(a=>a.id===t)||Ue.map(Ve).find(a=>a.id===t)||null}function j(e){const t=gt(e);return t?vt(t):e||"Company"}function vt(e){return e.short_name||e.label||e.name||e.id}function se(e){return gt(e)?.color||"#f0b23b"}function Ze(e){return _(i.jobs.find(t=>t.id===e)?.company_id||"")}function yt(e){const t=C().profile;return i.session?.auth!=="supabase"&&["developer","admin"].includes(t.role)?F(t.role):F(it(e,t.id)?.role||t.role||"member")}function at(e,t){const a=i.memberships.find(n=>n.company_id===e&&(n.member_id===t||n.profile_id===t));return F(a?.role||"member")}function it(e,t){return i.memberships.find(a=>a.company_id===e&&a.profile_id===t)||null}function oa(e=u()){return i.subscriptions.find(t=>t.company_id===e)||null}function la(e=u()){if(i.session?.auth!=="supabase")return!0;const t=oa(e);return!!(!t||["trialing","active","past_due","grace"].includes(t.status)||t.grace_ends_at&&Date.parse(t.grace_ends_at)>Date.now())}function Si(e=u()){const t=oa(e);return t?t.status==="trialing"?`Trial - ${T(t.trial_ends_at)}`:t.status==="active"?"Active subscription":t.status==="past_due"?"Past due grace":t.status==="grace"?`Grace - ${T(t.grace_ends_at)}`:F(t.status):i.session?.auth==="supabase"?"Trial pending":"Demo mode"}function B(e){const t=i.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function _t(e){return i.tasks.filter(t=>t.project_id===e).length}function nt(e){return i.files.filter(t=>t.job_id===e).length}function _(e){return{"quest-roofing":"roofing","quest-drafting":"drafting"}[String(e||"").trim()]||String(e||"").trim()}function ki(e){const t=new Map;return e.map(Ve).forEach(a=>{!a.id||t.has(a.id)||t.set(a.id,a)}),Array.from(t.values())}function Ve(e){return{id:_(e.id||""),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function Se(e){return{id:String(e.id||""),company_id:_(e.company_id||A()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:Pe.includes(e.stage)?e.stage:"Lead",priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:E(e.estimate_total),invoice_total:E(e.invoice_total),task_count:E(e.task_count),file_count:E(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function ke(e){const t=Xe.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=Re.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:La.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:_(e.company_id||A()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||w(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:Xe.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function xe(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:_(e.company_id||A()),job_id:String(e.job_id||""),folder:String(e.folder||po(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:E(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ca(e){return{id:String(e.id||`folder-${crypto.randomUUID()}`),company_id:_(e.company_id||A()),name:String(e.name||"New folder").trim()||"New folder",parent_key:String(e.parent_key||"home"),created_by_label:String(e.created_by_label||"Quest HQ"),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Je(e){const t=Array.isArray(e.questions)?e.questions.map(ht):[],a=Le.includes(e.type)?e.type:"Internal",n=Yt.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:_(e.company_id||A()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:n,audience:String(e.audience||"Internal").trim(),creator_id:String(e.creator_id||e.created_by||e.created_by_id||""),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ht(e){const t=Ne.some(([n])=>n===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(n=>String(n||"").trim()).filter(Boolean):[]};return Oe(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function da(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:_(e.company_id||A()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function $t(e){const t=E(e.subtotal),a=E(e.tax),n=E(e.total)||t+a;return{id:String(e.id||`invoice-${crypto.randomUUID()}`),company_id:_(e.company_id||A()),job_id:String(e.job_id||""),client_name:String(e.client_name||"").trim(),invoice_number:String(e.invoice_number||`INV-${Date.now()}`).trim(),status:Na.includes(e.status)?e.status:"Draft",issue_date:String(e.issue_date||w(0)).slice(0,10),due_date:String(e.due_date||w(30)).slice(0,10),subtotal:t,tax:a,total:n,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function wt(e){return{id:String(e.id||`payment-${crypto.randomUUID()}`),company_id:_(e.company_id||A()),invoice_id:String(e.invoice_id||""),amount:E(e.amount),method:Va.includes(e.method)?e.method:"ACH",received_at:String(e.received_at||w(0)).slice(0,10),reference:String(e.reference||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString()}}function St(e){return{id:String(e.id||`expense-${crypto.randomUUID()}`),company_id:_(e.company_id||A()),job_id:String(e.job_id||""),vendor_id:String(e.vendor_id||""),category:ut.includes(e.category)?e.category:"Other",amount:E(e.amount),status:Ua.includes(e.status)?e.status:"Pending",spent_at:String(e.spent_at||w(0)).slice(0,10),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function kt(e){return{id:String(e.id||`vendor-${crypto.randomUUID()}`),company_id:_(e.company_id||A()),name:String(e.name||"New vendor").trim()||"New vendor",contact_name:String(e.contact_name||"").trim(),email:String(e.email||"").trim(),phone:String(e.phone||"").trim(),category:ut.includes(e.category)?e.category:"Other",status:Qa.includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ua(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,supervisor_id:String(e.supervisor_id||e.manager_id||""),company_ids:Array.isArray(e.company_ids)?Z(e.company_ids.map(_)):[]}}function st(e){return{company_id:_(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:String(e.status||"active")}}function Sr(e){return{company_id:_(e.company_id||""),status:String(e.status||"trialing"),plan_code:String(e.plan_code||"quest_company_300"),amount_cents:E(e.amount_cents||3e4),currency:String(e.currency||"usd"),stripe_customer_id:String(e.stripe_customer_id||""),stripe_subscription_id:String(e.stripe_subscription_id||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||""}}function _e(e){return{id:String(e.id||""),company_id:_(e.company_id||""),name:String(e.name||"Role").trim()||"Role",color:String(e.color||"#f0b23b"),priority:E(e.priority),is_system:e.is_system===!0,created_by:String(e.created_by||"")}}function Ot(e){return{role_id:String(e.role_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function ji(e){return{company_id:_(e.company_id||""),profile_id:String(e.profile_id||""),role_id:String(e.role_id||""),assigned_by:String(e.assigned_by||"")}}function kr(e){return{id:String(e.id||""),company_id:_(e.company_id||""),resource_type:String(e.resource_type||""),resource_id:String(e.resource_id||""),principal_type:String(e.principal_type||""),principal_id:String(e.principal_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function jr(e){return{id:String(e.id||""),company_id:_(e.company_id||""),resource_type:String(e.resource_type||""),field_key:String(e.field_key||""),role_id:String(e.role_id||""),visibility:["visible","masked","hidden"].includes(e.visibility)?e.visibility:"visible",editable:e.editable!==!1}}function Dr(e){return{id:String(e.id||""),company_id:_(e.company_id||""),email:String(e.email||""),role_id:String(e.role_id||""),status:String(e.status||"pending"),expires_at:e.expires_at||"",invited_by:String(e.invited_by||"")}}function Di(e){return{id:String(e.id||""),company_id:_(e.company_id||""),profile_id:String(e.profile_id||""),requested_email:String(e.requested_email||""),status:String(e.status||"pending"),message:String(e.message||""),reviewed_by:String(e.reviewed_by||""),created_at:e.created_at||""}}function qr(e=u()){return Se({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function Cr(e=u(),t=""){return ke({id:"",title:"",company_id:e,project_id:t,assignee_id:ne(e)[0]?.id||"abraham",creator_id:C().profile.member_id||"abraham",due:w(1),priority:"medium",status:"todo",type:"admin"})}function Fr(e=u()){const t=ue();return $t({id:"",company_id:e,job_id:t?.company_id===e?t.id:"",client_name:t?.company_id===e?t.client_name:"",invoice_number:mo(e),status:"Draft",issue_date:w(0),due_date:w(30),subtotal:t?.company_id===e?t.estimate_total:0,tax:0,notes:""})}function Ir(e=u(),t=""){const a=t?be(t):fe(e).find(s=>ae(s.id)>0),n=a?.company_id===e?a:null;return wt({id:"",company_id:e,invoice_id:n?.id||"",amount:n?ae(n.id):0,method:"ACH",received_at:w(0),reference:"",notes:""})}function Ar(e=u(),t=""){return St({id:"",company_id:e,job_id:ue()?.company_id===e?ue().id:"",vendor_id:t||ia(e)[0]?.id||"",category:"Materials",status:"Pending",amount:0,spent_at:w(0),notes:""})}function Mr(e=u()){return kt({id:"",company_id:e,name:"",category:"Materials",status:"Active"})}function xr(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function Er(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function C(){return i.session?i.session.auth==="supabase"?i.session:{...i.session,profile:{...Tt().profile,...i.session.profile||{},...i.profileDraft||{}}}:Tt()}function Or(e,t){return{auth:"supabase",access_token:e.access_token,refresh_token:e.refresh_token,user:{id:e.user.id,email:e.user.email||""},profile:pa(t||{},{id:e.user.id,email:e.user.email||"",full_name:e.user.user_metadata?.full_name||e.user.email||"Quest user",role:"member",member_id:"",company_ids:[],avatar_url:""})}}function Tt(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",...i.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:$e.localUsername,email:e.email},profile:e}}function pa(e,t={}){const a=String(e.role||t.role||"member").toLowerCase();return{id:String(e.id||t.id||""),email:String(e.email||t.email||""),full_name:String(e.full_name||t.full_name||e.email||t.email||"Quest user"),role:a,role_label:F(a),member_id:String(e.member_id||t.member_id||""),company_ids:Array.isArray(e.company_ids)?Z(e.company_ids.map(_)):t.company_ids||[],avatar_url:String(e.avatar_url||t.avatar_url||""),approved:e.approved!==!1,supervisor_id:String(e.supervisor_id||t.supervisor_id||"")}}function Q(e,t,a=""){const n=ai();return`
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${G(n)}</span>
        <div>
          <div class="context-line"><span>${r(j(u()))}</span><b>${r(yt(u()))}</b></div>
          <h1>${r(e)}</h1>
          <p>${r(t)}</p>
        </div>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function Tr(e){return`<section class="metric-grid">${e.map(([t,a])=>`<article class="metric">${G(ii(t),"metric-symbol")}<span>${r(t)}</span><strong>${r(a)}</strong></article>`).join("")}</section>`}function Pr(e){return`
    <button class="queue-row" type="button" data-select-job="${r(e.id)}">
      <span><strong>${r(e.name)}</strong><small>${r(e.client_name||j(e.company_id))}</small></span>
      ${ma(e.priority)}
      <b>${r(e.stage)}</b>
    </button>
  `}function jt(e){return`
    <button class="queue-row" type="button" data-select-task="${r(e.id)}">
      <span><strong>${r(e.title)}</strong><small>${r(D(e.project_id)?.name||j(e.company_id))}</small></span>
      ${qi(e.priority)}
      <b>${r(oe(e.status))}</b>
    </button>
  `}function Rr(e){return`
    <button class="job-card priority-${r(e.priority.toLowerCase())} ${e.id===i.selectedJobId?"active":""}" type="button" data-select-job="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.client_name||"No client")}</span>
      <small>${r(j(e.company_id))} - ${r(e.owner_name||"Unassigned")}</small>
      <em>${r(_t(e.id))} tasks</em>
    </button>
  `}function We(e,t,a,n){return`
    <a class="mini-link" href="${b(e)}" data-router>
      <i class="ti ${r(t)}"></i>
      <span><strong>${r(a)}</strong><small>${r(n)}</small></span>
    </a>
  `}function N(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${r(t)}</span><strong>${r(a)}</strong></div>`).join("")}</div>`}function S(e,t,a="",n=!1,s="text",o=""){return`<label class="${r(o)}"><span>${r(e)}</span><input name="${r(t)}" type="${r(s)}" value="${r(a)}" ${n?"required":""} /></label>`}function ie(e,t,a="",n=""){return`<label class="${r(n)}"><span>${r(e)}</span><textarea name="${r(t)}" rows="4">${r(a)}</textarea></label>`}function P(e,t,a,n){return`
    <label><span>${r(e)}</span><select name="${r(t)}">
      ${n.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function ma(e){return`<span class="priority ${r(String(e).toLowerCase())}">${r(e)}</span>`}function qi(e){return`<span class="priority ${r(e)}">${r(F(e))}</span>`}function Ci(e){return`<span class="status-pill ${r(e)}">${r(oe(e))}</span>`}function Lr(e){return`<span class="finance-status ${r(va(e))}">${r(e)}</span>`}function Be(e,t){if(e.avatar_url)return`<span class="${r(t)}"><img src="${r(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(n=>n[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${r(t)}">${r(a)}</span>`}function g(e){return`<div class="empty-state">${G("q-empty","empty-symbol")}<span>${r(e)}</span></div>`}function Y(e,t){const a={};return t.forEach(n=>{const s=e.get(n);s&&(a[n]=s)}),a}function V(){i.session?.auth!=="supabase"&&(M(Rt,i.jobs),M(Lt,i.tasks),M(Nt,i.files),M(Ut,i.driveFolders),M(De,i.forms),M(ot,i.formResponses),M(Jt,i.financeInvoices),M(Bt,i.financePayments),M(Ht,i.financeExpenses),M(zt,i.financeVendors),M(lt,i.timeEntries),M(ct,i.activeTimer),M(Qt,i.teamMembers),M(Vt,i.memberships))}function Fi(){i.session?.auth!=="supabase"&&(M(lt,i.timeEntries),M(ct,i.activeTimer))}function $(e,t,a=""){return`<article class="metric">${G(ii(e),"metric-symbol")}<span>${r(e)}</span><strong>${r(t)}</strong>${a?`<small>${r(a)}</small>`:""}</article>`}function ce(e,t){return`<div><strong>${r(e)}</strong><span>${r(t)}</span></div>`}function he(e,t,a,n,s=""){const o=`
    <span><strong>${r(e)}</strong><small>${r(t||"Finance record")}</small></span>
    <b>${r(a)}</b>
    <em>${T(n)}</em>
  `;return s?`<a class="finance-compact-row" href="${b(s)}" data-router>${o}</a>`:`<div class="finance-compact-row">${o}</div>`}function Aa(e,t){const a=me(e);return t==="jobs"?a.filter(n=>n.job_id).length:a.filter(n=>n.folder===t).length}function Ii(e="home",t=null){return t?.id?`job:${t.id}`:e||"home"}function Nr(e,t="home",a=null){const n=Ii(t,a),s=Me(e).filter(o=>o.parent_key===n).map(o=>Ur(e,o));return a?s:t==="home"?Wt.map(([l,c,m,v])=>({id:l,name:c,caption:m,icon:v,href:b(d("files",{folder:l},e)),countLabel:`${Aa(e,l)} file${Aa(e,l)===1?"":"s"}`,updatedLabel:""})).concat(s):t==="jobs"?O(e).map(l=>({id:`job:${l.id}`,name:l.name,caption:l.client_name||j(e),icon:"ti-folder",href:b(d("files",{folder:"jobs",job_id:l.id},e)),countLabel:`${nt(l.id)} file${nt(l.id)===1?"":"s"}`,updatedLabel:T(l.updated_at)})).concat(s):s}function Ur(e,t){const a=Me(e).filter(o=>o.parent_key===t.id).length,n=me(e).filter(o=>o.folder===t.id).length,s=a+n;return{id:t.id,name:t.name,caption:"Custom folder",icon:"ti-folder",href:b(d("files",{folder:t.id},e)),countLabel:`${s} item${s===1?"":"s"}`,updatedLabel:T(t.updated_at)}}function Qr(e,t,a=null){if(a)return`<span>/</span><a href="${b(d("files",{folder:"jobs"},e))}" data-router>Jobs</a>`;const n=Me(e).find(m=>m.id===t);if(!n)return`<span>/</span><strong>${r(ee(t))}</strong>`;const s=[];let o=n;const l=new Set;for(;o&&!l.has(o.id);)l.add(o.id),s.unshift(o),o=Me(e).find(m=>m.id===o.parent_key);return`${n.parent_key&&!n.parent_key.startsWith("folder-")&&n.parent_key!=="home"?`<span>/</span><a href="${b(d("files",{folder:n.parent_key},e))}" data-router>${r(ee(n.parent_key))}</a>`:""}${s.map((m,v)=>`<span>/</span>${v===s.length-1?`<strong>${r(m.name)}</strong>`:`<a href="${b(d("files",{folder:m.id},e))}" data-router>${r(m.name)}</a>`}`).join("")}`}function Vr(e=u(),t="home",a=""){const n=(i.fileQuery||i.query||"").trim().toLowerCase(),s=i.fileCategoryFilter;let o=me(e);return a?o=o.filter(l=>l.job_id===a):t&&t!=="home"&&(t==="jobs"?o=o.filter(l=>l.job_id):o=o.filter(l=>l.folder===t)),s&&s!=="All categories"&&(o=o.filter(l=>String(l.category||ee(l.folder)).toLowerCase()===s.toLowerCase())),n&&(o=o.filter(l=>[l.file_name,l.category,l.uploaded_by_label,l.notes,l.object_path,D(l.job_id)?.name].some(c=>String(c||"").toLowerCase().includes(n)))),o.sort((l,c)=>new Date(c.created_at||0)-new Date(l.created_at||0))}function ge(e){const t=String(e.mime_type||"").toLowerCase(),a=Ai(e);return t.includes("pdf")||a==="pdf"?"PDF":t.includes("image")||["png","jpg","jpeg","gif","webp","svg"].includes(a)?"Image":t.includes("zip")||["zip","rar","7z"].includes(a)?"Archive":t.includes("spreadsheet")||t.includes("excel")||["xls","xlsx","csv"].includes(a)?"Excel":t.includes("word")||["doc","docx"].includes(a)?"Word":t.includes("text")||["txt","md","json","csv","log"].includes(a)?"Text":t.includes("presentation")||["ppt","pptx"].includes(a)?"PowerPoint":a?a.toUpperCase():ee(e.folder)}function fa(e){const t=ge(e).toLowerCase();return t==="pdf"?"pdf":t==="image"?"image":t==="excel"?"sheet":t==="text"?"text":["word","powerpoint"].includes(t)?"doc":t==="archive"?"zip":"doc"}function Ai(e){return String(e.file_name||"").split(".").pop()?.toLowerCase()||""}function ba(e,t=!1){const a=Ri(e);return e.signed_url?`<img src="${r(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${r(fa(e))} ${t?"large":""}"><i class="ti ${r(a)}"></i></span>`}function Jr(e){const t=ge(e),a=Ai(e);return t==="Image"?a&&a.length<=4?a.toUpperCase():"IMG":t==="Archive"?a&&a.length<=3?a.toUpperCase():"ZIP":t==="Excel"?a==="csv"?"CSV":"XLS":t==="Word"?"DOC":t==="PowerPoint"?"PPT":t==="Text"?a&&a.length<=4?a.toUpperCase():"TXT":t.length<=4?t.toUpperCase():(a||"FILE").slice(0,4).toUpperCase()}function re(e=u()){return i.forms.filter(t=>t.company_id===e)}function Br(e=u()){const t=i.formQuery.trim().toLowerCase(),a=i.route?.jobId||"";return re(e).filter(n=>a&&n.linked_job_id!==a||i.formTypeFilter!=="all"&&n.type!==i.formTypeFilter?!1:t?[n.title,n.description,n.type,n.status,n.audience,D(n.linked_job_id)?.name].some(s=>String(s||"").toLowerCase().includes(t)):!0)}function Ee(e=u()){const t=i.route?.jobId||"",a=re(e).filter(o=>!t||o.linked_job_id===t),n=i.route?.params?.get("form_id")||"";if(n&&a.some(o=>o.id===n)&&(i.selectedFormId=n),!a.length)return i.selectedFormId="",i.selectedQuestionId="",null;let s=a.find(o=>o.id===i.selectedFormId)||a[0];return i.selectedFormId=s.id,(!i.selectedQuestionId||!s.questions.some(o=>o.id===i.selectedQuestionId))&&(i.selectedQuestionId=s.questions[0]?.id||""),s}function ve(e){return i.forms.find(t=>t.id===e)||null}function te(){return ve(i.selectedFormId)||Ee(u())}function Mi(e=u()){return i.formResponses.filter(t=>t.company_id===e)}function Dt(e){return i.formResponses.filter(t=>t.form_id===e)}function xi(e){return Array.isArray(e?.questions)?e.questions.length:0}function Hr(e){const t=String(e?.creator_id||""),a=C().profile;return t?t&&(t===a.member_id||t===a.id)?a.full_name||"Quest Basic Mode":B(t):e?.created_by_label||a.full_name||"Quest HQ"}function Fe(e,t,a="",n=!1,s="text"){return`<label><span>${r(e)}</span><input data-form-field="${r(t)}" type="${r(s)}" value="${r(a)}" ${n?"required":""} /></label>`}function Ei(e,t,a=""){return`<label><span>${r(e)}</span><textarea data-form-field="${r(t)}" rows="3">${r(a)}</textarea></label>`}function Ye(e,t,a,n){return`
    <label><span>${r(e)}</span><select data-form-field="${r(t)}">
      ${n.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function Oe(e){return["multiple","checkbox","dropdown"].includes(e.type)}function zr(e){return{short:"ti-letter-t",paragraph:"ti-align-left",multiple:"ti-circle-dot",checkbox:"ti-checkbox",dropdown:"ti-select",date:"ti-calendar",rating:"ti-star",yesno:"ti-circle-check",file:"ti-paperclip"}[e]||"ti-plus"}function Wr(e){return Ne.find(([t])=>t===e)?.[1]||F(e||"Question")}function X(e,t){return`
    <div class="response-question">
      <label>
        <span>${r(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${r(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function Oi(e){const t=ve(e.form_id),a=Object.entries(e.answers||{}).map(([n,s])=>{const o=t?.questions.find(c=>c.id===n),l=Array.isArray(s)?s.join(", "):s;return ce(o?.label||n,l||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${r(t?.title||"Response")}</h2><p>${r(e.submitted_by||e.submitter_email||"Anonymous")} / ${T(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||ce("Response","No answers captured.")}</div>
  `}function Ie(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[U("short","Inspection address"),U("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),U("paragraph","Recommended scope"),U("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[U("short","Client name"),U("yesno","Approved to proceed?"),U("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[U("short","Request title"),U("dropdown","Priority",["Low","Medium","High","Urgent"]),U("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[U("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),U("yesno","Weather safe?"),U("paragraph","Safety notes")]}]}function Yr(e=u()){return Je({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:i.route?.jobId||"",theme_color:se(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[U("short","First question")]})}function U(e="short",t="Untitled question",a=[]){return ht({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function Kr(e,t={}){const a=Yr(e),n=Je({...a,...t,id:t.id||`form-${crypto.randomUUID()}`,company_id:e,questions:(t.questions||a.questions).map(s=>ht(s)),created_at:t.created_at||new Date().toISOString(),updated_at:new Date().toISOString()});return i.forms.unshift(n),i.selectedFormId=n.id,i.selectedQuestionId=n.questions[0]?.id||"",i.formsTab="builder",i.formEditorTab="questions",i.modal="",i.formStartTemplateId="",i.formStartTab="blank",J("New form created"),p(),n}function Gr(e){const t=Object.fromEntries(new FormData(e).entries()),a=t.template_id?Ie().find(l=>l.id===t.template_id):null,n=String(t.title||a?.title||"Untitled form").trim()||"Untitled form",s=String(t.description||a?.description||"").trim(),o=a?a.questions.map(l=>({...rt(l),id:`q-${crypto.randomUUID()}`})):[U("short","First question")];Kr(u(),{title:n,description:s,type:Le.includes(t.type)?t.type:a?.type||"Internal",audience:String(t.audience||"Internal").trim()||"Internal",creator_id:C().profile.member_id||C().profile.id||"basic-quest-user",linked_job_id:String(t.linked_job_id||""),theme_color:se(u()),background:"clean",submit_label:String(t.submit_label||"Submit").trim()||"Submit",collect_email:t.collect_email==="on",require_approval:t.require_approval==="on",questions:o})}function Ke(e,t=!0){const a=ve(e);a&&(i.selectedFormId=a.id,i.selectedQuestionId=a.questions[0]?.id||"",t&&p())}function J(e="Forms saved locally"){const t=te();t&&(t.updated_at=new Date().toISOString()),M(De,i.forms),M(ot,i.formResponses),i.sync={label:e,mode:"live"}}function Ma(e,t){const a=ve(e||i.selectedFormId);a&&(a.status=Yt.includes(t)?t:"Draft",i.selectedFormId=a.id,J(`${a.status} locally`),p())}function Zr(e){const t=ve(e||i.selectedFormId);if(!t)return;const a=Je({...rt(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(n=>({...rt(n),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});i.forms.unshift(a),i.selectedFormId=a.id,i.selectedQuestionId=a.questions[0]?.id||"",J("Form duplicated"),p()}function Xr(e){const t=e||i.selectedFormId;t&&(i.forms=i.forms.filter(a=>a.id!==t),i.formResponses=i.formResponses.filter(a=>a.form_id!==t),i.selectedFormId=re(u())[0]?.id||"",i.selectedQuestionId=Ee(u())?.questions[0]?.id||"",i.modal="",J("Form deleted locally"),p())}async function eo(e){const t=e||i.selectedFormId,a=`${window.location.origin}${b(d("forms",{form_id:t},u()))}`;try{await navigator.clipboard.writeText(a),i.sync={label:"Form link copied",mode:"live"}}catch{i.sync={label:"Copy failed",mode:"local"}}p()}function to(e){const t=JSON.stringify({company_id:e,forms:re(e),responses:Mi(e)},null,2);co(`${e}-forms-export.json`,t,"application/json")}function Ti(e){const t=te();if(!t)return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),M(De,i.forms))}function Pi(e){const t=te(),a=e.closest("[data-question-id]"),n=t?.questions.find(s=>s.id===a?.dataset.questionId);if(!(!t||!n)){if(i.selectedQuestionId=n.id,e.matches("[data-question-option]")){const s=Number(e.dataset.questionOption);n.options[s]=e.value}else{const s=e.dataset.questionField;if(s==="required")n.required=e.checked;else if(s==="type"){n.type=e.value,Oe(n)&&!n.options.length&&(n.options=["Option 1","Option 2"]),Oe(n)||(n.options=[]),J("Question updated"),p();return}else s&&(n[s]=e.value)}t.updated_at=new Date().toISOString(),M(De,i.forms)}}function ao(e="multiple"){const t=te();if(!t)return;const a=U(e,Ne.find(([n])=>n===e)?.[1]||"New question");t.questions.push(a),i.selectedQuestionId=a.id,J("Question added"),p()}function io(e){const t=te(),a=t?.questions.find(o=>o.id===e);if(!t||!a)return;const n=t.questions.findIndex(o=>o.id===e),s=ht({...rt(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(n+1,0,s),i.selectedQuestionId=s.id,J("Question duplicated"),p()}function no(e){const t=te();t&&(t.questions=t.questions.filter(a=>a.id!==e),i.selectedQuestionId=t.questions[0]?.id||"",J("Question deleted"),p())}function so(e,t){const a=te();if(!a||!t)return;const n=a.questions.findIndex(l=>l.id===e),s=n+t;if(n<0||s<0||s>=a.questions.length)return;const[o]=a.questions.splice(n,1);a.questions.splice(s,0,o),i.selectedQuestionId=e,J("Question moved"),p()}function ro(e){const a=te()?.questions.find(n=>n.id===e);a&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),J("Option added"),p())}function oo(e,t){const n=te()?.questions.find(s=>s.id===e);!n||t<0||(n.options.splice(t,1),n.options.length||n.options.push("Option 1"),J("Option removed"),p())}function lo(e){const t=ve(e.dataset.formId);if(!t)return;const a=new FormData(e),n={};t.questions.forEach(s=>{const o=`answer:${s.id}`,l=a.getAll(o).filter(c=>c instanceof File?c.name:String(c||"").trim());n[s.id]=l.length>1?l.map(c=>c instanceof File?c.name:c):l[0]instanceof File?l[0].name:l[0]||""}),i.formResponses.unshift(da({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||C().profile.full_name||"Preview submitter"),answers:n,created_at:new Date().toISOString()})),i.formsTab="responses",i.modal="",J("Preview response saved"),p()}function co(e,t,a="text/plain"){const n=new Blob([t],{type:a}),s=URL.createObjectURL(n),o=document.createElement("a");o.href=s,o.download=e,o.click(),URL.revokeObjectURL(s)}function rt(e){return JSON.parse(JSON.stringify(e))}function Z(e){return Array.from(new Set(e.map(t=>String(t||"").trim()).filter(Boolean)))}function oe(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||F(e)}function He(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||F(e)}function ee(e){return Wt.find(([t])=>t===e)?.[1]||i.driveFolders.find(t=>t.id===e)?.name||F(e||"Shared")}function uo(e=u()){return Wt.map(([t,a])=>[t,a]).concat(Me(e).map(t=>[t.id,t.name]))}function po(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function Ri(e){const t=ge(e);return t==="Image"?"ti-photo":t==="PDF"?"ti-file-type-pdf":t==="Archive"?"ti-file-zip":t==="Excel"?"ti-file-spreadsheet":t==="Word"?"ti-file-type-doc":t==="PowerPoint"?"ti-file-type-ppt":t==="Text"?"ti-file-text":"ti-file-description"}function F(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function w(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function T(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function xa(e){if(!e)return"No time";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(t)}function Ge(e){const t=Math.max(0,Math.floor(E(e)/1e3)),a=Math.floor(t/3600),n=Math.floor(t%3600/60);return a?`${a}h ${String(n).padStart(2,"0")}m`:`${n}m`}function ga(e){const t=E(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],n=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**n).toFixed(n?1:0)} ${a[n]}`}function Te(e){return(t,a)=>Date.parse(a[e]||a.updated_at||a.created_at||0)-Date.parse(t[e]||t.updated_at||t.created_at||0)}function Li(e){if(!e)return 0;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?0:Math.floor((qt().getTime()-t.getTime())/864e5)}function Ea(e){if(!e)return 999;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?999:Math.floor((t.getTime()-qt().getTime())/864e5)}function mo(e=u()){const t=(vt(gt(e)||{short_name:e})||e||"QH").replace(/[^a-z]/gi,"").slice(0,2).toUpperCase()||"QH",a=fe(e).length+1;return`${t}-${String(1e3+a)}`}function qt(){const e=new Date;return e.setHours(0,0,0,0),e}function fo(e,t){return`${Ni(e,t)}%`}function Ni(e,t){const a=E(t);return a?Math.max(0,Math.min(100,Math.round(E(e)/a*100))):0}function je(e){return{critical:5,urgent:4,high:3,medium:2,low:1}[String(e||"").toLowerCase()]||0}function va(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function K(e,t){return e.reduce((a,n)=>a+E(n[t]),0)}function E(e){const t=Number(e);return Number.isFinite(t)?t:0}function Ui(e){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(e||""))}function Pt(e){const t=String(e||"").trim();return Ui(t)||/^[0-9a-f]{8,}$/i.test(t)||/^user[_-]?[0-9a-f-]{8,}$/i.test(t)}function bo(e){const t=String(e||"").trim();return t?t.slice(0,8):""}function y(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(E(e))}function de(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function x(e,t){const a=de(e,t);return Array.isArray(a)&&a.length?a:t}function M(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
