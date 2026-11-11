#!/bin/zsh
cd "${0:A:h}" || exit 1
arena_node=$(command -v node)
if [[ -z "$arena_node" ]]; then arena_node='/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node'; fi
if [[ ! -x "$arena_node" ]]; then print 'Install Node.js 22 or later, then reopen Start Arena.command.'; read '?Press Return to close.'; exit 1; fi
exec "$arena_node" arena-server/lan.mjs
