#!/bin/bash
set -e

# =============================================================================
# Runtime Environment Variable Injection
# This script injects environment variables into the built JavaScript bundle
# =============================================================================

# Path to the built JS files
JS_DIR="/usr/share/nginx/html/assets"

# Replace placeholder values with actual environment variables
# This allows runtime configuration without rebuilding the image
if [ -n "$VITE_SUPABASE_URL" ]; then
  echo "Injecting VITE_SUPABASE_URL..."
  find "$JS_DIR" -type f -name "*.js" -exec sed -i "s|__VITE_SUPABASE_URL__|${VITE_SUPABASE_URL}|g" {} \;
fi

if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "Injecting VITE_SUPABASE_ANON_KEY..."
  find "$JS_DIR" -type f -name "*.js" -exec sed -i "s|__VITE_SUPABASE_ANON_KEY__|${VITE_SUPABASE_ANON_KEY}|g" {} \;
fi

echo "Environment variables injected successfully."

# Execute the main command
exec "$@"
