# Make sure node doesn't give out of memory errors
export NODE_OPTIONS="--max-old-space-size=8192"

# And do the build itself
npm run build
