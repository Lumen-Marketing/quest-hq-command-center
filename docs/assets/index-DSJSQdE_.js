(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=a(i);fetch(i.href,o)}})();const nl="/quest-hq-command-center/assets/quest-secure-workspace-cockpit-tight-CMTSEVW0.png",st={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://rqundirizvojpzhljtdn.supabase.co",supabaseKey:"sb_publishable_2WrlRVv2obg2N5g7ifl7Rg_wxGjs29U"},tt=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),it="quest-hq-local-session",Oi="quest-hq-local-profile",Pa="quest-hq-job-cache-v2",Mn="quest-hq-contact-cache-v1",In="quest-hq-account-cache-v1",xa="quest-hq-deal-cache-v1",En="quest-hq-activity-cache-v1",Pi="quest-hq-job-stages-v1",xi="quest-hq-contact-stages-v1",Ri="quest-hq-deal-stages-v1",Ni="quest-hq-deal-board-view",Tn="quest-hq-task-cache-v1",On="quest-hq-file-cache-v1",Pn="quest-hq-drive-folder-cache-v1",xn="quest-hq-team-cache-v1",Rn="quest-hq-company-membership-cache-v1",yt="quest-hq-company-form-cache-v1",Ra="quest-hq-company-form-response-cache-v1",Nn="quest-hq-finance-invoice-cache-v1",Un="quest-hq-finance-payment-cache-v1",Ln="quest-hq-finance-expense-cache-v1",Qn="quest-hq-finance-vendor-cache-v1",Na="quest-hq-time-entry-cache-v1",Ua="quest-hq-active-timer-v1",Ie="quest-hq-active-company",Vn="quest-hq-pending-workspace-review-v1",Ui="quest-hq-task-view",Li="quest-hq-drive-view",Qi="quest-hq-sidebar-collapsed",Vi="quest-hq-nav-groups-collapsed",Bi="quest-hq-nav-expanded-v1",Yi="quest-hq-job-board-view",Hi="quest-hq-contact-board-view",La="quest-hq-notification-cache-v1",Qa="quest-hq-message-conversation-cache-v1",Va="quest-hq-message-access-cache-v1",Ba="quest-hq-message-cache-v1",Ya="quest-hq-message-read-cache-v1",Ha="quest-hq-message-attachment-cache-v1",Wa="quest-hq-calendar-event-cache-v1",rt={developer:["*"],admin:["*"],owner:["*"],manager:["jobs.view","jobs.manage","tasks.view","tasks.manage","files.view","files.manage","forms.view","forms.manage","finance.view","team.view","clock.manage","approvals.manage","approvals.view","calendar.view","calendar.manage","calendar.view_team","users.view","settings.view","billing.view","roles.view","messages.view","messages.send","messages.create_group","messages.manage_groups","messages.attach_files"],member:["jobs.view","tasks.view","tasks.manage","files.view","forms.view","time.track","approvals.view","calendar.view","users.view","messages.view","messages.send","messages.attach_files"]},Wi=[["jobs.view","View jobs"],["jobs.manage","Create/edit jobs"],["tasks.view","View tasks"],["tasks.manage","Create/edit tasks"],["files.view","View files"],["files.manage","Upload/delete files"],["forms.view","View forms"],["forms.manage","Create/edit forms"],["crm.view","View CRM"],["finance.view","View finance"],["finance.manage","Create/edit finance"],["users.view","View users"],["users.manage","Invite/manage users"],["roles.view","View roles"],["roles.manage","Create/edit roles"],["billing.view","View billing"],["billing.manage","Manage subscription"],["settings.view","View settings"],["settings.manage","Manage settings"],["time.track","Track own time"],["clock.manage","Manage clock dashboard"],["approvals.view","View approvals"],["approvals.manage","Manage approvals"],["calendar.view","View calendar"],["calendar.manage","Create/edit calendar events"],["calendar.view_team","View team calendar"],["messages.view","View messages"],["messages.send","Send messages"],["messages.create_group","Create group chats"],["messages.manage_groups","Manage group chats"],["messages.attach_files","Attach files/images"],["messages.delete_own","Delete own messages"],["messages.delete_any","Delete any messages"],["messages.manage","Manage messages (compatibility)"]],sl={"messages.manage":["messages.manage_groups"],"messages.manage_groups":["messages.manage"]},ht=[{id:"home",group:"Workspace",label:"Home",icon:"ti-home",symbol:"q-logo",status:"live",permission:""},{id:"jobs",group:"Workspace",label:"Jobs",icon:"ti-briefcase",symbol:"q-symbol-jobs",status:"live",permission:"jobs.view"},{id:"tasks",group:"Workspace",label:"Tasks",icon:"ti-list-check",symbol:"q-symbol-tasks",status:"live",permission:"tasks.view"},{id:"files",group:"Workspace",label:"Files",icon:"ti-folder",symbol:"q-symbol-files",status:"live",permission:"files.view"},{id:"forms",group:"Workspace",label:"Forms",icon:"ti-clipboard-list",symbol:"q-symbol-forms",status:"live",permission:"forms.view"},{id:"analytics",group:"Workspace",label:"Analytics",icon:"ti-chart-bar",symbol:"q-symbol-analytics",status:"live",permission:"jobs.view"},{id:"crm",group:"Workspace",label:"Accounts",icon:"ti-building-community",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"contacts",group:"Workspace",label:"Contacts",icon:"ti-address-book",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"deals",group:"Workspace",label:"Deals",icon:"ti-businessplan",symbol:"q-symbol-jobs",status:"live",permission:"crm.view"},{id:"tickets",group:"Workspace",label:"Tickets",icon:"ti-ticket",symbol:"q-symbol-tickets",status:"planned"},{id:"finance",group:"Workspace",label:"Finance",icon:"ti-receipt-dollar",symbol:"q-symbol-finance",status:"live",permission:"finance.view"},{id:"knowledge",group:"Workspace",label:"Knowledge Base",icon:"ti-books",symbol:"q-symbol-knowledge",status:"planned"},{id:"automations",group:"Workspace",label:"Automations",icon:"ti-automation",symbol:"q-symbol-automations",status:"planned"},{id:"templates",group:"Workspace",label:"Templates",icon:"ti-template",symbol:"q-symbol-templates",status:"planned"},{id:"users",group:"Company",label:"Users",icon:"ti-users",symbol:"q-symbol-users",status:"live",permission:"users.view"},{id:"messages",group:"Company",label:"Messages",icon:"ti-messages",symbol:"q-symbol-messages",status:"live",permission:"messages.view"},{id:"settings",group:"Company",label:"Settings",icon:"ti-settings",symbol:"q-symbol-settings",status:"live",permission:"settings.view"},{id:"team-chart",group:"Company",label:"Team chart",icon:"ti-hierarchy-3",symbol:"q-symbol-team-chart",status:"live",permission:"team.view"},{id:"time",group:"Operations",label:"My time",icon:"ti-clock",symbol:"q-symbol-time",status:"live",permission:"time.track"},{id:"calendar",group:"Operations",label:"Calendar",icon:"ti-calendar",symbol:"q-symbol-calendar",status:"live",permission:"calendar.view"},{id:"approvals",group:"Operations",label:"Approvals",icon:"ti-user-check",symbol:"q-symbol-approvals",status:"live",permission:"approvals.view"},{id:"team-workload",group:"Operations",label:"Team workload",icon:"ti-users",symbol:"q-symbol-team-workload",status:"planned"},{id:"clock",group:"Operations",label:"Clock dashboard",icon:"ti-clock-hour-4",symbol:"q-symbol-clock",status:"live",permission:"clock.manage"}],il=[{label:"Command",ids:["home","messages","calendar"]},{label:"Sales",ids:["crm","contacts","deals"]},{label:"Work",ids:["jobs","tasks","files","forms"]},{label:"Money",ids:["finance","analytics"]},{label:"People",ids:["users","team-chart","time","approvals","clock"]},{label:"Control",ids:["settings"]},{label:"Future",ids:["tickets","knowledge","automations","templates","team-workload"]}],rl={"/admin.html":"settings","/automations.html":"automations","/calendar.html":"calendar","/crm.html":"crm","/dashboards.html":"analytics","/files.html":"files","/finance.html":"finance","/forms.html":"forms","/jobs.html":"jobs","/knowledge.html":"knowledge","/messages.html":"messages","/templates.html":"templates","/tickets.html":"tickets"},zi=[{name:"Unscheduled",color:"#9AA0A8"},{name:"Scheduled",color:"#378ADD"},{name:"Material ordered",color:"#3C7BD0"},{name:"In production",color:"#BA7517"},{name:"QC / punch list",color:"#C08A2B"},{name:"Invoiced",color:"#7F77DD"},{name:"Paid / closed",color:"#639922"},{name:"On hold",color:"#C4C7CC"}],Ji=[{name:"Prospects",color:"#9AA0A8"},{name:"Leads",color:"#378ADD"},{name:"Underwriting",color:"#BA7517"},{name:"Estimate sent",color:"#3C7BD0"},{name:"Negotiating",color:"#C08A2B"},{name:"Contract out",color:"#7F77DD"},{name:"Won",color:"#639922"},{name:"Follow-up",color:"#C4C7CC"},{name:"Lost",color:"#E24B4A"}],Ki=[{name:"Prospect",color:"#9AA0A8"},{name:"Qualified",color:"#378ADD"},{name:"Proposal sent",color:"#3C7BD0"},{name:"Negotiation",color:"#C08A2B"},{name:"Verbal commit",color:"#7F77DD"},{name:"Won",color:"#639922"},{name:"Lost",color:"#E24B4A"}],si=["#9AA0A8","#378ADD","#BA7517","#7F77DD","#639922","#E24B4A","#3C7BD0","#C08A2B","#5AB0A6","#C4C7CC"],vn={Lead:"Unscheduled","Site Review":"Scheduled",Estimate:"Material ordered",Approved:"In production",Active:"In production",Closed:"Paid / closed"};function Bn(e,t){const a=me(e,null);return!Array.isArray(a)||!a.length?t.map(n=>({...n})):a.map(n=>({name:String(n?.name||"").trim(),color:/^#[0-9a-fA-F]{3,8}$/.test(String(n?.color||""))?n.color:"#9AA0A8"})).filter(n=>n.name)}let pe=Bn(Pi,zi),fe=Bn(xi,Ji),ge=Bn(Ri,Ki);function ii(){return pe}function ri(){return fe}function oi(){return ge}function zt(){return pe.map(e=>e.name)}function ot(){return fe.map(e=>e.name)}function $t(){return ge.map(e=>e.name)}function Yn(e){return(pe.find(t=>t.name===e)||{}).color||"#9AA0A8"}function Gi(e){return(fe.find(t=>t.name===e)||{}).color||"#9AA0A8"}function Zi(e){return(ge.find(t=>t.name===e)||{}).color||"#9AA0A8"}function Hn(e){return e==="contacts"?fe:e==="deals"?ge:pe}function ol(e,t){return e==="contacts"?Gi(t):e==="deals"?Zi(t):Yn(t)}function Xi(e){const t=zt(),a=String(e||"").trim();return t.includes(a)?a:vn[a]&&t.includes(vn[a])?vn[a]:t[0]||"Unscheduled"}function ll(e){const t=ot(),a=String(e||"").trim();return t.includes(a)?a:t[0]||"Prospects"}function er(e){const t=$t(),a=String(e||"").trim();return t.includes(a)?a:t[0]||"Prospect"}function tr(){pe=pe.filter(e=>e.name),k(Pi,pe)}function ar(){fe=fe.filter(e=>e.name),k(xi,fe)}function nr(){ge=ge.filter(e=>e.name),k(Ri,ge)}const Wn=["Customer","Prospect","Partner","Vendor"],cl=["note","call","email","meeting","task","stage_change","system"],sr=["pipeline","list","profile"],Jt=["todo","pending","hold","review","done"],wa=["critical","urgent","high","medium","low"],ir=["lead","bid","admin","invoicing","ar","meeting","web_dev"],za=["Company event","Job visit / inspection","Estimate appointment","Install / field work","Internal meeting","Personal reminder"],dl=["Task due","Invoice due","Approval","Time"].concat(za),ul="https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons@master/icons/",ml=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],zn=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],Kt=["Inspection","Client approval","Intake","Survey","Safety","Internal"],Jn=["Draft","Published","Archived"],rr=["Draft","Sent","Partially paid","Paid","Overdue","Void"],or=["Pending","Approved","Paid","Rejected"],lr=["Active","On hold","Inactive"],cr=["ACH","Check","Card","Cash","Wire","Other"],Ja=["Materials","Labor","Subcontractor","Permit","Equipment","Marketing","Software","Travel","Other"],Kn=["company","role","custom","direct"],Gt=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],Zt=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],dr=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],pl=[{id:"contact-1",company_id:"roofing",name:"William Moran",phone:"928-231-0147",email:"wrmoran@gmail.com",location:"Future project",stage:"Prospects",value:0,owner_name:"Abraham Flores"},{id:"contact-2",company_id:"roofing",name:"Valerie McKenzie",phone:"602-750-5678",email:"",location:"6054 E Blanche Dr, Scottsdale",stage:"Prospects",value:0,owner_name:"Maya Rosales"},{id:"contact-3",company_id:"roofing",name:"April Reyes",phone:"480-277-1540",email:"",location:"451 E 10th Ave, Mesa",stage:"Leads",value:14500,owner_name:"Andre Lee"},{id:"contact-4",company_id:"roofing",name:"Mario Esquivel",phone:"480-955-4036",email:"esquivel@residence.com",location:"Costa Bella Residence",stage:"Leads",value:22e3,owner_name:"Maya Rosales"},{id:"contact-5",company_id:"roofing",name:"Mike - Maricopa",phone:"503-317-4788",email:"",location:"Maricopa",stage:"Underwriting",value:31e3,owner_name:"Andre Lee"},{id:"contact-6",company_id:"roofing",name:"Kumar Residence",phone:"",email:"",location:"16750 E Nicklaus Dr, Fountain Hills",stage:"Estimate sent",value:47800,owner_name:"Maya Rosales"},{id:"contact-7",company_id:"roofing",name:"Keith Salas",phone:"717-991-7029",email:"",location:"15948 E Sycamore",stage:"Negotiating",value:28900,owner_name:"Andre Lee"},{id:"contact-8",company_id:"roofing",name:"Brad Lundstrom",phone:"602-577-9523",email:"lundstromdesign@gmail.com",location:"3200 W Wander Ln",stage:"Contract out",value:53200,owner_name:"Abraham Flores"},{id:"contact-9",company_id:"roofing",name:"Rosa Cruz-Blanch",phone:"787-549-0942",email:"rcruz@natlbtr.com",location:"W Encanto Blvd",stage:"Won",value:61e3,owner_name:"Maya Rosales"},{id:"contact-10",company_id:"drafting",name:"Horizon HVAC",phone:"480-555-0199",email:"plans@horizonhvac.com",location:"Chandler, AZ",stage:"Estimate sent",value:4200,owner_name:"Noah Park",account_id:"account-3",title:"Facilities lead"}],fl=[{id:"account-1",company_id:"roofing",name:"Cruz-Blanch Residence",type:"Customer",industry:"Residential",phone:"787-549-0942",email:"rcruz@natlbtr.com",address:"W Encanto Blvd, Phoenix AZ",owner_name:"Maya Rosales",status:"Active"},{id:"account-2",company_id:"roofing",name:"Mesa Storage Partners",type:"Customer",industry:"Commercial",phone:"480-555-0140",email:"ops@mesastorage.com",address:"Mesa, AZ",owner_name:"Andre Lee",status:"Active"},{id:"account-3",company_id:"drafting",name:"Horizon HVAC",type:"Partner",industry:"HVAC",phone:"480-555-0199",email:"plans@horizonhvac.com",address:"Chandler, AZ",owner_name:"Noah Park",status:"Active"}],gl=[{id:"deal-1",company_id:"roofing",account_id:"account-1",primary_contact_id:"contact-9",name:"Encanto re-roof",stage:"Verbal commit",status:"open",value:61e3,probability:80,owner_name:"Maya Rosales",source:"Referral"},{id:"deal-2",company_id:"roofing",account_id:"account-2",primary_contact_id:"",name:"Mesa membrane repair",stage:"Proposal sent",status:"open",value:18400,probability:50,owner_name:"Andre Lee",source:"Website"},{id:"deal-3",company_id:"roofing",account_id:"account-1",primary_contact_id:"contact-7",name:"Sycamore tear-off",stage:"Negotiation",status:"open",value:28900,probability:60,owner_name:"Andre Lee",source:"Door knock"},{id:"deal-4",company_id:"drafting",account_id:"account-3",primary_contact_id:"contact-10",name:"Permit drawing package",stage:"Qualified",status:"open",value:4200,probability:40,owner_name:"Noah Park",source:"Partner"}],bl=[{id:"activity-1",company_id:"roofing",type:"call",subject:"Intro call with Rosa",body:"Discussed scope and timeline for the re-roof.",related_type:"deal",related_id:"deal-1",account_id:"account-1",owner_name:"Maya Rosales",completed_at:new Date(Date.now()-864e5).toISOString()},{id:"activity-2",company_id:"roofing",type:"note",subject:"Proposal sent",body:"Emailed membrane repair proposal, awaiting board review.",related_type:"deal",related_id:"deal-2",account_id:"account-2",owner_name:"Andre Lee",completed_at:new Date(Date.now()-1728e5).toISOString()}],ur=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"],supervisor_id:""},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"],supervisor_id:"abraham"},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"],supervisor_id:"maya"},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"],supervisor_id:"abraham"},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"],supervisor_id:""}],mr=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],pr=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:j(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:j(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:j(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:j(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:j(5),priority:"medium",urgency:"medium",status:"todo"}],fr=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],gr=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",creator_id:"abraham",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",creator_id:"maya",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",creator_id:"noah",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",creator_id:"lumen-ops",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],br=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],_r=[{id:"vendor-roofing-materials",company_id:"roofing",name:"Valley Roofing Supply",contact_name:"Elena Ortiz",email:"orders@valleyroofingsupply.local",phone:"(480) 555-0190",category:"Materials",status:"Active",notes:"Primary tile, flashing, and underlayment vendor.",created_at:new Date(Date.now()-12096e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"vendor-roofing-dryin",company_id:"roofing",name:"Monsoon Dry-In Crew",contact_name:"R. Alvarez",email:"dispatch@monsoondryin.local",phone:"(602) 555-0144",category:"Subcontractor",status:"Active",notes:"Emergency dry-in support during storm calls.",created_at:new Date(Date.now()-10368e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"vendor-drafting-permits",company_id:"drafting",name:"Permit Runner AZ",contact_name:"Sofia Chen",email:"permits@runneraz.local",phone:"(602) 555-0171",category:"Permit",status:"Active",notes:"Permit filing support for drafting packets.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString()},{id:"vendor-lumen-software",company_id:"lumen",name:"Lumen SaaS Stack",contact_name:"Ops Billing",email:"billing@lumenstack.local",phone:"",category:"Software",status:"Active",notes:"Internal software subscriptions for client onboarding.",created_at:new Date(Date.now()-7776e5).toISOString(),updated_at:new Date(Date.now()-3456e5).toISOString()}],vr=[{id:"invoice-roofing-queen-creek",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",client_name:"Rosales Residence",invoice_number:"QR-1007",status:"Partially paid",issue_date:j(-10),due_date:j(5),subtotal:6800,tax:0,total:6800,notes:"Emergency leak repair billing with deposit received.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"invoice-roofing-mesa-storage",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",client_name:"Mesa Storage Partners",invoice_number:"QR-1008",status:"Sent",issue_date:j(-18),due_date:j(-2),subtotal:18400,tax:0,total:18400,notes:"Estimate packet sent to board for approval.",created_at:new Date(Date.now()-15552e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-drafting-horizon",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",client_name:"Horizon HVAC",invoice_number:"QD-2031",status:"Sent",issue_date:j(-7),due_date:j(14),subtotal:4200,tax:0,total:4200,notes:"Drafting permit package milestone invoice.",created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-lumen-onboarding",company_id:"lumen",job_id:"",client_name:"Lumen Internal Launch",invoice_number:"LM-3004",status:"Draft",issue_date:j(-3),due_date:j(27),subtotal:3200,tax:0,total:3200,notes:"Demo onboarding package used for finance workspace.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()}],yr=[{id:"payment-roofing-queen-creek-deposit",company_id:"roofing",invoice_id:"invoice-roofing-queen-creek",amount:2500,method:"ACH",received_at:j(-4),reference:"ACH-4421",notes:"Deposit received after dry-in visit.",created_at:new Date(Date.now()-3456e5).toISOString()},{id:"payment-drafting-horizon-retainer",company_id:"drafting",invoice_id:"invoice-drafting-horizon",amount:1e3,method:"Check",received_at:j(-1),reference:"CHK-117",notes:"Retainer collected before permit packet completion.",created_at:new Date(Date.now()-864e5).toISOString()}],hr=[{id:"expense-roofing-queen-creek-materials",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",vendor_id:"vendor-roofing-materials",category:"Materials",amount:1850,status:"Approved",spent_at:j(-6),notes:"Underlayment, flashing, and tile replacement materials.",created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-roofing-mesa-permit",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",vendor_id:"vendor-roofing-materials",category:"Permit",amount:620,status:"Pending",spent_at:j(-2),notes:"Permit and document prep allowance.",created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString()},{id:"expense-drafting-horizon-runner",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",vendor_id:"vendor-drafting-permits",category:"Permit",amount:480,status:"Approved",spent_at:j(-3),notes:"Permit runner package review.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-lumen-software-stack",company_id:"lumen",job_id:"",vendor_id:"vendor-lumen-software",category:"Software",amount:540,status:"Paid",spent_at:j(-5),notes:"Client onboarding software stack.",created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()}],$r=[{id:"notification-roofing-task-assigned",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.assigned",title:"Task assigned",body:"Abraham assigned Leak inspection photos to you.",href:"/company/roofing/tasks?job_id=roofing-leak&task_id=task-roofing-leak-1",source_type:"task",source_id:"task-roofing-leak-1",read_at:"",created_at:new Date(Date.now()-7*6e4).toISOString()},{id:"notification-roofing-task-priority",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.priority",title:"Task priority changed",body:"Shan set priority to Urgent on HOA board approval package.",href:"/company/roofing/tasks?job_id=roofing-mesa&task_id=task-roofing-mesa-1",source_type:"task",source_id:"task-roofing-mesa-1",read_at:"",created_at:new Date(Date.now()-19*6e4).toISOString()},{id:"notification-roofing-approval",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"approval.ready",title:"Approval needs review",body:"Estimate approval is waiting in the company review queue.",href:"/company/roofing/approvals",source_type:"form",source_id:"form-roofing-estimate-approval",read_at:new Date(Date.now()-5*6e4).toISOString(),created_at:new Date(Date.now()-44*6e4).toISOString()},{id:"notification-drafting-task-review",company_id:"drafting",recipient_profile_id:"basic-quest-user",type:"task.status",title:"Task moved to review",body:"Drawing package QA is ready for review.",href:"/company/drafting/tasks?job_id=drafting-package&task_id=task-drafting-package-1",source_type:"task",source_id:"task-drafting-package-1",read_at:"",created_at:new Date(Date.now()-63*6e4).toISOString()},{id:"notification-lumen-finance",company_id:"lumen",recipient_profile_id:"basic-quest-user",type:"finance.invoice",title:"Invoice drafted",body:"Lumen onboarding invoice is ready for payment tracking.",href:"/company/lumen/finance?invoice=invoice-lumen-onboarding",source_type:"invoice",source_id:"invoice-lumen-onboarding",read_at:"",created_at:new Date(Date.now()-92*6e4).toISOString()}],Gn=[{id:"msg-conv-roofing-all",company_id:"roofing",title:"Roofing dispatch",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-16*6e4).toISOString(),created_at:new Date(Date.now()-864e5).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-conv-roofing-crew",company_id:"roofing",title:"Roofing crew",type:"role",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-52*6e4).toISOString(),created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-conv-roofing-direct-shan",company_id:"roofing",title:"Shan Kumar",type:"direct",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-8*6e4).toISOString(),created_at:new Date(Date.now()-36e5).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-conv-drafting-all",company_id:"drafting",title:"Drafting review",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-74*6e4).toISOString(),created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-conv-lumen-product",company_id:"lumen",title:"Lumen launch room",type:"custom",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-38*6e4).toISOString(),created_at:new Date(Date.now()-216e5).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],Zn=[{id:"msg-access-roofing-all",conversation_id:"msg-conv-roofing-all",company_id:"roofing",target_type:"all_company",target_id:"all"},{id:"msg-access-roofing-crew-role",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",target_type:"role",target_id:"staff-roofing"},{id:"msg-access-roofing-direct-basic",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-roofing-direct-shan",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"shan"},{id:"msg-access-drafting-all",conversation_id:"msg-conv-drafting-all",company_id:"drafting",target_type:"all_company",target_id:"all"},{id:"msg-access-lumen-basic",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-lumen-role",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"role",target_id:"admin-lumen"}],Xn=[{id:"msg-roofing-all-1",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"abraham",body:"Morning check: Mesa HOA estimate needs photos before noon.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-48*6e4).toISOString(),updated_at:new Date(Date.now()-48*6e4).toISOString()},{id:"msg-roofing-all-2",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"basic-quest-user",body:"Got it. I am linking the job files now.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-16*6e4).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-roofing-crew-1",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",sender_profile_id:"shan",body:"@Joshua bring the permit packet when you head to Arroyo.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-52*6e4).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-roofing-direct-1",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",sender_profile_id:"shan",body:"Can you confirm the roof access photo uploaded correctly?",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-8*6e4).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-drafting-all-1",conversation_id:"msg-conv-drafting-all",company_id:"drafting",sender_profile_id:"abraham",body:"Horizon package QA is ready. Please keep notes in this thread.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-74*6e4).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-lumen-product-1",conversation_id:"msg-conv-lumen-product",company_id:"lumen",sender_profile_id:"basic-quest-user",body:"Finance and CRM are live enough for internal walkthrough. Next focus is polish and permissions.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-38*6e4).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],es=[{id:"msg-attachment-roofing-photo",conversation_id:"msg-conv-roofing-crew",message_id:"msg-roofing-crew-1",company_id:"roofing",bucket_id:"quest-message-attachments",object_path:"",file_name:"roof-access-photo.jpg",mime_type:"image/jpeg",size_bytes:184e3,preview_url:"",created_at:new Date(Date.now()-52*6e4).toISOString()}],ts=[{conversation_id:"msg-conv-roofing-all",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:new Date(Date.now()-10*6e4).toISOString()},{conversation_id:"msg-conv-roofing-crew",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-drafting-all",company_id:"drafting",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-lumen-product",company_id:"lumen",profile_id:"basic-quest-user",last_read_at:""}],wr=[{id:"calendar-roofing-install",company_id:"roofing",title:"East ridge install window",description:"Crew visit for install prep and materials check.",event_type:"Install / field work",starts_at:`${j(1)}T14:00:00.000Z`,ends_at:`${j(1)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"job",linked_id:"job-east-ridge",assigned_profile_id:"abraham",created_by:"basic-quest-user"},{id:"calendar-roofing-estimate",company_id:"roofing",title:"Garage roof estimate",description:"Client walkthrough and estimate appointment.",event_type:"Estimate appointment",starts_at:`${j(3)}T16:00:00.000Z`,ends_at:`${j(3)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"shan",created_by:"basic-quest-user"},{id:"calendar-drafting-review",company_id:"drafting",title:"Plan review block",description:"Drafting team review for active plan updates.",event_type:"Internal meeting",starts_at:`${j(2)}T15:00:00.000Z`,ends_at:`${j(2)}T15:45:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"",created_by:"basic-quest-user"},{id:"calendar-lumen-product",company_id:"lumen",title:"Quest HQ product review",description:"Review workspace permissions, messages, and calendar flow.",event_type:"Company event",starts_at:`${j(4)}T18:00:00.000Z`,ends_at:`${j(4)}T19:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"basic-quest-user",created_by:"basic-quest-user"}],s={route:null,session:me(it,null),profileDraft:me(Oi,null),authReady:!1,authMode:"signin",jobs:M(Pa,dr).map(Fe),contacts:M(Mn,pl).map(Rt),accounts:M(In,fl).map(Nt),deals:M(xa,gl).map(ft),activities:M(En,bl).map(qa),pipelineStages:[],tasks:M(Tn,pr).map(gt),files:M(On,fr).map(Ut),driveFolders:M(Pn,[]).map(qs),forms:M(yt,gr).map(ra),formResponses:M(Ra,br).map(Fs),financeInvoices:M(Nn,vr).map(oa),financePayments:M(Un,yr).map(la),financeExpenses:M(Ln,hr).map(ca),financeVendors:M(Qn,_r).map(da),notifications:M(La,$r).map(Qt),messageConversations:M(Qa,Gn).map(Ce),messageAccess:M(Va,Zn).map(se),messages:M(Ba,Xn).map(Me),messageReads:M(Ya,ts).map(ua),messageAttachments:M(Ha,es).map(Be),calendarEvents:M(Wa,wr).map(bt),timeEntries:me(Na,[]),activeTimer:me(Ua,null),teamMembers:M(xn,ur).map(Ms),memberships:M(Rn,mr),profiles:[],subscriptions:[],workspaceReviews:[],roles:[],rolePermissions:[],roleAssignments:[],resourceAcl:[],fieldPermissions:[],companyInvites:[],joinRequests:[],auditEvents:[],companies:As(Zt.map(pt)),activeCompanyId:localStorage.getItem(Ie)||"",sidebarCollapsed:localStorage.getItem(Qi)==="true",collapsedNavGroups:new Set(me(Vi,[])),expandedNav:new Set(me(Bi,["contacts","jobs","deals"])),jobBoardView:localStorage.getItem(Yi)||"board",contactBoardView:localStorage.getItem(Hi)||"table",dealBoardView:localStorage.getItem(Ni)||"board",contactStageFilter:"all",contactQuery:"",selectedContactId:"",stageFilterDeals:"all",dealQuery:"",selectedDealId:"",accountQuery:"",accountTypeFilter:"all",selectedAccountId:"",accountTab:"overview",dealPrefill:null,activityPrefill:null,contactPrefill:null,selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",selectedFinanceInvoiceId:"",selectedFinanceExpenseId:"",selectedFinanceVendorId:"",selectedCalendarEventId:"",inviteLookup:null,expandedFormIds:new Set,formStartTemplateId:"",formStartTab:"blank",query:"",fileQuery:"",formQuery:"",crmQuery:"",stageFilter:"all",crmStageFilter:"all",crmOwnerFilter:"all",messageQuery:"",messageFilter:"all",selectedConversationId:"",messageRealtimeChannel:null,messageRealtimeKey:"",calendarScope:"company",calendarView:"week",calendarQuery:"",calendarTypeFilter:"all",calendarCursorDate:j(0),taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(Ui)||"table",driveFolder:"home",driveView:localStorage.getItem(Li)||"list",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",authMessage:"",toast:null,toastTimer:null,modal:"",accountMenuOpen:!1,notificationMenuOpen:!1,rolePreview:null},Ka=document.getElementById("app");let yn=null;_l();function _l(){bm(),window.addEventListener("popstate",p),document.addEventListener("click",yu),document.addEventListener("submit",wu),document.addEventListener("input",Ku),document.addEventListener("change",Gu),vl(),p()}async function vl(){if(s.session?.auth==="local-basic"){Sr(),s.authReady=!0;return}const e=F();if(!e?.auth){s.authReady=!0,s.loginError="Supabase auth is unavailable in this browser session.";return}try{const{data:t}=await e.auth.getSession();await Tt(t?.session||null),e.auth.onAuthStateChange((a,n)=>{Tt(n||null).finally(()=>{s.dataLoaded=!1,p()})})}catch(t){s.loginError=t.message||"Unable to initialize Supabase auth."}finally{s.authReady=!0,p()}}async function Tt(e){if(!e?.user){s.session=null,localStorage.removeItem(it);return}const t=await yl(e.user);s.session=Rp(e,t),Dl(),k(it,s.session)}async function yl(e){const t={id:e.id,email:e.email||"",full_name:e.user_metadata?.full_name||e.email||"Quest user",role:"member",role_label:"Member",member_id:"",company_ids:[],avatar_url:"",approved:!1,email_verified:!!e.email_confirmed_at},a=F();if(!a)return t;const n=await a.from("profiles").select("*").eq("id",e.id).maybeSingle();return n.error||!n.data?t:Lt(n.data,t)}function p(){if(s.route=Xt(),!s.authReady){wl();return}if(s.route.name==="home"){_i(!1);return}if(s.route.name==="login"){_i(!0);return}if($l(s.route)){q("/login?return_url="+encodeURIComponent(vm()),{replace:!0});return}if(Sl(),s.session?.auth==="supabase"&&s.dataLoaded&&!ze().length){hl();return}const e=_m(s.route);if(e){q(e,{replace:!0});return}wm(s.route),Jr(s.route),s.route.params.get("account")==="profile"&&(s.modal="profile"),document.title=`${ym(s.route)} | ${x(u())} | Quest HQ`,Ka.innerHTML=Al(s.route,Ar(s.route))}function hl(){document.title="Company access pending | Quest HQ",Ka.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Access pending</small></span>
        </div>
        <div>
          <div class="eyebrow">Tenant security</div>
          <h1>No active company access</h1>
          <p>Your account exists, but you are not an active member of a company workspace yet. Business owners can create a workspace. Workers need an invite code from their company admin.</p>
        </div>
        <section class="login-lanes no-access-lanes">
          <article class="login-lane-card">
            <div>
              <strong>Business owner</strong>
              <span>Create a company workspace for Quest approval.</span>
            </div>
            <form data-company-create-form>
              <label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>
              <button class="btn btn-primary full" type="submit">Create business workspace</button>
              <div class="form-message">You become Owner, then Quest approves access before live modules open.</div>
            </form>
          </article>
          <article class="login-lane-card">
            <div>
              <strong>Invited worker</strong>
              <span>Join only with a code from your Owner/Admin.</span>
            </div>
            <form data-existing-invite-code-form>
              <label>Invite code<input name="invite_code" autocomplete="one-time-code" required placeholder="Paste invite code" /></label>
              <button class="btn full" type="submit">Join workspace</button>
              <div class="form-message">Worker registration is blocked without an invite.</div>
            </form>
          </article>
        </section>
        <button class="btn full" type="button" data-action="sign-out">Sign out</button>
      </section>
    </main>
  `}function $l(e){return e.name==="login"||e.name==="home"?!1:!s.session}function wl(){document.title="Loading | Quest HQ",Ka.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${v("Checking secure session...")}
      </section>
    </main>
  `}function Sl(){s.dataLoaded||s.dataLoading||(s.dataLoading=!0,kl().catch(()=>{s.sync={label:"Local fallback",mode:"local"}}).finally(()=>{s.dataLoaded=!0,s.dataLoading=!1,ae(),p()}))}async function kl(){if(s.session?.auth==="local-basic"){s.sync={label:"Demo mode",mode:"local"};return}const e=F();if(!e){s.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,n,i,o,l,d,c,f,g,D,U,T,re,Re,Q,Qs,Vs,Bs,Ys,Hs,Ws,zs,Js,Ks,Gs,Zs,Xs,ei,ti,ai,ni]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*"),e.from("profiles").select("*"),e.from("company_subscriptions").select("*"),e.from("roles").select("*").order("priority",{ascending:!1}),e.from("role_permissions").select("*"),e.from("user_role_assignments").select("*"),e.from("resource_acl").select("*"),e.from("field_permissions").select("*"),e.from("company_invites").select("*").order("created_at",{ascending:!1}),e.from("company_join_requests").select("*").order("created_at",{ascending:!1}),e.from("audit_events").select("*").order("created_at",{ascending:!1}).limit(100),e.from("message_conversations").select("*").order("last_message_at",{ascending:!1}),e.from("message_conversation_access").select("*"),e.from("messages").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_attachments").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_reads").select("*"),e.from("calendar_events").select("*").order("starts_at",{ascending:!0}),e.from("notifications").select("*").order("created_at",{ascending:!1}).limit(200),e.from("finance_invoices").select("*").order("updated_at",{ascending:!1}),e.from("finance_payments").select("*").order("received_at",{ascending:!1}),e.from("finance_expenses").select("*").order("spent_at",{ascending:!1}),e.from("finance_vendors").select("*").order("name",{ascending:!0}),e.from("contacts").select("*").order("updated_at",{ascending:!1}),e.from("pipeline_stages").select("*").order("position",{ascending:!0}),e.from("accounts").select("*").order("name",{ascending:!0}),e.from("deals").select("*").order("updated_at",{ascending:!1}),e.from("activities").select("*").order("created_at",{ascending:!1}).limit(500)]);let ne=0;if(t.error||(s.companies=(t.data||[]).map(pt),ne+=1),a.error||(s.jobs=(a.data||[]).map(Fe),ne+=1),n.error||(s.tasks=(n.data||[]).map(gt),ne+=1),i.error||(s.files=(i.data||[]).map(Ut),ne+=1),o.error||(s.teamMembers=(o.data||[]).map(Ms),ne+=1),l.error||(s.memberships=(l.data||[]).map(Fa),ne+=1),d.error||(s.profiles=(d.data||[]).map(pa=>Lt(pa)),ne+=1),c.error||(s.subscriptions=(c.data||[]).map(Ma),ne+=1),f.error||(s.roles=(f.data||[]).map(at),ne+=1),g.error||(s.rolePermissions=(g.data||[]).map(An)),D.error||(s.roleAssignments=(D.data||[]).map(Fo)),U.error||(s.resourceAcl=(U.data||[]).map(wp)),T.error||(s.fieldPermissions=(T.data||[]).map(Sp)),re.error||(s.companyInvites=(re.data||[]).map(Ia)),Re.error||(s.joinRequests=(Re.data||[]).map(Mo)),Q.error||(s.auditEvents=Q.data||[]),Qs.error||(s.messageConversations=(Qs.data||[]).map(Ce)),Vs.error||(s.messageAccess=(Vs.data||[]).map(se)),Bs.error||(s.messages=(Bs.data||[]).map(Me)),Ys.error||(s.messageAttachments=(Ys.data||[]).map(Be)),Hs.error||(s.messageReads=(Hs.data||[]).map(ua)),Ws.error||(s.calendarEvents=(Ws.data||[]).map(bt)),zs.error||(s.notifications=(zs.data||[]).map(Qt)),Js.error||(s.financeInvoices=(Js.data||[]).map(oa),ne+=1),Ks.error||(s.financePayments=(Ks.data||[]).map(la)),Gs.error||(s.financeExpenses=(Gs.data||[]).map(ca)),Zs.error||(s.financeVendors=(Zs.data||[]).map(da)),Xs.error||(s.contacts=(Xs.data||[]).map(Rt),ne+=1),ei.error||(s.pipelineStages=ei.data||[],is(u())),ti.error||(s.accounts=(ti.data||[]).map(Nt),ne+=1),ai.error||(s.deals=(ai.data||[]).map(ft),ne+=1),ni.error||(s.activities=(ni.data||[]).map(qa)),Cs()){const pa=await e.rpc("list_workspace_reviews").catch(_n=>({error:_n}));if(!pa.error){s.workspaceReviews=(pa.data||[]).map(It);const _n=s.workspaceReviews.map(le=>pt({id:le.company_id,name:le.company_name,short_name:le.company_name})),al=s.workspaceReviews.map(le=>Ma({company_id:le.company_id,status:le.status,plan_code:le.plan_code,amount_cents:le.amount_cents,currency:le.currency,trial_ends_at:le.trial_ends_at,current_period_end:le.current_period_end,grace_ends_at:le.grace_ends_at}));s.companies=As(s.companies.concat(_n)),s.subscriptions=qo(s.subscriptions.concat(al))}}s.sync=ne?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function F(){return!window.supabase||typeof window.supabase.createClient!="function"?null:(yn||(yn=window.supabase.createClient(st.supabaseUrl,st.supabaseKey)),yn)}function Dl(){s.jobs=[],s.tasks=[],s.files=[],s.driveFolders=[],s.forms=[],s.formResponses=[],s.financeInvoices=[],s.financePayments=[],s.financeExpenses=[],s.financeVendors=[],s.notifications=[],s.messageConversations=[],s.messageAccess=[],s.messages=[],s.messageReads=[],s.messageAttachments=[],s.calendarEvents=[],s.timeEntries=[],s.activeTimer=null,s.teamMembers=[],s.memberships=[],s.profiles=[],s.subscriptions=[],s.workspaceReviews=[],s.roles=[],s.rolePermissions=[],s.roleAssignments=[],s.resourceAcl=[],s.fieldPermissions=[],s.companyInvites=[],s.joinRequests=[],s.auditEvents=[],s.companies=[],s.sync={label:"Loading secure workspace...",mode:"loading"}}function Sr(){s.jobs=M(Pa,dr).map(Fe),s.tasks=M(Tn,pr).map(gt),s.files=M(On,fr).map(Ut),s.driveFolders=M(Pn,[]).map(qs),s.forms=M(yt,gr).map(ra),s.formResponses=M(Ra,br).map(Fs),s.financeInvoices=M(Nn,vr).map(oa),s.financePayments=M(Un,yr).map(la),s.financeExpenses=M(Ln,hr).map(ca),s.financeVendors=M(Qn,_r).map(da),s.notifications=M(La,$r).map(Qt),s.messageConversations=M(Qa,Gn).map(Ce),s.messageAccess=M(Va,Zn).map(se),s.messages=M(Ba,Xn).map(Me),s.messageReads=M(Ya,ts).map(ua),s.messageAttachments=M(Ha,es).map(Be),s.calendarEvents=M(Wa,wr).map(bt),s.timeEntries=me(Na,[]),s.activeTimer=me(Ua,null),s.teamMembers=M(xn,ur).map(Ms),s.memberships=M(Rn,mr),s.profiles=[],s.subscriptions=[],s.workspaceReviews=[],s.roles=[],s.rolePermissions=[],s.roleAssignments=[],s.resourceAcl=[],s.fieldPermissions=[],s.companyInvites=[],s.joinRequests=[],s.auditEvents=[],s.companies=As(Zt.map(pt)),s.sync={label:"Demo mode",mode:"local"}}function Cl(){return`
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
      <symbol id="q-symbol-messages" viewBox="0 0 24 24">
        <path d="M4.5 6.5h15v9.5h-8l-4.5 3v-3H4.5v-9.5Z" />
        <path d="M8 10h8M8 13h5" />
      </symbol>
      <symbol id="q-symbol-company-chat" viewBox="0 0 24 24">
        <path d="M4 18V7l8-4 8 4v11" />
        <path d="M8 18v-6h8v6" />
        <path d="M6.5 21h11M8 8h.1M12 7h.1M16 8h.1" />
      </symbol>
      <symbol id="q-symbol-role-chat" viewBox="0 0 24 24">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M3.8 18c.8-3 2.2-4.5 4.2-4.5s3.4 1.5 4.2 4.5M13 14.5c2.8.1 4.5 1.6 5.2 4.5" />
      </symbol>
      <symbol id="q-symbol-direct-chat" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 20c1-4 3.1-6 6.5-6s5.5 2 6.5 6" />
      </symbol>
      <symbol id="q-message-file" viewBox="0 0 24 24">
        <path d="M7 3.5h7l3 3V20H7V3.5Z" />
        <path d="M14 3.5V7h3M9.5 12h5M9.5 15h4" />
      </symbol>
      <symbol id="q-message-image" viewBox="0 0 24 24">
        <path d="M4.5 6h15v12h-15V6Z" />
        <circle cx="9" cy="10" r="1.4" />
        <path d="m6.8 16 3.6-3.5 2.3 2.1 2.1-2.7 2.8 4.1" />
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
      <symbol id="q-symbol-calendar" viewBox="0 0 24 24">
        <path d="M5 5.5h14v14H5v-14Z" />
        <path d="M8 3.5v4M16 3.5v4M5 9.5h14M8.5 13h2M13.5 13h2M8.5 16h2" />
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
  `}function B(e,t="symbol-icon"){return`<svg class="${r(t)}" aria-hidden="true" focusable="false"><use href="#${r(e)}"></use></svg>`}function kr(e=s.route?.section||"jobs"){return ht.find(t=>t.id===e)?.symbol||"q-empty"}function jl(e){const t=String(e||"").toLowerCase();return t.includes("job")||t.includes("pipeline")?"q-symbol-jobs":t.includes("task")||t.includes("review")?"q-symbol-tasks":t.includes("file")?"q-symbol-files":t.includes("form")?"q-symbol-forms":t.includes("account")||t.includes("customer")||t.includes("member")||t.includes("user")||t.includes("lead")?"q-symbol-crm":t.includes("invoice")||t.includes("collected")||t.includes("expense")||t.includes("net")||t.includes("outstanding")?"q-symbol-finance":t.includes("time")||t.includes("today")||t.includes("days")||t.includes("timer")||t.includes("entries")?"q-symbol-clock":t.includes("approval")||t.includes("access")?"q-symbol-approvals":kr()}function Al(e,t){const a=b(),n=u(),i=Up(a);return`
    <div class="quest-app ${s.sidebarCollapsed?"sidebar-collapsed":""}" data-route="${r(e.name)}">
      ${Cl()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${_(m("home",{},n))}" data-router aria-label="Quest HQ workspace">
            ${B("q-logo","brand-symbol")}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${r(st.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${B("q-company")}
            <select data-company-switch aria-label="Active company">
              ${Ct().map(o=>`<option value="${r(o.id)}" ${o.id===n?"selected":""}>${r(Te(o))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            ${B("q-search")}
            <input data-global-search value="${r(s.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${r(s.sync.mode)}" data-sync-state>${r(s.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          ${Ml(n)}
          <div class="account-menu ${s.accountMenuOpen?"open":""}">
            <button class="avatar-button" type="button" data-action="toggle-account-menu" aria-label="Open account menu" aria-expanded="${s.accountMenuOpen?"true":"false"}">
              ${ee(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${r(a.profile.full_name)}</strong>
              <span>${r(a.profile.role_label)} - ${r(x(n))}</span>
              ${i?"":`
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
      ${ql(n)}
      ${El(n)}
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${Tl(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
      ${Fl(e,n)}
    </div>
    ${cu(e,a)}
    ${Br()}
  `}function ql(e){const t=ie(e).filter(i=>i.status==="active").length,a=G(e).filter(i=>i.status!=="done"&&i.due&&new Date(i.due)<jt()).length,n=te(e)?"Good":"Pending";return`
    <div class="mobile-status-rail" aria-label="Workspace status">
      <a href="${_(m("settings",{tab:"billing"},e))}" data-router>
        ${B("q-symbol-approvals")}<span>${r(dn(e))}</span>
      </a>
      <a href="${_(m("users",{},e))}" data-router>
        ${B("q-symbol-users")}<span>${r(String(t))} active</span>
      </a>
      <a href="${_(m("tasks",{},e))}" data-router>
        ${B("q-symbol-tasks")}<span>${r(String(a))} overdue</span>
      </a>
      <a href="${_(m("settings",{},e))}" data-router>
        ${B("q-symbol-settings")}<span>Health: ${r(n)}</span>
      </a>
    </div>
  `}function Fl(e,t){const a=$("messages.view",t)?ds(t):0,n=$("files.view",t)?ke(t).length:"",i=V(t).length+G(t).filter(o=>o.status!=="done").length;return`
    <nav class="mobile-tabbar" aria-label="Mobile workspace navigation">
      ${At(e,m("home",{},t),"ti-home","Home","",["home"])}
      ${At(e,m("jobs",{},t),"ti-layout-grid","Work",i,["jobs","tasks","calendar","crm","finance","forms","users","time","approvals","clock","team-chart"])}
      ${At(e,m("messages",{},t),"ti-message-circle","Messages",a,["messages"])}
      ${At(e,m("files",{},t),"ti-folder","Files",n,["files"])}
      ${At(e,m("settings",{},t),"ti-dots","More","",["settings","analytics"])}
    </nav>
  `}function At(e,t,a,n,i,o){return`
    <a class="${e.name==="company"&&o.includes(e.section)?"active":""}" href="${_(t)}" data-router>
      <i class="ti ${r(a)}"></i>
      ${i?`<b>${r(String(Math.min(Number(i)||0,99)))}</b>`:""}
      <span>${r(n)}</span>
    </a>
  `}function Ml(e){const t=Kr(e),a=t.filter(n=>!n.read_at).length;return`
    <div class="notification-center ${s.notificationMenuOpen?"open":""}">
      <button class="icon-button notification-button" type="button" data-action="toggle-notifications" aria-label="Open notifications" aria-expanded="${s.notificationMenuOpen?"true":"false"}">
        <i class="ti ti-bell"></i>
        ${a?`<b>${r(String(Math.min(a,99)))}</b>`:""}
      </button>
      <div class="notification-popover" role="dialog" aria-label="Notifications">
        <div class="notification-head">
          <div><strong>Inbox</strong><span>${r(x(e))}</span></div>
          <button type="button" data-action="mark-all-notifications-read" ${a?"":"disabled"}>Mark all read</button>
        </div>
        <div class="notification-list">
          ${t.slice(0,12).map(n=>Il(n)).join("")||v("No notifications yet.")}
        </div>
      </div>
    </div>
  `}function Il(e){return`
    <button class="notification-item ${e.read_at?"read":"unread"}" type="button" data-action="open-notification" data-notification-id="${r(e.id)}">
      <span></span>
      <div>
        <small>${r(Ro(e.type))} - ${r(e.title)} - ${r(Ze(e.created_at))}</small>
        <strong>${r(e.body)}</strong>
      </div>
    </button>
  `}function El(e){const t=rn(e);return t?`
    <div class="role-preview-banner" style="--role-color:${r(t.color)}">
      <span></span>
      <div>
        <strong>Viewing as ${r(t.name)}</strong>
        <small>Permission preview only. Your real account has not changed.</small>
      </div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
  `:""}function Tl(e){const t=u(),a=b(),n=new Map(ht.map(i=>[i.id,i]));return`
    <div class="deck-brand">
      <a class="logo" href="${_(m("home",{},t))}" data-router aria-label="Quest HQ home">
        ${B("q-logo","brand-symbol")}
      </a>
      <span><strong>Quest HQ</strong><small>Command Center</small></span>
      <button class="deck-toggle" type="button" data-action="toggle-sidebar" aria-label="${s.sidebarCollapsed?"Expand navigation":"Collapse navigation"}" aria-expanded="${s.sidebarCollapsed?"false":"true"}">
        <i class="ti ${s.sidebarCollapsed?"ti-layout-sidebar-right-expand":"ti-layout-sidebar-left-collapse"}"></i>
      </button>
    </div>
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${r(Oe(t))}">${B("q-company")}</span>
      <div>
        <strong>${r(x(t))}</strong>
        <small>${r(mt(t))} workspace</small>
      </div>
    </div>
    <div class="deck-scroll">
      ${il.map(i=>{const o=i.ids.map(l=>n.get(l)).filter(l=>l&&Cr(l,t)).map(l=>l.status==="planned"?Rl(l.symbol,l.label):l.id==="jobs"||l.id==="contacts"||l.id==="deals"?xl(e,l,t):Pl(e,m(l.id,{},t),l.symbol,l.label,jr(l.id,t)));return Ol(i.label,o)}).join("")}
    </div>
    <div class="deck-footer">
      <a class="deck-company-switch" href="${_(m("settings",{tab:"company"},t))}" data-router>
        ${B("q-company")}
        <span><strong>${r(x(t))}</strong><small>Workspace</small></span>
        <i class="ti ti-chevron-down"></i>
      </a>
      <button class="deck-user-card" type="button" data-action="open-profile">
        ${ee(a.profile,"avatar small")}
        <span><strong>${r(a.profile.full_name)}</strong><small>${r(mt(t))}</small></span>
        <i class="ti ti-dots-vertical"></i>
      </button>
    </div>
  `}function Ol(e,t){if(!t.length)return"";const a=s.collapsedNavGroups.has(e);return`
    <section class="side-group ${a?"collapsed":""}">
      <button class="side-label" type="button" data-action="toggle-nav-group" data-group="${r(e)}" aria-expanded="${a?"false":"true"}" title="${a?"Expand":"Collapse"} ${r(e)}">
        <span>${r(e)}</span>
        <i class="ti ti-chevron-down side-label-chevron" aria-hidden="true"></i>
      </button>
      <div class="side-items">${t.join("")}</div>
    </section>
  `}function Pl(e,t,a,n,i=""){return`
    <a class="side-item ${zr(e,t)?"active":""}" href="${_(t)}" data-router title="${r(n)}" aria-label="${r(n)}">
      ${B(a)}
      <span>${r(n)}</span>
      ${i!==""?`<b>${r(String(i))}</b>`:""}
    </a>
  `}function Dr(e,t=u()){const a=e==="contacts"?kt(t):e==="deals"?Dt(t):V(t),n={};return a.forEach(i=>{n[i.stage]=(n[i.stage]||0)+1}),n}function xl(e,t,a){const n=t.id,i=m(n,{},a),o=zr(e,i),l=s.expandedNav.has(n),d=jr(n,a),c=e.name==="company"&&e.section===n,f=n==="contacts"?s.contactStageFilter:n==="deals"?s.stageFilterDeals:s.stageFilter,g=Hn(n),D=Dr(n,a);return`
    <div class="side-pipe ${l?"expanded":""}">
      <div class="side-pipe-head">
        <a class="side-item ${o?"active":""}" href="${_(i)}" data-router data-action="pipeline-open" data-module="${n}" title="${r(t.label)}" aria-label="${r(t.label)}">
          ${B(t.symbol)}
          <span>${r(t.label)}</span>
          ${d!==""?`<b>${r(String(d))}</b>`:""}
        </a>
        <button class="side-pipe-toggle" type="button" data-action="toggle-nav-expand" data-module="${n}" aria-expanded="${l?"true":"false"}" aria-label="${l?"Collapse":"Expand"} ${r(t.label)} stages">
          <i class="ti ti-chevron-down" aria-hidden="true"></i>
        </button>
      </div>
      ${l?`
        <div class="side-sub">
          <button class="side-sub-link ${c&&f==="all"?"active":""}" type="button" data-action="pipeline-stage" data-module="${n}" data-stage="all">
            <span class="side-sub-dot all"></span>
            <span class="side-sub-name">All ${r(t.label.toLowerCase())}</span>
            <span class="side-sub-ct">${r(String(d||0))}</span>
          </button>
          ${g.map(U=>`
            <button class="side-sub-link ${c&&f===U.name?"active":""}" type="button" data-action="pipeline-stage" data-module="${n}" data-stage="${r(U.name)}">
              <span class="side-sub-dot" style="background:${r(U.color)}"></span>
              <span class="side-sub-name">${r(U.name)}</span>
              <span class="side-sub-ct">${r(String(D[U.name]||0))}</span>
            </button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function Rl(e,t){return`
    <button class="side-item planned" type="button" disabled aria-disabled="true" title="${r(t)}" aria-label="${r(t)}">
      ${B(e)}
      <span>${r(t)}</span>
      <b>Planned</b>
    </button>
  `}function Cr(e,t=u()){return e.id==="home"||e.status==="planned"?!0:!te(t)&&!["settings","users"].includes(e.id)?!1:$(e.permission||`${e.id}.view`,t)}function jr(e,t=u()){return e==="jobs"?V(t).length:e==="tasks"?G(t).length:e==="files"?ke(t).length:e==="forms"?je(t).length:e==="crm"?aa(t).length:e==="contacts"?kt(t).length:e==="deals"?Dt(t).filter(a=>a.status==="open").length:e==="finance"?De(t).length:e==="users"?ie(t).filter(a=>a.status==="active").length:e==="messages"?ds(t)||Ye(t).length:e==="calendar"?Xr(t).length:e==="time"?ho(t).focus.length:e==="approvals"?ys(t).length:e==="clock"&&sa(t)?"On":""}function as(e,t){return`
    <nav class="tabbar compact-tabbar" aria-label="${r(e)}">
      ${t.map(([a,n,i])=>`<a class="${i?"active":""}" href="${_(a)}" data-router>${r(n)}</a>`).join("")}
    </nav>
  `}function Ar(e){if(e.name==="command")return Ql(u());if(e.name!=="company")return bi(e.name);const t=e.companyId;if(s.session?.auth==="supabase"&&!ze().includes(t))return Ll(t);const a=ht.find(n=>n.id===e.section);if(e.section==="home")return qr(t);if(a?.status!=="planned"){if(!te(t)&&e.section!=="settings")return Nl(t);if(a?.permission&&!$(a.permission,t))return Ul(t,a.permission)}return e.section==="jobs"?mc(e,t):e.section==="tasks"?_c(e,t):e.section==="files"?wc(e,t):e.section==="users"?Oc(e,t):e.section==="settings"?Uc(e,t):e.section==="forms"?zc(t):e.section==="analytics"?Xl(e,t):e.section==="crm"?od(e,t):e.section==="contacts"?ec(e,t):e.section==="deals"?fd(e,t):e.section==="finance"?Vd(e,t):e.section==="messages"?kd(e,t):e.section==="team-chart"?Nc(t):e.section==="time"||e.section==="calendar"||e.section==="approvals"||e.section==="clock"?Kd(e,t):bi(e.section)}function Nl(e){const t=ln(e);return`
    ${z(t?"Workspace awaiting approval":"Subscription required",t?"Your company workspace is created. Quest needs to approve billing/access before live company data opens.":"This company workspace needs an active subscription before paid modules can open.",`
      <button class="btn" type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
      <a class="btn btn-primary" href="${_(m("settings",{tab:"billing"},e))}" data-router><i class="ti ti-credit-card"></i>${t?"Review status":"Billing"}</a>
    `)}
    <section class="panel">
      ${Y([["Company",x(e)],["Subscription",dn(e)],["Allowed area","Settings, profile, and sign out remain available"],["Next step",t?"Quest approval / billing activation":"Restore billing access"]])}
    </section>
  `}function Ul(e,t){return`
    ${z("Access denied","Your role does not include the permission required for this module.",`
      <a class="btn" href="${_(m("settings",{tab:"roles"},e))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${Y([["Company",x(e)],["Required permission",t],["Your role",mt(e)]])}
    </section>
  `}function Ll(e){return`
    ${z("Company access denied","This workspace is not in your active company memberships.",`
      <a class="btn" href="${_(m("jobs",{},u()))}" data-router><i class="ti ti-building"></i>Your workspace</a>
      <a class="btn btn-primary" href="${_("/login?mode=request")}" data-router><i class="ti ti-user-plus"></i>Request access</a>
    `)}
    <section class="panel">
      ${Y([["Requested company",x(e)],["Access rule","Active company membership required"],["Your status",ce(e,b().profile.id)?.status?O(ce(e,b().profile.id).status):"No active membership"]])}
    </section>
  `}function Ql(e){return qr(e)}function qr(e){const t=V(e),a=G(e),n=a.filter(Q=>Q.status!=="done"),i=n.filter(Q=>Q.due&&new Date(Q.due)<jt()),o=$("messages.view",e)?ds(e):0,l=ke(e),d=je(e),c=ie(e),f=c.filter(Q=>Q.status==="active"),g=c.filter(Q=>Q.status==="pending"),D=Vl(e,Kr(e).slice(0,4)),U=Kl(e),T=be(e).filter(Q=>!Q.is_system).length,re=new Set(be(e).flatMap(Q=>Q.permissions||[])).size,Re=$("users.view",e)||$("settings.view",e);return`
    <section class="home-cockpit">
      <div class="home-hero">
        <div>
          <h1>Good ${r(Gl())}, <span>${r(Zl(b().profile.full_name)||"Quest Admin")}</span></h1>
          <p>Here is what is happening across your workspace.</p>
        </div>
        <div class="home-hero-actions">
          <label class="company-switch home-company-switch">
            ${B("q-company")}
            <select data-company-switch aria-label="Active company">
              ${Ct().map(Q=>`<option value="${r(Q.id)}" ${Q.id===e?"selected":""}>${r(Te(Q))}</option>`).join("")}
            </select>
          </label>
          <button class="icon-button" type="button" data-action="toggle-notifications" aria-label="Open notifications">
            <i class="ti ti-bell"></i>
            ${o?`<b>${r(String(Math.min(o,99)))}</b>`:""}
          </button>
          ${ee(b().profile,"avatar")}
        </div>
      </div>
      <section class="home-metric-grid">
        ${qt("q-symbol-approvals","Company access",dn(e),ln(e)?"Approval required before full access.":"Workspace modules are available.",m("settings",{tab:"billing"},e),"View status",te(e)?"good":"warning")}
        ${qt("q-symbol-users","Active users",f.length,`${f.length} active / ${g.length} pending`,m("users",{},e),"Manage users")}
        ${qt("q-symbol-tasks","Open tasks",n.length,`${i.length} overdue`,m("tasks",{},e),"View tasks",i.length?"warning":"")}
        ${qt("q-symbol-messages","Unread messages",o,"Across team chats",m("messages",{},e),"Open inbox")}
        ${qt("q-symbol-settings","Workspace health",te(e)?"Good":"Pending",te(e)?"All core systems operational":"Approval or billing still needs attention.",m("settings",{},e),"See details",te(e)?"good":"warning")}
      </section>
      <section class="home-dashboard-grid">
        <article class="panel home-activity-panel">
          <div class="section-head">
            <div><h2>Recent activity</h2><p>Latest company work and inbox events.</p></div>
            <a class="btn" href="${_(m("analytics",{},e))}" data-router>All activity</a>
          </div>
          <div class="home-activity-list">
            ${D.map(Bl).join("")||v("No recent activity yet.")}
          </div>
        </article>
        <article class="panel home-message-panel">
          <div class="section-head">
            <div><h2>Unread messages</h2><p>Team conversations needing attention.</p></div>
            <a href="${_(m("messages",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-message-list">
            ${Yl(e).map(Hl).join("")||v("No unread messages.")}
          </div>
        </article>
        <article class="panel home-next-panel">
          <div class="section-head">
            <div><h2>Next tasks</h2><p>Your cleanest path through today.</p></div>
            <a href="${_(m("tasks",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-next-list">
            ${Wl(e).map(zl).join("")||v("No open tasks.")}
          </div>
        </article>
        <article class="panel home-team-panel">
          <div class="section-head">
            <div><h2>Team access</h2><p>Active people in this workspace.</p></div>
            <a href="${_(m("users",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-team-list">
            ${f.slice(0,4).map(Jl).join("")||v("No active users yet.")}
          </div>
        </article>
        <article class="panel home-health-panel">
          <div class="section-head"><div><h2>Workspace health</h2><p>Access, billing, and operating signals.</p></div></div>
          <div class="home-health-body">
            <div class="home-orbit" aria-hidden="true"><span>${B("q-logo","brand-symbol")}</span></div>
            <div class="home-health-list">
              ${U.map(Q=>`<div class="${r(Q.state)}"><i class="ti ${r(Q.icon)}"></i><span>${r(Q.label)}</span></div>`).join("")}
            </div>
          </div>
        </article>
        <article class="panel home-access-panel">
          <div class="section-head">
            <div><h2>Access control</h2><p>Roles, permissions, protected data, and audit trail.</p></div>
            <a href="${_(m("settings",{tab:"roles"},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-access-grid">
            <div><i class="ti ti-user-shield"></i><strong>${r(T||be(e).length)}</strong><span>Custom roles</span></div>
            <div><i class="ti ti-shield-lock"></i><strong>${r(re||Wi.length)}</strong><span>Active rules</span></div>
            <div><i class="ti ti-lock"></i><strong>${r(Re?"100%":"Basic")}</strong><span>Protected data</span></div>
            <div><i class="ti ti-clipboard-check"></i><strong>${r(io(e).length)}</strong><span>Audit events</span></div>
          </div>
        </article>
      </section>
      <section class="home-shortcuts panel">
        ${Ne("files","q-symbol-files","Files",l.length,e)}
        ${Ne("crm","q-symbol-crm","CRM",yo(e).length,e)}
        ${Ne("finance","q-symbol-finance","Finance",De(e).length,e)}
        ${Ne("calendar","q-symbol-calendar","Calendar",Xr(e).length,e)}
        ${Ne("users","q-symbol-users","Users",f.length,e)}
        ${Ne("forms","q-symbol-forms","Forms",d.length,e)}
        ${Ne("analytics","q-symbol-analytics","Reports",t.length+a.length,e)}
      </section>
    </section>
  `}function qt(e,t,a,n,i,o,l=""){return`
    <article class="home-metric-card ${r(l)}">
      ${B(e)}
      <span>${r(t)}</span>
      <strong>${r(a)}</strong>
      <small>${r(n)}</small>
      <a href="${_(i)}" data-router>${r(o)} <i class="ti ti-arrow-right"></i></a>
    </article>
  `}function Ne(e,t,a,n,i){const o=ht.find(l=>l.id===e);return o&&!Cr(o,i)?"":`
    <a class="home-shortcut" href="${_(m(e,{},i))}" data-router>
      ${B(t)}
      <span>${r(a)}</span>
      ${n!==""&&n!==void 0?`<b>${r(String(n))}</b>`:""}
    </a>
  `}function Vl(e,t=[]){const a=t.map(o=>({icon:"ti-bell",title:o.body||o.title,meta:Ro(o.type),time:o.created_at,href:o.href||m("home",{},e),avatar:b().profile})),n=G(e).slice(0,3).map(o=>({icon:"ti-circle-check",title:`${o.title} was updated`,meta:"Tasks",time:o.updated_at||o.due,href:m("tasks",{...o.project_id?{job_id:o.project_id}:{},task_id:o.id},e),avatar:{full_name:W(o.assignee_id)}})),i=ke(e).slice(0,2).map(o=>({icon:"ti-folder",title:`${o.name} was uploaded`,meta:"Files",time:o.updated_at||o.created_at,href:m("files",o.job_id?{job_id:o.job_id}:{},e),avatar:{full_name:W(o.owner_id||o.created_by)}}));return a.concat(n,i).sort((o,l)=>Date.parse(l.time||0)-Date.parse(o.time||0)).slice(0,5)}function Bl(e){return`
    <a class="home-activity-row" href="${_(e.href)}" data-router>
      <span class="home-activity-icon"><i class="ti ${r(e.icon)}"></i></span>
      <span><strong>${r(e.title)}</strong><small>${r(e.meta)}</small></span>
      ${ee(e.avatar||{},"avatar small")}
      <em>${r(Ze(e.time))}</em>
    </a>
  `}function Yl(e){return $("messages.view",e)?Ye(e).filter(t=>lt(t.id)>0).slice(0,4).map(t=>{const a=Ee(t.id).slice(-1)[0];return{id:t.id,title:a?.body||t.title,meta:`${t.title} - ${Ze(a?.created_at||t.updated_at||t.created_at)}`,href:m("messages",{conversation:t.id},e),count:lt(t.id),avatar:{full_name:a?W(a.sender_profile_id):t.title}}}):[]}function Hl(e){return`
    <a class="home-message-row" href="${_(e.href)}" data-router>
      ${ee(e.avatar||{},"avatar small")}
      <span><strong>${r(e.title)}</strong><small>${r(e.meta)}</small></span>
      <b>${r(e.count)}</b>
    </a>
  `}function Wl(e){return G(e).filter(t=>t.status!=="done").sort(Cn).slice(0,4)}function zl(e){return`
    <a class="home-next-row" href="${_(m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id))}" data-router>
      <i class="ti ti-circle"></i>
      <span><strong>${r(e.title)}</strong><small>${r(N(e.project_id)?.name||Ge(e.type))}</small></span>
      ${Ts(e.priority)}
      <em>${r(e.due?P(e.due):"Open")}</em>
    </a>
  `}function Jl(e){return`
    <a class="home-team-row" href="${_(m("users",{},u()))}" data-router>
      ${ee({full_name:e.name,email:e.email,avatar_url:e.avatar_url},"avatar small")}
      <span><strong>${r(e.name)}</strong><small>${r(e.email||e.role_label)}</small></span>
      <b>${r(e.role_label)}</b>
    </a>
  `}function Kl(e){return[{label:"Company created",icon:"ti-circle-check",state:"good"},{label:te(e)?"Access approved":"Pending approval",icon:te(e)?"ti-circle-check":"ti-clock",state:te(e)?"good":"warning"},{label:"Billing connected",icon:"ti-link",state:te(e)?"good":"muted"},{label:te(e)?"Payment active":"Payment not active",icon:"ti-credit-card",state:te(e)?"good":"muted"},{label:"Full access enabled",icon:"ti-shield-check",state:te(e)?"good":"muted"}]}function Gl(){const e=new Date().getHours();return e<12?"morning":e<18?"afternoon":"evening"}function Zl(e){return String(e||"").trim().split(/\s+/)[0]||""}function Xl(e,t){const a=e.jobId?N(e.jobId):null,n=a?[a]:V(t),i=G(t).filter(g=>!a||g.project_id===a.id),o=ke(t).filter(g=>!a||g.job_id===a.id),l=je(t).filter(g=>!a||g.linked_job_id===a.id),d=i.filter(g=>g.status!=="done"),c=i.filter(g=>g.status!=="done"&&g.due&&new Date(g.due)<jt()),f=X(n,"estimate_total");return`
    <section class="analytics-workspace">
      <section class="analytics-toolbar panel">
        <div>
          <strong>Analytics</strong>
          <span>${r(a?a.name:x(t))}</span>
        </div>
        <label>
          <span>Job</span>
          <select data-analytics-job-filter>
            <option value="">All jobs</option>
            ${V(t).map(g=>`<option value="${r(g.id)}" ${a?.id===g.id?"selected":""}>${r(g.name)}</option>`).join("")}
          </select>
        </label>
        <a class="btn" href="${_(m("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      </section>
      <section class="analytics-grid">
        <article class="panel analytics-score">
          <span>Open work</span>
          <strong>${r(d.length)}</strong>
          <small>${r(c.length)} overdue / ${r(i.filter(g=>g.priority==="urgent"||g.priority==="critical").length)} urgent</small>
        </article>
        <article class="panel analytics-score">
          <span>Pipeline value</span>
          <strong>${r(C(f))}</strong>
          <small>${r(n.length)} visible job${n.length===1?"":"s"}</small>
        </article>
        <article class="panel analytics-score">
          <span>Drive and forms</span>
          <strong>${r(o.length+l.length)}</strong>
          <small>${r(o.length)} files / ${r(l.length)} forms</small>
        </article>
        <article class="panel analytics-score">
          <span>Completion</span>
          <strong>${r(Rf(i.filter(g=>g.status==="done").length,i.length))}</strong>
          <small>${r(i.filter(g=>g.status==="done").length)} done of ${r(i.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${n.map(g=>`
              <a class="analytics-row" href="${_(m("analytics",{job_id:g.id},t))}" data-router>
                <span><strong>${r(g.name)}</strong><small>${r(g.client_name||x(t))}</small></span>
                <span>${r(g.stage)}</span>
                <span>${r(js(g.id))}</span>
                <span>${r(Aa(g.id))}</span>
                <span>${r(C(g.estimate_total))}</span>
              </a>
            `).join("")||v("No jobs to analyze yet.")}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${Jt.map(g=>{const D=i.filter(U=>U.status===g).length;return`<div><span>${r(qe(g))}</span><b><i style="width:${r(el(D,i.length))}%"></i></b><strong>${r(D)}</strong></div>`}).join("")}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${i.filter(g=>g.status!=="done").sort((g,D)=>vt(D.priority)-vt(g.priority)).slice(0,8).map(g=>Is(g)).join("")||v("No open tasks in this scope.")}
          </div>
        </article>
      </section>
    </section>
  `}function he(e){return`<span class="pipe-dot" style="background:${r(e||"#9AA0A8")}"></span>`}function Ga(e,t){return t?`<span class="stage-tag">${he(ol(e,t))}${r(t)}</span>`:'<span class="muted-dash">—</span>'}function ns(e,t){const a=Hn(e),n=Dr(e,t),i=e==="contacts"?kt(t).length:e==="deals"?Dt(t).length:V(t).length,o=e==="contacts"?s.contactStageFilter:e==="deals"?s.stageFilterDeals:s.stageFilter,l=e==="contacts"?s.contactBoardView:e==="deals"?s.dealBoardView:s.jobBoardView;return`
    <section class="pipe-toolbar">
      <div class="pipe-chips" role="group" aria-label="Filter by stage">
        <button class="pipe-chip ${o==="all"?"on":""}" type="button" data-action="pipeline-stage" data-module="${e}" data-stage="all">All<b>${r(String(i))}</b></button>
        ${a.map(d=>`
          <button class="pipe-chip ${o===d.name?"on":""}" type="button" data-action="pipeline-stage" data-module="${e}" data-stage="${r(d.name)}">
            ${he(d.color)}${r(d.name)}<b>${r(String(n[d.name]||0))}</b>
          </button>
        `).join("")}
      </div>
      <div class="segmented" role="group" aria-label="View">
        <button class="${l==="table"?"active":""}" type="button" data-action="set-pipeline-view" data-module="${e}" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${l==="board"?"active":""}" type="button" data-action="set-pipeline-view" data-module="${e}" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function ec(e,t){const a=e.params.get("stage");return a&&(s.contactStageFilter=ot().includes(a)?a:"all"),`
    ${z("Contacts","Sales pipeline - prospects and leads moving toward won work.",`
      <button class="btn" type="button" data-action="open-stage-manager" data-module="contacts"><i class="ti ti-adjustments-horizontal"></i>Manage stages</button>
      <button class="btn btn-primary" type="button" data-action="open-contact-form" data-mode="new"><i class="ti ti-plus"></i>Add contact</button>
    `)}
    ${ns("contacts",t)}
    ${s.contactBoardView==="board"?ac(t):tc(t)}
  `}function tc(e){const t=oo(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Contacts</h2><p>${t.length} visible contact${t.length===1?"":"s"}</p></div></div>
      <div class="data-table contacts-table">
        <div class="table-head"><span>Client</span><span>Phone</span><span>Email</span><span>Location</span><span>Stage</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===s.selectedContactId?"active":""}" type="button" data-action="open-contact-form" data-mode="edit" data-contact-id="${r(a.id)}">
            <span class="cell-lead">${he(Gi(a.stage))}<span><strong>${r(a.name)}</strong><small>${r(a.owner_name||"Unassigned")}</small></span></span>
            <span>${a.phone?r(a.phone):'<span class="muted-dash">—</span>'}</span>
            <span>${a.email?r(a.email):'<span class="muted-dash">—</span>'}</span>
            <span>${a.location?r(a.location):'<span class="muted-dash">—</span>'}</span>
            <span>${Ga("contacts",a.stage)}</span>
            <span>${a.value?C(a.value):'<span class="muted-dash">—</span>'}</span>
          </button>
        `).join("")||v("No contacts in this view yet.")}
      </div>
    </section>
  `}function ac(e){const t=oo(e,!0),a=s.contactStageFilter;return`
    <section class="pipe-board">
      ${(a==="all"?ri():ri().filter(i=>i.name===a)).map(i=>{const o=t.filter(l=>l.stage===i.name);return`
          <article class="pipe-lane">
            <header class="pipe-lane-head">${he(i.color)}<span>${r(i.name)}</span><b>${o.length}</b></header>
            <div class="pipe-lane-body">
              ${o.map(l=>nc(l)).join("")||'<div class="lane-empty">No contacts</div>'}
            </div>
          </article>
        `}).join("")}
    </section>
  `}function nc(e){return`
    <button class="pipe-card ${e.id===s.selectedContactId?"active":""}" type="button" data-action="open-contact-form" data-mode="edit" data-contact-id="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.location||e.phone||e.email||"No details")}</span>
      <em>${e.value?C(e.value):"—"}</em>
    </button>
  `}function li(e,t){return E("Contacts",t?"Edit contact":"Add contact",sc(e,t),"wide-modal")}function sc(e,t){const a=t||ic(e);return`
    <form class="job-editor" data-contact-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit contact":"New contact"}</h2><p>Contacts move through your customizable sales pipeline stages.</p></div>
      </div>
      ${w("Name","name",a.name,!0)}
      ${I("Company","company_id",e,Ct().map(n=>[n.id,Te(n)]))}
      ${I("Account","account_id",a.account_id,[["","— None —"]].concat(aa(e).map(n=>[n.id,n.name])))}
      ${w("Title","title",a.title)}
      ${w("Phone","phone",a.phone)}
      ${w("Email","email",a.email,!1,"email")}
      ${w("Location","location",a.location,!1,"text","span-2")}
      ${I("Stage","stage",a.stage||ot()[0],ot().map(n=>[n,n]))}
      ${w("Owner","owner_name",a.owner_name)}
      ${w("Estimated value","value",a.value||0,!1,"number")}
      ${de("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save contact</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-contact" data-contact-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function ic(e=u()){const t=s.contactPrefill||{};return Rt({id:"",company_id:e,name:"",stage:ot()[0],value:0,account_id:t.account_id||""})}async function rc(e){const t=Object.fromEntries(new FormData(e).entries()),a=Rt(t);a.id=a.id||`contact-${crypto.randomUUID()}`,a.updated_at=new Date().toISOString();const n=F();if(n){const i=ut(Ve(a,vo),["account_id"]);try{const o=await n.from("contacts").upsert(i).select().single();if(!o.error&&o.data){Dn(Rt(o.data)),s.selectedContactId=a.id,s.modal="",h(`${a.name} saved.`,"live","Contacts"),p();return}}catch(o){console.warn("Contact save sync failed",o)}}Dn(a),s.selectedContactId=a.id,s.modal="",h(`${a.name} saved.`,"local","Contacts"),p()}async function oc(e){if(!e)return;const t=F();if(t)try{await t.from("contacts").delete().eq("id",e)}catch(a){console.warn("Contact delete sync failed",a)}s.contacts=s.contacts.filter(a=>a.id!==e),gs(),s.selectedContactId===e&&(s.selectedContactId=""),s.modal="",p()}function hn(e){const t=Hn(e),a=e==="contacts"?"Contact pipeline stages":e==="deals"?"Deal pipeline stages":"Job pipeline stages",n=`
    <form class="stage-manager" data-stage-form data-kind="${e}">
      <p class="stage-manager-hint">Stages are your pipeline columns - the placeholder groups your team can shape. Rename or recolor any stage and your records keep their place; add new stages for any workflow.</p>
      <div class="stage-rows">
        ${t.map((i,o)=>`
          <div class="stage-row">
            <span class="stage-row-handle">${he(i.color)}</span>
            <input type="text" name="name_${o}" value="${r(i.name)}" placeholder="Stage name" />
            <input type="hidden" name="orig_${o}" value="${r(i.name)}" />
            <input class="stage-color" type="color" name="color_${o}" value="${r(/^#[0-9a-fA-F]{6}$/.test(i.color)?i.color:"#9aa0a8")}" aria-label="Stage color" />
            <button class="btn danger stage-del" type="button" data-action="delete-stage" data-module="${e}" data-index="${o}" aria-label="Delete stage"><i class="ti ti-trash"></i></button>
          </div>
        `).join("")}
      </div>
      <button class="btn add-stage-btn" type="button" data-action="add-stage" data-module="${e}"><i class="ti ti-plus"></i>Add stage</button>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save stages</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `;return E("Pipeline",a,n,"wide-modal")}function Fr(e){const t=Object.fromEntries(new FormData(e).entries()),a=[],n={};let i=0;for(;t[`name_${i}`]!==void 0;){const o=String(t[`name_${i}`]||"").trim(),l=/^#[0-9a-fA-F]{3,8}$/.test(String(t[`color_${i}`]||""))?t[`color_${i}`]:"#9aa0a8",d=t[`orig_${i}`]!==void 0?String(t[`orig_${i}`]):"";o&&(a.push({name:o,color:l}),d&&d!==o&&(n[d]=o)),i+=1}return{stages:a,renameMap:n}}function Mr(e){const t=document.querySelector("[data-stage-form]");if(!t)return;const{stages:a}=Fr(t);a.length&&(e==="contacts"?fe=a:e==="deals"?ge=a:pe=a)}function ss(e){return e==="contacts"?fe:e==="deals"?ge:pe}function Ir(e){e==="contacts"?ar():e==="deals"?nr():tr()}function lc(e){Mr(e);const t=ss(e),a=si[t.length%si.length];t.push({name:`New stage ${t.length+1}`,color:a}),Ir(e),rs(e),p()}function cc(e,t){Mr(e);const a=ss(e);if(a.length<=1){h("Keep at least one stage in the pipeline.","local","Stages");return}Number.isInteger(t)&&t>=0&&t<a.length&&a.splice(t,1),Ir(e),rs(e),p()}function is(e){if(!Array.isArray(s.pipelineStages)||!s.pipelineStages.length)return;const t=(a,n)=>{const i=s.pipelineStages.filter(o=>o.company_id===e&&o.kind===a).slice().sort((o,l)=>(o.position||0)-(l.position||0)).map(o=>({name:String(o.name||"").trim(),color:/^#[0-9a-fA-F]{3,8}$/.test(String(o.color||""))?o.color:"#9aa0a8"})).filter(o=>o.name);return i.length?i:n.map(o=>({...o}))};pe=t("jobs",zi),fe=t("contacts",Ji),ge=t("deals",Ki),s.stageFilter!=="all"&&!zt().includes(s.stageFilter)&&(s.stageFilter="all"),s.contactStageFilter!=="all"&&!ot().includes(s.contactStageFilter)&&(s.contactStageFilter="all"),s.stageFilterDeals!=="all"&&!$t().includes(s.stageFilterDeals)&&(s.stageFilterDeals="all")}async function rs(e){const t=F();if(!t)return;const a=u(),i=ss(e).map((o,l)=>({company_id:a,kind:e,name:o.name,color:o.color,position:l}));try{await t.from("pipeline_stages").delete().eq("company_id",a).eq("kind",e),i.length&&await t.from("pipeline_stages").insert(i),s.pipelineStages=(Array.isArray(s.pipelineStages)?s.pipelineStages:[]).filter(o=>!(o.company_id===a&&o.kind===e)).concat(i)}catch(o){console.warn("Pipeline stage sync failed",o)}}function dc(e){const t=["contacts","deals"].includes(e.dataset.kind)?e.dataset.kind:"jobs",{stages:a,renameMap:n}=Fr(e);if(!a.length){h("Add at least one stage before saving.","local","Stages");return}const i=new Set(a.map(l=>l.name)),o=a[0].name;t==="contacts"?(fe=a,ar(),s.contacts.forEach(l=>{n[l.stage]&&(l.stage=n[l.stage]),i.has(l.stage)||(l.stage=o)}),gs(),s.contactStageFilter!=="all"&&!i.has(s.contactStageFilter)&&(s.contactStageFilter="all")):t==="deals"?(ge=a,nr(),s.deals.forEach(l=>{n[l.stage]&&(l.stage=n[l.stage]),i.has(l.stage)||(l.stage=o)}),k(xa,s.deals),s.stageFilterDeals!=="all"&&!i.has(s.stageFilterDeals)&&(s.stageFilterDeals="all")):(pe=a,tr(),s.jobs.forEach(l=>{n[l.stage]&&(l.stage=n[l.stage]),i.has(l.stage)||(l.stage=o)}),k(Pa,s.jobs),s.stageFilter!=="all"&&!i.has(s.stageFilter)&&(s.stageFilter="all")),rs(t),uc(t,n),s.modal="",h("Pipeline stages updated.","local","Stages"),p()}async function uc(e,t){const a=F();if(!a||!t||!Object.keys(t).length)return;const n=u(),i=e==="contacts"?"contacts":e==="deals"?"deals":"jobs";for(const[o,l]of Object.entries(t))try{await a.from(i).update({stage:l}).eq("company_id",n).eq("stage",o)}catch(d){console.warn("Stage rename sync failed",d)}}function mc(e,t){const a=hm(e.params.get("tab")),n=e.params.get("stage");n&&(s.stageFilter=zt().includes(n)?n:"all");const i=Le();return`
    ${z("Jobs","Production pipeline - every job type, from intake to paid.",`
      <a class="btn" href="${_(m("files",i?{job_id:i.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn" type="button" data-action="open-stage-manager" data-module="jobs"><i class="ti ti-adjustments-horizontal"></i>Manage stages</button>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <nav class="tabbar" aria-label="Job sections">
      ${sr.map(o=>`<a class="${o===a?"active":""}" href="${_(m("jobs",{tab:o,...i?{job_id:i.id}:{}},t))}" data-router>${r($m(o))}</a>`).join("")}
    </nav>
    ${pc(a,t,i)}
  `}function pc(e,t,a){return e==="pipeline"?ci(t):e==="list"?Er(t):e==="profile"?gc(t,a):ci(t)}function ci(e){return`
    ${ns("jobs",e)}
    ${s.jobBoardView==="board"?fc(e):Er(e)}
  `}function fc(e){const t=ro(e,!0),a=s.stageFilter;return`
    <section class="pipe-board">
      ${(a==="all"?ii():ii().filter(i=>i.name===a)).map(i=>{const o=t.filter(l=>l.stage===i.name);return`
          <article class="pipe-lane">
            <header class="pipe-lane-head">${he(i.color)}<span>${r(i.name)}</span><b>${o.length}</b></header>
            <div class="pipe-lane-body">
              ${o.map(l=>Lp(l)).join("")||'<div class="lane-empty">No jobs</div>'}
            </div>
          </article>
        `}).join("")}
    </section>
  `}function Er(e){const t=ro(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Jobs</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Type</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===s.selectedJobId?"active":""}" type="button" data-select-job="${r(a.id)}">
            <span class="cell-lead">${he(Yn(a.stage))}<span><strong>${r(a.name)}</strong><small>${r(a.client_name||"No client")} - ${r(a.site_address||"No address")}</small></span></span>
            <span>${r(a.job_type||"—")}</span>
            <span>${Ga("jobs",a.stage)}</span>
            <span>${Es(a.priority)}</span>
            <span>${r(a.owner_name||"Unassigned")}</span>
            <span>${C(a.estimate_total)}</span>
          </button>
        `).join("")||v("No jobs match this view.")}
      </div>
    </section>
  `}function gc(e,t){return t?`
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${r(x(e))} - ${r(t.job_type)}</span>
          <h2>${r(t.name)}</h2>
          <p>${r(t.scope||"No scope written yet.")}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${Y([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",C(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${_(m("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(t.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${ba(m("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${js(t.id)} linked tasks`)}
          ${ba(m("files",{job_id:t.id},e),"ti-folder","Files",`${Aa(t.id)} files`)}
          ${ba(m("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${ba(m("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:v("Create a job to see the profile workspace.")}function bc(e,t){const a=t||qp(e);return`
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${w("Workspace name","name",a.name,!0)}
      ${I("Company","company_id",e,Ct().map(n=>[n.id,Te(n)]))}
      ${w("Client","client_name",a.client_name)}
      ${w("Contact","contact_name",a.contact_name)}
      ${w("Account owner","owner_name",a.owner_name)}
      ${w("Job type","job_type",a.job_type||"Roofing")}
      ${I("Stage","stage",Xi(a.stage),zt().map(n=>[n,n]))}
      ${I("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(n=>[n,n]))}
      ${w("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${w("Invoice total","invoice_total",a.invoice_total||0,!1,"number")}
      ${w("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${de("Scope","scope",a.scope,"span-2")}
      ${de("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function _c(e,t){const a=e.jobId?N(e.jobId):null,n=bp(t,a?.id);return`
    ${z(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${_(m("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${_(m("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${vc(t,a)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${s.taskView==="board"?hc(t,n):yc(t,n)}
      </article>
    </section>
  `}function vc(e,t){return`
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${V(e).map(n=>`<option value="${r(n.id)}" ${t?.id===n.id?"selected":""}>${r(n.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${["all"].concat(Jt).map(n=>`<option value="${r(n)}" ${s.taskStatusFilter===n?"selected":""}>${r(n==="all"?"All statuses":qe(n))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(wa).map(n=>`<option value="${r(n)}" ${s.taskPriorityFilter===n?"selected":""}>${r(n==="all"?"All priorities":O(n))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${s.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${s.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function yc(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===s.selectedTaskId?"active":""}" type="button" data-select-task="${r(a.id)}">
          <span><strong>${r(a.title)}</strong><small>${r(a.description||Ge(a.type))}</small></span>
          <span>${r(N(a.project_id)?.name||"Company task")}</span>
          <span>${r(W(a.assignee_id))}</span>
          <span>${Ts(a.priority)}</span>
          <span>${Io(a.status)}</span>
          <span>${P(a.due)}</span>
        </button>
      `).join("")||v("No tasks match this workspace view.")}
    </div>
  `}function hc(e,t){return`
    <div class="task-board">
      ${Jt.map(a=>{const n=t.filter(i=>i.status===a);return`
          <section class="task-column">
            <h2><span>${r(qe(a))}</span><b>${n.length}</b></h2>
            ${n.map(i=>`
              <button class="task-card priority-${r(i.priority)}" type="button" data-select-task="${r(i.id)}">
                <strong>${r(i.title)}</strong>
                <span>${r(N(i.project_id)?.name||x(e))}</span>
                <small>${r(W(i.assignee_id))} - ${P(i.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function $c(e,t){return t?`
    <div class="section-head">
      <div><h2>${r(t.title)}</h2><p>${r(N(t.project_id)?.name||x(e))}</p></div>
      <a class="btn" href="${_(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${Y([["Status",qe(t.status)],["Priority",O(t.priority)],["Type",Ge(t.type)],["Assignee",W(t.assignee_id)],["Due",P(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${r(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${v("No task selected.")}
    `}function di(e,t,a){const n=a||Fp(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${r(a?n.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${w("Task title","title",n.title,!0)}
      ${I("Job","project_id",n.project_id||"",[["","Company-level task"]].concat(V(e).map(i=>[i.id,i.name])))}
      ${I("Status","status",n.status,Jt.map(i=>[i,qe(i)]))}
      ${I("Priority","priority",n.priority,wa.map(i=>[i,O(i)]))}
      ${I("Type","type",n.type,ir.map(i=>[i,Ge(i)]))}
      ${I("Assignee","assignee_id",n.assignee_id,wt(e).map(i=>[i.id,W(i.id)]))}
      ${w("Due date","due",n.due||j(1),!0,"date")}
      ${de("Description","description",n.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${r(a.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function wc(e,t){const a=e.params.get("folder")||s.driveFolder||"home";s.driveFolder=a;const n=e.jobId?N(e.jobId):null,i=pf(t,a,n?.id||""),o=$("files.manage",t);return`
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${r(n?n.name:"Company Drive")}</strong>
              <small>${r(n?`${n.client_name||x(t)} file workspace`:`${x(t)} file manager`)}</small>
            </div>
          </div>
          <label class="drive-search">
            <i class="ti ti-search"></i>
            <input data-file-search value="${r(s.fileQuery)}" placeholder="Search drive" />
          </label>
          <div class="drive-actions">
            ${o?`
              <button class="btn" type="button" data-action="open-folder-form"><i class="ti ti-folder-plus"></i>New folder</button>
              <button class="btn" type="button" data-action="open-file-upload"><i class="ti ti-upload"></i>Upload</button>
            `:""}
            <button class="btn icon-only" type="button" data-action="refresh-data" title="Refresh" aria-label="Refresh"><i class="ti ti-refresh"></i></button>
          </div>
        </header>
        <div class="drive-shell drive-shell-compact">
          <div class="drive-main">
            <section class="drive-crumb-row">
              <nav class="breadcrumbs" aria-label="Drive location">
                <a href="${_(m("files",{},t))}" data-router>${r(x(t))}</a>
                ${a!=="home"?mf(t,a,n):""}
                ${n?`<span>/</span><strong>${r(n.name)}</strong>`:""}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${s.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${s.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${Sc(t,a,n,i)}
          </div>
        </div>
      </section>
    </section>
  `}function Sc(e,t,a,n){const i=df(e,t,a),o=i.map(d=>({kind:"folder",...d})).concat(n.map(d=>({kind:"file",file:d}))),l=a?a.name:t==="home"?"This folder":ye(t);return`
    <section class="drive-section-title">
      <div><h3>${r(l)}</h3><span>${i.length} folder${i.length===1?"":"s"} / ${n.length} file${n.length===1?"":"s"}</span></div>
    </section>
    ${s.driveView==="list"?kc(o):Dc(o)}
  `}function kc(e){return`
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${e.map(t=>t.kind==="folder"?jc(t):Ac(t.file)).join("")||v("This folder is empty.")}
    </div>
  `}function Dc(e){return`
    <section class="drive-folder-grid explorer-grid">
      ${e.map(t=>t.kind==="folder"?Cc(t):Fc(t.file)).join("")||v("This folder is empty.")}
    </section>
  `}function Cc(e){return`
    <a class="drive-folder-card explorer-folder" href="${r(e.href)}" data-router>
      <span class="drive-folder-icon">${Ko(e,e.name)}</span>
      <strong>${r(e.name)}</strong>
      <em>${r(e.countLabel||"0 items")}</em>
    </a>
  `}function jc(e){return`
    <a class="explorer-row folder-row-live" href="${r(e.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder">${Ko(e,e.name)}</span><strong>${r(e.name)}</strong></span>
      <span>${r(e.updatedLabel||"")}</span>
      <span>Folder</span>
      <span>${r(e.countLabel||"")}</span>
    </a>
  `}function Ac(e){return`
    <button type="button" class="explorer-row ${e.id===s.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}" role="row">
      <span class="explorer-name">${qc(e)}<strong>${r(e.file_name)}</strong></span>
      <span>${P(e.updated_at||e.created_at)}</span>
      <span>${r(Pe(e))}</span>
      <span>${Ls(e.size_bytes)}</span>
    </button>
  `}function qc(e){return`
    <span class="file-type ${r(Ns(e))}">
      ${Go(e,Pe(e))}
      <small>${r(Vo(e))}</small>
    </span>
  `}function Fc(e){return`
    <button type="button" class="file-card-live ${e.id===s.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}">
      <span class="file-thumb">${Us(e)}</span>
      <strong>${r(e.file_name)}</strong>
      <span>${r(Pe(e))} / ${Ls(e.size_bytes)}</span>
    </button>
  `}function Mc(e,t){const a=$("files.manage",t);return`
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${Ic(e)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${Us(e)}
          <div>
            <strong>${r(e.file_name)}</strong>
            <span>${r(Pe(e))} / ${Ls(e.size_bytes)}</span>
          </div>
        </div>
        <div class="file-detail-list">
          ${Ue("Location",ye(e.folder))}
          ${Ue("Job",N(e.job_id)?.name||"Company shared")}
          ${Ue("Uploaded by",e.uploaded_by_label||"Quest HQ")}
          ${Ue("Modified",P(e.updated_at||e.created_at))}
          ${Ue("Storage",e.object_path||"Metadata only")}
        </div>
        <div class="file-detail-actions">
          <button class="btn" type="button" data-action="download-file" data-file-id="${r(e.id)}"><i class="ti ti-download"></i>Download</button>
          ${a?`<button class="btn danger" type="button" data-action="delete-file" data-file-id="${r(e.id)}"><i class="ti ti-trash"></i>Delete</button>`:""}
        </div>
      </aside>
    </section>
  `}function Ic(e){const t=Ns(e);return e.signed_url&&t==="image"?`<img class="file-preview-media" src="${r(e.signed_url)}" alt="" />`:e.signed_url&&t==="pdf"?`<iframe class="file-preview-frame" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:e.signed_url&&t==="text"?`<iframe class="file-preview-frame text" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:["doc","sheet"].includes(t)&&e.signed_url?`<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:`
    <div class="file-preview-empty">
      ${Us(e,!0)}
      <strong>${r(Pe(e))} preview</strong>
      <p>${r(e.object_path?"Preview will load when a signed file URL is available.":"This is a metadata-only file record. Upload the actual file object to preview it here.")}</p>
      ${e.notes?`<pre>${r(e.notes)}</pre>`:""}
    </div>
  `}function Ec(){const e=u(),t=s.route||Xt(),a=t.params.get("folder")||s.driveFolder||"home",n=t.jobId?N(t.jobId):null;return E("Drive","New folder",`
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${r(e)}" />
      <input type="hidden" name="parent_key" value="${r(Qo(a,n))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${r(a==="home"?x(e):n?.name||ye(a))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"task-modal")}function Tc(){const e=u(),t=s.route?.params?.get("folder")||(s.driveFolder==="home"?"shared":s.driveFolder),a=s.route?.jobId||"";return`
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">${r(x(e))} Drive</div><h2 id="upload-title">Upload files</h2></div>
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
          ${I("Folder","folder",t,Tf(e))}
          ${I("Job","job_id",a,[["","Company shared file"]].concat(V(e).map(n=>[n.id,n.name])))}
          ${I("Category","category",ye(t),ml.filter(n=>n!=="All categories").map(n=>[n,n]))}
          ${w("Uploaded by","uploaded_by_label",b().profile.full_name||"Quest HQ")}
          ${de("Notes","notes","","span-2")}
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
  `}function Oc(e,t){const a=ie(t),n=["members","access"].includes(e.params.get("tab"))?e.params.get("tab"):"members",i=s.joinRequests.filter(c=>c.company_id===t&&c.status==="pending"),o=$("users.manage",t),l=a.filter(c=>c.status==="active"),d=a.filter(c=>c.status!=="active");return`
    ${z("Users","Company members, roles, workers, and access context.",`
      <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite user</button>
      <a class="btn" href="${_(m("settings",{tab:"roles"},t))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      <a class="btn" href="${_(m("settings",{tab:"access"},t))}" data-router><i class="ti ti-settings"></i>Access settings</a>
    `)}
    ${as("Users sections",[[m("users",{tab:"members"},t),"Members",n==="members"],[m("users",{tab:"access"},t),"Access",n==="access"]])}
    ${n==="members"?`
      <section class="metric-grid operations-metrics">
        ${A("Active users",l.length)}
        ${A("Pending",a.filter(c=>c.status==="pending").length+i.length)}
        ${A("Disabled/left",d.filter(c=>c.status!=="pending").length)}
        ${A("Roles",be(t).length)}
      </section>
      <section class="users-grid">
        ${a.map(c=>`
          <article class="user-card ${c.status!=="active"?"muted":""}">
            ${ee({full_name:Sa(c),email:c.email,avatar_url:c.avatar_url},"avatar")}
            <div>
              <strong>${r(Sa(c))}</strong>
              <span>${r(Tr(c))}</span>
              <small>${r(c.role_label)} / ${r(O(c.status))}</small>
            </div>
          </article>
        `).join("")||v("No users assigned to this company yet.")}
      </section>
    `:`
    <section class="dashboard-grid compact-settings-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Member access</h2><p>Assign roles and confirm each user's company status.</p></div>
        </div>
        <div class="access-user-list">
          ${a.map(c=>Pc(t,c,o)).join("")||v("No users assigned to this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head">
          <div><h2>Invites</h2><p>Copy a secure invite code or link for a specific email address.</p></div>
          <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite</button>
        </div>
        <div class="access-invite-list">
          ${Hm(t).map(c=>Rc(c,o)).join("")||v("No pending invites.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
        <div class="access-request-list">
          ${i.map(c=>xc(c,o)).join("")||v("No pending join requests.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
        ${Y([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Supabase Auth + RLS"],["Your role",mt(t)],["Can manage users",o?"Yes":"No"]])}
      </article>
    </section>
    `}
  `}function Pc(e,t,a){const n=be(e),i=t.role_id||xt(e,t.role)||n[0]?.id||"",o=t.profile_id&&Ao(e,t.profile_id),l=a&&t.profile_id&&!o;return`
    <article class="access-user-row ${t.status!=="active"?"muted":""}">
      ${ee({full_name:Sa(t),email:t.email,avatar_url:t.avatar_url},"avatar")}
      <div class="access-user-main">
        <strong>${r(Sa(t))}</strong>
        <span>${r(Tr(t))} / ${r(O(t.status))}</span>
        ${o?'<small class="access-note">Last active Owner - promote another Owner before changing this access.</small>':""}
      </div>
      <form class="access-role-form" data-user-role-form>
        <input type="hidden" name="company_id" value="${r(e)}" />
        <input type="hidden" name="profile_id" value="${r(t.profile_id)}" />
        <select name="role_id" ${l?"":"disabled"}>
          ${n.map(d=>`<option value="${r(d.id)}" ${d.id===i?"selected":""}>${r(d.name)}</option>`).join("")}
        </select>
        <select name="membership_status" ${l?"":"disabled"}>
          ${["active","pending","disabled","left"].map(d=>`<option value="${r(d)}" ${d===t.status?"selected":""}>${r(O(d))}</option>`).join("")}
        </select>
        <button class="btn" type="submit" ${l?"":"disabled"}>Save</button>
      </form>
    </article>
  `}function xc(e,t){const a=e.requested_email||He(e.profile_id)?.email||e.profile_id||"Requester";return`
    <article class="access-request-row">
      <div>
        <strong>${r(a)}</strong>
        <span>${r(e.message||"Access request")} / ${P(e.created_at)}</span>
      </div>
      <div>
        <button class="btn btn-primary" type="button" data-action="approve-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Approve</button>
        <button class="btn danger" type="button" data-action="reject-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Reject</button>
      </div>
    </article>
  `}function Rc(e,t){const a=St(e.company_id,e.role_id),n=e.expires_at&&Date.parse(e.expires_at)<Date.now();return`
    <article class="access-invite-row ${n?"muted":""}">
      <div>
        <strong>${r(e.email)}</strong>
        <span>${r(a?.name||"Member")} / ${n?"Expired":`Expires ${P(e.expires_at)}`}</span>
        ${e.token?`<code class="invite-code">${r(e.token)}</code>`:""}
      </div>
      <div>
        <button class="btn" type="button" data-action="copy-invite-code" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-key"></i>Copy code</button>
        <button class="btn" type="button" data-action="copy-invite-link" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-link"></i>Copy link</button>
        <button class="btn danger" type="button" data-action="revoke-invite" data-invite-id="${r(e.id)}" ${t?"":"disabled"}>Revoke</button>
      </div>
    </article>
  `}function Sa(e){const t=String(e.name||"").trim(),a=String(e.email||"").trim();if(t&&!Oa(t))return t;if(a&&!Oa(a))return a.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,i=>i.toUpperCase());const n=String(e.role||"").toLowerCase();return n==="owner"?"Workspace owner":n==="admin"?"Workspace admin":n==="developer"?"Developer":`${e.role_label||"Workspace"} user`}function Tr(e){const t=String(e.email||"").trim();if(t&&!Oa(t))return t;const a=String(e.profile_id||e.member_id||"").trim();return a?`ID ${tl(a)}`:"No email on profile"}function Nc(e){const t=wt(e),a=t.filter(n=>!n.supervisor_id||!t.some(i=>i.id===n.supervisor_id));return`
    <section class="tool-page team-chart-page">
      ${z("Team chart","Reporting lines, roles, and company coverage for this workspace.",`
        <a class="btn" href="${_(m("users",{},e))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${_(m("settings",{tab:"team"},e))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${A("Members",t.length)}
        ${A("Leads",a.length)}
        ${A("Open tasks",G(e).filter(hs).length)}
        ${A("Active timer",sa(e)?"Yes":"No")}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${a.map(n=>Or(e,n,t)).join("")||v("No workers assigned.")}
        </div>
      </section>
    </section>
  `}function Or(e,t,a,n=0){const i=a.filter(o=>o.supervisor_id===t.id);return`
    <article class="team-node" style="--depth:${n}">
      <div class="team-node-card">
        ${ee({full_name:t.full_name,avatar_url:t.avatar_url},"avatar")}
        <span><strong>${r(t.full_name)}</strong><small>${r(Ca(e,t.id))}</small></span>
        <b>${G(e).filter(o=>o.assignee_id===t.id&&hs(o)).length} open</b>
      </div>
      ${i.length?`<div class="team-node-children">${i.map(o=>Or(e,o,a,n+1)).join("")}</div>`:""}
    </article>
  `}function Uc(e,t){const a=on(t),n=["company","billing","roles","access","team"].includes(e.params.get("tab"))?e.params.get("tab"):"company";return`
    ${z("Settings","Company settings, roles, approvals, and admin controls.","")}
    ${as("Settings sections",[[m("settings",{tab:"company"},t),"Company",n==="company"],[m("settings",{tab:"billing"},t),"Billing",n==="billing"],[m("settings",{tab:"roles"},t),"Roles",n==="roles"],[m("settings",{tab:"access"},t),"Access",n==="access"],[m("settings",{tab:"team"},t),"Workers",n==="team"]])}
    <section class="dashboard-grid compact-settings-grid">
      ${n==="company"?`
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${Y([["Name",x(t)],["Company ID",t],["Color",a?.color||Oe(t)],["Visible jobs",V(t).length]])}
      </article>
      `:""}
      ${n==="billing"?Lc(t):""}
      ${n==="roles"?Bc(t):""}
      ${n==="access"?`
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${Y([["Auth switch","Enabled"],["Local login","Disabled"],["Isolation","Server-enforced when migration is applied"],["Active memberships",String(s.memberships.filter(i=>i.company_id===t&&i.status==="active").length)],["Disabled/left",String(s.memberships.filter(i=>i.company_id===t&&["disabled","left"].includes(i.status)).length)],["Invites",String(s.companyInvites.filter(i=>i.company_id===t&&i.status==="pending").length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${s.joinRequests.filter(i=>i.company_id===t).map(i=>nt(i.requested_email||i.profile_id,i.message||"Access request",O(i.status),i.created_at)).join("")||v("No pending company approvals.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access history</h2><p>Recent membership, invite, and role changes for this company.</p></div></div>
        <div class="access-audit-list">
          ${io(t).slice(0,8).map(Wm).join("")||v("No access audit events yet.")}
        </div>
      </article>
      `:""}
      ${n==="team"?`
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${wt(t).map(i=>`<div><strong>${r(i.full_name)}</strong><span>${r(Ca(t,i.id))}</span></div>`).join("")||v("No workers assigned.")}
        </div>
      </article>
      `:""}
    </section>
  `}function Lc(e){const t=ia(e),a=ln(e);return`
    <article class="panel">
      <div class="section-head">
        <div><h2>${a?"Workspace awaiting approval":"Subscription"}</h2><p>${a?"Quest needs to approve billing/access before live company data opens.":"$300/month company workspace billing gate."}</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout" ${a?"disabled":""}><i class="ti ti-credit-card"></i>${a?"Billing pending":"Start subscription"}</button>
      </div>
      ${Y([["Plan","$300/month company workspace"],["Status",dn(e)],["Stripe customer",t?.stripe_customer_id||"Not connected"],["Approval",a?"Waiting for Quest review":"Ready"],["Renewal / trial",t?.current_period_end||t?.trial_ends_at?P(t.current_period_end||t.trial_ends_at):"Pending"]])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules open only after approval or an active billing state.</p></div></div>
      ${Y([["Workspace access",te(e)?"Allowed":"Suspended"],["Finance/files privacy","Requires Auth + RLS"],["Seat billing","Tracked later; not charged in v1"]])}
    </article>
    ${Cs()?Qc(e):""}
  `}function Qc(e){const t=yp(),a=t.filter(n=>n.status==="pending_review").length;return`
    <article class="panel span-3">
      <div class="section-head">
        <div><h2>Quest approval console</h2><p>${a} workspace${a===1?"":"s"} waiting for manual activation.</p></div>
      </div>
      <div class="approval-console-list">
        ${t.map(n=>Vc(n,e)).join("")||v("No workspace reviews found.")}
      </div>
    </article>
  `}function Vc(e,t){const a=["active","trialing","past_due","grace"].includes(e.status),n=e.company_id===t;return`
    <article class="workspace-review-row ${e.status==="pending_review"?"pending":""}">
      <span>
        <strong>${r(e.company_name||x(e.company_id))}${n?" / current":""}</strong>
        <small>${r(e.company_id)} / ${r(e.owner_email||"No owner email")} / ${P(e.created_at)}</small>
      </span>
      <b class="status-pill ${a?"active":e.status==="pending_review"?"pending":"muted"}">${r(ja(e.status,e))}</b>
      <div class="workspace-review-actions">
        <button class="btn btn-primary" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="active" ${a?"disabled":""}>Approve</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="pending_review" ${e.status==="pending_review"?"disabled":""}>Pending</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="suspended" ${e.status==="suspended"?"disabled":""}>Suspend</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="canceled" ${e.status==="canceled"?"disabled":""}>Reject</button>
      </div>
    </article>
  `}function Bc(e){const t=be(e),a=rn(e);return`
    <article class="panel span-2">
      <div class="section-head">
        <div><h2>Custom roles</h2><p>Discord-style roles for module, action, record, and field permissions.</p></div>
        <button class="btn btn-primary" type="button" data-action="open-role-form"><i class="ti ti-plus"></i>New role</button>
      </div>
      <div class="roles-list">
        ${t.map(n=>{const i=s.rolePermissions.filter(d=>d.role_id===n.id&&d.effect==="allow").length,o=s.roleAssignments.filter(d=>d.company_id===e&&d.role_id===n.id).length,l=a?.id===n.id;return`
            <article class="role-row" style="--role-color:${r(n.color)}">
              <span></span>
              <div><strong>${r(n.name)}</strong><small>${i||"All"} permissions / ${o} users / priority ${n.priority}</small></div>
              <div class="role-row-actions">
                <b>${n.is_system?"System":"Custom"}</b>
                <button class="btn" type="button" data-action="view-as-role" data-role-id="${r(n.id)}" ${l?"disabled":""}>
                  <i class="ti ${l?"ti-eye-check":"ti-eye"}"></i>${l?"Viewing":"View as role"}
                </button>
              </div>
            </article>
          `}).join("")||v("No custom roles yet.")}
      </div>
    </article>
    <article class="panel">
      ${a?Yc(e,a):`
        <div class="section-head"><div><h2>Access preview</h2><p>Pick View as role to check sidebar, route, and action access.</p></div></div>
        ${v("No role preview selected.")}
      `}
    </article>
    <article class="panel span-3">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${s.fieldPermissions.filter(n=>n.company_id===e).map(n=>nt(n.field_key,n.resource_type,n.visibility,"")).join("")||v("No field permission overrides yet.")}
      </div>
    </article>
  `}function Yc(e,t){const a=ht.filter(o=>o.status==="live"),n=a.filter(o=>kn(t,o.permission||`${o.id}.view`)),i=a.filter(o=>!kn(t,o.permission||`${o.id}.view`));return`
    <div class="section-head">
      <div><h2>Access preview</h2><p>${r(t.name)} sees ${n.length} of ${a.length} live modules.</p></div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
    ${Y([["Preview role",t.name],["Allowed modules",n.map(o=>o.label).join(", ")||"None"],["Hidden modules",i.map(o=>o.label).join(", ")||"None"]])}
  `}function Hc(e){return E("Settings","New role",`
    <form class="role-form" data-role-form>
      ${w("Role name","name","")}
      ${w("Color","color","#f0b23b",!1,"color")}
      ${w("Priority","priority","100",!1,"number")}
      <div class="permission-grid span-2">
        ${Wi.map(([t,a])=>`
          <label><input type="checkbox" name="permissions" value="${r(t)}" /> <span>${r(a)}</span></label>
        `).join("")}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Wc(e){const t=be(e).filter(n=>n.name.toLowerCase()!=="owner"),a=[["","Member"]].concat(t.map(n=>[n.id,n.name]));return E("Users","Create invite code",`
    <form class="role-form" data-invite-form>
      <input type="hidden" name="company_id" value="${r(e)}" />
      ${w("Email","email","",!0,"email")}
      ${I("Role","role_id",zm(e),a)}
      <div class="form-message span-2">Quest creates an invite code you can copy now. Email invite delivery will use this same record after SMTP/Resend is configured.</div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create invite code</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function zc(e){const t=gf(e),a=Bt(e),n=s.formsTab==="builder"&&a?"builder":s.formsTab==="responses"?"responses":"library";return`
    <section class="tool-page forms-center">
      <div class="forms-command panel">
        <span class="sync-pill live"><i class="ti ti-device-floppy"></i>Local autosafe</span>
        <label>
          <span>Search</span>
          <input data-form-search value="${r(s.formQuery)}" placeholder="Find form, audience, or job" />
        </label>
        <button class="btn" type="button" data-action="open-forms-tools"><i class="ti ti-adjustments"></i>Tools</button>
        <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
      </div>
      ${n==="builder"?"":`
        <nav class="tabbar forms-tabs" aria-label="Forms workspace">
          ${["library","responses"].map(i=>`
            <button class="${n===i?"active":""}" type="button" data-action="set-forms-tab" data-tab="${r(i)}">${r(O(i))}</button>
          `).join("")}
        </nav>
      `}
      ${n==="library"?Jc(e,t,a):""}
      ${n==="builder"?Kc(e,a):""}
      ${n==="responses"?id(e,a):""}
    </section>
  `}function Jc(e,t,a){return`
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${t.length} visible form${t.length===1?"":"s"} in ${r(x(e))}</span>
          </div>
        </div>
        <div class="forms-list forms-list-cards">
          ${t.map(n=>`
            <article class="form-card ${s.expandedFormIds.has(n.id)?"expanded":""} ${a?.id===n.id?"active":""}">
              <span class="form-card-top">
                <i class="ti ti-clipboard-list"></i>
              </span>
              <span class="form-card-main">
                <strong>${r(n.title)}</strong>
                <span>Created by ${r(bf(n))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${r(n.id)}" aria-expanded="${s.expandedFormIds.has(n.id)?"true":"false"}">
                <i class="ti ${s.expandedFormIds.has(n.id)?"ti-chevron-up":"ti-chevron-down"}"></i>
                ${s.expandedFormIds.has(n.id)?"Less":"Details"}
              </button>
              <span class="form-card-meta">
                <small>${r(n.type)} / ${r(n.audience||"Internal")}</small>
                <small>${Yo(n)} questions</small>
                <em>${bn(n.id).length} responses</em>
                <em>Updated ${P(n.updated_at)}</em>
                <em>${r(n.status)}</em>
              </span>
              ${s.expandedFormIds.has(n.id)?`
                <div class="form-card-detail">
                  <p>${r(n.description||"No description yet.")}</p>
                  <div class="form-actions">
                    <button class="btn btn-primary" type="button" data-action="edit-form" data-form-id="${r(n.id)}"><i class="ti ti-pencil"></i>Open builder</button>
                    <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(n.id)}"><i class="ti ti-eye"></i>Preview</button>
                  </div>
                </div>
              `:""}
            </article>
          `).join("")||v("No forms match this company view.")}
        </div>
      </article>
    </section>
  `}function Kc(e,t){if(!t)return`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${v("Create a form or choose a template to open the builder.")}
      </section>
    `;const a=["questions","responses","settings"].includes(s.formEditorTab)?s.formEditorTab:"questions";return`
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${r(a)}">
      ${Gc(t,a)}
      ${a==="questions"?`
        ${Zc(e,t)}
        ${Xc(t)}
      `:""}
      ${a==="settings"?`
        <article class="panel form-settings-panel forms-settings-wide">
          ${ed(e,t)}
        </article>
      `:""}
      ${a==="responses"?td(e,t):""}
    </section>
  `}function Gc(e,t){const a=bn(e.id);return`
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${r(e.title)}</strong>
        <span>${r(e.status)} / ${Yo(e)} questions / ${a.length} responses</span>
      </div>
      ${["questions","responses","settings"].map(n=>`
        <button class="${t===n?"active":""}" type="button" data-action="set-form-editor-tab" data-tab="${r(n)}">
          ${n==="questions"?'<i class="ti ti-list-details"></i>':n==="responses"?'<i class="ti ti-inbox"></i>':'<i class="ti ti-settings"></i>'}
          ${r(O(n))}
        </button>
      `).join("")}
      <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(e.id)}"><i class="ti ti-eye"></i>Preview</button>
      <button class="btn" type="button" data-action="open-form-actions" data-form-id="${r(e.id)}"><i class="ti ti-share"></i>Share</button>
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(e.id)}">Save</button>
    </div>
  `}function Zc(e,t){return`
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${r(t.theme_color||Oe(e))}"></div>
      ${Mt("Form title","title",t.title,!0)}
      ${Ho("Form description","description",t.description)}
      <div class="forms-simple-meta">
        <span>${r(t.status)}</span>
        <span>${r(t.type)}</span>
        <span>${r(t.audience||"Internal")}</span>
        <span>${r(N(t.linked_job_id)?.name||"Company level")}</span>
        <span>${r(x(e))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(t.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      </div>
    </article>
  `}function Xc(e){return`
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${Gt.map(([t,a])=>`<button type="button" data-action="add-question" data-question-type="${r(t)}" title="${r(a)}" aria-label="Add ${r(a)} question"><i class="ti ${r(_f(t))}"></i></button>`).join("")}
        </div>
        <div class="question-list">
          ${e.questions.map((t,a)=>ad(t,a)).join("")||v("Add the first question.")}
        </div>
      </div>
    </article>
  `}function ed(e,t){return`
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${Mt("Title","title",t.title,!0)}
      ${_a("Status","status",t.status,Jn.map(a=>[a,a]))}
      ${Ho("Description","description",t.description)}
      ${_a("Type","type",t.type,Kt.map(a=>[a,a]))}
      ${Mt("Audience","audience",t.audience)}
      ${_a("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(V(e).map(a=>[a.id,a.name])))}
      ${Mt("Theme color","theme_color",t.theme_color||Oe(e),!1,"color")}
      ${_a("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
      ${Mt("Submit button","submit_label",t.submit_label||"Submit")}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(t.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${r(t.id)}">Delete</button>
    </div>
  `}function td(e,t){const a=bn(t.id),n=a[0]||null;return`
    <article class="panel response-list-panel forms-response-editor">
      <div class="section-head">
        <div><h2>Response inbox</h2><p>${a.length} captured response${a.length===1?"":"s"} for this form.</p></div>
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="questions"><i class="ti ti-list-details"></i>Questions</button>
      </div>
      <div class="response-list">
        ${a.map(i=>`
          <button type="button" class="response-card">
            <strong>${r(i.submitted_by||i.submitter_email||"Anonymous")}</strong>
            <span>${r(t.title)}</span>
            <small>${P(i.created_at)}</small>
          </button>
        `).join("")||v("No responses yet. Submit a preview response from the builder.")}
      </div>
    </article>
    <aside class="panel response-detail">
      ${n?Wo(n):v("No response selected.")}
    </aside>
  `}function ad(e,t){const a=Gt.map(([n,i])=>`<option value="${r(n)}" ${e.type===n?"selected":""}>${r(i)}</option>`).join("");return`
    <article class="question-card ${s.selectedQuestionId===e.id?"active":""}" data-question-id="${r(e.id)}">
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
      ${Yt(e)?`
        <div class="question-options">
          ${(e.options||[]).map((n,i)=>`
            <label>
              <span>Option ${i+1}</span>
              <input data-question-option="${i}" value="${r(n)}" />
              <button type="button" data-action="remove-question-option" data-question-id="${r(e.id)}" data-option-index="${i}"><i class="ti ti-x"></i></button>
            </label>
          `).join("")}
          <button class="btn" type="button" data-action="add-question-option" data-question-id="${r(e.id)}"><i class="ti ti-plus"></i>Add option</button>
        </div>
      `:""}
    </article>
  `}function nd(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${r(t.id)}" style="--form-accent:${r(t.theme_color||Oe(e))}">
      <div class="designed-form-header">
        <span>${r(x(e))}</span>
        <h2>${r(t.title)}</h2>
        <p>${r(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>sd(a)).join("")||v("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${r(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function sd(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?$e(e,`<textarea name="${r(t)}" rows="3" ${a}></textarea>`):e.type==="date"?$e(e,`<input name="${r(t)}" type="date" ${a} />`):e.type==="file"?$e(e,`<input name="${r(t)}" type="file" ${a} />`):e.type==="yesno"?$e(e,`<select name="${r(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?$e(e,`<input name="${r(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?$e(e,`<select name="${r(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(n=>`<option>${r(n)}</option>`).join("")}</select>`):e.type==="checkbox"?$e(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="checkbox" value="${r(n)}" /> ${r(n)}</label>`).join("")}</div>`):e.type==="multiple"?$e(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="radio" value="${r(n)}" ${a} /> ${r(n)}</label>`).join("")}</div>`):$e(e,`<input name="${r(t)}" ${a} />`)}function id(e,t){const a=t?bn(t.id):Bo(e),n=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(i=>`
            <button type="button" class="response-card">
              <strong>${r(xe(i.form_id)?.title||"Unknown form")}</strong>
              <span>${r(i.submitted_by||i.submitter_email||"Anonymous")}</span>
              <small>${P(i.created_at)}</small>
            </button>
          `).join("")||v("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${n?Wo(n):v("No response selected.")}
      </aside>
    </section>
  `}function Pr(e){return String(e||"?").trim().split(/\s+/).slice(0,2).map(t=>t[0]||"").join("").toUpperCase()||"?"}function rd(e){return`<span class="crm-pill ${{Customer:"tone-green",Prospect:"tone-blue",Partner:"tone-purple",Vendor:"tone-amber"}[e]||"tone-gray"}">${r(e||"Customer")}</span>`}function xr(e){const t={open:"tone-blue",won:"tone-green",lost:"tone-red"}[e]||"tone-gray",a={open:"Open",won:"Won",lost:"Lost"}[e]||e;return`<span class="crm-pill ${t}">${r(a)}</span>`}function od(e,t){const a=e.params.get("account_id");if(a){const n=Qe(a);if(n&&n.company_id===t)return cd(t,n)}return ld(t)}function ld(e){const t=Xm(e),a=aa(e),n=Dt(e).filter(i=>i.status==="open");return`
    ${z("Accounts","Organizations and customers - the hub for contacts, deals, and jobs.",`
      <button class="btn btn-primary" type="button" data-action="open-account-form" data-mode="new"><i class="ti ti-plus"></i>Add account</button>
    `)}
    <section class="metric-grid crm-metrics">
      ${A("Accounts",a.length)}
      ${A("Contacts",kt(e).length)}
      ${A("Open deals",n.length)}
      ${A("Open pipeline",C(X(n,"value")))}
    </section>
    <section class="pipe-toolbar">
      <label class="crm-search"><i class="ti ti-search"></i><input data-account-search value="${r(s.accountQuery)}" placeholder="Search accounts" /></label>
      <div class="pipe-chips" role="group" aria-label="Filter by type">
        <button class="pipe-chip ${s.accountTypeFilter==="all"?"on":""}" type="button" data-action="account-type" data-type="all">All<b>${a.length}</b></button>
        ${Wn.map(i=>`<button class="pipe-chip ${s.accountTypeFilter===i?"on":""}" type="button" data-action="account-type" data-type="${r(i)}">${r(i)}<b>${a.filter(o=>o.type===i).length}</b></button>`).join("")}
      </div>
    </section>
    <section class="panel">
      <div class="section-head"><div><h2>Accounts</h2><p>${t.length} visible</p></div></div>
      <div class="data-table accounts-table">
        <div class="table-head"><span>Account</span><span>Type</span><span>Owner</span><span>Contacts</span><span>Open deals</span><span>Pipeline</span></div>
        ${t.map(i=>{const o=co(i.id).filter(l=>l.status==="open");return`
          <button class="table-row" type="button" data-action="open-account" data-account-id="${r(i.id)}">
            <span class="cell-lead"><span class="account-avatar">${r(Pr(i.name))}</span><span><strong>${r(i.name)}</strong><small>${r(i.industry||i.email||"—")}</small></span></span>
            <span>${rd(i.type)}</span>
            <span>${r(i.owner_name||"Unassigned")}</span>
            <span>${uo(i.id).length}</span>
            <span>${o.length}</span>
            <span class="cell-mono">${C(X(o,"value"))}</span>
          </button>`}).join("")||v("No accounts yet. Add your first account to start the CRM.")}
      </div>
    </section>
  `}function cd(e,t){const a=["overview","contacts","deals","jobs","activity"].includes(s.accountTab)?s.accountTab:"overview",n=uo(t.id),i=co(t.id),o=tp(t.id),l=i.filter(c=>c.status==="open"),d=[["overview","Overview",""],["contacts","Contacts",n.length],["deals","Deals",i.length],["jobs","Jobs",o.length],["activity","Activity",mo(t.id).length]];return`
    ${z(t.name,`${t.type}${t.industry?" - "+t.industry:""}`,`
      <a class="btn" href="${_(m("crm",{},e))}" data-router><i class="ti ti-arrow-left"></i>Accounts</a>
      <button class="btn" type="button" data-action="open-activity-form" data-related-type="account" data-related-id="${r(t.id)}" data-account-id="${r(t.id)}"><i class="ti ti-note"></i>Log activity</button>
      <button class="btn" type="button" data-action="open-deal-form" data-mode="new" data-account-id="${r(t.id)}"><i class="ti ti-plus"></i>New deal</button>
      <button class="btn" type="button" data-action="open-account-form" data-mode="edit" data-account-id="${r(t.id)}"><i class="ti ti-pencil"></i>Edit</button>
    `)}
    <section class="metric-grid crm-metrics">
      ${A("Open deals",l.length)}
      ${A("Open pipeline",C(X(l,"value")))}
      ${A("Won",C(X(i.filter(c=>c.status==="won"),"value")))}
      ${A("Jobs",o.length)}
    </section>
    <nav class="tabbar" aria-label="Account sections">
      ${d.map(([c,f,g])=>`<button class="${c===a?"active":""}" type="button" data-action="set-account-tab" data-tab="${c}">${r(f)}${g!==""?` <b class="tab-count">${r(String(g))}</b>`:""}</button>`).join("")}
    </nav>
    ${dd(e,t,a,{contacts:n,deals:i,jobs:o})}
  `}function dd(e,t,a,n){return a==="contacts"?`<section class="panel">
      <div class="section-head"><div><h2>Contacts</h2><p>People at ${r(t.name)}</p></div><button class="btn" type="button" data-action="open-contact-form" data-mode="new" data-account-id="${r(t.id)}"><i class="ti ti-plus"></i>Add contact</button></div>
      <div class="data-table contacts-table">
        <div class="table-head"><span>Name</span><span>Title</span><span>Phone</span><span>Email</span><span>Owner</span><span></span></div>
        ${n.contacts.map(i=>`
          <button class="table-row" type="button" data-action="open-contact-form" data-mode="edit" data-contact-id="${r(i.id)}">
            <span class="cell-lead"><span class="account-avatar sm">${r(Pr(i.name))}</span><span><strong>${r(i.name)}</strong></span></span>
            <span>${r(i.title||"—")}</span>
            <span>${r(i.phone||"—")}</span>
            <span>${i.email?r(i.email):'<span class="muted-dash">—</span>'}</span>
            <span>${r(i.owner_name||"Unassigned")}</span>
            <span></span>
          </button>`).join("")||v("No contacts linked to this account yet.")}
      </div>
    </section>`:a==="deals"?`<section class="panel">
      <div class="section-head"><div><h2>Deals</h2><p>Opportunities for ${r(t.name)}</p></div><button class="btn" type="button" data-action="open-deal-form" data-mode="new" data-account-id="${r(t.id)}"><i class="ti ti-plus"></i>New deal</button></div>
      <div class="data-table deals-table">
        <div class="table-head"><span>Deal</span><span>Stage</span><span>Status</span><span>Value</span><span>Owner</span><span>Close</span></div>
        ${n.deals.map(i=>Rr(i)).join("")||v("No deals for this account yet.")}
      </div>
    </section>`:a==="jobs"?`<section class="panel">
      <div class="section-head"><div><h2>Jobs</h2><p>Production work for ${r(t.name)}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Type</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Value</span></div>
        ${n.jobs.map(i=>`
          <a class="table-row" href="${_(m("jobs",{tab:"profile",job_id:i.id},e))}" data-router>
            <span class="cell-lead">${he(Yn(i.stage))}<span><strong>${r(i.name)}</strong><small>${r(i.site_address||"No address")}</small></span></span>
            <span>${r(i.job_type||"—")}</span>
            <span>${Ga("jobs",i.stage)}</span>
            <span>${Es(i.priority)}</span>
            <span>${r(i.owner_name||"Unassigned")}</span>
            <span>${C(i.estimate_total)}</span>
          </a>`).join("")||v("No jobs linked to this account yet. Win a deal to create one.")}
      </div>
    </section>`:a==="activity"?`<section class="panel">
      <div class="section-head"><div><h2>Activity</h2></div><button class="btn" type="button" data-action="open-activity-form" data-related-type="account" data-related-id="${r(t.id)}" data-account-id="${r(t.id)}"><i class="ti ti-plus"></i>Log activity</button></div>
      ${wn("account",t.id)}
    </section>`:`
    <section class="crm-detail-grid">
      <article class="panel">
        <div class="section-head"><div><h2>Details</h2></div></div>
        ${Y([["Type",t.type],["Industry",t.industry||"—"],["Owner",t.owner_name||"Unassigned"],["Phone",t.phone||"—"],["Email",t.email||"—"],["Website",t.website||"—"],["Address",t.address||"—"],["Status",t.status]])}
        ${t.notes?`<p class="crm-notes">${r(t.notes)}</p>`:""}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Recent activity</h2></div><button class="btn" type="button" data-action="open-activity-form" data-related-type="account" data-related-id="${r(t.id)}" data-account-id="${r(t.id)}"><i class="ti ti-plus"></i>Log</button></div>
        ${wn("account",t.id,"",6)}
      </article>
    </section>
  `}function ud(e=u()){return Nt({id:"",company_id:e,name:"",type:"Customer"})}function ui(e,t){return E("Accounts",t?"Edit account":"New account",md(e,t),"wide-modal")}function md(e,t){const a=t||ud(e);return`
    <form class="job-editor" data-account-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2"><div><h2>${t?"Edit account":"New account"}</h2><p>Accounts group the contacts, deals, and jobs for one organization.</p></div></div>
      ${w("Account name","name",a.name,!0)}
      ${I("Company","company_id",e,Ct().map(n=>[n.id,Te(n)]))}
      ${I("Type","type",a.type,Wn.map(n=>[n,n]))}
      ${w("Industry","industry",a.industry)}
      ${w("Owner","owner_name",a.owner_name)}
      ${w("Phone","phone",a.phone)}
      ${w("Email","email",a.email,!1,"email")}
      ${w("Website","website",a.website)}
      ${I("Status","status",a.status,[["Active","Active"],["Inactive","Inactive"]])}
      ${w("Address","address",a.address,!1,"text","span-2")}
      ${de("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save account</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-account" data-account-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>`}function Rr(e){return`
    <button class="table-row ${e.id===s.selectedDealId?"active":""}" type="button" data-action="open-deal" data-deal-id="${r(e.id)}">
      <span class="cell-lead">${he(Zi(e.stage))}<span><strong>${r(e.name)}</strong><small>${r(bs(e.account_id)||"No account")}</small></span></span>
      <span>${Ga("deals",e.stage)}</span>
      <span>${xr(e.status)}</span>
      <span class="cell-mono">${C(e.value)}</span>
      <span>${r(e.owner_name||"Unassigned")}</span>
      <span>${e.close_date?P(e.close_date):'<span class="muted-dash">—</span>'}</span>
    </button>`}function pd(e){const t=Dt(e),a=t.filter(o=>o.status==="open"),n=a.reduce((o,l)=>o+l.value*(l.probability||0)/100,0),i=t.filter(o=>o.status==="won");return`
    <section class="metric-grid crm-metrics">
      ${A("Open deals",a.length)}
      ${A("Open value",C(X(a,"value")))}
      ${A("Weighted",C(Math.round(n)))}
      ${A("Won value",C(X(i,"value")))}
    </section>`}function fd(e,t){const a=e.params.get("deal_id");if(a){const i=na(a);if(i&&i.company_id===t)return vd(t,i)}const n=e.params.get("stage");return n&&(s.stageFilterDeals=$t().includes(n)?n:"all"),`
    ${z("Deals","Your sales pipeline - opportunities from prospect to won.",`
      <button class="btn" type="button" data-action="open-stage-manager" data-module="deals"><i class="ti ti-adjustments-horizontal"></i>Manage stages</button>
      <button class="btn btn-primary" type="button" data-action="open-deal-form" data-mode="new"><i class="ti ti-plus"></i>New deal</button>
    `)}
    ${pd(t)}
    <section class="pipe-toolbar deals-search-row">
      <label class="crm-search"><i class="ti ti-search"></i><input data-deal-search value="${r(s.dealQuery)}" placeholder="Search deals" /></label>
    </section>
    ${ns("deals",t)}
    ${s.dealBoardView==="board"?gd(t):_d(t)}
  `}function gd(e){const t=lo(e,!0),a=s.stageFilterDeals;return`
    <section class="pipe-board">
      ${(a==="all"?oi():oi().filter(i=>i.name===a)).map(i=>{const o=t.filter(l=>l.stage===i.name);return`
          <article class="pipe-lane">
            <header class="pipe-lane-head">${he(i.color)}<span>${r(i.name)}</span><b>${o.length}</b></header>
            <div class="pipe-lane-sub">${C(X(o,"value"))}</div>
            <div class="pipe-lane-body">
              ${o.map(l=>bd(l)).join("")||'<div class="lane-empty">No deals</div>'}
            </div>
          </article>`}).join("")}
    </section>`}function bd(e){return`
    <button class="pipe-card ${e.id===s.selectedDealId?"active":""}" type="button" data-action="open-deal" data-deal-id="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(bs(e.account_id)||"No account")}</span>
      <em>${C(e.value)}${e.probability?` · ${e.probability}%`:""}</em>
    </button>`}function _d(e){const t=lo(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Deals</h2><p>${t.length} visible</p></div></div>
      <div class="data-table deals-table">
        <div class="table-head"><span>Deal</span><span>Stage</span><span>Status</span><span>Value</span><span>Owner</span><span>Close</span></div>
        ${t.map(a=>Rr(a)).join("")||v("No deals match this view.")}
      </div>
    </section>`}function vd(e,t){const a=Qe(t.account_id),n=ct(t.primary_contact_id),i=t.job_id?N(t.job_id):null;return`
    ${z(t.name,`${C(t.value)} - ${t.stage}`,`
      <a class="btn" href="${_(m("deals",{},e))}" data-router><i class="ti ti-arrow-left"></i>Deals</a>
      <button class="btn" type="button" data-action="open-activity-form" data-related-type="deal" data-related-id="${r(t.id)}" data-account-id="${r(t.account_id)}"><i class="ti ti-note"></i>Log activity</button>
      ${t.status!=="won"?`<button class="btn btn-primary" type="button" data-action="convert-deal" data-deal-id="${r(t.id)}"><i class="ti ti-briefcase"></i>Mark won + create job</button>`:""}
      <button class="btn" type="button" data-action="open-deal-form" data-mode="edit" data-deal-id="${r(t.id)}"><i class="ti ti-pencil"></i>Edit</button>
    `)}
    <section class="crm-detail-grid">
      <article class="panel">
        <div class="section-head"><div><h2>Details</h2></div>${xr(t.status)}</div>
        ${Y([["Account",a?a.name:"No account"],["Primary contact",n?n.name:"None"],["Stage",t.stage],["Value",C(t.value)],["Probability",`${t.probability}%`],["Expected close",t.close_date?P(t.close_date):"—"],["Owner",t.owner_name||"Unassigned"],["Source",t.source||"—"],["Linked job",i?i.name:"—"]])}
        ${t.notes?`<p class="crm-notes">${r(t.notes)}</p>`:""}
        <div class="button-grid">
          ${a?`<button class="btn" type="button" data-action="open-account" data-account-id="${r(a.id)}"><i class="ti ti-building-community"></i>Open account</button>`:""}
          ${i?`<a class="btn" href="${_(m("jobs",{tab:"profile",job_id:i.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Activity</h2></div><button class="btn" type="button" data-action="open-activity-form" data-related-type="deal" data-related-id="${r(t.id)}" data-account-id="${r(t.account_id)}"><i class="ti ti-plus"></i>Log</button></div>
        ${wn("deal",t.id,t.account_id)}
      </article>
    </section>
  `}function yd(e=u()){const t=s.dealPrefill||{};return ft({id:"",company_id:e,name:"",stage:t.stage||$t()[0],account_id:t.account_id||"",primary_contact_id:t.primary_contact_id||""})}function mi(e,t){return E("Deals",t?"Edit deal":"New deal",hd(e,t),"wide-modal")}function hd(e,t){const a=t||yd(e),n=aa(e),i=kt(e);return`
    <form class="job-editor" data-deal-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2"><div><h2>${t?"Edit deal":"New deal"}</h2><p>An opportunity moving through your sales pipeline.</p></div></div>
      ${w("Deal name","name",a.name,!0)}
      ${I("Company","company_id",e,Ct().map(o=>[o.id,Te(o)]))}
      ${I("Account","account_id",a.account_id,[["","— None —"]].concat(n.map(o=>[o.id,o.name])))}
      ${I("Primary contact","primary_contact_id",a.primary_contact_id,[["","— None —"]].concat(i.map(o=>[o.id,o.name])))}
      ${I("Stage","stage",er(a.stage),$t().map(o=>[o,o]))}
      ${I("Status","status",a.status,[["open","Open"],["won","Won"],["lost","Lost"]])}
      ${w("Value","value",a.value||0,!1,"number")}
      ${w("Probability %","probability",a.probability||0,!1,"number")}
      ${w("Expected close","close_date",a.close_date,!1,"date")}
      ${w("Owner","owner_name",a.owner_name)}
      ${w("Source","source",a.source)}
      ${de("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save deal</button>
        ${t&&t.status!=="won"?`<button class="btn" type="button" data-action="convert-deal" data-deal-id="${r(t.id)}"><i class="ti ti-briefcase"></i>Win + create job</button>`:""}
        ${t?`<button class="btn danger" type="button" data-action="delete-deal" data-deal-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>`}function $d(e){return{note:"ti-note",call:"ti-phone",email:"ti-mail",meeting:"ti-calendar-event",task:"ti-checkbox",stage_change:"ti-arrow-right-circle",system:"ti-bolt"}[e]||"ti-point"}function wn(e,t,a="",n=0){let i=e==="account"?mo(t):ap(e,t);return n&&(i=i.slice(0,n)),i.length?`<ul class="activity-timeline">${i.map(o=>`
    <li class="activity-item">
      <span class="activity-ico activity-${r(o.type)}"><i class="ti ${$d(o.type)}"></i></span>
      <div class="activity-main">
        <div class="activity-top"><strong>${r(o.subject||O(o.type))}</strong><span class="activity-meta">${o.owner_name?r(o.owner_name)+" · ":""}${r(Ze(o.completed_at||o.created_at))}</span></div>
        ${o.body?`<p>${r(o.body)}</p>`:""}
      </div>
      <button class="activity-del" type="button" data-action="delete-activity" data-activity-id="${r(o.id)}" aria-label="Delete activity"><i class="ti ti-x"></i></button>
    </li>`).join("")}</ul>`:v("No activity yet. Log a note, call, or meeting.")}function wd(e){const t=s.activityPrefill||{};return E("Activity","Log activity",`
    <form class="job-editor" data-activity-form>
      <input type="hidden" name="related_type" value="${r(t.related_type||"")}" />
      <input type="hidden" name="related_id" value="${r(t.related_id||"")}" />
      <input type="hidden" name="account_id" value="${r(t.account_id||"")}" />
      <div class="section-head span-2"><div><h2>Log activity</h2><p>Capture a note, call, email, or meeting.</p></div></div>
      ${I("Type","type",t.type||"note",[["note","Note"],["call","Call"],["email","Email"],["meeting","Meeting"],["task","Task"]])}
      ${w("Subject","subject","",!1,"text","span-2")}
      ${de("Details","body","","span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save activity</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>`,"wide-modal")}function Sd(e,t){const a=fp(e,t);if(!a)return E("CRM","Customer account",v("This customer is not visible in the current company view."));const n=a.latestJob,i=a.tasks.filter(o=>o.status!=="done");return E("CRM",a.name,`
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${r(a.name)}</h2>
            <p>${r(a.subtitle)}</p>
          </div>
          ${Es(a.priority)}
        </div>
        ${Y([["Primary contact",a.primaryContact],["Owner",a.owner],["Current stage",a.stage],["Pipeline value",C(a.estimateTotal)],["Open tasks",String(i.length)],["Last updated",P(a.updatedAt)]])}
      </section>
      <section class="crm-rollup-grid">
        ${A("Jobs",a.jobs.length)}
        ${A("Files",a.fileCount)}
        ${A("Forms",a.formCount)}
        ${A("Tasks",a.tasks.length)}
      </section>
      <section class="crm-modal-actions">
        ${n?`<a class="btn btn-primary" href="${_(m("jobs",{tab:"profile",job_id:n.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
        ${n?`<a class="btn" href="${_(m("tasks",{job_id:n.id},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>`:""}
        ${n?`<a class="btn" href="${_(m("files",{job_id:n.id},e))}" data-router><i class="ti ti-folder"></i>Files</a>`:""}
        ${n?`<button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(n.id)}"><i class="ti ti-pencil"></i>Edit latest job</button>`:""}
        <button class="btn" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Linked jobs</h2><p>Customer workspaces connected to this account.</p></div></div>
        <div class="data-table crm-linked-jobs">
          <div class="table-head"><span>Job</span><span>Stage</span><span>Owner</span><span>Value</span></div>
          ${a.jobs.map(o=>`
            <a class="table-row" href="${_(m("jobs",{tab:"profile",job_id:o.id},e))}" data-router>
              <span><strong>${r(o.name)}</strong><small>${r(o.site_address||"No address")}</small></span>
              <span>${r(o.stage)}</span>
              <span>${r(o.owner_name||"Unassigned")}</span>
              <span>${C(o.estimate_total)}</span>
            </a>
          `).join("")||v("No linked jobs yet.")}
        </div>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Follow-ups</h2><p>Open tasks across linked jobs.</p></div></div>
        <div class="queue-list">
          ${i.slice(0,6).map(o=>Is(o)).join("")||v("No open follow-ups for this customer.")}
        </div>
      </section>
    </div>
  `,"crm-modal")}function kd(e,t){const a=Ye(t),n=Gr(t);n&&s.selectedConversationId!==n.id&&(s.selectedConversationId=n.id);const i=!!(n&&e.params.get("conversation")),o=Td(t,a);return Jp(t,n?.id||""),n&&pn(n.id,!1),`
    <section class="tool-page messages-page ${i?"thread-open":""}">
      ${z("Messages","Company chats, role rooms, direct messages, and file sharing.",`
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      `)}
      <section class="message-kpi-row" aria-label="Message inbox summary">
        ${Ft("ti-message-circle","Unread",o.unread,o.unreadDelta)}
        ${Ft("ti-at","Mentions",o.mentions,o.mentionsDelta)}
        ${Ft("ti-paperclip","Files shared",o.files,o.filesDelta)}
        ${Ft("ti-clock","Waiting on you",o.waiting,o.waitingDelta)}
        ${Ft("ti-users-group","Group chats",o.groups,"Active conversations")}
      </section>
      <section class="messages-shell">
        <aside class="messages-list-panel panel">
          <div class="messages-tools">
            <div class="message-list-top">
              <label class="message-search-field">
                <i class="ti ti-search"></i>
                <input data-message-search value="${r(s.messageQuery)}" placeholder="Find chats or messages" />
              </label>
              <button class="btn btn-compact" type="button" data-action="message-search-results"><i class="ti ti-adjustments-horizontal"></i>Filter</button>
            </div>
            <div class="segmented message-filter" role="group" aria-label="Message filters">
              ${["all","unread","company","role","custom","direct"].map(l=>`
                <button type="button" data-action="set-message-filter" data-filter="${r(l)}" class="${s.messageFilter===l?"active":""}">${r(l==="all"?"All":O(l))}</button>
              `).join("")}
            </div>
          </div>
          <div class="conversation-list">
            ${a.map(l=>Dd(l,t,n?.id===l.id)).join("")||v("No conversations match this view.")}
          </div>
        </aside>
        ${n?jd(t,n):""}
      </section>
      ${s.session?.auth==="local-basic"?xd():""}
    </section>
  `}function Dd(e,t,a){const n=Ee(e.id).at(-1),i=lt(e.id),o=n?xs(n.sender_profile_id):null,l=tn(e.id).length,d=Od(e,t);return`
    <a class="conversation-row ${a?"active":""}" href="${_(m("messages",{conversation:e.id},t))}" data-router>
      <span class="conversation-unread-dot ${i?"active":""}"></span>
      ${ee(o||{full_name:e.title},"avatar conversation-avatar")}
      <span class="message-workspace-chip">${r(d)}</span>
      <span class="conversation-copy">
        <strong>${r(e.title)}</strong>
        <small>${r(Pd(n,e))}</small>
      </span>
      <span class="conversation-meta">
        <em>${n?Ze(n.created_at):""}</em>
        ${l?`<small><i class="ti ti-paperclip"></i>${l}</small>`:""}
      </span>
      ${i?`<b>${i}</b>`:""}
    </a>
  `}function Cd(e,t){const a=Ee(t.id),n=$("messages.send",e);return`
    <div class="thread-head">
      <a class="btn mobile-thread-back" href="${_(m("messages",{},e))}" data-router><i class="ti ti-arrow-left"></i>Chats</a>
      <div class="thread-title">
        <span>${B(Wp(t.type))}</span>
        <div>
          <h2>${r(t.title)}</h2>
          <p>${r(Rs(t))}</p>
        </div>
      </div>
      <div class="thread-actions">
        <button class="btn" type="button" data-action="message-search-results"><i class="ti ti-search"></i>Search</button>
        <button class="btn" type="button" data-action="message-details" data-conversation-id="${r(t.id)}"><i class="ti ti-info-circle"></i>Details</button>
        <button class="btn" type="button" data-action="manage-message-chat" data-conversation-id="${r(t.id)}" ${$("messages.manage_groups",e)||$("messages.manage",e)?"":"disabled"}><i class="ti ti-users"></i>Access</button>
      </div>
    </div>
    <div class="message-stream">
      ${a.map(i=>Md(i)).join("")||v("No messages yet. Start the thread with a short update.")}
    </div>
    ${n?Ed(t):v("Your role can view this chat but cannot send messages.")}
  `}function jd(e,t){return`
    <aside class="message-context-rail messages-thread-panel">
      <section class="message-preview-card panel">
        ${Cd(e,t)}
      </section>
      ${Ad(e,t)}
      ${qd(t)}
      ${Fd(e)}
    </aside>
  `}function Ad(e,t){const a=fa(t).slice(0,6);return`
    <section class="message-side-card panel">
      <div class="message-side-head">
        <div><h3>Chat access</h3><p>Members (${fa(t).length||"company"})</p></div>
        <button class="link-button" type="button" data-action="manage-message-chat" data-conversation-id="${r(t.id)}" ${$("messages.manage_groups",e)||$("messages.manage",e)?"":"disabled"}>Manage</button>
      </div>
      <div class="message-member-stack">
        ${a.map(n=>ee(n,"avatar mini-avatar")).join("")}
        ${fa(t).length>a.length?`<span class="member-more">+${fa(t).length-a.length}</span>`:""}
      </div>
    </section>
  `}function qd(e){const t=tn(e.id).slice(-4).reverse();return`
    <section class="message-side-card panel">
      <div class="message-side-head">
        <div><h3>Shared files</h3><p>${t.length?`${t.length} recent`:"No files yet"}</p></div>
        <button class="link-button" type="button" data-action="message-details" data-conversation-id="${r(e.id)}">View all</button>
      </div>
      <div class="shared-file-list">
        ${t.map(a=>`
          <button class="shared-file-row" type="button" data-action="open-message-attachment" data-attachment-id="${r(a.id)}">
            <span><i class="ti ${r(a.mime_type.startsWith("image/")?"ti-photo":"ti-file-text")}"></i></span>
            <strong>${r(a.file_name)}</strong>
            <small>${r(Po(a.size_bytes))}</small>
          </button>
        `).join("")||v("No shared files yet.")}
      </div>
    </section>
  `}function Fd(e,t){const a=G(e).filter(n=>["todo","pending","review","hold"].includes(n.status)).slice(0,3);return`
    <section class="message-side-card panel">
      <div class="message-side-head">
        <div><h3>Action items</h3><p>From this conversation</p></div>
        <a class="link-button" href="${_(m("tasks",{},e))}" data-router>View all</a>
      </div>
      <div class="message-action-list">
        ${a.map(n=>`
          <a class="message-action-row" href="${_(m("tasks",{task_id:n.id},e))}" data-router>
            <span></span>
            <strong>${r(n.title)}</strong>
            <small>${r(Je(n.assignee_id))||"Unassigned"} · ${r(P(n.due))}</small>
          </a>
        `).join("")||v("No action items linked yet.")}
      </div>
    </section>
  `}function Md(e){const t=e.sender_profile_id===b().profile.id,a=xs(e.sender_profile_id),n=Zr(e.id);return`
    <article class="message-bubble ${t?"own":""}">
      ${ee(a,"avatar message-avatar")}
      <div class="message-card">
        <div class="message-meta">
          <strong>${r(a.full_name||a.email||Je(e.sender_profile_id))}</strong>
          <span>${Ze(e.created_at)}</span>
          ${t&&$("messages.delete_own",e.company_id)||$("messages.delete_any",e.company_id)?`<button type="button" data-action="delete-message" data-message-id="${r(e.id)}"><i class="ti ti-trash"></i></button>`:""}
        </div>
        ${e.body?`<p>${zp(e.body)}</p>`:""}
        ${n.length?`<div class="message-attachments">${n.map(Id).join("")}</div>`:""}
      </div>
    </article>
  `}function Id(e){const t=e.mime_type.startsWith("image/");return`
    <button class="message-attachment" type="button" data-action="open-message-attachment" data-attachment-id="${r(e.id)}">
      ${e.preview_url&&t?`<img src="${r(e.preview_url)}" alt="" />`:B(t?"q-message-image":"q-message-file")}
      <span><strong>${r(e.file_name)}</strong><small>${r(Po(e.size_bytes))}</small></span>
    </button>
  `}function Ed(e){return`
    <form class="message-composer" data-message-form data-conversation-id="${r(e.id)}">
      <input name="body" placeholder="Message ${r(e.title)}" autocomplete="off" />
      <label class="icon-button message-attach-button" title="Attach file">
        <i class="ti ti-paperclip"></i>
        <input name="attachments" type="file" multiple ${$("messages.attach_files",e.company_id)?"":"disabled"} />
      </label>
      <button class="btn btn-primary" type="submit"><i class="ti ti-send"></i>Send</button>
    </form>
  `}function Ft(e,t,a,n){return`
    <article class="message-kpi-card">
      <span><i class="ti ${r(e)}"></i>${r(t)}</span>
      <strong>${r(String(a))}</strong>
      <small>${r(n)}</small>
    </article>
  `}function Td(e,t){const a=t.flatMap(c=>Ee(c.id)),n=t.reduce((c,f)=>c+lt(f.id),0),i=a.filter(c=>c.body.includes(`@${b().profile.full_name?.split(/\s+/)[0]||""}`)).length,o=t.reduce((c,f)=>c+tn(f.id).length,0),l=G(e).filter(c=>["todo","pending","review","hold"].includes(c.status)).length,d=t.filter(c=>c.type!=="direct").length;return{unread:n,mentions:i,files:o,waiting:l,groups:d,unreadDelta:n?"+2 since yesterday":"All caught up",mentionsDelta:i?"+1 since yesterday":"No new mentions",filesDelta:o?"+2 since yesterday":"No files shared",waitingDelta:l?`${l} active items`:"Nothing waiting"}}function Od(e,t){const a=x(e.company_id||t);return String(a||"QH").split(/\s+/).map(n=>n[0]).join("").slice(0,2).toUpperCase()||"QH"}function Pd(e,t){if(!e)return Rs(t)||"No messages yet";const a=Je(e.sender_profile_id);return`${a?`${a}: `:""}${e.body||(Zr(e.id).length?"Shared an attachment":"Sent a message")}`}function fa(e){return Vt(e).map(a=>xs(a))}function xd(e){return`
    <div class="message-scenario">
      <button class="btn btn-primary" type="button" data-action="run-message-scenario"><i class="ti ti-sparkles"></i>Demo scenario</button>
      <button class="btn" type="button" data-action="reset-message-demo"><i class="ti ti-refresh"></i>Reset</button>
    </div>
  `}function Rd(e){const t=ie(e);return E("Messages","New group chat",`
    <form class="message-modal-form" data-message-group-form>
      ${w("Chat name","title","",!0)}
      ${I("Type","type","custom",[["company","Company-wide"],["role","Role-based"],["custom","Custom group"]])}
      ${Nr(e,[])}
      ${Ur(t,[])}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create group</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function Nd(e){const t=ie(e).filter(a=>(a.profile_id||a.member_id)!==b().profile.id);return E("Messages","New direct message",`
    <form class="message-modal-form" data-direct-message-form>
      ${I("Person","profile_id",t[0]?.profile_id||t[0]?.member_id||"",t.map(a=>[a.profile_id||a.member_id,a.name]))}
      <label><span>First message</span><textarea name="body" rows="3" placeholder="Start with a short note"></textarea></label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Start chat</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function Ud(e,t){const a=s.messageConversations.find(l=>l.id===t);if(!a)return E("Messages","Chat access",v("Conversation not found."));const n=an(a.id),i=n.filter(l=>l.target_type==="role").map(l=>l.target_id),o=n.filter(l=>l.target_type==="profile").map(l=>l.target_id);return E("Messages","Chat access",`
    <form class="message-modal-form" data-message-access-form data-conversation-id="${r(a.id)}">
      ${w("Chat name","title",a.title,!0)}
      ${I("Type","type",a.type,[["company","Company-wide"],["role","Role-based"],["custom","Custom group"],["direct","Direct message"]])}
      ${Nr(e,i)}
      ${Ur(ie(e),o)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save access</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function Nr(e,t=[]){const a=new Set(t);return`
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>Roles</strong>
        <small>Good for large crews. Access updates when role assignments change.</small>
      </div>
      <div class="message-role-grid">
        ${be(e).map(n=>`
          <label class="message-role-option" style="--role-color:${r(n.color)}">
            <input type="checkbox" name="role_ids" value="${r(n.id)}" ${a.has(n.id)?"checked":""} />
            <span></span>
            <strong>${r(n.name)}</strong>
          </label>
        `).join("")}
      </div>
    </section>
  `}function Ur(e,t=[]){const a=new Set(t),n=e.slice().sort((i,o)=>Xe(i).localeCompare(Xe(o)));return`
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>People</strong>
        <small>${n.length} member${n.length===1?"":"s"} available. Search instead of scrolling huge teams.</small>
      </div>
      <label class="message-member-search">
        <span>Find person</span>
        <input data-message-access-filter placeholder="Search name, email, or role" />
      </label>
      <div class="message-picker-count" data-message-filter-count>${n.length} member${n.length===1?"":"s"}</div>
      <div class="message-selected-strip">
        ${n.filter(i=>a.has(i.profile_id||i.member_id)).slice(0,8).map(i=>`
          <span>${ee(qi(i),"avatar tiny-avatar")} ${r(Xe(i))}</span>
        `).join("")||"<small>No individual people selected.</small>"}
      </div>
      <div class="message-people-list">
        ${n.map(i=>{const o=i.profile_id||i.member_id;return`
            <label class="message-person-row" data-message-person-row data-filter-text="${r([Xe(i),i.email,i.role_label,i.role].join(" ").toLowerCase())}">
              <input type="checkbox" name="profile_ids" value="${r(o)}" ${a.has(o)?"checked":""} />
              ${ee(qi(i),"avatar message-person-avatar")}
              <span>
                <strong>${r(Xe(i))}</strong>
                <small>${r(Yp(i))}</small>
              </span>
            </label>
          `}).join("")||v("No people available in this company yet.")}
      </div>
    </section>
  `}function Ld(e,t){const a=s.messageConversations.find(n=>n.id===t);return a?E("Messages",a.title,`
    ${Y([["Type",O(a.type)],["Access",Rs(a)],["Messages",String(Ee(a.id).length)],["Attachments",String(tn(a.id).length)],["Last message",P(a.last_message_at)]])}
  `,"message-modal"):E("Messages","Chat details",v("Conversation not found."))}function Qd(e){const t=s.messageQuery.trim().toLowerCase(),a=Ye(e).flatMap(n=>Ee(n.id).filter(i=>!t||i.body.toLowerCase().includes(t)).map(i=>({conversation:n,message:i})));return E("Messages","Search results",`
    <div class="queue-list">
      ${a.slice(0,30).map(({conversation:n,message:i})=>`
        <a class="queue-row" href="${_(m("messages",{conversation:n.id},e))}" data-router>
          <span><strong>${r(n.title)}</strong><small>${r(i.body||"Attachment")}</small></span>
          <em>${Ze(i.created_at)}</em>
        </a>
      `).join("")||v("No matching messages. Type in the Messages search box first.")}
    </div>
  `,"message-modal")}function Vd(e,t){const a=jo(t),n=De(t),i=So(t).slice().sort(Ht("received_at")).slice(0,5),o=$s(t).slice().sort(Ht("spent_at")).slice(0,5),l=ws(t).slice().sort((c,f)=>c.name.localeCompare(f.name)).slice(0,5),d=$("finance.manage",t);return`
    <section class="tool-page finance-page">
      ${z("Finance","Invoices, payments, expenses, vendors, and job-linked money in one company view.",`
        ${d?`
          <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
          <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
          <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
          <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        `:""}
        <a class="btn" href="${_(m("finance",{report:"summary"},t))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
      `)}
      <section class="metric-grid finance-metrics">
        ${A("Estimated pipeline",C(a.pipeline))}
        ${A("Invoiced",C(a.invoiced))}
        ${A("Collected",C(a.collected))}
        ${A("Outstanding",C(a.outstanding))}
        ${A("Expenses",C(a.expenses))}
        ${A("Net position",C(a.net))}
      </section>
      <section class="panel finance-aging">
        <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
        <div class="finance-aging-grid">
          ${[["Current",a.aging.current],["1-30",a.aging.thirty],["31-60",a.aging.sixty],["61+",a.aging.overSixty]].map(([c,f])=>`<div><span>${r(c)}</span><strong>${C(f)}</strong></div>`).join("")}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${n.length} billing record${n.length===1?"":"s"} for ${r(x(t))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${n.map(c=>`
            <a class="table-row" href="${_(m("finance",{invoice:c.id},t))}" data-router>
              <span><strong>${r(c.invoice_number)}</strong><small>${r(c.client_name||N(c.job_id)?.client_name||"No client")}</small></span>
              <span>${Qp(Co(c))}</span>
              <span>${r(N(c.job_id)?.name||"Company level")}</span>
              <span>${P(c.due_date)}</span>
              <span>${C(c.total)}</span>
              <span>${C(ks(c.id))}</span>
              <span>${C(ve(c.id))}</span>
            </a>
          `).join("")||v("No invoices yet. Create one from a job or customer record.")}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${i.map(c=>nt(We(c.invoice_id)?.invoice_number||"Payment",c.method,C(c.amount),c.received_at)).join("")||v("No payments recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${o.map(c=>nt(jn(c.vendor_id),c.category,C(c.amount),c.spent_at,m("finance",{expense:c.id},t))).join("")||v("No expenses recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${l.map(c=>nt(c.name,c.category,c.status,c.updated_at,m("finance",{vendor:c.id},t))).join("")||v("No vendors recorded.")}
          </div>
        </article>
      </section>
      ${d?"":'<p class="small-note">Your role can view finance records. Creating or editing invoices, payments, expenses, and vendors requires finance manage permission.</p>'}
    </section>
  `}function Bd(e,t){return e.params.get("invoice")?Yd(t,e.params.get("invoice")):e.params.get("expense")?Hd(t,e.params.get("expense")):e.params.get("vendor")?Wd(t,e.params.get("vendor")):e.params.get("report")==="summary"?zd(t):""}function Yd(e,t){const a=We(t);if(!a||a.company_id!==e)return E("Finance","Invoice",v("Invoice not found."));const n=Do(a.id),i=N(a.job_id);return E("Finance",a.invoice_number,`
    <div class="finance-detail-modal">
      ${Y([["Client",a.client_name||i?.client_name||"No client"],["Status",Co(a)],["Job",i?.name||"Company level"],["Issued",P(a.issue_date)],["Due",P(a.due_date)],["Total",C(a.total)],["Collected",C(ks(a.id))],["Balance",C(ve(a.id))]])}
      <div class="finance-modal-actions">
        ${$("finance.manage",e)?`
          <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${r(a.id)}"><i class="ti ti-cash"></i>Record payment</button>
          <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        `:""}
        ${i?`<a class="btn" href="${_(m("jobs",{tab:"profile",job_id:i.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${n.length} payment${n.length===1?"":"s"} applied.</p></div></div>
        <div class="finance-compact-list">
          ${n.map(o=>nt(o.reference||o.method,o.method,C(o.amount),o.received_at)).join("")||v("No payments yet.")}
        </div>
      </section>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Hd(e,t){const a=ko(t);if(!a||a.company_id!==e)return E("Finance","Expense",v("Expense not found."));const n=N(a.job_id);return E("Finance",`${jn(a.vendor_id)} expense`,`
    <div class="finance-detail-modal">
      ${Y([["Vendor",jn(a.vendor_id)],["Category",a.category],["Status",a.status],["Job",n?.name||"Company level"],["Spent",P(a.spent_at)],["Amount",C(a.amount)]])}
      <div class="finance-modal-actions">
        ${$("finance.manage",e)?`<button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit expense</button>`:""}
        ${n?`<a class="btn" href="${_(m("files",{job_id:n.id},e))}" data-router><i class="ti ti-folder"></i>Job files</a>`:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Wd(e,t){const a=Ss(t);if(!a||a.company_id!==e)return E("Finance","Vendor",v("Vendor not found."));const n=$s(e).filter(i=>i.vendor_id===a.id);return E("Finance",a.name,`
    <div class="finance-detail-modal">
      ${Y([["Contact",a.contact_name||"No contact"],["Email",a.email||"No email"],["Phone",a.phone||"No phone"],["Category",a.category],["Status",a.status],["Spend",C(X(n,"amount"))]])}
      <div class="finance-modal-actions">
        ${$("finance.manage",e)?`
          <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
          <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${r(a.id)}"><i class="ti ti-receipt"></i>Add expense</button>
        `:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function zd(e){const t=jo(e);return E("Finance","Summary report",`
    <div class="finance-report-modal">
      ${Y([["Company",x(e)],["Estimated pipeline",C(t.pipeline)],["Invoiced",C(t.invoiced)],["Collected",C(t.collected)],["Outstanding",C(t.outstanding)],["Expenses",C(t.expenses)],["Net position",C(t.net)]])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${C(t.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${C(t.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${C(t.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${C(t.aging.overSixty)}</strong></div>
      </div>
    </div>
  `,"finance-modal")}function pi(e,t=null){const a=t||Mp(e);return E("Finance",t?"Edit invoice":"New invoice",`
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${w("Invoice number","invoice_number",a.invoice_number,!0)}
      ${I("Linked job","job_id",a.job_id||"",[["","Company level"]].concat(V(e).map(n=>[n.id,n.name])))}
      ${w("Client","client_name",a.client_name,!0)}
      ${I("Status","status",a.status,rr.map(n=>[n,n]))}
      ${w("Issue date","issue_date",a.issue_date,!1,"date")}
      ${w("Due date","due_date",a.due_date,!1,"date")}
      ${w("Subtotal","subtotal",a.subtotal,!1,"number")}
      ${w("Tax","tax",a.tax,!1,"number")}
      ${de("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Jd(e,t=""){const a=Ip(e,t),n=De(e).map(i=>[i.id,`${i.invoice_number} - ${i.client_name||N(i.job_id)?.client_name||"No client"}`]);return E("Finance","Record payment",`
    <form class="finance-form" data-finance-payment-form>
      ${I("Invoice","invoice_id",a.invoice_id,n.length?n:[["","Create an invoice first"]])}
      ${w("Amount","amount",a.amount,!0,"number")}
      ${I("Method","method",a.method,cr.map(i=>[i,i]))}
      ${w("Received","received_at",a.received_at,!1,"date")}
      ${w("Reference","reference",a.reference)}
      ${de("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function fi(e,t=null,a=""){const n=t||Ep(e,a),i=ws(e).map(o=>[o.id,o.name]);return E("Finance",t?"Edit expense":"Add expense",`
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${r(n.id)}" />
      ${I("Vendor","vendor_id",n.vendor_id,i.length?i:[["","No vendor yet"]])}
      ${I("Linked job","job_id",n.job_id||"",[["","Company level"]].concat(V(e).map(o=>[o.id,o.name])))}
      ${I("Category","category",n.category,Ja.map(o=>[o,o]))}
      ${I("Status","status",n.status,or.map(o=>[o,o]))}
      ${w("Amount","amount",n.amount,!0,"number")}
      ${w("Spent date","spent_at",n.spent_at,!1,"date")}
      ${de("Notes","notes",n.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function gi(e,t=null){const a=t||Tp(e);return E("Finance",t?"Edit vendor":"Add vendor",`
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${w("Vendor name","name",a.name,!0)}
      ${w("Contact","contact_name",a.contact_name)}
      ${w("Email","email",a.email,!1,"email")}
      ${w("Phone","phone",a.phone)}
      ${I("Category","category",a.category,Ja.map(n=>[n,n]))}
      ${I("Status","status",a.status,lr.map(n=>[n,n]))}
      ${de("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Kd(e,t){return e.section==="clock"?au(t):e.section==="calendar"?Gd(e,t):e.section==="approvals"?nu(t):tu(t)}function Za(e,t){return`
    ${as("Operations sections",[[m("time",{},e),"My time",t==="time"],[m("calendar",{},e),"Calendar",t==="calendar"],[m("approvals",{},e),"Approvals",t==="approvals"],[m("clock",{},e),"Clock dashboard",t==="clock"]])}
  `}function Gd(e,t){const a=qm(t),n=nn(t),i=a.filter(c=>c.dateKey===j(0)),o=n.filter(c=>c.mine),l=n.filter(c=>c.source!=="manual").length,d=$("calendar.manage",t);return`
    <section class="tool-page operations-page calendar-page">
      ${z("Calendar","Company schedule built from tasks, approvals, finance due dates, time context, and manual events.",`
        <button class="btn btn-primary" type="button" data-action="open-calendar-event-form"><i class="ti ti-calendar-plus"></i>New event</button>
      `)}
      ${Za(t,"calendar")}
      <section class="metric-grid operations-metrics calendar-metrics">
        ${A("Today",i.length)}
        ${A("This week",Nm(a).length)}
        ${A("Mine",o.length)}
        ${A("From modules",l)}
      </section>
      <section class="workspace-toolbar calendar-toolbar">
        <div class="segmented" role="group" aria-label="Calendar scope">
          <button class="${s.calendarScope==="company"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="company"><i class="ti ti-building"></i>Company</button>
          <button class="${s.calendarScope==="me"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="me"><i class="ti ti-user"></i>Me</button>
        </div>
        <div class="segmented" role="group" aria-label="Calendar view">
          ${["month","week","list"].map(c=>`<button class="${s.calendarView===c?"active":""}" type="button" data-action="set-calendar-view" data-view="${r(c)}">${r(O(c))}</button>`).join("")}
        </div>
        <label class="wide-control">
          <span>Search</span>
          <input data-calendar-search value="${r(s.calendarQuery)}" placeholder="Find events, jobs, tasks, or people" />
        </label>
        <label>
          <span>Type</span>
          <select data-calendar-type-filter>
            <option value="all">All types</option>
            ${dl.map(c=>`<option value="${r(c)}" ${s.calendarTypeFilter===c?"selected":""}>${r(c)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="calendar-nav">
        <div>
          <button class="btn" type="button" data-action="calendar-prev"><i class="ti ti-chevron-left"></i></button>
          <button class="btn" type="button" data-action="calendar-today">Today</button>
          <button class="btn" type="button" data-action="calendar-next"><i class="ti ti-chevron-right"></i></button>
        </div>
        <strong>${r(Qm())}</strong>
      </section>
      <section class="calendar-shell">
        <article class="panel calendar-main">
          ${s.calendarView==="month"?Zd(t,a):""}
          ${s.calendarView==="week"?Xd(t,a):""}
          ${s.calendarView==="list"?eu(t,a):""}
        </article>
        <aside class="panel calendar-agenda">
          <div class="section-head"><div><h2>Agenda</h2><p>Next events that match this view.</p></div></div>
          <div class="calendar-agenda-list">
            ${a.slice(0,9).map(Qr).join("")||v("No calendar items match this view.")}
          </div>
        </aside>
      </section>
      ${d?"":'<p class="small-note">Your role can view the calendar. Manual company events require calendar manage permission.</p>'}
    </section>
  `}function Zd(e,t){const a=Lm(s.calendarCursorDate),n=new Date(`${s.calendarCursorDate}T00:00:00`).getMonth();return`
    <div class="calendar-grid calendar-month-grid">
      ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(i=>`<div class="calendar-weekday">${i}</div>`).join("")}
      ${a.map(i=>{const o=ao(t,i.key);return`
          <div class="calendar-day ${i.month===n?"":"muted"} ${i.key===j(0)?"today":""}">
            <div class="calendar-day-head"><b>${i.label}</b><span>${o.length||""}</span></div>
            ${o.slice(0,3).map(Lr).join("")}
            ${o.length>3?`<small class="calendar-more">+${o.length-3} more</small>`:""}
          </div>
        `}).join("")}
    </div>
  `}function Xd(e,t){return`
    <div class="calendar-grid calendar-week-grid">
      ${no(s.calendarCursorDate).map(n=>{const i=ao(t,n.key);return`
          <div class="calendar-day ${n.key===j(0)?"today":""}">
            <div class="calendar-day-head"><b>${r(n.name)}</b><span>${r(n.shortDate)}</span></div>
            ${i.map(Lr).join("")||'<small class="calendar-empty-day">Open</small>'}
          </div>
        `}).join("")}
    </div>
  `}function eu(e,t){const a=Vm(t);return`
    <div class="calendar-list">
      ${Object.entries(a).slice(0,18).map(([i,o])=>`
        <section class="calendar-list-day">
          <h3>${r(P(i))}</h3>
          ${o.map(Qr).join("")}
        </section>
      `).join("")||v("No scheduled work or events.")}
    </div>
  `}function Lr(e){return`
    <button class="calendar-pill ${r(Bm(e.type))}" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <span>${r(so(e))}</span>
      <strong>${r(e.title)}</strong>
    </button>
  `}function Qr(e){return`
    <button class="calendar-agenda-item" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <i class="ti ${r(Ym(e.type))}"></i>
      <span><strong>${r(e.title)}</strong><small>${r(`${P(e.dateKey)} · ${so(e)} · ${e.type}`)}</small></span>
    </button>
  `}function tu(e){const t=ho(e),a=sa(e);return`
    <section class="tool-page operations-page">
      ${z("My time","A compact personal work queue built from this company's tasks.",`
        <a class="btn" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Za(e,"time")}
      <section class="metric-grid operations-metrics">
        ${A("Due today",t.dueToday.length)}
        ${A("Overdue",t.overdue.length)}
        ${A("Open work",t.open.length)}
        ${A("In review",t.review.length)}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel span-2">
          <div class="section-head"><div><h2>Today</h2><p>Due now, overdue, and highest priority work.</p></div></div>
          <div class="queue-list">
            ${t.focus.slice(0,8).map(n=>Is(n)).join("")||v("No time-sensitive tasks for this company.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
          ${Y([["Company",x(e)],["Assigned to you",String(t.assignedToMe.length)],["Due this week",String(t.thisWeek.length)],["Completed",String(t.done.length)]])}
        </article>
      <article class="panel span-2">
          <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
          <div class="data-table operations-table">
            <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
            ${t.thisWeek.slice(0,8).map(n=>`
              <a class="table-row" href="${_(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},e))}" data-router>
                <span><strong>${r(n.title)}</strong><small>${r(n.description||Ge(n.type))}</small></span>
                <span>${r(N(n.project_id)?.name||"Company task")}</span>
                <span>${r(W(n.assignee_id))}</span>
                <span>${P(n.due)}</span>
                <span>${Io(n.status)}</span>
              </a>
            `).join("")||v("No upcoming tasks this week.")}
          </div>
        </article>
      </section>
    </section>
  `}function au(e){const t=$o(e),a=sa(e),n=jt().getTime(),i=n-6*864e5,o=Di(e,n)+(a?Date.now()-Date.parse(a.started_at):0),l=Di(e,i)+(a?Date.now()-Date.parse(a.started_at):0);return`
    <section class="tool-page operations-page clock-page">
      ${z("Clock dashboard","Local basic-mode clock tracking for the active company.",`
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Za(e,"clock")}
      <section class="metric-grid operations-metrics">
        ${A("Today",ya(o))}
        ${A("Last 7 days",ya(l))}
        ${A("Entries",t.length)}
        ${A("Status",a?"Clocked in":"Off clock")}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${a?Y([["User",W(a.user_id)],["Started",Ta(a.started_at)],["Task",a.task_title||"General shift"],["Elapsed",ya(Date.now()-Date.parse(a.started_at))]]):v("Nobody is clocked in on this device.")}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${t.slice(0,10).map(d=>`
              <div class="table-row">
                <span><strong>${r(d.task_title||"General shift")}</strong><small>${r(d.notes||"Clock entry")}</small></span>
                <span>${r(W(d.user_id))}</span>
                <span>${Ta(d.started_at)}</span>
                <span>${ya(d.duration_ms)}</span>
              </div>
            `).join("")||v("No clock entries yet.")}
          </div>
        </article>
      </section>
    </section>
  `}function nu(e){const t=ys(e),a=t.filter(o=>o.type==="Form approval"),n=t.filter(o=>o.type==="Task review"),i=t.filter(o=>o.type==="Access request");return`
    <section class="tool-page operations-page">
      ${z("Approvals","Company review queue for forms, task handoffs, and access requests.",`
        <a class="btn" href="${_(m("forms",{},e))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${Za(e,"approvals")}
      <section class="metric-grid operations-metrics">
        ${A("Open approvals",t.length)}
        ${A("Forms",a.length)}
        ${A("Task reviews",n.length)}
        ${A("Access",i.length)}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Approval queue</h2><p>One calm list instead of a heavy dashboard.</p></div></div>
        <div class="data-table approval-table">
          <div class="table-head"><span>Item</span><span>Type</span><span>Owner</span><span>Status</span><span>Updated</span></div>
          ${t.map(o=>`
            <a class="table-row" href="${_(o.href)}" data-router>
              <span><strong>${r(o.title)}</strong><small>${r(o.meta)}</small></span>
              <span>${r(o.type)}</span>
              <span>${r(o.owner)}</span>
              <span>${r(o.status)}</span>
              <span>${P(o.updatedAt)}</span>
            </a>
          `).join("")||v("No approvals need attention right now.")}
        </div>
      </section>
    </section>
  `}function bi(e){return`
    ${z(O(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${v("Module data model pending.")}
    </section>
  `}function _i(e=!1){document.title="Quest HQ | Company operations workspace";const t=s.route||Xt(),a=Xa(t.params.get("return_url")||_(m("jobs",{},L()))),n=String(t.params.get("invite")||"").trim(),i=String(t.params.get("auth")||"").trim(),o=Vr(t.params.get("mode")||i,n);o&&s.authMode!==o&&(s.authMode=o),n&&!["signin","register"].includes(s.authMode)&&(s.authMode="register");const l=e||!!(n||i),d=s.session;Ka.innerHTML=`
    <main class="landing-shell">
      <nav class="landing-nav">
        <a class="login-brand landing-brand" href="${_("/")}" data-router>
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Workplace Center</small></span>
        </a>
        <div class="landing-nav-links" aria-label="Landing navigation">
          ${[["Why Quest HQ","why-quest-hq"],["Security","security"],["Platform","platform"],["Access","platform"],["Company","why-quest-hq"]].map(([c,f])=>`<a href="#${r(f)}">${r(c)}</a>`).join("")}
        </div>
        <div class="landing-nav-actions">
          ${d?`<a class="btn" href="${_(m("jobs",{},u()))}" data-router>Open workspace</a>`:""}
          <button class="btn landing-login-btn" type="button" data-action="open-auth-modal" data-auth-mode="signin"><i class="ti ti-lock"></i>Business login</button>
        </div>
      </nav>
      <section class="landing-hero">
        <div class="landing-hero-bg" aria-hidden="true"></div>
        <div class="landing-hero-copy">
          <div class="landing-pill"><i class="ti ti-shield-lock"></i>Secure. Controlled. Built for business.</div>
          <h1>Run your entire company workspace from one secure command center</h1>
          <p>Quest HQ brings your teams, projects, files, messages, finance, and customer follow-ups into one place with invite-only access and clear role controls.</p>
          <div class="landing-hero-actions">
            <button class="btn btn-primary" type="button" data-action="open-auth-modal" data-auth-mode="register">Start business workspace<i class="ti ti-arrow-right"></i></button>
            <button class="btn landing-ghost-btn" type="button" data-action="open-auth-modal" data-auth-mode="invite"><i class="ti ti-users-plus"></i>Join by invite</button>
          </div>
          <div class="landing-security-line"><i class="ti ti-circle-check"></i>Invite-only workspaces <i class="ti ti-circle-check"></i>Role-based access <i class="ti ti-circle-check"></i>Audit every action</div>
        </div>
        <div class="landing-console" aria-label="Quest HQ workspace command center preview">
          <img class="landing-console-art" src="${r(nl)}" alt="Generated Quest HQ secure workspace cockpit preview showing company access, tasks, messages, finance, files, users, reports, and audit controls." />
          <aside class="landing-console-rail" aria-hidden="true">
            <span class="console-mark">Q</span>
            ${[["ti-home","Home",!0],["ti-list-check","Tasks"],["ti-calendar","Calendar"],["ti-users","CRM"],["ti-lock-dollar","Finance"],["ti-folder","Files"],["ti-forms","Forms"],["ti-message-circle","Messages",!1,"3"],["ti-user-cog","Users"],["ti-report-analytics","Reports"],["ti-settings","Settings"],["ti-clipboard-check","Audit"]].map(([c,f,g,D])=>`
              <span class="${g?"active":""}"><i class="ti ${r(c)}"></i><em>${r(f)}</em>${D?`<b>${r(D)}</b>`:""}</span>
            `).join("")}
          </aside>
          <div class="landing-console-main">
            <div class="landing-console-top">
              <div>
                <strong>Good morning, Quest Admin</strong>
                <span>Here is what is happening across your workspace.</span>
              </div>
              <button type="button"><i class="ti ti-building"></i>Acme Global<i class="ti ti-chevron-down"></i></button>
              <span class="landing-avatar">QA</span>
            </div>
            <div class="landing-console-stats">
              ${[["ti-shield-check","Company access","Pending approval","Approval required before modules open.","View status"],["ti-user-check","Active users","24","18 active · 6 pending","Manage users"],["ti-circle-check","Open tasks","42","12 overdue","View tasks"],["ti-message-circle","Unread messages","8","Across team chats","Open inbox"]].map(([c,f,g,D,U],T)=>`
                <article class="${T===0?"warning":""}">
                  <i class="ti ${r(c)}"></i>
                  <span>${r(f)}</span>
                  <strong>${r(g)}</strong>
                  <small>${r(D)}</small>
                  <button type="button">${r(U)}</button>
                </article>
              `).join("")}
            </div>
            <div class="landing-console-grid">
              <article class="landing-activity">
                <strong>Recent activity</strong>
                ${[["ti-file-dollar","Invoice #INV-1024 was created","Finance","10m ago"],["ti-forms","Shan submitted a form response","Forms","25m ago"],["ti-alert-circle","Leak inspection task was assigned","Tasks","1h ago"],["ti-file-upload","Permit packet.pdf was uploaded","Files","2h ago"],["ti-user-plus","Abraham joined the workspace","Users","3h ago"]].map(([c,f,g,D])=>`
                  <div><i class="ti ${r(c)}"></i><span><b>${r(f)}</b><small>${r(g)}</small></span><em>${r(D)}</em></div>
                `).join("")}
              </article>
              <article class="landing-health">
                <strong>Workspace health</strong>
                ${[["ti-circle-check","Company created","ok"],["ti-clock","Pending approval","wait"],["ti-link","Billing connected","muted"],["ti-shield-lock","Payment active","muted"],["ti-users","Full access enabled","muted"]].map(([c,f,g])=>`<div class="${r(g)}"><i class="ti ${r(c)}"></i>${r(f)}</div>`).join("")}
                <span class="landing-watermark">Q</span>
              </article>
            </div>
            <div class="landing-quick-access">
              ${[["ti-folder","Files"],["ti-users","CRM"],["ti-currency-dollar","Finance"],["ti-calendar","Calendar"],["ti-user-cog","Users"],["ti-clipboard-check","Audit"]].map(([c,f])=>`<span><i class="ti ${r(c)}"></i>${r(f)}</span>`).join("")}
            </div>
          </div>
        </div>
      </section>
      <section class="landing-command-panels" id="security">
        <article class="landing-trust-card">
          <div>
            <div class="eyebrow">Trusted & secure</div>
            <p>Every workspace is isolated. You stay in control of who can see what.</p>
          </div>
          <div class="landing-trust-grid">
            ${[["ti-shield-check","SOC 2","Type II path"],["ti-lock","AES-256","Encryption"],["ti-database-lock","RLS","Row-level security"],["ti-clock-check","99.9%","Uptime target"],["ti-clipboard-list","Audit","Every action"],["ti-key","Private","By default"]].map(([c,f,g])=>`<span><i class="ti ${r(c)}"></i><strong>${r(f)}</strong><small>${r(g)}</small></span>`).join("")}
          </div>
          <small class="landing-boundary"><i class="ti ti-lock"></i>Your data never leaves your company boundary.</small>
        </article>
        <article class="landing-access-card" id="platform">
          <div class="landing-access-head">
            <div class="eyebrow">Access model</div>
            <p>The right access for the right people. No shortcuts. No guesswork.</p>
          </div>
          <div class="landing-role-flow">
            ${[["ti-crown","Owner","Full access · Billing · Invites · Transfer ownership"],["ti-user-shield","Admin","Manage users · Roles · Module access"],["ti-user","Worker","Assigned access · Own tasks · Team collaboration"],["ti-shield-x","Finance denied","Finance hidden · No billing · No payments"],["ti-hourglass","Pending approval","Workspace created · Modules locked"]].map(([c,f,g],D)=>`
              <div class="${D===4?"pending":""}">
                <i class="ti ${r(c)}"></i>
                <strong>${r(f)}</strong>
                <span>${r(g)}</span>
              </div>
            `).join("")}
          </div>
        </article>
      </section>
      <section class="landing-proof" id="why-quest-hq">
        ${[["ti-cube","One workspace","Everything connected"],["ti-user-shield","Role-based access","Built-in guardrails"],["ti-calendar-user","Company control","You decide who sees what"],["ti-shield-check","Audit & accountability","Every action tracked"],["ti-chart-arrows","Scale with confidence","Built for growth"]].map(([c,f,g])=>`
          <article>
            <i class="ti ${r(c)}"></i>
            <span><strong>${r(f)}</strong><small>${r(g)}</small></span>
          </article>
        `).join("")}
        <blockquote>"Quest HQ lets our team work from one clean place without giving everyone access to everything."</blockquote>
      </section>
      ${l?su(a,n):""}
      ${Br()}
    </main>
  `}function su(e,t,a){const n=$p(t);return`
    <div class="modal-overlay">
      <div class="modal-panel landing-auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div class="modal-head landing-auth-head">
          <div>
            <div class="eyebrow">Tenant access</div>
            <h2 id="auth-modal-title">${t?"Join workspace":"Quest HQ"}</h2>
          </div>
          <button class="btn" type="button" data-action="close-auth-modal">Close</button>
        </div>
        <div class="landing-auth-body">
          <div class="auth-modal-note">Owners create workspaces. Workers join by invite.</div>
          ${t?`
            <div class="invite-banner">
              <strong>${n?`Invite found for ${r(n.company_name||"workspace")}`:"Workspace invite"}</strong>
              <span>${n?`${r(n.email)} can create an account or sign in to join.`:"Create an account with the invited email, or sign in if that email already has a Quest HQ account."}</span>
            </div>
          `:""}
          ${`
            ${iu(t)}
            ${ou(e)}
          `}
          <details class="demo-mode-details">
            <summary>Demo mode</summary>
            ${ru(e)}
          </details>
          
        </div>
      </div>
    </div>
  `}function Vr(e,t=""){const a=String(e||"").toLowerCase().trim();return t&&!a?"register":["signin","register","invite","request"].includes(a)?a:a==="business"?"register":a==="worker"?t?"register":"invite":""}function iu(e=""){const t=s.authMode;return`
    <nav class="auth-mode-bar" aria-label="Account access">
      ${(e?[["signin","Sign in"],["register","Create invited account"]]:[["signin","Sign in"],["register","Create workspace"],["invite","Join with invite"]]).map(([n,i])=>`
        <button class="${t===n?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="${r(n)}">${r(i)}</button>
      `).join("")}
    </nav>
  `}function ru(e){return`
    <section class="demo-mode-box">
      <div>
        <strong>Demo mode</strong>
        <span>Local-only sample workspace. No Supabase database reads or writes.</span>
      </div>
      <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${r(e)}">Open demo mode</button>
    </section>
  `}function ou(e){const t=String(s.route?.params?.get("invite")||"").trim();return s.authMode==="register"?`
      <form class="auth-form-compact" data-auth-register-form>
        <div class="auth-form-title">
          <strong>${t?"Create invited worker account":"Create business workspace"}</strong>
          <span>${t?"Email must match the invite.":"Workspace opens after Quest approval."}</span>
        </div>
        <label>${t?"Display name / username":"Full name"}<input name="full_name" autocomplete="name" required /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required /></label>
        ${t?"":'<label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>'}
        <input type="hidden" name="invite_token" value="${r(t)}" />
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">${t?"Create account and join":"Create secure workspace"}</button>
        ${ga(t?"Workers cannot create access without a valid invite code.":"You become Owner, then Quest approves billing/access before the workspace opens.")}
        ${t?'<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="signin">I already have an account</button>':""}
      </form>
    `:s.authMode==="invite"?`
      <form class="auth-form-compact" data-auth-invite-code-form>
        <div class="auth-form-title">
          <strong>Join with invite code</strong>
          <span>Workers need a code from their company admin.</span>
        </div>
        <label>Invite code<input name="invite_code" autocomplete="one-time-code" required placeholder="Paste the code from your admin" /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Continue with invite code</button>
        ${ga("Invite codes are shared by your Owner/Admin. No email delivery required.")}
      </form>
    `:s.authMode==="request"?`
      <form class="auth-form-compact" data-auth-request-form>
        <div class="auth-form-title">
          <strong>Request access</strong>
          <span>This is for existing accounts only. New workers should use an admin invite.</span>
        </div>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" required /></label>
        <label>Company ID<input name="company_id" placeholder="company-workspace-id" required /></label>
        <label>Message<input name="message" placeholder="Tell the admin why you need access" /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Request company access</button>
        ${ga("Requests stay pending until a company Owner/Admin approves them.")}
      </form>
    `:`
    <form class="auth-form-compact" data-auth-sign-in-form>
      <div class="auth-form-title">
        <strong>${t?"Sign in and accept invite":"Sign in"}</strong>
        <span>${t?"Use the invited email account.":"Use your company account."}</span>
      </div>
      <label>Email<input name="email" type="email" autocomplete="email" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <input type="hidden" name="invite_token" value="${r(t)}" />
      <input type="hidden" name="return_url" value="${r(e)}" />
      <button class="btn btn-primary full" type="submit">${t?"Sign in and join":"Sign in"}</button>
      ${ga(t?"If you do not have an account yet, create an invited worker account.":"Business owners and workers use the same sign in after access is created.")}
      ${t?'<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="register">Create invited account</button>':""}
    </form>
  `}function ga(e){return s.loginError?`<div class="form-message error">${r(s.loginError)}</div>`:`<div class="form-message">${r(s.authMessage||e)}</div>`}function lu(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${ee(e,"avatar large")}
            <div><strong>${r(e.full_name)}</strong><span>${r(e.email)}</span></div>
          </div>
          <label>Display name<input name="full_name" value="${r(e.full_name)}" /></label>
          <input type="hidden" name="avatar_url" value="${r(e.avatar_url||"")}" />
          <label class="profile-upload-field">
            <span>Profile picture</span>
            <input name="avatar_file" type="file" accept="image/png,image/jpeg,image/webp" />
            <small>PNG, JPG, or WebP. Live accounts support up to 2 MB.</small>
          </label>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Save profile</button>
            <button class="btn" type="button" data-action="close-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `}function cu(e,t){if(s.modal==="profile")return lu(t.profile);if(s.modal==="file-upload")return Tc();if(s.modal==="folder-new")return Ec();if(s.modal==="file-detail")return pu(u());if(s.modal==="forms-tools")return fu(u());if(s.modal==="form-actions")return vu(u(),Bt(u()));if(s.modal==="form-new")return gu(u());if(s.modal==="form-preview")return _u(u(),Bt(u()));if(s.modal==="job-new")return $n(u(),null);if(s.modal==="job-edit")return $n(u(),Le());if(s.modal==="contact-new")return li(u(),null);if(s.modal==="contact-edit")return li(u(),Gm());if(s.modal==="account-new")return ui(u(),null);if(s.modal==="account-edit")return ui(u(),Zm());if(s.modal==="deal-new")return mi(u(),null);if(s.modal==="deal-edit")return mi(u(),ep());if(s.modal==="activity-new")return wd(u());if(s.modal==="stages-jobs")return hn("jobs");if(s.modal==="stages-contacts")return hn("contacts");if(s.modal==="stages-deals")return hn("deals");if(s.modal==="finance-invoice-new")return pi(u(),null);if(s.modal==="finance-invoice-edit")return pi(u(),We(s.selectedFinanceInvoiceId));if(s.modal==="finance-payment-new")return Jd(u(),s.selectedFinanceInvoiceId);if(s.modal==="finance-expense-new")return fi(u(),null,s.selectedFinanceVendorId);if(s.modal==="finance-expense-edit")return fi(u(),ko(s.selectedFinanceExpenseId));if(s.modal==="finance-vendor-new")return gi(u(),null);if(s.modal==="finance-vendor-edit")return gi(u(),Ss(s.selectedFinanceVendorId));if(s.modal==="role-new")return Hc(u());if(s.modal==="invite-new")return Wc(u());if(s.modal==="message-group-new")return Rd(u());if(s.modal==="message-direct-new")return Nd(u());if(s.modal==="message-access")return Ud(u(),s.selectedConversationId);if(s.modal==="message-details")return Ld(u(),s.selectedConversationId);if(s.modal==="message-search")return Qd(u());if(s.modal==="calendar-event-detail")return mu(u());if(s.modal==="calendar-event-new")return vi(u(),null);if(s.modal==="calendar-event-edit")return vi(u(),ta(s.selectedCalendarEventId));if(e.name==="company"&&e.section==="crm"&&e.params.get("account"))return Sd(e.companyId,e.params.get("account"));if(e.name==="company"&&e.section==="finance"){const a=Bd(e,e.companyId);if(a)return a}return e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"?$n(e.companyId,e.jobId?N(e.jobId):Le()):e.name==="company"&&e.section==="tasks"?uu(e,e.companyId):""}function Br(){return s.toast?`
    <div class="app-toast ${r(s.toast.mode||"local")}" role="status" aria-live="polite">
      <strong>${r(s.toast.title||"Quest HQ")}</strong>
      <span>${r(s.toast.message||"")}</span>
    </div>
  `:""}function h(e,t="local",a="Not available yet"){s.toastTimer&&clearTimeout(s.toastTimer),s.toast={title:a,message:e,mode:t},p(),s.toastTimer=setTimeout(()=>{s.toast=null,s.toastTimer=null,p()},4200)}function E(e,t,a,n=""){return`
    <div class="modal-overlay">
      <div class="modal-panel ${r(n)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </div>
    </div>
  `}function du(e,t,a){return`
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </aside>
    </div>
  `}function $n(e,t){return E("Jobs",t?"Edit job":"Create job",bc(e,t),"wide-modal")}function uu(e,t){const a=e.jobId?N(e.jobId):null,n=e.params.get("task_id")||"",i=n?en(n):null;return e.params.get("new")==="1"?E("Tasks","New task",di(t,a,null),"task-modal"):e.params.get("edit")==="1"&&i?E("Tasks","Edit task",di(t,a,i),"task-modal"):i?du("Task detail",i.title,$c(t,i)):""}function mu(e){const t=xm(s.selectedCalendarEventId,e);if(!t)return"";const a=t.source==="manual"?ta(t.sourceId):null,n=[t.href?`<a class="btn btn-primary" href="${_(t.href)}" data-router><i class="ti ti-arrow-right"></i>Open source</a>`:"",a&&t.editable?`<button class="btn" type="button" data-action="edit-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit</button>`:"",a&&t.editable?`<button class="btn danger" type="button" data-action="delete-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-trash"></i>Delete</button>`:""].filter(Boolean).join("");return E("Calendar",t.title,`
    <div class="calendar-detail">
      ${Y([["Type",t.type],["When",t.allDay?P(t.dateKey):`${Ta(t.startsAt)}${t.endsAt&&t.endsAt!==t.startsAt?` - ${Ta(t.endsAt)}`:""}`],["Assigned",t.owner||"Unassigned"],["Source",t.source==="manual"?"Manual event":O(t.source)],["Linked",t.linkLabel||"None"]])}
      ${t.description?`<p>${r(t.description)}</p>`:""}
      <div class="modal-actions">${n||'<span class="small-note">This derived item opens from its source module.</span>'}</div>
    </div>
  `,"calendar-modal")}function vi(e,t){const a=t||Op(e),n=a.linked_type==="job"?a.linked_id:"";return E("Calendar",t?"Edit event":"New event",`
    <form class="calendar-form" data-calendar-event-form>
      <input type="hidden" name="id" value="${r(t?.id||"")}" />
      ${w("Title","title",t?a.title:"",!0)}
      ${I("Type","event_type",a.event_type,za.map(i=>[i,i]))}
      ${w("Starts","starts_at",ji(a.starts_at),!0,"datetime-local")}
      ${w("Ends","ends_at",ji(a.ends_at||a.starts_at),!0,"datetime-local")}
      <label class="check-row"><input type="checkbox" name="all_day" ${a.all_day?"checked":""} /> All day</label>
      ${I("Visibility","visibility",a.visibility,[["company","Company"],["private","Private / assigned"]])}
      ${I("Assigned to","assigned_profile_id",a.assigned_profile_id,Vp(e))}
      ${I("Linked job","linked_job_id",n,[["","No linked job"]].concat(V(e).map(i=>[i.id,i.name])))}
      <label class="span-2">Description<textarea name="description" rows="4">${r(a.description)}</textarea></label>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save event</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"calendar-form-modal")}function pu(e){const t=s.selectedFileId?s.files.find(a=>a.id===s.selectedFileId):null;return t?E("Open file",t.file_name,Mc(t,e),"file-viewer-modal"):""}function fu(e){return E("Forms","Tools",`
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${s.formTypeFilter==="all"?"selected":""}>All types</option>
          ${Kt.map(t=>`<option value="${r(t)}" ${s.formTypeFilter===t?"selected":""}>${r(t)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `)}function gu(e){const t=s.formStartTab==="templates"?"templates":"blank",a=Et(),n=t==="templates"&&(a.find(c=>c.id===s.formStartTemplateId)||a[0])||null,i=n?.title||"",o=n?.description||"",l=n?.type||"Internal",d=n?.questions||[{type:"short",label:"First question",required:!1,options:[]}];return E("Forms","New form builder",`
    <form class="new-form-modal builder-create-modal" data-new-form-form>
      <input type="hidden" name="template_id" value="${r(n?.id||"")}" />
      <div class="form-start-tabs" role="tablist" aria-label="New form start type">
        <button class="${t==="blank"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="blank"><i class="ti ti-clipboard-plus"></i>Blank</button>
        <button class="${t==="templates"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="templates"><i class="ti ti-template"></i>Templates</button>
      </div>
      ${t==="templates"?`
        <div class="new-form-template-grid">
          ${a.map(c=>`
            <button class="${n?.id===c.id?"active":""}" type="button" data-action="select-form-start-template" data-template-id="${r(c.id)}">
              <span><i class="ti ti-template"></i></span>
              <strong>${r(c.title)}</strong>
              <small>${r(c.type)} / ${c.questions.length} questions</small>
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
            <div class="gform-accent-strip" style="--form-accent:${r(Oe(e))}"></div>
            <label><span>Form title</span><input name="title" value="${r(i)}" placeholder="Untitled form" required /></label>
            <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${r(o)}</textarea></label>
          </article>
          <div class="new-form-question-list">
            ${d.map((c,f)=>bu(c,f)).join("")}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${n?r(n.title):"Blank starter"}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${Kt.map(c=>`<option value="${r(c)}" ${c===l?"selected":""}>${r(c)}</option>`).join("")}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${V(e).map(c=>`<option value="${r(c.id)}" ${s.route?.jobId===c.id?"selected":""}>${r(c.name)}</option>`).join("")}</select></label>
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
  `,"form-create-modal builder-modal")}function bu(e,t){const a=Yt(e)?`
    <div class="starter-options">
      ${(e.options||["Option 1","Option 2"]).map(n=>`<span>${r(n)}</span>`).join("")}
    </div>
  `:"";return`
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${t+1}</span>
        <strong>${r(vf(e.type))}</strong>
      </div>
      <label><span>Question</span><input value="${r(e.label||"Untitled question")}" readonly /></label>
      ${e.help?`<small>${r(e.help)}</small>`:""}
      ${a}
      <label class="check-row"><input type="checkbox" ${e.required?"checked":""} disabled /> Required</label>
    </article>
  `}function _u(e,t){return t?E("Forms","Preview form",`
    <div class="form-preview-modal-body">
      ${nd(e,t)}
    </div>
  `,"form-preview-modal"):E("Forms","Preview form",v("Choose a form first."))}function vu(e,t){return t?E("Forms","Manage form",`
    <div class="forms-summary-share compact">
      <strong>Shareable preview URL</strong>
      <input readonly value="${r(`${window.location.origin}${_(m("forms",{form_id:t.id},e))}`)}" />
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
  `):E("Forms","Manage form",v("Choose a form first."))}function yu(e){const t=s.accountMenuOpen&&!e.target.closest(".account-menu"),a=s.notificationMenuOpen&&!e.target.closest(".notification-center");t&&(s.accountMenuOpen=!1),a&&(s.notificationMenuOpen=!1);const n=e.target.closest("[data-action]");if(n){hu(e,n);return}const i=e.target.closest("[data-select-job]");if(i){e.preventDefault(),Dm(i.dataset.selectJob);return}const o=e.target.closest("[data-select-task]");if(o){e.preventDefault(),Cm(o.dataset.selectTask);return}const l=e.target.closest("a[href][data-router]");if(!l){(t||a)&&p();return}l.target||l.hasAttribute("download")||(e.preventDefault(),q(l.getAttribute("href")))}function hu(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),s.dataLoaded=!1,s.sync={label:"Refreshing...",mode:"loading"},p();return}if(a==="sign-out"){e.preventDefault(),s.accountMenuOpen=!1,Su();return}if(a==="toggle-account-menu"){e.preventDefault(),s.accountMenuOpen=!s.accountMenuOpen,s.notificationMenuOpen=!1,p();return}if(a==="toggle-notifications"){e.preventDefault(),s.notificationMenuOpen=!s.notificationMenuOpen,s.accountMenuOpen=!1,p();return}if(a==="toggle-sidebar"){e.preventDefault(),s.sidebarCollapsed=!s.sidebarCollapsed,localStorage.setItem(Qi,String(s.sidebarCollapsed)),p();return}if(a==="toggle-nav-group"){e.preventDefault();const n=t.dataset.group;n&&(s.collapsedNavGroups.has(n)?s.collapsedNavGroups.delete(n):s.collapsedNavGroups.add(n),k(Vi,[...s.collapsedNavGroups]),p());return}if(a==="toggle-nav-expand"){e.preventDefault();const n=t.dataset.module;n&&(s.expandedNav.has(n)?s.expandedNav.delete(n):s.expandedNav.add(n),k(Bi,[...s.expandedNav]),p());return}if(a==="pipeline-open"){e.preventDefault();const n=t.dataset.module;ki(n,"all",!0);return}if(a==="pipeline-stage"){e.preventDefault();const n=t.dataset.module;ki(n,t.dataset.stage||"all",!1);return}if(a==="mark-all-notifications-read"){e.preventDefault(),of(u()).catch(n=>console.warn("Notification read sync failed",n));return}if(a==="open-notification"){e.preventDefault(),lf(t.dataset.notificationId).catch(n=>console.warn("Notification open sync failed",n));return}if(a==="verify-email"){e.preventDefault(),s.accountMenuOpen=!1,h("Email verification is not implemented yet. Account access is not blocked right now.","local");return}if(a==="start-demo-mode"){e.preventDefault(),Yr(t.dataset.returnUrl||"");return}if(a==="open-auth-modal"){e.preventDefault();const n=Vr(t.dataset.authMode||"signin")||"signin";s.authMode=n,s.loginError="",s.authMessage="",q(`/?auth=${encodeURIComponent(n)}`);return}if(a==="close-auth-modal"){e.preventDefault(),s.loginError="",s.authMessage="",q("/");return}if(a==="set-auth-mode"){e.preventDefault();const n=["signin","register","invite","request"].includes(t.dataset.authMode)?t.dataset.authMode:"signin";if(s.authMode=n,s.loginError="",s.authMessage="",s.route?.name==="home"||s.route?.name==="login"){const i=new URLSearchParams(s.route.params);s.route.name==="home"?(i.set("auth",n),i.delete("mode")):(i.set("mode",n),i.delete("auth"));const o=i.toString();q(`${s.route.path}${o?`?${o}`:""}`,{replace:!0});return}p();return}if(a==="open-profile"){e.preventDefault(),s.accountMenuOpen=!1,s.modal="profile",p();return}if(a==="open-role-form"){if(e.preventDefault(),!y("roles.manage",u(),"Your role cannot manage roles.","Roles"))return;s.modal="role-new",p();return}if(a==="view-as-role"){e.preventDefault();const n=u(),i=St(n,t.dataset.roleId);if(!i){h("That role is no longer available.","local","Role preview");return}s.rolePreview={company_id:n,role_id:i.id},h(`Viewing the workspace as ${i.name}.`,"local","Role preview");return}if(a==="exit-role-preview"){e.preventDefault(),s.rolePreview=null,h("Role preview ended.","live","Role preview");return}if(a==="open-invite-form"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot invite or manage users.","Users"))return;s.modal="invite-new",p();return}if(a==="new-message-group"){if(e.preventDefault(),!y("messages.create_group",u(),"Your role cannot create group chats.","Messages"))return;s.modal="message-group-new",p();return}if(a==="new-direct-message"){if(e.preventDefault(),!y("messages.send",u(),"Your role cannot start direct messages.","Messages"))return;s.modal="message-direct-new",p();return}if(a==="manage-message-chat"){if(e.preventDefault(),!y("messages.manage_groups",u(),"Your role cannot manage chat access.","Messages"))return;s.selectedConversationId=t.dataset.conversationId||s.selectedConversationId,s.modal="message-access",p();return}if(a==="message-details"){e.preventDefault(),s.selectedConversationId=t.dataset.conversationId||s.selectedConversationId,s.modal="message-details",p();return}if(a==="message-search-results"){e.preventDefault(),s.modal="message-search",p();return}if(a==="set-message-filter"){e.preventDefault(),s.messageFilter=["all","unread",...Kn].includes(t.dataset.filter)?t.dataset.filter:"all",p();return}if(a==="delete-message"){e.preventDefault(),zu(t.dataset.messageId);return}if(a==="open-message-attachment"){e.preventDefault(),Ju(t.dataset.attachmentId);return}if(a==="run-message-scenario"){e.preventDefault(),Kp(u());return}if(a==="reset-message-demo"){e.preventDefault(),Zp();return}if(a==="set-calendar-scope"){e.preventDefault(),s.calendarScope=t.dataset.scope==="me"?"me":"company",p();return}if(a==="set-calendar-view"){e.preventDefault(),s.calendarView=["month","week","list"].includes(t.dataset.view)?t.dataset.view:"week",p();return}if(a==="calendar-prev"){e.preventDefault(),Si(-1),p();return}if(a==="calendar-next"){e.preventDefault(),Si(1),p();return}if(a==="calendar-today"){e.preventDefault(),s.calendarCursorDate=j(0),p();return}if(a==="open-calendar-event"){e.preventDefault(),s.selectedCalendarEventId=t.dataset.eventId||"",s.modal="calendar-event-detail",p();return}if(a==="open-calendar-event-form"){if(e.preventDefault(),!$("calendar.manage",u())){h("Your role can view the calendar but cannot create company events.","local","Calendar");return}s.selectedCalendarEventId="",s.modal="calendar-event-new",p();return}if(a==="edit-calendar-event"){e.preventDefault();const n=ta(t.dataset.eventId);if(!n||!ea(n)){h("This event cannot be edited from Calendar.","local","Calendar");return}s.selectedCalendarEventId=n.id,s.modal="calendar-event-edit",p();return}if(a==="delete-calendar-event"){e.preventDefault(),Hu(t.dataset.eventId);return}if(a==="copy-invite-link"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot view invite links.","Users"))return;xu(t.dataset.inviteId);return}if(a==="copy-invite-code"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot view invite codes.","Users"))return;Ru(t.dataset.inviteId);return}if(a==="revoke-invite"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot revoke invites.","Users"))return;Nu(t.dataset.inviteId);return}if(a==="approve-join-request"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot approve access requests.","Users"))return;yi(t.dataset.requestId,"approved");return}if(a==="reject-join-request"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot reject access requests.","Users"))return;yi(t.dataset.requestId,"rejected");return}if(a==="start-checkout"){e.preventDefault(),Iu();return}if(a==="review-workspace"){e.preventDefault(),Eu(t.dataset.companyId,t.dataset.status);return}if(a==="open-file-upload"){if(e.preventDefault(),!y("files.manage",u(),"Your role can view files but cannot upload.","Files"))return;s.modal="file-upload",p();return}if(a==="open-folder-form"){if(e.preventDefault(),!y("files.manage",u(),"Your role can view files but cannot create folders.","Files"))return;s.modal="folder-new",p();return}if(a==="open-job-form"){if(e.preventDefault(),!y("jobs.manage",u(),"Your role can view jobs but cannot create or edit them.","Jobs"))return;const n=t.dataset.jobId||"";n&&(s.selectedJobId=n),s.modal=t.dataset.mode==="edit"?"job-edit":"job-new",p();return}if(a==="open-contact-form"){e.preventDefault();const n=t.dataset.contactId||"";n&&(s.selectedContactId=n),s.contactPrefill={account_id:t.dataset.accountId||""},s.modal=t.dataset.mode==="edit"?"contact-edit":"contact-new",p();return}if(a==="delete-contact"){e.preventDefault(),oc(t.dataset.contactId);return}if(a==="open-account-form"){e.preventDefault(),t.dataset.accountId&&(s.selectedAccountId=t.dataset.accountId),s.modal=t.dataset.mode==="edit"?"account-edit":"account-new",p();return}if(a==="delete-account"){e.preventDefault(),lp(t.dataset.accountId);return}if(a==="open-account"){e.preventDefault(),s.selectedAccountId=t.dataset.accountId||"",s.accountTab="overview",q(m("crm",{account_id:t.dataset.accountId},u()));return}if(a==="set-account-tab"){e.preventDefault(),s.accountTab=t.dataset.tab||"overview",p();return}if(a==="account-type"){e.preventDefault(),s.accountTypeFilter=t.dataset.type||"all",we();return}if(a==="open-deal-form"){e.preventDefault(),t.dataset.dealId&&(s.selectedDealId=t.dataset.dealId),s.dealPrefill={account_id:t.dataset.accountId||"",primary_contact_id:t.dataset.contactId||"",stage:t.dataset.stage||""},s.modal=t.dataset.mode==="edit"?"deal-edit":"deal-new",p();return}if(a==="delete-deal"){e.preventDefault(),dp(t.dataset.dealId);return}if(a==="open-deal"){e.preventDefault(),s.selectedDealId=t.dataset.dealId||"",q(m("deals",{deal_id:t.dataset.dealId},u()));return}if(a==="convert-deal"){e.preventDefault(),pp(t.dataset.dealId);return}if(a==="open-activity-form"){e.preventDefault(),s.activityPrefill={related_type:t.dataset.relatedType||"",related_id:t.dataset.relatedId||"",account_id:t.dataset.accountId||"",type:t.dataset.type||"note"},s.modal="activity-new",p();return}if(a==="delete-activity"){e.preventDefault(),mp(t.dataset.activityId);return}if(a==="set-pipeline-view"){e.preventDefault();const n=t.dataset.module,i=t.dataset.view==="board"?"board":"table";n==="contacts"?(s.contactBoardView=i,localStorage.setItem(Hi,i)):n==="deals"?(s.dealBoardView=i,localStorage.setItem(Ni,i)):(s.jobBoardView=i,localStorage.setItem(Yi,i)),p();return}if(a==="open-stage-manager"){e.preventDefault();const n=["contacts","deals"].includes(t.dataset.module)?t.dataset.module:"jobs";s.modal=`stages-${n}`,p();return}if(a==="add-stage"){e.preventDefault(),lc(["contacts","deals"].includes(t.dataset.module)?t.dataset.module:"jobs");return}if(a==="delete-stage"){e.preventDefault(),cc(["contacts","deals"].includes(t.dataset.module)?t.dataset.module:"jobs",Number(t.dataset.index));return}if(a==="open-forms-tools"){if(e.preventDefault(),!y("forms.manage",u(),"Your role can view forms but cannot create or edit them.","Forms"))return;s.modal="forms-tools",p();return}if(a==="open-form-actions"){e.preventDefault(),va(t.dataset.formId,!1),s.modal="form-actions",p();return}if(a==="open-form-preview"){e.preventDefault(),va(t.dataset.formId,!1),s.modal="form-preview",p();return}if(a==="set-form-start-tab"){e.preventDefault(),s.formStartTab=t.dataset.tab==="templates"?"templates":"blank",s.formStartTab==="blank"&&(s.formStartTemplateId=""),s.formStartTab==="templates"&&!s.formStartTemplateId&&(s.formStartTemplateId=Et()[0]?.id||""),p();return}if(a==="select-form-start-template"){e.preventDefault(),s.formStartTab="templates",s.formStartTemplateId=t.dataset.templateId||Et()[0]?.id||"",p();return}if(a==="close-modal"){e.preventDefault(),$u();return}if(a==="set-task-view"){e.preventDefault(),s.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(Ui,s.taskView),p();return}if(a==="set-drive-view"){e.preventDefault(),s.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem(Li,s.driveView),p();return}if(a==="clock-in"){e.preventDefault(),gp(u(),t.dataset.taskId||s.route?.params?.get("task_id")||"");return}if(a==="clock-out"){e.preventDefault(),wo();return}if(a==="select-file"){e.preventDefault(),s.selectedFileId=t.dataset.fileId||"",s.modal="file-detail",p();return}if(a==="download-file"){e.preventDefault(),um(t.dataset.fileId);return}if(a==="delete-file"){if(e.preventDefault(),!y("files.manage",u(),"Your role cannot delete files.","Files"))return;mm(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),s.formsTab=t.dataset.tab==="responses"?"responses":"library",p();return}if(a==="set-form-editor-tab"){e.preventDefault(),s.formEditorTab=t.dataset.tab||"questions",p();return}if(a==="new-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role can view forms but cannot create them.","Forms"))return;s.formStartTemplateId=t.dataset.templateId||"",s.formStartTab=t.dataset.startTab==="templates"||s.formStartTemplateId?"templates":"blank",s.formStartTab==="templates"&&!s.formStartTemplateId&&(s.formStartTemplateId=Et()[0]?.id||""),s.modal="form-new",p();return}if(a==="select-form"){e.preventDefault(),va(t.dataset.formId);return}if(a==="toggle-form-card"){e.preventDefault();const n=t.dataset.formId||"";s.expandedFormIds.has(n)?s.expandedFormIds.delete(n):s.expandedFormIds.add(n),p();return}if(a==="edit-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;va(t.dataset.formId,!1),s.formsTab="builder",s.formEditorTab="questions",s.modal="",p();return}if(a==="save-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;oe("Form saved locally"),p();return}if(a==="publish-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot publish forms.","Forms"))return;Ei(t.dataset.formId,"Published");return}if(a==="archive-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot archive forms.","Forms"))return;Ei(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot duplicate forms.","Forms"))return;wf(t.dataset.formId);return}if(a==="delete-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot delete forms.","Forms"))return;Sf(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),kf(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),Df(u());return}if(a==="new-finance-invoice"){if(e.preventDefault(),!$("finance.manage",u()))return h("Your role cannot manage finance records.","local","Finance");s.selectedFinanceInvoiceId="",s.modal="finance-invoice-new",p();return}if(a==="edit-finance-invoice"){if(e.preventDefault(),!$("finance.manage",u()))return h("Your role cannot manage finance records.","local","Finance");s.selectedFinanceInvoiceId=t.dataset.invoiceId||"",s.modal="finance-invoice-edit",p();return}if(a==="new-finance-payment"){if(e.preventDefault(),!$("finance.manage",u()))return h("Your role cannot manage finance records.","local","Finance");s.selectedFinanceInvoiceId=t.dataset.invoiceId||s.route?.params?.get("invoice")||"",s.modal="finance-payment-new",p();return}if(a==="new-finance-expense"){if(e.preventDefault(),!$("finance.manage",u()))return h("Your role cannot manage finance records.","local","Finance");s.selectedFinanceExpenseId="",s.selectedFinanceVendorId=t.dataset.vendorId||"",s.modal="finance-expense-new",p();return}if(a==="edit-finance-expense"){if(e.preventDefault(),!$("finance.manage",u()))return h("Your role cannot manage finance records.","local","Finance");s.selectedFinanceExpenseId=t.dataset.expenseId||"",s.modal="finance-expense-edit",p();return}if(a==="new-finance-vendor"){if(e.preventDefault(),!$("finance.manage",u()))return h("Your role cannot manage finance records.","local","Finance");s.selectedFinanceVendorId="",s.modal="finance-vendor-new",p();return}if(a==="edit-finance-vendor"){if(e.preventDefault(),!$("finance.manage",u()))return h("Your role cannot manage finance records.","local","Finance");s.selectedFinanceVendorId=t.dataset.vendorId||"",s.modal="finance-vendor-edit",p();return}if(a==="add-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Cf(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;jf(t.dataset.questionId);return}if(a==="delete-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Af(t.dataset.questionId);return}if(a==="move-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;qf(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Ff(t.dataset.questionId);return}if(a==="remove-question-option"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Mf(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){if(e.preventDefault(),!y("jobs.manage",u(),"Your role cannot delete jobs.","Jobs"))return;Xu(t.dataset.jobId);return}if(a==="delete-task"){if(e.preventDefault(),!y("tasks.manage",u(),"Your role cannot delete tasks.","Tasks"))return;tm(t.dataset.taskId)}}function $u(){const e=s.route||Xt();if(s.modal="",s.formStartTemplateId="",s.formStartTab="blank",s.selectedFinanceInvoiceId="",s.selectedFinanceExpenseId="",s.selectedFinanceVendorId="",e.name==="company"&&e.section==="tasks"&&(e.params.get("new")||e.params.get("edit")||e.params.get("task_id"))){q(m("tasks",e.jobId?{job_id:e.jobId}:{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"){const t=e.jobId?N(e.jobId):Le();q(m("jobs",{tab:t?"profile":"pipeline",...t?{job_id:t.id}:{}},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="crm"&&e.params.get("account")){q(m("crm",{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="finance"&&(e.params.get("invoice")||e.params.get("expense")||e.params.get("vendor")||e.params.get("report"))){q(m("finance",{},e.companyId),{replace:!0});return}p()}function wu(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===st.localUsername&&String(t.password||"")===st.localPassword)){s.loginError="Invalid temporary credentials.",p();return}s.loginError="",Yr(t.return_url||_(m("jobs",{},L())));return}if(e.target.matches("[data-auth-sign-in-form]")){e.preventDefault(),Cu(e.target);return}if(e.target.matches("[data-auth-register-form]")){e.preventDefault(),qu(e.target);return}if(e.target.matches("[data-auth-invite-code-form]")){e.preventDefault(),ju(e.target);return}if(e.target.matches("[data-existing-invite-code-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries()),a=String(t.invite_code||"").trim();if(!a){s.loginError="Invite code is required.",p();return}os(a);return}if(e.target.matches("[data-auth-request-form]")){e.preventDefault(),Mu(e.target);return}if(e.target.matches("[data-company-create-form]")){e.preventDefault(),Fu(e.target);return}if(e.target.matches("[data-profile-form]")){e.preventDefault(),ku(e.target).catch(t=>{h(t.message||"Profile save failed.","local","Profile")});return}if(e.target.matches("[data-job-form]")){e.preventDefault(),Zu(e.target);return}if(e.target.matches("[data-contact-form]")){e.preventDefault(),rc(e.target);return}if(e.target.matches("[data-account-form]")){e.preventDefault(),op(e.target);return}if(e.target.matches("[data-deal-form]")){e.preventDefault(),cp(e.target);return}if(e.target.matches("[data-activity-form]")){e.preventDefault(),up(e.target);return}if(e.target.matches("[data-stage-form]")){e.preventDefault(),dc(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),em(e.target);return}if(e.target.matches("[data-new-form-form]")){e.preventDefault(),$f(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),am(e.target);return}if(e.target.matches("[data-folder-form]")){e.preventDefault(),nm(e.target);return}if(e.target.matches("[data-finance-invoice-form]")){e.preventDefault(),sm(e.target);return}if(e.target.matches("[data-finance-payment-form]")){e.preventDefault(),im(e.target);return}if(e.target.matches("[data-finance-expense-form]")){e.preventDefault(),rm(e.target);return}if(e.target.matches("[data-finance-vendor-form]")){e.preventDefault(),om(e.target);return}if(e.target.matches("[data-role-form]")){e.preventDefault(),Ou(e.target);return}if(e.target.matches("[data-invite-form]")){e.preventDefault(),Pu(e.target);return}if(e.target.matches("[data-message-group-form]")){e.preventDefault(),Lu(e.target);return}if(e.target.matches("[data-direct-message-form]")){e.preventDefault(),Qu(e.target);return}if(e.target.matches("[data-message-access-form]")){e.preventDefault(),Vu(e.target);return}if(e.target.matches("[data-message-form]")){e.preventDefault(),Bu(e.target);return}if(e.target.matches("[data-calendar-event-form]")){e.preventDefault(),Yu(e.target);return}if(e.target.matches("[data-user-role-form]")){e.preventDefault(),Uu(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),If(e.target))}async function Su(){if(s.session?.auth==="supabase"){const e=F();e?.auth&&await e.auth.signOut()}localStorage.removeItem(it),s.session=null,s.dataLoaded=!1,q("/login",{replace:!0})}function Yr(e=""){s.loginError="",s.authMessage="",s.session=qn(),Sr(),s.activeCompanyId=u(),localStorage.setItem(Ie,s.activeCompanyId),k(it,s.session),s.dataLoaded=!1,s.dataLoading=!1,q(Xa(e||_(m("jobs",{},u()))),{replace:!0})}async function ku(e){const t=new FormData(e),a=b().profile,n=e.elements.avatar_file?.files?.[0]||null;let i=String(t.get("avatar_url")||a.avatar_url||"").trim();if(n&&n.size){const l=await Du(n);if(!l.ok)return;i=l.url}let o=Lt({...a,full_name:String(t.get("full_name")||"").trim()||a.full_name||"Quest user",avatar_url:i},a);if(s.session?.auth==="supabase"){const l=F();if(!l){h("Profile upload needs Supabase to be available.","local","Profile");return}const d=await l.from("profiles").update({full_name:o.full_name,avatar_url:o.avatar_url}).eq("id",a.id).select().single();if(d.error){h(d.error.message||"Profile save failed.","local","Profile");return}o=Lt(d.data,o),l.auth?.updateUser&&await l.auth.updateUser({data:{full_name:o.full_name,avatar_url:o.avatar_url}}),s.profiles=[o].concat(s.profiles.filter(c=>c.id!==o.id)),o.member_id&&(s.teamMembers=s.teamMembers.map(c=>c.id===o.member_id?{...c,full_name:o.full_name,name:o.full_name,avatar_url:o.avatar_url}:c))}else k(Oi,o),s.profileDraft=o;s.session={...b(),profile:o},k(it,s.session),s.modal="",h("Profile saved.",s.session?.auth==="supabase"?"live":"local","Profile")}async function Du(e){if(!["image/jpeg","image/png","image/webp"].includes(e.type))return h("Use a PNG, JPG, or WebP image for your profile picture.","local","Profile"),{ok:!1,url:""};if(e.size>2*1024*1024)return h("Profile pictures must be 2 MB or smaller.","local","Profile"),{ok:!1,url:""};if(s.session?.auth!=="supabase"){const f=await xo(e);return f?{ok:!0,url:f}:(h("Could not read that image file.","local","Profile"),{ok:!1,url:""})}const a=F(),n=b().profile.id,i=ff(e),o=`${n}/avatar-${Date.now()}.${i}`,l=await a.storage.from("avatars").upload(o,e,{cacheControl:"3600",upsert:!0,contentType:e.type});if(l.error)return h(l.error.message||"Profile picture upload failed.","local","Profile"),{ok:!1,url:""};const d=a.storage.from("avatars").getPublicUrl(o),c=d.data?.publicUrl?`${d.data.publicUrl}?v=${Date.now()}`:"";return c?{ok:!0,url:c}:(h("Profile picture uploaded, but no public URL was returned.","local","Profile"),{ok:!1,url:""})}async function Cu(e){const t=Object.fromEntries(new FormData(e).entries()),a=F();if(!a?.auth){s.loginError="Supabase auth is unavailable.",p();return}s.loginError="",s.authMessage="Signing in...",p();const n=await a.auth.signInWithPassword({email:String(t.email||"").trim(),password:String(t.password||"")});if(n.error){s.loginError=n.error.message||"Unable to sign in.",s.authMessage="",p();return}if(await Tt(n.data.session),t.invite_token){await os(t.invite_token,t.return_url);return}s.authMessage="",s.dataLoaded=!1,q(Xa(t.return_url||_(m("jobs",{},L()))),{replace:!0})}async function ju(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.invite_code||"").trim();if(!a){s.loginError="Invite code is required.",p();return}s.loginError="",s.authMessage="Checking invite code...",s.authMode="register",p();const n=await Au(a);if(n?.missing){s.loginError="Invite code was not found or is no longer pending.",s.authMessage="",s.authMode="invite",p();return}if(n?.status&&n.status!=="pending"){s.loginError=`This invite is ${n.status}. Ask your company admin for a new code.`,s.authMessage="",s.authMode="invite",p();return}if(n?.expires_at&&Date.parse(n.expires_at)<=Date.now()){s.loginError="This invite code expired. Ask your company admin for a new code.",s.authMessage="",s.authMode="invite",p();return}n?(s.inviteLookup=n,s.authMessage=`Invite found for ${n.email}.`):s.authMessage="";const i=new URLSearchParams({invite:a}),o=Xa(t.return_url||"");o&&i.set("return_url",o),i.set("mode","register"),q(`/login?${i.toString()}`,{replace:!0})}async function Au(e){const t=String(e||"").trim(),a=F();if(!t||!a)return null;const n=await a.rpc("lookup_company_invite",{invite_token:t}).catch(o=>({error:o}));if(n.error)return null;const i=Array.isArray(n.data)?n.data[0]:n.data;return i?{token:t,company_id:S(i.company_id||""),company_name:String(i.company_name||i.company_id||"").trim(),email:String(i.email||"").trim(),status:String(i.status||"").trim(),expires_at:i.expires_at||""}:{missing:!0}}async function qu(e){const t=Object.fromEntries(new FormData(e).entries()),a=F();if(!a?.auth){s.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),i=String(t.password||""),o=String(t.full_name||"").trim(),l=String(t.invite_token||"").trim(),d=String(t.company_name||"").trim();if(!n||!i||!o||!l&&!d){s.loginError=l?"Name, email, and password are required.":"Name, email, password, and company workspace are required.",p();return}s.loginError="",s.authMessage=l?"Creating account and accepting invite...":"Creating secure workspace...",p();const c=await a.auth.signUp({email:n,password:i,options:{data:{full_name:o}}});if(c.error){const D=/already|registered|exists/i.test(c.error.message||"");s.loginError=D&&l?"That email already has a Quest HQ account. Sign in with the invited email to accept this invite.":c.error.message||"Unable to create account.",D&&l&&(s.authMode="signin"),s.authMessage="",p();return}let f=c.data.session;if(!f){const D=await a.auth.signInWithPassword({email:n,password:i});if(D.error){s.loginError="Account created. Please sign in to finish workspace setup.",s.authMode="signin",s.authMessage="",p();return}f=D.data.session}if(await Tt(f),l){await os(l,t.return_url);return}const g=await a.rpc("create_company_workspace",{company_name:d});if(g.error){s.loginError=g.error.message||"Account created, but workspace setup failed.",s.authMessage="",p();return}s.activeCompanyId=S(g.data||L()),Ds(s.activeCompanyId),localStorage.setItem(Ie,s.activeCompanyId),s.dataLoaded=!1,s.authMessage="",q(m("settings",{tab:"billing"},s.activeCompanyId),{replace:!0})}async function Fu(e){const t=Object.fromEntries(new FormData(e).entries()),a=F(),n=String(t.company_name||"").trim();if(!a||!n){s.loginError="Company workspace name is required.",p();return}const i=await a.rpc("create_company_workspace",{company_name:n});if(i.error){s.loginError=i.error.message||"Workspace setup failed.",p();return}s.activeCompanyId=S(i.data||L()),Ds(s.activeCompanyId),localStorage.setItem(Ie,s.activeCompanyId),s.dataLoaded=!1,q(m("settings",{tab:"billing"},s.activeCompanyId),{replace:!0})}async function Mu(e){const t=Object.fromEntries(new FormData(e).entries()),a=F();if(!a?.auth){s.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),i=String(t.password||""),o=S(t.company_id||"");s.loginError="",s.authMessage="Submitting access request...",p();const l=await a.auth.signInWithPassword({email:n,password:i});if(l.error){s.loginError=l.error.message||"Sign in first to request access.",s.authMessage="",p();return}await Tt(l.data.session);const d=await a.rpc("request_company_access",{target_company_id:o,request_message:String(t.message||"").trim()||null});if(d.error){s.loginError=d.error.message||"Unable to request access.",s.authMessage="",p();return}s.authMessage="Access request sent. An Owner/Admin must approve it.",s.loginError="",s.authMode="signin",p()}async function Iu(){const e=u();s.sync={label:"Opening billing...",mode:"loading"},p();try{const t=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json",...b().access_token?{Authorization:`Bearer ${b().access_token}`}:{}},body:JSON.stringify({company_id:e,return_url:`${window.location.origin}${_(m("settings",{tab:"billing"},e))}`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.url)throw new Error(a.error||"Billing is not configured yet.");window.location.href=a.url}catch(t){s.sync={label:t.message||"Billing unavailable",mode:"local"},p()}}async function Eu(e,t){const a=S(e),n=un(t);if(!a||!n||!Cs()){h("Quest developer access is required to review workspaces.","local","Workspace review");return}const i=F();if(s.sync={label:"Updating workspace review...",mode:"loading"},p(),s.session?.auth==="supabase"&&i){const o=await i.rpc("review_company_workspace",{target_company_id:a,next_status:n,review_note:`Marked ${n} from Quest HQ approval console`});if(o.error){s.sync={label:o.error.message||"Workspace review failed",mode:"local"},h(o.error.message||"Workspace review failed.","local","Workspace review"),p();return}}Tu(a,n),await _t(a,"workspace.reviewed","company_subscription",a,{status:n},s.session?.auth==="supabase"),s.sync={label:`Workspace marked ${ja(n).toLowerCase()}`,mode:s.session?.auth==="supabase"?"live":"local"},h(`Workspace marked ${ja(n).toLowerCase()}.`,s.session?.auth==="supabase"?"live":"local","Workspace review"),p()}function Tu(e,t){const a=Ma({...ia(e)||{},company_id:e,status:t});s.subscriptions=qo(s.subscriptions.filter(i=>i.company_id!==e).concat(a));const n=It({...s.workspaceReviews.find(i=>i.company_id===e)||{},company_id:e,company_name:x(e),status:t,plan_code:a.plan_code,amount_cents:a.amount_cents,currency:a.currency,created_at:new Date().toISOString()});s.workspaceReviews=s.workspaceReviews.filter(i=>i.company_id!==e).concat(n),t==="pending_review"?Ds(e):hp(e)}async function Ou(e){const t=u();if(!y("roles.manage",t,"Your role cannot manage roles.","Roles"))return;const a=new FormData(e),n=at({id:crypto.randomUUID(),company_id:t,name:a.get("name"),color:a.get("color")||"#f0b23b",priority:a.get("priority")||100,is_system:!1,created_by:b().profile.id}),i=a.getAll("permissions").map(l=>String(l||"")).filter(Boolean),o=F();if(s.session?.auth==="supabase"&&o){const l=await o.from("roles").insert(n).select().single();if(l.error){s.sync={label:l.error.message||"Role save failed",mode:"local"},p();return}const d=at(l.data),c=i.map(f=>({role_id:d.id,permission_key:f,effect:"allow"}));c.length&&await o.from("role_permissions").insert(c),s.roles.unshift(d),s.rolePermissions=c.concat(s.rolePermissions).map(An),s.sync={label:"Role saved",mode:"live"}}else s.roles.unshift(n),s.rolePermissions=i.map(l=>An({role_id:n.id,permission_key:l,effect:"allow"})).concat(s.rolePermissions),s.sync={label:"Role saved locally",mode:"local"};s.modal="",p()}async function Pu(e){const t=new FormData(e),a=S(t.get("company_id")||u());if(!y("users.manage",a,"Your role cannot invite users.","Users"))return;const n=String(t.get("email")||"").trim().toLowerCase(),i=String(t.get("role_id")||"").trim();if(!n){s.sync={label:"Invite email is required",mode:"local"},p();return}const o=Ia({id:crypto.randomUUID(),company_id:a,email:n,role_id:Wt(i)?i:"",token:Jm(),status:"pending",invited_by:b().profile.id,expires_at:new Date(Date.now()+336*60*60*1e3).toISOString(),created_at:new Date().toISOString()}),l=F();if(s.session?.auth==="supabase"&&l){const d={company_id:o.company_id,email:o.email,role_id:o.role_id||null,token:o.token,status:"pending",invited_by:b().profile.id},c=await l.from("company_invites").insert(d).select().single();if(c.error){s.sync={label:c.error.message||"Invite save failed",mode:"local"},p();return}s.companyInvites.unshift(Ia(c.data)),await _t(o.company_id,"invite.created","company_invite",c.data.id,{email:o.email},!0),s.sync={label:"Invite code created. Copy it for the new user.",mode:"live"}}else s.companyInvites.unshift(o),_t(o.company_id,"invite.created","company_invite",o.id,{email:o.email}),s.sync={label:"Invite code created locally",mode:"local"};J("access.invite","Invite code created",`${H()} created an invite code for ${o.email}.`,m("settings",{tab:"access"},o.company_id),"invite",o.id,o.company_id),s.modal="",p()}async function os(e,t=""){const a=F();if(!a){s.loginError="Supabase auth is unavailable.",s.authMessage="",p();return}s.authMessage="Accepting workspace invite...",p();const n=await a.rpc("accept_company_invite",{invite_token:String(e||"").trim()});if(n.error){s.loginError=n.error.message||"Unable to accept invite.",s.authMessage="",p();return}const i=S(n.data||L());s.activeCompanyId=i,localStorage.setItem(Ie,i),s.inviteLookup=null,s.authMessage="",s.loginError="",s.dataLoaded=!1,q(m("jobs",{},i),{replace:!0})}async function xu(e){const t=s.companyInvites.find(a=>a.id===e);if(!(t&&!y("users.manage",t.company_id,"Your role cannot view invite links.","Users"))){if(!t?.token){s.sync={label:"Invite link is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(Km(t)),s.sync={label:"Invite link copied",mode:"live"}}catch{s.sync={label:"Copy failed",mode:"local"}}p()}}async function Ru(e){const t=s.companyInvites.find(a=>a.id===e);if(!(t&&!y("users.manage",t.company_id,"Your role cannot view invite codes.","Users"))){if(!t?.token){s.sync={label:"Invite code is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(t.token),s.sync={label:"Invite code copied",mode:"live"}}catch{s.sync={label:"Copy failed",mode:"local"}}p()}}async function Nu(e){const t=s.companyInvites.find(n=>n.id===e);if(!t||!y("users.manage",t.company_id,"Your role cannot revoke invites.","Users"))return;const a=F();if(s.session?.auth==="supabase"&&a){const n=await a.rpc("revoke_company_invite",{target_invite_id:t.id});if(n.error){s.sync={label:n.error.message||"Invite revoke failed",mode:"local"},p();return}s.sync={label:"Invite revoked",mode:"live"}}else s.sync={label:"Invite revoked locally",mode:"local"};s.companyInvites=s.companyInvites.map(n=>n.id===t.id?Ia({...n,status:"revoked"}):n),_t(t.company_id,"invite.revoked","company_invite",t.id,{email:t.email}),J("access.invite","Invite revoked",`${H()} revoked the invite for ${t.email}.`,m("settings",{tab:"access"},t.company_id),"invite",t.id,t.company_id),ae(),p()}async function Uu(e){const t=new FormData(e),a=S(t.get("company_id")||u());if(!y("users.manage",a,"Your role cannot manage user access.","Users"))return;const n=String(t.get("profile_id")||"").trim(),i=String(t.get("role_id")||"").trim(),o=["active","pending","disabled","left"].includes(String(t.get("membership_status")))?String(t.get("membership_status")):"active",l=St(a,i);if(!n||!l){s.sync={label:"Select a user and role",mode:"local"},p();return}const d=vp(a,n,l,o);if(d){s.sync={label:d,mode:"local"},p();return}const c=Fa({company_id:a,profile_id:n,role:fs(l),status:o}),f=ce(a,n),g=Fo({company_id:a,profile_id:n,role_id:l.id,assigned_by:b().profile.id}),D=F();if(s.session?.auth==="supabase"&&D){const U=Wt(l.id),T=await D.rpc("update_company_member_access",{target_company_id:a,target_profile_id:n,target_role:c.role,target_role_id:U?l.id:null,target_status:o});if(T.error){s.sync={label:T.error.message||"Access update failed",mode:"local"},p();return}Da(Fa(T.data||c)),U&&wi(g),s.sync={label:U?"User access saved":"Membership saved; create a role to assign permissions",mode:"live"}}else Da(c),wi(g),s.sync={label:"User access saved locally",mode:"local"};J("access.role","User access updated",`${H()} set ${Je(n)} to ${l.name} / ${O(o)}.`,m("settings",{tab:"access"},a),"membership",n,a,[n].concat(_e(a,["users.manage","settings.manage"]))),_t(a,cf(f,c),"membership",n,{role:l.name,status:o}),p()}async function yi(e,t){const a=s.joinRequests.find(l=>l.id===e);if(!a||!["approved","rejected"].includes(t)||!y("users.manage",a.company_id,"Your role cannot manage access requests.","Users"))return;const n=F(),i=Mo({...a,status:t}),o=Fa({company_id:a.company_id,profile_id:a.profile_id,role:"member",status:t==="approved"?"active":"disabled"});if(s.session?.auth==="supabase"&&n){const l=await n.rpc("review_company_join_request",{target_request_id:a.id,decision:t,target_role_id:null});if(l.error){s.sync={label:l.error.message||"Request update failed",mode:"local"},p();return}t==="approved"&&Da(o),s.sync={label:t==="approved"?"Access approved":"Request rejected",mode:"live"}}else t==="approved"&&Da(o),s.sync={label:t==="approved"?"Access approved locally":"Request rejected locally",mode:"local"};s.joinRequests=s.joinRequests.map(l=>l.id===a.id?i:l),_t(a.company_id,t==="approved"?"join.approved":"join.rejected","join_request",a.id,{email:a.requested_email}),J("access.request",t==="approved"?"Access approved":"Access rejected",`${H()} ${t==="approved"?"approved":"rejected"} ${a.requested_email||"a join request"}.`,m("settings",{tab:"access"},a.company_id),"join_request",a.id,a.company_id,[a.profile_id].concat(_e(a.company_id,["users.manage","settings.manage"]))),ae(),p()}async function Lu(e){const t=u();if(!$("messages.create_group",t)){h("Your role cannot create group chats.","local","Messages");return}const a=new FormData(e),n=["company","role","custom"].includes(a.get("type"))?String(a.get("type")):"custom",i=Ce({id:crypto.randomUUID(),company_id:t,title:String(a.get("title")||"").trim()||"New group chat",type:n,created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=Ps(a,i,n);!o.some(d=>d.target_type==="profile"&&d.target_id===b().profile.id)&&n!=="company"&&o.push(se({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:i.id,target_type:"profile",target_id:b().profile.id})),await ls(i,o)&&(s.selectedConversationId=i.id,s.modal="",J("message.group","Group chat created",`${H()} created ${i.title}.`,m("messages",{conversation:i.id},t),"message_conversation",i.id,t,Vt(i)),q(m("messages",{conversation:i.id},t),{replace:!0}))}async function Qu(e){const t=u();if(!y("messages.send",t,"Your role cannot start direct messages.","Messages"))return;const a=new FormData(e),n=String(a.get("profile_id")||"").trim();if(!n){h("Choose a person first.","local","Messages");return}const i=Ce({id:crypto.randomUUID(),company_id:t,title:Je(n),type:"direct",created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=[se({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:i.id,target_type:"profile",target_id:b().profile.id}),se({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:i.id,target_type:"profile",target_id:n})];if(!await ls(i,o))return;s.selectedConversationId=i.id,s.modal="";const d=String(a.get("body")||"").trim();d&&await Hr(i,d,[]),J("message.direct","Direct message started",`${H()} started a direct message with ${i.title}.`,m("messages",{conversation:i.id},t),"message_conversation",i.id,t,[n]),q(m("messages",{conversation:i.id},t),{replace:!0})}async function Vu(e){const t=u();if(!$("messages.manage_groups",t)&&!$("messages.manage",t)){h("Your role cannot manage chat access.","local","Messages");return}const a=s.messageConversations.find(f=>f.id===e.dataset.conversationId);if(!a)return;const n=new FormData(e),i=Ce({...a,title:String(n.get("title")||"").trim()||a.title,type:Kn.includes(n.get("type"))?String(n.get("type")):a.type,updated_at:new Date().toISOString()}),o=Ps(n,i,i.type);i.type!=="company"&&!o.some(f=>f.target_type==="profile"&&f.target_id===b().profile.id)&&o.push(se({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:i.id,target_type:"profile",target_id:b().profile.id}));const l=Vt(a);if(!await ls(i,o,!0))return;const c=Vt(i).filter(f=>!l.includes(f));c.length&&J("message.group","Added to chat",`${H()} added you to ${i.title}.`,m("messages",{conversation:i.id},t),"message_conversation",i.id,t,c),s.modal="",h("Chat access saved.",s.session?.auth==="supabase"?"live":"local","Messages"),p()}async function Bu(e){const t=s.messageConversations.find(o=>o.id===e.dataset.conversationId);if(!t)return;if(!$("messages.send",t.company_id)){h("Your role cannot send messages.","local","Messages");return}const a=new FormData(e),n=String(a.get("body")||"").trim(),i=Array.from(e.elements.attachments?.files||[]);if(!n&&!i.length){h("Type a message or attach a file.","local","Messages");return}if(i.length&&!$("messages.attach_files",t.company_id)){h("Your role cannot attach files.","local","Messages");return}await Hr(t,n,i),e.reset(),p()}async function Yu(e){const t=u(),a=Object.fromEntries(new FormData(e).entries()),n=a.id?ta(String(a.id)):null;if(!n&&!$("calendar.manage",t)){h("Your role cannot create or edit calendar events.","local","Calendar");return}if(n&&!ea(n)){h("This event cannot be edited from Calendar.","local","Calendar");return}const i=String(a.linked_job_id||"").trim(),o=new Date().toISOString();let l=bt({...n||{},id:n?.id||crypto.randomUUID(),company_id:t,title:String(a.title||"").trim()||"Calendar event",description:String(a.description||"").trim(),event_type:za.includes(a.event_type)?String(a.event_type):"Company event",starts_at:Ai(a.starts_at),ends_at:Ai(a.ends_at||a.starts_at),all_day:a.all_day==="on",visibility:a.visibility==="private"?"private":"company",linked_type:i?"job":"",linked_id:i,assigned_profile_id:String(a.assigned_profile_id||""),created_by:n?.created_by||b().profile.id,created_at:n?.created_at||o,updated_at:o});const d=F();if(s.session?.auth==="supabase"&&d){const c=jp(l);n&&delete c.id;const f=n?await d.from("calendar_events").update({...c,updated_at:o}).eq("id",n.id).select().single():await d.from("calendar_events").insert(c).select().single();if(f.error){h(f.error.message||"Calendar event save failed.","local","Calendar");return}l=bt(f.data)}s.calendarEvents=[l].concat(s.calendarEvents.filter(c=>c.id!==l.id)),To(),J("calendar.event",n?"Calendar event updated":"Calendar event created",`${H()} ${n?"updated":"created"} ${l.title}.`,m("calendar",{},t),"calendar_event",l.id,t),s.selectedCalendarEventId=`manual:${l.id}`,s.modal="calendar-event-detail",p()}async function Hu(e){const t=ta(e);if(!t||!ea(t)){h("This event cannot be deleted from Calendar.","local","Calendar");return}const a=F();if(s.session?.auth==="supabase"&&a){const n=await a.from("calendar_events").delete().eq("id",t.id);if(n.error){h(n.error.message||"Calendar event delete failed.","local","Calendar");return}}s.calendarEvents=s.calendarEvents.filter(n=>n.id!==t.id),To(),J("calendar.event","Calendar event deleted",`${H()} deleted ${t.title}.`,m("calendar",{},t.company_id),"calendar_event",t.id,t.company_id),s.selectedCalendarEventId="",s.modal="",p()}async function Hr(e,t,a){const n=new Date().toISOString(),i=Me({id:crypto.randomUUID(),conversation_id:e.id,company_id:e.company_id,sender_profile_id:b().profile.id,body:t,message_type:a.length?"attachment":"text",created_at:n,updated_at:n}),o=F();let l=i;if(s.session?.auth==="supabase"&&o){const f=await o.from("messages").insert(Dp(i)).select().single();if(f.error)return h(f.error.message||"Message send failed.","local","Messages"),null;l=Me(f.data)}s.messages=s.messages.concat(l);const d=await Wu(l,a),c={...e,last_message_at:l.created_at,updated_at:l.created_at};return s.messageConversations=s.messageConversations.map(f=>f.id===e.id?c:f),s.session?.auth==="supabase"&&o&&await o.from("message_conversations").update({last_message_at:l.created_at,updated_at:l.created_at}).eq("id",e.id),pn(e.id,!1),Oo(c,l,d),Ke(),l}async function Wu(e,t){const a=F(),n=[];for(const i of t){const o=crypto.randomUUID(),l=`${e.company_id}/${e.conversation_id}/${o}-${ma(i.name||"attachment")}`;let d="",c="";if(s.session?.auth==="supabase"&&a){const g=await a.storage.from("quest-message-attachments").upload(l,i,{cacheControl:"3600",upsert:!1,contentType:i.type||"application/octet-stream"});if(g.error){h(g.error.message||"Attachment upload failed.","local","Messages");continue}c=l}else i.type?.startsWith("image/")&&i.size<=22e4&&(d=await xo(i));const f=Be({id:o,conversation_id:e.conversation_id,message_id:e.id,company_id:e.company_id,bucket_id:"quest-message-attachments",object_path:c,file_name:i.name||"attachment",mime_type:i.type||"application/octet-stream",size_bytes:i.size||0,preview_url:d,created_at:new Date().toISOString()});if(s.session?.auth==="supabase"&&a){const g=await a.from("message_attachments").insert(Cp(f)).select().single();if(g.error){h(g.error.message||"Attachment record failed.","local","Messages"),c&&await a.storage.from("quest-message-attachments").remove([c]);continue}n.push(Be(g.data))}else n.push(f)}return s.messageAttachments=s.messageAttachments.concat(n),n}async function ls(e,t,a=!1){const n=F();if(s.session?.auth==="supabase"&&n){const i=a?await n.from("message_conversations").update(Ci(e)).eq("id",e.id).select().single():await n.from("message_conversations").insert(Ci(e)).select().single();if(i.error)return h(i.error.message||"Conversation save failed.","local","Messages"),!1;if(await n.from("message_conversation_access").delete().eq("conversation_id",e.id),t.length){const o=await n.from("message_conversation_access").insert(t.map(kp));if(o.error)return h(o.error.message||"Conversation access save failed.","local","Messages"),!1}e=Ce(i.data),s.sync={label:"Quest Supabase live",mode:"live"}}return s.messageConversations=[e].concat(s.messageConversations.filter(i=>i.id!==e.id)),s.messageAccess=t.concat(s.messageAccess.filter(i=>i.conversation_id!==e.id)),pn(e.id,!1),Ke(),!0}async function zu(e){const t=s.messages.find(o=>o.id===e);if(!t)return;if(!(t.sender_profile_id===b().profile.id&&$("messages.delete_own",t.company_id)||$("messages.delete_any",t.company_id))){h("Your role cannot delete this message.","local","Messages");return}const n=new Date().toISOString(),i=F();if(s.session?.auth==="supabase"&&i){const o=await i.from("messages").update({deleted_at:n,updated_at:n}).eq("id",t.id);if(o.error){h(o.error.message||"Message delete failed.","local","Messages");return}}s.messages=s.messages.map(o=>o.id===t.id?{...o,deleted_at:n,updated_at:n}:o),Ke(),p()}async function Ju(e){const t=s.messageAttachments.find(n=>n.id===e);if(!t)return;if(t.preview_url){window.open(t.preview_url,"_blank","noopener,noreferrer");return}const a=F();if(s.session?.auth==="supabase"&&a&&t.object_path){const n=await a.storage.from(t.bucket_id||"quest-message-attachments").createSignedUrl(t.object_path,900,{download:t.file_name});if(!n.error&&n.data?.signedUrl){window.open(n.data.signedUrl,"_blank","noopener,noreferrer");return}}h("This demo attachment is metadata-only.","local","Messages")}function Ku(e){if(e.target.matches("[data-global-search]")){s.query=e.target.value,we();return}if(e.target.matches("[data-file-search]")){s.fileQuery=e.target.value,we();return}if(e.target.matches("[data-form-search]")){s.formQuery=e.target.value,we();return}if(e.target.matches("[data-crm-search]")){s.crmQuery=e.target.value,we();return}if(e.target.matches("[data-account-search]")){s.accountQuery=e.target.value,we();return}if(e.target.matches("[data-deal-search]")){s.dealQuery=e.target.value,we();return}if(e.target.matches("[data-message-search]")){s.messageQuery=e.target.value,we();return}if(e.target.matches("[data-calendar-search]")){s.calendarQuery=e.target.value,we();return}if(e.target.matches("[data-message-access-filter]")){Hp(e.target);return}if(e.target.matches("[data-form-field]")){zo(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Jo(e.target)}function Gu(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||L();Sm(t);return}if(e.target.matches("[data-stage-filter]")){s.stageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-stage-filter]")){s.crmStageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-owner-filter]")){s.crmOwnerFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-status-filter]")){s.taskStatusFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-priority-filter]")){s.taskPriorityFilter=e.target.value||"all",p();return}if(e.target.matches("[data-calendar-type-filter]")){s.calendarTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;q(m("tasks",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-analytics-job-filter]")){const t=e.target.value;q(m("analytics",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-file-category-filter]")){s.fileCategoryFilter=e.target.value||"All categories",p();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=s.route?.jobId||"";q(m("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},u()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;q(m("files",{...t?{folder:"jobs",job_id:t}:{}},u()));return}if(e.target.matches("[data-form-type-filter]")){s.formTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-form-field]")){zo(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Jo(e.target)}async function Zu(e){const t=Fe(Object.fromEntries(new FormData(e).entries()));if(t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||u(),!y("jobs.manage",t.company_id,"Your role can view jobs but cannot create or edit them.","Jobs"))return;t.estimate_total=Number(t.estimate_total||0),t.invoice_total=Number(t.invoice_total||0),t.updated_at=new Date().toISOString();const a=s.jobs.some(i=>i.id===t.id),n=F();if(n){const i=a?await n.from("jobs").update(t).eq("id",t.id).select().single():await n.from("jobs").insert(t).select().single();if(!i.error&&i.data){ka(Fe(i.data)),s.sync={label:"Quest Supabase live",mode:"live"},s.modal="",q(m("jobs",{tab:"profile",job_id:i.data.id},t.company_id),{replace:!0});return}s.sync={label:"Saved locally",mode:"local"}}ka(t),s.modal="",q(m("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function Xu(e){if(!e)return;const t=u();if(!y("jobs.manage",t,"Your role cannot delete jobs.","Jobs"))return;const a=F();a&&await a.from("jobs").delete().eq("id",e),s.jobs=s.jobs.filter(n=>n.id!==e),s.selectedJobId=V(t)[0]?.id||"",s.modal="",ae(),q(m("jobs",{tab:"list"},t),{replace:!0})}async function em(e){const t=u();if(!y("tasks.manage",t,"Your role can view tasks but cannot create or edit them.","Tasks"))return;const a=Object.fromEntries(new FormData(e).entries()),n=gt({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:b().profile.member_id||wt(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),i=en(n.id),o=!!i,l=F();if(l){const d=Pp(n),c=o?await l.from("tasks").update(d).eq("id",n.id).select().single():await l.from("tasks").insert(d).select().single();if(!c.error&&c.data){const f=gt(c.data);hi(f),Mi(f,i),s.sync={label:"Quest Supabase live",mode:"live"},s.modal="",q(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0});return}s.sync={label:"Task saved locally",mode:"local"}}hi(n),Mi(n,i),s.modal="",q(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0})}async function tm(e){if(!e)return;const t=u();if(!y("tasks.manage",t,"Your role cannot delete tasks.","Tasks"))return;const a=F();a&&await a.from("tasks").delete().eq("id",e),s.tasks=s.tasks.filter(n=>n.id!==e),s.selectedTaskId="",s.modal="",ae(),q(m("tasks",{},t),{replace:!0})}async function am(e){const t=u();if(!y("files.manage",t,"Your role can view files but cannot upload.","Files"))return;const a=new FormData(e),n=Object.fromEntries(a.entries()),i=Array.from(e.elements.files?.files||[]),o=String(n.file_name||"").trim(),l=i.length?i:o?[null]:[];if(!l.length){s.sync={label:"Choose a file or enter a file name",mode:"local"},p();return}const d=F();let c=0;for(const f of l){const g=crypto.randomUUID(),D=f?.name||o,U=String(n.folder||"shared"),T=`${t}/${n.job_id?`jobs/${n.job_id}`:U}/${g}-${ma(D)}`;let re=!1;d&&f&&(re=!(await d.storage.from("quest-job-files").upload(T,f,{cacheControl:"3600",upsert:!1,contentType:f.type||"application/octet-stream"})).error);const Re=Ut({id:g,company_id:t,job_id:n.job_id||"",folder:U,file_name:D,mime_type:f?.type||"application/octet-stream",size_bytes:f?.size||Number(n.size_bytes||0),category:n.category||ye(U),notes:n.notes||"",uploaded_by_label:n.uploaded_by_label||b().profile.full_name,bucket_id:"quest-job-files",object_path:re||!f?T:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(d){const Q=await d.from("job_files").insert(xp(Re)).select().single();if(!Q.error&&Q.data){$i(Ut(Q.data)),c+=1;continue}re&&await d.storage.from("quest-job-files").remove([T])}$i(Re)}s.sync=c===l.length?{label:"Quest Supabase live",mode:"live"}:{label:c?"Some files saved locally":"File record saved locally",mode:c?"loading":"local"},J("file.added",l.length>1?"Files added":"File added",`${H()} added ${l.length} file${l.length===1?"":"s"} to ${ye(n.folder||"shared")}.`,m("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),"file",n.job_id||"",t),s.modal="",q(m("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),{replace:!0})}function nm(e){const t=Object.fromEntries(new FormData(e).entries()),a=S(t.company_id||u());if(!y("files.manage",a,"Your role can view files but cannot create folders.","Files"))return;const n=String(t.name||"").trim();if(!n){s.sync={label:"Folder name is required",mode:"local"},p();return}const i=qs({id:`folder-${crypto.randomUUID()}`,company_id:a,name:n,parent_key:t.parent_key||"home",created_by_label:b().profile.full_name||"Quest HQ",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});s.driveFolders.unshift(i),s.modal="",s.sync={label:"Folder created locally",mode:"local"},J("file.folder","Folder created",`${H()} created ${i.name}.`,m("files",{folder:i.id},i.company_id),"folder",i.id,i.company_id),ae(),p()}async function sm(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=N(t.job_id),i=String(t.id||"").trim()?We(String(t.id).trim()):null,o=oa({...t,id:String(t.id||"").trim()||`invoice-${crypto.randomUUID()}`,company_id:a,client_name:String(t.client_name||n?.client_name||"").trim(),total:R(t.subtotal)+R(t.tax),updated_at:new Date().toISOString()});await Ot("finance_invoices",Wr(o),"Invoice save failed")&&(pm(o),i?.job_id&&i.job_id!==o.job_id&&Sn(i.job_id),Sn(o.job_id),s.modal="",s.sync={label:s.session?.auth==="supabase"?"Invoice saved securely":"Finance saved locally",mode:s.session?.auth==="supabase"?"live":"local"},J("finance.invoice",i?"Invoice updated":"Invoice created",`${H()} ${i?"updated":"created"} ${o.invoice_number}.`,m("finance",{invoice:o.id},a),"invoice",o.id,a),q(m("finance",{invoice:o.id},a),{replace:!0}))}async function im(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=We(t.invoice_id);if(!n||n.company_id!==a){s.sync={label:"Create an invoice before recording a payment",mode:"local"},p();return}const i=la({...t,id:`payment-${crypto.randomUUID()}`,company_id:a,created_at:new Date().toISOString()});!await Ot("finance_payments",lm(i),"Payment save failed")||(n.status=ve(n.id)-i.amount<=0?"Paid":"Partially paid",n.updated_at=new Date().toISOString(),!await Ot("finance_invoices",Wr(n),"Invoice status update failed"))||(s.financePayments.unshift(i),Sn(n.job_id),ae(),s.modal="",s.sync={label:s.session?.auth==="supabase"?"Payment recorded securely":"Payment recorded locally",mode:s.session?.auth==="supabase"?"live":"local"},J("finance.payment","Payment recorded",`${H()} recorded ${C(i.amount)} for ${n.invoice_number}.`,m("finance",{invoice:i.invoice_id},a),"payment",i.id,a),q(m("finance",i.invoice_id?{invoice:i.invoice_id}:{},a),{replace:!0}))}async function rm(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=ca({...t,id:String(t.id||"").trim()||`expense-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});await Ot("finance_expenses",cm(n),"Expense save failed")&&(fm(n),s.modal="",s.sync={label:s.session?.auth==="supabase"?"Expense saved securely":"Expense saved locally",mode:s.session?.auth==="supabase"?"live":"local"},J("finance.expense","Expense saved",`${H()} saved a ${C(n.amount)} ${n.category} expense.`,m("finance",{expense:n.id},a),"expense",n.id,a),q(m("finance",{expense:n.id},a),{replace:!0}))}async function om(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=da({...t,id:String(t.id||"").trim()||`vendor-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});await Ot("finance_vendors",dm(n),"Vendor save failed")&&(gm(n),s.modal="",s.sync={label:s.session?.auth==="supabase"?"Vendor saved securely":"Vendor saved locally",mode:s.session?.auth==="supabase"?"live":"local"},J("finance.vendor","Vendor saved",`${H()} saved vendor ${n.name}.`,m("finance",{vendor:n.id},a),"vendor",n.id,a),q(m("finance",{vendor:n.id},a),{replace:!0}))}async function Ot(e,t,a){if(s.session?.auth!=="supabase")return!0;const n=F();if(!n)return s.sync={label:"Supabase is unavailable",mode:"local"},p(),!1;if(!$("finance.manage",t.company_id))return s.sync={label:"Your role cannot manage finance records",mode:"local"},p(),!1;const i=await n.from(e).upsert(t,{onConflict:"id"}).select().single();return i.error?(s.sync={label:i.error.message||a,mode:"local"},h(i.error.message||a,"local","Finance"),p(),!1):!0}function Wr(e){return{id:e.id,company_id:e.company_id,job_id:e.job_id||null,client_name:e.client_name,invoice_number:e.invoice_number,status:e.status,issue_date:e.issue_date||null,due_date:e.due_date||null,subtotal:R(e.subtotal),tax:R(e.tax),total:R(e.total),notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function lm(e){return{id:e.id,company_id:e.company_id,invoice_id:e.invoice_id,amount:R(e.amount),method:e.method,received_at:e.received_at||null,reference:e.reference||"",notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function cm(e){return{id:e.id,company_id:e.company_id,job_id:e.job_id||null,vendor_id:e.vendor_id||null,category:e.category,amount:R(e.amount),status:e.status,spent_at:e.spent_at||null,notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function dm(e){return{id:e.id,company_id:e.company_id,name:e.name,contact_name:e.contact_name||"",email:e.email||"",phone:e.phone||"",category:e.category,status:e.status,notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}async function um(e){const t=s.files.find(i=>i.id===e);if(t&&!y("files.view",t.company_id,"Your role cannot view this file.","Files"))return;if(!t?.object_path){s.sync={label:"No stored object for this file",mode:"local"},p();return}const a=F();if(!a)return;const n=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(n.error||!n.data?.signedUrl){s.sync={label:"Download failed",mode:"local"},p();return}window.open(n.data.signedUrl,"_blank","noopener,noreferrer")}async function mm(e){const t=s.files.find(n=>n.id===e);if(!t||!y("files.manage",t.company_id,"Your role cannot delete files.","Files"))return;const a=F();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),s.files=s.files.filter(n=>n.id!==e),s.selectedFileId="",s.modal="",ae(),p()}function ka(e){const t=s.jobs.findIndex(a=>a.id===e.id);t>=0?s.jobs[t]=e:s.jobs.unshift(e),s.selectedJobId=e.id,ae()}function hi(e){const t=s.tasks.findIndex(a=>a.id===e.id);t>=0?s.tasks[t]=e:s.tasks.unshift(e),s.selectedTaskId=e.id,ae()}function $i(e){const t=s.files.findIndex(a=>a.id===e.id);t>=0?s.files[t]=e:s.files.unshift(e),ae()}function pm(e){const t=s.financeInvoices.findIndex(a=>a.id===e.id);t>=0?s.financeInvoices[t]=e:s.financeInvoices.unshift(e),ae()}function fm(e){const t=s.financeExpenses.findIndex(a=>a.id===e.id);t>=0?s.financeExpenses[t]=e:s.financeExpenses.unshift(e),ae()}function gm(e){const t=s.financeVendors.findIndex(a=>a.id===e.id);t>=0?s.financeVendors[t]=e:s.financeVendors.unshift(e),ae()}function Da(e){const t=s.memberships.findIndex(a=>a.company_id===e.company_id&&a.profile_id===e.profile_id);t>=0?s.memberships[t]=e:s.memberships.unshift(e),ae()}function wi(e){s.roleAssignments=s.roleAssignments.filter(t=>t.company_id!==e.company_id||t.profile_id!==e.profile_id),e.role_id&&s.roleAssignments.unshift(e)}function Sn(e){if(!e)return;const t=N(e);t&&(t.invoice_total=X(De(t.company_id).filter(a=>a.job_id===e),"total"),t.updated_at=new Date().toISOString(),ka(t))}function we(){const e=document.getElementById("workspace");e&&(Jr(s.route),e.innerHTML=Ar(s.route))}function Xt(){const e=cs(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/")return{name:"home",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:u(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const n=a[2]||"home";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:n,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:u(),jobId:t.get("job_id")||""}}function bm(){const e=cs(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||ha(t.get("job_id")||t.get("project_id"))||localStorage.getItem(Ie)||L(),n=Object.fromEntries(Object.entries(rl).map(([l,d])=>[l,m(d,{},a)]));Object.assign(n,{"/index.html":"/","/command.html":m("home",{},a),"/login.html":"/login"});let i=n[e];if(e==="/jobs"){const l=t.get("tab");l==="tasks"?i=m("tasks",ue(t,["job_id","task_id","new","edit"]),a):l==="files"?i=m("files",ue(t,["job_id","folder"]),a):l==="forms"?i=m("forms",ue(t,["job_id"]),a):l==="analytics"?i=m("analytics",ue(t,["job_id"]),a):i=m("jobs",ue(t,["job_id","tab"]),a)}if(e==="/files"&&(i=m("files",ue(t,["job_id","folder"]),a)),e==="/forms"&&(i=m("forms",ue(t,["job_id"]),a)),e==="/analytics"&&(i=m("analytics",ue(t,["job_id"]),a)),e==="/crm"&&(i=m("crm",ue(t,["account"]),a)),e==="/finance"&&(i=m("finance",ue(t,["invoice","expense","vendor","report"]),a)),e==="/messages"&&(i=m("messages",ue(t,["conversation"]),a)),e==="/calendar"&&(i=m("calendar",{},a)),e==="/admin"&&(i=m("settings",{},a)),e==="/time"&&(i=m("time",{},a)),e==="/team"&&(i=m("team-chart",{},a)),e==="/team-chart"&&(i=m("team-chart",{},a)),e==="/approvals"&&(i=m("approvals",{},a)),e==="/clock"&&(i=m("clock",{},a)),e==="/task-management.html"){const l=t.get("project_id")||t.get("job_id")||"";i=m("tasks",l?{job_id:l}:{},ha(l)||a)}const o=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(o){const l=decodeURIComponent(o[1]);i=m("tasks",{job_id:l},ha(l)||a)}i&&window.history.replaceState({},"",_(i))}function _m(e){if(e.name!=="company")return"";if(e.section==="home"&&/^\/company\/[^/]+\/?$/.test(e.path))return m("home",{},e.companyId);const t=ze();if(s.session?.auth==="supabase"&&!t.length)return null;if(!t.includes(e.companyId))return s.session?.auth==="supabase"?"":m(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||L());if(!ht.map(i=>i.id).includes(e.section))return m("home",{},e.companyId);const n=e.jobId?ha(e.jobId):"";return n&&n!==e.companyId&&t.includes(n)?m(e.section,Object.fromEntries(e.params.entries()),n):""}function cs(){let e=window.location.pathname||"/";return tt&&e.startsWith(tt)&&(e=e.slice(tt.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function _(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),n=t.startsWith("/")?t:"/"+t;return`${tt}${n}${a?`?${a}`:""}`||"/"}function q(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(tt+"/")||tt===""&&e.startsWith("/")?e:_(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),p()}function vm(){return`${cs()}${window.location.search}`}function Xa(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?_(m("jobs",{},L())):`${t.pathname}${t.search}`}catch{return _(m("jobs",{},L()))}}function m(e="jobs",t={},a=u()){const n=new URLSearchParams(t);for(const[i,o]of[...n.entries()])(o==null||o==="")&&n.delete(i);return`/company/${encodeURIComponent(S(a||L()))}/${e}${n.toString()?`?${n.toString()}`:""}`}function ym(e){return e.name==="home"?"Quest HQ":e.name==="company"?O(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":O(e.name||"Workspace")}function zr(e,t){const[a]=t.split("?"),n=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!n||e.name!=="company"?!1:e.companyId===decodeURIComponent(n[1])&&e.section===n[2]}function hm(e){return sr.includes(e)?e:"pipeline"}function $m(e){return{pipeline:"Pipeline",list:"List",profile:"Profile"}[e]||e}function wm(e){const t=e.companyId||s.activeCompanyId||L(),a=ze();s.activeCompanyId=a.includes(t)?t:a[0]||L(),localStorage.setItem(Ie,s.activeCompanyId),is(s.activeCompanyId)}function Jr(e){const t=u();e.jobId&&V(t).some(n=>n.id===e.jobId)&&(s.selectedJobId=e.jobId),(!s.selectedJobId||!V(t).some(n=>n.id===s.selectedJobId))&&(s.selectedJobId=V(t)[0]?.id||"");const a=e.params.get("task_id");a&&G(t).some(n=>n.id===a)&&(s.selectedTaskId=a),e.section!=="tasks"&&(s.selectedTaskId=""),s.driveFolder=e.params.get("folder")||"home"}function Sm(e){const t=ze(),a=S(e),n=t.includes(a)?a:t[0]||L();s.activeCompanyId=n,localStorage.setItem(Ie,n),is(n),km();const i=s.route||Xt(),o=i.name==="company"?i.section:"jobs";q(m(o,{},n))}function km(){s.modal="",s.selectedJobId="",s.selectedTaskId="",s.selectedFileId="",s.selectedFormId="",s.selectedQuestionId="",s.selectedFinanceInvoiceId="",s.selectedFinanceExpenseId="",s.selectedFinanceVendorId="",s.selectedCalendarEventId="",s.query="",s.fileQuery="",s.formQuery="",s.crmQuery="",s.contactQuery="",s.selectedContactId="",s.contactStageFilter="all",s.dealQuery="",s.selectedDealId="",s.stageFilterDeals="all",s.accountQuery="",s.selectedAccountId="",s.accountTypeFilter="all",s.accountTab="overview",s.stageFilter="all",s.crmStageFilter="all",s.crmOwnerFilter="all",s.taskStatusFilter="all",s.taskPriorityFilter="all",s.calendarQuery="",s.calendarTypeFilter="all",s.calendarScope="company",s.fileCategoryFilter="All categories",s.formTypeFilter="all",s.formsTab="library",s.driveFolder="home"}function Dm(e){const t=N(e);t&&(s.selectedJobId=e,q(m("jobs",{tab:"profile",job_id:e},t.company_id)))}function Cm(e){const t=en(e);t&&(s.selectedTaskId=e,q(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function Le(){return N(s.selectedJobId)||V(u())[0]||null}function N(e){return s.jobs.find(t=>t.id===e)||null}function en(e){return s.tasks.find(t=>t.id===e)||null}function V(e=u()){return s.jobs.filter(t=>t.company_id===e)}function G(e=u()){return s.tasks.filter(t=>t.company_id===e)}function Kr(e=u()){const t=b().profile.id;return s.notifications.filter(a=>a.company_id===e&&a.recipient_profile_id===t).sort((a,n)=>Date.parse(n.created_at||0)-Date.parse(a.created_at||0))}function Ye(e=u()){const t=s.messageQuery.trim().toLowerCase(),a=s.messageFilter||"all";return s.messageConversations.filter(n=>n.company_id===e&&Am(n)).filter(n=>a==="all"||n.type===a||a==="unread"&&lt(n.id)>0).filter(n=>{if(!t)return!0;const i=Ee(n.id).some(o=>o.body.toLowerCase().includes(t));return n.title.toLowerCase().includes(t)||i}).sort((n,i)=>Date.parse(i.last_message_at||i.updated_at||i.created_at||0)-Date.parse(n.last_message_at||n.updated_at||n.created_at||0))}function ds(e=u()){return Ye(e).reduce((t,a)=>t+lt(a.id),0)}function Gr(e=u()){const t=Ye(e),n=s.route?.params?.get("conversation")||""||s.selectedConversationId;return t.find(i=>i.id===n)||t[0]||null}function Ee(e){return s.messages.filter(t=>t.conversation_id===e&&!t.deleted_at).sort((t,a)=>Date.parse(t.created_at||0)-Date.parse(a.created_at||0))}function tn(e){return s.messageAttachments.filter(t=>t.conversation_id===e)}function Zr(e){return s.messageAttachments.filter(t=>t.message_id===e)}function an(e){return s.messageAccess.filter(t=>t.conversation_id===e)}function jm(e,t=b().profile.id){return s.messageReads.find(a=>a.conversation_id===e&&a.profile_id===t)||null}function lt(e,t=b().profile.id){const a=Date.parse(jm(e,t)?.last_read_at||0);return Ee(e).filter(n=>n.sender_profile_id!==t&&Date.parse(n.created_at||0)>a).length}function Am(e){if(!e||!$("messages.view",e.company_id))return!1;const t=b().profile,a=an(e.id);if(e.type==="company"||a.some(o=>o.target_type==="all_company"))return!0;const n=new Set([t.id,t.member_id,t.email].filter(Boolean).map(String));if(a.some(o=>o.target_type==="profile"&&n.has(o.target_id)))return!0;const i=[xt(e.company_id,mt(e.company_id)),...s.roleAssignments.filter(o=>o.company_id===e.company_id&&o.profile_id===t.id).map(o=>o.role_id)];return a.some(o=>o.target_type==="role"&&i.includes(o.target_id))}function nn(e=u()){const t=s.calendarEvents.filter(d=>d.company_id===e&&Om(d)).map(Fm),a=G(e).filter(d=>d.due&&d.status!=="done").filter(d=>$("calendar.view_team",e)||eo(d.assignee_id)||d.creator_id===b().profile.member_id).map(Mm),n=$("finance.view",e)?De(e).filter(d=>d.due_date&&ve(d.id)>0).map(Im):[],i=ys(e).filter(d=>d.type!=="Access request"||$("users.manage",e)).map(d=>Em(d,e)),o=sa(e),l=o&&($("calendar.view_team",e)||sn(o.user_id))?[Tm(o)]:[];return t.concat(a,n,i,l).sort((d,c)=>Date.parse(d.startsAt||0)-Date.parse(c.startsAt||0))}function qm(e=u()){const t=s.calendarQuery.trim().toLowerCase();return nn(e).filter(a=>s.calendarScope==="company"||a.mine).filter(a=>s.calendarTypeFilter==="all"||a.type===s.calendarTypeFilter).filter(a=>t?[a.title,a.description,a.type,a.owner,a.linkLabel].some(n=>String(n||"").toLowerCase().includes(t)):!0).filter(a=>s.calendarView==="list"||Um(a))}function Xr(e=u()){const t=Date.now();return nn(e).filter(a=>Date.parse(a.endsAt||a.startsAt||0)>=t).slice(0,9)}function Fm(e){const t=e.linked_type==="job"?N(e.linked_id):null;return{id:`manual:${e.id}`,source:"manual",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description,type:e.event_type,startsAt:e.starts_at,endsAt:e.ends_at||e.starts_at,allDay:e.all_day,dateKey:to(e.starts_at),owner:Rm(e.assigned_profile_id||e.created_by),mine:sn(e.assigned_profile_id)||e.created_by===b().profile.id,href:Pm(e),linkLabel:t?.name||"",editable:ea(e)}}function Mm(e){const t=e.due_time?`${e.due}T${e.due_time}:00`:`${e.due}T12:00:00`;return{id:`task:${e.id}`,source:"task",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description||Ge(e.type),type:"Task due",startsAt:t,endsAt:t,allDay:!e.due_time,dateKey:e.due,owner:W(e.assignee_id),mine:eo(e.assignee_id),href:m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),linkLabel:N(e.project_id)?.name||"Company task",editable:!1}}function Im(e){return{id:`invoice:${e.id}`,source:"invoice",sourceId:e.id,companyId:e.company_id,title:`${e.invoice_number} due`,description:`${C(ve(e.id))} outstanding for ${e.client_name||"client"}.`,type:"Invoice due",startsAt:`${e.due_date}T12:00:00`,endsAt:`${e.due_date}T12:00:00`,allDay:!0,dateKey:e.due_date,owner:e.client_name||"Finance",mine:$("finance.view",e.company_id),href:m("finance",{invoice:e.id},e.company_id),linkLabel:e.client_name||"Finance",editable:!1}}function Em(e,t=u()){const a=String(e.updatedAt||j(0)).slice(0,10);return{id:`approval:${e.id}`,source:"approval",sourceId:e.id,companyId:t,title:e.title,description:e.meta,type:"Approval",startsAt:`${a}T12:00:00`,endsAt:`${a}T12:00:00`,allDay:!0,dateKey:a,owner:e.owner,mine:!0,href:e.href,linkLabel:e.status,editable:!1}}function Tm(e){const t=to(e.started_at);return{id:`timer:${e.id}`,source:"timer",sourceId:e.id,companyId:e.company_id,title:e.task_title||"Active timer",description:"Current clock session.",type:"Time",startsAt:e.started_at,endsAt:new Date().toISOString(),allDay:!1,dateKey:t,owner:W(e.user_id),mine:sn(e.user_id),href:m("time",{},e.company_id),linkLabel:"My time",editable:!1}}function Om(e){return!e||!$("calendar.view",e.company_id)?!1:e.visibility!=="private"?!0:$("calendar.view_team",e.company_id)||ea(e)||sn(e.assigned_profile_id)}function ea(e){return e?$("calendar.manage",e.company_id)||e.created_by===b().profile.id:!1}function Pm(e){return e.linked_type==="job"&&e.linked_id&&$("jobs.view",e.company_id)?m("jobs",{tab:"profile",job_id:e.linked_id},e.company_id):e.linked_type==="task"&&e.linked_id&&$("tasks.view",e.company_id)?m("tasks",{task_id:e.linked_id},e.company_id):e.linked_type==="form"&&e.linked_id&&$("forms.view",e.company_id)?m("forms",{form_id:e.linked_id},e.company_id):e.linked_type==="invoice"&&e.linked_id&&$("finance.view",e.company_id)?m("finance",{invoice:e.linked_id},e.company_id):""}function xm(e,t=u()){return nn(t).find(a=>a.id===e)||null}function ta(e){return s.calendarEvents.find(t=>t.id===e)||null}function eo(e){return String(e||"")===String(b().profile.member_id||b().profile.id||"")}function sn(e){const t=b().profile;return[t.id,t.member_id,t.email].filter(Boolean).map(String).includes(String(e||""))}function Rm(e){return e?He(e)?.full_name||W(e)||String(e):"Unassigned"}function to(e){if(!e)return j(0);const t=new Date(e);return Number.isNaN(t.getTime())?String(e).slice(0,10):t.toISOString().slice(0,10)}function ao(e,t){return e.filter(a=>a.dateKey===t).sort((a,n)=>Date.parse(a.startsAt||0)-Date.parse(n.startsAt||0))}function Nm(e){const t=us(new Date),a=new Date(t);return a.setDate(t.getDate()+7),e.filter(n=>{const i=Date.parse(n.startsAt||n.dateKey||0);return i>=t.getTime()&&i<a.getTime()})}function Um(e){const t=new Date(`${e.dateKey}T00:00:00`);if(s.calendarView==="month"){const i=new Date(`${s.calendarCursorDate}T00:00:00`);return t.getFullYear()===i.getFullYear()&&t.getMonth()===i.getMonth()}const a=us(new Date(`${s.calendarCursorDate}T00:00:00`)),n=new Date(a);return n.setDate(a.getDate()+7),t>=a&&t<n}function Lm(e){const t=new Date(`${e}T00:00:00`),a=new Date(t.getFullYear(),t.getMonth(),1),n=new Date(a);return n.setDate(a.getDate()-a.getDay()),Array.from({length:42},(i,o)=>{const l=new Date(n);return l.setDate(n.getDate()+o),{key:ms(l),label:String(l.getDate()),month:l.getMonth()}})}function no(e){const t=us(new Date(`${e}T00:00:00`));return Array.from({length:7},(a,n)=>{const i=new Date(t);return i.setDate(t.getDate()+n),{key:ms(i),name:new Intl.DateTimeFormat("en-US",{weekday:"short"}).format(i),shortDate:new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(i)}})}function Qm(){const e=new Date(`${s.calendarCursorDate}T00:00:00`);if(s.calendarView==="month")return new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(e);if(s.calendarView==="week"){const t=no(s.calendarCursorDate);return`${P(t[0].key)} - ${P(t[6].key)}`}return"Upcoming"}function us(e){const t=new Date(e);return t.setHours(0,0,0,0),t.setDate(t.getDate()-t.getDay()),t}function ms(e){const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${n}`}function Si(e){const t=new Date(`${s.calendarCursorDate}T00:00:00`);s.calendarView==="month"?t.setMonth(t.getMonth()+e):t.setDate(t.getDate()+e*7),s.calendarCursorDate=ms(t)}function Vm(e){return e.reduce((t,a)=>(t[a.dateKey]=t[a.dateKey]||[],t[a.dateKey].push(a),t),{})}function so(e){if(e.allDay)return"All day";const t=new Date(e.startsAt);return Number.isNaN(t.getTime())?"Timed":new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(t)}function Bm(e){return`calendar-type-${ma(e||"event")}`}function Ym(e){return e==="Task due"?"ti-list-check":e==="Invoice due"?"ti-file-dollar":e==="Approval"?"ti-user-check":e==="Time"?"ti-clock":e.includes("Install")?"ti-hammer":e.includes("Estimate")?"ti-calendar-dollar":e.includes("Personal")?"ti-user":"ti-calendar-event"}function ke(e=u()){return s.files.filter(t=>t.company_id===e)}function Pt(e=u()){return s.driveFolders.filter(t=>t.company_id===e)}function wt(e=u()){return s.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function ie(e=u()){const t=new Map;wt(e).forEach(n=>{t.set(n.id,{profile_id:"",member_id:n.id,name:n.full_name||n.name,email:n.email,avatar_url:n.avatar_url,role:Ca(e,n.id).toLowerCase(),role_label:Ca(e,n.id),role_id:"",status:n.active?"active":"disabled"})}),s.memberships.filter(n=>n.company_id===e).forEach(n=>{const i=He(n.profile_id),o=n.member_id?s.teamMembers.find(f=>f.id===n.member_id):null,l=s.roleAssignments.find(f=>f.company_id===e&&f.profile_id===n.profile_id),d=l?St(e,l.role_id):null,c=n.profile_id||n.member_id;t.set(c,{profile_id:n.profile_id,member_id:n.member_id,name:i?.full_name||o?.full_name||i?.email||o?.name||c||"User",email:i?.email||o?.email||"",avatar_url:i?.avatar_url||o?.avatar_url||"",role:n.role,role_label:d?.name||O(n.role),role_id:l?.role_id||xt(e,n.role),status:n.status||"active"})});const a=b().profile;if(s.session?.auth==="supabase"&&a?.id&&!t.has(a.id)){const n=ce(e,a.id);n&&t.set(a.id,{profile_id:a.id,member_id:a.member_id||"",name:a.full_name||a.email,email:a.email,avatar_url:a.avatar_url,role:n.role,role_label:O(n.role),role_id:xt(e,n.role),status:n.status||"active"})}return[...t.values()].sort((n,i)=>(n.status==="active"?0:1)-(i.status==="active"?0:1)||n.name.localeCompare(i.name))}function Hm(e=u()){return s.companyInvites.filter(t=>t.company_id===e&&t.status==="pending").sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function io(e=u()){return s.auditEvents.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function Wm(e){const t=He(e.actor_profile_id),a=t?.full_name||t?.email||tl(e.actor_profile_id||"system");return`
    <article class="access-audit-row">
      ${ee({full_name:a,email:t?.email||""},"avatar small")}
      <span>
        <strong>${r(O(String(e.event_type||"access.event").replace(/[._-]+/g," ")))}</strong>
        <small>${r(a)} / ${P(e.created_at)}</small>
      </span>
    </article>
  `}function be(e=u()){const t=s.roles.filter(a=>a.company_id===e);return t.length?t.sort((a,n)=>n.priority-a.priority||a.name.localeCompare(n.name)):[at({id:`owner-${e}`,company_id:e,name:"Owner",color:"#f0b23b",priority:1e3,is_system:!0}),at({id:`admin-${e}`,company_id:e,name:"Admin",color:"#60a5fa",priority:800,is_system:!0}),at({id:`staff-${e}`,company_id:e,name:"Staff",color:"#15803d",priority:100,is_system:!0})]}function St(e,t){return be(e).find(a=>a.id===t)||null}function rn(e=u()){return!s.rolePreview||s.rolePreview.company_id!==e?null:St(e,s.rolePreview.role_id)}function kn(e,t){if(!t)return!0;const a=String(e?.name||"").toLowerCase();if(["owner","admin","developer"].includes(a))return!0;const n=ps(t),i=s.rolePermissions.filter(d=>d.role_id===e?.id);if(i.some(d=>(n.includes(d.permission_key)||d.permission_key==="*")&&d.effect==="deny"))return!1;if(i.some(d=>(n.includes(d.permission_key)||d.permission_key==="*")&&d.effect==="allow"))return!0;if(i.length)return!1;const o=fs(e),l=rt[o]||rt.member;return l.includes("*")||n.some(d=>l.includes(d))}function ps(e){return K([e,...sl[e]||[]])}function xt(e,t){const a=String(t||"").toLowerCase();return be(e).find(n=>n.name.toLowerCase()===a||n.id.toLowerCase()===a)?.id||""}function zm(e=u()){const t=be(e).filter(a=>a.name.toLowerCase()!=="owner");return t.find(a=>a.name.toLowerCase()==="staff")?.id||t.find(a=>a.name.toLowerCase()==="member")?.id||t[0]?.id||""}function Jm(){const e=new Uint8Array(8);return crypto.getRandomValues(e),`QH-${Array.from(e,t=>t.toString(36).padStart(2,"0")).join("").toUpperCase()}`}function Km(e){const t=new URL(_("/login"),window.location.origin);return t.searchParams.set("invite",e.token),t.toString()}function fs(e){const t=String(e?.name||"").toLowerCase().replace(/\s+/g,"_");return["owner","member","worker","sales","supervisor","admin","developer","construction_supervisor"].includes(t)?t:"member"}function He(e){return s.profiles.find(t=>t.id===e)||(b().profile.id===e?b().profile:null)}function ro(e=u(),t=!1){const a=s.query.trim().toLowerCase();return V(e).filter(n=>!t&&s.stageFilter!=="all"&&n.stage!==s.stageFilter?!1:a?[n.name,n.client_name,n.contact_name,n.owner_name,n.site_address,n.job_type,x(n.company_id)].some(i=>String(i||"").toLowerCase().includes(a)):!0)}function kt(e=u()){return s.contacts.filter(t=>t.company_id===e)}function oo(e=u(),t=!1){const a=s.contactQuery.trim().toLowerCase();return kt(e).filter(n=>!t&&s.contactStageFilter!=="all"&&n.stage!==s.contactStageFilter?!1:a?[n.name,n.phone,n.email,n.location,n.owner_name,n.stage].some(i=>String(i||"").toLowerCase().includes(a)):!0)}function ct(e){return s.contacts.find(t=>t.id===e)||null}function Gm(){return ct(s.selectedContactId)}function gs(){k(Mn,s.contacts)}function Dn(e){const t=s.contacts.findIndex(a=>a.id===e.id);t>=0?s.contacts[t]=e:s.contacts.push(e),gs()}function ki(e,t,a){if(!["contacts","jobs","deals"].includes(e))return;e==="contacts"?s.contactStageFilter=t:e==="deals"?s.stageFilterDeals=t:s.stageFilter=t;const n=s.route,i=n?.name==="company"&&n.section===e;a||!i?q(m(e,{},u())):p()}function aa(e=u()){return s.accounts.filter(t=>t.company_id===e)}function Qe(e){return e&&s.accounts.find(t=>t.id===e)||null}function bs(e){return Qe(e)?.name||""}function Zm(){return Qe(s.selectedAccountId)}function Xm(e=u()){const t=s.accountQuery.trim().toLowerCase();return aa(e).filter(a=>s.accountTypeFilter!=="all"&&a.type!==s.accountTypeFilter?!1:t?[a.name,a.industry,a.email,a.phone,a.owner_name,a.address].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function Dt(e=u()){return s.deals.filter(t=>t.company_id===e)}function na(e){return e&&s.deals.find(t=>t.id===e)||null}function ep(){return na(s.selectedDealId)}function lo(e=u(),t=!1){const a=s.dealQuery.trim().toLowerCase();return Dt(e).filter(n=>!t&&s.stageFilterDeals!=="all"&&n.stage!==s.stageFilterDeals?!1:a?[n.name,n.owner_name,n.source,n.stage,bs(n.account_id),ct(n.primary_contact_id)?.name].some(i=>String(i||"").toLowerCase().includes(a)):!0)}function co(e){return s.deals.filter(t=>t.account_id===e)}function uo(e){return s.contacts.filter(t=>t.account_id===e)}function tp(e){return s.jobs.filter(t=>t.account_id===e)}function ap(e,t){return t?s.activities.filter(a=>a.related_type===e&&a.related_id===t).sort((a,n)=>Date.parse(n.created_at||0)-Date.parse(a.created_at||0)):[]}function mo(e){return e?s.activities.filter(t=>t.account_id===e||t.related_type==="account"&&t.related_id===e).sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0)):[]}function po(){k(In,s.accounts)}function fo(){k(xa,s.deals)}function go(){k(En,s.activities)}function np(e){const t=s.accounts.findIndex(a=>a.id===e.id);t>=0?s.accounts[t]=e:s.accounts.push(e),po()}function bo(e){const t=s.deals.findIndex(a=>a.id===e.id);t>=0?s.deals[t]=e:s.deals.push(e),fo()}function sp(e){const t=s.activities.findIndex(a=>a.id===e.id);t>=0?s.activities[t]=e:s.activities.unshift(e),go()}function Ve(e,t){const a={};return t.forEach(n=>{e[n]!==void 0&&(a[n]=e[n])}),a}async function dt(e,t,{onConflict:a="id"}={}){const n=F();if(!n)return{ok:!1,data:null,error:null};try{const i=await n.from(e).upsert(t,{onConflict:a}).select().single();return!i.error&&i.data?{ok:!0,data:i.data,error:null}:(i.error&&console.warn(`${e} write rejected:`,i.error.message||i.error,i.error.details||""),{ok:!1,data:null,error:i.error})}catch(i){return console.warn(`${e} save sync failed`,i),{ok:!1,data:null,error:i}}}async function _s(e,t){const a=F();if(a)try{await a.from(e).delete().eq("id",t)}catch(n){console.warn(`${e} delete sync failed`,n)}}const ip=["id","company_id","name","type","industry","website","phone","email","address","owner_name","status","notes","updated_at"],_o=["id","company_id","account_id","primary_contact_id","name","stage","status","value","probability","close_date","owner_name","source","job_id","notes","updated_at"],rp=["id","company_id","type","subject","body","related_type","related_id","account_id","due_at","completed_at","owner_name","updated_at"],vo=["id","company_id","name","phone","email","location","stage","value","owner_name","account_id","title","source","last_activity_at","notes","updated_at"];function ut(e,t){return t.forEach(a=>{e[a]===""&&(e[a]=null)}),e}async function op(e){const t=Nt(Object.fromEntries(new FormData(e).entries()));t.id=t.id||`account-${crypto.randomUUID()}`,t.updated_at=new Date().toISOString();const{ok:a,data:n}=await dt("accounts",Ve(t,ip));np(a&&n?Nt(n):t),s.selectedAccountId=t.id,s.modal="",h(`${t.name} saved.`,a?"live":"local","Accounts"),p()}async function lp(e){e&&(await _s("accounts",e),s.accounts=s.accounts.filter(t=>t.id!==e),po(),s.selectedAccountId===e&&(s.selectedAccountId=""),s.modal="",q(m("crm",{},u()),{replace:!0}))}async function cp(e){const t=ft(Object.fromEntries(new FormData(e).entries()));t.id=t.id||`deal-${crypto.randomUUID()}`,/^won/i.test(t.stage)?t.status="won":/^lost/i.test(t.stage)?t.status="lost":t.status!=="open"&&!/^won|^lost/i.test(t.stage)&&(t.status="open"),t.updated_at=new Date().toISOString();const a=na(t.id),n=ut(Ve(t,_o),["account_id","primary_contact_id","close_date","job_id"]),{ok:i,data:o}=await dt("deals",n);bo(i&&o?ft(o):t),a&&a.stage!==t.stage&&vs({type:"stage_change",subject:`Stage → ${t.stage}`,related_type:"deal",related_id:t.id,account_id:t.account_id}),s.selectedDealId=t.id,s.modal="",h(`${t.name} saved.`,i?"live":"local","Deals"),p()}async function dp(e){e&&(await _s("deals",e),s.deals=s.deals.filter(t=>t.id!==e),fo(),s.selectedDealId===e&&(s.selectedDealId=""),s.modal="",q(m("deals",{},u()),{replace:!0}))}async function vs(e){let t=Qe(e.account_id)?e.account_id:"";t||(e.related_type==="account"?t=e.related_id:e.related_type==="deal"?t=na(e.related_id)?.account_id||"":e.related_type==="contact"&&(t=ct(e.related_id)?.account_id||"")),Qe(t)||(t="");const a=qa({...e,id:e.id||`activity-${crypto.randomUUID()}`,company_id:u(),account_id:t,owner_name:e.owner_name||b().profile.full_name||"",completed_at:e.completed_at||(e.type==="note"||e.type==="stage_change"?new Date().toISOString():e.completed_at)});a.updated_at=new Date().toISOString();const n=ut(Ve(a,rp),["account_id","due_at","completed_at"]),{ok:i,data:o}=await dt("activities",n);if(sp(i&&o?qa(o):a),e.related_type==="contact"){const l=ct(e.related_id);if(l){const d={...l,last_activity_at:a.completed_at||a.created_at,updated_at:new Date().toISOString()};Dn(d),dt("contacts",ut(Ve(d,vo),["account_id"]))}}return a}async function up(e){const t=Object.fromEntries(new FormData(e).entries());await vs({type:t.type,subject:t.subject,body:t.body,related_type:t.related_type,related_id:t.related_id,account_id:t.account_id}),s.modal="",h("Activity logged.","local","CRM"),p()}async function mp(e){e&&(await _s("activities",e),s.activities=s.activities.filter(t=>t.id!==e),go(),p())}async function pp(e){const t=na(e);if(!t)return;const a=t.company_id;if(!y("jobs.manage",a,"Your role cannot create jobs.","Jobs"))return;const n=Qe(t.account_id),i=ct(t.primary_contact_id),o=Fe({id:"",company_id:a,name:t.name,client_name:n?.name||"",contact_name:i?.name||"",site_address:n?.address||"",owner_name:t.owner_name,estimate_total:t.value,stage:zt()[0],account_id:t.account_id,deal_id:t.id,scope:t.notes});o.id=crypto.randomUUID(),o.updated_at=new Date().toISOString();const l=Ve(o,["id","company_id","name","client_name","contact_name","site_address","job_type","stage","priority","owner_name","scope","notes","estimate_total","invoice_total","account_id","deal_id","updated_at"]);ut(l,["account_id","deal_id"]);const{ok:d,data:c}=await dt("jobs",l);ka(d&&c?Fe(c):o);const f=$t().find(T=>/win|won/i.test(T))||t.stage,g=ft({...t,status:"won",stage:f,job_id:o.id,updated_at:new Date().toISOString()}),D=await dt("deals",ut(Ve(g,_o),["account_id","primary_contact_id","close_date","job_id"]));bo(g),vs({type:"system",subject:"Deal won → Job created",body:t.name,related_type:"deal",related_id:t.id,account_id:t.account_id}),s.selectedJobId=o.id,s.modal="";const U=d&&D.ok;h("Deal won — job created.",U?"live":"local","Deals"),q(m("jobs",{tab:"profile",job_id:o.id},a))}function yo(e=u()){const t=new Map;return V(e).forEach(a=>{const n=String(a.client_name||"").trim()||"Unassigned customer",i=`account-${ma(n.toLowerCase())}`;t.has(i)||t.set(i,{key:i,name:n,jobs:[]}),t.get(i).jobs.push(a)}),Array.from(t.values()).map(a=>{const n=a.jobs.slice().sort((T,re)=>Date.parse(re.updated_at||re.created_at||0)-Date.parse(T.updated_at||T.created_at||0)),i=n[0]||null,o=n.map(T=>T.id),l=G(e).filter(T=>o.includes(T.project_id)),d=je(e).filter(T=>o.includes(T.linked_job_id)),c=ke(e).filter(T=>o.includes(T.job_id)),f=K(n.map(T=>T.contact_name)),g=K(n.map(T=>T.owner_name)),D=K(n.map(T=>T.site_address)),U=n.map(T=>T.priority||"Medium").sort((T,re)=>vt(re)-vt(T))[0]||"Medium";return{...a,jobs:n,tasks:l,latestJob:i,contacts:f,owners:g,addresses:D,forms:d,files:c,primaryContact:f[0]||"No contact",owner:g[0]||"Unassigned",stage:i?.stage||"Lead",priority:U,estimateTotal:X(n,"estimate_total"),fileCount:c.length,formCount:d.length,updatedAt:i?.updated_at||i?.created_at||new Date().toISOString(),subtitle:D[0]||`${n.length} linked job${n.length===1?"":"s"}`}}).sort((a,n)=>Date.parse(n.updatedAt||0)-Date.parse(a.updatedAt||0))}function fp(e,t){return yo(e).find(a=>a.key===t)||null}function ho(e=u()){const t=b().profile.member_id||"",a=G(e).slice().sort(Cn),n=a.filter(hs),i=n.filter(D=>D.due===j(0)),o=n.filter(D=>Ti(D.due)<0),l=n.filter(D=>{const U=Ti(D.due);return U>=0&&U<=7}),d=n.filter(D=>D.assignee_id===t),c=n.filter(D=>["review","pending"].includes(D.status)),f=a.filter(D=>D.status==="done"),g=K(o.concat(i,d,c,l).map(D=>D.id)).map(D=>a.find(U=>U.id===D)).filter(Boolean).sort(Cn);return{tasks:a,open:n,dueToday:i,overdue:o,thisWeek:l,assignedToMe:d,review:c,done:f,focus:g}}function ys(e=u()){const t=je(e).filter(i=>(i.require_approval||i.type==="Client approval")&&!["Archived","Closed","Approved"].includes(i.status)).map(i=>({id:`form:${i.id}`,title:i.title,meta:N(i.linked_job_id)?.name||i.description||"Company form",type:"Form approval",owner:W(i.creator_id),status:i.status,updatedAt:i.updated_at||i.created_at,href:m("forms",{form_id:i.id},e)})),a=G(e).filter(i=>["review","pending"].includes(i.status)).map(i=>({id:`task:${i.id}`,title:i.title,meta:N(i.project_id)?.name||i.description||"Company task",type:"Task review",owner:W(i.assignee_id),status:qe(i.status),updatedAt:i.updated_at||i.due,href:m("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},e)})),n=s.memberships.filter(i=>i.company_id===e&&i.status!=="active").map(i=>({id:`access:${i.profile_id||i.member_id}`,title:W(i.member_id||i.profile_id),meta:`${O(i.role)} access request`,type:"Access request",owner:"Quest admin",status:O(i.status),updatedAt:new Date().toISOString(),href:m("settings",{tab:"access"},e)}));return t.concat(a,n).sort((i,o)=>Date.parse(o.updatedAt||0)-Date.parse(i.updatedAt||0))}function sa(e=u()){const t=s.activeTimer;return!t||t.company_id!==e?null:t}function $o(e=u()){return s.timeEntries.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.started_at||0)-Date.parse(t.started_at||0))}function Di(e=u(),t=0){return $o(e).filter(a=>Date.parse(a.started_at||0)>=t).reduce((a,n)=>a+R(n.duration_ms),0)}function gp(e=u(),t=""){if(!y("time.track",e,"Your role cannot track time in this workspace.","Time"))return;s.activeTimer&&wo(!1);const a=t?en(t):null;s.activeTimer={id:`timer-${crypto.randomUUID()}`,company_id:e,user_id:b().profile.member_id||b().profile.id,task_id:a?.company_id===e?a.id:"",task_title:a?.company_id===e?a.title:"",started_at:new Date().toISOString()},Eo(),s.sync={label:"Clock started locally",mode:"local"},p()}function wo(e=!0){const t=s.activeTimer;if(!t)return;const a=new Date().toISOString(),n=Math.max(0,Date.parse(a)-Date.parse(t.started_at||a));s.timeEntries.unshift({id:`time-${crypto.randomUUID()}`,company_id:t.company_id,user_id:t.user_id,task_id:t.task_id||"",task_title:t.task_title||"",started_at:t.started_at,ended_at:a,duration_ms:n,notes:t.task_title?"Task timer":"General shift"}),s.activeTimer=null,Eo(),s.sync={label:"Clock stopped locally",mode:"local"},e&&p()}function hs(e){return e.status!=="done"}function Cn(e,t){const a=Date.parse(e.due||0)-Date.parse(t.due||0);return a||vt(t.priority)-vt(e.priority)}function De(e=u()){return s.financeInvoices.filter(t=>t.company_id===e).sort(Ht("updated_at"))}function So(e=u()){return s.financePayments.filter(t=>t.company_id===e)}function $s(e=u()){return s.financeExpenses.filter(t=>t.company_id===e).sort(Ht("updated_at"))}function ws(e=u()){return s.financeVendors.filter(t=>t.company_id===e)}function We(e){return s.financeInvoices.find(t=>t.id===e)||null}function ko(e){return s.financeExpenses.find(t=>t.id===e)||null}function Ss(e){return s.financeVendors.find(t=>t.id===e)||null}function jn(e){return Ss(e)?.name||"No vendor"}function Do(e){return s.financePayments.filter(t=>t.invoice_id===e).sort(Ht("received_at"))}function ks(e){return X(Do(e),"amount")}function ve(e){const t=We(e);return Math.max(0,R(t?.total)-ks(e))}function Co(e){const t=ve(e.id);return t<=0&&R(e.total)>0?"Paid":t<R(e.total)?"Partially paid":e.status==="Sent"&&Xo(e.due_date)>0?"Overdue":e.status}function jo(e=u()){const t=De(e),a=So(e),n=$s(e).filter(d=>["Approved","Paid"].includes(d.status)),i={current:0,thirty:0,sixty:0,overSixty:0};t.forEach(d=>{const c=ve(d.id);if(!c)return;const f=Xo(d.due_date);f<=0?i.current+=c:f<=30?i.thirty+=c:f<=60?i.sixty+=c:i.overSixty+=c});const o=X(a,"amount"),l=X(n,"amount");return{pipeline:X(V(e),"estimate_total"),invoiced:X(t,"total"),collected:o,outstanding:t.reduce((d,c)=>d+ve(c.id),0),expenses:l,net:o-l,aging:i}}function bp(e=u(),t=""){const a=s.query.trim().toLowerCase();return G(e).filter(n=>t&&n.project_id!==t||s.taskStatusFilter!=="all"&&n.status!==s.taskStatusFilter||s.taskPriorityFilter!=="all"&&n.priority!==s.taskPriorityFilter?!1:a?[n.title,n.description,Ge(n.type),W(n.assignee_id),N(n.project_id)?.name].some(i=>String(i||"").toLowerCase().includes(a)):!0)}function Ct(){const e=ze();return s.companies.filter(t=>e.includes(t.id))}function $(e,t=u()){if(!e)return!0;const a=rn(t);if(a)return kn(a,e);const n=ps(e),i=b().profile;if(s.session?.auth==="supabase"){const d=ce(t,i.id);if(!d||d.status!=="active")return!1;if(["owner","developer"].includes(String(d.role).toLowerCase()))return!0;const c=s.roleAssignments.filter(g=>g.company_id===t&&g.profile_id===i.id).map(g=>g.role_id),f=s.rolePermissions.filter(g=>c.includes(g.role_id));if(f.some(g=>(n.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="deny"))return!1;if(f.some(g=>(n.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="allow"))return!0}const o=String(ce(t,i.id)?.role||i.role||"member").toLowerCase(),l=rt[o]||rt.member;return l.includes("*")||n.some(d=>l.includes(d))}function y(e,t=u(),a="Your role cannot perform that action.",n="Access"){return $(e,t)?!0:(h(a,"local",n),!1)}function ze(){const e=b().profile,t=s.companies.map(i=>i.id);if(s.session?.auth==="supabase"){const i=s.memberships.filter(o=>o.profile_id===e.id&&o.status==="active").map(o=>S(o.company_id));return K(i).filter(o=>t.includes(o))}if(["developer","admin"].includes(e.role))return K(t.length?t:Zt.map(i=>S(i.id)));const a=s.memberships.filter(i=>i.profile_id===e.id&&i.status==="active").map(i=>S(i.company_id)),n=a.length?a:e.company_ids||[];return K(n.map(S)).filter(i=>t.includes(i))}function u(){const e=ze();return e.includes(s.activeCompanyId)?s.activeCompanyId:e[0]||s.activeCompanyId||L()}function L(){return S(Zt[0].id)}function on(e){const t=S(e);return s.companies.find(a=>a.id===t)||Zt.map(pt).find(a=>a.id===t)||null}function x(e){const t=on(e);return t?Te(t):e||"Company"}function Te(e){return e.short_name||e.label||e.name||e.id}function Oe(e){return on(e)?.color||"#f0b23b"}function ha(e){return S(s.jobs.find(t=>t.id===e)?.company_id||"")}function mt(e){const t=rn(e);if(t)return`Preview: ${t.name}`;const a=b().profile;return s.session?.auth!=="supabase"&&["developer","admin"].includes(a.role)?O(a.role):O(ce(e,a.id)?.role||a.role||"member")}function Ca(e,t){const a=s.memberships.find(n=>n.company_id===e&&(n.member_id===t||n.profile_id===t));return O(a?.role||"member")}function ce(e,t){return s.memberships.find(a=>a.company_id===e&&a.profile_id===t)||null}function _p(e=u()){return s.memberships.filter(t=>t.company_id===e&&t.role==="owner"&&t.status==="active")}function Ao(e,t){const a=_p(e);return a.length===1&&a[0].profile_id===t}function vp(e,t,a,n){const i=ce(e,t),o=fs(a);if(i?.role==="owner"&&i.status==="active"&&(o!=="owner"||n!=="active")&&Ao(e,t))return"Promote another active Owner before changing the last Owner.";const l=ce(e,b().profile.id),d=String(b().profile.role||"").toLowerCase();return(["owner","developer"].includes(i?.role)||["owner","developer"].includes(o))&&!["owner","developer"].includes(String(l?.role||d).toLowerCase())?"Only an Owner can change Owner or Developer access.":""}function ia(e=u()){return s.subscriptions.find(t=>t.company_id===e)||null}function yp(){const e=s.workspaceReviews.map(It),t=s.subscriptions.filter(i=>["pending_review","active","trialing","suspended","canceled"].includes(i.status)).map(i=>It({company_id:i.company_id,company_name:x(i.company_id),status:i.status,plan_code:i.plan_code,amount_cents:i.amount_cents,currency:i.currency,trial_ends_at:i.trial_ends_at,current_period_end:i.current_period_end,grace_ends_at:i.grace_ends_at,created_at:i.created_at||""})),a=cn().map(i=>It({company_id:i,company_name:x(i),status:"pending_review"})),n=new Map;return t.concat(a,e).forEach(i=>{i.company_id&&n.set(i.company_id,{...n.get(i.company_id)||{},...i})}),Array.from(n.values()).sort((i,o)=>i.status==="pending_review"&&o.status!=="pending_review"?-1:i.status!=="pending_review"&&o.status==="pending_review"?1:String(i.company_name).localeCompare(String(o.company_name)))}function te(e=u()){if(s.session?.auth!=="supabase")return!0;if(ln(e))return!1;const t=ia(e);return!!(!t||["trialing","active","past_due","grace"].includes(t.status)||t.grace_ends_at&&Date.parse(t.grace_ends_at)>Date.now())}function ln(e=u()){const t=ia(e);return t?.status==="pending_review"?!0:["active","past_due","grace"].includes(t?.status)?!1:cn().includes(S(e))}function cn(){return me(Vn,[]).map(S).filter(Boolean)}function Ds(e){const t=S(e);if(!t)return;const a=Array.from(new Set(cn().concat(t)));k(Vn,a)}function hp(e){const t=S(e);t&&k(Vn,cn().filter(a=>a!==t))}function $p(e){const t=String(e||"").trim();return!t||s.inviteLookup?.token!==t?null:s.inviteLookup}function dn(e=u()){const t=ia(e);return t?ja(t.status,t):s.session?.auth==="supabase"?"Approval pending":"Demo mode"}function ja(e,t={}){const a=un(e)||String(e||"");return a==="pending_review"?"Awaiting Quest approval":a==="trialing"?`Trial - ${P(t.trial_ends_at)}`:a==="active"?"Active subscription":a==="past_due"?"Past due grace":a==="grace"?`Grace - ${P(t.grace_ends_at)}`:a==="suspended"?"Suspended":a==="canceled"?"Rejected":O(a||"Unknown")}function un(e){const t=String(e||"").toLowerCase().trim();return["pending_review","trialing","active","past_due","grace","suspended","canceled","incomplete"].includes(t)?t:""}function Cs(){return String(b().profile?.role||"").toLowerCase()==="developer"}function W(e){const t=s.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function Je(e){const t=He(e);return t?.full_name||t?.email||W(e)}function js(e){return s.tasks.filter(t=>t.project_id===e).length}function Aa(e){return s.files.filter(t=>t.job_id===e).length}function S(e){return{"quest-roofing":"roofing","quest-drafting":"drafting"}[String(e||"").trim()]||String(e||"").trim()}function As(e){const t=new Map;return e.map(pt).forEach(a=>{!a.id||t.has(a.id)||t.set(a.id,a)}),Array.from(t.values())}function qo(e){const t=new Map;return e.map(Ma).forEach(a=>{a.company_id&&t.set(a.company_id,{...t.get(a.company_id)||{},...a})}),Array.from(t.values())}function pt(e){return{id:S(e.id||""),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function Fe(e){return{id:String(e.id||""),company_id:S(e.company_id||L()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:Xi(e.stage),priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),account_id:e.account_id?String(e.account_id):"",deal_id:e.deal_id?String(e.deal_id):"",scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:R(e.estimate_total),invoice_total:R(e.invoice_total),task_count:R(e.task_count),file_count:R(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function Rt(e){return{id:String(e.id||""),company_id:S(e.company_id||L()),name:String(e.name||"").trim()||"Untitled contact",phone:String(e.phone||"").trim(),email:String(e.email||"").trim(),location:String(e.location||"").trim(),stage:ll(e.stage),value:R(e.value),owner_name:String(e.owner_name||"").trim(),account_id:e.account_id?String(e.account_id):"",title:String(e.title||"").trim(),source:String(e.source||"").trim(),last_activity_at:e.last_activity_at||null,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function Nt(e){return{id:String(e.id||""),company_id:S(e.company_id||L()),name:String(e.name||"").trim()||"Untitled account",type:Wn.includes(e.type)?e.type:"Customer",industry:String(e.industry||"").trim(),website:String(e.website||"").trim(),phone:String(e.phone||"").trim(),email:String(e.email||"").trim(),address:String(e.address||"").trim(),owner_name:String(e.owner_name||"").trim(),status:["Active","Inactive"].includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function ft(e){const t=["open","won","lost"].includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"open";return{id:String(e.id||""),company_id:S(e.company_id||L()),account_id:e.account_id?String(e.account_id):"",primary_contact_id:e.primary_contact_id?String(e.primary_contact_id):"",name:String(e.name||"").trim()||"Untitled deal",stage:er(e.stage),status:t,value:R(e.value),probability:Math.max(0,Math.min(100,Math.round(R(e.probability)))),close_date:e.close_date?String(e.close_date).slice(0,10):"",owner_name:String(e.owner_name||"").trim(),source:String(e.source||"").trim(),job_id:e.job_id?String(e.job_id):"",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function qa(e){return{id:String(e.id||""),company_id:S(e.company_id||L()),type:cl.includes(e.type)?e.type:"note",subject:String(e.subject||"").trim(),body:String(e.body||"").trim(),related_type:["account","contact","deal","job"].includes(e.related_type)?e.related_type:"",related_id:e.related_id?String(e.related_id):"",account_id:e.account_id?String(e.account_id):"",due_at:e.due_at||null,completed_at:e.completed_at||null,owner_name:String(e.owner_name||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function gt(e){const t=wa.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=Jt.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:ir.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:S(e.company_id||L()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||j(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:wa.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function Ut(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:S(e.company_id||L()),job_id:String(e.job_id||""),folder:String(e.folder||Of(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:R(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function qs(e){return{id:String(e.id||`folder-${crypto.randomUUID()}`),company_id:S(e.company_id||L()),name:String(e.name||"New folder").trim()||"New folder",parent_key:String(e.parent_key||"home"),created_by_label:String(e.created_by_label||"Quest HQ"),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ra(e){const t=Array.isArray(e.questions)?e.questions.map(mn):[],a=Kt.includes(e.type)?e.type:"Internal",n=Jn.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:S(e.company_id||L()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:n,audience:String(e.audience||"Internal").trim(),creator_id:String(e.creator_id||e.created_by||e.created_by_id||""),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function mn(e){const t=Gt.some(([n])=>n===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(n=>String(n||"").trim()).filter(Boolean):[]};return Yt(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function Fs(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:S(e.company_id||L()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function oa(e){const t=R(e.subtotal),a=R(e.tax),n=R(e.total)||t+a;return{id:String(e.id||`invoice-${crypto.randomUUID()}`),company_id:S(e.company_id||L()),job_id:String(e.job_id||""),client_name:String(e.client_name||"").trim(),invoice_number:String(e.invoice_number||`INV-${Date.now()}`).trim(),status:rr.includes(e.status)?e.status:"Draft",issue_date:String(e.issue_date||j(0)).slice(0,10),due_date:String(e.due_date||j(30)).slice(0,10),subtotal:t,tax:a,total:n,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function la(e){return{id:String(e.id||`payment-${crypto.randomUUID()}`),company_id:S(e.company_id||L()),invoice_id:String(e.invoice_id||""),amount:R(e.amount),method:cr.includes(e.method)?e.method:"ACH",received_at:String(e.received_at||j(0)).slice(0,10),reference:String(e.reference||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString()}}function ca(e){return{id:String(e.id||`expense-${crypto.randomUUID()}`),company_id:S(e.company_id||L()),job_id:String(e.job_id||""),vendor_id:String(e.vendor_id||""),category:Ja.includes(e.category)?e.category:"Other",amount:R(e.amount),status:or.includes(e.status)?e.status:"Pending",spent_at:String(e.spent_at||j(0)).slice(0,10),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function da(e){return{id:String(e.id||`vendor-${crypto.randomUUID()}`),company_id:S(e.company_id||L()),name:String(e.name||"New vendor").trim()||"New vendor",contact_name:String(e.contact_name||"").trim(),email:String(e.email||"").trim(),phone:String(e.phone||"").trim(),category:Ja.includes(e.category)?e.category:"Other",status:lr.includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ms(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,supervisor_id:String(e.supervisor_id||e.manager_id||""),company_ids:Array.isArray(e.company_ids)?K(e.company_ids.map(S)):[]}}function Fa(e){const t=["active","pending","disabled","left"].includes(String(e.status))?String(e.status):"active";return{company_id:S(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:t,disabled_at:e.disabled_at||"",disabled_by:String(e.disabled_by||""),left_at:e.left_at||"",last_active_at:e.last_active_at||""}}function Ma(e){return{company_id:S(e.company_id||""),status:un(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:R(e.amount_cents||3e4),currency:String(e.currency||"usd"),stripe_customer_id:String(e.stripe_customer_id||""),stripe_subscription_id:String(e.stripe_subscription_id||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||""}}function It(e){return{company_id:S(e.company_id||""),company_name:String(e.company_name||e.name||e.short_name||e.company_id||"").trim(),status:un(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:R(e.amount_cents||3e4),currency:String(e.currency||"usd"),owner_profile_id:String(e.owner_profile_id||""),owner_name:String(e.owner_name||""),owner_email:String(e.owner_email||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||"",updated_at:e.updated_at||""}}function at(e){return{id:String(e.id||""),company_id:S(e.company_id||""),name:String(e.name||"Role").trim()||"Role",color:String(e.color||"#f0b23b"),priority:R(e.priority),is_system:e.is_system===!0,created_by:String(e.created_by||"")}}function An(e){return{role_id:String(e.role_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function Fo(e){return{company_id:S(e.company_id||""),profile_id:String(e.profile_id||""),role_id:String(e.role_id||""),assigned_by:String(e.assigned_by||"")}}function wp(e){return{id:String(e.id||""),company_id:S(e.company_id||""),resource_type:String(e.resource_type||""),resource_id:String(e.resource_id||""),principal_type:String(e.principal_type||""),principal_id:String(e.principal_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function Sp(e){return{id:String(e.id||""),company_id:S(e.company_id||""),resource_type:String(e.resource_type||""),field_key:String(e.field_key||""),role_id:String(e.role_id||""),visibility:["visible","masked","hidden"].includes(e.visibility)?e.visibility:"visible",editable:e.editable!==!1}}function Ia(e){return{id:String(e.id||""),company_id:S(e.company_id||""),email:String(e.email||""),role_id:String(e.role_id||""),token:String(e.token||""),status:String(e.status||"pending"),expires_at:e.expires_at||"",invited_by:String(e.invited_by||""),accepted_by:String(e.accepted_by||""),created_at:e.created_at||""}}function Mo(e){return{id:String(e.id||""),company_id:S(e.company_id||""),profile_id:String(e.profile_id||""),requested_email:String(e.requested_email||""),status:String(e.status||"pending"),message:String(e.message||""),reviewed_by:String(e.reviewed_by||""),created_at:e.created_at||""}}function Ce(e){return{id:String(e.id||""),company_id:S(e.company_id||""),title:String(e.title||"Messages").trim()||"Messages",type:Kn.includes(e.type)?e.type:"custom",created_by:String(e.created_by||""),last_message_at:e.last_message_at||e.updated_at||e.created_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function se(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:S(e.company_id||""),target_type:["all_company","role","profile"].includes(e.target_type)?e.target_type:"profile",target_id:String(e.target_id||""),created_at:e.created_at||""}}function Me(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:S(e.company_id||""),sender_profile_id:String(e.sender_profile_id||e.created_by||""),body:String(e.body||""),message_type:String(e.message_type||"text"),deleted_at:e.deleted_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Be(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),message_id:String(e.message_id||""),company_id:S(e.company_id||""),bucket_id:String(e.bucket_id||"quest-message-attachments"),object_path:String(e.object_path||""),file_name:String(e.file_name||"attachment"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:R(e.size_bytes),preview_url:String(e.preview_url||""),created_at:e.created_at||new Date().toISOString()}}function ua(e){return{conversation_id:String(e.conversation_id||""),company_id:S(e.company_id||""),profile_id:String(e.profile_id||""),last_read_at:e.last_read_at||"",updated_at:e.updated_at||e.last_read_at||""}}function bt(e){const t=e.starts_at||new Date().toISOString(),a=za.includes(e.event_type)?e.event_type:"Company event",n=["company","private"].includes(e.visibility)?e.visibility:"company",i=["","job","task","form","invoice"].includes(e.linked_type)?e.linked_type:"";return{id:String(e.id||`calendar-${crypto.randomUUID()}`),company_id:S(e.company_id||L()),title:String(e.title||"Calendar event").trim()||"Calendar event",description:String(e.description||"").trim(),event_type:a,starts_at:t,ends_at:e.ends_at||t,all_day:e.all_day===!0||e.all_day==="true"||e.all_day==="on",visibility:n,linked_type:i,linked_id:String(e.linked_id||""),assigned_profile_id:String(e.assigned_profile_id||""),created_by:String(e.created_by||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ci(e){return{id:e.id,company_id:e.company_id,title:e.title,type:e.type,created_by:e.created_by||b().profile.id,last_message_at:e.last_message_at||null}}function kp(e){return{conversation_id:e.conversation_id,company_id:e.company_id,target_type:e.target_type,target_id:e.target_id}}function Dp(e){return{id:e.id,conversation_id:e.conversation_id,company_id:e.company_id,sender_profile_id:e.sender_profile_id,body:e.body,message_type:e.message_type,deleted_at:e.deleted_at||null}}function Cp(e){return{id:e.id,conversation_id:e.conversation_id,message_id:e.message_id,company_id:e.company_id,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes}}function jp(e){return{id:Wt(e.id)?e.id:void 0,company_id:e.company_id,title:e.title,description:e.description,event_type:e.event_type,starts_at:e.starts_at,ends_at:e.ends_at||e.starts_at,all_day:e.all_day,visibility:e.visibility,linked_type:e.linked_type||"",linked_id:e.linked_id||"",assigned_profile_id:e.assigned_profile_id||"",created_by:Wt(e.created_by)?e.created_by:b().profile.id}}function Ap(e){return{conversation_id:e.conversation_id,company_id:e.company_id,profile_id:e.profile_id,last_read_at:e.last_read_at||new Date().toISOString()}}function qp(e=u()){return Fe({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function Fp(e=u(),t=""){return gt({id:"",title:"",company_id:e,project_id:t,assignee_id:wt(e)[0]?.id||"abraham",creator_id:b().profile.member_id||"abraham",due:j(1),priority:"medium",status:"todo",type:"admin"})}function Mp(e=u()){const t=Le();return oa({id:"",company_id:e,job_id:t?.company_id===e?t.id:"",client_name:t?.company_id===e?t.client_name:"",invoice_number:xf(e),status:"Draft",issue_date:j(0),due_date:j(30),subtotal:t?.company_id===e?t.estimate_total:0,tax:0,notes:""})}function Ip(e=u(),t=""){const a=t?We(t):De(e).find(i=>ve(i.id)>0),n=a?.company_id===e?a:null;return la({id:"",company_id:e,invoice_id:n?.id||"",amount:n?ve(n.id):0,method:"ACH",received_at:j(0),reference:"",notes:""})}function Ep(e=u(),t=""){return ca({id:"",company_id:e,job_id:Le()?.company_id===e?Le().id:"",vendor_id:t||ws(e)[0]?.id||"",category:"Materials",status:"Pending",amount:0,spent_at:j(0),notes:""})}function Tp(e=u()){return da({id:"",company_id:e,name:"",category:"Materials",status:"Active"})}function Op(e=u()){const t=new Date;t.setHours(t.getHours()+1,0,0,0);const a=new Date(t);return a.setHours(t.getHours()+1),bt({id:"",company_id:e,title:"",description:"",event_type:"Company event",starts_at:t.toISOString(),ends_at:a.toISOString(),all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:b().profile.member_id||b().profile.id,created_by:b().profile.id})}function Pp(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function xp(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function b(){return s.session?s.session.auth==="supabase"?s.session:{...s.session,profile:{...qn().profile,...s.session.profile||{},...s.profileDraft||{}}}:qn()}function Rp(e,t){const a=!!(e.user.email_confirmed_at||e.user.confirmed_at);return{auth:"supabase",access_token:e.access_token,refresh_token:e.refresh_token,user:{id:e.user.id,email:e.user.email||"",email_confirmed_at:e.user.email_confirmed_at||e.user.confirmed_at||"",email_verified:a},profile:Lt(t||{},{id:e.user.id,email:e.user.email||"",full_name:e.user.user_metadata?.full_name||e.user.email||"Quest user",role:"member",member_id:"",company_ids:[],avatar_url:"",email_verified:a})}}function qn(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",email_verified:!0,...s.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:st.localUsername,email:e.email},profile:e}}function Lt(e,t={}){const a=String(e.role||t.role||"member").toLowerCase(),n=typeof e.email_verified=="boolean"?e.email_verified:t.email_verified===!0;return{id:String(e.id||t.id||""),email:String(e.email||t.email||""),full_name:String(e.full_name||t.full_name||e.email||t.email||"Quest user"),role:a,role_label:O(a),member_id:String(e.member_id||t.member_id||""),company_ids:Array.isArray(e.company_ids)?K(e.company_ids.map(S)):t.company_ids||[],avatar_url:String(e.avatar_url||t.avatar_url||""),approved:e.approved!==!1,email_verified:n,supervisor_id:String(e.supervisor_id||t.supervisor_id||"")}}function Qt(e){const t=Np(e.html||e.meta||""),a=e.read_at||(e.read===!0?e.created_at||new Date().toISOString():"");return{id:String(e.id||`notification-${crypto.randomUUID()}`),company_id:S(e.company_id||""),recipient_profile_id:String(e.recipient_profile_id||e.profile_id||e.member_id||"basic-quest-user"),type:String(e.type||(e.task_id?"task.notification":"general")),title:String(e.title||e.meta||"Notification"),body:String(e.body||t||""),href:String(e.href||""),source_type:String(e.source_type||(e.task_id?"task":"")),source_id:String(e.source_id||e.task_id||""),read_at:String(a||""),created_at:String(e.created_at||new Date().toISOString())}}function Np(e){return String(e||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}function Up(e=b()){return e.auth!=="supabase"?!0:e.user?.email_verified===!0||!!e.user?.email_confirmed_at||e.profile?.email_verified===!0}function z(e,t,a=""){const n=kr();return`
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${B(n)}</span>
        <div>
          <div class="context-line"><span>${r(x(u()))}</span><b>${r(mt(u()))}</b></div>
          <h1>${r(e)}</h1>
          <p>${r(t)}</p>
        </div>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function Is(e){return`
    <button class="queue-row" type="button" data-select-task="${r(e.id)}">
      <span><strong>${r(e.title)}</strong><small>${r(N(e.project_id)?.name||x(e.company_id))}</small></span>
      ${Ts(e.priority)}
      <b>${r(qe(e.status))}</b>
    </button>
  `}function Lp(e){return`
    <button class="job-card priority-${r(e.priority.toLowerCase())} ${e.id===s.selectedJobId?"active":""}" type="button" data-select-job="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.client_name||"No client")}</span>
      <small>${r(x(e.company_id))} - ${r(e.owner_name||"Unassigned")}</small>
      <em>${r(js(e.id))} tasks</em>
    </button>
  `}function ba(e,t,a,n){return`
    <a class="mini-link" href="${_(e)}" data-router>
      <i class="ti ${r(t)}"></i>
      <span><strong>${r(a)}</strong><small>${r(n)}</small></span>
    </a>
  `}function Y(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${r(t)}</span><strong>${r(a)}</strong></div>`).join("")}</div>`}function w(e,t,a="",n=!1,i="text",o=""){return`<label class="${r(o)}"><span>${r(e)}</span><input name="${r(t)}" type="${r(i)}" value="${r(a)}" ${n?"required":""} /></label>`}function de(e,t,a="",n=""){return`<label class="${r(n)}"><span>${r(e)}</span><textarea name="${r(t)}" rows="4">${r(a)}</textarea></label>`}function I(e,t,a,n){return`
    <label><span>${r(e)}</span><select name="${r(t)}">
      ${n.map(([i,o])=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function Es(e){return`<span class="priority ${r(String(e).toLowerCase())}">${r(e)}</span>`}function Ts(e){return`<span class="priority ${r(e)}">${r(O(e))}</span>`}function Io(e){return`<span class="status-pill ${r(e)}">${r(qe(e))}</span>`}function Qp(e){return`<span class="finance-status ${r(ma(e))}">${r(e)}</span>`}function ee(e,t){if(e.avatar_url)return`<span class="${r(t)}"><img src="${r(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(n=>n[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${r(t)}">${r(a)}</span>`}function Vp(e=u()){const t=ie(e).filter(a=>a.status==="active").map(a=>[a.profile_id||a.member_id,a.name||a.email||a.member_id]);return[["","Unassigned"]].concat(t)}function ji(e){const t=new Date(e||Date.now());if(Number.isNaN(t.getTime()))return"";const a=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),i=String(t.getDate()).padStart(2,"0"),o=String(t.getHours()).padStart(2,"0"),l=String(t.getMinutes()).padStart(2,"0");return`${a}-${n}-${i}T${o}:${l}`}function Ai(e){const t=new Date(e||Date.now());return Number.isNaN(t.getTime())?new Date().toISOString():t.toISOString()}function v(e){return`<div class="empty-state">${B("q-empty","empty-symbol")}<span>${r(e)}</span></div>`}function ue(e,t){const a={};return t.forEach(n=>{const i=e.get(n);i&&(a[n]=i)}),a}function ae(){s.session?.auth!=="supabase"&&(k(Pa,s.jobs),k(Mn,s.contacts),k(In,s.accounts),k(xa,s.deals),k(En,s.activities),k(Tn,s.tasks),k(On,s.files),k(Pn,s.driveFolders),k(yt,s.forms),k(Ra,s.formResponses),k(Nn,s.financeInvoices),k(Un,s.financePayments),k(Ln,s.financeExpenses),k(Qn,s.financeVendors),k(Na,s.timeEntries),k(Ua,s.activeTimer),k(xn,s.teamMembers),k(Rn,s.memberships),k(La,s.notifications),k(Qa,s.messageConversations),k(Va,s.messageAccess),k(Ba,s.messages),k(Ya,s.messageReads),k(Ha,s.messageAttachments),k(Wa,s.calendarEvents))}function Eo(){s.session?.auth!=="supabase"&&(k(Na,s.timeEntries),k(Ua,s.activeTimer))}function Os(){s.session?.auth!=="supabase"&&k(La,s.notifications)}function To(){s.session?.auth!=="supabase"&&k(Wa,s.calendarEvents)}function Ke(){s.session?.auth!=="supabase"&&(k(Qa,s.messageConversations),k(Va,s.messageAccess),k(Ba,s.messages),k(Ya,s.messageReads),k(Ha,s.messageAttachments))}function Ps(e,t,a){if(a==="company")return[se({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"all_company",target_id:"all"})];const n=[];return e.getAll("role_ids").forEach(i=>{i&&n.push(se({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"role",target_id:i}))}),e.getAll("profile_ids").forEach(i=>{i&&n.push(se({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:i}))}),n.length?n:[se({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:b().profile.id})]}function pn(e,t=!0){if(!e)return;const a=s.messageConversations.find(l=>l.id===e);if(!a)return;const n=new Date().toISOString(),i=b().profile.id,o=ua({conversation_id:e,company_id:a.company_id,profile_id:i,last_read_at:n});if(s.messageReads=[o].concat(s.messageReads.filter(l=>l.conversation_id!==e||l.profile_id!==i)),Ke(),t&&s.session?.auth==="supabase"){const l=F();l&&l.from("message_reads").upsert(Ap(o),{onConflict:"conversation_id,profile_id"})}}function Oo(e,t,a=[]){const n=m("messages",{conversation:e.id},e.company_id),i=Je(t.sender_profile_id),o=Vt(e).filter(d=>d!==Se(e.company_id,t.sender_profile_id)),l=Bp(t.body,e.company_id).filter(d=>d!==Se(e.company_id,t.sender_profile_id));e.type==="direct"&&J("message.direct","New direct message",`${i} sent a direct message in ${e.title}.`,n,"message",t.id,e.company_id,o),l.forEach(d=>{et({company_id:e.company_id,recipients:[d],type:"message.mention",title:"Mentioned in chat",body:`${i} mentioned you in ${e.title}.`,href:n,sourceType:"message",sourceId:t.id}).catch(c=>console.warn("Message mention notification failed",c))}),a.length&&J("message.attachment","Attachment shared",`${i} shared ${a.length} attachment${a.length===1?"":"s"} in ${e.title}.`,n,"message",t.id,e.company_id,o)}function Bp(e="",t=u()){const a=String(e||"").toLowerCase();return a.includes("@")?ie(t).filter(n=>a.includes(`@${String(n.name||"").split(/\s+/)[0].toLowerCase()}`)||a.includes(`@${String(n.name||"").toLowerCase()}`)).map(n=>Se(t,n.profile_id||n.member_id)).filter(Boolean):[]}function xs(e){const t=He(e);if(t)return t;const a=s.teamMembers.find(n=>n.id===e);return{id:e,full_name:a?.full_name||a?.name||e||"Quest user",email:a?.email||"",avatar_url:a?.avatar_url||""}}function Xe(e){const t=String(e?.name||"").trim();if(t&&!Oa(t))return t;const a=String(e?.email||"").trim();return a?a.split("@")[0]||a:"Workspace user"}function Yp(e){return K([e?.email,e?.role_label||O(e?.role||""),O(e?.status||"")]).join(" / ")||"Company member"}function qi(e){return{id:e?.profile_id||e?.member_id||"",full_name:Xe(e),email:e?.email||"",avatar_url:e?.avatar_url||""}}function Hp(e){const t=String(e.value||"").trim().toLowerCase(),a=e.closest(".message-modal-form"),n=Array.from(a?.querySelectorAll("[data-message-person-row]")||[]);let i=0;n.forEach(l=>{const d=l.querySelector('input[type="checkbox"]')?.checked,c=!t||String(l.dataset.filterText||"").includes(t),f=d||c;l.hidden=!f,f&&(i+=1)});const o=a?.querySelector("[data-message-filter-count]");o&&(o.textContent=t?`${i} match${i===1?"":"es"}`:`${n.length} member${n.length===1?"":"s"}`)}function Wp(e){return{company:"q-symbol-company-chat",role:"q-symbol-role-chat",custom:"q-symbol-messages",direct:"q-symbol-direct-chat"}[e]||"q-symbol-messages"}function Rs(e){const t=an(e.id);if(e.type==="company"||t.some(i=>i.target_type==="all_company"))return"Everyone in this company";const a=t.filter(i=>i.target_type==="role").map(i=>St(e.company_id,i.target_id)?.name||"Role"),n=t.filter(i=>i.target_type==="profile").map(i=>Je(i.target_id));return a.concat(n).slice(0,5).join(", ")||"Private chat"}function zp(e){return r(e).replace(/(^|\s)@([\w.-]+)/g,"$1<strong>@$2</strong>")}function Po(e){const t=Number(e||0);return t>=1024*1024?`${(t/1024/1024).toFixed(1)} MB`:t>=1024?`${Math.round(t/1024)} KB`:`${t} B`}function xo(e){return new Promise(t=>{const a=new FileReader;a.onload=()=>t(String(a.result||"")),a.onerror=()=>t(""),a.readAsDataURL(e)})}function Jp(e,t){const a=F();if(s.session?.auth!=="supabase"||!a?.channel||!t)return;const n=`${e}:${t}`;s.messageRealtimeKey!==n&&(s.messageRealtimeChannel&&a.removeChannel(s.messageRealtimeChannel),s.messageRealtimeKey=n,s.messageRealtimeChannel=a.channel(`quest-messages-${t}`).on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:`conversation_id=eq.${t}`},()=>{s.dataLoaded=!1,p()}).on("postgres_changes",{event:"*",schema:"public",table:"message_attachments",filter:`conversation_id=eq.${t}`},()=>{s.dataLoaded=!1,p()}).subscribe())}function Kp(e){const t=[()=>$a(e,"Crew weather delay","role","Manager posted a weather delay update.",!0),()=>$a(e,"Permit questions","custom","A permit packet PDF was shared.",!1,!0),()=>$a(e,"Shan Kumar","direct","Can you jump on this when you are back?",!0),()=>Gp(e,"@Joshua you were mentioned in the launch room.")],a=Math.floor(Math.random()*t.length);t[a]()}function $a(e,t,a,n,i=!1,o=!1){const l=new Date().toISOString(),d=Ce({id:`msg-conv-${crypto.randomUUID()}`,company_id:e,title:t,type:a,created_by:"basic-quest-user",last_message_at:l,created_at:l,updated_at:l}),c=a==="direct"?[se({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:d.id,target_type:"profile",target_id:"basic-quest-user"}),se({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:d.id,target_type:"profile",target_id:"shan"})]:Ps(new FormData,d,a==="role"?"role":"company");s.messageConversations.unshift(d),s.messageAccess=c.concat(s.messageAccess);const f=Me({id:`msg-${crypto.randomUUID()}`,conversation_id:d.id,company_id:e,sender_profile_id:i?"shan":"basic-quest-user",body:n,created_at:l,updated_at:l,message_type:o?"attachment":"text"});s.messages.push(f),o&&s.messageAttachments.push(Be({id:`msg-attachment-${crypto.randomUUID()}`,conversation_id:d.id,message_id:f.id,company_id:e,file_name:"permit-packet.pdf",mime_type:"application/pdf",size_bytes:42e4,created_at:l})),i||pn(d.id,!1),s.selectedConversationId=d.id,Ke(),h("Demo message scenario added.","local","Messages"),q(m("messages",{conversation:d.id},e),{replace:!0})}function Gp(e,t){const a=Gr(e)||Ye(e)[0];if(!a)return $a(e,"Demo chat","company",t,!0);const n=new Date().toISOString(),i=Me({id:`msg-${crypto.randomUUID()}`,conversation_id:a.id,company_id:e,sender_profile_id:"shan",body:t,created_at:n,updated_at:n});s.messages.push(i),s.messageConversations=s.messageConversations.map(o=>o.id===a.id?{...o,last_message_at:n,updated_at:n}:o),Oo(a,i,[]),Ke(),h("Demo mention added.","local","Messages"),p()}function Zp(){s.messageConversations=Gn.map(Ce),s.messageAccess=Zn.map(se),s.messages=Xn.map(Me),s.messageReads=ts.map(ua),s.messageAttachments=es.map(Be),s.selectedConversationId="",Ke(),h("Demo messages reset.","local","Messages"),p()}function Xp(e){return{id:e.id,company_id:e.company_id,recipient_profile_id:e.recipient_profile_id,type:e.type,title:e.title,body:e.body,href:e.href,source_type:e.source_type,source_id:e.source_id,read_at:e.read_at||null,created_at:e.created_at}}function Ro(e=""){const t=String(e||"").split(".")[0];return{access:"Access",approval:"Approval",calendar:"Calendar",file:"Files",finance:"Finance",form:"Forms",message:"Messages",task:"Tasks"}[t]||"Inbox"}async function et(e){const t=S(e.companyId||e.company_id||u()),a=ef(t,e.recipients,{excludeActor:e.excludeActor===!0,type:e.type,href:e.href});if(!a.length)return[];const n=new Date().toISOString(),i=a.map(o=>Qt({id:`notification-${crypto.randomUUID()}`,company_id:t,recipient_profile_id:o,type:e.type||"general",title:e.title||"Notification",body:e.body||"",href:e.href||"",source_type:e.sourceType||e.source_type||"",source_id:e.sourceId||e.source_id||"",created_at:n}));if(s.session?.auth==="supabase"){const o=F();if(!o)return[];const l=await o.from("notifications").insert(i.map(Xp)).select();if(l.error)return console.warn("Notification insert failed",l.error),[];const d=(l.data||[]).map(Qt);return Fi(d),p(),d}return Fi(i),Os(),p(),i}function Fi(e){if(!e.length)return;const t=new Map;e.concat(s.notifications).forEach(a=>t.set(a.id,a)),s.notifications=[...t.values()].sort((a,n)=>Date.parse(n.created_at||0)-Date.parse(a.created_at||0)).slice(0,200)}function ef(e,t=[],a={}){let i=(Array.isArray(t)?t:[t]).map(o=>Se(e,o)).filter(Boolean);return i.length||(i=Lo(e,a.type||"","","")),i=K(i),s.session?.auth!=="supabase"&&!i.includes(b().profile.id)&&i.push(b().profile.id),a.excludeActor&&(i=i.filter(o=>o!==No())),i.filter(o=>tf(e,o)&&af(e,o,a.type,a.href))}function Se(e,t){if(!t)return"";const a=typeof t=="object"?String(t.profile_id||t.id||t.member_id||t.target_id||"").trim():String(t).trim();if(!a)return"";if(He(a)||ce(e,a))return a;const n=b().profile;if(a===n.id||a===n.member_id||a===n.email)return n.id;const i=ie(e).find(l=>[l.profile_id,l.member_id,l.email,l.name].filter(Boolean).includes(a));if(i?.profile_id)return i.profile_id;const o=s.profiles.find(l=>l.member_id===a||l.email===a||l.full_name===a);return o?.id?o.id:s.session?.auth==="supabase"?"":a}function tf(e,t){if(!t)return!1;if(t===b().profile.id&&s.session?.auth!=="supabase")return!0;const a=ce(e,t);if(a)return a.status==="active";const n=ie(e).find(i=>i.profile_id===t||i.member_id===t);return s.session?.auth!=="supabase"?!0:n?.status==="active"}function No(){return b().profile.id||b().profile.member_id||""}function af(e,t,a="",n=""){const i=nf(a,n);return i?Uo(e,t,i):!0}function nf(e="",t=""){const a=`${e} ${t}`;return a.includes("finance")?"finance.view":a.includes("message")?"messages.view":a.includes("calendar")?"calendar.view":a.includes("file")?"files.view":a.includes("approval")?"approvals.view":a.includes("form")?"forms.view":a.includes("task")?"tasks.view":""}function Uo(e,t,a){if(!a)return!0;if(t===b().profile.id)return $(a,e);const n=ce(e,t);if(s.session?.auth==="supabase"&&(!n||n.status!=="active"))return!1;const i=String(n?.role||ie(e).find(f=>f.profile_id===t)?.role||"member").toLowerCase();if(["owner","admin","developer"].includes(i))return!0;const o=ps(a),l=s.roleAssignments.filter(f=>f.company_id===e&&f.profile_id===t).map(f=>f.role_id),d=s.rolePermissions.filter(f=>l.includes(f.role_id));if(d.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="deny"))return!1;if(d.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="allow"))return!0;const c=rt[i]||rt.member;return c.includes("*")||o.some(f=>c.includes(f))}function Lo(e,t="",a="",n=""){const i=String(t||"").split(".")[0];return i==="finance"?_e(e,["finance.view"]):i==="message"?_e(e,["messages.view"]):i==="calendar"?rf(n).concat(_e(e,["calendar.manage"])):i==="file"?_e(e,["files.view"]).concat(sf(e,n)):i==="form"?_e(e,["forms.view","forms.manage"]):i==="approval"?_e(e,["approvals.view","approvals.manage"]):i==="access"?_e(e,["users.manage","settings.manage"]):[No()]}function _e(e,t){return K(ie(e).filter(a=>a.status==="active").map(a=>Se(e,a.profile_id||a.member_id)).filter(a=>t.some(n=>Uo(e,a,n))))}function Fn(e,t=!0){return e?K([e.assignee_id,t?e.creator_id:"",...Array.isArray(e.watchers)?e.watchers:[]].map(a=>Se(e.company_id,a)).filter(Boolean)):[]}function sf(e,t){return t?K(s.tasks.filter(a=>a.company_id===e&&a.project_id===t).flatMap(a=>Fn(a))):[]}function rf(e){const t=s.calendarEvents.find(a=>a.id===e);return t?K([t.assigned_profile_id,t.created_by].map(a=>Se(t.company_id,a)).filter(Boolean)):[]}function Vt(e){if(!e)return[];const a=an(e.id).flatMap(n=>n.target_type==="all_company"?_e(e.company_id,["messages.view"]):n.target_type==="profile"?[Se(e.company_id,n.target_id)]:n.target_type==="role"?ie(e.company_id).filter(i=>i.status==="active"&&(i.role_id===n.target_id||xt(e.company_id,i.role)===n.target_id)).map(i=>Se(e.company_id,i.profile_id||i.member_id)):[]);return K(a.filter(Boolean))}async function of(e=u()){const t=new Date().toISOString(),a=b().profile.id,n=s.notifications.filter(i=>i.company_id===e&&i.recipient_profile_id===a&&!i.read_at).map(i=>i.id);if(n.length&&(s.notifications=s.notifications.map(i=>i.company_id===e&&i.recipient_profile_id===a&&!i.read_at?{...i,read_at:t}:i),Os(),p(),s.session?.auth==="supabase")){const i=F();i&&await i.from("notifications").update({read_at:t}).in("id",n).eq("recipient_profile_id",a)}}async function lf(e){const t=s.notifications.find(n=>n.id===e);if(!t)return;const a=new Date().toISOString();if(s.notifications=s.notifications.map(n=>n.id===t.id?{...n,read_at:n.read_at||a}:n),s.notificationMenuOpen=!1,Os(),p(),s.session?.auth==="supabase"&&!t.read_at){const n=F();n&&await n.from("notifications").update({read_at:a}).eq("id",t.id).eq("recipient_profile_id",b().profile.id)}t.href&&q(t.href)}function Mi(e,t=null){const a=m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),n=W(e.assignee_id);if(!t){et({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task assigned",body:`${H()} assigned ${e.title} to ${n}.`,href:a,sourceType:"task",sourceId:e.id}).catch(i=>console.warn("Task notification failed",i));return}t.assignee_id!==e.assignee_id&&et({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task reassigned",body:`${H()} reassigned ${e.title} to ${n}.`,href:a,sourceType:"task",sourceId:e.id}).catch(i=>console.warn("Task notification failed",i)),t.priority!==e.priority&&et({companyId:e.company_id,recipients:Fn(e),excludeActor:!0,type:"task.priority",title:"Task priority changed",body:`${H()} set priority to ${O(e.priority)} on ${e.title}.`,href:a,sourceType:"task",sourceId:e.id}).catch(i=>console.warn("Task notification failed",i)),t.status!==e.status&&et({companyId:e.company_id,recipients:Fn(e),excludeActor:!0,type:"task.status",title:"Task status changed",body:`${H()} moved ${e.title} to ${qe(e.status)}.`,href:a,sourceType:"task",sourceId:e.id}).catch(i=>console.warn("Task notification failed",i))}function J(e,t,a,n,i="",o="",l=u(),d=null){et({companyId:l,recipients:d||Lo(l,e,i,o),type:e,title:t,body:a,href:n,sourceType:i,sourceId:o}).catch(c=>console.warn("Notification event failed",c))}async function _t(e,t,a,n,i={},o=!1){const l={id:`audit-${crypto.randomUUID()}`,company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:n,details:i,created_at:new Date().toISOString()};if(s.auditEvents.unshift(l),o&&s.session?.auth==="supabase"){const d=F();if(d)try{await d.from("audit_events").insert({company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:n,details:i})}catch{}}}function cf(e,t){return t.status==="disabled"?"membership.disabled":t.status==="left"?"membership.left":e&&["disabled","left","pending"].includes(e.status)&&t.status==="active"?"membership.reactivated":e&&e.role!==t.role?"role.changed":"membership.updated"}function H(){return b().profile.full_name||b().profile.email||"Quest HQ"}function A(e,t,a=""){return`<article class="metric">${B(jl(e),"metric-symbol")}<span>${r(e)}</span><strong>${r(t)}</strong>${a?`<small>${r(a)}</small>`:""}</article>`}function Ue(e,t){return`<div><strong>${r(e)}</strong><span>${r(t)}</span></div>`}function nt(e,t,a,n,i=""){const o=`
    <span><strong>${r(e)}</strong><small>${r(t||"Finance record")}</small></span>
    <b>${r(a)}</b>
    <em>${P(n)}</em>
  `;return i?`<a class="finance-compact-row" href="${_(i)}" data-router>${o}</a>`:`<div class="finance-compact-row">${o}</div>`}function Ii(e,t){const a=ke(e);return t==="jobs"?a.filter(n=>n.job_id).length:a.filter(n=>n.folder===t).length}function Qo(e="home",t=null){return t?.id?`job:${t.id}`:e||"home"}function df(e,t="home",a=null){const n=Qo(t,a),i=Pt(e).filter(o=>o.parent_key===n).map(o=>uf(e,o));return a?i:t==="home"?zn.map(([l,d,c,f])=>({id:l,name:d,caption:c,icon:f,href:_(m("files",{folder:l},e)),countLabel:`${Ii(e,l)} file${Ii(e,l)===1?"":"s"}`,updatedLabel:""})).concat(i):t==="jobs"?V(e).map(l=>({id:`job:${l.id}`,name:l.name,caption:l.client_name||x(e),icon:"ti-folder",href:_(m("files",{folder:"jobs",job_id:l.id},e)),countLabel:`${Aa(l.id)} file${Aa(l.id)===1?"":"s"}`,updatedLabel:P(l.updated_at)})).concat(i):i}function uf(e,t){const a=Pt(e).filter(o=>o.parent_key===t.id).length,n=ke(e).filter(o=>o.folder===t.id).length,i=a+n;return{id:t.id,name:t.name,caption:"Custom folder",icon:"ti-folder",href:_(m("files",{folder:t.id},e)),countLabel:`${i} item${i===1?"":"s"}`,updatedLabel:P(t.updated_at)}}function mf(e,t,a=null){if(a)return`<span>/</span><a href="${_(m("files",{folder:"jobs"},e))}" data-router>Jobs</a>`;const n=Pt(e).find(c=>c.id===t);if(!n)return`<span>/</span><strong>${r(ye(t))}</strong>`;const i=[];let o=n;const l=new Set;for(;o&&!l.has(o.id);)l.add(o.id),i.unshift(o),o=Pt(e).find(c=>c.id===o.parent_key);return`${n.parent_key&&!n.parent_key.startsWith("folder-")&&n.parent_key!=="home"?`<span>/</span><a href="${_(m("files",{folder:n.parent_key},e))}" data-router>${r(ye(n.parent_key))}</a>`:""}${i.map((c,f)=>`<span>/</span>${f===i.length-1?`<strong>${r(c.name)}</strong>`:`<a href="${_(m("files",{folder:c.id},e))}" data-router>${r(c.name)}</a>`}`).join("")}`}function pf(e=u(),t="home",a=""){const n=(s.fileQuery||s.query||"").trim().toLowerCase(),i=s.fileCategoryFilter;let o=ke(e);return a?o=o.filter(l=>l.job_id===a):t&&t!=="home"&&(t==="jobs"?o=o.filter(l=>l.job_id):o=o.filter(l=>l.folder===t)),i&&i!=="All categories"&&(o=o.filter(l=>String(l.category||ye(l.folder)).toLowerCase()===i.toLowerCase())),n&&(o=o.filter(l=>[l.file_name,l.category,l.uploaded_by_label,l.notes,l.object_path,N(l.job_id)?.name].some(d=>String(d||"").toLowerCase().includes(n)))),o.sort((l,d)=>new Date(d.created_at||0)-new Date(l.created_at||0))}function Pe(e){const t={pdf:"PDF",image:"Image",archive:"Archive",sheet:"Excel",doc:"Word",presentation:"PowerPoint",text:"Text",video:"Video",audio:"Audio",code:"Code",data:"Data",design:"Design",cad:"CAD",email:"Email"},a=fn(e);if(t[a])return t[a];const n=gn(e);return n?n.toUpperCase():ye(e.folder)}function fn(e){const t=String(e.mime_type||"").toLowerCase(),a=gn(e);return t.includes("pdf")||a==="pdf"?"pdf":t.includes("image")||["png","jpg","jpeg","gif","webp","svg","bmp","tif","tiff","heic","ico"].includes(a)?"image":t.includes("zip")||t.includes("compressed")||["zip","rar","7z","tar","gz","tgz","bz2"].includes(a)?"archive":t.includes("spreadsheet")||t.includes("excel")||["xls","xlsx","xlsm","ods","csv"].includes(a)?"sheet":t.includes("word")||["doc","docx","odt","rtf"].includes(a)?"doc":t.includes("presentation")||["ppt","pptx","pps","odp"].includes(a)?"presentation":t.includes("video")||["mp4","mov","avi","mkv","webm","wmv","m4v"].includes(a)?"video":t.includes("audio")||["mp3","wav","aac","flac","m4a","ogg"].includes(a)?"audio":["js","ts","jsx","tsx","html","css","scss","json","xml","yml","yaml","md","sql","py","rb","php","java","cs","cpp","c","go","rs","sh","ps1"].includes(a)?"code":["txt","log"].includes(a)||t.includes("text")?"text":["ai","psd","sketch","fig"].includes(a)?"design":["dwg","dxf","rvt","ifc","step","stp"].includes(a)?"cad":["eml","msg"].includes(a)?"email":["db","sqlite","bak"].includes(a)?"data":"file"}function Ns(e){return fn(e)}function gn(e){return String(e.file_name||"").split(".").pop()?.toLowerCase()||""}function ff(e){return e.type==="image/png"?"png":e.type==="image/webp"?"webp":"jpg"}function Us(e,t=!1){return e.signed_url&&fn(e)==="image"?`<img src="${r(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${r(Ns(e))} ${t?"large":""}">${Go(e,Pe(e))}<small>${r(Vo(e))}</small></span>`}function Vo(e){const t=Pe(e),a=gn(e);return t==="Image"?a&&a.length<=4?a.toUpperCase():"IMG":t==="Archive"?a&&a.length<=3?a.toUpperCase():"ZIP":t==="Excel"?a==="csv"?"CSV":"XLS":t==="Word"?"DOC":t==="PowerPoint"?"PPT":t==="Video"?"VID":t==="Audio"?"AUD":t==="Code"?a&&a.length<=4?a.toUpperCase():"CODE":t==="Design"?a&&a.length<=4?a.toUpperCase():"DES":t==="CAD"?a&&a.length<=4?a.toUpperCase():"CAD":t==="Email"?a&&a.length<=4?a.toUpperCase():"MAIL":t==="Data"?a&&a.length<=4?a.toUpperCase():"DATA":t==="Text"?a&&a.length<=4?a.toUpperCase():"TXT":t.length<=4?t.toUpperCase():(a||"FILE").slice(0,4).toUpperCase()}function je(e=u()){return s.forms.filter(t=>t.company_id===e)}function gf(e=u()){const t=s.formQuery.trim().toLowerCase(),a=s.route?.jobId||"";return je(e).filter(n=>a&&n.linked_job_id!==a||s.formTypeFilter!=="all"&&n.type!==s.formTypeFilter?!1:t?[n.title,n.description,n.type,n.status,n.audience,N(n.linked_job_id)?.name].some(i=>String(i||"").toLowerCase().includes(t)):!0)}function Bt(e=u()){const t=s.route?.jobId||"",a=je(e).filter(o=>!t||o.linked_job_id===t),n=s.route?.params?.get("form_id")||"";if(n&&a.some(o=>o.id===n)&&(s.selectedFormId=n),!a.length)return s.selectedFormId="",s.selectedQuestionId="",null;let i=a.find(o=>o.id===s.selectedFormId)||a[0];return s.selectedFormId=i.id,(!s.selectedQuestionId||!i.questions.some(o=>o.id===s.selectedQuestionId))&&(s.selectedQuestionId=i.questions[0]?.id||""),i}function xe(e){return s.forms.find(t=>t.id===e)||null}function Ae(){return xe(s.selectedFormId)||Bt(u())}function Bo(e=u()){return s.formResponses.filter(t=>t.company_id===e)}function bn(e){return s.formResponses.filter(t=>t.form_id===e)}function Yo(e){return Array.isArray(e?.questions)?e.questions.length:0}function bf(e){const t=String(e?.creator_id||""),a=b().profile;return t?t&&(t===a.member_id||t===a.id)?a.full_name||"Quest Basic Mode":W(t)||e?.created_by_label||"Quest HQ":e?.created_by_label||a.full_name||"Quest HQ"}function Mt(e,t,a="",n=!1,i="text"){return`<label><span>${r(e)}</span><input data-form-field="${r(t)}" type="${r(i)}" value="${r(a)}" ${n?"required":""} /></label>`}function Ho(e,t,a=""){return`<label><span>${r(e)}</span><textarea data-form-field="${r(t)}" rows="3">${r(a)}</textarea></label>`}function _a(e,t,a,n){return`
    <label><span>${r(e)}</span><select data-form-field="${r(t)}">
      ${n.map(([i,o])=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function Yt(e){return["multiple","checkbox","dropdown"].includes(e.type)}function _f(e){return{short:"ti-letter-t",paragraph:"ti-align-left",multiple:"ti-circle-dot",checkbox:"ti-checkbox",dropdown:"ti-select",date:"ti-calendar",rating:"ti-star",yesno:"ti-circle-check",file:"ti-paperclip"}[e]||"ti-plus"}function vf(e){return Gt.find(([t])=>t===e)?.[1]||O(e||"Question")}function $e(e,t){return`
    <div class="response-question">
      <label>
        <span>${r(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${r(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function Wo(e){const t=xe(e.form_id),a=Object.entries(e.answers||{}).map(([n,i])=>{const o=t?.questions.find(d=>d.id===n),l=Array.isArray(i)?i.join(", "):i;return Ue(o?.label||n,l||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${r(t?.title||"Response")}</h2><p>${r(e.submitted_by||e.submitter_email||"Anonymous")} / ${P(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||Ue("Response","No answers captured.")}</div>
  `}function Et(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[Z("short","Inspection address"),Z("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),Z("paragraph","Recommended scope"),Z("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[Z("short","Client name"),Z("yesno","Approved to proceed?"),Z("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[Z("short","Request title"),Z("dropdown","Priority",["Low","Medium","High","Urgent"]),Z("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[Z("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),Z("yesno","Weather safe?"),Z("paragraph","Safety notes")]}]}function yf(e=u()){return ra({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:s.route?.jobId||"",theme_color:Oe(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[Z("short","First question")]})}function Z(e="short",t="Untitled question",a=[]){return mn({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function hf(e,t={}){if(!y("forms.manage",e,"Your role cannot create forms.","Forms"))return null;const a=yf(e),n=ra({...a,...t,id:t.id||`form-${crypto.randomUUID()}`,company_id:e,questions:(t.questions||a.questions).map(i=>mn(i)),created_at:t.created_at||new Date().toISOString(),updated_at:new Date().toISOString()});return s.forms.unshift(n),s.selectedFormId=n.id,s.selectedQuestionId=n.questions[0]?.id||"",s.formsTab="builder",s.formEditorTab="questions",s.modal="",s.formStartTemplateId="",s.formStartTab="blank",oe("New form created"),p(),n}function $f(e){if(!y("forms.manage",u(),"Your role cannot create forms.","Forms"))return;const t=Object.fromEntries(new FormData(e).entries()),a=t.template_id?Et().find(l=>l.id===t.template_id):null,n=String(t.title||a?.title||"Untitled form").trim()||"Untitled form",i=String(t.description||a?.description||"").trim(),o=a?a.questions.map(l=>({...Ea(l),id:`q-${crypto.randomUUID()}`})):[Z("short","First question")];hf(u(),{title:n,description:i,type:Kt.includes(t.type)?t.type:a?.type||"Internal",audience:String(t.audience||"Internal").trim()||"Internal",creator_id:b().profile.member_id||b().profile.id||"basic-quest-user",linked_job_id:String(t.linked_job_id||""),theme_color:Oe(u()),background:"clean",submit_label:String(t.submit_label||"Submit").trim()||"Submit",collect_email:t.collect_email==="on",require_approval:t.require_approval==="on",questions:o})}function va(e,t=!0){const a=xe(e);a&&(s.selectedFormId=a.id,s.selectedQuestionId=a.questions[0]?.id||"",t&&p())}function oe(e="Forms saved locally"){const t=Ae();t&&(t.updated_at=new Date().toISOString()),k(yt,s.forms),k(Ra,s.formResponses),s.sync={label:e,mode:"live"}}function Ei(e,t){const a=xe(e||s.selectedFormId);a&&y("forms.manage",a.company_id,"Your role cannot update forms.","Forms")&&(a.status=Jn.includes(t)?t:"Draft",s.selectedFormId=a.id,oe(`${a.status} locally`),p())}function wf(e){const t=xe(e||s.selectedFormId);if(!t||!y("forms.manage",t.company_id,"Your role cannot duplicate forms.","Forms"))return;const a=ra({...Ea(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(n=>({...Ea(n),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});s.forms.unshift(a),s.selectedFormId=a.id,s.selectedQuestionId=a.questions[0]?.id||"",oe("Form duplicated"),p()}function Sf(e){const t=e||s.selectedFormId;if(!t)return;const a=xe(t);a&&!y("forms.manage",a.company_id,"Your role cannot delete forms.","Forms")||(s.forms=s.forms.filter(n=>n.id!==t),s.formResponses=s.formResponses.filter(n=>n.form_id!==t),s.selectedFormId=je(u())[0]?.id||"",s.selectedQuestionId=Bt(u())?.questions[0]?.id||"",s.modal="",oe("Form deleted locally"),p())}async function kf(e){const t=e||s.selectedFormId,a=`${window.location.origin}${_(m("forms",{form_id:t},u()))}`;try{await navigator.clipboard.writeText(a),s.sync={label:"Form link copied",mode:"live"}}catch{s.sync={label:"Copy failed",mode:"local"}}p()}function Df(e){const t=JSON.stringify({company_id:e,forms:je(e),responses:Bo(e)},null,2);Ef(`${e}-forms-export.json`,t,"application/json")}function zo(e){const t=Ae();if(!t||!$("forms.manage",t.company_id))return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),k(yt,s.forms))}function Jo(e){const t=Ae(),a=e.closest("[data-question-id]"),n=t?.questions.find(i=>i.id===a?.dataset.questionId);if(!(!t||!n)&&$("forms.manage",t.company_id)){if(s.selectedQuestionId=n.id,e.matches("[data-question-option]")){const i=Number(e.dataset.questionOption);n.options[i]=e.value}else{const i=e.dataset.questionField;if(i==="required")n.required=e.checked;else if(i==="type"){n.type=e.value,Yt(n)&&!n.options.length&&(n.options=["Option 1","Option 2"]),Yt(n)||(n.options=[]),oe("Question updated"),p();return}else i&&(n[i]=e.value)}t.updated_at=new Date().toISOString(),k(yt,s.forms)}}function Cf(e="multiple"){const t=Ae();if(!t||!y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms"))return;const a=Z(e,Gt.find(([n])=>n===e)?.[1]||"New question");t.questions.push(a),s.selectedQuestionId=a.id,oe("Question added"),p()}function jf(e){const t=Ae(),a=t?.questions.find(o=>o.id===e);if(!t||!a||!y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms"))return;const n=t.questions.findIndex(o=>o.id===e),i=mn({...Ea(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(n+1,0,i),s.selectedQuestionId=i.id,oe("Question duplicated"),p()}function Af(e){const t=Ae();t&&y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms")&&(t.questions=t.questions.filter(a=>a.id!==e),s.selectedQuestionId=t.questions[0]?.id||"",oe("Question deleted"),p())}function qf(e,t){const a=Ae();if(!a||!t||!y("forms.manage",a.company_id,"Your role cannot edit forms.","Forms"))return;const n=a.questions.findIndex(l=>l.id===e),i=n+t;if(n<0||i<0||i>=a.questions.length)return;const[o]=a.questions.splice(n,1);a.questions.splice(i,0,o),s.selectedQuestionId=e,oe("Question moved"),p()}function Ff(e){const t=Ae(),a=t?.questions.find(n=>n.id===e);a&&y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms")&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),oe("Option added"),p())}function Mf(e,t){const a=Ae(),n=a?.questions.find(i=>i.id===e);!n||t<0||y("forms.manage",a.company_id,"Your role cannot edit forms.","Forms")&&(n.options.splice(t,1),n.options.length||n.options.push("Option 1"),oe("Option removed"),p())}function If(e){const t=xe(e.dataset.formId);if(!t)return;const a=new FormData(e),n={};t.questions.forEach(i=>{const o=`answer:${i.id}`,l=a.getAll(o).filter(d=>d instanceof File?d.name:String(d||"").trim());n[i.id]=l.length>1?l.map(d=>d instanceof File?d.name:d):l[0]instanceof File?l[0].name:l[0]||""}),s.formResponses.unshift(Fs({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||b().profile.full_name||"Preview submitter"),answers:n,created_at:new Date().toISOString()})),s.formsTab="responses",s.modal="",oe("Preview response saved"),J(t.require_approval?"approval.form":"form.response",t.require_approval?"Form approval ready":"Form response saved",`${H()} saved a response for ${t.title}.`,m("forms",{form_id:t.id,tab:"responses"},t.company_id),"form_response",t.id,t.company_id),p()}function Ef(e,t,a="text/plain"){const n=new Blob([t],{type:a}),i=URL.createObjectURL(n),o=document.createElement("a");o.href=i,o.download=e,o.click(),URL.revokeObjectURL(i)}function Ea(e){return JSON.parse(JSON.stringify(e))}function K(e){return Array.from(new Set(e.map(t=>String(t||"").trim()).filter(Boolean)))}function qe(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||O(e)}function Ge(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||O(e)}function ye(e){return zn.find(([t])=>t===e)?.[1]||s.driveFolders.find(t=>t.id===e)?.name||O(e||"Shared")}function Tf(e=u()){return zn.map(([t,a])=>[t,a]).concat(Pt(e).map(t=>[t.id,t.name]))}function Of(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function Ko(e,t="Folder"){return Zo("default_folder.svg",t||"Folder")}function Go(e,t="File"){return Zo(Pf(e),t||Pe(e))}function Zo(e,t){return`<img class="asset-icon" src="${r(ul+e)}" alt="${r(t)}" loading="lazy" draggable="false" referrerpolicy="no-referrer" />`}function Pf(e){const t=gn(e),a={pdf:"file_type_pdf.svg",doc:"file_type_word.svg",docx:"file_type_word.svg",odt:"file_type_word.svg",rtf:"file_type_word.svg",xls:"file_type_excel.svg",xlsx:"file_type_excel.svg",xlsm:"file_type_excel.svg",ods:"file_type_excel.svg",csv:"file_type_excel.svg",ppt:"file_type_powerpoint.svg",pptx:"file_type_powerpoint.svg",pps:"file_type_powerpoint.svg",odp:"file_type_powerpoint.svg",zip:"file_type_zip.svg",rar:"file_type_zip.svg","7z":"file_type_zip.svg",tar:"file_type_zip.svg",gz:"file_type_zip.svg",tgz:"file_type_zip.svg",txt:"file_type_text.svg",log:"file_type_text.svg",md:"file_type_markdown.svg",json:"file_type_json.svg",html:"file_type_html.svg",htm:"file_type_html.svg",css:"file_type_css.svg",scss:"file_type_css.svg",js:"file_type_js.svg",jsx:"file_type_js.svg",ts:"file_type_js.svg",tsx:"file_type_js.svg",xml:"file_type_xml.svg",yml:"file_type_yaml.svg",yaml:"file_type_yaml.svg",svg:"file_type_svg.svg",ai:"file_type_ai.svg",psd:"file_type_photoshop.svg"};if(a[t])return a[t];const n=fn(e);return n==="image"?"file_type_image.svg":n==="video"?"file_type_video.svg":n==="audio"?"file_type_audio.svg":n==="text"?"file_type_text.svg":n==="code"?"file_type_js.svg":n==="archive"?"file_type_zip.svg":"default_file.svg"}function O(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function j(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function P(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function Ta(e){if(!e)return"No time";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(t)}function Ze(e){const t=new Date(e);if(!e||Number.isNaN(t.getTime()))return"just now";const a=Math.max(0,Math.floor((Date.now()-t.getTime())/1e3));if(a<45)return"just now";const n=Math.floor(a/60);if(n<60)return`${n}m ago`;const i=Math.floor(n/60);if(i<24)return`${i}h ago`;const o=Math.floor(i/24);return o<7?`${o}d ago`:P(e)}function ya(e){const t=Math.max(0,Math.floor(R(e)/1e3)),a=Math.floor(t/3600),n=Math.floor(t%3600/60);return a?`${a}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Ls(e){const t=R(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],n=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**n).toFixed(n?1:0)} ${a[n]}`}function Ht(e){return(t,a)=>Date.parse(a[e]||a.updated_at||a.created_at||0)-Date.parse(t[e]||t.updated_at||t.created_at||0)}function Xo(e){if(!e)return 0;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?0:Math.floor((jt().getTime()-t.getTime())/864e5)}function Ti(e){if(!e)return 999;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?999:Math.floor((t.getTime()-jt().getTime())/864e5)}function xf(e=u()){const t=(Te(on(e)||{short_name:e})||e||"QH").replace(/[^a-z]/gi,"").slice(0,2).toUpperCase()||"QH",a=De(e).length+1;return`${t}-${String(1e3+a)}`}function jt(){const e=new Date;return e.setHours(0,0,0,0),e}function Rf(e,t){return`${el(e,t)}%`}function el(e,t){const a=R(t);return a?Math.max(0,Math.min(100,Math.round(R(e)/a*100))):0}function vt(e){return{critical:5,urgent:4,high:3,medium:2,low:1}[String(e||"").toLowerCase()]||0}function ma(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function X(e,t){return e.reduce((a,n)=>a+R(n[t]),0)}function R(e){const t=Number(e);return Number.isFinite(t)?t:0}function Wt(e){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(e||""))}function Oa(e){const t=String(e||"").trim();return Wt(t)||/^[0-9a-f]{8,}$/i.test(t)||/^user[_-]?[0-9a-f-]{8,}$/i.test(t)}function tl(e){const t=String(e||"").trim();return t?t.slice(0,8):""}function C(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(R(e))}function me(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function M(e,t){const a=me(e,t);return Array.isArray(a)&&a.length?a:t}function k(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
