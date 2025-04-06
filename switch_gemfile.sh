#!/bin/bash

# Check if platform argument is provided
if [ -z "$1" ]; then
    echo "Usage: ./switch_gemfile.sh [mac|windows]"
    exit 1
fi

# Remove existing Gemfile.lock if it exists
if [ -f "Gemfile.lock" ]; then
    rm Gemfile.lock
fi

# Copy the appropriate platform-specific Gemfile.lock
case $1 in
    "mac")
        cp Gemfile.lock.mac Gemfile.lock
        echo "Switched to Mac Gemfile.lock"
        ;;
    "windows")
        cp Gemfile.lock.windows Gemfile.lock
        echo "Switched to Windows Gemfile.lock"
        ;;
    *)
        echo "Invalid platform. Use 'mac' or 'windows'"
        exit 1
        ;;
esac

# Run bundle install to ensure everything is in sync
bundle install 