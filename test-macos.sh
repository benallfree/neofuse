#!/bin/bash
set -e

echo "Building neofuse..."
bun run build

echo "Running tests..."
bun run test

echo "All tests completed successfully!"