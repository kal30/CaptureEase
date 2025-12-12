/**
 * SMS/WhatsApp Ingestion Webhook for CaptureEz
 *
 * Handles Twilio SMS and WhatsApp messages with:
 * - Child prefix requirement (ChildName: message)
 * - Multi-child support (semicolon-separated)
 * - Fuzzy matching with confirmation flow
 * - Phone number authorization
 * - Event creation in Firestore
 */

const { onRequest } = require("firebase-functions/v2/https");
const { admin, logger } = require('../init');

// Utilities
const {
  normalizeE164,
  parseChildSegments,
  fuzzyMatchChild,
  levenshteinDistance
} = require('./utils');

const { twimlMessage } = require('./twiml');

// In-memory cache for pending confirmations (use Redis in production)
const pendingConfirms = new Map();

/**
 * Main SMS/WhatsApp webhook handler
 */
const smsWebhook = onRequest(
  {
    cors: true,
    region: 'us-central1'
  },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        res.set('Content-Type', 'text/xml');
        return res.status(405).send(twimlMessage('Method not allowed. Use POST.'));
      }

      const payload = req.body;
      logger.info('Webhook received:', payload);

      // Extract and normalize fields
      const raw = req.body?.Body ?? "";
      const norm = raw.trim().toLowerCase();
      const from = String(req.body?.From || "");
      const fromE164 = from.startsWith("whatsapp:") ? from.slice("whatsapp:".length) : from;
      const body = raw.trim();
      const numMedia = parseInt(payload.NumMedia || '0', 10);

      if (!from || !body) {
        logger.warn('Missing required fields:', { from, hasBody: !!body });
        res.set('Content-Type', 'text/xml');
        return res.status(400).send(twimlMessage('Missing From or Body'));
      }

      // Detect directory command BEFORE child-prefix parsing
      const isDirectory = /^children\??$/.test(norm) || /^child\??$/.test(norm) || /^kids\??$/.test(norm);
      if (isDirectory) {
        const response = await handleDirectoryCommand(from, fromE164);
        res.set('Content-Type', 'text/xml');
        return res.status(200).send(twimlMessage(response));
      }

      // Normalize phone number and detect source (for non-directory commands)
      const { e164, source } = normalizeE164(from);

      // Handle confirmation flow
      if (body.toUpperCase() === 'YES') {
        const response = await handleConfirmation(fromE164, payload);
        res.set('Content-Type', 'text/xml');
        return res.status(200).send(twimlMessage(response));
      }

      // Parse child segments from message
      const segments = parseChildSegments(body);

      if (segments.length === 0) {
        res.set('Content-Type', 'text/xml');
        return res.status(200).send(twimlMessage(
          `I couldn't find a child name at the start. Try "Arjun: …" or send "children?" to see options.`
        ));
      }

      // Process each segment
      const responses = [];
      for (let i = 0; i < segments.length; i++) {
        const response = await processChildSegment(
          segments[i],
          fromE164,
          source,
          payload,
          i,
          segments.length
        );
        responses.push(response);
      }

      // Format response for user
      let finalResponse;
      if (responses.length <= 3) {
        finalResponse = responses.join('\n');
      } else {
        finalResponse = responses.slice(0, 3).join('\n') +
          `\n…and ${responses.length - 3} more.`;
      }

      res.set('Content-Type', 'text/xml');
      return res.status(200).send(twimlMessage(finalResponse));

    } catch (error) {
      logger.error('Webhook error:', error);
      res.set('Content-Type', 'text/xml');
      return res.status(500).send(twimlMessage('Failed to process message'));
    }
  }
);

/**
 * Handle directory command (children?, child?, kids?)
 */
async function handleDirectoryCommand(from, fromE164) {
  try {
    const phoneLink = await getPhoneLink(fromE164);

    logger.info("directory command", { from, fromE164, childrenCount: phoneLink?.allowedChildIds?.length || 0 });

    if (!phoneLink || !phoneLink.verified) {
      return `This number is not linked to any account. Contact your caregiver to get set up.`;
    }

    if (phoneLink.allowedChildIds.length === 0) {
      return `No children authorized for this number.`;
    }

    // Get child names with numbering
    const childNames = [];
    let index = 1;
    for (const childId of phoneLink.allowedChildIds) {
      const childDoc = await admin.firestore()
        .collection('children')
        .doc(childId)
        .get();

      if (childDoc.exists) {
        const childData = childDoc.data();
        const aliasCode = phoneLink.aliasCodes?.[childId];
        const name = childData.name || 'Unknown';

        if (aliasCode) {
          childNames.push(`${index}. ${name} (use "${aliasCode}:" or "${name}:")`);
        } else {
          childNames.push(`${index}. ${name} (use "${name}:")`);
        }
        index++;
      }
    }

    if (childNames.length === 0) {
      return `No children found.`;
    }

    const hint = childNames.length > 1
      ? `\n\nTo log for multiple children: "Arjun: had lunch; Maya: took a nap"`
      : `\n\nExample: "${phoneLink.aliasCodes ? Object.values(phoneLink.aliasCodes)[0] : 'Child'}: had a great day"`;

    return `You can log for:\n${childNames.join('\n')}${hint}`;

  } catch (error) {
    logger.error('Error handling directory command:', error);
    return `Error retrieving children list. Please try again.`;
  }
}

/**
 * Handle YES confirmation
 */
async function handleConfirmation(e164, payload) {
  const pending = pendingConfirms.get(e164);

  if (!pending || Date.now() > pending.expiresAt) {
    pendingConfirms.delete(e164);
    return `I couldn't find a child name at the start. Try "Arjun: …" or send "children?" to see options.`;
  }

  try {
    // Create event with stored data
    const { source } = normalizeE164(payload.From || payload.from);
    const eventId = await createEvent({
      childId: pending.candidateChildId,
      text: pending.originalText,
      source,
      from: payload.From || payload.from,
      fromE164: e164,
      raw: payload,
      matchedBy: 'fuzzy',
      segmentIndex: 0,
      segmentsTotal: 1
    });

    // Clear pending confirmation
    pendingConfirms.delete(e164);

    // Get child name for response
    const childDoc = await admin.firestore()
      .collection('children')
      .doc(pending.candidateChildId)
      .get();

    const childName = childDoc.exists ? childDoc.data().name : 'Unknown';

    // Format media info
    const numMedia = parseInt(payload.NumMedia || '0', 10);
    let mediaInfo = '';
    if (numMedia === 1) {
      mediaInfo = ' (photo saved)';
    } else if (numMedia > 1) {
      mediaInfo = ` (media x${numMedia})`;
    }

    return `Logged for ${childName} ✅ Not classified yet${mediaInfo}`;

  } catch (error) {
    logger.error('Error handling confirmation:', error);
    pendingConfirms.delete(e164);
    return `Error logging entry. Please try again.`;
  }
}

/**
 * Process individual child segment
 */
async function processChildSegment(segment, e164, source, payload, segmentIndex, segmentsTotal) {
  try {
    const phoneLink = await getPhoneLink(e164);
    if (!phoneLink || !phoneLink.verified) {
      return `I couldn't find a child name at the start. Try "Arjun: …" or send "children?" to see options.`;
    }

    // Try to resolve child
    const childResolution = await resolveChild(segment.childToken, phoneLink);

    if (childResolution.type === 'not_found') {
      return `I couldn't find a child name at the start. Try "Arjun: …" or send "children?" to see options.`;
    }

    if (childResolution.type === 'unauthorized') {
      return `I can't log for ${childResolution.childName} from this number. Reply children? to see who you can log for.`;
    }

    if (childResolution.type === 'fuzzy_match') {
      // Store pending confirmation
      pendingConfirms.set(e164, {
        candidateChildId: childResolution.childId,
        originalText: segment.text,
        expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
      });

      return `Did you mean ${childResolution.childName}? Reply YES to confirm or resend with the correct name.`;
    }

    // Exact match - create event
    const eventId = await createEvent({
      childId: childResolution.childId,
      text: segment.text,
      source,
      from: payload.From || payload.from,
      fromE164: e164,
      raw: payload,
      matchedBy: childResolution.matchedBy,
      segmentIndex,
      segmentsTotal
    });

    // Format media info
    const numMedia = parseInt(payload.NumMedia || '0', 10);
    let mediaInfo = '';
    if (numMedia === 1) {
      mediaInfo = ' (photo saved)';
    } else if (numMedia > 1) {
      mediaInfo = ` (media x${numMedia})`;
    }

    return `Logged for ${childResolution.childName} ✅ Not classified yet${mediaInfo}`;

  } catch (error) {
    logger.error('Error processing segment:', error);
    return `Error processing entry. Please try again.`;
  }
}

/**
 * Resolve child from token
 */
async function resolveChild(childToken, phoneLink) {
  // Try alias codes first (fast path)
  for (const [childId, aliasCode] of Object.entries(phoneLink.aliasCodes || {})) {
    if (childToken.toLowerCase() === aliasCode.toLowerCase()) {
      const childDoc = await admin.firestore()
        .collection('children')
        .doc(childId)
        .get();

      if (childDoc.exists && phoneLink.allowedChildIds.includes(childId)) {
        const canLog = await checkLogPermission(phoneLink.ownerUserId, childId);
        if (!canLog) {
          return {
            type: 'unauthorized',
            childName: childDoc.data().name
          };
        }

        return {
          type: 'exact_match',
          childId,
          childName: childDoc.data().name,
          matchedBy: 'shortcode'
        };
      }
    }
  }

  // Try exact name matches
  for (const childId of phoneLink.allowedChildIds) {
    const childDoc = await admin.firestore()
      .collection('children')
      .doc(childId)
      .get();

    if (childDoc.exists) {
      const childData = childDoc.data();
      const childName = childData.name || '';

      if (childToken.toLowerCase() === childName.toLowerCase()) {
        const canLog = await checkLogPermission(phoneLink.ownerUserId, childId);
        if (!canLog) {
          return {
            type: 'unauthorized',
            childName: childData.name
          };
        }

        return {
          type: 'exact_match',
          childId,
          childName: childData.name,
          matchedBy: 'name'
        };
      }
    }
  }

  // Try fuzzy matches
  let bestMatch = null;
  let bestDistance = Infinity;

  for (const childId of phoneLink.allowedChildIds) {
    const childDoc = await admin.firestore()
      .collection('children')
      .doc(childId)
      .get();

    if (childDoc.exists) {
      const childData = childDoc.data();
      const childName = childData.name || '';

      const distance = levenshteinDistance(
        childToken.toLowerCase(),
        childName.toLowerCase()
      );

      if (distance <= 2 && distance < bestDistance) {
        const canLog = await checkLogPermission(phoneLink.ownerUserId, childId);
        if (canLog) {
          bestMatch = {
            childId,
            childName: childData.name,
            distance
          };
          bestDistance = distance;
        } else {
          return {
            type: 'unauthorized',
            childName: childData.name
          };
        }
      }
    }
  }

  if (bestMatch) {
    return {
      type: 'fuzzy_match',
      childId: bestMatch.childId,
      childName: bestMatch.childName
    };
  }

  return { type: 'not_found' };
}

/**
 * Get phone link data
 */
async function getPhoneLink(e164) {
  try {
    const doc = await admin.firestore()
      .collection('phoneLinks')
      .doc(e164)
      .get();

    return doc.exists ? doc.data() : null;
  } catch (error) {
    logger.error('Error getting phone link:', error);
    return null;
  }
}

/**
 * Check log permission
 */
async function checkLogPermission(userId, childId) {
  try {
    const doc = await admin.firestore()
      .collection('childAuth')
      .doc(childId)
      .collection('members')
      .doc(userId)
      .get();

    if (!doc.exists) return false;

    const data = doc.data();
    return data.canLog === true;
  } catch (error) {
    logger.error('Error checking log permission:', error);
    return false;
  }
}

/**
 * Create event in Firestore
 */
async function createEvent({ childId, text, source, from, fromE164, raw, matchedBy, segmentIndex, segmentsTotal }) {
  const phoneLink = await getPhoneLink(fromE164);

  const eventDoc = {
    childId,
    source,
    from,
    fromE164,
    text: text.trim(),
    raw: {
      Body: raw.Body || raw.body,
      From: raw.From || raw.from,
      To: raw.To || raw.to,
      NumMedia: raw.NumMedia || '0'
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: phoneLink?.ownerUserId || null,
    status: 'active',
    ingest: {
      meta: {
        matchedBy,
        segmentIndex,
        segmentsTotal
      }
    }
  };

  // Add media URLs if present
  const numMedia = parseInt(raw.NumMedia || '0', 10);
  for (let i = 0; i < numMedia; i++) {
    const mediaUrl = raw[`MediaUrl${i}`];
    if (mediaUrl) {
      if (!eventDoc.raw.MediaUrls) eventDoc.raw.MediaUrls = [];
      eventDoc.raw.MediaUrls.push(mediaUrl);
    }
  }

  const docRef = await admin.firestore().collection('events').add(eventDoc);
  logger.info(`Event created: ${docRef.id}`, { childId, source, segmentIndex });

  return docRef.id;
}


module.exports = {
  smsWebhook
};