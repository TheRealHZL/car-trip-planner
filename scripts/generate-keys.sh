#!/bin/bash
# =============================================================================
# SUPABASE KEY GENERATOR
# Generates secure JWT secret and API keys for Supabase
# =============================================================================

set -e

echo "=========================================="
echo "SUPABASE KEY GENERATOR"
echo "=========================================="
echo ""

# Generate JWT Secret (at least 32 characters)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
echo "JWT_SECRET=$JWT_SECRET"
echo ""

# Generate ANON_KEY (JWT token with anon role)
# Header: {"alg":"HS256","typ":"JWT"}
# Payload: {"iss":"supabase","role":"anon","exp":2000000000}
ANON_HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
ANON_PAYLOAD=$(echo -n '{"iss":"supabase","role":"anon","exp":2000000000}' | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
ANON_SIGNATURE=$(echo -n "${ANON_HEADER}.${ANON_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
ANON_KEY="${ANON_HEADER}.${ANON_PAYLOAD}.${ANON_SIGNATURE}"
echo "ANON_KEY=$ANON_KEY"
echo ""

# Generate SERVICE_ROLE_KEY (JWT token with service_role)
# Payload: {"iss":"supabase","role":"service_role","exp":2000000000}
SERVICE_PAYLOAD=$(echo -n '{"iss":"supabase","role":"service_role","exp":2000000000}' | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
SERVICE_SIGNATURE=$(echo -n "${ANON_HEADER}.${SERVICE_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')
SERVICE_ROLE_KEY="${ANON_HEADER}.${SERVICE_PAYLOAD}.${SERVICE_SIGNATURE}"
echo "SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"
echo ""

# Generate Postgres Password
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '\n')
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo ""

echo "=========================================="
echo "Add these to your .env file"
echo "=========================================="
echo ""
echo "# Generated Keys - $(date)"
echo "JWT_SECRET=$JWT_SECRET"
echo "ANON_KEY=$ANON_KEY"
echo "SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo ""
echo "VITE_SUPABASE_ANON_KEY=$ANON_KEY"
