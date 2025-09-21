import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CreateSessionDialog } from '../../components/create-session-dialog/create-session-dialog';
import { SessionCard } from '../../components/session-card/session-card';
import { SessionService } from '../../services/sessions.service';
import { Session } from '../../shared/types/Session';

@Component({
  selector: 'sessions-page',
  imports: [ButtonModule, SessionCard, CreateSessionDialog],
  providers: [],
  templateUrl: './sessions.html',
})
export class SessionsPage implements OnInit {
  openCreateDialog = false;
  sessions: Session[] = [];

  sessionService = inject(SessionService);

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
      },
    });
  }
}
