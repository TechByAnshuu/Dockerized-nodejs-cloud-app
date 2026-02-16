# AI-Based Smart Complaint Management System

The AI-Based Smart Complaint Management System is a web application that allows users to submit complaints digitally and automatically categorizes them using AI. The system streamlines complaint handling by organizing reports, reducing manual effort, and helping authorities respond faster. Built with Node.js and Docker, the platform ensures scalable deployment, efficient processing, and a modern cloud-ready architecture. It is highly adaptable and can be used across multiple sectors—not only for civic complaints but also for managing workflows in hospitals, municipalities, government offices, and private institutions.

## 🚀 Features

- **AI-Powered Categorization**: Automatic complaint classification using NLP
- **User Dashboard**: Submit and track complaints with image uploads
- **Admin Panel**: Manage all complaints, update statuses, view analytics
- **Real-time Status Tracking**: Monitor complaint progress from submission to resolution
- **Modern UI/UX**: Glassmorphism design with dark/light mode support
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Dockerized Deployment**: Consistent environment across dev/test/prod
- **Apache Reverse Proxy**: Load balancing and secure routing

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Glassmorphism UI with 2025 design trends
- Responsive design for mobile/tablet/desktop

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Multer for file uploads
- Rule-based NLP for AI categorization

### DevOps
- Docker & Docker Compose
- Apache HTTP Server (reverse proxy)
- Linux (Ubuntu Server)
- AWS EC2 ready

## 📦 Installation

### Prerequisites
- Docker & Docker Compose
- Git
**Secrets**

- The compose file expects `JWT_SECRET` and `GEMINI_API_KEY` to be provided for secure operation and AI features. For local development you can create a project-level `.env` file in the repository root with the following:

```env
# .env (project root)
JWT_SECRET=your_local_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Note: don't commit production secrets. Use a secrets manager or CI/CD secrets for deployments.

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd Dockerized-nodejs-cloud-app
```

2. **Build and run with Docker Compose**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: https://civicsphere-backend.onrender.com/
- Backend:  https://civicsphere-backend.onrender.com/

## 🎯 Usage

### For Citizens

1. **Register**: Create an account at `/register.html`
2. **Login**: Sign in at `/login.html`
3. **Submit Complaint**: 
   - Navigate to Dashboard
   - Click "New Complaint"
   - Fill in details (title, location, description)
   - Upload image (optional)
   - Submit
4. **Track Status**: View all your complaints on the dashboard

### For Administrators

1. **Create Admin Account**: 
   - Register normally
   - Manually update role to 'admin' in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Access Admin Panel**: Navigate to `/admin.html`
3. **Manage Complaints**:
   - View all complaints
   - Filter by category/status
   - Update complaint status
   - View analytics

## 📊 AI Categorization

The system uses a rule-based NLP engine that analyzes complaint text and assigns categories:

- **Garbage & Sanitation**: trash, waste, dump, etc.
- **Roads & Infrastructure**: pothole, road, street, etc.
- **Water Supply**: leak, pipe, drainage, etc.
- **Electricity & Power**: light, power, outage, etc.
- **Public Safety**: accident, unsafe, crime, etc.
- **General**: Default category

## 🏗️ Architecture

```
Client (Browser)
    ↓
Apache HTTP Server (Port 80)
    ↓
Node.js/Express (Port 3000)
    ↓
MongoDB (Port 27017)
```

## 📁 Project Structure

```
/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       └── public/
│           ├── index.html
│           ├── login.html
│           ├── register.html
│           ├── dashboard.html
│           ├── create-complaint.html
│           ├── admin.html
│           ├── css/
│           ├── js/
│           └── uploads/
└── apache/
    ├── Dockerfile
    └── httpd.conf
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Role-based access control (Admin/Citizen)
- AWS Security Group firewall rules (when deployed)

## 🌐 Deployment

### AWS EC2 Deployment

1. Launch Ubuntu EC2 instance
2. Install Docker & Docker Compose
3. Clone repository
4. Configure security groups (ports 80, 443, 22)
5. Run `docker-compose up -d --build`
6. Configure domain/DNS (optional)

### Railway Deployment (Recommended steps)

1. Create three Railway services:
    - Backend: Root directory `backend/` (Docker)
    - Webserver (Apache): Root directory `apache/` (Docker)
    - Database: Use Railway MongoDB plugin

2. Configure environment variables for the Backend service in Railway Dashboard:
    - `PORT` = 3001
    - `NODE_ENV` = production
    - `MONGO_URI` = <Railway MongoDB URI>
    - `JWT_SECRET` = <secure_jwt_secret>
    - `GEMINI_API_KEY` = <your_gemini_key> (optional - for AI features)

3. Configure environment variable for the Webserver service:
    - `BACKEND_URL` = https://<your-backend>.up.railway.app

4. Build & deploy each service via Railway using their respective directories. The Apache image uses `BACKEND_URL` at container runtime to proxy `/api` requests to the backend service.

**Note on Railway networking:** Railway does not provide internal container DNS between services the way Docker Compose does locally. Set `BACKEND_URL` to the *public* Railway backend URL (for example: `https://<your-backend>.up.railway.app`). Do not use `localhost` or internal container names — Apache must proxy to the public backend URL.

5. Verification:
    - Backend health: `https://<your-backend>.up.railway.app/api/health`
    - Frontend: `https://<your-apache>.up.railway.app`
    - Ensure `/api` routes are proxied correctly and MongoDB is connected.

Local smoke test (optional):

1. Build the Apache image locally from the repository root (so the Dockerfile can copy frontend files):

```bash
docker build -t local-apache-test -f apache/Dockerfile .
```

2. Start a temporary stub backend to validate proxying (or use your running backend on port 3001):

```bash
# run a stub that responds at /api/health on port 4001
node stub-backend.js &
```

3. Create a user-defined docker network and run both containers on it so they can discover each other by name:

```bash
docker network create local-test-net
docker run -d --name stub-backend --network local-test-net -v "$PWD/stub-backend.js":/stub-backend.js:ro node:18-alpine node /stub-backend.js
docker run -d --name local-apache-test --network local-test-net -p 8080:80 -e BACKEND_URL=http://stub-backend:4001 local-apache-test
```

4. Verify the proxy works:

```bash
curl http://localhost:8080/api/health
# should return JSON from stub backend
```

---

## Local run & test (Windows CMD) 🔁

Below are copy-paste commands for running and testing the app locally on Windows (cmd.exe). Use Docker Compose (recommended) to run all services, or run the backend directly with Node when debugging.

1) Prepare env file

```cmd
copy .env.example .env
rem Edit .env in an editor and add values (JWT_SECRET, MONGO_URI, etc.). Do NOT commit .env
```

2) Start with Docker Compose (recommended)

```cmd
docker-compose up -d --build
docker-compose logs -f backend
```

Verify backend health (from host):

```cmd
curl http://localhost:3001/api/health
```

If `curl` on Windows prints no body, use a containerized curl on the same Docker network (reliable):

```cmd
docker run --rm --network dockerized-nodejs-cloud-app_app-network curlimages/curl:8.4.0 http://complaint-backend:3001/api/health -v
```

3) Run backend directly (no Docker) — for debugging

```cmd
rem Start a local MongoDB (if needed)
docker run -d --name local-mongo -p 27017:27017 mongo:6.0

set PORT=3001
set MONGO_URI=mongodb://127.0.0.1:27017/complaint_db
set JWT_SECRET=devsecret
set NODE_ENV=development
node backend/src/server.js
```

4) Test Apache proxy locally

Option A (host.docker.internal):
```cmd
docker build -t local-apache-test -f apache/Dockerfile .
docker run -p 8080:80 -e BACKEND_URL=http://host.docker.internal:3001 local-apache-test
curl http://localhost:8080/api/health
```

Option B (same Docker network — recommended for reliability):

```cmd
docker network create local-test-net
docker run -d --name backend-test --network local-test-net -e PORT=3001 -e MONGO_URI="mongodb://..." your-backend-image
docker run -p 8080:80 --network local-test-net -e BACKEND_URL=http://backend-test local-apache-test
curl http://localhost:8080/api/health
```

### Troubleshooting
- If the Apache build fails with "file not found" for `apache/docker-entrypoint.sh` or `httpd.conf`, ensure you build the `apache/` Dockerfile from the repository root (the compose file already does this) or use the `docker-compose` service which sets the correct context.
- If `curl` on Windows returns empty output, use the containerized curl command above or try PowerShell's `Invoke-WebRequest`.
- If you set `NODE_ENV=production`, the backend will exit at startup if `JWT_SECRET` or `MONGO_URI` are missing — this is intentional (fail-fast) so deployments surface missing configuration.

Note: When configuring the Apache service on Railway, set the build context to the **repository root** and the Dockerfile path to `apache/Dockerfile` so the Docker build can include `backend/src/public` in the image.

Note: For security, never store production secrets in your Git repository — use Railway environment variables or a secrets manager.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Complaints (Protected)
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - Get user's complaints

### Admin (Protected, Admin Only)
- `GET /api/admin/complaints` - Get all complaints
- `PUT /api/admin/complaints/:id/status` - Update status
- `GET /api/admin/analytics` - Get statistics

## 🎨 Design System

- **Colors**: HSL-based for easy theming
- **Typography**: Outfit & Inter fonts
- **Components**: Glassmorphism panels, badges, buttons
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first approach

## 🤝 Contributing

This is a demonstration project for learning Docker, Node.js, and modern web development practices.

## 📄 License

MIT License

## 👨‍💻 Author

Ansh Mishra — Full-stack developer specializing in Node.js, Docker, and cloud deployment.  
This project showcases containerized backend architecture and real-world DevOps practices.

---

**Note**: This project demonstrates real-world application architecture suitable for civic tech solutions, showcasing modern DevOps practices and AI integration.
