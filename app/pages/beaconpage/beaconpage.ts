
import {Component, NgZone, ElementRef, ViewChild} from '@angular/core';
import {NavController, ToastController, ModalController, NavParams, ViewController} from 'ionic-angular';
import {IBeacon} from 'ionic-native';

@Component({
  templateUrl: 'build/pages/beaconpage/beaconpage.html'
})
export class BeaconPage {
  private FIRE_GEM:number = 1261;
  private EARTH_GEM:number = 1273; //DREYER
  private WIND_GEM:number = 1274; //DREYER
  private WATER_GEM:number = 1359; //HILDEMIR

  private ison:boolean = false;
  private err:any = "";
  private beacons:Array<any> = [];
  private rangebeacons:any = "";
  private monitorbeacons:any = "";
  private enterregionbeacons:any ="";
  private regionerror:any = "";
  //private delegate:any;
  private debug:number = 0;
  private opt:number = 0;

  //the minor value of the next Beacon that needs to be activated
  private nextBeaconToActivate:number; //1365, 1261,1274,1273
  private ActivateOrder:Array<number> = [this.FIRE_GEM,this.EARTH_GEM,this.WIND_GEM,this.WATER_GEM];
  private currentSlot:number = 1;
  //The Beacon seen by the App (this needs to be only one)
  private beaconInRange:number;
  private isBeaconInRange:boolean = false;
  //Boolean to check if the app is currently ranging any region
  private isRanging:boolean = false;

  private beaconFoundText:string;
  private deactivatedBeacons:Array<number> = [];
  //private GloveSlots:Array<number> = [];
  private gemText:string;
  private gameOn:boolean = false;
  //Objetivo: Ir pra perto de um Beacon e apertar o botão "Ativar Beacon(Elemento)"
  //Depois de ativar todos ganha.

  //Beacon = uuid, major, minor, proximity (IMMEDIATE,NEAR,FAR,UNKNOWN), tx, rssi, accuracy
  @ViewChild('slot1') slot1: ElementRef;
  @ViewChild('slot2') slot2: ElementRef;
  @ViewChild('slot3') slot3: ElementRef;
  @ViewChild('slot4') slot4: ElementRef;
  @ViewChild('unleash') unleash: ElementRef;
  constructor(private navCtrl: NavController, private zone:NgZone, private toastCtrl:ToastController, private modalCtrl:ModalController) {

/*    try {
    //  IBeacon.requestAlwaysAuthorization();
    //  this.delegate = IBeacon.Delegate();
    // this.locate();
    // create a new delegate and register it with the native layer
    } catch (e) {
      this.err = e.message;
    } finally {

    }*/

  }

  log(m) {
    console.log(m);
  }

  //UNLEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASH THE POWA
unleashThePower() {
  let win = true;
  let len = this.ActivateOrder.length;
  for(let i = 0; i < len; i++) {
    if (this.deactivatedBeacons[i] !== this.ActivateOrder[i]) {
      win = false;
    }
  }
  // -- SE EU TO AQUI É PQ EU GANHEI, KCT CARALHO SOU FODA --
  if (win) {
    this.GameOver("PARABÉNS");
  } else {
    this.GameOver("PERDEU BABACA");
  }

}
  GameOver(win) {
    let gameoverModal = this.modalCtrl.create(GameOverPage,{text:win});
    gameoverModal.present();

  }
  checkDisabledBeacon(gem:number):boolean {
    let len = this.deactivatedBeacons.length;
    for (let i = 0; i < len; i++) {
      if (gem == this.deactivatedBeacons[i]) {
        return true;
      }
    }
    return false;
  }
  deactiveBeacon(beacon:number) {
    //desativar beacon aqui
  }
  addGemToGlove(gem:number) {
    let slot;
    switch(this.currentSlot) {
      case 1:
        slot = this.slot1.nativeElement;
        break;
      case 2:
        slot = this.slot2.nativeElement;
        break;
      case 3:
        slot = this.slot3.nativeElement;
        break;
      case 4:
        slot = this.slot4.nativeElement;
        break;
      default:
        this.currentSlot = 0;
      }
      if (this.currentSlot != 0) {
        switch(gem) {
          case this.FIRE_GEM:
              slot.style.backgroundColor = 'red';
              break;
          case this.EARTH_GEM:
              slot.style.backgroundColor = 'brown';
              break;
          case this.WATER_GEM:
              slot.style.backgroundColor = 'blue';
              break;
          case this.WIND_GEM:
              slot.style.backgroundColor = 'cyan';
              break;
        }
        this.deactivatedBeacons.push(gem);
        this.currentSlot++;
      }
    }
  readScroll () {
  /*  let toast = this.toastCtrl.create({
      message: "No inicio a escuridão era eterna."+
       "O ódio resplandeceu então o fogo nasceu."+
       "as feridas queimadas cicatrizaram e então gerou a terra."+
       "Gritos de angustia geraram o vento uivante"+
       "no que os ceus derramaram um mar de lagrimas"+
       "Vivemos em sombras"+
       "o mundo que conhecemos"+
       "construido/constituido em/de raiva, sofrimento, anguistia e tristeza..."+
       "renascimento pela destruição...",
       showCloseButton: true,

       position: 'botom'
    });

    toast.present();*/
    let msg = "No inicio a escuridão era eterna."+
     "O ódio resplandeceu então o fogo nasceu."+
     "as feridas queimadas cicatrizaram e então gerou a terra."+
     "Gritos de angustia geraram o vento uivante"+
     "no que os ceus derramaram um mar de lagrimas"+
     "Vivemos em sombras"+
     "o mundo que conhecemos"+
     "construido/constituido em/de raiva, sofrimento, anguistia e tristeza..."+
     "renascimento pela destruição...";

    this.showToast(msg,'bottom',true);
  }

  showToast(msg:string,pos:string,closeb?:boolean,drt?:number) {
    let toast = this.toastCtrl.create({
      message: msg,
      showCloseButton: closeb || false,
      duration: drt || null,
      position: pos
    });
    toast.present();
  }
  startGame () {
    this.gameOn = !this.gameOn;
  /*  let a = [{minor:this.FIRE_GEM,accuracy:1.0}];
    this.processBeacon(a);*/
   this.locate();
  }

  //Preciso fazer verificação de QUEM tá mais perto?
  processBeacon(beacon:Array<any>) {
    let len = beacon.length;
    let menor = 9999;
    let gemMIN;
    //this.isBeaconInRange = false;
    for(let i = 0; i < len; i++) {
      if(beacon[i].accuracy <= 1.50) {
        if (menor > beacon[i].accuracy) {
          menor = beacon[i].accuracy;
          gemMIN = beacon[i].minor;
        }

      //  this.isBeaconInRange = true;
      }
    }
    if (menor === 9999) {
      this.zone.run(() =>{
        this.beaconInRange = 0;
        this.gemText = "";
        this.beaconFoundText = "";
      });

    } else {
        this.setActiveGem(gemMIN);
    }
  }

  //Seta o Beacon com menor distância encontrado como a Joia Ativa
  //gem:number -> Beacon.minor
  setActiveGem(gem:number) {
    if (gem !== this.beaconInRange) {
      this.beaconFoundText = "OBJETO ESTRANHO DETECTADO";
      setTimeout(() => {
        this.zone.run(() => {
            this.beaconInRange = gem;
            this.gemText = this.generateGemText(gem);
      });
    },2000);
    }

  }

generateGemText(abc:number) {


  let water_text = [
    "PORQUE A ÁGUA FOI PRESA????????????????????",
    "Bob Esponja.",
    "Quando Chuck Noris entra na água ele não fica molhado, a água que fica Chuck Noris",
    "Porque piadas sobre água é tão difícil no Google?",
    "RELEAAAAAAAAAAAAAAAAAAAAAAAAAAASE THE KRAKEN"
  ];
  let fire_text = [
    "Nossa, de repente tudo começou a ficar tão quente.... Acho que você deveria tirar a roupa :^)",
    "Aposto que que se você colocar um ovo no chão vai sair um pintinho... era assim a piada né?",
    "A PREVISÃO DO TEMPO INFORMA: O INFERNO SUBIU UM ANDAR ! ...Mestre você me escuta?",
    "Caralho, tá tão quente que fui cuspir e assoviei o_o",
    "Tá quente. Que foi? Esperou uma piada aqui? Sai fora, tá calor demais pra uma piada."
  ];

  let earth_text = [
    "__???__,FOGO,VENTO,ÁGUA E CORAÇÃO !!!",
    "Segundo Mamonas Assassinas o movimento da translação é o que faz a terra girar..",
    "Keep the Earth clean, it's not Uranus :D",
    "A terra é o melhor planeta do mundo, vai na fé.",
    "Se eu falar MALPHITE, quantas pessoas aqui vão entender que a dica é sobre a Terra?"

  ];
  let wind_text = [
    "Já dizia a Dilma sobre o Estocamento de Vento",
    "Se você procurar sobre piadas envolvendo Vento no Google só aparec,e a cara da Dilma, hahaha.....",
    "WINDS! OBEY MY COMMAND !!!! Eu sempre quis gritar isso...",
    "O que Janna, Al'Akir, Alleria,Pharah tem em comum? Não conhece ninguém ???? Sem cultura.... ",
    "var wind_text:Array<string> = []; É o nome da minha variável pra guardar textos sobre o Vento, hehe."
  ];

  let rand = Math.floor(Math.random()*5);
  if (abc == this.FIRE_GEM) {
    return fire_text[rand];
  } else if (abc == this.EARTH_GEM) {
    return earth_text[rand];
  } else if (abc == this.WATER_GEM) {
    return water_text[rand];
  } else if (abc == this.WIND_GEM) {
    return wind_text[rand];
  }  else {
    return 'BUGOU';
  }



}
  locate () {
   let uuid = '003e8c80-ea01-4ebb-b888-78da19df9e55';
   let id = 'Beacon';
  //  let region = IBeacon.BeaconRegion("OC:F3:EE:03:F5:AD", "003e8c80-ea01-4ebb-b888-78da19df9e55");
    //Começa monitoramento de uma região

  let delegate = IBeacon.Delegate();


delegate.didRangeBeaconsInRegion()
    .subscribe(
      data => {
          //CHAMADO MESMO SEM BEACON
          if (data.beacons.length > 0) {
            this.processBeacon(data.beacons);
            this.beacons = data.beacons;
          }
      },
      error => this.err = error /* Handle Error */
    );

  delegate.didStartMonitoringForRegion()
    .subscribe(
      data => this.monitorbeacons = JSON.stringify(data),
      error => this.monitorbeacons = "Error: "+error
    );

  delegate.didEnterRegion()
    .subscribe(
      data => {
        this.enterregionbeacons = JSON.stringify(data)
      }
    );

  delegate.didExitRegion()
    .subscribe(
      data => {
       this.regionerror = JSON.stringify(data.beacons);
      }
    );
    //Cria uma região de Beacon (nome e UUID) -> Identificador do Beacon a ser procurado
    //IBeacon.BeaconRegion(ident:string, uuid:string, major?:number, minor?:number): Region
    //let rg = IBeacon.BeaconRegion("0C:F3:EE:03:F5:AD", "003E8C80-EA01-4EBB-B888-78DA19DF9E55"); //BRTAG

      let rg = IBeacon.BeaconRegion(id,uuid);



/*  IBeacon.startMonitoringForRegion(rg)
    .then(
      () => console.log('Native layer recieved the request to monitoring'),
      error => this.regionerror = "Error: "+error
    );*/
    IBeacon.startRangingBeaconsInRegion(rg)
      .then(
        () => this.isRanging = true,
        error => console.log(error) /* Handl Error */
      );
}

}

@Component({
  template: `
  <ion-header>
    <ion-navbar>
      <ion-title > GameOver </ion-title>
    </ion-navbar>
  </ion-header>

  <ion-content>
    <ion-label> {{gameoverText}} </ion-label>
    <br>
    <button block (click) = "dismiss()"> Close </button>
    </ion-content>
  `
})
class GameOverPage {
  private gameoverText:string;

  constructor(private params: NavParams, private view:ViewController) {
    this.gameoverText = params.get('text');
  }

  dismiss() {
    this.view.dismiss();
  }
}
/*
 * RANGING BEACONS (startRangingBeaconsInRegion)
 * -Precisa especificar o UUID que os Beacons estão emitindo (Não pode 'scan genérico')
 * -didRangeBeacons é chamado a cada X segundos com um array de Beacons encontrados.
 * -'Exiting a Region' é definido depois de passar X tempo sem receber um sinal (então não pode ser feito de imediato)
 * -Não funciona no background (Somente foreground)
 *
 * MONITORING BEACONS (startMonitoringForRegion)
 * -Funciona independentemente se está no background, finalizado ou suspenso
 * -Quando encontrar um Beacon chama o didEnterRegion. Quando perder contato com um Beacon chama o didExitRegion
 * -o Monitoramente serve para dizer que aqui tem uma região monitorada e SÓ (Não pega nenhum detalhe do Beacon NEM de onde veio o sinal)
 * -Monitoramento NÃO retorna nenhum beacon/lista (Ou seja, nenhum Data.beacons[])
 *
 * Ranging X Monitoring
 * Monitoring: Serve pra você procurar por Regiões de Beacon (Se aqui tem uma região e SÓ)
 * Ranging: Interagir com os beacons (Capturar as informações emitidas pelos Beacons)
 */

/*
 *
 */

 /*
 In the beginning was shadow eternal.
Hate blazed forth, and FIRE was born.
Wounds scabbed, and so begat EARTH.
Cries of anguish birthed howling WIND.
Wherein the skies wept seas of TEARS.
We live in the shadow,
The world we know
Built of rage, hurt, anguish and sorrow.
*/
