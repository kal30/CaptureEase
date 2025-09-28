#!/bin/bash

# Batch SMS test messages for CaptureEz webhook
WEBHOOK_URL="https://us-central1-captureease-ef82f.cloudfunctions.net/smsWebhook"
FROM_NUMBER="+12082830595"
TO_NUMBER="+1555550100"

# Test messages covering different categories
messages=(
  "Emma had a big meltdown at bedtime tonight, crying for 20 minutes"
  "Great day! Alex smiled and laughed during playtime with blocks"
  "Fever of 101.2F, gave Tylenol at 7pm"
  "Very sensitive to loud noises today, covered ears at grocery store"
  "Morning routine went smooth - breakfast, teeth, dressed by 8am"
  "First time walking up stairs independently! So proud"
  "Struggled with transition from park to car, needed 10 min prep"
  "Refused all vegetables at dinner, only ate mac and cheese"
  "Slept through the night 8pm-6am for 3 nights in a row!"
  "Complained of stomach ache after eating dairy"
  "Amazing focus today - completed 15 min puzzle without breaks"
  "New word: said 'more' clearly while signing it too"
)

echo "Starting batch SMS test to CaptureEz webhook..."
echo

for i in "${!messages[@]}"; do
  index=$((i + 1))
  message="${messages[i]}"

  echo "Sending $index: $message"

  curl -X POST "$WEBHOOK_URL" \
    --data-urlencode "From=$FROM_NUMBER" \
    --data-urlencode "To=$TO_NUMBER" \
    --data-urlencode "Body=$message" \
    --silent --output /dev/null

  sleep 1
done

echo
echo "Batch sent ✅"