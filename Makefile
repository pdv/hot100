pull:
	bash ./update.sh

start:
	npx webpack --mode=development
	npx http-server

