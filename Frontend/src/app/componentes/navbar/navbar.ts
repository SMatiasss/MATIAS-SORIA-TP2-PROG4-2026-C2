import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { Avatar } from '../avatar/avatar';

@Component({
  imports: [RouterLink, RouterLinkActive, Avatar],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  auth = inject(Auth);
}
