import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SessionCard } from '../../components/session-card/session-card';
import { SessionDialog } from '../../components/session-dialog/session-dialog';
import { SessionService } from '../../services/sessions.service';

@Component({
  selector: 'sessions-page',
  imports: [ButtonModule, SessionCard, SessionDialog],
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
