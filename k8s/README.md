# Kubernetes Setup

This folder contains Kubernetes manifests for the Healthcare Platform microservices.

## Files

- `namespace.yaml` - dedicated namespace
- `configmap.yaml` - non-secret environment values and internal service URLs
- `secret.template.yaml` - template for required secrets
- `all-deployments.yaml` - deployments for all services
- `all-services.yaml` - internal services plus NodePort exposure for client and API gateway
- `ingress.yaml` - optional ingress for `healthcare.local`
- `build-local-images.sh` - builds local Docker images for Docker Desktop Kubernetes

## 1. Build local images

From the project root:

```bash
chmod +x k8s/build-local-images.sh
./k8s/build-local-images.sh
```

## 2. Create Kubernetes secret file

Copy the template and replace all placeholder values:

```bash
cp k8s/secret.template.yaml k8s/secret.yaml
```

Then edit `k8s/secret.yaml` with your real Mongo URIs, JWT secret, Stripe key, email credentials, and text.lk SMS credentials.

## 3. Apply manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/all-deployments.yaml
kubectl apply -f k8s/all-services.yaml
```

Optional ingress:

```bash
kubectl apply -f k8s/ingress.yaml
```

## 4. Verify

```bash
kubectl get all -n healthcare-platform
kubectl get ingress -n healthcare-platform
```

## Access

- Client NodePort: `http://localhost:30173`
- API Gateway NodePort: `http://localhost:30050`

## Notes

- These manifests are designed for Docker Desktop Kubernetes with locally built images.
- The current frontend still contains several hardcoded `localhost` API URLs. That is fine for demonstrating Kubernetes manifests for the assignment, but a fully cluster-native frontend would ideally use environment-based API URLs or ingress-relative paths.
