# 요리 레시피 관리 시스템

## 프로젝트 분석·설계서 및 Codex 구현 명세서

> 문서 목적: 이 문서는 프로젝트의 요구사항, 시스템 구조, 데이터베이스,
> API 계약, 권한, 테스트 및 제출 기준을 정의한다. Codex는 본 문서를 구현
> 기준(source of truth)으로 사용한다. 구현 과정에서 API 경로, 필드명,
> 상태 코드 또는 권한 규칙을 임의로 변경하지 않는다. 변경이 필요하면
> 먼저 문서를 갱신한다.

------------------------------------------------------------------------

# 0. 프로젝트 기본 정보

  -----------------------------------------------------------------------
  항목                                내용
  ----------------------------------- -----------------------------------
  프로젝트명                          요리 레시피 관리 시스템

  영문명                              Cooking Recipe Management System

  프로젝트 유형                       REST API 기반 웹 애플리케이션

  Backend                             Node.js, Express.js

  Database                            MySQL

  ORM                                 Prisma

  인증                                JWT

  비밀번호 암호화                     bcrypt

  API 테스트                          Jest, Supertest

  API 문서                            OpenAPI 3.0 / Swagger UI

  Frontend                            HTML, CSS, JavaScript, Bootstrap
                                      (별도 구현 가능)

  기본 언어                           API 및 코드 식별자는 영어, 보고서
                                      설명은 한국어로 작성 가능
  -----------------------------------------------------------------------

## 0.1 프로젝트 한 줄 소개

사용자가 요리 레시피를 검색하고 상세 조리법을 확인하며, 회원은 레시피를
즐겨찾기에 등록하고 평가할 수 있고, 관리자는 레시피·카테고리·재료를
관리할 수 있는 웹 시스템이다.

## 0.2 핵심 목표

1.  요리 레시피 정보를 일관된 구조로 저장하고 조회한다.
2.  카테고리별 레시피 분류와 키워드 검색을 제공한다.
3.  레시피와 재료의 다대다 관계 및 조리 단계 정보를 관리한다.
4.  회원별 즐겨찾기와 리뷰 기능을 제공한다.
5.  Express Router를 도메인별로 분리하고 REST API를 구현한다.
6.  각 핵심 Router API에 대한 자동화 테스트를 작성한다.
7.  API 문서와 프로젝트 실행 방법을 제공한다.

## 0.3 제출 요구사항 반영 전략

  -----------------------------------------------------------------------
  평가 항목                           설계 및 구현 기준
  ----------------------------------- -----------------------------------
  보고서 PDF 제출                     교수님 제공 HWP 양식의 항목과
                                      순서를 유지하여 작성

  프로젝트 폴더 제출                  실행 가능한 전체 소스 코드, Prisma
                                      schema, migration, README 포함

  Router 4개 이상                     업무 Router 5개 구현

  Router별 API 5개 이상               감점 문구의 "5개 이하 미인정"
                                      위험을 피하기 위해 업무 Router마다
                                      6개 구현

  회원 관리 Router 제외               Member Router는 별도 구현하되 업무
                                      Router 개수에 포함하지 않음

  핵심 API 테스트                     업무 Router별 핵심 API 테스트 파일
                                      및 실행 결과 제출

  대면 회의 인증 사진                 실제 대면 회의에서 모든 팀원의
                                      얼굴이 식별되는 사진을 부록에 삽입

  node_modules 삭제                   제출 직전에 node_modules 삭제.
                                      package.json 및 package-lock.json
                                      유지
  -----------------------------------------------------------------------

**중요한 해석:** 과제 설명에는 "5개 이상"과 감점 항목의 "5개 이하 시
미인정"이 함께 있다. 따라서 본 설계는 업무 Router마다 6개 API를
구현한다. Member Router의 API는 업무 Router 수에 포함하지 않는다.

------------------------------------------------------------------------

# 1. 프로젝트 개요 (프로젝트 보고서 1장)

## 1.1 개발 배경

온라인에서 요리 정보를 찾는 사용자는 음식 이름, 재료, 조리 시간 및 조리
방법을 여러 페이지에서 확인해야 하는 경우가 많다. 레시피 정보가 일정한
형식으로 관리되지 않으면 원하는 요리를 검색하거나 필요한 재료를 확인하기
어렵다.

본 프로젝트는 요리 레시피 정보를 하나의 시스템에서 관리하고, 사용자가
카테고리 및 키워드를 이용해 원하는 레시피를 쉽게 찾을 수 있도록 하는
것을 목표로 한다.

## 1.2 개발 목적

-   레시피 정보를 등록·조회·수정·삭제할 수 있는 관리 기능 제공
-   음식 카테고리 및 재료 정보의 체계적인 관리
-   회원별 즐겨찾기 기능 제공
-   레시피별 별점 및 리뷰 기능 제공
-   REST API 설계 및 구현 능력 향상
-   Router별 핵심 API 테스트를 통한 기능 검증

## 1.3 사용자 유형

  -----------------------------------------------------------------------
  사용자                  설명                    주요 권한
  ----------------------- ----------------------- -----------------------
  Guest                   로그인하지 않은 방문자  레시피·카테고리·재료
                                                  조회 및 검색

  Member                  가입 후 로그인한 사용자 Guest 권한 + 즐겨찾기
                                                  및 리뷰 관리, 본인 정보
                                                  관리

  Admin                   관리자 계정             Member 권한 +
                                                  레시피·카테고리·재료
                                                  생성/수정/삭제 및 리뷰
                                                  관리
  -----------------------------------------------------------------------

Admin은 별도의 `role = ADMIN` 값을 갖는 사용자로 구현한다. 회원가입
API를 통해 일반 사용자가 스스로 Admin이 될 수 없어야 한다.

## 1.4 프로젝트 범위

### 포함 범위

-   Recipe Management
-   Category Management
-   Ingredient Management
-   Favorite Management
-   Review Management
-   Member Authentication 및 Profile Management
-   API validation, error handling, authorization
-   자동화 테스트 및 Swagger 문서

### 제외 범위 (초기 버전)

-   온라인 결제
-   식재료 배송 및 재고 관리
-   실시간 채팅
-   AI 기반 레시피 추천
-   외부 소셜 로그인
-   동영상 스트리밍 및 동영상 업로드

------------------------------------------------------------------------

# 2. 요구사항 분석

## 2.1 기능 요구사항

  -----------------------------------------------------------------------
  ID                기능              설명              권한
  ----------------- ----------------- ----------------- -----------------
  FR-01             레시피 목록 조회  레시피 목록과     Guest 이상
                                      페이지 정보 조회  

  FR-02             레시피 상세 조회  재료, 조리 단계,  Guest 이상
                                      카테고리 포함     
                                      상세 조회         

  FR-03             레시피 등록       새 레시피 및      Admin
                                      재료·조리 단계    
                                      등록              

  FR-04             레시피 수정       레시피 정보 및    Admin
                                      하위 항목 수정    

  FR-05             레시피 삭제       레시피 및 종속    Admin
                                      데이터 처리       

  FR-06             레시피 검색       키워드, 카테고리, Guest 이상
                                      난이도 조건 검색  

  FR-07             카테고리 조회     카테고리 목록 및  Guest 이상
                                      상세 조회         

  FR-08             카테고리 관리     카테고리          Admin
                                      생성·수정·삭제    

  FR-09             카테고리별 레시피 특정 카테고리에   Guest 이상
                                      속한 레시피 조회  

  FR-10             재료 조회         재료 목록, 상세   Guest 이상
                                      및 검색           

  FR-11             재료 관리         재료              Admin
                                      생성·수정·삭제    

  FR-12             즐겨찾기 관리     본인의 즐겨찾기   Member
                                      추가·조회·삭제    

  FR-13             리뷰 조회         레시피별 리뷰 및  Guest 이상 /
                                      본인 리뷰 조회    Member

  FR-14             리뷰              본인의 리뷰 관리  Member
                    작성·수정·삭제                      

  FR-15             회원가입·로그인   계정 생성 및 인증 Guest

  FR-16             회원정보 관리     본인 정보 및      Member
                                      비밀번호 관리     
  -----------------------------------------------------------------------

## 2.2 비기능 요구사항

  ID       요구사항        상세 기준
  -------- --------------- ----------------------------------------------
  NFR-01   보안            비밀번호 평문 저장 금지, bcrypt hash 사용
  NFR-02   인증            보호된 API는 유효한 JWT 요구
  NFR-03   권한            Admin 전용 API는 서버에서 role 검사
  NFR-04   입력 검증       필수값, 길이, 범위, 자료형 검증
  NFR-05   데이터 무결성   PK, FK, unique constraint 적용
  NFR-06   오류 처리       공통 JSON 오류 형식 사용
  NFR-07   유지보수성      Router, Controller, Service, Validation 분리
  NFR-08   테스트          핵심 API의 성공·실패 경로 테스트
  NFR-09   성능            목록 API에 pagination 적용
  NFR-10   문서화          README 및 OpenAPI 문서 제공

## 2.3 핵심 업무 규칙

1.  Recipe는 반드시 하나의 Category에 속한다.
2.  Recipe는 여러 Ingredient를 사용할 수 있고 Ingredient는 여러
    Recipe에서 사용될 수 있다.
3.  Recipe의 조리 단계는 `stepNumber` 순서로 정렬한다.
4.  Favorite는 `(userId, recipeId)` 조합이 중복될 수 없다.
5.  Review는 `(userId, recipeId)` 조합당 하나만 허용한다. 다시 평가할
    때는 기존 Review를 수정한다.
6.  Review의 rating은 정수 1\~5만 허용한다.
7.  일반 회원은 본인의 Favorite와 Review만 수정·삭제할 수 있다.
8.  레시피·카테고리·재료의 생성, 수정, 삭제는 Admin만 가능하다.
9.  사용 중인 Category는 기본 정책상 삭제할 수 없다. 먼저 레시피를 다른
    카테고리로 이동하거나 레시피를 정리해야 한다.
10. 사용 중인 Ingredient는 기본 정책상 삭제할 수 없다. 연결된
    RecipeIngredients를 먼저 정리해야 한다.
11. Recipe 삭제 시 RecipeIngredients, RecipeSteps, Favorites, Reviews는
    DB transaction 및 FK cascade 정책에 따라 함께 삭제한다.
12. 회원 탈퇴 정책은 초기 버전에서 구현 범위에 포함하지 않는다. 추후
    추가할 경우 리뷰 익명화 등 데이터 정책을 별도 정의한다.

------------------------------------------------------------------------

# 3. 시스템 아키텍처 및 개발 구조

## 3.1 전체 아키텍처

``` text
[Browser / Frontend]
        |
        | HTTP Request / JSON
        v
[Express Application]
        |
        +--> CORS / JSON Parser
        +--> Authentication Middleware
        +--> Authorization Middleware
        +--> Validation Middleware
        |
        v
[Domain Routers]
        |
        +--> Recipe Router
        +--> Category Router
        +--> Ingredient Router
        +--> Favorite Router
        +--> Review Router
        +--> Member Router (업무 Router 수에서 제외)
        |
        v
[Controller]
        |
        v
[Service / Business Logic]
        |
        v
[Prisma ORM]
        |
        v
[MySQL Database]
```

## 3.2 처리 흐름

1.  Client가 API 요청을 보낸다.
2.  Express가 요청을 수신하고 JSON body를 파싱한다.
3.  인증이 필요한 API는 JWT middleware에서 token을 검증한다.
4.  관리자 전용 API는 Admin middleware에서 role을 확인한다.
5.  Validation middleware 또는 Controller에서 입력값을 검증한다.
6.  Controller가 Service를 호출한다.
7.  Service가 Prisma를 통해 DB를 조회하거나 변경한다.
8.  Controller가 공통 response 형식으로 결과를 반환한다.
9.  오류가 발생하면 공통 error middleware가 처리한다.

## 3.3 권장 폴더 구조

``` text
recipe-management-system/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── env.js
│   ├── lib/
│   │   └── prisma.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── admin.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── not-found.middleware.js
│   │   └── error.middleware.js
│   ├── modules/
│   │   ├── recipes/
│   │   │   ├── recipe.router.js
│   │   │   ├── recipe.controller.js
│   │   │   ├── recipe.service.js
│   │   │   └── recipe.validation.js
│   │   ├── categories/
│   │   │   ├── category.router.js
│   │   │   ├── category.controller.js
│   │   │   ├── category.service.js
│   │   │   └── category.validation.js
│   │   ├── ingredients/
│   │   │   ├── ingredient.router.js
│   │   │   ├── ingredient.controller.js
│   │   │   ├── ingredient.service.js
│   │   │   └── ingredient.validation.js
│   │   ├── favorites/
│   │   │   ├── favorite.router.js
│   │   │   ├── favorite.controller.js
│   │   │   ├── favorite.service.js
│   │   │   └── favorite.validation.js
│   │   ├── reviews/
│   │   │   ├── review.router.js
│   │   │   ├── review.controller.js
│   │   │   ├── review.service.js
│   │   │   └── review.validation.js
│   │   └── members/
│   │       ├── member.router.js
│   │       ├── member.controller.js
│   │       ├── member.service.js
│   │       └── member.validation.js
│   ├── routes/
│   │   └── index.js
│   └── utils/
│       ├── ApiError.js
│       └── asyncHandler.js
├── tests/
│   ├── setup.js
│   ├── helpers/
│   │   └── test-auth.js
│   ├── recipe.test.js
│   ├── category.test.js
│   ├── ingredient.test.js
│   ├── favorite.test.js
│   ├── review.test.js
│   └── member.test.js
├── docs/
│   ├── openapi.yaml
│   └── screenshots/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── PROJECT_SPEC.md
```

**Codex implementation rule:** Mỗi domain phải có Router, Controller,
Service và Validation riêng. Không viết toàn bộ logic nghiệp vụ trong
file Router. Không tạo một Router tổng hợp thay cho 5 Router nghiệp vụ
độc lập.

------------------------------------------------------------------------

# 4. Thiết kế cơ sở dữ liệu

## 4.1 Danh sách bảng

  STT   Table              Mục đích
  ----- ------------------ ------------------------------------
  1     User               Thông tin thành viên và role
  2     Category           Danh mục món ăn
  3     Recipe             Thông tin công thức
  4     Ingredient         Danh mục nguyên liệu
  5     RecipeIngredient   Bảng liên kết Recipe và Ingredient
  6     RecipeStep         Các bước chế biến
  7     Favorite           Danh sách yêu thích
  8     Review             Đánh giá công thức

## 4.2 Chi tiết trường dữ liệu

### Table: User

  Field          Type           Constraint                     Description
  -------------- -------------- ------------------------------ ------------------
  id             INT            PK, auto increment             ID người dùng
  username       VARCHAR(50)    NOT NULL, UNIQUE               Tên đăng nhập
  email          VARCHAR(100)   NOT NULL, UNIQUE               Email
  passwordHash   VARCHAR(255)   NOT NULL                       Mật khẩu đã hash
  role           ENUM           MEMBER/ADMIN, default MEMBER   Quyền
  createdAt      DATETIME       NOT NULL                       Ngày tạo
  updatedAt      DATETIME       NOT NULL                       Ngày cập nhật

Không trả `passwordHash` trong bất kỳ API response nào.

### Table: Category

  Field         Type           Constraint           Description
  ------------- -------------- -------------------- ---------------
  id            INT            PK, auto increment   ID danh mục
  name          VARCHAR(100)   NOT NULL, UNIQUE     Tên danh mục
  description   TEXT           NULL                 Mô tả
  imageUrl      VARCHAR(500)   NULL                 URL hình ảnh
  createdAt     DATETIME       NOT NULL             Ngày tạo
  updatedAt     DATETIME       NOT NULL             Ngày cập nhật

### Table: Recipe

  Field         Type           Constraint              Description
  ------------- -------------- ----------------------- ---------------
  id            INT            PK, auto increment      ID công thức
  categoryId    INT            FK Category, NOT NULL   Danh mục
  createdById   INT            FK User, NOT NULL       Người tạo
  title         VARCHAR(200)   NOT NULL                Tên món
  description   TEXT           NULL                    Mô tả
  imageUrl      VARCHAR(500)   NULL                    Ảnh món ăn
  prepTime      INT            NOT NULL, \>= 0         Phút chuẩn bị
  cookTime      INT            NOT NULL, \>= 0         Phút nấu
  servings      INT            NOT NULL, \> 0          Số khẩu phần
  difficulty    ENUM           EASY/MEDIUM/HARD        Độ khó
  createdAt     DATETIME       NOT NULL                Ngày tạo
  updatedAt     DATETIME       NOT NULL                Ngày cập nhật

### Table: Ingredient

  Field         Type           Constraint           Description
  ------------- -------------- -------------------- -----------------
  id            INT            PK, auto increment   ID nguyên liệu
  name          VARCHAR(100)   NOT NULL, UNIQUE     Tên
  description   TEXT           NULL                 Mô tả
  defaultUnit   VARCHAR(30)    NOT NULL             Đơn vị mặc định
  createdAt     DATETIME       NOT NULL             Ngày tạo
  updatedAt     DATETIME       NOT NULL             Ngày cập nhật

### Table: RecipeIngredient

  Field          Type            Constraint                Description
  -------------- --------------- ------------------------- -------------
  id             INT             PK, auto increment        ID
  recipeId       INT             FK Recipe, NOT NULL       Công thức
  ingredientId   INT             FK Ingredient, NOT NULL   Nguyên liệu
  quantity       DECIMAL(10,2)   NOT NULL, \> 0            Định lượng
  unit           VARCHAR(30)     NOT NULL                  Đơn vị
  note           VARCHAR(255)    NULL                      Ghi chú

Unique constraint: `(recipeId, ingredientId)`.

### Table: RecipeStep

  Field         Type           Constraint            Description
  ------------- -------------- --------------------- --------------
  id            INT            PK, auto increment    ID bước
  recipeId      INT            FK Recipe, NOT NULL   Công thức
  stepNumber    INT            NOT NULL, \> 0        Thứ tự
  instruction   TEXT           NOT NULL              Hướng dẫn
  imageUrl      VARCHAR(500)   NULL                  Ảnh bước nấu

Unique constraint: `(recipeId, stepNumber)`.

### Table: Favorite

  Field       Type       Constraint            Description
  ----------- ---------- --------------------- -------------
  id          INT        PK, auto increment    ID
  userId      INT        FK User, NOT NULL     Thành viên
  recipeId    INT        FK Recipe, NOT NULL   Công thức
  createdAt   DATETIME   NOT NULL              Ngày thêm

Unique constraint: `(userId, recipeId)`.

### Table: Review

  Field       Type       Constraint            Description
  ----------- ---------- --------------------- ----------------
  id          INT        PK, auto increment    ID
  userId      INT        FK User, NOT NULL     Người đánh giá
  recipeId    INT        FK Recipe, NOT NULL   Công thức
  rating      INT        NOT NULL, 1--5        Điểm
  comment     TEXT       NULL                  Nội dung
  createdAt   DATETIME   NOT NULL              Ngày tạo
  updatedAt   DATETIME   NOT NULL              Ngày cập nhật

Unique constraint: `(userId, recipeId)`.

## 4.3 Quan hệ ERD

``` mermaid
erDiagram
    USER ||--o{ RECIPE : creates
    USER ||--o{ FAVORITE : saves
    USER ||--o{ REVIEW : writes
    CATEGORY ||--o{ RECIPE : contains
    RECIPE ||--o{ RECIPE_INGREDIENT : uses
    INGREDIENT ||--o{ RECIPE_INGREDIENT : included_in
    RECIPE ||--o{ RECIPE_STEP : has
    RECIPE ||--o{ FAVORITE : favorited
    RECIPE ||--o{ REVIEW : receives

    USER {
      int id PK
      string username UK
      string email UK
      string passwordHash
      string role
    }
    CATEGORY {
      int id PK
      string name UK
      string description
    }
    RECIPE {
      int id PK
      int categoryId FK
      int createdById FK
      string title
      int prepTime
      int cookTime
      int servings
      string difficulty
    }
    INGREDIENT {
      int id PK
      string name UK
      string defaultUnit
    }
    RECIPE_INGREDIENT {
      int id PK
      int recipeId FK
      int ingredientId FK
      decimal quantity
      string unit
    }
    RECIPE_STEP {
      int id PK
      int recipeId FK
      int stepNumber
      string instruction
    }
    FAVORITE {
      int id PK
      int userId FK
      int recipeId FK
    }
    REVIEW {
      int id PK
      int userId FK
      int recipeId FK
      int rating
      string comment
    }
```

## 4.4 Index và ràng buộc

-   `User.username`: unique.
-   `User.email`: unique.
-   `Category.name`: unique.
-   `Ingredient.name`: unique.
-   `Favorite(userId, recipeId)`: unique.
-   `Review(userId, recipeId)`: unique.
-   `RecipeIngredient(recipeId, ingredientId)`: unique.
-   `RecipeStep(recipeId, stepNumber)`: unique.
-   Index `Recipe.categoryId`, `Recipe.title`, `Review.recipeId`,
    `Favorite.userId`.

Tất cả thao tác tạo Recipe cùng RecipeIngredients và RecipeSteps phải
được thực hiện trong transaction để tránh dữ liệu dở dang.

------------------------------------------------------------------------

# 5. Quy ước API chung

## 5.1 Base URL

Development:

``` text
http://localhost:3000/api
```

Các Router:

  Router       Prefix                                   Số API nghiệp vụ
  ------------ ---------------- ----------------------------------------
  Recipe       `/recipes`                                              6
  Category     `/categories`                                           6
  Ingredient   `/ingredients`                                          6
  Favorite     `/favorites`                                            6
  Review       `/reviews`                                              6
  Member       `/members`         6 (không tính vào số Router nghiệp vụ)

Tổng: 5 Router nghiệp vụ, 30 API nghiệp vụ; Member Router được triển
khai riêng.

## 5.2 HTTP Method

  Method   Ý nghĩa
  -------- ------------------------------------------------------------
  GET      Truy vấn dữ liệu
  POST     Tạo dữ liệu
  PUT      Cập nhật toàn bộ hoặc các trường được hỗ trợ theo contract
  DELETE   Xóa dữ liệu

Với API PUT, tài liệu này cho phép cập nhật các trường được liệt kê; các
trường không gửi sẽ giữ nguyên. Nếu muốn tuân thủ PATCH semantics tuyệt
đối, có thể đổi các endpoint update sang PATCH, nhưng phải cập nhật đồng
bộ báo cáo và test.

## 5.3 Authentication

API cần đăng nhập sử dụng header:

``` http
Authorization: Bearer <accessToken>
```

JWT payload tối thiểu:

``` json
{
  "userId": 12,
  "role": "MEMBER"
}
```

Không tin tưởng `userId` gửi trong request body đối với Favorite và
Review. Server phải lấy user hiện tại từ token.

## 5.4 Response thành công

Danh sách:

``` json
{
  "success": true,
  "message": "Recipes retrieved successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

Một bản ghi:

``` json
{
  "success": true,
  "message": "Recipe retrieved successfully",
  "data": {
    "id": 1,
    "title": "Kimchi Fried Rice"
  }
}
```

Tạo mới:

``` json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "id": 1,
    "title": "Kimchi Fried Rice"
  }
}
```

## 5.5 Response lỗi

``` json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "title",
        "message": "title is required"
      }
    ]
  }
}
```

## 5.6 HTTP Status Code

    Status Ý nghĩa
  -------- ----------------------------------------------
       200 Thành công
       201 Tạo mới thành công
       400 Dữ liệu không hợp lệ
       401 Chưa xác thực hoặc token không hợp lệ
       403 Không đủ quyền
       404 Không tìm thấy tài nguyên
       409 Trùng dữ liệu hoặc vi phạm unique constraint
       500 Lỗi server

## 5.7 Pagination và filter

Các API danh sách sử dụng:

-   `page`: mặc định 1, số nguyên \>= 1.
-   `limit`: mặc định 10, tối đa 100.
-   Thứ tự mặc định: `createdAt desc`.

Response danh sách phải có `data` và `pagination`.

------------------------------------------------------------------------

# 6. API 설계 -- 상세 API Specification

> Đây là phần cần được dùng trực tiếp để lập trình và cũng là nguồn nội
> dung cho mục "API 설계" trong báo cáo HWP. Mỗi Router nghiệp vụ có 6
> API.

# 6.1 Recipe Router -- 레시피 라우터

**Prefix:** `/api/recipes`\
**Mục đích:** Quản lý, tìm kiếm và truy vấn công thức nấu ăn.

## API RCP-01: Lấy danh sách công thức

-   Method: `GET`
-   URL: `/api/recipes`
-   Auth: Không bắt buộc
-   Query:
    -   `page`: number, optional, default 1
    -   `limit`: number, optional, default 10, max 100
    -   `categoryId`: number, optional
    -   `difficulty`: EASY/MEDIUM/HARD, optional
    -   `sort`: newest/oldest, optional, default newest

Response 200:

``` json
{
  "success": true,
  "message": "Recipes retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Kimchi Fried Rice",
      "description": "Korean fried rice with kimchi",
      "imageUrl": null,
      "prepTime": 10,
      "cookTime": 15,
      "servings": 2,
      "difficulty": "EASY",
      "category": {
        "id": 1,
        "name": "Korean Food"
      },
      "averageRating": 4.5,
      "reviewCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## API RCP-02: Xem chi tiết công thức

-   Method: `GET`
-   URL: `/api/recipes/:id`
-   Auth: Không bắt buộc
-   Params:
    -   `id`: number, required, recipe ID

Response 200:

``` json
{
  "success": true,
  "message": "Recipe retrieved successfully",
  "data": {
    "id": 1,
    "title": "Kimchi Fried Rice",
    "description": "Korean fried rice with kimchi",
    "imageUrl": null,
    "prepTime": 10,
    "cookTime": 15,
    "servings": 2,
    "difficulty": "EASY",
    "category": {
      "id": 1,
      "name": "Korean Food"
    },
    "ingredients": [
      {
        "ingredientId": 1,
        "name": "Rice",
        "quantity": 200,
        "unit": "gram",
        "note": null
      },
      {
        "ingredientId": 2,
        "name": "Kimchi",
        "quantity": 100,
        "unit": "gram",
        "note": null
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Prepare the ingredients",
        "imageUrl": null
      },
      {
        "stepNumber": 2,
        "instruction": "Fry kimchi and rice together",
        "imageUrl": null
      }
    ],
    "averageRating": 4.5,
    "reviewCount": 2
  }
}
```

Errors: 400 nếu ID không hợp lệ; 404 nếu không tìm thấy Recipe.

## API RCP-03: Tạo công thức

-   Method: `POST`
-   URL: `/api/recipes`
-   Auth: Admin
-   Body:

  Field         Type          Required   Description
  ------------- ------------- ---------- -------------------------
  title         string        Yes        Tên món
  description   string        No         Mô tả
  categoryId    integer       Yes        ID danh mục tồn tại
  imageUrl      string/null   No         URL ảnh
  prepTime      integer       Yes        \>= 0
  cookTime      integer       Yes        \>= 0
  servings      integer       Yes        \> 0
  difficulty    enum          Yes        EASY/MEDIUM/HARD
  ingredients   array         Yes        Ít nhất một nguyên liệu
  steps         array         Yes        Ít nhất một bước

Body example:

``` json
{
  "title": "Kimchi Fried Rice",
  "description": "Korean fried rice with kimchi",
  "categoryId": 1,
  "imageUrl": null,
  "prepTime": 10,
  "cookTime": 15,
  "servings": 2,
  "difficulty": "EASY",
  "ingredients": [
    {
      "ingredientId": 1,
      "quantity": 200,
      "unit": "gram",
      "note": "Cooked rice"
    },
    {
      "ingredientId": 2,
      "quantity": 100,
      "unit": "gram"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Prepare all ingredients"
    },
    {
      "stepNumber": 2,
      "instruction": "Fry kimchi and rice together"
    }
  ]
}
```

Response 201:

``` json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "id": 1,
    "title": "Kimchi Fried Rice"
  }
}
```

Errors: 400 validation; 401 unauthenticated; 403 non-admin; 404 invalid
category/ingredient.

Business logic: tạo Recipe, RecipeIngredients và RecipeSteps trong một
transaction.

## API RCP-04: Cập nhật công thức

-   Method: `PUT`
-   URL: `/api/recipes/:id`
-   Auth: Admin
-   Params: `id` required.
-   Body: các trường được hỗ trợ trong RCP-03; có thể gửi một phần
    trường. Nếu gửi `ingredients` hoặc `steps`, thay thế toàn bộ danh
    sách tương ứng bằng danh sách mới.

Response 200:

``` json
{
  "success": true,
  "message": "Recipe updated successfully",
  "data": {
    "id": 1,
    "title": "Kimchi Cheese Fried Rice"
  }
}
```

Errors: 400; 401; 403; 404.

Business logic: kiểm tra tồn tại Recipe và các FK; thực hiện thay đổi
liên quan trong transaction.

## API RCP-05: Xóa công thức

-   Method: `DELETE`
-   URL: `/api/recipes/:id`
-   Auth: Admin
-   Params: `id` required.

Response 200:

``` json
{
  "success": true,
  "message": "Recipe deleted successfully",
  "data": {
    "id": 1
  }
}
```

Errors: 401; 403; 404.

Business logic: xóa Recipe và các bản ghi RecipeIngredients,
RecipeSteps, Favorites, Reviews liên quan theo transaction/FK policy.

## API RCP-06: Tìm kiếm công thức

-   Method: `GET`
-   URL: `/api/recipes/search`
-   Auth: Không bắt buộc
-   Query:
    -   `keyword`: string, optional; tìm trong title và description
    -   `categoryId`: integer, optional
    -   `difficulty`: EASY/MEDIUM/HARD, optional
    -   `minPrepTime`: integer, optional
    -   `maxPrepTime`: integer, optional
    -   `page`, `limit`: pagination

Response 200: cùng cấu trúc danh sách RCP-01.

**Lưu ý routing:** khai báo `/search` trước `/:id` trong
recipe.router.js để Express không hiểu chữ `search` là ID.

------------------------------------------------------------------------

# 6.2 Category Router -- 카테고리 라우터

**Prefix:** `/api/categories`\
**Mục đích:** Quản lý danh mục và truy vấn công thức theo danh mục.

## API CAT-01: Lấy danh sách danh mục

-   Method: `GET`
-   URL: `/api/categories`
-   Auth: Không bắt buộc
-   Query: `page`, `limit`

Response 200:

``` json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Korean Food",
      "description": "Traditional and modern Korean dishes",
      "imageUrl": null,
      "recipeCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## API CAT-02: Xem chi tiết danh mục

-   Method: `GET`
-   URL: `/api/categories/:id`
-   Auth: Không bắt buộc
-   Params: `id` integer, required

Response 200:

``` json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Korean Food",
    "description": "Traditional Korean dishes",
    "imageUrl": null,
    "recipeCount": 5
  }
}
```

Errors: 400 invalid ID; 404 not found.

## API CAT-03: Tạo danh mục

-   Method: `POST`
-   URL: `/api/categories`
-   Auth: Admin
-   Body:

  Field         Type          Required   Description
  ------------- ------------- ---------- ----------------------
  name          string        Yes        Tên danh mục, unique
  description   string        No         Mô tả
  imageUrl      string/null   No         URL ảnh

Example:

``` json
{
  "name": "Korean Food",
  "description": "Traditional Korean dishes",
  "imageUrl": null
}
```

Response 201:

``` json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "name": "Korean Food"
  }
}
```

Errors: 400 validation; 401; 403; 409 duplicate name.

## API CAT-04: Cập nhật danh mục

-   Method: `PUT`
-   URL: `/api/categories/:id`
-   Auth: Admin
-   Body: `name`, `description`, `imageUrl`; ít nhất một trường được
    gửi.

Response 200:

``` json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "name": "Korean Cuisine"
  }
}
```

Errors: 400; 401; 403; 404; 409 duplicate name.

## API CAT-05: Xóa danh mục

-   Method: `DELETE`
-   URL: `/api/categories/:id`
-   Auth: Admin

Response 200:

``` json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {
    "id": 1
  }
}
```

Errors: 401; 403; 404; 409 nếu vẫn còn Recipe liên kết.

## API CAT-06: Lấy công thức theo danh mục

-   Method: `GET`
-   URL: `/api/categories/:id/recipes`
-   Auth: Không bắt buộc
-   Params: `id` category ID
-   Query: `page`, `limit`, `sort`

Response 200: danh sách Recipe và pagination như RCP-01.

Errors: 400 invalid ID; 404 category not found.

------------------------------------------------------------------------

# 6.3 Ingredient Router -- 재료 라우터

**Prefix:** `/api/ingredients`\
**Mục đích:** Quản lý dữ liệu nguyên liệu dùng trong các công thức.

## API ING-01: Lấy danh sách nguyên liệu

-   Method: `GET`
-   URL: `/api/ingredients`
-   Auth: Không bắt buộc
-   Query: `page`, `limit`

Response 200:

``` json
{
  "success": true,
  "message": "Ingredients retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Rice",
      "description": "White rice",
      "defaultUnit": "gram"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## API ING-02: Xem chi tiết nguyên liệu

-   Method: `GET`
-   URL: `/api/ingredients/:id`
-   Auth: Không bắt buộc

Response 200:

``` json
{
  "success": true,
  "message": "Ingredient retrieved successfully",
  "data": {
    "id": 1,
    "name": "Rice",
    "description": "White rice",
    "defaultUnit": "gram"
  }
}
```

Errors: 400 invalid ID; 404 not found.

## API ING-03: Tạo nguyên liệu

-   Method: `POST`
-   URL: `/api/ingredients`
-   Auth: Admin
-   Body:

  Field         Type     Required   Description
  ------------- -------- ---------- -------------------------
  name          string   Yes        Tên nguyên liệu, unique
  description   string   No         Mô tả
  defaultUnit   string   Yes        Đơn vị mặc định

Example:

``` json
{
  "name": "Rice",
  "description": "White rice",
  "defaultUnit": "gram"
}
```

Response 201:

``` json
{
  "success": true,
  "message": "Ingredient created successfully",
  "data": {
    "id": 1,
    "name": "Rice",
    "defaultUnit": "gram"
  }
}
```

Errors: 400; 401; 403; 409 duplicate name.

## API ING-04: Cập nhật nguyên liệu

-   Method: `PUT`
-   URL: `/api/ingredients/:id`
-   Auth: Admin
-   Body: `name`, `description`, `defaultUnit`; ít nhất một trường.

Response 200:

``` json
{
  "success": true,
  "message": "Ingredient updated successfully",
  "data": {
    "id": 1,
    "name": "Jasmine Rice",
    "defaultUnit": "gram"
  }
}
```

Errors: 400; 401; 403; 404; 409.

## API ING-05: Xóa nguyên liệu

-   Method: `DELETE`
-   URL: `/api/ingredients/:id`
-   Auth: Admin

Response 200:

``` json
{
  "success": true,
  "message": "Ingredient deleted successfully",
  "data": {
    "id": 1
  }
}
```

Errors: 401; 403; 404; 409 nếu nguyên liệu còn được Recipe sử dụng.

## API ING-06: Tìm kiếm nguyên liệu

-   Method: `GET`
-   URL: `/api/ingredients/search`
-   Auth: Không bắt buộc
-   Query:
    -   `keyword`: string, required
    -   `page`, `limit`: optional

Response 200: danh sách Ingredient và pagination.

**Lưu ý routing:** khai báo `/search` trước `/:id`.

------------------------------------------------------------------------

# 6.4 Favorite Router -- 즐겨찾기 라우터

**Prefix:** `/api/favorites`\
**Mục đích:** Quản lý danh sách công thức yêu thích của thành viên.

Tất cả API trong Router này yêu cầu Member hoặc Admin đã đăng nhập. Dữ
liệu chỉ thuộc về user hiện tại; không nhận `userId` từ body.

## API FAV-01: Lấy danh sách yêu thích của tôi

-   Method: `GET`
-   URL: `/api/favorites`
-   Auth: Member
-   Query: `page`, `limit`

Response 200:

``` json
{
  "success": true,
  "message": "Favorites retrieved successfully",
  "data": [
    {
      "id": 10,
      "recipe": {
        "id": 1,
        "title": "Kimchi Fried Rice",
        "imageUrl": null,
        "difficulty": "EASY"
      },
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## API FAV-02: Xem chi tiết một mục yêu thích

-   Method: `GET`
-   URL: `/api/favorites/:id`
-   Auth: Member

Response 200:

``` json
{
  "success": true,
  "message": "Favorite retrieved successfully",
  "data": {
    "id": 10,
    "recipeId": 1,
    "recipeTitle": "Kimchi Fried Rice"
  }
}
```

Nếu mục yêu thích không thuộc user hiện tại, trả 404 để không tiết lộ dữ
liệu của người khác.

## API FAV-03: Thêm công thức vào yêu thích

-   Method: `POST`
-   URL: `/api/favorites`
-   Auth: Member
-   Body:

``` json
{
  "recipeId": 1
}
```

Response 201:

``` json
{
  "success": true,
  "message": "Recipe added to favorites",
  "data": {
    "id": 10,
    "recipeId": 1
  }
}
```

Errors: 400 invalid recipeId; 401; 404 recipe not found; 409 đã yêu
thích trước đó.

## API FAV-04: Xóa mục yêu thích theo ID

-   Method: `DELETE`
-   URL: `/api/favorites/:id`
-   Auth: Member

Response 200:

``` json
{
  "success": true,
  "message": "Favorite removed successfully",
  "data": {
    "id": 10
  }
}
```

Errors: 401; 404 nếu không tồn tại hoặc không thuộc user hiện tại.

## API FAV-05: Kiểm tra một công thức đã được yêu thích chưa

-   Method: `GET`
-   URL: `/api/favorites/recipe/:recipeId`
-   Auth: Member

Response 200:

``` json
{
  "success": true,
  "message": "Favorite status retrieved successfully",
  "data": {
    "recipeId": 1,
    "isFavorite": true,
    "favoriteId": 10
  }
}
```

Nếu chưa yêu thích: `isFavorite: false`, `favoriteId: null`.

## API FAV-06: Xóa yêu thích theo Recipe ID

-   Method: `DELETE`
-   URL: `/api/favorites/recipe/:recipeId`
-   Auth: Member

Response 200:

``` json
{
  "success": true,
  "message": "Recipe removed from favorites",
  "data": {
    "recipeId": 1
  }
}
```

Errors: 401; 404 nếu user chưa lưu công thức này.

------------------------------------------------------------------------

# 6.5 Review Router -- 리뷰 라우터

**Prefix:** `/api/reviews`\
**Mục đích:** Cho phép thành viên đánh giá và nhận xét về công thức.

## API REV-01: Lấy review theo Recipe ID

-   Method: `GET`
-   URL: `/api/reviews/recipe/:recipeId`
-   Auth: Không bắt buộc
-   Query: `page`, `limit`, `sort` (newest/highest/lowest)

Response 200:

``` json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "id": 5,
      "rating": 5,
      "comment": "Very delicious",
      "user": {
        "id": 12,
        "username": "foodlover"
      },
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ],
  "summary": {
    "averageRating": 5,
    "reviewCount": 1
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## API REV-02: Xem chi tiết review

-   Method: `GET`
-   URL: `/api/reviews/:id`
-   Auth: Không bắt buộc

Response 200:

``` json
{
  "success": true,
  "message": "Review retrieved successfully",
  "data": {
    "id": 5,
    "recipeId": 1,
    "rating": 5,
    "comment": "Very delicious",
    "user": {
      "id": 12,
      "username": "foodlover"
    }
  }
}
```

Errors: 400 invalid ID; 404 not found.

## API REV-03: Tạo review

-   Method: `POST`
-   URL: `/api/reviews`
-   Auth: Member
-   Body:

``` json
{
  "recipeId": 1,
  "rating": 5,
  "comment": "Very delicious"
}
```

  Field      Type      Required   Rule
  ---------- --------- ---------- ---------------------
  recipeId   integer   Yes        Recipe phải tồn tại
  rating     integer   Yes        1 đến 5
  comment    string    No         Tối đa 2000 ký tự

Response 201:

``` json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": 5,
    "recipeId": 1,
    "rating": 5,
    "comment": "Very delicious"
  }
}
```

Errors: 400 invalid rating; 401; 404 recipe not found; 409 đã review
Recipe này.

## API REV-04: Cập nhật review của tôi

-   Method: `PUT`
-   URL: `/api/reviews/:id`
-   Auth: Member
-   Body: `rating` và/hoặc `comment`.

Response 200:

``` json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": 5,
    "rating": 4,
    "comment": "Good recipe"
  }
}
```

Errors: 400; 401; 404 nếu review không tồn tại hoặc không thuộc user
hiện tại.

## API REV-05: Xóa review

-   Method: `DELETE`
-   URL: `/api/reviews/:id`
-   Auth: Member là chủ review; Admin có thể xóa review theo quyền kiểm
    duyệt.

Response 200:

``` json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "id": 5
  }
}
```

Errors: 401; 403 nếu không phải chủ review và không phải Admin; 404 nếu
không tồn tại.

## API REV-06: Lấy review của tôi

-   Method: `GET`
-   URL: `/api/reviews/my-reviews`
-   Auth: Member
-   Query: `page`, `limit`

Response 200:

``` json
{
  "success": true,
  "message": "My reviews retrieved successfully",
  "data": [
    {
      "id": 5,
      "recipe": {
        "id": 1,
        "title": "Kimchi Fried Rice"
      },
      "rating": 5,
      "comment": "Very delicious",
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

------------------------------------------------------------------------

# 6.6 Member Router -- 회원 라우터 (업무 Router 개수에서 제외)

**Prefix:** `/api/members`\
**Mục đích:** Đăng ký, đăng nhập và quản lý thông tin cá nhân.

## API MEM-01: Đăng ký

-   Method: `POST`
-   URL: `/api/members/register`
-   Auth: Không
-   Body:

``` json
{
  "username": "foodlover",
  "email": "foodlover@example.com",
  "password": "StrongPassword123"
}
```

Response 201:

``` json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": 12,
    "username": "foodlover",
    "email": "foodlover@example.com",
    "role": "MEMBER"
  }
}
```

Không trả password hoặc passwordHash. Role luôn là MEMBER khi đăng ký
công khai.

## API MEM-02: Đăng nhập

-   Method: `POST`
-   URL: `/api/members/login`
-   Auth: Không
-   Body:

``` json
{
  "email": "foodlover@example.com",
  "password": "StrongPassword123"
}
```

Response 200:

``` json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<JWT>",
    "user": {
      "id": 12,
      "username": "foodlover",
      "email": "foodlover@example.com",
      "role": "MEMBER"
    }
  }
}
```

## API MEM-03: Lấy thông tin tài khoản hiện tại

-   Method: `GET`
-   URL: `/api/members/me`
-   Auth: Member/Admin

Response 200:

``` json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 12,
    "username": "foodlover",
    "email": "foodlover@example.com",
    "role": "MEMBER"
  }
}
```

## API MEM-04: Cập nhật thông tin tài khoản

-   Method: `PUT`
-   URL: `/api/members/me`
-   Auth: Member/Admin
-   Body: `username` và/hoặc `email`.

Response 200: profile mới, không chứa passwordHash.

## API MEM-05: Đổi mật khẩu

-   Method: `PUT`
-   URL: `/api/members/change-password`
-   Auth: Member/Admin
-   Body:

``` json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

Server phải kiểm tra currentPassword trước khi cập nhật hash mới.

## API MEM-06: Đăng xuất

-   Method: `POST`
-   URL: `/api/members/logout`
-   Auth: Member/Admin

Nếu dùng access JWT stateless, logout ở client chỉ xóa token không làm
token hết hiệu lực ngay trên server. Để logout server-side thực sự, phải
có token blacklist hoặc refresh-token/session store. Chọn một phương án
và ghi rõ trong README. Không được tuyên bố token đã bị vô hiệu hóa nếu
backend không thực hiện việc đó.

------------------------------------------------------------------------

# 7. Quy tắc phân quyền tổng hợp

  API Group                       Guest        Member                   Admin
  ----------------------------- ------- ------------- -----------------------
  GET recipes                       Yes           Yes                     Yes
  POST/PUT/DELETE recipes            No            No                     Yes
  GET categories                    Yes           Yes                     Yes
  POST/PUT/DELETE categories         No            No                     Yes
  GET ingredients                   Yes           Yes                     Yes
  POST/PUT/DELETE ingredients        No            No                     Yes
  Favorite APIs                      No      Own data                Own data
  Review GET                        Yes           Yes                     Yes
  Review POST/PUT                    No      Own data                Own data
  Review DELETE                      No      Own data   Own data + moderation
  Member register/login             Yes           Yes                     Yes
  Member profile                     No   Own profile             Own profile

**Security rules:**

-   Không cho phép client tự gửi role để nâng quyền.
-   Không lấy `userId` từ body/query để xác định chủ sở hữu
    Favorite/Review.
-   Không trả passwordHash.
-   Không để lộ stack trace hoặc secret trong production response.
-   JWT secret phải lấy từ environment variable.
-   Không commit `.env` thật lên Git.

------------------------------------------------------------------------

# 8. Kiểm thử API (라우터 별 핵심 API 테스트 코드 및 결과)

## 8.1 Công nghệ

-   Jest: Test runner và assertion.
-   Supertest: Gửi request đến Express app.
-   Database test riêng: không sử dụng dữ liệu production.
-   Seed hoặc factory: tạo dữ liệu cần thiết trước test.

## 8.2 Quy tắc test

1.  Mỗi Router nghiệp vụ có một test file riêng.
2.  Mỗi Router có ít nhất hai API cốt lõi được kiểm thử.
3.  Mỗi API cốt lõi phải có test thành công và test lỗi phù hợp.
4.  Kiểm tra HTTP status, response JSON và dữ liệu DB.
5.  Dọn dữ liệu test sau mỗi test hoặc dùng transaction/fixture cô lập.
6.  Test quyền Guest/Member/Admin.
7.  Không ghi kết quả "PASS" trong báo cáo nếu chưa thực sự chạy test.

## 8.3 Ma trận test tối thiểu

### Recipe Router

  Test ID   API                Scenario                  Expected
  --------- ------------------ ------------------------- ----------
  RCP-T01   POST /recipes      Admin tạo recipe hợp lệ   201
  RCP-T02   POST /recipes      Member tạo recipe         403
  RCP-T03   GET /recipes/:id   ID tồn tại                200
  RCP-T04   GET /recipes/:id   ID không tồn tại          404
  RCP-T05   POST /recipes      Thiếu title               400
  RCP-T06   PUT /recipes/:id   Admin cập nhật            200

### Category Router

  Test ID   API                      Scenario                  Expected
  --------- ------------------------ ------------------------- ----------
  CAT-T01   POST /categories         Admin tạo category        201
  CAT-T02   POST /categories         Tên trùng                 409
  CAT-T03   GET /categories          Lấy danh sách             200
  CAT-T04   DELETE /categories/:id   Category đang được dùng   409

### Ingredient Router

  Test ID   API                       Scenario                    Expected
  --------- ------------------------- --------------------------- ----------
  ING-T01   POST /ingredients         Admin tạo ingredient        201
  ING-T02   POST /ingredients         Tên trùng                   409
  ING-T03   GET /ingredients/search   Tìm kiếm hợp lệ             200
  ING-T04   DELETE /ingredients/:id   Ingredient đang được dùng   409

### Favorite Router

  -----------------------------------------------------------------------
  Test ID           API               Scenario          Expected
  ----------------- ----------------- ----------------- -----------------
  FAV-T01           POST /favorites   Member thêm       201
                                      favorite          

  FAV-T02           POST /favorites   Thêm trùng        409

  FAV-T03           GET /favorites    Lấy danh sách của 200
                                      tôi               

  FAV-T04           GET               Truy cập favorite 404
                    /favorites/:id    của người khác    
  -----------------------------------------------------------------------

### Review Router

  Test ID   API                Scenario                    Expected
  --------- ------------------ --------------------------- ----------
  REV-T01   POST /reviews      Review rating hợp lệ        201
  REV-T02   POST /reviews      Rating = 6                  400
  REV-T03   POST /reviews      Review trùng Recipe         409
  REV-T04   PUT /reviews/:id   Sửa review của người khác   404

## 8.4 Ví dụ test code Recipe

``` javascript
const request = require("supertest");
const app = require("../src/app");

describe("Recipe API", () => {
  let adminToken;
  let createdRecipeId;

  beforeAll(async () => {
    // Tạo hoặc lấy Admin test account.
    // Tạo token bằng helper test-auth.
    adminToken = await getAdminTestToken();
  });

  test("RCP-T01: Admin can create a recipe", async () => {
    const response = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test Kimchi Fried Rice",
        description: "Test recipe",
        categoryId: 1,
        prepTime: 10,
        cookTime: 15,
        servings: 2,
        difficulty: "EASY",
        ingredients: [
          {
            ingredientId: 1,
            quantity: 200,
            unit: "gram"
          }
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: "Prepare ingredients"
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title)
      .toBe("Test Kimchi Fried Rice");

    createdRecipeId = response.body.data.id;
  });

  test("RCP-T03: Can get recipe detail", async () => {
    const response = await request(app)
      .get(`/api/recipes/${createdRecipeId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(createdRecipeId);
  });
});
```

Đây là code minh họa. Khi triển khai cần có `getAdminTestToken`, fixture
category/ingredient và database test thực tế.

## 8.5 Cấu hình test dự kiến

Trong package.json:

``` json
{
  "scripts": {
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

Test phải chạy được bằng:

``` bash
npm test
```

Khi ghi kết quả vào báo cáo, lưu lại: - Lệnh chạy test. - Tổng số
test. - Số test PASS/FAIL. - Ảnh màn hình terminal kết quả. - Nếu có
lỗi, ghi rõ lỗi và cách khắc phục.

------------------------------------------------------------------------

# 9. Thiết kế giao diện (화면 설계)

Frontend có thể được triển khai sau khi API hoàn thành. Các màn hình tối
thiểu:

  Screen ID   Màn hình                      Nội dung
  ----------- ----------------------------- --------------------------------------
  UI-01       Main Page                     Danh sách recipe nổi bật và category
  UI-02       Recipe List/Search            Tìm kiếm, lọc, phân trang
  UI-03       Recipe Detail                 Ảnh, nguyên liệu, bước nấu, review
  UI-04       Login/Register                Đăng nhập và đăng ký
  UI-05       My Favorites                  Danh sách yêu thích
  UI-06       My Reviews                    Danh sách đánh giá của tôi
  UI-07       Admin Recipe Management       CRUD Recipe
  UI-08       Admin Category Management     CRUD Category
  UI-09       Admin Ingredient Management   CRUD Ingredient

## 9.1 Main Page

-   Thanh điều hướng.
-   Ô tìm kiếm.
-   Danh mục món ăn.
-   Danh sách recipe.
-   Nút đăng nhập/đăng xuất.

## 9.2 Recipe Detail

-   Tên và hình ảnh món ăn.
-   Mô tả.
-   Tổng thời gian chuẩn bị và nấu.
-   Số khẩu phần.
-   Độ khó.
-   Danh sách nguyên liệu.
-   Các bước nấu theo thứ tự.
-   Điểm trung bình và review.
-   Nút yêu thích (nếu đã đăng nhập).

## 9.3 Admin pages

-   Bảng dữ liệu có pagination.
-   Form thêm/sửa.
-   Xác nhận trước khi xóa.
-   Hiển thị lỗi validation.
-   Chỉ hiển thị cho Admin; backend vẫn phải kiểm tra quyền độc lập.

------------------------------------------------------------------------

# 10. Dữ liệu mẫu (Seed Data)

Tạo dữ liệu mẫu để demo và kiểm thử.

## 10.1 Categories

1.  Korean Food (한식)
2.  Chinese Food (중식)
3.  Japanese Food (일식)
4.  Western Food (양식)
5.  Dessert (디저트)

## 10.2 Ingredients

-   Rice -- gram
-   Kimchi -- gram
-   Egg -- piece
-   Onion -- gram
-   Garlic -- gram
-   Tomato -- gram
-   Pasta -- gram
-   Milk -- ml
-   Sugar -- gram
-   Salt -- gram

## 10.3 Recipes

-   Kimchi Fried Rice
-   Bibimbap
-   Bulgogi
-   Mapo Tofu
-   Sushi
-   Pasta
-   Pancake

## 10.4 Test accounts

-   Admin test account: tạo bằng seed riêng, role ADMIN.
-   Member test account: tạo bằng seed riêng, role MEMBER.

Không đưa mật khẩu production vào source code. Tài khoản và mật khẩu
demo chỉ dùng local/test và được ghi rõ trong README nếu cần.

------------------------------------------------------------------------

# 11. Kế hoạch triển khai

  Giai đoạn   Công việc                                  Kết quả
  ----------- ------------------------------------------ --------------------------
  1           Khởi tạo Node.js, Express, Prisma, MySQL   Backend chạy được
  2           Thiết kế Prisma schema và migration        Database hoàn chỉnh
  3           Xây dựng Member/Auth                       Register, Login, JWT
  4           Xây dựng Recipe Router                     6 API
  5           Xây dựng Category Router                   6 API
  6           Xây dựng Ingredient Router                 6 API
  7           Xây dựng Favorite Router                   6 API
  8           Xây dựng Review Router                     6 API
  9           Viết Jest/Supertest                        Test cốt lõi từng Router
  10          Swagger, README, seed                      Tài liệu chạy và API
  11          Frontend và tích hợp                       Demo hệ thống
  12          Chụp ảnh họp, hoàn thiện báo cáo           Hồ sơ nộp bài

Ưu tiên hoàn thành 5 Router nghiệp vụ và test trước khi mở rộng giao
diện.

------------------------------------------------------------------------

# 12. Tiêu chí nghiệm thu (Acceptance Criteria)

## 12.1 Router và API

-   [ ] Có Recipe Router độc lập.
-   [ ] Có Category Router độc lập.
-   [ ] Có Ingredient Router độc lập.
-   [ ] Có Favorite Router độc lập.
-   [ ] Có Review Router độc lập.
-   [ ] Có Member Router riêng và không tính vào 5 Router nghiệp vụ.
-   [ ] Mỗi Router nghiệp vụ có ít nhất 6 endpoint hoạt động.
-   [ ] Các endpoint được mount đúng prefix.
-   [ ] Không có route bị trùng hoặc bị route động che khuất.

## 12.2 Database

-   [ ] Có đủ 8 bảng.
-   [ ] PK/FK hoạt động.
-   [ ] Unique constraint hoạt động.
-   [ ] Favorite không trùng user + recipe.
-   [ ] Review không trùng user + recipe.
-   [ ] Recipe có thể lưu nhiều nguyên liệu và nhiều bước.
-   [ ] Tạo Recipe và dữ liệu con dùng transaction.

## 12.3 Security

-   [ ] Password được hash.
-   [ ] JWT được kiểm tra.
-   [ ] Admin-only API trả 403 cho Member.
-   [ ] Guest không truy cập Favorite/Review write APIs.
-   [ ] Member không sửa/xóa dữ liệu của người khác.
-   [ ] Không trả passwordHash.
-   [ ] `.env` không được commit.

## 12.4 Testing

-   [ ] Có test file cho từng Router nghiệp vụ.
-   [ ] Mỗi Router có test API cốt lõi.
-   [ ] Có test thành công và test lỗi.
-   [ ] `npm test` chạy được.
-   [ ] Có kết quả test thực tế để đưa vào báo cáo.

## 12.5 Submission

-   [ ] Có báo cáo PDF theo đúng mẫu HWP.
-   [ ] Có source code project folder.
-   [ ] Có README hướng dẫn chạy.
-   [ ] Có `.env.example`.
-   [ ] Có migration và seed.
-   [ ] Có ảnh test result.
-   [ ] Có ảnh họp trực tiếp thấy rõ khuôn mặt từng thành viên.
-   [ ] Đã xóa `node_modules`.
-   [ ] Giữ `package.json` và `package-lock.json`.

------------------------------------------------------------------------

# 13. Hướng dẫn Codex thực hiện dự án

## 13.1 Nguyên tắc bắt buộc

Codex phải đọc toàn bộ `PROJECT_SPEC.md` trước khi code.

-   Không bỏ qua bất kỳ Router nghiệp vụ nào.
-   Không tính Member Router vào số lượng Router nghiệp vụ.
-   Mỗi Router nghiệp vụ phải có đúng tối thiểu 6 API theo bảng đặc tả.
-   Không đổi endpoint hoặc HTTP method tùy ý.
-   Không tạo API chỉ trả dữ liệu giả để đạt số lượng.
-   Tất cả API phải kết nối database thật.
-   Tất cả API write phải kiểm tra validation và quyền.
-   Không lưu password dạng plaintext.
-   Không trả passwordHash.
-   Không viết test giả chỉ để luôn PASS.
-   Không ghi kết quả test chưa chạy.
-   Không xóa hoặc bỏ qua test khi gặp lỗi.
-   Không commit `.env`, node_modules hoặc thông tin bí mật.

## 13.2 Trình tự làm việc đề nghị cho Codex

### Task 1 -- Khảo sát và khởi tạo

1.  Đọc PROJECT_SPEC.md.
2.  Kiểm tra thư mục hiện tại.
3.  Nếu chưa có project, khởi tạo Node.js + Express.
4.  Cài dependencies cần thiết.
5.  Tạo `.env.example`, `.gitignore`, README.
6.  Cấu hình Prisma và MySQL.
7.  Báo cáo các file đã tạo.

### Task 2 -- Database

1.  Tạo đủ 8 model trong Prisma schema.
2.  Khai báo relation, unique, index.
3.  Tạo migration.
4.  Tạo seed data.
5.  Kiểm tra migration và seed chạy thành công.

### Task 3 -- Authentication

1.  Implement Member Router 6 API.
2.  Hash password bằng bcrypt.
3.  Implement JWT middleware.
4.  Implement Admin middleware.
5.  Viết test cho register/login/profile.
6.  Kiểm tra role không thể bị giả mạo từ request.

### Task 4 -- Business Router

Triển khai lần lượt: 1. Recipe Router. 2. Category Router. 3. Ingredient
Router. 4. Favorite Router. 5. Review Router.

Mỗi Router phải có Router, Controller, Service, Validation và test
riêng.

### Task 5 -- API tests

1.  Cấu hình Jest và Supertest.
2.  Tạo database test riêng.
3.  Viết test success/failure.
4.  Chạy test toàn bộ.
5.  Sửa lỗi thực tế.
6.  Xuất coverage report nếu có thể.

### Task 6 -- Documentation

1.  Tạo Swagger/OpenAPI.
2.  Hoàn thiện README.
3.  Liệt kê toàn bộ endpoint.
4.  Cung cấp hướng dẫn setup database.
5.  Cung cấp lệnh chạy server và test.

### Task 7 -- Final audit

Đối chiếu toàn bộ code với mục 12. Báo cáo: - Số Router nghiệp vụ. - Số
API của từng Router. - Số test pass/fail. - Migration status. - Những
chức năng còn thiếu. - Những lỗi chưa giải quyết.

Không được tuyên bố dự án hoàn thành nếu còn tiêu chí bắt buộc chưa đạt.

------------------------------------------------------------------------

# 14. Nội dung báo cáo HWP/PDF cần lấy từ dự án

Bám theo mẫu `프로젝트 보고서 양식.hwp`, báo cáo cuối cùng nên có thứ
tự:

## 14.1 팀명 / 팀원

-   Team name.
-   Thành viên.
-   Mã sinh viên theo thông tin thực tế.

## 14.2 프로젝트 개요

Dùng nội dung ở Chương 1: - Lý do chọn đề tài. - Mục tiêu. - Chức năng
chính. - Công nghệ sử dụng.

## 14.3 API 설계

Trình bày từng Router theo thứ tự: 1. Recipe Router. 2. Category Router.
3. Ingredient Router. 4. Favorite Router. 5. Review Router. 6. Member
Router (ghi chú không tính vào số Router yêu cầu).

Với từng API, trình bày: - API name. - Request Method và URL. -
Parameter/Body: tên, kiểu, bắt buộc, giải thích. - Response: Element,
Depth, Value Type, Description. - JSON request/response example.

## 14.4 라우터 별 핵심 API 코드

Với từng Router: - Chọn API cốt lõi. - Chèn code thực tế từ source. -
Giải thích ngắn về Router/Controller/Service. - Nêu validation và
authorization liên quan.

Không chèn code minh họa chưa được triển khai như thể đó là code thật.

## 14.5 라우터 별 핵심 API 테스트 코드 및 그 결과

Với từng Router: - Chèn test code thực tế. - Nêu test scenario. - Chèn
ảnh terminal kết quả chạy test. - Ghi rõ PASS/FAIL theo kết quả thật.

## 14.6 부록. 프로젝트 수행 인증 사진

-   Ảnh họp trực tiếp của nhóm.
-   Tất cả thành viên phải xuất hiện rõ mặt theo yêu cầu mẫu.
-   Không sử dụng ảnh stock, ảnh AI hoặc ảnh không chứng minh cuộc họp
    thực tế.

------------------------------------------------------------------------

# 15. Các điểm cần xác nhận trước khi triển khai

Những nội dung sau chưa được xác định trong mẫu báo cáo của giáo sư, nên
nhóm cần chốt trước hoặc dùng mặc định đề xuất:

  Nội dung              Mặc định đề xuất
  --------------------- -------------------------------------------
  Database              MySQL
  ORM                   Prisma
  Backend               Node.js + Express
  Test                  Jest + Supertest
  Frontend              HTML/CSS/JS/Bootstrap
  Ngôn ngữ code         English identifiers
  Ngôn ngữ báo cáo      Korean
  업무 Router           5
  API mỗi 업무 Router   6
  Member Router         6 API, không tính vào số Router nghiệp vụ
  Authentication        JWT
  Role                  MEMBER, ADMIN

**Nếu giảng viên yêu cầu stack khác, hãy thay đổi công nghệ trước khi
tạo database và code; không thay đổi tùy tiện giữa chừng.**

------------------------------------------------------------------------

# 16. Lệnh khởi động Codex đề xuất

Sau khi lưu tài liệu này với tên `PROJECT_SPEC.md` ở thư mục gốc
project, gửi Codex yêu cầu:

``` text
Read PROJECT_SPEC.md completely before making any changes.

This file is the source of truth for the project.
Implement the Cooking Recipe Management System according to the
requirements, database design, API contracts, authorization rules,
folder structure, and testing requirements in the document.

Important:
- Implement 5 independent business routers:
  recipes, categories, ingredients, favorites, reviews.
- Implement 6 working endpoints in each business router.
- Implement members router separately; it does not count toward
  the required number of business routers.
- Use Node.js, Express, MySQL, Prisma, JWT, Jest, and Supertest.
- Every endpoint must use a real database.
- Separate Router, Controller, Service, and Validation.
- Implement authentication, authorization, and input validation.
- Write real success and failure tests for core APIs in every
  business router.
- Do not fake test results.
- Do not silently change endpoint paths or response formats.
- Run migrations, seed, and tests.
- Work in small phases and report completed files and test results.
- Do not claim completion while acceptance criteria remain unmet.

Start with project inspection and Task 1.
Do not implement all features in one unverified step.
```

------------------------------------------------------------------------

## Kết luận

Tài liệu này là đặc tả thiết kế và triển khai, không phải báo cáo kết
quả đã hoàn thành. Các ảnh họp, ảnh chạy test, code thực tế và kết quả
kiểm thử phải được bổ sung sau khi nhóm thực hiện dự án.
