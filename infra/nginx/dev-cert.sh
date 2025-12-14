#!/bin/bash

# SSL 인증서 생성 스크립트
# 개발 환경용 자체 서명 인증서 생성

SSL_DIR="./ssl"
SSL_KEY="$SSL_DIR/nginx.key"
SSL_CERT="$SSL_DIR/nginx.crt"
CERT_VALIDITY_DAYS=365

# 인증서 생성 함수
create_certificate() {
    echo "SSL 인증서를 생성 중입니다..."
    openssl req -x509 -nodes -days "$CERT_VALIDITY_DAYS" -newkey rsa:2048 \
        -keyout "$SSL_KEY" \
        -out "$SSL_CERT" \
        -subj "/C=KR/ST=Seoul/L=Seoul/O=Kephas/OU=Development/CN=localhost"
    
    echo "SSL 인증서가 생성되었습니다:"
    echo "  - Private Key: $SSL_KEY"
    echo "  - Certificate: $SSL_CERT"
    echo ""
    echo "개발 환경에서 사용할 수 있습니다."
}

# 인증서 만료 확인 함수
# 반환값: 0=만료됨/없음, 1=유효함
is_certificate_expired() {
    # 인증서 파일 존재 및 읽기 가능 여부 확인
    if [ ! -f "$SSL_CERT" ] || [ ! -r "$SSL_CERT" ]; then
        return 0  # 인증서가 없거나 읽을 수 없으면 만료된 것으로 간주
    fi
    
    # openssl의 -checkend 옵션을 사용하여 인증서가 0초 후에도 유효한지 확인
    # 0초는 현재 시점을 의미하므로, 이 명령어가 성공하면 인증서가 아직 유효함
    if openssl x509 -checkend 0 -noout -in "$SSL_CERT" >/dev/null 2>&1; then
        return 1  # 아직 유효함
    else
        return 0  # 만료됨 또는 유효하지 않음
    fi
}

# 메인 로직
if [ -d "$SSL_DIR" ]; then
    # 1. ssl 폴더가 있을 경우
    if [ -f "$SSL_KEY" ] && [ -f "$SSL_CERT" ]; then
        # 1.1.1 인증서가 있는 경우 - 만료 확인
        if is_certificate_expired; then
            echo "인증서가 만료되었거나 유효하지 않습니다. 재생성합니다."
            create_certificate
        else
            echo "유효한 SSL 인증서가 이미 존재합니다."
            echo "  - Private Key: $SSL_KEY"
            echo "  - Certificate: $SSL_CERT"
        fi
    else
        # 1.1.2 인증서가 없는 경우 생성
        echo "SSL 인증서 파일이 없습니다. 생성합니다."
        create_certificate
    fi
else
    # 2. ssl 폴더가 없는 경우 생성
    echo "SSL 디렉토리가 없습니다. 생성합니다."
    mkdir -p "$SSL_DIR"
    create_certificate
fi 

