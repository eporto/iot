import {Component, NgZone} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {GameService} from '../../providers/game-service/game-service';
import { AlertController } from 'ionic-angular';
import {CameraTestPage} from '../camera-test/camera-test';
import {EnvioPage} from '../enviopage/enviopage';

declare var cordova;

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})

export class TabsPage {
  private userData:any;
  
  private lobby:Array<any> = [];
  private currentLobby:any = null;
  private inLobby:boolean = false;
  private ping:any = null;
  private isHost:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public gameService: GameService, public alertCtrl: AlertController, public zone:NgZone) {
    this.userData = { 
      name: this.navParams.get('name'),
    };
  }

  changePage (page:any) {
    this.navCtrl.push(page);
  }


  onCreateLobby() {
    let prompt = this.alertCtrl.create({
        title: 'Lobby Name',
        message: "Digite um nome para a Sala",
        inputs: [
          {
            name: 'title',
            placeholder: 'Um nome daora'
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            handler: data => {
            }
          },
          {
            text: 'Criar',
            handler: data => {
              this.createLobby(data.title);
            }
          }
        ]
      });
      prompt.present();
  }
  
  createLobby(title) {
    this.gameService.createLobby(title, (data) => {
      if(data) {
        this.joinLobby(data._id);
      }
    });
  }

  listLobby() {
    this.lobby = [];
    this.gameService.listLobby((lobby) => {
      if (lobby) {
        let len = lobby.length;
        for (let i=0;i<len;i++) {
          this.lobby.push(lobby[i]);
        }
      }
    });
  }

  joinLobby(id) {
    this.gameService.joinLobby(id, (data) => {
      if(data) {
        this.inLobby = true;
        this.currentLobby = data;
        //console.log(data);
        this.pingInterval();
        this.isHost = this.gameService.isHost();
      }
    });
  }

  leaveLobby() {
    clearInterval(this.ping);
    this.ping = null;
    this.currentLobby = null;
    this.inLobby = false;
  
  }

  pingInterval() {
    if(this.ping === null) {
      //clearInterval(ping);
      if(this.currentLobby !== null && this.inLobby) {
        this.ping = setInterval(()=> {
          this.gameService.pingServer((data) => {
            if(data) {
              if(data.message === "player_update") {
                this.currentLobby.player = data.players;
              } 
              else if (data.message === "game_start") {
                this.navCtrl.setRoot(CameraTestPage,{ping:this.ping}); //returns Promise when transition is resolved
              }
              else if (data.message === "game_over") {
               cordova.plugins.camerapreview.stopCamera();
                this.navCtrl.setRoot(EnvioPage);
                clearInterval(this.ping);
              }
            }
          });
        },3000);
      }
    }
  }

  startGame() {
  //So o HOST pode começar o jogo !
   if(this.isHost) {
     this.gameService.startGame((data) => {
       if(data) { console.log("Ok");
        //this.navCtrl.setRoot(CameraTestPage,{ping:this.ping}); //returns Promise when transition is resolved
       }
    });
     

   }
  }
}
