# PeerNotes - Decentralized Note Sharing Platform

A peer-to-peer note sharing platform designed for academic environments, enabling students to share and access educational resources across a local network.

<img width="500" height="500" alt="Screenshot (54)" src="https://github.com/user-attachments/assets/ca36797b-76a0-41b8-9430-1763ff25c026" />
<img  width="500" height="500" alt="Screenshot (55)" src="https://github.com/user-attachments/assets/4c8f454c-3c0b-4223-a814-3dc404425ac9" />
<img  width="500" height="500" alt="Screenshot (56)" src="https://github.com/user-attachments/assets/1d76e845-2340-489a-ad83-de6d51516fa8" />
<img  width="500" height="500" alt="Screenshot (57)" src="https://github.com/user-attachments/assets/04203696-ecf0-4285-8f70-400fa1021b78" />
<img  width="500" height="500" alt="Screenshot (58)" src="https://github.com/user-attachments/assets/1717deca-220d-4cb5-a6bc-12e2e34888af" />
<img  width="500" height="500" alt="Screenshot (59)" src="https://github.com/user-attachments/assets/8456d939-5f1d-41c0-b84f-a6668f3cdad4" />
<img  width="500" height="500" alt="Screenshot (61)" src="https://github.com/user-attachments/assets/9d5b41a8-bd70-4081-b075-f35def1603d0" />

## System Architecture

### Overview
PeerNotes is a **three-tier distributed system** that combines centralized metadata management with decentralized file storage:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Central Server  │    │  Peer Services  │
│   (Next.js)     │◄──►│   (Node.js)      │◄──►│   (Node.js)     │
│   Port: 5173    │    │   Port: 8000     │    │   Port: 8080    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

#### 1. **Frontend Application** (`frontend/`)
- **Technology Stack**: Next.js 14, React 18, TypeScript
- **Responsibilities**: User interface, authentication, file upload/download orchestration
- **Key Features**:
  - JWT-based authentication
  - Real-time polling for peer presence
  - File search and filtering
  - Upload/download management

#### 2. **Central Server** (`backend-node/`)
- **Technology Stack**: Node.js, Express.js, Sequelize ORM, SQLite
- **Responsibilities**: Metadata management, user authentication, search indexing
- **Database Schema**:
  - **Users**: Authentication and profile management
  - **Files**: Metadata tracking (filename, ownership, timestamps)
  - **Academic Entities**: Courses, Professors, Topics, Semesters
  - **Social Features**: Upvotes/downvotes, user reports, peer relationships

#### 3. **Peer Services** (`file_peer/`)
- **Technology Stack**: Node.js, Express.js, Multer (file handling)
- **Responsibilities**: Local file storage, peer-to-peer file transfer
- **Key Features**:
  - Automatic IP discovery
  - Direct peer file transfers
  - Local file management
  - Network-restricted operations

##  Data Flow Architecture

### Authentication Flow
```mermaid
sequenceDiagram
    participant F as Frontend
    participant C as Central Server
    participant P as Peer Service
    
    F->>C: POST /api/login (credentials)
    C-->>F: JWT token
    F->>F: Store token in localStorage
    Note over F: All subsequent requests include Authorization header
```

### File Upload Flow
```mermaid
sequenceDiagram
    participant F as Frontend
    participant C as Central Server
    participant P as Peer Service
    
    F->>C: POST /api/register (metadata)
    C-->>F: File ID generated
    F->>P: POST /copy-file (file + ID)
    P-->>F: Confirmation
    Note over P: File stored as uploads/{id}_{filename}
```

### File Download Flow
```mermaid
sequenceDiagram
    participant F as Frontend
    participant P1 as Local Peer Service
    participant P2 as Remote Peer Service
    
    F->>P1: POST /request (id, filename, remote_ip)
    P1->>P2: GET /send?id={id}&filename={filename}
    P2-->>P1: File data
    P1-->>F: Download confirmation
    Note over P1: File cached locally for future access
```

### Presence & Discovery
```mermaid
sequenceDiagram
    participant F as Frontend
    participant C as Central Server
    participant P as Peer Service
    
    loop Every 30 seconds
        F->>P: GET /ip
        P-->>F: Local IP address
        F->>C: POST /api/poll (user_id, ip_address)
        C-->>F: Updated peer list
    end
```

## Database Design

### Entity Relationships
```
Users (1) ←→ (N) Files
Files (1) ←→ (1) Topics
Files (1) ←→ (1) Professors  
Files (1) ←→ (1) Courses
Files (1) ←→ (1) Semesters

Users (N) ←→ (N) Files (Peer Hosting)
Users (N) ←→ (N) Files (Upvotes)
Users (N) ←→ (N) Files (Downvotes)
Users (1) ←→ (N) UserReports
```

### Key Models

#### File Model
```javascript
{
  filename: String,
  created_at: Date,
  is_disabled: Boolean,
  disabled_reason: String,
  original_author_id: ForeignKey(User),
  topic_id: ForeignKey(Topic),
  professor_id: ForeignKey(Professor),
  course_id: ForeignKey(Course),
  semester_id: ForeignKey(Semester)
}
```

#### User Model
- JWT-based authentication
- Profile management
- Peer relationship tracking
- Voting and reporting capabilities

##  Network Architecture

### Communication Protocols
- **HTTP/HTTPS**: RESTful API communication
- **Local Network**: Peer-to-peer file transfers
- **Polling**: Real-time presence updates (30-second intervals)

### Port Configuration
- **Frontend**: `5173` (Next.js dev server)
- **Central API**: `8000` (Express.js)
- **Peer Service**: `8080` (Express.js)

### Network Constraints
- **Local Network Only**: Designed for restricted network environments
- **IP-based Discovery**: Automatic LAN IP detection
- **Direct P2P**: Files transferred directly between peers

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Token storage in localStorage
- Request-level authentication middleware

### File Security
- File ID-based access control
- Filename sanitization
- Upload size limits (50MB)
- Network-restricted access

### Data Validation
- Input sanitization across all endpoints
- SQL injection prevention via Sequelize ORM
- CORS configuration for cross-origin requests


## 📚 Quick Start Guide

For detailed setup instructions, see the [WALKTHROUGH.md](./WALKTHROUGH.md) file.

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- Local network environment

### Installation
```bash
git clone <repository-url>
cd PeerNotes-main

# Install dependencies for all services
npm run install:all  # or install individually per directory
```

### Development
```bash
# Terminal 1: Central Server
cd backend-node && npm start

# Terminal 2: Peer Service  
cd file_peer && npm start

# Terminal 3: Frontend
cd frontend && npm run dev
```

Access the application at `http://localhost:5173`

