# ASC public site on http://localhost:8006 (Nginx → platform_py).
# Requires Docker network platform_platform (start platform-py stack first).

.PHONY: up down ps verify-platform open-help

verify-platform:
	@docker exec platform_py python -c "import asc_public_site; print('asc_public_site OK — slug:', asc_public_site.PUBLIC_SITE_SLUG)" \
		|| { echo "Fix: cd ../platform/platform-py && docker compose up -d --force-recreate api"; exit 1; }

up:
	@docker network inspect platform_platform >/dev/null 2>&1 || { \
		echo "Network platform_platform missing. Start the API stack first:"; \
		echo "  cd ../platform/platform-py && docker compose up -d"; \
		exit 1; \
	}
	docker compose up -d
	@echo "Public site: http://localhost:8006/"

down:
	docker compose down

ps:
	docker compose ps

open-help:
	@echo "1) ../platform/platform-py  →  docker compose up -d"
	@echo "2) This repo                  →  make up"
	@echo "3) Browser                    →  http://localhost:8006/"
