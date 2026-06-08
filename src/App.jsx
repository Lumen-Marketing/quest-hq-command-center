import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  Home,
  KanbanSquare,
  Layers3,
  Library,
  Menu,
  MessageSquarePlus,
  Plus,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  Upload,
  Users,
  Workflow,
  X
} from 'lucide-react';
import {
  activity,
  clients,
  companies,
  initialJobs,
  moduleRoadmap,
  people,
  taskRollups,
  timeEntries
} from './data';
import { copyText, taskManagementUrl } from './lib/taskManagement';

const today = '2026-06-09';

const navigation = [
  { id: 'command', label: 'Command Center', icon: Home },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'task-management', label: 'TaskManagement', icon: KanbanSquare },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'forms', label: 'Forms & Surveys', icon: ClipboardList },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'finance', label: 'Finance', icon: Receipt },
  { id: 'knowledge', label: 'Knowledge Base', icon: Library },
  { id: 'automations', label: 'Automations', icon: Workflow },
  { id: 'dashboards', label: 'Dashboards', icon: BarChart3 },
  { id: 'templates', label: 'Templates', icon: Layers3 },
  { id: 'admin', label: 'Admin', icon: Settings }
];

const stageOrder = [
  'Lead',
  'Inspection scheduled',
  'Estimate approved',
  'Production',
  'QA review',
  'Completed'
];

const priorityWeight = {
  urgent: 3,
  high: 2,
  medium: 1,
  low: 0
};

const formQuestionTypes = [
  'Short text',
  'Long text',
  'Multiple choice',
  'Checkbox',
  'Dropdown',
  'Rating',
  'Yes / No',
  'Date',
  'Number',
  'File upload',
  'Signature'
];

const ticketTypes = [
  'Client request',
  'Internal request',
  'Admin request',
  'IT issue',
  'Repair request',
  'Change request',
  'Bug report',
  'Payroll question'
];

const moduleStructuredDefaults = {
  finance: {
    estimateStatus: 'Draft',
    estimateNumber: 'EST-local',
    lineItems: 'Labor, Materials, Cleanup',
    taxesFees: '8.6% tax',
    discounts: '',
    amount: 0,
    paidAmount: 0,
    invoiceStatus: 'Draft',
    invoiceNumber: 'INV-local',
    dueDate: today,
    paymentStatus: 'Unpaid',
    paymentRecords: '',
    revenueCompany: 'Roofing',
    revenueJob: '',
    profitability: 'Pending cost input'
  },
  knowledge: {
    category: 'Company SOPs',
    articleBody: '',
    searchTerms: '',
    attachTarget: 'Job',
    attachedObject: '',
    trainingMaterial: '',
    templateNotes: '',
    reviewOwner: people[0]?.id || '',
    reviewDate: today
  },
  automations: {
    trigger: 'New job created',
    condition: 'Company is Roofing',
    action: 'Create task',
    enabled: 'Enabled',
    automationLog: ''
  },
  dashboards: {
    dashboardType: 'Company overview',
    widgets: 'Active jobs, Overdue tasks, Open tickets, Revenue',
    filters: 'Company: all',
    savedView: '',
    dateRange: 'This week'
  },
  templates: {
    templateType: 'Job template',
    templateOutput: 'Job shell, checklist, TaskManagement task set, estimate starter',
    exampleJob: 'Roofing repair job',
    taskSet: 'Inspection, estimate, scheduling, final walkthrough',
    formSet: 'Inspection checklist, client approval form',
    financeSet: 'Estimate line items, deposit invoice',
    automationSet: 'Create default tasks when job is created'
  },
  admin: {
    userName: '',
    role: 'Worker',
    permissions: 'View jobs, update assigned records',
    companyAccess: 'Roofing',
    approvalStatus: 'Pending approval',
    settings: 'Job stages, ticket statuses, lead statuses',
    notificationSettings: 'Due dates, overdue invoices, ticket SLA alerts'
  }
};

const localModulePanels = {
  finance: {
    title: 'Finance Workspace',
    description: 'Local estimate, invoice, payment, and AR fields for presentation mode.',
    fields: [
      ['estimateStatus', 'Estimate status', 'select', ['Draft', 'Sent', 'Approved', 'Declined', 'Converted']],
      ['lineItems', 'Line items', 'textarea'],
      ['taxesFees', 'Taxes / fees', 'input'],
      ['discounts', 'Discounts', 'input'],
      ['invoiceStatus', 'Invoice status', 'select', ['Draft', 'Sent', 'Partial', 'Paid', 'Overdue']],
      ['dueDate', 'Due date', 'date'],
      ['paymentStatus', 'Payment status', 'select', ['Unpaid', 'Partial', 'Paid', 'Overdue']],
      ['paymentRecords', 'Payment records', 'textarea'],
      ['revenueCompany', 'Revenue by company', 'input'],
      ['revenueJob', 'Revenue by job', 'input'],
      ['profitability', 'Job profitability', 'input']
    ],
    cards: [
      ['Estimate builder', 'Line items, taxes, fees, discounts, send state, approval state'],
      ['Invoice list', 'Invoice status, due date, payment status, overdue flag'],
      ['Payments / AR', 'Payment records, AR dashboard, revenue, profitability']
    ],
    actions: [
      ['Send Estimate', { status: 'Sent', conversionNote: 'Estimate sent locally.' }],
      ['Convert Estimate to Invoice', { status: 'Converted', convertedTo: 'Converted estimate to invoice', conversionNote: 'Invoice created locally from estimate.' }],
      ['Send Invoice', { status: 'Sent', convertedTo: 'Invoice sent', conversionNote: 'Invoice send recorded locally.' }]
    ]
  },
  knowledge: {
    title: 'Knowledge Workspace',
    description: 'Local article editor, category, search, SOP attachment, training, and template controls.',
    fields: [
      ['category', 'Category', 'select', ['Company SOPs', 'Roofing procedures', 'Drafting guidelines', 'Admin guides', 'Lumen Marketing processes', 'Training', 'FAQs']],
      ['articleBody', 'Article body', 'textarea'],
      ['searchTerms', 'Search articles', 'input'],
      ['attachTarget', 'Attach SOP to', 'select', ['Job', 'Task']],
      ['trainingMaterial', 'Training materials', 'textarea'],
      ['templateNotes', 'Templates', 'textarea']
    ],
    cards: [
      ['Article list', 'Local record table plus article detail editor'],
      ['Categories', 'Company SOPs, roofing, drafting, admin, Lumen, training, FAQs'],
      ['Attachments', 'Attach SOPs to jobs or TaskManagement task context']
    ],
    actions: [
      ['Publish Article', { status: 'Published', conversionNote: 'Article published locally.' }],
      ['Attach SOP', { convertedTo: 'Attached SOP to job/task', conversionNote: 'SOP attachment recorded locally.' }]
    ]
  },
  automations: {
    title: 'Automation Workspace',
    description: 'Local trigger, condition, action, enablement, and run-log builder.',
    fields: [
      ['trigger', 'Trigger', 'select', ['New job created', 'Job stage changed', 'New form submitted', 'New survey submitted', 'Ticket created', 'Task completed', 'Due date reached', 'File uploaded', 'Invoice overdue', 'Estimate approved']],
      ['condition', 'Condition', 'select', ['Company is Roofing', 'Company is Drafting', 'Company is Lumen', 'Priority is urgent', 'Job stage is approved', 'Assigned user is empty', 'Invoice is overdue', 'Survey rating is low']],
      ['action', 'Action', 'select', ['Create task', 'Create job', 'Create ticket', 'Assign user', 'Send notification', 'Send email', 'Move job stage', 'Request approval', 'Attach template', 'Add checklist']],
      ['enabled', 'Enable / disable automation', 'select', ['Enabled', 'Paused']],
      ['automationLog', 'Automation log', 'textarea']
    ],
    cards: [
      ['Example: new roofing job', 'Create default inspection tasks'],
      ['Example: estimate approved', 'Create scheduling task'],
      ['Example: low survey rating', 'Create follow-up ticket'],
      ['Example: completed job', 'Send customer satisfaction survey'],
      ['Example: overdue invoice', 'Notify admin'],
      ['Example: all tasks done', 'Move job to completed']
    ],
    actions: [
      ['Run Automation Locally', { conversionNote: 'Automation run logged locally.' }],
      ['Enable Automation', { status: 'Enabled', conversionNote: 'Automation enabled locally.' }]
    ]
  },
  dashboards: {
    title: 'Dashboard Workspace',
    description: 'Local dashboard type, widget, filter, and saved-view builder.',
    fields: [
      ['dashboardType', 'Dashboard type', 'select', ['Company overview', 'Job pipeline', 'My work', 'Team workload', 'Stuck jobs', 'Time by job', 'Finance / AR', 'Survey results', 'Tickets', 'Client activity']],
      ['widgets', 'Widgets', 'textarea'],
      ['filters', 'Filters', 'input'],
      ['savedView', 'Saved view name', 'input']
    ],
    cards: [
      ['Active jobs', 'Completed jobs, stage breakdown, stuck jobs'],
      ['Task visibility', 'Overdue tasks, stuck tasks, workload by user, time tracked'],
      ['Business health', 'Open tickets, new leads, revenue, outstanding invoices, survey score']
    ],
    actions: [
      ['Pin Dashboard', { status: 'Pinned', convertedTo: 'Dashboard view pinned', conversionNote: 'Dashboard pinned locally.' }]
    ]
  },
  admin: {
    title: 'Admin Workspace',
    description: 'Local users, roles, permissions, company access, approval, and settings controls.',
    fields: [
      ['userName', 'User profile', 'input'],
      ['role', 'Role', 'select', ['Owner', 'Admin', 'Supervisor', 'Worker', 'Viewer']],
      ['permissions', 'Permissions', 'textarea'],
      ['companyAccess', 'Company access', 'select', ['Roofing', 'Drafting', 'Lumen', 'All companies']],
      ['approvalStatus', 'Approval status', 'select', ['Pending approval', 'Approved', 'Suspended']],
      ['settings', 'Settings', 'textarea']
    ],
    cards: [
      ['Users', 'User list, profiles, roles, permissions, company access, approval'],
      ['Companies', 'Roofing, Drafting, Lumen, and future companies'],
      ['Settings', 'Job types/stages, lead/ticket statuses, form/survey/estimate/automation templates, notifications']
    ],
    actions: [
      ['Approve User', { status: 'Approved', conversionNote: 'User approved locally.' }],
      ['Apply Setting', { convertedTo: 'Admin setting applied', conversionNote: 'Admin setting applied locally.' }]
    ]
  },
  templates: {
    title: 'Template Application Workspace',
    description: 'Local template application preview for jobs, tasks, forms, surveys, inspections, estimates, email, SOPs, and automations.',
    fields: [
      ['templateType', 'Template type', 'select', ['Job template', 'Task template', 'Form template', 'Survey template', 'Inspection template', 'Estimate template', 'Email template', 'SOP template', 'Automation template']],
      ['templateOutput', 'Creates', 'textarea'],
      ['exampleJob', 'Example job template', 'select', ['Roofing repair job', 'Roof replacement job', 'Drafting project', 'Lumen marketing project', 'Internal admin project']]
    ],
    cards: [
      ['Template types', 'Job, task, form, survey, inspection, estimate, email, SOP, automation'],
      ['Example jobs', 'Roofing repair, roof replacement, drafting, Lumen, internal admin'],
      ['Local application', 'Records the intended connected objects for presentation mode']
    ],
    actions: [
      ['Apply Template Locally', { status: 'Applied', convertedTo: 'Template applied to job setup', conversionNote: 'Template application recorded locally.' }]
    ]
  }
};

const moduleConfigs = {
  crm: {
    eyebrow: 'CRM',
    title: 'Relationship Pipeline',
    summary: 'Track leads, clients, contacts, and opportunities before they become jobs.',
    primaryAction: 'Create Lead',
    icon: Users,
    stats: [
      { label: 'Open leads', value: '14' },
      { label: 'Follow-ups due', value: '5' },
      { label: 'Clients', value: clients.length },
      { label: 'Pipeline value', value: '$81K' }
    ],
    lanes: [
      { title: 'New Lead', items: ['Queen Creek referral', 'Gilbert tile repair', 'Phoenix foam inquiry'] },
      { title: 'Qualified', items: ['Arroyo Vista HOA', 'Mesa Storage Partners'] },
      { title: 'Estimate Sent', items: ['Casa Azul Remodel'] },
      { title: 'Won', items: ['Horizon HVAC'] }
    ],
    sideTitle: 'Client Shortlist',
    sideItems: clients.map((client) => ({
      title: client.name,
      meta: `${client.contact} - ${getCompany(client.company).short}`
    }))
  },
  forms: {
    eyebrow: 'Forms and Surveys',
    title: 'Form Builder and Response Center',
    summary: 'Build inspections, approvals, surveys, and request intake forms that attach to jobs or clients.',
    primaryAction: 'Create Form',
    icon: ClipboardList,
    stats: [
      { label: 'Templates', value: '6' },
      { label: 'Responses', value: '28' },
      { label: 'Pending review', value: '4' },
      { label: 'Avg rating', value: '4.6' }
    ],
    lanes: [
      { title: 'Inspection', items: ['Roof inspection checklist', 'Site visit checklist'] },
      { title: 'Approval', items: ['Client approval form', 'Final walkthrough'] },
      { title: 'Feedback', items: ['Customer satisfaction', 'Employee feedback'] },
      { title: 'Intake', items: ['Internal request', 'Repair request'] }
    ],
    sideTitle: 'Recent Responses',
    sideItems: [
      { title: 'Arroyo Vista inspection request', meta: 'Attached to job-arroyo-hoa' },
      { title: 'Mesa Storage material approval', meta: 'Converted to job note' },
      { title: 'Horizon campaign survey', meta: 'Needs review' }
    ]
  },
  tickets: {
    eyebrow: 'Tickets',
    title: 'Requests and Issue Queue',
    summary: 'Handle client requests, internal admin requests, repairs, changes, and IT issues without turning everything into a task too early.',
    primaryAction: 'Create Ticket',
    icon: Ticket,
    stats: [
      { label: 'Open tickets', value: '8' },
      { label: 'Urgent', value: '2' },
      { label: 'Waiting client', value: '3' },
      { label: 'Converted', value: '11' }
    ],
    lanes: [
      { title: 'New', items: ['Client repair request', 'Payroll question'] },
      { title: 'Triaged', items: ['Change request - Mesa', 'Admin request - permit docs'] },
      { title: 'In Progress', items: ['Roof leak follow-up', 'IT access issue'] },
      { title: 'Convert', items: ['Create task', 'Create job'] }
    ],
    sideTitle: 'SLA Watch',
    sideItems: [
      { title: 'Roof leak follow-up', meta: 'Urgent - due today' },
      { title: 'Permit document request', meta: 'High - due tomorrow' },
      { title: 'Payroll question', meta: 'Medium - assigned admin' }
    ]
  },
  files: {
    eyebrow: 'Files',
    title: 'Document and Photo Library',
    summary: 'Centralize job photos, permits, contracts, estimates, invoices, drawings, and internal documents.',
    primaryAction: 'Upload File',
    icon: FolderOpen,
    stats: [
      { label: 'Files', value: '66' },
      { label: 'Job photos', value: '31' },
      { label: 'Needs tag', value: '7' },
      { label: 'Linked jobs', value: '4' }
    ],
    lanes: [
      { title: 'Job Photos', items: ['Arroyo Vista roof photos', 'Mesa coating photos'] },
      { title: 'Documents', items: ['Contracts', 'Permits', 'Client documents'] },
      { title: 'Finance', items: ['Estimates', 'Invoices', 'Payment records'] },
      { title: 'Production', items: ['Drawings', 'Drafting files', 'Marketing assets'] }
    ],
    sideTitle: 'Recent Uploads',
    sideItems: [
      { title: 'final-walkthrough.jpg', meta: 'Job photos' },
      { title: 'mesa-estimate.pdf', meta: 'Estimate' },
      { title: 'permit-correction-notes.pdf', meta: 'Drafting files' }
    ]
  },
  finance: {
    eyebrow: 'Finance',
    title: 'Estimates, Invoices, and AR',
    summary: 'Track job revenue, estimate approvals, invoices, payment status, and accounts receivable.',
    primaryAction: 'Create Estimate',
    icon: Receipt,
    stats: [
      { label: 'Open AR', value: '$24.9K' },
      { label: 'Estimates', value: '9' },
      { label: 'Overdue invoices', value: '2' },
      { label: 'Paid this week', value: '$11.8K' }
    ],
    lanes: [
      { title: 'Draft', items: ['Arroyo repair estimate', 'Casa Azul addendum'] },
      { title: 'Sent', items: ['Mesa coating phase 2', 'Queen Creek tile repair'] },
      { title: 'Approved', items: ['Mesa Storage deposit'] },
      { title: 'Invoiced', items: ['Horizon campaign retainer'] }
    ],
    sideTitle: 'AR Watch',
    sideItems: [
      { title: 'Mesa Storage Partners', meta: '$11,800 remaining' },
      { title: 'Casa Azul Remodel', meta: '$1,600 remaining' },
      { title: 'Horizon HVAC', meta: '$3,100 remaining' }
    ]
  },
  knowledge: {
    eyebrow: 'Knowledge Base',
    title: 'SOPs, Training, and Templates',
    summary: 'Keep procedures, drafting guidelines, roofing checklists, admin guides, and training materials searchable.',
    primaryAction: 'Create Article',
    icon: Library,
    stats: [
      { label: 'Articles', value: '24' },
      { label: 'Templates', value: '9' },
      { label: 'Needs review', value: '3' },
      { label: 'Attached SOPs', value: '12' }
    ],
    lanes: [
      { title: 'Roofing SOPs', items: ['Tile inspection process', 'Final photo standards'] },
      { title: 'Drafting', items: ['Permit response checklist', 'QA markups'] },
      { title: 'Admin', items: ['Invoice send process', 'Client handoff'] },
      { title: 'Lumen', items: ['Campaign launch checklist', 'Reporting template'] }
    ],
    sideTitle: 'Pinned SOPs',
    sideItems: [
      { title: 'Roof inspection checklist', meta: 'Attached to 2 jobs' },
      { title: 'Estimate approval workflow', meta: 'Finance template' },
      { title: 'Drafting QA checklist', meta: 'Used this week' }
    ]
  },
  automations: {
    eyebrow: 'Automations',
    title: 'Workflow Rule Builder',
    summary: 'Define triggers, conditions, and actions that move work between jobs, forms, tickets, finance, and TaskManagement.',
    primaryAction: 'Create Automation',
    icon: Workflow,
    stats: [
      { label: 'Active rules', value: '7' },
      { label: 'Paused', value: '2' },
      { label: 'Runs today', value: '18' },
      { label: 'Failures', value: '0' }
    ],
    lanes: [
      { title: 'Triggers', items: ['New job created', 'Estimate approved', 'Survey rating low'] },
      { title: 'Conditions', items: ['Company is Roofing', 'Priority is urgent', 'Invoice overdue'] },
      { title: 'Actions', items: ['Create task', 'Move job stage', 'Send notification'] },
      { title: 'Log', items: ['Default inspection tasks created', 'Admin notified'] }
    ],
    sideTitle: 'Recommended Rules',
    sideItems: [
      { title: 'New roofing job creates inspection tasks', meta: 'Needs TaskManagement write integration' },
      { title: 'Low survey rating creates ticket', meta: 'Ready after surveys' },
      { title: 'Overdue invoice notifies admin', meta: 'Finance trigger' }
    ]
  },
  dashboards: {
    eyebrow: 'Dashboards',
    title: 'Executive and Team Reporting',
    summary: 'Compare pipeline, workload, time, job stages, tickets, surveys, and finance in one reporting layer.',
    primaryAction: 'Create Dashboard',
    icon: BarChart3,
    stats: [
      { label: 'Active jobs', value: '4' },
      { label: 'Workload risk', value: '2' },
      { label: 'Survey score', value: '4.6' },
      { label: 'Revenue view', value: '$37K' }
    ],
    lanes: [
      { title: 'Company Overview', items: ['Active jobs', 'New leads', 'Open tickets'] },
      { title: 'Workload', items: ['Team workload', 'Stuck jobs', 'Overdue tasks'] },
      { title: 'Finance', items: ['Revenue by job', 'Outstanding invoices'] },
      { title: 'Quality', items: ['Survey results', 'Completion trends'] }
    ],
    sideTitle: 'Saved Views',
    sideItems: [
      { title: 'Roofing weekly ops', meta: 'Jobs, time, AR' },
      { title: 'Lumen campaign health', meta: 'Pipeline and deliverables' },
      { title: 'Drafting QA', meta: 'Reviews and due dates' }
    ]
  },
  templates: {
    eyebrow: 'Templates',
    title: 'Reusable Operations Templates',
    summary: 'Standardize jobs, forms, surveys, inspections, estimates, emails, SOPs, automations, and TaskManagement task sets.',
    primaryAction: 'Create Template',
    icon: Layers3,
    stats: [
      { label: 'Active templates', value: '18' },
      { label: 'Job templates', value: '5' },
      { label: 'Form templates', value: '6' },
      { label: 'Needs review', value: '3' }
    ],
    lanes: [
      { title: 'Jobs', items: ['Roofing repair job', 'Roof replacement job', 'Drafting project'] },
      { title: 'Forms', items: ['Inspection template', 'Survey template', 'Client approval'] },
      { title: 'Finance', items: ['Estimate template', 'Invoice note', 'Payment reminder'] },
      { title: 'Automation', items: ['New job task set', 'Low rating follow-up', 'Overdue invoice notice'] }
    ],
    sideTitle: 'Template Library',
    sideItems: [
      { title: 'Roofing repair job', meta: 'Creates job shell, form, estimate, task set' },
      { title: 'Drafting project', meta: 'Creates QA checklist and review milestones' },
      { title: 'Lumen marketing project', meta: 'Creates launch checklist and reporting dashboard' }
    ]
  },
  admin: {
    eyebrow: 'Admin',
    title: 'Users, Companies, and Settings',
    summary: 'Manage users, roles, permissions, company access, workflow statuses, templates, and notification settings.',
    primaryAction: 'Invite User',
    icon: Settings,
    stats: [
      { label: 'Users', value: people.length },
      { label: 'Companies', value: companies.length },
      { label: 'Roles', value: '5' },
      { label: 'Pending approvals', value: '2' }
    ],
    lanes: [
      { title: 'Users', items: ['Role access', 'Approval status', 'Company access'] },
      { title: 'Companies', items: ['Roofing', 'Drafting', 'Lumen'] },
      { title: 'Settings', items: ['Job stages', 'Lead statuses', 'Ticket statuses'] },
      { title: 'Templates', items: ['Job templates', 'Form templates', 'Automation templates'] }
    ],
    sideTitle: 'Admin Queue',
    sideItems: [
      { title: 'Approve new worker profile', meta: 'Needs role assignment' },
      { title: 'Add repair job template', meta: 'Requested by Roofing' },
      { title: 'Review notification settings', meta: 'Finance alerts' }
    ]
  }
};

const initialModuleRecords = {
  crm: [
    {
      id: 'crm-lead-queen-creek',
      title: 'Queen Creek referral',
      status: 'Qualified',
      jobId: 'job-arroyo-hoa',
      extra: 'Referral - $8,400',
      notes: 'Referral from HOA board member. Follow up on inspection availability.',
      convertedTo: null,
      structured: {
        recordType: 'Lead',
        leadSource: 'Referral',
        assignedRep: 'abraham',
        followUpDate: '2026-06-10',
        dealValue: 8400,
        estimateStatus: 'Inspection needed',
        relatedClientId: 'client-arroyo',
        contactName: 'Maya Rosales',
        email: 'maya@arroyovista.example',
        phone: '(480) 555-0142',
        role: 'HOA board contact'
      }
    },
    {
      id: 'crm-lead-gilbert',
      title: 'Gilbert tile repair',
      status: 'New',
      jobId: '',
      extra: 'Website form - $4,200',
      notes: 'Inbound roof repair inquiry. Needs first call and photos.',
      convertedTo: null,
      structured: {
        recordType: 'Lead',
        leadSource: 'Website form',
        assignedRep: 'alkeith',
        followUpDate: '2026-06-11',
        dealValue: 4200,
        estimateStatus: 'Not sent',
        relatedClientId: '',
        contactName: 'New Gilbert homeowner',
        email: 'homeowner@gilbert.example',
        phone: '(480) 555-0120',
        role: 'Homeowner'
      }
    }
  ],
  forms: [
    {
      id: 'forms-roof-inspection',
      title: 'Roof inspection checklist',
      status: 'Published',
      jobId: 'job-arroyo-hoa',
      extra: 'Yes/no, rating, date, file upload, signature',
      notes: 'Includes photos, yes/no roof condition fields, rating, date, file upload, and signature.',
      convertedTo: null,
      structured: {
        description: 'Roof inspection checklist for field photos, condition scoring, repair notes, and client signature.',
        visibility: 'Public link',
        publicLink: 'https://quest-hq.local/forms/roof-inspection',
        internalOnly: false,
        questionTypes: ['Short text', 'Long text', 'Rating', 'Yes / No', 'Date', 'File upload', 'Signature'],
        responseSearch: '',
        responseFilter: 'All',
        attachedClientId: 'client-arroyo',
        responseCount: 12,
        averageRating: 4.7,
        surveyType: 'Inspection form',
        checklistItems: 'Roof inspection checklist, Site visit checklist, Safety checklist, Final walkthrough checklist',
        responses: [
          { id: 'resp-arroyo-1', title: 'Arroyo Vista inspection request', type: 'Inspection form', rating: 5, status: 'Needs review', jobId: 'job-arroyo-hoa', clientId: 'client-arroyo' },
          { id: 'resp-arroyo-2', title: 'Final walkthrough packet', type: 'Job completion survey', rating: 4.4, status: 'Attached', jobId: 'job-mesa-storage', clientId: 'client-mesa' }
        ]
      }
    },
    {
      id: 'forms-client-approval',
      title: 'Client approval form',
      status: 'Draft',
      jobId: 'job-mesa-storage',
      extra: 'Short text, checkbox, signature',
      notes: 'Public link ready after estimate scope is finalized.',
      convertedTo: null,
      structured: {
        description: 'Client approval form for estimate scope and signature.',
        visibility: 'Internal only',
        publicLink: '',
        internalOnly: true,
        questionTypes: ['Short text', 'Checkbox', 'Signature'],
        responseSearch: '',
        responseFilter: 'All',
        attachedClientId: 'client-mesa',
        responseCount: 6,
        averageRating: 4.5,
        surveyType: 'Client approval form',
        checklistItems: 'Client approval form, Internal request form',
        responses: [
          { id: 'resp-mesa-approval', title: 'Mesa Storage material approval', type: 'Client approval form', rating: 4.5, status: 'Approved', jobId: 'job-mesa-storage', clientId: 'client-mesa' }
        ]
      }
    }
  ],
  tickets: [
    {
      id: 'tickets-roof-leak',
      title: 'Roof leak follow-up',
      status: 'Urgent',
      jobId: 'job-arroyo-hoa',
      extra: 'Client request',
      notes: 'Client reported active leak after storm. Convert to task when triaged.',
      convertedTo: null,
      structured: {
        type: 'Client request',
        priority: 'urgent',
        requester: 'Maya Rosales',
        assignedPerson: 'kristine',
        relatedClientId: 'client-arroyo',
        internalNotes: 'Confirm warranty status before dispatch. Photos requested from client.',
        dueDate: '2026-06-09',
        attachedFiles: ['storm-leak-photo.jpg']
      }
    },
    {
      id: 'tickets-permit-docs',
      title: 'Permit document request',
      status: 'Triaged',
      jobId: 'job-casa-drafting',
      extra: 'Admin request',
      notes: 'Admin request for corrected permit package.',
      convertedTo: null,
      structured: {
        type: 'Admin request',
        priority: 'high',
        requester: 'Elena Torres',
        assignedPerson: 'andres',
        relatedClientId: 'client-casa',
        internalNotes: 'Attach corrected permit package and drafting QA notes.',
        dueDate: '2026-06-11',
        attachedFiles: ['permit-correction-notes.pdf']
      }
    }
  ],
  files: [
    {
      id: 'files-final-walkthrough',
      title: 'final-walkthrough.jpg',
      status: 'Tagged',
      jobId: 'job-mesa-storage',
      extra: 'Job photos - final, walkthrough, Mesa',
      notes: 'Category: Job photos. Tags: final, walkthrough, Mesa.',
      convertedTo: null,
      structured: { fileName: 'final-walkthrough.jpg', fileType: 'image/jpeg', fileSize: 2480000, category: 'Job photos', tags: 'final, walkthrough, Mesa', attachmentTarget: 'Job' }
    },
    {
      id: 'files-mesa-estimate',
      title: 'mesa-estimate.pdf',
      status: 'Attached',
      jobId: 'job-mesa-storage',
      extra: 'Estimates - client, approved',
      notes: 'Category: Estimates. Attached to client and job.',
      convertedTo: null,
      structured: { fileName: 'mesa-estimate.pdf', fileType: 'application/pdf', fileSize: 620000, category: 'Estimates', tags: 'client, approved, Mesa', attachmentTarget: 'Job' }
    }
  ],
  finance: [
    { id: 'finance-arroyo-estimate', title: 'Arroyo repair estimate', status: 'Draft', jobId: 'job-arroyo-hoa', extra: 'Tile, underlayment, cleanup, tax - $8,400', notes: 'Line items include tile replacement, underlayment repair, cleanup, taxes, and discount.', convertedTo: null },
    { id: 'finance-mesa-deposit', title: 'Mesa Storage deposit invoice', status: 'Sent', jobId: 'job-mesa-storage', extra: '50% deposit - $11,800', notes: '50% deposit invoice sent. AR watch until paid.', convertedTo: null }
  ],
  knowledge: [
    { id: 'knowledge-roof-inspection', title: 'Roof inspection checklist SOP', status: 'Published', jobId: 'job-arroyo-hoa', extra: 'Roofing procedures', notes: 'Training material and inspection template attached to roofing jobs.', convertedTo: null },
    { id: 'knowledge-drafting-qa', title: 'Drafting QA checklist', status: 'Review', jobId: 'job-casa-drafting', extra: 'Drafting guidelines', notes: 'Internal QA steps for permit correction cycles.', convertedTo: null }
  ],
  automations: [
    { id: 'automations-inspection-tasks', title: 'New roofing job creates inspection tasks', status: 'Enabled', jobId: 'job-arroyo-hoa', extra: 'New job -> create default tasks', notes: 'Trigger: new job. Condition: company is Roofing. Action: create default inspection tasks.', convertedTo: null },
    { id: 'automations-overdue-invoice', title: 'Overdue invoice notifies admin', status: 'Paused', jobId: 'job-mesa-storage', extra: 'Invoice overdue -> notify admin', notes: 'Trigger: invoice overdue. Action: notify admin and add activity log.', convertedTo: null }
  ],
  dashboards: [
    { id: 'dashboards-roofing-weekly', title: 'Roofing weekly ops', status: 'Pinned', jobId: 'job-mesa-storage', extra: 'Active jobs, overdue tasks, AR, time tracked', notes: 'Widgets: active jobs, overdue tasks, open tickets, AR, time tracked.', convertedTo: null },
    { id: 'dashboards-drafting-qa', title: 'Drafting QA', status: 'Saved', jobId: 'job-casa-drafting', extra: 'QA review, stuck jobs, workload by user', notes: 'Widgets: QA review count, stuck tasks, due dates, workload by user.', convertedTo: null }
  ],
  admin: [
    { id: 'admin-worker-profile', title: 'Approve new worker profile', status: 'Pending approval', jobId: '', extra: 'Worker - Roofing access', notes: 'Assign role, permissions, and company access before enabling app use.', convertedTo: null },
    { id: 'admin-repair-template', title: 'Add repair job template', status: 'Draft', jobId: 'job-arroyo-hoa', extra: 'Job template - repair', notes: 'Template should create inspection checklist, estimate template, and default TaskManagement task set.', convertedTo: null }
  ],
  templates: [
    { id: 'templates-roofing-repair', title: 'Roofing repair job', status: 'Published', jobId: 'job-arroyo-hoa', extra: 'Job + task + inspection + estimate', notes: 'Creates repair job shell, default inspection form, TaskManagement task set, and estimate starter.', convertedTo: null },
    { id: 'templates-drafting-project', title: 'Drafting project', status: 'Review', jobId: 'job-casa-drafting', extra: 'Job + QA checklist + milestones', notes: 'Creates drafting project stages, QA checklist, client update notes, and review reminders.', convertedTo: null },
    { id: 'templates-lumen-marketing', title: 'Lumen marketing project', status: 'Draft', jobId: 'job-horizon-lumen', extra: 'Job + launch checklist + dashboard', notes: 'Creates campaign setup, reporting dashboard, intake form, and launch task set.', convertedTo: null }
  ]
};

const moduleWorkspaceConfigs = {
  crm: [
    {
      title: 'Lead Intake',
      description: 'Capture the source, owner, deal value, follow-up date, and conversion path for every opportunity.',
      items: [
        ['Lead source', 'Referral, website, phone, campaign, repeat client'],
        ['Assigned sales rep', 'Owner for next call and estimate handoff'],
        ['Follow-up date', 'Reminder field before the lead goes cold'],
        ['Convert lead', 'Create client, contact, or job without retyping']
      ]
    },
    {
      title: 'Client and Contact Profiles',
      description: 'Keep client details, contact roles, communication notes, files, invoices, and related jobs together.',
      items: [
        ['Client profile', 'Company, billing details, address, and notes'],
        ['Contact profile', 'Email, phone, role, relationship, related jobs'],
        ['Related work', 'Jobs, files, invoices, tickets, and forms'],
        ['Communication notes', 'Sales and admin history in one timeline']
      ]
    }
  ],
  forms: [
    {
      title: 'Form Builder',
      description: 'Build public or internal forms, duplicate templates, edit fields, and retire old versions.',
      items: [
        ['Question types', 'Short text, long text, choices, dropdown, rating, yes/no'],
        ['Advanced fields', 'Date, number, file upload, and signature capture'],
        ['Visibility', 'Public form link or internal-only form'],
        ['Template actions', 'Create, edit, duplicate, and delete']
      ]
    },
    {
      title: 'Responses and Surveys',
      description: 'Review responses, attach them to jobs or clients, and convert intake into operational records.',
      items: [
        ['Response queue', 'Search, filter, attach to job, attach to client'],
        ['Conversions', 'Lead, job, task, or ticket'],
        ['Survey analytics', 'Average rating, response count, completion status'],
        ['Checklists', 'Roof, site visit, drafting QA, safety, final walkthrough']
      ]
    }
  ],
  tickets: [
    {
      title: 'Request Triage',
      description: 'Sort incoming client, internal, repair, change, admin, finance, and IT requests before execution.',
      items: [
        ['Ticket type', 'Client request, repair, change, admin, finance, IT'],
        ['Priority and SLA', 'Urgent, high, medium, low with due dates'],
        ['Requester and assignee', 'Who raised it and who owns the next move'],
        ['Internal notes', 'Keep decision context off the client-facing trail']
      ]
    },
    {
      title: 'Convert to Work',
      description: 'Only approved tickets become executable work in TaskManagement or new job containers.',
      items: [
        ['Create task', 'Push accepted work to TaskManagement'],
        ['Create job', 'Promote larger requests into a job profile'],
        ['Create estimate', 'Route scope changes to Finance'],
        ['Activity log', 'Preserve ticket history after conversion']
      ]
    }
  ],
  files: [
    {
      title: 'Document Library',
      description: 'Organize job photos, permits, contracts, estimates, invoices, drawings, and marketing assets.',
      items: [
        ['Categories', 'Job photos, permits, contracts, estimates, invoices'],
        ['Tags', 'Crew, site, phase, client, final, internal'],
        ['Attachment targets', 'Job, client, form response, ticket, invoice'],
        ['Preview metadata', 'File type, size, upload owner, last updated']
      ]
    },
    {
      title: 'Job File Control',
      description: 'Make sure operational files are findable from the job profile and finance records.',
      items: [
        ['Photo packets', 'Inspection, progress, final walkthrough'],
        ['Permits and drawings', 'Drafting files and correction responses'],
        ['Financial documents', 'Estimate, invoice, payment record'],
        ['Access rules', 'Internal documents stay scoped by company and role']
      ]
    }
  ],
  finance: [
    {
      title: 'Estimate Builder',
      description: 'Draft line items, discounts, taxes, approvals, and estimate-to-invoice conversions.',
      items: [
        ['Line items', 'Labor, material, subcontractor, equipment, tax'],
        ['Adjustments', 'Discounts, fees, deposits, change orders'],
        ['Approval status', 'Draft, sent, approved, declined, revised'],
        ['Convert estimate', 'Create invoice and preserve estimate history']
      ]
    },
    {
      title: 'Invoices and AR',
      description: 'Track invoice due dates, payment status, overdue accounts, and payment records.',
      items: [
        ['Invoice status', 'Draft, sent, partial, paid, overdue'],
        ['Payment records', 'Deposit, final payment, method, receipt notes'],
        ['AR watch', 'Remaining balance by job and client'],
        ['Finance activity', 'Estimate sent, invoice paid, overdue alert']
      ]
    }
  ],
  knowledge: [
    {
      title: 'SOP Library',
      description: 'Keep roofing, drafting, admin, finance, and Lumen procedures searchable and reusable.',
      items: [
        ['Categories', 'SOP, checklist, training, template, policy'],
        ['Article status', 'Draft, review, published, archived'],
        ['Attach to work', 'Job, task, ticket, form, or finance record'],
        ['Review cadence', 'Owner and next review date for stale content']
      ]
    },
    {
      title: 'Reusable Templates',
      description: 'House the operational templates that power jobs, forms, tickets, finance, and automations.',
      items: [
        ['Job templates', 'Repair, inspection, drafting, campaign'],
        ['Checklist templates', 'Roof inspection, safety, final walkthrough'],
        ['Message templates', 'Client updates and approval requests'],
        ['Training paths', 'Role-based onboarding material']
      ]
    }
  ],
  automations: [
    {
      title: 'Rule Builder',
      description: 'Define trigger, condition, and action blocks for cross-module workflow automation.',
      items: [
        ['Triggers', 'New job, estimate approved, low survey rating'],
        ['Conditions', 'Company, priority, stage, amount, overdue state'],
        ['Actions', 'Create task, move stage, notify user, attach template'],
        ['Enable switch', 'Run, pause, and test before release']
      ]
    },
    {
      title: 'Run Log',
      description: 'Show what each automation did, when it ran, and whether it needs attention.',
      items: [
        ['Execution history', 'Timestamp, record, result, actor'],
        ['Failure handling', 'Retry, pause rule, notify admin'],
        ['Audit trail', 'Before and after values for changed records'],
        ['Task bridge', 'TaskManagement writes stay explicit and traceable']
      ]
    }
  ],
  dashboards: [
    {
      title: 'Widget Builder',
      description: 'Compose operational views from jobs, tasks, tickets, forms, time, and finance data.',
      items: [
        ['Widget types', 'Metric, table, chart, lane, alert, workload'],
        ['Data sources', 'Jobs, TaskManagement, CRM, finance, surveys'],
        ['Filters', 'Company, owner, stage, date range, priority'],
        ['Saved views', 'Executive, roofing ops, drafting QA, Lumen delivery']
      ]
    },
    {
      title: 'Operational Reporting',
      description: 'Give managers fast answers without making them open every module individually.',
      items: [
        ['Workload', 'Assigned tasks, overdue tasks, stuck jobs'],
        ['Revenue', 'Estimates, invoices, AR, paid this week'],
        ['Quality', 'Survey score, open issues, final walkthroughs'],
        ['Pipeline', 'New leads, won work, conversion rate']
      ]
    }
  ],
  admin: [
    {
      title: 'Users and Roles',
      description: 'Control who can see each company, module, job, and finance surface.',
      items: [
        ['User profiles', 'Role, company access, approval status'],
        ['Permissions', 'View, create, edit, approve, finance access'],
        ['Company access', 'Roofing, Drafting, Lumen, or all companies'],
        ['Invite flow', 'Pending approval before full access']
      ]
    },
    {
      title: 'System Settings',
      description: 'Manage statuses, templates, notifications, and integration settings from one admin area.',
      items: [
        ['Status settings', 'Job, lead, ticket, estimate, invoice statuses'],
        ['Templates', 'Jobs, forms, automations, notifications'],
        ['Notifications', 'Due dates, overdue invoices, SLA alerts'],
        ['Integrations', 'TaskManagement URL and project_id bridge']
      ]
    }
  ],
  templates: [
    {
      title: 'Template Types',
      description: 'Keep each repeatable operating pattern in one place so teams do not rebuild the same setup by hand.',
      items: [
        ['Job templates', 'Roofing repair, roof replacement, drafting, Lumen, internal admin'],
        ['Task templates', 'Default TaskManagement task sets linked by project_id'],
        ['Form and survey templates', 'Intake, approvals, satisfaction, employee feedback'],
        ['SOP and email templates', 'Reusable procedures and client communication']
      ]
    },
    {
      title: 'Template Application',
      description: 'Apply a template to create the right connected records while leaving execution inside TaskManagement.',
      items: [
        ['Inspection templates', 'Roof, site visit, drafting QA, safety, final walkthrough'],
        ['Estimate templates', 'Line items, taxes, fees, discounts, approval language'],
        ['Automation templates', 'New job tasks, estimate approved, low rating, overdue invoice'],
        ['Template review', 'Published, draft, review, archived, and needs update states']
      ]
    }
  ]
};

function useStoredJobs() {
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = window.localStorage.getItem('quest-hq-jobs');
      return saved ? JSON.parse(saved) : initialJobs;
    } catch {
      return initialJobs;
    }
  });

  const saveJobs = (nextJobs) => {
    setJobs(nextJobs);
    try {
      window.localStorage.setItem('quest-hq-jobs', JSON.stringify(nextJobs));
    } catch {
      // Keep the in-memory state if browser storage is unavailable.
    }
  };

  return [jobs, saveJobs];
}

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (!saved) return initialValue;
      const parsed = JSON.parse(saved);
      if (
        initialValue &&
        parsed &&
        !Array.isArray(initialValue) &&
        !Array.isArray(parsed) &&
        typeof initialValue === 'object' &&
        typeof parsed === 'object'
      ) {
        return { ...initialValue, ...parsed };
      }
      return parsed;
    } catch {
      return initialValue;
    }
  });

  const saveValue = (nextValue) => {
    setValue(nextValue);
    try {
      window.localStorage.setItem(key, JSON.stringify(nextValue));
    } catch {
      // Keep the in-memory state if browser storage is unavailable.
    }
  };

  return [value, saveValue];
}

function getCompany(id) {
  return companies.find((company) => company.id === id) || companies[0];
}

function getClient(id) {
  return clients.find((client) => client.id === id);
}

function getPerson(id) {
  return people.find((person) => person.id === id);
}

function daysUntil(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  const current = new Date(`${today}T00:00:00`);
  return Math.round((date - current) / 86400000);
}

function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function taskStats(jobId) {
  const tasks = taskRollups.filter((task) => task.projectId === jobId);
  const completed = tasks.filter((task) => task.status === 'done').length;
  const overdue = tasks.filter((task) => task.status !== 'done' && task.due < today).length;
  const review = tasks.filter((task) => task.status === 'review').length;
  const hours = timeEntries
    .filter((entry) => entry.projectId === jobId)
    .reduce((sum, entry) => sum + entry.hours, 0);

  return { tasks, total: tasks.length, completed, overdue, review, hours };
}

function statusLabel(value) {
  return value.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

function App() {
  const routeJobId = new URLSearchParams(window.location.search).get('job_id');
  const [jobs, setJobs] = useStoredJobs();
  const [moduleRecords, setModuleRecords] = useStoredState('quest-hq-module-records', initialModuleRecords);
  const [activeView, setActiveView] = useState(routeJobId ? 'jobs' : 'command');
  const [activeCompany, setActiveCompany] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(routeJobId || initialJobs[0]?.id || null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [activeModuleForm, setActiveModuleForm] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    const text = query.trim().toLowerCase();
    return jobs
      .filter((job) => activeCompany === 'all' || job.company === activeCompany)
      .filter((job) => {
        if (!text) return true;
        const client = getClient(job.clientId);
        return [job.name, job.stage, job.type, job.scope, client?.name, job.siteAddress]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(text));
      })
      .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || daysUntil(a.endDate) - daysUntil(b.endDate));
  }, [activeCompany, jobs, query]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || filteredJobs[0] || jobs[0];

  const metrics = useMemo(() => {
    const visibleJobs = activeCompany === 'all' ? jobs : jobs.filter((job) => job.company === activeCompany);
    const allTaskStats = visibleJobs.map((job) => taskStats(job.id));
    const activeJobs = visibleJobs.filter((job) => job.stage !== 'Completed').length;
    const overdueTasks = allTaskStats.reduce((sum, stat) => sum + stat.overdue, 0);
    const openTickets = 7 + visibleJobs.filter((job) => job.priority === 'urgent').length;
    const outstandingInvoices = visibleJobs.reduce((sum, job) => sum + Math.max(0, (job.estimateTotal || 0) - (job.invoiceTotal || 0)), 0);
    const timeTracked = allTaskStats.reduce((sum, stat) => sum + stat.hours, 0);

    return { activeJobs, overdueTasks, openTickets, outstandingInvoices, timeTracked };
  }, [activeCompany, jobs]);

  const addJob = (payload) => {
    const nextJob = {
      id: `job-${slugify(payload.name) || Date.now()}`,
      fileCount: 0,
      formCount: 0,
      estimateTotal: Number(payload.estimateTotal || 0),
      invoiceTotal: 0,
      notes: '',
      ...payload
    };
    const nextJobs = [nextJob, ...jobs];
    setJobs(nextJobs);
    setSelectedJobId(nextJob.id);
    setActiveView('jobs');
    setShowCreateJob(false);
  };

  const addModuleRecord = (moduleId, payload) => {
    const record = {
      id: `${moduleId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload
    };
    const nextRecords = {
      ...moduleRecords,
      [moduleId]: [record, ...(moduleRecords[moduleId] || [])]
    };
    setModuleRecords(nextRecords);
    setActiveModuleForm(null);
    setActiveView(moduleId);
  };

  const updateModuleRecord = (moduleId, recordId, patch) => {
    setModuleRecords({
      ...moduleRecords,
      [moduleId]: (moduleRecords[moduleId] || []).map((record) => (
        record.id === recordId ? { ...record, ...patch, updatedAt: new Date().toISOString() } : record
      ))
    });
  };

  const deleteModuleRecord = (moduleId, recordId) => {
    setModuleRecords({
      ...moduleRecords,
      [moduleId]: (moduleRecords[moduleId] || []).filter((record) => record.id !== recordId)
    });
  };

  const duplicateModuleRecord = (moduleId, recordId) => {
    const record = (moduleRecords[moduleId] || []).find((item) => item.id === recordId);
    if (!record) return;
    const copy = {
      ...record,
      id: `${moduleId}-${Date.now()}`,
      title: `${record.title} copy`,
      status: 'Draft',
      convertedTo: null,
      conversionNote: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      structured: record.structured ? JSON.parse(JSON.stringify(record.structured)) : {}
    };
    setModuleRecords({
      ...moduleRecords,
      [moduleId]: [copy, ...(moduleRecords[moduleId] || [])]
    });
  };

  const convertModuleRecord = (moduleId, recordId) => {
    const conversion = conversionLabel(moduleId);
    updateModuleRecord(moduleId, recordId, {
      status: 'Converted',
      convertedTo: conversion,
      conversionNote: `${conversion} recorded ${new Date().toLocaleDateString('en-US')}.`
    });
  };

  const convertCrmLeadToClient = (recordId) => {
    const lead = (moduleRecords.crm || []).find((record) => record.id === recordId);
    if (!lead) return;
    const details = lead.structured || {};
    const clientRecord = {
      id: `crm-client-${slugify(lead.title) || Date.now()}`,
      title: `${details.contactName || lead.title} client profile`,
      status: 'Client',
      jobId: lead.jobId || '',
      extra: `Client - ${details.leadSource || 'Lead conversion'}`,
      notes: `Created from ${lead.title}. ${lead.notes || ''}`.trim(),
      convertedTo: null,
      createdAt: new Date().toISOString(),
      structured: {
        ...details,
        recordType: 'Client',
        clientCompany: details.relatedClientId ? getClient(details.relatedClientId)?.name : lead.title,
        communicationNotes: lead.notes || ''
      }
    };
    setModuleRecords({
      ...moduleRecords,
      crm: [
        clientRecord,
        ...(moduleRecords.crm || []).map((record) => (
          record.id === recordId
            ? {
                ...record,
                status: 'Converted',
                convertedTo: 'Converted lead to client',
                conversionNote: `${clientRecord.title} created ${new Date().toLocaleDateString('en-US')}.`,
                updatedAt: new Date().toISOString(),
                structured: { ...(record.structured || {}), recordType: 'Lead', convertedClientRecordId: clientRecord.id }
              }
            : record
        ))
      ]
    });
  };

  const convertCrmLeadToJob = (recordId) => {
    const lead = (moduleRecords.crm || []).find((record) => record.id === recordId);
    if (!lead) return;
    const details = lead.structured || {};
    const relatedClient = details.relatedClientId ? getClient(details.relatedClientId) : clients[0];
    const assignedRep = details.assignedRep || people[0].id;
    const newJob = {
      id: `job-${slugify(lead.title) || Date.now()}`,
      name: lead.title,
      company: getPerson(assignedRep)?.company || relatedClient?.company || 'roofing',
      clientId: relatedClient?.id || clients[0].id,
      contact: details.contactName || relatedClient?.contact || '',
      siteAddress: relatedClient?.address || 'Address pending',
      type: 'Lead conversion',
      stage: 'Lead',
      priority: 'medium',
      owner: assignedRep,
      scope: lead.notes || 'Scope created from CRM lead.',
      startDate: today,
      endDate: details.followUpDate || today,
      estimateTotal: safeNumber(details.dealValue),
      invoiceTotal: 0,
      fileCount: 0,
      formCount: 0,
      notes: `Created from CRM lead ${lead.title}.`
    };
    const nextJobs = [newJob, ...jobs];
    setJobs(nextJobs);
    updateModuleRecord('crm', recordId, {
      status: 'Converted',
      jobId: newJob.id,
      convertedTo: 'Converted lead to job',
      conversionNote: `${newJob.name} created ${new Date().toLocaleDateString('en-US')}.`,
      structured: { ...(lead.structured || {}), convertedJobId: newJob.id }
    });
    setSelectedJobId(newJob.id);
  };

  const convertTicketToJob = (recordId) => {
    const ticket = (moduleRecords.tickets || []).find((record) => record.id === recordId);
    if (!ticket) return;
    const details = ticket.structured || {};
    const relatedClient = details.relatedClientId ? getClient(details.relatedClientId) : clients[0];
    const owner = details.assignedPerson || people[0].id;
    const newJob = {
      id: `job-${slugify(ticket.title) || Date.now()}`,
      name: ticket.title,
      company: getPerson(owner)?.company || relatedClient?.company || 'roofing',
      clientId: relatedClient?.id || clients[0].id,
      contact: details.requester || relatedClient?.contact || '',
      siteAddress: relatedClient?.address || 'Address pending',
      type: details.type || 'Ticket conversion',
      stage: 'Lead',
      priority: details.priority || 'medium',
      owner,
      scope: ticket.notes || details.internalNotes || 'Scope created from ticket.',
      startDate: today,
      endDate: details.dueDate || today,
      estimateTotal: 0,
      invoiceTotal: 0,
      fileCount: (details.attachedFiles || []).length,
      formCount: 0,
      notes: `Created from ticket ${ticket.title}. ${details.internalNotes || ''}`.trim()
    };
    setJobs([newJob, ...jobs]);
    updateModuleRecord('tickets', recordId, {
      status: 'Converted',
      jobId: newJob.id,
      convertedTo: 'Converted ticket to job',
      conversionNote: `${newJob.name} created ${new Date().toLocaleDateString('en-US')}.`,
      structured: { ...details, convertedJobId: newJob.id }
    });
    setSelectedJobId(newJob.id);
  };

  const openModuleForm = (moduleId) => {
    setActiveView(moduleId);
    setActiveModuleForm(moduleId);
  };

  const openJob = (jobId) => {
    setSelectedJobId(jobId);
    setActiveView('jobs');
    const url = new URL(window.location.href);
    url.searchParams.set('job_id', jobId);
    window.history.replaceState({}, '', url);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">Q</div>
          <div>
            <div className="brand-title">Quest HQ</div>
            <div className="brand-subtitle">Operations Command</div>
          </div>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <div className="tiny-label">Integration</div>
          <div className="sidebar-card-title">Work Execution stays in TaskManagement</div>
          <p>Quest HQ owns jobs, clients, files, forms, and finance. Tasks remain linked through <code>project_id</code>.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div className="search-wrap">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs, clients, scopes, stages" />
          </div>
          <div className="company-switcher" role="tablist" aria-label="Company filter">
            <button className={activeCompany === 'all' ? 'active' : ''} onClick={() => setActiveCompany('all')}>All</button>
            {companies.map((company) => (
              <button key={company.id} className={activeCompany === company.id ? 'active' : ''} onClick={() => setActiveCompany(company.id)}>
                {company.short}
              </button>
            ))}
          </div>
          <button className="primary-button" onClick={() => setShowCreateJob(true)}>
            <Plus size={17} />
            <span>Create Job</span>
          </button>
        </header>

        {activeView === 'command' && (
          <CommandCenter
            jobs={filteredJobs}
            metrics={metrics}
            onCreateJob={() => setShowCreateJob(true)}
            onCreateRecord={openModuleForm}
            onOpenJob={openJob}
            onOpenTaskManagement={() => setActiveView('task-management')}
          />
        )}

        {activeView === 'jobs' && (
          <JobsView
            jobs={filteredJobs}
            selectedJob={selectedJob}
            onOpenJob={openJob}
            onCreateJob={() => setShowCreateJob(true)}
          />
        )}

        {activeView !== 'command' && activeView !== 'jobs' && (
          <ModuleView
            key={`${activeView}:${(moduleRecords[activeView] || [])[0]?.id || 'empty'}:${(moduleRecords[activeView] || []).length}`}
            id={activeView}
            jobs={filteredJobs}
            moduleRecords={moduleRecords[activeView] || []}
            onCreateRecord={openModuleForm}
            onUpdateRecord={updateModuleRecord}
            onDeleteRecord={deleteModuleRecord}
            onDuplicateRecord={duplicateModuleRecord}
            onConvertRecord={convertModuleRecord}
            onConvertCrmLeadToClient={convertCrmLeadToClient}
            onConvertCrmLeadToJob={convertCrmLeadToJob}
            onConvertTicketToJob={convertTicketToJob}
            onOpenJob={openJob}
          />
        )}
      </main>

      {sidebarOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      {showCreateJob && (
        <CreateJobModal
          onClose={() => setShowCreateJob(false)}
          onSubmit={addJob}
          activeCompany={activeCompany === 'all' ? 'roofing' : activeCompany}
        />
      )}

      {activeModuleForm && (
        <ModuleRecordModal
          moduleId={activeModuleForm}
          jobs={jobs}
          onClose={() => setActiveModuleForm(null)}
          onSubmit={(payload) => addModuleRecord(activeModuleForm, payload)}
        />
      )}
    </div>
  );
}

function CommandCenter({ jobs, metrics, onCreateJob, onCreateRecord, onOpenJob, onOpenTaskManagement }) {
  const urgentJobs = jobs.filter((job) => job.priority === 'urgent' || taskStats(job.id).overdue > 0);
  const recentClients = clients.slice(0, 4);

  return (
    <section className="workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Command Center</div>
          <h1>Company-wide operating picture</h1>
        </div>
        <div className="heading-actions">
          <button className="secondary-button" onClick={onOpenTaskManagement}>
            <KanbanSquare size={17} />
            Open TaskManagement
          </button>
          <button className="primary-button" onClick={onCreateJob}>
            <Plus size={17} />
            Create Job
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <Metric label="Active jobs" value={metrics.activeJobs} icon={BriefcaseBusiness} tone="orange" />
        <Metric label="Overdue tasks" value={metrics.overdueTasks} icon={AlertTriangle} tone="red" />
        <Metric label="Open tickets" value={metrics.openTickets} icon={Ticket} tone="blue" />
        <Metric label="Outstanding AR" value={money(metrics.outstandingInvoices)} icon={Receipt} tone="green" />
        <Metric label="Tracked hours" value={`${metrics.timeTracked.toFixed(1)}h`} icon={Clock3} tone="teal" />
      </div>

      <div className="command-layout">
        <section className="panel wide-panel">
          <div className="panel-header">
            <div>
              <h2>My Work Summary</h2>
              <p>Jobs that need attention before work moves back into TaskManagement.</p>
            </div>
            <Bell size={18} />
          </div>
          <div className="attention-list">
            {urgentJobs.length === 0 ? (
              <EmptyState title="No urgent job blockers" text="The current filter has no urgent jobs or overdue related tasks." />
            ) : urgentJobs.map((job) => (
              <JobAttentionRow key={job.id} job={job} onOpenJob={onOpenJob} />
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Start common workflows without leaving HQ.</p>
            </div>
            <Sparkles size={18} />
          </div>
          <div className="quick-grid">
            <QuickAction icon={Plus} label="Create Job" onClick={onCreateJob} />
            <QuickAction icon={Users} label="Create Lead" onClick={() => onCreateRecord('crm')} />
            <QuickAction icon={ClipboardList} label="Create Form" onClick={() => onCreateRecord('forms')} />
            <QuickAction icon={Ticket} label="Create Ticket" onClick={() => onCreateRecord('tickets')} />
            <QuickAction icon={KanbanSquare} label="Open TaskManagement" onClick={onOpenTaskManagement} />
            <QuickAction icon={Upload} label="Upload File" onClick={() => onCreateRecord('files')} />
          </div>
        </section>
      </div>

      <div className="three-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent Jobs</h2>
              <p>Filtered by the current company switcher.</p>
            </div>
            <BriefcaseBusiness size={18} />
          </div>
          <div className="compact-list">
            {jobs.slice(0, 5).map((job) => (
              <button className="compact-row" key={job.id} onClick={() => onOpenJob(job.id)}>
                <span>
                  <strong>{job.name}</strong>
                  <small>{getClient(job.clientId)?.name}</small>
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent Clients</h2>
              <p>Client records are separate from jobs.</p>
            </div>
            <Building2 size={18} />
          </div>
          <div className="compact-list">
            {recentClients.map((client) => (
              <div className="compact-row static" key={client.id}>
                <span>
                  <strong>{client.name}</strong>
                  <small>{client.contact} - {getCompany(client.company).short}</small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Activity Feed</h2>
              <p>Cross-module timeline events.</p>
            </div>
            <Gauge size={18} />
          </div>
          <div className="timeline">
            {activity.map((item) => (
              <div className="timeline-item" key={item.id}>
                <span className="timeline-dot" />
                <div>
                  <strong>{item.text}</strong>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function JobsView({ jobs, selectedJob, onOpenJob, onCreateJob }) {
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortMode, setSortMode] = useState('priority');

  const displayedJobs = useMemo(() => {
    return jobs
      .filter((job) => stageFilter === 'all' || job.stage === stageFilter)
      .filter((job) => ownerFilter === 'all' || job.owner === ownerFilter)
      .filter((job) => clientFilter === 'all' || job.clientId === clientFilter)
      .filter((job) => {
        if (dateFilter === 'all') return true;
        const days = daysUntil(job.endDate);
        if (dateFilter === 'overdue') return days < 0;
        if (dateFilter === 'week') return days >= 0 && days <= 7;
        if (dateFilter === 'future') return days > 7;
        return true;
      })
      .sort((a, b) => {
        if (sortMode === 'endDate') return daysUntil(a.endDate) - daysUntil(b.endDate);
        if (sortMode === 'stage') return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
        if (sortMode === 'client') return (getClient(a.clientId)?.name || '').localeCompare(getClient(b.clientId)?.name || '');
        return priorityWeight[b.priority] - priorityWeight[a.priority] || daysUntil(a.endDate) - daysUntil(b.endDate);
      });
  }, [clientFilter, dateFilter, jobs, ownerFilter, sortMode, stageFilter]);

  return (
    <section className="workspace jobs-workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Jobs</div>
          <h1>Job Center</h1>
        </div>
        <div className="heading-actions">
          <button className="secondary-button" onClick={() => {
            setStageFilter('all');
            setOwnerFilter('all');
            setClientFilter('all');
            setDateFilter('all');
            setSortMode('priority');
          }}>
            <Filter size={17} />
            Reset
          </button>
          <button className="primary-button" onClick={onCreateJob}>
            <Plus size={17} />
            Create Job
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <label>
          Stage
          <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
            <option value="all">All stages</option>
            {stageOrder.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
          </select>
        </label>
        <label>
          Owner
          <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            <option value="all">All owners</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </label>
        <label>
          Client
          <select value={clientFilter} onChange={(event) => setClientFilter(event.target.value)}>
            <option value="all">All clients</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </select>
        </label>
        <label>
          Date
          <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
            <option value="all">All dates</option>
            <option value="overdue">Overdue</option>
            <option value="week">Due this week</option>
            <option value="future">Future</option>
          </select>
        </label>
        <label>
          Sort
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="priority">Priority</option>
            <option value="endDate">End date</option>
            <option value="stage">Stage</option>
            <option value="client">Client</option>
          </select>
        </label>
      </div>

      <div className="jobs-layout">
        <section className="panel job-list-panel">
          <div className="panel-header">
            <div>
              <h2>All Jobs</h2>
              <p>{displayedJobs.length} jobs match the current filters.</p>
            </div>
          </div>
          <div className="job-list">
            {displayedJobs.map((job) => (
              <JobListItem key={job.id} job={job} selected={selectedJob?.id === job.id} onClick={() => onOpenJob(job.id)} />
            ))}
            {displayedJobs.length === 0 && <EmptyState title="No matching jobs" text="Adjust the stage, owner, client, date, or company filters." />}
          </div>
        </section>

        <JobProfile job={selectedJob} />
      </div>
    </section>
  );
}

function JobProfile({ job }) {
  const [copied, setCopied] = useState(false);

  if (!job) {
    return (
      <section className="panel job-profile">
        <EmptyState title="No job selected" text="Create a job or clear filters to view a profile." />
      </section>
    );
  }

  const client = getClient(job.clientId);
  const company = getCompany(job.company);
  const owner = getPerson(job.owner);
  const stats = taskStats(job.id);
  const completion = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleCopy = async () => {
    try {
      await copyText(job.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="panel job-profile">
      <div className="profile-header">
        <div>
          <div className="company-badge" style={{ '--company-color': company.color }}>{company.name}</div>
          <h2>{job.name}</h2>
          <p>{job.scope}</p>
        </div>
        <StageBadge stage={job.stage} />
      </div>

      <div className="profile-actions">
        <a className="primary-button" href={taskManagementUrl(job.id)} target="_blank" rel="noreferrer">
          <KanbanSquare size={17} />
          Open in TaskManagement
          <ArrowUpRight size={15} />
        </a>
        <button className="secondary-button" onClick={handleCopy}>
          <ClipboardList size={17} />
          {copied ? 'Copied project_id' : 'Copy project_id'}
        </button>
      </div>

      <div className="profile-grid">
        <InfoBlock label="Client" value={client?.name || 'Unassigned'} sub={job.contact || client?.contact} />
        <InfoBlock label="Site / Property" value={job.siteAddress} sub={job.type} />
        <InfoBlock label="Owner" value={owner?.name || 'Unassigned'} sub={owner?.role} />
        <InfoBlock label="Schedule" value={`${job.startDate} to ${job.endDate}`} sub={duePhrase(job.endDate)} />
      </div>

      <div className="stat-strip">
        <InlineStat label="Tasks" value={stats.total} />
        <InlineStat label="Completed" value={stats.completed} />
        <InlineStat label="Overdue" value={stats.overdue} danger={stats.overdue > 0} />
        <InlineStat label="Time" value={`${stats.hours.toFixed(1)}h`} />
        <InlineStat label="Files" value={job.fileCount} />
        <InlineStat label="Forms" value={job.formCount} />
      </div>

      <div className="progress-row">
        <div>
          <strong>Related Task Progress</strong>
          <small>Computed from TaskManagement tasks where <code>task.project_id = {job.id}</code></small>
        </div>
        <span>{completion}%</span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${completion}%` }} />
      </div>

      <div className="profile-sections">
        <section>
          <h3>Related Tasks</h3>
          <div className="task-list">
            {stats.tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
            {stats.tasks.length === 0 && <EmptyState title="No linked tasks" text="Tasks will appear here when TaskManagement saves this job id as project_id." />}
          </div>
        </section>

        <section>
          <h3>Finance Snapshot</h3>
          <div className="finance-grid">
            <InfoBlock label="Estimate" value={money(job.estimateTotal)} />
            <InfoBlock label="Invoiced" value={money(job.invoiceTotal)} />
            <InfoBlock label="Remaining" value={money(Math.max(0, job.estimateTotal - job.invoiceTotal))} />
          </div>
        </section>

        <section>
          <h3>Notes</h3>
          <p className="notes">{job.notes || 'No notes yet.'}</p>
        </section>

        <section>
          <h3>Activity Timeline</h3>
          <div className="timeline">
            {activity.filter((item) => item.jobId === job.id).map((item) => (
              <div className="timeline-item" key={item.id}>
                <div className="timeline-dot" />
                <span>
                  <strong>{item.text}</strong>
                  <small>{item.time}</small>
                </span>
              </div>
            ))}
            {activity.filter((item) => item.jobId === job.id).length === 0 && (
              <p className="notes">No activity yet.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function ModuleView({
  id,
  jobs,
  moduleRecords,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
  onDuplicateRecord,
  onConvertRecord,
  onConvertCrmLeadToClient,
  onConvertCrmLeadToJob,
  onConvertTicketToJob,
  onOpenJob
}) {
  const roadmap = moduleRoadmap.find((module) => module.id === id) || moduleRoadmap.find((module) => module.id === id.replace('knowledge', 'kb'));
  const config = moduleConfigs[id];
  const [selectedRecordId, setSelectedRecordId] = useState(moduleRecords[0]?.id || null);
  const selectedRecord = moduleRecords.find((record) => record.id === selectedRecordId) || moduleRecords[0] || null;

  if (id === 'task-management') {
    return (
      <section className="workspace">
        <div className="page-heading">
          <div>
            <div className="eyebrow">Work Execution</div>
            <h1>TaskManagement Integration</h1>
          </div>
        </div>
        <div className="module-grid">
          <section className="panel wide-panel">
            <div className="panel-header">
              <div>
                <h2>Job to task relationship</h2>
                <p>Quest HQ does not duplicate task execution. It reads and links task records through the existing project relationship.</p>
              </div>
              <ShieldCheck size={18} />
            </div>
            <div className="integration-rule">
              <code>job.id</code>
              <ChevronRight size={20} />
              <code>task.project_id</code>
            </div>
            <div className="compact-list">
              {jobs.map((job) => (
                <button className="compact-row" key={job.id} onClick={() => onOpenJob(job.id)}>
                  <span>
                    <strong>{job.name}</strong>
                    <small>{taskStats(job.id).total} related tasks - {taskStats(job.id).hours.toFixed(1)} tracked hours</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Handoff URL</h2>
                <p>Set <code>VITE_TASK_MANAGEMENT_URL</code> when deploying next to the existing app.</p>
              </div>
            </div>
            <div className="code-card">/TaskManagementQuest/app.html?project_id=&lt;job.id&gt;</div>
          </section>
        </div>
      </section>
    );
  }

  if (!config) {
    return (
      <section className="workspace">
        <div className="page-heading">
          <div>
            <div className="eyebrow">{roadmap?.status === 'active' ? 'Active Module' : 'Ready Module'}</div>
            <h1>{navigation.find((item) => item.id === id)?.label || roadmap?.label}</h1>
          </div>
        </div>
        <EmptyState title="Module not configured" text="This module is registered in navigation but does not have a workspace configuration yet." />
      </section>
    );
  }

  const Icon = config.icon;

  return (
    <section className="workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{config.eyebrow}</div>
          <h1>{config.title}</h1>
          <p className="page-summary">{config.summary}</p>
        </div>
        <button className="primary-button" onClick={() => onCreateRecord(id)}>
          <Plus size={17} />
          {config.primaryAction}
        </button>
      </div>

      <div className="module-stat-grid">
        {config.stats.map((stat) => (
          <ModuleStat key={stat.label} label={stat.label} value={stat.value} icon={Icon} />
        ))}
      </div>

      <div className="module-grid">
        <section className="panel wide-panel">
          <div className="panel-header">
            <div>
              <h2>Records</h2>
              <p>{roadmap?.detail || config.summary}</p>
            </div>
            <Icon size={18} />
          </div>

          <div className="record-table">
            <div className="record-row record-row-head">
              <span>Name</span>
              <span>Status</span>
              <span>Related Job</span>
              <span>Updated</span>
            </div>
            {moduleRecords.map((record) => (
              <button
                className={`record-row ${selectedRecord?.id === record.id ? 'selected' : ''}`}
                key={record.id}
                onClick={() => setSelectedRecordId(record.id)}
              >
                <span>
                  <strong>{record.title}</strong>
                  <small>{record.notes || 'No notes yet'}</small>
                </span>
                <span>{record.status}</span>
                <span>{record.jobId ? getJobName(jobs, record.jobId) : 'No job linked'}</span>
                <span>{record.updatedAt ? new Date(record.updatedAt).toLocaleDateString('en-US') : new Date(record.createdAt || Date.now()).toLocaleDateString('en-US')}</span>
              </button>
            ))}
            {moduleRecords.length === 0 && <EmptyState title="No records yet" text={`Use ${config.primaryAction} to create the first record in this module.`} />}
          </div>
        </section>

        <section className="panel">
          <ModuleRecordDetail
            moduleId={id}
            config={config}
            record={selectedRecord}
            jobs={jobs}
            onUpdate={(recordId, patch) => onUpdateRecord(id, recordId, patch)}
            onDelete={(recordId) => onDeleteRecord(id, recordId)}
            onDuplicate={(recordId) => onDuplicateRecord(id, recordId)}
            onConvert={(recordId) => onConvertRecord(id, recordId)}
            onConvertCrmLeadToClient={onConvertCrmLeadToClient}
            onConvertCrmLeadToJob={onConvertCrmLeadToJob}
            onConvertTicketToJob={onConvertTicketToJob}
            onOpenJob={onOpenJob}
          />
        </section>
      </div>

      <ModuleWorkspaceDetail id={id} records={moduleRecords} jobs={jobs} onOpenJob={onOpenJob} />

      <section className="panel module-workflow-panel">
        <div className="panel-header">
          <div>
            <h2>Workflow Board</h2>
            <p>Checklist coverage for statuses, templates, conversions, and module-specific work stages.</p>
          </div>
          <Layers3 size={18} />
        </div>
        <div className="workflow-board">
          {config.lanes.map((lane) => (
            <div className="workflow-lane" key={lane.title}>
              <div className="workflow-lane-title">{lane.title}</div>
              {lane.items.map((item) => (
                <div className="workflow-card" key={item}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="module-grid module-grid-secondary">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Connection Rules</h2>
              <p>This keeps the module separate from TaskManagement while still tying work back to jobs.</p>
            </div>
            <ShieldCheck size={18} />
          </div>
          <div className="check-list">
            <span><CheckCircle2 size={16} /> Attach records to a job id or client id</span>
            <span><CheckCircle2 size={16} /> Convert only approved records into TaskManagement tasks</span>
            <span><CheckCircle2 size={16} /> Emit activity events to the job timeline</span>
            <span><CheckCircle2 size={16} /> Preserve TaskManagement as the work execution layer</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Related Jobs</h2>
              <p>Records in this module can attach to these active job containers.</p>
            </div>
          </div>
          <div className="compact-list">
            {jobs.slice(0, 3).map((job) => (
              <button className="compact-row" key={job.id} onClick={() => onOpenJob(job.id)}>
                <span>
                  <strong>{job.name}</strong>
                  <small>{getClient(job.clientId)?.name} - {job.stage}</small>
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function ModuleWorkspaceDetail({ id, records, jobs, onOpenJob }) {
  const sections = moduleWorkspaceConfigs[id] || [];
  const linkedJobs = records
    .filter((record) => record.jobId)
    .map((record) => jobs.find((job) => job.id === record.jobId))
    .filter(Boolean);
  const uniqueJobs = Array.from(new Map(linkedJobs.map((job) => [job.id, job])).values());

  if (!sections.length) return null;

  return (
    <div className="module-special-grid">
      {sections.map((section) => (
        <section className="panel module-special-panel" key={section.title}>
          <div className="panel-header">
            <div>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>
          </div>
          <div className="feature-list">
            {section.items.map(([label, meta]) => (
              <div className="feature-line" key={label}>
                <CheckCircle2 size={16} />
                <span>
                  <strong>{label}</strong>
                  <small>{meta}</small>
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="panel module-special-panel module-live-panel">
        <div className="panel-header">
          <div>
            <h2>Live Links</h2>
            <p>Current records connected to jobs in this module.</p>
          </div>
          <ArrowUpRight size={18} />
        </div>
        <div className="compact-list">
          {uniqueJobs.slice(0, 4).map((job) => (
            <button className="compact-row" key={job.id} onClick={() => onOpenJob(job.id)}>
              <span>
                <strong>{job.name}</strong>
                <small>{getClient(job.clientId)?.name} - {job.stage}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
          {!uniqueJobs.length && (
            <div className="feature-line muted-feature">
              <AlertTriangle size={16} />
              <span>
                <strong>No linked jobs yet</strong>
                <small>Create or edit a record and attach it to a job.</small>
              </span>
            </div>
          )}
        </div>
      </section>

      {id === 'crm' && <CrmDirectory records={records} jobs={jobs} />}
    </div>
  );
}

function CrmDirectory({ records, jobs }) {
  const leadRecords = records.filter((record) => (record.structured?.recordType || 'Lead') === 'Lead');
  const contactRows = clients.map((client) => ({
    id: client.id,
    name: client.contact,
    meta: `${client.email} - ${client.phone} - ${client.name}`
  }));

  return (
    <section className="panel module-special-panel crm-directory-panel">
      <div className="panel-header">
        <div>
          <h2>CRM Directory</h2>
          <p>Lead, client, and contact lists stay visible beside the active CRM record.</p>
        </div>
      </div>
      <div className="crm-directory-grid">
        <div>
          <h3>Lead List</h3>
          <div className="mini-list">
            {leadRecords.map((record) => (
              <span key={record.id}>
                <strong>{record.title}</strong>
                <small>{record.structured?.leadSource || 'No source'} - {record.status}</small>
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3>Client List</h3>
          <div className="mini-list">
            {clients.map((client) => (
              <span key={client.id}>
                <strong>{client.name}</strong>
                <small>{getCompany(client.company).name} - {jobs.filter((job) => job.clientId === client.id).length} jobs</small>
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3>Contact List</h3>
          <div className="mini-list">
            {contactRows.map((contact) => (
              <span key={contact.id}>
                <strong>{contact.name}</strong>
                <small>{contact.meta}</small>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function getJobName(jobs, jobId) {
  return jobs.find((job) => job.id === jobId)?.name || jobId;
}

function conversionLabel(moduleId) {
  const labels = {
    crm: 'Converted lead to job/client',
    forms: 'Converted response to downstream record',
    tickets: 'Converted ticket to TaskManagement task',
    files: 'Attached file to selected record',
    finance: 'Converted estimate to invoice',
    knowledge: 'Attached SOP to job/task',
    automations: 'Automation run logged',
    dashboards: 'Dashboard view pinned',
    templates: 'Template applied to job setup',
    admin: 'Admin setting applied'
  };
  return labels[moduleId] || 'Conversion completed';
}

function moduleExtraLabel(moduleId) {
  const labels = {
    crm: 'Lead source / value',
    forms: 'Question summary',
    tickets: 'Ticket summary',
    files: 'File category / tags',
    finance: 'Line items / amount',
    knowledge: 'Category',
    automations: 'Trigger / action',
    dashboards: 'Widgets',
    templates: 'Template type / contents',
    admin: 'Role / permission'
  };
  return labels[moduleId] || 'Module detail';
}

function extraPlaceholder(moduleId) {
  const placeholders = {
    crm: 'Referral - $8,400',
    forms: 'Short text, rating, file upload, signature',
    tickets: 'Client request, repair request, IT issue',
    files: 'Job photos - final, repair, permit',
    finance: 'Materials, labor, tax - $8,400',
    knowledge: 'Roofing procedures',
    automations: 'New job created -> create task',
    dashboards: 'Active jobs, AR, survey score',
    templates: 'Roof repair job - tasks, form, estimate',
    admin: 'Supervisor - Roofing access'
  };
  return placeholders[moduleId] || 'Details';
}

function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return 'Unknown size';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} MB`;
  if (value >= 1000) return `${Math.round(value / 1000)} KB`;
  return `${value} B`;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getModuleStructuredDefaults(moduleId) {
  const defaults = moduleStructuredDefaults[moduleId] || {};
  return JSON.parse(JSON.stringify(defaults));
}

function ModuleRecordDetail({
  moduleId,
  config,
  record,
  jobs,
  onUpdate,
  onDelete,
  onDuplicate,
  onConvert,
  onConvertCrmLeadToClient,
  onConvertCrmLeadToJob,
  onConvertTicketToJob,
  onOpenJob
}) {
  if (!record) {
    return <EmptyState title="No record selected" text={`Create or select a ${config.eyebrow.toLowerCase()} record to manage it.`} />;
  }

  const relatedJob = record.jobId ? jobs.find((job) => job.id === record.jobId) : null;

  return (
    <div className="record-detail">
      <div className="panel-header">
        <div>
          <h2>{record.title}</h2>
          <p>{config.sideTitle}</p>
        </div>
      </div>

      <div className="record-detail-grid">
        <label>
          Status
          <select value={record.status} onChange={(event) => onUpdate(record.id, { status: event.target.value })}>
            <option>New</option>
            <option>Draft</option>
            <option>Saved</option>
            <option>Tagged</option>
            <option>Published</option>
            <option>Review</option>
            <option>Qualified</option>
            <option>Triaged</option>
            <option>Urgent</option>
            <option>In review</option>
            <option>Approved</option>
            <option>Sent</option>
            <option>Paid</option>
            <option>Enabled</option>
            <option>Paused</option>
            <option>Pinned</option>
            <option>Pending approval</option>
            <option>Applied</option>
            <option>Converted</option>
            <option>Archived</option>
          </select>
        </label>

        <label>
          Related job
          <select value={record.jobId || ''} onChange={(event) => onUpdate(record.id, { jobId: event.target.value })}>
            <option value="">No job linked</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.name}</option>)}
          </select>
        </label>

        <label className="span-2">
          Notes
          <textarea value={record.notes || ''} onChange={(event) => onUpdate(record.id, { notes: event.target.value })} />
        </label>
        <label className="span-2">
          {moduleExtraLabel(moduleId)}
          <input value={record.extra || ''} onChange={(event) => onUpdate(record.id, { extra: event.target.value })} placeholder={extraPlaceholder(moduleId)} />
        </label>

        {moduleId === 'files' && (
          <>
            <label>
              File category
              <select
                value={record.structured?.category || 'Job photos'}
                onChange={(event) => onUpdate(record.id, { structured: { ...(record.structured || {}), category: event.target.value } })}
              >
                <option>Job photos</option>
                <option>Client documents</option>
                <option>Permits</option>
                <option>Contracts</option>
                <option>Estimates</option>
                <option>Invoices</option>
                <option>Drawings</option>
                <option>Drafting files</option>
                <option>Marketing assets</option>
                <option>Internal documents</option>
              </select>
            </label>
            <label>
              Attach file to
              <select
                value={record.structured?.attachmentTarget || 'Job'}
                onChange={(event) => onUpdate(record.id, { structured: { ...(record.structured || {}), attachmentTarget: event.target.value } })}
              >
                <option>Job</option>
                <option>Client</option>
                <option>Task</option>
                <option>Ticket</option>
                <option>Form response</option>
              </select>
            </label>
            <label className="span-2">
              File tags
              <input
                value={record.structured?.tags || ''}
                onChange={(event) => onUpdate(record.id, { structured: { ...(record.structured || {}), tags: event.target.value } })}
                placeholder="final, permit, repair, client"
              />
            </label>
          </>
        )}
      </div>

      {moduleId === 'crm' && (
        <CrmRecordPanel
          record={record}
          jobs={jobs}
          onUpdate={onUpdate}
          onConvertLeadToClient={onConvertCrmLeadToClient}
          onConvertLeadToJob={onConvertCrmLeadToJob}
        />
      )}

      {moduleId === 'forms' && (
        <FormRecordPanel
          record={record}
          jobs={jobs}
          onUpdate={onUpdate}
          onDuplicate={onDuplicate}
        />
      )}

      {moduleId === 'tickets' && (
        <TicketRecordPanel
          record={record}
          jobs={jobs}
          onUpdate={onUpdate}
          onConvertTicketToJob={onConvertTicketToJob}
        />
      )}

      {moduleId === 'files' && <FileRecordPanel record={record} />}

      {moduleId === 'finance' && <FinanceRecordPanel record={record} jobs={jobs} onUpdate={onUpdate} />}
      {moduleId === 'knowledge' && <KnowledgeRecordPanel record={record} onUpdate={onUpdate} />}
      {moduleId === 'automations' && <AutomationRecordPanel record={record} onUpdate={onUpdate} />}
      {moduleId === 'dashboards' && <DashboardRecordPanel record={record} jobs={jobs} onUpdate={onUpdate} />}
      {moduleId === 'templates' && <TemplateRecordPanel record={record} onUpdate={onUpdate} />}
      {moduleId === 'admin' && <AdminRecordPanel record={record} onUpdate={onUpdate} />}

      <div className="record-detail-meta">
        <InfoBlock label="Module" value={config.eyebrow} />
        <InfoBlock label="Related job" value={relatedJob?.name || 'None'} sub={relatedJob ? getClient(relatedJob.clientId)?.name : null} />
        <InfoBlock label="Conversion" value={record.convertedTo || 'Not converted'} sub={record.conversionNote} />
      </div>

      <div className="record-actions">
        {relatedJob && (
          <button className="secondary-button" onClick={() => onOpenJob(relatedJob.id)}>
            <BriefcaseBusiness size={17} />
            Open Job
          </button>
        )}
        {moduleId === 'tickets' && relatedJob && (
          <a className="secondary-button" href={taskManagementUrl(relatedJob.id)} target="_blank" rel="noreferrer">
            <KanbanSquare size={17} />
            Open Tasks
          </a>
        )}
        <button className="primary-button" onClick={() => onConvert(record.id)}>
          <Workflow size={17} />
          {conversionLabel(moduleId)}
        </button>
        <button className="secondary-button danger-action" onClick={() => onDelete(record.id)}>
          <X size={17} />
          Delete
        </button>
      </div>
    </div>
  );
}

function FormRecordPanel({ record, jobs, onUpdate, onDuplicate }) {
  const details = record.structured || {};
  const [responseSearch, setResponseSearch] = useState(details.responseSearch || '');
  const [responseFilter, setResponseFilter] = useState(details.responseFilter || 'All');
  const responses = details.responses || [];
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };
  const selectedQuestionTypes = details.questionTypes || [];
  const filteredResponses = responses.filter((response) => {
    const matchesText = !responseSearch.trim() || [response.title, response.type, response.status]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(responseSearch.trim().toLowerCase()));
    const matchesFilter = responseFilter === 'All' || response.status === responseFilter || response.type === responseFilter;
    return matchesText && matchesFilter;
  });
  const checklistItems = (details.checklistItems || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const toggleQuestionType = (type) => {
    const nextTypes = selectedQuestionTypes.includes(type)
      ? selectedQuestionTypes.filter((item) => item !== type)
      : [...selectedQuestionTypes, type];
    updateDetails('questionTypes', nextTypes);
    onUpdate(record.id, { extra: nextTypes.join(', '), structured: { ...details, questionTypes: nextTypes } });
  };

  const convertResponse = (target) => {
    onUpdate(record.id, {
      status: 'Converted',
      convertedTo: `Converted response to ${target}`,
      conversionNote: `${record.title} response conversion recorded ${new Date().toLocaleDateString('en-US')}.`
    });
  };

  return (
    <div className="form-builder-card">
      <div className="panel-header">
        <div>
          <h3>Form Builder</h3>
          <p>Create, edit, duplicate, publish, and review forms without duplicating TaskManagement execution.</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => onDuplicate(record.id)}>
          <Layers3 size={17} />
          Duplicate Form
        </button>
      </div>

      <div className="record-detail-grid">
        <label className="span-2">
          Form description
          <textarea value={details.description || ''} onChange={(event) => updateDetails('description', event.target.value)} placeholder="What this form collects and when the team should use it" />
        </label>
        <label>
          Visibility
          <select value={details.visibility || 'Internal only'} onChange={(event) => updateDetails('visibility', event.target.value)}>
            <option>Public link</option>
            <option>Internal only</option>
          </select>
        </label>
        <label>
          Public form link
          <input value={details.publicLink || ''} onChange={(event) => updateDetails('publicLink', event.target.value)} placeholder="https://quest-hq.local/forms/form-name" />
        </label>
        <label>
          Internal-only form
          <select value={details.internalOnly ? 'Yes' : 'No'} onChange={(event) => updateDetails('internalOnly', event.target.value === 'Yes')}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>
        <label>
          Attach response to client
          <select value={details.attachedClientId || ''} onChange={(event) => updateDetails('attachedClientId', event.target.value)}>
            <option value="">No client linked</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </select>
        </label>
      </div>

      <div>
        <h3>Question Types</h3>
        <div className="question-type-grid">
          {formQuestionTypes.map((type) => (
            <label className="check-toggle" key={type}>
              <input type="checkbox" checked={selectedQuestionTypes.includes(type)} onChange={() => toggleQuestionType(type)} />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-analytics-grid">
        <InfoBlock label="Survey type" value={details.surveyType || 'Form'} sub={details.visibility || 'Internal only'} />
        <InfoBlock label="Average rating" value={details.averageRating || '0'} sub="Survey analytics" />
        <InfoBlock label="Response count" value={details.responseCount || responses.length} sub="Submitted responses" />
      </div>

      <div className="response-toolbar">
        <label>
          Search responses
          <input value={responseSearch} onChange={(event) => setResponseSearch(event.target.value)} placeholder="Search response title, status, or type" />
        </label>
        <label>
          Filter responses
          <select value={responseFilter} onChange={(event) => setResponseFilter(event.target.value)}>
            <option>All</option>
            <option>Needs review</option>
            <option>Attached</option>
            <option>Approved</option>
            <option>Inspection form</option>
            <option>Customer satisfaction survey</option>
            <option>Employee feedback survey</option>
            <option>Job completion survey</option>
            <option>Client approval form</option>
            <option>Internal request form</option>
          </select>
        </label>
      </div>

      <div className="mini-list">
        {filteredResponses.map((response) => (
          <span key={response.id}>
            <strong>{response.title}</strong>
            <small>{response.type} - {response.status} - Rating {response.rating}</small>
          </span>
        ))}
        {!filteredResponses.length && (
          <span>
            <strong>No matching responses</strong>
            <small>Adjust search or filters to view submitted responses.</small>
          </span>
        )}
      </div>

      <div>
        <h3>Inspection Checklists</h3>
        <div className="check-list">
          {checklistItems.map((item) => (
            <span key={item}><CheckCircle2 size={16} /> {item}</span>
          ))}
        </div>
      </div>

      <div className="record-actions">
        <button type="button" className="secondary-button" onClick={() => convertResponse('lead')}>Convert Response to Lead</button>
        <button type="button" className="secondary-button" onClick={() => convertResponse('job')}>Convert Response to Job</button>
        <button type="button" className="secondary-button" onClick={() => convertResponse('task')}>Convert Response to Task</button>
        <button type="button" className="secondary-button" onClick={() => convertResponse('ticket')}>Convert Response to Ticket</button>
      </div>
    </div>
  );
}

function TicketRecordPanel({ record, jobs, onUpdate, onConvertTicketToJob }) {
  const details = record.structured || {};
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };
  const relatedClient = details.relatedClientId ? getClient(details.relatedClientId) : null;
  const assigned = details.assignedPerson ? getPerson(details.assignedPerson) : null;
  const relatedJob = record.jobId ? jobs.find((job) => job.id === record.jobId) : null;
  const attachedFiles = details.attachedFiles || [];

  const attachFile = (file) => {
    if (!file) return;
    updateDetails('attachedFiles', [...attachedFiles, file.name]);
  };

  const convertToTask = () => {
    onUpdate(record.id, {
      status: 'Converted',
      convertedTo: 'Converted ticket to TaskManagement task',
      conversionNote: `Task handoff recorded ${new Date().toLocaleDateString('en-US')}.`,
      structured: {
        ...details,
        taskProjectId: record.jobId || details.convertedJobId || '',
        taskHandoffUrl: record.jobId ? taskManagementUrl(record.jobId) : ''
      }
    });
  };

  return (
    <div className="ticket-panel">
      <div className="panel-header">
        <div>
          <h3>Ticket Triage</h3>
          <p>Classify the request, assign an owner, attach files, and convert approved work to a job or TaskManagement task.</p>
        </div>
      </div>

      <div className="record-detail-grid">
        <label>
          Ticket type
          <select value={details.type || 'Client request'} onChange={(event) => updateDetails('type', event.target.value)}>
            {ticketTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label>
          Ticket priority
          <select value={details.priority || 'medium'} onChange={(event) => updateDetails('priority', event.target.value)}>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label>
          Requester
          <input value={details.requester || ''} onChange={(event) => updateDetails('requester', event.target.value)} placeholder="Client or team member" />
        </label>
        <label>
          Assigned person
          <select value={details.assignedPerson || ''} onChange={(event) => updateDetails('assignedPerson', event.target.value)}>
            <option value="">Unassigned</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name} - {person.role}</option>)}
          </select>
        </label>
        <label>
          Related client
          <select value={details.relatedClientId || ''} onChange={(event) => updateDetails('relatedClientId', event.target.value)}>
            <option value="">No client linked</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </select>
        </label>
        <label>
          SLA / due date
          <input type="date" value={details.dueDate || ''} onChange={(event) => updateDetails('dueDate', event.target.value)} />
        </label>
        <label className="span-2">
          Internal notes
          <textarea value={details.internalNotes || ''} onChange={(event) => updateDetails('internalNotes', event.target.value)} placeholder="Internal context, decision notes, escalation, or handoff instructions" />
        </label>
        <label className="span-2">
          Attach files
          <input type="file" multiple onChange={(event) => Array.from(event.target.files || []).forEach(attachFile)} />
        </label>
      </div>

      <div className="ticket-summary-grid">
        <InfoBlock label="Requester" value={details.requester || 'Unknown'} sub={relatedClient?.name || 'No client linked'} />
        <InfoBlock label="Assigned person" value={assigned?.name || 'Unassigned'} sub={assigned?.role || 'Needs owner'} />
        <InfoBlock label="Related job" value={relatedJob?.name || 'No job linked'} sub={relatedJob ? relatedJob.stage : 'Can convert ticket to job'} />
        <InfoBlock label="Attached files" value={attachedFiles.length} sub={attachedFiles.slice(0, 2).join(' - ') || 'No files attached'} />
      </div>

      <div>
        <h3>Ticket Types</h3>
        <div className="ticket-type-grid">
          {ticketTypes.map((type) => (
            <span className={details.type === type ? 'selected' : ''} key={type}>{type}</span>
          ))}
        </div>
      </div>

      {details.taskHandoffUrl && (
        <div className="code-card">{details.taskHandoffUrl}</div>
      )}

      <div className="record-actions">
        <button type="button" className="secondary-button" onClick={convertToTask}>
          <KanbanSquare size={17} />
          Convert Ticket to Task
        </button>
        <button type="button" className="primary-button" onClick={() => onConvertTicketToJob?.(record.id)}>
          <BriefcaseBusiness size={17} />
          Convert Ticket to Job
        </button>
      </div>
    </div>
  );
}

function LocalModuleCompletionPanel({ moduleId, record, onUpdate }) {
  const panel = localModulePanels[moduleId];
  const details = record.structured || {};
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };
  const applyAction = (label, patch) => {
    onUpdate(record.id, {
      ...patch,
      conversionNote: patch.conversionNote || `${label} recorded locally.`,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="local-module-panel">
      <div className="panel-header">
        <div>
          <h3>{panel.title}</h3>
          <p>{panel.description}</p>
        </div>
      </div>

      <div className="record-detail-grid">
        {panel.fields.map(([field, label, type, options]) => (
          <label className={type === 'textarea' ? 'span-2' : ''} key={field}>
            {label}
            {type === 'select' && (
              <select value={details[field] || options[0]} onChange={(event) => updateDetails(field, event.target.value)}>
                {options.map((option) => <option key={option}>{option}</option>)}
              </select>
            )}
            {type === 'textarea' && (
              <textarea value={details[field] || ''} onChange={(event) => updateDetails(field, event.target.value)} placeholder={label} />
            )}
            {type === 'date' && (
              <input type="date" value={details[field] || today} onChange={(event) => updateDetails(field, event.target.value)} />
            )}
            {type === 'input' && (
              <input value={details[field] || ''} onChange={(event) => updateDetails(field, event.target.value)} placeholder={label} />
            )}
          </label>
        ))}
      </div>

      <div className="local-card-grid">
        {panel.cards.map(([title, text]) => (
          <div className="local-card" key={title}>
            <strong>{title}</strong>
            <small>{text}</small>
          </div>
        ))}
      </div>

      <div className="record-actions">
        {panel.actions.map(([label, patch]) => (
          <button
            className={label.includes('Convert') || label.includes('Run') || label.includes('Apply') ? 'primary-button' : 'secondary-button'}
            key={label}
            type="button"
            onClick={() => applyAction(label, patch)}
          >
            <Workflow size={17} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FinanceRecordPanel({ record, jobs, onUpdate }) {
  const details = { ...moduleStructuredDefaults.finance, ...(record.structured || {}) };
  const relatedJob = record.jobId ? jobs.find((job) => job.id === record.jobId) : null;
  const estimateAmount = safeNumber(details.amount) || safeNumber(relatedJob?.estimateTotal);
  const paidAmount = safeNumber(details.paidAmount) || safeNumber(relatedJob?.invoiceTotal);
  const balance = Math.max(0, estimateAmount - paidAmount);
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };
  const applyFinanceAction = (label, patch) => {
    onUpdate(record.id, {
      ...patch,
      conversionNote: `${label} recorded ${new Date().toLocaleDateString('en-US')}.`,
      structured: { ...details, ...(patch.structured || {}) }
    });
  };

  return (
    <div className="module-system-panel">
      <div className="panel-header">
        <div>
          <h3>Finance System</h3>
          <p>Estimate builder, invoice tracking, payments, AR, and job profitability for the selected finance record.</p>
        </div>
      </div>

      <div className="record-detail-grid">
        <label>
          Estimate number
          <input value={details.estimateNumber || ''} onChange={(event) => updateDetails('estimateNumber', event.target.value)} />
        </label>
        <label>
          Estimate status
          <select value={details.estimateStatus || 'Draft'} onChange={(event) => updateDetails('estimateStatus', event.target.value)}>
            <option>Draft</option>
            <option>Sent</option>
            <option>Approved</option>
            <option>Declined</option>
            <option>Converted</option>
          </select>
        </label>
        <label className="span-2">
          Line items
          <textarea value={details.lineItems || ''} onChange={(event) => updateDetails('lineItems', event.target.value)} placeholder="Labor, materials, permits, cleanup" />
        </label>
        <label>
          Taxes / fees
          <input value={details.taxesFees || ''} onChange={(event) => updateDetails('taxesFees', event.target.value)} />
        </label>
        <label>
          Discounts
          <input value={details.discounts || ''} onChange={(event) => updateDetails('discounts', event.target.value)} />
        </label>
        <label>
          Estimate amount
          <input type="number" min="0" value={details.amount || ''} onChange={(event) => updateDetails('amount', event.target.value)} placeholder={String(relatedJob?.estimateTotal || 0)} />
        </label>
        <label>
          Paid amount
          <input type="number" min="0" value={details.paidAmount || ''} onChange={(event) => updateDetails('paidAmount', event.target.value)} />
        </label>
        <label>
          Invoice number
          <input value={details.invoiceNumber || ''} onChange={(event) => updateDetails('invoiceNumber', event.target.value)} />
        </label>
        <label>
          Invoice status
          <select value={details.invoiceStatus || 'Draft'} onChange={(event) => updateDetails('invoiceStatus', event.target.value)}>
            <option>Draft</option>
            <option>Sent</option>
            <option>Partial</option>
            <option>Paid</option>
            <option>Overdue</option>
          </select>
        </label>
        <label>
          Due date
          <input type="date" value={details.dueDate || today} onChange={(event) => updateDetails('dueDate', event.target.value)} />
        </label>
        <label>
          Payment status
          <select value={details.paymentStatus || 'Unpaid'} onChange={(event) => updateDetails('paymentStatus', event.target.value)}>
            <option>Unpaid</option>
            <option>Partial</option>
            <option>Paid</option>
            <option>Overdue</option>
          </select>
        </label>
        <label className="span-2">
          Payment records
          <textarea value={details.paymentRecords || ''} onChange={(event) => updateDetails('paymentRecords', event.target.value)} placeholder="Deposit paid by ACH, final payment pending" />
        </label>
        <label>
          Revenue by company
          <input value={details.revenueCompany || ''} onChange={(event) => updateDetails('revenueCompany', event.target.value)} />
        </label>
        <label>
          Job profitability
          <input value={details.profitability || ''} onChange={(event) => updateDetails('profitability', event.target.value)} />
        </label>
      </div>

      <div className="system-summary-grid">
        <InfoBlock label="Estimate" value={money(estimateAmount)} sub={details.estimateStatus} />
        <InfoBlock label="Paid" value={money(paidAmount)} sub={details.paymentStatus} />
        <InfoBlock label="AR balance" value={money(balance)} sub={balance > 0 ? `Due ${details.dueDate}` : 'No balance'} />
        <InfoBlock label="Invoice" value={details.invoiceNumber || 'Not created'} sub={details.invoiceStatus} />
      </div>

      <div className="record-actions">
        <button type="button" className="secondary-button" onClick={() => applyFinanceAction('Send estimate', { status: 'Sent', structured: { estimateStatus: 'Sent' } })}>Send Estimate</button>
        <button type="button" className="secondary-button" onClick={() => applyFinanceAction('Approve estimate', { status: 'Approved', structured: { estimateStatus: 'Approved' } })}>Approve Estimate</button>
        <button type="button" className="primary-button" onClick={() => applyFinanceAction('Convert estimate to invoice', { status: 'Converted', convertedTo: 'Converted estimate to invoice', structured: { estimateStatus: 'Converted', invoiceStatus: 'Sent', paymentStatus: balance > 0 ? 'Unpaid' : 'Paid' } })}>Convert to Invoice</button>
        <button type="button" className="secondary-button" onClick={() => applyFinanceAction('Mark paid', { status: 'Paid', structured: { paidAmount: estimateAmount, invoiceStatus: 'Paid', paymentStatus: 'Paid' } })}>Mark Paid</button>
      </div>
    </div>
  );
}

function KnowledgeRecordPanel({ record, onUpdate }) {
  const details = { ...moduleStructuredDefaults.knowledge, ...(record.structured || {}) };
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };
  const publish = () => {
    onUpdate(record.id, {
      status: 'Published',
      conversionNote: `Article published ${new Date().toLocaleDateString('en-US')}.`,
      structured: { ...details, searchTerms: details.searchTerms || `${record.title}, ${details.category}` }
    });
  };
  const attach = () => {
    onUpdate(record.id, {
      convertedTo: `Attached SOP to ${details.attachTarget}`,
      conversionNote: `${record.title} attached to ${details.attachTarget.toLowerCase()} context ${new Date().toLocaleDateString('en-US')}.`
    });
  };

  return (
    <div className="module-system-panel">
      <div className="panel-header">
        <div>
          <h3>Knowledge System</h3>
          <p>Article editor, SOP categorization, search terms, training material, templates, and attachment controls.</p>
        </div>
      </div>

      <div className="record-detail-grid">
        <label>
          Category
          <select value={details.category || 'Company SOPs'} onChange={(event) => updateDetails('category', event.target.value)}>
            <option>Company SOPs</option>
            <option>Roofing procedures</option>
            <option>Drafting guidelines</option>
            <option>Admin guides</option>
            <option>Lumen Marketing processes</option>
            <option>Training</option>
            <option>FAQs</option>
          </select>
        </label>
        <label>
          Review owner
          <select value={details.reviewOwner || ''} onChange={(event) => updateDetails('reviewOwner', event.target.value)}>
            <option value="">No owner</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name} - {person.role}</option>)}
          </select>
        </label>
        <label>
          Review date
          <input type="date" value={details.reviewDate || today} onChange={(event) => updateDetails('reviewDate', event.target.value)} />
        </label>
        <label>
          Attach SOP to
          <select value={details.attachTarget || 'Job'} onChange={(event) => updateDetails('attachTarget', event.target.value)}>
            <option>Job</option>
            <option>Task</option>
            <option>Ticket</option>
            <option>Form</option>
          </select>
        </label>
        <label className="span-2">
          Article body
          <textarea value={details.articleBody || ''} onChange={(event) => updateDetails('articleBody', event.target.value)} placeholder="Steps, standards, examples, links, and ownership notes" />
        </label>
        <label className="span-2">
          Search terms
          <input value={details.searchTerms || ''} onChange={(event) => updateDetails('searchTerms', event.target.value)} placeholder="inspection, tile, QA, invoice, campaign" />
        </label>
        <label className="span-2">
          Training materials
          <textarea value={details.trainingMaterial || ''} onChange={(event) => updateDetails('trainingMaterial', event.target.value)} placeholder="Onboarding notes, role-specific training, video links" />
        </label>
        <label className="span-2">
          Templates
          <textarea value={details.templateNotes || ''} onChange={(event) => updateDetails('templateNotes', event.target.value)} placeholder="Reusable checklist, email, SOP, or task-set notes" />
        </label>
      </div>

      <div className="system-summary-grid">
        <InfoBlock label="Category" value={details.category} sub="Knowledge taxonomy" />
        <InfoBlock label="Review" value={details.reviewDate || 'Not scheduled'} sub={details.reviewOwner ? getPerson(details.reviewOwner)?.name : 'No owner'} />
        <InfoBlock label="Attach target" value={details.attachTarget || 'Job'} sub={record.convertedTo || 'Not attached'} />
        <InfoBlock label="Search" value={(details.searchTerms || '').split(',').filter(Boolean).length || 0} sub="Indexed terms" />
      </div>

      <div className="record-actions">
        <button type="button" className="primary-button" onClick={publish}>Publish Article</button>
        <button type="button" className="secondary-button" onClick={attach}>Attach SOP</button>
      </div>
    </div>
  );
}

function AutomationRecordPanel({ record, onUpdate }) {
  const details = { ...moduleStructuredDefaults.automations, ...(record.structured || {}) };
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };
  const runAutomation = () => {
    const line = `${new Date().toLocaleString('en-US')}: ${details.trigger} / ${details.condition} / ${details.action}`;
    onUpdate(record.id, {
      status: details.enabled === 'Paused' ? 'Paused' : 'Enabled',
      convertedTo: 'Automation run logged',
      conversionNote: line,
      structured: { ...details, automationLog: [line, details.automationLog].filter(Boolean).join('\n') }
    });
  };

  return (
    <div className="module-system-panel">
      <div className="panel-header">
        <div>
          <h3>Automation System</h3>
          <p>Trigger, condition, action, enablement, test run, and run-log controls for workflow rules.</p>
        </div>
      </div>

      <div className="rule-builder">
        <label>
          Trigger
          <select value={details.trigger || 'New job created'} onChange={(event) => updateDetails('trigger', event.target.value)}>
            {localModulePanels.automations.fields[0][3].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Condition
          <select value={details.condition || 'Company is Roofing'} onChange={(event) => updateDetails('condition', event.target.value)}>
            {localModulePanels.automations.fields[1][3].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Action
          <select value={details.action || 'Create task'} onChange={(event) => updateDetails('action', event.target.value)}>
            {localModulePanels.automations.fields[2][3].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Rule state
          <select value={details.enabled || 'Enabled'} onChange={(event) => {
            updateDetails('enabled', event.target.value);
            onUpdate(record.id, { status: event.target.value });
          }}>
            <option>Enabled</option>
            <option>Paused</option>
          </select>
        </label>
        <label className="span-2">
          Automation log
          <textarea value={details.automationLog || ''} onChange={(event) => updateDetails('automationLog', event.target.value)} placeholder="Runs will appear here" />
        </label>
      </div>

      <div className="automation-flow">
        {[details.trigger, details.condition, details.action].map((item, index) => (
          <div className="flow-step" key={`${item}-${index}`}>
            <span>{index === 0 ? 'When' : index === 1 ? 'If' : 'Then'}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>

      <div className="record-actions">
        <button type="button" className="primary-button" onClick={runAutomation}>Run Automation Locally</button>
        <button type="button" className="secondary-button" onClick={() => {
          const nextState = details.enabled === 'Enabled' ? 'Paused' : 'Enabled';
          onUpdate(record.id, { status: nextState, structured: { ...details, enabled: nextState } });
        }}>{details.enabled === 'Enabled' ? 'Pause Rule' : 'Enable Rule'}</button>
      </div>
    </div>
  );
}

function DashboardRecordPanel({ record, jobs, onUpdate }) {
  const details = { ...moduleStructuredDefaults.dashboards, ...(record.structured || {}) };
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };
  const widgetList = (details.widgets || '').split(',').map((item) => item.trim()).filter(Boolean);
  const activeJobs = jobs.filter((job) => job.stage !== 'Completed').length;
  const overdueTasks = jobs.reduce((sum, job) => sum + taskStats(job.id).overdue, 0);
  const revenue = jobs.reduce((sum, job) => sum + safeNumber(job.estimateTotal), 0);

  return (
    <div className="module-system-panel">
      <div className="panel-header">
        <div>
          <h3>Dashboard System</h3>
          <p>Saved views, widget builder, company filters, and operational reporting controls.</p>
        </div>
      </div>

      <div className="record-detail-grid">
        <label>
          Dashboard type
          <select value={details.dashboardType || 'Company overview'} onChange={(event) => updateDetails('dashboardType', event.target.value)}>
            {localModulePanels.dashboards.fields[0][3].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Date range
          <select value={details.dateRange || 'This week'} onChange={(event) => updateDetails('dateRange', event.target.value)}>
            <option>Today</option>
            <option>This week</option>
            <option>This month</option>
            <option>This quarter</option>
          </select>
        </label>
        <label className="span-2">
          Widgets
          <textarea value={details.widgets || ''} onChange={(event) => updateDetails('widgets', event.target.value)} placeholder="Active jobs, overdue tasks, revenue, survey score" />
        </label>
        <label>
          Filters
          <input value={details.filters || ''} onChange={(event) => updateDetails('filters', event.target.value)} />
        </label>
        <label>
          Saved view name
          <input value={details.savedView || ''} onChange={(event) => updateDetails('savedView', event.target.value)} placeholder={record.title} />
        </label>
      </div>

      <div className="system-summary-grid">
        <InfoBlock label="Active jobs" value={activeJobs} sub="Current local job records" />
        <InfoBlock label="Overdue tasks" value={overdueTasks} sub="TaskManagement rollup" />
        <InfoBlock label="Revenue view" value={money(revenue)} sub={details.dateRange} />
        <InfoBlock label="Widgets" value={widgetList.length} sub={details.dashboardType} />
      </div>

      <div className="capsule-grid">
        {widgetList.map((widget) => <span key={widget}>{widget}</span>)}
        {!widgetList.length && <span>No widgets configured</span>}
      </div>

      <div className="record-actions">
        <button type="button" className="primary-button" onClick={() => onUpdate(record.id, { status: 'Pinned', convertedTo: 'Dashboard view pinned', conversionNote: `${record.title} pinned ${new Date().toLocaleDateString('en-US')}.` })}>Pin Dashboard</button>
        <button type="button" className="secondary-button" onClick={() => onUpdate(record.id, { status: 'Saved', structured: { ...details, savedView: details.savedView || record.title } })}>Save View</button>
      </div>
    </div>
  );
}

function TemplateRecordPanel({ record, onUpdate }) {
  const details = { ...moduleStructuredDefaults.templates, ...(record.structured || {}) };
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };
  const applyTemplate = () => {
    onUpdate(record.id, {
      status: 'Applied',
      convertedTo: 'Template applied to job setup',
      conversionNote: `${record.title} template applied locally ${new Date().toLocaleDateString('en-US')}.`,
      structured: {
        ...details,
        appliedObjects: ['Job shell', 'TaskManagement task set', 'Form/checklist', 'Finance starter']
      }
    });
  };

  return (
    <div className="module-system-panel">
      <div className="panel-header">
        <div>
          <h3>Template System</h3>
          <p>Reusable job, task, form, survey, inspection, estimate, email, SOP, and automation templates.</p>
        </div>
      </div>

      <div className="record-detail-grid">
        <label>
          Template type
          <select value={details.templateType || 'Job template'} onChange={(event) => updateDetails('templateType', event.target.value)}>
            {localModulePanels.templates.fields[0][3].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Example job template
          <select value={details.exampleJob || 'Roofing repair job'} onChange={(event) => updateDetails('exampleJob', event.target.value)}>
            {localModulePanels.templates.fields[2][3].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="span-2">
          Creates
          <textarea value={details.templateOutput || ''} onChange={(event) => updateDetails('templateOutput', event.target.value)} />
        </label>
        <label className="span-2">
          TaskManagement task set
          <textarea value={details.taskSet || ''} onChange={(event) => updateDetails('taskSet', event.target.value)} />
        </label>
        <label>
          Form / survey set
          <input value={details.formSet || ''} onChange={(event) => updateDetails('formSet', event.target.value)} />
        </label>
        <label>
          Finance starter
          <input value={details.financeSet || ''} onChange={(event) => updateDetails('financeSet', event.target.value)} />
        </label>
        <label className="span-2">
          Automation starter
          <input value={details.automationSet || ''} onChange={(event) => updateDetails('automationSet', event.target.value)} />
        </label>
      </div>

      <div className="template-object-grid">
        {['Job shell', 'TaskManagement task set', 'Form/checklist', 'Estimate/invoice starter', 'SOP/email copy', 'Automation rule'].map((item) => (
          <div className="local-card" key={item}>
            <strong>{item}</strong>
            <small>{details.templateType} output</small>
          </div>
        ))}
      </div>

      <div className="record-actions">
        <button type="button" className="primary-button" onClick={applyTemplate}>Apply Template Locally</button>
      </div>
    </div>
  );
}

function AdminRecordPanel({ record, onUpdate }) {
  const details = { ...moduleStructuredDefaults.admin, ...(record.structured || {}) };
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };

  return (
    <div className="module-system-panel">
      <div className="panel-header">
        <div>
          <h3>Admin System</h3>
          <p>User approvals, roles, permissions, company access, system settings, and notification controls.</p>
        </div>
      </div>

      <div className="record-detail-grid">
        <label>
          User profile
          <input value={details.userName || ''} onChange={(event) => updateDetails('userName', event.target.value)} placeholder="User name or setting owner" />
        </label>
        <label>
          Role
          <select value={details.role || 'Worker'} onChange={(event) => updateDetails('role', event.target.value)}>
            <option>Owner</option>
            <option>Admin</option>
            <option>Supervisor</option>
            <option>Worker</option>
            <option>Viewer</option>
          </select>
        </label>
        <label>
          Company access
          <select value={details.companyAccess || 'Roofing'} onChange={(event) => updateDetails('companyAccess', event.target.value)}>
            <option>Roofing</option>
            <option>Drafting</option>
            <option>Lumen</option>
            <option>All companies</option>
          </select>
        </label>
        <label>
          Approval status
          <select value={details.approvalStatus || 'Pending approval'} onChange={(event) => {
            updateDetails('approvalStatus', event.target.value);
            onUpdate(record.id, { status: event.target.value });
          }}>
            <option>Pending approval</option>
            <option>Approved</option>
            <option>Suspended</option>
          </select>
        </label>
        <label className="span-2">
          Permissions
          <textarea value={details.permissions || ''} onChange={(event) => updateDetails('permissions', event.target.value)} placeholder="View jobs, approve estimates, manage tickets" />
        </label>
        <label className="span-2">
          Settings
          <textarea value={details.settings || ''} onChange={(event) => updateDetails('settings', event.target.value)} placeholder="Job types, stages, lead statuses, ticket statuses, templates" />
        </label>
        <label className="span-2">
          Notification settings
          <textarea value={details.notificationSettings || ''} onChange={(event) => updateDetails('notificationSettings', event.target.value)} placeholder="Due dates, invoices, SLA, approvals" />
        </label>
      </div>

      <div className="system-summary-grid">
        <InfoBlock label="Role" value={details.role} sub={details.companyAccess} />
        <InfoBlock label="Approval" value={details.approvalStatus} sub={record.status} />
        <InfoBlock label="Users" value={people.length} sub="Seeded local users" />
        <InfoBlock label="Companies" value={companies.length} sub="Roofing, Drafting, Lumen" />
      </div>

      <div className="record-actions">
        <button type="button" className="primary-button" onClick={() => onUpdate(record.id, { status: 'Approved', convertedTo: 'User approved', conversionNote: `${record.title} approved ${new Date().toLocaleDateString('en-US')}.`, structured: { ...details, approvalStatus: 'Approved' } })}>Approve User</button>
        <button type="button" className="secondary-button" onClick={() => onUpdate(record.id, { status: 'Suspended', structured: { ...details, approvalStatus: 'Suspended' } })}>Suspend</button>
        <button type="button" className="secondary-button" onClick={() => onUpdate(record.id, { convertedTo: 'Admin setting applied', conversionNote: `Settings applied ${new Date().toLocaleDateString('en-US')}.` })}>Apply Setting</button>
      </div>
    </div>
  );
}

function CrmRecordPanel({ record, jobs, onUpdate, onConvertLeadToClient, onConvertLeadToJob }) {
  const details = record.structured || {};
  const updateDetails = (field, value) => {
    onUpdate(record.id, { structured: { ...details, [field]: value } });
  };
  const relatedClient = details.relatedClientId ? getClient(details.relatedClientId) : null;
  const relatedJobs = jobs.filter((job) => (
    job.clientId === details.relatedClientId || job.id === record.jobId || job.id === details.convertedJobId
  ));
  const relatedFileCount = relatedJobs.reduce((sum, job) => sum + Number(job.fileCount || 0), 0);
  const relatedInvoiceTotal = relatedJobs.reduce((sum, job) => sum + Number(job.invoiceTotal || 0), 0);
  const relatedEstimateTotal = relatedJobs.reduce((sum, job) => sum + Number(job.estimateTotal || 0), 0);
  const isLead = (details.recordType || 'Lead') === 'Lead';

  return (
    <div className="crm-profile-card">
      <div className="panel-header">
        <div>
          <h3>CRM Profile</h3>
          <p>Lead, client, contact, and opportunity data for this relationship record.</p>
        </div>
      </div>

      <div className="record-detail-grid">
        <label>
          Record type
          <select value={details.recordType || 'Lead'} onChange={(event) => updateDetails('recordType', event.target.value)}>
            <option>Lead</option>
            <option>Client</option>
            <option>Contact</option>
            <option>Opportunity</option>
          </select>
        </label>
        <label>
          Lead source
          <input value={details.leadSource || ''} onChange={(event) => updateDetails('leadSource', event.target.value)} placeholder="Referral, website, phone, campaign" />
        </label>
        <label>
          Assigned sales rep
          <select value={details.assignedRep || ''} onChange={(event) => updateDetails('assignedRep', event.target.value)}>
            <option value="">Unassigned</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name} - {person.role}</option>)}
          </select>
        </label>
        <label>
          Follow-up date
          <input type="date" value={details.followUpDate || ''} onChange={(event) => updateDetails('followUpDate', event.target.value)} />
        </label>
        <label>
          Deal value
          <input type="number" min="0" value={details.dealValue || ''} onChange={(event) => updateDetails('dealValue', event.target.value)} placeholder="8400" />
        </label>
        <label>
          Estimate status
          <select value={details.estimateStatus || 'Not sent'} onChange={(event) => updateDetails('estimateStatus', event.target.value)}>
            <option>Not sent</option>
            <option>Inspection needed</option>
            <option>Drafting</option>
            <option>Sent</option>
            <option>Approved</option>
            <option>Declined</option>
          </select>
        </label>
        <label>
          Related client
          <select value={details.relatedClientId || ''} onChange={(event) => updateDetails('relatedClientId', event.target.value)}>
            <option value="">No client yet</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </select>
        </label>
        <label>
          Role / relationship
          <input value={details.role || ''} onChange={(event) => updateDetails('role', event.target.value)} placeholder="Owner, manager, billing contact" />
        </label>
        <label>
          Contact name
          <input value={details.contactName || ''} onChange={(event) => updateDetails('contactName', event.target.value)} placeholder="Primary contact" />
        </label>
        <label>
          Email
          <input type="email" value={details.email || ''} onChange={(event) => updateDetails('email', event.target.value)} placeholder="name@example.com" />
        </label>
        <label>
          Phone
          <input value={details.phone || ''} onChange={(event) => updateDetails('phone', event.target.value)} placeholder="(480) 555-0100" />
        </label>
        <label>
          Communication notes
          <input value={details.communicationNotes || ''} onChange={(event) => updateDetails('communicationNotes', event.target.value)} placeholder="Last call, preference, next step" />
        </label>
      </div>

      <div className="crm-summary-grid">
        <InfoBlock label="Client profile" value={relatedClient?.name || details.clientCompany || 'No client linked'} sub={relatedClient ? `${getCompany(relatedClient.company).name} - ${relatedClient.address}` : 'Convert or link a client'} />
        <InfoBlock label="Contact profile" value={details.contactName || 'No contact named'} sub={[details.email, details.phone, details.role].filter(Boolean).join(' - ') || 'Add contact info'} />
        <InfoBlock label="Pipeline" value={record.status} sub={`${money(safeNumber(details.dealValue))} - ${details.estimateStatus || 'No estimate status'}`} />
        <InfoBlock label="Related jobs" value={relatedJobs.length} sub={relatedJobs.map((job) => job.name).slice(0, 2).join(' - ') || 'No jobs linked'} />
        <InfoBlock label="Related files" value={relatedFileCount} sub="Summed from linked job file/photo counts" />
        <InfoBlock label="Related invoices" value={money(relatedInvoiceTotal)} sub={`${money(Math.max(0, relatedEstimateTotal - relatedInvoiceTotal))} remaining estimate value`} />
        <InfoBlock label="Follow-up reminder" value={details.followUpDate || 'Not scheduled'} sub={details.assignedRep ? `Owner: ${getPerson(details.assignedRep)?.name}` : 'No owner assigned'} />
      </div>

      <div className="compact-list">
        {relatedJobs.slice(0, 3).map((job) => (
          <div className="compact-row static" key={job.id}>
            <span>
              <strong>{job.name}</strong>
              <small>{job.stage} - {money(job.estimateTotal)}</small>
            </span>
          </div>
        ))}
        {!relatedJobs.length && (
          <div className="feature-line muted-feature">
            <AlertTriangle size={16} />
            <span>
              <strong>No related jobs</strong>
              <small>Convert the lead to a job or attach an existing job.</small>
            </span>
          </div>
        )}
      </div>

      {isLead && (
        <div className="record-actions">
          <button type="button" className="secondary-button" onClick={() => onConvertLeadToClient?.(record.id)}>
            <Users size={17} />
            Convert Lead to Client
          </button>
          <button type="button" className="primary-button" onClick={() => onConvertLeadToJob?.(record.id)}>
            <BriefcaseBusiness size={17} />
            Convert Lead to Job
          </button>
        </div>
      )}
    </div>
  );
}

function FileRecordPanel({ record }) {
  const details = record.structured || {};
  const type = details.fileType || 'Unspecified type';

  return (
    <div className="file-preview-card">
      <div className="file-preview-icon">
        <FileText size={28} />
      </div>
      <div>
        <span>File preview</span>
        <strong>{details.fileName || record.title}</strong>
        <small>{type} - {formatFileSize(details.fileSize)} - {details.category || 'Uncategorized'}</small>
        <small>Attached to: {details.attachmentTarget || 'Job'}{details.tags ? ` - Tags: ${details.tags}` : ''}</small>
      </div>
    </div>
  );
}

function ModuleStat({ label, value, icon: Icon }) {
  return (
    <div className="module-stat">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <Icon size={20} />
    </div>
  );
}

function ModuleRecordModal({ moduleId, jobs, onClose, onSubmit }) {
  const config = moduleConfigs[moduleId];
  const extraLabel = moduleExtraLabel(moduleId);
  const noun = (config?.primaryAction || 'Create Record')
    .replace(/^Create\s+/i, '')
    .replace(/^Upload\s+/i, 'File')
    .replace(/^Invite\s+/i, 'User');
  const [form, setForm] = useState({
    title: '',
    status: 'New',
    jobId: jobs[0]?.id || '',
    extra: '',
    notes: '',
    structured: moduleId === 'crm'
      ? {
          recordType: 'Lead',
          leadSource: '',
          assignedRep: people[0]?.id || '',
          followUpDate: today,
          dealValue: '',
          estimateStatus: 'Not sent',
          relatedClientId: '',
          contactName: '',
          email: '',
          phone: '',
          role: ''
        }
      : moduleId === 'forms'
        ? {
            description: '',
            visibility: 'Internal only',
            publicLink: '',
            internalOnly: true,
            questionTypes: ['Short text'],
            responseSearch: '',
            responseFilter: 'All',
            attachedClientId: clients[0]?.id || '',
            responseCount: 0,
            averageRating: 0,
            surveyType: 'Internal request form',
            checklistItems: 'Roof inspection checklist, Site visit checklist, Drafting QA checklist, Job completion checklist, Safety checklist, Final walkthrough checklist',
            responses: []
          }
      : moduleId === 'tickets'
        ? {
            type: 'Client request',
            priority: 'medium',
            requester: '',
            assignedPerson: people[0]?.id || '',
            relatedClientId: clients[0]?.id || '',
            internalNotes: '',
            dueDate: today,
            attachedFiles: []
          }
      : getModuleStructuredDefaults(moduleId)
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateStructured = (field, value) => {
    setForm((current) => ({ ...current, structured: { ...(current.structured || {}), [field]: value } }));
  };

  const chooseFile = (file) => {
    if (!file) return;
    const category = file.type.startsWith('image/') ? 'Job photos' : 'Client documents';
    setForm((current) => ({
      ...current,
      title: current.title || file.name,
      status: 'Attached',
      extra: current.extra || `${category} - ${file.name}`,
      notes: current.notes || `Uploaded ${file.name} and attached it to ${current.jobId ? 'the selected job' : 'a record'}.`,
      structured: {
        ...(current.structured || {}),
        fileName: file.name,
        fileType: file.type || 'Unknown file type',
        fileSize: file.size,
        category,
        attachmentTarget: current.structured?.attachmentTarget || 'Job',
        tags: current.structured?.tags || ''
      }
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      title: form.title.trim(),
      notes: form.notes.trim(),
      status: form.status || 'New',
      jobId: form.jobId || null,
      structured: form.structured || {}
    });
  };

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="module-record-title">
      <form className="modal compact-modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">{config?.eyebrow || 'Module'}</div>
            <h2 id="module-record-title">{config?.primaryAction || 'Create Record'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="form-grid">
          <label className="span-2">
            {noun} name
            <input required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder={`New ${noun.toLowerCase()}`} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => update('status', event.target.value)}>
              <option>New</option>
              <option>In review</option>
              <option>Approved</option>
              <option>Converted</option>
              <option>Archived</option>
            </select>
          </label>
          <label>
            {extraLabel}
            <input value={form.extra} onChange={(event) => update('extra', event.target.value)} placeholder={extraPlaceholder(moduleId)} />
          </label>
          {moduleId === 'files' && (
            <>
              <label className="span-2">
                Select file or photo
                <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={(event) => chooseFile(event.target.files?.[0])} />
              </label>
              <label>
                File category
                <select value={form.structured.category || 'Job photos'} onChange={(event) => updateStructured('category', event.target.value)}>
                  <option>Job photos</option>
                  <option>Client documents</option>
                  <option>Permits</option>
                  <option>Contracts</option>
                  <option>Estimates</option>
                  <option>Invoices</option>
                  <option>Drawings</option>
                  <option>Drafting files</option>
                  <option>Marketing assets</option>
                  <option>Internal documents</option>
                </select>
              </label>
              <label>
                Attach file to
                <select value={form.structured.attachmentTarget || 'Job'} onChange={(event) => updateStructured('attachmentTarget', event.target.value)}>
                  <option>Job</option>
                  <option>Client</option>
                  <option>Task</option>
                  <option>Ticket</option>
                  <option>Form response</option>
                </select>
              </label>
              <label className="span-2">
                File tags
                <input value={form.structured.tags || ''} onChange={(event) => updateStructured('tags', event.target.value)} placeholder="final, repair, permit, client" />
              </label>
            </>
          )}
          {moduleId === 'crm' && (
            <>
              <label>
                Record type
                <select value={form.structured.recordType || 'Lead'} onChange={(event) => updateStructured('recordType', event.target.value)}>
                  <option>Lead</option>
                  <option>Client</option>
                  <option>Contact</option>
                  <option>Opportunity</option>
                </select>
              </label>
              <label>
                Lead source
                <input value={form.structured.leadSource || ''} onChange={(event) => updateStructured('leadSource', event.target.value)} placeholder="Referral, website, phone, campaign" />
              </label>
              <label>
                Assigned sales rep
                <select value={form.structured.assignedRep || ''} onChange={(event) => updateStructured('assignedRep', event.target.value)}>
                  <option value="">Unassigned</option>
                  {people.map((person) => <option key={person.id} value={person.id}>{person.name} - {person.role}</option>)}
                </select>
              </label>
              <label>
                Follow-up date
                <input type="date" value={form.structured.followUpDate || ''} onChange={(event) => updateStructured('followUpDate', event.target.value)} />
              </label>
              <label>
                Deal value
                <input type="number" min="0" value={form.structured.dealValue || ''} onChange={(event) => updateStructured('dealValue', event.target.value)} placeholder="8400" />
              </label>
              <label>
                Estimate status
                <select value={form.structured.estimateStatus || 'Not sent'} onChange={(event) => updateStructured('estimateStatus', event.target.value)}>
                  <option>Not sent</option>
                  <option>Inspection needed</option>
                  <option>Drafting</option>
                  <option>Sent</option>
                  <option>Approved</option>
                  <option>Declined</option>
                </select>
              </label>
              <label>
                Related client
                <select value={form.structured.relatedClientId || ''} onChange={(event) => updateStructured('relatedClientId', event.target.value)}>
                  <option value="">No client yet</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </label>
              <label>
                Role / relationship
                <input value={form.structured.role || ''} onChange={(event) => updateStructured('role', event.target.value)} placeholder="Owner, manager, billing contact" />
              </label>
              <label>
                Contact name
                <input value={form.structured.contactName || ''} onChange={(event) => updateStructured('contactName', event.target.value)} placeholder="Primary contact" />
              </label>
              <label>
                Email
                <input type="email" value={form.structured.email || ''} onChange={(event) => updateStructured('email', event.target.value)} placeholder="name@example.com" />
              </label>
              <label>
                Phone
                <input value={form.structured.phone || ''} onChange={(event) => updateStructured('phone', event.target.value)} placeholder="(480) 555-0100" />
              </label>
            </>
          )}
          {moduleId === 'forms' && (
            <>
              <label className="span-2">
                Form description
                <textarea value={form.structured.description || ''} onChange={(event) => updateStructured('description', event.target.value)} placeholder="What this form collects and when the team should use it" />
              </label>
              <label>
                Visibility
                <select value={form.structured.visibility || 'Internal only'} onChange={(event) => updateStructured('visibility', event.target.value)}>
                  <option>Public link</option>
                  <option>Internal only</option>
                </select>
              </label>
              <label>
                Public form link
                <input value={form.structured.publicLink || ''} onChange={(event) => updateStructured('publicLink', event.target.value)} placeholder="https://quest-hq.local/forms/new-form" />
              </label>
              <label>
                Internal-only form
                <select value={form.structured.internalOnly ? 'Yes' : 'No'} onChange={(event) => updateStructured('internalOnly', event.target.value === 'Yes')}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </label>
              <label>
                Survey type
                <select value={form.structured.surveyType || 'Internal request form'} onChange={(event) => updateStructured('surveyType', event.target.value)}>
                  <option>Customer satisfaction survey</option>
                  <option>Employee feedback survey</option>
                  <option>Job completion survey</option>
                  <option>Client approval form</option>
                  <option>Internal request form</option>
                  <option>Inspection form</option>
                </select>
              </label>
              <label>
                Attach responses to client
                <select value={form.structured.attachedClientId || ''} onChange={(event) => updateStructured('attachedClientId', event.target.value)}>
                  <option value="">No client linked</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </label>
              <label>
                Average rating
                <input type="number" min="0" max="5" step="0.1" value={form.structured.averageRating || ''} onChange={(event) => updateStructured('averageRating', event.target.value)} />
              </label>
              <label>
                Response count
                <input type="number" min="0" value={form.structured.responseCount || ''} onChange={(event) => updateStructured('responseCount', event.target.value)} />
              </label>
              <label className="span-2">
                Question types
                <input value={(form.structured.questionTypes || []).join(', ')} onChange={(event) => updateStructured('questionTypes', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="Short text, Rating, Signature" />
              </label>
              <label className="span-2">
                Inspection checklists
                <input value={form.structured.checklistItems || ''} onChange={(event) => updateStructured('checklistItems', event.target.value)} placeholder="Roof inspection checklist, Safety checklist" />
              </label>
            </>
          )}
          {moduleId === 'tickets' && (
            <>
              <label>
                Ticket type
                <select value={form.structured.type || 'Client request'} onChange={(event) => updateStructured('type', event.target.value)}>
                  {ticketTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label>
                Ticket priority
                <select value={form.structured.priority || 'medium'} onChange={(event) => updateStructured('priority', event.target.value)}>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
              <label>
                Requester
                <input value={form.structured.requester || ''} onChange={(event) => updateStructured('requester', event.target.value)} placeholder="Client or team member" />
              </label>
              <label>
                Assigned person
                <select value={form.structured.assignedPerson || ''} onChange={(event) => updateStructured('assignedPerson', event.target.value)}>
                  <option value="">Unassigned</option>
                  {people.map((person) => <option key={person.id} value={person.id}>{person.name} - {person.role}</option>)}
                </select>
              </label>
              <label>
                Related client
                <select value={form.structured.relatedClientId || ''} onChange={(event) => updateStructured('relatedClientId', event.target.value)}>
                  <option value="">No client linked</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </label>
              <label>
                SLA / due date
                <input type="date" value={form.structured.dueDate || ''} onChange={(event) => updateStructured('dueDate', event.target.value)} />
              </label>
              <label className="span-2">
                Internal notes
                <textarea value={form.structured.internalNotes || ''} onChange={(event) => updateStructured('internalNotes', event.target.value)} placeholder="Internal context, decision notes, escalation, or handoff instructions" />
              </label>
            </>
          )}
          <label>
            Related job
            <select value={form.jobId} onChange={(event) => update('jobId', event.target.value)}>
              <option value="">No job yet</option>
              {jobs.map((job) => <option key={job.id} value={job.id}>{job.name}</option>)}
            </select>
          </label>
          <label className="span-2">
            Notes
            <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Context, source, next step, or conversion note" />
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">
            <Plus size={17} />
            Save {noun}
          </button>
        </div>
      </form>
    </div>
  );
}

function CreateJobModal({ onClose, onSubmit, activeCompany }) {
  const [form, setForm] = useState({
    name: '',
    company: activeCompany,
    clientId: clients.find((client) => client.company === activeCompany)?.id || clients[0].id,
    contact: '',
    siteAddress: '',
    type: 'Roof inspection',
    stage: 'Lead',
    priority: 'medium',
    owner: people.find((person) => person.company === activeCompany)?.id || people[0].id,
    scope: '',
    startDate: today,
    endDate: today,
    estimateTotal: 0,
    notes: ''
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.scope.trim()) return;
    const client = getClient(form.clientId);
    onSubmit({
      ...form,
      name: form.name.trim(),
      contact: form.contact.trim() || client?.contact || '',
      siteAddress: form.siteAddress.trim() || client?.address || '',
      scope: form.scope.trim()
    });
  };

  const companyClients = clients.filter((client) => client.company === form.company);
  const companyPeople = people.filter((person) => person.company === form.company);

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="create-job-title">
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">Create Job</div>
            <h2 id="create-job-title">New job container</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="form-grid">
          <label>
            Job name
            <input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Queen Creek roof repair" />
          </label>
          <label>
            Company
            <select value={form.company} onChange={(event) => {
              const nextCompany = event.target.value;
              const nextClient = clients.find((client) => client.company === nextCompany);
              const nextOwner = people.find((person) => person.company === nextCompany);
              setForm((current) => ({
                ...current,
                company: nextCompany,
                clientId: nextClient?.id || current.clientId,
                owner: nextOwner?.id || current.owner
              }));
            }}>
              {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
          </label>
          <label>
            Client
            <select value={form.clientId} onChange={(event) => update('clientId', event.target.value)}>
              {companyClients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </label>
          <label>
            Contact person
            <input value={form.contact} onChange={(event) => update('contact', event.target.value)} placeholder={getClient(form.clientId)?.contact || 'Client contact'} />
          </label>
          <label>
            Site / property address
            <input value={form.siteAddress} onChange={(event) => update('siteAddress', event.target.value)} placeholder={getClient(form.clientId)?.address || 'Address'} />
          </label>
          <label>
            Job type
            <input value={form.type} onChange={(event) => update('type', event.target.value)} />
          </label>
          <label>
            Job stage
            <select value={form.stage} onChange={(event) => update('stage', event.target.value)}>
              {stageOrder.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
            </select>
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={(event) => update('priority', event.target.value)}>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            Owner / PM
            <select value={form.owner} onChange={(event) => update('owner', event.target.value)}>
              {companyPeople.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </label>
          <label>
            Estimate total
            <input type="number" min="0" value={form.estimateTotal} onChange={(event) => update('estimateTotal', event.target.value)} />
          </label>
          <label>
            Start date
            <input type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} />
          </label>
          <label>
            End date
            <input type="date" value={form.endDate} onChange={(event) => update('endDate', event.target.value)} />
          </label>
          <label className="span-2">
            Scope summary
            <textarea required value={form.scope} onChange={(event) => update('scope', event.target.value)} placeholder="What this job is responsible for. Task execution stays in TaskManagement." />
          </label>
          <label className="span-2">
            Notes
            <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Internal details, access notes, sales context, or scheduling constraints" />
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">
            <Plus size={17} />
            Create Job
          </button>
        </div>
      </form>
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone }) {
  return (
    <div className={`metric-card ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <Icon size={22} />
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function JobAttentionRow({ job, onOpenJob }) {
  const stats = taskStats(job.id);
  return (
    <button className="attention-row" onClick={() => onOpenJob(job.id)}>
      <div>
        <strong>{job.name}</strong>
      <small>{getClient(job.clientId)?.name} - {job.stage}</small>
      </div>
      <div className="attention-meta">
        {stats.overdue > 0 && <span className="danger-pill">{stats.overdue} overdue</span>}
        <PriorityPill priority={job.priority} />
        <ChevronRight size={16} />
      </div>
    </button>
  );
}

function JobListItem({ job, selected, onClick }) {
  const stats = taskStats(job.id);
  const company = getCompany(job.company);
  return (
    <button className={`job-list-item ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="job-list-top">
        <span className="company-dot" style={{ background: company.color }} />
        <strong>{job.name}</strong>
      </div>
      <small>{getClient(job.clientId)?.name} - {job.type}</small>
      <div className="job-list-meta">
        <StageBadge stage={job.stage} compact />
        <span>{stats.completed}/{stats.total} tasks</span>
        <span>{duePhrase(job.endDate)}</span>
      </div>
    </button>
  );
}

function StageBadge({ stage, compact = false }) {
  const index = Math.max(0, stageOrder.indexOf(stage));
  return <span className={`stage-badge stage-${index} ${compact ? 'compact' : ''}`}>{stage}</span>;
}

function PriorityPill({ priority }) {
  return <span className={`priority-pill ${priority}`}>{statusLabel(priority)}</span>;
}

function InfoBlock({ label, value, sub }) {
  return (
    <div className="info-block">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}

function InlineStat({ label, value, danger = false }) {
  return (
    <div className={`inline-stat ${danger ? 'danger' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TaskRow({ task }) {
  const assignee = getPerson(task.assignee);
  return (
    <div className="task-row">
      <div>
        <strong>{task.title}</strong>
        <small>{assignee?.name || 'Unassigned'} - due {task.due}</small>
      </div>
      <div className="task-meta">
        <span className={`task-status ${task.status}`}>{statusLabel(task.status)}</span>
        <PriorityPill priority={task.priority} />
      </div>
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <FileText size={24} />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function duePhrase(dateValue) {
  const days = daysUntil(dateValue);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  return `due in ${days}d`;
}

export default App;
