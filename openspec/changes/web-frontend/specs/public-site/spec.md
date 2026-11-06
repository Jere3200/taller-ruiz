# Spec Delta

## Purpose

Presenta el taller al público y permite a un cliente consultar el estado de su reparación con un código, sin iniciar sesión y sin ver datos personales.

## ADDED Requirements

### Requirement: Landing page
The site SHALL serve a public landing at `/` that presents the workshop, its services, how tracking works, contact details and a way to start a tracking query.

#### Scenario: Visitor starts a query from the landing
- **WHEN** a visitor types a code in the landing field and submits
- **THEN** the site navigates to `/seguimiento` with that code prefilled and the query already performed

#### Scenario: Access for employees
- **WHEN** a visitor looks for the staff entrance
- **THEN** the landing offers a link to `/login`

### Requirement: Tracking query page
The site SHALL serve `/seguimiento`, which asks for a tracking code, queries the public tracking endpoint and shows the vehicle, the masked plate, the current status, a progress indicator of the repair stages and the status history.

#### Scenario: Existing code
- **WHEN** the visitor submits a code that exists
- **THEN** the page shows the vehicle, the masked plate, the current status highlighted, the progress indicator marking the current stage and the history with dates

#### Scenario: Code from the address
- **WHEN** the page is opened as `/seguimiento?codigo=TR-1042`
- **THEN** the query is performed without asking the visitor to type the code again

#### Scenario: Unknown code
- **WHEN** the code does not exist
- **THEN** the page shows "No encontramos una orden con ese código. Revisá que esté bien escrito." and no order data

#### Scenario: Cancelled order
- **WHEN** the order status is `cancelled`
- **THEN** the progress indicator is replaced by a notice that the order was cancelled

#### Scenario: Empty submission
- **WHEN** the visitor submits without typing a code
- **THEN** the page asks for a code and does not call the API

#### Scenario: Too many queries
- **WHEN** the API answers `429`
- **THEN** the page tells the visitor to wait a moment before trying again

#### Scenario: API unavailable
- **WHEN** the API cannot be reached
- **THEN** the page shows a generic error message with the option to retry and no technical detail

### Requirement: No personal data on public pages
Public pages SHALL NOT show the customer's name, phone, the full license plate or internal order ids.

#### Scenario: Inspecting the tracking result
- **WHEN** the tracking result is rendered
- **THEN** the page contains the masked plate only and none of the customer's personal data

### Requirement: Mobile first
The landing and the tracking page SHALL be usable on a phone-sized screen without horizontal scrolling.

#### Scenario: Narrow screen
- **WHEN** the viewport is 360 px wide
- **THEN** all content is reachable without horizontal scrolling
