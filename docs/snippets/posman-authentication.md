# Postman Authentication

Following snippet should be placed in login `Tests` section in order to capture access token and user profile en environment variable

```javascript
tests['ok'] = responseCode.code === 200;

tests['Content-Type is present'] = postman.getResponseHeader('Content-Type').startsWith('application/json');

var responseJSON = JSON.parse(responseBody);

tests['have user object'] = typeof responseJSON.user === 'object' && responseJSON.user;

tests['have token string'] = typeof responseJSON.access_token === 'string';

postman.setEnvironmentVariable('ACCESS_TOKEN', responseJSON.access_token);

postman.setEnvironmentVariable('AUDIENCE', responseJSON.audience);

postman.setEnvironmentVariable('USER_ID', responseJSON.user.id);

postman.setEnvironmentVariable('USER_ROLE', responseJSON.user.role);

postman.setEnvironmentVariable('USER', JSON.stringify(responseJSON.user));
```
