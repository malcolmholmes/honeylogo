.PHONY: local watch build docker push

BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
REGISTRY := ghcr.io/malcolmholmes/honeylogo
TAG := $(shell if [ "$(BRANCH)" = "main" ]; then echo latest; elif [ "$(BRANCH)" = "develop" ]; then echo develop; else echo $(BRANCH); fi)

run: build-js
	go mod tidy
	CONFIGS=override.yaml go run .

build-js:
	bun install && \
	bun build src/main.tsx \
		--target=browser \
		--outdir=public \
		--sourcemap=linked

lint:
	bun run lint

docker:
	ln -sf go.mod.remote go.mod
	ln -sf go.sum.remote go.sum
	go get gitlab.com/malcolmholmes/victor@main
	go mod tidy
	docker build -t $(REGISTRY):dev .
	ln -sf go.mod.local go.mod
	ln -sf go.sum.local go.sum
	go mod tidy

victor:
	ln -sf go.mod.remote go.mod
	ln -sf go.sum.remote go.sum
	GOPROXY=direct go get gitlab.com/malcolmholmes/victor@main
	go mod tidy
	ln -sf go.mod.local go.mod
	ln -sf go.sum.local go.sum
	go mod tidy

push: docker
	docker push $(REGISTRY):$(TAG)
