#!/bin/zsh
cd $(dirname $0)
npx @atproto/lex-cli gen-api --yes ./build/lexicons ./live/grayhaze/*/*
tsc
node build/cleanup.js
rm -r $1
cp -r ./build/lexicons $1