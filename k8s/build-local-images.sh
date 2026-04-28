#!/usr/bin/env bash

set -euo pipefail

docker build -t healthcare-platform/patient-service:local ./patient-service
docker build -t healthcare-platform/doctor-service:local ./doctor-service
docker build -t healthcare-platform/telemedicine-service:local ./telemedicine-service
docker build -t healthcare-platform/appointment-service:local ./appointment-service
docker build -t healthcare-platform/ai-service:local ./ai-service
docker build -t healthcare-platform/notification-service:local ./notification-service
docker build -t healthcare-platform/payment-service:local ./payment-service
docker build -t healthcare-platform/api-gateway:local ./api-gateway
docker build -t healthcare-platform/client:local ./client

echo "Local Kubernetes images built successfully."
