import { Component } from '@angular/core';
import { NavController, ModalController, ToastController} from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';
import { SignupPage } from '../signup/signup';
import { ServerPage } from '../serverpage/serverpage';
import { GameService } from '../../providers/game-service/game-service';


@Component({
   templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  private login:any = {
    username: "" ,
    password: ""
  }
  private submitted:boolean = false;
  private loginError:boolean = false;
  private errorMessage:any;

  constructor(public navCtrl: NavController, private http: Http, public toastCtrl:ToastController, public gameService:GameService) { }

  ionViewDidLoad() {
    //Disparado quando o Ionic View terminar de carregar.
  }

  onLogin() {
    this.loginError = false;
    this.gameService.userLogin(this.login,(err,user) => {
      if(user)
        //this.navCtrl.setRoot(TabsPage,{name:user.name});
        this.navCtrl.setRoot(TabsPage,{name:user.name});
      else {
        this.loginError = true;
        this.errorMessage = err;
      }
    });
    
   

  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }

  creditsPage() {
     let toast = this.toastCtrl.create({
      message: "Criado por Eduardo Porto para disciplina de Tópicos Avançados em Rede de Computadores I",
       showCloseButton: true,
       position: 'middle'
    });
    toast.present();
  }

}