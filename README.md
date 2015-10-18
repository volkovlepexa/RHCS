RHCS
======
RHCS (Robotic Home Controlling System) - open source home automation framework.
This is unofficial documentation for developers.

### Password Alghoritm
pwdHash(password, salt) =  sha256(sha256(**password** + config.auth.pepper) + **salt**)

### Regular expressions
**HEX**: /^[0-9A-Fa-f]+$/

**Numbers and letters **: /^[\w]+$/

**In-system username**: /^[\w.@]+$/

### API Status code

**200** - Success

**201** - Created

**400** - Bad Request

**401** - Unauthorized

**403** - Forbidden

**404** - Not Found

**500** - Internal Server Error
