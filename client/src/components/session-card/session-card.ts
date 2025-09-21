import { Component, input, Input } from "@angular/core";
import { Session } from "../../shared/types/Session";

@Component({
  templateUrl: './session-card.html',
  selector: 'session-card',
  imports: [],
})
export class SessionCard {
  session = input.required<Session>();
}