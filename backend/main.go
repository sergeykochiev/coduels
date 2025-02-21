package main

import (
	json "encoding/json"
	"errors"
	"fmt"
	ws "golang.org/x/net/websocket"
	http "net/http"
	slc "slices"
	"strconv"
	"time"
)

const AUTH_COOKIE_NAME = "USERID"

type CoduelsUser struct {
	Id       int
	Name     string
	Password string
}

type CoduelsLobby struct {
	Id         int
	CreatorIdx int
	ShowInfo   bool
	Name       string
	TaskUrl    string
	// Time       int
	IsPublic bool
	Lang     string
}

type CoduelsLobbyTry struct {
	LobbyIdx int
	Data     string
	Lang     string
	UserIdx  int
}

type LobbyWSPayloadType int
type LobbyWSCloseCode int

const (
	LWS_TYPE_LBB LobbyWSPayloadType = iota
	LWS_TYPE_OPP
	LWS_TYPE_INF
	LWS_TYPE_OLV
	LWS_TYPE_OKC
	LWS_TYPE_TRY
	LWS_TYPE_SBT
)

const (
	LWS_CLOSE_BY_HOST    LobbyWSCloseCode = 3003
	LWS_CLOSE_KICK                        = 3004
	LWS_CLOSE_NOT_HOSTED                  = 3005
)

type LobbyWSPayload struct {
	MsgType LobbyWSPayloadType
	Data    any
}

type LobbyWSInfPayload struct {
	CharNumber int
}

type LobbyWSOppPayload struct {
	Id   int
	Name string
}

type LobbyPayload struct {
	Creator LobbyWSOppPayload
	Lobby   CoduelsLobby
}

var UsersStorage []CoduelsUser
var LobbyStorage []CoduelsLobby
var TriesStorage []CoduelsLobbyTry
var UserConnMap map[int]**ws.Conn
var HostPlayerMap map[int]int

func (l *CoduelsLobby) initDefaults() {
	l.ShowInfo = true
	l.Lang = "any"
	// l.Time = 0
}

func lobbyHandler(w http.ResponseWriter, r *http.Request) {
	if corsMiddleware(w, r, "POST, GET") {
		return
	}
	userIdx, err := getRequestUser(r)
	switch r.Method {
	case http.MethodPost:
		var newLobby CoduelsLobby
		newLobby.initDefaults()
		err = json.NewDecoder(r.Body).Decode(&newLobby)
		if err != nil {
			fmt.Println("ERR lobby - error decoding json")
			w.WriteHeader(http.StatusUnprocessableEntity)
			return
		}
		if !newLobby.isValid() {
			fmt.Println("ERR lobby - error getting user id from cookie")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		newLobby.CreatorIdx = userIdx
		newLobby.Id = len(LobbyStorage)
		LobbyStorage = append(LobbyStorage, newLobby)
		w.Write([]byte(strconv.Itoa(len(LobbyStorage) - 1)))
		w.WriteHeader(http.StatusCreated)
		break
	case http.MethodGet:
		err = json.NewEncoder(w).Encode(&LobbyStorage)
		if err != nil {
			fmt.Println("ERR lobby - error encoding json")
			w.WriteHeader(http.StatusUnprocessableEntity)
			return
		}
		break
	default:
		fmt.Println("ERR lobby - error getting user id from cookie")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(err.Error()))
		return
	}
	fmt.Println(time.Now().Unix(), "lobby - request was ok")
}

func lobbyIdHandler(w http.ResponseWriter, r *http.Request) {
	if corsMiddleware(w, r, "GET") {
		return
	}
	lobbyId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		fmt.Println("ERR lobby by id - error parsing lobby id")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}
	targetLobby := &LobbyStorage[lobbyId]
	_, err = getRequestUser(r)
	if err != nil {
		fmt.Println("ERR lobby by id - error getting user id from cookie")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(err.Error()))
		return
	}
	switch r.Method {
	case http.MethodGet:
		var l_pld LobbyPayload
		var user LobbyWSOppPayload
		user.Name = UsersStorage[targetLobby.CreatorIdx].Name
		user.Id = UsersStorage[targetLobby.CreatorIdx].Id
		l_pld.Creator = user
		l_pld.Lobby = *targetLobby
		err = json.NewEncoder(w).Encode(l_pld)
		if err != nil {
			fmt.Println("ERR lobby by id - error encoding json")
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
		}
	default:
		fmt.Println("ERR lobby by id - invalid method", r.Method)
		w.WriteHeader(http.StatusNotFound)
		return
	}
	fmt.Println("lobby by id - request was ok")
}

func getRequestUser(r *http.Request) (int, error) {
	authCookie, err := r.Cookie(AUTH_COOKIE_NAME)
	if err != nil {
		return -1, err
	}
	// if authCookie.Expires.Before(time.Now()) {
	// 	return -1, errors.New("Session expired")
	// }
	userIdx, err := strconv.Atoi(authCookie.Value)
	if err != nil || userIdx >= len(UsersStorage) {
		return -1, errors.New("Invalid user index in auth cookie")
	}
	return userIdx, nil
}

func (u CoduelsUser) isValid() bool {
	if u.Name == "" || u.Password == "" {
		return false
	}
	if len(u.Password) < 8 {
		return false
	}
	return true
}

func (l CoduelsLobby) isValid() bool {
	if l.Name == "" || l.TaskUrl == "" {
		return false
	}
	return true
}

func (l CoduelsLobbyTry) isValid() bool {
	if l.Data == "" || l.Lang == "" {
		return false
	}
	return true
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	if corsMiddleware(w, r, "POST") {
		return
	}
	if r.Method != http.MethodPost {
		fmt.Println("ERR register - invalid method", r.Method)
		w.WriteHeader(http.StatusNotFound)
		return
	}
	var newUser CoduelsUser
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		fmt.Println("ERR register - error decoding json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		return
	}
	if !newUser.isValid() {
		fmt.Println("ERR register - user dto contains invalid data")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	userIdx := slc.IndexFunc(UsersStorage, func(u CoduelsUser) bool { return u.Name == newUser.Name })
	if userIdx != -1 {
		fmt.Println("ERR register - user with that username already exists")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("User already exists"))
		return
	}
	newUser.Id = len(UsersStorage)
	UsersStorage = append(UsersStorage, newUser)
	fmt.Println("register - request was ok, new user created successfully")
	w.WriteHeader(http.StatusCreated)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if corsMiddleware(w, r, "GET") {
		return
	}
	if r.Method != http.MethodGet {
		fmt.Println("ERR login - invalid method", r.Method)
		w.WriteHeader(http.StatusNotFound)
		return
	}
	// fmt.Println("login - basic auth header value is", r.Header.Get("Authorization"))
	username, password, ok := r.BasicAuth()
	if !ok {
		fmt.Println("ERR login - error parsing basic auth creds")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	userIdx := slc.IndexFunc(UsersStorage, func(u CoduelsUser) bool { return u.Name == username })
	if userIdx == -1 {
		fmt.Println("ERR login - no user found matching provided username")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Invalid username"))
		return
	}
	targetUser := &UsersStorage[userIdx]
	if targetUser.Password != password {
		fmt.Println("ERR login - password mismatch")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Invalid password"))
		return
	}
	authCookie := http.Cookie{
		Name:  AUTH_COOKIE_NAME,
		Value: fmt.Sprintf("%d", userIdx),
		// Quoted: false,
		Secure: false,
		// Expires: time.Now().Add(3600000),
		MaxAge: 36000000,
	}
	http.SetCookie(w, &authCookie)
	fmt.Println("login - request was ok")
	w.WriteHeader(http.StatusOK)
}

func (lobby *CoduelsLobby) getOpponentConn(hosting bool) (**ws.Conn, int, bool) {
	var conn **ws.Conn
	var isConn bool
	if hosting {
		opp, isPlayer := HostPlayerMap[lobby.CreatorIdx]
		if isPlayer {
			conn, isConn = UserConnMap[opp]
			return conn, opp, isConn
		}
		return nil, -1, false
	}
	conn, isConn = UserConnMap[lobby.CreatorIdx]
	return conn, lobby.CreatorIdx, isConn
}

func sendLobbyWSPayload(c *ws.Conn, msgType LobbyWSPayloadType, data any) error {
	fmt.Println("lobby ws - sending payload", msgType)
	var pld LobbyWSPayload
	pld.MsgType = msgType
	pld.Data = data
	return ws.JSON.Send(c, pld)
}

func lobbyIdWsHandler(c *ws.Conn) {
	var closeCode int = 1000
	defer func() {
		if c != nil {
			fmt.Printf("lobby ws - ws conn closed explicitly\n")
			c.WriteClose(closeCode)
		} else {
			fmt.Printf("lobby ws - ws conn closed implicitly\n")
		}
	}()
	fmt.Printf("lobby ws - received ws conn\n")
	r := c.Request()
	lobbyId, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		fmt.Printf("ERR lobby ws - error parsing lobby id\n")
		return
	}
	if lobbyId >= len(LobbyStorage) {
		fmt.Printf("ERR lobby ws - lobby with that lobby id doesn't exist\n")
		return
	}
	targetLobby := &LobbyStorage[lobbyId]
	userIdx, err := getRequestUser(r)
	if err != nil {
		fmt.Printf("ERR lobby ws (user %d) - error getting user id from cookie\n", userIdx)
		return
	}
	hosting := targetLobby.CreatorIdx == userIdx
	_, isHostConn := UserConnMap[targetLobby.CreatorIdx]
	if !isHostConn && !hosting {
		fmt.Printf("ERR lobby ws (user %d) - trying to join lobby which isn't hosted\n", userIdx)
		closeCode = LWS_CLOSE_NOT_HOSTED
		return
	}
	if hosting {
		fmt.Printf("lobby ws (user %d) - creator hosted a lobby conn\n", userIdx)
	} else {
		player, is := HostPlayerMap[targetLobby.CreatorIdx]
		if is && player != userIdx {
			fmt.Printf("ERR lobby ws (user %d) - trying to join lobby as a player when player already exists\n", userIdx)
			return
		} else {
			_, is = UserConnMap[userIdx]
			if is && player != userIdx {
				fmt.Printf("ERR lobby ws (user %d) - trying to join a lobby when already in a lobby\n", userIdx)
				return
			}
			HostPlayerMap[targetLobby.CreatorIdx] = userIdx
			fmt.Printf("lobby ws (user %d) - player (%d) connected to a lobby conn\n", userIdx, userIdx)
		}
	}
	// print(c.Config().Origin.String())
	UserConnMap[userIdx] = &c
	opponentConn, opponent, isOpponentConn := targetLobby.getOpponentConn(hosting)
	closeOpponentConn := func(reason int) {
		(*opponentConn).WriteClose(int(reason))
		*opponentConn = nil
		delete(UserConnMap, opponent)
	}
	defer func() {
		opponentConn, opponent, isOpponentConn = targetLobby.getOpponentConn(hosting)
		delete(UserConnMap, userIdx)
		if hosting && isOpponentConn {
			closeOpponentConn(int(LWS_CLOSE_BY_HOST))
			fmt.Printf("lobby ws (user %d) - host closed the conn\n", userIdx)
		} else {
			_, ok := UserConnMap[targetLobby.CreatorIdx]
			if !ok {
				return
			}
			sendLobbyWSPayload(*UserConnMap[targetLobby.CreatorIdx], LWS_TYPE_OLV, nil)
			fmt.Printf("lobby ws (user %d) - player disconnected\n", userIdx)
		}
		delete(HostPlayerMap, targetLobby.CreatorIdx)
	}()
	var wsErr error
	wsErr = sendLobbyWSPayload(c, LWS_TYPE_LBB, *targetLobby)
	if wsErr != nil {
		return
	}
	if isOpponentConn {
		var oppData LobbyWSOppPayload
		oppData.Name = UsersStorage[userIdx].Name
		wsErr = sendLobbyWSPayload(*opponentConn, LWS_TYPE_OPP, oppData)
		if wsErr != nil {
			return
		}
		oppData.Name = UsersStorage[opponent].Name
		wsErr = sendLobbyWSPayload(c, LWS_TYPE_OPP, oppData)
		if wsErr != nil {
			return
		}

		// var infData LobbyWSInfPayload
		// // TODO save last opponent state
		// infData.CharNumber = 20
		// wsErr = sendLobbyWSPayload(opponentConn, LWS_TYPE_INF, infData)
		// if wsErr != nil {
		// 	return
		// }
		// infData.CharNumber = 10
		// wsErr = sendLobbyWSPayload(c, LWS_TYPE_INF, infData)
		// if wsErr != nil {
		// 	return
		// }
	}
	for {
		frameReader, wsErr := c.NewFrameReader()
		if wsErr != nil {
			return
		}
		var message LobbyWSPayload
		wsErr = json.NewDecoder(frameReader).Decode(&message)
		if wsErr != nil {
			fmt.Printf("ERR lobby ws (user %d) - error decoding json payload %d\n", userIdx, message.MsgType)
			return
		}
		opponentConn, opponent, isOpponentConn = targetLobby.getOpponentConn(hosting)
		fmt.Printf("User %d - opponent is %d\n", userIdx, opponent)
		fmt.Printf("lobby ws (user %d) - payload type is %d\n", userIdx, message.MsgType)
		switch message.MsgType {
		case LWS_TYPE_INF:
			var infData LobbyWSInfPayload
			byteArr, _ := json.Marshal(message.Data)
			ok := json.Unmarshal(byteArr, &infData)
			if ok != nil {
				fmt.Printf("ERR lobby ws (user %d) - failed to assert inf payload\n", userIdx)
				return
			}
			if isOpponentConn {
				fmt.Printf("lobby ws (user %d) - opponent (%d) found, sending info to them\n", userIdx, opponent)
				wsErr = sendLobbyWSPayload(*opponentConn, LWS_TYPE_INF, infData)
				if wsErr != nil {
					return
				}
			}
		case LWS_TYPE_OKC:
			if isOpponentConn && hosting {
				fmt.Println("Opponent for kick is", opponent)
				wsErr = sendLobbyWSPayload(c, LWS_TYPE_OKC, nil)
				if wsErr != nil {
					return
				}
				closeOpponentConn(int(LWS_CLOSE_KICK))
				fmt.Printf("lobby ws (user %d) - host kicked opponent\n", userIdx)
			}
		}
		fmt.Printf("lobby ws (user %d) - request was ok\n", userIdx)
	}
}

func setCorsHeaders(h http.Header, r *http.Request, methods string) {
	h.Set("Access-Control-Allow-Methods", methods)
	h.Set("Access-Control-Allow-Headers", "Authorization")
	h.Set("Access-Control-Allow-Credentials", "true")
	h.Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
	h.Set("Access-Control-Max-Age", "86400")
}

func corsMiddleware(w http.ResponseWriter, r *http.Request, methods string) bool {
	setCorsHeaders(w.Header(), r, methods)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return true
	}
	return false
}

func testInit() {
	UsersStorage = append(UsersStorage, CoduelsUser{
		Id:       0,
		Name:     "dupa",
		Password: "dupadupa",
	})
	UsersStorage = append(UsersStorage, CoduelsUser{
		Id:       1,
		Name:     "dupa1",
		Password: "dupadupa",
	})
	LobbyStorage = append(LobbyStorage, CoduelsLobby{
		Id:       0,
		ShowInfo: false,
		Name:     "Test lobby",
		TaskUrl:  "some.url.com/path",
		// Time:     1735215629,
		IsPublic: true,
		Lang:     "C#",
	})
}

func main() {
	HostPlayerMap = make(map[int]int)
	UserConnMap = make(map[int]**ws.Conn)
	addr := "127.0.0.1:3003"
	fmt.Println("Listening to", addr)
	// TODO create a single handler for /lobby/id
	// it will upgrade the connection to ws if needed
	http.Handle("/lobby/{id}/ws", ws.Handler(lobbyIdWsHandler))
	http.HandleFunc("/lobby", lobbyHandler)
	http.HandleFunc("/lobby/{id}", lobbyIdHandler)
	http.HandleFunc("/register", registerHandler)
	http.HandleFunc("/login", loginHandler)
	testInit()
	http.ListenAndServe(addr, nil)
}
