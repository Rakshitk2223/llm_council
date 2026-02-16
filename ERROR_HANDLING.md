# Error Handling Documentation

## Error Types and User-Friendly Messages

### Backend Errors → User Messages

| Error Code | Developer Message | User-Friendly Message | Action |
|------------|------------------|----------------------|---------|
| `MODEL_NOT_AVAILABLE` | "{model_name} provider not configured" | "{model_name} is not available right now. Please try GPT-4o or another model." | Show toast 5s |
| `PROVIDER_NOT_CONFIGURED` | "Azure OpenAI endpoint not configured" | "AI service is temporarily unavailable. Please try again later." | Show toast 5s |
| `RATE_LIMIT_EXCEEDED` | "Rate limit exceeded for user {user_id}" | "You've reached the daily query limit. Please try again tomorrow." | Show toast 5s |
| `QUERY_TOO_LONG` | "Query exceeds MAX_QUERY_WORDS limit" | "Your question is too long. Please keep it under {max_words} words." | Show inline error |
| `EMPTY_QUERY` | "Query cannot be empty" | "Please enter a question first." | Show inline error, shake input |
| `CONNECTION_ERROR` | "Failed to connect to {provider}" | "Connection issue. Retrying..." | Auto-retry 2x, then show error |
| `TIMEOUT_ERROR` | "Request timeout after 30s" | "Request is taking too long. Please try a shorter question." | Show toast 5s |
| `COUNCIL_ERROR` | "Internal council error: {details}" | "Something went wrong. Please try again." | Show toast 5s, log to console |
| `STREAM_ERROR` | "SSE stream error: {details}" | "Connection interrupted. Results may be incomplete." | Show warning toast |
| `INVALID_MODEL` | "Model {model_id} not found in available models" | "Selected model is not available. Using default instead." | Auto-fallback if USE_GPT4O_AS_DEFAULT=True |
| `AUTH_REQUIRED` | "JWT validation failed" | "Please log in to continue." | Redirect to login |
| `API_KEY_INVALID` | "401 Unauthorized from {provider}" | "Service temporarily unavailable. Please try again later." | Generic message, log details |

### Frontend Validation Errors

| Validation | Trigger | User Message | UI Action |
|------------|---------|--------------|-----------|
| Empty query | Click send with empty input | "Please type a question first" | Shake input, red border |
| Query too long | > MAX_QUERY_WORDS | "Question too long ({current}/{max} words)" | Show counter, disable send |
| Special characters | Contains blocked chars | "Please use only standard characters" | Inline error |
| Only whitespace | Spaces/tabs only | "Please enter a valid question" | Shake input |

## Toast Notification Specifications

### Position
- **Location**: Top center of screen
- **Offset**: 20px from top
- **Z-index**: 9999 (above all other elements)
- **Width**: Auto (fit content), max 500px
- **Animation**: Slide down from top + fade in

### Styling
```css
/* Toast container */
position: fixed;
top: 20px;
left: 50%;
transform: translateX(-50%);
z-index: 9999;

/* Toast item */
background: rgba(60, 60, 60, 0.95);  /* Dark grey, slightly transparent */
color: #ffffff;
padding: 16px 24px;
border-radius: 8px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.1);

/* Progress bar (auto-dismiss) */
height: 3px;
background: rgba(255, 255, 255, 0.3);
animation: progress 5s linear;
```

### Types
1. **Error Toast** (red left border)
   - Model not available
   - Connection errors
   - Rate limits

2. **Warning Toast** (yellow left border)
   - Stream interrupted
   - Fallback to default model

3. **Success Toast** (green left border)
   - Settings saved
   - Session created

4. **Info Toast** (blue left border)
   - Helpful tips
   - Mode switched

### Behavior
- **Auto-dismiss**: 5 seconds
- **Manual close**: Click X or swipe up
- **Stacking**: Max 3 toasts, new ones push old down
- **Pause on hover**: Timer pauses when mouse over

## Error Handling Flow

```
User Action
    ↓
Frontend Validation
    ↓ (if passes)
API Call
    ↓
Backend Processing
    ↓
Error Occurs?
    ├─ Yes → Categorize Error
    │         ↓
    │    User-Friendly Message
    │         ↓
    │    Show Toast
    │         ↓
    │    Log to Console (dev)
    │
    └─ No → Continue Normal Flow
```

## Implementation Notes

### Backend Error Structure
```python
{
    "error": True,
    "error_code": "MODEL_NOT_AVAILABLE",
    "message": "Claude Sonnet 3.5 provider not configured",
    "user_message": "Claude Sonnet 3.5 is not available right now. Please try GPT-4o or another model.",
    "suggestion": "Try using gpt-4o instead",
    "retryable": False
}
```

### Frontend Error Handling
```typescript
// In useCouncilStream.ts
try {
  const response = await fetch(...);
  if (!response.ok) {
    const error = await response.json();
    showToast({
      type: 'error',
      message: error.user_message,
      duration: 5000
    });
    return;
  }
} catch (error) {
  showToast({
    type: 'error',
    message: 'Connection issue. Please try again.',
    duration: 5000
  });
}
```

## Testing Error Scenarios

1. **Model Not Available**
   - Set `ANTHROPIC_API_KEY=` (empty)
   - Try to use Claude model
   - Should show: "Claude is not available..."

2. **Query Too Long**
   - Paste 600+ words
   - Should show: "Question too long..."
   - Send button disabled

3. **Empty Query**
   - Click send with empty input
   - Should shake input + show message

4. **Connection Error**
   - Stop backend server
   - Try to send query
   - Should show: "Connection issue..."

5. **Rate Limit**
   - Set `RATE_LIMIT_PER_DAY=1`
   - Send 2 queries
   - Should show: "Daily limit reached..."

## Logging

### Frontend Console (Development)
```typescript
console.error('[Council Error]', {
  code: error.error_code,
  message: error.message,  // Developer message
  userMessage: error.user_message,
  timestamp: new Date().toISOString(),
  context: { query, model, persona }
});
```

### Backend Logging
```python
logger.error(f"[{error_code}] {message} | User: {user_id} | Model: {model_id}")
```
