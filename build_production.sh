# Make sure react API key
if [[ -z "$REACT_APP_MAP_API" ]]; then
    echo "Must provide MapBox GL API key in environment key REACT_APP_MAP_API prior to build!" 1>&2
    exit 1
fi

# Make sure node doesn't give out of memory errors
export NODE_OPTIONS="--max-old-space-size=8192"

# And do the build itself
npm run build
