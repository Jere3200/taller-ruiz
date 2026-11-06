# Spec Delta

## Purpose

Permite a un cliente conocer el estado de su reparación con un código de seguimiento, sin iniciar sesión y sin exponer sus datos personales.

## ADDED Requirements

### Requirement: Public tracking lookup
The system SHALL expose `GET /api/tracking/:code` without authentication, returning `{ code, vehicle: { brand, model, plateMasked }, status, updatedAt, history }` for the order with that code, where `history` is the list of `{ from, to, changedAt }`, whose first entry is the intake `{ from: null, to: "received", changedAt }`.

#### Scenario: Existing code
- **WHEN** anyone requests the tracking of an existing code
- **THEN** the response is `200` with the data above

#### Scenario: Unknown code
- **WHEN** the code does not match any order
- **THEN** the response is `404` with `{ error: "ORDER_NOT_FOUND", message }`

#### Scenario: Code case
- **WHEN** the code is sent in lowercase
- **THEN** it is matched ignoring case

### Requirement: No personal data in public responses
The public tracking response SHALL NOT include the customer's name, phone, the full license plate or the internal order id, and the plate SHALL be shown masked as three asterisks followed by its last three characters.

#### Scenario: Masked plate
- **WHEN** the order has plate `AB123CD`
- **THEN** `plateMasked` is `***3CD`

#### Scenario: Field leakage
- **WHEN** the tracking response of any order is inspected
- **THEN** it contains none of `customerName`, `customerPhone`, `plate` or `id`

### Requirement: Abuse protection on tracking
The system SHALL limit the number of public tracking and login requests per client within a time window, and SHALL respond `429` with `{ error: "TOO_MANY_REQUESTS", message }` when the limit is exceeded, to make guessing codes or passwords impractical.

#### Scenario: Limit exceeded
- **WHEN** one client exceeds the allowed number of tracking requests in the window
- **THEN** further requests receive `429` until the window ends
