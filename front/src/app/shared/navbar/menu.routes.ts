export var PRODUCT_ROUTES = {
    paths: function(permissions){
        return [
            //ADMIN
            {   product: 'Admin', 
                checkpermission: ((permissions.indexOf('canAddOrganization') >=0) 
                                 || (permissions.indexOf('canAddRole') >=0) 
                                 || (permissions.indexOf('canAddBranch') >=0) 
                                 || (permissions.indexOf('canAddDepartment') >=0)
                                 || (permissions.indexOf('canAddUser') >=0)) ,  
                actions: [
                  {  title: 'Manage Organization', routerLink: '/admin/organization' , 
                    checkpermission: ((permissions.indexOf('canAddOrganization') >=0) 
                                       || (permissions.indexOf('canRetrieveOrganization') >=0)) },
                  {  title: 'Manage Roles', routerLink: '/admin/role' , 
                    checkpermission: ((permissions.indexOf('canRetrieveRole') >=0) 
                                       || (permissions.indexOf('canAddRole') >=0)) },
                  { title: 'Manage Branch', routerLink: '/admin/branch' , 
                     checkpermission: ((permissions.indexOf('canAddBranch') >=0) 
                                       || (permissions.indexOf('canRetrieveBranch') >=0)) },
                  { title: 'Manage Department', routerLink: '/admin/department', 
                    checkpermission: ((permissions.indexOf('canAddDepartment') >=0) 
                                       || (permissions.indexOf('canRetrieveDepartment') >=0))},
                  { title: 'Manage Sub-department', routerLink: '/admin/sub-department', 
                  checkpermission: ((permissions.indexOf('canAddSubDepartment') >=0) 
                                    || (permissions.indexOf('canRetrieveSubDepartment') >=0))},
                  { title: 'Manage User', routerLink: '/admin/user' , 
                    checkpermission: ((permissions.indexOf('canAddUser') >=0) 
                                       || (permissions.indexOf('canRetrieveUser') >=0)) },
                  // { title: 'Manage Subscription', routerLink: '/admin/inaipi/dashboard/subscription' , 
                  //   checkpermission: ((permissions.indexOf('canAddUser') >=0) 
                  //                     || (permissions.indexOf('canRetrieveUser') >=0)) },
             ]},            
            // INAIPI
            { product: 'INAIPI', checkpermission: ((permissions.indexOf('canSeeCallLogsDashboard') >=0) 
                                                   || (permissions.indexOf('canAddTariff') >=0)
                                                   || (permissions.indexOf('canAddProvider') >=0) 
                                                   || (permissions.indexOf('canAddAssignTariff') >=0)) ,  actions: [
                { title: 'Dashboard', routerLink: '/admin/inaipi/dashboard' , checkpermission: ((permissions.indexOf('canSeeCallLogsDashboard') >=0)) },                    
                { title: 'Setup', routerLink: '/admin/inaipi/setup' , checkpermission: ((permissions.indexOf('canAddTariff') >=0) 
                                                                                                   || (permissions.indexOf('canAddProvider') >=0) 
                                                                                                   || (permissions.indexOf('canAddAssignTariff') >=0)) }
            ]},
         ]; 
    }
}