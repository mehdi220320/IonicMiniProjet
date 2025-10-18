import {Component, inject, OnInit} from '@angular/core';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.page.html',
  styleUrls: ['./list-users.page.scss'],
  standalone:true
})
export class ListUsersPage implements OnInit {
  // userService=inject()

  ngOnInit() {
  }

}
