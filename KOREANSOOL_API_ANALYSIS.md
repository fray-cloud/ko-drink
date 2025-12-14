# Koreansool.kr PHP API 분석 문서

## 📋 개요

**대상 사이트**: `http://koreansool.kr/ktw/php/home.php`  
**분석 일자**: 2025-01-27  
**서버**: nginx  
**세션 관리**: PHPSESSID (Cookie 기반)  
**응답 형식**: HTML (text/html; charset=UTF-8)

---

## 🔍 발견된 API 엔드포인트

### 1. 홈 페이지

**엔드포인트**: `GET /ktw/php/home.php`

**요청 예제**:

```bash
curl "http://koreansool.kr/ktw/php/home.php" \
  -H "User-Agent: Mozilla/5.0"
```

**응답 헤더**:

```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html; charset=UTF-8
Content-Length: 3456
Set-Cookie: PHPSESSID=5c3b7gio2f4hi3t9rqg776uhf5; path=/
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
```

**응답 내용**: HTML 페이지 (검색 폼 포함)

**주요 기능**:

- 검색어 입력 폼
- 통계 정보 표시 (문헌 131개, 방문 수 등)
- 메뉴 링크 (DB 소개, 문헌 정보, 도움말 등)

---

### 2. 검색 API

**엔드포인트**: `GET /ktw/php/print_table.php`

**파라미터**:

- `table` (required): `SEARCH` 고정값
- `_search_txt` (required): 검색어 (URL 인코딩 필요)

**요청 예제**:

```bash
curl "http://koreansool.kr/ktw/php/print_table.php?table=SEARCH&_search_txt=상용주" \
  -H "User-Agent: Mozilla/5.0"
```

**응답 형식**: HTML (검색 결과 테이블)

**응답 구조**:

- 검색 결과는 HTML 테이블로 반환
- 각 결과는 주방문(酒方文) 정보 포함
- 레시피 단계별 정보 (밑술, 덧술, 덧술2 등)
- 원문/번역문 토글 기능

**응답 예시**:

```html
<table class="table_rcp">
  <tr class="tr_rcp_title">
    <td>보덕공비망록 - 삼해주(三亥酒)</td>
  </tr>
  <tr class="tr_rcp_grid">
    <td>밑술</td>
    <td>1</td>
    <td>12</td>
    <!-- ... 레시피 데이터 ... -->
  </tr>
</table>
```

**데이터 필드** (레시피 테이블):

- 단계 (밑술, 덧술, 덧술2 등)
- 일 (날짜)
- 발효 (발효 기간)
- 멥쌀, 찹쌀, 침미 (재료)
- 물, 장수, 탕혼, 냉혼
- 가공 (백설기, 범벅, 고두밥 등)
- 살수, 침숙
- 누룩, 누룩형태
- 침국, 녹국, 밀분, 석임
- 여과, 가주, 온혼, 보쌈, 밀봉
- 메모 (상세 설명)

---

### 3. 문헌 정보 API

**엔드포인트**: `GET /ktw/php/print_table.php?table=book`

**파라미터**:

- `table` (required): `book` 고정값

**요청 예제**:

```bash
curl "http://koreansool.kr/ktw/php/print_table.php?table=book" \
  -H "User-Agent: Mozilla/5.0"
```

**응답 형식**: HTML (문헌 목록)

**응답 구조**:

- 문헌 목록 (131개)
- 각 문헌별 정보:
  - 문헌명 (한글/한문)
  - 저자, 연도
  - 설명
  - 원본 링크
  - 참조 링크
  - 레시피 링크

**주요 문헌 예시**:

- 계원필경 (최치원, 886년)
- 고려도경 (서긍, 1123년)
- 보덕공비망록
- 산가요록 (전순의, 1450년)
- 등 131개

---

### 4. 레시피 상세 API

**엔드포인트**: `GET /ktw/php/recipe.php`

**파라미터**:

- `book` (required): 문헌명 (URL 인코딩)
- `liq` (required): 술 이름 (URL 인코딩)
- `dup` (optional): 중복 번호
- `_method` (optional): `simple` 등
- `_action` (optional): `go` 등

**요청 예제**:

```bash
curl "http://koreansool.kr/ktw/php/recipe.php?book=%EB%B3%B4%EB%8D%95%EA%B3%B5%EB%B9%84%EB%A7%9D%EB%A1%9D&liq=%EC%82%BC%ED%95%B4%EC%A3%BC&dup=1" \
  -H "User-Agent: Mozilla/5.0"
```

**응답 형식**: HTML (상세 레시피 정보)

---

### 5. 원본 이미지 API

**엔드포인트**: `GET /ktw/php/print_org_img.php`

**파라미터**:

- `book` (required): 문헌명
- `liq` (required): 술 이름
- `dup` (optional): 중복 번호

**요청 예제**:

```bash
curl "http://koreansool.kr/ktw/php/print_org_img.php?book=보덕공비망록&liq=삼해주&dup=1" \
  -H "User-Agent: Mozilla/5.0"
```

**응답 형식**: 이미지 (JPEG/PNG 추정)

---

### 6. 유사 방문 API

**엔드포인트**: `GET /ktw/php/anal1.php`

**파라미터**:

- `book` (required): 문헌명
- `liq` (required): 술 이름
- `dup` (required): 중복 번호

**용도**: 유사한 주방문 찾기

---

### 7. 참조 정보 API

**엔드포인트**: `GET /ktw/php/print_table.php?table=ref`

**파라미터**:

- `table` (required): `ref` 고정값

**용도**: 참조 정보 목록 조회

---

### 8. 기타 페이지

- `GET /ktw/php/intro.php` - DB 소개 페이지
- `GET /ktw/php/help.php` - 도움말 페이지
- `GET /ktw/php/fomula.php` - 술 공식 페이지

---

## 📊 API 요청/응답 패턴 분석

### 공통 요청 헤더

```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: ko-KR,ko;q=0.9
```

### 공통 응답 헤더

```
Server: nginx
Content-Type: text/html; charset=UTF-8
Set-Cookie: PHPSESSID=[session_id]; path=/
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
```

### 세션 관리

- **방식**: Cookie 기반 세션 (PHPSESSID)
- **경로**: `/` (전체 사이트)
- **만료**: 세션 쿠키 (브라우저 종료 시 만료)

---

## 🔐 인증 및 보안

### 인증 방식

- **인증 필요**: 없음 (공개 API)
- **세션**: 선택적 (PHPSESSID 쿠키 사용)

### CORS 정책

- 브라우저에서 직접 호출 가능 (CORS 에러 없음)
- 단, HTML 응답이므로 JSON 파싱 불가

### 보안 헤더

- 캐시 제어: `no-store, no-cache, must-revalidate`
- 세션 보안: 기본 PHP 세션 보안

---

## 📝 실제 사용 예제

### 1. 검색 기능 사용

```bash
# 검색어: "상용주"
curl "http://koreansool.kr/ktw/php/print_table.php?table=SEARCH&_search_txt=상용주" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Accept: text/html"
```

### 2. 문헌 목록 조회

```bash
curl "http://koreansool.kr/ktw/php/print_table.php?table=book" \
  -H "User-Agent: Mozilla/5.0"
```

### 3. 특정 레시피 조회

```bash
# 보덕공비망록의 삼해주 레시피
curl "http://koreansool.kr/ktw/php/recipe.php?book=%EB%B3%B4%EB%8D%95%EA%B3%B5%EB%B9%84%EB%A7%9D%EB%A1%9D&liq=%EC%82%BC%ED%95%B4%EC%A3%BC&dup=1" \
  -H "User-Agent: Mozilla/5.0"
```

---

## 🛠️ 데이터 추출 방법

### HTML 파싱 필요

이 API는 JSON이 아닌 HTML을 반환하므로, 데이터를 사용하려면:

1. **HTML 파싱 라이브러리 사용**

   - Cheerio (Node.js)
   - BeautifulSoup (Python)
   - jsdom (JavaScript)

2. **정규표현식 사용**

   - 간단한 데이터 추출에 유용

3. **DOM 셀렉터 사용**
   - 클래스명 기반 추출
   - 예: `.table_rcp`, `.tr_rcp_grid` 등

### 데이터 구조 예시

```html
<!-- 검색 결과 구조 -->
<table class="table_rcp">
  <tr class="tr_rcp_title">
    <td>문헌명 - 술이름</td>
  </tr>
  <tr class="tr_rcp_grid">
    <td>단계</td>
    <td>일</td>
    <td>발효</td>
    <!-- ... 데이터 필드들 ... -->
  </tr>
</table>
```

---

## 📋 파라미터 상세 분석

### print_table.php 파라미터

| 파라미터      | 타입   | 필수 | 설명                            | 예시                    |
| ------------- | ------ | ---- | ------------------------------- | ----------------------- |
| `table`       | string | Yes  | 테이블 타입                     | `SEARCH`, `book`, `ref` |
| `_search_txt` | string | No   | 검색어 (table=SEARCH일 때 필수) | `상용주`                |

### recipe.php 파라미터

| 파라미터  | 타입   | 필수 | 설명                 | 예시                                                     |
| --------- | ------ | ---- | -------------------- | -------------------------------------------------------- |
| `book`    | string | Yes  | 문헌명 (URL 인코딩)  | `%EB%B3%B4%EB%8D%95%EA%B3%B5%EB%B9%84%EB%A7%9D%EB%A1%9D` |
| `liq`     | string | Yes  | 술 이름 (URL 인코딩) | `%EC%82%BC%ED%95%B4%EC%A3%BC`                            |
| `dup`     | number | No   | 중복 번호            | `1`                                                      |
| `_method` | string | No   | 메서드 타입          | `simple`                                                 |
| `_action` | string | No   | 액션                 | `go`                                                     |

---

## 🚨 제약사항 및 주의사항

### 1. 응답 형식

- **JSON 미지원**: 모든 응답이 HTML 형식
- **파싱 필요**: 데이터 추출을 위해 HTML 파싱 필수

### 2. 인코딩

- **URL 인코딩 필수**: 한글 파라미터는 반드시 URL 인코딩 필요
- **문자셋**: UTF-8

### 3. 세션

- **선택적 사용**: PHPSESSID 쿠키는 선택사항
- **상태 유지**: 일부 기능은 세션 필요할 수 있음

### 4. Rate Limiting

- 확인되지 않음 (추가 테스트 필요)

### 5. 에러 처리

- HTML 에러 페이지 반환 가능
- HTTP 상태 코드 확인 필요

---

## 💡 활용 방안

### 1. 데이터 수집

- HTML 파싱을 통한 레시피 데이터베이스 구축
- 문헌 정보 수집 및 정리

### 2. 검색 기능 구현

- 프론트엔드에서 검색 API 호출
- 결과를 파싱하여 표시

### 3. 레시피 상세 페이지

- recipe.php를 통한 상세 정보 표시
- 원본 이미지 연동

### 4. 데이터 분석

- 레시피 데이터 분석
- 통계 정보 생성

---

## 📚 참고 정보

### 사이트 통계 (home.php에서 확인)

- 문헌: 131개
- 방문: 3,506개
  - 술: 2,863개
  - 누룩: 193개
  - 기타: 450개
- 마지막 업데이트: 2025-10-22

### 추천 검색어

- "상용주, 청주, 소주에 따른 누룩 사용량"

---

## 🔄 다음 단계

1. **HTML 파싱 로직 개발**

   - 검색 결과 파싱
   - 레시피 데이터 추출
   - 문헌 정보 추출

2. **API 래퍼 개발**

   - TypeScript/JavaScript 클라이언트
   - HTML 파싱 유틸리티
   - 타입 정의

3. **에러 처리**

   - 네트워크 에러 처리
   - 파싱 에러 처리
   - 재시도 로직

4. **캐싱 전략**
   - 검색 결과 캐싱
   - 문헌 목록 캐싱

---

**작성일**: 2025-01-27  
**작성자**: AI Assistant  
**버전**: 1.0  
**분석 방법**: 실제 HTTP 요청을 통한 분석
