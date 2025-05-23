# Ring & Wing Café - Data Flow Diagram (DFD)

This document outlines the Data Flow Diagram for the Ring & Wing Café Point of Sale and Management System. The diagrams use standard DFD notation with process numbers (1.0, 2.0, etc.) to identify different processes and their sub-processes.

## Context Diagram (Level 0)

```
                 ┌───────────────┐
   Orders        │               │  Food/Drinks
 ─────────────► │   Ring & Wing  │ ──────────────►
                 │   Café System  │
 ◄───────────── │               │ ◄──────────────
   Receipt       └───────────────┘  Inventory Updates
      ▲                │
      │                ▼
      │          ┌──────────────┐ 
      └───────── │   Staff      │ 
                 └──────────────┘
                      │  ▲
                      │  │
                      ▼  │
                 ┌──────────────┐
                 │  Management  │
                 └──────────────┘
```

## Level 1 DFD (Main Processes)

```
                              ┌───────────────┐
                              │      3.0      │
                              │   Inventory   │
                              │   Management  │
                              └───┬───────┬───┘
                                  │       │
                                  ▼       │
 ┌───────────────┐          ┌──────────┐  │   ┌───────────────┐
 │      1.0      │ ────────►│    2.0   │  │   │      4.0      │
 │    Order      │◄────────┐│   POS    │◄─┘   │    Kitchen    │
 │   Processing  │         │└──────┬───┘      │    Display    │
 └───┬───────────┘         │       │          └───┬───────────┘
     │                     │       ▼              │
     │                     │  ┌────────────┐      │
     │                     │  │    5.0     │      │
     │                     │  │   Payment  │      │
     │                     │  │  Processing│      │
     │                     │  └────────────┘      │
     │                     │                      │
     └─────────────────────┼──────────────────────┘
                           │
                           ▼
                     ┌────────────┐   ┌────────────┐
                     │    6.0     │   │    7.0     │
                     │  Financial │   │   Staff    │
                     │ Management │◄──┤ Management │
                     └────────────┘   └────────────┘
```

## Level 2 DFD (Detailed Process Breakdowns)

### 1.0 Order Processing

```
┌───────────────┐     ┌────────────────┐
│  Customer UI  │────►│      1.1       │
└───────────────┘     │ Order Creation │──┐
                      └────────────────┘  │
                                          │
┌───────────────┐     ┌────────────────┐  │    ┌───────────────┐
│   MenuItem    │────►│      1.2       │◄─┘───►│     Order     │
│   Database    │     │ Order Validation│      │    Database   │
└───────────────┘     └────────────────┘       └───────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐       ┌───────────────┐
                      │      1.3       │       │    Kitchen    │
                      │ Status Tracking│──────►│     Display   │
                      └────────────────┘       └───────────────┘
```

### 2.0 Point of Sale (POS)

```
┌───────────────┐     ┌────────────────┐       ┌───────────────┐
│   Customer    │────►│      2.1       │──────►│    MenuItem   │
└───────────────┘     │  Menu Display  │       │    Database   │
                      └────────────────┘       └───────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐       ┌───────────────┐
                      │      2.2       │       │     Order     │
                      │ Cart Management│──────►│    Database   │
                      └────────────────┘       └───────────────┘
                              │
                              │
                              ▼
┌───────────────┐     ┌────────────────┐
│    Payment    │◄────┤      2.3       │
│    Gateway    │     │Checkout Process│
└───────────────┘     └────────────────┘
```

### 3.0 Inventory Management

```
┌───────────────┐     ┌────────────────┐       ┌───────────────┐
│    Vendor     │────►│      3.1       │──────►│    Vendor     │
│    Input      │     │Vendor Management│      │    Database   │
└───────────────┘     └────────────────┘       └───────────────┘
                              │
                              │
                              ▼
┌───────────────┐     ┌────────────────┐       ┌───────────────┐
│   Inventory   │────►│      3.2       │──────►│   Inventory   │
│    Input      │     │Stock Management│       │    Database   │
└───────────────┘     └────────────────┘       └───────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐
                      │      3.3       │
                      │ Stock Alerts & │
                      │   Reporting    │
                      └────────────────┘
```

### 4.0 Kitchen Display System

```
┌───────────────┐     ┌────────────────┐
│     Order     │────►│      4.1       │
│    Database   │     │  Order Queue   │
└───────────────┘     └────────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐
                      │      4.2       │
                      │ Status Updates │
                      └────────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐       ┌───────────────┐
                      │      4.3       │──────►│     Order     │
                      │ Order Completion│      │    Database   │
                      └────────────────┘       └───────────────┘
```

### 5.0 Payment Processing

```
┌───────────────┐     ┌────────────────┐
│  Order Data   │────►│      5.1       │
└───────────────┘     │ Payment Methods│
                      └────────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐       ┌───────────────┐
                      │      5.2       │◄──────┤    Payment    │
                      │Transaction Proc│       │    Gateway    │
                      └────────────────┘       └───────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐       ┌───────────────┐
                      │      5.3       │──────►│    Receipt    │
                      │Receipt Generation│     │    Output     │
                      └────────────────┘       └───────────────┘
```

### 6.0 Financial Management

```
┌───────────────┐     ┌────────────────┐       ┌───────────────┐
│   Expense     │────►│      6.1       │──────►│    Expense    │
│    Input      │     │Expense Tracking│       │    Database   │
└───────────────┘     └────────────────┘       └───────────────┘
                              │
                              │
                              ▼
┌───────────────┐     ┌────────────────┐       ┌───────────────┐
│   Sales Data  │────►│      6.2       │──────►│    Revenue    │
└───────────────┘     │Revenue Tracking│       │    Database   │
                      └────────────────┘       └───────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐
                      │      6.3       │
                      │Financial Reports│
                      └────────────────┘
```

### 7.0 Staff Management

```
┌───────────────┐     ┌────────────────┐       ┌───────────────┐
│   Staff UI    │────►│      7.1       │──────►│ User/Staff DB │
└───────────────┘     │User Registration│      └───────────────┘
                      └────────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐       ┌───────────────┐
                      │      7.2       │◄──────┤   Time Log    │
                      │Time Clock System│      │    Input      │
                      └────────────────┘       └───────────────┘
                              │
                              │
                              ▼
                      ┌────────────────┐       ┌───────────────┐
                      │      7.3       │──────►│    Payroll    │
                      │Payroll Processing│     │    Database   │
                      └────────────────┘       └───────────────┘
```

## Data Stores

1. **User/Staff DB** - Stores user accounts, staff profiles, and authentication data
2. **MenuItem Database** - Stores menu items, categories, pricing, and modifiers
3. **Order Database** - Stores current and historical orders
4. **Inventory Database** - Stores inventory items, quantities, and expiration dates
5. **Vendor Database** - Stores vendor information and contact details
6. **Expense Database** - Stores expense records and categories
7. **Revenue Database** - Stores sales and revenue data
8. **Payroll Database** - Stores staff payroll records and calculations

## External Entities

1. **Customer** - End users who place orders
2. **Staff** - Employees who use the system for various functions
3. **Management** - Administrative users who oversee operations
4. **Payment Gateway** - External payment processing services
5. **Vendor** - Suppliers of inventory items

## Data Flows

1. Menu items → POS → Order processing
2. Order data → Kitchen display → Staff
3. Inventory data → Stock management → Alerts
4. Staff time logs → Payroll processing → Financial management
5. Payment data → Transaction processing → Revenue reports
6. Order completion → Status updates → Customer
7. Self-checkout orders → POS → Revenue reports
8. Chatbot orders → POS → Revenue reports

This DFD represents the high-level architecture of the Ring & Wing Café system with proper numbering convention (1.0, 2.0, etc.) for processes and sub-processes.
