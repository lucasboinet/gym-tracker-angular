import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CreateSessionDialog } from '../../components/create-session-dialog/create-session-dialog';
import { SessionCard } from '../../components/session-card/session-card';
import { SessionService } from '../../services/sessions.service';

@Component({
  selector: 'sessions-page',
  imports: [ButtonModule, SessionCard, CreateSessionDialog],
  providers: [],
  templateUrl: './sessions.html',
})
export class SessionsPage implements OnInit {
  openCreateDialog = false;

  sessionService = inject(SessionService);

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions().subscribe({
      next: (sessions) => {
        this.sessionService.sessions.set(sessions);
      },
    });
  }
}
