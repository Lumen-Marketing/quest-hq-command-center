(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const vr="/quest-hq-command-center/assets/quest-secure-workspace-cockpit-tight-CMTSEVW0.png",Je={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://lpzotcznihwyyudxycmd.supabase.co",supabaseKey:"sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07"},He=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),Ke="quest-hq-local-session",On="quest-hq-local-profile",si="quest-hq-job-cache-v2",ri="quest-hq-task-cache-v1",oi="quest-hq-file-cache-v1",li="quest-hq-drive-folder-cache-v1",ci="quest-hq-team-cache-v1",di="quest-hq-company-membership-cache-v1",rt="quest-hq-company-form-cache-v1",ba="quest-hq-company-form-response-cache-v1",ui="quest-hq-finance-invoice-cache-v1",mi="quest-hq-finance-payment-cache-v1",pi="quest-hq-finance-expense-cache-v1",fi="quest-hq-finance-vendor-cache-v1",_a="quest-hq-time-entry-cache-v1",va="quest-hq-active-timer-v1",Ce="quest-hq-active-company",gi="quest-hq-pending-workspace-review-v1",Rn="quest-hq-task-view",Pn="quest-hq-drive-view",Un="quest-hq-sidebar-collapsed",ya="quest-hq-notification-cache-v1",ha="quest-hq-message-conversation-cache-v1",wa="quest-hq-message-access-cache-v1",$a="quest-hq-message-cache-v1",Sa="quest-hq-message-read-cache-v1",ka="quest-hq-message-attachment-cache-v1",Da="quest-hq-calendar-event-cache-v1",Ge={developer:["*"],admin:["*"],owner:["*"],manager:["jobs.view","jobs.manage","tasks.view","tasks.manage","files.view","files.manage","forms.view","forms.manage","finance.view","team.view","clock.manage","approvals.manage","approvals.view","calendar.view","calendar.manage","calendar.view_team","users.view","settings.view","billing.view","roles.view","messages.view","messages.send","messages.create_group","messages.manage_groups","messages.attach_files"],member:["jobs.view","tasks.view","tasks.manage","files.view","forms.view","time.track","approvals.view","calendar.view","users.view","messages.view","messages.send","messages.attach_files"]},Nn=[["jobs.view","View jobs"],["jobs.manage","Create/edit jobs"],["tasks.view","View tasks"],["tasks.manage","Create/edit tasks"],["files.view","View files"],["files.manage","Upload/delete files"],["forms.view","View forms"],["forms.manage","Create/edit forms"],["crm.view","View CRM"],["finance.view","View finance"],["finance.manage","Create/edit finance"],["users.view","View users"],["users.manage","Invite/manage users"],["roles.view","View roles"],["roles.manage","Create/edit roles"],["billing.view","View billing"],["billing.manage","Manage subscription"],["settings.view","View settings"],["settings.manage","Manage settings"],["time.track","Track own time"],["clock.manage","Manage clock dashboard"],["approvals.view","View approvals"],["approvals.manage","Manage approvals"],["calendar.view","View calendar"],["calendar.manage","Create/edit calendar events"],["calendar.view_team","View team calendar"],["messages.view","View messages"],["messages.send","Send messages"],["messages.create_group","Create group chats"],["messages.manage_groups","Manage group chats"],["messages.attach_files","Attach files/images"],["messages.delete_own","Delete own messages"],["messages.delete_any","Delete any messages"],["messages.manage","Manage messages (compatibility)"]],yr={"messages.manage":["messages.manage_groups"],"messages.manage_groups":["messages.manage"]},ot=[{id:"home",group:"Workspace",label:"Home",icon:"ti-home",symbol:"q-logo",status:"live",permission:""},{id:"jobs",group:"Workspace",label:"Jobs",icon:"ti-briefcase",symbol:"q-symbol-jobs",status:"live",permission:"jobs.view"},{id:"tasks",group:"Workspace",label:"Tasks",icon:"ti-list-check",symbol:"q-symbol-tasks",status:"live",permission:"tasks.view"},{id:"files",group:"Workspace",label:"Files",icon:"ti-folder",symbol:"q-symbol-files",status:"live",permission:"files.view"},{id:"forms",group:"Workspace",label:"Forms",icon:"ti-clipboard-list",symbol:"q-symbol-forms",status:"live",permission:"forms.view"},{id:"analytics",group:"Workspace",label:"Analytics",icon:"ti-chart-bar",symbol:"q-symbol-analytics",status:"live",permission:"jobs.view"},{id:"crm",group:"Workspace",label:"CRM",icon:"ti-users-group",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"tickets",group:"Workspace",label:"Tickets",icon:"ti-ticket",symbol:"q-symbol-tickets",status:"planned"},{id:"finance",group:"Workspace",label:"Finance",icon:"ti-receipt-dollar",symbol:"q-symbol-finance",status:"live",permission:"finance.view"},{id:"knowledge",group:"Workspace",label:"Knowledge Base",icon:"ti-books",symbol:"q-symbol-knowledge",status:"planned"},{id:"automations",group:"Workspace",label:"Automations",icon:"ti-automation",symbol:"q-symbol-automations",status:"planned"},{id:"templates",group:"Workspace",label:"Templates",icon:"ti-template",symbol:"q-symbol-templates",status:"planned"},{id:"users",group:"Company",label:"Users",icon:"ti-users",symbol:"q-symbol-users",status:"live",permission:"users.view"},{id:"messages",group:"Company",label:"Messages",icon:"ti-messages",symbol:"q-symbol-messages",status:"live",permission:"messages.view"},{id:"settings",group:"Company",label:"Settings",icon:"ti-settings",symbol:"q-symbol-settings",status:"live",permission:"settings.view"},{id:"team-chart",group:"Company",label:"Team chart",icon:"ti-hierarchy-3",symbol:"q-symbol-team-chart",status:"live",permission:"team.view"},{id:"time",group:"Operations",label:"My time",icon:"ti-clock",symbol:"q-symbol-time",status:"live",permission:"time.track"},{id:"calendar",group:"Operations",label:"Calendar",icon:"ti-calendar",symbol:"q-symbol-calendar",status:"live",permission:"calendar.view"},{id:"approvals",group:"Operations",label:"Approvals",icon:"ti-user-check",symbol:"q-symbol-approvals",status:"live",permission:"approvals.view"},{id:"team-workload",group:"Operations",label:"Team workload",icon:"ti-users",symbol:"q-symbol-team-workload",status:"planned"},{id:"clock",group:"Operations",label:"Clock dashboard",icon:"ti-clock-hour-4",symbol:"q-symbol-clock",status:"live",permission:"clock.manage"}],hr=[{label:"Command",ids:["home","messages","calendar"]},{label:"Work",ids:["jobs","tasks","files","forms","crm"]},{label:"Money",ids:["finance","analytics"]},{label:"People",ids:["users","team-chart","time","approvals","clock"]},{label:"Control",ids:["settings"]},{label:"Future",ids:["tickets","knowledge","automations","templates","team-workload"]}],wr={"/admin.html":"settings","/automations.html":"automations","/calendar.html":"calendar","/crm.html":"crm","/dashboards.html":"analytics","/files.html":"files","/finance.html":"finance","/forms.html":"forms","/jobs.html":"jobs","/knowledge.html":"knowledge","/messages.html":"messages","/templates.html":"templates","/tickets.html":"tickets"},Mt=["Lead","Site Review","Estimate","Approved","Active","Closed"],Ln=["pipeline","list","profile"],Ft=["todo","pending","hold","review","done"],na=["critical","urgent","high","medium","low"],Qn=["lead","bid","admin","invoicing","ar","meeting","web_dev"],Ca=["Company event","Job visit / inspection","Estimate appointment","Install / field work","Internal meeting","Personal reminder"],$r=["Task due","Invoice due","Approval","Time"].concat(Ca),Sr="https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons@master/icons/",kr=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],bi=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],It=["Inspection","Client approval","Intake","Survey","Safety","Internal"],_i=["Draft","Published","Archived"],Vn=["Draft","Sent","Partially paid","Paid","Overdue","Void"],Yn=["Pending","Approved","Paid","Rejected"],Bn=["Active","On hold","Inactive"],Hn=["ACH","Check","Card","Cash","Wire","Other"],ja=["Materials","Labor","Subcontractor","Permit","Equipment","Marketing","Software","Travel","Other"],vi=["company","role","custom","direct"],Tt=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],Et=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],Wn=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],zn=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"],supervisor_id:""},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"],supervisor_id:"abraham"},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"],supervisor_id:"maya"},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"],supervisor_id:"abraham"},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"],supervisor_id:""}],Jn=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],Kn=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:k(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:k(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:k(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:k(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:k(5),priority:"medium",urgency:"medium",status:"todo"}],Gn=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],Zn=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",creator_id:"abraham",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",creator_id:"maya",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",creator_id:"noah",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",creator_id:"lumen-ops",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],Xn=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],es=[{id:"vendor-roofing-materials",company_id:"roofing",name:"Valley Roofing Supply",contact_name:"Elena Ortiz",email:"orders@valleyroofingsupply.local",phone:"(480) 555-0190",category:"Materials",status:"Active",notes:"Primary tile, flashing, and underlayment vendor.",created_at:new Date(Date.now()-12096e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"vendor-roofing-dryin",company_id:"roofing",name:"Monsoon Dry-In Crew",contact_name:"R. Alvarez",email:"dispatch@monsoondryin.local",phone:"(602) 555-0144",category:"Subcontractor",status:"Active",notes:"Emergency dry-in support during storm calls.",created_at:new Date(Date.now()-10368e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"vendor-drafting-permits",company_id:"drafting",name:"Permit Runner AZ",contact_name:"Sofia Chen",email:"permits@runneraz.local",phone:"(602) 555-0171",category:"Permit",status:"Active",notes:"Permit filing support for drafting packets.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString()},{id:"vendor-lumen-software",company_id:"lumen",name:"Lumen SaaS Stack",contact_name:"Ops Billing",email:"billing@lumenstack.local",phone:"",category:"Software",status:"Active",notes:"Internal software subscriptions for client onboarding.",created_at:new Date(Date.now()-7776e5).toISOString(),updated_at:new Date(Date.now()-3456e5).toISOString()}],ts=[{id:"invoice-roofing-queen-creek",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",client_name:"Rosales Residence",invoice_number:"QR-1007",status:"Partially paid",issue_date:k(-10),due_date:k(5),subtotal:6800,tax:0,total:6800,notes:"Emergency leak repair billing with deposit received.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"invoice-roofing-mesa-storage",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",client_name:"Mesa Storage Partners",invoice_number:"QR-1008",status:"Sent",issue_date:k(-18),due_date:k(-2),subtotal:18400,tax:0,total:18400,notes:"Estimate packet sent to board for approval.",created_at:new Date(Date.now()-15552e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-drafting-horizon",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",client_name:"Horizon HVAC",invoice_number:"QD-2031",status:"Sent",issue_date:k(-7),due_date:k(14),subtotal:4200,tax:0,total:4200,notes:"Drafting permit package milestone invoice.",created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-lumen-onboarding",company_id:"lumen",job_id:"",client_name:"Lumen Internal Launch",invoice_number:"LM-3004",status:"Draft",issue_date:k(-3),due_date:k(27),subtotal:3200,tax:0,total:3200,notes:"Demo onboarding package used for finance workspace.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()}],as=[{id:"payment-roofing-queen-creek-deposit",company_id:"roofing",invoice_id:"invoice-roofing-queen-creek",amount:2500,method:"ACH",received_at:k(-4),reference:"ACH-4421",notes:"Deposit received after dry-in visit.",created_at:new Date(Date.now()-3456e5).toISOString()},{id:"payment-drafting-horizon-retainer",company_id:"drafting",invoice_id:"invoice-drafting-horizon",amount:1e3,method:"Check",received_at:k(-1),reference:"CHK-117",notes:"Retainer collected before permit packet completion.",created_at:new Date(Date.now()-864e5).toISOString()}],is=[{id:"expense-roofing-queen-creek-materials",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",vendor_id:"vendor-roofing-materials",category:"Materials",amount:1850,status:"Approved",spent_at:k(-6),notes:"Underlayment, flashing, and tile replacement materials.",created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-roofing-mesa-permit",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",vendor_id:"vendor-roofing-materials",category:"Permit",amount:620,status:"Pending",spent_at:k(-2),notes:"Permit and document prep allowance.",created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString()},{id:"expense-drafting-horizon-runner",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",vendor_id:"vendor-drafting-permits",category:"Permit",amount:480,status:"Approved",spent_at:k(-3),notes:"Permit runner package review.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-lumen-software-stack",company_id:"lumen",job_id:"",vendor_id:"vendor-lumen-software",category:"Software",amount:540,status:"Paid",spent_at:k(-5),notes:"Client onboarding software stack.",created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()}],ns=[{id:"notification-roofing-task-assigned",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.assigned",title:"Task assigned",body:"Abraham assigned Leak inspection photos to you.",href:"/company/roofing/tasks?job_id=roofing-leak&task_id=task-roofing-leak-1",source_type:"task",source_id:"task-roofing-leak-1",read_at:"",created_at:new Date(Date.now()-7*6e4).toISOString()},{id:"notification-roofing-task-priority",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.priority",title:"Task priority changed",body:"Shan set priority to Urgent on HOA board approval package.",href:"/company/roofing/tasks?job_id=roofing-mesa&task_id=task-roofing-mesa-1",source_type:"task",source_id:"task-roofing-mesa-1",read_at:"",created_at:new Date(Date.now()-19*6e4).toISOString()},{id:"notification-roofing-approval",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"approval.ready",title:"Approval needs review",body:"Estimate approval is waiting in the company review queue.",href:"/company/roofing/approvals",source_type:"form",source_id:"form-roofing-estimate-approval",read_at:new Date(Date.now()-5*6e4).toISOString(),created_at:new Date(Date.now()-44*6e4).toISOString()},{id:"notification-drafting-task-review",company_id:"drafting",recipient_profile_id:"basic-quest-user",type:"task.status",title:"Task moved to review",body:"Drawing package QA is ready for review.",href:"/company/drafting/tasks?job_id=drafting-package&task_id=task-drafting-package-1",source_type:"task",source_id:"task-drafting-package-1",read_at:"",created_at:new Date(Date.now()-63*6e4).toISOString()},{id:"notification-lumen-finance",company_id:"lumen",recipient_profile_id:"basic-quest-user",type:"finance.invoice",title:"Invoice drafted",body:"Lumen onboarding invoice is ready for payment tracking.",href:"/company/lumen/finance?invoice=invoice-lumen-onboarding",source_type:"invoice",source_id:"invoice-lumen-onboarding",read_at:"",created_at:new Date(Date.now()-92*6e4).toISOString()}],yi=[{id:"msg-conv-roofing-all",company_id:"roofing",title:"Roofing dispatch",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-16*6e4).toISOString(),created_at:new Date(Date.now()-864e5).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-conv-roofing-crew",company_id:"roofing",title:"Roofing crew",type:"role",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-52*6e4).toISOString(),created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-conv-roofing-direct-shan",company_id:"roofing",title:"Shan Kumar",type:"direct",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-8*6e4).toISOString(),created_at:new Date(Date.now()-36e5).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-conv-drafting-all",company_id:"drafting",title:"Drafting review",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-74*6e4).toISOString(),created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-conv-lumen-product",company_id:"lumen",title:"Lumen launch room",type:"custom",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-38*6e4).toISOString(),created_at:new Date(Date.now()-216e5).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],hi=[{id:"msg-access-roofing-all",conversation_id:"msg-conv-roofing-all",company_id:"roofing",target_type:"all_company",target_id:"all"},{id:"msg-access-roofing-crew-role",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",target_type:"role",target_id:"staff-roofing"},{id:"msg-access-roofing-direct-basic",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-roofing-direct-shan",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"shan"},{id:"msg-access-drafting-all",conversation_id:"msg-conv-drafting-all",company_id:"drafting",target_type:"all_company",target_id:"all"},{id:"msg-access-lumen-basic",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-lumen-role",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"role",target_id:"admin-lumen"}],wi=[{id:"msg-roofing-all-1",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"abraham",body:"Morning check: Mesa HOA estimate needs photos before noon.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-48*6e4).toISOString(),updated_at:new Date(Date.now()-48*6e4).toISOString()},{id:"msg-roofing-all-2",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"basic-quest-user",body:"Got it. I am linking the job files now.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-16*6e4).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-roofing-crew-1",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",sender_profile_id:"shan",body:"@Joshua bring the permit packet when you head to Arroyo.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-52*6e4).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-roofing-direct-1",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",sender_profile_id:"shan",body:"Can you confirm the roof access photo uploaded correctly?",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-8*6e4).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-drafting-all-1",conversation_id:"msg-conv-drafting-all",company_id:"drafting",sender_profile_id:"abraham",body:"Horizon package QA is ready. Please keep notes in this thread.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-74*6e4).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-lumen-product-1",conversation_id:"msg-conv-lumen-product",company_id:"lumen",sender_profile_id:"basic-quest-user",body:"Finance and CRM are live enough for internal walkthrough. Next focus is polish and permissions.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-38*6e4).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],$i=[{id:"msg-attachment-roofing-photo",conversation_id:"msg-conv-roofing-crew",message_id:"msg-roofing-crew-1",company_id:"roofing",bucket_id:"quest-message-attachments",object_path:"",file_name:"roof-access-photo.jpg",mime_type:"image/jpeg",size_bytes:184e3,preview_url:"",created_at:new Date(Date.now()-52*6e4).toISOString()}],Si=[{conversation_id:"msg-conv-roofing-all",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:new Date(Date.now()-10*6e4).toISOString()},{conversation_id:"msg-conv-roofing-crew",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-drafting-all",company_id:"drafting",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-lumen-product",company_id:"lumen",profile_id:"basic-quest-user",last_read_at:""}],ss=[{id:"calendar-roofing-install",company_id:"roofing",title:"East ridge install window",description:"Crew visit for install prep and materials check.",event_type:"Install / field work",starts_at:`${k(1)}T14:00:00.000Z`,ends_at:`${k(1)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"job",linked_id:"job-east-ridge",assigned_profile_id:"abraham",created_by:"basic-quest-user"},{id:"calendar-roofing-estimate",company_id:"roofing",title:"Garage roof estimate",description:"Client walkthrough and estimate appointment.",event_type:"Estimate appointment",starts_at:`${k(3)}T16:00:00.000Z`,ends_at:`${k(3)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"shan",created_by:"basic-quest-user"},{id:"calendar-drafting-review",company_id:"drafting",title:"Plan review block",description:"Drafting team review for active plan updates.",event_type:"Internal meeting",starts_at:`${k(2)}T15:00:00.000Z`,ends_at:`${k(2)}T15:45:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"",created_by:"basic-quest-user"},{id:"calendar-lumen-product",company_id:"lumen",title:"Quest HQ product review",description:"Review workspace permissions, messages, and calendar flow.",event_type:"Company event",starts_at:`${k(4)}T18:00:00.000Z`,ends_at:`${k(4)}T19:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"basic-quest-user",created_by:"basic-quest-user"}],n={route:null,session:Se(Ke,null),profileDraft:Se(On,null),authReady:!1,authMode:"signin",jobs:A(si,Wn).map(tt),tasks:A(ri,Kn).map(at),files:A(oi,Gn).map($t),driveFolders:A(li,[]).map(Vi),forms:A(rt,Zn).map(Qt),formResponses:A(ba,Xn).map(Yi),financeInvoices:A(ui,ts).map(Vt),financePayments:A(mi,as).map(Yt),financeExpenses:A(pi,is).map(Bt),financeVendors:A(fi,es).map(Ht),notifications:A(ya,ns).map(kt),messageConversations:A(ha,yi).map(ye),messageAccess:A(wa,hi).map(ae),messages:A($a,wi).map(ke),messageReads:A(Sa,Si).map(Wt),messageAttachments:A(ka,$i).map(xe),calendarEvents:A(Da,ss).map(it),timeEntries:Se(_a,[]),activeTimer:Se(va,null),teamMembers:A(ci,zn).map(Bi),memberships:A(di,Jn),profiles:[],subscriptions:[],workspaceReviews:[],roles:[],rolePermissions:[],roleAssignments:[],resourceAcl:[],fieldPermissions:[],companyInvites:[],joinRequests:[],auditEvents:[],companies:Qi(Et.map(et)),activeCompanyId:localStorage.getItem(Ce)||"",sidebarCollapsed:localStorage.getItem(Un)==="true",selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",selectedFinanceInvoiceId:"",selectedFinanceExpenseId:"",selectedFinanceVendorId:"",selectedCalendarEventId:"",inviteLookup:null,expandedFormIds:new Set,formStartTemplateId:"",formStartTab:"blank",query:"",fileQuery:"",formQuery:"",crmQuery:"",stageFilter:"all",crmStageFilter:"all",crmOwnerFilter:"all",messageQuery:"",messageFilter:"all",selectedConversationId:"",messageRealtimeChannel:null,messageRealtimeKey:"",calendarScope:"company",calendarView:"week",calendarQuery:"",calendarTypeFilter:"all",calendarCursorDate:k(0),taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(Rn)||"table",driveFolder:"home",driveView:localStorage.getItem(Pn)||"list",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",authMessage:"",toast:null,toastTimer:null,modal:"",accountMenuOpen:!1,notificationMenuOpen:!1,rolePreview:null},qa=document.getElementById("app");let Ja=null;Dr();function Dr(){Gc(),window.addEventListener("popstate",p),document.addEventListener("click",ec),document.addEventListener("submit",ic),document.addEventListener("input",Fc),document.addEventListener("change",Ic),Cr(),p()}async function Cr(){if(n.session?.auth==="local-basic"){rs(),n.authReady=!0;return}const e=q();if(!e?.auth){n.authReady=!0,n.loginError="Supabase auth is unavailable in this browser session.";return}try{const{data:t}=await e.auth.getSession();await vt(t?.session||null),e.auth.onAuthStateChange((a,i)=>{vt(i||null).finally(()=>{n.dataLoaded=!1,p()})})}catch(t){n.loginError=t.message||"Unable to initialize Supabase auth."}finally{n.authReady=!0,p()}}async function vt(e){if(!e?.user){n.session=null,localStorage.removeItem(Ke);return}const t=await jr(e.user);n.session=su(e,t),Tr(),D(Ke,n.session)}async function jr(e){const t={id:e.id,email:e.email||"",full_name:e.user_metadata?.full_name||e.email||"Quest user",role:"member",role_label:"Member",member_id:"",company_ids:[],avatar_url:"",approved:!1,email_verified:!!e.email_confirmed_at},a=q();if(!a)return t;const i=await a.from("profiles").select("*").eq("id",e.id).maybeSingle();return i.error||!i.data?t:St(i.data,t)}function p(){if(n.route=xt(),!n.authReady){Mr();return}if(n.route.name==="home"){yn(!1);return}if(n.route.name==="login"){yn(!0);return}if(Ar(n.route)){j("/login?return_url="+encodeURIComponent(Xc()),{replace:!0});return}if(Fr(),n.session?.auth==="supabase"&&n.dataLoaded&&!Ue().length){qr();return}const e=Zc(n.route);if(e){j(e,{replace:!0});return}nd(n.route),$s(n.route),n.route.params.get("account")==="profile"&&(n.modal="profile"),document.title=`${ed(n.route)} | ${I(u())} | Quest HQ`,qa.innerHTML=Or(n.route,cs(n.route))}function qr(){document.title="Company access pending | Quest HQ",qa.innerHTML=`
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
  `}function Ar(e){return e.name==="login"||e.name==="home"?!1:!n.session}function Mr(){document.title="Loading | Quest HQ",qa.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${v("Checking secure session...")}
      </section>
    </main>
  `}function Fr(){n.dataLoaded||n.dataLoading||(n.dataLoading=!0,Ir().catch(()=>{n.sync={label:"Local fallback",mode:"local"}}).finally(()=>{n.dataLoaded=!0,n.dataLoading=!1,te(),p()}))}async function Ir(){if(n.session?.auth==="local-basic"){n.sync={label:"Demo mode",mode:"local"};return}const e=q();if(!e){n.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,i,s,o,l,d,c,f,g,S,V,x,ne,Fe,N,tn,an,nn,sn,rn,on,ln,cn,dn,un,mn]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*"),e.from("profiles").select("*"),e.from("company_subscriptions").select("*"),e.from("roles").select("*").order("priority",{ascending:!1}),e.from("role_permissions").select("*"),e.from("user_role_assignments").select("*"),e.from("resource_acl").select("*"),e.from("field_permissions").select("*"),e.from("company_invites").select("*").order("created_at",{ascending:!1}),e.from("company_join_requests").select("*").order("created_at",{ascending:!1}),e.from("audit_events").select("*").order("created_at",{ascending:!1}).limit(100),e.from("message_conversations").select("*").order("last_message_at",{ascending:!1}),e.from("message_conversation_access").select("*"),e.from("messages").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_attachments").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_reads").select("*"),e.from("calendar_events").select("*").order("starts_at",{ascending:!0}),e.from("notifications").select("*").order("created_at",{ascending:!1}).limit(200),e.from("finance_invoices").select("*").order("updated_at",{ascending:!1}),e.from("finance_payments").select("*").order("received_at",{ascending:!1}),e.from("finance_expenses").select("*").order("spent_at",{ascending:!1}),e.from("finance_vendors").select("*").order("name",{ascending:!0})]);let le=0;if(t.error||(n.companies=(t.data||[]).map(et),le+=1),a.error||(n.jobs=(a.data||[]).map(tt),le+=1),i.error||(n.tasks=(i.data||[]).map(at),le+=1),s.error||(n.files=(s.data||[]).map($t),le+=1),o.error||(n.teamMembers=(o.data||[]).map(Bi),le+=1),l.error||(n.memberships=(l.data||[]).map(da),le+=1),d.error||(n.profiles=(d.data||[]).map(Jt=>St(Jt)),le+=1),c.error||(n.subscriptions=(c.data||[]).map(ua),le+=1),f.error||(n.roles=(f.data||[]).map(We),le+=1),g.error||(n.rolePermissions=(g.data||[]).map(ai)),S.error||(n.roleAssignments=(S.data||[]).map(Ys)),V.error||(n.resourceAcl=(V.data||[]).map(Vd)),x.error||(n.fieldPermissions=(x.data||[]).map(Yd)),ne.error||(n.companyInvites=(ne.data||[]).map(ma)),Fe.error||(n.joinRequests=(Fe.data||[]).map(Bs)),N.error||(n.auditEvents=N.data||[]),tn.error||(n.messageConversations=(tn.data||[]).map(ye)),an.error||(n.messageAccess=(an.data||[]).map(ae)),nn.error||(n.messages=(nn.data||[]).map(ke)),sn.error||(n.messageAttachments=(sn.data||[]).map(xe)),rn.error||(n.messageReads=(rn.data||[]).map(Wt)),on.error||(n.calendarEvents=(on.data||[]).map(it)),ln.error||(n.notifications=(ln.data||[]).map(kt)),cn.error||(n.financeInvoices=(cn.data||[]).map(Vt),le+=1),dn.error||(n.financePayments=(dn.data||[]).map(Yt)),un.error||(n.financeExpenses=(un.data||[]).map(Bt)),mn.error||(n.financeVendors=(mn.data||[]).map(Ht)),Li()){const Jt=await e.rpc("list_workspace_reviews").catch(za=>({error:za}));if(!Jt.error){n.workspaceReviews=(Jt.data||[]).map(bt);const za=n.workspaceReviews.map(re=>et({id:re.company_id,name:re.company_name,short_name:re.company_name})),_r=n.workspaceReviews.map(re=>ua({company_id:re.company_id,status:re.status,plan_code:re.plan_code,amount_cents:re.amount_cents,currency:re.currency,trial_ends_at:re.trial_ends_at,current_period_end:re.current_period_end,grace_ends_at:re.grace_ends_at}));n.companies=Qi(n.companies.concat(za)),n.subscriptions=Vs(n.subscriptions.concat(_r))}}n.sync=le?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function q(){return!window.supabase||typeof window.supabase.createClient!="function"?null:(Ja||(Ja=window.supabase.createClient(Je.supabaseUrl,Je.supabaseKey)),Ja)}function Tr(){n.jobs=[],n.tasks=[],n.files=[],n.driveFolders=[],n.forms=[],n.formResponses=[],n.financeInvoices=[],n.financePayments=[],n.financeExpenses=[],n.financeVendors=[],n.notifications=[],n.messageConversations=[],n.messageAccess=[],n.messages=[],n.messageReads=[],n.messageAttachments=[],n.calendarEvents=[],n.timeEntries=[],n.activeTimer=null,n.teamMembers=[],n.memberships=[],n.profiles=[],n.subscriptions=[],n.workspaceReviews=[],n.roles=[],n.rolePermissions=[],n.roleAssignments=[],n.resourceAcl=[],n.fieldPermissions=[],n.companyInvites=[],n.joinRequests=[],n.auditEvents=[],n.companies=[],n.sync={label:"Loading secure workspace...",mode:"loading"}}function rs(){n.jobs=A(si,Wn).map(tt),n.tasks=A(ri,Kn).map(at),n.files=A(oi,Gn).map($t),n.driveFolders=A(li,[]).map(Vi),n.forms=A(rt,Zn).map(Qt),n.formResponses=A(ba,Xn).map(Yi),n.financeInvoices=A(ui,ts).map(Vt),n.financePayments=A(mi,as).map(Yt),n.financeExpenses=A(pi,is).map(Bt),n.financeVendors=A(fi,es).map(Ht),n.notifications=A(ya,ns).map(kt),n.messageConversations=A(ha,yi).map(ye),n.messageAccess=A(wa,hi).map(ae),n.messages=A($a,wi).map(ke),n.messageReads=A(Sa,Si).map(Wt),n.messageAttachments=A(ka,$i).map(xe),n.calendarEvents=A(Da,ss).map(it),n.timeEntries=Se(_a,[]),n.activeTimer=Se(va,null),n.teamMembers=A(ci,zn).map(Bi),n.memberships=A(di,Jn),n.profiles=[],n.subscriptions=[],n.workspaceReviews=[],n.roles=[],n.rolePermissions=[],n.roleAssignments=[],n.resourceAcl=[],n.fieldPermissions=[],n.companyInvites=[],n.joinRequests=[],n.auditEvents=[],n.companies=Qi(Et.map(et)),n.sync={label:"Demo mode",mode:"local"}}function Er(){return`
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
  `}function Y(e,t="symbol-icon"){return`<svg class="${r(t)}" aria-hidden="true" focusable="false"><use href="#${r(e)}"></use></svg>`}function os(e=n.route?.section||"jobs"){return ot.find(t=>t.id===e)?.symbol||"q-empty"}function xr(e){const t=String(e||"").toLowerCase();return t.includes("job")||t.includes("pipeline")?"q-symbol-jobs":t.includes("task")||t.includes("review")?"q-symbol-tasks":t.includes("file")?"q-symbol-files":t.includes("form")?"q-symbol-forms":t.includes("account")||t.includes("customer")||t.includes("member")||t.includes("user")||t.includes("lead")?"q-symbol-crm":t.includes("invoice")||t.includes("collected")||t.includes("expense")||t.includes("net")||t.includes("outstanding")?"q-symbol-finance":t.includes("time")||t.includes("today")||t.includes("days")||t.includes("timer")||t.includes("entries")?"q-symbol-clock":t.includes("approval")||t.includes("access")?"q-symbol-approvals":os()}function Or(e,t){const a=b(),i=u(),s=ou(a);return`
    <div class="quest-app ${n.sidebarCollapsed?"sidebar-collapsed":""}" data-route="${r(e.name)}">
      ${Er()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${_(m("home",{},i))}" data-router aria-label="Quest HQ workspace">
            ${Y("q-logo","brand-symbol")}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${r(Je.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${Y("q-company")}
            <select data-company-switch aria-label="Active company">
              ${Ui().map(o=>`<option value="${r(o.id)}" ${o.id===i?"selected":""}>${r(Nt(o))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            ${Y("q-search")}
            <input data-global-search value="${r(n.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${r(n.sync.mode)}" data-sync-state>${r(n.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          ${Ur(i)}
          <div class="account-menu ${n.accountMenuOpen?"open":""}">
            <button class="avatar-button" type="button" data-action="toggle-account-menu" aria-label="Open account menu" aria-expanded="${n.accountMenuOpen?"true":"false"}">
              ${Z(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${r(a.profile.full_name)}</strong>
              <span>${r(a.profile.role_label)} - ${r(I(i))}</span>
              ${s?"":`
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
      ${Rr(i)}
      ${Lr(i)}
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${Qr(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
      ${Pr(e,i)}
    </div>
    ${Yl(e,a)}
    ${vs()}
  `}function Rr(e){const t=ie(e).filter(s=>s.status==="active").length,a=K(e).filter(s=>s.status!=="done"&&s.due&&new Date(s.due)<ut()).length,i=ee(e)?"Good":"Pending";return`
    <div class="mobile-status-rail" aria-label="Workspace status">
      <a href="${_(m("settings",{tab:"billing"},e))}" data-router>
        ${Y("q-symbol-approvals")}<span>${r(Na(e))}</span>
      </a>
      <a href="${_(m("users",{},e))}" data-router>
        ${Y("q-symbol-users")}<span>${r(String(t))} active</span>
      </a>
      <a href="${_(m("tasks",{},e))}" data-router>
        ${Y("q-symbol-tasks")}<span>${r(String(a))} overdue</span>
      </a>
      <a href="${_(m("settings",{},e))}" data-router>
        ${Y("q-symbol-settings")}<span>Health: ${r(i)}</span>
      </a>
    </div>
  `}function Pr(e,t){const a=h("messages.view",t)?qi(t):0,i=h("files.view",t)?_e(t).length:"",s=Q(t).length+K(t).filter(o=>o.status!=="done").length;return`
    <nav class="mobile-tabbar" aria-label="Mobile workspace navigation">
      ${mt(e,m("home",{},t),"ti-home","Home","",["home"])}
      ${mt(e,m("jobs",{},t),"ti-layout-grid","Work",s,["jobs","tasks","calendar","crm","finance","forms","users","time","approvals","clock","team-chart"])}
      ${mt(e,m("messages",{},t),"ti-message-circle","Messages",a,["messages"])}
      ${mt(e,m("files",{},t),"ti-folder","Files",i,["files"])}
      ${mt(e,m("settings",{},t),"ti-dots","More","",["settings","analytics"])}
    </nav>
  `}function mt(e,t,a,i,s,o){return`
    <a class="${e.name==="company"&&o.includes(e.section)?"active":""}" href="${_(t)}" data-router>
      <i class="ti ${r(a)}"></i>
      ${s?`<b>${r(String(Math.min(Number(s)||0,99)))}</b>`:""}
      <span>${r(i)}</span>
    </a>
  `}function Ur(e){const t=Ss(e),a=t.filter(i=>!i.read_at).length;return`
    <div class="notification-center ${n.notificationMenuOpen?"open":""}">
      <button class="icon-button notification-button" type="button" data-action="toggle-notifications" aria-label="Open notifications" aria-expanded="${n.notificationMenuOpen?"true":"false"}">
        <i class="ti ti-bell"></i>
        ${a?`<b>${r(String(Math.min(a,99)))}</b>`:""}
      </button>
      <div class="notification-popover" role="dialog" aria-label="Notifications">
        <div class="notification-head">
          <div><strong>Inbox</strong><span>${r(I(e))}</span></div>
          <button type="button" data-action="mark-all-notifications-read" ${a?"":"disabled"}>Mark all read</button>
        </div>
        <div class="notification-list">
          ${t.slice(0,12).map(i=>Nr(i)).join("")||v("No notifications yet.")}
        </div>
      </div>
    </div>
  `}function Nr(e){return`
    <button class="notification-item ${e.read_at?"read":"unread"}" type="button" data-action="open-notification" data-notification-id="${r(e.id)}">
      <span></span>
      <div>
        <small>${r(Xs(e.type))} - ${r(e.title)} - ${r(dt(e.created_at))}</small>
        <strong>${r(e.body)}</strong>
      </div>
    </button>
  `}function Lr(e){const t=Oa(e);return t?`
    <div class="role-preview-banner" style="--role-color:${r(t.color)}">
      <span></span>
      <div>
        <strong>Viewing as ${r(t.name)}</strong>
        <small>Permission preview only. Your real account has not changed.</small>
      </div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
  `:""}function Qr(e){const t=u(),a=b(),i=new Map(ot.map(s=>[s.id,s]));return`
    <div class="deck-brand">
      <a class="logo" href="${_(m("home",{},t))}" data-router aria-label="Quest HQ home">
        ${Y("q-logo","brand-symbol")}
      </a>
      <span><strong>Quest HQ</strong><small>Command Center</small></span>
      <button class="deck-toggle" type="button" data-action="toggle-sidebar" aria-label="${n.sidebarCollapsed?"Expand navigation":"Collapse navigation"}" aria-expanded="${n.sidebarCollapsed?"false":"true"}">
        <i class="ti ${n.sidebarCollapsed?"ti-layout-sidebar-right-expand":"ti-layout-sidebar-left-collapse"}"></i>
      </button>
    </div>
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${r(qe(t))}">${Y("q-company")}</span>
      <div>
        <strong>${r(I(t))}</strong>
        <small>${r(Xe(t))} workspace</small>
      </div>
    </div>
    <div class="deck-scroll">
      ${hr.map(s=>{const o=s.ids.map(l=>i.get(l)).filter(l=>l&&ls(l,t)).map(l=>l.status==="planned"?Br(l.symbol,l.label):Yr(e,m(l.id,{},t),l.symbol,l.label,Hr(l.id,t)));return Vr(s.label,o)}).join("")}
    </div>
    <div class="deck-footer">
      <a class="deck-company-switch" href="${_(m("settings",{tab:"company"},t))}" data-router>
        ${Y("q-company")}
        <span><strong>${r(I(t))}</strong><small>Workspace</small></span>
        <i class="ti ti-chevron-down"></i>
      </a>
      <button class="deck-user-card" type="button" data-action="open-profile">
        ${Z(a.profile,"avatar small")}
        <span><strong>${r(a.profile.full_name)}</strong><small>${r(Xe(t))}</small></span>
        <i class="ti ti-dots-vertical"></i>
      </button>
    </div>
  `}function Vr(e,t){return t.length?`
    <section class="side-group">
      <div class="side-label">${r(e)}</div>
      <div class="side-items">${t.join("")}</div>
    </section>
  `:""}function Yr(e,t,a,i,s=""){return`
    <a class="side-item ${td(e,t)?"active":""}" href="${_(t)}" data-router title="${r(i)}" aria-label="${r(i)}">
      ${Y(a)}
      <span>${r(i)}</span>
      ${s!==""?`<b>${r(String(s))}</b>`:""}
    </a>
  `}function Br(e,t){return`
    <button class="side-item planned" type="button" disabled aria-disabled="true" title="${r(t)}" aria-label="${r(t)}">
      ${Y(e)}
      <span>${r(t)}</span>
      <b>Planned</b>
    </button>
  `}function ls(e,t=u()){return e.id==="home"||e.status==="planned"?!0:!ee(t)&&!["settings","users"].includes(e.id)?!1:h(e.permission||`${e.id}.view`,t)}function Hr(e,t=u()){return e==="jobs"?Q(t).length:e==="tasks"?K(t).length:e==="files"?_e(t).length:e==="forms"?he(t).length:e==="crm"?Pt(t).length:e==="finance"?ve(t).length:e==="users"?ie(t).filter(a=>a.status==="active").length:e==="messages"?qi(t)||Oe(t).length:e==="calendar"?Cs(t).length:e==="time"?Es(t).focus.length:e==="approvals"?Ti(t).length:e==="clock"&&Ut(t)?"On":""}function ki(e,t){return`
    <nav class="tabbar compact-tabbar" aria-label="${r(e)}">
      ${t.map(([a,i,s])=>`<a class="${s?"active":""}" href="${_(a)}" data-router>${r(i)}</a>`).join("")}
    </nav>
  `}function cs(e){if(e.name==="command")return Kr(u());if(e.name!=="company")return vn(e.name);const t=e.companyId;if(n.session?.auth==="supabase"&&!Ue().includes(t))return Jr(t);const a=ot.find(i=>i.id===e.section);if(e.section==="home")return ds(t);if(a?.status!=="planned"){if(!ee(t)&&e.section!=="settings")return Wr(t);if(a?.permission&&!h(a.permission,t))return zr(t,a.permission)}return e.section==="jobs"?lo(e,t):e.section==="tasks"?fo(e,t):e.section==="files"?yo(e,t):e.section==="users"?Io(e,t):e.section==="settings"?Ro(e,t):e.section==="forms"?Bo(t):e.section==="analytics"?oo(e,t):e.section==="crm"?il(e,t):e.section==="finance"?kl(e,t):e.section==="messages"?sl(e,t):e.section==="team-chart"?Oo(t):e.section==="time"||e.section==="calendar"||e.section==="approvals"||e.section==="clock"?Fl(e,t):vn(e.section)}function Wr(e){const t=Pa(e);return`
    ${X(t?"Workspace awaiting approval":"Subscription required",t?"Your company workspace is created. Quest needs to approve billing/access before live company data opens.":"This company workspace needs an active subscription before paid modules can open.",`
      <button class="btn" type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
      <a class="btn btn-primary" href="${_(m("settings",{tab:"billing"},e))}" data-router><i class="ti ti-credit-card"></i>${t?"Review status":"Billing"}</a>
    `)}
    <section class="panel">
      ${W([["Company",I(e)],["Subscription",Na(e)],["Allowed area","Settings, profile, and sign out remain available"],["Next step",t?"Quest approval / billing activation":"Restore billing access"]])}
    </section>
  `}function zr(e,t){return`
    ${X("Access denied","Your role does not include the permission required for this module.",`
      <a class="btn" href="${_(m("settings",{tab:"roles"},e))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${W([["Company",I(e)],["Required permission",t],["Your role",Xe(e)]])}
    </section>
  `}function Jr(e){return`
    ${X("Company access denied","This workspace is not in your active company memberships.",`
      <a class="btn" href="${_(m("jobs",{},u()))}" data-router><i class="ti ti-building"></i>Your workspace</a>
      <a class="btn btn-primary" href="${_("/login?mode=request")}" data-router><i class="ti ti-user-plus"></i>Request access</a>
    `)}
    <section class="panel">
      ${W([["Requested company",I(e)],["Access rule","Active company membership required"],["Your status",oe(e,b().profile.id)?.status?T(oe(e,b().profile.id).status):"No active membership"]])}
    </section>
  `}function Kr(e){return ds(e)}function ds(e){const t=Q(e),a=K(e),i=a.filter(N=>N.status!=="done"),s=i.filter(N=>N.due&&new Date(N.due)<ut()),o=h("messages.view",e)?qi(e):0,l=_e(e),d=he(e),c=ie(e),f=c.filter(N=>N.status==="active"),g=c.filter(N=>N.status==="pending"),S=Gr(e,Ss(e).slice(0,4)),V=no(e),x=de(e).filter(N=>!N.is_system).length,ne=new Set(de(e).flatMap(N=>N.permissions||[])).size,Fe=h("users.view",e)||h("settings.view",e);return`
    <section class="home-cockpit">
      <div class="home-hero">
        <div>
          <h1>Good ${r(so())}, <span>${r(ro(b().profile.full_name)||"Quest Admin")}</span></h1>
          <p>Here is what is happening across your workspace.</p>
        </div>
        <div class="home-hero-actions">
          <label class="company-switch home-company-switch">
            ${Y("q-company")}
            <select data-company-switch aria-label="Active company">
              ${Ui().map(N=>`<option value="${r(N.id)}" ${N.id===e?"selected":""}>${r(Nt(N))}</option>`).join("")}
            </select>
          </label>
          <button class="icon-button" type="button" data-action="toggle-notifications" aria-label="Open notifications">
            <i class="ti ti-bell"></i>
            ${o?`<b>${r(String(Math.min(o,99)))}</b>`:""}
          </button>
          ${Z(b().profile,"avatar")}
        </div>
      </div>
      <section class="home-metric-grid">
        ${pt("q-symbol-approvals","Company access",Na(e),Pa(e)?"Approval required before full access.":"Workspace modules are available.",m("settings",{tab:"billing"},e),"View status",ee(e)?"good":"warning")}
        ${pt("q-symbol-users","Active users",f.length,`${f.length} active / ${g.length} pending`,m("users",{},e),"Manage users")}
        ${pt("q-symbol-tasks","Open tasks",i.length,`${s.length} overdue`,m("tasks",{},e),"View tasks",s.length?"warning":"")}
        ${pt("q-symbol-messages","Unread messages",o,"Across team chats",m("messages",{},e),"Open inbox")}
        ${pt("q-symbol-settings","Workspace health",ee(e)?"Good":"Pending",ee(e)?"All core systems operational":"Approval or billing still needs attention.",m("settings",{},e),"See details",ee(e)?"good":"warning")}
      </section>
      <section class="home-dashboard-grid">
        <article class="panel home-activity-panel">
          <div class="section-head">
            <div><h2>Recent activity</h2><p>Latest company work and inbox events.</p></div>
            <a class="btn" href="${_(m("analytics",{},e))}" data-router>All activity</a>
          </div>
          <div class="home-activity-list">
            ${S.map(Zr).join("")||v("No recent activity yet.")}
          </div>
        </article>
        <article class="panel home-message-panel">
          <div class="section-head">
            <div><h2>Unread messages</h2><p>Team conversations needing attention.</p></div>
            <a href="${_(m("messages",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-message-list">
            ${Xr(e).map(eo).join("")||v("No unread messages.")}
          </div>
        </article>
        <article class="panel home-next-panel">
          <div class="section-head">
            <div><h2>Next tasks</h2><p>Your cleanest path through today.</p></div>
            <a href="${_(m("tasks",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-next-list">
            ${to(e).map(ao).join("")||v("No open tasks.")}
          </div>
        </article>
        <article class="panel home-team-panel">
          <div class="section-head">
            <div><h2>Team access</h2><p>Active people in this workspace.</p></div>
            <a href="${_(m("users",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-team-list">
            ${f.slice(0,4).map(io).join("")||v("No active users yet.")}
          </div>
        </article>
        <article class="panel home-health-panel">
          <div class="section-head"><div><h2>Workspace health</h2><p>Access, billing, and operating signals.</p></div></div>
          <div class="home-health-body">
            <div class="home-orbit" aria-hidden="true"><span>${Y("q-logo","brand-symbol")}</span></div>
            <div class="home-health-list">
              ${V.map(N=>`<div class="${r(N.state)}"><i class="ti ${r(N.icon)}"></i><span>${r(N.label)}</span></div>`).join("")}
            </div>
          </div>
        </article>
        <article class="panel home-access-panel">
          <div class="section-head">
            <div><h2>Access control</h2><p>Roles, permissions, protected data, and audit trail.</p></div>
            <a href="${_(m("settings",{tab:"roles"},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-access-grid">
            <div><i class="ti ti-user-shield"></i><strong>${r(x||de(e).length)}</strong><span>Custom roles</span></div>
            <div><i class="ti ti-shield-lock"></i><strong>${r(ne||Nn.length)}</strong><span>Active rules</span></div>
            <div><i class="ti ti-lock"></i><strong>${r(Fe?"100%":"Basic")}</strong><span>Protected data</span></div>
            <div><i class="ti ti-clipboard-check"></i><strong>${r(Is(e).length)}</strong><span>Audit events</span></div>
          </div>
        </article>
      </section>
      <section class="home-shortcuts panel">
        ${Ie("files","q-symbol-files","Files",l.length,e)}
        ${Ie("crm","q-symbol-crm","CRM",Pt(e).length,e)}
        ${Ie("finance","q-symbol-finance","Finance",ve(e).length,e)}
        ${Ie("calendar","q-symbol-calendar","Calendar",Cs(e).length,e)}
        ${Ie("users","q-symbol-users","Users",f.length,e)}
        ${Ie("forms","q-symbol-forms","Forms",d.length,e)}
        ${Ie("analytics","q-symbol-analytics","Reports",t.length+a.length,e)}
      </section>
    </section>
  `}function pt(e,t,a,i,s,o,l=""){return`
    <article class="home-metric-card ${r(l)}">
      ${Y(e)}
      <span>${r(t)}</span>
      <strong>${r(a)}</strong>
      <small>${r(i)}</small>
      <a href="${_(s)}" data-router>${r(o)} <i class="ti ti-arrow-right"></i></a>
    </article>
  `}function Ie(e,t,a,i,s){const o=ot.find(l=>l.id===e);return o&&!ls(o,s)?"":`
    <a class="home-shortcut" href="${_(m(e,{},s))}" data-router>
      ${Y(t)}
      <span>${r(a)}</span>
      ${i!==""&&i!==void 0?`<b>${r(String(i))}</b>`:""}
    </a>
  `}function Gr(e,t=[]){const a=t.map(o=>({icon:"ti-bell",title:o.body||o.title,meta:Xs(o.type),time:o.created_at,href:o.href||m("home",{},e),avatar:b().profile})),i=K(e).slice(0,3).map(o=>({icon:"ti-circle-check",title:`${o.title} was updated`,meta:"Tasks",time:o.updated_at||o.due,href:m("tasks",{...o.project_id?{job_id:o.project_id}:{},task_id:o.id},e),avatar:{full_name:H(o.assignee_id)}})),s=_e(e).slice(0,2).map(o=>({icon:"ti-folder",title:`${o.name} was uploaded`,meta:"Files",time:o.updated_at||o.created_at,href:m("files",o.job_id?{job_id:o.job_id}:{},e),avatar:{full_name:H(o.owner_id||o.created_by)}}));return a.concat(i,s).sort((o,l)=>Date.parse(l.time||0)-Date.parse(o.time||0)).slice(0,5)}function Zr(e){return`
    <a class="home-activity-row" href="${_(e.href)}" data-router>
      <span class="home-activity-icon"><i class="ti ${r(e.icon)}"></i></span>
      <span><strong>${r(e.title)}</strong><small>${r(e.meta)}</small></span>
      ${Z(e.avatar||{},"avatar small")}
      <em>${r(dt(e.time))}</em>
    </a>
  `}function Xr(e){return h("messages.view",e)?Oe(e).filter(t=>Ze(t.id)>0).slice(0,4).map(t=>{const a=je(t.id).slice(-1)[0];return{id:t.id,title:a?.body||t.title,meta:`${t.title} - ${dt(a?.created_at||t.updated_at||t.created_at)}`,href:m("messages",{conversation:t.id},e),count:Ze(t.id),avatar:{full_name:a?H(a.sender_profile_id):t.title}}}):[]}function eo(e){return`
    <a class="home-message-row" href="${_(e.href)}" data-router>
      ${Z(e.avatar||{},"avatar small")}
      <span><strong>${r(e.title)}</strong><small>${r(e.meta)}</small></span>
      <b>${r(e.count)}</b>
    </a>
  `}function to(e){return K(e).filter(t=>t.status!=="done").sort(ei).slice(0,4)}function ao(e){return`
    <a class="home-next-row" href="${_(m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id))}" data-router>
      <i class="ti ti-circle"></i>
      <span><strong>${r(e.title)}</strong><small>${r(P(e.project_id)?.name||Qe(e.type))}</small></span>
      ${Wi(e.priority)}
      <em>${r(e.due?E(e.due):"Open")}</em>
    </a>
  `}function io(e){return`
    <a class="home-team-row" href="${_(m("users",{},u()))}" data-router>
      ${Z({full_name:e.name,email:e.email,avatar_url:e.avatar_url},"avatar small")}
      <span><strong>${r(e.name)}</strong><small>${r(e.email||e.role_label)}</small></span>
      <b>${r(e.role_label)}</b>
    </a>
  `}function no(e){return[{label:"Company created",icon:"ti-circle-check",state:"good"},{label:ee(e)?"Access approved":"Pending approval",icon:ee(e)?"ti-circle-check":"ti-clock",state:ee(e)?"good":"warning"},{label:"Billing connected",icon:"ti-link",state:ee(e)?"good":"muted"},{label:ee(e)?"Payment active":"Payment not active",icon:"ti-credit-card",state:ee(e)?"good":"muted"},{label:"Full access enabled",icon:"ti-shield-check",state:ee(e)?"good":"muted"}]}function so(){const e=new Date().getHours();return e<12?"morning":e<18?"afternoon":"evening"}function ro(e){return String(e||"").trim().split(/\s+/)[0]||""}function oo(e,t){const a=e.jobId?P(e.jobId):null,i=a?[a]:Q(t),s=K(t).filter(g=>!a||g.project_id===a.id),o=_e(t).filter(g=>!a||g.job_id===a.id),l=he(t).filter(g=>!a||g.linked_job_id===a.id),d=s.filter(g=>g.status!=="done"),c=s.filter(g=>g.status!=="done"&&g.due&&new Date(g.due)<ut()),f=me(i,"estimate_total");return`
    <section class="analytics-workspace">
      <section class="analytics-toolbar panel">
        <div>
          <strong>Analytics</strong>
          <span>${r(a?a.name:I(t))}</span>
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
          <strong>${r(d.length)}</strong>
          <small>${r(c.length)} overdue / ${r(s.filter(g=>g.priority==="urgent"||g.priority==="critical").length)} urgent</small>
        </article>
        <article class="panel analytics-score">
          <span>Pipeline value</span>
          <strong>${r(C(f))}</strong>
          <small>${r(i.length)} visible job${i.length===1?"":"s"}</small>
        </article>
        <article class="panel analytics-score">
          <span>Drive and forms</span>
          <strong>${r(o.length+l.length)}</strong>
          <small>${r(o.length)} files / ${r(l.length)} forms</small>
        </article>
        <article class="panel analytics-score">
          <span>Completion</span>
          <strong>${r(nm(s.filter(g=>g.status==="done").length,s.length))}</strong>
          <small>${r(s.filter(g=>g.status==="done").length)} done of ${r(s.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${i.map(g=>`
              <a class="analytics-row" href="${_(m("analytics",{job_id:g.id},t))}" data-router>
                <span><strong>${r(g.name)}</strong><small>${r(g.client_name||I(t))}</small></span>
                <span>${r(g.stage)}</span>
                <span>${r(Qa(g.id))}</span>
                <span>${r(ca(g.id))}</span>
                <span>${r(C(g.estimate_total))}</span>
              </a>
            `).join("")||v("No jobs to analyze yet.")}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${Ft.map(g=>{const S=s.filter(V=>V.status===g).length;return`<div><span>${r($e(g))}</span><b><i style="width:${r(gr(S,s.length))}%"></i></b><strong>${r(S)}</strong></div>`}).join("")}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${s.filter(g=>g.status!=="done").sort((g,S)=>st(S.priority)-st(g.priority)).slice(0,8).map(g=>Hi(g)).join("")||v("No open tasks in this scope.")}
          </div>
        </article>
      </section>
    </section>
  `}function lo(e,t){const a=ad(e.params.get("tab")),i=Ee();return`
    ${X("Jobs","Company job records, clients, scope, and linked work.",`
      <a class="btn" href="${_(m("files",i?{job_id:i.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <section class="job-toolbar">
      <label>
        <span>Stage</span>
        <select data-stage-filter>
          ${["all"].concat(Mt).map(s=>`<option value="${r(s)}" ${n.stageFilter===s?"selected":""}>${r(s==="all"?"All stages":s)}</option>`).join("")}
        </select>
      </label>
      <div class="selected-job-chip">
        <span>Selected job</span>
        <strong>${i?r(i.name):"No job selected"}</strong>
      </div>
    </section>
    <nav class="tabbar" aria-label="Job sections">
      ${Ln.map(s=>`<a class="${s===a?"active":""}" href="${_(m("jobs",{tab:s,...i?{job_id:i.id}:{}},t))}" data-router>${r(id(s))}</a>`).join("")}
    </nav>
    ${co(a,t,i)}
  `}function co(e,t,a){return e==="pipeline"?pn(t):e==="list"?uo(t):e==="profile"?mo(t,a):pn(t)}function pn(e){const t=Ts(e);return`
    <section class="job-board">
      ${Mt.map(a=>{const i=t.filter(s=>s.stage===a);return`
          <article class="job-lane">
            <h2><span>${r(a)}</span><b>${i.length}</b></h2>
            ${i.map(s=>lu(s)).join("")||'<div class="lane-empty">No jobs</div>'}
          </article>
        `}).join("")}
    </section>
  `}function uo(e){const t=Ts(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Job list</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Tasks</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===n.selectedJobId?"active":""}" type="button" data-select-job="${r(a.id)}">
            <span><strong>${r(a.name)}</strong><small>${r(a.client_name||"No client")} - ${r(a.site_address||"No address")}</small></span>
            <span>${r(a.stage)}</span>
            <span>${Hs(a.priority)}</span>
            <span>${r(a.owner_name||"Unassigned")}</span>
            <span>${r(Qa(a.id))}</span>
            <span>${C(a.estimate_total)}</span>
          </button>
        `).join("")||v("No jobs match this view.")}
      </div>
    </section>
  `}function mo(e,t){return t?`
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${r(I(e))} - ${r(t.job_type)}</span>
          <h2>${r(t.name)}</h2>
          <p>${r(t.scope||"No scope written yet.")}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${W([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",C(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${_(m("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(t.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${Zt(m("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${Qa(t.id)} linked tasks`)}
          ${Zt(m("files",{job_id:t.id},e),"ti-folder","Files",`${ca(t.id)} files`)}
          ${Zt(m("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${Zt(m("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:v("Create a job to see the profile workspace.")}function po(e,t){const a=t||Kd(e);return`
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${F("Workspace name","name",a.name,!0)}
      ${U("Company","company_id",e,Ui().map(i=>[i.id,Nt(i)]))}
      ${F("Client","client_name",a.client_name)}
      ${F("Contact","contact_name",a.contact_name)}
      ${F("Account owner","owner_name",a.owner_name)}
      ${F("Job type","job_type",a.job_type||"Roofing")}
      ${U("Business status","stage",a.stage||"Lead",Mt.map(i=>[i,i]))}
      ${U("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(i=>[i,i]))}
      ${F("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${F("Invoice total","invoice_total",a.invoice_total||0,!1,"number")}
      ${F("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${De("Scope","scope",a.scope,"span-2")}
      ${De("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function fo(e,t){const a=e.jobId?P(e.jobId):null,i=Rd(t,a?.id);return`
    ${X(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${_(m("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${_(m("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${go(t,a)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${n.taskView==="board"?_o(t,i):bo(t,i)}
      </article>
    </section>
  `}function go(e,t){return`
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${Q(e).map(i=>`<option value="${r(i.id)}" ${t?.id===i.id?"selected":""}>${r(i.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${["all"].concat(Ft).map(i=>`<option value="${r(i)}" ${n.taskStatusFilter===i?"selected":""}>${r(i==="all"?"All statuses":$e(i))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(na).map(i=>`<option value="${r(i)}" ${n.taskPriorityFilter===i?"selected":""}>${r(i==="all"?"All priorities":T(i))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${n.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${n.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function bo(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===n.selectedTaskId?"active":""}" type="button" data-select-task="${r(a.id)}">
          <span><strong>${r(a.title)}</strong><small>${r(a.description||Qe(a.type))}</small></span>
          <span>${r(P(a.project_id)?.name||"Company task")}</span>
          <span>${r(H(a.assignee_id))}</span>
          <span>${Wi(a.priority)}</span>
          <span>${Ws(a.status)}</span>
          <span>${E(a.due)}</span>
        </button>
      `).join("")||v("No tasks match this workspace view.")}
    </div>
  `}function _o(e,t){return`
    <div class="task-board">
      ${Ft.map(a=>{const i=t.filter(s=>s.status===a);return`
          <section class="task-column">
            <h2><span>${r($e(a))}</span><b>${i.length}</b></h2>
            ${i.map(s=>`
              <button class="task-card priority-${r(s.priority)}" type="button" data-select-task="${r(s.id)}">
                <strong>${r(s.title)}</strong>
                <span>${r(P(s.project_id)?.name||I(e))}</span>
                <small>${r(H(s.assignee_id))} - ${E(s.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function vo(e,t){return t?`
    <div class="section-head">
      <div><h2>${r(t.title)}</h2><p>${r(P(t.project_id)?.name||I(e))}</p></div>
      <a class="btn" href="${_(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${W([["Status",$e(t.status)],["Priority",T(t.priority)],["Type",Qe(t.type)],["Assignee",H(t.assignee_id)],["Due",E(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${r(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${v("No task selected.")}
    `}function fn(e,t,a){const i=a||Gd(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${r(a?i.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${F("Task title","title",i.title,!0)}
      ${U("Job","project_id",i.project_id||"",[["","Company-level task"]].concat(Q(e).map(s=>[s.id,s.name])))}
      ${U("Status","status",i.status,Ft.map(s=>[s,$e(s)]))}
      ${U("Priority","priority",i.priority,na.map(s=>[s,T(s)]))}
      ${U("Type","type",i.type,Qn.map(s=>[s,Qe(s)]))}
      ${U("Assignee","assignee_id",i.assignee_id,lt(e).map(s=>[s.id,H(s.id)]))}
      ${F("Due date","due",i.due||k(1),!0,"date")}
      ${De("Description","description",i.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${r(a.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function yo(e,t){const a=e.params.get("folder")||n.driveFolder||"home";n.driveFolder=a;const i=e.jobId?P(e.jobId):null,s=Tu(t,a,i?.id||""),o=h("files.manage",t);return`
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${r(i?i.name:"Company Drive")}</strong>
              <small>${r(i?`${i.client_name||I(t)} file workspace`:`${I(t)} file manager`)}</small>
            </div>
          </div>
          <label class="drive-search">
            <i class="ti ti-search"></i>
            <input data-file-search value="${r(n.fileQuery)}" placeholder="Search drive" />
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
                <a href="${_(m("files",{},t))}" data-router>${r(I(t))}</a>
                ${a!=="home"?Iu(t,a,i):""}
                ${i?`<span>/</span><strong>${r(i.name)}</strong>`:""}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${n.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${n.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${ho(t,a,i,s)}
          </div>
        </div>
      </section>
    </section>
  `}function ho(e,t,a,i){const s=Mu(e,t,a),o=s.map(d=>({kind:"folder",...d})).concat(i.map(d=>({kind:"file",file:d}))),l=a?a.name:t==="home"?"This folder":fe(t);return`
    <section class="drive-section-title">
      <div><h3>${r(l)}</h3><span>${s.length} folder${s.length===1?"":"s"} / ${i.length} file${i.length===1?"":"s"}</span></div>
    </section>
    ${n.driveView==="list"?wo(o):$o(o)}
  `}function wo(e){return`
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${e.map(t=>t.kind==="folder"?ko(t):Do(t.file)).join("")||v("This folder is empty.")}
    </div>
  `}function $o(e){return`
    <section class="drive-folder-grid explorer-grid">
      ${e.map(t=>t.kind==="folder"?So(t):jo(t.file)).join("")||v("This folder is empty.")}
    </section>
  `}function So(e){return`
    <a class="drive-folder-card explorer-folder" href="${r(e.href)}" data-router>
      <span class="drive-folder-icon">${ur(e,e.name)}</span>
      <strong>${r(e.name)}</strong>
      <em>${r(e.countLabel||"0 items")}</em>
    </a>
  `}function ko(e){return`
    <a class="explorer-row folder-row-live" href="${r(e.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder">${ur(e,e.name)}</span><strong>${r(e.name)}</strong></span>
      <span>${r(e.updatedLabel||"")}</span>
      <span>Folder</span>
      <span>${r(e.countLabel||"")}</span>
    </a>
  `}function Do(e){return`
    <button type="button" class="explorer-row ${e.id===n.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}" role="row">
      <span class="explorer-name">${Co(e)}<strong>${r(e.file_name)}</strong></span>
      <span>${E(e.updated_at||e.created_at)}</span>
      <span>${r(Ae(e))}</span>
      <span>${en(e.size_bytes)}</span>
    </button>
  `}function Co(e){return`
    <span class="file-type ${r(Zi(e))}">
      ${mr(e,Ae(e))}
      <small>${r(nr(e))}</small>
    </span>
  `}function jo(e){return`
    <button type="button" class="file-card-live ${e.id===n.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}">
      <span class="file-thumb">${Xi(e)}</span>
      <strong>${r(e.file_name)}</strong>
      <span>${r(Ae(e))} / ${en(e.size_bytes)}</span>
    </button>
  `}function qo(e,t){const a=h("files.manage",t);return`
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${Ao(e)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${Xi(e)}
          <div>
            <strong>${r(e.file_name)}</strong>
            <span>${r(Ae(e))} / ${en(e.size_bytes)}</span>
          </div>
        </div>
        <div class="file-detail-list">
          ${Te("Location",fe(e.folder))}
          ${Te("Job",P(e.job_id)?.name||"Company shared")}
          ${Te("Uploaded by",e.uploaded_by_label||"Quest HQ")}
          ${Te("Modified",E(e.updated_at||e.created_at))}
          ${Te("Storage",e.object_path||"Metadata only")}
        </div>
        <div class="file-detail-actions">
          <button class="btn" type="button" data-action="download-file" data-file-id="${r(e.id)}"><i class="ti ti-download"></i>Download</button>
          ${a?`<button class="btn danger" type="button" data-action="delete-file" data-file-id="${r(e.id)}"><i class="ti ti-trash"></i>Delete</button>`:""}
        </div>
      </aside>
    </section>
  `}function Ao(e){const t=Zi(e);return e.signed_url&&t==="image"?`<img class="file-preview-media" src="${r(e.signed_url)}" alt="" />`:e.signed_url&&t==="pdf"?`<iframe class="file-preview-frame" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:e.signed_url&&t==="text"?`<iframe class="file-preview-frame text" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:["doc","sheet"].includes(t)&&e.signed_url?`<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:`
    <div class="file-preview-empty">
      ${Xi(e,!0)}
      <strong>${r(Ae(e))} preview</strong>
      <p>${r(e.object_path?"Preview will load when a signed file URL is available.":"This is a metadata-only file record. Upload the actual file object to preview it here.")}</p>
      ${e.notes?`<pre>${r(e.notes)}</pre>`:""}
    </div>
  `}function Mo(){const e=u(),t=n.route||xt(),a=t.params.get("folder")||n.driveFolder||"home",i=t.jobId?P(t.jobId):null;return O("Drive","New folder",`
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${r(e)}" />
      <input type="hidden" name="parent_key" value="${r(ir(a,i))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${r(a==="home"?I(e):i?.name||fe(a))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"task-modal")}function Fo(){const e=u(),t=n.route?.params?.get("folder")||(n.driveFolder==="home"?"shared":n.driveFolder),a=n.route?.jobId||"";return`
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">${r(I(e))} Drive</div><h2 id="upload-title">Upload files</h2></div>
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
          ${F("Metadata-only file name","file_name","")}
          ${U("Folder","folder",t,em(e))}
          ${U("Job","job_id",a,[["","Company shared file"]].concat(Q(e).map(i=>[i.id,i.name])))}
          ${U("Category","category",fe(t),kr.filter(i=>i!=="All categories").map(i=>[i,i]))}
          ${F("Uploaded by","uploaded_by_label",b().profile.full_name||"Quest HQ")}
          ${De("Notes","notes","","span-2")}
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
  `}function Io(e,t){const a=ie(t),i=["members","access"].includes(e.params.get("tab"))?e.params.get("tab"):"members",s=n.joinRequests.filter(c=>c.company_id===t&&c.status==="pending"),o=h("users.manage",t),l=a.filter(c=>c.status==="active"),d=a.filter(c=>c.status!=="active");return`
    ${X("Users","Company members, roles, workers, and access context.",`
      <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite user</button>
      <a class="btn" href="${_(m("settings",{tab:"roles"},t))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      <a class="btn" href="${_(m("settings",{tab:"access"},t))}" data-router><i class="ti ti-settings"></i>Access settings</a>
    `)}
    ${ki("Users sections",[[m("users",{tab:"members"},t),"Members",i==="members"],[m("users",{tab:"access"},t),"Access",i==="access"]])}
    ${i==="members"?`
      <section class="metric-grid operations-metrics">
        ${M("Active users",l.length)}
        ${M("Pending",a.filter(c=>c.status==="pending").length+s.length)}
        ${M("Disabled/left",d.filter(c=>c.status!=="pending").length)}
        ${M("Roles",de(t).length)}
      </section>
      <section class="users-grid">
        ${a.map(c=>`
          <article class="user-card ${c.status!=="active"?"muted":""}">
            ${Z({full_name:sa(c),email:c.email,avatar_url:c.avatar_url},"avatar")}
            <div>
              <strong>${r(sa(c))}</strong>
              <span>${r(us(c))}</span>
              <small>${r(c.role_label)} / ${r(T(c.status))}</small>
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
          ${a.map(c=>To(t,c,o)).join("")||v("No users assigned to this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head">
          <div><h2>Invites</h2><p>Copy a secure invite code or link for a specific email address.</p></div>
          <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite</button>
        </div>
        <div class="access-invite-list">
          ${qd(t).map(c=>xo(c,o)).join("")||v("No pending invites.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
        <div class="access-request-list">
          ${s.map(c=>Eo(c,o)).join("")||v("No pending join requests.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
        ${W([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Supabase Auth + RLS"],["Your role",Xe(t)],["Can manage users",o?"Yes":"No"]])}
      </article>
    </section>
    `}
  `}function To(e,t,a){const i=de(e),s=t.role_id||wt(e,t.role)||i[0]?.id||"",o=t.profile_id&&Qs(e,t.profile_id),l=a&&t.profile_id&&!o;return`
    <article class="access-user-row ${t.status!=="active"?"muted":""}">
      ${Z({full_name:sa(t),email:t.email,avatar_url:t.avatar_url},"avatar")}
      <div class="access-user-main">
        <strong>${r(sa(t))}</strong>
        <span>${r(us(t))} / ${r(T(t.status))}</span>
        ${o?'<small class="access-note">Last active Owner - promote another Owner before changing this access.</small>':""}
      </div>
      <form class="access-role-form" data-user-role-form>
        <input type="hidden" name="company_id" value="${r(e)}" />
        <input type="hidden" name="profile_id" value="${r(t.profile_id)}" />
        <select name="role_id" ${l?"":"disabled"}>
          ${i.map(d=>`<option value="${r(d.id)}" ${d.id===s?"selected":""}>${r(d.name)}</option>`).join("")}
        </select>
        <select name="membership_status" ${l?"":"disabled"}>
          ${["active","pending","disabled","left"].map(d=>`<option value="${r(d)}" ${d===t.status?"selected":""}>${r(T(d))}</option>`).join("")}
        </select>
        <button class="btn" type="submit" ${l?"":"disabled"}>Save</button>
      </form>
    </article>
  `}function Eo(e,t){const a=e.requested_email||Re(e.profile_id)?.email||e.profile_id||"Requester";return`
    <article class="access-request-row">
      <div>
        <strong>${r(a)}</strong>
        <span>${r(e.message||"Access request")} / ${E(e.created_at)}</span>
      </div>
      <div>
        <button class="btn btn-primary" type="button" data-action="approve-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Approve</button>
        <button class="btn danger" type="button" data-action="reject-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Reject</button>
      </div>
    </article>
  `}function xo(e,t){const a=ct(e.company_id,e.role_id),i=e.expires_at&&Date.parse(e.expires_at)<Date.now();return`
    <article class="access-invite-row ${i?"muted":""}">
      <div>
        <strong>${r(e.email)}</strong>
        <span>${r(a?.name||"Member")} / ${i?"Expired":`Expires ${E(e.expires_at)}`}</span>
        ${e.token?`<code class="invite-code">${r(e.token)}</code>`:""}
      </div>
      <div>
        <button class="btn" type="button" data-action="copy-invite-code" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-key"></i>Copy code</button>
        <button class="btn" type="button" data-action="copy-invite-link" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-link"></i>Copy link</button>
        <button class="btn danger" type="button" data-action="revoke-invite" data-invite-id="${r(e.id)}" ${t?"":"disabled"}>Revoke</button>
      </div>
    </article>
  `}function sa(e){const t=String(e.name||"").trim(),a=String(e.email||"").trim();if(t&&!ga(t))return t;if(a&&!ga(a))return a.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,s=>s.toUpperCase());const i=String(e.role||"").toLowerCase();return i==="owner"?"Workspace owner":i==="admin"?"Workspace admin":i==="developer"?"Developer":`${e.role_label||"Workspace"} user`}function us(e){const t=String(e.email||"").trim();if(t&&!ga(t))return t;const a=String(e.profile_id||e.member_id||"").trim();return a?`ID ${br(a)}`:"No email on profile"}function Oo(e){const t=lt(e),a=t.filter(i=>!i.supervisor_id||!t.some(s=>s.id===i.supervisor_id));return`
    <section class="tool-page team-chart-page">
      ${X("Team chart","Reporting lines, roles, and company coverage for this workspace.",`
        <a class="btn" href="${_(m("users",{},e))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${_(m("settings",{tab:"team"},e))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${M("Members",t.length)}
        ${M("Leads",a.length)}
        ${M("Open tasks",K(e).filter(Ei).length)}
        ${M("Active timer",Ut(e)?"Yes":"No")}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${a.map(i=>ms(e,i,t)).join("")||v("No workers assigned.")}
        </div>
      </section>
    </section>
  `}function ms(e,t,a,i=0){const s=a.filter(o=>o.supervisor_id===t.id);return`
    <article class="team-node" style="--depth:${i}">
      <div class="team-node-card">
        ${Z({full_name:t.full_name,avatar_url:t.avatar_url},"avatar")}
        <span><strong>${r(t.full_name)}</strong><small>${r(oa(e,t.id))}</small></span>
        <b>${K(e).filter(o=>o.assignee_id===t.id&&Ei(o)).length} open</b>
      </div>
      ${s.length?`<div class="team-node-children">${s.map(o=>ms(e,o,a,i+1)).join("")}</div>`:""}
    </article>
  `}function Ro(e,t){const a=Ra(t),i=["company","billing","roles","access","team"].includes(e.params.get("tab"))?e.params.get("tab"):"company";return`
    ${X("Settings","Company settings, roles, approvals, and admin controls.","")}
    ${ki("Settings sections",[[m("settings",{tab:"company"},t),"Company",i==="company"],[m("settings",{tab:"billing"},t),"Billing",i==="billing"],[m("settings",{tab:"roles"},t),"Roles",i==="roles"],[m("settings",{tab:"access"},t),"Access",i==="access"],[m("settings",{tab:"team"},t),"Workers",i==="team"]])}
    <section class="dashboard-grid compact-settings-grid">
      ${i==="company"?`
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${W([["Name",I(t)],["Company ID",t],["Color",a?.color||qe(t)],["Visible jobs",Q(t).length]])}
      </article>
      `:""}
      ${i==="billing"?Po(t):""}
      ${i==="roles"?Lo(t):""}
      ${i==="access"?`
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${W([["Auth switch","Enabled"],["Local login","Disabled"],["Isolation","Server-enforced when migration is applied"],["Active memberships",String(n.memberships.filter(s=>s.company_id===t&&s.status==="active").length)],["Disabled/left",String(n.memberships.filter(s=>s.company_id===t&&["disabled","left"].includes(s.status)).length)],["Invites",String(n.companyInvites.filter(s=>s.company_id===t&&s.status==="pending").length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${n.joinRequests.filter(s=>s.company_id===t).map(s=>ze(s.requested_email||s.profile_id,s.message||"Access request",T(s.status),s.created_at)).join("")||v("No pending company approvals.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access history</h2><p>Recent membership, invite, and role changes for this company.</p></div></div>
        <div class="access-audit-list">
          ${Is(t).slice(0,8).map(Ad).join("")||v("No access audit events yet.")}
        </div>
      </article>
      `:""}
      ${i==="team"?`
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${lt(t).map(s=>`<div><strong>${r(s.full_name)}</strong><span>${r(oa(t,s.id))}</span></div>`).join("")||v("No workers assigned.")}
        </div>
      </article>
      `:""}
    </section>
  `}function Po(e){const t=Lt(e),a=Pa(e);return`
    <article class="panel">
      <div class="section-head">
        <div><h2>${a?"Workspace awaiting approval":"Subscription"}</h2><p>${a?"Quest needs to approve billing/access before live company data opens.":"$300/month company workspace billing gate."}</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout" ${a?"disabled":""}><i class="ti ti-credit-card"></i>${a?"Billing pending":"Start subscription"}</button>
      </div>
      ${W([["Plan","$300/month company workspace"],["Status",Na(e)],["Stripe customer",t?.stripe_customer_id||"Not connected"],["Approval",a?"Waiting for Quest review":"Ready"],["Renewal / trial",t?.current_period_end||t?.trial_ends_at?E(t.current_period_end||t.trial_ends_at):"Pending"]])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules open only after approval or an active billing state.</p></div></div>
      ${W([["Workspace access",ee(e)?"Allowed":"Suspended"],["Finance/files privacy","Requires Auth + RLS"],["Seat billing","Tracked later; not charged in v1"]])}
    </article>
    ${Li()?Uo(e):""}
  `}function Uo(e){const t=Nd(),a=t.filter(i=>i.status==="pending_review").length;return`
    <article class="panel span-3">
      <div class="section-head">
        <div><h2>Quest approval console</h2><p>${a} workspace${a===1?"":"s"} waiting for manual activation.</p></div>
      </div>
      <div class="approval-console-list">
        ${t.map(i=>No(i,e)).join("")||v("No workspace reviews found.")}
      </div>
    </article>
  `}function No(e,t){const a=["active","trialing","past_due","grace"].includes(e.status),i=e.company_id===t;return`
    <article class="workspace-review-row ${e.status==="pending_review"?"pending":""}">
      <span>
        <strong>${r(e.company_name||I(e.company_id))}${i?" / current":""}</strong>
        <small>${r(e.company_id)} / ${r(e.owner_email||"No owner email")} / ${E(e.created_at)}</small>
      </span>
      <b class="status-pill ${a?"active":e.status==="pending_review"?"pending":"muted"}">${r(la(e.status,e))}</b>
      <div class="workspace-review-actions">
        <button class="btn btn-primary" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="active" ${a?"disabled":""}>Approve</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="pending_review" ${e.status==="pending_review"?"disabled":""}>Pending</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="suspended" ${e.status==="suspended"?"disabled":""}>Suspend</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="canceled" ${e.status==="canceled"?"disabled":""}>Reject</button>
      </div>
    </article>
  `}function Lo(e){const t=de(e),a=Oa(e);return`
    <article class="panel span-2">
      <div class="section-head">
        <div><h2>Custom roles</h2><p>Discord-style roles for module, action, record, and field permissions.</p></div>
        <button class="btn btn-primary" type="button" data-action="open-role-form"><i class="ti ti-plus"></i>New role</button>
      </div>
      <div class="roles-list">
        ${t.map(i=>{const s=n.rolePermissions.filter(d=>d.role_id===i.id&&d.effect==="allow").length,o=n.roleAssignments.filter(d=>d.company_id===e&&d.role_id===i.id).length,l=a?.id===i.id;return`
            <article class="role-row" style="--role-color:${r(i.color)}">
              <span></span>
              <div><strong>${r(i.name)}</strong><small>${s||"All"} permissions / ${o} users / priority ${i.priority}</small></div>
              <div class="role-row-actions">
                <b>${i.is_system?"System":"Custom"}</b>
                <button class="btn" type="button" data-action="view-as-role" data-role-id="${r(i.id)}" ${l?"disabled":""}>
                  <i class="ti ${l?"ti-eye-check":"ti-eye"}"></i>${l?"Viewing":"View as role"}
                </button>
              </div>
            </article>
          `}).join("")||v("No custom roles yet.")}
      </div>
    </article>
    <article class="panel">
      ${a?Qo(e,a):`
        <div class="section-head"><div><h2>Access preview</h2><p>Pick View as role to check sidebar, route, and action access.</p></div></div>
        ${v("No role preview selected.")}
      `}
    </article>
    <article class="panel span-3">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${n.fieldPermissions.filter(i=>i.company_id===e).map(i=>ze(i.field_key,i.resource_type,i.visibility,"")).join("")||v("No field permission overrides yet.")}
      </div>
    </article>
  `}function Qo(e,t){const a=ot.filter(o=>o.status==="live"),i=a.filter(o=>Xa(t,o.permission||`${o.id}.view`)),s=a.filter(o=>!Xa(t,o.permission||`${o.id}.view`));return`
    <div class="section-head">
      <div><h2>Access preview</h2><p>${r(t.name)} sees ${i.length} of ${a.length} live modules.</p></div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
    ${W([["Preview role",t.name],["Allowed modules",i.map(o=>o.label).join(", ")||"None"],["Hidden modules",s.map(o=>o.label).join(", ")||"None"]])}
  `}function Vo(e){return O("Settings","New role",`
    <form class="role-form" data-role-form>
      ${F("Role name","name","")}
      ${F("Color","color","#f0b23b",!1,"color")}
      ${F("Priority","priority","100",!1,"number")}
      <div class="permission-grid span-2">
        ${Nn.map(([t,a])=>`
          <label><input type="checkbox" name="permissions" value="${r(t)}" /> <span>${r(a)}</span></label>
        `).join("")}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Yo(e){const t=de(e).filter(i=>i.name.toLowerCase()!=="owner"),a=[["","Member"]].concat(t.map(i=>[i.id,i.name]));return O("Users","Create invite code",`
    <form class="role-form" data-invite-form>
      <input type="hidden" name="company_id" value="${r(e)}" />
      ${F("Email","email","",!0,"email")}
      ${U("Role","role_id",Md(e),a)}
      <div class="form-message span-2">Quest creates an invite code you can copy now. Email invite delivery will use this same record after SMTP/Resend is configured.</div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create invite code</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Bo(e){const t=xu(e),a=Ct(e),i=n.formsTab==="builder"&&a?"builder":n.formsTab==="responses"?"responses":"library";return`
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
            <button class="${i===s?"active":""}" type="button" data-action="set-forms-tab" data-tab="${r(s)}">${r(T(s))}</button>
          `).join("")}
        </nav>
      `}
      ${i==="library"?Ho(e,t,a):""}
      ${i==="builder"?Wo(e,a):""}
      ${i==="responses"?al(e,a):""}
    </section>
  `}function Ho(e,t,a){return`
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${t.length} visible form${t.length===1?"":"s"} in ${r(I(e))}</span>
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
                <span>Created by ${r(Ou(i))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${r(i.id)}" aria-expanded="${n.expandedFormIds.has(i.id)?"true":"false"}">
                <i class="ti ${n.expandedFormIds.has(i.id)?"ti-chevron-up":"ti-chevron-down"}"></i>
                ${n.expandedFormIds.has(i.id)?"Less":"Details"}
              </button>
              <span class="form-card-meta">
                <small>${r(i.type)} / ${r(i.audience||"Internal")}</small>
                <small>${rr(i)} questions</small>
                <em>${Wa(i.id).length} responses</em>
                <em>Updated ${E(i.updated_at)}</em>
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
          `).join("")||v("No forms match this company view.")}
        </div>
      </article>
    </section>
  `}function Wo(e,t){if(!t)return`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${v("Create a form or choose a template to open the builder.")}
      </section>
    `;const a=["questions","responses","settings"].includes(n.formEditorTab)?n.formEditorTab:"questions";return`
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${r(a)}">
      ${zo(t,a)}
      ${a==="questions"?`
        ${Jo(e,t)}
        ${Ko(t)}
      `:""}
      ${a==="settings"?`
        <article class="panel form-settings-panel forms-settings-wide">
          ${Go(e,t)}
        </article>
      `:""}
      ${a==="responses"?Zo(e,t):""}
    </section>
  `}function zo(e,t){const a=Wa(e.id);return`
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${r(e.title)}</strong>
        <span>${r(e.status)} / ${rr(e)} questions / ${a.length} responses</span>
      </div>
      ${["questions","responses","settings"].map(i=>`
        <button class="${t===i?"active":""}" type="button" data-action="set-form-editor-tab" data-tab="${r(i)}">
          ${i==="questions"?'<i class="ti ti-list-details"></i>':i==="responses"?'<i class="ti ti-inbox"></i>':'<i class="ti ti-settings"></i>'}
          ${r(T(i))}
        </button>
      `).join("")}
      <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(e.id)}"><i class="ti ti-eye"></i>Preview</button>
      <button class="btn" type="button" data-action="open-form-actions" data-form-id="${r(e.id)}"><i class="ti ti-share"></i>Share</button>
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(e.id)}">Save</button>
    </div>
  `}function Jo(e,t){return`
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${r(t.theme_color||qe(e))}"></div>
      ${gt("Form title","title",t.title,!0)}
      ${or("Form description","description",t.description)}
      <div class="forms-simple-meta">
        <span>${r(t.status)}</span>
        <span>${r(t.type)}</span>
        <span>${r(t.audience||"Internal")}</span>
        <span>${r(P(t.linked_job_id)?.name||"Company level")}</span>
        <span>${r(I(e))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(t.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      </div>
    </article>
  `}function Ko(e){return`
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${Tt.map(([t,a])=>`<button type="button" data-action="add-question" data-question-type="${r(t)}" title="${r(a)}" aria-label="Add ${r(a)} question"><i class="ti ${r(Ru(t))}"></i></button>`).join("")}
        </div>
        <div class="question-list">
          ${e.questions.map((t,a)=>Xo(t,a)).join("")||v("Add the first question.")}
        </div>
      </div>
    </article>
  `}function Go(e,t){return`
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${gt("Title","title",t.title,!0)}
      ${Xt("Status","status",t.status,_i.map(a=>[a,a]))}
      ${or("Description","description",t.description)}
      ${Xt("Type","type",t.type,It.map(a=>[a,a]))}
      ${gt("Audience","audience",t.audience)}
      ${Xt("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(Q(e).map(a=>[a.id,a.name])))}
      ${gt("Theme color","theme_color",t.theme_color||qe(e),!1,"color")}
      ${Xt("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
      ${gt("Submit button","submit_label",t.submit_label||"Submit")}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(t.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${r(t.id)}">Delete</button>
    </div>
  `}function Zo(e,t){const a=Wa(t.id),i=a[0]||null;return`
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
            <small>${E(s.created_at)}</small>
          </button>
        `).join("")||v("No responses yet. Submit a preview response from the builder.")}
      </div>
    </article>
    <aside class="panel response-detail">
      ${i?lr(i):v("No response selected.")}
    </aside>
  `}function Xo(e,t){const a=Tt.map(([i,s])=>`<option value="${r(i)}" ${e.type===i?"selected":""}>${r(s)}</option>`).join("");return`
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
      ${jt(e)?`
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
  `}function el(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${r(t.id)}" style="--form-accent:${r(t.theme_color||qe(e))}">
      <div class="designed-form-header">
        <span>${r(I(e))}</span>
        <h2>${r(t.title)}</h2>
        <p>${r(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>tl(a)).join("")||v("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${r(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function tl(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?ge(e,`<textarea name="${r(t)}" rows="3" ${a}></textarea>`):e.type==="date"?ge(e,`<input name="${r(t)}" type="date" ${a} />`):e.type==="file"?ge(e,`<input name="${r(t)}" type="file" ${a} />`):e.type==="yesno"?ge(e,`<select name="${r(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?ge(e,`<input name="${r(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?ge(e,`<select name="${r(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(i=>`<option>${r(i)}</option>`).join("")}</select>`):e.type==="checkbox"?ge(e,`<div class="choice-stack">${(e.options||[]).map(i=>`<label><input name="${r(t)}" type="checkbox" value="${r(i)}" /> ${r(i)}</label>`).join("")}</div>`):e.type==="multiple"?ge(e,`<div class="choice-stack">${(e.options||[]).map(i=>`<label><input name="${r(t)}" type="radio" value="${r(i)}" ${a} /> ${r(i)}</label>`).join("")}</div>`):ge(e,`<input name="${r(t)}" ${a} />`)}function al(e,t){const a=t?Wa(t.id):sr(e),i=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(s=>`
            <button type="button" class="response-card">
              <strong>${r(Me(s.form_id)?.title||"Unknown form")}</strong>
              <span>${r(s.submitted_by||s.submitter_email||"Anonymous")}</span>
              <small>${E(s.created_at)}</small>
            </button>
          `).join("")||v("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${i?lr(i):v("No response selected.")}
      </aside>
    </section>
  `}function il(e,t){const a=Td(t),i=Pt(t),s=K(t).filter(d=>d.status!=="done").length,o=me(Q(t),"estimate_total"),l=xd(t);return`
    <section class="tool-page crm-page">
      ${X("CRM","Customers, contacts, and follow-ups built from company jobs.",`
        <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add customer job</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${M("Accounts",i.length)}
        ${M("Open jobs",Q(t).filter(d=>d.stage!=="Closed").length)}
        ${M("Open tasks",s)}
        ${M("Pipeline value",C(o))}
      </section>
      <section class="crm-toolbar panel">
        <label>
          <span>Search</span>
          <input data-crm-search value="${r(n.crmQuery)}" placeholder="Find customer, contact, job, or address" />
        </label>
        <label>
          <span>Stage</span>
          <select data-crm-stage-filter>
            ${["all"].concat(Mt).map(d=>`<option value="${r(d)}" ${n.crmStageFilter===d?"selected":""}>${r(d==="all"?"All stages":d)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Owner</span>
          <select data-crm-owner-filter>
            <option value="all" ${n.crmOwnerFilter==="all"?"selected":""}>All owners</option>
            ${l.map(d=>`<option value="${r(d)}" ${n.crmOwnerFilter===d?"selected":""}>${r(d)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="panel crm-list-panel">
        <div class="section-head">
          <div><h2>Customers</h2><p>${a.length} visible account${a.length===1?"":"s"} in ${r(I(t))}</p></div>
        </div>
        <div class="data-table crm-table">
          <div class="table-head"><span>Account</span><span>Contact</span><span>Stage</span><span>Owner</span><span>Jobs</span><span>Value</span><span>Updated</span></div>
          ${a.map(d=>`
            <a class="table-row crm-account-row" href="${_(m("crm",{account:d.key},t))}" data-router>
              <span><strong>${r(d.name)}</strong><small>${r(d.subtitle)}</small></span>
              <span>${r(d.primaryContact)}</span>
              <span>${r(d.stage)}</span>
              <span>${r(d.owner)}</span>
              <span>${r(d.jobs.length)}</span>
              <span>${C(d.estimateTotal)}</span>
              <span>${E(d.updatedAt)}</span>
            </a>
          `).join("")||v("No CRM accounts match this view. Add a customer job to start the list.")}
        </div>
      </section>
    </section>
  `}function nl(e,t){const a=Ed(e,t);if(!a)return O("CRM","Customer account",v("This customer is not visible in the current company view."));const i=a.latestJob,s=a.tasks.filter(o=>o.status!=="done");return O("CRM",a.name,`
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${r(a.name)}</h2>
            <p>${r(a.subtitle)}</p>
          </div>
          ${Hs(a.priority)}
        </div>
        ${W([["Primary contact",a.primaryContact],["Owner",a.owner],["Current stage",a.stage],["Pipeline value",C(a.estimateTotal)],["Open tasks",String(s.length)],["Last updated",E(a.updatedAt)]])}
      </section>
      <section class="crm-rollup-grid">
        ${M("Jobs",a.jobs.length)}
        ${M("Files",a.fileCount)}
        ${M("Forms",a.formCount)}
        ${M("Tasks",a.tasks.length)}
      </section>
      <section class="crm-modal-actions">
        ${i?`<a class="btn btn-primary" href="${_(m("jobs",{tab:"profile",job_id:i.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
        ${i?`<a class="btn" href="${_(m("tasks",{job_id:i.id},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>`:""}
        ${i?`<a class="btn" href="${_(m("files",{job_id:i.id},e))}" data-router><i class="ti ti-folder"></i>Files</a>`:""}
        ${i?`<button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(i.id)}"><i class="ti ti-pencil"></i>Edit latest job</button>`:""}
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
          ${s.slice(0,6).map(o=>Hi(o)).join("")||v("No open follow-ups for this customer.")}
        </div>
      </section>
    </div>
  `,"crm-modal")}function sl(e,t){const a=Oe(t),i=ks(t);i&&n.selectedConversationId!==i.id&&(n.selectedConversationId=i.id);const s=!!(i&&e.params.get("conversation")),o=gl(t,a);return bu(t,i?.id||""),i&&Ya(i.id,!1),`
    <section class="tool-page messages-page ${s?"thread-open":""}">
      ${X("Messages","Company chats, role rooms, direct messages, and file sharing.",`
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      `)}
      <section class="message-kpi-row" aria-label="Message inbox summary">
        ${ft("ti-message-circle","Unread",o.unread,o.unreadDelta)}
        ${ft("ti-at","Mentions",o.mentions,o.mentionsDelta)}
        ${ft("ti-paperclip","Files shared",o.files,o.filesDelta)}
        ${ft("ti-clock","Waiting on you",o.waiting,o.waitingDelta)}
        ${ft("ti-users-group","Group chats",o.groups,"Active conversations")}
      </section>
      <section class="messages-shell">
        <aside class="messages-list-panel panel">
          <div class="messages-tools">
            <div class="message-list-top">
              <label class="message-search-field">
                <i class="ti ti-search"></i>
                <input data-message-search value="${r(n.messageQuery)}" placeholder="Find chats or messages" />
              </label>
              <button class="btn btn-compact" type="button" data-action="message-search-results"><i class="ti ti-adjustments-horizontal"></i>Filter</button>
            </div>
            <div class="segmented message-filter" role="group" aria-label="Message filters">
              ${["all","unread","company","role","custom","direct"].map(l=>`
                <button type="button" data-action="set-message-filter" data-filter="${r(l)}" class="${n.messageFilter===l?"active":""}">${r(l==="all"?"All":T(l))}</button>
              `).join("")}
            </div>
          </div>
          <div class="conversation-list">
            ${a.map(l=>rl(l,t,i?.id===l.id)).join("")||v("No conversations match this view.")}
          </div>
        </aside>
        ${i?ll(t,i):""}
      </section>
      ${n.session?.auth==="local-basic"?vl():""}
    </section>
  `}function rl(e,t,a){const i=je(e.id).at(-1),s=Ze(e.id),o=i?Ki(i.sender_profile_id):null,l=Ia(e.id).length,d=bl(e,t);return`
    <a class="conversation-row ${a?"active":""}" href="${_(m("messages",{conversation:e.id},t))}" data-router>
      <span class="conversation-unread-dot ${s?"active":""}"></span>
      ${Z(o||{full_name:e.title},"avatar conversation-avatar")}
      <span class="message-workspace-chip">${r(d)}</span>
      <span class="conversation-copy">
        <strong>${r(e.title)}</strong>
        <small>${r(_l(i,e))}</small>
      </span>
      <span class="conversation-meta">
        <em>${i?dt(i.created_at):""}</em>
        ${l?`<small><i class="ti ti-paperclip"></i>${l}</small>`:""}
      </span>
      ${s?`<b>${s}</b>`:""}
    </a>
  `}function ol(e,t){const a=je(t.id),i=h("messages.send",e);return`
    <div class="thread-head">
      <a class="btn mobile-thread-back" href="${_(m("messages",{},e))}" data-router><i class="ti ti-arrow-left"></i>Chats</a>
      <div class="thread-title">
        <span>${Y(fu(t.type))}</span>
        <div>
          <h2>${r(t.title)}</h2>
          <p>${r(Gi(t))}</p>
        </div>
      </div>
      <div class="thread-actions">
        <button class="btn" type="button" data-action="message-search-results"><i class="ti ti-search"></i>Search</button>
        <button class="btn" type="button" data-action="message-details" data-conversation-id="${r(t.id)}"><i class="ti ti-info-circle"></i>Details</button>
        <button class="btn" type="button" data-action="manage-message-chat" data-conversation-id="${r(t.id)}" ${h("messages.manage_groups",e)||h("messages.manage",e)?"":"disabled"}><i class="ti ti-users"></i>Access</button>
      </div>
    </div>
    <div class="message-stream">
      ${a.map(s=>ml(s)).join("")||v("No messages yet. Start the thread with a short update.")}
    </div>
    ${i?fl(t):v("Your role can view this chat but cannot send messages.")}
  `}function ll(e,t){return`
    <aside class="message-context-rail messages-thread-panel">
      <section class="message-preview-card panel">
        ${ol(e,t)}
      </section>
      ${cl(e,t)}
      ${dl(t)}
      ${ul(e)}
    </aside>
  `}function cl(e,t){const a=Kt(t).slice(0,6);return`
    <section class="message-side-card panel">
      <div class="message-side-head">
        <div><h3>Chat access</h3><p>Members (${Kt(t).length||"company"})</p></div>
        <button class="link-button" type="button" data-action="manage-message-chat" data-conversation-id="${r(t.id)}" ${h("messages.manage_groups",e)||h("messages.manage",e)?"":"disabled"}>Manage</button>
      </div>
      <div class="message-member-stack">
        ${a.map(i=>Z(i,"avatar mini-avatar")).join("")}
        ${Kt(t).length>a.length?`<span class="member-more">+${Kt(t).length-a.length}</span>`:""}
      </div>
    </section>
  `}function dl(e){const t=Ia(e.id).slice(-4).reverse();return`
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
            <small>${r(Gs(a.size_bytes))}</small>
          </button>
        `).join("")||v("No shared files yet.")}
      </div>
    </section>
  `}function ul(e,t){const a=K(e).filter(i=>["todo","pending","review","hold"].includes(i.status)).slice(0,3);return`
    <section class="message-side-card panel">
      <div class="message-side-head">
        <div><h3>Action items</h3><p>From this conversation</p></div>
        <a class="link-button" href="${_(m("tasks",{},e))}" data-router>View all</a>
      </div>
      <div class="message-action-list">
        ${a.map(i=>`
          <a class="message-action-row" href="${_(m("tasks",{task_id:i.id},e))}" data-router>
            <span></span>
            <strong>${r(i.title)}</strong>
            <small>${r(Ne(i.assignee_id))||"Unassigned"} · ${r(E(i.due))}</small>
          </a>
        `).join("")||v("No action items linked yet.")}
      </div>
    </section>
  `}function ml(e){const t=e.sender_profile_id===b().profile.id,a=Ki(e.sender_profile_id),i=Ds(e.id);return`
    <article class="message-bubble ${t?"own":""}">
      ${Z(a,"avatar message-avatar")}
      <div class="message-card">
        <div class="message-meta">
          <strong>${r(a.full_name||a.email||Ne(e.sender_profile_id))}</strong>
          <span>${dt(e.created_at)}</span>
          ${t&&h("messages.delete_own",e.company_id)||h("messages.delete_any",e.company_id)?`<button type="button" data-action="delete-message" data-message-id="${r(e.id)}"><i class="ti ti-trash"></i></button>`:""}
        </div>
        ${e.body?`<p>${gu(e.body)}</p>`:""}
        ${i.length?`<div class="message-attachments">${i.map(pl).join("")}</div>`:""}
      </div>
    </article>
  `}function pl(e){const t=e.mime_type.startsWith("image/");return`
    <button class="message-attachment" type="button" data-action="open-message-attachment" data-attachment-id="${r(e.id)}">
      ${e.preview_url&&t?`<img src="${r(e.preview_url)}" alt="" />`:Y(t?"q-message-image":"q-message-file")}
      <span><strong>${r(e.file_name)}</strong><small>${r(Gs(e.size_bytes))}</small></span>
    </button>
  `}function fl(e){return`
    <form class="message-composer" data-message-form data-conversation-id="${r(e.id)}">
      <input name="body" placeholder="Message ${r(e.title)}" autocomplete="off" />
      <label class="icon-button message-attach-button" title="Attach file">
        <i class="ti ti-paperclip"></i>
        <input name="attachments" type="file" multiple ${h("messages.attach_files",e.company_id)?"":"disabled"} />
      </label>
      <button class="btn btn-primary" type="submit"><i class="ti ti-send"></i>Send</button>
    </form>
  `}function ft(e,t,a,i){return`
    <article class="message-kpi-card">
      <span><i class="ti ${r(e)}"></i>${r(t)}</span>
      <strong>${r(String(a))}</strong>
      <small>${r(i)}</small>
    </article>
  `}function gl(e,t){const a=t.flatMap(c=>je(c.id)),i=t.reduce((c,f)=>c+Ze(f.id),0),s=a.filter(c=>c.body.includes(`@${b().profile.full_name?.split(/\s+/)[0]||""}`)).length,o=t.reduce((c,f)=>c+Ia(f.id).length,0),l=K(e).filter(c=>["todo","pending","review","hold"].includes(c.status)).length,d=t.filter(c=>c.type!=="direct").length;return{unread:i,mentions:s,files:o,waiting:l,groups:d,unreadDelta:i?"+2 since yesterday":"All caught up",mentionsDelta:s?"+1 since yesterday":"No new mentions",filesDelta:o?"+2 since yesterday":"No files shared",waitingDelta:l?`${l} active items`:"Nothing waiting"}}function bl(e,t){const a=I(e.company_id||t);return String(a||"QH").split(/\s+/).map(i=>i[0]).join("").slice(0,2).toUpperCase()||"QH"}function _l(e,t){if(!e)return Gi(t)||"No messages yet";const a=Ne(e.sender_profile_id);return`${a?`${a}: `:""}${e.body||(Ds(e.id).length?"Shared an attachment":"Sent a message")}`}function Kt(e){return Dt(e).map(a=>Ki(a))}function vl(e){return`
    <div class="message-scenario">
      <button class="btn btn-primary" type="button" data-action="run-message-scenario"><i class="ti ti-sparkles"></i>Demo scenario</button>
      <button class="btn" type="button" data-action="reset-message-demo"><i class="ti ti-refresh"></i>Reset</button>
    </div>
  `}function yl(e){const t=ie(e);return O("Messages","New group chat",`
    <form class="message-modal-form" data-message-group-form>
      ${F("Chat name","title","",!0)}
      ${U("Type","type","custom",[["company","Company-wide"],["role","Role-based"],["custom","Custom group"]])}
      ${ps(e,[])}
      ${fs(t,[])}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create group</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function hl(e){const t=ie(e).filter(a=>(a.profile_id||a.member_id)!==b().profile.id);return O("Messages","New direct message",`
    <form class="message-modal-form" data-direct-message-form>
      ${U("Person","profile_id",t[0]?.profile_id||t[0]?.member_id||"",t.map(a=>[a.profile_id||a.member_id,a.name]))}
      <label><span>First message</span><textarea name="body" rows="3" placeholder="Start with a short note"></textarea></label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Start chat</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function wl(e,t){const a=n.messageConversations.find(l=>l.id===t);if(!a)return O("Messages","Chat access",v("Conversation not found."));const i=Ta(a.id),s=i.filter(l=>l.target_type==="role").map(l=>l.target_id),o=i.filter(l=>l.target_type==="profile").map(l=>l.target_id);return O("Messages","Chat access",`
    <form class="message-modal-form" data-message-access-form data-conversation-id="${r(a.id)}">
      ${F("Chat name","title",a.title,!0)}
      ${U("Type","type",a.type,[["company","Company-wide"],["role","Role-based"],["custom","Custom group"],["direct","Direct message"]])}
      ${ps(e,s)}
      ${fs(ie(e),o)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save access</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function ps(e,t=[]){const a=new Set(t);return`
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>Roles</strong>
        <small>Good for large crews. Access updates when role assignments change.</small>
      </div>
      <div class="message-role-grid">
        ${de(e).map(i=>`
          <label class="message-role-option" style="--role-color:${r(i.color)}">
            <input type="checkbox" name="role_ids" value="${r(i.id)}" ${a.has(i.id)?"checked":""} />
            <span></span>
            <strong>${r(i.name)}</strong>
          </label>
        `).join("")}
      </div>
    </section>
  `}function fs(e,t=[]){const a=new Set(t),i=e.slice().sort((s,o)=>Ye(s).localeCompare(Ye(o)));return`
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>People</strong>
        <small>${i.length} member${i.length===1?"":"s"} available. Search instead of scrolling huge teams.</small>
      </div>
      <label class="message-member-search">
        <span>Find person</span>
        <input data-message-access-filter placeholder="Search name, email, or role" />
      </label>
      <div class="message-picker-count" data-message-filter-count>${i.length} member${i.length===1?"":"s"}</div>
      <div class="message-selected-strip">
        ${i.filter(s=>a.has(s.profile_id||s.member_id)).slice(0,8).map(s=>`
          <span>${Z(Mn(s),"avatar tiny-avatar")} ${r(Ye(s))}</span>
        `).join("")||"<small>No individual people selected.</small>"}
      </div>
      <div class="message-people-list">
        ${i.map(s=>{const o=s.profile_id||s.member_id;return`
            <label class="message-person-row" data-message-person-row data-filter-text="${r([Ye(s),s.email,s.role_label,s.role].join(" ").toLowerCase())}">
              <input type="checkbox" name="profile_ids" value="${r(o)}" ${a.has(o)?"checked":""} />
              ${Z(Mn(s),"avatar message-person-avatar")}
              <span>
                <strong>${r(Ye(s))}</strong>
                <small>${r(mu(s))}</small>
              </span>
            </label>
          `}).join("")||v("No people available in this company yet.")}
      </div>
    </section>
  `}function $l(e,t){const a=n.messageConversations.find(i=>i.id===t);return a?O("Messages",a.title,`
    ${W([["Type",T(a.type)],["Access",Gi(a)],["Messages",String(je(a.id).length)],["Attachments",String(Ia(a.id).length)],["Last message",E(a.last_message_at)]])}
  `,"message-modal"):O("Messages","Chat details",v("Conversation not found."))}function Sl(e){const t=n.messageQuery.trim().toLowerCase(),a=Oe(e).flatMap(i=>je(i.id).filter(s=>!t||s.body.toLowerCase().includes(t)).map(s=>({conversation:i,message:s})));return O("Messages","Search results",`
    <div class="queue-list">
      ${a.slice(0,30).map(({conversation:i,message:s})=>`
        <a class="queue-row" href="${_(m("messages",{conversation:i.id},e))}" data-router>
          <span><strong>${r(i.title)}</strong><small>${r(s.body||"Attachment")}</small></span>
          <em>${dt(s.created_at)}</em>
        </a>
      `).join("")||v("No matching messages. Type in the Messages search box first.")}
    </div>
  `,"message-modal")}function kl(e,t){const a=Ls(t),i=ve(t),s=Rs(t).slice().sort(qt("received_at")).slice(0,5),o=xi(t).slice().sort(qt("spent_at")).slice(0,5),l=Oi(t).slice().sort((c,f)=>c.name.localeCompare(f.name)).slice(0,5),d=h("finance.manage",t);return`
    <section class="tool-page finance-page">
      ${X("Finance","Invoices, payments, expenses, vendors, and job-linked money in one company view.",`
        ${d?`
          <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
          <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
          <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
          <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        `:""}
        <a class="btn" href="${_(m("finance",{report:"summary"},t))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
      `)}
      <section class="metric-grid finance-metrics">
        ${M("Estimated pipeline",C(a.pipeline))}
        ${M("Invoiced",C(a.invoiced))}
        ${M("Collected",C(a.collected))}
        ${M("Outstanding",C(a.outstanding))}
        ${M("Expenses",C(a.expenses))}
        ${M("Net position",C(a.net))}
      </section>
      <section class="panel finance-aging">
        <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
        <div class="finance-aging-grid">
          ${[["Current",a.aging.current],["1-30",a.aging.thirty],["31-60",a.aging.sixty],["61+",a.aging.overSixty]].map(([c,f])=>`<div><span>${r(c)}</span><strong>${C(f)}</strong></div>`).join("")}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${i.length} billing record${i.length===1?"":"s"} for ${r(I(t))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${i.map(c=>`
            <a class="table-row" href="${_(m("finance",{invoice:c.id},t))}" data-router>
              <span><strong>${r(c.invoice_number)}</strong><small>${r(c.client_name||P(c.job_id)?.client_name||"No client")}</small></span>
              <span>${cu(Ns(c))}</span>
              <span>${r(P(c.job_id)?.name||"Company level")}</span>
              <span>${E(c.due_date)}</span>
              <span>${C(c.total)}</span>
              <span>${C(Pi(c.id))}</span>
              <span>${C(pe(c.id))}</span>
            </a>
          `).join("")||v("No invoices yet. Create one from a job or customer record.")}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${s.map(c=>ze(Pe(c.invoice_id)?.invoice_number||"Payment",c.method,C(c.amount),c.received_at)).join("")||v("No payments recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${o.map(c=>ze(ti(c.vendor_id),c.category,C(c.amount),c.spent_at,m("finance",{expense:c.id},t))).join("")||v("No expenses recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${l.map(c=>ze(c.name,c.category,c.status,c.updated_at,m("finance",{vendor:c.id},t))).join("")||v("No vendors recorded.")}
          </div>
        </article>
      </section>
      ${d?"":'<p class="small-note">Your role can view finance records. Creating or editing invoices, payments, expenses, and vendors requires finance manage permission.</p>'}
    </section>
  `}function Dl(e,t){return e.params.get("invoice")?Cl(t,e.params.get("invoice")):e.params.get("expense")?jl(t,e.params.get("expense")):e.params.get("vendor")?ql(t,e.params.get("vendor")):e.params.get("report")==="summary"?Al(t):""}function Cl(e,t){const a=Pe(t);if(!a||a.company_id!==e)return O("Finance","Invoice",v("Invoice not found."));const i=Us(a.id),s=P(a.job_id);return O("Finance",a.invoice_number,`
    <div class="finance-detail-modal">
      ${W([["Client",a.client_name||s?.client_name||"No client"],["Status",Ns(a)],["Job",s?.name||"Company level"],["Issued",E(a.issue_date)],["Due",E(a.due_date)],["Total",C(a.total)],["Collected",C(Pi(a.id))],["Balance",C(pe(a.id))]])}
      <div class="finance-modal-actions">
        ${h("finance.manage",e)?`
          <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${r(a.id)}"><i class="ti ti-cash"></i>Record payment</button>
          <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        `:""}
        ${s?`<a class="btn" href="${_(m("jobs",{tab:"profile",job_id:s.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${i.length} payment${i.length===1?"":"s"} applied.</p></div></div>
        <div class="finance-compact-list">
          ${i.map(o=>ze(o.reference||o.method,o.method,C(o.amount),o.received_at)).join("")||v("No payments yet.")}
        </div>
      </section>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function jl(e,t){const a=Ps(t);if(!a||a.company_id!==e)return O("Finance","Expense",v("Expense not found."));const i=P(a.job_id);return O("Finance",`${ti(a.vendor_id)} expense`,`
    <div class="finance-detail-modal">
      ${W([["Vendor",ti(a.vendor_id)],["Category",a.category],["Status",a.status],["Job",i?.name||"Company level"],["Spent",E(a.spent_at)],["Amount",C(a.amount)]])}
      <div class="finance-modal-actions">
        ${h("finance.manage",e)?`<button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit expense</button>`:""}
        ${i?`<a class="btn" href="${_(m("files",{job_id:i.id},e))}" data-router><i class="ti ti-folder"></i>Job files</a>`:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function ql(e,t){const a=Ri(t);if(!a||a.company_id!==e)return O("Finance","Vendor",v("Vendor not found."));const i=xi(e).filter(s=>s.vendor_id===a.id);return O("Finance",a.name,`
    <div class="finance-detail-modal">
      ${W([["Contact",a.contact_name||"No contact"],["Email",a.email||"No email"],["Phone",a.phone||"No phone"],["Category",a.category],["Status",a.status],["Spend",C(me(i,"amount"))]])}
      <div class="finance-modal-actions">
        ${h("finance.manage",e)?`
          <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
          <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${r(a.id)}"><i class="ti ti-receipt"></i>Add expense</button>
        `:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Al(e){const t=Ls(e);return O("Finance","Summary report",`
    <div class="finance-report-modal">
      ${W([["Company",I(e)],["Estimated pipeline",C(t.pipeline)],["Invoiced",C(t.invoiced)],["Collected",C(t.collected)],["Outstanding",C(t.outstanding)],["Expenses",C(t.expenses)],["Net position",C(t.net)]])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${C(t.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${C(t.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${C(t.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${C(t.aging.overSixty)}</strong></div>
      </div>
    </div>
  `,"finance-modal")}function gn(e,t=null){const a=t||Zd(e);return O("Finance",t?"Edit invoice":"New invoice",`
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${F("Invoice number","invoice_number",a.invoice_number,!0)}
      ${U("Linked job","job_id",a.job_id||"",[["","Company level"]].concat(Q(e).map(i=>[i.id,i.name])))}
      ${F("Client","client_name",a.client_name,!0)}
      ${U("Status","status",a.status,Vn.map(i=>[i,i]))}
      ${F("Issue date","issue_date",a.issue_date,!1,"date")}
      ${F("Due date","due_date",a.due_date,!1,"date")}
      ${F("Subtotal","subtotal",a.subtotal,!1,"number")}
      ${F("Tax","tax",a.tax,!1,"number")}
      ${De("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Ml(e,t=""){const a=Xd(e,t),i=ve(e).map(s=>[s.id,`${s.invoice_number} - ${s.client_name||P(s.job_id)?.client_name||"No client"}`]);return O("Finance","Record payment",`
    <form class="finance-form" data-finance-payment-form>
      ${U("Invoice","invoice_id",a.invoice_id,i.length?i:[["","Create an invoice first"]])}
      ${F("Amount","amount",a.amount,!0,"number")}
      ${U("Method","method",a.method,Hn.map(s=>[s,s]))}
      ${F("Received","received_at",a.received_at,!1,"date")}
      ${F("Reference","reference",a.reference)}
      ${De("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function bn(e,t=null,a=""){const i=t||eu(e,a),s=Oi(e).map(o=>[o.id,o.name]);return O("Finance",t?"Edit expense":"Add expense",`
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${r(i.id)}" />
      ${U("Vendor","vendor_id",i.vendor_id,s.length?s:[["","No vendor yet"]])}
      ${U("Linked job","job_id",i.job_id||"",[["","Company level"]].concat(Q(e).map(o=>[o.id,o.name])))}
      ${U("Category","category",i.category,ja.map(o=>[o,o]))}
      ${U("Status","status",i.status,Yn.map(o=>[o,o]))}
      ${F("Amount","amount",i.amount,!0,"number")}
      ${F("Spent date","spent_at",i.spent_at,!1,"date")}
      ${De("Notes","notes",i.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function _n(e,t=null){const a=t||tu(e);return O("Finance",t?"Edit vendor":"Add vendor",`
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${F("Vendor name","name",a.name,!0)}
      ${F("Contact","contact_name",a.contact_name)}
      ${F("Email","email",a.email,!1,"email")}
      ${F("Phone","phone",a.phone)}
      ${U("Category","category",a.category,ja.map(i=>[i,i]))}
      ${U("Status","status",a.status,Bn.map(i=>[i,i]))}
      ${De("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Fl(e,t){return e.section==="clock"?Rl(t):e.section==="calendar"?Il(e,t):e.section==="approvals"?Pl(t):Ol(t)}function Aa(e,t){return`
    ${ki("Operations sections",[[m("time",{},e),"My time",t==="time"],[m("calendar",{},e),"Calendar",t==="calendar"],[m("approvals",{},e),"Approvals",t==="approvals"],[m("clock",{},e),"Clock dashboard",t==="clock"]])}
  `}function Il(e,t){const a=ud(t),i=Ea(t),s=a.filter(c=>c.dateKey===k(0)),o=i.filter(c=>c.mine),l=i.filter(c=>c.source!=="manual").length,d=h("calendar.manage",t);return`
    <section class="tool-page operations-page calendar-page">
      ${X("Calendar","Company schedule built from tasks, approvals, finance due dates, time context, and manual events.",`
        <button class="btn btn-primary" type="button" data-action="open-calendar-event-form"><i class="ti ti-calendar-plus"></i>New event</button>
      `)}
      ${Aa(t,"calendar")}
      <section class="metric-grid operations-metrics calendar-metrics">
        ${M("Today",s.length)}
        ${M("This week",wd(a).length)}
        ${M("Mine",o.length)}
        ${M("From modules",l)}
      </section>
      <section class="workspace-toolbar calendar-toolbar">
        <div class="segmented" role="group" aria-label="Calendar scope">
          <button class="${n.calendarScope==="company"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="company"><i class="ti ti-building"></i>Company</button>
          <button class="${n.calendarScope==="me"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="me"><i class="ti ti-user"></i>Me</button>
        </div>
        <div class="segmented" role="group" aria-label="Calendar view">
          ${["month","week","list"].map(c=>`<button class="${n.calendarView===c?"active":""}" type="button" data-action="set-calendar-view" data-view="${r(c)}">${r(T(c))}</button>`).join("")}
        </div>
        <label class="wide-control">
          <span>Search</span>
          <input data-calendar-search value="${r(n.calendarQuery)}" placeholder="Find events, jobs, tasks, or people" />
        </label>
        <label>
          <span>Type</span>
          <select data-calendar-type-filter>
            <option value="all">All types</option>
            ${$r.map(c=>`<option value="${r(c)}" ${n.calendarTypeFilter===c?"selected":""}>${r(c)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="calendar-nav">
        <div>
          <button class="btn" type="button" data-action="calendar-prev"><i class="ti ti-chevron-left"></i></button>
          <button class="btn" type="button" data-action="calendar-today">Today</button>
          <button class="btn" type="button" data-action="calendar-next"><i class="ti ti-chevron-right"></i></button>
        </div>
        <strong>${r(kd())}</strong>
      </section>
      <section class="calendar-shell">
        <article class="panel calendar-main">
          ${n.calendarView==="month"?Tl(t,a):""}
          ${n.calendarView==="week"?El(t,a):""}
          ${n.calendarView==="list"?xl(t,a):""}
        </article>
        <aside class="panel calendar-agenda">
          <div class="section-head"><div><h2>Agenda</h2><p>Next events that match this view.</p></div></div>
          <div class="calendar-agenda-list">
            ${a.slice(0,9).map(bs).join("")||v("No calendar items match this view.")}
          </div>
        </aside>
      </section>
      ${d?"":'<p class="small-note">Your role can view the calendar. Manual company events require calendar manage permission.</p>'}
    </section>
  `}function Tl(e,t){const a=Sd(n.calendarCursorDate),i=new Date(`${n.calendarCursorDate}T00:00:00`).getMonth();return`
    <div class="calendar-grid calendar-month-grid">
      ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(s=>`<div class="calendar-weekday">${s}</div>`).join("")}
      ${a.map(s=>{const o=As(t,s.key);return`
          <div class="calendar-day ${s.month===i?"":"muted"} ${s.key===k(0)?"today":""}">
            <div class="calendar-day-head"><b>${s.label}</b><span>${o.length||""}</span></div>
            ${o.slice(0,3).map(gs).join("")}
            ${o.length>3?`<small class="calendar-more">+${o.length-3} more</small>`:""}
          </div>
        `}).join("")}
    </div>
  `}function El(e,t){return`
    <div class="calendar-grid calendar-week-grid">
      ${Ms(n.calendarCursorDate).map(i=>{const s=As(t,i.key);return`
          <div class="calendar-day ${i.key===k(0)?"today":""}">
            <div class="calendar-day-head"><b>${r(i.name)}</b><span>${r(i.shortDate)}</span></div>
            ${s.map(gs).join("")||'<small class="calendar-empty-day">Open</small>'}
          </div>
        `}).join("")}
    </div>
  `}function xl(e,t){const a=Dd(t);return`
    <div class="calendar-list">
      ${Object.entries(a).slice(0,18).map(([s,o])=>`
        <section class="calendar-list-day">
          <h3>${r(E(s))}</h3>
          ${o.map(bs).join("")}
        </section>
      `).join("")||v("No scheduled work or events.")}
    </div>
  `}function gs(e){return`
    <button class="calendar-pill ${r(Cd(e.type))}" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <span>${r(Fs(e))}</span>
      <strong>${r(e.title)}</strong>
    </button>
  `}function bs(e){return`
    <button class="calendar-agenda-item" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <i class="ti ${r(jd(e.type))}"></i>
      <span><strong>${r(e.title)}</strong><small>${r(`${E(e.dateKey)} · ${Fs(e)} · ${e.type}`)}</small></span>
    </button>
  `}function Ol(e){const t=Es(e),a=Ut(e);return`
    <section class="tool-page operations-page">
      ${X("My time","A compact personal work queue built from this company's tasks.",`
        <a class="btn" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Aa(e,"time")}
      <section class="metric-grid operations-metrics">
        ${M("Due today",t.dueToday.length)}
        ${M("Overdue",t.overdue.length)}
        ${M("Open work",t.open.length)}
        ${M("In review",t.review.length)}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel span-2">
          <div class="section-head"><div><h2>Today</h2><p>Due now, overdue, and highest priority work.</p></div></div>
          <div class="queue-list">
            ${t.focus.slice(0,8).map(i=>Hi(i)).join("")||v("No time-sensitive tasks for this company.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
          ${W([["Company",I(e)],["Assigned to you",String(t.assignedToMe.length)],["Due this week",String(t.thisWeek.length)],["Completed",String(t.done.length)]])}
        </article>
      <article class="panel span-2">
          <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
          <div class="data-table operations-table">
            <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
            ${t.thisWeek.slice(0,8).map(i=>`
              <a class="table-row" href="${_(m("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},e))}" data-router>
                <span><strong>${r(i.title)}</strong><small>${r(i.description||Qe(i.type))}</small></span>
                <span>${r(P(i.project_id)?.name||"Company task")}</span>
                <span>${r(H(i.assignee_id))}</span>
                <span>${E(i.due)}</span>
                <span>${Ws(i.status)}</span>
              </a>
            `).join("")||v("No upcoming tasks this week.")}
          </div>
        </article>
      </section>
    </section>
  `}function Rl(e){const t=xs(e),a=Ut(e),i=ut().getTime(),s=i-6*864e5,o=Cn(e,i)+(a?Date.now()-Date.parse(a.started_at):0),l=Cn(e,s)+(a?Date.now()-Date.parse(a.started_at):0);return`
    <section class="tool-page operations-page clock-page">
      ${X("Clock dashboard","Local basic-mode clock tracking for the active company.",`
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Aa(e,"clock")}
      <section class="metric-grid operations-metrics">
        ${M("Today",ta(o))}
        ${M("Last 7 days",ta(l))}
        ${M("Entries",t.length)}
        ${M("Status",a?"Clocked in":"Off clock")}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${a?W([["User",H(a.user_id)],["Started",fa(a.started_at)],["Task",a.task_title||"General shift"],["Elapsed",ta(Date.now()-Date.parse(a.started_at))]]):v("Nobody is clocked in on this device.")}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${t.slice(0,10).map(d=>`
              <div class="table-row">
                <span><strong>${r(d.task_title||"General shift")}</strong><small>${r(d.notes||"Clock entry")}</small></span>
                <span>${r(H(d.user_id))}</span>
                <span>${fa(d.started_at)}</span>
                <span>${ta(d.duration_ms)}</span>
              </div>
            `).join("")||v("No clock entries yet.")}
          </div>
        </article>
      </section>
    </section>
  `}function Pl(e){const t=Ti(e),a=t.filter(o=>o.type==="Form approval"),i=t.filter(o=>o.type==="Task review"),s=t.filter(o=>o.type==="Access request");return`
    <section class="tool-page operations-page">
      ${X("Approvals","Company review queue for forms, task handoffs, and access requests.",`
        <a class="btn" href="${_(m("forms",{},e))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${Aa(e,"approvals")}
      <section class="metric-grid operations-metrics">
        ${M("Open approvals",t.length)}
        ${M("Forms",a.length)}
        ${M("Task reviews",i.length)}
        ${M("Access",s.length)}
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
              <span>${E(o.updatedAt)}</span>
            </a>
          `).join("")||v("No approvals need attention right now.")}
        </div>
      </section>
    </section>
  `}function vn(e){return`
    ${X(T(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${v("Module data model pending.")}
    </section>
  `}function yn(e=!1){document.title="Quest HQ | Company operations workspace";const t=n.route||xt(),a=Ma(t.params.get("return_url")||_(m("jobs",{},L()))),i=String(t.params.get("invite")||"").trim(),s=String(t.params.get("auth")||"").trim(),o=_s(t.params.get("mode")||s,i);o&&n.authMode!==o&&(n.authMode=o),i&&!["signin","register"].includes(n.authMode)&&(n.authMode="register");const l=e||!!(i||s),d=n.session;qa.innerHTML=`
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
          <img class="landing-console-art" src="${r(vr)}" alt="Generated Quest HQ secure workspace cockpit preview showing company access, tasks, messages, finance, files, users, reports, and audit controls." />
          <aside class="landing-console-rail" aria-hidden="true">
            <span class="console-mark">Q</span>
            ${[["ti-home","Home",!0],["ti-list-check","Tasks"],["ti-calendar","Calendar"],["ti-users","CRM"],["ti-lock-dollar","Finance"],["ti-folder","Files"],["ti-forms","Forms"],["ti-message-circle","Messages",!1,"3"],["ti-user-cog","Users"],["ti-report-analytics","Reports"],["ti-settings","Settings"],["ti-clipboard-check","Audit"]].map(([c,f,g,S])=>`
              <span class="${g?"active":""}"><i class="ti ${r(c)}"></i><em>${r(f)}</em>${S?`<b>${r(S)}</b>`:""}</span>
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
              ${[["ti-shield-check","Company access","Pending approval","Approval required before modules open.","View status"],["ti-user-check","Active users","24","18 active · 6 pending","Manage users"],["ti-circle-check","Open tasks","42","12 overdue","View tasks"],["ti-message-circle","Unread messages","8","Across team chats","Open inbox"]].map(([c,f,g,S,V],x)=>`
                <article class="${x===0?"warning":""}">
                  <i class="ti ${r(c)}"></i>
                  <span>${r(f)}</span>
                  <strong>${r(g)}</strong>
                  <small>${r(S)}</small>
                  <button type="button">${r(V)}</button>
                </article>
              `).join("")}
            </div>
            <div class="landing-console-grid">
              <article class="landing-activity">
                <strong>Recent activity</strong>
                ${[["ti-file-dollar","Invoice #INV-1024 was created","Finance","10m ago"],["ti-forms","Shan submitted a form response","Forms","25m ago"],["ti-alert-circle","Leak inspection task was assigned","Tasks","1h ago"],["ti-file-upload","Permit packet.pdf was uploaded","Files","2h ago"],["ti-user-plus","Abraham joined the workspace","Users","3h ago"]].map(([c,f,g,S])=>`
                  <div><i class="ti ${r(c)}"></i><span><b>${r(f)}</b><small>${r(g)}</small></span><em>${r(S)}</em></div>
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
            ${[["ti-crown","Owner","Full access · Billing · Invites · Transfer ownership"],["ti-user-shield","Admin","Manage users · Roles · Module access"],["ti-user","Worker","Assigned access · Own tasks · Team collaboration"],["ti-shield-x","Finance denied","Finance hidden · No billing · No payments"],["ti-hourglass","Pending approval","Workspace created · Modules locked"]].map(([c,f,g],S)=>`
              <div class="${S===4?"pending":""}">
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
      ${l?Ul(a,i):""}
      ${vs()}
    </main>
  `}function Ul(e,t,a){const i=Qd(t);return`
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
              <strong>${i?`Invite found for ${r(i.company_name||"workspace")}`:"Workspace invite"}</strong>
              <span>${i?`${r(i.email)} can create an account or sign in to join.`:"Create an account with the invited email, or sign in if that email already has a Quest HQ account."}</span>
            </div>
          `:""}
          ${`
            ${Nl(t)}
            ${Ql(e)}
          `}
          <details class="demo-mode-details">
            <summary>Demo mode</summary>
            ${Ll(e)}
          </details>
          
        </div>
      </div>
    </div>
  `}function _s(e,t=""){const a=String(e||"").toLowerCase().trim();return t&&!a?"register":["signin","register","invite","request"].includes(a)?a:a==="business"?"register":a==="worker"?t?"register":"invite":""}function Nl(e=""){const t=n.authMode;return`
    <nav class="auth-mode-bar" aria-label="Account access">
      ${(e?[["signin","Sign in"],["register","Create invited account"]]:[["signin","Sign in"],["register","Create workspace"],["invite","Join with invite"]]).map(([i,s])=>`
        <button class="${t===i?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="${r(i)}">${r(s)}</button>
      `).join("")}
    </nav>
  `}function Ll(e){return`
    <section class="demo-mode-box">
      <div>
        <strong>Demo mode</strong>
        <span>Local-only sample workspace. No Supabase database reads or writes.</span>
      </div>
      <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${r(e)}">Open demo mode</button>
    </section>
  `}function Ql(e){const t=String(n.route?.params?.get("invite")||"").trim();return n.authMode==="register"?`
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
        ${Gt(t?"Workers cannot create access without a valid invite code.":"You become Owner, then Quest approves billing/access before the workspace opens.")}
        ${t?'<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="signin">I already have an account</button>':""}
      </form>
    `:n.authMode==="invite"?`
      <form class="auth-form-compact" data-auth-invite-code-form>
        <div class="auth-form-title">
          <strong>Join with invite code</strong>
          <span>Workers need a code from their company admin.</span>
        </div>
        <label>Invite code<input name="invite_code" autocomplete="one-time-code" required placeholder="Paste the code from your admin" /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Continue with invite code</button>
        ${Gt("Invite codes are shared by your Owner/Admin. No email delivery required.")}
      </form>
    `:n.authMode==="request"?`
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
        ${Gt("Requests stay pending until a company Owner/Admin approves them.")}
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
      ${Gt(t?"If you do not have an account yet, create an invited worker account.":"Business owners and workers use the same sign in after access is created.")}
      ${t?'<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="register">Create invited account</button>':""}
    </form>
  `}function Gt(e){return n.loginError?`<div class="form-message error">${r(n.loginError)}</div>`:`<div class="form-message">${r(n.authMessage||e)}</div>`}function Vl(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${Z(e,"avatar large")}
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
  `}function Yl(e,t){if(n.modal==="profile")return Vl(t.profile);if(n.modal==="file-upload")return Fo();if(n.modal==="folder-new")return Mo();if(n.modal==="file-detail")return zl(u());if(n.modal==="forms-tools")return Jl(u());if(n.modal==="form-actions")return Xl(u(),Ct(u()));if(n.modal==="form-new")return Kl(u());if(n.modal==="form-preview")return Zl(u(),Ct(u()));if(n.modal==="job-new")return Ka(u(),null);if(n.modal==="job-edit")return Ka(u(),Ee());if(n.modal==="finance-invoice-new")return gn(u(),null);if(n.modal==="finance-invoice-edit")return gn(u(),Pe(n.selectedFinanceInvoiceId));if(n.modal==="finance-payment-new")return Ml(u(),n.selectedFinanceInvoiceId);if(n.modal==="finance-expense-new")return bn(u(),null,n.selectedFinanceVendorId);if(n.modal==="finance-expense-edit")return bn(u(),Ps(n.selectedFinanceExpenseId));if(n.modal==="finance-vendor-new")return _n(u(),null);if(n.modal==="finance-vendor-edit")return _n(u(),Ri(n.selectedFinanceVendorId));if(n.modal==="role-new")return Vo(u());if(n.modal==="invite-new")return Yo(u());if(n.modal==="message-group-new")return yl(u());if(n.modal==="message-direct-new")return hl(u());if(n.modal==="message-access")return wl(u(),n.selectedConversationId);if(n.modal==="message-details")return $l(u(),n.selectedConversationId);if(n.modal==="message-search")return Sl(u());if(n.modal==="calendar-event-detail")return Wl(u());if(n.modal==="calendar-event-new")return hn(u(),null);if(n.modal==="calendar-event-edit")return hn(u(),Rt(n.selectedCalendarEventId));if(e.name==="company"&&e.section==="crm"&&e.params.get("account"))return nl(e.companyId,e.params.get("account"));if(e.name==="company"&&e.section==="finance"){const a=Dl(e,e.companyId);if(a)return a}return e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"?Ka(e.companyId,e.jobId?P(e.jobId):Ee()):e.name==="company"&&e.section==="tasks"?Hl(e,e.companyId):""}function vs(){return n.toast?`
    <div class="app-toast ${r(n.toast.mode||"local")}" role="status" aria-live="polite">
      <strong>${r(n.toast.title||"Quest HQ")}</strong>
      <span>${r(n.toast.message||"")}</span>
    </div>
  `:""}function $(e,t="local",a="Not available yet"){n.toastTimer&&clearTimeout(n.toastTimer),n.toast={title:a,message:e,mode:t},p(),n.toastTimer=setTimeout(()=>{n.toast=null,n.toastTimer=null,p()},4200)}function O(e,t,a,i=""){return`
    <div class="modal-overlay">
      <div class="modal-panel ${r(i)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </div>
    </div>
  `}function Bl(e,t,a){return`
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </aside>
    </div>
  `}function Ka(e,t){return O("Jobs",t?"Edit job":"Create job",po(e,t),"wide-modal")}function Hl(e,t){const a=e.jobId?P(e.jobId):null,i=e.params.get("task_id")||"",s=i?Fa(i):null;return e.params.get("new")==="1"?O("Tasks","New task",fn(t,a,null),"task-modal"):e.params.get("edit")==="1"&&s?O("Tasks","Edit task",fn(t,a,s),"task-modal"):s?Bl("Task detail",s.title,vo(t,s)):""}function Wl(e){const t=yd(n.selectedCalendarEventId,e);if(!t)return"";const a=t.source==="manual"?Rt(t.sourceId):null,i=[t.href?`<a class="btn btn-primary" href="${_(t.href)}" data-router><i class="ti ti-arrow-right"></i>Open source</a>`:"",a&&t.editable?`<button class="btn" type="button" data-action="edit-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit</button>`:"",a&&t.editable?`<button class="btn danger" type="button" data-action="delete-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-trash"></i>Delete</button>`:""].filter(Boolean).join("");return O("Calendar",t.title,`
    <div class="calendar-detail">
      ${W([["Type",t.type],["When",t.allDay?E(t.dateKey):`${fa(t.startsAt)}${t.endsAt&&t.endsAt!==t.startsAt?` - ${fa(t.endsAt)}`:""}`],["Assigned",t.owner||"Unassigned"],["Source",t.source==="manual"?"Manual event":T(t.source)],["Linked",t.linkLabel||"None"]])}
      ${t.description?`<p>${r(t.description)}</p>`:""}
      <div class="modal-actions">${i||'<span class="small-note">This derived item opens from its source module.</span>'}</div>
    </div>
  `,"calendar-modal")}function hn(e,t){const a=t||au(e),i=a.linked_type==="job"?a.linked_id:"";return O("Calendar",t?"Edit event":"New event",`
    <form class="calendar-form" data-calendar-event-form>
      <input type="hidden" name="id" value="${r(t?.id||"")}" />
      ${F("Title","title",t?a.title:"",!0)}
      ${U("Type","event_type",a.event_type,Ca.map(s=>[s,s]))}
      ${F("Starts","starts_at",qn(a.starts_at),!0,"datetime-local")}
      ${F("Ends","ends_at",qn(a.ends_at||a.starts_at),!0,"datetime-local")}
      <label class="check-row"><input type="checkbox" name="all_day" ${a.all_day?"checked":""} /> All day</label>
      ${U("Visibility","visibility",a.visibility,[["company","Company"],["private","Private / assigned"]])}
      ${U("Assigned to","assigned_profile_id",a.assigned_profile_id,du(e))}
      ${U("Linked job","linked_job_id",i,[["","No linked job"]].concat(Q(e).map(s=>[s.id,s.name])))}
      <label class="span-2">Description<textarea name="description" rows="4">${r(a.description)}</textarea></label>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save event</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"calendar-form-modal")}function zl(e){const t=n.selectedFileId?n.files.find(a=>a.id===n.selectedFileId):null;return t?O("Open file",t.file_name,qo(t,e),"file-viewer-modal"):""}function Jl(e){return O("Forms","Tools",`
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${n.formTypeFilter==="all"?"selected":""}>All types</option>
          ${It.map(t=>`<option value="${r(t)}" ${n.formTypeFilter===t?"selected":""}>${r(t)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `)}function Kl(e){const t=n.formStartTab==="templates"?"templates":"blank",a=_t(),i=t==="templates"&&(a.find(c=>c.id===n.formStartTemplateId)||a[0])||null,s=i?.title||"",o=i?.description||"",l=i?.type||"Internal",d=i?.questions||[{type:"short",label:"First question",required:!1,options:[]}];return O("Forms","New form builder",`
    <form class="new-form-modal builder-create-modal" data-new-form-form>
      <input type="hidden" name="template_id" value="${r(i?.id||"")}" />
      <div class="form-start-tabs" role="tablist" aria-label="New form start type">
        <button class="${t==="blank"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="blank"><i class="ti ti-clipboard-plus"></i>Blank</button>
        <button class="${t==="templates"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="templates"><i class="ti ti-template"></i>Templates</button>
      </div>
      ${t==="templates"?`
        <div class="new-form-template-grid">
          ${a.map(c=>`
            <button class="${i?.id===c.id?"active":""}" type="button" data-action="select-form-start-template" data-template-id="${r(c.id)}">
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
            <div class="gform-accent-strip" style="--form-accent:${r(qe(e))}"></div>
            <label><span>Form title</span><input name="title" value="${r(s)}" placeholder="Untitled form" required /></label>
            <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${r(o)}</textarea></label>
          </article>
          <div class="new-form-question-list">
            ${d.map((c,f)=>Gl(c,f)).join("")}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${i?r(i.title):"Blank starter"}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${It.map(c=>`<option value="${r(c)}" ${c===l?"selected":""}>${r(c)}</option>`).join("")}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${Q(e).map(c=>`<option value="${r(c.id)}" ${n.route?.jobId===c.id?"selected":""}>${r(c.name)}</option>`).join("")}</select></label>
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
  `,"form-create-modal builder-modal")}function Gl(e,t){const a=jt(e)?`
    <div class="starter-options">
      ${(e.options||["Option 1","Option 2"]).map(i=>`<span>${r(i)}</span>`).join("")}
    </div>
  `:"";return`
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${t+1}</span>
        <strong>${r(Pu(e.type))}</strong>
      </div>
      <label><span>Question</span><input value="${r(e.label||"Untitled question")}" readonly /></label>
      ${e.help?`<small>${r(e.help)}</small>`:""}
      ${a}
      <label class="check-row"><input type="checkbox" ${e.required?"checked":""} disabled /> Required</label>
    </article>
  `}function Zl(e,t){return t?O("Forms","Preview form",`
    <div class="form-preview-modal-body">
      ${el(e,t)}
    </div>
  `,"form-preview-modal"):O("Forms","Preview form",v("Choose a form first."))}function Xl(e,t){return t?O("Forms","Manage form",`
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
  `):O("Forms","Manage form",v("Choose a form first."))}function ec(e){const t=n.accountMenuOpen&&!e.target.closest(".account-menu"),a=n.notificationMenuOpen&&!e.target.closest(".notification-center");t&&(n.accountMenuOpen=!1),a&&(n.notificationMenuOpen=!1);const i=e.target.closest("[data-action]");if(i){tc(e,i);return}const s=e.target.closest("[data-select-job]");if(s){e.preventDefault(),od(s.dataset.selectJob);return}const o=e.target.closest("[data-select-task]");if(o){e.preventDefault(),ld(o.dataset.selectTask);return}const l=e.target.closest("a[href][data-router]");if(!l){(t||a)&&p();return}l.target||l.hasAttribute("download")||(e.preventDefault(),j(l.getAttribute("href")))}function tc(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),n.dataLoaded=!1,n.sync={label:"Refreshing...",mode:"loading"},p();return}if(a==="sign-out"){e.preventDefault(),n.accountMenuOpen=!1,nc();return}if(a==="toggle-account-menu"){e.preventDefault(),n.accountMenuOpen=!n.accountMenuOpen,n.notificationMenuOpen=!1,p();return}if(a==="toggle-notifications"){e.preventDefault(),n.notificationMenuOpen=!n.notificationMenuOpen,n.accountMenuOpen=!1,p();return}if(a==="toggle-sidebar"){e.preventDefault(),n.sidebarCollapsed=!n.sidebarCollapsed,localStorage.setItem(Un,String(n.sidebarCollapsed)),p();return}if(a==="mark-all-notifications-read"){e.preventDefault(),ju(u()).catch(i=>console.warn("Notification read sync failed",i));return}if(a==="open-notification"){e.preventDefault(),qu(t.dataset.notificationId).catch(i=>console.warn("Notification open sync failed",i));return}if(a==="verify-email"){e.preventDefault(),n.accountMenuOpen=!1,$("Email verification is not implemented yet. Account access is not blocked right now.","local");return}if(a==="start-demo-mode"){e.preventDefault(),ys(t.dataset.returnUrl||"");return}if(a==="open-auth-modal"){e.preventDefault();const i=_s(t.dataset.authMode||"signin")||"signin";n.authMode=i,n.loginError="",n.authMessage="",j(`/?auth=${encodeURIComponent(i)}`);return}if(a==="close-auth-modal"){e.preventDefault(),n.loginError="",n.authMessage="",j("/");return}if(a==="set-auth-mode"){e.preventDefault();const i=["signin","register","invite","request"].includes(t.dataset.authMode)?t.dataset.authMode:"signin";if(n.authMode=i,n.loginError="",n.authMessage="",n.route?.name==="home"||n.route?.name==="login"){const s=new URLSearchParams(n.route.params);n.route.name==="home"?(s.set("auth",i),s.delete("mode")):(s.set("mode",i),s.delete("auth"));const o=s.toString();j(`${n.route.path}${o?`?${o}`:""}`,{replace:!0});return}p();return}if(a==="open-profile"){e.preventDefault(),n.accountMenuOpen=!1,n.modal="profile",p();return}if(a==="open-role-form"){if(e.preventDefault(),!y("roles.manage",u(),"Your role cannot manage roles.","Roles"))return;n.modal="role-new",p();return}if(a==="view-as-role"){e.preventDefault();const i=u(),s=ct(i,t.dataset.roleId);if(!s){$("That role is no longer available.","local","Role preview");return}n.rolePreview={company_id:i,role_id:s.id},$(`Viewing the workspace as ${s.name}.`,"local","Role preview");return}if(a==="exit-role-preview"){e.preventDefault(),n.rolePreview=null,$("Role preview ended.","live","Role preview");return}if(a==="open-invite-form"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot invite or manage users.","Users"))return;n.modal="invite-new",p();return}if(a==="new-message-group"){if(e.preventDefault(),!y("messages.create_group",u(),"Your role cannot create group chats.","Messages"))return;n.modal="message-group-new",p();return}if(a==="new-direct-message"){if(e.preventDefault(),!y("messages.send",u(),"Your role cannot start direct messages.","Messages"))return;n.modal="message-direct-new",p();return}if(a==="manage-message-chat"){if(e.preventDefault(),!y("messages.manage_groups",u(),"Your role cannot manage chat access.","Messages"))return;n.selectedConversationId=t.dataset.conversationId||n.selectedConversationId,n.modal="message-access",p();return}if(a==="message-details"){e.preventDefault(),n.selectedConversationId=t.dataset.conversationId||n.selectedConversationId,n.modal="message-details",p();return}if(a==="message-search-results"){e.preventDefault(),n.modal="message-search",p();return}if(a==="set-message-filter"){e.preventDefault(),n.messageFilter=["all","unread",...vi].includes(t.dataset.filter)?t.dataset.filter:"all",p();return}if(a==="delete-message"){e.preventDefault(),Ac(t.dataset.messageId);return}if(a==="open-message-attachment"){e.preventDefault(),Mc(t.dataset.attachmentId);return}if(a==="run-message-scenario"){e.preventDefault(),_u(u());return}if(a==="reset-message-demo"){e.preventDefault(),yu();return}if(a==="set-calendar-scope"){e.preventDefault(),n.calendarScope=t.dataset.scope==="me"?"me":"company",p();return}if(a==="set-calendar-view"){e.preventDefault(),n.calendarView=["month","week","list"].includes(t.dataset.view)?t.dataset.view:"week",p();return}if(a==="calendar-prev"){e.preventDefault(),Dn(-1),p();return}if(a==="calendar-next"){e.preventDefault(),Dn(1),p();return}if(a==="calendar-today"){e.preventDefault(),n.calendarCursorDate=k(0),p();return}if(a==="open-calendar-event"){e.preventDefault(),n.selectedCalendarEventId=t.dataset.eventId||"",n.modal="calendar-event-detail",p();return}if(a==="open-calendar-event-form"){if(e.preventDefault(),!h("calendar.manage",u())){$("Your role can view the calendar but cannot create company events.","local","Calendar");return}n.selectedCalendarEventId="",n.modal="calendar-event-new",p();return}if(a==="edit-calendar-event"){e.preventDefault();const i=Rt(t.dataset.eventId);if(!i||!Ot(i)){$("This event cannot be edited from Calendar.","local","Calendar");return}n.selectedCalendarEventId=i.id,n.modal="calendar-event-edit",p();return}if(a==="delete-calendar-event"){e.preventDefault(),jc(t.dataset.eventId);return}if(a==="copy-invite-link"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot view invite links.","Users"))return;vc(t.dataset.inviteId);return}if(a==="copy-invite-code"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot view invite codes.","Users"))return;yc(t.dataset.inviteId);return}if(a==="revoke-invite"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot revoke invites.","Users"))return;hc(t.dataset.inviteId);return}if(a==="approve-join-request"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot approve access requests.","Users"))return;wn(t.dataset.requestId,"approved");return}if(a==="reject-join-request"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot reject access requests.","Users"))return;wn(t.dataset.requestId,"rejected");return}if(a==="start-checkout"){e.preventDefault(),pc();return}if(a==="review-workspace"){e.preventDefault(),fc(t.dataset.companyId,t.dataset.status);return}if(a==="open-file-upload"){if(e.preventDefault(),!y("files.manage",u(),"Your role can view files but cannot upload.","Files"))return;n.modal="file-upload",p();return}if(a==="open-folder-form"){if(e.preventDefault(),!y("files.manage",u(),"Your role can view files but cannot create folders.","Files"))return;n.modal="folder-new",p();return}if(a==="open-job-form"){if(e.preventDefault(),!y("jobs.manage",u(),"Your role can view jobs but cannot create or edit them.","Jobs"))return;const i=t.dataset.jobId||"";i&&(n.selectedJobId=i),n.modal=t.dataset.mode==="edit"?"job-edit":"job-new",p();return}if(a==="open-forms-tools"){if(e.preventDefault(),!y("forms.manage",u(),"Your role can view forms but cannot create or edit them.","Forms"))return;n.modal="forms-tools",p();return}if(a==="open-form-actions"){e.preventDefault(),ea(t.dataset.formId,!1),n.modal="form-actions",p();return}if(a==="open-form-preview"){e.preventDefault(),ea(t.dataset.formId,!1),n.modal="form-preview",p();return}if(a==="set-form-start-tab"){e.preventDefault(),n.formStartTab=t.dataset.tab==="templates"?"templates":"blank",n.formStartTab==="blank"&&(n.formStartTemplateId=""),n.formStartTab==="templates"&&!n.formStartTemplateId&&(n.formStartTemplateId=_t()[0]?.id||""),p();return}if(a==="select-form-start-template"){e.preventDefault(),n.formStartTab="templates",n.formStartTemplateId=t.dataset.templateId||_t()[0]?.id||"",p();return}if(a==="close-modal"){e.preventDefault(),ac();return}if(a==="set-task-view"){e.preventDefault(),n.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(Rn,n.taskView),p();return}if(a==="set-drive-view"){e.preventDefault(),n.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem(Pn,n.driveView),p();return}if(a==="clock-in"){e.preventDefault(),Od(u(),t.dataset.taskId||n.route?.params?.get("task_id")||"");return}if(a==="clock-out"){e.preventDefault(),Os();return}if(a==="select-file"){e.preventDefault(),n.selectedFileId=t.dataset.fileId||"",n.modal="file-detail",p();return}if(a==="download-file"){e.preventDefault(),Hc(t.dataset.fileId);return}if(a==="delete-file"){if(e.preventDefault(),!y("files.manage",u(),"Your role cannot delete files.","Files"))return;Wc(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),n.formsTab=t.dataset.tab==="responses"?"responses":"library",p();return}if(a==="set-form-editor-tab"){e.preventDefault(),n.formEditorTab=t.dataset.tab||"questions",p();return}if(a==="new-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role can view forms but cannot create them.","Forms"))return;n.formStartTemplateId=t.dataset.templateId||"",n.formStartTab=t.dataset.startTab==="templates"||n.formStartTemplateId?"templates":"blank",n.formStartTab==="templates"&&!n.formStartTemplateId&&(n.formStartTemplateId=_t()[0]?.id||""),n.modal="form-new",p();return}if(a==="select-form"){e.preventDefault(),ea(t.dataset.formId);return}if(a==="toggle-form-card"){e.preventDefault();const i=t.dataset.formId||"";n.expandedFormIds.has(i)?n.expandedFormIds.delete(i):n.expandedFormIds.add(i),p();return}if(a==="edit-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;ea(t.dataset.formId,!1),n.formsTab="builder",n.formEditorTab="questions",n.modal="",p();return}if(a==="save-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;se("Form saved locally"),p();return}if(a==="publish-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot publish forms.","Forms"))return;En(t.dataset.formId,"Published");return}if(a==="archive-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot archive forms.","Forms"))return;En(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot duplicate forms.","Forms"))return;Qu(t.dataset.formId);return}if(a==="delete-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot delete forms.","Forms"))return;Vu(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),Yu(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),Bu(u());return}if(a==="new-finance-invoice"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");n.selectedFinanceInvoiceId="",n.modal="finance-invoice-new",p();return}if(a==="edit-finance-invoice"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");n.selectedFinanceInvoiceId=t.dataset.invoiceId||"",n.modal="finance-invoice-edit",p();return}if(a==="new-finance-payment"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");n.selectedFinanceInvoiceId=t.dataset.invoiceId||n.route?.params?.get("invoice")||"",n.modal="finance-payment-new",p();return}if(a==="new-finance-expense"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");n.selectedFinanceExpenseId="",n.selectedFinanceVendorId=t.dataset.vendorId||"",n.modal="finance-expense-new",p();return}if(a==="edit-finance-expense"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");n.selectedFinanceExpenseId=t.dataset.expenseId||"",n.modal="finance-expense-edit",p();return}if(a==="new-finance-vendor"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");n.selectedFinanceVendorId="",n.modal="finance-vendor-new",p();return}if(a==="edit-finance-vendor"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");n.selectedFinanceVendorId=t.dataset.vendorId||"",n.modal="finance-vendor-edit",p();return}if(a==="add-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Hu(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Wu(t.dataset.questionId);return}if(a==="delete-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;zu(t.dataset.questionId);return}if(a==="move-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Ju(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Ku(t.dataset.questionId);return}if(a==="remove-question-option"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Gu(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){if(e.preventDefault(),!y("jobs.manage",u(),"Your role cannot delete jobs.","Jobs"))return;Ec(t.dataset.jobId);return}if(a==="delete-task"){if(e.preventDefault(),!y("tasks.manage",u(),"Your role cannot delete tasks.","Tasks"))return;Oc(t.dataset.taskId)}}function ac(){const e=n.route||xt();if(n.modal="",n.formStartTemplateId="",n.formStartTab="blank",n.selectedFinanceInvoiceId="",n.selectedFinanceExpenseId="",n.selectedFinanceVendorId="",e.name==="company"&&e.section==="tasks"&&(e.params.get("new")||e.params.get("edit")||e.params.get("task_id"))){j(m("tasks",e.jobId?{job_id:e.jobId}:{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"){const t=e.jobId?P(e.jobId):Ee();j(m("jobs",{tab:t?"profile":"pipeline",...t?{job_id:t.id}:{}},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="crm"&&e.params.get("account")){j(m("crm",{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="finance"&&(e.params.get("invoice")||e.params.get("expense")||e.params.get("vendor")||e.params.get("report"))){j(m("finance",{},e.companyId),{replace:!0});return}p()}function ic(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===Je.localUsername&&String(t.password||"")===Je.localPassword)){n.loginError="Invalid temporary credentials.",p();return}n.loginError="",ys(t.return_url||_(m("jobs",{},L())));return}if(e.target.matches("[data-auth-sign-in-form]")){e.preventDefault(),oc(e.target);return}if(e.target.matches("[data-auth-register-form]")){e.preventDefault(),dc(e.target);return}if(e.target.matches("[data-auth-invite-code-form]")){e.preventDefault(),lc(e.target);return}if(e.target.matches("[data-existing-invite-code-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries()),a=String(t.invite_code||"").trim();if(!a){n.loginError="Invite code is required.",p();return}Di(a);return}if(e.target.matches("[data-auth-request-form]")){e.preventDefault(),mc(e.target);return}if(e.target.matches("[data-company-create-form]")){e.preventDefault(),uc(e.target);return}if(e.target.matches("[data-profile-form]")){e.preventDefault(),sc(e.target).catch(t=>{$(t.message||"Profile save failed.","local","Profile")});return}if(e.target.matches("[data-job-form]")){e.preventDefault(),Tc(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),xc(e.target);return}if(e.target.matches("[data-new-form-form]")){e.preventDefault(),Lu(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),Rc(e.target);return}if(e.target.matches("[data-folder-form]")){e.preventDefault(),Pc(e.target);return}if(e.target.matches("[data-finance-invoice-form]")){e.preventDefault(),Uc(e.target);return}if(e.target.matches("[data-finance-payment-form]")){e.preventDefault(),Nc(e.target);return}if(e.target.matches("[data-finance-expense-form]")){e.preventDefault(),Lc(e.target);return}if(e.target.matches("[data-finance-vendor-form]")){e.preventDefault(),Qc(e.target);return}if(e.target.matches("[data-role-form]")){e.preventDefault(),bc(e.target);return}if(e.target.matches("[data-invite-form]")){e.preventDefault(),_c(e.target);return}if(e.target.matches("[data-message-group-form]")){e.preventDefault(),$c(e.target);return}if(e.target.matches("[data-direct-message-form]")){e.preventDefault(),Sc(e.target);return}if(e.target.matches("[data-message-access-form]")){e.preventDefault(),kc(e.target);return}if(e.target.matches("[data-message-form]")){e.preventDefault(),Dc(e.target);return}if(e.target.matches("[data-calendar-event-form]")){e.preventDefault(),Cc(e.target);return}if(e.target.matches("[data-user-role-form]")){e.preventDefault(),wc(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),Zu(e.target))}async function nc(){if(n.session?.auth==="supabase"){const e=q();e?.auth&&await e.auth.signOut()}localStorage.removeItem(Ke),n.session=null,n.dataLoaded=!1,j("/login",{replace:!0})}function ys(e=""){n.loginError="",n.authMessage="",n.session=ii(),rs(),n.activeCompanyId=u(),localStorage.setItem(Ce,n.activeCompanyId),D(Ke,n.session),n.dataLoaded=!1,n.dataLoading=!1,j(Ma(e||_(m("jobs",{},u()))),{replace:!0})}async function sc(e){const t=new FormData(e),a=b().profile,i=e.elements.avatar_file?.files?.[0]||null;let s=String(t.get("avatar_url")||a.avatar_url||"").trim();if(i&&i.size){const l=await rc(i);if(!l.ok)return;s=l.url}let o=St({...a,full_name:String(t.get("full_name")||"").trim()||a.full_name||"Quest user",avatar_url:s},a);if(n.session?.auth==="supabase"){const l=q();if(!l){$("Profile upload needs Supabase to be available.","local","Profile");return}const d=await l.from("profiles").update({full_name:o.full_name,avatar_url:o.avatar_url}).eq("id",a.id).select().single();if(d.error){$(d.error.message||"Profile save failed.","local","Profile");return}o=St(d.data,o),l.auth?.updateUser&&await l.auth.updateUser({data:{full_name:o.full_name,avatar_url:o.avatar_url}}),n.profiles=[o].concat(n.profiles.filter(c=>c.id!==o.id)),o.member_id&&(n.teamMembers=n.teamMembers.map(c=>c.id===o.member_id?{...c,full_name:o.full_name,name:o.full_name,avatar_url:o.avatar_url}:c))}else D(On,o),n.profileDraft=o;n.session={...b(),profile:o},D(Ke,n.session),n.modal="",$("Profile saved.",n.session?.auth==="supabase"?"live":"local","Profile")}async function rc(e){if(!["image/jpeg","image/png","image/webp"].includes(e.type))return $("Use a PNG, JPG, or WebP image for your profile picture.","local","Profile"),{ok:!1,url:""};if(e.size>2*1024*1024)return $("Profile pictures must be 2 MB or smaller.","local","Profile"),{ok:!1,url:""};if(n.session?.auth!=="supabase"){const f=await Zs(e);return f?{ok:!0,url:f}:($("Could not read that image file.","local","Profile"),{ok:!1,url:""})}const a=q(),i=b().profile.id,s=Eu(e),o=`${i}/avatar-${Date.now()}.${s}`,l=await a.storage.from("avatars").upload(o,e,{cacheControl:"3600",upsert:!0,contentType:e.type});if(l.error)return $(l.error.message||"Profile picture upload failed.","local","Profile"),{ok:!1,url:""};const d=a.storage.from("avatars").getPublicUrl(o),c=d.data?.publicUrl?`${d.data.publicUrl}?v=${Date.now()}`:"";return c?{ok:!0,url:c}:($("Profile picture uploaded, but no public URL was returned.","local","Profile"),{ok:!1,url:""})}async function oc(e){const t=Object.fromEntries(new FormData(e).entries()),a=q();if(!a?.auth){n.loginError="Supabase auth is unavailable.",p();return}n.loginError="",n.authMessage="Signing in...",p();const i=await a.auth.signInWithPassword({email:String(t.email||"").trim(),password:String(t.password||"")});if(i.error){n.loginError=i.error.message||"Unable to sign in.",n.authMessage="",p();return}if(await vt(i.data.session),t.invite_token){await Di(t.invite_token,t.return_url);return}n.authMessage="",n.dataLoaded=!1,j(Ma(t.return_url||_(m("jobs",{},L()))),{replace:!0})}async function lc(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.invite_code||"").trim();if(!a){n.loginError="Invite code is required.",p();return}n.loginError="",n.authMessage="Checking invite code...",n.authMode="register",p();const i=await cc(a);if(i?.missing){n.loginError="Invite code was not found or is no longer pending.",n.authMessage="",n.authMode="invite",p();return}if(i?.status&&i.status!=="pending"){n.loginError=`This invite is ${i.status}. Ask your company admin for a new code.`,n.authMessage="",n.authMode="invite",p();return}if(i?.expires_at&&Date.parse(i.expires_at)<=Date.now()){n.loginError="This invite code expired. Ask your company admin for a new code.",n.authMessage="",n.authMode="invite",p();return}i?(n.inviteLookup=i,n.authMessage=`Invite found for ${i.email}.`):n.authMessage="";const s=new URLSearchParams({invite:a}),o=Ma(t.return_url||"");o&&s.set("return_url",o),s.set("mode","register"),j(`/login?${s.toString()}`,{replace:!0})}async function cc(e){const t=String(e||"").trim(),a=q();if(!t||!a)return null;const i=await a.rpc("lookup_company_invite",{invite_token:t}).catch(o=>({error:o}));if(i.error)return null;const s=Array.isArray(i.data)?i.data[0]:i.data;return s?{token:t,company_id:w(s.company_id||""),company_name:String(s.company_name||s.company_id||"").trim(),email:String(s.email||"").trim(),status:String(s.status||"").trim(),expires_at:s.expires_at||""}:{missing:!0}}async function dc(e){const t=Object.fromEntries(new FormData(e).entries()),a=q();if(!a?.auth){n.loginError="Supabase auth is unavailable.",p();return}const i=String(t.email||"").trim(),s=String(t.password||""),o=String(t.full_name||"").trim(),l=String(t.invite_token||"").trim(),d=String(t.company_name||"").trim();if(!i||!s||!o||!l&&!d){n.loginError=l?"Name, email, and password are required.":"Name, email, password, and company workspace are required.",p();return}n.loginError="",n.authMessage=l?"Creating account and accepting invite...":"Creating secure workspace...",p();const c=await a.auth.signUp({email:i,password:s,options:{data:{full_name:o}}});if(c.error){const S=/already|registered|exists/i.test(c.error.message||"");n.loginError=S&&l?"That email already has a Quest HQ account. Sign in with the invited email to accept this invite.":c.error.message||"Unable to create account.",S&&l&&(n.authMode="signin"),n.authMessage="",p();return}let f=c.data.session;if(!f){const S=await a.auth.signInWithPassword({email:i,password:s});if(S.error){n.loginError="Account created. Please sign in to finish workspace setup.",n.authMode="signin",n.authMessage="",p();return}f=S.data.session}if(await vt(f),l){await Di(l,t.return_url);return}const g=await a.rpc("create_company_workspace",{company_name:d});if(g.error){n.loginError=g.error.message||"Account created, but workspace setup failed.",n.authMessage="",p();return}n.activeCompanyId=w(g.data||L()),Ni(n.activeCompanyId),localStorage.setItem(Ce,n.activeCompanyId),n.dataLoaded=!1,n.authMessage="",j(m("settings",{tab:"billing"},n.activeCompanyId),{replace:!0})}async function uc(e){const t=Object.fromEntries(new FormData(e).entries()),a=q(),i=String(t.company_name||"").trim();if(!a||!i){n.loginError="Company workspace name is required.",p();return}const s=await a.rpc("create_company_workspace",{company_name:i});if(s.error){n.loginError=s.error.message||"Workspace setup failed.",p();return}n.activeCompanyId=w(s.data||L()),Ni(n.activeCompanyId),localStorage.setItem(Ce,n.activeCompanyId),n.dataLoaded=!1,j(m("settings",{tab:"billing"},n.activeCompanyId),{replace:!0})}async function mc(e){const t=Object.fromEntries(new FormData(e).entries()),a=q();if(!a?.auth){n.loginError="Supabase auth is unavailable.",p();return}const i=String(t.email||"").trim(),s=String(t.password||""),o=w(t.company_id||"");n.loginError="",n.authMessage="Submitting access request...",p();const l=await a.auth.signInWithPassword({email:i,password:s});if(l.error){n.loginError=l.error.message||"Sign in first to request access.",n.authMessage="",p();return}await vt(l.data.session);const d=await a.rpc("request_company_access",{target_company_id:o,request_message:String(t.message||"").trim()||null});if(d.error){n.loginError=d.error.message||"Unable to request access.",n.authMessage="",p();return}n.authMessage="Access request sent. An Owner/Admin must approve it.",n.loginError="",n.authMode="signin",p()}async function pc(){const e=u();n.sync={label:"Opening billing...",mode:"loading"},p();try{const t=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json",...b().access_token?{Authorization:`Bearer ${b().access_token}`}:{}},body:JSON.stringify({company_id:e,return_url:`${window.location.origin}${_(m("settings",{tab:"billing"},e))}`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.url)throw new Error(a.error||"Billing is not configured yet.");window.location.href=a.url}catch(t){n.sync={label:t.message||"Billing unavailable",mode:"local"},p()}}async function fc(e,t){const a=w(e),i=La(t);if(!a||!i||!Li()){$("Quest developer access is required to review workspaces.","local","Workspace review");return}const s=q();if(n.sync={label:"Updating workspace review...",mode:"loading"},p(),n.session?.auth==="supabase"&&s){const o=await s.rpc("review_company_workspace",{target_company_id:a,next_status:i,review_note:`Marked ${i} from Quest HQ approval console`});if(o.error){n.sync={label:o.error.message||"Workspace review failed",mode:"local"},$(o.error.message||"Workspace review failed.","local","Workspace review"),p();return}}gc(a,i),await nt(a,"workspace.reviewed","company_subscription",a,{status:i},n.session?.auth==="supabase"),n.sync={label:`Workspace marked ${la(i).toLowerCase()}`,mode:n.session?.auth==="supabase"?"live":"local"},$(`Workspace marked ${la(i).toLowerCase()}.`,n.session?.auth==="supabase"?"live":"local","Workspace review"),p()}function gc(e,t){const a=ua({...Lt(e)||{},company_id:e,status:t});n.subscriptions=Vs(n.subscriptions.filter(s=>s.company_id!==e).concat(a));const i=bt({...n.workspaceReviews.find(s=>s.company_id===e)||{},company_id:e,company_name:I(e),status:t,plan_code:a.plan_code,amount_cents:a.amount_cents,currency:a.currency,created_at:new Date().toISOString()});n.workspaceReviews=n.workspaceReviews.filter(s=>s.company_id!==e).concat(i),t==="pending_review"?Ni(e):Ld(e)}async function bc(e){const t=u();if(!y("roles.manage",t,"Your role cannot manage roles.","Roles"))return;const a=new FormData(e),i=We({id:crypto.randomUUID(),company_id:t,name:a.get("name"),color:a.get("color")||"#f0b23b",priority:a.get("priority")||100,is_system:!1,created_by:b().profile.id}),s=a.getAll("permissions").map(l=>String(l||"")).filter(Boolean),o=q();if(n.session?.auth==="supabase"&&o){const l=await o.from("roles").insert(i).select().single();if(l.error){n.sync={label:l.error.message||"Role save failed",mode:"local"},p();return}const d=We(l.data),c=s.map(f=>({role_id:d.id,permission_key:f,effect:"allow"}));c.length&&await o.from("role_permissions").insert(c),n.roles.unshift(d),n.rolePermissions=c.concat(n.rolePermissions).map(ai),n.sync={label:"Role saved",mode:"live"}}else n.roles.unshift(i),n.rolePermissions=s.map(l=>ai({role_id:i.id,permission_key:l,effect:"allow"})).concat(n.rolePermissions),n.sync={label:"Role saved locally",mode:"local"};n.modal="",p()}async function _c(e){const t=new FormData(e),a=w(t.get("company_id")||u());if(!y("users.manage",a,"Your role cannot invite users.","Users"))return;const i=String(t.get("email")||"").trim().toLowerCase(),s=String(t.get("role_id")||"").trim();if(!i){n.sync={label:"Invite email is required",mode:"local"},p();return}const o=ma({id:crypto.randomUUID(),company_id:a,email:i,role_id:At(s)?s:"",token:Fd(),status:"pending",invited_by:b().profile.id,expires_at:new Date(Date.now()+336*60*60*1e3).toISOString(),created_at:new Date().toISOString()}),l=q();if(n.session?.auth==="supabase"&&l){const d={company_id:o.company_id,email:o.email,role_id:o.role_id||null,token:o.token,status:"pending",invited_by:b().profile.id},c=await l.from("company_invites").insert(d).select().single();if(c.error){n.sync={label:c.error.message||"Invite save failed",mode:"local"},p();return}n.companyInvites.unshift(ma(c.data)),await nt(o.company_id,"invite.created","company_invite",c.data.id,{email:o.email},!0),n.sync={label:"Invite code created. Copy it for the new user.",mode:"live"}}else n.companyInvites.unshift(o),nt(o.company_id,"invite.created","company_invite",o.id,{email:o.email}),n.sync={label:"Invite code created locally",mode:"local"};J("access.invite","Invite code created",`${B()} created an invite code for ${o.email}.`,m("settings",{tab:"access"},o.company_id),"invite",o.id,o.company_id),n.modal="",p()}async function Di(e,t=""){const a=q();if(!a){n.loginError="Supabase auth is unavailable.",n.authMessage="",p();return}n.authMessage="Accepting workspace invite...",p();const i=await a.rpc("accept_company_invite",{invite_token:String(e||"").trim()});if(i.error){n.loginError=i.error.message||"Unable to accept invite.",n.authMessage="",p();return}const s=w(i.data||L());n.activeCompanyId=s,localStorage.setItem(Ce,s),n.inviteLookup=null,n.authMessage="",n.loginError="",n.dataLoaded=!1,j(m("jobs",{},s),{replace:!0})}async function vc(e){const t=n.companyInvites.find(a=>a.id===e);if(!(t&&!y("users.manage",t.company_id,"Your role cannot view invite links.","Users"))){if(!t?.token){n.sync={label:"Invite link is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(Id(t)),n.sync={label:"Invite link copied",mode:"live"}}catch{n.sync={label:"Copy failed",mode:"local"}}p()}}async function yc(e){const t=n.companyInvites.find(a=>a.id===e);if(!(t&&!y("users.manage",t.company_id,"Your role cannot view invite codes.","Users"))){if(!t?.token){n.sync={label:"Invite code is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(t.token),n.sync={label:"Invite code copied",mode:"live"}}catch{n.sync={label:"Copy failed",mode:"local"}}p()}}async function hc(e){const t=n.companyInvites.find(i=>i.id===e);if(!t||!y("users.manage",t.company_id,"Your role cannot revoke invites.","Users"))return;const a=q();if(n.session?.auth==="supabase"&&a){const i=await a.rpc("revoke_company_invite",{target_invite_id:t.id});if(i.error){n.sync={label:i.error.message||"Invite revoke failed",mode:"local"},p();return}n.sync={label:"Invite revoked",mode:"live"}}else n.sync={label:"Invite revoked locally",mode:"local"};n.companyInvites=n.companyInvites.map(i=>i.id===t.id?ma({...i,status:"revoked"}):i),nt(t.company_id,"invite.revoked","company_invite",t.id,{email:t.email}),J("access.invite","Invite revoked",`${B()} revoked the invite for ${t.email}.`,m("settings",{tab:"access"},t.company_id),"invite",t.id,t.company_id),te(),p()}async function wc(e){const t=new FormData(e),a=w(t.get("company_id")||u());if(!y("users.manage",a,"Your role cannot manage user access.","Users"))return;const i=String(t.get("profile_id")||"").trim(),s=String(t.get("role_id")||"").trim(),o=["active","pending","disabled","left"].includes(String(t.get("membership_status")))?String(t.get("membership_status")):"active",l=ct(a,s);if(!i||!l){n.sync={label:"Select a user and role",mode:"local"},p();return}const d=Ud(a,i,l,o);if(d){n.sync={label:d,mode:"local"},p();return}const c=da({company_id:a,profile_id:i,role:Ii(l),status:o}),f=oe(a,i),g=Ys({company_id:a,profile_id:i,role_id:l.id,assigned_by:b().profile.id}),S=q();if(n.session?.auth==="supabase"&&S){const V=At(l.id),x=await S.rpc("update_company_member_access",{target_company_id:a,target_profile_id:i,target_role:c.role,target_role_id:V?l.id:null,target_status:o});if(x.error){n.sync={label:x.error.message||"Access update failed",mode:"local"},p();return}ra(da(x.data||c)),V&&kn(g),n.sync={label:V?"User access saved":"Membership saved; create a role to assign permissions",mode:"live"}}else ra(c),kn(g),n.sync={label:"User access saved locally",mode:"local"};J("access.role","User access updated",`${B()} set ${Ne(i)} to ${l.name} / ${T(o)}.`,m("settings",{tab:"access"},a),"membership",i,a,[i].concat(ue(a,["users.manage","settings.manage"]))),nt(a,Au(f,c),"membership",i,{role:l.name,status:o}),p()}async function wn(e,t){const a=n.joinRequests.find(l=>l.id===e);if(!a||!["approved","rejected"].includes(t)||!y("users.manage",a.company_id,"Your role cannot manage access requests.","Users"))return;const i=q(),s=Bs({...a,status:t}),o=da({company_id:a.company_id,profile_id:a.profile_id,role:"member",status:t==="approved"?"active":"disabled"});if(n.session?.auth==="supabase"&&i){const l=await i.rpc("review_company_join_request",{target_request_id:a.id,decision:t,target_role_id:null});if(l.error){n.sync={label:l.error.message||"Request update failed",mode:"local"},p();return}t==="approved"&&ra(o),n.sync={label:t==="approved"?"Access approved":"Request rejected",mode:"live"}}else t==="approved"&&ra(o),n.sync={label:t==="approved"?"Access approved locally":"Request rejected locally",mode:"local"};n.joinRequests=n.joinRequests.map(l=>l.id===a.id?s:l),nt(a.company_id,t==="approved"?"join.approved":"join.rejected","join_request",a.id,{email:a.requested_email}),J("access.request",t==="approved"?"Access approved":"Access rejected",`${B()} ${t==="approved"?"approved":"rejected"} ${a.requested_email||"a join request"}.`,m("settings",{tab:"access"},a.company_id),"join_request",a.id,a.company_id,[a.profile_id].concat(ue(a.company_id,["users.manage","settings.manage"]))),te(),p()}async function $c(e){const t=u();if(!h("messages.create_group",t)){$("Your role cannot create group chats.","local","Messages");return}const a=new FormData(e),i=["company","role","custom"].includes(a.get("type"))?String(a.get("type")):"custom",s=ye({id:crypto.randomUUID(),company_id:t,title:String(a.get("title")||"").trim()||"New group chat",type:i,created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=Ji(a,s,i);!o.some(d=>d.target_type==="profile"&&d.target_id===b().profile.id)&&i!=="company"&&o.push(ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id})),await Ci(s,o)&&(n.selectedConversationId=s.id,n.modal="",J("message.group","Group chat created",`${B()} created ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,Dt(s)),j(m("messages",{conversation:s.id},t),{replace:!0}))}async function Sc(e){const t=u();if(!y("messages.send",t,"Your role cannot start direct messages.","Messages"))return;const a=new FormData(e),i=String(a.get("profile_id")||"").trim();if(!i){$("Choose a person first.","local","Messages");return}const s=ye({id:crypto.randomUUID(),company_id:t,title:Ne(i),type:"direct",created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=[ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id}),ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:i})];if(!await Ci(s,o))return;n.selectedConversationId=s.id,n.modal="";const d=String(a.get("body")||"").trim();d&&await hs(s,d,[]),J("message.direct","Direct message started",`${B()} started a direct message with ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,[i]),j(m("messages",{conversation:s.id},t),{replace:!0})}async function kc(e){const t=u();if(!h("messages.manage_groups",t)&&!h("messages.manage",t)){$("Your role cannot manage chat access.","local","Messages");return}const a=n.messageConversations.find(f=>f.id===e.dataset.conversationId);if(!a)return;const i=new FormData(e),s=ye({...a,title:String(i.get("title")||"").trim()||a.title,type:vi.includes(i.get("type"))?String(i.get("type")):a.type,updated_at:new Date().toISOString()}),o=Ji(i,s,s.type);s.type!=="company"&&!o.some(f=>f.target_type==="profile"&&f.target_id===b().profile.id)&&o.push(ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id}));const l=Dt(a);if(!await Ci(s,o,!0))return;const c=Dt(s).filter(f=>!l.includes(f));c.length&&J("message.group","Added to chat",`${B()} added you to ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,c),n.modal="",$("Chat access saved.",n.session?.auth==="supabase"?"live":"local","Messages"),p()}async function Dc(e){const t=n.messageConversations.find(o=>o.id===e.dataset.conversationId);if(!t)return;if(!h("messages.send",t.company_id)){$("Your role cannot send messages.","local","Messages");return}const a=new FormData(e),i=String(a.get("body")||"").trim(),s=Array.from(e.elements.attachments?.files||[]);if(!i&&!s.length){$("Type a message or attach a file.","local","Messages");return}if(s.length&&!h("messages.attach_files",t.company_id)){$("Your role cannot attach files.","local","Messages");return}await hs(t,i,s),e.reset(),p()}async function Cc(e){const t=u(),a=Object.fromEntries(new FormData(e).entries()),i=a.id?Rt(String(a.id)):null;if(!i&&!h("calendar.manage",t)){$("Your role cannot create or edit calendar events.","local","Calendar");return}if(i&&!Ot(i)){$("This event cannot be edited from Calendar.","local","Calendar");return}const s=String(a.linked_job_id||"").trim(),o=new Date().toISOString();let l=it({...i||{},id:i?.id||crypto.randomUUID(),company_id:t,title:String(a.title||"").trim()||"Calendar event",description:String(a.description||"").trim(),event_type:Ca.includes(a.event_type)?String(a.event_type):"Company event",starts_at:An(a.starts_at),ends_at:An(a.ends_at||a.starts_at),all_day:a.all_day==="on",visibility:a.visibility==="private"?"private":"company",linked_type:s?"job":"",linked_id:s,assigned_profile_id:String(a.assigned_profile_id||""),created_by:i?.created_by||b().profile.id,created_at:i?.created_at||o,updated_at:o});const d=q();if(n.session?.auth==="supabase"&&d){const c=zd(l);i&&delete c.id;const f=i?await d.from("calendar_events").update({...c,updated_at:o}).eq("id",i.id).select().single():await d.from("calendar_events").insert(c).select().single();if(f.error){$(f.error.message||"Calendar event save failed.","local","Calendar");return}l=it(f.data)}n.calendarEvents=[l].concat(n.calendarEvents.filter(c=>c.id!==l.id)),Js(),J("calendar.event",i?"Calendar event updated":"Calendar event created",`${B()} ${i?"updated":"created"} ${l.title}.`,m("calendar",{},t),"calendar_event",l.id,t),n.selectedCalendarEventId=`manual:${l.id}`,n.modal="calendar-event-detail",p()}async function jc(e){const t=Rt(e);if(!t||!Ot(t)){$("This event cannot be deleted from Calendar.","local","Calendar");return}const a=q();if(n.session?.auth==="supabase"&&a){const i=await a.from("calendar_events").delete().eq("id",t.id);if(i.error){$(i.error.message||"Calendar event delete failed.","local","Calendar");return}}n.calendarEvents=n.calendarEvents.filter(i=>i.id!==t.id),Js(),J("calendar.event","Calendar event deleted",`${B()} deleted ${t.title}.`,m("calendar",{},t.company_id),"calendar_event",t.id,t.company_id),n.selectedCalendarEventId="",n.modal="",p()}async function hs(e,t,a){const i=new Date().toISOString(),s=ke({id:crypto.randomUUID(),conversation_id:e.id,company_id:e.company_id,sender_profile_id:b().profile.id,body:t,message_type:a.length?"attachment":"text",created_at:i,updated_at:i}),o=q();let l=s;if(n.session?.auth==="supabase"&&o){const f=await o.from("messages").insert(Hd(s)).select().single();if(f.error)return $(f.error.message||"Message send failed.","local","Messages"),null;l=ke(f.data)}n.messages=n.messages.concat(l);const d=await qc(l,a),c={...e,last_message_at:l.created_at,updated_at:l.created_at};return n.messageConversations=n.messageConversations.map(f=>f.id===e.id?c:f),n.session?.auth==="supabase"&&o&&await o.from("message_conversations").update({last_message_at:l.created_at,updated_at:l.created_at}).eq("id",e.id),Ya(e.id,!1),Ks(c,l,d),Le(),l}async function qc(e,t){const a=q(),i=[];for(const s of t){const o=crypto.randomUUID(),l=`${e.company_id}/${e.conversation_id}/${o}-${zt(s.name||"attachment")}`;let d="",c="";if(n.session?.auth==="supabase"&&a){const g=await a.storage.from("quest-message-attachments").upload(l,s,{cacheControl:"3600",upsert:!1,contentType:s.type||"application/octet-stream"});if(g.error){$(g.error.message||"Attachment upload failed.","local","Messages");continue}c=l}else s.type?.startsWith("image/")&&s.size<=22e4&&(d=await Zs(s));const f=xe({id:o,conversation_id:e.conversation_id,message_id:e.id,company_id:e.company_id,bucket_id:"quest-message-attachments",object_path:c,file_name:s.name||"attachment",mime_type:s.type||"application/octet-stream",size_bytes:s.size||0,preview_url:d,created_at:new Date().toISOString()});if(n.session?.auth==="supabase"&&a){const g=await a.from("message_attachments").insert(Wd(f)).select().single();if(g.error){$(g.error.message||"Attachment record failed.","local","Messages"),c&&await a.storage.from("quest-message-attachments").remove([c]);continue}i.push(xe(g.data))}else i.push(f)}return n.messageAttachments=n.messageAttachments.concat(i),i}async function Ci(e,t,a=!1){const i=q();if(n.session?.auth==="supabase"&&i){const s=a?await i.from("message_conversations").update(jn(e)).eq("id",e.id).select().single():await i.from("message_conversations").insert(jn(e)).select().single();if(s.error)return $(s.error.message||"Conversation save failed.","local","Messages"),!1;if(await i.from("message_conversation_access").delete().eq("conversation_id",e.id),t.length){const o=await i.from("message_conversation_access").insert(t.map(Bd));if(o.error)return $(o.error.message||"Conversation access save failed.","local","Messages"),!1}e=ye(s.data),n.sync={label:"Quest Supabase live",mode:"live"}}return n.messageConversations=[e].concat(n.messageConversations.filter(s=>s.id!==e.id)),n.messageAccess=t.concat(n.messageAccess.filter(s=>s.conversation_id!==e.id)),Ya(e.id,!1),Le(),!0}async function Ac(e){const t=n.messages.find(o=>o.id===e);if(!t)return;if(!(t.sender_profile_id===b().profile.id&&h("messages.delete_own",t.company_id)||h("messages.delete_any",t.company_id))){$("Your role cannot delete this message.","local","Messages");return}const i=new Date().toISOString(),s=q();if(n.session?.auth==="supabase"&&s){const o=await s.from("messages").update({deleted_at:i,updated_at:i}).eq("id",t.id);if(o.error){$(o.error.message||"Message delete failed.","local","Messages");return}}n.messages=n.messages.map(o=>o.id===t.id?{...o,deleted_at:i,updated_at:i}:o),Le(),p()}async function Mc(e){const t=n.messageAttachments.find(i=>i.id===e);if(!t)return;if(t.preview_url){window.open(t.preview_url,"_blank","noopener,noreferrer");return}const a=q();if(n.session?.auth==="supabase"&&a&&t.object_path){const i=await a.storage.from(t.bucket_id||"quest-message-attachments").createSignedUrl(t.object_path,900,{download:t.file_name});if(!i.error&&i.data?.signedUrl){window.open(i.data.signedUrl,"_blank","noopener,noreferrer");return}}$("This demo attachment is metadata-only.","local","Messages")}function Fc(e){if(e.target.matches("[data-global-search]")){n.query=e.target.value,Ve();return}if(e.target.matches("[data-file-search]")){n.fileQuery=e.target.value,Ve();return}if(e.target.matches("[data-form-search]")){n.formQuery=e.target.value,Ve();return}if(e.target.matches("[data-crm-search]")){n.crmQuery=e.target.value,Ve();return}if(e.target.matches("[data-message-search]")){n.messageQuery=e.target.value,Ve();return}if(e.target.matches("[data-calendar-search]")){n.calendarQuery=e.target.value,Ve();return}if(e.target.matches("[data-message-access-filter]")){pu(e.target);return}if(e.target.matches("[data-form-field]")){cr(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&dr(e.target)}function Ic(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||L();sd(t);return}if(e.target.matches("[data-stage-filter]")){n.stageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-stage-filter]")){n.crmStageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-owner-filter]")){n.crmOwnerFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-status-filter]")){n.taskStatusFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-priority-filter]")){n.taskPriorityFilter=e.target.value||"all",p();return}if(e.target.matches("[data-calendar-type-filter]")){n.calendarTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;j(m("tasks",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-analytics-job-filter]")){const t=e.target.value;j(m("analytics",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-file-category-filter]")){n.fileCategoryFilter=e.target.value||"All categories",p();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=n.route?.jobId||"";j(m("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},u()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;j(m("files",{...t?{folder:"jobs",job_id:t}:{}},u()));return}if(e.target.matches("[data-form-type-filter]")){n.formTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-form-field]")){cr(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&dr(e.target)}async function Tc(e){const t=tt(Object.fromEntries(new FormData(e).entries()));if(t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||u(),!y("jobs.manage",t.company_id,"Your role can view jobs but cannot create or edit them.","Jobs"))return;t.estimate_total=Number(t.estimate_total||0),t.invoice_total=Number(t.invoice_total||0),t.updated_at=new Date().toISOString();const a=n.jobs.some(s=>s.id===t.id),i=q();if(i){const s=a?await i.from("jobs").update(t).eq("id",t.id).select().single():await i.from("jobs").insert(t).select().single();if(!s.error&&s.data){Ga(tt(s.data)),n.sync={label:"Quest Supabase live",mode:"live"},n.modal="",j(m("jobs",{tab:"profile",job_id:s.data.id},t.company_id),{replace:!0});return}n.sync={label:"Saved locally",mode:"local"}}Ga(t),n.modal="",j(m("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function Ec(e){if(!e)return;const t=u();if(!y("jobs.manage",t,"Your role cannot delete jobs.","Jobs"))return;const a=q();a&&await a.from("jobs").delete().eq("id",e),n.jobs=n.jobs.filter(i=>i.id!==e),n.selectedJobId=Q(t)[0]?.id||"",n.modal="",te(),j(m("jobs",{tab:"list"},t),{replace:!0})}async function xc(e){const t=u();if(!y("tasks.manage",t,"Your role can view tasks but cannot create or edit them.","Tasks"))return;const a=Object.fromEntries(new FormData(e).entries()),i=at({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:b().profile.member_id||lt(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),s=Fa(i.id),o=!!s,l=q();if(l){const d=iu(i),c=o?await l.from("tasks").update(d).eq("id",i.id).select().single():await l.from("tasks").insert(d).select().single();if(!c.error&&c.data){const f=at(c.data);$n(f),In(f,s),n.sync={label:"Quest Supabase live",mode:"live"},n.modal="",j(m("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},t),{replace:!0});return}n.sync={label:"Task saved locally",mode:"local"}}$n(i),In(i,s),n.modal="",j(m("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},t),{replace:!0})}async function Oc(e){if(!e)return;const t=u();if(!y("tasks.manage",t,"Your role cannot delete tasks.","Tasks"))return;const a=q();a&&await a.from("tasks").delete().eq("id",e),n.tasks=n.tasks.filter(i=>i.id!==e),n.selectedTaskId="",n.modal="",te(),j(m("tasks",{},t),{replace:!0})}async function Rc(e){const t=u();if(!y("files.manage",t,"Your role can view files but cannot upload.","Files"))return;const a=new FormData(e),i=Object.fromEntries(a.entries()),s=Array.from(e.elements.files?.files||[]),o=String(i.file_name||"").trim(),l=s.length?s:o?[null]:[];if(!l.length){n.sync={label:"Choose a file or enter a file name",mode:"local"},p();return}const d=q();let c=0;for(const f of l){const g=crypto.randomUUID(),S=f?.name||o,V=String(i.folder||"shared"),x=`${t}/${i.job_id?`jobs/${i.job_id}`:V}/${g}-${zt(S)}`;let ne=!1;d&&f&&(ne=!(await d.storage.from("quest-job-files").upload(x,f,{cacheControl:"3600",upsert:!1,contentType:f.type||"application/octet-stream"})).error);const Fe=$t({id:g,company_id:t,job_id:i.job_id||"",folder:V,file_name:S,mime_type:f?.type||"application/octet-stream",size_bytes:f?.size||Number(i.size_bytes||0),category:i.category||fe(V),notes:i.notes||"",uploaded_by_label:i.uploaded_by_label||b().profile.full_name,bucket_id:"quest-job-files",object_path:ne||!f?x:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(d){const N=await d.from("job_files").insert(nu(Fe)).select().single();if(!N.error&&N.data){Sn($t(N.data)),c+=1;continue}ne&&await d.storage.from("quest-job-files").remove([x])}Sn(Fe)}n.sync=c===l.length?{label:"Quest Supabase live",mode:"live"}:{label:c?"Some files saved locally":"File record saved locally",mode:c?"loading":"local"},J("file.added",l.length>1?"Files added":"File added",`${B()} added ${l.length} file${l.length===1?"":"s"} to ${fe(i.folder||"shared")}.`,m("files",{folder:i.folder||"shared",...i.job_id?{job_id:i.job_id}:{}},t),"file",i.job_id||"",t),n.modal="",j(m("files",{folder:i.folder||"shared",...i.job_id?{job_id:i.job_id}:{}},t),{replace:!0})}function Pc(e){const t=Object.fromEntries(new FormData(e).entries()),a=w(t.company_id||u());if(!y("files.manage",a,"Your role can view files but cannot create folders.","Files"))return;const i=String(t.name||"").trim();if(!i){n.sync={label:"Folder name is required",mode:"local"},p();return}const s=Vi({id:`folder-${crypto.randomUUID()}`,company_id:a,name:i,parent_key:t.parent_key||"home",created_by_label:b().profile.full_name||"Quest HQ",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});n.driveFolders.unshift(s),n.modal="",n.sync={label:"Folder created locally",mode:"local"},J("file.folder","Folder created",`${B()} created ${s.name}.`,m("files",{folder:s.id},s.company_id),"folder",s.id,s.company_id),te(),p()}async function Uc(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),i=P(t.job_id),s=String(t.id||"").trim()?Pe(String(t.id).trim()):null,o=Vt({...t,id:String(t.id||"").trim()||`invoice-${crypto.randomUUID()}`,company_id:a,client_name:String(t.client_name||i?.client_name||"").trim(),total:R(t.subtotal)+R(t.tax),updated_at:new Date().toISOString()});await yt("finance_invoices",ws(o),"Invoice save failed")&&(zc(o),s?.job_id&&s.job_id!==o.job_id&&Za(s.job_id),Za(o.job_id),n.modal="",n.sync={label:n.session?.auth==="supabase"?"Invoice saved securely":"Finance saved locally",mode:n.session?.auth==="supabase"?"live":"local"},J("finance.invoice",s?"Invoice updated":"Invoice created",`${B()} ${s?"updated":"created"} ${o.invoice_number}.`,m("finance",{invoice:o.id},a),"invoice",o.id,a),j(m("finance",{invoice:o.id},a),{replace:!0}))}async function Nc(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),i=Pe(t.invoice_id);if(!i||i.company_id!==a){n.sync={label:"Create an invoice before recording a payment",mode:"local"},p();return}const s=Yt({...t,id:`payment-${crypto.randomUUID()}`,company_id:a,created_at:new Date().toISOString()});!await yt("finance_payments",Vc(s),"Payment save failed")||(i.status=pe(i.id)-s.amount<=0?"Paid":"Partially paid",i.updated_at=new Date().toISOString(),!await yt("finance_invoices",ws(i),"Invoice status update failed"))||(n.financePayments.unshift(s),Za(i.job_id),te(),n.modal="",n.sync={label:n.session?.auth==="supabase"?"Payment recorded securely":"Payment recorded locally",mode:n.session?.auth==="supabase"?"live":"local"},J("finance.payment","Payment recorded",`${B()} recorded ${C(s.amount)} for ${i.invoice_number}.`,m("finance",{invoice:s.invoice_id},a),"payment",s.id,a),j(m("finance",s.invoice_id?{invoice:s.invoice_id}:{},a),{replace:!0}))}async function Lc(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),i=Bt({...t,id:String(t.id||"").trim()||`expense-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});await yt("finance_expenses",Yc(i),"Expense save failed")&&(Jc(i),n.modal="",n.sync={label:n.session?.auth==="supabase"?"Expense saved securely":"Expense saved locally",mode:n.session?.auth==="supabase"?"live":"local"},J("finance.expense","Expense saved",`${B()} saved a ${C(i.amount)} ${i.category} expense.`,m("finance",{expense:i.id},a),"expense",i.id,a),j(m("finance",{expense:i.id},a),{replace:!0}))}async function Qc(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),i=Ht({...t,id:String(t.id||"").trim()||`vendor-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});await yt("finance_vendors",Bc(i),"Vendor save failed")&&(Kc(i),n.modal="",n.sync={label:n.session?.auth==="supabase"?"Vendor saved securely":"Vendor saved locally",mode:n.session?.auth==="supabase"?"live":"local"},J("finance.vendor","Vendor saved",`${B()} saved vendor ${i.name}.`,m("finance",{vendor:i.id},a),"vendor",i.id,a),j(m("finance",{vendor:i.id},a),{replace:!0}))}async function yt(e,t,a){if(n.session?.auth!=="supabase")return!0;const i=q();if(!i)return n.sync={label:"Supabase is unavailable",mode:"local"},p(),!1;if(!h("finance.manage",t.company_id))return n.sync={label:"Your role cannot manage finance records",mode:"local"},p(),!1;const s=await i.from(e).upsert(t,{onConflict:"id"}).select().single();return s.error?(n.sync={label:s.error.message||a,mode:"local"},$(s.error.message||a,"local","Finance"),p(),!1):!0}function ws(e){return{id:e.id,company_id:e.company_id,job_id:e.job_id||null,client_name:e.client_name,invoice_number:e.invoice_number,status:e.status,issue_date:e.issue_date||null,due_date:e.due_date||null,subtotal:R(e.subtotal),tax:R(e.tax),total:R(e.total),notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function Vc(e){return{id:e.id,company_id:e.company_id,invoice_id:e.invoice_id,amount:R(e.amount),method:e.method,received_at:e.received_at||null,reference:e.reference||"",notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function Yc(e){return{id:e.id,company_id:e.company_id,job_id:e.job_id||null,vendor_id:e.vendor_id||null,category:e.category,amount:R(e.amount),status:e.status,spent_at:e.spent_at||null,notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function Bc(e){return{id:e.id,company_id:e.company_id,name:e.name,contact_name:e.contact_name||"",email:e.email||"",phone:e.phone||"",category:e.category,status:e.status,notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}async function Hc(e){const t=n.files.find(s=>s.id===e);if(t&&!y("files.view",t.company_id,"Your role cannot view this file.","Files"))return;if(!t?.object_path){n.sync={label:"No stored object for this file",mode:"local"},p();return}const a=q();if(!a)return;const i=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(i.error||!i.data?.signedUrl){n.sync={label:"Download failed",mode:"local"},p();return}window.open(i.data.signedUrl,"_blank","noopener,noreferrer")}async function Wc(e){const t=n.files.find(i=>i.id===e);if(!t||!y("files.manage",t.company_id,"Your role cannot delete files.","Files"))return;const a=q();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),n.files=n.files.filter(i=>i.id!==e),n.selectedFileId="",n.modal="",te(),p()}function Ga(e){const t=n.jobs.findIndex(a=>a.id===e.id);t>=0?n.jobs[t]=e:n.jobs.unshift(e),n.selectedJobId=e.id,te()}function $n(e){const t=n.tasks.findIndex(a=>a.id===e.id);t>=0?n.tasks[t]=e:n.tasks.unshift(e),n.selectedTaskId=e.id,te()}function Sn(e){const t=n.files.findIndex(a=>a.id===e.id);t>=0?n.files[t]=e:n.files.unshift(e),te()}function zc(e){const t=n.financeInvoices.findIndex(a=>a.id===e.id);t>=0?n.financeInvoices[t]=e:n.financeInvoices.unshift(e),te()}function Jc(e){const t=n.financeExpenses.findIndex(a=>a.id===e.id);t>=0?n.financeExpenses[t]=e:n.financeExpenses.unshift(e),te()}function Kc(e){const t=n.financeVendors.findIndex(a=>a.id===e.id);t>=0?n.financeVendors[t]=e:n.financeVendors.unshift(e),te()}function ra(e){const t=n.memberships.findIndex(a=>a.company_id===e.company_id&&a.profile_id===e.profile_id);t>=0?n.memberships[t]=e:n.memberships.unshift(e),te()}function kn(e){n.roleAssignments=n.roleAssignments.filter(t=>t.company_id!==e.company_id||t.profile_id!==e.profile_id),e.role_id&&n.roleAssignments.unshift(e)}function Za(e){if(!e)return;const t=P(e);t&&(t.invoice_total=me(ve(t.company_id).filter(a=>a.job_id===e),"total"),t.updated_at=new Date().toISOString(),Ga(t))}function Ve(){const e=document.getElementById("workspace");e&&($s(n.route),e.innerHTML=cs(n.route))}function xt(){const e=ji(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/")return{name:"home",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:u(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const i=a[2]||"home";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:i,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:u(),jobId:t.get("job_id")||""}}function Gc(){const e=ji(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||aa(t.get("job_id")||t.get("project_id"))||localStorage.getItem(Ce)||L(),i=Object.fromEntries(Object.entries(wr).map(([l,d])=>[l,m(d,{},a)]));Object.assign(i,{"/index.html":"/","/command.html":m("home",{},a),"/login.html":"/login"});let s=i[e];if(e==="/jobs"){const l=t.get("tab");l==="tasks"?s=m("tasks",ce(t,["job_id","task_id","new","edit"]),a):l==="files"?s=m("files",ce(t,["job_id","folder"]),a):l==="forms"?s=m("forms",ce(t,["job_id"]),a):l==="analytics"?s=m("analytics",ce(t,["job_id"]),a):s=m("jobs",ce(t,["job_id","tab"]),a)}if(e==="/files"&&(s=m("files",ce(t,["job_id","folder"]),a)),e==="/forms"&&(s=m("forms",ce(t,["job_id"]),a)),e==="/analytics"&&(s=m("analytics",ce(t,["job_id"]),a)),e==="/crm"&&(s=m("crm",ce(t,["account"]),a)),e==="/finance"&&(s=m("finance",ce(t,["invoice","expense","vendor","report"]),a)),e==="/messages"&&(s=m("messages",ce(t,["conversation"]),a)),e==="/calendar"&&(s=m("calendar",{},a)),e==="/admin"&&(s=m("settings",{},a)),e==="/time"&&(s=m("time",{},a)),e==="/team"&&(s=m("team-chart",{},a)),e==="/team-chart"&&(s=m("team-chart",{},a)),e==="/approvals"&&(s=m("approvals",{},a)),e==="/clock"&&(s=m("clock",{},a)),e==="/task-management.html"){const l=t.get("project_id")||t.get("job_id")||"";s=m("tasks",l?{job_id:l}:{},aa(l)||a)}const o=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(o){const l=decodeURIComponent(o[1]);s=m("tasks",{job_id:l},aa(l)||a)}s&&window.history.replaceState({},"",_(s))}function Zc(e){if(e.name!=="company")return"";if(e.section==="home"&&/^\/company\/[^/]+\/?$/.test(e.path))return m("home",{},e.companyId);const t=Ue();if(n.session?.auth==="supabase"&&!t.length)return null;if(!t.includes(e.companyId))return n.session?.auth==="supabase"?"":m(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||L());if(!ot.map(s=>s.id).includes(e.section))return m("home",{},e.companyId);const i=e.jobId?aa(e.jobId):"";return i&&i!==e.companyId&&t.includes(i)?m(e.section,Object.fromEntries(e.params.entries()),i):""}function ji(){let e=window.location.pathname||"/";return He&&e.startsWith(He)&&(e=e.slice(He.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function _(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),i=t.startsWith("/")?t:"/"+t;return`${He}${i}${a?`?${a}`:""}`||"/"}function j(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(He+"/")||He===""&&e.startsWith("/")?e:_(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),p()}function Xc(){return`${ji()}${window.location.search}`}function Ma(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?_(m("jobs",{},L())):`${t.pathname}${t.search}`}catch{return _(m("jobs",{},L()))}}function m(e="jobs",t={},a=u()){const i=new URLSearchParams(t);for(const[s,o]of[...i.entries()])(o==null||o==="")&&i.delete(s);return`/company/${encodeURIComponent(w(a||L()))}/${e}${i.toString()?`?${i.toString()}`:""}`}function ed(e){return e.name==="home"?"Quest HQ":e.name==="company"?T(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":T(e.name||"Workspace")}function td(e,t){const[a]=t.split("?"),i=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!i||e.name!=="company"?!1:e.companyId===decodeURIComponent(i[1])&&e.section===i[2]}function ad(e){return Ln.includes(e)?e:"pipeline"}function id(e){return{pipeline:"Pipeline",list:"List",profile:"Profile"}[e]||e}function nd(e){const t=e.companyId||n.activeCompanyId||L(),a=Ue();n.activeCompanyId=a.includes(t)?t:a[0]||L(),localStorage.setItem(Ce,n.activeCompanyId)}function $s(e){const t=u();e.jobId&&Q(t).some(i=>i.id===e.jobId)&&(n.selectedJobId=e.jobId),(!n.selectedJobId||!Q(t).some(i=>i.id===n.selectedJobId))&&(n.selectedJobId=Q(t)[0]?.id||"");const a=e.params.get("task_id");a&&K(t).some(i=>i.id===a)&&(n.selectedTaskId=a),e.section!=="tasks"&&(n.selectedTaskId=""),n.driveFolder=e.params.get("folder")||"home"}function sd(e){const t=Ue(),a=w(e),i=t.includes(a)?a:t[0]||L();n.activeCompanyId=i,localStorage.setItem(Ce,i),rd();const s=n.route||xt(),o=s.name==="company"?s.section:"jobs";j(m(o,{},i))}function rd(){n.modal="",n.selectedJobId="",n.selectedTaskId="",n.selectedFileId="",n.selectedFormId="",n.selectedQuestionId="",n.selectedFinanceInvoiceId="",n.selectedFinanceExpenseId="",n.selectedFinanceVendorId="",n.selectedCalendarEventId="",n.query="",n.fileQuery="",n.formQuery="",n.crmQuery="",n.stageFilter="all",n.crmStageFilter="all",n.crmOwnerFilter="all",n.taskStatusFilter="all",n.taskPriorityFilter="all",n.calendarQuery="",n.calendarTypeFilter="all",n.calendarScope="company",n.fileCategoryFilter="All categories",n.formTypeFilter="all",n.formsTab="library",n.driveFolder="home"}function od(e){const t=P(e);t&&(n.selectedJobId=e,j(m("jobs",{tab:"profile",job_id:e},t.company_id)))}function ld(e){const t=Fa(e);t&&(n.selectedTaskId=e,j(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function Ee(){return P(n.selectedJobId)||Q(u())[0]||null}function P(e){return n.jobs.find(t=>t.id===e)||null}function Fa(e){return n.tasks.find(t=>t.id===e)||null}function Q(e=u()){return n.jobs.filter(t=>t.company_id===e)}function K(e=u()){return n.tasks.filter(t=>t.company_id===e)}function Ss(e=u()){const t=b().profile.id;return n.notifications.filter(a=>a.company_id===e&&a.recipient_profile_id===t).sort((a,i)=>Date.parse(i.created_at||0)-Date.parse(a.created_at||0))}function Oe(e=u()){const t=n.messageQuery.trim().toLowerCase(),a=n.messageFilter||"all";return n.messageConversations.filter(i=>i.company_id===e&&dd(i)).filter(i=>a==="all"||i.type===a||a==="unread"&&Ze(i.id)>0).filter(i=>{if(!t)return!0;const s=je(i.id).some(o=>o.body.toLowerCase().includes(t));return i.title.toLowerCase().includes(t)||s}).sort((i,s)=>Date.parse(s.last_message_at||s.updated_at||s.created_at||0)-Date.parse(i.last_message_at||i.updated_at||i.created_at||0))}function qi(e=u()){return Oe(e).reduce((t,a)=>t+Ze(a.id),0)}function ks(e=u()){const t=Oe(e),i=n.route?.params?.get("conversation")||""||n.selectedConversationId;return t.find(s=>s.id===i)||t[0]||null}function je(e){return n.messages.filter(t=>t.conversation_id===e&&!t.deleted_at).sort((t,a)=>Date.parse(t.created_at||0)-Date.parse(a.created_at||0))}function Ia(e){return n.messageAttachments.filter(t=>t.conversation_id===e)}function Ds(e){return n.messageAttachments.filter(t=>t.message_id===e)}function Ta(e){return n.messageAccess.filter(t=>t.conversation_id===e)}function cd(e,t=b().profile.id){return n.messageReads.find(a=>a.conversation_id===e&&a.profile_id===t)||null}function Ze(e,t=b().profile.id){const a=Date.parse(cd(e,t)?.last_read_at||0);return je(e).filter(i=>i.sender_profile_id!==t&&Date.parse(i.created_at||0)>a).length}function dd(e){if(!e||!h("messages.view",e.company_id))return!1;const t=b().profile,a=Ta(e.id);if(e.type==="company"||a.some(o=>o.target_type==="all_company"))return!0;const i=new Set([t.id,t.member_id,t.email].filter(Boolean).map(String));if(a.some(o=>o.target_type==="profile"&&i.has(o.target_id)))return!0;const s=[wt(e.company_id,Xe(e.company_id)),...n.roleAssignments.filter(o=>o.company_id===e.company_id&&o.profile_id===t.id).map(o=>o.role_id)];return a.some(o=>o.target_type==="role"&&s.includes(o.target_id))}function Ea(e=u()){const t=n.calendarEvents.filter(d=>d.company_id===e&&_d(d)).map(md),a=K(e).filter(d=>d.due&&d.status!=="done").filter(d=>h("calendar.view_team",e)||js(d.assignee_id)||d.creator_id===b().profile.member_id).map(pd),i=h("finance.view",e)?ve(e).filter(d=>d.due_date&&pe(d.id)>0).map(fd):[],s=Ti(e).filter(d=>d.type!=="Access request"||h("users.manage",e)).map(d=>gd(d,e)),o=Ut(e),l=o&&(h("calendar.view_team",e)||xa(o.user_id))?[bd(o)]:[];return t.concat(a,i,s,l).sort((d,c)=>Date.parse(d.startsAt||0)-Date.parse(c.startsAt||0))}function ud(e=u()){const t=n.calendarQuery.trim().toLowerCase();return Ea(e).filter(a=>n.calendarScope==="company"||a.mine).filter(a=>n.calendarTypeFilter==="all"||a.type===n.calendarTypeFilter).filter(a=>t?[a.title,a.description,a.type,a.owner,a.linkLabel].some(i=>String(i||"").toLowerCase().includes(t)):!0).filter(a=>n.calendarView==="list"||$d(a))}function Cs(e=u()){const t=Date.now();return Ea(e).filter(a=>Date.parse(a.endsAt||a.startsAt||0)>=t).slice(0,9)}function md(e){const t=e.linked_type==="job"?P(e.linked_id):null;return{id:`manual:${e.id}`,source:"manual",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description,type:e.event_type,startsAt:e.starts_at,endsAt:e.ends_at||e.starts_at,allDay:e.all_day,dateKey:qs(e.starts_at),owner:hd(e.assigned_profile_id||e.created_by),mine:xa(e.assigned_profile_id)||e.created_by===b().profile.id,href:vd(e),linkLabel:t?.name||"",editable:Ot(e)}}function pd(e){const t=e.due_time?`${e.due}T${e.due_time}:00`:`${e.due}T12:00:00`;return{id:`task:${e.id}`,source:"task",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description||Qe(e.type),type:"Task due",startsAt:t,endsAt:t,allDay:!e.due_time,dateKey:e.due,owner:H(e.assignee_id),mine:js(e.assignee_id),href:m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),linkLabel:P(e.project_id)?.name||"Company task",editable:!1}}function fd(e){return{id:`invoice:${e.id}`,source:"invoice",sourceId:e.id,companyId:e.company_id,title:`${e.invoice_number} due`,description:`${C(pe(e.id))} outstanding for ${e.client_name||"client"}.`,type:"Invoice due",startsAt:`${e.due_date}T12:00:00`,endsAt:`${e.due_date}T12:00:00`,allDay:!0,dateKey:e.due_date,owner:e.client_name||"Finance",mine:h("finance.view",e.company_id),href:m("finance",{invoice:e.id},e.company_id),linkLabel:e.client_name||"Finance",editable:!1}}function gd(e,t=u()){const a=String(e.updatedAt||k(0)).slice(0,10);return{id:`approval:${e.id}`,source:"approval",sourceId:e.id,companyId:t,title:e.title,description:e.meta,type:"Approval",startsAt:`${a}T12:00:00`,endsAt:`${a}T12:00:00`,allDay:!0,dateKey:a,owner:e.owner,mine:!0,href:e.href,linkLabel:e.status,editable:!1}}function bd(e){const t=qs(e.started_at);return{id:`timer:${e.id}`,source:"timer",sourceId:e.id,companyId:e.company_id,title:e.task_title||"Active timer",description:"Current clock session.",type:"Time",startsAt:e.started_at,endsAt:new Date().toISOString(),allDay:!1,dateKey:t,owner:H(e.user_id),mine:xa(e.user_id),href:m("time",{},e.company_id),linkLabel:"My time",editable:!1}}function _d(e){return!e||!h("calendar.view",e.company_id)?!1:e.visibility!=="private"?!0:h("calendar.view_team",e.company_id)||Ot(e)||xa(e.assigned_profile_id)}function Ot(e){return e?h("calendar.manage",e.company_id)||e.created_by===b().profile.id:!1}function vd(e){return e.linked_type==="job"&&e.linked_id&&h("jobs.view",e.company_id)?m("jobs",{tab:"profile",job_id:e.linked_id},e.company_id):e.linked_type==="task"&&e.linked_id&&h("tasks.view",e.company_id)?m("tasks",{task_id:e.linked_id},e.company_id):e.linked_type==="form"&&e.linked_id&&h("forms.view",e.company_id)?m("forms",{form_id:e.linked_id},e.company_id):e.linked_type==="invoice"&&e.linked_id&&h("finance.view",e.company_id)?m("finance",{invoice:e.linked_id},e.company_id):""}function yd(e,t=u()){return Ea(t).find(a=>a.id===e)||null}function Rt(e){return n.calendarEvents.find(t=>t.id===e)||null}function js(e){return String(e||"")===String(b().profile.member_id||b().profile.id||"")}function xa(e){const t=b().profile;return[t.id,t.member_id,t.email].filter(Boolean).map(String).includes(String(e||""))}function hd(e){return e?Re(e)?.full_name||H(e)||String(e):"Unassigned"}function qs(e){if(!e)return k(0);const t=new Date(e);return Number.isNaN(t.getTime())?String(e).slice(0,10):t.toISOString().slice(0,10)}function As(e,t){return e.filter(a=>a.dateKey===t).sort((a,i)=>Date.parse(a.startsAt||0)-Date.parse(i.startsAt||0))}function wd(e){const t=Ai(new Date),a=new Date(t);return a.setDate(t.getDate()+7),e.filter(i=>{const s=Date.parse(i.startsAt||i.dateKey||0);return s>=t.getTime()&&s<a.getTime()})}function $d(e){const t=new Date(`${e.dateKey}T00:00:00`);if(n.calendarView==="month"){const s=new Date(`${n.calendarCursorDate}T00:00:00`);return t.getFullYear()===s.getFullYear()&&t.getMonth()===s.getMonth()}const a=Ai(new Date(`${n.calendarCursorDate}T00:00:00`)),i=new Date(a);return i.setDate(a.getDate()+7),t>=a&&t<i}function Sd(e){const t=new Date(`${e}T00:00:00`),a=new Date(t.getFullYear(),t.getMonth(),1),i=new Date(a);return i.setDate(a.getDate()-a.getDay()),Array.from({length:42},(s,o)=>{const l=new Date(i);return l.setDate(i.getDate()+o),{key:Mi(l),label:String(l.getDate()),month:l.getMonth()}})}function Ms(e){const t=Ai(new Date(`${e}T00:00:00`));return Array.from({length:7},(a,i)=>{const s=new Date(t);return s.setDate(t.getDate()+i),{key:Mi(s),name:new Intl.DateTimeFormat("en-US",{weekday:"short"}).format(s),shortDate:new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(s)}})}function kd(){const e=new Date(`${n.calendarCursorDate}T00:00:00`);if(n.calendarView==="month")return new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(e);if(n.calendarView==="week"){const t=Ms(n.calendarCursorDate);return`${E(t[0].key)} - ${E(t[6].key)}`}return"Upcoming"}function Ai(e){const t=new Date(e);return t.setHours(0,0,0,0),t.setDate(t.getDate()-t.getDay()),t}function Mi(e){const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),i=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${i}`}function Dn(e){const t=new Date(`${n.calendarCursorDate}T00:00:00`);n.calendarView==="month"?t.setMonth(t.getMonth()+e):t.setDate(t.getDate()+e*7),n.calendarCursorDate=Mi(t)}function Dd(e){return e.reduce((t,a)=>(t[a.dateKey]=t[a.dateKey]||[],t[a.dateKey].push(a),t),{})}function Fs(e){if(e.allDay)return"All day";const t=new Date(e.startsAt);return Number.isNaN(t.getTime())?"Timed":new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(t)}function Cd(e){return`calendar-type-${zt(e||"event")}`}function jd(e){return e==="Task due"?"ti-list-check":e==="Invoice due"?"ti-file-dollar":e==="Approval"?"ti-user-check":e==="Time"?"ti-clock":e.includes("Install")?"ti-hammer":e.includes("Estimate")?"ti-calendar-dollar":e.includes("Personal")?"ti-user":"ti-calendar-event"}function _e(e=u()){return n.files.filter(t=>t.company_id===e)}function ht(e=u()){return n.driveFolders.filter(t=>t.company_id===e)}function lt(e=u()){return n.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function ie(e=u()){const t=new Map;lt(e).forEach(i=>{t.set(i.id,{profile_id:"",member_id:i.id,name:i.full_name||i.name,email:i.email,avatar_url:i.avatar_url,role:oa(e,i.id).toLowerCase(),role_label:oa(e,i.id),role_id:"",status:i.active?"active":"disabled"})}),n.memberships.filter(i=>i.company_id===e).forEach(i=>{const s=Re(i.profile_id),o=i.member_id?n.teamMembers.find(f=>f.id===i.member_id):null,l=n.roleAssignments.find(f=>f.company_id===e&&f.profile_id===i.profile_id),d=l?ct(e,l.role_id):null,c=i.profile_id||i.member_id;t.set(c,{profile_id:i.profile_id,member_id:i.member_id,name:s?.full_name||o?.full_name||s?.email||o?.name||c||"User",email:s?.email||o?.email||"",avatar_url:s?.avatar_url||o?.avatar_url||"",role:i.role,role_label:d?.name||T(i.role),role_id:l?.role_id||wt(e,i.role),status:i.status||"active"})});const a=b().profile;if(n.session?.auth==="supabase"&&a?.id&&!t.has(a.id)){const i=oe(e,a.id);i&&t.set(a.id,{profile_id:a.id,member_id:a.member_id||"",name:a.full_name||a.email,email:a.email,avatar_url:a.avatar_url,role:i.role,role_label:T(i.role),role_id:wt(e,i.role),status:i.status||"active"})}return[...t.values()].sort((i,s)=>(i.status==="active"?0:1)-(s.status==="active"?0:1)||i.name.localeCompare(s.name))}function qd(e=u()){return n.companyInvites.filter(t=>t.company_id===e&&t.status==="pending").sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function Is(e=u()){return n.auditEvents.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function Ad(e){const t=Re(e.actor_profile_id),a=t?.full_name||t?.email||br(e.actor_profile_id||"system");return`
    <article class="access-audit-row">
      ${Z({full_name:a,email:t?.email||""},"avatar small")}
      <span>
        <strong>${r(T(String(e.event_type||"access.event").replace(/[._-]+/g," ")))}</strong>
        <small>${r(a)} / ${E(e.created_at)}</small>
      </span>
    </article>
  `}function de(e=u()){const t=n.roles.filter(a=>a.company_id===e);return t.length?t.sort((a,i)=>i.priority-a.priority||a.name.localeCompare(i.name)):[We({id:`owner-${e}`,company_id:e,name:"Owner",color:"#f0b23b",priority:1e3,is_system:!0}),We({id:`admin-${e}`,company_id:e,name:"Admin",color:"#60a5fa",priority:800,is_system:!0}),We({id:`staff-${e}`,company_id:e,name:"Staff",color:"#15803d",priority:100,is_system:!0})]}function ct(e,t){return de(e).find(a=>a.id===t)||null}function Oa(e=u()){return!n.rolePreview||n.rolePreview.company_id!==e?null:ct(e,n.rolePreview.role_id)}function Xa(e,t){if(!t)return!0;const a=String(e?.name||"").toLowerCase();if(["owner","admin","developer"].includes(a))return!0;const i=Fi(t),s=n.rolePermissions.filter(d=>d.role_id===e?.id);if(s.some(d=>(i.includes(d.permission_key)||d.permission_key==="*")&&d.effect==="deny"))return!1;if(s.some(d=>(i.includes(d.permission_key)||d.permission_key==="*")&&d.effect==="allow"))return!0;if(s.length)return!1;const o=Ii(e),l=Ge[o]||Ge.member;return l.includes("*")||i.some(d=>l.includes(d))}function Fi(e){return z([e,...yr[e]||[]])}function wt(e,t){const a=String(t||"").toLowerCase();return de(e).find(i=>i.name.toLowerCase()===a||i.id.toLowerCase()===a)?.id||""}function Md(e=u()){const t=de(e).filter(a=>a.name.toLowerCase()!=="owner");return t.find(a=>a.name.toLowerCase()==="staff")?.id||t.find(a=>a.name.toLowerCase()==="member")?.id||t[0]?.id||""}function Fd(){const e=new Uint8Array(8);return crypto.getRandomValues(e),`QH-${Array.from(e,t=>t.toString(36).padStart(2,"0")).join("").toUpperCase()}`}function Id(e){const t=new URL(_("/login"),window.location.origin);return t.searchParams.set("invite",e.token),t.toString()}function Ii(e){const t=String(e?.name||"").toLowerCase().replace(/\s+/g,"_");return["owner","member","worker","sales","supervisor","admin","developer","construction_supervisor"].includes(t)?t:"member"}function Re(e){return n.profiles.find(t=>t.id===e)||(b().profile.id===e?b().profile:null)}function Ts(e=u()){const t=n.query.trim().toLowerCase();return Q(e).filter(a=>n.stageFilter!=="all"&&a.stage!==n.stageFilter?!1:t?[a.name,a.client_name,a.contact_name,a.owner_name,a.site_address,a.job_type,I(a.company_id)].some(i=>String(i||"").toLowerCase().includes(t)):!0)}function Pt(e=u()){const t=new Map;return Q(e).forEach(a=>{const i=String(a.client_name||"").trim()||"Unassigned customer",s=`account-${zt(i.toLowerCase())}`;t.has(s)||t.set(s,{key:s,name:i,jobs:[]}),t.get(s).jobs.push(a)}),Array.from(t.values()).map(a=>{const i=a.jobs.slice().sort((x,ne)=>Date.parse(ne.updated_at||ne.created_at||0)-Date.parse(x.updated_at||x.created_at||0)),s=i[0]||null,o=i.map(x=>x.id),l=K(e).filter(x=>o.includes(x.project_id)),d=he(e).filter(x=>o.includes(x.linked_job_id)),c=_e(e).filter(x=>o.includes(x.job_id)),f=z(i.map(x=>x.contact_name)),g=z(i.map(x=>x.owner_name)),S=z(i.map(x=>x.site_address)),V=i.map(x=>x.priority||"Medium").sort((x,ne)=>st(ne)-st(x))[0]||"Medium";return{...a,jobs:i,tasks:l,latestJob:s,contacts:f,owners:g,addresses:S,forms:d,files:c,primaryContact:f[0]||"No contact",owner:g[0]||"Unassigned",stage:s?.stage||"Lead",priority:V,estimateTotal:me(i,"estimate_total"),fileCount:c.length,formCount:d.length,updatedAt:s?.updated_at||s?.created_at||new Date().toISOString(),subtitle:S[0]||`${i.length} linked job${i.length===1?"":"s"}`}}).sort((a,i)=>Date.parse(i.updatedAt||0)-Date.parse(a.updatedAt||0))}function Td(e=u()){const t=n.crmQuery.trim().toLowerCase();return Pt(e).filter(a=>n.crmStageFilter!=="all"&&!a.jobs.some(i=>i.stage===n.crmStageFilter)||n.crmOwnerFilter!=="all"&&!a.owners.includes(n.crmOwnerFilter)?!1:t?[a.name,a.primaryContact,a.owner,a.stage,...a.addresses,...a.contacts,...a.jobs.map(i=>i.name)].some(i=>String(i||"").toLowerCase().includes(t)):!0)}function Ed(e,t){return Pt(e).find(a=>a.key===t)||null}function xd(e=u()){return z(Q(e).map(t=>t.owner_name)).sort((t,a)=>t.localeCompare(a))}function Es(e=u()){const t=b().profile.member_id||"",a=K(e).slice().sort(ei),i=a.filter(Ei),s=i.filter(S=>S.due===k(0)),o=i.filter(S=>xn(S.due)<0),l=i.filter(S=>{const V=xn(S.due);return V>=0&&V<=7}),d=i.filter(S=>S.assignee_id===t),c=i.filter(S=>["review","pending"].includes(S.status)),f=a.filter(S=>S.status==="done"),g=z(o.concat(s,d,c,l).map(S=>S.id)).map(S=>a.find(V=>V.id===S)).filter(Boolean).sort(ei);return{tasks:a,open:i,dueToday:s,overdue:o,thisWeek:l,assignedToMe:d,review:c,done:f,focus:g}}function Ti(e=u()){const t=he(e).filter(s=>(s.require_approval||s.type==="Client approval")&&!["Archived","Closed","Approved"].includes(s.status)).map(s=>({id:`form:${s.id}`,title:s.title,meta:P(s.linked_job_id)?.name||s.description||"Company form",type:"Form approval",owner:H(s.creator_id),status:s.status,updatedAt:s.updated_at||s.created_at,href:m("forms",{form_id:s.id},e)})),a=K(e).filter(s=>["review","pending"].includes(s.status)).map(s=>({id:`task:${s.id}`,title:s.title,meta:P(s.project_id)?.name||s.description||"Company task",type:"Task review",owner:H(s.assignee_id),status:$e(s.status),updatedAt:s.updated_at||s.due,href:m("tasks",{...s.project_id?{job_id:s.project_id}:{},task_id:s.id},e)})),i=n.memberships.filter(s=>s.company_id===e&&s.status!=="active").map(s=>({id:`access:${s.profile_id||s.member_id}`,title:H(s.member_id||s.profile_id),meta:`${T(s.role)} access request`,type:"Access request",owner:"Quest admin",status:T(s.status),updatedAt:new Date().toISOString(),href:m("settings",{tab:"access"},e)}));return t.concat(a,i).sort((s,o)=>Date.parse(o.updatedAt||0)-Date.parse(s.updatedAt||0))}function Ut(e=u()){const t=n.activeTimer;return!t||t.company_id!==e?null:t}function xs(e=u()){return n.timeEntries.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.started_at||0)-Date.parse(t.started_at||0))}function Cn(e=u(),t=0){return xs(e).filter(a=>Date.parse(a.started_at||0)>=t).reduce((a,i)=>a+R(i.duration_ms),0)}function Od(e=u(),t=""){if(!y("time.track",e,"Your role cannot track time in this workspace.","Time"))return;n.activeTimer&&Os(!1);const a=t?Fa(t):null;n.activeTimer={id:`timer-${crypto.randomUUID()}`,company_id:e,user_id:b().profile.member_id||b().profile.id,task_id:a?.company_id===e?a.id:"",task_title:a?.company_id===e?a.title:"",started_at:new Date().toISOString()},zs(),n.sync={label:"Clock started locally",mode:"local"},p()}function Os(e=!0){const t=n.activeTimer;if(!t)return;const a=new Date().toISOString(),i=Math.max(0,Date.parse(a)-Date.parse(t.started_at||a));n.timeEntries.unshift({id:`time-${crypto.randomUUID()}`,company_id:t.company_id,user_id:t.user_id,task_id:t.task_id||"",task_title:t.task_title||"",started_at:t.started_at,ended_at:a,duration_ms:i,notes:t.task_title?"Task timer":"General shift"}),n.activeTimer=null,zs(),n.sync={label:"Clock stopped locally",mode:"local"},e&&p()}function Ei(e){return e.status!=="done"}function ei(e,t){const a=Date.parse(e.due||0)-Date.parse(t.due||0);return a||st(t.priority)-st(e.priority)}function ve(e=u()){return n.financeInvoices.filter(t=>t.company_id===e).sort(qt("updated_at"))}function Rs(e=u()){return n.financePayments.filter(t=>t.company_id===e)}function xi(e=u()){return n.financeExpenses.filter(t=>t.company_id===e).sort(qt("updated_at"))}function Oi(e=u()){return n.financeVendors.filter(t=>t.company_id===e)}function Pe(e){return n.financeInvoices.find(t=>t.id===e)||null}function Ps(e){return n.financeExpenses.find(t=>t.id===e)||null}function Ri(e){return n.financeVendors.find(t=>t.id===e)||null}function ti(e){return Ri(e)?.name||"No vendor"}function Us(e){return n.financePayments.filter(t=>t.invoice_id===e).sort(qt("received_at"))}function Pi(e){return me(Us(e),"amount")}function pe(e){const t=Pe(e);return Math.max(0,R(t?.total)-Pi(e))}function Ns(e){const t=pe(e.id);return t<=0&&R(e.total)>0?"Paid":t<R(e.total)?"Partially paid":e.status==="Sent"&&fr(e.due_date)>0?"Overdue":e.status}function Ls(e=u()){const t=ve(e),a=Rs(e),i=xi(e).filter(d=>["Approved","Paid"].includes(d.status)),s={current:0,thirty:0,sixty:0,overSixty:0};t.forEach(d=>{const c=pe(d.id);if(!c)return;const f=fr(d.due_date);f<=0?s.current+=c:f<=30?s.thirty+=c:f<=60?s.sixty+=c:s.overSixty+=c});const o=me(a,"amount"),l=me(i,"amount");return{pipeline:me(Q(e),"estimate_total"),invoiced:me(t,"total"),collected:o,outstanding:t.reduce((d,c)=>d+pe(c.id),0),expenses:l,net:o-l,aging:s}}function Rd(e=u(),t=""){const a=n.query.trim().toLowerCase();return K(e).filter(i=>t&&i.project_id!==t||n.taskStatusFilter!=="all"&&i.status!==n.taskStatusFilter||n.taskPriorityFilter!=="all"&&i.priority!==n.taskPriorityFilter?!1:a?[i.title,i.description,Qe(i.type),H(i.assignee_id),P(i.project_id)?.name].some(s=>String(s||"").toLowerCase().includes(a)):!0)}function Ui(){const e=Ue();return n.companies.filter(t=>e.includes(t.id))}function h(e,t=u()){if(!e)return!0;const a=Oa(t);if(a)return Xa(a,e);const i=Fi(e),s=b().profile;if(n.session?.auth==="supabase"){const d=oe(t,s.id);if(!d||d.status!=="active")return!1;if(["owner","developer"].includes(String(d.role).toLowerCase()))return!0;const c=n.roleAssignments.filter(g=>g.company_id===t&&g.profile_id===s.id).map(g=>g.role_id),f=n.rolePermissions.filter(g=>c.includes(g.role_id));if(f.some(g=>(i.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="deny"))return!1;if(f.some(g=>(i.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="allow"))return!0}const o=String(oe(t,s.id)?.role||s.role||"member").toLowerCase(),l=Ge[o]||Ge.member;return l.includes("*")||i.some(d=>l.includes(d))}function y(e,t=u(),a="Your role cannot perform that action.",i="Access"){return h(e,t)?!0:($(a,"local",i),!1)}function Ue(){const e=b().profile,t=n.companies.map(s=>s.id);if(n.session?.auth==="supabase"){const s=n.memberships.filter(o=>o.profile_id===e.id&&o.status==="active").map(o=>w(o.company_id));return z(s).filter(o=>t.includes(o))}if(["developer","admin"].includes(e.role))return z(t.length?t:Et.map(s=>w(s.id)));const a=n.memberships.filter(s=>s.profile_id===e.id&&s.status==="active").map(s=>w(s.company_id)),i=a.length?a:e.company_ids||[];return z(i.map(w)).filter(s=>t.includes(s))}function u(){const e=Ue();return e.includes(n.activeCompanyId)?n.activeCompanyId:e[0]||n.activeCompanyId||L()}function L(){return w(Et[0].id)}function Ra(e){const t=w(e);return n.companies.find(a=>a.id===t)||Et.map(et).find(a=>a.id===t)||null}function I(e){const t=Ra(e);return t?Nt(t):e||"Company"}function Nt(e){return e.short_name||e.label||e.name||e.id}function qe(e){return Ra(e)?.color||"#f0b23b"}function aa(e){return w(n.jobs.find(t=>t.id===e)?.company_id||"")}function Xe(e){const t=Oa(e);if(t)return`Preview: ${t.name}`;const a=b().profile;return n.session?.auth!=="supabase"&&["developer","admin"].includes(a.role)?T(a.role):T(oe(e,a.id)?.role||a.role||"member")}function oa(e,t){const a=n.memberships.find(i=>i.company_id===e&&(i.member_id===t||i.profile_id===t));return T(a?.role||"member")}function oe(e,t){return n.memberships.find(a=>a.company_id===e&&a.profile_id===t)||null}function Pd(e=u()){return n.memberships.filter(t=>t.company_id===e&&t.role==="owner"&&t.status==="active")}function Qs(e,t){const a=Pd(e);return a.length===1&&a[0].profile_id===t}function Ud(e,t,a,i){const s=oe(e,t),o=Ii(a);if(s?.role==="owner"&&s.status==="active"&&(o!=="owner"||i!=="active")&&Qs(e,t))return"Promote another active Owner before changing the last Owner.";const l=oe(e,b().profile.id),d=String(b().profile.role||"").toLowerCase();return(["owner","developer"].includes(s?.role)||["owner","developer"].includes(o))&&!["owner","developer"].includes(String(l?.role||d).toLowerCase())?"Only an Owner can change Owner or Developer access.":""}function Lt(e=u()){return n.subscriptions.find(t=>t.company_id===e)||null}function Nd(){const e=n.workspaceReviews.map(bt),t=n.subscriptions.filter(s=>["pending_review","active","trialing","suspended","canceled"].includes(s.status)).map(s=>bt({company_id:s.company_id,company_name:I(s.company_id),status:s.status,plan_code:s.plan_code,amount_cents:s.amount_cents,currency:s.currency,trial_ends_at:s.trial_ends_at,current_period_end:s.current_period_end,grace_ends_at:s.grace_ends_at,created_at:s.created_at||""})),a=Ua().map(s=>bt({company_id:s,company_name:I(s),status:"pending_review"})),i=new Map;return t.concat(a,e).forEach(s=>{s.company_id&&i.set(s.company_id,{...i.get(s.company_id)||{},...s})}),Array.from(i.values()).sort((s,o)=>s.status==="pending_review"&&o.status!=="pending_review"?-1:s.status!=="pending_review"&&o.status==="pending_review"?1:String(s.company_name).localeCompare(String(o.company_name)))}function ee(e=u()){if(n.session?.auth!=="supabase")return!0;if(Pa(e))return!1;const t=Lt(e);return!!(!t||["trialing","active","past_due","grace"].includes(t.status)||t.grace_ends_at&&Date.parse(t.grace_ends_at)>Date.now())}function Pa(e=u()){const t=Lt(e);return t?.status==="pending_review"?!0:["active","past_due","grace"].includes(t?.status)?!1:Ua().includes(w(e))}function Ua(){return Se(gi,[]).map(w).filter(Boolean)}function Ni(e){const t=w(e);if(!t)return;const a=Array.from(new Set(Ua().concat(t)));D(gi,a)}function Ld(e){const t=w(e);t&&D(gi,Ua().filter(a=>a!==t))}function Qd(e){const t=String(e||"").trim();return!t||n.inviteLookup?.token!==t?null:n.inviteLookup}function Na(e=u()){const t=Lt(e);return t?la(t.status,t):n.session?.auth==="supabase"?"Approval pending":"Demo mode"}function la(e,t={}){const a=La(e)||String(e||"");return a==="pending_review"?"Awaiting Quest approval":a==="trialing"?`Trial - ${E(t.trial_ends_at)}`:a==="active"?"Active subscription":a==="past_due"?"Past due grace":a==="grace"?`Grace - ${E(t.grace_ends_at)}`:a==="suspended"?"Suspended":a==="canceled"?"Rejected":T(a||"Unknown")}function La(e){const t=String(e||"").toLowerCase().trim();return["pending_review","trialing","active","past_due","grace","suspended","canceled","incomplete"].includes(t)?t:""}function Li(){return String(b().profile?.role||"").toLowerCase()==="developer"}function H(e){const t=n.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function Ne(e){const t=Re(e);return t?.full_name||t?.email||H(e)}function Qa(e){return n.tasks.filter(t=>t.project_id===e).length}function ca(e){return n.files.filter(t=>t.job_id===e).length}function w(e){return{"quest-roofing":"roofing","quest-drafting":"drafting"}[String(e||"").trim()]||String(e||"").trim()}function Qi(e){const t=new Map;return e.map(et).forEach(a=>{!a.id||t.has(a.id)||t.set(a.id,a)}),Array.from(t.values())}function Vs(e){const t=new Map;return e.map(ua).forEach(a=>{a.company_id&&t.set(a.company_id,{...t.get(a.company_id)||{},...a})}),Array.from(t.values())}function et(e){return{id:w(e.id||""),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function tt(e){return{id:String(e.id||""),company_id:w(e.company_id||L()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:Mt.includes(e.stage)?e.stage:"Lead",priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:R(e.estimate_total),invoice_total:R(e.invoice_total),task_count:R(e.task_count),file_count:R(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function at(e){const t=na.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=Ft.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:Qn.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:w(e.company_id||L()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||k(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:na.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function $t(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:w(e.company_id||L()),job_id:String(e.job_id||""),folder:String(e.folder||tm(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:R(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Vi(e){return{id:String(e.id||`folder-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),name:String(e.name||"New folder").trim()||"New folder",parent_key:String(e.parent_key||"home"),created_by_label:String(e.created_by_label||"Quest HQ"),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Qt(e){const t=Array.isArray(e.questions)?e.questions.map(Va):[],a=It.includes(e.type)?e.type:"Internal",i=_i.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:i,audience:String(e.audience||"Internal").trim(),creator_id:String(e.creator_id||e.created_by||e.created_by_id||""),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Va(e){const t=Tt.some(([i])=>i===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(i=>String(i||"").trim()).filter(Boolean):[]};return jt(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function Yi(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function Vt(e){const t=R(e.subtotal),a=R(e.tax),i=R(e.total)||t+a;return{id:String(e.id||`invoice-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),job_id:String(e.job_id||""),client_name:String(e.client_name||"").trim(),invoice_number:String(e.invoice_number||`INV-${Date.now()}`).trim(),status:Vn.includes(e.status)?e.status:"Draft",issue_date:String(e.issue_date||k(0)).slice(0,10),due_date:String(e.due_date||k(30)).slice(0,10),subtotal:t,tax:a,total:i,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Yt(e){return{id:String(e.id||`payment-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),invoice_id:String(e.invoice_id||""),amount:R(e.amount),method:Hn.includes(e.method)?e.method:"ACH",received_at:String(e.received_at||k(0)).slice(0,10),reference:String(e.reference||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString()}}function Bt(e){return{id:String(e.id||`expense-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),job_id:String(e.job_id||""),vendor_id:String(e.vendor_id||""),category:ja.includes(e.category)?e.category:"Other",amount:R(e.amount),status:Yn.includes(e.status)?e.status:"Pending",spent_at:String(e.spent_at||k(0)).slice(0,10),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ht(e){return{id:String(e.id||`vendor-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),name:String(e.name||"New vendor").trim()||"New vendor",contact_name:String(e.contact_name||"").trim(),email:String(e.email||"").trim(),phone:String(e.phone||"").trim(),category:ja.includes(e.category)?e.category:"Other",status:Bn.includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Bi(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,supervisor_id:String(e.supervisor_id||e.manager_id||""),company_ids:Array.isArray(e.company_ids)?z(e.company_ids.map(w)):[]}}function da(e){const t=["active","pending","disabled","left"].includes(String(e.status))?String(e.status):"active";return{company_id:w(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:t,disabled_at:e.disabled_at||"",disabled_by:String(e.disabled_by||""),left_at:e.left_at||"",last_active_at:e.last_active_at||""}}function ua(e){return{company_id:w(e.company_id||""),status:La(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:R(e.amount_cents||3e4),currency:String(e.currency||"usd"),stripe_customer_id:String(e.stripe_customer_id||""),stripe_subscription_id:String(e.stripe_subscription_id||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||""}}function bt(e){return{company_id:w(e.company_id||""),company_name:String(e.company_name||e.name||e.short_name||e.company_id||"").trim(),status:La(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:R(e.amount_cents||3e4),currency:String(e.currency||"usd"),owner_profile_id:String(e.owner_profile_id||""),owner_name:String(e.owner_name||""),owner_email:String(e.owner_email||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||"",updated_at:e.updated_at||""}}function We(e){return{id:String(e.id||""),company_id:w(e.company_id||""),name:String(e.name||"Role").trim()||"Role",color:String(e.color||"#f0b23b"),priority:R(e.priority),is_system:e.is_system===!0,created_by:String(e.created_by||"")}}function ai(e){return{role_id:String(e.role_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function Ys(e){return{company_id:w(e.company_id||""),profile_id:String(e.profile_id||""),role_id:String(e.role_id||""),assigned_by:String(e.assigned_by||"")}}function Vd(e){return{id:String(e.id||""),company_id:w(e.company_id||""),resource_type:String(e.resource_type||""),resource_id:String(e.resource_id||""),principal_type:String(e.principal_type||""),principal_id:String(e.principal_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function Yd(e){return{id:String(e.id||""),company_id:w(e.company_id||""),resource_type:String(e.resource_type||""),field_key:String(e.field_key||""),role_id:String(e.role_id||""),visibility:["visible","masked","hidden"].includes(e.visibility)?e.visibility:"visible",editable:e.editable!==!1}}function ma(e){return{id:String(e.id||""),company_id:w(e.company_id||""),email:String(e.email||""),role_id:String(e.role_id||""),token:String(e.token||""),status:String(e.status||"pending"),expires_at:e.expires_at||"",invited_by:String(e.invited_by||""),accepted_by:String(e.accepted_by||""),created_at:e.created_at||""}}function Bs(e){return{id:String(e.id||""),company_id:w(e.company_id||""),profile_id:String(e.profile_id||""),requested_email:String(e.requested_email||""),status:String(e.status||"pending"),message:String(e.message||""),reviewed_by:String(e.reviewed_by||""),created_at:e.created_at||""}}function ye(e){return{id:String(e.id||""),company_id:w(e.company_id||""),title:String(e.title||"Messages").trim()||"Messages",type:vi.includes(e.type)?e.type:"custom",created_by:String(e.created_by||""),last_message_at:e.last_message_at||e.updated_at||e.created_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ae(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:w(e.company_id||""),target_type:["all_company","role","profile"].includes(e.target_type)?e.target_type:"profile",target_id:String(e.target_id||""),created_at:e.created_at||""}}function ke(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:w(e.company_id||""),sender_profile_id:String(e.sender_profile_id||e.created_by||""),body:String(e.body||""),message_type:String(e.message_type||"text"),deleted_at:e.deleted_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function xe(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),message_id:String(e.message_id||""),company_id:w(e.company_id||""),bucket_id:String(e.bucket_id||"quest-message-attachments"),object_path:String(e.object_path||""),file_name:String(e.file_name||"attachment"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:R(e.size_bytes),preview_url:String(e.preview_url||""),created_at:e.created_at||new Date().toISOString()}}function Wt(e){return{conversation_id:String(e.conversation_id||""),company_id:w(e.company_id||""),profile_id:String(e.profile_id||""),last_read_at:e.last_read_at||"",updated_at:e.updated_at||e.last_read_at||""}}function it(e){const t=e.starts_at||new Date().toISOString(),a=Ca.includes(e.event_type)?e.event_type:"Company event",i=["company","private"].includes(e.visibility)?e.visibility:"company",s=["","job","task","form","invoice"].includes(e.linked_type)?e.linked_type:"";return{id:String(e.id||`calendar-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),title:String(e.title||"Calendar event").trim()||"Calendar event",description:String(e.description||"").trim(),event_type:a,starts_at:t,ends_at:e.ends_at||t,all_day:e.all_day===!0||e.all_day==="true"||e.all_day==="on",visibility:i,linked_type:s,linked_id:String(e.linked_id||""),assigned_profile_id:String(e.assigned_profile_id||""),created_by:String(e.created_by||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function jn(e){return{id:e.id,company_id:e.company_id,title:e.title,type:e.type,created_by:e.created_by||b().profile.id,last_message_at:e.last_message_at||null}}function Bd(e){return{conversation_id:e.conversation_id,company_id:e.company_id,target_type:e.target_type,target_id:e.target_id}}function Hd(e){return{id:e.id,conversation_id:e.conversation_id,company_id:e.company_id,sender_profile_id:e.sender_profile_id,body:e.body,message_type:e.message_type,deleted_at:e.deleted_at||null}}function Wd(e){return{id:e.id,conversation_id:e.conversation_id,message_id:e.message_id,company_id:e.company_id,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes}}function zd(e){return{id:At(e.id)?e.id:void 0,company_id:e.company_id,title:e.title,description:e.description,event_type:e.event_type,starts_at:e.starts_at,ends_at:e.ends_at||e.starts_at,all_day:e.all_day,visibility:e.visibility,linked_type:e.linked_type||"",linked_id:e.linked_id||"",assigned_profile_id:e.assigned_profile_id||"",created_by:At(e.created_by)?e.created_by:b().profile.id}}function Jd(e){return{conversation_id:e.conversation_id,company_id:e.company_id,profile_id:e.profile_id,last_read_at:e.last_read_at||new Date().toISOString()}}function Kd(e=u()){return tt({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function Gd(e=u(),t=""){return at({id:"",title:"",company_id:e,project_id:t,assignee_id:lt(e)[0]?.id||"abraham",creator_id:b().profile.member_id||"abraham",due:k(1),priority:"medium",status:"todo",type:"admin"})}function Zd(e=u()){const t=Ee();return Vt({id:"",company_id:e,job_id:t?.company_id===e?t.id:"",client_name:t?.company_id===e?t.client_name:"",invoice_number:im(e),status:"Draft",issue_date:k(0),due_date:k(30),subtotal:t?.company_id===e?t.estimate_total:0,tax:0,notes:""})}function Xd(e=u(),t=""){const a=t?Pe(t):ve(e).find(s=>pe(s.id)>0),i=a?.company_id===e?a:null;return Yt({id:"",company_id:e,invoice_id:i?.id||"",amount:i?pe(i.id):0,method:"ACH",received_at:k(0),reference:"",notes:""})}function eu(e=u(),t=""){return Bt({id:"",company_id:e,job_id:Ee()?.company_id===e?Ee().id:"",vendor_id:t||Oi(e)[0]?.id||"",category:"Materials",status:"Pending",amount:0,spent_at:k(0),notes:""})}function tu(e=u()){return Ht({id:"",company_id:e,name:"",category:"Materials",status:"Active"})}function au(e=u()){const t=new Date;t.setHours(t.getHours()+1,0,0,0);const a=new Date(t);return a.setHours(t.getHours()+1),it({id:"",company_id:e,title:"",description:"",event_type:"Company event",starts_at:t.toISOString(),ends_at:a.toISOString(),all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:b().profile.member_id||b().profile.id,created_by:b().profile.id})}function iu(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function nu(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function b(){return n.session?n.session.auth==="supabase"?n.session:{...n.session,profile:{...ii().profile,...n.session.profile||{},...n.profileDraft||{}}}:ii()}function su(e,t){const a=!!(e.user.email_confirmed_at||e.user.confirmed_at);return{auth:"supabase",access_token:e.access_token,refresh_token:e.refresh_token,user:{id:e.user.id,email:e.user.email||"",email_confirmed_at:e.user.email_confirmed_at||e.user.confirmed_at||"",email_verified:a},profile:St(t||{},{id:e.user.id,email:e.user.email||"",full_name:e.user.user_metadata?.full_name||e.user.email||"Quest user",role:"member",member_id:"",company_ids:[],avatar_url:"",email_verified:a})}}function ii(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",email_verified:!0,...n.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:Je.localUsername,email:e.email},profile:e}}function St(e,t={}){const a=String(e.role||t.role||"member").toLowerCase(),i=typeof e.email_verified=="boolean"?e.email_verified:t.email_verified===!0;return{id:String(e.id||t.id||""),email:String(e.email||t.email||""),full_name:String(e.full_name||t.full_name||e.email||t.email||"Quest user"),role:a,role_label:T(a),member_id:String(e.member_id||t.member_id||""),company_ids:Array.isArray(e.company_ids)?z(e.company_ids.map(w)):t.company_ids||[],avatar_url:String(e.avatar_url||t.avatar_url||""),approved:e.approved!==!1,email_verified:i,supervisor_id:String(e.supervisor_id||t.supervisor_id||"")}}function kt(e){const t=ru(e.html||e.meta||""),a=e.read_at||(e.read===!0?e.created_at||new Date().toISOString():"");return{id:String(e.id||`notification-${crypto.randomUUID()}`),company_id:w(e.company_id||""),recipient_profile_id:String(e.recipient_profile_id||e.profile_id||e.member_id||"basic-quest-user"),type:String(e.type||(e.task_id?"task.notification":"general")),title:String(e.title||e.meta||"Notification"),body:String(e.body||t||""),href:String(e.href||""),source_type:String(e.source_type||(e.task_id?"task":"")),source_id:String(e.source_id||e.task_id||""),read_at:String(a||""),created_at:String(e.created_at||new Date().toISOString())}}function ru(e){return String(e||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}function ou(e=b()){return e.auth!=="supabase"?!0:e.user?.email_verified===!0||!!e.user?.email_confirmed_at||e.profile?.email_verified===!0}function X(e,t,a=""){const i=os();return`
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${Y(i)}</span>
        <div>
          <div class="context-line"><span>${r(I(u()))}</span><b>${r(Xe(u()))}</b></div>
          <h1>${r(e)}</h1>
          <p>${r(t)}</p>
        </div>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function Hi(e){return`
    <button class="queue-row" type="button" data-select-task="${r(e.id)}">
      <span><strong>${r(e.title)}</strong><small>${r(P(e.project_id)?.name||I(e.company_id))}</small></span>
      ${Wi(e.priority)}
      <b>${r($e(e.status))}</b>
    </button>
  `}function lu(e){return`
    <button class="job-card priority-${r(e.priority.toLowerCase())} ${e.id===n.selectedJobId?"active":""}" type="button" data-select-job="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.client_name||"No client")}</span>
      <small>${r(I(e.company_id))} - ${r(e.owner_name||"Unassigned")}</small>
      <em>${r(Qa(e.id))} tasks</em>
    </button>
  `}function Zt(e,t,a,i){return`
    <a class="mini-link" href="${_(e)}" data-router>
      <i class="ti ${r(t)}"></i>
      <span><strong>${r(a)}</strong><small>${r(i)}</small></span>
    </a>
  `}function W(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${r(t)}</span><strong>${r(a)}</strong></div>`).join("")}</div>`}function F(e,t,a="",i=!1,s="text",o=""){return`<label class="${r(o)}"><span>${r(e)}</span><input name="${r(t)}" type="${r(s)}" value="${r(a)}" ${i?"required":""} /></label>`}function De(e,t,a="",i=""){return`<label class="${r(i)}"><span>${r(e)}</span><textarea name="${r(t)}" rows="4">${r(a)}</textarea></label>`}function U(e,t,a,i){return`
    <label><span>${r(e)}</span><select name="${r(t)}">
      ${i.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function Hs(e){return`<span class="priority ${r(String(e).toLowerCase())}">${r(e)}</span>`}function Wi(e){return`<span class="priority ${r(e)}">${r(T(e))}</span>`}function Ws(e){return`<span class="status-pill ${r(e)}">${r($e(e))}</span>`}function cu(e){return`<span class="finance-status ${r(zt(e))}">${r(e)}</span>`}function Z(e,t){if(e.avatar_url)return`<span class="${r(t)}"><img src="${r(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(i=>i[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${r(t)}">${r(a)}</span>`}function du(e=u()){const t=ie(e).filter(a=>a.status==="active").map(a=>[a.profile_id||a.member_id,a.name||a.email||a.member_id]);return[["","Unassigned"]].concat(t)}function qn(e){const t=new Date(e||Date.now());if(Number.isNaN(t.getTime()))return"";const a=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),o=String(t.getHours()).padStart(2,"0"),l=String(t.getMinutes()).padStart(2,"0");return`${a}-${i}-${s}T${o}:${l}`}function An(e){const t=new Date(e||Date.now());return Number.isNaN(t.getTime())?new Date().toISOString():t.toISOString()}function v(e){return`<div class="empty-state">${Y("q-empty","empty-symbol")}<span>${r(e)}</span></div>`}function ce(e,t){const a={};return t.forEach(i=>{const s=e.get(i);s&&(a[i]=s)}),a}function te(){n.session?.auth!=="supabase"&&(D(si,n.jobs),D(ri,n.tasks),D(oi,n.files),D(li,n.driveFolders),D(rt,n.forms),D(ba,n.formResponses),D(ui,n.financeInvoices),D(mi,n.financePayments),D(pi,n.financeExpenses),D(fi,n.financeVendors),D(_a,n.timeEntries),D(va,n.activeTimer),D(ci,n.teamMembers),D(di,n.memberships),D(ya,n.notifications),D(ha,n.messageConversations),D(wa,n.messageAccess),D($a,n.messages),D(Sa,n.messageReads),D(ka,n.messageAttachments),D(Da,n.calendarEvents))}function zs(){n.session?.auth!=="supabase"&&(D(_a,n.timeEntries),D(va,n.activeTimer))}function zi(){n.session?.auth!=="supabase"&&D(ya,n.notifications)}function Js(){n.session?.auth!=="supabase"&&D(Da,n.calendarEvents)}function Le(){n.session?.auth!=="supabase"&&(D(ha,n.messageConversations),D(wa,n.messageAccess),D($a,n.messages),D(Sa,n.messageReads),D(ka,n.messageAttachments))}function Ji(e,t,a){if(a==="company")return[ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"all_company",target_id:"all"})];const i=[];return e.getAll("role_ids").forEach(s=>{s&&i.push(ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"role",target_id:s}))}),e.getAll("profile_ids").forEach(s=>{s&&i.push(ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:s}))}),i.length?i:[ae({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:b().profile.id})]}function Ya(e,t=!0){if(!e)return;const a=n.messageConversations.find(l=>l.id===e);if(!a)return;const i=new Date().toISOString(),s=b().profile.id,o=Wt({conversation_id:e,company_id:a.company_id,profile_id:s,last_read_at:i});if(n.messageReads=[o].concat(n.messageReads.filter(l=>l.conversation_id!==e||l.profile_id!==s)),Le(),t&&n.session?.auth==="supabase"){const l=q();l&&l.from("message_reads").upsert(Jd(o),{onConflict:"conversation_id,profile_id"})}}function Ks(e,t,a=[]){const i=m("messages",{conversation:e.id},e.company_id),s=Ne(t.sender_profile_id),o=Dt(e).filter(d=>d!==be(e.company_id,t.sender_profile_id)),l=uu(t.body,e.company_id).filter(d=>d!==be(e.company_id,t.sender_profile_id));e.type==="direct"&&J("message.direct","New direct message",`${s} sent a direct message in ${e.title}.`,i,"message",t.id,e.company_id,o),l.forEach(d=>{Be({company_id:e.company_id,recipients:[d],type:"message.mention",title:"Mentioned in chat",body:`${s} mentioned you in ${e.title}.`,href:i,sourceType:"message",sourceId:t.id}).catch(c=>console.warn("Message mention notification failed",c))}),a.length&&J("message.attachment","Attachment shared",`${s} shared ${a.length} attachment${a.length===1?"":"s"} in ${e.title}.`,i,"message",t.id,e.company_id,o)}function uu(e="",t=u()){const a=String(e||"").toLowerCase();return a.includes("@")?ie(t).filter(i=>a.includes(`@${String(i.name||"").split(/\s+/)[0].toLowerCase()}`)||a.includes(`@${String(i.name||"").toLowerCase()}`)).map(i=>be(t,i.profile_id||i.member_id)).filter(Boolean):[]}function Ki(e){const t=Re(e);if(t)return t;const a=n.teamMembers.find(i=>i.id===e);return{id:e,full_name:a?.full_name||a?.name||e||"Quest user",email:a?.email||"",avatar_url:a?.avatar_url||""}}function Ye(e){const t=String(e?.name||"").trim();if(t&&!ga(t))return t;const a=String(e?.email||"").trim();return a?a.split("@")[0]||a:"Workspace user"}function mu(e){return z([e?.email,e?.role_label||T(e?.role||""),T(e?.status||"")]).join(" / ")||"Company member"}function Mn(e){return{id:e?.profile_id||e?.member_id||"",full_name:Ye(e),email:e?.email||"",avatar_url:e?.avatar_url||""}}function pu(e){const t=String(e.value||"").trim().toLowerCase(),a=e.closest(".message-modal-form"),i=Array.from(a?.querySelectorAll("[data-message-person-row]")||[]);let s=0;i.forEach(l=>{const d=l.querySelector('input[type="checkbox"]')?.checked,c=!t||String(l.dataset.filterText||"").includes(t),f=d||c;l.hidden=!f,f&&(s+=1)});const o=a?.querySelector("[data-message-filter-count]");o&&(o.textContent=t?`${s} match${s===1?"":"es"}`:`${i.length} member${i.length===1?"":"s"}`)}function fu(e){return{company:"q-symbol-company-chat",role:"q-symbol-role-chat",custom:"q-symbol-messages",direct:"q-symbol-direct-chat"}[e]||"q-symbol-messages"}function Gi(e){const t=Ta(e.id);if(e.type==="company"||t.some(s=>s.target_type==="all_company"))return"Everyone in this company";const a=t.filter(s=>s.target_type==="role").map(s=>ct(e.company_id,s.target_id)?.name||"Role"),i=t.filter(s=>s.target_type==="profile").map(s=>Ne(s.target_id));return a.concat(i).slice(0,5).join(", ")||"Private chat"}function gu(e){return r(e).replace(/(^|\s)@([\w.-]+)/g,"$1<strong>@$2</strong>")}function Gs(e){const t=Number(e||0);return t>=1024*1024?`${(t/1024/1024).toFixed(1)} MB`:t>=1024?`${Math.round(t/1024)} KB`:`${t} B`}function Zs(e){return new Promise(t=>{const a=new FileReader;a.onload=()=>t(String(a.result||"")),a.onerror=()=>t(""),a.readAsDataURL(e)})}function bu(e,t){const a=q();if(n.session?.auth!=="supabase"||!a?.channel||!t)return;const i=`${e}:${t}`;n.messageRealtimeKey!==i&&(n.messageRealtimeChannel&&a.removeChannel(n.messageRealtimeChannel),n.messageRealtimeKey=i,n.messageRealtimeChannel=a.channel(`quest-messages-${t}`).on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:`conversation_id=eq.${t}`},()=>{n.dataLoaded=!1,p()}).on("postgres_changes",{event:"*",schema:"public",table:"message_attachments",filter:`conversation_id=eq.${t}`},()=>{n.dataLoaded=!1,p()}).subscribe())}function _u(e){const t=[()=>ia(e,"Crew weather delay","role","Manager posted a weather delay update.",!0),()=>ia(e,"Permit questions","custom","A permit packet PDF was shared.",!1,!0),()=>ia(e,"Shan Kumar","direct","Can you jump on this when you are back?",!0),()=>vu(e,"@Joshua you were mentioned in the launch room.")],a=Math.floor(Math.random()*t.length);t[a]()}function ia(e,t,a,i,s=!1,o=!1){const l=new Date().toISOString(),d=ye({id:`msg-conv-${crypto.randomUUID()}`,company_id:e,title:t,type:a,created_by:"basic-quest-user",last_message_at:l,created_at:l,updated_at:l}),c=a==="direct"?[ae({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:d.id,target_type:"profile",target_id:"basic-quest-user"}),ae({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:d.id,target_type:"profile",target_id:"shan"})]:Ji(new FormData,d,a==="role"?"role":"company");n.messageConversations.unshift(d),n.messageAccess=c.concat(n.messageAccess);const f=ke({id:`msg-${crypto.randomUUID()}`,conversation_id:d.id,company_id:e,sender_profile_id:s?"shan":"basic-quest-user",body:i,created_at:l,updated_at:l,message_type:o?"attachment":"text"});n.messages.push(f),o&&n.messageAttachments.push(xe({id:`msg-attachment-${crypto.randomUUID()}`,conversation_id:d.id,message_id:f.id,company_id:e,file_name:"permit-packet.pdf",mime_type:"application/pdf",size_bytes:42e4,created_at:l})),s||Ya(d.id,!1),n.selectedConversationId=d.id,Le(),$("Demo message scenario added.","local","Messages"),j(m("messages",{conversation:d.id},e),{replace:!0})}function vu(e,t){const a=ks(e)||Oe(e)[0];if(!a)return ia(e,"Demo chat","company",t,!0);const i=new Date().toISOString(),s=ke({id:`msg-${crypto.randomUUID()}`,conversation_id:a.id,company_id:e,sender_profile_id:"shan",body:t,created_at:i,updated_at:i});n.messages.push(s),n.messageConversations=n.messageConversations.map(o=>o.id===a.id?{...o,last_message_at:i,updated_at:i}:o),Ks(a,s,[]),Le(),$("Demo mention added.","local","Messages"),p()}function yu(){n.messageConversations=yi.map(ye),n.messageAccess=hi.map(ae),n.messages=wi.map(ke),n.messageReads=Si.map(Wt),n.messageAttachments=$i.map(xe),n.selectedConversationId="",Le(),$("Demo messages reset.","local","Messages"),p()}function hu(e){return{id:e.id,company_id:e.company_id,recipient_profile_id:e.recipient_profile_id,type:e.type,title:e.title,body:e.body,href:e.href,source_type:e.source_type,source_id:e.source_id,read_at:e.read_at||null,created_at:e.created_at}}function Xs(e=""){const t=String(e||"").split(".")[0];return{access:"Access",approval:"Approval",calendar:"Calendar",file:"Files",finance:"Finance",form:"Forms",message:"Messages",task:"Tasks"}[t]||"Inbox"}async function Be(e){const t=w(e.companyId||e.company_id||u()),a=wu(t,e.recipients,{excludeActor:e.excludeActor===!0,type:e.type,href:e.href});if(!a.length)return[];const i=new Date().toISOString(),s=a.map(o=>kt({id:`notification-${crypto.randomUUID()}`,company_id:t,recipient_profile_id:o,type:e.type||"general",title:e.title||"Notification",body:e.body||"",href:e.href||"",source_type:e.sourceType||e.source_type||"",source_id:e.sourceId||e.source_id||"",created_at:i}));if(n.session?.auth==="supabase"){const o=q();if(!o)return[];const l=await o.from("notifications").insert(s.map(hu)).select();if(l.error)return console.warn("Notification insert failed",l.error),[];const d=(l.data||[]).map(kt);return Fn(d),p(),d}return Fn(s),zi(),p(),s}function Fn(e){if(!e.length)return;const t=new Map;e.concat(n.notifications).forEach(a=>t.set(a.id,a)),n.notifications=[...t.values()].sort((a,i)=>Date.parse(i.created_at||0)-Date.parse(a.created_at||0)).slice(0,200)}function wu(e,t=[],a={}){let s=(Array.isArray(t)?t:[t]).map(o=>be(e,o)).filter(Boolean);return s.length||(s=ar(e,a.type||"","","")),s=z(s),n.session?.auth!=="supabase"&&!s.includes(b().profile.id)&&s.push(b().profile.id),a.excludeActor&&(s=s.filter(o=>o!==er())),s.filter(o=>$u(e,o)&&Su(e,o,a.type,a.href))}function be(e,t){if(!t)return"";const a=typeof t=="object"?String(t.profile_id||t.id||t.member_id||t.target_id||"").trim():String(t).trim();if(!a)return"";if(Re(a)||oe(e,a))return a;const i=b().profile;if(a===i.id||a===i.member_id||a===i.email)return i.id;const s=ie(e).find(l=>[l.profile_id,l.member_id,l.email,l.name].filter(Boolean).includes(a));if(s?.profile_id)return s.profile_id;const o=n.profiles.find(l=>l.member_id===a||l.email===a||l.full_name===a);return o?.id?o.id:n.session?.auth==="supabase"?"":a}function $u(e,t){if(!t)return!1;if(t===b().profile.id&&n.session?.auth!=="supabase")return!0;const a=oe(e,t);if(a)return a.status==="active";const i=ie(e).find(s=>s.profile_id===t||s.member_id===t);return n.session?.auth!=="supabase"?!0:i?.status==="active"}function er(){return b().profile.id||b().profile.member_id||""}function Su(e,t,a="",i=""){const s=ku(a,i);return s?tr(e,t,s):!0}function ku(e="",t=""){const a=`${e} ${t}`;return a.includes("finance")?"finance.view":a.includes("message")?"messages.view":a.includes("calendar")?"calendar.view":a.includes("file")?"files.view":a.includes("approval")?"approvals.view":a.includes("form")?"forms.view":a.includes("task")?"tasks.view":""}function tr(e,t,a){if(!a)return!0;if(t===b().profile.id)return h(a,e);const i=oe(e,t);if(n.session?.auth==="supabase"&&(!i||i.status!=="active"))return!1;const s=String(i?.role||ie(e).find(f=>f.profile_id===t)?.role||"member").toLowerCase();if(["owner","admin","developer"].includes(s))return!0;const o=Fi(a),l=n.roleAssignments.filter(f=>f.company_id===e&&f.profile_id===t).map(f=>f.role_id),d=n.rolePermissions.filter(f=>l.includes(f.role_id));if(d.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="deny"))return!1;if(d.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="allow"))return!0;const c=Ge[s]||Ge.member;return c.includes("*")||o.some(f=>c.includes(f))}function ar(e,t="",a="",i=""){const s=String(t||"").split(".")[0];return s==="finance"?ue(e,["finance.view"]):s==="message"?ue(e,["messages.view"]):s==="calendar"?Cu(i).concat(ue(e,["calendar.manage"])):s==="file"?ue(e,["files.view"]).concat(Du(e,i)):s==="form"?ue(e,["forms.view","forms.manage"]):s==="approval"?ue(e,["approvals.view","approvals.manage"]):s==="access"?ue(e,["users.manage","settings.manage"]):[er()]}function ue(e,t){return z(ie(e).filter(a=>a.status==="active").map(a=>be(e,a.profile_id||a.member_id)).filter(a=>t.some(i=>tr(e,a,i))))}function ni(e,t=!0){return e?z([e.assignee_id,t?e.creator_id:"",...Array.isArray(e.watchers)?e.watchers:[]].map(a=>be(e.company_id,a)).filter(Boolean)):[]}function Du(e,t){return t?z(n.tasks.filter(a=>a.company_id===e&&a.project_id===t).flatMap(a=>ni(a))):[]}function Cu(e){const t=n.calendarEvents.find(a=>a.id===e);return t?z([t.assigned_profile_id,t.created_by].map(a=>be(t.company_id,a)).filter(Boolean)):[]}function Dt(e){if(!e)return[];const a=Ta(e.id).flatMap(i=>i.target_type==="all_company"?ue(e.company_id,["messages.view"]):i.target_type==="profile"?[be(e.company_id,i.target_id)]:i.target_type==="role"?ie(e.company_id).filter(s=>s.status==="active"&&(s.role_id===i.target_id||wt(e.company_id,s.role)===i.target_id)).map(s=>be(e.company_id,s.profile_id||s.member_id)):[]);return z(a.filter(Boolean))}async function ju(e=u()){const t=new Date().toISOString(),a=b().profile.id,i=n.notifications.filter(s=>s.company_id===e&&s.recipient_profile_id===a&&!s.read_at).map(s=>s.id);if(i.length&&(n.notifications=n.notifications.map(s=>s.company_id===e&&s.recipient_profile_id===a&&!s.read_at?{...s,read_at:t}:s),zi(),p(),n.session?.auth==="supabase")){const s=q();s&&await s.from("notifications").update({read_at:t}).in("id",i).eq("recipient_profile_id",a)}}async function qu(e){const t=n.notifications.find(i=>i.id===e);if(!t)return;const a=new Date().toISOString();if(n.notifications=n.notifications.map(i=>i.id===t.id?{...i,read_at:i.read_at||a}:i),n.notificationMenuOpen=!1,zi(),p(),n.session?.auth==="supabase"&&!t.read_at){const i=q();i&&await i.from("notifications").update({read_at:a}).eq("id",t.id).eq("recipient_profile_id",b().profile.id)}t.href&&j(t.href)}function In(e,t=null){const a=m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),i=H(e.assignee_id);if(!t){Be({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task assigned",body:`${B()} assigned ${e.title} to ${i}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s));return}t.assignee_id!==e.assignee_id&&Be({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task reassigned",body:`${B()} reassigned ${e.title} to ${i}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s)),t.priority!==e.priority&&Be({companyId:e.company_id,recipients:ni(e),excludeActor:!0,type:"task.priority",title:"Task priority changed",body:`${B()} set priority to ${T(e.priority)} on ${e.title}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s)),t.status!==e.status&&Be({companyId:e.company_id,recipients:ni(e),excludeActor:!0,type:"task.status",title:"Task status changed",body:`${B()} moved ${e.title} to ${$e(e.status)}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s))}function J(e,t,a,i,s="",o="",l=u(),d=null){Be({companyId:l,recipients:d||ar(l,e,s,o),type:e,title:t,body:a,href:i,sourceType:s,sourceId:o}).catch(c=>console.warn("Notification event failed",c))}async function nt(e,t,a,i,s={},o=!1){const l={id:`audit-${crypto.randomUUID()}`,company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:i,details:s,created_at:new Date().toISOString()};if(n.auditEvents.unshift(l),o&&n.session?.auth==="supabase"){const d=q();if(d)try{await d.from("audit_events").insert({company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:i,details:s})}catch{}}}function Au(e,t){return t.status==="disabled"?"membership.disabled":t.status==="left"?"membership.left":e&&["disabled","left","pending"].includes(e.status)&&t.status==="active"?"membership.reactivated":e&&e.role!==t.role?"role.changed":"membership.updated"}function B(){return b().profile.full_name||b().profile.email||"Quest HQ"}function M(e,t,a=""){return`<article class="metric">${Y(xr(e),"metric-symbol")}<span>${r(e)}</span><strong>${r(t)}</strong>${a?`<small>${r(a)}</small>`:""}</article>`}function Te(e,t){return`<div><strong>${r(e)}</strong><span>${r(t)}</span></div>`}function ze(e,t,a,i,s=""){const o=`
    <span><strong>${r(e)}</strong><small>${r(t||"Finance record")}</small></span>
    <b>${r(a)}</b>
    <em>${E(i)}</em>
  `;return s?`<a class="finance-compact-row" href="${_(s)}" data-router>${o}</a>`:`<div class="finance-compact-row">${o}</div>`}function Tn(e,t){const a=_e(e);return t==="jobs"?a.filter(i=>i.job_id).length:a.filter(i=>i.folder===t).length}function ir(e="home",t=null){return t?.id?`job:${t.id}`:e||"home"}function Mu(e,t="home",a=null){const i=ir(t,a),s=ht(e).filter(o=>o.parent_key===i).map(o=>Fu(e,o));return a?s:t==="home"?bi.map(([l,d,c,f])=>({id:l,name:d,caption:c,icon:f,href:_(m("files",{folder:l},e)),countLabel:`${Tn(e,l)} file${Tn(e,l)===1?"":"s"}`,updatedLabel:""})).concat(s):t==="jobs"?Q(e).map(l=>({id:`job:${l.id}`,name:l.name,caption:l.client_name||I(e),icon:"ti-folder",href:_(m("files",{folder:"jobs",job_id:l.id},e)),countLabel:`${ca(l.id)} file${ca(l.id)===1?"":"s"}`,updatedLabel:E(l.updated_at)})).concat(s):s}function Fu(e,t){const a=ht(e).filter(o=>o.parent_key===t.id).length,i=_e(e).filter(o=>o.folder===t.id).length,s=a+i;return{id:t.id,name:t.name,caption:"Custom folder",icon:"ti-folder",href:_(m("files",{folder:t.id},e)),countLabel:`${s} item${s===1?"":"s"}`,updatedLabel:E(t.updated_at)}}function Iu(e,t,a=null){if(a)return`<span>/</span><a href="${_(m("files",{folder:"jobs"},e))}" data-router>Jobs</a>`;const i=ht(e).find(c=>c.id===t);if(!i)return`<span>/</span><strong>${r(fe(t))}</strong>`;const s=[];let o=i;const l=new Set;for(;o&&!l.has(o.id);)l.add(o.id),s.unshift(o),o=ht(e).find(c=>c.id===o.parent_key);return`${i.parent_key&&!i.parent_key.startsWith("folder-")&&i.parent_key!=="home"?`<span>/</span><a href="${_(m("files",{folder:i.parent_key},e))}" data-router>${r(fe(i.parent_key))}</a>`:""}${s.map((c,f)=>`<span>/</span>${f===s.length-1?`<strong>${r(c.name)}</strong>`:`<a href="${_(m("files",{folder:c.id},e))}" data-router>${r(c.name)}</a>`}`).join("")}`}function Tu(e=u(),t="home",a=""){const i=(n.fileQuery||n.query||"").trim().toLowerCase(),s=n.fileCategoryFilter;let o=_e(e);return a?o=o.filter(l=>l.job_id===a):t&&t!=="home"&&(t==="jobs"?o=o.filter(l=>l.job_id):o=o.filter(l=>l.folder===t)),s&&s!=="All categories"&&(o=o.filter(l=>String(l.category||fe(l.folder)).toLowerCase()===s.toLowerCase())),i&&(o=o.filter(l=>[l.file_name,l.category,l.uploaded_by_label,l.notes,l.object_path,P(l.job_id)?.name].some(d=>String(d||"").toLowerCase().includes(i)))),o.sort((l,d)=>new Date(d.created_at||0)-new Date(l.created_at||0))}function Ae(e){const t={pdf:"PDF",image:"Image",archive:"Archive",sheet:"Excel",doc:"Word",presentation:"PowerPoint",text:"Text",video:"Video",audio:"Audio",code:"Code",data:"Data",design:"Design",cad:"CAD",email:"Email"},a=Ba(e);if(t[a])return t[a];const i=Ha(e);return i?i.toUpperCase():fe(e.folder)}function Ba(e){const t=String(e.mime_type||"").toLowerCase(),a=Ha(e);return t.includes("pdf")||a==="pdf"?"pdf":t.includes("image")||["png","jpg","jpeg","gif","webp","svg","bmp","tif","tiff","heic","ico"].includes(a)?"image":t.includes("zip")||t.includes("compressed")||["zip","rar","7z","tar","gz","tgz","bz2"].includes(a)?"archive":t.includes("spreadsheet")||t.includes("excel")||["xls","xlsx","xlsm","ods","csv"].includes(a)?"sheet":t.includes("word")||["doc","docx","odt","rtf"].includes(a)?"doc":t.includes("presentation")||["ppt","pptx","pps","odp"].includes(a)?"presentation":t.includes("video")||["mp4","mov","avi","mkv","webm","wmv","m4v"].includes(a)?"video":t.includes("audio")||["mp3","wav","aac","flac","m4a","ogg"].includes(a)?"audio":["js","ts","jsx","tsx","html","css","scss","json","xml","yml","yaml","md","sql","py","rb","php","java","cs","cpp","c","go","rs","sh","ps1"].includes(a)?"code":["txt","log"].includes(a)||t.includes("text")?"text":["ai","psd","sketch","fig"].includes(a)?"design":["dwg","dxf","rvt","ifc","step","stp"].includes(a)?"cad":["eml","msg"].includes(a)?"email":["db","sqlite","bak"].includes(a)?"data":"file"}function Zi(e){return Ba(e)}function Ha(e){return String(e.file_name||"").split(".").pop()?.toLowerCase()||""}function Eu(e){return e.type==="image/png"?"png":e.type==="image/webp"?"webp":"jpg"}function Xi(e,t=!1){return e.signed_url&&Ba(e)==="image"?`<img src="${r(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${r(Zi(e))} ${t?"large":""}">${mr(e,Ae(e))}<small>${r(nr(e))}</small></span>`}function nr(e){const t=Ae(e),a=Ha(e);return t==="Image"?a&&a.length<=4?a.toUpperCase():"IMG":t==="Archive"?a&&a.length<=3?a.toUpperCase():"ZIP":t==="Excel"?a==="csv"?"CSV":"XLS":t==="Word"?"DOC":t==="PowerPoint"?"PPT":t==="Video"?"VID":t==="Audio"?"AUD":t==="Code"?a&&a.length<=4?a.toUpperCase():"CODE":t==="Design"?a&&a.length<=4?a.toUpperCase():"DES":t==="CAD"?a&&a.length<=4?a.toUpperCase():"CAD":t==="Email"?a&&a.length<=4?a.toUpperCase():"MAIL":t==="Data"?a&&a.length<=4?a.toUpperCase():"DATA":t==="Text"?a&&a.length<=4?a.toUpperCase():"TXT":t.length<=4?t.toUpperCase():(a||"FILE").slice(0,4).toUpperCase()}function he(e=u()){return n.forms.filter(t=>t.company_id===e)}function xu(e=u()){const t=n.formQuery.trim().toLowerCase(),a=n.route?.jobId||"";return he(e).filter(i=>a&&i.linked_job_id!==a||n.formTypeFilter!=="all"&&i.type!==n.formTypeFilter?!1:t?[i.title,i.description,i.type,i.status,i.audience,P(i.linked_job_id)?.name].some(s=>String(s||"").toLowerCase().includes(t)):!0)}function Ct(e=u()){const t=n.route?.jobId||"",a=he(e).filter(o=>!t||o.linked_job_id===t),i=n.route?.params?.get("form_id")||"";if(i&&a.some(o=>o.id===i)&&(n.selectedFormId=i),!a.length)return n.selectedFormId="",n.selectedQuestionId="",null;let s=a.find(o=>o.id===n.selectedFormId)||a[0];return n.selectedFormId=s.id,(!n.selectedQuestionId||!s.questions.some(o=>o.id===n.selectedQuestionId))&&(n.selectedQuestionId=s.questions[0]?.id||""),s}function Me(e){return n.forms.find(t=>t.id===e)||null}function we(){return Me(n.selectedFormId)||Ct(u())}function sr(e=u()){return n.formResponses.filter(t=>t.company_id===e)}function Wa(e){return n.formResponses.filter(t=>t.form_id===e)}function rr(e){return Array.isArray(e?.questions)?e.questions.length:0}function Ou(e){const t=String(e?.creator_id||""),a=b().profile;return t?t&&(t===a.member_id||t===a.id)?a.full_name||"Quest Basic Mode":H(t)||e?.created_by_label||"Quest HQ":e?.created_by_label||a.full_name||"Quest HQ"}function gt(e,t,a="",i=!1,s="text"){return`<label><span>${r(e)}</span><input data-form-field="${r(t)}" type="${r(s)}" value="${r(a)}" ${i?"required":""} /></label>`}function or(e,t,a=""){return`<label><span>${r(e)}</span><textarea data-form-field="${r(t)}" rows="3">${r(a)}</textarea></label>`}function Xt(e,t,a,i){return`
    <label><span>${r(e)}</span><select data-form-field="${r(t)}">
      ${i.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function jt(e){return["multiple","checkbox","dropdown"].includes(e.type)}function Ru(e){return{short:"ti-letter-t",paragraph:"ti-align-left",multiple:"ti-circle-dot",checkbox:"ti-checkbox",dropdown:"ti-select",date:"ti-calendar",rating:"ti-star",yesno:"ti-circle-check",file:"ti-paperclip"}[e]||"ti-plus"}function Pu(e){return Tt.find(([t])=>t===e)?.[1]||T(e||"Question")}function ge(e,t){return`
    <div class="response-question">
      <label>
        <span>${r(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${r(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function lr(e){const t=Me(e.form_id),a=Object.entries(e.answers||{}).map(([i,s])=>{const o=t?.questions.find(d=>d.id===i),l=Array.isArray(s)?s.join(", "):s;return Te(o?.label||i,l||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${r(t?.title||"Response")}</h2><p>${r(e.submitted_by||e.submitter_email||"Anonymous")} / ${E(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||Te("Response","No answers captured.")}</div>
  `}function _t(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[G("short","Inspection address"),G("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),G("paragraph","Recommended scope"),G("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[G("short","Client name"),G("yesno","Approved to proceed?"),G("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[G("short","Request title"),G("dropdown","Priority",["Low","Medium","High","Urgent"]),G("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[G("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),G("yesno","Weather safe?"),G("paragraph","Safety notes")]}]}function Uu(e=u()){return Qt({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:n.route?.jobId||"",theme_color:qe(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[G("short","First question")]})}function G(e="short",t="Untitled question",a=[]){return Va({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function Nu(e,t={}){if(!y("forms.manage",e,"Your role cannot create forms.","Forms"))return null;const a=Uu(e),i=Qt({...a,...t,id:t.id||`form-${crypto.randomUUID()}`,company_id:e,questions:(t.questions||a.questions).map(s=>Va(s)),created_at:t.created_at||new Date().toISOString(),updated_at:new Date().toISOString()});return n.forms.unshift(i),n.selectedFormId=i.id,n.selectedQuestionId=i.questions[0]?.id||"",n.formsTab="builder",n.formEditorTab="questions",n.modal="",n.formStartTemplateId="",n.formStartTab="blank",se("New form created"),p(),i}function Lu(e){if(!y("forms.manage",u(),"Your role cannot create forms.","Forms"))return;const t=Object.fromEntries(new FormData(e).entries()),a=t.template_id?_t().find(l=>l.id===t.template_id):null,i=String(t.title||a?.title||"Untitled form").trim()||"Untitled form",s=String(t.description||a?.description||"").trim(),o=a?a.questions.map(l=>({...pa(l),id:`q-${crypto.randomUUID()}`})):[G("short","First question")];Nu(u(),{title:i,description:s,type:It.includes(t.type)?t.type:a?.type||"Internal",audience:String(t.audience||"Internal").trim()||"Internal",creator_id:b().profile.member_id||b().profile.id||"basic-quest-user",linked_job_id:String(t.linked_job_id||""),theme_color:qe(u()),background:"clean",submit_label:String(t.submit_label||"Submit").trim()||"Submit",collect_email:t.collect_email==="on",require_approval:t.require_approval==="on",questions:o})}function ea(e,t=!0){const a=Me(e);a&&(n.selectedFormId=a.id,n.selectedQuestionId=a.questions[0]?.id||"",t&&p())}function se(e="Forms saved locally"){const t=we();t&&(t.updated_at=new Date().toISOString()),D(rt,n.forms),D(ba,n.formResponses),n.sync={label:e,mode:"live"}}function En(e,t){const a=Me(e||n.selectedFormId);a&&y("forms.manage",a.company_id,"Your role cannot update forms.","Forms")&&(a.status=_i.includes(t)?t:"Draft",n.selectedFormId=a.id,se(`${a.status} locally`),p())}function Qu(e){const t=Me(e||n.selectedFormId);if(!t||!y("forms.manage",t.company_id,"Your role cannot duplicate forms.","Forms"))return;const a=Qt({...pa(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(i=>({...pa(i),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});n.forms.unshift(a),n.selectedFormId=a.id,n.selectedQuestionId=a.questions[0]?.id||"",se("Form duplicated"),p()}function Vu(e){const t=e||n.selectedFormId;if(!t)return;const a=Me(t);a&&!y("forms.manage",a.company_id,"Your role cannot delete forms.","Forms")||(n.forms=n.forms.filter(i=>i.id!==t),n.formResponses=n.formResponses.filter(i=>i.form_id!==t),n.selectedFormId=he(u())[0]?.id||"",n.selectedQuestionId=Ct(u())?.questions[0]?.id||"",n.modal="",se("Form deleted locally"),p())}async function Yu(e){const t=e||n.selectedFormId,a=`${window.location.origin}${_(m("forms",{form_id:t},u()))}`;try{await navigator.clipboard.writeText(a),n.sync={label:"Form link copied",mode:"live"}}catch{n.sync={label:"Copy failed",mode:"local"}}p()}function Bu(e){const t=JSON.stringify({company_id:e,forms:he(e),responses:sr(e)},null,2);Xu(`${e}-forms-export.json`,t,"application/json")}function cr(e){const t=we();if(!t||!h("forms.manage",t.company_id))return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),D(rt,n.forms))}function dr(e){const t=we(),a=e.closest("[data-question-id]"),i=t?.questions.find(s=>s.id===a?.dataset.questionId);if(!(!t||!i)&&h("forms.manage",t.company_id)){if(n.selectedQuestionId=i.id,e.matches("[data-question-option]")){const s=Number(e.dataset.questionOption);i.options[s]=e.value}else{const s=e.dataset.questionField;if(s==="required")i.required=e.checked;else if(s==="type"){i.type=e.value,jt(i)&&!i.options.length&&(i.options=["Option 1","Option 2"]),jt(i)||(i.options=[]),se("Question updated"),p();return}else s&&(i[s]=e.value)}t.updated_at=new Date().toISOString(),D(rt,n.forms)}}function Hu(e="multiple"){const t=we();if(!t||!y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms"))return;const a=G(e,Tt.find(([i])=>i===e)?.[1]||"New question");t.questions.push(a),n.selectedQuestionId=a.id,se("Question added"),p()}function Wu(e){const t=we(),a=t?.questions.find(o=>o.id===e);if(!t||!a||!y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms"))return;const i=t.questions.findIndex(o=>o.id===e),s=Va({...pa(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(i+1,0,s),n.selectedQuestionId=s.id,se("Question duplicated"),p()}function zu(e){const t=we();t&&y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms")&&(t.questions=t.questions.filter(a=>a.id!==e),n.selectedQuestionId=t.questions[0]?.id||"",se("Question deleted"),p())}function Ju(e,t){const a=we();if(!a||!t||!y("forms.manage",a.company_id,"Your role cannot edit forms.","Forms"))return;const i=a.questions.findIndex(l=>l.id===e),s=i+t;if(i<0||s<0||s>=a.questions.length)return;const[o]=a.questions.splice(i,1);a.questions.splice(s,0,o),n.selectedQuestionId=e,se("Question moved"),p()}function Ku(e){const t=we(),a=t?.questions.find(i=>i.id===e);a&&y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms")&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),se("Option added"),p())}function Gu(e,t){const a=we(),i=a?.questions.find(s=>s.id===e);!i||t<0||y("forms.manage",a.company_id,"Your role cannot edit forms.","Forms")&&(i.options.splice(t,1),i.options.length||i.options.push("Option 1"),se("Option removed"),p())}function Zu(e){const t=Me(e.dataset.formId);if(!t)return;const a=new FormData(e),i={};t.questions.forEach(s=>{const o=`answer:${s.id}`,l=a.getAll(o).filter(d=>d instanceof File?d.name:String(d||"").trim());i[s.id]=l.length>1?l.map(d=>d instanceof File?d.name:d):l[0]instanceof File?l[0].name:l[0]||""}),n.formResponses.unshift(Yi({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||b().profile.full_name||"Preview submitter"),answers:i,created_at:new Date().toISOString()})),n.formsTab="responses",n.modal="",se("Preview response saved"),J(t.require_approval?"approval.form":"form.response",t.require_approval?"Form approval ready":"Form response saved",`${B()} saved a response for ${t.title}.`,m("forms",{form_id:t.id,tab:"responses"},t.company_id),"form_response",t.id,t.company_id),p()}function Xu(e,t,a="text/plain"){const i=new Blob([t],{type:a}),s=URL.createObjectURL(i),o=document.createElement("a");o.href=s,o.download=e,o.click(),URL.revokeObjectURL(s)}function pa(e){return JSON.parse(JSON.stringify(e))}function z(e){return Array.from(new Set(e.map(t=>String(t||"").trim()).filter(Boolean)))}function $e(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||T(e)}function Qe(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||T(e)}function fe(e){return bi.find(([t])=>t===e)?.[1]||n.driveFolders.find(t=>t.id===e)?.name||T(e||"Shared")}function em(e=u()){return bi.map(([t,a])=>[t,a]).concat(ht(e).map(t=>[t.id,t.name]))}function tm(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function ur(e,t="Folder"){return pr("default_folder.svg",t||"Folder")}function mr(e,t="File"){return pr(am(e),t||Ae(e))}function pr(e,t){return`<img class="asset-icon" src="${r(Sr+e)}" alt="${r(t)}" loading="lazy" draggable="false" referrerpolicy="no-referrer" />`}function am(e){const t=Ha(e),a={pdf:"file_type_pdf.svg",doc:"file_type_word.svg",docx:"file_type_word.svg",odt:"file_type_word.svg",rtf:"file_type_word.svg",xls:"file_type_excel.svg",xlsx:"file_type_excel.svg",xlsm:"file_type_excel.svg",ods:"file_type_excel.svg",csv:"file_type_excel.svg",ppt:"file_type_powerpoint.svg",pptx:"file_type_powerpoint.svg",pps:"file_type_powerpoint.svg",odp:"file_type_powerpoint.svg",zip:"file_type_zip.svg",rar:"file_type_zip.svg","7z":"file_type_zip.svg",tar:"file_type_zip.svg",gz:"file_type_zip.svg",tgz:"file_type_zip.svg",txt:"file_type_text.svg",log:"file_type_text.svg",md:"file_type_markdown.svg",json:"file_type_json.svg",html:"file_type_html.svg",htm:"file_type_html.svg",css:"file_type_css.svg",scss:"file_type_css.svg",js:"file_type_js.svg",jsx:"file_type_js.svg",ts:"file_type_js.svg",tsx:"file_type_js.svg",xml:"file_type_xml.svg",yml:"file_type_yaml.svg",yaml:"file_type_yaml.svg",svg:"file_type_svg.svg",ai:"file_type_ai.svg",psd:"file_type_photoshop.svg"};if(a[t])return a[t];const i=Ba(e);return i==="image"?"file_type_image.svg":i==="video"?"file_type_video.svg":i==="audio"?"file_type_audio.svg":i==="text"?"file_type_text.svg":i==="code"?"file_type_js.svg":i==="archive"?"file_type_zip.svg":"default_file.svg"}function T(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function k(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function E(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function fa(e){if(!e)return"No time";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(t)}function dt(e){const t=new Date(e);if(!e||Number.isNaN(t.getTime()))return"just now";const a=Math.max(0,Math.floor((Date.now()-t.getTime())/1e3));if(a<45)return"just now";const i=Math.floor(a/60);if(i<60)return`${i}m ago`;const s=Math.floor(i/60);if(s<24)return`${s}h ago`;const o=Math.floor(s/24);return o<7?`${o}d ago`:E(e)}function ta(e){const t=Math.max(0,Math.floor(R(e)/1e3)),a=Math.floor(t/3600),i=Math.floor(t%3600/60);return a?`${a}h ${String(i).padStart(2,"0")}m`:`${i}m`}function en(e){const t=R(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],i=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**i).toFixed(i?1:0)} ${a[i]}`}function qt(e){return(t,a)=>Date.parse(a[e]||a.updated_at||a.created_at||0)-Date.parse(t[e]||t.updated_at||t.created_at||0)}function fr(e){if(!e)return 0;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?0:Math.floor((ut().getTime()-t.getTime())/864e5)}function xn(e){if(!e)return 999;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?999:Math.floor((t.getTime()-ut().getTime())/864e5)}function im(e=u()){const t=(Nt(Ra(e)||{short_name:e})||e||"QH").replace(/[^a-z]/gi,"").slice(0,2).toUpperCase()||"QH",a=ve(e).length+1;return`${t}-${String(1e3+a)}`}function ut(){const e=new Date;return e.setHours(0,0,0,0),e}function nm(e,t){return`${gr(e,t)}%`}function gr(e,t){const a=R(t);return a?Math.max(0,Math.min(100,Math.round(R(e)/a*100))):0}function st(e){return{critical:5,urgent:4,high:3,medium:2,low:1}[String(e||"").toLowerCase()]||0}function zt(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function me(e,t){return e.reduce((a,i)=>a+R(i[t]),0)}function R(e){const t=Number(e);return Number.isFinite(t)?t:0}function At(e){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(e||""))}function ga(e){const t=String(e||"").trim();return At(t)||/^[0-9a-f]{8,}$/i.test(t)||/^user[_-]?[0-9a-f-]{8,}$/i.test(t)}function br(e){const t=String(e||"").trim();return t?t.slice(0,8):""}function C(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(R(e))}function Se(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function A(e,t){const a=Se(e,t);return Array.isArray(a)&&a.length?a:t}function D(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
