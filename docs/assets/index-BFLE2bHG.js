(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const mr="/quest-hq-command-center/assets/quest-secure-workspace-cockpit-tight-CMTSEVW0.png",We={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://lpzotcznihwyyudxycmd.supabase.co",supabaseKey:"sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07"},Be=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),Je="quest-hq-local-session",Mi="quest-hq-local-profile",en="quest-hq-job-cache-v2",tn="quest-hq-task-cache-v1",an="quest-hq-file-cache-v1",nn="quest-hq-drive-folder-cache-v1",sn="quest-hq-team-cache-v1",rn="quest-hq-company-membership-cache-v1",it="quest-hq-company-form-cache-v1",pa="quest-hq-company-form-response-cache-v1",on="quest-hq-finance-invoice-cache-v1",ln="quest-hq-finance-payment-cache-v1",cn="quest-hq-finance-expense-cache-v1",dn="quest-hq-finance-vendor-cache-v1",fa="quest-hq-time-entry-cache-v1",ga="quest-hq-active-timer-v1",De="quest-hq-active-company",un="quest-hq-pending-workspace-review-v1",Ii="quest-hq-task-view",Fi="quest-hq-drive-view",Ei="quest-hq-sidebar-collapsed",ba="quest-hq-notification-cache-v1",_a="quest-hq-message-conversation-cache-v1",va="quest-hq-message-access-cache-v1",ya="quest-hq-message-cache-v1",ha="quest-hq-message-read-cache-v1",wa="quest-hq-message-attachment-cache-v1",$a="quest-hq-calendar-event-cache-v1",Ke={developer:["*"],admin:["*"],owner:["*"],manager:["jobs.view","jobs.manage","tasks.view","tasks.manage","files.view","files.manage","forms.view","forms.manage","finance.view","team.view","clock.manage","approvals.manage","approvals.view","calendar.view","calendar.manage","calendar.view_team","users.view","settings.view","billing.view","roles.view","messages.view","messages.send","messages.create_group","messages.manage_groups","messages.attach_files"],member:["jobs.view","tasks.view","tasks.manage","files.view","forms.view","time.track","approvals.view","calendar.view","users.view","messages.view","messages.send","messages.attach_files"]},Ti=[["jobs.view","View jobs"],["jobs.manage","Create/edit jobs"],["tasks.view","View tasks"],["tasks.manage","Create/edit tasks"],["files.view","View files"],["files.manage","Upload/delete files"],["forms.view","View forms"],["forms.manage","Create/edit forms"],["crm.view","View CRM"],["finance.view","View finance"],["finance.manage","Create/edit finance"],["users.view","View users"],["users.manage","Invite/manage users"],["roles.view","View roles"],["roles.manage","Create/edit roles"],["billing.view","View billing"],["billing.manage","Manage subscription"],["settings.view","View settings"],["settings.manage","Manage settings"],["time.track","Track own time"],["clock.manage","Manage clock dashboard"],["approvals.view","View approvals"],["approvals.manage","Manage approvals"],["calendar.view","View calendar"],["calendar.manage","Create/edit calendar events"],["calendar.view_team","View team calendar"],["messages.view","View messages"],["messages.send","Send messages"],["messages.create_group","Create group chats"],["messages.manage_groups","Manage group chats"],["messages.attach_files","Attach files/images"],["messages.delete_own","Delete own messages"],["messages.delete_any","Delete any messages"],["messages.manage","Manage messages (compatibility)"]],pr={"messages.manage":["messages.manage_groups"],"messages.manage_groups":["messages.manage"]},st=[{id:"home",group:"Workspace",label:"Home",icon:"ti-home",symbol:"q-logo",status:"live",permission:""},{id:"jobs",group:"Workspace",label:"Jobs",icon:"ti-briefcase",symbol:"q-symbol-jobs",status:"live",permission:"jobs.view"},{id:"tasks",group:"Workspace",label:"Tasks",icon:"ti-list-check",symbol:"q-symbol-tasks",status:"live",permission:"tasks.view"},{id:"files",group:"Workspace",label:"Files",icon:"ti-folder",symbol:"q-symbol-files",status:"live",permission:"files.view"},{id:"forms",group:"Workspace",label:"Forms",icon:"ti-clipboard-list",symbol:"q-symbol-forms",status:"live",permission:"forms.view"},{id:"analytics",group:"Workspace",label:"Analytics",icon:"ti-chart-bar",symbol:"q-symbol-analytics",status:"live",permission:"jobs.view"},{id:"crm",group:"Workspace",label:"CRM",icon:"ti-users-group",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"tickets",group:"Workspace",label:"Tickets",icon:"ti-ticket",symbol:"q-symbol-tickets",status:"planned"},{id:"finance",group:"Workspace",label:"Finance",icon:"ti-receipt-dollar",symbol:"q-symbol-finance",status:"live",permission:"finance.view"},{id:"knowledge",group:"Workspace",label:"Knowledge Base",icon:"ti-books",symbol:"q-symbol-knowledge",status:"planned"},{id:"automations",group:"Workspace",label:"Automations",icon:"ti-automation",symbol:"q-symbol-automations",status:"planned"},{id:"templates",group:"Workspace",label:"Templates",icon:"ti-template",symbol:"q-symbol-templates",status:"planned"},{id:"users",group:"Company",label:"Users",icon:"ti-users",symbol:"q-symbol-users",status:"live",permission:"users.view"},{id:"messages",group:"Company",label:"Messages",icon:"ti-messages",symbol:"q-symbol-messages",status:"live",permission:"messages.view"},{id:"settings",group:"Company",label:"Settings",icon:"ti-settings",symbol:"q-symbol-settings",status:"live",permission:"settings.view"},{id:"team-chart",group:"Company",label:"Team chart",icon:"ti-hierarchy-3",symbol:"q-symbol-team-chart",status:"live",permission:"team.view"},{id:"time",group:"Operations",label:"My time",icon:"ti-clock",symbol:"q-symbol-time",status:"live",permission:"time.track"},{id:"calendar",group:"Operations",label:"Calendar",icon:"ti-calendar",symbol:"q-symbol-calendar",status:"live",permission:"calendar.view"},{id:"approvals",group:"Operations",label:"Approvals",icon:"ti-user-check",symbol:"q-symbol-approvals",status:"live",permission:"approvals.view"},{id:"team-workload",group:"Operations",label:"Team workload",icon:"ti-users",symbol:"q-symbol-team-workload",status:"planned"},{id:"clock",group:"Operations",label:"Clock dashboard",icon:"ti-clock-hour-4",symbol:"q-symbol-clock",status:"live",permission:"clock.manage"}],fr=[{label:"Command",ids:["home","messages","calendar"]},{label:"Work",ids:["jobs","tasks","files","forms","crm"]},{label:"Money",ids:["finance","analytics"]},{label:"People",ids:["users","team-chart","time","approvals","clock"]},{label:"Control",ids:["settings"]},{label:"Future",ids:["tickets","knowledge","automations","templates","team-workload"]}],gr={"/admin.html":"settings","/automations.html":"automations","/calendar.html":"calendar","/crm.html":"crm","/dashboards.html":"analytics","/files.html":"files","/finance.html":"finance","/forms.html":"forms","/jobs.html":"jobs","/knowledge.html":"knowledge","/messages.html":"messages","/templates.html":"templates","/tickets.html":"tickets"},Dt=["Lead","Site Review","Estimate","Approved","Active","Closed"],xi=["pipeline","list","profile"],Ct=["todo","pending","hold","review","done"],ea=["critical","urgent","high","medium","low"],Oi=["lead","bid","admin","invoicing","ar","meeting","web_dev"],Sa=["Company event","Job visit / inspection","Estimate appointment","Install / field work","Internal meeting","Personal reminder"],br=["Task due","Invoice due","Approval","Time"].concat(Sa),_r="https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons@master/icons/",vr=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],mn=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],jt=["Inspection","Client approval","Intake","Survey","Safety","Internal"],pn=["Draft","Published","Archived"],Ri=["Draft","Sent","Partially paid","Paid","Overdue","Void"],Pi=["Pending","Approved","Paid","Rejected"],Ui=["Active","On hold","Inactive"],Ni=["ACH","Check","Card","Cash","Wire","Other"],ka=["Materials","Labor","Subcontractor","Permit","Equipment","Marketing","Software","Travel","Other"],fn=["company","role","custom","direct"],qt=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],At=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],Li=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],Qi=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"],supervisor_id:""},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"],supervisor_id:"abraham"},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"],supervisor_id:"maya"},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"],supervisor_id:"abraham"},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"],supervisor_id:""}],Vi=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],Yi=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:k(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:k(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:k(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:k(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:k(5),priority:"medium",urgency:"medium",status:"todo"}],Bi=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],Hi=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",creator_id:"abraham",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",creator_id:"maya",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",creator_id:"noah",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",creator_id:"lumen-ops",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],zi=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],Wi=[{id:"vendor-roofing-materials",company_id:"roofing",name:"Valley Roofing Supply",contact_name:"Elena Ortiz",email:"orders@valleyroofingsupply.local",phone:"(480) 555-0190",category:"Materials",status:"Active",notes:"Primary tile, flashing, and underlayment vendor.",created_at:new Date(Date.now()-12096e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"vendor-roofing-dryin",company_id:"roofing",name:"Monsoon Dry-In Crew",contact_name:"R. Alvarez",email:"dispatch@monsoondryin.local",phone:"(602) 555-0144",category:"Subcontractor",status:"Active",notes:"Emergency dry-in support during storm calls.",created_at:new Date(Date.now()-10368e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"vendor-drafting-permits",company_id:"drafting",name:"Permit Runner AZ",contact_name:"Sofia Chen",email:"permits@runneraz.local",phone:"(602) 555-0171",category:"Permit",status:"Active",notes:"Permit filing support for drafting packets.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString()},{id:"vendor-lumen-software",company_id:"lumen",name:"Lumen SaaS Stack",contact_name:"Ops Billing",email:"billing@lumenstack.local",phone:"",category:"Software",status:"Active",notes:"Internal software subscriptions for client onboarding.",created_at:new Date(Date.now()-7776e5).toISOString(),updated_at:new Date(Date.now()-3456e5).toISOString()}],Ji=[{id:"invoice-roofing-queen-creek",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",client_name:"Rosales Residence",invoice_number:"QR-1007",status:"Partially paid",issue_date:k(-10),due_date:k(5),subtotal:6800,tax:0,total:6800,notes:"Emergency leak repair billing with deposit received.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"invoice-roofing-mesa-storage",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",client_name:"Mesa Storage Partners",invoice_number:"QR-1008",status:"Sent",issue_date:k(-18),due_date:k(-2),subtotal:18400,tax:0,total:18400,notes:"Estimate packet sent to board for approval.",created_at:new Date(Date.now()-15552e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-drafting-horizon",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",client_name:"Horizon HVAC",invoice_number:"QD-2031",status:"Sent",issue_date:k(-7),due_date:k(14),subtotal:4200,tax:0,total:4200,notes:"Drafting permit package milestone invoice.",created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-lumen-onboarding",company_id:"lumen",job_id:"",client_name:"Lumen Internal Launch",invoice_number:"LM-3004",status:"Draft",issue_date:k(-3),due_date:k(27),subtotal:3200,tax:0,total:3200,notes:"Demo onboarding package used for finance workspace.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()}],Ki=[{id:"payment-roofing-queen-creek-deposit",company_id:"roofing",invoice_id:"invoice-roofing-queen-creek",amount:2500,method:"ACH",received_at:k(-4),reference:"ACH-4421",notes:"Deposit received after dry-in visit.",created_at:new Date(Date.now()-3456e5).toISOString()},{id:"payment-drafting-horizon-retainer",company_id:"drafting",invoice_id:"invoice-drafting-horizon",amount:1e3,method:"Check",received_at:k(-1),reference:"CHK-117",notes:"Retainer collected before permit packet completion.",created_at:new Date(Date.now()-864e5).toISOString()}],Gi=[{id:"expense-roofing-queen-creek-materials",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",vendor_id:"vendor-roofing-materials",category:"Materials",amount:1850,status:"Approved",spent_at:k(-6),notes:"Underlayment, flashing, and tile replacement materials.",created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-roofing-mesa-permit",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",vendor_id:"vendor-roofing-materials",category:"Permit",amount:620,status:"Pending",spent_at:k(-2),notes:"Permit and document prep allowance.",created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString()},{id:"expense-drafting-horizon-runner",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",vendor_id:"vendor-drafting-permits",category:"Permit",amount:480,status:"Approved",spent_at:k(-3),notes:"Permit runner package review.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-lumen-software-stack",company_id:"lumen",job_id:"",vendor_id:"vendor-lumen-software",category:"Software",amount:540,status:"Paid",spent_at:k(-5),notes:"Client onboarding software stack.",created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()}],Zi=[{id:"notification-roofing-task-assigned",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.assigned",title:"Task assigned",body:"Abraham assigned Leak inspection photos to you.",href:"/company/roofing/tasks?job_id=roofing-leak&task_id=task-roofing-leak-1",source_type:"task",source_id:"task-roofing-leak-1",read_at:"",created_at:new Date(Date.now()-7*6e4).toISOString()},{id:"notification-roofing-task-priority",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.priority",title:"Task priority changed",body:"Shan set priority to Urgent on HOA board approval package.",href:"/company/roofing/tasks?job_id=roofing-mesa&task_id=task-roofing-mesa-1",source_type:"task",source_id:"task-roofing-mesa-1",read_at:"",created_at:new Date(Date.now()-19*6e4).toISOString()},{id:"notification-roofing-approval",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"approval.ready",title:"Approval needs review",body:"Estimate approval is waiting in the company review queue.",href:"/company/roofing/approvals",source_type:"form",source_id:"form-roofing-estimate-approval",read_at:new Date(Date.now()-5*6e4).toISOString(),created_at:new Date(Date.now()-44*6e4).toISOString()},{id:"notification-drafting-task-review",company_id:"drafting",recipient_profile_id:"basic-quest-user",type:"task.status",title:"Task moved to review",body:"Drawing package QA is ready for review.",href:"/company/drafting/tasks?job_id=drafting-package&task_id=task-drafting-package-1",source_type:"task",source_id:"task-drafting-package-1",read_at:"",created_at:new Date(Date.now()-63*6e4).toISOString()},{id:"notification-lumen-finance",company_id:"lumen",recipient_profile_id:"basic-quest-user",type:"finance.invoice",title:"Invoice drafted",body:"Lumen onboarding invoice is ready for payment tracking.",href:"/company/lumen/finance?invoice=invoice-lumen-onboarding",source_type:"invoice",source_id:"invoice-lumen-onboarding",read_at:"",created_at:new Date(Date.now()-92*6e4).toISOString()}],gn=[{id:"msg-conv-roofing-all",company_id:"roofing",title:"Roofing dispatch",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-16*6e4).toISOString(),created_at:new Date(Date.now()-864e5).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-conv-roofing-crew",company_id:"roofing",title:"Roofing crew",type:"role",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-52*6e4).toISOString(),created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-conv-roofing-direct-shan",company_id:"roofing",title:"Shan Kumar",type:"direct",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-8*6e4).toISOString(),created_at:new Date(Date.now()-36e5).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-conv-drafting-all",company_id:"drafting",title:"Drafting review",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-74*6e4).toISOString(),created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-conv-lumen-product",company_id:"lumen",title:"Lumen launch room",type:"custom",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-38*6e4).toISOString(),created_at:new Date(Date.now()-216e5).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],bn=[{id:"msg-access-roofing-all",conversation_id:"msg-conv-roofing-all",company_id:"roofing",target_type:"all_company",target_id:"all"},{id:"msg-access-roofing-crew-role",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",target_type:"role",target_id:"staff-roofing"},{id:"msg-access-roofing-direct-basic",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-roofing-direct-shan",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"shan"},{id:"msg-access-drafting-all",conversation_id:"msg-conv-drafting-all",company_id:"drafting",target_type:"all_company",target_id:"all"},{id:"msg-access-lumen-basic",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-lumen-role",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"role",target_id:"admin-lumen"}],_n=[{id:"msg-roofing-all-1",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"abraham",body:"Morning check: Mesa HOA estimate needs photos before noon.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-48*6e4).toISOString(),updated_at:new Date(Date.now()-48*6e4).toISOString()},{id:"msg-roofing-all-2",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"basic-quest-user",body:"Got it. I am linking the job files now.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-16*6e4).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-roofing-crew-1",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",sender_profile_id:"shan",body:"@Joshua bring the permit packet when you head to Arroyo.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-52*6e4).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-roofing-direct-1",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",sender_profile_id:"shan",body:"Can you confirm the roof access photo uploaded correctly?",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-8*6e4).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-drafting-all-1",conversation_id:"msg-conv-drafting-all",company_id:"drafting",sender_profile_id:"abraham",body:"Horizon package QA is ready. Please keep notes in this thread.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-74*6e4).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-lumen-product-1",conversation_id:"msg-conv-lumen-product",company_id:"lumen",sender_profile_id:"basic-quest-user",body:"Finance and CRM are live enough for internal walkthrough. Next focus is polish and permissions.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-38*6e4).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],vn=[{id:"msg-attachment-roofing-photo",conversation_id:"msg-conv-roofing-crew",message_id:"msg-roofing-crew-1",company_id:"roofing",bucket_id:"quest-message-attachments",object_path:"",file_name:"roof-access-photo.jpg",mime_type:"image/jpeg",size_bytes:184e3,preview_url:"",created_at:new Date(Date.now()-52*6e4).toISOString()}],yn=[{conversation_id:"msg-conv-roofing-all",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:new Date(Date.now()-10*6e4).toISOString()},{conversation_id:"msg-conv-roofing-crew",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-drafting-all",company_id:"drafting",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-lumen-product",company_id:"lumen",profile_id:"basic-quest-user",last_read_at:""}],Xi=[{id:"calendar-roofing-install",company_id:"roofing",title:"East ridge install window",description:"Crew visit for install prep and materials check.",event_type:"Install / field work",starts_at:`${k(1)}T14:00:00.000Z`,ends_at:`${k(1)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"job",linked_id:"job-east-ridge",assigned_profile_id:"abraham",created_by:"basic-quest-user"},{id:"calendar-roofing-estimate",company_id:"roofing",title:"Garage roof estimate",description:"Client walkthrough and estimate appointment.",event_type:"Estimate appointment",starts_at:`${k(3)}T16:00:00.000Z`,ends_at:`${k(3)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"shan",created_by:"basic-quest-user"},{id:"calendar-drafting-review",company_id:"drafting",title:"Plan review block",description:"Drafting team review for active plan updates.",event_type:"Internal meeting",starts_at:`${k(2)}T15:00:00.000Z`,ends_at:`${k(2)}T15:45:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"",created_by:"basic-quest-user"},{id:"calendar-lumen-product",company_id:"lumen",title:"Quest HQ product review",description:"Review workspace permissions, messages, and calendar flow.",event_type:"Company event",starts_at:`${k(4)}T18:00:00.000Z`,ends_at:`${k(4)}T19:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"basic-quest-user",created_by:"basic-quest-user"}],i={route:null,session:$e(Je,null),profileDraft:$e(Mi,null),authReady:!1,authMode:"signin",jobs:A(en,Li).map(Xe),tasks:A(tn,Yi).map(et),files:A(an,Bi).map(vt),driveFolders:A(nn,[]).map(Un),forms:A(it,Hi).map(Pt),formResponses:A(pa,zi).map(Nn),financeInvoices:A(on,Ji).map(Ut),financePayments:A(ln,Ki).map(Nt),financeExpenses:A(cn,Gi).map(Lt),financeVendors:A(dn,Wi).map(Qt),notifications:A(ba,Zi).map(ht),messageConversations:A(_a,gn).map(ve),messageAccess:A(va,bn).map(ee),messages:A(ya,_n).map(Se),messageReads:A(ha,yn).map(Vt),messageAttachments:A(wa,vn).map(Te),calendarEvents:A($a,Xi).map(tt),timeEntries:$e(fa,[]),activeTimer:$e(ga,null),teamMembers:A(sn,Qi).map(Ln),memberships:A(rn,Vi),profiles:[],subscriptions:[],workspaceReviews:[],roles:[],rolePermissions:[],roleAssignments:[],resourceAcl:[],fieldPermissions:[],companyInvites:[],joinRequests:[],auditEvents:[],companies:Pn(At.map(Ze)),activeCompanyId:localStorage.getItem(De)||"",sidebarCollapsed:localStorage.getItem(Ei)==="true",selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",selectedFinanceInvoiceId:"",selectedFinanceExpenseId:"",selectedFinanceVendorId:"",selectedCalendarEventId:"",inviteLookup:null,expandedFormIds:new Set,formStartTemplateId:"",formStartTab:"blank",query:"",fileQuery:"",formQuery:"",crmQuery:"",stageFilter:"all",crmStageFilter:"all",crmOwnerFilter:"all",messageQuery:"",messageFilter:"all",selectedConversationId:"",messageRealtimeChannel:null,messageRealtimeKey:"",calendarScope:"company",calendarView:"week",calendarQuery:"",calendarTypeFilter:"all",calendarCursorDate:k(0),taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(Ii)||"table",driveFolder:"home",driveView:localStorage.getItem(Fi)||"list",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",authMessage:"",toast:null,toastTimer:null,modal:"",accountMenuOpen:!1,notificationMenuOpen:!1,rolePreview:null},Da=document.getElementById("app");let Ya=null;yr();function yr(){Rc(),window.addEventListener("popstate",p),document.addEventListener("click",Nl),document.addEventListener("submit",Vl),document.addEventListener("input",_c),document.addEventListener("change",vc),hr(),p()}async function hr(){if(i.session?.auth==="local-basic"){es(),i.authReady=!0;return}const e=q();if(!e?.auth){i.authReady=!0,i.loginError="Supabase auth is unavailable in this browser session.";return}try{const{data:t}=await e.auth.getSession();await pt(t?.session||null),e.auth.onAuthStateChange((a,n)=>{pt(n||null).finally(()=>{i.dataLoaded=!1,p()})})}catch(t){i.loginError=t.message||"Unable to initialize Supabase auth."}finally{i.authReady=!0,p()}}async function pt(e){if(!e?.user){i.session=null,localStorage.removeItem(Je);return}const t=await wr(e.user);i.session=zd(e,t),jr(),D(Je,i.session)}async function wr(e){const t={id:e.id,email:e.email||"",full_name:e.user_metadata?.full_name||e.email||"Quest user",role:"member",role_label:"Member",member_id:"",company_ids:[],avatar_url:"",approved:!1,email_verified:!!e.email_confirmed_at},a=q();if(!a)return t;const n=await a.from("profiles").select("*").eq("id",e.id).maybeSingle();return n.error||!n.data?t:yt(n.data,t)}function p(){if(i.route=Mt(),!i.authReady){kr();return}if(i.route.name==="home"){pi(!1);return}if(i.route.name==="login"){pi(!0);return}if(Sr(i.route)){j("/login?return_url="+encodeURIComponent(Uc()),{replace:!0});return}if(Dr(),i.session?.auth==="supabase"&&i.dataLoaded&&!Ue().length){$r();return}const e=Pc(i.route);if(e){j(e,{replace:!0});return}Yc(i.route),bs(i.route),i.route.params.get("account")==="profile"&&(i.modal="profile"),document.title=`${Nc(i.route)} | ${T(u())} | Quest HQ`,Da.innerHTML=Mr(i.route,ns(i.route))}function $r(){document.title="Company access pending | Quest HQ",Da.innerHTML=`
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
  `}function Sr(e){return e.name==="login"||e.name==="home"?!1:!i.session}function kr(){document.title="Loading | Quest HQ",Da.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${v("Checking secure session...")}
      </section>
    </main>
  `}function Dr(){i.dataLoaded||i.dataLoading||(i.dataLoading=!0,Cr().catch(()=>{i.sync={label:"Local fallback",mode:"local"}}).finally(()=>{i.dataLoaded=!0,i.dataLoading=!1,Z(),p()}))}async function Cr(){if(i.session?.auth==="local-basic"){i.sync={label:"Demo mode",mode:"local"};return}const e=q();if(!e){i.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,n,s,o,l,c,d,f,g,S,V,E,ne,Me,N,Kn,Gn,Zn,Xn,ei,ti,ai,ni,ii,si,ri]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*"),e.from("profiles").select("*"),e.from("company_subscriptions").select("*"),e.from("roles").select("*").order("priority",{ascending:!1}),e.from("role_permissions").select("*"),e.from("user_role_assignments").select("*"),e.from("resource_acl").select("*"),e.from("field_permissions").select("*"),e.from("company_invites").select("*").order("created_at",{ascending:!1}),e.from("company_join_requests").select("*").order("created_at",{ascending:!1}),e.from("audit_events").select("*").order("created_at",{ascending:!1}).limit(100),e.from("message_conversations").select("*").order("last_message_at",{ascending:!1}),e.from("message_conversation_access").select("*"),e.from("messages").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_attachments").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_reads").select("*"),e.from("calendar_events").select("*").order("starts_at",{ascending:!0}),e.from("notifications").select("*").order("created_at",{ascending:!1}).limit(200),e.from("finance_invoices").select("*").order("updated_at",{ascending:!1}),e.from("finance_payments").select("*").order("received_at",{ascending:!1}),e.from("finance_expenses").select("*").order("spent_at",{ascending:!1}),e.from("finance_vendors").select("*").order("name",{ascending:!0})]);let le=0;if(t.error||(i.companies=(t.data||[]).map(Ze),le+=1),a.error||(i.jobs=(a.data||[]).map(Xe),le+=1),n.error||(i.tasks=(n.data||[]).map(et),le+=1),s.error||(i.files=(s.data||[]).map(vt),le+=1),o.error||(i.teamMembers=(o.data||[]).map(Ln),le+=1),l.error||(i.memberships=(l.data||[]).map(ra),le+=1),c.error||(i.profiles=(c.data||[]).map(Ht=>yt(Ht)),le+=1),d.error||(i.subscriptions=(d.data||[]).map(oa),le+=1),f.error||(i.roles=(f.data||[]).map(He),le+=1),g.error||(i.rolePermissions=(g.data||[]).map(Ga)),S.error||(i.roleAssignments=(S.data||[]).map(Ps)),V.error||(i.resourceAcl=(V.data||[]).map(Id)),E.error||(i.fieldPermissions=(E.data||[]).map(Fd)),ne.error||(i.companyInvites=(ne.data||[]).map(la)),Me.error||(i.joinRequests=(Me.data||[]).map(Us)),N.error||(i.auditEvents=N.data||[]),Kn.error||(i.messageConversations=(Kn.data||[]).map(ve)),Gn.error||(i.messageAccess=(Gn.data||[]).map(ee)),Zn.error||(i.messages=(Zn.data||[]).map(Se)),Xn.error||(i.messageAttachments=(Xn.data||[]).map(Te)),ei.error||(i.messageReads=(ei.data||[]).map(Vt)),ti.error||(i.calendarEvents=(ti.data||[]).map(tt)),ai.error||(i.notifications=(ai.data||[]).map(ht)),ni.error||(i.financeInvoices=(ni.data||[]).map(Ut),le+=1),ii.error||(i.financePayments=(ii.data||[]).map(Nt)),si.error||(i.financeExpenses=(si.data||[]).map(Lt)),ri.error||(i.financeVendors=(ri.data||[]).map(Qt)),Rn()){const Ht=await e.rpc("list_workspace_reviews").catch(Va=>({error:Va}));if(!Ht.error){i.workspaceReviews=(Ht.data||[]).map(ut);const Va=i.workspaceReviews.map(re=>Ze({id:re.company_id,name:re.company_name,short_name:re.company_name})),ur=i.workspaceReviews.map(re=>oa({company_id:re.company_id,status:re.status,plan_code:re.plan_code,amount_cents:re.amount_cents,currency:re.currency,trial_ends_at:re.trial_ends_at,current_period_end:re.current_period_end,grace_ends_at:re.grace_ends_at}));i.companies=Pn(i.companies.concat(Va)),i.subscriptions=Rs(i.subscriptions.concat(ur))}}i.sync=le?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function q(){return!window.supabase||typeof window.supabase.createClient!="function"?null:(Ya||(Ya=window.supabase.createClient(We.supabaseUrl,We.supabaseKey)),Ya)}function jr(){i.jobs=[],i.tasks=[],i.files=[],i.driveFolders=[],i.forms=[],i.formResponses=[],i.financeInvoices=[],i.financePayments=[],i.financeExpenses=[],i.financeVendors=[],i.notifications=[],i.messageConversations=[],i.messageAccess=[],i.messages=[],i.messageReads=[],i.messageAttachments=[],i.calendarEvents=[],i.timeEntries=[],i.activeTimer=null,i.teamMembers=[],i.memberships=[],i.profiles=[],i.subscriptions=[],i.workspaceReviews=[],i.roles=[],i.rolePermissions=[],i.roleAssignments=[],i.resourceAcl=[],i.fieldPermissions=[],i.companyInvites=[],i.joinRequests=[],i.auditEvents=[],i.companies=[],i.sync={label:"Loading secure workspace...",mode:"loading"}}function es(){i.jobs=A(en,Li).map(Xe),i.tasks=A(tn,Yi).map(et),i.files=A(an,Bi).map(vt),i.driveFolders=A(nn,[]).map(Un),i.forms=A(it,Hi).map(Pt),i.formResponses=A(pa,zi).map(Nn),i.financeInvoices=A(on,Ji).map(Ut),i.financePayments=A(ln,Ki).map(Nt),i.financeExpenses=A(cn,Gi).map(Lt),i.financeVendors=A(dn,Wi).map(Qt),i.notifications=A(ba,Zi).map(ht),i.messageConversations=A(_a,gn).map(ve),i.messageAccess=A(va,bn).map(ee),i.messages=A(ya,_n).map(Se),i.messageReads=A(ha,yn).map(Vt),i.messageAttachments=A(wa,vn).map(Te),i.calendarEvents=A($a,Xi).map(tt),i.timeEntries=$e(fa,[]),i.activeTimer=$e(ga,null),i.teamMembers=A(sn,Qi).map(Ln),i.memberships=A(rn,Vi),i.profiles=[],i.subscriptions=[],i.workspaceReviews=[],i.roles=[],i.rolePermissions=[],i.roleAssignments=[],i.resourceAcl=[],i.fieldPermissions=[],i.companyInvites=[],i.joinRequests=[],i.auditEvents=[],i.companies=Pn(At.map(Ze)),i.sync={label:"Demo mode",mode:"local"}}function qr(){return`
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
  `}function z(e,t="symbol-icon"){return`<svg class="${r(t)}" aria-hidden="true" focusable="false"><use href="#${r(e)}"></use></svg>`}function ts(e=i.route?.section||"jobs"){return st.find(t=>t.id===e)?.symbol||"q-empty"}function Ar(e){const t=String(e||"").toLowerCase();return t.includes("job")||t.includes("pipeline")?"q-symbol-jobs":t.includes("task")||t.includes("review")?"q-symbol-tasks":t.includes("file")?"q-symbol-files":t.includes("form")?"q-symbol-forms":t.includes("account")||t.includes("customer")||t.includes("member")||t.includes("user")||t.includes("lead")?"q-symbol-crm":t.includes("invoice")||t.includes("collected")||t.includes("expense")||t.includes("net")||t.includes("outstanding")?"q-symbol-finance":t.includes("time")||t.includes("today")||t.includes("days")||t.includes("timer")||t.includes("entries")?"q-symbol-clock":t.includes("approval")||t.includes("access")?"q-symbol-approvals":ts()}function Mr(e,t){const a=b(),n=u(),s=Jd(a);return`
    <div class="quest-app ${i.sidebarCollapsed?"sidebar-collapsed":""}" data-route="${r(e.name)}">
      ${qr()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${_(m("jobs",{},n))}" data-router aria-label="Quest HQ workspace">
            ${z("q-logo","brand-symbol")}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${r(We.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${z("q-company")}
            <select data-company-switch aria-label="Active company">
              ${Tn().map(o=>`<option value="${r(o.id)}" ${o.id===n?"selected":""}>${r(xt(o))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            ${z("q-search")}
            <input data-global-search value="${r(i.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${r(i.sync.mode)}" data-sync-state>${r(i.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          ${Ir(n)}
          <div class="account-menu ${i.accountMenuOpen?"open":""}">
            <button class="avatar-button" type="button" data-action="toggle-account-menu" aria-label="Open account menu" aria-expanded="${i.accountMenuOpen?"true":"false"}">
              ${te(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${r(a.profile.full_name)}</strong>
              <span>${r(a.profile.role_label)} - ${r(T(n))}</span>
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
      ${Er(n)}
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${Tr(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
    </div>
    ${Ml(e,a)}
    ${ms()}
  `}function Ir(e){const t=_s(e),a=t.filter(n=>!n.read_at).length;return`
    <div class="notification-center ${i.notificationMenuOpen?"open":""}">
      <button class="icon-button notification-button" type="button" data-action="toggle-notifications" aria-label="Open notifications" aria-expanded="${i.notificationMenuOpen?"true":"false"}">
        <i class="ti ti-bell"></i>
        ${a?`<b>${r(String(Math.min(a,99)))}</b>`:""}
      </button>
      <div class="notification-popover" role="dialog" aria-label="Notifications">
        <div class="notification-head">
          <div><strong>Inbox</strong><span>${r(T(e))}</span></div>
          <button type="button" data-action="mark-all-notifications-read" ${a?"":"disabled"}>Mark all read</button>
        </div>
        <div class="notification-list">
          ${t.slice(0,12).map(n=>Fr(n)).join("")||v("No notifications yet.")}
        </div>
      </div>
    </div>
  `}function Fr(e){return`
    <button class="notification-item ${e.read_at?"read":"unread"}" type="button" data-action="open-notification" data-notification-id="${r(e.id)}">
      <span></span>
      <div>
        <small>${r(zs(e.type))} - ${r(e.title)} - ${r(lt(e.created_at))}</small>
        <strong>${r(e.body)}</strong>
      </div>
    </button>
  `}function Er(e){const t=Fa(e);return t?`
    <div class="role-preview-banner" style="--role-color:${r(t.color)}">
      <span></span>
      <div>
        <strong>Viewing as ${r(t.name)}</strong>
        <small>Permission preview only. Your real account has not changed.</small>
      </div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
  `:""}function Tr(e){const t=u(),a=b(),n=new Map(st.map(s=>[s.id,s]));return`
    <div class="deck-brand">
      <a class="logo" href="${_(m("home",{},t))}" data-router aria-label="Quest HQ home">
        ${z("q-logo","brand-symbol")}
      </a>
      <span><strong>Quest HQ</strong><small>Command Center</small></span>
      <button class="deck-toggle" type="button" data-action="toggle-sidebar" aria-label="${i.sidebarCollapsed?"Expand navigation":"Collapse navigation"}" aria-expanded="${i.sidebarCollapsed?"false":"true"}">
        <i class="ti ${i.sidebarCollapsed?"ti-layout-sidebar-right-expand":"ti-layout-sidebar-left-collapse"}"></i>
      </button>
    </div>
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${r(je(t))}">${z("q-company")}</span>
      <div>
        <strong>${r(T(t))}</strong>
        <small>${r(Ge(t))} workspace</small>
      </div>
    </div>
    <div class="deck-scroll">
      ${fr.map(s=>{const o=s.ids.map(l=>n.get(l)).filter(l=>l&&as(l,t)).map(l=>l.status==="planned"?Rr(l.symbol,l.label):Or(e,m(l.id,{},t),l.symbol,l.label,Pr(l.id,t)));return xr(s.label,o)}).join("")}
    </div>
    <div class="deck-footer">
      <a class="deck-company-switch" href="${_(m("settings",{tab:"company"},t))}" data-router>
        ${z("q-company")}
        <span><strong>${r(T(t))}</strong><small>Workspace</small></span>
        <i class="ti ti-chevron-down"></i>
      </a>
      <button class="deck-user-card" type="button" data-action="open-profile">
        ${te(a.profile,"avatar small")}
        <span><strong>${r(a.profile.full_name)}</strong><small>${r(Ge(t))}</small></span>
        <i class="ti ti-dots-vertical"></i>
      </button>
    </div>
  `}function xr(e,t){return t.length?`
    <section class="side-group">
      <div class="side-label">${r(e)}</div>
      <div class="side-items">${t.join("")}</div>
    </section>
  `:""}function Or(e,t,a,n,s=""){return`
    <a class="side-item ${Lc(e,t)?"active":""}" href="${_(t)}" data-router title="${r(n)}" aria-label="${r(n)}">
      ${z(a)}
      <span>${r(n)}</span>
      ${s!==""?`<b>${r(String(s))}</b>`:""}
    </a>
  `}function Rr(e,t){return`
    <button class="side-item planned" type="button" disabled aria-disabled="true" title="${r(t)}" aria-label="${r(t)}">
      ${z(e)}
      <span>${r(t)}</span>
      <b>Planned</b>
    </button>
  `}function as(e,t=u()){return e.id==="home"||e.status==="planned"?!0:!X(t)&&!["settings","users"].includes(e.id)?!1:h(e.permission||`${e.id}.view`,t)}function Pr(e,t=u()){return e==="jobs"?Q(t).length:e==="tasks"?ae(t).length:e==="files"?Ce(t).length:e==="forms"?ye(t).length:e==="crm"?Et(t).length:e==="finance"?_e(t).length:e==="users"?ie(t).filter(a=>a.status==="active").length:e==="messages"?vs(t)||xe(t).length:e==="calendar"?hs(t).length:e==="time"?qs(t).focus.length:e==="approvals"?qn(t).length:e==="clock"&&Tt(t)?"On":""}function hn(e,t){return`
    <nav class="tabbar compact-tabbar" aria-label="${r(e)}">
      ${t.map(([a,n,s])=>`<a class="${s?"active":""}" href="${_(a)}" data-router>${r(n)}</a>`).join("")}
    </nav>
  `}function ns(e){if(e.name==="command")return Qr(u());if(e.name!=="company")return mi(e.name);const t=e.companyId;if(i.session?.auth==="supabase"&&!Ue().includes(t))return Lr(t);const a=st.find(n=>n.id===e.section);if(e.section==="home")return is(t);if(a?.status!=="planned"){if(!X(t)&&e.section!=="settings")return Ur(t);if(a?.permission&&!h(a.permission,t))return Nr(t,a.permission)}return e.section==="jobs"?eo(e,t):e.section==="tasks"?so(e,t):e.section==="files"?uo(e,t):e.section==="users"?ko(e,t):e.section==="settings"?Ao(e,t):e.section==="forms"?Ro(t):e.section==="analytics"?Xr(e,t):e.section==="crm"?Jo(e,t):e.section==="finance"?dl(e,t):e.section==="messages"?Go(e,t):e.section==="team-chart"?qo(t):e.section==="time"||e.section==="calendar"||e.section==="approvals"||e.section==="clock"?_l(e,t):mi(e.section)}function Ur(e){const t=Ta(e);return`
    ${G(t?"Workspace awaiting approval":"Subscription required",t?"Your company workspace is created. Quest needs to approve billing/access before live company data opens.":"This company workspace needs an active subscription before paid modules can open.",`
      <button class="btn" type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
      <a class="btn btn-primary" href="${_(m("settings",{tab:"billing"},e))}" data-router><i class="ti ti-credit-card"></i>${t?"Review status":"Billing"}</a>
    `)}
    <section class="panel">
      ${H([["Company",T(e)],["Subscription",On(e)],["Allowed area","Settings, profile, and sign out remain available"],["Next step",t?"Quest approval / billing activation":"Restore billing access"]])}
    </section>
  `}function Nr(e,t){return`
    ${G("Access denied","Your role does not include the permission required for this module.",`
      <a class="btn" href="${_(m("settings",{tab:"roles"},e))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${H([["Company",T(e)],["Required permission",t],["Your role",Ge(e)]])}
    </section>
  `}function Lr(e){return`
    ${G("Company access denied","This workspace is not in your active company memberships.",`
      <a class="btn" href="${_(m("jobs",{},u()))}" data-router><i class="ti ti-building"></i>Your workspace</a>
      <a class="btn btn-primary" href="${_("/login?mode=request")}" data-router><i class="ti ti-user-plus"></i>Request access</a>
    `)}
    <section class="panel">
      ${H([["Requested company",T(e)],["Access rule","Active company membership required"],["Your status",oe(e,b().profile.id)?.status?F(oe(e,b().profile.id).status):"No active membership"]])}
    </section>
  `}function Qr(e){return is(e)}function is(e){const t=Q(e),a=ae(e),n=a.filter(N=>N.status!=="done"),s=n.filter(N=>N.due&&new Date(N.due)<Yt()),o=h("messages.view",e)?vs(e):0,l=Ce(e),c=ye(e),d=ie(e),f=d.filter(N=>N.status==="active"),g=d.filter(N=>N.status==="pending"),S=Vr(e,_s(e).slice(0,4)),V=Kr(e),E=de(e).filter(N=>!N.is_system).length,ne=new Set(de(e).flatMap(N=>N.permissions||[])).size,Me=h("users.view",e)||h("settings.view",e);return`
    <section class="home-cockpit">
      <div class="home-hero">
        <div>
          <h1>Good ${r(Gr())}, <span>${r(Zr(b().profile.full_name)||"Quest Admin")}</span></h1>
          <p>Here is what is happening across your workspace.</p>
        </div>
        <div class="home-hero-actions">
          <label class="company-switch home-company-switch">
            ${z("q-company")}
            <select data-company-switch aria-label="Active company">
              ${Tn().map(N=>`<option value="${r(N.id)}" ${N.id===e?"selected":""}>${r(xt(N))}</option>`).join("")}
            </select>
          </label>
          <button class="icon-button" type="button" data-action="toggle-notifications" aria-label="Open notifications">
            <i class="ti ti-bell"></i>
            ${o?`<b>${r(String(Math.min(o,99)))}</b>`:""}
          </button>
          ${te(b().profile,"avatar")}
        </div>
      </div>
      <section class="home-metric-grid">
        ${ct("q-symbol-approvals","Company access",On(e),Ta(e)?"Approval required before full access.":"Workspace modules are available.",m("settings",{tab:"billing"},e),"View status",X(e)?"good":"warning")}
        ${ct("q-symbol-users","Active users",f.length,`${f.length} active / ${g.length} pending`,m("users",{},e),"Manage users")}
        ${ct("q-symbol-tasks","Open tasks",n.length,`${s.length} overdue`,m("tasks",{},e),"View tasks",s.length?"warning":"")}
        ${ct("q-symbol-messages","Unread messages",o,"Across team chats",m("messages",{},e),"Open inbox")}
        ${ct("q-symbol-settings","Workspace health",X(e)?"Good":"Pending",X(e)?"All core systems operational":"Approval or billing still needs attention.",m("settings",{},e),"See details",X(e)?"good":"warning")}
      </section>
      <section class="home-dashboard-grid">
        <article class="panel home-activity-panel">
          <div class="section-head">
            <div><h2>Recent activity</h2><p>Latest company work and inbox events.</p></div>
            <a class="btn" href="${_(m("analytics",{},e))}" data-router>All activity</a>
          </div>
          <div class="home-activity-list">
            ${S.map(Yr).join("")||v("No recent activity yet.")}
          </div>
        </article>
        <article class="panel home-message-panel">
          <div class="section-head">
            <div><h2>Unread messages</h2><p>Team conversations needing attention.</p></div>
            <a href="${_(m("messages",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-message-list">
            ${Br(e).map(Hr).join("")||v("No unread messages.")}
          </div>
        </article>
        <article class="panel home-next-panel">
          <div class="section-head">
            <div><h2>Next tasks</h2><p>Your cleanest path through today.</p></div>
            <a href="${_(m("tasks",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-next-list">
            ${zr(e).map(Wr).join("")||v("No open tasks.")}
          </div>
        </article>
        <article class="panel home-team-panel">
          <div class="section-head">
            <div><h2>Team access</h2><p>Active people in this workspace.</p></div>
            <a href="${_(m("users",{},e))}" data-router>View all <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="home-team-list">
            ${f.slice(0,4).map(Jr).join("")||v("No active users yet.")}
          </div>
        </article>
        <article class="panel home-health-panel">
          <div class="section-head"><div><h2>Workspace health</h2><p>Access, billing, and operating signals.</p></div></div>
          <div class="home-health-body">
            <div class="home-orbit" aria-hidden="true"><span>${z("q-logo","brand-symbol")}</span></div>
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
            <div><i class="ti ti-user-shield"></i><strong>${r(E||de(e).length)}</strong><span>Custom roles</span></div>
            <div><i class="ti ti-shield-lock"></i><strong>${r(ne||Ti.length)}</strong><span>Active rules</span></div>
            <div><i class="ti ti-lock"></i><strong>${r(Me?"100%":"Basic")}</strong><span>Protected data</span></div>
            <div><i class="ti ti-clipboard-check"></i><strong>${r(Cs(e).length)}</strong><span>Audit events</span></div>
          </div>
        </article>
      </section>
      <section class="home-shortcuts panel">
        ${Ie("files","q-symbol-files","Files",l.length,e)}
        ${Ie("crm","q-symbol-crm","CRM",Et(e).length,e)}
        ${Ie("finance","q-symbol-finance","Finance",_e(e).length,e)}
        ${Ie("calendar","q-symbol-calendar","Calendar",hs(e).length,e)}
        ${Ie("users","q-symbol-users","Users",f.length,e)}
        ${Ie("forms","q-symbol-forms","Forms",c.length,e)}
        ${Ie("analytics","q-symbol-analytics","Reports",t.length+a.length,e)}
      </section>
    </section>
  `}function ct(e,t,a,n,s,o,l=""){return`
    <article class="home-metric-card ${r(l)}">
      ${z(e)}
      <span>${r(t)}</span>
      <strong>${r(a)}</strong>
      <small>${r(n)}</small>
      <a href="${_(s)}" data-router>${r(o)} <i class="ti ti-arrow-right"></i></a>
    </article>
  `}function Ie(e,t,a,n,s){const o=st.find(l=>l.id===e);return o&&!as(o,s)?"":`
    <a class="home-shortcut" href="${_(m(e,{},s))}" data-router>
      ${z(t)}
      <span>${r(a)}</span>
      ${n!==""&&n!==void 0?`<b>${r(String(n))}</b>`:""}
    </a>
  `}function Vr(e,t=[]){const a=t.map(o=>({icon:"ti-bell",title:o.body||o.title,meta:zs(o.type),time:o.created_at,href:o.href||m("home",{},e),avatar:b().profile})),n=ae(e).slice(0,3).map(o=>({icon:"ti-circle-check",title:`${o.title} was updated`,meta:"Tasks",time:o.updated_at||o.due,href:m("tasks",{...o.project_id?{job_id:o.project_id}:{},task_id:o.id},e),avatar:{full_name:B(o.assignee_id)}})),s=Ce(e).slice(0,2).map(o=>({icon:"ti-folder",title:`${o.name} was uploaded`,meta:"Files",time:o.updated_at||o.created_at,href:m("files",o.job_id?{job_id:o.job_id}:{},e),avatar:{full_name:B(o.owner_id||o.created_by)}}));return a.concat(n,s).sort((o,l)=>Date.parse(l.time||0)-Date.parse(o.time||0)).slice(0,5)}function Yr(e){return`
    <a class="home-activity-row" href="${_(e.href)}" data-router>
      <span class="home-activity-icon"><i class="ti ${r(e.icon)}"></i></span>
      <span><strong>${r(e.title)}</strong><small>${r(e.meta)}</small></span>
      ${te(e.avatar||{},"avatar small")}
      <em>${r(lt(e.time))}</em>
    </a>
  `}function Br(e){return h("messages.view",e)?xe(e).filter(t=>gt(t.id)>0).slice(0,4).map(t=>{const a=Oe(t.id).slice(-1)[0];return{id:t.id,title:a?.body||t.title,meta:`${t.title} - ${lt(a?.created_at||t.updated_at||t.created_at)}`,href:m("messages",{conversation:t.id},e),count:gt(t.id),avatar:{full_name:a?B(a.sender_profile_id):t.title}}}):[]}function Hr(e){return`
    <a class="home-message-row" href="${_(e.href)}" data-router>
      ${te(e.avatar||{},"avatar small")}
      <span><strong>${r(e.title)}</strong><small>${r(e.meta)}</small></span>
      <b>${r(e.count)}</b>
    </a>
  `}function zr(e){return ae(e).filter(t=>t.status!=="done").sort(Ja).slice(0,4)}function Wr(e){return`
    <a class="home-next-row" href="${_(m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id))}" data-router>
      <i class="ti ti-circle"></i>
      <span><strong>${r(e.title)}</strong><small>${r(P(e.project_id)?.name||Le(e.type))}</small></span>
      ${Vn(e.priority)}
      <em>${r(e.due?O(e.due):"Open")}</em>
    </a>
  `}function Jr(e){return`
    <a class="home-team-row" href="${_(m("users",{},u()))}" data-router>
      ${te({full_name:e.name,email:e.email,avatar_url:e.avatar_url},"avatar small")}
      <span><strong>${r(e.name)}</strong><small>${r(e.email||e.role_label)}</small></span>
      <b>${r(e.role_label)}</b>
    </a>
  `}function Kr(e){return[{label:"Company created",icon:"ti-circle-check",state:"good"},{label:X(e)?"Access approved":"Pending approval",icon:X(e)?"ti-circle-check":"ti-clock",state:X(e)?"good":"warning"},{label:"Billing connected",icon:"ti-link",state:X(e)?"good":"muted"},{label:X(e)?"Payment active":"Payment not active",icon:"ti-credit-card",state:X(e)?"good":"muted"},{label:"Full access enabled",icon:"ti-shield-check",state:X(e)?"good":"muted"}]}function Gr(){const e=new Date().getHours();return e<12?"morning":e<18?"afternoon":"evening"}function Zr(e){return String(e||"").trim().split(/\s+/)[0]||""}function Xr(e,t){const a=e.jobId?P(e.jobId):null,n=a?[a]:Q(t),s=ae(t).filter(g=>!a||g.project_id===a.id),o=Ce(t).filter(g=>!a||g.job_id===a.id),l=ye(t).filter(g=>!a||g.linked_job_id===a.id),c=s.filter(g=>g.status!=="done"),d=s.filter(g=>g.status!=="done"&&g.due&&new Date(g.due)<Yt()),f=me(n,"estimate_total");return`
    <section class="analytics-workspace">
      <section class="analytics-toolbar panel">
        <div>
          <strong>Analytics</strong>
          <span>${r(a?a.name:T(t))}</span>
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
          <small>${r(d.length)} overdue / ${r(s.filter(g=>g.priority==="urgent"||g.priority==="critical").length)} urgent</small>
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
          <strong>${r(zu(s.filter(g=>g.status==="done").length,s.length))}</strong>
          <small>${r(s.filter(g=>g.status==="done").length)} done of ${r(s.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${n.map(g=>`
              <a class="analytics-row" href="${_(m("analytics",{job_id:g.id},t))}" data-router>
                <span><strong>${r(g.name)}</strong><small>${r(g.client_name||T(t))}</small></span>
                <span>${r(g.stage)}</span>
                <span>${r(Ra(g.id))}</span>
                <span>${r(sa(g.id))}</span>
                <span>${r(C(g.estimate_total))}</span>
              </a>
            `).join("")||v("No jobs to analyze yet.")}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${Ct.map(g=>{const S=s.filter(V=>V.status===g).length;return`<div><span>${r(we(g))}</span><b><i style="width:${r(cr(S,s.length))}%"></i></b><strong>${r(S)}</strong></div>`}).join("")}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${s.filter(g=>g.status!=="done").sort((g,S)=>nt(S.priority)-nt(g.priority)).slice(0,8).map(g=>Qn(g)).join("")||v("No open tasks in this scope.")}
          </div>
        </article>
      </section>
    </section>
  `}function eo(e,t){const a=Qc(e.params.get("tab")),n=Ee();return`
    ${G("Jobs","Company job records, clients, scope, and linked work.",`
      <a class="btn" href="${_(m("files",n?{job_id:n.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <section class="job-toolbar">
      <label>
        <span>Stage</span>
        <select data-stage-filter>
          ${["all"].concat(Dt).map(s=>`<option value="${r(s)}" ${i.stageFilter===s?"selected":""}>${r(s==="all"?"All stages":s)}</option>`).join("")}
        </select>
      </label>
      <div class="selected-job-chip">
        <span>Selected job</span>
        <strong>${n?r(n.name):"No job selected"}</strong>
      </div>
    </section>
    <nav class="tabbar" aria-label="Job sections">
      ${xi.map(s=>`<a class="${s===a?"active":""}" href="${_(m("jobs",{tab:s,...n?{job_id:n.id}:{}},t))}" data-router>${r(Vc(s))}</a>`).join("")}
    </nav>
    ${to(a,t,n)}
  `}function to(e,t,a){return e==="pipeline"?oi(t):e==="list"?ao(t):e==="profile"?no(t,a):oi(t)}function oi(e){const t=js(e);return`
    <section class="job-board">
      ${Dt.map(a=>{const n=t.filter(s=>s.stage===a);return`
          <article class="job-lane">
            <h2><span>${r(a)}</span><b>${n.length}</b></h2>
            ${n.map(s=>Kd(s)).join("")||'<div class="lane-empty">No jobs</div>'}
          </article>
        `}).join("")}
    </section>
  `}function ao(e){const t=js(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Job list</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Tasks</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===i.selectedJobId?"active":""}" type="button" data-select-job="${r(a.id)}">
            <span><strong>${r(a.name)}</strong><small>${r(a.client_name||"No client")} - ${r(a.site_address||"No address")}</small></span>
            <span>${r(a.stage)}</span>
            <span>${Ns(a.priority)}</span>
            <span>${r(a.owner_name||"Unassigned")}</span>
            <span>${r(Ra(a.id))}</span>
            <span>${C(a.estimate_total)}</span>
          </button>
        `).join("")||v("No jobs match this view.")}
      </div>
    </section>
  `}function no(e,t){return t?`
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${r(T(e))} - ${r(t.job_type)}</span>
          <h2>${r(t.name)}</h2>
          <p>${r(t.scope||"No scope written yet.")}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${H([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",C(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${_(m("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(t.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${Wt(m("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${Ra(t.id)} linked tasks`)}
          ${Wt(m("files",{job_id:t.id},e),"ti-folder","Files",`${sa(t.id)} files`)}
          ${Wt(m("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${Wt(m("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:v("Create a job to see the profile workspace.")}function io(e,t){const a=t||Pd(e);return`
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${I("Workspace name","name",a.name,!0)}
      ${U("Company","company_id",e,Tn().map(n=>[n.id,xt(n)]))}
      ${I("Client","client_name",a.client_name)}
      ${I("Contact","contact_name",a.contact_name)}
      ${I("Account owner","owner_name",a.owner_name)}
      ${I("Job type","job_type",a.job_type||"Roofing")}
      ${U("Business status","stage",a.stage||"Lead",Dt.map(n=>[n,n]))}
      ${U("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(n=>[n,n]))}
      ${I("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${I("Invoice total","invoice_total",a.invoice_total||0,!1,"number")}
      ${I("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${ke("Scope","scope",a.scope,"span-2")}
      ${ke("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function so(e,t){const a=e.jobId?P(e.jobId):null,n=Dd(t,a?.id);return`
    ${G(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${_(m("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${_(m("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${ro(t,a)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${i.taskView==="board"?lo(t,n):oo(t,n)}
      </article>
    </section>
  `}function ro(e,t){return`
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
          ${["all"].concat(Ct).map(n=>`<option value="${r(n)}" ${i.taskStatusFilter===n?"selected":""}>${r(n==="all"?"All statuses":we(n))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(ea).map(n=>`<option value="${r(n)}" ${i.taskPriorityFilter===n?"selected":""}>${r(n==="all"?"All priorities":F(n))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${i.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${i.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function oo(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===i.selectedTaskId?"active":""}" type="button" data-select-task="${r(a.id)}">
          <span><strong>${r(a.title)}</strong><small>${r(a.description||Le(a.type))}</small></span>
          <span>${r(P(a.project_id)?.name||"Company task")}</span>
          <span>${r(B(a.assignee_id))}</span>
          <span>${Vn(a.priority)}</span>
          <span>${Ls(a.status)}</span>
          <span>${O(a.due)}</span>
        </button>
      `).join("")||v("No tasks match this workspace view.")}
    </div>
  `}function lo(e,t){return`
    <div class="task-board">
      ${Ct.map(a=>{const n=t.filter(s=>s.status===a);return`
          <section class="task-column">
            <h2><span>${r(we(a))}</span><b>${n.length}</b></h2>
            ${n.map(s=>`
              <button class="task-card priority-${r(s.priority)}" type="button" data-select-task="${r(s.id)}">
                <strong>${r(s.title)}</strong>
                <span>${r(P(s.project_id)?.name||T(e))}</span>
                <small>${r(B(s.assignee_id))} - ${O(s.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function co(e,t){return t?`
    <div class="section-head">
      <div><h2>${r(t.title)}</h2><p>${r(P(t.project_id)?.name||T(e))}</p></div>
      <a class="btn" href="${_(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${H([["Status",we(t.status)],["Priority",F(t.priority)],["Type",Le(t.type)],["Assignee",B(t.assignee_id)],["Due",O(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${r(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${v("No task selected.")}
    `}function li(e,t,a){const n=a||Ud(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${r(a?n.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${I("Task title","title",n.title,!0)}
      ${U("Job","project_id",n.project_id||"",[["","Company-level task"]].concat(Q(e).map(s=>[s.id,s.name])))}
      ${U("Status","status",n.status,Ct.map(s=>[s,we(s)]))}
      ${U("Priority","priority",n.priority,ea.map(s=>[s,F(s)]))}
      ${U("Type","type",n.type,Oi.map(s=>[s,Le(s)]))}
      ${U("Assignee","assignee_id",n.assignee_id,rt(e).map(s=>[s.id,B(s.id)]))}
      ${I("Due date","due",n.due||k(1),!0,"date")}
      ${ke("Description","description",n.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${r(a.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function uo(e,t){const a=e.params.get("folder")||i.driveFolder||"home";i.driveFolder=a;const n=e.jobId?P(e.jobId):null,s=$u(t,a,n?.id||""),o=h("files.manage",t);return`
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${r(n?n.name:"Company Drive")}</strong>
              <small>${r(n?`${n.client_name||T(t)} file workspace`:`${T(t)} file manager`)}</small>
            </div>
          </div>
          <label class="drive-search">
            <i class="ti ti-search"></i>
            <input data-file-search value="${r(i.fileQuery)}" placeholder="Search drive" />
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
                <a href="${_(m("files",{},t))}" data-router>${r(T(t))}</a>
                ${a!=="home"?wu(t,a,n):""}
                ${n?`<span>/</span><strong>${r(n.name)}</strong>`:""}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${i.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${i.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${mo(t,a,n,s)}
          </div>
        </div>
      </section>
    </section>
  `}function mo(e,t,a,n){const s=yu(e,t,a),o=s.map(c=>({kind:"folder",...c})).concat(n.map(c=>({kind:"file",file:c}))),l=a?a.name:t==="home"?"This folder":fe(t);return`
    <section class="drive-section-title">
      <div><h3>${r(l)}</h3><span>${s.length} folder${s.length===1?"":"s"} / ${n.length} file${n.length===1?"":"s"}</span></div>
    </section>
    ${i.driveView==="list"?po(o):fo(o)}
  `}function po(e){return`
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${e.map(t=>t.kind==="folder"?bo(t):_o(t.file)).join("")||v("This folder is empty.")}
    </div>
  `}function fo(e){return`
    <section class="drive-folder-grid explorer-grid">
      ${e.map(t=>t.kind==="folder"?go(t):yo(t.file)).join("")||v("This folder is empty.")}
    </section>
  `}function go(e){return`
    <a class="drive-folder-card explorer-folder" href="${r(e.href)}" data-router>
      <span class="drive-folder-icon">${sr(e,e.name)}</span>
      <strong>${r(e.name)}</strong>
      <em>${r(e.countLabel||"0 items")}</em>
    </a>
  `}function bo(e){return`
    <a class="explorer-row folder-row-live" href="${r(e.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder">${sr(e,e.name)}</span><strong>${r(e.name)}</strong></span>
      <span>${r(e.updatedLabel||"")}</span>
      <span>Folder</span>
      <span>${r(e.countLabel||"")}</span>
    </a>
  `}function _o(e){return`
    <button type="button" class="explorer-row ${e.id===i.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}" role="row">
      <span class="explorer-name">${vo(e)}<strong>${r(e.file_name)}</strong></span>
      <span>${O(e.updated_at||e.created_at)}</span>
      <span>${r(qe(e))}</span>
      <span>${Jn(e.size_bytes)}</span>
    </button>
  `}function vo(e){return`
    <span class="file-type ${r(zn(e))}">
      ${rr(e,qe(e))}
      <small>${r(Zs(e))}</small>
    </span>
  `}function yo(e){return`
    <button type="button" class="file-card-live ${e.id===i.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}">
      <span class="file-thumb">${Wn(e)}</span>
      <strong>${r(e.file_name)}</strong>
      <span>${r(qe(e))} / ${Jn(e.size_bytes)}</span>
    </button>
  `}function ho(e,t){const a=h("files.manage",t);return`
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${wo(e)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${Wn(e)}
          <div>
            <strong>${r(e.file_name)}</strong>
            <span>${r(qe(e))} / ${Jn(e.size_bytes)}</span>
          </div>
        </div>
        <div class="file-detail-list">
          ${Fe("Location",fe(e.folder))}
          ${Fe("Job",P(e.job_id)?.name||"Company shared")}
          ${Fe("Uploaded by",e.uploaded_by_label||"Quest HQ")}
          ${Fe("Modified",O(e.updated_at||e.created_at))}
          ${Fe("Storage",e.object_path||"Metadata only")}
        </div>
        <div class="file-detail-actions">
          <button class="btn" type="button" data-action="download-file" data-file-id="${r(e.id)}"><i class="ti ti-download"></i>Download</button>
          ${a?`<button class="btn danger" type="button" data-action="delete-file" data-file-id="${r(e.id)}"><i class="ti ti-trash"></i>Delete</button>`:""}
        </div>
      </aside>
    </section>
  `}function wo(e){const t=zn(e);return e.signed_url&&t==="image"?`<img class="file-preview-media" src="${r(e.signed_url)}" alt="" />`:e.signed_url&&t==="pdf"?`<iframe class="file-preview-frame" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:e.signed_url&&t==="text"?`<iframe class="file-preview-frame text" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:["doc","sheet"].includes(t)&&e.signed_url?`<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:`
    <div class="file-preview-empty">
      ${Wn(e,!0)}
      <strong>${r(qe(e))} preview</strong>
      <p>${r(e.object_path?"Preview will load when a signed file URL is available.":"This is a metadata-only file record. Upload the actual file object to preview it here.")}</p>
      ${e.notes?`<pre>${r(e.notes)}</pre>`:""}
    </div>
  `}function $o(){const e=u(),t=i.route||Mt(),a=t.params.get("folder")||i.driveFolder||"home",n=t.jobId?P(t.jobId):null;return x("Drive","New folder",`
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${r(e)}" />
      <input type="hidden" name="parent_key" value="${r(Gs(a,n))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${r(a==="home"?T(e):n?.name||fe(a))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"task-modal")}function So(){const e=u(),t=i.route?.params?.get("folder")||(i.driveFolder==="home"?"shared":i.driveFolder),a=i.route?.jobId||"";return`
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">${r(T(e))} Drive</div><h2 id="upload-title">Upload files</h2></div>
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
          ${I("Metadata-only file name","file_name","")}
          ${U("Folder","folder",t,Vu(e))}
          ${U("Job","job_id",a,[["","Company shared file"]].concat(Q(e).map(n=>[n.id,n.name])))}
          ${U("Category","category",fe(t),vr.filter(n=>n!=="All categories").map(n=>[n,n]))}
          ${I("Uploaded by","uploaded_by_label",b().profile.full_name||"Quest HQ")}
          ${ke("Notes","notes","","span-2")}
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
  `}function ko(e,t){const a=ie(t),n=["members","access"].includes(e.params.get("tab"))?e.params.get("tab"):"members",s=i.joinRequests.filter(d=>d.company_id===t&&d.status==="pending"),o=h("users.manage",t),l=a.filter(d=>d.status==="active"),c=a.filter(d=>d.status!=="active");return`
    ${G("Users","Company members, roles, workers, and access context.",`
      <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite user</button>
      <a class="btn" href="${_(m("settings",{tab:"roles"},t))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      <a class="btn" href="${_(m("settings",{tab:"access"},t))}" data-router><i class="ti ti-settings"></i>Access settings</a>
    `)}
    ${hn("Users sections",[[m("users",{tab:"members"},t),"Members",n==="members"],[m("users",{tab:"access"},t),"Access",n==="access"]])}
    ${n==="members"?`
      <section class="metric-grid operations-metrics">
        ${M("Active users",l.length)}
        ${M("Pending",a.filter(d=>d.status==="pending").length+s.length)}
        ${M("Disabled/left",c.filter(d=>d.status!=="pending").length)}
        ${M("Roles",de(t).length)}
      </section>
      <section class="users-grid">
        ${a.map(d=>`
          <article class="user-card ${d.status!=="active"?"muted":""}">
            ${te({full_name:ta(d),email:d.email,avatar_url:d.avatar_url},"avatar")}
            <div>
              <strong>${r(ta(d))}</strong>
              <span>${r(ss(d))}</span>
              <small>${r(d.role_label)} / ${r(F(d.status))}</small>
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
          ${a.map(d=>Do(t,d,o)).join("")||v("No users assigned to this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head">
          <div><h2>Invites</h2><p>Copy a secure invite code or link for a specific email address.</p></div>
          <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite</button>
        </div>
        <div class="access-invite-list">
          ${bd(t).map(d=>jo(d,o)).join("")||v("No pending invites.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
        <div class="access-request-list">
          ${s.map(d=>Co(d,o)).join("")||v("No pending join requests.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
        ${H([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Supabase Auth + RLS"],["Your role",Ge(t)],["Can manage users",o?"Yes":"No"]])}
      </article>
    </section>
    `}
  `}function Do(e,t,a){const n=de(e),s=t.role_id||_t(e,t.role)||n[0]?.id||"",o=t.profile_id&&Os(e,t.profile_id),l=a&&t.profile_id&&!o;return`
    <article class="access-user-row ${t.status!=="active"?"muted":""}">
      ${te({full_name:ta(t),email:t.email,avatar_url:t.avatar_url},"avatar")}
      <div class="access-user-main">
        <strong>${r(ta(t))}</strong>
        <span>${r(ss(t))} / ${r(F(t.status))}</span>
        ${o?'<small class="access-note">Last active Owner - promote another Owner before changing this access.</small>':""}
      </div>
      <form class="access-role-form" data-user-role-form>
        <input type="hidden" name="company_id" value="${r(e)}" />
        <input type="hidden" name="profile_id" value="${r(t.profile_id)}" />
        <select name="role_id" ${l?"":"disabled"}>
          ${n.map(c=>`<option value="${r(c.id)}" ${c.id===s?"selected":""}>${r(c.name)}</option>`).join("")}
        </select>
        <select name="membership_status" ${l?"":"disabled"}>
          ${["active","pending","disabled","left"].map(c=>`<option value="${r(c)}" ${c===t.status?"selected":""}>${r(F(c))}</option>`).join("")}
        </select>
        <button class="btn" type="submit" ${l?"":"disabled"}>Save</button>
      </form>
    </article>
  `}function Co(e,t){const a=e.requested_email||Re(e.profile_id)?.email||e.profile_id||"Requester";return`
    <article class="access-request-row">
      <div>
        <strong>${r(a)}</strong>
        <span>${r(e.message||"Access request")} / ${O(e.created_at)}</span>
      </div>
      <div>
        <button class="btn btn-primary" type="button" data-action="approve-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Approve</button>
        <button class="btn danger" type="button" data-action="reject-join-request" data-request-id="${r(e.id)}" ${t?"":"disabled"}>Reject</button>
      </div>
    </article>
  `}function jo(e,t){const a=ot(e.company_id,e.role_id),n=e.expires_at&&Date.parse(e.expires_at)<Date.now();return`
    <article class="access-invite-row ${n?"muted":""}">
      <div>
        <strong>${r(e.email)}</strong>
        <span>${r(a?.name||"Member")} / ${n?"Expired":`Expires ${O(e.expires_at)}`}</span>
        ${e.token?`<code class="invite-code">${r(e.token)}</code>`:""}
      </div>
      <div>
        <button class="btn" type="button" data-action="copy-invite-code" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-key"></i>Copy code</button>
        <button class="btn" type="button" data-action="copy-invite-link" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-link"></i>Copy link</button>
        <button class="btn danger" type="button" data-action="revoke-invite" data-invite-id="${r(e.id)}" ${t?"":"disabled"}>Revoke</button>
      </div>
    </article>
  `}function ta(e){const t=String(e.name||"").trim(),a=String(e.email||"").trim();if(t&&!ma(t))return t;if(a&&!ma(a))return a.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,s=>s.toUpperCase());const n=String(e.role||"").toLowerCase();return n==="owner"?"Workspace owner":n==="admin"?"Workspace admin":n==="developer"?"Developer":`${e.role_label||"Workspace"} user`}function ss(e){const t=String(e.email||"").trim();if(t&&!ma(t))return t;const a=String(e.profile_id||e.member_id||"").trim();return a?`ID ${dr(a)}`:"No email on profile"}function qo(e){const t=rt(e),a=t.filter(n=>!n.supervisor_id||!t.some(s=>s.id===n.supervisor_id));return`
    <section class="tool-page team-chart-page">
      ${G("Team chart","Reporting lines, roles, and company coverage for this workspace.",`
        <a class="btn" href="${_(m("users",{},e))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${_(m("settings",{tab:"team"},e))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${M("Members",t.length)}
        ${M("Leads",a.length)}
        ${M("Open tasks",ae(e).filter(An).length)}
        ${M("Active timer",Tt(e)?"Yes":"No")}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${a.map(n=>rs(e,n,t)).join("")||v("No workers assigned.")}
        </div>
      </section>
    </section>
  `}function rs(e,t,a,n=0){const s=a.filter(o=>o.supervisor_id===t.id);return`
    <article class="team-node" style="--depth:${n}">
      <div class="team-node-card">
        ${te({full_name:t.full_name,avatar_url:t.avatar_url},"avatar")}
        <span><strong>${r(t.full_name)}</strong><small>${r(na(e,t.id))}</small></span>
        <b>${ae(e).filter(o=>o.assignee_id===t.id&&An(o)).length} open</b>
      </div>
      ${s.length?`<div class="team-node-children">${s.map(o=>rs(e,o,a,n+1)).join("")}</div>`:""}
    </article>
  `}function Ao(e,t){const a=Ea(t),n=["company","billing","roles","access","team"].includes(e.params.get("tab"))?e.params.get("tab"):"company";return`
    ${G("Settings","Company settings, roles, approvals, and admin controls.","")}
    ${hn("Settings sections",[[m("settings",{tab:"company"},t),"Company",n==="company"],[m("settings",{tab:"billing"},t),"Billing",n==="billing"],[m("settings",{tab:"roles"},t),"Roles",n==="roles"],[m("settings",{tab:"access"},t),"Access",n==="access"],[m("settings",{tab:"team"},t),"Workers",n==="team"]])}
    <section class="dashboard-grid compact-settings-grid">
      ${n==="company"?`
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${H([["Name",T(t)],["Company ID",t],["Color",a?.color||je(t)],["Visible jobs",Q(t).length]])}
      </article>
      `:""}
      ${n==="billing"?Mo(t):""}
      ${n==="roles"?Eo(t):""}
      ${n==="access"?`
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${H([["Auth switch","Enabled"],["Local login","Disabled"],["Isolation","Server-enforced when migration is applied"],["Active memberships",String(i.memberships.filter(s=>s.company_id===t&&s.status==="active").length)],["Disabled/left",String(i.memberships.filter(s=>s.company_id===t&&["disabled","left"].includes(s.status)).length)],["Invites",String(i.companyInvites.filter(s=>s.company_id===t&&s.status==="pending").length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${i.joinRequests.filter(s=>s.company_id===t).map(s=>ze(s.requested_email||s.profile_id,s.message||"Access request",F(s.status),s.created_at)).join("")||v("No pending company approvals.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access history</h2><p>Recent membership, invite, and role changes for this company.</p></div></div>
        <div class="access-audit-list">
          ${Cs(t).slice(0,8).map(_d).join("")||v("No access audit events yet.")}
        </div>
      </article>
      `:""}
      ${n==="team"?`
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${rt(t).map(s=>`<div><strong>${r(s.full_name)}</strong><span>${r(na(t,s.id))}</span></div>`).join("")||v("No workers assigned.")}
        </div>
      </article>
      `:""}
    </section>
  `}function Mo(e){const t=Ot(e),a=Ta(e);return`
    <article class="panel">
      <div class="section-head">
        <div><h2>${a?"Workspace awaiting approval":"Subscription"}</h2><p>${a?"Quest needs to approve billing/access before live company data opens.":"$300/month company workspace billing gate."}</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout" ${a?"disabled":""}><i class="ti ti-credit-card"></i>${a?"Billing pending":"Start subscription"}</button>
      </div>
      ${H([["Plan","$300/month company workspace"],["Status",On(e)],["Stripe customer",t?.stripe_customer_id||"Not connected"],["Approval",a?"Waiting for Quest review":"Ready"],["Renewal / trial",t?.current_period_end||t?.trial_ends_at?O(t.current_period_end||t.trial_ends_at):"Pending"]])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules open only after approval or an active billing state.</p></div></div>
      ${H([["Workspace access",X(e)?"Allowed":"Suspended"],["Finance/files privacy","Requires Auth + RLS"],["Seat billing","Tracked later; not charged in v1"]])}
    </article>
    ${Rn()?Io(e):""}
  `}function Io(e){const t=qd(),a=t.filter(n=>n.status==="pending_review").length;return`
    <article class="panel span-3">
      <div class="section-head">
        <div><h2>Quest approval console</h2><p>${a} workspace${a===1?"":"s"} waiting for manual activation.</p></div>
      </div>
      <div class="approval-console-list">
        ${t.map(n=>Fo(n,e)).join("")||v("No workspace reviews found.")}
      </div>
    </article>
  `}function Fo(e,t){const a=["active","trialing","past_due","grace"].includes(e.status),n=e.company_id===t;return`
    <article class="workspace-review-row ${e.status==="pending_review"?"pending":""}">
      <span>
        <strong>${r(e.company_name||T(e.company_id))}${n?" / current":""}</strong>
        <small>${r(e.company_id)} / ${r(e.owner_email||"No owner email")} / ${O(e.created_at)}</small>
      </span>
      <b class="status-pill ${a?"active":e.status==="pending_review"?"pending":"muted"}">${r(ia(e.status,e))}</b>
      <div class="workspace-review-actions">
        <button class="btn btn-primary" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="active" ${a?"disabled":""}>Approve</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="pending_review" ${e.status==="pending_review"?"disabled":""}>Pending</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="suspended" ${e.status==="suspended"?"disabled":""}>Suspend</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="canceled" ${e.status==="canceled"?"disabled":""}>Reject</button>
      </div>
    </article>
  `}function Eo(e){const t=de(e),a=Fa(e);return`
    <article class="panel span-2">
      <div class="section-head">
        <div><h2>Custom roles</h2><p>Discord-style roles for module, action, record, and field permissions.</p></div>
        <button class="btn btn-primary" type="button" data-action="open-role-form"><i class="ti ti-plus"></i>New role</button>
      </div>
      <div class="roles-list">
        ${t.map(n=>{const s=i.rolePermissions.filter(c=>c.role_id===n.id&&c.effect==="allow").length,o=i.roleAssignments.filter(c=>c.company_id===e&&c.role_id===n.id).length,l=a?.id===n.id;return`
            <article class="role-row" style="--role-color:${r(n.color)}">
              <span></span>
              <div><strong>${r(n.name)}</strong><small>${s||"All"} permissions / ${o} users / priority ${n.priority}</small></div>
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
      ${a?To(e,a):`
        <div class="section-head"><div><h2>Access preview</h2><p>Pick View as role to check sidebar, route, and action access.</p></div></div>
        ${v("No role preview selected.")}
      `}
    </article>
    <article class="panel span-3">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${i.fieldPermissions.filter(n=>n.company_id===e).map(n=>ze(n.field_key,n.resource_type,n.visibility,"")).join("")||v("No field permission overrides yet.")}
      </div>
    </article>
  `}function To(e,t){const a=st.filter(o=>o.status==="live"),n=a.filter(o=>Wa(t,o.permission||`${o.id}.view`)),s=a.filter(o=>!Wa(t,o.permission||`${o.id}.view`));return`
    <div class="section-head">
      <div><h2>Access preview</h2><p>${r(t.name)} sees ${n.length} of ${a.length} live modules.</p></div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
    ${H([["Preview role",t.name],["Allowed modules",n.map(o=>o.label).join(", ")||"None"],["Hidden modules",s.map(o=>o.label).join(", ")||"None"]])}
  `}function xo(e){return x("Settings","New role",`
    <form class="role-form" data-role-form>
      ${I("Role name","name","")}
      ${I("Color","color","#f0b23b",!1,"color")}
      ${I("Priority","priority","100",!1,"number")}
      <div class="permission-grid span-2">
        ${Ti.map(([t,a])=>`
          <label><input type="checkbox" name="permissions" value="${r(t)}" /> <span>${r(a)}</span></label>
        `).join("")}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Oo(e){const t=de(e).filter(n=>n.name.toLowerCase()!=="owner"),a=[["","Member"]].concat(t.map(n=>[n.id,n.name]));return x("Users","Create invite code",`
    <form class="role-form" data-invite-form>
      <input type="hidden" name="company_id" value="${r(e)}" />
      ${I("Email","email","",!0,"email")}
      ${U("Role","role_id",vd(e),a)}
      <div class="form-message span-2">Quest creates an invite code you can copy now. Email invite delivery will use this same record after SMTP/Resend is configured.</div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create invite code</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Ro(e){const t=ku(e),a=wt(e),n=i.formsTab==="builder"&&a?"builder":i.formsTab==="responses"?"responses":"library";return`
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
      ${n==="library"?Po(e,t,a):""}
      ${n==="builder"?Uo(e,a):""}
      ${n==="responses"?Wo(e,a):""}
    </section>
  `}function Po(e,t,a){return`
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${t.length} visible form${t.length===1?"":"s"} in ${r(T(e))}</span>
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
                <span>Created by ${r(Du(n))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${r(n.id)}" aria-expanded="${i.expandedFormIds.has(n.id)?"true":"false"}">
                <i class="ti ${i.expandedFormIds.has(n.id)?"ti-chevron-up":"ti-chevron-down"}"></i>
                ${i.expandedFormIds.has(n.id)?"Less":"Details"}
              </button>
              <span class="form-card-meta">
                <small>${r(n.type)} / ${r(n.audience||"Internal")}</small>
                <small>${er(n)} questions</small>
                <em>${Qa(n.id).length} responses</em>
                <em>Updated ${O(n.updated_at)}</em>
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
          `).join("")||v("No forms match this company view.")}
        </div>
      </article>
    </section>
  `}function Uo(e,t){if(!t)return`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${v("Create a form or choose a template to open the builder.")}
      </section>
    `;const a=["questions","responses","settings"].includes(i.formEditorTab)?i.formEditorTab:"questions";return`
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${r(a)}">
      ${No(t,a)}
      ${a==="questions"?`
        ${Lo(e,t)}
        ${Qo(t)}
      `:""}
      ${a==="settings"?`
        <article class="panel form-settings-panel forms-settings-wide">
          ${Vo(e,t)}
        </article>
      `:""}
      ${a==="responses"?Yo(e,t):""}
    </section>
  `}function No(e,t){const a=Qa(e.id);return`
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${r(e.title)}</strong>
        <span>${r(e.status)} / ${er(e)} questions / ${a.length} responses</span>
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
  `}function Lo(e,t){return`
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${r(t.theme_color||je(e))}"></div>
      ${dt("Form title","title",t.title,!0)}
      ${tr("Form description","description",t.description)}
      <div class="forms-simple-meta">
        <span>${r(t.status)}</span>
        <span>${r(t.type)}</span>
        <span>${r(t.audience||"Internal")}</span>
        <span>${r(P(t.linked_job_id)?.name||"Company level")}</span>
        <span>${r(T(e))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(t.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      </div>
    </article>
  `}function Qo(e){return`
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${qt.map(([t,a])=>`<button type="button" data-action="add-question" data-question-type="${r(t)}" title="${r(a)}" aria-label="Add ${r(a)} question"><i class="ti ${r(Cu(t))}"></i></button>`).join("")}
        </div>
        <div class="question-list">
          ${e.questions.map((t,a)=>Bo(t,a)).join("")||v("Add the first question.")}
        </div>
      </div>
    </article>
  `}function Vo(e,t){return`
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${dt("Title","title",t.title,!0)}
      ${Jt("Status","status",t.status,pn.map(a=>[a,a]))}
      ${tr("Description","description",t.description)}
      ${Jt("Type","type",t.type,jt.map(a=>[a,a]))}
      ${dt("Audience","audience",t.audience)}
      ${Jt("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(Q(e).map(a=>[a.id,a.name])))}
      ${dt("Theme color","theme_color",t.theme_color||je(e),!1,"color")}
      ${Jt("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
      ${dt("Submit button","submit_label",t.submit_label||"Submit")}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(t.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${r(t.id)}">Delete</button>
    </div>
  `}function Yo(e,t){const a=Qa(t.id),n=a[0]||null;return`
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
            <small>${O(s.created_at)}</small>
          </button>
        `).join("")||v("No responses yet. Submit a preview response from the builder.")}
      </div>
    </article>
    <aside class="panel response-detail">
      ${n?ar(n):v("No response selected.")}
    </aside>
  `}function Bo(e,t){const a=qt.map(([n,s])=>`<option value="${r(n)}" ${e.type===n?"selected":""}>${r(s)}</option>`).join("");return`
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
      ${$t(e)?`
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
  `}function Ho(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${r(t.id)}" style="--form-accent:${r(t.theme_color||je(e))}">
      <div class="designed-form-header">
        <span>${r(T(e))}</span>
        <h2>${r(t.title)}</h2>
        <p>${r(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>zo(a)).join("")||v("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${r(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function zo(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?ge(e,`<textarea name="${r(t)}" rows="3" ${a}></textarea>`):e.type==="date"?ge(e,`<input name="${r(t)}" type="date" ${a} />`):e.type==="file"?ge(e,`<input name="${r(t)}" type="file" ${a} />`):e.type==="yesno"?ge(e,`<select name="${r(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?ge(e,`<input name="${r(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?ge(e,`<select name="${r(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(n=>`<option>${r(n)}</option>`).join("")}</select>`):e.type==="checkbox"?ge(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="checkbox" value="${r(n)}" /> ${r(n)}</label>`).join("")}</div>`):e.type==="multiple"?ge(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="radio" value="${r(n)}" ${a} /> ${r(n)}</label>`).join("")}</div>`):ge(e,`<input name="${r(t)}" ${a} />`)}function Wo(e,t){const a=t?Qa(t.id):Xs(e),n=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(s=>`
            <button type="button" class="response-card">
              <strong>${r(Ae(s.form_id)?.title||"Unknown form")}</strong>
              <span>${r(s.submitted_by||s.submitter_email||"Anonymous")}</span>
              <small>${O(s.created_at)}</small>
            </button>
          `).join("")||v("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${n?ar(n):v("No response selected.")}
      </aside>
    </section>
  `}function Jo(e,t){const a=wd(t),n=Et(t),s=ae(t).filter(c=>c.status!=="done").length,o=me(Q(t),"estimate_total"),l=Sd(t);return`
    <section class="tool-page crm-page">
      ${G("CRM","Customers, contacts, and follow-ups built from company jobs.",`
        <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add customer job</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${M("Accounts",n.length)}
        ${M("Open jobs",Q(t).filter(c=>c.stage!=="Closed").length)}
        ${M("Open tasks",s)}
        ${M("Pipeline value",C(o))}
      </section>
      <section class="crm-toolbar panel">
        <label>
          <span>Search</span>
          <input data-crm-search value="${r(i.crmQuery)}" placeholder="Find customer, contact, job, or address" />
        </label>
        <label>
          <span>Stage</span>
          <select data-crm-stage-filter>
            ${["all"].concat(Dt).map(c=>`<option value="${r(c)}" ${i.crmStageFilter===c?"selected":""}>${r(c==="all"?"All stages":c)}</option>`).join("")}
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
          <div><h2>Customers</h2><p>${a.length} visible account${a.length===1?"":"s"} in ${r(T(t))}</p></div>
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
              <span>${C(c.estimateTotal)}</span>
              <span>${O(c.updatedAt)}</span>
            </a>
          `).join("")||v("No CRM accounts match this view. Add a customer job to start the list.")}
        </div>
      </section>
    </section>
  `}function Ko(e,t){const a=$d(e,t);if(!a)return x("CRM","Customer account",v("This customer is not visible in the current company view."));const n=a.latestJob,s=a.tasks.filter(o=>o.status!=="done");return x("CRM",a.name,`
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${r(a.name)}</h2>
            <p>${r(a.subtitle)}</p>
          </div>
          ${Ns(a.priority)}
        </div>
        ${H([["Primary contact",a.primaryContact],["Owner",a.owner],["Current stage",a.stage],["Pipeline value",C(a.estimateTotal)],["Open tasks",String(s.length)],["Last updated",O(a.updatedAt)]])}
      </section>
      <section class="crm-rollup-grid">
        ${M("Jobs",a.jobs.length)}
        ${M("Files",a.fileCount)}
        ${M("Forms",a.formCount)}
        ${M("Tasks",a.tasks.length)}
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
          ${s.slice(0,6).map(o=>Qn(o)).join("")||v("No open follow-ups for this customer.")}
        </div>
      </section>
    </div>
  `,"crm-modal")}function Go(e,t){const a=xe(t),n=ys(t);n&&i.selectedConversationId!==n.id&&(i.selectedConversationId=n.id);const s=!!(n&&e.params.get("conversation"));return su(t,n?.id||""),n&&Ua(n.id,!1),`
    <section class="tool-page messages-page ${s?"thread-open":""}">
      ${G("Messages","Company chats, role rooms, direct messages, and file sharing.",`
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      `)}
      <section class="messages-shell">
        <aside class="messages-list-panel panel">
          <div class="messages-tools">
            <label>
              <span>Search</span>
              <input data-message-search value="${r(i.messageQuery)}" placeholder="Find chats or messages" />
            </label>
            <div class="segmented message-filter" role="group" aria-label="Message filters">
              ${["all","unread","company","role","custom","direct"].map(o=>`
                <button type="button" data-action="set-message-filter" data-filter="${r(o)}" class="${i.messageFilter===o?"active":""}">${r(o==="all"?"All":F(o))}</button>
              `).join("")}
            </div>
          </div>
          <div class="conversation-list">
            ${a.map(o=>Zo(o,t,n?.id===o.id)).join("")||v("No conversations match this view.")}
          </div>
        </aside>
        <main class="messages-thread-panel panel">
          ${n?Xo(t,n):nl()}
        </main>
      </section>
      ${i.session?.auth==="local-basic"?il():""}
    </section>
  `}function Zo(e,t,a){const n=Oe(e.id).at(-1),s=gt(e.id);return`
    <a class="conversation-row ${a?"active":""}" href="${_(m("messages",{conversation:e.id},t))}" data-router>
      <span class="conversation-mark">${z(Bs(e.type))}</span>
      <span>
        <strong>${r(e.title)}</strong>
        <small>${r(n?.body||Hn(e)||"No messages yet")}</small>
      </span>
      <em>${n?lt(n.created_at):""}</em>
      ${s?`<b>${s}</b>`:""}
    </a>
  `}function Xo(e,t){const a=Oe(t.id),n=h("messages.send",e);return`
    <div class="thread-head">
      <a class="btn mobile-thread-back" href="${_(m("messages",{},e))}" data-router><i class="ti ti-arrow-left"></i>Chats</a>
      <div class="thread-title">
        <span>${z(Bs(t.type))}</span>
        <div>
          <h2>${r(t.title)}</h2>
          <p>${r(Hn(t))}</p>
        </div>
      </div>
      <div class="thread-actions">
        <button class="btn" type="button" data-action="message-search-results"><i class="ti ti-search"></i>Search</button>
        <button class="btn" type="button" data-action="message-details" data-conversation-id="${r(t.id)}"><i class="ti ti-info-circle"></i>Details</button>
        <button class="btn" type="button" data-action="manage-message-chat" data-conversation-id="${r(t.id)}" ${h("messages.manage_groups",e)||h("messages.manage",e)?"":"disabled"}><i class="ti ti-users"></i>Access</button>
      </div>
    </div>
    <div class="message-stream">
      ${a.map(s=>el(s)).join("")||v("No messages yet. Start the thread with a short update.")}
    </div>
    ${n?al(t):v("Your role can view this chat but cannot send messages.")}
  `}function el(e){const t=e.sender_profile_id===b().profile.id,a=eu(e.sender_profile_id),n=Kc(e.id);return`
    <article class="message-bubble ${t?"own":""}">
      ${te(a,"avatar message-avatar")}
      <div class="message-card">
        <div class="message-meta">
          <strong>${r(a.full_name||a.email||Rt(e.sender_profile_id))}</strong>
          <span>${lt(e.created_at)}</span>
          ${t&&h("messages.delete_own",e.company_id)||h("messages.delete_any",e.company_id)?`<button type="button" data-action="delete-message" data-message-id="${r(e.id)}"><i class="ti ti-trash"></i></button>`:""}
        </div>
        ${e.body?`<p>${nu(e.body)}</p>`:""}
        ${n.length?`<div class="message-attachments">${n.map(tl).join("")}</div>`:""}
      </div>
    </article>
  `}function tl(e){const t=e.mime_type.startsWith("image/");return`
    <button class="message-attachment" type="button" data-action="open-message-attachment" data-attachment-id="${r(e.id)}">
      ${e.preview_url&&t?`<img src="${r(e.preview_url)}" alt="" />`:z(t?"q-message-image":"q-message-file")}
      <span><strong>${r(e.file_name)}</strong><small>${r(iu(e.size_bytes))}</small></span>
    </button>
  `}function al(e){return`
    <form class="message-composer" data-message-form data-conversation-id="${r(e.id)}">
      <input name="body" placeholder="Message ${r(e.title)}" autocomplete="off" />
      <label class="icon-button message-attach-button" title="Attach file">
        <i class="ti ti-paperclip"></i>
        <input name="attachments" type="file" multiple ${h("messages.attach_files",e.company_id)?"":"disabled"} />
      </label>
      <button class="btn btn-primary" type="submit"><i class="ti ti-send"></i>Send</button>
    </form>
  `}function nl(e){return`
    <div class="messages-empty-panel">
      ${z("q-symbol-messages")}
      <h2>No chat selected</h2>
      <p>Create a group chat, direct message a teammate, or pick a conversation from the list.</p>
      <div class="head-actions">
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      </div>
    </div>
  `}function il(e){return`
    <div class="message-scenario">
      <button class="btn btn-primary" type="button" data-action="run-message-scenario"><i class="ti ti-sparkles"></i>Demo scenario</button>
      <button class="btn" type="button" data-action="reset-message-demo"><i class="ti ti-refresh"></i>Reset</button>
    </div>
  `}function sl(e){const t=ie(e);return x("Messages","New group chat",`
    <form class="message-modal-form" data-message-group-form>
      ${I("Chat name","title","",!0)}
      ${U("Type","type","custom",[["company","Company-wide"],["role","Role-based"],["custom","Custom group"]])}
      ${os(e,[])}
      ${ls(t,[])}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create group</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function rl(e){const t=ie(e).filter(a=>(a.profile_id||a.member_id)!==b().profile.id);return x("Messages","New direct message",`
    <form class="message-modal-form" data-direct-message-form>
      ${U("Person","profile_id",t[0]?.profile_id||t[0]?.member_id||"",t.map(a=>[a.profile_id||a.member_id,a.name]))}
      <label><span>First message</span><textarea name="body" rows="3" placeholder="Start with a short note"></textarea></label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Start chat</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function ol(e,t){const a=i.messageConversations.find(l=>l.id===t);if(!a)return x("Messages","Chat access",v("Conversation not found."));const n=Aa(a.id),s=n.filter(l=>l.target_type==="role").map(l=>l.target_id),o=n.filter(l=>l.target_type==="profile").map(l=>l.target_id);return x("Messages","Chat access",`
    <form class="message-modal-form" data-message-access-form data-conversation-id="${r(a.id)}">
      ${I("Chat name","title",a.title,!0)}
      ${U("Type","type",a.type,[["company","Company-wide"],["role","Role-based"],["custom","Custom group"],["direct","Direct message"]])}
      ${os(e,s)}
      ${ls(ie(e),o)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save access</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function os(e,t=[]){const a=new Set(t);return`
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>Roles</strong>
        <small>Good for large crews. Access updates when role assignments change.</small>
      </div>
      <div class="message-role-grid">
        ${de(e).map(n=>`
          <label class="message-role-option" style="--role-color:${r(n.color)}">
            <input type="checkbox" name="role_ids" value="${r(n.id)}" ${a.has(n.id)?"checked":""} />
            <span></span>
            <strong>${r(n.name)}</strong>
          </label>
        `).join("")}
      </div>
    </section>
  `}function ls(e,t=[]){const a=new Set(t),n=e.slice().sort((s,o)=>Ve(s).localeCompare(Ve(o)));return`
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
        ${n.filter(s=>a.has(s.profile_id||s.member_id)).slice(0,8).map(s=>`
          <span>${te(ki(s),"avatar tiny-avatar")} ${r(Ve(s))}</span>
        `).join("")||"<small>No individual people selected.</small>"}
      </div>
      <div class="message-people-list">
        ${n.map(s=>{const o=s.profile_id||s.member_id;return`
            <label class="message-person-row" data-message-person-row data-filter-text="${r([Ve(s),s.email,s.role_label,s.role].join(" ").toLowerCase())}">
              <input type="checkbox" name="profile_ids" value="${r(o)}" ${a.has(o)?"checked":""} />
              ${te(ki(s),"avatar message-person-avatar")}
              <span>
                <strong>${r(Ve(s))}</strong>
                <small>${r(tu(s))}</small>
              </span>
            </label>
          `}).join("")||v("No people available in this company yet.")}
      </div>
    </section>
  `}function ll(e,t){const a=i.messageConversations.find(n=>n.id===t);return a?x("Messages",a.title,`
    ${H([["Type",F(a.type)],["Access",Hn(a)],["Messages",String(Oe(a.id).length)],["Attachments",String(Jc(a.id).length)],["Last message",O(a.last_message_at)]])}
  `,"message-modal"):x("Messages","Chat details",v("Conversation not found."))}function cl(e){const t=i.messageQuery.trim().toLowerCase(),a=xe(e).flatMap(n=>Oe(n.id).filter(s=>!t||s.body.toLowerCase().includes(t)).map(s=>({conversation:n,message:s})));return x("Messages","Search results",`
    <div class="queue-list">
      ${a.slice(0,30).map(({conversation:n,message:s})=>`
        <a class="queue-row" href="${_(m("messages",{conversation:n.id},e))}" data-router>
          <span><strong>${r(n.title)}</strong><small>${r(s.body||"Attachment")}</small></span>
          <em>${lt(s.created_at)}</em>
        </a>
      `).join("")||v("No matching messages. Type in the Messages search box first.")}
    </div>
  `,"message-modal")}function dl(e,t){const a=xs(t),n=_e(t),s=Is(t).slice().sort(St("received_at")).slice(0,5),o=Mn(t).slice().sort(St("spent_at")).slice(0,5),l=In(t).slice().sort((d,f)=>d.name.localeCompare(f.name)).slice(0,5),c=h("finance.manage",t);return`
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
          ${[["Current",a.aging.current],["1-30",a.aging.thirty],["31-60",a.aging.sixty],["61+",a.aging.overSixty]].map(([d,f])=>`<div><span>${r(d)}</span><strong>${C(f)}</strong></div>`).join("")}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${n.length} billing record${n.length===1?"":"s"} for ${r(T(t))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${n.map(d=>`
            <a class="table-row" href="${_(m("finance",{invoice:d.id},t))}" data-router>
              <span><strong>${r(d.invoice_number)}</strong><small>${r(d.client_name||P(d.job_id)?.client_name||"No client")}</small></span>
              <span>${Gd(Ts(d))}</span>
              <span>${r(P(d.job_id)?.name||"Company level")}</span>
              <span>${O(d.due_date)}</span>
              <span>${C(d.total)}</span>
              <span>${C(En(d.id))}</span>
              <span>${C(pe(d.id))}</span>
            </a>
          `).join("")||v("No invoices yet. Create one from a job or customer record.")}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${s.map(d=>ze(Pe(d.invoice_id)?.invoice_number||"Payment",d.method,C(d.amount),d.received_at)).join("")||v("No payments recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${o.map(d=>ze(Ka(d.vendor_id),d.category,C(d.amount),d.spent_at,m("finance",{expense:d.id},t))).join("")||v("No expenses recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${l.map(d=>ze(d.name,d.category,d.status,d.updated_at,m("finance",{vendor:d.id},t))).join("")||v("No vendors recorded.")}
          </div>
        </article>
      </section>
      ${c?"":'<p class="small-note">Your role can view finance records. Creating or editing invoices, payments, expenses, and vendors requires finance manage permission.</p>'}
    </section>
  `}function ul(e,t){return e.params.get("invoice")?ml(t,e.params.get("invoice")):e.params.get("expense")?pl(t,e.params.get("expense")):e.params.get("vendor")?fl(t,e.params.get("vendor")):e.params.get("report")==="summary"?gl(t):""}function ml(e,t){const a=Pe(t);if(!a||a.company_id!==e)return x("Finance","Invoice",v("Invoice not found."));const n=Es(a.id),s=P(a.job_id);return x("Finance",a.invoice_number,`
    <div class="finance-detail-modal">
      ${H([["Client",a.client_name||s?.client_name||"No client"],["Status",Ts(a)],["Job",s?.name||"Company level"],["Issued",O(a.issue_date)],["Due",O(a.due_date)],["Total",C(a.total)],["Collected",C(En(a.id))],["Balance",C(pe(a.id))]])}
      <div class="finance-modal-actions">
        ${h("finance.manage",e)?`
          <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${r(a.id)}"><i class="ti ti-cash"></i>Record payment</button>
          <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        `:""}
        ${s?`<a class="btn" href="${_(m("jobs",{tab:"profile",job_id:s.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${n.length} payment${n.length===1?"":"s"} applied.</p></div></div>
        <div class="finance-compact-list">
          ${n.map(o=>ze(o.reference||o.method,o.method,C(o.amount),o.received_at)).join("")||v("No payments yet.")}
        </div>
      </section>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function pl(e,t){const a=Fs(t);if(!a||a.company_id!==e)return x("Finance","Expense",v("Expense not found."));const n=P(a.job_id);return x("Finance",`${Ka(a.vendor_id)} expense`,`
    <div class="finance-detail-modal">
      ${H([["Vendor",Ka(a.vendor_id)],["Category",a.category],["Status",a.status],["Job",n?.name||"Company level"],["Spent",O(a.spent_at)],["Amount",C(a.amount)]])}
      <div class="finance-modal-actions">
        ${h("finance.manage",e)?`<button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit expense</button>`:""}
        ${n?`<a class="btn" href="${_(m("files",{job_id:n.id},e))}" data-router><i class="ti ti-folder"></i>Job files</a>`:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function fl(e,t){const a=Fn(t);if(!a||a.company_id!==e)return x("Finance","Vendor",v("Vendor not found."));const n=Mn(e).filter(s=>s.vendor_id===a.id);return x("Finance",a.name,`
    <div class="finance-detail-modal">
      ${H([["Contact",a.contact_name||"No contact"],["Email",a.email||"No email"],["Phone",a.phone||"No phone"],["Category",a.category],["Status",a.status],["Spend",C(me(n,"amount"))]])}
      <div class="finance-modal-actions">
        ${h("finance.manage",e)?`
          <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
          <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${r(a.id)}"><i class="ti ti-receipt"></i>Add expense</button>
        `:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function gl(e){const t=xs(e);return x("Finance","Summary report",`
    <div class="finance-report-modal">
      ${H([["Company",T(e)],["Estimated pipeline",C(t.pipeline)],["Invoiced",C(t.invoiced)],["Collected",C(t.collected)],["Outstanding",C(t.outstanding)],["Expenses",C(t.expenses)],["Net position",C(t.net)]])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${C(t.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${C(t.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${C(t.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${C(t.aging.overSixty)}</strong></div>
      </div>
    </div>
  `,"finance-modal")}function ci(e,t=null){const a=t||Nd(e);return x("Finance",t?"Edit invoice":"New invoice",`
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${I("Invoice number","invoice_number",a.invoice_number,!0)}
      ${U("Linked job","job_id",a.job_id||"",[["","Company level"]].concat(Q(e).map(n=>[n.id,n.name])))}
      ${I("Client","client_name",a.client_name,!0)}
      ${U("Status","status",a.status,Ri.map(n=>[n,n]))}
      ${I("Issue date","issue_date",a.issue_date,!1,"date")}
      ${I("Due date","due_date",a.due_date,!1,"date")}
      ${I("Subtotal","subtotal",a.subtotal,!1,"number")}
      ${I("Tax","tax",a.tax,!1,"number")}
      ${ke("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function bl(e,t=""){const a=Ld(e,t),n=_e(e).map(s=>[s.id,`${s.invoice_number} - ${s.client_name||P(s.job_id)?.client_name||"No client"}`]);return x("Finance","Record payment",`
    <form class="finance-form" data-finance-payment-form>
      ${U("Invoice","invoice_id",a.invoice_id,n.length?n:[["","Create an invoice first"]])}
      ${I("Amount","amount",a.amount,!0,"number")}
      ${U("Method","method",a.method,Ni.map(s=>[s,s]))}
      ${I("Received","received_at",a.received_at,!1,"date")}
      ${I("Reference","reference",a.reference)}
      ${ke("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function di(e,t=null,a=""){const n=t||Qd(e,a),s=In(e).map(o=>[o.id,o.name]);return x("Finance",t?"Edit expense":"Add expense",`
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${r(n.id)}" />
      ${U("Vendor","vendor_id",n.vendor_id,s.length?s:[["","No vendor yet"]])}
      ${U("Linked job","job_id",n.job_id||"",[["","Company level"]].concat(Q(e).map(o=>[o.id,o.name])))}
      ${U("Category","category",n.category,ka.map(o=>[o,o]))}
      ${U("Status","status",n.status,Pi.map(o=>[o,o]))}
      ${I("Amount","amount",n.amount,!0,"number")}
      ${I("Spent date","spent_at",n.spent_at,!1,"date")}
      ${ke("Notes","notes",n.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function ui(e,t=null){const a=t||Vd(e);return x("Finance",t?"Edit vendor":"Add vendor",`
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${I("Vendor name","name",a.name,!0)}
      ${I("Contact","contact_name",a.contact_name)}
      ${I("Email","email",a.email,!1,"email")}
      ${I("Phone","phone",a.phone)}
      ${U("Category","category",a.category,ka.map(n=>[n,n]))}
      ${U("Status","status",a.status,Ui.map(n=>[n,n]))}
      ${ke("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function _l(e,t){return e.section==="clock"?Sl(t):e.section==="calendar"?vl(e,t):e.section==="approvals"?kl(t):$l(t)}function Ca(e,t){return`
    ${hn("Operations sections",[[m("time",{},e),"My time",t==="time"],[m("calendar",{},e),"Calendar",t==="calendar"],[m("approvals",{},e),"Approvals",t==="approvals"],[m("clock",{},e),"Clock dashboard",t==="clock"]])}
  `}function vl(e,t){const a=Xc(t),n=Ma(t),s=a.filter(d=>d.dateKey===k(0)),o=n.filter(d=>d.mine),l=n.filter(d=>d.source!=="manual").length,c=h("calendar.manage",t);return`
    <section class="tool-page operations-page calendar-page">
      ${G("Calendar","Company schedule built from tasks, approvals, finance due dates, time context, and manual events.",`
        <button class="btn btn-primary" type="button" data-action="open-calendar-event-form"><i class="ti ti-calendar-plus"></i>New event</button>
      `)}
      ${Ca(t,"calendar")}
      <section class="metric-grid operations-metrics calendar-metrics">
        ${M("Today",s.length)}
        ${M("This week",cd(a).length)}
        ${M("Mine",o.length)}
        ${M("From modules",l)}
      </section>
      <section class="workspace-toolbar calendar-toolbar">
        <div class="segmented" role="group" aria-label="Calendar scope">
          <button class="${i.calendarScope==="company"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="company"><i class="ti ti-building"></i>Company</button>
          <button class="${i.calendarScope==="me"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="me"><i class="ti ti-user"></i>Me</button>
        </div>
        <div class="segmented" role="group" aria-label="Calendar view">
          ${["month","week","list"].map(d=>`<button class="${i.calendarView===d?"active":""}" type="button" data-action="set-calendar-view" data-view="${r(d)}">${r(F(d))}</button>`).join("")}
        </div>
        <label class="wide-control">
          <span>Search</span>
          <input data-calendar-search value="${r(i.calendarQuery)}" placeholder="Find events, jobs, tasks, or people" />
        </label>
        <label>
          <span>Type</span>
          <select data-calendar-type-filter>
            <option value="all">All types</option>
            ${br.map(d=>`<option value="${r(d)}" ${i.calendarTypeFilter===d?"selected":""}>${r(d)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="calendar-nav">
        <div>
          <button class="btn" type="button" data-action="calendar-prev"><i class="ti ti-chevron-left"></i></button>
          <button class="btn" type="button" data-action="calendar-today">Today</button>
          <button class="btn" type="button" data-action="calendar-next"><i class="ti ti-chevron-right"></i></button>
        </div>
        <strong>${r(md())}</strong>
      </section>
      <section class="calendar-shell">
        <article class="panel calendar-main">
          ${i.calendarView==="month"?yl(t,a):""}
          ${i.calendarView==="week"?hl(t,a):""}
          ${i.calendarView==="list"?wl(t,a):""}
        </article>
        <aside class="panel calendar-agenda">
          <div class="section-head"><div><h2>Agenda</h2><p>Next events that match this view.</p></div></div>
          <div class="calendar-agenda-list">
            ${a.slice(0,9).map(ds).join("")||v("No calendar items match this view.")}
          </div>
        </aside>
      </section>
      ${c?"":'<p class="small-note">Your role can view the calendar. Manual company events require calendar manage permission.</p>'}
    </section>
  `}function yl(e,t){const a=ud(i.calendarCursorDate),n=new Date(`${i.calendarCursorDate}T00:00:00`).getMonth();return`
    <div class="calendar-grid calendar-month-grid">
      ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(s=>`<div class="calendar-weekday">${s}</div>`).join("")}
      ${a.map(s=>{const o=Ss(t,s.key);return`
          <div class="calendar-day ${s.month===n?"":"muted"} ${s.key===k(0)?"today":""}">
            <div class="calendar-day-head"><b>${s.label}</b><span>${o.length||""}</span></div>
            ${o.slice(0,3).map(cs).join("")}
            ${o.length>3?`<small class="calendar-more">+${o.length-3} more</small>`:""}
          </div>
        `}).join("")}
    </div>
  `}function hl(e,t){return`
    <div class="calendar-grid calendar-week-grid">
      ${ks(i.calendarCursorDate).map(n=>{const s=Ss(t,n.key);return`
          <div class="calendar-day ${n.key===k(0)?"today":""}">
            <div class="calendar-day-head"><b>${r(n.name)}</b><span>${r(n.shortDate)}</span></div>
            ${s.map(cs).join("")||'<small class="calendar-empty-day">Open</small>'}
          </div>
        `}).join("")}
    </div>
  `}function wl(e,t){const a=pd(t);return`
    <div class="calendar-list">
      ${Object.entries(a).slice(0,18).map(([s,o])=>`
        <section class="calendar-list-day">
          <h3>${r(O(s))}</h3>
          ${o.map(ds).join("")}
        </section>
      `).join("")||v("No scheduled work or events.")}
    </div>
  `}function cs(e){return`
    <button class="calendar-pill ${r(fd(e.type))}" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <span>${r(Ds(e))}</span>
      <strong>${r(e.title)}</strong>
    </button>
  `}function ds(e){return`
    <button class="calendar-agenda-item" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <i class="ti ${r(gd(e.type))}"></i>
      <span><strong>${r(e.title)}</strong><small>${r(`${O(e.dateKey)} · ${Ds(e)} · ${e.type}`)}</small></span>
    </button>
  `}function $l(e){const t=qs(e),a=Tt(e);return`
    <section class="tool-page operations-page">
      ${G("My time","A compact personal work queue built from this company's tasks.",`
        <a class="btn" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Ca(e,"time")}
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
            ${t.focus.slice(0,8).map(n=>Qn(n)).join("")||v("No time-sensitive tasks for this company.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
          ${H([["Company",T(e)],["Assigned to you",String(t.assignedToMe.length)],["Due this week",String(t.thisWeek.length)],["Completed",String(t.done.length)]])}
        </article>
      <article class="panel span-2">
          <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
          <div class="data-table operations-table">
            <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
            ${t.thisWeek.slice(0,8).map(n=>`
              <a class="table-row" href="${_(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},e))}" data-router>
                <span><strong>${r(n.title)}</strong><small>${r(n.description||Le(n.type))}</small></span>
                <span>${r(P(n.project_id)?.name||"Company task")}</span>
                <span>${r(B(n.assignee_id))}</span>
                <span>${O(n.due)}</span>
                <span>${Ls(n.status)}</span>
              </a>
            `).join("")||v("No upcoming tasks this week.")}
          </div>
        </article>
      </section>
    </section>
  `}function Sl(e){const t=As(e),a=Tt(e),n=Yt().getTime(),s=n-6*864e5,o=hi(e,n)+(a?Date.now()-Date.parse(a.started_at):0),l=hi(e,s)+(a?Date.now()-Date.parse(a.started_at):0);return`
    <section class="tool-page operations-page clock-page">
      ${G("Clock dashboard","Local basic-mode clock tracking for the active company.",`
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${Ca(e,"clock")}
      <section class="metric-grid operations-metrics">
        ${M("Today",Gt(o))}
        ${M("Last 7 days",Gt(l))}
        ${M("Entries",t.length)}
        ${M("Status",a?"Clocked in":"Off clock")}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${a?H([["User",B(a.user_id)],["Started",ua(a.started_at)],["Task",a.task_title||"General shift"],["Elapsed",Gt(Date.now()-Date.parse(a.started_at))]]):v("Nobody is clocked in on this device.")}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${t.slice(0,10).map(c=>`
              <div class="table-row">
                <span><strong>${r(c.task_title||"General shift")}</strong><small>${r(c.notes||"Clock entry")}</small></span>
                <span>${r(B(c.user_id))}</span>
                <span>${ua(c.started_at)}</span>
                <span>${Gt(c.duration_ms)}</span>
              </div>
            `).join("")||v("No clock entries yet.")}
          </div>
        </article>
      </section>
    </section>
  `}function kl(e){const t=qn(e),a=t.filter(o=>o.type==="Form approval"),n=t.filter(o=>o.type==="Task review"),s=t.filter(o=>o.type==="Access request");return`
    <section class="tool-page operations-page">
      ${G("Approvals","Company review queue for forms, task handoffs, and access requests.",`
        <a class="btn" href="${_(m("forms",{},e))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${Ca(e,"approvals")}
      <section class="metric-grid operations-metrics">
        ${M("Open approvals",t.length)}
        ${M("Forms",a.length)}
        ${M("Task reviews",n.length)}
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
              <span>${O(o.updatedAt)}</span>
            </a>
          `).join("")||v("No approvals need attention right now.")}
        </div>
      </section>
    </section>
  `}function mi(e){return`
    ${G(F(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${v("Module data model pending.")}
    </section>
  `}function pi(e=!1){document.title="Quest HQ | Company operations workspace";const t=i.route||Mt(),a=ja(t.params.get("return_url")||_(m("jobs",{},L()))),n=String(t.params.get("invite")||"").trim(),s=String(t.params.get("auth")||"").trim(),o=us(t.params.get("mode")||s,n);o&&i.authMode!==o&&(i.authMode=o),n&&!["signin","register"].includes(i.authMode)&&(i.authMode="register");const l=e||!!(n||s),c=i.session;Da.innerHTML=`
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
          <img class="landing-console-art" src="${r(mr)}" alt="Generated Quest HQ secure workspace cockpit preview showing company access, tasks, messages, finance, files, users, reports, and audit controls." />
          <aside class="landing-console-rail" aria-hidden="true">
            <span class="console-mark">Q</span>
            ${[["ti-home","Home",!0],["ti-list-check","Tasks"],["ti-calendar","Calendar"],["ti-users","CRM"],["ti-lock-dollar","Finance"],["ti-folder","Files"],["ti-forms","Forms"],["ti-message-circle","Messages",!1,"3"],["ti-user-cog","Users"],["ti-report-analytics","Reports"],["ti-settings","Settings"],["ti-clipboard-check","Audit"]].map(([d,f,g,S])=>`
              <span class="${g?"active":""}"><i class="ti ${r(d)}"></i>${r(f)}${S?`<b>${r(S)}</b>`:""}</span>
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
              ${[["ti-shield-check","Company access","Pending approval","Approval required before modules open.","View status"],["ti-user-check","Active users","24","18 active · 6 pending","Manage users"],["ti-circle-check","Open tasks","42","12 overdue","View tasks"],["ti-message-circle","Unread messages","8","Across team chats","Open inbox"]].map(([d,f,g,S,V],E)=>`
                <article class="${E===0?"warning":""}">
                  <i class="ti ${r(d)}"></i>
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
      ${l?Dl(a,n):""}
      ${ms()}
    </main>
  `}function Dl(e,t,a){const n=Md(t);return`
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
            ${Cl(t)}
            ${ql(e)}
          `}
          <details class="demo-mode-details">
            <summary>Demo mode</summary>
            ${jl(e)}
          </details>
          
        </div>
      </div>
    </div>
  `}function us(e,t=""){const a=String(e||"").toLowerCase().trim();return t&&!a?"register":["signin","register","invite","request"].includes(a)?a:a==="business"?"register":a==="worker"?t?"register":"invite":""}function Cl(e=""){const t=i.authMode;return`
    <nav class="auth-mode-bar" aria-label="Account access">
      ${(e?[["signin","Sign in"],["register","Create invited account"]]:[["signin","Sign in"],["register","Create workspace"],["invite","Join with invite"]]).map(([n,s])=>`
        <button class="${t===n?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="${r(n)}">${r(s)}</button>
      `).join("")}
    </nav>
  `}function jl(e){return`
    <section class="demo-mode-box">
      <div>
        <strong>Demo mode</strong>
        <span>Local-only sample workspace. No Supabase database reads or writes.</span>
      </div>
      <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${r(e)}">Open demo mode</button>
    </section>
  `}function ql(e){const t=String(i.route?.params?.get("invite")||"").trim();return i.authMode==="register"?`
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
        ${zt(t?"Workers cannot create access without a valid invite code.":"You become Owner, then Quest approves billing/access before the workspace opens.")}
        ${t?'<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="signin">I already have an account</button>':""}
      </form>
    `:i.authMode==="invite"?`
      <form class="auth-form-compact" data-auth-invite-code-form>
        <div class="auth-form-title">
          <strong>Join with invite code</strong>
          <span>Workers need a code from their company admin.</span>
        </div>
        <label>Invite code<input name="invite_code" autocomplete="one-time-code" required placeholder="Paste the code from your admin" /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Continue with invite code</button>
        ${zt("Invite codes are shared by your Owner/Admin. No email delivery required.")}
      </form>
    `:i.authMode==="request"?`
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
        ${zt("Requests stay pending until a company Owner/Admin approves them.")}
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
      ${zt(t?"If you do not have an account yet, create an invited worker account.":"Business owners and workers use the same sign in after access is created.")}
      ${t?'<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="register">Create invited account</button>':""}
    </form>
  `}function zt(e){return i.loginError?`<div class="form-message error">${r(i.loginError)}</div>`:`<div class="form-message">${r(i.authMessage||e)}</div>`}function Al(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${te(e,"avatar large")}
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
  `}function Ml(e,t){if(i.modal==="profile")return Al(t.profile);if(i.modal==="file-upload")return So();if(i.modal==="folder-new")return $o();if(i.modal==="file-detail")return Tl(u());if(i.modal==="forms-tools")return xl(u());if(i.modal==="form-actions")return Ul(u(),wt(u()));if(i.modal==="form-new")return Ol(u());if(i.modal==="form-preview")return Pl(u(),wt(u()));if(i.modal==="job-new")return Ba(u(),null);if(i.modal==="job-edit")return Ba(u(),Ee());if(i.modal==="finance-invoice-new")return ci(u(),null);if(i.modal==="finance-invoice-edit")return ci(u(),Pe(i.selectedFinanceInvoiceId));if(i.modal==="finance-payment-new")return bl(u(),i.selectedFinanceInvoiceId);if(i.modal==="finance-expense-new")return di(u(),null,i.selectedFinanceVendorId);if(i.modal==="finance-expense-edit")return di(u(),Fs(i.selectedFinanceExpenseId));if(i.modal==="finance-vendor-new")return ui(u(),null);if(i.modal==="finance-vendor-edit")return ui(u(),Fn(i.selectedFinanceVendorId));if(i.modal==="role-new")return xo(u());if(i.modal==="invite-new")return Oo(u());if(i.modal==="message-group-new")return sl(u());if(i.modal==="message-direct-new")return rl(u());if(i.modal==="message-access")return ol(u(),i.selectedConversationId);if(i.modal==="message-details")return ll(u(),i.selectedConversationId);if(i.modal==="message-search")return cl(u());if(i.modal==="calendar-event-detail")return El(u());if(i.modal==="calendar-event-new")return fi(u(),null);if(i.modal==="calendar-event-edit")return fi(u(),Ft(i.selectedCalendarEventId));if(e.name==="company"&&e.section==="crm"&&e.params.get("account"))return Ko(e.companyId,e.params.get("account"));if(e.name==="company"&&e.section==="finance"){const a=ul(e,e.companyId);if(a)return a}return e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"?Ba(e.companyId,e.jobId?P(e.jobId):Ee()):e.name==="company"&&e.section==="tasks"?Fl(e,e.companyId):""}function ms(){return i.toast?`
    <div class="app-toast ${r(i.toast.mode||"local")}" role="status" aria-live="polite">
      <strong>${r(i.toast.title||"Quest HQ")}</strong>
      <span>${r(i.toast.message||"")}</span>
    </div>
  `:""}function $(e,t="local",a="Not available yet"){i.toastTimer&&clearTimeout(i.toastTimer),i.toast={title:a,message:e,mode:t},p(),i.toastTimer=setTimeout(()=>{i.toast=null,i.toastTimer=null,p()},4200)}function x(e,t,a,n=""){return`
    <div class="modal-overlay">
      <div class="modal-panel ${r(n)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </div>
    </div>
  `}function Il(e,t,a){return`
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </aside>
    </div>
  `}function Ba(e,t){return x("Jobs",t?"Edit job":"Create job",io(e,t),"wide-modal")}function Fl(e,t){const a=e.jobId?P(e.jobId):null,n=e.params.get("task_id")||"",s=n?qa(n):null;return e.params.get("new")==="1"?x("Tasks","New task",li(t,a,null),"task-modal"):e.params.get("edit")==="1"&&s?x("Tasks","Edit task",li(t,a,s),"task-modal"):s?Il("Task detail",s.title,co(t,s)):""}function El(e){const t=od(i.selectedCalendarEventId,e);if(!t)return"";const a=t.source==="manual"?Ft(t.sourceId):null,n=[t.href?`<a class="btn btn-primary" href="${_(t.href)}" data-router><i class="ti ti-arrow-right"></i>Open source</a>`:"",a&&t.editable?`<button class="btn" type="button" data-action="edit-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit</button>`:"",a&&t.editable?`<button class="btn danger" type="button" data-action="delete-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-trash"></i>Delete</button>`:""].filter(Boolean).join("");return x("Calendar",t.title,`
    <div class="calendar-detail">
      ${H([["Type",t.type],["When",t.allDay?O(t.dateKey):`${ua(t.startsAt)}${t.endsAt&&t.endsAt!==t.startsAt?` - ${ua(t.endsAt)}`:""}`],["Assigned",t.owner||"Unassigned"],["Source",t.source==="manual"?"Manual event":F(t.source)],["Linked",t.linkLabel||"None"]])}
      ${t.description?`<p>${r(t.description)}</p>`:""}
      <div class="modal-actions">${n||'<span class="small-note">This derived item opens from its source module.</span>'}</div>
    </div>
  `,"calendar-modal")}function fi(e,t){const a=t||Yd(e),n=a.linked_type==="job"?a.linked_id:"";return x("Calendar",t?"Edit event":"New event",`
    <form class="calendar-form" data-calendar-event-form>
      <input type="hidden" name="id" value="${r(t?.id||"")}" />
      ${I("Title","title",t?a.title:"",!0)}
      ${U("Type","event_type",a.event_type,Sa.map(s=>[s,s]))}
      ${I("Starts","starts_at",$i(a.starts_at),!0,"datetime-local")}
      ${I("Ends","ends_at",$i(a.ends_at||a.starts_at),!0,"datetime-local")}
      <label class="check-row"><input type="checkbox" name="all_day" ${a.all_day?"checked":""} /> All day</label>
      ${U("Visibility","visibility",a.visibility,[["company","Company"],["private","Private / assigned"]])}
      ${U("Assigned to","assigned_profile_id",a.assigned_profile_id,Zd(e))}
      ${U("Linked job","linked_job_id",n,[["","No linked job"]].concat(Q(e).map(s=>[s.id,s.name])))}
      <label class="span-2">Description<textarea name="description" rows="4">${r(a.description)}</textarea></label>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save event</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"calendar-form-modal")}function Tl(e){const t=i.selectedFileId?i.files.find(a=>a.id===i.selectedFileId):null;return t?x("Open file",t.file_name,ho(t,e),"file-viewer-modal"):""}function xl(e){return x("Forms","Tools",`
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${i.formTypeFilter==="all"?"selected":""}>All types</option>
          ${jt.map(t=>`<option value="${r(t)}" ${i.formTypeFilter===t?"selected":""}>${r(t)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `)}function Ol(e){const t=i.formStartTab==="templates"?"templates":"blank",a=mt(),n=t==="templates"&&(a.find(d=>d.id===i.formStartTemplateId)||a[0])||null,s=n?.title||"",o=n?.description||"",l=n?.type||"Internal",c=n?.questions||[{type:"short",label:"First question",required:!1,options:[]}];return x("Forms","New form builder",`
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
            <div class="gform-accent-strip" style="--form-accent:${r(je(e))}"></div>
            <label><span>Form title</span><input name="title" value="${r(s)}" placeholder="Untitled form" required /></label>
            <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${r(o)}</textarea></label>
          </article>
          <div class="new-form-question-list">
            ${c.map((d,f)=>Rl(d,f)).join("")}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${n?r(n.title):"Blank starter"}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${jt.map(d=>`<option value="${r(d)}" ${d===l?"selected":""}>${r(d)}</option>`).join("")}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${Q(e).map(d=>`<option value="${r(d.id)}" ${i.route?.jobId===d.id?"selected":""}>${r(d.name)}</option>`).join("")}</select></label>
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
  `,"form-create-modal builder-modal")}function Rl(e,t){const a=$t(e)?`
    <div class="starter-options">
      ${(e.options||["Option 1","Option 2"]).map(n=>`<span>${r(n)}</span>`).join("")}
    </div>
  `:"";return`
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${t+1}</span>
        <strong>${r(ju(e.type))}</strong>
      </div>
      <label><span>Question</span><input value="${r(e.label||"Untitled question")}" readonly /></label>
      ${e.help?`<small>${r(e.help)}</small>`:""}
      ${a}
      <label class="check-row"><input type="checkbox" ${e.required?"checked":""} disabled /> Required</label>
    </article>
  `}function Pl(e,t){return t?x("Forms","Preview form",`
    <div class="form-preview-modal-body">
      ${Ho(e,t)}
    </div>
  `,"form-preview-modal"):x("Forms","Preview form",v("Choose a form first."))}function Ul(e,t){return t?x("Forms","Manage form",`
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
  `):x("Forms","Manage form",v("Choose a form first."))}function Nl(e){const t=i.accountMenuOpen&&!e.target.closest(".account-menu"),a=i.notificationMenuOpen&&!e.target.closest(".notification-center");t&&(i.accountMenuOpen=!1),a&&(i.notificationMenuOpen=!1);const n=e.target.closest("[data-action]");if(n){Ll(e,n);return}const s=e.target.closest("[data-select-job]");if(s){e.preventDefault(),zc(s.dataset.selectJob);return}const o=e.target.closest("[data-select-task]");if(o){e.preventDefault(),Wc(o.dataset.selectTask);return}const l=e.target.closest("a[href][data-router]");if(!l){(t||a)&&p();return}l.target||l.hasAttribute("download")||(e.preventDefault(),j(l.getAttribute("href")))}function Ll(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),i.dataLoaded=!1,i.sync={label:"Refreshing...",mode:"loading"},p();return}if(a==="sign-out"){e.preventDefault(),i.accountMenuOpen=!1,Yl();return}if(a==="toggle-account-menu"){e.preventDefault(),i.accountMenuOpen=!i.accountMenuOpen,i.notificationMenuOpen=!1,p();return}if(a==="toggle-notifications"){e.preventDefault(),i.notificationMenuOpen=!i.notificationMenuOpen,i.accountMenuOpen=!1,p();return}if(a==="toggle-sidebar"){e.preventDefault(),i.sidebarCollapsed=!i.sidebarCollapsed,localStorage.setItem(Ei,String(i.sidebarCollapsed)),p();return}if(a==="mark-all-notifications-read"){e.preventDefault(),bu(u()).catch(n=>console.warn("Notification read sync failed",n));return}if(a==="open-notification"){e.preventDefault(),_u(t.dataset.notificationId).catch(n=>console.warn("Notification open sync failed",n));return}if(a==="verify-email"){e.preventDefault(),i.accountMenuOpen=!1,$("Email verification is not implemented yet. Account access is not blocked right now.","local");return}if(a==="start-demo-mode"){e.preventDefault(),ps(t.dataset.returnUrl||"");return}if(a==="open-auth-modal"){e.preventDefault();const n=us(t.dataset.authMode||"signin")||"signin";i.authMode=n,i.loginError="",i.authMessage="",j(`/?auth=${encodeURIComponent(n)}`);return}if(a==="close-auth-modal"){e.preventDefault(),i.loginError="",i.authMessage="",j("/");return}if(a==="set-auth-mode"){e.preventDefault();const n=["signin","register","invite","request"].includes(t.dataset.authMode)?t.dataset.authMode:"signin";if(i.authMode=n,i.loginError="",i.authMessage="",i.route?.name==="home"||i.route?.name==="login"){const s=new URLSearchParams(i.route.params);i.route.name==="home"?(s.set("auth",n),s.delete("mode")):(s.set("mode",n),s.delete("auth"));const o=s.toString();j(`${i.route.path}${o?`?${o}`:""}`,{replace:!0});return}p();return}if(a==="open-profile"){e.preventDefault(),i.accountMenuOpen=!1,i.modal="profile",p();return}if(a==="open-role-form"){if(e.preventDefault(),!y("roles.manage",u(),"Your role cannot manage roles.","Roles"))return;i.modal="role-new",p();return}if(a==="view-as-role"){e.preventDefault();const n=u(),s=ot(n,t.dataset.roleId);if(!s){$("That role is no longer available.","local","Role preview");return}i.rolePreview={company_id:n,role_id:s.id},$(`Viewing the workspace as ${s.name}.`,"local","Role preview");return}if(a==="exit-role-preview"){e.preventDefault(),i.rolePreview=null,$("Role preview ended.","live","Role preview");return}if(a==="open-invite-form"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot invite or manage users.","Users"))return;i.modal="invite-new",p();return}if(a==="new-message-group"){if(e.preventDefault(),!y("messages.create_group",u(),"Your role cannot create group chats.","Messages"))return;i.modal="message-group-new",p();return}if(a==="new-direct-message"){if(e.preventDefault(),!y("messages.send",u(),"Your role cannot start direct messages.","Messages"))return;i.modal="message-direct-new",p();return}if(a==="manage-message-chat"){if(e.preventDefault(),!y("messages.manage_groups",u(),"Your role cannot manage chat access.","Messages"))return;i.selectedConversationId=t.dataset.conversationId||i.selectedConversationId,i.modal="message-access",p();return}if(a==="message-details"){e.preventDefault(),i.selectedConversationId=t.dataset.conversationId||i.selectedConversationId,i.modal="message-details",p();return}if(a==="message-search-results"){e.preventDefault(),i.modal="message-search",p();return}if(a==="set-message-filter"){e.preventDefault(),i.messageFilter=["all","unread",...fn].includes(t.dataset.filter)?t.dataset.filter:"all",p();return}if(a==="delete-message"){e.preventDefault(),gc(t.dataset.messageId);return}if(a==="open-message-attachment"){e.preventDefault(),bc(t.dataset.attachmentId);return}if(a==="run-message-scenario"){e.preventDefault(),ru(u());return}if(a==="reset-message-demo"){e.preventDefault(),lu();return}if(a==="set-calendar-scope"){e.preventDefault(),i.calendarScope=t.dataset.scope==="me"?"me":"company",p();return}if(a==="set-calendar-view"){e.preventDefault(),i.calendarView=["month","week","list"].includes(t.dataset.view)?t.dataset.view:"week",p();return}if(a==="calendar-prev"){e.preventDefault(),yi(-1),p();return}if(a==="calendar-next"){e.preventDefault(),yi(1),p();return}if(a==="calendar-today"){e.preventDefault(),i.calendarCursorDate=k(0),p();return}if(a==="open-calendar-event"){e.preventDefault(),i.selectedCalendarEventId=t.dataset.eventId||"",i.modal="calendar-event-detail",p();return}if(a==="open-calendar-event-form"){if(e.preventDefault(),!h("calendar.manage",u())){$("Your role can view the calendar but cannot create company events.","local","Calendar");return}i.selectedCalendarEventId="",i.modal="calendar-event-new",p();return}if(a==="edit-calendar-event"){e.preventDefault();const n=Ft(t.dataset.eventId);if(!n||!It(n)){$("This event cannot be edited from Calendar.","local","Calendar");return}i.selectedCalendarEventId=n.id,i.modal="calendar-event-edit",p();return}if(a==="delete-calendar-event"){e.preventDefault(),pc(t.dataset.eventId);return}if(a==="copy-invite-link"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot view invite links.","Users"))return;ic(t.dataset.inviteId);return}if(a==="copy-invite-code"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot view invite codes.","Users"))return;sc(t.dataset.inviteId);return}if(a==="revoke-invite"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot revoke invites.","Users"))return;rc(t.dataset.inviteId);return}if(a==="approve-join-request"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot approve access requests.","Users"))return;gi(t.dataset.requestId,"approved");return}if(a==="reject-join-request"){if(e.preventDefault(),!y("users.manage",u(),"Your role cannot reject access requests.","Users"))return;gi(t.dataset.requestId,"rejected");return}if(a==="start-checkout"){e.preventDefault(),Xl();return}if(a==="review-workspace"){e.preventDefault(),ec(t.dataset.companyId,t.dataset.status);return}if(a==="open-file-upload"){if(e.preventDefault(),!y("files.manage",u(),"Your role can view files but cannot upload.","Files"))return;i.modal="file-upload",p();return}if(a==="open-folder-form"){if(e.preventDefault(),!y("files.manage",u(),"Your role can view files but cannot create folders.","Files"))return;i.modal="folder-new",p();return}if(a==="open-job-form"){if(e.preventDefault(),!y("jobs.manage",u(),"Your role can view jobs but cannot create or edit them.","Jobs"))return;const n=t.dataset.jobId||"";n&&(i.selectedJobId=n),i.modal=t.dataset.mode==="edit"?"job-edit":"job-new",p();return}if(a==="open-forms-tools"){if(e.preventDefault(),!y("forms.manage",u(),"Your role can view forms but cannot create or edit them.","Forms"))return;i.modal="forms-tools",p();return}if(a==="open-form-actions"){e.preventDefault(),Kt(t.dataset.formId,!1),i.modal="form-actions",p();return}if(a==="open-form-preview"){e.preventDefault(),Kt(t.dataset.formId,!1),i.modal="form-preview",p();return}if(a==="set-form-start-tab"){e.preventDefault(),i.formStartTab=t.dataset.tab==="templates"?"templates":"blank",i.formStartTab==="blank"&&(i.formStartTemplateId=""),i.formStartTab==="templates"&&!i.formStartTemplateId&&(i.formStartTemplateId=mt()[0]?.id||""),p();return}if(a==="select-form-start-template"){e.preventDefault(),i.formStartTab="templates",i.formStartTemplateId=t.dataset.templateId||mt()[0]?.id||"",p();return}if(a==="close-modal"){e.preventDefault(),Ql();return}if(a==="set-task-view"){e.preventDefault(),i.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(Ii,i.taskView),p();return}if(a==="set-drive-view"){e.preventDefault(),i.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem(Fi,i.driveView),p();return}if(a==="clock-in"){e.preventDefault(),kd(u(),t.dataset.taskId||i.route?.params?.get("task_id")||"");return}if(a==="clock-out"){e.preventDefault(),Ms();return}if(a==="select-file"){e.preventDefault(),i.selectedFileId=t.dataset.fileId||"",i.modal="file-detail",p();return}if(a==="download-file"){e.preventDefault(),Fc(t.dataset.fileId);return}if(a==="delete-file"){if(e.preventDefault(),!y("files.manage",u(),"Your role cannot delete files.","Files"))return;Ec(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),i.formsTab=t.dataset.tab==="responses"?"responses":"library",p();return}if(a==="set-form-editor-tab"){e.preventDefault(),i.formEditorTab=t.dataset.tab||"questions",p();return}if(a==="new-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role can view forms but cannot create them.","Forms"))return;i.formStartTemplateId=t.dataset.templateId||"",i.formStartTab=t.dataset.startTab==="templates"||i.formStartTemplateId?"templates":"blank",i.formStartTab==="templates"&&!i.formStartTemplateId&&(i.formStartTemplateId=mt()[0]?.id||""),i.modal="form-new",p();return}if(a==="select-form"){e.preventDefault(),Kt(t.dataset.formId);return}if(a==="toggle-form-card"){e.preventDefault();const n=t.dataset.formId||"";i.expandedFormIds.has(n)?i.expandedFormIds.delete(n):i.expandedFormIds.add(n),p();return}if(a==="edit-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Kt(t.dataset.formId,!1),i.formsTab="builder",i.formEditorTab="questions",i.modal="",p();return}if(a==="save-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;se("Form saved locally"),p();return}if(a==="publish-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot publish forms.","Forms"))return;qi(t.dataset.formId,"Published");return}if(a==="archive-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot archive forms.","Forms"))return;qi(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot duplicate forms.","Forms"))return;Iu(t.dataset.formId);return}if(a==="delete-form"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot delete forms.","Forms"))return;Fu(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),Eu(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),Tu(u());return}if(a==="new-finance-invoice"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");i.selectedFinanceInvoiceId="",i.modal="finance-invoice-new",p();return}if(a==="edit-finance-invoice"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");i.selectedFinanceInvoiceId=t.dataset.invoiceId||"",i.modal="finance-invoice-edit",p();return}if(a==="new-finance-payment"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");i.selectedFinanceInvoiceId=t.dataset.invoiceId||i.route?.params?.get("invoice")||"",i.modal="finance-payment-new",p();return}if(a==="new-finance-expense"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");i.selectedFinanceExpenseId="",i.selectedFinanceVendorId=t.dataset.vendorId||"",i.modal="finance-expense-new",p();return}if(a==="edit-finance-expense"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");i.selectedFinanceExpenseId=t.dataset.expenseId||"",i.modal="finance-expense-edit",p();return}if(a==="new-finance-vendor"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");i.selectedFinanceVendorId="",i.modal="finance-vendor-new",p();return}if(a==="edit-finance-vendor"){if(e.preventDefault(),!h("finance.manage",u()))return $("Your role cannot manage finance records.","local","Finance");i.selectedFinanceVendorId=t.dataset.vendorId||"",i.modal="finance-vendor-edit",p();return}if(a==="add-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;xu(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Ou(t.dataset.questionId);return}if(a==="delete-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Ru(t.dataset.questionId);return}if(a==="move-question"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Pu(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Uu(t.dataset.questionId);return}if(a==="remove-question-option"){if(e.preventDefault(),!y("forms.manage",u(),"Your role cannot edit forms.","Forms"))return;Nu(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){if(e.preventDefault(),!y("jobs.manage",u(),"Your role cannot delete jobs.","Jobs"))return;hc(t.dataset.jobId);return}if(a==="delete-task"){if(e.preventDefault(),!y("tasks.manage",u(),"Your role cannot delete tasks.","Tasks"))return;$c(t.dataset.taskId)}}function Ql(){const e=i.route||Mt();if(i.modal="",i.formStartTemplateId="",i.formStartTab="blank",i.selectedFinanceInvoiceId="",i.selectedFinanceExpenseId="",i.selectedFinanceVendorId="",e.name==="company"&&e.section==="tasks"&&(e.params.get("new")||e.params.get("edit")||e.params.get("task_id"))){j(m("tasks",e.jobId?{job_id:e.jobId}:{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"){const t=e.jobId?P(e.jobId):Ee();j(m("jobs",{tab:t?"profile":"pipeline",...t?{job_id:t.id}:{}},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="crm"&&e.params.get("account")){j(m("crm",{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="finance"&&(e.params.get("invoice")||e.params.get("expense")||e.params.get("vendor")||e.params.get("report"))){j(m("finance",{},e.companyId),{replace:!0});return}p()}function Vl(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===We.localUsername&&String(t.password||"")===We.localPassword)){i.loginError="Invalid temporary credentials.",p();return}i.loginError="",ps(t.return_url||_(m("jobs",{},L())));return}if(e.target.matches("[data-auth-sign-in-form]")){e.preventDefault(),zl(e.target);return}if(e.target.matches("[data-auth-register-form]")){e.preventDefault(),Kl(e.target);return}if(e.target.matches("[data-auth-invite-code-form]")){e.preventDefault(),Wl(e.target);return}if(e.target.matches("[data-existing-invite-code-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries()),a=String(t.invite_code||"").trim();if(!a){i.loginError="Invite code is required.",p();return}wn(a);return}if(e.target.matches("[data-auth-request-form]")){e.preventDefault(),Zl(e.target);return}if(e.target.matches("[data-company-create-form]")){e.preventDefault(),Gl(e.target);return}if(e.target.matches("[data-profile-form]")){e.preventDefault(),Bl(e.target).catch(t=>{$(t.message||"Profile save failed.","local","Profile")});return}if(e.target.matches("[data-job-form]")){e.preventDefault(),yc(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),wc(e.target);return}if(e.target.matches("[data-new-form-form]")){e.preventDefault(),Mu(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),Sc(e.target);return}if(e.target.matches("[data-folder-form]")){e.preventDefault(),kc(e.target);return}if(e.target.matches("[data-finance-invoice-form]")){e.preventDefault(),Dc(e.target);return}if(e.target.matches("[data-finance-payment-form]")){e.preventDefault(),Cc(e.target);return}if(e.target.matches("[data-finance-expense-form]")){e.preventDefault(),jc(e.target);return}if(e.target.matches("[data-finance-vendor-form]")){e.preventDefault(),qc(e.target);return}if(e.target.matches("[data-role-form]")){e.preventDefault(),ac(e.target);return}if(e.target.matches("[data-invite-form]")){e.preventDefault(),nc(e.target);return}if(e.target.matches("[data-message-group-form]")){e.preventDefault(),lc(e.target);return}if(e.target.matches("[data-direct-message-form]")){e.preventDefault(),cc(e.target);return}if(e.target.matches("[data-message-access-form]")){e.preventDefault(),dc(e.target);return}if(e.target.matches("[data-message-form]")){e.preventDefault(),uc(e.target);return}if(e.target.matches("[data-calendar-event-form]")){e.preventDefault(),mc(e.target);return}if(e.target.matches("[data-user-role-form]")){e.preventDefault(),oc(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),Lu(e.target))}async function Yl(){if(i.session?.auth==="supabase"){const e=q();e?.auth&&await e.auth.signOut()}localStorage.removeItem(Je),i.session=null,i.dataLoaded=!1,j("/login",{replace:!0})}function ps(e=""){i.loginError="",i.authMessage="",i.session=Za(),es(),i.activeCompanyId=u(),localStorage.setItem(De,i.activeCompanyId),D(Je,i.session),i.dataLoaded=!1,i.dataLoading=!1,j(ja(e||_(m("jobs",{},u()))),{replace:!0})}async function Bl(e){const t=new FormData(e),a=b().profile,n=e.elements.avatar_file?.files?.[0]||null;let s=String(t.get("avatar_url")||a.avatar_url||"").trim();if(n&&n.size){const l=await Hl(n);if(!l.ok)return;s=l.url}let o=yt({...a,full_name:String(t.get("full_name")||"").trim()||a.full_name||"Quest user",avatar_url:s},a);if(i.session?.auth==="supabase"){const l=q();if(!l){$("Profile upload needs Supabase to be available.","local","Profile");return}const c=await l.from("profiles").update({full_name:o.full_name,avatar_url:o.avatar_url}).eq("id",a.id).select().single();if(c.error){$(c.error.message||"Profile save failed.","local","Profile");return}o=yt(c.data,o),l.auth?.updateUser&&await l.auth.updateUser({data:{full_name:o.full_name,avatar_url:o.avatar_url}}),i.profiles=[o].concat(i.profiles.filter(d=>d.id!==o.id)),o.member_id&&(i.teamMembers=i.teamMembers.map(d=>d.id===o.member_id?{...d,full_name:o.full_name,name:o.full_name,avatar_url:o.avatar_url}:d))}else D(Mi,o),i.profileDraft=o;i.session={...b(),profile:o},D(Je,i.session),i.modal="",$("Profile saved.",i.session?.auth==="supabase"?"live":"local","Profile")}async function Hl(e){if(!["image/jpeg","image/png","image/webp"].includes(e.type))return $("Use a PNG, JPG, or WebP image for your profile picture.","local","Profile"),{ok:!1,url:""};if(e.size>2*1024*1024)return $("Profile pictures must be 2 MB or smaller.","local","Profile"),{ok:!1,url:""};if(i.session?.auth!=="supabase"){const f=await Hs(e);return f?{ok:!0,url:f}:($("Could not read that image file.","local","Profile"),{ok:!1,url:""})}const a=q(),n=b().profile.id,s=Su(e),o=`${n}/avatar-${Date.now()}.${s}`,l=await a.storage.from("avatars").upload(o,e,{cacheControl:"3600",upsert:!0,contentType:e.type});if(l.error)return $(l.error.message||"Profile picture upload failed.","local","Profile"),{ok:!1,url:""};const c=a.storage.from("avatars").getPublicUrl(o),d=c.data?.publicUrl?`${c.data.publicUrl}?v=${Date.now()}`:"";return d?{ok:!0,url:d}:($("Profile picture uploaded, but no public URL was returned.","local","Profile"),{ok:!1,url:""})}async function zl(e){const t=Object.fromEntries(new FormData(e).entries()),a=q();if(!a?.auth){i.loginError="Supabase auth is unavailable.",p();return}i.loginError="",i.authMessage="Signing in...",p();const n=await a.auth.signInWithPassword({email:String(t.email||"").trim(),password:String(t.password||"")});if(n.error){i.loginError=n.error.message||"Unable to sign in.",i.authMessage="",p();return}if(await pt(n.data.session),t.invite_token){await wn(t.invite_token,t.return_url);return}i.authMessage="",i.dataLoaded=!1,j(ja(t.return_url||_(m("jobs",{},L()))),{replace:!0})}async function Wl(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.invite_code||"").trim();if(!a){i.loginError="Invite code is required.",p();return}i.loginError="",i.authMessage="Checking invite code...",i.authMode="register",p();const n=await Jl(a);if(n?.missing){i.loginError="Invite code was not found or is no longer pending.",i.authMessage="",i.authMode="invite",p();return}if(n?.status&&n.status!=="pending"){i.loginError=`This invite is ${n.status}. Ask your company admin for a new code.`,i.authMessage="",i.authMode="invite",p();return}if(n?.expires_at&&Date.parse(n.expires_at)<=Date.now()){i.loginError="This invite code expired. Ask your company admin for a new code.",i.authMessage="",i.authMode="invite",p();return}n?(i.inviteLookup=n,i.authMessage=`Invite found for ${n.email}.`):i.authMessage="";const s=new URLSearchParams({invite:a}),o=ja(t.return_url||"");o&&s.set("return_url",o),s.set("mode","register"),j(`/login?${s.toString()}`,{replace:!0})}async function Jl(e){const t=String(e||"").trim(),a=q();if(!t||!a)return null;const n=await a.rpc("lookup_company_invite",{invite_token:t}).catch(o=>({error:o}));if(n.error)return null;const s=Array.isArray(n.data)?n.data[0]:n.data;return s?{token:t,company_id:w(s.company_id||""),company_name:String(s.company_name||s.company_id||"").trim(),email:String(s.email||"").trim(),status:String(s.status||"").trim(),expires_at:s.expires_at||""}:{missing:!0}}async function Kl(e){const t=Object.fromEntries(new FormData(e).entries()),a=q();if(!a?.auth){i.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),s=String(t.password||""),o=String(t.full_name||"").trim(),l=String(t.invite_token||"").trim(),c=String(t.company_name||"").trim();if(!n||!s||!o||!l&&!c){i.loginError=l?"Name, email, and password are required.":"Name, email, password, and company workspace are required.",p();return}i.loginError="",i.authMessage=l?"Creating account and accepting invite...":"Creating secure workspace...",p();const d=await a.auth.signUp({email:n,password:s,options:{data:{full_name:o}}});if(d.error){const S=/already|registered|exists/i.test(d.error.message||"");i.loginError=S&&l?"That email already has a Quest HQ account. Sign in with the invited email to accept this invite.":d.error.message||"Unable to create account.",S&&l&&(i.authMode="signin"),i.authMessage="",p();return}let f=d.data.session;if(!f){const S=await a.auth.signInWithPassword({email:n,password:s});if(S.error){i.loginError="Account created. Please sign in to finish workspace setup.",i.authMode="signin",i.authMessage="",p();return}f=S.data.session}if(await pt(f),l){await wn(l,t.return_url);return}const g=await a.rpc("create_company_workspace",{company_name:c});if(g.error){i.loginError=g.error.message||"Account created, but workspace setup failed.",i.authMessage="",p();return}i.activeCompanyId=w(g.data||L()),xn(i.activeCompanyId),localStorage.setItem(De,i.activeCompanyId),i.dataLoaded=!1,i.authMessage="",j(m("settings",{tab:"billing"},i.activeCompanyId),{replace:!0})}async function Gl(e){const t=Object.fromEntries(new FormData(e).entries()),a=q(),n=String(t.company_name||"").trim();if(!a||!n){i.loginError="Company workspace name is required.",p();return}const s=await a.rpc("create_company_workspace",{company_name:n});if(s.error){i.loginError=s.error.message||"Workspace setup failed.",p();return}i.activeCompanyId=w(s.data||L()),xn(i.activeCompanyId),localStorage.setItem(De,i.activeCompanyId),i.dataLoaded=!1,j(m("settings",{tab:"billing"},i.activeCompanyId),{replace:!0})}async function Zl(e){const t=Object.fromEntries(new FormData(e).entries()),a=q();if(!a?.auth){i.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),s=String(t.password||""),o=w(t.company_id||"");i.loginError="",i.authMessage="Submitting access request...",p();const l=await a.auth.signInWithPassword({email:n,password:s});if(l.error){i.loginError=l.error.message||"Sign in first to request access.",i.authMessage="",p();return}await pt(l.data.session);const c=await a.rpc("request_company_access",{target_company_id:o,request_message:String(t.message||"").trim()||null});if(c.error){i.loginError=c.error.message||"Unable to request access.",i.authMessage="",p();return}i.authMessage="Access request sent. An Owner/Admin must approve it.",i.loginError="",i.authMode="signin",p()}async function Xl(){const e=u();i.sync={label:"Opening billing...",mode:"loading"},p();try{const t=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json",...b().access_token?{Authorization:`Bearer ${b().access_token}`}:{}},body:JSON.stringify({company_id:e,return_url:`${window.location.origin}${_(m("settings",{tab:"billing"},e))}`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.url)throw new Error(a.error||"Billing is not configured yet.");window.location.href=a.url}catch(t){i.sync={label:t.message||"Billing unavailable",mode:"local"},p()}}async function ec(e,t){const a=w(e),n=Oa(t);if(!a||!n||!Rn()){$("Quest developer access is required to review workspaces.","local","Workspace review");return}const s=q();if(i.sync={label:"Updating workspace review...",mode:"loading"},p(),i.session?.auth==="supabase"&&s){const o=await s.rpc("review_company_workspace",{target_company_id:a,next_status:n,review_note:`Marked ${n} from Quest HQ approval console`});if(o.error){i.sync={label:o.error.message||"Workspace review failed",mode:"local"},$(o.error.message||"Workspace review failed.","local","Workspace review"),p();return}}tc(a,n),await at(a,"workspace.reviewed","company_subscription",a,{status:n},i.session?.auth==="supabase"),i.sync={label:`Workspace marked ${ia(n).toLowerCase()}`,mode:i.session?.auth==="supabase"?"live":"local"},$(`Workspace marked ${ia(n).toLowerCase()}.`,i.session?.auth==="supabase"?"live":"local","Workspace review"),p()}function tc(e,t){const a=oa({...Ot(e)||{},company_id:e,status:t});i.subscriptions=Rs(i.subscriptions.filter(s=>s.company_id!==e).concat(a));const n=ut({...i.workspaceReviews.find(s=>s.company_id===e)||{},company_id:e,company_name:T(e),status:t,plan_code:a.plan_code,amount_cents:a.amount_cents,currency:a.currency,created_at:new Date().toISOString()});i.workspaceReviews=i.workspaceReviews.filter(s=>s.company_id!==e).concat(n),t==="pending_review"?xn(e):Ad(e)}async function ac(e){const t=u();if(!y("roles.manage",t,"Your role cannot manage roles.","Roles"))return;const a=new FormData(e),n=He({id:crypto.randomUUID(),company_id:t,name:a.get("name"),color:a.get("color")||"#f0b23b",priority:a.get("priority")||100,is_system:!1,created_by:b().profile.id}),s=a.getAll("permissions").map(l=>String(l||"")).filter(Boolean),o=q();if(i.session?.auth==="supabase"&&o){const l=await o.from("roles").insert(n).select().single();if(l.error){i.sync={label:l.error.message||"Role save failed",mode:"local"},p();return}const c=He(l.data),d=s.map(f=>({role_id:c.id,permission_key:f,effect:"allow"}));d.length&&await o.from("role_permissions").insert(d),i.roles.unshift(c),i.rolePermissions=d.concat(i.rolePermissions).map(Ga),i.sync={label:"Role saved",mode:"live"}}else i.roles.unshift(n),i.rolePermissions=s.map(l=>Ga({role_id:n.id,permission_key:l,effect:"allow"})).concat(i.rolePermissions),i.sync={label:"Role saved locally",mode:"local"};i.modal="",p()}async function nc(e){const t=new FormData(e),a=w(t.get("company_id")||u());if(!y("users.manage",a,"Your role cannot invite users.","Users"))return;const n=String(t.get("email")||"").trim().toLowerCase(),s=String(t.get("role_id")||"").trim();if(!n){i.sync={label:"Invite email is required",mode:"local"},p();return}const o=la({id:crypto.randomUUID(),company_id:a,email:n,role_id:kt(s)?s:"",token:yd(),status:"pending",invited_by:b().profile.id,expires_at:new Date(Date.now()+336*60*60*1e3).toISOString(),created_at:new Date().toISOString()}),l=q();if(i.session?.auth==="supabase"&&l){const c={company_id:o.company_id,email:o.email,role_id:o.role_id||null,token:o.token,status:"pending",invited_by:b().profile.id},d=await l.from("company_invites").insert(c).select().single();if(d.error){i.sync={label:d.error.message||"Invite save failed",mode:"local"},p();return}i.companyInvites.unshift(la(d.data)),await at(o.company_id,"invite.created","company_invite",d.data.id,{email:o.email},!0),i.sync={label:"Invite code created. Copy it for the new user.",mode:"live"}}else i.companyInvites.unshift(o),at(o.company_id,"invite.created","company_invite",o.id,{email:o.email}),i.sync={label:"Invite code created locally",mode:"local"};J("access.invite","Invite code created",`${Y()} created an invite code for ${o.email}.`,m("settings",{tab:"access"},o.company_id),"invite",o.id,o.company_id),i.modal="",p()}async function wn(e,t=""){const a=q();if(!a){i.loginError="Supabase auth is unavailable.",i.authMessage="",p();return}i.authMessage="Accepting workspace invite...",p();const n=await a.rpc("accept_company_invite",{invite_token:String(e||"").trim()});if(n.error){i.loginError=n.error.message||"Unable to accept invite.",i.authMessage="",p();return}const s=w(n.data||L());i.activeCompanyId=s,localStorage.setItem(De,s),i.inviteLookup=null,i.authMessage="",i.loginError="",i.dataLoaded=!1,j(m("jobs",{},s),{replace:!0})}async function ic(e){const t=i.companyInvites.find(a=>a.id===e);if(!(t&&!y("users.manage",t.company_id,"Your role cannot view invite links.","Users"))){if(!t?.token){i.sync={label:"Invite link is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(hd(t)),i.sync={label:"Invite link copied",mode:"live"}}catch{i.sync={label:"Copy failed",mode:"local"}}p()}}async function sc(e){const t=i.companyInvites.find(a=>a.id===e);if(!(t&&!y("users.manage",t.company_id,"Your role cannot view invite codes.","Users"))){if(!t?.token){i.sync={label:"Invite code is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(t.token),i.sync={label:"Invite code copied",mode:"live"}}catch{i.sync={label:"Copy failed",mode:"local"}}p()}}async function rc(e){const t=i.companyInvites.find(n=>n.id===e);if(!t||!y("users.manage",t.company_id,"Your role cannot revoke invites.","Users"))return;const a=q();if(i.session?.auth==="supabase"&&a){const n=await a.rpc("revoke_company_invite",{target_invite_id:t.id});if(n.error){i.sync={label:n.error.message||"Invite revoke failed",mode:"local"},p();return}i.sync={label:"Invite revoked",mode:"live"}}else i.sync={label:"Invite revoked locally",mode:"local"};i.companyInvites=i.companyInvites.map(n=>n.id===t.id?la({...n,status:"revoked"}):n),at(t.company_id,"invite.revoked","company_invite",t.id,{email:t.email}),J("access.invite","Invite revoked",`${Y()} revoked the invite for ${t.email}.`,m("settings",{tab:"access"},t.company_id),"invite",t.id,t.company_id),Z(),p()}async function oc(e){const t=new FormData(e),a=w(t.get("company_id")||u());if(!y("users.manage",a,"Your role cannot manage user access.","Users"))return;const n=String(t.get("profile_id")||"").trim(),s=String(t.get("role_id")||"").trim(),o=["active","pending","disabled","left"].includes(String(t.get("membership_status")))?String(t.get("membership_status")):"active",l=ot(a,s);if(!n||!l){i.sync={label:"Select a user and role",mode:"local"},p();return}const c=jd(a,n,l,o);if(c){i.sync={label:c,mode:"local"},p();return}const d=ra({company_id:a,profile_id:n,role:jn(l),status:o}),f=oe(a,n),g=Ps({company_id:a,profile_id:n,role_id:l.id,assigned_by:b().profile.id}),S=q();if(i.session?.auth==="supabase"&&S){const V=kt(l.id),E=await S.rpc("update_company_member_access",{target_company_id:a,target_profile_id:n,target_role:d.role,target_role_id:V?l.id:null,target_status:o});if(E.error){i.sync={label:E.error.message||"Access update failed",mode:"local"},p();return}aa(ra(E.data||d)),V&&vi(g),i.sync={label:V?"User access saved":"Membership saved; create a role to assign permissions",mode:"live"}}else aa(d),vi(g),i.sync={label:"User access saved locally",mode:"local"};J("access.role","User access updated",`${Y()} set ${Rt(n)} to ${l.name} / ${F(o)}.`,m("settings",{tab:"access"},a),"membership",n,a,[n].concat(ue(a,["users.manage","settings.manage"]))),at(a,vu(f,d),"membership",n,{role:l.name,status:o}),p()}async function gi(e,t){const a=i.joinRequests.find(l=>l.id===e);if(!a||!["approved","rejected"].includes(t)||!y("users.manage",a.company_id,"Your role cannot manage access requests.","Users"))return;const n=q(),s=Us({...a,status:t}),o=ra({company_id:a.company_id,profile_id:a.profile_id,role:"member",status:t==="approved"?"active":"disabled"});if(i.session?.auth==="supabase"&&n){const l=await n.rpc("review_company_join_request",{target_request_id:a.id,decision:t,target_role_id:null});if(l.error){i.sync={label:l.error.message||"Request update failed",mode:"local"},p();return}t==="approved"&&aa(o),i.sync={label:t==="approved"?"Access approved":"Request rejected",mode:"live"}}else t==="approved"&&aa(o),i.sync={label:t==="approved"?"Access approved locally":"Request rejected locally",mode:"local"};i.joinRequests=i.joinRequests.map(l=>l.id===a.id?s:l),at(a.company_id,t==="approved"?"join.approved":"join.rejected","join_request",a.id,{email:a.requested_email}),J("access.request",t==="approved"?"Access approved":"Access rejected",`${Y()} ${t==="approved"?"approved":"rejected"} ${a.requested_email||"a join request"}.`,m("settings",{tab:"access"},a.company_id),"join_request",a.id,a.company_id,[a.profile_id].concat(ue(a.company_id,["users.manage","settings.manage"]))),Z(),p()}async function lc(e){const t=u();if(!h("messages.create_group",t)){$("Your role cannot create group chats.","local","Messages");return}const a=new FormData(e),n=["company","role","custom"].includes(a.get("type"))?String(a.get("type")):"custom",s=ve({id:crypto.randomUUID(),company_id:t,title:String(a.get("title")||"").trim()||"New group chat",type:n,created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=Bn(a,s,n);!o.some(c=>c.target_type==="profile"&&c.target_id===b().profile.id)&&n!=="company"&&o.push(ee({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id})),await $n(s,o)&&(i.selectedConversationId=s.id,i.modal="",J("message.group","Group chat created",`${Y()} created ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,ca(s)),j(m("messages",{conversation:s.id},t),{replace:!0}))}async function cc(e){const t=u();if(!y("messages.send",t,"Your role cannot start direct messages.","Messages"))return;const a=new FormData(e),n=String(a.get("profile_id")||"").trim();if(!n){$("Choose a person first.","local","Messages");return}const s=ve({id:crypto.randomUUID(),company_id:t,title:Rt(n),type:"direct",created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=[ee({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id}),ee({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:n})];if(!await $n(s,o))return;i.selectedConversationId=s.id,i.modal="";const c=String(a.get("body")||"").trim();c&&await fs(s,c,[]),J("message.direct","Direct message started",`${Y()} started a direct message with ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,[n]),j(m("messages",{conversation:s.id},t),{replace:!0})}async function dc(e){const t=u();if(!h("messages.manage_groups",t)&&!h("messages.manage",t)){$("Your role cannot manage chat access.","local","Messages");return}const a=i.messageConversations.find(f=>f.id===e.dataset.conversationId);if(!a)return;const n=new FormData(e),s=ve({...a,title:String(n.get("title")||"").trim()||a.title,type:fn.includes(n.get("type"))?String(n.get("type")):a.type,updated_at:new Date().toISOString()}),o=Bn(n,s,s.type);s.type!=="company"&&!o.some(f=>f.target_type==="profile"&&f.target_id===b().profile.id)&&o.push(ee({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id}));const l=ca(a);if(!await $n(s,o,!0))return;const d=ca(s).filter(f=>!l.includes(f));d.length&&J("message.group","Added to chat",`${Y()} added you to ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,d),i.modal="",$("Chat access saved.",i.session?.auth==="supabase"?"live":"local","Messages"),p()}async function uc(e){const t=i.messageConversations.find(o=>o.id===e.dataset.conversationId);if(!t)return;if(!h("messages.send",t.company_id)){$("Your role cannot send messages.","local","Messages");return}const a=new FormData(e),n=String(a.get("body")||"").trim(),s=Array.from(e.elements.attachments?.files||[]);if(!n&&!s.length){$("Type a message or attach a file.","local","Messages");return}if(s.length&&!h("messages.attach_files",t.company_id)){$("Your role cannot attach files.","local","Messages");return}await fs(t,n,s),e.reset(),p()}async function mc(e){const t=u(),a=Object.fromEntries(new FormData(e).entries()),n=a.id?Ft(String(a.id)):null;if(!n&&!h("calendar.manage",t)){$("Your role cannot create or edit calendar events.","local","Calendar");return}if(n&&!It(n)){$("This event cannot be edited from Calendar.","local","Calendar");return}const s=String(a.linked_job_id||"").trim(),o=new Date().toISOString();let l=tt({...n||{},id:n?.id||crypto.randomUUID(),company_id:t,title:String(a.title||"").trim()||"Calendar event",description:String(a.description||"").trim(),event_type:Sa.includes(a.event_type)?String(a.event_type):"Company event",starts_at:Si(a.starts_at),ends_at:Si(a.ends_at||a.starts_at),all_day:a.all_day==="on",visibility:a.visibility==="private"?"private":"company",linked_type:s?"job":"",linked_id:s,assigned_profile_id:String(a.assigned_profile_id||""),created_by:n?.created_by||b().profile.id,created_at:n?.created_at||o,updated_at:o});const c=q();if(i.session?.auth==="supabase"&&c){const d=Od(l);n&&delete d.id;const f=n?await c.from("calendar_events").update({...d,updated_at:o}).eq("id",n.id).select().single():await c.from("calendar_events").insert(d).select().single();if(f.error){$(f.error.message||"Calendar event save failed.","local","Calendar");return}l=tt(f.data)}i.calendarEvents=[l].concat(i.calendarEvents.filter(d=>d.id!==l.id)),Vs(),J("calendar.event",n?"Calendar event updated":"Calendar event created",`${Y()} ${n?"updated":"created"} ${l.title}.`,m("calendar",{},t),"calendar_event",l.id,t),i.selectedCalendarEventId=`manual:${l.id}`,i.modal="calendar-event-detail",p()}async function pc(e){const t=Ft(e);if(!t||!It(t)){$("This event cannot be deleted from Calendar.","local","Calendar");return}const a=q();if(i.session?.auth==="supabase"&&a){const n=await a.from("calendar_events").delete().eq("id",t.id);if(n.error){$(n.error.message||"Calendar event delete failed.","local","Calendar");return}}i.calendarEvents=i.calendarEvents.filter(n=>n.id!==t.id),Vs(),J("calendar.event","Calendar event deleted",`${Y()} deleted ${t.title}.`,m("calendar",{},t.company_id),"calendar_event",t.id,t.company_id),i.selectedCalendarEventId="",i.modal="",p()}async function fs(e,t,a){const n=new Date().toISOString(),s=Se({id:crypto.randomUUID(),conversation_id:e.id,company_id:e.company_id,sender_profile_id:b().profile.id,body:t,message_type:a.length?"attachment":"text",created_at:n,updated_at:n}),o=q();let l=s;if(i.session?.auth==="supabase"&&o){const f=await o.from("messages").insert(Td(s)).select().single();if(f.error)return $(f.error.message||"Message send failed.","local","Messages"),null;l=Se(f.data)}i.messages=i.messages.concat(l);const c=await fc(l,a),d={...e,last_message_at:l.created_at,updated_at:l.created_at};return i.messageConversations=i.messageConversations.map(f=>f.id===e.id?d:f),i.session?.auth==="supabase"&&o&&await o.from("message_conversations").update({last_message_at:l.created_at,updated_at:l.created_at}).eq("id",e.id),Ua(e.id,!1),Ys(d,l,c),Ne(),l}async function fc(e,t){const a=q(),n=[];for(const s of t){const o=crypto.randomUUID(),l=`${e.company_id}/${e.conversation_id}/${o}-${Bt(s.name||"attachment")}`;let c="",d="";if(i.session?.auth==="supabase"&&a){const g=await a.storage.from("quest-message-attachments").upload(l,s,{cacheControl:"3600",upsert:!1,contentType:s.type||"application/octet-stream"});if(g.error){$(g.error.message||"Attachment upload failed.","local","Messages");continue}d=l}else s.type?.startsWith("image/")&&s.size<=22e4&&(c=await Hs(s));const f=Te({id:o,conversation_id:e.conversation_id,message_id:e.id,company_id:e.company_id,bucket_id:"quest-message-attachments",object_path:d,file_name:s.name||"attachment",mime_type:s.type||"application/octet-stream",size_bytes:s.size||0,preview_url:c,created_at:new Date().toISOString()});if(i.session?.auth==="supabase"&&a){const g=await a.from("message_attachments").insert(xd(f)).select().single();if(g.error){$(g.error.message||"Attachment record failed.","local","Messages"),d&&await a.storage.from("quest-message-attachments").remove([d]);continue}n.push(Te(g.data))}else n.push(f)}return i.messageAttachments=i.messageAttachments.concat(n),n}async function $n(e,t,a=!1){const n=q();if(i.session?.auth==="supabase"&&n){const s=a?await n.from("message_conversations").update(wi(e)).eq("id",e.id).select().single():await n.from("message_conversations").insert(wi(e)).select().single();if(s.error)return $(s.error.message||"Conversation save failed.","local","Messages"),!1;if(await n.from("message_conversation_access").delete().eq("conversation_id",e.id),t.length){const o=await n.from("message_conversation_access").insert(t.map(Ed));if(o.error)return $(o.error.message||"Conversation access save failed.","local","Messages"),!1}e=ve(s.data),i.sync={label:"Quest Supabase live",mode:"live"}}return i.messageConversations=[e].concat(i.messageConversations.filter(s=>s.id!==e.id)),i.messageAccess=t.concat(i.messageAccess.filter(s=>s.conversation_id!==e.id)),Ua(e.id,!1),Ne(),!0}async function gc(e){const t=i.messages.find(o=>o.id===e);if(!t)return;if(!(t.sender_profile_id===b().profile.id&&h("messages.delete_own",t.company_id)||h("messages.delete_any",t.company_id))){$("Your role cannot delete this message.","local","Messages");return}const n=new Date().toISOString(),s=q();if(i.session?.auth==="supabase"&&s){const o=await s.from("messages").update({deleted_at:n,updated_at:n}).eq("id",t.id);if(o.error){$(o.error.message||"Message delete failed.","local","Messages");return}}i.messages=i.messages.map(o=>o.id===t.id?{...o,deleted_at:n,updated_at:n}:o),Ne(),p()}async function bc(e){const t=i.messageAttachments.find(n=>n.id===e);if(!t)return;if(t.preview_url){window.open(t.preview_url,"_blank","noopener,noreferrer");return}const a=q();if(i.session?.auth==="supabase"&&a&&t.object_path){const n=await a.storage.from(t.bucket_id||"quest-message-attachments").createSignedUrl(t.object_path,900,{download:t.file_name});if(!n.error&&n.data?.signedUrl){window.open(n.data.signedUrl,"_blank","noopener,noreferrer");return}}$("This demo attachment is metadata-only.","local","Messages")}function _c(e){if(e.target.matches("[data-global-search]")){i.query=e.target.value,Qe();return}if(e.target.matches("[data-file-search]")){i.fileQuery=e.target.value,Qe();return}if(e.target.matches("[data-form-search]")){i.formQuery=e.target.value,Qe();return}if(e.target.matches("[data-crm-search]")){i.crmQuery=e.target.value,Qe();return}if(e.target.matches("[data-message-search]")){i.messageQuery=e.target.value,Qe();return}if(e.target.matches("[data-calendar-search]")){i.calendarQuery=e.target.value,Qe();return}if(e.target.matches("[data-message-access-filter]")){au(e.target);return}if(e.target.matches("[data-form-field]")){nr(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&ir(e.target)}function vc(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||L();Bc(t);return}if(e.target.matches("[data-stage-filter]")){i.stageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-stage-filter]")){i.crmStageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-owner-filter]")){i.crmOwnerFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-status-filter]")){i.taskStatusFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-priority-filter]")){i.taskPriorityFilter=e.target.value||"all",p();return}if(e.target.matches("[data-calendar-type-filter]")){i.calendarTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;j(m("tasks",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-analytics-job-filter]")){const t=e.target.value;j(m("analytics",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-file-category-filter]")){i.fileCategoryFilter=e.target.value||"All categories",p();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=i.route?.jobId||"";j(m("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},u()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;j(m("files",{...t?{folder:"jobs",job_id:t}:{}},u()));return}if(e.target.matches("[data-form-type-filter]")){i.formTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-form-field]")){nr(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&ir(e.target)}async function yc(e){const t=Xe(Object.fromEntries(new FormData(e).entries()));if(t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||u(),!y("jobs.manage",t.company_id,"Your role can view jobs but cannot create or edit them.","Jobs"))return;t.estimate_total=Number(t.estimate_total||0),t.invoice_total=Number(t.invoice_total||0),t.updated_at=new Date().toISOString();const a=i.jobs.some(s=>s.id===t.id),n=q();if(n){const s=a?await n.from("jobs").update(t).eq("id",t.id).select().single():await n.from("jobs").insert(t).select().single();if(!s.error&&s.data){Ha(Xe(s.data)),i.sync={label:"Quest Supabase live",mode:"live"},i.modal="",j(m("jobs",{tab:"profile",job_id:s.data.id},t.company_id),{replace:!0});return}i.sync={label:"Saved locally",mode:"local"}}Ha(t),i.modal="",j(m("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function hc(e){if(!e)return;const t=u();if(!y("jobs.manage",t,"Your role cannot delete jobs.","Jobs"))return;const a=q();a&&await a.from("jobs").delete().eq("id",e),i.jobs=i.jobs.filter(n=>n.id!==e),i.selectedJobId=Q(t)[0]?.id||"",i.modal="",Z(),j(m("jobs",{tab:"list"},t),{replace:!0})}async function wc(e){const t=u();if(!y("tasks.manage",t,"Your role can view tasks but cannot create or edit them.","Tasks"))return;const a=Object.fromEntries(new FormData(e).entries()),n=et({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:b().profile.member_id||rt(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),s=qa(n.id),o=!!s,l=q();if(l){const c=Bd(n),d=o?await l.from("tasks").update(c).eq("id",n.id).select().single():await l.from("tasks").insert(c).select().single();if(!d.error&&d.data){const f=et(d.data);bi(f),Ci(f,s),i.sync={label:"Quest Supabase live",mode:"live"},i.modal="",j(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0});return}i.sync={label:"Task saved locally",mode:"local"}}bi(n),Ci(n,s),i.modal="",j(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0})}async function $c(e){if(!e)return;const t=u();if(!y("tasks.manage",t,"Your role cannot delete tasks.","Tasks"))return;const a=q();a&&await a.from("tasks").delete().eq("id",e),i.tasks=i.tasks.filter(n=>n.id!==e),i.selectedTaskId="",i.modal="",Z(),j(m("tasks",{},t),{replace:!0})}async function Sc(e){const t=u();if(!y("files.manage",t,"Your role can view files but cannot upload.","Files"))return;const a=new FormData(e),n=Object.fromEntries(a.entries()),s=Array.from(e.elements.files?.files||[]),o=String(n.file_name||"").trim(),l=s.length?s:o?[null]:[];if(!l.length){i.sync={label:"Choose a file or enter a file name",mode:"local"},p();return}const c=q();let d=0;for(const f of l){const g=crypto.randomUUID(),S=f?.name||o,V=String(n.folder||"shared"),E=`${t}/${n.job_id?`jobs/${n.job_id}`:V}/${g}-${Bt(S)}`;let ne=!1;c&&f&&(ne=!(await c.storage.from("quest-job-files").upload(E,f,{cacheControl:"3600",upsert:!1,contentType:f.type||"application/octet-stream"})).error);const Me=vt({id:g,company_id:t,job_id:n.job_id||"",folder:V,file_name:S,mime_type:f?.type||"application/octet-stream",size_bytes:f?.size||Number(n.size_bytes||0),category:n.category||fe(V),notes:n.notes||"",uploaded_by_label:n.uploaded_by_label||b().profile.full_name,bucket_id:"quest-job-files",object_path:ne||!f?E:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(c){const N=await c.from("job_files").insert(Hd(Me)).select().single();if(!N.error&&N.data){_i(vt(N.data)),d+=1;continue}ne&&await c.storage.from("quest-job-files").remove([E])}_i(Me)}i.sync=d===l.length?{label:"Quest Supabase live",mode:"live"}:{label:d?"Some files saved locally":"File record saved locally",mode:d?"loading":"local"},J("file.added",l.length>1?"Files added":"File added",`${Y()} added ${l.length} file${l.length===1?"":"s"} to ${fe(n.folder||"shared")}.`,m("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),"file",n.job_id||"",t),i.modal="",j(m("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),{replace:!0})}function kc(e){const t=Object.fromEntries(new FormData(e).entries()),a=w(t.company_id||u());if(!y("files.manage",a,"Your role can view files but cannot create folders.","Files"))return;const n=String(t.name||"").trim();if(!n){i.sync={label:"Folder name is required",mode:"local"},p();return}const s=Un({id:`folder-${crypto.randomUUID()}`,company_id:a,name:n,parent_key:t.parent_key||"home",created_by_label:b().profile.full_name||"Quest HQ",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});i.driveFolders.unshift(s),i.modal="",i.sync={label:"Folder created locally",mode:"local"},J("file.folder","Folder created",`${Y()} created ${s.name}.`,m("files",{folder:s.id},s.company_id),"folder",s.id,s.company_id),Z(),p()}async function Dc(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=P(t.job_id),s=String(t.id||"").trim()?Pe(String(t.id).trim()):null,o=Ut({...t,id:String(t.id||"").trim()||`invoice-${crypto.randomUUID()}`,company_id:a,client_name:String(t.client_name||n?.client_name||"").trim(),total:R(t.subtotal)+R(t.tax),updated_at:new Date().toISOString()});await ft("finance_invoices",gs(o),"Invoice save failed")&&(Tc(o),s?.job_id&&s.job_id!==o.job_id&&za(s.job_id),za(o.job_id),i.modal="",i.sync={label:i.session?.auth==="supabase"?"Invoice saved securely":"Finance saved locally",mode:i.session?.auth==="supabase"?"live":"local"},J("finance.invoice",s?"Invoice updated":"Invoice created",`${Y()} ${s?"updated":"created"} ${o.invoice_number}.`,m("finance",{invoice:o.id},a),"invoice",o.id,a),j(m("finance",{invoice:o.id},a),{replace:!0}))}async function Cc(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=Pe(t.invoice_id);if(!n||n.company_id!==a){i.sync={label:"Create an invoice before recording a payment",mode:"local"},p();return}const s=Nt({...t,id:`payment-${crypto.randomUUID()}`,company_id:a,created_at:new Date().toISOString()});!await ft("finance_payments",Ac(s),"Payment save failed")||(n.status=pe(n.id)-s.amount<=0?"Paid":"Partially paid",n.updated_at=new Date().toISOString(),!await ft("finance_invoices",gs(n),"Invoice status update failed"))||(i.financePayments.unshift(s),za(n.job_id),Z(),i.modal="",i.sync={label:i.session?.auth==="supabase"?"Payment recorded securely":"Payment recorded locally",mode:i.session?.auth==="supabase"?"live":"local"},J("finance.payment","Payment recorded",`${Y()} recorded ${C(s.amount)} for ${n.invoice_number}.`,m("finance",{invoice:s.invoice_id},a),"payment",s.id,a),j(m("finance",s.invoice_id?{invoice:s.invoice_id}:{},a),{replace:!0}))}async function jc(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=Lt({...t,id:String(t.id||"").trim()||`expense-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});await ft("finance_expenses",Mc(n),"Expense save failed")&&(xc(n),i.modal="",i.sync={label:i.session?.auth==="supabase"?"Expense saved securely":"Expense saved locally",mode:i.session?.auth==="supabase"?"live":"local"},J("finance.expense","Expense saved",`${Y()} saved a ${C(n.amount)} ${n.category} expense.`,m("finance",{expense:n.id},a),"expense",n.id,a),j(m("finance",{expense:n.id},a),{replace:!0}))}async function qc(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=Qt({...t,id:String(t.id||"").trim()||`vendor-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});await ft("finance_vendors",Ic(n),"Vendor save failed")&&(Oc(n),i.modal="",i.sync={label:i.session?.auth==="supabase"?"Vendor saved securely":"Vendor saved locally",mode:i.session?.auth==="supabase"?"live":"local"},J("finance.vendor","Vendor saved",`${Y()} saved vendor ${n.name}.`,m("finance",{vendor:n.id},a),"vendor",n.id,a),j(m("finance",{vendor:n.id},a),{replace:!0}))}async function ft(e,t,a){if(i.session?.auth!=="supabase")return!0;const n=q();if(!n)return i.sync={label:"Supabase is unavailable",mode:"local"},p(),!1;if(!h("finance.manage",t.company_id))return i.sync={label:"Your role cannot manage finance records",mode:"local"},p(),!1;const s=await n.from(e).upsert(t,{onConflict:"id"}).select().single();return s.error?(i.sync={label:s.error.message||a,mode:"local"},$(s.error.message||a,"local","Finance"),p(),!1):!0}function gs(e){return{id:e.id,company_id:e.company_id,job_id:e.job_id||null,client_name:e.client_name,invoice_number:e.invoice_number,status:e.status,issue_date:e.issue_date||null,due_date:e.due_date||null,subtotal:R(e.subtotal),tax:R(e.tax),total:R(e.total),notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function Ac(e){return{id:e.id,company_id:e.company_id,invoice_id:e.invoice_id,amount:R(e.amount),method:e.method,received_at:e.received_at||null,reference:e.reference||"",notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function Mc(e){return{id:e.id,company_id:e.company_id,job_id:e.job_id||null,vendor_id:e.vendor_id||null,category:e.category,amount:R(e.amount),status:e.status,spent_at:e.spent_at||null,notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}function Ic(e){return{id:e.id,company_id:e.company_id,name:e.name,contact_name:e.contact_name||"",email:e.email||"",phone:e.phone||"",category:e.category,status:e.status,notes:e.notes||"",created_by:b().profile.id||null,updated_at:new Date().toISOString()}}async function Fc(e){const t=i.files.find(s=>s.id===e);if(t&&!y("files.view",t.company_id,"Your role cannot view this file.","Files"))return;if(!t?.object_path){i.sync={label:"No stored object for this file",mode:"local"},p();return}const a=q();if(!a)return;const n=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(n.error||!n.data?.signedUrl){i.sync={label:"Download failed",mode:"local"},p();return}window.open(n.data.signedUrl,"_blank","noopener,noreferrer")}async function Ec(e){const t=i.files.find(n=>n.id===e);if(!t||!y("files.manage",t.company_id,"Your role cannot delete files.","Files"))return;const a=q();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),i.files=i.files.filter(n=>n.id!==e),i.selectedFileId="",i.modal="",Z(),p()}function Ha(e){const t=i.jobs.findIndex(a=>a.id===e.id);t>=0?i.jobs[t]=e:i.jobs.unshift(e),i.selectedJobId=e.id,Z()}function bi(e){const t=i.tasks.findIndex(a=>a.id===e.id);t>=0?i.tasks[t]=e:i.tasks.unshift(e),i.selectedTaskId=e.id,Z()}function _i(e){const t=i.files.findIndex(a=>a.id===e.id);t>=0?i.files[t]=e:i.files.unshift(e),Z()}function Tc(e){const t=i.financeInvoices.findIndex(a=>a.id===e.id);t>=0?i.financeInvoices[t]=e:i.financeInvoices.unshift(e),Z()}function xc(e){const t=i.financeExpenses.findIndex(a=>a.id===e.id);t>=0?i.financeExpenses[t]=e:i.financeExpenses.unshift(e),Z()}function Oc(e){const t=i.financeVendors.findIndex(a=>a.id===e.id);t>=0?i.financeVendors[t]=e:i.financeVendors.unshift(e),Z()}function aa(e){const t=i.memberships.findIndex(a=>a.company_id===e.company_id&&a.profile_id===e.profile_id);t>=0?i.memberships[t]=e:i.memberships.unshift(e),Z()}function vi(e){i.roleAssignments=i.roleAssignments.filter(t=>t.company_id!==e.company_id||t.profile_id!==e.profile_id),e.role_id&&i.roleAssignments.unshift(e)}function za(e){if(!e)return;const t=P(e);t&&(t.invoice_total=me(_e(t.company_id).filter(a=>a.job_id===e),"total"),t.updated_at=new Date().toISOString(),Ha(t))}function Qe(){const e=document.getElementById("workspace");e&&(bs(i.route),e.innerHTML=ns(i.route))}function Mt(){const e=Sn(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/")return{name:"home",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:u(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const n=a[2]||"home";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:n,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:u(),jobId:t.get("job_id")||""}}function Rc(){const e=Sn(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||Zt(t.get("job_id")||t.get("project_id"))||localStorage.getItem(De)||L(),n=Object.fromEntries(Object.entries(gr).map(([l,c])=>[l,m(c,{},a)]));Object.assign(n,{"/index.html":"/","/command.html":m("home",{},a),"/login.html":"/login"});let s=n[e];if(e==="/jobs"){const l=t.get("tab");l==="tasks"?s=m("tasks",ce(t,["job_id","task_id","new","edit"]),a):l==="files"?s=m("files",ce(t,["job_id","folder"]),a):l==="forms"?s=m("forms",ce(t,["job_id"]),a):l==="analytics"?s=m("analytics",ce(t,["job_id"]),a):s=m("jobs",ce(t,["job_id","tab"]),a)}if(e==="/files"&&(s=m("files",ce(t,["job_id","folder"]),a)),e==="/forms"&&(s=m("forms",ce(t,["job_id"]),a)),e==="/analytics"&&(s=m("analytics",ce(t,["job_id"]),a)),e==="/crm"&&(s=m("crm",ce(t,["account"]),a)),e==="/finance"&&(s=m("finance",ce(t,["invoice","expense","vendor","report"]),a)),e==="/messages"&&(s=m("messages",ce(t,["conversation"]),a)),e==="/calendar"&&(s=m("calendar",{},a)),e==="/admin"&&(s=m("settings",{},a)),e==="/time"&&(s=m("time",{},a)),e==="/team"&&(s=m("team-chart",{},a)),e==="/team-chart"&&(s=m("team-chart",{},a)),e==="/approvals"&&(s=m("approvals",{},a)),e==="/clock"&&(s=m("clock",{},a)),e==="/task-management.html"){const l=t.get("project_id")||t.get("job_id")||"";s=m("tasks",l?{job_id:l}:{},Zt(l)||a)}const o=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(o){const l=decodeURIComponent(o[1]);s=m("tasks",{job_id:l},Zt(l)||a)}s&&window.history.replaceState({},"",_(s))}function Pc(e){if(e.name!=="company")return"";if(e.section==="home"&&/^\/company\/[^/]+\/?$/.test(e.path))return m("home",{},e.companyId);const t=Ue();if(i.session?.auth==="supabase"&&!t.length)return null;if(!t.includes(e.companyId))return i.session?.auth==="supabase"?"":m(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||L());if(!st.map(s=>s.id).includes(e.section))return m("home",{},e.companyId);const n=e.jobId?Zt(e.jobId):"";return n&&n!==e.companyId&&t.includes(n)?m(e.section,Object.fromEntries(e.params.entries()),n):""}function Sn(){let e=window.location.pathname||"/";return Be&&e.startsWith(Be)&&(e=e.slice(Be.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function _(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),n=t.startsWith("/")?t:"/"+t;return`${Be}${n}${a?`?${a}`:""}`||"/"}function j(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(Be+"/")||Be===""&&e.startsWith("/")?e:_(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),p()}function Uc(){return`${Sn()}${window.location.search}`}function ja(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?_(m("jobs",{},L())):`${t.pathname}${t.search}`}catch{return _(m("jobs",{},L()))}}function m(e="jobs",t={},a=u()){const n=new URLSearchParams(t);for(const[s,o]of[...n.entries()])(o==null||o==="")&&n.delete(s);return`/company/${encodeURIComponent(w(a||L()))}/${e}${n.toString()?`?${n.toString()}`:""}`}function Nc(e){return e.name==="home"?"Quest HQ":e.name==="company"?F(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":F(e.name||"Workspace")}function Lc(e,t){const[a]=t.split("?"),n=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!n||e.name!=="company"?!1:e.companyId===decodeURIComponent(n[1])&&e.section===n[2]}function Qc(e){return xi.includes(e)?e:"pipeline"}function Vc(e){return{pipeline:"Pipeline",list:"List",profile:"Profile"}[e]||e}function Yc(e){const t=e.companyId||i.activeCompanyId||L(),a=Ue();i.activeCompanyId=a.includes(t)?t:a[0]||L(),localStorage.setItem(De,i.activeCompanyId)}function bs(e){const t=u();e.jobId&&Q(t).some(n=>n.id===e.jobId)&&(i.selectedJobId=e.jobId),(!i.selectedJobId||!Q(t).some(n=>n.id===i.selectedJobId))&&(i.selectedJobId=Q(t)[0]?.id||"");const a=e.params.get("task_id");a&&ae(t).some(n=>n.id===a)&&(i.selectedTaskId=a),e.section!=="tasks"&&(i.selectedTaskId=""),i.driveFolder=e.params.get("folder")||"home"}function Bc(e){const t=Ue(),a=w(e),n=t.includes(a)?a:t[0]||L();i.activeCompanyId=n,localStorage.setItem(De,n),Hc();const s=i.route||Mt(),o=s.name==="company"?s.section:"jobs";j(m(o,{},n))}function Hc(){i.modal="",i.selectedJobId="",i.selectedTaskId="",i.selectedFileId="",i.selectedFormId="",i.selectedQuestionId="",i.selectedFinanceInvoiceId="",i.selectedFinanceExpenseId="",i.selectedFinanceVendorId="",i.selectedCalendarEventId="",i.query="",i.fileQuery="",i.formQuery="",i.crmQuery="",i.stageFilter="all",i.crmStageFilter="all",i.crmOwnerFilter="all",i.taskStatusFilter="all",i.taskPriorityFilter="all",i.calendarQuery="",i.calendarTypeFilter="all",i.calendarScope="company",i.fileCategoryFilter="All categories",i.formTypeFilter="all",i.formsTab="library",i.driveFolder="home"}function zc(e){const t=P(e);t&&(i.selectedJobId=e,j(m("jobs",{tab:"profile",job_id:e},t.company_id)))}function Wc(e){const t=qa(e);t&&(i.selectedTaskId=e,j(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function Ee(){return P(i.selectedJobId)||Q(u())[0]||null}function P(e){return i.jobs.find(t=>t.id===e)||null}function qa(e){return i.tasks.find(t=>t.id===e)||null}function Q(e=u()){return i.jobs.filter(t=>t.company_id===e)}function ae(e=u()){return i.tasks.filter(t=>t.company_id===e)}function _s(e=u()){const t=b().profile.id;return i.notifications.filter(a=>a.company_id===e&&a.recipient_profile_id===t).sort((a,n)=>Date.parse(n.created_at||0)-Date.parse(a.created_at||0))}function xe(e=u()){const t=i.messageQuery.trim().toLowerCase(),a=i.messageFilter||"all";return i.messageConversations.filter(n=>n.company_id===e&&Zc(n)).filter(n=>a==="all"||n.type===a||a==="unread"&&gt(n.id)>0).filter(n=>{if(!t)return!0;const s=Oe(n.id).some(o=>o.body.toLowerCase().includes(t));return n.title.toLowerCase().includes(t)||s}).sort((n,s)=>Date.parse(s.last_message_at||s.updated_at||s.created_at||0)-Date.parse(n.last_message_at||n.updated_at||n.created_at||0))}function vs(e=u()){return xe(e).reduce((t,a)=>t+gt(a.id),0)}function ys(e=u()){const t=xe(e),n=i.route?.params?.get("conversation")||""||i.selectedConversationId;return t.find(s=>s.id===n)||t[0]||null}function Oe(e){return i.messages.filter(t=>t.conversation_id===e&&!t.deleted_at).sort((t,a)=>Date.parse(t.created_at||0)-Date.parse(a.created_at||0))}function Jc(e){return i.messageAttachments.filter(t=>t.conversation_id===e)}function Kc(e){return i.messageAttachments.filter(t=>t.message_id===e)}function Aa(e){return i.messageAccess.filter(t=>t.conversation_id===e)}function Gc(e,t=b().profile.id){return i.messageReads.find(a=>a.conversation_id===e&&a.profile_id===t)||null}function gt(e,t=b().profile.id){const a=Date.parse(Gc(e,t)?.last_read_at||0);return Oe(e).filter(n=>n.sender_profile_id!==t&&Date.parse(n.created_at||0)>a).length}function Zc(e){if(!e||!h("messages.view",e.company_id))return!1;const t=b().profile,a=Aa(e.id);if(e.type==="company"||a.some(o=>o.target_type==="all_company"))return!0;const n=new Set([t.id,t.member_id,t.email].filter(Boolean).map(String));if(a.some(o=>o.target_type==="profile"&&n.has(o.target_id)))return!0;const s=[_t(e.company_id,Ge(e.company_id)),...i.roleAssignments.filter(o=>o.company_id===e.company_id&&o.profile_id===t.id).map(o=>o.role_id)];return a.some(o=>o.target_type==="role"&&s.includes(o.target_id))}function Ma(e=u()){const t=i.calendarEvents.filter(c=>c.company_id===e&&sd(c)).map(ed),a=ae(e).filter(c=>c.due&&c.status!=="done").filter(c=>h("calendar.view_team",e)||ws(c.assignee_id)||c.creator_id===b().profile.member_id).map(td),n=h("finance.view",e)?_e(e).filter(c=>c.due_date&&pe(c.id)>0).map(ad):[],s=qn(e).filter(c=>c.type!=="Access request"||h("users.manage",e)).map(c=>nd(c,e)),o=Tt(e),l=o&&(h("calendar.view_team",e)||Ia(o.user_id))?[id(o)]:[];return t.concat(a,n,s,l).sort((c,d)=>Date.parse(c.startsAt||0)-Date.parse(d.startsAt||0))}function Xc(e=u()){const t=i.calendarQuery.trim().toLowerCase();return Ma(e).filter(a=>i.calendarScope==="company"||a.mine).filter(a=>i.calendarTypeFilter==="all"||a.type===i.calendarTypeFilter).filter(a=>t?[a.title,a.description,a.type,a.owner,a.linkLabel].some(n=>String(n||"").toLowerCase().includes(t)):!0).filter(a=>i.calendarView==="list"||dd(a))}function hs(e=u()){const t=Date.now();return Ma(e).filter(a=>Date.parse(a.endsAt||a.startsAt||0)>=t).slice(0,9)}function ed(e){const t=e.linked_type==="job"?P(e.linked_id):null;return{id:`manual:${e.id}`,source:"manual",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description,type:e.event_type,startsAt:e.starts_at,endsAt:e.ends_at||e.starts_at,allDay:e.all_day,dateKey:$s(e.starts_at),owner:ld(e.assigned_profile_id||e.created_by),mine:Ia(e.assigned_profile_id)||e.created_by===b().profile.id,href:rd(e),linkLabel:t?.name||"",editable:It(e)}}function td(e){const t=e.due_time?`${e.due}T${e.due_time}:00`:`${e.due}T12:00:00`;return{id:`task:${e.id}`,source:"task",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description||Le(e.type),type:"Task due",startsAt:t,endsAt:t,allDay:!e.due_time,dateKey:e.due,owner:B(e.assignee_id),mine:ws(e.assignee_id),href:m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),linkLabel:P(e.project_id)?.name||"Company task",editable:!1}}function ad(e){return{id:`invoice:${e.id}`,source:"invoice",sourceId:e.id,companyId:e.company_id,title:`${e.invoice_number} due`,description:`${C(pe(e.id))} outstanding for ${e.client_name||"client"}.`,type:"Invoice due",startsAt:`${e.due_date}T12:00:00`,endsAt:`${e.due_date}T12:00:00`,allDay:!0,dateKey:e.due_date,owner:e.client_name||"Finance",mine:h("finance.view",e.company_id),href:m("finance",{invoice:e.id},e.company_id),linkLabel:e.client_name||"Finance",editable:!1}}function nd(e,t=u()){const a=String(e.updatedAt||k(0)).slice(0,10);return{id:`approval:${e.id}`,source:"approval",sourceId:e.id,companyId:t,title:e.title,description:e.meta,type:"Approval",startsAt:`${a}T12:00:00`,endsAt:`${a}T12:00:00`,allDay:!0,dateKey:a,owner:e.owner,mine:!0,href:e.href,linkLabel:e.status,editable:!1}}function id(e){const t=$s(e.started_at);return{id:`timer:${e.id}`,source:"timer",sourceId:e.id,companyId:e.company_id,title:e.task_title||"Active timer",description:"Current clock session.",type:"Time",startsAt:e.started_at,endsAt:new Date().toISOString(),allDay:!1,dateKey:t,owner:B(e.user_id),mine:Ia(e.user_id),href:m("time",{},e.company_id),linkLabel:"My time",editable:!1}}function sd(e){return!e||!h("calendar.view",e.company_id)?!1:e.visibility!=="private"?!0:h("calendar.view_team",e.company_id)||It(e)||Ia(e.assigned_profile_id)}function It(e){return e?h("calendar.manage",e.company_id)||e.created_by===b().profile.id:!1}function rd(e){return e.linked_type==="job"&&e.linked_id&&h("jobs.view",e.company_id)?m("jobs",{tab:"profile",job_id:e.linked_id},e.company_id):e.linked_type==="task"&&e.linked_id&&h("tasks.view",e.company_id)?m("tasks",{task_id:e.linked_id},e.company_id):e.linked_type==="form"&&e.linked_id&&h("forms.view",e.company_id)?m("forms",{form_id:e.linked_id},e.company_id):e.linked_type==="invoice"&&e.linked_id&&h("finance.view",e.company_id)?m("finance",{invoice:e.linked_id},e.company_id):""}function od(e,t=u()){return Ma(t).find(a=>a.id===e)||null}function Ft(e){return i.calendarEvents.find(t=>t.id===e)||null}function ws(e){return String(e||"")===String(b().profile.member_id||b().profile.id||"")}function Ia(e){const t=b().profile;return[t.id,t.member_id,t.email].filter(Boolean).map(String).includes(String(e||""))}function ld(e){return e?Re(e)?.full_name||B(e)||String(e):"Unassigned"}function $s(e){if(!e)return k(0);const t=new Date(e);return Number.isNaN(t.getTime())?String(e).slice(0,10):t.toISOString().slice(0,10)}function Ss(e,t){return e.filter(a=>a.dateKey===t).sort((a,n)=>Date.parse(a.startsAt||0)-Date.parse(n.startsAt||0))}function cd(e){const t=kn(new Date),a=new Date(t);return a.setDate(t.getDate()+7),e.filter(n=>{const s=Date.parse(n.startsAt||n.dateKey||0);return s>=t.getTime()&&s<a.getTime()})}function dd(e){const t=new Date(`${e.dateKey}T00:00:00`);if(i.calendarView==="month"){const s=new Date(`${i.calendarCursorDate}T00:00:00`);return t.getFullYear()===s.getFullYear()&&t.getMonth()===s.getMonth()}const a=kn(new Date(`${i.calendarCursorDate}T00:00:00`)),n=new Date(a);return n.setDate(a.getDate()+7),t>=a&&t<n}function ud(e){const t=new Date(`${e}T00:00:00`),a=new Date(t.getFullYear(),t.getMonth(),1),n=new Date(a);return n.setDate(a.getDate()-a.getDay()),Array.from({length:42},(s,o)=>{const l=new Date(n);return l.setDate(n.getDate()+o),{key:Dn(l),label:String(l.getDate()),month:l.getMonth()}})}function ks(e){const t=kn(new Date(`${e}T00:00:00`));return Array.from({length:7},(a,n)=>{const s=new Date(t);return s.setDate(t.getDate()+n),{key:Dn(s),name:new Intl.DateTimeFormat("en-US",{weekday:"short"}).format(s),shortDate:new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(s)}})}function md(){const e=new Date(`${i.calendarCursorDate}T00:00:00`);if(i.calendarView==="month")return new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(e);if(i.calendarView==="week"){const t=ks(i.calendarCursorDate);return`${O(t[0].key)} - ${O(t[6].key)}`}return"Upcoming"}function kn(e){const t=new Date(e);return t.setHours(0,0,0,0),t.setDate(t.getDate()-t.getDay()),t}function Dn(e){const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${n}`}function yi(e){const t=new Date(`${i.calendarCursorDate}T00:00:00`);i.calendarView==="month"?t.setMonth(t.getMonth()+e):t.setDate(t.getDate()+e*7),i.calendarCursorDate=Dn(t)}function pd(e){return e.reduce((t,a)=>(t[a.dateKey]=t[a.dateKey]||[],t[a.dateKey].push(a),t),{})}function Ds(e){if(e.allDay)return"All day";const t=new Date(e.startsAt);return Number.isNaN(t.getTime())?"Timed":new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(t)}function fd(e){return`calendar-type-${Bt(e||"event")}`}function gd(e){return e==="Task due"?"ti-list-check":e==="Invoice due"?"ti-file-dollar":e==="Approval"?"ti-user-check":e==="Time"?"ti-clock":e.includes("Install")?"ti-hammer":e.includes("Estimate")?"ti-calendar-dollar":e.includes("Personal")?"ti-user":"ti-calendar-event"}function Ce(e=u()){return i.files.filter(t=>t.company_id===e)}function bt(e=u()){return i.driveFolders.filter(t=>t.company_id===e)}function rt(e=u()){return i.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function ie(e=u()){const t=new Map;rt(e).forEach(n=>{t.set(n.id,{profile_id:"",member_id:n.id,name:n.full_name||n.name,email:n.email,avatar_url:n.avatar_url,role:na(e,n.id).toLowerCase(),role_label:na(e,n.id),role_id:"",status:n.active?"active":"disabled"})}),i.memberships.filter(n=>n.company_id===e).forEach(n=>{const s=Re(n.profile_id),o=n.member_id?i.teamMembers.find(f=>f.id===n.member_id):null,l=i.roleAssignments.find(f=>f.company_id===e&&f.profile_id===n.profile_id),c=l?ot(e,l.role_id):null,d=n.profile_id||n.member_id;t.set(d,{profile_id:n.profile_id,member_id:n.member_id,name:s?.full_name||o?.full_name||s?.email||o?.name||d||"User",email:s?.email||o?.email||"",avatar_url:s?.avatar_url||o?.avatar_url||"",role:n.role,role_label:c?.name||F(n.role),role_id:l?.role_id||_t(e,n.role),status:n.status||"active"})});const a=b().profile;if(i.session?.auth==="supabase"&&a?.id&&!t.has(a.id)){const n=oe(e,a.id);n&&t.set(a.id,{profile_id:a.id,member_id:a.member_id||"",name:a.full_name||a.email,email:a.email,avatar_url:a.avatar_url,role:n.role,role_label:F(n.role),role_id:_t(e,n.role),status:n.status||"active"})}return[...t.values()].sort((n,s)=>(n.status==="active"?0:1)-(s.status==="active"?0:1)||n.name.localeCompare(s.name))}function bd(e=u()){return i.companyInvites.filter(t=>t.company_id===e&&t.status==="pending").sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function Cs(e=u()){return i.auditEvents.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function _d(e){const t=Re(e.actor_profile_id),a=t?.full_name||t?.email||dr(e.actor_profile_id||"system");return`
    <article class="access-audit-row">
      ${te({full_name:a,email:t?.email||""},"avatar small")}
      <span>
        <strong>${r(F(String(e.event_type||"access.event").replace(/[._-]+/g," ")))}</strong>
        <small>${r(a)} / ${O(e.created_at)}</small>
      </span>
    </article>
  `}function de(e=u()){const t=i.roles.filter(a=>a.company_id===e);return t.length?t.sort((a,n)=>n.priority-a.priority||a.name.localeCompare(n.name)):[He({id:`owner-${e}`,company_id:e,name:"Owner",color:"#f0b23b",priority:1e3,is_system:!0}),He({id:`admin-${e}`,company_id:e,name:"Admin",color:"#60a5fa",priority:800,is_system:!0}),He({id:`staff-${e}`,company_id:e,name:"Staff",color:"#15803d",priority:100,is_system:!0})]}function ot(e,t){return de(e).find(a=>a.id===t)||null}function Fa(e=u()){return!i.rolePreview||i.rolePreview.company_id!==e?null:ot(e,i.rolePreview.role_id)}function Wa(e,t){if(!t)return!0;const a=String(e?.name||"").toLowerCase();if(["owner","admin","developer"].includes(a))return!0;const n=Cn(t),s=i.rolePermissions.filter(c=>c.role_id===e?.id);if(s.some(c=>(n.includes(c.permission_key)||c.permission_key==="*")&&c.effect==="deny"))return!1;if(s.some(c=>(n.includes(c.permission_key)||c.permission_key==="*")&&c.effect==="allow"))return!0;if(s.length)return!1;const o=jn(e),l=Ke[o]||Ke.member;return l.includes("*")||n.some(c=>l.includes(c))}function Cn(e){return W([e,...pr[e]||[]])}function _t(e,t){const a=String(t||"").toLowerCase();return de(e).find(n=>n.name.toLowerCase()===a||n.id.toLowerCase()===a)?.id||""}function vd(e=u()){const t=de(e).filter(a=>a.name.toLowerCase()!=="owner");return t.find(a=>a.name.toLowerCase()==="staff")?.id||t.find(a=>a.name.toLowerCase()==="member")?.id||t[0]?.id||""}function yd(){const e=new Uint8Array(8);return crypto.getRandomValues(e),`QH-${Array.from(e,t=>t.toString(36).padStart(2,"0")).join("").toUpperCase()}`}function hd(e){const t=new URL(_("/login"),window.location.origin);return t.searchParams.set("invite",e.token),t.toString()}function jn(e){const t=String(e?.name||"").toLowerCase().replace(/\s+/g,"_");return["owner","member","worker","sales","supervisor","admin","developer","construction_supervisor"].includes(t)?t:"member"}function Re(e){return i.profiles.find(t=>t.id===e)||(b().profile.id===e?b().profile:null)}function js(e=u()){const t=i.query.trim().toLowerCase();return Q(e).filter(a=>i.stageFilter!=="all"&&a.stage!==i.stageFilter?!1:t?[a.name,a.client_name,a.contact_name,a.owner_name,a.site_address,a.job_type,T(a.company_id)].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function Et(e=u()){const t=new Map;return Q(e).forEach(a=>{const n=String(a.client_name||"").trim()||"Unassigned customer",s=`account-${Bt(n.toLowerCase())}`;t.has(s)||t.set(s,{key:s,name:n,jobs:[]}),t.get(s).jobs.push(a)}),Array.from(t.values()).map(a=>{const n=a.jobs.slice().sort((E,ne)=>Date.parse(ne.updated_at||ne.created_at||0)-Date.parse(E.updated_at||E.created_at||0)),s=n[0]||null,o=n.map(E=>E.id),l=ae(e).filter(E=>o.includes(E.project_id)),c=ye(e).filter(E=>o.includes(E.linked_job_id)),d=Ce(e).filter(E=>o.includes(E.job_id)),f=W(n.map(E=>E.contact_name)),g=W(n.map(E=>E.owner_name)),S=W(n.map(E=>E.site_address)),V=n.map(E=>E.priority||"Medium").sort((E,ne)=>nt(ne)-nt(E))[0]||"Medium";return{...a,jobs:n,tasks:l,latestJob:s,contacts:f,owners:g,addresses:S,forms:c,files:d,primaryContact:f[0]||"No contact",owner:g[0]||"Unassigned",stage:s?.stage||"Lead",priority:V,estimateTotal:me(n,"estimate_total"),fileCount:d.length,formCount:c.length,updatedAt:s?.updated_at||s?.created_at||new Date().toISOString(),subtitle:S[0]||`${n.length} linked job${n.length===1?"":"s"}`}}).sort((a,n)=>Date.parse(n.updatedAt||0)-Date.parse(a.updatedAt||0))}function wd(e=u()){const t=i.crmQuery.trim().toLowerCase();return Et(e).filter(a=>i.crmStageFilter!=="all"&&!a.jobs.some(n=>n.stage===i.crmStageFilter)||i.crmOwnerFilter!=="all"&&!a.owners.includes(i.crmOwnerFilter)?!1:t?[a.name,a.primaryContact,a.owner,a.stage,...a.addresses,...a.contacts,...a.jobs.map(n=>n.name)].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function $d(e,t){return Et(e).find(a=>a.key===t)||null}function Sd(e=u()){return W(Q(e).map(t=>t.owner_name)).sort((t,a)=>t.localeCompare(a))}function qs(e=u()){const t=b().profile.member_id||"",a=ae(e).slice().sort(Ja),n=a.filter(An),s=n.filter(S=>S.due===k(0)),o=n.filter(S=>Ai(S.due)<0),l=n.filter(S=>{const V=Ai(S.due);return V>=0&&V<=7}),c=n.filter(S=>S.assignee_id===t),d=n.filter(S=>["review","pending"].includes(S.status)),f=a.filter(S=>S.status==="done"),g=W(o.concat(s,c,d,l).map(S=>S.id)).map(S=>a.find(V=>V.id===S)).filter(Boolean).sort(Ja);return{tasks:a,open:n,dueToday:s,overdue:o,thisWeek:l,assignedToMe:c,review:d,done:f,focus:g}}function qn(e=u()){const t=ye(e).filter(s=>(s.require_approval||s.type==="Client approval")&&!["Archived","Closed","Approved"].includes(s.status)).map(s=>({id:`form:${s.id}`,title:s.title,meta:P(s.linked_job_id)?.name||s.description||"Company form",type:"Form approval",owner:B(s.creator_id),status:s.status,updatedAt:s.updated_at||s.created_at,href:m("forms",{form_id:s.id},e)})),a=ae(e).filter(s=>["review","pending"].includes(s.status)).map(s=>({id:`task:${s.id}`,title:s.title,meta:P(s.project_id)?.name||s.description||"Company task",type:"Task review",owner:B(s.assignee_id),status:we(s.status),updatedAt:s.updated_at||s.due,href:m("tasks",{...s.project_id?{job_id:s.project_id}:{},task_id:s.id},e)})),n=i.memberships.filter(s=>s.company_id===e&&s.status!=="active").map(s=>({id:`access:${s.profile_id||s.member_id}`,title:B(s.member_id||s.profile_id),meta:`${F(s.role)} access request`,type:"Access request",owner:"Quest admin",status:F(s.status),updatedAt:new Date().toISOString(),href:m("settings",{tab:"access"},e)}));return t.concat(a,n).sort((s,o)=>Date.parse(o.updatedAt||0)-Date.parse(s.updatedAt||0))}function Tt(e=u()){const t=i.activeTimer;return!t||t.company_id!==e?null:t}function As(e=u()){return i.timeEntries.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.started_at||0)-Date.parse(t.started_at||0))}function hi(e=u(),t=0){return As(e).filter(a=>Date.parse(a.started_at||0)>=t).reduce((a,n)=>a+R(n.duration_ms),0)}function kd(e=u(),t=""){if(!y("time.track",e,"Your role cannot track time in this workspace.","Time"))return;i.activeTimer&&Ms(!1);const a=t?qa(t):null;i.activeTimer={id:`timer-${crypto.randomUUID()}`,company_id:e,user_id:b().profile.member_id||b().profile.id,task_id:a?.company_id===e?a.id:"",task_title:a?.company_id===e?a.title:"",started_at:new Date().toISOString()},Qs(),i.sync={label:"Clock started locally",mode:"local"},p()}function Ms(e=!0){const t=i.activeTimer;if(!t)return;const a=new Date().toISOString(),n=Math.max(0,Date.parse(a)-Date.parse(t.started_at||a));i.timeEntries.unshift({id:`time-${crypto.randomUUID()}`,company_id:t.company_id,user_id:t.user_id,task_id:t.task_id||"",task_title:t.task_title||"",started_at:t.started_at,ended_at:a,duration_ms:n,notes:t.task_title?"Task timer":"General shift"}),i.activeTimer=null,Qs(),i.sync={label:"Clock stopped locally",mode:"local"},e&&p()}function An(e){return e.status!=="done"}function Ja(e,t){const a=Date.parse(e.due||0)-Date.parse(t.due||0);return a||nt(t.priority)-nt(e.priority)}function _e(e=u()){return i.financeInvoices.filter(t=>t.company_id===e).sort(St("updated_at"))}function Is(e=u()){return i.financePayments.filter(t=>t.company_id===e)}function Mn(e=u()){return i.financeExpenses.filter(t=>t.company_id===e).sort(St("updated_at"))}function In(e=u()){return i.financeVendors.filter(t=>t.company_id===e)}function Pe(e){return i.financeInvoices.find(t=>t.id===e)||null}function Fs(e){return i.financeExpenses.find(t=>t.id===e)||null}function Fn(e){return i.financeVendors.find(t=>t.id===e)||null}function Ka(e){return Fn(e)?.name||"No vendor"}function Es(e){return i.financePayments.filter(t=>t.invoice_id===e).sort(St("received_at"))}function En(e){return me(Es(e),"amount")}function pe(e){const t=Pe(e);return Math.max(0,R(t?.total)-En(e))}function Ts(e){const t=pe(e.id);return t<=0&&R(e.total)>0?"Paid":t<R(e.total)?"Partially paid":e.status==="Sent"&&lr(e.due_date)>0?"Overdue":e.status}function xs(e=u()){const t=_e(e),a=Is(e),n=Mn(e).filter(c=>["Approved","Paid"].includes(c.status)),s={current:0,thirty:0,sixty:0,overSixty:0};t.forEach(c=>{const d=pe(c.id);if(!d)return;const f=lr(c.due_date);f<=0?s.current+=d:f<=30?s.thirty+=d:f<=60?s.sixty+=d:s.overSixty+=d});const o=me(a,"amount"),l=me(n,"amount");return{pipeline:me(Q(e),"estimate_total"),invoiced:me(t,"total"),collected:o,outstanding:t.reduce((c,d)=>c+pe(d.id),0),expenses:l,net:o-l,aging:s}}function Dd(e=u(),t=""){const a=i.query.trim().toLowerCase();return ae(e).filter(n=>t&&n.project_id!==t||i.taskStatusFilter!=="all"&&n.status!==i.taskStatusFilter||i.taskPriorityFilter!=="all"&&n.priority!==i.taskPriorityFilter?!1:a?[n.title,n.description,Le(n.type),B(n.assignee_id),P(n.project_id)?.name].some(s=>String(s||"").toLowerCase().includes(a)):!0)}function Tn(){const e=Ue();return i.companies.filter(t=>e.includes(t.id))}function h(e,t=u()){if(!e)return!0;const a=Fa(t);if(a)return Wa(a,e);const n=Cn(e),s=b().profile;if(i.session?.auth==="supabase"){const c=oe(t,s.id);if(!c||c.status!=="active")return!1;if(["owner","developer"].includes(String(c.role).toLowerCase()))return!0;const d=i.roleAssignments.filter(g=>g.company_id===t&&g.profile_id===s.id).map(g=>g.role_id),f=i.rolePermissions.filter(g=>d.includes(g.role_id));if(f.some(g=>(n.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="deny"))return!1;if(f.some(g=>(n.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="allow"))return!0}const o=String(oe(t,s.id)?.role||s.role||"member").toLowerCase(),l=Ke[o]||Ke.member;return l.includes("*")||n.some(c=>l.includes(c))}function y(e,t=u(),a="Your role cannot perform that action.",n="Access"){return h(e,t)?!0:($(a,"local",n),!1)}function Ue(){const e=b().profile,t=i.companies.map(s=>s.id);if(i.session?.auth==="supabase"){const s=i.memberships.filter(o=>o.profile_id===e.id&&o.status==="active").map(o=>w(o.company_id));return W(s).filter(o=>t.includes(o))}if(["developer","admin"].includes(e.role))return W(t.length?t:At.map(s=>w(s.id)));const a=i.memberships.filter(s=>s.profile_id===e.id&&s.status==="active").map(s=>w(s.company_id)),n=a.length?a:e.company_ids||[];return W(n.map(w)).filter(s=>t.includes(s))}function u(){const e=Ue();return e.includes(i.activeCompanyId)?i.activeCompanyId:e[0]||i.activeCompanyId||L()}function L(){return w(At[0].id)}function Ea(e){const t=w(e);return i.companies.find(a=>a.id===t)||At.map(Ze).find(a=>a.id===t)||null}function T(e){const t=Ea(e);return t?xt(t):e||"Company"}function xt(e){return e.short_name||e.label||e.name||e.id}function je(e){return Ea(e)?.color||"#f0b23b"}function Zt(e){return w(i.jobs.find(t=>t.id===e)?.company_id||"")}function Ge(e){const t=Fa(e);if(t)return`Preview: ${t.name}`;const a=b().profile;return i.session?.auth!=="supabase"&&["developer","admin"].includes(a.role)?F(a.role):F(oe(e,a.id)?.role||a.role||"member")}function na(e,t){const a=i.memberships.find(n=>n.company_id===e&&(n.member_id===t||n.profile_id===t));return F(a?.role||"member")}function oe(e,t){return i.memberships.find(a=>a.company_id===e&&a.profile_id===t)||null}function Cd(e=u()){return i.memberships.filter(t=>t.company_id===e&&t.role==="owner"&&t.status==="active")}function Os(e,t){const a=Cd(e);return a.length===1&&a[0].profile_id===t}function jd(e,t,a,n){const s=oe(e,t),o=jn(a);if(s?.role==="owner"&&s.status==="active"&&(o!=="owner"||n!=="active")&&Os(e,t))return"Promote another active Owner before changing the last Owner.";const l=oe(e,b().profile.id),c=String(b().profile.role||"").toLowerCase();return(["owner","developer"].includes(s?.role)||["owner","developer"].includes(o))&&!["owner","developer"].includes(String(l?.role||c).toLowerCase())?"Only an Owner can change Owner or Developer access.":""}function Ot(e=u()){return i.subscriptions.find(t=>t.company_id===e)||null}function qd(){const e=i.workspaceReviews.map(ut),t=i.subscriptions.filter(s=>["pending_review","active","trialing","suspended","canceled"].includes(s.status)).map(s=>ut({company_id:s.company_id,company_name:T(s.company_id),status:s.status,plan_code:s.plan_code,amount_cents:s.amount_cents,currency:s.currency,trial_ends_at:s.trial_ends_at,current_period_end:s.current_period_end,grace_ends_at:s.grace_ends_at,created_at:s.created_at||""})),a=xa().map(s=>ut({company_id:s,company_name:T(s),status:"pending_review"})),n=new Map;return t.concat(a,e).forEach(s=>{s.company_id&&n.set(s.company_id,{...n.get(s.company_id)||{},...s})}),Array.from(n.values()).sort((s,o)=>s.status==="pending_review"&&o.status!=="pending_review"?-1:s.status!=="pending_review"&&o.status==="pending_review"?1:String(s.company_name).localeCompare(String(o.company_name)))}function X(e=u()){if(i.session?.auth!=="supabase")return!0;if(Ta(e))return!1;const t=Ot(e);return!!(!t||["trialing","active","past_due","grace"].includes(t.status)||t.grace_ends_at&&Date.parse(t.grace_ends_at)>Date.now())}function Ta(e=u()){const t=Ot(e);return t?.status==="pending_review"?!0:["active","past_due","grace"].includes(t?.status)?!1:xa().includes(w(e))}function xa(){return $e(un,[]).map(w).filter(Boolean)}function xn(e){const t=w(e);if(!t)return;const a=Array.from(new Set(xa().concat(t)));D(un,a)}function Ad(e){const t=w(e);t&&D(un,xa().filter(a=>a!==t))}function Md(e){const t=String(e||"").trim();return!t||i.inviteLookup?.token!==t?null:i.inviteLookup}function On(e=u()){const t=Ot(e);return t?ia(t.status,t):i.session?.auth==="supabase"?"Approval pending":"Demo mode"}function ia(e,t={}){const a=Oa(e)||String(e||"");return a==="pending_review"?"Awaiting Quest approval":a==="trialing"?`Trial - ${O(t.trial_ends_at)}`:a==="active"?"Active subscription":a==="past_due"?"Past due grace":a==="grace"?`Grace - ${O(t.grace_ends_at)}`:a==="suspended"?"Suspended":a==="canceled"?"Rejected":F(a||"Unknown")}function Oa(e){const t=String(e||"").toLowerCase().trim();return["pending_review","trialing","active","past_due","grace","suspended","canceled","incomplete"].includes(t)?t:""}function Rn(){return String(b().profile?.role||"").toLowerCase()==="developer"}function B(e){const t=i.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function Rt(e){const t=Re(e);return t?.full_name||t?.email||B(e)}function Ra(e){return i.tasks.filter(t=>t.project_id===e).length}function sa(e){return i.files.filter(t=>t.job_id===e).length}function w(e){return{"quest-roofing":"roofing","quest-drafting":"drafting"}[String(e||"").trim()]||String(e||"").trim()}function Pn(e){const t=new Map;return e.map(Ze).forEach(a=>{!a.id||t.has(a.id)||t.set(a.id,a)}),Array.from(t.values())}function Rs(e){const t=new Map;return e.map(oa).forEach(a=>{a.company_id&&t.set(a.company_id,{...t.get(a.company_id)||{},...a})}),Array.from(t.values())}function Ze(e){return{id:w(e.id||""),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function Xe(e){return{id:String(e.id||""),company_id:w(e.company_id||L()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:Dt.includes(e.stage)?e.stage:"Lead",priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:R(e.estimate_total),invoice_total:R(e.invoice_total),task_count:R(e.task_count),file_count:R(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function et(e){const t=ea.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=Ct.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:Oi.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:w(e.company_id||L()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||k(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:ea.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function vt(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:w(e.company_id||L()),job_id:String(e.job_id||""),folder:String(e.folder||Yu(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:R(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Un(e){return{id:String(e.id||`folder-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),name:String(e.name||"New folder").trim()||"New folder",parent_key:String(e.parent_key||"home"),created_by_label:String(e.created_by_label||"Quest HQ"),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Pt(e){const t=Array.isArray(e.questions)?e.questions.map(Pa):[],a=jt.includes(e.type)?e.type:"Internal",n=pn.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:n,audience:String(e.audience||"Internal").trim(),creator_id:String(e.creator_id||e.created_by||e.created_by_id||""),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Pa(e){const t=qt.some(([n])=>n===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(n=>String(n||"").trim()).filter(Boolean):[]};return $t(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function Nn(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function Ut(e){const t=R(e.subtotal),a=R(e.tax),n=R(e.total)||t+a;return{id:String(e.id||`invoice-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),job_id:String(e.job_id||""),client_name:String(e.client_name||"").trim(),invoice_number:String(e.invoice_number||`INV-${Date.now()}`).trim(),status:Ri.includes(e.status)?e.status:"Draft",issue_date:String(e.issue_date||k(0)).slice(0,10),due_date:String(e.due_date||k(30)).slice(0,10),subtotal:t,tax:a,total:n,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Nt(e){return{id:String(e.id||`payment-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),invoice_id:String(e.invoice_id||""),amount:R(e.amount),method:Ni.includes(e.method)?e.method:"ACH",received_at:String(e.received_at||k(0)).slice(0,10),reference:String(e.reference||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString()}}function Lt(e){return{id:String(e.id||`expense-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),job_id:String(e.job_id||""),vendor_id:String(e.vendor_id||""),category:ka.includes(e.category)?e.category:"Other",amount:R(e.amount),status:Pi.includes(e.status)?e.status:"Pending",spent_at:String(e.spent_at||k(0)).slice(0,10),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Qt(e){return{id:String(e.id||`vendor-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),name:String(e.name||"New vendor").trim()||"New vendor",contact_name:String(e.contact_name||"").trim(),email:String(e.email||"").trim(),phone:String(e.phone||"").trim(),category:ka.includes(e.category)?e.category:"Other",status:Ui.includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ln(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,supervisor_id:String(e.supervisor_id||e.manager_id||""),company_ids:Array.isArray(e.company_ids)?W(e.company_ids.map(w)):[]}}function ra(e){const t=["active","pending","disabled","left"].includes(String(e.status))?String(e.status):"active";return{company_id:w(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:t,disabled_at:e.disabled_at||"",disabled_by:String(e.disabled_by||""),left_at:e.left_at||"",last_active_at:e.last_active_at||""}}function oa(e){return{company_id:w(e.company_id||""),status:Oa(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:R(e.amount_cents||3e4),currency:String(e.currency||"usd"),stripe_customer_id:String(e.stripe_customer_id||""),stripe_subscription_id:String(e.stripe_subscription_id||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||""}}function ut(e){return{company_id:w(e.company_id||""),company_name:String(e.company_name||e.name||e.short_name||e.company_id||"").trim(),status:Oa(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:R(e.amount_cents||3e4),currency:String(e.currency||"usd"),owner_profile_id:String(e.owner_profile_id||""),owner_name:String(e.owner_name||""),owner_email:String(e.owner_email||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||"",updated_at:e.updated_at||""}}function He(e){return{id:String(e.id||""),company_id:w(e.company_id||""),name:String(e.name||"Role").trim()||"Role",color:String(e.color||"#f0b23b"),priority:R(e.priority),is_system:e.is_system===!0,created_by:String(e.created_by||"")}}function Ga(e){return{role_id:String(e.role_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function Ps(e){return{company_id:w(e.company_id||""),profile_id:String(e.profile_id||""),role_id:String(e.role_id||""),assigned_by:String(e.assigned_by||"")}}function Id(e){return{id:String(e.id||""),company_id:w(e.company_id||""),resource_type:String(e.resource_type||""),resource_id:String(e.resource_id||""),principal_type:String(e.principal_type||""),principal_id:String(e.principal_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function Fd(e){return{id:String(e.id||""),company_id:w(e.company_id||""),resource_type:String(e.resource_type||""),field_key:String(e.field_key||""),role_id:String(e.role_id||""),visibility:["visible","masked","hidden"].includes(e.visibility)?e.visibility:"visible",editable:e.editable!==!1}}function la(e){return{id:String(e.id||""),company_id:w(e.company_id||""),email:String(e.email||""),role_id:String(e.role_id||""),token:String(e.token||""),status:String(e.status||"pending"),expires_at:e.expires_at||"",invited_by:String(e.invited_by||""),accepted_by:String(e.accepted_by||""),created_at:e.created_at||""}}function Us(e){return{id:String(e.id||""),company_id:w(e.company_id||""),profile_id:String(e.profile_id||""),requested_email:String(e.requested_email||""),status:String(e.status||"pending"),message:String(e.message||""),reviewed_by:String(e.reviewed_by||""),created_at:e.created_at||""}}function ve(e){return{id:String(e.id||""),company_id:w(e.company_id||""),title:String(e.title||"Messages").trim()||"Messages",type:fn.includes(e.type)?e.type:"custom",created_by:String(e.created_by||""),last_message_at:e.last_message_at||e.updated_at||e.created_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ee(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:w(e.company_id||""),target_type:["all_company","role","profile"].includes(e.target_type)?e.target_type:"profile",target_id:String(e.target_id||""),created_at:e.created_at||""}}function Se(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:w(e.company_id||""),sender_profile_id:String(e.sender_profile_id||e.created_by||""),body:String(e.body||""),message_type:String(e.message_type||"text"),deleted_at:e.deleted_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Te(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),message_id:String(e.message_id||""),company_id:w(e.company_id||""),bucket_id:String(e.bucket_id||"quest-message-attachments"),object_path:String(e.object_path||""),file_name:String(e.file_name||"attachment"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:R(e.size_bytes),preview_url:String(e.preview_url||""),created_at:e.created_at||new Date().toISOString()}}function Vt(e){return{conversation_id:String(e.conversation_id||""),company_id:w(e.company_id||""),profile_id:String(e.profile_id||""),last_read_at:e.last_read_at||"",updated_at:e.updated_at||e.last_read_at||""}}function tt(e){const t=e.starts_at||new Date().toISOString(),a=Sa.includes(e.event_type)?e.event_type:"Company event",n=["company","private"].includes(e.visibility)?e.visibility:"company",s=["","job","task","form","invoice"].includes(e.linked_type)?e.linked_type:"";return{id:String(e.id||`calendar-${crypto.randomUUID()}`),company_id:w(e.company_id||L()),title:String(e.title||"Calendar event").trim()||"Calendar event",description:String(e.description||"").trim(),event_type:a,starts_at:t,ends_at:e.ends_at||t,all_day:e.all_day===!0||e.all_day==="true"||e.all_day==="on",visibility:n,linked_type:s,linked_id:String(e.linked_id||""),assigned_profile_id:String(e.assigned_profile_id||""),created_by:String(e.created_by||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function wi(e){return{id:e.id,company_id:e.company_id,title:e.title,type:e.type,created_by:e.created_by||b().profile.id,last_message_at:e.last_message_at||null}}function Ed(e){return{conversation_id:e.conversation_id,company_id:e.company_id,target_type:e.target_type,target_id:e.target_id}}function Td(e){return{id:e.id,conversation_id:e.conversation_id,company_id:e.company_id,sender_profile_id:e.sender_profile_id,body:e.body,message_type:e.message_type,deleted_at:e.deleted_at||null}}function xd(e){return{id:e.id,conversation_id:e.conversation_id,message_id:e.message_id,company_id:e.company_id,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes}}function Od(e){return{id:kt(e.id)?e.id:void 0,company_id:e.company_id,title:e.title,description:e.description,event_type:e.event_type,starts_at:e.starts_at,ends_at:e.ends_at||e.starts_at,all_day:e.all_day,visibility:e.visibility,linked_type:e.linked_type||"",linked_id:e.linked_id||"",assigned_profile_id:e.assigned_profile_id||"",created_by:kt(e.created_by)?e.created_by:b().profile.id}}function Rd(e){return{conversation_id:e.conversation_id,company_id:e.company_id,profile_id:e.profile_id,last_read_at:e.last_read_at||new Date().toISOString()}}function Pd(e=u()){return Xe({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function Ud(e=u(),t=""){return et({id:"",title:"",company_id:e,project_id:t,assignee_id:rt(e)[0]?.id||"abraham",creator_id:b().profile.member_id||"abraham",due:k(1),priority:"medium",status:"todo",type:"admin"})}function Nd(e=u()){const t=Ee();return Ut({id:"",company_id:e,job_id:t?.company_id===e?t.id:"",client_name:t?.company_id===e?t.client_name:"",invoice_number:Hu(e),status:"Draft",issue_date:k(0),due_date:k(30),subtotal:t?.company_id===e?t.estimate_total:0,tax:0,notes:""})}function Ld(e=u(),t=""){const a=t?Pe(t):_e(e).find(s=>pe(s.id)>0),n=a?.company_id===e?a:null;return Nt({id:"",company_id:e,invoice_id:n?.id||"",amount:n?pe(n.id):0,method:"ACH",received_at:k(0),reference:"",notes:""})}function Qd(e=u(),t=""){return Lt({id:"",company_id:e,job_id:Ee()?.company_id===e?Ee().id:"",vendor_id:t||In(e)[0]?.id||"",category:"Materials",status:"Pending",amount:0,spent_at:k(0),notes:""})}function Vd(e=u()){return Qt({id:"",company_id:e,name:"",category:"Materials",status:"Active"})}function Yd(e=u()){const t=new Date;t.setHours(t.getHours()+1,0,0,0);const a=new Date(t);return a.setHours(t.getHours()+1),tt({id:"",company_id:e,title:"",description:"",event_type:"Company event",starts_at:t.toISOString(),ends_at:a.toISOString(),all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:b().profile.member_id||b().profile.id,created_by:b().profile.id})}function Bd(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function Hd(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function b(){return i.session?i.session.auth==="supabase"?i.session:{...i.session,profile:{...Za().profile,...i.session.profile||{},...i.profileDraft||{}}}:Za()}function zd(e,t){const a=!!(e.user.email_confirmed_at||e.user.confirmed_at);return{auth:"supabase",access_token:e.access_token,refresh_token:e.refresh_token,user:{id:e.user.id,email:e.user.email||"",email_confirmed_at:e.user.email_confirmed_at||e.user.confirmed_at||"",email_verified:a},profile:yt(t||{},{id:e.user.id,email:e.user.email||"",full_name:e.user.user_metadata?.full_name||e.user.email||"Quest user",role:"member",member_id:"",company_ids:[],avatar_url:"",email_verified:a})}}function Za(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",email_verified:!0,...i.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:We.localUsername,email:e.email},profile:e}}function yt(e,t={}){const a=String(e.role||t.role||"member").toLowerCase(),n=typeof e.email_verified=="boolean"?e.email_verified:t.email_verified===!0;return{id:String(e.id||t.id||""),email:String(e.email||t.email||""),full_name:String(e.full_name||t.full_name||e.email||t.email||"Quest user"),role:a,role_label:F(a),member_id:String(e.member_id||t.member_id||""),company_ids:Array.isArray(e.company_ids)?W(e.company_ids.map(w)):t.company_ids||[],avatar_url:String(e.avatar_url||t.avatar_url||""),approved:e.approved!==!1,email_verified:n,supervisor_id:String(e.supervisor_id||t.supervisor_id||"")}}function ht(e){const t=Wd(e.html||e.meta||""),a=e.read_at||(e.read===!0?e.created_at||new Date().toISOString():"");return{id:String(e.id||`notification-${crypto.randomUUID()}`),company_id:w(e.company_id||""),recipient_profile_id:String(e.recipient_profile_id||e.profile_id||e.member_id||"basic-quest-user"),type:String(e.type||(e.task_id?"task.notification":"general")),title:String(e.title||e.meta||"Notification"),body:String(e.body||t||""),href:String(e.href||""),source_type:String(e.source_type||(e.task_id?"task":"")),source_id:String(e.source_id||e.task_id||""),read_at:String(a||""),created_at:String(e.created_at||new Date().toISOString())}}function Wd(e){return String(e||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}function Jd(e=b()){return e.auth!=="supabase"?!0:e.user?.email_verified===!0||!!e.user?.email_confirmed_at||e.profile?.email_verified===!0}function G(e,t,a=""){const n=ts();return`
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${z(n)}</span>
        <div>
          <div class="context-line"><span>${r(T(u()))}</span><b>${r(Ge(u()))}</b></div>
          <h1>${r(e)}</h1>
          <p>${r(t)}</p>
        </div>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function Qn(e){return`
    <button class="queue-row" type="button" data-select-task="${r(e.id)}">
      <span><strong>${r(e.title)}</strong><small>${r(P(e.project_id)?.name||T(e.company_id))}</small></span>
      ${Vn(e.priority)}
      <b>${r(we(e.status))}</b>
    </button>
  `}function Kd(e){return`
    <button class="job-card priority-${r(e.priority.toLowerCase())} ${e.id===i.selectedJobId?"active":""}" type="button" data-select-job="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.client_name||"No client")}</span>
      <small>${r(T(e.company_id))} - ${r(e.owner_name||"Unassigned")}</small>
      <em>${r(Ra(e.id))} tasks</em>
    </button>
  `}function Wt(e,t,a,n){return`
    <a class="mini-link" href="${_(e)}" data-router>
      <i class="ti ${r(t)}"></i>
      <span><strong>${r(a)}</strong><small>${r(n)}</small></span>
    </a>
  `}function H(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${r(t)}</span><strong>${r(a)}</strong></div>`).join("")}</div>`}function I(e,t,a="",n=!1,s="text",o=""){return`<label class="${r(o)}"><span>${r(e)}</span><input name="${r(t)}" type="${r(s)}" value="${r(a)}" ${n?"required":""} /></label>`}function ke(e,t,a="",n=""){return`<label class="${r(n)}"><span>${r(e)}</span><textarea name="${r(t)}" rows="4">${r(a)}</textarea></label>`}function U(e,t,a,n){return`
    <label><span>${r(e)}</span><select name="${r(t)}">
      ${n.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function Ns(e){return`<span class="priority ${r(String(e).toLowerCase())}">${r(e)}</span>`}function Vn(e){return`<span class="priority ${r(e)}">${r(F(e))}</span>`}function Ls(e){return`<span class="status-pill ${r(e)}">${r(we(e))}</span>`}function Gd(e){return`<span class="finance-status ${r(Bt(e))}">${r(e)}</span>`}function te(e,t){if(e.avatar_url)return`<span class="${r(t)}"><img src="${r(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(n=>n[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${r(t)}">${r(a)}</span>`}function Zd(e=u()){const t=ie(e).filter(a=>a.status==="active").map(a=>[a.profile_id||a.member_id,a.name||a.email||a.member_id]);return[["","Unassigned"]].concat(t)}function $i(e){const t=new Date(e||Date.now());if(Number.isNaN(t.getTime()))return"";const a=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),o=String(t.getHours()).padStart(2,"0"),l=String(t.getMinutes()).padStart(2,"0");return`${a}-${n}-${s}T${o}:${l}`}function Si(e){const t=new Date(e||Date.now());return Number.isNaN(t.getTime())?new Date().toISOString():t.toISOString()}function v(e){return`<div class="empty-state">${z("q-empty","empty-symbol")}<span>${r(e)}</span></div>`}function ce(e,t){const a={};return t.forEach(n=>{const s=e.get(n);s&&(a[n]=s)}),a}function Z(){i.session?.auth!=="supabase"&&(D(en,i.jobs),D(tn,i.tasks),D(an,i.files),D(nn,i.driveFolders),D(it,i.forms),D(pa,i.formResponses),D(on,i.financeInvoices),D(ln,i.financePayments),D(cn,i.financeExpenses),D(dn,i.financeVendors),D(fa,i.timeEntries),D(ga,i.activeTimer),D(sn,i.teamMembers),D(rn,i.memberships),D(ba,i.notifications),D(_a,i.messageConversations),D(va,i.messageAccess),D(ya,i.messages),D(ha,i.messageReads),D(wa,i.messageAttachments),D($a,i.calendarEvents))}function Qs(){i.session?.auth!=="supabase"&&(D(fa,i.timeEntries),D(ga,i.activeTimer))}function Yn(){i.session?.auth!=="supabase"&&D(ba,i.notifications)}function Vs(){i.session?.auth!=="supabase"&&D($a,i.calendarEvents)}function Ne(){i.session?.auth!=="supabase"&&(D(_a,i.messageConversations),D(va,i.messageAccess),D(ya,i.messages),D(ha,i.messageReads),D(wa,i.messageAttachments))}function Bn(e,t,a){if(a==="company")return[ee({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"all_company",target_id:"all"})];const n=[];return e.getAll("role_ids").forEach(s=>{s&&n.push(ee({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"role",target_id:s}))}),e.getAll("profile_ids").forEach(s=>{s&&n.push(ee({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:s}))}),n.length?n:[ee({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:b().profile.id})]}function Ua(e,t=!0){if(!e)return;const a=i.messageConversations.find(l=>l.id===e);if(!a)return;const n=new Date().toISOString(),s=b().profile.id,o=Vt({conversation_id:e,company_id:a.company_id,profile_id:s,last_read_at:n});if(i.messageReads=[o].concat(i.messageReads.filter(l=>l.conversation_id!==e||l.profile_id!==s)),Ne(),t&&i.session?.auth==="supabase"){const l=q();l&&l.from("message_reads").upsert(Rd(o),{onConflict:"conversation_id,profile_id"})}}function Ys(e,t,a=[]){const n=m("messages",{conversation:e.id},e.company_id),s=Rt(t.sender_profile_id),o=ca(e).filter(c=>c!==be(e.company_id,t.sender_profile_id)),l=Xd(t.body,e.company_id).filter(c=>c!==be(e.company_id,t.sender_profile_id));e.type==="direct"&&J("message.direct","New direct message",`${s} sent a direct message in ${e.title}.`,n,"message",t.id,e.company_id,o),l.forEach(c=>{Ye({company_id:e.company_id,recipients:[c],type:"message.mention",title:"Mentioned in chat",body:`${s} mentioned you in ${e.title}.`,href:n,sourceType:"message",sourceId:t.id}).catch(d=>console.warn("Message mention notification failed",d))}),a.length&&J("message.attachment","Attachment shared",`${s} shared ${a.length} attachment${a.length===1?"":"s"} in ${e.title}.`,n,"message",t.id,e.company_id,o)}function Xd(e="",t=u()){const a=String(e||"").toLowerCase();return a.includes("@")?ie(t).filter(n=>a.includes(`@${String(n.name||"").split(/\s+/)[0].toLowerCase()}`)||a.includes(`@${String(n.name||"").toLowerCase()}`)).map(n=>be(t,n.profile_id||n.member_id)).filter(Boolean):[]}function eu(e){const t=Re(e);if(t)return t;const a=i.teamMembers.find(n=>n.id===e);return{id:e,full_name:a?.full_name||a?.name||e||"Quest user",email:a?.email||"",avatar_url:a?.avatar_url||""}}function Ve(e){const t=String(e?.name||"").trim();if(t&&!ma(t))return t;const a=String(e?.email||"").trim();return a?a.split("@")[0]||a:"Workspace user"}function tu(e){return W([e?.email,e?.role_label||F(e?.role||""),F(e?.status||"")]).join(" / ")||"Company member"}function ki(e){return{id:e?.profile_id||e?.member_id||"",full_name:Ve(e),email:e?.email||"",avatar_url:e?.avatar_url||""}}function au(e){const t=String(e.value||"").trim().toLowerCase(),a=e.closest(".message-modal-form"),n=Array.from(a?.querySelectorAll("[data-message-person-row]")||[]);let s=0;n.forEach(l=>{const c=l.querySelector('input[type="checkbox"]')?.checked,d=!t||String(l.dataset.filterText||"").includes(t),f=c||d;l.hidden=!f,f&&(s+=1)});const o=a?.querySelector("[data-message-filter-count]");o&&(o.textContent=t?`${s} match${s===1?"":"es"}`:`${n.length} member${n.length===1?"":"s"}`)}function Bs(e){return{company:"q-symbol-company-chat",role:"q-symbol-role-chat",custom:"q-symbol-messages",direct:"q-symbol-direct-chat"}[e]||"q-symbol-messages"}function Hn(e){const t=Aa(e.id);if(e.type==="company"||t.some(s=>s.target_type==="all_company"))return"Everyone in this company";const a=t.filter(s=>s.target_type==="role").map(s=>ot(e.company_id,s.target_id)?.name||"Role"),n=t.filter(s=>s.target_type==="profile").map(s=>Rt(s.target_id));return a.concat(n).slice(0,5).join(", ")||"Private chat"}function nu(e){return r(e).replace(/(^|\s)@([\w.-]+)/g,"$1<strong>@$2</strong>")}function iu(e){const t=Number(e||0);return t>=1024*1024?`${(t/1024/1024).toFixed(1)} MB`:t>=1024?`${Math.round(t/1024)} KB`:`${t} B`}function Hs(e){return new Promise(t=>{const a=new FileReader;a.onload=()=>t(String(a.result||"")),a.onerror=()=>t(""),a.readAsDataURL(e)})}function su(e,t){const a=q();if(i.session?.auth!=="supabase"||!a?.channel||!t)return;const n=`${e}:${t}`;i.messageRealtimeKey!==n&&(i.messageRealtimeChannel&&a.removeChannel(i.messageRealtimeChannel),i.messageRealtimeKey=n,i.messageRealtimeChannel=a.channel(`quest-messages-${t}`).on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:`conversation_id=eq.${t}`},()=>{i.dataLoaded=!1,p()}).on("postgres_changes",{event:"*",schema:"public",table:"message_attachments",filter:`conversation_id=eq.${t}`},()=>{i.dataLoaded=!1,p()}).subscribe())}function ru(e){const t=[()=>Xt(e,"Crew weather delay","role","Manager posted a weather delay update.",!0),()=>Xt(e,"Permit questions","custom","A permit packet PDF was shared.",!1,!0),()=>Xt(e,"Shan Kumar","direct","Can you jump on this when you are back?",!0),()=>ou(e,"@Joshua you were mentioned in the launch room.")],a=Math.floor(Math.random()*t.length);t[a]()}function Xt(e,t,a,n,s=!1,o=!1){const l=new Date().toISOString(),c=ve({id:`msg-conv-${crypto.randomUUID()}`,company_id:e,title:t,type:a,created_by:"basic-quest-user",last_message_at:l,created_at:l,updated_at:l}),d=a==="direct"?[ee({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:c.id,target_type:"profile",target_id:"basic-quest-user"}),ee({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:c.id,target_type:"profile",target_id:"shan"})]:Bn(new FormData,c,a==="role"?"role":"company");i.messageConversations.unshift(c),i.messageAccess=d.concat(i.messageAccess);const f=Se({id:`msg-${crypto.randomUUID()}`,conversation_id:c.id,company_id:e,sender_profile_id:s?"shan":"basic-quest-user",body:n,created_at:l,updated_at:l,message_type:o?"attachment":"text"});i.messages.push(f),o&&i.messageAttachments.push(Te({id:`msg-attachment-${crypto.randomUUID()}`,conversation_id:c.id,message_id:f.id,company_id:e,file_name:"permit-packet.pdf",mime_type:"application/pdf",size_bytes:42e4,created_at:l})),s||Ua(c.id,!1),i.selectedConversationId=c.id,Ne(),$("Demo message scenario added.","local","Messages"),j(m("messages",{conversation:c.id},e),{replace:!0})}function ou(e,t){const a=ys(e)||xe(e)[0];if(!a)return Xt(e,"Demo chat","company",t,!0);const n=new Date().toISOString(),s=Se({id:`msg-${crypto.randomUUID()}`,conversation_id:a.id,company_id:e,sender_profile_id:"shan",body:t,created_at:n,updated_at:n});i.messages.push(s),i.messageConversations=i.messageConversations.map(o=>o.id===a.id?{...o,last_message_at:n,updated_at:n}:o),Ys(a,s,[]),Ne(),$("Demo mention added.","local","Messages"),p()}function lu(){i.messageConversations=gn.map(ve),i.messageAccess=bn.map(ee),i.messages=_n.map(Se),i.messageReads=yn.map(Vt),i.messageAttachments=vn.map(Te),i.selectedConversationId="",Ne(),$("Demo messages reset.","local","Messages"),p()}function cu(e){return{id:e.id,company_id:e.company_id,recipient_profile_id:e.recipient_profile_id,type:e.type,title:e.title,body:e.body,href:e.href,source_type:e.source_type,source_id:e.source_id,read_at:e.read_at||null,created_at:e.created_at}}function zs(e=""){const t=String(e||"").split(".")[0];return{access:"Access",approval:"Approval",calendar:"Calendar",file:"Files",finance:"Finance",form:"Forms",message:"Messages",task:"Tasks"}[t]||"Inbox"}async function Ye(e){const t=w(e.companyId||e.company_id||u()),a=du(t,e.recipients,{excludeActor:e.excludeActor===!0,type:e.type,href:e.href});if(!a.length)return[];const n=new Date().toISOString(),s=a.map(o=>ht({id:`notification-${crypto.randomUUID()}`,company_id:t,recipient_profile_id:o,type:e.type||"general",title:e.title||"Notification",body:e.body||"",href:e.href||"",source_type:e.sourceType||e.source_type||"",source_id:e.sourceId||e.source_id||"",created_at:n}));if(i.session?.auth==="supabase"){const o=q();if(!o)return[];const l=await o.from("notifications").insert(s.map(cu)).select();if(l.error)return console.warn("Notification insert failed",l.error),[];const c=(l.data||[]).map(ht);return Di(c),p(),c}return Di(s),Yn(),p(),s}function Di(e){if(!e.length)return;const t=new Map;e.concat(i.notifications).forEach(a=>t.set(a.id,a)),i.notifications=[...t.values()].sort((a,n)=>Date.parse(n.created_at||0)-Date.parse(a.created_at||0)).slice(0,200)}function du(e,t=[],a={}){let s=(Array.isArray(t)?t:[t]).map(o=>be(e,o)).filter(Boolean);return s.length||(s=Ks(e,a.type||"","","")),s=W(s),i.session?.auth!=="supabase"&&!s.includes(b().profile.id)&&s.push(b().profile.id),a.excludeActor&&(s=s.filter(o=>o!==Ws())),s.filter(o=>uu(e,o)&&mu(e,o,a.type,a.href))}function be(e,t){if(!t)return"";const a=typeof t=="object"?String(t.profile_id||t.id||t.member_id||t.target_id||"").trim():String(t).trim();if(!a)return"";if(Re(a)||oe(e,a))return a;const n=b().profile;if(a===n.id||a===n.member_id||a===n.email)return n.id;const s=ie(e).find(l=>[l.profile_id,l.member_id,l.email,l.name].filter(Boolean).includes(a));if(s?.profile_id)return s.profile_id;const o=i.profiles.find(l=>l.member_id===a||l.email===a||l.full_name===a);return o?.id?o.id:i.session?.auth==="supabase"?"":a}function uu(e,t){if(!t)return!1;if(t===b().profile.id&&i.session?.auth!=="supabase")return!0;const a=oe(e,t);if(a)return a.status==="active";const n=ie(e).find(s=>s.profile_id===t||s.member_id===t);return i.session?.auth!=="supabase"?!0:n?.status==="active"}function Ws(){return b().profile.id||b().profile.member_id||""}function mu(e,t,a="",n=""){const s=pu(a,n);return s?Js(e,t,s):!0}function pu(e="",t=""){const a=`${e} ${t}`;return a.includes("finance")?"finance.view":a.includes("message")?"messages.view":a.includes("calendar")?"calendar.view":a.includes("file")?"files.view":a.includes("approval")?"approvals.view":a.includes("form")?"forms.view":a.includes("task")?"tasks.view":""}function Js(e,t,a){if(!a)return!0;if(t===b().profile.id)return h(a,e);const n=oe(e,t);if(i.session?.auth==="supabase"&&(!n||n.status!=="active"))return!1;const s=String(n?.role||ie(e).find(f=>f.profile_id===t)?.role||"member").toLowerCase();if(["owner","admin","developer"].includes(s))return!0;const o=Cn(a),l=i.roleAssignments.filter(f=>f.company_id===e&&f.profile_id===t).map(f=>f.role_id),c=i.rolePermissions.filter(f=>l.includes(f.role_id));if(c.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="deny"))return!1;if(c.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="allow"))return!0;const d=Ke[s]||Ke.member;return d.includes("*")||o.some(f=>d.includes(f))}function Ks(e,t="",a="",n=""){const s=String(t||"").split(".")[0];return s==="finance"?ue(e,["finance.view"]):s==="message"?ue(e,["messages.view"]):s==="calendar"?gu(n).concat(ue(e,["calendar.manage"])):s==="file"?ue(e,["files.view"]).concat(fu(e,n)):s==="form"?ue(e,["forms.view","forms.manage"]):s==="approval"?ue(e,["approvals.view","approvals.manage"]):s==="access"?ue(e,["users.manage","settings.manage"]):[Ws()]}function ue(e,t){return W(ie(e).filter(a=>a.status==="active").map(a=>be(e,a.profile_id||a.member_id)).filter(a=>t.some(n=>Js(e,a,n))))}function Xa(e,t=!0){return e?W([e.assignee_id,t?e.creator_id:"",...Array.isArray(e.watchers)?e.watchers:[]].map(a=>be(e.company_id,a)).filter(Boolean)):[]}function fu(e,t){return t?W(i.tasks.filter(a=>a.company_id===e&&a.project_id===t).flatMap(a=>Xa(a))):[]}function gu(e){const t=i.calendarEvents.find(a=>a.id===e);return t?W([t.assigned_profile_id,t.created_by].map(a=>be(t.company_id,a)).filter(Boolean)):[]}function ca(e){if(!e)return[];const a=Aa(e.id).flatMap(n=>n.target_type==="all_company"?ue(e.company_id,["messages.view"]):n.target_type==="profile"?[be(e.company_id,n.target_id)]:n.target_type==="role"?ie(e.company_id).filter(s=>s.status==="active"&&(s.role_id===n.target_id||_t(e.company_id,s.role)===n.target_id)).map(s=>be(e.company_id,s.profile_id||s.member_id)):[]);return W(a.filter(Boolean))}async function bu(e=u()){const t=new Date().toISOString(),a=b().profile.id,n=i.notifications.filter(s=>s.company_id===e&&s.recipient_profile_id===a&&!s.read_at).map(s=>s.id);if(n.length&&(i.notifications=i.notifications.map(s=>s.company_id===e&&s.recipient_profile_id===a&&!s.read_at?{...s,read_at:t}:s),Yn(),p(),i.session?.auth==="supabase")){const s=q();s&&await s.from("notifications").update({read_at:t}).in("id",n).eq("recipient_profile_id",a)}}async function _u(e){const t=i.notifications.find(n=>n.id===e);if(!t)return;const a=new Date().toISOString();if(i.notifications=i.notifications.map(n=>n.id===t.id?{...n,read_at:n.read_at||a}:n),i.notificationMenuOpen=!1,Yn(),p(),i.session?.auth==="supabase"&&!t.read_at){const n=q();n&&await n.from("notifications").update({read_at:a}).eq("id",t.id).eq("recipient_profile_id",b().profile.id)}t.href&&j(t.href)}function Ci(e,t=null){const a=m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),n=B(e.assignee_id);if(!t){Ye({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task assigned",body:`${Y()} assigned ${e.title} to ${n}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s));return}t.assignee_id!==e.assignee_id&&Ye({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task reassigned",body:`${Y()} reassigned ${e.title} to ${n}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s)),t.priority!==e.priority&&Ye({companyId:e.company_id,recipients:Xa(e),excludeActor:!0,type:"task.priority",title:"Task priority changed",body:`${Y()} set priority to ${F(e.priority)} on ${e.title}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s)),t.status!==e.status&&Ye({companyId:e.company_id,recipients:Xa(e),excludeActor:!0,type:"task.status",title:"Task status changed",body:`${Y()} moved ${e.title} to ${we(e.status)}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s))}function J(e,t,a,n,s="",o="",l=u(),c=null){Ye({companyId:l,recipients:c||Ks(l,e,s,o),type:e,title:t,body:a,href:n,sourceType:s,sourceId:o}).catch(d=>console.warn("Notification event failed",d))}async function at(e,t,a,n,s={},o=!1){const l={id:`audit-${crypto.randomUUID()}`,company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:n,details:s,created_at:new Date().toISOString()};if(i.auditEvents.unshift(l),o&&i.session?.auth==="supabase"){const c=q();if(c)try{await c.from("audit_events").insert({company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:n,details:s})}catch{}}}function vu(e,t){return t.status==="disabled"?"membership.disabled":t.status==="left"?"membership.left":e&&["disabled","left","pending"].includes(e.status)&&t.status==="active"?"membership.reactivated":e&&e.role!==t.role?"role.changed":"membership.updated"}function Y(){return b().profile.full_name||b().profile.email||"Quest HQ"}function M(e,t,a=""){return`<article class="metric">${z(Ar(e),"metric-symbol")}<span>${r(e)}</span><strong>${r(t)}</strong>${a?`<small>${r(a)}</small>`:""}</article>`}function Fe(e,t){return`<div><strong>${r(e)}</strong><span>${r(t)}</span></div>`}function ze(e,t,a,n,s=""){const o=`
    <span><strong>${r(e)}</strong><small>${r(t||"Finance record")}</small></span>
    <b>${r(a)}</b>
    <em>${O(n)}</em>
  `;return s?`<a class="finance-compact-row" href="${_(s)}" data-router>${o}</a>`:`<div class="finance-compact-row">${o}</div>`}function ji(e,t){const a=Ce(e);return t==="jobs"?a.filter(n=>n.job_id).length:a.filter(n=>n.folder===t).length}function Gs(e="home",t=null){return t?.id?`job:${t.id}`:e||"home"}function yu(e,t="home",a=null){const n=Gs(t,a),s=bt(e).filter(o=>o.parent_key===n).map(o=>hu(e,o));return a?s:t==="home"?mn.map(([l,c,d,f])=>({id:l,name:c,caption:d,icon:f,href:_(m("files",{folder:l},e)),countLabel:`${ji(e,l)} file${ji(e,l)===1?"":"s"}`,updatedLabel:""})).concat(s):t==="jobs"?Q(e).map(l=>({id:`job:${l.id}`,name:l.name,caption:l.client_name||T(e),icon:"ti-folder",href:_(m("files",{folder:"jobs",job_id:l.id},e)),countLabel:`${sa(l.id)} file${sa(l.id)===1?"":"s"}`,updatedLabel:O(l.updated_at)})).concat(s):s}function hu(e,t){const a=bt(e).filter(o=>o.parent_key===t.id).length,n=Ce(e).filter(o=>o.folder===t.id).length,s=a+n;return{id:t.id,name:t.name,caption:"Custom folder",icon:"ti-folder",href:_(m("files",{folder:t.id},e)),countLabel:`${s} item${s===1?"":"s"}`,updatedLabel:O(t.updated_at)}}function wu(e,t,a=null){if(a)return`<span>/</span><a href="${_(m("files",{folder:"jobs"},e))}" data-router>Jobs</a>`;const n=bt(e).find(d=>d.id===t);if(!n)return`<span>/</span><strong>${r(fe(t))}</strong>`;const s=[];let o=n;const l=new Set;for(;o&&!l.has(o.id);)l.add(o.id),s.unshift(o),o=bt(e).find(d=>d.id===o.parent_key);return`${n.parent_key&&!n.parent_key.startsWith("folder-")&&n.parent_key!=="home"?`<span>/</span><a href="${_(m("files",{folder:n.parent_key},e))}" data-router>${r(fe(n.parent_key))}</a>`:""}${s.map((d,f)=>`<span>/</span>${f===s.length-1?`<strong>${r(d.name)}</strong>`:`<a href="${_(m("files",{folder:d.id},e))}" data-router>${r(d.name)}</a>`}`).join("")}`}function $u(e=u(),t="home",a=""){const n=(i.fileQuery||i.query||"").trim().toLowerCase(),s=i.fileCategoryFilter;let o=Ce(e);return a?o=o.filter(l=>l.job_id===a):t&&t!=="home"&&(t==="jobs"?o=o.filter(l=>l.job_id):o=o.filter(l=>l.folder===t)),s&&s!=="All categories"&&(o=o.filter(l=>String(l.category||fe(l.folder)).toLowerCase()===s.toLowerCase())),n&&(o=o.filter(l=>[l.file_name,l.category,l.uploaded_by_label,l.notes,l.object_path,P(l.job_id)?.name].some(c=>String(c||"").toLowerCase().includes(n)))),o.sort((l,c)=>new Date(c.created_at||0)-new Date(l.created_at||0))}function qe(e){const t={pdf:"PDF",image:"Image",archive:"Archive",sheet:"Excel",doc:"Word",presentation:"PowerPoint",text:"Text",video:"Video",audio:"Audio",code:"Code",data:"Data",design:"Design",cad:"CAD",email:"Email"},a=Na(e);if(t[a])return t[a];const n=La(e);return n?n.toUpperCase():fe(e.folder)}function Na(e){const t=String(e.mime_type||"").toLowerCase(),a=La(e);return t.includes("pdf")||a==="pdf"?"pdf":t.includes("image")||["png","jpg","jpeg","gif","webp","svg","bmp","tif","tiff","heic","ico"].includes(a)?"image":t.includes("zip")||t.includes("compressed")||["zip","rar","7z","tar","gz","tgz","bz2"].includes(a)?"archive":t.includes("spreadsheet")||t.includes("excel")||["xls","xlsx","xlsm","ods","csv"].includes(a)?"sheet":t.includes("word")||["doc","docx","odt","rtf"].includes(a)?"doc":t.includes("presentation")||["ppt","pptx","pps","odp"].includes(a)?"presentation":t.includes("video")||["mp4","mov","avi","mkv","webm","wmv","m4v"].includes(a)?"video":t.includes("audio")||["mp3","wav","aac","flac","m4a","ogg"].includes(a)?"audio":["js","ts","jsx","tsx","html","css","scss","json","xml","yml","yaml","md","sql","py","rb","php","java","cs","cpp","c","go","rs","sh","ps1"].includes(a)?"code":["txt","log"].includes(a)||t.includes("text")?"text":["ai","psd","sketch","fig"].includes(a)?"design":["dwg","dxf","rvt","ifc","step","stp"].includes(a)?"cad":["eml","msg"].includes(a)?"email":["db","sqlite","bak"].includes(a)?"data":"file"}function zn(e){return Na(e)}function La(e){return String(e.file_name||"").split(".").pop()?.toLowerCase()||""}function Su(e){return e.type==="image/png"?"png":e.type==="image/webp"?"webp":"jpg"}function Wn(e,t=!1){return e.signed_url&&Na(e)==="image"?`<img src="${r(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${r(zn(e))} ${t?"large":""}">${rr(e,qe(e))}<small>${r(Zs(e))}</small></span>`}function Zs(e){const t=qe(e),a=La(e);return t==="Image"?a&&a.length<=4?a.toUpperCase():"IMG":t==="Archive"?a&&a.length<=3?a.toUpperCase():"ZIP":t==="Excel"?a==="csv"?"CSV":"XLS":t==="Word"?"DOC":t==="PowerPoint"?"PPT":t==="Video"?"VID":t==="Audio"?"AUD":t==="Code"?a&&a.length<=4?a.toUpperCase():"CODE":t==="Design"?a&&a.length<=4?a.toUpperCase():"DES":t==="CAD"?a&&a.length<=4?a.toUpperCase():"CAD":t==="Email"?a&&a.length<=4?a.toUpperCase():"MAIL":t==="Data"?a&&a.length<=4?a.toUpperCase():"DATA":t==="Text"?a&&a.length<=4?a.toUpperCase():"TXT":t.length<=4?t.toUpperCase():(a||"FILE").slice(0,4).toUpperCase()}function ye(e=u()){return i.forms.filter(t=>t.company_id===e)}function ku(e=u()){const t=i.formQuery.trim().toLowerCase(),a=i.route?.jobId||"";return ye(e).filter(n=>a&&n.linked_job_id!==a||i.formTypeFilter!=="all"&&n.type!==i.formTypeFilter?!1:t?[n.title,n.description,n.type,n.status,n.audience,P(n.linked_job_id)?.name].some(s=>String(s||"").toLowerCase().includes(t)):!0)}function wt(e=u()){const t=i.route?.jobId||"",a=ye(e).filter(o=>!t||o.linked_job_id===t),n=i.route?.params?.get("form_id")||"";if(n&&a.some(o=>o.id===n)&&(i.selectedFormId=n),!a.length)return i.selectedFormId="",i.selectedQuestionId="",null;let s=a.find(o=>o.id===i.selectedFormId)||a[0];return i.selectedFormId=s.id,(!i.selectedQuestionId||!s.questions.some(o=>o.id===i.selectedQuestionId))&&(i.selectedQuestionId=s.questions[0]?.id||""),s}function Ae(e){return i.forms.find(t=>t.id===e)||null}function he(){return Ae(i.selectedFormId)||wt(u())}function Xs(e=u()){return i.formResponses.filter(t=>t.company_id===e)}function Qa(e){return i.formResponses.filter(t=>t.form_id===e)}function er(e){return Array.isArray(e?.questions)?e.questions.length:0}function Du(e){const t=String(e?.creator_id||""),a=b().profile;return t?t&&(t===a.member_id||t===a.id)?a.full_name||"Quest Basic Mode":B(t)||e?.created_by_label||"Quest HQ":e?.created_by_label||a.full_name||"Quest HQ"}function dt(e,t,a="",n=!1,s="text"){return`<label><span>${r(e)}</span><input data-form-field="${r(t)}" type="${r(s)}" value="${r(a)}" ${n?"required":""} /></label>`}function tr(e,t,a=""){return`<label><span>${r(e)}</span><textarea data-form-field="${r(t)}" rows="3">${r(a)}</textarea></label>`}function Jt(e,t,a,n){return`
    <label><span>${r(e)}</span><select data-form-field="${r(t)}">
      ${n.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function $t(e){return["multiple","checkbox","dropdown"].includes(e.type)}function Cu(e){return{short:"ti-letter-t",paragraph:"ti-align-left",multiple:"ti-circle-dot",checkbox:"ti-checkbox",dropdown:"ti-select",date:"ti-calendar",rating:"ti-star",yesno:"ti-circle-check",file:"ti-paperclip"}[e]||"ti-plus"}function ju(e){return qt.find(([t])=>t===e)?.[1]||F(e||"Question")}function ge(e,t){return`
    <div class="response-question">
      <label>
        <span>${r(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${r(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function ar(e){const t=Ae(e.form_id),a=Object.entries(e.answers||{}).map(([n,s])=>{const o=t?.questions.find(c=>c.id===n),l=Array.isArray(s)?s.join(", "):s;return Fe(o?.label||n,l||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${r(t?.title||"Response")}</h2><p>${r(e.submitted_by||e.submitter_email||"Anonymous")} / ${O(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||Fe("Response","No answers captured.")}</div>
  `}function mt(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[K("short","Inspection address"),K("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),K("paragraph","Recommended scope"),K("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[K("short","Client name"),K("yesno","Approved to proceed?"),K("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[K("short","Request title"),K("dropdown","Priority",["Low","Medium","High","Urgent"]),K("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[K("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),K("yesno","Weather safe?"),K("paragraph","Safety notes")]}]}function qu(e=u()){return Pt({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:i.route?.jobId||"",theme_color:je(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[K("short","First question")]})}function K(e="short",t="Untitled question",a=[]){return Pa({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function Au(e,t={}){if(!y("forms.manage",e,"Your role cannot create forms.","Forms"))return null;const a=qu(e),n=Pt({...a,...t,id:t.id||`form-${crypto.randomUUID()}`,company_id:e,questions:(t.questions||a.questions).map(s=>Pa(s)),created_at:t.created_at||new Date().toISOString(),updated_at:new Date().toISOString()});return i.forms.unshift(n),i.selectedFormId=n.id,i.selectedQuestionId=n.questions[0]?.id||"",i.formsTab="builder",i.formEditorTab="questions",i.modal="",i.formStartTemplateId="",i.formStartTab="blank",se("New form created"),p(),n}function Mu(e){if(!y("forms.manage",u(),"Your role cannot create forms.","Forms"))return;const t=Object.fromEntries(new FormData(e).entries()),a=t.template_id?mt().find(l=>l.id===t.template_id):null,n=String(t.title||a?.title||"Untitled form").trim()||"Untitled form",s=String(t.description||a?.description||"").trim(),o=a?a.questions.map(l=>({...da(l),id:`q-${crypto.randomUUID()}`})):[K("short","First question")];Au(u(),{title:n,description:s,type:jt.includes(t.type)?t.type:a?.type||"Internal",audience:String(t.audience||"Internal").trim()||"Internal",creator_id:b().profile.member_id||b().profile.id||"basic-quest-user",linked_job_id:String(t.linked_job_id||""),theme_color:je(u()),background:"clean",submit_label:String(t.submit_label||"Submit").trim()||"Submit",collect_email:t.collect_email==="on",require_approval:t.require_approval==="on",questions:o})}function Kt(e,t=!0){const a=Ae(e);a&&(i.selectedFormId=a.id,i.selectedQuestionId=a.questions[0]?.id||"",t&&p())}function se(e="Forms saved locally"){const t=he();t&&(t.updated_at=new Date().toISOString()),D(it,i.forms),D(pa,i.formResponses),i.sync={label:e,mode:"live"}}function qi(e,t){const a=Ae(e||i.selectedFormId);a&&y("forms.manage",a.company_id,"Your role cannot update forms.","Forms")&&(a.status=pn.includes(t)?t:"Draft",i.selectedFormId=a.id,se(`${a.status} locally`),p())}function Iu(e){const t=Ae(e||i.selectedFormId);if(!t||!y("forms.manage",t.company_id,"Your role cannot duplicate forms.","Forms"))return;const a=Pt({...da(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(n=>({...da(n),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});i.forms.unshift(a),i.selectedFormId=a.id,i.selectedQuestionId=a.questions[0]?.id||"",se("Form duplicated"),p()}function Fu(e){const t=e||i.selectedFormId;if(!t)return;const a=Ae(t);a&&!y("forms.manage",a.company_id,"Your role cannot delete forms.","Forms")||(i.forms=i.forms.filter(n=>n.id!==t),i.formResponses=i.formResponses.filter(n=>n.form_id!==t),i.selectedFormId=ye(u())[0]?.id||"",i.selectedQuestionId=wt(u())?.questions[0]?.id||"",i.modal="",se("Form deleted locally"),p())}async function Eu(e){const t=e||i.selectedFormId,a=`${window.location.origin}${_(m("forms",{form_id:t},u()))}`;try{await navigator.clipboard.writeText(a),i.sync={label:"Form link copied",mode:"live"}}catch{i.sync={label:"Copy failed",mode:"local"}}p()}function Tu(e){const t=JSON.stringify({company_id:e,forms:ye(e),responses:Xs(e)},null,2);Qu(`${e}-forms-export.json`,t,"application/json")}function nr(e){const t=he();if(!t||!h("forms.manage",t.company_id))return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),D(it,i.forms))}function ir(e){const t=he(),a=e.closest("[data-question-id]"),n=t?.questions.find(s=>s.id===a?.dataset.questionId);if(!(!t||!n)&&h("forms.manage",t.company_id)){if(i.selectedQuestionId=n.id,e.matches("[data-question-option]")){const s=Number(e.dataset.questionOption);n.options[s]=e.value}else{const s=e.dataset.questionField;if(s==="required")n.required=e.checked;else if(s==="type"){n.type=e.value,$t(n)&&!n.options.length&&(n.options=["Option 1","Option 2"]),$t(n)||(n.options=[]),se("Question updated"),p();return}else s&&(n[s]=e.value)}t.updated_at=new Date().toISOString(),D(it,i.forms)}}function xu(e="multiple"){const t=he();if(!t||!y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms"))return;const a=K(e,qt.find(([n])=>n===e)?.[1]||"New question");t.questions.push(a),i.selectedQuestionId=a.id,se("Question added"),p()}function Ou(e){const t=he(),a=t?.questions.find(o=>o.id===e);if(!t||!a||!y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms"))return;const n=t.questions.findIndex(o=>o.id===e),s=Pa({...da(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(n+1,0,s),i.selectedQuestionId=s.id,se("Question duplicated"),p()}function Ru(e){const t=he();t&&y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms")&&(t.questions=t.questions.filter(a=>a.id!==e),i.selectedQuestionId=t.questions[0]?.id||"",se("Question deleted"),p())}function Pu(e,t){const a=he();if(!a||!t||!y("forms.manage",a.company_id,"Your role cannot edit forms.","Forms"))return;const n=a.questions.findIndex(l=>l.id===e),s=n+t;if(n<0||s<0||s>=a.questions.length)return;const[o]=a.questions.splice(n,1);a.questions.splice(s,0,o),i.selectedQuestionId=e,se("Question moved"),p()}function Uu(e){const t=he(),a=t?.questions.find(n=>n.id===e);a&&y("forms.manage",t.company_id,"Your role cannot edit forms.","Forms")&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),se("Option added"),p())}function Nu(e,t){const a=he(),n=a?.questions.find(s=>s.id===e);!n||t<0||y("forms.manage",a.company_id,"Your role cannot edit forms.","Forms")&&(n.options.splice(t,1),n.options.length||n.options.push("Option 1"),se("Option removed"),p())}function Lu(e){const t=Ae(e.dataset.formId);if(!t)return;const a=new FormData(e),n={};t.questions.forEach(s=>{const o=`answer:${s.id}`,l=a.getAll(o).filter(c=>c instanceof File?c.name:String(c||"").trim());n[s.id]=l.length>1?l.map(c=>c instanceof File?c.name:c):l[0]instanceof File?l[0].name:l[0]||""}),i.formResponses.unshift(Nn({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||b().profile.full_name||"Preview submitter"),answers:n,created_at:new Date().toISOString()})),i.formsTab="responses",i.modal="",se("Preview response saved"),J(t.require_approval?"approval.form":"form.response",t.require_approval?"Form approval ready":"Form response saved",`${Y()} saved a response for ${t.title}.`,m("forms",{form_id:t.id,tab:"responses"},t.company_id),"form_response",t.id,t.company_id),p()}function Qu(e,t,a="text/plain"){const n=new Blob([t],{type:a}),s=URL.createObjectURL(n),o=document.createElement("a");o.href=s,o.download=e,o.click(),URL.revokeObjectURL(s)}function da(e){return JSON.parse(JSON.stringify(e))}function W(e){return Array.from(new Set(e.map(t=>String(t||"").trim()).filter(Boolean)))}function we(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||F(e)}function Le(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||F(e)}function fe(e){return mn.find(([t])=>t===e)?.[1]||i.driveFolders.find(t=>t.id===e)?.name||F(e||"Shared")}function Vu(e=u()){return mn.map(([t,a])=>[t,a]).concat(bt(e).map(t=>[t.id,t.name]))}function Yu(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function sr(e,t="Folder"){return or("default_folder.svg",t||"Folder")}function rr(e,t="File"){return or(Bu(e),t||qe(e))}function or(e,t){return`<img class="asset-icon" src="${r(_r+e)}" alt="${r(t)}" loading="lazy" draggable="false" referrerpolicy="no-referrer" />`}function Bu(e){const t=La(e),a={pdf:"file_type_pdf.svg",doc:"file_type_word.svg",docx:"file_type_word.svg",odt:"file_type_word.svg",rtf:"file_type_word.svg",xls:"file_type_excel.svg",xlsx:"file_type_excel.svg",xlsm:"file_type_excel.svg",ods:"file_type_excel.svg",csv:"file_type_excel.svg",ppt:"file_type_powerpoint.svg",pptx:"file_type_powerpoint.svg",pps:"file_type_powerpoint.svg",odp:"file_type_powerpoint.svg",zip:"file_type_zip.svg",rar:"file_type_zip.svg","7z":"file_type_zip.svg",tar:"file_type_zip.svg",gz:"file_type_zip.svg",tgz:"file_type_zip.svg",txt:"file_type_text.svg",log:"file_type_text.svg",md:"file_type_markdown.svg",json:"file_type_json.svg",html:"file_type_html.svg",htm:"file_type_html.svg",css:"file_type_css.svg",scss:"file_type_css.svg",js:"file_type_js.svg",jsx:"file_type_js.svg",ts:"file_type_js.svg",tsx:"file_type_js.svg",xml:"file_type_xml.svg",yml:"file_type_yaml.svg",yaml:"file_type_yaml.svg",svg:"file_type_svg.svg",ai:"file_type_ai.svg",psd:"file_type_photoshop.svg"};if(a[t])return a[t];const n=Na(e);return n==="image"?"file_type_image.svg":n==="video"?"file_type_video.svg":n==="audio"?"file_type_audio.svg":n==="text"?"file_type_text.svg":n==="code"?"file_type_js.svg":n==="archive"?"file_type_zip.svg":"default_file.svg"}function F(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function k(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function O(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function ua(e){if(!e)return"No time";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(t)}function lt(e){const t=new Date(e);if(!e||Number.isNaN(t.getTime()))return"just now";const a=Math.max(0,Math.floor((Date.now()-t.getTime())/1e3));if(a<45)return"just now";const n=Math.floor(a/60);if(n<60)return`${n}m ago`;const s=Math.floor(n/60);if(s<24)return`${s}h ago`;const o=Math.floor(s/24);return o<7?`${o}d ago`:O(e)}function Gt(e){const t=Math.max(0,Math.floor(R(e)/1e3)),a=Math.floor(t/3600),n=Math.floor(t%3600/60);return a?`${a}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Jn(e){const t=R(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],n=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**n).toFixed(n?1:0)} ${a[n]}`}function St(e){return(t,a)=>Date.parse(a[e]||a.updated_at||a.created_at||0)-Date.parse(t[e]||t.updated_at||t.created_at||0)}function lr(e){if(!e)return 0;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?0:Math.floor((Yt().getTime()-t.getTime())/864e5)}function Ai(e){if(!e)return 999;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?999:Math.floor((t.getTime()-Yt().getTime())/864e5)}function Hu(e=u()){const t=(xt(Ea(e)||{short_name:e})||e||"QH").replace(/[^a-z]/gi,"").slice(0,2).toUpperCase()||"QH",a=_e(e).length+1;return`${t}-${String(1e3+a)}`}function Yt(){const e=new Date;return e.setHours(0,0,0,0),e}function zu(e,t){return`${cr(e,t)}%`}function cr(e,t){const a=R(t);return a?Math.max(0,Math.min(100,Math.round(R(e)/a*100))):0}function nt(e){return{critical:5,urgent:4,high:3,medium:2,low:1}[String(e||"").toLowerCase()]||0}function Bt(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function me(e,t){return e.reduce((a,n)=>a+R(n[t]),0)}function R(e){const t=Number(e);return Number.isFinite(t)?t:0}function kt(e){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(e||""))}function ma(e){const t=String(e||"").trim();return kt(t)||/^[0-9a-f]{8,}$/i.test(t)||/^user[_-]?[0-9a-f-]{8,}$/i.test(t)}function dr(e){const t=String(e||"").trim();return t?t.slice(0,8):""}function C(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(R(e))}function $e(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function A(e,t){const a=$e(e,t);return Array.isArray(a)&&a.length?a:t}function D(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
