#!/bin/bash

# Parameter default value
test=0

while [ $# -gt 0 ]; do
  case "$1" in
    --test)
      test=1
      ;;
    # -a|-arg_1|--arg_1)
    #   arg_1="$2"
    #   ;;
    *)
      printf "***************************\n"
      printf "* Error: Invalid argument.*\n"
      printf "***************************\n"
      exit 1
  esac
  shift
  shift
done

npm run clean 
npm run lint
tsc --project tsconfig.json


if [ $test -ne 1 ]; then
    # bundleUmd
    rollup dist/index.js --file dist/index.umd.js --format umd --name sayHello
    # bundleUmdMin
    terser --ecma 6 --compress --mangle -o dist/index.umd.min.js -- dist/index.umd.js && gzip -9 -c dist/index.umd.min.js > dist/index.umd.min.js.gz

    # buildStats
    cd dist 
    ls -lh index.umd* | tail -n +2 | awk '{print $5,$9}'
fi