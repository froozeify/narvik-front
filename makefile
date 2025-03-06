# Executables (local)
DOCKER_COMP = docker compose

# Docker containers
NODE_CONT = $(DOCKER_COMP) exec front


# Misc
.DEFAULT_GOAL = help

## —— 🎵 🐳 The Docker Makefile 🐳 🎵 ——————————————————————————————————
help: ## Outputs this help screen
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

## —— Docker 🐳 ————————————————————————————————————————————————————————————————

build-prod:
	@docker build --pull --no-cache -t benoitvignal/narvik-front:latest -t benoitvignal/narvik-front:`cat package.json | grep version | grep '\([0-9]\+\.\?\)\{3\}' -o | grep '^[0-9]\+\+' -o` -t benoitvignal/narvik-front:`cat package.json | grep version | grep '\([0-9]\+\.\?\)\{3\}' -o | grep '^[0-9]\+\.[0-9]\+' -o` -t benoitvignal/narvik-front:`cat package.json | grep version | grep '\([0-9]\+\.\?\)\{3\}' -o` --target run .

push-build-prod:
	@docker image push benoitvignal/narvik-front:latest
	@docker image push benoitvignal/narvik-front:`cat package.json | grep version | grep '\([0-9]\+\.\?\)\{3\}' -o | grep '^[0-9]\+\+' -o`
	@docker image push benoitvignal/narvik-front:`cat package.json | grep version | grep '\([0-9]\+\.\?\)\{3\}' -o | grep '^[0-9]\+\.[0-9]\+' -o`
	@docker image push benoitvignal/narvik-front:`cat package.json | grep version | grep '\([0-9]\+\.\?\)\{3\}' -o`

sh: ## Connect to the Node container
	@$(NODE_CONT) sh

## —— Cloudflared 🕸️ ——————————————————————————————————————————————————————————————
cloudflared-tunnel: ## Expose local env through cloudflared tunnel (url must be set to host.docker.internal:3000 on cloudflare tunnel setting)
	docker run --rm -it cloudflare/cloudflared:latest tunnel --no-autoupdate run --token $$CLOUDFLARED_TUNNEL

cloudflared-tunnel-free: ## Expose local env through cloudflared tunnel (free version is limited to 200 in-flight request)
	docker run --rm -it cloudflare/cloudflared:latest tunnel --no-autoupdate --url http://host.docker.internal:3000
