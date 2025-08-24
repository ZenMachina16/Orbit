#!/bin/bash

echo "🚀 Starting Orbit - Decentralized Microblogging Platform"
echo "=================================================="

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ Error: dfx is not installed. Please install dfx first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start ICP replica in background
echo "🌐 Starting local ICP replica..."
dfx start --clean --background

# Wait a moment for replica to start
sleep 3

# Check if replica is running
if ! dfx ping &> /dev/null; then
    echo "❌ Error: Failed to start ICP replica"
    exit 1
fi

echo "✅ ICP replica started successfully"

# Note: Using mock authentication for local development
echo "🔐 Local development mode: Using mock authentication"
echo "✅ No Internet Identity setup required for local development"

# Deploy canisters
echo "📦 Deploying canisters..."
dfx deploy

if [ $? -eq 0 ]; then
    echo "✅ Canisters deployed successfully"
else
    echo "❌ Error: Failed to deploy canisters"
    exit 1
fi

# Get canister URLs
FRONTEND_URL=$(dfx canister url dwitter_frontend)
BACKEND_URL=$(dfx canister url dwitter_backend)

echo ""
echo "🎉 Orbit is ready!"
echo "=================================================="
echo "🌐 Frontend (Deployed): $FRONTEND_URL"
echo "🔧 Backend Candid: $BACKEND_URL"
echo "🔐 Authentication: Mock authentication for local development"
echo ""
echo "🚀 Starting development server..."
echo "📱 Development server will be available at: http://localhost:3000"
echo ""
echo "💡 Tips:"
echo "   - Use the development server for hot reload during development"
echo "   - Use the deployed frontend for testing the production build"
echo "   - Mock authentication is used for local development"
echo "   - For production, Internet Identity will be used automatically"
echo ""
echo "🛑 To stop everything, run: dfx stop"
echo ""

# Start development server
cd src/dwitter_frontend
npm start
