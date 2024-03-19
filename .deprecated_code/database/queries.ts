import type { QueryResultRow } from 'pg';
import type { ChatThread, SessionLog } from '../../types/types';
import { getClient } from './client';

// here we are
export const getOpenSessionWithThreads = async (phoneNumber: string): Promise<SessionLog> => {
  const Client = await getClient();
  const query = `
        SELECT s.id AS session_id, s.start_datetime, t.id AS thread_id, t.closed, t.messages, t.gpt_config, t.meta_main_message_entry_id
        FROM users u
        JOIN session_logs s ON u.id = s.user_id
        LEFT JOIN threads t ON s.id = t.session_id
        WHERE u.whats_number = $1 AND s.end_datetime IS NULL;
    `;
  const session = {} as SessionLog;
  try {
    const { rows } = await Client.query(query, [phoneNumber]);
    if (!rows[0]) {
      return session;
    }
    rows.forEach((row: QueryResultRow) => {
      if (!session.dbID) {
        session.dbID = row.session_id;
        session.sessionStartTime = row.start_datetime;
      }
      if (!row.meta_starting_message_id) {
        session.mainThread = {
          dbID: row.thread_id,
          gptConfig: row.gpt_config,
          metaMainMessageEntryID: null,
          messages: row.messages,
          closed: row.closed,
        } as ChatThread;
      } else {
        session.metaThreads.push({
          dbID: row.thread_id,
          gptConfig: row.gpt_config,
          metaMainMessageEntryID: row.meta_starting_message_id,
          messages: row.messages,
          closed: row.closed,
        } as ChatThread);
      }
    });
    return session;
  } catch (e) {
    console.error('Error executing query: ', e);
    throw new Error(`Failed to retrieve open session: ${e}`);
  }
};

export const updateMainThread = async (session: SessionLog): Promise<void> => {
  const newMessages = session.mainThread.messages;
  const threadID = session.mainThread.dbID;
  const Client = await getClient();
  const query = `
        UPDATE threads
        SET messages = $1
        WHERE id = $3
    `;
  try {
    const result = await Client.query(query, [newMessages, threadID]);
    if (result.rowCount <= 0) {
      throw new Error('no rows updated');
    }
  } catch (e) {
    console.error(`Error updating thread of id ${threadID}: `, e);
    throw e;
  } finally {
    Client.release();
  }
};

export const updateMetaThread = async (session: SessionLog): Promise<void> => {
  const metaThread = session.metaThreads[session.metaThreads.length - 1];
  const newMessages = metaThread.messages;
  const threadID = metaThread.dbID;
  const Client = await getClient();
  const query = `
        UPDATE threads
        SET messages = $1
        WHERE id = $3
    `;
  try {
    const result = await Client.query(query, [newMessages, threadID]);
    if (result.rowCount <= 0) {
      throw new Error('no rows updated');
    }
  } catch (e) {
    console.error(`Error updating thread of id ${threadID}: `, e);
    throw e;
  } finally {
    Client.release();
  }
};

export const closeThread = async (threadID: number): Promise<void> => {
  const Client = await getClient();
  const query = `
        UPDATE threads
        SET closed = true
        WHERE id = $1
    `;
  try {
    const result = await Client.query(query, [threadID]);
    if (result.rowCount <= 0) {
      throw new Error('no rows updated');
    }
  } catch (e) {
    console.error(`Error closing thread of id ${threadID}: `, e);
    throw e;
  } finally {
    Client.release();
  }
};

export const createNewSession = async (userID: number): Promise<SessionLog> => {
  const Client = await getClient();
  const query = `
          INSERT INTO session_logs
              (user_id)
          VALUES
              ($1)
          RETURNING id, start_datetime
      `;
  try {
    const row = (await Client.query(query, [userID])).rows[0];
    const session = { dbID: row.id, sessionStartTime: row.start_datetime } as SessionLog;
    return session;
  } catch (e) {
    console.error('Error inserting session: ', e);
    throw e;
  } finally {
    Client.release();
  }
};

export const createNewThread = async (
  userID: number,
  sessionID: number,
  isMeta: boolean,
  messages: MessageInstance[],
): Promise<ChatThread> => {
  const Client = await getClient();
  const query = `
          INSERT INTO threads
              (user_id, session_id, meta_main_message_entry_id, messages, gpt_config)
          VALUES
              ($1, $2, $3, $4, $5)
          RETURNING id
      `;
  try {
    const metaEntry = isMeta ? -1 : null;
    const config = isMeta ? MetaConfig : MainConfig;
    const row = (await Client.query(query, [userID, sessionID, metaEntry, messages, config]))
      .rows[0];
    const thread = {
      dbID: row.id,
      metaMainMessageEntryID: metaEntry,
      gptConfig: config,
      messages: messages,
      closed: false,
    } as ChatThread;
    return thread;
  } catch (e) {
    console.error('Error inserting thread: ', e);
    throw e;
  } finally {
    Client.release();
  }
};
