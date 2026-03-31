#!/bin/bash

echo "=== BuildSphere Setup Script ==="
echo ""

# Check if MongoDB URI is configured
if grep -q "YOUR_PASSWORD" /home/ubuntu/Wings_AI/BuildSphere/backend/.env; then
    echo "ERROR: Please update backend/.env with your MongoDB credentials first"
    echo "Run: nano /home/ubuntu/Wings_AI/BuildSphere/backend/.env"
    exit 1
fi

# Install backend dependencies
echo "1. Installing backend dependencies..."
cd /home/ubuntu/Wings_AI/BuildSphere/backend
npm install
echo "✓ Backend dependencies installed"
echo ""

# Seed weeks
echo "2. Seeding weeks for all departments..."
cd /home/ubuntu/Wings_AI/BuildSphere/database
npm run seed:weeks
echo "✓ Weeks seeded"
echo ""

# Seed entries
echo "3. Seeding sample entries..."
npm run seed:entries
echo "✓ Sample entries seeded"
echo ""

# Start backend
echo "4. Starting backend server..."
cd /home/ubuntu/Wings_AI/BuildSphere/backend
npm start &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait for server to start
sleep 3

# Test health endpoint
echo "5. Testing API..."
curl -s http://localhost:5000/health
echo ""
echo ""

echo "=== Setup Complete ==="
echo "Backend running on http://localhost:5000"
echo "To stop: kill $BACKEND_PID"
