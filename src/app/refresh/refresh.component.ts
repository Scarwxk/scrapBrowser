import { Component } from '@angular/core';
import { BrowserService } from '../services/browser.service';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-refresh',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './refresh.component.html',
  styleUrl: './refresh.component.css'
})
export class RefreshComponent {
  constructor(
    public browserService :BrowserService
  ) {

  }
}