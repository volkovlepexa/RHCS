var redis = require('../system/core/redisFactory');

redis.set('rhcs:users:demousr',"{\"username\":\"demousr\",\"password\":\"1b0b73a2842fcfcf64791d15f72a51e38459f4162b6e00f644bc75535b7f3b8b\",\"email\":\"defman@notadefman.cc\",\"birthday\":\"15.04.1995\",\"fullname\":\"WhoIsDefman\",\"salt\":\"4eaf4126fdb0efcf64b647edb747fb14\"}");

redis.set('rhcs:devices:celone', "{\"ip\": \"192.168.1.35\", \"password\":\"leporskyinthesky\", \"proto\": \"celestia\", \"apikey\": \"e62b804a71da26f8d7bdcee4a6309a2b\"}")

redis.set('rhcs:celestia_thing:0', '{"parent": "celone", "description": "Бра #1", "type": "ao", "pin": 2, "value": 0}');
redis.set('rhcs:celestia_thing:1', '{"parent": "celone", "description": "Бра #2", "type": "ao", "pin": 3, "value": 0}');
redis.set('rhcs:celestia_thing:2', '{"parent": "celone", "description": "Сегмент #1", "type": "neopixel_sg", "pin": 22, "segment": 1, "value": "#000000"}');
redis.set('rhcs:celestia_thing:3', '{"parent": "celone", "description": "Сегмент #2", "type": "neopixel_sg", "pin": 22, "segment": 2, "value": "#000000"}');
redis.set('rhcs:celestia_thing:4', '{"parent": "celone", "description": "Розетка", "type": "xbee_doxor", "sID": "09A38D", "pin": 4, "value": 0 }');
redis.set('rhcs:celestia_thing:5', '{"parent": "celone", "description": "Вентилятор", "type": "xbee_doxor", "sID": "09A38D", "pin": 5, "value": 0 }');