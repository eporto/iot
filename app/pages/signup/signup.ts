import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {GameService} from '../../providers/game-service/game-service';

@Component({
  templateUrl: 'build/pages/signup/signup.html'
})
export class SignupPage {
  private user:any = {
      name: "" ,
      password: "",
      password2:"",
      gender:"",
      course:"",
      period:1
    }
    private submitted:boolean = false;
    private SignInErrors:Array<string> = [];

    constructor(private navCtrl: NavController, public gameService:GameService) {

    }

  SignUp() {
    this.validateUser(this.user);
    if (this.SignInErrors.length > 0) {
      console.log(this.SignInErrors)
    } else {
        this.gameService.userSignup(this.user, (signup) => {
          if(signup) 
            this.navCtrl.pop();
          else 
            this.SignInErrors.push("Signup Failed");
        });
    }
    
}

  validateUser(form) {
    this.SignInErrors = [];
    if (form.name.trim().length <=0) this.SignInErrors.push("Nome inválido");
    if (form.password.trim().length <=0) this.SignInErrors.push("Senha inválida");
    if (form.gender.trim().length <=0) this.SignInErrors.push("Favor escolher um Sexo");
    if (form.course.trim().length <=0) this.SignInErrors.push("Favor escolher um Curso");
    if (form.password2.trim() !== form.password.trim()) this.SignInErrors.push("As senhas não batem");
  }
}

