(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const Qe={buildId:"Quest HQ Company Workspace v1",localUsername:"lumen123",localPassword:"lumen123",supabaseUrl:"https://lpzotcznihwyyudxycmd.supabase.co",supabaseKey:"sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07"},Ne=new URL("/quest-hq-command-center/",window.location.origin).pathname.replace(/\/$/,""),Ve="quest-hq-local-session",hi="quest-hq-local-profile",Ja="quest-hq-job-cache-v2",Wa="quest-hq-task-cache-v1",Ya="quest-hq-file-cache-v1",Ka="quest-hq-drive-folder-cache-v1",Ga="quest-hq-team-cache-v1",Za="quest-hq-company-membership-cache-v1",Ge="quest-hq-company-form-cache-v1",Xt="quest-hq-company-form-response-cache-v1",Xa="quest-hq-finance-invoice-cache-v1",en="quest-hq-finance-payment-cache-v1",tn="quest-hq-finance-expense-cache-v1",an="quest-hq-finance-vendor-cache-v1",ea="quest-hq-time-entry-cache-v1",ta="quest-hq-active-timer-v1",ye="quest-hq-active-company",nn="quest-hq-pending-workspace-review-v1",wi="quest-hq-task-view",$i="quest-hq-drive-view",aa="quest-hq-notification-cache-v1",na="quest-hq-message-conversation-cache-v1",ia="quest-hq-message-access-cache-v1",sa="quest-hq-message-cache-v1",ra="quest-hq-message-read-cache-v1",oa="quest-hq-message-attachment-cache-v1",la="quest-hq-calendar-event-cache-v1",Be={developer:["*"],admin:["*"],owner:["*"],manager:["jobs.view","jobs.manage","tasks.view","tasks.manage","files.view","files.manage","forms.view","forms.manage","finance.view","team.view","clock.manage","approvals.manage","approvals.view","calendar.view","calendar.manage","calendar.view_team","users.view","settings.view","billing.view","roles.view","messages.view","messages.send","messages.create_group","messages.manage_groups","messages.attach_files"],member:["jobs.view","tasks.view","tasks.manage","files.view","forms.view","time.track","approvals.view","calendar.view","users.view","messages.view","messages.send","messages.attach_files"]},Ys=[["jobs.view","View jobs"],["jobs.manage","Create/edit jobs"],["tasks.view","View tasks"],["tasks.manage","Create/edit tasks"],["files.view","View files"],["files.manage","Upload/delete files"],["forms.view","View forms"],["forms.manage","Create/edit forms"],["crm.view","View CRM"],["finance.view","View finance"],["finance.manage","Create/edit finance"],["users.view","View users"],["users.manage","Invite/manage users"],["roles.view","View roles"],["roles.manage","Create/edit roles"],["billing.view","View billing"],["billing.manage","Manage subscription"],["settings.view","View settings"],["settings.manage","Manage settings"],["time.track","Track own time"],["clock.manage","Manage clock dashboard"],["approvals.view","View approvals"],["approvals.manage","Manage approvals"],["calendar.view","View calendar"],["calendar.manage","Create/edit calendar events"],["calendar.view_team","View team calendar"],["messages.view","View messages"],["messages.send","Send messages"],["messages.create_group","Create group chats"],["messages.manage_groups","Manage group chats"],["messages.attach_files","Attach files/images"],["messages.delete_own","Delete own messages"],["messages.delete_any","Delete any messages"],["messages.manage","Manage messages (compatibility)"]],Ks={"messages.manage":["messages.manage_groups"],"messages.manage_groups":["messages.manage"]},bt=[{id:"jobs",group:"Workspace",label:"Jobs",icon:"ti-briefcase",symbol:"q-symbol-jobs",status:"live",permission:"jobs.view"},{id:"tasks",group:"Workspace",label:"Tasks",icon:"ti-list-check",symbol:"q-symbol-tasks",status:"live",permission:"tasks.view"},{id:"files",group:"Workspace",label:"Files",icon:"ti-folder",symbol:"q-symbol-files",status:"live",permission:"files.view"},{id:"forms",group:"Workspace",label:"Forms",icon:"ti-clipboard-list",symbol:"q-symbol-forms",status:"live",permission:"forms.view"},{id:"analytics",group:"Workspace",label:"Analytics",icon:"ti-chart-bar",symbol:"q-symbol-analytics",status:"live",permission:"jobs.view"},{id:"crm",group:"Workspace",label:"CRM",icon:"ti-users-group",symbol:"q-symbol-crm",status:"live",permission:"crm.view"},{id:"tickets",group:"Workspace",label:"Tickets",icon:"ti-ticket",symbol:"q-symbol-tickets",status:"planned"},{id:"finance",group:"Workspace",label:"Finance",icon:"ti-receipt-dollar",symbol:"q-symbol-finance",status:"live",permission:"finance.view"},{id:"knowledge",group:"Workspace",label:"Knowledge Base",icon:"ti-books",symbol:"q-symbol-knowledge",status:"planned"},{id:"automations",group:"Workspace",label:"Automations",icon:"ti-automation",symbol:"q-symbol-automations",status:"planned"},{id:"templates",group:"Workspace",label:"Templates",icon:"ti-template",symbol:"q-symbol-templates",status:"planned"},{id:"users",group:"Company",label:"Users",icon:"ti-users",symbol:"q-symbol-users",status:"live",permission:"users.view"},{id:"messages",group:"Company",label:"Messages",icon:"ti-messages",symbol:"q-symbol-messages",status:"live",permission:"messages.view"},{id:"settings",group:"Company",label:"Settings",icon:"ti-settings",symbol:"q-symbol-settings",status:"live",permission:"settings.view"},{id:"team-chart",group:"Company",label:"Team chart",icon:"ti-hierarchy-3",symbol:"q-symbol-team-chart",status:"live",permission:"team.view"},{id:"time",group:"Operations",label:"My time",icon:"ti-clock",symbol:"q-symbol-time",status:"live",permission:"time.track"},{id:"calendar",group:"Operations",label:"Calendar",icon:"ti-calendar",symbol:"q-symbol-calendar",status:"live",permission:"calendar.view"},{id:"approvals",group:"Operations",label:"Approvals",icon:"ti-user-check",symbol:"q-symbol-approvals",status:"live",permission:"approvals.view"},{id:"team-workload",group:"Operations",label:"Team workload",icon:"ti-users",symbol:"q-symbol-team-workload",status:"planned"},{id:"clock",group:"Operations",label:"Clock dashboard",icon:"ti-clock-hour-4",symbol:"q-symbol-clock",status:"live",permission:"clock.manage"}],Gs={"/admin.html":"settings","/automations.html":"automations","/calendar.html":"calendar","/crm.html":"crm","/dashboards.html":"analytics","/files.html":"files","/finance.html":"finance","/forms.html":"forms","/jobs.html":"jobs","/knowledge.html":"knowledge","/messages.html":"messages","/templates.html":"templates","/tickets.html":"tickets"},_t=["Lead","Site Review","Estimate","Approved","Active","Closed"],Si=["pipeline","list","profile"],vt=["todo","pending","hold","review","done"],Ut=["critical","urgent","high","medium","low"],ki=["lead","bid","admin","invoicing","ar","meeting","web_dev"],ca=["Company event","Job visit / inspection","Estimate appointment","Install / field work","Internal meeting","Personal reminder"],Zs=["Task due","Invoice due","Approval","Time"].concat(ca),Xs="https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons@master/icons/",er=["All categories","Shared","Jobs","Forms","Photos","Permits","Contracts","Archive"],sn=[["jobs","Jobs","Job-linked folders and deliverables","ti-folders"],["shared","Shared","Company-wide files","ti-folder-share"],["forms","Forms","Completed forms and templates","ti-clipboard-list"],["photos","Photos","Site photos and field media","ti-photo"],["permits","Permits","Permit packets and approvals","ti-file-certificate"],["contracts","Contracts","Signed agreements and estimates","ti-file-dollar"],["archive","Archive","Closed or historical files","ti-archive"]],yt=["Inspection","Client approval","Intake","Survey","Safety","Internal"],rn=["Draft","Published","Archived"],Di=["Draft","Sent","Partially paid","Paid","Overdue","Void"],Ci=["Pending","Approved","Paid","Rejected"],ji=["Active","On hold","Inactive"],Ii=["ACH","Check","Card","Cash","Wire","Other"],da=["Materials","Labor","Subcontractor","Permit","Equipment","Marketing","Software","Travel","Other"],on=["company","role","custom","direct"],ht=[["short","Short answer"],["paragraph","Paragraph"],["multiple","Multiple choice"],["checkbox","Checkboxes"],["dropdown","Dropdown"],["date","Date"],["rating","Rating"],["yesno","Yes / No"],["file","File upload"]],wt=[{id:"roofing",name:"Quest Roofing",short_name:"Roofing",color:"#f0b23b"},{id:"drafting",name:"Quest Drafting",short_name:"Drafting",color:"#60a5fa"},{id:"lumen",name:"Lumen Marketing",short_name:"Lumen",color:"#a78bfa"}],qi=[{id:"11111111-1111-4111-8111-111111111111",company_id:"roofing",name:"Queen Creek Leak Follow-up",client_name:"Rosales Residence",contact_name:"Maya Rosales",site_address:"Queen Creek, AZ",job_type:"Roofing repair",stage:"Active",priority:"Urgent",owner_name:"Andre Lee",scope:"Emergency leak inspection, dry-in, and repair proposal.",notes:"Client reported active leak after monsoon storm.",estimate_total:6800,invoice_total:0,task_count:4,file_count:5,updated_at:new Date().toISOString()},{id:"22222222-2222-4222-8222-222222222222",company_id:"roofing",name:"Mesa Storage Roof Repair",client_name:"Mesa Storage Partners",contact_name:"D. Harris",site_address:"Mesa, AZ",job_type:"Commercial repair",stage:"Estimate",priority:"High",owner_name:"Maya Rosales",scope:"Inspect roof membrane, prepare repair estimate, and attach permit packet.",notes:"Board wants estimate and permit notes before approval.",estimate_total:18400,invoice_total:0,task_count:3,file_count:4,updated_at:new Date(Date.now()-864e5).toISOString()},{id:"33333333-3333-4333-8333-333333333333",company_id:"drafting",name:"Drafting Permit Package",client_name:"Horizon HVAC",contact_name:"Noah Park",site_address:"Chandler, AZ",job_type:"Drafting",stage:"Site Review",priority:"Medium",owner_name:"Noah Park",scope:"Prepare drawing package and client approval form.",notes:"Waiting on latest measurements.",estimate_total:4200,invoice_total:0,task_count:2,file_count:3,updated_at:new Date(Date.now()-1728e5).toISOString()}],Mi=[{id:"abraham",name:"Abraham",full_name:"Abraham Flores",email:"abraham@quest-hq.local",color:"#f0b23b",active:!0,company_ids:["roofing","drafting"],supervisor_id:""},{id:"maya",name:"Maya",full_name:"Maya Rosales",email:"maya@quest-hq.local",color:"#60a5fa",active:!0,company_ids:["roofing"],supervisor_id:"abraham"},{id:"andre",name:"Andre",full_name:"Andre Lee",email:"andre@quest-hq.local",color:"#f97316",active:!0,company_ids:["roofing"],supervisor_id:"maya"},{id:"noah",name:"Noah",full_name:"Noah Park",email:"noah@quest-hq.local",color:"#a78bfa",active:!0,company_ids:["drafting"],supervisor_id:"abraham"},{id:"lumen-ops",name:"Lumen Ops",full_name:"Lumen Operations",email:"ops@lumen.local",color:"#7c3aed",active:!0,company_ids:["lumen"],supervisor_id:""}],Ai=[{company_id:"roofing",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"drafting",profile_id:"basic-quest-user",role:"developer",status:"active"},{company_id:"lumen",profile_id:"basic-quest-user",role:"developer",status:"active"}],Fi=[{id:"task-roofing-leak-1",title:"Call client and confirm active leak area",description:"Confirm access window, roof area, and whether temporary dry-in is still holding.",type:"lead",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"abraham",assignee_id:"maya",due:h(0),priority:"urgent",urgency:"urgent",status:"todo"},{id:"task-roofing-leak-2",title:"Upload inspection photos",description:"Attach site photos to the company drive and tag the Queen Creek job folder.",type:"admin",company_id:"roofing",project_id:"11111111-1111-4111-8111-111111111111",creator_id:"maya",assignee_id:"andre",due:h(1),priority:"high",urgency:"high",status:"pending"},{id:"task-roofing-mesa-1",title:"Prepare repair estimate packet",description:"Draft scope, estimate total, and permit notes for board review.",type:"bid",company_id:"roofing",project_id:"22222222-2222-4222-8222-222222222222",creator_id:"abraham",assignee_id:"maya",due:h(3),priority:"high",urgency:"high",status:"review"},{id:"task-drafting-package-1",title:"Request final measurements",description:"Get latest field measurements before starting permit drawings.",type:"admin",company_id:"drafting",project_id:"33333333-3333-4333-8333-333333333333",creator_id:"abraham",assignee_id:"noah",due:h(2),priority:"medium",urgency:"medium",status:"hold"},{id:"task-lumen-ops-1",title:"Create client onboarding checklist",description:"Internal Lumen setup task to prove company workspace isolation.",type:"meeting",company_id:"lumen",project_id:"",creator_id:"abraham",assignee_id:"lumen-ops",due:h(5),priority:"medium",urgency:"medium",status:"todo"}],Ei=[{id:"file-roofing-1",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",folder:"photos",file_name:"queen-creek-leak-photos.zip",mime_type:"application/zip",size_bytes:184e5,category:"Photos",uploaded_by_label:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString()},{id:"file-roofing-2",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",folder:"permits",file_name:"mesa-storage-permit-notes.pdf",mime_type:"application/pdf",size_bytes:86e4,category:"Permits",uploaded_by_label:"Andre Lee",created_at:new Date(Date.now()-864e5).toISOString()},{id:"file-drafting-1",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",folder:"contracts",file_name:"horizon-hvac-drawing-agreement.pdf",mime_type:"application/pdf",size_bytes:42e4,category:"Contracts",uploaded_by_label:"Noah Park",created_at:new Date(Date.now()-1728e5).toISOString()},{id:"file-lumen-1",company_id:"lumen",job_id:"",folder:"shared",file_name:"lumen-shared-brand-assets.zip",mime_type:"application/zip",size_bytes:32e5,category:"Shared",uploaded_by_label:"Lumen Operations",created_at:new Date(Date.now()-2592e5).toISOString()}],Ti=[{id:"form-roofing-inspection",company_id:"roofing",title:"Roof Inspection Checklist",description:"Field checklist for leak calls, roof condition notes, photos, and repair recommendations.",type:"Inspection",status:"Published",audience:"Field team",creator_id:"abraham",linked_job_id:"11111111-1111-4111-8111-111111111111",theme_color:"#f0b23b",background:"paper",submit_label:"Submit inspection",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString(),questions:[{id:"q-roof-1",type:"short",label:"Inspection address",help:"Confirm the address before submitting.",required:!0},{id:"q-roof-2",type:"multiple",label:"Primary roof condition",help:"",required:!0,options:["Active leak","Storm damage","Aged underlayment","Maintenance issue"]},{id:"q-roof-3",type:"paragraph",label:"Recommended scope",help:"Write the repair or estimate recommendation.",required:!0},{id:"q-roof-4",type:"file",label:"Attach inspection photos",help:"Upload photos into the company drive after submit.",required:!1}]},{id:"form-roofing-estimate-approval",company_id:"roofing",title:"Estimate Approval",description:"Client-facing approval form for estimate review and signature follow-up.",type:"Client approval",status:"Draft",audience:"Client",creator_id:"maya",linked_job_id:"22222222-2222-4222-8222-222222222222",theme_color:"#f45d22",background:"clean",submit_label:"Approve estimate",collect_email:!0,require_approval:!0,created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString(),questions:[{id:"q-est-1",type:"short",label:"Client name",required:!0},{id:"q-est-2",type:"yesno",label:"Do you approve the attached estimate?",required:!0},{id:"q-est-3",type:"paragraph",label:"Questions or requested changes",required:!1}]},{id:"form-drafting-intake",company_id:"drafting",title:"Drafting Permit Intake",description:"Collect measurements, equipment details, and permit packet requirements.",type:"Intake",status:"Published",audience:"Client",creator_id:"noah",linked_job_id:"33333333-3333-4333-8333-333333333333",theme_color:"#60a5fa",background:"grid",submit_label:"Send intake",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString(),questions:[{id:"q-draft-1",type:"short",label:"Project address",required:!0},{id:"q-draft-2",type:"paragraph",label:"Permit notes",required:!1},{id:"q-draft-3",type:"date",label:"Needed by",required:!0}]},{id:"form-lumen-onboarding",company_id:"lumen",title:"Client Onboarding Intake",description:"Initial Lumen setup form for client goals, assets, users, and launch timing.",type:"Intake",status:"Draft",audience:"Client",creator_id:"lumen-ops",linked_job_id:"",theme_color:"#a78bfa",background:"clean",submit_label:"Submit onboarding",collect_email:!0,require_approval:!1,created_at:new Date(Date.now()-3456e5).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString(),questions:[{id:"q-lumen-1",type:"short",label:"Company name",required:!0},{id:"q-lumen-2",type:"checkbox",label:"Needed services",required:!0,options:["Website","SEO","Paid ads","CRM setup"]},{id:"q-lumen-3",type:"paragraph",label:"Launch goals",required:!1}]}],Oi=[{id:"response-roofing-1",company_id:"roofing",form_id:"form-roofing-inspection",submitted_by:"Maya Rosales",created_at:new Date(Date.now()-36e5).toISOString(),answers:{"q-roof-1":"Queen Creek, AZ","q-roof-2":"Active leak","q-roof-3":"Dry-in held. Prepare repair estimate and photo packet."}}],xi=[{id:"vendor-roofing-materials",company_id:"roofing",name:"Valley Roofing Supply",contact_name:"Elena Ortiz",email:"orders@valleyroofingsupply.local",phone:"(480) 555-0190",category:"Materials",status:"Active",notes:"Primary tile, flashing, and underlayment vendor.",created_at:new Date(Date.now()-12096e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"vendor-roofing-dryin",company_id:"roofing",name:"Monsoon Dry-In Crew",contact_name:"R. Alvarez",email:"dispatch@monsoondryin.local",phone:"(602) 555-0144",category:"Subcontractor",status:"Active",notes:"Emergency dry-in support during storm calls.",created_at:new Date(Date.now()-10368e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"vendor-drafting-permits",company_id:"drafting",name:"Permit Runner AZ",contact_name:"Sofia Chen",email:"permits@runneraz.local",phone:"(602) 555-0171",category:"Permit",status:"Active",notes:"Permit filing support for drafting packets.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-2592e5).toISOString()},{id:"vendor-lumen-software",company_id:"lumen",name:"Lumen SaaS Stack",contact_name:"Ops Billing",email:"billing@lumenstack.local",phone:"",category:"Software",status:"Active",notes:"Internal software subscriptions for client onboarding.",created_at:new Date(Date.now()-7776e5).toISOString(),updated_at:new Date(Date.now()-3456e5).toISOString()}],Ri=[{id:"invoice-roofing-queen-creek",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",client_name:"Rosales Residence",invoice_number:"QR-1007",status:"Partially paid",issue_date:h(-10),due_date:h(5),subtotal:6800,tax:0,total:6800,notes:"Emergency leak repair billing with deposit received.",created_at:new Date(Date.now()-864e6).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"invoice-roofing-mesa-storage",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",client_name:"Mesa Storage Partners",invoice_number:"QR-1008",status:"Sent",issue_date:h(-18),due_date:h(-2),subtotal:18400,tax:0,total:18400,notes:"Estimate packet sent to board for approval.",created_at:new Date(Date.now()-15552e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-drafting-horizon",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",client_name:"Horizon HVAC",invoice_number:"QD-2031",status:"Sent",issue_date:h(-7),due_date:h(14),subtotal:4200,tax:0,total:4200,notes:"Drafting permit package milestone invoice.",created_at:new Date(Date.now()-6048e5).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()},{id:"invoice-lumen-onboarding",company_id:"lumen",job_id:"",client_name:"Lumen Internal Launch",invoice_number:"LM-3004",status:"Draft",issue_date:h(-3),due_date:h(27),subtotal:3200,tax:0,total:3200,notes:"Demo onboarding package used for finance workspace.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()}],Pi=[{id:"payment-roofing-queen-creek-deposit",company_id:"roofing",invoice_id:"invoice-roofing-queen-creek",amount:2500,method:"ACH",received_at:h(-4),reference:"ACH-4421",notes:"Deposit received after dry-in visit.",created_at:new Date(Date.now()-3456e5).toISOString()},{id:"payment-drafting-horizon-retainer",company_id:"drafting",invoice_id:"invoice-drafting-horizon",amount:1e3,method:"Check",received_at:h(-1),reference:"CHK-117",notes:"Retainer collected before permit packet completion.",created_at:new Date(Date.now()-864e5).toISOString()}],Ni=[{id:"expense-roofing-queen-creek-materials",company_id:"roofing",job_id:"11111111-1111-4111-8111-111111111111",vendor_id:"vendor-roofing-materials",category:"Materials",amount:1850,status:"Approved",spent_at:h(-6),notes:"Underlayment, flashing, and tile replacement materials.",created_at:new Date(Date.now()-5184e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-roofing-mesa-permit",company_id:"roofing",job_id:"22222222-2222-4222-8222-222222222222",vendor_id:"vendor-roofing-materials",category:"Permit",amount:620,status:"Pending",spent_at:h(-2),notes:"Permit and document prep allowance.",created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-72e5).toISOString()},{id:"expense-drafting-horizon-runner",company_id:"drafting",job_id:"33333333-3333-4333-8333-333333333333",vendor_id:"vendor-drafting-permits",category:"Permit",amount:480,status:"Approved",spent_at:h(-3),notes:"Permit runner package review.",created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-864e5).toISOString()},{id:"expense-lumen-software-stack",company_id:"lumen",job_id:"",vendor_id:"vendor-lumen-software",category:"Software",amount:540,status:"Paid",spent_at:h(-5),notes:"Client onboarding software stack.",created_at:new Date(Date.now()-432e6).toISOString(),updated_at:new Date(Date.now()-1728e5).toISOString()}],Ui=[{id:"notification-roofing-task-assigned",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.assigned",title:"Task assigned",body:"Abraham assigned Leak inspection photos to you.",href:"/company/roofing/tasks?job_id=roofing-leak&task_id=task-roofing-leak-1",source_type:"task",source_id:"task-roofing-leak-1",read_at:"",created_at:new Date(Date.now()-7*6e4).toISOString()},{id:"notification-roofing-task-priority",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"task.priority",title:"Task priority changed",body:"Shan set priority to Urgent on HOA board approval package.",href:"/company/roofing/tasks?job_id=roofing-mesa&task_id=task-roofing-mesa-1",source_type:"task",source_id:"task-roofing-mesa-1",read_at:"",created_at:new Date(Date.now()-19*6e4).toISOString()},{id:"notification-roofing-approval",company_id:"roofing",recipient_profile_id:"basic-quest-user",type:"approval.ready",title:"Approval needs review",body:"Estimate approval is waiting in the company review queue.",href:"/company/roofing/approvals",source_type:"form",source_id:"form-roofing-estimate-approval",read_at:new Date(Date.now()-5*6e4).toISOString(),created_at:new Date(Date.now()-44*6e4).toISOString()},{id:"notification-drafting-task-review",company_id:"drafting",recipient_profile_id:"basic-quest-user",type:"task.status",title:"Task moved to review",body:"Drawing package QA is ready for review.",href:"/company/drafting/tasks?job_id=drafting-package&task_id=task-drafting-package-1",source_type:"task",source_id:"task-drafting-package-1",read_at:"",created_at:new Date(Date.now()-63*6e4).toISOString()},{id:"notification-lumen-finance",company_id:"lumen",recipient_profile_id:"basic-quest-user",type:"finance.invoice",title:"Invoice drafted",body:"Lumen onboarding invoice is ready for payment tracking.",href:"/company/lumen/finance?invoice=invoice-lumen-onboarding",source_type:"invoice",source_id:"invoice-lumen-onboarding",read_at:"",created_at:new Date(Date.now()-92*6e4).toISOString()}],ln=[{id:"msg-conv-roofing-all",company_id:"roofing",title:"Roofing dispatch",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-16*6e4).toISOString(),created_at:new Date(Date.now()-864e5).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-conv-roofing-crew",company_id:"roofing",title:"Roofing crew",type:"role",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-52*6e4).toISOString(),created_at:new Date(Date.now()-1728e5).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-conv-roofing-direct-shan",company_id:"roofing",title:"Shan Kumar",type:"direct",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-8*6e4).toISOString(),created_at:new Date(Date.now()-36e5).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-conv-drafting-all",company_id:"drafting",title:"Drafting review",type:"company",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-74*6e4).toISOString(),created_at:new Date(Date.now()-2592e5).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-conv-lumen-product",company_id:"lumen",title:"Lumen launch room",type:"custom",created_by:"basic-quest-user",last_message_at:new Date(Date.now()-38*6e4).toISOString(),created_at:new Date(Date.now()-216e5).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],cn=[{id:"msg-access-roofing-all",conversation_id:"msg-conv-roofing-all",company_id:"roofing",target_type:"all_company",target_id:"all"},{id:"msg-access-roofing-crew-role",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",target_type:"role",target_id:"staff-roofing"},{id:"msg-access-roofing-direct-basic",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-roofing-direct-shan",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",target_type:"profile",target_id:"shan"},{id:"msg-access-drafting-all",conversation_id:"msg-conv-drafting-all",company_id:"drafting",target_type:"all_company",target_id:"all"},{id:"msg-access-lumen-basic",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"profile",target_id:"basic-quest-user"},{id:"msg-access-lumen-role",conversation_id:"msg-conv-lumen-product",company_id:"lumen",target_type:"role",target_id:"admin-lumen"}],dn=[{id:"msg-roofing-all-1",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"abraham",body:"Morning check: Mesa HOA estimate needs photos before noon.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-48*6e4).toISOString(),updated_at:new Date(Date.now()-48*6e4).toISOString()},{id:"msg-roofing-all-2",conversation_id:"msg-conv-roofing-all",company_id:"roofing",sender_profile_id:"basic-quest-user",body:"Got it. I am linking the job files now.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-16*6e4).toISOString(),updated_at:new Date(Date.now()-16*6e4).toISOString()},{id:"msg-roofing-crew-1",conversation_id:"msg-conv-roofing-crew",company_id:"roofing",sender_profile_id:"shan",body:"@Joshua bring the permit packet when you head to Arroyo.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-52*6e4).toISOString(),updated_at:new Date(Date.now()-52*6e4).toISOString()},{id:"msg-roofing-direct-1",conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",sender_profile_id:"shan",body:"Can you confirm the roof access photo uploaded correctly?",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-8*6e4).toISOString(),updated_at:new Date(Date.now()-8*6e4).toISOString()},{id:"msg-drafting-all-1",conversation_id:"msg-conv-drafting-all",company_id:"drafting",sender_profile_id:"abraham",body:"Horizon package QA is ready. Please keep notes in this thread.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-74*6e4).toISOString(),updated_at:new Date(Date.now()-74*6e4).toISOString()},{id:"msg-lumen-product-1",conversation_id:"msg-conv-lumen-product",company_id:"lumen",sender_profile_id:"basic-quest-user",body:"Finance and CRM are live enough for internal walkthrough. Next focus is polish and permissions.",message_type:"text",deleted_at:"",created_at:new Date(Date.now()-38*6e4).toISOString(),updated_at:new Date(Date.now()-38*6e4).toISOString()}],mn=[{id:"msg-attachment-roofing-photo",conversation_id:"msg-conv-roofing-crew",message_id:"msg-roofing-crew-1",company_id:"roofing",bucket_id:"quest-message-attachments",object_path:"",file_name:"roof-access-photo.jpg",mime_type:"image/jpeg",size_bytes:184e3,preview_url:"",created_at:new Date(Date.now()-52*6e4).toISOString()}],pn=[{conversation_id:"msg-conv-roofing-all",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:new Date(Date.now()-10*6e4).toISOString()},{conversation_id:"msg-conv-roofing-crew",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-roofing-direct-shan",company_id:"roofing",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-drafting-all",company_id:"drafting",profile_id:"basic-quest-user",last_read_at:""},{conversation_id:"msg-conv-lumen-product",company_id:"lumen",profile_id:"basic-quest-user",last_read_at:""}],Li=[{id:"calendar-roofing-install",company_id:"roofing",title:"East ridge install window",description:"Crew visit for install prep and materials check.",event_type:"Install / field work",starts_at:`${h(1)}T14:00:00.000Z`,ends_at:`${h(1)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"job",linked_id:"job-east-ridge",assigned_profile_id:"abraham",created_by:"basic-quest-user"},{id:"calendar-roofing-estimate",company_id:"roofing",title:"Garage roof estimate",description:"Client walkthrough and estimate appointment.",event_type:"Estimate appointment",starts_at:`${h(3)}T16:00:00.000Z`,ends_at:`${h(3)}T17:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"shan",created_by:"basic-quest-user"},{id:"calendar-drafting-review",company_id:"drafting",title:"Plan review block",description:"Drafting team review for active plan updates.",event_type:"Internal meeting",starts_at:`${h(2)}T15:00:00.000Z`,ends_at:`${h(2)}T15:45:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"",created_by:"basic-quest-user"},{id:"calendar-lumen-product",company_id:"lumen",title:"Quest HQ product review",description:"Review workspace permissions, messages, and calendar flow.",event_type:"Company event",starts_at:`${h(4)}T18:00:00.000Z`,ends_at:`${h(4)}T19:00:00.000Z`,all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:"basic-quest-user",created_by:"basic-quest-user"}],i={route:null,session:be(Ve,null),profileDraft:be(hi,null),authReady:!1,authMode:"signin",jobs:C(Ja,qi).map(He),tasks:C(Wa,Fi).map(Je),files:C(Ya,Ei).map(ct),driveFolders:C(Ka,[]).map(En),forms:C(Ge,Ti).map(qt),formResponses:C(Xt,Oi).map(Tn),financeInvoices:C(Xa,Ri).map(Ca),financePayments:C(en,Pi).map(ja),financeExpenses:C(tn,Ni).map(Ia),financeVendors:C(an,xi).map(qa),notifications:C(aa,Ui).map(mt),messageConversations:C(na,ln).map(ue),messageAccess:C(ia,cn).map(K),messages:C(sa,dn).map(_e),messageReads:C(ra,pn).map(Mt),messageAttachments:C(oa,mn).map(Ie),calendarEvents:C(la,Li).map(We),timeEntries:be(ea,[]),activeTimer:be(ta,null),teamMembers:C(Ga,Mi).map(On),memberships:C(Za,Ai),profiles:[],subscriptions:[],workspaceReviews:[],roles:[],rolePermissions:[],roleAssignments:[],resourceAcl:[],fieldPermissions:[],companyInvites:[],joinRequests:[],auditEvents:[],companies:Fn(wt.map(ze)),activeCompanyId:localStorage.getItem(ye)||"",selectedJobId:"",selectedTaskId:"",selectedFileId:"",selectedFormId:"",selectedQuestionId:"",selectedFinanceInvoiceId:"",selectedFinanceExpenseId:"",selectedFinanceVendorId:"",selectedCalendarEventId:"",inviteLookup:null,expandedFormIds:new Set,formStartTemplateId:"",formStartTab:"blank",query:"",fileQuery:"",formQuery:"",crmQuery:"",stageFilter:"all",crmStageFilter:"all",crmOwnerFilter:"all",messageQuery:"",messageFilter:"all",selectedConversationId:"",messageRealtimeChannel:null,messageRealtimeKey:"",calendarScope:"company",calendarView:"week",calendarQuery:"",calendarTypeFilter:"all",calendarCursorDate:h(0),taskStatusFilter:"all",taskPriorityFilter:"all",fileCategoryFilter:"All categories",formTypeFilter:"all",formsTab:"library",formEditorTab:"questions",taskView:localStorage.getItem(wi)||"table",driveFolder:"home",driveView:localStorage.getItem($i)||"list",sync:{label:"Loading workspace...",mode:"loading"},dataLoaded:!1,dataLoading:!1,loginError:"",authMessage:"",toast:null,toastTimer:null,modal:"",accountMenuOpen:!1,notificationMenuOpen:!1,rolePreview:null},ma=document.getElementById("app");let Pa=null;tr();function tr(){rc(),window.addEventListener("popstate",p),document.addEventListener("click",pl),document.addEventListener("submit",gl),document.addEventListener("input",Vl),document.addEventListener("change",Bl),ar(),p()}async function ar(){if(i.session?.auth==="local-basic"){Qi(),i.authReady=!0;return}const e=I();if(!e?.auth){i.authReady=!0,i.loginError="Supabase auth is unavailable in this browser session.";return}try{const{data:t}=await e.auth.getSession();await rt(t?.session||null),e.auth.onAuthStateChange((a,n)=>{rt(n||null).finally(()=>{i.dataLoaded=!1,p()})})}catch(t){i.loginError=t.message||"Unable to initialize Supabase auth."}finally{i.authReady=!0,p()}}async function rt(e){if(!e?.user){i.session=null,localStorage.removeItem(Ve);return}const t=await nr(e.user);i.session=hd(e,t),cr(),$(Ve,i.session)}async function nr(e){const t={id:e.id,email:e.email||"",full_name:e.user_metadata?.full_name||e.email||"Quest user",role:"member",role_label:"Member",member_id:"",company_ids:[],avatar_url:"",approved:!1,email_verified:!!e.email_confirmed_at},a=I();if(!a)return t;const n=await a.from("profiles").select("*").eq("id",e.id).maybeSingle();return n.error||!n.data?t:dt(n.data,t)}function p(){if(i.route=$t(),!i.authReady){rr();return}if(i.route.name==="home"){ai(!1);return}if(i.route.name==="login"){ai(!0);return}if(sr(i.route)){k("/login?return_url="+encodeURIComponent(lc()),{replace:!0});return}if(or(),i.session?.auth==="supabase"&&i.dataLoaded&&!Ee().length){ir();return}const e=oc(i.route);if(e){k(e,{replace:!0});return}uc(i.route),as(i.route),i.route.params.get("account")==="profile"&&(i.modal="profile"),document.title=`${cc(i.route)} | ${M(u())} | Quest HQ`,ma.innerHTML=mr(i.route,zi(i.route))}function ir(){document.title="Company access pending | Quest HQ",ma.innerHTML=`
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
  `}function sr(e){return e.name==="login"||e.name==="home"?!1:!i.session}function rr(){document.title="Loading | Quest HQ",ma.innerHTML=`
    <main class="login-shell">
      <section class="login-panel">
        <div class="login-brand">
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Secure workspace</small></span>
        </div>
        ${v("Checking secure session...")}
      </section>
    </main>
  `}function or(){i.dataLoaded||i.dataLoading||(i.dataLoading=!0,lr().catch(()=>{i.sync={label:"Local fallback",mode:"local"}}).finally(()=>{i.dataLoaded=!0,i.dataLoading=!1,Y(),p()}))}async function lr(){if(i.session?.auth==="local-basic"){i.sync={label:"Demo mode",mode:"local"};return}const e=I();if(!e){i.sync={label:"Supabase unavailable",mode:"local"};return}const[t,a,n,s,o,l,c,d,f,g,D,V,O,ne,at,De,Vn,Bn,zn,Hn,Jn,Wn,Yn]=await Promise.all([e.from("companies").select("*").order("name",{ascending:!0}),e.from("jobs").select("*").order("updated_at",{ascending:!1}),e.from("tasks").select("*").order("updated_at",{ascending:!1}),e.from("job_files").select("*").is("deleted_at",null).order("created_at",{ascending:!1}),e.from("team_members").select("*").order("name",{ascending:!0}),e.from("company_memberships").select("*"),e.from("profiles").select("*"),e.from("company_subscriptions").select("*"),e.from("roles").select("*").order("priority",{ascending:!1}),e.from("role_permissions").select("*"),e.from("user_role_assignments").select("*"),e.from("resource_acl").select("*"),e.from("field_permissions").select("*"),e.from("company_invites").select("*").order("created_at",{ascending:!1}),e.from("company_join_requests").select("*").order("created_at",{ascending:!1}),e.from("audit_events").select("*").order("created_at",{ascending:!1}).limit(100),e.from("message_conversations").select("*").order("last_message_at",{ascending:!1}),e.from("message_conversation_access").select("*"),e.from("messages").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_attachments").select("*").order("created_at",{ascending:!0}).limit(500),e.from("message_reads").select("*"),e.from("calendar_events").select("*").order("starts_at",{ascending:!0}),e.from("notifications").select("*").order("created_at",{ascending:!1}).limit(200)]);let se=0;if(t.error||(i.companies=(t.data||[]).map(ze),se+=1),a.error||(i.jobs=(a.data||[]).map(He),se+=1),n.error||(i.tasks=(n.data||[]).map(Je),se+=1),s.error||(i.files=(s.data||[]).map(ct),se+=1),o.error||(i.teamMembers=(o.data||[]).map(On),se+=1),l.error||(i.memberships=(l.data||[]).map(Ht),se+=1),c.error||(i.profiles=(c.data||[]).map(Ft=>dt(Ft)),se+=1),d.error||(i.subscriptions=(d.data||[]).map(Jt),se+=1),f.error||(i.roles=(f.data||[]).map(Ue),se+=1),g.error||(i.rolePermissions=(g.data||[]).map(Ba)),D.error||(i.roleAssignments=(D.data||[]).map($s)),V.error||(i.resourceAcl=(V.data||[]).map(id)),O.error||(i.fieldPermissions=(O.data||[]).map(sd)),ne.error||(i.companyInvites=(ne.data||[]).map(Wt)),at.error||(i.joinRequests=(at.data||[]).map(Ss)),De.error||(i.auditEvents=De.data||[]),Vn.error||(i.messageConversations=(Vn.data||[]).map(ue)),Bn.error||(i.messageAccess=(Bn.data||[]).map(K)),zn.error||(i.messages=(zn.data||[]).map(_e)),Hn.error||(i.messageAttachments=(Hn.data||[]).map(Ie)),Jn.error||(i.messageReads=(Jn.data||[]).map(Mt)),Wn.error||(i.calendarEvents=(Wn.data||[]).map(We)),Yn.error||(i.notifications=(Yn.data||[]).map(mt)),An()){const Ft=await e.rpc("list_workspace_reviews").catch(Ra=>({error:Ra}));if(!Ft.error){i.workspaceReviews=(Ft.data||[]).map(it);const Ra=i.workspaceReviews.map(X=>ze({id:X.company_id,name:X.company_name,short_name:X.company_name})),Ws=i.workspaceReviews.map(X=>Jt({company_id:X.company_id,status:X.status,plan_code:X.plan_code,amount_cents:X.amount_cents,currency:X.currency,trial_ends_at:X.trial_ends_at,current_period_end:X.current_period_end,grace_ends_at:X.grace_ends_at}));i.companies=Fn(i.companies.concat(Ra)),i.subscriptions=ws(i.subscriptions.concat(Ws))}}i.sync=se?{label:"Quest Supabase live",mode:"live"}:{label:"Local fallback",mode:"local"}}function I(){return!window.supabase||typeof window.supabase.createClient!="function"?null:(Pa||(Pa=window.supabase.createClient(Qe.supabaseUrl,Qe.supabaseKey)),Pa)}function cr(){i.jobs=[],i.tasks=[],i.files=[],i.driveFolders=[],i.forms=[],i.formResponses=[],i.financeInvoices=[],i.financePayments=[],i.financeExpenses=[],i.financeVendors=[],i.notifications=[],i.messageConversations=[],i.messageAccess=[],i.messages=[],i.messageReads=[],i.messageAttachments=[],i.calendarEvents=[],i.timeEntries=[],i.activeTimer=null,i.teamMembers=[],i.memberships=[],i.profiles=[],i.subscriptions=[],i.workspaceReviews=[],i.roles=[],i.rolePermissions=[],i.roleAssignments=[],i.resourceAcl=[],i.fieldPermissions=[],i.companyInvites=[],i.joinRequests=[],i.auditEvents=[],i.companies=[],i.sync={label:"Loading secure workspace...",mode:"loading"}}function Qi(){i.jobs=C(Ja,qi).map(He),i.tasks=C(Wa,Fi).map(Je),i.files=C(Ya,Ei).map(ct),i.driveFolders=C(Ka,[]).map(En),i.forms=C(Ge,Ti).map(qt),i.formResponses=C(Xt,Oi).map(Tn),i.financeInvoices=C(Xa,Ri).map(Ca),i.financePayments=C(en,Pi).map(ja),i.financeExpenses=C(tn,Ni).map(Ia),i.financeVendors=C(an,xi).map(qa),i.notifications=C(aa,Ui).map(mt),i.messageConversations=C(na,ln).map(ue),i.messageAccess=C(ia,cn).map(K),i.messages=C(sa,dn).map(_e),i.messageReads=C(ra,pn).map(Mt),i.messageAttachments=C(oa,mn).map(Ie),i.calendarEvents=C(la,Li).map(We),i.timeEntries=be(ea,[]),i.activeTimer=be(ta,null),i.teamMembers=C(Ga,Mi).map(On),i.memberships=C(Za,Ai),i.profiles=[],i.subscriptions=[],i.workspaceReviews=[],i.roles=[],i.rolePermissions=[],i.roleAssignments=[],i.resourceAcl=[],i.fieldPermissions=[],i.companyInvites=[],i.joinRequests=[],i.auditEvents=[],i.companies=Fn(wt.map(ze)),i.sync={label:"Demo mode",mode:"local"}}function dr(){return`
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
  `}function G(e,t="symbol-icon"){return`<svg class="${r(t)}" aria-hidden="true" focusable="false"><use href="#${r(e)}"></use></svg>`}function Vi(e=i.route?.section||"jobs"){return bt.find(t=>t.id===e)?.symbol||"q-empty"}function Bi(e){const t=String(e||"").toLowerCase();return t.includes("job")||t.includes("pipeline")?"q-symbol-jobs":t.includes("task")||t.includes("review")?"q-symbol-tasks":t.includes("file")?"q-symbol-files":t.includes("form")?"q-symbol-forms":t.includes("account")||t.includes("customer")||t.includes("member")||t.includes("user")||t.includes("lead")?"q-symbol-crm":t.includes("invoice")||t.includes("collected")||t.includes("expense")||t.includes("net")||t.includes("outstanding")?"q-symbol-finance":t.includes("time")||t.includes("today")||t.includes("days")||t.includes("timer")||t.includes("entries")?"q-symbol-clock":t.includes("approval")||t.includes("access")?"q-symbol-approvals":Vi()}function mr(e,t){const a=b(),n=u(),s=$d(a);return`
    <div class="quest-app" data-route="${r(e.name)}">
      ${dr()}
      <header class="topbar">
        <div class="topbar-left">
          <a class="logo" href="${_(m("jobs",{},n))}" data-router aria-label="Quest HQ workspace">
            ${G("q-logo","brand-symbol")}
          </a>
          <div>
            <div class="brand-name">Quest HQ</div>
            <div class="brand-sub">${r(Qe.buildId)}</div>
          </div>
        </div>
        <div class="topbar-right">
          <label class="company-switch">
            ${G("q-company")}
            <select data-company-switch aria-label="Active company">
              ${vs().map(o=>`<option value="${r(o.id)}" ${o.id===n?"selected":""}>${r(wa(o))}</option>`).join("")}
            </select>
          </label>
          <label class="global-search">
            ${G("q-search")}
            <input data-global-search value="${r(i.query)}" placeholder="Search this company" />
          </label>
          <span class="sync-pill ${r(i.sync.mode)}" data-sync-state>${r(i.sync.label)}</span>
          <button class="btn" type="button" data-action="refresh-data" title="Refresh workspace data"><i class="ti ti-refresh"></i></button>
          ${pr(n)}
          <div class="account-menu ${i.accountMenuOpen?"open":""}">
            <button class="avatar-button" type="button" data-action="toggle-account-menu" aria-label="Open account menu" aria-expanded="${i.accountMenuOpen?"true":"false"}">
              ${me(a.profile,"avatar")}
            </button>
            <div class="account-popover">
              <strong>${r(a.profile.full_name)}</strong>
              <span>${r(a.profile.role_label)} - ${r(M(n))}</span>
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
      ${fr(n)}
      <div class="app-body">
        <aside class="deck" aria-label="Quest navigation">
          ${gr(e)}
        </aside>
        <main class="work-surface" id="workspace" tabindex="-1">
          ${t}
        </main>
      </div>
    </div>
    ${al(e,a)}
    ${Xi()}
  `}function pr(e){const t=vc(e),a=t.filter(n=>!n.read_at).length;return`
    <div class="notification-center ${i.notificationMenuOpen?"open":""}">
      <button class="icon-button notification-button" type="button" data-action="toggle-notifications" aria-label="Open notifications" aria-expanded="${i.notificationMenuOpen?"true":"false"}">
        <i class="ti ti-bell"></i>
        ${a?`<b>${r(String(Math.min(a,99)))}</b>`:""}
      </button>
      <div class="notification-popover" role="dialog" aria-label="Notifications">
        <div class="notification-head">
          <div><strong>Inbox</strong><span>${r(M(e))}</span></div>
          <button type="button" data-action="mark-all-notifications-read" ${a?"":"disabled"}>Mark all read</button>
        </div>
        <div class="notification-list">
          ${t.slice(0,12).map(n=>ur(n)).join("")||v("No notifications yet.")}
        </div>
      </div>
    </div>
  `}function ur(e){return`
    <button class="notification-item ${e.read_at?"read":"unread"}" type="button" data-action="open-notification" data-notification-id="${r(e.id)}">
      <span></span>
      <div>
        <small>${r(Nd(e.type))} - ${r(e.title)} - ${r(Oa(e.created_at))}</small>
        <strong>${r(e.body)}</strong>
      </div>
    </button>
  `}function fr(e){const t=va(e);return t?`
    <div class="role-preview-banner" style="--role-color:${r(t.color)}">
      <span></span>
      <div>
        <strong>Viewing as ${r(t.name)}</strong>
        <small>Permission preview only. Your real account has not changed.</small>
      </div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
  `:""}function gr(e){const t=u();return`
    <div class="company-card">
      <span class="company-card-symbol" style="--company-accent:${r($e(t))}">${G("q-company")}</span>
      <div>
        <strong>${r(M(t))}</strong>
        <small>${r(Ct(t))} workspace</small>
      </div>
    </div>
    ${["Workspace","Company","Operations"].map(a=>br(a,bt.filter(n=>n.group===a&&yr(n,t)).map(n=>n.status==="planned"?vr(n.symbol,n.label):_r(e,m(n.id,{},t),n.symbol,n.label,hr(n.id,t))))).join("")}
  `}function br(e,t){return`
    <section class="side-group">
      <div class="side-label">${r(e)}</div>
      <div class="side-items">${t.join("")}</div>
    </section>
  `}function _r(e,t,a,n,s=""){return`
    <a class="side-item ${dc(e,t)?"active":""}" href="${_(t)}" data-router>
      ${G(a)}
      <span>${r(n)}</span>
      ${s!==""?`<b>${r(String(s))}</b>`:""}
    </a>
  `}function vr(e,t){return`
    <button class="side-item planned" type="button" disabled aria-disabled="true">
      ${G(e)}
      <span>${r(t)}</span>
      <b>Planned</b>
    </button>
  `}function yr(e,t=u()){return e.status==="planned"?!0:!In(t)&&!["settings","users"].includes(e.id)?!1:T(e.permission||`${e.id}.view`,t)}function hr(e,t=u()){return e==="jobs"?U(t).length:e==="tasks"?te(t).length:e==="files"?qe(t).length:e==="forms"?ke(t).length:e==="crm"?ya(t).length:e==="finance"?we(t).length:e==="users"?ae(t).filter(a=>a.status==="active").length:e==="messages"?yc(t)||Ze(t).length:e==="calendar"?Dc(t).length:e==="time"?ds(t).focus.length:e==="approvals"?$n(t).length:e==="clock"&&Dt(t)?"On":""}function un(e,t){return`
    <nav class="tabbar compact-tabbar" aria-label="${r(e)}">
      ${t.map(([a,n,s])=>`<a class="${s?"active":""}" href="${_(a)}" data-router>${r(n)}</a>`).join("")}
    </nav>
  `}function zi(e){if(e.name==="command")return kr(u());if(e.name!=="company")return ti(e.name);const t=e.companyId;if(i.session?.auth==="supabase"&&!Ee().includes(t))return Sr(t);const a=bt.find(n=>n.id===e.section);if(a?.status!=="planned"){if(!In(t)&&e.section!=="settings")return wr(t);if(a?.permission&&!T(a.permission,t))return $r(t,a.permission)}return e.section==="jobs"?Cr(e,t):e.section==="tasks"?Ar(e,t):e.section==="files"?xr(e,t):e.section==="users"?Yr(e,t):e.section==="settings"?eo(e,t):e.section==="forms"?lo(t):e.section==="analytics"?Dr(e,t):e.section==="crm"?wo(e,t):e.section==="finance"?xo(e,t):e.section==="messages"?So(e,t):e.section==="team-chart"?Xr(t):e.section==="time"||e.section==="calendar"||e.section==="approvals"||e.section==="clock"?Vo(e,t):ti(e.section)}function wr(e){const t=qn(e);return`
    ${J(t?"Workspace awaiting approval":"Subscription required",t?"Your company workspace is created. Quest needs to approve billing/access before live company data opens.":"This company workspace needs an active subscription before paid modules can open.",`
      <button class="btn" type="button" data-action="open-profile"><i class="ti ti-user-circle"></i>Profile</button>
      <a class="btn btn-primary" href="${_(m("settings",{tab:"billing"},e))}" data-router><i class="ti ti-credit-card"></i>${t?"Review status":"Billing"}</a>
    `)}
    <section class="panel">
      ${L([["Company",M(e)],["Subscription",hs(e)],["Allowed area","Settings, profile, and sign out remain available"],["Next step",t?"Quest approval / billing activation":"Restore billing access"]])}
    </section>
  `}function $r(e,t){return`
    ${J("Access denied","Your role does not include the permission required for this module.",`
      <a class="btn" href="${_(m("settings",{tab:"roles"},e))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
    `)}
    <section class="panel">
      ${L([["Company",M(e)],["Required permission",t],["Your role",Ct(e)]])}
    </section>
  `}function Sr(e){return`
    ${J("Company access denied","This workspace is not in your active company memberships.",`
      <a class="btn" href="${_(m("jobs",{},u()))}" data-router><i class="ti ti-building"></i>Your workspace</a>
      <a class="btn btn-primary" href="${_("/login?mode=request")}" data-router><i class="ti ti-user-plus"></i>Request access</a>
    `)}
    <section class="panel">
      ${L([["Requested company",M(e)],["Access rule","Active company membership required"],["Your status",ee(e,b().profile.id)?.status?A(ee(e,b().profile.id).status):"No active membership"]])}
    </section>
  `}function kr(e){const t=U(e),a=te(e),n=a.filter(o=>["critical","urgent"].includes(o.priority)),s=qe(e);return`
    ${J("Company dashboard","Live context for this company workspace.",`
      <a class="btn" href="${_(m("files",{},e))}" data-router><i class="ti ti-folder"></i>Open drive</a>
      <a class="btn btn-primary" href="${_(m("jobs",{},e))}" data-router><i class="ti ti-briefcase"></i>Open jobs</a>
    `)}
    ${Sd([["Jobs",t.length],["Open tasks",a.filter(o=>o.status!=="done").length],["Urgent tasks",n.length],["Drive files",s.length]])}
    <section class="dashboard-grid">
      <article class="panel span-2">
        <div class="section-head">
          <div><h2>Priority work</h2><p>Tasks and jobs filtered by the active company.</p></div>
          <a class="btn" href="${_(m("tasks",{},e))}" data-router>Open tasks</a>
        </div>
        <div class="queue-list">
          ${a.slice(0,6).map(o=>Ma(o)).join("")||v("No tasks in this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Company scope</h2><p>Client-side filtering while auth is disabled.</p></div></div>
        ${L([["Company",M(e)],["Visible users",Me(e).length],["Auth mode","Supabase auth"],["RLS status","Ready for enforcement"]])}
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Job queue</h2><p>Workspace records without leaving the Quest shell.</p></div></div>
        <div class="queue-list">
          ${t.slice(0,8).map(o=>kd(o)).join("")||v("No jobs in this company yet.")}
        </div>
      </article>
    </section>
  `}function Dr(e,t){const a=e.jobId?x(e.jobId):null,n=a?[a]:U(t),s=te(t).filter(g=>!a||g.project_id===a.id),o=qe(t).filter(g=>!a||g.job_id===a.id),l=ke(t).filter(g=>!a||g.linked_job_id===a.id),c=s.filter(g=>g.status!=="done"),d=s.filter(g=>g.status!=="done"&&g.due&&new Date(g.due)<xa()),f=oe(n,"estimate_total");return`
    <section class="analytics-workspace">
      <section class="analytics-toolbar panel">
        <div>
          <strong>Analytics</strong>
          <span>${r(a?a.name:M(t))}</span>
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
          <strong>${r(S(f))}</strong>
          <small>${r(n.length)} visible job${n.length===1?"":"s"}</small>
        </article>
        <article class="panel analytics-score">
          <span>Drive and forms</span>
          <strong>${r(o.length+l.length)}</strong>
          <small>${r(o.length)} files / ${r(l.length)} forms</small>
        </article>
        <article class="panel analytics-score">
          <span>Completion</span>
          <strong>${r(Sm(s.filter(g=>g.status==="done").length,s.length))}</strong>
          <small>${r(s.filter(g=>g.status==="done").length)} done of ${r(s.length)}</small>
        </article>
        <article class="panel analytics-main">
          <div class="section-head"><div><h2>Job health</h2><p>Company-scoped operational summary.</p></div></div>
          <div class="analytics-table">
            <div class="analytics-row head"><span>Job</span><span>Stage</span><span>Tasks</span><span>Files</span><span>Value</span></div>
            ${n.map(g=>`
              <a class="analytics-row" href="${_(m("analytics",{job_id:g.id},t))}" data-router>
                <span><strong>${r(g.name)}</strong><small>${r(g.client_name||M(t))}</small></span>
                <span>${r(g.stage)}</span>
                <span>${r(ka(g.id))}</span>
                <span>${r(zt(g.id))}</span>
                <span>${r(S(g.estimate_total))}</span>
              </a>
            `).join("")||v("No jobs to analyze yet.")}
          </div>
        </article>
        <article class="panel analytics-side">
          <div class="section-head"><div><h2>Task status</h2><p>Breakdown for this scope.</p></div></div>
          <div class="stage-bars">
            ${vt.map(g=>{const D=s.filter(V=>V.status===g).length;return`<div><span>${r(ge(g))}</span><b><i style="width:${r(Hs(D,s.length))}%"></i></b><strong>${r(D)}</strong></div>`}).join("")}
          </div>
        </article>
        <article class="panel span-3">
          <div class="section-head"><div><h2>Priority queue</h2><p>Highest risk tasks first.</p></div></div>
          <div class="queue-list">
            ${s.filter(g=>g.status!=="done").sort((g,D)=>Ke(D.priority)-Ke(g.priority)).slice(0,8).map(g=>Ma(g)).join("")||v("No open tasks in this scope.")}
          </div>
        </article>
      </section>
    </section>
  `}function Cr(e,t){const a=mc(e.params.get("tab")),n=je();return`
    ${J("Jobs","Company job records, clients, scope, and linked work.",`
      <a class="btn" href="${_(m("files",n?{job_id:n.id}:{},t))}" data-router><i class="ti ti-folder"></i>Drive</a>
      <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add job</button>
    `)}
    <section class="job-toolbar">
      <label>
        <span>Stage</span>
        <select data-stage-filter>
          ${["all"].concat(_t).map(s=>`<option value="${r(s)}" ${i.stageFilter===s?"selected":""}>${r(s==="all"?"All stages":s)}</option>`).join("")}
        </select>
      </label>
      <div class="selected-job-chip">
        <span>Selected job</span>
        <strong>${n?r(n.name):"No job selected"}</strong>
      </div>
    </section>
    <nav class="tabbar" aria-label="Job sections">
      ${Si.map(s=>`<a class="${s===a?"active":""}" href="${_(m("jobs",{tab:s,...n?{job_id:n.id}:{}},t))}" data-router>${r(pc(s))}</a>`).join("")}
    </nav>
    ${jr(a,t,n)}
  `}function jr(e,t,a){return e==="pipeline"?Kn(t):e==="list"?Ir(t):e==="profile"?qr(t,a):Kn(t)}function Kn(e){const t=cs(e);return`
    <section class="job-board">
      ${_t.map(a=>{const n=t.filter(s=>s.stage===a);return`
          <article class="job-lane">
            <h2><span>${r(a)}</span><b>${n.length}</b></h2>
            ${n.map(s=>Dd(s)).join("")||'<div class="lane-empty">No jobs</div>'}
          </article>
        `}).join("")}
    </section>
  `}function Ir(e){const t=cs(e);return`
    <section class="panel">
      <div class="section-head"><div><h2>Job list</h2><p>${t.length} visible job${t.length===1?"":"s"}</p></div></div>
      <div class="data-table jobs-table">
        <div class="table-head"><span>Job</span><span>Stage</span><span>Priority</span><span>Owner</span><span>Tasks</span><span>Value</span></div>
        ${t.map(a=>`
          <button class="table-row ${a.id===i.selectedJobId?"active":""}" type="button" data-select-job="${r(a.id)}">
            <span><strong>${r(a.name)}</strong><small>${r(a.client_name||"No client")} - ${r(a.site_address||"No address")}</small></span>
            <span>${r(a.stage)}</span>
            <span>${xn(a.priority)}</span>
            <span>${r(a.owner_name||"Unassigned")}</span>
            <span>${r(ka(a.id))}</span>
            <span>${S(a.estimate_total)}</span>
          </button>
        `).join("")||v("No jobs match this view.")}
      </div>
    </section>
  `}function qr(e,t){return t?`
    <section class="profile-layout">
      <article class="panel job-profile-hero">
        <div class="hero-image"></div>
        <div class="hero-content">
          <span>${r(M(e))} - ${r(t.job_type)}</span>
          <h2>${r(t.name)}</h2>
          <p>${r(t.scope||"No scope written yet.")}</p>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><div><h2>Job controls</h2><p>Job context feeds company tasks and drive folders.</p></div></div>
        ${L([["Client",t.client_name||"No client"],["Contact",t.contact_name||"No contact"],["Owner",t.owner_name||"Unassigned"],["Stage",t.stage],["Priority",t.priority],["Estimate",S(t.estimate_total)]])}
        <div class="button-grid">
          <a class="btn btn-primary" href="${_(m("tasks",{job_id:t.id},e))}" data-router>Open tasks</a>
          <button class="btn" type="button" data-action="open-job-form" data-mode="edit" data-job-id="${r(t.id)}">Edit job</button>
        </div>
      </aside>
      <article class="panel span-2">
        <div class="section-head"><div><h2>Linked workspace</h2><p>Native Quest modules scoped to this job.</p></div></div>
        <div class="linked-grid">
          ${Tt(m("tasks",{job_id:t.id},e),"ti-list-check","Tasks",`${ka(t.id)} linked tasks`)}
          ${Tt(m("files",{job_id:t.id},e),"ti-folder","Files",`${zt(t.id)} files`)}
          ${Tt(m("forms",{job_id:t.id},e),"ti-clipboard-list","Forms","Inspections and surveys")}
          ${Tt(m("analytics",{job_id:t.id},e),"ti-chart-bar","Dashboard","Job health")}
        </div>
      </article>
    </section>
  `:v("Create a job to see the profile workspace.")}function Mr(e,t){const a=t||md(e);return`
    <form class="job-editor" data-job-form>
      <input type="hidden" name="id" value="${r(a.id||"")}" />
      <div class="section-head span-2">
        <div><h2>${t?"Edit job":"Create job"}</h2><p>Creates the company job container for tasks, files, forms, and reporting.</p></div>
      </div>
      ${q("Workspace name","name",a.name,!0)}
      ${R("Company","company_id",e,vs().map(n=>[n.id,wa(n)]))}
      ${q("Client","client_name",a.client_name)}
      ${q("Contact","contact_name",a.contact_name)}
      ${q("Account owner","owner_name",a.owner_name)}
      ${q("Job type","job_type",a.job_type||"Roofing")}
      ${R("Business status","stage",a.stage||"Lead",_t.map(n=>[n,n]))}
      ${R("Client urgency","priority",a.priority||"Medium",["Low","Medium","High","Urgent"].map(n=>[n,n]))}
      ${q("Estimate total","estimate_total",a.estimate_total||0,!1,"number")}
      ${q("Invoice total","invoice_total",a.invoice_total||0,!1,"number")}
      ${q("Site address","site_address",a.site_address,!1,"text","span-2")}
      ${ve("Scope","scope",a.scope,"span-2")}
      ${ve("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save job</button>
        ${t?`<button class="btn danger" type="button" data-action="delete-job" data-job-id="${r(t.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function Ar(e,t){const a=e.jobId?x(e.jobId):null,n=Zc(t,a?.id);return`
    ${J(a?`${a.name} tasks`:"Tasks","Native Quest task execution backed by the company task table.",`
      <a class="btn" href="${_(m("jobs",a?{tab:"profile",job_id:a.id}:{},t))}" data-router><i class="ti ti-briefcase"></i>Jobs</a>
      <a class="btn btn-primary" href="${_(m("tasks",{...a?{job_id:a.id}:{},new:"1"},t))}" data-router><i class="ti ti-plus"></i>New task</a>
    `)}
    ${Fr(t,a)}
    <section class="task-layout task-layout-flat">
      <article class="panel task-main">
        ${i.taskView==="board"?Tr(t,n):Er(t,n)}
      </article>
    </section>
  `}function Fr(e,t){return`
    <section class="workspace-toolbar">
      <label>
        <span>Job</span>
        <select data-task-job-filter>
          <option value="">All jobs</option>
          ${U(e).map(n=>`<option value="${r(n.id)}" ${t?.id===n.id?"selected":""}>${r(n.name)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select data-task-status-filter>
          ${["all"].concat(vt).map(n=>`<option value="${r(n)}" ${i.taskStatusFilter===n?"selected":""}>${r(n==="all"?"All statuses":ge(n))}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select data-task-priority-filter>
          ${["all"].concat(Ut).map(n=>`<option value="${r(n)}" ${i.taskPriorityFilter===n?"selected":""}>${r(n==="all"?"All priorities":A(n))}</option>`).join("")}
        </select>
      </label>
      <div class="segmented" role="group" aria-label="Task view">
        <button class="${i.taskView==="table"?"active":""}" type="button" data-action="set-task-view" data-view="table"><i class="ti ti-table"></i>Table</button>
        <button class="${i.taskView==="board"?"active":""}" type="button" data-action="set-task-view" data-view="board"><i class="ti ti-layout-kanban"></i>Board</button>
      </div>
    </section>
  `}function Er(e,t){return`
    <div class="data-table task-table">
      <div class="table-head"><span>Task</span><span>Job</span><span>Assignee</span><span>Priority</span><span>Status</span><span>Due</span></div>
      ${t.map(a=>`
        <button class="table-row ${a.id===i.selectedTaskId?"active":""}" type="button" data-select-task="${r(a.id)}">
          <span><strong>${r(a.title)}</strong><small>${r(a.description||tt(a.type))}</small></span>
          <span>${r(x(a.project_id)?.name||"Company task")}</span>
          <span>${r(H(a.assignee_id))}</span>
          <span>${ks(a.priority)}</span>
          <span>${Ds(a.status)}</span>
          <span>${E(a.due)}</span>
        </button>
      `).join("")||v("No tasks match this workspace view.")}
    </div>
  `}function Tr(e,t){return`
    <div class="task-board">
      ${vt.map(a=>{const n=t.filter(s=>s.status===a);return`
          <section class="task-column">
            <h2><span>${r(ge(a))}</span><b>${n.length}</b></h2>
            ${n.map(s=>`
              <button class="task-card priority-${r(s.priority)}" type="button" data-select-task="${r(s.id)}">
                <strong>${r(s.title)}</strong>
                <span>${r(x(s.project_id)?.name||M(e))}</span>
                <small>${r(H(s.assignee_id))} - ${E(s.due)}</small>
              </button>
            `).join("")||'<div class="lane-empty">No tasks</div>'}
          </section>
        `}).join("")}
    </div>
  `}function Or(e,t){return t?`
    <div class="section-head">
      <div><h2>${r(t.title)}</h2><p>${r(x(t.project_id)?.name||M(e))}</p></div>
      <a class="btn" href="${_(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:t.id,edit:"1"},e))}" data-router>Edit</a>
    </div>
    ${L([["Status",ge(t.status)],["Priority",A(t.priority)],["Type",tt(t.type)],["Assignee",H(t.assignee_id)],["Due",E(t.due)],["Company ID",t.company_id],["Project ID",t.project_id||"Company-level task"]])}
    <div class="detail-copy">
      <strong>Description</strong>
      <p>${r(t.description||"No description yet.")}</p>
    </div>
  `:`
      <div class="section-head"><div><h2>Task detail</h2><p>Select a task or create the first one.</p></div></div>
      ${v("No task selected.")}
    `}function Gn(e,t,a){const n=a||pd(e,t?.id||"");return`
    <form class="task-form" data-task-form>
      <input type="hidden" name="id" value="${r(a?n.id:"")}" />
      <div class="section-head">
        <div><h2>${a?"Edit task":"New task"}</h2><p>Writes company_id and optional project_id directly to Quest tasks.</p></div>
      </div>
      ${q("Task title","title",n.title,!0)}
      ${R("Job","project_id",n.project_id||"",[["","Company-level task"]].concat(U(e).map(s=>[s.id,s.name])))}
      ${R("Status","status",n.status,vt.map(s=>[s,ge(s)]))}
      ${R("Priority","priority",n.priority,Ut.map(s=>[s,A(s)]))}
      ${R("Type","type",n.type,ki.map(s=>[s,tt(s)]))}
      ${R("Assignee","assignee_id",n.assignee_id,Me(e).map(s=>[s.id,H(s.id)]))}
      ${q("Due date","due",n.due||h(1),!0,"date")}
      ${ve("Description","description",n.description)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save task</button>
        ${a?`<button class="btn danger" type="button" data-action="delete-task" data-task-id="${r(a.id)}">Delete</button>`:""}
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `}function xr(e,t){const a=e.params.get("folder")||i.driveFolder||"home";i.driveFolder=a;const n=e.jobId?x(e.jobId):null,s=Zd(t,a,n?.id||"");return`
    <section class="tool-page drive-page">
      <section class="drive-app panel">
        <header class="drive-topbar">
          <div class="drive-location">
            <span class="drive-logo"><i class="ti ti-folder"></i></span>
            <div>
              <strong>${r(n?n.name:"Company Drive")}</strong>
              <small>${r(n?`${n.client_name||M(t)} file workspace`:`${M(t)} file manager`)}</small>
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
                <a href="${_(m("files",{},t))}" data-router>${r(M(t))}</a>
                ${a!=="home"?Gd(t,a,n):""}
                ${n?`<span>/</span><strong>${r(n.name)}</strong>`:""}
              </nav>
              <div class="drive-compact-controls">
                <div class="segmented" role="group" aria-label="Drive view">
                  <button class="${i.driveView==="grid"?"active":""}" type="button" data-action="set-drive-view" data-view="grid"><i class="ti ti-layout-grid"></i>Icons</button>
                  <button class="${i.driveView==="list"?"active":""}" type="button" data-action="set-drive-view" data-view="list"><i class="ti ti-list-details"></i>Details</button>
                </div>
              </div>
            </section>
            ${Rr(t,a,n,s)}
          </div>
        </div>
      </section>
    </section>
  `}function Rr(e,t,a,n){const s=Yd(e,t,a),o=s.map(c=>({kind:"folder",...c})).concat(n.map(c=>({kind:"file",file:c}))),l=a?a.name:t==="home"?"This folder":ce(t);return`
    <section class="drive-section-title">
      <div><h3>${r(l)}</h3><span>${s.length} folder${s.length===1?"":"s"} / ${n.length} file${n.length===1?"":"s"}</span></div>
    </section>
    ${i.driveView==="list"?Pr(o):Nr(o)}
  `}function Pr(e){return`
    <div class="explorer-table" role="table" aria-label="File explorer">
      <div class="explorer-head" role="row">
        <span>Name</span>
        <span>Date modified</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      ${e.map(t=>t.kind==="folder"?Lr(t):Qr(t.file)).join("")||v("This folder is empty.")}
    </div>
  `}function Nr(e){return`
    <section class="drive-folder-grid explorer-grid">
      ${e.map(t=>t.kind==="folder"?Ur(t):Br(t.file)).join("")||v("This folder is empty.")}
    </section>
  `}function Ur(e){return`
    <a class="drive-folder-card explorer-folder" href="${r(e.href)}" data-router>
      <span class="drive-folder-icon">${Qs(e,e.name)}</span>
      <strong>${r(e.name)}</strong>
      <em>${r(e.countLabel||"0 items")}</em>
    </a>
  `}function Lr(e){return`
    <a class="explorer-row folder-row-live" href="${r(e.href)}" data-router role="row">
      <span class="explorer-name"><span class="file-type folder">${Qs(e,e.name)}</span><strong>${r(e.name)}</strong></span>
      <span>${r(e.updatedLabel||"")}</span>
      <span>Folder</span>
      <span>${r(e.countLabel||"")}</span>
    </a>
  `}function Qr(e){return`
    <button type="button" class="explorer-row ${e.id===i.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}" role="row">
      <span class="explorer-name">${Vr(e)}<strong>${r(e.file_name)}</strong></span>
      <span>${E(e.updated_at||e.created_at)}</span>
      <span>${r(Se(e))}</span>
      <span>${Qn(e.size_bytes)}</span>
    </button>
  `}function Vr(e){return`
    <span class="file-type ${r(Un(e))}">
      ${Vs(e,Se(e))}
      <small>${r(Os(e))}</small>
    </span>
  `}function Br(e){return`
    <button type="button" class="file-card-live ${e.id===i.selectedFileId?"active":""}" data-action="select-file" data-file-id="${r(e.id)}">
      <span class="file-thumb">${Ln(e)}</span>
      <strong>${r(e.file_name)}</strong>
      <span>${r(Se(e))} / ${Qn(e.size_bytes)}</span>
    </button>
  `}function zr(e,t){return`
    <section class="file-viewer-layout">
      <div class="file-viewer-stage">
        ${Hr(e)}
      </div>
      <aside class="file-viewer-meta">
        <div class="file-open-head">
          ${Ln(e)}
          <div>
            <strong>${r(e.file_name)}</strong>
            <span>${r(Se(e))} / ${Qn(e.size_bytes)}</span>
          </div>
        </div>
        <div class="file-detail-list">
          ${Ce("Location",ce(e.folder))}
          ${Ce("Job",x(e.job_id)?.name||"Company shared")}
          ${Ce("Uploaded by",e.uploaded_by_label||"Quest HQ")}
          ${Ce("Modified",E(e.updated_at||e.created_at))}
          ${Ce("Storage",e.object_path||"Metadata only")}
        </div>
        <div class="file-detail-actions">
          <button class="btn" type="button" data-action="download-file" data-file-id="${r(e.id)}"><i class="ti ti-download"></i>Download</button>
          <button class="btn danger" type="button" data-action="delete-file" data-file-id="${r(e.id)}"><i class="ti ti-trash"></i>Delete</button>
        </div>
      </aside>
    </section>
  `}function Hr(e){const t=Un(e);return e.signed_url&&t==="image"?`<img class="file-preview-media" src="${r(e.signed_url)}" alt="" />`:e.signed_url&&t==="pdf"?`<iframe class="file-preview-frame" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:e.signed_url&&t==="text"?`<iframe class="file-preview-frame text" src="${r(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:["doc","sheet"].includes(t)&&e.signed_url?`<iframe class="file-preview-frame" src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(e.signed_url)}" title="${r(e.file_name)}"></iframe>`:`
    <div class="file-preview-empty">
      ${Ln(e,!0)}
      <strong>${r(Se(e))} preview</strong>
      <p>${r(e.object_path?"Preview will load when a signed file URL is available.":"This is a metadata-only file record. Upload the actual file object to preview it here.")}</p>
      ${e.notes?`<pre>${r(e.notes)}</pre>`:""}
    </div>
  `}function Jr(){const e=u(),t=i.route||$t(),a=t.params.get("folder")||i.driveFolder||"home",n=t.jobId?x(t.jobId):null;return F("Drive","New folder",`
    <form class="compact-tool-form" data-folder-form>
      <label><span>Folder name</span><input name="name" placeholder="Folder name" required autofocus /></label>
      <input type="hidden" name="company_id" value="${r(e)}" />
      <input type="hidden" name="parent_key" value="${r(Ts(a,n))}" />
      <div class="file-upload-log">
        <strong>Location</strong>
        <span>${r(a==="home"?M(e):n?.name||ce(a))}</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create folder</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"task-modal")}function Wr(){const e=u(),t=i.route?.params?.get("folder")||(i.driveFolder==="home"?"shared":i.driveFolder),a=i.route?.jobId||"";return`
    <div class="modal-overlay">
      <div class="modal-panel file-modal-panel" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div class="modal-head">
          <div><div class="eyebrow">${r(M(e))} Drive</div><h2 id="upload-title">Upload files</h2></div>
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
          ${q("Metadata-only file name","file_name","")}
          ${R("Folder","folder",t,ym(e))}
          ${R("Job","job_id",a,[["","Company shared file"]].concat(U(e).map(n=>[n.id,n.name])))}
          ${R("Category","category",ce(t),er.filter(n=>n!=="All categories").map(n=>[n,n]))}
          ${q("Uploaded by","uploaded_by_label",b().profile.full_name||"Quest HQ")}
          ${ve("Notes","notes","","span-2")}
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
  `}function Yr(e,t){const a=ae(t),n=["members","access"].includes(e.params.get("tab"))?e.params.get("tab"):"members",s=i.joinRequests.filter(d=>d.company_id===t&&d.status==="pending"),o=T("users.manage",t),l=a.filter(d=>d.status==="active"),c=a.filter(d=>d.status!=="active");return`
    ${J("Users","Company members, roles, workers, and access context.",`
      <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite user</button>
      <a class="btn" href="${_(m("settings",{tab:"roles"},t))}" data-router><i class="ti ti-shield-lock"></i>Roles</a>
      <a class="btn" href="${_(m("settings",{tab:"access"},t))}" data-router><i class="ti ti-settings"></i>Access settings</a>
    `)}
    ${un("Users sections",[[m("users",{tab:"members"},t),"Members",n==="members"],[m("users",{tab:"access"},t),"Access",n==="access"]])}
    ${n==="members"?`
      <section class="metric-grid operations-metrics">
        ${j("Active users",l.length)}
        ${j("Pending",a.filter(d=>d.status==="pending").length+s.length)}
        ${j("Disabled/left",c.filter(d=>d.status!=="pending").length)}
        ${j("Roles",he(t).length)}
      </section>
      <section class="users-grid">
        ${a.map(d=>`
          <article class="user-card ${d.status!=="active"?"muted":""}">
            ${me({full_name:Lt(d),email:d.email,avatar_url:d.avatar_url},"avatar")}
            <div>
              <strong>${r(Lt(d))}</strong>
              <span>${r(Hi(d))}</span>
              <small>${r(d.role_label)} / ${r(A(d.status))}</small>
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
          ${a.map(d=>Kr(t,d,o)).join("")||v("No users assigned to this company yet.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head">
          <div><h2>Invites</h2><p>Copy a secure invite code or link for a specific email address.</p></div>
          <button class="btn btn-primary" type="button" data-action="open-invite-form" ${o?"":"disabled"}><i class="ti ti-user-plus"></i>Invite</button>
        </div>
        <div class="access-invite-list">
          ${Qc(t).map(d=>Zr(d,o)).join("")||v("No pending invites.")}
        </div>
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Approve requests into this company workspace or reject them.</p></div></div>
        <div class="access-request-list">
          ${s.map(d=>Gr(d,o)).join("")||v("No pending join requests.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access model</h2><p>Membership is company-scoped; UI hiding is convenience, RLS is the real privacy layer.</p></div></div>
        ${L([["Tenant key","company_id on jobs, tasks, files, forms, users, settings"],["Privacy status","Supabase Auth + RLS"],["Your role",Ct(t)],["Can manage users",o?"Yes":"No"]])}
      </article>
    </section>
    `}
  `}function Kr(e,t,a){const n=he(e),s=t.role_id||lt(e,t.role)||n[0]?.id||"",o=t.profile_id&&ys(e,t.profile_id),l=a&&t.profile_id&&!o;return`
    <article class="access-user-row ${t.status!=="active"?"muted":""}">
      ${me({full_name:Lt(t),email:t.email,avatar_url:t.avatar_url},"avatar")}
      <div class="access-user-main">
        <strong>${r(Lt(t))}</strong>
        <span>${r(Hi(t))} / ${r(A(t.status))}</span>
        ${o?'<small class="access-note">Last active Owner - promote another Owner before changing this access.</small>':""}
      </div>
      <form class="access-role-form" data-user-role-form>
        <input type="hidden" name="company_id" value="${r(e)}" />
        <input type="hidden" name="profile_id" value="${r(t.profile_id)}" />
        <select name="role_id" ${l?"":"disabled"}>
          ${n.map(c=>`<option value="${r(c.id)}" ${c.id===s?"selected":""}>${r(c.name)}</option>`).join("")}
        </select>
        <select name="membership_status" ${l?"":"disabled"}>
          ${["active","pending","disabled","left"].map(c=>`<option value="${r(c)}" ${c===t.status?"selected":""}>${r(A(c))}</option>`).join("")}
        </select>
        <button class="btn" type="submit" ${l?"":"disabled"}>Save</button>
      </form>
    </article>
  `}function Gr(e,t){const a=e.requested_email||Ae(e.profile_id)?.email||e.profile_id||"Requester";return`
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
  `}function Zr(e,t){const a=et(e.company_id,e.role_id),n=e.expires_at&&Date.parse(e.expires_at)<Date.now();return`
    <article class="access-invite-row ${n?"muted":""}">
      <div>
        <strong>${r(e.email)}</strong>
        <span>${r(a?.name||"Member")} / ${n?"Expired":`Expires ${E(e.expires_at)}`}</span>
        ${e.token?`<code class="invite-code">${r(e.token)}</code>`:""}
      </div>
      <div>
        <button class="btn" type="button" data-action="copy-invite-code" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-key"></i>Copy code</button>
        <button class="btn" type="button" data-action="copy-invite-link" data-invite-id="${r(e.id)}" ${t&&e.token?"":"disabled"}><i class="ti ti-link"></i>Copy link</button>
        <button class="btn danger" type="button" data-action="revoke-invite" data-invite-id="${r(e.id)}" ${t?"":"disabled"}>Revoke</button>
      </div>
    </article>
  `}function Lt(e){const t=String(e.name||"").trim(),a=String(e.email||"").trim();if(t&&!Zt(t))return t;if(a&&!Zt(a))return a.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,s=>s.toUpperCase());const n=String(e.role||"").toLowerCase();return n==="owner"?"Workspace owner":n==="admin"?"Workspace admin":n==="developer"?"Developer":`${e.role_label||"Workspace"} user`}function Hi(e){const t=String(e.email||"").trim();if(t&&!Zt(t))return t;const a=String(e.profile_id||e.member_id||"").trim();return a?`ID ${Js(a)}`:"No email on profile"}function Xr(e){const t=Me(e),a=t.filter(n=>!n.supervisor_id||!t.some(s=>s.id===n.supervisor_id));return`
    <section class="tool-page team-chart-page">
      ${J("Team chart","Reporting lines, roles, and company coverage for this workspace.",`
        <a class="btn" href="${_(m("users",{},e))}" data-router><i class="ti ti-users"></i>Users</a>
        <a class="btn btn-primary" href="${_(m("settings",{tab:"team"},e))}" data-router><i class="ti ti-settings"></i>Worker settings</a>
      `)}
      <section class="metric-grid operations-metrics">
        ${j("Members",t.length)}
        ${j("Leads",a.length)}
        ${j("Open tasks",te(e).filter(Sn).length)}
        ${j("Active timer",Dt(e)?"Yes":"No")}
      </section>
      <section class="panel">
        <div class="section-head"><div><h2>Reporting chart</h2><p>Supervisor links are local/basic until Auth and RLS are restored.</p></div></div>
        <div class="team-tree">
          ${a.map(n=>Ji(e,n,t)).join("")||v("No workers assigned.")}
        </div>
      </section>
    </section>
  `}function Ji(e,t,a,n=0){const s=a.filter(o=>o.supervisor_id===t.id);return`
    <article class="team-node" style="--depth:${n}">
      <div class="team-node-card">
        ${me({full_name:t.full_name,avatar_url:t.avatar_url},"avatar")}
        <span><strong>${r(t.full_name)}</strong><small>${r(Vt(e,t.id))}</small></span>
        <b>${te(e).filter(o=>o.assignee_id===t.id&&Sn(o)).length} open</b>
      </div>
      ${s.length?`<div class="team-node-children">${s.map(o=>Ji(e,o,a,n+1)).join("")}</div>`:""}
    </article>
  `}function eo(e,t){const a=ha(t),n=["company","billing","roles","access","team"].includes(e.params.get("tab"))?e.params.get("tab"):"company";return`
    ${J("Settings","Company settings, roles, approvals, and admin controls.","")}
    ${un("Settings sections",[[m("settings",{tab:"company"},t),"Company",n==="company"],[m("settings",{tab:"billing"},t),"Billing",n==="billing"],[m("settings",{tab:"roles"},t),"Roles",n==="roles"],[m("settings",{tab:"access"},t),"Access",n==="access"],[m("settings",{tab:"team"},t),"Workers",n==="team"]])}
    <section class="dashboard-grid compact-settings-grid">
      ${n==="company"?`
      <article class="panel">
        <div class="section-head"><div><h2>Company</h2><p>Workspace identity.</p></div></div>
        ${L([["Name",M(t)],["Company ID",t],["Color",a?.color||$e(t)],["Visible jobs",U(t).length]])}
      </article>
      `:""}
      ${n==="billing"?to(t):""}
      ${n==="roles"?io(t):""}
      ${n==="access"?`
      <article class="panel">
        <div class="section-head"><div><h2>Access</h2><p>Memberships, invites, and join requests.</p></div></div>
        ${L([["Auth switch","Enabled"],["Local login","Disabled"],["Isolation","Server-enforced when migration is applied"],["Active memberships",String(i.memberships.filter(s=>s.company_id===t&&s.status==="active").length)],["Disabled/left",String(i.memberships.filter(s=>s.company_id===t&&["disabled","left"].includes(s.status)).length)],["Invites",String(i.companyInvites.filter(s=>s.company_id===t&&s.status==="pending").length)]])}
      </article>
      <article class="panel">
        <div class="section-head"><div><h2>Join requests</h2><p>Hybrid onboarding queue for this company.</p></div></div>
        <div class="finance-compact-list">
          ${i.joinRequests.filter(s=>s.company_id===t).map(s=>Le(s.requested_email||s.profile_id,s.message||"Access request",A(s.status),s.created_at)).join("")||v("No pending company approvals.")}
        </div>
      </article>
      <article class="panel span-3">
        <div class="section-head"><div><h2>Access history</h2><p>Recent membership, invite, and role changes for this company.</p></div></div>
        <div class="access-audit-list">
          ${Vc(t).slice(0,8).map(Bc).join("")||v("No access audit events yet.")}
        </div>
      </article>
      `:""}
      ${n==="team"?`
      <article class="panel span-3">
        <div class="section-head"><div><h2>Workers and roles</h2><p>Company users stay here, not inside TaskManagement.</p></div></div>
        <div class="team-chart">
          ${Me(t).map(s=>`<div><strong>${r(s.full_name)}</strong><span>${r(Vt(t,s.id))}</span></div>`).join("")||v("No workers assigned.")}
        </div>
      </article>
      `:""}
    </section>
  `}function to(e){const t=jt(e),a=qn(e);return`
    <article class="panel">
      <div class="section-head">
        <div><h2>${a?"Workspace awaiting approval":"Subscription"}</h2><p>${a?"Quest needs to approve billing/access before live company data opens.":"$300/month company workspace billing gate."}</p></div>
        <button class="btn btn-primary" type="button" data-action="start-checkout" ${a?"disabled":""}><i class="ti ti-credit-card"></i>${a?"Billing pending":"Start subscription"}</button>
      </div>
      ${L([["Plan","$300/month company workspace"],["Status",hs(e)],["Stripe customer",t?.stripe_customer_id||"Not connected"],["Approval",a?"Waiting for Quest review":"Ready"],["Renewal / trial",t?.current_period_end||t?.trial_ends_at?E(t.current_period_end||t.trial_ends_at):"Pending"]])}
    </article>
    <article class="panel">
      <div class="section-head"><div><h2>Billing gate</h2><p>Paid modules open only after approval or an active billing state.</p></div></div>
      ${L([["Workspace access",In(e)?"Allowed":"Suspended"],["Finance/files privacy","Requires Auth + RLS"],["Seat billing","Tracked later; not charged in v1"]])}
    </article>
    ${An()?ao(e):""}
  `}function ao(e){const t=td(),a=t.filter(n=>n.status==="pending_review").length;return`
    <article class="panel span-3">
      <div class="section-head">
        <div><h2>Quest approval console</h2><p>${a} workspace${a===1?"":"s"} waiting for manual activation.</p></div>
      </div>
      <div class="approval-console-list">
        ${t.map(n=>no(n,e)).join("")||v("No workspace reviews found.")}
      </div>
    </article>
  `}function no(e,t){const a=["active","trialing","past_due","grace"].includes(e.status),n=e.company_id===t;return`
    <article class="workspace-review-row ${e.status==="pending_review"?"pending":""}">
      <span>
        <strong>${r(e.company_name||M(e.company_id))}${n?" / current":""}</strong>
        <small>${r(e.company_id)} / ${r(e.owner_email||"No owner email")} / ${E(e.created_at)}</small>
      </span>
      <b class="status-pill ${a?"active":e.status==="pending_review"?"pending":"muted"}">${r(Bt(e.status,e))}</b>
      <div class="workspace-review-actions">
        <button class="btn btn-primary" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="active" ${a?"disabled":""}>Approve</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="pending_review" ${e.status==="pending_review"?"disabled":""}>Pending</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="suspended" ${e.status==="suspended"?"disabled":""}>Suspend</button>
        <button class="btn" type="button" data-action="review-workspace" data-company-id="${r(e.company_id)}" data-status="canceled" ${e.status==="canceled"?"disabled":""}>Reject</button>
      </div>
    </article>
  `}function io(e){const t=he(e),a=va(e);return`
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
      ${a?so(e,a):`
        <div class="section-head"><div><h2>Access preview</h2><p>Pick View as role to check sidebar, route, and action access.</p></div></div>
        ${v("No role preview selected.")}
      `}
    </article>
    <article class="panel span-3">
      <div class="section-head"><div><h2>Field controls</h2><p>Finance and sensitive field masking rules.</p></div></div>
      <div class="finance-compact-list">
        ${i.fieldPermissions.filter(n=>n.company_id===e).map(n=>Le(n.field_key,n.resource_type,n.visibility,"")).join("")||v("No field permission overrides yet.")}
      </div>
    </article>
  `}function so(e,t){const a=bt.filter(o=>o.status==="live"),n=a.filter(o=>Qa(t,o.permission||`${o.id}.view`)),s=a.filter(o=>!Qa(t,o.permission||`${o.id}.view`));return`
    <div class="section-head">
      <div><h2>Access preview</h2><p>${r(t.name)} sees ${n.length} of ${a.length} live modules.</p></div>
      <button class="btn" type="button" data-action="exit-role-preview"><i class="ti ti-eye-off"></i>Exit preview</button>
    </div>
    ${L([["Preview role",t.name],["Allowed modules",n.map(o=>o.label).join(", ")||"None"],["Hidden modules",s.map(o=>o.label).join(", ")||"None"]])}
  `}function ro(e){return F("Settings","New role",`
    <form class="role-form" data-role-form>
      ${q("Role name","name","")}
      ${q("Color","color","#f0b23b",!1,"color")}
      ${q("Priority","priority","100",!1,"number")}
      <div class="permission-grid span-2">
        ${Ys.map(([t,a])=>`
          <label><input type="checkbox" name="permissions" value="${r(t)}" /> <span>${r(a)}</span></label>
        `).join("")}
      </div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create role</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function oo(e){const t=he(e).filter(n=>n.name.toLowerCase()!=="owner"),a=[["","Member"]].concat(t.map(n=>[n.id,n.name]));return F("Users","Create invite code",`
    <form class="role-form" data-invite-form>
      <input type="hidden" name="company_id" value="${r(e)}" />
      ${q("Email","email","",!0,"email")}
      ${R("Role","role_id",zc(e),a)}
      <div class="form-message span-2">Quest creates an invite code you can copy now. Email invite delivery will use this same record after SMTP/Resend is configured.</div>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Create invite code</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-modal")}function lo(e){const t=em(e),a=pt(e),n=i.formsTab==="builder"&&a?"builder":i.formsTab==="responses"?"responses":"library";return`
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
            <button class="${n===s?"active":""}" type="button" data-action="set-forms-tab" data-tab="${r(s)}">${r(A(s))}</button>
          `).join("")}
        </nav>
      `}
      ${n==="library"?co(e,t,a):""}
      ${n==="builder"?mo(e,a):""}
      ${n==="responses"?ho(e,a):""}
    </section>
  `}function co(e,t,a){return`
    <section class="forms-home">
      <article class="forms-recent-panel panel">
        <div class="forms-panel-head">
          <div>
            <strong>Recent forms</strong>
            <span>${t.length} visible form${t.length===1?"":"s"} in ${r(M(e))}</span>
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
                <span>Created by ${r(tm(n))}</span>
              </span>
              <button class="form-card-toggle" type="button" data-action="toggle-form-card" data-form-id="${r(n.id)}" aria-expanded="${i.expandedFormIds.has(n.id)?"true":"false"}">
                <i class="ti ${i.expandedFormIds.has(n.id)?"ti-chevron-up":"ti-chevron-down"}"></i>
                ${i.expandedFormIds.has(n.id)?"Less":"Details"}
              </button>
              <span class="form-card-meta">
                <small>${r(n.type)} / ${r(n.audience||"Internal")}</small>
                <small>${Rs(n)} questions</small>
                <em>${Ta(n.id).length} responses</em>
                <em>Updated ${E(n.updated_at)}</em>
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
  `}function mo(e,t){if(!t)return`
      <section class="panel">
        <div class="section-head"><div><h2>Builder</h2><p>No form selected yet.</p></div></div>
        ${v("Create a form or choose a template to open the builder.")}
      </section>
    `;const a=["questions","responses","settings"].includes(i.formEditorTab)?i.formEditorTab:"questions";return`
    <section class="forms-builder-grid gform-editor" data-form-editor-mode="${r(a)}">
      ${po(t,a)}
      ${a==="questions"?`
        ${uo(e,t)}
        ${fo(t)}
      `:""}
      ${a==="settings"?`
        <article class="panel form-settings-panel forms-settings-wide">
          ${go(e,t)}
        </article>
      `:""}
      ${a==="responses"?bo(e,t):""}
    </section>
  `}function po(e,t){const a=Ta(e.id);return`
    <div class="gform-editor-tabs panel" role="tablist" aria-label="Form editor sections">
      <div>
        <strong>${r(e.title)}</strong>
        <span>${r(e.status)} / ${Rs(e)} questions / ${a.length} responses</span>
      </div>
      ${["questions","responses","settings"].map(n=>`
        <button class="${t===n?"active":""}" type="button" data-action="set-form-editor-tab" data-tab="${r(n)}">
          ${n==="questions"?'<i class="ti ti-list-details"></i>':n==="responses"?'<i class="ti ti-inbox"></i>':'<i class="ti ti-settings"></i>'}
          ${r(A(n))}
        </button>
      `).join("")}
      <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(e.id)}"><i class="ti ti-eye"></i>Preview</button>
      <button class="btn" type="button" data-action="open-form-actions" data-form-id="${r(e.id)}"><i class="ti ti-share"></i>Share</button>
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(e.id)}">Save</button>
    </div>
  `}function uo(e,t){return`
    <article class="panel form-identity-panel gform-title-card">
      <div class="gform-accent-strip" style="--form-accent:${r(t.theme_color||$e(e))}"></div>
      ${nt("Form title","title",t.title,!0)}
      ${Ps("Form description","description",t.description)}
      <div class="forms-simple-meta">
        <span>${r(t.status)}</span>
        <span>${r(t.type)}</span>
        <span>${r(t.audience||"Internal")}</span>
        <span>${r(x(t.linked_job_id)?.name||"Company level")}</span>
        <span>${r(M(e))}</span>
      </div>
      <div class="form-actions">
        <button class="btn" type="button" data-action="set-form-editor-tab" data-tab="settings">Settings</button>
        <button class="btn" type="button" data-action="open-form-preview" data-form-id="${r(t.id)}">Preview</button>
        <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      </div>
    </article>
  `}function fo(e){return`
    <article class="question-workbench">
      <div class="question-canvas">
        <div class="gform-floating-toolbar" aria-label="Builder tools">
          ${ht.map(([t,a])=>`<button type="button" data-action="add-question" data-question-type="${r(t)}" title="${r(a)}" aria-label="Add ${r(a)} question"><i class="ti ${r(am(t))}"></i></button>`).join("")}
        </div>
        <div class="question-list">
          ${e.questions.map((t,a)=>_o(t,a)).join("")||v("Add the first question.")}
        </div>
      </div>
    </article>
  `}function go(e,t){return`
    <div class="section-head"><div><h2>Settings</h2><p>Publishing, audience, theme, and response behavior.</p></div></div>
    <div class="forms-settings-grid">
      ${nt("Title","title",t.title,!0)}
      ${Ot("Status","status",t.status,rn.map(a=>[a,a]))}
      ${Ps("Description","description",t.description)}
      ${Ot("Type","type",t.type,yt.map(a=>[a,a]))}
      ${nt("Audience","audience",t.audience)}
      ${Ot("Linked job","linked_job_id",t.linked_job_id||"",[["","Company level"]].concat(U(e).map(a=>[a.id,a.name])))}
      ${nt("Theme color","theme_color",t.theme_color||$e(e),!1,"color")}
      ${Ot("Background","background",t.background||"clean",[["clean","Clean"],["paper","Paper"],["grid","Grid"],["dark","Dark"]])}
      ${nt("Submit button","submit_label",t.submit_label||"Submit")}
      <label class="check-row"><input type="checkbox" data-form-field="collect_email" ${t.collect_email?"checked":""} /> Collect email</label>
      <label class="check-row"><input type="checkbox" data-form-field="require_approval" ${t.require_approval?"checked":""} /> Require approval</label>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" data-action="save-form" data-form-id="${r(t.id)}">Save settings</button>
      <button class="btn" type="button" data-action="publish-form" data-form-id="${r(t.id)}">Publish</button>
      <button class="btn danger" type="button" data-action="delete-form" data-form-id="${r(t.id)}">Delete</button>
    </div>
  `}function bo(e,t){const a=Ta(t.id),n=a[0]||null;return`
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
      ${n?Ns(n):v("No response selected.")}
    </aside>
  `}function _o(e,t){const a=ht.map(([n,s])=>`<option value="${r(n)}" ${e.type===n?"selected":""}>${r(s)}</option>`).join("");return`
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
      ${ut(e)?`
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
  `}function vo(e,t){return`
    <form class="response-form" data-form-preview-response data-form-id="${r(t.id)}" style="--form-accent:${r(t.theme_color||$e(e))}">
      <div class="designed-form-header">
        <span>${r(M(e))}</span>
        <h2>${r(t.title)}</h2>
        <p>${r(t.description||"Preview this form before sending it out.")}</p>
      </div>
      ${t.collect_email?'<label><span>Email</span><input name="submitter_email" type="email" placeholder="name@example.com" /></label>':""}
      ${t.questions.map(a=>yo(a)).join("")||v("No questions yet.")}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${r(t.submit_label||"Submit")}</button>
      </div>
    </form>
  `}function yo(e){const t=`answer:${e.id}`,a=e.required?"required":"";return e.type==="paragraph"?de(e,`<textarea name="${r(t)}" rows="3" ${a}></textarea>`):e.type==="date"?de(e,`<input name="${r(t)}" type="date" ${a} />`):e.type==="file"?de(e,`<input name="${r(t)}" type="file" ${a} />`):e.type==="yesno"?de(e,`<select name="${r(t)}" ${a}><option value="">Choose</option><option>Yes</option><option>No</option></select>`):e.type==="rating"?de(e,`<input name="${r(t)}" type="range" min="1" max="5" value="3" ${a} />`):e.type==="dropdown"?de(e,`<select name="${r(t)}" ${a}><option value="">Choose</option>${(e.options||[]).map(n=>`<option>${r(n)}</option>`).join("")}</select>`):e.type==="checkbox"?de(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="checkbox" value="${r(n)}" /> ${r(n)}</label>`).join("")}</div>`):e.type==="multiple"?de(e,`<div class="choice-stack">${(e.options||[]).map(n=>`<label><input name="${r(t)}" type="radio" value="${r(n)}" ${a} /> ${r(n)}</label>`).join("")}</div>`):de(e,`<input name="${r(t)}" ${a} />`)}function ho(e,t){const a=t?Ta(t.id):xs(e),n=a[0]||null;return`
    <section class="forms-response-grid">
      <article class="panel response-list-panel">
        <div class="section-head"><div><h2>Responses</h2><p>${a.length} response${a.length===1?"":"s"}</p></div></div>
        <div class="response-list">
          ${a.map(s=>`
            <button type="button" class="response-card">
              <strong>${r(Oe(s.form_id)?.title||"Unknown form")}</strong>
              <span>${r(s.submitted_by||s.submitter_email||"Anonymous")}</span>
              <small>${E(s.created_at)}</small>
            </button>
          `).join("")||v("No responses yet. Submit a preview response from the builder.")}
        </div>
      </article>
      <aside class="panel response-detail">
        ${n?Ns(n):v("No response selected.")}
      </aside>
    </section>
  `}function wo(e,t){const a=Wc(t),n=ya(t),s=te(t).filter(c=>c.status!=="done").length,o=oe(U(t),"estimate_total"),l=Kc(t);return`
    <section class="tool-page crm-page">
      ${J("CRM","Customers, contacts, and follow-ups built from company jobs.",`
        <button class="btn btn-primary" type="button" data-action="open-job-form" data-mode="new"><i class="ti ti-plus"></i>Add customer job</button>
      `)}
      <section class="metric-grid crm-metrics">
        ${j("Accounts",n.length)}
        ${j("Open jobs",U(t).filter(c=>c.stage!=="Closed").length)}
        ${j("Open tasks",s)}
        ${j("Pipeline value",S(o))}
      </section>
      <section class="crm-toolbar panel">
        <label>
          <span>Search</span>
          <input data-crm-search value="${r(i.crmQuery)}" placeholder="Find customer, contact, job, or address" />
        </label>
        <label>
          <span>Stage</span>
          <select data-crm-stage-filter>
            ${["all"].concat(_t).map(c=>`<option value="${r(c)}" ${i.crmStageFilter===c?"selected":""}>${r(c==="all"?"All stages":c)}</option>`).join("")}
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
          <div><h2>Customers</h2><p>${a.length} visible account${a.length===1?"":"s"} in ${r(M(t))}</p></div>
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
              <span>${S(c.estimateTotal)}</span>
              <span>${E(c.updatedAt)}</span>
            </a>
          `).join("")||v("No CRM accounts match this view. Add a customer job to start the list.")}
        </div>
      </section>
    </section>
  `}function $o(e,t){const a=Yc(e,t);if(!a)return F("CRM","Customer account",v("This customer is not visible in the current company view."));const n=a.latestJob,s=a.tasks.filter(o=>o.status!=="done");return F("CRM",a.name,`
    <div class="crm-account-modal">
      <section class="crm-modal-summary">
        <div class="section-head">
          <div>
            <h2>${r(a.name)}</h2>
            <p>${r(a.subtitle)}</p>
          </div>
          ${xn(a.priority)}
        </div>
        ${L([["Primary contact",a.primaryContact],["Owner",a.owner],["Current stage",a.stage],["Pipeline value",S(a.estimateTotal)],["Open tasks",String(s.length)],["Last updated",E(a.updatedAt)]])}
      </section>
      <section class="crm-rollup-grid">
        ${j("Jobs",a.jobs.length)}
        ${j("Files",a.fileCount)}
        ${j("Forms",a.formCount)}
        ${j("Tasks",a.tasks.length)}
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
              <span>${S(o.estimate_total)}</span>
            </a>
          `).join("")||v("No linked jobs yet.")}
        </div>
      </section>
      <section class="crm-modal-section">
        <div class="section-head"><div><h2>Follow-ups</h2><p>Open tasks across linked jobs.</p></div></div>
        <div class="queue-list">
          ${s.slice(0,6).map(o=>Ma(o)).join("")||v("No open follow-ups for this customer.")}
        </div>
      </section>
    </div>
  `,"crm-modal")}function So(e,t){const a=Ze(t),n=ns(t);n&&i.selectedConversationId!==n.id&&(i.selectedConversationId=n.id);const s=!!(n&&e.params.get("conversation"));return Td(t,n?.id||""),n&&Aa(n.id,!1),`
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
              <input data-message-search value="${r(i.messageQuery)}" placeholder="Find chats or messages" />
            </label>
            <div class="segmented message-filter" role="group" aria-label="Message filters">
              ${["all","unread","company","role","custom","direct"].map(o=>`
                <button type="button" data-action="set-message-filter" data-filter="${r(o)}" class="${i.messageFilter===o?"active":""}">${r(o==="all"?"All":A(o))}</button>
              `).join("")}
            </div>
          </div>
          <div class="conversation-list">
            ${a.map(o=>ko(o,t,n?.id===o.id)).join("")||v("No conversations match this view.")}
          </div>
        </aside>
        <main class="messages-thread-panel panel">
          ${n?Do(t,n):qo()}
        </main>
      </section>
      ${i.session?.auth==="local-basic"?Mo():""}
    </section>
  `}function ko(e,t,a){const n=Xe(e.id).at(-1),s=_n(e.id);return`
    <a class="conversation-row ${a?"active":""}" href="${_(m("messages",{conversation:e.id},t))}" data-router>
      <span class="conversation-mark">${G(qs(e.type))}</span>
      <span>
        <strong>${r(e.title)}</strong>
        <small>${r(n?.body||Nn(e)||"No messages yet")}</small>
      </span>
      <em>${n?Oa(n.created_at):""}</em>
      ${s?`<b>${s}</b>`:""}
    </a>
  `}function Do(e,t){const a=Xe(t.id),n=T("messages.send",e);return`
    <div class="thread-head">
      <a class="btn mobile-thread-back" href="${_(m("messages",{},e))}" data-router><i class="ti ti-arrow-left"></i>Chats</a>
      <div class="thread-title">
        <span>${G(qs(t.type))}</span>
        <div>
          <h2>${r(t.title)}</h2>
          <p>${r(Nn(t))}</p>
        </div>
      </div>
      <div class="thread-actions">
        <button class="btn" type="button" data-action="message-search-results"><i class="ti ti-search"></i>Search</button>
        <button class="btn" type="button" data-action="message-details" data-conversation-id="${r(t.id)}"><i class="ti ti-info-circle"></i>Details</button>
        <button class="btn" type="button" data-action="manage-message-chat" data-conversation-id="${r(t.id)}" ${T("messages.manage_groups",e)||T("messages.manage",e)?"":"disabled"}><i class="ti ti-users"></i>Access</button>
      </div>
    </div>
    <div class="message-stream">
      ${a.map(s=>Co(s)).join("")||v("No messages yet. Start the thread with a short update.")}
    </div>
    ${n?Io(t):v("Your role can view this chat but cannot send messages.")}
  `}function Co(e){const t=e.sender_profile_id===b().profile.id,a=qd(e.sender_profile_id),n=wc(e.id);return`
    <article class="message-bubble ${t?"own":""}">
      ${me(a,"avatar message-avatar")}
      <div class="message-card">
        <div class="message-meta">
          <strong>${r(a.full_name||a.email||It(e.sender_profile_id))}</strong>
          <span>${Oa(e.created_at)}</span>
          ${t&&T("messages.delete_own",e.company_id)||T("messages.delete_any",e.company_id)?`<button type="button" data-action="delete-message" data-message-id="${r(e.id)}"><i class="ti ti-trash"></i></button>`:""}
        </div>
        ${e.body?`<p>${Fd(e.body)}</p>`:""}
        ${n.length?`<div class="message-attachments">${n.map(jo).join("")}</div>`:""}
      </div>
    </article>
  `}function jo(e){const t=e.mime_type.startsWith("image/");return`
    <button class="message-attachment" type="button" data-action="open-message-attachment" data-attachment-id="${r(e.id)}">
      ${e.preview_url&&t?`<img src="${r(e.preview_url)}" alt="" />`:G(t?"q-message-image":"q-message-file")}
      <span><strong>${r(e.file_name)}</strong><small>${r(Ed(e.size_bytes))}</small></span>
    </button>
  `}function Io(e){return`
    <form class="message-composer" data-message-form data-conversation-id="${r(e.id)}">
      <input name="body" placeholder="Message ${r(e.title)}" autocomplete="off" />
      <label class="icon-button message-attach-button" title="Attach file">
        <i class="ti ti-paperclip"></i>
        <input name="attachments" type="file" multiple ${T("messages.attach_files",e.company_id)?"":"disabled"} />
      </label>
      <button class="btn btn-primary" type="submit"><i class="ti ti-send"></i>Send</button>
    </form>
  `}function qo(e){return`
    <div class="messages-empty-panel">
      ${G("q-symbol-messages")}
      <h2>No chat selected</h2>
      <p>Create a group chat, direct message a teammate, or pick a conversation from the list.</p>
      <div class="head-actions">
        <button class="btn btn-primary" type="button" data-action="new-message-group"><i class="ti ti-message-plus"></i>New group</button>
        <button class="btn" type="button" data-action="new-direct-message"><i class="ti ti-user-plus"></i>Direct message</button>
      </div>
    </div>
  `}function Mo(e){return`
    <div class="message-scenario">
      <button class="btn btn-primary" type="button" data-action="run-message-scenario"><i class="ti ti-sparkles"></i>Demo scenario</button>
      <button class="btn" type="button" data-action="reset-message-demo"><i class="ti ti-refresh"></i>Reset</button>
    </div>
  `}function Ao(e){const t=ae(e);return F("Messages","New group chat",`
    <form class="message-modal-form" data-message-group-form>
      ${q("Chat name","title","",!0)}
      ${R("Type","type","custom",[["company","Company-wide"],["role","Role-based"],["custom","Custom group"]])}
      ${Wi(e,[])}
      ${Yi(t,[])}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Create group</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function Fo(e){const t=ae(e).filter(a=>(a.profile_id||a.member_id)!==b().profile.id);return F("Messages","New direct message",`
    <form class="message-modal-form" data-direct-message-form>
      ${R("Person","profile_id",t[0]?.profile_id||t[0]?.member_id||"",t.map(a=>[a.profile_id||a.member_id,a.name]))}
      <label><span>First message</span><textarea name="body" rows="3" placeholder="Start with a short note"></textarea></label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Start chat</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function Eo(e,t){const a=i.messageConversations.find(l=>l.id===t);if(!a)return F("Messages","Chat access",v("Conversation not found."));const n=ga(a.id),s=n.filter(l=>l.target_type==="role").map(l=>l.target_id),o=n.filter(l=>l.target_type==="profile").map(l=>l.target_id);return F("Messages","Chat access",`
    <form class="message-modal-form" data-message-access-form data-conversation-id="${r(a.id)}">
      ${q("Chat name","title",a.title,!0)}
      ${R("Type","type",a.type,[["company","Company-wide"],["role","Role-based"],["custom","Custom group"],["direct","Direct message"]])}
      ${Wi(e,s)}
      ${Yi(ae(e),o)}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Save access</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"message-modal")}function Wi(e,t=[]){const a=new Set(t);return`
    <section class="message-access-section">
      <div class="message-picker-head">
        <strong>Roles</strong>
        <small>Good for large crews. Access updates when role assignments change.</small>
      </div>
      <div class="message-role-grid">
        ${he(e).map(n=>`
          <label class="message-role-option" style="--role-color:${r(n.color)}">
            <input type="checkbox" name="role_ids" value="${r(n.id)}" ${a.has(n.id)?"checked":""} />
            <span></span>
            <strong>${r(n.name)}</strong>
          </label>
        `).join("")}
      </div>
    </section>
  `}function Yi(e,t=[]){const a=new Set(t),n=e.slice().sort((s,o)=>Re(s).localeCompare(Re(o)));return`
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
          <span>${me(fi(s),"avatar tiny-avatar")} ${r(Re(s))}</span>
        `).join("")||"<small>No individual people selected.</small>"}
      </div>
      <div class="message-people-list">
        ${n.map(s=>{const o=s.profile_id||s.member_id;return`
            <label class="message-person-row" data-message-person-row data-filter-text="${r([Re(s),s.email,s.role_label,s.role].join(" ").toLowerCase())}">
              <input type="checkbox" name="profile_ids" value="${r(o)}" ${a.has(o)?"checked":""} />
              ${me(fi(s),"avatar message-person-avatar")}
              <span>
                <strong>${r(Re(s))}</strong>
                <small>${r(Md(s))}</small>
              </span>
            </label>
          `}).join("")||v("No people available in this company yet.")}
      </div>
    </section>
  `}function To(e,t){const a=i.messageConversations.find(n=>n.id===t);return a?F("Messages",a.title,`
    ${L([["Type",A(a.type)],["Access",Nn(a)],["Messages",String(Xe(a.id).length)],["Attachments",String(hc(a.id).length)],["Last message",E(a.last_message_at)]])}
  `,"message-modal"):F("Messages","Chat details",v("Conversation not found."))}function Oo(e){const t=i.messageQuery.trim().toLowerCase(),a=Ze(e).flatMap(n=>Xe(n.id).filter(s=>!t||s.body.toLowerCase().includes(t)).map(s=>({conversation:n,message:s})));return F("Messages","Search results",`
    <div class="queue-list">
      ${a.slice(0,30).map(({conversation:n,message:s})=>`
        <a class="queue-row" href="${_(m("messages",{conversation:n.id},e))}" data-router>
          <span><strong>${r(n.title)}</strong><small>${r(s.body||"Attachment")}</small></span>
          <em>${Oa(s.created_at)}</em>
        </a>
      `).join("")||v("No matching messages. Type in the Messages search box first.")}
    </div>
  `,"message-modal")}function xo(e,t){const a=_s(t),n=we(t),s=us(t).slice().sort(ft("received_at")).slice(0,5),o=kn(t).slice().sort(ft("spent_at")).slice(0,5),l=Dn(t).slice().sort((c,d)=>c.name.localeCompare(d.name)).slice(0,5);return`
    <section class="tool-page finance-page">
      ${J("Finance","Invoices, payments, expenses, vendors, and job-linked money in one company view.",`
        <button class="btn btn-primary" type="button" data-action="new-finance-invoice"><i class="ti ti-file-dollar"></i>New invoice</button>
        <button class="btn" type="button" data-action="new-finance-payment"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="new-finance-expense"><i class="ti ti-receipt"></i>Add expense</button>
        <button class="btn" type="button" data-action="new-finance-vendor"><i class="ti ti-building-store"></i>Add vendor</button>
        <a class="btn" href="${_(m("finance",{report:"summary"},t))}" data-router><i class="ti ti-report-analytics"></i>Reports</a>
      `)}
      <section class="metric-grid finance-metrics">
        ${j("Estimated pipeline",S(a.pipeline))}
        ${j("Invoiced",S(a.invoiced))}
        ${j("Collected",S(a.collected))}
        ${j("Outstanding",S(a.outstanding))}
        ${j("Expenses",S(a.expenses))}
        ${j("Net position",S(a.net))}
      </section>
      <section class="panel finance-aging">
        <div class="section-head"><div><h2>AR aging</h2><p>Outstanding invoice balance by due date.</p></div></div>
        <div class="finance-aging-grid">
          ${[["Current",a.aging.current],["1-30",a.aging.thirty],["31-60",a.aging.sixty],["61+",a.aging.overSixty]].map(([c,d])=>`<div><span>${r(c)}</span><strong>${S(d)}</strong></div>`).join("")}
        </div>
      </section>
      <section class="panel finance-invoice-panel">
        <div class="section-head"><div><h2>Invoices</h2><p>${n.length} billing record${n.length===1?"":"s"} for ${r(M(t))}</p></div></div>
        <div class="data-table finance-invoice-table">
          <div class="table-head"><span>Invoice</span><span>Status</span><span>Job</span><span>Due</span><span>Total</span><span>Paid</span><span>Balance</span></div>
          ${n.map(c=>`
            <a class="table-row" href="${_(m("finance",{invoice:c.id},t))}" data-router>
              <span><strong>${r(c.invoice_number)}</strong><small>${r(c.client_name||x(c.job_id)?.client_name||"No client")}</small></span>
              <span>${Cd(bs(c))}</span>
              <span>${r(x(c.job_id)?.name||"Company level")}</span>
              <span>${E(c.due_date)}</span>
              <span>${S(c.total)}</span>
              <span>${S(jn(c.id))}</span>
              <span>${S(le(c.id))}</span>
            </a>
          `).join("")||v("No invoices yet. Create one from a job or customer record.")}
        </div>
      </section>
      <section class="finance-secondary-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Recent payments</h2><p>Money received.</p></div></div>
          <div class="finance-compact-list">
            ${s.map(c=>Le(Fe(c.invoice_id)?.invoice_number||"Payment",c.method,S(c.amount),c.received_at)).join("")||v("No payments recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Expenses</h2><p>Job and company costs.</p></div></div>
          <div class="finance-compact-list">
            ${o.map(c=>Le(Va(c.vendor_id),c.category,S(c.amount),c.spent_at,m("finance",{expense:c.id},t))).join("")||v("No expenses recorded.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Vendors</h2><p>Suppliers and subcontractors.</p></div></div>
          <div class="finance-compact-list">
            ${l.map(c=>Le(c.name,c.category,c.status,c.updated_at,m("finance",{vendor:c.id},t))).join("")||v("No vendors recorded.")}
          </div>
        </article>
      </section>
    </section>
  `}function Ro(e,t){return e.params.get("invoice")?Po(t,e.params.get("invoice")):e.params.get("expense")?No(t,e.params.get("expense")):e.params.get("vendor")?Uo(t,e.params.get("vendor")):e.params.get("report")==="summary"?Lo(t):""}function Po(e,t){const a=Fe(t);if(!a||a.company_id!==e)return F("Finance","Invoice",v("Invoice not found."));const n=gs(a.id),s=x(a.job_id);return F("Finance",a.invoice_number,`
    <div class="finance-detail-modal">
      ${L([["Client",a.client_name||s?.client_name||"No client"],["Status",bs(a)],["Job",s?.name||"Company level"],["Issued",E(a.issue_date)],["Due",E(a.due_date)],["Total",S(a.total)],["Collected",S(jn(a.id))],["Balance",S(le(a.id))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="new-finance-payment" data-invoice-id="${r(a.id)}"><i class="ti ti-cash"></i>Record payment</button>
        <button class="btn" type="button" data-action="edit-finance-invoice" data-invoice-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit invoice</button>
        ${s?`<a class="btn" href="${_(m("jobs",{tab:"profile",job_id:s.id},e))}" data-router><i class="ti ti-briefcase"></i>Open job</a>`:""}
      </div>
      <section class="finance-modal-section">
        <div class="section-head"><div><h2>Payments</h2><p>${n.length} payment${n.length===1?"":"s"} applied.</p></div></div>
        <div class="finance-compact-list">
          ${n.map(o=>Le(o.reference||o.method,o.method,S(o.amount),o.received_at)).join("")||v("No payments yet.")}
        </div>
      </section>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function No(e,t){const a=fs(t);if(!a||a.company_id!==e)return F("Finance","Expense",v("Expense not found."));const n=x(a.job_id);return F("Finance",`${Va(a.vendor_id)} expense`,`
    <div class="finance-detail-modal">
      ${L([["Vendor",Va(a.vendor_id)],["Category",a.category],["Status",a.status],["Job",n?.name||"Company level"],["Spent",E(a.spent_at)],["Amount",S(a.amount)]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-expense" data-expense-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit expense</button>
        ${n?`<a class="btn" href="${_(m("files",{job_id:n.id},e))}" data-router><i class="ti ti-folder"></i>Job files</a>`:""}
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Uo(e,t){const a=Cn(t);if(!a||a.company_id!==e)return F("Finance","Vendor",v("Vendor not found."));const n=kn(e).filter(s=>s.vendor_id===a.id);return F("Finance",a.name,`
    <div class="finance-detail-modal">
      ${L([["Contact",a.contact_name||"No contact"],["Email",a.email||"No email"],["Phone",a.phone||"No phone"],["Category",a.category],["Status",a.status],["Spend",S(oe(n,"amount"))]])}
      <div class="finance-modal-actions">
        <button class="btn btn-primary" type="button" data-action="edit-finance-vendor" data-vendor-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit vendor</button>
        <button class="btn" type="button" data-action="new-finance-expense" data-vendor-id="${r(a.id)}"><i class="ti ti-receipt"></i>Add expense</button>
      </div>
      ${a.notes?`<p class="finance-note">${r(a.notes)}</p>`:""}
    </div>
  `,"finance-modal")}function Lo(e){const t=_s(e);return F("Finance","Summary report",`
    <div class="finance-report-modal">
      ${L([["Company",M(e)],["Estimated pipeline",S(t.pipeline)],["Invoiced",S(t.invoiced)],["Collected",S(t.collected)],["Outstanding",S(t.outstanding)],["Expenses",S(t.expenses)],["Net position",S(t.net)]])}
      <div class="finance-aging-grid">
        <div><span>Current</span><strong>${S(t.aging.current)}</strong></div>
        <div><span>1-30</span><strong>${S(t.aging.thirty)}</strong></div>
        <div><span>31-60</span><strong>${S(t.aging.sixty)}</strong></div>
        <div><span>61+</span><strong>${S(t.aging.overSixty)}</strong></div>
      </div>
    </div>
  `,"finance-modal")}function Zn(e,t=null){const a=t||ud(e);return F("Finance",t?"Edit invoice":"New invoice",`
    <form class="finance-form" data-finance-invoice-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${q("Invoice number","invoice_number",a.invoice_number,!0)}
      ${R("Linked job","job_id",a.job_id||"",[["","Company level"]].concat(U(e).map(n=>[n.id,n.name])))}
      ${q("Client","client_name",a.client_name,!0)}
      ${R("Status","status",a.status,Di.map(n=>[n,n]))}
      ${q("Issue date","issue_date",a.issue_date,!1,"date")}
      ${q("Due date","due_date",a.due_date,!1,"date")}
      ${q("Subtotal","subtotal",a.subtotal,!1,"number")}
      ${q("Tax","tax",a.tax,!1,"number")}
      ${ve("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save invoice</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Qo(e,t=""){const a=fd(e,t),n=we(e).map(s=>[s.id,`${s.invoice_number} - ${s.client_name||x(s.job_id)?.client_name||"No client"}`]);return F("Finance","Record payment",`
    <form class="finance-form" data-finance-payment-form>
      ${R("Invoice","invoice_id",a.invoice_id,n.length?n:[["","Create an invoice first"]])}
      ${q("Amount","amount",a.amount,!0,"number")}
      ${R("Method","method",a.method,Ii.map(s=>[s,s]))}
      ${q("Received","received_at",a.received_at,!1,"date")}
      ${q("Reference","reference",a.reference)}
      ${ve("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save payment</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Xn(e,t=null,a=""){const n=t||gd(e,a),s=Dn(e).map(o=>[o.id,o.name]);return F("Finance",t?"Edit expense":"Add expense",`
    <form class="finance-form" data-finance-expense-form>
      <input type="hidden" name="id" value="${r(n.id)}" />
      ${R("Vendor","vendor_id",n.vendor_id,s.length?s:[["","No vendor yet"]])}
      ${R("Linked job","job_id",n.job_id||"",[["","Company level"]].concat(U(e).map(o=>[o.id,o.name])))}
      ${R("Category","category",n.category,da.map(o=>[o,o]))}
      ${R("Status","status",n.status,Ci.map(o=>[o,o]))}
      ${q("Amount","amount",n.amount,!0,"number")}
      ${q("Spent date","spent_at",n.spent_at,!1,"date")}
      ${ve("Notes","notes",n.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save expense</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function ei(e,t=null){const a=t||bd(e);return F("Finance",t?"Edit vendor":"Add vendor",`
    <form class="finance-form" data-finance-vendor-form>
      <input type="hidden" name="id" value="${r(a.id)}" />
      ${q("Vendor name","name",a.name,!0)}
      ${q("Contact","contact_name",a.contact_name)}
      ${q("Email","email",a.email,!1,"email")}
      ${q("Phone","phone",a.phone)}
      ${R("Category","category",a.category,da.map(n=>[n,n]))}
      ${R("Status","status",a.status,ji.map(n=>[n,n]))}
      ${ve("Notes","notes",a.notes,"span-2")}
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save vendor</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"finance-form-modal")}function Vo(e,t){return e.section==="clock"?Yo(t):e.section==="calendar"?Bo(e,t):e.section==="approvals"?Ko(t):Wo(t)}function pa(e,t){return`
    ${un("Operations sections",[[m("time",{},e),"My time",t==="time"],[m("calendar",{},e),"Calendar",t==="calendar"],[m("approvals",{},e),"Approvals",t==="approvals"],[m("clock",{},e),"Clock dashboard",t==="clock"]])}
  `}function Bo(e,t){const a=kc(t),n=ba(t),s=a.filter(d=>d.dateKey===h(0)),o=n.filter(d=>d.mine),l=n.filter(d=>d.source!=="manual").length,c=T("calendar.manage",t);return`
    <section class="tool-page operations-page calendar-page">
      ${J("Calendar","Company schedule built from tasks, approvals, finance due dates, time context, and manual events.",`
        <button class="btn btn-primary" type="button" data-action="open-calendar-event-form"><i class="ti ti-calendar-plus"></i>New event</button>
      `)}
      ${pa(t,"calendar")}
      <section class="metric-grid operations-metrics calendar-metrics">
        ${j("Today",s.length)}
        ${j("This week",Oc(a).length)}
        ${j("Mine",o.length)}
        ${j("From modules",l)}
      </section>
      <section class="workspace-toolbar calendar-toolbar">
        <div class="segmented" role="group" aria-label="Calendar scope">
          <button class="${i.calendarScope==="company"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="company"><i class="ti ti-building"></i>Company</button>
          <button class="${i.calendarScope==="me"?"active":""}" type="button" data-action="set-calendar-scope" data-scope="me"><i class="ti ti-user"></i>Me</button>
        </div>
        <div class="segmented" role="group" aria-label="Calendar view">
          ${["month","week","list"].map(d=>`<button class="${i.calendarView===d?"active":""}" type="button" data-action="set-calendar-view" data-view="${r(d)}">${r(A(d))}</button>`).join("")}
        </div>
        <label class="wide-control">
          <span>Search</span>
          <input data-calendar-search value="${r(i.calendarQuery)}" placeholder="Find events, jobs, tasks, or people" />
        </label>
        <label>
          <span>Type</span>
          <select data-calendar-type-filter>
            <option value="all">All types</option>
            ${Zs.map(d=>`<option value="${r(d)}" ${i.calendarTypeFilter===d?"selected":""}>${r(d)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="calendar-nav">
        <div>
          <button class="btn" type="button" data-action="calendar-prev"><i class="ti ti-chevron-left"></i></button>
          <button class="btn" type="button" data-action="calendar-today">Today</button>
          <button class="btn" type="button" data-action="calendar-next"><i class="ti ti-chevron-right"></i></button>
        </div>
        <strong>${r(Pc())}</strong>
      </section>
      <section class="calendar-shell">
        <article class="panel calendar-main">
          ${i.calendarView==="month"?zo(t,a):""}
          ${i.calendarView==="week"?Ho(t,a):""}
          ${i.calendarView==="list"?Jo(t,a):""}
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
  `}function zo(e,t){const a=Rc(i.calendarCursorDate),n=new Date(`${i.calendarCursorDate}T00:00:00`).getMonth();return`
    <div class="calendar-grid calendar-month-grid">
      ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(s=>`<div class="calendar-weekday">${s}</div>`).join("")}
      ${a.map(s=>{const o=rs(t,s.key);return`
          <div class="calendar-day ${s.month===n?"":"muted"} ${s.key===h(0)?"today":""}">
            <div class="calendar-day-head"><b>${s.label}</b><span>${o.length||""}</span></div>
            ${o.slice(0,3).map(Ki).join("")}
            ${o.length>3?`<small class="calendar-more">+${o.length-3} more</small>`:""}
          </div>
        `}).join("")}
    </div>
  `}function Ho(e,t){return`
    <div class="calendar-grid calendar-week-grid">
      ${os(i.calendarCursorDate).map(n=>{const s=rs(t,n.key);return`
          <div class="calendar-day ${n.key===h(0)?"today":""}">
            <div class="calendar-day-head"><b>${r(n.name)}</b><span>${r(n.shortDate)}</span></div>
            ${s.map(Ki).join("")||'<small class="calendar-empty-day">Open</small>'}
          </div>
        `}).join("")}
    </div>
  `}function Jo(e,t){const a=Nc(t);return`
    <div class="calendar-list">
      ${Object.entries(a).slice(0,18).map(([s,o])=>`
        <section class="calendar-list-day">
          <h3>${r(E(s))}</h3>
          ${o.map(Gi).join("")}
        </section>
      `).join("")||v("No scheduled work or events.")}
    </div>
  `}function Ki(e){return`
    <button class="calendar-pill ${r(Uc(e.type))}" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <span>${r(ls(e))}</span>
      <strong>${r(e.title)}</strong>
    </button>
  `}function Gi(e){return`
    <button class="calendar-agenda-item" type="button" data-action="open-calendar-event" data-event-id="${r(e.id)}">
      <i class="ti ${r(Lc(e.type))}"></i>
      <span><strong>${r(e.title)}</strong><small>${r(`${E(e.dateKey)} · ${ls(e)} · ${e.type}`)}</small></span>
    </button>
  `}function Wo(e){const t=ds(e),a=Dt(e);return`
    <section class="tool-page operations-page">
      ${J("My time","A compact personal work queue built from this company's tasks.",`
        <a class="btn" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Open tasks</a>
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${pa(e,"time")}
      <section class="metric-grid operations-metrics">
        ${j("Due today",t.dueToday.length)}
        ${j("Overdue",t.overdue.length)}
        ${j("Open work",t.open.length)}
        ${j("In review",t.review.length)}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel span-2">
          <div class="section-head"><div><h2>Today</h2><p>Due now, overdue, and highest priority work.</p></div></div>
          <div class="queue-list">
            ${t.focus.slice(0,8).map(n=>Ma(n)).join("")||v("No time-sensitive tasks for this company.")}
          </div>
        </article>
        <article class="panel">
          <div class="section-head"><div><h2>Workload</h2><p>Simple task-based time view.</p></div></div>
          ${L([["Company",M(e)],["Assigned to you",String(t.assignedToMe.length)],["Due this week",String(t.thisWeek.length)],["Completed",String(t.done.length)]])}
        </article>
      <article class="panel span-2">
          <div class="section-head"><div><h2>This week</h2><p>Upcoming task commitments.</p></div></div>
          <div class="data-table operations-table">
            <div class="table-head"><span>Task</span><span>Job</span><span>Owner</span><span>Due</span><span>Status</span></div>
            ${t.thisWeek.slice(0,8).map(n=>`
              <a class="table-row" href="${_(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},e))}" data-router>
                <span><strong>${r(n.title)}</strong><small>${r(n.description||tt(n.type))}</small></span>
                <span>${r(x(n.project_id)?.name||"Company task")}</span>
                <span>${r(H(n.assignee_id))}</span>
                <span>${E(n.due)}</span>
                <span>${Ds(n.status)}</span>
              </a>
            `).join("")||v("No upcoming tasks this week.")}
          </div>
        </article>
      </section>
    </section>
  `}function Yo(e){const t=ms(e),a=Dt(e),n=xa().getTime(),s=n-6*864e5,o=ci(e,n)+(a?Date.now()-Date.parse(a.started_at):0),l=ci(e,s)+(a?Date.now()-Date.parse(a.started_at):0);return`
    <section class="tool-page operations-page clock-page">
      ${J("Clock dashboard","Local basic-mode clock tracking for the active company.",`
        <button class="btn btn-primary" type="button" data-action="${a?"clock-out":"clock-in"}"><i class="ti ${a?"ti-player-stop-filled":"ti-player-play-filled"}"></i>${a?"Clock out":"Clock in"}</button>
      `)}
      ${pa(e,"clock")}
      <section class="metric-grid operations-metrics">
        ${j("Today",Rt(o))}
        ${j("Last 7 days",Rt(l))}
        ${j("Entries",t.length)}
        ${j("Status",a?"Clocked in":"Off clock")}
      </section>
      <section class="dashboard-grid operations-grid">
        <article class="panel">
          <div class="section-head"><div><h2>Active now</h2><p>Current local clock session.</p></div></div>
          ${a?L([["User",H(a.user_id)],["Started",Gt(a.started_at)],["Task",a.task_title||"General shift"],["Elapsed",Rt(Date.now()-Date.parse(a.started_at))]]):v("Nobody is clocked in on this device.")}
        </article>
        <article class="panel span-2">
          <div class="section-head"><div><h2>Recent entries</h2><p>Local time records for this company.</p></div></div>
          <div class="data-table clock-table">
            <div class="table-head"><span>Entry</span><span>User</span><span>Start</span><span>Duration</span></div>
            ${t.slice(0,10).map(c=>`
              <div class="table-row">
                <span><strong>${r(c.task_title||"General shift")}</strong><small>${r(c.notes||"Clock entry")}</small></span>
                <span>${r(H(c.user_id))}</span>
                <span>${Gt(c.started_at)}</span>
                <span>${Rt(c.duration_ms)}</span>
              </div>
            `).join("")||v("No clock entries yet.")}
          </div>
        </article>
      </section>
    </section>
  `}function Ko(e){const t=$n(e),a=t.filter(o=>o.type==="Form approval"),n=t.filter(o=>o.type==="Task review"),s=t.filter(o=>o.type==="Access request");return`
    <section class="tool-page operations-page">
      ${J("Approvals","Company review queue for forms, task handoffs, and access requests.",`
        <a class="btn" href="${_(m("forms",{},e))}" data-router><i class="ti ti-clipboard-list"></i>Forms</a>
        <a class="btn btn-primary" href="${_(m("tasks",{},e))}" data-router><i class="ti ti-list-check"></i>Tasks</a>
      `)}
      ${pa(e,"approvals")}
      <section class="metric-grid operations-metrics">
        ${j("Open approvals",t.length)}
        ${j("Forms",a.length)}
        ${j("Task reviews",n.length)}
        ${j("Access",s.length)}
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
  `}function ti(e){return`
    ${J(A(e||"workspace"),"This module will use the same company workspace shell when wired.","")}
    <section class="panel">
      ${v("Module data model pending.")}
    </section>
  `}function ai(e=!1){document.title="Quest HQ | Company operations workspace";const t=i.route||$t(),a=ua(t.params.get("return_url")||_(m("jobs",{},P()))),n=String(t.params.get("invite")||"").trim(),s=String(t.params.get("auth")||"").trim(),o=Zi(t.params.get("mode")||s,n);o&&i.authMode!==o&&(i.authMode=o),n&&!["signin","register"].includes(i.authMode)&&(i.authMode="register");const l=e||!!(n||s),c=i.session;ma.innerHTML=`
    <main class="landing-shell">
      <nav class="landing-nav">
        <a class="login-brand landing-brand" href="${_("/")}" data-router>
          <span class="side-mark">Q</span>
          <span><strong>Quest HQ</strong><small>Operations Command</small></span>
        </a>
        <div class="landing-nav-actions">
          ${c?`<a class="btn" href="${_(m("jobs",{},u()))}" data-router>Open workspace</a>`:""}
          <button class="btn btn-primary" type="button" data-action="open-auth-modal" data-auth-mode="signin">Login</button>
        </div>
      </nav>
      <section class="landing-hero">
        <div class="landing-hero-media" aria-hidden="true">
          <div class="landing-preview-shell">
            <div class="landing-preview-top"><span></span><b>Quest Roofing</b><i>Live workspace</i></div>
            <div class="landing-preview-body">
              <aside>
                ${["Jobs","Files","Messages","Calendar","Finance"].map((d,f)=>`<span class="${f===0?"active":""}">${r(d)}</span>`).join("")}
              </aside>
              <section>
                <div class="preview-strip"><b>Leak repair pipeline</b><small>Owner approved</small></div>
                <div class="preview-grid">
                  <div><strong>12</strong><span>Open jobs</span></div>
                  <div><strong>38</strong><span>Files secured</span></div>
                  <div><strong>7</strong><span>Follow-ups</span></div>
                </div>
                <div class="preview-table">
                  <span>Queen Creek roof inspection</span><b>Today</b>
                  <span>Mesa permit packet</span><b>Review</b>
                  <span>HOA board approval</span><b>Urgent</b>
                </div>
              </section>
            </div>
          </div>
        </div>
        <div class="landing-hero-copy">
          <div class="eyebrow">Company workspace</div>
          <h1>Quest HQ</h1>
          <p>One calm operations command center for jobs, tasks, files, forms, finance, messages, calendar, users, and permissions.</p>
          <div class="landing-hero-actions">
            <button class="btn btn-primary" type="button" data-action="open-auth-modal" data-auth-mode="register">Create business workspace</button>
            <button class="btn" type="button" data-action="open-auth-modal" data-auth-mode="invite">Join with invite code</button>
          </div>
        </div>
      </section>
      <section class="landing-proof">
        ${[["Business first","Owners create workspaces. Workers join only by invite."],["Modal simple","Login, account creation, and invite joins stay focused."],["Permission ready","Company access, roles, files, finance, and messages stay gated."]].map(([d,f])=>`
          <article>
            <strong>${r(d)}</strong>
            <span>${r(f)}</span>
          </article>
        `).join("")}
      </section>
      ${l?Go(a,n):""}
      ${Xi()}
    </main>
  `}function Go(e,t,a){const n=nd(t);return`
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
            ${Zo(t)}
            ${el(e)}
          `}
          <details class="demo-mode-details">
            <summary>Demo mode</summary>
            ${Xo(e)}
          </details>
          
        </div>
      </div>
    </div>
  `}function Zi(e,t=""){const a=String(e||"").toLowerCase().trim();return t&&!a?"register":["signin","register","invite","request"].includes(a)?a:a==="business"?"register":a==="worker"?t?"register":"invite":""}function Zo(e=""){const t=i.authMode;return`
    <nav class="auth-mode-bar" aria-label="Account access">
      ${(e?[["signin","Sign in"],["register","Create invited account"]]:[["signin","Sign in"],["register","Create workspace"],["invite","Join with invite"]]).map(([n,s])=>`
        <button class="${t===n?"active":""}" type="button" data-action="set-auth-mode" data-auth-mode="${r(n)}">${r(s)}</button>
      `).join("")}
    </nav>
  `}function Xo(e){return`
    <section class="demo-mode-box">
      <div>
        <strong>Demo mode</strong>
        <span>Local-only sample workspace. No Supabase database reads or writes.</span>
      </div>
      <button class="btn full" type="button" data-action="start-demo-mode" data-return-url="${r(e)}">Open demo mode</button>
    </section>
  `}function el(e){const t=String(i.route?.params?.get("invite")||"").trim();return i.authMode==="register"?`
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
        ${Et(t?"Workers cannot create access without a valid invite code.":"You become Owner, then Quest approves billing/access before the workspace opens.")}
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
        ${Et("Invite codes are shared by your Owner/Admin. No email delivery required.")}
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
        ${Et("Requests stay pending until a company Owner/Admin approves them.")}
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
      ${Et(t?"If you do not have an account yet, create an invited worker account.":"Business owners and workers use the same sign in after access is created.")}
      ${t?'<button class="btn full" type="button" data-action="set-auth-mode" data-auth-mode="register">Create invited account</button>':""}
    </form>
  `}function Et(e){return i.loginError?`<div class="form-message error">${r(i.loginError)}</div>`:`<div class="form-message">${r(i.authMessage||e)}</div>`}function tl(e){return`
    <div class="modal-overlay">
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-head">
          <div><div class="eyebrow">Quest Account</div><h2 id="profile-title">Profile</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <form class="profile-form" data-profile-form>
          <div class="profile-preview">
            ${me(e,"avatar large")}
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
  `}function al(e,t){if(i.modal==="profile")return tl(t.profile);if(i.modal==="file-upload")return Wr();if(i.modal==="folder-new")return Jr();if(i.modal==="file-detail")return rl(u());if(i.modal==="forms-tools")return ol(u());if(i.modal==="form-actions")return ml(u(),pt(u()));if(i.modal==="form-new")return ll(u());if(i.modal==="form-preview")return dl(u(),pt(u()));if(i.modal==="job-new")return Na(u(),null);if(i.modal==="job-edit")return Na(u(),je());if(i.modal==="finance-invoice-new")return Zn(u(),null);if(i.modal==="finance-invoice-edit")return Zn(u(),Fe(i.selectedFinanceInvoiceId));if(i.modal==="finance-payment-new")return Qo(u(),i.selectedFinanceInvoiceId);if(i.modal==="finance-expense-new")return Xn(u(),null,i.selectedFinanceVendorId);if(i.modal==="finance-expense-edit")return Xn(u(),fs(i.selectedFinanceExpenseId));if(i.modal==="finance-vendor-new")return ei(u(),null);if(i.modal==="finance-vendor-edit")return ei(u(),Cn(i.selectedFinanceVendorId));if(i.modal==="role-new")return ro(u());if(i.modal==="invite-new")return oo(u());if(i.modal==="message-group-new")return Ao(u());if(i.modal==="message-direct-new")return Fo(u());if(i.modal==="message-access")return Eo(u(),i.selectedConversationId);if(i.modal==="message-details")return To(u(),i.selectedConversationId);if(i.modal==="message-search")return Oo(u());if(i.modal==="calendar-event-detail")return sl(u());if(i.modal==="calendar-event-new")return ni(u(),null);if(i.modal==="calendar-event-edit")return ni(u(),kt(i.selectedCalendarEventId));if(e.name==="company"&&e.section==="crm"&&e.params.get("account"))return $o(e.companyId,e.params.get("account"));if(e.name==="company"&&e.section==="finance"){const a=Ro(e,e.companyId);if(a)return a}return e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"?Na(e.companyId,e.jobId?x(e.jobId):je()):e.name==="company"&&e.section==="tasks"?il(e,e.companyId):""}function Xi(){return i.toast?`
    <div class="app-toast ${r(i.toast.mode||"local")}" role="status" aria-live="polite">
      <strong>${r(i.toast.title||"Quest HQ")}</strong>
      <span>${r(i.toast.message||"")}</span>
    </div>
  `:""}function w(e,t="local",a="Not available yet"){i.toastTimer&&clearTimeout(i.toastTimer),i.toast={title:a,message:e,mode:t},p(),i.toastTimer=setTimeout(()=>{i.toast=null,i.toastTimer=null,p()},4200)}function F(e,t,a,n=""){return`
    <div class="modal-overlay">
      <div class="modal-panel ${r(n)}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </div>
    </div>
  `}function nl(e,t,a){return`
    <div class="modal-overlay drawer-overlay">
      <aside class="modal-panel drawer-panel" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="eyebrow">${r(e)}</div><h2>${r(t)}</h2></div>
          <button class="btn" type="button" data-action="close-modal">Close</button>
        </div>
        <div class="modal-body">${a}</div>
      </aside>
    </div>
  `}function Na(e,t){return F("Jobs",t?"Edit job":"Create job",Mr(e,t),"wide-modal")}function il(e,t){const a=e.jobId?x(e.jobId):null,n=e.params.get("task_id")||"",s=n?fa(n):null;return e.params.get("new")==="1"?F("Tasks","New task",Gn(t,a,null),"task-modal"):e.params.get("edit")==="1"&&s?F("Tasks","Edit task",Gn(t,a,s),"task-modal"):s?nl("Task detail",s.title,Or(t,s)):""}function sl(e){const t=Ec(i.selectedCalendarEventId,e);if(!t)return"";const a=t.source==="manual"?kt(t.sourceId):null,n=[t.href?`<a class="btn btn-primary" href="${_(t.href)}" data-router><i class="ti ti-arrow-right"></i>Open source</a>`:"",a&&t.editable?`<button class="btn" type="button" data-action="edit-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-pencil"></i>Edit</button>`:"",a&&t.editable?`<button class="btn danger" type="button" data-action="delete-calendar-event" data-event-id="${r(a.id)}"><i class="ti ti-trash"></i>Delete</button>`:""].filter(Boolean).join("");return F("Calendar",t.title,`
    <div class="calendar-detail">
      ${L([["Type",t.type],["When",t.allDay?E(t.dateKey):`${Gt(t.startsAt)}${t.endsAt&&t.endsAt!==t.startsAt?` - ${Gt(t.endsAt)}`:""}`],["Assigned",t.owner||"Unassigned"],["Source",t.source==="manual"?"Manual event":A(t.source)],["Linked",t.linkLabel||"None"]])}
      ${t.description?`<p>${r(t.description)}</p>`:""}
      <div class="modal-actions">${n||'<span class="small-note">This derived item opens from its source module.</span>'}</div>
    </div>
  `,"calendar-modal")}function ni(e,t){const a=t||_d(e),n=a.linked_type==="job"?a.linked_id:"";return F("Calendar",t?"Edit event":"New event",`
    <form class="calendar-form" data-calendar-event-form>
      <input type="hidden" name="id" value="${r(t?.id||"")}" />
      ${q("Title","title",t?a.title:"",!0)}
      ${R("Type","event_type",a.event_type,ca.map(s=>[s,s]))}
      ${q("Starts","starts_at",pi(a.starts_at),!0,"datetime-local")}
      ${q("Ends","ends_at",pi(a.ends_at||a.starts_at),!0,"datetime-local")}
      <label class="check-row"><input type="checkbox" name="all_day" ${a.all_day?"checked":""} /> All day</label>
      ${R("Visibility","visibility",a.visibility,[["company","Company"],["private","Private / assigned"]])}
      ${R("Assigned to","assigned_profile_id",a.assigned_profile_id,jd(e))}
      ${R("Linked job","linked_job_id",n,[["","No linked job"]].concat(U(e).map(s=>[s.id,s.name])))}
      <label class="span-2">Description<textarea name="description" rows="4">${r(a.description)}</textarea></label>
      <div class="form-actions span-2">
        <button class="btn btn-primary" type="submit">Save event</button>
        <button class="btn" type="button" data-action="close-modal">Cancel</button>
      </div>
    </form>
  `,"calendar-form-modal")}function rl(e){const t=i.selectedFileId?i.files.find(a=>a.id===i.selectedFileId):null;return t?F("Open file",t.file_name,zr(t),"file-viewer-modal"):""}function ol(e){return F("Forms","Tools",`
    <div class="compact-tool-form">
      <label>
        <span>Type filter</span>
        <select data-form-type-filter>
          <option value="all" ${i.formTypeFilter==="all"?"selected":""}>All types</option>
          ${yt.map(t=>`<option value="${r(t)}" ${i.formTypeFilter===t?"selected":""}>${r(t)}</option>`).join("")}
        </select>
      </label>
      <button class="btn" type="button" data-action="export-forms"><i class="ti ti-download"></i>Export JSON</button>
      <button class="btn btn-primary" type="button" data-action="new-form"><i class="ti ti-plus"></i>New form</button>
    </div>
  `)}function ll(e){const t=i.formStartTab==="templates"?"templates":"blank",a=st(),n=t==="templates"&&(a.find(d=>d.id===i.formStartTemplateId)||a[0])||null,s=n?.title||"",o=n?.description||"",l=n?.type||"Internal",c=n?.questions||[{type:"short",label:"First question",required:!1,options:[]}];return F("Forms","New form builder",`
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
            <div class="gform-accent-strip" style="--form-accent:${r($e(e))}"></div>
            <label><span>Form title</span><input name="title" value="${r(s)}" placeholder="Untitled form" required /></label>
            <label><span>Form description</span><textarea name="description" rows="3" placeholder="What should people know before filling this out?">${r(o)}</textarea></label>
          </article>
          <div class="new-form-question-list">
            ${c.map((d,f)=>cl(d,f)).join("")}
          </div>
        </section>
        <aside class="panel new-form-settings-card">
          <div class="section-head"><div><h2>Setup</h2><p>${n?r(n.title):"Blank starter"}</p></div></div>
          <div class="new-form-grid">
            <label><span>Type</span><select name="type">${yt.map(d=>`<option value="${r(d)}" ${d===l?"selected":""}>${r(d)}</option>`).join("")}</select></label>
            <label><span>Audience</span><input name="audience" value="Internal" /></label>
            <label><span>Linked job</span><select name="linked_job_id"><option value="">Company level</option>${U(e).map(d=>`<option value="${r(d.id)}" ${i.route?.jobId===d.id?"selected":""}>${r(d.name)}</option>`).join("")}</select></label>
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
  `,"form-create-modal builder-modal")}function cl(e,t){const a=ut(e)?`
    <div class="starter-options">
      ${(e.options||["Option 1","Option 2"]).map(n=>`<span>${r(n)}</span>`).join("")}
    </div>
  `:"";return`
    <article class="question-card starter-question-card">
      <div class="question-card-head">
        <span>${t+1}</span>
        <strong>${r(nm(e.type))}</strong>
      </div>
      <label><span>Question</span><input value="${r(e.label||"Untitled question")}" readonly /></label>
      ${e.help?`<small>${r(e.help)}</small>`:""}
      ${a}
      <label class="check-row"><input type="checkbox" ${e.required?"checked":""} disabled /> Required</label>
    </article>
  `}function dl(e,t){return t?F("Forms","Preview form",`
    <div class="form-preview-modal-body">
      ${vo(e,t)}
    </div>
  `,"form-preview-modal"):F("Forms","Preview form",v("Choose a form first."))}function ml(e,t){return t?F("Forms","Manage form",`
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
  `):F("Forms","Manage form",v("Choose a form first."))}function pl(e){const t=i.accountMenuOpen&&!e.target.closest(".account-menu"),a=i.notificationMenuOpen&&!e.target.closest(".notification-center");t&&(i.accountMenuOpen=!1),a&&(i.notificationMenuOpen=!1);const n=e.target.closest("[data-action]");if(n){ul(e,n);return}const s=e.target.closest("[data-select-job]");if(s){e.preventDefault(),bc(s.dataset.selectJob);return}const o=e.target.closest("[data-select-task]");if(o){e.preventDefault(),_c(o.dataset.selectTask);return}const l=e.target.closest("a[href][data-router]");if(!l){(t||a)&&p();return}l.target||l.hasAttribute("download")||(e.preventDefault(),k(l.getAttribute("href")))}function ul(e,t){const a=t.dataset.action;if(a==="refresh-data"){e.preventDefault(),i.dataLoaded=!1,i.sync={label:"Refreshing...",mode:"loading"},p();return}if(a==="sign-out"){e.preventDefault(),i.accountMenuOpen=!1,bl();return}if(a==="toggle-account-menu"){e.preventDefault(),i.accountMenuOpen=!i.accountMenuOpen,i.notificationMenuOpen=!1,p();return}if(a==="toggle-notifications"){e.preventDefault(),i.notificationMenuOpen=!i.notificationMenuOpen,i.accountMenuOpen=!1,p();return}if(a==="mark-all-notifications-read"){e.preventDefault(),Hd(u()).catch(n=>console.warn("Notification read sync failed",n));return}if(a==="open-notification"){e.preventDefault(),Jd(t.dataset.notificationId).catch(n=>console.warn("Notification open sync failed",n));return}if(a==="verify-email"){e.preventDefault(),i.accountMenuOpen=!1,w("Email verification is not implemented yet. Account access is not blocked right now.","local");return}if(a==="start-demo-mode"){e.preventDefault(),es(t.dataset.returnUrl||"");return}if(a==="open-auth-modal"){e.preventDefault();const n=Zi(t.dataset.authMode||"signin")||"signin";i.authMode=n,i.loginError="",i.authMessage="",k(`/?auth=${encodeURIComponent(n)}`);return}if(a==="close-auth-modal"){e.preventDefault(),i.loginError="",i.authMessage="",k("/");return}if(a==="set-auth-mode"){e.preventDefault();const n=["signin","register","invite","request"].includes(t.dataset.authMode)?t.dataset.authMode:"signin";if(i.authMode=n,i.loginError="",i.authMessage="",i.route?.name==="home"||i.route?.name==="login"){const s=new URLSearchParams(i.route.params);i.route.name==="home"?(s.set("auth",n),s.delete("mode")):(s.set("mode",n),s.delete("auth"));const o=s.toString();k(`${i.route.path}${o?`?${o}`:""}`,{replace:!0});return}p();return}if(a==="open-profile"){e.preventDefault(),i.accountMenuOpen=!1,i.modal="profile",p();return}if(a==="open-role-form"){e.preventDefault(),i.modal="role-new",p();return}if(a==="view-as-role"){e.preventDefault();const n=u(),s=et(n,t.dataset.roleId);if(!s){w("That role is no longer available.","local","Role preview");return}i.rolePreview={company_id:n,role_id:s.id},w(`Viewing the workspace as ${s.name}.`,"local","Role preview");return}if(a==="exit-role-preview"){e.preventDefault(),i.rolePreview=null,w("Role preview ended.","live","Role preview");return}if(a==="open-invite-form"){e.preventDefault(),i.modal="invite-new",p();return}if(a==="new-message-group"){e.preventDefault(),i.modal="message-group-new",p();return}if(a==="new-direct-message"){e.preventDefault(),i.modal="message-direct-new",p();return}if(a==="manage-message-chat"){e.preventDefault(),i.selectedConversationId=t.dataset.conversationId||i.selectedConversationId,i.modal="message-access",p();return}if(a==="message-details"){e.preventDefault(),i.selectedConversationId=t.dataset.conversationId||i.selectedConversationId,i.modal="message-details",p();return}if(a==="message-search-results"){e.preventDefault(),i.modal="message-search",p();return}if(a==="set-message-filter"){e.preventDefault(),i.messageFilter=["all","unread",...on].includes(t.dataset.filter)?t.dataset.filter:"all",p();return}if(a==="delete-message"){e.preventDefault(),Ll(t.dataset.messageId);return}if(a==="open-message-attachment"){e.preventDefault(),Ql(t.dataset.attachmentId);return}if(a==="run-message-scenario"){e.preventDefault(),Od(u());return}if(a==="reset-message-demo"){e.preventDefault(),Rd();return}if(a==="set-calendar-scope"){e.preventDefault(),i.calendarScope=t.dataset.scope==="me"?"me":"company",p();return}if(a==="set-calendar-view"){e.preventDefault(),i.calendarView=["month","week","list"].includes(t.dataset.view)?t.dataset.view:"week",p();return}if(a==="calendar-prev"){e.preventDefault(),li(-1),p();return}if(a==="calendar-next"){e.preventDefault(),li(1),p();return}if(a==="calendar-today"){e.preventDefault(),i.calendarCursorDate=h(0),p();return}if(a==="open-calendar-event"){e.preventDefault(),i.selectedCalendarEventId=t.dataset.eventId||"",i.modal="calendar-event-detail",p();return}if(a==="open-calendar-event-form"){if(e.preventDefault(),!T("calendar.manage",u())){w("Your role can view the calendar but cannot create company events.","local","Calendar");return}i.selectedCalendarEventId="",i.modal="calendar-event-new",p();return}if(a==="edit-calendar-event"){e.preventDefault();const n=kt(t.dataset.eventId);if(!n||!St(n)){w("This event cannot be edited from Calendar.","local","Calendar");return}i.selectedCalendarEventId=n.id,i.modal="calendar-event-edit",p();return}if(a==="delete-calendar-event"){e.preventDefault(),Nl(t.dataset.eventId);return}if(a==="copy-invite-link"){e.preventDefault(),Ml(t.dataset.inviteId);return}if(a==="copy-invite-code"){e.preventDefault(),Al(t.dataset.inviteId);return}if(a==="revoke-invite"){e.preventDefault(),Fl(t.dataset.inviteId);return}if(a==="approve-join-request"){e.preventDefault(),ii(t.dataset.requestId,"approved");return}if(a==="reject-join-request"){e.preventDefault(),ii(t.dataset.requestId,"rejected");return}if(a==="start-checkout"){e.preventDefault(),Dl();return}if(a==="review-workspace"){e.preventDefault(),Cl(t.dataset.companyId,t.dataset.status);return}if(a==="open-file-upload"){e.preventDefault(),i.modal="file-upload",p();return}if(a==="open-folder-form"){e.preventDefault(),i.modal="folder-new",p();return}if(a==="open-job-form"){e.preventDefault();const n=t.dataset.jobId||"";n&&(i.selectedJobId=n),i.modal=t.dataset.mode==="edit"?"job-edit":"job-new",p();return}if(a==="open-forms-tools"){e.preventDefault(),i.modal="forms-tools",p();return}if(a==="open-form-actions"){e.preventDefault(),xt(t.dataset.formId,!1),i.modal="form-actions",p();return}if(a==="open-form-preview"){e.preventDefault(),xt(t.dataset.formId,!1),i.modal="form-preview",p();return}if(a==="set-form-start-tab"){e.preventDefault(),i.formStartTab=t.dataset.tab==="templates"?"templates":"blank",i.formStartTab==="blank"&&(i.formStartTemplateId=""),i.formStartTab==="templates"&&!i.formStartTemplateId&&(i.formStartTemplateId=st()[0]?.id||""),p();return}if(a==="select-form-start-template"){e.preventDefault(),i.formStartTab="templates",i.formStartTemplateId=t.dataset.templateId||st()[0]?.id||"",p();return}if(a==="close-modal"){e.preventDefault(),fl();return}if(a==="set-task-view"){e.preventDefault(),i.taskView=t.dataset.view==="board"?"board":"table",localStorage.setItem(wi,i.taskView),p();return}if(a==="set-drive-view"){e.preventDefault(),i.driveView=t.dataset.view==="list"?"list":"grid",localStorage.setItem($i,i.driveView),p();return}if(a==="clock-in"){e.preventDefault(),Gc(u(),t.dataset.taskId||i.route?.params?.get("task_id")||"");return}if(a==="clock-out"){e.preventDefault(),ps();return}if(a==="select-file"){e.preventDefault(),i.selectedFileId=t.dataset.fileId||"",i.modal="file-detail",p();return}if(a==="download-file"){e.preventDefault(),tc(t.dataset.fileId);return}if(a==="delete-file"){e.preventDefault(),ac(t.dataset.fileId);return}if(a==="set-forms-tab"){e.preventDefault(),i.formsTab=t.dataset.tab==="responses"?"responses":"library",p();return}if(a==="set-form-editor-tab"){e.preventDefault(),i.formEditorTab=t.dataset.tab||"questions",p();return}if(a==="new-form"){e.preventDefault(),i.formStartTemplateId=t.dataset.templateId||"",i.formStartTab=t.dataset.startTab==="templates"||i.formStartTemplateId?"templates":"blank",i.formStartTab==="templates"&&!i.formStartTemplateId&&(i.formStartTemplateId=st()[0]?.id||""),i.modal="form-new",p();return}if(a==="select-form"){e.preventDefault(),xt(t.dataset.formId);return}if(a==="toggle-form-card"){e.preventDefault();const n=t.dataset.formId||"";i.expandedFormIds.has(n)?i.expandedFormIds.delete(n):i.expandedFormIds.add(n),p();return}if(a==="edit-form"){e.preventDefault(),xt(t.dataset.formId,!1),i.formsTab="builder",i.formEditorTab="questions",i.modal="",p();return}if(a==="save-form"){e.preventDefault(),Z("Form saved locally"),p();return}if(a==="publish-form"){e.preventDefault(),vi(t.dataset.formId,"Published");return}if(a==="archive-form"){e.preventDefault(),vi(t.dataset.formId,"Archived");return}if(a==="duplicate-form"){e.preventDefault(),om(t.dataset.formId);return}if(a==="delete-form"){e.preventDefault(),lm(t.dataset.formId);return}if(a==="copy-form-link"){e.preventDefault(),cm(t.dataset.formId);return}if(a==="export-forms"){e.preventDefault(),dm(u());return}if(a==="new-finance-invoice"){e.preventDefault(),i.selectedFinanceInvoiceId="",i.modal="finance-invoice-new",p();return}if(a==="edit-finance-invoice"){e.preventDefault(),i.selectedFinanceInvoiceId=t.dataset.invoiceId||"",i.modal="finance-invoice-edit",p();return}if(a==="new-finance-payment"){e.preventDefault(),i.selectedFinanceInvoiceId=t.dataset.invoiceId||i.route?.params?.get("invoice")||"",i.modal="finance-payment-new",p();return}if(a==="new-finance-expense"){e.preventDefault(),i.selectedFinanceExpenseId="",i.selectedFinanceVendorId=t.dataset.vendorId||"",i.modal="finance-expense-new",p();return}if(a==="edit-finance-expense"){e.preventDefault(),i.selectedFinanceExpenseId=t.dataset.expenseId||"",i.modal="finance-expense-edit",p();return}if(a==="new-finance-vendor"){e.preventDefault(),i.selectedFinanceVendorId="",i.modal="finance-vendor-new",p();return}if(a==="edit-finance-vendor"){e.preventDefault(),i.selectedFinanceVendorId=t.dataset.vendorId||"",i.modal="finance-vendor-edit",p();return}if(a==="add-question"){e.preventDefault(),mm(t.dataset.questionType||"multiple");return}if(a==="duplicate-question"){e.preventDefault(),pm(t.dataset.questionId);return}if(a==="delete-question"){e.preventDefault(),um(t.dataset.questionId);return}if(a==="move-question"){e.preventDefault(),fm(t.dataset.questionId,Number(t.dataset.direction||0));return}if(a==="add-question-option"){e.preventDefault(),gm(t.dataset.questionId);return}if(a==="remove-question-option"){e.preventDefault(),bm(t.dataset.questionId,Number(t.dataset.optionIndex||-1));return}if(a==="delete-job"){e.preventDefault(),Hl(t.dataset.jobId);return}a==="delete-task"&&(e.preventDefault(),Wl(t.dataset.taskId))}function fl(){const e=i.route||$t();if(i.modal="",i.formStartTemplateId="",i.formStartTab="blank",i.selectedFinanceInvoiceId="",i.selectedFinanceExpenseId="",i.selectedFinanceVendorId="",e.name==="company"&&e.section==="tasks"&&(e.params.get("new")||e.params.get("edit")||e.params.get("task_id"))){k(m("tasks",e.jobId?{job_id:e.jobId}:{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="jobs"&&e.params.get("tab")==="editor"){const t=e.jobId?x(e.jobId):je();k(m("jobs",{tab:t?"profile":"pipeline",...t?{job_id:t.id}:{}},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="crm"&&e.params.get("account")){k(m("crm",{},e.companyId),{replace:!0});return}if(e.name==="company"&&e.section==="finance"&&(e.params.get("invoice")||e.params.get("expense")||e.params.get("vendor")||e.params.get("report"))){k(m("finance",{},e.companyId),{replace:!0});return}p()}function gl(e){if(e.target.matches("[data-login-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries());if(!(String(t.username||"").trim()===Qe.localUsername&&String(t.password||"")===Qe.localPassword)){i.loginError="Invalid temporary credentials.",p();return}i.loginError="",es(t.return_url||_(m("jobs",{},P())));return}if(e.target.matches("[data-auth-sign-in-form]")){e.preventDefault(),yl(e.target);return}if(e.target.matches("[data-auth-register-form]")){e.preventDefault(),$l(e.target);return}if(e.target.matches("[data-auth-invite-code-form]")){e.preventDefault(),hl(e.target);return}if(e.target.matches("[data-existing-invite-code-form]")){e.preventDefault();const t=Object.fromEntries(new FormData(e.target).entries()),a=String(t.invite_code||"").trim();if(!a){i.loginError="Invite code is required.",p();return}fn(a);return}if(e.target.matches("[data-auth-request-form]")){e.preventDefault(),kl(e.target);return}if(e.target.matches("[data-company-create-form]")){e.preventDefault(),Sl(e.target);return}if(e.target.matches("[data-profile-form]")){e.preventDefault(),_l(e.target).catch(t=>{w(t.message||"Profile save failed.","local","Profile")});return}if(e.target.matches("[data-job-form]")){e.preventDefault(),zl(e.target);return}if(e.target.matches("[data-task-form]")){e.preventDefault(),Jl(e.target);return}if(e.target.matches("[data-new-form-form]")){e.preventDefault(),rm(e.target);return}if(e.target.matches("[data-file-form]")){e.preventDefault(),Yl(e.target);return}if(e.target.matches("[data-folder-form]")){e.preventDefault(),Kl(e.target);return}if(e.target.matches("[data-finance-invoice-form]")){e.preventDefault(),Gl(e.target);return}if(e.target.matches("[data-finance-payment-form]")){e.preventDefault(),Zl(e.target);return}if(e.target.matches("[data-finance-expense-form]")){e.preventDefault(),Xl(e.target);return}if(e.target.matches("[data-finance-vendor-form]")){e.preventDefault(),ec(e.target);return}if(e.target.matches("[data-role-form]")){e.preventDefault(),Il(e.target);return}if(e.target.matches("[data-invite-form]")){e.preventDefault(),ql(e.target);return}if(e.target.matches("[data-message-group-form]")){e.preventDefault(),Tl(e.target);return}if(e.target.matches("[data-direct-message-form]")){e.preventDefault(),Ol(e.target);return}if(e.target.matches("[data-message-access-form]")){e.preventDefault(),xl(e.target);return}if(e.target.matches("[data-message-form]")){e.preventDefault(),Rl(e.target);return}if(e.target.matches("[data-calendar-event-form]")){e.preventDefault(),Pl(e.target);return}if(e.target.matches("[data-user-role-form]")){e.preventDefault(),El(e.target);return}e.target.matches("[data-form-preview-response]")&&(e.preventDefault(),_m(e.target))}async function bl(){if(i.session?.auth==="supabase"){const e=I();e?.auth&&await e.auth.signOut()}localStorage.removeItem(Ve),i.session=null,i.dataLoaded=!1,k("/login",{replace:!0})}function es(e=""){i.loginError="",i.authMessage="",i.session=za(),Qi(),i.activeCompanyId=u(),localStorage.setItem(ye,i.activeCompanyId),$(Ve,i.session),i.dataLoaded=!1,i.dataLoading=!1,k(ua(e||_(m("jobs",{},u()))),{replace:!0})}async function _l(e){const t=new FormData(e),a=b().profile,n=e.elements.avatar_file?.files?.[0]||null;let s=String(t.get("avatar_url")||a.avatar_url||"").trim();if(n&&n.size){const l=await vl(n);if(!l.ok)return;s=l.url}let o=dt({...a,full_name:String(t.get("full_name")||"").trim()||a.full_name||"Quest user",avatar_url:s},a);if(i.session?.auth==="supabase"){const l=I();if(!l){w("Profile upload needs Supabase to be available.","local","Profile");return}const c=await l.from("profiles").update({full_name:o.full_name,avatar_url:o.avatar_url}).eq("id",a.id).select().single();if(c.error){w(c.error.message||"Profile save failed.","local","Profile");return}o=dt(c.data,o),l.auth?.updateUser&&await l.auth.updateUser({data:{full_name:o.full_name,avatar_url:o.avatar_url}}),i.profiles=[o].concat(i.profiles.filter(d=>d.id!==o.id)),o.member_id&&(i.teamMembers=i.teamMembers.map(d=>d.id===o.member_id?{...d,full_name:o.full_name,name:o.full_name,avatar_url:o.avatar_url}:d))}else $(hi,o),i.profileDraft=o;i.session={...b(),profile:o},$(Ve,i.session),i.modal="",w("Profile saved.",i.session?.auth==="supabase"?"live":"local","Profile")}async function vl(e){if(!["image/jpeg","image/png","image/webp"].includes(e.type))return w("Use a PNG, JPG, or WebP image for your profile picture.","local","Profile"),{ok:!1,url:""};if(e.size>2*1024*1024)return w("Profile pictures must be 2 MB or smaller.","local","Profile"),{ok:!1,url:""};if(i.session?.auth!=="supabase"){const f=await Ms(e);return f?{ok:!0,url:f}:(w("Could not read that image file.","local","Profile"),{ok:!1,url:""})}const a=I(),n=b().profile.id,s=Xd(e),o=`${n}/avatar-${Date.now()}.${s}`,l=await a.storage.from("avatars").upload(o,e,{cacheControl:"3600",upsert:!0,contentType:e.type});if(l.error)return w(l.error.message||"Profile picture upload failed.","local","Profile"),{ok:!1,url:""};const c=a.storage.from("avatars").getPublicUrl(o),d=c.data?.publicUrl?`${c.data.publicUrl}?v=${Date.now()}`:"";return d?{ok:!0,url:d}:(w("Profile picture uploaded, but no public URL was returned.","local","Profile"),{ok:!1,url:""})}async function yl(e){const t=Object.fromEntries(new FormData(e).entries()),a=I();if(!a?.auth){i.loginError="Supabase auth is unavailable.",p();return}i.loginError="",i.authMessage="Signing in...",p();const n=await a.auth.signInWithPassword({email:String(t.email||"").trim(),password:String(t.password||"")});if(n.error){i.loginError=n.error.message||"Unable to sign in.",i.authMessage="",p();return}if(await rt(n.data.session),t.invite_token){await fn(t.invite_token,t.return_url);return}i.authMessage="",i.dataLoaded=!1,k(ua(t.return_url||_(m("jobs",{},P()))),{replace:!0})}async function hl(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.invite_code||"").trim();if(!a){i.loginError="Invite code is required.",p();return}i.loginError="",i.authMessage="Checking invite code...",i.authMode="register",p();const n=await wl(a);if(n?.missing){i.loginError="Invite code was not found or is no longer pending.",i.authMessage="",i.authMode="invite",p();return}if(n?.status&&n.status!=="pending"){i.loginError=`This invite is ${n.status}. Ask your company admin for a new code.`,i.authMessage="",i.authMode="invite",p();return}if(n?.expires_at&&Date.parse(n.expires_at)<=Date.now()){i.loginError="This invite code expired. Ask your company admin for a new code.",i.authMessage="",i.authMode="invite",p();return}n?(i.inviteLookup=n,i.authMessage=`Invite found for ${n.email}.`):i.authMessage="";const s=new URLSearchParams({invite:a}),o=ua(t.return_url||"");o&&s.set("return_url",o),s.set("mode","register"),k(`/login?${s.toString()}`,{replace:!0})}async function wl(e){const t=String(e||"").trim(),a=I();if(!t||!a)return null;const n=await a.rpc("lookup_company_invite",{invite_token:t}).catch(o=>({error:o}));if(n.error)return null;const s=Array.isArray(n.data)?n.data[0]:n.data;return s?{token:t,company_id:y(s.company_id||""),company_name:String(s.company_name||s.company_id||"").trim(),email:String(s.email||"").trim(),status:String(s.status||"").trim(),expires_at:s.expires_at||""}:{missing:!0}}async function $l(e){const t=Object.fromEntries(new FormData(e).entries()),a=I();if(!a?.auth){i.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),s=String(t.password||""),o=String(t.full_name||"").trim(),l=String(t.invite_token||"").trim(),c=String(t.company_name||"").trim();if(!n||!s||!o||!l&&!c){i.loginError=l?"Name, email, and password are required.":"Name, email, password, and company workspace are required.",p();return}i.loginError="",i.authMessage=l?"Creating account and accepting invite...":"Creating secure workspace...",p();const d=await a.auth.signUp({email:n,password:s,options:{data:{full_name:o}}});if(d.error){const D=/already|registered|exists/i.test(d.error.message||"");i.loginError=D&&l?"That email already has a Quest HQ account. Sign in with the invited email to accept this invite.":d.error.message||"Unable to create account.",D&&l&&(i.authMode="signin"),i.authMessage="",p();return}let f=d.data.session;if(!f){const D=await a.auth.signInWithPassword({email:n,password:s});if(D.error){i.loginError="Account created. Please sign in to finish workspace setup.",i.authMode="signin",i.authMessage="",p();return}f=D.data.session}if(await rt(f),l){await fn(l,t.return_url);return}const g=await a.rpc("create_company_workspace",{company_name:c});if(g.error){i.loginError=g.error.message||"Account created, but workspace setup failed.",i.authMessage="",p();return}i.activeCompanyId=y(g.data||P()),Mn(i.activeCompanyId),localStorage.setItem(ye,i.activeCompanyId),i.dataLoaded=!1,i.authMessage="",k(m("settings",{tab:"billing"},i.activeCompanyId),{replace:!0})}async function Sl(e){const t=Object.fromEntries(new FormData(e).entries()),a=I(),n=String(t.company_name||"").trim();if(!a||!n){i.loginError="Company workspace name is required.",p();return}const s=await a.rpc("create_company_workspace",{company_name:n});if(s.error){i.loginError=s.error.message||"Workspace setup failed.",p();return}i.activeCompanyId=y(s.data||P()),Mn(i.activeCompanyId),localStorage.setItem(ye,i.activeCompanyId),i.dataLoaded=!1,k(m("settings",{tab:"billing"},i.activeCompanyId),{replace:!0})}async function kl(e){const t=Object.fromEntries(new FormData(e).entries()),a=I();if(!a?.auth){i.loginError="Supabase auth is unavailable.",p();return}const n=String(t.email||"").trim(),s=String(t.password||""),o=y(t.company_id||"");i.loginError="",i.authMessage="Submitting access request...",p();const l=await a.auth.signInWithPassword({email:n,password:s});if(l.error){i.loginError=l.error.message||"Sign in first to request access.",i.authMessage="",p();return}await rt(l.data.session);const c=await a.rpc("request_company_access",{target_company_id:o,request_message:String(t.message||"").trim()||null});if(c.error){i.loginError=c.error.message||"Unable to request access.",i.authMessage="",p();return}i.authMessage="Access request sent. An Owner/Admin must approve it.",i.loginError="",i.authMode="signin",p()}async function Dl(){const e=u();i.sync={label:"Opening billing...",mode:"loading"},p();try{const t=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json",...b().access_token?{Authorization:`Bearer ${b().access_token}`}:{}},body:JSON.stringify({company_id:e,return_url:`${window.location.origin}${_(m("settings",{tab:"billing"},e))}`})}),a=await t.json().catch(()=>({}));if(!t.ok||!a.url)throw new Error(a.error||"Billing is not configured yet.");window.location.href=a.url}catch(t){i.sync={label:t.message||"Billing unavailable",mode:"local"},p()}}async function Cl(e,t){const a=y(e),n=Sa(t);if(!a||!n||!An()){w("Quest developer access is required to review workspaces.","local","Workspace review");return}const s=I();if(i.sync={label:"Updating workspace review...",mode:"loading"},p(),i.session?.auth==="supabase"&&s){const o=await s.rpc("review_company_workspace",{target_company_id:a,next_status:n,review_note:`Marked ${n} from Quest HQ approval console`});if(o.error){i.sync={label:o.error.message||"Workspace review failed",mode:"local"},w(o.error.message||"Workspace review failed.","local","Workspace review"),p();return}}jl(a,n),await Ye(a,"workspace.reviewed","company_subscription",a,{status:n},i.session?.auth==="supabase"),i.sync={label:`Workspace marked ${Bt(n).toLowerCase()}`,mode:i.session?.auth==="supabase"?"live":"local"},w(`Workspace marked ${Bt(n).toLowerCase()}.`,i.session?.auth==="supabase"?"live":"local","Workspace review"),p()}function jl(e,t){const a=Jt({...jt(e)||{},company_id:e,status:t});i.subscriptions=ws(i.subscriptions.filter(s=>s.company_id!==e).concat(a));const n=it({...i.workspaceReviews.find(s=>s.company_id===e)||{},company_id:e,company_name:M(e),status:t,plan_code:a.plan_code,amount_cents:a.amount_cents,currency:a.currency,created_at:new Date().toISOString()});i.workspaceReviews=i.workspaceReviews.filter(s=>s.company_id!==e).concat(n),t==="pending_review"?Mn(e):ad(e)}async function Il(e){const t=u(),a=new FormData(e),n=Ue({id:crypto.randomUUID(),company_id:t,name:a.get("name"),color:a.get("color")||"#f0b23b",priority:a.get("priority")||100,is_system:!1,created_by:b().profile.id}),s=a.getAll("permissions").map(l=>String(l||"")).filter(Boolean),o=I();if(i.session?.auth==="supabase"&&o){const l=await o.from("roles").insert(n).select().single();if(l.error){i.sync={label:l.error.message||"Role save failed",mode:"local"},p();return}const c=Ue(l.data),d=s.map(f=>({role_id:c.id,permission_key:f,effect:"allow"}));d.length&&await o.from("role_permissions").insert(d),i.roles.unshift(c),i.rolePermissions=d.concat(i.rolePermissions).map(Ba),i.sync={label:"Role saved",mode:"live"}}else i.roles.unshift(n),i.rolePermissions=s.map(l=>Ba({role_id:n.id,permission_key:l,effect:"allow"})).concat(i.rolePermissions),i.sync={label:"Role saved locally",mode:"local"};i.modal="",p()}async function ql(e){const t=new FormData(e),a=y(t.get("company_id")||u()),n=String(t.get("email")||"").trim().toLowerCase(),s=String(t.get("role_id")||"").trim();if(!n){i.sync={label:"Invite email is required",mode:"local"},p();return}const o=Wt({id:crypto.randomUUID(),company_id:a,email:n,role_id:gt(s)?s:"",token:Hc(),status:"pending",invited_by:b().profile.id,expires_at:new Date(Date.now()+336*60*60*1e3).toISOString(),created_at:new Date().toISOString()}),l=I();if(i.session?.auth==="supabase"&&l){const c={company_id:o.company_id,email:o.email,role_id:o.role_id||null,token:o.token,status:"pending",invited_by:b().profile.id},d=await l.from("company_invites").insert(c).select().single();if(d.error){i.sync={label:d.error.message||"Invite save failed",mode:"local"},p();return}i.companyInvites.unshift(Wt(d.data)),await Ye(o.company_id,"invite.created","company_invite",d.data.id,{email:o.email},!0),i.sync={label:"Invite code created. Copy it for the new user.",mode:"live"}}else i.companyInvites.unshift(o),Ye(o.company_id,"invite.created","company_invite",o.id,{email:o.email}),i.sync={label:"Invite code created locally",mode:"local"};z("access.invite","Invite code created",`${Q()} created an invite code for ${o.email}.`,m("settings",{tab:"access"},o.company_id),"invite",o.id,o.company_id),i.modal="",p()}async function fn(e,t=""){const a=I();if(!a){i.loginError="Supabase auth is unavailable.",i.authMessage="",p();return}i.authMessage="Accepting workspace invite...",p();const n=await a.rpc("accept_company_invite",{invite_token:String(e||"").trim()});if(n.error){i.loginError=n.error.message||"Unable to accept invite.",i.authMessage="",p();return}const s=y(n.data||P());i.activeCompanyId=s,localStorage.setItem(ye,s),i.inviteLookup=null,i.authMessage="",i.loginError="",i.dataLoaded=!1,k(m("jobs",{},s),{replace:!0})}async function Ml(e){const t=i.companyInvites.find(a=>a.id===e);if(!t?.token){i.sync={label:"Invite link is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(Jc(t)),i.sync={label:"Invite link copied",mode:"live"}}catch{i.sync={label:"Copy failed",mode:"local"}}p()}async function Al(e){const t=i.companyInvites.find(a=>a.id===e);if(!t?.token){i.sync={label:"Invite code is unavailable",mode:"local"},p();return}try{await navigator.clipboard.writeText(t.token),i.sync={label:"Invite code copied",mode:"live"}}catch{i.sync={label:"Copy failed",mode:"local"}}p()}async function Fl(e){const t=i.companyInvites.find(n=>n.id===e);if(!t)return;const a=I();if(i.session?.auth==="supabase"&&a){const n=await a.rpc("revoke_company_invite",{target_invite_id:t.id});if(n.error){i.sync={label:n.error.message||"Invite revoke failed",mode:"local"},p();return}i.sync={label:"Invite revoked",mode:"live"}}else i.sync={label:"Invite revoked locally",mode:"local"};i.companyInvites=i.companyInvites.map(n=>n.id===t.id?Wt({...n,status:"revoked"}):n),Ye(t.company_id,"invite.revoked","company_invite",t.id,{email:t.email}),z("access.invite","Invite revoked",`${Q()} revoked the invite for ${t.email}.`,m("settings",{tab:"access"},t.company_id),"invite",t.id,t.company_id),Y(),p()}async function El(e){const t=new FormData(e),a=y(t.get("company_id")||u()),n=String(t.get("profile_id")||"").trim(),s=String(t.get("role_id")||"").trim(),o=["active","pending","disabled","left"].includes(String(t.get("membership_status")))?String(t.get("membership_status")):"active",l=et(a,s);if(!n||!l){i.sync={label:"Select a user and role",mode:"local"},p();return}const c=ed(a,n,l,o);if(c){i.sync={label:c,mode:"local"},p();return}const d=Ht({company_id:a,profile_id:n,role:wn(l),status:o}),f=ee(a,n),g=$s({company_id:a,profile_id:n,role_id:l.id,assigned_by:b().profile.id}),D=I();if(i.session?.auth==="supabase"&&D){const V=gt(l.id),O=await D.rpc("update_company_member_access",{target_company_id:a,target_profile_id:n,target_role:d.role,target_role_id:V?l.id:null,target_status:o});if(O.error){i.sync={label:O.error.message||"Access update failed",mode:"local"},p();return}Qt(Ht(O.data||d)),V&&oi(g),i.sync={label:V?"User access saved":"Membership saved; create a role to assign permissions",mode:"live"}}else Qt(d),oi(g),i.sync={label:"User access saved locally",mode:"local"};z("access.role","User access updated",`${Q()} set ${It(n)} to ${l.name} / ${A(o)}.`,m("settings",{tab:"access"},a),"membership",n,a,[n].concat(re(a,["users.manage","settings.manage"]))),Ye(a,Wd(f,d),"membership",n,{role:l.name,status:o}),p()}async function ii(e,t){const a=i.joinRequests.find(l=>l.id===e);if(!a||!["approved","rejected"].includes(t))return;const n=I(),s=Ss({...a,status:t}),o=Ht({company_id:a.company_id,profile_id:a.profile_id,role:"member",status:t==="approved"?"active":"disabled"});if(i.session?.auth==="supabase"&&n){const l=await n.rpc("review_company_join_request",{target_request_id:a.id,decision:t,target_role_id:null});if(l.error){i.sync={label:l.error.message||"Request update failed",mode:"local"},p();return}t==="approved"&&Qt(o),i.sync={label:t==="approved"?"Access approved":"Request rejected",mode:"live"}}else t==="approved"&&Qt(o),i.sync={label:t==="approved"?"Access approved locally":"Request rejected locally",mode:"local"};i.joinRequests=i.joinRequests.map(l=>l.id===a.id?s:l),Ye(a.company_id,t==="approved"?"join.approved":"join.rejected","join_request",a.id,{email:a.requested_email}),z("access.request",t==="approved"?"Access approved":"Access rejected",`${Q()} ${t==="approved"?"approved":"rejected"} ${a.requested_email||"a join request"}.`,m("settings",{tab:"access"},a.company_id),"join_request",a.id,a.company_id,[a.profile_id].concat(re(a.company_id,["users.manage","settings.manage"]))),Y(),p()}async function Tl(e){const t=u();if(!T("messages.create_group",t)){w("Your role cannot create group chats.","local","Messages");return}const a=new FormData(e),n=["company","role","custom"].includes(a.get("type"))?String(a.get("type")):"custom",s=ue({id:crypto.randomUUID(),company_id:t,title:String(a.get("title")||"").trim()||"New group chat",type:n,created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=Pn(a,s,n);!o.some(c=>c.target_type==="profile"&&c.target_id===b().profile.id)&&n!=="company"&&o.push(K({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id})),await gn(s,o)&&(i.selectedConversationId=s.id,i.modal="",z("message.group","Group chat created",`${Q()} created ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,Yt(s)),k(m("messages",{conversation:s.id},t),{replace:!0}))}async function Ol(e){const t=u(),a=new FormData(e),n=String(a.get("profile_id")||"").trim();if(!n){w("Choose a person first.","local","Messages");return}const s=ue({id:crypto.randomUUID(),company_id:t,title:It(n),type:"direct",created_by:b().profile.id,last_message_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}),o=[K({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id}),K({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:n})];if(!await gn(s,o))return;i.selectedConversationId=s.id,i.modal="";const c=String(a.get("body")||"").trim();c&&await ts(s,c,[]),z("message.direct","Direct message started",`${Q()} started a direct message with ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,[n]),k(m("messages",{conversation:s.id},t),{replace:!0})}async function xl(e){const t=u();if(!T("messages.manage_groups",t)&&!T("messages.manage",t)){w("Your role cannot manage chat access.","local","Messages");return}const a=i.messageConversations.find(f=>f.id===e.dataset.conversationId);if(!a)return;const n=new FormData(e),s=ue({...a,title:String(n.get("title")||"").trim()||a.title,type:on.includes(n.get("type"))?String(n.get("type")):a.type,updated_at:new Date().toISOString()}),o=Pn(n,s,s.type);s.type!=="company"&&!o.some(f=>f.target_type==="profile"&&f.target_id===b().profile.id)&&o.push(K({id:`msg-access-${crypto.randomUUID()}`,company_id:t,conversation_id:s.id,target_type:"profile",target_id:b().profile.id}));const l=Yt(a);if(!await gn(s,o,!0))return;const d=Yt(s).filter(f=>!l.includes(f));d.length&&z("message.group","Added to chat",`${Q()} added you to ${s.title}.`,m("messages",{conversation:s.id},t),"message_conversation",s.id,t,d),i.modal="",w("Chat access saved.",i.session?.auth==="supabase"?"live":"local","Messages"),p()}async function Rl(e){const t=i.messageConversations.find(o=>o.id===e.dataset.conversationId);if(!t)return;if(!T("messages.send",t.company_id)){w("Your role cannot send messages.","local","Messages");return}const a=new FormData(e),n=String(a.get("body")||"").trim(),s=Array.from(e.elements.attachments?.files||[]);if(!n&&!s.length){w("Type a message or attach a file.","local","Messages");return}if(s.length&&!T("messages.attach_files",t.company_id)){w("Your role cannot attach files.","local","Messages");return}await ts(t,n,s),e.reset(),p()}async function Pl(e){const t=u(),a=Object.fromEntries(new FormData(e).entries()),n=a.id?kt(String(a.id)):null;if(!n&&!T("calendar.manage",t)){w("Your role cannot create or edit calendar events.","local","Calendar");return}if(n&&!St(n)){w("This event cannot be edited from Calendar.","local","Calendar");return}const s=String(a.linked_job_id||"").trim(),o=new Date().toISOString();let l=We({...n||{},id:n?.id||crypto.randomUUID(),company_id:t,title:String(a.title||"").trim()||"Calendar event",description:String(a.description||"").trim(),event_type:ca.includes(a.event_type)?String(a.event_type):"Company event",starts_at:ui(a.starts_at),ends_at:ui(a.ends_at||a.starts_at),all_day:a.all_day==="on",visibility:a.visibility==="private"?"private":"company",linked_type:s?"job":"",linked_id:s,assigned_profile_id:String(a.assigned_profile_id||""),created_by:n?.created_by||b().profile.id,created_at:n?.created_at||o,updated_at:o});const c=I();if(i.session?.auth==="supabase"&&c){const d=cd(l);n&&delete d.id;const f=n?await c.from("calendar_events").update({...d,updated_at:o}).eq("id",n.id).select().single():await c.from("calendar_events").insert(d).select().single();if(f.error){w(f.error.message||"Calendar event save failed.","local","Calendar");return}l=We(f.data)}i.calendarEvents=[l].concat(i.calendarEvents.filter(d=>d.id!==l.id)),js(),z("calendar.event",n?"Calendar event updated":"Calendar event created",`${Q()} ${n?"updated":"created"} ${l.title}.`,m("calendar",{},t),"calendar_event",l.id,t),i.selectedCalendarEventId=`manual:${l.id}`,i.modal="calendar-event-detail",p()}async function Nl(e){const t=kt(e);if(!t||!St(t)){w("This event cannot be deleted from Calendar.","local","Calendar");return}const a=I();if(i.session?.auth==="supabase"&&a){const n=await a.from("calendar_events").delete().eq("id",t.id);if(n.error){w(n.error.message||"Calendar event delete failed.","local","Calendar");return}}i.calendarEvents=i.calendarEvents.filter(n=>n.id!==t.id),js(),z("calendar.event","Calendar event deleted",`${Q()} deleted ${t.title}.`,m("calendar",{},t.company_id),"calendar_event",t.id,t.company_id),i.selectedCalendarEventId="",i.modal="",p()}async function ts(e,t,a){const n=new Date().toISOString(),s=_e({id:crypto.randomUUID(),conversation_id:e.id,company_id:e.company_id,sender_profile_id:b().profile.id,body:t,message_type:a.length?"attachment":"text",created_at:n,updated_at:n}),o=I();let l=s;if(i.session?.auth==="supabase"&&o){const f=await o.from("messages").insert(od(s)).select().single();if(f.error)return w(f.error.message||"Message send failed.","local","Messages"),null;l=_e(f.data)}i.messages=i.messages.concat(l);const c=await Ul(l,a),d={...e,last_message_at:l.created_at,updated_at:l.created_at};return i.messageConversations=i.messageConversations.map(f=>f.id===e.id?d:f),i.session?.auth==="supabase"&&o&&await o.from("message_conversations").update({last_message_at:l.created_at,updated_at:l.created_at}).eq("id",e.id),Aa(e.id,!1),Is(d,l,c),Te(),l}async function Ul(e,t){const a=I(),n=[];for(const s of t){const o=crypto.randomUUID(),l=`${e.company_id}/${e.conversation_id}/${o}-${At(s.name||"attachment")}`;let c="",d="";if(i.session?.auth==="supabase"&&a){const g=await a.storage.from("quest-message-attachments").upload(l,s,{cacheControl:"3600",upsert:!1,contentType:s.type||"application/octet-stream"});if(g.error){w(g.error.message||"Attachment upload failed.","local","Messages");continue}d=l}else s.type?.startsWith("image/")&&s.size<=22e4&&(c=await Ms(s));const f=Ie({id:o,conversation_id:e.conversation_id,message_id:e.id,company_id:e.company_id,bucket_id:"quest-message-attachments",object_path:d,file_name:s.name||"attachment",mime_type:s.type||"application/octet-stream",size_bytes:s.size||0,preview_url:c,created_at:new Date().toISOString()});if(i.session?.auth==="supabase"&&a){const g=await a.from("message_attachments").insert(ld(f)).select().single();if(g.error){w(g.error.message||"Attachment record failed.","local","Messages"),d&&await a.storage.from("quest-message-attachments").remove([d]);continue}n.push(Ie(g.data))}else n.push(f)}return i.messageAttachments=i.messageAttachments.concat(n),n}async function gn(e,t,a=!1){const n=I();if(i.session?.auth==="supabase"&&n){const s=a?await n.from("message_conversations").update(mi(e)).eq("id",e.id).select().single():await n.from("message_conversations").insert(mi(e)).select().single();if(s.error)return w(s.error.message||"Conversation save failed.","local","Messages"),!1;if(await n.from("message_conversation_access").delete().eq("conversation_id",e.id),t.length){const o=await n.from("message_conversation_access").insert(t.map(rd));if(o.error)return w(o.error.message||"Conversation access save failed.","local","Messages"),!1}e=ue(s.data),i.sync={label:"Quest Supabase live",mode:"live"}}return i.messageConversations=[e].concat(i.messageConversations.filter(s=>s.id!==e.id)),i.messageAccess=t.concat(i.messageAccess.filter(s=>s.conversation_id!==e.id)),Aa(e.id,!1),Te(),!0}async function Ll(e){const t=i.messages.find(o=>o.id===e);if(!t)return;if(!(t.sender_profile_id===b().profile.id&&T("messages.delete_own",t.company_id)||T("messages.delete_any",t.company_id))){w("Your role cannot delete this message.","local","Messages");return}const n=new Date().toISOString(),s=I();if(i.session?.auth==="supabase"&&s){const o=await s.from("messages").update({deleted_at:n,updated_at:n}).eq("id",t.id);if(o.error){w(o.error.message||"Message delete failed.","local","Messages");return}}i.messages=i.messages.map(o=>o.id===t.id?{...o,deleted_at:n,updated_at:n}:o),Te(),p()}async function Ql(e){const t=i.messageAttachments.find(n=>n.id===e);if(!t)return;if(t.preview_url){window.open(t.preview_url,"_blank","noopener,noreferrer");return}const a=I();if(i.session?.auth==="supabase"&&a&&t.object_path){const n=await a.storage.from(t.bucket_id||"quest-message-attachments").createSignedUrl(t.object_path,900,{download:t.file_name});if(!n.error&&n.data?.signedUrl){window.open(n.data.signedUrl,"_blank","noopener,noreferrer");return}}w("This demo attachment is metadata-only.","local","Messages")}function Vl(e){if(e.target.matches("[data-global-search]")){i.query=e.target.value,xe();return}if(e.target.matches("[data-file-search]")){i.fileQuery=e.target.value,xe();return}if(e.target.matches("[data-form-search]")){i.formQuery=e.target.value,xe();return}if(e.target.matches("[data-crm-search]")){i.crmQuery=e.target.value,xe();return}if(e.target.matches("[data-message-search]")){i.messageQuery=e.target.value,xe();return}if(e.target.matches("[data-calendar-search]")){i.calendarQuery=e.target.value,xe();return}if(e.target.matches("[data-message-access-filter]")){Ad(e.target);return}if(e.target.matches("[data-form-field]")){Us(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Ls(e.target)}function Bl(e){if(e.target.matches("[data-company-switch]")){const t=e.target.value||P();fc(t);return}if(e.target.matches("[data-stage-filter]")){i.stageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-stage-filter]")){i.crmStageFilter=e.target.value||"all",p();return}if(e.target.matches("[data-crm-owner-filter]")){i.crmOwnerFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-status-filter]")){i.taskStatusFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-priority-filter]")){i.taskPriorityFilter=e.target.value||"all",p();return}if(e.target.matches("[data-calendar-type-filter]")){i.calendarTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-task-job-filter]")){const t=e.target.value;k(m("tasks",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-analytics-job-filter]")){const t=e.target.value;k(m("analytics",t?{job_id:t}:{},u()));return}if(e.target.matches("[data-file-category-filter]")){i.fileCategoryFilter=e.target.value||"All categories",p();return}if(e.target.matches("[data-file-folder-filter]")){const t=e.target.value==="home"?"":e.target.value,a=i.route?.jobId||"";k(m("files",{...t?{folder:t}:{},...a?{job_id:a}:{}},u()));return}if(e.target.matches("[data-file-job-filter]")){const t=e.target.value;k(m("files",{...t?{folder:"jobs",job_id:t}:{}},u()));return}if(e.target.matches("[data-form-type-filter]")){i.formTypeFilter=e.target.value||"all",p();return}if(e.target.matches("[data-form-field]")){Us(e.target);return}(e.target.matches("[data-question-field]")||e.target.matches("[data-question-option]"))&&Ls(e.target)}async function zl(e){const t=He(Object.fromEntries(new FormData(e).entries()));t.id=t.id||crypto.randomUUID(),t.company_id=t.company_id||u(),t.estimate_total=Number(t.estimate_total||0),t.invoice_total=Number(t.invoice_total||0),t.updated_at=new Date().toISOString();const a=i.jobs.some(s=>s.id===t.id),n=I();if(n){const s=a?await n.from("jobs").update(t).eq("id",t.id).select().single():await n.from("jobs").insert(t).select().single();if(!s.error&&s.data){Ua(He(s.data)),i.sync={label:"Quest Supabase live",mode:"live"},i.modal="",k(m("jobs",{tab:"profile",job_id:s.data.id},t.company_id),{replace:!0});return}i.sync={label:"Saved locally",mode:"local"}}Ua(t),i.modal="",k(m("jobs",{tab:"profile",job_id:t.id},t.company_id),{replace:!0})}async function Hl(e){if(!e)return;const t=u(),a=I();a&&await a.from("jobs").delete().eq("id",e),i.jobs=i.jobs.filter(n=>n.id!==e),i.selectedJobId=U(t)[0]?.id||"",i.modal="",Y(),k(m("jobs",{tab:"list"},t),{replace:!0})}async function Jl(e){const t=u(),a=Object.fromEntries(new FormData(e).entries()),n=Je({...a,id:String(a.id||"").trim()||`task-${crypto.randomUUID()}`,company_id:t,creator_id:b().profile.member_id||Me(t)[0]?.id||"abraham",urgency:a.priority||"medium",watchers:[],subtasks:[],activity:[],updated_at:new Date().toISOString()}),s=fa(n.id),o=!!s,l=I();if(l){const c=vd(n),d=o?await l.from("tasks").update(c).eq("id",n.id).select().single():await l.from("tasks").insert(c).select().single();if(!d.error&&d.data){const f=Je(d.data);si(f),bi(f,s),i.sync={label:"Quest Supabase live",mode:"live"},i.modal="",k(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0});return}i.sync={label:"Task saved locally",mode:"local"}}si(n),bi(n,s),i.modal="",k(m("tasks",{...n.project_id?{job_id:n.project_id}:{},task_id:n.id},t),{replace:!0})}async function Wl(e){if(!e)return;const t=u(),a=I();a&&await a.from("tasks").delete().eq("id",e),i.tasks=i.tasks.filter(n=>n.id!==e),i.selectedTaskId="",i.modal="",Y(),k(m("tasks",{},t),{replace:!0})}async function Yl(e){const t=u(),a=new FormData(e),n=Object.fromEntries(a.entries()),s=Array.from(e.elements.files?.files||[]),o=String(n.file_name||"").trim(),l=s.length?s:o?[null]:[];if(!l.length){i.sync={label:"Choose a file or enter a file name",mode:"local"},p();return}const c=I();let d=0;for(const f of l){const g=crypto.randomUUID(),D=f?.name||o,V=String(n.folder||"shared"),O=`${t}/${n.job_id?`jobs/${n.job_id}`:V}/${g}-${At(D)}`;let ne=!1;c&&f&&(ne=!(await c.storage.from("quest-job-files").upload(O,f,{cacheControl:"3600",upsert:!1,contentType:f.type||"application/octet-stream"})).error);const at=ct({id:g,company_id:t,job_id:n.job_id||"",folder:V,file_name:D,mime_type:f?.type||"application/octet-stream",size_bytes:f?.size||Number(n.size_bytes||0),category:n.category||ce(V),notes:n.notes||"",uploaded_by_label:n.uploaded_by_label||b().profile.full_name,bucket_id:"quest-job-files",object_path:ne||!f?O:"",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(c){const De=await c.from("job_files").insert(yd(at)).select().single();if(!De.error&&De.data){ri(ct(De.data)),d+=1;continue}ne&&await c.storage.from("quest-job-files").remove([O])}ri(at)}i.sync=d===l.length?{label:"Quest Supabase live",mode:"live"}:{label:d?"Some files saved locally":"File record saved locally",mode:d?"loading":"local"},z("file.added",l.length>1?"Files added":"File added",`${Q()} added ${l.length} file${l.length===1?"":"s"} to ${ce(n.folder||"shared")}.`,m("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),"file",n.job_id||"",t),i.modal="",k(m("files",{folder:n.folder||"shared",...n.job_id?{job_id:n.job_id}:{}},t),{replace:!0})}function Kl(e){const t=Object.fromEntries(new FormData(e).entries()),a=String(t.name||"").trim();if(!a){i.sync={label:"Folder name is required",mode:"local"},p();return}const n=En({id:`folder-${crypto.randomUUID()}`,company_id:u(),name:a,parent_key:t.parent_key||"home",created_by_label:b().profile.full_name||"Quest HQ",created_at:new Date().toISOString(),updated_at:new Date().toISOString()});i.driveFolders.unshift(n),i.modal="",i.sync={label:"Folder created locally",mode:"local"},z("file.folder","Folder created",`${Q()} created ${n.name}.`,m("files",{folder:n.id},n.company_id),"folder",n.id,n.company_id),Y(),p()}function Gl(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=x(t.job_id),s=String(t.id||"").trim()?Fe(String(t.id).trim()):null,o=Ca({...t,id:String(t.id||"").trim()||`invoice-${crypto.randomUUID()}`,company_id:a,client_name:String(t.client_name||n?.client_name||"").trim(),total:N(t.subtotal)+N(t.tax),updated_at:new Date().toISOString()});nc(o),s?.job_id&&s.job_id!==o.job_id&&La(s.job_id),La(o.job_id),i.modal="",i.sync={label:"Finance saved locally",mode:"local"},z("finance.invoice",s?"Invoice updated":"Invoice created",`${Q()} ${s?"updated":"created"} ${o.invoice_number}.`,m("finance",{invoice:o.id},a),"invoice",o.id,a),k(m("finance",{invoice:o.id},a),{replace:!0})}function Zl(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=Fe(t.invoice_id);if(!n||n.company_id!==a){i.sync={label:"Create an invoice before recording a payment",mode:"local"},p();return}const s=ja({...t,id:`payment-${crypto.randomUUID()}`,company_id:a,created_at:new Date().toISOString()});i.financePayments.unshift(s),n.status=le(n.id)<=0?"Paid":"Partially paid",n.updated_at=new Date().toISOString(),La(n.job_id),Y(),i.modal="",i.sync={label:"Payment recorded locally",mode:"local"},z("finance.payment","Payment recorded",`${Q()} recorded ${S(s.amount)} for ${n.invoice_number}.`,m("finance",{invoice:s.invoice_id},a),"payment",s.id,a),k(m("finance",s.invoice_id?{invoice:s.invoice_id}:{},a),{replace:!0})}function Xl(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=Ia({...t,id:String(t.id||"").trim()||`expense-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});ic(n),i.modal="",i.sync={label:"Expense saved locally",mode:"local"},z("finance.expense","Expense saved",`${Q()} saved a ${S(n.amount)} ${n.category} expense.`,m("finance",{expense:n.id},a),"expense",n.id,a),k(m("finance",{expense:n.id},a),{replace:!0})}function ec(e){const t=Object.fromEntries(new FormData(e).entries()),a=u(),n=qa({...t,id:String(t.id||"").trim()||`vendor-${crypto.randomUUID()}`,company_id:a,updated_at:new Date().toISOString()});sc(n),i.modal="",i.sync={label:"Vendor saved locally",mode:"local"},z("finance.vendor","Vendor saved",`${Q()} saved vendor ${n.name}.`,m("finance",{vendor:n.id},a),"vendor",n.id,a),k(m("finance",{vendor:n.id},a),{replace:!0})}async function tc(e){const t=i.files.find(s=>s.id===e);if(!t?.object_path){i.sync={label:"No stored object for this file",mode:"local"},p();return}const a=I();if(!a)return;const n=await a.storage.from(t.bucket_id||"quest-job-files").createSignedUrl(t.object_path,3600,{download:t.file_name});if(n.error||!n.data?.signedUrl){i.sync={label:"Download failed",mode:"local"},p();return}window.open(n.data.signedUrl,"_blank","noopener,noreferrer")}async function ac(e){const t=i.files.find(n=>n.id===e);if(!t)return;const a=I();a&&(t.object_path&&await a.storage.from(t.bucket_id||"quest-job-files").remove([t.object_path]),await a.from("job_files").update({deleted_at:new Date().toISOString()}).eq("id",e)),i.files=i.files.filter(n=>n.id!==e),i.selectedFileId="",i.modal="",Y(),p()}function Ua(e){const t=i.jobs.findIndex(a=>a.id===e.id);t>=0?i.jobs[t]=e:i.jobs.unshift(e),i.selectedJobId=e.id,Y()}function si(e){const t=i.tasks.findIndex(a=>a.id===e.id);t>=0?i.tasks[t]=e:i.tasks.unshift(e),i.selectedTaskId=e.id,Y()}function ri(e){const t=i.files.findIndex(a=>a.id===e.id);t>=0?i.files[t]=e:i.files.unshift(e),Y()}function nc(e){const t=i.financeInvoices.findIndex(a=>a.id===e.id);t>=0?i.financeInvoices[t]=e:i.financeInvoices.unshift(e),Y()}function ic(e){const t=i.financeExpenses.findIndex(a=>a.id===e.id);t>=0?i.financeExpenses[t]=e:i.financeExpenses.unshift(e),Y()}function sc(e){const t=i.financeVendors.findIndex(a=>a.id===e.id);t>=0?i.financeVendors[t]=e:i.financeVendors.unshift(e),Y()}function Qt(e){const t=i.memberships.findIndex(a=>a.company_id===e.company_id&&a.profile_id===e.profile_id);t>=0?i.memberships[t]=e:i.memberships.unshift(e),Y()}function oi(e){i.roleAssignments=i.roleAssignments.filter(t=>t.company_id!==e.company_id||t.profile_id!==e.profile_id),e.role_id&&i.roleAssignments.unshift(e)}function La(e){if(!e)return;const t=x(e);t&&(t.invoice_total=oe(we(t.company_id).filter(a=>a.job_id===e),"total"),t.updated_at=new Date().toISOString(),Ua(t))}function xe(){const e=document.getElementById("workspace");e&&(as(i.route),e.innerHTML=zi(i.route))}function $t(){const e=bn(),t=new URLSearchParams(window.location.search);if(e==="/login")return{name:"login",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/")return{name:"home",path:e,params:t,section:"",companyId:"",jobId:""};if(e==="/command")return{name:"command",path:e,params:t,section:"dashboard",companyId:u(),jobId:t.get("job_id")||""};const a=e.match(/^\/company\/([^/]+)(?:\/([^/]+))?\/?$/);if(a){const n=a[2]||"jobs";return{name:"company",path:e,params:t,companyId:decodeURIComponent(a[1]),section:n,jobId:t.get("job_id")||""}}return{name:e.replace(/^\//,"")||"command",path:e,params:t,section:"",companyId:u(),jobId:t.get("job_id")||""}}function rc(){const e=bn(),t=new URLSearchParams(window.location.search),a=t.get("company_id")||t.get("company")||Pt(t.get("job_id")||t.get("project_id"))||localStorage.getItem(ye)||P(),n=Object.fromEntries(Object.entries(Gs).map(([l,c])=>[l,m(c,{},a)]));Object.assign(n,{"/index.html":"/","/command.html":m("jobs",{},a),"/login.html":"/login"});let s=n[e];if(e==="/jobs"){const l=t.get("tab");l==="tasks"?s=m("tasks",ie(t,["job_id","task_id","new","edit"]),a):l==="files"?s=m("files",ie(t,["job_id","folder"]),a):l==="forms"?s=m("forms",ie(t,["job_id"]),a):l==="analytics"?s=m("analytics",ie(t,["job_id"]),a):s=m("jobs",ie(t,["job_id","tab"]),a)}if(e==="/files"&&(s=m("files",ie(t,["job_id","folder"]),a)),e==="/forms"&&(s=m("forms",ie(t,["job_id"]),a)),e==="/analytics"&&(s=m("analytics",ie(t,["job_id"]),a)),e==="/crm"&&(s=m("crm",ie(t,["account"]),a)),e==="/finance"&&(s=m("finance",ie(t,["invoice","expense","vendor","report"]),a)),e==="/messages"&&(s=m("messages",ie(t,["conversation"]),a)),e==="/calendar"&&(s=m("calendar",{},a)),e==="/admin"&&(s=m("settings",{},a)),e==="/time"&&(s=m("time",{},a)),e==="/team"&&(s=m("team-chart",{},a)),e==="/team-chart"&&(s=m("team-chart",{},a)),e==="/approvals"&&(s=m("approvals",{},a)),e==="/clock"&&(s=m("clock",{},a)),e==="/task-management.html"){const l=t.get("project_id")||t.get("job_id")||"";s=m("tasks",l?{job_id:l}:{},Pt(l)||a)}const o=e.match(/^\/jobs\/([^/]+)\/tasks\/?$/);if(o){const l=decodeURIComponent(o[1]);s=m("tasks",{job_id:l},Pt(l)||a)}s&&window.history.replaceState({},"",_(s))}function oc(e){if(e.name!=="company")return"";const t=Ee();if(i.session?.auth==="supabase"&&!t.length)return null;if(!t.includes(e.companyId))return i.session?.auth==="supabase"?"":m(e.section||"jobs",Object.fromEntries(e.params.entries()),t[0]||P());if(!bt.map(s=>s.id).includes(e.section))return m("jobs",{},e.companyId);const n=e.jobId?Pt(e.jobId):"";return n&&n!==e.companyId&&t.includes(n)?m(e.section,Object.fromEntries(e.params.entries()),n):""}function bn(){let e=window.location.pathname||"/";return Ne&&e.startsWith(Ne)&&(e=e.slice(Ne.length)||"/"),e.startsWith("/")||(e="/"+e),e.replace(/\/+$/,"")||"/"}function _(e){if(/^https?:\/\//i.test(e))return e;const[t,a=""]=String(e||"/").split("?"),n=t.startsWith("/")?t:"/"+t;return`${Ne}${n}${a?`?${a}`:""}`||"/"}function k(e,t={}){const a=/^https?:\/\//i.test(e)||e.startsWith(Ne+"/")||Ne===""&&e.startsWith("/")?e:_(e);t.replace?window.history.replaceState({},"",a):window.history.pushState({},"",a),p()}function lc(){return`${bn()}${window.location.search}`}function ua(e){try{const t=new URL(e,window.location.origin);return t.origin!==window.location.origin?_(m("jobs",{},P())):`${t.pathname}${t.search}`}catch{return _(m("jobs",{},P()))}}function m(e="jobs",t={},a=u()){const n=new URLSearchParams(t);for(const[s,o]of[...n.entries()])(o==null||o==="")&&n.delete(s);return`/company/${encodeURIComponent(y(a||P()))}/${e}${n.toString()?`?${n.toString()}`:""}`}function cc(e){return e.name==="home"?"Quest HQ":e.name==="company"?A(e.section):e.name==="command"?"Company Dashboard":e.name==="login"?"Sign in":A(e.name||"Workspace")}function dc(e,t){const[a]=t.split("?"),n=a.match(/^\/company\/([^/]+)\/([^/]+)/);return!n||e.name!=="company"?!1:e.companyId===decodeURIComponent(n[1])&&e.section===n[2]}function mc(e){return Si.includes(e)?e:"pipeline"}function pc(e){return{pipeline:"Pipeline",list:"List",profile:"Profile"}[e]||e}function uc(e){const t=e.companyId||i.activeCompanyId||P(),a=Ee();i.activeCompanyId=a.includes(t)?t:a[0]||P(),localStorage.setItem(ye,i.activeCompanyId)}function as(e){const t=u();e.jobId&&U(t).some(n=>n.id===e.jobId)&&(i.selectedJobId=e.jobId),(!i.selectedJobId||!U(t).some(n=>n.id===i.selectedJobId))&&(i.selectedJobId=U(t)[0]?.id||"");const a=e.params.get("task_id");a&&te(t).some(n=>n.id===a)&&(i.selectedTaskId=a),e.section!=="tasks"&&(i.selectedTaskId=""),i.driveFolder=e.params.get("folder")||"home"}function fc(e){const t=Ee(),a=y(e),n=t.includes(a)?a:t[0]||P();i.activeCompanyId=n,localStorage.setItem(ye,n),gc();const s=i.route||$t(),o=s.name==="company"?s.section:"jobs";k(m(o,{},n))}function gc(){i.modal="",i.selectedJobId="",i.selectedTaskId="",i.selectedFileId="",i.selectedFormId="",i.selectedQuestionId="",i.selectedFinanceInvoiceId="",i.selectedFinanceExpenseId="",i.selectedFinanceVendorId="",i.selectedCalendarEventId="",i.query="",i.fileQuery="",i.formQuery="",i.crmQuery="",i.stageFilter="all",i.crmStageFilter="all",i.crmOwnerFilter="all",i.taskStatusFilter="all",i.taskPriorityFilter="all",i.calendarQuery="",i.calendarTypeFilter="all",i.calendarScope="company",i.fileCategoryFilter="All categories",i.formTypeFilter="all",i.formsTab="library",i.driveFolder="home"}function bc(e){const t=x(e);t&&(i.selectedJobId=e,k(m("jobs",{tab:"profile",job_id:e},t.company_id)))}function _c(e){const t=fa(e);t&&(i.selectedTaskId=e,k(m("tasks",{...t.project_id?{job_id:t.project_id}:{},task_id:e},t.company_id)))}function je(){return x(i.selectedJobId)||U(u())[0]||null}function x(e){return i.jobs.find(t=>t.id===e)||null}function fa(e){return i.tasks.find(t=>t.id===e)||null}function U(e=u()){return i.jobs.filter(t=>t.company_id===e)}function te(e=u()){return i.tasks.filter(t=>t.company_id===e)}function vc(e=u()){const t=b().profile.id;return i.notifications.filter(a=>a.company_id===e&&a.recipient_profile_id===t).sort((a,n)=>Date.parse(n.created_at||0)-Date.parse(a.created_at||0))}function Ze(e=u()){const t=i.messageQuery.trim().toLowerCase(),a=i.messageFilter||"all";return i.messageConversations.filter(n=>n.company_id===e&&Sc(n)).filter(n=>a==="all"||n.type===a||a==="unread"&&_n(n.id)>0).filter(n=>{if(!t)return!0;const s=Xe(n.id).some(o=>o.body.toLowerCase().includes(t));return n.title.toLowerCase().includes(t)||s}).sort((n,s)=>Date.parse(s.last_message_at||s.updated_at||s.created_at||0)-Date.parse(n.last_message_at||n.updated_at||n.created_at||0))}function yc(e=u()){return Ze(e).reduce((t,a)=>t+_n(a.id),0)}function ns(e=u()){const t=Ze(e),n=i.route?.params?.get("conversation")||""||i.selectedConversationId;return t.find(s=>s.id===n)||t[0]||null}function Xe(e){return i.messages.filter(t=>t.conversation_id===e&&!t.deleted_at).sort((t,a)=>Date.parse(t.created_at||0)-Date.parse(a.created_at||0))}function hc(e){return i.messageAttachments.filter(t=>t.conversation_id===e)}function wc(e){return i.messageAttachments.filter(t=>t.message_id===e)}function ga(e){return i.messageAccess.filter(t=>t.conversation_id===e)}function $c(e,t=b().profile.id){return i.messageReads.find(a=>a.conversation_id===e&&a.profile_id===t)||null}function _n(e,t=b().profile.id){const a=Date.parse($c(e,t)?.last_read_at||0);return Xe(e).filter(n=>n.sender_profile_id!==t&&Date.parse(n.created_at||0)>a).length}function Sc(e){if(!e||!T("messages.view",e.company_id))return!1;const t=b().profile,a=ga(e.id);if(e.type==="company"||a.some(o=>o.target_type==="all_company"))return!0;const n=new Set([t.id,t.member_id,t.email].filter(Boolean).map(String));if(a.some(o=>o.target_type==="profile"&&n.has(o.target_id)))return!0;const s=[lt(e.company_id,Ct(e.company_id)),...i.roleAssignments.filter(o=>o.company_id===e.company_id&&o.profile_id===t.id).map(o=>o.role_id)];return a.some(o=>o.target_type==="role"&&s.includes(o.target_id))}function ba(e=u()){const t=i.calendarEvents.filter(c=>c.company_id===e&&Ac(c)).map(Cc),a=te(e).filter(c=>c.due&&c.status!=="done").filter(c=>T("calendar.view_team",e)||is(c.assignee_id)||c.creator_id===b().profile.member_id).map(jc),n=T("finance.view",e)?we(e).filter(c=>c.due_date&&le(c.id)>0).map(Ic):[],s=$n(e).filter(c=>c.type!=="Access request"||T("users.manage",e)).map(c=>qc(c,e)),o=Dt(e),l=o&&(T("calendar.view_team",e)||_a(o.user_id))?[Mc(o)]:[];return t.concat(a,n,s,l).sort((c,d)=>Date.parse(c.startsAt||0)-Date.parse(d.startsAt||0))}function kc(e=u()){const t=i.calendarQuery.trim().toLowerCase();return ba(e).filter(a=>i.calendarScope==="company"||a.mine).filter(a=>i.calendarTypeFilter==="all"||a.type===i.calendarTypeFilter).filter(a=>t?[a.title,a.description,a.type,a.owner,a.linkLabel].some(n=>String(n||"").toLowerCase().includes(t)):!0).filter(a=>i.calendarView==="list"||xc(a))}function Dc(e=u()){const t=Date.now();return ba(e).filter(a=>Date.parse(a.endsAt||a.startsAt||0)>=t).slice(0,9)}function Cc(e){const t=e.linked_type==="job"?x(e.linked_id):null;return{id:`manual:${e.id}`,source:"manual",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description,type:e.event_type,startsAt:e.starts_at,endsAt:e.ends_at||e.starts_at,allDay:e.all_day,dateKey:ss(e.starts_at),owner:Tc(e.assigned_profile_id||e.created_by),mine:_a(e.assigned_profile_id)||e.created_by===b().profile.id,href:Fc(e),linkLabel:t?.name||"",editable:St(e)}}function jc(e){const t=e.due_time?`${e.due}T${e.due_time}:00`:`${e.due}T12:00:00`;return{id:`task:${e.id}`,source:"task",sourceId:e.id,companyId:e.company_id,title:e.title,description:e.description||tt(e.type),type:"Task due",startsAt:t,endsAt:t,allDay:!e.due_time,dateKey:e.due,owner:H(e.assignee_id),mine:is(e.assignee_id),href:m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),linkLabel:x(e.project_id)?.name||"Company task",editable:!1}}function Ic(e){return{id:`invoice:${e.id}`,source:"invoice",sourceId:e.id,companyId:e.company_id,title:`${e.invoice_number} due`,description:`${S(le(e.id))} outstanding for ${e.client_name||"client"}.`,type:"Invoice due",startsAt:`${e.due_date}T12:00:00`,endsAt:`${e.due_date}T12:00:00`,allDay:!0,dateKey:e.due_date,owner:e.client_name||"Finance",mine:T("finance.view",e.company_id),href:m("finance",{invoice:e.id},e.company_id),linkLabel:e.client_name||"Finance",editable:!1}}function qc(e,t=u()){const a=String(e.updatedAt||h(0)).slice(0,10);return{id:`approval:${e.id}`,source:"approval",sourceId:e.id,companyId:t,title:e.title,description:e.meta,type:"Approval",startsAt:`${a}T12:00:00`,endsAt:`${a}T12:00:00`,allDay:!0,dateKey:a,owner:e.owner,mine:!0,href:e.href,linkLabel:e.status,editable:!1}}function Mc(e){const t=ss(e.started_at);return{id:`timer:${e.id}`,source:"timer",sourceId:e.id,companyId:e.company_id,title:e.task_title||"Active timer",description:"Current clock session.",type:"Time",startsAt:e.started_at,endsAt:new Date().toISOString(),allDay:!1,dateKey:t,owner:H(e.user_id),mine:_a(e.user_id),href:m("time",{},e.company_id),linkLabel:"My time",editable:!1}}function Ac(e){return!e||!T("calendar.view",e.company_id)?!1:e.visibility!=="private"?!0:T("calendar.view_team",e.company_id)||St(e)||_a(e.assigned_profile_id)}function St(e){return e?T("calendar.manage",e.company_id)||e.created_by===b().profile.id:!1}function Fc(e){return e.linked_type==="job"&&e.linked_id&&T("jobs.view",e.company_id)?m("jobs",{tab:"profile",job_id:e.linked_id},e.company_id):e.linked_type==="task"&&e.linked_id&&T("tasks.view",e.company_id)?m("tasks",{task_id:e.linked_id},e.company_id):e.linked_type==="form"&&e.linked_id&&T("forms.view",e.company_id)?m("forms",{form_id:e.linked_id},e.company_id):e.linked_type==="invoice"&&e.linked_id&&T("finance.view",e.company_id)?m("finance",{invoice:e.linked_id},e.company_id):""}function Ec(e,t=u()){return ba(t).find(a=>a.id===e)||null}function kt(e){return i.calendarEvents.find(t=>t.id===e)||null}function is(e){return String(e||"")===String(b().profile.member_id||b().profile.id||"")}function _a(e){const t=b().profile;return[t.id,t.member_id,t.email].filter(Boolean).map(String).includes(String(e||""))}function Tc(e){return e?Ae(e)?.full_name||H(e):"Unassigned"}function ss(e){if(!e)return h(0);const t=new Date(e);return Number.isNaN(t.getTime())?String(e).slice(0,10):t.toISOString().slice(0,10)}function rs(e,t){return e.filter(a=>a.dateKey===t).sort((a,n)=>Date.parse(a.startsAt||0)-Date.parse(n.startsAt||0))}function Oc(e){const t=vn(new Date),a=new Date(t);return a.setDate(t.getDate()+7),e.filter(n=>{const s=Date.parse(n.startsAt||n.dateKey||0);return s>=t.getTime()&&s<a.getTime()})}function xc(e){const t=new Date(`${e.dateKey}T00:00:00`);if(i.calendarView==="month"){const s=new Date(`${i.calendarCursorDate}T00:00:00`);return t.getFullYear()===s.getFullYear()&&t.getMonth()===s.getMonth()}const a=vn(new Date(`${i.calendarCursorDate}T00:00:00`)),n=new Date(a);return n.setDate(a.getDate()+7),t>=a&&t<n}function Rc(e){const t=new Date(`${e}T00:00:00`),a=new Date(t.getFullYear(),t.getMonth(),1),n=new Date(a);return n.setDate(a.getDate()-a.getDay()),Array.from({length:42},(s,o)=>{const l=new Date(n);return l.setDate(n.getDate()+o),{key:yn(l),label:String(l.getDate()),month:l.getMonth()}})}function os(e){const t=vn(new Date(`${e}T00:00:00`));return Array.from({length:7},(a,n)=>{const s=new Date(t);return s.setDate(t.getDate()+n),{key:yn(s),name:new Intl.DateTimeFormat("en-US",{weekday:"short"}).format(s),shortDate:new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(s)}})}function Pc(){const e=new Date(`${i.calendarCursorDate}T00:00:00`);if(i.calendarView==="month")return new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(e);if(i.calendarView==="week"){const t=os(i.calendarCursorDate);return`${E(t[0].key)} - ${E(t[6].key)}`}return"Upcoming"}function vn(e){const t=new Date(e);return t.setHours(0,0,0,0),t.setDate(t.getDate()-t.getDay()),t}function yn(e){const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${n}`}function li(e){const t=new Date(`${i.calendarCursorDate}T00:00:00`);i.calendarView==="month"?t.setMonth(t.getMonth()+e):t.setDate(t.getDate()+e*7),i.calendarCursorDate=yn(t)}function Nc(e){return e.reduce((t,a)=>(t[a.dateKey]=t[a.dateKey]||[],t[a.dateKey].push(a),t),{})}function ls(e){if(e.allDay)return"All day";const t=new Date(e.startsAt);return Number.isNaN(t.getTime())?"Timed":new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(t)}function Uc(e){return`calendar-type-${At(e||"event")}`}function Lc(e){return e==="Task due"?"ti-list-check":e==="Invoice due"?"ti-file-dollar":e==="Approval"?"ti-user-check":e==="Time"?"ti-clock":e.includes("Install")?"ti-hammer":e.includes("Estimate")?"ti-calendar-dollar":e.includes("Personal")?"ti-user":"ti-calendar-event"}function qe(e=u()){return i.files.filter(t=>t.company_id===e)}function ot(e=u()){return i.driveFolders.filter(t=>t.company_id===e)}function Me(e=u()){return i.teamMembers.filter(t=>Array.isArray(t.company_ids)&&t.company_ids.includes(e))}function ae(e=u()){const t=new Map;Me(e).forEach(n=>{t.set(n.id,{profile_id:"",member_id:n.id,name:n.full_name||n.name,email:n.email,avatar_url:n.avatar_url,role:Vt(e,n.id).toLowerCase(),role_label:Vt(e,n.id),role_id:"",status:n.active?"active":"disabled"})}),i.memberships.filter(n=>n.company_id===e).forEach(n=>{const s=Ae(n.profile_id),o=n.member_id?i.teamMembers.find(f=>f.id===n.member_id):null,l=i.roleAssignments.find(f=>f.company_id===e&&f.profile_id===n.profile_id),c=l?et(e,l.role_id):null,d=n.profile_id||n.member_id;t.set(d,{profile_id:n.profile_id,member_id:n.member_id,name:s?.full_name||o?.full_name||s?.email||o?.name||d||"User",email:s?.email||o?.email||"",avatar_url:s?.avatar_url||o?.avatar_url||"",role:n.role,role_label:c?.name||A(n.role),role_id:l?.role_id||lt(e,n.role),status:n.status||"active"})});const a=b().profile;if(i.session?.auth==="supabase"&&a?.id&&!t.has(a.id)){const n=ee(e,a.id);n&&t.set(a.id,{profile_id:a.id,member_id:a.member_id||"",name:a.full_name||a.email,email:a.email,avatar_url:a.avatar_url,role:n.role,role_label:A(n.role),role_id:lt(e,n.role),status:n.status||"active"})}return[...t.values()].sort((n,s)=>(n.status==="active"?0:1)-(s.status==="active"?0:1)||n.name.localeCompare(s.name))}function Qc(e=u()){return i.companyInvites.filter(t=>t.company_id===e&&t.status==="pending").sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function Vc(e=u()){return i.auditEvents.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.created_at||0)-Date.parse(t.created_at||0))}function Bc(e){const t=Ae(e.actor_profile_id),a=t?.full_name||t?.email||Js(e.actor_profile_id||"system");return`
    <article class="access-audit-row">
      ${me({full_name:a,email:t?.email||""},"avatar small")}
      <span>
        <strong>${r(A(String(e.event_type||"access.event").replace(/[._-]+/g," ")))}</strong>
        <small>${r(a)} / ${E(e.created_at)}</small>
      </span>
    </article>
  `}function he(e=u()){const t=i.roles.filter(a=>a.company_id===e);return t.length?t.sort((a,n)=>n.priority-a.priority||a.name.localeCompare(n.name)):[Ue({id:`owner-${e}`,company_id:e,name:"Owner",color:"#f0b23b",priority:1e3,is_system:!0}),Ue({id:`admin-${e}`,company_id:e,name:"Admin",color:"#60a5fa",priority:800,is_system:!0}),Ue({id:`staff-${e}`,company_id:e,name:"Staff",color:"#15803d",priority:100,is_system:!0})]}function et(e,t){return he(e).find(a=>a.id===t)||null}function va(e=u()){return!i.rolePreview||i.rolePreview.company_id!==e?null:et(e,i.rolePreview.role_id)}function Qa(e,t){if(!t)return!0;const a=String(e?.name||"").toLowerCase();if(["owner","admin","developer"].includes(a))return!0;const n=hn(t),s=i.rolePermissions.filter(c=>c.role_id===e?.id);if(s.some(c=>(n.includes(c.permission_key)||c.permission_key==="*")&&c.effect==="deny"))return!1;if(s.some(c=>(n.includes(c.permission_key)||c.permission_key==="*")&&c.effect==="allow"))return!0;if(s.length)return!1;const o=wn(e),l=Be[o]||Be.member;return l.includes("*")||n.some(c=>l.includes(c))}function hn(e){return B([e,...Ks[e]||[]])}function lt(e,t){const a=String(t||"").toLowerCase();return he(e).find(n=>n.name.toLowerCase()===a||n.id.toLowerCase()===a)?.id||""}function zc(e=u()){const t=he(e).filter(a=>a.name.toLowerCase()!=="owner");return t.find(a=>a.name.toLowerCase()==="staff")?.id||t.find(a=>a.name.toLowerCase()==="member")?.id||t[0]?.id||""}function Hc(){const e=new Uint8Array(8);return crypto.getRandomValues(e),`QH-${Array.from(e,t=>t.toString(36).padStart(2,"0")).join("").toUpperCase()}`}function Jc(e){const t=new URL(_("/login"),window.location.origin);return t.searchParams.set("invite",e.token),t.toString()}function wn(e){const t=String(e?.name||"").toLowerCase().replace(/\s+/g,"_");return["owner","member","worker","sales","supervisor","admin","developer","construction_supervisor"].includes(t)?t:"member"}function Ae(e){return i.profiles.find(t=>t.id===e)||(b().profile.id===e?b().profile:null)}function cs(e=u()){const t=i.query.trim().toLowerCase();return U(e).filter(a=>i.stageFilter!=="all"&&a.stage!==i.stageFilter?!1:t?[a.name,a.client_name,a.contact_name,a.owner_name,a.site_address,a.job_type,M(a.company_id)].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function ya(e=u()){const t=new Map;return U(e).forEach(a=>{const n=String(a.client_name||"").trim()||"Unassigned customer",s=`account-${At(n.toLowerCase())}`;t.has(s)||t.set(s,{key:s,name:n,jobs:[]}),t.get(s).jobs.push(a)}),Array.from(t.values()).map(a=>{const n=a.jobs.slice().sort((O,ne)=>Date.parse(ne.updated_at||ne.created_at||0)-Date.parse(O.updated_at||O.created_at||0)),s=n[0]||null,o=n.map(O=>O.id),l=te(e).filter(O=>o.includes(O.project_id)),c=ke(e).filter(O=>o.includes(O.linked_job_id)),d=qe(e).filter(O=>o.includes(O.job_id)),f=B(n.map(O=>O.contact_name)),g=B(n.map(O=>O.owner_name)),D=B(n.map(O=>O.site_address)),V=n.map(O=>O.priority||"Medium").sort((O,ne)=>Ke(ne)-Ke(O))[0]||"Medium";return{...a,jobs:n,tasks:l,latestJob:s,contacts:f,owners:g,addresses:D,forms:c,files:d,primaryContact:f[0]||"No contact",owner:g[0]||"Unassigned",stage:s?.stage||"Lead",priority:V,estimateTotal:oe(n,"estimate_total"),fileCount:d.length,formCount:c.length,updatedAt:s?.updated_at||s?.created_at||new Date().toISOString(),subtitle:D[0]||`${n.length} linked job${n.length===1?"":"s"}`}}).sort((a,n)=>Date.parse(n.updatedAt||0)-Date.parse(a.updatedAt||0))}function Wc(e=u()){const t=i.crmQuery.trim().toLowerCase();return ya(e).filter(a=>i.crmStageFilter!=="all"&&!a.jobs.some(n=>n.stage===i.crmStageFilter)||i.crmOwnerFilter!=="all"&&!a.owners.includes(i.crmOwnerFilter)?!1:t?[a.name,a.primaryContact,a.owner,a.stage,...a.addresses,...a.contacts,...a.jobs.map(n=>n.name)].some(n=>String(n||"").toLowerCase().includes(t)):!0)}function Yc(e,t){return ya(e).find(a=>a.key===t)||null}function Kc(e=u()){return B(U(e).map(t=>t.owner_name)).sort((t,a)=>t.localeCompare(a))}function ds(e=u()){const t=b().profile.member_id||"",a=te(e).slice().sort(di),n=a.filter(Sn),s=n.filter(D=>D.due===h(0)),o=n.filter(D=>yi(D.due)<0),l=n.filter(D=>{const V=yi(D.due);return V>=0&&V<=7}),c=n.filter(D=>D.assignee_id===t),d=n.filter(D=>["review","pending"].includes(D.status)),f=a.filter(D=>D.status==="done"),g=B(o.concat(s,c,d,l).map(D=>D.id)).map(D=>a.find(V=>V.id===D)).filter(Boolean).sort(di);return{tasks:a,open:n,dueToday:s,overdue:o,thisWeek:l,assignedToMe:c,review:d,done:f,focus:g}}function $n(e=u()){const t=ke(e).filter(s=>(s.require_approval||s.type==="Client approval")&&!["Archived","Closed","Approved"].includes(s.status)).map(s=>({id:`form:${s.id}`,title:s.title,meta:x(s.linked_job_id)?.name||s.description||"Company form",type:"Form approval",owner:H(s.creator_id),status:s.status,updatedAt:s.updated_at||s.created_at,href:m("forms",{form_id:s.id},e)})),a=te(e).filter(s=>["review","pending"].includes(s.status)).map(s=>({id:`task:${s.id}`,title:s.title,meta:x(s.project_id)?.name||s.description||"Company task",type:"Task review",owner:H(s.assignee_id),status:ge(s.status),updatedAt:s.updated_at||s.due,href:m("tasks",{...s.project_id?{job_id:s.project_id}:{},task_id:s.id},e)})),n=i.memberships.filter(s=>s.company_id===e&&s.status!=="active").map(s=>({id:`access:${s.profile_id||s.member_id}`,title:H(s.member_id||s.profile_id),meta:`${A(s.role)} access request`,type:"Access request",owner:"Quest admin",status:A(s.status),updatedAt:new Date().toISOString(),href:m("settings",{tab:"access"},e)}));return t.concat(a,n).sort((s,o)=>Date.parse(o.updatedAt||0)-Date.parse(s.updatedAt||0))}function Dt(e=u()){const t=i.activeTimer;return!t||t.company_id!==e?null:t}function ms(e=u()){return i.timeEntries.filter(t=>t.company_id===e).sort((t,a)=>Date.parse(a.started_at||0)-Date.parse(t.started_at||0))}function ci(e=u(),t=0){return ms(e).filter(a=>Date.parse(a.started_at||0)>=t).reduce((a,n)=>a+N(n.duration_ms),0)}function Gc(e=u(),t=""){i.activeTimer&&ps(!1);const a=t?fa(t):null;i.activeTimer={id:`timer-${crypto.randomUUID()}`,company_id:e,user_id:b().profile.member_id||b().profile.id,task_id:a?.company_id===e?a.id:"",task_title:a?.company_id===e?a.title:"",started_at:new Date().toISOString()},Cs(),i.sync={label:"Clock started locally",mode:"local"},p()}function ps(e=!0){const t=i.activeTimer;if(!t)return;const a=new Date().toISOString(),n=Math.max(0,Date.parse(a)-Date.parse(t.started_at||a));i.timeEntries.unshift({id:`time-${crypto.randomUUID()}`,company_id:t.company_id,user_id:t.user_id,task_id:t.task_id||"",task_title:t.task_title||"",started_at:t.started_at,ended_at:a,duration_ms:n,notes:t.task_title?"Task timer":"General shift"}),i.activeTimer=null,Cs(),i.sync={label:"Clock stopped locally",mode:"local"},e&&p()}function Sn(e){return e.status!=="done"}function di(e,t){const a=Date.parse(e.due||0)-Date.parse(t.due||0);return a||Ke(t.priority)-Ke(e.priority)}function we(e=u()){return i.financeInvoices.filter(t=>t.company_id===e).sort(ft("updated_at"))}function us(e=u()){return i.financePayments.filter(t=>t.company_id===e)}function kn(e=u()){return i.financeExpenses.filter(t=>t.company_id===e).sort(ft("updated_at"))}function Dn(e=u()){return i.financeVendors.filter(t=>t.company_id===e)}function Fe(e){return i.financeInvoices.find(t=>t.id===e)||null}function fs(e){return i.financeExpenses.find(t=>t.id===e)||null}function Cn(e){return i.financeVendors.find(t=>t.id===e)||null}function Va(e){return Cn(e)?.name||"No vendor"}function gs(e){return i.financePayments.filter(t=>t.invoice_id===e).sort(ft("received_at"))}function jn(e){return oe(gs(e),"amount")}function le(e){const t=Fe(e);return Math.max(0,N(t?.total)-jn(e))}function bs(e){const t=le(e.id);return t<=0&&N(e.total)>0?"Paid":t<N(e.total)?"Partially paid":e.status==="Sent"&&zs(e.due_date)>0?"Overdue":e.status}function _s(e=u()){const t=we(e),a=us(e),n=kn(e).filter(c=>["Approved","Paid"].includes(c.status)),s={current:0,thirty:0,sixty:0,overSixty:0};t.forEach(c=>{const d=le(c.id);if(!d)return;const f=zs(c.due_date);f<=0?s.current+=d:f<=30?s.thirty+=d:f<=60?s.sixty+=d:s.overSixty+=d});const o=oe(a,"amount"),l=oe(n,"amount");return{pipeline:oe(U(e),"estimate_total"),invoiced:oe(t,"total"),collected:o,outstanding:t.reduce((c,d)=>c+le(d.id),0),expenses:l,net:o-l,aging:s}}function Zc(e=u(),t=""){const a=i.query.trim().toLowerCase();return te(e).filter(n=>t&&n.project_id!==t||i.taskStatusFilter!=="all"&&n.status!==i.taskStatusFilter||i.taskPriorityFilter!=="all"&&n.priority!==i.taskPriorityFilter?!1:a?[n.title,n.description,tt(n.type),H(n.assignee_id),x(n.project_id)?.name].some(s=>String(s||"").toLowerCase().includes(a)):!0)}function vs(){const e=Ee();return i.companies.filter(t=>e.includes(t.id))}function T(e,t=u()){if(!e)return!0;const a=va(t);if(a)return Qa(a,e);const n=hn(e),s=b().profile;if(i.session?.auth==="supabase"){const c=ee(t,s.id);if(!c||c.status!=="active")return!1;if(["owner","developer"].includes(String(c.role).toLowerCase()))return!0;const d=i.roleAssignments.filter(g=>g.company_id===t&&g.profile_id===s.id).map(g=>g.role_id),f=i.rolePermissions.filter(g=>d.includes(g.role_id));if(f.some(g=>(n.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="deny"))return!1;if(f.some(g=>(n.includes(g.permission_key)||g.permission_key==="*")&&g.effect==="allow"))return!0}const o=String(ee(t,s.id)?.role||s.role||"member").toLowerCase(),l=Be[o]||Be.member;return l.includes("*")||n.some(c=>l.includes(c))}function Ee(){const e=b().profile,t=i.companies.map(s=>s.id);if(i.session?.auth==="supabase"){const s=i.memberships.filter(o=>o.profile_id===e.id&&o.status==="active").map(o=>y(o.company_id));return B(s).filter(o=>t.includes(o))}if(["developer","admin"].includes(e.role))return B(t.length?t:wt.map(s=>y(s.id)));const a=i.memberships.filter(s=>s.profile_id===e.id&&s.status==="active").map(s=>y(s.company_id)),n=a.length?a:e.company_ids||[];return B(n.map(y)).filter(s=>t.includes(s))}function u(){const e=Ee();return e.includes(i.activeCompanyId)?i.activeCompanyId:e[0]||i.activeCompanyId||P()}function P(){return y(wt[0].id)}function ha(e){const t=y(e);return i.companies.find(a=>a.id===t)||wt.map(ze).find(a=>a.id===t)||null}function M(e){const t=ha(e);return t?wa(t):e||"Company"}function wa(e){return e.short_name||e.label||e.name||e.id}function $e(e){return ha(e)?.color||"#f0b23b"}function Pt(e){return y(i.jobs.find(t=>t.id===e)?.company_id||"")}function Ct(e){const t=va(e);if(t)return`Preview: ${t.name}`;const a=b().profile;return i.session?.auth!=="supabase"&&["developer","admin"].includes(a.role)?A(a.role):A(ee(e,a.id)?.role||a.role||"member")}function Vt(e,t){const a=i.memberships.find(n=>n.company_id===e&&(n.member_id===t||n.profile_id===t));return A(a?.role||"member")}function ee(e,t){return i.memberships.find(a=>a.company_id===e&&a.profile_id===t)||null}function Xc(e=u()){return i.memberships.filter(t=>t.company_id===e&&t.role==="owner"&&t.status==="active")}function ys(e,t){const a=Xc(e);return a.length===1&&a[0].profile_id===t}function ed(e,t,a,n){const s=ee(e,t),o=wn(a);if(s?.role==="owner"&&s.status==="active"&&(o!=="owner"||n!=="active")&&ys(e,t))return"Promote another active Owner before changing the last Owner.";const l=ee(e,b().profile.id),c=String(b().profile.role||"").toLowerCase();return(["owner","developer"].includes(s?.role)||["owner","developer"].includes(o))&&!["owner","developer"].includes(String(l?.role||c).toLowerCase())?"Only an Owner can change Owner or Developer access.":""}function jt(e=u()){return i.subscriptions.find(t=>t.company_id===e)||null}function td(){const e=i.workspaceReviews.map(it),t=i.subscriptions.filter(s=>["pending_review","active","trialing","suspended","canceled"].includes(s.status)).map(s=>it({company_id:s.company_id,company_name:M(s.company_id),status:s.status,plan_code:s.plan_code,amount_cents:s.amount_cents,currency:s.currency,trial_ends_at:s.trial_ends_at,current_period_end:s.current_period_end,grace_ends_at:s.grace_ends_at,created_at:s.created_at||""})),a=$a().map(s=>it({company_id:s,company_name:M(s),status:"pending_review"})),n=new Map;return t.concat(a,e).forEach(s=>{s.company_id&&n.set(s.company_id,{...n.get(s.company_id)||{},...s})}),Array.from(n.values()).sort((s,o)=>s.status==="pending_review"&&o.status!=="pending_review"?-1:s.status!=="pending_review"&&o.status==="pending_review"?1:String(s.company_name).localeCompare(String(o.company_name)))}function In(e=u()){if(i.session?.auth!=="supabase")return!0;if(qn(e))return!1;const t=jt(e);return!!(!t||["trialing","active","past_due","grace"].includes(t.status)||t.grace_ends_at&&Date.parse(t.grace_ends_at)>Date.now())}function qn(e=u()){const t=jt(e);return t?.status==="pending_review"?!0:["active","past_due","grace"].includes(t?.status)?!1:$a().includes(y(e))}function $a(){return be(nn,[]).map(y).filter(Boolean)}function Mn(e){const t=y(e);if(!t)return;const a=Array.from(new Set($a().concat(t)));$(nn,a)}function ad(e){const t=y(e);t&&$(nn,$a().filter(a=>a!==t))}function nd(e){const t=String(e||"").trim();return!t||i.inviteLookup?.token!==t?null:i.inviteLookup}function hs(e=u()){const t=jt(e);return t?Bt(t.status,t):i.session?.auth==="supabase"?"Approval pending":"Demo mode"}function Bt(e,t={}){const a=Sa(e)||String(e||"");return a==="pending_review"?"Awaiting Quest approval":a==="trialing"?`Trial - ${E(t.trial_ends_at)}`:a==="active"?"Active subscription":a==="past_due"?"Past due grace":a==="grace"?`Grace - ${E(t.grace_ends_at)}`:a==="suspended"?"Suspended":a==="canceled"?"Rejected":A(a||"Unknown")}function Sa(e){const t=String(e||"").toLowerCase().trim();return["pending_review","trialing","active","past_due","grace","suspended","canceled","incomplete"].includes(t)?t:""}function An(){return String(b().profile?.role||"").toLowerCase()==="developer"}function H(e){const t=i.teamMembers.find(a=>a.id===e);return t?.full_name||t?.name||e||"Unassigned"}function It(e){const t=Ae(e);return t?.full_name||t?.email||H(e)}function ka(e){return i.tasks.filter(t=>t.project_id===e).length}function zt(e){return i.files.filter(t=>t.job_id===e).length}function y(e){return{"quest-roofing":"roofing","quest-drafting":"drafting"}[String(e||"").trim()]||String(e||"").trim()}function Fn(e){const t=new Map;return e.map(ze).forEach(a=>{!a.id||t.has(a.id)||t.set(a.id,a)}),Array.from(t.values())}function ws(e){const t=new Map;return e.map(Jt).forEach(a=>{a.company_id&&t.set(a.company_id,{...t.get(a.company_id)||{},...a})}),Array.from(t.values())}function ze(e){return{id:y(e.id||""),name:String(e.name||e.short_name||e.id||"").trim(),short_name:String(e.short_name||e.label||e.name||e.id||"").trim(),color:String(e.color||"#f0b23b"),label:String(e.label||e.short_name||e.name||e.id||"").trim()}}function He(e){return{id:String(e.id||""),company_id:y(e.company_id||P()),name:String(e.name||"").trim()||"Untitled Job",client_name:String(e.client_name||"").trim(),contact_name:String(e.contact_name||"").trim(),site_address:String(e.site_address||"").trim(),job_type:String(e.job_type||"Roofing").trim(),stage:_t.includes(e.stage)?e.stage:"Lead",priority:["Low","Medium","High","Urgent"].includes(e.priority)?e.priority:"Medium",owner_name:String(e.owner_name||"").trim(),scope:String(e.scope||"").trim(),notes:String(e.notes||"").trim(),estimate_total:N(e.estimate_total),invoice_total:N(e.invoice_total),task_count:N(e.task_count),file_count:N(e.file_count),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function Je(e){const t=Ut.includes(String(e.priority||"").toLowerCase())?String(e.priority).toLowerCase():"medium",a=vt.includes(String(e.status||"").toLowerCase())?String(e.status).toLowerCase():"todo";return{id:String(e.id||""),title:String(e.title||"").trim()||"Untitled task",description:String(e.description||"").trim(),type:ki.includes(e.type)?e.type:"admin",label:e.label||null,bid_status:e.bid_status||null,company_id:y(e.company_id||P()),creator_id:String(e.creator_id||"abraham"),assignee_id:String(e.assignee_id||e.creator_id||"abraham"),project_id:String(e.project_id||""),due:String(e.due||h(1)).slice(0,10),due_time:e.due_time||null,reminder_at:e.reminder_at||null,priority:t,urgency:Ut.includes(String(e.urgency||"").toLowerCase())?String(e.urgency).toLowerCase():t,status:a,watchers:Array.isArray(e.watchers)?e.watchers:[],subtasks:Array.isArray(e.subtasks)?e.subtasks:[],activity:Array.isArray(e.activity)?e.activity:[],cleared_at:e.cleared_at||null,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||new Date().toISOString()}}function ct(e){const t=String(e.category||e.folder||"Shared");return{id:String(e.id||crypto.randomUUID()),company_id:y(e.company_id||P()),job_id:String(e.job_id||""),folder:String(e.folder||hm(t)),file_name:String(e.file_name||e.name||"Untitled file"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:N(e.size_bytes),category:t,bucket_id:e.bucket_id||"quest-job-files",object_path:e.object_path||"",uploaded_by_label:String(e.uploaded_by_label||"Quest HQ"),notes:String(e.notes||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function En(e){return{id:String(e.id||`folder-${crypto.randomUUID()}`),company_id:y(e.company_id||P()),name:String(e.name||"New folder").trim()||"New folder",parent_key:String(e.parent_key||"home"),created_by_label:String(e.created_by_label||"Quest HQ"),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function qt(e){const t=Array.isArray(e.questions)?e.questions.map(Da):[],a=yt.includes(e.type)?e.type:"Internal",n=rn.includes(e.status)?e.status:"Draft";return{id:String(e.id||`form-${crypto.randomUUID()}`),company_id:y(e.company_id||P()),title:String(e.title||"Untitled form").trim()||"Untitled form",description:String(e.description||"").trim(),type:a,status:n,audience:String(e.audience||"Internal").trim(),creator_id:String(e.creator_id||e.created_by||e.created_by_id||""),linked_job_id:String(e.linked_job_id||e.job_id||""),theme_color:String(e.theme_color||"#f0b23b"),background:String(e.background||"clean"),submit_label:String(e.submit_label||"Submit").trim()||"Submit",collect_email:e.collect_email!==!1,require_approval:e.require_approval===!0,questions:t,created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Da(e){const t=ht.some(([n])=>n===e.type)?e.type:"short",a={id:String(e.id||`q-${crypto.randomUUID()}`),type:t,label:String(e.label||"Untitled question").trim()||"Untitled question",help:String(e.help||"").trim(),required:e.required===!0,options:Array.isArray(e.options)?e.options.map(n=>String(n||"").trim()).filter(Boolean):[]};return ut(a)&&!a.options.length&&(a.options=["Option 1","Option 2"]),a}function Tn(e){return{id:String(e.id||`response-${crypto.randomUUID()}`),company_id:y(e.company_id||P()),form_id:String(e.form_id||e.formId||""),submitted_by:String(e.submitted_by||e.submitter_email||"Anonymous"),submitter_email:String(e.submitter_email||""),answers:e.answers&&typeof e.answers=="object"?e.answers:{},created_at:e.created_at||new Date().toISOString()}}function Ca(e){const t=N(e.subtotal),a=N(e.tax),n=N(e.total)||t+a;return{id:String(e.id||`invoice-${crypto.randomUUID()}`),company_id:y(e.company_id||P()),job_id:String(e.job_id||""),client_name:String(e.client_name||"").trim(),invoice_number:String(e.invoice_number||`INV-${Date.now()}`).trim(),status:Di.includes(e.status)?e.status:"Draft",issue_date:String(e.issue_date||h(0)).slice(0,10),due_date:String(e.due_date||h(30)).slice(0,10),subtotal:t,tax:a,total:n,notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function ja(e){return{id:String(e.id||`payment-${crypto.randomUUID()}`),company_id:y(e.company_id||P()),invoice_id:String(e.invoice_id||""),amount:N(e.amount),method:Ii.includes(e.method)?e.method:"ACH",received_at:String(e.received_at||h(0)).slice(0,10),reference:String(e.reference||"").trim(),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString()}}function Ia(e){return{id:String(e.id||`expense-${crypto.randomUUID()}`),company_id:y(e.company_id||P()),job_id:String(e.job_id||""),vendor_id:String(e.vendor_id||""),category:da.includes(e.category)?e.category:"Other",amount:N(e.amount),status:Ci.includes(e.status)?e.status:"Pending",spent_at:String(e.spent_at||h(0)).slice(0,10),notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function qa(e){return{id:String(e.id||`vendor-${crypto.randomUUID()}`),company_id:y(e.company_id||P()),name:String(e.name||"New vendor").trim()||"New vendor",contact_name:String(e.contact_name||"").trim(),email:String(e.email||"").trim(),phone:String(e.phone||"").trim(),category:da.includes(e.category)?e.category:"Other",status:ji.includes(e.status)?e.status:"Active",notes:String(e.notes||"").trim(),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function On(e){return{id:String(e.id||""),name:String(e.name||e.full_name||"").trim(),full_name:String(e.full_name||e.name||"").trim(),email:String(e.email||"").trim(),color:String(e.color||"#f0b23b"),avatar_url:String(e.avatar_url||""),active:e.active!==!1,supervisor_id:String(e.supervisor_id||e.manager_id||""),company_ids:Array.isArray(e.company_ids)?B(e.company_ids.map(y)):[]}}function Ht(e){const t=["active","pending","disabled","left"].includes(String(e.status))?String(e.status):"active";return{company_id:y(e.company_id||""),profile_id:String(e.profile_id||e.member_id||""),member_id:e.member_id?String(e.member_id):"",role:String(e.role||"member"),status:t,disabled_at:e.disabled_at||"",disabled_by:String(e.disabled_by||""),left_at:e.left_at||"",last_active_at:e.last_active_at||""}}function Jt(e){return{company_id:y(e.company_id||""),status:Sa(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:N(e.amount_cents||3e4),currency:String(e.currency||"usd"),stripe_customer_id:String(e.stripe_customer_id||""),stripe_subscription_id:String(e.stripe_subscription_id||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||""}}function it(e){return{company_id:y(e.company_id||""),company_name:String(e.company_name||e.name||e.short_name||e.company_id||"").trim(),status:Sa(e.status)||"pending_review",plan_code:String(e.plan_code||"quest_company_300"),amount_cents:N(e.amount_cents||3e4),currency:String(e.currency||"usd"),owner_profile_id:String(e.owner_profile_id||""),owner_name:String(e.owner_name||""),owner_email:String(e.owner_email||""),current_period_end:e.current_period_end||"",trial_ends_at:e.trial_ends_at||"",grace_ends_at:e.grace_ends_at||"",created_at:e.created_at||"",updated_at:e.updated_at||""}}function Ue(e){return{id:String(e.id||""),company_id:y(e.company_id||""),name:String(e.name||"Role").trim()||"Role",color:String(e.color||"#f0b23b"),priority:N(e.priority),is_system:e.is_system===!0,created_by:String(e.created_by||"")}}function Ba(e){return{role_id:String(e.role_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function $s(e){return{company_id:y(e.company_id||""),profile_id:String(e.profile_id||""),role_id:String(e.role_id||""),assigned_by:String(e.assigned_by||"")}}function id(e){return{id:String(e.id||""),company_id:y(e.company_id||""),resource_type:String(e.resource_type||""),resource_id:String(e.resource_id||""),principal_type:String(e.principal_type||""),principal_id:String(e.principal_id||""),permission_key:String(e.permission_key||""),effect:String(e.effect||"allow")==="deny"?"deny":"allow"}}function sd(e){return{id:String(e.id||""),company_id:y(e.company_id||""),resource_type:String(e.resource_type||""),field_key:String(e.field_key||""),role_id:String(e.role_id||""),visibility:["visible","masked","hidden"].includes(e.visibility)?e.visibility:"visible",editable:e.editable!==!1}}function Wt(e){return{id:String(e.id||""),company_id:y(e.company_id||""),email:String(e.email||""),role_id:String(e.role_id||""),token:String(e.token||""),status:String(e.status||"pending"),expires_at:e.expires_at||"",invited_by:String(e.invited_by||""),accepted_by:String(e.accepted_by||""),created_at:e.created_at||""}}function Ss(e){return{id:String(e.id||""),company_id:y(e.company_id||""),profile_id:String(e.profile_id||""),requested_email:String(e.requested_email||""),status:String(e.status||"pending"),message:String(e.message||""),reviewed_by:String(e.reviewed_by||""),created_at:e.created_at||""}}function ue(e){return{id:String(e.id||""),company_id:y(e.company_id||""),title:String(e.title||"Messages").trim()||"Messages",type:on.includes(e.type)?e.type:"custom",created_by:String(e.created_by||""),last_message_at:e.last_message_at||e.updated_at||e.created_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function K(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:y(e.company_id||""),target_type:["all_company","role","profile"].includes(e.target_type)?e.target_type:"profile",target_id:String(e.target_id||""),created_at:e.created_at||""}}function _e(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),company_id:y(e.company_id||""),sender_profile_id:String(e.sender_profile_id||e.created_by||""),body:String(e.body||""),message_type:String(e.message_type||"text"),deleted_at:e.deleted_at||"",created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function Ie(e){return{id:String(e.id||""),conversation_id:String(e.conversation_id||""),message_id:String(e.message_id||""),company_id:y(e.company_id||""),bucket_id:String(e.bucket_id||"quest-message-attachments"),object_path:String(e.object_path||""),file_name:String(e.file_name||"attachment"),mime_type:String(e.mime_type||"application/octet-stream"),size_bytes:N(e.size_bytes),preview_url:String(e.preview_url||""),created_at:e.created_at||new Date().toISOString()}}function Mt(e){return{conversation_id:String(e.conversation_id||""),company_id:y(e.company_id||""),profile_id:String(e.profile_id||""),last_read_at:e.last_read_at||"",updated_at:e.updated_at||e.last_read_at||""}}function We(e){const t=e.starts_at||new Date().toISOString(),a=ca.includes(e.event_type)?e.event_type:"Company event",n=["company","private"].includes(e.visibility)?e.visibility:"company",s=["","job","task","form","invoice"].includes(e.linked_type)?e.linked_type:"";return{id:String(e.id||`calendar-${crypto.randomUUID()}`),company_id:y(e.company_id||P()),title:String(e.title||"Calendar event").trim()||"Calendar event",description:String(e.description||"").trim(),event_type:a,starts_at:t,ends_at:e.ends_at||t,all_day:e.all_day===!0||e.all_day==="true"||e.all_day==="on",visibility:n,linked_type:s,linked_id:String(e.linked_id||""),assigned_profile_id:String(e.assigned_profile_id||""),created_by:String(e.created_by||""),created_at:e.created_at||new Date().toISOString(),updated_at:e.updated_at||e.created_at||new Date().toISOString()}}function mi(e){return{id:e.id,company_id:e.company_id,title:e.title,type:e.type,created_by:e.created_by||b().profile.id,last_message_at:e.last_message_at||null}}function rd(e){return{conversation_id:e.conversation_id,company_id:e.company_id,target_type:e.target_type,target_id:e.target_id}}function od(e){return{id:e.id,conversation_id:e.conversation_id,company_id:e.company_id,sender_profile_id:e.sender_profile_id,body:e.body,message_type:e.message_type,deleted_at:e.deleted_at||null}}function ld(e){return{id:e.id,conversation_id:e.conversation_id,message_id:e.message_id,company_id:e.company_id,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes}}function cd(e){return{id:gt(e.id)?e.id:void 0,company_id:e.company_id,title:e.title,description:e.description,event_type:e.event_type,starts_at:e.starts_at,ends_at:e.ends_at||e.starts_at,all_day:e.all_day,visibility:e.visibility,linked_type:e.linked_type||"",linked_id:e.linked_id||"",assigned_profile_id:e.assigned_profile_id||"",created_by:gt(e.created_by)?e.created_by:b().profile.id}}function dd(e){return{conversation_id:e.conversation_id,company_id:e.company_id,profile_id:e.profile_id,last_read_at:e.last_read_at||new Date().toISOString()}}function md(e=u()){return He({id:"",company_id:e,name:"",stage:"Lead",priority:"Medium",job_type:"Roofing"})}function pd(e=u(),t=""){return Je({id:"",title:"",company_id:e,project_id:t,assignee_id:Me(e)[0]?.id||"abraham",creator_id:b().profile.member_id||"abraham",due:h(1),priority:"medium",status:"todo",type:"admin"})}function ud(e=u()){const t=je();return Ca({id:"",company_id:e,job_id:t?.company_id===e?t.id:"",client_name:t?.company_id===e?t.client_name:"",invoice_number:$m(e),status:"Draft",issue_date:h(0),due_date:h(30),subtotal:t?.company_id===e?t.estimate_total:0,tax:0,notes:""})}function fd(e=u(),t=""){const a=t?Fe(t):we(e).find(s=>le(s.id)>0),n=a?.company_id===e?a:null;return ja({id:"",company_id:e,invoice_id:n?.id||"",amount:n?le(n.id):0,method:"ACH",received_at:h(0),reference:"",notes:""})}function gd(e=u(),t=""){return Ia({id:"",company_id:e,job_id:je()?.company_id===e?je().id:"",vendor_id:t||Dn(e)[0]?.id||"",category:"Materials",status:"Pending",amount:0,spent_at:h(0),notes:""})}function bd(e=u()){return qa({id:"",company_id:e,name:"",category:"Materials",status:"Active"})}function _d(e=u()){const t=new Date;t.setHours(t.getHours()+1,0,0,0);const a=new Date(t);return a.setHours(t.getHours()+1),We({id:"",company_id:e,title:"",description:"",event_type:"Company event",starts_at:t.toISOString(),ends_at:a.toISOString(),all_day:!1,visibility:"company",linked_type:"",linked_id:"",assigned_profile_id:b().profile.member_id||b().profile.id,created_by:b().profile.id})}function vd(e){return{id:e.id,title:e.title,description:e.description,type:e.type,label:e.label,bid_status:e.bid_status,company_id:e.company_id,creator_id:e.creator_id,assignee_id:e.assignee_id,project_id:e.project_id||null,due:e.due,due_time:e.due_time,reminder_at:e.reminder_at,priority:e.priority,urgency:e.urgency,status:e.status,watchers:e.watchers,subtasks:e.subtasks,activity:e.activity,cleared_at:e.cleared_at}}function yd(e){return{company_id:e.company_id,job_id:e.job_id||null,bucket_id:e.bucket_id,object_path:e.object_path,file_name:e.file_name,mime_type:e.mime_type,size_bytes:e.size_bytes,category:e.category,folder:e.folder,uploaded_by_label:e.uploaded_by_label,notes:e.notes}}function b(){return i.session?i.session.auth==="supabase"?i.session:{...i.session,profile:{...za().profile,...i.session.profile||{},...i.profileDraft||{}}}:za()}function hd(e,t){const a=!!(e.user.email_confirmed_at||e.user.confirmed_at);return{auth:"supabase",access_token:e.access_token,refresh_token:e.refresh_token,user:{id:e.user.id,email:e.user.email||"",email_confirmed_at:e.user.email_confirmed_at||e.user.confirmed_at||"",email_verified:a},profile:dt(t||{},{id:e.user.id,email:e.user.email||"",full_name:e.user.user_metadata?.full_name||e.user.email||"Quest user",role:"member",member_id:"",company_ids:[],avatar_url:"",email_verified:a})}}function za(){const e={id:"basic-quest-user",email:"lumen123@quest-hq.local",full_name:"Quest Basic Mode",role:"developer",role_label:"Developer",member_id:"abraham",company_ids:["roofing","drafting","lumen"],avatar_url:"",email_verified:!0,...i.profileDraft||{}};return{auth:"local-basic",user:{id:e.id,username:Qe.localUsername,email:e.email},profile:e}}function dt(e,t={}){const a=String(e.role||t.role||"member").toLowerCase(),n=typeof e.email_verified=="boolean"?e.email_verified:t.email_verified===!0;return{id:String(e.id||t.id||""),email:String(e.email||t.email||""),full_name:String(e.full_name||t.full_name||e.email||t.email||"Quest user"),role:a,role_label:A(a),member_id:String(e.member_id||t.member_id||""),company_ids:Array.isArray(e.company_ids)?B(e.company_ids.map(y)):t.company_ids||[],avatar_url:String(e.avatar_url||t.avatar_url||""),approved:e.approved!==!1,email_verified:n,supervisor_id:String(e.supervisor_id||t.supervisor_id||"")}}function mt(e){const t=wd(e.html||e.meta||""),a=e.read_at||(e.read===!0?e.created_at||new Date().toISOString():"");return{id:String(e.id||`notification-${crypto.randomUUID()}`),company_id:y(e.company_id||""),recipient_profile_id:String(e.recipient_profile_id||e.profile_id||e.member_id||"basic-quest-user"),type:String(e.type||(e.task_id?"task.notification":"general")),title:String(e.title||e.meta||"Notification"),body:String(e.body||t||""),href:String(e.href||""),source_type:String(e.source_type||(e.task_id?"task":"")),source_id:String(e.source_id||e.task_id||""),read_at:String(a||""),created_at:String(e.created_at||new Date().toISOString())}}function wd(e){return String(e||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}function $d(e=b()){return e.auth!=="supabase"?!0:e.user?.email_verified===!0||!!e.user?.email_confirmed_at||e.profile?.email_verified===!0}function J(e,t,a=""){const n=Vi();return`
    <section class="workspace-head">
      <div class="head-copy">
        <span class="head-symbol">${G(n)}</span>
        <div>
          <div class="context-line"><span>${r(M(u()))}</span><b>${r(Ct(u()))}</b></div>
          <h1>${r(e)}</h1>
          <p>${r(t)}</p>
        </div>
      </div>
      ${a?`<div class="head-actions">${a}</div>`:""}
    </section>
  `}function Sd(e){return`<section class="metric-grid">${e.map(([t,a])=>`<article class="metric">${G(Bi(t),"metric-symbol")}<span>${r(t)}</span><strong>${r(a)}</strong></article>`).join("")}</section>`}function kd(e){return`
    <button class="queue-row" type="button" data-select-job="${r(e.id)}">
      <span><strong>${r(e.name)}</strong><small>${r(e.client_name||M(e.company_id))}</small></span>
      ${xn(e.priority)}
      <b>${r(e.stage)}</b>
    </button>
  `}function Ma(e){return`
    <button class="queue-row" type="button" data-select-task="${r(e.id)}">
      <span><strong>${r(e.title)}</strong><small>${r(x(e.project_id)?.name||M(e.company_id))}</small></span>
      ${ks(e.priority)}
      <b>${r(ge(e.status))}</b>
    </button>
  `}function Dd(e){return`
    <button class="job-card priority-${r(e.priority.toLowerCase())} ${e.id===i.selectedJobId?"active":""}" type="button" data-select-job="${r(e.id)}">
      <strong>${r(e.name)}</strong>
      <span>${r(e.client_name||"No client")}</span>
      <small>${r(M(e.company_id))} - ${r(e.owner_name||"Unassigned")}</small>
      <em>${r(ka(e.id))} tasks</em>
    </button>
  `}function Tt(e,t,a,n){return`
    <a class="mini-link" href="${_(e)}" data-router>
      <i class="ti ${r(t)}"></i>
      <span><strong>${r(a)}</strong><small>${r(n)}</small></span>
    </a>
  `}function L(e){return`<div class="contract-rows">${e.map(([t,a])=>`<div><span>${r(t)}</span><strong>${r(a)}</strong></div>`).join("")}</div>`}function q(e,t,a="",n=!1,s="text",o=""){return`<label class="${r(o)}"><span>${r(e)}</span><input name="${r(t)}" type="${r(s)}" value="${r(a)}" ${n?"required":""} /></label>`}function ve(e,t,a="",n=""){return`<label class="${r(n)}"><span>${r(e)}</span><textarea name="${r(t)}" rows="4">${r(a)}</textarea></label>`}function R(e,t,a,n){return`
    <label><span>${r(e)}</span><select name="${r(t)}">
      ${n.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function xn(e){return`<span class="priority ${r(String(e).toLowerCase())}">${r(e)}</span>`}function ks(e){return`<span class="priority ${r(e)}">${r(A(e))}</span>`}function Ds(e){return`<span class="status-pill ${r(e)}">${r(ge(e))}</span>`}function Cd(e){return`<span class="finance-status ${r(At(e))}">${r(e)}</span>`}function me(e,t){if(e.avatar_url)return`<span class="${r(t)}"><img src="${r(e.avatar_url)}" alt="" /></span>`;const a=String(e.full_name||e.email||"QB").trim().split(/\s+/).map(n=>n[0]).join("").slice(0,2).toUpperCase()||"QB";return`<span class="${r(t)}">${r(a)}</span>`}function jd(e=u()){const t=ae(e).filter(a=>a.status==="active").map(a=>[a.profile_id||a.member_id,a.name||a.email||a.member_id]);return[["","Unassigned"]].concat(t)}function pi(e){const t=new Date(e||Date.now());if(Number.isNaN(t.getTime()))return"";const a=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),o=String(t.getHours()).padStart(2,"0"),l=String(t.getMinutes()).padStart(2,"0");return`${a}-${n}-${s}T${o}:${l}`}function ui(e){const t=new Date(e||Date.now());return Number.isNaN(t.getTime())?new Date().toISOString():t.toISOString()}function v(e){return`<div class="empty-state">${G("q-empty","empty-symbol")}<span>${r(e)}</span></div>`}function ie(e,t){const a={};return t.forEach(n=>{const s=e.get(n);s&&(a[n]=s)}),a}function Y(){i.session?.auth!=="supabase"&&($(Ja,i.jobs),$(Wa,i.tasks),$(Ya,i.files),$(Ka,i.driveFolders),$(Ge,i.forms),$(Xt,i.formResponses),$(Xa,i.financeInvoices),$(en,i.financePayments),$(tn,i.financeExpenses),$(an,i.financeVendors),$(ea,i.timeEntries),$(ta,i.activeTimer),$(Ga,i.teamMembers),$(Za,i.memberships),$(aa,i.notifications),$(na,i.messageConversations),$(ia,i.messageAccess),$(sa,i.messages),$(ra,i.messageReads),$(oa,i.messageAttachments),$(la,i.calendarEvents))}function Cs(){i.session?.auth!=="supabase"&&($(ea,i.timeEntries),$(ta,i.activeTimer))}function Rn(){i.session?.auth!=="supabase"&&$(aa,i.notifications)}function js(){i.session?.auth!=="supabase"&&$(la,i.calendarEvents)}function Te(){i.session?.auth!=="supabase"&&($(na,i.messageConversations),$(ia,i.messageAccess),$(sa,i.messages),$(ra,i.messageReads),$(oa,i.messageAttachments))}function Pn(e,t,a){if(a==="company")return[K({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"all_company",target_id:"all"})];const n=[];return e.getAll("role_ids").forEach(s=>{s&&n.push(K({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"role",target_id:s}))}),e.getAll("profile_ids").forEach(s=>{s&&n.push(K({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:s}))}),n.length?n:[K({id:`msg-access-${crypto.randomUUID()}`,company_id:t.company_id,conversation_id:t.id,target_type:"profile",target_id:b().profile.id})]}function Aa(e,t=!0){if(!e)return;const a=i.messageConversations.find(l=>l.id===e);if(!a)return;const n=new Date().toISOString(),s=b().profile.id,o=Mt({conversation_id:e,company_id:a.company_id,profile_id:s,last_read_at:n});if(i.messageReads=[o].concat(i.messageReads.filter(l=>l.conversation_id!==e||l.profile_id!==s)),Te(),t&&i.session?.auth==="supabase"){const l=I();l&&l.from("message_reads").upsert(dd(o),{onConflict:"conversation_id,profile_id"})}}function Is(e,t,a=[]){const n=m("messages",{conversation:e.id},e.company_id),s=It(t.sender_profile_id),o=Yt(e).filter(c=>c!==pe(e.company_id,t.sender_profile_id)),l=Id(t.body,e.company_id).filter(c=>c!==pe(e.company_id,t.sender_profile_id));e.type==="direct"&&z("message.direct","New direct message",`${s} sent a direct message in ${e.title}.`,n,"message",t.id,e.company_id,o),l.forEach(c=>{Pe({company_id:e.company_id,recipients:[c],type:"message.mention",title:"Mentioned in chat",body:`${s} mentioned you in ${e.title}.`,href:n,sourceType:"message",sourceId:t.id}).catch(d=>console.warn("Message mention notification failed",d))}),a.length&&z("message.attachment","Attachment shared",`${s} shared ${a.length} attachment${a.length===1?"":"s"} in ${e.title}.`,n,"message",t.id,e.company_id,o)}function Id(e="",t=u()){const a=String(e||"").toLowerCase();return a.includes("@")?ae(t).filter(n=>a.includes(`@${String(n.name||"").split(/\s+/)[0].toLowerCase()}`)||a.includes(`@${String(n.name||"").toLowerCase()}`)).map(n=>pe(t,n.profile_id||n.member_id)).filter(Boolean):[]}function qd(e){const t=Ae(e);if(t)return t;const a=i.teamMembers.find(n=>n.id===e);return{id:e,full_name:a?.full_name||a?.name||e||"Quest user",email:a?.email||"",avatar_url:a?.avatar_url||""}}function Re(e){const t=String(e?.name||"").trim();if(t&&!Zt(t))return t;const a=String(e?.email||"").trim();return a?a.split("@")[0]||a:"Workspace user"}function Md(e){return B([e?.email,e?.role_label||A(e?.role||""),A(e?.status||"")]).join(" / ")||"Company member"}function fi(e){return{id:e?.profile_id||e?.member_id||"",full_name:Re(e),email:e?.email||"",avatar_url:e?.avatar_url||""}}function Ad(e){const t=String(e.value||"").trim().toLowerCase(),a=e.closest(".message-modal-form"),n=Array.from(a?.querySelectorAll("[data-message-person-row]")||[]);let s=0;n.forEach(l=>{const c=l.querySelector('input[type="checkbox"]')?.checked,d=!t||String(l.dataset.filterText||"").includes(t),f=c||d;l.hidden=!f,f&&(s+=1)});const o=a?.querySelector("[data-message-filter-count]");o&&(o.textContent=t?`${s} match${s===1?"":"es"}`:`${n.length} member${n.length===1?"":"s"}`)}function qs(e){return{company:"q-symbol-company-chat",role:"q-symbol-role-chat",custom:"q-symbol-messages",direct:"q-symbol-direct-chat"}[e]||"q-symbol-messages"}function Nn(e){const t=ga(e.id);if(e.type==="company"||t.some(s=>s.target_type==="all_company"))return"Everyone in this company";const a=t.filter(s=>s.target_type==="role").map(s=>et(e.company_id,s.target_id)?.name||"Role"),n=t.filter(s=>s.target_type==="profile").map(s=>It(s.target_id));return a.concat(n).slice(0,5).join(", ")||"Private chat"}function Fd(e){return r(e).replace(/(^|\s)@([\w.-]+)/g,"$1<strong>@$2</strong>")}function Ed(e){const t=Number(e||0);return t>=1024*1024?`${(t/1024/1024).toFixed(1)} MB`:t>=1024?`${Math.round(t/1024)} KB`:`${t} B`}function Ms(e){return new Promise(t=>{const a=new FileReader;a.onload=()=>t(String(a.result||"")),a.onerror=()=>t(""),a.readAsDataURL(e)})}function Td(e,t){const a=I();if(i.session?.auth!=="supabase"||!a?.channel||!t)return;const n=`${e}:${t}`;i.messageRealtimeKey!==n&&(i.messageRealtimeChannel&&a.removeChannel(i.messageRealtimeChannel),i.messageRealtimeKey=n,i.messageRealtimeChannel=a.channel(`quest-messages-${t}`).on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:`conversation_id=eq.${t}`},()=>{i.dataLoaded=!1,p()}).on("postgres_changes",{event:"*",schema:"public",table:"message_attachments",filter:`conversation_id=eq.${t}`},()=>{i.dataLoaded=!1,p()}).subscribe())}function Od(e){const t=[()=>Nt(e,"Crew weather delay","role","Manager posted a weather delay update.",!0),()=>Nt(e,"Permit questions","custom","A permit packet PDF was shared.",!1,!0),()=>Nt(e,"Shan Kumar","direct","Can you jump on this when you are back?",!0),()=>xd(e,"@Joshua you were mentioned in the launch room.")],a=Math.floor(Math.random()*t.length);t[a]()}function Nt(e,t,a,n,s=!1,o=!1){const l=new Date().toISOString(),c=ue({id:`msg-conv-${crypto.randomUUID()}`,company_id:e,title:t,type:a,created_by:"basic-quest-user",last_message_at:l,created_at:l,updated_at:l}),d=a==="direct"?[K({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:c.id,target_type:"profile",target_id:"basic-quest-user"}),K({id:`msg-access-${crypto.randomUUID()}`,company_id:e,conversation_id:c.id,target_type:"profile",target_id:"shan"})]:Pn(new FormData,c,a==="role"?"role":"company");i.messageConversations.unshift(c),i.messageAccess=d.concat(i.messageAccess);const f=_e({id:`msg-${crypto.randomUUID()}`,conversation_id:c.id,company_id:e,sender_profile_id:s?"shan":"basic-quest-user",body:n,created_at:l,updated_at:l,message_type:o?"attachment":"text"});i.messages.push(f),o&&i.messageAttachments.push(Ie({id:`msg-attachment-${crypto.randomUUID()}`,conversation_id:c.id,message_id:f.id,company_id:e,file_name:"permit-packet.pdf",mime_type:"application/pdf",size_bytes:42e4,created_at:l})),s||Aa(c.id,!1),i.selectedConversationId=c.id,Te(),w("Demo message scenario added.","local","Messages"),k(m("messages",{conversation:c.id},e),{replace:!0})}function xd(e,t){const a=ns(e)||Ze(e)[0];if(!a)return Nt(e,"Demo chat","company",t,!0);const n=new Date().toISOString(),s=_e({id:`msg-${crypto.randomUUID()}`,conversation_id:a.id,company_id:e,sender_profile_id:"shan",body:t,created_at:n,updated_at:n});i.messages.push(s),i.messageConversations=i.messageConversations.map(o=>o.id===a.id?{...o,last_message_at:n,updated_at:n}:o),Is(a,s,[]),Te(),w("Demo mention added.","local","Messages"),p()}function Rd(){i.messageConversations=ln.map(ue),i.messageAccess=cn.map(K),i.messages=dn.map(_e),i.messageReads=pn.map(Mt),i.messageAttachments=mn.map(Ie),i.selectedConversationId="",Te(),w("Demo messages reset.","local","Messages"),p()}function Pd(e){return{id:e.id,company_id:e.company_id,recipient_profile_id:e.recipient_profile_id,type:e.type,title:e.title,body:e.body,href:e.href,source_type:e.source_type,source_id:e.source_id,read_at:e.read_at||null,created_at:e.created_at}}function Nd(e=""){const t=String(e||"").split(".")[0];return{access:"Access",approval:"Approval",calendar:"Calendar",file:"Files",finance:"Finance",form:"Forms",message:"Messages",task:"Tasks"}[t]||"Inbox"}async function Pe(e){const t=y(e.companyId||e.company_id||u()),a=Ud(t,e.recipients,{excludeActor:e.excludeActor===!0,type:e.type,href:e.href});if(!a.length)return[];const n=new Date().toISOString(),s=a.map(o=>mt({id:`notification-${crypto.randomUUID()}`,company_id:t,recipient_profile_id:o,type:e.type||"general",title:e.title||"Notification",body:e.body||"",href:e.href||"",source_type:e.sourceType||e.source_type||"",source_id:e.sourceId||e.source_id||"",created_at:n}));if(i.session?.auth==="supabase"){const o=I();if(!o)return[];const l=await o.from("notifications").insert(s.map(Pd)).select();if(l.error)return console.warn("Notification insert failed",l.error),[];const c=(l.data||[]).map(mt);return gi(c),p(),c}return gi(s),Rn(),p(),s}function gi(e){if(!e.length)return;const t=new Map;e.concat(i.notifications).forEach(a=>t.set(a.id,a)),i.notifications=[...t.values()].sort((a,n)=>Date.parse(n.created_at||0)-Date.parse(a.created_at||0)).slice(0,200)}function Ud(e,t=[],a={}){let s=(Array.isArray(t)?t:[t]).map(o=>pe(e,o)).filter(Boolean);return s.length||(s=Es(e,a.type||"","","")),s=B(s),i.session?.auth!=="supabase"&&!s.includes(b().profile.id)&&s.push(b().profile.id),a.excludeActor&&(s=s.filter(o=>o!==As())),s.filter(o=>Ld(e,o)&&Qd(e,o,a.type,a.href))}function pe(e,t){if(!t)return"";const a=typeof t=="object"?String(t.profile_id||t.id||t.member_id||t.target_id||"").trim():String(t).trim();if(!a)return"";if(Ae(a)||ee(e,a))return a;const n=b().profile;if(a===n.id||a===n.member_id||a===n.email)return n.id;const s=ae(e).find(l=>[l.profile_id,l.member_id,l.email,l.name].filter(Boolean).includes(a));if(s?.profile_id)return s.profile_id;const o=i.profiles.find(l=>l.member_id===a||l.email===a||l.full_name===a);return o?.id?o.id:i.session?.auth==="supabase"?"":a}function Ld(e,t){if(!t)return!1;if(t===b().profile.id&&i.session?.auth!=="supabase")return!0;const a=ee(e,t);if(a)return a.status==="active";const n=ae(e).find(s=>s.profile_id===t||s.member_id===t);return i.session?.auth!=="supabase"?!0:n?.status==="active"}function As(){return b().profile.id||b().profile.member_id||""}function Qd(e,t,a="",n=""){const s=Vd(a,n);return s?Fs(e,t,s):!0}function Vd(e="",t=""){const a=`${e} ${t}`;return a.includes("finance")?"finance.view":a.includes("message")?"messages.view":a.includes("calendar")?"calendar.view":a.includes("file")?"files.view":a.includes("approval")?"approvals.view":a.includes("form")?"forms.view":a.includes("task")?"tasks.view":""}function Fs(e,t,a){if(!a)return!0;if(t===b().profile.id)return T(a,e);const n=ee(e,t);if(i.session?.auth==="supabase"&&(!n||n.status!=="active"))return!1;const s=String(n?.role||ae(e).find(f=>f.profile_id===t)?.role||"member").toLowerCase();if(["owner","admin","developer"].includes(s))return!0;const o=hn(a),l=i.roleAssignments.filter(f=>f.company_id===e&&f.profile_id===t).map(f=>f.role_id),c=i.rolePermissions.filter(f=>l.includes(f.role_id));if(c.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="deny"))return!1;if(c.some(f=>(o.includes(f.permission_key)||f.permission_key==="*")&&f.effect==="allow"))return!0;const d=Be[s]||Be.member;return d.includes("*")||o.some(f=>d.includes(f))}function Es(e,t="",a="",n=""){const s=String(t||"").split(".")[0];return s==="finance"?re(e,["finance.view"]):s==="message"?re(e,["messages.view"]):s==="calendar"?zd(n).concat(re(e,["calendar.manage"])):s==="file"?re(e,["files.view"]).concat(Bd(e,n)):s==="form"?re(e,["forms.view","forms.manage"]):s==="approval"?re(e,["approvals.view","approvals.manage"]):s==="access"?re(e,["users.manage","settings.manage"]):[As()]}function re(e,t){return B(ae(e).filter(a=>a.status==="active").map(a=>pe(e,a.profile_id||a.member_id)).filter(a=>t.some(n=>Fs(e,a,n))))}function Ha(e,t=!0){return e?B([e.assignee_id,t?e.creator_id:"",...Array.isArray(e.watchers)?e.watchers:[]].map(a=>pe(e.company_id,a)).filter(Boolean)):[]}function Bd(e,t){return t?B(i.tasks.filter(a=>a.company_id===e&&a.project_id===t).flatMap(a=>Ha(a))):[]}function zd(e){const t=i.calendarEvents.find(a=>a.id===e);return t?B([t.assigned_profile_id,t.created_by].map(a=>pe(t.company_id,a)).filter(Boolean)):[]}function Yt(e){if(!e)return[];const a=ga(e.id).flatMap(n=>n.target_type==="all_company"?re(e.company_id,["messages.view"]):n.target_type==="profile"?[pe(e.company_id,n.target_id)]:n.target_type==="role"?ae(e.company_id).filter(s=>s.status==="active"&&(s.role_id===n.target_id||lt(e.company_id,s.role)===n.target_id)).map(s=>pe(e.company_id,s.profile_id||s.member_id)):[]);return B(a.filter(Boolean))}async function Hd(e=u()){const t=new Date().toISOString(),a=b().profile.id,n=i.notifications.filter(s=>s.company_id===e&&s.recipient_profile_id===a&&!s.read_at).map(s=>s.id);if(n.length&&(i.notifications=i.notifications.map(s=>s.company_id===e&&s.recipient_profile_id===a&&!s.read_at?{...s,read_at:t}:s),Rn(),p(),i.session?.auth==="supabase")){const s=I();s&&await s.from("notifications").update({read_at:t}).in("id",n).eq("recipient_profile_id",a)}}async function Jd(e){const t=i.notifications.find(n=>n.id===e);if(!t)return;const a=new Date().toISOString();if(i.notifications=i.notifications.map(n=>n.id===t.id?{...n,read_at:n.read_at||a}:n),i.notificationMenuOpen=!1,Rn(),p(),i.session?.auth==="supabase"&&!t.read_at){const n=I();n&&await n.from("notifications").update({read_at:a}).eq("id",t.id).eq("recipient_profile_id",b().profile.id)}t.href&&k(t.href)}function bi(e,t=null){const a=m("tasks",{...e.project_id?{job_id:e.project_id}:{},task_id:e.id},e.company_id),n=H(e.assignee_id);if(!t){Pe({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task assigned",body:`${Q()} assigned ${e.title} to ${n}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s));return}t.assignee_id!==e.assignee_id&&Pe({companyId:e.company_id,recipients:[e.assignee_id],type:"task.assigned",title:"Task reassigned",body:`${Q()} reassigned ${e.title} to ${n}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s)),t.priority!==e.priority&&Pe({companyId:e.company_id,recipients:Ha(e),excludeActor:!0,type:"task.priority",title:"Task priority changed",body:`${Q()} set priority to ${A(e.priority)} on ${e.title}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s)),t.status!==e.status&&Pe({companyId:e.company_id,recipients:Ha(e),excludeActor:!0,type:"task.status",title:"Task status changed",body:`${Q()} moved ${e.title} to ${ge(e.status)}.`,href:a,sourceType:"task",sourceId:e.id}).catch(s=>console.warn("Task notification failed",s))}function z(e,t,a,n,s="",o="",l=u(),c=null){Pe({companyId:l,recipients:c||Es(l,e,s,o),type:e,title:t,body:a,href:n,sourceType:s,sourceId:o}).catch(d=>console.warn("Notification event failed",d))}async function Ye(e,t,a,n,s={},o=!1){const l={id:`audit-${crypto.randomUUID()}`,company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:n,details:s,created_at:new Date().toISOString()};if(i.auditEvents.unshift(l),o&&i.session?.auth==="supabase"){const c=I();if(c)try{await c.from("audit_events").insert({company_id:e,actor_profile_id:b().profile.id,event_type:t,target_type:a,target_id:n,details:s})}catch{}}}function Wd(e,t){return t.status==="disabled"?"membership.disabled":t.status==="left"?"membership.left":e&&["disabled","left","pending"].includes(e.status)&&t.status==="active"?"membership.reactivated":e&&e.role!==t.role?"role.changed":"membership.updated"}function Q(){return b().profile.full_name||b().profile.email||"Quest HQ"}function j(e,t,a=""){return`<article class="metric">${G(Bi(e),"metric-symbol")}<span>${r(e)}</span><strong>${r(t)}</strong>${a?`<small>${r(a)}</small>`:""}</article>`}function Ce(e,t){return`<div><strong>${r(e)}</strong><span>${r(t)}</span></div>`}function Le(e,t,a,n,s=""){const o=`
    <span><strong>${r(e)}</strong><small>${r(t||"Finance record")}</small></span>
    <b>${r(a)}</b>
    <em>${E(n)}</em>
  `;return s?`<a class="finance-compact-row" href="${_(s)}" data-router>${o}</a>`:`<div class="finance-compact-row">${o}</div>`}function _i(e,t){const a=qe(e);return t==="jobs"?a.filter(n=>n.job_id).length:a.filter(n=>n.folder===t).length}function Ts(e="home",t=null){return t?.id?`job:${t.id}`:e||"home"}function Yd(e,t="home",a=null){const n=Ts(t,a),s=ot(e).filter(o=>o.parent_key===n).map(o=>Kd(e,o));return a?s:t==="home"?sn.map(([l,c,d,f])=>({id:l,name:c,caption:d,icon:f,href:_(m("files",{folder:l},e)),countLabel:`${_i(e,l)} file${_i(e,l)===1?"":"s"}`,updatedLabel:""})).concat(s):t==="jobs"?U(e).map(l=>({id:`job:${l.id}`,name:l.name,caption:l.client_name||M(e),icon:"ti-folder",href:_(m("files",{folder:"jobs",job_id:l.id},e)),countLabel:`${zt(l.id)} file${zt(l.id)===1?"":"s"}`,updatedLabel:E(l.updated_at)})).concat(s):s}function Kd(e,t){const a=ot(e).filter(o=>o.parent_key===t.id).length,n=qe(e).filter(o=>o.folder===t.id).length,s=a+n;return{id:t.id,name:t.name,caption:"Custom folder",icon:"ti-folder",href:_(m("files",{folder:t.id},e)),countLabel:`${s} item${s===1?"":"s"}`,updatedLabel:E(t.updated_at)}}function Gd(e,t,a=null){if(a)return`<span>/</span><a href="${_(m("files",{folder:"jobs"},e))}" data-router>Jobs</a>`;const n=ot(e).find(d=>d.id===t);if(!n)return`<span>/</span><strong>${r(ce(t))}</strong>`;const s=[];let o=n;const l=new Set;for(;o&&!l.has(o.id);)l.add(o.id),s.unshift(o),o=ot(e).find(d=>d.id===o.parent_key);return`${n.parent_key&&!n.parent_key.startsWith("folder-")&&n.parent_key!=="home"?`<span>/</span><a href="${_(m("files",{folder:n.parent_key},e))}" data-router>${r(ce(n.parent_key))}</a>`:""}${s.map((d,f)=>`<span>/</span>${f===s.length-1?`<strong>${r(d.name)}</strong>`:`<a href="${_(m("files",{folder:d.id},e))}" data-router>${r(d.name)}</a>`}`).join("")}`}function Zd(e=u(),t="home",a=""){const n=(i.fileQuery||i.query||"").trim().toLowerCase(),s=i.fileCategoryFilter;let o=qe(e);return a?o=o.filter(l=>l.job_id===a):t&&t!=="home"&&(t==="jobs"?o=o.filter(l=>l.job_id):o=o.filter(l=>l.folder===t)),s&&s!=="All categories"&&(o=o.filter(l=>String(l.category||ce(l.folder)).toLowerCase()===s.toLowerCase())),n&&(o=o.filter(l=>[l.file_name,l.category,l.uploaded_by_label,l.notes,l.object_path,x(l.job_id)?.name].some(c=>String(c||"").toLowerCase().includes(n)))),o.sort((l,c)=>new Date(c.created_at||0)-new Date(l.created_at||0))}function Se(e){const t={pdf:"PDF",image:"Image",archive:"Archive",sheet:"Excel",doc:"Word",presentation:"PowerPoint",text:"Text",video:"Video",audio:"Audio",code:"Code",data:"Data",design:"Design",cad:"CAD",email:"Email"},a=Fa(e);if(t[a])return t[a];const n=Ea(e);return n?n.toUpperCase():ce(e.folder)}function Fa(e){const t=String(e.mime_type||"").toLowerCase(),a=Ea(e);return t.includes("pdf")||a==="pdf"?"pdf":t.includes("image")||["png","jpg","jpeg","gif","webp","svg","bmp","tif","tiff","heic","ico"].includes(a)?"image":t.includes("zip")||t.includes("compressed")||["zip","rar","7z","tar","gz","tgz","bz2"].includes(a)?"archive":t.includes("spreadsheet")||t.includes("excel")||["xls","xlsx","xlsm","ods","csv"].includes(a)?"sheet":t.includes("word")||["doc","docx","odt","rtf"].includes(a)?"doc":t.includes("presentation")||["ppt","pptx","pps","odp"].includes(a)?"presentation":t.includes("video")||["mp4","mov","avi","mkv","webm","wmv","m4v"].includes(a)?"video":t.includes("audio")||["mp3","wav","aac","flac","m4a","ogg"].includes(a)?"audio":["js","ts","jsx","tsx","html","css","scss","json","xml","yml","yaml","md","sql","py","rb","php","java","cs","cpp","c","go","rs","sh","ps1"].includes(a)?"code":["txt","log"].includes(a)||t.includes("text")?"text":["ai","psd","sketch","fig"].includes(a)?"design":["dwg","dxf","rvt","ifc","step","stp"].includes(a)?"cad":["eml","msg"].includes(a)?"email":["db","sqlite","bak"].includes(a)?"data":"file"}function Un(e){return Fa(e)}function Ea(e){return String(e.file_name||"").split(".").pop()?.toLowerCase()||""}function Xd(e){return e.type==="image/png"?"png":e.type==="image/webp"?"webp":"jpg"}function Ln(e,t=!1){return e.signed_url&&Fa(e)==="image"?`<img src="${r(e.signed_url)}" alt="" />`:`<span class="file-doc-icon ${r(Un(e))} ${t?"large":""}">${Vs(e,Se(e))}<small>${r(Os(e))}</small></span>`}function Os(e){const t=Se(e),a=Ea(e);return t==="Image"?a&&a.length<=4?a.toUpperCase():"IMG":t==="Archive"?a&&a.length<=3?a.toUpperCase():"ZIP":t==="Excel"?a==="csv"?"CSV":"XLS":t==="Word"?"DOC":t==="PowerPoint"?"PPT":t==="Video"?"VID":t==="Audio"?"AUD":t==="Code"?a&&a.length<=4?a.toUpperCase():"CODE":t==="Design"?a&&a.length<=4?a.toUpperCase():"DES":t==="CAD"?a&&a.length<=4?a.toUpperCase():"CAD":t==="Email"?a&&a.length<=4?a.toUpperCase():"MAIL":t==="Data"?a&&a.length<=4?a.toUpperCase():"DATA":t==="Text"?a&&a.length<=4?a.toUpperCase():"TXT":t.length<=4?t.toUpperCase():(a||"FILE").slice(0,4).toUpperCase()}function ke(e=u()){return i.forms.filter(t=>t.company_id===e)}function em(e=u()){const t=i.formQuery.trim().toLowerCase(),a=i.route?.jobId||"";return ke(e).filter(n=>a&&n.linked_job_id!==a||i.formTypeFilter!=="all"&&n.type!==i.formTypeFilter?!1:t?[n.title,n.description,n.type,n.status,n.audience,x(n.linked_job_id)?.name].some(s=>String(s||"").toLowerCase().includes(t)):!0)}function pt(e=u()){const t=i.route?.jobId||"",a=ke(e).filter(o=>!t||o.linked_job_id===t),n=i.route?.params?.get("form_id")||"";if(n&&a.some(o=>o.id===n)&&(i.selectedFormId=n),!a.length)return i.selectedFormId="",i.selectedQuestionId="",null;let s=a.find(o=>o.id===i.selectedFormId)||a[0];return i.selectedFormId=s.id,(!i.selectedQuestionId||!s.questions.some(o=>o.id===i.selectedQuestionId))&&(i.selectedQuestionId=s.questions[0]?.id||""),s}function Oe(e){return i.forms.find(t=>t.id===e)||null}function fe(){return Oe(i.selectedFormId)||pt(u())}function xs(e=u()){return i.formResponses.filter(t=>t.company_id===e)}function Ta(e){return i.formResponses.filter(t=>t.form_id===e)}function Rs(e){return Array.isArray(e?.questions)?e.questions.length:0}function tm(e){const t=String(e?.creator_id||""),a=b().profile;return t?t&&(t===a.member_id||t===a.id)?a.full_name||"Quest Basic Mode":H(t):e?.created_by_label||a.full_name||"Quest HQ"}function nt(e,t,a="",n=!1,s="text"){return`<label><span>${r(e)}</span><input data-form-field="${r(t)}" type="${r(s)}" value="${r(a)}" ${n?"required":""} /></label>`}function Ps(e,t,a=""){return`<label><span>${r(e)}</span><textarea data-form-field="${r(t)}" rows="3">${r(a)}</textarea></label>`}function Ot(e,t,a,n){return`
    <label><span>${r(e)}</span><select data-form-field="${r(t)}">
      ${n.map(([s,o])=>`<option value="${r(s)}" ${String(s)===String(a)?"selected":""}>${r(o)}</option>`).join("")}
    </select></label>
  `}function ut(e){return["multiple","checkbox","dropdown"].includes(e.type)}function am(e){return{short:"ti-letter-t",paragraph:"ti-align-left",multiple:"ti-circle-dot",checkbox:"ti-checkbox",dropdown:"ti-select",date:"ti-calendar",rating:"ti-star",yesno:"ti-circle-check",file:"ti-paperclip"}[e]||"ti-plus"}function nm(e){return ht.find(([t])=>t===e)?.[1]||A(e||"Question")}function de(e,t){return`
    <div class="response-question">
      <label>
        <span>${r(e.label)}${e.required?" *":""}</span>
        ${e.help?`<small>${r(e.help)}</small>`:""}
        ${t}
      </label>
    </div>
  `}function Ns(e){const t=Oe(e.form_id),a=Object.entries(e.answers||{}).map(([n,s])=>{const o=t?.questions.find(c=>c.id===n),l=Array.isArray(s)?s.join(", "):s;return Ce(o?.label||n,l||"No answer")}).join("");return`
    <div class="response-detail-head">
      <div><h2>${r(t?.title||"Response")}</h2><p>${r(e.submitted_by||e.submitter_email||"Anonymous")} / ${E(e.created_at)}</p></div>
    </div>
    <div class="file-detail-list">${a||Ce("Response","No answers captured.")}</div>
  `}function st(){return[{id:"roof-inspection",title:"Roof Inspection",description:"Leak source, condition, photo handoff, and recommended repair scope.",type:"Inspection",questions:[W("short","Inspection address"),W("multiple","Primary finding",["Active leak","Damaged flashing","Storm damage","Maintenance"]),W("paragraph","Recommended scope"),W("file","Photos")]},{id:"client-approval",title:"Client Approval",description:"Approval, client notes, signature follow-up, and change request capture.",type:"Client approval",questions:[W("short","Client name"),W("yesno","Approved to proceed?"),W("paragraph","Requested changes")]},{id:"service-intake",title:"Service Intake",description:"New request triage for company-level or job-linked work.",type:"Intake",questions:[W("short","Request title"),W("dropdown","Priority",["Low","Medium","High","Urgent"]),W("paragraph","Details")]},{id:"safety-check",title:"Safety Checklist",description:"Crew safety confirmation before field work starts.",type:"Safety",questions:[W("checkbox","PPE confirmed",["Harness","Ladder","Gloves","Eye protection"]),W("yesno","Weather safe?"),W("paragraph","Safety notes")]}]}function im(e=u()){return qt({id:`form-${crypto.randomUUID()}`,company_id:e,title:"Untitled form",description:"",type:"Internal",status:"Draft",audience:"Internal",linked_job_id:i.route?.jobId||"",theme_color:$e(e),background:"clean",submit_label:"Submit",collect_email:!0,require_approval:!1,questions:[W("short","First question")]})}function W(e="short",t="Untitled question",a=[]){return Da({id:`q-${crypto.randomUUID()}`,type:e,label:t,required:!1,options:a})}function sm(e,t={}){const a=im(e),n=qt({...a,...t,id:t.id||`form-${crypto.randomUUID()}`,company_id:e,questions:(t.questions||a.questions).map(s=>Da(s)),created_at:t.created_at||new Date().toISOString(),updated_at:new Date().toISOString()});return i.forms.unshift(n),i.selectedFormId=n.id,i.selectedQuestionId=n.questions[0]?.id||"",i.formsTab="builder",i.formEditorTab="questions",i.modal="",i.formStartTemplateId="",i.formStartTab="blank",Z("New form created"),p(),n}function rm(e){const t=Object.fromEntries(new FormData(e).entries()),a=t.template_id?st().find(l=>l.id===t.template_id):null,n=String(t.title||a?.title||"Untitled form").trim()||"Untitled form",s=String(t.description||a?.description||"").trim(),o=a?a.questions.map(l=>({...Kt(l),id:`q-${crypto.randomUUID()}`})):[W("short","First question")];sm(u(),{title:n,description:s,type:yt.includes(t.type)?t.type:a?.type||"Internal",audience:String(t.audience||"Internal").trim()||"Internal",creator_id:b().profile.member_id||b().profile.id||"basic-quest-user",linked_job_id:String(t.linked_job_id||""),theme_color:$e(u()),background:"clean",submit_label:String(t.submit_label||"Submit").trim()||"Submit",collect_email:t.collect_email==="on",require_approval:t.require_approval==="on",questions:o})}function xt(e,t=!0){const a=Oe(e);a&&(i.selectedFormId=a.id,i.selectedQuestionId=a.questions[0]?.id||"",t&&p())}function Z(e="Forms saved locally"){const t=fe();t&&(t.updated_at=new Date().toISOString()),$(Ge,i.forms),$(Xt,i.formResponses),i.sync={label:e,mode:"live"}}function vi(e,t){const a=Oe(e||i.selectedFormId);a&&(a.status=rn.includes(t)?t:"Draft",i.selectedFormId=a.id,Z(`${a.status} locally`),p())}function om(e){const t=Oe(e||i.selectedFormId);if(!t)return;const a=qt({...Kt(t),id:`form-${crypto.randomUUID()}`,title:`${t.title} Copy`,status:"Draft",questions:t.questions.map(n=>({...Kt(n),id:`q-${crypto.randomUUID()}`})),created_at:new Date().toISOString(),updated_at:new Date().toISOString()});i.forms.unshift(a),i.selectedFormId=a.id,i.selectedQuestionId=a.questions[0]?.id||"",Z("Form duplicated"),p()}function lm(e){const t=e||i.selectedFormId;t&&(i.forms=i.forms.filter(a=>a.id!==t),i.formResponses=i.formResponses.filter(a=>a.form_id!==t),i.selectedFormId=ke(u())[0]?.id||"",i.selectedQuestionId=pt(u())?.questions[0]?.id||"",i.modal="",Z("Form deleted locally"),p())}async function cm(e){const t=e||i.selectedFormId,a=`${window.location.origin}${_(m("forms",{form_id:t},u()))}`;try{await navigator.clipboard.writeText(a),i.sync={label:"Form link copied",mode:"live"}}catch{i.sync={label:"Copy failed",mode:"local"}}p()}function dm(e){const t=JSON.stringify({company_id:e,forms:ke(e),responses:xs(e)},null,2);vm(`${e}-forms-export.json`,t,"application/json")}function Us(e){const t=fe();if(!t)return;const a=e.dataset.formField;a&&(t[a]=e.type==="checkbox"?e.checked:e.value,t.updated_at=new Date().toISOString(),$(Ge,i.forms))}function Ls(e){const t=fe(),a=e.closest("[data-question-id]"),n=t?.questions.find(s=>s.id===a?.dataset.questionId);if(!(!t||!n)){if(i.selectedQuestionId=n.id,e.matches("[data-question-option]")){const s=Number(e.dataset.questionOption);n.options[s]=e.value}else{const s=e.dataset.questionField;if(s==="required")n.required=e.checked;else if(s==="type"){n.type=e.value,ut(n)&&!n.options.length&&(n.options=["Option 1","Option 2"]),ut(n)||(n.options=[]),Z("Question updated"),p();return}else s&&(n[s]=e.value)}t.updated_at=new Date().toISOString(),$(Ge,i.forms)}}function mm(e="multiple"){const t=fe();if(!t)return;const a=W(e,ht.find(([n])=>n===e)?.[1]||"New question");t.questions.push(a),i.selectedQuestionId=a.id,Z("Question added"),p()}function pm(e){const t=fe(),a=t?.questions.find(o=>o.id===e);if(!t||!a)return;const n=t.questions.findIndex(o=>o.id===e),s=Da({...Kt(a),id:`q-${crypto.randomUUID()}`,label:`${a.label} Copy`});t.questions.splice(n+1,0,s),i.selectedQuestionId=s.id,Z("Question duplicated"),p()}function um(e){const t=fe();t&&(t.questions=t.questions.filter(a=>a.id!==e),i.selectedQuestionId=t.questions[0]?.id||"",Z("Question deleted"),p())}function fm(e,t){const a=fe();if(!a||!t)return;const n=a.questions.findIndex(l=>l.id===e),s=n+t;if(n<0||s<0||s>=a.questions.length)return;const[o]=a.questions.splice(n,1);a.questions.splice(s,0,o),i.selectedQuestionId=e,Z("Question moved"),p()}function gm(e){const a=fe()?.questions.find(n=>n.id===e);a&&(a.options=a.options||[],a.options.push(`Option ${a.options.length+1}`),Z("Option added"),p())}function bm(e,t){const n=fe()?.questions.find(s=>s.id===e);!n||t<0||(n.options.splice(t,1),n.options.length||n.options.push("Option 1"),Z("Option removed"),p())}function _m(e){const t=Oe(e.dataset.formId);if(!t)return;const a=new FormData(e),n={};t.questions.forEach(s=>{const o=`answer:${s.id}`,l=a.getAll(o).filter(c=>c instanceof File?c.name:String(c||"").trim());n[s.id]=l.length>1?l.map(c=>c instanceof File?c.name:c):l[0]instanceof File?l[0].name:l[0]||""}),i.formResponses.unshift(Tn({company_id:t.company_id,form_id:t.id,submitter_email:String(a.get("submitter_email")||""),submitted_by:String(a.get("submitter_email")||b().profile.full_name||"Preview submitter"),answers:n,created_at:new Date().toISOString()})),i.formsTab="responses",i.modal="",Z("Preview response saved"),z(t.require_approval?"approval.form":"form.response",t.require_approval?"Form approval ready":"Form response saved",`${Q()} saved a response for ${t.title}.`,m("forms",{form_id:t.id,tab:"responses"},t.company_id),"form_response",t.id,t.company_id),p()}function vm(e,t,a="text/plain"){const n=new Blob([t],{type:a}),s=URL.createObjectURL(n),o=document.createElement("a");o.href=s,o.download=e,o.click(),URL.revokeObjectURL(s)}function Kt(e){return JSON.parse(JSON.stringify(e))}function B(e){return Array.from(new Set(e.map(t=>String(t||"").trim()).filter(Boolean)))}function ge(e){return{todo:"To do",pending:"Pending",hold:"On hold",review:"Review",done:"Done"}[e]||A(e)}function tt(e){return{lead:"Lead",bid:"Bid",admin:"Admin",invoicing:"Invoicing",ar:"AR",meeting:"Meeting",web_dev:"Web dev"}[e]||A(e)}function ce(e){return sn.find(([t])=>t===e)?.[1]||i.driveFolders.find(t=>t.id===e)?.name||A(e||"Shared")}function ym(e=u()){return sn.map(([t,a])=>[t,a]).concat(ot(e).map(t=>[t.id,t.name]))}function hm(e){const t=String(e||"").toLowerCase();return t.includes("photo")?"photos":t.includes("permit")?"permits":t.includes("contract")?"contracts":t.includes("form")?"forms":t.includes("archive")?"archive":"shared"}function Qs(e,t="Folder"){return Bs("default_folder.svg",t||"Folder")}function Vs(e,t="File"){return Bs(wm(e),t||Se(e))}function Bs(e,t){return`<img class="asset-icon" src="${r(Xs+e)}" alt="${r(t)}" loading="lazy" draggable="false" referrerpolicy="no-referrer" />`}function wm(e){const t=Ea(e),a={pdf:"file_type_pdf.svg",doc:"file_type_word.svg",docx:"file_type_word.svg",odt:"file_type_word.svg",rtf:"file_type_word.svg",xls:"file_type_excel.svg",xlsx:"file_type_excel.svg",xlsm:"file_type_excel.svg",ods:"file_type_excel.svg",csv:"file_type_excel.svg",ppt:"file_type_powerpoint.svg",pptx:"file_type_powerpoint.svg",pps:"file_type_powerpoint.svg",odp:"file_type_powerpoint.svg",zip:"file_type_zip.svg",rar:"file_type_zip.svg","7z":"file_type_zip.svg",tar:"file_type_zip.svg",gz:"file_type_zip.svg",tgz:"file_type_zip.svg",txt:"file_type_text.svg",log:"file_type_text.svg",md:"file_type_markdown.svg",json:"file_type_json.svg",html:"file_type_html.svg",htm:"file_type_html.svg",css:"file_type_css.svg",scss:"file_type_css.svg",js:"file_type_js.svg",jsx:"file_type_js.svg",ts:"file_type_js.svg",tsx:"file_type_js.svg",xml:"file_type_xml.svg",yml:"file_type_yaml.svg",yaml:"file_type_yaml.svg",svg:"file_type_svg.svg",ai:"file_type_ai.svg",psd:"file_type_photoshop.svg"};if(a[t])return a[t];const n=Fa(e);return n==="image"?"file_type_image.svg":n==="video"?"file_type_video.svg":n==="audio"?"file_type_audio.svg":n==="text"?"file_type_text.svg":n==="code"?"file_type_js.svg":n==="archive"?"file_type_zip.svg":"default_file.svg"}function A(e){return String(e||"").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function h(e=0){return new Date(Date.now()+e*864e5).toISOString().slice(0,10)}function E(e){if(!e)return"No date";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)}function Gt(e){if(!e)return"No time";const t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(t)}function Oa(e){const t=new Date(e);if(!e||Number.isNaN(t.getTime()))return"just now";const a=Math.max(0,Math.floor((Date.now()-t.getTime())/1e3));if(a<45)return"just now";const n=Math.floor(a/60);if(n<60)return`${n}m ago`;const s=Math.floor(n/60);if(s<24)return`${s}h ago`;const o=Math.floor(s/24);return o<7?`${o}d ago`:E(e)}function Rt(e){const t=Math.max(0,Math.floor(N(e)/1e3)),a=Math.floor(t/3600),n=Math.floor(t%3600/60);return a?`${a}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Qn(e){const t=N(e);if(!t)return"0 B";const a=["B","KB","MB","GB"],n=Math.min(Math.floor(Math.log(t)/Math.log(1024)),a.length-1);return`${(t/1024**n).toFixed(n?1:0)} ${a[n]}`}function ft(e){return(t,a)=>Date.parse(a[e]||a.updated_at||a.created_at||0)-Date.parse(t[e]||t.updated_at||t.created_at||0)}function zs(e){if(!e)return 0;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?0:Math.floor((xa().getTime()-t.getTime())/864e5)}function yi(e){if(!e)return 999;const t=new Date(`${String(e).slice(0,10)}T00:00:00`);return Number.isNaN(t.getTime())?999:Math.floor((t.getTime()-xa().getTime())/864e5)}function $m(e=u()){const t=(wa(ha(e)||{short_name:e})||e||"QH").replace(/[^a-z]/gi,"").slice(0,2).toUpperCase()||"QH",a=we(e).length+1;return`${t}-${String(1e3+a)}`}function xa(){const e=new Date;return e.setHours(0,0,0,0),e}function Sm(e,t){return`${Hs(e,t)}%`}function Hs(e,t){const a=N(t);return a?Math.max(0,Math.min(100,Math.round(N(e)/a*100))):0}function Ke(e){return{critical:5,urgent:4,high:3,medium:2,low:1}[String(e||"").toLowerCase()]||0}function At(e){return String(e||"file").toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^-+|-+$/g,"")||"file"}function oe(e,t){return e.reduce((a,n)=>a+N(n[t]),0)}function N(e){const t=Number(e);return Number.isFinite(t)?t:0}function gt(e){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(e||""))}function Zt(e){const t=String(e||"").trim();return gt(t)||/^[0-9a-f]{8,}$/i.test(t)||/^user[_-]?[0-9a-f-]{8,}$/i.test(t)}function Js(e){const t=String(e||"").trim();return t?t.slice(0,8):""}function S(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(N(e))}function be(e,t){try{const a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}}function C(e,t){const a=be(e,t);return Array.isArray(a)&&a.length?a:t}function $(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
