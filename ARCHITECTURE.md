# CodeCollab - System Architecture

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                  │
│                                                                       │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────────┐     │
│  │   Browser   │───▶│ React 18 SPA │───▶│  Monaco Editor     │     │
│  │  (Chrome)   │    │   (Port 3000)│    │  (Code Editing)    │     │
│  └─────────────┘    └──────────────┘    └────────────────────┘     │
│          │                                                            │
│          │ HTTP/REST + JSON                                          │
│          ▼                                                            │
└──────────────────────────────────────────────────────────────────────┘
           │
           │
┌──────────▼───────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                                │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │          Spring Boot Backend (Port 8083)                 │        │
│  │                                                          │        │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐│        │
│  │  │   Security   │─▶│  Controllers  │─▶│   Services   ││        │
│  │  │  (JWT/OAuth) │  │  (REST API)   │  │  (Business)  ││        │
│  │  └──────────────┘  └───────────────┘  └──────────────┘│        │
│  │          │                │                    │         │        │
│  │          └────────────────┼────────────────────┘         │        │
│  │                           │                              │        │
│  │                  ┌────────▼────────┐                    │        │
│  │                  │   Repositories   │                    │        │
│  │                  │   (Data Access)  │                    │        │
│  │                  └─────────────────┘                    │        │
│  └─────────────────────────────────────────────────────────┘        │
│                           │         │                                │
└───────────────────────────┼─────────┼────────────────────────────────┘
                            │         │
                            │         │
        ┌───────────────────┘         └──────────────────┐
        │                                                 │
        ▼                                                 ▼
┌──────────────────┐                          ┌──────────────────────┐
│  DATA LAYER      │                          │  EXECUTION LAYER     │
│                  │                          │                      │
│  PostgreSQL 13   │                          │   Judge0 Stack       │
│  (Port 5432)     │                          │   (Port 2358)        │
│                  │                          │                      │
│  ┌────────────┐  │                          │  ┌────────────────┐ │
│  │   users    │  │                          │  │  Judge0 Server │ │
│  │  problems  │  │                          │  │                │ │
│  │   rooms    │  │                          │  │  ┌──────────┐  │ │
│  │  test_cases│  │                          │  │  │  Redis   │  │ │
│  └────────────┘  │                          │  │  │  Queue   │  │ │
│                  │                          │  │  └──────────┘  │ │
└──────────────────┘                          │  │                │ │
                                              │  │  ┌──────────┐  │ │
                                              │  │  │PostgreSQL│  │ │
                                              │  │  │(Internal)│  │ │
                                              │  │  └──────────┘  │ │
                                              │  └────────────────┘ │
                                              │                      │
                                              │  ┌────────────────┐ │
                                              │  │   Worker 1     │ │
                                              │  │   Worker 2     │ │
                                              │  │   Worker 3     │ │
                                              │  │  (Executors)   │ │
                                              │  └────────────────┘ │
                                              └──────────────────────┘
```

## Component Descriptions

### 1. **Client Layer** - User Interface
- **Technology**: React 18 Single Page Application
- **Responsibility**: 
  - Render UI components (problem lists, code editor, results)
  - Manage client-side state (authentication, room context)
  - Handle user interactions and form submissions
  - Display real-time updates via polling
- **Key Libraries**: Monaco Editor (VS Code editor), Tailwind CSS (styling), Axios (HTTP)

### 2. **Application Layer** - Business Logic
- **Technology**: Spring Boot 3.2 with Java 17
- **Components**:
  - **Security Filter**: JWT token validation, OAuth2 integration
  - **Controllers**: RESTful endpoints for auth, problems, code execution, rooms
  - **Services**: Business logic (user management, room management, code execution orchestration)
  - **Repositories**: JPA/Hibernate data access layer
- **Responsibility**:
  - Authenticate and authorize users
  - Validate incoming requests
  - Orchestrate code execution workflow
  - Manage room sessions and member coordination
  - Transaction management for data consistency

### 3. **Data Layer** - Persistent Storage
- **Technology**: PostgreSQL 13
- **Schema**: 5 main tables (users, problems, rooms, room_members, test_cases)
- **Responsibility**:
  - Store user accounts and profiles
  - Maintain problem library and test cases
  - Track room state and member activity
  - ACID compliance for critical operations

### 4. **Execution Layer** - Code Sandbox
- **Technology**: Judge0 CE (Community Edition) with Docker
- **Components**:
  - **Judge0 Server**: API gateway for submissions
  - **Redis Queue**: Job queue management
  - **Workers (3x)**: Parallel code execution in isolated containers
  - **Internal PostgreSQL**: Submission tracking
- **Responsibility**:
  - Execute untrusted code securely in sandboxes
  - Apply resource limits (CPU, memory, time)
  - Return execution results (stdout, stderr, status)
  - Prevent malicious code from affecting system

## Data Flow Diagrams

### Flow 1: User Registration & Authentication
```
[User] ─(1. Submit Form)─▶ [Frontend]
                              │
                              │ (2. POST /api/auth/register)
                              ▼
                          [Backend Security Filter]
                              │
                              │ (3. Hash Password)
                              ▼
                          [UserService]
                              │
                              │ (4. Save User)
                              ▼
                          [PostgreSQL]
                              │
                              │ (5. Return User + JWT Token)
                              ▼
                          [Frontend]
                              │
                              │ (6. Store Token in LocalStorage)
                              ▼
                          [Authenticated Session]
```

### Flow 2: Code Submission & Execution
```
[User] ─(1. Click Submit)─▶ [Monaco Editor]
                              │
                              │ (2. POST /api/code/submit)
                              │    {problemId, code, language}
                              ▼
                          [CodeExecutionController]
                              │
                              │ (3. Get Test Cases)
                              ▼
                          [ProblemService] ──▶ [PostgreSQL]
                              │
                              │ (4. For Each Test Case)
                              ▼
                          [CodeExecutionService]
                              │
                              │ (5. Submit to Judge0 - Async)
                              │    POST /submissions?wait=false
                              ▼
                          [Judge0 API]
                              │
                              │ (6. Queue in Redis)
                              ▼
                          [Redis Queue] ───▶ [Worker picks job]
                              │                     │
                              │                     │ (7. Execute in Sandbox)
                              │                     ▼
                              │              [Docker Container]
                              │                     │
                              │                     │ (8. Return Result)
                              │◀────────────────────┘
                              │
                              │ (9. Poll for result)
                              │    GET /submissions/{token}
                              ▼
                          [Judge0 API]
                              │
                              │ (10. Aggregate Results)
                              ▼
                          [CodeExecutionService]
                              │
                              │ (11. Return to Frontend)
                              │    {status, passed, total, details}
                              ▼
                          [Frontend ResultsModal]
```

### Flow 3: Room Session Management
```
[Host User] ─(1. Create Room)─▶ [Frontend]
                                   │
                                   │ (2. POST /api/rooms/create)
                                   ▼
                               [RoomController]
                                   │
                                   │ (3. Generate Room Code)
                                   ▼
                               [RoomService]
                                   │
                                   │ (4. Save Room + Add Host as Member)
                                   ▼
                               [PostgreSQL: rooms, room_members]
                                   │
                                   │ (5. Return Room Details)
                                   ▼
                               [Frontend: Room Lobby]
                                   │
[Other Users] ─(6. Join via Code)─┤
                                   │
                                   │ (7. POST /api/rooms/join)
                                   ▼
                               [RoomController]
                                   │
                                   │ (8. Validate & Add Member)
                                   ▼
                               [RoomService]
                                   │
                                   │ (9. Update Room Count)
                                   ▼
                               [PostgreSQL]
                                   │
                                   │ (10. Poll for Updates)
                                   │     GET /api/rooms/{code}
                                   ▼
                               [Frontend: Live Member List]
                                   │
[Host] ─(11. Start Session)────────┤
                                   │
                                   │ (12. POST /api/rooms/{code}/start)
                                   │     {problemId, timeLimit}
                                   ▼
                               [RoomService]
                                   │
                                   │ (13. Set Status=ACTIVE, Load Problem)
                                   ▼
                               [PostgreSQL]
                                   │
                                   │ (14. All Members Redirect)
                                   ▼
                               [Frontend: Active Workspace]
```

## Key Design Decisions

### 1. **Asynchronous Code Execution**
**Decision**: Use Judge0's async API (`wait=false`) with token-based polling instead of synchronous execution.

**Rationale**:
- Prevents HTTP timeout on long-running code
- Allows parallel test case processing
- Better resource utilization

**Trade-off**: Adds complexity with polling logic, but gains reliability.

### 2. **Parallel Test Case Execution**
**Decision**: Execute test cases concurrently using Java's ThreadPoolExecutor (8 threads).

**Rationale**:
- Reduces total execution time by 70%
- Leverages Judge0's multiple workers
- Improves user experience with faster feedback

**Trade-off**: Higher memory usage on backend, but acceptable for our scale.

### 3. **Polling vs WebSockets for Room Updates**
**Decision**: Use 3-second HTTP polling instead of WebSockets.

**Rationale**:
- Simpler implementation and debugging
- Sufficient for our update frequency
- Easier to deploy (no WebSocket infrastructure)

**Trade-off**: Higher latency (3s vs real-time), but acceptable for room coordination.

### 4. **JWT Over Session-Based Auth**
**Decision**: Stateless JWT tokens instead of server-side sessions.

**Rationale**:
- Enables horizontal scaling (no session store needed)
- Mobile-friendly (easy to store tokens)
- Reduces backend memory footprint

**Trade-off**: Cannot revoke tokens easily, but expiry handles this.

### 5. **Docker Sandbox Isolation**
**Decision**: Run Judge0 with full Docker isolation instead of lightweight alternatives.

**Rationale**:
- Security: Prevents malicious code from affecting host
- Resource control: Enforces CPU/memory limits
- Consistency: Same execution environment for all users

**Trade-off**: Higher overhead, but security is paramount.

## Scalability Strategy

### Current Capacity
- **Backend**: Single instance handles 50 concurrent users
- **Judge0**: 3 workers process 30-45 submissions/minute
- **Database**: 100 connections, can scale to 500+

### Horizontal Scaling Plan
1. **Backend**: Deploy multiple instances behind load balancer (stateless design)
2. **Database**: Add read replicas for problem/test case queries (read-heavy)
3. **Judge0**: Increase worker count or add more Judge0 server instances
4. **Caching**: Add Redis for frequently accessed problems

### Bottleneck Analysis
- **Current**: Judge0 workers (CPU-bound)
- **Solution**: Add 3-6 more workers for 2-3x throughput
- **Future**: If DB becomes bottleneck, shard by problem category

## Security Considerations

1. **Code Execution**: Docker sandboxing prevents escape
2. **Authentication**: JWT with 24-hour expiry, bcrypt password hashing
3. **SQL Injection**: Parameterized queries via JPA
4. **XSS**: React auto-escapes, CSP headers recommended
5. **CORS**: Restricted to frontend origin only
6. **Rate Limiting**: Judge0 has built-in limits

## Monitoring & Observability

**Implemented**:
- Console logging for key operations
- Exception stack traces
- Judge0 connection health checks

**Recommended for Production**:
- Spring Boot Actuator for metrics
- ELK stack for centralized logging
- Prometheus + Grafana for real-time monitoring
- Sentry for error tracking