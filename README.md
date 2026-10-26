# QuickBite

A React + Vite food discovery and delivery frontend for the capstone project. The interface fetches Hyderabad restaurant listings from the supplied Swiggy API via CORS proxy, then supports restaurant search, cuisine filters, rating/delivery sorting, favorites, and a client-side cart.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

If you use pnpm, `pnpm install` and `pnpm dev` work too. Open the URL Vite prints (usually `http://localhost:5173/`); opening `index.html` as a `file://` URL will show a blank page because the browser cannot load the React JSX modules directly.

The public proxy key in `src/services/restaurantService.js` is supplied by the project brief. It may have usage limits; for a production deployment, route Swiggy requests through a backend you control and store credentials there. Restaurant browsing works independently from cart checkout, which is a frontend demonstration until an order API is connected.

## Single-responsibility structure

- `src/services/restaurantService.js` owns HTTP access and normalization of Swiggy's nested response.
- `src/App.jsx` owns page state and composes the application view.
- `src/styles.css` owns presentation and responsive layout.
- `src/main.jsx` mounts the React application.

## Capstone deployment starter

- `Dockerfile` builds the static app and serves it with Nginx; `/health` supports container probes.
- `k8s/deployment.yaml` defines a two-replica deployment, resource requests/limits, probes, and internal service.
- `k8s/hpa.yaml` scales between 2 and 8 replicas at 65% average CPU utilization.
- `.github/workflows/build-and-push.yml` builds and pushes `latest` and commit-tagged Docker Hub images on pushes to `main`. A manual run can also deploy that commit to the local Kubernetes cluster through a self-hosted runner, and Slack receives the build/deploy result.

Before the first workflow run, open your GitHub repository's **Settings → Secrets and variables → Actions → New repository secret** and add:

- `DOCKERHUB_USERNAME`: your Docker Hub username (not your email address).
- `DOCKERHUB_TOKEN`: a Docker Hub access token with permission to push images. Create one in Docker Hub under **Account Settings → Personal access tokens**; do not use or commit your account password.
- `SLACK_WEBHOOK_URL` (optional): an incoming webhook URL if you want success notifications.

The workflow checks for the two Docker Hub secrets before attempting login. The local Kubernetes deployment option requires a GitHub **self-hosted Linux runner** on the laptop/WSL, labeled `quickbite-k8s`, with `kubectl` configured to use the local cluster. GitHub-hosted runners cannot directly reach a cluster running only on your laptop. Keep the self-hosted runner offline except when you intend to run this workflow, and do not run untrusted pull-request code on it.

On pushes to `main`, GitHub builds and publishes the image and reports that result. To also deploy locally, go to **Actions → Build and publish QuickBite → Run workflow**, enable **Deploy the built image to the local Kubernetes cluster**, and start the run. The deploy job applies `k8s/deployment.yaml` and `k8s/hpa.yaml`, selects the commit-specific image, and waits for rollout completion. If the option is not enabled, deployment is shown as not requested. Slack reports both job results when `SLACK_WEBHOOK_URL` is configured.

Apply Kubernetes manifests only after the image is published and a cluster with Metrics Server is configured. The capstone brief separately requires a configured Prometheus/Grafana deployment and a live load test; these remain cluster setup and demonstration steps.

### Deploy with Docker

```bash
docker build -t quickbite-web:local .
docker run --rm -p 8080:80 quickbite-web:local
```

Visit `http://localhost:8080/`; `http://localhost:8080/health` should return `ok`.

### Deploy to Kubernetes

Push to `main` after adding the GitHub secrets above. Once the Actions workflow publishes the image, update the image placeholder in `k8s/deployment.yaml` to your Docker Hub namespace, then run:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/hpa.yaml
kubectl get pods,svc,hpa
```

Expose the service with your cluster's ingress or load balancer before accessing it outside the cluster. CPU autoscaling requires Metrics Server and working pod CPU requests; the provided deployment sets requests. Replace the Docker Hub placeholder before applying. The deployment has no cluster credentials or external ingress configuration because those depend on your cloud provider.
