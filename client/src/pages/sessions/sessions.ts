import { Component, OnInit } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { SessionService } from "../../services/sessions.service";
import { Session } from "../../shared/types/Session";
import { SessionCard } from "../../components/session-card/session-card";
import { CreateSessionDialog } from "../../components/create-session-dialog/create-session-dialog";

@Component({
  selector: 'sessions-page',
  imports: [
    ButtonModule,
    SessionCard,
    CreateSessionDialog
],
  providers: [],
  templateUrl: './sessions.html',
})
export class SessionsPage implements OnInit {
  openCreateDialog: boolean = false;
  sessions: Session[] = [];

  constructor(
    private sessionService: SessionService,
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
      }
    })
  }
}