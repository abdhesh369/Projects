# Observability Strategy

This document outlines the observability stack recommended for the Finance Tracker application in production.

## 1. Metrics (Prometheus & Grafana)
- **Prometheus**: Scrapes `/metrics` endpoints from all microservices.
- **Grafana**: Visualizes metrics with pre-built dashboards.
- **Key Metrics to Track**:
  - HTTP Request Rate / Latency / Error Rate (RED Pattern).
  - Memory and CPU usage per pod.
  - Database connection pool status.
  - Redis hit/miss ratios.

## 2. Logging (ELK Stack)
- **Elasticsearch**: Centralized log storage and indexing.
- **Logstash/Fluentd**: Collects logs from Kubernetes stdout and forwards to Elasticsearch.
- **Kibana**: log exploration and visualization.
- **Correlation**: All logs include a `correlation_id` to trace requests across microservices (see `logging.middleware.js`).

## 3. Error Tracking (Sentry)
- Integrated into all Node.js services using the Sentry SDK.
- Captures unhandled exceptions and provides detailed stack traces and context.

## 4. Distributed Tracing (Jaeger)
- Optional: Recommended if latency issues arise.
- Uses OpenTelemetry to trace requests across the API Gateway and downstream services.
