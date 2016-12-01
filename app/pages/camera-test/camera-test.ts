import { Component, ViewChild, ElementRef, NgZone} from '@angular/core';
import { NavController,NavParams, Platform} from 'ionic-angular';
import { ScreenOrientation } from 'ionic-native';
import {IBeacon} from 'ionic-native';
import {GameService} from '../../providers/game-service/game-service';

declare var cordova;

@Component({
  templateUrl: 'build/pages/camera-test/camera-test.html',
})
export class CameraTestPage {
  //Constants
  private GHOST_A:number = 1261;
  private GHOST_B:number = 1273; //DREYER
  private GHOST_C:number = 1274; //DREYER
  private GHOST_D:number = 1359; //HILDEMIR //1363
  private GHOST_E:number = 1363;

  private GHOST_MAX_CAPTURE_POINT = 3;
  
  //Beacons Variables
  private beaconNear:any = null;          //can spawn ghost
  private beaconIntermediate:any = null;  //something near 
  private beaconFar:any = null;           //i'm on the right direction
  
  //Ghost Variables
  private activeGhost:any = {
    id: null,
    posX: 0, 
    posY: 0, 
    step: 10, 
    canMove: true,
    isAlive:false, //lol
    moveAI:null,
    captureMode: {
      isCapturing:false,
      capturePoint:0
    },
    view: null
  }
  private alertMessages:string = null;
  private canSpawn:boolean = true;
  private ghostBeacons:Array<number> = [this.GHOST_A,this.GHOST_B,this.GHOST_C,this.GHOST_D, this.GHOST_E];
  
  private playerScore:number = 0;
  canMove = true;
  moving = false;

  ping:any = null;
  isCaptureEffect:boolean = false;
  @ViewChild('ghostTemplate') ghostTemplate: ElementRef;
  @ViewChild('captureBtn') captureBtn: ElementRef;
  @ViewChild('captureGauge') captureGauge: ElementRef;
  /* DEBUG */
  debugList = [];
  debugCount;
  canShowDebug = false;
  ghostIndex;
  constructor(private navCtrl: NavController, private platform: Platform, private zone:NgZone, public params:NavParams, public gameService:GameService) {
   //ScreenOrientation.unlockOrientation(); //Allow screen rotation
    IBeacon.requestAlwaysAuthorization();
    this.ping = this.params.get('ping');
  }

// -- PAGE VIEW LOGICO --
  ionViewLoaded() { //1
    console.log("Debug: -- Ionic App Start --");
    this.activeGhost.view = this.ghostTemplate.nativeElement;
    try {
     //ScreenOrientation.lockOrientation('landscape');

      let tapEnabled = false; //enable tap take picture
      let dragEnabled = false; //enable preview box drag across the screen
      let toBack = true; //send preview box to the back of the webview
      let cameraRect = {  //preview reactangle
        x: 0, 
        y: 0, 
        width: this.platform.width(), 
        height: this.platform.height()
      };
 
      cordova.plugins.camerapreview.startCamera(cameraRect, "rear", tapEnabled, dragEnabled, toBack);
      this.StartLocatingBeacon();
    }
    catch (e) {
      console.log("ionViewLoaded Error: "+e);
    } 
  }
// -- GAME LOGIC --
randomIdle() {
console.log("Hello");
}
 /*  ================================================================  */
 /*                           GAME FUNCTIONS                           */
 /*  ================================================================  */

//Start capturing the Active Ghost when a Long Press is detected
startCapture() {
  if(this.activeGhost.isAlive) {
    this.activeGhost.captureMode.isCapturing = true;
    this.isCaptureEffect = true;
    let loop = setInterval(() => {
      if(this.activeGhost.captureMode.isCapturing) {
        this.activeGhost.captureMode.capturePoint++;
        //console.log("Capture Points: " +this.activeGhost.captureMode.capturePoint);
        if (this.activeGhost.captureMode.capturePoint > this.GHOST_MAX_CAPTURE_POINT) {
         // this.activeGhost.captureMode.capturePoint = 0;
          this.activeGhost.captureMode.isCapturing = false;
          clearInterval(loop);
          this.captureGhost();
          //this.alertMessages = "iniciando captura";
          
        }
      } else {
        clearInterval(loop);
        this.activeGhost.captureMode.capturePoint = 0;
        this.isCaptureEffect = false;
      }
    },1000);
  }
}

//Ends the current capturing process when the button is no longer being pressed
endCapture() {
  if(this.activeGhost.captureMode.isCapturing)
    this.activeGhost.captureMode.isCapturing = false;
  
  this.isCaptureEffect = false;
}

captureGhost() {
  this.activeGhost.captureMode.capturePoint = 0;  
  //this.ghostIndex = this.ghostBeacons.indexOf(this.activeGhost.id);
  this.ghostIndex = this.GHOST_B;

  if (this.activeGhost.id == this.GHOST_A)
    this.ghostBeacons.splice(0,1);
  else if(this.activeGhost.id == this.GHOST_B)
    this.ghostBeacons.splice(1,1);
  else if(this.activeGhost.id == this.GHOST_C)
    this.ghostBeacons.splice(2,1);
  else if(this.activeGhost.id == this.GHOST_D)
    this.ghostBeacons.splice(3,1);
  else if(this.activeGhost.id == this.GHOST_E)
    this.ghostBeacons.splice(4,1);
  else {
    this.ghostIndex = 999;
  }

    this.despawnGhost();
    this.gameScore();
  /*if (this.ghostIndex != -1) {
    this.alertMessages = "CAPTUREI 2";
    this.ghostBeacons.splice(this.ghostIndex,1);
    this.despawnGhost();
    this.gameScore();
 } */
}

//To-Do: Make Player Scoring
gameScore() {
  this.gameService.captureBeacon(this.activeGhost.id, (data) => {
    if (data)
      this.playerScore++;
     else 
      this.playerScore = -1;
  });
  
}

 /*  ================================================================  */
 /*                           GHOST FUNCTIONS                          */
 /*  ================================================================  */

//Start the process of spawning
//To-Do: create visual effects and messages about the spawning ghost
startSpawn() {
  setTimeout(() => {
    this.spawnGhost();
  },5000);
}

//To-Do: Better 'walking' AI
//Spawns a Ghost (<div>) and calls ghostAI() 
spawnGhost() {
  this.activeGhost.id = this.beaconNear.minor;
  //this.activeGhost.id = this.GHOST_B; //Dummy debug id 
  this.activeGhost.isAlive = true;
  this.activeGhost.posX = Math.round(Math.random()*200);
  this.activeGhost.posY = Math.round(Math.random()*300);
  this.activeGhost.view.hidden = false;
//1478479249365
//1478479262163
  this.ghostAI();
}

//Generates an object with random positions then calls randomWalk() passing the Object
ghostAI() {
   this.activeGhost.moveAI = setInterval(() => {
     if (this.canMove) {
        this.canMove = false;
       // this.moving = true;
        let l = Math.round(Math.random()*30);
        let r = Math.round(Math.random()*30);
        let u = Math.round(Math.random()*30);
        let d = Math.round(Math.random()*30);

      let rngWalk = {left:l, right:r, up:u,down:d}
      this.randomWalk(rngWalk);
     }
    },500);
    
   // this.randomWalk({left:0,right:50,up:0,down:0});
}

//Gets the Object with the positions and for each
//position calls moveGhost() and pass the current direction
randomWalk(walk) {
 let directions = ["L", "R", "U", "D"];
 let ghostDirections = [];
  
  while (directions.length) {
	  var x = Math.round(Math.random()*(directions.length-1));
	  ghostDirections.push(directions[x]);
	  directions.splice(x,1);
  }

  let len = ghostDirections.length;
  for (let i = 0; i < len; i++) {
    switch(ghostDirections[i]) {
      case 'L':
        this.moveGhost('L',walk.left);
      break;
      case 'R':
        this.moveGhost('R',walk.right);
      break;
      case 'U':
        this.moveGhost('U',walk.up);
      break;
      case 'D':
        this.moveGhost('D',walk.down);
      break;
      default:
        this.moveGhost('C',0); //center
    }
  }
  this.canMove = true;
}

//Moves the Ghost based on a direction
moveGhost(dir,steps) {
  let loop = setInterval(() => {
    this.zone.run(() => {
      switch (dir) {
        case 'L':
          if (this.activeGhost.posX-this.activeGhost.step >= 10) {
            this.activeGhost.posX -= this.activeGhost.step;
          }
          break;
        case 'R':
          if (this.activeGhost.posX+this.activeGhost.step < 150) { //this.platform.width()-90)
            this.activeGhost.posX += this.activeGhost.step;
          }
          break;
        case 'U':
          if (this.activeGhost.posY-this.activeGhost.step >= 10) {
            this.activeGhost.posY -= this.activeGhost.step;
          }
          break;
        case 'D':
          if (this.activeGhost.posY+this.activeGhost.step < 200) {//this.platform.height()-150)
            this.activeGhost.posY += this.activeGhost.step;
          }
          break;
      }
      //console.log("posX: "+this.posX);
      steps--;
      if (steps <= 0) {
        clearInterval(loop);
      }   
    });
  },100);
  
}

despawnGhost() {
  this.activeGhost.isAlive = false;
  this.activeGhost.view.hidden = true;
  clearInterval(this.activeGhost.moveAI);
  this.canSpawn = true;
}

 /*  ================================================================  */
 /*                           BEACON FUNCTIONS                         */
 /*  ================================================================  */

//Function: Process a Beacon List
//To-Do: Better distance calculation (Not rely on beacon.accuracy)
//To-Do: Create effects and messages about the Beacons getting near
  processBeacon(beacon:Array<any>) {
    let NEAR_VALUE =          5;
    let INTERMEDIATE_VALUE =  7;
    let FAR_VALUE =           10;
    let len = beacon.length;
    /*
    let menor = 9999;
    let gemMIN;*/

    let beaconNear = null;
    let beaconIntermediate = beacon[0];
    let beaconFar = beacon[0];
    let hasFoundNear = false;
    let hasFoundIntermediate = false;
    let hasFoundFar = false;
    
    for(let i = 0; i < len; i++) {
      if(beacon[i].accuracy <= NEAR_VALUE) {
        if(beaconNear != null) {
          if(beaconNear.accuracy > beacon[i].accuracy) {
             beaconNear = beacon[i];
             hasFoundNear = true;
          }
        } else {
          beaconNear = beacon[i];
          hasFoundNear = true;
        }
         
       

      } else if (beacon[i].accuracy > NEAR_VALUE && beacon[i].accuracy <= INTERMEDIATE_VALUE) {
          if (beaconIntermediate.accuracy > beacon[i].accuracy) {
            beaconIntermediate = beacon[i];
            hasFoundIntermediate = true;
          }
      } else if (beacon[i].accuracy > INTERMEDIATE_VALUE && beacon[i].accuracy <= FAR_VALUE) {
          if (beaconFar.accuracy > beacon[i].accuracy) {
            beaconFar = beacon[i];
            hasFoundFar = true;
          }
      }
    }

    //If a Beacon is in the "Near State" the Ghost can be spawned
    this.debugList.push({id:"processHasFoundNear",content:hasFoundNear});
    if(hasFoundNear) {
      if (this.beaconNear !== beaconNear) { //{uuid,minor,major,accuracy,rx}
        this.beaconNear = beaconNear;
        this.canSpawn = false;
        this.startSpawn();
        this.alertMessages = "Algo está próximo !!!";
        setTimeout(() => {
          this.alertMessages = null;
        },3000);
      }
    }
    
    if(hasFoundIntermediate) {
      if(this.beaconIntermediate !== beaconIntermediate)
        this.beaconIntermediate = beaconIntermediate;
    }

    if(hasFoundNear) {
      if(this.beaconFar !== beaconFar)
        this.beaconFar = beaconFar;
    }
   /* if (menor === 9999) {
      this.zone.run(() =>{
        this.beaconInRange = 0;
        this.gemText = "";
        this.beaconFoundText = "";
      });

    } else {
        this.setActiveGem(gemMIN);
    }*/
  }



//Start Ranging Beacons
StartLocatingBeacon () {
  let beaconRegion;
  let uuid = '003e8c80-ea01-4ebb-b888-78da19df9e55';
  let id = 'Beacon';

  let delegate = IBeacon.Delegate();

//Every X seconds, didRangeBeaconsInRegion returns with an array of beacons
//subscribe(function(data),function(error))
delegate.didRangeBeaconsInRegion()
    .subscribe(
      data => {
          //Called even without a beacon
          if(this.canSpawn) {
             this.debugList.push({id:"canSpawn",content:this.canSpawn});
            if (data.beacons.length > 0) {
              this.debugList.push({id:"beacons > 0",content:data.beacons});
              this.processBeacon(data.beacons);
            } else {
              this.debugList.push({id:"len < 0",content:data.beacons.length});
              if (this.beaconNear) this.beaconNear = null;
              if (this.beaconIntermediate) this.beaconIntermediate = null;
              if (this.beaconFar) this.beaconFar = null;
            }
          }
        },
        error => console.log("Error didRangeBeaconsinRegion: "+error) /* Handle Error */
    );
/*
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
    );*/

    //IBeacon.BeaconRegion(ident:string, uuid:string, major?:number, minor?:number): Region   
    beaconRegion = IBeacon.BeaconRegion(id,uuid);



/*  IBeacon.startMonitoringForRegion(rg)
    .then(
      () => console.log('Native layer recieved the request to monitoring'),
      error => this.regionerror = "Error: "+error
    );*/
    IBeacon.startRangingBeaconsInRegion(beaconRegion)
      .then(
        () => {
          this.debugList.push({id:"startRanging",content:"Ok!"});
          this.debugCount = 1;
        },
        error => this.debugList.push({id:"startRangingError", content:error}) 
      );
  }
  debug() {
    this.canShowDebug = !this.canShowDebug;
    this.debugList = [];
  }

}
 /* ionViewDidEnter() { 3
    console.log("ViewDidEnter");
  }
  ionViewWillEnter() { 2
    console.log("ViewWillEnter");
  }*/


//nativeElement
//http://www.w3schools.com/jsref/dom_obj_style.asp
//http://www.w3schools.com/jsref/