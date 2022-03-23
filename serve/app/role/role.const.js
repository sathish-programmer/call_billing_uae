 module.exports = INAIPI_ROLE_LIST = [
  {
    name: "ORGANIZATION",
    permissions: ["canSeeAllChildOrganization",
                  "canAddOrganization",
                  "canEditOrganization",
                  "canDeleteOrganization",
                  "canRetrieveOrganization"]
  },
  {
    name :'BRANCH',
    permissions: ['canAddBranch',
                  'canRetrieveBranch',
                  'canUpdateBranch',
                  'canDeleteBranch']
  },
  {
    name :'DEPARTMENT',
    permissions: ['canAddDepartment',
                  'canRetrieveDepartment',
                  'canUpdateDepartment',
                  'canDeleteDepartment']
  },
  {
    name :'SUB DEPARTMENT',
    permissions: ['canAddSubDepartment',
                  'canRetrieveSubDepartment',
                  'canUpdateSubDepartment',
                  'canDeleteSubDepartment']
  },
  {
    name: 'USER',
    permissions: [
        'canAddUser',
        'canEditUser',
        'canDeleteUser',
        'canRetrieveUser',
        'canUpdateUserPassword']
  },
  {
    name: 'ROLE',
    permissions: [
        'canAddRole',
        'canEditRole',
        'canDeleteRole',
        'canRetrieveRole',]
  },
  {
    name: "INAIPI - SETUP - PROVIDER",
    permissions: [    
      "canAddProvider",
      "canEditProvider",
      "canDeleteProvider",
      "canRetrieveProvider"
    ]
  },
  {
    name: "INAIPI - SETUP - ASSIGN TARIFF",
    permissions: [
      "canAddAssignTariff",
      "canEditAssignTariff",
      "canRetrieveAssignTariff",
      "canDeleteAssignTariff"
    ]
  },
  {
    name: "INAIPI - SETUP - TARIFF",
    permissions: [
      "canAddTariff",
      "canEditTariff",
      "canRetrieveTariff",
      "canDeleteTariff",
      "canAddTariffRateAndDate",
      "canEditTariffRateAndDate",
      "canAddTariffFile",
      "canDeleteTariffFile",
    ]
  },
  {
    name: "INAIPI - DASHBOARD",
    permissions: [
      "canSeeCallLogsDashboard",
      "canSeeReports"
    ]
  }
];