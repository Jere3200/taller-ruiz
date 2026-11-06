# Spec Delta

## Purpose

Permite a los empleados del taller iniciar sesión, ver las órdenes de trabajo y hacer avanzar su estado desde una interfaz, respetando las reglas que impone la API.

## ADDED Requirements

### Requirement: Employee login screen
The site SHALL serve `/login` with username and password fields, validate that both are filled before sending, call the login endpoint and keep the session for the browser tab only.

#### Scenario: Successful login
- **WHEN** the employee submits valid credentials
- **THEN** the site stores the session for that tab and navigates to `/panel`

#### Scenario: Wrong credentials
- **WHEN** the API answers `401`
- **THEN** the screen shows "Usuario o contraseña incorrectos." without saying which field failed

#### Scenario: Empty fields
- **WHEN** the employee submits with an empty username or password
- **THEN** the screen shows which field is missing and does not call the API

#### Scenario: Submission in progress
- **WHEN** the login request is pending
- **THEN** the submit button is disabled and shows a loading indicator

#### Scenario: Closing the tab
- **WHEN** the browser tab is closed
- **THEN** the session is gone and a new visit requires login again

### Requirement: Protected area
The routes under `/panel` SHALL only be available to a logged-in employee.

#### Scenario: No session
- **WHEN** a visitor without session opens any `/panel` route
- **THEN** the site redirects to `/login`

#### Scenario: Session rejected by the API
- **WHEN** any internal request is answered with `401`
- **THEN** the session is cleared and the site redirects to `/login` with the notice "Tu sesión expiró. Ingresá de nuevo."

#### Scenario: Logout
- **WHEN** the employee chooses "Cerrar sesión"
- **THEN** the session is cleared and the site redirects to `/login`

### Requirement: Orders board
The site SHALL serve `/panel` with a summary of orders by group (en diagnóstico, en reparación, esperando repuestos, listas para retirar), a searchable and filterable list of orders, and a switch between a column view by status and a table view.

#### Scenario: Summary counts
- **WHEN** the orders load
- **THEN** each summary card shows how many orders are in its status

#### Scenario: Search
- **WHEN** the employee types a plate, a code or a customer name
- **THEN** only the matching orders are shown, ignoring case and accents

#### Scenario: Filter by status
- **WHEN** the employee chooses a status filter
- **THEN** only orders in that status are shown

#### Scenario: No matches
- **WHEN** no order matches the search and filter
- **THEN** the board shows "No hay órdenes con ese criterio."

#### Scenario: Loading and failure
- **WHEN** the orders are loading or the request fails
- **THEN** the board shows a loading placeholder or a visible error with the option to retry

### Requirement: Order detail and status change
The site SHALL serve `/panel/ordenes/:id` showing the order, the vehicle, the customer's name and phone, the current status, the status history as a timeline and one button per status in `allowedNextStatuses`, and nothing else for changing status.

#### Scenario: Only valid next statuses are offered
- **WHEN** the detail loads for an order in `diagnosing`
- **THEN** the buttons offered are "En espera de aprobación" and "Cancelado" style actions for exactly `awaiting_approval` and `cancelled`, and no others

#### Scenario: Final order
- **WHEN** `allowedNextStatuses` is empty
- **THEN** the page shows "Orden finalizada" and no change buttons

#### Scenario: Confirmation for irreversible changes
- **WHEN** the employee chooses `cancelled` or `delivered`
- **THEN** a confirmation dialog is shown and the change is only sent after the employee confirms

#### Scenario: Successful change
- **WHEN** the API answers `200` to a status change
- **THEN** the page shows a success notice and renders the order returned by the API, without updating before the answer arrives

#### Scenario: Rejected change
- **WHEN** the API answers `422`
- **THEN** the page shows the API message in an error notice and keeps showing the previous state

#### Scenario: Copy tracking link
- **WHEN** the employee chooses "Copiar link de seguimiento"
- **THEN** the link `/seguimiento?codigo=<code>` is copied and the page confirms it

#### Scenario: Unknown order
- **WHEN** the API answers `404`
- **THEN** the page shows that the order was not found with a link back to the board
