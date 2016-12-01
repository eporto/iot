import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
//import 'rxjs/add/operator/map';


@Injectable()
export class GameService {
  private user:any; //User.modal
  private currentSession:any; //Session.Model
  private currentGame:any = null;
  private gameOn = false;

  private Service:any = {
    LOGIN_URL:'https://iot-project.herokuapp.com/app/login', 
    SIGNUP_URL:'https://iot-project.herokuapp.com/app/register',
    LIST_LOBBY_URL:"https://iot-project.herokuapp.com/app/lobby",
    JOIN_LOBBY_URL:"https://iot-project.herokuapp.com/app/lobby",
    CREATE_LOBBY_URL:"https://iot-project.herokuapp.com/app/lobby/create",
    PING_URL:"https://iot-project.herokuapp.com/app/game",
    START_GAME_URL: "https://iot-project.herokuapp.com/app/lobby/start",
    GAME_SCORE_URL: "https://iot-project.herokuapp.com/app/game/score",
    GAME_OVER_URL: "https://iot-project.herokuapp.com/app/game/gameover/"
  }
 /* private Service:any = {
    LOGIN_URL:"http://localhost:5000/app/login",
    SIGNUP_URL:"http://localhost:5000/app/register",
    LIST_LOBBY_URL:"http://localhost:5000/app/lobby",
    JOIN_LOBBY_URL:"http://localhost:5000/app/lobby",
    CREATE_LOBBY_URL:"http://localhost:5000/app/lobby/create",
    PING_URL:"http://localhost:5000/app/game",
    START_GAME_URL: "http://localhost:5000/app/lobby/start",
    GAME_SCORE_URL: "http://localhost:5000/app/game/score",
    GAME_OVER_URL: "http://localhost:5000/app/game/gameover/"
  }*/

  constructor(private http: Http) {}

  getUser() {
    return this.user;
  }

  getLobby() {
    return this.currentSession;
  }

  isHost():boolean {
    if(this.user._id == this.currentSession.host)
      return true;
    else 
      return false;
  }

  userLogin(login:any, callback):any {
    if (login.username.trim().length && login.password.trim().length) {
      //Não enviada quando eu transformava em String/Json
      let dataToSend:any = login;
      this.http.post(this.Service.LOGIN_URL,dataToSend).map(res => res.json())
        .subscribe(data => {
          if (data.status === 404) 
            console.log("Login Failed"); //debug
          else {
            this.user = data;
            //this.navCtrl.setRoot(TabsPage,{name:this.login.username, token: data.token});
             return callback(null,data);
            }
          //console.log(data); //debug
        }, error => {
          console.log("Erro Post: "+error); //debug
          return callback(error,null);
      });
    } else {
      console.log("False"); //debug
    }
 
  }

  userSignup(user:any, callback) {
    let dataToSend:any = user; 

    this.http.post(this.Service.SIGNUP_URL,dataToSend).map(res => res.json())
      .subscribe(data => {
         //this.navCtrl.pop();
         console.log(data); //debug
         if(data.message ==="signup_complete")
          return callback(true);
         else 
          return callback(false);
       
      }, error => {
          console.log("Erro Post: "+error); //debug
    });
  }

   listLobby(callback) {
     this.http.get(this.Service.LIST_LOBBY_URL).map(res => res.json())
      .subscribe(data => {
        if(data.length)
          return callback(data);
        else 
          return null;
      });
   }

   createLobby(lobbyName,callback) {
     let dataToSend = {
       userid:this.user._id,//"581e2d5002228c1e84f18ad9"
       lobbyname:lobbyName
    };

     this.http.post(this.Service.CREATE_LOBBY_URL,dataToSend).map(res => res.json())
      .subscribe(data => {
        this.currentSession=data;
        return callback(data);      
      });
   }

   joinLobby(id, callback) {
     let dataToSend = {
       userid:this.user._id,
       lobbyid:id
    };

     this.http.post(this.Service.JOIN_LOBBY_URL,dataToSend).map(res => {
       if(res.status===200)
        return res.json();
      else 
        return null;
      }).subscribe(data => {
          if(data) {
            this.currentSession = data;
            /*if(this.currentSession.player[0]._id == this.user._id) {
              this.currentSession.player[0].course = this.user.course;
            }*/
            //return callback(data);
            return callback(this.currentSession);
          }
            else 
              return null;
        });
   }

   startGame(callback) {
      let dataToSend = {
       lobbyid:this.currentSession._id
     }

     this.http.post(this.Service.START_GAME_URL,dataToSend).map(res => res.json())
      .subscribe(data => {
        return callback(data);
      });
   }

   pingServer(callback) {
     let dataToSend = {
       sessionid:this.currentSession._id,
       userid:this.user._id
     }

     this.http.post(this.Service.PING_URL,dataToSend).map(res => res.json())
      .subscribe(data => {
        this.decodePingResponse(data,callback);
      }, error => {
        console.log("Ping Error: "+error);
      });
   }

   //pingMessage = gameSession
   //curentSession = lobby.model
   decodePingResponse(pingMessage,callback) {
     if (pingMessage.type == "lobby") { //Só posso ter  2 eventos [Player_Join, Player_Left]
       if(this.currentSession._id == pingMessage.id) {
         if(!(this.currentSession.player.length === pingMessage.players.length)) {
           console.log("Player Update");
           //console.log(pingMessage);
           return callback({message:"player_update",players:pingMessage.players});
         }
       }
     } 
     else if (!this.gameOn && pingMessage.type == "game") {
       console.log("Game Start");
       this.gameOn = true;
       this.currentSession.game = pingMessage.gameid;
       return callback({message:"game_start"});
     }
      else if(pingMessage.isOver == true) {//fechar a partida pro jogador
        console.log("winner: "+pingMessage.result);
        return callback({message:"game_over"});
      }
     else {
       return callback(null);
     } 
   } 

 /*  ================================================================  */
 /*                         IN GAME FUNCTION                           */
 /*  ================================================================  */

 captureBeacon(beacon_id,callback) {
   let dataToSend = {
     userid:this.user._id,
     gameid:this.currentSession.game,
     beaconid:beacon_id
   }

   try {
    this.http.post(this.Service.GAME_SCORE_URL,dataToSend).map(res => res.json())
        .subscribe(data => {
          return callback(data);
      });
   }
   catch (e) {}
 }

 getGameScore(callback) {
  this.http.get(this.Service.GAME_OVER_URL+this.currentSession.game).map(res => res.json())
    .subscribe(data => {
      return callback(data);  
    });
 }

}




