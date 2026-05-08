# Auth Testing Playbook (saved per integration playbook requirement)
See `/app/memory/test_credentials.md` for current test users.

## Quick Setup Commands
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  interests: ['Hackathons', 'AI'],
  skills: ['Python'],
  skill_level: 'Intermediate',
  career_goals: 'SWE Internship',
  onboarded: true,
  role: 'student',
  created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## API Smoke
```
curl -X GET "$BACKEND_URL/api/auth/me" -H "Authorization: Bearer $TOKEN"
curl -X GET "$BACKEND_URL/api/opportunities"
```

## Browser Testing
```js
await page.context.add_cookies([{
  "name": "session_token", "value": TOKEN, "domain": "<host>",
  "path": "/", "httpOnly": true, "secure": true, "sameSite": "None"
}]);
```
