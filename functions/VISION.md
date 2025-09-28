# CaptureEz Functions Vision

CaptureEz helps parents log events with zero friction (SMS, WhatsApp, or app),
classifies them automatically, and shares insights with caregivers and therapists.

The Firebase functions in this repo all serve this flow:
1. Ingest → Events come in via SMS/webhooks.
2. Classify → Events are auto-labeled (emotions, behaviors, sensory, medical).
3. Share → Families invite caregivers, who see the right insights.