# Spec Delta

## Purpose

Permite al personal del taller consultar las órdenes de trabajo y hacer avanzar su estado respetando el proceso real de reparación, dejando registro de cada cambio.

## ADDED Requirements

### Requirement: Valid order statuses and transitions
The system SHALL manage exactly eight statuses (`received`, `diagnosing`, `awaiting_approval`, `repairing`, `waiting_parts`, `ready_for_pickup`, `delivered`, `cancelled`) and SHALL only allow the transitions listed in the first two scenarios below.

#### Scenario: Allowed transitions of the early stages
- **WHEN** an order changes status from `received`, `diagnosing` or `awaiting_approval`
- **THEN** only these are accepted: `received` to `diagnosing` or `cancelled`; `diagnosing` to `awaiting_approval` or `cancelled`; `awaiting_approval` to `repairing` or `cancelled`

#### Scenario: Allowed transitions of the repair stages
- **WHEN** an order changes status from `repairing`, `waiting_parts` or `ready_for_pickup`
- **THEN** only these are accepted: `repairing` to `waiting_parts`, `ready_for_pickup` or `cancelled`; `waiting_parts` to `repairing` or `cancelled`; `ready_for_pickup` to `delivered`

#### Scenario: Cancelling during the repair
- **WHEN** an order in `repairing` or `waiting_parts` is changed to `cancelled`
- **THEN** the change is accepted

#### Scenario: Cancelling once the vehicle is ready
- **WHEN** an order in `ready_for_pickup` is changed to `cancelled`
- **THEN** the change is rejected

#### Scenario: Valid transition
- **WHEN** an order in `diagnosing` is changed to `awaiting_approval`
- **THEN** the change is accepted

#### Scenario: Transition that skips the process
- **WHEN** an order in `diagnosing` is changed to `ready_for_pickup`
- **THEN** the change is rejected and the order keeps its status

#### Scenario: Final status
- **WHEN** an order in `delivered` or `cancelled` is changed to any status
- **THEN** the change is rejected

#### Scenario: Same status
- **WHEN** an order is changed to the status it already has
- **THEN** the change is rejected

### Requirement: List orders
The system SHALL expose `GET /api/orders` returning every order as an array of `{ id, code, customerName, vehicle: { brand, model, plate }, status, updatedAt }`.

#### Scenario: Authenticated listing
- **WHEN** an authenticated employee requests `GET /api/orders`
- **THEN** the response is `200` with the array of orders

### Requirement: Get order detail
The system SHALL expose `GET /api/orders/:id` returning `{ id, code, customerName, customerPhone, vehicle, status, updatedAt, history, allowedNextStatuses }`, where `history` is the list of `{ from, to, changedAt }` in chronological order and `allowedNextStatuses` lists the statuses reachable from the current one. The first entry of every history SHALL be the order's intake, `{ from: null, to: "received", changedAt }`, so `from` is `null` only in that entry.

#### Scenario: Existing order
- **WHEN** an authenticated employee requests an existing order
- **THEN** the response is `200` with the order, its history and `allowedNextStatuses`

#### Scenario: Final order
- **WHEN** the order is in `delivered` or `cancelled`
- **THEN** `allowedNextStatuses` is an empty array

#### Scenario: Newly received order
- **WHEN** the order is in `received` and has never changed status
- **THEN** its history has exactly one entry, `{ from: null, to: "received", changedAt }`

#### Scenario: Unknown order
- **WHEN** an authenticated employee requests an id that does not exist
- **THEN** the response is `404` with `{ error: "ORDER_NOT_FOUND", message }`

### Requirement: Change order status
The system SHALL expose `PATCH /api/orders/:id/status` with body `{ "status": "<status>" }`, apply the change only when the transition is valid, append `{ from, to, changedAt }` to the history, update `updatedAt`, and respond `200` with the updated order in the same format as the detail.

#### Scenario: Successful change
- **WHEN** an authenticated employee sends `{ "status": "repairing" }` for an order in `awaiting_approval`
- **THEN** the response is `200`, the order has status `repairing` and the history has a new entry from `awaiting_approval` to `repairing`

#### Scenario: Invalid transition
- **WHEN** the requested transition is not allowed
- **THEN** the response is `422` with `{ error: "INVALID_TRANSITION", message, allowed }`, where `allowed` lists the valid next statuses, and the order is not modified

#### Scenario: Unknown status value
- **WHEN** the body has a `status` that is not one of the eight statuses, or the body has no `status`
- **THEN** the response is `400` with `{ error: "VALIDATION_ERROR", message }` and the order is not modified

#### Scenario: Unknown order
- **WHEN** the order id does not exist
- **THEN** the response is `404` with `{ error: "ORDER_NOT_FOUND", message }`
