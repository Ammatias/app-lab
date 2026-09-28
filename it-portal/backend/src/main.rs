use axum::{http::StatusCode, response::IntoResponse, routing::get, Json, Router};
use chrono::{SecondsFormat, Utc};
use serde::Serialize;
use std::net::SocketAddr;
use tower_http::trace::TraceLayer;
use tracing::info;

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
}

#[derive(Serialize)]
struct SummaryResponse {
    generated_at: String,
    services_online: u8,
    services_total: u8,
    managed_devices: u16,
    open_requests: u8,
    contacts: u8,
}

#[derive(Serialize)]
struct Contact {
    id: u8,
    name: &'static str,
    role: &'static str,
    department: &'static str,
    extension: &'static str,
    status: &'static str,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok", service: "it-portal-api" })
}

async fn summary() -> Json<SummaryResponse> {
    Json(SummaryResponse {
        generated_at: Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true),
        services_online: 12,
        services_total: 12,
        managed_devices: 148,
        open_requests: 7,
        contacts: 24,
    })
}

async fn contacts() -> Json<Vec<Contact>> {
    Json(vec![
        Contact { id: 1, name: "Сотрудник 01", role: "Координатор", department: "Администрация", extension: "201", status: "online" },
        Contact { id: 2, name: "Сотрудник 02", role: "Специалист", department: "Финансы", extension: "214", status: "away" },
        Contact { id: 3, name: "Сотрудник 03", role: "Руководитель группы", department: "Проекты", extension: "227", status: "online" },
        Contact { id: 4, name: "Сотрудник 04", role: "Инженер", department: "Эксплуатация", extension: "233", status: "offline" },
    ])
}

async fn not_found() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "not found")
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/summary", get(summary))
        .route("/api/contacts", get(contacts))
        .fallback(not_found)
        .layer(TraceLayer::new_for_http());

    let address = SocketAddr::from(([0, 0, 0, 0], 8000));
    let listener = tokio::net::TcpListener::bind(address).await.expect("bind API listener");
    info!(%address, "IT Portal API started");
    axum::serve(listener, app).with_graceful_shutdown(shutdown_signal()).await.expect("serve API");
}

async fn shutdown_signal() {
    let _ = tokio::signal::ctrl_c().await;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn summary_is_consistent() {
        let Json(value) = summary().await;
        assert!(value.services_online <= value.services_total);
        assert!(value.managed_devices > 0);
    }
}

