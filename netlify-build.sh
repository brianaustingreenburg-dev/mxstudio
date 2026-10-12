#!/usr/bin/env bash
# Copies the right folder into _site for whichever Netlify site is building.
set -e
# JefeTech app: matched by its web address (the Netlify project name can be anything)
case "$URL" in
  *myjefetech.app*) SITE_NAME=jefetech-app ;;
esac
case "$SITE_NAME" in
  jefetech-app|jefetech-app-vzgj|jefetech|myjefetech|myjefetech-app) src=jefetech-app; only_site=1 ;;
  mxstudio-brian|endearing-dieffenbachia-d028e4)    src=brian-site ;;
  mxstudio-daniel)   src=daniel ;;
  mxstudio-cristian) src=cristian ;;
  mxstudio-partners) src=partners-site/public ;;
  deluxe-tartufo-364c6c|family-first) src=family-first; only_site=1 ;;
  *) echo "Unknown site: $SITE_NAME ($URL). Add it to netlify-build.sh"; exit 1 ;;
esac
rm -rf _site && mkdir _site
cp -R "$src"/. _site/
rm -f _site/netlify.toml
if [ -z "$only_site" ]; then
cp shared/demo-dashboard.html _site/demo-dashboard.html
cp shared/la-forja.html _site/la-forja.html
cp shared/checkout.html _site/checkout.html
cp shared/welcome.html _site/welcome.html
cp shared/owner.html _site/owner.html
cp shared/demo.html _site/demo.html
cp shared/partner-demo.html _site/partner-demo.html
fi
echo "Published $src for $SITE_NAME"
