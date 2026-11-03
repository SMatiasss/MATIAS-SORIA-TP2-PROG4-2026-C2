import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './componentes/navbar/navbar';
import { Modal } from './componentes/modal/modal';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Modal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  auth = inject(Auth);
}
