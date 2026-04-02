# Alaska Skydive Center static site — port 8006

.PHONY: up down verify open sync-photos

up:
	docker compose up -d
	@echo "http://localhost:8006/"

down:
	docker compose down

verify:
	@bash scripts/verify_standalone.sh

open:
	@echo "http://localhost:8006/"

sync-photos:
	@bash scripts/sync_public_site_photos.sh
