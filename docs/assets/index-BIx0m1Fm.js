(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=a(i);fetch(i.href,o)}})();const to="/quest-hq-command-center/assets/quest-secure-workspace-cockpit-tight-CMTSEVW0.png",Ze={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://lpzotcznihwyyudxycmd.supabase.co",supabaseKey:"sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07"},Je=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),Xe="quest-hq-local-session",ei="quest-hq-local-profile",ya="quest-hq-job-cache-v2",pn="quest-hq-contact-cache-v1",ti="quest-hq-job-stages-v1",ai="quest-hq-contact-stages-v1",fn="quest-hq-task-cache-v1",gn="quest-hq-file-cache-v1",bn="quest-hq-drive-folder-cache-v1",_n="quest-hq-team-cache-v1",vn="quest-hq-company-membership-cache-v1",ct="quest-hq-company-form-cache-v1",ha="quest-hq-company-form-response-cache-v1",yn="quest-hq-finance-invoice-cache-v1",hn="quest-hq-finance-payment-cache-v1",$n="quest-hq-finance-expense-cache-v1",wn="quest-hq-finance-vendor-cache-v1",$a="quest-hq-time-entry-cache-v1",wa="quest-hq-active-timer-v1",Ae="quest-hq-active-company",Sn="quest-hq-pending-workspace-review-v1",ni="quest-hq-task-view",si="quest-hq-drive-view",ii="quest-hq-sidebar-collapsed",ri="quest-hq-nav-groups-collapsed",oi="quest-hq-nav-expanded-v1",li="quest-hq-job-board-view",ci="quest-hq-contact-board-view",Sa="quest-hq-notification-cache-v1",ka="quest-hq-message-conversation-cache-v1",Da="quest-hq-message-access-cache-v1",Ca="quest-hq-message-cache-v1",ja="quest-hq-message-read-cache-v1",Aa="quest-hq-message-attachment-cache-v1",qa="quest-hq-calendar-event-cache-v1",et={developer:["*"],admin:["*"],owner:["*"],manager:["jobs.view","jobs.manage","tasks.view","tasks.manage","files.view","files.manage","forms.view","forms.manage","finance.view","team.view","clock.manage","approvals.manage","approvals.view","calendar.view","calendar.manage","calendar.view_team","users.view","settings.view","billing.view","roles.view","messages.view","messages.send","messages.create_group","messages.manage_groups","messages.attach_files"],member:["jobs.view","tasks.view","tasks.manage","files.view","forms.view","time.track","approvals.view","calendar.view","users.view","messages.view","messages.send","messages.attach_files"]},di=[["jobs.view","View jobs"],["jobs.manage","Create/edit jobs"],["tasks.view","View tasks"],["tasks.manage","Create/edit tasks"],["files.view","View files"],["files.manage","Upload/delete files"],["forms.view","View forms"],["forms.manage","Create/edit forms"],["crm.view","View CRM"],["finance.view","View finance"],["finance.manage","Create/edit finance"],["users.view","View users"],["users.manage","Invite/manage users"],["roles.view","View roles"],["roles.manage","Create/edit roles"],["billing.view","View billing"],["billing.manage","Manage subscription"],["settings.view","View settings"],["settings.manage","Manage settings"],["time.track","Track own time"],["clock.manage","Manage clock dashboard"],["approvals.view","View approvals"],["approvals.manage","Manage approvals"],["calendar.view","View calendar"],["calendar.manage","Create/edit calendar events"],["calendar.view_team","View team calendar"],["messages.view","View messages"],["messages.send","Send messages"],["messages.create_group","Create group chats"],["messages.manage_groups","Manage group chats"],["messages.attach_files","Attach files/images"],["messages.delete_own","Delete own messages"],["messages.delete_any","Delete any messages"],["messages.manage","Manage messages (compatibility)"]],ao={"messages.manage":["messages.manage_groups"],"messages.manage_groups":["messages.manage"]},dt=[{id:"home",group:"Workspace",label:"Home",icon:"ti-home",symbol:"q-logo",status:"live",permission:""},{id:"jobs",group:"Workspace",label:"Jobs",icon:"ti-briefcase",symbol:"q-symbol-jobs",status:"live",permission:"jobs.view"},{id:"tasks",group:"Workspace",label:"Tasks",icon:"ti-list-check",symbol:"q-symbol-tasks",status:"live",permission:"tasks.view"},{id:"files",group:"Workspace",label:"Files",icon:"ti-folder",symbol:"q-symbol-files",status:"live",permission:"files.view"},{id:"forms",group:"Workspace",label:"Forms",icon:"ti-clipboard-list",symbol:"q-symbol-forms",status:"live",permission:"forms.view"},{id:"analytics",group:"Workspace",label:"Analytics",icon:"ti-chart-bar",symbol:"q-symbol-analytics",status:"live",permission:"jobs.view"},{id:"crm",group:"Workspace",label:"CRM",icon:"ti-users-group",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"contacts",group:"Workspace",label:"Contacts",icon:"ti-address-book",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"tickets",group:"Workspace",label:"Tickets",icon:"ti-ticket",symbol:"q-symbol-tickets",status:"planned"},{id:"finance",group:"Workspace",label:"Finance",icon:"ti-receipt-dollar",symbol:"q-symbol-finance",status:"live",permission:"finance.view"},{id:"knowledge",group:"Workspace",label:"Knowledge Base",icon:"ti-books",symbol:"q-symbol-knowledge",status:"planned"},{id:"automations",group:"Workspace",label:"Automations",icon:"ti-automation",symbol:"q-symbol-automations",status:"planned"},{id:"templates",group:"Workspace",label:"Templates",icon:"ti-template",symbol:"q-symbol-templates",status:"planned"},{id:"users",group:"Company",label:"Users",icon:"ti-users",symbol:"q-symbol-users",status:"live",permission:"users.view"},{id:"messages",group:"Company",label:"Messages",icon:"ti-messages",symbol:"q-symbol-messages",status:"live",permission:"messages.view"},{id:"settings",group:"Company",label:"Settings",icon:"ti-settings",symbol:"q-symbol-settings",status:"live",permission:"settings.view"},{id:"team-chart",group:"Company",label:"Team chart",icon:"ti-hierarchy-3",symbol:"q-symbol-team-chart",status:"live",permission:"team.view"},{id:"time",group:"Operations",label:"My time",icon:"ti-clock",symbol:"q-symbol-time",status:"live",permission:"time.track"},{id:"calendar",group:"Operations",label:"Calendar",icon:"ti-calendar",symbol:"q-symbol-calendar",status:"live",permission:"calendar.view"},{id:"approvals",group:"Operations",label:"Approvals",icon:"ti-user-check",symbol:"q-symbol-approvals",status:"live",permission:"approvals.view"},{id:"team-workload",group:"Operations",label:"Team workload",icon:"ti-users",symbol:"q-symbol-team-workload",status:"planned"},{id:"clock",group:"Operations",label:"Clock dashboard",icon:"ti-clock-hour-4",symbol:"q-symbol-clock",status:"live",permission:"clock.manage"}],no=[{label:"Command",ids:["home","contacts","messages","calendar"]},{label:"Work",ids:["jobs","tasks","files","forms","crm"]},{label:"Money",ids:["finance","analytics"]},{label:"People",ids:["users","team-chart","time","approvals","clock"]},{label:"Control",ids:["settings"]},{label:"Future",ids:["tickets","knowledge","automations","templates","team-workload"]}],so={"/admin.html":"settings","/automations.html":"automations","/calendar.html":"calendar","/crm.html":"crm","/dashboards.html":"analytics","/files.html":"files","/finance.html":"finance","/forms.html":"forms","/jobs.html":"jobs","/knowledge.html":"knowledge","/messages.html":"messages","/templates.html":"templates","/tickets.html":"tickets"},io=[{name:"Unscheduled",color:"#9AA0A8"},{name:"Scheduled",color:"#378ADD"},{name:"Material ordered",color:"#3C7BD0"},{name:"In production",color:"#BA7517"},{name:"QC / punch list",color:"#C08A2B"},{name:"Invoiced",color:"#7F77DD"},{name:"Paid / closed",color:"#639922"},{name:"On hold",color:"#C4C7CC"}],ro=[{name:"Prospects",color:"#9AA0A8"},{name:"Leads",color:"#378ADD"},{name:"Underwriting",color:"#BA7517"},{name:"Estimate sent",color:"#3C7BD0"},{name:"Negotiating",color:"#C08A2B"},{name:"Contract out",color:"#7F77DD"},{name:"Won",color:"#639922"},{name:"Follow-up",color:"#C4C7CC"},{name:"Lost",color:"#E24B4A"}],Ds=["#9AA0A8","#378ADD","#BA7517","#7F77DD","#639922","#E24B4A","#3C7BD0","#C08A2B","#5AB0A6","#C4C7CC"],tn={Lead:"Unscheduled","Site Review":"Scheduled",Estimate:"Material ordered",Approved:"In production",Active:"In production",Closed:"Paid / closed"};function ui(e,t){const a=de(e,null);return!Array.isArray(a)||!a.length?t.map(n=>({...n})):a.map(n=>({name:String(n?.name||"").trim(),color:/^#[0-9a-fA-F]{3,8}$/.test(String(n?.color||""))?n.color:"#9AA0A8"})).filter(n=>n.name)}let ue=ui(ti,io),me=ui(ai,ro);function Cs(){return ue}function js(){return me}function Ma(){return ue.map(e=>e.name)}function wt(){return me.map(e=>e.name)}function mi(e){return(ue.find(t=>t.name===e)||{}).color||"#9AA0A8"}function pi(e){return(me.find(t=>t.name===e)||{}).color||"#9AA0A8"}function kn(e){return e==="contacts"?me:ue}function oo(e,t){return e==="contacts"?pi(t):mi(t)}function fi(e){const t=Ma(),a=String(e||"").trim();return t.includes(a)?a:tn[a]&&t.includes(tn[a])?tn[a]:t[0]||"Unscheduled"}function lo(e){const t=wt(),a=String(e||"").trim();return t.includes(a)?a:t[0]||"Prospects"}function Dn(){ue=ue.filter(e=>e.name),k(ti,ue)}function Cn(){me=me.filter(e=>e.name),k(ai,me)}const gi=["pipeline","list","profile"],xt=["todo","pending","hold","review","done"],oa=["critical","urgent","high","medium","low"],bi=["lead","bid","admin","invoicing","ar","meeting","web_dev"],Fa=["Company event","Job visit / inspection","Estimate appointment","Install / field work","Internal meeting","Personal reminder"],co=["Task due","Invoice due","Approval","Time"].concat(Fa),uo="https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons@master/icons/",mo=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],jn=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],Ot=["Inspection","Client approval","Intake","Survey","Safety","Internal"],An=["Draft","Published","Archived"],_i=["Draft","Sent","Partially paid","Paid","Overdue","Void"],vi=["Pending","Approved","Paid","Rejected"],yi=["Active","On hold","Inactive"],hi=["ACH","Check","Card","Cash","Wire","Other"],Ia=["Materials","Labor","Subcontractor","Permit","Equipment","Marketing","Software","Travel","Other"],qn=["company","role","custom","direct"],Rt=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],Pt=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],$i=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],po=[{id:"contact-1",company_id:"roofing",name:"William Moran",phone:"928-231-0147",email:"wrmoran@gmail.com",location:"Future project",stage:"Prospects",value:0,owner_name:"Abraham Flores"},{id:"contact-2",company_id:"roofing",name:"Valerie McKenzie",phone:"602-750-5678",email:"",location:"6054 E Blanche Dr, Scottsdale",stage:"Prospects",value:0,owner_name:"Maya Rosales"},{id:"contact-3",company_id:"roofing",name:"April Reyes",phone:"480-277-1540",email:"",location:"451 E 10th Ave, Mesa",stage:"Leads",value:14500,owner_name:"Andre Lee"},{id:"contact-4",company_id:"roofing",name:"Mario Esquivel",phone:"480-955-4036",email:"esquivel@residence.com",location:"Costa Bella Residence",stage:"Leads",value:22e3,owner_name:"Maya Rosales"},{id:"contact-5",company_id:"roofing",name:"Mike - Maricopa",phone:"503-317-4788",email:"",location:"Maricopa",stage:"Underwriting",value:31e3,owner_name:"Andre Lee"},{id:"contact-6",company_id:"roofing",name:"Kumar Residence",phone:"",email:"",location:"16750 E Nicklaus Dr, Fountain Hills",stage:"Estimate sent",value:47800,owner_name:"Maya Rosales"},{id:"contact-7",company_id:"roofing",name:"Keith Salas",phone:"717-991-7029",email:"",location:"15948 E Sycamore",stage:"Negotiating",value:28900,owner_name:"Andre Lee"},{id:"contact-8",company_id:"roofing",name:"Brad Lundstrom",phone:"602-577-9523",email:"lundstromdesign@gmail.com",location:"3200 W Wander Ln",stage:"Contract out",value:53200,owner_name:"Abraham Flores"},{id:"contact-9",company_id:"roofing",name:"Rosa Cruz-Blanch",phone:"787-549-0942",email:"rcruz@natlbtr.com",location:"W Encanto Blvd",stage:"Won",value:61e3,owner_name:"Maya Rosales"},{id:"contact-10",company_id:"drafting",name:"Horizon HVAC",phone:"480-555-0199",email:"plans@horizonhvac.com",location:"Chandler, AZ",stage:"Estimate sent",value:4200,owner_name:"Noah Park"}],wi=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"],supervisor_id:""},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"],supervisor_id:"abraham"},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"],supervisor_id:"maya"},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"],supervisor_id:"abraham"},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"],supervisor_id:""}],Si=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],ki=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:D(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:D(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:D(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:D(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:D(5),priority:"medium",urgency:"medium",status:"todo"}],Di=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],Ci=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",creator_id:"abraham",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",creator_id:"maya",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",creator_id:"noah",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",creator_id:"lumen-ops",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],ji=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],Ai=[{id:"vendor-roofing-materials",company_id:"roofing",name:"Valley Roofing Supply",contact_name:"Elena Ortiz",email:"orders@valleyroofingsupply.local",phone:"(480) 555-0190",category:"Materials",status:"Active",notes:"Primary tile, flashing, and underlayment vendor.",created_at:new Date(Date.now()-12096e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"vendor-roofing-dryin",company_id:"roofing",name:"Monsoon Dry-In Crew",contact_name:"R. Alvarez",email:"dispatch@monsoondryin.local",phone:"(602) 555-0144",category:"Subcontractor",status:"Active",notes:"Emergency dry-in support during storm calls.",created_at:new Date(Date.now()-10368e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"vendor-drafting-permits",company_id:"drafting",name:"Permit Runner AZ",contact_name:"Sofia Chen",email:"permits@runneraz.local",phone:"(602) 555-0171",category:"Permit",status:"Active",notes:"Permit filing support for drafting packets.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString()},{id:"vendor-lumen-software",company_id:"lumen",name:"Lumen SaaS Stack",contact_name:"Ops Billing",email:"billing@lumenstack.local",phone:"",category:"Software",status:"Active",notes:"Internal software subscriptions for client onboarding.",created_at:new Date(Date.now()-7776e5).toISOString(),updated_at:new Date(Date.now()-3456e5).toISOString()}],qi=[{id:"invoice-roofing-queen-creek",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",client_name:"Rosales Residence",invoice_number:"QR-1007",status:"Partially paid",issue_date:D(-10),due_date:D(5),subtotal:6800,tax:0,total:6800,notes:"Emergency leak repair billing with deposit received.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"invoice-roofing-mesa-storage",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",client_name:"Mesa Storage Partners",invoice_number:"QR-1008",status:"Sent",issue_date:D(-18),due_date:D(-2),subtotal:18400,tax:0,total:18400,notes:"Estimate packet sent to board for approval.",created_at:new Date(Date.now()-15552e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-drafting-horizon",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",client_name:"Horizon HVAC",invoice_number:"QD-2031",status:"Sent",issue_date:D(-7),due_date:D(14),subtotal:4200,tax:0,total:4200,notes:"Drafting permit package milestone invoice.",created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-lumen-onboarding",company_id:"lumen",job_id:"",client_name:"Lumen Internal Launch",invoice_number:"LM-3004",status:"Draft",issue_date:D(-3),due_date:D(27),subtotal:3200,tax:0,total:3200,notes:"Demo onboarding package used for finance workspace.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()}],Mi=[{id:"payment-roofing-queen-creek-deposit",company_id:"roofing",invoice_id:"invoice-roofing-queen-creek",amount:2500,method:"ACH",received_at:D(-4),reference:"ACH-4421",notes:"Deposit received after dry-in visit.",created_at:new Date(Date.now()-3456e5).toISOString()},{id:"payment-drafting-horizon-retainer",company_id:"drafting",invoice_id:"invoice-drafting-horizon",amount:1e3,method:"Check",received_at:D(-1),reference:"CHK-117",notes:"Retainer collected before permit packet completion.",created_at:new Date(Date.now()-864e5).toISOString()}],Fi=[{id:"expense-roofing-queen-creek-materials",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",vendor_id:"vendor-roofing-materials",category:"Materials",amount:1850,status:"Approved",spent_at:D(-6),notes:"Underlayment, flashing, and tile replacement materials.",created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-roofing-mesa-permit",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",vendor_id:"vendor-roofing-materials",category:"Permit",amount:620,status:"Pending",spent_at:D(-2),notes:"Permit and document prep allowance.",created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString()},{id:"expense-drafting-horizon-runner",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",vendor_id:"vendor-drafting-permits",category:"Permit",amount:480,status:"Approved",spent_at:D(-3),notes:"Permit runner package review.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-lumen-software-stack",company_id:"lumen",job_id:"",vendor_id:"vendor-lumen-software",category:"Software",amount:540,status:"Paid",spent_at:D(-5),notes:"Client onboarding software stack.",created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()}],Ii=[{id:"notification-roofing-task-assigned",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.assigned",title:"Task assigned",body:"Abraham assigned Leak inspection photos to you.",href:"/company/roofing/tasks?job_id=roofing-leak&task_id=task-roofing-leak-1",source_type:"task",source_id:"task-roofing-leak-1",read_at:"",created_at:new Date(Date.now()-7*6e4).toISOString()},{id:"notification-roofing-task-priority",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.priority",title:"Task priority changed",body:"Shan set priority to Urgent on HOA board approval package.",href:"/company/roofing/tasks?job_id=roofing-mesa&task_id=task-roofing-mesa-1",source_type:"task",source_id:"task-roofing-mesa-1",read_at:"",created_at:new Date(Date.now()-19*6e4).toISOString()},{id:"notification-roofing-approval",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"approval.ready",title:"Approval needs review",body:"Estimate approval is waiting in the company review queue.",href:"/company/roofing/approvals",source_type:"form",source_id:"form-roofing-estimate-approval",read_at:new Date(Date.now()-5*6e4).toISOString(),created_at:new Date(Date.now()-44*6e4).toISOString()},{id:"notification-drafting-task-review",company_id:"drafting",recipient_profile_id:"basic-quest-user",type:"task.status",title:"Task moved to review",body:"Drawing package QA is ready for review.",href:"/company/drafting/tasks?job_id=drafting-package&task_id=task-drafting-package-1",source_type:"task",source_id:"task-drafting-package-1",read_at:"",created_at:new Date(Date.now()-63*6e4).toISOString()},{id:"notification-lumen-finance",company_id:"lumen",recipient_profile_id:"basic-quest-user",type:"finance.invoice",title:"Invoice drafted",body:"Lumen onboarding invoice is ready for payment tracking.",href:"/company/lumen/finance?invoice=invoice-lumen-onboarding",source_type:"invoice",source_id:"invoice-lumen-onboarding",read_at:"",created_at:new Date(Date.now()-92*6e4).toISOString()}],Mn=[{id:"msg-conv-roofing-all",company_id:"roofing",title:"Roofing dispatch",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-16*6e4).toISOString(),created_at:new Date(Date.now()-864e5).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-conv-roofing-crew",company_id:"roofing",title:"Roofing crew",type:"role",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-52*6e4).toISOString(),created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-conv-roofing-direct-shan",company_id:"roofing",title:"Shan Kumar",type:"direct",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-8*6e4).toISOString(),created_at:new Date(Date.now()-36e5).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-conv-drafting-all",company_id:"drafting",title:"Drafting review",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-74*6e4).toISOString(),created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-conv-lumen-product",company_id:"lumen",title:"Lumen launch room",type:"custom",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-38*6e4).toISOString(),created_at:new Date(Date.now()-216e5).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],Fn=[{id:"msg-access-roofing-all",conversation_id:"msg-conv-roofing-all",company_id:"roofing",target_type:"all_company",target_id:"all"},{id:"msg-access-roofing-crew-role",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",target_type:"role",target_id:"staff-roofing"},{id:"msg-access-roofing-direct-basic",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-roofing-direct-shan",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"shan"},{id:"msg-access-drafting-all",conversation_id:"msg-conv-drafting-all",company_id:"drafting",target_type:"all_company",target_id:"all"},{id:"msg-access-lumen-basic",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-lumen-role",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"role",target_id:"admin-lumen"}],In=[{id:"msg-roofing-all-1",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"abraham",body:"Morning check: Mesa HOA estimate needs photos before noon.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-48*6e4).toISOString(),updated_at:new Date(Date.now()-48*6e4).toISOString()},{id:"msg-roofing-all-2",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"basic-quest-user",body:"Got it. I am linking the job files now.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-16*6e4).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-roofing-crew-1",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",sender_profile_id:"shan",body:"@Joshua bring the permit packet when you head to Arroyo.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-52*6e4).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-roofing-direct-1",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",sender_profile_id:"shan",body:"Can you confirm the roof access photo uploaded correctly?",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-8*6e4).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-drafting-all-1",conversation_id:"msg-conv-drafting-all",company_id:"drafting",sender_profile_id:"abraham",body:"Horizon package QA is ready. Please keep notes in this thread.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-74*6e4).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-lumen-product-1",conversation_id:"msg-conv-lumen-product",company_id:"lumen",sender_profile_id:"basic-quest-user",body:"Finance and CRM are live enough for internal walkthrough. Next focus is polish and permissions.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-38*6e4).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],En=[{id:"msg-attachment-roofing-photo",conversation_id:"msg-conv-roofing-crew",message_id:"msg-roofing-crew-1",company_id:"roofing",bucket_id:"quest-message-attachments",object_path:"",file_name:"roof-access-photo.jpg",mime_type:"image/jpeg",size_bytes:184e3,preview_url:"",created_at:new Date(Date.now()-52*6e4).toISOString()}],Tn=[{conversation_id:"msg-conv-roofing-all",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:new Date(Date.now()-10*6e4).toISOString()},{conversation_id:"msg-conv-roofing-crew",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-drafting-all",company_id:"drafting",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-lumen-product",company_id:"lumen",profile_id:"basic-quest-user",last_read_at:""}],Ei=[{id:"calendar-roofing-install",company_id:"roofing",title:"East ridge install window",description:"Crew visit for install prep and materials check.",event_type:"Install / field work",starts_at:`${D(1)}T14:00:00.000Z`,ends_at:`${D(1)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"job",linked_id:"job-east-ridge",assigned_profile_id:"abraham",created_by:"basic-quest-user"},{id:"calendar-roofing-estimate",company_id:"roofing",title:"Garage roof estimate",description:"Client walkthrough and estimate appointment.",event_type:"Estimate appointment",starts_at:`${D(3)}T16:00:00.000Z`,ends_at:`${D(3)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"shan",created_by:"basic-quest-user"},{id:"calendar-drafting-review",company_id:"drafting",title:"Plan review block",description:"Drafting team review for active plan updates.",event_type:"Internal meeting",starts_at:`${D(2)}T15:00:00.000Z`,ends_at:`${D(2)}T15:45:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"",created_by:"basic-quest-user"},{id:"calendar-lumen-product",company_id:"lumen",title:"Quest HQ product review",description:"Review workspace permissions, messages, and calendar flow.",event_type:"Company event",starts_at:`${D(4)}T18:00:00.000Z`,ends_at:`${D(4)}T19:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"basic-quest-user",created_by:"basic-quest-user"}],s={route:null,session:de(Xe,null),profileDraft:de(ei,null),authReady:!1,authMode:"signin",jobs:q(ya,$i).map(st),contacts:q(pn,po).map(ts),tasks:q(fn,ki).map(it),files:q(gn,Di).map(jt),driveFolders:q(bn,[]).map(as),forms:q(ct,Ci).map(Yt),formResponses:q(ha,ji).map(ns),financeInvoices:q(yn,qi).map(Ht),financePayments:q(hn,Mi).map(Wt),financeExpenses:q($n,Fi).map(zt),financeVendors:q(wn,Ai).map(Jt),notifications:q(Sa,Ii).map(qt),messageConversations:q(ka,Mn).map(Se),messageAccess:q(Da,Fn).map(ae),messages:q(Ca,In).map(je),messageReads:q(ja,Tn).map(Kt),messageAttachments:q(Aa,En).map(Re),calendarEvents:q(qa,Ei).map(rt),timeEntries:de($a,[]),activeTimer:de(wa,null),teamMembers:q(_n,wi).map(ss),memberships:q(vn,Si),profiles:[],subscriptions:[],workspaceReviews:[],roles:[],rolePermissions:[],roleAssignments:[],resourceAcl:[],fieldPermissions:[],companyInvites:[],joinRequests:[],auditEvents:[],companies:es(Pt.map(nt)),activeCompanyId:localStorage.getItem(Ae)||"",sidebarCollapsed:localStorage.getItem(ii)==="true",collapsedNavGroups:new Set(de(ri,[])),expandedNav:new Set(de(oi,["contacts","jobs"])),jobBoardView:localStorage.getItem(li)||"board",contactBoardView:localStorage.getItem(ci)||"table",contactStageFilter:"all",contactQuery:"",selectedContactId:"",selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",selectedFinanceInvoiceId:"",selectedFinanceExpenseId:"",selectedFinanceVendorId:"",selectedCalendarEventId:"",inviteLookup:null,expandedFormIds:new Set,formStartTemplateId:"",formStartTab:"blank",query:"",fileQuery:"",formQuery:"",crmQuery:"",stageFilter:"all",crmStageFilter:"all",crmOwnerFilter:"all",messageQuery:"",messageFilter:"all",selectedConversationId:"",messageRealtimeChannel:null,messageRealtimeKey:"",calendarScope:"company",calendarView:"week",calendarQuery:"",calendarTypeFilter:"all",calendarCursorDate:D(0),taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(ni)||"table",driveFolder:"home",driveView:localStorage.getItem(si)||"list",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",authMessage:"",toast:null,toastTimer:null,modal:"",accountMenuOpen:!1,notificationMenuOpen:!1,rolePreview:null},Ea=document.getElementById("app");let an=null;fo();function fo(){Kd(),window.addEventListener("popstate",p),document.addEventListener("click",Xc),document.addEventListener("submit",ad),document.addEventListener("input",Md),document.addEventListener("change",Fd),go(),p()}async function go(){if(s.session?.auth==="local-basic"){Ti(),s.authReady=!0;return}const e=M();if(!e?.auth){s.authReady=!0,s.loginError="Supabase auth is unavailable in this browser session.";return}try{const{data:t}=await e.auth.getSession();await St(t?.session||null),e.auth.onAuthStateChange((a,n)=>{St(n||null).finally(()=>{s.dataLoaded=!1,p()})})}catch(t){s.loginError=t.message||"Unable to initialize Supabase auth."}finally{s.authReady=!0,p()}}async function St(e){if(!e?.user){s.session=null,localStorage.removeItem(Xe);return}const t=await bo(e.user);s.session=rm(e,t),wo(),k(Xe,s.session)}async function bo(e){const t={id:e.id,email:e.email||"",full_name:e.user_metadata?.full_name||e.email||"Quest user",role:"member",role_label:"Member",member_id:"",company_ids:[],avatar_url:"",approved:!1,email_verified:!!e.email_confirmed_at},a=M();if(!a)return t;const n=await a.from("profiles").select("*").eq("id",e.id).maybeSingle();return n.error||!n.data?t:At(n.data,t)}function p(){if(s.route=Nt(),!s.authReady){yo();return}if(s.route.name==="home"){Os(!1);return}if(s.route.name==="login"){Os(!0);return}if(vo(s.route)){A("/login?return_url="+encodeURIComponent(Zd()),{replace:!0});return}if(ho(),s.session?.auth==="supabase"&&s.dataLoaded&&!Qe().length){_o();return}const e=Gd(s.route);if(e){A(e,{replace:!0});return}au(s.route),sr(s.route),s.route.params.get("account")==="profile"&&(s.modal="profile"),document.title=`${Xd(s.route)} | ${E(u())} | Quest HQ`,Ea.innerHTML=Do(s.route,Ni(s.route))}function _o(){document.title="Company access pending | Quest HQ",Ea.innerHTML=`
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
  `}function vo(e){return e.name==="login"||e.name==="home"?!1:!s.session}function yo(){document.title="Loading | Quest HQ",Ea.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${v("Checking secure session...")}
      </section>
    </main>
  `}function ho(){s.dataLoaded||s.dataLoading||(s.dataLoading=!0,$o().catch(()=>{s.sync={label:"Local fallback",mode:"local"}}).finally(()=>{s.dataLoaded=!0,s.dataLoading=!1,te(),p()}))}async function $o(){if(s.session?.auth==="local-basic"){s.sync={label:"Demo mode",mode:"local"};return}const e=M();if(!e){s.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,n,i,o,l,c,d,f,g,S,U,O,se,Ee,L,fs,gs,bs,_s,vs,ys,hs,$s,ws,Ss,ks]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*"),e.from("profiles").select("*"),e.from("company_subscriptions").select("*"),e.from("roles").select("*").order("priority",{ascending:!1}),e.from("role_permissions").select("*"),e.from("user_role_assignments").select("*"),e.from("resource_acl").select("*"),e.from("field_permissions").select("*"),e.from("company_invites").select("*").order("created_at",{ascending:!1}),e.from("company_join_requests").select("*").order("created_at",{ascending:!1}),e.from("audit_events").select("*").order("created_at",{ascending:!1}).limit(100),e.from("message_conversations").select("*").order("last_message_at",{ascending:!1}),e.from("message_conversation_access").select("*"),e.from("messages").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_attachments").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_reads").select("*"),e.from("calendar_events").select("*").order("starts_at",{ascending:!0}),e.from("notifications").select("*").order("created_at",{ascending:!1}).limit(200),e.from("finance_invoices").select("*").order("updated_at",{ascending:!1}),e.from("finance_payments").select("*").order("received_at",{ascending:!1}),e.from("finance_expenses").select("*").order("spent_at",{ascending:!1}),e.from("finance_vendors").select("*").order("name",{ascending:!0})]);let le=0;if(t.error||(s.companies=(t.data||[]).map(nt),le+=1),a.error||(s.jobs=(a.data||[]).map(st),le+=1),n.error||(s.tasks=(n.data||[]).map(it),le+=1),i.error||(s.files=(i.data||[]).map(jt),le+=1),o.error||(s.teamMembers=(o.data||[]).map(ss),le+=1),l.error||(s.memberships=(l.data||[]).map(pa),le+=1),c.error||(s.profiles=(c.data||[]).map(Zt=>At(Zt)),le+=1),d.error||(s.subscriptions=(d.data||[]).map(fa),le+=1),f.error||(s.roles=(f.data||[]).map(Ke),le+=1),g.error||(s.rolePermissions=(g.data||[]).map(dn)),S.error||(s.roleAssignments=(S.data||[]).map(jr)),U.error||(s.resourceAcl=(U.data||[]).map(Bu)),O.error||(s.fieldPermissions=(O.data||[]).map(Yu)),se.error||(s.companyInvites=(se.data||[]).map(ga)),Ee.error||(s.joinRequests=(Ee.data||[]).map(Ar)),L.error||(s.auditEvents=L.data||[]),fs.error||(s.messageConversations=(fs.data||[]).map(Se)),gs.error||(s.messageAccess=(gs.data||[]).map(ae)),bs.error||(s.messages=(bs.data||[]).map(je)),_s.error||(s.messageAttachments=(_s.data||[]).map(Re)),vs.error||(s.messageReads=(vs.data||[]).map(Kt)),ys.error||(s.calendarEvents=(ys.data||[]).map(rt)),hs.error||(s.notifications=(hs.data||[]).map(qt)),$s.error||(s.financeInvoices=($s.data||[]).map(Ht),le+=1),ws.error||(s.financePayments=(ws.data||[]).map(Wt)),Ss.error||(s.financeExpenses=(Ss.data||[]).map(zt)),ks.error||(s.financeVendors=(ks.data||[]).map(Jt)),Zn()){const Zt=await e.rpc("list_workspace_reviews").catch(en=>({error:en}));if(!Zt.error){s.workspaceReviews=(Zt.data||[]).map(ht);const en=s.workspaceReviews.map(re=>nt({id:re.company_id,name:re.company_name,short_name:re.company_name})),eo=s.workspaceReviews.map(re=>fa({company_id:re.company_id,status:re.status,plan_code:re.plan_code,amount_cents:re.amount_cents,currency:re.currency,trial_ends_at:re.trial_ends_at,current_period_end:re.current_period_end,grace_ends_at:re.grace_ends_at}));s.companies=es(s.companies.concat(en)),s.subscriptions=Cr(s.subscriptions.concat(eo))}}s.sync=le?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function M(){return!window.supabase||typeof window.supabase.createClient!="function"?null:(an||(an=window.supabase.createClient(Ze.supabaseUrl,Ze.supabaseKey)),an)}function wo(){s.jobs=[],s.tasks=[],s.files=[],s.driveFolders=[],s.forms=[],s.formResponses=[],s.financeInvoices=[],s.financePayments=[],s.financeExpenses=[],s.financeVendors=[],s.notifications=[],s.messageConversations=[],s.messageAccess=[],s.messages=[],s.messageReads=[],s.messageAttachments=[],s.calendarEvents=[],s.timeEntries=[],s.activeTimer=null,s.teamMembers=[],s.memberships=[],s.profiles=[],s.subscriptions=[],s.workspaceReviews=[],s.roles=[],s.rolePermissions=[],s.roleAssignments=[],s.resourceAcl=[],s.fieldPermissions=[],s.companyInvites=[],s.joinRequests=[],s.auditEvents=[],s.companies=[],s.sync={label:"Loading secure workspace...",mode:"loading"}}function Ti(){s.jobs=q(ya,$i).map(st),s.tasks=q(fn,ki).map(it),s.files=q(gn,Di).map(jt),s.driveFolders=q(bn,[]).map(as),s.forms=q(ct,Ci).map(Yt),s.formResponses=q(ha,ji).map(ns),s.financeInvoices=q(yn,qi).map(Ht),s.financePayments=q(hn,Mi).map(Wt),s.financeExpenses=q($n,Fi).map(zt),s.financeVendors=q(wn,Ai).map(Jt),s.notifications=q(Sa,Ii).map(qt),s.messageConversations=q(ka,Mn).map(Se),s.messageAccess=q(Da,Fn).map(ae),s.messages=q(Ca,In).map(je),s.messageReads=q(ja,Tn).map(Kt),s.messageAttachments=q(Aa,En).map(Re),s.calendarEvents=q(qa,Ei).map(rt),s.timeEntries=de($a,[]),s.activeTimer=de(wa,null),s.teamMembers=q(_n,wi).map(ss),s.memberships=q(vn,Si),s.profiles=[],s.subscriptions=[],s.workspaceReviews=[],s.roles=[],s.rolePermissions=[],s.roleAssignments=[],s.resourceAcl=[],s.fieldPermissions=[],s.companyInvites=[],s.joinRequests=[],s.auditEvents=[],s.companies=es(Pt.map(nt)),s.sync={label:"Demo mode",mode:"local"}}function So(){return`
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
  `}function B(e,t="symbol-icon"){return`<svg class="${r(t)}" aria-hidden="true" focusable="false"><use href="#${r(e)}"></use></svg>`}function xi(e=s.route?.section||"jobs"){return dt.find(t=>t.id===e)?.symbol||"q-empty"}function ko(e){const t=String(e||"").toLowerCase();return t.includes("job")||t.includes("pipeline")?"q-symbol-jobs":t.includes("task")||t.includes("review")?"q-symbol-tasks":t.includes("file")?"q-symbol-files":t.includes("form")?"q-symbol-forms":t.includes("account")||t.includes("customer")||t.includes("member")||t.includes("user")||t.includes("lead")?"q-symbol-crm":t.includes("invoice")||t.includes("collected")||t.includes("expense")||t.includes("net")||t.includes("outstanding")?"q-symbol-finance":t.includes("time")||t.includes("today")||t.includes("days")||t.includes("timer")||t.includes("entries")?"q-symbol-clock":t.includes("approval")||t.includes("access")?"q-symbol-approvals":xi()}function Do(e,t){const a=b(),n=u(),i=lm(a);return`
    <div class="quest-app ${s.sidebarCollapsed?"sidebar-collapsed":""}" data-route="${r(e.name)}">
      ${So()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${_(m("home",{},n))}" data-router aria-label="Quest HQ workspace">
            ${B("q-logo","brand-symbol")}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${r(Ze.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${B("q-company")}
            <select data-company-switch aria-label="Active company">
              ${Va().map(o=>`<option value="${r(o.id)}" ${o.id===n?"selected":""}>${r(pt(o))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            ${B("q-search")}
            <input data-global-search value="${r(s.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${r(s.sync.mode)}" data-sync-state>${r(s.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          ${Ao(n)}
          <div class="account-menu ${s.accountMenuOpen?"open":""}">
            <button class="avatar-button" type="button" data-action="toggle-account-menu" aria-label="Open account menu" aria-expanded="${s.accountMenuOpen?"true":"false"}">
              ${X(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${r(a.profile.full_name)}</strong>
              <span>${r(a.profile.role_label)} - ${r(E(n))}</span>
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
      ${Co(n)}
      ${Mo(n)}
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${Fo(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
      ${jo(e,n)}
    </div>
    ${Vc(e,a)}
    ${Xi()}
  `}function Co(e){const t=ne(e).filter(i=>i.status==="active").length,a=K(e).filter(i=>i.status!=="done"&&i.due&&new Date(i.due)<gt()).length,n=ee(e)?"Good":"Pending";return`
    <div class="mobile-status-rail" aria-label="Workspace status">
      <a href="${_(m("settings",{tab:"billing"},e))}" data-router>
        ${B("q-symbol-approvals")}<span>${r(Wa(e))}</span>
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
  `}function jo(e,t){const a=h("messages.view",t)?Nn(t):0,n=h("files.view",t)?$e(t).length:"",i=Q(t).length+K(t).filter(o=>o.status!=="done").length;return`
    <nav class="mobile-tabbar" aria-label="Mobile workspace navigation">
      ${bt(e,m("home",{},t),"ti-home","Home","",["home"])}
      ${bt(e,m("jobs",{},t),"ti-layout-grid","Work",i,["jobs","tasks","calendar","crm","finance","forms","users","time","approvals","clock","team-chart"])}
      ${bt(e,m("messages",{},t),"ti-message-circle","Messages",a,["messages"])}
      ${bt(e,m("files",{},t),"ti-folder","Files",n,["files"])}
      ${bt(e,m("settings",{},t),"ti-dots","More","",["settings","analytics"])}
    </nav>
  `}function bt(e,t,a,n,i,o){return`
    <a class="${e.name==="company"&&o.includes(e.section)?"active":""}" href="${_(t)}" data-router>
      <i class="ti ${r(a)}"></i>
      ${i?`<b>${r(String(Math.min(Number(i)||0,99)))}</b>`:""}
      <span>${r(n)}</span>
    </a>
  `}function Ao(e){const t=ir(e),a=t.filter(n=>!n.read_at).length;return`
    <div class="notification-center ${s.notificationMenuOpen?"open":""}">
      <button class="icon-button notification-button" type="button" data-action="toggle-notifications" aria-label="Open notifications" aria-expanded="${s.notificationMenuOpen?"true":"false"}">
        <i class="ti ti-bell"></i>
        ${a?`<b>${r(String(Math.min(a,99)))}</b>`:""}
      </button>
      <div class="notification-popover" role="dialog" aria-label="Notifications">
        <div class="notification-head">
          <div><strong>Inbox</strong><span>${r(E(e))}</span></div>
          <button type="button" data-action="mark-all-notifications-read" ${a?"":"disabled"}>Mark all read</button>
        </div>
        <div class="notification-list">
          ${t.slice(0,12).map(n=>qo(n)).join("")||v("No notifications yet.")}
        </div>
      </div>
    </div>
  `}function qo(e){return`
    <button class="notification-item ${e.read_at?"read":"unread"}" type="button" data-action="open-notification" data-notification-id="${r(e.id)}">
      <span></span>
      <div>
        <small>${r(Or(e.type))} - ${r(e.title)} - ${r(ft(e.created_at))}</small>
        <strong>${r(e.body)}</strong>
      </div>
    </button>
  `}function Mo(e){const t=La(e);return t?`
    <div class="role-preview-banner" style="--role-color:${r(t.color)}">
      <span></span>
      <div>
        <strong>Viewing as ${r(t.name)}</strong>
        <small>Permission preview only. Your real account has not changed.</small>
      </div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
  `:""}function Fo(e){const t=u(),a=b(),n=new Map(dt.map(i=>[i.id,i]));return`
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
      <span class="company-card-symbol" style="--company-accent:${r(Me(t))}">${B("q-company")}</span>
      <div>
        <strong>${r(E(t))}</strong>
        <small>${r(at(t))} workspace</small>
      </div>
    </div>
    <div class="deck-scroll">
      ${no.map(i=>{const o=i.ids.map(l=>n.get(l)).filter(l=>l&&Ri(l,t)).map(l=>l.status==="planned"?xo(l.symbol,l.label):l.id==="jobs"||l.id==="contacts"?To(e,l,t):Eo(e,m(l.id,{},t),l.symbol,l.label,Pi(l.id,t)));return Io(i.label,o)}).join("")}
    </div>
    <div class="deck-footer">
      <a class="deck-company-switch" href="${_(m("settings",{tab:"company"},t))}" data-router>
        ${B("q-company")}
        <span><strong>${r(E(t))}</strong><small>Workspace</small></span>
        <i class="ti ti-chevron-down"></i>
      </a>
      <button class="deck-user-card" type="button" data-action="open-profile">
        ${X(a.profile,"avatar small")}
        <span><strong>${r(a.profile.full_name)}</strong><small>${r(at(t))}</small></span>
        <i class="ti ti-dots-vertical"></i>
      </button>
    </div>
  `}function Io(e,t){if(!t.length)return"";const a=s.collapsedNavGroups.has(e);return`
    <section class="side-group ${a?"collapsed":""}">
      <button class="side-label" type="button" data-action="toggle-nav-group" data-group="${r(e)}" aria-expanded="${a?"false":"true"}" title="${a?"Expand":"Collapse"} ${r(e)}">
        <span>${r(e)}</span>
        <i class="ti ti-chevron-down side-label-chevron" aria-hidden="true"></i>
      </button>
      <div class="side-items">${t.join("")}</div>
    </section>
  `}function Eo(e,t,a,n,i=""){return`
    <a class="side-item ${nr(e,t)?"active":""}" href="${_(t)}" data-router title="${r(n)}" aria-label="${r(n)}">
      ${B(a)}
      <span>${r(n)}</span>
      ${i!==""?`<b>${r(String(i))}</b>`:""}
    </a>
  `}function Oi(e,t=u()){const a=e==="contacts"?Qa(t):Q(t),n={};return a.forEach(i=>{n[i.stage]=(n[i.stage]||0)+1}),n}function To(e,t,a){const n=t.id,i=m(n,{},a),o=nr(e,i),l=s.expandedNav.has(n),c=Pi(n,a),d=e.name==="company"&&e.section===n,f=n==="contacts"?s.contactStageFilter:s.stageFilter,g=kn(n),S=Oi(n,a);return`
    <div class="side-pipe ${l?"expanded":""}">
      <div class="side-pipe-head">
        <a class="side-item ${o?"active":""}" href="${_(i)}" data-router data-action="pipeline-open" data-module="${n}" title="${r(t.label)}" aria-label="${r(t.label)}">
          ${B(t.symbol)}
          <span>${r(t.label)}</span>
          ${c!==""?`<b>${r(String(c))}</b>`:""}
        </a>
        <button class="side-pipe-toggle" type="button" data-action="toggle-nav-expand" data-module="${n}" aria-expanded="${l?"true":"false"}" aria-label="${l?"Collapse":"Expand"} ${r(t.label)} stages">
          <i class="ti ti-chevron-down" aria-hidden="true"></i>
        </button>
      </div>
      ${l?`
        <div class="side-sub">
          <button class="side-sub-link ${d&&f==="all"?"active":""}" type="button" data-action="pipeline-stage" data-module="${n}" data-stage="all">
            <span class="side-sub-dot all"></span>
            <span class="side-sub-name">All ${r(t.label.toLowerCase())}</span>
            <span class="side-sub-ct">${r(String(c||0))}</span>
          </button>
          ${g.map(U=>`
            <button class="side-sub-link ${d&&f===U.name?"active":""}" type="button" data-action="pipeline-stage" data-module="${n}" data-stage="${r(U.name)}">
              <span class="side-sub-dot" style="background:${r(U.color)}"></span>
              <span class="side-sub-name">${r(U.name)}</span>
              <span class="side-sub-ct">${r(String(S[U.name]||0))}</span>
            </button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function xo(e,t){return`
    <button class="side-item planned" type="button" disabled aria-disabled="true" title="${r(t)}" aria-label="${r(t)}">
      ${B(e)}
      <span>${r(t)}</span>
      <b>Planned</b>
    </button>
  `}function Ri(e,t=u()){return e.id==="home"||e.status==="planned"?!0:!ee(t)&&!["settings","users"].includes(e.id)?!1:h(e.permission||`${e.id}.view`,t)}function Pi(e,t=u()){return e==="jobs"?Q(t).length:e==="tasks"?K(t).length:e==="files"?$e(t).length:e==="forms"?ke(t).length:e==="crm"?Qt(t).length:e==="contacts"?Qa(t).length:e==="finance"?we(t).length:e==="users"?ne(t).filter(a=>a.status==="active").length:e==="messages"?Nn(t)||Ne(t).length:e==="calendar"?lr(t).length:e==="time"?_r(t).focus.length:e==="approvals"?Yn(t).length:e==="clock"&&Vt(t)?"On":""}function xn(e,t){return`
    <nav class="tabbar compact-tabbar" aria-label="${r(e)}">
      ${t.map(([a,n,i])=>`<a class="${i?"active":""}" href="${_(a)}" data-router>${r(n)}</a>`).join("")}
    </nav>
  `}function Ni(e){if(e.name==="command")return No(u());if(e.name!=="company")return xs(e.name);const t=e.companyId;if(s.session?.auth==="supabase"&&!Qe().includes(t))return Po(t);const a=dt.find(n=>n.id===e.section);if(e.section==="home")return Ui(t);if(a?.status!=="planned"){if(!ee(t)&&e.section!=="settings")return Oo(t);if(a?.permission&&!h(a.permission,t))return Ro(t,a.permission)}return e.section==="jobs"?ll(e,t):e.section==="tasks"?pl(e,t):e.section==="files"?vl(e,t):e.section==="users"?Fl(e,t):e.section==="settings"?Ol(e,t):e.section==="forms"?Bl(t):e.section==="analytics"?Ko(e,t):e.section==="crm"?ac(e,t):e.section==="contacts"?Go(e,t):e.section==="finance"?Sc(e,t):e.section==="messages"?sc(e,t):e.section==="team-chart"?xl(t):e.section==="time"||e.section==="calendar"||e.section==="approvals"||e.section==="clock"?Mc(e,t):xs(e.section)}function Oo(e){const t=Ya(e);return`
    ${G(t?"Workspace awaiting approval":"Subscription required",t?"Your company workspace is created. Quest needs to approve billing/access before live company data opens.":"This company workspace needs an active subscription before paid modules can open.",`
      <button class="btn" type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
      <a class="btn btn-primary" href="${_(m("settings",{tab:"billing"},e))}" data-router><i class="ti ti-credit-card"></i>${t?"Review status":"Billing"}</a>
    `)}
    <section class="panel">
      ${W([["Company",E(e)],["Subscription",Wa(e)],["Allowed area","Settings, profile, and sign out remain available"],["Next step",t?"Quest approval / billing activation":"Restore billing access"]])}
    </section>
  `}function Ro(e,t){return`
    ${G("Access denied","Your role does not include the permission required for this module.",`
      <a class="btn" href="${_(m("settings",{tab:"roles"},e))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${W([["Company",E(e)],["Required permission",t],["Your role",at(e)]])}
    </section>
  `}function Po(e){return`
    ${G("Company access denied","This workspace is not in your active company memberships.",`
      <a class="btn" href="${_(m("jobs",{},u()))}" data-router><i class="ti ti-building"></i>Your workspace</a>
      <a class="btn btn-primary" href="${_("/login?mode=request")}" data-router><i class="ti ti-user-plus"></i>Request access</a>
    `)}
    <section class="panel">
      ${W([["Requested company",E(e)],["Access rule","Active company membership required"],["Your status",oe(e,b().profile.id)?.status?T(oe(e,b().profile.id).status):"No active membership"]])}
    </section>
  `}function No(e){return Ui(e)}function Ui(e){const t=Q(e),a=K(e),n=a.filter(L=>L.status!=="done"),i=n.filter(L=>L.due&&new Date(L.due)<gt()),o=h("messages.view",e)?Nn(e):0,l=$e(e),c=ke(e),d=ne(e),f=d.filter(L=>L.status==="active"),g=d.filter(L=>L.status==="pending"),S=Uo(e,ir(e).slice(0,4)),U=Wo(e),O=pe(e).filter(L=>!L.is_system).length,se=new Set(pe(e).flatMap(L=>L.permissions||[])).size,Ee=h("users.view",e)||h("settings.view",e);return`
    <section class="home-cockpit">
      <div class="home-hero">
        <div>
          <h1>Good ${r(zo())}, <span>${r(Jo(b().profile.full_name)||"Quest Admin")}</span></h1>
          <p>Here is what is happening across your workspace.</p>
        </div>
        <div class="home-hero-actions">
          <label class="company-switch home-company-switch">
            ${B("q-company")}
            <select data-company-switch aria-label="Active company">
              ${Va().map(L=>`<option value="${r(L.id)}" ${L.id===e?"selected":""}>${r(pt(L))}</option>`).join("")}
            </select>
          </label>
          <button class="icon-button" type="button" data-action="toggle-notifications" aria-label="Open notifications">
            <i class="ti ti-bell"></i>
            ${o?`<b>${r(String(Math.min(o,99)))}</b>`:""}
          </button>
          ${X(b().profile,"avatar")}
        </div>
      </div>
      <section class="home-metric-grid">
        ${_t("q-symbol-approvals","Company access",Wa(e),Ya(e)?"Approval required before full access.":"Workspace modules are available.",m("settings",{tab:"billing"},e),"View status",ee(e)?"good":"warning")}
        ${_t("q-symbol-users","Active users",f.length,`${f.length} active / ${g.length} pending`,m("users",{},e),"Manage users")}
        ${_t("q-symbol-tasks","Open tasks",n.length,`${i.length} overdue`,m("tasks",{},e),"View tasks",i.length?"warning":"")}
        ${_t("q-symbol-messages","Unread messages",o,"Across team chats",m("messages",{},e),"Open inbox")}
        ${_t("q-symbol-settings","Workspace health",ee(e)?"Good":"Pending",ee(e)?"All core systems operational":"Approval or billing still needs attention.",m("settings",{},e),"See details",ee(e)?"good":"warning")}
      </section>
      <section class="home-dashboard-grid">
        <article class="panel home-activity-panel">
          <div class="section-head">
            <div><h2>Recent activity</h2><p>Latest company work and inbox events.</p></div>
            <a class="btn" href="${_(m("analytics",{},e))}" data-router>All activity</a>
          </div>
          <div class="home-activity-list">
            ${S.map(Lo).join("")||v("No recent activity yet.")}
          </div>
        </article>
        <article class="panel home-message-panel">
          <div class="section-head">
            <div><h2>Unread messages</h2><p>Team conversations needing attention.</p></div>
            <a href="${_(m("messages",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-message-list">
            ${Qo(e).map(Vo).join("")||v("No unread messages.")}
          </div>
        </article>
        <article class="panel home-next-panel">
          <div class="section-head">
            <div><h2>Next tasks</h2><p>Your cleanest path through today.</p></div>
            <a href="${_(m("tasks",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-next-list">
            ${Bo(e).map(Yo).join("")||v("No open tasks.")}
          </div>
        </article>
        <article class="panel home-team-panel">
          <div class="section-head">
            <div><h2>Team access</h2><p>Active people in this workspace.</p></div>
            <a href="${_(m("users",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-team-list">
            ${f.slice(0,4).map(Ho).join("")||v("No active users yet.")}
          </div>
        </article>
        <article class="panel home-health-panel">
          <div class="section-head"><div><h2>Workspace health</h2><p>Access, billing, and operating signals.</p></div></div>
          <div class="home-health-body">
            <div class="home-orbit" aria-hidden="true"><span>${B("q-logo","brand-symbol")}</span></div>
            <div class="home-health-list">
              ${U.map(L=>`<div class="${r(L.state)}"><i class="ti ${r(L.icon)}"></i><span>${r(L.label)}</span></div>`).join("")}
            </div>
          </div>
        </article>
        <article class="panel home-access-panel">
          <div class="section-head">
            <div><h2>Access control</h2><p>Roles, permissions, protected data, and audit trail.</p></div>
            <a href="${_(m("settings",{tab:"roles"},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-access-grid">
            <div><i class="ti ti-user-shield"></i><strong>${r(O||pe(e).length)}</strong><span>Custom roles</span></div>
            <div><i class="ti ti-shield-lock"></i><strong>${r(se||di.length)}</strong><span>Active rules</span></div>
            <div><i class="ti ti-lock"></i><strong>${r(Ee?"100%":"Basic")}</strong><span>Protected data</span></div>
            <div><i class="ti ti-clipboard-check"></i><strong>${r(fr(e).length)}</strong><span>Audit events</span></div>
          </div>
        </article>
      </section>
      <section class="home-shortcuts panel">
        ${Te("files","q-symbol-files","Files",l.length,e)}
        ${Te("crm","q-symbol-crm","CRM",Qt(e).length,e)}
        ${Te("finance","q-symbol-finance","Finance",we(e).length,e)}
        ${Te("calendar","q-symbol-calendar","Calendar",lr(e).length,e)}
        ${Te("users","q-symbol-users","Users",f.length,e)}
        ${Te("forms","q-symbol-forms","Forms",c.length,e)}
        ${Te("analytics","q-symbol-analytics","Reports",t.length+a.length,e)}
      </section>
    </section>
  `}function _t(e,t,a,n,i,o,l=""){return`
    <article class="home-metric-card ${r(l)}">
      ${B(e)}
      <span>${r(t)}</span>
      <strong>${r(a)}</strong>
      <small>${r(n)}</small>
      <a href="${_(i)}" data-router>${r(o)} <i class="ti ti-arrow-right"></i></a>
    </article>
  `}function Te(e,t,a,n,i){const o=dt.find(l=>l.id===e);return o&&!Ri(o,i)?"":`
    <a class="home-shortcut" href="${_(m(e,{},i))}" data-router>
      ${B(t)}
      <span>${r(a)}</span>
      ${n!==""&&n!==void 0?`<b>${r(String(n))}</b>`:""}
    </a>
  `}function Uo(e,t=[]){const a=t.map(o=>({icon:"ti-bell",title:o.body||o.title,meta:Or(o.type),time:o.created_at,href:o.href||m("home",{},e),avatar:b().profile})),n=K(e).slice(0,3).map(o=>({icon:"ti-circle-check",title:`${o.title} was updated`,meta:"Tasks",time:o.updated_at||o.due,href:m("tasks",{...o.project_id?{job_id:o.project_id}:{},task_id:o.id},e),avatar:{full_name:H(o.assignee_id)}})),i=$e(e).slice(0,2).map(o=>({icon:"ti-folder",title:`${o.name} was uploaded`,meta:"Files",time:o.updated_at||o.created_at,href:m("files",o.job_id?{job_id:o.job_id}:{},e),avatar:{full_name:H(o.owner_id||o.created_by)}}));return a.concat(n,i).sort((o,l)=>Date.parse(l.time||0)-Date.parse(o.time||0)).slice(0,5)}function Lo(e){return`
    <a class="home-activity-row" href="${_(e.href)}" data-router>
      <span class="home-activity-icon"><i class="ti ${r(e.icon)}"></i></span>
      <span><strong>${r(e.title)}</strong><small>${r(e.meta)}</small></span>
      ${X(e.avatar||{},"avatar small")}
      <em>${r(ft(e.time))}</em>
    </a>
  `}function Qo(e){return h("messages.view",e)?Ne(e).filter(t=>tt(t.id)>0).slice(0,4).map(t=>{const a=qe(t.id).slice(-1)[0];return{id:t.id,title:a?.body||t.title,meta:`${t.title} - ${ft(a?.created_at||t.updated_at||t.created_at)}`,href:m("messages",{conversation:t.id},e),count:tt(t.id),avatar:{full_name:a?H(a.sender_profile_id):t.title}}}):[]}function Vo(e){return`
    <a class="home-message-row" href="${_(e.href)}" data-router>
      ${X(e.avatar||{},"avatar small")}
      <span><strong>${r(e.title)}</strong><small>${r(e.meta)}</small></span>
      <b>${r(e.count)}</b>
    </a>
  `}function Bo(e){return K(e).filter(t=>t.status!=="done").sort(ln).slice(0,4)}function Yo(e){return`
    <a class="home-next-row" href="${_(m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id))}" data-router>
      <i class="ti ti-circle"></i>
      <span><strong>${r(e.title)}</strong><small>${r(N(e.project_id)?.name||Ye(e.type))}</small></span>
      ${rs(e.priority)}
      <em>${r(e.due?x(e.due):"Open")}</em>
    </a>
  `}function Ho(e){return`
    <a class="home-team-row" href="${_(m("users",{},u()))}" data-router>
      ${X({full_name:e.name,email:e.email,avatar_url:e.avatar_url},"avatar small")}
      <span><strong>${r(e.name)}</strong><small>${r(e.email||e.role_label)}</small></span>
      <b>${r(e.role_label)}</b>
    </a>
  `}function Wo(e){return[{label:"Company created",icon:"ti-circle-check",state:"good"},{label:ee(e)?"Access approved":"Pending approval",icon:ee(e)?"ti-circle-check":"ti-clock",state:ee(e)?"good":"warning"},{label:"Billing connected",icon:"ti-link",state:ee(e)?"good":"muted"},{label:ee(e)?"Payment active":"Payment not active",icon:"ti-credit-card",state:ee(e)?"good":"muted"},{label:"Full access enabled",icon:"ti-shield-check",state:ee(e)?"good":"muted"}]}function zo(){const e=new Date().getHours();return e<12?"morning":e<18?"afternoon":"evening"}function Jo(e){return String(e||"").trim().split(/\s+/)[0]||""}function Ko(e,t){const a=e.jobId?N(e.jobId):null,n=a?[a]:Q(t),i=K(t).filter(g=>!a||g.project_id===a.id),o=$e(t).filter(g=>!a||g.job_id===a.id),l=ke(t).filter(g=>!a||g.linked_job_id===a.id),c=i.filter(g=>g.status!=="done"),d=i.filter(g=>g.status!=="done"&&g.due&&new Date(g.due)<gt()),f=ge(n,"estimate_total");return`
    <section class="analytics-workspace">
      <section class="analytics-toolbar panel">
        <div>
          <strong>Analytics</strong>
          <span>${r(a?a.name:E(t))}</span>
        </div>
        <label>
          <span>Job</span>
          <select data-analytics-job-filter>
            <option value="">All jobs</option>
            ${Q(t).map(g=>`<option value="${r(g.id)}" ${a?.id===g.id?"selected":""}>${r(g.name)}</option>`).join("")}
          </select>
        </label>
        <a class="btn" href="${_(m("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      </section>
      <section class="analytics-grid">
        <article class="panel analytics-score">
          <span>Open work</span>
          <strong>${r(c.length)}</strong>
          <small>${r(d.length)} overdue / ${r(i.filter(g=>g.priority==="urgent"||g.priority==="critical").length)} urgent</small>
        </article>
        <article class="panel analytics-score">
          <span>Pipeline value</span>
          <strong>${r(j(f))}</strong>
          <small>${r(n.length)} visible job${n.length===1?"":"s"}</small>
        </article>
        <article class="panel analytics-score">
          <span>Drive and forms</span>
          <strong>${r(o.length+l.length)}</strong>
          <small>${r(o.length)} files / ${r(l.length)} forms</small>
        </article>
        <article class="panel analytics-score">
          <span>Completion</span>
          <strong>${r(ip(i.filter(g=>g.status==="done").length,i.length))}</strong>
          <small>${r(i.filter(g=>g.status==="done").length)} done of ${r(i.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${n.map(g=>`
              <a class="analytics-row" href="${_(m("analytics",{job_id:g.id},t))}" data-router>
                <span><strong>${r(g.name)}</strong><small>${r(g.client_name||E(t))}</small></span>
                <span>${r(g.stage)}</span>
                <span>${r(Xn(g.id))}</span>
                <span>${r(ma(g.id))}</span>
                <span>${r(j(g.estimate_total))}</span>
              </a>
            `).join("")||v("No jobs to analyze yet.")}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${xt.map(g=>{const S=i.filter(U=>U.status===g).length;return`<div><span>${r(Ce(g))}</span><b><i style="width:${r(Zr(S,i.length))}%"></i></b><strong>${r(S)}</strong></div>`}).join("")}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${i.filter(g=>g.status!=="done").sort((g,S)=>lt(S.priority)-lt(g.priority)).slice(0,8).map(g=>is(g)).join("")||v("No open tasks in this scope.")}
          </div>
        </article>
      </section>
    </section>
  `}function Pe(e){return`<span class="pipe-dot" style="background:${r(e||"#9AA0A8")}"></span>`}function Li(e,t){return t?`<span class="stage-tag">${Pe(oo(e,t))}${r(t)}</span>`:'<span class="muted-dash">—</span>'}function Qi(e,t){const a=kn(e),n=Oi(e,t),i=e==="contacts"?Qa(t).length:Q(t).length,o=e==="contacts"?s.contactStageFilter:s.stageFilter,l=e==="contacts"?s.contactBoardView:s.jobBoardView;return`
    <section class="pipe-toolbar">
      <div class="pipe-chips" role="group" aria-label="Filter by stage">
        <button class="pipe-chip ${o==="all"?"on":""}" type="button" data-action="pipeline-stage" data-module="${e}" data-stage="all">All<b>${r(String(i))}</b></button>
        ${a.map(c=>`
          <button class="pipe-chip ${o===c.name?"on":""}" type="button" data-action="pipeline-stage" data-module="${e}" data-stage="${r(c.name)}">
            ${Pe(c.color)}${r(c.name)}<b>${r(String(n[c.name]||0))}</b>
          </button>
        `).join("")}
      </div>
      <div class="segmented" role="group" aria-label="View">
        <button class="${l==="table"?"active":""}" type="button" data-action="set-pipeline-view" data-module="${e}" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${l==="board"?"active":""}" type="button" data-action="set-pipeline-view" data-module="${e}" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function Go(e,t){const a=e.params.get("stage");return a&&(s.contactStageFilter=wt().includes(a)?a:"all"),`
    ${G("Contacts","Sales pipeline - prospects and leads moving toward won work.",`
      <button class="btn" type="button" data-action="open-stage-manager" data-module="contacts"><i class="ti ti-adjustments-horizontal"></i>Manage stages</button>
      <button class="btn btn-primary" type="button" data-action="open-contact-form" data-mode="new"><i class="ti ti-plus"></i>Add contact</button>
    `)}
    ${Qi("contacts",t)}
    ${s.contactBoardView==="board"?Xo(t):Zo(t)}
  `}function Zo(e){const t=br(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Contacts</h2><p>${t.length} visible contact${t.length===1?"":"s"}</p></div></div>
      <div class="data-table contacts-table">
        <div class="table-head"><span>Client</span><span>Phone</span><span>Email</span><span>Location</span><span>Stage</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===s.selectedContactId?"active":""}" type="button" data-action="open-contact-form" data-mode="edit" data-contact-id="${r(a.id)}">
            <span class="cell-lead">${Pe(pi(a.stage))}<span><strong>${r(a.name)}</strong><small>${r(a.owner_name||"Unassigned")}</small></span></span>
            <span>${a.phone?r(a.phone):'<span class="muted-dash">—</span>'}</span>
            <span>${a.email?r(a.email):'<span class="muted-dash">—</span>'}</span>
            <span>${a.location?r(a.location):'<span class="muted-dash">—</span>'}</span>
            <span>${Li("contacts",a.stage)}</span>
            <span>${a.value?j(a.value):'<span class="muted-dash">—</span>'}</span>
          </button>
        `).join("")||v("No contacts in this view yet.")}
      </div>
    </section>
  `}function Xo(e){const t=br(e,!0),a=s.contactStageFilter;return`
    <section class="pipe-board">
      ${(a==="all"?js():js().filter(i=>i.name===a)).map(i=>{const o=t.filter(l=>l.stage===i.name);return`
          <article class="pipe-lane">
            <header class="pipe-lane-head">${Pe(i.color)}<span>${r(i.name)}</span><b>${o.length}</b></header>
            <div class="pipe-lane-body">
              ${o.map(l=>el(l)).join("")||'<div class="lane-empty">No contacts</div>'}
            </div>
          </article>
        `}).join("")}
    </section>
  `}function el(e){return`
    <button class="pipe-card ${e.id===s.selectedContactId?"active":""}" type="button" data-action="open-contact-form" data-mode="edit" data-contact-id="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.location||e.phone||e.email||"No details")}</span>
      <em>${e.value?j(e.value):"—"}</em>
    </button>
  `}function As(e,t){return I("Contacts",t?"Edit contact":"Add contact",tl(e,t),"wide-modal")}function tl(e,t){const a=t||al(e);return`
    <form class="job-editor" data-contact-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit contact":"New contact"}</h2><p>Contacts move through your customizable sales pipeline stages.</p></div>
      </div>
      ${C("Name","name",a.name,!0)}
      ${P("Company","company_id",e,Va().map(n=>[n.id,pt(n)]))}
      ${C("Phone","phone",a.phone)}
      ${C("Email","email",a.email,!1,"email")}
      ${C("Location","location",a.location,!1,"text","span-2")}
      ${P("Stage","stage",a.stage||wt()[0],wt().map(n=>[n,n]))}
      ${C("Owner","owner_name",a.owner_name)}
      ${C("Estimated value","value",a.value||0,!1,"number")}
      ${ye("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save contact</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-contact" data-contact-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function al(e=u()){return ts({id:"",company_id:e,name:"",stage:wt()[0],value:0})}function nl(e){const t=Object.fromEntries(new FormData(e).entries()),a=ts(t);a.id=a.id||`contact-${crypto.randomUUID()}`,a.updated_at=new Date().toISOString(),Eu(a),s.selectedContactId=a.id,s.modal="",$(`${a.name} saved.`,"local","Contacts"),p()}function sl(e){e&&(s.contacts=s.contacts.filter(t=>t.id!==e),Bn(),s.selectedContactId===e&&(s.selectedContactId=""),s.modal="",p())}function qs(e){const t=kn(e),a=e==="contacts"?"Contact pipeline stages":"Job pipeline stages",n=`
    <form class="stage-manager" data-stage-form data-kind="${e}">
      <p class="stage-manager-hint">Stages are your pipeline columns - the placeholder groups your team can shape. Rename or recolor any stage and your records keep their place; add new stages for any workflow.</p>
      <div class="stage-rows">
        ${t.map((i,o)=>`
          <div class="stage-row">
            <span class="stage-row-handle">${Pe(i.color)}</span>
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
  `;return I("Pipeline",a,n,"wide-modal")}function Vi(e){const t=Object.fromEntries(new FormData(e).entries()),a=[],n={};let i=0;for(;t[`name_${i}`]!==void 0;){const o=String(t[`name_${i}`]||"").trim(),l=/^#[0-9a-fA-F]{3,8}$/.test(String(t[`color_${i}`]||""))?t[`color_${i}`]:"#9aa0a8",c=t[`orig_${i}`]!==void 0?String(t[`orig_${i}`]):"";o&&(a.push({name:o,color:l}),c&&c!==o&&(n[c]=o)),i+=1}return{stages:a,renameMap:n}}function Bi(e){const t=document.querySelector("[data-stage-form]");if(!t)return;const{stages:a}=Vi(t);a.length&&(e==="contacts"?me=a:ue=a)}function il(e){Bi(e);const t=e==="contacts"?me:ue,a=Ds[t.length%Ds.length];t.push({name:`New stage ${t.length+1}`,color:a}),e==="contacts"?Cn():Dn(),p()}function rl(e,t){Bi(e);const a=e==="contacts"?me:ue;if(a.length<=1){$("Keep at least one stage in the pipeline.","local","Stages");return}Number.isInteger(t)&&t>=0&&t<a.length&&a.splice(t,1),e==="contacts"?Cn():Dn(),p()}function ol(e){const t=e.dataset.kind==="contacts"?"contacts":"jobs",{stages:a,renameMap:n}=Vi(e);if(!a.length){$("Add at least one stage before saving.","local","Stages");return}const i=new Set(a.map(l=>l.name)),o=a[0].name;t==="contacts"?(me=a,Cn(),s.contacts.forEach(l=>{n[l.stage]&&(l.stage=n[l.stage]),i.has(l.stage)||(l.stage=o)}),Bn(),s.contactStageFilter!=="all"&&!i.has(s.contactStageFilter)&&(s.contactStageFilter="all")):(ue=a,Dn(),s.jobs.forEach(l=>{n[l.stage]&&(l.stage=n[l.stage]),i.has(l.stage)||(l.stage=o)}),k(ya,s.jobs),s.stageFilter!=="all"&&!i.has(s.stageFilter)&&(s.stageFilter="all")),s.modal="",$("Pipeline stages updated.","local","Stages"),p()}function ll(e,t){const a=eu(e.params.get("tab")),n=e.params.get("stage");n&&(s.stageFilter=Ma().includes(n)?n:"all");const i=Oe();return`
    ${G("Jobs","Production pipeline - every job type, from intake to paid.",`
      <a class="btn" href="${_(m("files",i?{job_id:i.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn" type="button" data-action="open-stage-manager" data-module="jobs"><i class="ti ti-adjustments-horizontal"></i>Manage stages</button>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <nav class="tabbar" aria-label="Job sections">
      ${gi.map(o=>`<a class="${o===a?"active":""}" href="${_(m("jobs",{tab:o,...i?{job_id:i.id}:{}},t))}" data-router>${r(tu(o))}</a>`).join("")}
    </nav>
    ${cl(a,t,i)}
  `}function cl(e,t,a){return e==="pipeline"?Ms(t):e==="list"?Yi(t):e==="profile"?ul(t,a):Ms(t)}function Ms(e){return`
    ${Qi("jobs",e)}
    ${s.jobBoardView==="board"?dl(e):Yi(e)}
  `}function dl(e){const t=gr(e,!0),a=s.stageFilter;return`
    <section class="pipe-board">
      ${(a==="all"?Cs():Cs().filter(i=>i.name===a)).map(i=>{const o=t.filter(l=>l.stage===i.name);return`
          <article class="pipe-lane">
            <header class="pipe-lane-head">${Pe(i.color)}<span>${r(i.name)}</span><b>${o.length}</b></header>
            <div class="pipe-lane-body">
              ${o.map(l=>cm(l)).join("")||'<div class="lane-empty">No jobs</div>'}
            </div>
          </article>
        `}).join("")}
    </section>
  `}function Yi(e){const t=gr(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Jobs</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Type</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===s.selectedJobId?"active":""}" type="button" data-select-job="${r(a.id)}">
            <span class="cell-lead">${Pe(mi(a.stage))}<span><strong>${r(a.name)}</strong><small>${r(a.client_name||"No client")} - ${r(a.site_address||"No address")}</small></span></span>
            <span>${r(a.job_type||"—")}</span>
            <span>${Li("jobs",a.stage)}</span>
            <span>${qr(a.priority)}</span>
            <span>${r(a.owner_name||"Unassigned")}</span>
            <span>${j(a.estimate_total)}</span>
          </button>
        `).join("")||v("No jobs match this view.")}
      </div>
    </section>
  `}function ul(e,t){return t?`
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${r(E(e))} - ${r(t.job_type)}</span>
          <h2>${r(t.name)}</h2>
          <p>${r(t.scope||"No scope written yet.")}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${W([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",j(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${_(m("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(t.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${ta(m("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${Xn(t.id)} linked tasks`)}
          ${ta(m("files",{job_id:t.id},e),"ti-folder","Files",`${ma(t.id)} files`)}
          ${ta(m("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${ta(m("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:v("Create a job to see the profile workspace.")}function ml(e,t){const a=t||Gu(e);return`
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${C("Workspace name","name",a.name,!0)}
      ${P("Company","company_id",e,Va().map(n=>[n.id,pt(n)]))}
      ${C("Client","client_name",a.client_name)}
      ${C("Contact","contact_name",a.contact_name)}
      ${C("Account owner","owner_name",a.owner_name)}
      ${C("Job type","job_type",a.job_type||"Roofing")}
      ${P("Stage","stage",fi(a.stage),Ma().map(n=>[n,n]))}
      ${P("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(n=>[n,n]))}
      ${C("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${C("Invoice total","invoice_total",a.invoice_total||0,!1,"number")}
      ${C("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${ye("Scope","scope",a.scope,"span-2")}
      ${ye("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function pl(e,t){const a=e.jobId?N(e.jobId):null,n=Pu(t,a?.id);return`
    ${G(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${_(m("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${_(m("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${fl(t,a)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${s.taskView==="board"?bl(t,n):gl(t,n)}
      </article>
    </section>
  `}function fl(e,t){return`
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${Q(e).map(n=>`<option value="${r(n.id)}" ${t?.id===n.id?"selected":""}>${r(n.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${["all"].concat(xt).map(n=>`<option value="${r(n)}" ${s.taskStatusFilter===n?"selected":""}>${r(n==="all"?"All statuses":Ce(n))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(oa).map(n=>`<option value="${r(n)}" ${s.taskPriorityFilter===n?"selected":""}>${r(n==="all"?"All priorities":T(n))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${s.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${s.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function gl(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===s.selectedTaskId?"active":""}" type="button" data-select-task="${r(a.id)}">
          <span><strong>${r(a.title)}</strong><small>${r(a.description||Ye(a.type))}</small></span>
          <span>${r(N(a.project_id)?.name||"Company task")}</span>
          <span>${r(H(a.assignee_id))}</span>
          <span>${rs(a.priority)}</span>
          <span>${Mr(a.status)}</span>
          <span>${x(a.due)}</span>
        </button>
      `).join("")||v("No tasks match this workspace view.")}
    </div>
  `}function bl(e,t){return`
    <div class="task-board">
      ${xt.map(a=>{const n=t.filter(i=>i.status===a);return`
          <section class="task-column">
            <h2><span>${r(Ce(a))}</span><b>${n.length}</b></h2>
            ${n.map(i=>`
              <button class="task-card priority-${r(i.priority)}" type="button" data-select-task="${r(i.id)}">
                <strong>${r(i.title)}</strong>
                <span>${r(N(i.project_id)?.name||E(e))}</span>
                <small>${r(H(i.assignee_id))} - ${x(i.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function _l(e,t){return t?`
    <div class="section-head">
      <div><h2>${r(t.title)}</h2><p>${r(N(t.project_id)?.name||E(e))}</p></div>
      <a class="btn" href="${_(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${W([["Status",Ce(t.status)],["Priority",T(t.priority)],["Type",Ye(t.type)],["Assignee",H(t.assignee_id)],["Due",x(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${r(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${v("No task selected.")}
    `}function Fs(e,t,a){const n=a||Zu(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${r(a?n.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${C("Task title","title",n.title,!0)}
      ${P("Job","project_id",n.project_id||"",[["","Company-level task"]].concat(Q(e).map(i=>[i.id,i.name])))}
      ${P("Status","status",n.status,xt.map(i=>[i,Ce(i)]))}
      ${P("Priority","priority",n.priority,oa.map(i=>[i,T(i)]))}
      ${P("Type","type",n.type,bi.map(i=>[i,Ye(i)]))}
      ${P("Assignee","assignee_id",n.assignee_id,ut(e).map(i=>[i.id,H(i.id)]))}
      ${C("Due date","due",n.due||D(1),!0,"date")}
      ${ye("Description","description",n.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${r(a.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function vl(e,t){const a=e.params.get("folder")||s.driveFolder||"home";s.driveFolder=a;const n=e.jobId?N(e.jobId):null,i=Tm(t,a,n?.id||""),o=h("files.manage",t);return`
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${r(n?n.name:"Company Drive")}</strong>
              <small>${r(n?`${n.client_name||E(t)} file workspace`:`${E(t)} file manager`)}</small>
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
                <a href="${_(m("files",{},t))}" data-router>${r(E(t))}</a>
                ${a!=="home"?Em(t,a,n):""}
                ${n?`<span>/</span><strong>${r(n.name)}</strong>`:""}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${s.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${s.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${yl(t,a,n,i)}
          </div>
        </div>
      </section>
    </section>
  `}function yl(e,t,a,n){const i=Fm(e,t,a),o=i.map(c=>({kind:"folder",...c})).concat(n.map(c=>({kind:"file",file:c}))),l=a?a.name:t==="home"?"This folder":_e(t);return`
    <section class="drive-section-title">
      <div><h3>${r(l)}</h3><span>${i.length} folder${i.length===1?"":"s"} / ${n.length} file${n.length===1?"":"s"}</span></div>
    </section>
    ${s.driveView==="list"?hl(o):$l(o)}
  `}function hl(e){return`
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${e.map(t=>t.kind==="folder"?Sl(t):kl(t.file)).join("")||v("This folder is empty.")}
    </div>
  `}function $l(e){return`
    <section class="drive-folder-grid explorer-grid">
      ${e.map(t=>t.kind==="folder"?wl(t):Cl(t.file)).join("")||v("This folder is empty.")}
    </section>
  `}function wl(e){return`
    <a class="drive-folder-card explorer-folder" href="${r(e.href)}" data-router>
      <span class="drive-folder-icon">${zr(e,e.name)}</span>
      <strong>${r(e.name)}</strong>
      <em>${r(e.countLabel||"0 items")}</em>
    </a>
  `}function Sl(e){return`
    <a class="explorer-row folder-row-live" href="${r(e.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder">${zr(e,e.name)}</span><strong>${r(e.name)}</strong></span>
      <span>${r(e.updatedLabel||"")}</span>
      <span>Folder</span>
      <span>${r(e.countLabel||"")}</span>
    </a>
  `}function kl(e){return`
    <button type="button" class="explorer-row ${e.id===s.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}" role="row">
      <span class="explorer-name">${Dl(e)}<strong>${r(e.file_name)}</strong></span>
      <span>${x(e.updated_at||e.created_at)}</span>
      <span>${r(Fe(e))}</span>
      <span>${ps(e.size_bytes)}</span>
    </button>
  `}function Dl(e){return`
    <span class="file-type ${r(us(e))}">
      ${Jr(e,Fe(e))}
      <small>${r(Lr(e))}</small>
    </span>
  `}function Cl(e){return`
    <button type="button" class="file-card-live ${e.id===s.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}">
      <span class="file-thumb">${ms(e)}</span>
      <strong>${r(e.file_name)}</strong>
      <span>${r(Fe(e))} / ${ps(e.size_bytes)}</span>
    </button>
  `}function jl(e,t){const a=h("files.manage",t);return`
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${Al(e)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${ms(e)}
          <div>
            <strong>${r(e.file_name)}</strong>
            <span>${r(Fe(e))} / ${ps(e.size_bytes)}</span>
          </div>
        </div>
        <div class="file-detail-list">
          ${xe("Location",_e(e.folder))}
          ${xe("Job",N(e.job_id)?.name||"Company shared")}
          ${xe("Uploaded by",e.uploaded_by_label||"Quest HQ")}
          ${xe("Modified",x(e.updated_at||e.created_at))}
          ${xe("Storage",e.object_path||"Metadata only")}
        </div>
        <div class="file-detail-actions">
          <button class="btn" type="button" data-action="download-file" data-file-id="${r(e.id)}"><i class="ti ti-download"></i>Download</button>
          ${a?`<button class="btn danger" type="button" data-action="delete-file" data-file-id="${r(e.id)}"><i class="ti ti-trash"></i>Delete</button>`:""}
        </div>
      </aside>
    </section>
  `}function Al(e){const t=us(e);return e.signed_url&&t==="image"?`<img class="file-preview-media" src="${r(e.signed_url)}" alt="" />`:e.signed_url&&t==="pdf"?`<iframe class="file-preview-frame" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:e.signed_url&&t==="text"?`<iframe class="file-preview-frame text" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:["doc","sheet"].includes(t)&&e.signed_url?`<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:`
    <div class="file-preview-empty">
      ${ms(e,!0)}
      <strong>${r(Fe(e))} preview</strong>
      <p>${r(e.object_path?"Preview will load when a signed file URL is available.":"This is a metadata-only file record. Upload the actual file object to preview it here.")}</p>
      ${e.notes?`<pre>${r(e.notes)}</pre>`:""}
    </div>
  `}function ql(){const e=u(),t=s.route||Nt(),a=t.params.get("folder")||s.driveFolder||"home",n=t.jobId?N(t.jobId):null;return I("Drive","New folder",`
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${r(e)}" />
      <input type="hidden" name="parent_key" value="${r(Ur(a,n))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${r(a==="home"?E(e):n?.name||_e(a))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"task-modal")}function Ml(){const e=u(),t=s.route?.params?.get("folder")||(s.driveFolder==="home"?"shared":s.driveFolder),a=s.route?.jobId||"";return`
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">${r(E(e))} Drive</div><h2 id="upload-title">Upload files</h2></div>
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
          ${C("Metadata-only file name","file_name","")}
          ${P("Folder","folder",t,tp(e))}
          ${P("Job","job_id",a,[["","Company shared file"]].concat(Q(e).map(n=>[n.id,n.name])))}
          ${P("Category","category",_e(t),mo.filter(n=>n!=="All categories").map(n=>[n,n]))}
          ${C("Uploaded by","uploaded_by_label",b().profile.full_name||"Quest HQ")}
          ${ye("Notes","notes","","span-2")}
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
  `}function Fl(e,t){const a=ne(t),n=["members","access"].includes(e.params.get("tab"))?e.params.get("tab"):"members",i=s.joinRequests.filter(d=>d.company_id===t&&d.status==="pending"),o=h("users.manage",t),l=a.filter(d=>d.status==="active"),c=a.filter(d=>d.status!=="active");return`
    ${G("Users","Company members, roles, workers, and access context.",`
      <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite user</button>
      <a class="btn" href="${_(m("settings",{tab:"roles"},t))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      <a class="btn" href="${_(m("settings",{tab:"access"},t))}" data-router><i class="ti ti-settings"></i>Access settings</a>
    `)}
    ${xn("Users sections",[[m("users",{tab:"members"},t),"Members",n==="members"],[m("users",{tab:"access"},t),"Access",n==="access"]])}
    ${n==="members"?`
      <section class="metric-grid operations-metrics">
        ${F("Active users",l.length)}
        ${F("Pending",a.filter(d=>d.status==="pending").length+i.length)}
        ${F("Disabled/left",c.filter(d=>d.status!=="pending").length)}
        ${F("Roles",pe(t).length)}
      </section>
      <section class="users-grid">
        ${a.map(d=>`
          <article class="user-card ${d.status!=="active"?"muted":""}">
            ${X({full_name:la(d),email:d.email,avatar_url:d.avatar_url},"avatar")}
            <div>
              <strong>${r(la(d))}</strong>
              <span>${r(Hi(d))}</span>
              <small>${r(d.role_label)} / ${r(T(d.status))}</small>
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
          ${a.map(d=>Il(t,d,o)).join("")||v("No users assigned to this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head">
          <div><h2>Invites</h2><p>Copy a secure invite code or link for a specific email address.</p></div>
          <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite</button>
        </div>
        <div class="access-invite-list">
          ${Cu(t).map(d=>Tl(d,o)).join("")||v("No pending invites.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
        <div class="access-request-list">
          ${i.map(d=>El(d,o)).join("")||v("No pending join requests.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
        ${W([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Supabase Auth + RLS"],["Your role",at(t)],["Can manage users",o?"Yes":"No"]])}
      </article>
    </section>
    `}
  `}function Il(e,t,a){const n=pe(e),i=t.role_id||Ct(e,t.role)||n[0]?.id||"",o=t.profile_id&&Dr(e,t.profile_id),l=a&&t.profile_id&&!o;return`
    <article class="access-user-row ${t.status!=="active"?"muted":""}">
      ${X({full_name:la(t),email:t.email,avatar_url:t.avatar_url},"avatar")}
      <div class="access-user-main">
        <strong>${r(la(t))}</strong>
        <span>${r(Hi(t))} / ${r(T(t.status))}</span>
        ${o?'<small class="access-note">Last active Owner - promote another Owner before changing this access.</small>':""}
      </div>
      <form class="access-role-form" data-user-role-form>
        <input type="hidden" name="company_id" value="${r(e)}" />
        <input type="hidden" name="profile_id" value="${r(t.profile_id)}" />
        <select name="role_id" ${l?"":"disabled"}>
          ${n.map(c=>`<option value="${r(c.id)}" ${c.id===i?"selected":""}>${r(c.name)}</option>`).join("")}
        </select>
        <select name="membership_status" ${l?"":"disabled"}>
          ${["active","pending","disabled","left"].map(c=>`<option value="${r(c)}" ${c===t.status?"selected":""}>${r(T(c))}</option>`).join("")}
        </select>
        <button class="btn" type="submit" ${l?"":"disabled"}>Save</button>
      </form>
    </article>
  `}function El(e,t){const a=e.requested_email||Ue(e.profile_id)?.email||e.profile_id||"Requester";return`
    <article class="access-request-row">
      <div>
        <strong>${r(a)}</strong>
        <span>${r(e.message||"Access request")} / ${x(e.created_at)}</span>
      </div>
      <div>
        <button class="btn btn-primary" type="button" data-action="approve-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Approve</button>
        <button class="btn danger" type="button" data-action="reject-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Reject</button>
      </div>
    </article>
  `}function Tl(e,t){const a=mt(e.company_id,e.role_id),n=e.expires_at&&Date.parse(e.expires_at)<Date.now();return`
    <article class="access-invite-row ${n?"muted":""}">
      <div>
        <strong>${r(e.email)}</strong>
        <span>${r(a?.name||"Member")} / ${n?"Expired":`Expires ${x(e.expires_at)}`}</span>
        ${e.token?`<code class="invite-code">${r(e.token)}</code>`:""}
      </div>
      <div>
        <button class="btn" type="button" data-action="copy-invite-code" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-key"></i>Copy code</button>
        <button class="btn" type="button" data-action="copy-invite-link" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-link"></i>Copy link</button>
        <button class="btn danger" type="button" data-action="revoke-invite" data-invite-id="${r(e.id)}" ${t?"":"disabled"}>Revoke</button>
      </div>
    </article>
  `}function la(e){const t=String(e.name||"").trim(),a=String(e.email||"").trim();if(t&&!va(t))return t;if(a&&!va(a))return a.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,i=>i.toUpperCase());const n=String(e.role||"").toLowerCase();return n==="owner"?"Workspace owner":n==="admin"?"Workspace admin":n==="developer"?"Developer":`${e.role_label||"Workspace"} user`}function Hi(e){const t=String(e.email||"").trim();if(t&&!va(t))return t;const a=String(e.profile_id||e.member_id||"").trim();return a?`ID ${Xr(a)}`:"No email on profile"}function xl(e){const t=ut(e),a=t.filter(n=>!n.supervisor_id||!t.some(i=>i.id===n.supervisor_id));return`
    <section class="tool-page team-chart-page">
      ${G("Team chart","Reporting lines, roles, and company coverage for this workspace.",`
        <a class="btn" href="${_(m("users",{},e))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${_(m("settings",{tab:"team"},e))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${F("Members",t.length)}
        ${F("Leads",a.length)}
        ${F("Open tasks",K(e).filter(Hn).length)}
        ${F("Active timer",Vt(e)?"Yes":"No")}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${a.map(n=>Wi(e,n,t)).join("")||v("No workers assigned.")}
        </div>
      </section>
    </section>
  `}function Wi(e,t,a,n=0){const i=a.filter(o=>o.supervisor_id===t.id);return`
    <article class="team-node" style="--depth:${n}">
      <div class="team-node-card">
        ${X({full_name:t.full_name,avatar_url:t.avatar_url},"avatar")}
        <span><strong>${r(t.full_name)}</strong><small>${r(da(e,t.id))}</small></span>
        <b>${K(e).filter(o=>o.assignee_id===t.id&&Hn(o)).length} open</b>
      </div>
      ${i.length?`<div class="team-node-children">${i.map(o=>Wi(e,o,a,n+1)).join("")}</div>`:""}
    </article>
  `}function Ol(e,t){const a=Ba(t),n=["company","billing","roles","access","team"].includes(e.params.get("tab"))?e.params.get("tab"):"company";return`
    ${G("Settings","Company settings, roles, approvals, and admin controls.","")}
    ${xn("Settings sections",[[m("settings",{tab:"company"},t),"Company",n==="company"],[m("settings",{tab:"billing"},t),"Billing",n==="billing"],[m("settings",{tab:"roles"},t),"Roles",n==="roles"],[m("settings",{tab:"access"},t),"Access",n==="access"],[m("settings",{tab:"team"},t),"Workers",n==="team"]])}
    <section class="dashboard-grid compact-settings-grid">
      ${n==="company"?`
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${W([["Name",E(t)],["Company ID",t],["Color",a?.color||Me(t)],["Visible jobs",Q(t).length]])}
      </article>
      `:""}
      ${n==="billing"?Rl(t):""}
      ${n==="roles"?Ul(t):""}
      ${n==="access"?`
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${W([["Auth switch","Enabled"],["Local login","Disabled"],["Isolation","Server-enforced when migration is applied"],["Active memberships",String(s.memberships.filter(i=>i.company_id===t&&i.status==="active").length)],["Disabled/left",String(s.memberships.filter(i=>i.company_id===t&&["disabled","left"].includes(i.status)).length)],["Invites",String(s.companyInvites.filter(i=>i.company_id===t&&i.status==="pending").length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${s.joinRequests.filter(i=>i.company_id===t).map(i=>Ge(i.requested_email||i.profile_id,i.message||"Access request",T(i.status),i.created_at)).join("")||v("No pending company approvals.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access history</h2><p>Recent membership, invite, and role changes for this company.</p></div></div>
        <div class="access-audit-list">
          ${fr(t).slice(0,8).map(ju).join("")||v("No access audit events yet.")}
        </div>
      </article>
      `:""}
      ${n==="team"?`
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${ut(t).map(i=>`<div><strong>${r(i.full_name)}</strong><span>${r(da(t,i.id))}</span></div>`).join("")||v("No workers assigned.")}
        </div>
      </article>
      `:""}
    </section>
  `}function Rl(e){const t=Bt(e),a=Ya(e);return`
    <article class="panel">
      <div class="section-head">
        <div><h2>${a?"Workspace awaiting approval":"Subscription"}</h2><p>${a?"Quest needs to approve billing/access before live company data opens.":"$300/month company workspace billing gate."}</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout" ${a?"disabled":""}><i class="ti ti-credit-card"></i>${a?"Billing pending":"Start subscription"}</button>
      </div>
      ${W([["Plan","$300/month company workspace"],["Status",Wa(e)],["Stripe customer",t?.stripe_customer_id||"Not connected"],["Approval",a?"Waiting for Quest review":"Ready"],["Renewal / trial",t?.current_period_end||t?.trial_ends_at?x(t.current_period_end||t.trial_ends_at):"Pending"]])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules open only after approval or an active billing state.</p></div></div>
      ${W([["Workspace access",ee(e)?"Allowed":"Suspended"],["Finance/files privacy","Requires Auth + RLS"],["Seat billing","Tracked later; not charged in v1"]])}
    </article>
    ${Zn()?Pl(e):""}
  `}function Pl(e){const t=Lu(),a=t.filter(n=>n.status==="pending_review").length;return`
    <article class="panel span-3">
      <div class="section-head">
        <div><h2>Quest approval console</h2><p>${a} workspace${a===1?"":"s"} waiting for manual activation.</p></div>
      </div>
      <div class="approval-console-list">
        ${t.map(n=>Nl(n,e)).join("")||v("No workspace reviews found.")}
      </div>
    </article>
  `}function Nl(e,t){const a=["active","trialing","past_due","grace"].includes(e.status),n=e.company_id===t;return`
    <article class="workspace-review-row ${e.status==="pending_review"?"pending":""}">
      <span>
        <strong>${r(e.company_name||E(e.company_id))}${n?" / current":""}</strong>
        <small>${r(e.company_id)} / ${r(e.owner_email||"No owner email")} / ${x(e.created_at)}</small>
      </span>
      <b class="status-pill ${a?"active":e.status==="pending_review"?"pending":"muted"}">${r(ua(e.status,e))}</b>
      <div class="workspace-review-actions">
        <button class="btn btn-primary" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="active" ${a?"disabled":""}>Approve</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="pending_review" ${e.status==="pending_review"?"disabled":""}>Pending</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="suspended" ${e.status==="suspended"?"disabled":""}>Suspend</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="canceled" ${e.status==="canceled"?"disabled":""}>Reject</button>
      </div>
    </article>
  `}function Ul(e){const t=pe(e),a=La(e);return`
    <article class="panel span-2">
      <div class="section-head">
        <div><h2>Custom roles</h2><p>Discord-style roles for module, action, record, and field permissions.</p></div>
        <button class="btn btn-primary" type="button" data-action="open-role-form"><i class="ti ti-plus"></i>New role</button>
      </div>
      <div class="roles-list">
        ${t.map(n=>{const i=s.rolePermissions.filter(c=>c.role_id===n.id&&c.effect==="allow").length,o=s.roleAssignments.filter(c=>c.company_id===e&&c.role_id===n.id).length,l=a?.id===n.id;return`
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
      ${a?Ll(e,a):`
        <div class="section-head"><div><h2>Access preview</h2><p>Pick View as role to check sidebar, route, and action access.</p></div></div>
        ${v("No role preview selected.")}
      `}
    </article>
    <article class="panel span-3">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${s.fieldPermissions.filter(n=>n.company_id===e).map(n=>Ge(n.field_key,n.resource_type,n.visibility,"")).join("")||v("No field permission overrides yet.")}
      </div>
    </article>
  `}function Ll(e,t){const a=dt.filter(o=>o.status==="live"),n=a.filter(o=>on(t,o.permission||`${o.id}.view`)),i=a.filter(o=>!on(t,o.permission||`${o.id}.view`));return`
    <div class="section-head">
      <div><h2>Access preview</h2><p>${r(t.name)} sees ${n.length} of ${a.length} live modules.</p></div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
    ${W([["Preview role",t.name],["Allowed modules",n.map(o=>o.label).join(", ")||"None"],["Hidden modules",i.map(o=>o.label).join(", ")||"None"]])}
  `}function Ql(e){return I("Settings","New role",`
    <form class="role-form" data-role-form>
      ${C("Role name","name","")}
      ${C("Color","color","#f0b23b",!1,"color")}
      ${C("Priority","priority","100",!1,"number")}
      <div class="permission-grid span-2">
        ${di.map(([t,a])=>`
          <label><input type="checkbox" name="permissions" value="${r(t)}" /> <span>${r(a)}</span></label>
        `).join("")}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Vl(e){const t=pe(e).filter(n=>n.name.toLowerCase()!=="owner"),a=[["","Member"]].concat(t.map(n=>[n.id,n.name]));return I("Users","Create invite code",`
    <form class="role-form" data-invite-form>
      <input type="hidden" name="company_id" value="${r(e)}" />
      ${C("Email","email","",!0,"email")}
      ${P("Role","role_id",Au(e),a)}
      <div class="form-message span-2">Quest creates an invite code you can copy now. Email invite delivery will use this same record after SMTP/Resend is configured.</div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create invite code</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Bl(e){const t=Om(e),a=Ft(e),n=s.formsTab==="builder"&&a?"builder":s.formsTab==="responses"?"responses":"library";return`
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
            <button class="${n===i?"active":""}" type="button" data-action="set-forms-tab" data-tab="${r(i)}">${r(T(i))}</button>
          `).join("")}
        </nav>
      `}
      ${n==="library"?Yl(e,t,a):""}
      ${n==="builder"?Hl(e,a):""}
      ${n==="responses"?tc(e,a):""}
    </section>
  `}function Yl(e,t,a){return`
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${t.length} visible form${t.length===1?"":"s"} in ${r(E(e))}</span>
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
                <span>Created by ${r(Rm(n))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${r(n.id)}" aria-expanded="${s.expandedFormIds.has(n.id)?"true":"false"}">
                <i class="ti ${s.expandedFormIds.has(n.id)?"ti-chevron-up":"ti-chevron-down"}"></i>
                ${s.expandedFormIds.has(n.id)?"Less":"Details"}
              </button>
              <span class="form-card-meta">
                <small>${r(n.type)} / ${r(n.audience||"Internal")}</small>
                <small>${Vr(n)} questions</small>
                <em>${Xa(n.id).length} responses</em>
                <em>Updated ${x(n.updated_at)}</em>
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
  `}function Hl(e,t){if(!t)return`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${v("Create a form or choose a template to open the builder.")}
      </section>
    `;const a=["questions","responses","settings"].includes(s.formEditorTab)?s.formEditorTab:"questions";return`
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${r(a)}">
      ${Wl(t,a)}
      ${a==="questions"?`
        ${zl(e,t)}
        ${Jl(t)}
      `:""}
      ${a==="settings"?`
        <article class="panel form-settings-panel forms-settings-wide">
          ${Kl(e,t)}
        </article>
      `:""}
      ${a==="responses"?Gl(e,t):""}
    </section>
  `}function Wl(e,t){const a=Xa(e.id);return`
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${r(e.title)}</strong>
        <span>${r(e.status)} / ${Vr(e)} questions / ${a.length} responses</span>
      </div>
      ${["questions","responses","settings"].map(n=>`
        <button class="${t===n?"active":""}" type="button" data-action="set-form-editor-tab" data-tab="${r(n)}">
          ${n==="questions"?'<i class="ti ti-list-details"></i>':n==="responses"?'<i class="ti ti-inbox"></i>':'<i class="ti ti-settings"></i>'}
          ${r(T(n))}
        </button>
      `).join("")}
      <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(e.id)}"><i class="ti ti-eye"></i>Preview</button>
      <button class="btn" type="button" data-action="open-form-actions" data-form-id="${r(e.id)}"><i class="ti ti-share"></i>Share</button>
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(e.id)}">Save</button>
    </div>
  `}function zl(e,t){return`
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${r(t.theme_color||Me(e))}"></div>
      ${yt("Form title","title",t.title,!0)}
      ${Br("Form description","description",t.description)}
      <div class="forms-simple-meta">
        <span>${r(t.status)}</span>
        <span>${r(t.type)}</span>
        <span>${r(t.audience||"Internal")}</span>
        <span>${r(N(t.linked_job_id)?.name||"Company level")}</span>
        <span>${r(E(e))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(t.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      </div>
    </article>
  `}function Jl(e){return`
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${Rt.map(([t,a])=>`<button type="button" data-action="add-question" data-question-type="${r(t)}" title="${r(a)}" aria-label="Add ${r(a)} question"><i class="ti ${r(Pm(t))}"></i></button>`).join("")}
        </div>
        <div class="question-list">
          ${e.questions.map((t,a)=>Zl(t,a)).join("")||v("Add the first question.")}
        </div>
      </div>
    </article>
  `}function Kl(e,t){return`
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${yt("Title","title",t.title,!0)}
      ${aa("Status","status",t.status,An.map(a=>[a,a]))}
      ${Br("Description","description",t.description)}
      ${aa("Type","type",t.type,Ot.map(a=>[a,a]))}
      ${yt("Audience","audience",t.audience)}
      ${aa("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(Q(e).map(a=>[a.id,a.name])))}
      ${yt("Theme color","theme_color",t.theme_color||Me(e),!1,"color")}
      ${aa("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
      ${yt("Submit button","submit_label",t.submit_label||"Submit")}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(t.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${r(t.id)}">Delete</button>
    </div>
  `}function Gl(e,t){const a=Xa(t.id),n=a[0]||null;return`
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
            <small>${x(i.created_at)}</small>
          </button>
        `).join("")||v("No responses yet. Submit a preview response from the builder.")}
      </div>
    </article>
    <aside class="panel response-detail">
      ${n?Yr(n):v("No response selected.")}
    </aside>
  `}function Zl(e,t){const a=Rt.map(([n,i])=>`<option value="${r(n)}" ${e.type===n?"selected":""}>${r(i)}</option>`).join("");return`
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
      ${It(e)?`
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
  `}function Xl(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${r(t.id)}" style="--form-accent:${r(t.theme_color||Me(e))}">
      <div class="designed-form-header">
        <span>${r(E(e))}</span>
        <h2>${r(t.title)}</h2>
        <p>${r(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>ec(a)).join("")||v("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${r(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function ec(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?ve(e,`<textarea name="${r(t)}" rows="3" ${a}></textarea>`):e.type==="date"?ve(e,`<input name="${r(t)}" type="date" ${a} />`):e.type==="file"?ve(e,`<input name="${r(t)}" type="file" ${a} />`):e.type==="yesno"?ve(e,`<select name="${r(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?ve(e,`<input name="${r(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?ve(e,`<select name="${r(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(n=>`<option>${r(n)}</option>`).join("")}</select>`):e.type==="checkbox"?ve(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="checkbox" value="${r(n)}" /> ${r(n)}</label>`).join("")}</div>`):e.type==="multiple"?ve(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="radio" value="${r(n)}" ${a} /> ${r(n)}</label>`).join("")}</div>`):ve(e,`<input name="${r(t)}" ${a} />`)}function tc(e,t){const a=t?Xa(t.id):Qr(e),n=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(i=>`
            <button type="button" class="response-card">
              <strong>${r(Ie(i.form_id)?.title||"Unknown form")}</strong>
              <span>${r(i.submitted_by||i.submitter_email||"Anonymous")}</span>
              <small>${x(i.created_at)}</small>
            </button>
          `).join("")||v("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${n?Yr(n):v("No response selected.")}
      </aside>
    </section>
  `}function ac(e,t){const a=Tu(t),n=Qt(t),i=K(t).filter(c=>c.status!=="done").length,o=ge(Q(t),"estimate_total"),l=Ou(t);return`
    <section class="tool-page crm-page">
      ${G("CRM","Customers, contacts, and follow-ups built from company jobs.",`
        <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add customer job</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${F("Accounts",n.length)}
        ${F("Open jobs",Q(t).filter(c=>c.stage!=="Closed").length)}
        ${F("Open tasks",i)}
        ${F("Pipeline value",j(o))}
      </section>
      <section class="crm-toolbar panel">
        <label>
          <span>Search</span>
          <input data-crm-search value="${r(s.crmQuery)}" placeholder="Find customer, contact, job, or address" />
        </label>
        <label>
          <span>Stage</span>
          <select data-crm-stage-filter>
            ${["all"].concat(Ma()).map(c=>`<option value="${r(c)}" ${s.crmStageFilter===c?"selected":""}>${r(c==="all"?"All stages":c)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Owner</span>
          <select data-crm-owner-filter>
            <option value="all" ${s.crmOwnerFilter==="all"?"selected":""}>All owners</option>
            ${l.map(c=>`<option value="${r(c)}" ${s.crmOwnerFilter===c?"selected":""}>${r(c)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="panel crm-list-panel">
        <div class="section-head">
          <div><h2>Customers</h2><p>${a.length} visible account${a.length===1?"":"s"} in ${r(E(t))}</p></div>
        </div>
        <div class="data-table crm-table">
          <div class="table-head"><span>Account</span><span>Contact</span><span>Stage</span><span>Owner</span><span>Jobs</span><span>Value</span><span>Updated</span></div>
          ${a.map(c=>`
            <a class="table-row crm-account-row" href="${_(m("crm",{account:c.key},t))}" data-router>
              <span><strong>${r(c.name)}</strong><small>${r(c.subtitle)}</small></span>
              <span>${r(c.primaryContact)}</span>
              <span>${r(c.stage)}</span>
              <span>${r(c.owner)}</span>
              <span>${r(c.jobs.length)}</span>
              <span>${j(c.estimateTotal)}</span>
              <span>${x(c.updatedAt)}</span>
            </a>
          `).join("")||v("No CRM accounts match this view. Add a customer job to start the list.")}
        </div>
      </section>
    </section>
  `}function nc(e,t){const a=xu(e,t);if(!a)return I("CRM","Customer account",v("This customer is not visible in the current company view."));const n=a.latestJob,i=a.tasks.filter(o=>o.status!=="done");return I("CRM",a.name,`
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${r(a.name)}</h2>
            <p>${r(a.subtitle)}</p>
          </div>
          ${qr(a.priority)}
        </div>
        ${W([["Primary contact",a.primaryContact],["Owner",a.owner],["Current stage",a.stage],["Pipeline value",j(a.estimateTotal)],["Open tasks",String(i.length)],["Last updated",x(a.updatedAt)]])}
      </section>
      <section class="crm-rollup-grid">
        ${F("Jobs",a.jobs.length)}
        ${F("Files",a.fileCount)}
        ${F("Forms",a.formCount)}
        ${F("Tasks",a.tasks.length)}
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
              <span>${j(o.estimate_total)}</span>
            </a>
          `).join("")||v("No linked jobs yet.")}
        </div>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Follow-ups</h2><p>Open tasks across linked jobs.</p></div></div>
        <div class="queue-list">
          ${i.slice(0,6).map(o=>is(o)).join("")||v("No open follow-ups for this customer.")}
        </div>
      </section>
    </div>
  `,"crm-modal")}function sc(e,t){const a=Ne(t),n=rr(t);n&&s.selectedConversationId!==n.id&&(s.selectedConversationId=n.id);const i=!!(n&&e.params.get("conversation")),o=fc(t,a);return _m(t,n?.id||""),n&&Ka(n.id,!1),`
    <section class="tool-page messages-page ${i?"thread-open":""}">
      ${G("Messages","Company chats, role rooms, direct messages, and file sharing.",`
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      `)}
      <section class="message-kpi-row" aria-label="Message inbox summary">
        ${vt("ti-message-circle","Unread",o.unread,o.unreadDelta)}
        ${vt("ti-at","Mentions",o.mentions,o.mentionsDelta)}
        ${vt("ti-paperclip","Files shared",o.files,o.filesDelta)}
        ${vt("ti-clock","Waiting on you",o.waiting,o.waitingDelta)}
        ${vt("ti-users-group","Group chats",o.groups,"Active conversations")}
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
                <button type="button" data-action="set-message-filter" data-filter="${r(l)}" class="${s.messageFilter===l?"active":""}">${r(l==="all"?"All":T(l))}</button>
              `).join("")}
            </div>
          </div>
          <div class="conversation-list">
            ${a.map(l=>ic(l,t,n?.id===l.id)).join("")||v("No conversations match this view.")}
          </div>
        </aside>
        ${n?oc(t,n):""}
      </section>
      ${s.session?.auth==="local-basic"?_c():""}
    </section>
  `}function ic(e,t,a){const n=qe(e.id).at(-1),i=tt(e.id),o=n?cs(n.sender_profile_id):null,l=Ra(e.id).length,c=gc(e,t);return`
    <a class="conversation-row ${a?"active":""}" href="${_(m("messages",{conversation:e.id},t))}" data-router>
      <span class="conversation-unread-dot ${i?"active":""}"></span>
      ${X(o||{full_name:e.title},"avatar conversation-avatar")}
      <span class="message-workspace-chip">${r(c)}</span>
      <span class="conversation-copy">
        <strong>${r(e.title)}</strong>
        <small>${r(bc(n,e))}</small>
      </span>
      <span class="conversation-meta">
        <em>${n?ft(n.created_at):""}</em>
        ${l?`<small><i class="ti ti-paperclip"></i>${l}</small>`:""}
      </span>
      ${i?`<b>${i}</b>`:""}
    </a>
  `}function rc(e,t){const a=qe(t.id),n=h("messages.send",e);return`
    <div class="thread-head">
      <a class="btn mobile-thread-back" href="${_(m("messages",{},e))}" data-router><i class="ti ti-arrow-left"></i>Chats</a>
      <div class="thread-title">
        <span>${B(gm(t.type))}</span>
        <div>
          <h2>${r(t.title)}</h2>
          <p>${r(ds(t))}</p>
        </div>
      </div>
      <div class="thread-actions">
        <button class="btn" type="button" data-action="message-search-results"><i class="ti ti-search"></i>Search</button>
        <button class="btn" type="button" data-action="message-details" data-conversation-id="${r(t.id)}"><i class="ti ti-info-circle"></i>Details</button>
        <button class="btn" type="button" data-action="manage-message-chat" data-conversation-id="${r(t.id)}" ${h("messages.manage_groups",e)||h("messages.manage",e)?"":"disabled"}><i class="ti ti-users"></i>Access</button>
      </div>
    </div>
    <div class="message-stream">
      ${a.map(i=>uc(i)).join("")||v("No messages yet. Start the thread with a short update.")}
    </div>
    ${n?pc(t):v("Your role can view this chat but cannot send messages.")}
  `}function oc(e,t){return`
    <aside class="message-context-rail messages-thread-panel">
      <section class="message-preview-card panel">
        ${rc(e,t)}
      </section>
      ${lc(e,t)}
      ${cc(t)}
      ${dc(e)}
    </aside>
  `}function lc(e,t){const a=Xt(t).slice(0,6);return`
    <section class="message-side-card panel">
      <div class="message-side-head">
        <div><h3>Chat access</h3><p>Members (${Xt(t).length||"company"})</p></div>
        <button class="link-button" type="button" data-action="manage-message-chat" data-conversation-id="${r(t.id)}" ${h("messages.manage_groups",e)||h("messages.manage",e)?"":"disabled"}>Manage</button>
      </div>
      <div class="message-member-stack">
        ${a.map(n=>X(n,"avatar mini-avatar")).join("")}
        ${Xt(t).length>a.length?`<span class="member-more">+${Xt(t).length-a.length}</span>`:""}
      </div>
    </section>
  `}function cc(e){const t=Ra(e.id).slice(-4).reverse();return`
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
            <small>${r(Tr(a.size_bytes))}</small>
          </button>
        `).join("")||v("No shared files yet.")}
      </div>
    </section>
  `}function dc(e,t){const a=K(e).filter(n=>["todo","pending","review","hold"].includes(n.status)).slice(0,3);return`
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
            <small>${r(Ve(n.assignee_id))||"Unassigned"} · ${r(x(n.due))}</small>
          </a>
        `).join("")||v("No action items linked yet.")}
      </div>
    </section>
  `}function uc(e){const t=e.sender_profile_id===b().profile.id,a=cs(e.sender_profile_id),n=or(e.id);return`
    <article class="message-bubble ${t?"own":""}">
      ${X(a,"avatar message-avatar")}
      <div class="message-card">
        <div class="message-meta">
          <strong>${r(a.full_name||a.email||Ve(e.sender_profile_id))}</strong>
          <span>${ft(e.created_at)}</span>
          ${t&&h("messages.delete_own",e.company_id)||h("messages.delete_any",e.company_id)?`<button type="button" data-action="delete-message" data-message-id="${r(e.id)}"><i class="ti ti-trash"></i></button>`:""}
        </div>
        ${e.body?`<p>${bm(e.body)}</p>`:""}
        ${n.length?`<div class="message-attachments">${n.map(mc).join("")}</div>`:""}
      </div>
    </article>
  `}function mc(e){const t=e.mime_type.startsWith("image/");return`
    <button class="message-attachment" type="button" data-action="open-message-attachment" data-attachment-id="${r(e.id)}">
      ${e.preview_url&&t?`<img src="${r(e.preview_url)}" alt="" />`:B(t?"q-message-image":"q-message-file")}
      <span><strong>${r(e.file_name)}</strong><small>${r(Tr(e.size_bytes))}</small></span>
    </button>
  `}function pc(e){return`
    <form class="message-composer" data-message-form data-conversation-id="${r(e.id)}">
      <input name="body" placeholder="Message ${r(e.title)}" autocomplete="off" />
      <label class="icon-button message-attach-button" title="Attach file">
        <i class="ti ti-paperclip"></i>
        <input name="attachments" type="file" multiple ${h("messages.attach_files",e.company_id)?"":"disabled"} />
      </label>
      <button class="btn btn-primary" type="submit"><i class="ti ti-send"></i>Send</button>
    </form>
  `}function vt(e,t,a,n){return`
    <article class="message-kpi-card">
      <span><i class="ti ${r(e)}"></i>${r(t)}</span>
      <strong>${r(String(a))}</strong>
      <small>${r(n)}</small>
    </article>
  `}function fc(e,t){const a=t.flatMap(d=>qe(d.id)),n=t.reduce((d,f)=>d+tt(f.id),0),i=a.filter(d=>d.body.includes(`@${b().profile.full_name?.split(/\s+/)[0]||""}`)).length,o=t.reduce((d,f)=>d+Ra(f.id).length,0),l=K(e).filter(d=>["todo","pending","review","hold"].includes(d.status)).length,c=t.filter(d=>d.type!=="direct").length;return{unread:n,mentions:i,files:o,waiting:l,groups:c,unreadDelta:n?"+2 since yesterday":"All caught up",mentionsDelta:i?"+1 since yesterday":"No new mentions",filesDelta:o?"+2 since yesterday":"No files shared",waitingDelta:l?`${l} active items`:"Nothing waiting"}}function gc(e,t){const a=E(e.company_id||t);return String(a||"QH").split(/\s+/).map(n=>n[0]).join("").slice(0,2).toUpperCase()||"QH"}function bc(e,t){if(!e)return ds(t)||"No messages yet";const a=Ve(e.sender_profile_id);return`${a?`${a}: `:""}${e.body||(or(e.id).length?"Shared an attachment":"Sent a message")}`}function Xt(e){return Mt(e).map(a=>cs(a))}function _c(e){return`
    <div class="message-scenario">
      <button class="btn btn-primary" type="button" data-action="run-message-scenario"><i class="ti ti-sparkles"></i>Demo scenario</button>
      <button class="btn" type="button" data-action="reset-message-demo"><i class="ti ti-refresh"></i>Reset</button>
    </div>
  `}function vc(e){const t=ne(e);return I("Messages","New group chat",`
    <form class="message-modal-form" data-message-group-form>
      ${C("Chat name","title","",!0)}
      ${P("Type","type","custom",[["company","Company-wide"],["role","Role-based"],["custom","Custom group"]])}
      ${zi(e,[])}
      ${Ji(t,[])}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create group</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function yc(e){const t=ne(e).filter(a=>(a.profile_id||a.member_id)!==b().profile.id);return I("Messages","New direct message",`
    <form class="message-modal-form" data-direct-message-form>
      ${P("Person","profile_id",t[0]?.profile_id||t[0]?.member_id||"",t.map(a=>[a.profile_id||a.member_id,a.name]))}
      <label><span>First message</span><textarea name="body" rows="3" placeholder="Start with a short note"></textarea></label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Start chat</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function hc(e,t){const a=s.messageConversations.find(l=>l.id===t);if(!a)return I("Messages","Chat access",v("Conversation not found."));const n=Pa(a.id),i=n.filter(l=>l.target_type==="role").map(l=>l.target_id),o=n.filter(l=>l.target_type==="profile").map(l=>l.target_id);return I("Messages","Chat access",`
    <form class="message-modal-form" data-message-access-form data-conversation-id="${r(a.id)}">
      ${C("Chat name","title",a.title,!0)}
      ${P("Type","type",a.type,[["company","Company-wide"],["role","Role-based"],["custom","Custom group"],["direct","Direct message"]])}
      ${zi(e,i)}
      ${Ji(ne(e),o)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save access</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function zi(e,t=[]){const a=new Set(t);return`
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>Roles</strong>
        <small>Good for large crews. Access updates when role assignments change.</small>
      </div>
      <div class="message-role-grid">
        ${pe(e).map(n=>`
          <label class="message-role-option" style="--role-color:${r(n.color)}">
            <input type="checkbox" name="role_ids" value="${r(n.id)}" ${a.has(n.id)?"checked":""} />
            <span></span>
            <strong>${r(n.name)}</strong>
          </label>
        `).join("")}
      </div>
    </section>
  `}function Ji(e,t=[]){const a=new Set(t),n=e.slice().sort((i,o)=>We(i).localeCompare(We(o)));return`
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
          <span>${X(zs(i),"avatar tiny-avatar")} ${r(We(i))}</span>
        `).join("")||"<small>No individual people selected.</small>"}
      </div>
      <div class="message-people-list">
        ${n.map(i=>{const o=i.profile_id||i.member_id;return`
            <label class="message-person-row" data-message-person-row data-filter-text="${r([We(i),i.email,i.role_label,i.role].join(" ").toLowerCase())}">
              <input type="checkbox" name="profile_ids" value="${r(o)}" ${a.has(o)?"checked":""} />
              ${X(zs(i),"avatar message-person-avatar")}
              <span>
                <strong>${r(We(i))}</strong>
                <small>${r(pm(i))}</small>
              </span>
            </label>
          `}).join("")||v("No people available in this company yet.")}
      </div>
    </section>
  `}function $c(e,t){const a=s.messageConversations.find(n=>n.id===t);return a?I("Messages",a.title,`
    ${W([["Type",T(a.type)],["Access",ds(a)],["Messages",String(qe(a.id).length)],["Attachments",String(Ra(a.id).length)],["Last message",x(a.last_message_at)]])}
  `,"message-modal"):I("Messages","Chat details",v("Conversation not found."))}function wc(e){const t=s.messageQuery.trim().toLowerCase(),a=Ne(e).flatMap(n=>qe(n.id).filter(i=>!t||i.body.toLowerCase().includes(t)).map(i=>({conversation:n,message:i})));return I("Messages","Search results",`
    <div class="queue-list">
      ${a.slice(0,30).map(({conversation:n,message:i})=>`
        <a class="queue-row" href="${_(m("messages",{conversation:n.id},e))}" data-router>
          <span><strong>${r(n.title)}</strong><small>${r(i.body||"Attachment")}</small></span>
          <em>${ft(i.created_at)}</em>
        </a>
      `).join("")||v("No matching messages. Type in the Messages search box first.")}
    </div>
  `,"message-modal")}function Sc(e,t){const a=kr(t),n=we(t),i=hr(t).slice().sort(Et("received_at")).slice(0,5),o=Wn(t).slice().sort(Et("spent_at")).slice(0,5),l=zn(t).slice().sort((d,f)=>d.name.localeCompare(f.name)).slice(0,5),c=h("finance.manage",t);return`
    <section class="tool-page finance-page">
      ${G("Finance","Invoices, payments, expenses, vendors, and job-linked money in one company view.",`
        ${c?`
          <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
          <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
          <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
          <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        `:""}
        <a class="btn" href="${_(m("finance",{report:"summary"},t))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
      `)}
      <section class="metric-grid finance-metrics">
        ${F("Estimated pipeline",j(a.pipeline))}
        ${F("Invoiced",j(a.invoiced))}
        ${F("Collected",j(a.collected))}
        ${F("Outstanding",j(a.outstanding))}
        ${F("Expenses",j(a.expenses))}
        ${F("Net position",j(a.net))}
      </section>
      <section class="panel finance-aging">
        <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
        <div class="finance-aging-grid">
          ${[["Current",a.aging.current],["1-30",a.aging.thirty],["31-60",a.aging.sixty],["61+",a.aging.overSixty]].map(([d,f])=>`<div><span>${r(d)}</span><strong>${j(f)}</strong></div>`).join("")}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${n.length} billing record${n.length===1?"":"s"} for ${r(E(t))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${n.map(d=>`
            <a class="table-row" href="${_(m("finance",{invoice:d.id},t))}" data-router>
              <span><strong>${r(d.invoice_number)}</strong><small>${r(d.client_name||N(d.job_id)?.client_name||"No client")}</small></span>
              <span>${dm(Sr(d))}</span>
              <span>${r(N(d.job_id)?.name||"Company level")}</span>
              <span>${x(d.due_date)}</span>
              <span>${j(d.total)}</span>
              <span>${j(Kn(d.id))}</span>
              <span>${j(be(d.id))}</span>
            </a>
          `).join("")||v("No invoices yet. Create one from a job or customer record.")}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${i.map(d=>Ge(Le(d.invoice_id)?.invoice_number||"Payment",d.method,j(d.amount),d.received_at)).join("")||v("No payments recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${o.map(d=>Ge(cn(d.vendor_id),d.category,j(d.amount),d.spent_at,m("finance",{expense:d.id},t))).join("")||v("No expenses recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${l.map(d=>Ge(d.name,d.category,d.status,d.updated_at,m("finance",{vendor:d.id},t))).join("")||v("No vendors recorded.")}
          </div>
        </article>
      </section>
      ${c?"":'<p class="small-note">Your role can view finance records. Creating or editing invoices, payments, expenses, and vendors requires finance manage permission.</p>'}
    </section>
  `}function kc(e,t){return e.params.get("invoice")?Dc(t,e.params.get("invoice")):e.params.get("expense")?Cc(t,e.params.get("expense")):e.params.get("vendor")?jc(t,e.params.get("vendor")):e.params.get("report")==="summary"?Ac(t):""}function Dc(e,t){const a=Le(t);if(!a||a.company_id!==e)return I("Finance","Invoice",v("Invoice not found."));const n=wr(a.id),i=N(a.job_id);return I("Finance",a.invoice_number,`
    <div class="finance-detail-modal">
      ${W([["Client",a.client_name||i?.client_name||"No client"],["Status",Sr(a)],["Job",i?.name||"Company level"],["Issued",x(a.issue_date)],["Due",x(a.due_date)],["Total",j(a.total)],["Collected",j(Kn(a.id))],["Balance",j(be(a.id))]])}
      <div class="finance-modal-actions">
        ${h("finance.manage",e)?`
          <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${r(a.id)}"><i class="ti ti-cash"></i>Record payment</button>
          <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        `:""}
        ${i?`<a class="btn" href="${_(m("jobs",{tab:"profile",job_id:i.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${n.length} payment${n.length===1?"":"s"} applied.</p></div></div>
        <div class="finance-compact-list">
          ${n.map(o=>Ge(o.reference||o.method,o.method,j(o.amount),o.received_at)).join("")||v("No payments yet.")}
        </div>
      </section>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Cc(e,t){const a=$r(t);if(!a||a.company_id!==e)return I("Finance","Expense",v("Expense not found."));const n=N(a.job_id);return I("Finance",`${cn(a.vendor_id)} expense`,`
    <div class="finance-detail-modal">
      ${W([["Vendor",cn(a.vendor_id)],["Category",a.category],["Status",a.status],["Job",n?.name||"Company level"],["Spent",x(a.spent_at)],["Amount",j(a.amount)]])}
      <div class="finance-modal-actions">
        ${h("finance.manage",e)?`<button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit expense</button>`:""}
        ${n?`<a class="btn" href="${_(m("files",{job_id:n.id},e))}" data-router><i class="ti ti-folder"></i>Job files</a>`:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function jc(e,t){const a=Jn(t);if(!a||a.company_id!==e)return I("Finance","Vendor",v("Vendor not found."));const n=Wn(e).filter(i=>i.vendor_id===a.id);return I("Finance",a.name,`
    <div class="finance-detail-modal">
      ${W([["Contact",a.contact_name||"No contact"],["Email",a.email||"No email"],["Phone",a.phone||"No phone"],["Category",a.category],["Status",a.status],["Spend",j(ge(n,"amount"))]])}
      <div class="finance-modal-actions">
        ${h("finance.manage",e)?`
          <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
          <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${r(a.id)}"><i class="ti ti-receipt"></i>Add expense</button>
        `:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Ac(e){const t=kr(e);return I("Finance","Summary report",`
    <div class="finance-report-modal">
      ${W([["Company",E(e)],["Estimated pipeline",j(t.pipeline)],["Invoiced",j(t.invoiced)],["Collected",j(t.collected)],["Outstanding",j(t.outstanding)],["Expenses",j(t.expenses)],["Net position",j(t.net)]])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${j(t.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${j(t.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${j(t.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${j(t.aging.overSixty)}</strong></div>
      </div>
    </div>
  `,"finance-modal")}function Is(e,t=null){const a=t||Xu(e);return I("Finance",t?"Edit invoice":"New invoice",`
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${C("Invoice number","invoice_number",a.invoice_number,!0)}
      ${P("Linked job","job_id",a.job_id||"",[["","Company level"]].concat(Q(e).map(n=>[n.id,n.name])))}
      ${C("Client","client_name",a.client_name,!0)}
      ${P("Status","status",a.status,_i.map(n=>[n,n]))}
      ${C("Issue date","issue_date",a.issue_date,!1,"date")}
      ${C("Due date","due_date",a.due_date,!1,"date")}
      ${C("Subtotal","subtotal",a.subtotal,!1,"number")}
      ${C("Tax","tax",a.tax,!1,"number")}
      ${ye("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function qc(e,t=""){const a=em(e,t),n=we(e).map(i=>[i.id,`${i.invoice_number} - ${i.client_name||N(i.job_id)?.client_name||"No client"}`]);return I("Finance","Record payment",`
    <form class="finance-form" data-finance-payment-form>
      ${P("Invoice","invoice_id",a.invoice_id,n.length?n:[["","Create an invoice first"]])}
      ${C("Amount","amount",a.amount,!0,"number")}
      ${P("Method","method",a.method,hi.map(i=>[i,i]))}
      ${C("Received","received_at",a.received_at,!1,"date")}
      ${C("Reference","reference",a.reference)}
      ${ye("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Es(e,t=null,a=""){const n=t||tm(e,a),i=zn(e).map(o=>[o.id,o.name]);return I("Finance",t?"Edit expense":"Add expense",`
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${r(n.id)}" />
      ${P("Vendor","vendor_id",n.vendor_id,i.length?i:[["","No vendor yet"]])}
      ${P("Linked job","job_id",n.job_id||"",[["","Company level"]].concat(Q(e).map(o=>[o.id,o.name])))}
      ${P("Category","category",n.category,Ia.map(o=>[o,o]))}
      ${P("Status","status",n.status,vi.map(o=>[o,o]))}
      ${C("Amount","amount",n.amount,!0,"number")}
      ${C("Spent date","spent_at",n.spent_at,!1,"date")}
      ${ye("Notes","notes",n.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Ts(e,t=null){const a=t||am(e);return I("Finance",t?"Edit vendor":"Add vendor",`
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${C("Vendor name","name",a.name,!0)}
      ${C("Contact","contact_name",a.contact_name)}
      ${C("Email","email",a.email,!1,"email")}
      ${C("Phone","phone",a.phone)}
      ${P("Category","category",a.category,Ia.map(n=>[n,n]))}
      ${P("Status","status",a.status,yi.map(n=>[n,n]))}
      ${ye("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Mc(e,t){return e.section==="clock"?Oc(t):e.section==="calendar"?Fc(e,t):e.section==="approvals"?Rc(t):xc(t)}function Ta(e,t){return`
    ${xn("Operations sections",[[m("time",{},e),"My time",t==="time"],[m("calendar",{},e),"Calendar",t==="calendar"],[m("approvals",{},e),"Approvals",t==="approvals"],[m("clock",{},e),"Clock dashboard",t==="clock"]])}
  `}function Fc(e,t){const a=cu(t),n=Na(t),i=a.filter(d=>d.dateKey===D(0)),o=n.filter(d=>d.mine),l=n.filter(d=>d.source!=="manual").length,c=h("calendar.manage",t);return`
    <section class="tool-page operations-page calendar-page">
      ${G("Calendar","Company schedule built from tasks, approvals, finance due dates, time context, and manual events.",`
        <button class="btn btn-primary" type="button" data-action="open-calendar-event-form"><i class="ti ti-calendar-plus"></i>New event</button>
      `)}
      ${Ta(t,"calendar")}
      <section class="metric-grid operations-metrics calendar-metrics">
        ${F("Today",i.length)}
        ${F("This week",yu(a).length)}
        ${F("Mine",o.length)}
        ${F("From modules",l)}
      </section>
      <section class="workspace-toolbar calendar-toolbar">
        <div class="segmented" role="group" aria-label="Calendar scope">
          <button class="${s.calendarScope==="company"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="company"><i class="ti ti-building"></i>Company</button>
          <button class="${s.calendarScope==="me"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="me"><i class="ti ti-user"></i>Me</button>
        </div>
        <div class="segmented" role="group" aria-label="Calendar view">
          ${["month","week","list"].map(d=>`<button class="${s.calendarView===d?"active":""}" type="button" data-action="set-calendar-view" data-view="${r(d)}">${r(T(d))}</button>`).join("")}
        </div>
        <label class="wide-control">
          <span>Search</span>
          <input data-calendar-search value="${r(s.calendarQuery)}" placeholder="Find events, jobs, tasks, or people" />
        </label>
        <label>
          <span>Type</span>
          <select data-calendar-type-filter>
            <option value="all">All types</option>
            ${co.map(d=>`<option value="${r(d)}" ${s.calendarTypeFilter===d?"selected":""}>${r(d)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="calendar-nav">
        <div>
          <button class="btn" type="button" data-action="calendar-prev"><i class="ti ti-chevron-left"></i></button>
          <button class="btn" type="button" data-action="calendar-today">Today</button>
          <button class="btn" type="button" data-action="calendar-next"><i class="ti ti-chevron-right"></i></button>
        </div>
        <strong>${r(wu())}</strong>
      </section>
      <section class="calendar-shell">
        <article class="panel calendar-main">
          ${s.calendarView==="month"?Ic(t,a):""}
          ${s.calendarView==="week"?Ec(t,a):""}
          ${s.calendarView==="list"?Tc(t,a):""}
        </article>
        <aside class="panel calendar-agenda">
          <div class="section-head"><div><h2>Agenda</h2><p>Next events that match this view.</p></div></div>
          <div class="calendar-agenda-list">
            ${a.slice(0,9).map(Gi).join("")||v("No calendar items match this view.")}
          </div>
        </aside>
      </section>
      ${c?"":'<p class="small-note">Your role can view the calendar. Manual company events require calendar manage permission.</p>'}
    </section>
  `}function Ic(e,t){const a=$u(s.calendarCursorDate),n=new Date(`${s.calendarCursorDate}T00:00:00`).getMonth();return`
    <div class="calendar-grid calendar-month-grid">
      ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(i=>`<div class="calendar-weekday">${i}</div>`).join("")}
      ${a.map(i=>{const o=ur(t,i.key);return`
          <div class="calendar-day ${i.month===n?"":"muted"} ${i.key===D(0)?"today":""}">
            <div class="calendar-day-head"><b>${i.label}</b><span>${o.length||""}</span></div>
            ${o.slice(0,3).map(Ki).join("")}
            ${o.length>3?`<small class="calendar-more">+${o.length-3} more</small>`:""}
          </div>
        `}).join("")}
    </div>
  `}function Ec(e,t){return`
    <div class="calendar-grid calendar-week-grid">
      ${mr(s.calendarCursorDate).map(n=>{const i=ur(t,n.key);return`
          <div class="calendar-day ${n.key===D(0)?"today":""}">
            <div class="calendar-day-head"><b>${r(n.name)}</b><span>${r(n.shortDate)}</span></div>
            ${i.map(Ki).join("")||'<small class="calendar-empty-day">Open</small>'}
          </div>
        `}).join("")}
    </div>
  `}function Tc(e,t){const a=Su(t);return`
    <div class="calendar-list">
      ${Object.entries(a).slice(0,18).map(([i,o])=>`
        <section class="calendar-list-day">
          <h3>${r(x(i))}</h3>
          ${o.map(Gi).join("")}
        </section>
      `).join("")||v("No scheduled work or events.")}
    </div>
  `}function Ki(e){return`
    <button class="calendar-pill ${r(ku(e.type))}" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <span>${r(pr(e))}</span>
      <strong>${r(e.title)}</strong>
    </button>
  `}function Gi(e){return`
    <button class="calendar-agenda-item" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <i class="ti ${r(Du(e.type))}"></i>
      <span><strong>${r(e.title)}</strong><small>${r(`${x(e.dateKey)} · ${pr(e)} · ${e.type}`)}</small></span>
    </button>
  `}function xc(e){const t=_r(e),a=Vt(e);return`
    <section class="tool-page operations-page">
      ${G("My time","A compact personal work queue built from this company's tasks.",`
        <a class="btn" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Ta(e,"time")}
      <section class="metric-grid operations-metrics">
        ${F("Due today",t.dueToday.length)}
        ${F("Overdue",t.overdue.length)}
        ${F("Open work",t.open.length)}
        ${F("In review",t.review.length)}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel span-2">
          <div class="section-head"><div><h2>Today</h2><p>Due now, overdue, and highest priority work.</p></div></div>
          <div class="queue-list">
            ${t.focus.slice(0,8).map(n=>is(n)).join("")||v("No time-sensitive tasks for this company.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
          ${W([["Company",E(e)],["Assigned to you",String(t.assignedToMe.length)],["Due this week",String(t.thisWeek.length)],["Completed",String(t.done.length)]])}
        </article>
      <article class="panel span-2">
          <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
          <div class="data-table operations-table">
            <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
            ${t.thisWeek.slice(0,8).map(n=>`
              <a class="table-row" href="${_(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},e))}" data-router>
                <span><strong>${r(n.title)}</strong><small>${r(n.description||Ye(n.type))}</small></span>
                <span>${r(N(n.project_id)?.name||"Company task")}</span>
                <span>${r(H(n.assignee_id))}</span>
                <span>${x(n.due)}</span>
                <span>${Mr(n.status)}</span>
              </a>
            `).join("")||v("No upcoming tasks this week.")}
          </div>
        </article>
      </section>
    </section>
  `}function Oc(e){const t=vr(e),a=Vt(e),n=gt().getTime(),i=n-6*864e5,o=Bs(e,n)+(a?Date.now()-Date.parse(a.started_at):0),l=Bs(e,i)+(a?Date.now()-Date.parse(a.started_at):0);return`
    <section class="tool-page operations-page clock-page">
      ${G("Clock dashboard","Local basic-mode clock tracking for the active company.",`
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Ta(e,"clock")}
      <section class="metric-grid operations-metrics">
        ${F("Today",sa(o))}
        ${F("Last 7 days",sa(l))}
        ${F("Entries",t.length)}
        ${F("Status",a?"Clocked in":"Off clock")}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${a?W([["User",H(a.user_id)],["Started",_a(a.started_at)],["Task",a.task_title||"General shift"],["Elapsed",sa(Date.now()-Date.parse(a.started_at))]]):v("Nobody is clocked in on this device.")}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${t.slice(0,10).map(c=>`
              <div class="table-row">
                <span><strong>${r(c.task_title||"General shift")}</strong><small>${r(c.notes||"Clock entry")}</small></span>
                <span>${r(H(c.user_id))}</span>
                <span>${_a(c.started_at)}</span>
                <span>${sa(c.duration_ms)}</span>
              </div>
            `).join("")||v("No clock entries yet.")}
          </div>
        </article>
      </section>
    </section>
  `}function Rc(e){const t=Yn(e),a=t.filter(o=>o.type==="Form approval"),n=t.filter(o=>o.type==="Task review"),i=t.filter(o=>o.type==="Access request");return`
    <section class="tool-page operations-page">
      ${G("Approvals","Company review queue for forms, task handoffs, and access requests.",`
        <a class="btn" href="${_(m("forms",{},e))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${Ta(e,"approvals")}
      <section class="metric-grid operations-metrics">
        ${F("Open approvals",t.length)}
        ${F("Forms",a.length)}
        ${F("Task reviews",n.length)}
        ${F("Access",i.length)}
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
              <span>${x(o.updatedAt)}</span>
            </a>
          `).join("")||v("No approvals need attention right now.")}
        </div>
      </section>
    </section>
  `}function xs(e){return`
    ${G(T(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${v("Module data model pending.")}
    </section>
  `}function Os(e=!1){document.title="Quest HQ | Company operations workspace";const t=s.route||Nt(),a=xa(t.params.get("return_url")||_(m("jobs",{},V()))),n=String(t.params.get("invite")||"").trim(),i=String(t.params.get("auth")||"").trim(),o=Zi(t.params.get("mode")||i,n);o&&s.authMode!==o&&(s.authMode=o),n&&!["signin","register"].includes(s.authMode)&&(s.authMode="register");const l=e||!!(n||i),c=s.session;Ea.innerHTML=`
    <main class="landing-shell">
      <nav class="landing-nav">
        <a class="login-brand landing-brand" href="${_("/")}" data-router>
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Workplace Center</small></span>
        </a>
        <div class="landing-nav-links" aria-label="Landing navigation">
          ${[["Why Quest HQ","why-quest-hq"],["Security","security"],["Platform","platform"],["Access","platform"],["Company","why-quest-hq"]].map(([d,f])=>`<a href="#${r(f)}">${r(d)}</a>`).join("")}
        </div>
        <div class="landing-nav-actions">
          ${c?`<a class="btn" href="${_(m("jobs",{},u()))}" data-router>Open workspace</a>`:""}
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
          <img class="landing-console-art" src="${r(to)}" alt="Generated Quest HQ secure workspace cockpit preview showing company access, tasks, messages, finance, files, users, reports, and audit controls." />
          <aside class="landing-console-rail" aria-hidden="true">
            <span class="console-mark">Q</span>
            ${[["ti-home","Home",!0],["ti-list-check","Tasks"],["ti-calendar","Calendar"],["ti-users","CRM"],["ti-lock-dollar","Finance"],["ti-folder","Files"],["ti-forms","Forms"],["ti-message-circle","Messages",!1,"3"],["ti-user-cog","Users"],["ti-report-analytics","Reports"],["ti-settings","Settings"],["ti-clipboard-check","Audit"]].map(([d,f,g,S])=>`
              <span class="${g?"active":""}"><i class="ti ${r(d)}"></i><em>${r(f)}</em>${S?`<b>${r(S)}</b>`:""}</span>
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
              ${[["ti-shield-check","Company access","Pending approval","Approval required before modules open.","View status"],["ti-user-check","Active users","24","18 active · 6 pending","Manage users"],["ti-circle-check","Open tasks","42","12 overdue","View tasks"],["ti-message-circle","Unread messages","8","Across team chats","Open inbox"]].map(([d,f,g,S,U],O)=>`
                <article class="${O===0?"warning":""}">
                  <i class="ti ${r(d)}"></i>
                  <span>${r(f)}</span>
                  <strong>${r(g)}</strong>
                  <small>${r(S)}</small>
                  <button type="button">${r(U)}</button>
                </article>
              `).join("")}
            </div>
            <div class="landing-console-grid">
              <article class="landing-activity">
                <strong>Recent activity</strong>
                ${[["ti-file-dollar","Invoice #INV-1024 was created","Finance","10m ago"],["ti-forms","Shan submitted a form response","Forms","25m ago"],["ti-alert-circle","Leak inspection task was assigned","Tasks","1h ago"],["ti-file-upload","Permit packet.pdf was uploaded","Files","2h ago"],["ti-user-plus","Abraham joined the workspace","Users","3h ago"]].map(([d,f,g,S])=>`
                  <div><i class="ti ${r(d)}"></i><span><b>${r(f)}</b><small>${r(g)}</small></span><em>${r(S)}</em></div>
                `).join("")}
              </article>
              <article class="landing-health">
                <strong>Workspace health</strong>
                ${[["ti-circle-check","Company created","ok"],["ti-clock","Pending approval","wait"],["ti-link","Billing connected","muted"],["ti-shield-lock","Payment active","muted"],["ti-users","Full access enabled","muted"]].map(([d,f,g])=>`<div class="${r(g)}"><i class="ti ${r(d)}"></i>${r(f)}</div>`).join("")}
                <span class="landing-watermark">Q</span>
              </article>
            </div>
            <div class="landing-quick-access">
              ${[["ti-folder","Files"],["ti-users","CRM"],["ti-currency-dollar","Finance"],["ti-calendar","Calendar"],["ti-user-cog","Users"],["ti-clipboard-check","Audit"]].map(([d,f])=>`<span><i class="ti ${r(d)}"></i>${r(f)}</span>`).join("")}
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
            ${[["ti-shield-check","SOC 2","Type II path"],["ti-lock","AES-256","Encryption"],["ti-database-lock","RLS","Row-level security"],["ti-clock-check","99.9%","Uptime target"],["ti-clipboard-list","Audit","Every action"],["ti-key","Private","By default"]].map(([d,f,g])=>`<span><i class="ti ${r(d)}"></i><strong>${r(f)}</strong><small>${r(g)}</small></span>`).join("")}
          </div>
          <small class="landing-boundary"><i class="ti ti-lock"></i>Your data never leaves your company boundary.</small>
        </article>
        <article class="landing-access-card" id="platform">
          <div class="landing-access-head">
            <div class="eyebrow">Access model</div>
            <p>The right access for the right people. No shortcuts. No guesswork.</p>
          </div>
          <div class="landing-role-flow">
            ${[["ti-crown","Owner","Full access · Billing · Invites · Transfer ownership"],["ti-user-shield","Admin","Manage users · Roles · Module access"],["ti-user","Worker","Assigned access · Own tasks · Team collaboration"],["ti-shield-x","Finance denied","Finance hidden · No billing · No payments"],["ti-hourglass","Pending approval","Workspace created · Modules locked"]].map(([d,f,g],S)=>`
              <div class="${S===4?"pending":""}">
                <i class="ti ${r(d)}"></i>
                <strong>${r(f)}</strong>
                <span>${r(g)}</span>
              </div>
            `).join("")}
          </div>
        </article>
      </section>
      <section class="landing-proof" id="why-quest-hq">
        ${[["ti-cube","One workspace","Everything connected"],["ti-user-shield","Role-based access","Built-in guardrails"],["ti-calendar-user","Company control","You decide who sees what"],["ti-shield-check","Audit & accountability","Every action tracked"],["ti-chart-arrows","Scale with confidence","Built for growth"]].map(([d,f,g])=>`
          <article>
            <i class="ti ${r(d)}"></i>
            <span><strong>${r(f)}</strong><small>${r(g)}</small></span>
          </article>
        `).join("")}
        <blockquote>"Quest HQ lets our team work from one clean place without giving everyone access to everything."</blockquote>
      </section>
      ${l?Pc(a,n):""}
      ${Xi()}
    </main>
  `}function Pc(e,t,a){const n=Vu(t);return`
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
            ${Nc(t)}
            ${Lc(e)}
          `}
          <details class="demo-mode-details">
            <summary>Demo mode</summary>
            ${Uc(e)}
          </details>
          
        </div>
      </div>
    </div>
  `}function Zi(e,t=""){const a=String(e||"").toLowerCase().trim();return t&&!a?"register":["signin","register","invite","request"].includes(a)?a:a==="business"?"register":a==="worker"?t?"register":"invite":""}function Nc(e=""){const t=s.authMode;return`
    <nav class="auth-mode-bar" aria-label="Account access">
      ${(e?[["signin","Sign in"],["register","Create invited account"]]:[["signin","Sign in"],["register","Create workspace"],["invite","Join with invite"]]).map(([n,i])=>`
        <button class="${t===n?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="${r(n)}">${r(i)}</button>
      `).join("")}
    </nav>
  `}function Uc(e){return`
    <section class="demo-mode-box">
      <div>
        <strong>Demo mode</strong>
        <span>Local-only sample workspace. No Supabase database reads or writes.</span>
      </div>
      <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${r(e)}">Open demo mode</button>
    </section>
  `}function Lc(e){const t=String(s.route?.params?.get("invite")||"").trim();return s.authMode==="register"?`
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
        ${ea(t?"Workers cannot create access without a valid invite code.":"You become Owner, then Quest approves billing/access before the workspace opens.")}
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
        ${ea("Invite codes are shared by your Owner/Admin. No email delivery required.")}
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
        ${ea("Requests stay pending until a company Owner/Admin approves them.")}
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
      ${ea(t?"If you do not have an account yet, create an invited worker account.":"Business owners and workers use the same sign in after access is created.")}
      ${t?'<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="register">Create invited account</button>':""}
    </form>
  `}function ea(e){return s.loginError?`<div class="form-message error">${r(s.loginError)}</div>`:`<div class="form-message">${r(s.authMessage||e)}</div>`}function Qc(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${X(e,"avatar large")}
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
  `}function Vc(e,t){if(s.modal==="profile")return Qc(t.profile);if(s.modal==="file-upload")return Ml();if(s.modal==="folder-new")return ql();if(s.modal==="file-detail")return Wc(u());if(s.modal==="forms-tools")return zc(u());if(s.modal==="form-actions")return Zc(u(),Ft(u()));if(s.modal==="form-new")return Jc(u());if(s.modal==="form-preview")return Gc(u(),Ft(u()));if(s.modal==="job-new")return nn(u(),null);if(s.modal==="job-edit")return nn(u(),Oe());if(s.modal==="contact-new")return As(u(),null);if(s.modal==="contact-edit")return As(u(),Iu());if(s.modal==="stages-jobs")return qs("jobs");if(s.modal==="stages-contacts")return qs("contacts");if(s.modal==="finance-invoice-new")return Is(u(),null);if(s.modal==="finance-invoice-edit")return Is(u(),Le(s.selectedFinanceInvoiceId));if(s.modal==="finance-payment-new")return qc(u(),s.selectedFinanceInvoiceId);if(s.modal==="finance-expense-new")return Es(u(),null,s.selectedFinanceVendorId);if(s.modal==="finance-expense-edit")return Es(u(),$r(s.selectedFinanceExpenseId));if(s.modal==="finance-vendor-new")return Ts(u(),null);if(s.modal==="finance-vendor-edit")return Ts(u(),Jn(s.selectedFinanceVendorId));if(s.modal==="role-new")return Ql(u());if(s.modal==="invite-new")return Vl(u());if(s.modal==="message-group-new")return vc(u());if(s.modal==="message-direct-new")return yc(u());if(s.modal==="message-access")return hc(u(),s.selectedConversationId);if(s.modal==="message-details")return $c(u(),s.selectedConversationId);if(s.modal==="message-search")return wc(u());if(s.modal==="calendar-event-detail")return Hc(u());if(s.modal==="calendar-event-new")return Rs(u(),null);if(s.modal==="calendar-event-edit")return Rs(u(),Lt(s.selectedCalendarEventId));if(e.name==="company"&&e.section==="crm"&&e.params.get("account"))return nc(e.companyId,e.params.get("account"));if(e.name==="company"&&e.section==="finance"){const a=kc(e,e.companyId);if(a)return a}return e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"?nn(e.companyId,e.jobId?N(e.jobId):Oe()):e.name==="company"&&e.section==="tasks"?Yc(e,e.companyId):""}function Xi(){return s.toast?`
    <div class="app-toast ${r(s.toast.mode||"local")}" role="status" aria-live="polite">
      <strong>${r(s.toast.title||"Quest HQ")}</strong>
      <span>${r(s.toast.message||"")}</span>
    </div>
  `:""}function $(e,t="local",a="Not available yet"){s.toastTimer&&clearTimeout(s.toastTimer),s.toast={title:a,message:e,mode:t},p(),s.toastTimer=setTimeout(()=>{s.toast=null,s.toastTimer=null,p()},4200)}function I(e,t,a,n=""){return`
    <div class="modal-overlay">
      <div class="modal-panel ${r(n)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </div>
    </div>
  `}function Bc(e,t,a){return`
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </aside>
    </div>
  `}function nn(e,t){return I("Jobs",t?"Edit job":"Create job",ml(e,t),"wide-modal")}function Yc(e,t){const a=e.jobId?N(e.jobId):null,n=e.params.get("task_id")||"",i=n?Oa(n):null;return e.params.get("new")==="1"?I("Tasks","New task",Fs(t,a,null),"task-modal"):e.params.get("edit")==="1"&&i?I("Tasks","Edit task",Fs(t,a,i),"task-modal"):i?Bc("Task detail",i.title,_l(t,i)):""}function Hc(e){const t=_u(s.selectedCalendarEventId,e);if(!t)return"";const a=t.source==="manual"?Lt(t.sourceId):null,n=[t.href?`<a class="btn btn-primary" href="${_(t.href)}" data-router><i class="ti ti-arrow-right"></i>Open source</a>`:"",a&&t.editable?`<button class="btn" type="button" data-action="edit-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit</button>`:"",a&&t.editable?`<button class="btn danger" type="button" data-action="delete-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-trash"></i>Delete</button>`:""].filter(Boolean).join("");return I("Calendar",t.title,`
    <div class="calendar-detail">
      ${W([["Type",t.type],["When",t.allDay?x(t.dateKey):`${_a(t.startsAt)}${t.endsAt&&t.endsAt!==t.startsAt?` - ${_a(t.endsAt)}`:""}`],["Assigned",t.owner||"Unassigned"],["Source",t.source==="manual"?"Manual event":T(t.source)],["Linked",t.linkLabel||"None"]])}
      ${t.description?`<p>${r(t.description)}</p>`:""}
      <div class="modal-actions">${n||'<span class="small-note">This derived item opens from its source module.</span>'}</div>
    </div>
  `,"calendar-modal")}function Rs(e,t){const a=t||nm(e),n=a.linked_type==="job"?a.linked_id:"";return I("Calendar",t?"Edit event":"New event",`
    <form class="calendar-form" data-calendar-event-form>
      <input type="hidden" name="id" value="${r(t?.id||"")}" />
      ${C("Title","title",t?a.title:"",!0)}
      ${P("Type","event_type",a.event_type,Fa.map(i=>[i,i]))}
      ${C("Starts","starts_at",Hs(a.starts_at),!0,"datetime-local")}
      ${C("Ends","ends_at",Hs(a.ends_at||a.starts_at),!0,"datetime-local")}
      <label class="check-row"><input type="checkbox" name="all_day" ${a.all_day?"checked":""} /> All day</label>
      ${P("Visibility","visibility",a.visibility,[["company","Company"],["private","Private / assigned"]])}
      ${P("Assigned to","assigned_profile_id",a.assigned_profile_id,um(e))}
      ${P("Linked job","linked_job_id",n,[["","No linked job"]].concat(Q(e).map(i=>[i.id,i.name])))}
      <label class="span-2">Description<textarea name="description" rows="4">${r(a.description)}</textarea></label>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save event</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"calendar-form-modal")}function Wc(e){const t=s.selectedFileId?s.files.find(a=>a.id===s.selectedFileId):null;return t?I("Open file",t.file_name,jl(t,e),"file-viewer-modal"):""}function zc(e){return I("Forms","Tools",`
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${s.formTypeFilter==="all"?"selected":""}>All types</option>
          ${Ot.map(t=>`<option value="${r(t)}" ${s.formTypeFilter===t?"selected":""}>${r(t)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `)}function Jc(e){const t=s.formStartTab==="templates"?"templates":"blank",a=$t(),n=t==="templates"&&(a.find(d=>d.id===s.formStartTemplateId)||a[0])||null,i=n?.title||"",o=n?.description||"",l=n?.type||"Internal",c=n?.questions||[{type:"short",label:"First question",required:!1,options:[]}];return I("Forms","New form builder",`
    <form class="new-form-modal builder-create-modal" data-new-form-form>
      <input type="hidden" name="template_id" value="${r(n?.id||"")}" />
      <div class="form-start-tabs" role="tablist" aria-label="New form start type">
        <button class="${t==="blank"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="blank"><i class="ti ti-clipboard-plus"></i>Blank</button>
        <button class="${t==="templates"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="templates"><i class="ti ti-template"></i>Templates</button>
      </div>
      ${t==="templates"?`
        <div class="new-form-template-grid">
          ${a.map(d=>`
            <button class="${n?.id===d.id?"active":""}" type="button" data-action="select-form-start-template" data-template-id="${r(d.id)}">
              <span><i class="ti ti-template"></i></span>
              <strong>${r(d.title)}</strong>
              <small>${r(d.type)} / ${d.questions.length} questions</small>
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
            <div class="gform-accent-strip" style="--form-accent:${r(Me(e))}"></div>
            <label><span>Form title</span><input name="title" value="${r(i)}" placeholder="Untitled form" required /></label>
            <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${r(o)}</textarea></label>
          </article>
          <div class="new-form-question-list">
            ${c.map((d,f)=>Kc(d,f)).join("")}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${n?r(n.title):"Blank starter"}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${Ot.map(d=>`<option value="${r(d)}" ${d===l?"selected":""}>${r(d)}</option>`).join("")}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${Q(e).map(d=>`<option value="${r(d.id)}" ${s.route?.jobId===d.id?"selected":""}>${r(d.name)}</option>`).join("")}</select></label>
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
  `,"form-create-modal builder-modal")}function Kc(e,t){const a=It(e)?`
    <div class="starter-options">
      ${(e.options||["Option 1","Option 2"]).map(n=>`<span>${r(n)}</span>`).join("")}
    </div>
  `:"";return`
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${t+1}</span>
        <strong>${r(Nm(e.type))}</strong>
      </div>
      <label><span>Question</span><input value="${r(e.label||"Untitled question")}" readonly /></label>
      ${e.help?`<small>${r(e.help)}</small>`:""}
      ${a}
      <label class="check-row"><input type="checkbox" ${e.required?"checked":""} disabled /> Required</label>
    </article>
  `}function Gc(e,t){return t?I("Forms","Preview form",`
    <div class="form-preview-modal-body">
      ${Xl(e,t)}
    </div>
  `,"form-preview-modal"):I("Forms","Preview form",v("Choose a form first."))}function Zc(e,t){return t?I("Forms","Manage form",`
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
  `):I("Forms","Manage form",v("Choose a form first."))}function Xc(e){const t=s.accountMenuOpen&&!e.target.closest(".account-menu"),a=s.notificationMenuOpen&&!e.target.closest(".notification-center");t&&(s.accountMenuOpen=!1),a&&(s.notificationMenuOpen=!1);const n=e.target.closest("[data-action]");if(n){ed(e,n);return}const i=e.target.closest("[data-select-job]");if(i){e.preventDefault(),iu(i.dataset.selectJob);return}const o=e.target.closest("[data-select-task]");if(o){e.preventDefault(),ru(o.dataset.selectTask);return}const l=e.target.closest("a[href][data-router]");if(!l){(t||a)&&p();return}l.target||l.hasAttribute("download")||(e.preventDefault(),A(l.getAttribute("href")))}function ed(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),s.dataLoaded=!1,s.sync={label:"Refreshing...",mode:"loading"},p();return}if(a==="sign-out"){e.preventDefault(),s.accountMenuOpen=!1,nd();return}if(a==="toggle-account-menu"){e.preventDefault(),s.accountMenuOpen=!s.accountMenuOpen,s.notificationMenuOpen=!1,p();return}if(a==="toggle-notifications"){e.preventDefault(),s.notificationMenuOpen=!s.notificationMenuOpen,s.accountMenuOpen=!1,p();return}if(a==="toggle-sidebar"){e.preventDefault(),s.sidebarCollapsed=!s.sidebarCollapsed,localStorage.setItem(ii,String(s.sidebarCollapsed)),p();return}if(a==="toggle-nav-group"){e.preventDefault();const n=t.dataset.group;n&&(s.collapsedNavGroups.has(n)?s.collapsedNavGroups.delete(n):s.collapsedNavGroups.add(n),k(ri,[...s.collapsedNavGroups]),p());return}if(a==="toggle-nav-expand"){e.preventDefault();const n=t.dataset.module;n&&(s.expandedNav.has(n)?s.expandedNav.delete(n):s.expandedNav.add(n),k(oi,[...s.expandedNav]),p());return}if(a==="pipeline-open"){e.preventDefault();const n=t.dataset.module;Vs(n,"all",!0);return}if(a==="pipeline-stage"){e.preventDefault();const n=t.dataset.module;Vs(n,t.dataset.stage||"all",!1);return}if(a==="mark-all-notifications-read"){e.preventDefault(),Am(u()).catch(n=>console.warn("Notification read sync failed",n));return}if(a==="open-notification"){e.preventDefault(),qm(t.dataset.notificationId).catch(n=>console.warn("Notification open sync failed",n));return}if(a==="verify-email"){e.preventDefault(),s.accountMenuOpen=!1,$("Email verification is not implemented yet. Account access is not blocked right now.","local");return}if(a==="start-demo-mode"){e.preventDefault(),er(t.dataset.returnUrl||"");return}if(a==="open-auth-modal"){e.preventDefault();const n=Zi(t.dataset.authMode||"signin")||"signin";s.authMode=n,s.loginError="",s.authMessage="",A(`/?auth=${encodeURIComponent(n)}`);return}if(a==="close-auth-modal"){e.preventDefault(),s.loginError="",s.authMessage="",A("/");return}if(a==="set-auth-mode"){e.preventDefault();const n=["signin","register","invite","request"].includes(t.dataset.authMode)?t.dataset.authMode:"signin";if(s.authMode=n,s.loginError="",s.authMessage="",s.route?.name==="home"||s.route?.name==="login"){const i=new URLSearchParams(s.route.params);s.route.name==="home"?(i.set("auth",n),i.delete("mode")):(i.set("mode",n),i.delete("auth"));const o=i.toString();A(`${s.route.path}${o?`?${o}`:""}`,{replace:!0});return}p();return}if(a==="open-profile"){e.preventDefault(),s.accountMenuOpen=!1,s.modal="profile",p();return}if(a==="open-role-form"){if(e.preventDefault(),!y("roles.manage",u(),"Your role cannot manage roles.","Roles"))return;s.modal="role-new",p();return}if(a==="view-as-role"){e.preventDefault();const n=u(),i=mt(n,t.dataset.roleId);if(!i){$("That role is no longer available.","local","Role preview");return}s.rolePreview={company_id:n,role_id:i.id},$(`Viewing the workspace as ${i.name}.`,"local","Role preview");return}if(a==="exit-role-preview"){e.preventDefault(),s.rolePreview=null,$("Role preview ended.","live","Role preview");return}if(a==="open-invite-form"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot invite or manage users.","Users"))return;s.modal="invite-new",p();return}if(a==="new-message-group"){if(e.preventDefault(),!y("messages.create_group",u(),"Your role cannot create group chats.","Messages"))return;s.modal="message-group-new",p();return}if(a==="new-direct-message"){if(e.preventDefault(),!y("messages.send",u(),"Your role cannot start direct messages.","Messages"))return;s.modal="message-direct-new",p();return}if(a==="manage-message-chat"){if(e.preventDefault(),!y("messages.manage_groups",u(),"Your role cannot manage chat access.","Messages"))return;s.selectedConversationId=t.dataset.conversationId||s.selectedConversationId,s.modal="message-access",p();return}if(a==="message-details"){e.preventDefault(),s.selectedConversationId=t.dataset.conversationId||s.selectedConversationId,s.modal="message-details",p();return}if(a==="message-search-results"){e.preventDefault(),s.modal="message-search",p();return}if(a==="set-message-filter"){e.preventDefault(),s.messageFilter=["all","unread",...qn].includes(t.dataset.filter)?t.dataset.filter:"all",p();return}if(a==="delete-message"){e.preventDefault(),Ad(t.dataset.messageId);return}if(a==="open-message-attachment"){e.preventDefault(),qd(t.dataset.attachmentId);return}if(a==="run-message-scenario"){e.preventDefault(),vm(u());return}if(a==="reset-message-demo"){e.preventDefault(),hm();return}if(a==="set-calendar-scope"){e.preventDefault(),s.calendarScope=t.dataset.scope==="me"?"me":"company",p();return}if(a==="set-calendar-view"){e.preventDefault(),s.calendarView=["month","week","list"].includes(t.dataset.view)?t.dataset.view:"week",p();return}if(a==="calendar-prev"){e.preventDefault(),Qs(-1),p();return}if(a==="calendar-next"){e.preventDefault(),Qs(1),p();return}if(a==="calendar-today"){e.preventDefault(),s.calendarCursorDate=D(0),p();return}if(a==="open-calendar-event"){e.preventDefault(),s.selectedCalendarEventId=t.dataset.eventId||"",s.modal="calendar-event-detail",p();return}if(a==="open-calendar-event-form"){if(e.preventDefault(),!h("calendar.manage",u())){$("Your role can view the calendar but cannot create company events.","local","Calendar");return}s.selectedCalendarEventId="",s.modal="calendar-event-new",p();return}if(a==="edit-calendar-event"){e.preventDefault();const n=Lt(t.dataset.eventId);if(!n||!Ut(n)){$("This event cannot be edited from Calendar.","local","Calendar");return}s.selectedCalendarEventId=n.id,s.modal="calendar-event-edit",p();return}if(a==="delete-calendar-event"){e.preventDefault(),Cd(t.dataset.eventId);return}if(a==="copy-invite-link"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot view invite links.","Users"))return;_d(t.dataset.inviteId);return}if(a==="copy-invite-code"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot view invite codes.","Users"))return;vd(t.dataset.inviteId);return}if(a==="revoke-invite"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot revoke invites.","Users"))return;yd(t.dataset.inviteId);return}if(a==="approve-join-request"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot approve access requests.","Users"))return;Ps(t.dataset.requestId,"approved");return}if(a==="reject-join-request"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot reject access requests.","Users"))return;Ps(t.dataset.requestId,"rejected");return}if(a==="start-checkout"){e.preventDefault(),md();return}if(a==="review-workspace"){e.preventDefault(),pd(t.dataset.companyId,t.dataset.status);return}if(a==="open-file-upload"){if(e.preventDefault(),!y("files.manage",u(),"Your role can view files but cannot upload.","Files"))return;s.modal="file-upload",p();return}if(a==="open-folder-form"){if(e.preventDefault(),!y("files.manage",u(),"Your role can view files but cannot create folders.","Files"))return;s.modal="folder-new",p();return}if(a==="open-job-form"){if(e.preventDefault(),!y("jobs.manage",u(),"Your role can view jobs but cannot create or edit them.","Jobs"))return;const n=t.dataset.jobId||"";n&&(s.selectedJobId=n),s.modal=t.dataset.mode==="edit"?"job-edit":"job-new",p();return}if(a==="open-contact-form"){e.preventDefault();const n=t.dataset.contactId||"";n&&(s.selectedContactId=n),s.modal=t.dataset.mode==="edit"?"contact-edit":"contact-new",p();return}if(a==="delete-contact"){e.preventDefault(),sl(t.dataset.contactId);return}if(a==="set-pipeline-view"){e.preventDefault();const n=t.dataset.module,i=t.dataset.view==="board"?"board":"table";n==="contacts"?(s.contactBoardView=i,localStorage.setItem(ci,i)):(s.jobBoardView=i,localStorage.setItem(li,i)),p();return}if(a==="open-stage-manager"){e.preventDefault();const n=t.dataset.module==="contacts"?"contacts":"jobs";s.modal=`stages-${n}`,p();return}if(a==="add-stage"){e.preventDefault(),il(t.dataset.module==="contacts"?"contacts":"jobs");return}if(a==="delete-stage"){e.preventDefault(),rl(t.dataset.module==="contacts"?"contacts":"jobs",Number(t.dataset.index));return}if(a==="open-forms-tools"){if(e.preventDefault(),!y("forms.manage",u(),"Your role can view forms but cannot create or edit them.","Forms"))return;s.modal="forms-tools",p();return}if(a==="open-form-actions"){e.preventDefault(),na(t.dataset.formId,!1),s.modal="form-actions",p();return}if(a==="open-form-preview"){e.preventDefault(),na(t.dataset.formId,!1),s.modal="form-preview",p();return}if(a==="set-form-start-tab"){e.preventDefault(),s.formStartTab=t.dataset.tab==="templates"?"templates":"blank",s.formStartTab==="blank"&&(s.formStartTemplateId=""),s.formStartTab==="templates"&&!s.formStartTemplateId&&(s.formStartTemplateId=$t()[0]?.id||""),p();return}if(a==="select-form-start-template"){e.preventDefault(),s.formStartTab="templates",s.formStartTemplateId=t.dataset.templateId||$t()[0]?.id||"",p();return}if(a==="close-modal"){e.preventDefault(),td();return}if(a==="set-task-view"){e.preventDefault(),s.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(ni,s.taskView),p();return}if(a==="set-drive-view"){e.preventDefault(),s.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem(si,s.driveView),p();return}if(a==="clock-in"){e.preventDefault(),Ru(u(),t.dataset.taskId||s.route?.params?.get("task_id")||"");return}if(a==="clock-out"){e.preventDefault(),yr();return}if(a==="select-file"){e.preventDefault(),s.selectedFileId=t.dataset.fileId||"",s.modal="file-detail",p();return}if(a==="download-file"){e.preventDefault(),Yd(t.dataset.fileId);return}if(a==="delete-file"){if(e.preventDefault(),!y("files.manage",u(),"Your role cannot delete files.","Files"))return;Hd(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),s.formsTab=t.dataset.tab==="responses"?"responses":"library",p();return}if(a==="set-form-editor-tab"){e.preventDefault(),s.formEditorTab=t.dataset.tab||"questions",p();return}if(a==="new-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role can view forms but cannot create them.","Forms"))return;s.formStartTemplateId=t.dataset.templateId||"",s.formStartTab=t.dataset.startTab==="templates"||s.formStartTemplateId?"templates":"blank",s.formStartTab==="templates"&&!s.formStartTemplateId&&(s.formStartTemplateId=$t()[0]?.id||""),s.modal="form-new",p();return}if(a==="select-form"){e.preventDefault(),na(t.dataset.formId);return}if(a==="toggle-form-card"){e.preventDefault();const n=t.dataset.formId||"";s.expandedFormIds.has(n)?s.expandedFormIds.delete(n):s.expandedFormIds.add(n),p();return}if(a==="edit-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;na(t.dataset.formId,!1),s.formsTab="builder",s.formEditorTab="questions",s.modal="",p();return}if(a==="save-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;ie("Form saved locally"),p();return}if(a==="publish-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot publish forms.","Forms"))return;Zs(t.dataset.formId,"Published");return}if(a==="archive-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot archive forms.","Forms"))return;Zs(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot duplicate forms.","Forms"))return;Vm(t.dataset.formId);return}if(a==="delete-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot delete forms.","Forms"))return;Bm(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),Ym(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),Hm(u());return}if(a==="new-finance-invoice"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");s.selectedFinanceInvoiceId="",s.modal="finance-invoice-new",p();return}if(a==="edit-finance-invoice"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");s.selectedFinanceInvoiceId=t.dataset.invoiceId||"",s.modal="finance-invoice-edit",p();return}if(a==="new-finance-payment"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");s.selectedFinanceInvoiceId=t.dataset.invoiceId||s.route?.params?.get("invoice")||"",s.modal="finance-payment-new",p();return}if(a==="new-finance-expense"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");s.selectedFinanceExpenseId="",s.selectedFinanceVendorId=t.dataset.vendorId||"",s.modal="finance-expense-new",p();return}if(a==="edit-finance-expense"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");s.selectedFinanceExpenseId=t.dataset.expenseId||"",s.modal="finance-expense-edit",p();return}if(a==="new-finance-vendor"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");s.selectedFinanceVendorId="",s.modal="finance-vendor-new",p();return}if(a==="edit-finance-vendor"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");s.selectedFinanceVendorId=t.dataset.vendorId||"",s.modal="finance-vendor-edit",p();return}if(a==="add-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Wm(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;zm(t.dataset.questionId);return}if(a==="delete-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Jm(t.dataset.questionId);return}if(a==="move-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Km(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Gm(t.dataset.questionId);return}if(a==="remove-question-option"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Zm(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){if(e.preventDefault(),!y("jobs.manage",u(),"Your role cannot delete jobs.","Jobs"))return;Ed(t.dataset.jobId);return}if(a==="delete-task"){if(e.preventDefault(),!y("tasks.manage",u(),"Your role cannot delete tasks.","Tasks"))return;xd(t.dataset.taskId)}}function td(){const e=s.route||Nt();if(s.modal="",s.formStartTemplateId="",s.formStartTab="blank",s.selectedFinanceInvoiceId="",s.selectedFinanceExpenseId="",s.selectedFinanceVendorId="",e.name==="company"&&e.section==="tasks"&&(e.params.get("new")||e.params.get("edit")||e.params.get("task_id"))){A(m("tasks",e.jobId?{job_id:e.jobId}:{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"){const t=e.jobId?N(e.jobId):Oe();A(m("jobs",{tab:t?"profile":"pipeline",...t?{job_id:t.id}:{}},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="crm"&&e.params.get("account")){A(m("crm",{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="finance"&&(e.params.get("invoice")||e.params.get("expense")||e.params.get("vendor")||e.params.get("report"))){A(m("finance",{},e.companyId),{replace:!0});return}p()}function ad(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===Ze.localUsername&&String(t.password||"")===Ze.localPassword)){s.loginError="Invalid temporary credentials.",p();return}s.loginError="",er(t.return_url||_(m("jobs",{},V())));return}if(e.target.matches("[data-auth-sign-in-form]")){e.preventDefault(),rd(e.target);return}if(e.target.matches("[data-auth-register-form]")){e.preventDefault(),cd(e.target);return}if(e.target.matches("[data-auth-invite-code-form]")){e.preventDefault(),od(e.target);return}if(e.target.matches("[data-existing-invite-code-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries()),a=String(t.invite_code||"").trim();if(!a){s.loginError="Invite code is required.",p();return}On(a);return}if(e.target.matches("[data-auth-request-form]")){e.preventDefault(),ud(e.target);return}if(e.target.matches("[data-company-create-form]")){e.preventDefault(),dd(e.target);return}if(e.target.matches("[data-profile-form]")){e.preventDefault(),sd(e.target).catch(t=>{$(t.message||"Profile save failed.","local","Profile")});return}if(e.target.matches("[data-job-form]")){e.preventDefault(),Id(e.target);return}if(e.target.matches("[data-contact-form]")){e.preventDefault(),nl(e.target);return}if(e.target.matches("[data-stage-form]")){e.preventDefault(),ol(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),Td(e.target);return}if(e.target.matches("[data-new-form-form]")){e.preventDefault(),Qm(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),Od(e.target);return}if(e.target.matches("[data-folder-form]")){e.preventDefault(),Rd(e.target);return}if(e.target.matches("[data-finance-invoice-form]")){e.preventDefault(),Pd(e.target);return}if(e.target.matches("[data-finance-payment-form]")){e.preventDefault(),Nd(e.target);return}if(e.target.matches("[data-finance-expense-form]")){e.preventDefault(),Ud(e.target);return}if(e.target.matches("[data-finance-vendor-form]")){e.preventDefault(),Ld(e.target);return}if(e.target.matches("[data-role-form]")){e.preventDefault(),gd(e.target);return}if(e.target.matches("[data-invite-form]")){e.preventDefault(),bd(e.target);return}if(e.target.matches("[data-message-group-form]")){e.preventDefault(),$d(e.target);return}if(e.target.matches("[data-direct-message-form]")){e.preventDefault(),wd(e.target);return}if(e.target.matches("[data-message-access-form]")){e.preventDefault(),Sd(e.target);return}if(e.target.matches("[data-message-form]")){e.preventDefault(),kd(e.target);return}if(e.target.matches("[data-calendar-event-form]")){e.preventDefault(),Dd(e.target);return}if(e.target.matches("[data-user-role-form]")){e.preventDefault(),hd(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),Xm(e.target))}async function nd(){if(s.session?.auth==="supabase"){const e=M();e?.auth&&await e.auth.signOut()}localStorage.removeItem(Xe),s.session=null,s.dataLoaded=!1,A("/login",{replace:!0})}function er(e=""){s.loginError="",s.authMessage="",s.session=un(),Ti(),s.activeCompanyId=u(),localStorage.setItem(Ae,s.activeCompanyId),k(Xe,s.session),s.dataLoaded=!1,s.dataLoading=!1,A(xa(e||_(m("jobs",{},u()))),{replace:!0})}async function sd(e){const t=new FormData(e),a=b().profile,n=e.elements.avatar_file?.files?.[0]||null;let i=String(t.get("avatar_url")||a.avatar_url||"").trim();if(n&&n.size){const l=await id(n);if(!l.ok)return;i=l.url}let o=At({...a,full_name:String(t.get("full_name")||"").trim()||a.full_name||"Quest user",avatar_url:i},a);if(s.session?.auth==="supabase"){const l=M();if(!l){$("Profile upload needs Supabase to be available.","local","Profile");return}const c=await l.from("profiles").update({full_name:o.full_name,avatar_url:o.avatar_url}).eq("id",a.id).select().single();if(c.error){$(c.error.message||"Profile save failed.","local","Profile");return}o=At(c.data,o),l.auth?.updateUser&&await l.auth.updateUser({data:{full_name:o.full_name,avatar_url:o.avatar_url}}),s.profiles=[o].concat(s.profiles.filter(d=>d.id!==o.id)),o.member_id&&(s.teamMembers=s.teamMembers.map(d=>d.id===o.member_id?{...d,full_name:o.full_name,name:o.full_name,avatar_url:o.avatar_url}:d))}else k(ei,o),s.profileDraft=o;s.session={...b(),profile:o},k(Xe,s.session),s.modal="",$("Profile saved.",s.session?.auth==="supabase"?"live":"local","Profile")}async function id(e){if(!["image/jpeg","image/png","image/webp"].includes(e.type))return $("Use a PNG, JPG, or WebP image for your profile picture.","local","Profile"),{ok:!1,url:""};if(e.size>2*1024*1024)return $("Profile pictures must be 2 MB or smaller.","local","Profile"),{ok:!1,url:""};if(s.session?.auth!=="supabase"){const f=await xr(e);return f?{ok:!0,url:f}:($("Could not read that image file.","local","Profile"),{ok:!1,url:""})}const a=M(),n=b().profile.id,i=xm(e),o=`${n}/avatar-${Date.now()}.${i}`,l=await a.storage.from("avatars").upload(o,e,{cacheControl:"3600",upsert:!0,contentType:e.type});if(l.error)return $(l.error.message||"Profile picture upload failed.","local","Profile"),{ok:!1,url:""};const c=a.storage.from("avatars").getPublicUrl(o),d=c.data?.publicUrl?`${c.data.publicUrl}?v=${Date.now()}`:"";return d?{ok:!0,url:d}:($("Profile picture uploaded, but no public URL was returned.","local","Profile"),{ok:!1,url:""})}async function rd(e){const t=Object.fromEntries(new FormData(e).entries()),a=M();if(!a?.auth){s.loginError="Supabase auth is unavailable.",p();return}s.loginError="",s.authMessage="Signing in...",p();const n=await a.auth.signInWithPassword({email:String(t.email||"").trim(),password:String(t.password||"")});if(n.error){s.loginError=n.error.message||"Unable to sign in.",s.authMessage="",p();return}if(await St(n.data.session),t.invite_token){await On(t.invite_token,t.return_url);return}s.authMessage="",s.dataLoaded=!1,A(xa(t.return_url||_(m("jobs",{},V()))),{replace:!0})}async function od(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.invite_code||"").trim();if(!a){s.loginError="Invite code is required.",p();return}s.loginError="",s.authMessage="Checking invite code...",s.authMode="register",p();const n=await ld(a);if(n?.missing){s.loginError="Invite code was not found or is no longer pending.",s.authMessage="",s.authMode="invite",p();return}if(n?.status&&n.status!=="pending"){s.loginError=`This invite is ${n.status}. Ask your company admin for a new code.`,s.authMessage="",s.authMode="invite",p();return}if(n?.expires_at&&Date.parse(n.expires_at)<=Date.now()){s.loginError="This invite code expired. Ask your company admin for a new code.",s.authMessage="",s.authMode="invite",p();return}n?(s.inviteLookup=n,s.authMessage=`Invite found for ${n.email}.`):s.authMessage="";const i=new URLSearchParams({invite:a}),o=xa(t.return_url||"");o&&i.set("return_url",o),i.set("mode","register"),A(`/login?${i.toString()}`,{replace:!0})}async function ld(e){const t=String(e||"").trim(),a=M();if(!t||!a)return null;const n=await a.rpc("lookup_company_invite",{invite_token:t}).catch(o=>({error:o}));if(n.error)return null;const i=Array.isArray(n.data)?n.data[0]:n.data;return i?{token:t,company_id:w(i.company_id||""),company_name:String(i.company_name||i.company_id||"").trim(),email:String(i.email||"").trim(),status:String(i.status||"").trim(),expires_at:i.expires_at||""}:{missing:!0}}async function cd(e){const t=Object.fromEntries(new FormData(e).entries()),a=M();if(!a?.auth){s.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),i=String(t.password||""),o=String(t.full_name||"").trim(),l=String(t.invite_token||"").trim(),c=String(t.company_name||"").trim();if(!n||!i||!o||!l&&!c){s.loginError=l?"Name, email, and password are required.":"Name, email, password, and company workspace are required.",p();return}s.loginError="",s.authMessage=l?"Creating account and accepting invite...":"Creating secure workspace...",p();const d=await a.auth.signUp({email:n,password:i,options:{data:{full_name:o}}});if(d.error){const S=/already|registered|exists/i.test(d.error.message||"");s.loginError=S&&l?"That email already has a Quest HQ account. Sign in with the invited email to accept this invite.":d.error.message||"Unable to create account.",S&&l&&(s.authMode="signin"),s.authMessage="",p();return}let f=d.data.session;if(!f){const S=await a.auth.signInWithPassword({email:n,password:i});if(S.error){s.loginError="Account created. Please sign in to finish workspace setup.",s.authMode="signin",s.authMessage="",p();return}f=S.data.session}if(await St(f),l){await On(l,t.return_url);return}const g=await a.rpc("create_company_workspace",{company_name:c});if(g.error){s.loginError=g.error.message||"Account created, but workspace setup failed.",s.authMessage="",p();return}s.activeCompanyId=w(g.data||V()),Gn(s.activeCompanyId),localStorage.setItem(Ae,s.activeCompanyId),s.dataLoaded=!1,s.authMessage="",A(m("settings",{tab:"billing"},s.activeCompanyId),{replace:!0})}async function dd(e){const t=Object.fromEntries(new FormData(e).entries()),a=M(),n=String(t.company_name||"").trim();if(!a||!n){s.loginError="Company workspace name is required.",p();return}const i=await a.rpc("create_company_workspace",{company_name:n});if(i.error){s.loginError=i.error.message||"Workspace setup failed.",p();return}s.activeCompanyId=w(i.data||V()),Gn(s.activeCompanyId),localStorage.setItem(Ae,s.activeCompanyId),s.dataLoaded=!1,A(m("settings",{tab:"billing"},s.activeCompanyId),{replace:!0})}async function ud(e){const t=Object.fromEntries(new FormData(e).entries()),a=M();if(!a?.auth){s.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),i=String(t.password||""),o=w(t.company_id||"");s.loginError="",s.authMessage="Submitting access request...",p();const l=await a.auth.signInWithPassword({email:n,password:i});if(l.error){s.loginError=l.error.message||"Sign in first to request access.",s.authMessage="",p();return}await St(l.data.session);const c=await a.rpc("request_company_access",{target_company_id:o,request_message:String(t.message||"").trim()||null});if(c.error){s.loginError=c.error.message||"Unable to request access.",s.authMessage="",p();return}s.authMessage="Access request sent. An Owner/Admin must approve it.",s.loginError="",s.authMode="signin",p()}async function md(){const e=u();s.sync={label:"Opening billing...",mode:"loading"},p();try{const t=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json",...b().access_token?{Authorization:`Bearer ${b().access_token}`}:{}},body:JSON.stringify({company_id:e,return_url:`${window.location.origin}${_(m("settings",{tab:"billing"},e))}`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.url)throw new Error(a.error||"Billing is not configured yet.");window.location.href=a.url}catch(t){s.sync={label:t.message||"Billing unavailable",mode:"local"},p()}}async function pd(e,t){const a=w(e),n=za(t);if(!a||!n||!Zn()){$("Quest developer access is required to review workspaces.","local","Workspace review");return}const i=M();if(s.sync={label:"Updating workspace review...",mode:"loading"},p(),s.session?.auth==="supabase"&&i){const o=await i.rpc("review_company_workspace",{target_company_id:a,next_status:n,review_note:`Marked ${n} from Quest HQ approval console`});if(o.error){s.sync={label:o.error.message||"Workspace review failed",mode:"local"},$(o.error.message||"Workspace review failed.","local","Workspace review"),p();return}}fd(a,n),await ot(a,"workspace.reviewed","company_subscription",a,{status:n},s.session?.auth==="supabase"),s.sync={label:`Workspace marked ${ua(n).toLowerCase()}`,mode:s.session?.auth==="supabase"?"live":"local"},$(`Workspace marked ${ua(n).toLowerCase()}.`,s.session?.auth==="supabase"?"live":"local","Workspace review"),p()}function fd(e,t){const a=fa({...Bt(e)||{},company_id:e,status:t});s.subscriptions=Cr(s.subscriptions.filter(i=>i.company_id!==e).concat(a));const n=ht({...s.workspaceReviews.find(i=>i.company_id===e)||{},company_id:e,company_name:E(e),status:t,plan_code:a.plan_code,amount_cents:a.amount_cents,currency:a.currency,created_at:new Date().toISOString()});s.workspaceReviews=s.workspaceReviews.filter(i=>i.company_id!==e).concat(n),t==="pending_review"?Gn(e):Qu(e)}async function gd(e){const t=u();if(!y("roles.manage",t,"Your role cannot manage roles.","Roles"))return;const a=new FormData(e),n=Ke({id:crypto.randomUUID(),company_id:t,name:a.get("name"),color:a.get("color")||"#f0b23b",priority:a.get("priority")||100,is_system:!1,created_by:b().profile.id}),i=a.getAll("permissions").map(l=>String(l||"")).filter(Boolean),o=M();if(s.session?.auth==="supabase"&&o){const l=await o.from("roles").insert(n).select().single();if(l.error){s.sync={label:l.error.message||"Role save failed",mode:"local"},p();return}const c=Ke(l.data),d=i.map(f=>({role_id:c.id,permission_key:f,effect:"allow"}));d.length&&await o.from("role_permissions").insert(d),s.roles.unshift(c),s.rolePermissions=d.concat(s.rolePermissions).map(dn),s.sync={label:"Role saved",mode:"live"}}else s.roles.unshift(n),s.rolePermissions=i.map(l=>dn({role_id:n.id,permission_key:l,effect:"allow"})).concat(s.rolePermissions),s.sync={label:"Role saved locally",mode:"local"};s.modal="",p()}async function bd(e){const t=new FormData(e),a=w(t.get("company_id")||u());if(!y("users.manage",a,"Your role cannot invite users.","Users"))return;const n=String(t.get("email")||"").trim().toLowerCase(),i=String(t.get("role_id")||"").trim();if(!n){s.sync={label:"Invite email is required",mode:"local"},p();return}const o=ga({id:crypto.randomUUID(),company_id:a,email:n,role_id:Tt(i)?i:"",token:qu(),status:"pending",invited_by:b().profile.id,expires_at:new Date(Date.now()+336*60*60*1e3).toISOString(),created_at:new Date().toISOString()}),l=M();if(s.session?.auth==="supabase"&&l){const c={company_id:o.company_id,email:o.email,role_id:o.role_id||null,token:o.token,status:"pending",invited_by:b().profile.id},d=await l.from("company_invites").insert(c).select().single();if(d.error){s.sync={label:d.error.message||"Invite save failed",mode:"local"},p();return}s.companyInvites.unshift(ga(d.data)),await ot(o.company_id,"invite.created","company_invite",d.data.id,{email:o.email},!0),s.sync={label:"Invite code created. Copy it for the new user.",mode:"live"}}else s.companyInvites.unshift(o),ot(o.company_id,"invite.created","company_invite",o.id,{email:o.email}),s.sync={label:"Invite code created locally",mode:"local"};J("access.invite","Invite code created",`${Y()} created an invite code for ${o.email}.`,m("settings",{tab:"access"},o.company_id),"invite",o.id,o.company_id),s.modal="",p()}async function On(e,t=""){const a=M();if(!a){s.loginError="Supabase auth is unavailable.",s.authMessage="",p();return}s.authMessage="Accepting workspace invite...",p();const n=await a.rpc("accept_company_invite",{invite_token:String(e||"").trim()});if(n.error){s.loginError=n.error.message||"Unable to accept invite.",s.authMessage="",p();return}const i=w(n.data||V());s.activeCompanyId=i,localStorage.setItem(Ae,i),s.inviteLookup=null,s.authMessage="",s.loginError="",s.dataLoaded=!1,A(m("jobs",{},i),{replace:!0})}async function _d(e){const t=s.companyInvites.find(a=>a.id===e);if(!(t&&!y("users.manage",t.company_id,"Your role cannot view invite links.","Users"))){if(!t?.token){s.sync={label:"Invite link is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(Mu(t)),s.sync={label:"Invite link copied",mode:"live"}}catch{s.sync={label:"Copy failed",mode:"local"}}p()}}async function vd(e){const t=s.companyInvites.find(a=>a.id===e);if(!(t&&!y("users.manage",t.company_id,"Your role cannot view invite codes.","Users"))){if(!t?.token){s.sync={label:"Invite code is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(t.token),s.sync={label:"Invite code copied",mode:"live"}}catch{s.sync={label:"Copy failed",mode:"local"}}p()}}async function yd(e){const t=s.companyInvites.find(n=>n.id===e);if(!t||!y("users.manage",t.company_id,"Your role cannot revoke invites.","Users"))return;const a=M();if(s.session?.auth==="supabase"&&a){const n=await a.rpc("revoke_company_invite",{target_invite_id:t.id});if(n.error){s.sync={label:n.error.message||"Invite revoke failed",mode:"local"},p();return}s.sync={label:"Invite revoked",mode:"live"}}else s.sync={label:"Invite revoked locally",mode:"local"};s.companyInvites=s.companyInvites.map(n=>n.id===t.id?ga({...n,status:"revoked"}):n),ot(t.company_id,"invite.revoked","company_invite",t.id,{email:t.email}),J("access.invite","Invite revoked",`${Y()} revoked the invite for ${t.email}.`,m("settings",{tab:"access"},t.company_id),"invite",t.id,t.company_id),te(),p()}async function hd(e){const t=new FormData(e),a=w(t.get("company_id")||u());if(!y("users.manage",a,"Your role cannot manage user access.","Users"))return;const n=String(t.get("profile_id")||"").trim(),i=String(t.get("role_id")||"").trim(),o=["active","pending","disabled","left"].includes(String(t.get("membership_status")))?String(t.get("membership_status")):"active",l=mt(a,i);if(!n||!l){s.sync={label:"Select a user and role",mode:"local"},p();return}const c=Uu(a,n,l,o);if(c){s.sync={label:c,mode:"local"},p();return}const d=pa({company_id:a,profile_id:n,role:Vn(l),status:o}),f=oe(a,n),g=jr({company_id:a,profile_id:n,role_id:l.id,assigned_by:b().profile.id}),S=M();if(s.session?.auth==="supabase"&&S){const U=Tt(l.id),O=await S.rpc("update_company_member_access",{target_company_id:a,target_profile_id:n,target_role:d.role,target_role_id:U?l.id:null,target_status:o});if(O.error){s.sync={label:O.error.message||"Access update failed",mode:"local"},p();return}ca(pa(O.data||d)),U&&Ls(g),s.sync={label:U?"User access saved":"Membership saved; create a role to assign permissions",mode:"live"}}else ca(d),Ls(g),s.sync={label:"User access saved locally",mode:"local"};J("access.role","User access updated",`${Y()} set ${Ve(n)} to ${l.name} / ${T(o)}.`,m("settings",{tab:"access"},a),"membership",n,a,[n].concat(fe(a,["users.manage","settings.manage"]))),ot(a,Mm(f,d),"membership",n,{role:l.name,status:o}),p()}async function Ps(e,t){const a=s.joinRequests.find(l=>l.id===e);if(!a||!["approved","rejected"].includes(t)||!y("users.manage",a.company_id,"Your role cannot manage access requests.","Users"))return;const n=M(),i=Ar({...a,status:t}),o=pa({company_id:a.company_id,profile_id:a.profile_id,role:"member",status:t==="approved"?"active":"disabled"});if(s.session?.auth==="supabase"&&n){const l=await n.rpc("review_company_join_request",{target_request_id:a.id,decision:t,target_role_id:null});if(l.error){s.sync={label:l.error.message||"Request update failed",mode:"local"},p();return}t==="approved"&&ca(o),s.sync={label:t==="approved"?"Access approved":"Request rejected",mode:"live"}}else t==="approved"&&ca(o),s.sync={label:t==="approved"?"Access approved locally":"Request rejected locally",mode:"local"};s.joinRequests=s.joinRequests.map(l=>l.id===a.id?i:l),ot(a.company_id,t==="approved"?"join.approved":"join.rejected","join_request",a.id,{email:a.requested_email}),J("access.request",t==="approved"?"Access approved":"Access rejected",`${Y()} ${t==="approved"?"approved":"rejected"} ${a.requested_email||"a join request"}.`,m("settings",{tab:"access"},a.company_id),"join_request",a.id,a.company_id,[a.profile_id].concat(fe(a.company_id,["users.manage","settings.manage"]))),te(),p()}async function $d(e){const t=u();if(!h("messages.create_group",t)){$("Your role cannot create group chats.","local","Messages");return}const a=new FormData(e),n=["company","role","custom"].includes(a.get("type"))?String(a.get("type")):"custom",i=Se({id:crypto.randomUUID(),company_id:t,title:String(a.get("title")||"").trim()||"New group chat",type:n,created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=ls(a,i,n);!o.some(c=>c.target_type==="profile"&&c.target_id===b().profile.id)&&n!=="company"&&o.push(ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:i.id,target_type:"profile",target_id:b().profile.id})),await Rn(i,o)&&(s.selectedConversationId=i.id,s.modal="",J("message.group","Group chat created",`${Y()} created ${i.title}.`,m("messages",{conversation:i.id},t),"message_conversation",i.id,t,Mt(i)),A(m("messages",{conversation:i.id},t),{replace:!0}))}async function wd(e){const t=u();if(!y("messages.send",t,"Your role cannot start direct messages.","Messages"))return;const a=new FormData(e),n=String(a.get("profile_id")||"").trim();if(!n){$("Choose a person first.","local","Messages");return}const i=Se({id:crypto.randomUUID(),company_id:t,title:Ve(n),type:"direct",created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=[ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:i.id,target_type:"profile",target_id:b().profile.id}),ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:i.id,target_type:"profile",target_id:n})];if(!await Rn(i,o))return;s.selectedConversationId=i.id,s.modal="";const c=String(a.get("body")||"").trim();c&&await tr(i,c,[]),J("message.direct","Direct message started",`${Y()} started a direct message with ${i.title}.`,m("messages",{conversation:i.id},t),"message_conversation",i.id,t,[n]),A(m("messages",{conversation:i.id},t),{replace:!0})}async function Sd(e){const t=u();if(!h("messages.manage_groups",t)&&!h("messages.manage",t)){$("Your role cannot manage chat access.","local","Messages");return}const a=s.messageConversations.find(f=>f.id===e.dataset.conversationId);if(!a)return;const n=new FormData(e),i=Se({...a,title:String(n.get("title")||"").trim()||a.title,type:qn.includes(n.get("type"))?String(n.get("type")):a.type,updated_at:new Date().toISOString()}),o=ls(n,i,i.type);i.type!=="company"&&!o.some(f=>f.target_type==="profile"&&f.target_id===b().profile.id)&&o.push(ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:i.id,target_type:"profile",target_id:b().profile.id}));const l=Mt(a);if(!await Rn(i,o,!0))return;const d=Mt(i).filter(f=>!l.includes(f));d.length&&J("message.group","Added to chat",`${Y()} added you to ${i.title}.`,m("messages",{conversation:i.id},t),"message_conversation",i.id,t,d),s.modal="",$("Chat access saved.",s.session?.auth==="supabase"?"live":"local","Messages"),p()}async function kd(e){const t=s.messageConversations.find(o=>o.id===e.dataset.conversationId);if(!t)return;if(!h("messages.send",t.company_id)){$("Your role cannot send messages.","local","Messages");return}const a=new FormData(e),n=String(a.get("body")||"").trim(),i=Array.from(e.elements.attachments?.files||[]);if(!n&&!i.length){$("Type a message or attach a file.","local","Messages");return}if(i.length&&!h("messages.attach_files",t.company_id)){$("Your role cannot attach files.","local","Messages");return}await tr(t,n,i),e.reset(),p()}async function Dd(e){const t=u(),a=Object.fromEntries(new FormData(e).entries()),n=a.id?Lt(String(a.id)):null;if(!n&&!h("calendar.manage",t)){$("Your role cannot create or edit calendar events.","local","Calendar");return}if(n&&!Ut(n)){$("This event cannot be edited from Calendar.","local","Calendar");return}const i=String(a.linked_job_id||"").trim(),o=new Date().toISOString();let l=rt({...n||{},id:n?.id||crypto.randomUUID(),company_id:t,title:String(a.title||"").trim()||"Calendar event",description:String(a.description||"").trim(),event_type:Fa.includes(a.event_type)?String(a.event_type):"Company event",starts_at:Ws(a.starts_at),ends_at:Ws(a.ends_at||a.starts_at),all_day:a.all_day==="on",visibility:a.visibility==="private"?"private":"company",linked_type:i?"job":"",linked_id:i,assigned_profile_id:String(a.assigned_profile_id||""),created_by:n?.created_by||b().profile.id,created_at:n?.created_at||o,updated_at:o});const c=M();if(s.session?.auth==="supabase"&&c){const d=Ju(l);n&&delete d.id;const f=n?await c.from("calendar_events").update({...d,updated_at:o}).eq("id",n.id).select().single():await c.from("calendar_events").insert(d).select().single();if(f.error){$(f.error.message||"Calendar event save failed.","local","Calendar");return}l=rt(f.data)}s.calendarEvents=[l].concat(s.calendarEvents.filter(d=>d.id!==l.id)),Ir(),J("calendar.event",n?"Calendar event updated":"Calendar event created",`${Y()} ${n?"updated":"created"} ${l.title}.`,m("calendar",{},t),"calendar_event",l.id,t),s.selectedCalendarEventId=`manual:${l.id}`,s.modal="calendar-event-detail",p()}async function Cd(e){const t=Lt(e);if(!t||!Ut(t)){$("This event cannot be deleted from Calendar.","local","Calendar");return}const a=M();if(s.session?.auth==="supabase"&&a){const n=await a.from("calendar_events").delete().eq("id",t.id);if(n.error){$(n.error.message||"Calendar event delete failed.","local","Calendar");return}}s.calendarEvents=s.calendarEvents.filter(n=>n.id!==t.id),Ir(),J("calendar.event","Calendar event deleted",`${Y()} deleted ${t.title}.`,m("calendar",{},t.company_id),"calendar_event",t.id,t.company_id),s.selectedCalendarEventId="",s.modal="",p()}async function tr(e,t,a){const n=new Date().toISOString(),i=je({id:crypto.randomUUID(),conversation_id:e.id,company_id:e.company_id,sender_profile_id:b().profile.id,body:t,message_type:a.length?"attachment":"text",created_at:n,updated_at:n}),o=M();let l=i;if(s.session?.auth==="supabase"&&o){const f=await o.from("messages").insert(Wu(i)).select().single();if(f.error)return $(f.error.message||"Message send failed.","local","Messages"),null;l=je(f.data)}s.messages=s.messages.concat(l);const c=await jd(l,a),d={...e,last_message_at:l.created_at,updated_at:l.created_at};return s.messageConversations=s.messageConversations.map(f=>f.id===e.id?d:f),s.session?.auth==="supabase"&&o&&await o.from("message_conversations").update({last_message_at:l.created_at,updated_at:l.created_at}).eq("id",e.id),Ka(e.id,!1),Er(d,l,c),Be(),l}async function jd(e,t){const a=M(),n=[];for(const i of t){const o=crypto.randomUUID(),l=`${e.company_id}/${e.conversation_id}/${o}-${Gt(i.name||"attachment")}`;let c="",d="";if(s.session?.auth==="supabase"&&a){const g=await a.storage.from("quest-message-attachments").upload(l,i,{cacheControl:"3600",upsert:!1,contentType:i.type||"application/octet-stream"});if(g.error){$(g.error.message||"Attachment upload failed.","local","Messages");continue}d=l}else i.type?.startsWith("image/")&&i.size<=22e4&&(c=await xr(i));const f=Re({id:o,conversation_id:e.conversation_id,message_id:e.id,company_id:e.company_id,bucket_id:"quest-message-attachments",object_path:d,file_name:i.name||"attachment",mime_type:i.type||"application/octet-stream",size_bytes:i.size||0,preview_url:c,created_at:new Date().toISOString()});if(s.session?.auth==="supabase"&&a){const g=await a.from("message_attachments").insert(zu(f)).select().single();if(g.error){$(g.error.message||"Attachment record failed.","local","Messages"),d&&await a.storage.from("quest-message-attachments").remove([d]);continue}n.push(Re(g.data))}else n.push(f)}return s.messageAttachments=s.messageAttachments.concat(n),n}async function Rn(e,t,a=!1){const n=M();if(s.session?.auth==="supabase"&&n){const i=a?await n.from("message_conversations").update(Ys(e)).eq("id",e.id).select().single():await n.from("message_conversations").insert(Ys(e)).select().single();if(i.error)return $(i.error.message||"Conversation save failed.","local","Messages"),!1;if(await n.from("message_conversation_access").delete().eq("conversation_id",e.id),t.length){const o=await n.from("message_conversation_access").insert(t.map(Hu));if(o.error)return $(o.error.message||"Conversation access save failed.","local","Messages"),!1}e=Se(i.data),s.sync={label:"Quest Supabase live",mode:"live"}}return s.messageConversations=[e].concat(s.messageConversations.filter(i=>i.id!==e.id)),s.messageAccess=t.concat(s.messageAccess.filter(i=>i.conversation_id!==e.id)),Ka(e.id,!1),Be(),!0}async function Ad(e){const t=s.messages.find(o=>o.id===e);if(!t)return;if(!(t.sender_profile_id===b().profile.id&&h("messages.delete_own",t.company_id)||h("messages.delete_any",t.company_id))){$("Your role cannot delete this message.","local","Messages");return}const n=new Date().toISOString(),i=M();if(s.session?.auth==="supabase"&&i){const o=await i.from("messages").update({deleted_at:n,updated_at:n}).eq("id",t.id);if(o.error){$(o.error.message||"Message delete failed.","local","Messages");return}}s.messages=s.messages.map(o=>o.id===t.id?{...o,deleted_at:n,updated_at:n}:o),Be(),p()}async function qd(e){const t=s.messageAttachments.find(n=>n.id===e);if(!t)return;if(t.preview_url){window.open(t.preview_url,"_blank","noopener,noreferrer");return}const a=M();if(s.session?.auth==="supabase"&&a&&t.object_path){const n=await a.storage.from(t.bucket_id||"quest-message-attachments").createSignedUrl(t.object_path,900,{download:t.file_name});if(!n.error&&n.data?.signedUrl){window.open(n.data.signedUrl,"_blank","noopener,noreferrer");return}}$("This demo attachment is metadata-only.","local","Messages")}function Md(e){if(e.target.matches("[data-global-search]")){s.query=e.target.value,He();return}if(e.target.matches("[data-file-search]")){s.fileQuery=e.target.value,He();return}if(e.target.matches("[data-form-search]")){s.formQuery=e.target.value,He();return}if(e.target.matches("[data-crm-search]")){s.crmQuery=e.target.value,He();return}if(e.target.matches("[data-message-search]")){s.messageQuery=e.target.value,He();return}if(e.target.matches("[data-calendar-search]")){s.calendarQuery=e.target.value,He();return}if(e.target.matches("[data-message-access-filter]")){fm(e.target);return}if(e.target.matches("[data-form-field]")){Hr(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Wr(e.target)}function Fd(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||V();nu(t);return}if(e.target.matches("[data-stage-filter]")){s.stageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-stage-filter]")){s.crmStageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-owner-filter]")){s.crmOwnerFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-status-filter]")){s.taskStatusFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-priority-filter]")){s.taskPriorityFilter=e.target.value||"all",p();return}if(e.target.matches("[data-calendar-type-filter]")){s.calendarTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;A(m("tasks",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-analytics-job-filter]")){const t=e.target.value;A(m("analytics",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-file-category-filter]")){s.fileCategoryFilter=e.target.value||"All categories",p();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=s.route?.jobId||"";A(m("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},u()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;A(m("files",{...t?{folder:"jobs",job_id:t}:{}},u()));return}if(e.target.matches("[data-form-type-filter]")){s.formTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-form-field]")){Hr(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Wr(e.target)}async function Id(e){const t=st(Object.fromEntries(new FormData(e).entries()));if(t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||u(),!y("jobs.manage",t.company_id,"Your role can view jobs but cannot create or edit them.","Jobs"))return;t.estimate_total=Number(t.estimate_total||0),t.invoice_total=Number(t.invoice_total||0),t.updated_at=new Date().toISOString();const a=s.jobs.some(i=>i.id===t.id),n=M();if(n){const i=a?await n.from("jobs").update(t).eq("id",t.id).select().single():await n.from("jobs").insert(t).select().single();if(!i.error&&i.data){sn(st(i.data)),s.sync={label:"Quest Supabase live",mode:"live"},s.modal="",A(m("jobs",{tab:"profile",job_id:i.data.id},t.company_id),{replace:!0});return}s.sync={label:"Saved locally",mode:"local"}}sn(t),s.modal="",A(m("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function Ed(e){if(!e)return;const t=u();if(!y("jobs.manage",t,"Your role cannot delete jobs.","Jobs"))return;const a=M();a&&await a.from("jobs").delete().eq("id",e),s.jobs=s.jobs.filter(n=>n.id!==e),s.selectedJobId=Q(t)[0]?.id||"",s.modal="",te(),A(m("jobs",{tab:"list"},t),{replace:!0})}async function Td(e){const t=u();if(!y("tasks.manage",t,"Your role can view tasks but cannot create or edit them.","Tasks"))return;const a=Object.fromEntries(new FormData(e).entries()),n=it({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:b().profile.member_id||ut(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),i=Oa(n.id),o=!!i,l=M();if(l){const c=sm(n),d=o?await l.from("tasks").update(c).eq("id",n.id).select().single():await l.from("tasks").insert(c).select().single();if(!d.error&&d.data){const f=it(d.data);Ns(f),Ks(f,i),s.sync={label:"Quest Supabase live",mode:"live"},s.modal="",A(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0});return}s.sync={label:"Task saved locally",mode:"local"}}Ns(n),Ks(n,i),s.modal="",A(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0})}async function xd(e){if(!e)return;const t=u();if(!y("tasks.manage",t,"Your role cannot delete tasks.","Tasks"))return;const a=M();a&&await a.from("tasks").delete().eq("id",e),s.tasks=s.tasks.filter(n=>n.id!==e),s.selectedTaskId="",s.modal="",te(),A(m("tasks",{},t),{replace:!0})}async function Od(e){const t=u();if(!y("files.manage",t,"Your role can view files but cannot upload.","Files"))return;const a=new FormData(e),n=Object.fromEntries(a.entries()),i=Array.from(e.elements.files?.files||[]),o=String(n.file_name||"").trim(),l=i.length?i:o?[null]:[];if(!l.length){s.sync={label:"Choose a file or enter a file name",mode:"local"},p();return}const c=M();let d=0;for(const f of l){const g=crypto.randomUUID(),S=f?.name||o,U=String(n.folder||"shared"),O=`${t}/${n.job_id?`jobs/${n.job_id}`:U}/${g}-${Gt(S)}`;let se=!1;c&&f&&(se=!(await c.storage.from("quest-job-files").upload(O,f,{cacheControl:"3600",upsert:!1,contentType:f.type||"application/octet-stream"})).error);const Ee=jt({id:g,company_id:t,job_id:n.job_id||"",folder:U,file_name:S,mime_type:f?.type||"application/octet-stream",size_bytes:f?.size||Number(n.size_bytes||0),category:n.category||_e(U),notes:n.notes||"",uploaded_by_label:n.uploaded_by_label||b().profile.full_name,bucket_id:"quest-job-files",object_path:se||!f?O:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(c){const L=await c.from("job_files").insert(im(Ee)).select().single();if(!L.error&&L.data){Us(jt(L.data)),d+=1;continue}se&&await c.storage.from("quest-job-files").remove([O])}Us(Ee)}s.sync=d===l.length?{label:"Quest Supabase live",mode:"live"}:{label:d?"Some files saved locally":"File record saved locally",mode:d?"loading":"local"},J("file.added",l.length>1?"Files added":"File added",`${Y()} added ${l.length} file${l.length===1?"":"s"} to ${_e(n.folder||"shared")}.`,m("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),"file",n.job_id||"",t),s.modal="",A(m("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),{replace:!0})}function Rd(e){const t=Object.fromEntries(new FormData(e).entries()),a=w(t.company_id||u());if(!y("files.manage",a,"Your role can view files but cannot create folders.","Files"))return;const n=String(t.name||"").trim();if(!n){s.sync={label:"Folder name is required",mode:"local"},p();return}const i=as({id:`folder-${crypto.randomUUID()}`,company_id:a,name:n,parent_key:t.parent_key||"home",created_by_label:b().profile.full_name||"Quest HQ",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});s.driveFolders.unshift(i),s.modal="",s.sync={label:"Folder created locally",mode:"local"},J("file.folder","Folder created",`${Y()} created ${i.name}.`,m("files",{folder:i.id},i.company_id),"folder",i.id,i.company_id),te(),p()}async function Pd(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=N(t.job_id),i=String(t.id||"").trim()?Le(String(t.id).trim()):null,o=Ht({...t,id:String(t.id||"").trim()||`invoice-${crypto.randomUUID()}`,company_id:a,client_name:String(t.client_name||n?.client_name||"").trim(),total:R(t.subtotal)+R(t.tax),updated_at:new Date().toISOString()});await kt("finance_invoices",ar(o),"Invoice save failed")&&(Wd(o),i?.job_id&&i.job_id!==o.job_id&&rn(i.job_id),rn(o.job_id),s.modal="",s.sync={label:s.session?.auth==="supabase"?"Invoice saved securely":"Finance saved locally",mode:s.session?.auth==="supabase"?"live":"local"},J("finance.invoice",i?"Invoice updated":"Invoice created",`${Y()} ${i?"updated":"created"} ${o.invoice_number}.`,m("finance",{invoice:o.id},a),"invoice",o.id,a),A(m("finance",{invoice:o.id},a),{replace:!0}))}async function Nd(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=Le(t.invoice_id);if(!n||n.company_id!==a){s.sync={label:"Create an invoice before recording a payment",mode:"local"},p();return}const i=Wt({...t,id:`payment-${crypto.randomUUID()}`,company_id:a,created_at:new Date().toISOString()});!await kt("finance_payments",Qd(i),"Payment save failed")||(n.status=be(n.id)-i.amount<=0?"Paid":"Partially paid",n.updated_at=new Date().toISOString(),!await kt("finance_invoices",ar(n),"Invoice status update failed"))||(s.financePayments.unshift(i),rn(n.job_id),te(),s.modal="",s.sync={label:s.session?.auth==="supabase"?"Payment recorded securely":"Payment recorded locally",mode:s.session?.auth==="supabase"?"live":"local"},J("finance.payment","Payment recorded",`${Y()} recorded ${j(i.amount)} for ${n.invoice_number}.`,m("finance",{invoice:i.invoice_id},a),"payment",i.id,a),A(m("finance",i.invoice_id?{invoice:i.invoice_id}:{},a),{replace:!0}))}async function Ud(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=zt({...t,id:String(t.id||"").trim()||`expense-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});await kt("finance_expenses",Vd(n),"Expense save failed")&&(zd(n),s.modal="",s.sync={label:s.session?.auth==="supabase"?"Expense saved securely":"Expense saved locally",mode:s.session?.auth==="supabase"?"live":"local"},J("finance.expense","Expense saved",`${Y()} saved a ${j(n.amount)} ${n.category} expense.`,m("finance",{expense:n.id},a),"expense",n.id,a),A(m("finance",{expense:n.id},a),{replace:!0}))}async function Ld(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=Jt({...t,id:String(t.id||"").trim()||`vendor-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});await kt("finance_vendors",Bd(n),"Vendor save failed")&&(Jd(n),s.modal="",s.sync={label:s.session?.auth==="supabase"?"Vendor saved securely":"Vendor saved locally",mode:s.session?.auth==="supabase"?"live":"local"},J("finance.vendor","Vendor saved",`${Y()} saved vendor ${n.name}.`,m("finance",{vendor:n.id},a),"vendor",n.id,a),A(m("finance",{vendor:n.id},a),{replace:!0}))}async function kt(e,t,a){if(s.session?.auth!=="supabase")return!0;const n=M();if(!n)return s.sync={label:"Supabase is unavailable",mode:"local"},p(),!1;if(!h("finance.manage",t.company_id))return s.sync={label:"Your role cannot manage finance records",mode:"local"},p(),!1;const i=await n.from(e).upsert(t,{onConflict:"id"}).select().single();return i.error?(s.sync={label:i.error.message||a,mode:"local"},$(i.error.message||a,"local","Finance"),p(),!1):!0}function ar(e){return{id:e.id,company_id:e.company_id,job_id:e.job_id||null,client_name:e.client_name,invoice_number:e.invoice_number,status:e.status,issue_date:e.issue_date||null,due_date:e.due_date||null,subtotal:R(e.subtotal),tax:R(e.tax),total:R(e.total),notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function Qd(e){return{id:e.id,company_id:e.company_id,invoice_id:e.invoice_id,amount:R(e.amount),method:e.method,received_at:e.received_at||null,reference:e.reference||"",notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function Vd(e){return{id:e.id,company_id:e.company_id,job_id:e.job_id||null,vendor_id:e.vendor_id||null,category:e.category,amount:R(e.amount),status:e.status,spent_at:e.spent_at||null,notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function Bd(e){return{id:e.id,company_id:e.company_id,name:e.name,contact_name:e.contact_name||"",email:e.email||"",phone:e.phone||"",category:e.category,status:e.status,notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}async function Yd(e){const t=s.files.find(i=>i.id===e);if(t&&!y("files.view",t.company_id,"Your role cannot view this file.","Files"))return;if(!t?.object_path){s.sync={label:"No stored object for this file",mode:"local"},p();return}const a=M();if(!a)return;const n=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(n.error||!n.data?.signedUrl){s.sync={label:"Download failed",mode:"local"},p();return}window.open(n.data.signedUrl,"_blank","noopener,noreferrer")}async function Hd(e){const t=s.files.find(n=>n.id===e);if(!t||!y("files.manage",t.company_id,"Your role cannot delete files.","Files"))return;const a=M();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),s.files=s.files.filter(n=>n.id!==e),s.selectedFileId="",s.modal="",te(),p()}function sn(e){const t=s.jobs.findIndex(a=>a.id===e.id);t>=0?s.jobs[t]=e:s.jobs.unshift(e),s.selectedJobId=e.id,te()}function Ns(e){const t=s.tasks.findIndex(a=>a.id===e.id);t>=0?s.tasks[t]=e:s.tasks.unshift(e),s.selectedTaskId=e.id,te()}function Us(e){const t=s.files.findIndex(a=>a.id===e.id);t>=0?s.files[t]=e:s.files.unshift(e),te()}function Wd(e){const t=s.financeInvoices.findIndex(a=>a.id===e.id);t>=0?s.financeInvoices[t]=e:s.financeInvoices.unshift(e),te()}function zd(e){const t=s.financeExpenses.findIndex(a=>a.id===e.id);t>=0?s.financeExpenses[t]=e:s.financeExpenses.unshift(e),te()}function Jd(e){const t=s.financeVendors.findIndex(a=>a.id===e.id);t>=0?s.financeVendors[t]=e:s.financeVendors.unshift(e),te()}function ca(e){const t=s.memberships.findIndex(a=>a.company_id===e.company_id&&a.profile_id===e.profile_id);t>=0?s.memberships[t]=e:s.memberships.unshift(e),te()}function Ls(e){s.roleAssignments=s.roleAssignments.filter(t=>t.company_id!==e.company_id||t.profile_id!==e.profile_id),e.role_id&&s.roleAssignments.unshift(e)}function rn(e){if(!e)return;const t=N(e);t&&(t.invoice_total=ge(we(t.company_id).filter(a=>a.job_id===e),"total"),t.updated_at=new Date().toISOString(),sn(t))}function He(){const e=document.getElementById("workspace");e&&(sr(s.route),e.innerHTML=Ni(s.route))}function Nt(){const e=Pn(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/")return{name:"home",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:u(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const n=a[2]||"home";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:n,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:u(),jobId:t.get("job_id")||""}}function Kd(){const e=Pn(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||ia(t.get("job_id")||t.get("project_id"))||localStorage.getItem(Ae)||V(),n=Object.fromEntries(Object.entries(so).map(([l,c])=>[l,m(c,{},a)]));Object.assign(n,{"/index.html":"/","/command.html":m("home",{},a),"/login.html":"/login"});let i=n[e];if(e==="/jobs"){const l=t.get("tab");l==="tasks"?i=m("tasks",ce(t,["job_id","task_id","new","edit"]),a):l==="files"?i=m("files",ce(t,["job_id","folder"]),a):l==="forms"?i=m("forms",ce(t,["job_id"]),a):l==="analytics"?i=m("analytics",ce(t,["job_id"]),a):i=m("jobs",ce(t,["job_id","tab"]),a)}if(e==="/files"&&(i=m("files",ce(t,["job_id","folder"]),a)),e==="/forms"&&(i=m("forms",ce(t,["job_id"]),a)),e==="/analytics"&&(i=m("analytics",ce(t,["job_id"]),a)),e==="/crm"&&(i=m("crm",ce(t,["account"]),a)),e==="/finance"&&(i=m("finance",ce(t,["invoice","expense","vendor","report"]),a)),e==="/messages"&&(i=m("messages",ce(t,["conversation"]),a)),e==="/calendar"&&(i=m("calendar",{},a)),e==="/admin"&&(i=m("settings",{},a)),e==="/time"&&(i=m("time",{},a)),e==="/team"&&(i=m("team-chart",{},a)),e==="/team-chart"&&(i=m("team-chart",{},a)),e==="/approvals"&&(i=m("approvals",{},a)),e==="/clock"&&(i=m("clock",{},a)),e==="/task-management.html"){const l=t.get("project_id")||t.get("job_id")||"";i=m("tasks",l?{job_id:l}:{},ia(l)||a)}const o=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(o){const l=decodeURIComponent(o[1]);i=m("tasks",{job_id:l},ia(l)||a)}i&&window.history.replaceState({},"",_(i))}function Gd(e){if(e.name!=="company")return"";if(e.section==="home"&&/^\/company\/[^/]+\/?$/.test(e.path))return m("home",{},e.companyId);const t=Qe();if(s.session?.auth==="supabase"&&!t.length)return null;if(!t.includes(e.companyId))return s.session?.auth==="supabase"?"":m(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||V());if(!dt.map(i=>i.id).includes(e.section))return m("home",{},e.companyId);const n=e.jobId?ia(e.jobId):"";return n&&n!==e.companyId&&t.includes(n)?m(e.section,Object.fromEntries(e.params.entries()),n):""}function Pn(){let e=window.location.pathname||"/";return Je&&e.startsWith(Je)&&(e=e.slice(Je.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function _(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),n=t.startsWith("/")?t:"/"+t;return`${Je}${n}${a?`?${a}`:""}`||"/"}function A(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(Je+"/")||Je===""&&e.startsWith("/")?e:_(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),p()}function Zd(){return`${Pn()}${window.location.search}`}function xa(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?_(m("jobs",{},V())):`${t.pathname}${t.search}`}catch{return _(m("jobs",{},V()))}}function m(e="jobs",t={},a=u()){const n=new URLSearchParams(t);for(const[i,o]of[...n.entries()])(o==null||o==="")&&n.delete(i);return`/company/${encodeURIComponent(w(a||V()))}/${e}${n.toString()?`?${n.toString()}`:""}`}function Xd(e){return e.name==="home"?"Quest HQ":e.name==="company"?T(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":T(e.name||"Workspace")}function nr(e,t){const[a]=t.split("?"),n=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!n||e.name!=="company"?!1:e.companyId===decodeURIComponent(n[1])&&e.section===n[2]}function eu(e){return gi.includes(e)?e:"pipeline"}function tu(e){return{pipeline:"Pipeline",list:"List",profile:"Profile"}[e]||e}function au(e){const t=e.companyId||s.activeCompanyId||V(),a=Qe();s.activeCompanyId=a.includes(t)?t:a[0]||V(),localStorage.setItem(Ae,s.activeCompanyId)}function sr(e){const t=u();e.jobId&&Q(t).some(n=>n.id===e.jobId)&&(s.selectedJobId=e.jobId),(!s.selectedJobId||!Q(t).some(n=>n.id===s.selectedJobId))&&(s.selectedJobId=Q(t)[0]?.id||"");const a=e.params.get("task_id");a&&K(t).some(n=>n.id===a)&&(s.selectedTaskId=a),e.section!=="tasks"&&(s.selectedTaskId=""),s.driveFolder=e.params.get("folder")||"home"}function nu(e){const t=Qe(),a=w(e),n=t.includes(a)?a:t[0]||V();s.activeCompanyId=n,localStorage.setItem(Ae,n),su();const i=s.route||Nt(),o=i.name==="company"?i.section:"jobs";A(m(o,{},n))}function su(){s.modal="",s.selectedJobId="",s.selectedTaskId="",s.selectedFileId="",s.selectedFormId="",s.selectedQuestionId="",s.selectedFinanceInvoiceId="",s.selectedFinanceExpenseId="",s.selectedFinanceVendorId="",s.selectedCalendarEventId="",s.query="",s.fileQuery="",s.formQuery="",s.crmQuery="",s.contactQuery="",s.selectedContactId="",s.contactStageFilter="all",s.stageFilter="all",s.crmStageFilter="all",s.crmOwnerFilter="all",s.taskStatusFilter="all",s.taskPriorityFilter="all",s.calendarQuery="",s.calendarTypeFilter="all",s.calendarScope="company",s.fileCategoryFilter="All categories",s.formTypeFilter="all",s.formsTab="library",s.driveFolder="home"}function iu(e){const t=N(e);t&&(s.selectedJobId=e,A(m("jobs",{tab:"profile",job_id:e},t.company_id)))}function ru(e){const t=Oa(e);t&&(s.selectedTaskId=e,A(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function Oe(){return N(s.selectedJobId)||Q(u())[0]||null}function N(e){return s.jobs.find(t=>t.id===e)||null}function Oa(e){return s.tasks.find(t=>t.id===e)||null}function Q(e=u()){return s.jobs.filter(t=>t.company_id===e)}function K(e=u()){return s.tasks.filter(t=>t.company_id===e)}function ir(e=u()){const t=b().profile.id;return s.notifications.filter(a=>a.company_id===e&&a.recipient_profile_id===t).sort((a,n)=>Date.parse(n.created_at||0)-Date.parse(a.created_at||0))}function Ne(e=u()){const t=s.messageQuery.trim().toLowerCase(),a=s.messageFilter||"all";return s.messageConversations.filter(n=>n.company_id===e&&lu(n)).filter(n=>a==="all"||n.type===a||a==="unread"&&tt(n.id)>0).filter(n=>{if(!t)return!0;const i=qe(n.id).some(o=>o.body.toLowerCase().includes(t));return n.title.toLowerCase().includes(t)||i}).sort((n,i)=>Date.parse(i.last_message_at||i.updated_at||i.created_at||0)-Date.parse(n.last_message_at||n.updated_at||n.created_at||0))}function Nn(e=u()){return Ne(e).reduce((t,a)=>t+tt(a.id),0)}function rr(e=u()){const t=Ne(e),n=s.route?.params?.get("conversation")||""||s.selectedConversationId;return t.find(i=>i.id===n)||t[0]||null}function qe(e){return s.messages.filter(t=>t.conversation_id===e&&!t.deleted_at).sort((t,a)=>Date.parse(t.created_at||0)-Date.parse(a.created_at||0))}function Ra(e){return s.messageAttachments.filter(t=>t.conversation_id===e)}function or(e){return s.messageAttachments.filter(t=>t.message_id===e)}function Pa(e){return s.messageAccess.filter(t=>t.conversation_id===e)}function ou(e,t=b().profile.id){return s.messageReads.find(a=>a.conversation_id===e&&a.profile_id===t)||null}function tt(e,t=b().profile.id){const a=Date.parse(ou(e,t)?.last_read_at||0);return qe(e).filter(n=>n.sender_profile_id!==t&&Date.parse(n.created_at||0)>a).length}function lu(e){if(!e||!h("messages.view",e.company_id))return!1;const t=b().profile,a=Pa(e.id);if(e.type==="company"||a.some(o=>o.target_type==="all_company"))return!0;const n=new Set([t.id,t.member_id,t.email].filter(Boolean).map(String));if(a.some(o=>o.target_type==="profile"&&n.has(o.target_id)))return!0;const i=[Ct(e.company_id,at(e.company_id)),...s.roleAssignments.filter(o=>o.company_id===e.company_id&&o.profile_id===t.id).map(o=>o.role_id)];return a.some(o=>o.target_type==="role"&&i.includes(o.target_id))}function Na(e=u()){const t=s.calendarEvents.filter(c=>c.company_id===e&&gu(c)).map(du),a=K(e).filter(c=>c.due&&c.status!=="done").filter(c=>h("calendar.view_team",e)||cr(c.assignee_id)||c.creator_id===b().profile.member_id).map(uu),n=h("finance.view",e)?we(e).filter(c=>c.due_date&&be(c.id)>0).map(mu):[],i=Yn(e).filter(c=>c.type!=="Access request"||h("users.manage",e)).map(c=>pu(c,e)),o=Vt(e),l=o&&(h("calendar.view_team",e)||Ua(o.user_id))?[fu(o)]:[];return t.concat(a,n,i,l).sort((c,d)=>Date.parse(c.startsAt||0)-Date.parse(d.startsAt||0))}function cu(e=u()){const t=s.calendarQuery.trim().toLowerCase();return Na(e).filter(a=>s.calendarScope==="company"||a.mine).filter(a=>s.calendarTypeFilter==="all"||a.type===s.calendarTypeFilter).filter(a=>t?[a.title,a.description,a.type,a.owner,a.linkLabel].some(n=>String(n||"").toLowerCase().includes(t)):!0).filter(a=>s.calendarView==="list"||hu(a))}function lr(e=u()){const t=Date.now();return Na(e).filter(a=>Date.parse(a.endsAt||a.startsAt||0)>=t).slice(0,9)}function du(e){const t=e.linked_type==="job"?N(e.linked_id):null;return{id:`manual:${e.id}`,source:"manual",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description,type:e.event_type,startsAt:e.starts_at,endsAt:e.ends_at||e.starts_at,allDay:e.all_day,dateKey:dr(e.starts_at),owner:vu(e.assigned_profile_id||e.created_by),mine:Ua(e.assigned_profile_id)||e.created_by===b().profile.id,href:bu(e),linkLabel:t?.name||"",editable:Ut(e)}}function uu(e){const t=e.due_time?`${e.due}T${e.due_time}:00`:`${e.due}T12:00:00`;return{id:`task:${e.id}`,source:"task",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description||Ye(e.type),type:"Task due",startsAt:t,endsAt:t,allDay:!e.due_time,dateKey:e.due,owner:H(e.assignee_id),mine:cr(e.assignee_id),href:m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),linkLabel:N(e.project_id)?.name||"Company task",editable:!1}}function mu(e){return{id:`invoice:${e.id}`,source:"invoice",sourceId:e.id,companyId:e.company_id,title:`${e.invoice_number} due`,description:`${j(be(e.id))} outstanding for ${e.client_name||"client"}.`,type:"Invoice due",startsAt:`${e.due_date}T12:00:00`,endsAt:`${e.due_date}T12:00:00`,allDay:!0,dateKey:e.due_date,owner:e.client_name||"Finance",mine:h("finance.view",e.company_id),href:m("finance",{invoice:e.id},e.company_id),linkLabel:e.client_name||"Finance",editable:!1}}function pu(e,t=u()){const a=String(e.updatedAt||D(0)).slice(0,10);return{id:`approval:${e.id}`,source:"approval",sourceId:e.id,companyId:t,title:e.title,description:e.meta,type:"Approval",startsAt:`${a}T12:00:00`,endsAt:`${a}T12:00:00`,allDay:!0,dateKey:a,owner:e.owner,mine:!0,href:e.href,linkLabel:e.status,editable:!1}}function fu(e){const t=dr(e.started_at);return{id:`timer:${e.id}`,source:"timer",sourceId:e.id,companyId:e.company_id,title:e.task_title||"Active timer",description:"Current clock session.",type:"Time",startsAt:e.started_at,endsAt:new Date().toISOString(),allDay:!1,dateKey:t,owner:H(e.user_id),mine:Ua(e.user_id),href:m("time",{},e.company_id),linkLabel:"My time",editable:!1}}function gu(e){return!e||!h("calendar.view",e.company_id)?!1:e.visibility!=="private"?!0:h("calendar.view_team",e.company_id)||Ut(e)||Ua(e.assigned_profile_id)}function Ut(e){return e?h("calendar.manage",e.company_id)||e.created_by===b().profile.id:!1}function bu(e){return e.linked_type==="job"&&e.linked_id&&h("jobs.view",e.company_id)?m("jobs",{tab:"profile",job_id:e.linked_id},e.company_id):e.linked_type==="task"&&e.linked_id&&h("tasks.view",e.company_id)?m("tasks",{task_id:e.linked_id},e.company_id):e.linked_type==="form"&&e.linked_id&&h("forms.view",e.company_id)?m("forms",{form_id:e.linked_id},e.company_id):e.linked_type==="invoice"&&e.linked_id&&h("finance.view",e.company_id)?m("finance",{invoice:e.linked_id},e.company_id):""}function _u(e,t=u()){return Na(t).find(a=>a.id===e)||null}function Lt(e){return s.calendarEvents.find(t=>t.id===e)||null}function cr(e){return String(e||"")===String(b().profile.member_id||b().profile.id||"")}function Ua(e){const t=b().profile;return[t.id,t.member_id,t.email].filter(Boolean).map(String).includes(String(e||""))}function vu(e){return e?Ue(e)?.full_name||H(e)||String(e):"Unassigned"}function dr(e){if(!e)return D(0);const t=new Date(e);return Number.isNaN(t.getTime())?String(e).slice(0,10):t.toISOString().slice(0,10)}function ur(e,t){return e.filter(a=>a.dateKey===t).sort((a,n)=>Date.parse(a.startsAt||0)-Date.parse(n.startsAt||0))}function yu(e){const t=Un(new Date),a=new Date(t);return a.setDate(t.getDate()+7),e.filter(n=>{const i=Date.parse(n.startsAt||n.dateKey||0);return i>=t.getTime()&&i<a.getTime()})}function hu(e){const t=new Date(`${e.dateKey}T00:00:00`);if(s.calendarView==="month"){const i=new Date(`${s.calendarCursorDate}T00:00:00`);return t.getFullYear()===i.getFullYear()&&t.getMonth()===i.getMonth()}const a=Un(new Date(`${s.calendarCursorDate}T00:00:00`)),n=new Date(a);return n.setDate(a.getDate()+7),t>=a&&t<n}function $u(e){const t=new Date(`${e}T00:00:00`),a=new Date(t.getFullYear(),t.getMonth(),1),n=new Date(a);return n.setDate(a.getDate()-a.getDay()),Array.from({length:42},(i,o)=>{const l=new Date(n);return l.setDate(n.getDate()+o),{key:Ln(l),label:String(l.getDate()),month:l.getMonth()}})}function mr(e){const t=Un(new Date(`${e}T00:00:00`));return Array.from({length:7},(a,n)=>{const i=new Date(t);return i.setDate(t.getDate()+n),{key:Ln(i),name:new Intl.DateTimeFormat("en-US",{weekday:"short"}).format(i),shortDate:new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(i)}})}function wu(){const e=new Date(`${s.calendarCursorDate}T00:00:00`);if(s.calendarView==="month")return new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(e);if(s.calendarView==="week"){const t=mr(s.calendarCursorDate);return`${x(t[0].key)} - ${x(t[6].key)}`}return"Upcoming"}function Un(e){const t=new Date(e);return t.setHours(0,0,0,0),t.setDate(t.getDate()-t.getDay()),t}function Ln(e){const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${n}`}function Qs(e){const t=new Date(`${s.calendarCursorDate}T00:00:00`);s.calendarView==="month"?t.setMonth(t.getMonth()+e):t.setDate(t.getDate()+e*7),s.calendarCursorDate=Ln(t)}function Su(e){return e.reduce((t,a)=>(t[a.dateKey]=t[a.dateKey]||[],t[a.dateKey].push(a),t),{})}function pr(e){if(e.allDay)return"All day";const t=new Date(e.startsAt);return Number.isNaN(t.getTime())?"Timed":new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(t)}function ku(e){return`calendar-type-${Gt(e||"event")}`}function Du(e){return e==="Task due"?"ti-list-check":e==="Invoice due"?"ti-file-dollar":e==="Approval"?"ti-user-check":e==="Time"?"ti-clock":e.includes("Install")?"ti-hammer":e.includes("Estimate")?"ti-calendar-dollar":e.includes("Personal")?"ti-user":"ti-calendar-event"}function $e(e=u()){return s.files.filter(t=>t.company_id===e)}function Dt(e=u()){return s.driveFolders.filter(t=>t.company_id===e)}function ut(e=u()){return s.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function ne(e=u()){const t=new Map;ut(e).forEach(n=>{t.set(n.id,{profile_id:"",member_id:n.id,name:n.full_name||n.name,email:n.email,avatar_url:n.avatar_url,role:da(e,n.id).toLowerCase(),role_label:da(e,n.id),role_id:"",status:n.active?"active":"disabled"})}),s.memberships.filter(n=>n.company_id===e).forEach(n=>{const i=Ue(n.profile_id),o=n.member_id?s.teamMembers.find(f=>f.id===n.member_id):null,l=s.roleAssignments.find(f=>f.company_id===e&&f.profile_id===n.profile_id),c=l?mt(e,l.role_id):null,d=n.profile_id||n.member_id;t.set(d,{profile_id:n.profile_id,member_id:n.member_id,name:i?.full_name||o?.full_name||i?.email||o?.name||d||"User",email:i?.email||o?.email||"",avatar_url:i?.avatar_url||o?.avatar_url||"",role:n.role,role_label:c?.name||T(n.role),role_id:l?.role_id||Ct(e,n.role),status:n.status||"active"})});const a=b().profile;if(s.session?.auth==="supabase"&&a?.id&&!t.has(a.id)){const n=oe(e,a.id);n&&t.set(a.id,{profile_id:a.id,member_id:a.member_id||"",name:a.full_name||a.email,email:a.email,avatar_url:a.avatar_url,role:n.role,role_label:T(n.role),role_id:Ct(e,n.role),status:n.status||"active"})}return[...t.values()].sort((n,i)=>(n.status==="active"?0:1)-(i.status==="active"?0:1)||n.name.localeCompare(i.name))}function Cu(e=u()){return s.companyInvites.filter(t=>t.company_id===e&&t.status==="pending").sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function fr(e=u()){return s.auditEvents.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function ju(e){const t=Ue(e.actor_profile_id),a=t?.full_name||t?.email||Xr(e.actor_profile_id||"system");return`
    <article class="access-audit-row">
      ${X({full_name:a,email:t?.email||""},"avatar small")}
      <span>
        <strong>${r(T(String(e.event_type||"access.event").replace(/[._-]+/g," ")))}</strong>
        <small>${r(a)} / ${x(e.created_at)}</small>
      </span>
    </article>
  `}function pe(e=u()){const t=s.roles.filter(a=>a.company_id===e);return t.length?t.sort((a,n)=>n.priority-a.priority||a.name.localeCompare(n.name)):[Ke({id:`owner-${e}`,company_id:e,name:"Owner",color:"#f0b23b",priority:1e3,is_system:!0}),Ke({id:`admin-${e}`,company_id:e,name:"Admin",color:"#60a5fa",priority:800,is_system:!0}),Ke({id:`staff-${e}`,company_id:e,name:"Staff",color:"#15803d",priority:100,is_system:!0})]}function mt(e,t){return pe(e).find(a=>a.id===t)||null}function La(e=u()){return!s.rolePreview||s.rolePreview.company_id!==e?null:mt(e,s.rolePreview.role_id)}function on(e,t){if(!t)return!0;const a=String(e?.name||"").toLowerCase();if(["owner","admin","developer"].includes(a))return!0;const n=Qn(t),i=s.rolePermissions.filter(c=>c.role_id===e?.id);if(i.some(c=>(n.includes(c.permission_key)||c.permission_key==="*")&&c.effect==="deny"))return!1;if(i.some(c=>(n.includes(c.permission_key)||c.permission_key==="*")&&c.effect==="allow"))return!0;if(i.length)return!1;const o=Vn(e),l=et[o]||et.member;return l.includes("*")||n.some(c=>l.includes(c))}function Qn(e){return z([e,...ao[e]||[]])}function Ct(e,t){const a=String(t||"").toLowerCase();return pe(e).find(n=>n.name.toLowerCase()===a||n.id.toLowerCase()===a)?.id||""}function Au(e=u()){const t=pe(e).filter(a=>a.name.toLowerCase()!=="owner");return t.find(a=>a.name.toLowerCase()==="staff")?.id||t.find(a=>a.name.toLowerCase()==="member")?.id||t[0]?.id||""}function qu(){const e=new Uint8Array(8);return crypto.getRandomValues(e),`QH-${Array.from(e,t=>t.toString(36).padStart(2,"0")).join("").toUpperCase()}`}function Mu(e){const t=new URL(_("/login"),window.location.origin);return t.searchParams.set("invite",e.token),t.toString()}function Vn(e){const t=String(e?.name||"").toLowerCase().replace(/\s+/g,"_");return["owner","member","worker","sales","supervisor","admin","developer","construction_supervisor"].includes(t)?t:"member"}function Ue(e){return s.profiles.find(t=>t.id===e)||(b().profile.id===e?b().profile:null)}function gr(e=u(),t=!1){const a=s.query.trim().toLowerCase();return Q(e).filter(n=>!t&&s.stageFilter!=="all"&&n.stage!==s.stageFilter?!1:a?[n.name,n.client_name,n.contact_name,n.owner_name,n.site_address,n.job_type,E(n.company_id)].some(i=>String(i||"").toLowerCase().includes(a)):!0)}function Qa(e=u()){return s.contacts.filter(t=>t.company_id===e)}function br(e=u(),t=!1){const a=s.contactQuery.trim().toLowerCase();return Qa(e).filter(n=>!t&&s.contactStageFilter!=="all"&&n.stage!==s.contactStageFilter?!1:a?[n.name,n.phone,n.email,n.location,n.owner_name,n.stage].some(i=>String(i||"").toLowerCase().includes(a)):!0)}function Fu(e){return s.contacts.find(t=>t.id===e)||null}function Iu(){return Fu(s.selectedContactId)}function Bn(){k(pn,s.contacts)}function Eu(e){const t=s.contacts.findIndex(a=>a.id===e.id);t>=0?s.contacts[t]=e:s.contacts.push(e),Bn()}function Vs(e,t,a){if(e!=="contacts"&&e!=="jobs")return;e==="contacts"?s.contactStageFilter=t:s.stageFilter=t;const n=s.route,i=n?.name==="company"&&n.section===e;a||!i?A(m(e,{},u())):p()}function Qt(e=u()){const t=new Map;return Q(e).forEach(a=>{const n=String(a.client_name||"").trim()||"Unassigned customer",i=`account-${Gt(n.toLowerCase())}`;t.has(i)||t.set(i,{key:i,name:n,jobs:[]}),t.get(i).jobs.push(a)}),Array.from(t.values()).map(a=>{const n=a.jobs.slice().sort((O,se)=>Date.parse(se.updated_at||se.created_at||0)-Date.parse(O.updated_at||O.created_at||0)),i=n[0]||null,o=n.map(O=>O.id),l=K(e).filter(O=>o.includes(O.project_id)),c=ke(e).filter(O=>o.includes(O.linked_job_id)),d=$e(e).filter(O=>o.includes(O.job_id)),f=z(n.map(O=>O.contact_name)),g=z(n.map(O=>O.owner_name)),S=z(n.map(O=>O.site_address)),U=n.map(O=>O.priority||"Medium").sort((O,se)=>lt(se)-lt(O))[0]||"Medium";return{...a,jobs:n,tasks:l,latestJob:i,contacts:f,owners:g,addresses:S,forms:c,files:d,primaryContact:f[0]||"No contact",owner:g[0]||"Unassigned",stage:i?.stage||"Lead",priority:U,estimateTotal:ge(n,"estimate_total"),fileCount:d.length,formCount:c.length,updatedAt:i?.updated_at||i?.created_at||new Date().toISOString(),subtitle:S[0]||`${n.length} linked job${n.length===1?"":"s"}`}}).sort((a,n)=>Date.parse(n.updatedAt||0)-Date.parse(a.updatedAt||0))}function Tu(e=u()){const t=s.crmQuery.trim().toLowerCase();return Qt(e).filter(a=>s.crmStageFilter!=="all"&&!a.jobs.some(n=>n.stage===s.crmStageFilter)||s.crmOwnerFilter!=="all"&&!a.owners.includes(s.crmOwnerFilter)?!1:t?[a.name,a.primaryContact,a.owner,a.stage,...a.addresses,...a.contacts,...a.jobs.map(n=>n.name)].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function xu(e,t){return Qt(e).find(a=>a.key===t)||null}function Ou(e=u()){return z(Q(e).map(t=>t.owner_name)).sort((t,a)=>t.localeCompare(a))}function _r(e=u()){const t=b().profile.member_id||"",a=K(e).slice().sort(ln),n=a.filter(Hn),i=n.filter(S=>S.due===D(0)),o=n.filter(S=>Xs(S.due)<0),l=n.filter(S=>{const U=Xs(S.due);return U>=0&&U<=7}),c=n.filter(S=>S.assignee_id===t),d=n.filter(S=>["review","pending"].includes(S.status)),f=a.filter(S=>S.status==="done"),g=z(o.concat(i,c,d,l).map(S=>S.id)).map(S=>a.find(U=>U.id===S)).filter(Boolean).sort(ln);return{tasks:a,open:n,dueToday:i,overdue:o,thisWeek:l,assignedToMe:c,review:d,done:f,focus:g}}function Yn(e=u()){const t=ke(e).filter(i=>(i.require_approval||i.type==="Client approval")&&!["Archived","Closed","Approved"].includes(i.status)).map(i=>({id:`form:${i.id}`,title:i.title,meta:N(i.linked_job_id)?.name||i.description||"Company form",type:"Form approval",owner:H(i.creator_id),status:i.status,updatedAt:i.updated_at||i.created_at,href:m("forms",{form_id:i.id},e)})),a=K(e).filter(i=>["review","pending"].includes(i.status)).map(i=>({id:`task:${i.id}`,title:i.title,meta:N(i.project_id)?.name||i.description||"Company task",type:"Task review",owner:H(i.assignee_id),status:Ce(i.status),updatedAt:i.updated_at||i.due,href:m("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},e)})),n=s.memberships.filter(i=>i.company_id===e&&i.status!=="active").map(i=>({id:`access:${i.profile_id||i.member_id}`,title:H(i.member_id||i.profile_id),meta:`${T(i.role)} access request`,type:"Access request",owner:"Quest admin",status:T(i.status),updatedAt:new Date().toISOString(),href:m("settings",{tab:"access"},e)}));return t.concat(a,n).sort((i,o)=>Date.parse(o.updatedAt||0)-Date.parse(i.updatedAt||0))}function Vt(e=u()){const t=s.activeTimer;return!t||t.company_id!==e?null:t}function vr(e=u()){return s.timeEntries.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.started_at||0)-Date.parse(t.started_at||0))}function Bs(e=u(),t=0){return vr(e).filter(a=>Date.parse(a.started_at||0)>=t).reduce((a,n)=>a+R(n.duration_ms),0)}function Ru(e=u(),t=""){if(!y("time.track",e,"Your role cannot track time in this workspace.","Time"))return;s.activeTimer&&yr(!1);const a=t?Oa(t):null;s.activeTimer={id:`timer-${crypto.randomUUID()}`,company_id:e,user_id:b().profile.member_id||b().profile.id,task_id:a?.company_id===e?a.id:"",task_title:a?.company_id===e?a.title:"",started_at:new Date().toISOString()},Fr(),s.sync={label:"Clock started locally",mode:"local"},p()}function yr(e=!0){const t=s.activeTimer;if(!t)return;const a=new Date().toISOString(),n=Math.max(0,Date.parse(a)-Date.parse(t.started_at||a));s.timeEntries.unshift({id:`time-${crypto.randomUUID()}`,company_id:t.company_id,user_id:t.user_id,task_id:t.task_id||"",task_title:t.task_title||"",started_at:t.started_at,ended_at:a,duration_ms:n,notes:t.task_title?"Task timer":"General shift"}),s.activeTimer=null,Fr(),s.sync={label:"Clock stopped locally",mode:"local"},e&&p()}function Hn(e){return e.status!=="done"}function ln(e,t){const a=Date.parse(e.due||0)-Date.parse(t.due||0);return a||lt(t.priority)-lt(e.priority)}function we(e=u()){return s.financeInvoices.filter(t=>t.company_id===e).sort(Et("updated_at"))}function hr(e=u()){return s.financePayments.filter(t=>t.company_id===e)}function Wn(e=u()){return s.financeExpenses.filter(t=>t.company_id===e).sort(Et("updated_at"))}function zn(e=u()){return s.financeVendors.filter(t=>t.company_id===e)}function Le(e){return s.financeInvoices.find(t=>t.id===e)||null}function $r(e){return s.financeExpenses.find(t=>t.id===e)||null}function Jn(e){return s.financeVendors.find(t=>t.id===e)||null}function cn(e){return Jn(e)?.name||"No vendor"}function wr(e){return s.financePayments.filter(t=>t.invoice_id===e).sort(Et("received_at"))}function Kn(e){return ge(wr(e),"amount")}function be(e){const t=Le(e);return Math.max(0,R(t?.total)-Kn(e))}function Sr(e){const t=be(e.id);return t<=0&&R(e.total)>0?"Paid":t<R(e.total)?"Partially paid":e.status==="Sent"&&Gr(e.due_date)>0?"Overdue":e.status}function kr(e=u()){const t=we(e),a=hr(e),n=Wn(e).filter(c=>["Approved","Paid"].includes(c.status)),i={current:0,thirty:0,sixty:0,overSixty:0};t.forEach(c=>{const d=be(c.id);if(!d)return;const f=Gr(c.due_date);f<=0?i.current+=d:f<=30?i.thirty+=d:f<=60?i.sixty+=d:i.overSixty+=d});const o=ge(a,"amount"),l=ge(n,"amount");return{pipeline:ge(Q(e),"estimate_total"),invoiced:ge(t,"total"),collected:o,outstanding:t.reduce((c,d)=>c+be(d.id),0),expenses:l,net:o-l,aging:i}}function Pu(e=u(),t=""){const a=s.query.trim().toLowerCase();return K(e).filter(n=>t&&n.project_id!==t||s.taskStatusFilter!=="all"&&n.status!==s.taskStatusFilter||s.taskPriorityFilter!=="all"&&n.priority!==s.taskPriorityFilter?!1:a?[n.title,n.description,Ye(n.type),H(n.assignee_id),N(n.project_id)?.name].some(i=>String(i||"").toLowerCase().includes(a)):!0)}function Va(){const e=Qe();return s.companies.filter(t=>e.includes(t.id))}function h(e,t=u()){if(!e)return!0;const a=La(t);if(a)return on(a,e);const n=Qn(e),i=b().profile;if(s.session?.auth==="supabase"){const c=oe(t,i.id);if(!c||c.status!=="active")return!1;if(["owner","developer"].includes(String(c.role).toLowerCase()))return!0;const d=s.roleAssignments.filter(g=>g.company_id===t&&g.profile_id===i.id).map(g=>g.role_id),f=s.rolePermissions.filter(g=>d.includes(g.role_id));if(f.some(g=>(n.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="deny"))return!1;if(f.some(g=>(n.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="allow"))return!0}const o=String(oe(t,i.id)?.role||i.role||"member").toLowerCase(),l=et[o]||et.member;return l.includes("*")||n.some(c=>l.includes(c))}function y(e,t=u(),a="Your role cannot perform that action.",n="Access"){return h(e,t)?!0:($(a,"local",n),!1)}function Qe(){const e=b().profile,t=s.companies.map(i=>i.id);if(s.session?.auth==="supabase"){const i=s.memberships.filter(o=>o.profile_id===e.id&&o.status==="active").map(o=>w(o.company_id));return z(i).filter(o=>t.includes(o))}if(["developer","admin"].includes(e.role))return z(t.length?t:Pt.map(i=>w(i.id)));const a=s.memberships.filter(i=>i.profile_id===e.id&&i.status==="active").map(i=>w(i.company_id)),n=a.length?a:e.company_ids||[];return z(n.map(w)).filter(i=>t.includes(i))}function u(){const e=Qe();return e.includes(s.activeCompanyId)?s.activeCompanyId:e[0]||s.activeCompanyId||V()}function V(){return w(Pt[0].id)}function Ba(e){const t=w(e);return s.companies.find(a=>a.id===t)||Pt.map(nt).find(a=>a.id===t)||null}function E(e){const t=Ba(e);return t?pt(t):e||"Company"}function pt(e){return e.short_name||e.label||e.name||e.id}function Me(e){return Ba(e)?.color||"#f0b23b"}function ia(e){return w(s.jobs.find(t=>t.id===e)?.company_id||"")}function at(e){const t=La(e);if(t)return`Preview: ${t.name}`;const a=b().profile;return s.session?.auth!=="supabase"&&["developer","admin"].includes(a.role)?T(a.role):T(oe(e,a.id)?.role||a.role||"member")}function da(e,t){const a=s.memberships.find(n=>n.company_id===e&&(n.member_id===t||n.profile_id===t));return T(a?.role||"member")}function oe(e,t){return s.memberships.find(a=>a.company_id===e&&a.profile_id===t)||null}function Nu(e=u()){return s.memberships.filter(t=>t.company_id===e&&t.role==="owner"&&t.status==="active")}function Dr(e,t){const a=Nu(e);return a.length===1&&a[0].profile_id===t}function Uu(e,t,a,n){const i=oe(e,t),o=Vn(a);if(i?.role==="owner"&&i.status==="active"&&(o!=="owner"||n!=="active")&&Dr(e,t))return"Promote another active Owner before changing the last Owner.";const l=oe(e,b().profile.id),c=String(b().profile.role||"").toLowerCase();return(["owner","developer"].includes(i?.role)||["owner","developer"].includes(o))&&!["owner","developer"].includes(String(l?.role||c).toLowerCase())?"Only an Owner can change Owner or Developer access.":""}function Bt(e=u()){return s.subscriptions.find(t=>t.company_id===e)||null}function Lu(){const e=s.workspaceReviews.map(ht),t=s.subscriptions.filter(i=>["pending_review","active","trialing","suspended","canceled"].includes(i.status)).map(i=>ht({company_id:i.company_id,company_name:E(i.company_id),status:i.status,plan_code:i.plan_code,amount_cents:i.amount_cents,currency:i.currency,trial_ends_at:i.trial_ends_at,current_period_end:i.current_period_end,grace_ends_at:i.grace_ends_at,created_at:i.created_at||""})),a=Ha().map(i=>ht({company_id:i,company_name:E(i),status:"pending_review"})),n=new Map;return t.concat(a,e).forEach(i=>{i.company_id&&n.set(i.company_id,{...n.get(i.company_id)||{},...i})}),Array.from(n.values()).sort((i,o)=>i.status==="pending_review"&&o.status!=="pending_review"?-1:i.status!=="pending_review"&&o.status==="pending_review"?1:String(i.company_name).localeCompare(String(o.company_name)))}function ee(e=u()){if(s.session?.auth!=="supabase")return!0;if(Ya(e))return!1;const t=Bt(e);return!!(!t||["trialing","active","past_due","grace"].includes(t.status)||t.grace_ends_at&&Date.parse(t.grace_ends_at)>Date.now())}function Ya(e=u()){const t=Bt(e);return t?.status==="pending_review"?!0:["active","past_due","grace"].includes(t?.status)?!1:Ha().includes(w(e))}function Ha(){return de(Sn,[]).map(w).filter(Boolean)}function Gn(e){const t=w(e);if(!t)return;const a=Array.from(new Set(Ha().concat(t)));k(Sn,a)}function Qu(e){const t=w(e);t&&k(Sn,Ha().filter(a=>a!==t))}function Vu(e){const t=String(e||"").trim();return!t||s.inviteLookup?.token!==t?null:s.inviteLookup}function Wa(e=u()){const t=Bt(e);return t?ua(t.status,t):s.session?.auth==="supabase"?"Approval pending":"Demo mode"}function ua(e,t={}){const a=za(e)||String(e||"");return a==="pending_review"?"Awaiting Quest approval":a==="trialing"?`Trial - ${x(t.trial_ends_at)}`:a==="active"?"Active subscription":a==="past_due"?"Past due grace":a==="grace"?`Grace - ${x(t.grace_ends_at)}`:a==="suspended"?"Suspended":a==="canceled"?"Rejected":T(a||"Unknown")}function za(e){const t=String(e||"").toLowerCase().trim();return["pending_review","trialing","active","past_due","grace","suspended","canceled","incomplete"].includes(t)?t:""}function Zn(){return String(b().profile?.role||"").toLowerCase()==="developer"}function H(e){const t=s.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function Ve(e){const t=Ue(e);return t?.full_name||t?.email||H(e)}function Xn(e){return s.tasks.filter(t=>t.project_id===e).length}function ma(e){return s.files.filter(t=>t.job_id===e).length}function w(e){return{"quest-roofing":"roofing","quest-drafting":"drafting"}[String(e||"").trim()]||String(e||"").trim()}function es(e){const t=new Map;return e.map(nt).forEach(a=>{!a.id||t.has(a.id)||t.set(a.id,a)}),Array.from(t.values())}function Cr(e){const t=new Map;return e.map(fa).forEach(a=>{a.company_id&&t.set(a.company_id,{...t.get(a.company_id)||{},...a})}),Array.from(t.values())}function nt(e){return{id:w(e.id||""),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function st(e){return{id:String(e.id||""),company_id:w(e.company_id||V()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:fi(e.stage),priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:R(e.estimate_total),invoice_total:R(e.invoice_total),task_count:R(e.task_count),file_count:R(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function ts(e){return{id:String(e.id||""),company_id:w(e.company_id||V()),name:String(e.name||"").trim()||"Untitled contact",phone:String(e.phone||"").trim(),email:String(e.email||"").trim(),location:String(e.location||"").trim(),stage:lo(e.stage),value:R(e.value),owner_name:String(e.owner_name||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function it(e){const t=oa.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=xt.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:bi.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:w(e.company_id||V()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||D(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:oa.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function jt(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:w(e.company_id||V()),job_id:String(e.job_id||""),folder:String(e.folder||ap(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:R(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function as(e){return{id:String(e.id||`folder-${crypto.randomUUID()}`),company_id:w(e.company_id||V()),name:String(e.name||"New folder").trim()||"New folder",parent_key:String(e.parent_key||"home"),created_by_label:String(e.created_by_label||"Quest HQ"),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Yt(e){const t=Array.isArray(e.questions)?e.questions.map(Ja):[],a=Ot.includes(e.type)?e.type:"Internal",n=An.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:w(e.company_id||V()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:n,audience:String(e.audience||"Internal").trim(),creator_id:String(e.creator_id||e.created_by||e.created_by_id||""),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ja(e){const t=Rt.some(([n])=>n===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(n=>String(n||"").trim()).filter(Boolean):[]};return It(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function ns(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:w(e.company_id||V()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function Ht(e){const t=R(e.subtotal),a=R(e.tax),n=R(e.total)||t+a;return{id:String(e.id||`invoice-${crypto.randomUUID()}`),company_id:w(e.company_id||V()),job_id:String(e.job_id||""),client_name:String(e.client_name||"").trim(),invoice_number:String(e.invoice_number||`INV-${Date.now()}`).trim(),status:_i.includes(e.status)?e.status:"Draft",issue_date:String(e.issue_date||D(0)).slice(0,10),due_date:String(e.due_date||D(30)).slice(0,10),subtotal:t,tax:a,total:n,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Wt(e){return{id:String(e.id||`payment-${crypto.randomUUID()}`),company_id:w(e.company_id||V()),invoice_id:String(e.invoice_id||""),amount:R(e.amount),method:hi.includes(e.method)?e.method:"ACH",received_at:String(e.received_at||D(0)).slice(0,10),reference:String(e.reference||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString()}}function zt(e){return{id:String(e.id||`expense-${crypto.randomUUID()}`),company_id:w(e.company_id||V()),job_id:String(e.job_id||""),vendor_id:String(e.vendor_id||""),category:Ia.includes(e.category)?e.category:"Other",amount:R(e.amount),status:vi.includes(e.status)?e.status:"Pending",spent_at:String(e.spent_at||D(0)).slice(0,10),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Jt(e){return{id:String(e.id||`vendor-${crypto.randomUUID()}`),company_id:w(e.company_id||V()),name:String(e.name||"New vendor").trim()||"New vendor",contact_name:String(e.contact_name||"").trim(),email:String(e.email||"").trim(),phone:String(e.phone||"").trim(),category:Ia.includes(e.category)?e.category:"Other",status:yi.includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ss(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,supervisor_id:String(e.supervisor_id||e.manager_id||""),company_ids:Array.isArray(e.company_ids)?z(e.company_ids.map(w)):[]}}function pa(e){const t=["active","pending","disabled","left"].includes(String(e.status))?String(e.status):"active";return{company_id:w(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:t,disabled_at:e.disabled_at||"",disabled_by:String(e.disabled_by||""),left_at:e.left_at||"",last_active_at:e.last_active_at||""}}function fa(e){return{company_id:w(e.company_id||""),status:za(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:R(e.amount_cents||3e4),currency:String(e.currency||"usd"),stripe_customer_id:String(e.stripe_customer_id||""),stripe_subscription_id:String(e.stripe_subscription_id||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||""}}function ht(e){return{company_id:w(e.company_id||""),company_name:String(e.company_name||e.name||e.short_name||e.company_id||"").trim(),status:za(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:R(e.amount_cents||3e4),currency:String(e.currency||"usd"),owner_profile_id:String(e.owner_profile_id||""),owner_name:String(e.owner_name||""),owner_email:String(e.owner_email||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||"",updated_at:e.updated_at||""}}function Ke(e){return{id:String(e.id||""),company_id:w(e.company_id||""),name:String(e.name||"Role").trim()||"Role",color:String(e.color||"#f0b23b"),priority:R(e.priority),is_system:e.is_system===!0,created_by:String(e.created_by||"")}}function dn(e){return{role_id:String(e.role_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function jr(e){return{company_id:w(e.company_id||""),profile_id:String(e.profile_id||""),role_id:String(e.role_id||""),assigned_by:String(e.assigned_by||"")}}function Bu(e){return{id:String(e.id||""),company_id:w(e.company_id||""),resource_type:String(e.resource_type||""),resource_id:String(e.resource_id||""),principal_type:String(e.principal_type||""),principal_id:String(e.principal_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function Yu(e){return{id:String(e.id||""),company_id:w(e.company_id||""),resource_type:String(e.resource_type||""),field_key:String(e.field_key||""),role_id:String(e.role_id||""),visibility:["visible","masked","hidden"].includes(e.visibility)?e.visibility:"visible",editable:e.editable!==!1}}function ga(e){return{id:String(e.id||""),company_id:w(e.company_id||""),email:String(e.email||""),role_id:String(e.role_id||""),token:String(e.token||""),status:String(e.status||"pending"),expires_at:e.expires_at||"",invited_by:String(e.invited_by||""),accepted_by:String(e.accepted_by||""),created_at:e.created_at||""}}function Ar(e){return{id:String(e.id||""),company_id:w(e.company_id||""),profile_id:String(e.profile_id||""),requested_email:String(e.requested_email||""),status:String(e.status||"pending"),message:String(e.message||""),reviewed_by:String(e.reviewed_by||""),created_at:e.created_at||""}}function Se(e){return{id:String(e.id||""),company_id:w(e.company_id||""),title:String(e.title||"Messages").trim()||"Messages",type:qn.includes(e.type)?e.type:"custom",created_by:String(e.created_by||""),last_message_at:e.last_message_at||e.updated_at||e.created_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ae(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:w(e.company_id||""),target_type:["all_company","role","profile"].includes(e.target_type)?e.target_type:"profile",target_id:String(e.target_id||""),created_at:e.created_at||""}}function je(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:w(e.company_id||""),sender_profile_id:String(e.sender_profile_id||e.created_by||""),body:String(e.body||""),message_type:String(e.message_type||"text"),deleted_at:e.deleted_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Re(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),message_id:String(e.message_id||""),company_id:w(e.company_id||""),bucket_id:String(e.bucket_id||"quest-message-attachments"),object_path:String(e.object_path||""),file_name:String(e.file_name||"attachment"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:R(e.size_bytes),preview_url:String(e.preview_url||""),created_at:e.created_at||new Date().toISOString()}}function Kt(e){return{conversation_id:String(e.conversation_id||""),company_id:w(e.company_id||""),profile_id:String(e.profile_id||""),last_read_at:e.last_read_at||"",updated_at:e.updated_at||e.last_read_at||""}}function rt(e){const t=e.starts_at||new Date().toISOString(),a=Fa.includes(e.event_type)?e.event_type:"Company event",n=["company","private"].includes(e.visibility)?e.visibility:"company",i=["","job","task","form","invoice"].includes(e.linked_type)?e.linked_type:"";return{id:String(e.id||`calendar-${crypto.randomUUID()}`),company_id:w(e.company_id||V()),title:String(e.title||"Calendar event").trim()||"Calendar event",description:String(e.description||"").trim(),event_type:a,starts_at:t,ends_at:e.ends_at||t,all_day:e.all_day===!0||e.all_day==="true"||e.all_day==="on",visibility:n,linked_type:i,linked_id:String(e.linked_id||""),assigned_profile_id:String(e.assigned_profile_id||""),created_by:String(e.created_by||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ys(e){return{id:e.id,company_id:e.company_id,title:e.title,type:e.type,created_by:e.created_by||b().profile.id,last_message_at:e.last_message_at||null}}function Hu(e){return{conversation_id:e.conversation_id,company_id:e.company_id,target_type:e.target_type,target_id:e.target_id}}function Wu(e){return{id:e.id,conversation_id:e.conversation_id,company_id:e.company_id,sender_profile_id:e.sender_profile_id,body:e.body,message_type:e.message_type,deleted_at:e.deleted_at||null}}function zu(e){return{id:e.id,conversation_id:e.conversation_id,message_id:e.message_id,company_id:e.company_id,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes}}function Ju(e){return{id:Tt(e.id)?e.id:void 0,company_id:e.company_id,title:e.title,description:e.description,event_type:e.event_type,starts_at:e.starts_at,ends_at:e.ends_at||e.starts_at,all_day:e.all_day,visibility:e.visibility,linked_type:e.linked_type||"",linked_id:e.linked_id||"",assigned_profile_id:e.assigned_profile_id||"",created_by:Tt(e.created_by)?e.created_by:b().profile.id}}function Ku(e){return{conversation_id:e.conversation_id,company_id:e.company_id,profile_id:e.profile_id,last_read_at:e.last_read_at||new Date().toISOString()}}function Gu(e=u()){return st({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function Zu(e=u(),t=""){return it({id:"",title:"",company_id:e,project_id:t,assignee_id:ut(e)[0]?.id||"abraham",creator_id:b().profile.member_id||"abraham",due:D(1),priority:"medium",status:"todo",type:"admin"})}function Xu(e=u()){const t=Oe();return Ht({id:"",company_id:e,job_id:t?.company_id===e?t.id:"",client_name:t?.company_id===e?t.client_name:"",invoice_number:sp(e),status:"Draft",issue_date:D(0),due_date:D(30),subtotal:t?.company_id===e?t.estimate_total:0,tax:0,notes:""})}function em(e=u(),t=""){const a=t?Le(t):we(e).find(i=>be(i.id)>0),n=a?.company_id===e?a:null;return Wt({id:"",company_id:e,invoice_id:n?.id||"",amount:n?be(n.id):0,method:"ACH",received_at:D(0),reference:"",notes:""})}function tm(e=u(),t=""){return zt({id:"",company_id:e,job_id:Oe()?.company_id===e?Oe().id:"",vendor_id:t||zn(e)[0]?.id||"",category:"Materials",status:"Pending",amount:0,spent_at:D(0),notes:""})}function am(e=u()){return Jt({id:"",company_id:e,name:"",category:"Materials",status:"Active"})}function nm(e=u()){const t=new Date;t.setHours(t.getHours()+1,0,0,0);const a=new Date(t);return a.setHours(t.getHours()+1),rt({id:"",company_id:e,title:"",description:"",event_type:"Company event",starts_at:t.toISOString(),ends_at:a.toISOString(),all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:b().profile.member_id||b().profile.id,created_by:b().profile.id})}function sm(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function im(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function b(){return s.session?s.session.auth==="supabase"?s.session:{...s.session,profile:{...un().profile,...s.session.profile||{},...s.profileDraft||{}}}:un()}function rm(e,t){const a=!!(e.user.email_confirmed_at||e.user.confirmed_at);return{auth:"supabase",access_token:e.access_token,refresh_token:e.refresh_token,user:{id:e.user.id,email:e.user.email||"",email_confirmed_at:e.user.email_confirmed_at||e.user.confirmed_at||"",email_verified:a},profile:At(t||{},{id:e.user.id,email:e.user.email||"",full_name:e.user.user_metadata?.full_name||e.user.email||"Quest user",role:"member",member_id:"",company_ids:[],avatar_url:"",email_verified:a})}}function un(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",email_verified:!0,...s.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:Ze.localUsername,email:e.email},profile:e}}function At(e,t={}){const a=String(e.role||t.role||"member").toLowerCase(),n=typeof e.email_verified=="boolean"?e.email_verified:t.email_verified===!0;return{id:String(e.id||t.id||""),email:String(e.email||t.email||""),full_name:String(e.full_name||t.full_name||e.email||t.email||"Quest user"),role:a,role_label:T(a),member_id:String(e.member_id||t.member_id||""),company_ids:Array.isArray(e.company_ids)?z(e.company_ids.map(w)):t.company_ids||[],avatar_url:String(e.avatar_url||t.avatar_url||""),approved:e.approved!==!1,email_verified:n,supervisor_id:String(e.supervisor_id||t.supervisor_id||"")}}function qt(e){const t=om(e.html||e.meta||""),a=e.read_at||(e.read===!0?e.created_at||new Date().toISOString():"");return{id:String(e.id||`notification-${crypto.randomUUID()}`),company_id:w(e.company_id||""),recipient_profile_id:String(e.recipient_profile_id||e.profile_id||e.member_id||"basic-quest-user"),type:String(e.type||(e.task_id?"task.notification":"general")),title:String(e.title||e.meta||"Notification"),body:String(e.body||t||""),href:String(e.href||""),source_type:String(e.source_type||(e.task_id?"task":"")),source_id:String(e.source_id||e.task_id||""),read_at:String(a||""),created_at:String(e.created_at||new Date().toISOString())}}function om(e){return String(e||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}function lm(e=b()){return e.auth!=="supabase"?!0:e.user?.email_verified===!0||!!e.user?.email_confirmed_at||e.profile?.email_verified===!0}function G(e,t,a=""){const n=xi();return`
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${B(n)}</span>
        <div>
          <div class="context-line"><span>${r(E(u()))}</span><b>${r(at(u()))}</b></div>
          <h1>${r(e)}</h1>
          <p>${r(t)}</p>
        </div>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function is(e){return`
    <button class="queue-row" type="button" data-select-task="${r(e.id)}">
      <span><strong>${r(e.title)}</strong><small>${r(N(e.project_id)?.name||E(e.company_id))}</small></span>
      ${rs(e.priority)}
      <b>${r(Ce(e.status))}</b>
    </button>
  `}function cm(e){return`
    <button class="job-card priority-${r(e.priority.toLowerCase())} ${e.id===s.selectedJobId?"active":""}" type="button" data-select-job="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.client_name||"No client")}</span>
      <small>${r(E(e.company_id))} - ${r(e.owner_name||"Unassigned")}</small>
      <em>${r(Xn(e.id))} tasks</em>
    </button>
  `}function ta(e,t,a,n){return`
    <a class="mini-link" href="${_(e)}" data-router>
      <i class="ti ${r(t)}"></i>
      <span><strong>${r(a)}</strong><small>${r(n)}</small></span>
    </a>
  `}function W(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${r(t)}</span><strong>${r(a)}</strong></div>`).join("")}</div>`}function C(e,t,a="",n=!1,i="text",o=""){return`<label class="${r(o)}"><span>${r(e)}</span><input name="${r(t)}" type="${r(i)}" value="${r(a)}" ${n?"required":""} /></label>`}function ye(e,t,a="",n=""){return`<label class="${r(n)}"><span>${r(e)}</span><textarea name="${r(t)}" rows="4">${r(a)}</textarea></label>`}function P(e,t,a,n){return`
    <label><span>${r(e)}</span><select name="${r(t)}">
      ${n.map(([i,o])=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function qr(e){return`<span class="priority ${r(String(e).toLowerCase())}">${r(e)}</span>`}function rs(e){return`<span class="priority ${r(e)}">${r(T(e))}</span>`}function Mr(e){return`<span class="status-pill ${r(e)}">${r(Ce(e))}</span>`}function dm(e){return`<span class="finance-status ${r(Gt(e))}">${r(e)}</span>`}function X(e,t){if(e.avatar_url)return`<span class="${r(t)}"><img src="${r(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(n=>n[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${r(t)}">${r(a)}</span>`}function um(e=u()){const t=ne(e).filter(a=>a.status==="active").map(a=>[a.profile_id||a.member_id,a.name||a.email||a.member_id]);return[["","Unassigned"]].concat(t)}function Hs(e){const t=new Date(e||Date.now());if(Number.isNaN(t.getTime()))return"";const a=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),i=String(t.getDate()).padStart(2,"0"),o=String(t.getHours()).padStart(2,"0"),l=String(t.getMinutes()).padStart(2,"0");return`${a}-${n}-${i}T${o}:${l}`}function Ws(e){const t=new Date(e||Date.now());return Number.isNaN(t.getTime())?new Date().toISOString():t.toISOString()}function v(e){return`<div class="empty-state">${B("q-empty","empty-symbol")}<span>${r(e)}</span></div>`}function ce(e,t){const a={};return t.forEach(n=>{const i=e.get(n);i&&(a[n]=i)}),a}function te(){s.session?.auth!=="supabase"&&(k(ya,s.jobs),k(pn,s.contacts),k(fn,s.tasks),k(gn,s.files),k(bn,s.driveFolders),k(ct,s.forms),k(ha,s.formResponses),k(yn,s.financeInvoices),k(hn,s.financePayments),k($n,s.financeExpenses),k(wn,s.financeVendors),k($a,s.timeEntries),k(wa,s.activeTimer),k(_n,s.teamMembers),k(vn,s.memberships),k(Sa,s.notifications),k(ka,s.messageConversations),k(Da,s.messageAccess),k(Ca,s.messages),k(ja,s.messageReads),k(Aa,s.messageAttachments),k(qa,s.calendarEvents))}function Fr(){s.session?.auth!=="supabase"&&(k($a,s.timeEntries),k(wa,s.activeTimer))}function os(){s.session?.auth!=="supabase"&&k(Sa,s.notifications)}function Ir(){s.session?.auth!=="supabase"&&k(qa,s.calendarEvents)}function Be(){s.session?.auth!=="supabase"&&(k(ka,s.messageConversations),k(Da,s.messageAccess),k(Ca,s.messages),k(ja,s.messageReads),k(Aa,s.messageAttachments))}function ls(e,t,a){if(a==="company")return[ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"all_company",target_id:"all"})];const n=[];return e.getAll("role_ids").forEach(i=>{i&&n.push(ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"role",target_id:i}))}),e.getAll("profile_ids").forEach(i=>{i&&n.push(ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:i}))}),n.length?n:[ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:b().profile.id})]}function Ka(e,t=!0){if(!e)return;const a=s.messageConversations.find(l=>l.id===e);if(!a)return;const n=new Date().toISOString(),i=b().profile.id,o=Kt({conversation_id:e,company_id:a.company_id,profile_id:i,last_read_at:n});if(s.messageReads=[o].concat(s.messageReads.filter(l=>l.conversation_id!==e||l.profile_id!==i)),Be(),t&&s.session?.auth==="supabase"){const l=M();l&&l.from("message_reads").upsert(Ku(o),{onConflict:"conversation_id,profile_id"})}}function Er(e,t,a=[]){const n=m("messages",{conversation:e.id},e.company_id),i=Ve(t.sender_profile_id),o=Mt(e).filter(c=>c!==he(e.company_id,t.sender_profile_id)),l=mm(t.body,e.company_id).filter(c=>c!==he(e.company_id,t.sender_profile_id));e.type==="direct"&&J("message.direct","New direct message",`${i} sent a direct message in ${e.title}.`,n,"message",t.id,e.company_id,o),l.forEach(c=>{ze({company_id:e.company_id,recipients:[c],type:"message.mention",title:"Mentioned in chat",body:`${i} mentioned you in ${e.title}.`,href:n,sourceType:"message",sourceId:t.id}).catch(d=>console.warn("Message mention notification failed",d))}),a.length&&J("message.attachment","Attachment shared",`${i} shared ${a.length} attachment${a.length===1?"":"s"} in ${e.title}.`,n,"message",t.id,e.company_id,o)}function mm(e="",t=u()){const a=String(e||"").toLowerCase();return a.includes("@")?ne(t).filter(n=>a.includes(`@${String(n.name||"").split(/\s+/)[0].toLowerCase()}`)||a.includes(`@${String(n.name||"").toLowerCase()}`)).map(n=>he(t,n.profile_id||n.member_id)).filter(Boolean):[]}function cs(e){const t=Ue(e);if(t)return t;const a=s.teamMembers.find(n=>n.id===e);return{id:e,full_name:a?.full_name||a?.name||e||"Quest user",email:a?.email||"",avatar_url:a?.avatar_url||""}}function We(e){const t=String(e?.name||"").trim();if(t&&!va(t))return t;const a=String(e?.email||"").trim();return a?a.split("@")[0]||a:"Workspace user"}function pm(e){return z([e?.email,e?.role_label||T(e?.role||""),T(e?.status||"")]).join(" / ")||"Company member"}function zs(e){return{id:e?.profile_id||e?.member_id||"",full_name:We(e),email:e?.email||"",avatar_url:e?.avatar_url||""}}function fm(e){const t=String(e.value||"").trim().toLowerCase(),a=e.closest(".message-modal-form"),n=Array.from(a?.querySelectorAll("[data-message-person-row]")||[]);let i=0;n.forEach(l=>{const c=l.querySelector('input[type="checkbox"]')?.checked,d=!t||String(l.dataset.filterText||"").includes(t),f=c||d;l.hidden=!f,f&&(i+=1)});const o=a?.querySelector("[data-message-filter-count]");o&&(o.textContent=t?`${i} match${i===1?"":"es"}`:`${n.length} member${n.length===1?"":"s"}`)}function gm(e){return{company:"q-symbol-company-chat",role:"q-symbol-role-chat",custom:"q-symbol-messages",direct:"q-symbol-direct-chat"}[e]||"q-symbol-messages"}function ds(e){const t=Pa(e.id);if(e.type==="company"||t.some(i=>i.target_type==="all_company"))return"Everyone in this company";const a=t.filter(i=>i.target_type==="role").map(i=>mt(e.company_id,i.target_id)?.name||"Role"),n=t.filter(i=>i.target_type==="profile").map(i=>Ve(i.target_id));return a.concat(n).slice(0,5).join(", ")||"Private chat"}function bm(e){return r(e).replace(/(^|\s)@([\w.-]+)/g,"$1<strong>@$2</strong>")}function Tr(e){const t=Number(e||0);return t>=1024*1024?`${(t/1024/1024).toFixed(1)} MB`:t>=1024?`${Math.round(t/1024)} KB`:`${t} B`}function xr(e){return new Promise(t=>{const a=new FileReader;a.onload=()=>t(String(a.result||"")),a.onerror=()=>t(""),a.readAsDataURL(e)})}function _m(e,t){const a=M();if(s.session?.auth!=="supabase"||!a?.channel||!t)return;const n=`${e}:${t}`;s.messageRealtimeKey!==n&&(s.messageRealtimeChannel&&a.removeChannel(s.messageRealtimeChannel),s.messageRealtimeKey=n,s.messageRealtimeChannel=a.channel(`quest-messages-${t}`).on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:`conversation_id=eq.${t}`},()=>{s.dataLoaded=!1,p()}).on("postgres_changes",{event:"*",schema:"public",table:"message_attachments",filter:`conversation_id=eq.${t}`},()=>{s.dataLoaded=!1,p()}).subscribe())}function vm(e){const t=[()=>ra(e,"Crew weather delay","role","Manager posted a weather delay update.",!0),()=>ra(e,"Permit questions","custom","A permit packet PDF was shared.",!1,!0),()=>ra(e,"Shan Kumar","direct","Can you jump on this when you are back?",!0),()=>ym(e,"@Joshua you were mentioned in the launch room.")],a=Math.floor(Math.random()*t.length);t[a]()}function ra(e,t,a,n,i=!1,o=!1){const l=new Date().toISOString(),c=Se({id:`msg-conv-${crypto.randomUUID()}`,company_id:e,title:t,type:a,created_by:"basic-quest-user",last_message_at:l,created_at:l,updated_at:l}),d=a==="direct"?[ae({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:c.id,target_type:"profile",target_id:"basic-quest-user"}),ae({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:c.id,target_type:"profile",target_id:"shan"})]:ls(new FormData,c,a==="role"?"role":"company");s.messageConversations.unshift(c),s.messageAccess=d.concat(s.messageAccess);const f=je({id:`msg-${crypto.randomUUID()}`,conversation_id:c.id,company_id:e,sender_profile_id:i?"shan":"basic-quest-user",body:n,created_at:l,updated_at:l,message_type:o?"attachment":"text"});s.messages.push(f),o&&s.messageAttachments.push(Re({id:`msg-attachment-${crypto.randomUUID()}`,conversation_id:c.id,message_id:f.id,company_id:e,file_name:"permit-packet.pdf",mime_type:"application/pdf",size_bytes:42e4,created_at:l})),i||Ka(c.id,!1),s.selectedConversationId=c.id,Be(),$("Demo message scenario added.","local","Messages"),A(m("messages",{conversation:c.id},e),{replace:!0})}function ym(e,t){const a=rr(e)||Ne(e)[0];if(!a)return ra(e,"Demo chat","company",t,!0);const n=new Date().toISOString(),i=je({id:`msg-${crypto.randomUUID()}`,conversation_id:a.id,company_id:e,sender_profile_id:"shan",body:t,created_at:n,updated_at:n});s.messages.push(i),s.messageConversations=s.messageConversations.map(o=>o.id===a.id?{...o,last_message_at:n,updated_at:n}:o),Er(a,i,[]),Be(),$("Demo mention added.","local","Messages"),p()}function hm(){s.messageConversations=Mn.map(Se),s.messageAccess=Fn.map(ae),s.messages=In.map(je),s.messageReads=Tn.map(Kt),s.messageAttachments=En.map(Re),s.selectedConversationId="",Be(),$("Demo messages reset.","local","Messages"),p()}function $m(e){return{id:e.id,company_id:e.company_id,recipient_profile_id:e.recipient_profile_id,type:e.type,title:e.title,body:e.body,href:e.href,source_type:e.source_type,source_id:e.source_id,read_at:e.read_at||null,created_at:e.created_at}}function Or(e=""){const t=String(e||"").split(".")[0];return{access:"Access",approval:"Approval",calendar:"Calendar",file:"Files",finance:"Finance",form:"Forms",message:"Messages",task:"Tasks"}[t]||"Inbox"}async function ze(e){const t=w(e.companyId||e.company_id||u()),a=wm(t,e.recipients,{excludeActor:e.excludeActor===!0,type:e.type,href:e.href});if(!a.length)return[];const n=new Date().toISOString(),i=a.map(o=>qt({id:`notification-${crypto.randomUUID()}`,company_id:t,recipient_profile_id:o,type:e.type||"general",title:e.title||"Notification",body:e.body||"",href:e.href||"",source_type:e.sourceType||e.source_type||"",source_id:e.sourceId||e.source_id||"",created_at:n}));if(s.session?.auth==="supabase"){const o=M();if(!o)return[];const l=await o.from("notifications").insert(i.map($m)).select();if(l.error)return console.warn("Notification insert failed",l.error),[];const c=(l.data||[]).map(qt);return Js(c),p(),c}return Js(i),os(),p(),i}function Js(e){if(!e.length)return;const t=new Map;e.concat(s.notifications).forEach(a=>t.set(a.id,a)),s.notifications=[...t.values()].sort((a,n)=>Date.parse(n.created_at||0)-Date.parse(a.created_at||0)).slice(0,200)}function wm(e,t=[],a={}){let i=(Array.isArray(t)?t:[t]).map(o=>he(e,o)).filter(Boolean);return i.length||(i=Nr(e,a.type||"","","")),i=z(i),s.session?.auth!=="supabase"&&!i.includes(b().profile.id)&&i.push(b().profile.id),a.excludeActor&&(i=i.filter(o=>o!==Rr())),i.filter(o=>Sm(e,o)&&km(e,o,a.type,a.href))}function he(e,t){if(!t)return"";const a=typeof t=="object"?String(t.profile_id||t.id||t.member_id||t.target_id||"").trim():String(t).trim();if(!a)return"";if(Ue(a)||oe(e,a))return a;const n=b().profile;if(a===n.id||a===n.member_id||a===n.email)return n.id;const i=ne(e).find(l=>[l.profile_id,l.member_id,l.email,l.name].filter(Boolean).includes(a));if(i?.profile_id)return i.profile_id;const o=s.profiles.find(l=>l.member_id===a||l.email===a||l.full_name===a);return o?.id?o.id:s.session?.auth==="supabase"?"":a}function Sm(e,t){if(!t)return!1;if(t===b().profile.id&&s.session?.auth!=="supabase")return!0;const a=oe(e,t);if(a)return a.status==="active";const n=ne(e).find(i=>i.profile_id===t||i.member_id===t);return s.session?.auth!=="supabase"?!0:n?.status==="active"}function Rr(){return b().profile.id||b().profile.member_id||""}function km(e,t,a="",n=""){const i=Dm(a,n);return i?Pr(e,t,i):!0}function Dm(e="",t=""){const a=`${e} ${t}`;return a.includes("finance")?"finance.view":a.includes("message")?"messages.view":a.includes("calendar")?"calendar.view":a.includes("file")?"files.view":a.includes("approval")?"approvals.view":a.includes("form")?"forms.view":a.includes("task")?"tasks.view":""}function Pr(e,t,a){if(!a)return!0;if(t===b().profile.id)return h(a,e);const n=oe(e,t);if(s.session?.auth==="supabase"&&(!n||n.status!=="active"))return!1;const i=String(n?.role||ne(e).find(f=>f.profile_id===t)?.role||"member").toLowerCase();if(["owner","admin","developer"].includes(i))return!0;const o=Qn(a),l=s.roleAssignments.filter(f=>f.company_id===e&&f.profile_id===t).map(f=>f.role_id),c=s.rolePermissions.filter(f=>l.includes(f.role_id));if(c.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="deny"))return!1;if(c.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="allow"))return!0;const d=et[i]||et.member;return d.includes("*")||o.some(f=>d.includes(f))}function Nr(e,t="",a="",n=""){const i=String(t||"").split(".")[0];return i==="finance"?fe(e,["finance.view"]):i==="message"?fe(e,["messages.view"]):i==="calendar"?jm(n).concat(fe(e,["calendar.manage"])):i==="file"?fe(e,["files.view"]).concat(Cm(e,n)):i==="form"?fe(e,["forms.view","forms.manage"]):i==="approval"?fe(e,["approvals.view","approvals.manage"]):i==="access"?fe(e,["users.manage","settings.manage"]):[Rr()]}function fe(e,t){return z(ne(e).filter(a=>a.status==="active").map(a=>he(e,a.profile_id||a.member_id)).filter(a=>t.some(n=>Pr(e,a,n))))}function mn(e,t=!0){return e?z([e.assignee_id,t?e.creator_id:"",...Array.isArray(e.watchers)?e.watchers:[]].map(a=>he(e.company_id,a)).filter(Boolean)):[]}function Cm(e,t){return t?z(s.tasks.filter(a=>a.company_id===e&&a.project_id===t).flatMap(a=>mn(a))):[]}function jm(e){const t=s.calendarEvents.find(a=>a.id===e);return t?z([t.assigned_profile_id,t.created_by].map(a=>he(t.company_id,a)).filter(Boolean)):[]}function Mt(e){if(!e)return[];const a=Pa(e.id).flatMap(n=>n.target_type==="all_company"?fe(e.company_id,["messages.view"]):n.target_type==="profile"?[he(e.company_id,n.target_id)]:n.target_type==="role"?ne(e.company_id).filter(i=>i.status==="active"&&(i.role_id===n.target_id||Ct(e.company_id,i.role)===n.target_id)).map(i=>he(e.company_id,i.profile_id||i.member_id)):[]);return z(a.filter(Boolean))}async function Am(e=u()){const t=new Date().toISOString(),a=b().profile.id,n=s.notifications.filter(i=>i.company_id===e&&i.recipient_profile_id===a&&!i.read_at).map(i=>i.id);if(n.length&&(s.notifications=s.notifications.map(i=>i.company_id===e&&i.recipient_profile_id===a&&!i.read_at?{...i,read_at:t}:i),os(),p(),s.session?.auth==="supabase")){const i=M();i&&await i.from("notifications").update({read_at:t}).in("id",n).eq("recipient_profile_id",a)}}async function qm(e){const t=s.notifications.find(n=>n.id===e);if(!t)return;const a=new Date().toISOString();if(s.notifications=s.notifications.map(n=>n.id===t.id?{...n,read_at:n.read_at||a}:n),s.notificationMenuOpen=!1,os(),p(),s.session?.auth==="supabase"&&!t.read_at){const n=M();n&&await n.from("notifications").update({read_at:a}).eq("id",t.id).eq("recipient_profile_id",b().profile.id)}t.href&&A(t.href)}function Ks(e,t=null){const a=m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),n=H(e.assignee_id);if(!t){ze({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task assigned",body:`${Y()} assigned ${e.title} to ${n}.`,href:a,sourceType:"task",sourceId:e.id}).catch(i=>console.warn("Task notification failed",i));return}t.assignee_id!==e.assignee_id&&ze({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task reassigned",body:`${Y()} reassigned ${e.title} to ${n}.`,href:a,sourceType:"task",sourceId:e.id}).catch(i=>console.warn("Task notification failed",i)),t.priority!==e.priority&&ze({companyId:e.company_id,recipients:mn(e),excludeActor:!0,type:"task.priority",title:"Task priority changed",body:`${Y()} set priority to ${T(e.priority)} on ${e.title}.`,href:a,sourceType:"task",sourceId:e.id}).catch(i=>console.warn("Task notification failed",i)),t.status!==e.status&&ze({companyId:e.company_id,recipients:mn(e),excludeActor:!0,type:"task.status",title:"Task status changed",body:`${Y()} moved ${e.title} to ${Ce(e.status)}.`,href:a,sourceType:"task",sourceId:e.id}).catch(i=>console.warn("Task notification failed",i))}function J(e,t,a,n,i="",o="",l=u(),c=null){ze({companyId:l,recipients:c||Nr(l,e,i,o),type:e,title:t,body:a,href:n,sourceType:i,sourceId:o}).catch(d=>console.warn("Notification event failed",d))}async function ot(e,t,a,n,i={},o=!1){const l={id:`audit-${crypto.randomUUID()}`,company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:n,details:i,created_at:new Date().toISOString()};if(s.auditEvents.unshift(l),o&&s.session?.auth==="supabase"){const c=M();if(c)try{await c.from("audit_events").insert({company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:n,details:i})}catch{}}}function Mm(e,t){return t.status==="disabled"?"membership.disabled":t.status==="left"?"membership.left":e&&["disabled","left","pending"].includes(e.status)&&t.status==="active"?"membership.reactivated":e&&e.role!==t.role?"role.changed":"membership.updated"}function Y(){return b().profile.full_name||b().profile.email||"Quest HQ"}function F(e,t,a=""){return`<article class="metric">${B(ko(e),"metric-symbol")}<span>${r(e)}</span><strong>${r(t)}</strong>${a?`<small>${r(a)}</small>`:""}</article>`}function xe(e,t){return`<div><strong>${r(e)}</strong><span>${r(t)}</span></div>`}function Ge(e,t,a,n,i=""){const o=`
    <span><strong>${r(e)}</strong><small>${r(t||"Finance record")}</small></span>
    <b>${r(a)}</b>
    <em>${x(n)}</em>
  `;return i?`<a class="finance-compact-row" href="${_(i)}" data-router>${o}</a>`:`<div class="finance-compact-row">${o}</div>`}function Gs(e,t){const a=$e(e);return t==="jobs"?a.filter(n=>n.job_id).length:a.filter(n=>n.folder===t).length}function Ur(e="home",t=null){return t?.id?`job:${t.id}`:e||"home"}function Fm(e,t="home",a=null){const n=Ur(t,a),i=Dt(e).filter(o=>o.parent_key===n).map(o=>Im(e,o));return a?i:t==="home"?jn.map(([l,c,d,f])=>({id:l,name:c,caption:d,icon:f,href:_(m("files",{folder:l},e)),countLabel:`${Gs(e,l)} file${Gs(e,l)===1?"":"s"}`,updatedLabel:""})).concat(i):t==="jobs"?Q(e).map(l=>({id:`job:${l.id}`,name:l.name,caption:l.client_name||E(e),icon:"ti-folder",href:_(m("files",{folder:"jobs",job_id:l.id},e)),countLabel:`${ma(l.id)} file${ma(l.id)===1?"":"s"}`,updatedLabel:x(l.updated_at)})).concat(i):i}function Im(e,t){const a=Dt(e).filter(o=>o.parent_key===t.id).length,n=$e(e).filter(o=>o.folder===t.id).length,i=a+n;return{id:t.id,name:t.name,caption:"Custom folder",icon:"ti-folder",href:_(m("files",{folder:t.id},e)),countLabel:`${i} item${i===1?"":"s"}`,updatedLabel:x(t.updated_at)}}function Em(e,t,a=null){if(a)return`<span>/</span><a href="${_(m("files",{folder:"jobs"},e))}" data-router>Jobs</a>`;const n=Dt(e).find(d=>d.id===t);if(!n)return`<span>/</span><strong>${r(_e(t))}</strong>`;const i=[];let o=n;const l=new Set;for(;o&&!l.has(o.id);)l.add(o.id),i.unshift(o),o=Dt(e).find(d=>d.id===o.parent_key);return`${n.parent_key&&!n.parent_key.startsWith("folder-")&&n.parent_key!=="home"?`<span>/</span><a href="${_(m("files",{folder:n.parent_key},e))}" data-router>${r(_e(n.parent_key))}</a>`:""}${i.map((d,f)=>`<span>/</span>${f===i.length-1?`<strong>${r(d.name)}</strong>`:`<a href="${_(m("files",{folder:d.id},e))}" data-router>${r(d.name)}</a>`}`).join("")}`}function Tm(e=u(),t="home",a=""){const n=(s.fileQuery||s.query||"").trim().toLowerCase(),i=s.fileCategoryFilter;let o=$e(e);return a?o=o.filter(l=>l.job_id===a):t&&t!=="home"&&(t==="jobs"?o=o.filter(l=>l.job_id):o=o.filter(l=>l.folder===t)),i&&i!=="All categories"&&(o=o.filter(l=>String(l.category||_e(l.folder)).toLowerCase()===i.toLowerCase())),n&&(o=o.filter(l=>[l.file_name,l.category,l.uploaded_by_label,l.notes,l.object_path,N(l.job_id)?.name].some(c=>String(c||"").toLowerCase().includes(n)))),o.sort((l,c)=>new Date(c.created_at||0)-new Date(l.created_at||0))}function Fe(e){const t={pdf:"PDF",image:"Image",archive:"Archive",sheet:"Excel",doc:"Word",presentation:"PowerPoint",text:"Text",video:"Video",audio:"Audio",code:"Code",data:"Data",design:"Design",cad:"CAD",email:"Email"},a=Ga(e);if(t[a])return t[a];const n=Za(e);return n?n.toUpperCase():_e(e.folder)}function Ga(e){const t=String(e.mime_type||"").toLowerCase(),a=Za(e);return t.includes("pdf")||a==="pdf"?"pdf":t.includes("image")||["png","jpg","jpeg","gif","webp","svg","bmp","tif","tiff","heic","ico"].includes(a)?"image":t.includes("zip")||t.includes("compressed")||["zip","rar","7z","tar","gz","tgz","bz2"].includes(a)?"archive":t.includes("spreadsheet")||t.includes("excel")||["xls","xlsx","xlsm","ods","csv"].includes(a)?"sheet":t.includes("word")||["doc","docx","odt","rtf"].includes(a)?"doc":t.includes("presentation")||["ppt","pptx","pps","odp"].includes(a)?"presentation":t.includes("video")||["mp4","mov","avi","mkv","webm","wmv","m4v"].includes(a)?"video":t.includes("audio")||["mp3","wav","aac","flac","m4a","ogg"].includes(a)?"audio":["js","ts","jsx","tsx","html","css","scss","json","xml","yml","yaml","md","sql","py","rb","php","java","cs","cpp","c","go","rs","sh","ps1"].includes(a)?"code":["txt","log"].includes(a)||t.includes("text")?"text":["ai","psd","sketch","fig"].includes(a)?"design":["dwg","dxf","rvt","ifc","step","stp"].includes(a)?"cad":["eml","msg"].includes(a)?"email":["db","sqlite","bak"].includes(a)?"data":"file"}function us(e){return Ga(e)}function Za(e){return String(e.file_name||"").split(".").pop()?.toLowerCase()||""}function xm(e){return e.type==="image/png"?"png":e.type==="image/webp"?"webp":"jpg"}function ms(e,t=!1){return e.signed_url&&Ga(e)==="image"?`<img src="${r(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${r(us(e))} ${t?"large":""}">${Jr(e,Fe(e))}<small>${r(Lr(e))}</small></span>`}function Lr(e){const t=Fe(e),a=Za(e);return t==="Image"?a&&a.length<=4?a.toUpperCase():"IMG":t==="Archive"?a&&a.length<=3?a.toUpperCase():"ZIP":t==="Excel"?a==="csv"?"CSV":"XLS":t==="Word"?"DOC":t==="PowerPoint"?"PPT":t==="Video"?"VID":t==="Audio"?"AUD":t==="Code"?a&&a.length<=4?a.toUpperCase():"CODE":t==="Design"?a&&a.length<=4?a.toUpperCase():"DES":t==="CAD"?a&&a.length<=4?a.toUpperCase():"CAD":t==="Email"?a&&a.length<=4?a.toUpperCase():"MAIL":t==="Data"?a&&a.length<=4?a.toUpperCase():"DATA":t==="Text"?a&&a.length<=4?a.toUpperCase():"TXT":t.length<=4?t.toUpperCase():(a||"FILE").slice(0,4).toUpperCase()}function ke(e=u()){return s.forms.filter(t=>t.company_id===e)}function Om(e=u()){const t=s.formQuery.trim().toLowerCase(),a=s.route?.jobId||"";return ke(e).filter(n=>a&&n.linked_job_id!==a||s.formTypeFilter!=="all"&&n.type!==s.formTypeFilter?!1:t?[n.title,n.description,n.type,n.status,n.audience,N(n.linked_job_id)?.name].some(i=>String(i||"").toLowerCase().includes(t)):!0)}function Ft(e=u()){const t=s.route?.jobId||"",a=ke(e).filter(o=>!t||o.linked_job_id===t),n=s.route?.params?.get("form_id")||"";if(n&&a.some(o=>o.id===n)&&(s.selectedFormId=n),!a.length)return s.selectedFormId="",s.selectedQuestionId="",null;let i=a.find(o=>o.id===s.selectedFormId)||a[0];return s.selectedFormId=i.id,(!s.selectedQuestionId||!i.questions.some(o=>o.id===s.selectedQuestionId))&&(s.selectedQuestionId=i.questions[0]?.id||""),i}function Ie(e){return s.forms.find(t=>t.id===e)||null}function De(){return Ie(s.selectedFormId)||Ft(u())}function Qr(e=u()){return s.formResponses.filter(t=>t.company_id===e)}function Xa(e){return s.formResponses.filter(t=>t.form_id===e)}function Vr(e){return Array.isArray(e?.questions)?e.questions.length:0}function Rm(e){const t=String(e?.creator_id||""),a=b().profile;return t?t&&(t===a.member_id||t===a.id)?a.full_name||"Quest Basic Mode":H(t)||e?.created_by_label||"Quest HQ":e?.created_by_label||a.full_name||"Quest HQ"}function yt(e,t,a="",n=!1,i="text"){return`<label><span>${r(e)}</span><input data-form-field="${r(t)}" type="${r(i)}" value="${r(a)}" ${n?"required":""} /></label>`}function Br(e,t,a=""){return`<label><span>${r(e)}</span><textarea data-form-field="${r(t)}" rows="3">${r(a)}</textarea></label>`}function aa(e,t,a,n){return`
    <label><span>${r(e)}</span><select data-form-field="${r(t)}">
      ${n.map(([i,o])=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function It(e){return["multiple","checkbox","dropdown"].includes(e.type)}function Pm(e){return{short:"ti-letter-t",paragraph:"ti-align-left",multiple:"ti-circle-dot",checkbox:"ti-checkbox",dropdown:"ti-select",date:"ti-calendar",rating:"ti-star",yesno:"ti-circle-check",file:"ti-paperclip"}[e]||"ti-plus"}function Nm(e){return Rt.find(([t])=>t===e)?.[1]||T(e||"Question")}function ve(e,t){return`
    <div class="response-question">
      <label>
        <span>${r(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${r(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function Yr(e){const t=Ie(e.form_id),a=Object.entries(e.answers||{}).map(([n,i])=>{const o=t?.questions.find(c=>c.id===n),l=Array.isArray(i)?i.join(", "):i;return xe(o?.label||n,l||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${r(t?.title||"Response")}</h2><p>${r(e.submitted_by||e.submitter_email||"Anonymous")} / ${x(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||xe("Response","No answers captured.")}</div>
  `}function $t(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[Z("short","Inspection address"),Z("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),Z("paragraph","Recommended scope"),Z("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[Z("short","Client name"),Z("yesno","Approved to proceed?"),Z("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[Z("short","Request title"),Z("dropdown","Priority",["Low","Medium","High","Urgent"]),Z("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[Z("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),Z("yesno","Weather safe?"),Z("paragraph","Safety notes")]}]}function Um(e=u()){return Yt({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:s.route?.jobId||"",theme_color:Me(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[Z("short","First question")]})}function Z(e="short",t="Untitled question",a=[]){return Ja({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function Lm(e,t={}){if(!y("forms.manage",e,"Your role cannot create forms.","Forms"))return null;const a=Um(e),n=Yt({...a,...t,id:t.id||`form-${crypto.randomUUID()}`,company_id:e,questions:(t.questions||a.questions).map(i=>Ja(i)),created_at:t.created_at||new Date().toISOString(),updated_at:new Date().toISOString()});return s.forms.unshift(n),s.selectedFormId=n.id,s.selectedQuestionId=n.questions[0]?.id||"",s.formsTab="builder",s.formEditorTab="questions",s.modal="",s.formStartTemplateId="",s.formStartTab="blank",ie("New form created"),p(),n}function Qm(e){if(!y("forms.manage",u(),"Your role cannot create forms.","Forms"))return;const t=Object.fromEntries(new FormData(e).entries()),a=t.template_id?$t().find(l=>l.id===t.template_id):null,n=String(t.title||a?.title||"Untitled form").trim()||"Untitled form",i=String(t.description||a?.description||"").trim(),o=a?a.questions.map(l=>({...ba(l),id:`q-${crypto.randomUUID()}`})):[Z("short","First question")];Lm(u(),{title:n,description:i,type:Ot.includes(t.type)?t.type:a?.type||"Internal",audience:String(t.audience||"Internal").trim()||"Internal",creator_id:b().profile.member_id||b().profile.id||"basic-quest-user",linked_job_id:String(t.linked_job_id||""),theme_color:Me(u()),background:"clean",submit_label:String(t.submit_label||"Submit").trim()||"Submit",collect_email:t.collect_email==="on",require_approval:t.require_approval==="on",questions:o})}function na(e,t=!0){const a=Ie(e);a&&(s.selectedFormId=a.id,s.selectedQuestionId=a.questions[0]?.id||"",t&&p())}function ie(e="Forms saved locally"){const t=De();t&&(t.updated_at=new Date().toISOString()),k(ct,s.forms),k(ha,s.formResponses),s.sync={label:e,mode:"live"}}function Zs(e,t){const a=Ie(e||s.selectedFormId);a&&y("forms.manage",a.company_id,"Your role cannot update forms.","Forms")&&(a.status=An.includes(t)?t:"Draft",s.selectedFormId=a.id,ie(`${a.status} locally`),p())}function Vm(e){const t=Ie(e||s.selectedFormId);if(!t||!y("forms.manage",t.company_id,"Your role cannot duplicate forms.","Forms"))return;const a=Yt({...ba(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(n=>({...ba(n),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});s.forms.unshift(a),s.selectedFormId=a.id,s.selectedQuestionId=a.questions[0]?.id||"",ie("Form duplicated"),p()}function Bm(e){const t=e||s.selectedFormId;if(!t)return;const a=Ie(t);a&&!y("forms.manage",a.company_id,"Your role cannot delete forms.","Forms")||(s.forms=s.forms.filter(n=>n.id!==t),s.formResponses=s.formResponses.filter(n=>n.form_id!==t),s.selectedFormId=ke(u())[0]?.id||"",s.selectedQuestionId=Ft(u())?.questions[0]?.id||"",s.modal="",ie("Form deleted locally"),p())}async function Ym(e){const t=e||s.selectedFormId,a=`${window.location.origin}${_(m("forms",{form_id:t},u()))}`;try{await navigator.clipboard.writeText(a),s.sync={label:"Form link copied",mode:"live"}}catch{s.sync={label:"Copy failed",mode:"local"}}p()}function Hm(e){const t=JSON.stringify({company_id:e,forms:ke(e),responses:Qr(e)},null,2);ep(`${e}-forms-export.json`,t,"application/json")}function Hr(e){const t=De();if(!t||!h("forms.manage",t.company_id))return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),k(ct,s.forms))}function Wr(e){const t=De(),a=e.closest("[data-question-id]"),n=t?.questions.find(i=>i.id===a?.dataset.questionId);if(!(!t||!n)&&h("forms.manage",t.company_id)){if(s.selectedQuestionId=n.id,e.matches("[data-question-option]")){const i=Number(e.dataset.questionOption);n.options[i]=e.value}else{const i=e.dataset.questionField;if(i==="required")n.required=e.checked;else if(i==="type"){n.type=e.value,It(n)&&!n.options.length&&(n.options=["Option 1","Option 2"]),It(n)||(n.options=[]),ie("Question updated"),p();return}else i&&(n[i]=e.value)}t.updated_at=new Date().toISOString(),k(ct,s.forms)}}function Wm(e="multiple"){const t=De();if(!t||!y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms"))return;const a=Z(e,Rt.find(([n])=>n===e)?.[1]||"New question");t.questions.push(a),s.selectedQuestionId=a.id,ie("Question added"),p()}function zm(e){const t=De(),a=t?.questions.find(o=>o.id===e);if(!t||!a||!y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms"))return;const n=t.questions.findIndex(o=>o.id===e),i=Ja({...ba(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(n+1,0,i),s.selectedQuestionId=i.id,ie("Question duplicated"),p()}function Jm(e){const t=De();t&&y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms")&&(t.questions=t.questions.filter(a=>a.id!==e),s.selectedQuestionId=t.questions[0]?.id||"",ie("Question deleted"),p())}function Km(e,t){const a=De();if(!a||!t||!y("forms.manage",a.company_id,"Your role cannot edit forms.","Forms"))return;const n=a.questions.findIndex(l=>l.id===e),i=n+t;if(n<0||i<0||i>=a.questions.length)return;const[o]=a.questions.splice(n,1);a.questions.splice(i,0,o),s.selectedQuestionId=e,ie("Question moved"),p()}function Gm(e){const t=De(),a=t?.questions.find(n=>n.id===e);a&&y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms")&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),ie("Option added"),p())}function Zm(e,t){const a=De(),n=a?.questions.find(i=>i.id===e);!n||t<0||y("forms.manage",a.company_id,"Your role cannot edit forms.","Forms")&&(n.options.splice(t,1),n.options.length||n.options.push("Option 1"),ie("Option removed"),p())}function Xm(e){const t=Ie(e.dataset.formId);if(!t)return;const a=new FormData(e),n={};t.questions.forEach(i=>{const o=`answer:${i.id}`,l=a.getAll(o).filter(c=>c instanceof File?c.name:String(c||"").trim());n[i.id]=l.length>1?l.map(c=>c instanceof File?c.name:c):l[0]instanceof File?l[0].name:l[0]||""}),s.formResponses.unshift(ns({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||b().profile.full_name||"Preview submitter"),answers:n,created_at:new Date().toISOString()})),s.formsTab="responses",s.modal="",ie("Preview response saved"),J(t.require_approval?"approval.form":"form.response",t.require_approval?"Form approval ready":"Form response saved",`${Y()} saved a response for ${t.title}.`,m("forms",{form_id:t.id,tab:"responses"},t.company_id),"form_response",t.id,t.company_id),p()}function ep(e,t,a="text/plain"){const n=new Blob([t],{type:a}),i=URL.createObjectURL(n),o=document.createElement("a");o.href=i,o.download=e,o.click(),URL.revokeObjectURL(i)}function ba(e){return JSON.parse(JSON.stringify(e))}function z(e){return Array.from(new Set(e.map(t=>String(t||"").trim()).filter(Boolean)))}function Ce(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||T(e)}function Ye(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||T(e)}function _e(e){return jn.find(([t])=>t===e)?.[1]||s.driveFolders.find(t=>t.id===e)?.name||T(e||"Shared")}function tp(e=u()){return jn.map(([t,a])=>[t,a]).concat(Dt(e).map(t=>[t.id,t.name]))}function ap(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function zr(e,t="Folder"){return Kr("default_folder.svg",t||"Folder")}function Jr(e,t="File"){return Kr(np(e),t||Fe(e))}function Kr(e,t){return`<img class="asset-icon" src="${r(uo+e)}" alt="${r(t)}" loading="lazy" draggable="false" referrerpolicy="no-referrer" />`}function np(e){const t=Za(e),a={pdf:"file_type_pdf.svg",doc:"file_type_word.svg",docx:"file_type_word.svg",odt:"file_type_word.svg",rtf:"file_type_word.svg",xls:"file_type_excel.svg",xlsx:"file_type_excel.svg",xlsm:"file_type_excel.svg",ods:"file_type_excel.svg",csv:"file_type_excel.svg",ppt:"file_type_powerpoint.svg",pptx:"file_type_powerpoint.svg",pps:"file_type_powerpoint.svg",odp:"file_type_powerpoint.svg",zip:"file_type_zip.svg",rar:"file_type_zip.svg","7z":"file_type_zip.svg",tar:"file_type_zip.svg",gz:"file_type_zip.svg",tgz:"file_type_zip.svg",txt:"file_type_text.svg",log:"file_type_text.svg",md:"file_type_markdown.svg",json:"file_type_json.svg",html:"file_type_html.svg",htm:"file_type_html.svg",css:"file_type_css.svg",scss:"file_type_css.svg",js:"file_type_js.svg",jsx:"file_type_js.svg",ts:"file_type_js.svg",tsx:"file_type_js.svg",xml:"file_type_xml.svg",yml:"file_type_yaml.svg",yaml:"file_type_yaml.svg",svg:"file_type_svg.svg",ai:"file_type_ai.svg",psd:"file_type_photoshop.svg"};if(a[t])return a[t];const n=Ga(e);return n==="image"?"file_type_image.svg":n==="video"?"file_type_video.svg":n==="audio"?"file_type_audio.svg":n==="text"?"file_type_text.svg":n==="code"?"file_type_js.svg":n==="archive"?"file_type_zip.svg":"default_file.svg"}function T(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function D(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function x(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function _a(e){if(!e)return"No time";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(t)}function ft(e){const t=new Date(e);if(!e||Number.isNaN(t.getTime()))return"just now";const a=Math.max(0,Math.floor((Date.now()-t.getTime())/1e3));if(a<45)return"just now";const n=Math.floor(a/60);if(n<60)return`${n}m ago`;const i=Math.floor(n/60);if(i<24)return`${i}h ago`;const o=Math.floor(i/24);return o<7?`${o}d ago`:x(e)}function sa(e){const t=Math.max(0,Math.floor(R(e)/1e3)),a=Math.floor(t/3600),n=Math.floor(t%3600/60);return a?`${a}h ${String(n).padStart(2,"0")}m`:`${n}m`}function ps(e){const t=R(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],n=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**n).toFixed(n?1:0)} ${a[n]}`}function Et(e){return(t,a)=>Date.parse(a[e]||a.updated_at||a.created_at||0)-Date.parse(t[e]||t.updated_at||t.created_at||0)}function Gr(e){if(!e)return 0;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?0:Math.floor((gt().getTime()-t.getTime())/864e5)}function Xs(e){if(!e)return 999;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?999:Math.floor((t.getTime()-gt().getTime())/864e5)}function sp(e=u()){const t=(pt(Ba(e)||{short_name:e})||e||"QH").replace(/[^a-z]/gi,"").slice(0,2).toUpperCase()||"QH",a=we(e).length+1;return`${t}-${String(1e3+a)}`}function gt(){const e=new Date;return e.setHours(0,0,0,0),e}function ip(e,t){return`${Zr(e,t)}%`}function Zr(e,t){const a=R(t);return a?Math.max(0,Math.min(100,Math.round(R(e)/a*100))):0}function lt(e){return{critical:5,urgent:4,high:3,medium:2,low:1}[String(e||"").toLowerCase()]||0}function Gt(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function ge(e,t){return e.reduce((a,n)=>a+R(n[t]),0)}function R(e){const t=Number(e);return Number.isFinite(t)?t:0}function Tt(e){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(e||""))}function va(e){const t=String(e||"").trim();return Tt(t)||/^[0-9a-f]{8,}$/i.test(t)||/^user[_-]?[0-9a-f-]{8,}$/i.test(t)}function Xr(e){const t=String(e||"").trim();return t?t.slice(0,8):""}function j(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(R(e))}function de(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function q(e,t){const a=de(e,t);return Array.isArray(a)&&a.length?a:t}function k(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
