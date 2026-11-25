.PHONY: build test verify up down run shell logs lint format clean

IMAGE := bizflow
COMPOSE := docker compose

## build: build the production runtime image
build:
	docker build --target runtime -t $(IMAGE):latest .

## test: run the Phase-5 characterization suite in Docker (the `test` stage)
test:
	docker build --target test -t $(IMAGE):test .

## verify: build + test — the quality gate `make up` depends on
verify: test build

## up: start the app (only after verify passes)
up: verify
	$(COMPOSE) up -d
	@echo "BizFlow running at http://localhost:20010"

## down: stop the app
down:
	$(COMPOSE) down

## run: alias for up
run: up

## shell: interactive shell in the deps stage (has node_modules, no build artifacts)
shell:
	docker build --target deps -t $(IMAGE):deps .
	docker run --rm -it -v "$(CURDIR):/app" -w /app $(IMAGE):deps sh

## logs: tail the running container's logs
logs:
	$(COMPOSE) logs -f

## lint: type-check + lint inside the deps stage (no host node/npm)
lint:
	docker build --target deps -t $(IMAGE):deps .
	docker run --rm -v "$(CURDIR):/app" -w /app $(IMAGE):deps sh -c "npx tsc --noEmit && npx next lint"

## format: n/a — no formatter configured yet (Phase 9 adds one)

## clean: remove local images (never touches volumes/user data)
clean:
	-docker image rm $(IMAGE):latest $(IMAGE):test $(IMAGE):deps 2>/dev/null
