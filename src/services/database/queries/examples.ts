import { Example, ExampleTypes } from '../../../models/Example';
import { getClient } from '../client';

export const insertExample = async (
  name: string,
  type: ExampleTypes,
  createdBy: number,
): Promise<Example> => {
  const client = await getClient();

  try {
    const dateNow = new Date();
    const insertQuery = `
      INSERT INTO examples 
          (name, type, created_by)
      VALUES
          ($1, $2, $3)
      RETURNING id
    `;
    const row = (
      await client.query(insertQuery, [
        name,
        type,
        createdBy,
      ])
    ).rows[0];

    return {
      id: row.id,
      name,
      type,
      createdBy,
    } as Example;
  } catch (e) {
    console.error(`Error inserting mission`, e);
    throw e;
  } finally {
    client.release();
  }
};

export const getPopularGoals = async (
): Promise<Example[]> => {
  const client = await getClient();

  try {
    const selectQuery = `
        SELECT *
        FROM examples
      `;
    const result = await client.query(selectQuery);

    return result.rows.map((row: any) => {
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        createdBy: row.created_by
      };
    });
  } catch (e) {
    console.error(`Error fetching popular goals`, e);
    throw e;
  } finally {
    client.release();
  }
};