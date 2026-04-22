# Extended Roles and Reports Features

## Goal Description
1. **Roles:** Extend the "Add Worker" functionality to allow selecting different roles (e.g., MANAGER, TECHNICIAN, OPERATOR) instead of hardcoding "TECHNICIAN".
2. **Reports:** Enhance the Reports dashboard panel by adding sections for specific machine states: "Machines for Repair", "New Machines (Purchases)", and "Scrapped Machines". Users should be able to view, edit, and create records directly inside these sections.

## Proposed Changes

### Backend API
#### [MODIFY] [users.routes.js](file:///d:/Induatial-management/src/modules/users/users.routes.js)
- Allow reading `role` from the `req.body` in the `POST /api/v1/users` route.
- Validate the role against an allowed list: `['MANAGER', 'TECHNICIAN', 'OPERATOR']`.
- Provide `role` as the fourth parameter to the `INSERT` query.

### Frontend API Client
#### [MODIFY] [api.js](file:///d:/Induatial-management/files/js/api.js)
- Update [workerCreate](file:///d:/Induatial-management/files/js/api.js#22-23) signature to accept the `role` field.

### Frontend Dashboard
#### [MODIFY] [admin-dashboard.html](file:///d:/Induatial-management/files/pages/admin-dashboard.html)
- **Roles in Add Worker:** Update `showWorkerModal()` to include a `<select>` dropdown for the user's role: Manager, Technician, or Operator. Pass the selected role to `api.workerCreate()`.
- **Reports Navigation:** Add sub-navigation "pills" at the top of the `#panel-reports` div to switch between different views:
  - **Overview (Charts):** The existing pie and bar charts.
  - **Repairs:** A table displaying machines with the `IN_REPAIR` status. Includes an "Add Repair" button (which routes to `showEqModal` or `editEquipment` directly to set a machine to `IN_REPAIR`).
  - **Purchases:** A table displaying machines recently added. Includes a "Buy Machine" button (which is exactly `showEqModal()` to create a new machine).
  - **Scrapped:** A table displaying machines with the `SCRAPPED` status. Includes a "Scrap Machine" button functionality.
- Implement JavaScript logic to filter the existing [equipment](file:///d:/Induatial-management/files/js/api.js#28-29) list for each of these tabs and render rows appropriately with Edit/Scrap action buttons.

## Verification Plan

### Manual Verification
1. Open the "Add Worker" modal and verify the Role dropdown exists. Submit a new user with the "OPERATOR" role, and verify they appear in the Workers table with the "OPERATOR" role.
2. Open the "Reports" tab and verify the new sub-navigation pills exist.
3. Click on the "Purchases" tab, click "Buy Machine", add a new machine, and see it populate.
4. Click on the "Repairs" tab, ensure any machine with `IN_REPAIR` status appears here, and edit one back to `OPTIMAL` to see it disappear from the list.
5. Click on the "Scrapped" tab, ensure scraped machines appear here.
