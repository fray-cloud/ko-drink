git-init:
	git init

git-add:
	git add .

MSG ?= $(shell date +%Y-%m-%d_%H-%M-%S) committed

git-commit:
	git commit -m "$(MSG)"

git-push-main:
	git push origin main

git-push-dev:
	git push origin dev

git-push-full-main: git-add git-commit git-push-main

git-push-full-dev: git-add git-commit git-push-dev

project-structure:
	@mkdir -p back front infra

dev:
	docker compose -f docker-compose.dev.yml up -d

dev-build-up:
	docker compose -f docker-compose.dev.yml up --build -d

dev-down:
	docker compose -f docker-compose.dev.yml down

prod:
	docker compose up --build -d

prod-down:
	docker compose down