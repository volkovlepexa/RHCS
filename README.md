RHCS
======
RHCS (Robotic Home Controlling System) - open source home automation framework, written on NodeJS.

## Hello
This is unofficial indevelopment documentation, that using by
developers, when they works.

## PWD Note
demo:demo
michael:sweaterweather
gleb:sweaterweather

MQTT:Indigo:furetnth
MQTT:arduOne:HR911105A

### PWD Algorithms
pwdHash(x, s) = sha256(sha256(x + config.auth.pepper) + s);
// X - Our password; || S - Our Password Salt

### Snippet
----
#### HEX RegExp
/^[0-9A-Fa-f]+$/

#### Only letters and numbers RegExp
/^[\w]+$/

#### Username RegExp
/^[\w.]+$/

#### Data default format
date('H:i d.m.y')

### Return codes
----
#### Successfull (2xx)
**200** - Success

**201** - Successful Created

#### Internal Server Error (5xx)
**500** - Internal Server Error

#### Client error (4xx)
**400** - Bad Request (ex: incorrect data)

**401** - Unauthorized (ex: request without apikey)

**403** - Forbidden (ex: invalid username / password)

**405** - Method not allowed (part of REST API)

**429** - Too Many Requests (ex: exceed invalid authication limit)


### В этой части есть несколько блок-схем. Просто так

1. Authication

1.1 Client === (username, password) ==> API
1.2 API === (code, session, deauthToken) ==> Client

2. Deauthication

2.1 Client === (session, deathToken) ==> Client
2.2 API === (code) ==> Client

// **Attention!** - Токен деавторизации передаётся один раз при непосредственно
// авторизации, и не покидает пределов браузера до момента деавторизации.


### Additional Resources

* CSS3 Glass Water Filling - Pritesh Gupta