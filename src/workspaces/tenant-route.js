import { workspaceForRoute } from './model.js';

function clean(value) {
  return String(value ?? '').trim();
}

export function resolveTenantRoute({
  routeCompanyId,
  routeWorkspaceId,
  storedWorkspaceId,
  allowedCompanyIds = [],
  workspaces = [],
  memberships = [],
  profileId,
  companyRoles = {},
}) {
  const allowedCompanies = allowedCompanyIds.map(clean).filter(Boolean);
  if (!allowedCompanies.length) {
    return {
      status: 'no-access',
      companyId: '',
      workspaceId: '',
      companyChanged: false,
      workspaceChanged: false,
      needsRedirect: false,
    };
  }

  const requestedCompany = clean(routeCompanyId);
  const requestedWorkspace = clean(routeWorkspaceId);
  const companyId = allowedCompanies.includes(requestedCompany)
    ? requestedCompany
    : allowedCompanies[0];
  const companyChanged = companyId !== requestedCompany;
  const workspace = workspaceForRoute({
    companyId,
    workspaceParam: companyChanged ? '' : requestedWorkspace,
    storedWorkspaceId,
    workspaces,
    memberships,
    profileId,
    companyRole: companyRoles[companyId],
  });
  const workspaceId = clean(workspace?.id);
  const workspaceChanged = workspaceId !== requestedWorkspace;

  return {
    status: 'ready',
    companyId,
    workspaceId,
    companyChanged,
    workspaceChanged,
    needsRedirect: companyChanged || workspaceChanged,
  };
}
