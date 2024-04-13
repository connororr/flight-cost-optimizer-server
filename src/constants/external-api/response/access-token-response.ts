export interface AccessTokenResponse {
    type: string,
    username: string,
    application_name: string,
    client_id: string,
    token_typ: string,
    access_token: string,
    expires_in: number,
    state: string,
    scope: string
}