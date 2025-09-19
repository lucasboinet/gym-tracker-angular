import { Component, OnInit } from "@angular/core";
import { MenuBar } from "../../components/menu/menu";

@Component({
  selector: 'sessions-page',
  imports: [
    MenuBar,
  ],
  providers: [],
  templateUrl: './sessions.html',
})
export class SessionsPage implements OnInit {

  ngOnInit(): void {
    
  }
}