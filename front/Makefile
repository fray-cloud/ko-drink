front-create: # 대화형 무시하고 React + TypeScript Vite 프로젝트 생성
# --force
# Current directory is not empty. Please choose how to proceed :: Ignore files and continue
# printf 'n\nn\n'
# Use rolldown-vite (Experimental)? :: No
# Install with npm and start now? No
	printf 'n\nn\n' | npm create vite@latest . -- --template react-ts --force

src-structure-init: # src 디렉토리 구조 초기화
	@set -e; \
	for dir in \
		src/common \ # 공통 컴포넌트, 훅, 스타일 디렉토리
		src/common/components \
		src/common/hooks \
		src/common/styles \
		src/routes \ # 도메인 라우트별 디렉토리
		src/assets \ # 자산 디렉토리
		src/assets/images \
		src/assets/icons \
		src/assets/fonts; do \
		mkdir -p "$$dir"; \
	done; \
	for keep in \
		src/common/components/.gitkeep \
		src/common/hooks/.gitkeep \
		src/common/styles/.gitkeep \
		src/routes/.gitkeep \
		src/assets/images/.gitkeep \
		src/assets/icons/.gitkeep \
		src/assets/fonts/.gitkeep; do \
		touch "$$keep"; \
	done; \
	echo "Initialized src directory structure."


route-init: # 새로운 라우트 디렉토리 및 기본 파일 생성
ifndef ROUTE_NAME
	$(error "ROUTE_NAME 변수가 정의되지 않았습니다. 예: make route-init ROUTE_NAME=home")
endif
		@set -e; \
		base_dir="src/routes/$(ROUTE_NAME)"; \
		mkdir -p "$$base_dir"; \
		touch "$$base_dir/route.ts"; \
		for subdir in components styles hooks pages; do \
			mkdir -p "$$base_dir/$$subdir"; \
			touch "$$base_dir/$$subdir/index.ts"; \
		done; \
		echo "Route '$(ROUTE_NAME)' initialized."


tailwind-init: # Tailwind CSS 초기화 (https://tailwindcss.com/docs/installation/using-vite)
	@npm install -D tailwindcss@3.4.17 postcss autoprefixer
	@npx tailwindcss init -p
	@printf "%s\n" \
		"/** @type {import('tailwindcss').Config} */" \
		"export default {" \
		"  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}']," \
		"  theme: {" \
		"    extend: {}," \
		"  }," \
		"  plugins: []," \
		"}" \
		> tailwind.config.js
	@printf "%s\n" \
		"export default {" \
		"  plugins: {" \
		"    tailwindcss: {}," \
		"    autoprefixer: {}," \
		"  }," \
		"}" \
		> postcss.config.js
	@printf "%s\n" \
		"@tailwind base;" \
		"@tailwind components;" \
		"@tailwind utilities;" \
		"" \
		> src/index.css
	@echo "Tailwind CSS initialized for Vite project."

front-init: front-create src-structure-init tailwind-init # 프론트엔드 초기화 일괄 실행
	@echo "Frontend project initialization complete."