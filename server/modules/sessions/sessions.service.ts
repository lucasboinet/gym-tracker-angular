import SessionModel from "./sessions.model";
import { Session } from "./sessions.types";

export function getAllFromUser(userId: string) {
  return SessionModel.find({ userId });
}

export function create(session: Session) {
  return new SessionModel(session).save()
}

export function updateOneById(sessionId: string, data: Partial<Session>) {
  return SessionModel.findOneAndUpdate(
    { _id: sessionId }, 
    { $set: { ...data } }, 
    { new: true, runValidators: true }
  )
}

export function deleteOneById(sessionId: string) {
  return SessionModel.deleteOne({ _id: sessionId })
}