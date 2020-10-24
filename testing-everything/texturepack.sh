#!/bin/bash
if [ $# = 1 ] || [ $# = 2 ]; then
  tex="./.texturepack-test.png"
  func="$1"
  method="require('./test-loaded-texturepack')(x=>x.$func)"
  if [ -f "$tex" ]; then
    rm "$tex"
  fi
  echo "Method: $method"
  node -e "$method"
  if [ -f "$tex" ]; then
    num="256"
    if [ $# = 2 ]; then
      num="$2"
    fi
    tiv "$tex" -w "$num" -h "$num"
  else
    echo "Missing output image"
  fi
else
  echo "./texturepack.sh <Use a method from loaded texturepack>"
  echo "e.g.: ./texturepack.sh 'getDebugPinkBlack()'"
fi
