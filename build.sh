#!/bin/bash
esbuild --bundle --minify --platform=node ./index.ts --target=node10.4 --outfile=out.js