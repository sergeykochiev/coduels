#!/usr/bin/bash

curl localhost:3003/register -d '{"name":"dupa","password":"dupapupa"}' -H "Content-Type: application/json"
# echo "-------------------------"
curl localhost:3003/register -d '{"name":"dupa1","password":"dupapupa"}' -H "Content-Type: application/json"
# echo "-------------------------"
curl localhost:3003/lobby -X POST -d '{"showInfo":false,"name":"Test lobby","taskUrl":"some.url.com/path","time":1735215629,"isPublic":true,"lang":"C#"}' -H "Content-Type: application/json" --cookie "USERID=0"
