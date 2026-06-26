#!/bin/bash

# New Investigation Generator
# Usage: ./new-investigation.sh engineering distributed-systems "Distributed Systems Design"

if [ $# -lt 3 ]; then
    echo "Usage: ./new-investigation.sh <area> <topic> \"<Title>\""
    echo "Example: ./new-investigation.sh engineering distributed-systems \"Distributed Systems Design\""
    exit 1
fi

AREA=$1
TOPIC=$2
TITLE=$3

DIR="content/investigations/$AREA"
FILE="$DIR/$TOPIC.md"
DATE=$(date +%d-%B-%Y)

# Create directory if it doesn't exist
mkdir -p "$DIR"

# Check if file exists
if [ -f "$FILE" ]; then
    echo "File already exists: $FILE"
    exit 1
fi

# Create file with template
cat > "$FILE" << EOF
---
title: "$TITLE"
created: $(date +%Y-%m-%d)
status: "Seed"
areas: ["$AREA"]
topics: [""]
questions:
  - ""
tags: []
related: []
draft: false
---

## $DATE

Initial thoughts...

EOF

echo "Created new investigation: $FILE"
echo "Edit the file and add your initial questions and thoughts."
