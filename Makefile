# Optional Nginx on :8095 — requires MalfunctionDZ `platform` stack (creates network platform_platform).

.PHONY: up down ps

up:
	@docker network inspect platform_platform >/dev/null 2>&1 || { \
		echo "Network platform_platform missing. Start the main platform stack first, e.g."; \
		echo "  cd ../platform && docker compose up -d"; \
		exit 1; \
	}
	docker compose up -d

down:
	docker compose down

ps:
	docker compose ps
