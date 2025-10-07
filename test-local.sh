#!/bin/bash
# Test locally before deploying to Vercel

echo "🔨 Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Starting preview server (same as Vercel)..."
echo "   This serves the EXACT same files that Vercel will serve"
echo ""
echo "📍 Open in your browser: http://localhost:4173"
echo "   Press Ctrl+C to stop"
echo ""

npm run preview
