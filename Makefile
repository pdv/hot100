pull:
	bash ./update.sh

start:
	npx webpack --mode=development
	npx http-server

build:
	npx webpack --mode=production

format:
	npx prettier . --write

