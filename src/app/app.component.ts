import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

import { Plugins } from '@capacitor/core';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  onLogout(){
    this.authService.login();
    this.router.navigateByUrl('/auth');
  }
}
