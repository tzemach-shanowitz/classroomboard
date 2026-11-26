#!/bin/bash
# Run after every deploy: regenerates /review/ (screenshots, ZIP, CSV) from the LIVE app and publishes it.
cd /tmp/fb && node review-tool/review.js && python3 review-tool/post.py && ./fb.sh deploy --only hosting
