CREATE TABLE IF NOT EXISTS user_entities (
    id VARCHAR(1000) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_credentials (
    credential_id VARCHAR(1000) PRIMARY KEY,
    user_entity_user_id VARCHAR(1000) NOT NULL REFERENCES user_entities(id) ON DELETE CASCADE,
    public_key BYTEA NOT NULL,
    signature_count BIGINT,
    uv_initialized BOOLEAN,
    backup_eligible BOOLEAN NOT NULL,
    authenticator_transports VARCHAR(1000),
    public_key_credential_type VARCHAR(100),
    backup_state BOOLEAN NOT NULL,
    attestation_object BYTEA,
    attestation_client_data_json BYTEA,
    created TIMESTAMP,
    last_used TIMESTAMP,
    label VARCHAR(1000) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_user_entity
    ON user_credentials(user_entity_user_id);
