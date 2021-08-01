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
    num="16"
    if [ $# = 2 ]; then
      num="$2"
    fi
    tiv "$tex" -w "$num" -h "$num"
    rm "$tex"
  else
    echo "Missing output image"
  fi
else
  echo "./texturepack.sh <Use a method from loaded texturepack> [image size]"
  echo "e.g.: ./texturepack.sh 'getDebugPinkBlack()' 16"
fi
