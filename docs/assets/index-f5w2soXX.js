(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const Le={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://lpzotcznihwyyudxycmd.supabase.co",supabaseKey:"sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07"},Pe=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),Qe="quest-hq-local-session",sn="quest-hq-local-profile",Pa="quest-hq-job-cache-v2",Na="quest-hq-task-cache-v1",Ua="quest-hq-file-cache-v1",La="quest-hq-drive-folder-cache-v1",Qa="quest-hq-team-cache-v1",Va="quest-hq-company-membership-cache-v1",We="quest-hq-company-form-cache-v1",Ht="quest-hq-company-form-response-cache-v1",Ba="quest-hq-finance-invoice-cache-v1",za="quest-hq-finance-payment-cache-v1",Ha="quest-hq-finance-expense-cache-v1",Ja="quest-hq-finance-vendor-cache-v1",Jt="quest-hq-time-entry-cache-v1",Wt="quest-hq-active-timer-v1",_e="quest-hq-active-company",rn="quest-hq-task-view",on="quest-hq-drive-view",Kt="quest-hq-notification-cache-v1",Yt="quest-hq-message-conversation-cache-v1",Gt="quest-hq-message-access-cache-v1",Zt="quest-hq-message-cache-v1",Xt="quest-hq-message-read-cache-v1",ea="quest-hq-message-attachment-cache-v1",ta="quest-hq-calendar-event-cache-v1",Ve={developer:["*"],admin:["*"],owner:["*"],manager:["jobs.view","jobs.manage","tasks.view","tasks.manage","files.view","files.manage","forms.view","forms.manage","finance.view","team.view","clock.manage","approvals.manage","approvals.view","calendar.view","calendar.manage","calendar.view_team","users.view","settings.view","billing.view","roles.view","messages.view","messages.send","messages.create_group","messages.manage_groups","messages.attach_files"],member:["jobs.view","tasks.view","tasks.manage","files.view","forms.view","time.track","approvals.view","calendar.view","users.view","messages.view","messages.send","messages.attach_files"]},Ts=[["jobs.view","View jobs"],["jobs.manage","Create/edit jobs"],["tasks.view","View tasks"],["tasks.manage","Create/edit tasks"],["files.view","View files"],["files.manage","Upload/delete files"],["forms.view","View forms"],["forms.manage","Create/edit forms"],["crm.view","View CRM"],["finance.view","View finance"],["finance.manage","Create/edit finance"],["users.view","View users"],["users.manage","Invite/manage users"],["roles.view","View roles"],["roles.manage","Create/edit roles"],["billing.view","View billing"],["billing.manage","Manage subscription"],["settings.view","View settings"],["settings.manage","Manage settings"],["time.track","Track own time"],["clock.manage","Manage clock dashboard"],["approvals.view","View approvals"],["approvals.manage","Manage approvals"],["calendar.view","View calendar"],["calendar.manage","Create/edit calendar events"],["calendar.view_team","View team calendar"],["messages.view","View messages"],["messages.send","Send messages"],["messages.create_group","Create group chats"],["messages.manage_groups","Manage group chats"],["messages.attach_files","Attach files/images"],["messages.delete_own","Delete own messages"],["messages.delete_any","Delete any messages"],["messages.manage","Manage messages (compatibility)"]],Es={"messages.manage":["messages.manage_groups"],"messages.manage_groups":["messages.manage"]},pt=[{id:"jobs",group:"Workspace",label:"Jobs",icon:"ti-briefcase",symbol:"q-symbol-jobs",status:"live",permission:"jobs.view"},{id:"tasks",group:"Workspace",label:"Tasks",icon:"ti-list-check",symbol:"q-symbol-tasks",status:"live",permission:"tasks.view"},{id:"files",group:"Workspace",label:"Files",icon:"ti-folder",symbol:"q-symbol-files",status:"live",permission:"files.view"},{id:"forms",group:"Workspace",label:"Forms",icon:"ti-clipboard-list",symbol:"q-symbol-forms",status:"live",permission:"forms.view"},{id:"analytics",group:"Workspace",label:"Analytics",icon:"ti-chart-bar",symbol:"q-symbol-analytics",status:"live",permission:"jobs.view"},{id:"crm",group:"Workspace",label:"CRM",icon:"ti-users-group",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"tickets",group:"Workspace",label:"Tickets",icon:"ti-ticket",symbol:"q-symbol-tickets",status:"planned"},{id:"finance",group:"Workspace",label:"Finance",icon:"ti-receipt-dollar",symbol:"q-symbol-finance",status:"live",permission:"finance.view"},{id:"knowledge",group:"Workspace",label:"Knowledge Base",icon:"ti-books",symbol:"q-symbol-knowledge",status:"planned"},{id:"automations",group:"Workspace",label:"Automations",icon:"ti-automation",symbol:"q-symbol-automations",status:"planned"},{id:"templates",group:"Workspace",label:"Templates",icon:"ti-template",symbol:"q-symbol-templates",status:"planned"},{id:"users",group:"Company",label:"Users",icon:"ti-users",symbol:"q-symbol-users",status:"live",permission:"users.view"},{id:"messages",group:"Company",label:"Messages",icon:"ti-messages",symbol:"q-symbol-messages",status:"live",permission:"messages.view"},{id:"settings",group:"Company",label:"Settings",icon:"ti-settings",symbol:"q-symbol-settings",status:"live",permission:"settings.view"},{id:"team-chart",group:"Company",label:"Team chart",icon:"ti-hierarchy-3",symbol:"q-symbol-team-chart",status:"live",permission:"team.view"},{id:"time",group:"Operations",label:"My time",icon:"ti-clock",symbol:"q-symbol-time",status:"live",permission:"time.track"},{id:"calendar",group:"Operations",label:"Calendar",icon:"ti-calendar",symbol:"q-symbol-calendar",status:"live",permission:"calendar.view"},{id:"approvals",group:"Operations",label:"Approvals",icon:"ti-user-check",symbol:"q-symbol-approvals",status:"live",permission:"approvals.view"},{id:"team-workload",group:"Operations",label:"Team workload",icon:"ti-users",symbol:"q-symbol-team-workload",status:"planned"},{id:"clock",group:"Operations",label:"Clock dashboard",icon:"ti-clock-hour-4",symbol:"q-symbol-clock",status:"live",permission:"clock.manage"}],Os={"/admin.html":"settings","/automations.html":"automations","/calendar.html":"calendar","/crm.html":"crm","/dashboards.html":"analytics","/files.html":"files","/finance.html":"finance","/forms.html":"forms","/jobs.html":"jobs","/knowledge.html":"knowledge","/messages.html":"messages","/templates.html":"templates","/tickets.html":"tickets"},ft=["Lead","Site Review","Estimate","Approved","Active","Closed"],ln=["pipeline","list","profile"],gt=["todo","pending","hold","review","done"],Ot=["critical","urgent","high","medium","low"],cn=["lead","bid","admin","invoicing","ar","meeting","web_dev"],aa=["Company event","Job visit / inspection","Estimate appointment","Install / field work","Internal meeting","Personal reminder"],xs=["Task due","Invoice due","Approval","Time"].concat(aa),Rs="https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons@master/icons/",Ps=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],Wa=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],bt=["Inspection","Client approval","Intake","Survey","Safety","Internal"],Ka=["Draft","Published","Archived"],dn=["Draft","Sent","Partially paid","Paid","Overdue","Void"],mn=["Pending","Approved","Paid","Rejected"],un=["Active","On hold","Inactive"],pn=["ACH","Check","Card","Cash","Wire","Other"],ia=["Materials","Labor","Subcontractor","Permit","Equipment","Marketing","Software","Travel","Other"],Ya=["company","role","custom","direct"],_t=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],yt=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],fn=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],gn=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"],supervisor_id:""},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"],supervisor_id:"abraham"},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"],supervisor_id:"maya"},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"],supervisor_id:"abraham"},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"],supervisor_id:""}],bn=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],_n=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:v(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:v(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:v(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:v(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:v(5),priority:"medium",urgency:"medium",status:"todo"}],yn=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],vn=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",creator_id:"abraham",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",creator_id:"maya",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",creator_id:"noah",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",creator_id:"lumen-ops",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],hn=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],wn=[{id:"vendor-roofing-materials",company_id:"roofing",name:"Valley Roofing Supply",contact_name:"Elena Ortiz",email:"orders@valleyroofingsupply.local",phone:"(480) 555-0190",category:"Materials",status:"Active",notes:"Primary tile, flashing, and underlayment vendor.",created_at:new Date(Date.now()-12096e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"vendor-roofing-dryin",company_id:"roofing",name:"Monsoon Dry-In Crew",contact_name:"R. Alvarez",email:"dispatch@monsoondryin.local",phone:"(602) 555-0144",category:"Subcontractor",status:"Active",notes:"Emergency dry-in support during storm calls.",created_at:new Date(Date.now()-10368e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"vendor-drafting-permits",company_id:"drafting",name:"Permit Runner AZ",contact_name:"Sofia Chen",email:"permits@runneraz.local",phone:"(602) 555-0171",category:"Permit",status:"Active",notes:"Permit filing support for drafting packets.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString()},{id:"vendor-lumen-software",company_id:"lumen",name:"Lumen SaaS Stack",contact_name:"Ops Billing",email:"billing@lumenstack.local",phone:"",category:"Software",status:"Active",notes:"Internal software subscriptions for client onboarding.",created_at:new Date(Date.now()-7776e5).toISOString(),updated_at:new Date(Date.now()-3456e5).toISOString()}],$n=[{id:"invoice-roofing-queen-creek",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",client_name:"Rosales Residence",invoice_number:"QR-1007",status:"Partially paid",issue_date:v(-10),due_date:v(5),subtotal:6800,tax:0,total:6800,notes:"Emergency leak repair billing with deposit received.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"invoice-roofing-mesa-storage",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",client_name:"Mesa Storage Partners",invoice_number:"QR-1008",status:"Sent",issue_date:v(-18),due_date:v(-2),subtotal:18400,tax:0,total:18400,notes:"Estimate packet sent to board for approval.",created_at:new Date(Date.now()-15552e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-drafting-horizon",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",client_name:"Horizon HVAC",invoice_number:"QD-2031",status:"Sent",issue_date:v(-7),due_date:v(14),subtotal:4200,tax:0,total:4200,notes:"Drafting permit package milestone invoice.",created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-lumen-onboarding",company_id:"lumen",job_id:"",client_name:"Lumen Internal Launch",invoice_number:"LM-3004",status:"Draft",issue_date:v(-3),due_date:v(27),subtotal:3200,tax:0,total:3200,notes:"Demo onboarding package used for finance workspace.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()}],Sn=[{id:"payment-roofing-queen-creek-deposit",company_id:"roofing",invoice_id:"invoice-roofing-queen-creek",amount:2500,method:"ACH",received_at:v(-4),reference:"ACH-4421",notes:"Deposit received after dry-in visit.",created_at:new Date(Date.now()-3456e5).toISOString()},{id:"payment-drafting-horizon-retainer",company_id:"drafting",invoice_id:"invoice-drafting-horizon",amount:1e3,method:"Check",received_at:v(-1),reference:"CHK-117",notes:"Retainer collected before permit packet completion.",created_at:new Date(Date.now()-864e5).toISOString()}],kn=[{id:"expense-roofing-queen-creek-materials",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",vendor_id:"vendor-roofing-materials",category:"Materials",amount:1850,status:"Approved",spent_at:v(-6),notes:"Underlayment, flashing, and tile replacement materials.",created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-roofing-mesa-permit",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",vendor_id:"vendor-roofing-materials",category:"Permit",amount:620,status:"Pending",spent_at:v(-2),notes:"Permit and document prep allowance.",created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString()},{id:"expense-drafting-horizon-runner",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",vendor_id:"vendor-drafting-permits",category:"Permit",amount:480,status:"Approved",spent_at:v(-3),notes:"Permit runner package review.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-lumen-software-stack",company_id:"lumen",job_id:"",vendor_id:"vendor-lumen-software",category:"Software",amount:540,status:"Paid",spent_at:v(-5),notes:"Client onboarding software stack.",created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()}],Dn=[{id:"notification-roofing-task-assigned",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.assigned",title:"Task assigned",body:"Abraham assigned Leak inspection photos to you.",href:"/company/roofing/tasks?job_id=roofing-leak&task_id=task-roofing-leak-1",source_type:"task",source_id:"task-roofing-leak-1",read_at:"",created_at:new Date(Date.now()-7*6e4).toISOString()},{id:"notification-roofing-task-priority",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.priority",title:"Task priority changed",body:"Shan set priority to Urgent on HOA board approval package.",href:"/company/roofing/tasks?job_id=roofing-mesa&task_id=task-roofing-mesa-1",source_type:"task",source_id:"task-roofing-mesa-1",read_at:"",created_at:new Date(Date.now()-19*6e4).toISOString()},{id:"notification-roofing-approval",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"approval.ready",title:"Approval needs review",body:"Estimate approval is waiting in the company review queue.",href:"/company/roofing/approvals",source_type:"form",source_id:"form-roofing-estimate-approval",read_at:new Date(Date.now()-5*6e4).toISOString(),created_at:new Date(Date.now()-44*6e4).toISOString()},{id:"notification-drafting-task-review",company_id:"drafting",recipient_profile_id:"basic-quest-user",type:"task.status",title:"Task moved to review",body:"Drawing package QA is ready for review.",href:"/company/drafting/tasks?job_id=drafting-package&task_id=task-drafting-package-1",source_type:"task",source_id:"task-drafting-package-1",read_at:"",created_at:new Date(Date.now()-63*6e4).toISOString()},{id:"notification-lumen-finance",company_id:"lumen",recipient_profile_id:"basic-quest-user",type:"finance.invoice",title:"Invoice drafted",body:"Lumen onboarding invoice is ready for payment tracking.",href:"/company/lumen/finance?invoice=invoice-lumen-onboarding",source_type:"invoice",source_id:"invoice-lumen-onboarding",read_at:"",created_at:new Date(Date.now()-92*6e4).toISOString()}],Ga=[{id:"msg-conv-roofing-all",company_id:"roofing",title:"Roofing dispatch",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-16*6e4).toISOString(),created_at:new Date(Date.now()-864e5).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-conv-roofing-crew",company_id:"roofing",title:"Roofing crew",type:"role",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-52*6e4).toISOString(),created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-conv-roofing-direct-shan",company_id:"roofing",title:"Shan Kumar",type:"direct",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-8*6e4).toISOString(),created_at:new Date(Date.now()-36e5).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-conv-drafting-all",company_id:"drafting",title:"Drafting review",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-74*6e4).toISOString(),created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-conv-lumen-product",company_id:"lumen",title:"Lumen launch room",type:"custom",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-38*6e4).toISOString(),created_at:new Date(Date.now()-216e5).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],Za=[{id:"msg-access-roofing-all",conversation_id:"msg-conv-roofing-all",company_id:"roofing",target_type:"all_company",target_id:"all"},{id:"msg-access-roofing-crew-role",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",target_type:"role",target_id:"staff-roofing"},{id:"msg-access-roofing-direct-basic",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-roofing-direct-shan",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"shan"},{id:"msg-access-drafting-all",conversation_id:"msg-conv-drafting-all",company_id:"drafting",target_type:"all_company",target_id:"all"},{id:"msg-access-lumen-basic",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-lumen-role",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"role",target_id:"admin-lumen"}],Xa=[{id:"msg-roofing-all-1",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"abraham",body:"Morning check: Mesa HOA estimate needs photos before noon.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-48*6e4).toISOString(),updated_at:new Date(Date.now()-48*6e4).toISOString()},{id:"msg-roofing-all-2",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"basic-quest-user",body:"Got it. I am linking the job files now.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-16*6e4).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-roofing-crew-1",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",sender_profile_id:"shan",body:"@Joshua bring the permit packet when you head to Arroyo.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-52*6e4).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-roofing-direct-1",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",sender_profile_id:"shan",body:"Can you confirm the roof access photo uploaded correctly?",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-8*6e4).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-drafting-all-1",conversation_id:"msg-conv-drafting-all",company_id:"drafting",sender_profile_id:"abraham",body:"Horizon package QA is ready. Please keep notes in this thread.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-74*6e4).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-lumen-product-1",conversation_id:"msg-conv-lumen-product",company_id:"lumen",sender_profile_id:"basic-quest-user",body:"Finance and CRM are live enough for internal walkthrough. Next focus is polish and permissions.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-38*6e4).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],ei=[{id:"msg-attachment-roofing-photo",conversation_id:"msg-conv-roofing-crew",message_id:"msg-roofing-crew-1",company_id:"roofing",bucket_id:"quest-message-attachments",object_path:"",file_name:"roof-access-photo.jpg",mime_type:"image/jpeg",size_bytes:184e3,preview_url:"",created_at:new Date(Date.now()-52*6e4).toISOString()}],ti=[{conversation_id:"msg-conv-roofing-all",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:new Date(Date.now()-10*6e4).toISOString()},{conversation_id:"msg-conv-roofing-crew",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-drafting-all",company_id:"drafting",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-lumen-product",company_id:"lumen",profile_id:"basic-quest-user",last_read_at:""}],Cn=[{id:"calendar-roofing-install",company_id:"roofing",title:"East ridge install window",description:"Crew visit for install prep and materials check.",event_type:"Install / field work",starts_at:`${v(1)}T14:00:00.000Z`,ends_at:`${v(1)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"job",linked_id:"job-east-ridge",assigned_profile_id:"abraham",created_by:"basic-quest-user"},{id:"calendar-roofing-estimate",company_id:"roofing",title:"Garage roof estimate",description:"Client walkthrough and estimate appointment.",event_type:"Estimate appointment",starts_at:`${v(3)}T16:00:00.000Z`,ends_at:`${v(3)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"shan",created_by:"basic-quest-user"},{id:"calendar-drafting-review",company_id:"drafting",title:"Plan review block",description:"Drafting team review for active plan updates.",event_type:"Internal meeting",starts_at:`${v(2)}T15:00:00.000Z`,ends_at:`${v(2)}T15:45:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"",created_by:"basic-quest-user"},{id:"calendar-lumen-product",company_id:"lumen",title:"Quest HQ product review",description:"Review workspace permissions, messages, and calendar flow.",event_type:"Company event",starts_at:`${v(4)}T18:00:00.000Z`,ends_at:`${v(4)}T19:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"basic-quest-user",created_by:"basic-quest-user"}],n={route:null,session:De(Qe,null),profileDraft:De(sn,null),authReady:!1,authMode:"signin",jobs:S(Pa,fn).map(Be),tasks:S(Na,_n).map(ze),files:S(Ua,yn).map(st),driveFolders:S(La,[]).map(yi),forms:S(We,vn).map(Dt),formResponses:S(Ht,hn).map(vi),financeInvoices:S(Ba,$n).map(ya),financePayments:S(za,Sn).map(va),financeExpenses:S(Ha,kn).map(ha),financeVendors:S(Ja,wn).map(wa),notifications:S(Kt,Dn).map(ot),messageConversations:S(Yt,Ga).map(ue),messageAccess:S(Gt,Za).map(Y),messages:S(Zt,Xa).map(ge),messageReads:S(Xt,ti).map(Ct),messageAttachments:S(ea,ei).map(je),calendarEvents:S(ta,Cn).map(He),timeEntries:De(Jt,[]),activeTimer:De(Wt,null),teamMembers:S(Qa,gn).map(hi),memberships:S(Va,bn),profiles:[],subscriptions:[],roles:[],rolePermissions:[],roleAssignments:[],resourceAcl:[],fieldPermissions:[],companyInvites:[],joinRequests:[],auditEvents:[],companies:ss(yt.map(kt)),activeCompanyId:localStorage.getItem(_e)||"",selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",selectedFinanceInvoiceId:"",selectedFinanceExpenseId:"",selectedFinanceVendorId:"",selectedCalendarEventId:"",expandedFormIds:new Set,formStartTemplateId:"",formStartTab:"blank",query:"",fileQuery:"",formQuery:"",crmQuery:"",stageFilter:"all",crmStageFilter:"all",crmOwnerFilter:"all",messageQuery:"",messageFilter:"all",selectedConversationId:"",messageRealtimeChannel:null,messageRealtimeKey:"",calendarScope:"company",calendarView:"week",calendarQuery:"",calendarTypeFilter:"all",calendarCursorDate:v(0),taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(rn)||"table",driveFolder:"home",driveView:localStorage.getItem(on)||"list",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",authMessage:"",toast:null,toastTimer:null,modal:"",accountMenuOpen:!1,notificationMenuOpen:!1,rolePreview:null},na=document.getElementById("app");let qa=null;Ns();function Ns(){Nl(),window.addEventListener("popstate",u),document.addEventListener("click",Wo),document.addEventListener("submit",Go),document.addEventListener("input",$l),document.addEventListener("change",Sl),Us(),u()}async function Us(){if(n.session?.auth==="local-basic"){jn(),n.authReady=!0;return}const e=q();if(!e?.auth){n.authReady=!0,n.loginError="Supabase auth is unavailable in this browser session.";return}try{const{data:t}=await e.auth.getSession();await at(t?.session||null),e.auth.onAuthStateChange((a,i)=>{at(i||null).finally(()=>{n.dataLoaded=!1,u()})})}catch(t){n.loginError=t.message||"Unable to initialize Supabase auth."}finally{n.authReady=!0,u()}}async function at(e){if(!e?.user){n.session=null,localStorage.removeItem(Qe);return}const t=await Ls(e.user);n.session=Gc(e,t),Js(),$(Qe,n.session)}async function Ls(e){const t={id:e.id,email:e.email||"",full_name:e.user_metadata?.full_name||e.email||"Quest user",role:"member",role_label:"Member",member_id:"",company_ids:[],avatar_url:"",approved:!1,email_verified:!!e.email_confirmed_at},a=q();if(!a)return t;const i=await a.from("profiles").select("*").eq("id",e.id).maybeSingle();return i.error||!i.data?t:rt(i.data,t)}function u(){if(n.route=ra(),!n.authReady){Bs();return}if(Vs(n.route)){j("/login?return_url="+encodeURIComponent(Ll()),{replace:!0});return}if(n.route.name==="login"){To();return}if(zs(),n.session?.auth==="supabase"&&n.dataLoaded&&!Fe().length){Qs();return}const e=Ul(n.route);if(e){j(e,{replace:!0});return}Hl(n.route),Un(n.route),n.route.params.get("account")==="profile"&&(n.modal="profile"),document.title=`${Ql(n.route)} | ${E(p())} | Quest HQ`,na.innerHTML=Ks(n.route,An(n.route))}function Qs(){document.title="Company access pending | Quest HQ",na.innerHTML=`
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
  `}function Vs(e){return e.name==="login"?!1:!n.session}function Bs(){document.title="Loading | Quest HQ",na.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${y("Checking secure session...")}
      </section>
    </main>
  `}function zs(){n.dataLoaded||n.dataLoading||(n.dataLoading=!0,Hs().catch(()=>{n.sync={label:"Local fallback",mode:"local"}}).finally(()=>{n.dataLoaded=!0,n.dataLoading=!1,K(),u()}))}async function Hs(){if(n.session?.auth==="local-basic"){n.sync={label:"Demo mode",mode:"local"};return}const e=q();if(!e){n.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,i,s,o,l,c,d,f,g,A,V,O,ae,Xe,Se,Ii,qi,Ai,Mi,Fi,Ti,Ei]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*"),e.from("profiles").select("*"),e.from("company_subscriptions").select("*"),e.from("roles").select("*").order("priority",{ascending:!1}),e.from("role_permissions").select("*"),e.from("user_role_assignments").select("*"),e.from("resource_acl").select("*"),e.from("field_permissions").select("*"),e.from("company_invites").select("*").order("created_at",{ascending:!1}),e.from("company_join_requests").select("*").order("created_at",{ascending:!1}),e.from("audit_events").select("*").order("created_at",{ascending:!1}).limit(100),e.from("message_conversations").select("*").order("last_message_at",{ascending:!1}),e.from("message_conversation_access").select("*"),e.from("messages").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_attachments").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_reads").select("*"),e.from("calendar_events").select("*").order("starts_at",{ascending:!0}),e.from("notifications").select("*").order("created_at",{ascending:!1}).limit(200)]);let ne=0;t.error||(n.companies=(t.data||[]).map(kt),ne+=1),a.error||(n.jobs=(a.data||[]).map(Be),ne+=1),i.error||(n.tasks=(i.data||[]).map(ze),ne+=1),s.error||(n.files=(s.data||[]).map(st),ne+=1),o.error||(n.teamMembers=(o.data||[]).map(hi),ne+=1),l.error||(n.memberships=(l.data||[]).map(Ut),ne+=1),c.error||(n.profiles=(c.data||[]).map(Fs=>rt(Fs)),ne+=1),d.error||(n.subscriptions=(d.data||[]).map(Ec),ne+=1),f.error||(n.roles=(f.data||[]).map(Ne),ne+=1),g.error||(n.rolePermissions=(g.data||[]).map(Oa)),A.error||(n.roleAssignments=(A.data||[]).map(rs)),V.error||(n.resourceAcl=(V.data||[]).map(Oc)),O.error||(n.fieldPermissions=(O.data||[]).map(xc)),ae.error||(n.companyInvites=(ae.data||[]).map(Lt)),Xe.error||(n.joinRequests=(Xe.data||[]).map(os)),Se.error||(n.auditEvents=Se.data||[]),Ii.error||(n.messageConversations=(Ii.data||[]).map(ue)),qi.error||(n.messageAccess=(qi.data||[]).map(Y)),Ai.error||(n.messages=(Ai.data||[]).map(ge)),Mi.error||(n.messageAttachments=(Mi.data||[]).map(je)),Fi.error||(n.messageReads=(Fi.data||[]).map(Ct)),Ti.error||(n.calendarEvents=(Ti.data||[]).map(He)),Ei.error||(n.notifications=(Ei.data||[]).map(ot)),n.sync=ne?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function q(){return!window.supabase||typeof window.supabase.createClient!="function"?null:(qa||(qa=window.supabase.createClient(Le.supabaseUrl,Le.supabaseKey)),qa)}function Js(){n.jobs=[],n.tasks=[],n.files=[],n.driveFolders=[],n.forms=[],n.formResponses=[],n.financeInvoices=[],n.financePayments=[],n.financeExpenses=[],n.financeVendors=[],n.notifications=[],n.messageConversations=[],n.messageAccess=[],n.messages=[],n.messageReads=[],n.messageAttachments=[],n.calendarEvents=[],n.timeEntries=[],n.activeTimer=null,n.teamMembers=[],n.memberships=[],n.profiles=[],n.subscriptions=[],n.roles=[],n.rolePermissions=[],n.roleAssignments=[],n.resourceAcl=[],n.fieldPermissions=[],n.companyInvites=[],n.joinRequests=[],n.auditEvents=[],n.companies=[],n.sync={label:"Loading secure workspace...",mode:"loading"}}function jn(){n.jobs=S(Pa,fn).map(Be),n.tasks=S(Na,_n).map(ze),n.files=S(Ua,yn).map(st),n.driveFolders=S(La,[]).map(yi),n.forms=S(We,vn).map(Dt),n.formResponses=S(Ht,hn).map(vi),n.financeInvoices=S(Ba,$n).map(ya),n.financePayments=S(za,Sn).map(va),n.financeExpenses=S(Ha,kn).map(ha),n.financeVendors=S(Ja,wn).map(wa),n.notifications=S(Kt,Dn).map(ot),n.messageConversations=S(Yt,Ga).map(ue),n.messageAccess=S(Gt,Za).map(Y),n.messages=S(Zt,Xa).map(ge),n.messageReads=S(Xt,ti).map(Ct),n.messageAttachments=S(ea,ei).map(je),n.calendarEvents=S(ta,Cn).map(He),n.timeEntries=De(Jt,[]),n.activeTimer=De(Wt,null),n.teamMembers=S(Qa,gn).map(hi),n.memberships=S(Va,bn),n.profiles=[],n.subscriptions=[],n.roles=[],n.rolePermissions=[],n.roleAssignments=[],n.resourceAcl=[],n.fieldPermissions=[],n.companyInvites=[],n.joinRequests=[],n.auditEvents=[],n.companies=ss(yt.map(kt)),n.sync={label:"Demo mode",mode:"local"}}function Ws(){return`
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
  `}function G(e,t="symbol-icon"){return`<svg class="${r(t)}" aria-hidden="true" focusable="false"><use href="#${r(e)}"></use></svg>`}function In(e=n.route?.section||"jobs"){return pt.find(t=>t.id===e)?.symbol||"q-empty"}function qn(e){const t=String(e||"").toLowerCase();return t.includes("job")||t.includes("pipeline")?"q-symbol-jobs":t.includes("task")||t.includes("review")?"q-symbol-tasks":t.includes("file")?"q-symbol-files":t.includes("form")?"q-symbol-forms":t.includes("account")||t.includes("customer")||t.includes("member")||t.includes("user")||t.includes("lead")?"q-symbol-crm":t.includes("invoice")||t.includes("collected")||t.includes("expense")||t.includes("net")||t.includes("outstanding")?"q-symbol-finance":t.includes("time")||t.includes("today")||t.includes("days")||t.includes("timer")||t.includes("entries")?"q-symbol-clock":t.includes("approval")||t.includes("access")?"q-symbol-approvals":In()}function Ks(e,t){const a=b(),i=p(),s=Xc(a);return`
    <div class="quest-app" data-route="${r(e.name)}">
      ${Ws()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${_(m("jobs",{},i))}" data-router aria-label="Quest HQ workspace">
            ${G("q-logo","brand-symbol")}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${r(Le.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${G("q-company")}
            <select data-company-switch aria-label="Active company">
              ${as().map(o=>`<option value="${r(o.id)}" ${o.id===i?"selected":""}>${r(ga(o))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            ${G("q-search")}
            <input data-global-search value="${r(n.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${r(n.sync.mode)}" data-sync-state>${r(n.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          ${Ys(i)}
          <div class="account-menu ${n.accountMenuOpen?"open":""}">
            <button class="avatar-button" type="button" data-action="toggle-account-menu" aria-label="Open account menu" aria-expanded="${n.accountMenuOpen?"true":"false"}">
              ${de(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${r(a.profile.full_name)}</strong>
              <span>${r(a.profile.role_label)} - ${r(E(i))}</span>
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
      ${Zs(i)}
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${Xs(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
    </div>
    ${Ro(e,a)}
    ${Po()}
  `}function Ys(e){const t=Gl(e),a=t.filter(i=>!i.read_at).length;return`
    <div class="notification-center ${n.notificationMenuOpen?"open":""}">
      <button class="icon-button notification-button" type="button" data-action="toggle-notifications" aria-label="Open notifications" aria-expanded="${n.notificationMenuOpen?"true":"false"}">
        <i class="ti ti-bell"></i>
        ${a?`<b>${r(String(Math.min(a,99)))}</b>`:""}
      </button>
      <div class="notification-popover" role="dialog" aria-label="Notifications">
        <div class="notification-head">
          <div><strong>Inbox</strong><span>${r(E(e))}</span></div>
          <button type="button" data-action="mark-all-notifications-read" ${a?"":"disabled"}>Mark all read</button>
        </div>
        <div class="notification-list">
          ${t.slice(0,12).map(i=>Gs(i)).join("")||y("No notifications yet.")}
        </div>
      </div>
    </div>
  `}function Gs(e){return`
    <button class="notification-item ${e.read_at?"read":"unread"}" type="button" data-action="open-notification" data-notification-id="${r(e.id)}">
      <span></span>
      <div>
        <small>${r(bd(e.type))} - ${r(e.title)} - ${r(ja(e.created_at))}</small>
        <strong>${r(e.body)}</strong>
      </div>
    </button>
  `}function Zs(e){const t=ua(e);return t?`
    <div class="role-preview-banner" style="--role-color:${r(t.color)}">
      <span></span>
      <div>
        <strong>Viewing as ${r(t.name)}</strong>
        <small>Permission preview only. Your real account has not changed.</small>
      </div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
  `:""}function Xs(e){const t=p();return`
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${r(he(t))}">${G("q-company")}</span>
      <div>
        <strong>${r(E(t))}</strong>
        <small>${r($t(t))} workspace</small>
      </div>
    </div>
    ${["Workspace","Company","Operations"].map(a=>er(a,pt.filter(i=>i.group===a&&ir(i,t)).map(i=>i.status==="planned"?ar(i.symbol,i.label):tr(e,m(i.id,{},t),i.symbol,i.label,nr(i.id,t))))).join("")}
  `}function er(e,t){return`
    <section class="side-group">
      <div class="side-label">${r(e)}</div>
      <div class="side-items">${t.join("")}</div>
    </section>
  `}function tr(e,t,a,i,s=""){return`
    <a class="side-item ${Vl(e,t)?"active":""}" href="${_(t)}" data-router>
      ${G(a)}
      <span>${r(i)}</span>
      ${s!==""?`<b>${r(String(s))}</b>`:""}
    </a>
  `}function ar(e,t){return`
    <button class="side-item planned" type="button" disabled aria-disabled="true">
      ${G(e)}
      <span>${r(t)}</span>
      <b>Planned</b>
    </button>
  `}function ir(e,t=p()){return e.status==="planned"?!0:!_i(t)&&!["settings","users"].includes(e.id)?!1:F(e.permission||`${e.id}.view`,t)}function nr(e,t=p()){return e==="jobs"?U(t).length:e==="tasks"?ee(t).length:e==="files"?Ie(t).length:e==="forms"?$e(t).length:e==="crm"?pa(t).length:e==="finance"?ve(t).length:e==="users"?te(t).filter(a=>a.status==="active").length:e==="messages"?Zl(t)||Ke(t).length:e==="calendar"?nc(t).length:e==="time"?Wn(t).focus.length:e==="approvals"?di(t).length:e==="clock"&&wt(t)?"On":""}function ai(e,t){return`
    <nav class="tabbar compact-tabbar" aria-label="${r(e)}">
      ${t.map(([a,i,s])=>`<a class="${s?"active":""}" href="${_(a)}" data-router>${r(i)}</a>`).join("")}
    </nav>
  `}function An(e){if(e.name==="command")return lr(p());if(e.name!=="company")return Ui(e.name);const t=e.companyId;if(n.session?.auth==="supabase"&&!Fe().includes(t))return or(t);const a=pt.find(i=>i.id===e.section);if(a?.status!=="planned"){if(!_i(t)&&!["settings","users"].includes(e.section))return sr(t);if(a?.permission&&!F(a.permission,t))return rr(t,a.permission)}return e.section==="jobs"?dr(e,t):e.section==="tasks"?gr(e,t):e.section==="files"?hr(e,t):e.section==="users"?Tr(e,t):e.section==="settings"?Pr(e,t):e.section==="forms"?Br(t):e.section==="analytics"?cr(e,t):e.section==="crm"?ao(e,t):e.section==="finance"?yo(e,t):e.section==="messages"?no(e,t):e.section==="team-chart"?Rr(t):e.section==="time"||e.section==="calendar"||e.section==="approvals"||e.section==="clock"?Do(e,t):Ui(e.section)}function sr(e){return`
    ${J("Subscription required","This company workspace needs an active or trialing subscription before paid modules can open.",`
      <a class="btn btn-primary" href="${_(m("settings",{tab:"billing"},e))}" data-router><i class="ti ti-credit-card"></i>Billing</a>
    `)}
    <section class="panel">
      ${L([["Company",E(e)],["Subscription",ns(e)],["Allowed area","Billing and settings remain available to owners/admins"]])}
    </section>
  `}function rr(e,t){return`
    ${J("Access denied","Your role does not include the permission required for this module.",`
      <a class="btn" href="${_(m("settings",{tab:"roles"},e))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${L([["Company",E(e)],["Required permission",t],["Your role",$t(e)]])}
    </section>
  `}function or(e){return`
    ${J("Company access denied","This workspace is not in your active company memberships.",`
      <a class="btn" href="${_(m("jobs",{},p()))}" data-router><i class="ti ti-building"></i>Your workspace</a>
      <a class="btn btn-primary" href="${_("/login?mode=request")}" data-router><i class="ti ti-user-plus"></i>Request access</a>
    `)}
    <section class="panel">
      ${L([["Requested company",E(e)],["Access rule","Active company membership required"],["Your status",X(e,b().profile.id)?.status?I(X(e,b().profile.id).status):"No active membership"]])}
    </section>
  `}function lr(e){const t=U(e),a=ee(e),i=a.filter(o=>["critical","urgent"].includes(o.priority)),s=Ie(e);return`
    ${J("Company dashboard","Live context for this company workspace.",`
      <a class="btn" href="${_(m("files",{},e))}" data-router><i class="ti ti-folder"></i>Open drive</a>
      <a class="btn btn-primary" href="${_(m("jobs",{},e))}" data-router><i class="ti ti-briefcase"></i>Open jobs</a>
    `)}
    ${ed([["Jobs",t.length],["Open tasks",a.filter(o=>o.status!=="done").length],["Urgent tasks",i.length],["Drive files",s.length]])}
    <section class="dashboard-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Priority work</h2><p>Tasks and jobs filtered by the active company.</p></div>
          <a class="btn" href="${_(m("tasks",{},e))}" data-router>Open tasks</a>
        </div>
        <div class="queue-list">
          ${a.slice(0,6).map(o=>$a(o)).join("")||y("No tasks in this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Company scope</h2><p>Client-side filtering while auth is disabled.</p></div></div>
        ${L([["Company",E(e)],["Visible users",qe(e).length],["Auth mode","Supabase auth"],["RLS status","Ready for enforcement"]])}
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Job queue</h2><p>Workspace records without leaving the Quest shell.</p></div></div>
        <div class="queue-list">
          ${t.slice(0,8).map(o=>td(o)).join("")||y("No jobs in this company yet.")}
        </div>
      </article>
    </section>
  `}function cr(e,t){const a=e.jobId?x(e.jobId):null,i=a?[a]:U(t),s=ee(t).filter(g=>!a||g.project_id===a.id),o=Ie(t).filter(g=>!a||g.job_id===a.id),l=$e(t).filter(g=>!a||g.linked_job_id===a.id),c=s.filter(g=>g.status!=="done"),d=s.filter(g=>g.status!=="done"&&g.due&&new Date(g.due)<Ia()),f=re(i,"estimate_total");return`
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
            ${U(t).map(g=>`<option value="${r(g.id)}" ${a?.id===g.id?"selected":""}>${r(g.name)}</option>`).join("")}
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
          <strong>${r(w(f))}</strong>
          <small>${r(i.length)} visible job${i.length===1?"":"s"}</small>
        </article>
        <article class="panel analytics-score">
          <span>Drive and forms</span>
          <strong>${r(o.length+l.length)}</strong>
          <small>${r(o.length)} files / ${r(l.length)} forms</small>
        </article>
        <article class="panel analytics-score">
          <span>Completion</span>
          <strong>${r(em(s.filter(g=>g.status==="done").length,s.length))}</strong>
          <small>${r(s.filter(g=>g.status==="done").length)} done of ${r(s.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${i.map(g=>`
              <a class="analytics-row" href="${_(m("analytics",{job_id:g.id},t))}" data-router>
                <span><strong>${r(g.name)}</strong><small>${r(g.client_name||E(t))}</small></span>
                <span>${r(g.stage)}</span>
                <span>${r(ba(g.id))}</span>
                <span>${r(Nt(g.id))}</span>
                <span>${r(w(g.estimate_total))}</span>
              </a>
            `).join("")||y("No jobs to analyze yet.")}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${gt.map(g=>{const A=s.filter(V=>V.status===g).length;return`<div><span>${r(fe(g))}</span><b><i style="width:${r(As(A,s.length))}%"></i></b><strong>${r(A)}</strong></div>`}).join("")}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${s.filter(g=>g.status!=="done").sort((g,A)=>Je(A.priority)-Je(g.priority)).slice(0,8).map(g=>$a(g)).join("")||y("No open tasks in this scope.")}
          </div>
        </article>
      </section>
    </section>
  `}function dr(e,t){const a=Bl(e.params.get("tab")),i=Ce();return`
    ${J("Jobs","Company job records, clients, scope, and linked work.",`
      <a class="btn" href="${_(m("files",i?{job_id:i.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <section class="job-toolbar">
      <label>
        <span>Stage</span>
        <select data-stage-filter>
          ${["all"].concat(ft).map(s=>`<option value="${r(s)}" ${n.stageFilter===s?"selected":""}>${r(s==="all"?"All stages":s)}</option>`).join("")}
        </select>
      </label>
      <div class="selected-job-chip">
        <span>Selected job</span>
        <strong>${i?r(i.name):"No job selected"}</strong>
      </div>
    </section>
    <nav class="tabbar" aria-label="Job sections">
      ${ln.map(s=>`<a class="${s===a?"active":""}" href="${_(m("jobs",{tab:s,...i?{job_id:i.id}:{}},t))}" data-router>${r(zl(s))}</a>`).join("")}
    </nav>
    ${mr(a,t,i)}
  `}function mr(e,t,a){return e==="pipeline"?Oi(t):e==="list"?ur(t):e==="profile"?pr(t,a):Oi(t)}function Oi(e){const t=Jn(e);return`
    <section class="job-board">
      ${ft.map(a=>{const i=t.filter(s=>s.stage===a);return`
          <article class="job-lane">
            <h2><span>${r(a)}</span><b>${i.length}</b></h2>
            ${i.map(s=>ad(s)).join("")||'<div class="lane-empty">No jobs</div>'}
          </article>
        `}).join("")}
    </section>
  `}function ur(e){const t=Jn(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Job list</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Tasks</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===n.selectedJobId?"active":""}" type="button" data-select-job="${r(a.id)}">
            <span><strong>${r(a.name)}</strong><small>${r(a.client_name||"No client")} - ${r(a.site_address||"No address")}</small></span>
            <span>${r(a.stage)}</span>
            <span>${wi(a.priority)}</span>
            <span>${r(a.owner_name||"Unassigned")}</span>
            <span>${r(ba(a.id))}</span>
            <span>${w(a.estimate_total)}</span>
          </button>
        `).join("")||y("No jobs match this view.")}
      </div>
    </section>
  `}function pr(e,t){return t?`
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
        ${L([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",w(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${_(m("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(t.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${qt(m("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${ba(t.id)} linked tasks`)}
          ${qt(m("files",{job_id:t.id},e),"ti-folder","Files",`${Nt(t.id)} files`)}
          ${qt(m("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${qt(m("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:y("Create a job to see the profile workspace.")}function fr(e,t){const a=t||Qc(e);return`
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${C("Workspace name","name",a.name,!0)}
      ${R("Company","company_id",e,as().map(i=>[i.id,ga(i)]))}
      ${C("Client","client_name",a.client_name)}
      ${C("Contact","contact_name",a.contact_name)}
      ${C("Account owner","owner_name",a.owner_name)}
      ${C("Job type","job_type",a.job_type||"Roofing")}
      ${R("Business status","stage",a.stage||"Lead",ft.map(i=>[i,i]))}
      ${R("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(i=>[i,i]))}
      ${C("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${C("Invoice total","invoice_total",a.invoice_total||0,!1,"number")}
      ${C("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${be("Scope","scope",a.scope,"span-2")}
      ${be("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function gr(e,t){const a=e.jobId?x(e.jobId):null,i=Mc(t,a?.id);return`
    ${J(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${_(m("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${_(m("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${br(t,a)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${n.taskView==="board"?yr(t,i):_r(t,i)}
      </article>
    </section>
  `}function br(e,t){return`
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${U(e).map(i=>`<option value="${r(i.id)}" ${t?.id===i.id?"selected":""}>${r(i.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${["all"].concat(gt).map(i=>`<option value="${r(i)}" ${n.taskStatusFilter===i?"selected":""}>${r(i==="all"?"All statuses":fe(i))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(Ot).map(i=>`<option value="${r(i)}" ${n.taskPriorityFilter===i?"selected":""}>${r(i==="all"?"All priorities":I(i))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${n.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${n.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function _r(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===n.selectedTaskId?"active":""}" type="button" data-select-task="${r(a.id)}">
          <span><strong>${r(a.title)}</strong><small>${r(a.description||Ze(a.type))}</small></span>
          <span>${r(x(a.project_id)?.name||"Company task")}</span>
          <span>${r(H(a.assignee_id))}</span>
          <span>${ls(a.priority)}</span>
          <span>${cs(a.status)}</span>
          <span>${T(a.due)}</span>
        </button>
      `).join("")||y("No tasks match this workspace view.")}
    </div>
  `}function yr(e,t){return`
    <div class="task-board">
      ${gt.map(a=>{const i=t.filter(s=>s.status===a);return`
          <section class="task-column">
            <h2><span>${r(fe(a))}</span><b>${i.length}</b></h2>
            ${i.map(s=>`
              <button class="task-card priority-${r(s.priority)}" type="button" data-select-task="${r(s.id)}">
                <strong>${r(s.title)}</strong>
                <span>${r(x(s.project_id)?.name||E(e))}</span>
                <small>${r(H(s.assignee_id))} - ${T(s.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function vr(e,t){return t?`
    <div class="section-head">
      <div><h2>${r(t.title)}</h2><p>${r(x(t.project_id)?.name||E(e))}</p></div>
      <a class="btn" href="${_(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${L([["Status",fe(t.status)],["Priority",I(t.priority)],["Type",Ze(t.type)],["Assignee",H(t.assignee_id)],["Due",T(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${r(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${y("No task selected.")}
    `}function xi(e,t,a){const i=a||Vc(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${r(a?i.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${C("Task title","title",i.title,!0)}
      ${R("Job","project_id",i.project_id||"",[["","Company-level task"]].concat(U(e).map(s=>[s.id,s.name])))}
      ${R("Status","status",i.status,gt.map(s=>[s,fe(s)]))}
      ${R("Priority","priority",i.priority,Ot.map(s=>[s,I(s)]))}
      ${R("Type","type",i.type,cn.map(s=>[s,Ze(s)]))}
      ${R("Assignee","assignee_id",i.assignee_id,qe(e).map(s=>[s.id,H(s.id)]))}
      ${C("Due date","due",i.due||v(1),!0,"date")}
      ${be("Description","description",i.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${r(a.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function hr(e,t){const a=e.params.get("folder")||n.driveFolder||"home";n.driveFolder=a;const i=e.jobId?x(e.jobId):null,s=qd(t,a,i?.id||"");return`
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${r(i?i.name:"Company Drive")}</strong>
              <small>${r(i?`${i.client_name||E(t)} file workspace`:`${E(t)} file manager`)}</small>
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
                <a href="${_(m("files",{},t))}" data-router>${r(E(t))}</a>
                ${a!=="home"?Id(t,a,i):""}
                ${i?`<span>/</span><strong>${r(i.name)}</strong>`:""}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${n.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${n.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${wr(t,a,i,s)}
          </div>
        </div>
      </section>
    </section>
  `}function wr(e,t,a,i){const s=Cd(e,t,a),o=s.map(c=>({kind:"folder",...c})).concat(i.map(c=>({kind:"file",file:c}))),l=a?a.name:t==="home"?"This folder":le(t);return`
    <section class="drive-section-title">
      <div><h3>${r(l)}</h3><span>${s.length} folder${s.length===1?"":"s"} / ${i.length} file${i.length===1?"":"s"}</span></div>
    </section>
    ${n.driveView==="list"?$r(o):Sr(o)}
  `}function $r(e){return`
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${e.map(t=>t.kind==="folder"?Dr(t):Cr(t.file)).join("")||y("This folder is empty.")}
    </div>
  `}function Sr(e){return`
    <section class="drive-folder-grid explorer-grid">
      ${e.map(t=>t.kind==="folder"?kr(t):Ir(t.file)).join("")||y("This folder is empty.")}
    </section>
  `}function kr(e){return`
    <a class="drive-folder-card explorer-folder" href="${r(e.href)}" data-router>
      <span class="drive-folder-icon">${Cs(e,e.name)}</span>
      <strong>${r(e.name)}</strong>
      <em>${r(e.countLabel||"0 items")}</em>
    </a>
  `}function Dr(e){return`
    <a class="explorer-row folder-row-live" href="${r(e.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder">${Cs(e,e.name)}</span><strong>${r(e.name)}</strong></span>
      <span>${r(e.updatedLabel||"")}</span>
      <span>Folder</span>
      <span>${r(e.countLabel||"")}</span>
    </a>
  `}function Cr(e){return`
    <button type="button" class="explorer-row ${e.id===n.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}" role="row">
      <span class="explorer-name">${jr(e)}<strong>${r(e.file_name)}</strong></span>
      <span>${T(e.updated_at||e.created_at)}</span>
      <span>${r(we(e))}</span>
      <span>${ji(e.size_bytes)}</span>
    </button>
  `}function jr(e){return`
    <span class="file-type ${r(Di(e))}">
      ${js(e,we(e))}
      <small>${r(vs(e))}</small>
    </span>
  `}function Ir(e){return`
    <button type="button" class="file-card-live ${e.id===n.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}">
      <span class="file-thumb">${Ci(e)}</span>
      <strong>${r(e.file_name)}</strong>
      <span>${r(we(e))} / ${ji(e.size_bytes)}</span>
    </button>
  `}function qr(e,t){return`
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${Ar(e)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${Ci(e)}
          <div>
            <strong>${r(e.file_name)}</strong>
            <span>${r(we(e))} / ${ji(e.size_bytes)}</span>
          </div>
        </div>
        <div class="file-detail-list">
          ${ke("Location",le(e.folder))}
          ${ke("Job",x(e.job_id)?.name||"Company shared")}
          ${ke("Uploaded by",e.uploaded_by_label||"Quest HQ")}
          ${ke("Modified",T(e.updated_at||e.created_at))}
          ${ke("Storage",e.object_path||"Metadata only")}
        </div>
        <div class="file-detail-actions">
          <button class="btn" type="button" data-action="download-file" data-file-id="${r(e.id)}"><i class="ti ti-download"></i>Download</button>
          <button class="btn danger" type="button" data-action="delete-file" data-file-id="${r(e.id)}"><i class="ti ti-trash"></i>Delete</button>
        </div>
      </aside>
    </section>
  `}function Ar(e){const t=Di(e);return e.signed_url&&t==="image"?`<img class="file-preview-media" src="${r(e.signed_url)}" alt="" />`:e.signed_url&&t==="pdf"?`<iframe class="file-preview-frame" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:e.signed_url&&t==="text"?`<iframe class="file-preview-frame text" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:["doc","sheet"].includes(t)&&e.signed_url?`<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:`
    <div class="file-preview-empty">
      ${Ci(e,!0)}
      <strong>${r(we(e))} preview</strong>
      <p>${r(e.object_path?"Preview will load when a signed file URL is available.":"This is a metadata-only file record. Upload the actual file object to preview it here.")}</p>
      ${e.notes?`<pre>${r(e.notes)}</pre>`:""}
    </div>
  `}function Mr(){const e=p(),t=n.route||ra(),a=t.params.get("folder")||n.driveFolder||"home",i=t.jobId?x(t.jobId):null;return M("Drive","New folder",`
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${r(e)}" />
      <input type="hidden" name="parent_key" value="${r(ys(a,i))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${r(a==="home"?E(e):i?.name||le(a))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"task-modal")}function Fr(){const e=p(),t=n.route?.params?.get("folder")||(n.driveFolder==="home"?"shared":n.driveFolder),a=n.route?.jobId||"";return`
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
          ${R("Folder","folder",t,Yd(e))}
          ${R("Job","job_id",a,[["","Company shared file"]].concat(U(e).map(i=>[i.id,i.name])))}
          ${R("Category","category",le(t),Ps.filter(i=>i!=="All categories").map(i=>[i,i]))}
          ${C("Uploaded by","uploaded_by_label",b().profile.full_name||"Quest HQ")}
          ${be("Notes","notes","","span-2")}
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
  `}function Tr(e,t){const a=te(t),i=["members","access"].includes(e.params.get("tab"))?e.params.get("tab"):"members",s=n.joinRequests.filter(d=>d.company_id===t&&d.status==="pending"),o=F("users.manage",t),l=a.filter(d=>d.status==="active"),c=a.filter(d=>d.status!=="active");return`
    ${J("Users","Company members, roles, workers, and access context.",`
      <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite user</button>
      <a class="btn" href="${_(m("settings",{tab:"roles"},t))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      <a class="btn" href="${_(m("settings",{tab:"access"},t))}" data-router><i class="ti ti-settings"></i>Access settings</a>
    `)}
    ${ai("Users sections",[[m("users",{tab:"members"},t),"Members",i==="members"],[m("users",{tab:"access"},t),"Access",i==="access"]])}
    ${i==="members"?`
      <section class="metric-grid operations-metrics">
        ${D("Active users",l.length)}
        ${D("Pending",a.filter(d=>d.status==="pending").length+s.length)}
        ${D("Disabled/left",c.filter(d=>d.status!=="pending").length)}
        ${D("Roles",ye(t).length)}
      </section>
      <section class="users-grid">
        ${a.map(d=>`
          <article class="user-card ${d.status!=="active"?"muted":""}">
            ${de({full_name:xt(d),email:d.email,avatar_url:d.avatar_url},"avatar")}
            <div>
              <strong>${r(xt(d))}</strong>
              <span>${r(Mn(d))}</span>
              <small>${r(d.role_label)} / ${r(I(d.status))}</small>
            </div>
          </article>
        `).join("")||y("No users assigned to this company yet.")}
      </section>
    `:`
    <section class="dashboard-grid compact-settings-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Member access</h2><p>Assign roles and confirm each user's company status.</p></div>
        </div>
        <div class="access-user-list">
          ${a.map(d=>Er(t,d,o)).join("")||y("No users assigned to this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head">
          <div><h2>Invites</h2><p>Copy a secure invite code or link for a specific email address.</p></div>
          <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite</button>
        </div>
        <div class="access-invite-list">
          ${wc(t).map(d=>xr(d,o)).join("")||y("No pending invites.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
        <div class="access-request-list">
          ${s.map(d=>Or(d,o)).join("")||y("No pending join requests.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
        ${L([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Supabase Auth + RLS"],["Your role",$t(t)],["Can manage users",o?"Yes":"No"]])}
      </article>
    </section>
    `}
  `}function Er(e,t,a){const i=ye(e),s=t.role_id||nt(e,t.role)||i[0]?.id||"",o=t.profile_id&&is(e,t.profile_id),l=a&&t.profile_id&&!o;return`
    <article class="access-user-row ${t.status!=="active"?"muted":""}">
      ${de({full_name:xt(t),email:t.email,avatar_url:t.avatar_url},"avatar")}
      <div class="access-user-main">
        <strong>${r(xt(t))}</strong>
        <span>${r(Mn(t))} / ${r(I(t.status))}</span>
        ${o?'<small class="access-note">Last active Owner - promote another Owner before changing this access.</small>':""}
      </div>
      <form class="access-role-form" data-user-role-form>
        <input type="hidden" name="company_id" value="${r(e)}" />
        <input type="hidden" name="profile_id" value="${r(t.profile_id)}" />
        <select name="role_id" ${l?"":"disabled"}>
          ${i.map(c=>`<option value="${r(c.id)}" ${c.id===s?"selected":""}>${r(c.name)}</option>`).join("")}
        </select>
        <select name="membership_status" ${l?"":"disabled"}>
          ${["active","pending","disabled","left"].map(c=>`<option value="${r(c)}" ${c===t.status?"selected":""}>${r(I(c))}</option>`).join("")}
        </select>
        <button class="btn" type="submit" ${l?"":"disabled"}>Save</button>
      </form>
    </article>
  `}function Or(e,t){const a=e.requested_email||Ae(e.profile_id)?.email||e.profile_id||"Requester";return`
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
  `}function xr(e,t){const a=Ge(e.company_id,e.role_id),i=e.expires_at&&Date.parse(e.expires_at)<Date.now();return`
    <article class="access-invite-row ${i?"muted":""}">
      <div>
        <strong>${r(e.email)}</strong>
        <span>${r(a?.name||"Member")} / ${i?"Expired":`Expires ${T(e.expires_at)}`}</span>
        ${e.token?`<code class="invite-code">${r(e.token)}</code>`:""}
      </div>
      <div>
        <button class="btn" type="button" data-action="copy-invite-code" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-key"></i>Copy code</button>
        <button class="btn" type="button" data-action="copy-invite-link" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-link"></i>Copy link</button>
        <button class="btn danger" type="button" data-action="revoke-invite" data-invite-id="${r(e.id)}" ${t?"":"disabled"}>Revoke</button>
      </div>
    </article>
  `}function xt(e){const t=String(e.name||"").trim(),a=String(e.email||"").trim();if(t&&!zt(t))return t;if(a&&!zt(a))return a.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,s=>s.toUpperCase());const i=String(e.role||"").toLowerCase();return i==="owner"?"Workspace owner":i==="admin"?"Workspace admin":i==="developer"?"Developer":`${e.role_label||"Workspace"} user`}function Mn(e){const t=String(e.email||"").trim();if(t&&!zt(t))return t;const a=String(e.profile_id||e.member_id||"").trim();return a?`ID ${Ms(a)}`:"No email on profile"}function Rr(e){const t=qe(e),a=t.filter(i=>!i.supervisor_id||!t.some(s=>s.id===i.supervisor_id));return`
    <section class="tool-page team-chart-page">
      ${J("Team chart","Reporting lines, roles, and company coverage for this workspace.",`
        <a class="btn" href="${_(m("users",{},e))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${_(m("settings",{tab:"team"},e))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${D("Members",t.length)}
        ${D("Leads",a.length)}
        ${D("Open tasks",ee(e).filter(mi).length)}
        ${D("Active timer",wt(e)?"Yes":"No")}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${a.map(i=>Fn(e,i,t)).join("")||y("No workers assigned.")}
        </div>
      </section>
    </section>
  `}function Fn(e,t,a,i=0){const s=a.filter(o=>o.supervisor_id===t.id);return`
    <article class="team-node" style="--depth:${i}">
      <div class="team-node-card">
        ${de({full_name:t.full_name,avatar_url:t.avatar_url},"avatar")}
        <span><strong>${r(t.full_name)}</strong><small>${r(Pt(e,t.id))}</small></span>
        <b>${ee(e).filter(o=>o.assignee_id===t.id&&mi(o)).length} open</b>
      </div>
      ${s.length?`<div class="team-node-children">${s.map(o=>Fn(e,o,a,i+1)).join("")}</div>`:""}
    </article>
  `}function Pr(e,t){const a=fa(t),i=["company","billing","roles","access","team"].includes(e.params.get("tab"))?e.params.get("tab"):"company";return`
    ${J("Settings","Company settings, roles, approvals, and admin controls.","")}
    ${ai("Settings sections",[[m("settings",{tab:"company"},t),"Company",i==="company"],[m("settings",{tab:"billing"},t),"Billing",i==="billing"],[m("settings",{tab:"roles"},t),"Roles",i==="roles"],[m("settings",{tab:"access"},t),"Access",i==="access"],[m("settings",{tab:"team"},t),"Workers",i==="team"]])}
    <section class="dashboard-grid compact-settings-grid">
      ${i==="company"?`
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${L([["Name",E(t)],["Company ID",t],["Color",a?.color||he(t)],["Visible jobs",U(t).length]])}
      </article>
      `:""}
      ${i==="billing"?Nr(t):""}
      ${i==="roles"?Ur(t):""}
      ${i==="access"?`
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${L([["Auth switch","Enabled"],["Local login","Disabled"],["Isolation","Server-enforced when migration is applied"],["Active memberships",String(n.memberships.filter(s=>s.company_id===t&&s.status==="active").length)],["Disabled/left",String(n.memberships.filter(s=>s.company_id===t&&["disabled","left"].includes(s.status)).length)],["Invites",String(n.companyInvites.filter(s=>s.company_id===t&&s.status==="pending").length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${n.joinRequests.filter(s=>s.company_id===t).map(s=>Ue(s.requested_email||s.profile_id,s.message||"Access request",I(s.status),s.created_at)).join("")||y("No pending company approvals.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access history</h2><p>Recent membership, invite, and role changes for this company.</p></div></div>
        <div class="access-audit-list">
          ${$c(t).slice(0,8).map(Sc).join("")||y("No access audit events yet.")}
        </div>
      </article>
      `:""}
      ${i==="team"?`
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${qe(t).map(s=>`<div><strong>${r(s.full_name)}</strong><span>${r(Pt(t,s.id))}</span></div>`).join("")||y("No workers assigned.")}
        </div>
      </article>
      `:""}
    </section>
  `}function Nr(e){const t=bi(e);return`
    <article class="panel">
      <div class="section-head">
        <div><h2>Subscription</h2><p>$300/month company workspace billing gate.</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout"><i class="ti ti-credit-card"></i>Start subscription</button>
      </div>
      ${L([["Plan","$300/month company workspace"],["Status",ns(e)],["Stripe customer",t?.stripe_customer_id||"Not connected"],["Renewal / trial",t?.current_period_end||t?.trial_ends_at?T(t.current_period_end||t.trial_ends_at):"Pending"]])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules remain available only for trialing, active, past_due, or grace status.</p></div></div>
      ${L([["Workspace access",_i(e)?"Allowed":"Suspended"],["Finance/files privacy","Requires Auth + RLS"],["Seat billing","Tracked later; not charged in v1"]])}
    </article>
  `}function Ur(e){const t=ye(e),a=ua(e);return`
    <article class="panel span-2">
      <div class="section-head">
        <div><h2>Custom roles</h2><p>Discord-style roles for module, action, record, and field permissions.</p></div>
        <button class="btn btn-primary" type="button" data-action="open-role-form"><i class="ti ti-plus"></i>New role</button>
      </div>
      <div class="roles-list">
        ${t.map(i=>{const s=n.rolePermissions.filter(c=>c.role_id===i.id&&c.effect==="allow").length,o=n.roleAssignments.filter(c=>c.company_id===e&&c.role_id===i.id).length,l=a?.id===i.id;return`
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
          `}).join("")||y("No custom roles yet.")}
      </div>
    </article>
    <article class="panel">
      ${a?Lr(e,a):`
        <div class="section-head"><div><h2>Access preview</h2><p>Pick View as role to check sidebar, route, and action access.</p></div></div>
        ${y("No role preview selected.")}
      `}
    </article>
    <article class="panel span-3">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${n.fieldPermissions.filter(i=>i.company_id===e).map(i=>Ue(i.field_key,i.resource_type,i.visibility,"")).join("")||y("No field permission overrides yet.")}
      </div>
    </article>
  `}function Lr(e,t){const a=pt.filter(o=>o.status==="live"),i=a.filter(o=>Ta(t,o.permission||`${o.id}.view`)),s=a.filter(o=>!Ta(t,o.permission||`${o.id}.view`));return`
    <div class="section-head">
      <div><h2>Access preview</h2><p>${r(t.name)} sees ${i.length} of ${a.length} live modules.</p></div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
    ${L([["Preview role",t.name],["Allowed modules",i.map(o=>o.label).join(", ")||"None"],["Hidden modules",s.map(o=>o.label).join(", ")||"None"]])}
  `}function Qr(e){return M("Settings","New role",`
    <form class="role-form" data-role-form>
      ${C("Role name","name","")}
      ${C("Color","color","#f0b23b",!1,"color")}
      ${C("Priority","priority","100",!1,"number")}
      <div class="permission-grid span-2">
        ${Ts.map(([t,a])=>`
          <label><input type="checkbox" name="permissions" value="${r(t)}" /> <span>${r(a)}</span></label>
        `).join("")}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Vr(e){const t=ye(e).filter(i=>i.name.toLowerCase()!=="owner"),a=[["","Member"]].concat(t.map(i=>[i.id,i.name]));return M("Users","Invite user",`
    <form class="role-form" data-invite-form>
      <input type="hidden" name="company_id" value="${r(e)}" />
      ${C("Email","email","",!0,"email")}
      ${R("Role","role_id",kc(e),a)}
      <div class="form-message span-2">Quest creates an invite code you can copy. Email delivery comes after the Resend/SMTP setup.</div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create invite code</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function Br(e){const t=Md(e),a=ct(e),i=n.formsTab==="builder"&&a?"builder":n.formsTab==="responses"?"responses":"library";return`
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
            <button class="${i===s?"active":""}" type="button" data-action="set-forms-tab" data-tab="${r(s)}">${r(I(s))}</button>
          `).join("")}
        </nav>
      `}
      ${i==="library"?zr(e,t,a):""}
      ${i==="builder"?Hr(e,a):""}
      ${i==="responses"?to(e,a):""}
    </section>
  `}function zr(e,t,a){return`
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${t.length} visible form${t.length===1?"":"s"} in ${r(E(e))}</span>
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
                <span>Created by ${r(Fd(i))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${r(i.id)}" aria-expanded="${n.expandedFormIds.has(i.id)?"true":"false"}">
                <i class="ti ${n.expandedFormIds.has(i.id)?"ti-chevron-up":"ti-chevron-down"}"></i>
                ${n.expandedFormIds.has(i.id)?"Less":"Details"}
              </button>
              <span class="form-card-meta">
                <small>${r(i.type)} / ${r(i.audience||"Internal")}</small>
                <small>${ws(i)} questions</small>
                <em>${Ca(i.id).length} responses</em>
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
          `).join("")||y("No forms match this company view.")}
        </div>
      </article>
    </section>
  `}function Hr(e,t){if(!t)return`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${y("Create a form or choose a template to open the builder.")}
      </section>
    `;const a=["questions","responses","settings"].includes(n.formEditorTab)?n.formEditorTab:"questions";return`
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${r(a)}">
      ${Jr(t,a)}
      ${a==="questions"?`
        ${Wr(e,t)}
        ${Kr(t)}
      `:""}
      ${a==="settings"?`
        <article class="panel form-settings-panel forms-settings-wide">
          ${Yr(e,t)}
        </article>
      `:""}
      ${a==="responses"?Gr(e,t):""}
    </section>
  `}function Jr(e,t){const a=Ca(e.id);return`
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${r(e.title)}</strong>
        <span>${r(e.status)} / ${ws(e)} questions / ${a.length} responses</span>
      </div>
      ${["questions","responses","settings"].map(i=>`
        <button class="${t===i?"active":""}" type="button" data-action="set-form-editor-tab" data-tab="${r(i)}">
          ${i==="questions"?'<i class="ti ti-list-details"></i>':i==="responses"?'<i class="ti ti-inbox"></i>':'<i class="ti ti-settings"></i>'}
          ${r(I(i))}
        </button>
      `).join("")}
      <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(e.id)}"><i class="ti ti-eye"></i>Preview</button>
      <button class="btn" type="button" data-action="open-form-actions" data-form-id="${r(e.id)}"><i class="ti ti-share"></i>Share</button>
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(e.id)}">Save</button>
    </div>
  `}function Wr(e,t){return`
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${r(t.theme_color||he(e))}"></div>
      ${et("Form title","title",t.title,!0)}
      ${$s("Form description","description",t.description)}
      <div class="forms-simple-meta">
        <span>${r(t.status)}</span>
        <span>${r(t.type)}</span>
        <span>${r(t.audience||"Internal")}</span>
        <span>${r(x(t.linked_job_id)?.name||"Company level")}</span>
        <span>${r(E(e))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(t.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      </div>
    </article>
  `}function Kr(e){return`
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${_t.map(([t,a])=>`<button type="button" data-action="add-question" data-question-type="${r(t)}" title="${r(a)}" aria-label="Add ${r(a)} question"><i class="ti ${r(Td(t))}"></i></button>`).join("")}
        </div>
        <div class="question-list">
          ${e.questions.map((t,a)=>Zr(t,a)).join("")||y("Add the first question.")}
        </div>
      </div>
    </article>
  `}function Yr(e,t){return`
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${et("Title","title",t.title,!0)}
      ${At("Status","status",t.status,Ka.map(a=>[a,a]))}
      ${$s("Description","description",t.description)}
      ${At("Type","type",t.type,bt.map(a=>[a,a]))}
      ${et("Audience","audience",t.audience)}
      ${At("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(U(e).map(a=>[a.id,a.name])))}
      ${et("Theme color","theme_color",t.theme_color||he(e),!1,"color")}
      ${At("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
      ${et("Submit button","submit_label",t.submit_label||"Submit")}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(t.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${r(t.id)}">Delete</button>
    </div>
  `}function Gr(e,t){const a=Ca(t.id),i=a[0]||null;return`
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
        `).join("")||y("No responses yet. Submit a preview response from the builder.")}
      </div>
    </article>
    <aside class="panel response-detail">
      ${i?Ss(i):y("No response selected.")}
    </aside>
  `}function Zr(e,t){const a=_t.map(([i,s])=>`<option value="${r(i)}" ${e.type===i?"selected":""}>${r(s)}</option>`).join("");return`
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
      ${dt(e)?`
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
  `}function Xr(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${r(t.id)}" style="--form-accent:${r(t.theme_color||he(e))}">
      <div class="designed-form-header">
        <span>${r(E(e))}</span>
        <h2>${r(t.title)}</h2>
        <p>${r(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>eo(a)).join("")||y("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${r(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function eo(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?ce(e,`<textarea name="${r(t)}" rows="3" ${a}></textarea>`):e.type==="date"?ce(e,`<input name="${r(t)}" type="date" ${a} />`):e.type==="file"?ce(e,`<input name="${r(t)}" type="file" ${a} />`):e.type==="yesno"?ce(e,`<select name="${r(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?ce(e,`<input name="${r(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?ce(e,`<select name="${r(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(i=>`<option>${r(i)}</option>`).join("")}</select>`):e.type==="checkbox"?ce(e,`<div class="choice-stack">${(e.options||[]).map(i=>`<label><input name="${r(t)}" type="checkbox" value="${r(i)}" /> ${r(i)}</label>`).join("")}</div>`):e.type==="multiple"?ce(e,`<div class="choice-stack">${(e.options||[]).map(i=>`<label><input name="${r(t)}" type="radio" value="${r(i)}" ${a} /> ${r(i)}</label>`).join("")}</div>`):ce(e,`<input name="${r(t)}" ${a} />`)}function to(e,t){const a=t?Ca(t.id):hs(e),i=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(s=>`
            <button type="button" class="response-card">
              <strong>${r(Ee(s.form_id)?.title||"Unknown form")}</strong>
              <span>${r(s.submitted_by||s.submitter_email||"Anonymous")}</span>
              <small>${T(s.created_at)}</small>
            </button>
          `).join("")||y("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${i?Ss(i):y("No response selected.")}
      </aside>
    </section>
  `}function ao(e,t){const a=jc(t),i=pa(t),s=ee(t).filter(c=>c.status!=="done").length,o=re(U(t),"estimate_total"),l=qc(t);return`
    <section class="tool-page crm-page">
      ${J("CRM","Customers, contacts, and follow-ups built from company jobs.",`
        <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add customer job</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${D("Accounts",i.length)}
        ${D("Open jobs",U(t).filter(c=>c.stage!=="Closed").length)}
        ${D("Open tasks",s)}
        ${D("Pipeline value",w(o))}
      </section>
      <section class="crm-toolbar panel">
        <label>
          <span>Search</span>
          <input data-crm-search value="${r(n.crmQuery)}" placeholder="Find customer, contact, job, or address" />
        </label>
        <label>
          <span>Stage</span>
          <select data-crm-stage-filter>
            ${["all"].concat(ft).map(c=>`<option value="${r(c)}" ${n.crmStageFilter===c?"selected":""}>${r(c==="all"?"All stages":c)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Owner</span>
          <select data-crm-owner-filter>
            <option value="all" ${n.crmOwnerFilter==="all"?"selected":""}>All owners</option>
            ${l.map(c=>`<option value="${r(c)}" ${n.crmOwnerFilter===c?"selected":""}>${r(c)}</option>`).join("")}
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
              <span>${w(c.estimateTotal)}</span>
              <span>${T(c.updatedAt)}</span>
            </a>
          `).join("")||y("No CRM accounts match this view. Add a customer job to start the list.")}
        </div>
      </section>
    </section>
  `}function io(e,t){const a=Ic(e,t);if(!a)return M("CRM","Customer account",y("This customer is not visible in the current company view."));const i=a.latestJob,s=a.tasks.filter(o=>o.status!=="done");return M("CRM",a.name,`
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${r(a.name)}</h2>
            <p>${r(a.subtitle)}</p>
          </div>
          ${wi(a.priority)}
        </div>
        ${L([["Primary contact",a.primaryContact],["Owner",a.owner],["Current stage",a.stage],["Pipeline value",w(a.estimateTotal)],["Open tasks",String(s.length)],["Last updated",T(a.updatedAt)]])}
      </section>
      <section class="crm-rollup-grid">
        ${D("Jobs",a.jobs.length)}
        ${D("Files",a.fileCount)}
        ${D("Forms",a.formCount)}
        ${D("Tasks",a.tasks.length)}
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
              <span>${w(o.estimate_total)}</span>
            </a>
          `).join("")||y("No linked jobs yet.")}
        </div>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Follow-ups</h2><p>Open tasks across linked jobs.</p></div></div>
        <div class="queue-list">
          ${s.slice(0,6).map(o=>$a(o)).join("")||y("No open follow-ups for this customer.")}
        </div>
      </section>
    </div>
  `,"crm-modal")}function no(e,t){const a=Ke(t),i=Ln(t);i&&n.selectedConversationId!==i.id&&(n.selectedConversationId=i.id);const s=!!(i&&e.params.get("conversation"));return md(t,i?.id||""),i&&Sa(i.id,!1),`
    <section class="tool-page messages-page ${s?"thread-open":""}">
      ${J("Messages","Company chats, role rooms, direct messages, and file sharing.",`
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      `)}
      <section class="messages-shell">
        <aside class="messages-list-panel panel">
          <div class="messages-tools">
            <label>
              <span>Search</span>
              <input data-message-search value="${r(n.messageQuery)}" placeholder="Find chats or messages" />
            </label>
            <div class="segmented message-filter" role="group" aria-label="Message filters">
              ${["all","unread","company","role","custom","direct"].map(o=>`
                <button type="button" data-action="set-message-filter" data-filter="${r(o)}" class="${n.messageFilter===o?"active":""}">${r(o==="all"?"All":I(o))}</button>
              `).join("")}
            </div>
          </div>
          <div class="conversation-list">
            ${a.map(o=>so(o,t,i?.id===o.id)).join("")||y("No conversations match this view.")}
          </div>
        </aside>
        <main class="messages-thread-panel panel">
          ${i?ro(t,i):mo()}
        </main>
      </section>
      ${n.session?.auth==="local-basic"?uo():""}
    </section>
  `}function so(e,t,a){const i=Ye(e.id).at(-1),s=si(e.id);return`
    <a class="conversation-row ${a?"active":""}" href="${_(m("messages",{conversation:e.id},t))}" data-router>
      <span class="conversation-mark">${G(ps(e.type))}</span>
      <span>
        <strong>${r(e.title)}</strong>
        <small>${r(i?.body||ki(e)||"No messages yet")}</small>
      </span>
      <em>${i?ja(i.created_at):""}</em>
      ${s?`<b>${s}</b>`:""}
    </a>
  `}function ro(e,t){const a=Ye(t.id),i=F("messages.send",e);return`
    <div class="thread-head">
      <a class="btn mobile-thread-back" href="${_(m("messages",{},e))}" data-router><i class="ti ti-arrow-left"></i>Chats</a>
      <div class="thread-title">
        <span>${G(ps(t.type))}</span>
        <div>
          <h2>${r(t.title)}</h2>
          <p>${r(ki(t))}</p>
        </div>
      </div>
      <div class="thread-actions">
        <button class="btn" type="button" data-action="message-search-results"><i class="ti ti-search"></i>Search</button>
        <button class="btn" type="button" data-action="message-details" data-conversation-id="${r(t.id)}"><i class="ti ti-info-circle"></i>Details</button>
        <button class="btn" type="button" data-action="manage-message-chat" data-conversation-id="${r(t.id)}" ${F("messages.manage_groups",e)||F("messages.manage",e)?"":"disabled"}><i class="ti ti-users"></i>Access</button>
      </div>
    </div>
    <div class="message-stream">
      ${a.map(s=>oo(s)).join("")||y("No messages yet. Start the thread with a short update.")}
    </div>
    ${i?co(t):y("Your role can view this chat but cannot send messages.")}
  `}function oo(e){const t=e.sender_profile_id===b().profile.id,a=rd(e.sender_profile_id),i=ec(e.id);return`
    <article class="message-bubble ${t?"own":""}">
      ${de(a,"avatar message-avatar")}
      <div class="message-card">
        <div class="message-meta">
          <strong>${r(a.full_name||a.email||St(e.sender_profile_id))}</strong>
          <span>${ja(e.created_at)}</span>
          ${t&&F("messages.delete_own",e.company_id)||F("messages.delete_any",e.company_id)?`<button type="button" data-action="delete-message" data-message-id="${r(e.id)}"><i class="ti ti-trash"></i></button>`:""}
        </div>
        ${e.body?`<p>${cd(e.body)}</p>`:""}
        ${i.length?`<div class="message-attachments">${i.map(lo).join("")}</div>`:""}
      </div>
    </article>
  `}function lo(e){const t=e.mime_type.startsWith("image/");return`
    <button class="message-attachment" type="button" data-action="open-message-attachment" data-attachment-id="${r(e.id)}">
      ${e.preview_url&&t?`<img src="${r(e.preview_url)}" alt="" />`:G(t?"q-message-image":"q-message-file")}
      <span><strong>${r(e.file_name)}</strong><small>${r(dd(e.size_bytes))}</small></span>
    </button>
  `}function co(e){return`
    <form class="message-composer" data-message-form data-conversation-id="${r(e.id)}">
      <input name="body" placeholder="Message ${r(e.title)}" autocomplete="off" />
      <label class="icon-button message-attach-button" title="Attach file">
        <i class="ti ti-paperclip"></i>
        <input name="attachments" type="file" multiple ${F("messages.attach_files",e.company_id)?"":"disabled"} />
      </label>
      <button class="btn btn-primary" type="submit"><i class="ti ti-send"></i>Send</button>
    </form>
  `}function mo(e){return`
    <div class="messages-empty-panel">
      ${G("q-symbol-messages")}
      <h2>No chat selected</h2>
      <p>Create a group chat, direct message a teammate, or pick a conversation from the list.</p>
      <div class="head-actions">
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      </div>
    </div>
  `}function uo(e){return`
    <div class="message-scenario">
      <button class="btn btn-primary" type="button" data-action="run-message-scenario"><i class="ti ti-sparkles"></i>Demo scenario</button>
      <button class="btn" type="button" data-action="reset-message-demo"><i class="ti ti-refresh"></i>Reset</button>
    </div>
  `}function po(e){const t=te(e);return M("Messages","New group chat",`
    <form class="message-modal-form" data-message-group-form>
      ${C("Chat name","title","",!0)}
      ${R("Type","type","custom",[["company","Company-wide"],["role","Role-based"],["custom","Custom group"]])}
      ${Tn(e,[])}
      ${En(t,[])}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create group</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function fo(e){const t=te(e).filter(a=>(a.profile_id||a.member_id)!==b().profile.id);return M("Messages","New direct message",`
    <form class="message-modal-form" data-direct-message-form>
      ${R("Person","profile_id",t[0]?.profile_id||t[0]?.member_id||"",t.map(a=>[a.profile_id||a.member_id,a.name]))}
      <label><span>First message</span><textarea name="body" rows="3" placeholder="Start with a short note"></textarea></label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Start chat</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function go(e,t){const a=n.messageConversations.find(l=>l.id===t);if(!a)return M("Messages","Chat access",y("Conversation not found."));const i=ca(a.id),s=i.filter(l=>l.target_type==="role").map(l=>l.target_id),o=i.filter(l=>l.target_type==="profile").map(l=>l.target_id);return M("Messages","Chat access",`
    <form class="message-modal-form" data-message-access-form data-conversation-id="${r(a.id)}">
      ${C("Chat name","title",a.title,!0)}
      ${R("Type","type",a.type,[["company","Company-wide"],["role","Role-based"],["custom","Custom group"],["direct","Direct message"]])}
      ${Tn(e,s)}
      ${En(te(e),o)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save access</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function Tn(e,t=[]){const a=new Set(t);return`
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>Roles</strong>
        <small>Good for large crews. Access updates when role assignments change.</small>
      </div>
      <div class="message-role-grid">
        ${ye(e).map(i=>`
          <label class="message-role-option" style="--role-color:${r(i.color)}">
            <input type="checkbox" name="role_ids" value="${r(i.id)}" ${a.has(i.id)?"checked":""} />
            <span></span>
            <strong>${r(i.name)}</strong>
          </label>
        `).join("")}
      </div>
    </section>
  `}function En(e,t=[]){const a=new Set(t),i=e.slice().sort((s,o)=>xe(s).localeCompare(xe(o)));return`
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
          <span>${de(Zi(s),"avatar tiny-avatar")} ${r(xe(s))}</span>
        `).join("")||"<small>No individual people selected.</small>"}
      </div>
      <div class="message-people-list">
        ${i.map(s=>{const o=s.profile_id||s.member_id;return`
            <label class="message-person-row" data-message-person-row data-filter-text="${r([xe(s),s.email,s.role_label,s.role].join(" ").toLowerCase())}">
              <input type="checkbox" name="profile_ids" value="${r(o)}" ${a.has(o)?"checked":""} />
              ${de(Zi(s),"avatar message-person-avatar")}
              <span>
                <strong>${r(xe(s))}</strong>
                <small>${r(od(s))}</small>
              </span>
            </label>
          `}).join("")||y("No people available in this company yet.")}
      </div>
    </section>
  `}function bo(e,t){const a=n.messageConversations.find(i=>i.id===t);return a?M("Messages",a.title,`
    ${L([["Type",I(a.type)],["Access",ki(a)],["Messages",String(Ye(a.id).length)],["Attachments",String(Xl(a.id).length)],["Last message",T(a.last_message_at)]])}
  `,"message-modal"):M("Messages","Chat details",y("Conversation not found."))}function _o(e){const t=n.messageQuery.trim().toLowerCase(),a=Ke(e).flatMap(i=>Ye(i.id).filter(s=>!t||s.body.toLowerCase().includes(t)).map(s=>({conversation:i,message:s})));return M("Messages","Search results",`
    <div class="queue-list">
      ${a.slice(0,30).map(({conversation:i,message:s})=>`
        <a class="queue-row" href="${_(m("messages",{conversation:i.id},e))}" data-router>
          <span><strong>${r(i.title)}</strong><small>${r(s.body||"Attachment")}</small></span>
          <em>${ja(s.created_at)}</em>
        </a>
      `).join("")||y("No matching messages. Type in the Messages search box first.")}
    </div>
  `,"message-modal")}function yo(e,t){const a=ts(t),i=ve(t),s=Gn(t).slice().sort(mt("received_at")).slice(0,5),o=ui(t).slice().sort(mt("spent_at")).slice(0,5),l=pi(t).slice().sort((c,d)=>c.name.localeCompare(d.name)).slice(0,5);return`
    <section class="tool-page finance-page">
      ${J("Finance","Invoices, payments, expenses, vendors, and job-linked money in one company view.",`
        <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
        <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
        <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        <a class="btn" href="${_(m("finance",{report:"summary"},t))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
      `)}
      <section class="metric-grid finance-metrics">
        ${D("Estimated pipeline",w(a.pipeline))}
        ${D("Invoiced",w(a.invoiced))}
        ${D("Collected",w(a.collected))}
        ${D("Outstanding",w(a.outstanding))}
        ${D("Expenses",w(a.expenses))}
        ${D("Net position",w(a.net))}
      </section>
      <section class="panel finance-aging">
        <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
        <div class="finance-aging-grid">
          ${[["Current",a.aging.current],["1-30",a.aging.thirty],["31-60",a.aging.sixty],["61+",a.aging.overSixty]].map(([c,d])=>`<div><span>${r(c)}</span><strong>${w(d)}</strong></div>`).join("")}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${i.length} billing record${i.length===1?"":"s"} for ${r(E(t))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${i.map(c=>`
            <a class="table-row" href="${_(m("finance",{invoice:c.id},t))}" data-router>
              <span><strong>${r(c.invoice_number)}</strong><small>${r(c.client_name||x(c.job_id)?.client_name||"No client")}</small></span>
              <span>${id(es(c))}</span>
              <span>${r(x(c.job_id)?.name||"Company level")}</span>
              <span>${T(c.due_date)}</span>
              <span>${w(c.total)}</span>
              <span>${w(gi(c.id))}</span>
              <span>${w(oe(c.id))}</span>
            </a>
          `).join("")||y("No invoices yet. Create one from a job or customer record.")}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${s.map(c=>Ue(Me(c.invoice_id)?.invoice_number||"Payment",c.method,w(c.amount),c.received_at)).join("")||y("No payments recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${o.map(c=>Ue(Ea(c.vendor_id),c.category,w(c.amount),c.spent_at,m("finance",{expense:c.id},t))).join("")||y("No expenses recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${l.map(c=>Ue(c.name,c.category,c.status,c.updated_at,m("finance",{vendor:c.id},t))).join("")||y("No vendors recorded.")}
          </div>
        </article>
      </section>
    </section>
  `}function vo(e,t){return e.params.get("invoice")?ho(t,e.params.get("invoice")):e.params.get("expense")?wo(t,e.params.get("expense")):e.params.get("vendor")?$o(t,e.params.get("vendor")):e.params.get("report")==="summary"?So(t):""}function ho(e,t){const a=Me(t);if(!a||a.company_id!==e)return M("Finance","Invoice",y("Invoice not found."));const i=Xn(a.id),s=x(a.job_id);return M("Finance",a.invoice_number,`
    <div class="finance-detail-modal">
      ${L([["Client",a.client_name||s?.client_name||"No client"],["Status",es(a)],["Job",s?.name||"Company level"],["Issued",T(a.issue_date)],["Due",T(a.due_date)],["Total",w(a.total)],["Collected",w(gi(a.id))],["Balance",w(oe(a.id))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${r(a.id)}"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        ${s?`<a class="btn" href="${_(m("jobs",{tab:"profile",job_id:s.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${i.length} payment${i.length===1?"":"s"} applied.</p></div></div>
        <div class="finance-compact-list">
          ${i.map(o=>Ue(o.reference||o.method,o.method,w(o.amount),o.received_at)).join("")||y("No payments yet.")}
        </div>
      </section>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function wo(e,t){const a=Zn(t);if(!a||a.company_id!==e)return M("Finance","Expense",y("Expense not found."));const i=x(a.job_id);return M("Finance",`${Ea(a.vendor_id)} expense`,`
    <div class="finance-detail-modal">
      ${L([["Vendor",Ea(a.vendor_id)],["Category",a.category],["Status",a.status],["Job",i?.name||"Company level"],["Spent",T(a.spent_at)],["Amount",w(a.amount)]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit expense</button>
        ${i?`<a class="btn" href="${_(m("files",{job_id:i.id},e))}" data-router><i class="ti ti-folder"></i>Job files</a>`:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function $o(e,t){const a=fi(t);if(!a||a.company_id!==e)return M("Finance","Vendor",y("Vendor not found."));const i=ui(e).filter(s=>s.vendor_id===a.id);return M("Finance",a.name,`
    <div class="finance-detail-modal">
      ${L([["Contact",a.contact_name||"No contact"],["Email",a.email||"No email"],["Phone",a.phone||"No phone"],["Category",a.category],["Status",a.status],["Spend",w(re(i,"amount"))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
        <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${r(a.id)}"><i class="ti ti-receipt"></i>Add expense</button>
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function So(e){const t=ts(e);return M("Finance","Summary report",`
    <div class="finance-report-modal">
      ${L([["Company",E(e)],["Estimated pipeline",w(t.pipeline)],["Invoiced",w(t.invoiced)],["Collected",w(t.collected)],["Outstanding",w(t.outstanding)],["Expenses",w(t.expenses)],["Net position",w(t.net)]])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${w(t.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${w(t.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${w(t.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${w(t.aging.overSixty)}</strong></div>
      </div>
    </div>
  `,"finance-modal")}function Ri(e,t=null){const a=t||Bc(e);return M("Finance",t?"Edit invoice":"New invoice",`
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${C("Invoice number","invoice_number",a.invoice_number,!0)}
      ${R("Linked job","job_id",a.job_id||"",[["","Company level"]].concat(U(e).map(i=>[i.id,i.name])))}
      ${C("Client","client_name",a.client_name,!0)}
      ${R("Status","status",a.status,dn.map(i=>[i,i]))}
      ${C("Issue date","issue_date",a.issue_date,!1,"date")}
      ${C("Due date","due_date",a.due_date,!1,"date")}
      ${C("Subtotal","subtotal",a.subtotal,!1,"number")}
      ${C("Tax","tax",a.tax,!1,"number")}
      ${be("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function ko(e,t=""){const a=zc(e,t),i=ve(e).map(s=>[s.id,`${s.invoice_number} - ${s.client_name||x(s.job_id)?.client_name||"No client"}`]);return M("Finance","Record payment",`
    <form class="finance-form" data-finance-payment-form>
      ${R("Invoice","invoice_id",a.invoice_id,i.length?i:[["","Create an invoice first"]])}
      ${C("Amount","amount",a.amount,!0,"number")}
      ${R("Method","method",a.method,pn.map(s=>[s,s]))}
      ${C("Received","received_at",a.received_at,!1,"date")}
      ${C("Reference","reference",a.reference)}
      ${be("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Pi(e,t=null,a=""){const i=t||Hc(e,a),s=pi(e).map(o=>[o.id,o.name]);return M("Finance",t?"Edit expense":"Add expense",`
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${r(i.id)}" />
      ${R("Vendor","vendor_id",i.vendor_id,s.length?s:[["","No vendor yet"]])}
      ${R("Linked job","job_id",i.job_id||"",[["","Company level"]].concat(U(e).map(o=>[o.id,o.name])))}
      ${R("Category","category",i.category,ia.map(o=>[o,o]))}
      ${R("Status","status",i.status,mn.map(o=>[o,o]))}
      ${C("Amount","amount",i.amount,!0,"number")}
      ${C("Spent date","spent_at",i.spent_at,!1,"date")}
      ${be("Notes","notes",i.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Ni(e,t=null){const a=t||Jc(e);return M("Finance",t?"Edit vendor":"Add vendor",`
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${C("Vendor name","name",a.name,!0)}
      ${C("Contact","contact_name",a.contact_name)}
      ${C("Email","email",a.email,!1,"email")}
      ${C("Phone","phone",a.phone)}
      ${R("Category","category",a.category,ia.map(i=>[i,i]))}
      ${R("Status","status",a.status,un.map(i=>[i,i]))}
      ${be("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Do(e,t){return e.section==="clock"?Mo(t):e.section==="calendar"?Co(e,t):e.section==="approvals"?Fo(t):Ao(t)}function sa(e,t){return`
    ${ai("Operations sections",[[m("time",{},e),"My time",t==="time"],[m("calendar",{},e),"Calendar",t==="calendar"],[m("approvals",{},e),"Approvals",t==="approvals"],[m("clock",{},e),"Clock dashboard",t==="clock"]])}
  `}function Co(e,t){const a=ic(t),i=da(t),s=a.filter(d=>d.dateKey===v(0)),o=i.filter(d=>d.mine),l=i.filter(d=>d.source!=="manual").length,c=F("calendar.manage",t);return`
    <section class="tool-page operations-page calendar-page">
      ${J("Calendar","Company schedule built from tasks, approvals, finance due dates, time context, and manual events.",`
        <button class="btn btn-primary" type="button" data-action="open-calendar-event-form"><i class="ti ti-calendar-plus"></i>New event</button>
      `)}
      ${sa(t,"calendar")}
      <section class="metric-grid operations-metrics calendar-metrics">
        ${D("Today",s.length)}
        ${D("This week",fc(a).length)}
        ${D("Mine",o.length)}
        ${D("From modules",l)}
      </section>
      <section class="workspace-toolbar calendar-toolbar">
        <div class="segmented" role="group" aria-label="Calendar scope">
          <button class="${n.calendarScope==="company"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="company"><i class="ti ti-building"></i>Company</button>
          <button class="${n.calendarScope==="me"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="me"><i class="ti ti-user"></i>Me</button>
        </div>
        <div class="segmented" role="group" aria-label="Calendar view">
          ${["month","week","list"].map(d=>`<button class="${n.calendarView===d?"active":""}" type="button" data-action="set-calendar-view" data-view="${r(d)}">${r(I(d))}</button>`).join("")}
        </div>
        <label class="wide-control">
          <span>Search</span>
          <input data-calendar-search value="${r(n.calendarQuery)}" placeholder="Find events, jobs, tasks, or people" />
        </label>
        <label>
          <span>Type</span>
          <select data-calendar-type-filter>
            <option value="all">All types</option>
            ${xs.map(d=>`<option value="${r(d)}" ${n.calendarTypeFilter===d?"selected":""}>${r(d)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="calendar-nav">
        <div>
          <button class="btn" type="button" data-action="calendar-prev"><i class="ti ti-chevron-left"></i></button>
          <button class="btn" type="button" data-action="calendar-today">Today</button>
          <button class="btn" type="button" data-action="calendar-next"><i class="ti ti-chevron-right"></i></button>
        </div>
        <strong>${r(_c())}</strong>
      </section>
      <section class="calendar-shell">
        <article class="panel calendar-main">
          ${n.calendarView==="month"?jo(t,a):""}
          ${n.calendarView==="week"?Io(t,a):""}
          ${n.calendarView==="list"?qo(t,a):""}
        </article>
        <aside class="panel calendar-agenda">
          <div class="section-head"><div><h2>Agenda</h2><p>Next events that match this view.</p></div></div>
          <div class="calendar-agenda-list">
            ${a.slice(0,9).map(xn).join("")||y("No calendar items match this view.")}
          </div>
        </aside>
      </section>
      ${c?"":'<p class="small-note">Your role can view the calendar. Manual company events require calendar manage permission.</p>'}
    </section>
  `}function jo(e,t){const a=bc(n.calendarCursorDate),i=new Date(`${n.calendarCursorDate}T00:00:00`).getMonth();return`
    <div class="calendar-grid calendar-month-grid">
      ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(s=>`<div class="calendar-weekday">${s}</div>`).join("")}
      ${a.map(s=>{const o=Bn(t,s.key);return`
          <div class="calendar-day ${s.month===i?"":"muted"} ${s.key===v(0)?"today":""}">
            <div class="calendar-day-head"><b>${s.label}</b><span>${o.length||""}</span></div>
            ${o.slice(0,3).map(On).join("")}
            ${o.length>3?`<small class="calendar-more">+${o.length-3} more</small>`:""}
          </div>
        `}).join("")}
    </div>
  `}function Io(e,t){return`
    <div class="calendar-grid calendar-week-grid">
      ${zn(n.calendarCursorDate).map(i=>{const s=Bn(t,i.key);return`
          <div class="calendar-day ${i.key===v(0)?"today":""}">
            <div class="calendar-day-head"><b>${r(i.name)}</b><span>${r(i.shortDate)}</span></div>
            ${s.map(On).join("")||'<small class="calendar-empty-day">Open</small>'}
          </div>
        `}).join("")}
    </div>
  `}function qo(e,t){const a=yc(t);return`
    <div class="calendar-list">
      ${Object.entries(a).slice(0,18).map(([s,o])=>`
        <section class="calendar-list-day">
          <h3>${r(T(s))}</h3>
          ${o.map(xn).join("")}
        </section>
      `).join("")||y("No scheduled work or events.")}
    </div>
  `}function On(e){return`
    <button class="calendar-pill ${r(vc(e.type))}" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <span>${r(Hn(e))}</span>
      <strong>${r(e.title)}</strong>
    </button>
  `}function xn(e){return`
    <button class="calendar-agenda-item" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <i class="ti ${r(hc(e.type))}"></i>
      <span><strong>${r(e.title)}</strong><small>${r(`${T(e.dateKey)} · ${Hn(e)} · ${e.type}`)}</small></span>
    </button>
  `}function Ao(e){const t=Wn(e),a=wt(e);return`
    <section class="tool-page operations-page">
      ${J("My time","A compact personal work queue built from this company's tasks.",`
        <a class="btn" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${sa(e,"time")}
      <section class="metric-grid operations-metrics">
        ${D("Due today",t.dueToday.length)}
        ${D("Overdue",t.overdue.length)}
        ${D("Open work",t.open.length)}
        ${D("In review",t.review.length)}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel span-2">
          <div class="section-head"><div><h2>Today</h2><p>Due now, overdue, and highest priority work.</p></div></div>
          <div class="queue-list">
            ${t.focus.slice(0,8).map(i=>$a(i)).join("")||y("No time-sensitive tasks for this company.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
          ${L([["Company",E(e)],["Assigned to you",String(t.assignedToMe.length)],["Due this week",String(t.thisWeek.length)],["Completed",String(t.done.length)]])}
        </article>
      <article class="panel span-2">
          <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
          <div class="data-table operations-table">
            <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
            ${t.thisWeek.slice(0,8).map(i=>`
              <a class="table-row" href="${_(m("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},e))}" data-router>
                <span><strong>${r(i.title)}</strong><small>${r(i.description||Ze(i.type))}</small></span>
                <span>${r(x(i.project_id)?.name||"Company task")}</span>
                <span>${r(H(i.assignee_id))}</span>
                <span>${T(i.due)}</span>
                <span>${cs(i.status)}</span>
              </a>
            `).join("")||y("No upcoming tasks this week.")}
          </div>
        </article>
      </section>
    </section>
  `}function Mo(e){const t=Kn(e),a=wt(e),i=Ia().getTime(),s=i-6*864e5,o=Ji(e,i)+(a?Date.now()-Date.parse(a.started_at):0),l=Ji(e,s)+(a?Date.now()-Date.parse(a.started_at):0);return`
    <section class="tool-page operations-page clock-page">
      ${J("Clock dashboard","Local basic-mode clock tracking for the active company.",`
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${sa(e,"clock")}
      <section class="metric-grid operations-metrics">
        ${D("Today",Ft(o))}
        ${D("Last 7 days",Ft(l))}
        ${D("Entries",t.length)}
        ${D("Status",a?"Clocked in":"Off clock")}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${a?L([["User",H(a.user_id)],["Started",Bt(a.started_at)],["Task",a.task_title||"General shift"],["Elapsed",Ft(Date.now()-Date.parse(a.started_at))]]):y("Nobody is clocked in on this device.")}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${t.slice(0,10).map(c=>`
              <div class="table-row">
                <span><strong>${r(c.task_title||"General shift")}</strong><small>${r(c.notes||"Clock entry")}</small></span>
                <span>${r(H(c.user_id))}</span>
                <span>${Bt(c.started_at)}</span>
                <span>${Ft(c.duration_ms)}</span>
              </div>
            `).join("")||y("No clock entries yet.")}
          </div>
        </article>
      </section>
    </section>
  `}function Fo(e){const t=di(e),a=t.filter(o=>o.type==="Form approval"),i=t.filter(o=>o.type==="Task review"),s=t.filter(o=>o.type==="Access request");return`
    <section class="tool-page operations-page">
      ${J("Approvals","Company review queue for forms, task handoffs, and access requests.",`
        <a class="btn" href="${_(m("forms",{},e))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${sa(e,"approvals")}
      <section class="metric-grid operations-metrics">
        ${D("Open approvals",t.length)}
        ${D("Forms",a.length)}
        ${D("Task reviews",i.length)}
        ${D("Access",s.length)}
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
              <span>${T(o.updatedAt)}</span>
            </a>
          `).join("")||y("No approvals need attention right now.")}
        </div>
      </section>
    </section>
  `}function Ui(e){return`
    ${J(I(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${y("Module data model pending.")}
    </section>
  `}function To(){document.title="Sign in | Quest HQ";const e=oa(n.route.params.get("return_url")||_(m("jobs",{},P()))),t=String(n.route.params.get("invite")||"").trim();na.innerHTML=`
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
            <button class="${n.authMode==="signin"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="signin">Sign in</button>
            <button class="${n.authMode==="register"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="register">${t?"Create account":"Create workspace"}</button>
            <button class="${n.authMode==="invite"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="invite">Invite code</button>
            <button class="${n.authMode==="request"?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="request">Request access</button>
          </div>
          ${Oo(e)}
        `}
        ${Eo(e)}

      </section>
    </main>
  `}function Eo(e){return`
    <section class="demo-mode-box">
      <div>
        <strong>Demo mode</strong>
        <span>Local-only sample workspace. No Supabase database reads or writes.</span>
      </div>
      <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${r(e)}">Open demo mode</button>
    </section>
  `}function Oo(e){const t=String(n.route?.params?.get("invite")||"").trim();return n.authMode==="register"?`
      <form data-auth-register-form>
        <label>${t?"Name / username":"Full name"}<input name="full_name" autocomplete="name" required /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required /></label>
        ${t?"":'<label>Company workspace<input name="company_name" placeholder="Example Roofing LLC" required /></label>'}
        <input type="hidden" name="invite_token" value="${r(t)}" />
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">${t?"Create account and join":"Create secure workspace"}</button>
        ${It(t?"The invite email must match this account email.":"Owner role, trial subscription, and workspace isolation are created automatically.")}
      </form>
    `:n.authMode==="invite"?`
      <form data-auth-invite-code-form>
        <label>Invite code<input name="invite_code" autocomplete="one-time-code" required placeholder="Paste the code from your admin" /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Continue with invite code</button>
        ${It("Invite codes are shared by your Owner/Admin. No email delivery required.")}
      </form>
    `:n.authMode==="request"?`
      <form data-auth-request-form>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" required /></label>
        <label>Company ID<input name="company_id" placeholder="company-workspace-id" required /></label>
        <label>Message<input name="message" placeholder="Tell the admin why you need access" /></label>
        <input type="hidden" name="return_url" value="${r(e)}" />
        <button class="btn btn-primary full" type="submit">Request company access</button>
        ${It("Requests stay pending until a company Owner/Admin approves them.")}
      </form>
    `:`
    <form data-auth-sign-in-form>
      <label>Email<input name="email" type="email" autocomplete="email" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <input type="hidden" name="invite_token" value="${r(t)}" />
      <input type="hidden" name="return_url" value="${r(e)}" />
      <button class="btn btn-primary full" type="submit">Sign in</button>
      ${It("Use the company workspace account your Owner/Admin invited.")}
    </form>
  `}function It(e){return n.loginError?`<div class="form-message error">${r(n.loginError)}</div>`:`<div class="form-message">${r(n.authMessage||e)}</div>`}function xo(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${de(e,"avatar large")}
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
  `}function Ro(e,t){if(n.modal==="profile")return xo(t.profile);if(n.modal==="file-upload")return Fr();if(n.modal==="folder-new")return Mr();if(n.modal==="file-detail")return Qo(p());if(n.modal==="forms-tools")return Vo(p());if(n.modal==="form-actions")return Jo(p(),ct(p()));if(n.modal==="form-new")return Bo(p());if(n.modal==="form-preview")return Ho(p(),ct(p()));if(n.modal==="job-new")return Aa(p(),null);if(n.modal==="job-edit")return Aa(p(),Ce());if(n.modal==="finance-invoice-new")return Ri(p(),null);if(n.modal==="finance-invoice-edit")return Ri(p(),Me(n.selectedFinanceInvoiceId));if(n.modal==="finance-payment-new")return ko(p(),n.selectedFinanceInvoiceId);if(n.modal==="finance-expense-new")return Pi(p(),null,n.selectedFinanceVendorId);if(n.modal==="finance-expense-edit")return Pi(p(),Zn(n.selectedFinanceExpenseId));if(n.modal==="finance-vendor-new")return Ni(p(),null);if(n.modal==="finance-vendor-edit")return Ni(p(),fi(n.selectedFinanceVendorId));if(n.modal==="role-new")return Qr(p());if(n.modal==="invite-new")return Vr(p());if(n.modal==="message-group-new")return po(p());if(n.modal==="message-direct-new")return fo(p());if(n.modal==="message-access")return go(p(),n.selectedConversationId);if(n.modal==="message-details")return bo(p(),n.selectedConversationId);if(n.modal==="message-search")return _o(p());if(n.modal==="calendar-event-detail")return Lo(p());if(n.modal==="calendar-event-new")return Li(p(),null);if(n.modal==="calendar-event-edit")return Li(p(),ht(n.selectedCalendarEventId));if(e.name==="company"&&e.section==="crm"&&e.params.get("account"))return io(e.companyId,e.params.get("account"));if(e.name==="company"&&e.section==="finance"){const a=vo(e,e.companyId);if(a)return a}return e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"?Aa(e.companyId,e.jobId?x(e.jobId):Ce()):e.name==="company"&&e.section==="tasks"?Uo(e,e.companyId):""}function Po(){return n.toast?`
    <div class="app-toast ${r(n.toast.mode||"local")}" role="status" aria-live="polite">
      <strong>${r(n.toast.title||"Quest HQ")}</strong>
      <span>${r(n.toast.message||"")}</span>
    </div>
  `:""}function k(e,t="local",a="Not available yet"){n.toastTimer&&clearTimeout(n.toastTimer),n.toast={title:a,message:e,mode:t},u(),n.toastTimer=setTimeout(()=>{n.toast=null,n.toastTimer=null,u()},4200)}function M(e,t,a,i=""){return`
    <div class="modal-overlay">
      <div class="modal-panel ${r(i)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </div>
    </div>
  `}function No(e,t,a){return`
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </aside>
    </div>
  `}function Aa(e,t){return M("Jobs",t?"Edit job":"Create job",fr(e,t),"wide-modal")}function Uo(e,t){const a=e.jobId?x(e.jobId):null,i=e.params.get("task_id")||"",s=i?la(i):null;return e.params.get("new")==="1"?M("Tasks","New task",xi(t,a,null),"task-modal"):e.params.get("edit")==="1"&&s?M("Tasks","Edit task",xi(t,a,s),"task-modal"):s?No("Task detail",s.title,vr(t,s)):""}function Lo(e){const t=uc(n.selectedCalendarEventId,e);if(!t)return"";const a=t.source==="manual"?ht(t.sourceId):null,i=[t.href?`<a class="btn btn-primary" href="${_(t.href)}" data-router><i class="ti ti-arrow-right"></i>Open source</a>`:"",a&&t.editable?`<button class="btn" type="button" data-action="edit-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit</button>`:"",a&&t.editable?`<button class="btn danger" type="button" data-action="delete-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-trash"></i>Delete</button>`:""].filter(Boolean).join("");return M("Calendar",t.title,`
    <div class="calendar-detail">
      ${L([["Type",t.type],["When",t.allDay?T(t.dateKey):`${Bt(t.startsAt)}${t.endsAt&&t.endsAt!==t.startsAt?` - ${Bt(t.endsAt)}`:""}`],["Assigned",t.owner||"Unassigned"],["Source",t.source==="manual"?"Manual event":I(t.source)],["Linked",t.linkLabel||"None"]])}
      ${t.description?`<p>${r(t.description)}</p>`:""}
      <div class="modal-actions">${i||'<span class="small-note">This derived item opens from its source module.</span>'}</div>
    </div>
  `,"calendar-modal")}function Li(e,t){const a=t||Wc(e),i=a.linked_type==="job"?a.linked_id:"";return M("Calendar",t?"Edit event":"New event",`
    <form class="calendar-form" data-calendar-event-form>
      <input type="hidden" name="id" value="${r(t?.id||"")}" />
      ${C("Title","title",t?a.title:"",!0)}
      ${R("Type","event_type",a.event_type,aa.map(s=>[s,s]))}
      ${C("Starts","starts_at",Yi(a.starts_at),!0,"datetime-local")}
      ${C("Ends","ends_at",Yi(a.ends_at||a.starts_at),!0,"datetime-local")}
      <label class="check-row"><input type="checkbox" name="all_day" ${a.all_day?"checked":""} /> All day</label>
      ${R("Visibility","visibility",a.visibility,[["company","Company"],["private","Private / assigned"]])}
      ${R("Assigned to","assigned_profile_id",a.assigned_profile_id,nd(e))}
      ${R("Linked job","linked_job_id",i,[["","No linked job"]].concat(U(e).map(s=>[s.id,s.name])))}
      <label class="span-2">Description<textarea name="description" rows="4">${r(a.description)}</textarea></label>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save event</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"calendar-form-modal")}function Qo(e){const t=n.selectedFileId?n.files.find(a=>a.id===n.selectedFileId):null;return t?M("Open file",t.file_name,qr(t),"file-viewer-modal"):""}function Vo(e){return M("Forms","Tools",`
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${n.formTypeFilter==="all"?"selected":""}>All types</option>
          ${bt.map(t=>`<option value="${r(t)}" ${n.formTypeFilter===t?"selected":""}>${r(t)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `)}function Bo(e){const t=n.formStartTab==="templates"?"templates":"blank",a=tt(),i=t==="templates"&&(a.find(d=>d.id===n.formStartTemplateId)||a[0])||null,s=i?.title||"",o=i?.description||"",l=i?.type||"Internal",c=i?.questions||[{type:"short",label:"First question",required:!1,options:[]}];return M("Forms","New form builder",`
    <form class="new-form-modal builder-create-modal" data-new-form-form>
      <input type="hidden" name="template_id" value="${r(i?.id||"")}" />
      <div class="form-start-tabs" role="tablist" aria-label="New form start type">
        <button class="${t==="blank"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="blank"><i class="ti ti-clipboard-plus"></i>Blank</button>
        <button class="${t==="templates"?"active":""}" type="button" data-action="set-form-start-tab" data-tab="templates"><i class="ti ti-template"></i>Templates</button>
      </div>
      ${t==="templates"?`
        <div class="new-form-template-grid">
          ${a.map(d=>`
            <button class="${i?.id===d.id?"active":""}" type="button" data-action="select-form-start-template" data-template-id="${r(d.id)}">
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
            <div class="gform-accent-strip" style="--form-accent:${r(he(e))}"></div>
            <label><span>Form title</span><input name="title" value="${r(s)}" placeholder="Untitled form" required /></label>
            <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${r(o)}</textarea></label>
          </article>
          <div class="new-form-question-list">
            ${c.map((d,f)=>zo(d,f)).join("")}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${i?r(i.title):"Blank starter"}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${bt.map(d=>`<option value="${r(d)}" ${d===l?"selected":""}>${r(d)}</option>`).join("")}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${U(e).map(d=>`<option value="${r(d.id)}" ${n.route?.jobId===d.id?"selected":""}>${r(d.name)}</option>`).join("")}</select></label>
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
  `,"form-create-modal builder-modal")}function zo(e,t){const a=dt(e)?`
    <div class="starter-options">
      ${(e.options||["Option 1","Option 2"]).map(i=>`<span>${r(i)}</span>`).join("")}
    </div>
  `:"";return`
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${t+1}</span>
        <strong>${r(Ed(e.type))}</strong>
      </div>
      <label><span>Question</span><input value="${r(e.label||"Untitled question")}" readonly /></label>
      ${e.help?`<small>${r(e.help)}</small>`:""}
      ${a}
      <label class="check-row"><input type="checkbox" ${e.required?"checked":""} disabled /> Required</label>
    </article>
  `}function Ho(e,t){return t?M("Forms","Preview form",`
    <div class="form-preview-modal-body">
      ${Xr(e,t)}
    </div>
  `,"form-preview-modal"):M("Forms","Preview form",y("Choose a form first."))}function Jo(e,t){return t?M("Forms","Manage form",`
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
  `):M("Forms","Manage form",y("Choose a form first."))}function Wo(e){const t=n.accountMenuOpen&&!e.target.closest(".account-menu"),a=n.notificationMenuOpen&&!e.target.closest(".notification-center");t&&(n.accountMenuOpen=!1),a&&(n.notificationMenuOpen=!1);const i=e.target.closest("[data-action]");if(i){Ko(e,i);return}const s=e.target.closest("[data-select-job]");if(s){e.preventDefault(),Kl(s.dataset.selectJob);return}const o=e.target.closest("[data-select-task]");if(o){e.preventDefault(),Yl(o.dataset.selectTask);return}const l=e.target.closest("a[href][data-router]");if(!l){(t||a)&&u();return}l.target||l.hasAttribute("download")||(e.preventDefault(),j(l.getAttribute("href")))}function Ko(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),n.dataLoaded=!1,n.sync={label:"Refreshing...",mode:"loading"},u();return}if(a==="sign-out"){e.preventDefault(),n.accountMenuOpen=!1,Zo();return}if(a==="toggle-account-menu"){e.preventDefault(),n.accountMenuOpen=!n.accountMenuOpen,n.notificationMenuOpen=!1,u();return}if(a==="toggle-notifications"){e.preventDefault(),n.notificationMenuOpen=!n.notificationMenuOpen,n.accountMenuOpen=!1,u();return}if(a==="mark-all-notifications-read"){e.preventDefault(),Sd(p()).catch(i=>console.warn("Notification read sync failed",i));return}if(a==="open-notification"){e.preventDefault(),kd(t.dataset.notificationId).catch(i=>console.warn("Notification open sync failed",i));return}if(a==="verify-email"){e.preventDefault(),n.accountMenuOpen=!1,k("Email verification is not implemented yet. Account access is not blocked right now.","local");return}if(a==="start-demo-mode"){e.preventDefault(),Rn(t.dataset.returnUrl||"");return}if(a==="set-auth-mode"){e.preventDefault(),n.authMode=["signin","register","invite","request"].includes(t.dataset.authMode)?t.dataset.authMode:"signin",n.loginError="",n.authMessage="",u();return}if(a==="open-profile"){e.preventDefault(),n.accountMenuOpen=!1,n.modal="profile",u();return}if(a==="open-role-form"){e.preventDefault(),n.modal="role-new",u();return}if(a==="view-as-role"){e.preventDefault();const i=p(),s=Ge(i,t.dataset.roleId);if(!s){k("That role is no longer available.","local","Role preview");return}n.rolePreview={company_id:i,role_id:s.id},k(`Viewing the workspace as ${s.name}.`,"local","Role preview");return}if(a==="exit-role-preview"){e.preventDefault(),n.rolePreview=null,k("Role preview ended.","live","Role preview");return}if(a==="open-invite-form"){e.preventDefault(),n.modal="invite-new",u();return}if(a==="new-message-group"){e.preventDefault(),n.modal="message-group-new",u();return}if(a==="new-direct-message"){e.preventDefault(),n.modal="message-direct-new",u();return}if(a==="manage-message-chat"){e.preventDefault(),n.selectedConversationId=t.dataset.conversationId||n.selectedConversationId,n.modal="message-access",u();return}if(a==="message-details"){e.preventDefault(),n.selectedConversationId=t.dataset.conversationId||n.selectedConversationId,n.modal="message-details",u();return}if(a==="message-search-results"){e.preventDefault(),n.modal="message-search",u();return}if(a==="set-message-filter"){e.preventDefault(),n.messageFilter=["all","unread",...Ya].includes(t.dataset.filter)?t.dataset.filter:"all",u();return}if(a==="delete-message"){e.preventDefault(),hl(t.dataset.messageId);return}if(a==="open-message-attachment"){e.preventDefault(),wl(t.dataset.attachmentId);return}if(a==="run-message-scenario"){e.preventDefault(),ud(p());return}if(a==="reset-message-demo"){e.preventDefault(),fd();return}if(a==="set-calendar-scope"){e.preventDefault(),n.calendarScope=t.dataset.scope==="me"?"me":"company",u();return}if(a==="set-calendar-view"){e.preventDefault(),n.calendarView=["month","week","list"].includes(t.dataset.view)?t.dataset.view:"week",u();return}if(a==="calendar-prev"){e.preventDefault(),Hi(-1),u();return}if(a==="calendar-next"){e.preventDefault(),Hi(1),u();return}if(a==="calendar-today"){e.preventDefault(),n.calendarCursorDate=v(0),u();return}if(a==="open-calendar-event"){e.preventDefault(),n.selectedCalendarEventId=t.dataset.eventId||"",n.modal="calendar-event-detail",u();return}if(a==="open-calendar-event-form"){if(e.preventDefault(),!F("calendar.manage",p())){k("Your role can view the calendar but cannot create company events.","local","Calendar");return}n.selectedCalendarEventId="",n.modal="calendar-event-new",u();return}if(a==="edit-calendar-event"){e.preventDefault();const i=ht(t.dataset.eventId);if(!i||!vt(i)){k("This event cannot be edited from Calendar.","local","Calendar");return}n.selectedCalendarEventId=i.id,n.modal="calendar-event-edit",u();return}if(a==="delete-calendar-event"){e.preventDefault(),yl(t.dataset.eventId);return}if(a==="copy-invite-link"){e.preventDefault(),cl(t.dataset.inviteId);return}if(a==="copy-invite-code"){e.preventDefault(),dl(t.dataset.inviteId);return}if(a==="revoke-invite"){e.preventDefault(),ml(t.dataset.inviteId);return}if(a==="approve-join-request"){e.preventDefault(),Qi(t.dataset.requestId,"approved");return}if(a==="reject-join-request"){e.preventDefault(),Qi(t.dataset.requestId,"rejected");return}if(a==="start-checkout"){e.preventDefault(),rl();return}if(a==="open-file-upload"){e.preventDefault(),n.modal="file-upload",u();return}if(a==="open-folder-form"){e.preventDefault(),n.modal="folder-new",u();return}if(a==="open-job-form"){e.preventDefault();const i=t.dataset.jobId||"";i&&(n.selectedJobId=i),n.modal=t.dataset.mode==="edit"?"job-edit":"job-new",u();return}if(a==="open-forms-tools"){e.preventDefault(),n.modal="forms-tools",u();return}if(a==="open-form-actions"){e.preventDefault(),Mt(t.dataset.formId,!1),n.modal="form-actions",u();return}if(a==="open-form-preview"){e.preventDefault(),Mt(t.dataset.formId,!1),n.modal="form-preview",u();return}if(a==="set-form-start-tab"){e.preventDefault(),n.formStartTab=t.dataset.tab==="templates"?"templates":"blank",n.formStartTab==="blank"&&(n.formStartTemplateId=""),n.formStartTab==="templates"&&!n.formStartTemplateId&&(n.formStartTemplateId=tt()[0]?.id||""),u();return}if(a==="select-form-start-template"){e.preventDefault(),n.formStartTab="templates",n.formStartTemplateId=t.dataset.templateId||tt()[0]?.id||"",u();return}if(a==="close-modal"){e.preventDefault(),Yo();return}if(a==="set-task-view"){e.preventDefault(),n.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(rn,n.taskView),u();return}if(a==="set-drive-view"){e.preventDefault(),n.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem(on,n.driveView),u();return}if(a==="clock-in"){e.preventDefault(),Ac(p(),t.dataset.taskId||n.route?.params?.get("task_id")||"");return}if(a==="clock-out"){e.preventDefault(),Yn();return}if(a==="select-file"){e.preventDefault(),n.selectedFileId=t.dataset.fileId||"",n.modal="file-detail",u();return}if(a==="download-file"){e.preventDefault(),El(t.dataset.fileId);return}if(a==="delete-file"){e.preventDefault(),Ol(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),n.formsTab=t.dataset.tab==="responses"?"responses":"library",u();return}if(a==="set-form-editor-tab"){e.preventDefault(),n.formEditorTab=t.dataset.tab||"questions",u();return}if(a==="new-form"){e.preventDefault(),n.formStartTemplateId=t.dataset.templateId||"",n.formStartTab=t.dataset.startTab==="templates"||n.formStartTemplateId?"templates":"blank",n.formStartTab==="templates"&&!n.formStartTemplateId&&(n.formStartTemplateId=tt()[0]?.id||""),n.modal="form-new",u();return}if(a==="select-form"){e.preventDefault(),Mt(t.dataset.formId);return}if(a==="toggle-form-card"){e.preventDefault();const i=t.dataset.formId||"";n.expandedFormIds.has(i)?n.expandedFormIds.delete(i):n.expandedFormIds.add(i),u();return}if(a==="edit-form"){e.preventDefault(),Mt(t.dataset.formId,!1),n.formsTab="builder",n.formEditorTab="questions",n.modal="",u();return}if(a==="save-form"){e.preventDefault(),Z("Form saved locally"),u();return}if(a==="publish-form"){e.preventDefault(),an(t.dataset.formId,"Published");return}if(a==="archive-form"){e.preventDefault(),an(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){e.preventDefault(),Pd(t.dataset.formId);return}if(a==="delete-form"){e.preventDefault(),Nd(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),Ud(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),Ld(p());return}if(a==="new-finance-invoice"){e.preventDefault(),n.selectedFinanceInvoiceId="",n.modal="finance-invoice-new",u();return}if(a==="edit-finance-invoice"){e.preventDefault(),n.selectedFinanceInvoiceId=t.dataset.invoiceId||"",n.modal="finance-invoice-edit",u();return}if(a==="new-finance-payment"){e.preventDefault(),n.selectedFinanceInvoiceId=t.dataset.invoiceId||n.route?.params?.get("invoice")||"",n.modal="finance-payment-new",u();return}if(a==="new-finance-expense"){e.preventDefault(),n.selectedFinanceExpenseId="",n.selectedFinanceVendorId=t.dataset.vendorId||"",n.modal="finance-expense-new",u();return}if(a==="edit-finance-expense"){e.preventDefault(),n.selectedFinanceExpenseId=t.dataset.expenseId||"",n.modal="finance-expense-edit",u();return}if(a==="new-finance-vendor"){e.preventDefault(),n.selectedFinanceVendorId="",n.modal="finance-vendor-new",u();return}if(a==="edit-finance-vendor"){e.preventDefault(),n.selectedFinanceVendorId=t.dataset.vendorId||"",n.modal="finance-vendor-edit",u();return}if(a==="add-question"){e.preventDefault(),Qd(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){e.preventDefault(),Vd(t.dataset.questionId);return}if(a==="delete-question"){e.preventDefault(),Bd(t.dataset.questionId);return}if(a==="move-question"){e.preventDefault(),zd(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){e.preventDefault(),Hd(t.dataset.questionId);return}if(a==="remove-question-option"){e.preventDefault(),Jd(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){e.preventDefault(),Dl(t.dataset.jobId);return}a==="delete-task"&&(e.preventDefault(),jl(t.dataset.taskId))}function Yo(){const e=n.route||ra();if(n.modal="",n.formStartTemplateId="",n.formStartTab="blank",n.selectedFinanceInvoiceId="",n.selectedFinanceExpenseId="",n.selectedFinanceVendorId="",e.name==="company"&&e.section==="tasks"&&(e.params.get("new")||e.params.get("edit")||e.params.get("task_id"))){j(m("tasks",e.jobId?{job_id:e.jobId}:{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"){const t=e.jobId?x(e.jobId):Ce();j(m("jobs",{tab:t?"profile":"pipeline",...t?{job_id:t.id}:{}},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="crm"&&e.params.get("account")){j(m("crm",{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="finance"&&(e.params.get("invoice")||e.params.get("expense")||e.params.get("vendor")||e.params.get("report"))){j(m("finance",{},e.companyId),{replace:!0});return}u()}function Go(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===Le.localUsername&&String(t.password||"")===Le.localPassword)){n.loginError="Invalid temporary credentials.",u();return}n.loginError="",Rn(t.return_url||_(m("jobs",{},P())));return}if(e.target.matches("[data-auth-sign-in-form]")){e.preventDefault(),tl(e.target);return}if(e.target.matches("[data-auth-register-form]")){e.preventDefault(),il(e.target);return}if(e.target.matches("[data-auth-invite-code-form]")){e.preventDefault(),al(e.target);return}if(e.target.matches("[data-auth-request-form]")){e.preventDefault(),sl(e.target);return}if(e.target.matches("[data-company-create-form]")){e.preventDefault(),nl(e.target);return}if(e.target.matches("[data-profile-form]")){e.preventDefault(),Xo(e.target).catch(t=>{k(t.message||"Profile save failed.","local","Profile")});return}if(e.target.matches("[data-job-form]")){e.preventDefault(),kl(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),Cl(e.target);return}if(e.target.matches("[data-new-form-form]")){e.preventDefault(),Rd(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),Il(e.target);return}if(e.target.matches("[data-folder-form]")){e.preventDefault(),ql(e.target);return}if(e.target.matches("[data-finance-invoice-form]")){e.preventDefault(),Al(e.target);return}if(e.target.matches("[data-finance-payment-form]")){e.preventDefault(),Ml(e.target);return}if(e.target.matches("[data-finance-expense-form]")){e.preventDefault(),Fl(e.target);return}if(e.target.matches("[data-finance-vendor-form]")){e.preventDefault(),Tl(e.target);return}if(e.target.matches("[data-role-form]")){e.preventDefault(),ol(e.target);return}if(e.target.matches("[data-invite-form]")){e.preventDefault(),ll(e.target);return}if(e.target.matches("[data-message-group-form]")){e.preventDefault(),pl(e.target);return}if(e.target.matches("[data-direct-message-form]")){e.preventDefault(),fl(e.target);return}if(e.target.matches("[data-message-access-form]")){e.preventDefault(),gl(e.target);return}if(e.target.matches("[data-message-form]")){e.preventDefault(),bl(e.target);return}if(e.target.matches("[data-calendar-event-form]")){e.preventDefault(),_l(e.target);return}if(e.target.matches("[data-user-role-form]")){e.preventDefault(),ul(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),Wd(e.target))}async function Zo(){if(n.session?.auth==="supabase"){const e=q();e?.auth&&await e.auth.signOut()}localStorage.removeItem(Qe),n.session=null,n.dataLoaded=!1,j("/login",{replace:!0})}function Rn(e=""){n.loginError="",n.authMessage="",n.session=xa(),jn(),n.activeCompanyId=p(),localStorage.setItem(_e,n.activeCompanyId),$(Qe,n.session),n.dataLoaded=!1,n.dataLoading=!1,j(oa(e||_(m("jobs",{},p()))),{replace:!0})}async function Xo(e){const t=new FormData(e),a=b().profile,i=e.elements.avatar_file?.files?.[0]||null;let s=String(t.get("avatar_url")||a.avatar_url||"").trim();if(i&&i.size){const l=await el(i);if(!l.ok)return;s=l.url}let o=rt({...a,full_name:String(t.get("full_name")||"").trim()||a.full_name||"Quest user",avatar_url:s},a);if(n.session?.auth==="supabase"){const l=q();if(!l){k("Profile upload needs Supabase to be available.","local","Profile");return}const c=await l.from("profiles").update({full_name:o.full_name,avatar_url:o.avatar_url}).eq("id",a.id).select().single();if(c.error){k(c.error.message||"Profile save failed.","local","Profile");return}o=rt(c.data,o),l.auth?.updateUser&&await l.auth.updateUser({data:{full_name:o.full_name,avatar_url:o.avatar_url}}),n.profiles=[o].concat(n.profiles.filter(d=>d.id!==o.id)),o.member_id&&(n.teamMembers=n.teamMembers.map(d=>d.id===o.member_id?{...d,full_name:o.full_name,name:o.full_name,avatar_url:o.avatar_url}:d))}else $(sn,o),n.profileDraft=o;n.session={...b(),profile:o},$(Qe,n.session),n.modal="",k("Profile saved.",n.session?.auth==="supabase"?"live":"local","Profile")}async function el(e){if(!["image/jpeg","image/png","image/webp"].includes(e.type))return k("Use a PNG, JPG, or WebP image for your profile picture.","local","Profile"),{ok:!1,url:""};if(e.size>2*1024*1024)return k("Profile pictures must be 2 MB or smaller.","local","Profile"),{ok:!1,url:""};if(n.session?.auth!=="supabase"){const f=await fs(e);return f?{ok:!0,url:f}:(k("Could not read that image file.","local","Profile"),{ok:!1,url:""})}const a=q(),i=b().profile.id,s=Ad(e),o=`${i}/avatar-${Date.now()}.${s}`,l=await a.storage.from("avatars").upload(o,e,{cacheControl:"3600",upsert:!0,contentType:e.type});if(l.error)return k(l.error.message||"Profile picture upload failed.","local","Profile"),{ok:!1,url:""};const c=a.storage.from("avatars").getPublicUrl(o),d=c.data?.publicUrl?`${c.data.publicUrl}?v=${Date.now()}`:"";return d?{ok:!0,url:d}:(k("Profile picture uploaded, but no public URL was returned.","local","Profile"),{ok:!1,url:""})}async function tl(e){const t=Object.fromEntries(new FormData(e).entries()),a=q();if(!a?.auth){n.loginError="Supabase auth is unavailable.",u();return}n.loginError="",n.authMessage="Signing in...",u();const i=await a.auth.signInWithPassword({email:String(t.email||"").trim(),password:String(t.password||"")});if(i.error){n.loginError=i.error.message||"Unable to sign in.",n.authMessage="",u();return}if(await at(i.data.session),t.invite_token){await Pn(t.invite_token,t.return_url);return}n.authMessage="",n.dataLoaded=!1,j(oa(t.return_url||_(m("jobs",{},P()))),{replace:!0})}function al(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.invite_code||"").trim();if(!a){n.loginError="Invite code is required.",u();return}n.loginError="",n.authMessage="",n.authMode="register";const i=new URLSearchParams({invite:a}),s=oa(t.return_url||"");s&&i.set("return_url",s),j(`/login?${i.toString()}`,{replace:!0})}async function il(e){const t=Object.fromEntries(new FormData(e).entries()),a=q();if(!a?.auth){n.loginError="Supabase auth is unavailable.",u();return}const i=String(t.email||"").trim(),s=String(t.password||""),o=String(t.full_name||"").trim(),l=String(t.invite_token||"").trim(),c=String(t.company_name||"").trim();if(!i||!s||!o||!l&&!c){n.loginError=l?"Name, email, and password are required.":"Name, email, password, and company workspace are required.",u();return}n.loginError="",n.authMessage=l?"Creating account and accepting invite...":"Creating secure workspace...",u();const d=await a.auth.signUp({email:i,password:s,options:{data:{full_name:o}}});if(d.error){n.loginError=d.error.message||"Unable to create account.",n.authMessage="",u();return}let f=d.data.session;if(!f){const A=await a.auth.signInWithPassword({email:i,password:s});if(A.error){n.loginError="Account created. Please sign in to finish workspace setup.",n.authMode="signin",n.authMessage="",u();return}f=A.data.session}if(await at(f),l){await Pn(l,t.return_url);return}const g=await a.rpc("create_company_workspace",{company_name:c});if(g.error){n.loginError=g.error.message||"Account created, but workspace setup failed.",n.authMessage="",u();return}n.activeCompanyId=h(g.data||P()),localStorage.setItem(_e,n.activeCompanyId),n.dataLoaded=!1,n.authMessage="",j(m("settings",{tab:"billing"},n.activeCompanyId),{replace:!0})}async function nl(e){const t=Object.fromEntries(new FormData(e).entries()),a=q(),i=String(t.company_name||"").trim();if(!a||!i){n.loginError="Company workspace name is required.",u();return}const s=await a.rpc("create_company_workspace",{company_name:i});if(s.error){n.loginError=s.error.message||"Workspace setup failed.",u();return}n.activeCompanyId=h(s.data||P()),localStorage.setItem(_e,n.activeCompanyId),n.dataLoaded=!1,j(m("settings",{tab:"billing"},n.activeCompanyId),{replace:!0})}async function sl(e){const t=Object.fromEntries(new FormData(e).entries()),a=q();if(!a?.auth){n.loginError="Supabase auth is unavailable.",u();return}const i=String(t.email||"").trim(),s=String(t.password||""),o=h(t.company_id||"");n.loginError="",n.authMessage="Submitting access request...",u();const l=await a.auth.signInWithPassword({email:i,password:s});if(l.error){n.loginError=l.error.message||"Sign in first to request access.",n.authMessage="",u();return}await at(l.data.session);const c=await a.rpc("request_company_access",{target_company_id:o,request_message:String(t.message||"").trim()||null});if(c.error){n.loginError=c.error.message||"Unable to request access.",n.authMessage="",u();return}n.authMessage="Access request sent. An Owner/Admin must approve it.",n.loginError="",n.authMode="signin",u()}async function rl(){const e=p();n.sync={label:"Opening billing...",mode:"loading"},u();try{const t=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json",...b().access_token?{Authorization:`Bearer ${b().access_token}`}:{}},body:JSON.stringify({company_id:e,return_url:`${window.location.origin}${_(m("settings",{tab:"billing"},e))}`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.url)throw new Error(a.error||"Billing is not configured yet.");window.location.href=a.url}catch(t){n.sync={label:t.message||"Billing unavailable",mode:"local"},u()}}async function ol(e){const t=p(),a=new FormData(e),i=Ne({id:crypto.randomUUID(),company_id:t,name:a.get("name"),color:a.get("color")||"#f0b23b",priority:a.get("priority")||100,is_system:!1,created_by:b().profile.id}),s=a.getAll("permissions").map(l=>String(l||"")).filter(Boolean),o=q();if(n.session?.auth==="supabase"&&o){const l=await o.from("roles").insert(i).select().single();if(l.error){n.sync={label:l.error.message||"Role save failed",mode:"local"},u();return}const c=Ne(l.data),d=s.map(f=>({role_id:c.id,permission_key:f,effect:"allow"}));d.length&&await o.from("role_permissions").insert(d),n.roles.unshift(c),n.rolePermissions=d.concat(n.rolePermissions).map(Oa),n.sync={label:"Role saved",mode:"live"}}else n.roles.unshift(i),n.rolePermissions=s.map(l=>Oa({role_id:i.id,permission_key:l,effect:"allow"})).concat(n.rolePermissions),n.sync={label:"Role saved locally",mode:"local"};n.modal="",u()}async function ll(e){const t=new FormData(e),a=h(t.get("company_id")||p()),i=String(t.get("email")||"").trim().toLowerCase(),s=String(t.get("role_id")||"").trim();if(!i){n.sync={label:"Invite email is required",mode:"local"},u();return}const o=Lt({id:crypto.randomUUID(),company_id:a,email:i,role_id:ut(s)?s:"",token:Dc(),status:"pending",invited_by:b().profile.id,expires_at:new Date(Date.now()+336*60*60*1e3).toISOString(),created_at:new Date().toISOString()}),l=q();if(n.session?.auth==="supabase"&&l){const c={company_id:o.company_id,email:o.email,role_id:o.role_id||null,token:o.token,status:"pending",invited_by:b().profile.id},d=await l.from("company_invites").insert(c).select().single();if(d.error){n.sync={label:d.error.message||"Invite save failed",mode:"local"},u();return}n.companyInvites.unshift(Lt(d.data)),await lt(o.company_id,"invite.created","company_invite",d.data.id,{email:o.email},!0),n.sync={label:"Invite code created. Copy it for the new user.",mode:"live"}}else n.companyInvites.unshift(o),lt(o.company_id,"invite.created","company_invite",o.id,{email:o.email}),n.sync={label:"Invite code created locally",mode:"local"};z("access.invite","Invite code created",`${Q()} created an invite code for ${o.email}.`,m("settings",{tab:"access"},o.company_id),"invite",o.id,o.company_id),n.modal="",u()}async function Pn(e,t=""){const a=q();if(!a){n.loginError="Supabase auth is unavailable.",n.authMessage="",u();return}n.authMessage="Accepting workspace invite...",u();const i=await a.rpc("accept_company_invite",{invite_token:String(e||"").trim()});if(i.error){n.loginError=i.error.message||"Unable to accept invite.",n.authMessage="",u();return}const s=h(i.data||P());n.activeCompanyId=s,localStorage.setItem(_e,s),n.authMessage="",n.loginError="",n.dataLoaded=!1,j(m("jobs",{},s),{replace:!0})}async function cl(e){const t=n.companyInvites.find(a=>a.id===e);if(!t?.token){n.sync={label:"Invite link is unavailable",mode:"local"},u();return}try{await navigator.clipboard.writeText(Cc(t)),n.sync={label:"Invite link copied",mode:"live"}}catch{n.sync={label:"Copy failed",mode:"local"}}u()}async function dl(e){const t=n.companyInvites.find(a=>a.id===e);if(!t?.token){n.sync={label:"Invite code is unavailable",mode:"local"},u();return}try{await navigator.clipboard.writeText(t.token),n.sync={label:"Invite code copied",mode:"live"}}catch{n.sync={label:"Copy failed",mode:"local"}}u()}async function ml(e){const t=n.companyInvites.find(i=>i.id===e);if(!t)return;const a=q();if(n.session?.auth==="supabase"&&a){const i=await a.rpc("revoke_company_invite",{target_invite_id:t.id});if(i.error){n.sync={label:i.error.message||"Invite revoke failed",mode:"local"},u();return}n.sync={label:"Invite revoked",mode:"live"}}else n.sync={label:"Invite revoked locally",mode:"local"};n.companyInvites=n.companyInvites.map(i=>i.id===t.id?Lt({...i,status:"revoked"}):i),lt(t.company_id,"invite.revoked","company_invite",t.id,{email:t.email}),z("access.invite","Invite revoked",`${Q()} revoked the invite for ${t.email}.`,m("settings",{tab:"access"},t.company_id),"invite",t.id,t.company_id),K(),u()}async function ul(e){const t=new FormData(e),a=h(t.get("company_id")||p()),i=String(t.get("profile_id")||"").trim(),s=String(t.get("role_id")||"").trim(),o=["active","pending","disabled","left"].includes(String(t.get("membership_status")))?String(t.get("membership_status")):"active",l=Ge(a,s);if(!i||!l){n.sync={label:"Select a user and role",mode:"local"},u();return}const c=Tc(a,i,l,o);if(c){n.sync={label:c,mode:"local"},u();return}const d=Ut({company_id:a,profile_id:i,role:ci(l),status:o}),f=X(a,i),g=rs({company_id:a,profile_id:i,role_id:l.id,assigned_by:b().profile.id}),A=q();if(n.session?.auth==="supabase"&&A){const V=ut(l.id),O=await A.rpc("update_company_member_access",{target_company_id:a,target_profile_id:i,target_role:d.role,target_role_id:V?l.id:null,target_status:o});if(O.error){n.sync={label:O.error.message||"Access update failed",mode:"local"},u();return}Rt(Ut(O.data||d)),V&&zi(g),n.sync={label:V?"User access saved":"Membership saved; create a role to assign permissions",mode:"live"}}else Rt(d),zi(g),n.sync={label:"User access saved locally",mode:"local"};z("access.role","User access updated",`${Q()} set ${St(i)} to ${l.name} / ${I(o)}.`,m("settings",{tab:"access"},a),"membership",i,a,[i].concat(se(a,["users.manage","settings.manage"]))),lt(a,Dd(f,d),"membership",i,{role:l.name,status:o}),u()}async function Qi(e,t){const a=n.joinRequests.find(l=>l.id===e);if(!a||!["approved","rejected"].includes(t))return;const i=q(),s=os({...a,status:t}),o=Ut({company_id:a.company_id,profile_id:a.profile_id,role:"member",status:t==="approved"?"active":"disabled"});if(n.session?.auth==="supabase"&&i){const l=await i.rpc("review_company_join_request",{target_request_id:a.id,decision:t,target_role_id:null});if(l.error){n.sync={label:l.error.message||"Request update failed",mode:"local"},u();return}t==="approved"&&Rt(o),n.sync={label:t==="approved"?"Access approved":"Request rejected",mode:"live"}}else t==="approved"&&Rt(o),n.sync={label:t==="approved"?"Access approved locally":"Request rejected locally",mode:"local"};n.joinRequests=n.joinRequests.map(l=>l.id===a.id?s:l),lt(a.company_id,t==="approved"?"join.approved":"join.rejected","join_request",a.id,{email:a.requested_email}),z("access.request",t==="approved"?"Access approved":"Access rejected",`${Q()} ${t==="approved"?"approved":"rejected"} ${a.requested_email||"a join request"}.`,m("settings",{tab:"access"},a.company_id),"join_request",a.id,a.company_id,[a.profile_id].concat(se(a.company_id,["users.manage","settings.manage"]))),K(),u()}async function pl(e){const t=p();if(!F("messages.create_group",t)){k("Your role cannot create group chats.","local","Messages");return}const a=new FormData(e),i=["company","role","custom"].includes(a.get("type"))?String(a.get("type")):"custom",s=ue({id:crypto.randomUUID(),company_id:t,title:String(a.get("title")||"").trim()||"New group chat",type:i,created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=Si(a,s,i);!o.some(c=>c.target_type==="profile"&&c.target_id===b().profile.id)&&i!=="company"&&o.push(Y({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id})),await ii(s,o)&&(n.selectedConversationId=s.id,n.modal="",z("message.group","Group chat created",`${Q()} created ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,Qt(s)),j(m("messages",{conversation:s.id},t),{replace:!0}))}async function fl(e){const t=p(),a=new FormData(e),i=String(a.get("profile_id")||"").trim();if(!i){k("Choose a person first.","local","Messages");return}const s=ue({id:crypto.randomUUID(),company_id:t,title:St(i),type:"direct",created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=[Y({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id}),Y({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:i})];if(!await ii(s,o))return;n.selectedConversationId=s.id,n.modal="";const c=String(a.get("body")||"").trim();c&&await Nn(s,c,[]),z("message.direct","Direct message started",`${Q()} started a direct message with ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,[i]),j(m("messages",{conversation:s.id},t),{replace:!0})}async function gl(e){const t=p();if(!F("messages.manage_groups",t)&&!F("messages.manage",t)){k("Your role cannot manage chat access.","local","Messages");return}const a=n.messageConversations.find(f=>f.id===e.dataset.conversationId);if(!a)return;const i=new FormData(e),s=ue({...a,title:String(i.get("title")||"").trim()||a.title,type:Ya.includes(i.get("type"))?String(i.get("type")):a.type,updated_at:new Date().toISOString()}),o=Si(i,s,s.type);s.type!=="company"&&!o.some(f=>f.target_type==="profile"&&f.target_id===b().profile.id)&&o.push(Y({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id}));const l=Qt(a);if(!await ii(s,o,!0))return;const d=Qt(s).filter(f=>!l.includes(f));d.length&&z("message.group","Added to chat",`${Q()} added you to ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,d),n.modal="",k("Chat access saved.",n.session?.auth==="supabase"?"live":"local","Messages"),u()}async function bl(e){const t=n.messageConversations.find(o=>o.id===e.dataset.conversationId);if(!t)return;if(!F("messages.send",t.company_id)){k("Your role cannot send messages.","local","Messages");return}const a=new FormData(e),i=String(a.get("body")||"").trim(),s=Array.from(e.elements.attachments?.files||[]);if(!i&&!s.length){k("Type a message or attach a file.","local","Messages");return}if(s.length&&!F("messages.attach_files",t.company_id)){k("Your role cannot attach files.","local","Messages");return}await Nn(t,i,s),e.reset(),u()}async function _l(e){const t=p(),a=Object.fromEntries(new FormData(e).entries()),i=a.id?ht(String(a.id)):null;if(!i&&!F("calendar.manage",t)){k("Your role cannot create or edit calendar events.","local","Calendar");return}if(i&&!vt(i)){k("This event cannot be edited from Calendar.","local","Calendar");return}const s=String(a.linked_job_id||"").trim(),o=new Date().toISOString();let l=He({...i||{},id:i?.id||crypto.randomUUID(),company_id:t,title:String(a.title||"").trim()||"Calendar event",description:String(a.description||"").trim(),event_type:aa.includes(a.event_type)?String(a.event_type):"Company event",starts_at:Gi(a.starts_at),ends_at:Gi(a.ends_at||a.starts_at),all_day:a.all_day==="on",visibility:a.visibility==="private"?"private":"company",linked_type:s?"job":"",linked_id:s,assigned_profile_id:String(a.assigned_profile_id||""),created_by:i?.created_by||b().profile.id,created_at:i?.created_at||o,updated_at:o});const c=q();if(n.session?.auth==="supabase"&&c){const d=Uc(l);i&&delete d.id;const f=i?await c.from("calendar_events").update({...d,updated_at:o}).eq("id",i.id).select().single():await c.from("calendar_events").insert(d).select().single();if(f.error){k(f.error.message||"Calendar event save failed.","local","Calendar");return}l=He(f.data)}n.calendarEvents=[l].concat(n.calendarEvents.filter(d=>d.id!==l.id)),ms(),z("calendar.event",i?"Calendar event updated":"Calendar event created",`${Q()} ${i?"updated":"created"} ${l.title}.`,m("calendar",{},t),"calendar_event",l.id,t),n.selectedCalendarEventId=`manual:${l.id}`,n.modal="calendar-event-detail",u()}async function yl(e){const t=ht(e);if(!t||!vt(t)){k("This event cannot be deleted from Calendar.","local","Calendar");return}const a=q();if(n.session?.auth==="supabase"&&a){const i=await a.from("calendar_events").delete().eq("id",t.id);if(i.error){k(i.error.message||"Calendar event delete failed.","local","Calendar");return}}n.calendarEvents=n.calendarEvents.filter(i=>i.id!==t.id),ms(),z("calendar.event","Calendar event deleted",`${Q()} deleted ${t.title}.`,m("calendar",{},t.company_id),"calendar_event",t.id,t.company_id),n.selectedCalendarEventId="",n.modal="",u()}async function Nn(e,t,a){const i=new Date().toISOString(),s=ge({id:crypto.randomUUID(),conversation_id:e.id,company_id:e.company_id,sender_profile_id:b().profile.id,body:t,message_type:a.length?"attachment":"text",created_at:i,updated_at:i}),o=q();let l=s;if(n.session?.auth==="supabase"&&o){const f=await o.from("messages").insert(Pc(s)).select().single();if(f.error)return k(f.error.message||"Message send failed.","local","Messages"),null;l=ge(f.data)}n.messages=n.messages.concat(l);const c=await vl(l,a),d={...e,last_message_at:l.created_at,updated_at:l.created_at};return n.messageConversations=n.messageConversations.map(f=>f.id===e.id?d:f),n.session?.auth==="supabase"&&o&&await o.from("message_conversations").update({last_message_at:l.created_at,updated_at:l.created_at}).eq("id",e.id),Sa(e.id,!1),us(d,l,c),Te(),l}async function vl(e,t){const a=q(),i=[];for(const s of t){const o=crypto.randomUUID(),l=`${e.company_id}/${e.conversation_id}/${o}-${jt(s.name||"attachment")}`;let c="",d="";if(n.session?.auth==="supabase"&&a){const g=await a.storage.from("quest-message-attachments").upload(l,s,{cacheControl:"3600",upsert:!1,contentType:s.type||"application/octet-stream"});if(g.error){k(g.error.message||"Attachment upload failed.","local","Messages");continue}d=l}else s.type?.startsWith("image/")&&s.size<=22e4&&(c=await fs(s));const f=je({id:o,conversation_id:e.conversation_id,message_id:e.id,company_id:e.company_id,bucket_id:"quest-message-attachments",object_path:d,file_name:s.name||"attachment",mime_type:s.type||"application/octet-stream",size_bytes:s.size||0,preview_url:c,created_at:new Date().toISOString()});if(n.session?.auth==="supabase"&&a){const g=await a.from("message_attachments").insert(Nc(f)).select().single();if(g.error){k(g.error.message||"Attachment record failed.","local","Messages"),d&&await a.storage.from("quest-message-attachments").remove([d]);continue}i.push(je(g.data))}else i.push(f)}return n.messageAttachments=n.messageAttachments.concat(i),i}async function ii(e,t,a=!1){const i=q();if(n.session?.auth==="supabase"&&i){const s=a?await i.from("message_conversations").update(Ki(e)).eq("id",e.id).select().single():await i.from("message_conversations").insert(Ki(e)).select().single();if(s.error)return k(s.error.message||"Conversation save failed.","local","Messages"),!1;if(await i.from("message_conversation_access").delete().eq("conversation_id",e.id),t.length){const o=await i.from("message_conversation_access").insert(t.map(Rc));if(o.error)return k(o.error.message||"Conversation access save failed.","local","Messages"),!1}e=ue(s.data),n.sync={label:"Quest Supabase live",mode:"live"}}return n.messageConversations=[e].concat(n.messageConversations.filter(s=>s.id!==e.id)),n.messageAccess=t.concat(n.messageAccess.filter(s=>s.conversation_id!==e.id)),Sa(e.id,!1),Te(),!0}async function hl(e){const t=n.messages.find(o=>o.id===e);if(!t)return;if(!(t.sender_profile_id===b().profile.id&&F("messages.delete_own",t.company_id)||F("messages.delete_any",t.company_id))){k("Your role cannot delete this message.","local","Messages");return}const i=new Date().toISOString(),s=q();if(n.session?.auth==="supabase"&&s){const o=await s.from("messages").update({deleted_at:i,updated_at:i}).eq("id",t.id);if(o.error){k(o.error.message||"Message delete failed.","local","Messages");return}}n.messages=n.messages.map(o=>o.id===t.id?{...o,deleted_at:i,updated_at:i}:o),Te(),u()}async function wl(e){const t=n.messageAttachments.find(i=>i.id===e);if(!t)return;if(t.preview_url){window.open(t.preview_url,"_blank","noopener,noreferrer");return}const a=q();if(n.session?.auth==="supabase"&&a&&t.object_path){const i=await a.storage.from(t.bucket_id||"quest-message-attachments").createSignedUrl(t.object_path,900,{download:t.file_name});if(!i.error&&i.data?.signedUrl){window.open(i.data.signedUrl,"_blank","noopener,noreferrer");return}}k("This demo attachment is metadata-only.","local","Messages")}function $l(e){if(e.target.matches("[data-global-search]")){n.query=e.target.value,Oe();return}if(e.target.matches("[data-file-search]")){n.fileQuery=e.target.value,Oe();return}if(e.target.matches("[data-form-search]")){n.formQuery=e.target.value,Oe();return}if(e.target.matches("[data-crm-search]")){n.crmQuery=e.target.value,Oe();return}if(e.target.matches("[data-message-search]")){n.messageQuery=e.target.value,Oe();return}if(e.target.matches("[data-calendar-search]")){n.calendarQuery=e.target.value,Oe();return}if(e.target.matches("[data-message-access-filter]")){ld(e.target);return}if(e.target.matches("[data-form-field]")){ks(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Ds(e.target)}function Sl(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||P();Jl(t);return}if(e.target.matches("[data-stage-filter]")){n.stageFilter=e.target.value||"all",u();return}if(e.target.matches("[data-crm-stage-filter]")){n.crmStageFilter=e.target.value||"all",u();return}if(e.target.matches("[data-crm-owner-filter]")){n.crmOwnerFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-status-filter]")){n.taskStatusFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-priority-filter]")){n.taskPriorityFilter=e.target.value||"all",u();return}if(e.target.matches("[data-calendar-type-filter]")){n.calendarTypeFilter=e.target.value||"all",u();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;j(m("tasks",t?{job_id:t}:{},p()));return}if(e.target.matches("[data-analytics-job-filter]")){const t=e.target.value;j(m("analytics",t?{job_id:t}:{},p()));return}if(e.target.matches("[data-file-category-filter]")){n.fileCategoryFilter=e.target.value||"All categories",u();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=n.route?.jobId||"";j(m("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},p()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;j(m("files",{...t?{folder:"jobs",job_id:t}:{}},p()));return}if(e.target.matches("[data-form-type-filter]")){n.formTypeFilter=e.target.value||"all",u();return}if(e.target.matches("[data-form-field]")){ks(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Ds(e.target)}async function kl(e){const t=Be(Object.fromEntries(new FormData(e).entries()));t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||p(),t.estimate_total=Number(t.estimate_total||0),t.invoice_total=Number(t.invoice_total||0),t.updated_at=new Date().toISOString();const a=n.jobs.some(s=>s.id===t.id),i=q();if(i){const s=a?await i.from("jobs").update(t).eq("id",t.id).select().single():await i.from("jobs").insert(t).select().single();if(!s.error&&s.data){Ma(Be(s.data)),n.sync={label:"Quest Supabase live",mode:"live"},n.modal="",j(m("jobs",{tab:"profile",job_id:s.data.id},t.company_id),{replace:!0});return}n.sync={label:"Saved locally",mode:"local"}}Ma(t),n.modal="",j(m("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function Dl(e){if(!e)return;const t=p(),a=q();a&&await a.from("jobs").delete().eq("id",e),n.jobs=n.jobs.filter(i=>i.id!==e),n.selectedJobId=U(t)[0]?.id||"",n.modal="",K(),j(m("jobs",{tab:"list"},t),{replace:!0})}async function Cl(e){const t=p(),a=Object.fromEntries(new FormData(e).entries()),i=ze({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:b().profile.member_id||qe(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),s=la(i.id),o=!!s,l=q();if(l){const c=Kc(i),d=o?await l.from("tasks").update(c).eq("id",i.id).select().single():await l.from("tasks").insert(c).select().single();if(!d.error&&d.data){const f=ze(d.data);Vi(f),en(f,s),n.sync={label:"Quest Supabase live",mode:"live"},n.modal="",j(m("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},t),{replace:!0});return}n.sync={label:"Task saved locally",mode:"local"}}Vi(i),en(i,s),n.modal="",j(m("tasks",{...i.project_id?{job_id:i.project_id}:{},task_id:i.id},t),{replace:!0})}async function jl(e){if(!e)return;const t=p(),a=q();a&&await a.from("tasks").delete().eq("id",e),n.tasks=n.tasks.filter(i=>i.id!==e),n.selectedTaskId="",n.modal="",K(),j(m("tasks",{},t),{replace:!0})}async function Il(e){const t=p(),a=new FormData(e),i=Object.fromEntries(a.entries()),s=Array.from(e.elements.files?.files||[]),o=String(i.file_name||"").trim(),l=s.length?s:o?[null]:[];if(!l.length){n.sync={label:"Choose a file or enter a file name",mode:"local"},u();return}const c=q();let d=0;for(const f of l){const g=crypto.randomUUID(),A=f?.name||o,V=String(i.folder||"shared"),O=`${t}/${i.job_id?`jobs/${i.job_id}`:V}/${g}-${jt(A)}`;let ae=!1;c&&f&&(ae=!(await c.storage.from("quest-job-files").upload(O,f,{cacheControl:"3600",upsert:!1,contentType:f.type||"application/octet-stream"})).error);const Xe=st({id:g,company_id:t,job_id:i.job_id||"",folder:V,file_name:A,mime_type:f?.type||"application/octet-stream",size_bytes:f?.size||Number(i.size_bytes||0),category:i.category||le(V),notes:i.notes||"",uploaded_by_label:i.uploaded_by_label||b().profile.full_name,bucket_id:"quest-job-files",object_path:ae||!f?O:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(c){const Se=await c.from("job_files").insert(Yc(Xe)).select().single();if(!Se.error&&Se.data){Bi(st(Se.data)),d+=1;continue}ae&&await c.storage.from("quest-job-files").remove([O])}Bi(Xe)}n.sync=d===l.length?{label:"Quest Supabase live",mode:"live"}:{label:d?"Some files saved locally":"File record saved locally",mode:d?"loading":"local"},z("file.added",l.length>1?"Files added":"File added",`${Q()} added ${l.length} file${l.length===1?"":"s"} to ${le(i.folder||"shared")}.`,m("files",{folder:i.folder||"shared",...i.job_id?{job_id:i.job_id}:{}},t),"file",i.job_id||"",t),n.modal="",j(m("files",{folder:i.folder||"shared",...i.job_id?{job_id:i.job_id}:{}},t),{replace:!0})}function ql(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.name||"").trim();if(!a){n.sync={label:"Folder name is required",mode:"local"},u();return}const i=yi({id:`folder-${crypto.randomUUID()}`,company_id:p(),name:a,parent_key:t.parent_key||"home",created_by_label:b().profile.full_name||"Quest HQ",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});n.driveFolders.unshift(i),n.modal="",n.sync={label:"Folder created locally",mode:"local"},z("file.folder","Folder created",`${Q()} created ${i.name}.`,m("files",{folder:i.id},i.company_id),"folder",i.id,i.company_id),K(),u()}function Al(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),i=x(t.job_id),s=String(t.id||"").trim()?Me(String(t.id).trim()):null,o=ya({...t,id:String(t.id||"").trim()||`invoice-${crypto.randomUUID()}`,company_id:a,client_name:String(t.client_name||i?.client_name||"").trim(),total:N(t.subtotal)+N(t.tax),updated_at:new Date().toISOString()});xl(o),s?.job_id&&s.job_id!==o.job_id&&Fa(s.job_id),Fa(o.job_id),n.modal="",n.sync={label:"Finance saved locally",mode:"local"},z("finance.invoice",s?"Invoice updated":"Invoice created",`${Q()} ${s?"updated":"created"} ${o.invoice_number}.`,m("finance",{invoice:o.id},a),"invoice",o.id,a),j(m("finance",{invoice:o.id},a),{replace:!0})}function Ml(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),i=Me(t.invoice_id);if(!i||i.company_id!==a){n.sync={label:"Create an invoice before recording a payment",mode:"local"},u();return}const s=va({...t,id:`payment-${crypto.randomUUID()}`,company_id:a,created_at:new Date().toISOString()});n.financePayments.unshift(s),i.status=oe(i.id)<=0?"Paid":"Partially paid",i.updated_at=new Date().toISOString(),Fa(i.job_id),K(),n.modal="",n.sync={label:"Payment recorded locally",mode:"local"},z("finance.payment","Payment recorded",`${Q()} recorded ${w(s.amount)} for ${i.invoice_number}.`,m("finance",{invoice:s.invoice_id},a),"payment",s.id,a),j(m("finance",s.invoice_id?{invoice:s.invoice_id}:{},a),{replace:!0})}function Fl(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),i=ha({...t,id:String(t.id||"").trim()||`expense-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});Rl(i),n.modal="",n.sync={label:"Expense saved locally",mode:"local"},z("finance.expense","Expense saved",`${Q()} saved a ${w(i.amount)} ${i.category} expense.`,m("finance",{expense:i.id},a),"expense",i.id,a),j(m("finance",{expense:i.id},a),{replace:!0})}function Tl(e){const t=Object.fromEntries(new FormData(e).entries()),a=p(),i=wa({...t,id:String(t.id||"").trim()||`vendor-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});Pl(i),n.modal="",n.sync={label:"Vendor saved locally",mode:"local"},z("finance.vendor","Vendor saved",`${Q()} saved vendor ${i.name}.`,m("finance",{vendor:i.id},a),"vendor",i.id,a),j(m("finance",{vendor:i.id},a),{replace:!0})}async function El(e){const t=n.files.find(s=>s.id===e);if(!t?.object_path){n.sync={label:"No stored object for this file",mode:"local"},u();return}const a=q();if(!a)return;const i=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(i.error||!i.data?.signedUrl){n.sync={label:"Download failed",mode:"local"},u();return}window.open(i.data.signedUrl,"_blank","noopener,noreferrer")}async function Ol(e){const t=n.files.find(i=>i.id===e);if(!t)return;const a=q();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),n.files=n.files.filter(i=>i.id!==e),n.selectedFileId="",n.modal="",K(),u()}function Ma(e){const t=n.jobs.findIndex(a=>a.id===e.id);t>=0?n.jobs[t]=e:n.jobs.unshift(e),n.selectedJobId=e.id,K()}function Vi(e){const t=n.tasks.findIndex(a=>a.id===e.id);t>=0?n.tasks[t]=e:n.tasks.unshift(e),n.selectedTaskId=e.id,K()}function Bi(e){const t=n.files.findIndex(a=>a.id===e.id);t>=0?n.files[t]=e:n.files.unshift(e),K()}function xl(e){const t=n.financeInvoices.findIndex(a=>a.id===e.id);t>=0?n.financeInvoices[t]=e:n.financeInvoices.unshift(e),K()}function Rl(e){const t=n.financeExpenses.findIndex(a=>a.id===e.id);t>=0?n.financeExpenses[t]=e:n.financeExpenses.unshift(e),K()}function Pl(e){const t=n.financeVendors.findIndex(a=>a.id===e.id);t>=0?n.financeVendors[t]=e:n.financeVendors.unshift(e),K()}function Rt(e){const t=n.memberships.findIndex(a=>a.company_id===e.company_id&&a.profile_id===e.profile_id);t>=0?n.memberships[t]=e:n.memberships.unshift(e),K()}function zi(e){n.roleAssignments=n.roleAssignments.filter(t=>t.company_id!==e.company_id||t.profile_id!==e.profile_id),e.role_id&&n.roleAssignments.unshift(e)}function Fa(e){if(!e)return;const t=x(e);t&&(t.invoice_total=re(ve(t.company_id).filter(a=>a.job_id===e),"total"),t.updated_at=new Date().toISOString(),Ma(t))}function Oe(){const e=document.getElementById("workspace");e&&(Un(n.route),e.innerHTML=An(n.route))}function ra(){const e=ni(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/"||e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:p(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const i=a[2]||"jobs";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:i,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:p(),jobId:t.get("job_id")||""}}function Nl(){const e=ni(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||Tt(t.get("job_id")||t.get("project_id"))||localStorage.getItem(_e)||P(),i=Object.fromEntries(Object.entries(Os).map(([l,c])=>[l,m(c,{},a)]));Object.assign(i,{"/index.html":m("jobs",{},a),"/command.html":m("jobs",{},a),"/login.html":"/login"});let s=i[e];if(e==="/jobs"){const l=t.get("tab");l==="tasks"?s=m("tasks",ie(t,["job_id","task_id","new","edit"]),a):l==="files"?s=m("files",ie(t,["job_id","folder"]),a):l==="forms"?s=m("forms",ie(t,["job_id"]),a):l==="analytics"?s=m("analytics",ie(t,["job_id"]),a):s=m("jobs",ie(t,["job_id","tab"]),a)}if(e==="/files"&&(s=m("files",ie(t,["job_id","folder"]),a)),e==="/forms"&&(s=m("forms",ie(t,["job_id"]),a)),e==="/analytics"&&(s=m("analytics",ie(t,["job_id"]),a)),e==="/crm"&&(s=m("crm",ie(t,["account"]),a)),e==="/finance"&&(s=m("finance",ie(t,["invoice","expense","vendor","report"]),a)),e==="/messages"&&(s=m("messages",ie(t,["conversation"]),a)),e==="/calendar"&&(s=m("calendar",{},a)),e==="/admin"&&(s=m("settings",{},a)),e==="/time"&&(s=m("time",{},a)),e==="/team"&&(s=m("team-chart",{},a)),e==="/team-chart"&&(s=m("team-chart",{},a)),e==="/approvals"&&(s=m("approvals",{},a)),e==="/clock"&&(s=m("clock",{},a)),e==="/task-management.html"){const l=t.get("project_id")||t.get("job_id")||"";s=m("tasks",l?{job_id:l}:{},Tt(l)||a)}const o=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(o){const l=decodeURIComponent(o[1]);s=m("tasks",{job_id:l},Tt(l)||a)}s&&window.history.replaceState({},"",_(s))}function Ul(e){if(e.name!=="company")return"";const t=Fe();if(n.session?.auth==="supabase"&&!t.length)return null;if(!t.includes(e.companyId))return n.session?.auth==="supabase"?"":m(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||P());if(!pt.map(s=>s.id).includes(e.section))return m("jobs",{},e.companyId);const i=e.jobId?Tt(e.jobId):"";return i&&i!==e.companyId&&t.includes(i)?m(e.section,Object.fromEntries(e.params.entries()),i):""}function ni(){let e=window.location.pathname||"/";return Pe&&e.startsWith(Pe)&&(e=e.slice(Pe.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function _(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),i=t.startsWith("/")?t:"/"+t;return`${Pe}${i}${a?`?${a}`:""}`||"/"}function j(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(Pe+"/")||Pe===""&&e.startsWith("/")?e:_(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),u()}function Ll(){return`${ni()}${window.location.search}`}function oa(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?_(m("jobs",{},P())):`${t.pathname}${t.search}`}catch{return _(m("jobs",{},P()))}}function m(e="jobs",t={},a=p()){const i=new URLSearchParams(t);for(const[s,o]of[...i.entries()])(o==null||o==="")&&i.delete(s);return`/company/${encodeURIComponent(h(a||P()))}/${e}${i.toString()?`?${i.toString()}`:""}`}function Ql(e){return e.name==="company"?I(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":I(e.name||"Workspace")}function Vl(e,t){const[a]=t.split("?"),i=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!i||e.name!=="company"?!1:e.companyId===decodeURIComponent(i[1])&&e.section===i[2]}function Bl(e){return ln.includes(e)?e:"pipeline"}function zl(e){return{pipeline:"Pipeline",list:"List",profile:"Profile"}[e]||e}function Hl(e){const t=e.companyId||n.activeCompanyId||P(),a=Fe();n.activeCompanyId=a.includes(t)?t:a[0]||P(),localStorage.setItem(_e,n.activeCompanyId)}function Un(e){const t=p();e.jobId&&U(t).some(i=>i.id===e.jobId)&&(n.selectedJobId=e.jobId),(!n.selectedJobId||!U(t).some(i=>i.id===n.selectedJobId))&&(n.selectedJobId=U(t)[0]?.id||"");const a=e.params.get("task_id");a&&ee(t).some(i=>i.id===a)&&(n.selectedTaskId=a),e.section!=="tasks"&&(n.selectedTaskId=""),n.driveFolder=e.params.get("folder")||"home"}function Jl(e){const t=Fe(),a=h(e),i=t.includes(a)?a:t[0]||P();n.activeCompanyId=i,localStorage.setItem(_e,i),Wl();const s=n.route||ra(),o=s.name==="company"?s.section:"jobs";j(m(o,{},i))}function Wl(){n.modal="",n.selectedJobId="",n.selectedTaskId="",n.selectedFileId="",n.selectedFormId="",n.selectedQuestionId="",n.selectedFinanceInvoiceId="",n.selectedFinanceExpenseId="",n.selectedFinanceVendorId="",n.selectedCalendarEventId="",n.query="",n.fileQuery="",n.formQuery="",n.crmQuery="",n.stageFilter="all",n.crmStageFilter="all",n.crmOwnerFilter="all",n.taskStatusFilter="all",n.taskPriorityFilter="all",n.calendarQuery="",n.calendarTypeFilter="all",n.calendarScope="company",n.fileCategoryFilter="All categories",n.formTypeFilter="all",n.formsTab="library",n.driveFolder="home"}function Kl(e){const t=x(e);t&&(n.selectedJobId=e,j(m("jobs",{tab:"profile",job_id:e},t.company_id)))}function Yl(e){const t=la(e);t&&(n.selectedTaskId=e,j(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function Ce(){return x(n.selectedJobId)||U(p())[0]||null}function x(e){return n.jobs.find(t=>t.id===e)||null}function la(e){return n.tasks.find(t=>t.id===e)||null}function U(e=p()){return n.jobs.filter(t=>t.company_id===e)}function ee(e=p()){return n.tasks.filter(t=>t.company_id===e)}function Gl(e=p()){const t=b().profile.id;return n.notifications.filter(a=>a.company_id===e&&a.recipient_profile_id===t).sort((a,i)=>Date.parse(i.created_at||0)-Date.parse(a.created_at||0))}function Ke(e=p()){const t=n.messageQuery.trim().toLowerCase(),a=n.messageFilter||"all";return n.messageConversations.filter(i=>i.company_id===e&&ac(i)).filter(i=>a==="all"||i.type===a||a==="unread"&&si(i.id)>0).filter(i=>{if(!t)return!0;const s=Ye(i.id).some(o=>o.body.toLowerCase().includes(t));return i.title.toLowerCase().includes(t)||s}).sort((i,s)=>Date.parse(s.last_message_at||s.updated_at||s.created_at||0)-Date.parse(i.last_message_at||i.updated_at||i.created_at||0))}function Zl(e=p()){return Ke(e).reduce((t,a)=>t+si(a.id),0)}function Ln(e=p()){const t=Ke(e),i=n.route?.params?.get("conversation")||""||n.selectedConversationId;return t.find(s=>s.id===i)||t[0]||null}function Ye(e){return n.messages.filter(t=>t.conversation_id===e&&!t.deleted_at).sort((t,a)=>Date.parse(t.created_at||0)-Date.parse(a.created_at||0))}function Xl(e){return n.messageAttachments.filter(t=>t.conversation_id===e)}function ec(e){return n.messageAttachments.filter(t=>t.message_id===e)}function ca(e){return n.messageAccess.filter(t=>t.conversation_id===e)}function tc(e,t=b().profile.id){return n.messageReads.find(a=>a.conversation_id===e&&a.profile_id===t)||null}function si(e,t=b().profile.id){const a=Date.parse(tc(e,t)?.last_read_at||0);return Ye(e).filter(i=>i.sender_profile_id!==t&&Date.parse(i.created_at||0)>a).length}function ac(e){if(!e||!F("messages.view",e.company_id))return!1;const t=b().profile,a=ca(e.id);if(e.type==="company"||a.some(o=>o.target_type==="all_company"))return!0;const i=new Set([t.id,t.member_id,t.email].filter(Boolean).map(String));if(a.some(o=>o.target_type==="profile"&&i.has(o.target_id)))return!0;const s=[nt(e.company_id,$t(e.company_id)),...n.roleAssignments.filter(o=>o.company_id===e.company_id&&o.profile_id===t.id).map(o=>o.role_id)];return a.some(o=>o.target_type==="role"&&s.includes(o.target_id))}function da(e=p()){const t=n.calendarEvents.filter(c=>c.company_id===e&&dc(c)).map(sc),a=ee(e).filter(c=>c.due&&c.status!=="done").filter(c=>F("calendar.view_team",e)||Qn(c.assignee_id)||c.creator_id===b().profile.member_id).map(rc),i=F("finance.view",e)?ve(e).filter(c=>c.due_date&&oe(c.id)>0).map(oc):[],s=di(e).filter(c=>c.type!=="Access request"||F("users.manage",e)).map(c=>lc(c,e)),o=wt(e),l=o&&(F("calendar.view_team",e)||ma(o.user_id))?[cc(o)]:[];return t.concat(a,i,s,l).sort((c,d)=>Date.parse(c.startsAt||0)-Date.parse(d.startsAt||0))}function ic(e=p()){const t=n.calendarQuery.trim().toLowerCase();return da(e).filter(a=>n.calendarScope==="company"||a.mine).filter(a=>n.calendarTypeFilter==="all"||a.type===n.calendarTypeFilter).filter(a=>t?[a.title,a.description,a.type,a.owner,a.linkLabel].some(i=>String(i||"").toLowerCase().includes(t)):!0).filter(a=>n.calendarView==="list"||gc(a))}function nc(e=p()){const t=Date.now();return da(e).filter(a=>Date.parse(a.endsAt||a.startsAt||0)>=t).slice(0,9)}function sc(e){const t=e.linked_type==="job"?x(e.linked_id):null;return{id:`manual:${e.id}`,source:"manual",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description,type:e.event_type,startsAt:e.starts_at,endsAt:e.ends_at||e.starts_at,allDay:e.all_day,dateKey:Vn(e.starts_at),owner:pc(e.assigned_profile_id||e.created_by),mine:ma(e.assigned_profile_id)||e.created_by===b().profile.id,href:mc(e),linkLabel:t?.name||"",editable:vt(e)}}function rc(e){const t=e.due_time?`${e.due}T${e.due_time}:00`:`${e.due}T12:00:00`;return{id:`task:${e.id}`,source:"task",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description||Ze(e.type),type:"Task due",startsAt:t,endsAt:t,allDay:!e.due_time,dateKey:e.due,owner:H(e.assignee_id),mine:Qn(e.assignee_id),href:m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),linkLabel:x(e.project_id)?.name||"Company task",editable:!1}}function oc(e){return{id:`invoice:${e.id}`,source:"invoice",sourceId:e.id,companyId:e.company_id,title:`${e.invoice_number} due`,description:`${w(oe(e.id))} outstanding for ${e.client_name||"client"}.`,type:"Invoice due",startsAt:`${e.due_date}T12:00:00`,endsAt:`${e.due_date}T12:00:00`,allDay:!0,dateKey:e.due_date,owner:e.client_name||"Finance",mine:F("finance.view",e.company_id),href:m("finance",{invoice:e.id},e.company_id),linkLabel:e.client_name||"Finance",editable:!1}}function lc(e,t=p()){const a=String(e.updatedAt||v(0)).slice(0,10);return{id:`approval:${e.id}`,source:"approval",sourceId:e.id,companyId:t,title:e.title,description:e.meta,type:"Approval",startsAt:`${a}T12:00:00`,endsAt:`${a}T12:00:00`,allDay:!0,dateKey:a,owner:e.owner,mine:!0,href:e.href,linkLabel:e.status,editable:!1}}function cc(e){const t=Vn(e.started_at);return{id:`timer:${e.id}`,source:"timer",sourceId:e.id,companyId:e.company_id,title:e.task_title||"Active timer",description:"Current clock session.",type:"Time",startsAt:e.started_at,endsAt:new Date().toISOString(),allDay:!1,dateKey:t,owner:H(e.user_id),mine:ma(e.user_id),href:m("time",{},e.company_id),linkLabel:"My time",editable:!1}}function dc(e){return!e||!F("calendar.view",e.company_id)?!1:e.visibility!=="private"?!0:F("calendar.view_team",e.company_id)||vt(e)||ma(e.assigned_profile_id)}function vt(e){return e?F("calendar.manage",e.company_id)||e.created_by===b().profile.id:!1}function mc(e){return e.linked_type==="job"&&e.linked_id&&F("jobs.view",e.company_id)?m("jobs",{tab:"profile",job_id:e.linked_id},e.company_id):e.linked_type==="task"&&e.linked_id&&F("tasks.view",e.company_id)?m("tasks",{task_id:e.linked_id},e.company_id):e.linked_type==="form"&&e.linked_id&&F("forms.view",e.company_id)?m("forms",{form_id:e.linked_id},e.company_id):e.linked_type==="invoice"&&e.linked_id&&F("finance.view",e.company_id)?m("finance",{invoice:e.linked_id},e.company_id):""}function uc(e,t=p()){return da(t).find(a=>a.id===e)||null}function ht(e){return n.calendarEvents.find(t=>t.id===e)||null}function Qn(e){return String(e||"")===String(b().profile.member_id||b().profile.id||"")}function ma(e){const t=b().profile;return[t.id,t.member_id,t.email].filter(Boolean).map(String).includes(String(e||""))}function pc(e){return e?Ae(e)?.full_name||H(e):"Unassigned"}function Vn(e){if(!e)return v(0);const t=new Date(e);return Number.isNaN(t.getTime())?String(e).slice(0,10):t.toISOString().slice(0,10)}function Bn(e,t){return e.filter(a=>a.dateKey===t).sort((a,i)=>Date.parse(a.startsAt||0)-Date.parse(i.startsAt||0))}function fc(e){const t=ri(new Date),a=new Date(t);return a.setDate(t.getDate()+7),e.filter(i=>{const s=Date.parse(i.startsAt||i.dateKey||0);return s>=t.getTime()&&s<a.getTime()})}function gc(e){const t=new Date(`${e.dateKey}T00:00:00`);if(n.calendarView==="month"){const s=new Date(`${n.calendarCursorDate}T00:00:00`);return t.getFullYear()===s.getFullYear()&&t.getMonth()===s.getMonth()}const a=ri(new Date(`${n.calendarCursorDate}T00:00:00`)),i=new Date(a);return i.setDate(a.getDate()+7),t>=a&&t<i}function bc(e){const t=new Date(`${e}T00:00:00`),a=new Date(t.getFullYear(),t.getMonth(),1),i=new Date(a);return i.setDate(a.getDate()-a.getDay()),Array.from({length:42},(s,o)=>{const l=new Date(i);return l.setDate(i.getDate()+o),{key:oi(l),label:String(l.getDate()),month:l.getMonth()}})}function zn(e){const t=ri(new Date(`${e}T00:00:00`));return Array.from({length:7},(a,i)=>{const s=new Date(t);return s.setDate(t.getDate()+i),{key:oi(s),name:new Intl.DateTimeFormat("en-US",{weekday:"short"}).format(s),shortDate:new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(s)}})}function _c(){const e=new Date(`${n.calendarCursorDate}T00:00:00`);if(n.calendarView==="month")return new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(e);if(n.calendarView==="week"){const t=zn(n.calendarCursorDate);return`${T(t[0].key)} - ${T(t[6].key)}`}return"Upcoming"}function ri(e){const t=new Date(e);return t.setHours(0,0,0,0),t.setDate(t.getDate()-t.getDay()),t}function oi(e){const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),i=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${i}`}function Hi(e){const t=new Date(`${n.calendarCursorDate}T00:00:00`);n.calendarView==="month"?t.setMonth(t.getMonth()+e):t.setDate(t.getDate()+e*7),n.calendarCursorDate=oi(t)}function yc(e){return e.reduce((t,a)=>(t[a.dateKey]=t[a.dateKey]||[],t[a.dateKey].push(a),t),{})}function Hn(e){if(e.allDay)return"All day";const t=new Date(e.startsAt);return Number.isNaN(t.getTime())?"Timed":new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(t)}function vc(e){return`calendar-type-${jt(e||"event")}`}function hc(e){return e==="Task due"?"ti-list-check":e==="Invoice due"?"ti-file-dollar":e==="Approval"?"ti-user-check":e==="Time"?"ti-clock":e.includes("Install")?"ti-hammer":e.includes("Estimate")?"ti-calendar-dollar":e.includes("Personal")?"ti-user":"ti-calendar-event"}function Ie(e=p()){return n.files.filter(t=>t.company_id===e)}function it(e=p()){return n.driveFolders.filter(t=>t.company_id===e)}function qe(e=p()){return n.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function te(e=p()){const t=new Map;qe(e).forEach(i=>{t.set(i.id,{profile_id:"",member_id:i.id,name:i.full_name||i.name,email:i.email,avatar_url:i.avatar_url,role:Pt(e,i.id).toLowerCase(),role_label:Pt(e,i.id),role_id:"",status:i.active?"active":"disabled"})}),n.memberships.filter(i=>i.company_id===e).forEach(i=>{const s=Ae(i.profile_id),o=i.member_id?n.teamMembers.find(f=>f.id===i.member_id):null,l=n.roleAssignments.find(f=>f.company_id===e&&f.profile_id===i.profile_id),c=l?Ge(e,l.role_id):null,d=i.profile_id||i.member_id;t.set(d,{profile_id:i.profile_id,member_id:i.member_id,name:s?.full_name||o?.full_name||s?.email||o?.name||d||"User",email:s?.email||o?.email||"",avatar_url:s?.avatar_url||o?.avatar_url||"",role:i.role,role_label:c?.name||I(i.role),role_id:l?.role_id||nt(e,i.role),status:i.status||"active"})});const a=b().profile;if(n.session?.auth==="supabase"&&a?.id&&!t.has(a.id)){const i=X(e,a.id);i&&t.set(a.id,{profile_id:a.id,member_id:a.member_id||"",name:a.full_name||a.email,email:a.email,avatar_url:a.avatar_url,role:i.role,role_label:I(i.role),role_id:nt(e,i.role),status:i.status||"active"})}return[...t.values()].sort((i,s)=>(i.status==="active"?0:1)-(s.status==="active"?0:1)||i.name.localeCompare(s.name))}function wc(e=p()){return n.companyInvites.filter(t=>t.company_id===e&&t.status==="pending").sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function $c(e=p()){return n.auditEvents.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function Sc(e){const t=Ae(e.actor_profile_id),a=t?.full_name||t?.email||Ms(e.actor_profile_id||"system");return`
    <article class="access-audit-row">
      ${de({full_name:a,email:t?.email||""},"avatar small")}
      <span>
        <strong>${r(I(String(e.event_type||"access.event").replace(/[._-]+/g," ")))}</strong>
        <small>${r(a)} / ${T(e.created_at)}</small>
      </span>
    </article>
  `}function ye(e=p()){const t=n.roles.filter(a=>a.company_id===e);return t.length?t.sort((a,i)=>i.priority-a.priority||a.name.localeCompare(i.name)):[Ne({id:`owner-${e}`,company_id:e,name:"Owner",color:"#f0b23b",priority:1e3,is_system:!0}),Ne({id:`admin-${e}`,company_id:e,name:"Admin",color:"#60a5fa",priority:800,is_system:!0}),Ne({id:`staff-${e}`,company_id:e,name:"Staff",color:"#15803d",priority:100,is_system:!0})]}function Ge(e,t){return ye(e).find(a=>a.id===t)||null}function ua(e=p()){return!n.rolePreview||n.rolePreview.company_id!==e?null:Ge(e,n.rolePreview.role_id)}function Ta(e,t){if(!t)return!0;const a=String(e?.name||"").toLowerCase();if(["owner","admin","developer"].includes(a))return!0;const i=li(t),s=n.rolePermissions.filter(c=>c.role_id===e?.id);if(s.some(c=>(i.includes(c.permission_key)||c.permission_key==="*")&&c.effect==="deny"))return!1;if(s.some(c=>(i.includes(c.permission_key)||c.permission_key==="*")&&c.effect==="allow"))return!0;if(s.length)return!1;const o=ci(e),l=Ve[o]||Ve.member;return l.includes("*")||i.some(c=>l.includes(c))}function li(e){return B([e,...Es[e]||[]])}function nt(e,t){const a=String(t||"").toLowerCase();return ye(e).find(i=>i.name.toLowerCase()===a||i.id.toLowerCase()===a)?.id||""}function kc(e=p()){const t=ye(e).filter(a=>a.name.toLowerCase()!=="owner");return t.find(a=>a.name.toLowerCase()==="staff")?.id||t.find(a=>a.name.toLowerCase()==="member")?.id||t[0]?.id||""}function Dc(){const e=new Uint8Array(8);return crypto.getRandomValues(e),`QH-${Array.from(e,t=>t.toString(36).padStart(2,"0")).join("").toUpperCase()}`}function Cc(e){const t=new URL(_("/login"),window.location.origin);return t.searchParams.set("invite",e.token),t.toString()}function ci(e){const t=String(e?.name||"").toLowerCase().replace(/\s+/g,"_");return["owner","member","worker","sales","supervisor","admin","developer","construction_supervisor"].includes(t)?t:"member"}function Ae(e){return n.profiles.find(t=>t.id===e)||(b().profile.id===e?b().profile:null)}function Jn(e=p()){const t=n.query.trim().toLowerCase();return U(e).filter(a=>n.stageFilter!=="all"&&a.stage!==n.stageFilter?!1:t?[a.name,a.client_name,a.contact_name,a.owner_name,a.site_address,a.job_type,E(a.company_id)].some(i=>String(i||"").toLowerCase().includes(t)):!0)}function pa(e=p()){const t=new Map;return U(e).forEach(a=>{const i=String(a.client_name||"").trim()||"Unassigned customer",s=`account-${jt(i.toLowerCase())}`;t.has(s)||t.set(s,{key:s,name:i,jobs:[]}),t.get(s).jobs.push(a)}),Array.from(t.values()).map(a=>{const i=a.jobs.slice().sort((O,ae)=>Date.parse(ae.updated_at||ae.created_at||0)-Date.parse(O.updated_at||O.created_at||0)),s=i[0]||null,o=i.map(O=>O.id),l=ee(e).filter(O=>o.includes(O.project_id)),c=$e(e).filter(O=>o.includes(O.linked_job_id)),d=Ie(e).filter(O=>o.includes(O.job_id)),f=B(i.map(O=>O.contact_name)),g=B(i.map(O=>O.owner_name)),A=B(i.map(O=>O.site_address)),V=i.map(O=>O.priority||"Medium").sort((O,ae)=>Je(ae)-Je(O))[0]||"Medium";return{...a,jobs:i,tasks:l,latestJob:s,contacts:f,owners:g,addresses:A,forms:c,files:d,primaryContact:f[0]||"No contact",owner:g[0]||"Unassigned",stage:s?.stage||"Lead",priority:V,estimateTotal:re(i,"estimate_total"),fileCount:d.length,formCount:c.length,updatedAt:s?.updated_at||s?.created_at||new Date().toISOString(),subtitle:A[0]||`${i.length} linked job${i.length===1?"":"s"}`}}).sort((a,i)=>Date.parse(i.updatedAt||0)-Date.parse(a.updatedAt||0))}function jc(e=p()){const t=n.crmQuery.trim().toLowerCase();return pa(e).filter(a=>n.crmStageFilter!=="all"&&!a.jobs.some(i=>i.stage===n.crmStageFilter)||n.crmOwnerFilter!=="all"&&!a.owners.includes(n.crmOwnerFilter)?!1:t?[a.name,a.primaryContact,a.owner,a.stage,...a.addresses,...a.contacts,...a.jobs.map(i=>i.name)].some(i=>String(i||"").toLowerCase().includes(t)):!0)}function Ic(e,t){return pa(e).find(a=>a.key===t)||null}function qc(e=p()){return B(U(e).map(t=>t.owner_name)).sort((t,a)=>t.localeCompare(a))}function Wn(e=p()){const t=b().profile.member_id||"",a=ee(e).slice().sort(Wi),i=a.filter(mi),s=i.filter(A=>A.due===v(0)),o=i.filter(A=>nn(A.due)<0),l=i.filter(A=>{const V=nn(A.due);return V>=0&&V<=7}),c=i.filter(A=>A.assignee_id===t),d=i.filter(A=>["review","pending"].includes(A.status)),f=a.filter(A=>A.status==="done"),g=B(o.concat(s,c,d,l).map(A=>A.id)).map(A=>a.find(V=>V.id===A)).filter(Boolean).sort(Wi);return{tasks:a,open:i,dueToday:s,overdue:o,thisWeek:l,assignedToMe:c,review:d,done:f,focus:g}}function di(e=p()){const t=$e(e).filter(s=>(s.require_approval||s.type==="Client approval")&&!["Archived","Closed","Approved"].includes(s.status)).map(s=>({id:`form:${s.id}`,title:s.title,meta:x(s.linked_job_id)?.name||s.description||"Company form",type:"Form approval",owner:H(s.creator_id),status:s.status,updatedAt:s.updated_at||s.created_at,href:m("forms",{form_id:s.id},e)})),a=ee(e).filter(s=>["review","pending"].includes(s.status)).map(s=>({id:`task:${s.id}`,title:s.title,meta:x(s.project_id)?.name||s.description||"Company task",type:"Task review",owner:H(s.assignee_id),status:fe(s.status),updatedAt:s.updated_at||s.due,href:m("tasks",{...s.project_id?{job_id:s.project_id}:{},task_id:s.id},e)})),i=n.memberships.filter(s=>s.company_id===e&&s.status!=="active").map(s=>({id:`access:${s.profile_id||s.member_id}`,title:H(s.member_id||s.profile_id),meta:`${I(s.role)} access request`,type:"Access request",owner:"Quest admin",status:I(s.status),updatedAt:new Date().toISOString(),href:m("settings",{tab:"access"},e)}));return t.concat(a,i).sort((s,o)=>Date.parse(o.updatedAt||0)-Date.parse(s.updatedAt||0))}function wt(e=p()){const t=n.activeTimer;return!t||t.company_id!==e?null:t}function Kn(e=p()){return n.timeEntries.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.started_at||0)-Date.parse(t.started_at||0))}function Ji(e=p(),t=0){return Kn(e).filter(a=>Date.parse(a.started_at||0)>=t).reduce((a,i)=>a+N(i.duration_ms),0)}function Ac(e=p(),t=""){n.activeTimer&&Yn(!1);const a=t?la(t):null;n.activeTimer={id:`timer-${crypto.randomUUID()}`,company_id:e,user_id:b().profile.member_id||b().profile.id,task_id:a?.company_id===e?a.id:"",task_title:a?.company_id===e?a.title:"",started_at:new Date().toISOString()},ds(),n.sync={label:"Clock started locally",mode:"local"},u()}function Yn(e=!0){const t=n.activeTimer;if(!t)return;const a=new Date().toISOString(),i=Math.max(0,Date.parse(a)-Date.parse(t.started_at||a));n.timeEntries.unshift({id:`time-${crypto.randomUUID()}`,company_id:t.company_id,user_id:t.user_id,task_id:t.task_id||"",task_title:t.task_title||"",started_at:t.started_at,ended_at:a,duration_ms:i,notes:t.task_title?"Task timer":"General shift"}),n.activeTimer=null,ds(),n.sync={label:"Clock stopped locally",mode:"local"},e&&u()}function mi(e){return e.status!=="done"}function Wi(e,t){const a=Date.parse(e.due||0)-Date.parse(t.due||0);return a||Je(t.priority)-Je(e.priority)}function ve(e=p()){return n.financeInvoices.filter(t=>t.company_id===e).sort(mt("updated_at"))}function Gn(e=p()){return n.financePayments.filter(t=>t.company_id===e)}function ui(e=p()){return n.financeExpenses.filter(t=>t.company_id===e).sort(mt("updated_at"))}function pi(e=p()){return n.financeVendors.filter(t=>t.company_id===e)}function Me(e){return n.financeInvoices.find(t=>t.id===e)||null}function Zn(e){return n.financeExpenses.find(t=>t.id===e)||null}function fi(e){return n.financeVendors.find(t=>t.id===e)||null}function Ea(e){return fi(e)?.name||"No vendor"}function Xn(e){return n.financePayments.filter(t=>t.invoice_id===e).sort(mt("received_at"))}function gi(e){return re(Xn(e),"amount")}function oe(e){const t=Me(e);return Math.max(0,N(t?.total)-gi(e))}function es(e){const t=oe(e.id);return t<=0&&N(e.total)>0?"Paid":t<N(e.total)?"Partially paid":e.status==="Sent"&&qs(e.due_date)>0?"Overdue":e.status}function ts(e=p()){const t=ve(e),a=Gn(e),i=ui(e).filter(c=>["Approved","Paid"].includes(c.status)),s={current:0,thirty:0,sixty:0,overSixty:0};t.forEach(c=>{const d=oe(c.id);if(!d)return;const f=qs(c.due_date);f<=0?s.current+=d:f<=30?s.thirty+=d:f<=60?s.sixty+=d:s.overSixty+=d});const o=re(a,"amount"),l=re(i,"amount");return{pipeline:re(U(e),"estimate_total"),invoiced:re(t,"total"),collected:o,outstanding:t.reduce((c,d)=>c+oe(d.id),0),expenses:l,net:o-l,aging:s}}function Mc(e=p(),t=""){const a=n.query.trim().toLowerCase();return ee(e).filter(i=>t&&i.project_id!==t||n.taskStatusFilter!=="all"&&i.status!==n.taskStatusFilter||n.taskPriorityFilter!=="all"&&i.priority!==n.taskPriorityFilter?!1:a?[i.title,i.description,Ze(i.type),H(i.assignee_id),x(i.project_id)?.name].some(s=>String(s||"").toLowerCase().includes(a)):!0)}function as(){const e=Fe();return n.companies.filter(t=>e.includes(t.id))}function F(e,t=p()){if(!e)return!0;const a=ua(t);if(a)return Ta(a,e);const i=li(e),s=b().profile;if(n.session?.auth==="supabase"){const c=X(t,s.id);if(!c||c.status!=="active")return!1;if(["owner","developer"].includes(String(c.role).toLowerCase()))return!0;const d=n.roleAssignments.filter(g=>g.company_id===t&&g.profile_id===s.id).map(g=>g.role_id),f=n.rolePermissions.filter(g=>d.includes(g.role_id));if(f.some(g=>(i.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="deny"))return!1;if(f.some(g=>(i.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="allow"))return!0}const o=String(X(t,s.id)?.role||s.role||"member").toLowerCase(),l=Ve[o]||Ve.member;return l.includes("*")||i.some(c=>l.includes(c))}function Fe(){const e=b().profile,t=n.companies.map(s=>s.id);if(n.session?.auth==="supabase"){const s=n.memberships.filter(o=>o.profile_id===e.id&&o.status==="active").map(o=>h(o.company_id));return B(s).filter(o=>t.includes(o))}if(["developer","admin"].includes(e.role))return B(t.length?t:yt.map(s=>h(s.id)));const a=n.memberships.filter(s=>s.profile_id===e.id&&s.status==="active").map(s=>h(s.company_id)),i=a.length?a:e.company_ids||[];return B(i.map(h)).filter(s=>t.includes(s))}function p(){const e=Fe();return e.includes(n.activeCompanyId)?n.activeCompanyId:e[0]||n.activeCompanyId||P()}function P(){return h(yt[0].id)}function fa(e){const t=h(e);return n.companies.find(a=>a.id===t)||yt.map(kt).find(a=>a.id===t)||null}function E(e){const t=fa(e);return t?ga(t):e||"Company"}function ga(e){return e.short_name||e.label||e.name||e.id}function he(e){return fa(e)?.color||"#f0b23b"}function Tt(e){return h(n.jobs.find(t=>t.id===e)?.company_id||"")}function $t(e){const t=ua(e);if(t)return`Preview: ${t.name}`;const a=b().profile;return n.session?.auth!=="supabase"&&["developer","admin"].includes(a.role)?I(a.role):I(X(e,a.id)?.role||a.role||"member")}function Pt(e,t){const a=n.memberships.find(i=>i.company_id===e&&(i.member_id===t||i.profile_id===t));return I(a?.role||"member")}function X(e,t){return n.memberships.find(a=>a.company_id===e&&a.profile_id===t)||null}function Fc(e=p()){return n.memberships.filter(t=>t.company_id===e&&t.role==="owner"&&t.status==="active")}function is(e,t){const a=Fc(e);return a.length===1&&a[0].profile_id===t}function Tc(e,t,a,i){const s=X(e,t),o=ci(a);if(s?.role==="owner"&&s.status==="active"&&(o!=="owner"||i!=="active")&&is(e,t))return"Promote another active Owner before changing the last Owner.";const l=X(e,b().profile.id),c=String(b().profile.role||"").toLowerCase();return(["owner","developer"].includes(s?.role)||["owner","developer"].includes(o))&&!["owner","developer"].includes(String(l?.role||c).toLowerCase())?"Only an Owner can change Owner or Developer access.":""}function bi(e=p()){return n.subscriptions.find(t=>t.company_id===e)||null}function _i(e=p()){if(n.session?.auth!=="supabase")return!0;const t=bi(e);return!!(!t||["trialing","active","past_due","grace"].includes(t.status)||t.grace_ends_at&&Date.parse(t.grace_ends_at)>Date.now())}function ns(e=p()){const t=bi(e);return t?t.status==="trialing"?`Trial - ${T(t.trial_ends_at)}`:t.status==="active"?"Active subscription":t.status==="past_due"?"Past due grace":t.status==="grace"?`Grace - ${T(t.grace_ends_at)}`:I(t.status):n.session?.auth==="supabase"?"Trial pending":"Demo mode"}function H(e){const t=n.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function St(e){const t=Ae(e);return t?.full_name||t?.email||H(e)}function ba(e){return n.tasks.filter(t=>t.project_id===e).length}function Nt(e){return n.files.filter(t=>t.job_id===e).length}function h(e){return{"quest-roofing":"roofing","quest-drafting":"drafting"}[String(e||"").trim()]||String(e||"").trim()}function ss(e){const t=new Map;return e.map(kt).forEach(a=>{!a.id||t.has(a.id)||t.set(a.id,a)}),Array.from(t.values())}function kt(e){return{id:h(e.id||""),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function Be(e){return{id:String(e.id||""),company_id:h(e.company_id||P()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:ft.includes(e.stage)?e.stage:"Lead",priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:N(e.estimate_total),invoice_total:N(e.invoice_total),task_count:N(e.task_count),file_count:N(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function ze(e){const t=Ot.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=gt.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:cn.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:h(e.company_id||P()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||v(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:Ot.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function st(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:h(e.company_id||P()),job_id:String(e.job_id||""),folder:String(e.folder||Gd(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:N(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function yi(e){return{id:String(e.id||`folder-${crypto.randomUUID()}`),company_id:h(e.company_id||P()),name:String(e.name||"New folder").trim()||"New folder",parent_key:String(e.parent_key||"home"),created_by_label:String(e.created_by_label||"Quest HQ"),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Dt(e){const t=Array.isArray(e.questions)?e.questions.map(_a):[],a=bt.includes(e.type)?e.type:"Internal",i=Ka.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:h(e.company_id||P()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:i,audience:String(e.audience||"Internal").trim(),creator_id:String(e.creator_id||e.created_by||e.created_by_id||""),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function _a(e){const t=_t.some(([i])=>i===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(i=>String(i||"").trim()).filter(Boolean):[]};return dt(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function vi(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:h(e.company_id||P()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function ya(e){const t=N(e.subtotal),a=N(e.tax),i=N(e.total)||t+a;return{id:String(e.id||`invoice-${crypto.randomUUID()}`),company_id:h(e.company_id||P()),job_id:String(e.job_id||""),client_name:String(e.client_name||"").trim(),invoice_number:String(e.invoice_number||`INV-${Date.now()}`).trim(),status:dn.includes(e.status)?e.status:"Draft",issue_date:String(e.issue_date||v(0)).slice(0,10),due_date:String(e.due_date||v(30)).slice(0,10),subtotal:t,tax:a,total:i,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function va(e){return{id:String(e.id||`payment-${crypto.randomUUID()}`),company_id:h(e.company_id||P()),invoice_id:String(e.invoice_id||""),amount:N(e.amount),method:pn.includes(e.method)?e.method:"ACH",received_at:String(e.received_at||v(0)).slice(0,10),reference:String(e.reference||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString()}}function ha(e){return{id:String(e.id||`expense-${crypto.randomUUID()}`),company_id:h(e.company_id||P()),job_id:String(e.job_id||""),vendor_id:String(e.vendor_id||""),category:ia.includes(e.category)?e.category:"Other",amount:N(e.amount),status:mn.includes(e.status)?e.status:"Pending",spent_at:String(e.spent_at||v(0)).slice(0,10),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function wa(e){return{id:String(e.id||`vendor-${crypto.randomUUID()}`),company_id:h(e.company_id||P()),name:String(e.name||"New vendor").trim()||"New vendor",contact_name:String(e.contact_name||"").trim(),email:String(e.email||"").trim(),phone:String(e.phone||"").trim(),category:ia.includes(e.category)?e.category:"Other",status:un.includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function hi(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,supervisor_id:String(e.supervisor_id||e.manager_id||""),company_ids:Array.isArray(e.company_ids)?B(e.company_ids.map(h)):[]}}function Ut(e){const t=["active","pending","disabled","left"].includes(String(e.status))?String(e.status):"active";return{company_id:h(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:t,disabled_at:e.disabled_at||"",disabled_by:String(e.disabled_by||""),left_at:e.left_at||"",last_active_at:e.last_active_at||""}}function Ec(e){return{company_id:h(e.company_id||""),status:String(e.status||"trialing"),plan_code:String(e.plan_code||"quest_company_300"),amount_cents:N(e.amount_cents||3e4),currency:String(e.currency||"usd"),stripe_customer_id:String(e.stripe_customer_id||""),stripe_subscription_id:String(e.stripe_subscription_id||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||""}}function Ne(e){return{id:String(e.id||""),company_id:h(e.company_id||""),name:String(e.name||"Role").trim()||"Role",color:String(e.color||"#f0b23b"),priority:N(e.priority),is_system:e.is_system===!0,created_by:String(e.created_by||"")}}function Oa(e){return{role_id:String(e.role_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function rs(e){return{company_id:h(e.company_id||""),profile_id:String(e.profile_id||""),role_id:String(e.role_id||""),assigned_by:String(e.assigned_by||"")}}function Oc(e){return{id:String(e.id||""),company_id:h(e.company_id||""),resource_type:String(e.resource_type||""),resource_id:String(e.resource_id||""),principal_type:String(e.principal_type||""),principal_id:String(e.principal_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function xc(e){return{id:String(e.id||""),company_id:h(e.company_id||""),resource_type:String(e.resource_type||""),field_key:String(e.field_key||""),role_id:String(e.role_id||""),visibility:["visible","masked","hidden"].includes(e.visibility)?e.visibility:"visible",editable:e.editable!==!1}}function Lt(e){return{id:String(e.id||""),company_id:h(e.company_id||""),email:String(e.email||""),role_id:String(e.role_id||""),token:String(e.token||""),status:String(e.status||"pending"),expires_at:e.expires_at||"",invited_by:String(e.invited_by||""),accepted_by:String(e.accepted_by||""),created_at:e.created_at||""}}function os(e){return{id:String(e.id||""),company_id:h(e.company_id||""),profile_id:String(e.profile_id||""),requested_email:String(e.requested_email||""),status:String(e.status||"pending"),message:String(e.message||""),reviewed_by:String(e.reviewed_by||""),created_at:e.created_at||""}}function ue(e){return{id:String(e.id||""),company_id:h(e.company_id||""),title:String(e.title||"Messages").trim()||"Messages",type:Ya.includes(e.type)?e.type:"custom",created_by:String(e.created_by||""),last_message_at:e.last_message_at||e.updated_at||e.created_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Y(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:h(e.company_id||""),target_type:["all_company","role","profile"].includes(e.target_type)?e.target_type:"profile",target_id:String(e.target_id||""),created_at:e.created_at||""}}function ge(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:h(e.company_id||""),sender_profile_id:String(e.sender_profile_id||e.created_by||""),body:String(e.body||""),message_type:String(e.message_type||"text"),deleted_at:e.deleted_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function je(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),message_id:String(e.message_id||""),company_id:h(e.company_id||""),bucket_id:String(e.bucket_id||"quest-message-attachments"),object_path:String(e.object_path||""),file_name:String(e.file_name||"attachment"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:N(e.size_bytes),preview_url:String(e.preview_url||""),created_at:e.created_at||new Date().toISOString()}}function Ct(e){return{conversation_id:String(e.conversation_id||""),company_id:h(e.company_id||""),profile_id:String(e.profile_id||""),last_read_at:e.last_read_at||"",updated_at:e.updated_at||e.last_read_at||""}}function He(e){const t=e.starts_at||new Date().toISOString(),a=aa.includes(e.event_type)?e.event_type:"Company event",i=["company","private"].includes(e.visibility)?e.visibility:"company",s=["","job","task","form","invoice"].includes(e.linked_type)?e.linked_type:"";return{id:String(e.id||`calendar-${crypto.randomUUID()}`),company_id:h(e.company_id||P()),title:String(e.title||"Calendar event").trim()||"Calendar event",description:String(e.description||"").trim(),event_type:a,starts_at:t,ends_at:e.ends_at||t,all_day:e.all_day===!0||e.all_day==="true"||e.all_day==="on",visibility:i,linked_type:s,linked_id:String(e.linked_id||""),assigned_profile_id:String(e.assigned_profile_id||""),created_by:String(e.created_by||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ki(e){return{id:e.id,company_id:e.company_id,title:e.title,type:e.type,created_by:e.created_by||b().profile.id,last_message_at:e.last_message_at||null}}function Rc(e){return{conversation_id:e.conversation_id,company_id:e.company_id,target_type:e.target_type,target_id:e.target_id}}function Pc(e){return{id:e.id,conversation_id:e.conversation_id,company_id:e.company_id,sender_profile_id:e.sender_profile_id,body:e.body,message_type:e.message_type,deleted_at:e.deleted_at||null}}function Nc(e){return{id:e.id,conversation_id:e.conversation_id,message_id:e.message_id,company_id:e.company_id,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes}}function Uc(e){return{id:ut(e.id)?e.id:void 0,company_id:e.company_id,title:e.title,description:e.description,event_type:e.event_type,starts_at:e.starts_at,ends_at:e.ends_at||e.starts_at,all_day:e.all_day,visibility:e.visibility,linked_type:e.linked_type||"",linked_id:e.linked_id||"",assigned_profile_id:e.assigned_profile_id||"",created_by:ut(e.created_by)?e.created_by:b().profile.id}}function Lc(e){return{conversation_id:e.conversation_id,company_id:e.company_id,profile_id:e.profile_id,last_read_at:e.last_read_at||new Date().toISOString()}}function Qc(e=p()){return Be({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function Vc(e=p(),t=""){return ze({id:"",title:"",company_id:e,project_id:t,assignee_id:qe(e)[0]?.id||"abraham",creator_id:b().profile.member_id||"abraham",due:v(1),priority:"medium",status:"todo",type:"admin"})}function Bc(e=p()){const t=Ce();return ya({id:"",company_id:e,job_id:t?.company_id===e?t.id:"",client_name:t?.company_id===e?t.client_name:"",invoice_number:Xd(e),status:"Draft",issue_date:v(0),due_date:v(30),subtotal:t?.company_id===e?t.estimate_total:0,tax:0,notes:""})}function zc(e=p(),t=""){const a=t?Me(t):ve(e).find(s=>oe(s.id)>0),i=a?.company_id===e?a:null;return va({id:"",company_id:e,invoice_id:i?.id||"",amount:i?oe(i.id):0,method:"ACH",received_at:v(0),reference:"",notes:""})}function Hc(e=p(),t=""){return ha({id:"",company_id:e,job_id:Ce()?.company_id===e?Ce().id:"",vendor_id:t||pi(e)[0]?.id||"",category:"Materials",status:"Pending",amount:0,spent_at:v(0),notes:""})}function Jc(e=p()){return wa({id:"",company_id:e,name:"",category:"Materials",status:"Active"})}function Wc(e=p()){const t=new Date;t.setHours(t.getHours()+1,0,0,0);const a=new Date(t);return a.setHours(t.getHours()+1),He({id:"",company_id:e,title:"",description:"",event_type:"Company event",starts_at:t.toISOString(),ends_at:a.toISOString(),all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:b().profile.member_id||b().profile.id,created_by:b().profile.id})}function Kc(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function Yc(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function b(){return n.session?n.session.auth==="supabase"?n.session:{...n.session,profile:{...xa().profile,...n.session.profile||{},...n.profileDraft||{}}}:xa()}function Gc(e,t){const a=!!(e.user.email_confirmed_at||e.user.confirmed_at);return{auth:"supabase",access_token:e.access_token,refresh_token:e.refresh_token,user:{id:e.user.id,email:e.user.email||"",email_confirmed_at:e.user.email_confirmed_at||e.user.confirmed_at||"",email_verified:a},profile:rt(t||{},{id:e.user.id,email:e.user.email||"",full_name:e.user.user_metadata?.full_name||e.user.email||"Quest user",role:"member",member_id:"",company_ids:[],avatar_url:"",email_verified:a})}}function xa(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",email_verified:!0,...n.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:Le.localUsername,email:e.email},profile:e}}function rt(e,t={}){const a=String(e.role||t.role||"member").toLowerCase(),i=typeof e.email_verified=="boolean"?e.email_verified:t.email_verified===!0;return{id:String(e.id||t.id||""),email:String(e.email||t.email||""),full_name:String(e.full_name||t.full_name||e.email||t.email||"Quest user"),role:a,role_label:I(a),member_id:String(e.member_id||t.member_id||""),company_ids:Array.isArray(e.company_ids)?B(e.company_ids.map(h)):t.company_ids||[],avatar_url:String(e.avatar_url||t.avatar_url||""),approved:e.approved!==!1,email_verified:i,supervisor_id:String(e.supervisor_id||t.supervisor_id||"")}}function ot(e){const t=Zc(e.html||e.meta||""),a=e.read_at||(e.read===!0?e.created_at||new Date().toISOString():"");return{id:String(e.id||`notification-${crypto.randomUUID()}`),company_id:h(e.company_id||""),recipient_profile_id:String(e.recipient_profile_id||e.profile_id||e.member_id||"basic-quest-user"),type:String(e.type||(e.task_id?"task.notification":"general")),title:String(e.title||e.meta||"Notification"),body:String(e.body||t||""),href:String(e.href||""),source_type:String(e.source_type||(e.task_id?"task":"")),source_id:String(e.source_id||e.task_id||""),read_at:String(a||""),created_at:String(e.created_at||new Date().toISOString())}}function Zc(e){return String(e||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}function Xc(e=b()){return e.auth!=="supabase"?!0:e.user?.email_verified===!0||!!e.user?.email_confirmed_at||e.profile?.email_verified===!0}function J(e,t,a=""){const i=In();return`
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${G(i)}</span>
        <div>
          <div class="context-line"><span>${r(E(p()))}</span><b>${r($t(p()))}</b></div>
          <h1>${r(e)}</h1>
          <p>${r(t)}</p>
        </div>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function ed(e){return`<section class="metric-grid">${e.map(([t,a])=>`<article class="metric">${G(qn(t),"metric-symbol")}<span>${r(t)}</span><strong>${r(a)}</strong></article>`).join("")}</section>`}function td(e){return`
    <button class="queue-row" type="button" data-select-job="${r(e.id)}">
      <span><strong>${r(e.name)}</strong><small>${r(e.client_name||E(e.company_id))}</small></span>
      ${wi(e.priority)}
      <b>${r(e.stage)}</b>
    </button>
  `}function $a(e){return`
    <button class="queue-row" type="button" data-select-task="${r(e.id)}">
      <span><strong>${r(e.title)}</strong><small>${r(x(e.project_id)?.name||E(e.company_id))}</small></span>
      ${ls(e.priority)}
      <b>${r(fe(e.status))}</b>
    </button>
  `}function ad(e){return`
    <button class="job-card priority-${r(e.priority.toLowerCase())} ${e.id===n.selectedJobId?"active":""}" type="button" data-select-job="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.client_name||"No client")}</span>
      <small>${r(E(e.company_id))} - ${r(e.owner_name||"Unassigned")}</small>
      <em>${r(ba(e.id))} tasks</em>
    </button>
  `}function qt(e,t,a,i){return`
    <a class="mini-link" href="${_(e)}" data-router>
      <i class="ti ${r(t)}"></i>
      <span><strong>${r(a)}</strong><small>${r(i)}</small></span>
    </a>
  `}function L(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${r(t)}</span><strong>${r(a)}</strong></div>`).join("")}</div>`}function C(e,t,a="",i=!1,s="text",o=""){return`<label class="${r(o)}"><span>${r(e)}</span><input name="${r(t)}" type="${r(s)}" value="${r(a)}" ${i?"required":""} /></label>`}function be(e,t,a="",i=""){return`<label class="${r(i)}"><span>${r(e)}</span><textarea name="${r(t)}" rows="4">${r(a)}</textarea></label>`}function R(e,t,a,i){return`
    <label><span>${r(e)}</span><select name="${r(t)}">
      ${i.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function wi(e){return`<span class="priority ${r(String(e).toLowerCase())}">${r(e)}</span>`}function ls(e){return`<span class="priority ${r(e)}">${r(I(e))}</span>`}function cs(e){return`<span class="status-pill ${r(e)}">${r(fe(e))}</span>`}function id(e){return`<span class="finance-status ${r(jt(e))}">${r(e)}</span>`}function de(e,t){if(e.avatar_url)return`<span class="${r(t)}"><img src="${r(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(i=>i[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${r(t)}">${r(a)}</span>`}function nd(e=p()){const t=te(e).filter(a=>a.status==="active").map(a=>[a.profile_id||a.member_id,a.name||a.email||a.member_id]);return[["","Unassigned"]].concat(t)}function Yi(e){const t=new Date(e||Date.now());if(Number.isNaN(t.getTime()))return"";const a=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),o=String(t.getHours()).padStart(2,"0"),l=String(t.getMinutes()).padStart(2,"0");return`${a}-${i}-${s}T${o}:${l}`}function Gi(e){const t=new Date(e||Date.now());return Number.isNaN(t.getTime())?new Date().toISOString():t.toISOString()}function y(e){return`<div class="empty-state">${G("q-empty","empty-symbol")}<span>${r(e)}</span></div>`}function ie(e,t){const a={};return t.forEach(i=>{const s=e.get(i);s&&(a[i]=s)}),a}function K(){n.session?.auth!=="supabase"&&($(Pa,n.jobs),$(Na,n.tasks),$(Ua,n.files),$(La,n.driveFolders),$(We,n.forms),$(Ht,n.formResponses),$(Ba,n.financeInvoices),$(za,n.financePayments),$(Ha,n.financeExpenses),$(Ja,n.financeVendors),$(Jt,n.timeEntries),$(Wt,n.activeTimer),$(Qa,n.teamMembers),$(Va,n.memberships),$(Kt,n.notifications),$(Yt,n.messageConversations),$(Gt,n.messageAccess),$(Zt,n.messages),$(Xt,n.messageReads),$(ea,n.messageAttachments),$(ta,n.calendarEvents))}function ds(){n.session?.auth!=="supabase"&&($(Jt,n.timeEntries),$(Wt,n.activeTimer))}function $i(){n.session?.auth!=="supabase"&&$(Kt,n.notifications)}function ms(){n.session?.auth!=="supabase"&&$(ta,n.calendarEvents)}function Te(){n.session?.auth!=="supabase"&&($(Yt,n.messageConversations),$(Gt,n.messageAccess),$(Zt,n.messages),$(Xt,n.messageReads),$(ea,n.messageAttachments))}function Si(e,t,a){if(a==="company")return[Y({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"all_company",target_id:"all"})];const i=[];return e.getAll("role_ids").forEach(s=>{s&&i.push(Y({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"role",target_id:s}))}),e.getAll("profile_ids").forEach(s=>{s&&i.push(Y({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:s}))}),i.length?i:[Y({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:b().profile.id})]}function Sa(e,t=!0){if(!e)return;const a=n.messageConversations.find(l=>l.id===e);if(!a)return;const i=new Date().toISOString(),s=b().profile.id,o=Ct({conversation_id:e,company_id:a.company_id,profile_id:s,last_read_at:i});if(n.messageReads=[o].concat(n.messageReads.filter(l=>l.conversation_id!==e||l.profile_id!==s)),Te(),t&&n.session?.auth==="supabase"){const l=q();l&&l.from("message_reads").upsert(Lc(o),{onConflict:"conversation_id,profile_id"})}}function us(e,t,a=[]){const i=m("messages",{conversation:e.id},e.company_id),s=St(t.sender_profile_id),o=Qt(e).filter(c=>c!==me(e.company_id,t.sender_profile_id)),l=sd(t.body,e.company_id).filter(c=>c!==me(e.company_id,t.sender_profile_id));e.type==="direct"&&z("message.direct","New direct message",`${s} sent a direct message in ${e.title}.`,i,"message",t.id,e.company_id,o),l.forEach(c=>{Re({company_id:e.company_id,recipients:[c],type:"message.mention",title:"Mentioned in chat",body:`${s} mentioned you in ${e.title}.`,href:i,sourceType:"message",sourceId:t.id}).catch(d=>console.warn("Message mention notification failed",d))}),a.length&&z("message.attachment","Attachment shared",`${s} shared ${a.length} attachment${a.length===1?"":"s"} in ${e.title}.`,i,"message",t.id,e.company_id,o)}function sd(e="",t=p()){const a=String(e||"").toLowerCase();return a.includes("@")?te(t).filter(i=>a.includes(`@${String(i.name||"").split(/\s+/)[0].toLowerCase()}`)||a.includes(`@${String(i.name||"").toLowerCase()}`)).map(i=>me(t,i.profile_id||i.member_id)).filter(Boolean):[]}function rd(e){const t=Ae(e);if(t)return t;const a=n.teamMembers.find(i=>i.id===e);return{id:e,full_name:a?.full_name||a?.name||e||"Quest user",email:a?.email||"",avatar_url:a?.avatar_url||""}}function xe(e){const t=String(e?.name||"").trim();if(t&&!zt(t))return t;const a=String(e?.email||"").trim();return a?a.split("@")[0]||a:"Workspace user"}function od(e){return B([e?.email,e?.role_label||I(e?.role||""),I(e?.status||"")]).join(" / ")||"Company member"}function Zi(e){return{id:e?.profile_id||e?.member_id||"",full_name:xe(e),email:e?.email||"",avatar_url:e?.avatar_url||""}}function ld(e){const t=String(e.value||"").trim().toLowerCase(),a=e.closest(".message-modal-form"),i=Array.from(a?.querySelectorAll("[data-message-person-row]")||[]);let s=0;i.forEach(l=>{const c=l.querySelector('input[type="checkbox"]')?.checked,d=!t||String(l.dataset.filterText||"").includes(t),f=c||d;l.hidden=!f,f&&(s+=1)});const o=a?.querySelector("[data-message-filter-count]");o&&(o.textContent=t?`${s} match${s===1?"":"es"}`:`${i.length} member${i.length===1?"":"s"}`)}function ps(e){return{company:"q-symbol-company-chat",role:"q-symbol-role-chat",custom:"q-symbol-messages",direct:"q-symbol-direct-chat"}[e]||"q-symbol-messages"}function ki(e){const t=ca(e.id);if(e.type==="company"||t.some(s=>s.target_type==="all_company"))return"Everyone in this company";const a=t.filter(s=>s.target_type==="role").map(s=>Ge(e.company_id,s.target_id)?.name||"Role"),i=t.filter(s=>s.target_type==="profile").map(s=>St(s.target_id));return a.concat(i).slice(0,5).join(", ")||"Private chat"}function cd(e){return r(e).replace(/(^|\s)@([\w.-]+)/g,"$1<strong>@$2</strong>")}function dd(e){const t=Number(e||0);return t>=1024*1024?`${(t/1024/1024).toFixed(1)} MB`:t>=1024?`${Math.round(t/1024)} KB`:`${t} B`}function fs(e){return new Promise(t=>{const a=new FileReader;a.onload=()=>t(String(a.result||"")),a.onerror=()=>t(""),a.readAsDataURL(e)})}function md(e,t){const a=q();if(n.session?.auth!=="supabase"||!a?.channel||!t)return;const i=`${e}:${t}`;n.messageRealtimeKey!==i&&(n.messageRealtimeChannel&&a.removeChannel(n.messageRealtimeChannel),n.messageRealtimeKey=i,n.messageRealtimeChannel=a.channel(`quest-messages-${t}`).on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:`conversation_id=eq.${t}`},()=>{n.dataLoaded=!1,u()}).on("postgres_changes",{event:"*",schema:"public",table:"message_attachments",filter:`conversation_id=eq.${t}`},()=>{n.dataLoaded=!1,u()}).subscribe())}function ud(e){const t=[()=>Et(e,"Crew weather delay","role","Manager posted a weather delay update.",!0),()=>Et(e,"Permit questions","custom","A permit packet PDF was shared.",!1,!0),()=>Et(e,"Shan Kumar","direct","Can you jump on this when you are back?",!0),()=>pd(e,"@Joshua you were mentioned in the launch room.")],a=Math.floor(Math.random()*t.length);t[a]()}function Et(e,t,a,i,s=!1,o=!1){const l=new Date().toISOString(),c=ue({id:`msg-conv-${crypto.randomUUID()}`,company_id:e,title:t,type:a,created_by:"basic-quest-user",last_message_at:l,created_at:l,updated_at:l}),d=a==="direct"?[Y({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:c.id,target_type:"profile",target_id:"basic-quest-user"}),Y({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:c.id,target_type:"profile",target_id:"shan"})]:Si(new FormData,c,a==="role"?"role":"company");n.messageConversations.unshift(c),n.messageAccess=d.concat(n.messageAccess);const f=ge({id:`msg-${crypto.randomUUID()}`,conversation_id:c.id,company_id:e,sender_profile_id:s?"shan":"basic-quest-user",body:i,created_at:l,updated_at:l,message_type:o?"attachment":"text"});n.messages.push(f),o&&n.messageAttachments.push(je({id:`msg-attachment-${crypto.randomUUID()}`,conversation_id:c.id,message_id:f.id,company_id:e,file_name:"permit-packet.pdf",mime_type:"application/pdf",size_bytes:42e4,created_at:l})),s||Sa(c.id,!1),n.selectedConversationId=c.id,Te(),k("Demo message scenario added.","local","Messages"),j(m("messages",{conversation:c.id},e),{replace:!0})}function pd(e,t){const a=Ln(e)||Ke(e)[0];if(!a)return Et(e,"Demo chat","company",t,!0);const i=new Date().toISOString(),s=ge({id:`msg-${crypto.randomUUID()}`,conversation_id:a.id,company_id:e,sender_profile_id:"shan",body:t,created_at:i,updated_at:i});n.messages.push(s),n.messageConversations=n.messageConversations.map(o=>o.id===a.id?{...o,last_message_at:i,updated_at:i}:o),us(a,s,[]),Te(),k("Demo mention added.","local","Messages"),u()}function fd(){n.messageConversations=Ga.map(ue),n.messageAccess=Za.map(Y),n.messages=Xa.map(ge),n.messageReads=ti.map(Ct),n.messageAttachments=ei.map(je),n.selectedConversationId="",Te(),k("Demo messages reset.","local","Messages"),u()}function gd(e){return{id:e.id,company_id:e.company_id,recipient_profile_id:e.recipient_profile_id,type:e.type,title:e.title,body:e.body,href:e.href,source_type:e.source_type,source_id:e.source_id,read_at:e.read_at||null,created_at:e.created_at}}function bd(e=""){const t=String(e||"").split(".")[0];return{access:"Access",approval:"Approval",calendar:"Calendar",file:"Files",finance:"Finance",form:"Forms",message:"Messages",task:"Tasks"}[t]||"Inbox"}async function Re(e){const t=h(e.companyId||e.company_id||p()),a=_d(t,e.recipients,{excludeActor:e.excludeActor===!0,type:e.type,href:e.href});if(!a.length)return[];const i=new Date().toISOString(),s=a.map(o=>ot({id:`notification-${crypto.randomUUID()}`,company_id:t,recipient_profile_id:o,type:e.type||"general",title:e.title||"Notification",body:e.body||"",href:e.href||"",source_type:e.sourceType||e.source_type||"",source_id:e.sourceId||e.source_id||"",created_at:i}));if(n.session?.auth==="supabase"){const o=q();if(!o)return[];const l=await o.from("notifications").insert(s.map(gd)).select();if(l.error)return console.warn("Notification insert failed",l.error),[];const c=(l.data||[]).map(ot);return Xi(c),u(),c}return Xi(s),$i(),u(),s}function Xi(e){if(!e.length)return;const t=new Map;e.concat(n.notifications).forEach(a=>t.set(a.id,a)),n.notifications=[...t.values()].sort((a,i)=>Date.parse(i.created_at||0)-Date.parse(a.created_at||0)).slice(0,200)}function _d(e,t=[],a={}){let s=(Array.isArray(t)?t:[t]).map(o=>me(e,o)).filter(Boolean);return s.length||(s=_s(e,a.type||"","","")),s=B(s),n.session?.auth!=="supabase"&&!s.includes(b().profile.id)&&s.push(b().profile.id),a.excludeActor&&(s=s.filter(o=>o!==gs())),s.filter(o=>yd(e,o)&&vd(e,o,a.type,a.href))}function me(e,t){if(!t)return"";const a=typeof t=="object"?String(t.profile_id||t.id||t.member_id||t.target_id||"").trim():String(t).trim();if(!a)return"";if(Ae(a)||X(e,a))return a;const i=b().profile;if(a===i.id||a===i.member_id||a===i.email)return i.id;const s=te(e).find(l=>[l.profile_id,l.member_id,l.email,l.name].filter(Boolean).includes(a));if(s?.profile_id)return s.profile_id;const o=n.profiles.find(l=>l.member_id===a||l.email===a||l.full_name===a);return o?.id?o.id:n.session?.auth==="supabase"?"":a}function yd(e,t){if(!t)return!1;if(t===b().profile.id&&n.session?.auth!=="supabase")return!0;const a=X(e,t);if(a)return a.status==="active";const i=te(e).find(s=>s.profile_id===t||s.member_id===t);return n.session?.auth!=="supabase"?!0:i?.status==="active"}function gs(){return b().profile.id||b().profile.member_id||""}function vd(e,t,a="",i=""){const s=hd(a,i);return s?bs(e,t,s):!0}function hd(e="",t=""){const a=`${e} ${t}`;return a.includes("finance")?"finance.view":a.includes("message")?"messages.view":a.includes("calendar")?"calendar.view":a.includes("file")?"files.view":a.includes("approval")?"approvals.view":a.includes("form")?"forms.view":a.includes("task")?"tasks.view":""}function bs(e,t,a){if(!a)return!0;if(t===b().profile.id)return F(a,e);const i=X(e,t);if(n.session?.auth==="supabase"&&(!i||i.status!=="active"))return!1;const s=String(i?.role||te(e).find(f=>f.profile_id===t)?.role||"member").toLowerCase();if(["owner","admin","developer"].includes(s))return!0;const o=li(a),l=n.roleAssignments.filter(f=>f.company_id===e&&f.profile_id===t).map(f=>f.role_id),c=n.rolePermissions.filter(f=>l.includes(f.role_id));if(c.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="deny"))return!1;if(c.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="allow"))return!0;const d=Ve[s]||Ve.member;return d.includes("*")||o.some(f=>d.includes(f))}function _s(e,t="",a="",i=""){const s=String(t||"").split(".")[0];return s==="finance"?se(e,["finance.view"]):s==="message"?se(e,["messages.view"]):s==="calendar"?$d(i).concat(se(e,["calendar.manage"])):s==="file"?se(e,["files.view"]).concat(wd(e,i)):s==="form"?se(e,["forms.view","forms.manage"]):s==="approval"?se(e,["approvals.view","approvals.manage"]):s==="access"?se(e,["users.manage","settings.manage"]):[gs()]}function se(e,t){return B(te(e).filter(a=>a.status==="active").map(a=>me(e,a.profile_id||a.member_id)).filter(a=>t.some(i=>bs(e,a,i))))}function Ra(e,t=!0){return e?B([e.assignee_id,t?e.creator_id:"",...Array.isArray(e.watchers)?e.watchers:[]].map(a=>me(e.company_id,a)).filter(Boolean)):[]}function wd(e,t){return t?B(n.tasks.filter(a=>a.company_id===e&&a.project_id===t).flatMap(a=>Ra(a))):[]}function $d(e){const t=n.calendarEvents.find(a=>a.id===e);return t?B([t.assigned_profile_id,t.created_by].map(a=>me(t.company_id,a)).filter(Boolean)):[]}function Qt(e){if(!e)return[];const a=ca(e.id).flatMap(i=>i.target_type==="all_company"?se(e.company_id,["messages.view"]):i.target_type==="profile"?[me(e.company_id,i.target_id)]:i.target_type==="role"?te(e.company_id).filter(s=>s.status==="active"&&(s.role_id===i.target_id||nt(e.company_id,s.role)===i.target_id)).map(s=>me(e.company_id,s.profile_id||s.member_id)):[]);return B(a.filter(Boolean))}async function Sd(e=p()){const t=new Date().toISOString(),a=b().profile.id,i=n.notifications.filter(s=>s.company_id===e&&s.recipient_profile_id===a&&!s.read_at).map(s=>s.id);if(i.length&&(n.notifications=n.notifications.map(s=>s.company_id===e&&s.recipient_profile_id===a&&!s.read_at?{...s,read_at:t}:s),$i(),u(),n.session?.auth==="supabase")){const s=q();s&&await s.from("notifications").update({read_at:t}).in("id",i).eq("recipient_profile_id",a)}}async function kd(e){const t=n.notifications.find(i=>i.id===e);if(!t)return;const a=new Date().toISOString();if(n.notifications=n.notifications.map(i=>i.id===t.id?{...i,read_at:i.read_at||a}:i),n.notificationMenuOpen=!1,$i(),u(),n.session?.auth==="supabase"&&!t.read_at){const i=q();i&&await i.from("notifications").update({read_at:a}).eq("id",t.id).eq("recipient_profile_id",b().profile.id)}t.href&&j(t.href)}function en(e,t=null){const a=m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),i=H(e.assignee_id);if(!t){Re({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task assigned",body:`${Q()} assigned ${e.title} to ${i}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s));return}t.assignee_id!==e.assignee_id&&Re({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task reassigned",body:`${Q()} reassigned ${e.title} to ${i}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s)),t.priority!==e.priority&&Re({companyId:e.company_id,recipients:Ra(e),excludeActor:!0,type:"task.priority",title:"Task priority changed",body:`${Q()} set priority to ${I(e.priority)} on ${e.title}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s)),t.status!==e.status&&Re({companyId:e.company_id,recipients:Ra(e),excludeActor:!0,type:"task.status",title:"Task status changed",body:`${Q()} moved ${e.title} to ${fe(e.status)}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s))}function z(e,t,a,i,s="",o="",l=p(),c=null){Re({companyId:l,recipients:c||_s(l,e,s,o),type:e,title:t,body:a,href:i,sourceType:s,sourceId:o}).catch(d=>console.warn("Notification event failed",d))}async function lt(e,t,a,i,s={},o=!1){const l={id:`audit-${crypto.randomUUID()}`,company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:i,details:s,created_at:new Date().toISOString()};if(n.auditEvents.unshift(l),o&&n.session?.auth==="supabase"){const c=q();if(c)try{await c.from("audit_events").insert({company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:i,details:s})}catch{}}}function Dd(e,t){return t.status==="disabled"?"membership.disabled":t.status==="left"?"membership.left":e&&["disabled","left","pending"].includes(e.status)&&t.status==="active"?"membership.reactivated":e&&e.role!==t.role?"role.changed":"membership.updated"}function Q(){return b().profile.full_name||b().profile.email||"Quest HQ"}function D(e,t,a=""){return`<article class="metric">${G(qn(e),"metric-symbol")}<span>${r(e)}</span><strong>${r(t)}</strong>${a?`<small>${r(a)}</small>`:""}</article>`}function ke(e,t){return`<div><strong>${r(e)}</strong><span>${r(t)}</span></div>`}function Ue(e,t,a,i,s=""){const o=`
    <span><strong>${r(e)}</strong><small>${r(t||"Finance record")}</small></span>
    <b>${r(a)}</b>
    <em>${T(i)}</em>
  `;return s?`<a class="finance-compact-row" href="${_(s)}" data-router>${o}</a>`:`<div class="finance-compact-row">${o}</div>`}function tn(e,t){const a=Ie(e);return t==="jobs"?a.filter(i=>i.job_id).length:a.filter(i=>i.folder===t).length}function ys(e="home",t=null){return t?.id?`job:${t.id}`:e||"home"}function Cd(e,t="home",a=null){const i=ys(t,a),s=it(e).filter(o=>o.parent_key===i).map(o=>jd(e,o));return a?s:t==="home"?Wa.map(([l,c,d,f])=>({id:l,name:c,caption:d,icon:f,href:_(m("files",{folder:l},e)),countLabel:`${tn(e,l)} file${tn(e,l)===1?"":"s"}`,updatedLabel:""})).concat(s):t==="jobs"?U(e).map(l=>({id:`job:${l.id}`,name:l.name,caption:l.client_name||E(e),icon:"ti-folder",href:_(m("files",{folder:"jobs",job_id:l.id},e)),countLabel:`${Nt(l.id)} file${Nt(l.id)===1?"":"s"}`,updatedLabel:T(l.updated_at)})).concat(s):s}function jd(e,t){const a=it(e).filter(o=>o.parent_key===t.id).length,i=Ie(e).filter(o=>o.folder===t.id).length,s=a+i;return{id:t.id,name:t.name,caption:"Custom folder",icon:"ti-folder",href:_(m("files",{folder:t.id},e)),countLabel:`${s} item${s===1?"":"s"}`,updatedLabel:T(t.updated_at)}}function Id(e,t,a=null){if(a)return`<span>/</span><a href="${_(m("files",{folder:"jobs"},e))}" data-router>Jobs</a>`;const i=it(e).find(d=>d.id===t);if(!i)return`<span>/</span><strong>${r(le(t))}</strong>`;const s=[];let o=i;const l=new Set;for(;o&&!l.has(o.id);)l.add(o.id),s.unshift(o),o=it(e).find(d=>d.id===o.parent_key);return`${i.parent_key&&!i.parent_key.startsWith("folder-")&&i.parent_key!=="home"?`<span>/</span><a href="${_(m("files",{folder:i.parent_key},e))}" data-router>${r(le(i.parent_key))}</a>`:""}${s.map((d,f)=>`<span>/</span>${f===s.length-1?`<strong>${r(d.name)}</strong>`:`<a href="${_(m("files",{folder:d.id},e))}" data-router>${r(d.name)}</a>`}`).join("")}`}function qd(e=p(),t="home",a=""){const i=(n.fileQuery||n.query||"").trim().toLowerCase(),s=n.fileCategoryFilter;let o=Ie(e);return a?o=o.filter(l=>l.job_id===a):t&&t!=="home"&&(t==="jobs"?o=o.filter(l=>l.job_id):o=o.filter(l=>l.folder===t)),s&&s!=="All categories"&&(o=o.filter(l=>String(l.category||le(l.folder)).toLowerCase()===s.toLowerCase())),i&&(o=o.filter(l=>[l.file_name,l.category,l.uploaded_by_label,l.notes,l.object_path,x(l.job_id)?.name].some(c=>String(c||"").toLowerCase().includes(i)))),o.sort((l,c)=>new Date(c.created_at||0)-new Date(l.created_at||0))}function we(e){const t={pdf:"PDF",image:"Image",archive:"Archive",sheet:"Excel",doc:"Word",presentation:"PowerPoint",text:"Text",video:"Video",audio:"Audio",code:"Code",data:"Data",design:"Design",cad:"CAD",email:"Email"},a=ka(e);if(t[a])return t[a];const i=Da(e);return i?i.toUpperCase():le(e.folder)}function ka(e){const t=String(e.mime_type||"").toLowerCase(),a=Da(e);return t.includes("pdf")||a==="pdf"?"pdf":t.includes("image")||["png","jpg","jpeg","gif","webp","svg","bmp","tif","tiff","heic","ico"].includes(a)?"image":t.includes("zip")||t.includes("compressed")||["zip","rar","7z","tar","gz","tgz","bz2"].includes(a)?"archive":t.includes("spreadsheet")||t.includes("excel")||["xls","xlsx","xlsm","ods","csv"].includes(a)?"sheet":t.includes("word")||["doc","docx","odt","rtf"].includes(a)?"doc":t.includes("presentation")||["ppt","pptx","pps","odp"].includes(a)?"presentation":t.includes("video")||["mp4","mov","avi","mkv","webm","wmv","m4v"].includes(a)?"video":t.includes("audio")||["mp3","wav","aac","flac","m4a","ogg"].includes(a)?"audio":["js","ts","jsx","tsx","html","css","scss","json","xml","yml","yaml","md","sql","py","rb","php","java","cs","cpp","c","go","rs","sh","ps1"].includes(a)?"code":["txt","log"].includes(a)||t.includes("text")?"text":["ai","psd","sketch","fig"].includes(a)?"design":["dwg","dxf","rvt","ifc","step","stp"].includes(a)?"cad":["eml","msg"].includes(a)?"email":["db","sqlite","bak"].includes(a)?"data":"file"}function Di(e){return ka(e)}function Da(e){return String(e.file_name||"").split(".").pop()?.toLowerCase()||""}function Ad(e){return e.type==="image/png"?"png":e.type==="image/webp"?"webp":"jpg"}function Ci(e,t=!1){return e.signed_url&&ka(e)==="image"?`<img src="${r(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${r(Di(e))} ${t?"large":""}">${js(e,we(e))}<small>${r(vs(e))}</small></span>`}function vs(e){const t=we(e),a=Da(e);return t==="Image"?a&&a.length<=4?a.toUpperCase():"IMG":t==="Archive"?a&&a.length<=3?a.toUpperCase():"ZIP":t==="Excel"?a==="csv"?"CSV":"XLS":t==="Word"?"DOC":t==="PowerPoint"?"PPT":t==="Video"?"VID":t==="Audio"?"AUD":t==="Code"?a&&a.length<=4?a.toUpperCase():"CODE":t==="Design"?a&&a.length<=4?a.toUpperCase():"DES":t==="CAD"?a&&a.length<=4?a.toUpperCase():"CAD":t==="Email"?a&&a.length<=4?a.toUpperCase():"MAIL":t==="Data"?a&&a.length<=4?a.toUpperCase():"DATA":t==="Text"?a&&a.length<=4?a.toUpperCase():"TXT":t.length<=4?t.toUpperCase():(a||"FILE").slice(0,4).toUpperCase()}function $e(e=p()){return n.forms.filter(t=>t.company_id===e)}function Md(e=p()){const t=n.formQuery.trim().toLowerCase(),a=n.route?.jobId||"";return $e(e).filter(i=>a&&i.linked_job_id!==a||n.formTypeFilter!=="all"&&i.type!==n.formTypeFilter?!1:t?[i.title,i.description,i.type,i.status,i.audience,x(i.linked_job_id)?.name].some(s=>String(s||"").toLowerCase().includes(t)):!0)}function ct(e=p()){const t=n.route?.jobId||"",a=$e(e).filter(o=>!t||o.linked_job_id===t),i=n.route?.params?.get("form_id")||"";if(i&&a.some(o=>o.id===i)&&(n.selectedFormId=i),!a.length)return n.selectedFormId="",n.selectedQuestionId="",null;let s=a.find(o=>o.id===n.selectedFormId)||a[0];return n.selectedFormId=s.id,(!n.selectedQuestionId||!s.questions.some(o=>o.id===n.selectedQuestionId))&&(n.selectedQuestionId=s.questions[0]?.id||""),s}function Ee(e){return n.forms.find(t=>t.id===e)||null}function pe(){return Ee(n.selectedFormId)||ct(p())}function hs(e=p()){return n.formResponses.filter(t=>t.company_id===e)}function Ca(e){return n.formResponses.filter(t=>t.form_id===e)}function ws(e){return Array.isArray(e?.questions)?e.questions.length:0}function Fd(e){const t=String(e?.creator_id||""),a=b().profile;return t?t&&(t===a.member_id||t===a.id)?a.full_name||"Quest Basic Mode":H(t):e?.created_by_label||a.full_name||"Quest HQ"}function et(e,t,a="",i=!1,s="text"){return`<label><span>${r(e)}</span><input data-form-field="${r(t)}" type="${r(s)}" value="${r(a)}" ${i?"required":""} /></label>`}function $s(e,t,a=""){return`<label><span>${r(e)}</span><textarea data-form-field="${r(t)}" rows="3">${r(a)}</textarea></label>`}function At(e,t,a,i){return`
    <label><span>${r(e)}</span><select data-form-field="${r(t)}">
      ${i.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function dt(e){return["multiple","checkbox","dropdown"].includes(e.type)}function Td(e){return{short:"ti-letter-t",paragraph:"ti-align-left",multiple:"ti-circle-dot",checkbox:"ti-checkbox",dropdown:"ti-select",date:"ti-calendar",rating:"ti-star",yesno:"ti-circle-check",file:"ti-paperclip"}[e]||"ti-plus"}function Ed(e){return _t.find(([t])=>t===e)?.[1]||I(e||"Question")}function ce(e,t){return`
    <div class="response-question">
      <label>
        <span>${r(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${r(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function Ss(e){const t=Ee(e.form_id),a=Object.entries(e.answers||{}).map(([i,s])=>{const o=t?.questions.find(c=>c.id===i),l=Array.isArray(s)?s.join(", "):s;return ke(o?.label||i,l||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${r(t?.title||"Response")}</h2><p>${r(e.submitted_by||e.submitter_email||"Anonymous")} / ${T(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||ke("Response","No answers captured.")}</div>
  `}function tt(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[W("short","Inspection address"),W("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),W("paragraph","Recommended scope"),W("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[W("short","Client name"),W("yesno","Approved to proceed?"),W("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[W("short","Request title"),W("dropdown","Priority",["Low","Medium","High","Urgent"]),W("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[W("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),W("yesno","Weather safe?"),W("paragraph","Safety notes")]}]}function Od(e=p()){return Dt({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:n.route?.jobId||"",theme_color:he(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[W("short","First question")]})}function W(e="short",t="Untitled question",a=[]){return _a({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function xd(e,t={}){const a=Od(e),i=Dt({...a,...t,id:t.id||`form-${crypto.randomUUID()}`,company_id:e,questions:(t.questions||a.questions).map(s=>_a(s)),created_at:t.created_at||new Date().toISOString(),updated_at:new Date().toISOString()});return n.forms.unshift(i),n.selectedFormId=i.id,n.selectedQuestionId=i.questions[0]?.id||"",n.formsTab="builder",n.formEditorTab="questions",n.modal="",n.formStartTemplateId="",n.formStartTab="blank",Z("New form created"),u(),i}function Rd(e){const t=Object.fromEntries(new FormData(e).entries()),a=t.template_id?tt().find(l=>l.id===t.template_id):null,i=String(t.title||a?.title||"Untitled form").trim()||"Untitled form",s=String(t.description||a?.description||"").trim(),o=a?a.questions.map(l=>({...Vt(l),id:`q-${crypto.randomUUID()}`})):[W("short","First question")];xd(p(),{title:i,description:s,type:bt.includes(t.type)?t.type:a?.type||"Internal",audience:String(t.audience||"Internal").trim()||"Internal",creator_id:b().profile.member_id||b().profile.id||"basic-quest-user",linked_job_id:String(t.linked_job_id||""),theme_color:he(p()),background:"clean",submit_label:String(t.submit_label||"Submit").trim()||"Submit",collect_email:t.collect_email==="on",require_approval:t.require_approval==="on",questions:o})}function Mt(e,t=!0){const a=Ee(e);a&&(n.selectedFormId=a.id,n.selectedQuestionId=a.questions[0]?.id||"",t&&u())}function Z(e="Forms saved locally"){const t=pe();t&&(t.updated_at=new Date().toISOString()),$(We,n.forms),$(Ht,n.formResponses),n.sync={label:e,mode:"live"}}function an(e,t){const a=Ee(e||n.selectedFormId);a&&(a.status=Ka.includes(t)?t:"Draft",n.selectedFormId=a.id,Z(`${a.status} locally`),u())}function Pd(e){const t=Ee(e||n.selectedFormId);if(!t)return;const a=Dt({...Vt(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(i=>({...Vt(i),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});n.forms.unshift(a),n.selectedFormId=a.id,n.selectedQuestionId=a.questions[0]?.id||"",Z("Form duplicated"),u()}function Nd(e){const t=e||n.selectedFormId;t&&(n.forms=n.forms.filter(a=>a.id!==t),n.formResponses=n.formResponses.filter(a=>a.form_id!==t),n.selectedFormId=$e(p())[0]?.id||"",n.selectedQuestionId=ct(p())?.questions[0]?.id||"",n.modal="",Z("Form deleted locally"),u())}async function Ud(e){const t=e||n.selectedFormId,a=`${window.location.origin}${_(m("forms",{form_id:t},p()))}`;try{await navigator.clipboard.writeText(a),n.sync={label:"Form link copied",mode:"live"}}catch{n.sync={label:"Copy failed",mode:"local"}}u()}function Ld(e){const t=JSON.stringify({company_id:e,forms:$e(e),responses:hs(e)},null,2);Kd(`${e}-forms-export.json`,t,"application/json")}function ks(e){const t=pe();if(!t)return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),$(We,n.forms))}function Ds(e){const t=pe(),a=e.closest("[data-question-id]"),i=t?.questions.find(s=>s.id===a?.dataset.questionId);if(!(!t||!i)){if(n.selectedQuestionId=i.id,e.matches("[data-question-option]")){const s=Number(e.dataset.questionOption);i.options[s]=e.value}else{const s=e.dataset.questionField;if(s==="required")i.required=e.checked;else if(s==="type"){i.type=e.value,dt(i)&&!i.options.length&&(i.options=["Option 1","Option 2"]),dt(i)||(i.options=[]),Z("Question updated"),u();return}else s&&(i[s]=e.value)}t.updated_at=new Date().toISOString(),$(We,n.forms)}}function Qd(e="multiple"){const t=pe();if(!t)return;const a=W(e,_t.find(([i])=>i===e)?.[1]||"New question");t.questions.push(a),n.selectedQuestionId=a.id,Z("Question added"),u()}function Vd(e){const t=pe(),a=t?.questions.find(o=>o.id===e);if(!t||!a)return;const i=t.questions.findIndex(o=>o.id===e),s=_a({...Vt(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(i+1,0,s),n.selectedQuestionId=s.id,Z("Question duplicated"),u()}function Bd(e){const t=pe();t&&(t.questions=t.questions.filter(a=>a.id!==e),n.selectedQuestionId=t.questions[0]?.id||"",Z("Question deleted"),u())}function zd(e,t){const a=pe();if(!a||!t)return;const i=a.questions.findIndex(l=>l.id===e),s=i+t;if(i<0||s<0||s>=a.questions.length)return;const[o]=a.questions.splice(i,1);a.questions.splice(s,0,o),n.selectedQuestionId=e,Z("Question moved"),u()}function Hd(e){const a=pe()?.questions.find(i=>i.id===e);a&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),Z("Option added"),u())}function Jd(e,t){const i=pe()?.questions.find(s=>s.id===e);!i||t<0||(i.options.splice(t,1),i.options.length||i.options.push("Option 1"),Z("Option removed"),u())}function Wd(e){const t=Ee(e.dataset.formId);if(!t)return;const a=new FormData(e),i={};t.questions.forEach(s=>{const o=`answer:${s.id}`,l=a.getAll(o).filter(c=>c instanceof File?c.name:String(c||"").trim());i[s.id]=l.length>1?l.map(c=>c instanceof File?c.name:c):l[0]instanceof File?l[0].name:l[0]||""}),n.formResponses.unshift(vi({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||b().profile.full_name||"Preview submitter"),answers:i,created_at:new Date().toISOString()})),n.formsTab="responses",n.modal="",Z("Preview response saved"),z(t.require_approval?"approval.form":"form.response",t.require_approval?"Form approval ready":"Form response saved",`${Q()} saved a response for ${t.title}.`,m("forms",{form_id:t.id,tab:"responses"},t.company_id),"form_response",t.id,t.company_id),u()}function Kd(e,t,a="text/plain"){const i=new Blob([t],{type:a}),s=URL.createObjectURL(i),o=document.createElement("a");o.href=s,o.download=e,o.click(),URL.revokeObjectURL(s)}function Vt(e){return JSON.parse(JSON.stringify(e))}function B(e){return Array.from(new Set(e.map(t=>String(t||"").trim()).filter(Boolean)))}function fe(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||I(e)}function Ze(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||I(e)}function le(e){return Wa.find(([t])=>t===e)?.[1]||n.driveFolders.find(t=>t.id===e)?.name||I(e||"Shared")}function Yd(e=p()){return Wa.map(([t,a])=>[t,a]).concat(it(e).map(t=>[t.id,t.name]))}function Gd(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function Cs(e,t="Folder"){return Is("default_folder.svg",t||"Folder")}function js(e,t="File"){return Is(Zd(e),t||we(e))}function Is(e,t){return`<img class="asset-icon" src="${r(Rs+e)}" alt="${r(t)}" loading="lazy" draggable="false" referrerpolicy="no-referrer" />`}function Zd(e){const t=Da(e),a={pdf:"file_type_pdf.svg",doc:"file_type_word.svg",docx:"file_type_word.svg",odt:"file_type_word.svg",rtf:"file_type_word.svg",xls:"file_type_excel.svg",xlsx:"file_type_excel.svg",xlsm:"file_type_excel.svg",ods:"file_type_excel.svg",csv:"file_type_excel.svg",ppt:"file_type_powerpoint.svg",pptx:"file_type_powerpoint.svg",pps:"file_type_powerpoint.svg",odp:"file_type_powerpoint.svg",zip:"file_type_zip.svg",rar:"file_type_zip.svg","7z":"file_type_zip.svg",tar:"file_type_zip.svg",gz:"file_type_zip.svg",tgz:"file_type_zip.svg",txt:"file_type_text.svg",log:"file_type_text.svg",md:"file_type_markdown.svg",json:"file_type_json.svg",html:"file_type_html.svg",htm:"file_type_html.svg",css:"file_type_css.svg",scss:"file_type_css.svg",js:"file_type_js.svg",jsx:"file_type_js.svg",ts:"file_type_js.svg",tsx:"file_type_js.svg",xml:"file_type_xml.svg",yml:"file_type_yaml.svg",yaml:"file_type_yaml.svg",svg:"file_type_svg.svg",ai:"file_type_ai.svg",psd:"file_type_photoshop.svg"};if(a[t])return a[t];const i=ka(e);return i==="image"?"file_type_image.svg":i==="video"?"file_type_video.svg":i==="audio"?"file_type_audio.svg":i==="text"?"file_type_text.svg":i==="code"?"file_type_js.svg":i==="archive"?"file_type_zip.svg":"default_file.svg"}function I(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function v(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function T(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function Bt(e){if(!e)return"No time";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(t)}function ja(e){const t=new Date(e);if(!e||Number.isNaN(t.getTime()))return"just now";const a=Math.max(0,Math.floor((Date.now()-t.getTime())/1e3));if(a<45)return"just now";const i=Math.floor(a/60);if(i<60)return`${i}m ago`;const s=Math.floor(i/60);if(s<24)return`${s}h ago`;const o=Math.floor(s/24);return o<7?`${o}d ago`:T(e)}function Ft(e){const t=Math.max(0,Math.floor(N(e)/1e3)),a=Math.floor(t/3600),i=Math.floor(t%3600/60);return a?`${a}h ${String(i).padStart(2,"0")}m`:`${i}m`}function ji(e){const t=N(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],i=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**i).toFixed(i?1:0)} ${a[i]}`}function mt(e){return(t,a)=>Date.parse(a[e]||a.updated_at||a.created_at||0)-Date.parse(t[e]||t.updated_at||t.created_at||0)}function qs(e){if(!e)return 0;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?0:Math.floor((Ia().getTime()-t.getTime())/864e5)}function nn(e){if(!e)return 999;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?999:Math.floor((t.getTime()-Ia().getTime())/864e5)}function Xd(e=p()){const t=(ga(fa(e)||{short_name:e})||e||"QH").replace(/[^a-z]/gi,"").slice(0,2).toUpperCase()||"QH",a=ve(e).length+1;return`${t}-${String(1e3+a)}`}function Ia(){const e=new Date;return e.setHours(0,0,0,0),e}function em(e,t){return`${As(e,t)}%`}function As(e,t){const a=N(t);return a?Math.max(0,Math.min(100,Math.round(N(e)/a*100))):0}function Je(e){return{critical:5,urgent:4,high:3,medium:2,low:1}[String(e||"").toLowerCase()]||0}function jt(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function re(e,t){return e.reduce((a,i)=>a+N(i[t]),0)}function N(e){const t=Number(e);return Number.isFinite(t)?t:0}function ut(e){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(e||""))}function zt(e){const t=String(e||"").trim();return ut(t)||/^[0-9a-f]{8,}$/i.test(t)||/^user[_-]?[0-9a-f-]{8,}$/i.test(t)}function Ms(e){const t=String(e||"").trim();return t?t.slice(0,8):""}function w(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(N(e))}function De(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function S(e,t){const a=De(e,t);return Array.isArray(a)&&a.length?a:t}function $(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
