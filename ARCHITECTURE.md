## CodeCollab - System Architecture Documentation

Table of Contents

Architecture Overview
System Components
Data Flow Diagrams
Technology Stack
Database Schema
API Design
Security Architecture
Deployment Architecture

## 1. Architecture Overview

CodeCollab follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│                    (React SPA - Port 3001)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST + JWT
┌────────────────────────────▼────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│              (Spring Boot Backend - Port 8083)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Controllers  │  │   Services   │  │    Repositories      │   │
│  │ (REST APIs)  │─▶│ (Business)   │─▶│   (Data Access)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ JDBC
┌────────────────────────────▼────────────────────────────────────┐
│                      DATA LAYER                                 │
│                   (MySQL Database - Port 3306)                  │
│         ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│         │  Users  │  │ Problems│  │  Rooms  │                   │
│         └─────────┘  └─────────┘  └─────────┘                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              EXECUTION LAYER (Microservices)                    │
│           (Judge0 + Redis + PostgreSQL - Docker)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Judge0 API  │─▶│ Redis Queue  │─▶│   3x Workers        │   │
│  │ (Port 2358)  │  │              │  │ (Code Execution)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Stateless Backend**: All application state stored in database, enabling horizontal scaling
2. **RESTful APIs**: Standard HTTP methods and status codes for predictable interactions
3. **Separation of Concerns**: Clear boundaries between presentation, business logic, and data access
4. **Containerization**: Judge0 services isolated in Docker for security and portability
5. **Token-Based Auth**: JWT tokens eliminate server-side session storage

---

## 2. System Components

### 2.1 Frontend Architecture (React)

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication UI
│   │   │   ├── AuthModal.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── OAuthCallback.jsx
│   │   │   └── OAuthSuccess.jsx
│   │   │
│   │   ├── editor/            # Code editing
│   │   │   └── CodeEditor.jsx (Monaco integration)
│   │   │
│   │   ├── problem/           # Problem display
│   │   │   ├── ProblemList.jsx
│   │   │   └── ProblemDetail.jsx
│   │   │
│   │   ├── room/              # Collaborative features
│   │   │   ├── CreateRoomModal.jsx
│   │   │   ├── JoinRoomModal.jsx
│   │   │   ├── RoomLobby.jsx
│   │   │   ├── ActiveSessionWorkspace.jsx
│   │   │   └── ProblemSelectionModal.jsx
│   │   │
│   │   └── common/            # Shared components
│   │       └── ResultsModal.jsx
│   │
│   ├── context/               # Global state management
│   │   ├── AuthContext.js     (User authentication state)
│   │   └── RoomContext.js     (Room session state)
│   │
│   ├── services/              # API integration
│   │   └── api.js             (Axios client configuration)
│   │
│   ├── App.js                 # Main routing logic
│   └── AppContent.js          # Application layout
```

**Key Frontend Patterns:**
- **Context API**: Global state shared via `useAuth()` and `useRoom()` hooks
- **Custom Hooks**: Encapsulate API calls and state logic
- **Component Composition**: Reusable UI components with props-based configuration
- **Polling Mechanism**: 3-second intervals for room state synchronization

### 2.2 Backend Architecture (Spring Boot)

```
backend/
├── src/main/java/com/codecollab/v1/
│   ├── controller/            # REST endpoints
│   │   ├── AuthController.java
│   │   ├── ProblemController.java
│   │   ├── CodeExecutionController.java
│   │   └── RoomController.java
│   │
│   ├── service/               # Business logic
│   │   ├── UserService.java
│   │   ├── ProblemService.java
│   │   ├── CodeExecutionService.java
│   │   └── RoomService.java
│   │
│   ├── repository/            # Data access (Spring Data JPA)
│   │   ├── UserRepository.java
│   │   ├── ProblemRepository.java
│   │   ├── TestCaseRepository.java
│   │   ├── RoomRepository.java
│   │   └── RoomMemberRepository.java
│   │
│   ├── entity/                # JPA entities
│   │   ├── User.java
│   │   ├── Problem.java
│   │   ├── TestCase.java
│   │   ├── Room.java
│   │   └── RoomMember.java
│   │
│   ├── dto/                   # Data transfer objects
│   │   ├── AuthRequest.java / AuthResponse.java
│   │   ├── CodeSubmissionRequest.java
│   │   ├── ExecutionResult.java
│   │   ├── CreateRoomRequest.java
│   │   ├── RoomResponse.java
│   │   └── RoomSessionResponse.java
│   │
│   ├── config/                # Spring configuration
│   │   ├── SecurityConfig.java     (JWT + OAuth2)
│   │   ├── WebClientConfig.java    (Judge0 client)
│   │   └── AsyncConfig.java        (Thread pool)
│   │
│   ├── util/                  # Utilities
│   │   └── JwtUtil.java       (Token generation/validation)
│   │
│   └── CodecollabBackendApplication.java
```

**Key Backend Patterns:**
- **Repository Pattern**: Data access abstraction via Spring Data JPA
- **Service Layer Pattern**: Business logic separated from controllers
- **DTO Pattern**: Entity-to-API response transformation
- **Dependency Injection**: Constructor-based injection for testability
- **Exception Handling**: Centralized error responses

### 2.3 Code Execution Layer (Judge0)

```
Docker Compose Services:
┌─────────────────────────────────────────────────────────────┐
│  postgres:13                                                │
│    - Judge0 metadata storage                                │
│    - Port: 5432 (internal)                                  │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│  redis:6                                                    │
│    - Job queue management                                   │
│    - Max memory: 512MB with LRU eviction                    │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│  judge0server:1.13.0                                        │
│    - REST API (Port 2358 → exposed)                         │
│    - Submission endpoint: POST /submissions                 │
│    - Polling endpoint: GET /submissions/{token}             │
│    - Resource limits: CPU 3s, Memory 256MB                  │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌──────▼───────┐
│ judge0worker1│  │ judge0worker2│  │ judge0worker3│
│  (privileged)│  │  (privileged)│  │  (privileged)│
│  Executes    │  │  Executes    │  │  Executes    │
│  user code   │  │  user code   │  │  user code   │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Execution Flow:**
1. Backend submits code to Judge0 API (`POST /submissions`)
2. Judge0 server pushes job to Redis queue
3. Available worker picks job from queue
4. Worker executes code in sandboxed container
5. Worker stores result in PostgreSQL
6. Backend polls for completion (`GET /submissions/{token}`)

---

## 3. Data Flow Diagrams

### 3.1 User Authentication Flow

```
┌─────────┐                 ┌─────────┐                 ┌──────────┐
│  User   │                 │ Backend │                 │ Database │
└────┬────┘                 └────┬────┘                 └─────┬────┘
     │                           │                            │
     │  POST /api/auth/register  │                            │
     ├──────────────────────────▶│                            │
     │  {username, email, pwd}   │                            │
     │                           │                            │
     │                           │  Check if user exists      │
     │                           ├───────────────────────────▶│
     │                           │                            │
     │                           │◀───────────────────────────┤
     │                           │  User not found            │
     │                           │                            │
     │                           │  Hash password (BCrypt)    │
     │                           │                            │
     │                           │  INSERT INTO users         │
     │                           ├───────────────────────────▶│
     │                           │                            │
     │                           │◀───────────────────────────┤
     │                           │  User created              │
     │                           │                            │
     │                           │  Generate JWT token        │
     │                           │                            │
     │◀──────────────────────────┤                            │
     │  {token, user, message}   │                            │
     │                           │                            │
     │  Store token in           │                            │
     │  localStorage             │                            │
     │                           │                            │
```

### 3.2 Code Submission Flow

```
┌──────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ User │     │Frontend │     │ Backend │     │ Judge0  │
└──┬───┘     └────┬────┘     └────┬────┘     └────┬────┘
   │              │               │               │
   │  Click Submit│               │               │
   ├─────────────▶│               │               │
   │              │               │               │
   │              │  POST /api/code/submit        │
   │              ├──────────────▶│               │
   │              │  {problemId,  │               │
   │              │   code, lang} │               │
   │              │               │               │
   │              │               │  Fetch test   │
   │              │               │  cases from   │
   │              │               │  database     │
   │              │               │               │
   │              │               │  For each TC: │
   │              │               ├──────────────▶│
   │              │               │  POST /       │
   │              │               │  submissions  │
   │              │               │               │
   │              │               │◀──────────────┤
   │              │               │  {token}      │
   │              │               │               │
   │              │               │  Poll for     │
   │              │               │  result       │
   │              │               ├──────────────▶│
   │              │               │  GET /        │
   │              │               │  submissions/ │
   │              │               │  {token}      │
   │              │               │               │
   │              │               │◀──────────────┤
   │              │               │  {status,     │
   │              │               │   stdout}     │
   │              │               │               │
   │              │               │  Compare      │
   │              │               │  stdout with  │
   │              │               │  expected     │
   │              │               │               │
   │              │◀──────────────┤               │
   │              │  {status: AC, │               │
   │              │   passed: 3/3}│               │
   │              │               │               │
   │◀─────────────┤               │               │
   │  Display     │               │               │
   │  results     │               │               │
   │              │               │               │
```

### 3.3 Room Session Flow

```
┌──────┐  ┌──────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
│Host  │  │Member│  │ Backend │  │ Database │  │ Frontend │
└──┬───┘  └──┬───┘  └────┬────┘  └─────┬────┘  └─────┬────┘
   │         │           │              │             │
   │ Create Room         │              │             │
   ├────────────────────▶│              │             │
   │  POST /rooms/create │              │             │
   │                     │              │             │
   │                     │  Generate    │             │
   │                     │  room code   │             │
   │                     │              │             │
   │                     │  INSERT room │             │
   │                     ├─────────────▶│             │
   │                     │              │             │
   │                     │  INSERT host │             │
   │                     │  as member   │             │
   │                     ├─────────────▶│             │
   │                     │              │             │
   │◀────────────────────┤              │             │
   │  {roomCode: ABC123} │              │             │
   │                     │              │             │
   │  Share room code    │              │             │
   ├────────────────────────────────────┼─────────────▶
   │  "Join ABC123"      │              │             │
   │                     │              │             │
   │         │  Join Room│              │             │
   │         ├──────────▶│              │             │
   │         │           │  Verify room │             │
   │         │           │  exists and  │             │
   │         │           │  not full    │             │
   │         │           ├─────────────▶│             │
   │         │           │              │             │
   │         │           │  INSERT      │             │
   │         │           │  member      │             │
   │         │           ├─────────────▶│             │
   │         │           │              │             │
   │         │◀──────────┤              │             │
   │         │  {room    │              │             │
   │         │   details}│              │             │
   │         │           │              │             │
   │  Both poll every 3s │              │             │
   ├────────────────────▶│              │             │
   │  GET /rooms/ABC123  │              │             │
   │         ├──────────▶│              │             │
   │         │           ├─────────────▶│             │
   │         │           │  Fetch room  │             │
   │         │           │  + members   │             │
   │         │           │              │             │
   │  Start Session      │              │             │
   ├────────────────────▶│              │             │
   │  POST /rooms/       │              │             │
   │  ABC123/start       │              │             │
   │  {problemId: 1}     │              │             │
   │                     │              │             │
   │                     │  UPDATE room │             │
   │                     │  SET status= │             │
   │                     │  'ACTIVE',   │             │
   │                     │  problem=1   │             │
   │                     ├─────────────▶│             │
   │                     │              │             │
   │         │           │  All members │             │
   │         │           │  detect      │             │
   │         │           │  ACTIVE via  │             │
   │         │           │  polling     │             │
   │         │◀──────────┤              │             │
   │         │  Navigate │              │             │
   │         │  to Active│              │             │
   │         │  Workspace│              │             │
```

---

## 4. Technology Stack

### 4.1 Backend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Language | Java | 17 | Core programming language |
| Framework | Spring Boot | 3.2.x | Application framework |
| Security | Spring Security | 6.x | Authentication & authorization |
| ORM | Spring Data JPA | 3.2.x | Database abstraction |
| Database | MySQL | 8.0 | Persistent data storage |
| Auth | OAuth2 Client | 6.x | Google authentication |
| Tokens | jjwt | 0.11.5 | JWT generation/validation |
| HTTP Client | WebClient | 6.x | Reactive Judge0 communication |
| Build Tool | Maven | 3.8+ | Dependency management |

### 4.2 Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 18.2.0 | UI library |
| Routing | React Router DOM | 6.x | Client-side routing |
| HTTP Client | Axios | 1.6.x | API communication |
| Code Editor | Monaco Editor | 0.44.x | VS Code-like editor |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Icons | Lucide React | 0.263.1 | Icon library |
| State | Context API | Built-in | Global state management |
| Build Tool | Create React App | 5.x | Development environment |

### 4.3 Code Execution Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Execution Engine | Judge0 CE | 1.13.0 | Sandboxed code execution |
| Queue | Redis | 6 | Job queue management |
| Metadata DB | PostgreSQL | 13 | Execution results storage |
| Orchestration | Docker Compose | 3.8 | Multi-container management |
| Workers | Judge0 Workers | 1.13.0 | Parallel code execution |

### 4.4 Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version control |
| Postman | API testing |
| MySQL Workbench | Database management |
| VS Code | IDE for frontend |
| Eclipse| IDE for backend |
| Docker Desktop | Container management |

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     users       │         │     problems     │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ username        │         │ title            │
│ email           │         │ difficulty       │
│ password_hash   │         │ category         │
│ rating          │         │ description      │
│ created_at      │         │ input_format     │
└────────┬────────┘         │ output_format    │
         │                  │ constraints      │
         │                  │ time_limit_ms    │
         │                  │ memory_limit_mb  │
         │                  │ sample_input     │
         │                  │ sample_output    │
         │                  │ explanation      │
         │                  └────────┬─────────┘
         │                           │
         │                           │
         │ 1                         │ 1
         │                           │
         │ host_id                   │
         │                           │
         │                    problem_id
         │                           │
         │ N                         │ N
         │                           │
┌────────▼────────┐         ┌────────▼─────────┐
│      rooms      │         │   test_cases     │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ room_code (UQ)  │         │ problem_id (FK)  │
│ room_name       │         │ input_data       │
│ host_id (FK)    │────┐    │ expected_output  │
│ mode            │    │    │ is_sample        │
│ status          │    │    │ points           │
│ max_members     │    │    │ created_at       │
│ current_members │    │    └──────────────────┘
│ current_prob(FK)│────┘
│ start_time      │
│ end_time        │
│ time_limit      │
│ created_at      │
│ version         │
└────────┬────────┘
         │
         │ 1
         │
         │ room_id
         │
         │ N
         │
┌────────▼────────┐
│  room_members   │
├─────────────────┤
│ id (PK)         │
│ room_id (FK)    │
│ user_id (FK)    │
│ role            │
│ status          │
│ joined_at       │
│ left_at         │
│ submission_time │
│ score           │
│ member_rank     │
└─────────────────┘
    │         │
    │         │
    │         └──────────┐
    │                    │
    └──────────┐         │
               │         │
        ┌──────▼─────────▼──┐
        │      users         │
        │  (referenced by    │
        │   user_id FK)      │
        └────────────────────┘
```

### 5.2 Key Tables

**users**
- Stores user credentials and profile information
- `password_hash`: BCrypt encrypted (strength 10)
- `rating`: Default 1200 (ELO-style, future implementation)

**problems**
- Curated problem bank with metadata
- `difficulty`: ENUM('EASY', 'MEDIUM', 'HARD')
- `category`: String (e.g., 'ARRAYS', 'STRINGS', 'DYNAMIC_PROGRAMMING')
- Resource limits per problem (time/memory)

**test_cases**
- Input/output pairs for automated evaluation
- `is_sample`: TRUE for visible test cases, FALSE for hidden
- `points`: Scoring weight (not currently used)

**rooms**
- Collaborative session management
- `room_code`: Unique 6-character identifier
- `status`: ENUM('WAITING', 'ACTIVE', 'PAUSED', 'ENDED')
- `mode`: ENUM('PRACTICE', 'TOURNAMENT')
- `version`: Optimistic locking for concurrent updates

**room_members**
- Many-to-many relationship between users and rooms
- `role`: ENUM('HOST', 'MEMBER')
- `status`: ENUM('JOINED', 'LEFT', 'DISCONNECTED')
- Unique constraint on (room_id, user_id) prevents duplicates

### 5.3 Key Relationships

1. **User → Room (Host)**: One-to-many (user creates multiple rooms)
2. **Problem → Room**: Many-to-one (many rooms can use same problem)
3. **Problem → TestCase**: One-to-many (problem has multiple test cases)
4. **Room ↔ User (Members)**: Many-to-many (via room_members)

---

## 6. API Design

### 6.1 API Structure

**Base URL**: `http://localhost:8083/api`

**Authentication**: JWT Bearer token in `Authorization` header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6.2 Endpoint Categories

#### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/google/success
```

#### Problem Endpoints
```
GET    /api/problems
GET    /api/problems/{id}
GET    /api/problems/difficulty/{level}
GET    /api/problems/category/{category}
GET    /api/problems/{id}/testcases
GET    /api/problems/{id}/sample-testcases
```

#### Code Execution Endpoints
```
POST   /api/code/test
POST   /api/code/submit
GET    /api/code/health
```

#### Room Management Endpoints
```
POST   /api/rooms/create
POST   /api/rooms/join
POST   /api/rooms/leave/{roomCode}
GET    /api/rooms/{roomCode}
GET    /api/rooms/my-rooms
POST   /api/rooms/{roomCode}/start
GET    /api/rooms/{roomCode}/session
POST   /api/rooms/{roomCode}/end
POST   /api/rooms/{roomCode}/pause
```

### 6.3 Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Detailed error description",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Traditional Auth Flow                       │
└─────────────────────────────────────────────────────────────┘

User Input               Backend Processing           Database
───────────              ──────────────────          ─────────
username: "john"   ───▶   Find user by username  ───▶  Query users
password: "pwd123"        │                             │
                          │                             │
                          ▼                             ▼
                     Compare BCrypt hash           Return user record
                          │
                          ▼
                     Generate JWT token
                     {
                       sub: "john",
                       iat: 1705315800,
                       exp: 1705402200
                     }
                          │
                          ▼
                     Sign with HMAC-SHA256
                          │
                          ▼
                     Return token to frontend
                          │
                          ▼
                  Frontend stores in localStorage


┌─────────────────────────────────────────────────────────────┐
│                    OAuth2 Flow                               │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Sign in with Google"
   │
   ▼
2. Redirect to Google Authorization Server
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=...&
     redirect_uri=http://localhost:8083/login/oauth2/code/google
   │
   ▼
3. User grants permissions
   │
   ▼
4. Google redirects back with authorization code
   http://localhost:8083/login/oauth2/code/google?code=4/abc...
   │
   ▼
5. Backend exchanges code for tokens
   POST https://oauth2.googleapis.com/token
   │
   ▼
6. Backend fetches user info
   GET https://openidconnect.googleapis.com/v1/userinfo
   │
   ▼
7. Backend creates/updates user in database
   │
   ▼
8. Backend generates JWT token
   │
   ▼
9. Redirect to frontend with token
   http://localhost:3001/auth/success?token=eyJ...&user=john
```

### 7.2 Authorization Model

**Role-Based Access Control (RBAC):**

| Action | Guest | Member | Host |
|--------|-------|--------|------|
| Browse Problems | ✅ | ✅ | ✅ |
| Test Code | ❌ | ✅ | ✅ |
| Submit Code | ❌ | ✅ | ✅ |
| Create Room | ❌ | ✅ | ✅ |
| Join Room | ❌ | ✅ | ✅ |
| Start Session | ❌ | ❌ | ✅ |
| End Session | ❌ | ❌ | ✅ |
| Select Problem | ❌ | ❌ | ✅ |

### 7.3 Security Measures

**Input Validation:**
- DTO validation with Bean Validation annotations
- SQL injection prevention via JPA parameterized queries
- XSS protection via Content Security Policy (planned)

**Code Execution Security:**
- Sandboxed Docker containers with restricted network access
- Resource limits (CPU: 3s, Memory: 256MB)
- Read-only file systems
- Non-root user execution

**Data Protection:**
- BCrypt password hashing (strength: 10 rounds)
- JWT tokens with expiration (24 hours)
- HTTPS enforcement in production (TLS 1.3)
- Sensitive data never logged

---

## 8. Deployment Architecture

### 8.1 Current Development Setup

```
┌─────────────────────────────────────────────────────────────┐
│              Developer Machine (localhost)                   │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐           │
│  │  React Frontend  │    │  Spring Boot     │           │
│  │  Port: 3001      │───▶│  Backend         │           │
│  │  npm start       │    │  Port: 8083      │           │
│  └──────────────────┘    │  mvn spring-boot │           │
│                          │  :run            │           │
│                          └────────┬─────────┘           │
│                                   │                     │
│                          ┌────────▼─────────┐           │
│                          │  MySQL Database  │           │
│                          │  Port: 3306      │           │
│                          │  Local install   │           │
│                          └──────────────────┘           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Docker Compose Environment                       │  │
│  │  ┌────────────┐  ┌────────┐  ┌───────────────┐  │  │
│  │  │ Judge0 API │  │ Redis  │  │  PostgreSQL   │  │  │
│  │  │ Port: 2358 │  │ Port:  │  │  Port: 5432   │  │  │
│  │  └────────────┘  │ 6379   │  └───────────────┘  │  │
│  │                  └────────┘                      │  │
│  │  ┌─────────────────────────────────────────┐    │  │
│  │  │  3x Judge0 Workers (parallel execution) │    │  │
│  │  └─────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Production Deployment (Recommended)

```
                         ┌─────────────────────┐
                         │   Route53 DNS       │
                         │  codecollab.com     │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
         ┌──────────▼──────────┐        ┌──────────▼──────────┐
         │  CloudFront CDN     │        │  Application        │
         │  (Static Assets)    │        │  Load Balancer      │
         │  *.codecollab.com   │        │  api.codecollab.com │
         └──────────┬──────────┘        └──────────┬──────────┘
                    │                               │
         ┌──────────▼──────────┐        ┌──────────▼──────────┐
         │  S3 Bucket          │        │  EC2 Auto Scaling   │
         │  React Build        │        │  Group (2-4         │
         │  /static/*          │        │  t3.medium)         │
         └─────────────────────┘        └──────────┬──────────┘
                                                    │
                                        ┌───────────┴───────────┐
                                        │                       │
                                 ┌──────▼──────┐        ┌──────▼──────┐
                                 │  Backend 1  │        │  Backend 2  │
                                 │  (Stateless)│        │  (Stateless)│
                                 └──────┬──────┘        └──────┬──────┘
                                        │                       │
                                        └───────────┬───────────┘
                                                    │
                                        ┌───────────▼───────────┐
                                        │  RDS MySQL (Primary)  │
                                        │  db.t3.small          │
                                        │  Multi-AZ enabled     │
                                        └───────────┬───────────┘
                                                    │
                                        ┌───────────▼───────────┐
                                        │  RDS Read Replica     │
                                        │  (For problem queries)│
                                        └───────────────────────┘

                    ┌──────────────────────────────────────────┐
                    │  Dedicated EC2 (Judge0)                  │
                    │  t3.large (Private Subnet)               │
                    │  ┌────────────────────────────────────┐  │
                    │  │  Docker Compose:                   │  │
                    │  │  • Judge0 Server                   │  │
                    │  │  • Redis                           │  │
                    │  │  • PostgreSQL                      │  │
                    │  │  • 5x Workers (scaled)             │  │
                    │  └────────────────────────────────────┘  │
                    └──────────────────────────────────────────┘
```

### 8.3 Deployment Strategy

**Backend Deployment Pipeline:**
```
GitHub Repository
      │
      │ (Push to main)
      ▼
GitHub Actions Workflow
      │
      ├─ Run Tests (mvn test)
      │
      ├─ Build JAR (mvn package)
      │
      ├─ Build Docker Image
      │
      ├─ Push to ECR/DockerHub
      │
      ▼
AWS CodeDeploy / ECS
      │
      ├─ Blue/Green Deployment
      │
      ├─ Health Check
      │
      └─ Route Traffic
```

**Frontend Deployment Pipeline:**
```
GitHub Repository
      │
      │ (Push to main)
      ▼
Vercel/Netlify Auto-Deploy
      │
      ├─ Install Dependencies (npm ci)
      │
      ├─ Build Production (npm run build)
      │
      ├─ Deploy to CDN
      │
      ├─ Invalidate Cache
      │
      └─ Update DNS
```

### 8.4 Environment Configuration

**Development (.env.development)**
```bash
# Backend
DB_HOST=localhost
DB_PORT=3306
DB_NAME=codecollab1
JWT_SECRET=dev-secret-key-change-in-production
JUDGE0_URL=http://localhost:2358

# Frontend
REACT_APP_API_BASE_URL=http://localhost:8083/api
```

**Production (.env.production)**
```bash
# Backend
DB_HOST=${RDS_ENDPOINT}
DB_PORT=3306
DB_NAME=codecollab_prod
JWT_SECRET=${SECRETS_MANAGER_JWT}
JUDGE0_URL=http://internal-judge0.vpc:2358

# Frontend
REACT_APP_API_BASE_URL=https://api.codecollab.com
```

### 8.5 Scalability Considerations

**Horizontal Scaling:**
- Stateless backend enables load balancing across multiple instances
- Session data stored in JWT (client-side), no server affinity needed
- Database read replicas for problem/test case queries

**Vertical Scaling:**
- Judge0 workers: Add more worker containers linearly
- Database: Increase RDS instance size (t3.small → t3.medium)
- Backend: Increase EC2 instance memory for concurrent requests

**Caching Strategy (Future):**
```
┌────────────────┐
│  CloudFront    │  ◀─ Static assets (JS, CSS, images)
└────────────────┘     TTL: 1 year

┌────────────────┐
│  Redis Cache   │  ◀─ Problem bank, test cases
└────────────────┘     TTL: 1 hour, invalidate on update

┌────────────────┐
│  Application   │  ◀─ In-memory cache (Spring Cache)
│  Cache         │     Problem metadata, user sessions
└────────────────┘
```

---

## 9. Performance Optimization

### 9.1 Database Optimization

**Indexes:**
```sql
-- Primary lookups
CREATE INDEX idx_room_code ON rooms(room_code);
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);

-- Join optimization
CREATE INDEX idx_room_members_room ON room_members(room_id, status);
CREATE INDEX idx_room_members_user ON room_members(user_id, status);

-- Query filtering
CREATE INDEX idx_problem_difficulty ON problems(difficulty);
CREATE INDEX idx_problem_category ON problems(category);
```

**Query Optimization:**
- JPA `@EntityGraph` for eager fetching (avoid N+1 queries)
- Pagination for large result sets (`Pageable`)
- Read replicas for problem browsing (80% of traffic)

### 9.2 Backend Optimization

**Connection Pooling (HikariCP):**
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

**Async Processing:**
```java
@Async("codeExecutionTaskExecutor")
public CompletableFuture<ExecutionResult> executeAsync(String code, String language) {
    // Parallel test case execution
    // Returns immediately, processes in background
}
```

**Thread Pool Configuration:**
```java
@Bean(name = "codeExecutionTaskExecutor")
public TaskExecutor codeExecutionTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(5);      // Minimum threads
    executor.setMaxPoolSize(10);      // Maximum threads
    executor.setQueueCapacity(100);   // Queue size
    return executor;
}
```

### 9.3 Frontend Optimization

**Code Splitting:**
```javascript
// Lazy load heavy components
const CodeEditor = React.lazy(() => import('./components/editor/CodeEditor'));
const Monaco = React.lazy(() => import('@monaco-editor/react'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <CodeEditor />
</Suspense>
```

**Memoization:**
```javascript
// Prevent unnecessary re-renders
const MemoizedProblemList = React.memo(ProblemList);

// Memoize expensive computations
const sortedMembers = useMemo(() => {
  return members.sort((a, b) => a.joinedAt - b.joinedAt);
}, [members]);
```

**Asset Optimization:**
- Minimize bundle size: Webpack code splitting
- CDN hosting for Monaco Editor (2.3MB)
- Image compression and lazy loading
- Tree-shaking unused Tailwind classes

---

## 10. Monitoring & Observability

### 10.1 Application Metrics (Planned)

**Spring Boot Actuator Endpoints:**
```
GET /actuator/health        - Health check
GET /actuator/metrics       - Application metrics
GET /actuator/info          - Build information
GET /actuator/prometheus    - Prometheus metrics
```

**Custom Metrics:**
```java
@Autowired
private MeterRegistry meterRegistry;

// Counter for room creations
Counter.builder("room.created")
    .tag("mode", room.getMode().toString())
    .register(meterRegistry)
    .increment();

// Timer for code execution
Timer.builder("code.execution")
    .tag("language", language)
    .register(meterRegistry)
    .record(duration);
```

### 10.2 Logging Strategy

**Log Levels:**
```
DEBUG - Development only (SQL queries, detailed flow)
INFO  - Normal operations (user actions, API calls)
WARN  - Recoverable errors (retry attempts, validation failures)
ERROR - Critical failures (database down, Judge0 unavailable)
```

**Structured Logging (JSON):**
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "INFO",
  "logger": "c.c.v1.controller.RoomController",
  "message": "Room created",
  "context": {
    "roomCode": "ABC123",
    "username": "john_doe",
    "mode": "PRACTICE",
    "correlationId": "req-123456"
  }
}
```

### 10.3 Health Checks

**Backend Health Check:**
```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // Check database connection
        boolean dbUp = checkDatabase();
        
        // Check Judge0 availability
        boolean judge0Up = checkJudge0();
        
        if (dbUp && judge0Up) {
            return Health.up()
                .withDetail("database", "operational")
                .withDetail("judge0", "operational")
                .build();
        }
        return Health.down().build();
    }
}
```

**Readiness vs Liveness:**
- **Liveness**: `/actuator/health/liveness` - Is the app running?
- **Readiness**: `/actuator/health/readiness` - Can the app serve traffic?

---

## 11. Disaster Recovery & Backup

### 11.1 Database Backup Strategy

**RDS Automated Backups:**
- Daily snapshots with 7-day retention
- Point-in-time recovery (5-minute granularity)
- Cross-region replication for DR

**Backup Schedule:**
```
Daily:   Full database backup (automated by RDS)
Weekly:  Manual snapshot before major deployments
Monthly: Long-term archive to S3 Glacier
```

### 11.2 Data Recovery Procedures

**Scenario 1: Accidental Data Deletion**
1. Stop application to prevent further writes
2. Restore from latest snapshot to separate instance
3. Export affected data
4. Import into production database
5. Verify data integrity
6. Resume application

**Scenario 2: Database Corruption**
1. Promote read replica to primary (5-minute RTO)
2. Update application connection strings
3. Investigate corruption cause
4. Restore original primary from snapshot

### 11.3 Application Disaster Recovery

**Multi-Region Failover:**
```
Primary Region: us-east-1
   │
   ├─ Backend ECS Cluster
   ├─ RDS Primary
   └─ Judge0 EC2
   
DR Region: us-west-2
   │
   ├─ Backend ECS Cluster (standby)
   ├─ RDS Read Replica (auto-promote)
   └─ Judge0 EC2 (cold standby)

Route53 Health Check:
   - Primary unhealthy → Failover to DR
   - RTO: 10 minutes
   - RPO: 5 minutes (replication lag)
```

---

## 12. Future Architecture Enhancements

### 12.1 Microservices Migration

**Current Monolith:**
```
┌─────────────────────────────────────┐
│      Spring Boot Monolith           │
│  ┌────────────────────────────────┐ │
│  │ Auth Service                   │ │
│  │ Problem Service                │ │
│  │ Room Service                   │ │
│  │ Execution Service              │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Proposed Microservices:**
```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Auth        │   │  Problem     │   │  Room        │
│  Service     │   │  Service     │   │  Service     │
│  Port: 8081  │   │  Port: 8082  │   │  Port: 8083  │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                 ┌────────▼────────┐
                 │  API Gateway    │
                 │  (Spring Cloud) │
                 │  Port: 8080     │
                 └─────────────────┘

┌──────────────┐   ┌──────────────┐
│  Execution   │   │  Notification│
│  Service     │   │  Service     │
│  Port: 8084  │   │  Port: 8085  │
└──────────────┘   └──────────────┘
```

**Benefits:**
- Independent scaling (e.g., scale Execution Service only)
- Technology flexibility (different languages per service)
- Fault isolation (one service failure doesn't crash all)
- Easier deployment (deploy services independently)

### 12.2 Real-Time Communication

**WebSocket Architecture:**
```
┌─────────────┐
│  Frontend   │
│  (React)    │
└──────┬──────┘
       │ WebSocket
       │
┌──────▼──────┐
│  WebSocket  │
│  Gateway    │
│  (Spring    │
│  WebSocket) │
└──────┬──────┘
       │
┌──────▼──────┐
│  Message    │
│  Broker     │
│  (RabbitMQ) │
└──────┬──────┘
       │
       ├─────► Room Service (session updates)
       ├─────► Notification Service (alerts)
       └─────► Execution Service (live results)
```

**Message Types:**
- `room.member.joined` - New member notification
- `room.session.started` - Session state change
- `code.execution.progress` - Real-time execution status
- `code.execution.complete` - Results ready

### 12.3 Advanced Features Architecture

**AI-Powered Hints:**
```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ "Get Hint"
       │
┌──────▼──────┐
│  Hint       │
│  Service    │
└──────┬──────┘
       │
┌──────▼──────┐
│  OpenAI API │
│  GPT-4      │
└─────────────┘

Context Passed:
- Problem description
- User's current code
- Test case results
- User's past solutions

Response:
- Contextual hint (not full solution)
- Algorithm suggestion
- Edge case pointer
```

**Code Review Bot:**
```
┌─────────────┐
│  Submission │
└──────┬──────┘
       │ After AC
       │
┌──────▼──────┐
│  Analysis   │
│  Service    │
└──────┬──────┘
       │
       ├─────► Time Complexity Analyzer
       ├─────► Space Complexity Analyzer
       ├─────► Code Style Checker
       └─────► Best Practices Scanner

Output:
- Complexity: O(n²) → Optimize to O(n log n)
- Memory: Consider in-place algorithm
- Style: Use descriptive variable names
```

---

## 13. Architecture Decision Records (ADRs)

### ADR-001: Stateless Backend with JWT

**Status:** Accepted

**Context:** Need to support horizontal scaling while maintaining user sessions.

**Decision:** Use JWT tokens for stateless authentication instead of server-side sessions.

**Consequences:**
- ✅ Pros: Easy horizontal scaling, no session replication needed
- ❌ Cons: Cannot revoke tokens before expiration, larger request payloads

**Alternatives Considered:**
- Server-side sessions with Redis (adds dependency, complexity)
- OAuth2 only (limits authentication options)

---

### ADR-002: Polling vs WebSockets for Room Updates

**Status:** Accepted (Temporary)

**Context:** Need real-time updates for room member changes and session state.

**Decision:** Implement polling (3-second interval) initially, migrate to WebSockets later.

**Consequences:**
- ✅ Pros: Simpler implementation, works with HTTP-only environments
- ❌ Cons: Higher latency, more server load, not truly real-time

**Migration Plan:** Phase 2 will replace with WebSocket connections.

---

### ADR-003: Monolithic Backend vs Microservices

**Status:** Accepted

**Context:** Need to deliver MVP quickly while maintaining code quality.

**Decision:** Start with monolithic Spring Boot application, plan microservices migration.

**Consequences:**
- ✅ Pros: Faster development, simpler deployment, easier debugging
- ❌ Cons: Harder to scale individual components, potential coupling

**Refactoring Plan:** Clear service boundaries in monolith enable future extraction.

---

### ADR-004: Judge0 vs Custom Execution Engine

**Status:** Accepted

**Context:** Need secure, reliable code execution for multiple languages.

**Decision:** Use Judge0 CE (open-source) instead of building custom execution engine.

**Consequences:**
- ✅ Pros: Battle-tested security, multi-language support, active community
- ❌ Cons: Dependency on external project, limited customization

**Alternatives Considered:**
- AWS Lambda (cost prohibitive for high volume)
- Custom Docker execution (security risks, maintenance burden)

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **JWT** | JSON Web Token - Compact, URL-safe token for authentication |
| **JPA** | Java Persistence API - ORM specification for database access |
| **OAuth2** | Open Authorization 2.0 - Industry-standard authorization protocol |
| **Judge0** | Open-source code execution system with sandboxing |
| **Monaco Editor** | Microsoft's code editor that powers VS Code |
| **Optimistic Locking** | Concurrency control using version numbers |
| **DTO** | Data Transfer Object - Object for transferring data between layers |
| **CORS** | Cross-Origin Resource Sharing - Browser security feature |
| **BCrypt** | Password hashing function with built-in salt |
| **WebSocket** | Protocol for full-duplex communication over TCP |
| **Polling** | Repeatedly requesting data to check for updates |
| **Sandbox** | Isolated execution environment for untrusted code |
| **Test Case** | Input/output pair for automated code validation |
| **Room Code** | Unique 6-character identifier for collaborative sessions |
| **Session** | Active coding period in a room with selected problem |

---

## 15. References

### Documentation
- Spring Boot: https://spring.io/projects/spring-boot
- React: https://react.dev
- Judge0: https://github.com/judge0/judge0
- Tailwind CSS: https://tailwindcss.com
- Monaco Editor: https://microsoft.github.io/monaco-editor

### Architecture Patterns
- Clean Architecture: Robert C. Martin
- Domain-Driven Design: Eric Evans
- Microservices Patterns: Chris Richardson

### Security Best Practices
- OWASP Top 10: https://owasp.org/www-project-top-ten
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- Docker Security: https://docs.docker.com/engine/security

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2025  
**Maintained By:** CodeCollab Development Team
