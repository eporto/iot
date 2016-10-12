import { Component } from '@angular/core';
import { NavController, ModalController} from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';
import { RegisterPage } from '../register/register';
//import { SignupPage } from '../signup/signup';
//import { UserData } from '../../providers/user-data';


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

  constructor(public navCtrl: NavController, private http: Http/*, public userData: UserData*/) { }

  ionViewDidLoad() {
    //Disparado quando o Ionic View terminar de carregar.
  }

  onLogin() {
    /*this.submitted = true;
    if (form.valid) {
     // this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }*/
    if (this.validate(this.login.username) && this.validate(this.login.password)) {
      //let url:string = "http://localhost:8080/app/login";
      let url:string = 'https://iot-project.herokuapp.com/app/login';
      let dataToSend:any = this.login; //Não enviada quando eu transformava em String/Json

      this.http.post(url,dataToSend).map(res => res.json())
        .subscribe(data => {
          if (data.message == "login_failed") this.loginError = true;
          else if(data.message == "login_complete") this.navCtrl.setRoot(TabsPage,{name:this.login.username, token: data.token});
          console.log(data);
        }, error => {
          console.log("Erro Post: "+error);
      });
    } else {
      console.log("False");
    }
    
  }

  onSignup() {
    //renomeiar RegisterPage para SignUp page
    this.navCtrl.push(RegisterPage);
  }

  validate(credentials):boolean {
    return credentials.trim().length > 0? true : false;
  }
}